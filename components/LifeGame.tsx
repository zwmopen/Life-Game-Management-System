import React, { useState, useEffect, useRef } from 'react';
import { 
  Coins, Trophy, ShoppingBag, CheckCircle, Swords, Flame, 
  Shield, Brain, BicepsFlexed, Sparkles, Users, Plus, X, Crown,
  Edit3, Trash2, Repeat, Zap, ChevronDown, ChevronUp, Mic, Loader2, PackagePlus,
  Gamepad2, Play, Pause, StopCircle, Clock, Archive, ArchiveRestore, Settings, Gift,
  Box, XCircle, Sunset, Moon, Coffee, Dumbbell, BookOpen, Calendar, Check, Target, Pencil,
  Radar as RadarIcon, Container, Filter, Wrench, User, Crosshair, TrendingUp, Lock, Unlock, Skull, ArrowLeft, GripVertical, Star, Package, List, RefreshCw, Dice5, Hammer, Edit2, Layout,
  HelpCircle, Smartphone, Laptop, Shirt, Ticket, Music, Wifi, Video, Square, CheckSquare,
  Headphones, Armchair, Scissors, Glasses, Footprints, Utensils, Sofa, Activity, Power, ChevronRight, Sun, Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Theme, AttributeType, Habit, Project, SubTask } from '../types';
import CharacterProfile, { CharacterProfileHandle } from './CharacterProfile';

interface LifeGameProps {
  theme: Theme;
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
  onStartAutoTask: (type: 'habit'|'project'|'random', id: string, duration: number, subId?: string) => void;
  checkInStreak: number;
  onPomodoroComplete: (m: number) => void;
  xp: number;
  weeklyGoal: string;
  setWeeklyGoal: (g: string) => void;
  todayGoal: string;
  setTodayGoal: (g: string) => void;
  givenUpTasks?: string[];
  onGiveUpTask?: (id: string) => void;
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
  // Additional props from previous code
  onUpdateHabitOrder?: (order: string[]) => void;
  onUpdateProjectOrder?: (order: string[]) => void;
}

const XP_PER_LEVEL = 200;

