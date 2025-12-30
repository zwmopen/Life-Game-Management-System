# 反本能·主动进化系统

一个基于React和Vite构建的思维模型可视化系统，用于展示和分析各种思维模型。

## 项目特点

- 可视化展示多种思维模型
- 支持拖拽排序和分类管理
- 深度解析每个思维模型的原理和应用
- 响应式设计，适配不同屏幕尺寸
- 支持暗模式

## 技术栈

- **前端框架**：React 19
- **构建工具**：Vite
- **图表库**：Recharts
- **拖拽库**：@dnd-kit
- **图标库**：lucide-react

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env` 文件，添加以下配置：

```
GEMINI_API_KEY=your_gemini_api_key
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

## 部署指南

### 1. Vercel部署

1. 登录 Vercel 账号
2. 点击「Add New」→「Project」
3. 选择你的 GitHub 仓库
4. 配置构建命令和输出目录：
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 点击「Deploy」

### 2. GitHub Pages部署

1. 确保项目根目录下有 `.github/workflows/deploy.yml` 文件
2. 将代码推送到 GitHub 仓库的 `main` 分支
3. GitHub Actions 会自动构建并部署到 `gh-pages` 分支
4. 在仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支

## 项目结构

```
├── components/          # React 组件
│   ├── MissionControl.tsx   # 主控制组件
│   ├── BaseChart.tsx        # 基础图表组件
│   └── ChartConfig.ts       # 图表配置
├── types/              # TypeScript 类型定义
├── .github/workflows/  # GitHub Actions 配置
├── vite.config.ts      # Vite 配置
├── package.json        # 项目配置
└── README.md           # 项目说明
```

## 思维模型列表

- [x] 达克效应
- [x] 死亡谷效应
- [x] J型曲线
- [x] 反脆弱曲线
- [x] 第二曲线
- [x] 复利效应
- [x] 采矿效应
- [x] 多巴胺曲线
- [x] 心流状态
- [x] 风阻定律
- [ ] 更多模型正在添加中...

## 可视化设计规范

项目采用统一的可视化设计规范，确保所有思维模型图表风格一致。详细规范请查看 `可视化规范.md` 文件。

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证，详情请查看 `LICENSE` 文件。

## 联系方式

如有问题或建议，欢迎通过以下方式联系：

- GitHub Issues: https://github.com/your-repo/issues
- 邮箱: your-email@example.com
