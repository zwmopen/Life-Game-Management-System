import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Music, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Theme } from '../../types';
import Button from './Button';
import { useGlobalAudio } from '../GlobalAudioManagerOptimized';
import audioStatistics from '../../utils/audioStatistics';
import { cardStyles, inputStyles, buttonStyles, getStyleByTheme, getTextMain, getTextMuted, bgColors } from '../../constants/styles';
import { GlobalHelpButton } from '../HelpSystem';

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
  onHelpClick?: (helpId: string) => void;
  position?: 'absolute' | 'fixed';
  className?: string;
}

const UnifiedBgMusicSelector: React.FC<UnifiedBgMusicSelectorProps> = ({
  theme,
  isVisible,
  onClose,
  onHelpClick,
  position = 'absolute',
  className = ''
}) => {
  const { currentBgMusicId, playBgMusic, stopBgMusic, toggleSelectedMusic, getSelectedMusicIds, getLockedMusicIds } = useGlobalAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [allSounds, setAllSounds] = useState<Sound[]>([]);
  const [isSoundListLoaded, setIsSoundListLoaded] = useState(false);
  const [initialSoundsLoaded, setInitialSoundsLoaded] = useState(false);
  
  // 点击次数检测（用于区分单击、双击、三击）
  const clickCountRef = useRef<Map<string, { count: number; timeout: NodeJS.Timeout | null }>>(new Map());
  const CLICK_THRESHOLD = 300; // 点击间隔阈值：300毫秒
  
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
      
      // 直接获取所有背景音乐文件，getBackgroundMusic()方法已经包含了所有类别的背景音乐
      const bgmFiles = audioManagerModule.default.getBackgroundMusic();
      
      // 每次加载时都按播放次数和收藏状态排序音频文件
      const sortedBgmFiles = audioStatistics.getSortedAudioFiles(bgmFiles);
      setInitialSoundsLoaded(true);
      
      // 转换为组件所需的格式
      const nonMuteSounds = sortedBgmFiles.filter(file => file && file.id && file.url).map(file => ({
        id: file.name, // 使用name作为id，这样与soundManager中的预初始化音乐id格式一致
        name: file.name,
        url: file.url,
        icon: getIconComponentByName(file.name),
        color: 'text-blue-500',
        hex: '#3b82f6'
      }));
      
      // 确保静音选项永远排在最上面
      const soundList = [
        { id: 'mute', name: '静音', url: '', icon: '🔇', color: 'text-blue-500', hex: '#3b82f6' },
        ...nonMuteSounds
      ];
      
      setAllSounds(soundList);
      setIsSoundListLoaded(true);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Loaded ${soundList.length - 1} background music files`);
      }
    } catch (error) {
      console.error('Failed to load sound list:', error);
      // 加载失败时使用默认音效列表，确保静音在最后
      const defaultSoundsWithMuteAtEnd = [
        ...defaultSounds.filter(sound => sound.id !== 'mute'),
        defaultSounds.find(sound => sound.id === 'mute')!
      ];
      setAllSounds(defaultSoundsWithMuteAtEnd);
      setIsSoundListLoaded(true);
    }
  }, [initialSoundsLoaded, getIconComponentByName]);
  
  // 初始化音频
  useEffect(() => {
    loadAllSounds();
  }, [loadAllSounds]);

  // 每次打开音乐列表时重新加载和排序
  useEffect(() => {
    if (isVisible) {
      loadAllSounds();
    }
  }, [isVisible, loadAllSounds]);
  
  // 处理音乐切换
  const handleSoundChange = useCallback((soundId: string) => {
    if (soundId === 'mute') {
      stopBgMusic();
    } else {
      // 使用异步处理，但不阻塞UI
      playBgMusic(soundId).catch(error => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to play background music:', error);
        }
      });
      // 异步记录播放统计，不阻塞UI
      setTimeout(() => {
        audioStatistics.recordPlay(soundId);
      }, 0);
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
      className={`${position} z-50 mt-2 w-64 sm:w-80 rounded-xl backdrop-blur-sm p-3 animate-in fade-in slide-in-from-top-5 ${getStyleByTheme(cardStyles, isNeomorphic, theme)} ${className} min-w-[240px]`}
    >
      {/* 搜索框与切换按钮 */}
      <div className="mb-3">
        <div className="relative flex items-center justify-between">
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
          
          {/* 帮助按钮 */}
          {onHelpClick && (
            <GlobalHelpButton 
              helpId="bg-music" 
              onHelpClick={onHelpClick} 
              size={14} 
              className="hover:scale-[1.1]" 
            />
          )}
        </div>
      </div>
      
      <div className={`flex flex-col gap-1 max-h-60 overflow-y-auto px-2`}>
        {/* 过滤后的音效列表 */}
        {(isSoundListLoaded ? allSounds : defaultSounds)
          .filter(sound => sound.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((sound, index) => {
            // 检查该音乐是否被选中（正在播放）
            const selectedMusicIds = getSelectedMusicIds();
            const lockedMusicIds = getLockedMusicIds();
            const isPlaying = selectedMusicIds.has(sound.id);
            const isLocked = lockedMusicIds.has(sound.id);
            const isFavorite = audioStatistics.isFavorite(sound.id);
            
            // 自定义点击次数检测（区分单击、双击、三击）
            const handleClick = () => {
              // 获取当前音乐的点击记录
              let clickRecord = clickCountRef.current.get(sound.id);
              
              if (!clickRecord) {
                // 第一次点击
                clickRecord = { count: 1, timeout: null };
                clickCountRef.current.set(sound.id, clickRecord);
              } else {
                // 不是第一次点击，更新点击次数
                clickRecord.count += 1;
              }
              
              // 清除之前的定时器
              if (clickRecord.timeout) {
                clearTimeout(clickRecord.timeout);
              }
              
              // 设置新的定时器，在阈值时间后处理点击事件
              clickRecord.timeout = setTimeout(() => {
                const count = clickRecord.count;
                
                if (count === 1) {
                  // 单击：播放，替换当前播放列表
                  handleSoundChange(sound.id);
                } else if (count === 2) {
                  // 双击：锁定/解锁歌曲
                  toggleSelectedMusic(sound.id);
                } else if (count === 3) {
                  // 三击：收藏/取消收藏歌曲
                  audioStatistics.toggleFavorite(sound.id);
                  // 重新加载音效列表以更新排序
                  loadAllSounds();
                }
                
                // 重置点击记录
                clickCountRef.current.delete(sound.id);
              }, CLICK_THRESHOLD);
            };
            
            return (
              <div 
                  key={sound.id}
                  onClick={handleClick}
                  className={`flex items-center gap-2 px-4 py-1.5 transition-all cursor-pointer justify-start rounded-full mb-1 w-full ${index === 0 ? 'mt-1' : ''} ${isPlaying ? 
                    (isNeomorphic ? 
                      (isDark ? 'bg-blue-900/40 text-blue-400 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(30,30,46,0.7)]' : 'bg-blue-500/90 text-white shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]') 
                      : (isDark ? 'bg-blue-900/40 text-blue-400 border-2 border-blue-700/50' : 'bg-blue-500 text-white border-2 border-blue-600')) 
                    : 
                    (isNeomorphic ? 
                      (isDark ? 'bg-[#1e1e2e] text-blue-400 shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] text-blue-600 shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') 
                      : (isDark ? 'bg-zinc-800 text-blue-400 hover:bg-zinc-700 shadow-md hover:shadow-lg' : 'bg-white text-blue-600 hover:bg-slate-50 shadow-md hover:shadow-lg'))}`}
                  >
                {/* 添加序号 */}
                <span className={`text-xs ${getTextMuted(isNeomorphic, theme)} min-w-6 text-center`}>{index + 1}</span>
                <span className="text-base">{sound.icon}</span>
                <span className={`text-xs font-medium ${getTextMain(isNeomorphic, theme)} flex-1 truncate`}>{sound.name}</span>
                {isFavorite && (
                  <span className="ml-auto text-xs text-red-400 mr-1">❤️</span>
                )}
                {isLocked && (
                  <span className="ml-auto text-xs text-yellow-400 flex items-center gap-1">
                    <span>🔒</span>
                    <span>锁定</span>
                  </span>
                )}
                {isPlaying && !isLocked && (
                  <span className="ml-auto text-xs text-blue-400">播放中</span>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default UnifiedBgMusicSelector;