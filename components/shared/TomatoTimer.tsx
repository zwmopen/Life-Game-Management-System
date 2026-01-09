import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, VolumeX, Volume2, Maximize2, Sun, Moon, Coffee, Dumbbell, BookOpen, Activity, Waves, CloudRain, Trees, BrainCircuit, HelpCircle } from 'lucide-react';
import { Theme } from '../../types';

interface Sound {
  id: string;
  name: string;
  url: string;
  icon: React.ElementType;
  color: string;
  hex: string;
}

interface TomatoTimerProps {
  theme: Theme;
  timeLeft: number;
  isActive: boolean;
  duration: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onChangeDuration: (minutes: number) => void;
  onUpdateTimeLeft: (seconds: number) => void;
  onUpdateIsActive: (active: boolean) => void;
  onImmersiveModeChange?: (isImmersive: boolean) => void;
  onInternalImmersiveModeChange?: (isInternalImmersive: boolean) => void;
  onHelpClick?: (helpId: string) => void;
}

// --- SOUNDS ---
const SOUNDS: Sound[] = [
  { id: 'mute', name: '静音', url: "", icon: VolumeX, color: 'text-zinc-500', hex: '#6b7280' }, // 添加静音选项作为第一个
  { id: 'forest', name: '迷雾森林', url: "/audio/bgm/forest.mp3", icon: Trees, color: 'text-green-600', hex: '#16a34a' },
  { id: 'alpha', name: '阿尔法波', url: "/audio/bgm/alpha.mp3", icon: Waves, color: 'text-purple-500', hex: '#a855f7' },
  { id: 'theta', name: '希塔波', url: "/audio/bgm/theta.mp3", icon: CloudRain, color: 'text-emerald-500', hex: '#10b981' }, 
  { id: 'beta', name: '贝塔波', url: "/audio/bgm/beta.mp3", icon: BrainCircuit, color: 'text-blue-500', hex: '#3b82f6' },
  { id: 'ocean', name: '海浪声', url: "/audio/bgm/ocean.mp3", icon: Waves, color: 'text-blue-600', hex: '#2563eb' },
  { id: 'rain', name: '雨声', url: "/audio/bgm/rain.mp3", icon: CloudRain, color: 'text-gray-500', hex: '#6b7280' },
  { id: 'night', name: '夏夜虫鸣', url: "/audio/bgm/night.mp3", icon: Moon, color: 'text-indigo-600', hex: '#4f46e5' },
  { id: 'white-noise', name: '白噪音', url: "/audio/bgm/white-noise.mp3", icon: Coffee, color: 'text-amber-500', hex: '#f59e0b' },
  { id: 'pink-noise', name: '粉红噪音', url: "/audio/bgm/pink-noise.mp3", icon: Coffee, color: 'text-rose-500', hex: '#ec4899' },
  { id: 'brown-noise', name: '布朗噪音', url: "/audio/bgm/brown-noise.mp3", icon: Coffee, color: 'text-orange-600', hex: '#ea580c' },
  { id: 'cafe', name: '咖啡馆环境', url: "/audio/bgm/cafe.mp3", icon: Coffee, color: 'text-amber-600', hex: '#d97706' },
  { id: 'fireplace', name: '壁炉声', url: "/audio/bgm/fireplace.mp3", icon: Coffee, color: 'text-red-500', hex: '#ef4444' },
];

const TomatoTimer: React.FC<TomatoTimerProps> = ({
  theme,
  timeLeft,
  isActive,
  duration,
  onToggleTimer,
  onResetTimer,
  onChangeDuration,
  onUpdateTimeLeft,
  onUpdateIsActive,
  onImmersiveModeChange,
  onInternalImmersiveModeChange,
  onHelpClick
}) => {
  const [currentSoundId, setCurrentSoundId] = useState('mute');
  const [originalSoundId, setOriginalSoundId] = useState('forest'); // 默认播放的音乐
  const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false);
  // 移除本地isImmersive状态，使用父组件传递的onImmersiveModeChange回调
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isDark = theme === 'dark';
  const isNeomorphic = theme === 'neomorphic';
  const cardBg = isNeomorphic
    ? 'bg-[#e0e5ec] border-[#a3b1c6] rounded-lg shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] transition-all duration-300'
    : isDark
    ? 'bg-zinc-900 border-zinc-800'
    : 'bg-white border-slate-200';

  const currentSound = SOUNDS.find(s => s.id === currentSoundId) || SOUNDS[0];

  // Current date and time effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => onUpdateTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      onUpdateIsActive(false);
      // 使用soundManager播放成功音效
      import('../../utils/soundManager').then(({ default: soundManager }) => {
        soundManager.play('taskComplete');
      });
      onUpdateTimeLeft(duration * 60);
      // 当计时器结束时，通知父组件退出沉浸式模式
      if (onImmersiveModeChange) {
        onImmersiveModeChange(false);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, duration, onUpdateTimeLeft, onUpdateIsActive, onImmersiveModeChange]);

  // Audio management
  useEffect(() => {
    let audioSrc = '';
    let shouldPlay = false;
    let targetSoundId = currentSoundId;
    
    // 当番茄钟启动时，使用用户选择的音乐
    if (isActive) {
      // 如果用户选择了静音，则不播放音乐
      if (targetSoundId !== 'mute') {
        const targetSound = SOUNDS.find(s => s.id === targetSoundId) || SOUNDS[1];
        audioSrc = targetSound.url;
        shouldPlay = true;
      }
    }
    
    // If no audio source, don't create audio object
    if (!audioSrc) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      return;
    }

    // Create new Audio object if needed
    let newAudio = audioRef.current;
    if (!newAudio || newAudio.src !== audioSrc) {
      if (newAudio) {
        newAudio.pause();
        newAudio.src = '';
      }
      newAudio = new Audio(audioSrc);
      newAudio.loop = true;
      newAudio.volume = 0.3;
      audioRef.current = newAudio;
    }
    
    // Play or pause audio based on timer state
    if (shouldPlay) {
      newAudio.play().catch((error) => {
        console.log('Audio play failed, possibly due to browser autoplay policy:', error);
      });
    } else {
      newAudio.pause();
    }
    
    return () => {
      if (newAudio) {
        newAudio.pause();
        newAudio.src = '';
      }
    };
  }, [isActive, currentSoundId]);

  // 移除本地沉浸式状态管理，完全由父组件控制

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate progress for circular timer
  const progress = (timeLeft / (duration * 60)) * 100;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Format current date and time
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWeekday = (date: Date) => {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
  };

  const formatCurrentTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* 番茄钟系统标题 */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
          <Coffee size={12}/> 番茄钟系统
        </div>
        {onHelpClick && (
          <div className={`p-0.5 rounded-full transition-all duration-300 hover:scale-[1.1] ${isNeomorphic ? 'hover:bg-blue-500/10' : 'hover:bg-blue-500/20'}`}>
            <button onClick={() => onHelpClick('pomodoro')} className="transition-colors">
              <HelpCircle size={16} className="text-zinc-500 hover:text-white transition-colors" />
            </button>
          </div>
        )}
      </div>
      
      {/* 背景音乐选择菜单 */}
      {isSoundMenuOpen && (
        <div className={`absolute top-0 right-0 mt-16 mr-2 rounded-xl shadow-lg p-4 backdrop-blur-sm z-50 ${isNeomorphic ? 'bg-[#e0e5ec]/95 border border-slate-300' : isDark ? 'bg-zinc-900/95 border border-zinc-800' : 'bg-white/95 border border-slate-200'}`}>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {SOUNDS.map(sound => {
              const IconComponent = sound.icon;
              return (
                <button 
                  key={sound.id}
                  onClick={() => {
                    setCurrentSoundId(sound.id);
                    setIsSoundMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${currentSoundId === sound.id ? (isNeomorphic ? 'bg-[#d0d5dc] text-blue-600' : isDark ? 'bg-zinc-800 text-white' : 'bg-blue-50 text-blue-600') : (isNeomorphic ? 'hover:bg-[#d0d5dc]' : isDark ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-700')}`}
                >
                  <IconComponent size={16} className={sound.color} />
                  <span className="text-xs font-medium">{sound.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* 主内容区域：日期时间→计时器→按钮的水平布局 */}
      <div className="flex items-center gap-3 w-full">
        {/* 左侧：日期时间周几 */}
        <div className="text-xs text-zinc-500 flex-shrink-0">
          <div>{formatDate(currentDateTime)}</div>
          <div>{formatCurrentTime(currentDateTime)} {getWeekday(currentDateTime)}</div>
        </div>
        
        {/* 中间：圆形计时器 */}
        <div className="flex-shrink-0">
          {/* Circular Timer */}
          <div className={`relative flex items-center justify-center p-2 rounded-full transition-all duration-300 hover:scale-105 ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]' : 'hover:bg-white/5'}`}>
            <svg width={90} height={90} viewBox="0 0 100 100">
              {/* Background circle - 进一步扩大半径，更接近边缘 */}
              <circle
                cx="50"
                cy="50"
                r={45}
                fill="none"
                stroke={isDark ? '#374151' : isNeomorphic ? '#d0d5dc' : '#e5e7eb'}
                strokeWidth="4"
              />
              {/* Progress circle - 进一步扩大半径，更接近边缘 */}
              <circle
                cx="50"
                cy="50"
                r={45}
                fill="none"
                stroke={isActive ? '#2563eb' : '#6b7280'}
                strokeWidth="8"
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 - (progress / 100) * (2 * Math.PI * 45)}
                className="transition-all duration-100 ease-linear"
              />
            </svg>
            {/* Timer display */}
            <div className={`absolute flex flex-col items-center`}>
              <div className={`text-lg font-mono font-bold ${isDark ? 'text-white' : 'text-slate-800'} tabular-nums`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>
        
        {/* 右侧：按钮区域 - 优化按钮大小 */}
        <div className="flex flex-col items-end gap-1 flex-1">
          {/* 沉浸式模式按钮 */}
          <div className="flex gap-1.5">
            {/* Internal immersive mode button */}
            <button
              onClick={() => onInternalImmersiveModeChange && onInternalImmersiveModeChange(true)}
              className={`p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${isNeomorphic
                ? `bg-[#e0e5ec] border border-slate-300 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] text-green-600`
                : `bg-green-500/20 text-green-500 hover:bg-green-500/30`}`}
              title="沉浸式全屏"
            >
              🌲
            </button>
          </div>
          
          {/* 播放/全屏按钮 */}
          <div className="flex gap-1.5">
            {/* Play/pause button */}
            <button
              onClick={onToggleTimer}
              className={`p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${isNeomorphic
                ? `bg-[#e0e5ec] border border-slate-300 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${isActive ? 'text-red-500' : 'text-orange-500'}`
                : `${isActive ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30'}`}`}
            >
              {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
            
            {/* Fullscreen button */}
            <button
              onClick={() => onImmersiveModeChange && onImmersiveModeChange(true)}
              className={`p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${isNeomorphic ? 'bg-[#e0e5ec] border border-slate-300 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] text-zinc-600' : 'text-zinc-500 hover:text-blue-400 hover:bg-white/10'}`}
              title="全屏模式"
            >
              <Maximize2 size={18} />
            </button>
            
            {/* 背景音乐切换按钮 */}
            <button 
              onClick={() => setIsSoundMenuOpen(!isSoundMenuOpen)} 
              className={`p-2.5 rounded-full transition-all duration-300 hover:scale-105 ${isNeomorphic 
                ? 'bg-[#e0e5ec] border border-slate-300 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] text-zinc-600' 
                : 'text-zinc-500 hover:text-blue-400 hover:bg-white/10'}`}
              title={currentSoundId === 'mute' ? '开启音效' : '切换音效'}
            >
              {currentSoundId === 'mute' ? <VolumeX size={18} /> : <Waves size={18} />}
            </button>
          </div>
          
          {/* 预设时间按钮：加回60分钟 - 缩小按钮 */}
          <div className="flex gap-1">
            {[25, 45, 60].map(m => (
              <button key={m}
                onClick={() => onChangeDuration(m)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all duration-300 hover:scale-105 ${isNeomorphic
                  ? `bg-[#e0e5ec] border border-slate-300 shadow-[2px_2px_4px_rgba(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,1)] hover:shadow-[1px_1px_2px_rgba(163,177,198,0.6),-1px_-1px_2px_rgba(255,255,255,1)] active:shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)] ${duration === m ? 'text-blue-600 font-bold' : 'text-zinc-600'}`
                  : duration === m ?
                    (isDark ? 'bg-zinc-700 text-white border-zinc-600' : 'bg-blue-600 text-white border-blue-500') :
                    (isDark ? 'text-zinc-500 border-zinc-700 hover:text-zinc-300 hover:bg-zinc-800' : 'text-slate-600 border-slate-300 hover:text-slate-800 hover:bg-slate-100')
                }`}
              >
                {m}'
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TomatoTimer;