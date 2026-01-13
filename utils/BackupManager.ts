import dataPersistenceManager from './DataPersistenceManager';
import WebDAVBackupWrapper from './WebDAVBackupWrapper';
import EnhancedWebDAVBackupManager from './EnhancedWebDAVBackupManager';
import { BackupProgress } from './EnhancedWebDAVBackupManager';

interface BackupConfig {
  localAutoBackup?: boolean;
  cloudAutoBackup?: boolean;
  backupInterval?: number; // 备份间隔（分钟）
  retentionDays?: number; // 保留天数
}

interface BackupInfo {
  id: string;
  timestamp: number;
  size: number;
  type: 'local' | 'cloud';
  status: 'success' | 'failed' | 'in_progress';
  dataKeys?: string[]; // 备份的数据键列表
}

class BackupManager {
  private config: BackupConfig;
  private webDAVBackup: WebDAVBackupWrapper | null = null;
  private enhancedWebDAVBackup: EnhancedWebDAVBackupManager | null = null;
  private backupIntervalId: NodeJS.Timeout | null = null;
  private currentProgress: BackupProgress | null = null;
  private progressCallbacks: Array<(progress: BackupProgress) => void> = [];
  
  constructor(config?: BackupConfig) {
    this.config = {
      localAutoBackup: config?.localAutoBackup ?? true,
      cloudAutoBackup: config?.cloudAutoBackup ?? false,
      backupInterval: config?.backupInterval ?? 60, // 默认每小时备份一次
      retentionDays: config?.retentionDays ?? 7, // 默认保留7天
      ...config
    };
  }

  /**
   * 初始化备份管理器
   */
  async initialize(): Promise<void> {
    // 初始化WebDAV备份（如果配置了云备份）
    if (this.config.cloudAutoBackup) {
      try {
        // 尝试初始化增强版WebDAV备份
        const webdavConfig = JSON.parse(localStorage.getItem('webdavConfig') || '{}');
        if (webdavConfig.url && webdavConfig.username && webdavConfig.password) {
          this.enhancedWebDAVBackup = new EnhancedWebDAVBackupManager({
            url: webdavConfig.serverUrl || webdavConfig.url,
            username: webdavConfig.username,
            password: webdavConfig.password,
            basePath: webdavConfig.basePath || '/人生游戏管理系统'
          });
          
          // 测试连接
          const isConnected = await this.enhancedWebDAVBackup.testConnection();
          if (!isConnected) {
            console.warn('增强版WebDAV连接失败，回退到传统方式');
            throw new Error('Enhanced WebDAV connection failed');
          }
        } else {
          // 如果没有配置，尝试传统方式
          this.webDAVBackup = new WebDAVBackupWrapper();
          await this.webDAVBackup.initialize();
        }
      } catch (error) {
        console.error('WebDAV初始化失败:', error);
        // 即使WebDAV初始化失败，也要继续运行
      }
    }

    // 设置自动备份定时器
    if (this.config.backupInterval && this.config.backupInterval > 0) {
      this.startAutoBackup();
    }
  }

  /**
   * 开始自动备份
   */
  private startAutoBackup(): void {
    if (this.backupIntervalId) {
      clearInterval(this.backupIntervalId);
    }

    this.backupIntervalId = setInterval(() => {
      this.performAutoBackup();
    }, this.config.backupInterval! * 60 * 1000); // 转换为毫秒
  }

  /**
   * 执行自动备份
   */
  private async performAutoBackup(): Promise<void> {
    console.log('执行自动备份...');
    
    if (this.config.localAutoBackup) {
      await this.createLocalBackup();
    }
    
    if (this.config.cloudAutoBackup && (this.webDAVBackup || this.enhancedWebDAVBackup)) {
      await this.createCloudBackup();
    }
  }

  /**
   * 创建本地备份
   */
  async createLocalBackup(backupName?: string): Promise<BackupInfo> {
    const backupId = backupName || `local-backup-${Date.now()}`;
    const timestamp = Date.now();
    
    try {
      // 导出所有数据
      const backupData = dataPersistenceManager.exportAllData();
      const size = new Blob([backupData]).size;
      
      // 存储备份到localStorage
      const backupKey = `backup_${backupId}`;
      dataPersistenceManager.setItem(backupKey, {
        data: backupData,
        timestamp,
        size
      });

      // 记录备份信息
      const backupInfo: BackupInfo = {
        id: backupId,
        timestamp,
        size,
        type: 'local',
        status: 'success'
      };
      
      this.saveBackupInfo(backupInfo);
      
      console.log(`本地备份创建成功: ${backupId}`);
      return backupInfo;
    } catch (error) {
      console.error(`本地备份创建失败: ${backupId}`, error);
      
      const backupInfo: BackupInfo = {
        id: backupId,
        timestamp,
        size: 0,
        type: 'local',
        status: 'failed'
      };
      
      this.saveBackupInfo(backupInfo);
      throw error;
    }
  }

