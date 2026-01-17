import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, VolumeX, Volume2, Maximize2, Sun, Moon, Coffee, Dumbbell, BookOpen, Activity, Waves, CloudRain, Trees, BrainCircuit, ChevronLeft, ChevronRight } from 'lucide-react';

// 图标映射函数
const getIconComponentByName = (name: string) => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('forest') || lowerName.includes('woods') || lowerName.includes('trees')) {
    return Trees;
  } else if (lowerName.includes('rain') || lowerName.includes('storm') || lowerName.includes('drizzle')) {
    return CloudRain;
  } else if (lowerName.includes('ocean') || lowerName.includes('sea') || lowerName.includes('waves')) {
    return Waves;
  } else if (lowerName.includes('night') || lowerName.includes('cricket') || lowerName.includes('insects')) {
    return Moon;
  } else if (lowerName.includes('cafe') || lowerName.includes('coffee')) {
    return Coffee;
  } else if (lowerName.includes('fire') || lowerName.includes('fireplace')) {
    return Activity;
  } else if (lowerName.includes('white') && lowerName.includes('noise')) {
    return BrainCircuit;
  } else if (lowerName.includes('pink') && lowerName.includes('noise')) {
    return BrainCircuit;
  } else if (lowerName.includes('brown') && lowerName.includes('noise')) {
    return BrainCircuit;
  } else if (lowerName.includes('alpha')) {
    return Activity;
  } else if (lowerName.includes('beta')) {
    return Activity;
  } else if (lowerName.includes('theta')) {
    return Activity;
  } else if (lowerName.includes('meditation') || lowerName.includes('zen')) {
    return BrainCircuit;
  } else if (lowerName.includes('study') || lowerName.includes('focus')) {
    return BrainCircuit;
  } else if (lowerName.includes('chill') || lowerName.includes('relax') || lowerName.includes('snow') || lowerName.includes('mountain')) {
    return Sun; // 使用Sun图标代表放松/雪景/山景
  } else {
    // 默认返回Waves图标
    return Waves;
  }
};
import { GlobalHelpButton } from '../HelpSystem';
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

// 导入音频管理器
import audioManager from '../../utils/audioManager';
import audioStatistics from '../../utils/audioStatistics';

// 定义音频状态类型
interface AudioState {
  sounds: Sound[];
  loading: boolean;
}

