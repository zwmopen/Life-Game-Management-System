import React, { useState, useEffect } from 'react';

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
  Shield, Footprints, Calendar, Dumbbell, Sparkles, Layout, Award, User, Gem, Feather, Eye, Compass, Key, Anchor, Sword, Sun, Moon, Coins, Diamond, Landmark, Briefcase,
  BrainCircuit, Activity, TrendingUp, DollarSign, Building, Utensils, Ticket, Music, Headphones, Armchair, Scissors, Glasses, Sofa, Edit3,
  XCircle, Trash2, Plus, Grid3X3, List, RotateCw
} from 'lucide-react';


import { Theme, AchievementItem } from '../types';
import CharacterProfile, { CharacterProfileHandle, getAllLevels, getAllFocusTitles, getAllWealthTitles, getAllMilitaryRanks } from './CharacterProfile';
import { GlobalGuideCard, helpContent, GlobalHelpButton } from './HelpSystem';
import { getNeomorphicStyles, getButtonStyle, getCardBgStyle, getTextStyle } from '../utils/styleHelpers';
import BadgeManagementModal from './HallOfFame/BadgeManagementModal';

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
    // 帮助卡片系统
    onHelpClick: (helpId: string) => void;
    // 模态框状态管理
    setModalState?: (isOpen: boolean) => void;
}

