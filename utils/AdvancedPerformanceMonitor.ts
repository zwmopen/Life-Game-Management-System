import { useState, useEffect, useRef, useCallback } from 'react';

interface PerformanceSample {
  name: string;
  duration: number;
  timestamp: number;
  context?: Record<string, any>;
}

class AdvancedPerformanceMonitor {
  private samples: PerformanceSample[] = [];
  private maxSamples = 500;
  private enabled = process.env.NODE_ENV === 'development';
  private observers: Array<(sample: PerformanceSample) => void> = [];

  /**
   * 记录性能样本
   */
  recordSample(name: string, duration: number, context?: Record<string, any>) {
    if (!this.enabled) return;

    const sample: PerformanceSample = {
      name,
      duration,
      timestamp: Date.now(),
      context
    };

    this.samples.push(sample);

    // 保持样本数量在限制范围内
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }

    // 通知观察者
    this.observers.forEach(observer => observer(sample));
  }

  /**
   * 测量函数执行时间
   */
  async measure<T>(
    name: string,
    fn: () => T | Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordSample(name, duration, context);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordSample(`${name} (error)`, duration, { ...context, error: error.message });
      throw error;
    }
  }

  /**
   * 测量异步操作
   */
  async measureAsync<T>(
    name: string,
    asyncFn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await asyncFn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordSample(name, duration, context);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordSample(`${name} (error)`, duration, { ...context, error: error.message });
      throw error;
    }
  }

  /**
   * 监听性能样本
   */
  subscribe(observer: (sample: PerformanceSample) => void): () => void {
    this.observers.push(observer);
    
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * 获取性能统计
   */
  getStats() {
    if (this.samples.length === 0) {
      return {
        totalSamples: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        percentile95: 0
      };
    }

    const durations = [...this.samples].map(s => s.duration).sort((a, b) => a - b);
    const total = durations.reduce((sum, dur) => sum + dur, 0);
    const average = total / durations.length;
    const min = durations[0];
    const max = durations[durations.length - 1];
    
    // Calculate 95th percentile
    const percentile95Index = Math.floor(durations.length * 0.95);
    const percentile95 = durations[percentile95Index];

    return {
      totalSamples: this.samples.length,
      averageDuration: average,
      minDuration: min,
      maxDuration: max,
      percentile95
    };
  }

  /**
   * 获取最近的性能样本
   */
  getRecentSamples(limit: number = 50): PerformanceSample[] {
    return [...this.samples].slice(-limit);
  }

  /**
   * 清除所有样本
   */
  clear() {
    this.samples = [];
  }

  /**
   * 启用/禁用监控
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * 导出性能数据
   */
  exportData(): string {
    return JSON.stringify({
      samples: this.samples,
      stats: this.getStats()
    }, null, 2);
  }

  /**
   * 打印性能摘要
   */
  printSummary() {
    const stats = this.getStats();
    console.group('🚀 Advanced Performance Summary');
    console.log('Total Samples:', stats.totalSamples);
    console.log('Average Duration:', `${stats.averageDuration.toFixed(2)}ms`);
    console.log('Min Duration:', `${stats.minDuration.toFixed(2)}ms`);
    console.log('Max Duration:', `${stats.maxDuration.toFixed(2)}ms`);
    console.log('95th Percentile:', `${stats.percentile95.toFixed(2)}ms`);
    
    if (stats.totalSamples > 0) {
      const slowSamples = this.samples
        .filter(s => s.duration > 16.67) // Slower than 60fps
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5);
      
      if (slowSamples.length > 0) {
        console.group('🐢 Slowest Operations (>16.67ms)');
        slowSamples.forEach((sample, index) => {
          console.log(
            `${index + 1}. ${sample.name}: ${sample.duration.toFixed(2)}ms`,
            sample.context ? sample.context : ''
          );
        });
        console.groupEnd();
      }
    }
    
    console.groupEnd();
  }
}

// 创建全局实例
export const advancedPerformanceMonitor = new AdvancedPerformanceMonitor();

// React Hook for performance monitoring
export const useAdvancedPerformance = () => {
  const [stats, setStats] = useState(() => advancedPerformanceMonitor.getStats());

  useEffect(() => {
    const unsubscribe = advancedPerformanceMonitor.subscribe(() => {
      setStats(advancedPerformanceMonitor.getStats());
    });

    return unsubscribe;
  }, []);

  const measure = useCallback((name: string, fn: () => any, context?: Record<string, any>) => {
    return advancedPerformanceMonitor.measure(name, fn, context);
  }, []);

  const measureAsync = useCallback((name: string, asyncFn: () => Promise<any>, context?: Record<string, any>) => {
    return advancedPerformanceMonitor.measureAsync(name, asyncFn, context);
  }, []);

  return {
    measure,
    measureAsync,
    stats,
    getRecentSamples: advancedPerformanceMonitor.getRecentSamples,
    printSummary: advancedPerformanceMonitor.printSummary,
    exportData: advancedPerformanceMonitor.exportData
  };
};

// Decorator for class methods
export function performanceDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const startTime = performance.now();
    const result = originalMethod.apply(this, args);
    
    // 如果是异步函数
    if (result instanceof Promise) {
      return result.then(resolvedResult => {
        const endTime = performance.now();
        advancedPerformanceMonitor.recordSample(
          `${target.constructor.name}.${propertyKey}`,
          endTime - startTime,
          { args: args.length <= 3 ? args : `Array(${args.length})` }
        );
        return resolvedResult;
      }).catch(error => {
        const endTime = performance.now();
        advancedPerformanceMonitor.recordSample(
          `${target.constructor.name}.${propertyKey} (error)`,
          endTime - startTime,
          { args: args.length <= 3 ? args : `Array(${args.length})`, error: error.message }
        );
        throw error;
      });
    } else {
      const endTime = performance.now();
      advancedPerformanceMonitor.recordSample(
        `${target.constructor.name}.${propertyKey}`,
        endTime - startTime,
        { args: args.length <= 3 ? args : `Array(${args.length})` }
      );
      return result;
    }
  };

  return descriptor;
}

// Higher-order function for wrapping functions
export const withPerformanceMonitoring = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return function (...args: Parameters<T>): ReturnType<T> {
    const startTime = performance.now();
    const result = fn.apply(this, args);
    
    if (result instanceof Promise) {
      return result.then(resolvedResult => {
        const endTime = performance.now();
        advancedPerformanceMonitor.recordSample(
          name,
          endTime - startTime,
          { args: args.length <= 3 ? args : `Array(${args.length})` }
        );
        return resolvedResult;
      }).catch(error => {
        const endTime = performance.now();
        advancedPerformanceMonitor.recordSample(
          `${name} (error)`,
          endTime - startTime,
          { args: args.length <= 3 ? args : `Array(${args.length})`, error: error.message }
        );
        throw error;
      }) as ReturnType<T>;
    } else {
      const endTime = performance.now();
      advancedPerformanceMonitor.recordSample(
        name,
        endTime - startTime,
        { args: args.length <= 3 ? args : `Array(${args.length})` }
      );
      return result as ReturnType<T>;
    }
  } as T;
};