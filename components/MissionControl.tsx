import React, { useState, useEffect, useRef } from 'react';
import { Theme, Project, Habit } from '../types';
import { HelpCircle, Search } from 'lucide-react';
import { GlobalGuideCard, HelpTooltip, helpContent } from './HelpSystem';
import FateDice from './FateDice';

interface MissionControlProps {
  theme: Theme;
  projects: Project[];
  habits: Habit[];
}

const MissionControl: React.FC<MissionControlProps> = ({ theme, projects, habits }) => {
  const isDark = theme === 'dark' || theme === 'neomorphic-dark';
  const isNeomorphic = theme.startsWith('neomorphic');
  
  // 拟态风格样式变量 - 优化阴影效果，使其与按钮圆角匹配
  const neomorphicStyles = {
    light: {
      bg: 'bg-[#e0e5ec]',
      border: 'border-[#e0e5ec]',
      shadow: 'shadow-[8px_8px_16px_rgba(163,177,198,0.2),-8px_-8px_16px_rgba(255,255,255,0.8)] rounded-[24px]',
      hoverShadow: 'hover:shadow-[10px_10px_20px_rgba(163,177,198,0.3),-10px_-10px_20px_rgba(255,255,255,0.9)] rounded-[24px]',
      activeShadow: 'active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.3),inset_-5px_-5px_10px_rgba(255,255,255,0.8)] rounded-[24px]',
      transition: 'transition-all duration-200'
    },
    dark: {
      bg: 'bg-[#1e1e2e]',
      border: 'border-[#1e1e2e]',
      shadow: 'shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)] rounded-[24px]',
      hoverShadow: 'hover:shadow-[10px_10px_20px_rgba(0,0,0,0.5),-10px_-10px_20px_rgba(30,30,46,1)] rounded-[24px]',
      activeShadow: 'active:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.4),inset_-5px_-5px_10px_rgba(30,30,46,0.8)] rounded-[24px]',
      transition: 'transition-all duration-200'
    }
  };
  
  const currentNeomorphicStyle = neomorphicStyles[theme === 'neomorphic-dark' ? 'dark' : 'light'];
  
  const bgClass = isNeomorphic 
      ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]') 
      : isDark 
      ? 'bg-zinc-950' 
      : 'bg-slate-50';
  
  const cardBg = isNeomorphic 
      ? `${currentNeomorphicStyle.bg} rounded-[48px] ${currentNeomorphicStyle.shadow} ${currentNeomorphicStyle.hoverShadow} ${currentNeomorphicStyle.activeShadow} ${currentNeomorphicStyle.transition}` 
      : isDark 
      ? 'bg-zinc-900' 
      : 'bg-white shadow-sm';
  
  const textMain = isNeomorphic 
      ? (theme === 'neomorphic-dark' ? 'text-zinc-300' : 'text-zinc-700') 
      : isDark 
      ? 'text-zinc-200' 
      : 'text-slate-800';
  
  const textSub = isNeomorphic 
      ? (theme === 'neomorphic-dark' ? 'text-zinc-400' : 'text-zinc-600') 
      : isDark 
      ? 'text-zinc-500' 
      : 'text-slate-500';

  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`w-full h-full ${bgClass} overflow-auto`} ref={containerRef}>
      {/* 作战中心主界面 */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${textMain}`}>作战中心</h2>
        </div>
        
        {/* 核心功能区域 */}
        <div className={`${cardBg} p-6 rounded-3xl shadow-lg`}>
          <h3 className={`text-2xl font-bold ${textMain} mb-4`}>欢迎来到作战中心</h3>
          
          {/* 命运骰子功能 */}
          <div className="mb-8">
            <FateDice theme={theme} />
          </div>
          
          {/* 项目和习惯数据概览 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
            <div className={`${isNeomorphic ? `${currentNeomorphicStyle.bg} ${currentNeomorphicStyle.border} ${currentNeomorphicStyle.shadow} ${currentNeomorphicStyle.hoverShadow} ${currentNeomorphicStyle.transition}` : (isDark ? 'bg-zinc-800' : 'bg-white shadow-sm')} p-4 rounded-xl transition-all duration-300 hover:shadow-lg`}>
              <h4 className={`text-lg font-semibold ${textMain} mb-2`}>项目总数</h4>
              <p className={`text-4xl font-bold ${textMain}`}>{projects.length}</p>
            </div>
            <div className={`${isNeomorphic ? `${currentNeomorphicStyle.bg} ${currentNeomorphicStyle.border} ${currentNeomorphicStyle.shadow} ${currentNeomorphicStyle.hoverShadow} ${currentNeomorphicStyle.transition}` : (isDark ? 'bg-zinc-800' : 'bg-white shadow-sm')} p-4 rounded-xl transition-all duration-300 hover:shadow-lg`}>
              <h4 className={`text-lg font-semibold ${textMain} mb-2`}>习惯总数</h4>
              <p className={`text-4xl font-bold ${textMain}`}>{habits.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionControl;