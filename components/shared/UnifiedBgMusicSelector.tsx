import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VolumeX, Waves, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Theme } from '../../types';

interface Sound {
  id: string;
  name: string;
  url: string;
  icon: React.ElementType;
  color: string;
  hex: string;
}

interface UnifiedBgMusicSelectorProps {
  theme: Theme;
  currentSoundId: string;
  onSoundChange: (soundId: string) => void;
  className?: string;
}

// 图标映射函数
const getIconComponentByName = (name: string) => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('forest') || lowerName.includes('woods') || lowerName.includes('trees')) {
    return Waves; // 使用Waves作为森林的图标
  } else if (lowerName.includes('rain') || lowerName.includes('storm') || lowerName.includes('drizzle')) {
    return Waves;
  } else if (lowerName.includes('ocean') || lowerName.includes('sea') || lowerName.includes('waves')) {
    return Waves;
  } else if (lowerName.includes('night') || lowerName.includes('cricket') || lowerName.includes('insects')) {
    return Waves;
  } else if (lowerName.includes('cafe') || lowerName.includes('coffee')) {
    return Waves;
  } else if (lowerName.includes('fire') || lowerName.includes('fireplace')) {
    return Waves;
  } else if (lowerName.includes('white') && lowerName.includes('noise')) {
    return Waves;
  } else if (lowerName.includes('pink') && lowerName.includes('noise')) {
    return Waves;
  } else if (lowerName.includes('brown') && lowerName.includes('noise')) {
    return Waves;
  } else if (lowerName.includes('alpha')) {
    return Waves;
  } else if (lowerName.includes('beta')) {
    return Waves;
  } else if (lowerName.includes('theta')) {
    return Waves;
  } else if (lowerName.includes('meditation') || lowerName.includes('zen')) {
    return Waves;
  } else if (lowerName.includes('study') || lowerName.includes('focus')) {
    return Waves;
  } else if (lowerName.includes('chill') || lowerName.includes('relax') || lowerName.includes('snow') || lowerName.includes('mountain')) {
    return Waves;
  } else {
    // 默认返回Waves图标
    return Waves;
  }
};

