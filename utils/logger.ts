/**
 * 全局日志记录器
 * 用于记录系统运行时的各种信息、警告和错误
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // 最大日志数量
  
  /**
   * 记录日志
   */
  private log(level: LogLevel, message: string, context?: any) {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = { timestamp, level, message, context };
    
    this.logs.push(logEntry);
    
    // 限制日志数组大小
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // 输出到控制台
    this.outputToConsole(level, message, context);
    
    // 触发自定义事件，允许UI层监听日志
    this.dispatchLogEvent(logEntry);
  }
  
  private outputToConsole(level: LogLevel, message: string, context?: any) {
    const logMessage = `[${level}] ${message}`;
    const timestamp = new Date().toLocaleTimeString();
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`[${timestamp}] ${logMessage}`, context || '');
        break;
      case LogLevel.INFO:
        console.info(`[${timestamp}] ${logMessage}`, context || '');
        break;
      case LogLevel.WARN:
        console.warn(`[${timestamp}] ${logMessage}`, context || '');
        break;
      case LogLevel.ERROR:
        console.error(`[${timestamp}] ${logMessage}`, context || '');
        break;
    }
  }
  
  private dispatchLogEvent(logEntry: LogEntry) {
    // 创建自定义事件，允许其他组件监听日志
    const event = new CustomEvent('globalLog', { detail: logEntry });
    window.dispatchEvent(event);
  }
  
  /**
   * 记录调试信息
   */
  debug(message: string, context?: any) {
    this.log(LogLevel.DEBUG, message, context);
  }
  
  /**
   * 记录一般信息
   */
  info(message: string, context?: any) {
    this.log(LogLevel.INFO, message, context);
  }
  
  /**
   * 记录警告信息
   */
  warn(message: string, context?: any) {
    this.log(LogLevel.WARN, message, context);
  }
  
  /**
   * 记录错误信息
   */
  error(message: string, context?: any) {
    this.log(LogLevel.ERROR, message, context);
  }
  
  /**
   * 获取所有日志
   */
  getLogs(): LogEntry[] {
    return [...this.logs]; // 返回副本以防止外部修改
  }
  
  /**
   * 根据级别过滤日志
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }
  
  /**
   * 清空日志
   */
  clearLogs() {
    this.logs = [];
  }
  
  /**
   * 获取最近的日志
   */
  getRecentLogs(count: number): LogEntry[] {
    return this.logs.slice(-count);
  }
}

// 创建全局日志实例
export const logger = new Logger();

// 便捷函数
export const logDebug = (message: string, context?: any) => logger.debug(message, context);
export const logInfo = (message: string, context?: any) => logger.info(message, context);
export const logWarn = (message: string, context?: any) => logger.warn(message, context);
export const logError = (message: string, context?: any) => logger.error(message, context);

// 错误边界捕获
export const logErrorBoundary = (error: Error, componentStack: string) => {
  logger.error(`Error Boundary caught: ${error.message}`, {
    error,
    componentStack,
    stack: error.stack
  });
};

// Promise拒绝捕获
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: event.reason,
      promise: event.promise
    });
  });

  window.addEventListener('error', (event) => {
    logger.error('Global error caught', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });
}