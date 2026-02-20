import { useState, useEffect, useCallback, useRef } from 'react';
import debouncedStorage from '../utils/debouncedStorage';

/**
 * 防抖状态 Hook
 * 使用防抖机制延迟写入 localStorage，减少写入次数
 * 
 * @param key 存储键
 * @param initialValue 初始值
 * @returns [state, setState] 状态和设置函数
 */
function useDebouncedState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    const storedValue = debouncedStorage.getItem(key);
    if (storedValue !== null) {
      try {
        return JSON.parse(storedValue) as T;
      } catch {
        return storedValue as unknown as T;
      }
    }
    return initialValue;
  });

  const isFirstRender = useRef(true);

  /**
   * 设置状态（带防抖写入）
   */
  const setStateWithDebounce = useCallback((value: T | ((prev: T) => T)) => {
    setState((prevState) => {
      const newValue = value instanceof Function ? value(prevState) : value;
      debouncedStorage.setItem(key, JSON.stringify(newValue));
      return newValue;
    });
  }, [key]);

  /**
   * 首次渲染时不写入
   */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
  }, []);

  return [state, setStateWithDebounce];
}

export default useDebouncedState;
