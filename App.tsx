import React, { useState, useEffect, useRef, useMemo } from 'react';
import Navigation from './components/Navigation';
import MissionControl from './components/MissionControl'; 
import LifeGame from './components/LifeGame';
import HallOfFame from './components/HallOfFame';
import Settings from './components/Settings';
import { View, Transaction, ReviewLog, Habit, Task, TaskType, DailyStats, Theme, Project, AttributeType, AchievementItem, AutoTask, AutoTaskType, SoundType } from './types';
import { Wallet, Crown, Clock, Brain, Zap, Target, Crosshair, Skull, Star, Gift, Medal, Sparkles, Swords, Flame, Footprints, Calendar, ShoppingBag, Dumbbell, Shield } from 'lucide-react';
import CharacterProfile, { getAllLevels, getAllFocusTitles, getAllWealthTitles, getAllMilitaryRanks, XP_PER_LEVEL, CharacterProfileHandle } from './components/CharacterProfile';
import confetti from 'canvas-confetti';

// 导入常量
import {
  CHECKIN_THRESHOLDS,
  getAllCheckInTitles,
  CONSUMPTION_THRESHOLDS,
  getAllConsumptionTitles,
  INITIAL_HABITS,
  INITIAL_PROJECTS,
  INITIAL_CHALLENGES,
  INITIAL_ACHIEVEMENTS
} from './constants/index';

// 导入共享组件
import RewardModal from './components/shared/RewardModal';




