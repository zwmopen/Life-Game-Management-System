import React from 'react';
import { Sparkles, Coins, Star, Clock, Dice5 } from 'lucide-react';
import { DiceCategory, DiceTask } from '../../types';
import { useGlobalAudio } from '../GlobalAudioManagerOptimized';

interface FateGiftModalProps {
  task: DiceTask & { _generatedGold?: number; _generatedXp?: number };
  isSpinning: boolean;
  onComplete: () => void;
  onLater: () => void;
  onSkip: () => void;
  onStartTimer: (duration: number) => void;
  theme?: 'dark' | 'light' | 'neomorphic';
  onModalOpen?: () => void;
}

const FateGiftModal: React.FC<FateGiftModalProps> = ({
  task,
  isSpinning,
  onComplete,
  onLater,
  onSkip,
  onStartTimer,
  theme = 'dark',
  onModalOpen
}) => {
  const { playSoundEffect } = useGlobalAudio();
  
  const isNeomorphic = theme.startsWith('neomorphic');
  const isDark = theme === 'neomorphic-dark';
  
  // 在组件挂载时触发onModalOpen回调
  React.useEffect(() => {
    if (onModalOpen) {
      onModalOpen();
    }
  }, [onModalOpen]);
  
  // 统一使用拟态主题色
  const cardBg = isNeomorphic 
    ? (isDark ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]') 
    : 'bg-transparent';
  const textMain = isDark ? 'text-white' : 'text-slate-700';
  const textSub = isDark ? 'text-zinc-400' : 'text-slate-500';

  const getTaskCategoryLabel = (category: DiceCategory) => {
    switch (category) {
      case DiceCategory.HEALTH:
        return '健康微行动';
      case DiceCategory.EFFICIENCY:
        return '效率任务';
      case DiceCategory.LEISURE:
        return '休闲小奖励';
      default:
        return '未知任务';
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className={`w-full max-w-md p-8 rounded-2xl ${cardBg} relative transform transition-all duration-500 animate-in zoom-in`}
           style={{
             boxShadow: isNeomorphic 
               ? (isDark 
                   ? '10px 10px 20px rgba(10, 10, 20, 0.6), -10px -10px 20px rgba(40, 40, 60, 0.8), inset 1px 1px 2px rgba(90, 90, 110, 0.3), inset -1px -1px 2px rgba(10, 10, 20, 0.6)'
                   : '10px 10px 20px rgba(163, 177, 198, 0.6), -10px -10px 20px rgba(255, 255, 255, 1), inset 1px 1px 2px rgba(255, 255, 255, 0.9), inset -1px -1px 2px rgba(163, 177, 198, 0.3)')
               : '0 20px 60px rgba(0, 0, 0, 0.5)'
           }}>
        
        <h3 className={`font-bold mb-6 ${textMain} flex items-center justify-center gap-2 text-2xl`}>
          <Sparkles size={28} className="text-yellow-500 animate-pulse drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]" />
          <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent animate-pulse">命运礼物</span>
        </h3>
        
        <div className="space-y-8">
          {/* 骰子结果 */}
          <div className="text-center">
            {/* 3D骰子展示 - 增强立体效果 */}
            <div className="relative inline-block">
              {/* 骰子投影 */}
              <div className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-40 h-10 bg-black/25 blur-2xl rounded-full ${isSpinning ? 'animate-[spin_1s_linear_infinite]' : ''}`}></div>
              
              <div className={`${isSpinning ? 'animate-[spin_1s_linear_infinite]' : ''} relative`}>
                <Dice5 size={100} className="text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)] relative z-10" />
              </div>
              
              {/* 骰子光效增强 */}
              <div className="absolute inset-0 rounded-full bg-yellow-500/40 blur-xl animate-pulse"></div>
              <div className="absolute inset-0 rounded-full bg-white/20 blur-lg opacity-30"></div>
            </div>
            
            <h4 className={`text-xl font-bold ${textMain} mb-3 mt-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(139,92,246,0.3)]`}>
              {getTaskCategoryLabel(task.category)}
            </h4>
            
            <p className={`text-lg ${textMain} font-medium p-5 rounded-xl backdrop-blur-sm transition-all duration-300 hover:shadow-lg`}
               style={{
                 backgroundColor: isNeomorphic 
                   ? (isDark ? '#1e1e2e' : '#e0e5ec')
                   : (isDark ? '#1e1e2e' : '#e0e5ec'),
                 boxShadow: isNeomorphic 
                   ? (isDark 
                       ? 'inset 3px 3px 6px rgba(10, 10, 20, 0.6), inset -3px -3px 6px rgba(40, 40, 60, 0.8)'
                       : 'inset 3px 3px 6px rgba(163, 177, 198, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 0.8)')
                   : (isDark 
                       ? 'inset 3px 3px 6px rgba(10, 10, 20, 0.6), inset -3px -3px 6px rgba(40, 40, 60, 0.8)'
                       : 'inset 3px 3px 6px rgba(163, 177, 198, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 0.8)')
               }}>
              {task.text}
            </p>
          </div>
          
          {/* 奖励信息 - 增强立体卡片 */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className={`p-5 rounded-xl transition-all duration-300 hover:shadow-xl relative overflow-hidden`}
                 style={{
                   backgroundColor: isNeomorphic 
                     ? (isDark ? '#1e1e2e' : '#e0e5ec')
                     : (isDark ? '#1e1e2e' : '#e0e5ec'),
                   boxShadow: isNeomorphic 
                     ? (isDark 
                         ? '5px 5px 10px rgba(10, 10, 20, 0.6), -5px -5px 10px rgba(40, 40, 60, 0.8), inset 1px 1px 2px rgba(40, 40, 50, 0.3), inset -1px -1px 2px rgba(10, 10, 20, 0.6)'
                         : '5px 5px 10px rgba(163, 177, 198, 0.4), -5px -5px 10px rgba(255, 255, 255, 0.8), inset 1px 1px 2px rgba(255, 255, 255, 0.9), inset -1px -1px 2px rgba(163, 177, 198, 0.3)')
                     : (isDark 
                         ? '5px 5px 10px rgba(10, 10, 20, 0.6), -5px -5px 10px rgba(40, 40, 60, 0.8), inset 1px 1px 2px rgba(40, 40, 50, 0.3), inset -1px -1px 2px rgba(10, 10, 20, 0.6)'
                         : '5px 5px 10px rgba(163, 177, 198, 0.4), -5px -5px 10px rgba(255, 255, 255, 0.8), inset 1px 1px 2px rgba(255, 255, 255, 0.9), inset -1px -1px 2px rgba(163, 177, 198, 0.3)')
                 }}>
              <div className={`text-xs ${textSub} mb-2`}>金币</div>
              <div className="text-lg font-bold text-yellow-500 flex items-center justify-center gap-1 relative z-10">
                <Coins size={20} className="drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                +{task._generatedGold || 0}
              </div>
              {/* 奖励卡片光效 */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-500/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            
            <div className={`p-5 rounded-xl transition-all duration-300 hover:shadow-xl relative overflow-hidden`}
                 style={{
                   backgroundColor: isNeomorphic 
                     ? (isDark ? '#1e1e2e' : 'rgba(224, 229, 236, 0.9)')
                     : isDark 
                       ? '#18181b' 
                       : 'rgba(255, 255, 255, 0.9)',
                   boxShadow: isNeomorphic 
                     ? (isDark 
                         ? '5px 5px 10px rgba(10, 10, 20, 0.6), -5px -5px 10px rgba(40, 40, 60, 0.8), inset 1px 1px 2px rgba(40, 40, 50, 0.3), inset -1px -1px 2px rgba(10, 10, 20, 0.6)'
                         : '5px 5px 10px rgba(163, 177, 198, 0.4), -5px -5px 10px rgba(255, 255, 255, 0.8), inset 1px 1px 2px rgba(255, 255, 255, 0.9), inset -1px -1px 2px rgba(163, 177, 198, 0.3)')
                     : isDark 
                       ? '5px 5px 10px rgba(0, 0, 0, 0.6), -5px -5px 10px rgba(30, 30, 30, 0.8)'
                       : '3px 3px 6px rgba(0, 0, 0, 0.1), -1px -1px 3px rgba(255, 255, 255, 0.8)'
                 }}>
              <div className={`text-xs ${textSub} mb-2`}>经验</div>
              <div className="text-lg font-bold text-purple-500 flex items-center justify-center gap-1 relative z-10">
                <Star size={20} className="drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                +{task._generatedXp || 0}
              </div>
              {/* 奖励卡片光效 */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            
            {task.duration && (
              <div className={`p-5 rounded-xl transition-all duration-300 hover:shadow-xl relative overflow-hidden`}
                   style={{
                     backgroundColor: isNeomorphic 
                       ? (isDark ? '#1e1e2e' : '#e0e5ec')
                       : (isDark ? '#1e1e2e' : '#e0e5ec'),
                     boxShadow: isNeomorphic 
                       ? (isDark 
                           ? '5px 5px 10px rgba(10, 10, 20, 0.6), -5px -5px 10px rgba(40, 40, 60, 0.8), inset 1px 1px 2px rgba(40, 40, 50, 0.3), inset -1px -1px 2px rgba(10, 10, 20, 0.6)'
                           : '5px 5px 10px rgba(163, 177, 198, 0.4), -5px -5px 10px rgba(255, 255, 255, 0.8), inset 1px 1px 2px rgba(255, 255, 255, 0.9), inset -1px -1px 2px rgba(163, 177, 198, 0.3)')
                       : (isDark 
                           ? '5px 5px 10px rgba(10, 10, 20, 0.6), -5px -5px 10px rgba(40, 40, 60, 0.8), inset 1px 1px 2px rgba(40, 40, 50, 0.3), inset -1px -1px 2px rgba(10, 10, 20, 0.6)'
                           : '5px 5px 10px rgba(163, 177, 198, 0.4), -5px -5px 10px rgba(255, 255, 255, 0.8), inset 1px 1px 2px rgba(255, 255, 255, 0.9), inset -1px -1px 2px rgba(163, 177, 198, 0.3)')
                   }}>
                <div className={`text-xs ${textSub} mb-2`}>时长</div>
                <div className="text-lg font-bold text-blue-500 flex items-center justify-center gap-1 relative z-10">
                  <Clock size={20} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                  {task.duration} 分钟
                </div>
                {/* 奖励卡片光效 */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            )}
          </div>
          
          {/* 操作按钮 - 拟态设计增强 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {task.duration && (
              <button 
                onClick={() => {
                  onStartTimer(task.duration);
                  onLater();
                }}
                className={`py-3.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden`}
                style={{
                  backgroundColor: isNeomorphic 
                    ? (isDark ? '#1e1e2e' : '#e0e5ec') 
                    : (isDark ? '#1e1e2e' : '#e0e5ec'),
                  color: isNeomorphic ? (isDark ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.95)') : (isDark ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.95)'),
                  boxShadow: isNeomorphic 
                    ? (isDark 
                        ? '5px 5px 10px rgba(10, 10, 20, 0.6), -5px -5px 10px rgba(40, 40, 60, 0.8), inset 0 0 0 rgba(59, 130, 246, 0)' 
                        : '5px 5px 10px rgba(163, 177, 198, 0.6), -5px -5px 10px rgba(255, 255, 255, 1), inset 0 0 0 rgba(59, 130, 246, 0)') 
                    : (isDark 
                        ? '5px 5px 10px rgba(10, 10, 20, 0.6), -5px -5px 10px rgba(40, 40, 60, 0.8), inset 0 0 0 rgba(59, 130, 246, 0)' 
                        : '5px 5px 10px rgba(163, 177, 198, 0.6), -5px -5px 10px rgba(255, 255, 255, 1), inset 0 0 0 rgba(59, 130, 246, 0)'),
                  border: 'none'
                }}
              >
                <span className="relative z-10">开始</span>
                {/* 按钮光效 */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </button>
            )}
            
            <button 
              onClick={() => {
                playSoundEffect('achievement');
                onComplete();
              }}
              className={`py-3.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden`}
              style={{
                backgroundColor: isNeomorphic 
                  ? (isDark ? '#1e1e2e' : '#e0e5ec') 
                  : (isDark ? '#1e1e2e' : '#e0e5ec'),
                color: isNeomorphic ? (isDark ? 'rgba(16, 185, 129, 0.9)' : 'rgba(16, 185, 129, 0.95)') : (isDark ? 'rgba(16, 185, 129, 0.9)' : 'rgba(16, 185, 129, 0.95)'),
                boxShadow: isNeomorphic 
                  ? (isDark 
                      ? '5px 5px 10px rgba(10, 10, 20, 0.6), -5px -5px 10px rgba(40, 40, 60, 0.8), inset 0 0 0 rgba(16, 185, 129, 0)' 
                      : '5px 5px 10px rgba(163, 177, 198, 0.6), -5px -5px 10px rgba(255, 255, 255, 1), inset 0 0 0 rgba(16, 185, 129, 0)') 
                  : (isDark 
                      ? '5px 5px 10px rgba(10, 10, 20, 0.6), -5px -5px 10px rgba(40, 40, 60, 0.8), inset 0 0 0 rgba(16, 185, 129, 0)' 
                      : '5px 5px 10px rgba(163, 177, 198, 0.6), -5px -5px 10px rgba(255, 255, 255, 1), inset 0 0 0 rgba(16, 185, 129, 0)'),
                border: 'none'
              }}
            >
              <span className="relative z-10">已完成</span>
              {/* 按钮光效 */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </button>
            
            <button 
              onClick={onLater}
              className={`py-3.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden`}
              style={{
                backgroundColor: isNeomorphic 
                  ? (isDark ? '#1e1e2e' : '#e0e5ec') 
                  : (isDark ? '#1e1e2e' : '#e0e5ec'),
                color: isNeomorphic ? (isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)') : (isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'),
                boxShadow: isNeomorphic 
                  ? (isDark 
                      ? '5px 5px 10px rgba(10, 10, 20, 0.6), -5px -5px 10px rgba(40, 40, 60, 0.8), inset 0 0 0 rgba(255, 255, 255, 0)' 
                      : '5px 5px 10px rgba(163, 177, 198, 0.6), -5px -5px 10px rgba(255, 255, 255, 1), inset 0 0 0 rgba(255, 255, 255, 0)') 
                  : (isDark 
                      ? '5px 5px 10px rgba(10, 10, 20, 0.6), -5px -5px 10px rgba(40, 40, 60, 0.8), inset 0 0 0 rgba(255, 255, 255, 0)' 
                      : '5px 5px 10px rgba(163, 177, 198, 0.6), -5px -5px 10px rgba(255, 255, 255, 1), inset 0 0 0 rgba(255, 255, 255, 0)'),
                border: 'none'
              }}
            >
              <span className="relative z-10">稍后做</span>
              {/* 按钮光效 */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </button>
            
            <button 
              onClick={onSkip}
              className={`py-3.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden`}
              style={{
                backgroundColor: isNeomorphic 
                  ? (isDark ? '#1e1e2e' : '#e0e5ec') 
                  : (isDark ? '#1e1e2e' : '#e0e5ec'),
                color: isNeomorphic ? (isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)') : (isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'),
                boxShadow: isNeomorphic 
                  ? (isDark 
                      ? '5px 5px 10px rgba(10, 10, 20, 0.6), -5px -5px 10px rgba(40, 40, 60, 0.8), inset 0 0 0 rgba(255, 255, 255, 0)' 
                      : '5px 5px 10px rgba(163, 177, 198, 0.6), -5px -5px 10px rgba(255, 255, 255, 1), inset 0 0 0 rgba(255, 255, 255, 0)') 
                  : (isDark 
                      ? '5px 5px 10px rgba(10, 10, 20, 0.6), -5px -5px 10px rgba(40, 40, 60, 0.8), inset 0 0 0 rgba(255, 255, 255, 0)' 
                      : '5px 5px 10px rgba(163, 177, 198, 0.6), -5px -5px 10px rgba(255, 255, 255, 1), inset 0 0 0 rgba(255, 255, 255, 0)'),
                border: 'none'
              }}
            >
              <span className="relative z-10">跳过</span>
              {/* 按钮光效 */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FateGiftModal;