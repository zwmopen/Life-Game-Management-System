import WebDAVBackup from './WebDAVBackup';

interface WebDAVConfig {
  serverUrl?: string;
  username?: string;
  password?: string;
  basePath?: string;
  debug?: boolean;
}

class WebDAVBackupWrapper {
  private webDAVClient: WebDAVBackup;

  constructor(config?: WebDAVConfig) {
    this.webDAVClient = new WebDAVBackup({
      serverUrl: config?.serverUrl,
      username: config?.username,
      password: config?.password,
      basePath: config?.basePath || '/',
      debug: config?.debug || false
    });
  }

  async initialize(): Promise<void> {
    // WebDAVBackup在构造时已经初始化，这里可以添加额外的初始化逻辑
    console.log('WebDAV备份客户端已初始化');
  }

  async uploadBackup(backupId: string, backupData: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `/人生游戏管理系统/backup_${timestamp}`;
    
    // 创建备份目录
    await this.webDAVClient.createDirectory(backupDir);
    
    // 准备备份数据
    const dataToBackup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: backupData
    };
    
    // 上传备份数据
    const backupFilePath = `${backupDir}/${backupId}.json`;
    const jsonContent = JSON.stringify(dataToBackup, null, 2);
    
    const result = await this.webDAVClient.uploadFile(backupFilePath, jsonContent);
    
    if (!result.success) {
      throw new Error(`上传备份失败: ${result.message}`);
    }
  }

  async downloadBackup(backupId: string): Promise<string | null> {
    // 需要先列出备份目录以找到特定备份
    const listResult = await this.webDAVClient.listDirectory('/人生游戏管理系统');
    
    if (!listResult.success) {
      throw new Error(`无法列出备份目录: ${listResult.message}`);
    }

    // 查找匹配的备份文件
    const backupItems = listResult.items.filter((item: any) => 
      item.name.includes(backupId) && item.type === 'file'
    );

    if (backupItems.length === 0) {
      console.log(`未找到备份: ${backupId}`);
      return null;
    }

    // 获取最新的备份文件
    const latestBackup = backupItems.reduce((latest: any, current: any) => 
      current.path > latest.path ? current : latest
    );

    const result = await this.webDAVClient.downloadFile(latestBackup.path);
    
    if (result.success) {
      try {
        const backupData = JSON.parse(result.content);
        return backupData.data || result.content;
      } catch (parseError) {
        console.error('解析备份数据失败:', parseError);
        return result.content;
      }
    } else {
      throw new Error(`下载备份失败: ${result.message}`);
    }
  }

  async deleteBackup(backupId: string): Promise<void> {
    // 需要先列出备份目录以找到特定备份
    const listResult = await this.webDAVClient.listDirectory('/人生游戏管理系统');
    
    if (!listResult.success) {
      throw new Error(`无法列出备份目录: ${listResult.message}`);
    }

    // 查找匹配的备份文件
    const backupItems = listResult.items.filter((item: any) => 
      item.name.includes(backupId) && item.type === 'file'
    );

    if (backupItems.length === 0) {
      console.log(`未找到要删除的备份: ${backupId}`);
      return;
    }

    // 删除找到的备份文件
    for (const item of backupItems) {
      // WebDAV没有直接的删除方法，需要使用sendRequest方法
      const response = await this.webDAVClient.sendRequest('DELETE', item.path);
      if (!response.ok) {
        console.error(`删除备份文件失败: ${item.path}`, response.statusText);
      } else {
        console.log(`备份文件已删除: ${item.path}`);
      }
    }
  }

  async testConnection(): Promise<boolean> {
    const result = await this.webDAVClient.testConnection();
    return result.success;
  }

  // 代理其他方法
  createDirectory(path: string) {
    return this.webDAVClient.createDirectory(path);
  }

  uploadFile(filePath: string, fileContent: string) {
    return this.webDAVClient.uploadFile(filePath, fileContent);
  }

  downloadFile(filePath: string) {
    return this.webDAVClient.downloadFile(filePath);
  }

  listDirectory(path?: string) {
    return this.webDAVClient.listDirectory(path || '/');
  }

  backupAppData(dataToBackup: any) {
    return this.webDAVClient.backupAppData(dataToBackup);
  }

  restoreFromWebDAV(backupPath: string) {
    return this.webDAVClient.restoreFromWebDAV(backupPath);
  }
}

export default WebDAVBackupWrapper;
