import React, { useState } from 'react';
import { 
  XCircle, Edit3, Trash2, Plus, Grid3X3, Zap, Clock, Wallet, Target, Calendar, ShoppingBag, List, Trophy, RotateCw
} from 'lucide-react';
import { GlobalHelpButton } from '../HelpSystem';
import { Theme } from '../../types';
import EditGroupModal from './EditGroupModal';
import EditBadgeModal from './EditBadgeModal';
import { getAllLevels, getAllFocusTitles, getAllWealthTitles, getAllMilitaryRanks } from '../CharacterProfile';

interface BadgeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  isDark: boolean;
  isNeomorphic: boolean;
  isNeomorphicDark: boolean;
  textMain: string;
  textSub: string;
  allBadges: any[];
  claimedBadges: string[];
  onForceRefresh: () => void;
  getButtonStyleLocal: (isActive: boolean, isSpecial?: boolean) => string;
  onHelpClick: (helpId: string) => void;
}

const BadgeManagementModal: React.FC<BadgeManagementModalProps> = ({
  isOpen,
  onClose,
  theme,
  isDark,
  isNeomorphic,
  isNeomorphicDark,
  textMain,
  textSub,
  allBadges,
  claimedBadges,
  onForceRefresh,
  getButtonStyleLocal,
  onHelpClick,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'LEVEL' | 'FOCUS' | 'WEALTH' | 'COMBAT' | 'CHECKIN' | 'SPEND' | 'TASK'>('ALL');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingBadge, setEditingBadge] = useState<any | null>(null);
  const [badgeEditCache, setBadgeEditCache] = useState<any>({});

  if (!isOpen) return null;

  const resetEditCache = (categoryToReset?: string) => {
    if (categoryToReset) {
      setBadgeEditCache((prev: any) => {
        const newCache = { ...prev };
        delete newCache[categoryToReset];
        return newCache;
      });
    } else {
      setBadgeEditCache({});
    }
  };

  const handleSaveBadge = () => {
    const editedBadge = badgeEditCache[editingBadge.category]?.[editingBadge.id] || editingBadge;
    const requiredValue = editedBadge.requiredValue || editedBadge.min || 0;
    
    if (editingBadge.category === 'LEVEL') {
        const updatedLevels = getAllLevels().map((l, idx) => {
            if (idx + 1 === editingBadge.level) {
                return { ...l, min: requiredValue, title: editedBadge.title };
            }
            return l;
        });
        localStorage.setItem('aes-level-thresholds', JSON.stringify(updatedLevels));
    } else if (editingBadge.category === 'FOCUS') {
        const updatedFocusTitles = getAllFocusTitles().map((r, idx) => {
            if (idx + 1 === editingBadge.level) {
                return { ...r, min: requiredValue, title: editedBadge.title };
            }
            return r;
        });
        localStorage.setItem('aes-focus-thresholds', JSON.stringify(updatedFocusTitles));
    } else if (editingBadge.category === 'WEALTH') {
        const updatedWealthTitles = getAllWealthTitles().map((c, idx) => {
            if (idx + 1 === editingBadge.level) {
                return { ...c, min: requiredValue, title: editedBadge.title };
            }
            return c;
        });
        localStorage.setItem('aes-wealth-thresholds', JSON.stringify(updatedWealthTitles));
    } else if (editingBadge.category === 'COMBAT') {
        const updatedMilitaryRanks = getAllMilitaryRanks().map((r, idx) => {
            if (idx + 1 === editingBadge.level) {
                return { ...r, min: requiredValue, title: editedBadge.title };
            }
            return r;
        });
        localStorage.setItem('aes-combat-thresholds', JSON.stringify(updatedMilitaryRanks));
    }
    // ... Add more categories as needed or move logic to a hook
    
    resetEditCache(editingBadge.category);
    setEditingBadge(null);
    onForceRefresh();
  };

  return (
    <>
      <div className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-sm flex items-center justify-end p-4 animate-in fade-in">
        <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]' : isDark ? 'bg-zinc-900' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-white'} p-6 border ${isNeomorphicDark ? 'border-zinc-700' : isDark ? 'border-zinc-800' : isNeomorphic ? 'border-slate-300' : 'border-transparent'}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h2 className={`text-xl font-bold ${textMain}`}>
                <Edit3 size={20} className="inline-block mr-2 text-yellow-500" /> 勋章管理系统
              </h2>
              {onHelpClick && (
                <GlobalHelpButton 
                  helpId="achievements" 
                  onHelpClick={onHelpClick} 
                  size={16} 
                  variant="ghost" 
                />
              )}
            </div>
            <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? (isNeomorphicDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-800') : (isNeomorphic ? (isNeomorphicDark ? 'hover:bg-[#1e1e2e]' : 'hover:bg-[#e0e5ec]') : 'hover:bg-slate-100')}`}>
              <XCircle size={20} className={textSub} />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                {id:'ALL', l:'全部', i:Grid3X3}, {id:'LEVEL', l:'等级', i:Zap}, 
                {id:'FOCUS', l:'专注', i:Clock}, {id:'WEALTH', l:'财富', i:Wallet}, 
                {id:'COMBAT', l:'战斗', i:Target}, {id:'CHECKIN', l:'签到', i:Calendar}, 
                {id:'SPEND', l:'消费', i:ShoppingBag}, {id:'TASK', l:'任务勋章', i:List}
              ].map(group => (
                <button 
                  key={group.id}
                  onClick={() => {
                    setEditingBadge(null);
                    setEditingGroup(null);
                    resetEditCache(selectedCategory);
                    setSelectedCategory(group.id as any);
                  }}
                  className={`px-4 py-1.5 rounded-[24px] text-xs font-bold border flex items-center gap-1.5 whitespace-nowrap transition-all ${getButtonStyleLocal(selectedCategory === group.id)}`}
                >
                  <group.i size={12} /> {group.l}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="text-center">
              <button 
                className={`w-full py-1.5 rounded-[24px] text-xs font-bold border transition-all ${getButtonStyleLocal(false)}`}
                onClick={() => setEditingBadge({ id: `new-${Date.now()}`, title: '新勋章', subTitle: 'NEW', icon: Trophy, color: 'text-yellow-500', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/50', isUnlocked: false, req: '完成条件', progress: 0, rewardXp: 0, rewardGold: 0, category: selectedCategory === 'ALL' ? 'LEVEL' : selectedCategory, level: 1, min: 100, rewardRatio: 0.1 })}
              >
                <Plus size={12} className="inline-block mr-1" /> 新增勋章
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                {id:'LEVEL', l:'等级', i:Zap}, {id:'FOCUS', l:'专注', i:Clock}, 
                {id:'WEALTH', l:'财富', i:Wallet}, {id:'COMBAT', l:'战斗', i:Target}, 
                {id:'CHECKIN', l:'签到', i:Calendar}, {id:'SPEND', l:'消费', i:ShoppingBag}, 
                {id:'TASK', l:'任务勋章', i:List}
              ].filter(group => selectedCategory === 'ALL' || group.id === selectedCategory)
               .map(group => (
                <div key={group.id} className={`p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] ${isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(30,30,46,0.8)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(30,30,46,0.9)]' : isDark ? 'bg-zinc-800 hover:bg-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)]' : 'bg-slate-50 hover:bg-slate-100'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <group.i size={16} className="text-yellow-500" />
                      <span className={textMain}>{group.l}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className={`px-4 py-1.5 rounded-[24px] text-xs font-bold border transition-all ${getButtonStyleLocal(false)}`} onClick={() => setEditingGroup(group.id)}><Edit3 size={12} className={isDark ? 'text-yellow-400' : 'text-yellow-600'} /></button>
                      <button className={`px-4 py-1.5 rounded-[24px] text-xs font-bold border transition-all ${getButtonStyleLocal(false)}`}><Trash2 size={12} className={isDark ? 'text-red-400' : 'text-red-600'} /></button>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {allBadges.filter(badge => badge.category === group.id).map(badge => (
                      <div key={badge.id} className={`p-3 rounded-lg flex items-center justify-between transition-all duration-300 hover:scale-[1.02] group ${isNeomorphicDark ? 'bg-[#1e1e2e]/80 shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(30,30,46,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.9)]' : isDark ? 'bg-zinc-900/50 hover:bg-zinc-800/70' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-slate-50 hover:bg-slate-100'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-[1.1] ${badge.isUnlocked ? (isNeomorphic ? (isNeomorphicDark ? `bg-[#1e1e2e] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]` : `bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]`) : badge.bgColor) : (isNeomorphicDark ? 'bg-[#1e1e2e]/30' : isDark ? 'bg-zinc-900/30' : 'bg-slate-900/30')}`}>
                            <badge.icon size={20} className={`${badge.color} ${!badge.isUnlocked ? 'opacity-70' : ''}`} strokeWidth={2} />
                          </div>
                          <div className="flex-1">
                            <div className={`text-sm font-bold ${textMain} transition-all duration-300 group-hover:scale-[1.05]`}>{badge.title}</div>
                            <div className={`text-xs ${textSub}`}>{badge.req}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-70 transition-opacity duration-300 group-hover:opacity-100">
                          <button className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold border transition-all ${getButtonStyleLocal(false)}`} onClick={() => setEditingBadge(badge)}><Edit3 size={12} className={isDark ? 'text-yellow-400' : 'text-yellow-600'} /></button>
                          <button className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold border transition-all ${getButtonStyleLocal(false)}`} onClick={() => { const updatedClaimedBadges = claimedBadges.filter(id => id !== badge.id); localStorage.setItem('claimedBadges', JSON.stringify(updatedClaimedBadges)); onForceRefresh(); }}><RotateCw size={12} className={isDark ? 'text-blue-400' : 'text-blue-600'} /></button>
                          <button className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold border transition-all ${getButtonStyleLocal(false)}`}><Trash2 size={12} className={isDark ? 'text-red-400' : 'text-red-600'} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <button className={`w-full py-1.5 rounded-[24px] text-xs font-bold border transition-all ${getButtonStyleLocal(false)}`}><Plus size={12} className="inline-block mr-1" /> 新增分组</button>
            </div>
          </div>
        </div>
      </div>

      <EditGroupModal 
        editingGroup={editingGroup} 
        onClose={() => setEditingGroup(null)} 
        isDark={isDark} 
        isNeomorphic={isNeomorphic} 
        isNeomorphicDark={isNeomorphicDark} 
        textMain={textMain} 
        textSub={textSub} 
      />
      
      <EditBadgeModal 
        editingBadge={editingBadge} 
        badgeEditCache={badgeEditCache} 
        setBadgeEditCache={setBadgeEditCache} 
        onClose={() => setEditingBadge(null)} 
        onSave={handleSaveBadge} 
        isDark={isDark} 
        isNeomorphic={isNeomorphic} 
        isNeomorphicDark={isNeomorphicDark} 
        textMain={textMain} 
        textSub={textSub} 
        onHelpClick={onHelpClick}
      />
    </>
  );
};

export default BadgeManagementModal;
