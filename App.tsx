import React, { useState, useEffect, useRef, useMemo } from 'react';
import Navigation from './components/Navigation';
import CommandCenter from './components/CommandCenter';
import MissionControl from './components/MissionControl'; 
import LifeGame from './components/LifeGame';
import HallOfFame from './components/HallOfFame';
import DailyCheckIn from './components/DailyCheckIn';
import ProjectManual from './components/ProjectManual';
import Settings from './components/Settings';
import { View, Transaction, ReviewLog, Habit, Task, DailyStats, Theme, Project, AttributeType, AchievementItem } from './types';
import { Wallet, Crown, Clock, Brain, Zap, Target, Crosshair, Skull, Star, Gift, Medal, Sparkles, Swords, Flame, Footprints, Calendar, ShoppingBag, Dumbbell, Shield } from 'lucide-react';
import CharacterProfile, { getAllLevels, getAllFocusTitles, getAllWealthTitles, getAllMilitaryRanks, XP_PER_LEVEL, CharacterProfileHandle } from './components/CharacterProfile';

// 签到勋章配置
const CHECKIN_THRESHOLDS = [{min:3,title:'坚持不懈'},{min:7,title:'签到达人'},{min:15,title:'自律新星'},{min:30,title:'习惯养成'},{min:60,title:'岁月如歌'},{min:100,title:'时间的朋友'},{min:200,title:'持久王者'},{min:365,title:'永恒坚守'}];
const getAllCheckInTitles = () => CHECKIN_THRESHOLDS;

// 消费勋章配置
const CONSUMPTION_THRESHOLDS = [{min:100,title:'初次破费'},{min:500,title:'快乐剁手'},{min:1000,title:'品质生活'},{min:2000,title:'补给大亨'},{min:3500,title:'氪金战士'},{min:5000,title:'消费至尊'},{min:8000,title:'黑市常客'},{min:12000,title:'装备大师'},{min:18000,title:'挥金如土'},{min:25000,title:'经济支柱'},{min:40000,title:'商会主席'},{min:60000,title:'财阀雏形'},{min:90000,title:'资本巨头'},{min:150000,title:'市场主宰'},{min:250000,title:'富可敌国'},{min:500000,title:'金钱之神'},{min:1000000,title:'虚空财主'},{min:5000000,title:'无限消费'}];
const getAllConsumptionTitles = () => CONSUMPTION_THRESHOLDS;
import confetti from 'canvas-confetti';

// Initial Data (Kept same)
const INITIAL_HABITS: Habit[] = [
  { id: 'mk1', name: '生物激活: 起床 & 阳光/冷水 (07:30)', reward: 5, xp: 10, duration: 15, streak: 0, color: '#ef4444', attr: 'STR', archived: false, history: {}, logs: {} },
  { id: 'mk2', name: '精神校准: 冥想 & 恐惧设定 (08:00)', reward: 10, xp: 15, duration: 20, streak: 0, color: '#3b82f6', attr: 'INT', archived: false, history: {}, logs: {} },
  { id: 'mk3', name: '深度工作 I: 吞青蛙/核心任务 (08:30)', reward: 30, xp: 50, duration: 90, streak: 0, color: '#f59e0b', attr: 'WEA', archived: false, history: {}, logs: {} },
  { id: 'mk4', name: '能量补给: 低碳水午餐 (12:00)', reward: 5, xp: 5, duration: 30, streak: 0, color: '#10b981', attr: 'STR', archived: false, history: {}, logs: {} },
  { id: 'mk5', name: '主动休息: 散步/小睡 (13:00)', reward: 10, xp: 10, duration: 30, streak: 0, color: '#10b981', attr: 'STR', archived: false, history: {}, logs: {} },
  { id: 'mk6', name: '深度工作 II: 堆量/执行 (14:00)', reward: 30, xp: 50, duration: 120, streak: 0, color: '#f59e0b', attr: 'WEA', archived: false, history: {}, logs: {} },
  { id: 'mk7', name: '身体重塑: 高强度运动 (18:00)', reward: 20, xp: 30, duration: 60, streak: 0, color: '#ef4444', attr: 'STR', archived: false, history: {}, logs: {} },
  { id: 'mk8', name: '输入与复盘: 阅读 & 日志 (19:30)', reward: 15, xp: 20, duration: 45, streak: 0, color: '#8b5cf6', attr: 'INT', archived: false, history: {}, logs: {} },
  { id: 'mk9', name: '数字日落: 远离屏幕 (23:00)', reward: 10, xp: 10, duration: 0, streak: 0, color: '#64748b', attr: 'DIS', archived: false, history: {}, logs: {} },
  { id: 'mk10', name: '休眠: 深度睡眠 (00:00)', reward: 20, xp: 20, duration: 480, streak: 0, color: '#ef4444', attr: 'STR', archived: false, history: {}, logs: {} },
];

const INITIAL_PROJECTS: Project[] = [
    { 
        id: 'p1', name: '数码万粉号 I', startDate: new Date().toISOString().split('T')[0], description: '创建并运营第一个粉丝量达到1万的数码账号', status: 'active', logs: [], dailyFocus: {}, todayFocusMinutes: 0, fears: [], attr: 'WEA',
        subTasks: [
            { id: 't1_1', title: '发布视频作品', duration: 60, completed: false, frequency: 'daily' },
            { id: 't1_2', title: '发布引流作品', duration: 30, completed: false, frequency: 'daily' },
            { id: 't1_3', title: '发布图文作品', duration: 20, completed: false, frequency: 'daily' }
        ]
    },
    { 
        id: 'p2', name: '数码万分号 II', startDate: new Date().toISOString().split('T')[0], description: '创建并运营第二个粉丝量达到1万的数码账号', status: 'active', logs: [], dailyFocus: {}, todayFocusMinutes: 0, fears: [], attr: 'WEA',
        subTasks: [
            { id: 't2_1', title: '发布视频作品', duration: 60, completed: false, frequency: 'daily' },
            { id: 't2_2', title: '发布引流作品', duration: 30, completed: false, frequency: 'daily' },
            { id: 't2_3', title: '发布图文作品', duration: 20, completed: false, frequency: 'daily' }
        ]
    },
    { 
        id: 'p3', name: '成长型博主：1000粉目标', startDate: new Date().toISOString().split('T')[0], description: '成为一个拥有1000粉丝的成长型博主', status: 'active', logs: [], dailyFocus: {}, todayFocusMinutes: 0, fears: [], attr: 'INT',
        subTasks: [
            { id: 't3_1', title: '选一个选题', duration: 15, completed: false, frequency: 'daily' },
            { id: 't3_2', title: '整理文案', duration: 30, completed: false, frequency: 'daily' },
            { id: 't3_3', title: '拍摄视频', duration: 45, completed: false, frequency: 'daily' },
            { id: 't3_4', title: '剪辑视频', duration: 60, completed: false, frequency: 'daily' },
            { id: 't3_5', title: '发布视频', duration: 15, completed: false, frequency: 'daily' }
        ]
    },
    { 
        id: 'p4', name: '拥有6块腹肌', startDate: new Date().toISOString().split('T')[0], description: '通过健身和饮食拥有6块腹肌', status: 'active', logs: [], dailyFocus: {}, todayFocusMinutes: 0, fears: [], attr: 'STR',
        subTasks: [
            { id: 't4_1', title: '每天喝八杯水', duration: 5, completed: false, frequency: 'daily' },
            { id: 't4_2', title: '每天做50个深蹲', duration: 10, completed: false, frequency: 'daily' },
            { id: 't4_3', title: '每天做50个俯卧撑', duration: 10, completed: false, frequency: 'daily' },
            { id: 't4_4', title: '每天做30分钟有氧', duration: 30, completed: false, frequency: 'daily' },
            { id: 't4_5', title: '控制饮食，减少碳水', duration: 5, completed: false, frequency: 'daily' }
        ]
    },
];

const INITIAL_CHALLENGES = [
    // 现有的任务
    "做 50 个俯卧撑", "冷水洗脸/洗澡", "冥想 20 分钟", "阅读 10 页书", 
    "完全断网 1 小时", "整理房间/桌面", "给父母/朋友打个电话", 
    "记录 3 件感恩的事", "深蹲 50 下", "核心平板支撑 2 分钟",
    "不吃晚饭/轻断食", "写 500 字日记", "复盘今日得失",
    
    
    JSON.stringify({ text: "练习15分钟摄影技巧", gold: 20, xp: 25, duration: 15 }),
    JSON.stringify({ text: "学习5分钟管理知识", gold: 15, xp: 20, duration: 5 })
];

const INITIAL_ACHIEVEMENTS: AchievementItem[] = [
    { id: 'c0', name: '迈出一步', limit: 1, unit: 'kills', iconName: 'Target', color: 'text-red-500', desc: '完成 1 个任务', category: '战役' },
];

