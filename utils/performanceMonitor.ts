import { logInfo, logError, logWarn } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceConfig {
  enabled: boolean;
  samplingRate: number;
  maxMetrics: number;
  enableMemoryTracking: boolean;
  enableRenderTracking: boolean;
  enableNetworkTracking: boolean;
}

interface MemoryUsage {
  heapTotal: number;
  heapUsed: number;
  external: number;
  rss: number;
  timestamp: number;
}

interface RenderTime {
  component: string;
  renderTime: number;
  timestamp: number;
  props?: Record<string, any>;
}

interface NetworkRequest {
  url: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  size?: number;
}

class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private memoryUsage: MemoryUsage[] = [];
  private renderTimes: RenderTime[] = [];
  private networkRequests: NetworkRequest[] = [];
  private navigationStart: number;
  private metricsCallbacks: Array<(metrics: PerformanceMetric[]) => void> = [];
  private initialized: boolean = false;

  constructor(config?: PerformanceConfig) {
    this.config = {
      enabled: config?.enabled ?? true,
      samplingRate: config?.samplingRate ?? 100,
      maxMetrics: config?.maxMetrics ?? 1000,
      enableMemoryTracking: config?.enableMemoryTracking ?? true,
      enableRenderTracking: config?.enableRenderTracking ?? true,
      enableNetworkTracking: config?.enableNetworkTracking ?? true,
      ...config
    };

    this.navigationStart = performance.now();
    this.initialize();
  }

  /**
   * 初始化性能监控
   */
  private initialize(): void {
    if (!this.config.enabled) return;

    this.initialized = true;
    logInfo('性能监控已初始化');

    // 监听页面加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.recordMetric('domContentLoaded', performance.now() - this.navigationStart);
      });
    } else {
      this.recordMetric('domContentLoaded', performance.now() - this.navigationStart);
    }

    window.addEventListener('load', () => {
      this.recordMetric('load', performance.now() - this.navigationStart);
    });

    // 监控内存使用
    if (this.config.enableMemoryTracking) {
      this.startMemoryTracking();
    }

    // 监控网络请求
    if (this.config.enableNetworkTracking) {
      this.startNetworkTracking();
    }
  }

  /**
   * 开始内存使用跟踪
   */
  private startMemoryTracking(): void {
    if (typeof performance.memory === 'undefined') {
      logWarn('浏览器不支持内存使用监控');
      return;
    }

    setInterval(() => {
      try {
        const memory = performance.memory;
        const memoryUsage: MemoryUsage = {
          heapTotal: memory.heapTotal,
          heapUsed: memory.heapUsed,
          external: memory.external,
          rss: memory.jsHeapSizeLimit,
          timestamp: Date.now()
        };

        this.memoryUsage.push(memoryUsage);
        
        // 限制内存使用记录数量
        if (this.memoryUsage.length > 100) {
          this.memoryUsage.shift();
        }

        // 记录内存使用指标
        this.recordMetric('memory.heapUsed', memory.heapUsed / 1024 / 1024, {
          heapTotal: memory.heapTotal,
          external: memory.external
        });

        // 检测内存使用异常
        if (memory.heapUsed / memory.heapTotal > 0.8) {
          logWarn('内存使用过高', {
            heapUsed: memory.heapUsed,
            heapTotal: memory.heapTotal,
            usagePercentage: (memory.heapUsed / memory.heapTotal * 100).toFixed(2) + '%'
          });
        }
      } catch (error) {
        logError('内存监控失败:', error);
      }
    }, 5000); // 每5秒监控一次内存使用
  }

  /**
   * 开始网络请求跟踪
   */
  private startNetworkTracking(): void {
    const originalFetch = window.fetch;
    const originalXhrOpen = XMLHttpRequest.prototype.open;

    // 监控fetch请求
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const [url, options] = args;
      const method = options?.method || 'GET';

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // 克隆响应以获取大小
        const clonedResponse = response.clone();
        const text = await clonedResponse.text();
        const size = new Blob([text]).size;

        this.recordNetworkRequest({
          url: typeof url === 'string' ? url : url.toString(),
          method,
          duration,
          status: response.status,
          timestamp: Date.now(),
          size
        });

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.recordNetworkRequest({
          url: typeof url === 'string' ? url : url.toString(),
          method,
          duration,
          status: 0,
          timestamp: Date.now()
        });

        throw error;
      }
    };

    // 监控XMLHttpRequest请求
    XMLHttpRequest.prototype.open = function(...args) {
      const [method, url] = args;
      const startTime = performance.now();
      const xhr = this;

      const originalOnLoad = xhr.onload;
      const originalOnError = xhr.onerror;

      xhr.onload = function() {
        const endTime = performance.now();
        const duration = endTime - startTime;

        const networkRequest: NetworkRequest = {
          url: url.toString(),
          method,
          duration,
          status: xhr.status,
          timestamp: Date.now(),
          size: xhr.responseText ? new Blob([xhr.responseText]).size : undefined
        };

        performanceMonitor.recordNetworkRequest(networkRequest);

        if (originalOnLoad) {
          originalOnLoad.call(this);
        }
      };

      xhr.onerror = function() {
        const endTime = performance.now();
        const duration = endTime - startTime;

        const networkRequest: NetworkRequest = {
          url: url.toString(),
          method,
          duration,
          status: 0,
          timestamp: Date.now()
        };

        performanceMonitor.recordNetworkRequest(networkRequest);

        if (originalOnError) {
          originalOnError.call(this);
        }
      };

      return originalXhrOpen.apply(this, args);
    };
  }

  /**
   * 记录性能指标
   */
  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    if (!this.config.enabled) return;

    // 采样率控制
    if (Math.random() * 100 > this.config.samplingRate) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);

    // 限制指标数量
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics.shift();
    }

    // 通知回调
    this.notifyMetricsChange();

    // 检测异常指标
    this.detectAnomalies(metric);
  }

  /**
   * 记录内存使用
   */
  recordMemoryUsage(): void {
    if (!this.config.enableMemoryTracking) return;

    try {
      const memory = performance.memory;
      const memoryUsage: MemoryUsage = {
        heapTotal: memory.heapTotal,
        heapUsed: memory.heapUsed,
        external: memory.external,
        rss: memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };

      this.memoryUsage.push(memoryUsage);

      // 限制内存使用记录数量
      if (this.memoryUsage.length > 100) {
        this.memoryUsage.shift();
      }

      // 记录内存使用指标
      this.recordMetric('memory.heapUsed', memory.heapUsed / 1024 / 1024, {
        heapTotal: memory.heapTotal,
        external: memory.external
      });
    } catch (error) {
      logError('记录内存使用失败:', error);
    }
  }

  /**
   * 记录渲染时间
   */
  recordRenderTime(component: string, renderTime: number, props?: Record<string, any>): void {
    if (!this.config.enableRenderTracking) return;

    const renderTimeData: RenderTime = {
      component,
      renderTime,
      timestamp: Date.now(),
      props
    };

    this.renderTimes.push(renderTimeData);

    // 限制渲染时间记录数量
    if (this.renderTimes.length > 100) {
      this.renderTimes.shift();
    }

    // 记录渲染时间指标
    this.recordMetric(`render.${component}`, renderTime, {
      component,
      props: props ? Object.keys(props) : []
    });

    // 检测渲染性能问题
    if (renderTime > 16) { // 超过16ms可能影响60fps
      logWarn(`组件渲染时间过长: ${component} - ${renderTime.toFixed(2)}ms`, {
        renderTime,
        component,
        props: props ? Object.keys(props) : []
      });
    }
  }

  /**
   * 记录网络请求
   */
  recordNetworkRequest(request: NetworkRequest): void {
    if (!this.config.enableNetworkTracking) return;

    this.networkRequests.push(request);

    // 限制网络请求记录数量
    if (this.networkRequests.length > 100) {
      this.networkRequests.shift();
    }

    // 记录网络请求指标
    this.recordMetric(`network.${request.method}`, request.duration, {
      url: request.url,
      status: request.status,
      size: request.size
    });

    // 检测网络性能问题
    if (request.duration > 1000) { // 超过1秒的请求
      logWarn(`网络请求时间过长: ${request.url} - ${request.duration.toFixed(2)}ms`, {
        duration: request.duration,
        url: request.url,
        status: request.status
      });
    }

    // 检测网络错误
    if (request.status >= 400) {
      logError(`网络请求错误: ${request.url} - ${request.status}`, {
        url: request.url,
        status: request.status,
        duration: request.duration
      });
    }
  }

  /**
   * 检测异常指标
   */
  private detectAnomalies(metric: PerformanceMetric): void {
    // 这里可以添加异常检测逻辑
    // 例如：检测渲染时间过长、网络请求过慢、内存使用过高
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * 获取内存使用
   */
  getMemoryUsage(): MemoryUsage[] {
    return [...this.memoryUsage];
  }

  /**
   * 获取渲染时间
   */
  getRenderTimes(): RenderTime[] {
    return [...this.renderTimes];
  }

  /**
   * 获取网络请求
   */
  getNetworkRequests(): NetworkRequest[] {
    return [...this.networkRequests];
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): Record<string, any> {
    const report = {
      summary: {
        metricsCount: this.metrics.length,
        memoryUsageCount: this.memoryUsage.length,
        renderTimesCount: this.renderTimes.length,
        networkRequestsCount: this.networkRequests.length,
        uptime: Date.now() - this.navigationStart,
        timestamp: Date.now()
      },
      metrics: this.getMetrics(),
      memoryUsage: this.getMemoryUsage(),
      renderTimes: this.getRenderTimes(),
      networkRequests: this.getNetworkRequests(),
      averages: {
        renderTime: this.calculateAverageRenderTime(),
        networkRequestTime: this.calculateAverageNetworkRequestTime(),
        memoryUsage: this.calculateAverageMemoryUsage()
      }
    };

    return report;
  }

  /**
   * 计算平均渲染时间
   */
  private calculateAverageRenderTime(): number {
    if (this.renderTimes.length === 0) return 0;
    const total = this.renderTimes.reduce((sum, time) => sum + time.renderTime, 0);
    return total / this.renderTimes.length;
  }

  /**
   * 计算平均网络请求时间
   */
  private calculateAverageNetworkRequestTime(): number {
    if (this.networkRequests.length === 0) return 0;
    const total = this.networkRequests.reduce((sum, request) => sum + request.duration, 0);
    return total / this.networkRequests.length;
  }

  /**
   * 计算平均内存使用
   */
  private calculateAverageMemoryUsage(): number {
    if (this.memoryUsage.length === 0) return 0;
    const total = this.memoryUsage.reduce((sum, usage) => sum + usage.heapUsed, 0);
    return total / this.memoryUsage.length / 1024 / 1024; // MB
  }

  /**
   * 导出性能数据
   */
  exportPerformanceData(): string {
    const report = this.getPerformanceReport();
    return JSON.stringify(report, null, 2);
  }

  /**
   * 清除性能数据
   */
  clearData(): void {
    this.metrics = [];
    this.memoryUsage = [];
    this.renderTimes = [];
    this.networkRequests = [];
    logInfo('性能数据已清除');
  }

  /**
   * 添加指标回调
   */
  addMetricsCallback(callback: (metrics: PerformanceMetric[]) => void): void {
    this.metricsCallbacks.push(callback);
  }

  /**
   * 移除指标回调
   */
  removeMetricsCallback(callback: (metrics: PerformanceMetric[]) => void): void {
    const index = this.metricsCallbacks.indexOf(callback);
    if (index > -1) {
      this.metricsCallbacks.splice(index, 1);
    }
  }

  /**
   * 通知指标变化
   */
  private notifyMetricsChange(): void {
    this.metricsCallbacks.forEach(callback => {
      try {
        callback([...this.metrics]);
      } catch (error) {
        logError('通知指标变化失败:', error);
      }
    });
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<PerformanceConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
    logInfo('性能监控配置已更新', config);
  }

  /**
   * 销毁性能监控
   */
  destroy(): void {
    this.clearData();
    this.metricsCallbacks = [];
    this.initialized = false;
    logInfo('性能监控已销毁');
  }
}

// 创建单例实例
const performanceMonitor = new PerformanceMonitor({
  enabled: true,
  samplingRate: 100,
  maxMetrics: 1000,
  enableMemoryTracking: true,
  enableRenderTracking: true,
  enableNetworkTracking: true
});

export default performanceMonitor;
export { PerformanceMonitor, type PerformanceMetric, type PerformanceConfig, type MemoryUsage, type RenderTime, type NetworkRequest };
