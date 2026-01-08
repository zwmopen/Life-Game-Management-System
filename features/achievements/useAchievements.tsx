import React, { useState, useEffect } from 'react';
import { AchievementItem } from '../../types';
import { getAllLevels, getAllFocusTitles, getAllWealthTitles, getAllMilitaryRanks } from '../../components/CharacterProfile';
import { getAllCheckInTitles, getAllConsumptionTitles } from '../../constants/index';
import { Zap, Sparkles, Clock, Brain, Crown, Wallet, Skull, Shield, Target, Flame, Footprints, Calendar, Dumbbell, ShoppingBag } from 'lucide-react';

export interface AchievementBadge {
  id: string;
  title: string;
  subTitle: string;
  icon: React.ReactNode;
  color: string;
  isUnlocked: boolean;
  req: string;
  min: number;
}

export const useAchievements = (
  xp: number,
  balance: number,
  totalHours: number,
  totalKills: number,
  checkInStreak: number,
  totalSpent: number,
  claimedBadges: string[],
  isDataLoaded: boolean
) => {
  const [activeAchievement, setActiveAchievement] = useState<AchievementBadge | null>(null);

  // Global Achievement Watcher
  useEffect(() => {
    if (!isDataLoaded) return;

    const checkAndTrigger = () => {
      const levelBadges = getAllLevels().map((l, idx) => {
        const levelValue = idx + 1;
        return {
          id: `lvl-${levelValue}`,
          title: l.title,
          subTitle: `LV.${levelValue}`,
          icon: idx % 2 === 0 ? <Zap size={32} strokeWidth={3} /> : <Sparkles size={32} strokeWidth={3} />,
          color: 'text-blue-500',
          isUnlocked: xp >= l.min,
          req: `达到等级 ${levelValue}`,
          min: l.min
        };
      });

      const rankBadges = getAllFocusTitles().map((r, idx) => ({
        id: `rank-${r.title}`,
        title: r.title,
        subTitle: `${r.min}H`,
        icon: idx % 2 === 0 ? <Clock size={32} strokeWidth={3} /> : <Brain size={32} strokeWidth={3} />,
        color: 'text-emerald-500',
        isUnlocked: totalHours >= r.min,
        req: `专注 ${r.min} 小时`,
        min: r.min
      }));

      const classBadges = getAllWealthTitles().map((c, idx) => ({
        id: `class-${c.title}`,
        title: c.title,
        subTitle: `${c.min}G`,
        icon: idx > 10 ? <Crown size={32} strokeWidth={3} /> : <Wallet size={32} strokeWidth={3} />,
        color: 'text-yellow-500',
        isUnlocked: balance >= c.min,
        req: `持有 ${c.min} 金币`,
        min: c.min
      }));

      const combatBadges = getAllMilitaryRanks().map((r, idx) => ({
        id: `combat-${r.title}`,
        title: r.title,
        subTitle: `${r.min} KILLS`,
        icon: idx > 15 ? <Skull size={32} strokeWidth={3} /> : (idx > 8 ? <Shield size={32} strokeWidth={3} /> : <Target size={32} strokeWidth={3} />),
        color: 'text-red-500',
        isUnlocked: totalKills >= r.min,
        req: `完成 ${r.min} 个任务`,
        min: r.min
      }));

      const checkInBadges = getAllCheckInTitles().map((c, idx) => ({
        id: `check-${c.title}`,
        title: c.title,
        subTitle: `${c.min} DAYS`,
        icon: idx > 5 ? <Flame size={32} strokeWidth={3} /> : (idx > 2 ? <Footprints size={32} strokeWidth={3} /> : <Calendar size={32} strokeWidth={3} />),
        color: 'text-purple-500',
        isUnlocked: checkInStreak >= c.min,
        req: `连续签到 ${c.min} 天`,
        min: c.min
      }));

      const consumptionBadges = getAllConsumptionTitles().map((c, idx) => ({
        id: `consume-${c.title}`,
        title: c.title,
        subTitle: `${c.min}G`,
        icon: idx > 5 ? <Dumbbell size={32} strokeWidth={3} /> : <ShoppingBag size={32} strokeWidth={3} />,
        color: 'text-orange-500',
        isUnlocked: totalSpent >= c.min,
        req: `累计消费 ${c.min} 金币`,
        min: c.min
      }));

      const isNonZero = (badge: AchievementBadge) => {
        if (badge.min === 0) return false;
        if (badge.id.includes('列兵') && totalKills === 0) return false;
        if (badge.id.includes('专注小白') && totalHours === 0) return false;
        if (badge.id.includes('赛博乞丐') && balance < 50) return false;
        if (badge.id.startsWith('consume') && totalSpent === 0) return false;
        
        return true;
      };

      const allBadges = [...levelBadges, ...rankBadges, ...classBadges, ...combatBadges, ...checkInBadges, ...consumptionBadges];
      
      const unlockedUnclaimed = allBadges.find(b => b.isUnlocked && !claimedBadges.includes(b.id) && isNonZero(b));
      
      if (unlockedUnclaimed && !activeAchievement) {
        setActiveAchievement(unlockedUnclaimed);
      }
    };

    checkAndTrigger();
  }, [xp, balance, totalHours, totalKills, checkInStreak, totalSpent, claimedBadges, isDataLoaded, activeAchievement]);

  return {
    activeAchievement,
    setActiveAchievement
  };
};
