/**
 * 游戏状态管理自定义Hook
 * 负责管理游戏的核心状态，包括天数、余额、经验值、签到 streak 等
 */
import { useState, useEffect } from 'react';
import { Transaction, ReviewLog } from '../../types';
import { useLocalGameState } from './useLocalGameState';

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
  // 使用新的本地游戏状态Hook
  const {
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
    isDataLoaded
  } = useLocalGameState();

  // Handle balance updates with transaction logging
  const handleUpdateBalance = (amount: number, reason: string) => {
    const newBalance = balance + amount;
    setBalance(newBalance);

    const transaction: Transaction = {
      id: `tx-${Date.now()}`,
      time: new Date().toLocaleString(),
      amount,
      desc: reason
    };

    const updatedTransactions = [...transactions.slice(-99), transaction];
    setTransactions(updatedTransactions); // Keep only last 100 transactions
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
