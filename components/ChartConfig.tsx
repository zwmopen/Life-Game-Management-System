import React from 'react';

// 图表样式配置
export const chartConfig = {
  // 颜色方案
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#06b6d4',
    purple: '#8b5cf6',
    rose: '#ec4899',
    zinc: '#71717a',
    dark: '#18181b',
    light: '#f1f5f9',
  },
  
  // 字体大小
  fontSize: {
    title: '16px',
    subtitle: '12px',
    axisLabel: '12px',
    axisTick: '10px',
    legend: '10px',
    tooltip: '12px',
  },
  
  // 图例配置
  legend: {
    position: 'top' as const,
    wrapperStyle: {
      fontSize: '10px',
      paddingTop: '10px',
    },
  },
  
  // 坐标轴配置
  axis: {
    stroke: '#71717a',
    tickLine: false,
    label: {
      position: 'insideBottom' as const,
    },
  },
  
  // 网格线配置
  grid: {
    strokeDasharray: '3 3',
    strokeDark: '#27272a',
    strokeLight: '#e2e8f0',
  },
  
  // 工具提示配置
  tooltip: {
    contentStyle: {
      backgroundColor: 'rgba(24, 24, 27, 0.9)',
      borderColor: '#333',
      fontSize: '12px',
      color: '#fff',
    },
    cursor: {
      fill: 'rgba(39, 39, 42, 0.3)',
    },
  },
  
  // 渐变配置
  gradients: {
    resistance: {
      id: 'colorResistance',
      stops: [
        { offset: '5%', stopColor: '#ef4444', stopOpacity: 0.4 },
        { offset: '95%', stopColor: '#ef4444', stopOpacity: 0.05 },
      ],
    },
    yield: {
      id: 'colorYield',
      stops: [
        { offset: '5%', stopColor: '#10b981', stopOpacity: 0.4 },
        { offset: '95%', stopColor: '#10b981', stopOpacity: 0.05 },
      ],
    },
    chaos: {
      id: 'colorChaos',
      stops: [
        { offset: '5%', stopColor: '#ef4444', stopOpacity: 0.4 },
        { offset: '95%', stopColor: '#ef4444', stopOpacity: 0.05 },
      ],
    },
    order: {
      id: 'colorOrder',
      stops: [
        { offset: '5%', stopColor: '#10b981', stopOpacity: 0.4 },
        { offset: '95%', stopColor: '#10b981', stopOpacity: 0.05 },
      ],
    },
  },
};

// 图表数据类型定义
export interface ChartDataPoint {
  [key: string]: any;
}

// 图表配置类型定义
export interface ChartProps {
  data: ChartDataPoint[];
  isDark: boolean;
  className?: string;
}

// 获取暗模式或亮模式下的颜色
export const getChartColor = (key: keyof typeof chartConfig.colors, isDark: boolean) => {
  return chartConfig.colors[key];
};

// 获取暗模式或亮模式下的网格线颜色
export const getGridColor = (isDark: boolean) => {
  return isDark ? chartConfig.grid.strokeDark : chartConfig.grid.strokeLight;
};

// 获取暗模式或亮模式下的工具提示样式
export const getTooltipStyle = (isDark: boolean) => {
  return {
    ...chartConfig.tooltip,
    contentStyle: {
      ...chartConfig.tooltip.contentStyle,
      backgroundColor: isDark ? '#18181b' : '#fff',
      borderColor: isDark ? '#333' : '#e2e8f0',
      color: isDark ? '#fff' : '#000',
    },
    cursor: {
      ...chartConfig.tooltip.cursor,
      fill: isDark ? '#27272a' : '#f1f5f9',
    },
  };
};