  /**
   * 创建云端备份
   */
  async createCloudBackup(backupName?: string): Promise<BackupInfo> {
    if (!this.webDAVBackup && !this.enhancedWebDAVBackup) {
      throw new Error('WebDAV备份未初始化');
    }

    const backupId = backupName || `cloud-backup-${Date.now()}`;
    const timestamp = Date.now();
    
    try {
      // 导出所有数据
      const backupData = dataPersistenceManager.exportAllData();
      const size = new Blob([backupData]).size;
      
      // 上传到WebDAV（优先使用增强版）
      if (this.enhancedWebDAVBackup) {
        await this.enhancedWebDAVBackup.uploadBackup(backupId, backupData, (progress) => {
          this.currentProgress = progress;
          this.progressCallbacks.forEach(callback => callback(progress));
        });
      } else {
        await this.webDAVBackup!.uploadBackup(backupId, backupData);
      }
      
      // 记录备份信息
      const backupInfo: BackupInfo = {
        id: backupId,
        timestamp,
        size,
        type: 'cloud',
        status: 'success'
      };
      
      this.saveBackupInfo(backupInfo);
      
      console.log(`云端备份创建成功: ${backupId}`);
      return backupInfo;
    } catch (error) {
      console.error(`云端备份创建失败: ${backupId}`, error);
      
      const backupInfo: BackupInfo = {
        id: backupId,
        timestamp,
        size: 0,
        type: 'cloud',
        status: 'failed'
      };
      
      this.saveBackupInfo(backupInfo);
      throw error;
    }
  }

  /**
   * 从本地恢复备份
   */
  async restoreFromLocalBackup(backupId: string): Promise<boolean> {
    try {
      const backupKey = `backup_${backupId}`;
      const backupData = dataPersistenceManager.getItem(backupKey);
      
      if (!backupData || !backupData.data) {
        throw new Error(`备份不存在: ${backupId}`);
      }

      // 导入数据
      const success = dataPersistenceManager.importData(backupData.data);
      
      if (success) {
        console.log(`从本地备份恢复成功: ${backupId}`);
        return true;
      } else {
        throw new Error(`数据导入失败: ${backupId}`);
      }
    } catch (error) {
      console.error(`从本地备份恢复失败: ${backupId}`, error);
      throw error;
    }
  }

  /**
   * 从云端恢复备份
   */
  async restoreFromCloudBackup(backupId: string): Promise<boolean> {
    if (!this.webDAVBackup && !this.enhancedWebDAVBackup) {
      throw new Error('WebDAV备份未初始化');
    }

    try {
      // 从WebDAV下载备份数据（优先使用增强版）
      let backupData: string | null = null;
      if (this.enhancedWebDAVBackup) {
        backupData = await this.enhancedWebDAVBackup.downloadBackup(backupId);
      } else {
        backupData = await this.webDAVBackup!.downloadBackup(backupId);
      }
      
      if (!backupData) {
        throw new Error(`云端备份不存在: ${backupId}`);
      }

      // 导入数据
      const success = dataPersistenceManager.importData(backupData);
      
      if (success) {
        console.log(`从云端备份恢复成功: ${backupId}`);
        return true;
      } else {
        throw new Error(`数据导入失败: ${backupId}`);
      }
    } catch (error) {
      console.error(`从云端备份恢复失败: ${backupId}`, error);
      throw error;
    }
  }

  /**
   * 获取备份列表
   */
  getBackupList(): BackupInfo[] {
    const backupInfos = dataPersistenceManager.getItem('backup_infos') || [];
    // 按时间倒序排列
    return backupInfos.sort((a: BackupInfo, b: BackupInfo) => b.timestamp - a.timestamp);
  }

  /**
   * 删除备份
   */
  async deleteBackup(backupId: string, type: 'local' | 'cloud'): Promise<void> {
    try {
      if (type === 'local') {
        // 删除本地备份数据
        const backupKey = `backup_${backupId}`;
        dataPersistenceManager.removeItem(backupKey);
      } else if (type === 'cloud' && (this.webDAVBackup || this.enhancedWebDAVBackup)) {
        // 删除云端备份（优先使用增强版）
        if (this.enhancedWebDAVBackup) {
          await this.enhancedWebDAVBackup.deleteBackup(backupId);
        } else {
          await this.webDAVBackup!.deleteBackup(backupId);
        }
      }

      // 从备份信息列表中移除
      const backupInfos = this.getBackupList();
      const updatedBackupInfos = backupInfos.filter(info => info.id !== backupId);
      dataPersistenceManager.setItem('backup_infos', updatedBackupInfos);
      
      console.log(`备份删除成功: ${backupId} (${type})`);
    } catch (error) {
      console.error(`删除备份失败: ${backupId} (${type})`, error);
      throw error;
    }
  }

  /**
   * 清理过期备份
   */
  async cleanupOldBackups(): Promise<void> {
    const retentionTime = this.config.retentionDays! * 24 * 60 * 60 * 1000; // 转换为毫秒
    const now = Date.now();
    const backupInfos = this.getBackupList();
    
    const oldBackups = backupInfos.filter(backup => 
      (now - backup.timestamp) > retentionTime
    );

    for (const backup of oldBackups) {
      try {
        await this.deleteBackup(backup.id, backup.type);
      } catch (error) {
        console.error(`清理过期备份失败: ${backup.id}`, error);
      }
    }

    console.log(`清理了 ${oldBackups.length} 个过期备份`);
  }

