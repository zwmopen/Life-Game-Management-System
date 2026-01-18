import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import soundManager from '../utils/soundManager';

interface GlobalAudioContextType {
  currentBgMusicId: string | null;
  isBgMusicPlaying: boolean;
  isMuted: boolean;
  playBgMusic: (id: string) => Promise<void>;
  stopBgMusic: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  resumeBgMusic: () => void;
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

export const GlobalAudioProvider: React.FC<GlobalAudioProviderProps> = ({ children }) => {
  const [currentBgMusicId, setCurrentBgMusicId] = useState<string | null>(null);
  const [isBgMusicPlaying, setIsBgMusicPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [volume, setVolume] = useState(soundManager.getBgmVolume());
  
  // 用于跟踪当前播放的音乐ID
  const currentMusicIdRef = useRef<string | null>(null);
  const lastPlayedMusicIdRef = useRef<string | null>(null);
  
  // 保存最后播放的音乐信息，以便在组件重新挂载时恢复
  const lastPlayedMusicInfoRef = useRef({
    id: null as string | null,
    isPlaying: false
  });

  // 监听全局静音状态变化
  useEffect(() => {
    const handleMuteChange = () => {
      setIsMuted(soundManager.getIsMuted());
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
  }, []);

  // 播放背景音乐
  const playBgMusic = async (id: string) => {
    if (id === 'mute' || id === 'off') {
      stopBgMusic();
      setCurrentBgMusicId(null);
      currentMusicIdRef.current = null;
      lastPlayedMusicIdRef.current = null;
      setIsBgMusicPlaying(false);
      // 更新最后播放信息
      lastPlayedMusicInfoRef.current = { id: null, isPlaying: false };
      return;
    }

    try {
      // 使用 soundManager 播放背景音乐
      await soundManager.playBackgroundMusic(id);
      setCurrentBgMusicId(id);
      currentMusicIdRef.current = id;
      lastPlayedMusicIdRef.current = id; // 记录最后播放的音乐ID
      setIsBgMusicPlaying(true);
      // 更新最后播放信息
      lastPlayedMusicInfoRef.current = { id, isPlaying: true };
    } catch (error) {
      console.error('Failed to play background music:', error);
    }
  };

  // 停止背景音乐
  const stopBgMusic = () => {
    soundManager.stopCurrentBackgroundMusic();
    setCurrentBgMusicId(null);
    currentMusicIdRef.current = null;
    setIsBgMusicPlaying(false);
    // 更新最后播放信息
    lastPlayedMusicInfoRef.current = { id: null, isPlaying: false };
  };

  // 恢复背景音乐播放
  const resumeBgMusic = () => {
    if (lastPlayedMusicIdRef.current && !isMuted) {
      playBgMusic(lastPlayedMusicIdRef.current);
    }
  };

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

  // 切换静音状态
  const toggleMute = () => {
    const newMutedState = soundManager.toggleMute();
    setIsMuted(newMutedState);
  };

  // 设置音量
  const setVolumeHandler = (volume: number) => {
    soundManager.setBgmVolume(volume);
    setVolume(volume);
  };

  // 监听全局静音状态变化
  useEffect(() => {
    const handleMuteChange = () => {
      const newMutedState = soundManager.getIsMuted();
      // 只在状态真正改变时才更新，避免不必要的重渲染
      if (newMutedState !== isMuted) {
        setIsMuted(newMutedState);
        
        // 如果静音状态改变，并且之前正在播放音乐，则更新播放状态
        if (currentBgMusicId && lastPlayedMusicInfoRef.current.isPlaying) {
          if (newMutedState) {
            // 如果变为静音，停止播放但保留状态信息
            soundManager.pauseBackgroundMusic();
            setIsBgMusicPlaying(false);
          } else {
            // 如果取消静音，恢复播放
            soundManager.resumeBackgroundMusic();
            setIsBgMusicPlaying(true);
          }
        }
      }
    };

    // 初始化时同步状态
    setIsMuted(soundManager.getIsMuted());
    
    // 每秒检查一次静音状态，减少不必要的轮询
    const interval = setInterval(handleMuteChange, 1000);
    
    return () => clearInterval(interval);
  }, [currentBgMusicId, isMuted]);

  const contextValue: GlobalAudioContextType = {
    currentBgMusicId,
    isBgMusicPlaying,
    isMuted,
    playBgMusic,
    stopBgMusic,
    toggleMute,
    setVolume: setVolumeHandler,
    resumeBgMusic
  };

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