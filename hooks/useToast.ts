import { useState, useCallback } from 'react';
import { Toast, ToastType } from '../components/shared/Toast';

/**
 * useToast hook - 管理Toast通知
 * @returns Toast管理方法和状态
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * 添加Toast通知
   */
  const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      id,
      type,
      message,
      duration: duration || 3000
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  /**
   * 移除Toast通知
   */
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  /**
   * 清除所有Toast
   */
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * 便捷方法：显示成功消息
   */
  const success = useCallback((message: string, duration?: number) => {
    return addToast('success', message, duration);
  }, [addToast]);

  /**
   * 便捷方法：显示错误消息
   */
  const error = useCallback((message: string, duration?: number) => {
    return addToast('error', message, duration);
  }, [addToast]);

  /**
   * 便捷方法：显示警告消息
   */
  const warning = useCallback((message: string, duration?: number) => {
    return addToast('warning', message, duration);
  }, [addToast]);

  /**
   * 便捷方法：显示提示消息
   */
  const info = useCallback((message: string, duration?: number) => {
    return addToast('info', message, duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  };
};

export default useToast;