// --- Global Reward Modal ---
const RewardModal: React.FC<{ badge: any, onClose: (id: string, xp: number, gold: number) => void }> = ({ badge, onClose }) => {
    let threshold = 0;
    if (badge.min) threshold = badge.min;
    else if (badge.val) threshold = badge.val;
    else {
        const numMatch = badge.subTitle.match(/(\d+)/);
        if (numMatch) threshold = parseInt(numMatch[0]);
    }
    if (threshold === 0) threshold = 1; 
    const standardReward = Math.max(1, Math.floor(threshold * 0.1));
    let rewardGold = 0;
    let rewardXp = 0;
    let IconComp = Star;
    let iconColor = 'text-yellow-400';
    let animationClass = 'animate-spin-slow';

    if (badge.id.startsWith('lvl')) { 
        rewardXp = standardReward; rewardGold = standardReward; IconComp = Zap; iconColor = 'text-blue-500'; animationClass = 'animate-pulse';
    } 
    else if (badge.id.startsWith('rank')) { 
        rewardXp = 0; rewardGold = Math.max(10, standardReward * 5); IconComp = Clock; iconColor = 'text-emerald-500'; animationClass = 'animate-bounce';
    }
    else if (badge.id.startsWith('class')) { 
        rewardXp = 0; rewardGold = Math.max(5, Math.floor(threshold * 0.05)); IconComp = Wallet; iconColor = 'text-yellow-500'; animationClass = 'animate-pulse';
    }
    else if (badge.id.startsWith('consume')) {
        rewardXp = 0; rewardGold = Math.floor(threshold * 0.1); IconComp = ShoppingBag; iconColor = 'text-orange-500'; animationClass = 'animate-bounce';
    }
    else if (badge.id.startsWith('combat')) { 
        rewardXp = threshold * 10; rewardGold = threshold * 10; IconComp = Target; iconColor = 'text-red-500'; animationClass = 'animate-bounce';
    }
    else if (badge.id.startsWith('check')) {
        rewardXp = threshold * 10; rewardGold = threshold * 10; IconComp = Flame; iconColor = 'text-purple-500'; animationClass = 'animate-pulse';
    }
    if (badge.iconName === 'Target') IconComp = Target;

    useEffect(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-500">
            <div className="flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-500 max-w-sm w-full relative">
                <div className="relative">
                    <div className={`absolute inset-0 ${iconColor.replace('text-', 'bg-')}/30 blur-[60px] rounded-full animate-pulse`}></div>
                    <div className="relative text-[120px] animate-[spin_3s_linear_infinite]">
                        <Sparkles className="text-white opacity-20 absolute -top-10 -left-10" size={40}/>
                        <Sparkles className="text-white opacity-20 absolute top-20 -right-10" size={30}/>
                    </div>
                    <div className={`absolute inset-0 flex items-center justify-center text-6xl ${animationClass} drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]`}>
                        <IconComp size={100} className={iconColor} strokeWidth={1.5} />
                    </div>
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">成就达成</h2>
                    <div className={`text-xl font-bold ${badge.color}`}>{badge.title}</div>
                    <div className="text-zinc-400 font-mono mt-1">{badge.subTitle}</div>
                </div>
                <div className="bg-zinc-900 border border-yellow-500/30 p-6 rounded-2xl w-full flex justify-around items-center">
                    <div className="flex flex-col items-center">
                        <div className="text-xs text-zinc-500 font-bold uppercase mb-1">经验奖励</div>
                        <div className={`text-2xl font-black ${rewardXp > 0 ? 'text-blue-400' : 'text-zinc-600'}`}>+{rewardXp}</div>
                    </div>
                    <div className="w-px h-10 bg-zinc-800"></div>
                    <div className="flex flex-col items-center">
                        <div className="text-xs text-zinc-500 font-bold uppercase mb-1">金币奖励</div>
                        <div className={`text-2xl font-black ${rewardGold > 0 ? 'text-yellow-400' : 'text-zinc-600'}`}>+{rewardGold}</div>
                    </div>
                </div>
                <button 
                    onClick={() => onClose(badge.id, rewardXp, rewardGold)}
                    className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-black text-lg rounded-xl shadow-lg shadow-orange-900/50 transform transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <Gift size={24}/> 领取奖励
                </button>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.COMMAND_CENTER);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Global "Game" State
  const [day, setDay] = useState(1); 
  const [balance, setBalance] = useState(1250);
  const [xp, setXp] = useState(0); 
  const [checkInStreak, setCheckInStreak] = useState(0); 
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reviews, setReviews] = useState<ReviewLog[]>([]);
  
  // Pomodoro Timer State (Global)
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(25 * 60);
  const [pomodoroIsActive, setPomodoroIsActive] = useState(false);
  const [pomodoroDuration, setPomodoroDuration] = useState(25);

  // Pomodoro Timer Handlers
  const handleToggleTimer = () => {
    setPomodoroIsActive(!pomodoroIsActive);
  };

  const handleResetTimer = () => {
    setPomodoroIsActive(false);
    setPomodoroTimeLeft(pomodoroDuration * 60);
  };

  const handleChangeDuration = (minutes: number) => {
    setPomodoroDuration(minutes);
    setPomodoroIsActive(false);
    setPomodoroTimeLeft(minutes * 60);
  };

  const handleUpdateTimeLeft = (seconds: number) => {
    setPomodoroTimeLeft(seconds);
  };

  const handleUpdateIsActive = (active: boolean) => {
    setPomodoroIsActive(active);
  };

  // Global Pomodoro Timer Effect
  useEffect(() => {
    let interval: number;
    if (pomodoroIsActive && pomodoroTimeLeft > 0) {
      interval = window.setInterval(() => {
        setPomodoroTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (pomodoroTimeLeft === 0 && pomodoroIsActive) {
      setPomodoroIsActive(false);
      setPomodoroTimeLeft(pomodoroDuration * 60);
    }
    return () => clearInterval(interval);
  }, [pomodoroIsActive, pomodoroTimeLeft, pomodoroDuration]);
  
  const characterProfileRef = useRef<CharacterProfileHandle>(null);

  // Settings State
  const [settings, setSettings] = useState({ 
    bgMusicVolume: 0.5, 
    soundEffectVolume: 0.7, 
    enableBgMusic: true, 
    enableSoundEffects: true,
    enableNotifications: true,
    enableTaskCompleteNotifications: true,
    enableAchievementNotifications: true,
    enablePomodoroNotifications: true,
    showExperienceBar: true,
    showBalance: true,
    showTaskCompletionRate: true,
    allowAnonymousDataCollection: false,
    saveActivityLogs: false,
    soundEffectsByLocation: {},
    soundLibrary: {}
  });

  // Weekly & Daily Goal State
  const [weeklyGoal, setWeeklyGoal] = useState("本周战役：攻占「项目初稿」高地");
  const [todayGoal, setTodayGoal] = useState("今日核心：完成核心模块代码"); 

  // Navigation Deep Linking State
  const [initialTaskCategory, setInitialTaskCategory] = useState<'daily' | 'main' | 'random'>('daily');

  // Data State
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [habitOrder, setHabitOrder] = useState<string[]>(INITIAL_HABITS.map(h => h.id));
  const [projectOrder, setProjectOrder] = useState<string[]>(INITIAL_PROJECTS.map(p => p.id));
  
  const [challengePool, setChallengePool] = useState<string[]>(INITIAL_CHALLENGES);
  const [todaysChallenges, setTodaysChallenges] = useState<{date: string, tasks: string[]}>({ date: '', tasks: [] });
  const [achievements, setAchievements] = useState<AchievementItem[]>(INITIAL_ACHIEVEMENTS);
  const [completedRandomTasks, setCompletedRandomTasks] = useState<{[date: string]: string[]}>({}); 
  const [givenUpTasks, setGivenUpTasks] = useState<string[]>([]); // New: Persisted Given Up Tasks
  
  const [claimedBadges, setClaimedBadges] = useState<string[]>([]);
  const [activeAchievement, setActiveAchievement] = useState<any>(null); 

  const [activeAutoTask, setActiveAutoTask] = useState<{type: 'habit'|'project'|'random', id: string, subId?: string} | null>(null);

  const [statsHistory, setStatsHistory] = useState<{[key: number]: DailyStats}>({});
  const [todayStats, setTodayStats] = useState<DailyStats>({
      focusMinutes: 0,
      tasksCompleted: 0,
      habitsDone: 0,
      earnings: 0,
      spending: 0
  });

  const totalKills = todayStats.tasksCompleted + todayStats.habitsDone;
  const totalHours = Object.values(statsHistory).reduce((acc, curr) => acc + curr.focusMinutes, 0) / 60;
  const totalSpent = Object.values(statsHistory).reduce((acc, curr) => acc + curr.spending, 0) + todayStats.spending;

  // --- Persistence Engine ---
  useEffect(() => {
    const savedGlobal = localStorage.getItem('aes-global-data-v3');
    const savedLifeGame = localStorage.getItem('life-game-stats-v2');
    const streakStr = localStorage.getItem('aes-checkin-streak');

    if(streakStr) setCheckInStreak(parseInt(streakStr));

    if (savedGlobal) {
      try {
        const data = JSON.parse(savedGlobal);
        setHabits(data.habits || INITIAL_HABITS);
        
        const savedProjects = data.projects || [];
        const mergedProjects = [...savedProjects];
        INITIAL_PROJECTS.forEach(ip => {
            if (!mergedProjects.find((p: Project) => p.id === ip.id)) {
                mergedProjects.push(ip);
            }
        });
        
        const todayStr = new Date().toLocaleDateString();
        const lastLoginDate = data.lastLoginDate;
        
        let finalProjects = mergedProjects;
        if (lastLoginDate !== todayStr) {
            finalProjects = mergedProjects.map((p: Project) => ({
                ...p,
                subTasks: p.subTasks.map(st => ({ ...st, completed: false })) // 所有子任务每天都重置为未完成
            }));
            setTodayStats({ focusMinutes: 0, tasksCompleted: 0, habitsDone: 0, earnings: 0, spending: 0 });
            // Usually "Give Up Today" implies reset tomorrow.
            setGivenUpTasks([]); 
        } else {
            setTodayStats(data.todayStats || {});
            setGivenUpTasks(data.givenUpTasks || []);
        }
        
        setProjects(finalProjects);
        setHabitOrder(data.habitOrder || (data.habits || INITIAL_HABITS).map(h => h.id));
        setProjectOrder(data.projectOrder || (finalProjects).map(p => p.id));
        setBalance(data.balance ?? 1250);
        setDay(data.day || 1);
        setTransactions(data.transactions || []);
        setReviews(data.reviews || []);
        setStatsHistory(data.statsHistory || {});
        setChallengePool(data.challengePool || INITIAL_CHALLENGES);
        setTodaysChallenges(data.todaysChallenges || { date: '', tasks: [] });
        setAchievements(data.achievements || INITIAL_ACHIEVEMENTS);
        setCompletedRandomTasks(data.completedRandomTasks || {});
        setClaimedBadges(data.claimedBadges || []);
        if (data.weeklyGoal) setWeeklyGoal(data.weeklyGoal);
        if (data.todayGoal) setTodayGoal(data.todayGoal); 

        const startDate = data.startDate ? new Date(data.startDate) : new Date();
        const diff = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setDay(diff);

      } catch (e) { 
          console.error("Global save corrupted", e); 
          // 数据损坏时，使用默认数据
          setHabits(INITIAL_HABITS);
          setProjects(INITIAL_PROJECTS);
          setHabitOrder(INITIAL_HABITS.map(h => h.id));
          setProjectOrder(INITIAL_PROJECTS.map(p => p.id));
          setBalance(1250);
          setDay(1);
          setTransactions([]);
          setReviews([]);
          setStatsHistory({});
          setChallengePool(INITIAL_CHALLENGES);
          setTodaysChallenges({ date: '', tasks: [] });
          setAchievements(INITIAL_ACHIEVEMENTS);
          setCompletedRandomTasks({});
          setClaimedBadges([]);
      }
    } else {
        localStorage.setItem('aes-global-data-v3', JSON.stringify({ startDate: new Date().toISOString() }));
    }

    if (savedLifeGame) {
        try {
            const lgData = JSON.parse(savedLifeGame);
            if (lgData.xp) setXp(lgData.xp);
        } catch (e) { 
            console.error("LifeGame save corrupted", e); 
            // 数据损坏时，使用默认数据
            setXp(0);
        }
    }

    // 无论数据加载是否成功，都设置为已加载
    setIsDataLoaded(true);
  }, []);

  // Global Achievement Watcher
  useEffect(() => {
      if(!isDataLoaded) return;

      const checkAndTrigger = () => {
          const currentLevelInfo = getAllLevels().findIndex(l => xp < l.min) - 1; 
          const currentLevelVal = currentLevelInfo === -2 ? getAllLevels().length : currentLevelInfo + 1;

          const levelBadges = getAllLevels().map((l, idx) => ({ id: `lvl-${l.val}`, title: l.title, subTitle: `LV.${l.val}`, icon: idx%2===0 ? <Zap size={32} strokeWidth={3}/> : <Sparkles size={32} strokeWidth={3}/>, color: 'text-blue-500', isUnlocked: xp >= l.min, req: `达到等级 ${l.val}`, min: l.min }));
          const rankBadges = getAllFocusTitles().map((r, idx) => ({ id: `rank-${r.title}`, title: r.title, subTitle: `${r.min}H`, icon: idx%2===0 ? <Clock size={32} strokeWidth={3}/> : <Brain size={32} strokeWidth={3}/>, color: 'text-emerald-500', isUnlocked: totalHours >= r.min, req: `专注 ${r.min} 小时`, min: r.min }));
          const classBadges = getAllWealthTitles().map((c, idx) => ({ id: `class-${c.title}`, title: c.title, subTitle: `${c.min}G`, icon: idx>10 ? <Crown size={32} strokeWidth={3}/> : <Wallet size={32} strokeWidth={3}/>, color: 'text-yellow-500', isUnlocked: balance >= c.min, req: `持有 ${c.min} 金币`, min: c.min }));
          const combatBadges = getAllMilitaryRanks().map((r, idx) => ({ id: `combat-${r.title}`, title: r.title, subTitle: `${r.min} KILLS`, icon: idx>15 ? <Skull size={32} strokeWidth={3}/> : (idx>8 ? <Shield size={32} strokeWidth={3}/> : <Target size={32} strokeWidth={3}/>), color: 'text-red-500', isUnlocked: totalKills >= r.min, req: `完成 ${r.min} 个任务`, min: r.min }));
          const checkInBadges = getAllCheckInTitles().map((c, idx) => ({ id: `check-${c.title}`, title: c.title, subTitle: `${c.min} DAYS`, icon: idx>5 ? <Flame size={32} strokeWidth={3}/> : (idx>2 ? <Footprints size={32} strokeWidth={3}/> : <Calendar size={32} strokeWidth={3}/>), color: 'text-purple-500', isUnlocked: checkInStreak >= c.min, req: `连续签到 ${c.min} 天`, min: c.min }));
          const consumptionBadges = getAllConsumptionTitles().map((c, idx) => ({ id: `consume-${c.title}`, title: c.title, subTitle: `${c.min}G`, icon: idx>5 ? <Dumbbell size={32} strokeWidth={3}/> : <ShoppingBag size={32} strokeWidth={3}/>, color: 'text-orange-500', isUnlocked: totalSpent >= c.min, req: `累计消费 ${c.min} 金币`, min: c.min }));

          const isNonZero = (badge: any) => {
              if (badge.min === 0) return false;
              if (badge.id.includes('列兵') && totalKills === 0) return false;
              if (badge.id.includes('专注小白') && totalHours === 0) return false;
              if (badge.id.includes('赛博乞丐') && balance < 50) return false;
              if (badge.id.startsWith('consume') && totalSpent === 0) return false;
              
              return true;
          };

          const allBadges = [...levelBadges, ...rankBadges, ...classBadges, ...combatBadges, ...checkInBadges, ...consumptionBadges];
          
          const unlockedUnclaimed = allBadges.find(b => b.isUnlocked && !claimedBadges.includes(b.id) && isNonZero(b));
          
          if (unlockedUnclaimed && !activeAchievement) {
              setActiveAchievement(unlockedUnclaimed);
          }
      };

      checkAndTrigger();
  }, [xp, balance, totalHours, totalKills, checkInStreak, totalSpent, claimedBadges, isDataLoaded]);


  useEffect(() => {
      if(!isDataLoaded) return;
      const todayStr = new Date().toLocaleDateString();
      if (todaysChallenges.date !== todayStr) {
          const shuffled = [...challengePool].sort(() => 0.5 - Math.random());
          setTodaysChallenges({
              date: todayStr,
              tasks: shuffled.slice(0, 3)
          });
      }
  }, [isDataLoaded, challengePool, todaysChallenges]);

  useEffect(() => {
    if (!isDataLoaded) return;
    const data = {
        habits, 
        projects, 
        habitOrder,
        projectOrder,
        balance, 
        day, 
        transactions, 
        reviews,
        statsHistory,
        todayStats,
        challengePool,
        todaysChallenges,
        achievements,
        completedRandomTasks,
        claimedBadges,
        weeklyGoal,
        todayGoal, 
        givenUpTasks, // Persist this
        lastLoginDate: new Date().toLocaleDateString(),
        startDate: localStorage.getItem('aes-global-data-v3') ? JSON.parse(localStorage.getItem('aes-global-data-v3')!).startDate : new Date().toISOString()
    };
    localStorage.setItem('aes-global-data-v3', JSON.stringify(data));
    
    const lgStats = localStorage.getItem('life-game-stats-v2') ? JSON.parse(localStorage.getItem('life-game-stats-v2')!) : {};
    lgStats.xp = xp;
    localStorage.setItem('life-game-stats-v2', JSON.stringify(lgStats));

  }, [habits, projects, habitOrder, projectOrder, balance, day, transactions, reviews, statsHistory, todayStats, challengePool, todaysChallenges, achievements, completedRandomTasks, isDataLoaded, xp, claimedBadges, weeklyGoal, todayGoal, givenUpTasks]);

  useEffect(() => {
      if(isDataLoaded) {
          setStatsHistory(prev => ({ ...prev, [day]: todayStats }));
      }
  }, [todayStats, day, isDataLoaded]);

  const [floatingTexts, setFloatingTexts] = useState<{id: number, text: string, x: number, y: number, color: string}[]>([]);

  // 用于跟踪最近添加的浮动文本，避免重复调用
  const lastFloatingText = useRef({ text: '', timestamp: 0 });
  
  const addFloatingText = (text: string, color: string, x?: number, y?: number) => {
      // 防抖：在100ms内相同文本只添加一次，避免React.StrictMode导致的重复调用
      const now = Date.now();
      if (lastFloatingText.current.text === text && (now - lastFloatingText.current.timestamp) < 100) {
          return;
      }
      
      lastFloatingText.current = { text, timestamp: now };
      
      const id = now + Math.random();
      const finalX = x || (window.innerWidth / 2 + (Math.random() * 100 - 50)); 
      const finalY = y || (window.innerHeight / 2 + (Math.random() * 100 - 50));
      setFloatingTexts(prev => [...prev, { id, text, x: finalX, y: finalY, color }]);
      setTimeout(() => {
          setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
      }, 2000); 
  };

  const handleUpdateBalance = (amount: number, reason: string) => {
    setBalance(prev => prev + amount);
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      desc: reason,
      amount: amount
    };
    setTransactions(prev => [newTransaction, ...prev].slice(0, 50));
    
    if (amount > 0) {
        setTodayStats(s => ({ ...s, earnings: s.earnings + amount }));
        // Play Coin Sound
        playSound("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
    } else {
        setTodayStats(s => ({ ...s, spending: s.spending - amount }));
        // Play Spend Sound
        playSound("https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3");
    }
  };

  const handleClaimReward = (id: string, rewardXp: number, rewardGold: number) => {
      setClaimedBadges(prev => [...prev, id]);
      
      const safeGold = rewardGold;
      const safeXp = rewardXp;

      if (safeGold > 0) handleUpdateBalance(safeGold, '成就奖励');
      if (safeXp > 0) {
          setXp(prev => prev + safeXp);
          addFloatingText(`+${safeXp} 经验`, 'text-blue-500', window.innerWidth / 2);
      }
      setActiveAchievement(null); // Close modal
      playSound("https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3");
  };

  // --- Global Daily Check In Handler ---
  const handleDailyCheckIn = (gold: number, xpReward: number) => {
      handleUpdateBalance(gold, "每日签到金币");
      setXp(prev => prev + xpReward);
      addFloatingText(`+${gold} 金币`, 'text-yellow-500', window.innerWidth / 2 - 60);
      addFloatingText(`+${xpReward} 经验`, 'text-blue-500', window.innerWidth / 2 + 60);
  };

  const handleGiveUpTask = (taskId: string) => {
      setGivenUpTasks(prev => [...prev, taskId]);
  };

  // Settings Handlers
  const handleUpdateSettings = (newSettings: any) => {
      setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleToggleTheme = () => {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Global Audio Ref for Background Music Persistence
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  // Effect to handle background music based on settings changes
  useEffect(() => {
      if (bgMusicRef.current) {
          if (settings.enableBgMusic) {
              bgMusicRef.current.volume = settings.bgMusicVolume;
              bgMusicRef.current.play().catch(() => {});
          } else {
              bgMusicRef.current.pause();
          }
      }

      // Cleanup on component unmount
      return () => {
          if (bgMusicRef.current) {
              bgMusicRef.current.pause();
              bgMusicRef.current = null;
          }
      };
  }, [settings.enableBgMusic, settings.bgMusicVolume]);

  // Audio Handler
  const playSound = (url: string, type: 'soundEffect' | 'bgMusic' = 'soundEffect') => {
      if ((type === 'soundEffect' && !settings.enableSoundEffects) || (type === 'bgMusic' && !settings.enableBgMusic)) {
          return;
      }
      
      const volume = type === 'soundEffect' ? settings.soundEffectVolume : settings.bgMusicVolume;
      
      if (type === 'bgMusic') {
          // For background music, use the global audio ref to persist across navigation
          if (!bgMusicRef.current) {
              bgMusicRef.current = new Audio(url);
              bgMusicRef.current.loop = true; // Loop background music
          } else {
              // If the URL has changed, update the src
              if (bgMusicRef.current.src !== url) {
                  bgMusicRef.current.src = url;
              }
          }
          
          // Update volume and play
          bgMusicRef.current.volume = volume;
          bgMusicRef.current.play().catch(() => {});
      } else {
          // For sound effects, create new Audio objects
          const audio = new Audio(url);
          audio.volume = volume;
          audio.play().catch(() => {});
      }
  };

  const handleToggleRandomChallenge = (taskTitle: string) => {
      const todayStr = new Date().toLocaleDateString();
      const currentList = completedRandomTasks[todayStr] || [];
      const isCompleted = currentList.includes(taskTitle);

      const newCompleted = { ...completedRandomTasks };
      
      // 解析任务，获取任务文本
      let taskText = taskTitle;
      
      try {
          const parsedTask = JSON.parse(taskTitle);
          taskText = parsedTask.text;
      } catch (e) {
          // 旧格式，使用默认值
      }
      
      if (isCompleted) {
          newCompleted[todayStr] = currentList.filter(t => t !== taskTitle);
          handleUpdateBalance(-10, `撤销挑战: ${taskText}`);
          setXp(prev => Math.max(0, prev - 10));
          setTodayStats(s => ({ 
              ...s, 
              tasksCompleted: Math.max(0, s.tasksCompleted - 1),
              focusMinutes: Math.max(0, s.focusMinutes - 10)
          }));
      } else {
          if (!newCompleted[todayStr]) newCompleted[todayStr] = [];
          newCompleted[todayStr].push(taskTitle);
          handleUpdateBalance(10, `完成挑战: ${taskText}`);
          setXp(prev => prev + 10);
          setTodayStats(s => ({ 
              ...s, 
              tasksCompleted: s.tasksCompleted + 1,
              focusMinutes: s.focusMinutes + 10
          }));
          
          // 统一奖励通知：经验+10, 金币+10, 专注时间+10
          addFloatingText(`+10 金币`, 'text-yellow-500', window.innerWidth / 2 - 80);
          
          setTimeout(() => {
              addFloatingText(`+10 经验`, 'text-blue-500', window.innerWidth / 2);
          }, 300);
          
          setTimeout(() => {
              addFloatingText(`+10 专注时间`, 'text-green-500', window.innerWidth / 2 + 80);
          }, 600);
          
          playSound("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");
      }
      setCompletedRandomTasks(newCompleted);
  };

  const handleStartAutoTask = (type: 'habit'|'project'|'random', id: string, duration: number, subId?: string) => {
      setActiveAutoTask({ type, id, subId });
  };

  const handleSaveReview = (content: string, aiAnalysis: string) => {
      const log: ReviewLog = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          content,
          aiAnalysis,
          timestamp: Date.now()
      };
      setReviews(prev => [...prev, log]);
  };

  const handleAddHabit = (name: string, reward: number) => {
      const h: Habit = { id: Date.now().toString(), name, reward, xp: Math.ceil(reward * 1.5), duration: reward, streak: 0, color: '#8b5cf6', attr: 'DIS', archived: false, history: {}, logs: {} };
      setHabits([...habits, h]);
      setHabitOrder([...habitOrder, h.id]);
  };
  const handleUpdateHabit = (id: string, updates: Partial<Habit>) => {
      setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };
  const handleDeleteHabit = (id: string) => {
      if(window.confirm('确定要删除此习惯协议吗？')) {
          setHabits(prev => prev.filter(h => h.id !== id));
          setHabitOrder(prev => prev.filter(habitId => habitId !== id));
      }
  };
  const handleToggleHabit = (id: string, dateStr: string) => {
      setHabits(habits.map(h => {
          if(h.id === id) {
              const wasDone = !!h.history[dateStr];
              const newHistory = { ...h.history };
              if (wasDone) {
                  delete newHistory[dateStr];
                  handleUpdateBalance(-10, `撤销: ${h.name}`);
                  setTodayStats(s => ({ 
                      ...s, 
                      habitsDone: Math.max(0, s.habitsDone - 1),
                      focusMinutes: Math.max(0, s.focusMinutes - 10)
                  }));
                  setXp(prev => Math.max(0, prev - 10));
                  return { ...h, history: newHistory, streak: Math.max(0, h.streak - 1) };
              } else {
                  newHistory[dateStr] = true;
                  handleUpdateBalance(10, `完成: ${h.name}`);
                  setTodayStats(s => ({ 
                      ...s, 
                      habitsDone: s.habitsDone + 1,
                      focusMinutes: s.focusMinutes + 10
                  }));
                  
                  // 统一奖励通知：经验+10, 金币+10, 专注时间+10
                  addFloatingText(`+10 金币`, 'text-yellow-500', window.innerWidth / 2 - 80);
                  
                  setXp(prev => prev + 10);
                  
                  setTimeout(() => {
                      addFloatingText(`+10 经验`, 'text-blue-500', window.innerWidth / 2);
                  }, 300);
                  
                  setTimeout(() => {
                      addFloatingText(`+10 专注时间`, 'text-green-500', window.innerWidth / 2 + 80);
                  }, 600);

                  // Play Success Sound
                  playSound("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");

                  return { ...h, history: newHistory, streak: h.streak + 1 };
              }
          }
          return h;
      }));
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
      setProjects(prev => prev.map(p => {
          if (p.id === id) {
              const updatedProject = { ...p, ...updates };
              if (updates.subTasks) {
                  // 检查哪些子任务从非完成状态变为完成状态
                  const prevCompletedSubTasks = p.subTasks.filter(t => t.completed).length;
                  const newCompletedSubTasks = updatedProject.subTasks.filter(t => t.completed).length;
                  const newlyCompletedCount = Math.max(0, newCompletedSubTasks - prevCompletedSubTasks);
                  
                  if (newlyCompletedCount > 0) {
                      // 为每个新完成的子任务添加统一奖励
                      for (let i = 0; i < newlyCompletedCount; i++) {
                          handleUpdateBalance(10, `完成子任务: ${p.name}`);
                          setXp(prev => prev + 10);
                          setTodayStats(s => ({ 
                              ...s, 
                              focusMinutes: s.focusMinutes + 10
                          }));
                          
                          // 统一奖励通知：经验+10, 金币+10, 专注时间+10
                          setTimeout(() => {
                              addFloatingText(`+10 金币`, 'text-yellow-500', window.innerWidth / 2 - 80);
                          }, i * 300);
                          
                          setTimeout(() => {
                              addFloatingText(`+10 经验`, 'text-blue-500', window.innerWidth / 2);
                          }, i * 300 + 300);
                          
                          setTimeout(() => {
                              addFloatingText(`+10 专注时间`, 'text-green-500', window.innerWidth / 2 + 80);
                          }, i * 300 + 600);
                      }
                      
                      playSound("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");
                  }
                  
                  const allDone = updatedProject.subTasks.length > 0 && updatedProject.subTasks.every(t => t.completed);
                  if (allDone && p.status !== 'completed') {
                      updatedProject.status = 'completed';
                      handleUpdateBalance(100, `战役胜利: ${p.name}`);
                      addFloatingText('战役胜利！获得奖励', 'text-yellow-400');
                      setXp(prev => prev + 200);
                      addFloatingText('+200 经验', 'text-blue-500', window.innerWidth / 2);
                  } else if (!allDone && p.status === 'completed') {
                      updatedProject.status = 'active';
                  }
              }
              return updatedProject;
          }
          return p;
      }));
  };
  const handleAddProject = (project: Project) => {
      setProjects([...projects, project]);
      setProjectOrder([...projectOrder, project.id]);
  };
  const handleDeleteProject = (id: string) => {
      if(window.confirm('确定要删除此战役吗？')) {
          setProjects(prev => prev.filter(p => p.id !== id));
          setProjectOrder(prev => prev.filter(projectId => projectId !== id));
      }
  };

  const handlePomodoroComplete = (m: number) => {
      handleUpdateBalance(m, `专注奖励 ${m}min`);
      setTodayStats(s => ({ ...s, focusMinutes: s.focusMinutes + m }));
      setXp(prev => prev + m * 2); 
  };

  const handleTaskComplete = (task: Task) => {
      handleUpdateBalance(50, `任务完成: ${task.title}`);
      setTodayStats(s => ({ ...s, tasksCompleted: s.tasksCompleted + 1 }));
  };

  const handleNavigateToTaskCategory = (category: 'daily' | 'main' | 'random') => {
      setInitialTaskCategory(category);
      setCurrentView(View.RPG_MISSION_CENTER);
  };

  const renderView = () => {
    switch (currentView) {
      case View.COMMAND_CENTER:
        return <CommandCenter 
                 day={day} 
                 balance={balance} 
                 todayStats={todayStats} 
                 statsHistory={statsHistory}
                 reviews={reviews}
                 transactions={transactions}
                 projects={projects}
                 habits={habits}
                 onUpdateBalance={handleUpdateBalance}
                 onSaveReview={handleSaveReview}
                 onTaskComplete={handleTaskComplete}
                 onPomodoroComplete={handlePomodoroComplete}
                 theme={theme}
                 setView={setCurrentView}
                 onNavigateToCategory={handleNavigateToTaskCategory}
                 checkInStreak={checkInStreak}
                 totalHours={totalHours}
                 xp={xp}
                 totalKills={totalKills}
                 // Pomodoro Global State
                 timeLeft={pomodoroTimeLeft}
                 isActive={pomodoroIsActive}
                 duration={pomodoroDuration}
                 onToggleTimer={handleToggleTimer}
                 onResetTimer={handleResetTimer}
                 onChangeDuration={handleChangeDuration}
                 onUpdateTimeLeft={handleUpdateTimeLeft}
                 onUpdateIsActive={handleUpdateIsActive}
                 isNavCollapsed={isNavCollapsed}
                 setIsNavCollapsed={setIsNavCollapsed}
               />;
      case View.RPG_MISSION_CENTER:
        return <LifeGame 
                  theme={theme} 
                  balance={balance}
                  onUpdateBalance={handleUpdateBalance}
                  habits={habits}
                  projects={projects}
                  habitOrder={habitOrder}
                  projectOrder={projectOrder}
                  onUpdateHabitOrder={setHabitOrder}
                  onUpdateProjectOrder={setProjectOrder}
                  onToggleHabit={handleToggleHabit}
                  onUpdateHabit={handleUpdateHabit}
                  onDeleteHabit={handleDeleteHabit}
                  onUpdateProject={handleUpdateProject}
                  onDeleteProject={handleDeleteProject}
                  onAddHabit={handleAddHabit}
                  onAddProject={handleAddProject}
                  initialTab="battle"
                  initialCategory={initialTaskCategory}
                  onAddFloatingReward={addFloatingText}
                  totalTasksCompleted={totalKills}
                  totalHours={totalHours}
                  challengePool={challengePool}
                  setChallengePool={setChallengePool}
                  todaysChallenges={todaysChallenges}
                  completedRandomTasks={completedRandomTasks}
                  onToggleRandomChallenge={handleToggleRandomChallenge}
                  onStartAutoTask={handleStartAutoTask}
                  checkInStreak={checkInStreak}
                  onPomodoroComplete={handlePomodoroComplete}
                  xp={xp}
                  weeklyGoal={weeklyGoal}
                  setWeeklyGoal={setWeeklyGoal}
                  todayGoal={todayGoal}
                  setTodayGoal={setTodayGoal}
                  givenUpTasks={givenUpTasks} 
                  onGiveUpTask={handleGiveUpTask}
                  isNavCollapsed={isNavCollapsed}
                  setIsNavCollapsed={setIsNavCollapsed}
                  // Pomodoro Global State
                  timeLeft={pomodoroTimeLeft}
                  isActive={pomodoroIsActive}
                  duration={pomodoroDuration}
                  onToggleTimer={handleToggleTimer}
                  onResetTimer={handleResetTimer}
                  onChangeDuration={handleChangeDuration}
                  onUpdateTimeLeft={handleUpdateTimeLeft}
                  onUpdateIsActive={handleUpdateIsActive}
               />;
      case View.BLACK_MARKET:
        return <LifeGame 
                  theme={theme} 
                  balance={balance}
                  onUpdateBalance={handleUpdateBalance}
                  habits={habits}
                  projects={projects}
                  habitOrder={habitOrder}
                  projectOrder={projectOrder}
                  onUpdateHabitOrder={setHabitOrder}
                  onUpdateProjectOrder={setProjectOrder}
                  onToggleHabit={handleToggleHabit}
                  onUpdateHabit={handleUpdateHabit}
                  onDeleteHabit={handleDeleteHabit}
                  onUpdateProject={handleUpdateProject}
                  onDeleteProject={handleDeleteProject}
                  onAddHabit={handleAddHabit}
                  onAddProject={handleAddProject}
                  initialTab="shop"
                  initialCategory="daily"
                  onAddFloatingReward={addFloatingText}
                  totalTasksCompleted={totalKills}
                  totalHours={totalHours}
                  challengePool={challengePool}
                  setChallengePool={setChallengePool}
                  todaysChallenges={todaysChallenges}
                  completedRandomTasks={completedRandomTasks}
                  onToggleRandomChallenge={handleToggleRandomChallenge}
                  onStartAutoTask={handleStartAutoTask}
                  checkInStreak={checkInStreak}
                  onPomodoroComplete={handlePomodoroComplete}
                  xp={xp}
                  weeklyGoal={weeklyGoal}
                  setWeeklyGoal={setWeeklyGoal}
                  todayGoal={todayGoal}
                  setTodayGoal={setTodayGoal}
                  givenUpTasks={givenUpTasks}
                  onGiveUpTask={handleGiveUpTask}
                  isNavCollapsed={isNavCollapsed}
                  setIsNavCollapsed={setIsNavCollapsed}
                  // Pomodoro Global State
                  timeLeft={pomodoroTimeLeft}
                  isActive={pomodoroIsActive}
                  duration={pomodoroDuration}
                  onToggleTimer={handleToggleTimer}
                  onResetTimer={handleResetTimer}
                  onChangeDuration={handleChangeDuration}
                  onUpdateTimeLeft={handleUpdateTimeLeft}
                  onUpdateIsActive={handleUpdateIsActive}
               />;
      case View.HALL_OF_FAME:
        return <HallOfFame 
                  theme={theme} 
                  balance={balance}
                  totalHours={totalHours}
                  totalCampaignsWon={totalKills}
                  achievements={achievements}
                  setAchievements={setAchievements}
                  xp={xp}
                  checkInStreak={checkInStreak}
                  onPomodoroComplete={handlePomodoroComplete}
                  totalSpent={totalSpent}
                  claimedBadges={claimedBadges}
                  onClaimReward={handleClaimReward}
                  isNavCollapsed={isNavCollapsed}
                  setIsNavCollapsed={setIsNavCollapsed}
                  // Pomodoro Global State
                  timeLeft={pomodoroTimeLeft}
                  isActive={pomodoroIsActive}
                  duration={pomodoroDuration}
                  onToggleTimer={handleToggleTimer}
                  onResetTimer={handleResetTimer}
                  onChangeDuration={handleChangeDuration}
                  onUpdateTimeLeft={handleUpdateTimeLeft}
                  onUpdateIsActive={handleUpdateIsActive}
               />;
      case View.DATA_CHARTS:
        return <MissionControl 
                  theme={theme} 
                  projects={projects}
                  habits={habits}
               />;
      case View.PROJECT_MANUAL:
        return <ProjectManual theme={theme} />;
      case View.SETTINGS:
        return <Settings 
                  theme={theme} 
                  settings={settings} 
                  onUpdateSettings={handleUpdateSettings} 
                  onToggleTheme={handleToggleTheme} 
                />;
      default: return null;
    }
  };

  const bgClass = theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900';
  const entropy = Math.round((1 - (todayStats.habitsDone / Math.max(1, habits.length))) * 100);

  if (!isDataLoaded) {
      return (
          <div className="flex items-center justify-center h-screen bg-zinc-950 text-emerald-500 font-mono animate-pulse">
              系统内核初始化中... (INITIALIZING SYSTEM KERNEL...)
          </div>
      );
  }

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans relative transition-colors duration-500 ${bgClass}`}>
      <Navigation 
        currentView={currentView} 
        setView={setCurrentView} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        theme={theme}
        setTheme={setTheme}
        entropy={entropy} 
        isNavCollapsed={isNavCollapsed}
        setIsNavCollapsed={setIsNavCollapsed}
      />
      
      {/* GLOBAL REWARD POPUP */}
      {activeAchievement && <RewardModal badge={activeAchievement} onClose={handleClaimReward} />}

      {/* GLOBAL DAILY CHECK-IN */}
      <DailyCheckIn theme={theme} onClaim={handleDailyCheckIn} />

      <main className={`flex-1 h-full overflow-y-auto relative scroll-smooth flex flex-col transition-all duration-200`}>
        {theme === 'dark' ? (
             <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
                style={{
                backgroundImage: 'radial-gradient(circle at 50% 5%, #10b981 0%, transparent 20%), radial-gradient(circle at 90% 90%, #3b82f6 0%, transparent 20%)'
                }}>
            </div>
        ) : (
             <div className="absolute inset-0 z-0 pointer-events-none opacity-40"
                style={{
                backgroundImage: 'radial-gradient(circle at 50% 5%, #cbd5e1 0%, transparent 30%)'
                }}>
            </div>
        )}
       
        <div className="relative z-10 flex-1 overflow-y-auto">
          {renderView()}
        </div>
      </main>

      {floatingTexts.map(ft => (
          <div 
            key={ft.id}
            className={`fixed pointer-events-none text-2xl font-black ${ft.color} animate-bounce z-[9999]`}
            style={{ left: ft.x, top: ft.y, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
          >
              {ft.text}
          </div>
      ))}
    </div>
  );
};

export default App;