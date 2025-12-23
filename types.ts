
/**
 * 应用视图枚举
 */
export enum View {
  RPG_MISSION_CENTER = 'RPG_MISSION_CENTER', // 作战中心 (原 RPG)
  BLACK_MARKET = 'BLACK_MARKET',     // 补给黑市 (New)
  DATA_CHARTS = 'DATA_CHARTS',       // 图表汇总 (原 Mission Control)
  HALL_OF_FAME = 'HALL_OF_FAME',     // 荣誉殿堂 (New)
  PROJECT_MANUAL = 'PROJECT_MANUAL', // 项目开发书 (New)
  SETTINGS = 'SETTINGS',             // 设置中心 (New)
}

/**
 * 主题类型
 * - dark: 深色主题
 * - light: 浅色主题
 * - neomorphic: 拟态风格主题
 */
export type Theme = 'dark' | 'light' | 'neomorphic';

/**
 * 属性类型枚举
 */
export enum AttributeType {
  /** 力量 */
  STRENGTH = 'STR',
  /** 智力 */
  INTELLIGENCE = 'INT',
  /** 自律 */
  DISCIPLINE = 'DIS',
  /** 创造力 */
  CREATIVITY = 'CRE',
  /** 社交能力 */
  SOCIABILITY = 'SOC',
  /** 财富 */
  WEALTH = 'WEA',
}

/**
 * 成就物品接口
 */
export interface AchievementItem {
  /** 成就ID */
  id: string;
  /** 成就标题 */
  title: string;
  /** 成就描述 */
  description: string;
  /** 成就图标 */
  icon?: string;
  /** 是否解锁 */
  unlocked: boolean;
  /** 奖励经验值 */
  rewardXp?: number;
  /** 奖励金币 */
  rewardGold?: number;
  /** 当前进度 */
  progress?: number;
  /** 目标进度 */
  target?: number;
}

/**
 * 日程项接口
 */
export interface ScheduleItem {
  /** 日程项ID */
  id: string;
  /** 时间 */
  time: string;
  /** 活动内容 */
  activity: string;
  /** 理论依据 */
  theory: string;
  /** 是否完成 */
  completed: boolean;
}

/**
 * 成就配置项接口
 */
export interface AchievementConfig {
  /** 成就配置ID */
  id: string;
  /** 成就名称 */
  name: string;
  /** 成就目标数量 */
  limit: number;
  /** 成就单位 */
  unit: string;
  /** 成就图标名称 */
  iconName: string;
  /** 成就颜色 */
  color: string;
  /** 成就描述 */
  desc: string;
  /** 成就分类 */
  category: string;
}

/**
 * 拒绝日志接口
 */
export interface RejectionLog {
  /** 日志ID */
  id: string;
  /** 日期 */
  date: string;
  /** 日志内容 */
  content: string;
}

/**
 * 恐惧条目接口
 */
export interface FearEntry {
  /** 恐惧ID */
  id: string;
  /** 挑战内容 */
  challenge: string;
  /** 恐惧内容 */
  fear: string;
  /** 解决方法 */
  prevention: string;
  /** 状态 */
  status: 'pending' | 'conquered';
  /** 拒绝日志列表 */
  logs: RejectionLog[];
}

/**
 * 交易记录接口
 */
export interface Transaction {
  /** 交易ID */
  id: string;
  /** 交易时间 */
  time: string;
  /** 交易描述 */
  desc: string;
  /** 交易金额 */
  amount: number;
}

/**
 * 习惯接口
 */
export interface Habit {
  /** 习惯ID */
  id: string;
  /** 习惯名称 */
  name: string;
  /** 奖励金币 */
  reward: number;
  /** 奖励经验值 */
  xp?: number;
  /** 习惯时长（分钟） */
  duration?: number;
  /** 连续天数 */
  streak: number;
  /** 是否归档 */
  archived: boolean;
  /** 习惯颜色 */
  color: string;
  /** 关联属性 */
  attr?: AttributeType;
  /** 历史记录 */
  history: { [dateString: string]: boolean };
  /** 日志记录 */
  logs: { [dateString: string]: string };
}

/**
 * 项目日志接口
 */
export interface ProjectLog {
  /** 日志ID */
  id: string;
  /** 日期 */
  date: string;
  /** 日志内容 */
  content: string;
  /** 时长（分钟） */
  durationMinutes: number;
}

/**
 * 子任务接口
 */
export interface SubTask {
  /** 子任务ID */
  id: string;
  /** 子任务标题 */
  title: string;
  /** 子任务时长（分钟） */
  duration: number;
  /** 是否完成 */
  completed: boolean;
  /** 频率 */
  frequency: 'daily' | 'weekly' | 'once';
}

