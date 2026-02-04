import WebDAVClient, { WebDAVConfig, WebDAVFile } from './webdavClient';
import dataPersistenceManager from './DataPersistenceManager';
import { retrieveWebDAVConfig } from './secureStorage';
import { logInfo, logError, logWarn } from './logger';

interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // 同步间隔（分钟）
  conflictResolution: 'local_wins' | 'remote_wins' | 'manual';
  enableVersioning: boolean;
  maxVersions: number;
}

interface SyncStatus {
  lastSync: number | null;
  lastSyncStatus: 'success' | 'failed' | 'in_progress';
  pendingChanges: number;
  syncError: string | null;
}

interface SyncFile {
  path: string;
  localTimestamp: number;
  remoteTimestamp: number;
  size: number;
  status: 'synced' | 'conflict' | 'local_newer' | 'remote_newer' | 'local_only' | 'remote_only';
}

interface VersionInfo {
  version: number;
  timestamp: number;
  size: number;
  path: string;
}

class SyncManager {
  private config: SyncConfig;
  private webDAVClient: WebDAVClient | null = null;
  private syncIntervalId: NodeJS.Timeout | null = null;
  private status: SyncStatus;
  private syncInProgress: boolean = false;
  private statusCallbacks: Array<(status: SyncStatus) => void> = [];
  private initialized: boolean = false;

  constructor(config?: SyncConfig) {
    this.config = {
      autoSync: config?.autoSync ?? true,
      syncInterval: config?.syncInterval ?? 15, // 默认每15分钟同步一次
      conflictResolution: config?.conflictResolution ?? 'local_wins',
      enableVersioning: config?.enableVersioning ?? true,
      maxVersions: config?.maxVersions ?? 5,
      ...config
    };

    this.status = {
      lastSync: null,
      lastSyncStatus: 'success',
      pendingChanges: 0,
      syncError: null
    };

    this.loadStatus();
  }

  /**
   * 初始化同步管理器
   */
  async initialize(): Promise<boolean> {
    try {
      const webdavConfig = retrieveWebDAVConfig();
      
      if (!webdavConfig.url || !webdavConfig.username || !webdavConfig.password) {
        logWarn('WebDAV配置不完整，无法初始化同步管理器');
        return false;
      }

      this.webDAVClient = new WebDAVClient({
        ...webdavConfig,
        basePath: webdavConfig.basePath || '/人生游戏管理系统/sync'
      });

      // 测试连接
      await this.webDAVClient.testConnection();
      
      // 确保同步目录存在
      await this.ensureSyncDirectory();

      this.initialized = true;

      // 启动自动同步
      if (this.config.autoSync) {
        this.startAutoSync();
      }

      logInfo('同步管理器初始化成功');
      return true;
    } catch (error) {
      logError('同步管理器初始化失败:', error);
      this.status.syncError = error instanceof Error ? error.message : '初始化失败';
      this.saveStatus();
      return false;
    }
  }

  /**
   * 确保同步目录存在
   */
  private async ensureSyncDirectory(): Promise<void> {
    if (!this.webDAVClient) return;

    try {
      // 确保主同步目录存在
      await this.webDAVClient.ensureDirectoryExists('/');
      
      // 确保版本目录存在
      if (this.config.enableVersioning) {
        await this.webDAVClient.ensureDirectoryExists('/versions');
      }
    } catch (error) {
      logError('创建同步目录失败:', error);
      throw error;
    }
  }

