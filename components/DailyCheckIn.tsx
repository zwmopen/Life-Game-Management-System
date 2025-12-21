import React, { useState, useEffect } from 'react';
import { X, Gift, Check, Sparkles, Calendar, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Theme } from '../types';

interface DailyCheckInProps {
  theme: Theme;
  onClaim: (gold: number, xp: number) => void;
}

const REWARDS = [20, 30, 40, 50, 60, 80, 150]; // 7-day rewards

const DailyCheckIn: React.FC<DailyCheckInProps> = ({ theme, onClaim }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isOpening, setIsOpening] = useState(false);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);

  useEffect(() => {
    const lastCheckInStr = localStorage.getItem('aes-last-checkin-date');
    const streakStr = localStorage.getItem('aes-checkin-streak');
    const todayStr = new Date().toDateString();

    let currentStreak = parseInt(streakStr || '0');

    if (lastCheckInStr !== todayStr) {
        // Check if broken streak (missed yesterday)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastCheckInStr !== yesterday.toDateString() && lastCheckInStr !== null) {
            currentStreak = 0; // Reset if broken
        }
        setStreak(currentStreak);
        setIsOpen(true); // Open modal if not checked in today
    } else {
        setHasClaimedToday(true); // Already checked in
    }
  }, []);

  const handleCheckIn = () => {
      setIsOpening(true);
      // Play Chest Opening Sound
      new Audio("https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3").play().catch(()=>{});
      
      // Animation Delay
      setTimeout(() => {
          const todayGold = REWARDS[streak % 7];
          const todayXp = Math.floor(todayGold * 1.5); // XP is 1.5x Gold
          onClaim(todayGold, todayXp);
          
          // Update State
          const newStreak = streak + 1;
          setStreak(newStreak);
          setHasClaimedToday(true);
          
          // Persist
          localStorage.setItem('aes-last-checkin-date', new Date().toDateString());
          localStorage.setItem('aes-checkin-streak', newStreak.toString());

          // FX
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#d97706', '#3b82f6']
          });
          // Play Coin Sound
          new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3").play().catch(()=>{});

          // Close delay
          setTimeout(() => {
              setIsOpen(false);
          }, 2500);
      }, 1000);
  };

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200';
  const textMain = isDark ? 'text-white' : 'text-slate-900';

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className={`w-full max-w-lg p-8 rounded-3xl border shadow-2xl relative overflow-hidden flex flex-col items-center text-center ${cardBg}`}>
            
            {/* Close Button */}
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
            </button>

            {/* Header */}
            <div className="mb-8">
                <h2 className={`text-3xl font-black mb-2 flex items-center justify-center gap-2 ${textMain}`}>
                    <Calendar className="text-blue-500" /> 每日签到
                </h2>
                <p className="text-zinc-500 text-sm">保持连胜，获取丰厚物资补给。</p>
            </div>

            {/* Streak Grid */}
            <div className="grid grid-cols-7 gap-2 mb-10 w-full">
                {REWARDS.map((reward, index) => {
                    const dayNum = index + 1;
                    const isToday = index === (streak % 7);
                    const isPast = index < (streak % 7);
                    
                    return (
                        <div key={index} className={`flex flex-col items-center gap-2`}>
                            <div className={`
                                w-full aspect-square rounded-xl flex items-center justify-center border-2 text-xs font-bold transition-all
                                ${isToday 
                                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] scale-110' 
                                    : isPast 
                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                                        : (isDark ? 'border-zinc-800 bg-zinc-800 text-zinc-600' : 'border-slate-200 bg-slate-100 text-slate-400')
                                }
                            `}>
                                {isPast ? <Check size={14} strokeWidth={4}/> : `+${reward}`}
                            </div>
                            <span className="text-[10px] text-zinc-500 uppercase">Day {dayNum}</span>
                        </div>
                    );
                })}
            </div>

            {/* Chest Interaction */}
            <div className="relative group cursor-pointer" onClick={!hasClaimedToday ? handleCheckIn : undefined}>
                {isOpening || hasClaimedToday ? (
                    <div className="animate-in zoom-in duration-500 flex flex-col items-center">
                        <Gift size={80} className="text-emerald-500 mb-4 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
                        <div className="flex flex-col items-center gap-1">
                            <div className="text-2xl font-black text-yellow-500 animate-bounce">
                                +{REWARDS[streak % 7]} GOLD
                            </div>
                            <div className="text-lg font-black text-blue-500 animate-pulse flex items-center gap-1">
                                <Zap size={16} fill="currentColor"/> +{Math.floor(REWARDS[streak % 7] * 1.5)} XP
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`transition-transform duration-300 ${isOpening ? 'scale-110' : 'hover:scale-105 hover:rotate-2'}`}>
                        <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse"></div>
                        <Gift size={80} className="text-yellow-500 relative z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                            点击领取
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 text-xs text-zinc-500">
                {hasClaimedToday ? "明日奖励更丰厚，记得回来。" : "点击宝箱领取今日战备物资"}
            </div>

        </div>
    </div>
  );
};

export default DailyCheckIn;