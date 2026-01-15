import React from 'react';
import { X, Bell, Plus, Trash2 } from 'lucide-react';
import { AttributeTypeValue, AttributeType, SubTask } from '../../types';

interface TaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTaskId: string | null;
  newTaskTitle: string;
  setNewTaskTitle: (title: string) => void;
  newTaskType: 'daily' | 'main' | 'random';
  newTaskXP: string;
  setNewTaskXP: (xp: string) => void;
  newTaskReward: string;
  setNewTaskReward: (reward: string) => void;
  newTaskDuration: string;
  setNewTaskDuration: (duration: string) => void;
  reminderEnabled: boolean;
  setReminderEnabled: (enabled: boolean) => void;
  reminderDate: string;
  setReminderDate: (date: string) => void;
  reminderTime: string;
  setReminderTime: (time: string) => void;
  reminderRepeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  setReminderRepeat: (repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom') => void;
  reminderInterval: string;
  setReminderInterval: (interval: string) => void;
  newTaskDiceCategory?: string;
  setNewTaskDiceCategory?: (category: any) => void;
  editingProjectSubTasks: SubTask[];
  setEditingProjectSubTasks: (subTasks: SubTask[]) => void;
  handleSaveEditTask: () => void;
  handleAddNewTask: () => void;
  isNeomorphic: boolean;
  isNeomorphicDark: boolean;
  theme: string;
  isDark: boolean;
  textMain: string;
}

