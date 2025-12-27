import React from 'react';
import { ResponsiveContainer, Tooltip } from 'recharts';
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
  height = 400,
  width = '100%',
  margin = { top: 10, right: 30, left: 0, bottom: 0 },
}) => {
  const tooltipStyle = getTooltipStyle(isDark);
  
  return (
    <ResponsiveContainer 
      width={width} 
      height={height} 
      className={className}
    >
      <Tooltip 
        cursor={tooltipStyle.cursor}
        contentStyle={tooltipStyle.contentStyle}
      />
      {children}
    </ResponsiveContainer>
  );
};

export default BaseChart;