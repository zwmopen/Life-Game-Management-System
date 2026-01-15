import React from 'react';
import { Bell } from 'lucide-react';

interface ReminderPopupProps {
  activeReminder: { title: string; id: string; type: 'habit' | 'project' } | null;
  onClose: () => void;
  onStart: () => void;
  isNeomorphic: boolean;
  theme: string;
  isDark: boolean;
  textMain: string;
  textSub: string;
}

const ReminderPopup: React.FC<ReminderPopupProps> = ({
  activeReminder,
  onClose,
  onStart,
  isNeomorphic,
  theme,
  isDark,
  textMain,
  textSub
}) => {
  if (!activeReminder) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
      <div className={`w-full max-w-sm p-8 rounded-3xl border-2 border-blue-500/30 flex flex-col items-center text-center space-y-6 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[20px_20px_40px_rgba(0,0,0,0.6),-20px_-20px_40px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[20px_20px_40px_rgba(163,177,198,0.8),-20px_-20px_40px_rgba(255,255,255,1)]') : (isDark ? 'bg-zinc-900 shadow-2xl' : 'bg-white shadow-2xl')}`}>
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center animate-bounce">
          <Bell size={40} className="text-blue-500" />
        </div>
        <div>
          <h3 className={`text-2xl font-black mb-2 ${textMain}`}>时间到了！</h3>
          <p className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{activeReminder.title}</p>
          <p className={`text-xs mt-4 ${textSub}`}>这是你设定的部署提醒，请立即开始行动！</p>
        </div>
        <div className="flex gap-3 w-full">
          <button 
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] text-zinc-400' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] text-zinc-600') : 'bg-zinc-800 text-zinc-400'}`}
          >
            知道了
          </button>
          <button 
            onClick={onStart}
            className={`flex-[2] py-3 rounded-xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-all`}
          >
            立即开始
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderPopup;
