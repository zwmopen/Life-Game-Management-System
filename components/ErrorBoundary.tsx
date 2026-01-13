import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error | null; errorInfo: React.ErrorInfo | null; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新 state 使下一次渲染能够显示降级 UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 更新状态
    this.setState({
      error,
      errorInfo
    });

    // 调用传入的错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

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
          <button
            onClick={this.resetError}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            重试
          </button>
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-4 text-left text-red-700 bg-red-100 p-4 rounded w-full max-w-2xl">
              <summary className="font-bold cursor-pointer">错误详情</summary>
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