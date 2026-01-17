# 帮助按钮设计指南

## 1. 设计原则

- **一致性**：全系统所有帮助按钮保持统一的样式和交互方式
- **易用性**：帮助按钮位置明显，点击后快速显示帮助内容
- **简洁性**：帮助内容结构清晰，语言简洁明了
- **可维护性**：建立统一的帮助组件管理机制，便于维护和扩展

## 2. 帮助按钮样式规范

### 2.1 基本样式
- **图标**：使用16px大小的`HelpCircle`图标
- **颜色**：默认颜色为`text-zinc-500`，hover时变为`text-white`
- **过渡效果**：添加`transition-colors`过渡效果
- **背景**：悬停时添加轻微的背景高亮效果

### 2.2 示例代码
```tsx
import { HelpCircle } from 'lucide-react';

// 标准帮助按钮
<button onClick={() => onHelpClick('helpId')} className="transition-colors">
  <HelpCircle size={16} className="text-zinc-500 hover:text-white transition-colors" />
</button>

// 使用统一的HelpTooltip组件
<HelpTooltip helpId="helpId" onHelpClick={onHelpClick} />
```

## 3. 帮助系统组件结构

### 3.1 核心组件
- **HelpTooltip**：帮助按钮组件，负责显示帮助图标和处理点击事件
- **GlobalGuideCard**：帮助内容卡片组件，负责显示帮助内容
- **helpContent**：帮助内容数据，存储所有模块的帮助信息

### 3.2 组件关系
```
┌─────────────────────────────────────────────────────────────┐
│                     帮助系统组件                          │
├───────────┬────────────────────────────────────────────────┤
│  HelpTooltip │  帮助按钮，点击后触发帮助卡片显示             │
├───────────┼────────────────────────────────────────────────┤
│ GlobalGuideCard │  帮助内容卡片，显示详细的帮助信息          │
├───────────┼────────────────────────────────────────────────┤
│  helpContent    │  帮助内容数据，存储所有模块的帮助信息      │
└───────────┴────────────────────────────────────────────────┘
```

## 4. 帮助系统使用方法

### 4.1 在组件中添加帮助按钮

1. 导入帮助系统组件
```tsx
import { HelpTooltip, GlobalGuideCard, helpContent } from './HelpSystem';
```

2. 添加帮助按钮
```tsx
// 在组件中添加帮助按钮
<HelpTooltip helpId="moduleName" onHelpClick={setActiveHelp} />

// 或直接使用HelpCircle图标
<button onClick={() => setActiveHelp('moduleName')} className="transition-colors">
  <HelpCircle size={16} className="text-zinc-500 hover:text-white transition-colors" />
</button>
```

3. 添加帮助内容卡片
```tsx
// 在组件末尾添加帮助内容卡片
<GlobalGuideCard
  activeHelp={activeHelp}
  helpContent={helpContent}
  onClose={() => setActiveHelp(null)}
  cardBg={cardBg}
  textMain={textMain}
  textSub={textSub}
  config={settings.guideCardConfig || {
    fontSize: 'medium',
    borderRadius: 'medium',
    shadowIntensity: 'medium',
    showUnderlyingPrinciple: true
  }}
/>
```

### 4.2 添加新模块的帮助内容

1. 在`HelpContent.tsx`中添加新模块的帮助内容
```tsx
// 在helpContent对象中添加新模块的帮助内容
newModule: {
  title: '新模块名称',
  icon: <IconComponent size={24} className="text-color" />,
  productIntro: '产品介绍',
  underlyingPrinciple: '底层原理',
  coreRules: '核心规则',
  usageMethods: '使用方法',
  updateTime: '2026-01-08'
}
```

## 5. 帮助内容撰写规范

### 5.1 内容结构
- **产品介绍**：简要介绍模块的功能和作用
- **底层原理**：模块的设计思路和技术实现
- **核心规则**：模块的核心规则和约束
- **使用方法**：详细的使用步骤和操作指南

### 5.2 语言要求
- 语言简洁明了，避免使用复杂术语
- 使用第二人称"您"，语气友好
- 结构清晰，使用小标题和列表
- 重点内容突出，使用加粗或其他强调方式

## 6. 组件 API 文档

### 6.1 HelpTooltip 组件

| 属性 | 类型 | 描述 |
|------|------|------|
| helpId | string | 帮助内容的唯一标识符 |
| onHelpClick | (helpId: string) => void | 点击帮助按钮时触发的回调函数 |
| children | React.ReactNode | 自定义帮助按钮内容 |
| className | string | 自定义样式类 |

### 6.2 GlobalGuideCard 组件

| 属性 | 类型 | 描述 |
|------|------|------|
| activeHelp | string  null | 当前激活的帮助ID |
| helpContent | Record<string, HelpContentItem> | 帮助内容数据 |
| onClose | () => void | 关闭帮助卡片时触发的回调函数 |
| cardBg | string | 卡片背景样式类 |
| textMain | string | 主要文本样式类 |
| textSub | string | 次要文本样式类 |
| config | GuideCardConfig | 卡片配置 |

### 6.3 GuideCardConfig 配置

| 属性 | 类型 | 描述 |
|------|------|------|
| fontSize | 'small'  'medium'  'large' | 字体大小 |
| borderRadius | 'small'  'medium'  'large' | 圆角大小 |
| shadowIntensity | 'light'  'medium'  'strong' | 阴影强度 |
| showUnderlyingPrinciple | boolean | 是否显示底层原理板块 |

## 7. 最佳实践

1. **统一使用 HelpTooltip 组件**：所有模块的帮助按钮都应使用统一的`HelpTooltip`组件
2. **帮助内容及时更新**：当模块功能更新时，及时更新对应的帮助内容
3. **保持帮助内容简洁**：帮助内容应简洁明了，避免过长的文本
4. **定期检查帮助功能**：定期检查所有模块的帮助功能是否正常工作

## 8. 故障排除

1. **帮助按钮点击后无反应**：检查是否正确导入了`GlobalGuideCard`组件，并且`activeHelp`状态是否正确设置
2. **帮助卡片样式异常**：检查是否正确传递了`cardBg`、`textMain`和`textSub`样式类
3. **帮助内容显示错误**：检查`helpId`是否与`helpContent`对象中的键匹配

## 9. 版本历史

| 版本 | 更新时间 | 更新内容 |
|------|----------|----------|
| 1.0 | 2026-01-08 | 初始版本，建立帮助按钮设计规范 |

## 10. 维护人员

- 维护团队：AI编程
- 联系方式：通过项目管理系统联系

---

**版权所有 © 2026 AI编程 人生游戏管理系统**