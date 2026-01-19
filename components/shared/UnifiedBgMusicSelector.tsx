import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Music, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Theme } from '../../types';
import Button from './Button';
import { useGlobalAudio } from '../GlobalAudioManagerOptimized';
import audioStatistics from '../../utils/audioStatistics';
import { cardStyles, inputStyles, buttonStyles, getStyleByTheme, getTextMain, getTextMuted, bgColors } from '../../constants/styles';

interface Sound {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  hex: string;
}

interface UnifiedBgMusicSelectorProps {
  theme: Theme;
  isVisible: boolean;
  onClose: () => void;
  position?: 'absolute' | 'fixed';
  className?: string;
}

const UnifiedBgMusicSelector: React.FC<UnifiedBgMusicSelectorProps> = ({
  theme,
  isVisible,
  onClose,
  position = 'absolute',
  className = ''
}) => {
  const { currentBgMusicId, playBgMusic, stopBgMusic } = useGlobalAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [allSounds, setAllSounds] = useState<Sound[]>([]);
  const [isSoundListLoaded, setIsSoundListLoaded] = useState(false);
  const [initialSoundsLoaded, setInitialSoundsLoaded] = useState(false);
  
  // 引用用于点击外部关闭
  const soundMenuRef = useRef<HTMLDivElement>(null);
  
  const isDark = theme.includes('dark');
  const isNeomorphic = theme.startsWith('neomorphic');
  
  // 默认音频列表，与全屏模式保持一致
  const defaultSounds: Sound[] = [
    { id: 'mute', name: '静音', url: '', icon: '🔇', color: 'text-blue-500', hex: '#3b82f6' },
    { id: 'forest', name: '迷雾森林', url: '', icon: '🌲', color: 'text-blue-500', hex: '#3b82f6' },
    { id: 'alpha', name: '阿尔法波', url: '', icon: '🧠', color: 'text-blue-500', hex: '#3b82f6' },
    { id: 'theta', name: '希塔波', url: '', icon: '🧘', color: 'text-blue-500', hex: '#3b82f6' },
    { id: 'beta', name: '贝塔波', url: '', icon: '⚡', color: 'text-blue-500', hex: '#3b82f6' },
    { id: 'ocean', name: '海浪声', url: '', icon: '🌊', color: 'text-blue-500', hex: '#3b82f6' },
    { id: 'rain', name: '雨声', url: '', icon: '🌧️', color: 'text-blue-500', hex: '#3b82f6' },
    { id: 'night', name: '夏夜虫鸣', url: '', icon: '🦗', color: 'text-blue-500', hex: '#3b82f6' },
    { id: 'white-noise', name: '白噪音', url: '', icon: '🌬️', color: 'text-blue-500', hex: '#3b82f6' },
    { id: 'pink-noise', name: '粉红噪音', url: '', icon: '🎨', color: 'text-blue-500', hex: '#3b82f6' },
    { id: 'brown-noise', name: '布朗噪音', url: '', icon: '🌰', color: 'text-blue-500', hex: '#3b82f6' },
    { id: 'cafe', name: '咖啡馆环境', url: '', icon: '☕', color: 'text-blue-500', hex: '#3b82f6' },
    { id: 'fireplace', name: '壁炉声', url: '', icon: '🔥', color: 'text-blue-500', hex: '#3b82f6' }
  ];
  
  // 图标映射函数
  const getIconComponentByName = useCallback((name: string) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('forest') || lowerName.includes('woods') || lowerName.includes('trees')) {
      return '🌲';
    } else if (lowerName.includes('rain') || lowerName.includes('storm') || lowerName.includes('drizzle')) {
      return '🌧️';
    } else if (lowerName.includes('ocean') || lowerName.includes('sea') || lowerName.includes('waves')) {
      return '🌊';
    } else if (lowerName.includes('night') || lowerName.includes('cricket') || lowerName.includes('insects')) {
      return '🦗';
    } else if (lowerName.includes('cafe') || lowerName.includes('coffee')) {
      return '☕';
    } else if (lowerName.includes('fire') || lowerName.includes('fireplace')) {
      return '🔥';
    } else if (lowerName.includes('white') && lowerName.includes('noise')) {
      return '🌬️';
    } else if (lowerName.includes('pink') && lowerName.includes('noise')) {
      return '🎨';
    } else if (lowerName.includes('brown') && lowerName.includes('noise')) {
      return '🌰';
    } else if (lowerName.includes('alpha')) {
      return '🧠';
    } else if (lowerName.includes('beta')) {
      return '⚡';
    } else if (lowerName.includes('theta')) {
      return '🧘';
    } else {
      return '🎵';
    }
  }, []);
  
  // 加载所有背景音乐
  const loadAllSounds = useCallback(async () => {
    try {
      // 动态导入audioManager
      const audioManagerModule = await import('../../utils/audioManagerOptimized');
      await audioManagerModule.default.initialize();
      
      // 获取所有背景音乐文件，包括番茄钟专用的背景音乐，并去重
      const allBgMusic = [...audioManagerModule.default.getBackgroundMusic(), ...audioManagerModule.default.getCategoryById('pomodoro-bgm')?.files || []];
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
      const soundList = [
        { id: 'mute', name: '静音', url: '', icon: '🔇', color: 'text-blue-500', hex: '#3b82f6' },
        ...sortedBgmFiles.filter(file => file && file.id && file.url).map(file => ({
          id: file.id,
          name: file.name,
          url: file.url,
          icon: getIconComponentByName(file.name),
          color: 'text-blue-500',
          hex: '#3b82f6'
        }))
      ];
      
      setAllSounds(soundList);
      setIsSoundListLoaded(true);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Loaded sound list:', soundList.map(s => s.id));
      }
    } catch (error) {
      console.error('Failed to load sound list:', error);
      // 加载失败时使用默认音效列表
      setAllSounds(defaultSounds);
      setIsSoundListLoaded(true);
    }
  }, [initialSoundsLoaded, getIconComponentByName]);
  
  // 初始化音频
  useEffect(() => {
    loadAllSounds();
  }, [loadAllSounds]);
  
  // 处理音乐切换
  const handleSoundChange = useCallback(async (soundId: string) => {
    if (soundId === 'mute') {
      stopBgMusic();
    } else {
      await playBgMusic(soundId);
      // 记录播放统计
      audioStatistics.recordPlay(soundId);
    }
    // 移除自动关闭，让用户可以继续选择音乐
  }, [playBgMusic, stopBgMusic]);
  
  // 快速切换上一个音乐
  const handlePrevSound = useCallback(() => {
    if (allSounds.length <= 1) return;
    
    const filteredSounds = allSounds.filter(sound => sound.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filteredSounds.length <= 1) return;
    
    const currentIndex = filteredSounds.findIndex(s => s.id === currentBgMusicId);
    const prevIndex = currentIndex <= 0 ? filteredSounds.length - 1 : currentIndex - 1;
    handleSoundChange(filteredSounds[prevIndex].id);
  }, [allSounds, currentBgMusicId, searchQuery, handleSoundChange]);
  
  // 快速切换下一个音乐
  const handleNextSound = useCallback(() => {
    if (allSounds.length <= 1) return;
    
    const filteredSounds = allSounds.filter(sound => sound.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filteredSounds.length <= 1) return;
    
    const currentIndex = filteredSounds.findIndex(s => s.id === currentBgMusicId);
    const nextIndex = currentIndex >= filteredSounds.length - 1 ? 0 : currentIndex + 1;
    handleSoundChange(filteredSounds[nextIndex].id);
  }, [allSounds, currentBgMusicId, searchQuery, handleSoundChange]);
  
  // 点击外部关闭背景音乐面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isVisible && soundMenuRef.current && !soundMenuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);
  
  // 确保isVisible为false时不渲染任何内容
  if (!isVisible) return null;
  
  return (
    <div 
      ref={soundMenuRef}
      className={`${position} z-50 mt-2 w-64 sm:w-80 rounded-xl backdrop-blur-sm p-3 animate-in fade-in slide-in-from-top-5 ${getStyleByTheme(cardStyles, isNeomorphic, theme)} ${className}`}
    >
      {/* 搜索框与切换按钮 */}
      <div className="mb-3">
        <div className="relative flex items-center">
          {/* 搜索框 */}
          <div className="flex-1 mr-2">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getTextMuted(isNeomorphic, theme)}`} size={16} />
              <input
                type="text"
                placeholder="搜索背景音乐..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-1.5 rounded-full text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${getStyleByTheme(inputStyles, isNeomorphic, theme)} ${getTextMain(isNeomorphic, theme)} placeholder:${getTextMuted(isNeomorphic, theme)}`}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-1 px-1">
            <Button
              onClick={handlePrevSound}
              variant="primary"
              size="small"
              isNeomorphic={isNeomorphic}
              theme={theme}
              className="p-1.5"
            >
              <ChevronLeft size={16} />
            </Button>
            
            <Button
              onClick={handleNextSound}
              variant="primary"
              size="small"
              isNeomorphic={isNeomorphic}
              theme={theme}
              className="p-1.5"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      <div className={`flex flex-col gap-1 max-h-60 overflow-y-auto px-2`}>
        {/* 过滤后的音效列表 */}
        {(isSoundListLoaded ? allSounds : defaultSounds)
          .filter(sound => sound.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((sound, index) => {
            return (
              <Button 
                  key={sound.id}
                  onClick={() => handleSoundChange(sound.id)}
                  variant={currentBgMusicId === sound.id ? 'primary' : 'primary'}
                  size="small"
                  isNeomorphic={isNeomorphic}
                  theme={theme}
                  className={`flex items-center gap-2 px-4 py-1.5 transition-all cursor-pointer justify-start rounded-full mb-1 ${index === 0 ? 'mt-1' : ''} ${currentBgMusicId === sound.id ? (isNeomorphic ? (isDark ? 'bg-blue-900/40 text-blue-400 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(30,30,46,0.7)]' : 'bg-blue-500/90 text-white shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]') : (isDark ? 'bg-blue-900/40 text-blue-400 border-2 border-blue-700/50' : 'bg-blue-500 text-white border-2 border-blue-600')) : ''}`}
                  >
                <span className="text-base">{sound.icon}</span>
                <span className={`text-xs font-medium ${getTextMain(isNeomorphic, theme)}`}>{sound.name}</span>
              </Button>
            );
          })}
      </div>
    </div>
  );
};

export default UnifiedBgMusicSelector;