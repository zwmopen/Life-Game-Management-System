import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary, { DefaultErrorFallback } from './components/ErrorBoundary';
import App from './App';

const AppWrapper: React.FC = () => {
  return (
    <ErrorBoundary 
      fallback={DefaultErrorFallback}
      logError={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // 生产环境可以发送到错误监控服务
        if (process.env.NODE_ENV === 'production') {
          // TODO: 集成 Sentry 或其他错误监控服务
          console.error('[生产环境错误]', {
            error: error.message,
            stack: errorInfo.componentStack,
            timestamp: new Date().toISOString()
          });
        }
      }}
    >
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default AppWrapper;