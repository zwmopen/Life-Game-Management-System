/**
 * 本地游戏状态管理Hook
 * 使用localStorage实现数据持久化存储
 */

import { useState, useEffect } from 'react';
import { localDataStore, GameState } from '../../utils/LocalDataStore';

/**
 * useLocalGameState Hook 返回值类型
 */
interface UseLocalGameStateReturn {
  /** 当前天数 */
  day: number;
  /** 设置天数 */
  setDay: (day: number) => void;
  /** 当前余额（金币） */
  balance: number;
  /** 设置余额 */
  setBalance: (balance: number) => void;
  /** 当前经验值 */
  xp: number;
  /** 设置经验值 */
  setXp: (xp: number) => void;
  /** 当前等级 */
  level: number;
  /** 设置等级 */
  setLevel: (level: number) => void;
  /** 连续签到天数 */
  checkInStreak: number;
  /** 设置连续签到天数 */
  setCheckInStreak: (streak: number) => void;
  /** 专注会话完成次数 */
  focusSessionsCompleted: number;
  /** 设置专注会话完成次数 */
  setFocusSessionsCompleted: (count: number) => void;
  /** 专注总时间（分钟） */
  totalFocusTime: number;
  /** 设置专注总时间 */
  setTotalFocusTime: (time: number) => void;
  /** 成就列表 */
  achievements: string[];
  /** 设置成就列表 */
  setAchievements: (achievements: string[]) => void;
  /** 习惯列表 */
  habits: any[];
  /** 设置习惯列表 */
  setHabits: (habits: any[]) => void;
  /** 项目列表 */
  projects: any[];
  /** 设置项目列表 */
  setProjects: (projects: any[]) => void;
  /** 交易记录列表 */
  transactions: any[];
  /** 设置交易记录列表 */
  setTransactions: (transactions: any[]) => void;
  /** 评审日志列表 */
  reviews: any[];
  /** 设置评审日志列表 */
  setReviews: (reviews: any[]) => void;
  /** 应用设置 */
  settings: GameState['settings'];
  /** 更新设置 */
  updateSettings: (newSettings: Partial<GameState['settings']>) => void;
  /** 增加余额 */
  addBalance: (amount: number) => void;
  /** 增加经验值 */
  addXP: (amount: number) => void;
  /** 记录专注会话 */
  recordFocusSession: (minutes?: number) => void;
  /** 数据是否已加载完成 */
  isDataLoaded: boolean;
  /** 重置所有数据 */
  resetData: () => void;
  /** 导出数据 */
  exportData: () => string;
  /** 导入数据 */
  importData: (data: string) => boolean;
}

/**
 * 本地游戏状态管理自定义Hook
 * @returns {UseLocalGameStateReturn} 游戏状态和操作方法
 */