const TaskEditorModal: React.FC<TaskEditorModalProps> = ({
  isOpen,
  onClose,
  editingTaskId,
  newTaskTitle,
  setNewTaskTitle,
  newTaskType,
  newTaskXP,
  setNewTaskXP,
  newTaskReward,
  setNewTaskReward,
  newTaskDuration,
  setNewTaskDuration,
  reminderEnabled,
  setReminderEnabled,
  reminderDate,
  setReminderDate,
  reminderTime,
  setReminderTime,
  reminderRepeat,
  setReminderRepeat,
  reminderInterval,
  setReminderInterval,
  newTaskDiceCategory,
  setNewTaskDiceCategory,
  editingProjectSubTasks,
  setEditingProjectSubTasks,
  handleSaveEditTask,
  handleAddNewTask,
  isNeomorphic,
  isNeomorphicDark,
  theme,
  isDark,
  textMain
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className={`w-full max-w-md p-6 rounded-2xl border ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)] border-none' : 'bg-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] border-none') : (isDark ? 'bg-zinc-900 shadow-xl' : 'bg-white shadow-xl')}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-bold ${textMain}`}>{editingTaskId ? '编辑任务' : '部署新任务'}</h3>
          <button 
            onClick={onClose}
            className={`p-1 rounded-full transition-all ${isNeomorphic ? (isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.6),-5px_-5px_10px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)]') : 'hover:bg-slate-100'}`}
          >
            <X size={16} className={textMain} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className={`text-[10px] uppercase font-bold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>任务标题</label>
            <input autoFocus value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className={`w-full border-b py-2 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} placeholder="输入任务名称..." />
          </div>

          {newTaskType === 'random' && setNewTaskDiceCategory && (
            <div>
              <label className={`text-[10px] uppercase font-bold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>事件分类</label>
              <select 
                value={newTaskDiceCategory} 
                onChange={e => setNewTaskDiceCategory(e.target.value)}
                className={`w-full py-2 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg px-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg px-2') : (isDark ? 'bg-transparent border-zinc-700 border-b' : 'bg-transparent border-slate-300 border-b')}`}
              >
                <option value="health">健康微行动</option>
                <option value="efficiency">效率任务</option>
                <option value="leisure">休闲小奖励</option>
              </select>
            </div>
          )}
          
          {(newTaskType === 'daily' || newTaskType === 'main' || newTaskType === 'random') && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>经验奖励</label><input type="number" value={newTaskXP} onChange={e => setNewTaskXP(e.target.value)} className={`w-full border-b py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-1' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-1') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} /></div>
                <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>金币奖励</label><input type="number" value={newTaskReward} onChange={e => setNewTaskReward(e.target.value)} className={`w-full border-b py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-1' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-1') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} /></div>
                <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>预估时长(m)</label><input type="number" value={newTaskDuration} onChange={e => setNewTaskDuration(e.target.value)} className={`w-full border-b py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-1' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-1') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} /></div>
              </div>

              {/* 任务提醒设置 */}
              <div className={`p-3 rounded-xl border border-dashed ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-zinc-700 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3)]' : 'bg-[#e0e5ec] border-zinc-300 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6)]') : (isDark ? 'border-zinc-700 bg-zinc-900/50' : 'border-slate-200 bg-slate-50')}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bell size={12} className="text-blue-500" />
                    <label className={`text-[10px] uppercase font-bold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>时间提醒</label>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={reminderEnabled} 
                    onChange={e => setReminderEnabled(e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                  />
                </div>
                
                {reminderEnabled && (
                  <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`text-[8px] mb-1 block ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>提醒日期</label>
                        <input 
                          type="date" 
                          value={reminderDate} 
                          onChange={e => setReminderDate(e.target.value)}
                          className={`w-full text-xs py-1.5 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg px-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg px-2') : 'bg-transparent border-b border-zinc-700'}`}
                        />
                      </div>
                      <div>
                        <label className={`text-[8px] mb-1 block ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>具体时间</label>
                        <input 
                          type="time" 
                          value={reminderTime} 
                          onChange={e => setReminderTime(e.target.value)}
                          className={`w-full text-xs py-1.5 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg px-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg px-2') : 'bg-transparent border-b border-zinc-700'}`}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className={`text-[8px] mb-1 block ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>重复模式</label>
                      <div className="flex gap-2">
                        <select 
                          value={reminderRepeat} 
                          onChange={e => setReminderRepeat(e.target.value as any)}
                          className={`flex-1 text-xs py-1.5 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg px-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg px-2') : 'bg-transparent border-b border-zinc-700'}`}
                        >
                          <option value="none">不重复</option>
                          <option value="daily">每天提醒</option>
                          <option value="weekly">每周提醒</option>
                          <option value="monthly">每月提醒</option>
                          <option value="custom">间隔提醒</option>
                        </select>
                        {reminderRepeat === 'custom' && (
                          <div className="flex items-center gap-1 animate-in slide-in-from-left-2">
                            <input 
                              type="number" 
                              min="1"
                              value={reminderInterval} 
                              onChange={e => setReminderInterval(e.target.value)}
                              className={`w-12 text-xs py-1.5 outline-none text-center ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg') : 'bg-transparent border-b border-zinc-700'}`}
                            />
                            <span className="text-[10px] text-zinc-500">天/次</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          
          {newTaskType === 'main' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className={`text-[10px] uppercase font-bold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>子任务</label>
                <button 
                  onClick={() => {
                    setEditingProjectSubTasks([...editingProjectSubTasks, {
                      id: `sub-${Date.now()}`,
                      title: '',
                      completed: false,
                      duration: 30
                    }]);
                  }}
                  className={`text-xs px-3 py-1 rounded flex items-center gap-1 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none text-blue-400 hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none text-blue-600 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                >
                  <Plus size={12}/> 添加子任务
                </button>
              </div>
              
              {editingProjectSubTasks.map((subTask, index) => (
                <div key={subTask.id} className="flex gap-2 items-start">
                  <input 
                    type="text" 
                    value={subTask.title} 
                    onChange={(e) => {
                      const newSubTasks = [...editingProjectSubTasks];
                      newSubTasks[index] = { ...newSubTasks[index], title: e.target.value };
                      setEditingProjectSubTasks(newSubTasks);
                    }} 
                    placeholder={`子任务 ${index + 1} 标题...`} 
                    className={`flex-1 border-b py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} 
                  />
                  <input 
                    type="number" 
                    value={subTask.duration} 
                    onChange={(e) => {
                      const newSubTasks = [...editingProjectSubTasks];
                      newSubTasks[index] = { ...newSubTasks[index], duration: parseInt(e.target.value) || 30 };
                      setEditingProjectSubTasks(newSubTasks);
                    }} 
                    placeholder="时长(m)" 
                    className={`w-20 border-b py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} 
                  />
                  <button 
                    onClick={() => {
                      setEditingProjectSubTasks(editingProjectSubTasks.filter((_, i) => i !== index));
                    }}
                    className={`p-2 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none rounded text-red-400 hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none rounded text-red-500 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') : 'text-red-500 hover:text-red-400'}`}
                  >
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className={`px-4 py-2 text-xs font-bold ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'text-zinc-300 bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none rounded hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'text-zinc-700 bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none rounded hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') : 'text-zinc-500 hover:text-white'}`}>取消</button>
            <button onClick={editingTaskId ? handleSaveEditTask : handleAddNewTask} className={`px-6 py-2 rounded font-bold text-xs ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none text-white hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none text-blue-600 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>确认部署</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskEditorModal;