  /**
   * 启动自动同步
   */
  startAutoSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }

    this.syncIntervalId = setInterval(() => {
      this.performSync();
    }, this.config.syncInterval * 60 * 1000);

    logInfo(`自动同步已启动，间隔: ${this.config.syncInterval}分钟`);
  }

  /**
   * 停止自动同步
   */
  stopAutoSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
      logInfo('自动同步已停止');
    }
  }

  /**
   * 执行同步
   */
  async performSync(): Promise<SyncStatus> {
    if (this.syncInProgress) {
      logInfo('同步已在进行中');
      return this.status;
    }

    if (!this.initialized || !this.webDAVClient) {
      await this.initialize();
      if (!this.initialized) {
        return this.status;
      }
    }

    this.syncInProgress = true;
    this.status.lastSyncStatus = 'in_progress';
    this.status.syncError = null;
    this.saveStatus();
    this.notifyStatusChange();

    try {
      logInfo('开始执行同步...');

      // 获取本地和远程文件列表
      const localFiles = this.getLocalFiles();
      const remoteFiles = await this.getRemoteFiles();

      // 分析差异
      const syncFiles = this.analyzeDifferences(localFiles, remoteFiles);

      // 执行同步操作
      await this.executeSync(syncFiles);

      // 更新状态
      this.status.lastSync = Date.now();
      this.status.lastSyncStatus = 'success';
      this.status.pendingChanges = 0;
      this.status.syncError = null;

      logInfo('同步完成');
    } catch (error) {
      logError('同步失败:', error);
      this.status.lastSyncStatus = 'failed';
      this.status.syncError = error instanceof Error ? error.message : '同步失败';
    } finally {
      this.syncInProgress = false;
      this.saveStatus();
      this.notifyStatusChange();
    }

    return this.status;
  }

  /**
   * 分析差异
   */
  private analyzeDifferences(localFiles: SyncFile[], remoteFiles: SyncFile[]): SyncFile[] {
    const syncFiles: SyncFile[] = [];
    const remotePathMap = new Map(remoteFiles.map(file => [file.path, file]));

    // 处理本地文件
    for (const localFile of localFiles) {
      const remoteFile = remotePathMap.get(localFile.path);
      if (remoteFile) {
        // 文件在本地和远程都存在
        if (localFile.localTimestamp === remoteFile.remoteTimestamp) {
          syncFiles.push({
            ...localFile,
            remoteTimestamp: remoteFile.remoteTimestamp,
            status: 'synced'
          });
        } else if (localFile.localTimestamp > remoteFile.remoteTimestamp) {
          syncFiles.push({
            ...localFile,
            remoteTimestamp: remoteFile.remoteTimestamp,
            status: 'local_newer'
          });
        } else {
          syncFiles.push({
            ...localFile,
            remoteTimestamp: remoteFile.remoteTimestamp,
            status: 'remote_newer'
          });
        }
        remotePathMap.delete(localFile.path);
      } else {
        // 文件只在本地存在
        syncFiles.push(localFile);
      }
    }

    // 处理只在远程存在的文件
    for (const [path, remoteFile] of remotePathMap) {
      syncFiles.push(remoteFile);
    }

    return syncFiles;
  }

  /**
   * 执行同步操作
   */
  private async executeSync(syncFiles: SyncFile[]): Promise<void> {
    if (!this.webDAVClient) return;

    for (const file of syncFiles) {
      try {
        switch (file.status) {
          case 'local_newer':
            await this.uploadFile(file);
            break;
          case 'remote_newer':
            await this.downloadFile(file);
            break;
          case 'local_only':
            await this.uploadFile(file);
            break;
          case 'remote_only':
            await this.downloadFile(file);
            break;
          case 'conflict':
            await this.resolveConflict(file);
            break;
        }
      } catch (error) {
        logError(`同步文件失败: ${file.path}`, error);
        // 继续处理其他文件
      }
    }
  }

  /**
   * 上传文件
   */
  private async uploadFile(file: SyncFile): Promise<void> {
    if (!this.webDAVClient) return;

    try {
      logInfo(`上传文件: ${file.path}`);

      // 如果启用了版本控制，先备份旧版本
      if (this.config.enableVersioning && file.status !== 'local_only') {
        await this.createVersion(file.path);
      }

      // 获取文件内容
      let content: string;
      if (file.path === '/data.json') {
        content = dataPersistenceManager.exportAllData();
      } else {
        // 处理其他文件
        content = '';
      }

      // 上传文件
      await this.webDAVClient.uploadFile(file.path, content);
      logInfo(`文件上传成功: ${file.path}`);
    } catch (error) {
      logError(`上传文件失败: ${file.path}`, error);
      throw error;
    }
  }

  /**
   * 下载文件
   */
  private async downloadFile(file: SyncFile): Promise<void> {
    if (!this.webDAVClient) return;

    try {
      logInfo(`下载文件: ${file.path}`);

      // 下载文件内容
      const content = await this.webDAVClient.downloadFile(file.path);

      // 处理文件内容
      if (file.path === '/data.json') {
        const success = dataPersistenceManager.importData(content);
        if (!success) {
          throw new Error('数据导入失败');
        }
      } else {
        // 处理其他文件
      }

      logInfo(`文件下载成功: ${file.path}`);
    } catch (error) {
      logError(`下载文件失败: ${file.path}`, error);
      throw error;
    }
  }

  /**
   * 解决冲突
   */
  private async resolveConflict(file: SyncFile): Promise<void> {
    if (!this.webDAVClient) return;

    try {
      logInfo(`解决冲突: ${file.path}`);

      switch (this.config.conflictResolution) {
        case 'local_wins':
          await this.uploadFile(file);
          break;
        case 'remote_wins':
          await this.downloadFile(file);
          break;
        case 'manual':
          // 手动解决冲突（这里可以实现更复杂的逻辑）
          await this.uploadFile(file);
          break;
      }

      logInfo(`冲突解决成功: ${file.path}`);
    } catch (error) {
      logError(`解决冲突失败: ${file.path}`, error);
      throw error;
    }
  }

  /**
   * 创建版本备份
   */
  private async createVersion(filePath: string): Promise<void> {
    if (!this.webDAVClient) return;

    try {
      // 获取当前文件
      const currentContent = await this.webDAVClient.downloadFile(filePath);
      
      // 获取版本信息
      const versions = await this.getVersions(filePath);
      const nextVersion = versions.length + 1;

      // 创建版本路径
      const versionPath = `/versions${filePath.replace(/\.json$/, `_v${nextVersion}.json`)}`;

      // 上传版本
      await this.webDAVClient.uploadFile(versionPath, currentContent);

      // 清理旧版本
      await this.cleanupOldVersions(filePath);

      logInfo(`创建版本成功: ${versionPath}`);
    } catch (error) {
      logError(`创建版本失败: ${filePath}`, error);
      // 版本创建失败不影响主同步流程
    }
  }

  /**
   * 获取文件版本列表
   */
  private async getVersions(filePath: string): Promise<VersionInfo[]> {
    if (!this.webDAVClient) return [];

    try {
      const files = await this.webDAVClient.listFiles('/versions');
      const versionFiles = files.filter(file => 
        file.name.includes(filePath.replace(/^\//, '').replace(/\.json$/, '')) && 
        file.name.includes('_v')
      );

      return versionFiles.map(file => {
        const match = file.name.match(/_v(\d+)\.json$/);
        const version = match ? parseInt(match[1], 10) : 0;
        return {
          version,
          timestamp: file.mtime.getTime(),
          size: file.size,
          path: `/versions/${file.name}`
        };
      }).sort((a, b) => b.version - a.version);
    } catch (error) {
      logError(`获取版本列表失败: ${filePath}`, error);
      return [];
    }
  }

  /**
   * 清理旧版本
   */
  private async cleanupOldVersions(filePath: string): Promise<void> {
    if (!this.webDAVClient) return;

    try {
      const versions = await this.getVersions(filePath);
      if (versions.length > this.config.maxVersions) {
        const versionsToDelete = versions.slice(this.config.maxVersions);
        for (const version of versionsToDelete) {
          await this.webDAVClient.deleteFile(version.path);
          logInfo(`删除旧版本: ${version.path}`);
        }
      }
    } catch (error) {
      logError(`清理旧版本失败: ${filePath}`, error);
    }
  }

  /**
   * 获取远程文件列表
   */
  private async getRemoteFiles(): Promise<SyncFile[]> {
    if (!this.webDAVClient) return [];

    try {
      const files = await this.webDAVClient.listFiles('/');
      return files
        .filter(file => !file.isDirectory)
        .map(file => ({
          path: `/${file.name}`,
          localTimestamp: 0,
          remoteTimestamp: file.mtime.getTime(),
          size: file.size,
          status: 'remote_only'
        }));
    } catch (error) {
      logError('获取远程文件列表失败:', error);
      return [];
    }
  }

  /**
   * 获取本地文件列表
   */
  private getLocalFiles(): SyncFile[] {
    const files: SyncFile[] = [];

    // 主数据文件
    const data = dataPersistenceManager.exportAllData();
    const dataSize = new Blob([data]).size;
    const dataTimestamp = dataPersistenceManager.getItem('last_modified') || Date.now();

    files.push({
      path: '/data.json',
      localTimestamp: dataTimestamp,
      remoteTimestamp: 0,
      size: dataSize,
      status: 'local_only'
    });

    // 其他本地文件（如果有）

    return files;
  }

  /**
   * 保存状态
   */
  private saveStatus(): void {
    try {
      dataPersistenceManager.setItem('sync_status', this.status);
    } catch (error) {
      logError('保存同步状态失败:', error);
    }
  }

  /**
   * 加载状态
   */
  private loadStatus(): void {
    try {
      const savedStatus = dataPersistenceManager.getItem('sync_status');
      if (savedStatus) {
        this.status = {
          ...this.status,
          ...savedStatus
        };
      }
    } catch (error) {
      logError('加载同步状态失败:', error);
    }
  }

  /**
   * 通知状态变化
   */
  private notifyStatusChange(): void {
    this.statusCallbacks.forEach(callback => {
      try {
        callback({ ...this.status });
      } catch (error) {
        logError('通知状态变化失败:', error);
      }
    });
  }

  /**
   * 获取同步状态
   */
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * 添加状态回调
   */
  addStatusCallback(callback: (status: SyncStatus) => void): void {
    this.statusCallbacks.push(callback);
  }

  /**
   * 移除状态回调
   */
  removeStatusCallback(callback: (status: SyncStatus) => void): void {
    const index = this.statusCallbacks.indexOf(callback);
    if (index > -1) {
      this.statusCallbacks.splice(index, 1);
    }
  }

  /**
   * 手动触发同步
   */
  async syncNow(): Promise<SyncStatus> {
    return await this.performSync();
  }

  /**
   * 暂停同步
   */
  pauseSync(): void {
    this.stopAutoSync();
  }

  /**
   * 恢复同步
   */
  resumeSync(): void {
    if (this.config.autoSync) {
      this.startAutoSync();
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<SyncConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };

    if (this.config.autoSync) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
  }

  /**
   * 销毁同步管理器
   */
  destroy(): void {
    this.stopAutoSync();
    this.statusCallbacks = [];
  }
}

// 创建单例实例
const syncManager = new SyncManager({
  autoSync: true,
  syncInterval: 15,
  conflictResolution: 'local_wins',
  enableVersioning: true,
  maxVersions: 5
});

export default syncManager;
export { SyncManager, type SyncConfig, type SyncStatus, type SyncFile };
