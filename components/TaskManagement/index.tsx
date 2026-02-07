/**
 * 任务管理主组件
 * 整合日常任务、主线任务和命运骰子任务
 * 
 * @component
 * @description 任务管理模块是游戏的核心功能之一，允许用户管理日常显化、时间盒子和命运骰子任务
 * @param {number} balance - 用户当前余额
 * @param {Function} onUpdateBalance - 更新余额的回调函数
 * @param {Array} habitTasks - 习惯任务列表
 * @param {Array} projectTasks - 项目任务列表
 * @param {Object} diceState - 命运骰子状态
 * @param {Array} habits - 习惯列表
 * @param {Array} projects - 项目列表
 * @param {string} taskCategory - 当前任务分类
 * @param {Function} setTaskCategory - 设置任务分类的回调函数
 * @param {Function} onCompleteTask - 完成任务的回调函数
 * @param {Function} onGiveUpTask - 放弃任务的回调函数
 * @param {Function} onOpenEditTask - 打开任务编辑的回调函数
 * @param {Function} onToggleSubTask - 切换子任务状态的回调函数
 * @param {Function} onGiveUpSubTask - 放弃子任务的回调函数
 * @param {Function} onStartTimer - 开始计时器的回调函数
 * @param {Function} onDragStart - 开始拖拽的回调函数
 * @param {Function} onDragEnd - 结束拖拽的回调函数
 * @param {Function} onDragOver - 拖拽经过的回调函数
 * @param {Object} draggedTask - 正在拖拽的任务
 * @param {Function} onSpinDice - 旋转骰子的回调函数
 * @param {Function} onUpdateDiceState - 更新骰子状态的回调函数
 * @param {Function} onDiceResult - 处理骰子结果的回调函数
 * @param {Function} onChangeDuration - 更改时长的回调函数
 * @param {Function} onToggleTimer - 切换计时器的回调函数
 * @param {Function} onAddFloatingReward - 添加浮动奖励的回调函数
 * @param {string} theme - 当前主题
 * @param {string} cardBg - 卡片背景样式
 * @param {string} textMain - 主文本样式
 * @param {string} textSub - 次文本样式
 * @param {boolean} isDark - 是否为深色模式
 * @param {boolean} isNeomorphic - 是否为拟态风格
 * @param {Function} onShowHelp - 显示帮助的回调函数
 * @param {string} todayStr - 今日日期字符串
 * @param {Function} setIsImmersive - 设置沉浸式模式的回调函数
 * @param {Function} onAddTask - 添加任务的回调函数
 * @param {Function} onOpenTaskManagement - 打开任务管理的回调函数
 * @param {Function} setIsNavCollapsed - 设置导航栏折叠状态的回调函数
 * 
 * @example
 * // 基本用法
 * <TaskManagement
 *   habitTasks={habitTasks}
 *   projectTasks={projectTasks}
 *   diceState={diceState}
 *   habits={habits}
 *   projects={projects}
 *   taskCategory={taskCategory}
 *   setTaskCategory={setTaskCategory}
 *   onCompleteTask={onCompleteTask}
 *   onGiveUpTask={onGiveUpTask}
 *   onOpenEditTask={onOpenEditTask}
 *   onToggleSubTask={onToggleSubTask}
 *   onGiveUpSubTask={onGiveUpSubTask}
 *   onStartTimer={onStartTimer}
 *   onDragStart={onDragStart}
 *   onDragEnd={onDragEnd}
 *   onDragOver={onDragOver}
 *   draggedTask={draggedTask}
 *   onSpinDice={onSpinDice}
 *   onUpdateDiceState={onUpdateDiceState}
 *   onDiceResult={onDiceResult}
 *   onChangeDuration={onChangeDuration}
 *   onToggleTimer={onToggleTimer}
 *   onAddFloatingReward={onAddFloatingReward}
 *   theme={theme}
 *   cardBg={cardBg}
 *   textMain={textMain}
 *   textSub={textSub}
 *   isDark={isDark}
 *   isNeomorphic={isNeomorphic}
 *   onShowHelp={onShowHelp}
 *   todayStr={todayStr}
 *   setIsImmersive={setIsImmersive}
 *   onAddTask={onAddTask}
 *   onOpenTaskManagement={onOpenTaskManagement}
 *   setIsNavCollapsed={setIsNavCollapsed}
 * />
 * 
 * @returns {JSX.Element} 任务管理组件
 * 
 * @performance 使用React.memo包裹组件，仅在props变化时重新渲染
 * @see TaskList - 任务列表组件
 * @see DiceTaskList - 命运骰子任务列表组件
 * @see FateDice - 命运骰子组件
 */

