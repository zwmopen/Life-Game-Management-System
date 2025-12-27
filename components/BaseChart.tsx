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
  
  // 检查children是否包含Recharts图表组件（通过检查是否直接包含recharts图表元素）
  const hasRechartsChart = React.Children.toArray(children).some(child => {
    if (!React.isValidElement(child)) return false;
    
    // 获取组件名称
    const componentName = typeof child.type === 'string' ? child.type : 
                         (child.type as any).displayName || 
                         (child.type as any).name || '';
    
    // 检查是否是recharts图表组件
    const rechartsComponents = ['BarChart', 'LineChart', 'AreaChart', 'RadarChart', 'PieChart', 'ScatterChart', 'ComposedChart'];
    return rechartsComponents.some(comp => componentName.includes(comp));
  });
  
  // 对于纯SVG图表，不使用ResponsiveContainer和Tooltip
  if (!hasRechartsChart) {
    return (
      <div 
        style={{ width, height }} 
        className={className}
      >
        {children}
      </div>
    );
  }
  
  // 对于Recharts图表，使用ResponsiveContainer和Tooltip
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