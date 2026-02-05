/**
 * 百度网盘备份管理器
 * 基于百度网盘开放平台API实现备份功能
 */

interface BaiduNetdiskConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
  basePath?: string;
  debug?: boolean;
}

interface BaiduNetdiskFile {
  fs_id: string;
  path: string;
  size: number;
  md5: string;
  mtime: number;
  ctime: number;
  type: number; // 0: 文件, 1: 目录
}

interface BaiduNetdiskResponse<T = any> {
  error?: number;
  error_msg?: string;
  data?: T;
}

class BaiduNetdiskBackupManager {
  private config: Required<BaiduNetdiskConfig>;
  private accessTokenExpiry: number | null = null;

  constructor(config: BaiduNetdiskConfig) {
    this.config = {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
      accessToken: config.accessToken || '',
      refreshToken: config.refreshToken || '',
      basePath: config.basePath || '/人生游戏管理系统',
      debug: config.debug || false
    };
  }

  /**
   * 初始化百度网盘备份管理器
   */
  async initialize(): Promise<void> {
    console.log('百度网盘备份客户端已初始化');
    
    // 检查accessToken是否存在
    if (!this.config.accessToken) {
      console.warn('百度网盘accessToken未配置，请先获取授权');
    } else {
      // 测试连接
      const isConnected = await this.testConnection();
      if (!isConnected) {
        console.warn('百度网盘连接测试失败，可能需要重新授权');
      }
    }
  }

