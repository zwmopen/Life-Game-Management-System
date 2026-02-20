import { BackupProgress } from './EnhancedWebDAVBackupManager';
import WebDAVClient from './webdavClient';

interface SimpleBackupConfig {
  webdavUrl: string;
  webdavUsername: string;
  webdavPassword: string;
}

interface BackupStatus {
  success: boolean;
  message: string;
  error?: string;
}

class SimpleBackupManager {
  private config: SimpleBackupConfig | null = null;
  private webdavClient: WebDAVClient | null = null;

  /**
   * 设置WebDAV配置
   * @param config WebDAV配置
   */
  setConfig(config: SimpleBackupConfig): void {
    this.config = config;
    if (config.webdavUrl && config.webdavUsername && config.webdavPassword) {
      this.webdavClient = new WebDAVClient({
        url: config.webdavUrl,
        username: config.webdavUsername,
        password: config.webdavPassword,
        basePath: '/'
      });
    }
  }

  /**
   * 获取当前配置
   * @returns 当前配置
   */
  getConfig(): SimpleBackupConfig | null {
    return this.config;
  }

  /**
   * 创建本地备份（下载到本地文件）
   * @returns 备份状态
   */
  async createLocalBackup(): Promise<BackupStatus> {
    try {
      // 获取要备份的数据
      const backupData = this.getAllData();
      const backupJson = JSON.stringify(backupData, null, 2);
      
      // 创建备份文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `life-game-backup-${timestamp}.json`;
      
      // 创建并下载文件
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: `备份成功！文件已下载: ${filename}`
      };
    } catch (error) {
      return {
        success: false,
        message: '备份失败',
        error: (error as Error).message
      };
    }
  }

  /**
   * 从本地文件恢复
   * @param file 本地备份文件
   * @returns 恢复状态
   */
  async restoreFromLocalBackup(file: File): Promise<BackupStatus> {
    try {
      // 读取文件内容
      const backupJson = await file.text();
      const backupData = JSON.parse(backupJson);
      
      // 恢复数据
      this.restoreAllData(backupData);
      
      return {
        success: true,
        message: '恢复成功！页面将刷新以加载新数据'
      };
    } catch (error) {
      return {
        success: false,
        message: '恢复失败',
        error: (error as Error).message
      };
    }
  }

  /**
   * 创建WebDAV备份
   * @returns 备份状态
   */
  async createWebDAVBackup(): Promise<BackupStatus> {
    try {
      if (!this.webdavClient) {
        return {
          success: false,
          message: 'WebDAV未配置',
          error: '请先配置WebDAV参数'
        };
      }

      // 获取要备份的数据
      const backupData = this.getAllData();
      const backupJson = JSON.stringify(backupData, null, 2);
      
      // 创建备份文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `life-game-backup-${timestamp}.json`;
      
      // 上传到WebDAV
      await this.webdavClient.uploadFile(filename, backupJson);
      
      return {
        success: true,
        message: `备份成功！文件已上传到WebDAV: ${filename}`
      };
    } catch (error) {
      return {
        success: false,
        message: 'WebDAV备份失败',
        error: (error as Error).message
      };
    }
  }

  /**
   * 从WebDAV恢复
   * @param filename 备份文件名
   * @returns 恢复状态
   */
  async restoreFromWebDAV(filename: string): Promise<BackupStatus> {
    try {
      if (!this.webdavClient) {
        return {
          success: false,
          message: 'WebDAV未配置',
          error: '请先配置WebDAV参数'
        };
      }

      // 从WebDAV下载文件
      const backupJson = await this.webdavClient.downloadFile(filename);
      const backupData = JSON.parse(backupJson);
      
      // 恢复数据
      this.restoreAllData(backupData);
      
      return {
        success: true,
        message: '恢复成功！页面将刷新以加载新数据'
      };
    } catch (error) {
      return {
        success: false,
        message: 'WebDAV恢复失败',
        error: (error as Error).message
      };
    }
  }

  /**
   * 列出WebDAV上的备份文件
   * @returns 备份文件列表
   */
  async listWebDAVBackups(): Promise<Array<{ name: string; size: number; modified: Date }>> {
    try {
      if (!this.webdavClient) {
        return [];
      }

      const files = await this.webdavClient.listFiles();
      return files
        .filter(file => file.name.startsWith('life-game-backup-') && file.name.endsWith('.json'))
        .map(file => ({
          name: file.name,
          size: file.size,
          modified: new Date(file.mtime)
        }))
        .sort((a, b) => b.modified.getTime() - a.modified.getTime());
    } catch (error) {
      console.error('列出WebDAV备份失败:', error);
      return [];
    }
  }

  /**
   * 测试WebDAV连接
   * @returns 连接状态
   */
  async testWebDAVConnection(): Promise<BackupStatus> {
    try {
      if (!this.webdavClient) {
        return {
          success: false,
          message: 'WebDAV未配置',
          error: '请先配置WebDAV参数'
        };
      }

      await this.webdavClient.testConnection();
      return {
        success: true,
        message: 'WebDAV连接成功！'
      };
    } catch (error) {
      return {
        success: false,
        message: 'WebDAV连接测试失败',
        error: (error as Error).message
      };
    }
  }

  /**
   * 获取所有数据
   * @returns 所有数据
   */
  private getAllData(): any {
    return {
      settings: JSON.parse(localStorage.getItem('settings') || '{}'),
      projects: JSON.parse(localStorage.getItem('projects') || '[]'),
      habits: JSON.parse(localStorage.getItem('habits') || '[]'),
      characters: JSON.parse(localStorage.getItem('characters') || '[]'),
      achievements: JSON.parse(localStorage.getItem('achievements') || '[]'),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 恢复所有数据
   * @param data 备份数据
   */
  private restoreAllData(data: any): void {
    if (data.settings) localStorage.setItem('settings', JSON.stringify(data.settings));
    if (data.projects) localStorage.setItem('projects', JSON.stringify(data.projects));
    if (data.habits) localStorage.setItem('habits', JSON.stringify(data.habits));
    if (data.characters) localStorage.setItem('characters', JSON.stringify(data.characters));
    if (data.achievements) localStorage.setItem('achievements', JSON.stringify(data.achievements));
  }
}

// 创建单例实例
const simpleBackupManager = new SimpleBackupManager();
export default simpleBackupManager;
export { SimpleBackupManager };
export type { SimpleBackupConfig, BackupStatus };