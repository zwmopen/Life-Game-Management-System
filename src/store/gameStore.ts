import { create } from 'zustand';
import { Transaction, ReviewLog, DailyStats } from '../../types';

interface GameState {
  // 状态
  day: number;
  balance: number;
  xp: number;
  checkInStreak: number;
  transactions: Transaction[];
  reviews: ReviewLog[];
  statsHistory: {[key: number]: DailyStats};
  todayStats: DailyStats;
  
  // 操作
  setDay: (day: number) => void;
  setBalance: (balance: number) => void;
  setXp: (xp: number) => void;
  setCheckInStreak: (streak: number) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setReviews: (reviews: ReviewLog[]) => void;
  setStatsHistory: (stats: {[key: number]: DailyStats}) => void;
  setTodayStats: (stats: DailyStats) => void;
  
  // 业务逻辑
  updateBalance: (amount: number, reason: string) => void;
  addReview: (content: string, aiAnalysis: string) => void;
  updateTodayStats: (updates: Partial<DailyStats>) => void;
  resetDailyStats: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  // 初始状态
  day: 1,
  balance: 88,
  xp: 10,
  checkInStreak: 1,
  transactions: [],
  reviews: [],
  statsHistory: {
    1: {
      focusMinutes: 10,
      tasksCompleted: 0,
      habitsDone: 1,
      earnings: 117,
      spending: 9
    }
  },
  todayStats: {
    focusMinutes: 10,
    tasksCompleted: 0,
    habitsDone: 1,
    earnings: 117,
    spending: 9
  },
  
  // 操作
  setDay: (day) => set({ day }),
  setBalance: (balance) => set({ balance }),
  setXp: (xp) => set({ xp }),
  setCheckInStreak: (checkInStreak) => set({ checkInStreak }),
  setTransactions: (transactions) => set({ transactions }),
  setReviews: (reviews) => set({ reviews }),
  setStatsHistory: (statsHistory) => set({ statsHistory }),
  setTodayStats: (todayStats) => set({ todayStats }),
  
  // 业务逻辑
  updateBalance: (amount, reason) => set((state) => {
    const newBalance = state.balance + amount;
    const newTransaction = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      desc: reason,
      amount
    };
    
    // 更新今日统计
    const updatedTodayStats = {
      ...state.todayStats,
      earnings: amount > 0 ? state.todayStats.earnings + amount : state.todayStats.earnings,
      spending: amount < 0 ? state.todayStats.spending - amount : state.todayStats.spending
    };
    
    return {
      balance: newBalance,
      transactions: [newTransaction, ...state.transactions].slice(0, 50),
      todayStats: updatedTodayStats
    };
  }),
  
  addReview: (content, aiAnalysis) => set((state) => {
    const newReview = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      content,
      aiAnalysis,
      timestamp: Date.now()
    };
    
    return {
      reviews: [...state.reviews, newReview]
    };
  }),
  
  updateTodayStats: (updates) => set((state) => ({
    todayStats: { ...state.todayStats, ...updates }
  })),
  
  resetDailyStats: () => set((state) => {
    const newTodayStats: DailyStats = {
      focusMinutes: 0,
      tasksCompleted: 0,
      habitsDone: 0,
      earnings: 0,
      spending: 0
    };
    
    return {
      todayStats: newTodayStats,
      statsHistory: {
        ...state.statsHistory,
        [state.day]: state.todayStats
      }
    };
  })
}));