const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.RPG_MISSION_CENTER);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [theme, setTheme] = useState<Theme>('neomorphic');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Global "Game" State
  const [day, setDay] = useState(1); 
  const [balance, setBalance] = useState(60); // 用户备份数据中的初始余额
  const [xp, setXp] = useState(10); // 用户备份数据中的初始经验值
  const [checkInStreak, setCheckInStreak] = useState(1); // 用户备份数据中的初始签到 streak
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reviews, setReviews] = useState<ReviewLog[]>([]);
  
  // Pomodoro Timer State (Global)
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(25 * 60);
  const [pomodoroIsActive, setPomodoroIsActive] = useState(false);
  const [pomodoroDuration, setPomodoroDuration] = useState(25);
  
  // Immersive Mode State (Global)
  const [isImmersive, setIsImmersive] = useState(false);

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
  
  // 用户备份数据中的已解锁勋章
  const [claimedBadges, setClaimedBadges] = useState<string[]>(["class-吃土少年","class-泡面搭档","class-温饱及格","class-奶茶自由","class-外卖不看价"]);
  const [activeAchievement, setActiveAchievement] = useState<any>(null); 

  const [activeAutoTask, setActiveAutoTask] = useState<AutoTask | null>(null);

  const [statsHistory, setStatsHistory] = useState<{[key: number]: DailyStats}>({
    1: {
      focusMinutes: 10,
      tasksCompleted: 0,
      habitsDone: 1,
      earnings: 117,
      spending: 9
    }
  });
  const [todayStats, setTodayStats] = useState<DailyStats>({
      focusMinutes: 10,
      tasksCompleted: 0,
      habitsDone: 1,
      earnings: 117,
      spending: 9
  });

  const totalKills = todayStats.tasksCompleted + todayStats.habitsDone;
  const totalHours = (Object.values(statsHistory as Record<string, { focusMinutes: number }>).reduce((acc: number, curr) => acc + (curr.focusMinutes || 0), 0) / 60);
  const totalSpent = (Object.values(statsHistory).reduce((acc: number, curr: any) => acc + (curr.spending || 0), 0)) + todayStats.spending;

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

  // 添加超时机制，确保即使数据加载出现问题，页面也能最终显示出来
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isDataLoaded) {
        console.log('数据加载超时，强制设置为已加载状态');
        setIsDataLoaded(true);
      }
    }, 3000); // 3秒超时

    return () => clearTimeout(timeoutId);
  }, [isDataLoaded]);

  // Global Achievement Watcher
  useEffect(() => {
      if(!isDataLoaded) return;

      const checkAndTrigger = () => {
          const currentLevelInfo = getAllLevels().findIndex(l => xp < l.min) - 1; 
          const currentLevelVal = currentLevelInfo === -2 ? getAllLevels().length : currentLevelInfo + 1;

          const levelBadges = getAllLevels().map((l, idx) => { const levelValue = idx + 1; return { id: `lvl-${levelValue}`, title: l.title, subTitle: `LV.${levelValue}`, icon: idx%2===0 ? <Zap size={32} strokeWidth={3}/> : <Sparkles size={32} strokeWidth={3}/>, color: 'text-blue-500', isUnlocked: xp >= l.min, req: `达到等级 ${levelValue}`, min: l.min }; });
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
    
    // 只有非手动调整储备的交易才更新统计数据
    if (reason !== '手动调整储备金') {
      if (amount > 0) {
          setTodayStats(s => ({ ...s, earnings: s.earnings + amount }));
          // Play Coin Sound
          playSound("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
      } else {
          setTodayStats(s => ({ ...s, spending: s.spending - amount }));
          // Play Spend Sound
          playSound("https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3");
      }
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

  const handleGiveUpTask = (taskId: string) => {
      setGivenUpTasks(prev => [...prev, taskId]);
  };

  // Settings Handlers
  const handleUpdateSettings = (newSettings: any) => {
      setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleToggleTheme = () => {
      setTheme(prev => {
          if (prev === 'neomorphic') return 'light';
          if (prev === 'light') return 'dark';
          return 'neomorphic';
      });
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

  // Global Sound State
  const [currentSoundId, setCurrentSoundId] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Audio Handler
  const playSound = (url: string, type: SoundType = SoundType.SOUND_EFFECT) => {
      if ((type === SoundType.SOUND_EFFECT && !settings.enableSoundEffects) || (type === SoundType.BACKGROUND_MUSIC && !settings.enableBgMusic)) {
          return;
      }
      
      const volume = isMuted ? 0 : (type === SoundType.SOUND_EFFECT ? settings.soundEffectVolume : settings.bgMusicVolume);
      
      if (type === SoundType.BACKGROUND_MUSIC) {
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

  // Handle Sound Change
  const handleSoundChange = (soundId: string) => {
      setCurrentSoundId(soundId);
      // Get sound URL from sound library or default
      const SOUNDS = [
          { id: 'forest', name: '迷雾森林', url: "https://assets.mixkit.co/active_storage/sfx/2441/2441-preview.mp3" },
          { id: 'alpha', name: '阿尔法波', url: "https://assets.mixkit.co/active_storage/sfx/243/243-preview.mp3" },
          { id: 'theta', name: '希塔波', url: "https://assets.mixkit.co/active_storage/sfx/244/244-preview.mp3" },
          { id: 'beta', name: '贝塔波', url: "https://assets.mixkit.co/active_storage/sfx/1126/1126-preview.mp3" },
          { id: 'ocean', name: '海浪声', url: "https://assets.mixkit.co/active_storage/sfx/2441/2441-preview.mp3" },
          { id: 'rain', name: '雨声', url: "https://assets.mixkit.co/active_storage/sfx/2442/2442-preview.mp3" },
          { id: 'night', name: '夏夜虫鸣', url: "https://assets.mixkit.co/active_storage/sfx/2443/2443-preview.mp3" },
          { id: 'white-noise', name: '白噪音', url: "https://assets.mixkit.co/active_storage/sfx/2444/2444-preview.mp3" },
          { id: 'pink-noise', name: '粉红噪音', url: "https://assets.mixkit.co/active_storage/sfx/2445/2445-preview.mp3" },
          { id: 'brown-noise', name: '布朗噪音', url: "https://assets.mixkit.co/active_storage/sfx/2446/2446-preview.mp3" },
          { id: 'cafe', name: '咖啡馆环境', url: "https://assets.mixkit.co/active_storage/sfx/2447/2447-preview.mp3" },
          { id: 'fireplace', name: '壁炉声', url: "https://assets.mixkit.co/active_storage/sfx/2448/2448-preview.mp3" },
      ];
      const sound = SOUNDS.find(s => s.id === soundId) || SOUNDS[0];
      playSound(sound.url, SoundType.BACKGROUND_MUSIC);
  };

  // Handle Mute Toggle
  const handleMuteToggle = () => {
      setIsMuted(!isMuted);
      if (bgMusicRef.current) {
          bgMusicRef.current.volume = isMuted ? (settings.enableBgMusic ? settings.bgMusicVolume : 0) : 0;
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

  const handleStartAutoTask = (type: AutoTaskType, id: string, duration: number, subId?: string) => {
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
      const h: Habit = { id: Date.now().toString(), name, reward, xp: Math.ceil(reward * 1.5), duration: reward, streak: 0, color: '#8b5cf6', attr: AttributeType.DISCIPLINE, archived: false, history: {}, logs: {} };
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
      
      // 更新项目的每日专注时间，确保专注时间趋势图表实时更新
      const today = new Date().toLocaleDateString();
      setProjects(prevProjects => prevProjects.map(project => {
          // 更新第一个活跃项目的专注时间（可以根据实际需要选择项目）
          if (project.status === 'active') {
              return {
                  ...project,
                  todayFocusMinutes: project.todayFocusMinutes + m,
                  dailyFocus: {
                      ...project.dailyFocus,
                      [today]: (project.dailyFocus[today] || 0) + m
                  }
              };
          }
          return project;
      }));
  };

  const handleTaskComplete = (task: Task) => {
      handleUpdateBalance(50, `任务完成: ${task.text || '未知任务'}`);
      setTodayStats(s => ({ ...s, tasksCompleted: s.tasksCompleted + 1 }));
  };

  const handleNavigateToTaskCategory = (category: 'daily' | 'main' | 'random') => {
      setInitialTaskCategory(category);
      setCurrentView(View.RPG_MISSION_CENTER);
  };

  const renderView = () => {
    switch (currentView) {

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
                  todayStats={todayStats}
                  statsHistory={statsHistory}
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
                  // Immersive Mode State
                  isImmersive={isImmersive}
                  setIsImmersive={setIsImmersive}
                  // Audio Management
                  isMuted={isMuted}
                  currentSoundId={currentSoundId}
                  onToggleMute={handleMuteToggle}
                  onSoundChange={handleSoundChange}
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
                  todayStats={todayStats}
                  statsHistory={statsHistory}
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
                  // Immersive Mode State
                  isImmersive={isImmersive}
                  setIsImmersive={setIsImmersive}
                  // Audio Management
                  isMuted={isMuted}
                  currentSoundId={currentSoundId}
                  onToggleMute={handleMuteToggle}
                  onSoundChange={handleSoundChange}
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

  const bgClass = theme === 'dark' 
      ? 'bg-zinc-950 text-zinc-100' 
      : theme === 'light' 
      ? 'bg-slate-50 text-slate-900' 
      : 'bg-[#e0e5ec] text-zinc-800'; // 拟态风格：高饱和度灰蓝色背景，低对比度文字，与导航栏背景一致
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
      {/* Conditionally render Navigation based on immersive mode */}
      {!isImmersive && (
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
      )}
      
      {/* GLOBAL REWARD POPUP */}
      {activeAchievement && <RewardModal badge={activeAchievement} onClose={handleClaimReward} />}

      {/* 统一背景，消除侧边栏和主体的颜色割裂 */}
      <main className={`flex-1 h-full overflow-y-auto relative scroll-smooth flex flex-col transition-all duration-200 ${bgClass}`}>
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