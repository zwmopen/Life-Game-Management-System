import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, ComposedChart } from 'recharts';
import { 
  Coins, Trophy, ShoppingBag, CheckCircle, Swords, Flame, 
  Shield, Brain, BicepsFlexed, Sparkles, Users, Plus, X, Crown,
  Edit3, Trash2, Repeat, Zap, ChevronDown, ChevronUp, Mic, Loader2, PackagePlus,
  Gamepad2, Play, Pause, StopCircle, Clock, Archive, ArchiveRestore, Settings, Gift,
  Box, XCircle, Sunset, Moon, Coffee, Dumbbell, BookOpen, Calendar, Check, Target, Pencil,
  Radar as RadarIcon, Container, Filter, Wrench, User, Crosshair, TrendingUp, Lock, Unlock, Skull, ArrowLeft, Star, Package, List, RefreshCw, Dice5, Hammer, Edit2, Layout,
  Smartphone, Laptop, Shirt, Ticket, Music, Wifi, Video, Square, CheckSquare, Dice1, Rocket,
  Headphones, Armchair, Scissors, Glasses, Footprints, Utensils, Sofa, Activity, Power, ChevronRight, Sun, Wallet, Bell,
  Camera, Tablet, Wind, Fish, Mountain, Home, Car, Heart, Globe, Palette
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Theme, AttributeType, AttributeTypeValue, Habit, Project, SubTask, TaskType, AutoTaskType, Task, DiceState, DiceTask, DiceCategory, DiceHistory, Settings as SettingsType, ProductType, ProductCategory } from '../types';
import CharacterProfile, { CharacterProfileHandle } from './CharacterProfile';
import { GlobalGuideCard, helpContent, GlobalHelpButton } from './HelpSystem';
import FateGiftModal from './shared/FateGiftModal';
import FateDice from './FateDice';
import TaskManagement from './taskmanagement';
import ShopCatalog from './ShopCatalog';
import BankModal from './shared/BankModal';
import MorningProtocolModal from './shared/MorningProtocolModal';
import ReminderPopup from './shared/ReminderPopup';
import TaskEditorModal from './TaskManagement/TaskEditorModal';

// 导入主题上下文
import { useTheme } from '../contexts/ThemeContext';

// 导入全局音频上下文
import { useGlobalAudio } from './GlobalAudioManagerOptimized';

// 导入自定义 Hook
import { useReminders } from '../hooks/useReminders';
import { useShop } from '../hooks/useShop';
import { useTaskOperations } from '../hooks/useTaskOperations';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

// 导入常量文件
import SHOP_CATALOG from '../constants/shopCatalog';
import { BLIND_BOX_PRICES, BLIND_BOX_RULES, HIDDEN_ITEM_PROBABILITY, getPriceRange, getHiddenItemPrice } from '../constants/blindBox';
import { ATTR_COLORS, getNeomorphicStyles, getButtonStyle, getCardBgStyle, getTextStyle } from '../utils/styleHelpers';

interface LifeGameProps {
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
  initialTab?: 'battle' | 'shop' | 'armory'; 
  initialCategory?: 'daily' | 'main' | 'timebox' | 'random';
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
  settings: SettingsType;
  setTodayGoal: (g: string) => void;
  givenUpTasks?: string[];
  onGiveUpTask?: (id: string) => void;
  isNavCollapsed: boolean;
  setIsNavCollapsed: (collapsed: boolean) => void;
  // 统计数据
  todayStats: {focusMinutes: number, tasksCompleted: number, habitsDone: number, earnings: number, spending: number};
  statsHistory: {[key: number]: {focusMinutes: number, tasksCompleted: number, habitsDone: number, earnings: number, spending: number}};
  // Pomodoro Global State
  timeLeft: number;
  isActive: boolean;
  duration: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onChangeDuration: (minutes: number) => void;
  onUpdateTimeLeft: (seconds: number) => void;
  onUpdateIsActive: (active: boolean) => void;
  // Additional props from previous code
  onUpdateHabitOrder?: (order: string[]) => void;
  onUpdateProjectOrder?: (order: string[]) => void;
  // Immersive Mode State
  isImmersive: boolean;
  setIsImmersive: (isImmersive: boolean) => void;
  onInternalImmersiveModeChange?: (isInternalImmersive: boolean) => void;
  
  // 命运骰子相关
  diceState?: DiceState;
  onSpinDice?: () => { success: boolean; message?: string };
  onDiceResult?: (result: 'completed' | 'skipped' | 'later') => void;
  onAddDiceTask?: (task: DiceTask) => void;
  onDeleteDiceTask?: (taskId: string, category: DiceCategory) => void;
  onUpdateDiceTask?: (taskId: string, category: DiceCategory, updates: Partial<DiceTask>) => void;
  onUpdateDiceConfig?: (config: Partial<DiceState['config']>) => void;
  onUpdateDiceState?: (updates: Partial<DiceState>) => void;
  // 角色等级变化回调
  onLevelChange: (newLevel: number, type: 'level' | 'focus' | 'wealth') => void;
  // 模态框状态管理
  setModalState?: (isOpen: boolean) => void;
}

const XP_PER_LEVEL = 200;

const LifeGame: React.FC<LifeGameProps> = ({ 
    balance, onUpdateBalance, habits, projects, habitOrder, projectOrder, onToggleHabit, onUpdateHabit, onDeleteHabit, onUpdateProject, onDeleteProject, onAddHabit, onAddProject, initialTab, initialCategory, onAddFloatingReward, totalTasksCompleted, totalHours,
    challengePool, setChallengePool, todaysChallenges, completedRandomTasks, onToggleRandomChallenge, onStartAutoTask, checkInStreak, onPomodoroComplete, xp, weeklyGoal, setWeeklyGoal, todayGoal, setTodayGoal,
    givenUpTasks = [], onGiveUpTask, onUpdateHabitOrder, onUpdateProjectOrder, isNavCollapsed, setIsNavCollapsed, todayStats, statsHistory,
    // Pomodoro Global State
    timeLeft, isActive, duration, onToggleTimer, onResetTimer, onChangeDuration, onUpdateTimeLeft, onUpdateIsActive,
    // Immersive Mode State
    isImmersive, setIsImmersive, onInternalImmersiveModeChange,
    // Settings
    settings = {},
    // 命运骰子相关
    diceState,
    onSpinDice,
    onDiceResult,
    onAddDiceTask,
    onDeleteDiceTask,
    onUpdateDiceTask,
    onUpdateDiceConfig,
    onUpdateDiceState,
    onLevelChange,
    // 模态框状态管理
    setModalState
}) => {
  const { theme } = useTheme();
  const isDark = theme.includes('dark');
  const isNeomorphic = theme.startsWith('neomorphic');
  const isNeomorphicDark = theme === 'neomorphic-dark';
  const todayStr = new Date().toLocaleDateString();
  const textMain = getTextStyle(isDark, isNeomorphic, 'main');
  const textSub = getTextStyle(isDark, isNeomorphic, 'sub');
  
  // 拟态风格样式变量
  const neomorphicStyles = getNeomorphicStyles(isNeomorphicDark);

  // 生成按钮样式的辅助函数
  const getButtonStyleLocal = (isActive: boolean, isSpecial?: boolean) => {
    return getButtonStyle(isActive, isSpecial, isNeomorphic, theme, isDark);
  };
  
  // 拟态风格卡片背景
  const cardBg = getCardBgStyle(isNeomorphic, theme, isDark);
  
  const [level, setLevel] = useState(1);
  const [savings, setSavings] = useState(0); 
  
  const characterProfileRef = useRef<CharacterProfileHandle>(null);

  const [mainTab, setMainTab] = useState<'battle' | 'shop' | 'armory'>(() => initialTab || 'battle');
  const [taskCategory, setTaskCategory] = useState<'daily' | 'main' | 'timebox' | 'random'>(initialCategory || 'timebox');
  
  // 使用 shop 钩子
  const {
    inventory,
    setInventory,
    isManageShopMode,
    setIsManageShopMode,
    shopFilter,
    setShopFilter,
    justPurchasedItem,
    isEditItemOpen,
    setIsEditItemOpen,
    editingItem,
    setEditingItem,
    handlePurchase,
    handleBlindBoxPurchase,
    handleDeleteItem,
    handleEditItemSave,
    handleAddNewItem,
    handleAddNewGroup,
    handleCancelAddGroup,
    handleEditGroup,
    handleDeleteGroup,
    isAddingGroup,
    setIsAddingGroup,
    newGroupName,
    setNewGroupName,
    groups,
    setGroups,
    handleShopDragStart,
    handleShopDragOver
  } = useShop({
    balance,
    onUpdateBalance,
    onAddFloatingReward,
    level,
    xp,
    savings
  });

  const [showBlindBoxHelp, setShowBlindBoxHelp] = useState(false);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('15');
  const [newTaskXP, setNewTaskXP] = useState('20');
  const [newTaskDuration, setNewTaskDuration] = useState('30');
  const [newTaskAttr, setNewTaskAttr] = useState<AttributeTypeValue>(AttributeType.WEALTH);
  const [newTaskType, setNewTaskType] = useState<'daily' | 'main' | 'random' | 'timebox'>('daily');
  const [newTaskDiceCategory, setNewTaskDiceCategory] = useState<DiceCategory>('health');
  const [newTaskNote, setNewTaskNote] = useState('');
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
    todayStr,
    givenUpTasks
  });

  const [isManageTasksOpen, setIsManageTasksOpen] = useState(false);
  const [manageTaskTab, setManageTaskTab] = useState<'daily' | 'main' | 'random'>('random');
  
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  // 战略储备双击编辑状态
  const [isEditingSavings, setIsEditingSavings] = useState(false);
  const [tempSavings, setTempSavings] = useState(balance);
  // 任务优先级状态
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  
  // 使用拖拽 Hook
  const { draggedTask, draggedTaskIndex, handleDragStart, handleDragEnd, handleDragOver } = useDragAndDrop({
    habitOrder,
    projectOrder,
    onUpdateHabitOrder,
    onUpdateProjectOrder
  });
  
  // 用于触发签到组件重新渲染的状态
  const [checkInUpdated, setCheckInUpdated] = useState(0);
  const [isEditingTodayGoal, setIsEditingTodayGoal] = useState(false);
  
  const [activeHelp, setActiveHelp] = useState<string | null>(null);

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

  // 使用全局音频上下文
  const { isMuted, setIsMuted, currentBgMusicId: currentSoundId, playBgMusic: setCurrentSoundId } = useGlobalAudio() as any;
  const audioRef = useRef<HTMLAudioElement | null>(null); // 保留 ref 以防其他地方引用，虽然不推荐
  
  // 更新tempSavings以反映最新的balance值
  useEffect(() => {
    if (!isEditingSavings) {
      setTempSavings(balance);
    }
  }, [balance, isEditingSavings]);

  // 处理编辑商品模态框的状态更新
  useEffect(() => {
    if (isEditItemOpen) {
      setModalState && setModalState(true);
    } else {
      setModalState && setModalState(false);
    }
  }, [isEditItemOpen]);

  // 处理任务管理界面的状态更新
  useEffect(() => {
    if (isManageTasksOpen) {
      setModalState && setModalState(true);
    } else {
      setModalState && setModalState(false);
    }
  }, [isManageTasksOpen]);

  // 监听initialTab变化，更新mainTab状态 - 修复：使用useRef避免Hook顺序问题
  const initialTabRef = useRef(initialTab);
  useEffect(() => {
    // 只有当initialTab真正发生变化时才更新
    if (initialTabRef.current !== initialTab) {
      initialTabRef.current = initialTab;
      if (initialTab) {
        setMainTab(initialTab);
      }
    }
  }, [initialTab]);
  
  const handleProtocolComplete = () => {
      onUpdateBalance(50, `晨间协议完成 (Ready: ${readiness}%)`);
      setTodayGoal(protocolFocus); 
      setShowProtocol(false);
      setProtocolStep(0);
      setProtocolFocus('');
      onAddFloatingReward("今日战役目标已锁定", "text-red-500");
  };

  // Help content for different sections with update time

  // 按照habitOrder排序习惯任务
  const sortedHabits = habitOrder.map(id => habits.find(h => h.id === id)).filter(h => h !== undefined) as Habit[];
  // 使用useMemo确保当habits、todayStr或givenUpTasks变化时，habitTasks会重新生成
  const habitTasks = useMemo(() => {
    return sortedHabits.map(h => ({
        id: h.id, text: h.name, attr: h.attr || 'DIS', xp: h.xp || Math.ceil(h.reward * 1.5), gold: h.reward, duration: h.duration || 0,
        type: TaskType.DAILY, completed: !!h.history[todayStr], frequency: 'daily' as const, originalData: h,
        isGivenUp: givenUpTasks.includes(h.id),
        priority: h.priority,
        reminder: h.reminder
    })).sort((a, b) => {
        if (a.isGivenUp && !b.isGivenUp) return 1;
        if (!a.isGivenUp && b.isGivenUp) return -1;
        return Number(a.completed) - Number(b.completed);
    });
  }, [sortedHabits, todayStr, givenUpTasks, habits, habitOrder]);

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
            priority: p.priority,
            originalData: p,
            reminder: p.reminder,
            subTasks: p.subTasks.map(st => ({
                id: st.id, text: st.title, completed: st.completed, 
                xp: avgXP, // 均分主线任务的经验奖励
                gold: avgGold, // 均分主线任务的金币奖励
                duration: st.duration || 30, // 子任务自己的时长，默认30分钟
                priority: st.priority
            }))
        };
    }).sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [sortedProjects]);

  // 检查并修复商品图片
  useEffect(() => {
    const checkAndFixImages = async () => {
      const saved = localStorage.getItem('life-game-stats-v2'); 
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setLevel(data.level || 1);
          setSavings(data.savings || 0);
        } catch (e) { /* 静默处理保存文件损坏的情况 */ }
      }
    };
    
    checkAndFixImages();
  }, []);

  useEffect(() => {
    localStorage.setItem('life-game-stats-v2', JSON.stringify({ level, xp, inventory, savings }));
  }, [level, xp, inventory, savings]);

  // 盲盒购买处理函数
  const handleStartTimer = (duration: number) => {
      if (characterProfileRef.current) {
          characterProfileRef.current.startTimer(duration);
          onAddFloatingReward(`番茄钟: ${duration}min`, "text-emerald-500");
      } else {
          // 静默处理定时器引用未附加的情况
      }
  };

  const toggleSubTask = (projectId: string, subTaskId: string) => {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      const subTask = project.subTasks.find(t => t.id === subTaskId);
      if (!subTask) return;

      const newStatus = !subTask.completed;
      const newSubTasks = project.subTasks.map(t => t.id === subTaskId ? { ...t, completed: newStatus } : t);
      
      onUpdateProject(projectId, { subTasks: newSubTasks });
      
      if (newStatus) {
          // 播放完成音效
          const completeSound = new Audio("/audio/sfx/日常任务完成音效.mp3");
          completeSound.volume = 0.5;
          completeSound.play().catch(()=>{});
          
          // 触发小型烟花效果
          confetti({
              particleCount: 50,
              spread: 50,
              origin: { x: 0.5, y: 0.5 },
              colors: ['#fbbf24', '#f59e0b', '#d97706', '#3b82f6', '#10b981', '#8b5cf6'],
              animationDuration: 600
          });
      }
  };

  const giveUpSubTask = (projectId: string, subTaskId: string) => {
      // 直接放弃子任务，不删除，标记为已完成但不计入奖励
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      const subTask = project.subTasks.find(t => t.id === subTaskId);
      if (!subTask) return;
      
      const newSubTasks = project.subTasks.map(t => t.id === subTaskId ? { ...t, completed: true, isGivenUp: true } : t);
      onUpdateProject(projectId, { subTasks: newSubTasks });
      
      // 播放放弃音效
      const giveUpSound = new Audio("/audio/sfx/任务放弃音效bubblepop-254773.mp3");
      giveUpSound.volume = 0.5;
      giveUpSound.play().catch(()=>{});
      
      // 触发命运骰子机制
      setTimeout(() => {
          if (onSpinDice) {
              const result = onSpinDice();
              if (!result.success && result.message) {
                  onAddFloatingReward(result.message, 'text-red-500');
              }
          }
      }, 300);
  };

  const openEditTask = (task: any) => {
      setEditingTaskId(task.id);
      setNewTaskTitle(task.text);
      setNewTaskReward((task.gold || 0).toString());
      setNewTaskXP((task.xp || 20).toString());
      setNewTaskDuration((task.duration || 30).toString());
      setNewTaskType(task.type || (task.category ? 'random' : 'daily'));
      setNewTaskPriority(task.priority || 'medium');
      
      if (task.category) {
          setNewTaskDiceCategory(task.category);
      }
      
      // 加载提醒设置
      let taskReminder = null;
      if (task.type === TaskType.DAILY) {
          const habit = habits.find(h => h.id === task.id);
          taskReminder = habit?.reminder;
      } else if (task.type === TaskType.MAIN || task.type === 'timebox') {
          const project = projects.find(p => p.id === task.id);
          taskReminder = project?.reminder;
      } else if (task.reminder) {
          // 对于其他类型的任务，直接使用task.reminder
          taskReminder = task.reminder;
      }
      
      if (taskReminder) {
          setReminderEnabled(taskReminder.enabled);
          setReminderDate(taskReminder.date || '');
          setReminderTime(taskReminder.time || '');
          setReminderRepeat(taskReminder.repeat || 'none');
          setReminderInterval(taskReminder.repeatInterval?.toString() || '1');
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
  };

  const openEditRandomTask = (taskStr: string) => {
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
  };

  const handleSaveEditTask = () => {
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
              priority: newTaskPriority,
              reminder: reminderData,
              note: newTaskNote
          });
      } else if (newTaskType === 'main' || newTaskType === 'timebox') {
          onUpdateProject(editingTaskId!, { 
              name: newTaskTitle, 
              subTasks: editingProjectSubTasks,
              priority: newTaskPriority,
              reminder: reminderData as any,
              note: newTaskNote
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
                    attr: newTaskAttr,
                    priority: newTaskPriority,
                    reminder: reminderData,
                    note: newTaskNote
                };
                setChallengePool(prevPool => prevPool.map(task => task === originalTaskStr ? JSON.stringify(newTask) : task));
            } else if (editingTaskId) {
                // 处理命运骰子任务
                onUpdateDiceTask(editingTaskId, newTaskDiceCategory, {
                    text: newTaskTitle,
                    gold: parseInt(newTaskReward) || 20,
                    xp: parseInt(newTaskXP) || 30,
                    duration: parseInt(newTaskDuration) || 20,
                    priority: newTaskPriority,
                    reminder: reminderData,
                    note: newTaskNote
                });
            }
        }
      setIsAddTaskOpen(false);
      setEditingTaskId(null);
  };

  const handleAddNewTask = () => {
      if (!newTaskTitle.trim()) return;

      const reminderData = reminderEnabled ? {
          enabled: true,
          date: reminderDate,
          time: reminderTime,
          repeat: reminderRepeat,
          repeatInterval: parseInt(reminderInterval) || 1
      } : undefined;

      if (newTaskType === 'daily') {
          // 为习惯任务添加note字段
          const habitWithNote = {
              id: Date.now().toString(),
              name: newTaskTitle,
              reward: parseInt(newTaskReward) || 15,
              xp: parseInt(newTaskXP) || 20,
              duration: parseInt(newTaskDuration) || 30,
              color: '#8b5cf6',
              attr: newTaskAttr,
              archived: false,
              history: {},
              logs: {},
              priority: newTaskPriority,
              reminder: reminderData,
              note: newTaskNote
          };
          // 调用onAddHabit或直接添加到habits状态
          onAddHabit(newTaskTitle, parseInt(newTaskReward) || 15);
      } else if (newTaskType === 'main' || newTaskType === 'timebox') {
          // 如果没有手动设置提醒，则为任务设置默认的每日14点提醒
          const projectReminderData = reminderEnabled ? {
              enabled: true,
              date: reminderDate,
              time: reminderTime,
              repeat: reminderRepeat,
              repeatInterval: parseInt(reminderInterval) || 1
          } : {
              enabled: true,
              time: '14:00',
              repeat: 'daily'
          };
          
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
              priority: newTaskPriority,
              reminder: projectReminderData as any,
              note: newTaskNote
          });
      } else if (newTaskType === 'random') {
          const newTask = {
              text: newTaskTitle,
              gold: parseInt(newTaskReward) || 20,
              xp: parseInt(newTaskXP) || 30,
              duration: parseInt(newTaskDuration) || 20,
              attr: AttributeType.WEALTH,
              category: newTaskDiceCategory || 'health',
              priority: newTaskPriority,
              note: newTaskNote
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
      setNewTaskPriority('medium');
      setNewTaskNote('');
      setEditingProjectSubTasks([]);
      setReminderEnabled(false);
      setReminderDate('');
      setReminderTime('');
      setReminderRepeat('none');
      setReminderInterval('1');
  };

  return (
        <div className={`h-full flex flex-col overflow-hidden relative`}>
            
            {/* Reminder Popup */}
            <ReminderPopup
                activeReminder={activeReminder}
                onClose={() => setActiveReminder(null)}
                onStart={(duration) => {
                    setActiveReminder(null);
                    // 设置时长为任务原本需要耗费的时长，默认为25分钟
                    const taskDuration = duration || 25;
                    onChangeDuration(taskDuration);
                    // 启动番茄钟
                    onToggleTimer();
                    // 进入沉浸式模式
                    setIsImmersive(true);
                }}
                isNeomorphic={isNeomorphic}
                theme={theme}
                isDark={isDark}
                textMain={textMain}
                textSub={textSub}
            />
            
            {/* Global Guide Card - 使用统一的帮助卡片系统组件 */}
            <GlobalGuideCard
              activeHelp={activeHelp}
              helpContent={helpContent}
              onClose={() => setActiveHelp(null)}
              cardBg={cardBg}
              textMain={textMain}
              textSub={textSub}
              config={(settings as SettingsType)?.guideCardConfig || {
                fontSize: 'medium',
                borderRadius: 'medium',
                shadowIntensity: 'medium',
                showUnderlyingPrinciple: true
              }}
            />
            
            {/* 全局命运骰子结果弹窗 - 确保在所有任务分类下都能显示 */}
            {diceState?.currentResult && (
                <FateGiftModal
                    task={diceState.currentResult as any}
                    isSpinning={diceState.isSpinning}
                    onComplete={() => {
                        onDiceResult && onDiceResult('completed');
                        setModalState && setModalState(false);
                    }}
                    onLater={() => {
                        onDiceResult && onDiceResult('later');
                        setModalState && setModalState(false);
                    }}
                    onSkip={() => {
                        onDiceResult && onDiceResult('skipped');
                        setModalState && setModalState(false);
                    }}
                    onStartTimer={(duration) => {
                        onChangeDuration(duration);
                        onToggleTimer();
                        // 进入沉浸式模式
                        setIsImmersive(true);
                    }}
                    theme={theme}
                    onModalOpen={() => setModalState && setModalState(true)}
                />
            )}

        {/* PURCHASE ANIMATION - Improved with large centered square popup */}
        {justPurchasedItem && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center animate-in fade-in duration-300">
                {/* Large Centered Square Popup with product image background */}
                <div className={`relative w-[400px] h-[400px] flex flex-col items-center justify-end gap-4 rounded-2xl shadow-2xl mx-4 transition-all duration-300 overflow-hidden ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-[#1e1e2e]' : 'bg-[#e0e5ec] border-[#e0e5ec]') : isDark ? 'bg-zinc-900/95 border border-yellow-500/30' : 'bg-white/95 border border-slate-200'}`}>
                    {/* Product Image Background */}
                    {justPurchasedItem.image && (
                        <div className="absolute inset-0 z-0">
                            <img 
                                src={justPurchasedItem.image} 
                                alt={justPurchasedItem.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    
                    {/* Background Overlay */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-black/50 to-black/80"></div>
                    
                    {/* Content */}
                    <div className="relative z-20 flex flex-col gap-2 p-6 w-full bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-xl font-bold text-white">购买成功</h3>
                        <div className="font-bold text-yellow-400 text-lg">获得 {justPurchasedItem.name}</div>
                        <div className={`font-mono text-sm text-red-300`}>金币 - {justPurchasedItem.cost}G</div>
                        <div className={`font-mono text-sm text-green-300`}>当前剩余 {balance}G</div>
                    </div>
                </div>
            </div>
        )}

        {/* Morning Protocol Modal */}
        <MorningProtocolModal
            show={showProtocol}
            step={protocolStep}
            setStep={setProtocolStep}
            readiness={readiness}
            setReadiness={setReadiness}
            protocolFocus={protocolFocus}
            setProtocolFocus={setProtocolFocus}
            onComplete={handleProtocolComplete}
        />

        {/* 虚拟银行模态框 */}
        <BankModal
            show={showBankModal}
            onClose={() => setShowBankModal(false)}
            bankAccount={bankAccount}
            onWithdrawAll={() => {
                if (bankAccount.balance > 0) {
                    onUpdateBalance(bankAccount.balance, '取出全部存款');
                    const newBankAccount = { ...bankAccount, balance: 0 };
                    setBankAccount(newBankAccount);
                    localStorage.setItem('life-game-bank', JSON.stringify(newBankAccount));
                    setShowBankModal(false);
                }
            }}
            isDark={isDark}
            isNeomorphic={isNeomorphic}
            theme={theme}
            textMain={textMain}
            textSub={textSub}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 relative custom-scrollbar">
            {mainTab === 'battle' && (
              <CharacterProfile ref={characterProfileRef} theme={theme} xp={xp} balance={balance} totalHours={totalHours} totalKills={totalTasksCompleted} checkInStreak={checkInStreak} onPomodoroComplete={onPomodoroComplete} onUpdateBalance={onUpdateBalance} onLevelChange={onLevelChange} 
                // Pomodoro Global State
                timeLeft={timeLeft}
                isActive={isActive}
                duration={duration}
                onToggleTimer={onToggleTimer}
                onResetTimer={onResetTimer}
                onChangeDuration={onChangeDuration}
                onUpdateTimeLeft={onUpdateTimeLeft}
                onUpdateIsActive={onUpdateIsActive}
                // Audio Management
                isMuted={isMuted}
                currentSoundId={currentSoundId}
                onToggleMute={setIsMuted}
                onSoundChange={setCurrentSoundId}
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
            )}
            {mainTab === 'battle' && (
                <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                    {/* 实时情报卡模块 - 从战略指挥部移动过来 */}
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
                                            data={(() => {
                                                const data = [];
                                                for (let i = 6; i >= 0; i--) {
                                                    const date = new Date();
                                                    date.setDate(date.getDate() - i);
                                                    const dayStr = date.toLocaleDateString('zh-CN', { day: 'numeric' });
                                                    
                                                    // 获取当天的专注时间
                                                    let focusMinutes = 0;
                                                    // 检查statsHistory中是否有该日期的数据
                                                    const dayKey = Object.keys(statsHistory).find(key => {
                                                        const statsDate = new Date();
                                                        statsDate.setDate(statsDate.getDate() - (7 - i));
                                                        return parseInt(key) === statsDate.getDate();
                                                    });
                                                    
                                                    if (dayKey) {
                                                        focusMinutes = statsHistory[parseInt(dayKey)].focusMinutes;
                                                    } else if (i === 0) {
                                                        // 今天的数据
                                                        focusMinutes = todayStats?.focusMinutes || 0;
                                                    }
                                                    
                                                    data.push({
                                                        date: dayStr,
                                                        focusMinutes
                                                    });
                                                }
                                                return data;
                                            })()}
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
                                            本周平均专注：<span className="font-black">{(() => {
                                                // 计算本周平均专注时间
                                                const total = Object.values(statsHistory).reduce((sum, stats: any) => sum + (stats.focusMinutes || 0), 0) + (todayStats?.focusMinutes || 0);
                                                const days = Math.min(Object.keys(statsHistory).length + 1, 7);
                                                return Math.round(total / days) || 0; 
                                            })()} min</span> 今日已经专注：<span className="font-black">{todayStats?.focusMinutes || 0} min</span>
                                        </span>
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
                                    <button 
                                        onClick={() => {
                                            // 获取签到数据
                                            const todayDate = new Date().toLocaleDateString();
                                            const checkInData = JSON.parse(localStorage.getItem('life-game-weekly-checkin') || '{}');
                                            
                                            // 检查是否已签到
                                            if (!checkInData[todayDate]) {
                                                // 更新签到数据
                                                checkInData[todayDate] = true;
                                                localStorage.setItem('life-game-weekly-checkin', JSON.stringify(checkInData));
                                                
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
                                                const consecutiveDays = weekDates.filter(date => checkInData[date]).length;
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
                                                confetti({
                                                    particleCount: 100,
                                                    spread: 70,
                                                    origin: { y: 0.6 },
                                                    colors: ['#fbbf24', '#f59e0b', '#d97706', '#3b82f6', '#10b981', '#8b5cf6']
                                                });
                                                
                                                // 关联勋章系统：更新签到 streak
                                                const streak = checkInStreak + 1;
                                                localStorage.setItem('aes-checkin-streak', streak.toString());
                                                
                                                // 使用React状态更新，确保组件重新渲染
                                                setTimeout(() => {
                                                    // 更新状态触发重新渲染
                                                    setCheckInUpdated(prev => prev + 1);
                                                }, 100);
                                            }
                                        }}
                                        disabled={(() => {
                                            const todayDate = new Date().toLocaleDateString();
                                            const checkInData = JSON.parse(localStorage.getItem('life-game-weekly-checkin') || '{}');
                                            return !!checkInData[todayDate];
                                        })()}
                                        className={`w-11 h-11 rounded-full text-sm font-bold transition-all duration-300 flex flex-col items-center justify-center gap-0 ${(() => {
                                            const todayDate = new Date().toLocaleDateString();
                                            const checkInData = JSON.parse(localStorage.getItem('life-game-weekly-checkin') || '{}');
                                            
                                            if (checkInData[todayDate]) {
                                                return isNeomorphic 
                                                    ? (theme === 'neomorphic-dark' 
                                                        ? 'bg-[#1e1e2e] text-emerald-500 border-2 border-emerald-500/30 cursor-not-allowed shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-3px_-3px_6px_rgba(30,30,46,0.8)]' 
                                                        : 'bg-[#e0e5ec] text-emerald-500 border-2 border-emerald-500/30 cursor-not-allowed shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)]') 
                                                    : 'bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500/30 cursor-not-allowed';
                                            } else {
                                                return isNeomorphic 
                                                    ? (theme === 'neomorphic-dark' 
                                                        ? 'bg-[#1e1e2e] text-blue-500 border-2 border-blue-500/30 hover:shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(30,30,46,0.8)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-3px_-3px_6px_rgba(30,30,46,0.8)] animate-pulse' 
                                                        : 'bg-[#e0e5ec] text-blue-500 border-2 border-blue-500/30 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] animate-pulse') 
                                                    : 'bg-blue-600 text-white border-2 border-blue-700 hover:bg-blue-700 shadow-lg shadow-blue-900/30 transform hover:scale-105 animate-pulse';
                                            }
                                        })()}`}
                                    >
                                        {(() => {
                                            const todayDate = new Date().toLocaleDateString();
                                            const checkInData = JSON.parse(localStorage.getItem('life-game-weekly-checkin') || '{}');
                                            return checkInData[todayDate] ? (
                                                <>
                                                    <Check size={20} strokeWidth={3}/>
                                                    <span className="text-[9px]">已签</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Package size={20} strokeWidth={2}/>
                                                    <span className="text-[9px]">签到</span>
                                                </>
                                            );
                                        })()}
                                    </button>
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
                                        const dayIcons = [<Sun size={14}/>, <Coffee size={14}/>, <BookOpen size={14}/>, <Dumbbell size={14}/>, <Users size={14}/>, <Music size={14}/>, <Moon size={14}/>];
                                        
                                        return weekDates.map((date, index) => {
                                            const dateStr = date.toLocaleDateString();
                                            const isCheckedIn = !!checkInData[dateStr];
                                            const isToday = dateStr === todayDateStr;
                                            
                                            return (
                                                <div 
                                                    key={index} 
                                                    className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${isToday ? 'scale-105' : ''}`}
                                                >
                                                    <div className={`
                                                        w-full aspect-square rounded-full flex items-center justify-center border-2 text-[7px] font-bold transition-all
                                                        ${isCheckedIn 
                                                            ? (isNeomorphic 
                                                                ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-emerald-500/30 text-emerald-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] border-emerald-500/30 text-emerald-500 shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)]') 
                                                                : 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-[0_0_3px_rgba(16,185,129,0.3)]')
                                                            : isToday 
                                                            ? (isNeomorphic 
                                                                ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-blue-500/30 text-blue-500 shadow-[1px_1px_2px_rgba(0,0,0,0.4),-1px_-1px_2px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] border-blue-500/30 text-blue-500 shadow-[1px_1px_2px_rgba(163,177,198,0.6),-1px_-1px_2px_rgba(255,255,255,1)]') 
                                                                : 'border-blue-500 bg-blue-500/10 text-blue-500 shadow-[0_0_3px_rgba(59,130,246,0.3)]')
                                                            : (isNeomorphic 
                                                                ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-zinc-600/30 text-zinc-400 shadow-[1px_1px_2px_rgba(0,0,0,0.4),-1px_-1px_2px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] border-zinc-300/30 text-zinc-400 shadow-[1px_1px_2px_rgba(163,177,198,0.6),-1px_-1px_2px_rgba(255,255,255,1)]') 
                                                                : (isDark ? 'border-zinc-800 bg-zinc-800 text-zinc-600' : 'border-slate-200 bg-slate-100 text-slate-400'))
                                                    }
                                                    `}>
                                                        {isCheckedIn && <Check size={14} strokeWidth={3} className="flex-shrink-0"/>}
                                                        {!isCheckedIn && dayIcons[index]}
                                                    </div>
                                                    <div className={`text-[7px] font-bold ${isCheckedIn ? 'text-emerald-500' : isToday ? 'text-blue-500' : (isDark ? 'text-zinc-500' : 'text-slate-500')}`}>
                                                        {dayNames[index]}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 任务管理系统 - 使用新的TaskManagement组件 */}
                    <TaskManagement
                        habitTasks={habitTasks}
                        projectTasks={projectTasks}
                        diceState={diceState}
                        taskCategory={taskCategory}
                        setTaskCategory={setTaskCategory}
                        onCompleteTask={completeTask}
                        onGiveUpTask={giveUpTask}
                        onOpenEditTask={openEditTask}
                        onToggleSubTask={toggleSubTask}
                        onGiveUpSubTask={giveUpSubTask}
                        onStartTimer={handleStartTimer}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        draggedTask={draggedTask}
                        onSpinDice={onSpinDice}
                        onUpdateDiceState={onUpdateDiceState}
                        onDiceResult={onDiceResult}
                        onChangeDuration={onChangeDuration}
                        onToggleTimer={onToggleTimer}
                        onAddFloatingReward={onAddFloatingReward}
                        theme={theme}
                        cardBg={cardBg}
                        textMain={textMain}
                        textSub={textSub}
                        isDark={isDark}
                        isNeomorphic={isNeomorphic}
                        onShowHelp={setActiveHelp}
                        todayStr={todayStr}
                        setIsImmersive={setIsImmersive}
                        onAddTask={() => {
                            // 根据当前任务分类设置新任务类型
                            if (taskCategory === 'daily') {
                                setNewTaskType('daily');
                            } else if (taskCategory === 'timebox') {
                                setNewTaskType('timebox');
                            } else if (taskCategory === 'random') {
                                setNewTaskType('random');
                            }
                            // 打开任务编辑模态框（添加新任务）
                            setEditingTaskId(null);
                            setNewTaskTitle('');
                            setNewTaskReward('15');
                            setNewTaskXP('20');
                            setNewTaskDuration('30');
                            setNewTaskPriority('medium');
                            setNewTaskNote('');
                            setReminderEnabled(false);
                            setReminderDate('');
                            setReminderTime('');
                            setReminderRepeat('none');
                            setReminderInterval('1');
                            setEditingProjectSubTasks([]);
                            setIsAddTaskOpen(true);
                            setModalState && setModalState(true);
                        }}
                        onOpenTaskManagement={() => {
                            setIsManageTasksOpen(true);
                            setModalState && setModalState(true);
                        }}
                        setIsNavCollapsed={setIsNavCollapsed}
                    />
                </div>
            )}

            {/* ... Other Tabs (Shop, Armory, Modals) ... */}
            {/* ... The rest of the tabs are controlled by the mainTab switch above ... */}
            {mainTab === 'shop' && (
                <ShopCatalog
                    inventory={inventory}
                    setInventory={setInventory}
                    shopFilter={shopFilter}
                    setShopFilter={setShopFilter}
                    isManageShopMode={isManageShopMode}
                    setIsManageShopMode={setIsManageShopMode}
                    balance={balance}
                    onPurchase={handlePurchase}
                    onBlindBoxPurchase={handleBlindBoxPurchase}
                    onAddNewItem={handleAddNewItem}
                    onDeleteItem={handleDeleteItem}
                    onEditItem={(item) => { setEditingItem(item); setIsEditItemOpen(true); }}
                    onDragStart={handleShopDragStart}
                    onDragOver={handleShopDragOver}
                    onShowHelp={setActiveHelp}
                    theme={theme}
                    isDark={isDark}
                    isNeomorphic={isNeomorphic}
                    cardBg={cardBg}
                    textMain={textMain}
                    textSub={textSub}
                    neomorphicStyles={neomorphicStyles}
                    justPurchasedItem={justPurchasedItem}
                    groups={groups}
                    setGroups={setGroups}
                    isAddingGroup={isAddingGroup}
                    setIsAddingGroup={setIsAddingGroup}
                    newGroupName={newGroupName}
                    setNewGroupName={setNewGroupName}
                    handleAddNewGroup={handleAddNewGroup}
                    handleCancelAddGroup={handleCancelAddGroup}
                    handleEditGroup={handleEditGroup}
                    handleDeleteGroup={handleDeleteGroup}
                />
            )}
            {mainTab === 'armory' && (
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex items-center gap-4 mb-4"><button onClick={() => setMainTab('battle')} className={`p-2 rounded-full border text-zinc-500 transition-all group ${isDark ? 'border-zinc-700 hover:text-white hover:bg-zinc-700' : 'border-slate-300 hover:bg-slate-100'}`}><ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/></button><h2 className={`text-xl font-bold ${textMain}`}>军械库 (Armory)</h2></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inventory.filter(i => i.type === 'physical' && i.owned).map(item => (
                            <div key={item.id} className={`p-4 rounded-xl border-2 ${item.equipped ? 'border-emerald-500 bg-emerald-900/10' : (isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-white')}`}>
                                <div className="flex gap-4"><div className="text-3xl">{item.icon}</div><div><div className={`font-bold ${textMain}`}>{item.name}</div><div className="text-xs text-zinc-500">{item.description}</div></div></div>
                                <div className="mt-2 text-[10px] text-emerald-500 font-bold uppercase tracking-wider text-right">已拥有</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        {/* Modals */}
        
        {/* Task Management Modal - FIXED */}
        {isManageTasksOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                <div className={`w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] ${cardBg}`}>
                    <div className={`p-4 border-b flex justify-between items-center shrink-0 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                        <h3 className={`font-bold ${textMain}`}>任务管理系统</h3>
                        <button onClick={() => {
                            setIsManageTasksOpen(false);
                            setModalState && setModalState(false);
                        }} className="text-zinc-500 hover:text-red-500"><X size={20}/></button>
                    </div>
                            
                    <div className={`flex p-2 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                        <button onClick={() => setManageTaskTab('random')} className={`flex-1 text-xs py-2 rounded-full font-bold flex items-center justify-center gap-1 transition-all duration-200 ${getButtonStyleLocal(manageTaskTab === 'random')}`}><Dice5 size={12} /> 命运骰子</button>
                        <button onClick={() => setManageTaskTab('main')} className={`flex-1 text-xs py-2 rounded-full font-bold transition-all duration-200 ${getButtonStyleLocal(manageTaskTab === 'main')}`}>时间盒子</button>
                        <button onClick={() => setManageTaskTab('daily')} className={`flex-1 text-xs py-2 rounded-full font-bold transition-all duration-200 ${getButtonStyleLocal(manageTaskTab === 'daily')}`}>日常显化</button>
                    </div>
                            
                    <div className={`p-4 overflow-y-auto space-y-2 flex-1`}>
                        {/* 任务部署中心 - 统一入口 */}
                        <div className="flex justify-center p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <button 
                                onClick={() => {
                                    setNewTaskType(manageTaskTab as 'daily' | 'main' | 'random');
                                    setIsAddTaskOpen(true);
                                }}
                                className={`px-8 py-3 text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] text-emerald-400 hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] text-emerald-600 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'}`}
                            >
                                <Rocket size={18} /> 部署新任务
                            </button>
                        </div>
                                                     
                        {/* 现有任务列表 */}
                        <div className="space-y-2">
                            {manageTaskTab === 'daily' && habits.map((h) => (
                                <div key={h.id} className={`flex items-center justify-between p-2 rounded ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none rounded-lg' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none rounded-lg') : (isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50')}`}>
                                    <span className={`text-xs ${textMain}`}>{h.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => { openEditTask({...h, text:h.name, type:'daily', gold:h.reward}); }} className={`${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] border-none rounded-full text-blue-400 hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(30,30,46,0.7)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(30,30,46,0.7)] p-1' : 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] border-none rounded-full text-blue-500 hover:shadow-[1px_1px_3px_rgba(163,177,198,0.6),-1px_-1px_3px_rgba(255,255,255,1)] active:shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)] p-1') : 'text-blue-500 hover:text-blue-400 p-1 rounded-full hover:bg-blue-900/10'}`}><Edit3 size={14}/></button>
                                        <button onClick={() => onDeleteHabit(h.id)} className={`${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] border-none rounded-full text-red-400 hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(30,30,46,0.7)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(30,30,46,0.7)] p-1' : 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] border-none rounded-full text-red-500 hover:shadow-[1px_1px_3px_rgba(163,177,198,0.6),-1px_-1px_3px_rgba(255,255,255,1)] active:shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)] p-1') : 'text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-red-900/10'}`}><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                            {manageTaskTab === 'main' && projects.map((p) => (
                                <div key={p.id} className={`flex items-center justify-between p-2 rounded ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none rounded-lg' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none rounded-lg') : (isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50')}`}>
                                    <span className={`text-xs ${textMain}`}>{p.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => { openEditTask({...p, text:p.name, type:'main', gold:500}); }} className={`${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] border-none rounded-full text-blue-400 hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(30,30,46,0.7)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(30,30,46,0.7)] p-1' : 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] border-none rounded-full text-blue-500 hover:shadow-[1px_1px_3px_rgba(163,177,198,0.6),-1px_-1px_3px_rgba(255,255,255,1)] active:shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)] p-1') : 'text-blue-500 hover:text-blue-400 p-1 rounded-full hover:bg-blue-900/10'}`}><Edit3 size={14}/></button>
                                        <button onClick={() => onDeleteProject(p.id)} className={`${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] border-none rounded-full text-red-400 hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(30,30,46,0.7)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(30,30,46,0.7)] p-1' : 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] border-none rounded-full text-red-500 hover:shadow-[1px_1px_3px_rgba(163,177,198,0.6),-1px_-1px_3px_rgba(255,255,255,1)] active:shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)] p-1') : 'text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-red-900/10'}`}><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                            {manageTaskTab === 'random' && diceState && (
                                <>
                                    {/* 分类任务列表 */}
                                    {Object.entries(diceState.taskPool as Record<string, any[]>).map(([categoryKey, tasks]) => {
                                        if ((tasks as any[]).length === 0) return null;
                                                
                                        // 获取分类标签和颜色
                                        const categoryInfo = {
                                            health: { label: '健康微行动', color: 'emerald' },
                                            efficiency: { label: '效率任务', color: 'blue' },
                                            leisure: { label: '休闲小奖励', color: 'purple' }
                                        }[categoryKey as keyof typeof categoryInfo] || { label: categoryKey, color: 'gray' };
                                        return (
                                            <div key={categoryKey} className="mb-4">
                                                <h4 className={`text-sm font-bold mb-2 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 bg-${categoryInfo.color}-500`}></span>
                                                    {categoryInfo.label} ({(tasks as any[]).length})
                                                </h4>
                                                <div className="space-y-2">
                                                    {(tasks as any[]).map((task, index) => {
                                                        return (
                                                            <div key={index} className={`flex items-center justify-between p-2 rounded ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none rounded-lg' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none rounded-lg') : (isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50')}`}>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-xs ${textMain}`}>{task.text}</span>
                                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full bg-${categoryInfo.color}-100 text-${categoryInfo.color}-700 ${isDark ? 'bg-' + categoryInfo.color + '-900/30 text-' + categoryInfo.color + '-400' : ''}`}>
                                                                        {categoryInfo.label}
                                                                    </span>
                                                                    <span className={`text-[9px] text-zinc-500`}>+{task.gold}G</span>
                                                                    <span className={`text-[9px] text-zinc-500`}>{task.duration}m</span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button 
                                                                        onClick={() => {
                                                                            openEditTask({...task, id: task.id, type: 'random', gold: task.gold, xp: task.xp, completed: false, frequency: 'once'});
                                                                        }}
                                                                        className={`${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] border-none rounded-full text-blue-400 hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(30,30,46,0.7)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(30,30,46,0.7)] p-1' : 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] border-none rounded-full text-blue-500 hover:shadow-[1px_1px_3px_rgba(163,177,198,0.6),-1px_-1px_3px_rgba(255,255,255,1)] active:shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)] p-1') : 'text-blue-500 hover:text-blue-400 p-1 rounded-full hover:bg-blue-900/10'}`}
                                                                    >
                                                                        <Edit3 size={14}/>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => onDeleteDiceTask(task.id, task.category as DiceCategory)}
                                                                        className={`${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] border-none rounded-full text-red-400 hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(30,30,46,0.7)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(30,30,46,0.7)] p-1' : 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] border-none rounded-full text-red-500 hover:shadow-[1px_1px_3px_rgba(163,177,198,0.6),-1px_-1px_3px_rgba(255,255,255,1)] active:shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)] p-1') : 'text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-red-900/10'}`}
                                                                    >
                                                                        <Trash2 size={14}/>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Edit Task Modal */}
        <TaskEditorModal
            isOpen={isAddTaskOpen}
            onClose={() => {
                setIsAddTaskOpen(false);
                setModalState && setModalState(false);
            }}
            onOpen={() => setModalState && setModalState(true)}
            editingTaskId={editingTaskId}
            newTaskTitle={newTaskTitle}
            setNewTaskTitle={setNewTaskTitle}
            newTaskType={newTaskType}
            newTaskXP={newTaskXP}
            setNewTaskXP={setNewTaskXP}
            newTaskReward={newTaskReward}
            setNewTaskReward={setNewTaskReward}
            newTaskDuration={newTaskDuration}
            setNewTaskDuration={setNewTaskDuration}
            newTaskPriority={newTaskPriority}
            setNewTaskPriority={setNewTaskPriority}
            newTaskNote={newTaskNote}
            setNewTaskNote={setNewTaskNote}
            reminderEnabled={reminderEnabled}
            setReminderEnabled={setReminderEnabled}
            reminderDate={reminderDate}
            setReminderDate={setReminderDate}
            reminderTime={reminderTime}
            setReminderTime={setReminderTime}
            reminderRepeat={reminderRepeat}
            setReminderRepeat={setReminderRepeat}
            reminderInterval={reminderInterval}
            setReminderInterval={setReminderInterval}
            editingProjectSubTasks={editingProjectSubTasks}
            setEditingProjectSubTasks={setEditingProjectSubTasks}
            handleSaveEditTask={handleSaveEditTask}
            handleAddNewTask={handleAddNewTask}
            newTaskDiceCategory={newTaskDiceCategory}
            setNewTaskDiceCategory={setNewTaskDiceCategory}
            isNeomorphic={isNeomorphic}
            isNeomorphicDark={isNeomorphicDark}
            theme={theme}
            isDark={isDark}
            textMain={textMain}
        />

        {/* Edit Item Modal */}
        {isEditItemOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                <div className={`w-full max-w-2xl p-4 sm:p-6 rounded-2xl sm:rounded-[48px] border bg-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] overflow-y-auto max-h-[90vh] transition-all duration-300 relative ${isNeomorphicDark ? '!bg-[#1e1e2e] !shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)]' : ''}`}>
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h3 className={`font-bold ${isNeomorphicDark ? 'text-white' : 'text-zinc-800'}`}>{editingItem.id ? '编辑商品' : '添加新商品'}</h3>
                        <button 
                            onClick={() => {
                                setIsEditItemOpen(false);
                            }}
                            className={`p-2 rounded-full transition-all ${isNeomorphic ? (isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.6),-5px_-5px_10px_rgba(30,30,46,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.5),-3px_-3px_6px_rgba(30,30,46,1)] active:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.6),inset_-5px_-5px_10px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]') : 'hover:bg-slate-100'}`}
                        >
                            <X size={16} className={`${isNeomorphicDark ? 'text-white' : 'text-zinc-800'}`} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-500">商品名称</label>
                            <input 
                                autoFocus 
                                value={editingItem.name} 
                                onChange={e => setEditingItem(prev => ({...prev, name: e.target.value}))} 
                                className={`w-full bg-transparent border-b py-2 outline-none ${isNeomorphicDark ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800'}`} 
                                placeholder="输入商品名称..." 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-500">商品描述</label>
                            <input 
                                value={editingItem.description} 
                                onChange={e => setEditingItem(prev => ({...prev, description: e.target.value}))} 
                                className={`w-full bg-transparent border-b py-2 outline-none ${isNeomorphicDark ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800'}`} 
                                placeholder="输入商品描述..." 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-500">商品价格 (元)</label>
                            <input 
                                type="number" 
                                value={editingItem.cost} 
                                onChange={e => setEditingItem(prev => ({...prev, cost: parseInt(e.target.value) || 0}))} 
                                className={`w-full bg-transparent border-b py-2 outline-none ${isNeomorphicDark ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800'}`} 
                                placeholder="输入商品价格..." 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-500">商品图片链接</label>
                            <input 
                                value={editingItem.image || ''} 
                                onChange={e => setEditingItem(prev => ({...prev, image: e.target.value}))} 
                                className={`w-full bg-transparent border-b py-2 outline-none ${isNeomorphicDark ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800'}`} 
                                placeholder="输入图片链接或本地路径..." 
                            />
                            <p className="text-[8px] text-zinc-500 mt-1">支持本地文件路径（如 /images/product.jpg）或在线图床链接</p>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button 
                                onClick={() => {
                                    setIsEditItemOpen(false);
                                }} 
                                className={`px-4 py-2 rounded-xl sm:rounded-[24px] transition-all font-medium ${isNeomorphic ? (isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.6),-5px_-5px_10px_rgba(30,30,46,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.5),-3px_-3px_6px_rgba(30,30,46,1)] active:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.6),inset_-5px_-5px_10px_rgba(30,30,46,0.8)] text-zinc-300' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)] text-zinc-800') : 'text-zinc-500 hover:text-white'}`}
                            >
                                取消
                            </button>
                            <button 
                                onClick={handleEditItemSave} 
                                className={`px-4 py-2 rounded-xl sm:rounded-[24px] transition-all font-medium ${isNeomorphic ? (isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.6),-5px_-5px_10px_rgba(30,30,46,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.5),-3px_-3px_6px_rgba(30,30,46,1)] active:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.6),inset_-5px_-5px_10px_rgba(30,30,46,0.8)] text-white' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)] text-white') : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                            >
                                确认保存
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        
    </div>
  );
};

export default LifeGame;