
import React from 'react';

/**
 * 应用视图枚举
 */
/**
 * 商品分类枚举
 * 定义商品的主要分类，用于商品筛选和展示
 */
export enum ProductCategory {
  /** 全部商品分类 */
  ALL = '全部',
  /** 数码产品分类，如手机、电脑、耳机等 */
  DIGITAL = '数码',
  /** 家居用品分类，如家具、厨具、日用品等 */
  HOME = '家居',
  /** 食品饮料分类，如零食、饮料、餐饮等 */
  FOOD = '吃喝',
  /** 饮食相关分类，与FOOD类似，用于更细致的分类 */
  DIET = '饮食',
  /** 形象设计与穿搭分类，如服装、化妆品、配饰等 */
  CLOTHING = '形象设计与穿搭',
  /** 休闲娱乐分类，如游戏、电影、旅游等 */
  LEISURE_ENTERTAINMENT = '休闲娱乐',
  /** 会员/权益/充值分类，如各种会员服务、充值卡等 */
  VIP_RECHARGE = '会员/权益/充值',
  /** 体验类商品分类，如课程、活动、服务等 */
  EXPERIENCE = '体验'
}

/**
 * 商品类型枚举
 * 定义商品的性质和使用方式
 */
export enum ProductType {
  /** 实体商品，可拥有的物理商品 */
  PHYSICAL = 'physical',
  /** 休闲商品，用于休闲娱乐的一次性商品 */
  LEISURE = 'leisure',
  /** 权益商品，提供某种权益或服务的商品 */
  RIGHTS = 'rights'
}

/**
 * 商品接口
 * 定义商品的完整数据结构，用于商品管理和展示
 */
export interface Product {
  /** 商品唯一标识符，格式通常为"类型_分类_序号" */
  id: string;
  /** 商品名称，用于展示给用户 */
  name: string;
  /** 商品描述，详细介绍商品的功能、用途等 */
  description: string;
  /** 商品价格，以虚拟货币单位计算 */
  cost: number;
  /** 商品类型，决定商品的使用方式和拥有规则 */
  type: ProductType;
  /** 是否已拥有该商品，实体商品会标记为true，休闲和权益商品通常为false */
  owned: boolean;
  /** 商品图标，用于在商品列表中展示 */
  icon: React.ReactNode;
  /** 商品分类，用于商品筛选和分组 */
  category: ProductCategory;
  /** 商品图片URL，用于商品详情展示 */
  image: string;
  /** 商品购买次数，记录商品被购买的次数 */
  purchaseCount?: number;
  /** 最后购买时间戳，记录商品最近一次被购买的时间 */
  lastPurchased?: number;
}

/**
 * 商品管理状态接口
 * 定义商品管理页面的状态数据结构
 */
export interface ProductManagementState {
  /** 完整的商品列表，包含所有商品数据 */
  products: Product[];
  /** 当前选中的商品，用于编辑或查看详情 */
  selectedProduct: Product | null;
  /** 可用的商品分类列表，用于筛选器 */
  categories: ProductCategory[];
  /** 根据筛选条件过滤后的商品列表，用于展示 */
  filteredProducts: Product[];
  /** 当前选中的分类，用于商品筛选 */
  currentCategory: ProductCategory;
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
  TIME_BOX = 'TIME_BOX',             // 时间盒子 (New)
}

/**
 * 主题类型
 * - neomorphic: 拟态风格主题
 */
export type Theme = 'neomorphic-light' | 'neomorphic-dark';

/**
 * 主题类型分组
 */
export const ThemeGroups = {
  /** 拟态主题 */
  NEOMORPHIC: ['neomorphic-light', 'neomorphic-dark'] as Theme[],
  /** 浅色主题 */
  LIGHT: ['neomorphic-light'] as Theme[],
  /** 深色主题 */
  DARK: ['neomorphic-dark'] as Theme[]
};

/**
 * 属性类型枚举
 */
export const AttributeType = {
  /** 力量 */
  STRENGTH: 'STR',
  /** 智力 */
  INTELLIGENCE: 'INT',
  /** 自律 */
  DISCIPLINE: 'DIS',
  /** 创造力 */
  CREATIVITY: 'CRE',
  /** 社交能力 */
  SOCIABILITY: 'SOC',
  /** 财富 */
  WEALTH: 'WEA',
} as const;

export type AttributeTypeValue = typeof AttributeType[keyof typeof AttributeType];
export type AttributeTypeObject = typeof AttributeType;

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
  /** 提醒设置 */
  reminder?: {
    enabled: boolean;
    date?: string; // YYYY-MM-DD
    time?: string; // HH:mm
    repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
    repeatInterval?: number; // 每隔 X 天
    lastTriggered?: string; // 上次提醒时间
  };
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
  /** 提醒设置 */
  reminder?: {
    enabled: boolean;
    date?: string; // YYYY-MM-DD
    time?: string; // HH:mm
    repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
    repeatInterval?: number; // 每隔 X 天
    lastTriggered?: string; // 上次提醒时间
  };
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
  /** 提醒设置 */
  reminder?: {
    enabled: boolean;
    date?: string; // YYYY-MM-DD
    time?: string; // HH:mm
    repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
    repeatInterval?: number; // 每隔 X 天
    lastTriggered?: string; // 上次提醒时间
  };
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
  /** 提醒设置 */
  reminder?: {
    enabled: boolean;
    date?: string;
    time?: string;
    repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
    repeatInterval?: number;
    lastTriggered?: string;
  };
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
    /** 自动备份是否启用 */
    autoBackupEnabled?: boolean;
    /** 自动备份频率 */
    autoBackupFrequency?: 'none' | 'daily' | 'weekly' | 'monthly';
    /** 自动备份时间 */
    autoBackupTime?: string;
    /** 自定义备份路径 */
    customBackupPath?: string;
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
    /** 是否启用WebDAV备份 */
    enableWebDAV?: boolean;
}
