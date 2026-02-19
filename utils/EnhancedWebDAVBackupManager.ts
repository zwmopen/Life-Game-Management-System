/**
 * 增强版WebDAV备份管理器
 * 提供批量文件上传、断点续传、进度指示等功能
 */

import { WebDAVClient } from './webdavClient';

interface BackupProgress {
  total: number;
  completed: number;
  currentFile: string;
  percentage: number;
  status: 'idle' | 'uploading' | 'downloading' | 'completed' | 'error';
  speed?: number; // bytes per second
  estimatedTimeRemaining?: number; // seconds
}

interface EnhancedWebDAVConfig {
  url: string;
  username: string;
  password: string;
  basePath?: string;
  chunkSize?: number; // 分块大小，单位字节，默认5MB
  maxConcurrent?: number; // 最大并发数，默认3
  retryAttempts?: number; // 重试次数，默认3次
  timeout?: number; // 超时时间，单位毫秒，默认30秒
}

interface BatchBackupOptions {
  batchSize?: number; // 批量大小
  onProgress?: (progress: BackupProgress) => void;
  onCancel?: () => void;
}

class EnhancedWebDAVBackupManager {
  private client: WebDAVClient;
  private config: Required<EnhancedWebDAVConfig>;
  private isCancelled: boolean = false;
  private backupDir: string = ''; // 备份目录路径

  constructor(config: EnhancedWebDAVConfig) {
    // 基础配置
    const baseConfig = {
      url: config.url,
      username: config.username,
      password: config.password,
      basePath: config.basePath || '', 
      chunkSize: config.chunkSize || 5 * 1024 * 1024, // 5MB default
      maxConcurrent: config.maxConcurrent || 3,
      retryAttempts: config.retryAttempts || 3,
      timeout: config.timeout || 30000, // 30 seconds default
    };

    // 应用坚果云特定优化
    if (config.url.includes('jianguoyun.com')) {
      console.log('检测到坚果云服务器，应用特定优化配置');
      this.config = {
        ...baseConfig,
        timeout: 60000, // 坚果云建议的超时时间：60秒
        retryAttempts: 5, // 坚果云建议的重试次数：5次
        chunkSize: 2 * 1024 * 1024, // 坚果云建议的分块大小：2MB
        maxConcurrent: 1, // 坚果云建议的并发数：1
      };
    } else {
      this.config = baseConfig;
    }

    // 设置备份目录 - 如果用户指定了basePath，直接使用它作为备份目录
    this.backupDir = this.config.basePath || 'life-game-backup';

    // 初始化WebDAV客户端 - basePath 设为空，由 backupDir 控制路径
    this.client = new WebDAVClient({
      url: this.config.url,
      username: this.config.username,
      password: this.config.password,
      basePath: '' // 客户端basePath为空，由backupDir控制完整路径
    });

    console.log('EnhancedWebDAVBackupManager配置:', {
      url: this.config.url,
      basePath: this.config.basePath,
      backupDir: this.backupDir,
      chunkSize: this.config.chunkSize,
      maxConcurrent: this.config.maxConcurrent,
      retryAttempts: this.config.retryAttempts,
      timeout: this.config.timeout,
    });
  }

