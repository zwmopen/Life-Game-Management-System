# 人生游戏管理系统 - 维护指南

## 项目概述

人生游戏管理系统是一个基于React + TypeScript的Web应用，集成了番茄钟、任务管理、3D沉浸式专注模式等功能。

## 项目结构

```
├── components/          # React组件
│   ├── shared/         # 共享组件
│   │   ├── InternalImmersivePomodoro.tsx # 内部沉浸式番茄钟（新版）
│   │   └── TomatoTimer.tsx               # 番茄钟组件
│   ├── CharacterProfile.tsx             # 角色信息页
│   └── ...
├── types/              # TypeScript类型定义
├── public/             # 静态资源
├── src/                # 源码
├── package.json        # 项目依赖
└── vite.config.ts      # Vite配置
```

## 核心功能模块

### 1. 番茄钟系统

#### 组件说明
- **TomatoTimer.tsx**: 核心番茄钟组件，提供计时、开始/暂停、重置等功能
- **InternalImmersivePomodoro.tsx**: 新版3D沉浸式番茄钟，使用Three.js渲染，内部实现，无iframe依赖

#### 关键逻辑
- 支持25/45/60分钟预设时长
- 实时状态同步（时间、进度、是否活跃）
- 3D森林生态系统渲染
- 音效控制（森林、阿尔法波、希塔波等）

### 2. 3D沉浸式模式

#### 技术栈
- Three.js 0.160.0: 3D图形渲染
- OrbitControls: 相机控制
- TWEEN.js: 动画效果

#### 核心功能
- 动态生成的3D森林生态系统
- 实时番茄钟进度可视化
- 交互式3D场景（可旋转、缩放）
- 支持多种植物和动物物种

#### 状态管理
- 使用React状态管理进行组件内部通信
- 初始数据通过React props传递
- 支持状态同步和双向通信

### 3. 任务管理系统

#### 功能特性
- 任务创建、编辑、删除
- 任务优先级管理
- 完成奖励系统
- 命运骰子功能

## 维护指南

### 代码规范

#### TypeScript规范
- 使用严格模式（strict: true）
- 为所有组件和函数添加类型定义
- 避免使用any类型，尽量使用具体类型或泛型

#### React规范
- 使用函数组件和Hooks
- 组件命名使用 PascalCase
- 保持组件职责单一
- 使用useCallback和useMemo优化性能

### 常见问题排查

#### 1. 沉浸式模式黑屏

**可能原因**：
- Three.js渲染错误
- React组件状态管理问题
- 状态同步问题

**解决方案**：
- 检查浏览器控制台是否有JavaScript错误
- 确认Three.js版本兼容性
- 验证React props和状态传递是否正确
- 检查网络请求是否成功（音效、模型等资源）

#### 2. 状态不同步

**可能原因**：
- React状态管理问题
- 初始数据设置错误
- 组件挂载顺序问题

**解决方案**：
- 检查React状态和useEffect钩子是否正确设置
- 验证React props是否包含所有必要字段
- 确保组件在接收数据后再初始化

### 组件维护

#### InternalImmersivePomodoro组件

**文件位置**：`components/shared/InternalImmersivePomodoro.tsx`

**核心逻辑**：
1. 使用内部3D渲染方式直接渲染3D场景
2. 通过React props和状态管理传递初始状态
3. 使用React状态管理进行状态同步
4. 支持音效控制和物种选择

**维护注意事项**：
- 注意React状态管理的正确使用
- 所有初始数据通过React props传递
- 状态更新通过React状态管理机制处理
- Three.js相关代码修改需注意版本兼容性

#### TomatoTimer组件

**文件位置**：`components/shared/TomatoTimer.tsx`

**维护注意事项**：
- 确保onImmersiveModeChange回调正确处理模式切换
- 注意按钮事件绑定的正确性
- 保持与其他组件的状态同步

### 部署说明

#### 开发环境
```bash
npm install
npm run dev
```

#### 生产构建
```bash
npm run build
npm run preview
```

## AI维护提示

### 代码生成提示

1. **组件开发**：
   - 基于现有组件结构创建新组件
   - 确保TypeScript类型定义完整
   - 遵循现有组件的设计模式

2. **3D功能扩展**：
   - 参考Three.js官方文档和示例
   - 注意性能优化（减少draw call、合理使用LOD）
   - 保持与现有生态系统的兼容性

3. **状态管理**：
   - 使用React Context或状态管理库管理全局状态
   - 保持组件间状态同步的一致性
   - 避免不必要的重新渲染

### 故障排除提示

1. **编译错误**：
   - 检查TypeScript类型错误
   - 确认依赖版本兼容性
   - 验证文件路径和导入语句

2. **运行时错误**：
   - 检查浏览器控制台日志
   - 确认异步操作的错误处理
   - 验证DOM元素是否存在

3. **性能问题**：
   - 使用React DevTools分析组件渲染性能
   - 优化Three.js渲染性能
   - 减少不必要的网络请求

## 版本历史

- v1.0.0: 初始版本，包含基础番茄钟和任务管理功能
- v1.1.0: 添加3D沉浸式番茄钟功能
- v1.2.0: 优化沉浸式模式性能，修复黑屏问题

## 贡献指南

1. 遵循现有代码规范
2. 编写完整的测试用例
3. 更新相关文档
4. 提交Pull Request前确保所有测试通过

## 联系方式

如有问题或建议，请联系项目维护人员。

---

**最后更新时间**：2026-01-09
**维护人员**：AI Assistant