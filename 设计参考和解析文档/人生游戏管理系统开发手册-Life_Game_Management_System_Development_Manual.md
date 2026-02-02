# 人生游戏化管理系统开发手册

## 项目概述

人生游戏化管理系统是一个将人生成长与游戏机制相结合的Web应用，旨在通过游戏化元素激励用户完成任务、培养习惯、提升自我。系统采用React + TypeScript开发，使用Vite作为构建工具，具有角色系统、任务管理、命运骰子、数据可视化等核心功能。

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 6.2.0
- **状态管理**: React Hooks + Context API
- **UI组件库**: 自定义组件 + Lucide React图标库 (v0.561.0)
- **数据可视化**: Recharts (v3.6.0) + 自定义SVG图表
- **样式方案**: 内联样式 + CSS变量 + 动态主题
- **数据持久化**: localStorage
- **第三方库**: 
  - canvas-confetti: 成就庆祝效果 (v1.9.2)
  - lucide-react: 图标库 (v0.561.0)
  - recharts: 图表库 (v3.6.0)
  - webdav-server: WebDAV服务器（开发依赖，v2.6.2）

## 性能优化

### 1. 代码分割和懒加载

```typescript
// 懒加载组件
const MissionControl = lazy(() => import('./components/MissionControl'));
const LifeGame = lazy(() => import('./components/LifeGame'));
const HallOfFame = lazy(() => import('./components/HallOfFame'));
const Settings = lazy(() => import('./components/Settings'));
const ThinkingCenter = lazy(() => import('./components/ThinkingCenter'));
const TimeBox = lazy(() => import('./components/TimeBox'));
const SelfManifestation = lazy(() => import('./components/SelfManifestation'));

// 使用Suspense包裹
<Suspense fallback={
  <div className="flex items-center justify-center h-full w-full">
    <div className={`text-2xl font-bold ${theme.includes('dark') ? 'text-emerald-500' : 'text-emerald-700'}`}>
      加载中...
    </div>
  </div>
}>
  {renderView()}
</Suspense>
```

### 2. 构建配置优化

```typescript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
      passes: 2,
      pure_funcs: ['console.log', 'console.warn', 'console.error']
    },
    mangle: {
      toplevel: true,
      properties: {
        regex: /^_/,
        keep_quoted: true
      }
    }
  },
  cssCodeSplit: true,
  chunkSizeWarningLimit: 1000,
  rollupOptions: {
    output: {
      manualChunks: {
        react: ['react', 'react-dom'],
        recharts: ['recharts'],
        dndkit: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        three: ['three', 'three-stdlib'],
        googlegenai: ['@google/genai'],
        lucide: ['lucide-react'],
        crypto: ['crypto-js', 'bcryptjs', 'jsonwebtoken'],
        audio: ['@tweenjs/tween.js']
      }
    }
  }
}
```

### 3. 渲染性能优化

```typescript
// 使用useCallback缓存回调函数
const handleUpdateBalance = useCallback((amount: number, reason: string) => {
  // 函数逻辑
}, []);

const handleClaimReward = useCallback((id: string, rewardXp: number, rewardGold: number) => {
  // 函数逻辑
}, [handleUpdateBalance]);

// 其他回调函数也使用useCallback缓存
```

### 4. 响应式设计优化

- 优化移动设备加载速度
- 确保界面在不同屏幕尺寸下都能正常显示
- 减少移动设备上的不必要渲染

## 项目结构