  /**
   * 保存备份信息
   */
  private saveBackupInfo(backupInfo: BackupInfo): void {
    try {
      const backupInfos = this.getBackupList();
      // 检查是否已存在相同ID的备份信息
      const existingIndex = backupInfos.findIndex(info => info.id === backupInfo.id);
      if (existingIndex >= 0) {
        backupInfos[existingIndex] = backupInfo;
      } else {
        backupInfos.push(backupInfo);
      }
      
      // 限制备份信息数量，只保留最近的100个
      const limitedBackups = backupInfos.slice(0, 100);
      
      dataPersistenceManager.setItem('backup_infos', limitedBackups);
    } catch (error) {
      console.error('保存备份信息失败:', error);
    }
  }

  /**
   * 获取备份统计信息
   */
  getBackupStats(): {
    totalBackups: number;
    localBackups: number;
    cloudBackups: number;
    totalSize: number;
    oldestBackup: number | null;
    newestBackup: number | null;
  } {
    const backupInfos = this.getBackupList();
    
    return {
      totalBackups: backupInfos.length,
      localBackups: backupInfos.filter(b => b.type === 'local').length,
      cloudBackups: backupInfos.filter(b => b.type === 'cloud').length,
      totalSize: backupInfos.reduce((sum, b) => sum + b.size, 0),
      oldestBackup: backupInfos.length > 0 ? Math.min(...backupInfos.map(b => b.timestamp)) : null,
      newestBackup: backupInfos.length > 0 ? Math.max(...backupInfos.map(b => b.timestamp)) : null
    };
  }

  /**
   * 获取当前备份进度
   */
  getCurrentProgress(): BackupProgress | null {
    return this.currentProgress;
  }

  /**
   * 添加进度回调
   */
  addProgressCallback(callback: (progress: BackupProgress) => void): void {
    this.progressCallbacks.push(callback);
  }

  /**
   * 移除进度回调
   */
  removeProgressCallback(callback: (progress: BackupProgress) => void): void {
    const index = this.progressCallbacks.indexOf(callback);
    if (index > -1) {
      this.progressCallbacks.splice(index, 1);
    }
  }

  /**
   * 批量创建云端备份
   */
  async batchCreateCloudBackups(backups: Array<{ id: string; data: string }>): Promise<{ success: number; failed: string[] }> {
    if (!this.enhancedWebDAVBackup) {
      throw new Error('增强版WebDAV备份未初始化');
    }

    return await this.enhancedWebDAVBackup.batchBackup(backups, {
      onProgress: (progress) => {
        this.currentProgress = progress;
        this.progressCallbacks.forEach(callback => callback(progress));
      }
    });
  }

  /**
   * 获取云端备份列表
   */
  async getCloudBackupList(): Promise<Array<{ id: string; timestamp: Date; size: number }>> {
    if (this.enhancedWebDAVBackup) {
      return await this.enhancedWebDAVBackup.listBackups();
    } else {
      // 使用传统方式获取列表
      return [];
    }
  }

  /**
   * 获取增强版备份统计信息
   */
  async getEnhancedBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    lastBackupDate?: Date;
  }> {
    if (this.enhancedWebDAVBackup) {
      return await this.enhancedWebDAVBackup.getBackupStats();
    } else {
      // 回退到基本统计
      const basicStats = this.getBackupStats();
      return {
        totalBackups: basicStats.cloudBackups,
        totalSize: 0, // 无法准确获取云端大小
        lastBackupDate: new Date() // 临时值
      };
    }
  }

  /**
   * 手动触发备份
   */
  async createManualBackup(options?: { name?: string, local?: boolean, cloud?: boolean }): Promise<{ local?: BackupInfo, cloud?: BackupInfo }> {
    const result: { local?: BackupInfo, cloud?: BackupInfo } = {};
    
    const backupName = options?.name || `manual-backup-${Date.now()}`;
    
    if (options?.local !== false && this.config.localAutoBackup) {
      result.local = await this.createLocalBackup(backupName + '-local');
    }
    
    if (options?.cloud !== false && this.config.cloudAutoBackup && this.webDAVBackup) {
      result.cloud = await this.createCloudBackup(backupName + '-cloud');
    }
    
    return result;
  }

  /**
   * 停止自动备份
   */
  stopAutoBackup(): void {
    if (this.backupIntervalId) {
      clearInterval(this.backupIntervalId);
      this.backupIntervalId = null;
    }
  }

  /**
   * 重新开始自动备份
   */
  restartAutoBackup(): void {
    this.stopAutoBackup();
    this.startAutoBackup();
  }

  /**
   * 销毁备份管理器
   */
  destroy(): void {
    this.stopAutoBackup();
  }
}

// 创建单例实例
const backupManager = new BackupManager({
  localAutoBackup: true,
  cloudAutoBackup: true,
  backupInterval: 60, // 每小时备份一次
  retentionDays: 7 // 保留7天
});

export default backupManager;
export { BackupManager, type BackupConfig, type BackupInfo };