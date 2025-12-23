import React from 'react';
import { Theme } from '../../types';
import { List, Edit3 } from 'lucide-react';

interface MantraModuleProps {
  theme: Theme;
  mantras: string[];
  currentMantraIndex: number;
  cycleMantra: () => void;
  setIsMantraModalOpen: (open: boolean) => void;
}

const MantraModule: React.FC<MantraModuleProps> = ({
  theme,
  mantras,
  currentMantraIndex,
  cycleMantra,
  setIsMantraModalOpen
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
      {/* 锦囊库模块标题和内容 */}
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        <button 
          onClick={() => setIsMantraModalOpen(true)} 
          className="flex items-center gap-1 flex-shrink-0 transition-colors hover:text-blue-400"
          title="管理锦囊库"
        >
          <span className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
            <List size={12} className="text-purple-500"/>
            锦囊库
          </span>
        </button>
        <div 
          className={`text-xs font-bold text-left cursor-pointer select-none hover:text-blue-400 transition-colors truncate relative group ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}
          onClick={cycleMantra}
        >
          "{mantras[currentMantraIndex]}"
        </div>
      </div>
    </div>
  );
};

export default MantraModule;