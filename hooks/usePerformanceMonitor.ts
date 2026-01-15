/**
 * React Hook for performance monitoring
 * 用于在React组件中监控性能
 */

import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';

/**
 * Hook for monitoring component render performance
 * 监控组件渲染性能
 */
export const useRenderPerformance = (componentName: string) => {
  const renderStartTime = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    performanceMonitor.measureRender(componentName, renderTime);
  });
};

/**
 * Hook for monitoring API calls
 * 监控API调用性能
 */
export const useApiPerformance = () => {
  return useCallback(async <T,>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    return performanceMonitor.measure(apiName, apiCall, 'api');
  }, []);
};

/**
 * Hook for monitoring user interactions
 * 监控用户交互性能
 */
export const useInteractionPerformance = () => {
  return useCallback((interactionName: string, callback: () => void) => {
    const startTime = performance.now();
    
    callback();
    
    const duration = performance.now() - startTime;
    performanceMonitor.measureInteraction(interactionName, duration);
  }, []);
};

/**
 * Hook for monitoring memory usage periodically
 * 定期监控内存使用情况
 */
export const useMemoryMonitor = (intervalMs: number = 30000) => {
  useEffect(() => {
    const interval = setInterval(() => {
      performanceMonitor.recordMemoryUsage();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);
};

/**
 * Hook for getting performance report
 * 获取性能报告
 */
export const usePerformanceReport = () => {
  const getReport = useCallback(() => {
    return performanceMonitor.getReport();
  }, []);

  const printReport = useCallback(() => {
    performanceMonitor.printReport();
  }, []);

  const exportData = useCallback(() => {
    return performanceMonitor.exportData();
  }, []);

  return { getReport, printReport, exportData };
};
