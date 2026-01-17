import React from 'react';
import { XCircle, Wallet } from 'lucide-react';

interface BankModalProps {
  show: boolean;
  onClose: () => void;
  bankAccount: {
    balance: number;
    totalInterestEarned: number;
    lastInterestDate: string;
  };
  onWithdrawAll: () => void;
  isDark: boolean;
  isNeomorphic: boolean;
  theme: string;
  textMain: string;
  textSub: string;
}

const BankModal: React.FC<BankModalProps> = ({
  show,
  onClose,
  bankAccount,
  onWithdrawAll,
  isDark,
  isNeomorphic,
  theme,
  textMain,
  textSub
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className={`max-w-lg w-full bg-zinc-900 border border-green-900/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-yellow-500"></div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Wallet className="text-green-500" size={32} />
            虚拟银行账户
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <XCircle size={24} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-xl border ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-[#1e1e2e] shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] border-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]') : (isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200')}`}>
              <div className={`text-sm uppercase font-bold mb-2 ${textSub}`}>当前存款</div>
              <div className="text-4xl font-black text-yellow-500">{bankAccount.balance} G</div>
              <div className={`text-xs mt-1 ${textSub}`}>每天获得 1% 利息</div>
            </div>
            <div className={`p-6 rounded-xl border ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-[#1e1e2e] shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] border-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]') : (isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200')}`}>
              <div className={`text-sm uppercase font-bold mb-2 ${textSub}`}>总获利息</div>
              <div className="text-4xl font-black text-green-500">{bankAccount.totalInterestEarned} G</div>
              <div className={`text-xs mt-1 ${textSub}`}>累计获得的利息</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-zinc-500">上次利息发放日期</div>
              <div className="text-sm font-mono text-zinc-300">{bankAccount.lastInterestDate}</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-zinc-500">今日预计利息</div>
              <div className="text-sm font-mono text-green-500">{Math.floor(bankAccount.balance * 0.01)} G</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={onWithdrawAll}
              className={`w-full py-4 rounded-lg transition-colors ${isNeomorphic ? 
                (bankAccount.balance > 0 ? 
                  theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] text-green-400 shadow-[inset_5px_5px_10px_rgba(0,0,0,0.4),inset_-5px_-5px_10px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] text-green-700 shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]'
                : 
                  isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-200 text-slate-500'
                ) : 
                (bankAccount.balance <= 0 ? 
                  isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-200 text-slate-500'
                : 
                  isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-800/50' : 'bg-green-100 text-green-700 hover:bg-green-200'
                )
              }`} 
              disabled={bankAccount.balance <= 0}
            >
              取出全部存款
            </button>
            <button 
              onClick={onClose}
              className={`w-full py-4 rounded-lg transition-colors ${isNeomorphic ? 
                theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] text-zinc-200 shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] text-zinc-700 shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'
              : 
                isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankModal;