```
人生游戏管理系统/
├── components/          # 组件目录
│   ├── HelpSystem/      # 帮助系统组件
│   │   ├── HelpContent.tsx     # 帮助内容定义
│   │   ├── HelpModal.tsx       # 帮助弹窗组件
│   │   ├── HelpTooltip.tsx     # 帮助提示组件
│   │   └── index.tsx           # 帮助系统入口
│   ├── shared/          # 共享组件
│   │   ├── AvatarProfile.tsx   # 头像组件
│   │   ├── FateGiftModal.tsx   # 命运礼物弹窗
│   │   ├── MantraModule.tsx    # 咒语模块
│   │   ├── MilitaryModule.tsx  # 军事模块
│   │   ├── RewardModal.tsx     # 奖励弹窗
│   │   └── TomatoTimer.tsx     # 番茄钟组件
│   ├── BaseChart.tsx           # 基础图表组件
│   ├── CharacterProfile.tsx    # 角色资料组件
│   ├── ChartConfig.tsx         # 图表配置组件
│   ├── ConceptCharts.tsx       # 概念图表组件
│   ├── DailyCheckIn.tsx        # 每日签到组件
│   ├── FrostedDiceExample.tsx  # 磨砂骰子示例组件
│   ├── HallOfFame.tsx          # 名人堂组件
│   ├── LifeGame.tsx            # 核心游戏组件
│   ├── MissionControl.tsx      # 任务控制面板
│   ├── Navigation.tsx          # 导航组件
│   └── Settings.tsx            # 设置组件
├── constants/          # 常量定义
│   └── index.ts        # 常量导出
├── features/           # 功能模块
│   ├── achievements/   # 成就系统
│   │   ├── index.ts            # 成就系统入口
│   │   └── useAchievements.tsx # 成就系统Hook
│   ├── dice/           # 命运骰子功能
│   │   ├── index.ts            # 命运骰子入口
│   │   └── useDice.ts          # 命运骰子Hook
│   ├── pomodoro/       # 番茄钟功能
│   │   ├── index.ts            # 番茄钟入口
│   │   └── usePomodoro.ts      # 番茄钟Hook
│   ├── stats/          # 统计功能
│   │   ├── index.ts            # 统计功能入口
│   │   └── useStats.ts         # 统计功能Hook
│   └── storage/        # 存储功能
│       ├── index.ts            # 存储功能入口
│       └── useStorage.ts       # 存储功能Hook
├── hooks/              # 自定义Hooks
│   ├── useGameState.ts         # 游戏状态Hook
│   ├── useHabits.ts            # 习惯管理Hook
│   └── useProjects.ts          # 项目管理Hook
├── public/             # 静态资源
│   ├── manifest.json           # PWA配置
│   ├── service-worker.js       # Service Worker
│   └── sw.js                   # Service Worker
├── utils/              # 工具函数
│   └── webdavClient.ts         # WebDAV客户端
├── App.tsx             # 主应用组件
├── DEVELOPMENT_DOC.md  # 开发文档
├── README.md           # 项目说明文档
├── capacitor.config.ts # Capacitor配置
├── index.html          # HTML入口文件
├── index.tsx           # 应用入口文件
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript配置
├── types.ts            # TypeScript类型定义
├── vite.config.ts      # Vite配置
└── 人生游戏管理系统开发手册.txt # 本开发手册
```

## 核心功能模块

### 1. SUBBGM和肯定语系统

#### 1.1 功能概述

SUBBGM和肯定语系统是一个帮助用户通过背景音乐和积极肯定语句进行自我提升的功能模块，集成在自我显化(对齐)组件中。

#### 1.2 核心功能

- **SUBBGM管理**：支持添加、编辑、删除背景音乐
- **肯定语管理**：支持添加、编辑、删除积极肯定语句
- **播放控制**：背景音乐播放、暂停、音量调节
- **显示模式**：肯定语滚动显示、高亮显示
- **数据持久化**：本地存储所有配置

#### 1.3 UI设计

