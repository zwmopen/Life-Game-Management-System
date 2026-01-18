import React from 'react';
import { Zap, Crosshair, Activity, ChevronRight } from 'lucide-react';

interface MorningProtocolModalProps {
  show: boolean;
  step: number;
  setStep: (step: number) => void;
  readiness: number;
  setReadiness: (readiness: number) => void;
  protocolFocus: string;
  setProtocolFocus: (focus: string) => void;
  onComplete: () => void;
}

const MorningProtocolModal: React.FC<MorningProtocolModalProps> = ({
  show,
  step,
  setStep,
  readiness,
  setReadiness,
  protocolFocus,
  setProtocolFocus,
  onComplete
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="max-w-lg w-full bg-zinc-900 border border-emerald-900/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
        {step === 0 && (
          <div className="space-y-6 animate-in slide-in-from-right-8">
            <div className="flex items-center gap-3 mb-4"><Zap size={32} className="text-emerald-500"/><h2 className="text-2xl font-black text-white">机能自检 (BIO-SCAN)</h2></div>
            <p className="text-zinc-400 text-sm">评估你的睡眠质量与当前能量水平。诚实的数据是进化的基础。</p>
            <div className="space-y-4 pt-4">
              <div className="flex justify-between text-xs font-bold text-emerald-400 uppercase">
                <span>低能耗 (Low)</span>
                <span>{readiness}%</span>
                <span>巅峰 (Peak)</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={readiness} 
                onChange={(e) => setReadiness(parseInt(e.target.value))} 
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
            <button 
              onClick={() => setStep(1)} 
              className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl mt-4 flex items-center justify-center gap-2 transition-all"
            >
              确认机能状态 <ChevronRight size={16}/>
            </button>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-8">
            <div className="flex items-center gap-3 mb-4"><Crosshair size={32} className="text-red-500"/><h2 className="text-2xl font-black text-white">战术聚焦 (LASER FOCUS)</h2></div>
            <p className="text-zinc-400 text-sm">如果今天只能完成一件事，那会是什么？这定义了你今天的成败。</p>
            <input 
              autoFocus 
              value={protocolFocus} 
              onChange={e => setProtocolFocus(e.target.value)} 
              placeholder="输入今日绝对核心任务..." 
              className="w-full bg-zinc-950 border border-zinc-700 p-4 rounded-xl text-lg font-bold text-white outline-none focus:border-red-500 transition-colors" 
              onKeyDown={e => e.key === 'Enter' && setStep(2)}
            />
            <button 
              onClick={() => setStep(2)} 
              disabled={!protocolFocus.trim()} 
              className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-bold rounded-xl mt-4 flex items-center justify-center gap-2 transition-all"
            >
              锁定目标 <ChevronRight size={16}/>
            </button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-8 text-center">
            <div className="flex flex-col items-center gap-4 mb-4">
              <Activity size={64} className="text-blue-500 animate-pulse"/>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest">身份确认</h2>
            </div>
            <div className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-800 italic text-zinc-300">
              "我不仅仅是这副躯壳。我是我的选择，我是我的行动。今天，我拒绝熵增，我选择主动进化。"
            </div>
            <button 
              onClick={onComplete} 
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-lg rounded-xl shadow-lg shadow-blue-900/50 transform transition-all active:scale-95"
            >
              启动系统 (INITIATE)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MorningProtocolModal;
