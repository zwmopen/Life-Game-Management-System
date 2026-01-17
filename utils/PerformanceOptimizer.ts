import { memo, useMemo, useCallback } from 'react';

/**
 * 性能优化工具集
 * 提供一系列性能优化工具和方法
 */

// FPS监控器
class FPSMonitor {
  private frameCount: number = 0;
  private lastTime: number | null = null;
  private fps: number = 0;
  private callbacks: Array<(fps: number) => void> = [];

  start(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.update();
  }

  private update = (): void => {
    this.frameCount++;
    const currentTime = performance.now();

    if (currentTime >= (this.lastTime || 0) + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - (this.lastTime || 0)));
      this.frameCount = 0;
      this.lastTime = currentTime;

      // 通知所有回调
      this.callbacks.forEach(callback => callback(this.fps));
    }

    requestAnimationFrame(this.update);
  };

  subscribe(callback: (fps: number) => void): () => void {
    this.callbacks.push(callback);
    
    // 返回取消订阅函数
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  getFPS(): number {
    return this.fps;
  }
}

// 内存使用监控器
class MemoryMonitor {
  private isSupported: boolean;
  
  constructor() {
    // 检查浏览器是否支持内存监控
    this.isSupported = typeof performance !== 'undefined' && 
                     // @ts-ignore - performance.memory is non-standard API
                     performance.memory && 
                     // @ts-ignore
                     typeof performance.memory.usedJSHeapSize !== 'undefined';
  }
  
  getMemoryInfo(): { used: number; total: number; percentage: number; limit: number } | null {
    if (!this.isSupported) {
      return null;
    }
    
    try {
      // @ts-ignore - 只在支持的浏览器中可用
      const mem = performance.memory;
      return {
        used: mem.usedJSHeapSize,
        total: mem.totalJSHeapSize,
        limit: mem.jsHeapSizeLimit,
        percentage: (mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100
      };
    } catch (error) {
      console.warn('[Memory Monitor] Failed to get memory info:', error);
      return null;
    }
  }

  isMemoryHigh(): boolean {
    const memInfo = this.getMemoryInfo();
    if (memInfo) {
      return memInfo.percentage > 80; // 内存使用超过80%认为过高
    }
    return false;
  }
  
  getMemoryUsageString(): string {
    const memInfo = this.getMemoryInfo();
    if (memInfo) {
      return `${(memInfo.used / 1024 / 1024).toFixed(2)}MB / ${(memInfo.limit / 1024 / 1024).toFixed(2)}MB (${memInfo.percentage.toFixed(2)}%)`;
    }
    return 'N/A';
  }
}

// 虚拟滚动实用程序
class VirtualScrollUtils {
  static calculateVisibleItems(
    scrollTop: number,
    containerHeight: number,
    itemHeight: number,
    totalCount: number,
    overscan: number = 5
  ): { start: number; end: number; offset: number } {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(totalCount - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
    const offset = startIndex * itemHeight;

    return { start: startIndex, end: endIndex, offset };
  }
}

// 防抖工具
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// 节流工具
const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// 缓存工具
class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  set(key: string, data: any, ttl: number = 300000): void { // 默认5分钟过期
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }

  remove(key: string): void {
    this.cache.delete(key);
  }

  cleanExpired(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// 深度比较工具（用于React.memo优化）
const deepEqual = (objA: any, objB: any): boolean => {
  if (objA === objB) return true;
  
  if (!objA || !objB || typeof objA !== 'object' || typeof objB !== 'object') {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(objA[key], objB[key])) return false;
  }

  return true;
};

// 优化的memo函数
const optimizedMemo = <T>(
  component: T,
  propsAreEqual?: (prevProps: Readonly<any>, nextProps: Readonly<any>) => boolean
): T => {
  return memo(component, propsAreEqual || deepEqual);
};

// 图片懒加载工具
class ImageLazyLoader {
  private observer: IntersectionObserver | null = null;
  private imageMap: WeakMap<HTMLImageElement, string> = new WeakMap();

  constructor() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = this.imageMap.get(img);
          if (src) {
            img.src = src;
            this.observer?.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px' // 提前50px开始加载
    });
  }

  observe(img: HTMLImageElement, src: string): void {
    this.imageMap.set(img, src);
    this.observer?.observe(img);
  }

  disconnect(): void {
    this.observer?.disconnect();
  }
}

// 批量操作优化器
class BatchProcessor {
  private tasks: Array<() => void> = [];
  private scheduled: boolean = false;

  add(task: () => void): void {
    this.tasks.push(task);
    
    if (!this.scheduled) {
      this.scheduled = true;
      // 使用 requestIdleCallback 或 setTimeout 来批量处理
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => this.process());
      } else {
        setTimeout(() => this.process(), 1);
      }
    }
  }

  private process(): void {
    // 执行所有待处理的任务
    while (this.tasks.length > 0) {
      const task = this.tasks.shift();
      if (task) {
        task();
      }
    }
    this.scheduled = false;
  }

  clear(): void {
    this.tasks = [];
    this.scheduled = false;
  }
}

// 性能优化工具集合
const PerformanceOptimizer = {
  FPSMonitor: new FPSMonitor(),
  MemoryMonitor: new MemoryMonitor(),
  VirtualScrollUtils,
  debounce,
  throttle,
  CacheManager: new CacheManager(),
  deepEqual,
  optimizedMemo,
  ImageLazyLoader: new ImageLazyLoader(),
  BatchProcessor: new BatchProcessor()
};

export default PerformanceOptimizer;
export {
  FPSMonitor,
  MemoryMonitor,
  VirtualScrollUtils,
  debounce,
  throttle,
  CacheManager,
  deepEqual,
  optimizedMemo,
  ImageLazyLoader,
  BatchProcessor
};