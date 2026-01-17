import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Habit, Project, Transaction, ReviewLog, AchievementItem, DiceState, DailyStats, Settings } from '../types';

// 定义应用状态类型
interface GameState {
  day: number;
  balance: number;
  xp: number;
  checkInStreak: number;
  transactions: Transaction[];
  reviews: ReviewLog[];
  habits: Habit[];
  projects: Project[];
  habitOrder: string[];
  projectOrder: string[];
  challengePool: string[];
  todaysChallenges: { date: string, tasks: string[] };
  achievements: AchievementItem[];
  completedRandomTasks: { [date: string]: string[] };
  givenUpTasks: string[];
  claimedBadges: string[];
  activeAutoTask: any; // 使用any是因为AutoTask类型可能需要调整
  statsHistory: { [key: number]: DailyStats };
  todayStats: DailyStats;
  diceState: DiceState;
  settings: Settings;
  weeklyGoal: string;
  todayGoal: string;
  isImmersive: boolean;
  useInternalImmersive: boolean;
}

// 定义动作类型
type GameStateAction =
  | { type: 'SET_DAY'; payload: number }
  | { type: 'SET_BALANCE'; payload: number }
  | { type: 'SET_XP'; payload: number }
  | { type: 'SET_CHECK_IN_STREAK'; payload: number }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_REVIEW'; payload: ReviewLog }
  | { type: 'UPDATE_HABITS'; payload: Habit[] }
  | { type: 'UPDATE_PROJECTS'; payload: Project[] }
  | { type: 'UPDATE_HABIT_ORDER'; payload: string[] }
  | { type: 'UPDATE_PROJECT_ORDER'; payload: string[] }
  | { type: 'UPDATE_HABIT'; payload: { id: string; updates: Partial<Habit> } }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_CHALLENGE_POOL'; payload: string[] }
  | { type: 'UPDATE_TODAYS_CHALLENGES'; payload: { date: string, tasks: string[] } }
  | { type: 'UPDATE_ACHIEVEMENTS'; payload: AchievementItem[] }
  | { type: 'UPDATE_COMPLETED_RANDOM_TASKS'; payload: { [date: string]: string[] } }
  | { type: 'ADD_GIVEN_UP_TASK'; payload: string }
  | { type: 'REMOVE_GIVEN_UP_TASK'; payload: string }
  | { type: 'UPDATE_CLAIMED_BADGES'; payload: string[] }
  | { type: 'UPDATE_ACTIVE_AUTO_TASK'; payload: any }
  | { type: 'UPDATE_STATS_HISTORY'; payload: { [key: number]: DailyStats } }
  | { type: 'UPDATE_TODAY_STATS'; payload: DailyStats }
  | { type: 'UPDATE_DICE_STATE'; payload: DiceState }
  | { type: 'UPDATE_SETTINGS'; payload: Settings }
  | { type: 'UPDATE_WEEKLY_GOAL'; payload: string }
  | { type: 'UPDATE_TODAY_GOAL'; payload: string }
  | { type: 'SET_IMMERSIVE'; payload: boolean }
  | { type: 'SET_USE_INTERNAL_IMMERSIVE'; payload: boolean };

