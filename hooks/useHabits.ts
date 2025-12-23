import { useState, useEffect } from 'react';
import { Habit, DailyStats } from '../types';
import { INITIAL_HABITS } from '../constants/index';

interface UseHabitsReturn {
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
  todayStats: DailyStats;
  setTodayStats: (stats: DailyStats) => void;
  habitOrder: string[];
  setHabitOrder: (order: string[]) => void;
  handleToggleHabit: (id: string, dateStr: string) => void;
  handleUpdateHabit: (id: string, updates: Partial<Habit>) => void;
  handleDeleteHabit: (id: string) => void;
}

export const useHabits = (
  handleUpdateBalance: (amount: number, reason: string) => void,
  setXp: (xp: number) => void
): UseHabitsReturn => {
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [todayStats, setTodayStats] = useState<DailyStats>({
    habitsDone: 0,
    focusMinutes: 0,
    tasksCompleted: 0,
    projectsCompleted: 0,
    xpEarned: 0,
    goldEarned: 0,
    totalTasks: 0,
    totalProjects: 0
  });
  const [habitOrder, setHabitOrder] = useState<string[]>(INITIAL_HABITS.map(habit => habit.id));

  // Load data from localStorage on mount
  useEffect(() => {
    const loadHabits = () => {
      try {
        const savedHabits = localStorage.getItem('life-game-habits');
        const savedStats = localStorage.getItem('life-game-today-stats');
        const savedOrder = localStorage.getItem('life-game-habit-order');
        const savedDate = localStorage.getItem('life-game-last-date');

        const today = new Date().toDateString();

        if (savedDate !== today) {
          // Reset daily stats if date has changed
          localStorage.removeItem('life-game-today-stats');
          setTodayStats({
            habitsDone: 0,
            focusMinutes: 0,
            tasksCompleted: 0,
            projectsCompleted: 0,
            xpEarned: 0,
            goldEarned: 0,
            totalTasks: 0,
            totalProjects: 0
          });
          localStorage.setItem('life-game-last-date', today);
        } else if (savedStats) {
          setTodayStats(JSON.parse(savedStats));
        }

        if (savedHabits) {
          setHabits(JSON.parse(savedHabits));
        }

        if (savedOrder) {
          setHabitOrder(JSON.parse(savedOrder));
        }
      } catch (error) {
        console.error('Failed to load habits data:', error);
      }
    };

    loadHabits();
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('life-game-habits', JSON.stringify(habits));
    localStorage.setItem('life-game-today-stats', JSON.stringify(todayStats));
    localStorage.setItem('life-game-habit-order', JSON.stringify(habitOrder));
  }, [habits, todayStats, habitOrder]);

  const handleToggleHabit = (id: string, dateStr: string) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        const wasDone = !!h.history[dateStr];
        const newHistory = { ...h.history };
        if (wasDone) {
          delete newHistory[dateStr];
          handleUpdateBalance(-10, `撤销: ${h.name}`);
          setTodayStats(s => ({
            ...s,
            habitsDone: Math.max(0, s.habitsDone - 1),
            focusMinutes: Math.max(0, s.focusMinutes - 10)
          }));
          setXp(0);
          return { ...h, history: newHistory, streak: Math.max(0, h.streak - 1) };
        } else {
          newHistory[dateStr] = true;
          handleUpdateBalance(10, `完成: ${h.name}`);
          setTodayStats(s => ({
            ...s,
            habitsDone: s.habitsDone + 1,
            focusMinutes: s.focusMinutes + 10
          }));
          setXp(10);
          return { ...h, history: newHistory, streak: h.streak + 1 };
        }
      }
      return h;
    }));
  };

  const handleUpdateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const handleDeleteHabit = (id: string) => {
    if (window.confirm('确定要删除此习惯协议吗？')) {
      setHabits(prev => prev.filter(h => h.id !== id));
      setHabitOrder(prev => prev.filter(habitId => habitId !== id));
    }
  };

  return {
    habits,
    setHabits,
    todayStats,
    setTodayStats,
    habitOrder,
    setHabitOrder,
    handleToggleHabit,
    handleUpdateHabit,
    handleDeleteHabit
  };
};
