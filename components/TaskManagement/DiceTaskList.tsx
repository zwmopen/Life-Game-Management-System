/**
 * 命运骰子任务列表组件
 * 显示待完成、已完成和已放弃的任务
 */

import React, { memo } from 'react';
import { Check, X, Play, Edit3 } from 'lucide-react';
import { GlobalHelpButton } from '../HelpSystem';
import { DiceTaskRecord } from './types';

interface DiceTaskListProps {
  pendingTasks: DiceTaskRecord[];
  completedTasks: DiceTaskRecord[];
  abandonedTasks?: DiceTaskRecord[];
  onCompleteTask: (taskId: string) => void;
  onAbandonTask: (taskId: string) => void;
  onStartTimer: (duration: number) => void;
  onOpenEditTask: (task: any) => void;
  onHelpClick?: (helpId: string) => void;
  cardBg: string;
  textMain: string;
  theme: string;
  isDark: boolean;
  isNeomorphic: boolean;
}

const DiceTaskList: React.FC<DiceTaskListProps> = memo(({
  pendingTasks,
  completedTasks,
  abandonedTasks = [],
  onCompleteTask,
  onAbandonTask,
  onStartTimer,
  onOpenEditTask,
  onHelpClick,
  cardBg,
  textMain,
  theme,
  isDark,
  isNeomorphic
}) => {
  // 渲染单个任务卡片
  const renderTaskCard = (taskRecord: DiceTaskRecord, isPending: boolean = false) => (
    <div 
      key={taskRecord.id} 
      onClick={() => onOpenEditTask({...taskRecord.task, id: taskRecord.id, type: 'random', gold: taskRecord.generatedGold, xp: taskRecord.generatedXp, completed: taskRecord.status === 'completed', frequency: 'once'})}
      className={`relative group rounded-lg border transition-all overflow-hidden cursor-pointer ${cardBg} hover:shadow-lg ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}
    >
      <div className="p-2 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        {isPending ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onCompleteTask(taskRecord.id);
            }} 
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isDark ? 'border-zinc-600 hover:border-emerald-500 text-transparent' : 'border-slate-300 hover:border-emerald-500 bg-white'} active:scale-95`}
          >
            <Check size={16} strokeWidth={4} className="text-transparent hover:text-white transition-colors" />
          </button>
        ) : (
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 bg-emerald-500 border-emerald-500 text-white`}>
            <Check size={16} strokeWidth={4} />
          </div>
        )}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
            <h3 
              onClick={() => onOpenEditTask({...taskRecord.task, id: taskRecord.id, type: 'random', gold: taskRecord.generatedGold, xp: taskRecord.generatedXp, completed: taskRecord.status === 'completed', frequency: 'once'})}
              className={`font-bold truncate min-w-0 ${isPending ? textMain : 'text-zinc-500 line-through'}`}
            >
              {taskRecord.task.text}
            </h3>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onOpenEditTask({...taskRecord.task, id: taskRecord.id, type: 'random', gold: taskRecord.generatedGold, xp: taskRecord.generatedXp, completed: taskRecord.status === 'completed', frequency: 'once'});
              }} 
              className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-blue-500 transition-opacity ml-1 p-1 rounded-full hover:bg-blue-900/10 flex-shrink-0"
            >
              <Edit3 size={12}/>
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono text-zinc-500 mt-1 flex-wrap">
            <span className="text-purple-400">经验 +{taskRecord.generatedXp}</span>
            <span className="text-yellow-500">金币 +{taskRecord.generatedGold}</span>
            {taskRecord.task.duration && (
              <span className="text-blue-500">时长 {taskRecord.task.duration}m</span>
            )}
            {taskRecord.task.reminder && taskRecord.task.reminder.enabled && taskRecord.task.reminder.time && (
              <span className="text-zinc-500 dark:text-zinc-400">{taskRecord.task.reminder.time}</span>
            )}
            {taskRecord.task.priority && (
              <span className="flex items-center gap-1">
                <span className={`${taskRecord.task.priority === 'high' ? 'text-red-500' : taskRecord.task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                  {taskRecord.task.priority === 'high' ? '🔥' : taskRecord.task.priority === 'medium' ? '⚡' : '🌱'}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">{taskRecord.task.priority === 'high' ? '高' : taskRecord.task.priority === 'medium' ? '中' : '低'}</span>
              </span>
            )}
          </div>
        </div>
        {isPending && (
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-start sm:justify-end">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAbandonTask(taskRecord.id);
              }} 
              className="text-zinc-600 hover:text-red-500 p-2 rounded-full hover:bg-red-900/10 transition-colors active:scale-95" 
              title="放弃任务 (无奖励)"
            >
              <X size={16} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onStartTimer(taskRecord.task.duration || 25);
              }} 
              className={`p-3 rounded-full text-white transition-colors group-hover:scale-105 shadow-lg ${isDark ? 'bg-zinc-800 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              <Play size={16} fill="currentColor"/>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 已抽取命运任务（待完成在上，已完成在下） */}
      <div className={`${cardBg} border p-2 sm:p-4 rounded-xl transition-all duration-300`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className={`text-base sm:text-lg font-bold ${textMain}`}>已抽取命运任务</h4>
          {onHelpClick && (
            <GlobalHelpButton 
              helpId="fateDice" 
              onHelpClick={onHelpClick} 
              size={14} 
              variant="ghost" 
            />
          )}
        </div>
        {pendingTasks.length > 0 || completedTasks.length > 0 ? (
          <div className="space-y-2">
            {/* 待完成任务 - 显示在上面 */}
            {pendingTasks.map(taskRecord => renderTaskCard(taskRecord, true))}
            
            {/* 已完成任务 - 显示在下面 */}
            {completedTasks.map(taskRecord => renderTaskCard(taskRecord, false))}
          </div>
        ) : (
          <div className={`text-center py-8 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
            <p className="text-sm">暂无命运任务</p>
            <p className="text-xs mt-1">掷骰子获取新任务</p>
          </div>
        )}
      </div>

      {/* 已放弃任务（可选） */}
      {abandonedTasks.length > 0 && (
        <div className={`${cardBg} border p-2 sm:p-4 rounded-xl transition-all duration-300`}>
          <h4 className={`text-base sm:text-lg font-bold mb-3 ${textMain}`}>已放弃任务</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto opacity-70">
            {abandonedTasks.map(taskRecord => (
              <div 
                key={taskRecord.id} 
                className={`relative rounded-lg border transition-all overflow-hidden ${cardBg} ${isDark ? 'border-red-900/30 bg-red-950/10' : 'border-red-200 bg-red-50'}`}
              >
                <div className="p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 border-red-900 text-red-900`}>
                    <X size={16} strokeWidth={4} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold truncate text-zinc-500 line-through`}>
                      {taskRecord.task.text}
                    </h3>
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono text-zinc-500 mt-1">
                      <span className="text-red-500">已放弃</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

DiceTaskList.displayName = 'DiceTaskList';

export default DiceTaskList;
