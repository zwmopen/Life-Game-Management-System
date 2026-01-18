/**
 * 批量操作工具栏组件
 * 提供任务批量操作的UI界面
 */

import React, { memo } from 'react';
import { CheckSquare, Trash2, Archive, X } from 'lucide-react';
import { getNeomorphicStyles } from '../../utils/styleHelpers';

interface BatchOperationsBarProps {
  // 是否显示工具栏
  visible: boolean;
  // 选中的任务数量
  selectedCount: number;
  // 批量删除回调
  onBatchDelete: () => void;
  // 批量归档回调
  onBatchArchive?: () => void;
  // 取消选择回调
  onCancel: () => void;
  // 全选回调
  onSelectAll: () => void;
  // 主题配置
  theme: string;
  isDark: boolean;
  isNeomorphic: boolean;
  textMain: string;
  textSub: string;
}

const BatchOperationsBar: React.FC<BatchOperationsBarProps> = memo(({
  visible,
  selectedCount,
  onBatchDelete,
  onBatchArchive,
  onCancel,
  onSelectAll,
  theme,
  isDark,
  isNeomorphic,
  textMain,
  textSub
}) => {
  if (!visible) return null;

  // 获取工具栏样式
  const getBarStyles = () => {
    if (isNeomorphic) {
      if (theme === 'neomorphic-dark') {
        return 'bg-[#1e1e2e] shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)] border-none';
      }
      return 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] border-none';
    }
    return isDark ? 'bg-zinc-900 border border-zinc-700' : 'bg-white border border-slate-200';
  };

  // 获取按钮样式
  const getButtonStyles = (color: 'blue' | 'red' | 'yellow' | 'gray') => {
    const baseStyles = 'flex items-center gap-2 px-3 py-2 rounded-full transition-all text-sm font-medium';
    
    if (isNeomorphic) {
      const neomorphicStyles = getNeomorphicStyles(theme === 'neomorphic-dark');
      if (theme === 'neomorphic-dark') {
        const colors = {
          blue: `${neomorphicStyles.bg} text-blue-400 ${neomorphicStyles.shadow} active:${neomorphicStyles.activeShadow}`,
          red: `${neomorphicStyles.bg} text-red-400 ${neomorphicStyles.shadow} active:${neomorphicStyles.activeShadow}`,
          yellow: `${neomorphicStyles.bg} text-yellow-400 ${neomorphicStyles.shadow} active:${neomorphicStyles.activeShadow}`,
          gray: `${neomorphicStyles.bg} text-zinc-400 ${neomorphicStyles.shadow} active:${neomorphicStyles.activeShadow}`
        };
        return `${baseStyles} ${colors[color]}`;
      }
      const colors = {
        blue: `${neomorphicStyles.bg} text-blue-600 ${neomorphicStyles.shadow} active:${neomorphicStyles.activeShadow}`,
        red: `${neomorphicStyles.bg} text-red-600 ${neomorphicStyles.shadow} active:${neomorphicStyles.activeShadow}`,
        yellow: `${neomorphicStyles.bg} text-yellow-600 ${neomorphicStyles.shadow} active:${neomorphicStyles.activeShadow}`,
        gray: `${neomorphicStyles.bg} text-slate-600 ${neomorphicStyles.shadow} active:${neomorphicStyles.activeShadow}`
      };
      return `${baseStyles} ${colors[color]}`;
    }
    
    const colors = {
      blue: isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600',
      red: isDark ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600',
      yellow: isDark ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-yellow-500 text-white hover:bg-yellow-600',
      gray: isDark ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
    };
    return `${baseStyles} ${colors[color]}`;
  };

  return (
    <div className={`sticky top-0 z-10 p-4 rounded-lg mb-4 ${getBarStyles()}`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* 选中数量提示 */}
        <div className="flex items-center gap-2">
          <CheckSquare size={20} className={textMain} />
          <span className={`text-sm font-medium ${textMain}`}>
            已选择 <span className="text-blue-500 font-bold">{selectedCount}</span> 个任务
          </span>
        </div>

        {/* 操作按钮组 */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onSelectAll}
            className={getButtonStyles('blue')}
            title="全选"
          >
            <CheckSquare size={16} />
            全选
          </button>

          {onBatchArchive && (
            <button
              onClick={onBatchArchive}
              className={getButtonStyles('yellow')}
              disabled={selectedCount === 0}
              title="归档选中"
            >
              <Archive size={16} />
              归档
            </button>
          )}

          <button
            onClick={onBatchDelete}
            className={getButtonStyles('red')}
            disabled={selectedCount === 0}
            title="删除选中"
          >
            <Trash2 size={16} />
            删除 ({selectedCount})
          </button>

          <button
            onClick={onCancel}
            className={getButtonStyles('gray')}
            title="取消批量操作"
          >
            <X size={16} />
            取消
          </button>
        </div>
      </div>
    </div>
  );
});

BatchOperationsBar.displayName = 'BatchOperationsBar';

export default BatchOperationsBar;
