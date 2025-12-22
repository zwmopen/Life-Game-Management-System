import React, { useState } from 'react';

// 为已解锁勋章添加流光溢彩效果的CSS
const styles = `
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.6);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}`;
import { 
  Trophy, Medal, Crown, Star, Wallet, Brain, Clock, Zap, Target, Crosshair, Skull, Flag, CheckCircle2, Lock, Flame, ShoppingBag, Gift,
  HelpCircle, Shield, Footprints, Calendar, Dumbbell, Sparkles, Layout, Award, User, Gem, Feather, Eye, Compass, Key, Anchor, Sword, Sun, Moon, Coins, Diamond, Landmark, Briefcase,
  BrainCircuit, Activity, TrendingUp, DollarSign, Building, Utensils, Ticket, Music, Headphones, Armchair, Scissors, Glasses, Sofa
} from 'lucide-react';
import { Theme, AchievementItem } from '../types';
import CharacterProfile, { CharacterProfileHandle, getAllLevels, getAllFocusTitles, getAllWealthTitles, getAllMilitaryRanks } from './CharacterProfile';

// 签到勋章配置
const CHECKIN_THRESHOLDS = [{min:3,title:'坚持不懈'},{min:7,title:'签到达人'},{min:15,title:'自律新星'},{min:30,title:'习惯养成'},{min:60,title:'岁月如歌'},{min:100,title:'时间的朋友'},{min:200,title:'持久王者'},{min:365,title:'永恒坚守'}];
const getAllCheckInTitles = () => CHECKIN_THRESHOLDS;

// 消费勋章配置
const CONSUMPTION_THRESHOLDS = [{min:100,title:'初次破费'},{min:500,title:'快乐剁手'},{min:1000,title:'品质生活'},{min:2000,title:'补给大亨'},{min:3500,title:'氪金战士'},{min:5000,title:'消费至尊'},{min:8000,title:'黑市常客'},{min:12000,title:'装备大师'},{min:18000,title:'挥金如土'},{min:25000,title:'经济支柱'},{min:40000,title:'商会主席'},{min:60000,title:'财阀雏形'},{min:90000,title:'资本巨头'},{min:150000,title:'市场主宰'},{min:250000,title:'富可敌国'},{min:500000,title:'金钱之神'},{min:1000000,title:'虚空财主'},{min:5000000,title:'无限消费'}];
const getAllConsumptionTitles = () => CONSUMPTION_THRESHOLDS;

interface HallOfFameProps {
  theme: Theme;
  balance: number;
  totalHours: number;
  totalCampaignsWon: number; // Kills
  achievements: AchievementItem[]; 
  setAchievements: (achievements: AchievementItem[]) => void;
  xp: number;
  checkInStreak: number;
  onPomodoroComplete: (m: number) => void;
  totalSpent: number;
  claimedBadges: string[];
  onClaimReward: (id: string, rewardXp: number, rewardGold: number) => void;
  isNavCollapsed: boolean;
  setIsNavCollapsed: (collapsed: boolean) => void;
  // Pomodoro Global State
  timeLeft: number;
  isActive: boolean;
  duration: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onChangeDuration: (minutes: number) => void;
  onUpdateTimeLeft: (seconds: number) => void;
  onUpdateIsActive: (active: boolean) => void;
}

