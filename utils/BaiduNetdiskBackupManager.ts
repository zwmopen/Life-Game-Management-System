class BaiduNetdiskBackupManager {
  private initialized: boolean = false;
  private accessToken: string | null = null;
  
  // 配置信息
  private config = {
    clientId: "G5tdFv7bUtULL4JsJz6aLBJ98Gf3PTfv",
    redirectUri: "https://zwmopen.github.io/Life-Game-Management-System/callback",
    backupPath: "/人生游戏显化系统备份"
  };
  
  constructor() {
    // 初始化百度网盘客户端
    this.initialize();
  }
  
  /**
   * 初始化百度网盘客户端
   */
  private async initialize() {
    try {
      // 尝试从本地存储获取token
      this.accessToken = localStorage.getItem('bdpan_token');
      
      if (this.accessToken) {
        this.initialized = true;
      }
    } catch (error) {
      console.error('百度网盘客户端初始化失败:', error);
    }
  }
  
  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.accessToken) {
        return false;
      }
      
      // 调用百度网盘API测试连接
      const response = await fetch(`https://pan.baidu.com/rest/2.0/pcs/user?method=info&access_token=${this.accessToken}`);
      const data = await response.json();
      
      return !data.error_code;
    } catch (error) {
      console.error('百度网盘连接测试失败:', error);
      return false;
    }
  }
  
  /**
   * 上传备份
   */
  async uploadBackup(backupId: string, backupData: string, onProgress?: (progress: any) => void): Promise<void> {
    try {
      if (!this.accessToken) {
        throw new Error('百度网盘未授权');
      }
      
      // 准备备份数据
      const backupInfo = {
        system_name: "人生游戏显化系统",
        backup_time: new Date().toLocaleString(),
        backup_id: backupId,
        data: backupData
      };
      
      const fileName = `备份_${new Date().getTime()}.json`;
      
      if (onProgress) {
        onProgress({
          total: 100,
          completed: 0,
          currentFile: fileName,
          percentage: 0,
          status: 'uploading'
        });
      }
      
      // 1. 创建备份目录
      if (onProgress) {
        onProgress({
          total: 100,
          completed: 20,
          currentFile: fileName,
          percentage: 20,
          status: 'uploading'
        });
      }
      
      const mkdirUrl = `https://d.pcs.baidu.com/rest/2.0/pcs/file?method=mkdir&access_token=${this.accessToken}&path=${encodeURIComponent(this.config.backupPath)}`;
      await fetch(mkdirUrl, { method: "POST" });
      
      // 2. 上传文件
      if (onProgress) {
        onProgress({
          total: 100,
          completed: 50,
          currentFile: fileName,
          percentage: 50,
          status: 'uploading'
        });
      }
      
      const uploadPath = `${this.config.backupPath}/${fileName}`;
      const uploadUrl = `https://d.pcs.baidu.com/rest/2.0/pcs/file?method=upload&access_token=${this.accessToken}&path=${encodeURIComponent(uploadPath)}`;
      
      const formData = new FormData();
      const blob = new Blob([JSON.stringify(backupInfo, null, 2)], { type: "application/json" });
      formData.append("file", blob, fileName);
      
      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });
      
      const json = await res.json();
      if (json.error_code) {
        throw new Error(json.error_msg || "上传失败");
      }
      
      if (onProgress) {
        onProgress({
          total: 100,
          completed: 100,
          currentFile: fileName,
          percentage: 100,
          status: 'completed'
        });
      }
      
      console.log('百度网盘备份上传成功:', backupId);
    } catch (error) {
      console.error('百度网盘备份上传失败:', error);
      throw error;
    }
  }
  
  /**
   * 下载备份
   */
  async downloadBackup(backupId: string): Promise<string | null> {
    try {
      if (!this.accessToken) {
        throw new Error('百度网盘未授权');
      }
      
      // 列出备份目录中的文件
      const listUrl = `https://d.pcs.baidu.com/rest/2.0/pcs/file?method=list&access_token=${this.accessToken}&path=${encodeURIComponent(this.config.backupPath)}&limit=100`;
      const response = await fetch(listUrl);
      const data = await response.json();
      
      if (data.error_code) {
        throw new Error(data.error_msg || "获取文件列表失败");
      }
      
      // 查找匹配的备份文件
      const fileInfo = data.list.find((file: any) => file.path.includes(backupId));
      if (!fileInfo) {
        return null;
      }
      
      // 下载文件
      const downloadUrl = `https://d.pcs.baidu.com/rest/2.0/pcs/file?method=download&access_token=${this.accessToken}&path=${encodeURIComponent(fileInfo.path)}`;
      const downloadResponse = await fetch(downloadUrl);
      const fileContent = await downloadResponse.text();
      
      // 解析备份数据
      const backupInfo = JSON.parse(fileContent);
      return backupInfo.data;
    } catch (error) {
      console.error('百度网盘备份下载失败:', error);
      throw error;
    }
  }
  
  /**
   * 删除备份
   */
  async deleteBackup(backupId: string): Promise<void> {
    try {
      if (!this.accessToken) {
        throw new Error('百度网盘未授权');
      }
      
      // 列出备份目录中的文件
      const listUrl = `https://d.pcs.baidu.com/rest/2.0/pcs/file?method=list&access_token=${this.accessToken}&path=${encodeURIComponent(this.config.backupPath)}&limit=100`;
      const response = await fetch(listUrl);
      const data = await response.json();
      
      if (data.error_code) {
        throw new Error(data.error_msg || "获取文件列表失败");
      }
      
      // 查找匹配的备份文件
      const fileInfo = data.list.find((file: any) => file.path.includes(backupId));
      if (!fileInfo) {
        return;
      }
      
      // 删除文件
      const deleteUrl = `https://d.pcs.baidu.com/rest/2.0/pcs/file?method=delete&access_token=${this.accessToken}&path=${encodeURIComponent(fileInfo.path)}`;
      const deleteResponse = await fetch(deleteUrl, { method: "POST" });
      const deleteData = await deleteResponse.json();
      
      if (deleteData.error_code) {
        throw new Error(deleteData.error_msg || "删除文件失败");
      }
      
      console.log('百度网盘备份删除成功:', backupId);
    } catch (error) {
      console.error('百度网盘备份删除失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取备份列表
   */
  async listBackups(): Promise<Array<{ id: string; timestamp: Date; size: number }>> {
    try {
      if (!this.accessToken) {
        return [];
      }
      
      // 列出备份目录中的文件
      const listUrl = `https://d.pcs.baidu.com/rest/2.0/pcs/file?method=list&access_token=${this.accessToken}&path=${encodeURIComponent(this.config.backupPath)}&limit=100`;
      const response = await fetch(listUrl);
      const data = await response.json();
      
      if (data.error_code) {
        return [];
      }
      
      return data.list
        .filter((file: any) => file.isdir === 0 && file.path.endsWith('.json'))
        .map((file: any) => {
          // 从文件名中提取时间戳
          const timestampMatch = file.path.match(/备份_(\d+)\.json/);
          const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : file.mtime * 1000;
          
          return {
            id: file.path.split('/').pop()?.replace('.json', '') || '',
            timestamp: new Date(timestamp),
            size: file.size
          };
        });
    } catch (error) {
      console.error('获取百度网盘备份列表失败:', error);
      return [];
    }
  }
  
  /**
   * 获取备份统计信息
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    lastBackupDate?: Date;
  }> {
    try {
      const backups = await this.listBackups();
      
      const totalSize = backups.reduce((sum: number, b: any) => sum + b.size, 0);
      const lastBackup = backups.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())[0];
      
      return {
        totalBackups: backups.length,
        totalSize,
        lastBackupDate: lastBackup ? lastBackup.timestamp : undefined
      };
    } catch (error) {
      console.error('获取百度网盘备份统计信息失败:', error);
      return {
        totalBackups: 0,
        totalSize: 0
      };
    }
  }
  
  /**
   * 批量备份
   */
  async batchBackup(backups: Array<{ id: string; data: string }>, options?: { onProgress?: (progress: any) => void }): Promise<{ success: number; failed: string[] }> {
    const success: number[] = [];
    const failed: string[] = [];
    
    for (const backup of backups) {
      try {
        await this.uploadBackup(backup.id, backup.data, options?.onProgress);
        success.push(1);
      } catch (error) {
        failed.push(backup.id);
      }
    }
    
    return {
      success: success.length,
      failed
    };
  }
  
  /**
   * 获取授权URL
   * @returns 百度网盘授权页面的URL
   */
  getAuthorizationUrl(): string {
    // 使用正确的百度开放平台授权地址
    const baseUrl = "https://openapi.baidu.com/oauth/2.0/authorize";
    const clientId = "G5tdFv7bUtULL4JsJz6aLBJ98Gf3PTfv";
    const responseType = "token";
    const scope = "basic,netdisk";
    const display = "page";
    
    // 回调地址（使用GitHub Pages地址）
    const redirectUri = "https://zwmopen.github.io/Life-Game-Management-System/callback";
    const encodedRedirectUri = encodeURIComponent(redirectUri);
    
    // 构建完整的授权URL
    return `${baseUrl}?client_id=${clientId}&response_type=${responseType}&redirect_uri=${encodedRedirectUri}&scope=${scope}&display=${display}`;
  }
  
  /**
   * 检查是否已授权
   * @returns 是否已授权
   */
  isAuthorized(): boolean {
    return !!this.accessToken;
  }
  
  /**
   * 清除授权
   */
  clearAuthorization() {
    this.accessToken = null;
    this.initialized = false;
    
    localStorage.removeItem('bdpan_token');
  }
}

// 创建单例实例
const baiduNetdiskBackupManager = new BaiduNetdiskBackupManager();

export default baiduNetdiskBackupManager;
export { BaiduNetdiskBackupManager };