const HallOfFame: React.FC<HallOfFameProps> = ({
    theme, balance, totalHours, totalCampaignsWon, achievements, xp, checkInStreak, totalSpent, claimedBadges, onClaimReward, onPomodoroComplete,
    isNavCollapsed, setIsNavCollapsed,
    // Pomodoro Global State
    timeLeft, isActive, duration, onToggleTimer, onResetTimer, onChangeDuration, onUpdateTimeLeft, onUpdateIsActive,
    // Help System
    onHelpClick,
    // Modal State Management
    setModalState
}) => {
    const isDark = theme.includes('dark');
    const isNeomorphic = theme.startsWith('neomorphic');
    // 拟态风格样式变量，区分浅色和深色
    const isNeomorphicDark = theme === 'neomorphic-dark';
    const neomorphicStyles = getNeomorphicStyles(isNeomorphicDark);
    
    // 全局背景样式 - 确保在所有主题下都正确显示
    const globalBg = isDark 
        ? (isNeomorphic ? 'bg-[#1e1e2e]' : 'bg-zinc-950') 
        : (isNeomorphic ? 'bg-[#e0e5ec]' : 'bg-slate-50');
    
    // 生成按钮样式的辅助函数 - 与商品分类与管理按钮样式完全一致
    const getButtonStyleLocal = (isActive: boolean, isSpecial?: boolean) => {
        return getButtonStyle(isActive, isSpecial, isNeomorphic, theme, isDark);
    };
    
    // 拟态风格卡片背景 - 区分浅色和深色拟态主题
    const cardBg = getCardBgStyle(isNeomorphic, theme, isDark);
    const textMain = getTextStyle(isDark, isNeomorphic, 'main');
    const textSub = getTextStyle(isDark, isNeomorphic, 'sub');
    
    const [category, setCategory] = useState<'ALL' | 'LEVEL' | 'FOCUS' | 'WEALTH' | 'COMBAT' | 'CHECKIN' | 'SPEND'>('ALL');
    // 管理功能状态
    const [showManageModal, setShowManageModal] = useState(false);

    // 强制刷新状态，用于更新勋章列表
    const [forceRefresh, setForceRefresh] = useState(false);
    const [activeHelp, setActiveHelp] = useState<string | null>(null);
        
    // Helper for icons mapping to add variety
    const getLevelIcon = (idx: number) => [Zap, Star, Crown, Sparkles, Gem, Sun, Moon, Flame, Trophy, Medal, Award, Sparkles, Gift][idx % 12] || Zap;
    const getFocusIcon = (idx: number) => [Clock, Brain, Eye, Compass, Anchor, Key, Feather, BrainCircuit, Activity, TrendingUp, Eye, Compass][idx % 12] || Clock;
    const getWealthIcon = (idx: number) => [Wallet, Coins, Diamond, Landmark, Briefcase, Gem, Coins, DollarSign, Landmark, Building, Briefcase, Wallet][idx % 12] || Wallet;
    const getCombatIcon = (idx: number) => [Target, Sword, Shield, Skull, Crosshair, Flag, Sword, Shield, Crosshair, Target, Trophy, Award][idx % 12] || Target;
    const getCheckInIcon = (idx: number) => [Calendar, Footprints, Flame, CheckCircle2, Gift, Star, Crown, Trophy, Medal, Award, Sparkles, Gift][idx % 12] || Calendar;
    const getSpendIcon = (idx: number) => [ShoppingBag, Dumbbell, Utensils, Ticket, Music, Headphones, Armchair, Scissors, Glasses, Footprints, Utensils, Sofa][idx % 12] || ShoppingBag;

    const generateBadges = () => {
         const levelBadges = getAllLevels().map((l, idx) => {
             // 使用索引 + 1 作为等级值
             const levelValue = idx + 1;
             // 默认奖励比例为10%
             const rewardRatio = 0.1;
             // 计算奖励值
             const calculatedRewardXp = 0; // 经验类勋章，仅奖励经验值
             const calculatedRewardGold = Math.floor(l.min * rewardRatio);
             return {
                 id: `lvl-${levelValue}`, title: l.title, subTitle: `LV.${levelValue}`,
                 icon: getLevelIcon(idx), color: 'text-blue-500',
                 isUnlocked: xp >= l.min, req: `等级 ${levelValue}`, progress: Math.min(100, (xp/l.min)*100),
                 rewardXp: calculatedRewardXp, rewardGold: calculatedRewardGold, category: 'LEVEL',
                 bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/50',
                 level: levelValue, // 等级设置
                 min: l.min, // 达成条件
                 rewardRatio: rewardRatio // 奖励比例
             };
         });
         
         const focusBadges = getAllFocusTitles().map((r, idx) => {
             // 默认奖励比例为10%
             const rewardRatio = 0.1;
             // 计算奖励值 - 专注时间类勋章，同时奖励经验值+金币
             const calculatedReward = Math.floor(r.min * rewardRatio);
             return {
                 id: `rank-${r.title}`, title: r.title, subTitle: `${r.min}H`, 
                 icon: getFocusIcon(idx), color: ['text-blue-500', 'text-purple-500', 'text-pink-500', 'text-indigo-500', 'text-teal-500', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-cyan-500', 'text-lime-500', 'text-emerald-500', 'text-violet-500'][idx % 12], 
                 isUnlocked: totalHours >= r.min, req: `专注 ${r.min}H`, progress: Math.min(100, (totalHours/r.min)*100), 
                 rewardXp: calculatedReward, rewardGold: calculatedReward, category: 'FOCUS',
                 bgColor: ['bg-blue-500/20', 'bg-purple-500/20', 'bg-pink-500/20', 'bg-indigo-500/20', 'bg-teal-500/20', 'bg-red-500/20', 'bg-orange-500/20', 'bg-yellow-500/20', 'bg-cyan-500/20', 'bg-lime-500/20', 'bg-emerald-500/20', 'bg-violet-500/20'][idx % 12], 
                 borderColor: ['border-blue-500/50', 'border-purple-500/50', 'border-pink-500/50', 'border-indigo-500/50', 'border-teal-500/50', 'border-red-500/50', 'border-orange-500/50', 'border-yellow-500/50', 'border-cyan-500/50', 'border-lime-500/50', 'border-emerald-500/50', 'border-violet-500/50'][idx % 12],
                 level: idx + 1, // 等级设置
                 min: r.min, // 达成条件
                 rewardRatio: rewardRatio // 奖励比例
             };
         });

         const wealthBadges = getAllWealthTitles().map((c, idx) => {
             // 默认奖励比例为10%
             const rewardRatio = 0.1;
             // 计算奖励值 - 金币类勋章，仅奖励金币
             const calculatedRewardXp = Math.floor(c.min * rewardRatio);
             const calculatedRewardGold = 0;
             return {
                 id: `class-${c.title}`, title: c.title, subTitle: `${c.min}G`, 
                 icon: getWealthIcon(idx), color: ['text-green-500', 'text-blue-500', 'text-purple-500', 'text-pink-500', 'text-indigo-500', 'text-teal-500', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-cyan-500', 'text-lime-500', 'text-emerald-500'][idx % 12], 
                 isUnlocked: balance >= c.min, req: `持有 ${c.min}G`, progress: Math.min(100, (balance/c.min)*100), 
                 rewardXp: calculatedRewardXp, rewardGold: calculatedRewardGold, category: 'WEALTH',
                 bgColor: ['bg-green-500/20', 'bg-blue-500/20', 'bg-purple-500/20', 'bg-pink-500/20', 'bg-indigo-500/20', 'bg-teal-500/20', 'bg-red-500/20', 'bg-orange-500/20', 'bg-yellow-500/20', 'bg-cyan-500/20', 'bg-lime-500/20', 'bg-emerald-500/20'][idx % 12], 
                 borderColor: ['border-green-500/50', 'border-blue-500/50', 'border-purple-500/50', 'border-pink-500/50', 'border-indigo-500/50', 'border-teal-500/50', 'border-red-500/50', 'border-orange-500/50', 'border-yellow-500/50', 'border-cyan-500/50', 'border-lime-500/50', 'border-emerald-500/50'][idx % 12],
                 level: idx + 1, // 等级设置
                 min: c.min, // 达成条件
                 rewardRatio: rewardRatio // 奖励比例
             };
         });

         const combatBadges = getAllMilitaryRanks().map((r, idx) => {
             // 默认奖励比例为10%
             const rewardRatio = 0.1;
             // 计算奖励值 - 战斗类勋章，同时奖励经验值+金币
             const calculatedRewardXp = Math.floor(r.min * 20);
             const calculatedRewardGold = Math.floor(r.min * 10);
             return {
                 id: `combat-${r.title}`, title: r.title, subTitle: `${r.min} KILLS`, 
                 icon: getCombatIcon(idx), color: 'text-red-500', 
                 isUnlocked: totalCampaignsWon >= r.min, req: `完成 ${r.min} 任务`, progress: Math.min(100, (totalCampaignsWon/r.min)*100), 
                 rewardXp: calculatedRewardXp, rewardGold: calculatedRewardGold, category: 'COMBAT',
                 bgColor: 'bg-red-500/20', borderColor: 'border-red-500/50',
                 level: idx + 1, // 等级设置
                 min: r.min, // 达成条件
                 rewardRatio: rewardRatio // 奖励比例
             };
         });

         const checkInBadges = getAllCheckInTitles().map((c, idx) => {
             // 默认奖励比例为10%
             const rewardRatio = 0.1;
             // 计算奖励值 - 签到类勋章，同时奖励经验值+金币
             const calculatedRewardXp = Math.floor(c.min * 30);
             const calculatedRewardGold = Math.floor(c.min * 20);
             return {
                 id: `check-${c.title}`, title: c.title, subTitle: `${c.min} DAYS`, 
                 icon: getCheckInIcon(idx), color: ['text-purple-500', 'text-blue-500', 'text-green-500', 'text-pink-500', 'text-indigo-500', 'text-teal-500', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-cyan-500', 'text-lime-500', 'text-emerald-500'][idx % 12], 
                 isUnlocked: checkInStreak >= c.min, req: `连签 ${c.min} 天`, progress: Math.min(100, (checkInStreak/c.min)*100), 
                 rewardXp: calculatedRewardXp, rewardGold: calculatedRewardGold, category: 'CHECKIN',
                 bgColor: ['bg-purple-500/20', 'bg-blue-500/20', 'bg-green-500/20', 'bg-pink-500/20', 'bg-indigo-500/20', 'bg-teal-500/20', 'bg-red-500/20', 'bg-orange-500/20', 'bg-yellow-500/20', 'bg-cyan-500/20', 'bg-lime-500/20', 'bg-emerald-500/20'][idx % 12], 
                 borderColor: ['border-purple-500/50', 'border-blue-500/50', 'border-green-500/50', 'border-pink-500/50', 'border-indigo-500/50', 'border-teal-500/50', 'border-red-500/50', 'border-orange-500/50', 'border-yellow-500/50', 'border-cyan-500/50', 'border-lime-500/50', 'border-emerald-500/50'][idx % 12],
                 level: idx + 1, // 等级设置
                 min: c.min, // 达成条件
                 rewardRatio: rewardRatio // 奖励比例
             };
         });

         const spendBadges = getAllConsumptionTitles().map((c, idx) => {
             // 默认奖励比例为10%
             const rewardRatio = 0.1;
             // 计算奖励值 - 消费类勋章，仅奖励金币
             const calculatedRewardXp = 0;
             const calculatedRewardGold = Math.floor(c.min * rewardRatio);
             return {
                 id: `consume-${c.title}`, title: c.title, subTitle: `${c.min}G`, 
                 icon: getSpendIcon(idx), color: ['text-purple-500', 'text-blue-500', 'text-green-500', 'text-pink-500', 'text-indigo-500', 'text-teal-500', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-cyan-500', 'text-lime-500', 'text-emerald-500'][idx % 12], 
                 isUnlocked: totalSpent >= c.min, req: `消费 ${c.min}G`, progress: Math.min(100, (totalSpent/c.min)*100), 
                 rewardXp: calculatedRewardXp, rewardGold: calculatedRewardGold, category: 'SPEND',
                 bgColor: ['bg-purple-500/20', 'bg-blue-500/20', 'bg-green-500/20', 'bg-pink-500/20', 'bg-indigo-500/20', 'bg-teal-500/20', 'bg-red-500/20', 'bg-orange-500/20', 'bg-yellow-500/20', 'bg-cyan-500/20', 'bg-lime-500/20', 'bg-emerald-500/20'][idx % 12], 
                 borderColor: ['border-purple-500/50', 'border-blue-500/50', 'border-green-500/50', 'border-pink-500/50', 'border-indigo-500/50', 'border-teal-500/50', 'border-red-500/50', 'border-orange-500/50', 'border-yellow-500/50', 'border-cyan-500/50', 'border-lime-500/50', 'border-emerald-500/50'][idx % 12],
                 level: idx + 1, // 等级设置
                 min: c.min, // 达成条件
                 rewardRatio: rewardRatio // 奖励比例
             };
         });

         return [...levelBadges, ...focusBadges, ...wealthBadges, ...combatBadges, ...checkInBadges, ...spendBadges];
    };

    const allBadges = generateBadges();
    const filteredBadges = category === 'ALL' ? allBadges : allBadges.filter(b => b.category === category);
    

    // 检测勋章解锁并显示通知 - 移除重复通知逻辑，统一使用中央的RewardModal
    useEffect(() => {
        // 遍历所有勋章，检查是否有新解锁的勋章
        allBadges.forEach(badge => {
            if (badge.isUnlocked && !claimedBadges.includes(badge.id)) {
                // 不在这里显示通知，统一由App.tsx中的RewardModal处理
            }
        });
    }, [allBadges, claimedBadges]);

    // Latest 6 claimed/unlocked badges as requested
    const latestBadges = allBadges.filter(b => b.isUnlocked).reverse().slice(0, 6);
    const unlockedCount = allBadges.filter(b => b.isUnlocked).length;
    const totalCount = allBadges.length;

    return (
        <div className={`h-full flex flex-col overflow-hidden ${globalBg}`}>
            {/* Add CSS for animations */}
            <style>{styles}</style>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6">
                    {/* 成就收集率模块 - 优化布局顺序 */}
                    <div className={`mb-4 p-3 rounded-[48px] ${
                        isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(30,30,46,0.8)]' : isDark ? 'bg-zinc-900' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white shadow-sm'
                    } transition-all duration-300 hover:shadow-md`}>
                        <div className="flex items-center gap-4">
                            {/* 左侧：图标和文字 */}
                            <div className="flex items-center gap-1">
                                <Activity size={12} className={isDark ? 'text-yellow-400' : 'text-yellow-500'} />
                                <h4 className={`text-xs font-bold uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'} text-shadow-sm`}>成就收集率</h4>
                                <GlobalHelpButton helpId="achievements" onHelpClick={onHelpClick} size={14} variant="ghost" />
                            </div>
                            
                            {/* 中间：延长的进度条 - 凹陷效果 */}
                        <div className={`flex-1 rounded-full h-1.5 overflow-hidden ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-800 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]' : 'bg-slate-200 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'}`}>
                            <div 
                                className={`h-full bg-blue-600 rounded-full transition-all duration-500 ease-out ${isNeomorphic ? 'shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : isDark ? 'shadow-[2px_2px_4px_rgba(0,0,0,0.3)]' : 'shadow-[2px_2px_4px_rgba(163,177,198,0.3)]'}`} 
                                style={{ width: `${Math.round((unlockedCount/totalCount)*100)}%` }}
                            ></div>
                        </div>
                            
                            {/* 右侧：百分比和已解锁数量 */}
                            <div className="flex items-center gap-2 ml-auto">
                                <div className={`text-xl font-black text-yellow-500 text-shadow-md`}>{Math.round((unlockedCount/totalCount)*100)}%</div>
                                <div className={`text-sm font-mono ${textSub} text-shadow-sm`}>{unlockedCount}/{totalCount} 已解锁</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* 2. 最新战勋模块 - 显示最近获得的6个勋章 */}
                    <div className={`mb-6 p-3 rounded-xl ${(isNeomorphic && isNeomorphicDark) ? 'bg-[#1e1e2e] shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(30,30,46,0.8)]' : isDark ? 'bg-zinc-900' : (isNeomorphic ? 'bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)]' : 'bg-white shadow-md')} transition-all duration-300 hover:shadow-lg`}>
                        {/* 左上角小图标和文字 */}
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={12} className={isDark ? 'text-yellow-400' : 'text-yellow-500'}/>
                            <h4 className={`text-xs font-bold uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>最新战勋</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pb-2">
                            {latestBadges.map((badge: any) => {
                                // 从勋章列表复刻样式，确保完全一致
                                const getBadgeClass = () => {
                                    if (badge.isUnlocked) {
                                        if (isDark) {
                                            return `bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-full shadow-lg animate-pulse-glow`;
                                        } else if (isNeomorphic) {
                                            return `${isNeomorphicDark ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]'} rounded-full ${isNeomorphicDark 
                                                ? 'shadow-[12px_12px_24px_rgba(0,0,0,0.3),-12px_-12px_24px_rgba(30,30,46,0.8)] hover:shadow-[16px_16px_32px_rgba(0,0,0,0.4),-16px_-16px_32px_rgba(30,30,46,0.9)] active:shadow-[inset_10px_10px_20px_rgba(0,0,0,0.3),inset_-10px_-10px_20px_rgba(30,30,46,0.8)]' 
                                                : 'shadow-[12px_12px_24px_rgba(163,177,198,0.6),-12px_-12px_24px_rgba(255,255,255,1)] hover:shadow-[16px_16px_32px_rgba(163,177,198,0.7),-16px_-16px_32px_rgba(255,255,255,1)] active:shadow-[inset_10px_10px_20px_rgba(163,177,198,0.6),inset_-10px_-10px_20px_rgba(255,255,255,1)]'} animate-pulse-glow transition-all duration-300`;
                                        } else {
                                            return `bg-white ${badge.bgColor} rounded-full shadow-lg animate-pulse-glow`;
                                        }
                                    } else {
                                        if (isDark) {
                                            return `bg-gradient-to-br from-zinc-950 to-zinc-900 rounded-full opacity-70`;
                                        } else if (isNeomorphic) {
                                            return `${isNeomorphicDark ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]'} rounded-full ${isNeomorphicDark 
                                                ? 'shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(30,30,46,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(30,30,46,0.9)]' 
                                                : 'shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]'} opacity-70 transition-all duration-300`;
                                        } else {
                                            return `bg-slate-100 rounded-full opacity-70`;
                                        }
                                    }
                                };
                                
                                return (
                                    <div 
                                        key={`latest-${badge.id}`} 
                                        className={`shrink-0 w-28 p-3 rounded-full flex flex-col items-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.05] ${getBadgeClass()}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badge.isUnlocked ? (isNeomorphic ? (isNeomorphicDark ? `bg-[#1e1e2e] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]` : `bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]`) : badge.bgColor) : (isNeomorphicDark ? 'bg-[#1e1e2e]/30' : isDark ? 'bg-zinc-900/30' : 'bg-slate-900/30')}`}>
                                            <badge.icon size={20} className={`${badge.color} ${!badge.isUnlocked ? 'opacity-70' : ''}`} strokeWidth={2}/>
                                        </div>
                                        <div className={`text-[10px] font-bold text-center truncate w-full ${badge.isUnlocked ? textMain : (isDark ? 'text-zinc-500' : 'text-zinc-500')}`}>{badge.title}</div>
                                        <div className={`text-[8px] font-mono ${badge.isUnlocked ? textSub : (isDark ? 'text-zinc-600' : 'text-zinc-600')}`}>{badge.subTitle}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* 3. 勋章分组模块 - 单独的模块 */}
                    <div className={`mb-6 p-3 rounded-xl ${isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(30,30,46,0.8)]' : isDark ? 'bg-zinc-900' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)]' : 'bg-white shadow-md'} transition-all duration-300 hover:shadow-lg`}>
                        {/* 左上角分组图标和文字 */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Layout size={12} className={isDark ? 'text-yellow-400' : 'text-yellow-500'}/>
                                <h4 className={`text-xs font-bold uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>勋章分组</h4>
                            </div>
                            {/* 帮助卡片按钮 */}
                            <GlobalHelpButton helpId="achievements" onHelpClick={onHelpClick} size={14} variant="ghost" />
                        </div>
                        <div className="flex flex-wrap gap-2 items-center justify-start">
                            {[
                                {id:'ALL', l:'全部', i: Layout}, 
                                {id:'LEVEL', l:'等级', i:Zap}, 
                                {id:'FOCUS', l:'专注', i:Clock}, 
                                {id:'WEALTH', l:'财富', i:Wallet}, 
                                {id:'COMBAT', l:'战斗', i:Target}, 
                                {id:'CHECKIN', l:'签到', i:Calendar}, 
                                {id:'SPEND', l:'消费', i:ShoppingBag}
                            ].map(tab => {
                                // 计算该分类下的勋章数量
                                const badgeCount = allBadges.filter(b => b.category === tab.id).length;
                                return (
                                    <button 
                                        key={tab.id} 
                                        onClick={() => {
                                            setCategory(tab.id as any);
                                        }}
                                        className={`px-4 py-1.5 rounded-[24px] text-xs font-bold border transition-all flex items-center justify-center gap-2 whitespace-nowrap ${getButtonStyleLocal(category === tab.id)}`}
                                    >
                                        <tab.i size={12} /> {tab.l} <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>({badgeCount})</span>
                                    </button>
                                );
                            })}
                            {/* 管理按钮 - 统一样式，添加数量显示 */}
                            <button 
                                className={`px-4 py-1.5 rounded-[24px] text-xs font-bold border transition-all flex items-center justify-center gap-2 whitespace-nowrap ${getButtonStyleLocal(false)}`}
                                onClick={() => {
                                    setShowManageModal(true);
                                    setModalState?.(true);
                                }}
                            >
                                <Edit3 size={12} /> 管理勋章 <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>({allBadges.length})</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* 4. 勋章列表模块 - 合并所有勋章列表为一个模块 */}
                    <div className={`p-3 rounded-xl ${isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(30,30,46,0.8)]' : isDark ? 'bg-zinc-900' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)]' : 'bg-white shadow-md'} transition-all duration-300 hover:shadow-lg`}>
                        {/* 左上角小图标和文字 */}
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy size={12} className={isDark ? 'text-yellow-400' : 'text-yellow-500'}/>
                            <h4 className={`text-xs font-bold uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>勋章列表</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pb-20">
                            {filteredBadges.map(badge => {
                                // Enhanced neomorphic styles for badges - 确保所有勋章都是圆形的
                                const getBadgeClass = () => {
                                    if (badge.isUnlocked) {
                                        if (isDark) {
                                            return `bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-full shadow-lg animate-pulse-glow`;
                                        } else if (isNeomorphic) {
                                            return `${isNeomorphicDark ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]'} rounded-full ${isNeomorphicDark 
                                                ? 'shadow-[12px_12px_24px_rgba(0,0,0,0.3),-12px_-12px_24px_rgba(30,30,46,0.8)] hover:shadow-[16px_16px_32px_rgba(0,0,0,0.4),-16px_-16px_32px_rgba(30,30,46,0.9)] active:shadow-[inset_10px_10px_20px_rgba(0,0,0,0.3),inset_-10px_-10px_20px_rgba(30,30,46,0.8)]' 
                                                : 'shadow-[12px_12px_24px_rgba(163,177,198,0.6),-12px_-12px_24px_rgba(255,255,255,1)] hover:shadow-[16px_16px_32px_rgba(163,177,198,0.7),-16px_-16px_32px_rgba(255,255,255,1)] active:shadow-[inset_10px_10px_20px_rgba(163,177,198,0.6),inset_-10px_-10px_20px_rgba(255,255,255,1)]'} animate-pulse-glow transition-all duration-300`;
                                        } else {
                                            return `bg-white ${badge.bgColor} rounded-full shadow-lg animate-pulse-glow`;
                                        }
                                    } else {
                                        if (isDark) {
                                            return `bg-gradient-to-br from-zinc-950 to-zinc-900 rounded-full opacity-70`;
                                        } else if (isNeomorphic) {
                                            return `${isNeomorphicDark ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]'} rounded-full ${isNeomorphicDark 
                                                ? 'shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(30,30,46,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(30,30,46,0.9)]' 
                                                : 'shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]'} opacity-70 transition-all duration-300`;
                                        } else {
                                            return `bg-slate-100 rounded-full opacity-70`;
                                        }
                                    }
                                };
                                
                                return (
                                    <div key={badge.id} className={`shrink-0 w-28 p-3 rounded-full flex flex-col items-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.05] ${getBadgeClass()}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badge.isUnlocked ? (isNeomorphic ? (isNeomorphicDark ? `bg-[#1e1e2e] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]` : `bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]`) : badge.bgColor) : (isNeomorphicDark ? 'bg-[#1e1e2e]/30' : isDark ? 'bg-zinc-900/30' : 'bg-slate-900/30')}`}>
                                            <badge.icon size={20} className={`${badge.color} ${!badge.isUnlocked ? 'opacity-70' : ''}`} strokeWidth={2}/>
                                        </div>
                                        <div className={`text-[10px] font-bold text-center truncate w-full ${badge.isUnlocked ? textMain : (isDark ? 'text-zinc-500' : 'text-zinc-500')}`}>{badge.title}</div>
                                        <div className={`text-[8px] font-mono ${badge.isUnlocked ? textSub : (isDark ? 'text-zinc-600' : 'text-zinc-600')}`}>{badge.subTitle}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* 管理功能模态框 */}
            <BadgeManagementModal
                isOpen={showManageModal}
                onClose={() => {
                    setShowManageModal(false);
                    setModalState?.(false);
                }}
                theme={theme}
                isDark={isDark}
                isNeomorphic={isNeomorphic}
                isNeomorphicDark={isNeomorphicDark}
                textMain={textMain}
                textSub={textSub}
                allBadges={allBadges}
                claimedBadges={claimedBadges}
                onForceRefresh={() => setForceRefresh(prev => !prev)}
                getButtonStyleLocal={getButtonStyleLocal}
                onHelpClick={onHelpClick}
            />
            
            {/* 帮助卡片模态框 */}
            <GlobalGuideCard
                activeHelp={activeHelp}
                helpContent={helpContent}
                onClose={() => setActiveHelp(null)}
                cardBg={cardBg}
                textMain={textMain}
                textSub={textSub}
                config={{
                    fontSize: 'medium',
                    borderRadius: 'large',
                    shadowIntensity: 'medium',
                    showUnderlyingPrinciple: true
                }}
            />

        </div>
    );
};

export default HallOfFame;