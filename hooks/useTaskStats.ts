/**
 * 任务统计Hook
 * 提供任务完成情况的统计数据
 */

import { useMemo } from 'react';
import { Habit, Project } from '../types';

interface TaskStats {
  // 总体统计
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  
  // 日常任务统计
  dailyStats: {
    total: number;
    completed: number;
    completionRate: number;
    todayCompleted: number;
    streak: number; // 连续完成天数
    averageCompletionRate: number; // 平均完成率
  };
  
  // 主线任务统计
  projectStats: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
    totalSubTasks: number;
    completedSubTasks: number;
    averageProgress: number; // 平均进度
    estimatedCompletionTime: string; // 预计完成时间
  };
  
  // 优先级统计
  priorityStats: {
    high: {
      total: number;
      completed: number;
      completionRate: number;
    };
    medium: {
      total: number;
      completed: number;
      completionRate: number;
    };
    low: {
      total: number;
      completed: number;
      completionRate: number;
    };
  };
  
  // 时间统计
  timeStats: {
    totalTimeSpent: number; // 总耗时（分钟）
    averageTimePerTask: number; // 平均任务耗时
    timeBreakdown: {
      daily: number;
      project: number;
    };
  };
  
  // 趋势数据
  trends: {
    weekly: {
      date: string;
      completed: number;
      completionRate: number;
    }[];
    monthly: {
      date: string;
      completed: number;
      completionRate: number;
    }[];
    yearly: {
      date: string;
      completed: number;
      completionRate: number;
    }[];
  };
  
  // 效率分析
  efficiency: {
    productivityScore: number; // 生产力得分
    taskCompletionTime: number; // 平均任务完成时间
    focusTimeRatio: number; // 专注时间比例
    efficiencyTrend: number[]; // 效率趋势
  };
  
  // 成就统计
  achievements: {
    totalXp: number; // 总经验值
    totalGold: number; // 总金币
    completedTasksStreak: number; // 连续完成任务天数
    bestDay: { // 最佳表现日
      date: string;
      completedTasks: number;
    };
  };
}

