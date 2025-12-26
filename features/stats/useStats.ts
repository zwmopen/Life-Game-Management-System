import { useMemo } from 'react';
import { DailyStats } from '../../types';

export const useStats = (statsHistory: Record<number, DailyStats>, todayStats: DailyStats) => {
  const calculatedStats = useMemo(() => {
    // 计算总击杀数：完成的任务数 + 完成的习惯数
    const totalKills = todayStats.tasksCompleted + todayStats.habitsDone;

    // 计算总专注小时数
    const totalMinutes = Object.values(statsHistory).reduce(
      (acc: number, curr) => acc + (curr.focusMinutes || 0),
      0
    );
    const totalHours = totalMinutes / 60 + todayStats.focusMinutes / 60;

    // 计算总消费
    const totalSpent = Object.values(statsHistory).reduce(
      (acc: number, curr) => acc + (curr.spending || 0),
      0
    ) + todayStats.spending;

    // 计算总收益
    const totalEarnings = Object.values(statsHistory).reduce(
      (acc: number, curr) => acc + (curr.earnings || 0),
      0
    ) + todayStats.earnings;

    return {
      totalKills,
      totalHours,
      totalSpent,
      totalEarnings
    };
  }, [statsHistory, todayStats]);

  return calculatedStats;
};
