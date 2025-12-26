import { useState, useEffect } from 'react';
import { Habit, Project, Transaction, ReviewLog, AchievementItem, DailyStats } from '../../types';
import { INITIAL_HABITS, INITIAL_PROJECTS, INITIAL_CHALLENGES, INITIAL_ACHIEVEMENTS } from '../../constants/index';

export interface StorageData {
  habits: Habit[];
  projects: Project[];
  habitOrder: string[];
  projectOrder: string[];
  balance: number;
  day: number;
  transactions: Transaction[];
  reviews: ReviewLog[];
  statsHistory: Record<number, DailyStats>;
  todayStats: DailyStats;
  challengePool: string[];
  todaysChallenges: { date: string; tasks: string[] };
  achievements: AchievementItem[];
  completedRandomTasks: Record<string, string[]>;
  claimedBadges: string[];
  givenUpTasks: string[];
  weeklyGoal: string;
  todayGoal: string;
}

export const useStorage = (setIsDataLoaded: React.Dispatch<React.SetStateAction<boolean>>) => {
  // 初始化状态
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [habitOrder, setHabitOrder] = useState<string[]>(INITIAL_HABITS.map(h => h.id));
  const [projectOrder, setProjectOrder] = useState<string[]>(INITIAL_PROJECTS.map(p => p.id));
  const [balance, setBalance] = useState(60);
  const [day, setDay] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reviews, setReviews] = useState<ReviewLog[]>([]);
  const [statsHistory, setStatsHistory] = useState<Record<number, DailyStats>>({});
  const [todayStats, setTodayStats] = useState<DailyStats>({
    focusMinutes: 0,
    tasksCompleted: 0,
    habitsDone: 0,
    earnings: 0,
    spending: 0
  });
  const [challengePool, setChallengePool] = useState<string[]>(INITIAL_CHALLENGES);
  const [todaysChallenges, setTodaysChallenges] = useState<{ date: string; tasks: string[] }>({ date: '', tasks: [] });
  const [achievements, setAchievements] = useState<AchievementItem[]>(INITIAL_ACHIEVEMENTS);
  const [completedRandomTasks, setCompletedRandomTasks] = useState<Record<string, string[]>>({});
  const [claimedBadges, setClaimedBadges] = useState<string[]>(["class-吃土少年","class-泡面搭档","class-温饱及格","class-奶茶自由","class-外卖不看价"]);
  const [givenUpTasks, setGivenUpTasks] = useState<string[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState("本周战役：攻占「项目初稿」高地");
  const [todayGoal, setTodayGoal] = useState("今日核心：完成核心模块代码");
  const [xp, setXp] = useState(10);
  const [checkInStreak, setCheckInStreak] = useState(1);

  // 加载数据
  useEffect(() => {
    const savedGlobal = localStorage.getItem('aes-global-data-v3');
    const savedLifeGame = localStorage.getItem('life-game-stats-v2');
    const streakStr = localStorage.getItem('aes-checkin-streak');

    if (streakStr) setCheckInStreak(parseInt(streakStr));

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
                subTasks: p.subTasks.map(st => ({ ...st, completed: false }))
            }));
            setTodayStats({ focusMinutes: 0, tasksCompleted: 0, habitsDone: 0, earnings: 0, spending: 0 });
            setGivenUpTasks([]);
        } else {
            setTodayStats(data.todayStats || {
                focusMinutes: 0, tasksCompleted: 0, habitsDone: 0, earnings: 0, spending: 0
            });
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
            setXp(0);
        }
    }

    // 设置为已加载
    setIsDataLoaded(true);
  }, [setIsDataLoaded]);

  // 保存数据
  useEffect(() => {
    const todayStr = new Date().toLocaleDateString();
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
        givenUpTasks,
        lastLoginDate: todayStr,
        startDate: localStorage.getItem('aes-global-data-v3') ? 
            JSON.parse(localStorage.getItem('aes-global-data-v3')!).startDate : 
            new Date().toISOString()
    };
    localStorage.setItem('aes-global-data-v3', JSON.stringify(data));
    
    const lgStats = localStorage.getItem('life-game-stats-v2') ? 
        JSON.parse(localStorage.getItem('life-game-stats-v2')!) : {};
    localStorage.setItem('life-game-stats-v2', JSON.stringify({ ...lgStats, xp }));
  }, [
    habits, projects, habitOrder, projectOrder, balance, day, 
    transactions, reviews, statsHistory, todayStats, challengePool, 
    todaysChallenges, achievements, completedRandomTasks, claimedBadges, 
    weeklyGoal, todayGoal, givenUpTasks, xp
  ]);

  // 保存签到 streak
  useEffect(() => {
    localStorage.setItem('aes-checkin-streak', checkInStreak.toString());
  }, [checkInStreak]);

  // 挑战任务初始化
  useEffect(() => {
    const todayStr = new Date().toLocaleDateString();
    if (todaysChallenges.date !== todayStr) {
        const shuffled = [...challengePool].sort(() => 0.5 - Math.random());
        setTodaysChallenges({
            date: todayStr,
            tasks: shuffled.slice(0, 3)
        });
    }
  }, [challengePool, todaysChallenges]);

  return {
    habits,
    setHabits,
    projects,
    setProjects,
    habitOrder,
    setHabitOrder,
    projectOrder,
    setProjectOrder,
    balance,
    setBalance,
    day,
    setDay,
    transactions,
    setTransactions,
    reviews,
    setReviews,
    statsHistory,
    setStatsHistory,
    todayStats,
    setTodayStats,
    challengePool,
    setChallengePool,
    todaysChallenges,
    setTodaysChallenges,
    achievements,
    setAchievements,
    completedRandomTasks,
    setCompletedRandomTasks,
    claimedBadges,
    setClaimedBadges,
    givenUpTasks,
    setGivenUpTasks,
    weeklyGoal,
    setWeeklyGoal,
    todayGoal,
    setTodayGoal,
    xp,
    setXp,
    checkInStreak,
    setCheckInStreak
  };
};
