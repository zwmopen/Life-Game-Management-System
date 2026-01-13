import React, { useState, useEffect } from 'react';

/**
 * 响应式UI优化工具集
 * 提供一系列用于优化UI组件响应式设计和用户体验的工具
 */
export class ResponsiveUIOptimizer {
  /**
   * 检测设备类型
   */
  static detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * 检测触摸能力
   */
  static isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * 获取响应式断点
   */
  static getBreakpoint(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
    const width = window.innerWidth;
    if (width < 640) return 'xs';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1280) return 'lg';
    if (width < 1536) return 'xl';
    return '2xl';
  }

  /**
   * 响应式网格布局计算
   */
  static calculateGridCols(itemsCount: number, minItemWidth: number = 280): number {
    const containerWidth = window.innerWidth - 32; // 减去边距
    const cols = Math.max(1, Math.floor(containerWidth / minItemWidth));
    return Math.min(cols, itemsCount || 1);
  }

  /**
   * 优化字体大小
   */
  static getOptimalFontSize(baseSize: number, breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'): number {
    const multiplier = {
      xs: 0.8,
      sm: 0.9,
      md: 1,
      lg: 1.1,
      xl: 1.2,
      '2xl': 1.3
    }[breakpoint];
    
    return baseSize * multiplier;
  }

  /**
   * 检测是否为窄屏设备
   */
  static isNarrowScreen(): boolean {
    return window.innerWidth < 640;
  }

  /**
   * 获取推荐的触摸目标大小
   */
  static getTouchTargetSize(): number {
    return this.isNarrowScreen() ? 48 : 40;
  }

  /**
   * 优化卡片间距
   */
  static getCardSpacing(): { padding: number; margin: number } {
    const deviceType = this.detectDeviceType();
    switch (deviceType) {
      case 'mobile':
        return { padding: 12, margin: 8 };
      case 'tablet':
        return { padding: 16, margin: 12 };
      case 'desktop':
        return { padding: 20, margin: 16 };
    }
  }
}

/**
 * 响应式钩子 - useResponsive
 * 提供响应式相关的状态和工具
 */
export const useResponsive = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(() => ResponsiveUIOptimizer.detectDeviceType());
  const [breakpoint, setBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>(() => ResponsiveUIOptimizer.getBreakpoint());
  const [isTouchDevice, setIsTouchDevice] = useState(() => ResponsiveUIOptimizer.isTouchDevice());
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(ResponsiveUIOptimizer.detectDeviceType());
      setBreakpoint(ResponsiveUIOptimizer.getBreakpoint());
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    deviceType,
    breakpoint,
    isTouchDevice,
    windowSize,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isNarrowScreen: ResponsiveUIOptimizer.isNarrowScreen(),
    touchTargetSize: ResponsiveUIOptimizer.getTouchTargetSize(),
    cardSpacing: ResponsiveUIOptimizer.getCardSpacing(),
    calculateGridCols: ResponsiveUIOptimizer.calculateGridCols,
    getOptimalFontSize: ResponsiveUIOptimizer.getOptimalFontSize,
  };
};

/**
 * 响应式卡片组件
 * 根据屏幕尺寸自动调整样式
 */
export const ResponsiveCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'spacious';
}> = ({ children, className = '', variant = 'default' }) => {
  const { deviceType, cardSpacing } = useResponsive();
  
  const getPaddingClasses = () => {
    switch (variant) {
      case 'compact':
        return deviceType === 'mobile' ? 'p-3' : 'p-4';
      case 'spacious':
        return deviceType === 'mobile' ? 'p-5' : 'p-6';
      default:
        return deviceType === 'mobile' ? 'p-4' : 'p-5';
    }
  };

  const spacing = cardSpacing;

  return (
    <div 
      className={`
        rounded-xl 
        border 
        ${getPaddingClasses()}
        ${className}
        transition-all 
        duration-200
        hover:shadow-lg
      `}
      style={{
        margin: spacing.margin,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 响应式网格容器
 * 根据屏幕尺寸和内容数量自动调整列数
 */
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode[];
  minItemWidth?: number;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
}> = ({ children, minItemWidth = 280, className = '', gap = 'md' }) => {
  const { calculateGridCols, deviceType } = useResponsive();
  
  const cols = calculateGridCols(children.length, minItemWidth);
  
  const getGapClass = () => {
    switch (gap) {
      case 'sm': return deviceType === 'mobile' ? 'gap-3' : 'gap-4';
      case 'lg': return deviceType === 'mobile' ? 'gap-5' : 'gap-6';
      default: return deviceType === 'mobile' ? 'gap-4' : 'gap-5';
    }
  };

  return (
    <div 
      className={`
        grid 
        ${className}
        ${getGapClass()}
      `}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 响应式按钮组件
 * 根据设备类型优化触摸目标大小
 */
export const ResponsiveButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
  }
> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const { isTouchDevice, touchTargetSize } = useResponsive();

  const getSizeClasses = () => {
    if (isTouchDevice) {
      // 为触摸设备提供更大的触摸目标
      return `h-${touchTargetSize / 4} min-h-${touchTargetSize / 4} px-4`;
    }
    
    switch (size) {
      case 'sm': return 'h-8 px-3 text-sm';
      case 'lg': return 'h-12 px-6 text-lg';
      default: return 'h-10 px-4';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
      case 'ghost':
        return 'hover:bg-gray-100 text-gray-700';
      case 'outline':
        return 'border border-gray-300 hover:bg-gray-50 text-gray-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <button
      className={`
        rounded-lg
        font-medium
        transition-colors
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:ring-offset-2
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${className}
      `}
      style={isTouchDevice ? { minHeight: `${touchTargetSize}px` } : {}}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * 响应式模态框组件
 * 在移动设备上全屏显示，在桌面设备上居中显示
 */
export const ResponsiveModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}> = ({ isOpen, onClose, children, title }) => {
  const { isMobile } = useResponsive();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div 
        className={`
          relative bg-white rounded-xl shadow-xl
          ${isMobile 
            ? 'w-full h-full max-h-full rounded-none' 
            : 'w-full max-w-md max-h-[90vh]'
          }
          overflow-hidden
        `}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        <div className={title ? 'p-4' : 'p-6'}>
          {children}
        </div>
      </div>
    </div>
  );
};