import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Zap, Clock, Wallet, ShoppingBag, Target, Flame, Sparkles, X } from 'lucide-react';

interface RewardModalProps {
  badge: any;
  onClose: (id: string, xp: number, gold: number) => void;
}

const RewardModal: React.FC<RewardModalProps> = ({ badge, onClose }) => {
  let threshold = 0;
  if (badge.min) threshold = badge.min;
  else if (badge.val) threshold = badge.val;
  else {
    const numMatch = badge.subTitle.match(/(\d+)/);
    if (numMatch) threshold = parseInt(numMatch[0]);
  }
  if (threshold === 0) threshold = 1;
  const standardReward = Math.max(1, Math.floor(threshold * 0.1));
  let rewardGold = 0;
  let rewardXp = 0;
  let IconComp = Star;
  let iconColor = 'text-yellow-400';
  let animationClass = 'animate-spin-slow';

  if (badge.id.startsWith('lvl')) { 
    rewardXp = standardReward; rewardGold = standardReward; IconComp = Zap; iconColor = 'text-blue-500'; animationClass = 'animate-pulse';
  } 
  else if (badge.id.startsWith('rank')) { 
    rewardXp = 0; rewardGold = Math.max(10, standardReward * 5); IconComp = Clock; iconColor = 'text-emerald-500'; animationClass = 'animate-bounce';
  }
  else if (badge.id.startsWith('class')) { 
    rewardXp = 0; rewardGold = Math.max(5, Math.floor(threshold * 0.05)); IconComp = Wallet; iconColor = 'text-yellow-500'; animationClass = 'animate-pulse';
  }
  else if (badge.id.startsWith('consume')) {
    rewardXp = 0; rewardGold = Math.floor(threshold * 0.1); IconComp = ShoppingBag; iconColor = 'text-orange-500'; animationClass = 'animate-bounce';
  }
  else if (badge.id.startsWith('combat')) { 
    rewardXp = threshold * 10; rewardGold = threshold * 10; IconComp = Target; iconColor = 'text-red-500'; animationClass = 'animate-bounce';
  }
  else if (badge.id.startsWith('check')) {
    rewardXp = threshold * 10; rewardGold = threshold * 10; IconComp = Flame; iconColor = 'text-purple-500'; animationClass = 'animate-pulse';
  }
  if (badge.iconName === 'Target') IconComp = Target;

  useEffect(() => {
    // 自动关闭定时器 - 2秒后自动关闭
    const autoCloseTimer = setTimeout(() => {
      onClose(badge.id, rewardXp, rewardGold);
    }, 2000);

    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
    return () => {
      clearInterval(interval);
      clearTimeout(autoCloseTimer);
    };
  }, [badge.id, rewardXp, rewardGold, onClose]);

  // 添加音效播放
  useEffect(() => {
    // 播放成就解锁音效
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-unlocked-2065.mp3');
    audio.volume = 0.5;
    audio.play().catch(error => {
      if (process.env.NODE_ENV === 'development') {
        console.log('播放成就音效失败:', error);
      }
    });
  }, []);

  // 获取拟态样式
  const isNeomorphic = true; // 使用拟态风格
  const isDark = true; // 暗色主题
  const neomorphicBg = isDark ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]';
  const neomorphicShadow = isDark 
    ? 'shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)]' 
    : 'shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]';
  
  return (
    <div 
      className="fixed inset-0 z-[99999] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-500"
      onClick={() => onClose(badge.id, rewardXp, rewardGold)} // 点击空白关闭
    >
      <div 
        className={`flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-500 max-w-sm w-full ${neomorphicBg} ${neomorphicShadow} p-8 rounded-2xl relative overflow-visible transition-all duration-300`}
        onClick={(e) => e.stopPropagation()} // 防止点击卡片内部触发关闭
      >
        
        {/* 关闭按钮 - 采用拟态风格 */}
        <button 
          onClick={() => onClose(badge.id, rewardXp, rewardGold)} 
          className={`absolute top-3 right-3 rounded-full ${isDark ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5),inset_-4px_-4px_8px_rgba(30,30,46,0.9)]' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.7),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]'} transition-all z-10`}
          aria-label="关闭"
        >
          <X size={16} className={isDark ? 'text-zinc-400' : 'text-zinc-600'} />
        </button>
        
        {/* 烟火特效图标 */}
        <div className="relative z-10 mt-4">
          <div className={`absolute inset-0 ${iconColor.replace('text-', 'bg-')}/20 blur-[60px] rounded-full animate-pulse`}></div>
          <div className="relative text-[100px] animate-[spin_3s_linear_infinite]">
            <Sparkles className="text-white opacity-20 absolute -top-10 -left-10 animate-pulse" size={40}/>
            <Sparkles className="text-white opacity-20 absolute top-20 -right-10 animate-pulse" size={30}/>
            <Sparkles className="text-white opacity-20 absolute -bottom-10 left-10 animate-pulse" size={30}/>
            <div className={`${isDark ? 'shadow-[5px_5px_10px_rgba(0,0,0,0.5),-5px_-5px_10px_rgba(30,30,46,0.8)]' : 'shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)]'} p-4 rounded-full bg-gradient-to-br from-yellow-400/10 to-purple-500/10`}>
              <IconComp className={`${iconColor} ${animationClass}`} size={80} strokeWidth={1.5}/>
            </div>
          </div>
        </div>
        
        {/* 成就标题 */}
        <div className="w-full z-10 text-center -mt-4">
          <h2 className={`text-2xl font-black mb-2 uppercase tracking-widest ${isDark ? 'text-white' : 'text-zinc-900'}`}>成就达成</h2>
          <div className={`text-lg font-bold ${badge.color}`}>{badge.title}</div>
          <div className={`text-sm font-mono mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{badge.subTitle}</div>
        </div>
        
        {/* 奖励信息 - 拟态风格 */}
        <div className={`w-full flex justify-around items-center pt-4 z-10 ${isDark ? 'border-t border-[#3a3f4e]' : 'border-t border-[#caced5]'}`}>
          <div className="flex flex-col items-center">
            <div className={`text-xs font-bold uppercase mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>经验奖励</div>
            <div className={`text-xl font-black ${rewardXp > 0 ? 'text-blue-400' : 'text-zinc-600'} animate-bounce`}>+{rewardXp}</div>
          </div>
          <div className={`w-0.5 h-8 ${isDark ? 'bg-[#3a3f4e]' : 'bg-[#caced5]'}`}></div>
          <div className="flex flex-col items-center">
            <div className={`text-xs font-bold uppercase mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>金币奖励</div>
            <div className={`text-xl font-black ${rewardGold > 0 ? 'text-yellow-400' : 'text-zinc-600'} animate-bounce`}>+{rewardGold}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardModal;