// 在组件外部定义默认音频选项
const DEFAULT_SOUNDS: Sound[] = [
  { id: 'mute', name: '静音', url: "", icon: VolumeX, color: 'text-zinc-500', hex: '#6b7280' }, // 添加静音选项作为第一个
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
  const [searchQuery, setSearchQuery] = useState(''); // 搜索关键词状态
  // 移除本地isImmersive状态，使用父组件传递的onImmersiveModeChange回调
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [sounds, setSounds] = useState<Sound[]>(DEFAULT_SOUNDS);
  const [loading, setLoading] = useState(true);
  const [initialSoundsLoaded, setInitialSoundsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundMenuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭背景音乐面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (soundMenuRef.current && !soundMenuRef.current.contains(event.target as Node)) {
        setIsSoundMenuOpen(false);
      }
    };

    if (isSoundMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSoundMenuOpen]);

  const isDark = theme === 'dark' || theme === 'neomorphic-dark';
  const isNeomorphic = theme.startsWith('neomorphic');
  const cardBg = isNeomorphic
    ? (theme === 'neomorphic-dark'
      ? 'bg-[#1e1e2e] border-[#1e1e2e] rounded-lg shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)] transition-all duration-300'
      : 'bg-[#e0e5ec] border-[#a3b1c6] rounded-lg shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] transition-all duration-300')
    : isDark
    ? 'bg-zinc-900 border-zinc-800'
    : 'bg-white border-slate-200';

  const currentSound = sounds.find(s => s.id === currentSoundId) || sounds[0];

  // 快速切换上一个音乐
  const handlePrevSound = () => {
    if (sounds.length <= 1) return;
    const filteredSounds = sounds.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filteredSounds.length <= 1) return;
    
    const currentIndex = filteredSounds.findIndex(s => s.id === currentSoundId);
    if (currentIndex === -1) {
      setCurrentSoundId(filteredSounds[filteredSounds.length - 1].id);
      return;
    }
    const prevIndex = (currentIndex - 1 + filteredSounds.length) % filteredSounds.length;
    setCurrentSoundId(filteredSounds[prevIndex].id);
  };

  // 快速切换下一个音乐
  const handleNextSound = () => {
    if (sounds.length <= 1) return;
    const filteredSounds = sounds.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filteredSounds.length <= 1) return;
    
    const currentIndex = filteredSounds.findIndex(s => s.id === currentSoundId);
    if (currentIndex === -1) {
      setCurrentSoundId(filteredSounds[0].id);
      return;
    }
    const nextIndex = (currentIndex + 1) % filteredSounds.length;
    setCurrentSoundId(filteredSounds[nextIndex].id);
  };

  // 加载音频文件的函数，提取到组件顶层以便在onClick中调用
  const loadAudioFiles = async () => {
    setLoading(true);
    try {
      await audioManager.initialize();
      
      // 获取所有背景音乐文件，包括番茄钟专用的背景音乐，并去重
      const allBgMusic = [...audioManager.getBackgroundMusic(), ...audioManager.getCategoryById('pomodoro-bgm')?.files || []];
      // 使用Map去重，确保每个音频文件只出现一次
      const uniqueBgmFilesMap = new Map();
      allBgMusic.forEach(file => {
        if (!uniqueBgmFilesMap.has(file.id)) {
          uniqueBgmFilesMap.set(file.id, file);
        }
      });
      const bgmFiles = Array.from(uniqueBgmFilesMap.values());
      
      // 第一次加载时按播放次数排序音频文件，后续加载保持当前顺序
      let sortedBgmFiles = bgmFiles;
      if (!initialSoundsLoaded) {
        sortedBgmFiles = audioStatistics.getSortedAudioFiles(bgmFiles);
        setInitialSoundsLoaded(true);
      }
      
      // 转换为组件所需的格式
      const convertedSounds: Sound[] = [
        { id: 'mute', name: '静音', url: "", icon: VolumeX, color: 'text-zinc-500', hex: '#6b7280' },
        ...(sortedBgmFiles || []).map(file => ({
          id: file.id,
          name: file.name,
          url: file.url,
          icon: getIconComponentByName(file.name), // 根据文件名获取图标
          color: 'text-blue-500',
          hex: '#3b82f6'
        }))
      ];
      
      setSounds(convertedSounds);
    } catch (error) {
      console.error('Failed to load audio files:', error);
      // 如果加载失败，使用默认音频
      setSounds(DEFAULT_SOUNDS);
    } finally {
      setLoading(false);
    }
  };

  // 初始化音频管理器并加载音频文件
  useEffect(() => {
    loadAudioFiles();
  }, []);

  // 预加载前10个背景音乐文件，减少播放延迟
  useEffect(() => {
    const preloadTopBGM = async () => {
      try {
        await audioManager.preloadTopBackgroundMusic(10);
        console.log('预加载前10个背景音乐文件完成');
      } catch (error) {
        console.error('预加载背景音乐失败:', error);
      }
    };
    preloadTopBGM();
  }, []);
  
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
    // 移除暂停时退出全屏模式的逻辑，只在计时器结束时退出
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft, duration, onUpdateTimeLeft, onUpdateIsActive, onImmersiveModeChange]);

  // Audio management - Optimized for low latency playback
  useEffect(() => {
    let audioSrc = '';
    let shouldPlay = false;
    let targetSoundId = currentSoundId;
    
    // 当番茄钟启动时，使用用户选择的音乐
    if (isActive) {
      // 如果用户选择了静音，则不播放音乐
      if (targetSoundId !== 'mute') {
        const targetSound = sounds.find(s => s.id === targetSoundId) || sounds[1];
        audioSrc = targetSound.url;
        shouldPlay = true;
        
        // 记录音频播放统计
        if (targetSound.id && targetSound.id !== 'mute') {
          audioStatistics.recordPlay(targetSound.id);
        }
      }
    }
    
    // If no audio source, don't create audio object
    if (!audioSrc) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      return;
    }

    // 使用预加载的音频对象，减少播放延迟
    const handlePlayAudio = async () => {
      try {
        // 检查是否有预加载的音频
        const preloadedAudio = await audioManager.preloadAudio(audioSrc);
        
        // Create or update audio object
        let newAudio = audioRef.current;
        if (!newAudio || newAudio.src !== audioSrc) {
          if (newAudio) {
            newAudio.pause();
            newAudio.src = '';
          }
          
          // 优先使用克隆的预加载音频，减少延迟
          newAudio = preloadedAudio.cloneNode() as HTMLAudioElement;
          newAudio.loop = true;
          newAudio.volume = 0.3;
          newAudio.preload = 'auto';
          
          // 设置crossOrigin以允许克隆
          newAudio.crossOrigin = 'anonymous';
          
          audioRef.current = newAudio;
        }
        
        // Play or pause audio based on timer state
        if (shouldPlay) {
          await newAudio.play();
        } else {
          newAudio.pause();
          newAudio.currentTime = 0;
        }
      } catch (error) {
        console.log('Audio play failed:', error);
      }
    };
    
    handlePlayAudio();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
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
      
      {/* 背景音乐选择菜单 */}
      {isSoundMenuOpen && (
        <div 
          ref={soundMenuRef}
          className={`absolute top-0 right-0 mt-16 mr-2 w-64 sm:w-72 md:w-80 rounded-xl p-4 backdrop-blur-sm z-50 ${isNeomorphic ? (isDark ? 'bg-[#1e1e2e] border border-zinc-700 shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] border border-slate-300 shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]') : isDark ? 'bg-zinc-900/95 border border-zinc-800' : 'bg-white/95 border border-slate-200 shadow-[10px_10px_20px_rgba(163,177,198,0.4),-10px_-10px_20px_rgba(255,255,255,0.6)]'}`}
        >
          {/* 搜索框与切换按钮 */}
          <div className="mb-3">
            <div className="relative flex items-center">
              {/* 搜索框 */}
              <div className="flex-1 mr-2">
                <input
                  type="text"
                  placeholder="搜索背景音乐..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-4 py-1.5 rounded-[24px] text-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isNeomorphic ? (isDark ? 'bg-[#1e1e2e] border-[#1e1e2e] text-white placeholder-white/50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),inset_-3px_-3px_6px_rgba(30,30,46,1)]' : 'bg-[#e0e5ec] border-[#e0e5ec] text-black placeholder-black/50 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]') : (isDark ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500' : 'bg-white border-slate-300 text-black placeholder-gray-500')}`}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevSound}
                  className={`p-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                    isNeomorphic 
                      ? (isDark ? 'bg-[#1e1e2e] shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(30,30,46,0.8)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.5),-6px_-6px_12px_rgba(30,30,46,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5)]')
                      : (isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white shadow-sm' : 'bg-white hover:bg-slate-100 shadow-sm')
                  } ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}
                  title="上一个音乐"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <button
                  onClick={handleNextSound}
                  className={`p-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                    isNeomorphic 
                      ? (isDark ? 'bg-[#1e1e2e] shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(30,30,46,0.8)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.5),-6px_-6px_12px_rgba(30,30,46,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5)]')
                      : (isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white shadow-sm' : 'bg-white hover:bg-slate-100 shadow-sm')
                  } ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}
                  title="下一个音乐"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {/* 过滤后的音效列表 */}
            {sounds
              .filter(sound => sound.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(sound => {
                const IconComponent = sound.icon;
                return (
                  <button 
                    key={sound.id}
                    onClick={() => {
                      setCurrentSoundId(sound.id);
                      // 选择音乐时不关闭面板
                      // setIsSoundMenuOpen(false);
                      // 记录播放次数，但不重新加载音频文件以避免列表跳动
                      if (sound.id && sound.id !== 'mute') {
                        audioStatistics.recordPlay(sound.id);
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${currentSoundId === sound.id ? (isNeomorphic ? `${isDark ? 'bg-[#3a3f4e] text-blue-300 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.3),inset_-6px_-6px_12px_rgba(58,63,78,0.8)]' : 'bg-[#d0d5dc] text-blue-600 shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(208,213,220,1)]'}` : isDark ? 'bg-zinc-800 text-white' : 'bg-blue-50 text-blue-600') : (isNeomorphic ? `${isDark ? 'bg-[#1e1e2e] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(40,43,52,1)] active:shadow-[inset_8px_8px_16px_rgba(0,0,0,0.4),inset_-8px_-8px_16px_rgba(40,43,52,0.9)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'} active:scale-[0.98]` : isDark ? 'hover:bg-zinc-700 text-zinc-300' : 'hover:bg-slate-100 text-slate-700')}`}
                  >
                    <span className={`text-[9px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'} w-4`}>{sounds.findIndex(s => s.id === sound.id) + 1}.</span>
                    <IconComponent size={16} className={isDark ? (sound.id === 'mute' ? 'text-zinc-400' : 'text-zinc-300') : sound.color} />
                    <span className={`text-xs font-medium ${isDark ? 'text-zinc-300' : isNeomorphic ? 'text-zinc-700' : 'text-slate-700'}`}>{sound.name}</span>
                  </button>
                );
              })}
          </div>
        </div>
      )}
      
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
            <button
              onClick={onToggleTimer}
              className={`p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${isNeomorphic
                ? (isDark 
                    ? `bg-[#1e1e2e] border border-zinc-700 shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(40,43,52,0.8)] hover:shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(40,43,52,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(40,43,52,0.8)] ${isActive ? 'text-red-400' : 'text-orange-400'}`
                    : `bg-[#e0e5ec] border border-slate-300 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[5px_5px_10px_rgba(163,177,198,0.7),-5px_-5px_10px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] ${isActive ? 'text-red-500' : 'text-orange-500'}`)
                : (isActive ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30')}`}>
              {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
            
            {/* Fullscreen button - 合并了沉浸式全屏功能 */}
            <button
              onClick={() => {
                // 同时触发内部沉浸式全屏功能
                if (onInternalImmersiveModeChange) {
                  onInternalImmersiveModeChange(true);
                } else if (onImmersiveModeChange) {
                  // 兼容处理，如果没有内部沉浸式模式，则使用外部模式
                  onImmersiveModeChange(true);
                }
              }}
              className={`p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${isNeomorphic 
                ? `${isDark 
                    ? 'bg-[#1e1e2e] border border-zinc-700 shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(40,43,52,0.8)] hover:shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(40,43,52,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(40,43,52,0.8)] text-zinc-300' 
                    : 'bg-[#e0e5ec] border border-slate-300 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[5px_5px_10px_rgba(163,177,198,0.7),-5px_-5px_10px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] text-zinc-600' 
                  }`
                : `${isDark ? 'text-zinc-300 hover:text-blue-400 hover:bg-zinc-800/50' : 'text-zinc-500 hover:text-blue-400 hover:bg-white/10'}`}`}
              title="全屏模式"
            >
              <Maximize2 size={18} className={isDark ? 'text-zinc-300' : 'text-zinc-600'} />
            </button>
            
            {/* 选择背景音乐按钮 */}
            <button 
              onClick={() => setIsSoundMenuOpen(!isSoundMenuOpen)} 
              className={`p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${isNeomorphic 
                ? `${isDark 
                    ? 'bg-[#1e1e2e] border border-zinc-700 shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(40,43,52,0.8)] hover:shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(40,43,52,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(40,43,52,0.8)] text-zinc-300' 
                    : 'bg-[#e0e5ec] border border-slate-300 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[5px_5px_10px_rgba(163,177,198,0.7),-5px_-5px_10px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] text-zinc-600' 
                  }`
                : `${isDark ? 'text-zinc-300 hover:text-blue-400 hover:bg-zinc-800/50' : 'text-zinc-500 hover:text-blue-400 hover:bg-white/10'}`}`}
              title="选择背景音乐"
            >
              {currentSoundId === 'mute' 
                ? <VolumeX size={18} className={isDark ? 'text-zinc-300' : 'text-zinc-600'} /> 
                : <Waves size={18} className={isDark ? 'text-zinc-300' : 'text-zinc-600'} />
              }
            </button>
          </div>
          
          {/* 预设时间按钮：加回60分钟 - 圆形拟态风格 */}
            <div className="flex gap-1 justify-center sm:justify-end flex-wrap w-full sm:w-auto">
              {[25, 45, 60].map(m => (
                <button key={m}
                  onClick={() => onChangeDuration(m)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 ${isNeomorphic
                    ? (isDark 
                        ? `bg-[#1e1e2e] border border-zinc-700 shadow-[2px_2px_4px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(40,43,52,0.8)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(40,43,52,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(40,43,52,0.8)] ${duration === m ? 'text-blue-400 font-bold' : 'text-zinc-300'}`
                        : `bg-[#e0e5ec] border border-slate-300 shadow-[2px_2px_4px_rgba(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,1)] hover:shadow-[4px_4px_8px_rgba(163,177,198,0.7),-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] ${duration === m ? 'text-blue-600 font-bold' : 'text-zinc-600'}`)
                    : duration === m ?
                      (isDark ? 'bg-zinc-700 text-white border-zinc-600' : 'bg-blue-600 text-white border-blue-500') :
                      (isDark ? 'text-zinc-300 border-zinc-700 hover:text-white hover:bg-zinc-700' : 'text-slate-600 border-slate-300 hover:text-slate-800 hover:bg-slate-100')
                  }`}>
                  <span className={isDark ? 'text-zinc-300' : 'text-zinc-600'}>{m}</span>
                </button>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TomatoTimer;