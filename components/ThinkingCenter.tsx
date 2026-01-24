import React, { useState, useMemo, Suspense, lazy, useEffect } from 'react';
import { Theme } from '../types';
import { Search, BookOpen, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import thinkingModels from './thinkingModels.json';
import { GlobalHelpButton } from './HelpSystem';
import { getNeomorphicStyles, getCardBgStyle, getTextStyle } from '../utils/styleHelpers';

interface ThinkingCenterProps {
  theme: Theme;
  onHelpClick?: (helpId: string) => void;
}

// HTML sanitization function to filter unsafe content
const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  let sanitized = html;
  
  // Remove script tags completely, including theme-related scripts
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  
  // Process style tags to remove theme-related CSS variables and ensure compatibility
  sanitized = sanitized.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, styleContent) => {
    // Remove theme-related CSS variables and rules
    let processedStyle = styleContent;
    
    // Remove CSS variables for theme colors
    processedStyle = processedStyle.replace(/:root\s*\{[\s\S]*?\}/gi, '');
    processedStyle = processedStyle.replace(/\[data-theme="dark"\]\s*\{[\s\S]*?\}/gi, '');
    processedStyle = processedStyle.replace(/\[data-theme="light"\]\s*\{[\s\S]*?\}/gi, '');
    
    // Remove any references to CSS variables
    processedStyle = processedStyle.replace(/var\(--[^)]+\)/g, 'inherit');
    
    // Remove background-color and color properties that might conflict with the theme
    processedStyle = processedStyle.replace(/background-color\s*:\s*[^;]+;/gi, '');
    processedStyle = processedStyle.replace(/color\s*:\s*[^;]+;/gi, '');
    processedStyle = processedStyle.replace(/background\s*:\s*[^;]+;/gi, '');
    
    // Remove any remaining empty style blocks
    if (processedStyle.trim()) {
      return `<style>${processedStyle}</style>`;
    }
    return '';
  });
  
  // Remove all event handlers
  sanitized = sanitized.replace(/\s+(on\w+)\s*=\s*["']?[^"'>\s]+["']?/gi, '');
  
  // Allow only safe HTML tags including style tag
  const allowedTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'a', 'img', 'svg', 'g', 'path', 'circle', 'rect', 'line', 'text', 'animate', 'animateMotion', 'animateTransform', 'defs', 'marker', 'style'];
  const tagRegex = new RegExp(`<\/?(?!(${allowedTags.join('|')}))\w+[^>]*>`, 'gi');
  sanitized = sanitized.replace(tagRegex, '');
  
  // Allow only safe attributes
  const allowedAttributes = ['class', 'id', 'src', 'href', 'alt', 'title', 'width', 'height', 'viewBox', 'transform', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'text-anchor', 'dominant-baseline', 'opacity', 'style', 'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points', 'x1', 'y1', 'x2', 'y2'];
  const attributeRegex = new RegExp(`\s+(?!(${allowedAttributes.join('|')}))\w+\s*=\s*["']?[^"'>\s]+["']?`, 'gi');
  sanitized = sanitized.replace(attributeRegex, '');
  
  // Remove any remaining unsafe characters
  sanitized = sanitized.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  
  return sanitized;
};

// Error boundary component to handle model parsing errors
// Simple error handling wrapper for dangerouslySetInnerHTML
const ModelErrorBoundary = ({ children, fallback }: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Model rendering error:', error);
    return <>{fallback}</>;
  }
};

