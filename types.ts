
export enum View {
  COMMAND_CENTER = 'COMMAND_CENTER', // 战略指挥部
  RPG_MISSION_CENTER = 'RPG_MISSION_CENTER', // 作战中心 (原 RPG)
  BLACK_MARKET = 'BLACK_MARKET',     // 补给黑市 (New)
  DATA_CHARTS = 'DATA_CHARTS',       // 图表汇总 (原 Mission Control)
  HALL_OF_FAME = 'HALL_OF_FAME',     // 荣誉殿堂 (New)
  PROJECT_MANUAL = 'PROJECT_MANUAL', // 项目开发书 (New)
  SETTINGS = 'SETTINGS',             // 设置中心 (New)
}

export type Theme = 'dark' | 'light';
export type AttributeType = 'STR' | 'INT' | 'DIS' | 'CRE' | 'SOC' | 'WEA';

export interface RejectionLog {
  id: string;
  date: string;
  content: string; // User input review
}

export interface FearEntry {
  id: string;
  challenge: string; // What I want to do
  fear: string;      // What I am afraid of
  prevention: string;// How to solve it
  status: 'pending' | 'conquered';
  logs: RejectionLog[];
}

export interface Transaction {
  id: string;
  time: string;
  desc: string;
  amount: number;
}

export interface Habit {
  id: string;
  name: string;
  reward: number; // Gold
  xp?: number;    // Custom XP
  duration?: number; // Duration in minutes
  streak: number;
  archived: boolean;
  color: string; 
  attr?: AttributeType; // RPG Attribute
  history: { [dateString: string]: boolean }; 
  logs: { [dateString: string]: string };
}

export interface ProjectLog {
  id: string;
  date: string;
  content: string;
  durationMinutes: number;
}

export interface SubTask {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  frequency: 'daily' | 'weekly' | 'once';
}

export interface Project {
  id: string;
  name: string;
  startDate: string; // ISO Date string
  description: string;
  status: 'active' | 'paused' | 'completed';
  logs: ProjectLog[];
  dailyFocus: { [dateStr: string]: number }; 
  subTasks: SubTask[];
  fears: FearEntry[];
  todayFocusMinutes: number;
  attr?: AttributeType; // RPG Attribute
}

export interface ReviewLog {
  id: string;
  date: string;
  content: string;
  aiAnalysis: string;
  timestamp: number;
}

export interface DailyStats {
  focusMinutes: number;
  tasksCompleted: number;
  habitsDone: number;
  earnings: number;
  spending: number;
}

// 设置选项类型
export interface Settings {
    bgMusicVolume: number;
    soundEffectVolume: number;
    enableBgMusic: boolean;
    enableSoundEffects: boolean;
    soundEffectsByLocation: {
        [location: string]: {
            enabled: boolean;
            sound: string;
        };
    };
    soundLibrary: {
        [soundId: string]: {
            name: string;
            url: string;
        };
    };
    enableNotifications: boolean;
    enableTaskCompleteNotifications: boolean;
    enableAchievementNotifications: boolean;
    enablePomodoroNotifications: boolean;
    showExperienceBar: boolean;
    showBalance: boolean;
    showTaskCompletionRate: boolean;
    autoBackupFrequency?: 'none' | 'daily' | 'weekly' | 'monthly';
}