export const useLocalGameState = (): UseLocalGameStateReturn => {
  const [day, setDay] = useState(1);
  const [balance, setBalance] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [checkInStreak, setCheckInStreak] = useState(0);
  const [focusSessionsCompleted, setFocusSessionsCompleted] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [settings, setSettings] = useState<GameState['settings']>({
    pomodoroDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    notificationEnabled: true
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // 从本地存储加载数据
  useEffect(() => {
    const loadData = () => {
      try {
        const state = localDataStore.getState();
        
        setDay(state.day);
        setBalance(state.balance);
        setXp(state.xp);
        setLevel(state.level);
        setCheckInStreak(state.checkInStreak);
        setFocusSessionsCompleted(state.focusSessionsCompleted);
        setTotalFocusTime(state.totalFocusTime);
        setAchievements(state.achievements);
        setHabits(state.habits);
        setProjects(state.projects);
        setTransactions(state.transactions);
        setReviews(state.reviews);
        setSettings(state.settings);
      } catch (error) {
        console.error('Failed to load data from local storage:', error);
      } finally {
        setIsDataLoaded(true);
      }
    };

    loadData();
  }, []);

  // 监听状态变化并保存到本地存储
  useEffect(() => {
    if (isDataLoaded) {
      localDataStore.updateFields({
        day,
        balance,
        xp,
        level,
        checkInStreak,
        focusSessionsCompleted,
        totalFocusTime,
        achievements,
        habits,
        projects,
        transactions,
        reviews,
        settings
      });
    }
  }, [
    day, balance, xp, level, checkInStreak, 
    focusSessionsCompleted, totalFocusTime, 
    achievements, habits, projects, transactions, reviews, settings, isDataLoaded
  ]);

  // 操作函数
  const updateDay = (newDay: number) => {
    setDay(newDay);
    localDataStore.updateField('day', newDay);
  };

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
    localDataStore.updateField('balance', newBalance);
  };

  const updateXp = (newXp: number) => {
    setXp(newXp);
    localDataStore.updateField('xp', newXp);
  };

  const updateLevel = (newLevel: number) => {
    setLevel(newLevel);
    localDataStore.updateField('level', newLevel);
  };

  const updateCheckInStreak = (newStreak: number) => {
    setCheckInStreak(newStreak);
    localDataStore.updateField('checkInStreak', newStreak);
  };

  const updateFocusSessionsCompleted = (newCount: number) => {
    setFocusSessionsCompleted(newCount);
    localDataStore.updateField('focusSessionsCompleted', newCount);
  };

  const updateTotalFocusTime = (newTime: number) => {
    setTotalFocusTime(newTime);
    localDataStore.updateField('totalFocusTime', newTime);
  };

  const updateAchievements = (newAchievements: string[]) => {
    setAchievements(newAchievements);
    localDataStore.updateField('achievements', newAchievements);
  };

  const updateHabits = (newHabits: any[]) => {
    setHabits(newHabits);
    localDataStore.updateField('habits', newHabits);
  };

  const updateProjects = (newProjects: any[]) => {
    setProjects(newProjects);
    localDataStore.updateField('projects', newProjects);
  };

  const updateTransactions = (newTransactions: any[]) => {
    setTransactions(newTransactions);
    localDataStore.updateField('transactions', newTransactions);
  };

  const updateReviews = (newReviews: any[]) => {
    setReviews(newReviews);
    localDataStore.updateField('reviews', newReviews);
  };

  const updateSettingsHandler = (newSettings: Partial<GameState['settings']>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localDataStore.updateField('settings', updatedSettings);
  };

  const addBalanceHandler = (amount: number) => {
    const newBalance = Math.max(0, balance + amount);
    updateBalance(newBalance);
  };

  const addXpHandler = (amount: number) => {
    const newXp = Math.max(0, xp + amount);
    updateXp(newXp);
  };

  const recordFocusSessionHandler = (minutes: number = 25) => {
    localDataStore.recordFocusSession(minutes);
    
    // 更新本地状态
    const newState = localDataStore.getState();
    setFocusSessionsCompleted(newState.focusSessionsCompleted);
    setTotalFocusTime(newState.totalFocusTime);
    setBalance(newState.balance);
    setXp(newState.xp);
  };

  const resetDataHandler = () => {
    localDataStore.reset();
    // 重新初始化状态
    setDay(1);
    setBalance(0);
    setXp(0);
    setLevel(1);
    setCheckInStreak(0);
    setFocusSessionsCompleted(0);
    setTotalFocusTime(0);
    setAchievements([]);
    setHabits([]);
    setProjects([]);
    setTransactions([]);
    setReviews([]);
    setSettings({
      pomodoroDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      autoStartBreaks: true,
      autoStartPomodoros: false,
      notificationEnabled: true
    });
  };

  const exportDataHandler = (): string => {
    return localDataStore.exportData();
  };

  const importDataHandler = (data: string): boolean => {
    const success = localDataStore.importData(data);
    if (success) {
      // 重新加载数据到状态
      const state = localDataStore.getState();
      setDay(state.day);
      setBalance(state.balance);
      setXp(state.xp);
      setLevel(state.level);
      setCheckInStreak(state.checkInStreak);
      setFocusSessionsCompleted(state.focusSessionsCompleted);
      setTotalFocusTime(state.totalFocusTime);
      setAchievements(state.achievements);
      setHabits(state.habits);
      setProjects(state.projects);
      setTransactions(state.transactions);
      setReviews(state.reviews);
      setSettings(state.settings);
    }
    return success;
  };

  return {
    day,
    setDay: updateDay,
    balance,
    setBalance: updateBalance,
    xp,
    setXp: updateXp,
    level,
    setLevel: updateLevel,
    checkInStreak,
    setCheckInStreak: updateCheckInStreak,
    focusSessionsCompleted,
    setFocusSessionsCompleted: updateFocusSessionsCompleted,
    totalFocusTime,
    setTotalFocusTime: updateTotalFocusTime,
    achievements,
    setAchievements: updateAchievements,
    habits,
    setHabits: updateHabits,
    projects,
    setProjects: updateProjects,
    transactions,
    setTransactions: updateTransactions,
    reviews,
    setReviews: updateReviews,
    settings,
    updateSettings: updateSettingsHandler,
    addBalance: addBalanceHandler,
    addXP: addXpHandler,
    recordFocusSession: recordFocusSessionHandler,
    isDataLoaded,
    resetData: resetDataHandler,
    exportData: exportDataHandler,
    importData: importDataHandler
  };
};