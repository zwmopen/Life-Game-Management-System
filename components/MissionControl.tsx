import React, { useState, useEffect, useRef } from 'react';
import { Theme, Project, Habit, DiceState } from '../types';
import { INITIAL_DICE_STATE } from '../constants/index';
import { Search } from 'lucide-react';
import { GlobalHelpButton } from './HelpSystem';
import FateDice from './FateDice';
import { getNeomorphicStyles, getButtonStyle, getCardBgStyle, getTextStyle } from '../utils/styleHelpers';

interface MissionControlProps {
  theme: Theme;
  projects: Project[];
  habits: Habit[];
  onHelpClick: (id: string) => void;
}

const MissionControl: React.FC<MissionControlProps> = ({ theme, projects, habits, onHelpClick }) => {
  const [diceState, setDiceState] = useState<DiceState>(INITIAL_DICE_STATE);
  
  const isDark = theme.includes('dark');
  const isNeomorphic = theme.startsWith('neomorphic');
  
  // 模拟掷骰子功能
  const onSpinDice = () => {
    if (diceState.todayCount >= diceState.config.dailyLimit) {
      return { success: false, message: '今日次数已达上限' };
    }
    
    // 更新骰子状态
    setDiceState(prev => ({
      ...prev,
      todayCount: prev.todayCount + 1,
      isSpinning: true
    }));
    
    // 模拟骰子结果
    setTimeout(() => {
      setDiceState(prev => ({
        ...prev,
        isSpinning: false
      }));
    }, 2000);
    
    return { success: true };
  };
  
  // 更新骰子状态
  const onUpdateDiceState = (updates: Partial<DiceState>) => {
    setDiceState(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  // 添加浮动奖励
  const onAddFloatingReward = (text: string, color: string) => {
    // 这里可以添加奖励提示逻辑
    console.log(`Floating reward: ${text} with color ${color}`);
  };
  
  const isNeomorphicDark = theme === 'neomorphic-dark';
  const neomorphicStyles = getNeomorphicStyles(isNeomorphicDark);

  // 生成按钮样式的辅助函数
  const getButtonStyleLocal = (isActive: boolean, isSpecial?: boolean) => {
    return getButtonStyle(isActive, isSpecial, isNeomorphic, theme, isDark);
  };
  
  const bgClass = isNeomorphic 
      ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]') 
      : isDark 
      ? 'bg-zinc-950' 
      : 'bg-slate-50';
  
  const cardBg = getCardBgStyle(isNeomorphic, theme, isDark);
  
  const textMain = getTextStyle(isDark, isNeomorphic, 'main');
  
  const textSub = getTextStyle(isDark, isNeomorphic, 'sub');

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`w-full h-full ${bgClass} overflow-auto`} ref={containerRef}>
      {/* 作战中心主界面 */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className={`text-xl font-bold ${textMain}`}>作战中心</h2>
            <GlobalHelpButton helpId="mission-control" onHelpClick={onHelpClick} size={16} variant="ghost" />
          </div>
        </div>
        
        {/* 核心功能区域 */}
        <div className={`${cardBg} p-6 rounded-3xl shadow-lg`}>
          <h3 className={`text-2xl font-bold ${textMain} mb-4`}>欢迎来到作战中心</h3>
          
          {/* 命运骰子功能 */}
          <div className="mb-8 px-2">
            <FateDice 
              theme={theme}
              diceState={diceState}
              onSpinDice={onSpinDice}
              onUpdateDiceState={onUpdateDiceState}
              onAddFloatingReward={onAddFloatingReward}
            />
          </div>
          
          {/* 项目和习惯数据概览 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
            <div className={`${isNeomorphic ? `${neomorphicStyles.bg} ${neomorphicStyles.border} ${neomorphicStyles.shadow} ${neomorphicStyles.hoverShadow} ${neomorphicStyles.transition}` : (isDark ? 'bg-zinc-800' : 'bg-white shadow-sm')} p-4 rounded-xl transition-all duration-300 hover:shadow-lg`}>
              <h4 className={`text-lg font-semibold ${textMain} mb-2`}>项目总数</h4>
              <p className={`text-4xl font-bold ${textMain}`}>{projects.length}</p>
            </div>
            <div className={`${isNeomorphic ? `${neomorphicStyles.bg} ${neomorphicStyles.border} ${neomorphicStyles.shadow} ${neomorphicStyles.hoverShadow} ${neomorphicStyles.transition}` : (isDark ? 'bg-zinc-800' : 'bg-white shadow-sm')} p-4 rounded-xl transition-all duration-300 hover:shadow-lg`}>
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