import React, { useCallback, useMemo, useState } from 'react';
import { logInfo, logError, logWarn } from '../../utils/logger';
import { ListTodo, Target, Sparkles, Plus, Clock, Edit3, X } from 'lucide-react';
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
  onAddTask,
  onOpenTaskManagement,
  setIsNavCollapsed
}) => {
  
  // 搜索状态
  const [searchTerm, setSearchTerm] = useState('');
  
  // 状态管理：跟踪每个任务的展开/折叠状态
  const [expandedTasks, setExpandedTasks] = useState<{[key: string]: boolean}>(
    // 初始化状态，默认所有任务都是折叠状态
    projectTasks.reduce((acc, task) => {
      acc[task.id] = false;
      return acc;
    }, {} as {[key: string]: boolean})
  );
  
  // 状态管理：跟踪正在进行番茄钟计时的任务
  const [activeTasks, setActiveTasks] = useState<Set<string>>(new Set());
  
  // 状态管理：任务排序方式
  const [taskSorting, setTaskSorting] = useState<'priority' | 'dueDate' | 'creationDate' | 'progress'>('priority');
  
  // 状态管理：任务筛选
  const [taskFilter, setTaskFilter] = useState<'all' | 'completed' | 'pending' | 'overdue'>('all');
  
  // 状态管理：显示模式
  const [displayMode, setDisplayMode] = useState<'card' | 'list'>('card');
  
  // 排序任务函数
  const sortTasks = useCallback((tasks: any[]) => {
    return [...tasks].sort((a, b) => {
      switch (taskSorting) {
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - 
                 (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
        case 'dueDate':
          const dateA = a.reminder?.date ? new Date(a.reminder.date) : new Date(8640000000000000);
          const dateB = b.reminder?.date ? new Date(b.reminder.date) : new Date(8640000000000000);
          return dateA.getTime() - dateB.getTime();
        case 'creationDate':
          const createdA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const createdB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return createdB.getTime() - createdA.getTime();
        case 'progress':
          const progressA = a.completed ? 100 : 
            a.subTasks ? (a.subTasks.filter(st => st.completed).length / a.subTasks.length) * 100 : 0;
          const progressB = b.completed ? 100 : 
            b.subTasks ? (b.subTasks.filter(st => st.completed).length / b.subTasks.length) * 100 : 0;
          return progressA - progressB;
        default:
          return 0;
      }
    });
  }, [taskSorting]);
  
  // 筛选任务函数
  const filterTasksByStatus = useCallback((tasks: any[]) => {
    switch (taskFilter) {
      case 'completed':
        return tasks.filter(task => task.completed);
      case 'pending':
        return tasks.filter(task => !task.completed && !isTaskOverdue(task));
      case 'overdue':
        return tasks.filter(task => !task.completed && isTaskOverdue(task));
      default:
        return tasks;
    }
  }, [taskFilter]);
  
  // 切换任务展开/折叠状态
  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  // 开始任务的番茄钟计时
  const startTaskTimer = (taskId: string) => {
    setActiveTasks(prev => new Set(prev).add(taskId));
  };
  
  // 停止任务的番茄钟计时
  const stopTaskTimer = (taskId: string) => {
    setActiveTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  };

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
  const filteredHabitTasks = useMemo(() => {
    let filtered = filterTasks(habitTasks, searchTerm);
    filtered = filterTasksByStatus(filtered);
    filtered = sortTasks(filtered);
    return filtered;
  }, [habitTasks, searchTerm, filterTasks, filterTasksByStatus, sortTasks]);

  const filteredProjectTasks = useMemo(() => {
    let filtered = filterTasks(projectTasks, searchTerm);
    filtered = filterTasksByStatus(filtered);
    filtered = sortTasks(filtered);
    return filtered;
  }, [projectTasks, searchTerm, filterTasks, filterTasksByStatus, sortTasks]);

  const filteredDiceTasks = useMemo(() => {
    if (!diceState) return { pending: [], completed: [], abandoned: [] };
    return {
      pending: sortTasks(filterTasks(diceState.pendingTasks || [], searchTerm)),
      completed: filterTasks(diceState.completedTasks || [], searchTerm),
      abandoned: filterTasks(diceState.abandonedTasks || [], searchTerm)
    };
  }, [diceState, searchTerm, filterTasks, sortTasks]);

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
      const percentage = total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%';
      return { percentage, completed, total };
    } else if (taskCategory === 'main' || taskCategory === 'timebox') {
      const totalWeight = projectTasks.length;
      if (totalWeight === 0) return { percentage: '0%', completed: 0, total: 0 };
      
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
      
      const percentage = `${Math.round((overallProgress / totalWeight) * 100)}%`;
      const completed = projectTasks.filter(task => task.completed).length;
      return { percentage, completed, total: totalWeight };
    } else {
      const completed = diceState?.completedTasks?.length || 0;
      const total = (diceState?.pendingTasks?.length || 0) + completed;
      const percentage = total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%';
      return { percentage, completed, total };
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
    
    // 播放任务完成音效
    const completeSound = new Audio("/audio/sfx/日常任务完成音效.mp3");
    completeSound.volume = 0.5;
    completeSound.play().catch(() => {});
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
      <div className={`${cardBg} border p-2 sm:p-3 rounded-xl flex flex-wrap items-center gap-3`}>
        <div className="flex items-center gap-1 sm:gap-2 pb-1 flex-shrink-0 flex-nowrap">
          <button 
            onClick={() => setTaskCategory('daily')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all font-semibold text-xs sm:text-sm whitespace-nowrap ${
              taskCategory === 'daily' 
                ? (isNeomorphic 
                  ? (theme === 'neomorphic-dark' 
                    ? 'bg-[#1e1e2e] text-blue-400 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]' 
                    : 'bg-[#e0e5ec] text-blue-600 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]')
                  : (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'))
                : (isNeomorphic 
                  ? (theme === 'neomorphic-dark' 
                    ? 'bg-[#1e1e2e] text-blue-400 shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(30,30,46,0.8)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' 
                    : 'bg-[#e0e5ec] text-blue-600 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]')
                  : (isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-slate-500 hover:text-slate-800'))
            }`}
          >
            <ListTodo size={14} /> 日常显化
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
            onClick={() => setTaskCategory('timebox')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all font-semibold text-xs sm:text-sm whitespace-nowrap ${
              taskCategory === 'timebox' 
                ? (isNeomorphic 
                  ? (theme === 'neomorphic-dark' 
                    ? 'bg-[#1e1e2e] text-green-400 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]' 
                    : 'bg-[#e0e5ec] text-green-600 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]')
                  : (isDark ? 'bg-green-600 text-white' : 'bg-green-500 text-white'))
                : (isNeomorphic 
                  ? (theme === 'neomorphic-dark' 
                    ? 'bg-[#1e1e2e] text-green-400 shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(30,30,46,0.8)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' 
                    : 'bg-[#e0e5ec] text-green-600 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]')
                  : (isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-slate-500 hover:text-slate-800'))
            }`}
          >
            <Target size={14} /> 时间盒子
          </button>
          <button 
            onClick={() => setTaskCategory('random')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all font-semibold text-xs sm:text-sm whitespace-nowrap ${
              taskCategory === 'random' 
                ? (isNeomorphic 
                  ? (theme === 'neomorphic-dark' 
                    ? 'bg-[#1e1e2e] text-yellow-400 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]' 
                    : 'bg-[#e0e5ec] text-yellow-600 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]')
                  : (isDark ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white'))
                : (isNeomorphic 
                  ? (theme === 'neomorphic-dark' 
                    ? 'bg-[#1e1e2e] text-yellow-400 shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(30,30,46,0.8)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' 
                    : 'bg-[#e0e5ec] text-yellow-600 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]')
                  : (isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-slate-500 hover:text-slate-800'))
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
          <button 
            onClick={onOpenTaskManagement} 
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all font-semibold text-xs sm:text-sm whitespace-nowrap ${
              isNeomorphic 
                ? (theme === 'neomorphic-dark' 
                  ? 'bg-[#1e1e2e] text-emerald-400 shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(30,30,46,0.8)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' 
                  : 'bg-[#e0e5ec] text-emerald-600 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') 
                : (isDark ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white')
            }`}
          >
            <Plus size={14} /> 管理
          </button>
          {onShowHelp && (
            <GlobalHelpButton 
              helpId="tasks" 
              onHelpClick={onShowHelp} 
              size={14} 
              variant="ghost"
              className="ml-1 flex-shrink-0"
            />
          )}
        </div>

        {/* 任务进度条 */}
        <div className="flex-1 min-w-[200px] sm:min-w-[300px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={textSub}>当前任务完成率<span className="font-black">{taskProgress.percentage}</span>，<span className="font-black">{taskProgress.completed} / {taskProgress.total}</span> 个任务已完成</span>
          </div>
          <div className={`w-full h-2.5 rounded-full overflow-hidden ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]') : (isDark ? 'bg-zinc-800 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),inset_-3px_-3px_6px_rgba(50,50,50,0.3)]' : 'bg-slate-200 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]')}`}>
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: taskProgress.percentage }}
            ></div>
          </div>
        </div>
      </div>

      {/* 任务控制栏：排序、筛选、显示模式 */}
      <div className={`${cardBg} border p-2 sm:p-3 rounded-xl flex flex-wrap items-center gap-3`}>
        {/* 排序控制 */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-500">排序：</label>
          <select 
            value={taskSorting} 
            onChange={(e) => setTaskSorting(e.target.value as any)} 
            className={`text-xs px-2 py-1 rounded-lg border ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-[#1e1e2e] text-zinc-300' : 'bg-[#e0e5ec] border-[#e0e5ec] text-zinc-700') : isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'}`}
          >
            <option value="priority">按优先级</option>
            <option value="dueDate">按截止日期</option>
            <option value="creationDate">按创建日期</option>
            <option value="progress">按进度</option>
          </select>
        </div>
        
        {/* 筛选控制 */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-500">筛选：</label>
          <select 
            value={taskFilter} 
            onChange={(e) => setTaskFilter(e.target.value as any)} 
            className={`text-xs px-2 py-1 rounded-lg border ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-[#1e1e2e] text-zinc-300' : 'bg-[#e0e5ec] border-[#e0e5ec] text-zinc-700') : isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'}`}
          >
            <option value="all">全部任务</option>
            <option value="pending">待处理</option>
            <option value="completed">已完成</option>
            <option value="overdue">逾期</option>
          </select>
        </div>
        
        {/* 显示模式 */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-500">显示：</label>
          <div className="flex gap-1">
            <button 
                onClick={() => setDisplayMode('card')} 
                className={`text-xs px-2 py-1 rounded-lg transition-all ${displayMode === 'card' ? (isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] text-blue-400 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] text-blue-600 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]') : (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')) : (isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] text-blue-400 shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] text-blue-600 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)]') : (isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-slate-500 hover:text-slate-800'))}`}
              >
                卡片
              </button>
              <button 
                onClick={() => setDisplayMode('list')} 
                className={`text-xs px-2 py-1 rounded-lg transition-all ${displayMode === 'list' ? (isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] text-blue-400 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] text-blue-600 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]') : (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')) : (isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] text-blue-400 shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] text-blue-600 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)]') : (isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-slate-500 hover:text-slate-800'))}`}
              >
                列表
              </button>
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
          displayMode={displayMode}
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
          displayMode={displayMode}
        />
      )}

      {taskCategory === 'timebox' && (
        <div className={`${cardBg} border p-4 rounded-xl transition-all duration-300 hover:shadow-lg`}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Clock size={16}/> 时间盒子
            </div>
          </div>
          <div className="space-y-6">
            <div className="text-xs text-zinc-500">
              基于Elon Musk时间管理方法，将大任务分解为25-90分钟的专注时段
            </div>
            
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`${cardBg} border rounded-lg p-3 transition-all duration-300 hover:shadow-md`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-medium text-zinc-600">完成率</h3>
                  <span className="text-xs text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </span>
                </div>
                <p className="text-lg font-bold text-zinc-700">0%</p>
                <p className="text-xs text-zinc-500">0/3 任务已完成</p>
              </div>
              
              <div className={`${cardBg} border rounded-lg p-3 transition-all duration-300 hover:shadow-md`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-medium text-zinc-600">已完成任务</h3>
                  <span className="text-xs text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </span>
                </div>
                <p className="text-lg font-bold text-zinc-700">0</p>
                <p className="text-xs text-zinc-500">你做得很好！</p>
              </div>
              
              <div className={`${cardBg} border rounded-lg p-3 transition-all duration-300 hover:shadow-md`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-medium text-zinc-600">平均专注时间</h3>
                  <span className="text-xs text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </span>
                </div>
                <p className="text-lg font-bold text-zinc-700">105 分钟</p>
                <p className="text-xs text-zinc-500">每个已完成任务</p>
              </div>
              
              <div className={`${cardBg} border rounded-lg p-3 transition-all duration-300 hover:shadow-md`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-medium text-zinc-600">效率得分</h3>
                  <span className="text-xs text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </span>
                </div>
                <p className="text-lg font-bold text-zinc-700">{Math.max(0, Math.round((projectTasks.filter(task => task.completed).length / Math.max(1, projectTasks.length)) * 100 - (projectTasks.length - projectTasks.filter(task => task.completed).length) * 5))}</p>
                <p className="text-xs text-zinc-500">基于完成情况和时间</p>
              </div>
            </div>
            
            {/* 今日焦点 */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold text-zinc-700">今日焦点</h2>
                <div className="flex space-x-2">
                  {/* 帮助按钮 */}
                  {onShowHelp && (
                    <button
                      onClick={() => onShowHelp('time-box')}
                      className="flex items-center justify-center text-zinc-500 hover:text-blue-400 p-1 rounded-full"
                      aria-label="帮助"
                      title="查看说明"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* 任务列表 */}
              <div className="flex flex-col gap-4">
                {projectTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`relative group rounded-lg border transition-all duration-300 overflow-hidden cursor-pointer ${task.completed ? 'opacity-50 grayscale ' + (isDark ? 'bg-zinc-950/50' : 'bg-slate-100') : ''} ${cardBg} ${!task.completed ? 'hover:shadow-lg hover:scale-[1.01]' : (isDark ? 'border-zinc-800' : 'border-slate-200')}`}
                  >
                    <div className="p-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => onCompleteTask(task, e)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white scale-[1.05]' : (isDark ? 'border-zinc-600 hover:border-emerald-500 cursor-pointer hover:scale-[1.05]' : 'border-slate-300 hover:border-emerald-500 bg-white cursor-pointer hover:scale-[1.05]')}`}>
                          {task.completed && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            {task.subTasks && !task.completed && (
                              <button 
                                onClick={() => toggleTaskExpanded(task.id)}
                                className="w-4 h-4 mr-1 text-zinc-500 hover:text-blue-500 transition-colors flex items-center justify-center"
                                title={expandedTasks[task.id] ? '收起子任务' : '展开子任务'}
                              >
                                {expandedTasks[task.id] ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9l6 6 6-6"/>
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 15l-6-6-6 6"/>
                                  </svg>
                                )}
                              </button>
                            )}
                            <h3 className={`font-bold ${task.completed ? 'line-through text-zinc-500' : textMain}`}>
                              {task.text}
                            </h3>
                            <button onClick={() => onOpenEditTask(task)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-blue-500 transition-opacity ml-1"><Edit3 size={12}/></button>
                          </div>
                          {/* 显示主任务的经验、金币、消耗时长、优先级和状态 */}
                          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-zinc-500 flex-wrap">
                            <span className="text-purple-400">经验 +{task.xp}</span>
                            <span className="text-yellow-500">金币 +{task.gold}</span>
                            <span className="text-blue-500">时长 {task.subTasks?.reduce((sum, st) => sum + st.duration, 0)} 分钟</span>
                            {task.reminder && task.reminder.enabled && task.reminder.time && (
                              <span className="text-zinc-500 dark:text-zinc-400">时间 {task.reminder.time}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <span className={`${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                                {task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '⚡' : '🌱'}
                              </span>
                              <span className="text-zinc-500 dark:text-zinc-400">{task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                              <span className="text-zinc-500">{task.completed ? '已完成' : activeTasks.has(task.id) ? '进行中' : '待处理'}</span>
                            </span>
                          </div>
                          {/* 主线任务进度条 */}
                          {!task.completed && task.subTasks && (
                            <div className="mt-1.5">
                              <div className="flex items-center justify-end text-xs mb-0.5">
                                <span className="font-mono text-blue-500">{Math.round((task.subTasks.filter(st => st.completed).length / task.subTasks.length) * 100)}%</span>
                              </div>
                              <div className={`w-full h-2 rounded-full overflow-hidden ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-800 shadow-inner' : 'bg-slate-200 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'}`}>
                                <div 
                                  className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${(task.subTasks.filter(st => st.completed).length / task.subTasks.length) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          {!task.completed && (
                            <button onClick={(e) => onGiveUpTask(task.id, e)} className="text-zinc-600 hover:text-red-500 p-2 rounded-full hover:bg-red-900/10 transition-all duration-300 hover:scale-[1.1] active:scale-[0.95]" title="放弃任务 (无奖励)">
                              <X size={16} />
                            </button>
                          )}
                          <button onClick={() => { onStartTimer(task.duration || 25); startTaskTimer(task.id); }} disabled={task.completed} className={`p-3 rounded-full text-white transition-all duration-300 group-hover:scale-110 active:scale-95 shadow-lg ${isDark ? 'bg-zinc-800 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'} disabled:opacity-50 disabled:scale-100`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* 子任务列表 - 只在任务未完成、有子任务且展开时显示 */}
                    {task.subTasks && !task.completed && expandedTasks[task.id] && (
                      <div className={`border-t p-1 sm:p-2 space-y-1 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'border-[#1e1e2e] bg-[#1e1e2e]' : 'border-[#e0e5ec] bg-[#e0e5ec]') : isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-slate-200 bg-slate-50'}`}>
                        {task.subTasks.map((st) => {
                          let subTaskCardClass = 'flex flex-wrap items-center justify-between gap-1 sm:gap-2 p-1.5 rounded cursor-pointer group/sub transition-all';
                          
                          if (isNeomorphic) {
                            if (theme === 'neomorphic-dark') {
                              subTaskCardClass += ' bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(30,30,46,0.8)]';
                            } else {
                              subTaskCardClass += ' bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.8)] hover:shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,1)]';
                            }
                          } else {
                            subTaskCardClass += isDark ? ' hover:bg-white/5' : ' hover:bg-white border border-transparent hover:border-slate-200';
                          }
                          
                          return (
                            <div 
                              key={st.id} 
                              className={subTaskCardClass}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <button onClick={(e) => onToggleSubTask(task.id, st.id)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${st.completed ? 'bg-emerald-500 border-emerald-500 text-white' : (isDark ? 'border-zinc-600 hover:border-emerald-500 text-transparent' : 'border-slate-300 hover:border-emerald-500 bg-white')}`}>
                                  {st.completed && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                </button>
                                <span className={`text-sm truncate ${st.completed ? 'text-zinc-600 line-through' : textMain} transition-all`}>
                                  {st.text}
                                </span>
                              </div>
                              {/* 显示子任务的经验、金币和时长 */}
                              <div className="flex items-center gap-1 sm:gap-2 text-xs font-mono text-zinc-500 flex-wrap mb-1 sm:mb-0">
                                <span className="text-purple-400">+{st.xp}</span>
                                <span className="text-yellow-500">+{st.gold}</span>
                                <span className="text-blue-500">{st.duration}m</span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-0.5">
                                <button onClick={() => { onStartTimer(st.duration || 25); startTaskTimer(task.id); }} className={`p-2 rounded-full text-white transition-colors hover:scale-110 shadow-lg ${isDark ? 'bg-zinc-800 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'} opacity-0 group-hover/sub:opacity-100`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
            onOpenEditTask={onOpenEditTask}
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
