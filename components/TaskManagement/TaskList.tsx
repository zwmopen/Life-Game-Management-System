/**
 * 任务列表组件 - 日常任务和主线任务的渲染
 */

import React, { memo, useState } from 'react';
import { Check, X, Edit3, GripVertical, Play } from 'lucide-react';
import { TaskItem } from './types';

interface TaskListProps {
  tasks: TaskItem[];
  category: 'daily' | 'main';
  onCompleteTask: (task: TaskItem, e: React.MouseEvent | null) => void;
  onGiveUpTask: (taskId: string, e: React.MouseEvent) => void;
  onOpenEditTask: (task: TaskItem) => void;
  onToggleSubTask: (projectId: string, subTaskId: string) => void;
  onGiveUpSubTask: (projectId: string, subTaskId: string) => void;
  onStartTimer: (duration: number) => void;
  onDragStart: (task: TaskItem, index: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  draggedTask: TaskItem | null;
  cardBg: string;
  textMain: string;
  theme: string;
  isDark: boolean;
  isNeomorphic: boolean;
  displayMode?: 'card' | 'list';
}

const TaskList: React.FC<TaskListProps> = memo(({
  tasks,
  category,
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
  cardBg,
  textMain,
  theme,
  isDark,
  isNeomorphic,
  displayMode = 'card'
}) => {
  // 状态管理：跟踪每个任务的展开/折叠状态
  const [expandedTasks, setExpandedTasks] = useState<{[key: string]: boolean}>(
    // 初始化状态，默认所有任务都是折叠状态
    tasks.reduce((acc, task) => {
      acc[task.id] = false;
      return acc;
    }, {} as {[key: string]: boolean})
  );
  
  // 切换任务展开/折叠状态
  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  // 日常任务渲染
  const renderDailyTask = (task: TaskItem, index: number) => (
    <div 
      key={task.id} 
      draggable 
      onDragStart={() => onDragStart(task, index)} 
      onDragEnd={onDragEnd} 
      onDragOver={(e) => onDragOver(e, index)} 
      onClick={() => onOpenEditTask(task)} 
      className={`relative group rounded-lg border transition-all overflow-hidden cursor-pointer ${task.completed ? 'opacity-50 grayscale ' + (isDark ? 'bg-zinc-950/50' : 'bg-slate-100') : task.isGivenUp ? 'opacity-70 ' + (isDark ? 'bg-red-950/10 border-red-900/30' : 'bg-red-50 border-red-200') : ''} ${cardBg} ${!task.completed && !task.isGivenUp ? 'hover:shadow-lg' : (isDark ? 'border-zinc-800' : 'border-slate-200')} ${draggedTask && draggedTask.id === task.id ? 'opacity-50 scale-95' : ''}`}
    >
      <div className="p-2 sm:p-3 flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="text-zinc-600 cursor-grab active:cursor-grabbing hidden sm:flex"><GripVertical size={14}/></div>
        <button onClick={(e) => { e.stopPropagation(); onCompleteTask(task, e); }} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : task.isGivenUp ? 'border-red-900 text-red-900 cursor-not-allowed' : (isDark ? 'border-zinc-600 hover:border-emerald-500 text-transparent' : 'border-slate-300 hover:border-emerald-500 bg-white')}`} disabled={task.isGivenUp}>
          {task.completed && <Check size={16} strokeWidth={4} />}
          {task.isGivenUp && <X size={16} strokeWidth={4} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <h3 className={`font-bold truncate min-w-0 text-sm sm:text-base ${task.completed || task.isGivenUp ? 'line-through text-zinc-500' : textMain}`}>
              {task.text}
              {task.isGivenUp && <span className="ml-1 text-[9px] text-red-500 border border-red-900 bg-red-900/20 px-1 rounded font-bold whitespace-nowrap">已放弃</span>}
            </h3>
            <button onClick={() => onOpenEditTask(task)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-blue-500 transition-opacity flex-shrink-0"><Edit3 size={12}/></button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-mono text-zinc-500 mt-1 flex-wrap">
              <span className="text-purple-400">经验 +{task.xp}</span>
              <span className="text-yellow-500">金币 +{task.gold}</span>
              <span className="text-blue-500">时长 {task.duration || 25} 分钟</span>
              {task.reminder && task.reminder.enabled && task.reminder.time && (
                <span className="text-zinc-500 dark:text-zinc-400">{task.reminder.time}</span>
              )}
              <span className="flex items-center gap-1">
                <span className={`${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                  {task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '⚡' : '🌱'}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">{task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}</span>
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <span className="text-zinc-500">{task.completed ? '已完成' : '待处理'}</span>
              </span>
            </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {!task.completed && !task.isGivenUp && (
            <button onClick={(e) => onGiveUpTask(task.id, e)} className="text-zinc-600 hover:text-red-500 p-2 rounded-full hover:bg-red-900/10 transition-colors" title="放弃任务 (无奖励)">
              <X size={16} />
            </button>
          )}
          <button onClick={() => onStartTimer(task.duration || 25)} disabled={task.completed || task.isGivenUp} className={`p-3 rounded-full text-white transition-colors group-hover:scale-105 shadow-lg ${isDark ? 'bg-zinc-800 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'} disabled:opacity-50 disabled:scale-100`}>
            <Play size={16} fill="currentColor"/>
          </button>
        </div>
      </div>
    </div>
  );

  // 主线任务渲染
  const renderMainTask = (task: TaskItem, index: number) => (
    <div 
      key={task.id} 
      draggable 
      onDragStart={() => onDragStart(task, index)} 
      onDragEnd={onDragEnd} 
      onDragOver={(e) => onDragOver(e, index)} 
      onClick={() => onOpenEditTask(task)} 
      className={`relative group rounded-lg border transition-all overflow-hidden cursor-pointer ${task.completed ? 'opacity-50 grayscale ' + (isDark ? 'bg-zinc-950/50' : 'bg-slate-100') : ''} ${cardBg} ${!task.completed ? 'hover:shadow-lg' : (isDark ? 'border-zinc-800' : 'border-slate-200')} ${draggedTask && draggedTask.id === task.id ? 'opacity-50 scale-95' : ''}`}
    >
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onCompleteTask(task, e); }} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : (isDark ? 'border-zinc-600 hover:border-emerald-500 cursor-pointer' : 'border-slate-300 hover:border-emerald-500 bg-white cursor-pointer')}`}>
            {task.completed && <Check size={16} strokeWidth={4} />}
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
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
              <h3 className={`font-bold text-sm sm:text-base ${task.completed ? 'line-through text-zinc-500' : textMain}`}>
                {task.text}
              </h3>
              <button onClick={() => onOpenEditTask(task)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-blue-500 transition-opacity ml-1 p-1 rounded-full hover:bg-blue-900/10"><Edit3 size={12}/></button>
            </div>
            {/* 显示主任务的经验、金币和消耗时长 */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-zinc-500 flex-wrap">
              <span className="text-purple-400">经验 +{task.xp}</span>
              <span className="text-yellow-500">金币 +{task.gold}</span>
              <span className="text-blue-500">时长 {task.subTasks?.reduce((sum, st) => sum + st.duration, 0)} 分钟</span>
              {task.reminder && task.reminder.enabled && task.reminder.time && (
                <span className="text-zinc-500 dark:text-zinc-400">{task.reminder.time}</span>
              )}
              <span className="flex items-center gap-1">
                <span className={`${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                  {task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '⚡' : '🌱'}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">{task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}</span>
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <span className="text-zinc-500">{task.completed ? '已完成' : '待处理'}</span>
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
        </div>
      </div>
      {/* 子任务列表 - 只在任务未完成且展开时显示 */}
      {task.subTasks && !task.completed && expandedTasks[task.id] && (
        <div className={`border-t p-1 sm:p-2 space-y-1 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'border-[#1e1e2e] bg-[#1e1e2e]' : 'border-[#e0e5ec] bg-[#e0e5ec]') : isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-slate-200 bg-slate-50'}`}>
          {task.subTasks.map((st) => {
            // 提取子任务卡片样式逻辑到变量
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
                  <button onClick={(e) => { e.stopPropagation(); onToggleSubTask(task.id, st.id); }} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${st.completed ? 'bg-emerald-500 border-emerald-500 text-white' : (isDark ? 'border-zinc-600 hover:border-emerald-500 text-transparent' : 'border-slate-300 hover:border-emerald-500 bg-white')}`}>
                    {st.completed && <Check size={16} strokeWidth={4} />}
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
                  <button onClick={(e) => { e.stopPropagation(); onGiveUpSubTask(task.id, st.id); }} className="text-zinc-700 hover:text-red-500 p-2 rounded-full opacity-0 group-hover/sub:opacity-100 transition-opacity" title="放弃子任务">
                    <X size={16}/>
                  </button>
                  <button onClick={(e) => { 
                    e.stopPropagation(); 
                    onStartTimer(st.duration || 25);
                  }} className={`p-3 rounded-full text-white transition-colors group-hover/sub:scale-105 shadow-lg ${isDark ? 'bg-zinc-800 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'} opacity-0 group-hover/sub:opacity-100`}>
                    <Play size={16} fill="currentColor"/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // 列表模式的任务渲染
  const renderTaskAsList = (task: TaskItem, index: number) => (
    <div 
      key={task.id} 
      draggable 
      onDragStart={() => onDragStart(task, index)} 
      onDragEnd={onDragEnd} 
      onDragOver={(e) => onDragOver(e, index)} 
      onClick={() => onOpenEditTask(task)} 
      className={`flex items-center gap-2 p-2 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'} ${task.completed ? 'opacity-70' : ''} ${draggedTask && draggedTask.id === task.id ? 'opacity-50 bg-blue-100 dark:bg-blue-900/20' : ''}`}
    >
      <button onClick={(e) => { e.stopPropagation(); onCompleteTask(task, e); }} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : task.isGivenUp ? 'border-red-900 text-red-900 cursor-not-allowed' : (isDark ? 'border-zinc-600 hover:border-emerald-500 text-transparent' : 'border-slate-300 hover:border-emerald-500 bg-white')}`} disabled={task.isGivenUp}>
        {task.completed && <Check size={12} strokeWidth={4} />}
        {task.isGivenUp && <X size={12} strokeWidth={4} />}
      </button>
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-medium truncate ${task.completed || task.isGivenUp ? 'line-through text-zinc-500' : textMain}`}>
          {task.text}
          {task.isGivenUp && <span className="ml-1 text-[9px] text-red-500 border border-red-900 bg-red-900/20 px-1 rounded font-bold whitespace-nowrap">已放弃</span>}
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 flex-wrap">
          <span className="text-purple-400">+{task.xp}</span>
          <span className="text-yellow-500">+{task.gold}</span>
          <span className="text-blue-500">{task.duration || 25}m</span>
          {task.reminder && task.reminder.enabled && task.reminder.time && (
            <span className="text-zinc-500 dark:text-zinc-400">{task.reminder.time}</span>
          )}
          <span className={`${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
            {task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '⚡' : '🌱'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {!task.completed && !task.isGivenUp && (
          <button onClick={(e) => onGiveUpTask(task.id, e)} className="text-zinc-600 hover:text-red-500 p-1 rounded-full hover:bg-red-900/10 transition-colors" title="放弃任务 (无奖励)">
            <X size={12} />
          </button>
        )}
        <button onClick={() => onStartTimer(task.duration || 25)} disabled={task.completed || task.isGivenUp} className={`p-2 rounded-full text-white transition-colors ${isDark ? 'bg-zinc-800 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'} disabled:opacity-50`}>
          <Play size={12} fill="currentColor"/>
        </button>
      </div>
    </div>
  );

  return (
    <div className="mb-4">
      {displayMode === 'list' ? (
        <div className={`rounded-lg border ${cardBg} overflow-hidden`}>
          {tasks.map((task, index) => renderTaskAsList(task, index))}
          {tasks.length === 0 && (
            <div className="p-4 text-center text-zinc-500 text-sm">
              暂无任务
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {category === 'daily' && tasks.map((task, index) => renderDailyTask(task, index))}
          {category === 'main' && tasks.map((task, index) => renderMainTask(task, index))}
          {tasks.length === 0 && (
            <div className={`${cardBg} border rounded-lg p-4 text-center text-zinc-500 text-sm`}>
              暂无任务
            </div>
          )}
        </div>
      )}
    </div>
  );
});

TaskList.displayName = 'TaskList';

export default TaskList;
