
import React from 'react';

/**
 * 应用视图枚举
 */
/**
 * 商品分类枚举
 */
export enum ProductCategory {
  /** 全部 */
  ALL = '全部',
  /** 吃喝 */
  FOOD = '吃喝',
  /** 形象设计与穿搭 */
  CLOTHING = '形象设计与穿搭',
  /** 体验 */
  EXPERIENCE = '体验',
  /** 休闲娱乐 */
  LEISURE_ENTERTAINMENT = '休闲娱乐',
  /** 数码家居 */
  DIGITAL_HOME = '数码家居',
  /** 会员/权益/充值 */
  VIP_RECHARGE = '会员/权益/充值'
}

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
  THINKING_CENTER = 'THINKING_CENTER', // 思维中心 (New)
}

/**
 * 主题类型
 * - dark: 深色主题
 * - light: 浅色主题
 * - neomorphic: 拟态风格主题
 */
export type Theme = 'light' | 'dark' | 'neomorphic-light' | 'neomorphic-dark';

/**
 * 主题类型分组
 */
export const ThemeGroups = {
  /** 普通主题 */
  NORMAL: ['light', 'dark'] as Theme[],
  /** 拟态主题 */
  NEOMORPHIC: ['neomorphic-light', 'neomorphic-dark'] as Theme[],
  /** 浅色主题 */
  LIGHT: ['light', 'neomorphic-light'] as Theme[],
  /** 深色主题 */
  DARK: ['dark', 'neomorphic-dark'] as Theme[]
};

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

export type AttributeTypeValue = 'STR' | 'INT' | 'DIS' | 'CRE' | 'SOC' | 'WEA';

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
  attr?: AttributeTypeValue;
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
  attr?: AttributeTypeValue;
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
  attr?: AttributeTypeValue;
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
 * 命运骰子分类枚举
 */
export enum DiceCategory {
  /** 健康微行动类 */
  HEALTH = 'health',
  /** 效率任务类 */
  EFFICIENCY = 'efficiency',
  /** 休闲小奖励类 */
  LEISURE = 'leisure'
}

/**
 * 命运骰子任务接口
 */
export interface DiceTask {
  /** 任务ID */
  id: string;
  /** 任务文本 */
  text: string;
  /** 任务分类 */
  category: DiceCategory;
  /** 奖励金币范围 */
  goldRange: [number, number];
  /** 奖励经验值范围 */
  xpRange?: [number, number];
  /** 任务时长（分钟） */
  duration?: number;
}

/**
 * 命运骰子历史记录接口
 */
export interface DiceHistory {
  /** 记录ID */
  id: string;
  /** 日期 */
  date: string;
  /** 任务ID */
  taskId: string;
  /** 任务文本 */
  text: string;
  /** 任务分类 */
  category: DiceCategory;
  /** 获得金币 */
  gold: number;
  /** 获得经验值 */
  xp: number;
  /** 处理结果 */
  result: 'completed' | 'skipped' | 'later';
  /** 完成时间 */
  completedAt?: string;
}

/**
 * 命运骰子配置接口
 */
export interface DiceConfig {
  /** 每日可点击上限 */
  dailyLimit: number;
  /** 骰子面数 */
  faceCount: number;
  /** 各分类占比（面数） */
  categoryDistribution: {
    [key in DiceCategory]: number;
  };
}

/**
 * 命运骰子任务记录接口，用于任务列表管理
 */
export interface DiceTaskRecord {
  /** 记录ID */
  id: string;
  /** 任务信息 */
  task: DiceTask;
  /** 生成的奖励值 */
  generatedGold: number;
  generatedXp: number;
  /** 状态 */
  status: 'pending' | 'completed';
  /** 创建时间 */
  createdAt: string;
  /** 完成时间 */
  completedAt?: string;
}

/**
 * 命运骰子状态接口
 */
export interface DiceState {
  /** 今日已点击次数 */
  todayCount: number;
  /** 上次点击日期 */
  lastClickDate: string;
  /** 历史记录 */
  history: DiceHistory[];
  /** 已完成任务ID列表 */
  completedTaskIds: string[];
  /** 当前旋转状态 */
  isSpinning: boolean;
  /** 当前结果 */
  currentResult?: DiceTask;
  /** 任务池 */
  taskPool: {
    [key in DiceCategory]: DiceTask[];
  };
  /** 配置 */
  config: DiceConfig;
  /** 今日任务列表 - 未完成 */
  pendingTasks: DiceTaskRecord[];
  /** 今日任务列表 - 已完成 */
  completedTasks: DiceTaskRecord[];
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
 * 指南卡片配置接口
 */
export interface GuideCardConfig {
    /** 字体大小 */
    fontSize: 'small' | 'medium' | 'large';
    /** 圆角大小 */
    borderRadius: 'small' | 'medium' | 'large';
    /** 阴影强度 */
    shadowIntensity: 'light' | 'medium' | 'strong';
}

/**
 * 图表配置接口
 */
export interface Chart {
  /** 图表唯一标识符 */
  id: string;
  /** 图表名称 */
  name: string;
  /** 图表显示标签 */
  label: string;
  /** 图表图标组件 */
  icon: React.ComponentType<{ size?: number; className?: string }>;
  /** 图表简短描述 */
  description: string;
  /** 图表深度分析 */
  deepAnalysis: string;
  /** 图表核心原则 */
  principle: string;
  /** 图表应用范围 */
  scope: string;
  /** 图表使用技巧 */
  tips: string;
  /** 图表实践建议 */
  practice: string;
  /** 图表可视化设计描述 */
  visualizationDesign?: string;
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
    /** 指南卡片配置 */
    guideCardConfig: GuideCardConfig;
}