// Hardcoded colors for shop items
const SHOP_CATALOG = [
  // 数码产品
  { id: 'p_dig_1', name: 'iPhone 16 Pro', description: '顶级通讯终端', cost: 8999, type: 'physical', owned: false, icon: <Smartphone size={24} className="text-zinc-300"/>, category: '数码' },
  { id: 'p_dig_2', name: 'MacBook Pro M4', description: '生产力核心武器', cost: 16000, type: 'physical', owned: false, icon: <Laptop size={24} className="text-zinc-400"/>, category: '数码' },
  { id: 'p_dig_3', name: '降噪耳机', description: '主动降噪，物理结界', cost: 2000, type: 'physical', owned: false, icon: <Headphones size={24} className="text-blue-400"/>, category: '数码' },
  { id: 'p_dig_4', name: '智能手表', description: '健康监测，时间管理', cost: 2500, type: 'physical', owned: false, icon: <Clock size={24} className="text-green-500"/>, category: '数码' },
  { id: 'p_dig_5', name: '机械键盘', description: '输入体验升级', cost: 800, type: 'physical', owned: false, icon: <Layout size={24} className="text-purple-400"/>, category: '数码' },
  
  // 装备
  { id: 'p_gear_1', name: '人体工学椅', description: '脊椎防御系统', cost: 1500, type: 'physical', owned: false, icon: <Armchair size={24} className="text-orange-400"/>, category: '装备' },
  { id: 'p_gear_2', name: '乳胶枕头', description: '深度睡眠加速器', cost: 300, type: 'physical', owned: false, icon: <Sofa size={24} className="text-purple-400"/>, category: '装备' },
  { id: 'p_gear_3', name: '新战靴 (鞋子)', description: '行动力 +10%', cost: 800, type: 'physical', owned: false, icon: <Footprints size={24} className="text-yellow-600"/>, category: '装备' },
  { id: 'p_gear_4', name: '防蓝光眼镜', description: '护眼 Buff', cost: 400, type: 'physical', owned: false, icon: <Glasses size={24} className="text-cyan-400"/>, category: '装备' },
  { id: 'p_gear_5', name: '智能台灯', description: '护眼照明，专注模式', cost: 350, type: 'physical', owned: false, icon: <Sun size={24} className="text-yellow-500"/>, category: '装备' },
  { id: 'p_gear_6', name: '健身哑铃', description: '力量训练，肌肉增长', cost: 200, type: 'physical', owned: false, icon: <Dumbbell size={24} className="text-red-500"/>, category: '装备' },
  
  // 饮食
  { id: 's_food_1', name: '辣条一包', description: '廉价多巴胺 (慎用)', cost: 1, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-red-500"/>, category: '饮食' },
  { id: 's_food_2', name: '快乐水', description: '瞬间恢复心情', cost: 5, type: 'leisure', owned: false, icon: <Coffee size={24} className="text-amber-700"/>, category: '饮食' },
  { id: 's_food_3', name: '疯狂星期四', description: '高热量补给', cost: 68, type: 'leisure', owned: false, icon: <Gift size={24} className="text-yellow-500"/>, category: '饮食' },
  { id: 's_food_4', name: '健康沙拉', description: '轻食主义，健康饮食', cost: 28, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-green-500"/>, category: '饮食' },
  { id: 's_food_5', name: '下午茶套餐', description: '工作间隙，能量补充', cost: 38, type: 'leisure', owned: false, icon: <Coffee size={24} className="text-pink-500"/>, category: '饮食' },
  { id: 's_food_6', name: '买一瓶饮料', description: '解渴又提神', cost: 5, type: 'leisure', owned: false, icon: <Coffee size={24} className="text-blue-500"/>, category: '饮食' },
  
  // 娱乐
  { id: 's_ent_1', name: '看小说半小时', description: '沉浸式阅读体验', cost: 30, type: 'leisure', owned: false, icon: <BookOpen size={24} className="text-purple-500"/>, category: '娱乐' },
  { id: 's_ent_2', name: '刷短视频30分钟', description: '短平快的娱乐方式', cost: 30, type: 'leisure', owned: false, icon: <Video size={24} className="text-red-500"/>, category: '娱乐' },
  { id: 's_ent_3', name: '看小说一小时', description: '长时间沉浸式阅读', cost: 60, type: 'leisure', owned: false, icon: <BookOpen size={24} className="text-purple-600"/>, category: '娱乐' },
  { id: 's_ent_4', name: '刷短视频60分钟', description: '长时间刷短视频', cost: 60, type: 'leisure', owned: false, icon: <Video size={24} className="text-red-600"/>, category: '娱乐' },
  
  // 服务
  { id: 's_hair_1', name: '理发 (形象重置)', description: '魅力值回升', cost: 48, type: 'leisure', owned: false, icon: <Scissors size={24} className="text-pink-400"/>, category: '服务' },
  { id: 's_spa_1', name: '按摩放松', description: '缓解疲劳，恢复精力', cost: 198, type: 'leisure', owned: false, icon: <Armchair size={24} className="text-blue-400"/>, category: '服务' },
  { id: 's_books_1', name: '书籍购买', description: '知识获取，思维升级', cost: 98, type: 'leisure', owned: false, icon: <BookOpen size={24} className="text-amber-600"/>, category: '服务' },
  
  // 票务
  { id: 'r_tick_1', name: '旅游车票 x1', description: '探索新地图', cost: 298, type: 'rights', owned: false, icon: <Ticket size={24} className="text-green-500"/>, category: '票务' },
  { id: 'r_tick_2', name: '电影票', description: '娱乐放松，情感共鸣', cost: 45, type: 'rights', owned: false, icon: <Video size={24} className="text-red-600"/>, category: '票务' },
  { id: 'r_tick_3', name: '演唱会门票', description: '音乐盛宴，情感释放', cost: 498, type: 'rights', owned: false, icon: <Music size={24} className="text-purple-600"/>, category: '票务' },
  
  // 会员
  { id: 'r_vip_1', name: '网易云 VIP (月)', description: '听觉享受', cost: 15, type: 'rights', owned: false, icon: <Music size={24} className="text-red-600"/>, category: '会员' },
  { id: 'r_vip_2', name: 'Netflix (月)', description: '影视娱乐', cost: 78, type: 'rights', owned: false, icon: <Video size={24} className="text-red-500"/>, category: '会员' },
  { id: 'r_vip_3', name: '健身会员 (月)', description: '健身特权，健康生活', cost: 298, type: 'rights', owned: false, icon: <Dumbbell size={24} className="text-blue-500"/>, category: '会员' },
  
  // 充值
  { id: 'r_char_1', name: '话费充值卡', description: '通讯保障', cost: 99, type: 'rights', owned: false, icon: <Wifi size={24} className="text-blue-500"/>, category: '充值' },
  { id: 'r_char_2', name: '游戏点卡', description: '虚拟世界，娱乐放松', cost: 49, type: 'rights', owned: false, icon: <Gamepad2 size={24} className="text-green-500"/>, category: '充值' },
  { id: 'r_char_3', name: '云存储空间', description: '数据安全，便捷访问', cost: 118, type: 'rights', owned: false, icon: <Box size={24} className="text-purple-500"/>, category: '充值' },
  

];



const ATTR_COLORS: Record<AttributeType | string, string> = {
    STR: 'text-red-500 border-red-500/30 shadow-red-500/10',
    INT: 'text-blue-500 border-blue-500/30 shadow-blue-500/10',
    DIS: 'text-zinc-400 border-zinc-500/30 shadow-zinc-500/10',
    CRE: 'text-purple-500 border-purple-500/30 shadow-purple-500/10',
    SOC: 'text-pink-500 border-pink-500/30 shadow-pink-500/10',
    WEA: 'text-yellow-500 border-yellow-500/30 shadow-yellow-500/10',
};

const LifeGame: React.FC<LifeGameProps> = ({ 
    theme, balance, onUpdateBalance, habits, projects, habitOrder, projectOrder, onToggleHabit, onUpdateHabit, onDeleteHabit, onUpdateProject, onDeleteProject, onAddHabit, onAddProject, initialTab, initialCategory, onAddFloatingReward, totalTasksCompleted, totalHours,
    challengePool, setChallengePool, todaysChallenges, completedRandomTasks, onToggleRandomChallenge, onStartAutoTask, checkInStreak, onPomodoroComplete, xp, weeklyGoal, setWeeklyGoal, todayGoal, setTodayGoal,
    givenUpTasks = [], onGiveUpTask, onUpdateHabitOrder, onUpdateProjectOrder, isNavCollapsed, setIsNavCollapsed,
    // Pomodoro Global State
    timeLeft, isActive, duration, onToggleTimer, onResetTimer, onChangeDuration, onUpdateTimeLeft, onUpdateIsActive
}) => {
  const isDark = theme === 'dark';
  const isNeomorphic = theme === 'neomorphic';
  const todayStr = new Date().toLocaleDateString();
  const textMain = isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';
  const textSub = isDark ? 'text-zinc-400' : isNeomorphic ? 'text-zinc-600' : 'text-slate-500';
  
  // 增强拟态风格卡片背景
  const cardBg = isNeomorphic 
      ? 'bg-zinc-200 border-zinc-300 rounded-2xl shadow-[15px_15px_30px_rgba(0,0,0,0.1),-15px_-15px_30px_rgba(255,255,255,0.8)] hover:shadow-[20px_20px_40px_rgba(0,0,0,0.15),-20px_-20px_40px_rgba(255,255,255,0.9)] transition-all duration-300 active:shadow-[inset_8px_8px_16px_rgba(0,0,0,0.15),inset_-8px_-8px_16px_rgba(255,255,255,0.8)]' 
      : isDark 
      ? 'bg-zinc-900 border-zinc-800 shadow-[inset_-15px_-15px_30px_rgba(255,255,255,0.05),inset_15px_15px_30px_rgba(0,0,0,0.3)]' 
      : 'bg-white border-slate-200 shadow-[inset_-15px_-15px_30px_rgba(255,255,255,0.8),inset_15px_15px_30px_rgba(0,0,0,0.1)]';
  
  const [level, setLevel] = useState(1);
  const [savings, setSavings] = useState(0); 
  const [inventory, setInventory] = useState<any[]>(SHOP_CATALOG);
  const [isManageShopMode, setIsManageShopMode] = useState(false);
  
  const characterProfileRef = useRef<CharacterProfileHandle>(null);

  const [mainTab, setMainTab] = useState<'battle' | 'shop' | 'armory'>(initialTab || 'battle');
  const [taskCategory, setTaskCategory] = useState<'daily' | 'main' | 'random'>(initialCategory || 'daily');
  const [shopFilter, setShopFilter] = useState<'all' | 'physical' | 'rights' | 'leisure'>('all');

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('15');
  const [newTaskXP, setNewTaskXP] = useState('20');
  const [newTaskDuration, setNewTaskDuration] = useState('30');
  const [newTaskType, setNewTaskType] = useState<'daily' | 'main' | 'random'>('daily');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingProjectSubTasks, setEditingProjectSubTasks] = useState<SubTask[]>([]);

  const [isManageTasksOpen, setIsManageTasksOpen] = useState(false);
  const [manageTaskTab, setManageTaskTab] = useState<'daily' | 'main' | 'random'>('daily');
  const [newChallengeText, setNewChallengeText] = useState('');
  
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [draggedShopIndex, setDraggedShopIndex] = useState<number | null>(null);

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingTodayGoal, setIsEditingTodayGoal] = useState(false);

  const [activeHelp, setActiveHelp] = useState<string | null>(null);

  // New State for Purchase Animation
  const [justPurchasedItem, setJustPurchasedItem] = useState<any | null>(null);

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



  const handleProtocolComplete = () => {
      onUpdateBalance(50, `晨间协议完成 (Ready: ${readiness}%)`);
      setTodayGoal(protocolFocus); 
      setShowProtocol(false);
      setProtocolStep(0);
      setProtocolFocus('');
      onAddFloatingReward("今日战役目标已锁定", "text-red-500");
  };

  // 拖拽状态管理
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null);

  // 拖拽开始
  const handleDragStart = (task: any, index: number) => {
      setDraggedTask(task);
      setDraggedTaskIndex(index);
  };

  // 拖拽结束
  const handleDragEnd = () => {
      setDraggedTask(null);
      setDraggedTaskIndex(null);
  };

  // 拖拽悬停
  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      if (draggedTaskIndex === null || draggedTaskIndex === targetIndex || !draggedTask) return;
      
      if (draggedTask.type === 'daily' && onUpdateHabitOrder) {
          // 更新习惯任务排序
          const newOrder = [...habitOrder];
          const [draggedId] = newOrder.splice(draggedTaskIndex, 1);
          newOrder.splice(targetIndex, 0, draggedId);
          onUpdateHabitOrder(newOrder);
          setDraggedTaskIndex(targetIndex);
      } else if (draggedTask.type === 'main' && onUpdateProjectOrder) {
          // 更新主线任务排序
          const newOrder = [...projectOrder];
          const [draggedId] = newOrder.splice(draggedTaskIndex, 1);
          newOrder.splice(targetIndex, 0, draggedId);
          onUpdateProjectOrder(newOrder);
          setDraggedTaskIndex(targetIndex);
      }
  };

  // 按照habitOrder排序习惯任务
  const sortedHabits = habitOrder.map(id => habits.find(h => h.id === id)).filter(h => h !== undefined) as Habit[];
  const habitTasks = sortedHabits.map(h => ({
      id: h.id, text: h.name, attr: h.attr || 'DIS', xp: h.xp || Math.ceil(h.reward * 1.5), gold: h.reward, duration: h.duration || 0,
      type: 'daily' as const, completed: !!h.history[todayStr], frequency: 'daily' as const, originalData: h,
      isGivenUp: givenUpTasks.includes(h.id)
  })).sort((a, b) => {
      if (a.isGivenUp && !b.isGivenUp) return 1;
      if (!a.isGivenUp && b.isGivenUp) return -1;
      return Number(a.completed) - Number(b.completed);
  });

  // 按照projectOrder排序项目任务
  const sortedProjects = projectOrder.map(id => projects.find(p => p.id === id)).filter(p => p !== undefined) as Project[];
  const projectTasks = sortedProjects.map(p => {
      // 计算主线任务的总奖励和总时长
      const totalRewardXP = 60;
      const totalRewardGold = 60;
      const totalDuration = p.subTasks.reduce((sum, st) => sum + st.duration, 60);
      
      // 计算每个子任务的平均奖励
      const subTaskCount = Math.max(p.subTasks.length, 1);
      const avgXP = Math.ceil(totalRewardXP / subTaskCount);
      const avgGold = Math.ceil(totalRewardGold / subTaskCount);
      
      return {
          id: p.id, text: p.name, attr: p.attr || 'WEA', xp: totalRewardXP, gold: totalRewardGold, type: 'main' as const,
          completed: p.status === 'completed', frequency: 'once' as const, isExpanded: false,
          originalData: p,
          subTasks: p.subTasks.map(st => ({
              id: st.id, text: st.title, completed: st.completed, 
              xp: avgXP, // 均分主线任务的经验奖励
              gold: avgGold, // 均分主线任务的金币奖励
              duration: st.duration || 30 // 子任务自己的时长，默认30分钟
          }))
      };
  }).sort((a, b) => Number(a.completed) - Number(b.completed));

  useEffect(() => {
    const saved = localStorage.getItem('life-game-stats-v2'); 
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setLevel(data.level || 1);
        setSavings(data.savings || 0);
        
        const savedInv = data.inventory || [];
        const savedMap = new Map<string, any>(savedInv.map((i: any) => [i.id, i]));
        
        let mergedInv = SHOP_CATALOG.map(catItem => {
            const savedItem = savedMap.get(catItem.id);
            if (savedItem) {
                return { 
                    ...catItem, 
                    owned: savedItem.owned, 
                    purchaseCount: savedItem.purchaseCount || 0,
                    lastPurchased: savedItem.lastPurchased || 0
                };
            }
            return catItem;
        });
        const catalogIds = new Set(SHOP_CATALOG.map(i => i.id));
        const customItems = savedInv.filter((i: any) => !catalogIds.has(i.id));
        mergedInv = [...mergedInv, ...customItems];

        setInventory(mergedInv);
      } catch (e) { console.error("Save file corrupted", e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('life-game-stats-v2', JSON.stringify({ level, xp, inventory, savings }));
  }, [level, xp, inventory, savings]);

  const handlePurchase = (item: any, e: React.MouseEvent) => {
      e.stopPropagation();
      if (isManageShopMode) return; 

      if (balance < item.cost) {
          onAddFloatingReward("资金不足", "text-red-500", e.clientX, e.clientY);
          return;
      }
      
      onUpdateBalance(-item.cost, `购买: ${item.name}`);
      
      // 播放购买音效
      const purchaseSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3");
      purchaseSound.volume = 0.5;
      purchaseSound.play().catch(()=>{});
      
      // 触发烟花效果
      confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
      });
      
      setInventory(prev => prev.map(i => {
          if (i.id === item.id) {
              return { 
                  ...i, 
                  owned: i.type === 'physical' ? true : i.owned, 
                  purchaseCount: (i.purchaseCount || 0) + 1,
                  lastPurchased: Date.now() 
              };
          }
          return i;
      }));

      // Trigger Visual - Changed from 3D rotation to simple scale animation
      setJustPurchasedItem(item);
      setTimeout(() => setJustPurchasedItem(null), 1500);
  };

  const handleStartTimer = (duration: number) => {
      if (characterProfileRef.current) {
          characterProfileRef.current.startTimer(duration);
          onAddFloatingReward(`番茄钟: ${duration}min`, "text-emerald-500");
      } else {
          console.error("Timer ref not attached");
      }
  };

  const completeTask = (task: any, e: React.MouseEvent | null) => {
      if (task.isGivenUp) return; 
      if (task.type === 'daily') {
          onToggleHabit(task.id, todayStr);
          // 所有弹窗由 App.tsx 中的 handleToggleHabit 函数统一处理，避免重复
      }
  };

  const giveUpTask = (taskId: string, e: React.MouseEvent) => {
      e.stopPropagation(); 
      if (onGiveUpTask) onGiveUpTask(taskId);
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
          new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3").play().catch(()=>{});
      }
  };

  const deleteSubTask = (projectId: string, subTaskId: string) => {
      if (window.confirm("确定删除此子任务？")) {
          const project = projects.find(p => p.id === projectId);
          if (!project) return;
          const newSubTasks = project.subTasks.filter(t => t.id !== subTaskId);
          onUpdateProject(projectId, { subTasks: newSubTasks });
      }
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm("确定要下架此商品吗？")) {
          setInventory(prev => prev.filter(i => i.id !== id));
      }
  };

  const handleEditItemSave = () => {
      if (editingItem) {
          if (inventory.find(i => i.id === editingItem.id)) {
              setInventory(prev => prev.map(i => i.id === editingItem.id ? editingItem : i));
          } else {
              setInventory(prev => [...prev, editingItem]);
          }
      }
      setIsEditItemOpen(false);
      setEditingItem(null);
  };

  const handleAddNewItem = () => {
      setEditingItem({
          id: Date.now().toString(),
          name: '',
          description: '',
          cost: 50,
          type: 'leisure',
          icon: <Box size={24}/>,
          purchaseCount: 0,
          lastPurchased: 0
      });
      setIsEditItemOpen(true);
  };

  const handleShopDragStart = (index: number) => {
      if (!isManageShopMode) return;
      setDraggedShopIndex(index);
  };

  const handleShopDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (!isManageShopMode || draggedShopIndex === null || draggedShopIndex === index) return;

      const newInventory = [...inventory];
      const draggedItem = newInventory[draggedShopIndex];
      newInventory.splice(draggedShopIndex, 1);
      newInventory.splice(index, 0, draggedItem);
      
      setInventory(newInventory);
      setDraggedShopIndex(index);
  };

  const openEditTask = (task: any) => {
      setEditingTaskId(task.id);
      setNewTaskTitle(task.text);
      setNewTaskReward(task.gold.toString());
      setNewTaskXP((task.xp || 20).toString());
      setNewTaskDuration((task.duration || 30).toString());
      setNewTaskType(task.type);
      if (task.type === 'main') {
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
          setNewTaskType('random');
          setEditingProjectSubTasks([]);
          setIsAddTaskOpen(true);
      }
  };

  const handleSaveEditTask = () => {
      if (newTaskType === 'daily') {
          onUpdateHabit(editingTaskId!, { 
              name: newTaskTitle, 
              reward: parseInt(newTaskReward),
              xp: parseInt(newTaskXP),
              duration: parseInt(newTaskDuration)
          });
      } else if (newTaskType === 'main') {
          onUpdateProject(editingTaskId!, { name: newTaskTitle, subTasks: editingProjectSubTasks });
      } else if (newTaskType === 'random' && editingTaskId?.startsWith('random-')) {
          // 处理随机任务编辑
          const originalTaskStr = editingTaskId.replace('random-', '');
          const newTask = {
              text: newTaskTitle,
              gold: parseInt(newTaskReward) || 20,
              xp: parseInt(newTaskXP) || 30,
              duration: parseInt(newTaskDuration) || 20
          };
          
          // 更新挑战池
          setChallengePool(prevPool => {
              return prevPool.map(task => {
                  if (task === originalTaskStr) {
                      return JSON.stringify(newTask);
                  }
                  return task;
              });
          });
      }
      setIsAddTaskOpen(false);
      setEditingTaskId(null);
  };

  const handleAddNewTask = () => {
      if (!newTaskTitle.trim()) return;
      if (newTaskType === 'daily') {
          onAddHabit(newTaskTitle, parseInt(newTaskReward) || 15);
      } else if (newTaskType === 'main') {
          onAddProject({
              id: Date.now().toString(), name: newTaskTitle, startDate: new Date().toISOString().split('T')[0],
              description: '核心战略目标', status: 'active', logs: [], dailyFocus: {}, subTasks: editingProjectSubTasks, fears: [], todayFocusMinutes: 0, attr: 'WEA'
          });
      } else if (newTaskType === 'random') {
          // 添加完整的随机任务，包含奖励信息
          const newTask = {
              text: newTaskTitle,
              gold: parseInt(newTaskReward) || 20,
              xp: parseInt(newTaskXP) || 30,
              duration: parseInt(newTaskDuration) || 20
          };
          setChallengePool([...challengePool, JSON.stringify(newTask)]);
          onAddFloatingReward("挑战已入库", "text-purple-500");
      }
      setIsAddTaskOpen(false);
      setNewTaskTitle('');
      setEditingProjectSubTasks([]);
  };

  const filteredInventory = inventory.filter(i => (shopFilter === 'all' || i.type === shopFilter));
  const sortedInventory = [...filteredInventory].sort((a, b) => {
      const timeA = a.lastPurchased || 0;
      const timeB = b.lastPurchased || 0;
      if (timeA !== timeB) return timeB - timeA;
      return a.cost - b.cost;
  });

  return (
    <div className={`h-full flex flex-col overflow-hidden relative ${isDark ? 'bg-zinc-950' : 'bg-slate-50'}`}>
        
        {/* PURCHASE ANIMATION - Improved with center flash */}
        {justPurchasedItem && (
            <>
                {/* Center Flash Effect */}
                <div className="fixed inset-0 z-[1001] flex items-center justify-center animate-in fade-in-zoom duration-500">
                    <div className="text-8xl animate-[spin_0.5s_ease-in-out_infinite] drop-shadow-[0_0_30px_rgba(234,179,8,0.8)] opacity-100">
                        {justPurchasedItem.icon}
                    </div>
                </div>
                {/* Bottom Popup */}
                <div className="fixed bottom-6 right-6 z-[1000] bg-zinc-900/95 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-4 backdrop-blur-lg shadow-2xl shadow-yellow-500/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="text-4xl animate-[spin_1s_ease-in-out_infinite] drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                        {justPurchasedItem.icon}
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-bold text-white">已获取物资</h3>
                        <div className="text-yellow-400 font-bold">{justPurchasedItem.name}</div>
                        <div className="text-red-500 font-mono text-sm">¥-{justPurchasedItem.cost}</div>
                    </div>
                </div>
                {/* Purchase Success Text */}
                <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[1002] animate-in fade-in-zoom duration-700">
                    <div className="bg-black/80 backdrop-blur-lg px-8 py-4 rounded-full border border-yellow-500/50 shadow-2xl shadow-yellow-500/20">
                        <h2 className="text-xl font-bold text-yellow-400 animate-pulse">恭喜你购买 {justPurchasedItem.name}！</h2>
                    </div>
                </div>
            </>
        )}

        {/* Morning Protocol Modal code... */}
        {showProtocol && (
            <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                {/* ... existing protocol modal content ... */}
                <div className="max-w-lg w-full bg-zinc-900 border border-emerald-900/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
                    {protocolStep === 0 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8">
                            <div className="flex items-center gap-3 mb-4"><Zap size={32} className="text-emerald-500"/><h2 className="text-2xl font-black text-white">机能自检 (BIO-SCAN)</h2></div>
                            <p className="text-zinc-400 text-sm">评估你的睡眠质量与当前能量水平。诚实的数据是进化的基础。</p>
                            <div className="space-y-4 pt-4"><div className="flex justify-between text-xs font-bold text-emerald-400 uppercase"><span>低能耗 (Low)</span><span>{readiness}%</span><span>巅峰 (Peak)</span></div><input type="range" min="0" max="100" value={readiness} onChange={(e) => setReadiness(parseInt(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"/></div>
                            <button onClick={() => setProtocolStep(1)} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl mt-4 flex items-center justify-center gap-2 transition-all">确认机能状态 <ChevronRight size={16}/></button>
                        </div>
                    )}
                    {protocolStep === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8">
                            <div className="flex items-center gap-3 mb-4"><Crosshair size={32} className="text-red-500"/><h2 className="text-2xl font-black text-white">战术聚焦 (LASER FOCUS)</h2></div>
                            <p className="text-zinc-400 text-sm">如果今天只能完成一件事，那会是什么？这定义了你今天的成败。</p>
                            <input autoFocus value={protocolFocus} onChange={e => setProtocolFocus(e.target.value)} placeholder="输入今日绝对核心任务..." className="w-full bg-zinc-950 border border-zinc-700 p-4 rounded-xl text-lg font-bold text-white outline-none focus:border-red-500 transition-colors" onKeyDown={e => e.key === 'Enter' && setProtocolStep(2)}/>
                            <button onClick={() => setProtocolStep(2)} disabled={!protocolFocus.trim()} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-bold rounded-xl mt-4 flex items-center justify-center gap-2 transition-all">锁定目标 <ChevronRight size={16}/></button>
                        </div>
                    )}
                    {protocolStep === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 text-center">
                            <div className="flex flex-col items-center gap-4 mb-4"><Activity size={64} className="text-blue-500 animate-pulse"/><h2 className="text-2xl font-black text-white uppercase tracking-widest">身份确认</h2></div>
                            <div className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-800 italic text-zinc-300">"我不仅仅是这副躯壳。我是我的选择，我是我的行动。今天，我拒绝熵增，我选择主动进化。"</div>
                            <button onClick={handleProtocolComplete} className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-lg rounded-xl shadow-lg shadow-blue-900/50 transform transition-all active:scale-95">启动系统 (INITIATE)</button>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* 虚拟银行模态框 */}
        {showBankModal && (
            <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="max-w-lg w-full bg-zinc-900 border border-green-900/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-yellow-500"></div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            <Wallet className="text-green-500" size={32} />
                            虚拟银行账户
                        </h2>
                        <button onClick={() => setShowBankModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                            <XCircle size={24} />
                        </button>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={`p-6 rounded-xl border ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'}`}>
                                <div className="text-sm text-zinc-500 uppercase font-bold mb-2">当前存款</div>
                                <div className="text-4xl font-black text-yellow-500">{bankAccount.balance} G</div>
                                <div className="text-xs text-zinc-500 mt-1">每天获得 1% 利息</div>
                            </div>
                            <div className={`p-6 rounded-xl border ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'}`}>
                                <div className="text-sm text-zinc-500 uppercase font-bold mb-2">总获利息</div>
                                <div className="text-4xl font-black text-green-500">{bankAccount.totalInterestEarned} G</div>
                                <div className="text-xs text-zinc-500 mt-1">累计获得的利息</div>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-zinc-500">上次利息发放日期</div>
                                <div className="text-sm font-mono text-zinc-300">{bankAccount.lastInterestDate}</div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-zinc-500">今日预计利息</div>
                                <div className="text-sm font-mono text-green-500">{Math.floor(bankAccount.balance * 0.01)} G</div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => {
                                    if (bankAccount.balance > 0) {
                                        // 取出全部存款
                                        onUpdateBalance(bankAccount.balance, '取出全部存款');
                                        const newBankAccount = {
                                            ...bankAccount,
                                            balance: 0
                                        };
                                        setBankAccount(newBankAccount);
                                        localStorage.setItem('life-game-bank', JSON.stringify(newBankAccount));
                                        setShowBankModal(false);
                                    }
                                }}
                                className={`w-full py-4 rounded-lg transition-colors ${bankAccount.balance > 0 ? (isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-800/50' : 'bg-green-100 text-green-700 hover:bg-green-200') : (isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-200 text-slate-500')}`} 
                                disabled={bankAccount.balance <= 0}
                            >
                                取出全部存款
                            </button>
                            <button 
                                onClick={() => setShowBankModal(false)}
                                className={`w-full py-4 rounded-lg transition-colors ${isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                            >
                                关闭
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <CharacterProfile ref={characterProfileRef} theme={theme} xp={xp} balance={balance} totalHours={totalHours} totalKills={totalTasksCompleted} checkInStreak={checkInStreak} onPomodoroComplete={onPomodoroComplete} onUpdateBalance={onUpdateBalance} 
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

        <div className="flex-1 overflow-y-auto p-4 md:p-6 relative custom-scrollbar">
            {mainTab === 'battle' && (
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`rounded-lg border p-4 flex flex-col gap-2 transition-all duration-300 ${cardBg} border-purple-500/20 hover:shadow-lg`}>
                            <div className="flex justify-between items-center mb-1"><div className="text-[10px] text-purple-500 uppercase tracking-widest font-bold flex items-center gap-1"><Target size={12}/> 本周核心战役</div><button onClick={() => setIsEditingGoal(!isEditingGoal)} className="text-zinc-500 hover:text-blue-500 transition-colors"><Edit2 size={12}/></button></div>
                            {isEditingGoal ? (<input autoFocus className={`w-full bg-transparent border-b outline-none text-sm font-bold ${textMain} ${isDark ? 'border-zinc-600' : 'border-slate-300'}`} value={weeklyGoal} onChange={e => setWeeklyGoal(e.target.value)} onBlur={() => setIsEditingGoal(false)} onKeyDown={e => e.key === 'Enter' && setIsEditingGoal(false)}/>) : (<div className={`text-sm font-bold ${textMain} truncate cursor-pointer`} onClick={() => setIsEditingGoal(true)}>{weeklyGoal}</div>)}
                        </div>
                        <div className={`rounded-lg border p-4 flex flex-col gap-2 transition-all duration-300 ${cardBg} border-red-500/20 relative group hover:shadow-lg`}>
                            <div className="flex justify-between items-center mb-1"><div className="text-[10px] text-red-500 uppercase tracking-widest font-bold flex items-center gap-1"><Crosshair size={12}/> 今日核心战役</div><div className="flex gap-2"><button onClick={() => setIsEditingTodayGoal(!isEditingTodayGoal)} className="text-zinc-500 hover:text-blue-500 transition-colors"><Edit2 size={12}/></button><button onClick={() => { setShowProtocol(true); setProtocolStep(0); }} className="text-[10px] bg-red-900/20 text-red-400 border border-red-900/50 px-2 py-0.5 rounded hover:bg-red-900/40 flex items-center gap-1 transition-all" title="启动晨间协议重置目标"><Power size={10}/> 启动协议</button></div></div>
                            {isEditingTodayGoal ? (<input autoFocus className={`w-full bg-transparent border-b outline-none text-sm font-bold ${textMain} ${isDark ? 'border-zinc-600' : 'border-slate-300'}`} value={todayGoal} onChange={e => setTodayGoal(e.target.value)} onBlur={() => setIsEditingTodayGoal(false)} onKeyDown={e => e.key === 'Enter' && setIsEditingTodayGoal(false)}/>) : (<div className={`text-sm font-bold ${textMain} truncate cursor-pointer ${!todayGoal && 'text-zinc-500 italic'}`} onClick={() => setIsEditingTodayGoal(true)}>{todayGoal || "点击或启动协议设定目标..."}</div>)}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex gap-2">
                            <button onClick={() => setTaskCategory('daily')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all duration-300 ${taskCategory === 'daily' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/50' : (isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700' : 'bg-white border-slate-300 text-slate-500 hover:border-slate-200')}`}>日常任务</button>
                            <button onClick={() => setTaskCategory('main')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all duration-300 ${taskCategory === 'main' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/50' : (isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700' : 'bg-white border-slate-300 text-slate-500 hover:border-slate-200')}`}>主线任务</button>
                            <button onClick={() => setTaskCategory('random')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all duration-300 ${taskCategory === 'random' ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-900/50' : (isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700' : 'bg-white border-slate-300 text-slate-500 hover:border-slate-200')}`}>随机任务</button>
                        </div>
                        <div className="flex gap-2 items-center">
                            <button onClick={() => setActiveHelp('tasks')} className="text-zinc-500 hover:text-white transition-colors"><HelpCircle size={16}/></button>
                            <button onClick={() => setIsManageTasksOpen(true)} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-200'}`}><List size={14}/> 管理</button>
                            <button onClick={() => setMainTab('shop')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700' : 'bg-white border-slate-300 text-slate-500 hover:border-slate-200'}`}> <ShoppingBag size={14}/> 黑市</button>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {taskCategory === 'daily' && habitTasks.map((task, index) => (
                            <div 
                                key={task.id} 
                                draggable 
                                onDragStart={() => handleDragStart(task, index)} 
                                onDragEnd={handleDragEnd} 
                                onDragOver={(e) => handleDragOver(e, index)} 
                                onDoubleClick={() => openEditTask(task)} 
                                className={`relative group rounded-lg border transition-all overflow-hidden ${task.completed ? 'opacity-50 grayscale ' + (isDark ? 'bg-zinc-950/50' : 'bg-slate-100') : task.isGivenUp ? 'opacity-70 ' + (isDark ? 'bg-red-950/10 border-red-900/30' : 'bg-red-50 border-red-200') : ''} ${cardBg} ${!task.completed && !task.isGivenUp ? 'hover:border-blue-500/50 hover:shadow-lg' : (isDark ? 'border-zinc-800' : 'border-slate-200')} ${draggedTask && draggedTask.id === task.id ? 'opacity-50 scale-95' : ''}`}
                            >
                                <div className="p-4 flex items-center gap-4">
                                    <div className="text-zinc-600 cursor-grab active:cursor-grabbing"><GripVertical size={14}/></div>
                                    <button onClick={(e) => { e.stopPropagation(); completeTask(task, e); }} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : task.isGivenUp ? 'border-red-900 text-red-900 cursor-not-allowed' : (isDark ? 'border-zinc-600 hover:border-emerald-500 text-transparent' : 'border-slate-300 hover:border-emerald-500 bg-white')}`} disabled={task.isGivenUp}>
                                        {task.completed && <Check size={16} strokeWidth={4} />}
                                        {task.isGivenUp && <X size={16} strokeWidth={4} />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] font-bold px-1.5 rounded border ${ATTR_COLORS[task.attr].replace('shadow-', '')} bg-opacity-10`}>
                                                {task.attr === 'STR' ? '力量' : task.attr === 'INT' ? '智力' : task.attr === 'DIS' ? '自律' : task.attr === 'CRE' ? '创造' : task.attr === 'SOC' ? '社交' : '财富'}
                                            </span>
                                            <h3 className={`font-bold ${task.completed || task.isGivenUp ? 'line-through text-zinc-500' : textMain}`}>
                                                {task.text}
                                                {task.isGivenUp && <span className="ml-2 text-[9px] text-red-500 border border-red-900 bg-red-900/20 px-1 rounded font-bold">已放弃</span>}
                                            </h3>
                                            <button onClick={() => openEditTask(task)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-blue-500 transition-opacity ml-2"><Edit3 size={12}/></button>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-mono text-zinc-500"><span className="text-purple-400">经验 +{task.xp}</span><span className="text-yellow-500">金币 +{task.gold}</span><span className="text-blue-500">消耗时长 {task.duration || 25} 分钟</span></div>
                                    </div>
                                    {!task.completed && !task.isGivenUp && (
                                        <button onClick={(e) => giveUpTask(task.id, e)} className="text-zinc-600 hover:text-red-500 p-2 rounded hover:bg-red-900/10 transition-colors" title="放弃任务 (无奖励)">
                                            <X size={20} />
                                        </button>
                                    )}
                                    <button onClick={() => handleStartTimer(task.duration || 25)} disabled={task.completed || task.isGivenUp} className={`p-3 rounded-full text-white transition-colors group-hover:scale-110 shadow-lg ${isDark ? 'bg-zinc-800 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'} disabled:opacity-50 disabled:scale-100`}>
                                        <Play size={16} fill="currentColor"/>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {taskCategory === 'main' && projectTasks.map((task, index) => (
                            <div 
                                key={task.id} 
                                draggable 
                                onDragStart={() => handleDragStart(task, index)} 
                                onDragEnd={handleDragEnd} 
                                onDragOver={(e) => handleDragOver(e, index)} 
                                onDoubleClick={() => openEditTask(task)} 
                                className={`relative group rounded-lg border transition-all overflow-hidden ${task.completed ? 'opacity-50 grayscale ' + (isDark ? 'bg-zinc-950/50' : 'bg-slate-100') : ''} ${cardBg} ${!task.completed ? 'hover:border-red-500/50 hover:shadow-lg' : (isDark ? 'border-zinc-800' : 'border-slate-200')} ${draggedTask && draggedTask.id === task.id ? 'opacity-50 scale-95' : ''}`}
                            >
                                <div className="p-4 flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <button className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : (isDark ? 'border-zinc-600 cursor-default' : 'border-slate-300 bg-white')}`}>{task.completed && <Check size={16} strokeWidth={4} />}</button>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold px-1.5 rounded border ${ATTR_COLORS[task.attr].replace('shadow-', '')} bg-opacity-10`}>
                                                    {task.attr === 'STR' ? '力量' : task.attr === 'INT' ? '智力' : task.attr === 'DIS' ? '自律' : task.attr === 'CRE' ? '创造' : task.attr === 'SOC' ? '社交' : '财富'}
                                                </span>
                                                <h3 className={`font-bold ${task.completed ? 'line-through text-zinc-500' : textMain}`}>{task.text}</h3>
                                                <button onClick={() => openEditTask(task)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-blue-500 transition-opacity ml-1"><Edit3 size={12}/></button>
                                            </div>
                                            {/* 显示主任务的经验、金币和消耗时长 */}
                                            <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                                                <span className="text-purple-400">总经验 +{task.xp}</span>
                                                <span className="text-yellow-500">总金币 +{task.gold}</span>
                                                <span className="text-blue-500">总时长 {task.subTasks.reduce((sum, st) => sum + st.duration, 0)} 分钟</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {task.subTasks && !task.completed && (
                                    <div className={`border-t p-2 space-y-1 ${isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-slate-200 bg-slate-50'}`}>
                                        {task.subTasks.map(st => (
                                            <div 
                                                key={st.id} 
                                                className={`flex items-center justify-between gap-2 p-1.5 rounded cursor-pointer group/sub ${isDark ? 'hover:bg-white/5' : 'hover:bg-white border border-transparent hover:border-slate-200'}`}
                                            >
                                                <div className="flex items-center gap-2 flex-1" onClick={() => toggleSubTask(task.id, st.id)}>
                                                    <div className={`transition-colors ${st.completed ? 'text-zinc-500' : 'text-zinc-400 group-hover/sub:text-blue-500'}`}>{st.completed ? <CheckSquare size={14} /> : <Square size={14} />}</div>
                                                    <span className={`text-sm ${st.completed ? 'text-zinc-600 line-through' : textMain} transition-all`}>{st.text}</span>
                                                </div>
                                                {/* 显示子任务的经验、金币和时长 */}
                                                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                                                    <span className="text-purple-400">+{st.xp}</span>
                                                    <span className="text-yellow-500">+{st.gold}</span>
                                                    <span className="text-blue-500">{st.duration}m</span>
                                                </div>
                                                <div className="flex items-center gap-0.5">
                                                    <button onClick={(e) => { e.stopPropagation(); deleteSubTask(task.id, st.id); }} className="text-zinc-700 hover:text-red-500 p-1.5 opacity-0 group-hover/sub:opacity-100 transition-opacity" title="删除子任务"><X size={16}/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleStartTimer(st.duration || 25); }} className={`p-2 rounded-full text-white transition-colors hover:scale-110 shadow-lg ${isDark ? 'bg-zinc-800 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'} opacity-0 group-hover/sub:opacity-100`}><Play size={14} fill="currentColor"/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {taskCategory === 'random' && (
                            <>
                                <div className="flex justify-end mb-4"><button onClick={() => setIsManageTasksOpen(true)} className="text-xs text-zinc-500 hover:text-blue-500 underline transition-colors">管理随机库</button></div>
                                {todaysChallenges.tasks.map((taskStr, idx) => {
                                    // 解析随机任务，支持完整格式和旧格式
                                    let taskText = taskStr;
                                    let taskReward = 20;
                                    let taskXP = 30;
                                    let taskDuration = 20;
                                    
                                    try {
                                        const parsedTask = JSON.parse(taskStr);
                                        taskText = parsedTask.text;
                                        taskReward = parsedTask.gold || 20;
                                        taskXP = parsedTask.xp || 30;
                                        taskDuration = parsedTask.duration || 20;
                                    } catch (e) {
                                        // 旧格式，直接使用字符串
                                        taskText = taskStr;
                                    }
                                    
                                    const isCompleted = completedRandomTasks[todaysChallenges.date]?.includes(taskStr);
                                    const isGivenUp = givenUpTasks.includes(taskStr);
                                    const task = { id: `random-${idx}`, text: taskText, gold: taskReward, xp: taskXP, duration: taskDuration, type: 'random', completed: isCompleted, isGivenUp: isGivenUp };
                                    return (
                                        <div 
                                            key={idx} 
                                            draggable 
                                            onDragStart={() => handleDragStart(task, idx)} 
                                            onDragEnd={handleDragEnd} 
                                            onDragOver={(e) => handleDragOver(e, idx)} 
                                            className={`relative group rounded-lg border transition-all overflow-hidden ${isCompleted ? 'opacity-50 grayscale ' + (isDark ? 'bg-zinc-950/50' : 'bg-slate-100') : isGivenUp ? 'opacity-70 ' + (isDark ? 'bg-red-950/10 border-red-900/30' : 'bg-red-50 border-red-200') : ''} ${cardBg} ${!isCompleted && !isGivenUp ? 'hover:border-purple-500/50 hover:shadow-lg' : (isDark ? 'border-zinc-800' : 'border-slate-200')} ${draggedTask && draggedTask.id === `random-${idx}` ? 'opacity-50 scale-95' : ''}`}>
                                            <div className="p-4 flex items-center gap-4">
                                                <div className="text-zinc-600 cursor-grab active:cursor-grabbing"><GripVertical size={14}/></div>
                                                <button onClick={() => !isGivenUp && onToggleRandomChallenge(taskStr)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : isGivenUp ? 'border-red-900 text-red-900 cursor-not-allowed' : (isDark ? 'border-zinc-600 hover:border-emerald-500' : 'border-slate-300 hover:border-emerald-500 bg-white')}`} disabled={isGivenUp}>
                                                    {isCompleted && <Check size={16} strokeWidth={4} />}
                                                    {isGivenUp && <X size={16} strokeWidth={4} />}
                                                </button>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`text-[10px] font-bold px-1.5 rounded border border-purple-500/30 text-purple-500 bg-purple-500/10`}>RND</span>
                                                        <h3 className={`font-bold ${isCompleted || isGivenUp ? 'line-through text-zinc-500' : textMain}`}>
                                                            {taskText}
                                                            {isGivenUp && <span className="ml-2 text-[9px] text-red-500 border border-red-900 bg-red-900/20 px-1 rounded font-bold">已放弃</span>}
                                                        </h3>
                                                        <button onClick={() => openEditRandomTask(taskStr)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-blue-500 transition-opacity ml-2"><Edit3 size={12}/></button>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-500"><span className="text-purple-400">经验 +{taskXP}</span><span className="text-yellow-500">金币 +{taskReward}</span><span className="text-blue-500">消耗时长 {taskDuration} 分钟</span></div>
                                                </div>
                                                {!isCompleted && !isGivenUp && (
                                                    <button onClick={(e) => giveUpTask(taskStr, e)} className="text-zinc-600 hover:text-red-500 p-2 rounded hover:bg-red-900/10 transition-colors">
                                                        <X size={20} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleStartTimer(taskDuration)} disabled={isCompleted || isGivenUp} className={`p-3 rounded-full text-white transition-colors group-hover:scale-110 shadow-lg ${isDark ? 'bg-zinc-800 hover:bg-purple-600' : 'bg-purple-500 hover:bg-purple-600'} disabled:opacity-50`}>
                                                    <Play size={16} fill="currentColor"/>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>
            )}
            {/* ... Other Tabs (Shop, Armory, Modals) ... */}
            {/* ... The rest of the tabs are controlled by the mainTab switch above ... */}
            {mainTab === 'shop' && (
                <div className="max-w-5xl mx-auto space-y-6">
                     <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                         <div className="flex gap-2">
                            {[{ id: 'all', label: '全部' }, { id: 'physical', label: '实物' }, { id: 'rights', label: '权益' }, { id: 'leisure', label: '休闲' }].map(f => (
                                <button onClick={() => setShopFilter(f.id as any)} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${shopFilter === f.id ? (isDark ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-blue-500 text-white border-blue-600') : (isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-200')}`}>{f.label}</button>
                            ))}
                         </div>
                         <div className="flex gap-2 items-center">
                             <button onClick={() => setActiveHelp('shop')} className="text-zinc-500 hover:text-white transition-colors"><HelpCircle size={16}/></button>
                             <button onClick={() => setIsManageShopMode(!isManageShopMode)} className={`text-xs px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all ${isManageShopMode ? 'bg-red-500 text-white border-red-500' : (isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-200')}`}>
                                 {isManageShopMode ? <CheckCircle size={12}/> : <Hammer size={12}/>} {isManageShopMode ? '完成管理' : '管理商品'}
                             </button>
                             <button onClick={() => setMainTab('battle')} className="text-xs px-3 py-1.5 rounded-lg border transition-all ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-200'}">返回作战</button>
                         </div>
                     </div>
                     {isManageShopMode && (<div className="mb-4"><button onClick={handleAddNewItem} className="w-full py-3 border border-dashed border-zinc-700 rounded-xl text-zinc-500 hover:text-white hover:border-zinc-500 transition-all flex items-center justify-center gap-2 text-sm font-bold"><Plus size={16}/> 上架新商品</button></div>)}
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                         {sortedInventory.map((item, index) => (
                             <div key={item.id} draggable={isManageShopMode} onDragStart={() => handleShopDragStart(index)} onDragOver={(e) => handleShopDragOver(e, index)} className={`group relative p-4 rounded-lg border flex flex-col items-center text-center gap-2 hover:border-yellow-500/50 hover:shadow-lg transition-all ${cardBg} ${item.type === 'physical' && item.owned ? 'opacity-50' : ''} ${isManageShopMode ? 'border-red-500/30 cursor-move' : 'cursor-default'}`} style={{ aspectRatio: '1/1', minHeight: '150px' }}>
                                 {isManageShopMode && (<><div className="absolute top-2 right-2 flex gap-2 z-10"><button onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsEditItemOpen(true); }} className="p-1.5 bg-blue-500 rounded text-white transition-colors hover:bg-blue-600"><Edit3 size={12}/></button><button onClick={(e) => handleDeleteItem(e, item.id)} className="p-1.5 bg-red-500 rounded text-white transition-colors hover:bg-red-600"><Trash2 size={12}/></button></div><div className="absolute left-2 top-2 text-zinc-600 opacity-50"><GripVertical size={16}/></div></>)}
                                 {/* 圆形图标，带有精致的边缘光效 */}
                                 <div className="relative w-full h-1/2 flex items-center justify-center mb-0">
                                     <div className={`relative w-16 h-16 rounded-full flex items-center justify-center border ${isDark ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700' : 'bg-gradient-to-br from-zinc-100 to-zinc-200 border-zinc-300'} group-hover:scale-110 transition-all duration-300`}>
                                        {/* 边缘光效 */}
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500/30 via-purple-500/30 to-blue-500/30 animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        {/* 扫光效果 */}
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-[shine_2s_ease-in-out_infinite] transform -rotate-45 transition-opacity duration-500"></div>
                                        {/* 中心图标 */}
                                        <div className="relative z-10 text-8xl group-hover:animate-pulse">{item.icon}</div>
                                    </div>
                                 </div>
                                 {/* 价格移到商品名称前面 */}
                                 <div className="flex items-center justify-center gap-2 mt-1 w-full">
                                     <span className={`px-3 py-1 text-xs font-bold rounded-full ${isDark ? 'bg-yellow-600/30 text-yellow-400 border border-yellow-600/50' : 'bg-yellow-100 text-yellow-800'}`}>¥{item.cost}</span>
                                     <h4 className={`font-bold text-sm ${textMain} mt-0 truncate max-w-[120px]`}>{item.name}</h4>
                                 </div>
                                 <p className="text-xs text-zinc-500 mt-0 line-clamp-2 w-full max-w-[150px]">{item.description}</p>
                                 {/* 购买按钮优化 */}
                                 <button onClick={(e) => handlePurchase(item, e)} className={`w-full py-2 text-xs font-bold rounded-lg transition-all duration-300 ${item.type === 'physical' && item.owned ? 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700' : 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white hover:shadow-xl hover:shadow-yellow-500/50 transform hover:scale-105 active:scale-95'}`}>
                                    {item.type === 'physical' && item.owned ? '已拥有' : '购买'}
                                </button>
                             </div>
                         ))}
                     </div>
                </div>
            )}
            {mainTab === 'armory' && (
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex items-center gap-4 mb-4"><button onClick={() => setMainTab('battle')} className={`p-2 rounded-full border text-zinc-500 transition-all group ${isDark ? 'border-zinc-700 hover:text-white hover:bg-zinc-800' : 'border-slate-300 hover:bg-slate-100'}`}><ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/></button><h2 className={`text-xl font-bold ${textMain}`}>军械库 (Armory)</h2></div>
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
        {activeHelp && (
            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                <div className={`w-full max-w-md p-6 rounded-2xl border ${cardBg} shadow-2xl relative`}>
                    <button onClick={() => setActiveHelp(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
                    {activeHelp === 'tasks' && (<div className="space-y-4"><h3 className={`text-xl font-black ${textMain} flex items-center gap-2`}><List className="text-blue-500"/> 任务系统指南</h3><div className="text-sm text-zinc-400 space-y-3"><p><strong className="text-emerald-500">左侧勾选 (√):</strong> 完成任务，立即获得金币与经验奖励，并记录连胜。</p><p><strong className="text-red-500">右侧放弃 (X):</strong> 战略性放弃今日任务。无惩罚，无奖励，任务将显示<span className="text-red-500">ABANDONED</span>并沉底，代表今日不再攻坚。</p><p><strong>日常副本:</strong> 每日重置，适合培养微习惯。</p><p><strong>随机挑战:</strong> 一次性任务，完成后移除。</p></div></div>)}
                    {activeHelp === 'shop' && (<div className="space-y-4"><h3 className={`text-xl font-black ${textMain} flex items-center gap-2`}><ShoppingBag className="text-yellow-500"/> 黑市交易法则</h3><div className="text-sm text-zinc-400 space-y-3"><p><strong>实物类:</strong> 如数码产品，购买后永久拥有，存入军械库。</p><p><strong>权益/休闲:</strong> 如会员或娱乐时间，购买即消耗，代表你获得了一次享受的权利。</p><p><strong>金币来源:</strong> 仅通过完成任务获得。不劳动者不得食。</p></div></div>)}
                </div>
            </div>
        )}

        {/* Task Management Modal - FIXED */}
        {isManageTasksOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                <div className={`w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] ${cardBg}`}>
                    <div className={`p-4 border-b flex justify-between items-center shrink-0 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                        <h3 className={`font-bold ${textMain}`}>副本任务管理</h3>
                        <button onClick={() => setIsManageTasksOpen(false)} className="text-zinc-500 hover:text-red-500"><X size={20}/></button>
                    </div>
                    
                    <div className={`flex p-2 border-b ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'}`}>
                        <button onClick={() => setManageTaskTab('daily')} className={`flex-1 text-xs py-2 rounded font-bold ${manageTaskTab === 'daily' ? (isDark ? 'bg-zinc-800 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-600 hover:text-slate-800')}`}>日常任务</button>
                        <button onClick={() => setManageTaskTab('main')} className={`flex-1 text-xs py-2 rounded font-bold ${manageTaskTab === 'main' ? (isDark ? 'bg-zinc-800 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-600 hover:text-slate-800')}`}>主线任务</button>
                        <button onClick={() => setManageTaskTab('random')} className={`flex-1 text-xs py-2 rounded font-bold ${manageTaskTab === 'random' ? (isDark ? 'bg-zinc-800 text-white' : 'bg-slate-200 text-slate-800') : (isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-600 hover:text-slate-800')}`}>随机任务</button>
                    </div>
                    
                    <div className="p-4 overflow-y-auto space-y-2 flex-1">
                        {/* 添加任务表单 - 日常任务 */}
                        {manageTaskTab === 'daily' && (
                            <div className={`p-3 border border-dashed rounded mb-4 ${isDark ? 'border-zinc-700 bg-zinc-900/50' : 'border-slate-300 bg-slate-50'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>任务标题</label><input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className={`w-full border-b py-1 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'}`} placeholder="输入日常任务标题..." /></div>
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>金币奖励</label><input type="number" value={newTaskReward} onChange={e => setNewTaskReward(e.target.value)} className={`w-full border-b py-1 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'}`} /></div>
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>XP 奖励</label><input type="number" value={newTaskXP} onChange={e => setNewTaskXP(e.target.value)} className={`w-full border-b py-1 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'}`} /></div>
                                </div>
                                <button 
                                    onClick={() => {
                                        if(newTaskTitle.trim()) {
                                            onAddHabit(newTaskTitle, parseInt(newTaskReward) || 15);
                                            setNewTaskTitle('');
                                            setNewTaskReward('15');
                                            setNewTaskXP('20');
                                        }
                                    }} 
                                    className="w-full mt-3 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center justify-center gap-2"
                                >
                                    <Plus size={14}/> 添加日常任务
                                </button>
                            </div>
                        )}
                        
                        {/* 添加任务表单 - 主线任务 */}
                        {manageTaskTab === 'main' && (
                            <div className={`p-3 border border-dashed rounded mb-4 ${isDark ? 'border-zinc-700 bg-zinc-900/50' : 'border-slate-300 bg-slate-50'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>任务标题</label><input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className={`w-full border-b py-1 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'}`} placeholder="输入主线任务标题..." /></div>
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>金币奖励</label><input type="number" value={newTaskReward} onChange={e => setNewTaskReward(e.target.value)} className={`w-full border-b py-1 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'}`} /></div>
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>XP 奖励</label><input type="number" value={newTaskXP} onChange={e => setNewTaskXP(e.target.value)} className={`w-full border-b py-1 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'}`} /></div>
                                </div>
                                
                                {/* 子任务列表 */}
                                <div className="mb-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>子任务</label>
                                        <button 
                                            onClick={() => {
                                                setEditingProjectSubTasks([...editingProjectSubTasks, {
                                                    id: `sub-${Date.now()}`,
                                                    title: '',
                                                    completed: false,
                                                    duration: 30
                                                }]);
                                            }}
                                            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1"
                                        >
                                            <Plus size={12}/> 添加子任务
                                        </button>
                                    </div>
                                    
                                    {editingProjectSubTasks.map((subTask, index) => (
                                        <div key={subTask.id} className="flex gap-2 items-start mb-2">
                                            <input 
                                                type="text" 
                                                value={subTask.title} 
                                                onChange={(e) => {
                                                    const newSubTasks = [...editingProjectSubTasks];
                                                    newSubTasks[index] = { ...newSubTasks[index], title: e.target.value };
                                                    setEditingProjectSubTasks(newSubTasks);
                                                }} 
                                                placeholder={`子任务 ${index + 1} 标题...`} 
                                                className={`flex-1 border-b py-1 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'}`} 
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
                                                className={`w-20 border-b py-1 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'} text-right`} 
                                            />
                                            <button 
                                                onClick={() => {
                                                    setEditingProjectSubTasks(editingProjectSubTasks.filter((_, i) => i !== index));
                                                }}
                                                className="text-red-500 hover:text-red-400 p-1"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        if(newTaskTitle.trim() && editingProjectSubTasks.length > 0) {
                                            onAddProject({
                                                id: `project-${Date.now()}`,
                                                name: newTaskTitle,
                                                attr: 'WEA',
                                                subTasks: editingProjectSubTasks,
                                                dailyFocus: {},
                                                completed: false
                                            });
                                            setNewTaskTitle('');
                                            setNewTaskReward('15');
                                            setNewTaskXP('20');
                                            setEditingProjectSubTasks([]);
                                        }
                                    }} 
                                    className="w-full mt-3 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center justify-center gap-2"
                                >
                                    <Plus size={14}/> 添加主线任务
                                </button>
                            </div>
                        )}
                        
                        {/* 添加任务表单 - 随机任务 */}
                        {manageTaskTab === 'random' && (
                            <div className={`p-3 border border-dashed rounded mb-4 ${isDark ? 'border-zinc-700 bg-zinc-900/50' : 'border-slate-300 bg-slate-50'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>任务标题</label><input value={newChallengeText} onChange={e => setNewChallengeText(e.target.value)} className={`w-full border-b py-1 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'}`} placeholder="输入随机任务..." /></div>
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>金币奖励</label><input type="number" id="randomReward" value="20" className={`w-full border-b py-1 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'}`} /></div>
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>预估时长(m)</label><input type="number" id="randomDuration" value="20" className={`w-full border-b py-1 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'}`} /></div>
                                </div>
                                <button 
                                    onClick={() => {
                                        if(newChallengeText.trim()) {
                                            const reward = parseInt((document.getElementById('randomReward') as HTMLInputElement).value) || 20;
                                            const duration = parseInt((document.getElementById('randomDuration') as HTMLInputElement).value) || 20;
                                            const newTask = {
                                                text: newChallengeText,
                                                gold: reward,
                                                xp: Math.ceil(reward * 1.5),
                                                duration: duration
                                            };
                                            setChallengePool([...challengePool, JSON.stringify(newTask)]);
                                            setNewChallengeText('');
                                            (document.getElementById('randomReward') as HTMLInputElement).value = '20';
                                            (document.getElementById('randomDuration') as HTMLInputElement).value = '20';
                                        }
                                    }} 
                                    className="w-full mt-3 py-2 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center justify-center gap-2"
                                >
                                    <Plus size={14}/> 添加随机任务
                                </button>
                            </div>
                        )}
                        
                        {/* 现有任务列表 */}
                        <div className="space-y-2">
                            {manageTaskTab === 'daily' && habits.map((h) => (
                                <div key={h.id} className={`flex items-center justify-between p-2 border rounded ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'}`}>
                                    <span className={`text-xs ${textMain}`}>{h.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => { openEditTask({...h, text:h.name, type:'daily', gold:h.reward}); setIsManageTasksOpen(false); }} className="text-blue-500 hover:text-blue-400"><Edit3 size={14}/></button>
                                        <button onClick={() => onDeleteHabit(h.id)} className="text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                            {manageTaskTab === 'main' && projects.map((p) => (
                                <div key={p.id} className={`flex items-center justify-between p-2 border rounded ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'}`}>
                                    <span className={`text-xs ${textMain}`}>{p.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => { openEditTask({...p, text:p.name, type:'main', gold:500}); setIsManageTasksOpen(false); }} className="text-blue-500 hover:text-blue-400"><Edit3 size={14}/></button>
                                        <button onClick={() => onDeleteProject(p.id)} className="text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                            {manageTaskTab === 'random' && (
                                <>
                                    {challengePool.map((c, idx) => {
                                        let taskText = c;
                                        try {
                                            const parsedTask = JSON.parse(c);
                                            taskText = parsedTask.text;
                                        } catch (e) {
                                            // 旧格式，直接使用字符串
                                        }
                                        return (
                                            <div key={idx} className={`flex items-center justify-between p-2 border rounded ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'}`}>
                                                <span className={`text-xs ${textMain}`}>{taskText}</span>
                                                <button onClick={() => setChallengePool(challengePool.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
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
        {isAddTaskOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                <div className={`w-full max-w-md p-6 rounded-2xl border ${cardBg} shadow-2xl relative`}>
                    <h3 className={`font-bold mb-4 ${textMain}`}>{editingTaskId ? '编辑任务' : '部署新任务'}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className={`text-[10px] uppercase font-bold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>任务标题</label>
                            <input autoFocus value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className={`w-full border-b py-2 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'}`} placeholder="输入任务名称..." />
                        </div>
                        {(newTaskType === 'daily' || newTaskType === 'main') && (
                            <div className="grid grid-cols-3 gap-4">
                                <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>金币奖励</label><input type="number" value={newTaskReward} onChange={e => setNewTaskReward(e.target.value)} className={`w-full border-b py-1 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'}`} /></div>
                                <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>XP 奖励</label><input type="number" value={newTaskXP} onChange={e => setNewTaskXP(e.target.value)} className={`w-full border-b py-1 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'}`} /></div>
                                <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>预估时长(m)</label><input type="number" value={newTaskDuration} onChange={e => setNewTaskDuration(e.target.value)} className={`w-full border-b py-1 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'}`} /></div>
                            </div>
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
                                        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1"
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
                                            className={`flex-1 border-b py-1 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'}`} 
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
                                            className={`w-20 border-b py-1 outline-none ${textMain} ${isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300'} text-right`} 
                                        />
                                        <button 
                                            onClick={() => {
                                                setEditingProjectSubTasks(editingProjectSubTasks.filter((_, i) => i !== index));
                                            }}
                                            className="text-red-500 hover:text-red-400 p-1"
                                        >
                                            <Trash2 size={14}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setIsAddTaskOpen(false)} className="px-4 py-2 text-xs text-zinc-500 hover:text-white">取消</button>
                            <button onClick={editingTaskId ? handleSaveEditTask : handleAddNewTask} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs">确认部署</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Edit Item Modal */}
        {isEditItemOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                <div className={`w-full max-w-md p-6 rounded-2xl border ${cardBg} shadow-2xl relative`}>
                    <h3 className={`font-bold mb-4 ${textMain}`}>{editingItem.id ? '编辑商品' : '添加新商品'}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-500">商品名称</label>
                            <input 
                                autoFocus 
                                value={editingItem.name} 
                                onChange={e => setEditingItem(prev => ({...prev, name: e.target.value}))} 
                                className={`w-full bg-transparent border-b border-zinc-700 py-2 outline-none ${textMain}`} 
                                placeholder="输入商品名称..." 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-500">商品描述</label>
                            <input 
                                value={editingItem.description} 
                                onChange={e => setEditingItem(prev => ({...prev, description: e.target.value}))} 
                                className={`w-full bg-transparent border-b border-zinc-700 py-2 outline-none ${textMain}`} 
                                placeholder="输入商品描述..." 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-500">商品价格 (元)</label>
                            <input 
                                type="number" 
                                value={editingItem.cost} 
                                onChange={e => setEditingItem(prev => ({...prev, cost: parseInt(e.target.value) || 0}))} 
                                className={`w-full bg-transparent border-b border-zinc-700 py-2 outline-none ${textMain}`} 
                                placeholder="输入商品价格..." 
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setIsEditItemOpen(false)} className="px-4 py-2 text-xs text-zinc-500 hover:text-white">取消</button>
                            <button onClick={handleEditItemSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs">确认保存</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        
    </div>
  );
};

export default LifeGame;