// Button component without drag and drop functionality
const ModelButton = ({ children, onClick, isActive, theme, isFavorite }: { children: React.ReactNode; onClick: () => void; isActive: boolean; theme: 'light' | 'dark' | 'neomorphic-light' | 'neomorphic-dark'; isFavorite: boolean } & React.HTMLAttributes<HTMLButtonElement>) => {
  const isDark = theme.includes('dark');
  const isNeomorphic = theme.startsWith('neomorphic');
  const isNeomorphicDark = theme === 'neomorphic-dark';
  
  // 拟态风格按钮样式 - 统一宽度圆角版
  const getButtonClass = () => {
    // 统一基础样式：固定高度，统一内边距，圆角拉满
    // 确保按钮宽度一致，内容居中显示
    const baseClass = 'px-1 py-0.5 h-8 rounded-full text-xs font-medium transition-all duration-200 ease-in-out flex items-center justify-center border border-transparent gap-0.25 overflow-hidden whitespace-nowrap';
    
    // 根据主题和状态确定具体样式
    if (isNeomorphic) {
      if (isNeomorphicDark) {
        // 拟态暗色主题
        if (isActive) {
          // 选中状态 - 内凹效果
          return `${baseClass} bg-[#1e1e2e] text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.6),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] transform scale-95`;
        } else {
          // 默认状态 - 外凸效果
          return `${baseClass} bg-[#1e1e2e] text-zinc-300 shadow-[2px_2px_4px_rgba(0,0,0,0.4),-2px_-2px_4px_rgba(30,30,46,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.5),-3px_-3px_6px_rgba(30,30,46,1)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.6),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] active:transform active:scale-95`;
        }
      } else {
        // 拟态亮色主题
        if (isActive) {
          // 选中状态 - 内凹效果
          return `${baseClass} bg-[#e0e5ec] text-zinc-800 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] transform scale-95`;
        } else {
          // 默认状态 - 外凸效果
          return `${baseClass} bg-[#e0e5ec] text-zinc-700 shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.8)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.9)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] active:transform active:scale-95`;
        }
      }
    } else {
      // 普通主题
      if (isActive) {
        return `${baseClass} bg-blue-500 text-white border-blue-500 hover:bg-blue-600`;
      } else {
        if (isDark) {
          return `${baseClass} bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700`;
        } else {
          return `${baseClass} bg-white text-gray-800 border-slate-300 hover:bg-slate-100`;
        }
      }
    }
  };
  
  // 收藏图标组件 - 优化尺寸
  const HeartIcon = () => {
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={isFavorite ? 'text-red-500 fill-red-500' : 'text-zinc-500 flex-shrink-0'}
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    );
  };
  
  return (
    <button
      onClick={onClick}
      className={getButtonClass()}
    >
      <span className="flex items-center">{children}</span>
      <HeartIcon />
    </button>
  );
};

