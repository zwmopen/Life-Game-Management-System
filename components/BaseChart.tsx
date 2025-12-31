import React from 'react';
import { ResponsiveContainer } from 'recharts';
import { chartConfig, ChartProps, getGridColor, getTooltipStyle } from './ChartConfig';

interface BaseChartProps extends ChartProps {
  children: React.ReactNode;
  height?: number;
  width?: number;
  margin?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
}

const BaseChart: React.FC<BaseChartProps> = ({
  children,
  data,
  isDark,
  className = '',
  height = 'auto',
  width = '100%',
  margin = { top: 10, right: 30, left: 0, bottom: 0 },
}) => {
  // 移除所有检测逻辑，直接为所有图表提供ResponsiveContainer
  // 纯SVG图表（如zone、woop）也能在ResponsiveContainer中正常显示
  
  return (
    <ResponsiveContainer 
      width={width} 
      height={height} 
      className={className}
    >
      {children}
    </ResponsiveContainer>
  );
};

export default BaseChart;