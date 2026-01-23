/**
 * 任务搜索栏组件
 * 提供任务搜索和过滤功能
 */

import React, { memo, useCallback } from 'react';
import { Search, X, Plus } from 'lucide-react';

interface TaskSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  theme: string;
  isDark: boolean;
  isNeomorphic: boolean;
  textMain: string;
  textSub: string;
  onAddTask?: () => void;
}

const TaskSearchBar: React.FC<TaskSearchBarProps> = memo(({
  searchTerm,
  onSearchChange,
  theme,
  isDark,
  isNeomorphic,
  textMain,
  textSub,
  onAddTask
}) => {
  const handleClear = useCallback(() => {
    onSearchChange('');
  }, [onSearchChange]);

  // 获取搜索框样式
  const getInputStyles = () => {
    if (isNeomorphic) {
      if (theme === 'neomorphic-dark') {
        return 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none';
      }
      return 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none';
    }
    return isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-200';
  };

  // 获取清除按钮样式
  const getClearButtonStyles = () => {
    if (isNeomorphic) {
      if (theme === 'neomorphic-dark') {
        return 'bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(30,30,46,0.7)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(30,30,46,0.7)]';
      }
      return 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[1px_1px_3px_rgba(163,177,198,0.6),-1px_-1px_3px_rgba(255,255,255,1)] active:shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)]';
    }
    return isDark ? 'hover:bg-zinc-700' : 'hover:bg-slate-100';
  };

  return (
    <div className="w-full mb-4">
      {/* 搜索框和按钮容器 - 在移动端垂直排列 */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className={`relative flex-1 flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${getInputStyles()}`}>
          {/* 搜索图标 */}
          <Search size={18} className={textSub} />
          
          {/* 搜索输入框 */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索任务..."
            className={`flex-1 bg-transparent outline-none text-sm ${textMain} placeholder:${textSub}`}
          />
          
          {/* 清除按钮 */}
          {searchTerm && (
            <button
              onClick={handleClear}
              className={`p-1 rounded-full transition-all ${getClearButtonStyles()}`}
              aria-label="清除搜索"
            >
              <X size={16} className={textSub} />
            </button>
          )}
        </div>

        {/* 添加任务按钮 - 在移动端占满宽度，桌面端显示为圆形 */}
        {onAddTask && (
          <button
            onClick={onAddTask}
            className={`flex items-center justify-center gap-1.5 rounded-full transition-all font-semibold text-sm ${isNeomorphic 
              ? (theme === 'neomorphic-dark' 
                ? 'w-10 h-10 bg-[#1e1e2e] text-blue-400 shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(30,30,46,0.8)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.4),-2px_-2px_4px_rgba(30,30,46,0.8)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' 
                : 'w-10 h-10 bg-[#e0e5ec] text-blue-600 shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]')
              : (isDark ? 'w-10 h-10 bg-blue-600 text-white hover:bg-blue-500' : 'w-10 h-10 bg-blue-500 text-white hover:bg-blue-400')
            } sm:w-10 sm:h-10 w-full py-2`}
          >
            <Plus size={18} />
          </button>
        )}
      </div>
      
      {/* 搜索结果提示 */}
      {searchTerm && (
        <div className={`text-xs mt-2 ${textSub}`}>
          搜索: "{searchTerm}"
        </div>
      )}
    </div>
  );
});

TaskSearchBar.displayName = 'TaskSearchBar';

export default TaskSearchBar;