export const useTaskStats = (
  habits: Habit[],
  projects: Project[]
): TaskStats => {
  return useMemo(() => {
    const today = new Date().toLocaleDateString();
    const todayISO = new Date().toISOString().split('T')[0];
    
    // 日常任务统计
    const dailyCompleted = habits.filter(h => 
      h.history && h.history[today] === true
    ).length;
    const dailyTotal = habits.length;
    const dailyCompletionRate = dailyTotal > 0 
      ? Math.round((dailyCompleted / dailyTotal) * 100) 
      : 0;
    
    // 计算连续完成天数
    const calculateStreak = () => {
      let streak = 0;
      let currentDate = new Date();
      
      while (true) {
        const dateStr = currentDate.toLocaleDateString();
        const dayCompleted = habits.every(h => 
          h.history && h.history[dateStr] === true
        );
        
        if (dayCompleted) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      return streak;
    };
    
    const streak = calculateStreak();
    
    // 计算平均完成率
    const calculateAverageCompletionRate = () => {
      const days = 30; // 最近30天
      let totalRate = 0;
      let validDays = 0;
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString();
        
        const dayCompleted = habits.filter(h => 
          h.history && h.history[dateStr] === true
        ).length;
        
        if (habits.length > 0) {
          totalRate += (dayCompleted / habits.length) * 100;
          validDays++;
        }
      }
      
      return validDays > 0 ? Math.round(totalRate / validDays) : 0;
    };
    
    const averageCompletionRate = calculateAverageCompletionRate();
    
    // 主线任务统计
    const projectsCompleted = projects.filter(p => p.status === 'completed').length;
    const projectsInProgress = projects.filter(p => p.status === 'active').length;
    const projectTotal = projects.length;
    
    const totalSubTasks = projects.reduce((sum, p) => 
      sum + (p.subTasks?.length || 0), 0
    );
    const completedSubTasks = projects.reduce((sum, p) => 
      sum + (p.subTasks?.filter(st => st.completed).length || 0), 0
    );
    
    const projectCompletionRate = projectTotal > 0
      ? Math.round((projectsCompleted / projectTotal) * 100)
      : 0;
    
    // 计算平均进度
    const calculateAverageProgress = () => {
      if (projects.length === 0) return 0;
      
      const totalProgress = projects.reduce((sum, p) => {
        if (p.status === 'completed') {
          return sum + 100;
        } else if (p.subTasks && p.subTasks.length > 0) {
          const subTaskProgress = (p.subTasks.filter(st => st.completed).length / p.subTasks.length) * 100;
          return sum + subTaskProgress;
        }
        return sum;
      }, 0);
      
      return Math.round(totalProgress / projects.length);
    };
    
    const averageProgress = calculateAverageProgress();
    
    // 计算预计完成时间
    const calculateEstimatedCompletionTime = () => {
      const inProgressTasks = projects.filter(p => p.status === 'active');
      if (inProgressTasks.length === 0) return '已完成';
      
      const averageCompletionTime = inProgressTasks.reduce((sum, task) => {
        const subTasks = task.subTasks || [];
        const completedSubTasks = subTasks.filter(st => st.completed).length;
        const remainingSubTasks = subTasks.length - completedSubTasks;
        const averageSubTaskTime = subTasks.reduce((timeSum, st) => timeSum + (st.duration || 25), 0) / subTasks.length || 25;
        return sum + (remainingSubTasks * averageSubTaskTime);
      }, 0) / inProgressTasks.length;
      
      const hours = Math.floor(averageCompletionTime / 60);
      const minutes = Math.round(averageCompletionTime % 60);
      
      if (hours > 0) {
        return `${hours}小时${minutes}分钟`;
      } else {
        return `${minutes}分钟`;
      }
    };
    
    const estimatedCompletionTime = calculateEstimatedCompletionTime();
    
    // 总体统计
    const totalTasks = dailyTotal + projectTotal;
    const completedTasks = dailyCompleted + projectsCompleted;
    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;
    
    // 优先级统计
    const priorityStats = {
      high: {
        total: habits.filter(h => h.priority === 'high').length + projects.filter(p => p.priority === 'high').length,
        completed: habits.filter(h => h.priority === 'high' && h.history && h.history[today] === true).length + projects.filter(p => p.priority === 'high' && p.status === 'completed').length,
        completionRate: 0
      },
      medium: {
        total: habits.filter(h => h.priority === 'medium').length + projects.filter(p => p.priority === 'medium').length,
        completed: habits.filter(h => h.priority === 'medium' && h.history && h.history[today] === true).length + projects.filter(p => p.priority === 'medium' && p.status === 'completed').length,
        completionRate: 0
      },
      low: {
        total: habits.filter(h => h.priority === 'low').length + projects.filter(p => p.priority === 'low').length,
        completed: habits.filter(h => h.priority === 'low' && h.history && h.history[today] === true).length + projects.filter(p => p.priority === 'low' && p.status === 'completed').length,
        completionRate: 0
      }
    };
    
    // 计算优先级完成率
    Object.keys(priorityStats).forEach(key => {
      const priorityKey = key as 'high' | 'medium' | 'low';
      const stats = priorityStats[priorityKey];
      if (stats.total > 0) {
        stats.completionRate = Math.round((stats.completed / stats.total) * 100);
      }
    });
    
    // 时间统计
    const calculateTimeStats = () => {
      const totalTimeSpent = projects.reduce((sum, p) => {
        const taskTime = p.duration || 0;
        const subTaskTime = p.subTasks?.reduce((subSum, st) => subSum + (st.duration || 0), 0) || 0;
        return sum + taskTime + subTaskTime;
      }, 0);
      
      const dailyTime = habits.reduce((sum, h) => sum + (h.duration || 25), 0);
      const projectTime = projects.reduce((sum, p) => sum + (p.duration || 0), 0);
      
      return {
        totalTimeSpent,
        averageTimePerTask: totalTasks > 0 ? Math.round(totalTimeSpent / totalTasks) : 0,
        timeBreakdown: {
          daily: dailyTime,
          project: projectTime
        }
      };
    };
    
    const timeStats = calculateTimeStats();
    
    // 生成最近7天的趋势数据
    const generateWeeklyTrend = () => {
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toLocaleDateString();
        const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;
        
        const dailyCompleted = habits.filter(h => 
          h.history && h.history[dateStr] === true
        ).length;
        const projectCompleted = projects.filter(p => 
          p.completedAt && new Date(p.completedAt).toLocaleDateString() === dateStr
        ).length;
        const totalCompleted = dailyCompleted + projectCompleted;
        const totalPossible = habits.length + projects.length;
        const dayCompletionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
        
        return {
          date: dateLabel,
          completed: totalCompleted,
          completionRate: dayCompletionRate
        };
      });
    };
    
    // 生成最近30天的趋势数据（按月）
    const generateMonthlyTrend = () => {
      const monthlyData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const dateStr = date.toLocaleDateString();
        const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;
        
        const dailyCompleted = habits.filter(h => 
          h.history && h.history[dateStr] === true
        ).length;
        const projectCompleted = projects.filter(p => 
          p.completedAt && new Date(p.completedAt).toLocaleDateString() === dateStr
        ).length;
        const totalCompleted = dailyCompleted + projectCompleted;
        const totalPossible = habits.length + projects.length;
        const dayCompletionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
        
        return {
          date: dateLabel,
          completed: totalCompleted,
          completionRate: dayCompletionRate
        };
      });
      
      // 每7天分组
      const groupedData = [];
      for (let i = 0; i < monthlyData.length; i += 7) {
        const weekData = monthlyData.slice(i, i + 7);
        const weekStart = weekData[0].date;
        const weekEnd = weekData[weekData.length - 1].date;
        const totalCompleted = weekData.reduce((sum, day) => sum + day.completed, 0);
        const averageCompletionRate = Math.round(weekData.reduce((sum, day) => sum + day.completionRate, 0) / weekData.length);
        
        groupedData.push({
          date: `${weekStart} - ${weekEnd}`,
          completed: totalCompleted,
          completionRate: averageCompletionRate
        });
      }
      
      return groupedData;
    };
    
    // 生成最近12个月的趋势数据
    const generateYearlyTrend = () => {
      const yearlyData = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        const monthLabel = `${date.getFullYear()}/${date.getMonth() + 1}`;
        
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const dailyCompleted = habits.reduce((sum, h) => {
          let monthCompleted = 0;
          Object.entries(h.history || {}).forEach(([dateStr, completed]) => {
            const taskDate = new Date(dateStr);
            if (completed && taskDate >= startOfMonth && taskDate <= endOfMonth) {
              monthCompleted++;
            }
          });
          return sum + monthCompleted;
        }, 0);
        
        const projectCompleted = projects.filter(p => {
          if (!p.completedAt) return false;
          const completedDate = new Date(p.completedAt);
          return completedDate >= startOfMonth && completedDate <= endOfMonth;
        }).length;
        
        const totalCompleted = dailyCompleted + projectCompleted;
        const totalPossible = habits.length * (endOfMonth.getDate()) + projects.length;
        const monthCompletionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
        
        return {
          date: monthLabel,
          completed: totalCompleted,
          completionRate: monthCompletionRate
        };
      });
      
      return yearlyData;
    };
    
    const trends = {
      weekly: generateWeeklyTrend(),
      monthly: generateMonthlyTrend(),
      yearly: generateYearlyTrend()
    };
    
    // 先定义 dailyStats
    const dailyStats = {
      total: dailyTotal,
      completed: dailyCompleted,
      completionRate: dailyCompletionRate,
      todayCompleted: dailyCompleted,
      streak,
      averageCompletionRate
    };
    
    // 效率分析
    const calculateEfficiency = () => {
      const productivityScore = Math.round(
        (completionRate * 0.4) + 
        (streak * 0.3) + 
        ((100 - timeStats.averageTimePerTask / 60) * 0.3)
      );
      
      const taskCompletionTime = timeStats.averageTimePerTask;
      
      const focusTimeRatio = projects.length > 0 
        ? Math.round((projects.filter(p => p.status === 'active').length / projects.length) * 100) 
        : 0;
      
      const efficiencyTrend = trends.weekly.map(day => 
        Math.round((day.completionRate * 0.6) + ((100 - timeStats.averageTimePerTask / 60) * 0.4))
      );
      
      return {
        productivityScore: Math.min(100, Math.max(0, productivityScore)),
        taskCompletionTime,
        focusTimeRatio,
        efficiencyTrend
      };
    };
    
    // 成就统计
    const calculateAchievements = () => {
      const totalXp = habits.reduce((sum, h) => sum + (h.xp || 0), 0) + 
                     projects.reduce((sum, p) => sum + (p.xp || 0), 0);
      
      const totalGold = habits.reduce((sum, h) => sum + (h.gold || 0), 0) + 
                       projects.reduce((sum, p) => sum + (p.gold || 0), 0);
      
      // 计算最佳表现日
      let bestDay = { date: '', completedTasks: 0 };
      
      // 检查最近30天
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString();
        
        const dayDailyCompleted = habits.filter(h => 
          h.history && h.history[dateStr] === true
        ).length;
        const dayProjectCompleted = projects.filter(p => 
          p.completedAt && new Date(p.completedAt).toLocaleDateString() === dateStr
        ).length;
        const totalCompleted = dayDailyCompleted + dayProjectCompleted;
        
        if (totalCompleted > bestDay.completedTasks) {
          bestDay = {
            date: dateStr,
            completedTasks: totalCompleted
          };
        }
      }
      
      return {
        totalXp,
        totalGold,
        completedTasksStreak: streak,
        bestDay
      };
    };
    
    const efficiency = calculateEfficiency();
    const achievements = calculateAchievements();
    
    return {
      totalTasks,
      completedTasks,
      completionRate,
      dailyStats,
      projectStats: {
        total: projectTotal,
        completed: projectsCompleted,
        inProgress: projectsInProgress,
        completionRate: projectCompletionRate,
        totalSubTasks,
        completedSubTasks,
        averageProgress,
        estimatedCompletionTime
      },
      priorityStats,
      timeStats,
      trends,
      efficiency,
      achievements
    };
  }, [habits, projects]);
};

export default useTaskStats;
