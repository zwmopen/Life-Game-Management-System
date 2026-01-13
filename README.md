预览
1.https://life-game-management-system.netlify.app/
2.https://life-game-management-system.vercel.app/
3.

部署网址
1.https://vercel.com/zwmopens-projects
2.https://app.netlify.com/teams/zwmopen/projects
3.


# 人生游戏管理系统

一个基于React和Vite构建的人生模拟游戏系统，集成了角色成长、任务管理、商品购买、思维模型可视化等多种功能。

## 项目特点

- 角色成长系统：经验值、等级、属性提升
- 任务管理：日常任务、主线任务、随机挑战
- 补给黑市：多样化的商品分类和购买系统
- 思维模型可视化：达克效应、死亡谷效应等多种模型
- 命运骰子：随机任务生成系统
- 数据统计与分析：专注时间、任务完成率等
- 响应式设计，适配不同屏幕尺寸
- 支持多种主题：暗黑模式、拟态风格

## 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite
- **状态管理**：React Hooks
- **图表库**：Recharts
- **图标库**：lucide-react
- **样式方案**：Tailwind CSS
- **动画效果**：Canvas Confetti

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

### 类型检查

```bash
npx tsc --noEmit
```

## 项目结构

```
├── components/          # React 组件
│   ├── LifeGame.tsx         # 主游戏组件
│   ├── CharacterProfile.tsx # 角色属性面板
│   ├── HelpSystem/          # 帮助系统
│   └── shared/              # 共享组件
├── types/              # TypeScript 类型定义
├── constants/          # 常量定义
├── vite.config.ts      # Vite 配置
├── package.json        # 项目配置
└── README.md           # 项目说明
```

## 核心功能模块

### 1. 角色成长系统
- 经验值与等级提升
- 属性系统：力量、智力、自律、创造力、社交能力、财富
- 专注时间统计与分析

### 2. 任务管理系统
- 日常习惯任务
- 主要项目任务
- 随机挑战任务
- 任务完成率统计

### 3. 补给黑市
- 商品分类：吃喝、形象设计与穿搭、休闲娱乐、数码、家居、会员/权益/充值
- 商品购买与拥有管理
- 盲盒系统
- 商品数量统计与筛选

### 4. 思维模型可视化
- 达克效应
- 死亡谷效应
- J型曲线
- 反脆弱曲线
- 第二曲线
- 复利效应
- 采矿效应
- 多巴胺曲线
- 心流状态
- 风阻定律

### 5. 命运骰子系统
- 随机任务生成
- 任务分类：健康、效率、休闲
- 奖励机制

## 可视化设计规范

项目采用统一的可视化设计规范，确保所有组件风格一致。主要特点包括：
- 拟态风格设计
- 统一的色彩方案
- 响应式布局
- 流畅的动画效果

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证，详情请查看 `LICENSE` 文件。

## 更新日志

- 2024-12-31: 商品分类优化，添加社群类商品
- 2024-12-30: 命运骰子系统优化
- 2024-12-29: 思维模型可视化系统升级
- 2024-12-28: 角色成长系统完善

## 联系方式

如有问题或建议，欢迎通过以下方式联系：

- GitHub Issues: https://github.com/your-repo/issues
- 邮箱: your-email@example.com


预览图
<img width="1165" height="860" alt="20260101_140432_105" src="https://github.com/user-attachments/assets/83df7f9c-7ade-4538-af95-cef8f5d205ca" />
<img width="1165" height="860" alt="20260101_140432_285" src="https://github.com/user-attachments/assets/bee28d35-42b3-4a06-9963-20f2b7249ab0" />
<img width="1158" height="864" alt="20260101_140500_696" src="https://github.com/user-attachments/assets/f06cbe62-a67b-4f84-8df1-53ad634030d7" />
<img width="1160" height="855" alt="20260101_140531_036" src="https://github.com/user-attachments/assets/e4d2c49e-f571-450f-8d00-e0f9e6efad75" />
<img width="1186" height="840" alt="20260101_140546_398" src="https://github.com/user-attachments/assets/105285e4-369c-420c-b977-40ac20e2bfd8" />
<img width="1184" height="850" alt="20260101_140553_222" src="https://github.com/user-attachments/assets/133cf5e2-7d89-4de4-9664-5bd90cdbde8e" />
