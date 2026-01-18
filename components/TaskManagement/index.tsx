/**
 * 任务管理主组件
 * 整合日常任务、主线任务和命运骰子任务
 * 
 * 性能优化：使用React.memo包裹组件，仅在props变化时重新渲染
 */

import React, { useCallback, useMemo, useState } from 'react';
import { logInfo, logError, logWarn } from '../../utils/logger';
import { ListTodo, Target, Sparkles, Plus } from 'lucide-react';
import { GlobalHelpButton } from '../HelpSystem';
import TaskList from './TaskList';
import DiceTaskList from './DiceTaskList';
import FateDice from '../FateDice';
import TaskSearchBar from './TaskSearchBar';
import { TaskManagementProps } from './types';

const TaskManagement: React.FC<TaskManagementProps> = React.memo(({
  habitTasks,
  projectTasks,
  diceState,
  habits = [],
  projects = [],
  taskCategory,
  setTaskCategory,
  onCompleteTask,
  onGiveUpTask,
  onOpenEditTask,
  onToggleSubTask,
  onGiveUpSubTask,
  onStartTimer,
  onDragStart,
  onDragEnd,
  onDragOver,
  draggedTask,
  onSpinDice,
  onUpdateDiceState,
  onDiceResult,
  onChangeDuration,
  onToggleTimer,
  onAddFloatingReward,
  theme,
  cardBg,
  textMain,
  textSub,
  isDark,
  isNeomorphic,
  onShowHelp,
  todayStr,
  setIsImmersive,
  onAddTask
}) => {
  // 搜索状态
  const [searchTerm, setSearchTerm] = useState('');

  // 过滤任务函数
  const filterTasks = useCallback((tasks: any[], searchTerm: string) => {
    if (!searchTerm.trim()) return tasks;
    
    const searchLower = searchTerm.toLowerCase();
    return tasks.filter(task => {
      // 搜索任务名称
      if (task.name?.toLowerCase().includes(searchLower)) return true;
      if (task.title?.toLowerCase().includes(searchLower)) return true;
      if (task.text?.toLowerCase().includes(searchLower)) return true;
      
      // 搜索子任务
      if (task.subTasks) {
        return task.subTasks.some((st: any) => 
          st.title?.toLowerCase().includes(searchLower)
        );
      }
      
      return false;
    });
  }, []);

  // 过滤后的任务列表
  const filteredHabitTasks = useMemo(() => 
    filterTasks(habitTasks, searchTerm),
    [habitTasks, searchTerm, filterTasks]
  );

  const filteredProjectTasks = useMemo(() => 
    filterTasks(projectTasks, searchTerm),
    [projectTasks, searchTerm, filterTasks]
  );

  const filteredDiceTasks = useMemo(() => {
    if (!diceState) return { pending: [], completed: [], abandoned: [] };
    return {
      pending: filterTasks(diceState.pendingTasks || [], searchTerm),
      completed: filterTasks(diceState.completedTasks || [], searchTerm),
      abandoned: filterTasks(diceState.abandonedTasks || [], searchTerm)
    };
  }, [diceState, searchTerm, filterTasks]);

  // 检查任务是否逾期的辅助函数
  const isTaskOverdue = (task: any) => {
    if (!task.reminder || !task.reminder.enabled || task.completed || task.isGivenUp) {
      return false;
    }
    
    const reminderDate = task.reminder.date;
    const reminderTime = task.reminder.time;
    
    if (!reminderDate) {
      return false;
    }
    
    // 如果设置了时间，结合日期和时间；否则只使用日期
    const dateTimeStr = reminderTime ? `${reminderDate}T${reminderTime}` : `${reminderDate}T23:59:59`;
    const reminderDateTime = new Date(dateTimeStr);
    const now = new Date();
    
    // 检查是否超过提醒时间
    return now > reminderDateTime;
  };
  
  // 计算各类别逾期未完成任务数量
  const overdueDailyTasksCount = useMemo(() => {
    return habitTasks.filter(task => !task.completed && !task.isGivenUp && isTaskOverdue(task)).length;
  }, [habitTasks]);
  
  const overdueMainTasksCount = useMemo(() => {
    return projectTasks.filter(task => !task.completed && !task.isGivenUp && isTaskOverdue(task)).length;
  }, [projectTasks]);
  
  const overdueRandomTasksCount = useMemo(() => {
    if (!diceState?.pendingTasks) return 0;
    return diceState.pendingTasks.filter((task: any) => {
      // 检查命运骰子任务是否逾期
      if (task.reminder && task.reminder.enabled && task.status !== 'completed') {
        const reminderDate = task.reminder.date;
        const reminderTime = task.reminder.time;
        
        if (!reminderDate) {
          return false;
        }
        
        const dateTimeStr = reminderTime ? `${reminderDate}T${reminderTime}` : `${reminderDate}T23:59:59`;
        const reminderDateTime = new Date(dateTimeStr);
        const now = new Date();
        
        return now > reminderDateTime;
      }
      return false;
    }).length;
  }, [diceState]);
  
  // 计算命运任务总的未完成数量（不考虑时间）
  const pendingRandomTasksCount = useMemo(() => {
    if (!diceState?.pendingTasks) return 0;
    return diceState.pendingTasks.length;
  }, [diceState]);
  
  // 使用useMemo缓存任务完成进度计算结果
  const taskProgress = useMemo(() => {
    if (taskCategory === 'daily') {
      const completed = habitTasks.filter(task => task.completed).length;
      const total = habitTasks.length;
      return total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%';
    } else if (taskCategory === 'main') {
      const totalWeight = projectTasks.length;
      if (totalWeight === 0) return '0%';
      
      const overallProgress = projectTasks.reduce((sum, task) => {
        if (task.completed) {
          return sum + 1;
        } else {
          const subTaskProgress = task.subTasks 
            ? task.subTasks.filter(st => st.completed).length / task.subTasks.length 
            : 0;
          return sum + subTaskProgress;
        }
      }, 0);
      
      return `${Math.round((overallProgress / totalWeight) * 100)}%`;
    } else {
      const completed = diceState?.completedTasks?.length || 0;
      const total = (diceState?.pendingTasks?.length || 0) + completed;
      return total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%';
    }
  }, [taskCategory, habitTasks, projectTasks, diceState]);

  // 使用useCallback缓存事件处理器，避免重复创建函数
  const handleDiceTaskComplete = useCallback((taskId: string) => {
    if (!onUpdateDiceState || !diceState) return;
    
    const taskToComplete = diceState.pendingTasks.find((t: any) => t.id === taskId);
    if (!taskToComplete) return;
    
    const updatedPendingTasks = diceState.pendingTasks.filter((t: any) => t.id !== taskId);
    const completedTask = {
      ...taskToComplete,
      status: 'completed' as const,
      completedAt: new Date().toISOString()
    };
    const updatedCompletedTasks = [...diceState.completedTasks, completedTask];
    
    onUpdateDiceState({
      pendingTasks: updatedPendingTasks,
      completedTasks: updatedCompletedTasks
    });
  }, [onUpdateDiceState, diceState]);

  // 使用useCallback缓存事件处理器
  const handleDiceTaskAbandon = useCallback((taskId: string) => {
    if (!onUpdateDiceState || !diceState) return;
    
    const taskToAbandon = diceState.pendingTasks.find((t: any) => t.id === taskId);
    if (!taskToAbandon) return;
    
    const updatedPendingTasks = diceState.pendingTasks.filter((t: any) => t.id !== taskId);
    const abandonedTask = {
      ...taskToAbandon,
      status: 'abandoned' as const,
      abandonedAt: new Date().toISOString()
    };
    const updatedAbandonedTasks = [...(diceState.abandonedTasks || []), abandonedTask];
    
    onUpdateDiceState({
      pendingTasks: updatedPendingTasks,
      abandonedTasks: updatedAbandonedTasks
    });
  }, [onUpdateDiceState, diceState]);

  return (
    <div className="space-y-4">
      {/* 任务分类导航 */}
      <div className={`${cardBg} border p-2 sm:p-3 rounded-xl flex flex-wrap items-center justify-between gap-2`}>
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <button 
            onClick={() => setTaskCategory('daily')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all font-semibold text-xs sm:text-sm ${
              taskCategory === 'daily' 
                ? (isNeomorphic 
                  ? (theme === 'neomorphic-dark' 
                    ? 'bg-[#1e1e2e] text-blue-400 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]' 
                    : 'bg-[#e0e5ec] text-blue-600 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]')
                  : (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'))
                : (isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            <ListTodo size={14} /> 日常任务
            {overdueDailyTasksCount > 0 && (
              <span className="ml-1 relative flex h-5 w-5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center text-[8px] font-bold text-white">
                  {overdueDailyTasksCount > 9 ? '9+' : overdueDailyTasksCount}
                </span>
              </span>
            )}
          </button>
          <button 
            onClick={() => setTaskCategory('main')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all font-semibold text-xs sm:text-sm ${
              taskCategory === 'main' 
                ? (isNeomorphic 
                  ? (theme === 'neomorphic-dark' 
                    ? 'bg-[#1e1e2e] text-purple-400 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]' 
                    : 'bg-[#e0e5ec] text-purple-600 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]')
                  : (isDark ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'))
                : (isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            <Target size={14} /> 主线任务
            {overdueMainTasksCount > 0 && (
              <span className="ml-1 relative flex h-5 w-5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center text-[8px] font-bold text-white">
                  {overdueMainTasksCount > 9 ? '9+' : overdueMainTasksCount}
                </span>
              </span>
            )}
          </button>
          <button 
            onClick={() => setTaskCategory('random')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all font-semibold text-xs sm:text-sm ${
              taskCategory === 'random' 
                ? (isNeomorphic 
                  ? (theme === 'neomorphic-dark' 
                    ? 'bg-[#1e1e2e] text-yellow-400 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]' 
                    : 'bg-[#e0e5ec] text-yellow-600 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]')
                  : (isDark ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white'))
                : (isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-slate-500 hover:text-slate-800')
            }`}
          >
            <Sparkles size={14} /> 命运骰子
            {(overdueRandomTasksCount > 0 || pendingRandomTasksCount > 0) && (
              <span className="ml-1 relative flex h-5 w-5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center text-[8px] font-bold text-white">
                  {pendingRandomTasksCount > 0 
                    ? (pendingRandomTasksCount > 9 ? '9+' : pendingRandomTasksCount)
                    : 0}
                </span>
              </span>
            )}
          </button>
          {onShowHelp && (
            <GlobalHelpButton 
              helpId="tasks" 
              onHelpClick={onShowHelp} 
              size={14} 
              variant="ghost"
              className="ml-1"
            />
          )}
        </div>

        {/* 任务进度条 */}
        <div className="w-full sm:w-auto sm:flex-1 sm:max-w-xs">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={textSub}>进度</span>
            <span className="font-mono font-bold text-blue-500">{taskProgress}</span>
          </div>
          <div className={`w-full h-2.5 rounded-full overflow-hidden shadow-inner ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}>
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: taskProgress }}
            ></div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <TaskSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        theme={theme}
        isDark={isDark}
        isNeomorphic={isNeomorphic}
        textMain={textMain}
        textSub={textSub}
        onAddTask={onAddTask}
      />

      {/* 任务列表区域 */}
      {taskCategory === 'daily' && (
        <TaskList
          tasks={filteredHabitTasks}
          category="daily"
          onCompleteTask={onCompleteTask}
          onGiveUpTask={onGiveUpTask}
          onOpenEditTask={onOpenEditTask}
          onToggleSubTask={onToggleSubTask}
          onGiveUpSubTask={onGiveUpSubTask}
          onStartTimer={onStartTimer}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          draggedTask={draggedTask}
          cardBg={cardBg}
          textMain={textMain}
          theme={theme}
          isDark={isDark}
          isNeomorphic={isNeomorphic}
        />
      )}

      {taskCategory === 'main' && (
        <TaskList
          tasks={filteredProjectTasks}
          category="main"
          onCompleteTask={onCompleteTask}
          onGiveUpTask={onGiveUpTask}
          onOpenEditTask={onOpenEditTask}
          onToggleSubTask={onToggleSubTask}
          onGiveUpSubTask={onGiveUpSubTask}
          onStartTimer={onStartTimer}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          draggedTask={draggedTask}
          cardBg={cardBg}
          textMain={textMain}
          theme={theme}
          isDark={isDark}
          isNeomorphic={isNeomorphic}
        />
      )}

      {taskCategory === 'random' && (
        <div className="space-y-4">
          {/* 3D命运骰子组件 */}
          <div className="w-full">
            <FateDice 
              theme={theme}
              diceState={diceState}
              onSpinDice={onSpinDice}
              onUpdateDiceState={onUpdateDiceState}
              onAddFloatingReward={onAddFloatingReward}
            />
          </div>
          
          {/* 命运骰子任务列表 */}
          <DiceTaskList
            pendingTasks={filteredDiceTasks.pending}
            completedTasks={filteredDiceTasks.completed}
            abandonedTasks={filteredDiceTasks.abandoned}
            onCompleteTask={handleDiceTaskComplete}
            onAbandonTask={handleDiceTaskAbandon}
            onStartTimer={onStartTimer}
            onHelpClick={onShowHelp}
            cardBg={cardBg}
            textMain={textMain}
            theme={theme}
            isDark={isDark}
            isNeomorphic={isNeomorphic}
          />
        </div>
      )}
    </div>
  );
});

TaskManagement.displayName = 'TaskManagement';

export default TaskManagement;
