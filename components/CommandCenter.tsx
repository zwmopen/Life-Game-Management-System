import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line
} from 'recharts';
import { 
  Crown, Clock, Trophy,
  Zap, Crosshair, ChevronRight, Activity, ArrowRight, Power, Sword, Scroll, Gavel, Map, Anchor, Target, HelpCircle, GripVertical
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Transaction, Task, ReviewLog, DailyStats, Theme, Project, Habit, View } from '../types';
import CharacterProfile, { CharacterProfileHandle } from './CharacterProfile';

interface CommandCenterProps {
  day: number;
  balance: number;
  todayStats: DailyStats;
  statsHistory: {[key: number]: DailyStats};
  reviews: ReviewLog[];
  transactions: Transaction[];
  projects: Project[];
  habits: Habit[];
  onUpdateBalance: (amount: number, reason: string) => void;
  onSaveReview: (content: string, aiAnalysis: string) => void;
  onTaskComplete: (task: Task) => void;
  onPomodoroComplete: (m: number) => void;
  theme: Theme;
  setView: (view: View) => void;
  onNavigateToCategory: (category: 'daily' | 'main' | 'random') => void;
  checkInStreak: number;
  totalHours: number;
  xp: number;
  totalKills: number;
  isNavCollapsed: boolean;
  setIsNavCollapsed: (collapsed: boolean) => void;
  // Pomodoro Global State
  timeLeft: number;
  isActive: boolean;
  duration: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onChangeDuration: (minutes: number) => void;
  onUpdateTimeLeft: (seconds: number) => void;
  onUpdateIsActive: (active: boolean) => void;
}

const CommandCenter: React.FC<CommandCenterProps> = ({ 
  day, balance, todayStats, statsHistory, reviews, transactions, projects, habits, onUpdateBalance, onSaveReview, onTaskComplete, onPomodoroComplete, theme, setView, onNavigateToCategory, checkInStreak, totalHours, xp, totalKills,
  isNavCollapsed, setIsNavCollapsed,
  // Pomodoro Global State
  timeLeft, isActive, duration, onToggleTimer, onResetTimer, onChangeDuration, onUpdateTimeLeft, onUpdateIsActive
}) => {
  const characterProfileRef = useRef<CharacterProfileHandle>(null);

  const isDark = theme === 'dark';
  const isNeomorphic = theme === 'neomorphic';
  const textMain = isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';
  const textSub = isDark ? 'text-zinc-500' : isNeomorphic ? 'text-zinc-600' : 'text-slate-500';
  
  // 拟态风格卡片背景
  const cardBg = isNeomorphic 
      ? 'bg-zinc-200 border-zinc-300 shadow-[10px_10px_20px_rgba(0,0,0,0.1),-10px_-10px_20px_rgba(255,255,255,0.8)] hover:shadow-[15px_15px_30px_rgba(0,0,0,0.15),-15px_-15px_30px_rgba(255,255,255,0.9)] transition-all duration-300' 
      : isDark 
      ? 'bg-zinc-900 border-zinc-800' 
      : 'bg-white border-slate-200 shadow-sm';
  
  // 可拖动组件的顺序状态
  const [componentOrder, setComponentOrder] = useState([
    { id: 'stats-cards', label: '实时情报卡片' },
    { id: 'charts-section', label: '数据图表' },
    { id: 'operations-list', label: '作战列表' }
  ]);
  
  // 初始化传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // 处理拖拽结束事件
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setComponentOrder((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  const totalCampaignsWon = todayStats.tasksCompleted + todayStats.habitsDone;
  
  return (
        <div className={`h-full flex flex-col overflow-hidden relative ${isDark ? 'bg-zinc-950' : 'bg-slate-50'} w-full`}>
      
            <CharacterProfile 
                ref={characterProfileRef} 
                theme={theme} 
                xp={xp} 
                balance={balance} 
                totalHours={totalHours} 
                totalKills={totalKills} 
                checkInStreak={checkInStreak} 
                onPomodoroComplete={onPomodoroComplete} 
                onUpdateBalance={onUpdateBalance} 
                // Pomodoro Global State
                timeLeft={timeLeft}
                isActive={isActive}
                duration={duration}
                onToggleTimer={onToggleTimer}
                onResetTimer={onResetTimer}
                onChangeDuration={onChangeDuration}
                onUpdateTimeLeft={onUpdateTimeLeft}
                onUpdateIsActive={onUpdateIsActive}
                // Immersive Mode Callback
                onImmersiveModeChange={(isImmersive) => {
                    if (isImmersive) {
                        setIsNavCollapsed(true);
                    }
                }}
            />

            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar w-full">
                <div className="space-y-6 pb-20 w-full">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 w-full">
                    
                    {/* LEFT COLUMN: ACTIVE WARZONE (Stats & Operations) */}
                    <div className="lg:col-span-12 space-y-6 w-full">
                
                {/* 战略指挥部组件 - 实现拖拽功能 */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={componentOrder.map(item => item.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-6">
                            {/* 融合实时情报卡片和图表 */}
                            {componentOrder.map((component) => {
                                if (component.id === 'stats-cards') {
                                    return (
                                        <div key="stats-cards" className="relative">
                                            <div className={`${cardBg} border p-4 rounded-xl`}>
                                                {/* 拖拽手柄 */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <button className="text-zinc-500 hover:text-white transition-colors cursor-grab">
                                                        <GripVertical size={14} />
                                                    </button>
                                                    <span className="text-xs text-zinc-500 uppercase">{component.label}</span>
                                                </div>
                                        
                                        {/* 1. 融合实时情报卡片和图表 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* 今日作战时长 */}
                            <div className={`${cardBg} border p-4 rounded-lg flex flex-col justify-between group hover:border-blue-500/50 transition-all duration-300 cursor-default hover:shadow-lg`} style={{ minHeight: '150px' }}>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
                                        <Clock size={12}/> 今日作战时长
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                        目标: 180 min
                                    </div>
                                </div>
                                <div className={`text-2xl font-mono font-black mt-2 mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                    {todayStats.focusMinutes} <span className="text-sm text-zinc-500 font-normal">min</span>
                                </div>
                                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                                        style={{ width: `${Math.min(100, (todayStats.focusMinutes / 180) * 100)}%` }}
                                    ></div>
                                </div>
                                <div className="mt-2 flex justify-between items-center text-xs">
                                    <span className="text-zinc-500">
                                        昨日: {statsHistory[day-1]?.focusMinutes || 0} min
                                    </span>
                                    <span className={`font-bold ${todayStats.focusMinutes >= 180 ? 'text-green-500' : 'text-zinc-500'}`}>
                                        {todayStats.focusMinutes >= 180 ? '✅' : '🔄'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* 战略事务统计 */}
                            <div className={`${cardBg} border p-4 rounded-lg flex flex-col justify-between group hover:border-yellow-500/50 transition-all duration-300 cursor-default hover:shadow-lg`} style={{ minHeight: '150px' }}>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
                                        <Trophy size={12}/> 战略事务统计
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                        今日
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2 mb-2">
                                    <div>
                                        <div className={`text-xl font-mono font-black ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                            {todayStats.tasksCompleted}
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-0.5">
                                            主线任务
                                        </div>
                                    </div>
                                    <div>
                                        <div className={`text-xl font-mono font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                            {todayStats.habitsDone}
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-0.5">
                                            日常任务
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <span className="text-xs text-zinc-500">
                                            活跃战役: {projects.filter(p => p.status === 'active').length}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span className="text-xs text-zinc-500">
                                            日常任务: {habits.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 习惯完成率趋势图 */}
                            <div className={`${cardBg} border p-4 rounded-lg`} style={{ minHeight: '150px' }}>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className={`text-sm font-bold flex items-center gap-2 ${textMain} uppercase tracking-wider`}>
                                        <Activity size={14} className="text-green-500"/>
                                        任务完成率
                                    </h3>
                                </div>
                                <div className="h-[calc(100%-40px)]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={useMemo(() => {
                                                const data = [];
                                                for (let i = 6; i >= 0; i--) {
                                                    const date = new Date();
                                                    date.setDate(date.getDate() - i);
                                                    const dateStr = date.toLocaleDateString();
                                                    const completedHabits = habits.filter(habit => habit.history[dateStr]).length;
                                                    const completedProjects = projects.filter(project => {
                                                        const subTasks = project.subTasks;
                                                        if (subTasks.length === 0) return false;
                                                        return subTasks.every(task => task.completed);
                                                    }).length;
                                                    const totalTasks = habits.length + projects.length;
                                                    const completionRate = totalTasks > 0 ? Math.round(((completedHabits + completedProjects) / totalTasks) * 100) : 0;
                                                    
                                                    data.push({
                                                        date: `${date.getMonth() + 1}/${date.getDate()}`,
                                                        completionRate
                                                    });
                                                }
                                                return data;
                                            }, [habits, projects])}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} vertical={false} />
                                            <XAxis dataKey="date" stroke="#71717a" fontSize={8} tickLine={false} />
                                            <YAxis stroke="#71717a" fontSize={8} tickLine={false} domain={[0, 100]} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}
                                            />
                                            <Bar dataKey="completionRate" fill="#10b981" radius={[2, 2, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            {/* 专注时间趋势图 */}
                            <div className={`${cardBg} border p-4 rounded-lg`} style={{ minHeight: '150px' }}>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className={`text-sm font-bold flex items-center gap-2 ${textMain} uppercase tracking-wider`}>
                                        <Clock size={14} className="text-blue-500"/>
                                        专注时间趋势
                                    </h3>
                                </div>
                                <div className="h-[calc(100%-40px)]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={useMemo(() => {
                                                const data = [];
                                                for (let i = 6; i >= 0; i--) {
                                                    const date = new Date();
                                                    date.setDate(date.getDate() - i);
                                                    const dateStr = date.toLocaleDateString();
                                                    const focusTime = projects.reduce((sum, project) => sum + (project.dailyFocus[dateStr] || 0), 0);
                                                    
                                                    data.push({
                                                        date: `${date.getMonth() + 1}/${date.getDate()}`,
                                                        focusTime
                                                    });
                                                }
                                                return data;
                                            }, [projects])}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} />
                                            <XAxis dataKey="date" stroke="#71717a" fontSize={8} tickLine={false} />
                                            <YAxis stroke="#71717a" fontSize={8} tickLine={false} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}
                                            />
                                            <Line type="monotone" dataKey="focusTime" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                                    </div>
                                </div>
                            );
                        }
                        
                        if (component.id === 'charts-section') {
                            // 跳过原有图表组件，因为已经融合到实时情报卡片中
                            return null;
                        }
                        
                        if (component.id === 'operations-list') {
                            return (
                                <div key="operations-list" className="relative">
                                    <div className={`${cardBg} border p-4 rounded-xl`}>
                                        {/* 拖拽手柄 */}
                                        <div className="flex items-center justify-between mb-2">
                                            <button className="text-zinc-500 hover:text-white transition-colors cursor-grab">
                                                <GripVertical size={14} />
                                            </button>
                                            <span className="text-xs text-zinc-500 uppercase">{component.label}</span>
                                        </div>
                                        
                                        {/* 2. Combat Operations List */}
                                        <div className={`${cardBg} border rounded-xl overflow-hidden relative`}>
                                            <div className={`p-4 border-b flex justify-between items-center backdrop-blur-sm sticky top-0 z-10 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white/80 border-slate-200'}`}>
                                                <div className="flex items-center gap-1">
                                                    <h3 className={`text-sm font-bold flex items-center gap-2 ${textMain} uppercase tracking-wider`}>
                                                        <Sword size={16} className="text-red-500"/> 主线战区 (Operational)
                                                    </h3>
                                                    <div className="relative group">
                                                        <button className="text-zinc-500 hover:text-white transition-colors">
                                                            <HelpCircle size={12}/>
                                                        </button>
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                            主线战区包含所有活跃的战役项目<br/>每个战役可以分解为多个子任务<br/>完成所有子任务即可获得战役胜利
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="p-4 space-y-4">
                                                {/* Projects */}
                                                {projects.filter(p => p.status === 'active').map(project => {
                                                    const todayFocus = project.dailyFocus[new Date().toLocaleDateString()] || 0;
                                                    const targetFocus = 60; 
                                                    const progress = Math.min(100, (todayFocus / targetFocus) * 100); 
                                                    
                                                    return (
                                                        <div 
                                                            key={project.id} 
                                                            onClick={() => onNavigateToCategory('main')}
                                                            className={`relative p-4 rounded-lg border-l-4 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'} border-l-red-500 group hover:${isDark ? 'bg-zinc-900' : 'bg-white'} transition-all cursor-pointer hover:translate-x-1`}
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-[9px] bg-red-900/30 text-red-400 px-1.5 rounded font-bold uppercase border border-red-900/20">活跃战役</span>
                                                                        <h4 className={`font-bold text-sm ${textMain} group-hover:text-blue-400 transition-colors`}>{project.name}</h4>
                                                                        <ArrowRight size={12} className="text-zinc-600 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0"/>
                                                                    </div>
                                                                    <div className={`text-xs ${textSub} line-clamp-1`}>{project.description}</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-xl font-mono font-bold text-red-500 group-hover:text-blue-500 transition-colors">{todayFocus}<span className="text-xs text-zinc-500">/{targetFocus}m</span></div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className={`relative h-3 rounded-sm overflow-hidden border ${isDark ? 'bg-zinc-800 border-zinc-700/50' : 'bg-slate-200 border-slate-300'}`}>
                                                                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-zinc-400 z-10 tracking-widest">
                                                                    {progress.toFixed(0)}% 攻坚进度
                                                                </div>
                                                                <div className="h-full bg-gradient-to-r from-red-600 to-red-400 group-hover:from-blue-600 group-hover:to-blue-400 transition-all duration-500" style={{width: `${progress}%`}}></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {/* Habits Summary */}
                                                <div 
                                                     onClick={() => onNavigateToCategory('daily')}
                                                     className={`relative p-4 rounded-lg border-l-4 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'} border-l-blue-500 group hover:${isDark ? 'bg-zinc-900' : 'bg-white'} transition-all cursor-pointer hover:translate-x-1`}
                                                >
                                                     <div className="flex justify-between items-center mb-3">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[9px] bg-blue-900/30 text-blue-400 px-1.5 rounded font-bold uppercase border border-blue-900/20">后勤</span>
                                                                <h4 className={`font-bold text-sm ${textMain} group-hover:text-blue-400 transition-colors`}>日常副本 (Daily Dungeon)</h4>
                                                                <ArrowRight size={12} className="text-zinc-600 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0"/>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xl font-mono font-bold text-blue-500">{todayStats.habitsDone}<span className="text-xs text-zinc-500">/{habits.length}</span></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {habits.map(h => (
                                                            <div key={h.id} className={`h-2 flex-1 rounded-sm ${h.history[new Date().toLocaleDateString()] ? 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]' : (isDark ? 'bg-zinc-800' : 'bg-slate-300')}`}></div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        
                        return null;
                    })}
                    </div>
                    </SortableContext>
                </DndContext>
                
            </div>
        </div>



        </div>

      </div>
    </div>
  );
};

export default CommandCenter;