import dataPersistenceManager from './DataPersistenceManager';
import WebDAVBackupWrapper from './WebDAVBackupWrapper';
import EnhancedWebDAVBackupManager from './EnhancedWebDAVBackupManager';
import { BackupProgress } from './EnhancedWebDAVBackupManager';
import { retrieveWebDAVConfig } from './secureStorage';
import BaiduNetdiskBackupManager from './BaiduNetdiskBackupManager';
import { BaiduNetdiskConfig } from './BaiduNetdiskBackupManager';

interface BackupConfig {
  localAutoBackup?: boolean;
  cloudAutoBackup?: boolean;
  hybridBackup?: boolean; // 混合备份模式
  backupInterval?: number; // 备份间隔（分钟）
  retentionDays?: number; // 保留天数
  backupStrategy?: 'full' | 'incremental' | 'differential'; // 备份策略
  priorityBackupType?: 'local' | 'cloud' | 'both'; // 优先备份类型
  // 智能调度选项
  smartScheduling?: boolean; // 智能调度
  backupWindow?: { start: string; end: string }; // 备份窗口（HH:MM格式）
  networkCondition?: 'always' | 'wifi-only' | 'unmetered-only'; // 网络条件
  batteryCondition?: 'always' | 'above-20' | 'above-50'; // 电池条件
  // 备份计划
  backupPlans?: Array<{
    id: string;
    name: string;
    enabled: boolean;
    schedule: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM格式
    days?: number[]; // 周几（0-6）或月几（1-31）
    backupType: 'local' | 'cloud' | 'hybrid';
    strategy: 'full' | 'incremental' | 'differential';
  }>;
  // 增量备份选项
  incrementalBackup?: boolean; // 启用增量备份
  incrementalBaseDays?: number; // 增量备份基础周期（天）
  // 条件触发
  triggerOnDataChange?: boolean; // 数据变化时触发
  triggerOnAppStart?: boolean; // 应用启动时触发
  triggerOnAppClose?: boolean; // 应用关闭时触发
  minDataChangeSize?: number; // 最小数据变化大小（字节）
  // 百度网盘配置
  baiduNetdiskEnabled?: boolean; // 启用百度网盘备份
  baiduNetdiskConfig?: BaiduNetdiskConfig; // 百度网盘配置
  cloudBackupProvider?: 'webdav' | 'baidu'; // 云端备份提供商
}

interface BackupInfo {
  id: string;
  timestamp: number;
  size: number;
  type: 'local' | 'cloud' | 'hybrid';
  status: 'success' | 'failed' | 'in_progress';
  dataKeys?: string[]; // 备份的数据键列表
  strategy?: 'full' | 'incremental' | 'differential'; // 备份策略
  verificationStatus?: 'verified' | 'pending' | 'failed'; // 验证状态
}

interface HybridBackupInfo {
  localBackup: BackupInfo;
  cloudBackup: BackupInfo;
  correlationId: string; // 关联ID，用于关联本地和云端备份
  status: 'success' | 'partial' | 'failed'; // 混合备份整体状态
}

class BackupManager {
  private config: BackupConfig;
  private webDAVBackup: WebDAVBackupWrapper | null = null;
  private enhancedWebDAVBackup: EnhancedWebDAVBackupManager | null = null;
  private baiduNetdiskBackup: BaiduNetdiskBackupManager | null = null;
  private backupIntervalId: NodeJS.Timeout | null = null;
  private currentProgress: BackupProgress | null = null;
  private progressCallbacks: Array<(progress: BackupProgress) => void> = [];
  private initialized: boolean = false;
  private initializingPromise: Promise<void> | null = null;
  
  constructor(config?: BackupConfig) {
       this.config = {
         localAutoBackup: config?.localAutoBackup ?? true,
         cloudAutoBackup: config?.cloudAutoBackup ?? true, // 默认启用云端备份
         hybridBackup: config?.hybridBackup ?? false, // 默认禁用混合备份
         backupInterval: config?.backupInterval ?? 60, // 默认每小时备份一次
         retentionDays: config?.retentionDays ?? 7, // 默认保留7天
         backupStrategy: config?.backupStrategy ?? 'full', // 默认使用完整备份
         priorityBackupType: config?.priorityBackupType ?? 'both', // 默认同时备份
         // 智能调度默认值
         smartScheduling: config?.smartScheduling ?? false, // 默认禁用智能调度
         networkCondition: config?.networkCondition ?? 'always', // 默认不限制网络
         batteryCondition: config?.batteryCondition ?? 'always', // 默认不限制电池
         // 备份计划默认值
         backupPlans: config?.backupPlans ?? [], // 默认无备份计划
         // 增量备份默认值
         incrementalBackup: config?.incrementalBackup ?? false, // 默认禁用增量备份
         incrementalBaseDays: config?.incrementalBaseDays ?? 7, // 默认7天为一个基础周期
         // 条件触发默认值
         triggerOnDataChange: config?.triggerOnDataChange ?? false, // 默认禁用数据变化触发
         triggerOnAppStart: config?.triggerOnAppStart ?? false, // 默认禁用应用启动触发
         triggerOnAppClose: config?.triggerOnAppClose ?? false, // 默认禁用应用关闭触发
         minDataChangeSize: config?.minDataChangeSize ?? 1024, // 默认1KB
         // 百度网盘默认值
         baiduNetdiskEnabled: config?.baiduNetdiskEnabled ?? true, // 默认启用百度网盘备份
         cloudBackupProvider: config?.cloudBackupProvider ?? 'baidu', // 默认使用百度网盘
         // 百度网盘配置（使用用户提供的凭证）
         baiduNetdiskConfig: config?.baiduNetdiskConfig ?? {
           clientId: 'G5tdFv7bUtULL4JsJz6aLBJ98Gf3PTfv', // AppKey
           clientSecret: 'mtdWGnzRfSkDRugMRClUXU71HrGLgYj6', // SecretKey
           redirectUri: 'https://localhost'
         },
         ...config
       };
     }

