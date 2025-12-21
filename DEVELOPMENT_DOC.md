# 反本能·主动进化系统 - 开发文档

## 1. 系统概述

反本能·主动进化系统是一个基于React 19和TypeScript的个人成长管理应用，采用游戏化设计理念，将个人成长过程转化为RPG游戏体验。系统集成了任务管理、习惯养成、数据分析、AI辅导等功能，帮助用户克服本能弱点，实现主动进化。

### 1.1 核心功能

- **战略指挥部**：全局视图，整合所有核心功能
- **作战中心**：RPG风格的任务管理系统
- **补给黑市**：资源管理和兑换系统
- **图表汇总**：数据可视化分析
- **荣誉殿堂**：成就系统和历史记录
- **项目开发书**：项目管理工具
- **设置中心**：系统配置

### 1.2 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React | 19.2.3 |
| 语言 | TypeScript | ~5.8.2 |
| 构建工具 | Vite | ^6.2.0 |
| 拖拽功能 | @dnd-kit/core | ^6.3.1 |
| 拖拽排序 | @dnd-kit/sortable | ^10.0.0 |
| 拖拽工具 | @dnd-kit/utilities | ^3.2.2 |
| AI集成 | @google/genai | ^1.33.0 |
| 动画效果 | canvas-confetti | 1.9.2 |
| 图标库 | lucide-react | ^0.561.0 |
| 图表库 | recharts | ^3.6.0 |

## 2. 系统架构

### 2.1 项目结构

```
├── components/          # React组件目录
│   ├── CharacterProfile.tsx # 角色属性组件
│   ├── CommandCenter.tsx    # 战略指挥部
│   ├── DailyCheckIn.tsx     # 每日签到
│   ├── HallOfFame.tsx       # 荣誉殿堂
│   ├── LifeGame.tsx         # 人生游戏
│   ├── MissionControl.tsx   # 图表汇总
│   ├── Navigation.tsx       # 导航
│   ├── ProjectManual.tsx    # 项目开发书
│   └── Settings.tsx         # 设置
├── App.tsx              # 应用入口
├── constants.ts         # 常量定义
├── index.html           # HTML模板
├── index.tsx            # React入口
├── metadata.json        # 元数据
├── package.json         # 依赖配置
├── tsconfig.json        # TypeScript配置
└── vite.config.ts       # Vite配置
```

### 2.2 组件关系

```
App.tsx
├── Navigation.tsx           # 全局导航
└── 路由组件
    ├── CommandCenter.tsx    # 战略指挥部
    ├── ChartsDashboard      # 图表汇总 (MissionControl)
    ├── LifeGame.tsx         # 人生游戏
    ├── HallOfFame.tsx       # 荣誉殿堂
    ├── ProjectManual.tsx    # 项目开发书
    └── Settings.tsx         # 设置中心
└── 功能组件
    ├── CharacterProfile.tsx # 角色属性组件
    └── DailyCheckIn.tsx     # 每日签到
```

## 3. 数据模型

### 3.1 核心类型

```typescript
// 视图类型
export enum View {
  COMMAND_CENTER = 'COMMAND_CENTER', // 战略指挥部
  RPG_MISSION_CENTER = 'RPG_MISSION_CENTER', // 作战中心
  BLACK_MARKET = 'BLACK_MARKET',     // 补给黑市
  DATA_CHARTS = 'DATA_CHARTS',       // 图表汇总
  HALL_OF_FAME = 'HALL_OF_FAME',     // 荣誉殿堂
  PROJECT_MANUAL = 'PROJECT_MANUAL', // 项目开发书
  SETTINGS = 'SETTINGS',             // 设置中心
}

// 主题类型
export type Theme = 'dark' | 'light';

// 属性类型
export type AttributeType = 'STR' | 'INT' | 'DIS' | 'CRE' | 'SOC' | 'WEA';

// 原型系统
export type ArchetypeId = 'NONE' | 'CYBER_MONK' | 'NEON_TYCOON' | 'CHAOS_WALKER';
```

### 3.2 主要数据结构

#### 3.2.1 角色原型

```typescript
export interface Archetype {
    id: ArchetypeId;
    name: string;
    desc: string;
    buffText: string;
    icon: string;
    color: string;
}
```

#### 3.2.2 习惯数据

