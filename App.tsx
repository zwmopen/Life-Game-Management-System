import React, { useState, useEffect, useRef, useMemo } from 'react';
import Navigation from './components/Navigation';
import MissionControl from './components/MissionControl'; 
import LifeGame from './components/LifeGame';
import HallOfFame from './components/HallOfFame';
import Settings from './components/Settings';
import { View, Transaction, ReviewLog, Habit, Task, TaskType, DailyStats, Theme, Project, AttributeType, AchievementItem, AutoTask, AutoTaskType, SoundType, DiceState, DiceTask, DiceCategory, DiceHistory } from './types';
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
  INITIAL_ACHIEVEMENTS,
  INITIAL_DICE_STATE
} from './constants/index';

// 导入共享组件
import RewardModal from './components/shared/RewardModal';

// 导入模块化 hooks
import { usePomodoro } from './features/pomodoro';
import { useDice } from './features/dice';
import { useAchievements } from './features/achievements';
import { useStorage } from './features/storage';
import { useStats } from './features/stats';



const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.RPG_MISSION_CENTER);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>('neomorphic');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Global "Game" State
  const [day, setDay] = useState(1); 
  const [balance, setBalance] = useState(60); // 用户备份数据中的初始余额
  const [xp, setXp] = useState(10); // 用户备份数据中的初始经验值
  const [checkInStreak, setCheckInStreak] = useState(1); // 用户备份数据中的初始签到 streak
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reviews, setReviews] = useState<ReviewLog[]>([]);
  
  // Immersive Mode State (Global)
  const [isImmersive, setIsImmersive] = useState(false);

  // 使用模块化 hooks
  const { pomodoroState, toggleTimer, resetTimer, changeDuration, updateTimeLeft, updateIsActive } = usePomodoro();
  
  const characterProfileRef = useRef<CharacterProfileHandle>(null);

  // Settings State
  const [settings, setSettings] = useState({ 
    bgMusicVolume: 0.5, 
    soundEffectVolume: 0.7, 
    enableBgMusic: true, 
    enableSoundEffects: true,
    enableNotifications: true,
    guideCardConfig: {
      fontSize: 'medium' as const,
      borderRadius: 'medium' as const,
      shadowIntensity: 'medium' as const,
      showUnderlyingPrinciple: true
    },
    enableTaskCompleteNotifications: true,
    enableAchievementNotifications: true,
    enablePomodoroNotifications: true,
    showExperienceBar: true,
    showBalance: true,
    showTaskCompletionRate: true,
    soundEffectsByLocation: {},
    soundLibrary: {},
    // Display Settings (all enabled by default)
    showCharacterSystem: true,
    showPomodoroSystem: true,
    showFocusTimeSystem: true,
    showCheckinSystem: true,
    showAchievementCollectionRate: true,
    showSystemStabilityModule: true,
    showLatestBadges: true,
    showChartSummary: true,
    showSupplyMarket: true
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

  const [activeAutoTask, setActiveAutoTask] = useState<AutoTask | null>(null);
  
  // 使用模块化 hooks
  const { diceState, setDiceState } = useDice(isDataLoaded);

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

  // 使用模块化 hooks
  const { totalKills, totalHours, totalSpent } = useStats(statsHistory, todayStats);

  // --- Persistence Engine ---
  useEffect(() => {
    const savedGlobal = localStorage.getItem('aes-global-data-v3');
    const savedLifeGame = localStorage.getItem('life-game-stats-v2');
    const streakStr = localStorage.getItem('aes-checkin-streak');
    const savedDiceState = localStorage.getItem('aes-dice-state');

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

    // 加载命运骰子状态
  if (savedDiceState) {
    try {
      const diceData = JSON.parse(savedDiceState);
      const todayStr = new Date().toLocaleDateString();
      
      // 如果是新的一天，重置次数和任务列表
      if (diceData.lastClickDate !== todayStr) {
        setDiceState(prev => ({
          ...prev,
          todayCount: 0,
          lastClickDate: todayStr,
          pendingTasks: [],
          completedTasks: []
        }));
      } else {
        // 确保新字段存在
        setDiceState({
          ...diceData,
          pendingTasks: diceData.pendingTasks || [],
          completedTasks: diceData.completedTasks || []
        });
      }
    } catch (e) {
      console.error("Dice save corrupted", e);
      setDiceState(INITIAL_DICE_STATE);
    }
  } else {
    // 首次使用，初始化骰子状态
    setDiceState(INITIAL_DICE_STATE);
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

  // 使用模块化 hooks
  const { activeAchievement, setActiveAchievement } = useAchievements(
    xp, balance, totalHours, totalKills, checkInStreak, totalSpent, claimedBadges, isDataLoaded
  );


  useEffect(() => {
      if (!isDataLoaded) return;
      const todayStr = new Date().toLocaleDateString();
      if (todaysChallenges.date !== todayStr) {
          const shuffled = [...challengePool].sort(() => 0.5 - Math.random());
          setTodaysChallenges({
              date: todayStr,
              tasks: shuffled.slice(0, 3)
          });
      }
  }, [isDataLoaded, challengePool, todaysChallenges]);

  // 保存命运骰子状态到localStorage
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('aes-dice-state', JSON.stringify(diceState));
    }
  }, [diceState, isDataLoaded]);

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

  // 每日自动刷新任务功能
  useEffect(() => {
    // 计算当前时间到凌晨0:00的毫秒数
    const calculateTimeUntilMidnight = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow.getTime() - now.getTime();
    };

    // 重置所有任务状态的函数
    const resetAllTasks = () => {
      // 重置所有习惯任务的历史记录
      setHabits(prevHabits => prevHabits.map(habit => ({
        ...habit,
        history: {}, // 清空历史记录
        streak: 0 // 重置连续天数
      })));

      // 重置所有项目任务的子任务状态
      setProjects(prevProjects => prevProjects.map(project => ({
        ...project,
        subTasks: project.subTasks.map(subTask => ({
          ...subTask,
          completed: false
        })),
        status: 'active' // 重置项目状态为活跃
      })));

      // 清空已放弃任务列表
      setGivenUpTasks([]);

      // 重置今日统计数据
      setTodayStats({ focusMinutes: 0, tasksCompleted: 0, habitsDone: 0, earnings: 0, spending: 0 });

      // 生成新的每日挑战
      const todayStr = new Date().toLocaleDateString();
      const shuffled = [...challengePool].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      setTodaysChallenges({ date: todayStr, tasks: selected });
      setCompletedRandomTasks(prev => ({ ...prev, [todayStr]: [] }));
    };

    // 设置初始定时器
    let timeoutId = setTimeout(() => {
      resetAllTasks();
      // 之后每天凌晨0:00执行一次
      const dailyInterval = 24 * 60 * 60 * 1000;
      timeoutId = setInterval(resetAllTasks, dailyInterval);
    }, calculateTimeUntilMidnight());

    return () => {
      clearTimeout(timeoutId);
      clearInterval(timeoutId);
    };
  }, [challengePool]);

  useEffect(() => {
      if(isDataLoaded) {
          setStatsHistory(prev => ({ ...prev, [day]: todayStats }));
      }
  }, [todayStats, day, isDataLoaded]);

  const [floatingTexts, setFloatingTexts] = useState<{id: number, text: string, x: number, y: number, color: string}[]>([]);

  // 处理角色等级变化
  const handleLevelChange = (newLevel: number, type: 'level' | 'focus' | 'wealth') => {
    // 根据等级类型重置相关数据
    switch (type) {
      case 'level':
        // 重置经验等级相关勋章
        setClaimedBadges(prev => prev.filter(badge => !badge.startsWith('class-')));
        // 设置新的经验值，使其刚好达到新等级的阈值
        const newXpThreshold = getAllLevels()[newLevel - 1]?.min || 0;
        setXp(newXpThreshold);
        break;
      case 'focus':
        // 重置专注等级相关勋章
        setClaimedBadges(prev => prev.filter(badge => !badge.startsWith('focus-')));
        // 重置专注时间相关的统计数据
        setStatsHistory({});
        setTodayStats(prev => ({ ...prev, focusMinutes: 0 }));
        break;
      case 'wealth':
        // 重置财富等级相关勋章
        setClaimedBadges(prev => prev.filter(badge => !badge.startsWith('wealth-')));
        // 重置余额和相关统计
        setBalance(0);
        setTodayStats(prev => ({ ...prev, earnings: 0, spending: 0 }));
        break;
    }
    
    // 显示成功提示
    addFloatingText(`${type === 'level' ? '经验' : type === 'focus' ? '专注' : '财富'}等级已更新为${newLevel}`, 'text-yellow-500');
  };

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
      }, 1500); 
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
      // 放弃任务时触发命运骰子
      spinDice();
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
      if (settings.enableBgMusic) {
          // 创建音频对象但默认不自动播放，只有用户明确点击时才播放
          if (!bgMusicRef.current) {
              const defaultSound = {
                  id: 'forest',
                  name: '迷雾森林',
                  url: "https://assets.mixkit.co/active_storage/sfx/2441/2441-preview.mp3"
              };
              bgMusicRef.current = new Audio(defaultSound.url);
              bgMusicRef.current.loop = true;
              // 设置音量但不播放
              bgMusicRef.current.volume = settings.bgMusicVolume;
          }
      } else if (bgMusicRef.current) {
          bgMusicRef.current.pause();
      }
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
                  // 检查哪些子任务从非完成状态变为完成状态，或从完成状态变为非完成状态
                  const prevCompletedSubTasks = p.subTasks.filter(t => t.completed).length;
                  const newCompletedSubTasks = updatedProject.subTasks.filter(t => t.completed).length;
                  const diff = newCompletedSubTasks - prevCompletedSubTasks;
                  
                  if (diff > 0) {
                      // 子任务完成：添加奖励
                      for (let i = 0; i < diff; i++) {
                          handleUpdateBalance(10, `完成子任务: ${p.name}`);
                          setXp(prev => prev + 10);
                          setTodayStats(s => ({ 
                              ...s, 
                              focusMinutes: s.focusMinutes + 10,
                              tasksCompleted: s.tasksCompleted + 1 // 完成子任务增加歼敌数
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
                  } else if (diff < 0) {
                      // 子任务撤销：回退奖励
                      const undoneCount = Math.abs(diff);
                      for (let i = 0; i < undoneCount; i++) {
                          handleUpdateBalance(-10, `撤销子任务: ${p.name}`);
                          setXp(prev => Math.max(0, prev - 10));
                          setTodayStats(s => ({ 
                              ...s, 
                              focusMinutes: Math.max(0, s.focusMinutes - 10),
                              tasksCompleted: Math.max(0, s.tasksCompleted - 1) // 撤销子任务减少歼敌数
                          }));
                          
                          // 统一撤销通知
                          setTimeout(() => {
                              addFloatingText(`-10 金币`, 'text-red-500', window.innerWidth / 2 - 80);
                          }, i * 300);
                          
                          setTimeout(() => {
                              addFloatingText(`-10 经验`, 'text-red-500', window.innerWidth / 2);
                          }, i * 300 + 300);
                          
                          setTimeout(() => {
                              addFloatingText(`-10 专注时间`, 'text-red-500', window.innerWidth / 2 + 80);
                          }, i * 300 + 600);
                      }
                  }
                  
                  const allDone = updatedProject.subTasks.length > 0 && updatedProject.subTasks.every(t => t.completed);
                  if (allDone && p.status !== 'completed') {
                      // 主线任务完成：添加奖励
                      updatedProject.status = 'completed';
                      handleUpdateBalance(100, `战役胜利: ${p.name}`);
                      addFloatingText('战役胜利！获得奖励', 'text-yellow-400');
                      setXp(prev => prev + 200);
                      addFloatingText('+200 经验', 'text-blue-500', window.innerWidth / 2);
                  } else if (!allDone && p.status === 'completed') {
                      // 主线任务撤销完成：回退奖励
                      updatedProject.status = 'active';
                      handleUpdateBalance(-100, `撤销战役胜利: ${p.name}`);
                      setXp(prev => Math.max(0, prev - 200));
                      addFloatingText('-200 经验', 'text-red-500', window.innerWidth / 2);
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

  // --- 命运骰子核心逻辑 --- //

  // 检查今日是否还有次数
  const checkDiceAvailability = () => {
    const todayStr = new Date().toLocaleDateString();
    if (diceState.lastClickDate !== todayStr) {
      // 新的一天，重置次数
      setDiceState(prev => ({
        ...prev,
        todayCount: 0,
        lastClickDate: todayStr
      }));
      return true;
    }
    return diceState.todayCount < diceState.config.dailyLimit;
  };

  // 生成随机奖励值
  const generateRandomReward = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // 旋转骰子，随机生成结果
  const spinDice = () => {
    const todayStr = new Date().toLocaleDateString();
    
    // 检查次数
    if (!checkDiceAvailability()) {
      return { success: false, message: '今日骰子次数已用完，明天再来玩吧' };
    }
    
    // 播放骰子滚动音效
    playSound("https://assets.mixkit.co/sfx/preview/mixkit-rolling-dice-1911.mp3");
    
    // 开始旋转动画
    setDiceState(prev => ({
      ...prev,
      isSpinning: true
    }));
    
    // 根据权重选择分类
    const categories = Object.entries(diceState.config.categoryDistribution);
    const totalWeight = categories.reduce((sum, [_, weight]) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    let selectedCategory: DiceCategory;
    
    for (const [category, weight] of categories) {
      if (random < weight) {
        selectedCategory = category as DiceCategory;
        break;
      }
      random -= weight;
    }
    
    // 从选中的分类中随机选择一个任务，避免短时间内重复
    const categoryTasks = diceState.taskPool[selectedCategory as DiceCategory];
    const availableTasks = categoryTasks.filter(task => {
      // 检查最近是否已经抽到过这个任务
      const recentHistory = diceState.history.slice(-5);
      return !recentHistory.some(record => record.taskId === task.id);
    });
    
    const task = availableTasks.length > 0 
      ? availableTasks[Math.floor(Math.random() * availableTasks.length)]
      : categoryTasks[Math.floor(Math.random() * categoryTasks.length)];
    
    // 生成随机奖励
    const gold = generateRandomReward(task.goldRange[0], task.goldRange[1]);
    const xp = task.xpRange 
      ? generateRandomReward(task.xpRange[0], task.xpRange[1])
      : 0;
    
    // 模拟旋转动画结束
    setTimeout(() => {
      // 播放惊喜音效
      playSound("https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3");
      
      setDiceState(prev => ({
        ...prev,
        isSpinning: false,
        currentResult: {
          ...task,
          // 保存随机生成的奖励值
          _generatedGold: gold,
          _generatedXp: xp
        } as any,
        todayCount: prev.todayCount + 1
      }));
    }, 1500);
    
    return { success: true };
  };

  // 处理骰子结果
  const handleDiceResult = (result: 'completed' | 'skipped' | 'later') => {
    if (!diceState.currentResult) return;
    
    const task = diceState.currentResult;
    const gold = (task as any)._generatedGold || 0;
    const xp = (task as any)._generatedXp || 0;
    
    if (result === 'completed') {
      // 完成任务，发放奖励
      handleUpdateBalance(gold, `命运骰子: ${task.text}`);
      setXp(prev => prev + xp);
      setTodayStats(s => ({
        ...s,
        tasksCompleted: s.tasksCompleted + 1,
        focusMinutes: s.focusMinutes + (task.duration || 0)
      }));
      
      // 添加浮动奖励
      addFloatingText(`+${gold} 金币`, 'text-yellow-500', window.innerWidth / 2 - 80);
      setTimeout(() => {
        addFloatingText(`+${xp} 经验`, 'text-blue-500', window.innerWidth / 2);
      }, 300);
      if (task.duration) {
        setTimeout(() => {
          addFloatingText(`+${task.duration} 专注时间`, 'text-green-500', window.innerWidth / 2 + 80);
        }, 600);
      }
    }
    
    // 记录历史
    const historyRecord: DiceHistory = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      taskId: task.id,
      text: task.text,
      category: task.category,
      gold,
      xp,
      result,
      completedAt: result === 'completed' ? new Date().toISOString() : undefined
    };
    
    // 更新任务列表
    if (result === 'later' || result === 'completed') {
      const taskRecord = {
        id: Date.now().toString(),
        task,
        generatedGold: gold,
        generatedXp: xp,
        status: result === 'completed' ? 'completed' as const : 'pending' as const,
        createdAt: new Date().toISOString(),
        completedAt: result === 'completed' ? new Date().toISOString() : undefined
      };
      
      setDiceState(prev => ({
        ...prev,
        history: [historyRecord, ...prev.history].slice(0, 100), // 保留最近100条记录
        completedTaskIds: result === 'completed' 
          ? [...prev.completedTaskIds, task.id]
          : prev.completedTaskIds,
        currentResult: undefined,
        pendingTasks: result === 'later' 
          ? [...prev.pendingTasks, taskRecord]
          : prev.pendingTasks.filter(t => t.task.id !== task.id),
        completedTasks: result === 'completed' 
          ? [...prev.completedTasks, taskRecord]
          : prev.completedTasks
      }));
    } else {
      // 如果是跳过，不添加到任务列表
      setDiceState(prev => ({
        ...prev,
        history: [historyRecord, ...prev.history].slice(0, 100),
        completedTaskIds: prev.completedTaskIds,
        currentResult: undefined
      }));
    }
  };

  // 添加命运骰子任务
  const addDiceTask = (task: DiceTask) => {
    setDiceState(prev => ({
      ...prev,
      taskPool: {
        ...prev.taskPool,
        [task.category]: [...prev.taskPool[task.category], task]
      }
    }));
  };

  // 删除命运骰子任务
  const deleteDiceTask = (taskId: string, category: DiceCategory) => {
    setDiceState(prev => ({
      ...prev,
      taskPool: {
        ...prev.taskPool,
        [category]: prev.taskPool[category].filter(task => task.id !== taskId)
      }
    }));
  };

  // 更新命运骰子任务
  const updateDiceTask = (taskId: string, category: DiceCategory, updates: Partial<DiceTask>) => {
    setDiceState(prev => ({
      ...prev,
      taskPool: {
        ...prev.taskPool,
        [category]: prev.taskPool[category].map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      }
    }));
  };

  // 更新骰子配置
  const updateDiceConfig = (config: Partial<DiceState['config']>) => {
    setDiceState(prev => ({
      ...prev,
      config: { ...prev.config, ...config }
    }));
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
                  timeLeft={pomodoroState.timeLeft}
                  isActive={pomodoroState.isActive}
                  duration={pomodoroState.duration}
                  onToggleTimer={toggleTimer}
                  onResetTimer={resetTimer}
                  onChangeDuration={changeDuration}
                  onUpdateTimeLeft={updateTimeLeft}
                  onUpdateIsActive={updateIsActive}
                  // Immersive Mode State
                  isImmersive={isImmersive}
                  setIsImmersive={setIsImmersive}
                  // Audio Management
                  isMuted={isMuted}
                  currentSoundId={currentSoundId}
                  onToggleMute={handleMuteToggle}
                  onSoundChange={handleSoundChange}
                  // Settings
                  settings={settings}
                  // 命运骰子相关
                  diceState={diceState}
                  onSpinDice={spinDice}
                  onDiceResult={handleDiceResult}
                  onAddDiceTask={addDiceTask}
                  onDeleteDiceTask={deleteDiceTask}
                  onUpdateDiceTask={updateDiceTask}
                  onUpdateDiceConfig={updateDiceConfig}
                  // 角色等级变化回调
                  onLevelChange={handleLevelChange}
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
                  timeLeft={pomodoroState.timeLeft}
                  isActive={pomodoroState.isActive}
                  duration={pomodoroState.duration}
                  onToggleTimer={toggleTimer}
                  onResetTimer={resetTimer}
                  onChangeDuration={changeDuration}
                  onUpdateTimeLeft={updateTimeLeft}
                  onUpdateIsActive={updateIsActive}
                  // Immersive Mode State
                  isImmersive={isImmersive}
                  setIsImmersive={setIsImmersive}
                  // Audio Management
                  isMuted={isMuted}
                  currentSoundId={currentSoundId}
                  onToggleMute={handleMuteToggle}
                  onSoundChange={handleSoundChange}
                  // Settings
                  settings={settings}
                  // 命运骰子相关
                  diceState={diceState}
                  onSpinDice={spinDice}
                  onDiceResult={handleDiceResult}
                  onAddDiceTask={addDiceTask}
                  onDeleteDiceTask={deleteDiceTask}
                  onUpdateDiceTask={updateDiceTask}
                  onUpdateDiceConfig={updateDiceConfig}
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
                  timeLeft={pomodoroState.timeLeft}
                  isActive={pomodoroState.isActive}
                  duration={pomodoroState.duration}
                  onToggleTimer={toggleTimer}
                  onResetTimer={resetTimer}
                  onChangeDuration={changeDuration}
                  onUpdateTimeLeft={updateTimeLeft}
                  onUpdateIsActive={updateIsActive}
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
            className={`fixed pointer-events-none text-xl sm:text-2xl font-black ${ft.color} animate-bounce z-[9999]`}
            style={{ left: ft.x, top: ft.y, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
          >
              {ft.text}
          </div>
      ))}
    </div>
  );
};

export default App;