  /**
   * 确保备份目录存在
   */
  private async ensureBackupDir(): Promise<void> {
    // 如果用户指定了basePath，假设目录已存在，不尝试创建
    if (this.config.basePath && this.config.basePath.trim() !== '') {
      console.log(`使用用户指定的备份目录: ${this.backupDir}`);
      return;
    }
    
    // 对于坚果云，不尝试创建目录，直接使用根目录
    if (this.config.url.includes('jianguoyun.com')) {
      console.log(`坚果云模式：直接使用应用目录根目录`);
      this.backupDir = '';
      return;
    }
    
    // 其他服务尝试创建默认备份目录
    try {
      await this.client.ensureDirectoryExists(this.backupDir);
      console.log(`备份目录已确认: ${this.backupDir}`);
    } catch (error) {
      console.error('创建备份目录失败:', error);
      throw new Error('无法创建备份目录，请检查WebDAV权限或手动指定备份目录路径');
    }
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.testConnection();
      return true;
    } catch (error) {
      console.error('WebDAV连接测试失败:', error);
      return false;
    }
  }

  /**
   * 取消当前操作
   */
  cancel(): void {
    this.isCancelled = true;
  }

  /**
   * 分块上传文件
   */
  private async uploadChunked(
    path: string,
    content: string,
    onProgress?: (progress: BackupProgress) => void
  ): Promise<void> {
    const chunkSize = this.config.chunkSize;
    const fileSize = new Blob([content]).size;
    
    if (fileSize <= chunkSize) {
      // 文件小于分块大小，直接上传
      await this.client.uploadFile(path, content);
      return;
    }

    // 生成一个唯一的上传ID用于断点续传
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempDir = `${this.config.basePath}/temp_${uploadId}`;
    await this.client.ensureDirectoryExists(tempDir);

    const chunks: string[] = [];
    for (let i = 0; i < fileSize; i += chunkSize) {
      if (this.isCancelled) {
        throw new Error('上传已被取消');
      }

      const chunk = content.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    // 上传分块
    const uploadPromises: Promise<void>[] = [];
    for (let i = 0; i < chunks.length; i++) {
      if (this.isCancelled) {
        throw new Error('上传已被取消');
      }

      const chunkPromise = this.withRetry(async () => {
        const chunkPath = `${tempDir}/chunk_${i.toString().padStart(5, '0')}`;
        await this.client.uploadFile(chunkPath, chunks[i]);
      });
      
      uploadPromises.push(chunkPromise);

      // 控制并发数
      if (uploadPromises.length >= this.config.maxConcurrent) {
        await Promise.allSettled(uploadPromises);
        // 清空已处理的promises
        uploadPromises.length = 0;
      }

      // 更新进度
      if (onProgress) {
        const progress: BackupProgress = {
          total: chunks.length,
          completed: i + 1,
          currentFile: path,
          percentage: ((i + 1) / chunks.length) * 100,
          status: 'uploading'
        };
        onProgress(progress);
      }
    }

    // 等待剩余的分块上传完成
    if (uploadPromises.length > 0) {
      await Promise.allSettled(uploadPromises);
    }

    // 合并分块
    let mergedContent = '';
    for (let i = 0; i < chunks.length; i++) {
      const chunkPath = `${tempDir}/chunk_${i.toString().padStart(5, '0')}`;
      const chunkContent = await this.client.downloadFile(chunkPath);
      mergedContent += chunkContent;
      
      // 删除临时分块文件
      await this.client.deleteFile(chunkPath);
    }

    // 上传合并后的文件
    await this.client.uploadFile(path, mergedContent);

    // 删除临时目录
    await this.cleanupTempDir(tempDir);
  }

  /**
   * 带重试机制的操作
   */
  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        if (this.isCancelled) {
          throw new Error('操作已被取消');
        }
        
        // 使用超时包装操作
        return await this.withTimeout(operation(), this.config.timeout);
      } catch (error) {
        lastError = error as Error;
        console.warn(`操作失败，第${attempt + 1}次重试:`, error);
        
        if (this.isCancelled) {
          throw new Error('操作已被取消');
        }
        
        if (attempt < this.config.retryAttempts) {
          // 指数退避延迟
          const delay = Math.pow(2, attempt) * 1000;
          await this.delay(delay);
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 带超时的异步操作
   */
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`操作超时 (${timeoutMs}ms)`));
      }, timeoutMs);
    });
    
    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * 检查坚果云特定配置
   */
  private isJianguoYun(): boolean {
    return this.config.url.includes('jianguoyun.com');
  }

  /**
   * 获取优化的配置
   */
  private getOptimizedConfig() {
    const baseConfig = {
      ...this.config
    };
    
    // 坚果云特定优化
    if (this.isJianguoYun()) {
      // 坚果云建议的超时时间
      baseConfig.timeout = 60000; // 60秒
      // 坚果云建议的重试次数
      baseConfig.retryAttempts = 5;
      // 坚果云建议的分块大小
      baseConfig.chunkSize = 2 * 1024 * 1024; // 2MB
    }
    
    return baseConfig;
  }

  /**
   * 清理临时目录
   */
  private async cleanupTempDir(tempDir: string): Promise<void> {
    try {
      const files = await this.client.listFiles(tempDir);
      for (const file of files) {
        if (!file.isDirectory) {
          await this.client.deleteFile(file.url);
        }
      }
      await this.client.deleteFile(tempDir);
    } catch (error) {
      console.warn('清理临时目录失败:', error);
    }
  }

  /**
   * 批量上传备份文件
   */
  async batchBackup(
    backups: Array<{ id: string; data: string }>,
    options?: BatchBackupOptions
  ): Promise<{ success: number; failed: string[] }> {
    this.isCancelled = false;
    
    // 确保备份目录存在
    await this.ensureBackupDir();
    
    // 构建备份目录路径
    const dir = this.backupDir.startsWith('/') ? this.backupDir : `/${this.backupDir}`;
    
    const batchSize = options?.batchSize || 5;
    const results = { success: 0, failed: [] as string[] };
    
    // 分批处理
    for (let i = 0; i < backups.length; i += batchSize) {
      if (this.isCancelled) {
        break;
      }

      const batch = backups.slice(i, i + batchSize);
      const promises = batch.map(async (backup) => {
        if (this.isCancelled) {
          throw new Error('备份已被取消');
        }

        try {
          // 准备备份数据
          const dataToBackup = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            data: backup.data
          };
          
          // 上传到备份目录
          const backupFilePath = `${dir}/${backup.id}.json`;
          const jsonContent = JSON.stringify(dataToBackup, null, 2);
          
          await this.uploadChunked(
            backupFilePath, 
            jsonContent, 
            (progress) => {
              if (options?.onProgress) {
                const overallProgress: BackupProgress = {
                  ...progress,
                  total: backups.length,
                  completed: i + Math.floor((progress.completed / progress.total) * batch.length),
                  percentage: ((i + Math.floor((progress.completed / progress.total) * batch.length)) / backups.length) * 100,
                  status: 'uploading'
                };
                options.onProgress(overallProgress);
              }
            }
          );
          
          results.success++;
        } catch (error) {
          console.error(`备份失败 ${backup.id}:`, error);
          results.failed.push(backup.id);
        }
      });
      
      // 等待当前批次完成
      await Promise.all(promises);
    }
    
    if (options?.onProgress) {
      options.onProgress({
        total: backups.length,
        completed: results.success + results.failed.length,
        currentFile: '',
        percentage: 100,
        status: this.isCancelled ? 'error' : 'completed'
      });
    }
    
    return results;
  }

  /**
   * 上传单个备份
   */
  async uploadBackup(
    backupId: string, 
    backupData: string, 
    onProgress?: (progress: BackupProgress) => void
  ): Promise<void> {
    this.isCancelled = false;
    
    // 确保备份目录存在
    await this.ensureBackupDir();
    
    // 准备备份数据
    const dataToBackup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: backupData
    };
    
    // 构建备份文件路径
    let backupFilePath: string;
    if (this.backupDir && this.backupDir.trim() !== '') {
      // 有备份目录
      const dir = this.backupDir.startsWith('/') ? this.backupDir : `/${this.backupDir}`;
      backupFilePath = `${dir}/${backupId}.json`;
    } else {
      // 无备份目录，直接使用文件名
      backupFilePath = `${backupId}.json`;
    }
    const jsonContent = JSON.stringify(dataToBackup, null, 2);
    
    console.log(`准备上传备份文件: ${backupFilePath}`);
    await this.uploadChunked(backupFilePath, jsonContent, onProgress);
  }

  /**
   * 下载备份
   */
  async downloadBackup(backupId: string): Promise<string | null> {
    this.isCancelled = false;
    
    try {
      // 构建备份目录路径
      const dir = this.backupDir.startsWith('/') ? this.backupDir : `/${this.backupDir}`;
      
      // 列出备份目录中的文件
      const files = await this.client.listFiles(dir);
      
      // 查找匹配的备份文件
      const backupFiles = files.filter(file => 
        !file.isDirectory && file.name.includes(backupId) && file.name.endsWith('.json')
      );
      
      if (backupFiles.length === 0) {
        console.log(`未找到备份: ${backupId}`);
        return null;
      }
      
      // 获取最新的备份文件
      const latestBackup = backupFiles.reduce((latest, current) => 
        current.mtime > latest.mtime ? current : latest
      );
      
      const content = await this.client.downloadFile(`${dir}/${latestBackup.name}`);
      const backupData = JSON.parse(content);
      return backupData.data || content;
    } catch (error) {
      console.error('下载备份失败:', error);
      throw error;
    }
  }

  /**
   * 获取备份列表
   */
  async listBackups(): Promise<Array<{ id: string; timestamp: Date; size: number }>> {
    try {
      // 构建备份目录路径
      const dir = this.backupDir.startsWith('/') ? this.backupDir : `/${this.backupDir}`;
      
      // 列出备份目录中的文件
      const files = await this.client.listFiles(dir);
      
      // 过滤出备份文件
      const backupFiles = files.filter(file => 
        !file.isDirectory && file.name.endsWith('.json')
      );
      
      const backups: Array<{ id: string; timestamp: Date; size: number }> = [];
      
      for (const file of backupFiles) {
        const id = file.name.replace('.json', '');
        backups.push({
          id,
          timestamp: file.mtime,
          size: file.size
        });
      }
      
      return backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('获取备份列表失败:', error);
      return [];
    }
  }

  /**
   * 删除备份
   */
  async deleteBackup(backupId: string): Promise<void> {
    try {
      const backups = await this.listBackups();
      const backupToDelete = backups.find(b => b.id.includes(backupId));
      
      if (!backupToDelete) {
        console.log(`未找到要删除的备份: ${backupId}`);
        return;
      }
      
      // 直接使用文件名删除
      const backupFileName = `${backupId}.json`;
      await this.client.deleteFile(backupFileName);
      console.log(`备份已删除: ${backupId}`);
    } catch (error) {
      console.error('删除备份失败:', error);
      throw error;
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
      
      return {
        totalBackups: backups.length,
        totalSize: backups.reduce((sum, backup) => sum + backup.size, 0),
        lastBackupDate: backups.length > 0 ? backups[0].timestamp : undefined
      };
    } catch (error) {
      console.error('获取备份统计信息失败:', error);
      return {
        totalBackups: 0,
        totalSize: 0
      };
    }
  }
}

export default EnhancedWebDAVBackupManager;
export type { EnhancedWebDAVConfig, BackupProgress, BatchBackupOptions };