const UnifiedBgMusicSelector: React.FC<UnifiedBgMusicSelectorProps> = ({
  theme,
  currentSoundId,
  onSoundChange,
  className = ''
}) => {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialSoundsLoaded, setInitialSoundsLoaded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isDark = theme.includes('dark');
  const isNeomorphic = theme.startsWith('neomorphic');
  const cardBg = isNeomorphic
    ? (theme === 'neomorphic-dark'
      ? 'bg-[#1e1e2e] border-[#1e1e2e] rounded-lg shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)] transition-all duration-300'
      : 'bg-[#e0e5ec] border-[#a3b1c6] rounded-lg shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] transition-all duration-300')
    : isDark
    ? 'bg-zinc-900 border-zinc-800'
    : 'bg-white border-slate-200';

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // 加载音频文件
  const loadAudioFiles = useCallback(async () => {
    setLoading(true);
    try {
      const audioManagerModule = await import('../../utils/audioManager');
      const audioStatisticsModule = await import('../../utils/audioStatistics');
      
      const audioManager = audioManagerModule.default;
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
        const audioStatistics = audioStatisticsModule.default;
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
          icon: getIconComponentByName(file.name),
          color: 'text-blue-500',
          hex: '#3b82f6'
        }))
      ];
      
      setSounds(convertedSounds);
    } catch (error) {
      console.error('Failed to load audio files:', error);
      // 如果加载失败，使用默认音频
      setSounds([
        { id: 'mute', name: '静音', url: "", icon: VolumeX, color: 'text-zinc-500', hex: '#6b7280' },
        { id: 'forest', name: '迷雾森林', url: '', icon: Waves, color: 'text-blue-500', hex: '#3b82f6' },
        { id: 'ocean', name: '海浪声', url: '', icon: Waves, color: 'text-blue-500', hex: '#3b82f6' },
        { id: 'rain', name: '雨声', url: '', icon: Waves, color: 'text-blue-500', hex: '#3b82f6' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [initialSoundsLoaded]);

  // 初始化音频管理器并加载音频文件
  useEffect(() => {
    loadAudioFiles();
  }, [loadAudioFiles]);

  // 快速切换上一个音乐
  const handlePrevSound = () => {
    if (sounds.length <= 1) return;
    const filteredSounds = sounds.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filteredSounds.length <= 1) return;
    
    const currentIndex = filteredSounds.findIndex(s => s.id === currentSoundId);
    if (currentIndex === -1) {
      onSoundChange(filteredSounds[filteredSounds.length - 1].id);
      return;
    }
    const prevIndex = (currentIndex - 1 + filteredSounds.length) % filteredSounds.length;
    onSoundChange(filteredSounds[prevIndex].id);
  };

  // 快速切换下一个音乐
  const handleNextSound = () => {
    if (sounds.length <= 1) return;
    const filteredSounds = sounds.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filteredSounds.length <= 1) return;
    
    const currentIndex = filteredSounds.findIndex(s => s.id === currentSoundId);
    if (currentIndex === -1) {
      onSoundChange(filteredSounds[0].id);
      return;
    }
    const nextIndex = (currentIndex + 1) % filteredSounds.length;
    onSoundChange(filteredSounds[nextIndex].id);
  };

  const currentSound = sounds.find(s => s.id === currentSoundId) || sounds[0];

  return (
    <div className={className} ref={menuRef}>
      {/* 音乐选择按钮 */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)} 
        className={`p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${isNeomorphic 
          ? `${isDark 
              ? 'bg-[#1e1e2e] border border-zinc-700 shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(40,43,52,0.8)] hover:shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(40,43,52,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(40,43,52,0.8)] text-zinc-300' 
              : 'bg-[#e0e5ec] border border-slate-300 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[5px_5px_10px_rgba(163,177,198,0.7),-5px_-5px_10px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] text-zinc-600' 
            }`
          : `${isDark ? 'text-zinc-300 hover:text-blue-400 hover:bg-zinc-800/50' : 'text-zinc-500 hover:text-blue-400 hover:bg-white/10}'}`}`}
        title="选择背景音乐"
      >
        {currentSoundId === 'mute' 
          ? <VolumeX size={18} className={isDark ? 'text-zinc-300' : 'text-zinc-600'} /> 
          : <Waves size={18} className={isDark ? 'text-zinc-300' : 'text-zinc-600'} />
        }
      </button>

      {/* 背景音乐选择菜单 */}
      {isMenuOpen && (
        <div 
          className={`absolute -left-64 mt-2 w-64 sm:w-72 md:w-80 rounded-xl p-4 backdrop-blur-sm z-[2000] ${isNeomorphic ? (isDark ? 'bg-[#1e1e2e] border border-zinc-700 shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] border border-slate-300 shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]') : isDark ? 'bg-zinc-900/95 border border-zinc-800' : 'bg-white/95 border border-slate-200 shadow-[10px_10px_20px_rgba(163,177,198,0.4),-10px_-10px_20px_rgba(255,255,255,0.6)]'}`}
        >
          {/* 搜索框与切换按钮 */}
          <div className="mb-3">
            <div className="relative flex items-center">
              {/* 搜索框 */}
              <div className="flex-1 mr-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={16} />
                  <input
                    type="text"
                    placeholder="搜索背景音乐..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-1.5 rounded-[24px] text-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isNeomorphic ? (isDark ? 'bg-[#1e1e2e] border-[#1e1e2e] text-white placeholder-white/50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),inset_-3px_-3px_6px_rgba(30,30,46,1)]' : 'bg-[#e0e5ec] border-[#e0e5ec] text-black placeholder-black/50 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]') : (isDark ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500' : 'bg-white border-slate-300 text-black placeholder-gray-500')}`}
                  />
                </div>
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
            {loading ? (
              <div className="text-center py-4 text-gray-500">加载中...</div>
            ) : (
              sounds
                .filter(sound => sound.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(sound => {
                  const IconComponent = sound.icon;
                  return (
                    <button 
                      key={sound.id}
                      onClick={() => {
                        onSoundChange(sound.id);
                        // 选择音乐时不关闭面板
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${currentSoundId === sound.id ? (isNeomorphic ? `${isDark ? 'bg-[#3a3f4e] text-blue-300 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.3),inset_-6px_-6px_12px_rgba(58,63,78,0.8)]' : 'bg-[#d0d5dc] text-blue-600 shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(208,213,220,1)]'}` : isDark ? 'bg-zinc-800 text-white' : 'bg-blue-50 text-blue-600') : (isNeomorphic ? `${isDark ? 'bg-[#1e1e2e] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(40,43,52,1)] active:shadow-[inset_8px_8px_16px_rgba(0,0,0,0.4),inset_-8px_-8px_16px_rgba(40,43,52,0.9)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'} active:scale-[0.98]` : isDark ? 'hover:bg-zinc-700 text-zinc-300' : 'hover:bg-slate-100 text-slate-700')}`}
                    >
                      <span className={`text-[9px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'} w-4`}>{sounds.findIndex(s => s.id === sound.id) + 1}.</span>
                      <IconComponent size={16} className={isDark ? (sound.id === 'mute' ? 'text-zinc-400' : 'text-zinc-300') : sound.color} />
                      <span className={`text-xs font-medium ${isDark ? 'text-zinc-300' : isNeomorphic ? 'text-zinc-700' : 'text-slate-700'}`}>{sound.name}</span>
                    </button>
                  );
                })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedBgMusicSelector;