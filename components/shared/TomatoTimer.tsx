import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Maximize2, Coffee, Music } from 'lucide-react';
import Button from './Button';
import { GlobalHelpButton } from '../HelpSystem';
import { Theme } from '../../types';
import { useGlobalAudio } from '../GlobalAudioManagerOptimized';
import UnifiedBgMusicSelector from './UnifiedBgMusicSelector';

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
  // 使用全局音频上下文
  const { playSoundEffect } = useGlobalAudio();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false);
  
  // 引用用于点击外部关闭
  const musicButtonRef = useRef<HTMLButtonElement>(null);

  const isDark = theme.includes('dark');
  const isNeomorphic = theme.startsWith('neomorphic');

  
  const cardBg = isNeomorphic
    ? (theme === 'neomorphic-dark'
      ? 'bg-[#1e1e2e] border-[#1e1e2e] rounded-lg shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)] transition-all duration-300'
      : 'bg-[#e0e5ec] border-[#a3b1c6] rounded-lg shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] transition-all duration-300')
    : isDark
    ? 'bg-zinc-900 border-zinc-800'
    : 'bg-white border-slate-200';
  
  // Current date and time effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => onUpdateTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      onUpdateIsActive(false);
      // 使用全局音频上下文播放成功音效
      playSoundEffect('taskComplete');
      onUpdateTimeLeft(duration * 60);
      // 当计时器结束时，通知父组件退出沉浸式模式
      if (onImmersiveModeChange) {
        onImmersiveModeChange(false);
      }
    }
    // 移除暂停时退出全屏模式的逻辑，只在计时器结束时退出
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft, duration, onUpdateTimeLeft, onUpdateIsActive, onImmersiveModeChange]);

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
        <div className="flex flex-col gap-2 w-full relative">
      {/* 番茄钟系统标题 */}
      <div className="flex items-center justify-between">
        <div className={`text-xs uppercase font-bold flex items-center gap-1 ${theme === 'neomorphic-dark' ? 'text-zinc-400' : isNeomorphic ? 'text-zinc-600' : isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
          <Coffee size={12}/> 番茄钟系统
        </div>
        {onHelpClick && (
          <GlobalHelpButton 
            helpId="pomodoro" 
            onHelpClick={onHelpClick} 
            size={14} 
            className="hover:scale-[1.1]" 
          />
        )}
      </div>
      
      {/* 统一的背景音乐选择器 */}
      <UnifiedBgMusicSelector 
        theme={theme} 
        isVisible={isSoundMenuOpen} 
        onClose={() => setIsSoundMenuOpen(false)} 
        onHelpClick={onHelpClick}
        position="absolute" 
        className="absolute top-full right-0 mt-2 mr-2" 
      />
      
      {/* 主内容区域：日期时间→计时器→按钮的水平布局 */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        {/* 左侧：日期时间周几 - 在小屏幕上移到顶部 */}
        <div className="text-xs text-zinc-500 flex-shrink flex-grow-0 min-w-0 sm:text-right w-full sm:w-auto">
          <div className={`truncate ${theme === 'neomorphic-dark' ? 'text-zinc-300' : isNeomorphic ? 'text-zinc-600' : isDark ? 'text-zinc-400' : 'text-slate-600'}`}>{formatDate(currentDateTime)}</div>
          <div className={`truncate ${theme === 'neomorphic-dark' ? 'text-zinc-300' : isNeomorphic ? 'text-zinc-600' : isDark ? 'text-zinc-400' : 'text-slate-600'}`}>{formatCurrentTime(currentDateTime)} {getWeekday(currentDateTime)}</div>
        </div>
        
        {/* 中间：圆形计时器 - 在小屏幕上居中放置 */}
        <div className="flex-shrink flex-grow min-w-0 flex items-center justify-center w-full sm:w-auto">
          {/* Circular Timer */}
          <div className={`relative flex items-center justify-center p-2 rounded-full transition-all duration-300 hover:scale-105 aspect-square max-w-[90px] w-full h-full ${isNeomorphic 
            ? (theme === 'neomorphic-dark' 
                ? 'bg-[#1e1e2e] shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.5),-10px_-10px_20px_rgba(30,30,46,1)]' 
                : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]') 
            : 'hover:bg-white/5'}`}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full max-w-[90px] max-h-[90px] object-contain">
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
              <div className={`text-lg font-mono font-bold ${isDark ? 'text-white' : 'text-zinc-900'} tabular-nums`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>
        
        {/* 右侧：按钮区域 - 在小屏幕上移到底部 */}
        <div className="flex flex-col items-center sm:items-end gap-1 flex-1 min-w-0 w-full sm:w-auto">
          {/* 播放/全屏按钮 */}
          <div className="flex gap-1.5 justify-center sm:justify-end w-full sm:w-auto">
            {/* Play/pause button */}
            <Button
              onClick={() => {
                // 播放开始计时音效
                if (!isActive) {
                  playSoundEffect('timer');
                }
                onToggleTimer();
              }}
              variant={isActive ? 'danger' : 'warning'}
              size="medium"
              isNeomorphic={isNeomorphic}
              theme={theme}
              className={`p-2.5 transition-all duration-300 hover:scale-105 active:scale-95`}
            >
              {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </Button>
            
            {/* Fullscreen button - 合并了沉浸式全屏功能 */}
            <Button
              onClick={() => {
                // 同时触发内部沉浸式全屏功能
                if (onInternalImmersiveModeChange) {
                  onInternalImmersiveModeChange(true);
                } else if (onImmersiveModeChange) {
                  // 兼容处理，如果没有内部沉浸式模式，则使用外部模式
                  onImmersiveModeChange(true);
                }
                // 立即播放开始音效
                playSoundEffect('timer');
              }}
              variant="primary"
              size="medium"
              isNeomorphic={isNeomorphic}
              theme={theme}
              className={`p-2.5 transition-all duration-300 hover:scale-105 active:scale-95`}
              title="全屏模式"
            >
              <Maximize2 size={18} className={isDark ? 'text-zinc-300' : 'text-zinc-600'} />
            </Button>
            
            {/* 选择背景音乐按钮 */}
            <Button 
              ref={musicButtonRef}
              onClick={(e) => {
                e.stopPropagation(); // 阻止事件冒泡，防止触发点击外部关闭菜单的逻辑
                setIsSoundMenuOpen(!isSoundMenuOpen);
              }} 
              variant="primary"
              size="medium"
              isNeomorphic={isNeomorphic}
              theme={theme}
              className={`p-2.5 transition-all duration-300 hover:scale-105 active:scale-95 ${isDark ? 'bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300' : 'bg-white/10 hover:bg-white/20 text-zinc-300'}`}
              title="选择背景音乐"
            >
              <Music size={18} className={isDark ? 'text-zinc-300' : 'text-zinc-600'} />
            </Button>
          </div>
          
          {/* 预设时间按钮：加回60分钟 - 圆形拟态风格 */}
            <div className="flex gap-1 justify-center sm:justify-end flex-wrap w-full sm:w-auto">
              {[25, 45, 60].map(m => (
                <Button key={m}
                  onClick={() => onChangeDuration(m)}
                  variant={duration === m ? 'primary' : 'primary'}
                  size="small"
                  isNeomorphic={isNeomorphic}
                  theme={theme}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-105 ${duration === m ? 'font-bold' : ''}`}
                >
                  <span className={isDark ? 'text-zinc-300' : 'text-zinc-600'}>{m}</span>
                </Button>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TomatoTimer;
