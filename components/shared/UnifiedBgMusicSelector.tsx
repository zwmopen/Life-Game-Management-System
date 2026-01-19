import React, { useState, useRef, useCallback } from 'react';
import { VolumeX, Music, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Theme } from '../../types';
import Button from './Button';
import { useGlobalAudio } from '../GlobalAudioManagerOptimized';

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
  className?: string;
  isVisible?: boolean;
  onClose?: () => void;
  // 兼容旧代码，可选属性
  currentSoundId?: string;
  onSoundChange?: (soundId: string) => void;
}

// 图标映射函数
const getIconComponentByName = (name: string) => {
  return Music; // 统一使用音乐图标
};

const UnifiedBgMusicSelector: React.FC<UnifiedBgMusicSelectorProps> = ({
  theme,
  currentSoundId: externalCurrentSoundId,
  onSoundChange: externalOnSoundChange,
  className = '',
  isVisible,
  onClose
}) => {
  // 直接使用默认音频列表，避免动态加载可能导致的问题
  const defaultSounds: Sound[] = [
    { id: 'mute', name: '静音', url: "", icon: VolumeX, color: 'text-zinc-500', hex: '#6b7280' },
    { id: 'forest', name: '迷雾森林', url: '/audio/pomodoro/bgm/森林.mp3', icon: Music, color: 'text-blue-500', hex: '#3b82f6' },
    { id: 'rain', name: '雨声', url: '/audio/pomodoro/bgm/雨天.mp3', icon: Music, color: 'text-blue-500', hex: '#3b82f6' },
    { id: 'ocean', name: '海浪声', url: '/audio/pomodoro/bgm/海洋.mp3', icon: Music, color: 'text-blue-500', hex: '#3b82f6' },
    { id: 'cafe', name: '咖啡馆', url: '/audio/pomodoro/bgm/咖啡馆.mp3', icon: Music, color: 'text-blue-500', hex: '#3b82f6' },
    { id: 'white-noise', name: '风扇', url: '/audio/pomodoro/bgm/风扇.mp3', icon: Music, color: 'text-blue-500', hex: '#3b82f6' }
  ];
  
  const [sounds] = useState<Sound[]>(defaultSounds);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // 使用全局音频上下文
  const { currentBgMusicId, playBgMusic: globalPlayBgMusic } = useGlobalAudio();

  // 只使用全局音频上下文
  const currentSoundId = currentBgMusicId || 'mute';

  // 只使用全局playBgMusic
  const handleSoundChange = useCallback(async (soundId: string) => {
    try {
      await globalPlayBgMusic(soundId);
      
      // 兼容旧代码：如果有外部回调，也调用它
      externalOnSoundChange?.(soundId);
    } catch (error) {
      console.error('Error playing background music:', error);
      // 兼容旧代码：如果全局播放失败，尝试使用外部回调
      externalOnSoundChange?.(soundId);
    }
  }, [globalPlayBgMusic, externalOnSoundChange]);

  const isDark = theme.includes('dark');
  const isNeomorphic = theme.startsWith('neomorphic');

  // 快速切换上一个音乐
  const handlePrevSound = () => {
    if (sounds.length <= 1) return;
    const filteredSounds = sounds.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filteredSounds.length <= 1) return;
    
    const currentIndex = filteredSounds.findIndex(s => s.id === currentSoundId);
    if (currentIndex === -1) {
      handleSoundChange(filteredSounds[filteredSounds.length - 1].id);
      return;
    }
    const prevIndex = (currentIndex - 1 + filteredSounds.length) % filteredSounds.length;
    handleSoundChange(filteredSounds[prevIndex].id);
  };

  // 快速切换下一个音乐
  const handleNextSound = () => {
    if (sounds.length <= 1) return;
    const filteredSounds = sounds.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filteredSounds.length <= 1) return;
    
    const currentIndex = filteredSounds.findIndex(s => s.id === currentSoundId);
    if (currentIndex === -1) {
      handleSoundChange(filteredSounds[0].id);
      return;
    }
    const nextIndex = (currentIndex + 1) % filteredSounds.length;
    handleSoundChange(filteredSounds[nextIndex].id);
  };

  // 确保isVisible为false时不渲染任何内容
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-[1000]" onClick={onClose}>
      <div 
        ref={menuRef}
        className={`w-56 sm:w-64 md:w-72 rounded-xl p-4 z-[1001] overflow-hidden ${isNeomorphic ? (isDark ? 'bg-[#1e1e2e] border border-zinc-700 shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] border border-slate-300 shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]') : isDark ? 'bg-zinc-900/95 border border-zinc-800' : 'bg-white/95 border border-slate-200 shadow-[10px_10px_20px_rgba(163,177,198,0.4),-10px_-10px_20px_rgba(255,255,255,0.6)]'}`}
        onClick={(e) => e.stopPropagation()} // 阻止事件冒泡，防止点击菜单内部关闭菜单
      >
        {/* 标题和关闭按钮 */}
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-semibold ${isDark ? 'text-zinc-300' : isNeomorphic ? 'text-zinc-700' : 'text-slate-700'}`}>选择背景音乐</h3>
          <Button
            onClick={onClose}
            variant="primary"
            size="small"
            isNeomorphic={isNeomorphic}
            theme={theme}
            className={`p-1 transition-all duration-200`}
            title="关闭"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        </div>

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
            
            <div className="flex items-center gap-2 px-3">
              <Button
                onClick={handlePrevSound}
                variant="primary"
                size="small"
                isNeomorphic={isNeomorphic}
                theme={theme}
                className={`p-2 transition-all duration-200 flex-shrink-0 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}
                title="上一个音乐"
              >
                <ChevronLeft size={20} />
              </Button>
              
              <Button
                onClick={handleNextSound}
                variant="primary"
                size="small"
                isNeomorphic={isNeomorphic}
                theme={theme}
                className={`p-2 transition-all duration-200 flex-shrink-0 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}
                title="下一个音乐"
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto px-3">
          {/* 过滤后的音效列表 */}
          {sounds
            .filter(sound => sound.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(sound => {
              const IconComponent = sound.icon;
              return (
                <Button 
                    key={sound.id}
                    onClick={() => {
                      handleSoundChange(sound.id);
                      onClose?.();
                    }}
                    variant={currentSoundId === sound.id ? 'primary' : 'primary'}
                    size="medium"
                    isNeomorphic={isNeomorphic}
                    theme={theme}
                    className={`flex items-center gap-2 px-4 py-2.5 transition-all cursor-pointer ${currentSoundId === sound.id ? (isNeomorphic ? `${isDark ? 'bg-[#2d3748] text-blue-400 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-3px_-3px_6px_rgba(45,55,72,0.6)]' : 'bg-blue-500 text-white shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2),inset_-3px_-3px_6px_rgba(59,130,246,0.8)]'}` : isDark ? 'bg-blue-900/40 text-blue-400 border-2 border-blue-700/50' : 'bg-blue-500 text-white border-2 border-blue-600') : (isNeomorphic ? `${isDark ? 'bg-[#1e1e2e] shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(30,30,46,0.6)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.4),-6px_-6px_12px_rgba(30,30,46,0.8)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.6)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]'} active:scale-[0.98]` : isDark ? 'hover:bg-zinc-700 text-zinc-300' : 'hover:bg-slate-100 text-slate-700')} w-full`}
                    >
                  <span className={`text-[9px] ${currentSoundId === sound.id ? (isDark ? 'text-blue-400' : 'text-white') : (isDark ? 'text-zinc-400' : 'text-zinc-500')} w-4`}>{sounds.findIndex(s => s.id === sound.id) + 1}.</span>
                  <IconComponent size={16} className={currentSoundId === sound.id ? (isDark ? 'text-blue-400' : 'text-white') : (isDark ? (sound.id === 'mute' ? 'text-zinc-400' : 'text-zinc-300') : sound.color)} />
                  <span className={`text-xs font-medium ${currentSoundId === sound.id ? (isDark ? 'text-blue-400' : 'text-white') : (isDark ? 'text-zinc-300' : isNeomorphic ? 'text-zinc-700' : 'text-slate-700')}`}>{sound.name}</span>
                </Button>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default UnifiedBgMusicSelector;