/**
 * 游戏状态管理自定义Hook
 * 负责管理游戏的核心状态，包括天数、余额、经验值、签到 streak 等
 */
import { useState, useEffect } from 'react';
import { Transaction, ReviewLog } from '../types';

/**
 * useGameState Hook 返回值类型
 */
interface UseGameStateReturn {
  /** 当前天数 */
  day: number;
  /** 设置天数 */
  setDay: (day: number) => void;
  /** 当前余额 */
  balance: number;
  /** 设置余额 */
  setBalance: (balance: number) => void;
  /** 当前经验值 */
  xp: number;
  /** 设置经验值 */
  setXp: (xp: number) => void;
  /** 连续签到天数 */
  checkInStreak: number;
  /** 设置连续签到天数 */
  setCheckInStreak: (streak: number) => void;
  /** 交易记录列表 */
  transactions: Transaction[];
  /** 设置交易记录列表 */
  setTransactions: (transactions: Transaction[]) => void;
  /** 评审日志列表 */
  reviews: ReviewLog[];
  /** 设置评审日志列表 */
  setReviews: (reviews: ReviewLog[]) => void;
  /** 更新余额并记录交易 */
  handleUpdateBalance: (amount: number, reason: string) => void;
  /** 数据是否已加载完成 */
  isDataLoaded: boolean;
}

/**
 * 游戏状态管理自定义Hook
 * @returns {UseGameStateReturn} 游戏状态和操作方法
 */
export const useGameState = (): UseGameStateReturn => {
  const [day, setDay] = useState(1);
  const [balance, setBalance] = useState(1250);
  const [xp, setXp] = useState(0);
  const [checkInStreak, setCheckInStreak] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reviews, setReviews] = useState<ReviewLog[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const dayStr = localStorage.getItem('life-game-day');
        const balanceStr = localStorage.getItem('life-game-balance');
        const xpStr = localStorage.getItem('life-game-xp');
        const streakStr = localStorage.getItem('life-game-streak');
        const transactionsStr = localStorage.getItem('life-game-transactions');
        const reviewsStr = localStorage.getItem('life-game-reviews');

        if (dayStr) setDay(parseInt(dayStr));
        if (balanceStr) setBalance(parseInt(balanceStr));
        if (xpStr) setXp(parseInt(xpStr));
        if (streakStr) setCheckInStreak(parseInt(streakStr));
        if (transactionsStr) setTransactions(JSON.parse(transactionsStr));
        if (reviewsStr) setReviews(JSON.parse(reviewsStr));
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
      } finally {
        setIsDataLoaded(true);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('life-game-day', day.toString());
    localStorage.setItem('life-game-balance', balance.toString());
    localStorage.setItem('life-game-xp', xp.toString());
    localStorage.setItem('life-game-streak', checkInStreak.toString());
    localStorage.setItem('life-game-transactions', JSON.stringify(transactions));
    localStorage.setItem('life-game-reviews', JSON.stringify(reviews));
  }, [day, balance, xp, checkInStreak, transactions, reviews]);

  // Handle balance updates with transaction logging
  const handleUpdateBalance = (amount: number, reason: string) => {
    const newBalance = balance + amount;
    setBalance(newBalance);

    const transaction: Transaction = {
      id: `tx-${Date.now()}`,
      amount,
      balance: newBalance,
      timestamp: new Date().toISOString(),
      reason
    };

    setTransactions(prev => [...prev.slice(-99), transaction]); // Keep only last 100 transactions
  };

  return {
    day,
    setDay,
    balance,
    setBalance,
    xp,
    setXp,
    checkInStreak,
    setCheckInStreak,
    transactions,
    setTransactions,
    reviews,
    setReviews,
    handleUpdateBalance,
    isDataLoaded
  };
};