/**
 * 项目接口
 */
export interface Project {
  /** 项目ID */
  id: string;
  /** 项目名称 */
  name: string;
  /** 开始日期 */
  startDate: string;
  /** 项目描述 */
  description: string;
  /** 项目状态 */
  status: 'active' | 'paused' | 'completed';
  /** 项目日志 */
  logs: ProjectLog[];
  /** 每日专注时长记录 */
  dailyFocus: { [dateStr: string]: number };
  /** 子任务列表 */
  subTasks: SubTask[];
  /** 恐惧条目列表 */
  fears: FearEntry[];
  /** 今日专注时长 */
  todayFocusMinutes: number;
  /** 关联属性 */
  attr?: AttributeType;
}

/**
 * 评审日志接口
 */
export interface ReviewLog {
  /** 日志ID */
  id: string;
  /** 日期 */
  date: string;
  /** 评审内容 */
  content: string;
  /** AI分析结果 */
  aiAnalysis: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 每日统计接口
 */
export interface DailyStats {
  /** 专注时长（分钟） */
  focusMinutes: number;
  /** 完成任务数量 */
  tasksCompleted: number;
  /** 完成习惯数量 */
  habitsDone: number;
  /** 收入金额 */
  earnings: number;
  /** 支出金额 */
  spending: number;
}

/**
 * 任务类型枚举
 */
export enum TaskType {
  /** 每日习惯任务 */
  DAILY = 'daily',
  /** 主要项目任务 */
  MAIN = 'main',
  /** 随机挑战任务 */
  RANDOM = 'random',
  /** 休闲任务 */
  LEISURE = 'leisure',
}

/**
 * 任务接口
 */
export interface Task {
  /** 任务ID */
  id: string;
  /** 任务文本 */
  text: string;
  /** 任务类型 */
  type: TaskType;
  /** 奖励金币 */
  gold?: number;
  /** 奖励经验值 */
  xp?: number;
  /** 任务时长（分钟） */
  duration?: number;
  /** 是否完成 */
  completed: boolean;
  /** 是否放弃 */
  isGivenUp?: boolean;
  /** 频率 */
  frequency?: 'daily' | 'weekly' | 'once';
  /** 原始数据 */
  originalData?: Habit | Project;
  /** 关联属性 */
  attr?: AttributeType;
}

/**
 * 自动任务类型枚举
 */
export enum AutoTaskType {
  /** 习惯任务 */
  HABIT = 'habit',
  /** 项目任务 */
  PROJECT = 'project',
  /** 随机任务 */
  RANDOM = 'random',
}

/**
 * 自动任务接口
 */
export interface AutoTask {
  /** 任务类型 */
  type: AutoTaskType;
  /** 任务ID */
  id: string;
  /** 子任务ID */
  subId?: string;
}

/**
 * 声音类型枚举
 */
export enum SoundType {
  /** 音效 */
  SOUND_EFFECT = 'soundEffect',
  /** 背景音乐 */
  BACKGROUND_MUSIC = 'bgMusic',
}

/**
 * 设置选项类型
 */
export interface Settings {
    /** 背景音乐音量 */
    bgMusicVolume: number;
    /** 音效音量 */
    soundEffectVolume: number;
    /** 是否启用背景音乐 */
    enableBgMusic: boolean;
    /** 是否启用音效 */
    enableSoundEffects: boolean;
    /** 按位置区分的音效设置 */
    soundEffectsByLocation: {
        [location: string]: {
            /** 是否启用 */
            enabled: boolean;
            /** 音效ID */
            sound: string;
        };
    };
    /** 音效库 */
    soundLibrary: {
        [soundId: string]: {
            /** 音效名称 */
            name: string;
            /** 音效URL */
            url: string;
        };
    };
    /** 是否启用通知 */
    enableNotifications: boolean;
    /** 是否启用任务完成通知 */
    enableTaskCompleteNotifications: boolean;
    /** 是否启用成就通知 */
    enableAchievementNotifications: boolean;
    /** 是否启用番茄钟通知 */
    enablePomodoroNotifications: boolean;
    /** 是否显示经验条 */
    showExperienceBar: boolean;
    /** 是否显示余额 */
    showBalance: boolean;
    /** 是否显示任务完成率 */
    showTaskCompletionRate: boolean;
    /** 自动备份频率 */
    autoBackupFrequency?: 'none' | 'daily' | 'weekly' | 'monthly';
    /** NutCloud WebDAV配置 */
    nutcloudWebDAV?: {
        /** 服务器地址 */
        server: string;
        /** 用户名 */
        username: string;
        /** 密码 */
        password: string;
    };
}
