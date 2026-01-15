/**
 * 任务统计组件
 * 显示任务完成情况的统计数据和图表
 */

import React, { memo } from 'react';
import { TrendingUp, Target, CheckCircle2, Clock } from 'lucide-react';

interface TaskStatsProps {
  // 统计数据
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  dailyStats: {
    total: number;
    completed: number;
    completionRate: number;
    todayCompleted: number;
  };
  projectStats: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
    totalSubTasks: number;
    completedSubTasks: number;
  };
  weeklyTrend: {
    date: string;
    completed: number;
  }[];
  
  // 主题配置
  theme: string;
  isDark: boolean;
  isNeomorphic: boolean;
  textMain: string;
  textSub: string;
}

const TaskStats: React.FC<TaskStatsProps> = memo(({
  totalTasks,
  completedTasks,
  completionRate,
  dailyStats,
  projectStats,
  weeklyTrend,
  theme,
  isDark,
  isNeomorphic,
  textMain,
  textSub
}) => {
  // 获取卡片样式
  const getCardStyles = () => {
    if (isNeomorphic) {
      if (theme === 'neomorphic-dark') {
        return 'bg-[#1e1e2e] shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]';
      }
      return 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]';
    }
    return isDark ? 'bg-zinc-900 border border-zinc-700' : 'bg-white border border-slate-200';
  };

  // 获取进度条样式
  const getProgressBarBg = () => {
    if (isNeomorphic) {
      if (theme === 'neomorphic-dark') {
        return 'bg-[#2a2a3e]';
      }
      return 'bg-[#d1d9e6]';
    }
    return isDark ? 'bg-zinc-800' : 'bg-slate-200';
  };

  // 获取进度条填充样式
  const getProgressBarFill = (rate: number) => {
    const colors = rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-blue-500' : 'bg-yellow-500';
    return colors;
  };

  // 渲染统计卡片
  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subValue?: string;
  }> = ({ icon, title, value, subValue }) => (
    <div className={`p-4 rounded-lg ${getCardStyles()}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={textSub}>{icon}</div>
        <h3 className={`text-sm font-medium ${textSub}`}>{title}</h3>
      </div>
      <div className={`text-2xl font-bold ${textMain}`}>{value}</div>
      {subValue && <div className={`text-xs mt-1 ${textSub}`}>{subValue}</div>}
    </div>
  );

  // 渲染进度条
  const ProgressBar: React.FC<{ label: string; rate: number; count?: string }> = ({ label, rate, count }) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-sm ${textSub}`}>{label}</span>
        <span className={`text-sm font-medium ${textMain}`}>
          {rate}% {count && <span className={textSub}>({count})</span>}
        </span>
      </div>
      <div className={`h-2 rounded-full overflow-hidden ${getProgressBarBg()}`}>
        <div
          className={`h-full transition-all duration-500 ${getProgressBarFill(rate)}`}
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );

  // 渲染趋势图
  const TrendChart: React.FC = () => {
    const maxValue = Math.max(...weeklyTrend.map(d => d.completed), 1);
    
    return (
      <div className={`p-4 rounded-lg ${getCardStyles()}`}>
        <h3 className={`text-sm font-medium mb-4 flex items-center gap-2 ${textMain}`}>
          <TrendingUp size={16} />
          最近7天完成趋势
        </h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {weeklyTrend.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div className={`text-xs font-medium ${textMain}`}>{item.completed}</div>
              <div className="w-full flex items-end justify-center h-24">
                <div
                  className={`w-full rounded-t transition-all duration-500 ${
                    item.completed > 0 ? 'bg-blue-500' : getProgressBarBg()
                  }`}
                  style={{ height: `${(item.completed / maxValue) * 100}%` }}
                />
              </div>
              <div className={`text-xs ${textSub}`}>{item.date}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 总体统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Target size={20} />}
          title="总任务数"
          value={totalTasks}
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          title="已完成"
          value={completedTasks}
          subValue={`完成率 ${completionRate}%`}
        />
        <StatCard
          icon={<Clock size={20} />}
          title="今日完成"
          value={dailyStats.todayCompleted}
          subValue={`/${dailyStats.total} 任务`}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          title="进行中"
          value={projectStats.inProgress}
          subValue={`主线任务`}
        />
      </div>

      {/* 详细进度 */}
      <div className={`p-4 rounded-lg ${getCardStyles()}`}>
        <h3 className={`text-base font-semibold mb-4 ${textMain}`}>任务完成进度</h3>
        <ProgressBar
          label="日常任务"
          rate={dailyStats.completionRate}
          count={`${dailyStats.completed}/${dailyStats.total}`}
        />
        <ProgressBar
          label="主线任务"
          rate={projectStats.completionRate}
          count={`${projectStats.completed}/${projectStats.total}`}
        />
        {projectStats.totalSubTasks > 0 && (
          <ProgressBar
            label="子任务"
            rate={Math.round((projectStats.completedSubTasks / projectStats.totalSubTasks) * 100)}
            count={`${projectStats.completedSubTasks}/${projectStats.totalSubTasks}`}
          />
        )}
      </div>

      {/* 趋势图 */}
      <TrendChart />
    </div>
  );
});

TaskStats.displayName = 'TaskStats';

export default TaskStats;
