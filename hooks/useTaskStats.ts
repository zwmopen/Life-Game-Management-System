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
  };
  
  // 主线任务统计
  projectStats: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
    totalSubTasks: number;
    completedSubTasks: number;
  };
  
  // 趋势数据（最近7天）
  weeklyTrend: {
    date: string;
    completed: number;
  }[];
}

export const useTaskStats = (
  habits: Habit[],
  projects: Project[]
): TaskStats => {
  return useMemo(() => {
    const today = new Date().toLocaleDateString();
    
    // 日常任务统计
    const dailyCompleted = habits.filter(h => 
      h.history && h.history[today] === true
    ).length;
    const dailyTotal = habits.length;
    const dailyCompletionRate = dailyTotal > 0 
      ? Math.round((dailyCompleted / dailyTotal) * 100) 
      : 0;
    
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
    
    // 总体统计
    const totalTasks = dailyTotal + projectTotal;
    const completedTasks = dailyCompleted + projectsCompleted;
    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;
    
    // 生成最近7天的趋势数据
    const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toLocaleDateString();
      
      // 统计该日期完成的日常任务数
      const completed = habits.filter(h => 
        h.history && h.history[dateStr] === true
      ).length;
      
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        completed
      };
    });
    
    return {
      totalTasks,
      completedTasks,
      completionRate,
      dailyStats: {
        total: dailyTotal,
        completed: dailyCompleted,
        completionRate: dailyCompletionRate,
        todayCompleted: dailyCompleted
      },
      projectStats: {
        total: projectTotal,
        completed: projectsCompleted,
        inProgress: projectsInProgress,
        completionRate: projectCompletionRate,
        totalSubTasks,
        completedSubTasks
      },
      weeklyTrend
    };
  }, [habits, projects]);
};

export default useTaskStats;
