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
  HelpCircle, Shield, Footprints, Calendar, Dumbbell, Sparkles, Layout, Award, User, Gem, Feather, Eye, Compass, Key, Anchor, Sword, Sun, Moon, Coins, Diamond, Landmark, Briefcase,
  BrainCircuit, Activity, TrendingUp, DollarSign, Building, Utensils, Ticket, Music, Headphones, Armchair, Scissors, Glasses, Sofa, Edit3,
  XCircle, Trash2, Plus, Grid3X3
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
    // 拟态风格样式变量
    const neomorphicStyles = {
        bg: 'bg-[#e0e5ec]',
        border: 'border-[#e0e5ec]',
        shadow: 'shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]',
        hoverShadow: 'hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]',
        activeShadow: 'active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]',
        transition: 'transition-all duration-200'
    };
    
    // 生成按钮样式的辅助函数
    const getButtonStyle = (isActive: boolean, isSpecial?: boolean) => {
        if (isActive) {
            return isSpecial ? 'bg-red-500 text-white border-red-500' : 'bg-blue-500 text-white border-blue-500';
        }
        if (isNeomorphic) {
            return `${neomorphicStyles.bg} ${neomorphicStyles.border} ${neomorphicStyles.shadow} ${neomorphicStyles.hoverShadow} ${neomorphicStyles.activeShadow} ${neomorphicStyles.transition}`;
        }
        return isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-200';
    };
    
    // 拟态风格卡片背景 - 符合设计规格的高饱和度灰蓝色底色，135度光源，增强阴影效果
    const cardBg = isNeomorphic 
        ? 'bg-[#e0e5ec] rounded-[48px] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] transition-all duration-200 active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)]' 
        : isDark 
        ? 'bg-zinc-900' 
        : 'bg-white';
    const textMain = isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';
    const textSub = isDark ? 'text-zinc-500' : isNeomorphic ? 'text-zinc-600' : 'text-slate-500';
    
    const [category, setCategory] = useState<'ALL' | 'LEVEL' | 'FOCUS' | 'WEALTH' | 'COMBAT' | 'CHECKIN' | 'SPEND'>('ALL');
    // 管理功能状态
    const [showManageModal, setShowManageModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'LEVEL' | 'FOCUS' | 'WEALTH' | 'COMBAT' | 'CHECKIN' | 'SPEND'>('ALL');
    const [editingGroup, setEditingGroup] = useState<string | null>(null);
    const [editingBadge, setEditingBadge] = useState<any | null>(null);
    // 分组编辑缓存，避免跨分组操作冲突
    const [groupEditCache, setGroupEditCache] = useState<{
        [groupKey: string]: {
            groupName: string;
            badges: any[];
        }
    }>({});
    // 按分组存储勋章编辑缓存，避免跨分组操作冲突
    const [badgeEditCache, setBadgeEditCache] = useState<{
        [groupKey: string]: {
            [badgeId: string]: {
                title: string;
                subTitle: string;
                req: string;
                level: number;
                requiredValue: number;
                rewardXp: number;
                rewardGold: number;
                rewardRatio: number;
            }
        }
    }>({});

    // 当前查看的分组勋章
    const [viewingGroup, setViewingGroup] = useState<'ALL' | 'LEVEL' | 'FOCUS' | 'WEALTH' | 'COMBAT' | 'CHECKIN' | 'SPEND'>('ALL');
    // 强制刷新状态，用于更新勋章列表
    const [forceRefresh, setForceRefresh] = useState(false);
    // 重置编辑缓存函数，避免跨分组操作冲突
    const resetEditCache = (categoryToReset?: string) => {
        if (categoryToReset) {
            // 只清空特定分组的缓存
            setBadgeEditCache(prev => {
                const newCache = { ...prev };
                // 移除对应分组的所有勋章编辑缓存
                delete newCache[categoryToReset];
                return newCache;
            });
            setGroupEditCache(prev => {
                const newCache = { ...prev };
                delete newCache[categoryToReset];
                return newCache;
            });
        } else {
            // 清空所有分组的缓存
            setBadgeEditCache({});
            setGroupEditCache({});
        }
    };
    


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
    // 筛选后的勋章，用于管理界面
    const filteredManageBadges = selectedCategory === 'ALL' ? allBadges : allBadges.filter(b => b.category === selectedCategory);

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
        <div className={`h-full flex flex-col overflow-hidden`}>
            {/* Add CSS for animations */}
            <style>{styles}</style>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6">
                    {/* 成就收集率模块 - 优化布局顺序 */}
        <div className={`mb-4 p-3 rounded-[48px] ${isDark ? 'bg-zinc-900' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white shadow-sm'} transition-all duration-300 hover:shadow-md`}>
                        <div className="flex items-center gap-4">
                            {/* 左侧：图标和文字 */}
                            <div className="flex items-center gap-1">
                                <Activity size={12} className="text-yellow-500"/>
                                <h4 className="text-xs font-bold uppercase text-zinc-500">成就收集率</h4>
                            </div>
                            
                            {/* 中间：延长的进度条 */}
                            <div className="flex-1 bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                                <div 
                                    className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out" 
                                    style={{ width: `${Math.round((unlockedCount/totalCount)*100)}%` }}
                                ></div>
                            </div>
                            
                            {/* 右侧：百分比和已解锁数量 */}
                            <div className="flex items-center gap-2 ml-auto">
                                <div className={`text-xl font-black text-yellow-500`}>{Math.round((unlockedCount/totalCount)*100)}%</div>
                                <div className={`text-sm font-mono ${textSub}`}>{unlockedCount}/{totalCount} 已解锁</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* 2. 最新战勋模块 - 显示最近获得的6个勋章 */}
                    <div className={`mb-6 p-3 rounded-xl ${isDark ? 'bg-zinc-900' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)]' : 'bg-white shadow-md'} transition-all duration-300 hover:shadow-lg`}>
                        {/* 左上角小图标和文字 */}
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={12} className="text-yellow-500"/>
                            <h4 className="text-xs font-bold uppercase text-zinc-500">最新战勋</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pb-2">
                            {latestBadges.map((badge: any) => {
                                // 从勋章列表复刻样式，确保完全一致
                                const getBadgeClass = () => {
                                    if (badge.isUnlocked) {
                                        if (isDark) {
                                            return `bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-full shadow-lg animate-pulse-glow`;
                                        } else if (isNeomorphic) {
                                            return `bg-[#e0e5ec] rounded-full shadow-[12px_12px_24px_rgba(163,177,198,0.6),-12px_-12px_24px_rgba(255,255,255,1)] hover:shadow-[16px_16px_32px_rgba(163,177,198,0.7),-16px_-16px_32px_rgba(255,255,255,1)] active:shadow-[inset_10px_10px_20px_rgba(163,177,198,0.6),inset_-10px_-10px_20px_rgba(255,255,255,1)] animate-pulse-glow transition-all duration-300`;
                                        } else {
                                            return `bg-white ${badge.bgColor} rounded-full shadow-lg animate-pulse-glow`;
                                        }
                                    } else {
                                        if (isDark) {
                                            return `bg-gradient-to-br from-zinc-950 to-zinc-900 rounded-full opacity-70`;
                                        } else if (isNeomorphic) {
                                            return `bg-[#e0e5ec] rounded-full shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] opacity-70 transition-all duration-300`;
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
                    
                    {/* 3. 勋章分组模块 - 单独的模块 */}
                    <div className={`mb-6 p-3 rounded-xl ${isDark ? 'bg-zinc-900' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)]' : 'bg-white shadow-md'} transition-all duration-300 hover:shadow-lg`}>
                        {/* 左上角分组图标和文字 */}
                        <div className="flex items-center gap-2 mb-2">
                            <Layout size={12} className="text-yellow-500"/>
                            <h4 className="text-xs font-bold uppercase text-zinc-500">勋章分组</h4>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar items-center">
                            {
                                [
                                    {id:'ALL', l:'全部', i: Layout}, 
                                    {id:'LEVEL', l:'等级', i:Zap}, 
                                    {id:'FOCUS', l:'专注', i:Clock}, 
                                    {id:'WEALTH', l:'财富', i:Wallet}, 
                                    {id:'COMBAT', l:'战斗', i:Target}, 
                                    {id:'CHECKIN', l:'签到', i:Calendar}, 
                                    {id:'SPEND', l:'消费', i:ShoppingBag}
                                ].map(tab => {
                                    // 优化按钮样式，去掉阴影效果
                                    let buttonClass = '';
                                    if (category === tab.id) {
                                        // 激活状态：蓝色背景，白色文字，平滑过渡
                                        buttonClass = 'bg-blue-500 text-white transition-all duration-300 rounded-[24px]';
                                    } else if (isNeomorphic) {
                                        // 非激活状态：去掉阴影效果，简化样式
                                        buttonClass = 'bg-[#e0e5ec] transition-all duration-300 text-zinc-700 rounded-[24px]';
                                    } else {
                                        // 非拟态风格：简化样式，去掉阴影
                                        buttonClass = isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-500 transition-all duration-300 rounded-[24px]' : 'bg-white hover:bg-slate-100 text-slate-600 transition-all duration-300 rounded-[24px]';
                                    }
                                    
                                    return (
                                        <button 
                                            key={tab.id} 
                                            onClick={() => {
                                                // 切换分组时清空上一分组的编辑缓存，避免跨分组操作冲突
                                                resetEditCache(category);
                                                setCategory(tab.id as any);
                                            }}
                                            className={`px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${buttonClass}`}
                                        >
                                            <tab.i size={12} /> {tab.l}
                                        </button>
                                    );
                                })
                            }
                            {/* 管理按钮 */}
                            <button 
                                className={`px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${isNeomorphic ? 'bg-[#e0e5ec] transition-all duration-300 text-zinc-700 rounded-[24px]' : (isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-500 transition-all duration-300 rounded-[24px]' : 'bg-white hover:bg-slate-100 text-slate-600 transition-all duration-300 rounded-[24px]')}`}
                                onClick={() => setShowManageModal(true)}
                            >
                                <Edit3 size={12} /> 管理
                            </button>
                        </div>
                    </div>
                    
                    {/* 4. 勋章列表模块 - 合并所有勋章列表为一个模块 */}
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-zinc-900' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)]' : 'bg-white shadow-md'} transition-all duration-300 hover:shadow-lg`}>
                        {/* 左上角小图标和文字 */}
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy size={12} className="text-yellow-500"/>
                            <h4 className="text-xs font-bold uppercase text-zinc-500">勋章列表</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pb-20">
                            {filteredBadges.map(badge => {
                                // Enhanced neomorphic styles for badges - 确保所有勋章都是圆形的
                                const getBadgeClass = () => {
                                    if (badge.isUnlocked) {
                                        if (isDark) {
                                            return `bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-full shadow-lg animate-pulse-glow`;
                                        } else if (isNeomorphic) {
                                            return `bg-[#e0e5ec] rounded-full shadow-[12px_12px_24px_rgba(163,177,198,0.6),-12px_-12px_24px_rgba(255,255,255,1)] hover:shadow-[16px_16px_32px_rgba(163,177,198,0.7),-16px_-16px_32px_rgba(255,255,255,1)] active:shadow-[inset_10px_10px_20px_rgba(163,177,198,0.6),inset_-10px_-10px_20px_rgba(255,255,255,1)] animate-pulse-glow transition-all duration-300`;
                                        } else {
                                            return `bg-white ${badge.bgColor} rounded-full shadow-lg animate-pulse-glow`;
                                        }
                                    } else {
                                        if (isDark) {
                                            return `bg-gradient-to-br from-zinc-950 to-zinc-900 rounded-full opacity-70`;
                                        } else if (isNeomorphic) {
                                            return `bg-[#e0e5ec] rounded-full shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] opacity-70 transition-all duration-300`;
                                        } else {
                                            return `bg-slate-100 rounded-full opacity-70`;
                                        }
                                    }
                                };
                                
                                return (
                                    <div key={badge.id} className={`shrink-0 w-28 p-3 rounded-full flex flex-col items-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.05] ${getBadgeClass()}`}>
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
        
        {/* 管理功能模态框 */}
        {showManageModal && (
            <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-zinc-900' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-white'} p-6`}>
                    {/* 模态框标题 */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className={`text-xl font-bold ${textMain}`}>
                            <Edit3 size={20} className="inline-block mr-2 text-yellow-500" /> 勋章管理
                        </h2>
                        <button 
                            onClick={() => setShowManageModal(false)}
                            className={`p-2 rounded-full hover:bg-zinc-800 transition-colors ${isDark ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}
                        >
                            <XCircle size={20} className={textSub} />
                        </button>
                    </div>
                    
                    {/* 分类切换按钮 */}
                    <div className="mb-6 overflow-x-auto pb-2">
                        <div className="flex gap-2">
                            {[{id:'ALL', l:'全部', i:Grid3X3}, {id:'LEVEL', l:'等级', i:Zap}, {id:'FOCUS', l:'专注', i:Clock}, {id:'WEALTH', l:'财富', i:Wallet}, {id:'COMBAT', l:'战斗', i:Target}, {id:'CHECKIN', l:'签到', i:Calendar}, {id:'SPEND', l:'消费', i:ShoppingBag}].map(group => {
                                const Icon = group.i;
                                return (
                                    <button 
                                        key={group.id}
                                        onClick={() => {
                                            // 切换分组时清空上一分组的编辑缓存，避免跨分组操作冲突
                                            setEditingBadge(null);
                                            setEditingGroup(null);
                                            resetEditCache(selectedCategory); // 清空当前分组的编辑缓存
                                            setSelectedCategory(group.id);
                                        }}
                                        className={`px-4 py-1.5 rounded-[24px] text-xs font-bold border flex items-center gap-1.5 whitespace-nowrap transition-all ${getButtonStyle(selectedCategory === group.id)}`}
                                    >
                                        <Icon size={14} className={selectedCategory === group.id ? (isDark ? 'text-yellow-500' : 'text-blue-500') : 'text-zinc-500'} />
                                        {group.l}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* 勋章分组列表 */}
                    <div className="space-y-6">
                        <div>
                            <div className="grid grid-cols-1 gap-3">
                                {[{id:'LEVEL', l:'等级', i:Zap}, {id:'FOCUS', l:'专注', i:Clock}, {id:'WEALTH', l:'财富', i:Wallet}, {id:'COMBAT', l:'战斗', i:Target}, {id:'CHECKIN', l:'签到', i:Calendar}, {id:'SPEND', l:'消费', i:ShoppingBag}]
                                    .filter(group => selectedCategory === 'ALL' || group.id === selectedCategory)
                                    .map(group => (
                                    <div 
                                        key={group.id} 
                                        className={`p-3 rounded-lg transition-all ${isDark ? 'bg-zinc-800 hover:bg-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec]' : 'bg-slate-50 hover:bg-slate-100'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <group.i size={16} className="text-yellow-500" />
                                                <span className={textMain}>{group.l}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button 
                                                    className={`p-1.5 rounded hover:bg-yellow-500/20 transition-colors`}
                                                    onClick={() => setEditingGroup(group.id)}
                                                >
                                                    <Edit3 size={14} className={textSub} />
                                                </button>
                                                <button 
                                                    className={`p-1.5 rounded hover:bg-red-500/20 transition-colors`}
                                                >
                                                    <Trash2 size={14} className={textSub} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* 分组下的勋章列表 */}
                                        <div className="mt-3 space-y-2">
                                            {allBadges.filter(badge => badge.category === group.id).map(badge => (
                                                <div 
                                                    key={badge.id} 
                                                    className={`p-2 rounded flex items-center justify-between hover:bg-zinc-800/50 transition-colors ${isDark ? 'bg-zinc-900/50' : 'bg-white/50'}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${badge.isUnlocked ? badge.bgColor : 'bg-zinc-900/30'}`}>
                                                            <badge.icon size={16} className={badge.color} strokeWidth={2} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className={`text-sm font-bold ${textMain}`}>{badge.title}</div>
                                                            <div className={`text-xs ${textSub}`}>{badge.req}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button 
                                                            className={`p-1.5 rounded hover:bg-yellow-500/20 transition-colors`}
                                                            onClick={() => setEditingBadge(badge)}
                                                        >
                                                            <Edit3 size={12} className={textSub} />
                                                        </button>
                                                        <button 
                                                            className={`p-1.5 rounded hover:bg-red-500/20 transition-colors`}
                                                        >
                                                            <Trash2 size={12} className={textSub} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* 新增分组按钮 */}
                        <div className="text-center">
                            <button 
                                className={`w-full py-3 rounded-lg transition-all ${isDark ? 'bg-zinc-800 hover:bg-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)]' : 'bg-blue-50 hover:bg-blue-100'}`}
                            >
                                <Plus size={16} className="inline-block mr-2" /> 新增分组
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {/* 编辑分组名称模态框 */}
        {editingGroup && (
            <div className="fixed inset-0 z-[1001] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                <div className={`w-full max-w-md rounded-xl ${isDark ? 'bg-zinc-900' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-white'} p-6`}>
                    <h3 className={`text-lg font-bold mb-4 ${textMain}`}>编辑分组名称</h3>
                    <div className="space-y-4">
                        <div>
                            <label className={`block text-sm font-bold mb-2 ${textSub}`}>分组名称</label>
                            <input 
                                type="text" 
                                defaultValue={editingGroup === 'LEVEL' ? '等级' : editingGroup === 'FOCUS' ? '专注' : editingGroup === 'WEALTH' ? '财富' : editingGroup === 'COMBAT' ? '战斗' : editingGroup === 'CHECKIN' ? '签到' : '消费'}
                                className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setEditingGroup(null)}
                                className={`flex-1 py-3 rounded-lg transition-all ${isDark ? 'bg-zinc-800 hover:bg-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-slate-100 hover:bg-slate-200'}`}
                            >
                                取消
                            </button>
                            <button 
                                onClick={() => setEditingGroup(null)}
                                className={`flex-1 py-3 rounded-lg transition-all ${isDark ? 'bg-yellow-600 hover:bg-yellow-500' : isNeomorphic ? 'bg-blue-500 text-white shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-yellow-500 hover:bg-yellow-400'} text-white font-bold`}
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {/* 编辑勋章模态框 */}
        {editingBadge && (
            <div className="fixed inset-0 z-[1001] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                <div className={`w-full max-w-2xl rounded-xl ${isDark ? 'bg-zinc-900' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-white'} p-6`}>
                    <h3 className={`text-lg font-bold mb-4 ${textMain}`}>编辑勋章</h3>
                    <div className="space-y-4">
                        {/* 基本信息 - 一行显示两个修改项 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-sm font-bold mb-2 ${textSub}`}>勋章名称</label>
                                <input 
                                    type="text" 
                                    defaultValue={badgeEditCache[editingBadge.category]?.[editingBadge.id]?.title || editingBadge.title}
                                    onChange={(e) => setBadgeEditCache(prev => ({
                                        ...prev,
                                        [editingBadge.category]: {
                                            ...prev[editingBadge.category] || {},
                                            [editingBadge.id]: {
                                                ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                                                title: e.target.value
                                            }
                                        }
                                    }))}
                                    className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-bold mb-2 ${textSub}`}>子标题</label>
                                <input 
                                    type="text" 
                                    defaultValue={badgeEditCache[editingBadge.category]?.[editingBadge.id]?.subTitle || editingBadge.subTitle}
                                    onChange={(e) => setBadgeEditCache(prev => ({
                                        ...prev,
                                        [editingBadge.category]: {
                                            ...prev[editingBadge.category] || {},
                                            [editingBadge.id]: {
                                                ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                                                subTitle: e.target.value
                                            }
                                        }
                                    }))}
                                    className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                                />
                            </div>
                        </div>
                        
                        {/* 等级和达成条件 - 一行显示两个修改项 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-sm font-bold mb-2 ${textSub}`}>等级设置</label>
                                <input 
                                    type="number" 
                                    defaultValue={badgeEditCache[editingBadge.category]?.[editingBadge.id]?.level || editingBadge.level || 1}
                                    min="1"
                                    onChange={(e) => setBadgeEditCache(prev => ({
                                        ...prev,
                                        [editingBadge.category]: {
                                            ...prev[editingBadge.category] || {},
                                            [editingBadge.id]: {
                                                ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                                                level: parseInt(e.target.value) || 1
                                            }
                                        }
                                    }))}
                                    className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                                />
                            </div>
                            
                            <div>
                                <label className={`block text-sm font-bold mb-2 ${textSub}`}>达成条件</label>
                                <input 
                                    type="text" 
                                    defaultValue={badgeEditCache[editingBadge.category]?.[editingBadge.id]?.req || editingBadge.req}
                                    onChange={(e) => setBadgeEditCache(prev => ({
                                        ...prev,
                                        [editingBadge.category]: {
                                            ...prev[editingBadge.category] || {},
                                            [editingBadge.id]: {
                                                ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                                                req: e.target.value
                                            }
                                        }
                                    }))}
                                    className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                                />
                            </div>
                        </div>
                        
                        {/* 奖励配置区域 */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className={`block text-sm font-bold ${textSub}`}>奖励配置</label>
                                <div className="relative group">
                                    <button className="p-1 rounded-full hover:bg-yellow-500/20 transition-colors">
                                        <HelpCircle size={14} className={textSub} />
                                    </button>
                                    <div className="absolute right-0 top-6 w-64 p-3 rounded-lg bg-black/80 text-xs text-white z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                        <p className="mb-2 font-bold">默认奖励规则：</p>
                                        <ul className="space-y-1">
                                            <li>• 经验类勋章：仅奖励经验值，10%比例</li>
                                            <li>• 金币类勋章：仅奖励金币，10%比例</li>
                                            <li>• 专注时间类：奖励经验+金币，均10%比例</li>
                                            <li>• 消费类勋章：仅奖励金币，10%比例</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* 奖励比例 */}
                                <div>
                                    <label className={`block text-xs font-bold mb-1 ${textSub}`}>奖励比例 (%)</label>
                                    <input 
                                        type="number" 
                                        defaultValue={badgeEditCache[editingBadge.category]?.[editingBadge.id]?.rewardRatio || editingBadge.rewardRatio || 10}
                                        min="0"
                                        max="100"
                                        onChange={(e) => setBadgeEditCache(prev => ({
                                            ...prev,
                                            [editingBadge.category]: {
                                                ...prev[editingBadge.category] || {},
                                                [editingBadge.id]: {
                                                    ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                                                    rewardRatio: parseInt(e.target.value) || 10
                                                }
                                            }
                                        }))}
                                        className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                                    />
                                </div>
                                
                                {/* 经验奖励 */}
                                <div>
                                    <label className={`block text-xs font-bold mb-1 ${textSub}`}>经验奖励</label>
                                    <input 
                                        type="number" 
                                        defaultValue={badgeEditCache[editingBadge.category]?.[editingBadge.id]?.rewardXp || editingBadge.rewardXp || 0}
                                        min="0"
                                        onChange={(e) => setBadgeEditCache(prev => ({
                                            ...prev,
                                            [editingBadge.category]: {
                                                ...prev[editingBadge.category] || {},
                                                [editingBadge.id]: {
                                                    ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                                                    rewardXp: parseInt(e.target.value) || 0
                                                }
                                            }
                                        }))}
                                        className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                                    />
                                </div>
                                
                                {/* 金币奖励 */}
                                <div>
                                    <label className={`block text-xs font-bold mb-1 ${textSub}`}>金币奖励</label>
                                    <input 
                                        type="number" 
                                        defaultValue={badgeEditCache[editingBadge.category]?.[editingBadge.id]?.rewardGold || editingBadge.rewardGold || 0}
                                        min="0"
                                        onChange={(e) => setBadgeEditCache(prev => ({
                                            ...prev,
                                            [editingBadge.category]: {
                                                ...prev[editingBadge.category] || {},
                                                [editingBadge.id]: {
                                                    ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                                                    rewardGold: parseInt(e.target.value) || 0
                                                }
                                            }
                                        }))}
                                        className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="flex gap-2">
                            <button 
                                onClick={() => {
                                    // 取消编辑，保留缓存
                                    setEditingBadge(null);
                                }}
                                className={`flex-1 py-3 rounded-lg transition-all ${isDark ? 'bg-zinc-800 hover:bg-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-slate-100 hover:bg-slate-200'}`}
                            >
                                取消
                            </button>
                            <button 
                                onClick={() => {
                                    // 保存编辑，更新勋章数据
                                    const editedBadge = badgeEditCache[editingBadge.category]?.[editingBadge.id] || editingBadge;
                                    
                                    // 根据勋章类型设置不同奖励规则
                                    let finalRewardXp = editedBadge.rewardXp;
                                    let finalRewardGold = editedBadge.rewardGold;
                                    
                                    // 根据勋章类型和所需值重新计算奖励
                                    if (editingBadge.category === 'LEVEL') {
                                        // 等级类勋章：仅奖励经验值，10%比例
                                        finalRewardXp = Math.floor(editedBadge.requiredValue * (editedBadge.rewardRatio / 100));
                                        finalRewardGold = 0;
                                    } else if (editingBadge.category === 'WEALTH') {
                                        // 财富类勋章：仅奖励金币，10%比例
                                        finalRewardXp = 0;
                                        finalRewardGold = Math.floor(editedBadge.requiredValue * (editedBadge.rewardRatio / 100));
                                    } else if (editingBadge.category === 'FOCUS' || editingBadge.category === 'COMBAT' || editingBadge.category === 'CHECKIN') {
                                        // 专注时间类、战斗类、签到类：奖励经验+金币，均10%比例
                                        finalRewardXp = Math.floor(editedBadge.requiredValue * (editedBadge.rewardRatio / 100));
                                        finalRewardGold = Math.floor(editedBadge.requiredValue * (editedBadge.rewardRatio / 100));
                                    } else if (editingBadge.category === 'SPEND') {
                                        // 消费类勋章：仅奖励金币，10%比例
                                        finalRewardXp = 0;
                                        finalRewardGold = Math.floor(editedBadge.requiredValue * (editedBadge.rewardRatio / 100));
                                    }
                                    
                                    // 更新勋章数据 - 这里需要根据不同勋章类型更新对应的阈值
                                    if (editingBadge.category === 'LEVEL') {
                                        // 更新等级阈值
                                        const updatedLevels = getAllLevels().map((l, idx) => {
                                            if (idx + 1 === editingBadge.level) {
                                                return { ...l, min: editedBadge.requiredValue, title: editedBadge.title };
                                            }
                                            return l;
                                        });
                                        // 保存到本地存储 - 这里需要实际的保存逻辑
                                        localStorage.setItem('aes-level-thresholds', JSON.stringify(updatedLevels));
                                    } else if (editingBadge.category === 'FOCUS') {
                                        // 更新专注时间阈值
                                        const updatedFocusTitles = getAllFocusTitles().map((r, idx) => {
                                            if (idx + 1 === editingBadge.level) {
                                                return { ...r, min: editedBadge.requiredValue, title: editedBadge.title };
                                            }
                                            return r;
                                        });
                                        localStorage.setItem('aes-focus-thresholds', JSON.stringify(updatedFocusTitles));
                                    } else if (editingBadge.category === 'WEALTH') {
                                        // 更新财富阈值
                                        const updatedWealthTitles = getAllWealthTitles().map((c, idx) => {
                                            if (idx + 1 === editingBadge.level) {
                                                return { ...c, min: editedBadge.requiredValue, title: editedBadge.title };
                                            }
                                            return c;
                                        });
                                        localStorage.setItem('aes-wealth-thresholds', JSON.stringify(updatedWealthTitles));
                                    } else if (editingBadge.category === 'COMBAT') {
                                        // 更新战斗阈值
                                        const updatedMilitaryRanks = getAllMilitaryRanks().map((r, idx) => {
                                            if (idx + 1 === editingBadge.level) {
                                                return { ...r, min: editedBadge.requiredValue, title: editedBadge.title };
                                            }
                                            return r;
                                        });
                                        localStorage.setItem('aes-combat-thresholds', JSON.stringify(updatedMilitaryRanks));
                                    } else if (editingBadge.category === 'CHECKIN') {
                                        // 更新签到阈值
                                        const updatedCheckInTitles = CHECKIN_THRESHOLDS.map((c, idx) => {
                                            if (idx + 1 === editingBadge.level) {
                                                return { ...c, min: editedBadge.requiredValue, title: editedBadge.title };
                                            }
                                            return c;
                                        });
                                        localStorage.setItem('aes-checkin-thresholds', JSON.stringify(updatedCheckInTitles));
                                    } else if (editingBadge.category === 'SPEND') {
                                        // 更新消费阈值
                                        const updatedConsumptionTitles = CONSUMPTION_THRESHOLDS.map((c, idx) => {
                                            if (idx + 1 === editingBadge.level) {
                                                return { ...c, min: editedBadge.requiredValue, title: editedBadge.title };
                                            }
                                            return c;
                                        });
                                        localStorage.setItem('aes-consumption-thresholds', JSON.stringify(updatedConsumptionTitles));
                                    }
                                    
                                    // 清空编辑缓存
                                    resetEditCache(editingBadge.category);
                                    setEditingBadge(null);
                                    

                                }}
                                className={`flex-1 py-3 rounded-lg transition-all ${isDark ? 'bg-yellow-600 hover:bg-yellow-500' : isNeomorphic ? 'bg-blue-500 text-white shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-yellow-500 hover:bg-yellow-400'} text-white font-bold`}
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        

        
        </div>
    );
};

export default HallOfFame;