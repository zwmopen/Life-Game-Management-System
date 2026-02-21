# 帮助按钮设计指南

## 1. 设计原则

- **一致性**：全系统所有帮助按钮保持统一的样式和交互方式
- **易用性**：帮助按钮位置明显，点击后快速显示帮助内容
- **简洁性**：帮助内容结构清晰，语言简洁明了
- **可维护性**：建立统一的帮助组件管理机制，便于维护和扩展

---

## 2. 帮助按钮组件

### 2.1 组件名称

使用 `GlobalHelpButton` 组件（位于 `components/HelpSystem/GlobalHelpButton.tsx`）

### 2.2 组件属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `helpId` | string | 必填 | 帮助内容的唯一标识符 |
| `onHelpClick` | (helpId: string) => void | 必填 | 点击帮助按钮时触发的回调函数 |
| `size` | number | 16 | 图标大小（常用14或16） |
| `className` | string | '' | 自定义样式类 |
| `variant` | 'ghost' \| 'solid' \| 'neomorphic' | 'ghost' | 按钮样式变体 |

### 2.3 样式变体说明

| 变体 | 样式效果 | 适用场景 |
|------|----------|----------|
| `ghost` | 透明背景，灰色图标，hover变蓝 | 默认样式，适用于大多数场景 |
| `solid` | 蓝色背景，白色图标 | 需要强调帮助按钮的场景 |
| `neomorphic` | 拟态风格，带阴影 | 拟态主题界面 |

---

## 3. 使用规范

### 3.1 图标尺寸标准

根据 `project_rules.md` 规定，全局小问号图标使用 **14px** 尺寸：

```tsx
// 推荐用法（14px）
<GlobalHelpButton helpId="moduleName" onHelpClick={setActiveHelp} size={14} variant="ghost" />

// 较大尺寸（16px）- 用于需要更明显的场景
<GlobalHelpButton helpId="moduleName" onHelpClick={setActiveHelp} size={16} variant="ghost" />
```

### 3.2 导入方式

```tsx
import GlobalHelpButton from './HelpSystem/GlobalHelpButton';
```

### 3.3 使用示例

```tsx
// 基础用法
<GlobalHelpButton helpId="sound" onHelpClick={setActiveHelp} size={14} variant="ghost" />

// 带自定义样式
<GlobalHelpButton 
  helpId="checkin" 
  onHelpClick={setActiveHelp} 
  size={14} 
  className="text-blue-500 p-0.5" 
/>

// 拟态风格
<GlobalHelpButton 
  helpId="achievements" 
  onHelpClick={onHelpClick} 
  size={14} 
  variant="neomorphic" 
/>
```

---

## 4. 帮助系统组件结构

### 4.1 核心组件

| 组件 | 路径 | 功能 |
|------|------|------|
| `GlobalHelpButton` | `components/HelpSystem/GlobalHelpButton.tsx` | 帮助按钮组件 |
| `GlobalGuideCard` | `components/HelpSystem/` | 帮助内容卡片组件 |
| `helpContent` | `components/HelpSystem/HelpContent.tsx` | 帮助内容数据 |

### 4.2 组件关系

```
┌─────────────────────────────────────────────────────────────┐
│                     帮助系统组件架构                          │
├─────────────────┬───────────────────────────────────────────┤
│ GlobalHelpButton │  帮助按钮，点击后触发帮助卡片显示           │
├─────────────────┼───────────────────────────────────────────┤
│ GlobalGuideCard  │  帮助内容卡片，显示详细的帮助信息          │
├─────────────────┼───────────────────────────────────────────┤
│ helpContent      │  帮助内容数据，存储所有模块的帮助信息      │
└─────────────────┴───────────────────────────────────────────┘
```

---

## 5. 添加新模块帮助内容

### 5.1 在 HelpContent.tsx 中添加

```tsx
// 在 helpContent 对象中添加新模块
newModule: {
  title: '新模块名称',
  icon: <IconComponent size={24} className="text-color" />,
  productIntro: '产品介绍',
  underlyingPrinciple: '底层原理',
  coreRules: '核心规则',
  usageMethods: '使用方法',
  updateTime: '2026-02-21'
}
```

### 5.2 在组件中使用

```tsx
import GlobalHelpButton from '../HelpSystem/GlobalHelpButton';

const MyComponent = () => {
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  
  return (
    <div>
      <h2>模块标题</h2>
      <GlobalHelpButton helpId="newModule" onHelpClick={setActiveHelp} size={14} />
    </div>
  );
};
```

---

## 6. 帮助内容撰写规范

### 6.1 内容结构

- **产品介绍**：简要介绍模块的功能和作用
- **底层原理**：模块的设计思路和技术实现
- **核心规则**：模块的核心规则和约束
- **使用方法**：详细的使用步骤和操作指南

### 6.2 语言要求

- 语言简洁明了，避免使用复杂术语
- 使用第二人称"您"，语气友好
- 结构清晰，使用小标题和列表
- 重点内容突出，使用加粗或其他强调方式

---

## 7. 最佳实践

1. **统一使用 GlobalHelpButton 组件**：所有模块的帮助按钮都应使用统一的组件
2. **图标尺寸统一**：全局使用14px尺寸（`size={14}`）
3. **帮助内容及时更新**：当模块功能更新时，及时更新对应的帮助内容
4. **保持帮助内容简洁**：帮助内容应简洁明了，避免过长的文本
5. **定期检查帮助功能**：定期检查所有模块的帮助功能是否正常工作

---

## 8. 故障排除

| 问题 | 解决方案 |
|------|----------|
| 帮助按钮点击后无反应 | 检查 `onHelpClick` 回调是否正确设置，`activeHelp` 状态是否正确 |
| 帮助卡片样式异常 | 检查是否正确传递了样式类 |
| 帮助内容显示错误 | 检查 `helpId` 是否与 `helpContent` 对象中的键匹配 |

---

## 9. 文档版本

| 版本 | 更新时间 | 更新内容 |
|------|----------|----------|
| 1.0 | 2026-01-08 | 初始版本，建立帮助按钮设计规范 |
| 1.1 | 2026-02-21 | 更新组件名称为GlobalHelpButton，统一图标尺寸为14px，更新组件属性说明 |

---

**版权所有 © 2026 AI编程 人生游戏管理系统**