```typescript
export interface Habit {
  id: string;
  name: string;
  reward: number; // 奖励金币
  xp?: number;    // 经验值
  duration?: number; // 持续时间（分钟）
  streak: number; // 连续天数
  archived: boolean; // 是否归档
  color: string;  // 习惯颜色
  attr?: AttributeType; // 关联属性
  history: { [dateString: string]: boolean }; // 历史记录
  logs: { [dateString: string]: string }; // 日志
}
```

#### 3.2.3 项目数据

```typescript
export interface Project {
  id: string;
  name: string;
  startDate: string; // ISO日期字符串
  description: string;
  status: 'active' | 'paused' | 'completed'; // 状态
  logs: ProjectLog[]; // 项目日志
  dailyFocus: { [dateStr: string]: number }; // 每日专注时间
  subTasks: SubTask[]; // 子任务
  fears: FearEntry[]; // 恐惧条目
  todayFocusMinutes: number; // 今日专注时间
  attr?: AttributeType; // 关联属性
}
```

#### 3.2.4 子任务数据

```typescript
export interface SubTask {
  id: string;
  title: string;
  duration: number; // 持续时间
  completed: boolean; // 是否完成
  frequency: 'daily' | 'weekly' | 'once'; // 频率
}
```

## 4. 核心功能模块

### 4.1 图表汇总 (MissionControl)

**功能描述**：数据可视化分析模块，展示各种成长曲线和数据图表。

**主要特性**：
- 多种图表类型（折线图、面积图、雷达图等）
- 拖拽排序功能
- 响应式设计
- 深色/浅色主题支持

**核心代码**：
```typescript
// 图表切换按钮组件
const SortableButton = ({ id, chart }: { id: string; chart: any }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setActiveChart(id);
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${getButtonClass(activeChart === id)} ${isDragging ? 'opacity-50 scale-105 shadow-lg' : ''}`}
      style={{
        transform: CSS.Transform.toString(transform),
      }}
      {...attributes}
    >
      {/* 拖拽手柄 */}
      <span className="cursor-move" {...listeners}>
        <GripVertical size={10} className="mr-1 text-zinc-500" />
      </span>
      {/* 点击区域 */}
      <button
        onClick={handleClick}
        className="flex items-center gap-1 bg-transparent border-none p-0 m-0 cursor-pointer text-inherit"
      >
        <chart.icon size={12}/> {chart.label}
      </button>
    </div>
  );
};
```

### 4.2 战略指挥部 (CommandCenter)

**功能描述**：系统的核心控制中心，整合了多种功能模块。

**主要特性**：
- 多视图切换
- 任务管理
- 习惯跟踪
- 数据统计

### 4.3 人生游戏 (LifeGame)

**功能描述**：游戏化的人生模拟系统。

**主要特性**：
- 游戏化界面设计
- 任务挑战系统
- 奖励机制
- 进度追踪

### 4.4 荣誉殿堂 (HallOfFame)

**功能描述**：成就系统和历史记录展示。

**主要特性**：
- 成就解锁
- 历史数据查看
- 统计分析

### 4.5 角色属性 (CharacterProfile)

**功能描述**：角色属性和成长系统。

**主要特性**：
- 属性值展示
- 等级系统
- 称号解锁
- 成长轨迹

### 4.6 每日签到 (DailyCheckIn)

**功能描述**：每日签到和奖励系统。

**主要特性**：
- 签到功能
- 连续签到奖励
- 签到历史
- 奖励发放

### 4.7 项目开发书 (ProjectManual)

**功能描述**：项目管理工具。

**主要特性**：
- 项目创建和管理
- 子任务管理
- 进度追踪
- 恐惧条目管理

### 4.8 设置中心 (Settings)

**功能描述**：系统配置和个性化设置。

**主要特性**：
- 主题切换
- 音效设置
- 音量调节
- 个性化配置

## 5. 状态管理

### 5.1 本地状态

使用React的useState和useEffect钩子管理组件内部状态。

### 5.2 全局状态

通过组件树传递props和回调函数实现全局状态管理。

### 5.3 持久化存储

使用localStorage进行数据持久化：

```typescript
// 保存数据到localStorage
localStorage.setItem('chartCategories', JSON.stringify(chartCategories));

