# 图表组件文档

## 概述

本项目使用Recharts库实现数据可视化，通过统一的图表组件和样式配置，确保所有图表具有一致的外观和交互体验。

## 图表组件结构

### 1. 配置文件

- **ChartConfig.tsx**：定义了统一的图表样式标准，包括颜色方案、字体大小、图例位置、坐标轴格式和数据标签样式等。

### 2. 基础组件

- **BaseChart.tsx**：所有图表的基础组件，实现了统一的样式和提供了一致的接口，包括：
  - 统一的ResponsiveContainer配置
  - 统一的Tooltip样式
  - 统一的主题适配
  - 一致的尺寸配置

### 3. 具体图表实现

- **MissionControl.tsx**：包含所有具体图表的实现，使用BaseChart组件和ChartConfig配置。

## 样式标准

### 1. 颜色方案

| 颜色名称 | 十六进制值 | 用途 |
|---------|-----------|------|
| primary | #3b82f6 | 主要数据系列 |
| secondary | #10b981 | 次要数据系列 |
| danger | #ef4444 | 警告/危险数据 |
| warning | #f59e0b | 警告/提示数据 |
| info | #06b6d4 | 信息/中性数据 |
| purple | #8b5cf6 | 特殊数据系列 |
| rose | #ec4899 | 特殊数据系列 |
| zinc | #71717a | 坐标轴/网格线 |
| dark | #18181b | 深色背景 |
| light | #f1f5f9 | 浅色背景 |

### 2. 字体大小

| 元素 | 字体大小 |
|------|---------|
| 标题 | 16px |
| 副标题 | 12px |
| 坐标轴标签 | 12px |
| 坐标轴刻度 | 10px |
| 图例 | 10px |
| 工具提示 | 12px |

### 3. 图例配置

- 位置：顶部
- 包装样式：`fontSize: '10px', paddingTop: '10px'`

### 4. 坐标轴配置

- 颜色：#71717a
- 刻度线：不显示
- 标签位置：insideBottom

### 5. 网格线配置

- 线条样式：虚线 `3 3`
- 颜色：暗模式下为#27272a，亮模式下为#e2e8f0

### 6. 工具提示配置

- 背景色：暗模式下为#18181b，亮模式下为#fff
- 边框色：暗模式下为#333，亮模式下为#e2e8f0
- 字体大小：12px
- 文字颜色：暗模式下为#fff，亮模式下为#000

## 使用方法

### 1. 导入组件

```typescript
import BaseChart from './BaseChart';
import { chartConfig, getGridColor, getTooltipStyle } from './ChartConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
```

### 2. 基本用法

```typescript
<BaseChart data={chartData} isDark={isDark} height={400}>
  <BarChart data={chartData} animationDuration={1000}>
    <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
    <XAxis dataKey="name" stroke={chartConfig.axis.stroke} label={{ value: '名称', position: chartConfig.axis.label.position }} />
    <YAxis stroke={chartConfig.axis.stroke} label={{ value: '数值', angle: -90, position: 'insideLeft' }} />
    <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
    <Bar dataKey="value" fill={chartConfig.colors.primary} name="数值" />
  </BarChart>
</BaseChart>
```

### 3. 配置选项

| 属性 | 类型 | 默认值 | 描述 |
|------|------|-------|------|
| data | ChartDataPoint[] | 必填 | 图表数据 |
| isDark | boolean | 必填 | 是否为暗模式 |
| className | string | "" | 额外的CSS类名 |
| height | number | 400 | 图表高度 |
| width | string \| number | "100%" | 图表宽度 |
| margin | object | { top: 10, right: 30, left: 0, bottom: 0 } | 图表边距 |

## 图表类型

### 1. 柱状图 (BarChart)

```typescript
<BaseChart data={chartData} isDark={isDark}>
  <BarChart data={chartData}>
    <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
    <XAxis dataKey="name" stroke={chartConfig.axis.stroke} />
    <YAxis stroke={chartConfig.axis.stroke} />
    <Bar dataKey="value" fill={chartConfig.colors.primary} />
  </BarChart>
</BaseChart>
```