const HallOfFame: React.FC<HallOfFameProps> = ({
    theme, balance, totalHours, totalCampaignsWon, achievements, xp, checkInStreak, totalSpent, claimedBadges, onClaimReward, onPomodoroComplete,
    isNavCollapsed, setIsNavCollapsed,
    // Pomodoro Global State
    timeLeft, isActive, duration, onToggleTimer, onResetTimer, onChangeDuration, onUpdateTimeLeft, onUpdateIsActive
}) => {
    const isDark = theme === 'dark';
    const isNeomorphic = theme === 'neomorphic';
    // 拟态风格卡片背景 - 符合设计规格的高饱和度灰蓝色底色，135度光源，增强阴影效果
    const cardBg = isNeomorphic 
        ? 'bg-[#e0e5ec] border-[#a3b1c6] rounded-[48px] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] transition-all duration-200 active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)]' 
        : isDark 
        ? 'bg-zinc-900 border-zinc-800' 
        : 'bg-white border-slate-200';
    const textMain = isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';
    const textSub = isDark ? 'text-zinc-500' : isNeomorphic ? 'text-zinc-600' : 'text-slate-500';

    const [category, setCategory] = useState<'ALL' | 'LEVEL' | 'FOCUS' | 'WEALTH' | 'COMBAT' | 'CHECKIN' | 'SPEND'>('ALL');

    // Helper for icons mapping to add variety
    const getLevelIcon = (idx: number) => [Zap, Star, Crown, Sparkles, Gem, Sun, Moon, Flame, Trophy, Medal, Award, Sparkles, Gift][idx % 12] || Zap;
    const getFocusIcon = (idx: number) => [Clock, Brain, Eye, Compass, Anchor, Key, Feather, BrainCircuit, Activity, TrendingUp, Eye, Compass][idx % 12] || Clock;
    const getWealthIcon = (idx: number) => [Wallet, Coins, Diamond, Landmark, Briefcase, Gem, Coins, DollarSign, Landmark, Building, Briefcase, Wallet][idx % 12] || Wallet;
    const getCombatIcon = (idx: number) => [Target, Sword, Shield, Skull, Crosshair, Flag, Sword, Shield, Crosshair, Target, Trophy, Award][idx % 12] || Target;
    const getCheckInIcon = (idx: number) => [Calendar, Footprints, Flame, CheckCircle2, Gift, Star, Crown, Trophy, Medal, Award, Sparkles, Gift][idx % 12] || Calendar;
    const getSpendIcon = (idx: number) => [ShoppingBag, Dumbbell, Utensils, Ticket, Music, Headphones, Armchair, Scissors, Glasses, Footprints, Utensils, Sofa][idx % 12] || ShoppingBag;

    const generateBadges = () => {
         const levelBadges = getAllLevels().map((l, idx) => ({ 
             id: `lvl-${l.val}`, title: l.title, subTitle: `LV.${l.val}`, 
             icon: getLevelIcon(idx), color: 'text-blue-500', 
             isUnlocked: xp >= l.min, req: `等级 ${l.val}`, progress: Math.min(100, (xp/l.min)*100), 
             rewardXp: 0, rewardGold: l.val * 10, category: 'LEVEL',
             bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/50'
         }));
         
         const focusBadges = getAllFocusTitles().map((r, idx) => ({ 
             id: `rank-${r.title}`, title: r.title, subTitle: `${r.min}H`, 
             icon: getFocusIcon(idx), color: ['text-blue-500', 'text-purple-500', 'text-pink-500', 'text-indigo-500', 'text-teal-500', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-cyan-500', 'text-lime-500', 'text-emerald-500', 'text-violet-500'][idx % 12], 
             isUnlocked: totalHours >= r.min, req: `专注 ${r.min}H`, progress: Math.min(100, (totalHours/r.min)*100), 
             rewardXp: r.min * 10, rewardGold: r.min * 5, category: 'FOCUS',
             bgColor: ['bg-blue-500/20', 'bg-purple-500/20', 'bg-pink-500/20', 'bg-indigo-500/20', 'bg-teal-500/20', 'bg-red-500/20', 'bg-orange-500/20', 'bg-yellow-500/20', 'bg-cyan-500/20', 'bg-lime-500/20', 'bg-emerald-500/20', 'bg-violet-500/20'][idx % 12], 
             borderColor: ['border-blue-500/50', 'border-purple-500/50', 'border-pink-500/50', 'border-indigo-500/50', 'border-teal-500/50', 'border-red-500/50', 'border-orange-500/50', 'border-yellow-500/50', 'border-cyan-500/50', 'border-lime-500/50', 'border-emerald-500/50', 'border-violet-500/50'][idx % 12]
         }));

         const wealthBadges = getAllWealthTitles().map((c, idx) => ({ 
             id: `class-${c.title}`, title: c.title, subTitle: `${c.min}G`, 
             icon: getWealthIcon(idx), color: ['text-green-500', 'text-blue-500', 'text-purple-500', 'text-pink-500', 'text-indigo-500', 'text-teal-500', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-cyan-500', 'text-lime-500', 'text-emerald-500'][idx % 12], 
             isUnlocked: balance >= c.min, req: `持有 ${c.min}G`, progress: Math.min(100, (balance/c.min)*100), 
             rewardXp: Math.floor(c.min * 0.1), rewardGold: 0, category: 'WEALTH',
             bgColor: ['bg-green-500/20', 'bg-blue-500/20', 'bg-purple-500/20', 'bg-pink-500/20', 'bg-indigo-500/20', 'bg-teal-500/20', 'bg-red-500/20', 'bg-orange-500/20', 'bg-yellow-500/20', 'bg-cyan-500/20', 'bg-lime-500/20', 'bg-emerald-500/20'][idx % 12], 
             borderColor: ['border-green-500/50', 'border-blue-500/50', 'border-purple-500/50', 'border-pink-500/50', 'border-indigo-500/50', 'border-teal-500/50', 'border-red-500/50', 'border-orange-500/50', 'border-yellow-500/50', 'border-cyan-500/50', 'border-lime-500/50', 'border-emerald-500/50'][idx % 12]
         }));

         const combatBadges = getAllMilitaryRanks().map((r, idx) => ({ 
             id: `combat-${r.title}`, title: r.title, subTitle: `${r.min} KILLS`, 
             icon: getCombatIcon(idx), color: 'text-red-500', 
             isUnlocked: totalCampaignsWon >= r.min, req: `完成 ${r.min} 任务`, progress: Math.min(100, (totalCampaignsWon/r.min)*100), 
             rewardXp: r.min * 20, rewardGold: r.min * 10, category: 'COMBAT',
             bgColor: 'bg-red-500/20', borderColor: 'border-red-500/50'
         }));

         const checkInBadges = getAllCheckInTitles().map((c, idx) => ({ 
             id: `check-${c.title}`, title: c.title, subTitle: `${c.min} DAYS`, 
             icon: getCheckInIcon(idx), color: ['text-purple-500', 'text-blue-500', 'text-green-500', 'text-pink-500', 'text-indigo-500', 'text-teal-500', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-cyan-500', 'text-lime-500', 'text-emerald-500'][idx % 12], 
             isUnlocked: checkInStreak >= c.min, req: `连签 ${c.min} 天`, progress: Math.min(100, (checkInStreak/c.min)*100), 
             rewardXp: c.min * 30, rewardGold: c.min * 20, category: 'CHECKIN',
             bgColor: ['bg-purple-500/20', 'bg-blue-500/20', 'bg-green-500/20', 'bg-pink-500/20', 'bg-indigo-500/20', 'bg-teal-500/20', 'bg-red-500/20', 'bg-orange-500/20', 'bg-yellow-500/20', 'bg-cyan-500/20', 'bg-lime-500/20', 'bg-emerald-500/20'][idx % 12], 
             borderColor: ['border-purple-500/50', 'border-blue-500/50', 'border-green-500/50', 'border-pink-500/50', 'border-indigo-500/50', 'border-teal-500/50', 'border-red-500/50', 'border-orange-500/50', 'border-yellow-500/50', 'border-cyan-500/50', 'border-lime-500/50', 'border-emerald-500/50'][idx % 12]
         }));

         const spendBadges = getAllConsumptionTitles().map((c, idx) => ({ 
             id: `consume-${c.title}`, title: c.title, subTitle: `${c.min}G`, 
             icon: getSpendIcon(idx), color: ['text-purple-500', 'text-blue-500', 'text-green-500', 'text-pink-500', 'text-indigo-500', 'text-teal-500', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-cyan-500', 'text-lime-500', 'text-emerald-500'][idx % 12], 
             isUnlocked: totalSpent >= c.min, req: `消费 ${c.min}G`, progress: Math.min(100, (totalSpent/c.min)*100), 
             rewardXp: 0, rewardGold: Math.floor(c.min * 0.1), category: 'SPEND',
             bgColor: ['bg-purple-500/20', 'bg-blue-500/20', 'bg-green-500/20', 'bg-pink-500/20', 'bg-indigo-500/20', 'bg-teal-500/20', 'bg-red-500/20', 'bg-orange-500/20', 'bg-yellow-500/20', 'bg-cyan-500/20', 'bg-lime-500/20', 'bg-emerald-500/20'][idx % 12], 
             borderColor: ['border-purple-500/50', 'border-blue-500/50', 'border-green-500/50', 'border-pink-500/50', 'border-indigo-500/50', 'border-teal-500/50', 'border-red-500/50', 'border-orange-500/50', 'border-yellow-500/50', 'border-cyan-500/50', 'border-lime-500/50', 'border-emerald-500/50'][idx % 12]
         }));

         return [...levelBadges, ...focusBadges, ...wealthBadges, ...combatBadges, ...checkInBadges, ...spendBadges];
    };

    const allBadges = generateBadges();
    const filteredBadges = category === 'ALL' ? allBadges : allBadges.filter(b => b.category === category);

    // Latest 6 claimed/unlocked badges
    const latestBadges = allBadges.filter(b => b.isUnlocked).reverse().slice(0, 6);
    const unlockedCount = allBadges.filter(b => b.isUnlocked).length;
    const totalCount = allBadges.length;

    // Dummy ref for character profile
    const charProfileRef = React.useRef<CharacterProfileHandle>(null);

    return (
        <div className={`h-full flex flex-col overflow-hidden ${isDark ? 'bg-zinc-950' : 'bg-slate-50'}`}>
            {/* Add CSS for animations */}
            <style>{styles}</style>
            
            {/* Top Character Profile */}
            <div className="shrink-0 relative z-20">
                <CharacterProfile 
                    ref={charProfileRef}
                    theme={theme}
                    xp={xp}
                    balance={balance}
                    totalHours={totalHours}
                    totalKills={totalCampaignsWon}
                    checkInStreak={checkInStreak}
                    onPomodoroComplete={onPomodoroComplete}
                    // Pomodoro Global State
                    timeLeft={timeLeft}
                    isActive={isActive}
                    duration={duration}
                    onToggleTimer={onToggleTimer}
                    onResetTimer={onResetTimer}
                    onChangeDuration={onChangeDuration}
                    onUpdateTimeLeft={onUpdateTimeLeft}
                    onUpdateIsActive={onUpdateIsActive}
                    // Immersive Mode Callback
                    onImmersiveModeChange={(isImmersive) => {
                        if (isImmersive) {
                            setIsNavCollapsed(true);
                        }
                    }}
                />
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                
                {/* Header Section */}
                <div className="p-6 pb-2">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h1 className={`text-3xl font-black flex items-center gap-3 ${textMain}`}>
                                <Trophy size={32} className="text-yellow-500"/>
                                荣誉殿堂
                            </h1>
                        </div>
                        <div className={`px-4 py-3 rounded-lg border flex flex-col items-end transition-all duration-300 ${cardBg} hover:shadow-lg`}>
                            <div className="text-[10px] text-zinc-500 uppercase font-bold">成就收集率</div>
                            <div className="text-2xl font-black text-yellow-500">{Math.round((unlockedCount/totalCount)*100)}%</div>
                            <div className="text-[10px] text-zinc-500">{unlockedCount}/{totalCount} 已解锁</div>
                        </div>
                    </div>

                    {/* Latest Honors Section */}
                    {latestBadges.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xs font-bold uppercase text-zinc-500 mb-3 flex items-center gap-2"><Award size={14} className="text-yellow-500"/> 最新战勋</h3>
                            <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                                {latestBadges.map((badge: any) => (
                                    <div key={`latest-${badge.id}`} className={`shrink-0 w-28 p-3 rounded-full border flex flex-col items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-500 transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-zinc-900 to-zinc-800' : isNeomorphic ? `bg-[#e0e5ec] ${badge.borderColor} shadow-[12px_12px_24px_rgba(163,177,198,0.6),-12px_-12px_24px_rgba(255,255,255,1)] hover:shadow-[16px_16px_32px_rgba(163,177,198,0.7),-16px_-16px_32px_rgba(255,255,255,1)]` : `bg-white ${badge.bgColor} ${badge.borderColor} ${isDark ? 'shadow-black/50' : 'shadow-blue-100'}`}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badge.isUnlocked ? (isNeomorphic ? `bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]` : badge.bgColor) : 'bg-zinc-900/30'}`}>
                                            <badge.icon size={20} className={badge.color} strokeWidth={2}/>
                                        </div>
                                        <div className={`text-[10px] font-bold text-center truncate w-full ${textMain}`}>{badge.title}</div>
                                        <div className={`text-[8px] font-mono ${textSub}`}>{badge.subTitle}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {[{id:'ALL', l:'全部', i: Layout}, {id:'LEVEL', l:'等级', i:Zap}, {id:'FOCUS', l:'专注', i:Clock}, {id:'WEALTH', l:'财富', i:Wallet}, {id:'COMBAT', l:'战斗', i:Target}, {id:'CHECKIN', l:'签到', i:Calendar}, {id:'SPEND', l:'消费', i:ShoppingBag}].map(tab => (
                            <button 
                                key={tab.id} 
                                onClick={() => setCategory(tab.id as any)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold border flex items-center gap-2 whitespace-nowrap transition-all ${category === tab.id ? (isDark ? 'bg-zinc-800 text-white border-zinc-700' : isNeomorphic ? 'bg-blue-500 text-white border-blue-500 shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-blue-500 text-white border-blue-600') : (isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] border-[#a3b1c6] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)] text-zinc-700' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-200')}`}
                            >
                                <tab.i size={14} /> {tab.l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Badges Grid */}
                <div className="p-6 pt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pb-20">
                        {filteredBadges.map(badge => {
                            // Enhanced neomorphic styles for badges
                            const getBadgeClass = () => {
                                if (badge.isUnlocked) {
                                    if (isDark) {
                                        return `bg-gradient-to-br from-zinc-900 to-zinc-800 ${badge.borderColor} shadow-lg animate-pulse-glow`;
                                    } else if (isNeomorphic) {
                                        return `bg-[#e0e5ec] border-[#a3b1c6] shadow-[12px_12px_24px_rgba(163,177,198,0.6),-12px_-12px_24px_rgba(255,255,255,1)] hover:shadow-[16px_16px_32px_rgba(163,177,198,0.7),-16px_-16px_32px_rgba(255,255,255,1)] active:shadow-[inset_10px_10px_20px_rgba(163,177,198,0.6),inset_-10px_-10px_20px_rgba(255,255,255,1)] animate-pulse-glow transition-all duration-300`;
                                    } else {
                                        return `bg-white ${badge.bgColor} ${badge.borderColor} shadow-lg animate-pulse-glow`;
                                    }
                                } else {
                                    if (isDark) {
                                        return `bg-gradient-to-br from-zinc-950 to-zinc-900 ${badge.borderColor} opacity-70`;
                                    } else if (isNeomorphic) {
                                        return `bg-[#e0e5ec] border-[#a3b1c6] shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] opacity-70 transition-all duration-300`;
                                    } else {
                                        return `bg-slate-100 ${badge.borderColor} opacity-70`;
                                    }
                                }
                            };
                            
                            return (
                                <div key={badge.id} className={`shrink-0 w-28 p-3 rounded-full border flex flex-col items-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.05] ${getBadgeClass()}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badge.isUnlocked ? (isNeomorphic ? `bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]` : badge.bgColor) : 'bg-zinc-900/30'}`}>
                                        <badge.icon size={20} className={badge.isUnlocked ? badge.color : `${badge.color} opacity-70`} strokeWidth={2}/>
                                    </div>
                                    <div className={`text-[10px] font-bold text-center truncate w-full ${badge.isUnlocked ? textMain : 'text-zinc-500'}`}>{badge.title}</div>
                                    <div className={`text-[8px] font-mono ${badge.isUnlocked ? textSub : 'text-zinc-600'}`}>{badge.subTitle}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HallOfFame;