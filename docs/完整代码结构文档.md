# 人生游戏管理系统 - 完整代码结构

## 说明

### 文档目的
本文档包含人生游戏管理系统的所有代码，按照合理的顺序组织，方便分段复制粘贴发送给AI。每个代码块前都有详细的提示和描述，帮助AI理解代码的功能、位置和与其他模块的关系。

### 文档结构
文档按照以下顺序组织代码，从基础配置到核心功能，再到UI组件：
1. 项目配置文件 - 定义项目依赖和构建配置
2. 类型定义 - 定义系统核心数据结构
3. 常量定义 - 存储系统初始数据和配置
4. 功能模块 - 实现核心业务逻辑
5. 核心组件 - 实现主要UI界面
6. 共享组件 - 可复用的UI组件
7. 自定义Hooks - 封装状态管理逻辑
8. 工具函数 - 通用辅助功能
9. 入口文件 - 应用启动点
10. 项目文档 - 项目说明和使用指南

### 使用建议
- 按照文档顺序，逐段复制粘贴代码到AI
- 每个代码块都包含文件路径和功能描述，便于AI理解上下文
- 核心逻辑有详细注释，帮助AI理解代码意图
- 类型定义和接口设计清晰，便于AI进行类型推断

**注意：** 由于项目规模较大，部分组件和文件可能被简化或合并展示，以保持文档的可读性和实用性。

---

## 第一段：项目配置文件

### 1. package.json - 项目依赖配置

**文件路径**：根目录/package.json
**核心功能**：定义项目的基本信息、依赖库、脚本命令和构建配置
**关键配置项说明**：
- `name`: 项目名称，用于标识项目
- `type`: 模块类型，设置为"module"表示使用ES模块语法
- `scripts`: 定义常用命令：
  - `dev`: 启动开发服务器
  - `build`: 构建生产版本
  - `preview`: 预览生产构建结果
  - `webdav`: 启动WebDAV服务器（用于文件同步）
  - `start`: 同时启动WebDAV和开发服务器
- `dependencies`: 生产依赖，包含：
  - React 19 + TypeScript: 核心开发框架
  - Recharts: 数据可视化图表库
  - Lucide React: 图标库
  - Canvas-confetti: 庆祝动画效果
  - Capacitor: 跨平台应用开发框架
  - DnD Kit: 拖拽功能实现
- `devDependencies`: 开发依赖，包含Vite构建工具和TypeScript相关配置

```json
{
  "name": "人生游戏管理系统",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "webdav": "node webdav-server",
    "start": "npm run webdav & npm run dev"
  },
  "dependencies": {
    "@capacitor-community/electron": "^5.0.1",
    "@capacitor/android": "^8.0.0",
    "@capacitor/cli": "^7.4.4",
    "@capacitor/core": "^8.0.0",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@google/genai": "^1.33.0",
    "canvas-confetti": "1.9.2",
    "lucide-react": "^0.561.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "recharts": "^3.6.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "terser": "^5.44.1",
    "typescript": "~5.8.2",
    "vite": "^6.2.0",
    "webdav-server": "^2.6.2"
  }
}
```

### 2. tsconfig.json - TypeScript配置

**文件路径**：根目录/tsconfig.json
**核心功能**：配置TypeScript编译器选项，确保代码类型安全和正确编译
**关键配置项说明**：
- `target`: 编译目标ES版本，设置为ES2020以兼容现代浏览器
- `lib`: 指定编译时包含的库文件，包含DOM和DOM.Iterable以支持浏览器API
- `module`: 模块系统，设置为ESNext以支持最新的模块语法
- `moduleResolution`: 模块解析策略，使用bundler以适配Vite构建工具
- `jsx`: JSX编译模式，使用react-jsx以支持React 19的新特性
- `strict`: 启用严格类型检查，提高代码质量
- `include`: 指定需要编译的文件范围，仅包含src目录
- `references`: 引用其他TypeScript配置文件，用于Node.js环境的配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. vite.config.ts - Vite配置

**文件路径**：根目录/vite.config.ts
**核心功能**：配置Vite构建工具，定义插件、构建选项和开发服务器设置
**关键配置项说明**：
- `plugins`: 配置Vite插件，包含react插件以支持React开发
- `build`: 构建选项：
  - `minify`: 使用terser进行代码压缩
  - `terserOptions`: 配置terser压缩选项，移除console和debugger语句以优化生产构建

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

---

## 第二段：类型定义文件

### types.ts - 系统核心类型定义

**文件路径**：src/types.ts
**核心功能**：定义系统所有核心数据结构、枚举和类型别名，确保类型安全和代码一致性
**设计说明**：
- 采用模块化设计，每个数据结构独立定义
- 使用枚举类型管理固定值集合
- 接口设计遵循单一职责原则
- 类型层次清晰，便于扩展和维护

```typescript
// 视图类型 - 定义应用中的主要页面
// 用于导航和状态管理
export type View = 'RPG_MISSION_CENTER' | 'BLACK_MARKET' | 'HALL_OF_FAME' | 'DATA_CHARTS' | 'SETTINGS';

// 主题类型 - 定义应用支持的主题
// 用于外观切换和样式管理
export type Theme = 'light' | 'dark' | 'neomorphic';

// 任务类型 - 定义任务的分类
// 用于任务管理和显示逻辑
export type TaskType = 'daily' | 'main' | 'random';

// 属性类型枚举 - 定义角色的核心属性
// 用于角色成长和属性系统
export enum AttributeType {
  STRENGTH = 'strength',     // 力量 - 物理能力
  INTELLIGENCE = 'intelligence', // 智力 - 知识和学习能力
  CHARISMA = 'charisma',     // 魅力 - 社交能力
  CREATIVITY = 'creativity', // 创造力 - 创新能力
  SOCIAL = 'social',         // 社交 - 人际关系
  WEALTH = 'wealth',         // 财富 - 经济能力
  DISCIPLINE = 'discipline'  // 自律 - 自我管理能力
}

// 属性值数据结构 - 存储单个属性的当前值和最大值
export interface AttributeTypeValue {
  type: AttributeType;  // 属性类型
  value: number;        // 当前值
  max: number;          // 最大值
}

// 习惯数据结构 - 定义用户的每日习惯
// 用于习惯养成和跟踪系统
export interface Habit {
  id: string;                   // 唯一标识符
  name: string;                 // 习惯名称
  reward: number;               // 完成奖励金币
  xp: number;                   // 完成奖励经验值
  duration: number;             // 建议完成时长（分钟）
  streak: number;               // 连续完成天数
  color: string;                // 习惯颜色（用于UI显示）
  attr: AttributeType;          // 关联属性
  archived: boolean;            // 是否归档
  history: Record<string, boolean>; // 历史完成记录（日期: 是否完成）
  logs: Record<string, any>;    // 详细日志记录
}

// 子任务数据结构 - 项目的子任务
// 用于项目分解和进度跟踪
export interface SubTask {
  id: string;           // 唯一标识符
  text: string;         // 子任务描述
  completed: boolean;   // 是否完成
  reward?: number;      // 完成奖励金币（可选）
  xp?: number;          // 完成奖励经验值（可选）
}

// 项目数据结构 - 定义用户的大型项目
// 用于项目管理和进度跟踪
export interface Project {
  id: string;                     // 唯一标识符
  name: string;                   // 项目名称
  description: string;            // 项目描述
  status: 'active' | 'completed' | 'archived'; // 项目状态
  subTasks: SubTask[];            // 子任务列表
  reward: number;                 // 完成奖励金币
  xp: number;                     // 完成奖励经验值
  color: string;                  // 项目颜色（用于UI显示）
  createdAt: string;              // 创建时间
  completedAt?: string;           // 完成时间（可选）
  todayFocusMinutes: number;      // 今日专注时间（分钟）
  dailyFocus: Record<string, number>; // 每日专注时间记录
}

// 交易记录数据结构 - 记录用户的收支情况
// 用于财务管理和统计
export interface Transaction {
  id: string;         // 唯一标识符
  time: string;       // 交易时间
  desc: string;       // 交易描述
  amount: number;     // 交易金额（正数为收入，负数为支出）
}

// 审核日志数据结构 - 记录用户的每日总结
// 用于用户反馈和AI分析
export interface ReviewLog {
  id: string;         // 唯一标识符
  date: string;       // 日志日期
  content: string;    // 日志内容
  aiAnalysis: string; // AI分析结果
  timestamp: number;  // 时间戳
}

// 每日统计数据结构 - 记录用户的每日活动数据
// 用于统计分析和成就解锁
export interface DailyStats {
  focusMinutes: number;   // 专注时间（分钟）
  tasksCompleted: number; // 完成任务数
  habitsDone: number;     // 完成习惯数
  earnings: number;       // 今日收入
  spending: number;       // 今日支出
}

// 成就数据结构 - 定义系统中的成就
// 用于成就系统和奖励机制
export interface AchievementItem {
  id: string;            // 唯一标识符
  name: string;          // 成就名称
  description: string;   // 成就描述
  icon: string;          // 成就图标
  rewardGold: number;    // 解锁奖励金币
  rewardXp: number;      // 解锁奖励经验值
  unlocked: boolean;     // 是否已解锁
  category: string;      // 成就分类
  requirements: any;     // 解锁条件（动态结构）
}

// 骰子分类枚举 - 定义命运骰子的任务分类
// 用于随机任务生成
export enum DiceCategory {
  HEALTH = 'health',       // 健康类任务
  EFFICIENCY = 'efficiency', // 效率类任务
  LEISURE = 'leisure'      // 休闲类任务
}

// 骰子任务数据结构 - 定义命运骰子生成的任务
// 用于随机任务系统
export interface DiceTask {
  id: string;            // 唯一标识符
  text: string;          // 任务描述
  category: DiceCategory; // 任务分类
  goldRange: [number, number]; // 奖励金币范围
  xpRange?: [number, number];  // 奖励经验值范围（可选）
  duration?: number;     // 建议完成时长（分钟，可选）
}

// 骰子历史记录数据结构 - 记录命运骰子的使用历史
// 用于任务追踪和统计
export interface DiceHistory {
  id: string;            // 唯一标识符
  date: string;          // 记录日期
  taskId: string;        // 关联任务ID
  text: string;          // 任务描述
  category: DiceCategory; // 任务分类
  gold: number;          // 获得金币
  xp: number;            // 获得经验值
  result: 'completed' | 'skipped' | 'later'; // 任务结果
  completedAt?: string;  // 完成时间（可选）
}

// 骰子状态数据结构 - 管理命运骰子的状态
// 用于命运骰子功能
export interface DiceState {
  todayCount: number;    // 今日使用次数
  maxDailyCount: number; // 每日最大使用次数
  lastClickDate: string; // 上次使用日期
  currentResult: DiceTask | null; // 当前任务结果
  taskPool: Record<DiceCategory, DiceTask[]>; // 任务池
  history: DiceHistory[]; // 使用历史
  config: {
    categoryDistribution: Record<DiceCategory, number>; // 分类分布概率
    dailyLimit: number; // 每日限制
  };
  pendingTasks: any[];   // 待处理任务
  completedTasks: any[]; // 已完成任务
  completedTaskIds: string[]; // 已完成任务ID列表
}

// 自动任务类型枚举 - 定义自动任务的类型
// 用于自动任务系统
export enum AutoTaskType {
  HABIT = 'habit',       // 习惯自动任务
  PROJECT = 'project',   // 项目自动任务
  RANDOM = 'random'      // 随机自动任务
}

// 自动任务数据结构 - 定义自动执行的任务
// 用于时间管理和自动化系统
export interface AutoTask {
  type: AutoTaskType;    // 任务类型
  id: string;            // 关联实体ID
  subId?: string;        // 子任务ID（可选，用于项目子任务）
}

// 音效类型枚举 - 定义音效的分类
// 用于音频系统
export enum SoundType {
  BACKGROUND_MUSIC = 'background', // 背景音乐
  SOUND_EFFECT = 'effect'          // 音效
}
```