### 2. 折线图 (LineChart)

```typescript
<BaseChart data={chartData} isDark={isDark}>
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
    <XAxis dataKey="name" stroke={chartConfig.axis.stroke} />
    <YAxis stroke={chartConfig.axis.stroke} />
    <Line type="monotone" dataKey="value" stroke={chartConfig.colors.primary} strokeWidth={3} />
  </LineChart>
</BaseChart>
```

### 3. 面积图 (AreaChart)

```typescript
<BaseChart data={chartData} isDark={isDark}>
  <AreaChart data={chartData}>
    <defs>
      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={chartConfig.colors.primary} stopOpacity={0.4} />
        <stop offset="95%" stopColor={chartConfig.colors.primary} stopOpacity={0.05} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
    <XAxis dataKey="name" stroke={chartConfig.axis.stroke} />
    <YAxis stroke={chartConfig.axis.stroke} />
    <Area type="monotone" dataKey="value" stroke={chartConfig.colors.primary} fill="url(#colorValue)" />
  </AreaChart>
</BaseChart>
```

### 4. 雷达图 (RadarChart)

```typescript
<BaseChart data={chartData} isDark={isDark}>
  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
    <PolarGrid stroke={getGridColor(isDark)} />
    <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#a1a1aa' : '#64748b', fontSize: chartConfig.fontSize.axisTick, fontWeight: 'bold' }} />
    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fontSize: 8 }} axisLine={false} />
    <Radar name="数值" dataKey="value" stroke={chartConfig.colors.purple} fill={chartConfig.colors.purple} fillOpacity={0.3} />
  </RadarChart>
</BaseChart>
```

## 样式定制

### 1. 主题适配

图表组件支持暗模式和亮模式自动适配，通过`isDark`属性控制：

```typescript
const isDark = theme === 'dark';

<BaseChart data={chartData} isDark={isDark}>
  {/* 图表内容 */}
</BaseChart>
```

### 2. 自定义颜色

可以使用`getChartColor`函数获取统一的颜色配置：

```typescript
import { getChartColor } from './ChartConfig';

<Bar dataKey="value" fill={getChartColor('primary', isDark)} />
```

### 3. 自定义网格线

可以使用`getGridColor`函数获取统一的网格线颜色：

```typescript
import { getGridColor } from './ChartConfig';

<CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
```

## 最佳实践

1. **保持一致性**：所有图表使用统一的BaseChart组件和ChartConfig配置，确保外观一致。
2. **优化性能**：避免在渲染过程中创建新的函数或对象，使用useMemo和useCallback优化。
3. **合理配置动画**：为图表添加适当的动画效果，提高交互体验，但避免过度动画影响性能。
4. **清晰的数据标签**：为坐标轴添加清晰的标签，帮助用户理解数据含义。
5. **适当的图例**：为多系列图表添加图例，帮助用户区分不同的数据系列。
6. **响应式设计**：使用ResponsiveContainer确保图表在不同尺寸下都能正常显示。

## 常见问题

### 1. 图表不显示

- 检查是否提供了有效的数据
- 检查图表高度是否设置正确
- 检查是否正确使用了BaseChart组件

### 2. 样式不一致

- 确保使用了统一的ChartConfig配置
- 确保使用了getGridColor等辅助函数获取颜色
- 确保所有图表都使用了BaseChart组件

### 3. 性能问题

- 减少图表数据量，使用分页或聚合数据
- 优化动画效果，减少动画时长
- 使用useMemo缓存计算结果

## 更新日志

### v1.0.0

- 初始版本
- 创建了BaseChart基础组件
- 定义了统一的图表样式标准
- 实现了主题适配
- 支持多种图表类型

### v1.1.0

- 优化了Tooltip样式
- 增加了更多颜色选项
- 改进了文档说明
- 修复了部分样式问题

## 贡献指南

1. 遵循现有代码风格和命名规范
2. 为新功能添加测试用例
3. 更新相关文档
4. 提交PR前确保所有测试通过
5. 详细描述PR的功能和变更

## 许可证

MIT License