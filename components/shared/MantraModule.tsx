import React from 'react';
import { Theme } from '../../types';
import { List, Edit3 } from 'lucide-react';
import { GlobalHelpButton } from '../HelpSystem';

interface MantraModuleProps {
  theme: Theme;
  mantras: string[];
  currentMantraIndex: number;
  cycleMantra: () => void;
  setIsMantraModalOpen: (open: boolean) => void;
  onHelpClick?: (helpId: string) => void;
}

const MantraModule: React.FC<MantraModuleProps> = ({
  theme,
  mantras,
  currentMantraIndex,
  cycleMantra,
  setIsMantraModalOpen,
  onHelpClick
}) => {
  const isDark = theme === 'dark' || theme === 'neomorphic-dark';
  const isNeomorphic = theme.startsWith('neomorphic');
  const cardBg = isNeomorphic
    ? (theme === 'neomorphic-dark'
      ? 'bg-[#1e1e2e] border-[#1e1e2e] rounded-lg shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)] transition-all duration-300'
      : 'bg-[#e0e5ec] border-[#e0e5ec] rounded-lg shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] transition-all duration-300')
    : isDark
    ? 'bg-zinc-900 border-zinc-800'
    : 'bg-white border-slate-200';

  return (
    <div className="flex flex-row items-center justify-between gap-2 w-full">
      {/* 锦囊库模块标题和内容 */}
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        <button 
          onClick={() => setIsMantraModalOpen(true)} 
          className="flex items-center gap-1 flex-shrink-0 transition-colors hover:text-blue-400"
          title="管理锦囊"
        >
          <span className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
            <List size={12} className="text-purple-500"/>
            锦囊
          </span>
        </button>
        <div 
          className={`text-xs font-bold text-left cursor-pointer select-none hover:text-blue-400 transition-colors truncate relative group ${theme === 'neomorphic-dark' ? 'text-zinc-300' : isNeomorphic ? 'text-zinc-700' : isDark ? 'text-zinc-300' : 'text-slate-700'}`}
          onClick={cycleMantra}
        >
          "{mantras[currentMantraIndex]}"
        </div>
      </div>
      
      {/* 帮助按钮 */}
      {onHelpClick && (
        <GlobalHelpButton 
          helpId="mantra" 
          onHelpClick={onHelpClick} 
          size={14} 
          className="hover:scale-[1.1]" 
        />
      )}
    </div>
  );
};

export default MantraModule;