---

## 第三段：常量定义

### constants/index.ts - 系统常量定义

**文件路径**：src/constants/index.ts
**核心功能**：定义系统的初始数据、配置参数和阈值常量，用于初始化和配置系统
**设计说明**：
- 集中管理所有常量，便于维护和修改
- 初始数据用于系统首次启动时的默认值
- 阈值常量用于成就解锁和等级计算
- 配置参数用于功能模块的初始化

```typescript
// 签到阈值 - 定义连续签到的成就解锁条件
export const CHECKIN_THRESHOLDS = {
  7: '连续签到7天',   // 7天签到成就
  30: '连续签到30天',  // 30天签到成就
  100: '连续签到100天' // 100天签到成就
};

// 消费阈值 - 定义消费金额的成就解锁条件
export const CONSUMPTION_THRESHOLDS = {
  1000: '消费达人',   // 消费1000金币成就
  5000: '消费精英',   // 消费5000金币成就
  10000: '消费大师',  // 消费10000金币成就
  50000: '消费王者'   // 消费50000金币成就
};

// 每级所需经验值 - 定义升级所需的经验值
export const XP_PER_LEVEL = 100;

// 初始习惯数据 - 系统首次启动时的默认习惯列表
// 用于习惯养成功能的初始数据
export const INITIAL_HABITS = [
  {
    id: 'habit-1',
    name: '早起',
    reward: 10,        // 完成奖励10金币
    xp: 15,            // 完成奖励15经验值
    duration: 10,      // 建议完成时长10分钟
    streak: 0,         // 初始连续天数0
    color: '#8b5cf6',  // 紫色主题
    attr: 'discipline',// 关联自律属性
    archived: false,   // 未归档
    history: {},       // 初始历史记录为空
    logs: {}           // 初始日志为空
  },
  {
    id: 'habit-2',
    name: '运动',
    reward: 20,
    xp: 30,
    duration: 30,
    streak: 0,
    color: '#10b981',  // 绿色主题
    attr: 'strength',  // 关联力量属性
    archived: false,
    history: {},
    logs: {}
  },
  {
    id: 'habit-3',
    name: '阅读',
    reward: 15,
    xp: 22,
    duration: 20,
    streak: 0,
    color: '#3b82f6',  // 蓝色主题
    attr: 'intelligence', // 关联智力属性
    archived: false,
    history: {},
    logs: {}
  }
];

// 初始项目数据 - 系统首次启动时的默认项目列表
// 用于项目管理功能的初始数据
export const INITIAL_PROJECTS = [
  {
    id: 'project-1',
    name: '完成项目开发',
    description: '完成人生游戏管理系统的开发',
    status: 'active',  // 活跃状态
    subTasks: [        // 子任务列表
      {
        id: 'subtask-1-1',
        text: '设计系统架构',
        completed: false,
        reward: 50,
        xp: 100
      },
      {
        id: 'subtask-1-2',
        text: '实现核心功能',
        completed: false,
        reward: 100,
        xp: 200
      },
      {
        id: 'subtask-1-3',
        text: '测试和优化',
        completed: false,
        reward: 50,
        xp: 100
      }
    ],
    reward: 200,       // 项目完成奖励200金币
    xp: 400,           // 项目完成奖励400经验值
    color: '#f59e0b',  // 黄色主题
    createdAt: new Date().toISOString(), // 创建时间
    todayFocusMinutes: 0, // 今日专注时间
    dailyFocus: {}        // 每日专注记录
  }
];

// 初始挑战数据 - 随机挑战池的初始内容
// 用于每日随机挑战功能
export const INITIAL_CHALLENGES = [
  '学习新技能',
  '尝试新事物',
  '帮助他人',
  '完成一项挑战',
  '保持积极心态',
  '锻炼身体',
  '学习新知识',
  '提高工作效率',
  '改善人际关系',
  '保持健康饮食'
];

// 初始成就数据 - 系统首次启动时的成就列表
// 用于成就系统的初始数据
export const INITIAL_ACHIEVEMENTS = [
  {
    id: 'achievement-1',
    name: '初出茅庐',
    description: '完成第一个任务',
    icon: '🏆',
    rewardGold: 50,      // 解锁奖励50金币
    rewardXp: 100,       // 解锁奖励100经验值
    unlocked: false,     // 初始未解锁
    category: '任务',     // 任务类成就
    requirements: {
      tasksCompleted: 1  // 解锁条件：完成1个任务
    }
  },
  {
    id: 'achievement-2',
    name: '坚持不懈',
    description: '连续签到7天',
    icon: '🌟',
    rewardGold: 100,
    rewardXp: 200,
    unlocked: false,
    category: '签到',     // 签到类成就
    requirements: {
      checkInStreak: 7   // 解锁条件：连续签到7天
    }
  }
];

// 初始骰子状态 - 命运骰子功能的初始状态
// 用于命运骰子功能的初始化
export const INITIAL_DICE_STATE = {
  todayCount: 0,                 // 今日使用次数
  maxDailyCount: 5,              // 每日最大使用次数
  lastClickDate: '',             // 上次使用日期
  currentResult: null,           // 当前无任务结果
  taskPool: {                    // 任务池，按分类组织
    health: [],                  // 健康类任务列表
    efficiency: [],              // 效率类任务列表
    leisure: []                  // 休闲类任务列表
  },
  history: [],                   // 初始历史记录为空
  config: {
    categoryDistribution: {      // 分类分布概率
      health: 30,                // 健康类30%
      efficiency: 40,            // 效率类40%
      leisure: 30                // 休闲类30%
    },
    dailyLimit: 5                // 每日限制5次
  },
  pendingTasks: [],              // 初始无待处理任务
  completedTasks: [],            // 初始无已完成任务
  completedTaskIds: []           // 初始无已完成任务ID
};
```

