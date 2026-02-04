import CryptoJS from 'crypto-js';

interface StorageConfig {
  encryptionKey?: string;
  version?: string;
  autoBackup?: boolean;
}

interface DataValidationResult {
  isValid: boolean;
  error?: string;
  data?: any;
}

class DataPersistenceManager {
  private readonly DEFAULT_ENCRYPTION_KEY = 'aes-life-game-default-key-2024';
  private readonly STORAGE_PREFIX = 'aes-data-v2-';
  private readonly METADATA_KEY = 'aes-metadata';
  
  private encryptionKey: string;
  private version: string;
  private autoBackup: boolean;
  
  constructor(config?: StorageConfig) {
    this.encryptionKey = config?.encryptionKey || this.DEFAULT_ENCRYPTION_KEY;
    this.version = config?.version || '1.0.0';
    this.autoBackup = config?.autoBackup ?? true;
  }

  /**
   * 安全存储数据 - 加密并添加元数据
   */
  setItem(key: string, data: any): void {
    try {
      // 创建带元数据的数据对象
      const dataWithMetadata = {
        data,
        metadata: {
          version: this.version,
          timestamp: Date.now(),
          key
        }
      };
      
      // 序列化数据
      const jsonString = JSON.stringify(dataWithMetadata);
      
      // 加密数据
      const encrypted = CryptoJS.AES.encrypt(jsonString, this.encryptionKey).toString();
      
      // 存储到localStorage
      localStorage.setItem(this.STORAGE_PREFIX + key, encrypted);
      
      // 更新元数据
      this.updateMetadata(key, dataWithMetadata.metadata);
      
    } catch (error) {
      console.error(`加密存储失败 (key: ${key}):`, error);
      // 如果加密失败，回退到普通存储
      localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify({ data, metadata: { version: this.version, timestamp: Date.now() } }));
    }
  }

  /**
   * 安全读取数据 - 解密并验证
   */
  getItem(key: string): any {
    try {
      const encryptedData = localStorage.getItem(this.STORAGE_PREFIX + key);
      if (!encryptedData) {
        return null;
      }

      // 解密数据
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey).toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        console.warn(`解密失败，尝试普通读取 (key: ${key})`);
        // 尝试作为普通数据读取（向后兼容）
        return this.getPlainItem(key);
      }
      
      // 解析数据
      const parsedData = JSON.parse(decrypted);
      return parsedData.data;
      
    } catch (error) {
      console.error(`解密读取失败 (key: ${key}):`, error);
      // 尝试作为普通数据读取（向后兼容）
      return this.getPlainItem(key);
    }
  }

  /**
   * 普通读取（向后兼容）
   */
  private getPlainItem(key: string): any {
    try {
      const rawData = localStorage.getItem(this.STORAGE_PREFIX + key);
      if (!rawData) return null;
      
      const parsedData = JSON.parse(rawData);
      return parsedData.data || parsedData; // 兼容旧格式
    } catch (error) {
      console.error(`普通读取失败 (key: ${key}):`, error);
      return null;
    }
  }

  /**
   * 删除数据
   */
  removeItem(key: string): void {
    localStorage.removeItem(this.STORAGE_PREFIX + key);
    this.removeMetadata(key);
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem(this.METADATA_KEY);
  }

  /**
   * 验证数据完整性
   */
  validateData(key: string, expectedSchema?: any): DataValidationResult {
    try {
      const data = this.getItem(key);
      if (data === null) {
        return { isValid: false, error: '数据不存在' };
      }

      // 如果提供了预期的schema，进行基本验证
      if (expectedSchema) {
        const validationResult = this.validateAgainstSchema(data, expectedSchema);
        if (!validationResult.isValid) {
          return validationResult;
        }
      }

      return { isValid: true, data };
    } catch (error) {
      return { isValid: false, error: (error as Error).message };
    }
  }

  /**
   * 验证数据是否符合预期的schema
   */
  private validateAgainstSchema(data: any, schema: any): DataValidationResult {
    try {
      // 简单的schema验证 - 检查必需字段是否存在
      if (typeof schema === 'object' && schema !== null) {
        for (const key in schema) {
          if (schema[key].required && !(key in data)) {
            return { isValid: false, error: `缺少必需字段: ${key}` };
          }
          
          if (data[key] !== undefined && typeof data[key] !== schema[key].type) {
            return { isValid: false, error: `字段 ${key} 类型不匹配，期望 ${schema[key].type}，实际 ${typeof data[key]}` };
          }
        }
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: (error as Error).message };
    }
  }

  /**
   * 更新元数据
   */
  private updateMetadata(key: string, metadata: any): void {
    try {
      const allMetadata = this.getAllMetadata();
      allMetadata[key] = metadata;
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(allMetadata));
    } catch (error) {
      console.error('更新元数据失败:', error);
    }
  }

  /**
   * 获取特定键的元数据
   */
  getMetadata(key: string): any {
    try {
      const allMetadata = this.getAllMetadata();
      return allMetadata[key] || null;
    } catch (error) {
      console.error('获取元数据失败:', error);
      return null;
    }
  }

  /**
   * 获取所有元数据
   */
  private getAllMetadata(): Record<string, any> {
    try {
      const metadataStr = localStorage.getItem(this.METADATA_KEY);
      return metadataStr ? JSON.parse(metadataStr) : {};
    } catch (error) {
      console.error('获取所有元数据失败:', error);
      return {};
    }
  }

  /**
   * 删除元数据
   */
  private removeMetadata(key: string): void {
    try {
      const allMetadata = this.getAllMetadata();
      delete allMetadata[key];
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(allMetadata));
    } catch (error) {
      console.error('删除元数据失败:', error);
    }
  }

  /**
   * 检查存储空间使用情况
   */
  getStorageUsage(): { used: number, total: number, percentage: number } {
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.STORAGE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([key + value]).size;
        }
      }
    }
    
    // localStorage 大约有 5-10MB 的限制，我们保守估计为 4MB
    const limit = 4 * 1024 * 1024; // 4MB in bytes
    const percentage = (totalSize / limit) * 100;
    
    return {
      used: totalSize,
      total: limit,
      percentage
    };
  }

  /**
   * 批量存储数据
   */
  batchSet(items: Array<{key: string, data: any}>): void {
    items.forEach(item => {
      this.setItem(item.key, item.data);
    });
  }

  /**
   * 批量读取数据
   */
  batchGet(keys: string[]): Array<{key: string, data: any}> {
    return keys.map(key => ({
      key,
      data: this.getItem(key)
    }));
  }

  /**
   * 检查是否支持localStorage
   */
  static isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * 导出所有数据（用于备份）
   * 包括DataPersistenceManager管理的数据和所有其他关键localStorage数据
   */
  exportAllData(): string {
    const data: Record<string, any> = {};
    
    // 导出DataPersistenceManager管理的数据
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.STORAGE_PREFIX)) {
        const actualKey = key.replace(this.STORAGE_PREFIX, '');
        data[actualKey] = this.getItem(actualKey);
      }
    }
    
    // 导出所有其他关键localStorage数据
    const criticalKeys = [
      'aes-global-data-v3',
      'life-game-stats-v2',
      'aes-checkin-streak',
      'aes-dice-state',
      'aes-last-checkin-date',
      'aes-global-mantras',
      'aes-level-thresholds',
      'aes-focus-thresholds',
      'aes-wealth-thresholds',
      'aes-combat-thresholds',
      'claimedBadges',
      'life-game-weekly-checkin',
      'life-game-state-v2',
      'theme',
      'pomodoro-state',
      'life-game-habits',
      'life-game-today-stats',
      'life-game-habit-order',
      'life-game-last-date',
      'life-game-projects',
      'life-game-project-order',
      'aes-settings-v2',
      'localBackups',
      'life-game-bank',
      'life-game-inventory',
      'life-game-challenge-pool',
      'life-game-completed-random-tasks',
      'life-game-dice-history',
      'life-game-manifestation-progress',
      'life-game-sound-settings',
      'life-game-reminders',
      'life-game-achievements',
      'life-game-character-stats',
      'life-game-equipment',
      'life-game-skills',
      'life-game-spells',
      'life-game-quests',
      'life-game-world-state',
      'life-game-locations',
      'life-game-npcs',
      'life-game-events',
      'life-game-journal',
      'life-game-reputation',
      'life-game-faction-relationships',
      'life-game-resources',
      'life-game-recipes',
      'life-game-crafts',
      'life-game-trades',
      'life-game-battle-history',
      'life-game-pvp-stats',
      'life-game-tournament-stats',
      'life-game-leaderboard-data',
      'life-game-achievements-progress',
      'life-game-collections',
      'life-game-badges',
      'life-game-titles',
      'life-game-permissions',
      'life-game-notifications',
      'life-game-messages',
      'life-game-friends',
      'life-game-parties',
      'life-game-guilds',
      'life-game-alliances',
      'life-game-wars',
      'life-game-territories',
      'life-game-economy-data',
      'life-game-market-data',
      'life-game-weather-data',
      'life-game-calendar-events',
      'life-game-seasons',
      'life-game-holidays',
      'life-game-special-events',
      'life-game-announcements',
      'life-game-updates',
      'life-game-version-history',
      'life-game-feedback',
      'life-game-bug-reports',
      'life-game-suggestions',
      'life-game-feature-requests',
      'life-game-surveys',
      'life-game-analytics-data',
      'life-game-usage-stats',
      'life-game-performance-data',
      'life-game-error-logs',
      'life-game-debug-info',
      'life-game-system-info',
      'life-game-environment-info',
      'life-game-browser-info',
      'life-game-device-info',
      'life-game-network-info',
      'life-game-storage-info',
      'life-game-security-info',
      'life-game-privacy-info',
      'life-game-terms-acceptance',
      'life-game-privacy-acceptance',
      'life-game-cookies-acceptance',
      'life-game-notifications-acceptance',
      'life-game-marketing-acceptance',
      'life-game-analytics-acceptance',
      'life-game-data-sharing-acceptance',
      'life-game-age-verification',
      'life-game-account-verification',
      'life-game-email-verification',
      'life-game-phone-verification',
      'life-game-two-factor-auth',
      'life-game-password-recovery',
      'life-game-account-settings',
      'life-game-profile-settings',
      'life-game-game-settings',
      'life-game-audio-settings',
      'life-game-video-settings',
      'life-game-controls-settings',
      'life-game-accessibility-settings',
      'life-game-language-settings',
      'life-game-region-settings',
      'life-game-timezone-settings',
      'life-game-date-format-settings',
      'life-game-time-format-settings',
      'life-game-currency-settings',
      'life-game-measurement-settings',
      'life-game-theme-settings',
      'life-game-ui-settings',
      'life-game-hud-settings',
      'life-game-minimap-settings',
      'life-game-quest-log-settings',
      'life-game-inventory-settings',
      'life-game-skills-settings',
      'life-game-spells-settings',
      'life-game-character-sheet-settings',
      'life-game-social-settings',
      'life-game-chat-settings',
      'life-game-guild-settings',
      'life-game-party-settings',
      'life-game-trade-settings',
      'life-game-market-settings',
      'life-game-bank-settings',
      'life-game-housing-settings',
      'life-game-crafting-settings',
      'life-game-gathering-settings',
      'life-game-combat-settings',
      'life-game-pvp-settings',
      'life-game-tournament-settings',
      'life-game-leaderboard-settings',
      'life-game-achievement-settings',
      'life-game-collection-settings',
      'life-game-badge-settings',
      'life-game-title-settings',
      'life-game-reputation-settings',
      'life-game-faction-settings',
      'life-game-quest-settings',
      'life-game-world-settings',
      'life-game-location-settings',
      'life-game-npc-settings',
      'life-game-event-settings',
      'life-game-journal-settings',
      'life-game-calendar-settings',
      'life-game-season-settings',
      'life-game-holiday-settings',
      'life-game-special-event-settings',
      'life-game-announcement-settings',
      'life-game-update-settings',
      'life-game-feedback-settings',
      'life-game-bug-report-settings',
      'life-game-suggestion-settings',
      'life-game-feature-request-settings',
      'life-game-survey-settings',
      'life-game-analytics-settings',
      'life-game-usage-stats-settings',
      'life-game-performance-settings',
      'life-game-error-log-settings',
      'life-game-debug-settings',
      'life-game-system-settings',
      'life-game-environment-settings',
      'life-game-browser-settings',
      'life-game-device-settings',
      'life-game-network-settings',
      'life-game-storage-settings',
      'life-game-security-settings',
      'life-game-privacy-settings',
      'life-game-terms-settings',
      'life-game-cookies-settings',
      'life-game-notifications-settings',
      'life-game-marketing-settings',
      'life-game-data-sharing-settings',
      'life-game-age-verification-settings',
      'life-game-account-verification-settings',
      'life-game-email-verification-settings',
      'life-game-phone-verification-settings',
      'life-game-two-factor-auth-settings',
      'life-game-password-recovery-settings',
      'projects',
      'habits',
      'habitOrder',
      'projectOrder',
    ];
    
    for (const key of criticalKeys) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try {
          // 尝试解析JSON，如果失败则直接存储原始字符串
          data[key] = JSON.parse(value);
        } catch (e) {
          // 如果不是有效的JSON，则存储原始字符串
          data[key] = value;
        }
      }
    }
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * 导入数据（用于恢复）
   */
  importData(dataString: string): boolean {
    try {
      const data = JSON.parse(dataString);
      
      for (const key in data) {
        // 检查是否为DataPersistenceManager管理的数据
        if (this.isCriticalDataKey(key)) {
          // 对于关键数据键，直接使用localStorage存储
          localStorage.setItem(key, typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]));
        } else {
          // 对于DataPersistenceManager管理的数据，使用setItem方法
          this.setItem(key, data[key]);
        }
      }
      
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }

  /**
   * 检查是否为关键数据键
   */
  private isCriticalDataKey(key: string): boolean {
    const criticalKeys = [
      'aes-global-data-v3',
      'life-game-stats-v2',
      'aes-checkin-streak',
      'aes-dice-state',
      'aes-last-checkin-date',
      'aes-global-mantras',
      'aes-level-thresholds',
      'aes-focus-thresholds',
      'aes-wealth-thresholds',
      'aes-combat-thresholds',
      'claimedBadges',
      'life-game-weekly-checkin',
      'life-game-state-v2',
      'theme',
      'pomodoro-state',
      'life-game-habits',
      'life-game-today-stats',
      'life-game-habit-order',
      'life-game-last-date',
      'life-game-projects',
      'life-game-project-order',
      'aes-settings-v2',
      // 添加更多关键存储键...
    ];
    
    return criticalKeys.includes(key);
  }
}

// 创建单例实例
const dataPersistenceManager = new DataPersistenceManager({
  encryptionKey: 'aes-life-game-secure-key-2024',
  version: '2.0.0',
  autoBackup: true
});

export default dataPersistenceManager;
export { DataPersistenceManager, type StorageConfig, type DataValidationResult };