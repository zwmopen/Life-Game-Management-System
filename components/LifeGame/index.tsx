import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
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
import { Theme, AttributeType, AttributeTypeValue, Habit, Project, SubTask, TaskType, AutoTaskType, Task, DiceState, DiceTask, DiceCategory, DiceHistory, Settings as SettingsType, ProductType, ProductCategory } from '../../types';
import CharacterProfile, { CharacterProfileHandle } from '../CharacterProfile';
import { GlobalGuideCard, helpContent, GlobalHelpButton } from '../HelpSystem';
import FateGiftModal from '../shared/FateGiftModal';
import FateDice from '../FateDice';
import TaskManagement from '../TaskManagement';
import ShopCatalog from '../ShopCatalog';
import BankModal from '../shared/BankModal';
import MorningProtocolModal from '../shared/MorningProtocolModal';
import ReminderPopup from '../shared/ReminderPopup';
import TaskEditorModal from '../TaskManagement/TaskEditorModal';

// 导入主题上下文
import { useTheme } from '../../contexts/ThemeContext';

// 导入全局音频上下文
import { useGlobalAudio } from '../GlobalAudioManagerOptimized';

// 导入自定义 Hook
import { useReminders } from '../../hooks/useReminders';
import { useShop } from '../../hooks/useShop';
import { useTaskOperations } from '../../hooks/useTaskOperations';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';

// 导入常量文件
import SHOP_CATALOG from '../../constants/shopCatalog';
import { BLIND_BOX_PRICES, BLIND_BOX_RULES, HIDDEN_ITEM_PROBABILITY, getPriceRange, getHiddenItemPrice } from '../../constants/blindBox';
import { ATTR_COLORS, getNeomorphicStyles, getButtonStyle, getCardBgStyle, getTextStyle } from '../../utils/styleHelpers';

import BattleTab from './BattleTab';
import ShopTab from './ShopTab';
import ArmoryTab from './ArmoryTab';

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
  initialCategory?: 'daily' | 'main' | 'random';
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
}

const XP_PER_LEVEL = 200;

