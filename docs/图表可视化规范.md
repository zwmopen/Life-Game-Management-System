# 思维模型可视化描述规范

## 1. 整体架构

### 1.1 设计原则
- **简洁直观**：去除冗余装饰，突出核心概念
- **结构化**：采用清晰的层次结构，便于理解和生成
- **通用性**：适用于不同类型的思维模型（曲线类、矩阵类、循环类、层级类等）
- **可扩展性**：支持未来添加新的模型类型
- **响应式**：适配不同屏幕尺寸

### 1.2 技术栈
- **核心**：SVG（主要绘制载体）
- **容器**：HTML div（如需）
- **样式**：内联样式或单独style标签
- **交互**：原生JavaScript（如需）

## 2. 布局结构指南

### 2.1 基础布局类型

#### 2.1.1 二维坐标布局（适用于曲线类模型）
- **坐标系**：X轴水平向右，Y轴垂直向上
- **区域划分**：根据模型阶段划分为多个连续的彩色分区
- **核心元素**：曲线、文字标注、关键节点、背景分区
- **示例**：达克效应、学习曲线、复利曲线

#### 2.1.2 矩阵布局（适用于四象限模型）
- **网格**：2x2或3x3矩阵
- **区域**：每个象限代表不同的概念组合
- **核心元素**：象限背景色、文字标注、图标
- **示例**：艾森豪威尔矩阵、SWOT分析

#### 2.1.3 循环布局（适用于流程类模型）
- **形状**：圆形或椭圆形
- **阶段**：沿圆周均匀分布的阶段
- **核心元素**：环形路径、阶段图标/文字、连接线
- **示例**：PDCA循环、学习循环

#### 2.1.4 层级布局（适用于层级类模型）
- **结构**：树状或金字塔结构
- **层级**：从上到下或从中心向外辐射
- **核心元素**：层级框、连接线、文字标注
- **示例**：马斯洛需求层次、洋葱模型

#### 2.1.5 网络布局（适用于关系类模型）
- **节点**：代表概念或实体
- **连线**：代表关系或影响
- **核心元素**：节点圆圈、连线、文字标注
- **示例**：价值网络、系统动力学模型

### 2.2 布局参数规范

| 布局类型 | 宽度 | 高度 | 边距 | 背景色 |
|---------|------|------|------|--------|
| 二维坐标 | 600px | 400px | 40px | #ffffff |
| 矩阵 | 500px | 500px | 30px | #ffffff |
| 循环 | 500px | 500px | 30px | #ffffff |
| 层级 | 600px | 500px | 40px | #ffffff |
| 网络 | 600px | 500px | 40px | #ffffff |

## 3. 视觉元素类型

### 3.1 基础图形
- **线条**：曲线、直线、虚线（用于连线、边框）
- **形状**：矩形、圆形、椭圆形、三角形、多边形（用于背景、节点、图标）
- **渐变**：线性渐变、径向渐变（用于背景、填充）

### 3.2 文字元素
- **标题**：图表名称（字体：粗体，大小：18px，颜色：#000000）
- **标签**：轴标签、区域名称（字体：常规，大小：14px，颜色：#333333）
- **标注**：关键节点、数据点（字体：常规，大小：12px，颜色：#666666）
- **说明**：图例、注释（字体：常规，大小：10px，颜色：#999999）

### 3.3 图标系统
- **简约风格**：线条图标或简单填充图标
- **一致性**：同一模型内图标风格统一
- **尺寸**：16-32px，根据重要性调整
- **位置**：与对应概念对齐

### 3.4 色彩编码规则

#### 3.4.1 主色调系统
| 概念类型 | 颜色 | 用途 |
|---------|------|------|
| 正面/积极 | #10b981 | 优势、机会、成长 |
| 负面/消极 | #ef4444 | 劣势、威胁、挑战 |
| 中性/平衡 | #3b82f6 | 现状、稳定、平衡 |
| 潜力/未来 | #8b5cf6 | 潜力、创新、未来 |
| 警告/注意 | #f59e0b | 警告、风险、注意 |

#### 3.4.2 阶段色彩序列
- 顺序阶段：使用同一色系的不同深浅（如蓝色系：#3b82f6, #60a5fa, #93c5fd, #bfdbfe）
- 对比阶段：使用对比色（如红绿对比、蓝橙对比）

## 4. 核心概念表达

### 4.1 抽象概念转化规则
- **连续变化**：使用曲线或渐变表达
- **离散阶段**：使用分区或节点表达
- **关系强度**：使用线条粗细或颜色深浅表达
- **重要程度**：使用元素大小或位置优先级表达

### 4.2 关键要素标注
- **核心概念**：使用大号字体或突出颜色
- **关键节点**：使用特殊标记（如圆点、菱形）
- **阶段边界**：使用清晰的分隔线
- **因果关系**：使用箭头指示

## 5. 交互设计建议

### 5.1 基础交互
- **悬停效果**：显示详细信息或高亮相关元素
- **点击效果**：展开/折叠详细内容
- **缩放**：支持放大查看细节

### 5.2 高级交互
- **动画**：阶段过渡动画、数据加载动画
- **切换**：不同视角或维度的切换
- **导出**：支持导出为图片或SVG

## 6. 代码格式要求

### 6.1 结构规范
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>思维模型名称</title>
    <style>
        /* 全局样式 */
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        
        /* 容器样式 */
        .visualization-container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        /* SVG样式 */
        svg {
            display: block;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div class="visualization-container">
        <!-- SVG绘制区域 -->
        <svg width="600" height="400" viewBox="0 0 600 400">
            <!-- 背景分区 -->
            <rect x="50" y="50" width="125" height="300" fill="#ffd700" fill-opacity="0.3" />
            <!-- 其他背景分区 -->
            
            <!-- 核心曲线 -->
            <path d="M 50,250 C 100,100, 150,300, 200,200" fill="none" stroke="#000000" stroke-width="3" />
            <!-- 其他曲线 -->
            
            <!-- 文字标注 -->
            <text x="300" y="30" text-anchor="middle" font-size="18" font-weight="bold">思维模型名称</text>
            <!-- 其他文字标注 -->
            
            <!-- 图标 -->
            <circle cx="112.5" cy="200" r="20" fill="#ffd700" fill-opacity="0.8" />
            <!-- 其他图标 -->
        </svg>
    </div>
</body>
</html>
```

### 6.2 代码质量要求
- **无语法错误**：HTML/SVG代码符合规范
- **可直接运行**：无需额外依赖
- **跨浏览器兼容**：支持主流浏览器
- **元素层级清晰**：文字不被其他元素遮挡
- **代码整洁**：缩进一致，注释清晰

## 7. 示例模板

### 7.1 二维坐标模型模板
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>模型名称</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        svg {
            display: block;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <svg width="600" height="400" viewBox="0 0 600 400">
            <!-- 标题 -->
            <text x="300" y="30" text-anchor="middle" font-size="18" font-weight="bold">模型名称</text>
            
            <!-- 背景分区 -->
            <rect x="50" y="50" width="125" height="300" fill="#ffd700" fill-opacity="0.3" stroke="#ffd700" stroke-width="1" />
            <rect x="175" y="50" width="125" height="300" fill="#ff6b6b" fill-opacity="0.3" stroke="#ff6b6b" stroke-width="1" />
            <rect x="300" y="50" width="125" height="300" fill="#4ecdc4" fill-opacity="0.3" stroke="#4ecdc4" stroke-width="1" />
            <rect x="425" y="50" width="125" height="300" fill="#45b7d1" fill-opacity="0.3" stroke="#45b7d1" stroke-width="1" />
            
            <!-- 核心曲线 -->
            <path d="M 50,250 C 100,100, 150,300, 200,200 C 250,150, 300,250, 350,200 C 400,150, 450,180, 500,180" fill="none" stroke="#000000" stroke-width="3" />
            
            <!-- 轴标签 -->
            <text x="300" y="380" text-anchor="middle" font-size="14" fill="#000000">X轴标签</text>
            <text x="20" y="200" text-anchor="middle" font-size="14" fill="#000000" transform="rotate(-90, 20, 200)">Y轴标签</text>
            
            <!-- 区域标注 -->
            <text x="112.5" y="100" text-anchor="middle" font-size="12" font-weight="bold" fill="#ffd700">区域1</text>
            <text x="237.5" y="100" text-anchor="middle" font-size="12" font-weight="bold" fill="#ff6b6b">区域2</text>
            <text x="362.5" y="100" text-anchor="middle" font-size="12" font-weight="bold" fill="#4ecdc4">区域3</text>
            <text x="487.5" y="100" text-anchor="middle" font-size="12" font-weight="bold" fill="#45b7d1">区域4</text>
            
            <!-- 关键节点 -->
            <circle cx="100" cy="100" r="6" fill="#ff0000" stroke="#ffffff" stroke-width="2" />
            <text x="100" y="93" text-anchor="middle" font-size="12" font-weight="bold" fill="#ff0000">节点1</text>
            
            <!-- 底部标签 -->
            <text x="112.5" y="360" text-anchor="middle" font-size="14" font-weight="bold" fill="#000000">标签1</text>
            <text x="237.5" y="360" text-anchor="middle" font-size="14" font-weight="bold" fill="#000000">标签2</text>
            <text x="362.5" y="360" text-anchor="middle" font-size="14" font-weight="bold" fill="#000000">标签3</text>
            <text x="487.5" y="360" text-anchor="middle" font-size="14" font-weight="bold" fill="#000000">标签4</text>
        </svg>
    </div>
</body>
</html>
```

## 8. 使用指南

### 8.1 为新模型生成可视化描述
1. **确定模型类型**：根据模型特点选择合适的布局类型
2. **定义核心元素**：确定需要表达的核心概念、阶段、关系
3. **应用色彩编码**：根据概念性质选择合适的颜色
4. **编写详细描述**：按照本规范的结构，详细描述每个元素的位置、样式、内容
5. **生成代码**：使用AI根据描述生成SVG/HTML代码
6. **验证和调整**：检查生成的代码是否符合规范，调整细节

### 8.2 规范一致性检查
- **视觉风格**：确保所有模型使用统一的配色方案和视觉元素
- **代码结构**：确保代码格式一致，便于维护和扩展
- **交互体验**：确保交互方式统一，用户体验一致

## 9. 维护和更新

- **定期审查**：定期审查现有模型，确保符合最新规范
- **持续优化**：根据使用反馈，持续优化规范和模板
- **版本控制**：对规范和生成的代码进行版本控制，便于追踪和回滚

## 10. 附录

### 10.1 常用SVG元素参考
| 元素 | 用途 | 主要属性 |
|------|------|----------|
| rect | 矩形 | x, y, width, height, fill, stroke |
| circle | 圆形 | cx, cy, r, fill, stroke |
| path | 路径 | d, fill, stroke, stroke-width |
| text | 文字 | x, y, text-anchor, font-size, font-weight, fill |
| line | 直线 | x1, y1, x2, y2, stroke, stroke-width |
| polygon | 多边形 | points, fill, stroke |
| linearGradient | 线性渐变 | id, x1, y1, x2, y2 |
| radialGradient | 径向渐变 | id, cx, cy, r |

### 10.2 颜色参考表
| 颜色名称 | 十六进制代码 | RGB |
|----------|--------------|-----|
| 红色 | #ef4444 | rgb(239, 68, 68) |
| 橙色 | #f59e0b | rgb(245, 158, 11) |
| 黄色 | #facc15 | rgb(250, 204, 21) |
| 绿色 | #10b981 | rgb(16, 185, 129) |
| 青色 | #06b6d4 | rgb(6, 182, 212) |
| 蓝色 | #3b82f6 | rgb(59, 130, 246) |
| 紫色 | #8b5cf6 | rgb(139, 92, 246) |
| 粉色 | #ec4899 | rgb(236, 72, 153) |

---

通过遵循本规范，可以确保生成的思维模型可视化具有统一的风格和高质量，便于理解和使用。本规范将持续更新和优化，以适应不断变化的需求。