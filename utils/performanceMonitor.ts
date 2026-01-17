/**
 * 性能监控工具
 * 用于监控和分析应用性能，帮助识别性能瓶颈
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'render' | 'api' | 'interaction' | 'memory';
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    averageRenderTime: number;
    averageApiTime: number;
    averageInteractionTime: number;
    totalMetrics: number;
  };
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // 最多保存1000条记录
  private enabled = process.env.NODE_ENV === 'development';

  /**
   * 记录性能指标
   */
  recordMetric(name: string, value: number, type: PerformanceMetric['type']) {
    if (!this.enabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      type
    };

    this.metrics.push(metric);

    // 保持metrics数组大小在限制内
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // 在控制台输出性能警告
    if (value > this.getThreshold(type)) {
      const warningMessage = `[Performance Warning] ${name} took ${value.toFixed(2)}${type === 'memory' ? '%' : 'ms'} (${type})`;
      console.warn(warningMessage, {
        timestamp: new Date().toISOString(),
        threshold: this.getThreshold(type),
        type
      });
    } else {
      // 抽样记录正常性能数据
      if (this.enabled && Math.random() < 0.05) { // 5%的概率记录正常性能数据
        const logMessage = `[Performance Log] ${name} took ${value.toFixed(2)}${type === 'memory' ? '%' : 'ms'} (${type})`;
        console.log(logMessage, {
          timestamp: new Date().toISOString(),
          type,
          threshold: this.getThreshold(type)
        });
      }
    }
  }

  /**
   * 获取性能阈值
   */
  private getThreshold(type: PerformanceMetric['type']): number {
    const thresholds = {
      render: 16.67, // 60fps
      api: 1000,     // 1秒
      interaction: 100, // 100ms
      memory: 80     // 80%内存使用率
    };
    return thresholds[type];
  }

  /**
   * 测量函数执行时间
   */
  async measure<T>(
    name: string,
    fn: () => T | Promise<T>,
    type: PerformanceMetric['type'] = 'api'
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric(name, duration, type);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric(`${name} (error)`, duration, type);
      throw error;
    }
  }

  /**
   * 监控组件渲染时间
   */
  measureRender(componentName: string, renderTime: number) {
    this.recordMetric(`Render: ${componentName}`, renderTime, 'render');
  }

  /**
   * 监控API调用时间
   */
  measureApi(apiName: string, duration: number) {
    this.recordMetric(`API: ${apiName}`, duration, 'api');
  }

  /**
   * 监控用户交互时间
   */
  measureInteraction(interactionName: string, duration: number) {
    this.recordMetric(`Interaction: ${interactionName}`, duration, 'interaction');
  }

  /**
   * 记录内存使用情况
   */
  recordMemoryUsage() {
    if (!this.enabled) return;

    // @ts-ignore - performance.memory is non-standard API
    if (typeof performance !== 'undefined' && performance.memory) {
      try {
        // @ts-ignore
        const memory = performance.memory;
        const percentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        this.recordMetric('Memory Usage', percentage, 'memory');
      } catch (error) {
        console.warn('[Performance Monitor] Memory info not available:', error);
      }
    }
  }

  /**
   * 获取所有指标
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * 获取特定类型的指标
   */
  getMetricsByType(type: PerformanceMetric['type']): PerformanceMetric[] {
    return this.metrics.filter(m => m.type === type);
  }

  /**
   * 获取性能报告
   */
  getReport(): PerformanceReport {
    const renderMetrics = this.getMetricsByType('render');
    const apiMetrics = this.getMetricsByType('api');
    const interactionMetrics = this.getMetricsByType('interaction');

    const average = (metrics: PerformanceMetric[]) => {
      if (metrics.length === 0) return 0;
      return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
    };

    return {
      metrics: this.metrics,
      summary: {
        averageRenderTime: average(renderMetrics),
        averageApiTime: average(apiMetrics),
        averageInteractionTime: average(interactionMetrics),
        totalMetrics: this.metrics.length
      }
    };
  }

  /**
   * 清除所有指标
   */
  clear() {
    this.metrics = [];
  }

  /**
   * 启用/禁用监控
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * 导出性能数据为JSON
   */
  exportData(): string {
    return JSON.stringify(this.getReport(), null, 2);
  }

  /**
   * 打印性能报告到控制台
   */
  printReport() {
    const report = this.getReport();
    
    console.group('📊 Performance Report');
    console.log('Total Metrics:', report.summary.totalMetrics);
    console.log('Average Render Time:', report.summary.averageRenderTime.toFixed(2) + 'ms');
    console.log('Average API Time:', report.summary.averageApiTime.toFixed(2) + 'ms');
    console.log('Average Interaction Time:', report.summary.averageInteractionTime.toFixed(2) + 'ms');
    
    // 找出最慢的操作
    const slowestMetrics = [...this.metrics]
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    
    if (slowestMetrics.length > 0) {
      console.group('🐌 Top 10 Slowest Operations');
      slowestMetrics.forEach((metric, index) => {
        console.log(
          `${index + 1}. ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.type})`
        );
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }
}

// 创建单例实例
export const performanceMonitor = new PerformanceMonitor();

// 开发环境下每30秒记录一次内存使用
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    performanceMonitor.recordMemoryUsage();
  }, 30000);
}

// 导出类型
export type { PerformanceMetric, PerformanceReport };
