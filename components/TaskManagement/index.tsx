/**
 * 任务管理主组件
 * 整合日常任务、主线任务和命运骰子任务
 * 
 * 性能优化：使用React.memo包裹组件，仅在props变化时重新渲染
 */

import React, { useCallback, useMemo, useState } from 'react';
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

  // 函数：计算过期未完成任务数量
  const calculateOverdueTasks = useCallback((tasks: any[], taskType: 'habit' | 'project' | 'dice') => {
    const now = new Date();
    let overdueCount = 0;
    
    tasks.forEach(task => {
      // 检查任务是否有截止日期且未完成
      if (!task.completed && task.reminder && task.reminder.enabled && task.reminder.date) {
        const deadline = new Date(task.reminder.date);
        // 如果截止日期早于当前日期，则视为过期
        if (deadline < now) {
          overdueCount++;
        }
      }
      
      // 如果是项目任务，还需要检查子任务的过期情况
      if (taskType === 'project' && task.subTasks && Array.isArray(task.subTasks)) {
        task.subTasks.forEach(subTask => {
          if (!subTask.completed && subTask.reminder && subTask.reminder.enabled && subTask.reminder.date) {
            const deadline = new Date(subTask.reminder.date);
            if (deadline < now) {
              overdueCount++;
            }
          }
        });
      }
    });
    
    return overdueCount;
  }, []);

  // 计算各类别过期未完成任务数量
  const dailyOverdueCount = useMemo(() => {
    return calculateOverdueTasks(habitTasks, 'habit');
  }, [habitTasks, calculateOverdueTasks]);

  const mainOverdueCount = useMemo(() => {
    return calculateOverdueTasks(projectTasks, 'project');
  }, [projectTasks, calculateOverdueTasks]);

  const randomOverdueCount = useMemo(() => {
    if (!diceState) return 0;
    return calculateOverdueTasks(diceState.pendingTasks || [], 'dice');
  }, [diceState, calculateOverdueTasks]);

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
            className={`relative flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all font-semibold text-xs sm:text-sm ${
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
            {dailyOverdueCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] text-white border border-white">
                {dailyOverdueCount > 9 ? '9+' : dailyOverdueCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setTaskCategory('main')} 
            className={`relative flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all font-semibold text-xs sm:text-sm ${
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
            {mainOverdueCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] text-white border border-white">
                {mainOverdueCount > 9 ? '9+' : mainOverdueCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setTaskCategory('random')} 
            className={`relative flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all font-semibold text-xs sm:text-sm ${
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
            {randomOverdueCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] text-white border border-white">
                {randomOverdueCount > 9 ? '9+' : randomOverdueCount}
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