  /**
   * 初始化备份管理器
   * @param force 是否强制重新初始化
   */
  async initialize(force: boolean = false): Promise<void> {
    if (this.initializingPromise && !force) {
      return this.initializingPromise;
    }

    this.initializingPromise = (async () => {
      console.log('正在初始化备份管理器...', force ? '(强制重置)' : '');
      
      // 获取WebDAV配置
      const webdavConfig = retrieveWebDAVConfig();
      
      // 重置现有实例
      if (force) {
        this.webDAVBackup = null;
        this.enhancedWebDAVBackup = null;
        this.baiduNetdiskBackup = null;
        this.initialized = false;
      }

      // 初始化云端备份
      try {
        if (this.config.cloudBackupProvider === 'baidu' && this.config.baiduNetdiskEnabled && this.config.baiduNetdiskConfig) {
          console.log('检测到百度网盘配置，初始化百度网盘备份管理器');
          this.baiduNetdiskBackup = new BaiduNetdiskBackupManager(this.config.baiduNetdiskConfig);
          await this.baiduNetdiskBackup.initialize();
        } else if (webdavConfig.url && webdavConfig.username && webdavConfig.password) {
          console.log('检测到WebDAV完整配置，初始化增强版管理器');
          // 尝试初始化增强版WebDAV备份
          this.enhancedWebDAVBackup = new EnhancedWebDAVBackupManager({
            url: webdavConfig.url,
            username: webdavConfig.username,
            password: webdavConfig.password,
            basePath: '/人生游戏管理系统'
          });
          
          // 测试连接
          const isConnected = await this.enhancedWebDAVBackup.testConnection();
          if (!isConnected) {
            console.warn('增强版WebDAV连接测试失败，但仍保留实例供后续重试');
          }
        } else {
          console.log('WebDAV配置不完整，尝试传统方式初始化');
          // 如果没有配置，尝试传统方式
          this.webDAVBackup = new WebDAVBackupWrapper();
          await this.webDAVBackup.initialize();
        }
      } catch (error) {
        console.error('云端备份初始化过程中出错:', error);
        // 即使出错也继续，避免阻塞后续逻辑
      }

      this.initialized = true;

      // 设置自动备份定时器
      if (this.config.backupInterval && this.config.backupInterval > 0) {
        this.startAutoBackup();
      }
    })();

    return this.initializingPromise;
  }

  /**
   * 确保已初始化并尝试创建备份客户端
   */
  private async ensureInitialized(): Promise<void> {
    // 检查是否已初始化，以及实例是否存在
    if (!this.initialized || (!this.webDAVBackup && !this.enhancedWebDAVBackup && !this.baiduNetdiskBackup)) {
      await this.initialize();
      return;
    }
    
    // 检查当前实例的配置是否与存储中的配置匹配
    const currentConfig = retrieveWebDAVConfig();
    
    // 检查当前配置是否有效
    const hasValidWebDAVConfig = currentConfig.url && currentConfig.username && currentConfig.password;
    const hasEnhancedInstance = this.enhancedWebDAVBackup !== null;
    const hasBasicInstance = this.webDAVBackup !== null;
    const hasBaiduInstance = this.baiduNetdiskBackup !== null;
    
    // 根据云备份提供商检查配置与实例是否匹配
    if (this.config.cloudBackupProvider === 'baidu') {
      // 百度网盘模式
      if (this.config.baiduNetdiskEnabled && !hasBaiduInstance) {
        console.log('百度网盘配置已启用但实例不存在，正在重新初始化...');
        await this.initialize(true); // 强制重新初始化
      }
    } else {
      // WebDAV模式
      if ((hasValidWebDAVConfig && !hasEnhancedInstance) || (!hasValidWebDAVConfig && !hasBasicInstance)) {
        console.log('WebDAV配置与实例不匹配，正在重新初始化...');
        await this.initialize(true); // 强制重新初始化
      }
    }
  }

  /**
   * 检查备份条件是否满足
   */
  private async checkBackupConditions(): Promise<boolean> {
    // 检查智能调度是否启用
    if (!this.config.smartScheduling) {
      return true; // 智能调度未启用，直接返回true
    }
    
    // 检查备份窗口
    if (this.config.backupWindow) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;
      
      const [startHour, startMinute] = this.config.backupWindow.start.split(':').map(Number);
      const [endHour, endMinute] = this.config.backupWindow.end.split(':').map(Number);
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      if (startTime <= endTime) {
        // 备份窗口在同一天内
        if (currentTime < startTime || currentTime > endTime) {
          console.log('当前时间不在备份窗口内，跳过备份');
          return false;
        }
      } else {
        // 备份窗口跨天
        if (currentTime >= endTime && currentTime <= startTime) {
          console.log('当前时间不在备份窗口内，跳过备份');
          return false;
        }
      }
    }
    
    // 检查网络条件（简化实现，实际应用中需要检测网络状态）
    if (this.config.networkCondition !== 'always') {
      // 这里应该添加实际的网络状态检测
      console.log(`网络条件设置为${this.config.networkCondition}，跳过网络检查`);
      // 暂时返回true，实际应用中需要根据网络状态返回
    }
    
    // 检查电池条件（简化实现，实际应用中需要检测电池状态）
    if (this.config.batteryCondition !== 'always') {
      // 这里应该添加实际的电池状态检测
      console.log(`电池条件设置为${this.config.batteryCondition}，跳过电池检查`);
      // 暂时返回true，实际应用中需要根据电池状态返回
    }
    
    return true;
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
    
    // 启动备份计划调度
    this.startBackupPlans();
  }

  /**
   * 启动备份计划调度
   */
  private startBackupPlans(): void {
    if (this.config.backupPlans && this.config.backupPlans.length > 0) {
      console.log('启动备份计划调度...');
      // 为每个备份计划设置定时器
      this.config.backupPlans.forEach(plan => {
        if (plan.enabled) {
          this.scheduleBackupPlan(plan);
        }
      });
    }
  }

  /**
   * 调度备份计划
   */
  private scheduleBackupPlan(plan: any): void {
    // 计算下次执行时间
    const nextRunTime = this.calculateNextRunTime(plan);
    if (!nextRunTime) {
      return;
    }
    
    const now = new Date();
    const delay = nextRunTime.getTime() - now.getTime();
    
    if (delay > 0) {
      console.log(`调度备份计划 ${plan.name} 在 ${nextRunTime.toISOString()}`);
      setTimeout(async () => {
        await this.executeBackupPlan(plan);
        // 递归调度下一次执行
        this.scheduleBackupPlan(plan);
      }, delay);
    }
  }

  /**
   * 计算备份计划的下次执行时间
   */
  private calculateNextRunTime(plan: any): Date | null {
    const now = new Date();
    const [hour, minute] = plan.time.split(':').map(Number);
    
    let nextRun = new Date();
    nextRun.setHours(hour, minute, 0, 0);
    
    if (plan.schedule === 'daily') {
      // 每天执行
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
    } else if (plan.schedule === 'weekly') {
      // 每周执行
      if (plan.days && plan.days.length > 0) {
        // 找到下一个匹配的周几
        let found = false;
        for (let i = 0; i < 7; i++) {
          const checkDate = new Date(now);
          checkDate.setDate(checkDate.getDate() + i);
          if (plan.days.includes(checkDate.getDay())) {
            nextRun = new Date(checkDate);
            nextRun.setHours(hour, minute, 0, 0);
            if (nextRun > now) {
              found = true;
              break;
            }
          }
        }
        if (!found) {
          // 下周同一时间
          nextRun.setDate(nextRun.getDate() + 7);
        }
      }
    } else if (plan.schedule === 'monthly') {
      // 每月执行
      if (plan.days && plan.days.length > 0) {
        // 找到下一个匹配的月几
        let found = false;
        for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
          const checkDate = new Date(now);
          checkDate.setMonth(checkDate.getMonth() + monthOffset);
          for (const day of plan.days) {
            const targetDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), day);
            targetDate.setHours(hour, minute, 0, 0);
            if (targetDate > now) {
              nextRun = targetDate;
              found = true;
              break;
            }
          }
          if (found) {
            break;
          }
        }
      }
    }
    
    return nextRun;
  }

  /**
   * 执行备份计划
   */
  private async executeBackupPlan(plan: any): Promise<void> {
    console.log(`执行备份计划: ${plan.name}`);
    
    try {
      // 检查备份条件
      if (!(await this.checkBackupConditions())) {
        console.log('备份条件不满足，跳过备份计划执行');
        return;
      }
      
      // 根据备份类型执行备份
      if (plan.backupType === 'local') {
        await this.createLocalBackup(`plan-${plan.id}-${Date.now()}`);
      } else if (plan.backupType === 'cloud') {
        await this.createCloudBackup(`plan-${plan.id}-${Date.now()}`);
      } else if (plan.backupType === 'hybrid') {
        await this.createHybridBackup(`plan-${plan.id}-${Date.now()}`);
      }
      
      console.log(`备份计划 ${plan.name} 执行完成`);
    } catch (error) {
      console.error(`执行备份计划 ${plan.name} 失败:`, error);
    }
  }

  /**
   * 执行自动备份
   */
   private async performAutoBackup(): Promise<void> {
     console.log('执行自动备份...');
     
     try {
       // 检查备份条件
       if (!(await this.checkBackupConditions())) {
         console.log('备份条件不满足，跳过自动备份');
         return;
       }
       
       // 检查是否启用混合备份
       if (this.config.hybridBackup && (this.webDAVBackup || this.enhancedWebDAVBackup)) {
         console.log('开始混合自动备份...');
         await this.createHybridBackup(`auto-hybrid-backup-${Date.now()}`);
         console.log('混合自动备份完成');
       } else {
         // 根据优先备份类型执行备份
         if (this.config.priorityBackupType === 'local' || this.config.priorityBackupType === 'both') {
           if (this.config.localAutoBackup) {
             console.log('开始本地自动备份...');
             await this.createLocalBackup(`auto-local-backup-${Date.now()}`);
             console.log('本地自动备份完成');
           }
         }
         
         if (this.config.priorityBackupType === 'cloud' || this.config.priorityBackupType === 'both') {
           if (this.config.cloudAutoBackup && (this.webDAVBackup || this.enhancedWebDAVBackup)) {
             console.log('开始云端自动备份...');
             await this.createCloudBackup(`auto-cloud-backup-${Date.now()}`);
             console.log('云端自动备份完成');
           } else if (this.config.cloudAutoBackup) {
             console.warn('云端自动备份已启用，但WebDAV未配置');
             // 尝试初始化WebDAV
             await this.initialize(true);
             if (this.webDAVBackup || this.enhancedWebDAVBackup) {
               console.log('WebDAV初始化成功，开始云端自动备份...');
               await this.createCloudBackup(`auto-cloud-backup-${Date.now()}`);
               console.log('云端自动备份完成');
             } else {
               console.error('WebDAV初始化失败，无法执行云端备份');
             }
           }
         }
       }
     } catch (error) {
       console.error('自动备份失败:', error);
     }
   }

  /**
   * 创建本地备份
   */
  async createLocalBackup(backupName?: string): Promise<BackupInfo> {
    const backupId = backupName || `local-backup-${Date.now()}`;
    const timestamp = Date.now();
    const strategy = this.config.backupStrategy || 'full';
    
    try {
      let backupData: string;
      let size: number;
      let isIncremental = false;
      let baseBackupId: string | undefined;
      
      // 检查是否需要执行增量备份
      if (this.config.incrementalBackup && strategy === 'incremental') {
        // 查找最近的完整备份作为基础
        const baseBackup = this.findLatestFullBackup('local');
        if (baseBackup) {
          // 执行增量备份
          console.log(`基于备份 ${baseBackup.id} 执行增量备份`);
          backupData = await this.createIncrementalBackup(baseBackup.id);
          size = new Blob([backupData]).size;
          isIncremental = true;
          baseBackupId = baseBackup.id;
        } else {
          // 没有基础备份，执行完整备份
          console.log('没有找到基础备份，执行完整备份');
          backupData = dataPersistenceManager.exportAllData();
          size = new Blob([backupData]).size;
        }
      } else {
        // 执行完整备份
        backupData = dataPersistenceManager.exportAllData();
        size = new Blob([backupData]).size;
      }
      
      // 存储备份到localStorage
      const backupKey = `backup_${backupId}`;
      dataPersistenceManager.setItem(backupKey, {
        data: backupData,
        timestamp,
        size,
        strategy,
        isIncremental,
        baseBackupId
      });

      // 记录备份信息
      const backupInfo: BackupInfo = {
        id: backupId,
        timestamp,
        size,
        type: 'local',
        status: 'success',
        strategy
      };
      
      this.saveBackupInfo(backupInfo);
      
      console.log(`本地备份创建成功: ${backupId} (策略: ${strategy})`);
      return backupInfo;
    } catch (error) {
      console.error(`本地备份创建失败: ${backupId}`, error);
      
      const backupInfo: BackupInfo = {
        id: backupId,
        timestamp,
        size: 0,
        type: 'local',
        status: 'failed',
        strategy
      };
      
      this.saveBackupInfo(backupInfo);
      throw error;
    }
  }

  /**
   * 创建云端备份
   */
  async createCloudBackup(backupName?: string): Promise<BackupInfo> {
    console.log('正在执行云端备份...');
    await this.ensureInitialized();
    
    // 根据云备份提供商选择备份方法
    if (this.config.cloudBackupProvider === 'baidu' && this.config.baiduNetdiskEnabled) {
      // 使用百度网盘备份
      if (!this.baiduNetdiskBackup) {
        console.log('未检测到百度网盘备份实例，尝试重新初始化...');
        await this.initialize(true);
      }
      
      if (!this.baiduNetdiskBackup) {
        throw new Error('百度网盘备份客户端创建失败，请检查配置');
      }

      const backupId = backupName || `baidu-backup-${Date.now()}`;
      const timestamp = Date.now();
      
      try {
        // 导出所有数据
        const backupData = dataPersistenceManager.exportAllData();
        const size = new Blob([backupData]).size;
        
        // 上传到百度网盘
        await this.baiduNetdiskBackup.uploadBackup(backupId, backupData);
        
        // 记录备份信息
        const backupInfo: BackupInfo = {
          id: backupId,
          timestamp,
          size,
          type: 'cloud',
          status: 'success',
          strategy: this.config.backupStrategy
        };
        
        this.saveBackupInfo(backupInfo);
        
        console.log(`百度网盘备份创建成功: ${backupId}`);
        return backupInfo;
      } catch (error) {
        console.error(`百度网盘备份创建失败: ${backupId}`, error);
        
        const backupInfo: BackupInfo = {
          id: backupId,
          timestamp,
          size: 0,
          type: 'cloud',
          status: 'failed',
          strategy: this.config.backupStrategy
        };
        
        this.saveBackupInfo(backupInfo);
        throw error;
      }
    } else {
      // 使用WebDAV备份
      // 检查是否有可用的WebDAV配置
      const webdavConfig = retrieveWebDAVConfig();
      if (!webdavConfig.username || !webdavConfig.password) {
        console.error('WebDAV配置不完整，无法执行云端备份');
        throw new Error('WebDAV备份未配置，请在设置中输入用户名和密码');
      }

      // 如果实例不存在或配置已更新，确保实例可用
      if (!this.webDAVBackup && !this.enhancedWebDAVBackup) {
        console.log('未检测到WebDAV备份实例，尝试重新初始化...');
        await this.initialize(true);
      }
      
      if (!this.webDAVBackup && !this.enhancedWebDAVBackup) {
        throw new Error('WebDAV备份客户端创建失败，请检查配置或网络连接');
      }

      const backupId = backupName || `webdav-backup-${Date.now()}`;
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
          status: 'success',
          strategy: this.config.backupStrategy
        };
        
        this.saveBackupInfo(backupInfo);
        
        console.log(`WebDAV备份创建成功: ${backupId}`);
        return backupInfo;
      } catch (error) {
        console.error(`WebDAV备份创建失败: ${backupId}`, error);
        
        const backupInfo: BackupInfo = {
          id: backupId,
          timestamp,
          size: 0,
          type: 'cloud',
          status: 'failed',
          strategy: this.config.backupStrategy
        };
        
        this.saveBackupInfo(backupInfo);
        throw error;
      }
    }
  }

  /**
   * 从本地恢复备份
   */
  async restoreFromLocalBackup(backupId: string, options?: { selective?: boolean; dataKeys?: string[] }): Promise<{ success: boolean; restoredData?: any; message: string }> {
    try {
      const backupKey = `backup_${backupId}`;
      const backupData = dataPersistenceManager.getItem(backupKey);
      
      if (!backupData || !backupData.data) {
        return {
          success: false,
          message: `备份不存在: ${backupId}`
        };
      }

      // 检查是否为增量备份
      let restoreData = backupData.data;
      if (backupData.isIncremental && backupData.baseBackupId) {
        // 需要先恢复基础备份
        console.log(`恢复增量备份 ${backupId}，首先恢复基础备份 ${backupData.baseBackupId}`);
        const baseRestoreResult = await this.restoreFromLocalBackup(backupData.baseBackupId);
        if (!baseRestoreResult.success) {
          return {
            success: false,
            message: `无法恢复基础备份 ${backupData.baseBackupId}: ${baseRestoreResult.message}`
          };
        }
      }

      // 导入数据
      let success: boolean;
      let restoredData: any;
      
      if (options?.selective && options.dataKeys && options.dataKeys.length > 0) {
        // 选择性恢复
        success = await this.performSelectiveRestore(restoreData, options.dataKeys);
        restoredData = options.dataKeys;
      } else {
        // 完整恢复
        success = dataPersistenceManager.importData(restoreData);
      }
      
      if (success) {
        console.log(`从本地备份恢复成功: ${backupId}`);
        return {
          success: true,
          restoredData,
          message: `从本地备份恢复成功: ${backupId}`
        };
      } else {
        return {
          success: false,
          message: `数据导入失败: ${backupId}`
        };
      }
    } catch (error) {
      console.error(`从本地备份恢复失败: ${backupId}`, error);
      return {
        success: false,
        message: `从本地备份恢复失败: ${(error as Error).message}`
      };
    }
  }

  /**
   * 从云端恢复备份
   */
  async restoreFromCloudBackup(backupId: string, options?: { selective?: boolean; dataKeys?: string[] }): Promise<{ success: boolean; restoredData?: any; message: string }> {
    await this.ensureInitialized();
    
    // 根据云备份提供商选择恢复方法
    if (this.config.cloudBackupProvider === 'baidu' && this.config.baiduNetdiskEnabled) {
      // 使用百度网盘恢复
      if (!this.baiduNetdiskBackup) {
        return {
          success: false,
          message: '百度网盘备份未初始化'
        };
      }

      try {
        // 从百度网盘下载备份数据
        const backupData = await this.baiduNetdiskBackup.downloadBackup(backupId);
        
        if (!backupData) {
          return {
            success: false,
            message: `百度网盘备份不存在: ${backupId}`
          };
        }

        // 导入数据
        let success: boolean;
        let restoredData: any;
        
        if (options?.selective && options.dataKeys && options.dataKeys.length > 0) {
          // 选择性恢复
          success = await this.performSelectiveRestore(backupData, options.dataKeys);
          restoredData = options.dataKeys;
        } else {
          // 完整恢复
          success = dataPersistenceManager.importData(backupData);
        }
        
        if (success) {
          console.log(`从百度网盘备份恢复成功: ${backupId}`);
          return {
            success: true,
            restoredData,
            message: `从百度网盘备份恢复成功: ${backupId}`
          };
        } else {
          return {
            success: false,
            message: `数据导入失败: ${backupId}`
          };
        }
      } catch (error) {
        console.error(`从百度网盘备份恢复失败: ${backupId}`, error);
        return {
          success: false,
          message: `从百度网盘备份恢复失败: ${(error as Error).message}`
        };
      }
    } else {
      // 使用WebDAV恢复
      if (!this.webDAVBackup && !this.enhancedWebDAVBackup) {
        return {
          success: false,
          message: 'WebDAV备份未初始化'
        };
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
          return {
            success: false,
            message: `WebDAV备份不存在: ${backupId}`
          };
        }

        // 导入数据
        let success: boolean;
        let restoredData: any;
        
        if (options?.selective && options.dataKeys && options.dataKeys.length > 0) {
          // 选择性恢复
          success = await this.performSelectiveRestore(backupData, options.dataKeys);
          restoredData = options.dataKeys;
        } else {
          // 完整恢复
          success = dataPersistenceManager.importData(backupData);
        }
        
        if (success) {
          console.log(`从WebDAV备份恢复成功: ${backupId}`);
          return {
            success: true,
            restoredData,
            message: `从WebDAV备份恢复成功: ${backupId}`
          };
        } else {
          return {
            success: false,
            message: `数据导入失败: ${backupId}`
          };
        }
      } catch (error) {
        console.error(`从WebDAV备份恢复失败: ${backupId}`, error);
        return {
          success: false,
          message: `从WebDAV备份恢复失败: ${(error as Error).message}`
        };
      }
    }
  }

  /**
   * 选择性恢复数据
   */
  private async performSelectiveRestore(backupData: string, dataKeys: string[]): Promise<boolean> {
    try {
      // 解析备份数据
      const parsedData = JSON.parse(backupData);
      
      // 提取需要恢复的数据
      const selectiveData: any = {};
      dataKeys.forEach(key => {
        if (parsedData[key] !== undefined) {
          selectiveData[key] = parsedData[key];
        }
      });
      
      if (Object.keys(selectiveData).length === 0) {
        console.warn('没有找到要恢复的数据键');
        return false;
      }
      
      // 导入选择性数据
      return dataPersistenceManager.importData(JSON.stringify(selectiveData));
    } catch (error) {
      console.error('选择性恢复失败:', error);
      return false;
    }
  }

  /**
   * 跨设备恢复备份
   */
  async restoreFromAnotherDevice(backupId: string, deviceId: string): Promise<{ success: boolean; message: string }> {
    try {
      // 这里实现跨设备恢复逻辑
      // 简化实现：从云端备份中查找特定设备的备份
      console.log(`从设备 ${deviceId} 恢复备份 ${backupId}`);
      
      // 确保WebDAV已初始化
      await this.ensureInitialized();
      if (!this.enhancedWebDAVBackup) {
        return {
          success: false,
          message: '增强版WebDAV备份未初始化'
        };
      }
      
      // 下载指定设备的备份
      const backupData = await this.enhancedWebDAVBackup.downloadBackup(`${deviceId}-${backupId}`);
      if (!backupData) {
        return {
          success: false,
          message: `设备 ${deviceId} 的备份 ${backupId} 不存在`
        };
      }
      
      // 导入数据
      const success = dataPersistenceManager.importData(backupData);
      
      if (success) {
        console.log(`从设备 ${deviceId} 恢复备份成功: ${backupId}`);
        return {
          success: true,
          message: `从设备 ${deviceId} 恢复备份成功: ${backupId}`
        };
      } else {
        return {
          success: false,
          message: `数据导入失败`
        };
      }
    } catch (error) {
      console.error(`跨设备恢复失败: ${backupId} from ${deviceId}`, error);
      return {
        success: false,
        message: `跨设备恢复失败: ${(error as Error).message}`
      };
    }
  }

  /**
   * 获取可用的恢复选项
   */
  async getRestoreOptions(backupId: string, type: 'local' | 'cloud'): Promise<{ available: boolean; dataKeys?: string[]; backupInfo?: any }> {
    try {
      let backupData: string;
      
      if (type === 'local') {
        const backupKey = `backup_${backupId}`;
        const backupDataItem = dataPersistenceManager.getItem(backupKey);
        if (!backupDataItem || !backupDataItem.data) {
          return { available: false };
        }
        backupData = backupDataItem.data;
      } else {
        await this.ensureInitialized();
        if (!this.enhancedWebDAVBackup) {
          return { available: false };
        }
        const cloudBackupData = await this.enhancedWebDAVBackup.downloadBackup(backupId);
        if (!cloudBackupData) {
          return { available: false };
        }
        backupData = cloudBackupData;
      }
      
      // 解析备份数据以获取可用的数据键
      const parsedData = JSON.parse(backupData);
      const dataKeys = Object.keys(parsedData);
      
      return {
        available: true,
        dataKeys,
        backupInfo: {
          size: new Blob([backupData]).size,
          timestamp: Date.now(),
          dataKeysCount: dataKeys.length
        }
      };
    } catch (error) {
      console.error('获取恢复选项失败:', error);
      return { available: false };
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
      } else if (type === 'cloud') {
        // 删除云端备份
        if (this.config.cloudBackupProvider === 'baidu' && this.config.baiduNetdiskEnabled && this.baiduNetdiskBackup) {
          // 删除百度网盘备份
          await this.baiduNetdiskBackup.deleteBackup(backupId);
        } else if (this.webDAVBackup || this.enhancedWebDAVBackup) {
          // 删除WebDAV备份（优先使用增强版）
          if (this.enhancedWebDAVBackup) {
            await this.enhancedWebDAVBackup.deleteBackup(backupId);
          } else {
            await this.webDAVBackup!.deleteBackup(backupId);
          }
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
    await this.ensureInitialized();
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
    if (this.config.cloudBackupProvider === 'baidu' && this.config.baiduNetdiskEnabled && this.baiduNetdiskBackup) {
      // 获取百度网盘备份列表
      return await this.baiduNetdiskBackup.getBackupList();
    } else if (this.enhancedWebDAVBackup) {
      // 获取WebDAV备份列表
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
    if (this.config.cloudBackupProvider === 'baidu' && this.config.baiduNetdiskEnabled && this.baiduNetdiskBackup) {
      // 获取百度网盘备份统计信息
      const backupList = await this.baiduNetdiskBackup.getBackupList();
      const totalBackups = backupList.length;
      const totalSize = backupList.reduce((sum, backup) => sum + backup.size, 0);
      const lastBackupDate = backupList.length > 0 ? backupList[0].timestamp : undefined;
      
      return {
        totalBackups,
        totalSize,
        lastBackupDate
      };
    } else if (this.enhancedWebDAVBackup) {
      // 获取WebDAV备份统计信息
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
   * 验证备份完整性
   */
  async verifyBackupIntegrity(backupId: string, type: 'local' | 'cloud'): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      if (type === 'local') {
        // 验证本地备份
        const backupKey = `backup_${backupId}`;
        const backupData = dataPersistenceManager.getItem(backupKey);
        
        if (!backupData || !backupData.data) {
          return {
            success: false,
            message: `备份 ${backupId} 不存在或损坏`
          };
        }
        
        // 检查数据格式是否正确
        try {
          const parsedData = JSON.parse(backupData.data);
          return {
            success: true,
            message: `备份 ${backupId} 完整性检查通过`,
            details: {
              size: backupData.size,
              timestamp: backupData.timestamp,
              isIncremental: backupData.isIncremental || false
            }
          };
        } catch (parseError) {
          return {
            success: false,
            message: `备份 ${backupId} 数据格式错误`,
            details: { error: parseError.message }
          };
        }
      } else if (type === 'cloud') {
        // 验证云端备份
        if (this.config.cloudBackupProvider === 'baidu' && this.config.baiduNetdiskEnabled && this.baiduNetdiskBackup) {
          // 验证百度网盘备份
          try {
            const backupData = await this.baiduNetdiskBackup.downloadBackup(backupId);
            if (!backupData) {
              return {
                success: false,
                message: `百度网盘备份 ${backupId} 不存在`
              };
            }
            
            // 检查数据格式
            try {
              JSON.parse(backupData);
              return {
                success: true,
                message: `百度网盘备份 ${backupId} 完整性检查通过`
              };
            } catch (parseError) {
              return {
                success: false,
                message: `百度网盘备份 ${backupId} 数据格式错误`,
                details: { error: parseError.message }
              };
            }
          } catch (error) {
            return {
              success: false,
              message: `验证百度网盘备份 ${backupId} 失败`,
              details: { error: (error as Error).message }
            };
          }
        } else if (this.enhancedWebDAVBackup) {
          // 验证WebDAV备份
          try {
            const backupData = await this.enhancedWebDAVBackup.downloadBackup(backupId);
            if (!backupData) {
              return {
                success: false,
                message: `WebDAV备份 ${backupId} 不存在`
              };
            }
            
            // 检查数据格式
            try {
              JSON.parse(backupData);
              return {
                success: true,
                message: `WebDAV备份 ${backupId} 完整性检查通过`
              };
            } catch (parseError) {
              return {
                success: false,
                message: `WebDAV备份 ${backupId} 数据格式错误`,
                details: { error: parseError.message }
              };
            }
          } catch (error) {
            return {
              success: false,
              message: `验证WebDAV备份 ${backupId} 失败`,
              details: { error: (error as Error).message }
            };
          }
        } else {
          return {
            success: false,
            message: '云端备份未初始化'
          };
        }
      }
      
      return {
        success: false,
        message: '不支持的备份类型'
      };
    } catch (error) {
      return {
        success: false,
        message: `验证备份时发生错误`,
        details: { error: (error as Error).message }
      };
    }
  }

  /**
   * 生成备份系统健康报告
   */
  async generateHealthReport(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    timestamp: Date;
    summaries: {
      totalBackups: number;
      successfulBackups: number;
      failedBackups: number;
      lastBackupDate?: Date;
      oldestBackupDate?: Date;
    };
    details: {
      localBackups: {
        count: number;
        lastBackupDate?: Date;
        healthStatus: 'healthy' | 'warning' | 'critical';
        issues: string[];
      };
      cloudBackups: {
        count: number;
        lastBackupDate?: Date;
        healthStatus: 'healthy' | 'warning' | 'critical';
        issues: string[];
      };
      hybridBackups: {
        count: number;
        lastBackupDate?: Date;
        healthStatus: 'healthy' | 'warning' | 'critical';
        issues: string[];
      };
    };
    recommendations: string[];
  }> {
    try {
      const backupInfos = this.getBackupList();
      const now = new Date();
      const dayInMs = 24 * 60 * 60 * 1000;
      
      // 计算基本统计
      const totalBackups = backupInfos.length;
      const successfulBackups = backupInfos.filter(b => b.status === 'success').length;
      const failedBackups = backupInfos.filter(b => b.status === 'failed').length;
      
      // 计算最近和最旧的备份日期
      let lastBackupDate: Date | undefined;
      let oldestBackupDate: Date | undefined;
      
      if (backupInfos.length > 0) {
        const sortedBackups = [...backupInfos].sort((a, b) => b.timestamp - a.timestamp);
        lastBackupDate = new Date(sortedBackups[0].timestamp);
        oldestBackupDate = new Date(sortedBackups[sortedBackups.length - 1].timestamp);
      }
      
      // 分析本地备份
      const localBackups = backupInfos.filter(b => b.type === 'local');
      const localIssues: string[] = [];
      let localHealthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (localBackups.length === 0) {
        localHealthStatus = 'critical';
        localIssues.push('没有本地备份');
      } else {
        const lastLocalBackup = localBackups.sort((a, b) => b.timestamp - a.timestamp)[0];
        const daysSinceLastLocal = (now.getTime() - lastLocalBackup.timestamp) / dayInMs;
        
        if (daysSinceLastLocal > 7) {
          localHealthStatus = 'critical';
          localIssues.push(`本地备份已超过 ${Math.round(daysSinceLastLocal)} 天`);
        } else if (daysSinceLastLocal > 3) {
          localHealthStatus = 'warning';
          localIssues.push(`本地备份已超过 ${Math.round(daysSinceLastLocal)} 天`);
        }
        
        // 检查本地备份失败率
        const failedLocalBackups = localBackups.filter(b => b.status === 'failed').length;
        if (failedLocalBackups > 0 && failedLocalBackups / localBackups.length > 0.3) {
          localHealthStatus = 'warning';
          localIssues.push(`本地备份失败率较高: ${Math.round((failedLocalBackups / localBackups.length) * 100)}%`);
        }
      }
      
      // 分析云端备份
      const cloudBackups = backupInfos.filter(b => b.type === 'cloud');
      const cloudIssues: string[] = [];
      let cloudHealthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (cloudBackups.length === 0) {
        cloudHealthStatus = 'warning';
        cloudIssues.push('没有云端备份');
      } else {
        const lastCloudBackup = cloudBackups.sort((a, b) => b.timestamp - a.timestamp)[0];
        const daysSinceLastCloud = (now.getTime() - lastCloudBackup.timestamp) / dayInMs;
        
        if (daysSinceLastCloud > 7) {
          cloudHealthStatus = 'critical';
          cloudIssues.push(`云端备份已超过 ${Math.round(daysSinceLastCloud)} 天`);
        } else if (daysSinceLastCloud > 3) {
          cloudHealthStatus = 'warning';
          cloudIssues.push(`云端备份已超过 ${Math.round(daysSinceLastCloud)} 天`);
        }
        
        // 检查云端备份失败率
        const failedCloudBackups = cloudBackups.filter(b => b.status === 'failed').length;
        if (failedCloudBackups > 0 && failedCloudBackups / cloudBackups.length > 0.3) {
          cloudHealthStatus = 'warning';
          cloudIssues.push(`云端备份失败率较高: ${Math.round((failedCloudBackups / cloudBackups.length) * 100)}%`);
        }
      }
      
      // 分析混合备份
      const hybridBackups = backupInfos.filter(b => b.type === 'hybrid');
      const hybridIssues: string[] = [];
      let hybridHealthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (hybridBackups.length === 0) {
        hybridHealthStatus = 'warning';
        hybridIssues.push('没有混合备份');
      } else {
        const lastHybridBackup = hybridBackups.sort((a, b) => b.timestamp - a.timestamp)[0];
        const daysSinceLastHybrid = (now.getTime() - lastHybridBackup.timestamp) / dayInMs;
        
        if (daysSinceLastHybrid > 7) {
          hybridHealthStatus = 'critical';
          hybridIssues.push(`混合备份已超过 ${Math.round(daysSinceLastHybrid)} 天`);
        } else if (daysSinceLastHybrid > 3) {
          hybridHealthStatus = 'warning';
          hybridIssues.push(`混合备份已超过 ${Math.round(daysSinceLastHybrid)} 天`);
        }
      }
      
      // 生成建议
      const recommendations: string[] = [];
      
      if (localHealthStatus === 'critical') {
        recommendations.push('立即创建本地备份');
      }
      
      if (cloudHealthStatus === 'critical') {
        recommendations.push('检查WebDAV配置并创建云端备份');
      }
      
      if (failedBackups > 0) {
        recommendations.push('检查备份失败原因并修复');
      }
      
      if (backupInfos.length > this.config.retentionDays! * 2) {
        recommendations.push('考虑清理过期备份以节省存储空间');
      }
      
      // 确定整体状态
      let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (localHealthStatus === 'critical' || cloudHealthStatus === 'critical') {
        overallStatus = 'critical';
      } else if (localHealthStatus === 'warning' || cloudHealthStatus === 'warning' || hybridHealthStatus === 'warning') {
        overallStatus = 'warning';
      }
      
      return {
        status: overallStatus,
        timestamp: now,
        summaries: {
          totalBackups,
          successfulBackups,
          failedBackups,
          lastBackupDate,
          oldestBackupDate
        },
        details: {
          localBackups: {
            count: localBackups.length,
            lastBackupDate: localBackups.length > 0 ? new Date(localBackups.sort((a, b) => b.timestamp - a.timestamp)[0].timestamp) : undefined,
            healthStatus: localHealthStatus,
            issues: localIssues
          },
          cloudBackups: {
            count: cloudBackups.length,
            lastBackupDate: cloudBackups.length > 0 ? new Date(cloudBackups.sort((a, b) => b.timestamp - a.timestamp)[0].timestamp) : undefined,
            healthStatus: cloudHealthStatus,
            issues: cloudIssues
          },
          hybridBackups: {
            count: hybridBackups.length,
            lastBackupDate: hybridBackups.length > 0 ? new Date(hybridBackups.sort((a, b) => b.timestamp - a.timestamp)[0].timestamp) : undefined,
            healthStatus: hybridHealthStatus,
            issues: hybridIssues
          }
        },
        recommendations
      };
    } catch (error) {
      console.error('生成健康报告时发生错误:', error);
      return {
        status: 'critical',
        timestamp: new Date(),
        summaries: {
          totalBackups: 0,
          successfulBackups: 0,
          failedBackups: 0
        },
        details: {
          localBackups: {
            count: 0,
            healthStatus: 'critical',
            issues: ['无法获取本地备份信息']
          },
          cloudBackups: {
            count: 0,
            healthStatus: 'critical',
            issues: ['无法获取云端备份信息']
          },
          hybridBackups: {
            count: 0,
            healthStatus: 'critical',
            issues: ['无法获取混合备份信息']
          }
        },
        recommendations: ['检查备份系统配置和权限']
      };
    }
  }

  /**
   * 创建混合备份（同时执行本地和云端备份）
   */
  async createHybridBackup(backupName?: string): Promise<HybridBackupInfo> {
    const correlationId = `hybrid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    const backupId = backupName || `hybrid-backup-${timestamp}`;
    
    let localBackup: BackupInfo;
    let cloudBackup: BackupInfo;
    let overallStatus: 'success' | 'partial' | 'failed' = 'failed';
    
    try {
      // 首先执行本地备份
      console.log('开始混合备份的本地部分...');
      localBackup = await this.createLocalBackup(`${backupId}-local`);
      
      // 然后执行云端备份
      console.log('开始混合备份的云端部分...');
      cloudBackup = await this.createCloudBackup(`${backupId}-cloud`);
      
      // 检查两个备份的状态
      if (localBackup.status === 'success' && cloudBackup.status === 'success') {
        overallStatus = 'success';
      } else if (localBackup.status === 'success' || cloudBackup.status === 'success') {
        overallStatus = 'partial';
      }
      
      console.log(`混合备份完成，状态: ${overallStatus}`);
    } catch (error) {
      console.error('混合备份失败:', error);
      
      // 创建失败的备份信息
      localBackup = {
        id: `${backupId}-local`,
        timestamp,
        size: 0,
        type: 'local',
        status: 'failed'
      };
      
      cloudBackup = {
        id: `${backupId}-cloud`,
        timestamp,
        size: 0,
        type: 'cloud',
        status: 'failed'
      };
      
      // 保存失败的备份信息
      this.saveBackupInfo(localBackup);
      this.saveBackupInfo(cloudBackup);
    }
    
    // 创建混合备份信息
    const hybridBackupInfo: HybridBackupInfo = {
      localBackup,
      cloudBackup,
      correlationId,
      status: overallStatus
    };
    
    // 保存混合备份信息到本地存储
    try {
      const hybridBackups = dataPersistenceManager.getItem('hybrid_backups') || [];
      hybridBackups.push(hybridBackupInfo);
      
      // 限制混合备份信息数量，只保留最近的50个
      const limitedHybridBackups = hybridBackups.slice(0, 50);
      dataPersistenceManager.setItem('hybrid_backups', limitedHybridBackups);
    } catch (error) {
      console.error('保存混合备份信息失败:', error);
    }
    
    return hybridBackupInfo;
  }

  /**
   * 手动触发备份
   */
  async createManualBackup(options?: { name?: string, local?: boolean, cloud?: boolean, hybrid?: boolean }): Promise<{ local?: BackupInfo, cloud?: BackupInfo, hybrid?: HybridBackupInfo }> {
    const result: { local?: BackupInfo, cloud?: BackupInfo, hybrid?: HybridBackupInfo } = {};
    
    const backupName = options?.name || `manual-backup-${Date.now()}`;
    
    // 检查是否执行混合备份
    if (options?.hybrid && this.config.hybridBackup && (this.webDAVBackup || this.enhancedWebDAVBackup)) {
      result.hybrid = await this.createHybridBackup(backupName + '-hybrid');
    } else {
      if (options?.local !== false && this.config.localAutoBackup) {
        result.local = await this.createLocalBackup(backupName + '-local');
      }
      
      if (options?.cloud !== false && this.config.cloudAutoBackup && (this.webDAVBackup || this.enhancedWebDAVBackup)) {
        result.cloud = await this.createCloudBackup(backupName + '-cloud');
      }
    }
    
    return result;
  }

  /**
   * 查找最新的完整备份
   */
  private findLatestFullBackup(type: 'local' | 'cloud'): BackupInfo | null {
    const backupInfos = this.getBackupList();
    const fullBackups = backupInfos.filter(backup => 
      backup.type === type && 
      (backup.strategy === 'full' || !backup.strategy) && 
      backup.status === 'success'
    );
    
    if (fullBackups.length === 0) {
      return null;
    }
    
    // 按时间倒序排列，返回最新的
    fullBackups.sort((a, b) => b.timestamp - a.timestamp);
    return fullBackups[0];
  }

  /**
   * 创建增量备份
   */
  private async createIncrementalBackup(baseBackupId: string): Promise<string> {
    try {
      // 获取基础备份数据
      const baseBackupKey = `backup_${baseBackupId}`;
      const baseBackupData = dataPersistenceManager.getItem(baseBackupKey);
      
      if (!baseBackupData || !baseBackupData.data) {
        throw new Error(`基础备份 ${baseBackupId} 不存在或损坏`);
      }
      
      // 获取当前数据
      const currentData = dataPersistenceManager.exportAllData();
      
      // 计算差异（简化实现，实际应用中需要更复杂的差异算法）
      const incrementalData = {
        type: 'incremental',
        baseBackupId,
        timestamp: Date.now(),
        // 这里应该实现真正的差异计算
        // 简化处理：存储完整数据但标记为增量备份
        data: currentData
      };
      
      return JSON.stringify(incrementalData);
    } catch (error) {
      console.error('创建增量备份失败:', error);
      throw error;
    }
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