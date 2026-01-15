import React from 'react';

// 错误统计接口
interface ErrorStats {
  count: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  componentStack: string;
  errorType: string;
  url: string;
  userAgent: string;
  timestamp: number;
}

// 性能监控接口
interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  errorCount: number;
  errorRate: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error | null; errorInfo: React.ErrorInfo | null; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  logError?: boolean;
  logToService?: (error: Error, errorInfo: React.ErrorInfo, errorId: string) => void;
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private static errorStatsMap: Map<string, ErrorStats> = new Map();
  
  // Explicitly declare state, props, and setState
  declare state: ErrorBoundaryState;
  declare props: ErrorBoundaryProps;
  declare setState: (
    state: Partial<ErrorBoundaryState> | ((prevState: ErrorBoundaryState, props: ErrorBoundaryProps) => Partial<ErrorBoundaryState>),
    callback?: () => void
  ) => void;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, errorId: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 生成唯一的错误ID
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 更新 state 使下一次渲染能够显示降级 UI
    return { hasError: true, error, errorInfo: null, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const errorId = this.state.errorId || `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 更新状态
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // 记录错误信息到控制台
    if (this.props.logError !== false) {
      const performanceMetrics = this.collectPerformanceMetrics();
      
      console.group(`%cErrorBoundary Error ID: ${errorId}`, 'color: #ff0000; font-weight: bold');
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error Type:', error.constructor.name);
      console.error('Component stack:', errorInfo.componentStack);
      console.info('Error occurred at:', new Date().toISOString());
      console.info('Page URL:', typeof window !== 'undefined' ? window.location.href : 'unknown');
      console.info('User Agent:', typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown');
      console.info('Performance Metrics:', performanceMetrics);
      console.groupEnd();
      
      // 输出错误摘要到控制台，便于快速识别
      console.warn(`🚨 Error Summary - ID: ${errorId}, Type: ${error.constructor.name}, Time: ${new Date().toLocaleTimeString()}`);
    }

    // 调用传入的错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // 发送错误到外部服务（如果提供了回调）
    if (this.props.logToService) {
      this.props.logToService(error, errorInfo, errorId);
    }
    
    // 更新错误统计
    this.updateErrorStats(error, errorInfo, errorId);
  }
  
  // 收集性能指标
  private collectPerformanceMetrics(): PerformanceMetrics {
    let memoryUsage = 0;
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      memoryUsage = (performance as any).memory.usedJSHeapSize;
    }
      
    return {
      renderTime: performance.now(),
      memoryUsage,
      errorCount: ErrorBoundary.errorStatsMap.size,
      errorRate: ErrorBoundary.errorStatsMap.size / (performance.timeOrigin || Date.now()) * 100000, // 每十万毫秒的错误数
    };
  }
  
  private updateErrorStats(error: Error, errorInfo: React.ErrorInfo, errorId: string): void {
    const errorKey = error.message.substring(0, 100); // 使用错误消息的前100个字符作为键
    const now = new Date();
    
    if (ErrorBoundary.errorStatsMap.has(errorKey)) {
      const stats = ErrorBoundary.errorStatsMap.get(errorKey)!;
      ErrorBoundary.errorStatsMap.set(errorKey, {
        count: stats.count + 1,
        firstOccurrence: stats.firstOccurrence,
        lastOccurrence: now,
        componentStack: stats.componentStack,
        errorType: stats.errorType,
        url: stats.url,
        userAgent: stats.userAgent,
        timestamp: stats.timestamp,
      });
    } else {
      const newStats: ErrorStats = {
        count: 1,
        firstOccurrence: now,
        lastOccurrence: now,
        componentStack: errorInfo.componentStack || '',
        errorType: error.constructor.name,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        timestamp: Date.now(),
      };
      ErrorBoundary.errorStatsMap.set(errorKey, newStats);
    }
  }

  // 获取错误统计信息
  static getErrorStats(): Map<string, ErrorStats> {
    return ErrorBoundary.errorStatsMap;
  }

  // 重置错误统计
  static resetErrorStats(): void {
    ErrorBoundary.errorStatsMap.clear();
  }

  // 获取性能指标
  static getPerformanceMetrics(): PerformanceMetrics {
    let memoryUsage = 0;
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      memoryUsage = (performance as any).memory.usedJSHeapSize;
    }
    
    return {
      renderTime: performance.now(),
      memoryUsage,
      errorCount: ErrorBoundary.errorStatsMap.size,
      errorRate: ErrorBoundary.errorStatsMap.size > 0 && typeof performance !== 'undefined' 
        ? ErrorBoundary.errorStatsMap.size / ((performance.timeOrigin ? performance.now() : Date.now()) / 1000)
        : 0,
    };
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  }
  
  // 导出错误报告
  static generateErrorReport(): string {
    const stats = ErrorBoundary.getErrorStats();
    const perfMetrics = ErrorBoundary.getPerformanceMetrics();
      
    let report = `=== 错误报告 ===\n`;
    report += `生成时间: ${new Date().toISOString()}\n`;
    report += `总错误数: ${stats.size}\n`;
    report += `性能指标: ${JSON.stringify(perfMetrics, null, 2)}\n\n`;
      
    report += `详细错误统计:\n`;
    stats.forEach((stat, key) => {
      report += `- 错误: ${key.substring(0, 50)}...\n`;
      report += `  出现次数: ${stat.count}\n`;
      report += `  首次出现: ${stat.firstOccurrence.toISOString()}\n`;
      report += `  最后出现: ${stat.lastOccurrence.toISOString()}\n`;
      report += `  错误类型: ${stat.errorType}\n`;
      report += `  页面URL: ${stat.url}\n\n`;
    });
      
    return report;
  }
  
  // 发送错误报告到控制台
  static logErrorReport(): void {
    console.groupCollapsed('%c📋 Error Report', 'color: #0066cc; font-weight: bold');
    console.log(ErrorBoundary.generateErrorReport());
    console.groupEnd();
  }
  
  render(): React.ReactNode {
    if (this.state.hasError) {
      // 如果传入了fallback组件，则使用它
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.resetError}
          />
        );
      }

      // 默认的错误UI
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-bold text-red-700 mb-2">出了点问题</h2>
          <p className="text-red-600 mb-4">
            {this.state.error?.message || '未知错误'}
          </p>
          <div className="text-xs text-red-500 mb-4">
            错误ID: {this.state.errorId}
          </div>
          <button
            onClick={this.resetError}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            重试
          </button>
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-4 text-left text-red-700 bg-red-100 p-4 rounded w-full max-w-2xl">
              <summary className="font-bold cursor-pointer">错误详情</summary>
              <div className="text-xs mb-2">错误ID: {this.state.errorId}</div>
              <pre className="whitespace-pre-wrap mt-2">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// 默认的错误边界UI组件
export const DefaultErrorFallback: React.ComponentType<{
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
}> = ({ error, errorInfo, resetError }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl shadow-lg max-w-md mx-auto my-8">
      <div className="bg-red-100 p-4 rounded-full mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">哎呀，出错了！</h2>
      <p className="text-gray-600 mb-6">
        {error?.message || '应用程序遇到了意外错误'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={resetError}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-md"
        >
          重试操作
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-md"
        >
          刷新页面
        </button>
      </div>
      {process.env.NODE_ENV === 'development' && errorInfo && (
        <details className="mt-6 w-full">
          <summary className="cursor-pointer text-left text-gray-700 font-medium bg-gray-100 p-3 rounded-lg">
            错误详情
          </summary>
          <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-auto max-h-60">
            <pre className="text-sm text-gray-600 whitespace-pre-wrap text-left">
              {errorInfo.componentStack}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};

// 导出错误统计相关函数
export const getErrorStats = ErrorBoundary.getErrorStats;
export const resetErrorStats = ErrorBoundary.resetErrorStats;

// 导出性能监控相关函数
export const getPerformanceMetrics = ErrorBoundary.getPerformanceMetrics;

// 导出错误报告相关函数
export const generateErrorReport = ErrorBoundary.generateErrorReport;
export const logErrorReport = ErrorBoundary.logErrorReport;