import React from 'react';
import { Theme } from '../../types';
import { Crosshair, Coins, Target, HelpCircle } from 'lucide-react';

interface MilitaryModuleProps {
  theme: Theme;
  balance: number;
  totalKills?: number;
  isEditingBalance: boolean;
  isEditingKills: boolean;
  tempBalance: string;
  tempKills: string;
  setIsEditingBalance: (editing: boolean) => void;
  setIsEditingKills: (editing: boolean) => void;
  setTempBalance: (balance: string) => void;
  setTempKills: (kills: string) => void;
  handleSaveBalance: () => void;
  handleSaveKills: () => void;
  onHelpClick?: (helpId: string) => void;
}

const MilitaryModule: React.FC<MilitaryModuleProps> = ({
  theme,
  balance,
  totalKills = 0,
  isEditingBalance,
  isEditingKills,
  tempBalance,
  tempKills,
  setIsEditingBalance,
  setIsEditingKills,
  setTempBalance,
  setTempKills,
  handleSaveBalance,
  handleSaveKills,
  onHelpClick
}) => {
  const isDark = theme === 'dark';
  const isNeomorphic = theme === 'neomorphic';
  const cardBg = isNeomorphic
    ? 'bg-[#e0e5ec] border-[#a3b1c6] rounded-lg shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] transition-all duration-300'
    : isDark
    ? 'bg-zinc-900 border-zinc-800'
    : 'bg-white border-slate-200';

  return (
    <div className="flex flex-row items-center justify-between gap-2 w-full">
      {/* 战略统计标题和帮助按钮 */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
          <Crosshair size={12}/> 战略统计
        </span>
        {/* 帮助按钮 */}
        {onHelpClick && (
          <div className={`p-0.5 rounded-full transition-all duration-300 hover:scale-[1.1] ${isNeomorphic ? 'hover:bg-blue-500/10' : 'hover:bg-blue-500/20'}`} title="查看军工模块指南">
            <button onClick={() => onHelpClick('military')} className="transition-colors">
              <HelpCircle size={16} className="text-zinc-500 hover:text-white transition-colors" />
            </button>
          </div>
        )}
      </div>
      
      {/* 右侧空白区域 */}
      <div className="flex-1"></div>
      
      {/* 储备金信息 */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Coins size={12} className="text-yellow-500"/>
        <span className="text-zinc-500">储备金</span>
        {isEditingBalance ? (
          <input 
            autoFocus 
            type="number" 
            className={`text-xs font-mono font-bold text-center bg-transparent border-b outline-none w-10 ${isDark ? 'text-yellow-400 border-yellow-600' : 'text-yellow-600 border-yellow-400'}`} 
            value={tempBalance} 
            onChange={(e) => setTempBalance(e.target.value)} 
            onBlur={handleSaveBalance} 
            onKeyDown={(e) => e.key === 'Enter' && handleSaveBalance()}
          />
        ) : (
          <span 
            className={`text-xs font-mono font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'} cursor-pointer`}
            onDoubleClick={() => setIsEditingBalance(true)}
          >
            {balance}
          </span>
        )}
      </div>
      
      {/* 歼敌数信息 */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Target size={12} className="text-red-500"/>
        <span className="text-zinc-500">歼敌数</span>
        {isEditingKills ? (
          <input 
            autoFocus 
            type="number" 
            className={`text-xs font-mono font-bold text-center bg-transparent border-b outline-none w-10 ${isDark ? 'text-red-400 border-red-600' : 'text-red-600 border-red-400'}`} 
            value={tempKills} 
            onChange={(e) => setTempKills(e.target.value)} 
            onBlur={handleSaveKills} 
            onKeyDown={(e) => e.key === 'Enter' && handleSaveKills()}
          />
        ) : (
          <span 
            className={`text-xs font-mono font-bold ${isDark ? 'text-red-400' : 'text-red-600'} cursor-pointer`}
            onDoubleClick={() => setIsEditingKills(true)}
          >
            {totalKills}
          </span>
        )}
      </div>
    </div>
  );
};

export default MilitaryModule;