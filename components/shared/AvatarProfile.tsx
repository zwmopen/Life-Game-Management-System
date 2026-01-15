import React, { useState } from 'react';
import { Smile, Star, Edit3, Check, X } from 'lucide-react';
import { GlobalHelpButton } from '../HelpSystem';
import { Theme } from '../../types';

interface AvatarProfileProps {
  theme: Theme;
  xp: number;
  totalHours: number;
  balance: number;
  levelInfo: {
    level: number;
    progress: number;
    title: string;
  };
  focusInfo: {
    level: number;
    progress: number;
    title: string;
  };
  wealthInfo: {
    level: number;
    progress: number;
    title: string;
  };
  onLevelChange?: (newLevel: number, type: 'level' | 'focus' | 'wealth') => void;
  onHelpClick?: (helpId: string) => void;
  onBadgeCategoryClick?: (category: 'LEVEL' | 'FOCUS' | 'WEALTH') => void;
}

const AvatarProfile: React.FC<AvatarProfileProps> = ({
  theme,
  xp,
  totalHours,
  balance,
  levelInfo,
  focusInfo,
  wealthInfo,
  onLevelChange,
  onHelpClick,
  onBadgeCategoryClick
}) => {
  const isDark = theme === 'dark' || theme === 'neomorphic-dark';
  const isNeomorphic = theme.startsWith('neomorphic');
  const cardBg = isNeomorphic
    ? (theme === 'neomorphic-dark'
      ? 'bg-[#1e1e2e] border-[#1e1e2e] rounded-[48px] shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)] transition-all duration-300'
      : 'bg-[#e0e5ec] border-[#a3b1c6] rounded-[48px] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] transition-all duration-300')
    : isDark
    ? 'bg-zinc-900 border-zinc-800'
    : 'bg-white border-slate-200';
  const textMain = isDark ? 'text-zinc-100' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';

  // 编辑状态管理
  const [editingLevel, setEditingLevel] = useState<{ type: 'level' | 'focus' | 'wealth'; value: number } | null>(null);
  const [tempLevel, setTempLevel] = useState(0);

  // 开始编辑
  const handleDoubleClick = (type: 'level' | 'focus' | 'wealth', currentLevel: number) => {
    setEditingLevel({ type, value: currentLevel });
    setTempLevel(currentLevel);
  };

  // 保存编辑
  const handleSave = () => {
    if (editingLevel && onLevelChange) {
      // 确保等级在合理范围内
      const newLevel = Math.max(1, Math.min(99, tempLevel));
      onLevelChange(newLevel, editingLevel.type);
    }
    setEditingLevel(null);
  };

  // 取消编辑
  const handleCancel = () => {
    setEditingLevel(null);
  };

  // 渲染等级显示或编辑框
  const renderLevel = (
    type: 'level' | 'focus' | 'wealth',
    level: number,
    title: string,
    color: string
  ) => {
    const isEditing = editingLevel?.type === type;
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2 truncate max-w-[120px]">
          <div className={`flex items-center gap-1 ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'} rounded-lg p-1.5 border ${isNeomorphic ? 'border-[#a3b1c6]' : isDark ? 'border-zinc-700' : 'border-slate-300'}`}>
            <input
              type="number"
              value={tempLevel}
              onChange={(e) => setTempLevel(parseInt(e.target.value) || 0)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              className={`w-20 px-2 py-1 text-xs rounded-md ${isDark 
                ? 'bg-zinc-900 text-white focus:ring-blue-500' 
                : isNeomorphic 
                ? 'bg-[#e0e5ec] text-zinc-700 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] focus:ring-blue-500' 
                : 'bg-white text-slate-800 focus:ring-blue-500'}`}
              autoFocus
              min="1"
              max="99"
            />
            <div className="flex gap-1">
              <button
                onClick={handleSave}
                className={`p-1 rounded-md transition-all duration-200 ${isDark 
                  ? 'hover:bg-zinc-700 text-green-400 hover:shadow-lg' 
                  : isNeomorphic 
                  ? 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.5),-2px_-2px_4px_rgba(255,255,255,1)] text-green-600 active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)]' 
                  : 'hover:bg-green-100 text-green-600 hover:shadow-lg'}`}
                title="保存"
              >
                <Check size={14} />
              </button>
              <button
                onClick={handleCancel}
                className={`p-1 rounded-md transition-all duration-200 ${isDark 
                  ? 'hover:bg-zinc-700 text-red-400 hover:shadow-lg' 
                  : isNeomorphic 
                  ? 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.5),-2px_-2px_4px_rgba(255,255,255,1)] text-red-600 active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)]' 
                  : 'hover:bg-red-100 text-red-600 hover:shadow-lg'}`}
                title="取消"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 点击称号跳转到荣誉勋章对应分类
    const handleClick = (e: React.MouseEvent) => {
      // 阻止双击编辑事件同时触发
      if (e.detail === 1) { // 单击
        if (onBadgeCategoryClick) {
          onBadgeCategoryClick(type.toUpperCase() as 'LEVEL' | 'FOCUS' | 'WEALTH');
        }
      }
    };

    return (
      <div 
        className={`flex items-center gap-1 truncate ${textMain} max-w-[100px] cursor-pointer hover:opacity-80 transition-opacity`}
        onDoubleClick={() => handleDoubleClick(type, level)}
        onClick={handleClick}
        title="单击跳转到荣誉勋章对应分类，双击编辑等级"
      >
        <span className={`font-mono ${color} font-bold`}>LV.{level}</span>
        <span className={`text-xs truncate ${theme === 'neomorphic-dark' ? 'text-zinc-300' : isNeomorphic ? 'text-zinc-600' : isDark ? 'text-zinc-400' : 'text-slate-600'}`}>{title}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* 角色标题 */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
          <Star size={12}/> 角色系统
        </div>
        {onHelpClick && (
          <GlobalHelpButton 
            helpId="character" 
            onHelpClick={onHelpClick} 
            size={14} 
            className="hover:scale-[1.1]" 
          />
        )}
      </div>
      
      {/* 头像和统计信息 */}
      <div className="flex items-center gap-3">
        {/* Avatar (SMILE) */}
        <div className="shrink-0">
          <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center relative overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${isNeomorphic ? 'bg-[#e0e5ec] border-[#a3b1c6] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-750' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}>
            <Smile size={36} className={`text-yellow-500 animate-[pulse_3s_infinite]`} strokeWidth={2}/>
            <div className={`absolute inset-0 ${theme === 'neomorphic-dark' ? 'bg-gradient-to-t from-white/10 to-transparent' : 'bg-gradient-to-t from-black/10 to-transparent'}`}></div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-1 gap-1.5">
          <div className="flex items-center gap-1.5 text-xs">
                <div className="w-8 font-bold text-right text-blue-500 shrink-0">经验</div>
                <div className={`w-24 h-2 rounded-full overflow-hidden ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-800 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]' : 'bg-slate-200 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'}`}>
                  <div className="h-full bg-blue-500 transition-all duration-500 ease-out rounded-full" style={{ width: `${levelInfo.progress}%` }}></div>
                </div>
                {renderLevel('level', levelInfo.level, levelInfo.title, 'text-blue-500')}
              </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-8 font-bold text-right text-emerald-500 shrink-0">专注</div>
            <div className={`w-24 h-2 rounded-full overflow-hidden ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-800 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]' : 'bg-slate-200 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'}`}>
              <div className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full" style={{ width: `${focusInfo.progress}%` }}></div>
            </div>
            {renderLevel('focus', focusInfo.level, focusInfo.title, 'text-emerald-400')}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-8 font-bold text-right text-yellow-500 shrink-0">财富</div>
            <div className={`w-24 h-2 rounded-full overflow-hidden ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-800 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]' : 'bg-slate-200 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'}`}>
              <div className="h-full bg-yellow-500 transition-all duration-500 ease-out rounded-full" style={{ width: `${wealthInfo.progress}%` }}></div>
            </div>
            {renderLevel('wealth', wealthInfo.level, wealthInfo.title, 'text-yellow-400')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarProfile;
