import React, { memo, useMemo, useCallback } from 'react';
import { 
  Trophy, Crown, Target, Crosshair, Skull, Star, Gift, Medal, 
  Sparkles, Swords, Flame, Footprints, Calendar, ShoppingBag, 
  Dumbbell, Shield, Zap, Brain, BicepsFlexed, Heart, Users, 
  Coins, Award, Gem, Scale, TrendingUp, Activity, BarChart3, 
  PieChart, TrendingDown, Clock, Timer, Watch, Hourglass
} from 'lucide-react';
import { Theme } from '../../types';
import { getNeomorphicStyles, getButtonStyle, getCardBgStyle, getTextStyle } from '../../utils/styleHelpers';

interface ArmoryTabProps {
  balance: number;
  xp: number;
  totalHours: number;
  totalTasksCompleted: number;
  checkInStreak: number;
  theme: Theme;
  isDark: boolean;
  isNeomorphic: boolean;
  cardBg: string;
  textMain: string;
  textSub: string;
  neomorphicStyles: { bg: string; border: string; shadow: string; hoverShadow: string; activeShadow: string; transition: string };
}

const ArmoryTab: React.FC<ArmoryTabProps> = memo(({
  balance, xp, totalHours, totalTasksCompleted, checkInStreak,
  theme, isDark, isNeomorphic, cardBg, textMain, textSub, neomorphicStyles
}) => {
  // 计算等级
  const level = useMemo(() => Math.floor(xp / 200) + 1, [xp]);
  
  // 计算各种统计数据
  const stats = useMemo(() => [
    { label: '等级', value: level, icon: Crown, color: 'text-yellow-500' },
    { label: '经验值', value: xp, icon: Star, color: 'text-blue-500' },
    { label: '金币', value: balance, icon: Coins, color: 'text-yellow-500' },
    { label: '专注时长', value: totalHours, icon: Clock, color: 'text-purple-500' },
    { label: '完成任务', value: totalTasksCompleted, icon: Trophy, color: 'text-green-500' },
    { label: '签到连击', value: checkInStreak, icon: Zap, color: 'text-red-500' },
  ], [level, xp, balance, totalHours, totalTasksCompleted, checkInStreak]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* 军械库标题 */}
      <div className={`${cardBg} border p-4 rounded-2xl transition-all duration-300 hover:shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Shield size={16}/> 军械库
          </div>
        </div>
        
        {/* 统计概览 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`p-4 rounded-xl border text-center ${
                isNeomorphic 
                  ? (theme === 'neomorphic-dark' 
                      ? 'bg-[#1e1e2e] border-[#2a2a3e] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(30,30,46,0.8)]' 
                      : 'bg-[#e0e5ec] border-[#a3b1c6] shadow-[8px_8px_16px_rgba(163,177,198,0.4),-8px_-8px_16px_rgba(255,255,255,0.8)]') 
                  : isDark 
                      ? 'bg-zinc-800 border-zinc-700' 
                      : 'bg-white border-slate-300'
              }`}
            >
              <stat.icon className={stat.color} size={24} />
              <div className={`text-2xl font-bold mt-2 ${textMain}`}>{stat.value}</div>
              <div className={`text-xs mt-1 ${textSub}`}>{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* 角色成就 */}
        <div className={`${cardBg} border p-4 rounded-2xl transition-all duration-300 hover:shadow-lg`}>
          <h3 className={`text-lg font-bold ${textMain} mb-4`}>角色成就</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${
              isNeomorphic 
                ? (theme === 'neomorphic-dark' 
                    ? 'bg-[#1e1e2e] border-[#2a2a3e] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(30,30,46,0.8)]' 
                    : 'bg-[#e0e5ec] border-[#a3b1c6] shadow-[8px_8px_16px_rgba(163,177,198,0.4),-8px_-8px_16px_rgba(255,255,255,0.8)]') 
                : isDark 
                    ? 'bg-zinc-800 border-zinc-700' 
                    : 'bg-white border-slate-300'
            }`}>
              <div className="flex items-center gap-3">
                <Medal className="text-yellow-500" size={32} />
                <div>
                  <h4 className={`font-bold ${textMain}`}>新手上路</h4>
                  <p className={`text-sm ${textSub}`}>完成第一个任务</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl border ${
              isNeomorphic 
                ? (theme === 'neomorphic-dark' 
                    ? 'bg-[#1e1e2e] border-[#2a2a3e] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(30,30,46,0.8)]' 
                    : 'bg-[#e0e5ec] border-[#a3b1c6] shadow-[8px_8px_16px_rgba(163,177,198,0.4),-8px_-8px_16px_rgba(255,255,255,0.8)]') 
                : isDark 
                    ? 'bg-zinc-800 border-zinc-700' 
                    : 'bg-white border-slate-300'
            }`}>
              <div className="flex items-center gap-3">
                <Flame className="text-red-500" size={32} />
                <div>
                  <h4 className={`font-bold ${textMain}`}>连击大师</h4>
                  <p className={`text-sm ${textSub}`}>连续签到7天</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 属性面板 */}
        <div className={`${cardBg} border p-4 rounded-2xl transition-all duration-300 hover:shadow-lg`}>
          <h3 className={`text-lg font-bold ${textMain} mb-4`}>属性面板</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className={textMain}>力量</span>
                <span className={textSub}>85</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${
                isNeomorphic 
                  ? (theme === 'neomorphic-dark' 
                      ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' 
                      : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') 
                  : isDark 
                      ? 'bg-zinc-800' 
                      : 'bg-slate-200'
              }`}>
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: '85%' }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className={textMain}>智力</span>
                <span className={textSub}>92</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${
                isNeomorphic 
                  ? (theme === 'neomorphic-dark' 
                      ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' 
                      : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') 
                  : isDark 
                      ? 'bg-zinc-800' 
                      : 'bg-slate-200'
              }`}>
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: '92%' }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className={textMain}>敏捷</span>
                <span className={textSub}>78</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${
                isNeomorphic 
                  ? (theme === 'neomorphic-dark' 
                      ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' 
                      : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') 
                  : isDark 
                      ? 'bg-zinc-800' 
                      : 'bg-slate-200'
              }`}>
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: '78%' }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className={textMain}>魅力</span>
                <span className={textSub}>88</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${
                isNeomorphic 
                  ? (theme === 'neomorphic-dark' 
                      ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' 
                      : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') 
                  : isDark 
                      ? 'bg-zinc-800' 
                      : 'bg-slate-200'
              }`}>
                <div 
                  className="h-full bg-purple-500 rounded-full" 
                  style={{ width: '88%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ArmoryTab.displayName = 'ArmoryTab';

export default ArmoryTab;