import React, { useState, useEffect, useRef, useCallback } from 'react';

interface VirtualScrollListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  className?: string;
}

const VirtualScrollList = <T extends unknown>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
  className = ''
}: VirtualScrollListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 计算可见项目
  const visibleRange = useCallback(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return {
      start,
      end,
      offset: start * itemHeight
    };
  }, [items.length, scrollTop, itemHeight, containerHeight, overscan]);
  
  const range = visibleRange();
  const visibleItems = items.slice(range.start, range.end);
  
  // 处理滚动事件
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);
  
  // 计算容器样式
  const containerStyle: React.CSSProperties = {
    height: containerHeight,
    overflow: 'auto',
    position: 'relative'
  };
  
  const wrapperStyle: React.CSSProperties = {
    height: items.length * itemHeight,
    position: 'relative'
  };
  
  const contentStyle: React.CSSProperties = {
    position: 'absolute',
    top: range.offset,
    left: 0,
    right: 0,
    transform: `translateY(${range.offset}px)`
  };

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={containerStyle}
      onScroll={handleScroll}
    >
      <div style={wrapperStyle}>
        <div style={contentStyle}>
          {visibleItems.map((item, index) => (
            <div 
              key={range.start + index} 
              style={{ height: itemHeight }}
            >
              {renderItem(item, range.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualScrollList;