# 遮挡问题通用解决方案说明文档

## 问题描述

在人生游戏管理系统中，经常出现模态框、弹窗等浮层组件被侧边栏或其他组件遮挡的问题。这种问题影响用户体验，使得某些功能无法正常使用。同时，还存在模态框在侧边栏折叠后无法正确居中的问题。

## 问题根本原因

1. **z-index 层级管理不当**：不同的组件使用了相近或冲突的 z-index 值
2. **CSS 层叠上下文问题**：父元素的 z-index 或其他 CSS 属性影响了子元素的层叠顺序
3. **组件渲染顺序问题**：后渲染的组件可能会被先渲染的组件覆盖
4. **模态框定位问题**：使用了 `justify-end` 而不是 `justify-center` 导致模态框在侧边栏折叠后不居中

## 解决方案

### 1. z-index 层级规范

建立统一的 z-index 层级规范，确保各组件层级清晰：

```css
/* 基础层级 */
z-0: 0
z-10: 10
z-20: 20
z-30: 30
z-40: 40
z-50: 50

/* 浮层组件层级 */
z-1000: 普通弹窗
z-5000: 通知提醒
z-10000: 模态框遮罩
z-20000: 模态框内容
z-50000: 重要提示/紧急弹窗
z-99999: 最高级别浮层（如全局提示）
```

### 2. 模态框组件最佳实践

对于模态框等浮层组件，应遵循以下规范：

```jsx
// 示例：正确设置模态框层级
<div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
  <div className="relative z-[100000]">
    {/* 模态框内容 */}
  </div>
</div>
```

### 3. 侧边栏组件层级设置

侧边栏应使用适中的 z-index 值，确保不会干扰浮层组件：

```jsx
// 示例：侧边栏层级设置
<div className="fixed left-0 top-0 z-40 w-64 h-full">
  {/* 侧边栏内容 */}
</div>
```

### 4. 模态框居中定位规范

确保模态框在任何情况下都能居中显示：

```jsx
// 示例：正确设置模态框居中
<div className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
  {/* 模态框内容 */}
</div>
```

### 5. CSS 层叠上下文注意事项

避免因父元素的 CSS 属性影响子元素的层叠顺序：

- `position: relative/absolute/fixed/sticky` 会创建新的层叠上下文
- `z-index` 只在同一个层叠上下文中有效
- `opacity < 1` 也会创建新的层叠上下文

## 预防措施

### 1. 代码审查清单

在开发过程中，应检查以下要点：

- [ ] 模态框、弹窗等浮层组件的 z-index 是否足够高
- [ ] 是否存在可能导致层叠上下文问题的 CSS 属性
- [ ] 侧边栏等固定组件的 z-index 是否合理
- [ ] 不同组件间的 z-index 是否存在冲突
- [ ] 模态框是否使用 `justify-center` 而非 `justify-end` 来确保居中

### 2. 组件开发规范

- 所有浮层组件必须使用预定义的 z-index 范围
- 避免随意使用过高的 z-index 值
- 使用语义化的 z-index 类名（如 `z-modal`, `z-overlay` 等）
- 模态框外层容器应使用 `flex items-center justify-center` 实现居中

### 3. 测试验证

- 在各种屏幕尺寸下测试浮层组件的显示效果
- 确保浮层组件在有侧边栏的情况下也能正常显示
- 验证侧边栏折叠/展开时模态框的定位是否正确
- 验证多层嵌套浮层的层级关系

## 已知问题修复示例

### 修复 EditBadgeModal 遮挡问题

原代码：
```jsx
<div className="fixed inset-0 z-[10003] bg-black/80 backdrop-blur-sm">
  <div className="... p-6 border">
```

修复后代码：
```jsx
<div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
  <div className="... p-6 border z-[100001]">
```

通过将模态框的遮罩层设置为 `z-[100000]`，内容层设置为 `z-[100001]`，确保其高于侧边栏的 `z-40` 层级。

### 修复 BadgeManagementModal 居中问题

原代码：
```jsx
<div className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-sm flex items-center justify-end p-4 animate-in fade-in">
```

修复后代码：
```jsx
<div className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
```

通过将 `justify-end` 改为 `justify-center`，确保模态框在侧边栏折叠后仍能居中显示。

## 总结

通过建立统一的 z-index 层级规范、遵循组件开发最佳实践以及实施预防措施，可以有效避免遮挡问题的发生。在开发过程中，应时刻关注组件的层叠关系，确保用户界面的可用性和一致性。同时，要注意模态框的定位方式，使用 `justify-center` 而非 `justify-end`，确保在侧边栏折叠/展开时模态框始终居中显示。
