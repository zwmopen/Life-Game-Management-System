import React from 'react';
import { Smile, Star } from 'lucide-react';
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
}

const AvatarProfile: React.FC<AvatarProfileProps> = ({
  theme,
  xp,
  totalHours,
  balance,
  levelInfo,
  focusInfo,
  wealthInfo
}) => {
  const isDark = theme === 'dark';
  const isNeomorphic = theme === 'neomorphic';
  const cardBg = isNeomorphic
    ? 'bg-[#e0e5ec] border-[#a3b1c6] rounded-[48px] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] transition-all duration-300'
    : isDark
    ? 'bg-zinc-900 border-zinc-800'
    : 'bg-white border-slate-200';
  const textMain = isDark ? 'text-zinc-100' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* 角色标题 */}
      <div className="flex items-center justify-start">
        <div className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
          <Star size={12}/> 角色系统
        </div>
      </div>
      
      {/* 头像和统计信息 */}
      <div className="flex items-center gap-3">
        {/* Avatar (SMILE) */}
        <div className="shrink-0">
          <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center relative overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${isNeomorphic ? 'bg-[#e0e5ec] border-[#a3b1c6] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-750' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}>
            <Smile size={36} className={`text-yellow-500 animate-[pulse_3s_infinite]`} strokeWidth={2}/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-1 gap-1.5">
          <div className="flex items-center gap-1 text-xs">
                <div className="w-8 font-bold text-right text-blue-500 shrink-0">经验</div>
                <div className={`w-16 h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-700' : isNeomorphic ? 'bg-[#d0d5dc]' : 'bg-zinc-200'} shadow-inner`}>
                  <div className="h-full bg-blue-500 transition-all duration-300 rounded-full" style={{ width: `${levelInfo.progress}%` }}></div>
                </div>
                <div className={`flex items-center gap-1 truncate ${textMain} max-w-[100px]`}><span className="font-mono text-blue-500 font-bold">LV.{levelInfo.level}</span><span className="text-xs truncate">{levelInfo.title}</span></div>
              </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-8 font-bold text-right text-emerald-500 shrink-0">专注</div>
            <div className="w-16 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-emerald-500 transition-all duration-300 rounded-full" style={{ width: `${focusInfo.progress}%` }}></div></div>
            <div className={`flex items-center gap-1 truncate ${textMain} max-w-[100px]`}><span className="font-mono text-emerald-400 font-bold">LV.{focusInfo.level}</span><span className="text-xs truncate">{focusInfo.title}</span></div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-8 font-bold text-right text-yellow-500 shrink-0">财富</div>
            <div className="w-16 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-yellow-500 transition-all duration-300 rounded-full" style={{ width: `${wealthInfo.progress}%` }}></div></div>
            <div className={`flex items-center gap-1 truncate ${textMain} max-w-[100px]`}><span className="font-mono text-yellow-400 font-bold">LV.{wealthInfo.level}</span><span className="text-xs truncate">{wealthInfo.title}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarProfile;