```tsx
// SUBBGM和肯定语标签页
const subBgmActiveTab = useState('subBgm');

// 标签页切换
<div className="flex gap-2 mb-4 overflow-x-auto">
  <button 
    className={`px-4 py-2 rounded-lg font-medium ${subBgmActiveTab === 'subBgm' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700'}`}
    onClick={() => setSubBgmActiveTab('subBgm')}
  >
    SUB&KDY
  </button>
</div>

// SUBBGM模块
<div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6">
  <h3 className="text-xl font-bold mb-4">SUBBGM</h3>
  {/* 音频管理功能 */}
</div>

// 肯定语模块
<div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6">
  <h3 className="text-xl font-bold mb-4">肯定语</h3>
  {/* 肯定语管理和显示功能 */}
</div>
```

#### 1.4 功能集成与优化

- **多组件集成**：将SUBBGM和肯定语功能从SelfManifestation组件复制到最高版本构建(ZWM Pro)组件
- **布局优化**：放在现实剧本和AI助理之间，优化了功能布局
- **UI改进**：采用拟态风格和大圆角，提升视觉效果
- **命名优化**：将SUBBGM & 肯定语按钮标签优化为SUB&KDY

### 2. 角色系统

#### 2.1 属性系统

- **核心属性**: 力量、智力、魅力、创造力、社交、财富、自律
- **属性范围**: 0-150
- **属性获取**: 每项任务完成后获得1-5点属性点
- **属性影响**: 影响角色等级、解锁成就、获得特殊称号

#### 1.2 等级系统

- **经验值**: 通过完成任务、专注时间获得
- **等级公式**: 每级所需经验 = 基础经验 * 等级系数
- **等级上限**: 无上限
- **等级奖励**: 每级获得100金币、50经验值、解锁新功能

#### 1.3 成就系统

- **成就类型**: 任务成就、习惯成就、专注成就、财富成就、签到成就
- **成就数量**: 初始60个成就
- **成就奖励**: 50-500金币、20-200经验值、特殊称号
- **成就解锁**: 完成特定条件自动解锁
- **成就展示**: 在名人堂中以卡片形式展示

### 2. 任务管理

#### 2.1 任务分类

- **习惯任务**: 每日可重复完成的任务，如"早起"、"运动"
- **项目任务**: 长期任务，包含多个子任务，如"完成项目开发"
- **随机挑战**: 每日随机生成3个任务，如"学习新技能"
- **命运骰子任务**: 通过命运骰子随机生成的任务

#### 2.2 任务数据结构

```typescript
// 习惯任务数据结构
export interface Habit {
  id: string;              // 唯一标识
  name: string;            // 任务名称
  reward: number;          // 完成奖励（金币）
  xp: number;              // 完成奖励（经验值）
  duration: number;        // 预计耗时（分钟）
  streak: number;          // 连续完成天数
  color: string;           // 任务颜色
  attr: AttributeType;     // 关联属性
  archived: boolean;       // 是否已归档
  history: Record<string, boolean>; // 历史完成记录
  logs: Record<string, any>;       // 详细日志
}

// 项目任务数据结构
export interface Project {
  id: string;              // 唯一标识
  name: string;            // 项目名称
  description: string;     // 项目描述
  status: 'active' | 'completed' | 'archived'; // 项目状态
  subTasks: SubTask[];     // 子任务列表
  reward: number;          // 完成奖励（金币）
  xp: number;              // 完成奖励（经验值）
  color: string;           // 项目颜色
  createdAt: string;       // 创建时间
  completedAt?: string;    // 完成时间
  todayFocusMinutes: number; // 今日专注时间
  dailyFocus: Record<string, number>; // 每日专注时间记录
}

// 子任务数据结构
export interface SubTask {
  id: string;              // 唯一标识
  text: string;            // 子任务内容
  completed: boolean;      // 是否完成
  reward?: number;         // 完成奖励
  xp?: number;             // 完成经验值
}
```

### 3. 命运骰子系统

#### 3.1 功能概述

命运骰子系统是一个随机任务生成机制，用户可以通过点击骰子获得随机任务，完成后获得奖励。

#### 3.2 核心配置

```typescript
export const INITIAL_DICE_STATE: DiceState = {
  todayCount: 0,           // 今日使用次数
  maxDailyCount: 5,        // 每日最大次数
  lastClickDate: '',       // 最后点击日期
  currentResult: null,     // 当前骰子结果
  taskPool: {              // 任务池
    [DiceCategory.HEALTH]: [],       // 健康任务
    [DiceCategory.EFFICIENCY]: [],   // 效率任务
    [DiceCategory.LEISURE]: []       // 休闲任务
  },
  history: [],             // 历史记录
  config: {
    categoryDistribution: {
      [DiceCategory.HEALTH]: 30,     // 健康任务权重
      [DiceCategory.EFFICIENCY]: 40, // 效率任务权重
      [DiceCategory.LEISURE]: 30      // 休闲任务权重
    },
    dailyLimit: 5          // 每日限制次数
  },
  pendingTasks: [],        // 待处理任务
  completedTasks: []       // 已完成任务
};
```

#### 3.3 骰子样式细节

**磨砂质感骰子**:
```tsx
<button 
  className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]' : isDark ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700' : 'bg-gradient-to-br from-white to-slate-100 border-slate-200'} border-4 shadow-lg hover:shadow-xl group`}
>
  {/* 3D骰子效果容器 */}
  <div className={`relative transition-all duration-500`} style={{ perspective: '500px' }}>
    {/* 磨砂质感背景 */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-blue-100 opacity-20 blur-lg transform rotate-45"></div>
    <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-blue-200 to-blue-500 opacity-10 blur-md transform -rotate-45`}></div>
    
    {/* 3D旋转骰子 */}
    <div className={`relative z-10 transition-all duration-1000`} style={{ transformStyle: 'preserve-3d' }}>
      <Dice5 
        size={44} 
        className={`relative z-10 transition-all duration-300 text-blue-500 group-hover:text-blue-600 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]`} 
      />
      {/* 骰子投影效果 */}
      <div className="absolute inset-0 rounded-full bg-blue-500 opacity-5 blur-xl translate-z-[-20px] scale-[1.2]"></div>
    </div>
    
    {/* 骰子高光效果 */}
    <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-white opacity-30 blur-sm"></div>
    <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full bg-white opacity-10 blur-sm"></div>
  </div>
</button>
```

### 4. 数据可视化系统

#### 4.1 图表配置

```typescript
// 图表配置常量
export const CHART_CONFIG = {
  fontSize: {
    title: 16,
    axisLabel: 12,
    axisTick: 10,
    legend: 12
  },
  colors: {
    purple: '#8b5cf6',
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    orange: '#f97316'
  },
  legend: {
    wrapperStyle: {
      paddingTop: 10,
      fontSize: 12
    }
  }
};
```

#### 4.2 主题配置

```typescript
// 主题类型
export type Theme = 'light' | 'dark' | 'neomorphic';

// 主题样式
export const THEMES = {
  light: {
    background: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    card: '#ffffff',
    cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  },
  dark: {
    background: '#0f172a',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    border: '#334155',
    card: '#1e293b',
    cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    primary: '#60a5fa',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171'
  },
  neomorphic: {
    background: '#e0e5ec',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e0e5ec',
    card: '#e0e5ec',
    cardShadow: '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,1)',
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  }
};
```

### 5. 专注时间系统

#### 5.1 番茄钟配置

```typescript
export const POMODORO_CONFIG = {
  DEFAULT_FOCUS_DURATION: 25,   // 默认专注时长（分钟）
  DEFAULT_BREAK_DURATION: 5,    // 默认休息时长（分钟）
  DEFAULT_LONG_BREAK_DURATION: 15, // 默认长休息时长（分钟）
  LONG_BREAK_INTERVAL: 4,       // 长休息间隔（番茄钟数量）
  MAX_DURATION: 60,             // 最大时长限制
  MIN_DURATION: 1,              // 最小时长限制
};
```

#### 5.2 番茄钟样式

```tsx
<div className="flex flex-col items-center justify-center w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">
  <div className="text-6xl font-bold mb-4" id="timer">
    {formatTime(timeLeft)}
  </div>
  <div className="flex gap-4 mb-6">
    <button 
      onClick={handleToggle} 
      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      {isActive ? '暂停' : '开始'}
    </button>
    <button 
      onClick={handleReset} 
      className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
    >
      重置
    </button>
  </div>
  <div className="flex gap-2">
    <button 
      onClick={() => handleChangeDuration(25)} 
      className={`px-4 py-2 rounded-lg ${duration === 25 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
    >
      25分
    </button>
    <button 
      onClick={() => handleChangeDuration(30)} 
      className={`px-4 py-2 rounded-lg ${duration === 30 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
    >
      30分
    </button>
    <button 
      onClick={() => handleChangeDuration(45)} 
      className={`px-4 py-2 rounded-lg ${duration === 45 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
    >
      45分
    </button>
  </div>
</div>
```

### 6. UI优化与用户体验

#### 6.1 视觉设计优化

- **拟态风格应用**：顶部标签栏采用拟态风格，圆角拉满
- **按钮设计**：统一了按钮颜色，确保与主题色一致
- **布局紧凑**：缩小了按钮和容器尺寸，使界面更紧凑
- **圆角设计**：采用大圆角设计，提升视觉舒适度

#### 6.2 功能模块优化

- **每日任务模块**：添加了编辑按钮，可添加和删除任务
- **身份蓝图**：默认展开状态，提高用户体验
- **剧本管理**：保存的剧本可以编辑和删除
- **SUBBGM模块**：调整了位置，放在顶部，优化了展示效果

#### 6.3 交互体验

- **布局优化**：移除了顶部不必要的切换按钮
- **肯定语展示**：优化了kdy展示部分的布局
- **响应式设计**：确保界面在不同屏幕尺寸下都能正常显示

### 7. 数据管理与存储

#### 7.1 本地存储

- **API密钥管理**：API密钥本地存储功能
- **数据持久化**：本地数据持久化改进，确保数据安全

#### 7.2 备份功能

- **数据导出**：支持数据导出功能
- **数据导入**：支持数据导入功能
- **备份优化**：备份功能整体优化，提升用户体验

### 8. 命名规范与优化

- **组件命名**：将HighestVersion组件重命名为自我显化(对齐)
- **功能命名**：将"最高版本自我 (ZWM Pro)"重命名为"最高版本构建(ZWM Pro)"
- **标签命名**：将SUBBGM & 肯定语按钮标签优化为SUB&KDY

### 9. 技术改进

#### 9.1 代码质量

- **状态管理**：修复了重复状态变量导致的冲突
- **语法错误**：修复了模板字符串语法错误
- **结构优化**：修复了JSX结构错误
- **类型安全**：解决了TypeScript编译错误

#### 9.2 主题适配

- **深色模式**：确保所有组件在深色模式下正确显示
- **颜色统一**：统一了拟态深色主题的背景色
- **一致性**：修复了颜色不一致的问题

#### 9.3 性能优化

- **代码分割**：使用React.lazy和Suspense实现了组件的按需加载
- **构建优化**：改进了Vite构建配置，添加了详细的代码分割策略
- **渲染优化**：为所有回调函数添加了useCallback缓存，减少了不必要的重新渲染
- **移动设备**：优化了移动设备的加载速度

## 核心组件详细实现

### 1. App.tsx - 主应用组件

**布局结构**:
```tsx
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
```

**主题切换逻辑**:
```tsx
const handleToggleTheme = () => {
  setTheme(prev => {
    if (prev === 'neomorphic') return 'light';
    if (prev === 'light') return 'dark';
    return 'neomorphic';
  });
};
```

### 2. Navigation.tsx - 导航组件

**导航项配置**:
```typescript
const navItems = [
  {
    id: View.RPG_MISSION_CENTER,
    label: '任务中心',
    icon: Target,
    color: '#3b82f6',
    exact: true
  },
  {
    id: View.BLACK_MARKET,
    label: '黑市',
    icon: ShoppingBag,
    color: '#8b5cf6'
  },
  {
    id: View.HALL_OF_FAME,
    label: '名人堂',
    icon: Crown,
    color: '#f59e0b'
  },
  {
    id: View.DATA_CHARTS,
    label: '数据中心',
    icon: BarChart2,
    color: '#10b981'
  },
  {
    id: View.SETTINGS,
    label: '设置',
    icon: Settings,
    color: '#6b7280'
  }
];
```

**导航样式**:
```tsx
<div className={`fixed top-0 left-0 h-full bg-white dark:bg-zinc-800 shadow-lg z-50 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
  {/* 导航头部 */}
  <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
    <div className="flex items-center justify-between">
      <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center w-full' : ''}`}>
        <Gamepad2 className="w-8 h-8 text-blue-500" />
        {!isCollapsed && <span className="text-xl font-bold">人生游戏</span>}
      </div>
      <button 
        onClick={toggleCollapse} 
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
      >
        <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>
    </div>
  </div>
  
  {/* 导航菜单 */}
  <nav className="p-4">
    <ul className="space-y-2">
      {navItems.map(item => (
        <li key={item.id}>
          <button
            onClick={() => setCurrentView(item.id)}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${currentView === item.id 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
              : 'hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300'}`}
          >
            <item.icon className="w-5 h-5" style={{ color: item.color }} />
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        </li>
      ))}
    </ul>
  </nav>
  
  {/* 导航底部 */}
  <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-zinc-700">
    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
      <User className="w-5 h-5 text-gray-500" />
      {!isCollapsed && <span className="text-sm">玩家</span>}
    </div>
  </div>
</div>
```

### 3. LifeGame.tsx - 核心游戏组件

**布局结构**:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* 左侧：任务列表 */}
  <div className="lg:col-span-2 space-y-6">
    {/* 任务标签页 */}
    <div className="flex gap-2 mb-4 overflow-x-auto">
      <button 
        className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'battle' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700'}`}
        onClick={() => setActiveTab('battle')}
      >
        战役（主线任务）
      </button>
      <button 
        className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'habit' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700'}`}
        onClick={() => setActiveTab('habit')}
      >
        习惯协议
      </button>
      <button 
        className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'random' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700'}`}
        onClick={() => setActiveTab('random')}
      >
        随机挑战
      </button>
    </div>
    
    {/* 任务内容 */}
    {activeTab === 'battle' && (
      <div className="space-y-4">
        {projects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onUpdateProject={onUpdateProject} 
            onDeleteProject={onDeleteProject} 
          />
        ))}
      </div>
    )}
    
    {/* 习惯任务 */}
    {activeTab === 'habit' && (
      <div className="space-y-4">
        {habits.map(habit => (
          <HabitCard 
            key={habit.id} 
            habit={habit} 
            onToggleHabit={onToggleHabit} 
            onUpdateHabit={onUpdateHabit} 
            onDeleteHabit={onDeleteHabit} 
          />
        ))}
      </div>
    )}
    
    {/* 随机挑战 */}
    {activeTab === 'random' && (
      <div className="space-y-4">
        {todaysChallenges.tasks.map((task, index) => (
          <RandomChallengeCard 
            key={index} 
            task={task} 
            isCompleted={completedRandomTasks[todaysChallenges.date]?.includes(task) || false} 
            onToggle={onToggleRandomChallenge} 
          />
        ))}
      </div>
    )}
  </div>
  
  {/* 右侧：控制面板 */}
  <div className="space-y-6">
    {/* 角色信息 */}
    <CharacterProfile 
      xp={xp} 
      balance={balance} 
      totalHours={totalHours} 
      totalTasksCompleted={totalTasksCompleted} 
      checkInStreak={checkInStreak} 
      onLevelChange={onLevelChange} 
    />
    
    {/* 命运骰子 */}
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">命运骰子</h3>
      <div className="flex flex-col items-center">
        <FrostedDiceExample 
          onSpin={onSpinDice} 
          diceState={diceState} 
          onDiceResult={onDiceResult} 
        />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          今日剩余次数: {diceState.config.dailyLimit - diceState.todayCount}
        </p>
      </div>
    </div>
    
    {/* 番茄钟 */}
    <TomatoTimer 
      timeLeft={timeLeft} 
      isActive={isActive} 
      duration={duration} 
      onToggleTimer={onToggleTimer} 
      onResetTimer={onResetTimer} 
      onChangeDuration={onChangeDuration} 
      onPomodoroComplete={onPomodoroComplete} 
    />
  </div>
</div>
```

## 数据持久化

### 1. 存储键名

```typescript
export const STORAGE_KEYS = {
  GLOBAL_DATA: 'aes-global-data-v3',       // 全局数据
  DICE_STATE: 'aes-dice-state',            // 命运骰子状态
  LIFE_GAME_STATS: 'life-game-stats-v2',   // 游戏统计数据
  CHECKIN_STREAK: 'aes-checkin-streak',    // 签到连续天数
  SETTINGS: 'aes-settings-v1',             // 设置
  THEME: 'aes-theme-v1'                    // 主题设置
};
```

### 2. 数据加载与保存

**数据加载**:
```tsx
useEffect(() => {
  const savedGlobal = localStorage.getItem(STORAGE_KEYS.GLOBAL_DATA);
  const savedLifeGame = localStorage.getItem(STORAGE_KEYS.LIFE_GAME_STATS);
  const streakStr = localStorage.getItem(STORAGE_KEYS.CHECKIN_STREAK);
  const savedDiceState = localStorage.getItem(STORAGE_KEYS.DICE_STATE);
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  
  // 加载主题设置
  if (savedTheme) {
    setTheme(savedTheme as Theme);
  }
  
  // 加载设置
  if (savedSettings) {
    setSettings(JSON.parse(savedSettings));
  }
  
  // 加载签到连续天数
  if (streakStr) {
    setCheckInStreak(parseInt(streakStr));
  }
  
  // 加载全局数据
  if (savedGlobal) {
    try {
      const data = JSON.parse(savedGlobal);
      setHabits(data.habits || INITIAL_HABITS);
      setProjects(data.projects || INITIAL_PROJECTS);
      setBalance(data.balance || 1250);
      setDay(data.day || 1);
      // 其他数据加载...
    } catch (e) {
      console.error("Global save corrupted", e);
      // 数据损坏时使用默认值
      setHabits(INITIAL_HABITS);
      setProjects(INITIAL_PROJECTS);
      setBalance(1250);
      setDay(1);
    }
  }
  
  // 加载命运骰子状态
  if (savedDiceState) {
    try {
      const diceData = JSON.parse(savedDiceState);
      setDiceState(diceData);
    } catch (e) {
      console.error("Dice save corrupted", e);
      setDiceState(INITIAL_DICE_STATE);
    }
  }
  
  // 加载游戏统计数据
  if (savedLifeGame) {
    try {
      const lgData = JSON.parse(savedLifeGame);
      if (lgData.xp) setXp(lgData.xp);
    } catch (e) {
      console.error("LifeGame save corrupted", e);
      setXp(0);
    }
  }
  
  setIsDataLoaded(true);
}, []);
```

**数据保存**:
```tsx
useEffect(() => {
  if (!isDataLoaded) return;
  
  // 保存全局数据
  const globalData = {
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
    startDate: localStorage.getItem(STORAGE_KEYS.GLOBAL_DATA) ? JSON.parse(localStorage.getItem(STORAGE_KEYS.GLOBAL_DATA)!).startDate : new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.GLOBAL_DATA, JSON.stringify(globalData));
  
  // 保存游戏统计数据
  const lgStats = localStorage.getItem(STORAGE_KEYS.LIFE_GAME_STATS) ? JSON.parse(localStorage.getItem(STORAGE_KEYS.LIFE_GAME_STATS)!) : {};
  lgStats.xp = xp;
  localStorage.setItem(STORAGE_KEYS.LIFE_GAME_STATS, JSON.stringify(lgStats));
  
  // 保存签到连续天数
  localStorage.setItem(STORAGE_KEYS.CHECKIN_STREAK, checkInStreak.toString());
  
  // 保存主题设置
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  
  // 保存设置
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  
  // 保存命运骰子状态
  localStorage.setItem(STORAGE_KEYS.DICE_STATE, JSON.stringify(diceState));
  
}, [habits, projects, habitOrder, projectOrder, balance, day, transactions, reviews, statsHistory, todayStats, challengePool, todaysChallenges, achievements, completedRandomTasks, isDataLoaded, xp, claimedBadges, weeklyGoal, todayGoal, givenUpTasks, theme, settings, diceState, checkInStreak]);
```

## 交互细节

### 1. 任务完成动画

```typescript
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
        
        // 添加浮动奖励动画
        addFloatingText(`+10 金币`, 'text-yellow-500', window.innerWidth / 2 - 80);
        
        setXp(prev => prev + 10);
        
        setTimeout(() => {
          addFloatingText(`+10 经验`, 'text-blue-500', window.innerWidth / 2);
        }, 300);
        
        setTimeout(() => {
          addFloatingText(`+10 专注时间`, 'text-green-500', window.innerWidth / 2 + 80);
        }, 600);

        // 播放成功音效
        playSound("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");

        return { ...h, history: newHistory, streak: h.streak + 1 };
      }
    }
    return h;
  }));
};
```

### 2. 成就解锁动画

```typescript
const handleClaimReward = (id: string, rewardXp: number, rewardGold: number) => {
  setClaimedBadges(prev => [...prev, id]);
  
  const safeGold = rewardGold;
  const safeXp = rewardXp;

  if (safeGold > 0) handleUpdateBalance(safeGold, '成就奖励');
  if (safeXp > 0) {
      setXp(prev => prev + safeXp);
      addFloatingText(`+${safeXp} 经验`, 'text-blue-500', window.innerWidth / 2);
  }
  setActiveAchievement(null); // 关闭弹窗
  
  // 播放成就音效
  playSound("https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3");
  
  // 播放庆祝动画
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
};
```

### 3. 命运骰子动画

```typescript
const spinDice = () => {
  // 播放骰子滚动音效
  playSound("https://assets.mixkit.co/sfx/preview/mixkit-rolling-dice-1911.mp3");
  
  // 开始旋转动画
  setDiceState(prev => ({ ...prev, isSpinning: true }));
  
  // 模拟旋转动画（1.5秒）
  setTimeout(() => {
    // 播放惊喜音效
    playSound("https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3");
    
    // 更新骰子结果
    setDiceState(prev => ({
      ...prev,
      isSpinning: false,
      currentResult: {
        ...task,
        _generatedGold: gold,
        _generatedXp: xp
      } as any,
      todayCount: prev.todayCount + 1
    }));
  }, 1500);
  
  return { success: true };
};
```

## 开发流程

### 1. 环境搭建

```bash
# 克隆项目
git clone <repository-url>

