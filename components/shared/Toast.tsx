import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
  theme?: string;
}

/**
 * Toast组件 - 单个通知项
 */
const ToastItem: React.FC<ToastProps> = ({ toast, onClose, theme = 'light' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const isDark = theme === 'dark' || theme === 'neomorphic-dark';
  const isNeomorphic = theme.startsWith('neomorphic');

  useEffect(() => {
    // 入场动画
    setTimeout(() => setIsVisible(true), 10);

    // 自动关闭
    const duration = toast.duration || 3000;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(toast.id);
    }, 300); // 等待动画完成
  }, [toast.id, onClose]);

  const getIcon = () => {
    const iconProps = { size: 20, className: 'flex-shrink-0' };
    switch (toast.type) {
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'error':
        return <AlertCircle {...iconProps} />;
      case 'warning':
        return <AlertTriangle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  const getColorStyles = () => {
    if (isNeomorphic) {
      const neoBg = isDark ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]';
      const neoShadow = isDark
        ? 'shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(30,30,46,0.8)]'
        : 'shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]';
      
      const iconColors = {
        success: isDark ? 'text-green-400' : 'text-green-600',
        error: isDark ? 'text-red-400' : 'text-red-600',
        warning: isDark ? 'text-yellow-400' : 'text-yellow-600',
        info: isDark ? 'text-blue-400' : 'text-blue-600'
      };

      return {
        container: `${neoBg} ${neoShadow}`,
        icon: iconColors[toast.type],
        text: isDark ? 'text-zinc-100' : 'text-zinc-800',
        closeBtn: isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-800'
      };
    }

    const colorMap = {
      success: {
        container: isDark ? 'bg-green-900/90 border-green-500/50' : 'bg-green-50 border-green-200',
        icon: isDark ? 'text-green-400' : 'text-green-600',
        text: isDark ? 'text-green-100' : 'text-green-800',
        closeBtn: isDark ? 'text-green-300 hover:text-green-100' : 'text-green-700 hover:text-green-900'
      },
      error: {
        container: isDark ? 'bg-red-900/90 border-red-500/50' : 'bg-red-50 border-red-200',
        icon: isDark ? 'text-red-400' : 'text-red-600',
        text: isDark ? 'text-red-100' : 'text-red-800',
        closeBtn: isDark ? 'text-red-300 hover:text-red-100' : 'text-red-700 hover:text-red-900'
      },
      warning: {
        container: isDark ? 'bg-yellow-900/90 border-yellow-500/50' : 'bg-yellow-50 border-yellow-200',
        icon: isDark ? 'text-yellow-400' : 'text-yellow-600',
        text: isDark ? 'text-yellow-100' : 'text-yellow-800',
        closeBtn: isDark ? 'text-yellow-300 hover:text-yellow-100' : 'text-yellow-700 hover:text-yellow-900'
      },
      info: {
        container: isDark ? 'bg-blue-900/90 border-blue-500/50' : 'bg-blue-50 border-blue-200',
        icon: isDark ? 'text-blue-400' : 'text-blue-600',
        text: isDark ? 'text-blue-100' : 'text-blue-800',
        closeBtn: isDark ? 'text-blue-300 hover:text-blue-100' : 'text-blue-700 hover:text-blue-900'
      }
    };

    return colorMap[toast.type];
  };

  const styles = getColorStyles();

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-lg backdrop-blur-sm
        transition-all duration-300 transform
        ${isNeomorphic ? '' : 'border'}
        ${styles.container}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        min-w-[300px] max-w-md shadow-lg
      `}
    >
      <div className={styles.icon}>
        {getIcon()}
      </div>
      <p className={`flex-1 text-sm font-medium ${styles.text}`}>
        {toast.message}
      </p>
      <button
        onClick={handleClose}
        className={`${styles.closeBtn} transition-colors p-1`}
        aria-label="关闭通知"
      >
        <X size={16} />
      </button>
    </div>
  );
};

/**
 * Toast容器组件
 */
interface ToastContainerProps {
  toasts: Toast[];
  onRemoveToast: (id: string) => void;
  theme?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast, theme = 'light' }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={onRemoveToast}
          theme={theme}
        />
      ))}
    </div>
  );
};

export default ToastItem;
