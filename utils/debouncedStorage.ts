/**
 * 防抖存储工具
 * 用于优化 localStorage 写入性能，避免频繁写入
 */

/**
 * 防抖存储类
 * 使用防抖机制延迟写入 localStorage，减少写入次数
 */
class DebouncedStorage {
  private pendingWrites: Map<string, { value: string; timer: NodeJS.Timeout | null }> = new Map();
  private delay: number;

  /**
   * 构造函数
   * @param delay 防抖延迟时间（毫秒），默认500ms
   */
  constructor(delay: number = 500) {
    this.delay = delay;
  }

  /**
   * 获取存储项
   * @param key 存储键
   * @returns 存储值或null
   */
  getItem(key: string): string | null {
    const pending = this.pendingWrites.get(key);
    if (pending) {
      return pending.value;
    }
    return localStorage.getItem(key);
  }

  /**
   * 设置存储项（带防抖）
   * @param key 存储键
   * @param value 存储值
   */
  setItem(key: string, value: string): void {
    const existing = this.pendingWrites.get(key);
    
    if (existing?.timer) {
      clearTimeout(existing.timer);
    }

    this.pendingWrites.set(key, {
      value,
      timer: setTimeout(() => {
        this.flushKey(key);
      }, this.delay)
    });
  }

  /**
   * 立即写入指定键
   * @param key 存储键
   */
  flushKey(key: string): void {
    const pending = this.pendingWrites.get(key);
    if (pending) {
      localStorage.setItem(key, pending.value);
      this.pendingWrites.delete(key);
    }
  }

  /**
   * 立即写入所有待写入的项
   */
  flushAll(): void {
    this.pendingWrites.forEach((_, key) => {
      this.flushKey(key);
    });
  }

  /**
   * 移除存储项
   * @param key 存储键
   */
  removeItem(key: string): void {
    const pending = this.pendingWrites.get(key);
    if (pending?.timer) {
      clearTimeout(pending.timer);
    }
    this.pendingWrites.delete(key);
    localStorage.removeItem(key);
  }

  /**
   * 清空所有存储
   */
  clear(): void {
    this.pendingWrites.forEach(({ timer }) => {
      if (timer) clearTimeout(timer);
    });
    this.pendingWrites.clear();
    localStorage.clear();
  }

  /**
   * 获取待写入项数量
   */
  getPendingCount(): number {
    return this.pendingWrites.size;
  }
}

/**
 * 创建防抖存储实例
 */
const debouncedStorage = new DebouncedStorage(500);

/**
 * 页面卸载时立即写入所有待写入项
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    debouncedStorage.flushAll();
  });

  /**
   * 页面隐藏时也立即写入（移动端场景）
   */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      debouncedStorage.flushAll();
    }
  });
}

export default debouncedStorage;
export { DebouncedStorage };
