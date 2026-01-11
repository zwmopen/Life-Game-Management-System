/**
 * 本地数据存储服务
 * 提供持久化存储功能，用于保存用户的游戏状态数据
 */

interface GameState {
  day: number;
  balance: number;
  xp: number;
  checkInStreak: number;
  focusSessionsCompleted: number;
  totalFocusTime: number; // 专注总时间（分钟）
  level: number;
  achievements: string[];
  habits: any[];
  projects: any[];
  transactions: any[];
  reviews: any[];
  settings: {
    pomodoroDuration: number;
    breakDuration: number;
    longBreakDuration: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    notificationEnabled: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

class LocalDataStore {
  private readonly STORAGE_KEY = 'life-game-state-v2';
  private readonly DEFAULT_STATE: GameState = {
    day: 1,
    balance: 0,
    xp: 0,
    checkInStreak: 0,
    focusSessionsCompleted: 0,
    totalFocusTime: 0,
    level: 1,
    achievements: [],
    habits: [],
    projects: [],
    transactions: [],
    reviews: [],
    settings: {
      pomodoroDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      autoStartBreaks: true,
      autoStartPomodoros: false,
      notificationEnabled: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  /**
   * 获取当前存储的游戏状态
   */
  getState(): GameState {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // 合并默认值以确保所有字段都存在
        return { ...this.DEFAULT_STATE, ...parsedData };
      }
      return this.DEFAULT_STATE;
    } catch (error) {
      console.error('Error loading game state from localStorage:', error);
      return this.DEFAULT_STATE;
    }
  }

  /**
   * 保存游戏状态到本地存储
   */
  setState(state: Partial<GameState>): void {
    try {
      const currentState = this.getState();
      const newState = { 
        ...currentState, 
        ...state, 
        updatedAt: new Date().toISOString() 
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving game state to localStorage:', error);
    }
  }

  /**
   * 更新特定字段
   */
  updateField<K extends keyof GameState>(key: K, value: GameState[K]): void {
    const currentState = this.getState();
    this.setState({ [key]: value });
  }

  /**
   * 批量更新多个字段
   */
  updateFields(updates: Partial<GameState>): void {
    this.setState(updates);
  }

  /**
   * 增加余额
   */
  addBalance(amount: number): void {
    const currentState = this.getState();
    const newBalance = Math.max(0, currentState.balance + amount);
    this.updateField('balance', newBalance);
  }

  /**
   * 增加经验值
   */
  addXP(amount: number): void {
    const currentState = this.getState();
    const newXp = Math.max(0, currentState.xp + amount);
    this.updateField('xp', newXp);
  }

  /**
   * 记录一次专注会话完成
   */
  recordFocusSession(minutes: number = 25): void {
    const currentState = this.getState();
    this.updateFields({
      focusSessionsCompleted: currentState.focusSessionsCompleted + 1,
      totalFocusTime: currentState.totalFocusTime + minutes,
      balance: currentState.balance + 10, // 完成专注会话奖励10金币
      xp: currentState.xp + 20 // 完成专注会话奖励20经验值
    });
  }

  /**
   * 重置所有数据（谨慎使用）
   */
  reset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * 检查是否有存档数据
   */
  hasSavedData(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * 导出当前数据
   */
  exportData(): string {
    const state = this.getState();
    return JSON.stringify(state, null, 2);
  }

  /**
   * 导入数据
   */
  importData(dataString: string): boolean {
    try {
      const importedData = JSON.parse(dataString);
      // 验证导入的数据结构
      if (this.isValidGameState(importedData)) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(importedData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing game state:', error);
      return false;
    }
  }

  /**
   * 验证游戏状态数据结构的有效性
   */
  private isValidGameState(data: any): data is GameState {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.day === 'number' &&
      typeof data.balance === 'number' &&
      typeof data.xp === 'number'
    );
  }

  /**
   * 获取存储大小信息
   */
  getStorageInfo(): { size: number, limit: number, percentage: number } {
    const data = localStorage.getItem(this.STORAGE_KEY) || '';
    const size = new Blob([data]).size;
    // localStorage 大约有 5-10MB 的限制，我们保守估计为 4MB
    const limit = 4 * 1024 * 1024; // 4MB in bytes
    const percentage = (size / limit) * 100;
    
    return {
      size,
      limit,
      percentage
    };
  }
}

// 创建全局实例
export const localDataStore = new LocalDataStore();

// 类型导出
export type { GameState };