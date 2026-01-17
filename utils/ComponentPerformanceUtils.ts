import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import PerformanceOptimizer from './PerformanceOptimizer';

/**
 * 性能优化的组件包装器
 * 使用深度比较来优化React.memo
 */
export const createOptimizedComponent = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  isEqual?: (prevProps: T, nextProps: T) => boolean
) => {
  return memo(Component, isEqual || PerformanceOptimizer.deepEqual);
};

/**
 * 优化的useMemo，带缓存失效机制
 */
export const useOptimizedMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  ttl: number = 300000 // 5分钟默认TTL
): T => {
  const cacheKey = JSON.stringify(deps);
  const cached = PerformanceOptimizer.CacheManager.get(cacheKey);
  
  if (cached) {
    return cached.value;
  }
  
  const value = factory();
  PerformanceOptimizer.CacheManager.set(cacheKey, { value, deps }, ttl);
  
  return value;
};

/**
 * 带有性能监控的useCallback
 */
export const useMonitoredCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback((...args: any[]) => {
    const start = performance.now();
    const result = callback(...args);
    const end = performance.now();
    
    if (end - start > 16) { // 超过一帧的时间(60fps)
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Performance Monitor] Callback '${callback.name || 'anonymous'}' took ${Math.round(end - start)}ms (>16ms threshold)`, { 
          timestamp: new Date().toISOString(),
          duration: Math.round(end - start),
          callback: callback.name || 'anonymous',
          args: args.slice(0, 3) // 只记录前3个参数以避免日志过多
        });
      }
    } else {
      if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) { // 抽样记录正常情况
        console.log(`[Performance Monitor] Callback '${callback.name || 'anonymous'}' took ${Math.round(end - start)}ms`, {
          timestamp: new Date().toISOString(),
          duration: Math.round(end - start)
        });
      }
    }
    
    return result;
  }, deps) as T;
};

/**
 * 防抖Hook
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = PerformanceOptimizer.debounce(() => {
      setDebouncedValue(value);
    }, delay);

    handler();
    
    return () => {};
  }, [value, delay]);

  return debouncedValue;
};

/**
 * 节流Hook
 */
export const useThrottle = <T>(value: T, delay: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);

  useEffect(() => {
    const handler = PerformanceOptimizer.throttle(() => {
      setThrottledValue(value);
    }, delay);

    handler();
    
    return () => {};
  }, [value, delay]);

  return throttledValue;
};

/**
 * 虚拟滚动Hook
 */
export const useVirtualScroll = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
  scrollTop: number,
  overscan: number = 5
) => {
  return useMemo(() => {
    return PerformanceOptimizer.VirtualScrollUtils.calculateVisibleItems(
      scrollTop,
      containerHeight,
      itemHeight,
      itemCount,
      overscan
    );
  }, [itemCount, itemHeight, containerHeight, scrollTop, overscan]);
};

/**
 * FPS监控Hook
 */
export const useFPSMonitor = (): number | null => {
  const [fps, setFps] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = PerformanceOptimizer.FPSMonitor.subscribe(setFps);
    
    PerformanceOptimizer.FPSMonitor.start();
    
    return unsubscribe;
  }, []);

  return fps;
};

/**
 * 内存监控Hook
 */
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const memInfo = PerformanceOptimizer.MemoryMonitor.getMemoryInfo();
      if (memInfo) {
        setMemoryInfo(memInfo);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

/**
 * 批处理器Hook
 */
export const useBatchProcessor = () => {
  return PerformanceOptimizer.BatchProcessor;
};

/**
 * 性能测量装饰器
 */
export function measurePerformance<T extends Record<string, any>>(componentName: string) {
  return function (Component: React.ComponentType<T>) {
    const MeasuredComponent: React.FC<T> = (props) => {
      const startTime = performance.now();
      const element = React.createElement(Component, props);
      const endTime = performance.now();
      
      if (endTime - startTime > 16) { // 超过一帧的时间
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[Performance Monitor] Component '${componentName}' render took ${Math.round(endTime - startTime)}ms (>16ms threshold)`, {
            timestamp: new Date().toISOString(),
            componentName,
            duration: Math.round(endTime - startTime),
            propsKeys: Object.keys(props)
          });
        }
      } else {
        if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) { // 抽样记录正常渲染时间
          console.log(`[Performance Monitor] Component '${componentName}' render took ${Math.round(endTime - startTime)}ms`, {
            timestamp: new Date().toISOString(),
            componentName,
            duration: Math.round(endTime - startTime)
          });
        }
      }
      
      return element;
    };
    
    return MeasuredComponent;
  };
}

export default {
  createOptimizedComponent,
  useOptimizedMemo,
  useMonitoredCallback,
  useDebounce,
  useThrottle,
  useVirtualScroll,
  useFPSMonitor,
  useMemoryMonitor,
  useBatchProcessor,
  measurePerformance
};