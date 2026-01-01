# 指南卡片设计与实现规范

## 1. 概述

指南卡片是人生游戏化平台中的核心辅助功能，用于为用户提供各模块的详细说明和使用指导。本规范旨在统一指南卡片的设计风格、内容结构和交互方式，确保在不同模块中提供一致的用户体验。

## 2. 设计目标

- **一致性**：在所有模块中保持统一的视觉风格和交互逻辑
- **清晰性**：提供清晰、结构化的信息，易于理解和使用
- **易用性**：交互简单直观，用户可轻松获取所需信息
- **可维护性**：代码结构清晰，便于扩展和维护
- **响应式**：适配不同屏幕尺寸和主题

## 3. 组件结构

### 3.1 核心组件

- **GlobalGuideCard**：全局指南卡片组件，负责渲染指南内容
- **HelpTooltip**：帮助提示组件，用于触发指南卡片的显示
- **helpContent**：帮助内容数据，存储所有模块的指南信息

### 3.2 组件关系

```
HelpTooltip → onClick → setActiveHelp → GlobalGuideCard → 根据activeHelp显示对应内容
```

## 4. 视觉设计

### 4.1 主题适配

指南卡片支持三种主题模式：
- **浅色主题**：适合白天使用，提供清晰的视觉体验
- **深色主题**：适合夜间使用，减少眼睛疲劳
- **拟态主题**：采用现代设计风格，通过柔和的阴影和凸起效果营造层次感

### 4.2 配置选项

- **字体大小**：小/中/大三个级别，适应不同阅读需求
- **圆角大小**：小/中/大三个级别，调整卡片边角弧度
- **阴影强度**：轻/中/强三个级别，控制卡片阴影效果

### 4.3 布局结构

```
┌─────────────────────────────────────────────────────────┐
│ 标题区域（含图标、标题、更新时间）                       │
├─────────────────────────────────────────────────────────┤
│ 产品介绍                                                 │
├─────────────────────────────────────────────────────────┤
│ 核心规则                                                 │
├─────────────────────────────────────────────────────────┤
│ 使用方法                                                 │
└─────────────────────────────────────────────────────────┘
```

## 5. 内容规范

### 5.1 内容结构

每个指南卡片包含以下内容板块：

| 板块名称 | 描述 | 格式要求 |
|---------|------|----------|
| 产品介绍 | 模块的基本介绍和定位 | 简洁明了，突出核心价值 |
| 核心规则 | 模块的核心功能和规则 | 结构化，使用列表或分段 |
| 使用方法 | 模块的使用步骤和技巧 | 步骤清晰，便于操作 |

### 5.2 内容编写要求

- **准确性**：内容必须准确反映模块的实际功能和规则
- **简洁性**：避免冗长描述，使用通俗易懂的语言
- **结构化**：使用标题、列表等方式组织内容，提高可读性
- **时效性**：定期更新内容，确保与模块功能同步

## 6. 交互设计

### 6.1 触发方式

- **问号图标**：在模块标题旁或右侧显示小问号图标，点击触发指南卡片
- **帮助按钮**：在设置中心等区域显示帮助按钮，点击触发对应指南

### 6.2 显示效果

- 淡入动画效果
- 居中显示，覆盖在页面上方
- 半透明背景遮罩
- 点击关闭按钮或背景遮罩可关闭指南卡片

### 6.3 响应式设计

- 卡片宽度自适应，最大宽度限制为640px
- 内容区域可滚动，适应长内容
- 移动端适配优化

## 7. 代码实现规范

### 7.1 组件使用

```tsx
// 1. 导入组件和类型
import { GlobalGuideCard, HelpTooltip, helpContent } from './HelpSystem';

// 2. 定义状态
const [activeHelp, setActiveHelp] = useState<string | null>(null);

// 3. 渲染GlobalGuideCard
<GlobalGuideCard
  activeHelp={activeHelp}
  helpContent={helpContent}
  onClose={() => setActiveHelp(null)}
  cardBg={cardBg}
  textMain={textMain}
  textSub={textSub}
  config={settings.guideCardConfig}
/>

// 4. 渲染HelpTooltip
<HelpTooltip helpId="模块标识" onHelpClick={setActiveHelp}>
  <HelpCircle size={16} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
</HelpTooltip>
```

### 7.2 内容添加

在`HelpContent.tsx`中添加新模块的指南内容：

```tsx
export const helpContent: Record<string, HelpContentItem> = {
  // 现有模块内容
  
  // 新模块内容
  newModule: {
    title: '新模块指南',
    icon: <IconComponent size={24} className="text-color" />,
    productIntro: '模块介绍...',
    underlyingPrinciple: '底层原理...',
    coreRules: '核心规则...',
    usageMethods: '使用方法...',
    updateTime: '2025-12-31'
  }
};
```

## 8. 维护与更新

### 8.1 内容更新

- 当模块功能发生变化时，需及时更新对应指南内容
- 更新时需修改`updateTime`字段，记录更新日期
- 内容更新后，需通过"同步所有指南卡片"按钮同步到所有模块

### 8.2 组件更新

- 组件更新时需保持向后兼容
- 新增功能时需考虑现有代码的影响
- 定期进行性能优化和代码重构

## 9. 最佳实践

- **保持一致性**：所有模块的指南卡片应遵循统一规范
- **内容精简**：只提供必要的信息，避免信息过载
- **定期更新**：确保指南内容与模块功能同步
- **用户反馈**：收集用户反馈，持续优化指南内容和设计
- **性能优化**：合理使用状态管理，避免不必要的渲染

## 10. 示例代码

### 10.1 在组件中使用

```tsx
// 示例：在设置中心使用指南卡片
import React, { useState } from 'react';
import { Settings as SettingsIcon, HelpCircle } from 'lucide-react';
import { GlobalGuideCard, HelpTooltip, helpContent } from './HelpSystem';

const Settings = ({ theme, settings, onUpdateSettings, onToggleTheme }) => {
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  
  // 主题相关样式
  const cardBg = isNeomorphic ? 'bg-[#e0e5ec] rounded-xl shadow-[...]' : isDark ? 'bg-zinc-900' : 'bg-white';
  const textMain = isDark ? 'text-zinc-200' : 'text-slate-800';
  const textSub = isDark ? 'text-zinc-500' : 'text-slate-500';
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 指南卡片 */}
      <GlobalGuideCard
        activeHelp={activeHelp}
        helpContent={helpContent}
        onClose={() => setActiveHelp(null)}
        cardBg={cardBg}
        textMain={textMain}
        textSub={textSub}
        config={settings.guideCardConfig}
      />
      
      {/* 设置项 */}
      <div className={`${cardBg} p-4 transition-all duration-300`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <SettingsIcon size={20} className="text-blue-500" />
            <div>
              <h3 className={`font-bold text-sm ${textMain}`}>设置项</h3>
              <p className={`text-[10px] ${textSub}`}>设置项描述</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 帮助按钮 */}
            <HelpTooltip helpId="settings" onHelpClick={setActiveHelp}>
              <HelpCircle size={16} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
            </HelpTooltip>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 11. 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0  | 2026-01-01 | 初始版本，定义基本规范和结构 |

## 12. 责任与归属

- **设计维护**：UI/UX 团队负责视觉设计和交互体验优化
- **开发维护**：前端开发团队负责组件实现和功能扩展
- **内容维护**：产品团队负责指南内容的编写和更新

---

本规范自发布之日起生效，所有相关开发和设计工作均需遵循本规范。