# 进入项目目录
cd 人生游戏管理系统

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 2. 代码规范

**TypeScript配置**:
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

**ESLint配置**:
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": [
    "@typescript-eslint",
    "react",
    "react-hooks"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

## 部署说明

### 1. 本地部署

```bash
# 构建生产版本
npm run build

# 启动本地服务器
npm run preview
```

### 2. 线上部署

**Vercel部署**:
1. 访问 https://vercel.com
2. 点击"New Project"
3. 选择项目仓库
4. 配置构建命令: `npm run build`
5. 配置输出目录: `dist`
6. 点击"Deploy"

**Netlify部署**:
1. 访问 https://app.netlify.com
2. 点击"Add new site"
3. 选择"Import an existing project"
4. 连接GitHub仓库
5. 配置构建命令: `npm run build`
6. 配置发布目录: `dist`
7. 点击"Deploy site"

**GitHub Pages部署**:
1. 修改`vite.config.ts`，添加base配置
   ```typescript
   export default defineConfig({
     base: '/<repository-name>/',
     // 其他配置
   });
   ```
2. 安装`gh-pages`依赖
   ```bash
   npm install -D gh-pages
   ```
3. 在`package.json`中添加部署脚本
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```
4. 构建并部署
   ```bash
   npm run build
   npm run deploy
   ```

## 未来规划

1. **移动端适配**: 优化移动端体验，支持PWA
2. **多端同步**: 添加云端数据同步功能
3. **社交功能**: 添加好友系统和排行榜
4. **AI助手**: 集成Gemini API，提供个性化建议
5. **虚拟商品系统**: 扩展虚拟商品种类和功能
6. **社区功能**: 添加用户社区和内容分享
7. **数据分析**: 提供更深入的数据分析和洞察
8. **API开放**: 提供开放API，支持第三方集成

## 更新日志

### 2026年2月更新

#### 性能优化

1. **代码分割和组件懒加载**
   - 使用 `React.lazy` 和 `Suspense` 实现了组件的按需加载
   - 将大型组件（如 LifeGame、SelfManifestation 等）拆分为独立的代码块
   - 添加了加载状态提示，提升用户体验

2. **构建配置优化**
   - 改进了 Vite 构建配置，添加了详细的代码分割策略
   - 优化了压缩选项，移除了生产环境中的 console 和 debugger 语句
   - 配置了更合理的 chunk 命名和输出路径
   - 启用了 CSS 代码分割，减少了主包体积

3. **组件渲染性能优化**
   - 为所有回调函数添加了 `useCallback` 缓存，减少了不必要的重新渲染
   - 优化了依赖项数组，确保回调函数只在必要时重新创建
   - 提高了应用的响应速度和交互流畅度

4. **资源管理**
   - 检查了项目中的资源文件，确认主要是音频资源，无需图片优化
   - 构建结果显示代码分割效果显著，各个组件都被合理拆分

#### 功能更新

1. **SUBBGM和肯定语功能集成**
   - 将 SUBBGM 和肯定语功能从 SelfManifestation 组件复制到 HighestVersion 组件
   - 优化了功能布局，放在现实剧本和 AI 助理之间
   - 改进了 UI 设计，采用拟态风格和大圆角

2. **UI 优化**
   - 顶部标签栏采用拟态风格，圆角拉满
   - 每日任务模块改进，添加了编辑按钮，可添加和删除任务
   - 身份蓝图默认展开状态
   - 保存的剧本可以编辑和删除
   - 统一了按钮颜色，确保与主题色一致

3. **数据管理**
   - API 密钥本地存储功能
   - 备份功能优化，支持数据导出和导入
   - 本地数据持久化改进

4. **命名优化**
   - 将 HighestVersion 组件重命名为 自我显化(对齐)
   - 将 "最高版本自我 (ZWM Pro)" 重命名为 "最高版本构建(ZWM Pro)"
   - 将 SUBBGM & 肯定语按钮标签优化为 SUB&KDY

5. **布局优化**
   - 调整了 SUBBGM 模块位置，放在顶部
   - 优化了 kdy展示部分的布局
   - 移除了顶部不必要的切换按钮
   - 缩小了按钮和容器尺寸，使界面更紧凑

#### 技术改进

1. **代码质量**
   - 修复了重复状态变量导致的冲突
   - 修复了模板字符串语法错误
   - 修复了 JSX 结构错误
   - 解决了 TypeScript 编译错误

2. **主题适配**
   - 确保所有组件在深色模式下正确显示
   - 统一了拟态深色主题的背景色
   - 修复了颜色不一致的问题

3. **响应式设计**
   - 优化了移动设备的加载速度
   - 确保界面在不同屏幕尺寸下都能正常显示

#### 部署与构建

1. **构建优化**
   - 构建过程成功完成，生成了多个独立的代码块
   - 开发服务器运行正常，访问地址：http://localhost:3002/

2. **性能验证**
   - 预期移动设备加载速度将显著提升
   - 初始加载体积更小，组件按需加载
   - 渲染性能优化，提高了应用的响应速度

### 2025-12-27

1. **系统全面优化**
   - 统一角色资源分配机制
   - 为"完成"按钮添加0.5-1秒的完成效果动画
   - 实现直接任务放弃功能，与命运骰子机制结合
   - 标准化"×"按钮功能为"放弃任务"
   - 修复命运骰子在日常和主线任务界面的调用问题
   - 标准化命运礼物弹窗，统一名称和全局界面
   - 将子任务"×"按钮文本从"删除子任务"改为"放弃"
   - 优化命运礼物UI，添加3D投影和拟态效果
   - 实现双击编辑角色等级功能，包含等级修改逻辑和勋章重置

2. **数据可视化图表优化**
   - 为所有图表添加描述性标题
   - 为坐标轴添加清晰标签和单位
   - 优化图例说明
   - 设定清晰的边界范围

3. **命运骰子功能增强**
   - 实现磨砂质感效果
   - 优化3D动画效果
   - 完善结果弹窗设计

4. **任务管理系统优化**
   - 整理13个未分类任务到三个分类
   - 实现任务分类切换功能
   - 优化分类按钮样式和交互
   - 确保每个分类任务数量不低于10个

5. **代码优化**
   - 修复className语法错误
   - 优化状态管理
   - 提高代码可读性
   - 修复`onLevelChange`导致的黑屏问题
   - 修复`GitBranch`图标未定义错误

6. **新增思维模型系统**
   - 添加了8个全场景通用思维模型
   - 每个思维模型包含深度分析、核心原理、适用范围、使用技巧和实践方法

### 2025-12-26

1. **初始版本发布**
   - 核心游戏机制实现
   - 角色系统
   - 任务管理系统
   - 数据可视化功能
   - 命运骰子系统

## 贡献指南

欢迎提交Issue和Pull Request！

### 提交Issue

1. 清晰描述问题
2. 提供复现步骤
3. 附上相关截图
4. 说明预期行为

### 提交Pull Request

1. 从main分支创建新分支
2. 实现功能或修复bug
3. 运行测试确保代码质量
4. 提交PR，描述清楚修改内容
5. 等待审核

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎通过以下方式联系：

- GitHub Issues: <repository-url>/issues
- Email: <your-email>

---

本开发手册详细描述了人生游戏管理系统的设计和实现细节，包括完整的数据结构、组件实现、样式配置、交互逻辑和开发流程，确保开发者能够完美复刻这个系统。