/**
 * 带有本地存储功能的番茄钟Hook
 * 在原有番茄钟功能基础上增加数据持久化功能
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocalGameState } from '../../hooks/useLocalGameState';

export interface PomodoroState {
  timeLeft: number;
  isActive: boolean;
  duration: number;
  sessionCount: number; // 完成的专注会话数量
  isBreak: boolean; // 是否处于休息状态
  totalFocusTime: number; // 总专注时间（秒）
}

// 番茄钟配置常量
const POMODORO_CONFIG = {
  DEFAULT_FOCUS_DURATION: 25,     // 默认专注时长（分钟）
  DEFAULT_BREAK_DURATION: 5,       // 默认短休息时长（分钟）
  DEFAULT_LONG_BREAK_DURATION: 15,  // 默认长休息时长（分钟）
  LONG_BREAK_INTERVAL: 4,          // 长休息间隔（专注次数）
  MAX_DURATION: 60,                // 最大专注时长（分钟）
  MIN_DURATION: 1,                 // 最小专注时长（分钟）
};

export const usePomodoroWithPersistence = (initialDuration: number = 25) => {
  const { recordFocusSession, totalFocusTime: gameStateTotalFocusTime } = useLocalGameState();
  
  // 从本地存储加载初始状态
  const loadInitialState = (): PomodoroState => {
    try {
      const savedState = localStorage.getItem('pomodoro-state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return {
          ...parsed,
          // 确保时间正确（可能需要根据上次保存的时间计算剩余时间）
          timeLeft: parsed.timeLeft || initialDuration * 60,
          duration: parsed.duration || initialDuration,
          sessionCount: parsed.sessionCount || 0,
          isBreak: parsed.isBreak || false,
          isActive: parsed.isActive || false,
          totalFocusTime: parsed.totalFocusTime || 0
        };
      }
    } catch (error) {
      console.error('Failed to load pomodoro state from localStorage:', error);
    }
    
    return {
      timeLeft: initialDuration * 60,
      isActive: false,
      duration: initialDuration,
      sessionCount: 0,
      isBreak: false,
      totalFocusTime: 0
    };
  };

  const [state, setState] = useState<PomodoroState>(loadInitialState);

  // 保存状态到本地存储
  const saveState = useCallback((newState: PomodoroState) => {
    try {
      localStorage.setItem('pomodoro-state', JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save pomodoro state to localStorage:', error);
    }
  }, []);

  // 更新状态并保存到本地存储
  const updateState = useCallback((newState: Partial<PomodoroState>) => {
    setState(prev => {
      const updatedState = { ...prev, ...newState };
      saveState(updatedState);
      return updatedState;
    });
  }, [saveState]);

  const toggleTimer = () => {
    updateState({ isActive: !state.isActive });
  };

  const resetTimer = () => {
    updateState({
      isActive: false,
      timeLeft: state.duration * 60,
      isBreak: false
    });
  };

  const changeDuration = (minutes: number) => {
    // 验证时长在有效范围内
    if (minutes >= POMODORO_CONFIG.MIN_DURATION && minutes <= POMODORO_CONFIG.MAX_DURATION) {
      updateState({
        duration: minutes,
        timeLeft: minutes * 60,
        isActive: false // 更改时长时自动暂停
      });
    }
  };

  const updateTimeLeft = (seconds: number) => {
    updateState({ timeLeft: seconds });
  };

  const updateIsActive = (active: boolean) => {
    updateState({ isActive: active });
  };

  const incrementSessionCount = () => {
    const newSessionCount = state.sessionCount + 1;
    updateState({ sessionCount: newSessionCount });
    
    // 记录专注会话到游戏状态
    recordFocusSession(state.duration);
  };

  // 计时器核心逻辑
  useEffect(() => {
    let interval: number | null = null;

    // 当计时器活跃且时间未结束时，每秒减少1秒
    if (state.isActive && state.timeLeft > 0) {
      interval = window.setInterval(() => {
        updateState(prev => {
          let newState = { ...prev, timeLeft: prev.timeLeft - 1 };
          
          // 当时间结束时
          if (newState.timeLeft <= 0) {
            newState.isActive = false; // 自动暂停
            
            if (prev.isBreak) {
              // 休息结束，开始专注
              newState.isBreak = false;
              newState.timeLeft = prev.duration * 60;
            } else {
              // 专注结束，开始休息
              newState.isBreak = true;
              const newSessionCount = prev.sessionCount + 1;
              
              // 根据专注次数决定休息类型
              if (newSessionCount % POMODORO_CONFIG.LONG_BREAK_INTERVAL === 0) {
                // 每4次专注后进行长休息
                newState.timeLeft = POMODORO_CONFIG.DEFAULT_LONG_BREAK_DURATION * 60;
              } else {
                // 短休息
                newState.timeLeft = POMODORO_CONFIG.DEFAULT_BREAK_DURATION * 60;
              }
              
              // 记录专注会话
              incrementSessionCount();
            }
            
            return newState;
          }
          
          return newState;
        });
      }, 1000);
    } 
    // 当时间结束时（如果没有在上面的逻辑中处理）
    else if (state.timeLeft <= 0 && state.isActive) {
      updateState({ isActive: false });
    }

    // 清理定时器
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.isActive, state.timeLeft, state.isBreak, state.duration, updateState]);

  // 暴露切换到专注/休息的方法
  const switchToFocus = () => {
    updateState({
      isBreak: false,
      timeLeft: state.duration * 60,
      isActive: true
    });
  };

  const switchToBreak = () => {
    const breakDuration = (state.sessionCount + 1) % POMODORO_CONFIG.LONG_BREAK_INTERVAL === 0 
      ? POMODORO_CONFIG.DEFAULT_LONG_BREAK_DURATION 
      : POMODORO_CONFIG.DEFAULT_BREAK_DURATION;
    
    updateState({
      isBreak: true,
      timeLeft: breakDuration * 60,
      isActive: false
    });
  };

  return {
    pomodoroState: state,
    toggleTimer,
    resetTimer,
    changeDuration,
    updateTimeLeft,
    updateIsActive,
    switchToFocus,
    switchToBreak,
    sessionCount: state.sessionCount,
    isBreak: state.isBreak,
    totalFocusTime: state.totalFocusTime,
    focusSessionsCompleted: state.sessionCount
  };
};