const ThinkingCenter: React.FC<ThinkingCenterProps> = ({ theme = 'neomorphic-light', onHelpClick }) => {
  // 确保主题始终有效
  const validTheme = ['neomorphic-light', 'neomorphic-dark'].includes(theme) ? theme : 'neomorphic-light';
  
  const isDark = validTheme.includes('dark');
  const isNeomorphic = validTheme.startsWith('neomorphic');
  
  const isNeomorphicDark = validTheme === 'neomorphic-dark';
  const neomorphicStyles = getNeomorphicStyles(isNeomorphicDark);
  
  // Theme-specific styles
  const bgClass = isDark 
    ? (isNeomorphic ? 'bg-[#1e1e2e]' : 'bg-zinc-950') 
    : (isNeomorphic ? 'bg-[#e0e5ec]' : 'bg-slate-50');
  
  const cardBg = getCardBgStyle(isNeomorphic, validTheme, isDark);

  // 将字体颜色统一设置为黑色或白色，确保可读性
  const textMain = getTextStyle(isDark, isNeomorphic, 'main');
  const textSub = getTextStyle(isDark, isNeomorphic, 'sub');
  
  // 简化布局：移除复杂的宽度计算，使用更稳定的flex布局

  // 生成搜索框样式类
  const getSearchInputClass = () => {
    const baseClass = 'w-full px-4 py-2 pr-10 rounded-[24px] text-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50';
    
    if (isNeomorphic) {
      if (validTheme === 'neomorphic-dark') {
        // 暗色拟态主题
        return `${baseClass} bg-[#1e1e2e] border-[#1e1e2e] text-white placeholder-white/50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),inset_-3px_-3px_6px_rgba(30,30,46,1)]`;
      } else {
        // 亮色拟态主题
        return `${baseClass} bg-[#e0e5ec] border-[#e0e5ec] text-black placeholder-black/50 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]`;
      }
    } else {
      // 非拟态主题
      if (isDark) {
        return `${baseClass} bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 shadow-[2px_2px_4px_rgba(0,0,0,0.4),-2px_-2px_4px_rgba(30,30,46,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.5),-3px_-3px_6px_rgba(30,30,46,1)]`;
      } else {
        return `${baseClass} bg-white border-slate-300 text-black placeholder-gray-500 shadow-[2px_2px_4px_rgba(163,177,198,0.2),-2px_-2px_4px_rgba(255,255,255,0.8)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.3),-3px_-3px_6px_rgba(255,255,255,0.9)]`;
      }
    }
  };

  // 修复文本编码问题的工具函数
  const fixEncoding = React.useCallback((text: string): string => {
    if (!text) return text;
    try {
      // 处理URL编码问题
      return decodeURIComponent(encodeURIComponent(text));
    } catch (error) {
      console.error('Error fixing encoding:', error);
      return text;
    }
  }, []);

  // 修复模型数据编码的函数
  const fixModelEncoding = React.useCallback((model: typeof thinkingModels[0]) => {
    return {
      ...model,
      label: fixEncoding(model.label),
      description: fixEncoding(model.description),
      deepAnalysis: fixEncoding(model.deepAnalysis),
      principle: fixEncoding(model.principle),
      scope: fixEncoding(model.scope),
      tips: fixEncoding(model.tips),
      practice: fixEncoding(model.practice)
    };
  }, [fixEncoding]);

  // State management
  const [activeModel, setActiveModel] = useState<string>(thinkingModels[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewCounts, setViewCounts] = useState<Record<string, number>>(() => {
    // 初始化查看次数，所有模型初始为0
    const initialCounts: Record<string, number> = {};
    thinkingModels.forEach(model => {
      initialCounts[model.id] = 0;
    });
    return initialCounts;
  });
  
  // 收藏状态管理
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    // 从本地存储加载收藏状态
    const saved = localStorage.getItem('aes-thinking-favorites');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load favorites from localStorage:', e);
      }
    }
    return new Set<string>();
  });
  
  // 用于存储上一次点击的模型ID，实现延迟更新查看次数
  const [previousModel, setPreviousModel] = useState<string | null>(null);
  
  // 用于实现三击收藏功能的状态
  const [clickCount, setClickCount] = useState<Record<string, number>>({});
  const [clickTimeout, setClickTimeout] = useState<Record<string, NodeJS.Timeout>>({});
  
  // 保存收藏状态到本地存储
  useEffect(() => {
    localStorage.setItem('aes-thinking-favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);
  
  // Handle model click event with triple-click favorite functionality
  const handleModelClick = (modelId: string) => {
    // 更新当前激活的模型
    setActiveModel(modelId);
    
    // 如果不是第一次点击，并且点击的是不同的模型，则更新上一次模型的查看次数
    if (previousModel && previousModel !== modelId) {
      setViewCounts(prevCounts => ({
        ...prevCounts,
        [previousModel]: (prevCounts[previousModel] || 0) + 1
      }));
      setPreviousModel(modelId);
    } else if (!previousModel) {
      setPreviousModel(modelId);
    }
    
    // 实现三击收藏功能
    const currentCount = (clickCount[modelId] || 0) + 1;
    setClickCount(prev => ({ ...prev, [modelId]: currentCount }));
    
    // 清除之前的定时器
    if (clickTimeout[modelId]) {
      clearTimeout(clickTimeout[modelId]);
    }
    
    // 设置新的定时器
    const timer = setTimeout(() => {
      // 重置点击计数
      setClickCount(prev => {
        const newCounts = { ...prev };
        delete newCounts[modelId];
        return newCounts;
      });
      
      // 清除定时器引用
      setClickTimeout(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[modelId];
        return newTimeouts;
      });
    }, 500); // 500ms内点击3次才会触发收藏
    
    // 保存定时器引用
    setClickTimeout(prev => ({ ...prev, [modelId]: timer }));
    
    // 如果点击了3次，切换收藏状态
    if (currentCount === 3) {
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(modelId)) {
          newFavorites.delete(modelId);
        } else {
          newFavorites.add(modelId);
        }
        return newFavorites;
      });
      
      // 重置点击计数
      setClickCount(prev => {
        const newCounts = { ...prev };
        delete newCounts[modelId];
        return newCounts;
      });
      
      // 清除定时器引用
      setClickTimeout(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[modelId];
        return newTimeouts;
      });
    }
  };

  // 快速切换到上一个模型
  const handlePrevModel = () => {
    if (filteredModels.length <= 1) return;
    const currentIndex = filteredModels.findIndex(m => m.id === activeModel);
    // 如果当前模型不在过滤后的列表中（比如正在搜索），则跳转到第一个
    if (currentIndex === -1) {
      handleModelClick(filteredModels[0].id);
      return;
    }
    const prevIndex = (currentIndex - 1 + filteredModels.length) % filteredModels.length;
    handleModelClick(filteredModels[prevIndex].id);
  };

  // 快速切换到下一个模型
  const handleNextModel = () => {
    if (filteredModels.length <= 1) return;
    const currentIndex = filteredModels.findIndex(m => m.id === activeModel);
    // 如果当前模型不在过滤后的列表中，则跳转到第一个
    if (currentIndex === -1) {
      handleModelClick(filteredModels[0].id);
      return;
    }
    const nextIndex = (currentIndex + 1) % filteredModels.length;
    handleModelClick(filteredModels[nextIndex].id);
  };
  
  // Filter and sort models based on search term and favorites, but not real-time view counts
  const filteredModels = useMemo(() => {
    // Filter models first
    let models = thinkingModels;
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      models = thinkingModels.filter(model => 
        fixEncoding(model.label).toLowerCase().includes(searchLower) ||
        fixEncoding(model.description).toLowerCase().includes(searchLower) ||
        fixEncoding(model.deepAnalysis).toLowerCase().includes(searchLower)
      );
    }
    
    // Sort models by favorites status first, but not real-time view counts
    // 1. First: all favorites
    // 2. Then: all non-favorites
    // Note: View counts are still recorded but not used for real-time sorting to avoid button jumping
    const sortedModels = [...models].sort((a, b) => {
      // 检查是否是收藏模型
      const isAFavorite = favorites.has(a.id);
      const isBFavorite = favorites.has(b.id);
      
      // 如果一个是收藏，一个不是，收藏的排在前面
      if (isAFavorite && !isBFavorite) return -1;
      if (!isAFavorite && isBFavorite) return 1;
      
      // 如果都是收藏或都不是收藏，保持原始顺序
      // 不按实时查看次数排序，避免按钮跳动
      return 0;
    });
    
    // 修复所有模型的编码问题
    return sortedModels.map(fixModelEncoding);
  }, [searchTerm, favorites, fixEncoding, fixModelEncoding]);
  
  // Auto-select first model when search results change
  useEffect(() => {
    if (filteredModels.length > 0 && (!activeModel || !filteredModels.some(model => model.id === activeModel))) {
      setActiveModel(filteredModels[0].id);
      // 更新上一个模型，确保查看次数正确记录
      setPreviousModel(filteredModels[0].id);
    }
  }, [filteredModels, activeModel]);

  // Get the current active model data with error handling
  const currentModel = useMemo(() => {
    try {
      const model = thinkingModels.find(model => model.id === activeModel) || thinkingModels[0] || {
        id: 'default',
        name: 'default',
        label: '默认模型',
        icon: 'BrainCircuit',
        description: '默认思维模型',
        deepAnalysis: '这是一个默认思维模型，用于处理错误情况。',
        principle: '默认原则',
        scope: '默认范围',
        tips: '1. 这是一个默认模型',
        practice: '使用默认模型处理错误情况',
        visualDesign: '<div style="text-align: center; padding: 20px;">默认可视化设计</div>'
      };
      return fixModelEncoding(model);
    } catch (error) {
      console.error('Error finding active model:', error);
      // 返回一个安全的默认模型
      return fixModelEncoding({
        id: 'default',
        name: 'default',
        label: '默认模型',
        icon: 'BrainCircuit',
        description: '默认思维模型',
        deepAnalysis: '这是一个默认思维模型，用于处理错误情况。',
        principle: '默认原则',
        scope: '默认范围',
        tips: '1. 这是一个默认模型',
        practice: '使用默认模型处理错误情况',
        visualDesign: '<div style="text-align: center; padding: 20px;">默认可视化设计</div>'
      });
    }
  }, [activeModel, fixModelEncoding]);

  return (
    <div className={`${bgClass} min-h-screen transition-colors duration-200`}>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          {/* Search and Model Switcher */}
          <div className={`${cardBg} p-5 rounded-3xl border w-full`}>
            {/* Search Bar with Arrows and Help Button - 所有控制元素都放在同一行，自适应布局 */}
            <div className="mb-3">
              <div className="relative flex items-center justify-between w-full">
                {/* 左侧为搜索框，自适应宽度 */}
                <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${isNeomorphic 
                  ? (isNeomorphicDark 
                    ? 'bg-[#1e1e2e] border-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),inset_-3px_-3px_6px_rgba(30,30,46,1)]' 
                    : 'bg-[#e0e5ec] border-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]') 
                  : (isDark 
                    ? 'bg-zinc-900 border-zinc-800 shadow-[2px_2px_4px_rgba(0,0,0,0.4),-2px_-2px_4px_rgba(30,30,46,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.5),-3px_-3px_6px_rgba(30,30,46,1)]' 
                    : 'bg-white border-slate-300 shadow-[2px_2px_4px_rgba(163,177,198,0.2),-2px_-2px_4px_rgba(255,255,255,0.8)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.3),-3px_-3px_6px_rgba(255,255,255,0.9)]')
                }`}>
                  {/* 搜索图标 */}
                  <Search size={18} className={textSub} />
                  
                  {/* 搜索输入框，添加最小宽度限制，确保在小屏幕上不会被挤得太窄 */}
                  <input
                    type="text"
                    placeholder="搜索思维模型..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`flex-1 min-w-[80px] bg-transparent outline-none text-sm transition-all duration-300 focus:outline-none ${isNeomorphicDark 
                      ? 'text-white placeholder-white/50' 
                      : isDark 
                        ? 'text-white placeholder-zinc-500' 
                        : 'text-black placeholder-black/50'
                    }`}
                  />
                </div>
                
                {/* 右侧为控制按钮组：上一个模型、下一个模型、帮助按钮，按顺序排列 */}
                <div className="flex items-center gap-2 ml-2 whitespace-nowrap">
                  <button
                    onClick={handlePrevModel}
                    className={`p-2 rounded-full transition-all duration-300 flex-shrink-0 ${isNeomorphic 
                      ? (isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(30,30,46,0.8)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.5),-6px_-6px_12px_rgba(30,30,46,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5)]')
                      : (isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white shadow-sm' : 'bg-white hover:bg-slate-100 shadow-sm')
                    } ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}
                    title="上一个模型"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <button
                    onClick={handleNextModel}
                    className={`p-2 rounded-full transition-all duration-300 flex-shrink-0 ${isNeomorphic 
                      ? (isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(30,30,46,0.8)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.5),-6px_-6px_12px_rgba(30,30,46,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5)]')
                      : (isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white shadow-sm' : 'bg-white hover:bg-slate-100 shadow-sm')
                    } ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}
                    title="下一个模型"
                  >
                    <ChevronRight size={20} />
                  </button>
                  
                  {/* 帮助按钮放在最右侧 */}
                  {onHelpClick && (
                    <GlobalHelpButton 
                      helpId="thinkingCenter" 
                      onHelpClick={onHelpClick} 
                      size={18} 
                      variant="ghost" 
                      className="ml-1" 
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Model Switching Buttons - Using ModelButton component for consistent styling */}
            <div className={`relative h-auto max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent rounded-xl ${isNeomorphic ? (isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]') : (isDark ? 'bg-zinc-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]' : 'bg-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3)]')}`}>
              {/* 优化的流式布局：增大间距，更宽松美观 */}
              <div className="flex flex-wrap gap-2 p-2">
                {filteredModels.map((model, index) => (
                  <ModelButton
                    key={model.id}
                    onClick={() => handleModelClick(model.id)}
                    isActive={activeModel === model.id}
                    theme={validTheme as Theme}
                    isFavorite={favorites.has(model.id)}
                  >
                    <div className="flex items-center gap-1 justify-start">
                      <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[8px] mr-1 ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'} flex-shrink-0`}>{index + 1}</span>
                      <span className="truncate text-nowrap">{fixEncoding(model.label)}</span>
                    </div>
                  </ModelButton>
                ))}
              </div>
            </div>
          </div>
          
          {/* Model Display with lazy loading and error handling */}
          {/* Model Content */}
          <div className="space-y-4 animate-fadeIn">
            {/* Model Description */}
            <p className={`text-sm ${textSub} mt-0`}>{currentModel.description}</p>
            
            {/* Visual Design - Lazy loaded with error handling */}
            <div className={`rounded-xl p-4 border transition-all duration-200 ${isDark ? (isNeomorphic ? `${neomorphicStyles.bg} ${neomorphicStyles.border} ${neomorphicStyles.shadow}` : 'bg-zinc-900 border-zinc-800') : (isNeomorphic ? `${neomorphicStyles.bg} ${neomorphicStyles.border} ${neomorphicStyles.shadow}` : 'bg-white border-slate-200')}`}>
              {currentModel && currentModel.visualDesign ? (
                <ModelErrorBoundary
                  fallback={
                    <div className={`flex flex-col items-center justify-center h-40 text-sm ${textSub} p-4`}>
                      <p className="mb-2">模型可视化渲染出错</p>
                      <p className="text-xs opacity-70">请尝试刷新页面或选择其他模型</p>
                    </div>
                  }
                >
                  {/* Safe rendering with additional checks and theme adaptation */}
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeHtml(currentModel.visualDesign || '')
                    }}
                    className={`w-full ${bgClass} ${textMain} overflow-hidden`}
                    style={{
                      backgroundColor: isDark ? (isNeomorphic ? '#1e1e2e' : '#18181b') : (isNeomorphic ? '#e0e5ec' : '#f8fafc'),
                      color: isDark ? '#f8fafc' : '#18181b',
                      border: 'none',
                      boxShadow: 'none'
                    }}
                  />
                </ModelErrorBoundary>
              ) : (
                <div className={`flex items-center justify-center h-40 text-sm ${textSub}`}>
                  暂无可视化设计
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingCenter;