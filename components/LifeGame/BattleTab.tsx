import React, { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import { 
  Clock, Activity, Calendar, Check, Package, Sun, Moon, Coffee, BookOpen, 
  Dumbbell, Users, Music, ArrowLeft, Star, PackagePlus, List, RefreshCw, 
  Dice5, Hammer, Edit2, Layout, Smartphone, Laptop, Shirt, Ticket, Wifi, 
  Video, Camera, Tablet, Wind, Fish, Mountain, Home, Car, Heart, Globe, 
  Palette, Volume2, VolumeX, ShieldAlert, Download, Upload, Cloud, 
  CloudDownload, Save, RotateCcw, ChevronUp, ChevronDown, Target, Crosshair, 
  Gift, Coins, Trophy, ShoppingBag, CheckCircle, Swords, Flame, Shield, 
  Brain, BicepsFlexed, Sparkles, Users as UsersIcon, Plus, X, Crown, Edit3, 
  Trash2, Repeat, Zap, Mic, Loader2, Gamepad2, Play, Pause, StopCircle, 
  Archive, ArchiveRestore, Settings
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, ComposedChart } from 'recharts';
import CharacterProfile from '../CharacterProfile';
import { GlobalGuideCard, helpContent, GlobalHelpButton } from '../HelpSystem';
import FateGiftModal from '../shared/FateGiftModal';
import FateDice from '../FateDice';
import TaskManagement from '../TaskManagement';
import BankModal from '../shared/BankModal';
import MorningProtocolModal from '../shared/MorningProtocolModal';
import ReminderPopup from '../shared/ReminderPopup';
import TaskEditorModal from '../TaskManagement/TaskEditorModal';
import { Theme, AttributeType, AttributeTypeValue, Habit, Project, SubTask, TaskType, AutoTaskType, Task, DiceState, DiceTask, DiceCategory, DiceHistory, Settings as SettingsType } from '../../types';
import { getNeomorphicStyles, getButtonStyle, getCardBgStyle, getTextStyle } from '../../utils/styleHelpers';
import { useReminders } from '../../hooks/useReminders';
import { useTaskOperations } from '../../hooks/useTaskOperations';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { APP_VERSION } from '../../constants/app';

interface BattleTabProps {
  balance: number;
  onUpdateBalance: (amount: number, reason: string) => void;
  habits: Habit[];
  projects: Project[];
  habitOrder: string[];
  projectOrder: string[];
  onToggleHabit: (id: string, dateStr: string) => void;
  onUpdateHabit: (id: string, updates: Partial<Habit>) => void;
  onDeleteHabit: (id: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  onAddHabit: (name: string, reward: number) => void;
  onAddProject: (project: Project) => void;
  onAddFloatingReward: (text: string, color: string, x?: number, y?: number) => void;
  totalTasksCompleted: number;
  totalHours: number;
  challengePool: string[];
  setChallengePool: (pool: string[]) => void;
  todaysChallenges: {date: string, tasks: string[]};
  completedRandomTasks: {[date: string]: string[]};
  onToggleRandomChallenge: (task: string) => void;
  onStartAutoTask: (type: AutoTaskType, id: string, duration: number, subId?: string) => void;
  checkInStreak: number;
  onPomodoroComplete: (m: number) => void;
  xp: number;
  weeklyGoal: string;
  setWeeklyGoal: (g: string) => void;
  todayGoal: string;
  setTodayGoal: (g: string) => void;
  givenUpTasks?: string[];
  onGiveUpTask?: (id: string) => void;
  onUpdateHabitOrder?: (order: string[]) => void;
  onUpdateProjectOrder?: (order: string[]) => void;
  isNavCollapsed: boolean;
  setIsNavCollapsed: (collapsed: boolean) => void;
  todayStats: {focusMinutes: number, tasksCompleted: number, habitsDone: number, earnings: number, spending: number};
  statsHistory: {[key: number]: {focusMinutes: number, tasksCompleted: number, habitsDone: number, earnings: number, spending: number}};
  timeLeft: number;
  isActive: boolean;
  duration: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onChangeDuration: (minutes: number) => void;
  onUpdateTimeLeft: (seconds: number) => void;
  onUpdateIsActive: (active: boolean) => void;
  isImmersive: boolean;
  setIsImmersive: (isImmersive: boolean) => void;
  onInternalImmersiveModeChange?: (isInternalImmersive: boolean) => void;
  settings: SettingsType;
  diceState?: DiceState;
  onSpinDice?: () => { success: boolean; message?: string };
  onDiceResult?: (result: 'completed' | 'skipped' | 'later') => void;
  onAddDiceTask?: (task: DiceTask) => void;
  onDeleteDiceTask?: (taskId: string, category: DiceCategory) => void;
  onUpdateDiceTask?: (taskId: string, category: DiceCategory, updates: Partial<DiceTask>) => void;
  onUpdateDiceConfig?: (config: Partial<DiceState['config']>) => void;
  onUpdateDiceState?: (updates: Partial<DiceState>) => void;
  onLevelChange: (newLevel: number, type: 'level' | 'focus' | 'wealth') => void;
  theme: Theme;
  isDark: boolean;
  isNeomorphic: boolean;
  cardBg: string;
  textMain: string;
  textSub: string;
  neomorphicStyles: { bg: string; border: string; shadow: string; hoverShadow: string; activeShadow: string; transition: string };
  level: number;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
  characterProfileRef: React.RefObject<any>;
  toggleSubTask: (projectId: string, subTaskId: string) => void;
  giveUpSubTask: (projectId: string, subTaskId: string) => void;
  checkInUpdated: number;
  setActiveHelp: React.Dispatch<React.SetStateAction<string | null>>;
}

const BattleTab: React.FC<BattleTabProps> = memo(({
  balance, onUpdateBalance, habits, projects, habitOrder, projectOrder, onToggleHabit, onUpdateHabit, onDeleteHabit, 
  onUpdateProject, onDeleteProject, onAddHabit, onAddProject, onAddFloatingReward, totalTasksCompleted, totalHours,
  challengePool, setChallengePool, todaysChallenges, completedRandomTasks, onToggleRandomChallenge, onStartAutoTask, 
  checkInStreak, onPomodoroComplete, xp, weeklyGoal, setWeeklyGoal, todayGoal, setTodayGoal, givenUpTasks, onGiveUpTask, 
  onUpdateHabitOrder, onUpdateProjectOrder, isNavCollapsed, setIsNavCollapsed, todayStats, statsHistory,
  timeLeft, isActive, duration, onToggleTimer, onResetTimer, onChangeDuration, onUpdateTimeLeft, onUpdateIsActive,
  isImmersive, setIsImmersive, onInternalImmersiveModeChange, settings,
  diceState, onSpinDice, onDiceResult, onAddDiceTask, onDeleteDiceTask, onUpdateDiceTask, onUpdateDiceConfig, 
  onUpdateDiceState, onLevelChange, theme, isDark, isNeomorphic, cardBg, textMain, textSub, neomorphicStyles,
  level, setLevel, characterProfileRef, toggleSubTask, giveUpSubTask, checkInUpdated, setActiveHelp
}) => {
  const [taskCategory, setTaskCategory] = useState<'daily' | 'main' | 'random'>('random');
  
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('15');
  const [newTaskXP, setNewTaskXP] = useState('20');
  const [newTaskDuration, setNewTaskDuration] = useState('30');
  const [newTaskAttr, setNewTaskAttr] = useState<AttributeTypeValue>(AttributeType.WEALTH);
  const [newTaskType, setNewTaskType] = useState<'daily' | 'main' | 'random'>('daily');
  const [newTaskDiceCategory, setNewTaskDiceCategory] = useState<DiceCategory>('health');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingProjectSubTasks, setEditingProjectSubTasks] = useState<SubTask[]>([]);
  
  // 提醒设置状态
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderRepeat, setReminderRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'custom'>('none');
  const [reminderInterval, setReminderInterval] = useState('1');

  // 使用提醒 Hook
  const { activeReminder, setActiveReminder } = useReminders(habits, projects, onUpdateHabit, onUpdateProject);

  const [isManageTasksOpen, setIsManageTasksOpen] = useState(false);
  const [manageTaskTab, setManageTaskTab] = useState<'daily' | 'main' | 'random'>('random');
  
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  // 战略储备双击编辑状态
  const [isEditingSavings, setIsEditingSavings] = useState(false);
  const [tempSavings, setTempSavings] = useState(balance);
  
  // 使用拖拽 Hook
  const { draggedTask, draggedTaskIndex, handleDragStart, handleDragEnd, handleDragOver } = useDragAndDrop({
    habitOrder,
    projectOrder,
    onUpdateHabitOrder,
    onUpdateProjectOrder
  });
  
  // 使用任务处理 Hook
  const {
    completeTask,
    giveUpTask
  } = useTaskOperations({
    onUpdateHabit,
    onUpdateProject,
    onAddHabit,
    onAddProject,
    onDeleteHabit,
    onDeleteProject,
    onUpdateBalance,
    onAddFloatingReward,
    onSpinDice,
    onGiveUpTask,
    setChallengePool,
    projects,
    habits,
    todayStr: new Date().toLocaleDateString(),
    givenUpTasks
  });
  
  const [isEditingTodayGoal, setIsEditingTodayGoal] = useState(false);

  const [showProtocol, setShowProtocol] = useState(false);
  const [protocolStep, setProtocolStep] = useState(0);
  const [readiness, setReadiness] = useState(80);
  const [protocolFocus, setProtocolFocus] = useState('');

  // Bank Modal State
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankAccount, setBankAccount] = useState({
    balance: 0,
    totalInterestEarned: 0,
    lastInterestDate: new Date().toLocaleDateString()
  });

  // 更新tempSavings以反映最新的balance值
  useEffect(() => {
    if (!isEditingSavings) {
      setTempSavings(balance);
    }
  }, [balance, isEditingSavings]);

  // 生成todayStr，与LifeGame组件保持一致
  const todayStr = new Date().toLocaleDateString();
  
  // 按照habitOrder排序习惯任务
  const sortedHabits = habitOrder.map(id => habits.find(h => h.id === id)).filter(h => h !== undefined) as Habit[];
  // 使用useMemo确保当habits、todayStr或givenUpTasks变化时，habitTasks会重新生成
  const habitTasks = useMemo(() => {
    return sortedHabits.map(h => ({
        id: h.id, text: h.name, attr: h.attr || 'DIS', xp: h.xp || Math.ceil(h.reward * 1.5), gold: h.reward, duration: h.duration || 0,
        type: TaskType.DAILY, completed: !!h.history[todayStr], frequency: 'daily' as const, originalData: h,
        isGivenUp: givenUpTasks.includes(h.id)
    })).sort((a, b) => {
        if (a.isGivenUp && !b.isGivenUp) return 1;
        if (!a.isGivenUp && b.isGivenUp) return -1;
        return Number(a.completed) - Number(b.completed);
    });
  }, [sortedHabits, todayStr, givenUpTasks]);

  // 按照projectOrder排序项目任务
  const sortedProjects = projectOrder.map(id => projects.find(p => p.id === id)).filter(p => p !== undefined) as Project[];
  // 使用useMemo确保当projects变化时，projectTasks会重新生成
  const projectTasks = useMemo(() => {
    return sortedProjects.map(p => {
        // 主线任务奖励机制：与日常任务保持一致
        const baseRewardGold = 60; // 基础金币奖励
        const baseRewardXP = Math.ceil(baseRewardGold * 1.5); // 经验奖励与日常任务相同：金币*1.5
        const totalDuration = p.subTasks.reduce((sum, st) => sum + st.duration, 60);
        
        // 计算每个子任务的平均奖励
        const subTaskCount = Math.max(p.subTasks.length, 1);
        const avgXP = Math.ceil(baseRewardXP / subTaskCount);
        const avgGold = Math.ceil(baseRewardGold / subTaskCount);
        
        return {
            id: p.id, text: p.name, attr: p.attr || 'WEA', xp: baseRewardXP, gold: baseRewardGold, type: TaskType.MAIN,
            completed: p.status === 'completed', frequency: 'once' as const, isExpanded: true,
            originalData: p,
            subTasks: p.subTasks.map(st => ({
                id: st.id, text: st.title, completed: st.completed, 
                xp: avgXP, // 均分主线任务的经验奖励
                gold: avgGold, // 均分主线任务的金币奖励
                duration: st.duration || 30 // 子任务自己的时长，默认30分钟
            }))
        };
    }).sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [sortedProjects]);

  const handleStartTimer = useCallback((duration: number) => {
      if (characterProfileRef.current) {
          characterProfileRef.current.startTimer(duration);
          onAddFloatingReward(`番茄钟: ${duration}min`, "text-emerald-500");
      } else {
          // 静默处理定时器引用未附加的情况
      }
  }, [characterProfileRef, onAddFloatingReward]);

  const openEditTask = useCallback((task: any) => {
      setEditingTaskId(task.id);
      setNewTaskTitle(task.text);
      setNewTaskReward(task.gold.toString());
      setNewTaskXP((task.xp || 20).toString());
      setNewTaskDuration((task.duration || 30).toString());
      setNewTaskType(task.type || (task.category ? 'random' : 'daily'));
      
      if (task.category) {
          setNewTaskDiceCategory(task.category);
      }
      
      // 加载提醒设置
      if (task.reminder) {
          setReminderEnabled(task.reminder.enabled);
          setReminderDate(task.reminder.date || '');
          setReminderTime(task.reminder.time || '');
          setReminderRepeat(task.reminder.repeat || 'none');
          setReminderInterval(task.reminder.repeatInterval?.toString() || '1');
      } else {
          setReminderEnabled(false);
          setReminderDate('');
          setReminderTime('');
          setReminderRepeat('none');
          setReminderInterval('1');
      }

      if (task.type === TaskType.MAIN) {
          const p = projects.find(proj => proj.id === task.id);
          if(p) setEditingProjectSubTasks([...p.subTasks]);
      } else {
          setEditingProjectSubTasks([]);
      }
      setIsAddTaskOpen(true);
  }, [projects]);

  const openEditRandomTask = useCallback((taskStr: string) => {
      try {
          // 解析随机任务
          const parsedTask = JSON.parse(taskStr);
          setEditingTaskId(`random-${taskStr}`);
          setNewTaskTitle(parsedTask.text);
          setNewTaskReward((parsedTask.gold || 20).toString());
          setNewTaskXP((parsedTask.xp || 30).toString());
          setNewTaskDuration((parsedTask.duration || 20).toString());
          setNewTaskAttr(parsedTask.attr || AttributeType.WEALTH);
          setNewTaskType('random');
          setEditingProjectSubTasks([]);
          setIsAddTaskOpen(true);
      } catch (e) {
          // 旧格式的随机任务
          setEditingTaskId(`random-${taskStr}`);
          setNewTaskTitle(taskStr);
          setNewTaskReward('20');
          setNewTaskXP('30');
          setNewTaskDuration('20');
          setNewTaskAttr(AttributeType.WEALTH);
          setNewTaskType('random');
          setEditingProjectSubTasks([]);
          setIsAddTaskOpen(true);
      }
  }, []);

  const handleSaveEditTask = useCallback(() => {
      const reminderData = reminderEnabled ? {
          enabled: true,
          date: reminderDate,
          time: reminderTime,
          repeat: reminderRepeat,
          repeatInterval: parseInt(reminderInterval) || 1
      } : undefined;

      if (newTaskType === 'daily') {
          onUpdateHabit(editingTaskId!, { 
              name: newTaskTitle, 
              reward: parseInt(newTaskReward),
              xp: parseInt(newTaskXP),
              duration: parseInt(newTaskDuration),
              reminder: reminderData
          });
      } else if (newTaskType === 'main') {
          onUpdateProject(editingTaskId!, { 
              name: newTaskTitle, 
              subTasks: editingProjectSubTasks,
              reminder: reminderData as any 
          });
      } else if (newTaskType === 'random') {
          if (editingTaskId?.startsWith('random-')) {
              // 处理旧挑战池任务
              const originalTaskStr = editingTaskId.replace('random-', '');
              const newTask = {
                  text: newTaskTitle,
                  gold: parseInt(newTaskReward) || 20,
                  xp: parseInt(newTaskXP) || 30,
                  duration: parseInt(newTaskDuration) || 20,
                  attr: newTaskAttr
              };
              setChallengePool(prevPool => prevPool.map(task => task === originalTaskStr ? JSON.stringify(newTask) : task));
          } else if (editingTaskId) {
              // 处理命运骰子任务
              onUpdateDiceTask(editingTaskId, newTaskDiceCategory, {
                  text: newTaskTitle,
                  gold: parseInt(newTaskReward) || 20,
                  xp: parseInt(newTaskXP) || 30,
                  duration: parseInt(newTaskDuration) || 20
              });
          }
      }
      setIsAddTaskOpen(false);
      setEditingTaskId(null);
  }, [newTaskType, editingTaskId, newTaskTitle, newTaskReward, newTaskXP, newTaskDuration, newTaskAttr, newTaskDiceCategory, reminderEnabled, reminderDate, reminderTime, reminderRepeat, reminderInterval, onUpdateHabit, onUpdateProject, setChallengePool, onUpdateDiceTask, setIsAddTaskOpen, setEditingTaskId, editingProjectSubTasks]);

  const handleAddNewTask = useCallback(() => {
      if (!newTaskTitle.trim()) return;

      const reminderData = reminderEnabled ? {
          enabled: true,
          date: reminderDate,
          time: reminderTime,
          repeat: reminderRepeat,
          repeatInterval: parseInt(reminderInterval) || 1
      } : undefined;

      if (newTaskType === 'daily') {
          onAddHabit(newTaskTitle, parseInt(newTaskReward) || 15);
      } else if (newTaskType === 'main') {
          onAddProject({
              id: Date.now().toString(), 
              name: newTaskTitle, 
              startDate: new Date().toISOString().split('T')[0],
              description: '核心战略目标', 
              status: 'active', 
              logs: [], 
              dailyFocus: {}, 
              subTasks: editingProjectSubTasks, 
              fears: [], 
              todayFocusMinutes: 0, 
              attr: newTaskAttr,
              reminder: reminderData as any
          });
      } else if (newTaskType === 'random') {
          const newTask = {
              text: newTaskTitle,
              gold: parseInt(newTaskReward) || 20,
              xp: parseInt(newTaskXP) || 30,
              duration: parseInt(newTaskDuration) || 20,
              attr: AttributeType.WEALTH,
              category: newTaskDiceCategory || 'health'
          };
          onAddDiceTask(newTask);
          onAddFloatingReward("命运事件已入库", "text-purple-500");
      }
      setIsAddTaskOpen(false);
      setNewTaskTitle('');
      setNewTaskReward('15');
      setNewTaskXP('20');
      setNewTaskDuration('30');
      setNewTaskAttr(AttributeType.WEALTH);
      setEditingProjectSubTasks([]);
      setReminderEnabled(false);
      setReminderDate('');
      setReminderTime('');
      setReminderRepeat('none');
      setReminderInterval('1');
  }, [newTaskTitle, newTaskReward, newTaskXP, newTaskDuration, newTaskType, newTaskAttr, newTaskDiceCategory, reminderEnabled, reminderDate, reminderTime, reminderRepeat, reminderInterval, editingProjectSubTasks, onAddHabit, onAddProject, onAddDiceTask, onAddFloatingReward, setIsAddTaskOpen, setNewTaskTitle, setNewTaskReward, setNewTaskXP, setNewTaskDuration, setNewTaskAttr, setEditingProjectSubTasks, setReminderEnabled, setReminderDate, setReminderTime, setReminderRepeat, setReminderInterval]);

  // 使用useMemo优化按钮类名计算
  const dailyButtonClass = useMemo(() => `px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
    taskCategory === 'daily' 
      ? 'bg-blue-500 text-white' 
      : getButtonStyle(false, false, isNeomorphic, theme, isDark)
  }`, [taskCategory, isNeomorphic, theme, isDark]);
  
  const mainButtonClass = useMemo(() => `px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
    taskCategory === 'main' 
      ? 'bg-blue-500 text-white' 
      : getButtonStyle(false, false, isNeomorphic, theme, isDark)
  }`, [taskCategory, isNeomorphic, theme, isDark]);
  
  const randomButtonClass = useMemo(() => `px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
    taskCategory === 'random' 
      ? 'bg-blue-500 text-white' 
      : getButtonStyle(false, false, isNeomorphic, theme, isDark)
  }`, [taskCategory, isNeomorphic, theme, isDark]);
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* 战略指挥部 - 包含角色状态、任务管理、实时情报 */}
      <div className={`${cardBg} border p-4 rounded-2xl transition-all duration-300 hover:shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Layout size={16}/> 战略指挥部
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setTaskCategory('daily')}
              className={dailyButtonClass}
            >
              日常任务
            </button>
            <button 
              onClick={() => setTaskCategory('main')}
              className={mainButtonClass}
            >
              主线战役
            </button>
            <button 
              onClick={() => setTaskCategory('random')}
              className={randomButtonClass}
            >
              随机挑战
            </button>
          </div>
        </div>
        
        {/* 作战中心 - 包含角色状态、任务管理、实时情报 */}
        <div className="space-y-4">
          {/* 角色状态卡片 */}
          <CharacterProfile 
            ref={characterProfileRef} 
            theme={theme} 
            xp={xp} 
            balance={balance} 
            totalHours={totalHours} 
            totalKills={totalTasksCompleted} 
            checkInStreak={checkInStreak} 
            onPomodoroComplete={onPomodoroComplete} 
            onUpdateBalance={onUpdateBalance} 
            onLevelChange={onLevelChange} 
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
            onImmersiveModeChange={(newIsImmersive) => {
                if (newIsImmersive) {
                    setIsNavCollapsed(true);
                }
                setIsImmersive(newIsImmersive);
            }}
            // Internal Immersive Mode Callback
            onInternalImmersiveModeChange={onInternalImmersiveModeChange}
            // Help System - 帮助卡片
            onHelpClick={setActiveHelp}
            // Settings
            settings={settings}
          />
          
          {/* 任务管理系统 */}
          <TaskManagement 
            taskCategory={taskCategory}
            habitTasks={habitTasks}
            projectTasks={projectTasks}
            habitOrder={habitOrder}
            projectOrder={projectOrder}
            onToggleHabit={onToggleHabit}
            onUpdateHabit={onUpdateHabit}
            onDeleteHabit={onDeleteHabit}
            onUpdateProject={onUpdateProject}
            onDeleteProject={onDeleteProject}
            onAddHabit={onAddHabit}
            onAddProject={onAddProject}
            onAddFloatingReward={onAddFloatingReward}
            challengePool={challengePool}
            setChallengePool={setChallengePool}
            todaysChallenges={todaysChallenges}
            completedRandomTasks={completedRandomTasks}
            onToggleRandomChallenge={onToggleRandomChallenge}
            onStartAutoTask={onStartAutoTask}
            givenUpTasks={givenUpTasks}
            onCompleteTask={completeTask}
            onGiveUpTask={giveUpTask}
            onLevelChange={onLevelChange}
            theme={theme}
            isDark={isDark}
            isNeomorphic={isNeomorphic}
            cardBg={cardBg}
            textMain={textMain}
            textSub={textSub}
            neomorphicStyles={neomorphicStyles}
            onUpdateHabitOrder={onUpdateHabitOrder}
            onUpdateProjectOrder={onUpdateProjectOrder}
            toggleSubTask={toggleSubTask}
            giveUpSubTask={giveUpSubTask}
            openEditTask={openEditTask}
            openEditRandomTask={openEditRandomTask}
            onHelpClick={setActiveHelp}
            settings={settings}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            draggedTask={draggedTask}
            todayStr={todayStr}
          />
        </div>
      </div>
      
      {/* 实时情报卡模块 */}
      <div className={`${cardBg} border p-3 rounded-xl mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
            <Clock size={12}/> 实时情报卡片
          </div>
        </div>
        
        {/* 1. 实时情报卡片 - 调整为更紧凑的两列布局，移动端单列 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 专注时间趋势 - 缩小版 */}
          <div className={`${cardBg} border p-1.5 rounded-lg flex flex-col justify-between transition-all duration-300 cursor-default hover:shadow-lg`}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
                <Activity size={10}/> 专注时间统计
              </div>
              <div className="text-xs text-zinc-500">
                7天
              </div>
            </div>
            
            {/* 7天趋势图 - 缩小尺寸 */}
            <div className="h-[70px] w-full mt-1">
              <ResponsiveContainer width="100%" height={70}>
                <LineChart
                  data={[
                    { date: '1', focusMinutes: 45 },
                    { date: '2', focusMinutes: 60 },
                    { date: '3', focusMinutes: 30 },
                    { date: '4', focusMinutes: 90 },
                    { date: '5', focusMinutes: 75 },
                    { date: '6', focusMinutes: 120 },
                    { date: '7', focusMinutes: todayStats?.focusMinutes || 0 }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke={isDark ? "#71717a" : "#71717a"} 
                    fontSize={8} 
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke={isDark ? "#71717a" : "#71717a"} 
                    fontSize={8} 
                    tickLine={false} 
                    domain={[0, 'dataMax + 50']} 
                    tickFormatter={(value) => `${value}min`}
                    hide
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#18181b' : '#fff', 
                      borderColor: isDark ? '#333' : '#e2e8f0', 
                      color: isDark ? '#fff' : '#000',
                      fontSize: '10px',
                      padding: '4px'
                    }}
                    formatter={(value) => [`${value} 分钟`, '专注时间']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="focusMinutes" 
                    stroke={isDark ? "#8b5cf6" : "#8b5cf6"} 
                    strokeWidth={1.5} 
                    dot={{ fill: isDark ? "#8b5cf6" : "#8b5cf6", r: 2 }} 
                    activeDot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* 底部统计信息 - 今日专注时间和本周平均水平排列 */}
            <div className="mt-1 flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <span className="text-zinc-500">
                  本周平均: 68 min
                </span>
                <div className="flex items-center gap-1">
                  <Clock size={8} className="text-zinc-500"/>
                  <span className={`font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    今日: {todayStats?.focusMinutes || 0} min
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 签到系统 - 缩小版，移到实时情报卡片中 */}
          <div className={`${cardBg} border p-1.5 rounded-lg flex flex-col gap-1 transition-all duration-300 cursor-default hover:shadow-lg`}>
            <div className="flex justify-between items-center mb-1">
              <div className="text-xs text-blue-500 uppercase tracking-widest font-bold flex items-center gap-1">
                <Calendar size={14}/> 签到系统
              </div>
              {settings && 'guideCardConfig' in settings && settings.guideCardConfig && (
                <GlobalHelpButton helpId="checkin" onHelpClick={setActiveHelp} size={14} className="text-blue-500 p-0.5" />
              )}
            </div>
            
            {/* 签到按钮 - 圆形勋章样式，带跳动动画 */}
            <div className="flex justify-center mb-1">
              {/* 使用useMemo确保签到状态变化时按钮重新渲染 */}
              {(() => {
                const todayDate = new Date().toLocaleDateString();
                const checkInData = JSON.parse(localStorage.getItem('life-game-weekly-checkin') || '{}');
                const isCheckedIn = !!checkInData[todayDate];
                
                const handleCheckIn = () => {
                  // 检查是否已签到
                  if (!isCheckedIn) {
                    // 更新签到数据
                    const updatedCheckInData = { ...checkInData, [todayDate]: true };
                    localStorage.setItem('life-game-weekly-checkin', JSON.stringify(updatedCheckInData));
                    
                    // 计算连续签到天数
                    const now = new Date();
                    const day = now.getDay();
                    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 调整到周一
                    const monday = new Date(now.setDate(diff));
                    const weekDates = [];
                    for (let i = 0; i < 7; i++) {
                        const date = new Date(monday);
                        date.setDate(monday.getDate() + i);
                        weekDates.push(date.toLocaleDateString());
                    }
                    const consecutiveDays = weekDates.filter(date => updatedCheckInData[date]).length;
                    const goldReward = 10 + (consecutiveDays * 5);
                    const xpReward = 15 + (consecutiveDays * 3);
                    
                    // 触发奖励
                    onUpdateBalance(goldReward, "签到奖励");
                    
                    // 添加签到成功提示
                    onAddFloatingReward('签到成功！', 'text-green-500', window.innerWidth / 2);
                    
                    // 添加经验和金币奖励弹出效果
                    setTimeout(() => {
                        onAddFloatingReward(`+${goldReward} 金币`, 'text-yellow-500', window.innerWidth / 2 - 80);
                    }, 300);
                    setTimeout(() => {
                        onAddFloatingReward(`+${xpReward} 经验`, 'text-blue-500', window.innerWidth / 2 + 80);
                    }, 600);
                    
                    // 触发烟花特效
                    import('canvas-confetti').then(confettiModule => {
                      const confetti = confettiModule.default;
                      confetti({
                          particleCount: 100,
                          spread: 70,
                          origin: { y: 0.6 },
                          colors: ['#fbbf24', '#f59e0b', '#d97706', '#3b82f6', '#10b981', '#8b5cf6']
                      });
                    });
                    
                    // 关联勋章系统：更新签到 streak
                    const streak = checkInStreak + 1;
                    localStorage.setItem('aes-checkin-streak', streak.toString());
                    
                    // 强制组件重新渲染，确保签到状态立即更新
                    setTimeout(() => {
                        // 通过刷新页面实现组件重新渲染
                        window.location.reload();
                    }, 500);
                  }
                };
                
                return (
                  <button 
                    onClick={handleCheckIn}
                    disabled={isCheckedIn}
                    className={`w-11 h-11 rounded-full text-sm font-bold transition-all duration-300 flex flex-col items-center justify-center gap-0 ${isCheckedIn 
                      ? isNeomorphic 
                          ? (theme === 'neomorphic-dark' 
                              ? 'bg-[#1e1e2e] text-emerald-500 border-2 border-emerald-500/30 cursor-not-allowed shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-3px_-3px_6px_rgba(30,30,46,0.8)]' 
                              : 'bg-[#e0e5ec] text-emerald-500 border-2 border-emerald-500/30 cursor-not-allowed shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)]') 
                          : 'bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500/30 cursor-not-allowed' 
                      : isNeomorphic 
                          ? (theme === 'neomorphic-dark' 
                              ? 'bg-[#1e1e2e] text-blue-500 border-2 border-blue-500/30 hover:shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(30,30,46,0.8)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-3px_-3px_6px_rgba(30,30,46,0.8)] animate-pulse' 
                              : 'bg-[#e0e5ec] text-blue-500 border-2 border-blue-500/30 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] animate-pulse') 
                          : 'bg-blue-600 text-white border-2 border-blue-700 hover:bg-blue-700 shadow-lg shadow-blue-900/30 transform hover:scale-105 animate-pulse' 
                    }`}
                  >
                    {isCheckedIn ? (
                        <>
                          <Check size={20} strokeWidth={3}/>
                          <span className="text-[9px]">已签</span>
                        </>
                    ) : (
                        <>
                          <Package size={20} strokeWidth={2}/>
                          <span className="text-[9px]">签到</span>
                        </>
                    )}
                  </button>
                );
              })()}
            </div>
            
            {/* 7天签到状态 - 更小的尺寸 */}
            <div className="grid grid-cols-7 gap-1" key={checkInUpdated}>
              {(() => {
                  // 获取本周的日期范围（周一到周日）
                  const now = new Date();
                  const day = now.getDay();
                  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 调整到周一
                  const monday = new Date(now.setDate(diff));
                  
                  const weekDates = [];
                  for (let i = 0; i < 7; i++) {
                      const date = new Date(monday);
                      date.setDate(monday.getDate() + i);
                      weekDates.push(date);
                  }
                  
                  const checkInData = JSON.parse(localStorage.getItem('life-game-weekly-checkin') || '{}');
                  const today = new Date();
                  const todayDateStr = today.toLocaleDateString();
                  const dayNames = ['一', '二', '三', '四', '五', '六', '日'];
                  
                  // 每天的图标 - 放大尺寸
                  const dayIcons = [<Sun size={14}/>, <Coffee size={14}/>, <BookOpen size={14}/>, <Dumbbell size={14}/>, <UsersIcon size={14}/>, <Music size={14}/>, <Moon size={14}/>];
                  
                  return weekDates.map((date, index) => {
                      const dateStr = date.toLocaleDateString();
                      const isCheckedIn = !!checkInData[dateStr];
                      const isToday = dateStr === todayDateStr;
                      
                      return (
                        <div 
                          key={index}
                          className={`flex flex-col items-center justify-center p-0.5 rounded text-[8px] ${
                            isToday ? 'ring-1 ring-offset-1' : ''
                          } ${
                            isCheckedIn 
                              ? isNeomorphic 
                                ? (theme === 'neomorphic-dark' 
                                    ? 'text-emerald-400 bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' 
                                    : 'text-emerald-600 bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') 
                                : 'text-emerald-600 bg-emerald-500/20' 
                              : isNeomorphic 
                                ? (theme === 'neomorphic-dark' 
                                    ? 'text-zinc-500 bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' 
                                    : 'text-zinc-500 bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]') 
                                : 'text-zinc-400 bg-zinc-200/50'
                          }`}
                        >
                          <div className="flex items-center justify-center h-4 w-4">
                            {dayIcons[index]}
                          </div>
                          <span>{dayNames[index]}</span>
                        </div>
                      );
                  });
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

BattleTab.displayName = 'BattleTab';

export default BattleTab;