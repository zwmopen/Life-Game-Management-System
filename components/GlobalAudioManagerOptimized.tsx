import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import soundManager from '../utils/soundManagerOptimized';

interface GlobalAudioContextType {
  currentBgMusicId: string | null;
  isBgMusicPlaying: boolean;
  isMuted: boolean;
  playBgMusic: (id: string) => Promise<void>;
  toggleSelectedMusic: (id: string) => boolean;
  getSelectedMusicIds: () => Set<string>;
  getLockedMusicIds: () => Set<string>;
  stopBgMusic: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  resumeBgMusic: () => void;
  playSoundEffect: (effectName: string) => Promise<void>;
}

const GlobalAudioContext = createContext<GlobalAudioContextType | undefined>(undefined);

export const useGlobalAudio = () => {
  const context = useContext(GlobalAudioContext);
  if (!context) {
    throw new Error('useGlobalAudio must be used within a GlobalAudioProvider');
  }
  return context;
};

interface GlobalAudioProviderProps {
  children: React.ReactNode;
}

// 本地存储键名
const STORAGE_KEYS = {
  LAST_BG_MUSIC_ID: 'last-bg-music-id',
  IS_BG_MUSIC_PLAYING: 'is-bg-music-playing'
};

export const GlobalAudioProvider: React.FC<GlobalAudioProviderProps> = ({ children }) => {
  // 从本地存储加载上次选择的背景音乐
  const loadLastBgMusicFromStorage = useCallback((): string | null => {
    try {
      const storedId = localStorage.getItem(STORAGE_KEYS.LAST_BG_MUSIC_ID);
      return storedId || null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load last background music from storage:', error);
      }
      return null;
    }
  }, []);
  
  // 保存背景音乐选择到本地存储
  const saveBgMusicToStorage = useCallback((id: string | null, isPlaying: boolean) => {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.LAST_BG_MUSIC_ID, id);
        localStorage.setItem(STORAGE_KEYS.IS_BG_MUSIC_PLAYING, JSON.stringify(isPlaying));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to save background music to storage:', error);
      }
    }
  }, []);
  
  const [currentBgMusicId, setCurrentBgMusicId] = useState<string | null>(loadLastBgMusicFromStorage());
  const [isBgMusicPlaying, setIsBgMusicPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());

  const [volume, setVolume] = useState(soundManager.getBackgroundMusicVolume());
  
  // 用于跟踪当前播放的音乐ID
  const currentMusicIdRef = useRef<string | null>(currentBgMusicId);
  const lastPlayedMusicIdRef = useRef<string | null>(currentBgMusicId);
  
  // 保存最后播放的音乐信息，以便在组件重新挂载时恢复
  const lastPlayedMusicInfoRef = useRef({
    id: currentBgMusicId,
    isPlaying: false
  });

  // 使用useCallback优化函数定义，避免不必要的重创建
  const playBgMusic = useCallback(async (id: string) => {
    if (id === 'mute' || id === 'off') {
      stopBgMusic();
      setCurrentBgMusicId(null);
      currentMusicIdRef.current = null;
      lastPlayedMusicIdRef.current = null;
      setIsBgMusicPlaying(false);
      // 更新最后播放信息
      lastPlayedMusicInfoRef.current = { id: null, isPlaying: false };
      saveBgMusicToStorage(null, false);
      return;
    }

    try {
      // 立即更新UI状态，不等待音频播放，确保响应迅速
      setCurrentBgMusicId(id);
      currentMusicIdRef.current = id;
      lastPlayedMusicIdRef.current = id; // 记录最后播放的音乐ID
      setIsBgMusicPlaying(true);
      // 更新最后播放信息
      lastPlayedMusicInfoRef.current = { id, isPlaying: true };
      saveBgMusicToStorage(id, true);
      
      // 使用 soundManager 播放背景音乐
      await soundManager.playBackgroundMusic(id);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to play background music:', error);
      }
      // 如果播放失败，恢复状态
      setIsBgMusicPlaying(false);
    }
  }, [saveBgMusicToStorage]);

  const stopBgMusic = useCallback(() => {
    soundManager.stopBackgroundMusic();
    setCurrentBgMusicId(null);
    currentMusicIdRef.current = null;
    lastPlayedMusicIdRef.current = null;
    setIsBgMusicPlaying(false);
    // 更新最后播放信息
    lastPlayedMusicInfoRef.current = { id: null, isPlaying: false };
    saveBgMusicToStorage(null, false);
  }, [saveBgMusicToStorage]);

  const resumeBgMusic = useCallback(() => {
    if (lastPlayedMusicIdRef.current && !isMuted) {
      playBgMusic(lastPlayedMusicIdRef.current);
    }
  }, [isMuted, playBgMusic, saveBgMusicToStorage]);

  // 组件挂载时，如果有上次选择的背景音乐且未静音，监听用户交互后自动播放
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (currentBgMusicId && !isMuted) {
        try {
          await playBgMusic(currentBgMusicId);
        } catch (error) {
          // 忽略自动播放错误，用户可以手动触发播放
          if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to auto-play background music on user interaction:', error);
          }
        }
        // 移除事件监听器，只在第一次交互时尝试播放
        window.removeEventListener('click', handleUserInteraction);
        window.removeEventListener('keydown', handleUserInteraction);
        window.removeEventListener('touchstart', handleUserInteraction);
      }
    };

    if (currentBgMusicId && !isMuted) {
      // 添加用户交互事件监听器
      window.addEventListener('click', handleUserInteraction);
      window.addEventListener('keydown', handleUserInteraction);
      window.addEventListener('touchstart', handleUserInteraction);
    }

    return () => {
      // 清理事件监听器
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [currentBgMusicId, isMuted, playBgMusic]);

  const toggleMute = useCallback(() => {
    soundManager.toggleMute();
    // 静音状态由effect监听更新
  }, []);

  const setVolumeHandler = useCallback((volume: number) => {
    soundManager.setBackgroundMusicVolume(volume);
    setVolume(volume);
  }, []);

  // 切换音乐选中状态（用于双击添加/移除歌曲）
  const toggleSelectedMusic = useCallback((id: string) => {
    return soundManager.toggleSelectedMusic(id);
  }, []);

  // 获取选中的音乐ID列表
  const getSelectedMusicIds = useCallback(() => {
    return soundManager.getSelectedMusicIds();
  }, []);

  // 获取锁定的音乐ID列表
  const getLockedMusicIds = useCallback(() => {
    return soundManager.getLockedMusicIds();
  }, []);

  // 播放音效
  const playSoundEffect = useCallback(async (effectName: string) => {
    try {
      await soundManager.playSoundEffect(effectName);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to play sound effect:', error);
      }
    }
  }, []);

  // 监听全局静音状态变化
  useEffect(() => {
    const handleMuteChange = () => {
      const newMutedState = soundManager.getIsMuted();
      setIsMuted(newMutedState);
    };

    // 初始化时同步状态
    setIsMuted(soundManager.getIsMuted());
    
    // 每秒检查一次静音状态
    const interval = setInterval(handleMuteChange, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // 恢复之前的播放状态（在组件重新挂载时）
  useEffect(() => {
    // 当组件挂载时，检查是否有需要恢复的播放状态
    if (lastPlayedMusicInfoRef.current.id && lastPlayedMusicInfoRef.current.isPlaying && !isMuted) {
      // 使用setTimeout确保在下一个事件循环中执行，避免与其他effect冲突
      const timer = setTimeout(() => {
        playBgMusic(lastPlayedMusicInfoRef.current.id!);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isMuted, playBgMusic]);

  // 当应用失去焦点再回来时，检查是否需要恢复音乐播放
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 
          lastPlayedMusicInfoRef.current.isPlaying && 
          lastPlayedMusicInfoRef.current.id && 
          !isMuted) {
        // 页面可见时，如果之前正在播放音乐且没有静音，则恢复播放
        setTimeout(() => {
          if (!soundManager.getCurrentBackgroundMusicId()) {
            playBgMusic(lastPlayedMusicInfoRef.current.id!);
          }
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMuted, playBgMusic]);

  // 使用useMemo优化context value，避免不必要的重渲染
  const contextValue = useMemo(() => ({
    currentBgMusicId,
    isBgMusicPlaying,
    isMuted,
    playBgMusic,
    toggleSelectedMusic,
    getSelectedMusicIds,
    getLockedMusicIds,
    stopBgMusic,
    toggleMute,
    setVolume: setVolumeHandler,
    resumeBgMusic,
    playSoundEffect
  }), [
    currentBgMusicId,
    isBgMusicPlaying,
    isMuted,
    playBgMusic,
    toggleSelectedMusic,
    getSelectedMusicIds,
    getLockedMusicIds,
    stopBgMusic,
    toggleMute,
    setVolumeHandler,
    resumeBgMusic,
    playSoundEffect
  ]);

  return (
    <GlobalAudioContext.Provider value={contextValue}>
      {children}
    </GlobalAudioContext.Provider>
  );
};

// 全局背景音乐管理器组件 - 用于在应用顶层维护音乐播放状态
export const GlobalBackgroundMusicManager: React.FC = () => {
  const { 
    currentBgMusicId, 
    isBgMusicPlaying, 
    isMuted,
    playBgMusic,
    resumeBgMusic
  } = useGlobalAudio();
  
  // 监听全局音频状态变化，确保音乐持续播放
  useEffect(() => {
    // 当组件挂载时，如果有之前播放的音乐且未静音，则恢复播放
    if (currentBgMusicId && !isMuted && !isBgMusicPlaying) {
      // 延迟执行以确保其他组件状态已经稳定
      const timer = setTimeout(() => {
        resumeBgMusic();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentBgMusicId, isMuted, isBgMusicPlaying, resumeBgMusic]);
  
  // 监听页面可见性变化，确保音乐在后台运行
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 
          currentBgMusicId && 
          !isMuted && 
          !isBgMusicPlaying) {
        // 页面重新可见时，如果之前正在播放音乐且未静音但当前未播放，则恢复播放
        setTimeout(() => {
          resumeBgMusic();
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentBgMusicId, isMuted, isBgMusicPlaying, resumeBgMusic]);
  
  // 这个组件本身不渲染任何UI，只是用于维护全局音频状态
  return null;
};