  /**
   * 生成授权链接
   */
  generateAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: 'basic,netdisk',
      display: 'page'
    });
    return `https://pan.baidu.com/oauth/2.0/authorize?${params.toString()}`;
  }

  /**
   * 使用授权码获取access_token
   */
  async getAccessToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri
    });

    const response = await fetch('https://pan.baidu.com/oauth/2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`获取access_token失败: ${data.error_msg}`);
    }

    // 更新配置
    this.config.accessToken = data.access_token;
    this.config.refreshToken = data.refresh_token;
    this.accessTokenExpiry = Date.now() + (data.expires_in * 1000);

    return data;
  }

  /**
   * 刷新access_token
   */
  async refreshAccessToken(): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    if (!this.config.refreshToken) {
      throw new Error('refreshToken未配置');
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.config.refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    });

    const response = await fetch('https://pan.baidu.com/oauth/2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`刷新access_token失败: ${data.error_msg}`);
    }

    // 更新配置
    this.config.accessToken = data.access_token;
    this.accessTokenExpiry = Date.now() + (data.expires_in * 1000);

    return data;
  }

  /**
   * 确保accessToken有效
   */
  private async ensureValidAccessToken(): Promise<void> {
    if (!this.config.accessToken) {
      throw new Error('accessToken未配置');
    }

    // 检查accessToken是否即将过期（5分钟内）
    if (this.accessTokenExpiry && this.accessTokenExpiry - Date.now() < 5 * 60 * 1000) {
      console.log('accessToken即将过期，正在刷新...');
      await this.refreshAccessToken();
    }
  }

  /**
   * 发送API请求
   */
  private async sendRequest<T>(endpoint: string, method: string = 'GET', data?: any): Promise<BaiduNetdiskResponse<T>> {
    await this.ensureValidAccessToken();

    const url = `https://pan.baidu.com/rest/2.0/xpan${endpoint}?access_token=${this.config.accessToken}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (this.config.debug) {
        console.log(`API响应 (${endpoint}):`, result);
      }

      return result;
    } catch (error) {
      console.error(`API请求失败 (${endpoint}):`, error);
      return {
        error: 500,
        error_msg: (error as Error).message
      };
    }
  }

  /**
   * 创建目录
   */
  async createDirectory(path: string): Promise<boolean> {
    const result = await this.sendRequest<{ path: string }>('/file', 'POST', {
      method: 'mkdir',
      path: path,
      autoinit: 1
    });

    return !result.error;
  }

  /**
   * 上传文件
   */
  async uploadFile(remotePath: string, content: string): Promise<boolean> {
    // 首先创建父目录
    const dirPath = remotePath.substring(0, remotePath.lastIndexOf('/'));
    if (dirPath !== '/') {
      await this.createDirectory(dirPath);
    }

    // 计算文件大小
    const fileSize = new Blob([content]).size;
    
    // 百度网盘API要求先获取上传地址
    const precreateResult = await this.sendRequest<{
      uploadid: string;
      path: string;
      return_type: number;
    }>('/file', 'POST', {
      method: 'precreate',
      path: remotePath,
      size: fileSize,
      isdir: 0,
      autoinit: 1,
      rtype: 1
    });

    if (precreateResult.error) {
      console.error('文件预创建失败:', precreateResult.error_msg);
      return false;
    }

    // 上传文件内容
    const uploadUrl = `https://d.pcs.baidu.com/rest/2.0/pcs/file?method=upload&access_token=${this.config.accessToken}&path=${encodeURIComponent(remotePath)}&uploadid=${precreateResult.data?.uploadid}&partseq=0`;

    try {
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: content
      });

      const uploadResult = await uploadResponse.json();
      
      if (this.config.debug) {
        console.log('上传响应:', uploadResult);
      }

      return !uploadResult.error;
    } catch (error) {
      console.error('文件上传失败:', error);
      return false;
    }
  }

  /**
   * 下载文件
   */
  async downloadFile(remotePath: string): Promise<string | null> {
    await this.ensureValidAccessToken();

    const url = `https://d.pcs.baidu.com/rest/2.0/pcs/file?method=download&access_token=${this.config.accessToken}&path=${encodeURIComponent(remotePath)}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('文件下载失败:', response.statusText);
        return null;
      }

      const content = await response.text();
      return content;
    } catch (error) {
      console.error('文件下载失败:', error);
      return null;
    }
  }

  /**
   * 列出目录
   */
  async listDirectory(path: string): Promise<BaiduNetdiskFile[]> {
    const result = await this.sendRequest<{
      list: BaiduNetdiskFile[];
    }>('/file', 'POST', {
      method: 'list',
      path: path,
      web: 1,
      page: 1,
      num: 1000,
      order: 'name',
      desc: 0
    });

    if (result.error) {
      console.error('列出目录失败:', result.error_msg);
      return [];
    }

    return result.data?.list || [];
  }

  /**
   * 删除文件
   */
  async deleteFile(path: string): Promise<boolean> {
    const result = await this.sendRequest<{ paths: string[] }>('/file', 'POST', {
      method: 'delete',
      filelist: JSON.stringify([path])
    });

    return !result.error;
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.ensureValidAccessToken();
      
      // 尝试获取用户信息
      const result = await this.sendRequest('/user', 'GET');
      return !result.error;
    } catch (error) {
      console.error('连接测试失败:', error);
      return false;
    }
  }

  /**
   * 上传备份
   */
  async uploadBackup(backupId: string, backupData: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `${this.config.basePath}/backup_${timestamp}`;
    
    // 创建备份目录
    const dirCreated = await this.createDirectory(backupDir);
    if (!dirCreated) {
      throw new Error('创建备份目录失败');
    }
    
    // 准备备份数据
    const dataToBackup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: backupData
    };
    
    // 上传备份数据
    const backupFilePath = `${backupDir}/${backupId}.json`;
    const jsonContent = JSON.stringify(dataToBackup, null, 2);
    
    const uploaded = await this.uploadFile(backupFilePath, jsonContent);
    
    if (!uploaded) {
      throw new Error('上传备份失败');
    }
  }

  /**
   * 下载备份
   */
  async downloadBackup(backupId: string): Promise<string | null> {
    // 列出备份目录以找到特定备份
    const files = await this.listDirectory(this.config.basePath);
    
    // 查找匹配的备份目录
    const backupDirs = files.filter(file => file.type === 1 && file.path.includes('backup_'));
    
    if (backupDirs.length === 0) {
      console.log('未找到备份目录');
      return null;
    }

    // 按时间倒序排序，查找包含指定备份ID的文件
    backupDirs.sort((a, b) => b.mtime - a.mtime);
    
    for (const dir of backupDirs) {
      const dirFiles = await this.listDirectory(dir.path);
      const backupFile = dirFiles.find(file => 
        file.type === 0 && file.path.includes(backupId) && file.path.endsWith('.json')
      );
      
      if (backupFile) {
        // 下载备份文件
        const content = await this.downloadFile(backupFile.path);
        if (content) {
          try {
            const backupData = JSON.parse(content);
            return backupData.data || content;
          } catch (parseError) {
            console.error('解析备份数据失败:', parseError);
            return content;
          }
        }
      }
    }

    console.log(`未找到备份: ${backupId}`);
    return null;
  }

  /**
   * 删除备份
   */
  async deleteBackup(backupId: string): Promise<void> {
    // 列出备份目录以找到特定备份
    const files = await this.listDirectory(this.config.basePath);
    
    // 查找匹配的备份目录
    const backupDirs = files.filter(file => file.type === 1 && file.path.includes('backup_'));
    
    for (const dir of backupDirs) {
      const dirFiles = await this.listDirectory(dir.path);
      const backupFile = dirFiles.find(file => 
        file.type === 0 && file.path.includes(backupId) && file.path.endsWith('.json')
      );
      
      if (backupFile) {
        // 删除备份文件
        await this.deleteFile(backupFile.path);
        console.log(`备份文件已删除: ${backupFile.path}`);
        
        // 检查目录是否为空，如果为空则删除目录
        const remainingFiles = await this.listDirectory(dir.path);
        if (remainingFiles.length === 0) {
          await this.deleteFile(dir.path);
          console.log(`备份目录已删除: ${dir.path}`);
        }
        
        return;
      }
    }

    console.log(`未找到要删除的备份: ${backupId}`);
  }

  /**
   * 获取备份列表
   */
  async getBackupList(): Promise<Array<{ id: string; timestamp: Date; size: number }>> {
    const files = await this.listDirectory(this.config.basePath);
    const backupDirs = files.filter(file => file.type === 1 && file.path.includes('backup_'));
    
    const backups: Array<{ id: string; timestamp: Date; size: number }> = [];
    
    for (const dir of backupDirs) {
      const dirFiles = await this.listDirectory(dir.path);
      for (const file of dirFiles) {
        if (file.type === 0 && file.path.endsWith('.json')) {
          const id = file.path.substring(file.path.lastIndexOf('/') + 1, file.path.lastIndexOf('.'));
          backups.push({
            id,
            timestamp: new Date(file.mtime * 1000),
            size: file.size
          });
        }
      }
    }
    
    // 按时间倒序排列
    backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return backups;
  }

  /**
   * 获取配置信息
   */
  getConfig(): BaiduNetdiskConfig {
    return {
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      redirectUri: this.config.redirectUri,
      accessToken: this.config.accessToken,
      refreshToken: this.config.refreshToken,
      basePath: this.config.basePath,
      debug: this.config.debug
    };
  }

  /**
   * 更新配置信息
   */
  updateConfig(config: Partial<BaiduNetdiskConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }
}

export default BaiduNetdiskBackupManager;
export type { BaiduNetdiskConfig, BaiduNetdiskFile };