// Reducer函数
const gameStateReducer = (state: GameState, action: GameStateAction): GameState => {
  switch (action.type) {
    case 'SET_DAY':
      return { ...state, day: action.payload };
    case 'SET_BALANCE':
      return { ...state, balance: action.payload };
    case 'SET_XP':
      return { ...state, xp: action.payload };
    case 'SET_CHECK_IN_STREAK':
      return { ...state, checkInStreak: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'ADD_REVIEW':
      return { ...state, reviews: [...state.reviews, action.payload] };
    case 'UPDATE_HABITS':
      return { ...state, habits: action.payload };
    case 'UPDATE_PROJECTS':
      return { ...state, projects: action.payload };
    case 'UPDATE_HABIT_ORDER':
      return { ...state, habitOrder: action.payload };
    case 'UPDATE_PROJECT_ORDER':
      return { ...state, projectOrder: action.payload };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(habit =>
          habit.id === action.payload.id ? { ...habit, ...action.payload.updates } : habit
        )
      };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? { ...project, ...action.payload.updates } : project
        )
      };
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload),
        habitOrder: state.habitOrder.filter(id => id !== action.payload)
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        projectOrder: state.projectOrder.filter(id => id !== action.payload)
      };
    case 'ADD_HABIT':
      return {
        ...state,
        habits: [...state.habits, action.payload],
        habitOrder: [...state.habitOrder, action.payload.id]
      };
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload],
        projectOrder: [...state.projectOrder, action.payload.id]
      };
    case 'UPDATE_CHALLENGE_POOL':
      return { ...state, challengePool: action.payload };
    case 'UPDATE_TODAYS_CHALLENGES':
      return { ...state, todaysChallenges: action.payload };
    case 'UPDATE_ACHIEVEMENTS':
      return { ...state, achievements: action.payload };
    case 'UPDATE_COMPLETED_RANDOM_TASKS':
      return { ...state, completedRandomTasks: action.payload };
    case 'ADD_GIVEN_UP_TASK':
      return { ...state, givenUpTasks: [...state.givenUpTasks, action.payload] };
    case 'REMOVE_GIVEN_UP_TASK':
      return { ...state, givenUpTasks: state.givenUpTasks.filter(id => id !== action.payload) };
    case 'UPDATE_CLAIMED_BADGES':
      return { ...state, claimedBadges: action.payload };
    case 'UPDATE_ACTIVE_AUTO_TASK':
      return { ...state, activeAutoTask: action.payload };
    case 'UPDATE_STATS_HISTORY':
      return { ...state, statsHistory: action.payload };
    case 'UPDATE_TODAY_STATS':
      return { ...state, todayStats: action.payload };
    case 'UPDATE_DICE_STATE':
      return { ...state, diceState: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    case 'UPDATE_WEEKLY_GOAL':
      return { ...state, weeklyGoal: action.payload };
    case 'UPDATE_TODAY_GOAL':
      return { ...state, todayGoal: action.payload };
    case 'SET_IMMERSIVE':
      return { ...state, isImmersive: action.payload };
    case 'SET_USE_INTERNAL_IMMERSIVE':
      return { ...state, useInternalImmersive: action.payload };
    default:
      return state;
  }
};

// 创建Context
const GameStateContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameStateAction>;
} | undefined>(undefined);

// Provider组件
interface GameStateProviderProps {
  children: ReactNode;
  initialState?: Partial<GameState>;
}

const GameStateProvider: React.FC<GameStateProviderProps> = ({ children, initialState }) => {
  const [state, dispatch] = useReducer(gameStateReducer, {
    day: 1,
    balance: 88,
    xp: 10,
    checkInStreak: 1,
    transactions: [],
    reviews: [],
    habits: [],
    projects: [],
    habitOrder: [],
    projectOrder: [],
    challengePool: [],
    todaysChallenges: { date: '', tasks: [] },
    achievements: [],
    completedRandomTasks: {},
    givenUpTasks: [],
    claimedBadges: ["class-吃土少年","class-泡面搭档","class-温饱及格","class-奶茶自由","class-外卖不看价"],
    activeAutoTask: null,
    statsHistory: {
      1: {
        focusMinutes: 10,
        tasksCompleted: 0,
        habitsDone: 1,
        earnings: 117,
        spending: 9
      }
    },
    todayStats: {
      focusMinutes: 10,
      tasksCompleted: 0,
      habitsDone: 1,
      earnings: 117,
      spending: 9
    },
    diceState: {
      todayCount: 0,
      lastClickDate: new Date().toLocaleDateString(),
      history: [],
      completedTaskIds: [],
      isSpinning: false,
      taskPool: {
        health: [],
        efficiency: [],
        leisure: []
      },
      config: {
        dailyLimit: 3,
        faceCount: 6,
        categoryDistribution: {
          health: 2,
          efficiency: 2,
          leisure: 2
        }
      },
      pendingTasks: [],
      completedTasks: []
    },
    settings: {
      bgMusicVolume: 0.5,
      soundEffectVolume: 0.7,
      enableBgMusic: true,
      enableSoundEffects: true,
      enableNotifications: true,
      guideCardConfig: {
        fontSize: 'medium',
        borderRadius: 'medium',
        shadowIntensity: 'medium',
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
      showCharacterSystem: true,
      showPomodoroSystem: true,
      showFocusTimeSystem: true,
      showCheckinSystem: true,
      showAchievementCollectionRate: true,
      showSystemStabilityModule: true,
      showLatestBadges: true,
      showChartSummary: true,
      showSupplyMarket: true,
      autoBackupEnabled: true,
      autoBackupFrequency: 'daily',
      autoBackupTime: '10:00',
      customBackupPath: '',
      enableWebDAV: true
    },
    weeklyGoal: "本周战役：攻占「项目初稿」高地",
    todayGoal: "今日核心：完成核心模块代码",
    isImmersive: false,
    useInternalImmersive: false,
    ...initialState
  });

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
};

// 自定义Hook
const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

export { GameStateProvider, useGameState };