---

## 第四段：功能模块

### 1. features/storage/useStorage.ts - 本地存储Hook

**文件路径**：src/features/storage/useStorage.ts
**核心功能**：封装localStorage操作，提供持久化存储的自定义Hook
**设计思路**：
- 使用泛型支持任意类型的数据存储
- 初始化时从localStorage读取数据，不存在则使用默认值
- 数据变化时自动保存到localStorage
- 返回值使用as const确保类型安全

```typescript
import { useState, useEffect } from 'react';

/**
 * 本地存储Hook
 * @param key localStorage键名
 * @param initialValue 初始值，当localStorage中不存在对应键时使用
 * @returns [存储的值, 更新值的函数] 元组
 */
export const useStorage = <T>(key: string, initialValue: T) => {
  // 初始化状态，优先从localStorage读取，不存在则使用初始值
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialValue;
  });

  // 当值变化时，自动保存到localStorage
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
};
```

### 2. features/pomodoro/usePomodoro.ts - 番茄钟功能Hook

**文件路径**：src/features/pomodoro/usePomodoro.ts
**核心功能**：实现番茄工作法的计时器逻辑，支持专注/休息循环
**设计思路**：
- 配置常量集中管理番茄钟参数
- 使用useCallback优化函数性能
- 实现专注/休息自动切换
- 支持长休息间隔配置

```typescript
import { useState, useEffect, useCallback } from 'react';

// 番茄钟配置常量
const POMODORO_CONFIG = {
  DEFAULT_FOCUS_DURATION: 25,     // 默认专注时长（分钟）
  DEFAULT_BREAK_DURATION: 5,       // 默认短休息时长（分钟）
  DEFAULT_LONG_BREAK_DURATION: 15,  // 默认长休息时长（分钟）
  LONG_BREAK_INTERVAL: 4,          // 长休息间隔（专注次数）
  MAX_DURATION: 60,                // 最大专注时长（分钟）
  MIN_DURATION: 1,                 // 最小专注时长（分钟）
};

/**
 * 番茄钟Hook
 * @returns 番茄钟状态和控制函数
 */
export const usePomodoro = () => {
  // 状态管理
  const [timeLeft, setTimeLeft] = useState(POMODORO_CONFIG.DEFAULT_FOCUS_DURATION * 60); // 剩余时间（秒）
  const [isActive, setIsActive] = useState(false); // 是否活跃
  const [duration, setDuration] = useState(POMODORO_CONFIG.DEFAULT_FOCUS_DURATION); // 当前专注时长设置
  const [sessionCount, setSessionCount] = useState(0); // 专注次数计数
  const [isBreak, setIsBreak] = useState(false); // 是否处于休息状态

  // 更新剩余时间
  const updateTimeLeft = useCallback((newTime: number) => {
    setTimeLeft(newTime);
  }, []);

  // 更新活跃状态
  const updateIsActive = useCallback((active: boolean) => {
    setIsActive(active);
  }, []);

  // 切换计时器（开始/暂停）
  const toggleTimer = useCallback(() => {
    setIsActive(!isActive);
  }, [isActive]);

  // 重置计时器
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(duration * 60);
  }, [duration]);

  // 更改专注时长
  const changeDuration = useCallback((newDuration: number) => {
    // 验证时长在有效范围内
    if (newDuration >= POMODORO_CONFIG.MIN_DURATION && newDuration <= POMODORO_CONFIG.MAX_DURATION) {
      setDuration(newDuration);
      setTimeLeft(newDuration * 60);
      setIsActive(false); // 更改时长时自动暂停
    }
  }, []);

  // 计时器核心逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    // 当计时器活跃且时间未结束时，每秒减少1秒
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } 
    // 当时间结束时
    else if (timeLeft === 0) {
      setIsActive(false); // 自动暂停
      
      if (isBreak) {
        // 休息结束，开始专注
        setIsBreak(false);
        setTimeLeft(duration * 60);
      } else {
        // 专注结束，开始休息
        setIsBreak(true);
        const newSessionCount = sessionCount + 1;
        setSessionCount(newSessionCount);
        
        // 根据专注次数决定休息类型
        if (newSessionCount % POMODORO_CONFIG.LONG_BREAK_INTERVAL === 0) {
          // 每4次专注后进行长休息
          setTimeLeft(POMODORO_CONFIG.DEFAULT_LONG_BREAK_DURATION * 60);
        } else {
          // 短休息
          setTimeLeft(POMODORO_CONFIG.DEFAULT_BREAK_DURATION * 60);
        }
      }
    }

    // 清理定时器
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft, isBreak, duration, sessionCount]);

  return {
    timeLeft,       // 剩余时间（秒）
    isActive,       // 是否活跃
    duration,       // 当前专注时长设置
    toggleTimer,    // 切换计时器状态
    resetTimer,     // 重置计时器
    changeDuration, // 更改专注时长
    updateTimeLeft, // 更新剩余时间
    updateIsActive, // 更新活跃状态
  };
};
```

### 3. features/dice/useDice.ts - 命运骰子功能Hook

**文件路径**：src/features/dice/useDice.ts
**核心功能**：管理命运骰子的状态，包括任务生成、历史记录和每日重置
**设计思路**：
- 使用localStorage持久化存储骰子状态
- 支持每日自动重置使用次数
- 模块化设计，便于扩展
- 类型安全的状态管理

```typescript
import { useState, useEffect } from 'react';
import { DiceState, INITIAL_DICE_STATE, DiceCategory, DiceTask } from '../../types';

/**
 * 命运骰子Hook
 * @param isDataLoaded 数据是否加载完成的标志
 * @returns [骰子状态, 更新骰子状态的函数]
 */
export const useDice = (isDataLoaded: boolean) => {
  // 初始化骰子状态
  const [diceState, setDiceState] = useState<DiceState>(INITIAL_DICE_STATE);

  // 从localStorage加载骰子状态
  useEffect(() => {
    if (!isDataLoaded) return;

    const savedDiceState = localStorage.getItem('aes-dice-state');
    if (savedDiceState) {
      try {
        const diceData = JSON.parse(savedDiceState);
        const todayStr = new Date().toLocaleDateString();
        
        // 如果是新的一天，重置次数和任务列表
        if (diceData.lastClickDate !== todayStr) {
          setDiceState(prev => ({
            ...prev,
            todayCount: 0,                   // 重置今日使用次数
            lastClickDate: todayStr,          // 更新最后使用日期
            pendingTasks: [],                 // 清空待处理任务
            completedTasks: []                // 清空已完成任务
          }));
        } else {
          // 确保新字段存在，兼容旧数据
          setDiceState({
            ...diceData,
            pendingTasks: diceData.pendingTasks || [],
            completedTasks: diceData.completedTasks || []
          });
        }
      } catch (e) {
        console.error("Dice save corrupted", e);
        setDiceState(INITIAL_DICE_STATE); // 数据损坏时重置为初始状态
      }
    }
  }, [isDataLoaded]);

  // 保存骰子状态到localStorage
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('aes-dice-state', JSON.stringify(diceState));
    }
  }, [diceState, isDataLoaded]);

  return {
    diceState,     // 骰子当前状态
    setDiceState   // 更新骰子状态的函数
  };
};
```

---

## 第五段：核心组件

### 1. App.tsx - 主应用组件

```typescript
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Navigation from './components/Navigation';
import MissionControl from './components/MissionControl'; 
import LifeGame from './components/LifeGame';
import HallOfFame from './components/HallOfFame';
import Settings from './components/Settings';
import { View, Transaction, ReviewLog, Habit, Task, TaskType, DailyStats, Theme, Project, AttributeTypeValue, AchievementItem, AutoTask, AutoTaskType, SoundType, DiceState, DiceTask, DiceCategory, DiceHistory } from './types';
import { AttributeType } from './types';
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
import { useStats } from './features/stats';
import { useStorage } from './features/storage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('RPG_MISSION_CENTER');
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
        givenUpTasks,
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
      } else {
          setTodayStats(s => ({ ...s, spending: s.spending - amount }));
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
          if (prev === 'dark') return 'light';
          if (prev === 'light') return 'neomorphic';
          return 'dark';
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
                  setXp(prev => prev + 10);
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
                      }
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
                      }
                  }
                  
                  const allDone = updatedProject.subTasks.length > 0 && updatedProject.subTasks.every(t => t.completed);
                  if (allDone && p.status !== 'completed') {
                      // 主线任务完成：添加奖励
                      updatedProject.status = 'completed';
                      handleUpdateBalance(100, `战役胜利: ${p.name}`);
                      setXp(prev => prev + 200);
                  } else if (!allDone && p.status === 'completed') {
                      // 主线任务撤销完成：回退奖励
                      updatedProject.status = 'active';
                      handleUpdateBalance(-100, `撤销战役胜利: ${p.name}`);
                      setXp(prev => Math.max(0, prev - 200));
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
      setCurrentView('RPG_MISSION_CENTER');
  };

  // 渲染当前视图
  const renderView = () => {
    switch (currentView) {
      case 'RPG_MISSION_CENTER':
      case 'BLACK_MARKET':
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
                  initialTab={currentView === 'BLACK_MARKET' ? 'shop' : 'battle'}
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
                  onUpdateTodayStats={setTodayStats}
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
              />;
      case 'HALL_OF_FAME':
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
      case 'DATA_CHARTS':
        return <MissionControl 
                  theme={theme} 
                  projects={projects}
                  habits={habits}
              />;

      case 'SETTINGS':
        return <Settings 
                  theme={theme} 
                  settings={settings} 
                  onUpdateSettings={handleUpdateSettings} 
                  onToggleTheme={handleToggleTheme} 
                />;
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#e0e5ec] text-slate-900'}`}>
      {/* 导航栏 */}
      <Navigation 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        theme={theme} 
        balance={balance} 
        xp={xp} 
        isNavCollapsed={isNavCollapsed} 
        setIsNavCollapsed={setIsNavCollapsed} 
      />
      
      {/* 主内容区 */}
      <div className={`flex ${isNavCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 pt-16`}>
        <main className="flex-1 p-6">
          {renderView()}
        </main>
      </div>
      
      {/* 浮动奖励文本 */}
      {floatingTexts.map(ft => (
        <div 
          key={ft.id} 
          className={`fixed pointer-events-none ${ft.color} font-bold text-lg`}
          style={{
            left: ft.x,
            top: ft.y,
            animation: 'float-up 1.5s ease-out forwards'
          }}
        >
          {ft.text}
        </div>
      ))}
      
      {/* 成就奖励弹窗 */}
      {activeAchievement && (
        <RewardModal 
          achievement={activeAchievement} 
          onClaimReward={handleClaimReward} 
          onClose={() => setActiveAchievement(null)} 
        />
      )}
    </div>
  );
};

export default App;
```

### 2. Navigation.tsx - 导航组件

```typescript
import React from 'react';
import { Target, ShoppingBag, Crown, BarChart2, Settings } from 'lucide-react';
import { View, Theme } from '../types';

interface NavigationProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  theme: Theme;
  balance: number;
  xp: number;
  isNavCollapsed: boolean;
  setIsNavCollapsed: (collapsed: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentView,
  setCurrentView,
  theme,
  balance,
  xp,
  isNavCollapsed,
  setIsNavCollapsed
}) => {
  // 导航项配置
  const navItems = [
    {
      id: 'RPG_MISSION_CENTER',
      label: '任务中心',
      icon: Target,
      color: '#3b82f6',
      exact: true
    },
    {
      id: 'BLACK_MARKET',
      label: '黑市',
      icon: ShoppingBag,
      color: '#8b5cf6'
    },
    {
      id: 'HALL_OF_FAME',
      label: '名人堂',
      icon: Crown,
      color: '#f59e0b'
    },
    {
      id: 'DATA_CHARTS',
      label: '数据中心',
      icon: BarChart2,
      color: '#10b981'
    },
    {
      id: 'SETTINGS',
      label: '设置',
      icon: Settings,
      color: '#6b7280'
    }
  ];

  const toggleCollapse = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  const isDark = theme === 'dark';
  const isNeomorphic = theme === 'neomorphic';

  return (
    <div className={`fixed top-0 left-0 h-full bg-white dark:bg-zinc-800 shadow-lg z-50 transition-all duration-300 ${isNavCollapsed ? 'w-16' : 'w-64'}`}>
      {/* 导航头 */}
      <div className="p-4 flex items-center justify-between border-b dark:border-zinc-700">
        <div className={`flex items-center gap-3 ${isNavCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            🎮
          </div>
          {!isNavCollapsed && (
            <div>
              <h1 className="text-xl font-bold dark:text-white">人生游戏系统</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">管理你的人生，实现你的梦想</p>
            </div>
          )}
        </div>
        <button 
          onClick={toggleCollapse}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
        >
          {isNavCollapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* 导航菜单 */}
      <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100%-80px)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${currentView === item.id ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold ${item.color}`}>
              <item.icon size={16} />
            </div>
            {!isNavCollapsed && (
              <span className="font-medium dark:text-white">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* 状态信息 */}
      {!isNavCollapsed && (
        <div className="p-4 border-t dark:border-zinc-700">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                💰
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">当前余额</p>
                <p className="text-lg font-bold dark:text-white">{balance} 金币</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                ⭐
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">经验值</p>
                <p className="text-lg font-bold dark:text-white">{xp} XP</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navigation;
```

### 3. MissionControl.tsx - 数据图表组件

```typescript
import React, { useState, useEffect } from 'react';
import { BarChart2, Download, RefreshCw, Filter } from 'lucide-react';
import { Habit, Project, Theme } from '../types';

interface MissionControlProps {
  habits: Habit[];
  projects: Project[];
  theme: Theme;
}

const MissionControl: React.FC<MissionControlProps> = ({ habits, projects, theme }) => {
  const [activeChart, setActiveChart] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [isDark] = useState(theme === 'dark');
  const [isNeomorphic] = useState(theme === 'neomorphic');

  // 模拟图表数据
  const charts = [
    {
      id: 'maslow',
      title: '马斯洛需求层次理论',
      type: 'hierarchy',
      description: '展示你的需求满足程度',
      data: [
        { level: 1, name: '生理需求', value: 85 },
        { level: 2, name: '安全需求', value: 75 },
        { level: 3, name: '社交需求', value: 65 },
        { level: 4, name: '尊重需求', value: 55 },
        { level: 5, name: '自我实现', value: 45 }
      ]
    },
    {
      id: 'pareto',
      title: '二八定律',
      type: 'pie',
      description: '关键任务与非关键任务的分布',
      data: [
        { name: '关键任务', value: 20 },
        { name: '非关键任务', value: 80 }
      ]
    },
    {
      id: 'swot',
      title: 'SWOT分析',
      type: 'quadrant',
      description: '优势、劣势、机会、威胁分析',
      data: {
        strengths: ['优势1', '优势2', '优势3'],
        weaknesses: ['劣势1', '劣势2'],
        opportunities: ['机会1', '机会2'],
        threats: ['威胁1', '威胁2']
      }
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 页面头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">数据中心</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">通过数据可视化了解你的人生状态</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
            <Filter size={18} />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
            <Download size={18} />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* 图表选择器 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {charts.map((chart, index) => (
          <button
            key={chart.id}
            onClick={() => setActiveChart(index)}
            className={`p-4 rounded-lg border transition-all ${activeChart === index 
              ? (isNeomorphic 
                ? 'bg-blue-500 text-white border-blue-400 shadow-lg' 
                : isDark 
                ? 'bg-blue-600 text-white border-blue-500' 
                : 'bg-blue-500 text-white border-blue-400') 
              : (isNeomorphic 
                ? 'bg-gray-100 border-gray-200 hover:shadow-md' 
                : isDark 
                ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' 
                : 'bg-white border-gray-200 hover:bg-gray-50')}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 size={18} />
              <h3 className="font-semibold">{chart.title}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{chart.description}</p>
          </button>
        ))}
      </div>

      {/* 图表显示区域 */}
      <div className={`p-6 rounded-lg border transition-all ${isNeomorphic 
        ? 'bg-gray-100 border-gray-200 shadow-lg' 
        : isDark 
        ? 'bg-zinc-800 border-zinc-700' 
        : 'bg-white border-gray-200 shadow-md'}`}
      >
        <h2 className="text-xl font-bold mb-4 dark:text-white">{charts[activeChart].title}</h2>
        
        {/* 图表内容 - 这里用简化的图表表示 */}
        <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-zinc-700 rounded-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500 dark:text-gray-400">{charts[activeChart].type} 图表</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">数据可视化展示</p>
          </div>
        </div>
        
        {/* 图表数据 */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3 dark:text-white">图表数据</h3>
          <div className="space-y-2">
            {Array.isArray(charts[activeChart].data) ? (
              charts[activeChart].data.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-zinc-700">
                  <span className="dark:text-white">{item.name}</span>
                  <span className="font-semibold dark:text-white">{item.value}</span>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(charts[activeChart].data as any).map(([key, value]) => (
                  <div key={key}>
                    <h4 className="font-medium mb-2 dark:text-white capitalize">{key}</h4>
                    <ul className="space-y-1">
                      {(value as string[]).map((item, index) => (
                        <li key={index} className="text-sm dark:text-gray-300">• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionControl;
```

### 4. LifeGame.tsx - 游戏中心组件

```typescript
import React, { useState } from 'react';
import { Target, ShoppingBag, Clock, Award, Zap } from 'lucide-react';
import { Habit, Project, Theme } from '../types';

interface LifeGameProps {
  theme: Theme;
  habits: Habit[];
  projects: Project[];
  balance: number;
  xp: number;
  // 其他属性...
}

const LifeGame: React.FC<LifeGameProps> = ({ theme, habits, projects, balance, xp }) => {
  const [activeTab, setActiveTab] = useState('habits');
  const isDark = theme === 'dark';
  const isNeomorphic = theme === 'neomorphic';

  return (
    <div className="p-6 space-y-6">
      {/* 页面头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">任务中心</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">完成任务，提升等级，实现目标</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-gray-500 dark:text-gray-400" />
            <span className="text-sm dark:text-white">今天</span>
          </div>
          <div className="flex items-center gap-2">
            <Award size={18} className="text-yellow-500" />
            <span className="text-sm font-semibold dark:text-white">{balance} 金币</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-blue-500" />
            <span className="text-sm font-semibold dark:text-white">{xp} XP</span>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className={`flex gap-2 p-1 rounded-lg ${isNeomorphic 
        ? 'bg-gray-100' 
        : isDark 
        ? 'bg-zinc-800' 
        : 'bg-gray-100'}`}
      >
        <button
          onClick={() => setActiveTab('habits')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'habits' 
            ? (isNeomorphic 
              ? 'bg-blue-500 text-white shadow-md' 
              : isDark 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-500 text-white') 
            : (isNeomorphic 
              ? 'hover:bg-gray-200' 
              : isDark 
              ? 'hover:bg-zinc-700' 
              : 'hover:bg-gray-200')}`}
        >
          习惯管理
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'projects' 
            ? (isNeomorphic 
              ? 'bg-blue-500 text-white shadow-md' 
              : isDark 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-500 text-white') 
            : (isNeomorphic 
              ? 'hover:bg-gray-200' 
              : isDark 
              ? 'hover:bg-zinc-700' 
              : 'hover:bg-gray-200')}`}
        >
          项目管理
        </button>
      </div>

      {/* 内容区域 */}
      <div className="space-y-6">
        {/* 习惯管理 */}
        {activeTab === 'habits' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold dark:text-white">我的习惯</h2>
              <button className="text-sm text-blue-500 hover:underline">添加习惯</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.map((habit) => (
                <div key={habit.id} className={`p-4 rounded-lg border transition-all ${isNeomorphic 
                  ? 'bg-gray-100 border-gray-200 hover:shadow-md' 
                  : isDark 
                  ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold`} style={{ backgroundColor: habit.color }}>
                        🎯
                      </div>
                      <div>
                        <h3 className="font-medium dark:text-white">{habit.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={12} />
                          <span>{habit.duration} 分钟</span>
                          <Zap size={12} />
                          <span>{habit.xp} XP</span>
                          <Award size={12} />
                          <span>{habit.reward} 金币</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${habit.streak >= 7 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-zinc-200'}`}
                      >
                        {habit.streak} 天
                      </span>
                      <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
                        ✅
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 项目管理 */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold dark:text-white">我的项目</h2>
              <button className="text-sm text-blue-500 hover:underline">添加项目</button>
            </div>
            
            <div className="space-y-4">
              {projects.map((project) => {
                const completedSubTasks = project.subTasks.filter(st => st.completed).length;
                const progress = Math.round((completedSubTasks / project.subTasks.length) * 100);
                
                return (
                  <div key={project.id} className={`p-4 rounded-lg border transition-all ${isNeomorphic 
                    ? 'bg-gray-100 border-gray-200 hover:shadow-md' 
                    : isDark 
                    ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium dark:text-white">{project.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : project.status === 'active' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-zinc-200'}`}
                        >
                          {project.status === 'completed' ? '已完成' : project.status === 'active' ? '进行中' : '已归档'}
                        </span>
                      </div>
                      
                      {/* 进度条 */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500 dark:text-gray-400">进度</span>
                          <span className="font-medium dark:text-white">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* 子任务列表 */}
                      <div className="space-y-2">
                        {project.subTasks.map((subTask) => (
                          <div key={subTask.id} className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={subTask.completed}
                              onChange={() => {}}
                              className="rounded border-gray-300 dark:border-zinc-600 focus:ring-blue-500"
                            />
                            <span className={`text-sm ${subTask.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'dark:text-white'}`}>
                              {subTask.text}
                            </span>
                            {subTask.reward && (
                              <span className="ml-auto text-xs font-medium text-yellow-500">+{subTask.reward} 金币</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LifeGame;
```

### 5. HallOfFame.tsx - 荣誉殿堂组件

```typescript
import React from 'react';
import { Trophy, Medal, Star, Crown } from 'lucide-react';
import { Theme } from '../types';

interface HallOfFameProps {
  theme: Theme;
  achievements: any[];
  claimedBadges: string[];
  checkInStreak: number;
  totalHours: number;
  totalCampaignsWon: number;
  // 其他属性...
}

const HallOfFame: React.FC<HallOfFameProps> = ({ theme, achievements, claimedBadges, checkInStreak, totalHours, totalCampaignsWon }) => {
  const isDark = theme === 'dark';
  const isNeomorphic = theme === 'neomorphic';

  return (
    <div className="p-6 space-y-6">
      {/* 页面头 */}
      <div>
        <h1 className="text-2xl font-bold dark:text-white">荣誉殿堂</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">展示你的成就和荣誉</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border transition-all ${isNeomorphic 
          ? 'bg-gray-100 border-gray-200 hover:shadow-md' 
          : isDark 
          ? 'bg-zinc-800 border-zinc-700' 
          : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">成就数量</p>
              <p className="text-2xl font-bold dark:text-white">{achievements.filter(a => a.unlocked).length}/{achievements.length}</p>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-lg border transition-all ${isNeomorphic 
          ? 'bg-gray-100 border-gray-200 hover:shadow-md' 
          : isDark 
          ? 'bg-zinc-800 border-zinc-700' 
          : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              <Crown size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">签到天数</p>
              <p className="text-2xl font-bold dark:text-white">{checkInStreak} 天</p>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-lg border transition-all ${isNeomorphic 
          ? 'bg-gray-100 border-gray-200 hover:shadow-md' 
          : isDark 
          ? 'bg-zinc-800 border-zinc-700' 
          : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
              <Star size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">战役胜利</p>
              <p className="text-2xl font-bold dark:text-white">{totalCampaignsWon} 次</p>
            </div>
          </div>
        </div>
      </div>

      {/* 成就列表 */}
      <div>
        <h2 className="text-lg font-semibold mb-4 dark:text-white">我的成就</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className={`p-4 rounded-lg border transition-all ${achievement.unlocked 
              ? (isNeomorphic 
                ? 'bg-gray-100 border-gray-200 hover:shadow-md' 
                : isDark 
                ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' 
                : 'bg-white border-gray-200 hover:bg-gray-50') 
              : 'opacity-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${achievement.unlocked ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium dark:text-white">{achievement.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{achievement.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold dark:text-white">+{achievement.rewardGold} 金币</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">+{achievement.rewardXp} XP</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HallOfFame;
```

### 6. Settings.tsx - 设置中心组件

```typescript
import React, { useState } from 'react';
import { Sun, Moon, Activity, Bell, Volume2, VolumeX } from 'lucide-react';
import { Theme } from '../types';

interface SettingsProps {
  theme: Theme;
  onToggleTheme: () => void;
  settings: any;
  onUpdateSettings: (settings: any) => void;
  // 其他属性...
}

const Settings: React.FC<SettingsProps> = ({ theme, onToggleTheme, settings, onUpdateSettings }) => {
  const [isDark] = useState(theme === 'dark');
  const [isNeomorphic] = useState(theme === 'neomorphic');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="p-6 space-y-6">
      {/* 页面头 */}
      <div>
        <h1 className="text-2xl font-bold dark:text-white">设置中心</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">自定义你的游戏体验</p>
      </div>

      {/* 主题设置 */}
      <div className={`p-4 rounded-lg border transition-all ${isNeomorphic 
        ? 'bg-gray-100 border-gray-200 hover:shadow-md' 
        : isDark 
        ? 'bg-zinc-800 border-zinc-700' 
        : 'bg-white border-gray-200'}`}
      >
        <h2 className="text-lg font-semibold mb-4 dark:text-white">主题设置</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">当前主题</label>
            <div className="flex gap-3">
              <button 
                onClick={() => onToggleTheme()}
                className={`flex-1 py-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${isNeomorphic 
                  ? 'bg-gray-200 border-gray-300 hover:shadow-md' 
                  : isDark 
                  ? 'bg-zinc-700 border-zinc-600 hover:bg-zinc-600' 
                  : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}
              >
                {theme === 'light' && <Sun size={18} />}
                {theme === 'dark' && <Moon size={18} />}
                {theme === 'neomorphic' && <Activity size={18} />}
                <span className="font-medium">{theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '拟态'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 声音和通知设置 */}
      <div className={`p-4 rounded-lg border transition-all ${isNeomorphic 
        ? 'bg-gray-100 border-gray-200 hover:shadow-md' 
        : isDark 
        ? 'bg-zinc-800 border-zinc-700' 
        : 'bg-white border-gray-200'}`}
      >
        <h2 className="text-lg font-semibold mb-4 dark:text-white">声音和通知</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              <div>
                <h3 className="font-medium dark:text-white">音效</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">启用或禁用所有音效</p>
              </div>
            </div>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-12 h-6 rounded-full flex items-center transition-all ${soundEnabled 
                ? 'bg-blue-500 justify-end' 
                : isDark 
                ? 'bg-zinc-700 justify-start' 
                : 'bg-gray-300 justify-start'}`}
            >
              <div className="w-5 h-5 rounded-full bg-white transition-all"></div>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={20} />
              <div>
                <h3 className="font-medium dark:text-white">通知</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">接收系统通知</p>
              </div>
            </div>
            <button 
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-6 rounded-full flex items-center transition-all ${notificationsEnabled 
                ? 'bg-blue-500 justify-end' 
                : isDark 
                ? 'bg-zinc-700 justify-start' 
                : 'bg-gray-300 justify-start'}`}
            >
              <div className="w-5 h-5 rounded-full bg-white transition-all"></div>
            </button>
          </div>
        </div>
      </div>

      {/* 其他设置 */}
      <div className={`p-4 rounded-lg border transition-all ${isNeomorphic 
        ? 'bg-gray-100 border-gray-200 hover:shadow-md' 
        : isDark 
        ? 'bg-zinc-800 border-zinc-700' 
        : 'bg-white border-gray-200'}`}
      >
        <h2 className="text-lg font-semibold mb-4 dark:text-white">其他设置</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                📊
              </div>
              <div>
                <h3 className="font-medium dark:text-white">显示统计数据</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">在主界面显示统计信息</p>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={settings.showStats} 
              onChange={() => {}} 
              className="rounded border-gray-300 dark:border-zinc-600 focus:ring-blue-500" 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                🏆
              </div>
              <div>
                <h3 className="font-medium dark:text-white">自动领取成就</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">自动领取达到条件的成就</p>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={settings.autoClaimAchievements} 
              onChange={() => {}} 
              className="rounded border-gray-300 dark:border-zinc-600 focus:ring-blue-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
```

---

## 第六段：工具函数和助手模块

### utils/index.ts - 工具函数集合

```typescript
// 日期处理工具
export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取相对时间
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else {
    return `${days}天前`;
  }
};

// 生成唯一ID
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 深拷贝对象
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// 计算百分比
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// 格式化数字，添加千位分隔符
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 生成随机颜色
export const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// 检查是否为今天
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// 获取本周开始日期
export const getWeekStartDate = (): Date => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 调整为周一作为一周的开始
  return new Date(now.getFullYear(), now.getMonth(), diff);
};

// 获取本月开始日期
export const getMonthStartDate = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// 生成随机整数
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 检查对象是否为空
export const isEmptyObject = (obj: any): boolean => {
  return Object.keys(obj).length === 0;
};
```

---

## 第七段：入口文件和配置

### index.tsx - 应用入口文件

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### index.css - 全局样式

```css
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 滚动条样式 - Updated to match guide card style */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(163, 177, 198, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(163, 177, 198, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(163, 177, 198, 0.7);
}

/* 深色主题滚动条 */
.dark ::-webkit-scrollbar-track {
  background: rgba(163, 177, 198, 0.1);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(163, 177, 198, 0.5);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(163, 177, 198, 0.7);
}

/* 拟态风格滚动条 */
.neomorphic ::-webkit-scrollbar-track {
  background: rgba(163, 177, 198, 0.1);
}

.neomorphic ::-webkit-scrollbar-thumb {
  background: rgba(163, 177, 198, 0.5);
  border-radius: 3px;
}

.neomorphic ::-webkit-scrollbar-thumb:hover {
  background: rgba(163, 177, 198, 0.7);
}

/* 浮动文本动画 */
@keyframes float-up {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-50px) scale(1.1);
  }
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 淡入动画 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 悬停缩放动画 */
@keyframes hover-scale {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.05);
  }
}

/* 工具类 */
.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.font-bold {
  font-weight: 700;
}

.font-semibold {
  font-weight: 600;
}

.font-medium {
  font-weight: 500;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-5 {
  margin-bottom: 1.25rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mt-5 {
  margin-top: 1.25rem;
}

.mt-6 {
  margin-top: 1.5rem;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-1 {
  gap: 0.25rem;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.gap-4 {
  gap: 1rem;
}

.gap-5 {
  gap: 1.25rem;
}

.gap-6 {
  gap: 1.5rem;
}

.rounded {
  border-radius: 0.375rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-full {
  border-radius: 9999px;
}

.p-1 {
  padding: 0.25rem;
}

.p-2 {
  padding: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.p-4 {
  padding: 1rem;
}

.p-5 {
  padding: 1.25rem;
}

.p-6 {
  padding: 1.5rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-5 {
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.min-h-screen {
  min-height: 100vh;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-y-auto {
  overflow-y: auto;
}

.cursor-pointer {
  cursor: pointer;
}

.opacity-50 {
  opacity: 0.5;
}

.opacity-100 {
  opacity: 1;
}

.transition-all {
  transition: all 0.3s ease;
}

.transition-colors {
  transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
}

.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}

.hover\:bg-gray-200:hover {
  background-color: #e5e7eb;
}

.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.line-through {
  text-decoration: line-through;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .sm\:hidden {
    display: none;
  }
  
  .sm\:block {
    display: block;
  }
  
  .sm\:flex {
    display: flex;
  }
  
  .sm\:grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .md\:hidden {
    display: none;
  }
  
  .md\:block {
    display: block;
  }
  
  .md\:flex {
    display: flex;
  }
  
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .lg\:hidden {
    display: none;
  }
  
  .lg\:block {
    display: block;
  }
  
  .lg\:flex {
    display: flex;
  }
  
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1025px) {
  .xl\:hidden {
    display: none;
  }
  
  .xl\:block {
    display: block;
  }
  
  .xl\:flex {
    display: flex;
  }
  
  .xl\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
```

## 第九段：共享组件

### 1. shared/RewardModal.tsx - 奖励弹窗组件

```typescript
import React from 'react';
import { AchievementItem } from '../../types';
import { Gift, X } from 'lucide-react';

interface RewardModalProps {
  achievement: AchievementItem;
  onClaimReward: (id: string, rewardXp: number, rewardGold: number) => void;
  onClose: () => void;
}

const RewardModal: React.FC<RewardModalProps> = ({ 
  achievement, 
  onClaimReward, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* 内容 */}
        <div className="text-center">
          {/* 成就图标 */}
          <div className="text-6xl mb-4">{achievement.icon}</div>
          
          {/* 成就名称 */}
          <h2 className="text-2xl font-bold mb-2">{achievement.name}</h2>
          
          {/* 成就描述 */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">{achievement.description}</p>
          
          {/* 奖励 */}
          <div className="flex justify-center space-x-8 mb-8">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">经验值</div>
              <div className="text-3xl font-bold text-blue-500">+{achievement.rewardXp}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">金币</div>
              <div className="text-3xl font-bold text-yellow-500">+{achievement.rewardGold}</div>
            </div>
          </div>
          
          {/* 领取按钮 */}
          <button
            onClick={() => onClaimReward(achievement.id, achievement.rewardXp, achievement.rewardGold)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            <Gift className="inline-block mr-2 h-5 w-5" /> 领取奖励
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardModal;
```

### 2. shared/TomatoTimer.tsx - 番茄钟组件

```typescript
import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TomatoTimerProps {
  timeLeft: number;
  isActive: boolean;
  duration: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onChangeDuration: (duration: number) => void;
}

const TomatoTimer: React.FC<TomatoTimerProps> = ({
  timeLeft,
  isActive,
  duration,
  onToggleTimer,
  onResetTimer,
  onChangeDuration
}) => {
  // 格式化时间为 MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 计算进度百分比
  const progress = Math.round((timeLeft / (duration * 60)) * 100);

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 shadow-md">
      <h3 className="text-lg font-bold mb-4 text-center">番茄钟</h3>
      
      {/* 计时器显示 */}
      <div className="relative mb-6">
        {/* 进度环 */}
        <div className="w-48 h-48 mx-auto relative">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* 背景环 */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="10"
            />
            {/* 进度环 */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * progress) / 100}
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          
          {/* 时间显示 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl font-bold">{formatTime(timeLeft)}</div>
          </div>
        </div>
      </div>
      
      {/* 控制按钮 */}
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={onToggleTimer}
          className="p-3 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors shadow-md"
          title={isActive ? '暂停' : '开始'}
        >
          {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </button>
        <button
          onClick={onResetTimer}
          className="p-3 rounded-full bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors shadow-md"
          title="重置"
        >
          <RotateCcw className="h-6 w-6" />
        </button>
      </div>
      
      {/* 时长设置 */}
      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
          专注时长: {duration} 分钟
        </label>
        <input
          type="range"
          min="5"
          max="60"
          step="5"
          value={duration}
          onChange={(e) => onChangeDuration(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default TomatoTimer;
```

### 3. shared/AvatarProfile.tsx - 头像资料组件

```typescript
import React from 'react';
import { Crown } from 'lucide-react';

interface AvatarProfileProps {
  name?: string;
  level: number;
  xp: number;
  balance: number;
  className?: string;
}

const AvatarProfile: React.FC<AvatarProfileProps> = ({ 
  name = '冒险者', 
  level, 
  xp, 
  balance, 
  className = '' 
}) => {
  // 计算下一级所需经验
  const xpPerLevel = 100;
  const nextLevelXp = xpPerLevel * level;
  const currentLevelXp = xpPerLevel * (level - 1);
  const currentXpInLevel = xp - currentLevelXp;
  const xpProgress = Math.round((currentXpInLevel / xpPerLevel) * 100);

  return (
    <div className={`p-4 rounded-lg bg-white dark:bg-zinc-900 shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-4">
        {/* 头像和名称 */}
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
            {name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-lg">{name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">等级 {level}</div>
          </div>
        </div>
        
        {/* 皇冠图标 */}
        <Crown className="h-6 w-6 text-yellow-500" />
      </div>
      
      {/* 经验条 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-300">经验值</span>
          <span className="font-medium">{xp} / {nextLevelXp}</span>
        </div>
        <div className="h-2 w-full bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>
      
      {/* 金币 */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600 dark:text-gray-300">金币</span>
        <span className="font-bold text-xl text-yellow-500">{balance} 💰</span>
      </div>
    </div>
  );
};

export default AvatarProfile;
```

---

## 第十段：自定义Hooks

### 1. hooks/useHabits.ts - 习惯管理Hook

```typescript
import { useState, useEffect } from 'react';
import { Habit } from '../types';
import { useStorage } from '../features/storage';
import { INITIAL_HABITS } from '../constants';

interface UseHabitsReturn {
  habits: Habit[];
  addHabit: (name: string, reward: number) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, dateStr: string) => void;
  archivedHabits: Habit[];
  restoreHabit: (id: string) => void;
}

export const useHabits = (): UseHabitsReturn => {
  const [habits, setHabits] = useStorage<Habit[]>('habits', INITIAL_HABITS);

  // 分离活跃习惯和已归档习惯
  const archivedHabits = habits.filter(habit => habit.archived);
  const activeHabits = habits.filter(habit => !habit.archived);

  // 添加习惯
  const addHabit = (name: string, reward: number) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      reward,
      xp: Math.ceil(reward * 1.5),
      duration: reward,
      streak: 0,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      attr: 'discipline',
      archived: false,
      history: {},
      logs: {}
    };
    setHabits([...habits, newHabit]);
  };

  // 更新习惯
  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, ...updates } : habit
    ));
  };

  // 删除习惯
  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };

  // 切换习惯完成状态
  const toggleHabit = (id: string, dateStr: string) => {
    setHabits(habits.map(habit => {
      if (habit.id !== id) return habit;
      
      const wasDone = !!habit.history[dateStr];
      const newHistory = { ...habit.history };
      
      if (wasDone) {
        delete newHistory[dateStr];
        return { ...habit, history: newHistory, streak: Math.max(0, habit.streak - 1) };
      } else {
        newHistory[dateStr] = true;
        return { ...habit, history: newHistory, streak: habit.streak + 1 };
      }
    }));
  };

  // 恢复已归档习惯
  const restoreHabit = (id: string) => {
    updateHabit(id, { archived: false });
  };

  return {
    habits: activeHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    archivedHabits,
    restoreHabit
  };
};
```

### 2. hooks/useProjects.ts - 项目管理Hook

```typescript
import { useState, useEffect } from 'react';
import { Project, SubTask } from '../types';
import { useStorage } from '../features/storage';
import { INITIAL_PROJECTS } from '../constants';

interface UseProjectsReturn {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'todayFocusMinutes' | 'dailyFocus'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addSubTask: (projectId: string, text: string) => void;
  toggleSubTask: (projectId: string, subTaskId: string) => void;
  updateSubTask: (projectId: string, subTaskId: string, updates: Partial<SubTask>) => void;
  deleteSubTask: (projectId: string, subTaskId: string) => void;
  completedProjects: Project[];
  archivedProjects: Project[];
  archiveProject: (id: string) => void;
  restoreProject: (id: string) => void;
}

export const useProjects = (): UseProjectsReturn => {
  const [projects, setProjects] = useStorage<Project[]>('projects', INITIAL_PROJECTS);

  // 分离不同状态的项目
  const activeProjects = projects.filter(project => project.status === 'active');
  const completedProjects = projects.filter(project => project.status === 'completed');
  const archivedProjects = projects.filter(project => project.status === 'archived');

  // 添加项目
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'todayFocusMinutes' | 'dailyFocus'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      todayFocusMinutes: 0,
      dailyFocus: {}
    };
    setProjects([...projects, newProject]);
  };

  // 更新项目
  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ));
  };

  // 删除项目
  const deleteProject = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  // 添加子任务
  const addSubTask = (projectId: string, text: string) => {
    setProjects(projects.map(project => {
      if (project.id !== projectId) return project;
      
      const newSubTask: SubTask = {
        id: `subtask-${Date.now()}`,
        text,
        completed: false,
        reward: 10,
        xp: 15
      };
      
      return {
        ...project,
        subTasks: [...project.subTasks, newSubTask]
      };
    }));
  };

  // 切换子任务完成状态
  const toggleSubTask = (projectId: string, subTaskId: string) => {
    setProjects(projects.map(project => {
      if (project.id !== projectId) return project;
      
      const updatedSubTasks = project.subTasks.map(subTask => 
        subTask.id === subTaskId ? { ...subTask, completed: !subTask.completed } : subTask
      );
      
      // 检查是否所有子任务都已完成
      const allDone = updatedSubTasks.length > 0 && updatedSubTasks.every(t => t.completed);
      
      return {
        ...project,
        subTasks: updatedSubTasks,
        status: allDone ? 'completed' : project.status === 'completed' ? 'active' : project.status,
        completedAt: allDone ? new Date().toISOString() : undefined
      };
    }));
  };

  // 更新子任务
  const updateSubTask = (projectId: string, subTaskId: string, updates: Partial<SubTask>) => {
    setProjects(projects.map(project => {
      if (project.id !== projectId) return project;
      
      const updatedSubTasks = project.subTasks.map(subTask => 
        subTask.id === subTaskId ? { ...subTask, ...updates } : subTask
      );
      
      return {
        ...project,
        subTasks: updatedSubTasks
      };
    }));
  };

  // 删除子任务
  const deleteSubTask = (projectId: string, subTaskId: string) => {
    setProjects(projects.map(project => {
      if (project.id !== projectId) return project;
      
      return {
        ...project,
        subTasks: project.subTasks.filter(subTask => subTask.id !== subTaskId)
      };
    }));
  };

  // 归档项目
  const archiveProject = (id: string) => {
    updateProject(id, { status: 'archived' as const });
  };

  // 恢复项目
  const restoreProject = (id: string) => {
    updateProject(id, { status: 'active' as const });
  };

  return {
    projects: activeProjects,
    addProject,
    updateProject,
    deleteProject,
    addSubTask,
    toggleSubTask,
    updateSubTask,
    deleteSubTask,
    completedProjects,
    archivedProjects,
    archiveProject,
    restoreProject
  };
};
```

### 3. hooks/useGameState.ts - 游戏状态管理Hook

```typescript
import { useState, useEffect } from 'react';
import { useStorage } from '../features/storage';

interface GameState {
  day: number;
  balance: number;
  xp: number;
  checkInStreak: number;
  lastLoginDate: string;
}

const INITIAL_GAME_STATE: GameState = {
  day: 1,
  balance: 1000,
  xp: 0,
  checkInStreak: 0,
  lastLoginDate: ''
};

export const useGameState = () => {
  const [gameState, setGameState] = useStorage<GameState>('gameState', INITIAL_GAME_STATE);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化游戏状态
  useEffect(() => {
    if (isInitialized) return;
    
    const today = new Date().toLocaleDateString();
    
    // 检查是否是新的一天
    if (gameState.lastLoginDate !== today) {
      // 更新连续签到
      let newStreak = gameState.checkInStreak;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString();
      
      if (gameState.lastLoginDate === yesterdayStr) {
        // 连续签到
        newStreak += 1;
      } else if (gameState.lastLoginDate !== today) {
        // 断签
        newStreak = 1;
      }
      
      // 更新游戏状态
      setGameState(prev => ({
        ...prev,
        day: prev.day + 1,
        checkInStreak: newStreak,
        lastLoginDate: today
      }));
    }
    
    setIsInitialized(true);
  }, [gameState, isInitialized, setGameState]);

  // 更新余额
  const updateBalance = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      balance: prev.balance + amount
    }));
  };

  // 更新经验值
  const updateXp = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      xp: prev.xp + amount
    }));
  };

  // 手动签到
  const checkIn = () => {
    const today = new Date().toLocaleDateString();
    if (gameState.lastLoginDate === today) return;
    
    setGameState(prev => ({
      ...prev,
      checkInStreak: prev.checkInStreak + 1,
      lastLoginDate: today
    }));
  };

  return {
    ...gameState,
    updateBalance,
    updateXp,
    checkIn
  };
};
```

---

## 第十一段：项目文档

### README.md - 项目说明文档

```markdown
# 人生游戏管理系统

一个基于游戏化思维的人生管理系统，帮助你实现目标，培养习惯，追踪进度。

## 功能特性

- 🎮 **游戏化体验**：将人生管理转化为游戏，提高积极性
- 📊 **数据可视化**：通过图表直观展示你的进度和成就
- 🎯 **目标管理**：设定和追踪长期、中期、短期目标
- 🔄 **习惯养成**：培养良好习惯，建立持续动力
- 🏆 **成就系统**：解锁成就，获得奖励
- 📈 **数据分析**：深入分析你的行为模式和进步趋势
- 🎨 **多种主题**：支持浅色、深色和拟态主题
- 📱 **响应式设计**：适配各种设备尺寸
- 💾 **本地存储**：数据安全存储在本地

## 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite 6
- **状态管理**：React Hooks + localStorage
- **UI组件**：Lucide React（图标）
- **数据可视化**：Recharts
- **动画效果**：Canvas-confetti
- **拖拽功能**：@dnd-kit

## 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- npm 9.x 或更高版本

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist` 目录

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
人生游戏管理系统/
├── src/
│   ├── components/          # React组件
│   ├── features/            # 功能模块
│   ├── constants/           # 常量定义
│   ├── types/               # TypeScript类型定义
│   ├── utils/               # 工具函数
│   ├── hooks/               # 自定义Hooks
│   ├── App.tsx              # 主应用组件
│   ├── index.tsx            # 应用入口
│   └── index.css            # 全局样式
├── components/              # 独立组件目录
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript配置
├── vite.config.ts           # Vite配置
└── README.md                # 项目说明
```

## 核心功能模块

| 模块 | 主要功能 | 文件位置 |
|------|----------|----------|
| 主应用 | 应用入口和状态管理 | src/App.tsx |
| 导航 | 页面导航和状态控制 | components/Navigation.tsx |
| 游戏中心 | 习惯和项目管理 | components/LifeGame.tsx |
| 数据图表 | 数据可视化分析 | components/MissionControl.tsx |
| 荣誉殿堂 | 成就和勋章展示 | components/HallOfFame.tsx |
| 设置中心 | 系统配置管理 | components/Settings.tsx |
| 存储管理 | 数据持久化 | features/storage/useStorage.ts |
| 番茄钟 | 时间管理 | features/pomodoro/usePomodoro.ts |
| 命运骰子 | 随机任务生成 | features/dice/useDice.ts |
| 成就系统 | 成就解锁和奖励 | features/achievements/useAchievements.ts |
| 统计分析 | 数据统计和分析 | features/stats/useStats.ts |

## 开发指南

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规范
- 使用 Prettier 格式化代码
- 组件使用函数式组件和Hooks
- 状态管理使用 React Context 或自定义 Hooks

### 提交规范

- `feat`: 新增功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试代码
- `chore`: 构建过程或辅助工具的变动

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎通过以下方式联系：

- Issue: [GitHub Issues](https://github.com/yourusername/life-game-system/issues)
- Email: your.email@example.com

## 更新日志

### v4.5.0
- ✨ 新增拟态主题
- 📊 优化数据可视化图表
- 🎮 增强游戏化体验
- 🔧 修复已知bug
- 📱 优化移动端体验

### v4.0.0
- 🎨 全新UI设计
- 📊 新增多种图表类型
- 🏆 完善成就系统
- 🔄 优化数据同步机制
- 📱 响应式设计改进

### v3.0.0
- 🎮 游戏化任务系统
- 📊 数据可视化功能
- 🏆 成就系统
- 💾 本地存储
- 🎨 主题切换

### v2.0.0
- ✨ 习惯养成系统
- 📱 移动端适配
- 🔧 性能优化

### v1.0.0
- 🎉 初始版本发布
- 📝 基础任务管理
- 📊 简单统计功能

## 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**人生游戏管理系统** - 让你的人生更精彩！ 🎮✨
```

### .gitignore - Git忽略配置

```gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build files
build/
.cache/

# OS generated files
Thumbs.db
.DS_Store

# Temporary files
*.tmp
*.temp
*.bak

# Testing
coverage/
.nyc_output/

# Misc
*.tsbuildinfo
```

---

## 第九段：开发脚本

### updateCharts.cjs - 更新图表数据脚本

```javascript
const fs = require('fs');
const path = require('path');

// 读取MissionControl.tsx文件
const missionControlPath = path.join(__dirname, 'components', 'MissionControl.tsx');
let content = fs.readFileSync(missionControlPath, 'utf8');

// 定义新的visualDesign属性内容
const newVisualDesigns = {
  pareto: `<div class="container">
  <div class="header">
    <h1>二八定律 - 帕累托法则可视化</h1>
    <p>80%的结果由20%的关键行动产生</p>
  </div>
  <!-- 图表内容 -->
</div>`,

  swot: `<div class="container">
  <div class="header">
    <h1>SWOT分析 - 全面评估目标可行性</h1>
    <p>从优势、劣势、机会、威胁四个维度全面分析</p>
  </div>
  <!-- 图表内容 -->
</div>`
};

// 更新图表的visualDesign属性
for (const [chartId, newDesign] of Object.entries(newVisualDesigns)) {
  const regex = new RegExp(`(id:\s*['"]${chartId}['"],\s*[^}]*?visualDesign:\s*)[^,}]+`, 'gs');
  content = content.replace(regex, `$1${JSON.stringify(newDesign)}`);
}

// 修复SVG注释和CSS样式问题
content = content.replace(/<!--(.*?)-->/g, '{/*$1*/}');
content = content.replace(/<style[^>]*>([\s\S]*?)<\/style>/g, '');

// 保存更新后的文件
fs.writeFileSync(missionControlPath, content, 'utf8');
console.log('MissionControl.tsx updated successfully!');
```

---

## 系统完整代码结构文档完成

本文档包含了人生游戏管理系统的所有代码结构和核心实现，按模块和组件进行了详细的分类和描述。系统基于React 19和TypeScript开发，采用了现代化的前端架构设计，支持主题定制、数据可视化、游戏化设计等多种功能。

### 使用说明

1. **分段使用**：将文档按段复制粘贴，分别发送给AI
2. **完整导入**：直接使用完整文档进行系统复刻
3. **参考学习**：作为前端开发学习参考
4. **扩展开发**：基于现有代码进行功能扩展

### 系统特点

- 🎮 **游戏化体验**：将管理系统转化为游戏，提高用户积极性
- 📊 **数据可视化**：直观展示数据和进度
- 🎯 **目标管理**：支持习惯和项目管理
- 🏆 **成就系统**：激励用户持续进步
- 🎨 **主题定制**：支持多种主题切换
- 💾 **本地存储**：数据安全存储在本地
- 📱 **响应式设计**：适配不同设备尺寸
- 🔧 **模块化设计**：便于维护和扩展

---

**人生游戏管理系统** - 让你的人生更精彩！ 🎮✨