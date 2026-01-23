import React, { useState, useMemo, Suspense, lazy } from 'react';
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
  
  // Remove script tags completely
  let sanitized = html.replace(/<script[^>]*>.*?<\/script>/gi, '');
  
  // Remove style tags completely  
  sanitized = sanitized.replace(/<style[^>]*>.*?<\/style>/gi, '');
  
  // Remove all event handlers
  sanitized = sanitized.replace(/\s+(on\w+)\s*=\s*["']?[^"'>\s]+["']?/gi, '');
  
  // Allow only safe HTML tags
  const allowedTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'a', 'img', 'svg', 'g', 'path', 'circle', 'rect', 'line', 'text', 'animate', 'animateMotion', 'animateTransform', 'defs', 'marker'];
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
// Simplified error boundary implementation
const ModelErrorBoundary = ({ children, fallback }: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) => {
  try {
    return children;
  } catch (error) {
    console.error('Model rendering error:', error);
    return fallback;
  }
};

// Button component without drag and drop functionality
const ModelButton = ({ children, onClick, isActive, theme }: { children: React.ReactNode; onClick: () => void; isActive: boolean; theme: 'light' | 'dark' | 'neomorphic-light' | 'neomorphic-dark' } & React.HTMLAttributes<HTMLButtonElement>) => {
  const isDark = theme.includes('dark');
  const isNeomorphic = theme.startsWith('neomorphic');
  const isNeomorphicDark = theme === 'neomorphic-dark';
  
  // 拟态风格按钮样式
  const getButtonClass = () => {
    // 根据主题确定基本样式
    if (isNeomorphic) {
      if (isNeomorphicDark) {
        // 拟态暗色主题
        const baseClass = 'px-3 py-1.5 rounded-[18px] text-xs font-bold transition-all duration-200 ease-in-out flex items-center justify-center border border-transparent';
        if (isActive) {
          // 选中状态 - 内凹效果
          return `${baseClass} bg-[#1e1e2e] text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(30,30,46,0.8)] transform scale-95`;
        } else {
          // 默认状态 - 外凸效果
          return `${baseClass} bg-[#1e1e2e] text-zinc-300 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(30,30,46,0.8)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.5),-6px_-6px_12px_rgba(30,30,46,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(30,30,46,0.8)] active:transform active:scale-95`;
        }
      } else {
        // 拟态亮色主题
        const baseClass = 'px-3 py-1.5 rounded-[18px] text-xs font-bold transition-all duration-200 ease-in-out flex items-center justify-center border border-transparent';
        if (isActive) {
          // 选中状态 - 内凹效果
          return `${baseClass} bg-[#e0e5ec] text-zinc-700 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] transform scale-95`;
        } else {
          // 默认状态 - 外凸效果
          return `${baseClass} bg-[#e0e5ec] text-zinc-700 shadow-[4px_4px_8px_rgba(163,177,198,0.3),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.4),-6px_-6px_12px_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] active:transform active:scale-95`;
        }
      }
    } else {
      // 普通主题
      const baseClass = 'px-3 py-1.5 rounded-[18px] text-xs font-bold border transition-all duration-200 ease-in-out';
      if (isActive) {
        return `${baseClass} bg-blue-500 text-white border-blue-500`;
      } else {
        if (isDark) {
          return `${baseClass} bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700`;
        } else {
          return `${baseClass} bg-white text-black border-slate-300 hover:bg-slate-100`;
        }
      }
    }
  };
  
  return (
    <button
      onClick={onClick}
      className={getButtonClass()}
    >
      {children}
    </button>
  );
};