const LifeGame: React.FC<LifeGameProps> = memo(({ 
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
    onLevelChange
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'neomorphic-dark';
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
  const [isEditingSavings, setIsEditingSavings] = useState(false);
  const [tempSavings, setTempSavings] = useState(balance); 

  const characterProfileRef = useRef<CharacterProfileHandle>(null);

  const [mainTab, setMainTab] = useState<'battle' | 'shop' | 'armory'>(() => initialTab || 'battle');

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
    setChallengePool,
    projects,
    habits,
    todayStr,
    givenUpTasks
  });

  // 用于触发签到组件重新渲染的状态
  const [checkInUpdated, setCheckInUpdated] = useState(0);

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

  // 优化localStorage更新，减少不必要的写入
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('life-game-stats-v2', JSON.stringify({ level, xp, inventory, savings }));
    }, 100); // 防抖处理
    
    return () => clearTimeout(timer);
  }, [level, xp, inventory, savings]);

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

  // 使用useMemo优化任务排序和计算
  const { sortedHabits, habitTasks } = useMemo(() => {
    const sortedHabits = habitOrder.map(id => habits.find(h => h.id === id)).filter(h => h !== undefined) as Habit[];
    const habitTasks = sortedHabits.map(h => ({
        id: h.id, text: h.name, attr: h.attr || 'DIS', xp: h.xp || Math.ceil(h.reward * 1.5), gold: h.reward, duration: h.duration || 0,
        type: TaskType.DAILY, completed: !!h.history[todayStr], frequency: 'daily' as const, originalData: h,
        isGivenUp: givenUpTasks.includes(h.id)
    })).sort((a, b) => {
        if (a.isGivenUp && !b.isGivenUp) return 1;
        if (!a.isGivenUp && b.isGivenUp) return -1;
        return Number(a.completed) - Number(b.completed);
    });
    
    return { sortedHabits, habitTasks };
  }, [habitOrder, habits, todayStr, givenUpTasks]);

  // 使用useMemo优化项目任务排序和计算
  const projectTasks = useMemo(() => {
    const sortedProjects = projectOrder.map(id => projects.find(p => p.id === id)).filter(p => p !== undefined) as Project[];
    return sortedProjects.map(p => {
        // 主线任务奖励机制：与日常任务保持一致
        const baseRewardGold = 60; // 基础金币奖励
        const baseRewardXP = Math.ceil(baseRewardGold * 1.5); // 经验奖励与日常任务相同：金币*1.5
        
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
  }, [projectOrder, projects]);

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

  // 从App.tsx中提取的工具函数
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
        const completeSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3");
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
      const giveUpSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-interface-error-beep-221.mp3");
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

  return (
    <div className={`h-full flex flex-col overflow-hidden relative`}>
        
        {/* Reminder Popup */}
        <ReminderPopup
            activeReminder={activeReminder}
            onClose={() => setActiveReminder(null)}
            onStart={() => {
                setActiveReminder(null);
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
                onComplete={() => onDiceResult && onDiceResult('completed')}
                onLater={() => onDiceResult && onDiceResult('later')}
                onSkip={() => onDiceResult && onDiceResult('skipped')}
                onStartTimer={(duration) => {
                    onChangeDuration(duration);
                    onToggleTimer();
                    // 进入沉浸式模式
                    setIsImmersive(true);
                }}
                theme={theme}
            />
        )}

    {/* PURCHASE ANIMATION - Improved with centered popup */}
    {justPurchasedItem && (
        <>
            {/* Center Flash Effect */}
            <div className="fixed inset-0 z-[1001] flex items-center justify-center animate-in fade-in-zoom duration-500">
                <div className="text-8xl animate-[spin_0.5s_ease-in-out_infinite] drop-shadow-[0_0_30px_rgba(234,179,8,0.8)] opacity-100">
                    {justPurchasedItem.icon}
                </div>
            </div>
            {/* Centered Popup with neomorphic effect */}
            <div className="fixed inset-0 z-[1000] flex items-center justify-center animate-in fade-in duration-300">
                <div className={`p-6 flex items-center gap-4 rounded-2xl backdrop-blur-lg shadow-2xl max-w-md w-full mx-4 transition-all duration-300 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-[#1e1e2e] shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] border-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]') : isDark ? 'bg-zinc-900/95 border border-yellow-500/30 shadow-yellow-500/10' : 'bg-white/95 border border-slate-200 shadow-lg'}`}>
                    <div className={`text-4xl animate-[spin_1s_ease-in-out_infinite] ${isNeomorphic ? 'drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]'}`}>
                        {justPurchasedItem.icon}
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800'}`}>购买成功</h3>
                        <div className={`font-bold ${isDark ? 'text-yellow-400' : isNeomorphic ? 'text-yellow-600' : 'text-yellow-500'}`}>获得 {justPurchasedItem.name}</div>
                        <div className={`font-mono text-sm ${isDark ? 'text-red-500' : isNeomorphic ? 'text-red-600' : 'text-red-500'}`}>金币 - {justPurchasedItem.cost}G</div>
                        <div className={`font-mono text-sm ${isDark ? 'text-green-500' : isNeomorphic ? 'text-green-600' : 'text-green-500'}`}>当前剩余 {balance}G</div>
                    </div>
                </div>
            </div>
        </>
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
        <BattleTab 
          {...{
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
          }}
        />
      )}
      {mainTab === 'shop' && (
        <ShopTab 
          {...{
            balance, theme, isDark, isNeomorphic, cardBg, textMain, textSub
          }}
        />
      )}
      {mainTab === 'armory' && (
        <ArmoryTab 
          {...{
            balance, xp, totalHours, totalTasksCompleted, checkInStreak, 
            theme, isDark, isNeomorphic, cardBg, textMain, textSub, neomorphicStyles
          }}
        />
      )}
    </div>
  </div>
  );
});

LifeGame.displayName = 'LifeGame';

export default LifeGame;