// 从localStorage加载数据
const savedCategories = localStorage.getItem('chartCategories');
if (savedCategories) {
  setChartCategories(JSON.parse(savedCategories));
}
```

## 6. 主题系统

### 6.1 主题类型

支持深色和浅色两种主题：

```typescript
export type Theme = 'dark' | 'light';
```

### 6.2 主题应用

通过CSS类名动态切换主题：

```typescript
const isDark = theme === 'dark';
const bgClass = isDark ? 'bg-zinc-950' : 'bg-slate-50';
const cardBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
const textMain = isDark ? 'text-zinc-200' : 'text-slate-800';
const textSub = isDark ? 'text-zinc-500' : 'text-slate-500';
```

## 7. 开发流程

### 7.1 安装依赖

```bash
npm install
```

### 7.2 启动开发服务器

```bash
npm run dev
```

### 7.3 构建生产版本

```bash
npm run build
```

### 7.4 预览生产版本

```bash
npm run preview
```

## 8. 部署说明

### 8.1 构建输出

构建生成的静态文件位于`dist`目录，可直接部署到任何静态文件服务器。

### 8.2 环境变量

支持`.env.local`文件配置环境变量：

```
VITE_API_KEY=your_api_key
```

## 9. 代码规范

### 9.1 TypeScript配置

使用严格的TypeScript配置，确保代码类型安全。

### 9.2 组件命名

- 组件名称使用PascalCase
- 文件名与组件名称保持一致
- 功能相关的组件放在同一目录

### 9.3 代码风格

- 使用ESLint和Prettier进行代码检查和格式化
- 遵循React最佳实践
- 保持代码简洁易懂

## 10. 扩展指南

### 10.1 添加新图表

1. 在`MissionControl.tsx`中添加图表数据生成函数
2. 在`CHARTS`数组中添加图表配置
3. 在图表渲染逻辑中添加对应的条件分支

### 10.2 添加新功能模块

1. 创建新的组件文件
2. 在`App.tsx`中添加路由配置或组件引用
3. 在`Navigation.tsx`中添加导航项（如果需要）

### 10.3 扩展角色属性系统

1. 在`CharacterProfile.tsx`中添加新的属性类型
2. 在`types.ts`中更新相关类型定义
3. 在数据生成逻辑中添加新属性的计算方法

### 10.4 添加新成就

1. 在`App.tsx`的`INITIAL_ACHIEVEMENTS`数组中添加新成就
2. 在成就触发逻辑中添加对应的判断条件
3. 配置成就的奖励和显示信息

### 10.5 集成新API

1. 安装相关依赖
2. 创建API服务文件
3. 在组件中使用API服务

## 11. 故障排除

### 11.1 图表无法切换

**问题**：点击图表按钮时，图表不切换。

**解决方案**：
- 检查`handleClick`函数是否正确调用`setActiveChart`
- 检查图表渲染逻辑是否覆盖了所有图表类型
- 检查控制台是否有错误信息

### 11.2 拖拽功能失效

**问题**：无法拖动图表按钮调整顺序。

**解决方案**：
- 检查`@dnd-kit`相关依赖是否正确安装
- 检查拖拽事件是否被其他事件阻止
- 检查`SortableButton`组件的实现是否正确

### 11.3 主题切换失效

**问题**：切换主题时，界面样式不更新。

**解决方案**：
- 检查主题状态是否正确传递到组件
- 检查CSS类名是否正确应用
- 检查主题切换逻辑是否正确

## 12. 未来规划

### 12.1 功能扩展

- 支持更多图表类型和数据可视化
- 增强角色属性系统和成长机制
- 扩展成就系统，添加更多成就类型
- 增强项目管理功能
- 添加多设备同步支持
- 添加社交分享功能
- 增强数据统计和分析功能

### 12.2 技术升级

- 迁移到React 20
- 集成Redux或其他状态管理库
- 使用Vite 7
- 添加自动化测试
- 优化性能和加载速度
- 增强代码可维护性和扩展性

## 13. 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交代码
4. 推送到分支
5. 创建Pull Request

## 14. 许可证

MIT License

## 15. 联系信息

- 项目作者：未知
- 项目地址：未知
- 反馈邮箱：未知

---

**版本信息**：
- 文档版本：1.0.0
- 最后更新：2025-12-19
- 适用系统：反本能·主动进化系统