const ThinkingCenter: React.FC<ThinkingCenterProps> = ({ theme, onHelpClick }) => {
  const isDark = theme.includes('dark');
  const isNeomorphic = theme.startsWith('neomorphic');
  
  const isNeomorphicDark = theme === 'neomorphic-dark';
  const neomorphicStyles = getNeomorphicStyles(isNeomorphicDark);
  
  // Theme-specific styles
  const bgClass = isDark 
    ? (isNeomorphic ? 'bg-[#1e1e2e]' : 'bg-zinc-950') 
    : (isNeomorphic ? 'bg-[#e0e5ec]' : 'bg-slate-50');
  
  const cardBg = getCardBgStyle(isNeomorphic, theme, isDark);

  // 将字体颜色统一设置为黑色或白色，确保可读性
  const textMain = getTextStyle(isDark, isNeomorphic, 'main');
  const textSub = getTextStyle(isDark, isNeomorphic, 'sub');

  // 生成搜索框样式类
  const getSearchInputClass = () => {
    const baseClass = 'w-full px-4 py-2 pr-10 rounded-[24px] text-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50';
    
    if (isNeomorphic) {
      if (theme === 'neomorphic-dark') {
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
  
  // 用于存储上一次点击的模型ID，实现延迟更新查看次数
  const [previousModel, setPreviousModel] = useState<string | null>(null);
  
  // Handle model click event
  const handleModelClick = (modelId: string) => {
    // 如果不是第一次点击，并且点击的是不同的模型，则更新上一次模型的查看次数
    if (previousModel && previousModel !== modelId) {
      setViewCounts(prevCounts => ({
        ...prevCounts,
        [previousModel]: (prevCounts[previousModel] || 0) + 1
      }));
    }
    
    // 更新当前激活的模型和上一次点击的模型
    setActiveModel(modelId);
    setPreviousModel(modelId);
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
  
  // Filter and sort models based on search term and view counts
  const filteredModels = useMemo(() => {
    // Filter models first
    let models = thinkingModels;
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      models = thinkingModels.filter(model => 
        model.label.toLowerCase().includes(searchLower) ||
        model.description.toLowerCase().includes(searchLower) ||
        model.deepAnalysis.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort models: all models sorted by view count in descending order
    return [...models].sort((a, b) => {
      const countA = viewCounts[a.id] || 0;
      const countB = viewCounts[b.id] || 0;
      return countB - countA;
    });
  }, [searchTerm, viewCounts]);
  
  // Get the current active model data with error handling
  const currentModel = useMemo(() => {
    try {
      return thinkingModels.find(model => model.id === activeModel) || thinkingModels[0] || {
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
    } catch (error) {
      console.error('Error finding active model:', error);
      // 返回一个安全的默认模型
      return {
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
    }
  }, [activeModel]);

  return (
    <div className={`${bgClass} min-h-screen transition-colors duration-200`}>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          {/* Header with Help Button */}
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl font-bold flex items-center gap-2 ${textMain}`}>
              <BookOpen className="text-blue-500" /> 思维中心
            </h1>
            {onHelpClick && (
              <GlobalHelpButton 
                helpId="thinkingCenter" 
                onHelpClick={onHelpClick} 
                size={18} 
                variant="ghost" 
              />
            )}
          </div>

          {/* Search and Model Switcher */}
          <div className={`${cardBg} p-5 rounded-3xl border w-full`}>
            {/* Search Bar with Arrows - 两个按钮都放在搜索框右边并且紧挨着 */}
            <div className="mb-3">
              <div className="relative flex items-center">
                {/* 搜索框 */}
                <div className={`flex-1 mr-2 flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${isNeomorphic 
                  ? (isNeomorphicDark 
                    ? 'bg-[#1e1e2e] border-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),inset_-3px_-3px_6px_rgba(30,30,46,1)]' 
                    : 'bg-[#e0e5ec] border-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]') 
                  : (isDark 
                    ? 'bg-zinc-900 border-zinc-800 shadow-[2px_2px_4px_rgba(0,0,0,0.4),-2px_-2px_4px_rgba(30,30,46,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.5),-3px_-3px_6px_rgba(30,30,46,1)]' 
                    : 'bg-white border-slate-300 shadow-[2px_2px_4px_rgba(163,177,198,0.2),-2px_-2px_4px_rgba(255,255,255,0.8)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.3),-3px_-3px_6px_rgba(255,255,255,0.9)]')
                }`}>
                  {/* 搜索图标 */}
                  <Search size={18} className={textSub} />
                  
                  {/* 搜索输入框 */}
                  <input
                    type="text"
                    placeholder="搜索思维模型..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`flex-1 bg-transparent outline-none text-sm transition-all duration-300 focus:outline-none ${isNeomorphicDark 
                      ? 'text-white placeholder-white/50' 
                      : isDark 
                        ? 'text-white placeholder-zinc-500' 
                        : 'text-black placeholder-black/50'
                    }`}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevModel}
                    className={`p-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                      isNeomorphic 
                        ? (isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(30,30,46,0.8)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.5),-6px_-6px_12px_rgba(30,30,46,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5)]')
                        : (isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white shadow-sm' : 'bg-white hover:bg-slate-100 shadow-sm')
                    } ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}
                    title="上一个模型"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <button
                    onClick={handleNextModel}
                    className={`p-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                      isNeomorphic 
                        ? (isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(30,30,46,0.8)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.5),-6px_-6px_12px_rgba(30,30,46,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5)]')
                        : (isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white shadow-sm' : 'bg-white hover:bg-slate-100 shadow-sm')
                    } ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}
                    title="下一个模型"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Model Switching Buttons - Vertical Scroll with 2 rows */}
            <div className={`relative h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent rounded-xl ${isNeomorphic ? (isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]') : (isDark ? 'bg-zinc-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]' : 'bg-slate-100 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3)]')}`}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pl-2 pr-2">
                {filteredModels.map((model, index) => (
                  <ModelButton
                    key={model.id}
                    onClick={() => handleModelClick(model.id)}
                    isActive={activeModel === model.id}
                    theme={theme}
                  >
                    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[8px] mr-1.5 ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</span>
                    {model.label}
                  </ModelButton>
                ))}
              </div>
            </div>
          </div>
          
          {/* Model Display with lazy loading and error handling */}
          <div className={`${cardBg} p-6 rounded-3xl border w-full transition-all duration-300`}>
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
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: sanitizeHtml(currentModel.visualDesign)
                      }}
                      className="w-full"
                    />
                  </ModelErrorBoundary>
                ) : (
                  <div className={`flex items-center justify-center h-40 text-sm ${textSub}`}>
                    暂无可视化设计
                  </div>
                )}
              </div>
              
              {/* Model Details - Lazy loaded below the chart */}
              <Suspense
                fallback={
                  <div className={`flex items-center justify-center h-32 text-sm ${textSub}`}>
                    正在加载模型详情...
                  </div>
                }
              >
                <div className="space-y-4">
                  {/* Description */}
                  <div className="space-y-1">
                    <h3 className={`text-sm font-semibold ${textMain}`}>模型描述</h3>
                    <p className={`text-sm ${textSub}`}>{currentModel.deepAnalysis}</p>
                  </div>
                  
                  {/* Principle */}
                  <div className="space-y-1">
                    <h3 className={`text-sm font-semibold ${textMain}`}>核心原则</h3>
                    <p className={`text-sm ${textSub}`}>{currentModel.principle}</p>
                  </div>
                  
                  {/* Scope */}
                  <div className="space-y-1">
                    <h3 className={`text-sm font-semibold ${textMain}`}>应用范围</h3>
                    <p className={`text-sm ${textSub}`}>{currentModel.scope}</p>
                  </div>
                  
                  {/* Tips */}
                  <div className="space-y-1">
                    <h3 className={`text-sm font-semibold ${textMain}`}>使用技巧</h3>
                    <ul className={`text-sm ${textSub} space-y-1 list-disc list-inside`}>
                      {currentModel.tips.split('\n').map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Practice */}
                  <div className="space-y-1">
                    <h3 className={`text-sm font-semibold ${textMain}`}>实践建议</h3>
                    <p className={`text-sm ${textSub}`}>{currentModel.practice}</p>
                  </div>
                </div>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingCenter;