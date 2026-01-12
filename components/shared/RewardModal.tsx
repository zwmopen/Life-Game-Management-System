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

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-500"
      onClick={() => onClose(badge.id, rewardXp, rewardGold)} // 点击空白关闭
    >
      <div 
        className="flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-500 max-w-sm w-full bg-zinc-900 border border-yellow-500/30 p-6 rounded-md relative overflow-hidden"
        onClick={(e) => e.stopPropagation()} // 防止点击卡片内部触发关闭
      >
        {/* 背景光效 */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-purple-500/20 opacity-30"></div>
        
        {/* 关闭按钮 */}
        <button 
          onClick={() => onClose(badge.id, rewardXp, rewardGold)} 
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10"
          aria-label="关闭"
        >
          <X size={20} />
        </button>
        
        {/* 烟火特效图标 */}
        <div className="relative z-10">
          <div className={`absolute inset-0 ${iconColor.replace('text-', 'bg-')}/30 blur-[80px] rounded-full animate-pulse`}></div>
          <div className="relative text-[100px] animate-[spin_3s_linear_infinite]">
            <Sparkles className="text-white opacity-30 absolute -top-10 -left-10 animate-pulse" size={40}/>
            <Sparkles className="text-white opacity-30 absolute top-20 -right-10 animate-pulse" size={30}/>
            <Sparkles className="text-white opacity-30 absolute -bottom-10 left-10 animate-pulse" size={30}/>
            <IconComp className={`${iconColor} ${animationClass}`} size={100} strokeWidth={1.5}/>
          </div>
        </div>
        
        {/* 成就标题 */}
        <div className="w-full z-10">
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">成就达成</h2>
          <div className={`text-xl font-bold ${badge.color}`}>{badge.title}</div>
          <div className="text-zinc-400 font-mono mt-1">{badge.subTitle}</div>
        </div>
        
        {/* 奖励信息 */}
        <div className="w-full flex justify-around items-center pt-2 border-t border-zinc-800 z-10">
          <div className="flex flex-col items-center">
            <div className="text-xs text-zinc-500 font-bold uppercase mb-1">经验奖励</div>
            <div className={`text-2xl font-black ${rewardXp > 0 ? 'text-blue-400' : 'text-zinc-600'} animate-bounce`}>+{rewardXp}</div>
          </div>
          <div className="w-px h-10 bg-zinc-800"></div>
          <div className="flex flex-col items-center">
            <div className="text-xs text-zinc-500 font-bold uppercase mb-1">金币奖励</div>
            <div className={`text-2xl font-black ${rewardGold > 0 ? 'text-yellow-400' : 'text-zinc-600'} animate-bounce`}>+{rewardGold}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardModal;
