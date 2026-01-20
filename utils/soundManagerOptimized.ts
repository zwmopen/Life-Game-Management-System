// 统一音效管理库 - 优化版本
import audioManager from './audioManagerOptimized';
import audioStatistics from './audioStatistics';

interface SoundEffect {
  id: string;
  url: string;
  volume?: number;
  loop?: boolean;
}

class SoundManager {
  private sounds: Record<string, HTMLAudioElement> = {};
  private backgroundMusic: Record<string, HTMLAudioElement> = {};
  private currentBackgroundMusicId: string | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.5;
  private bgmVolume: number = 0.3;
  private selectedMusicIds: Set<string> = new Set(); // 选中的音乐ID集合，用于循环播放
  private lockedMusicIds: Set<string> = new Set(); // 锁定的音乐ID集合，不会被其他音乐停止
  private currentPlayRequestId: string | null = null; // 当前正在处理的播放请求ID，用于防止竞态条件
  
  // 添加页面可见性变化监听，确保音乐在后台运行
  private visibilityChangeHandler: (() => void) | null = null;

  constructor() {
    // 初始化音效列表
    this.initSounds();
    this.initBackgroundMusic();
    
    // 监听页面可见性变化，确保音乐在后台运行
    this.setupVisibilityListener();
  }

  private initSounds(): void {
    const soundList: SoundEffect[] = [
      // 本地音效
      { id: 'dice', url: '/audio/sounds/dice.mp3', volume: 0.7 },
      // 使用在线音效作为主要来源，因为本地文件可能缺少
      { id: 'taskComplete', url: 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3', volume: 0.5 },
      { id: 'taskGiveUp', url: 'https://assets.mixkit.co/sfx/preview/mixkit-game-show-wrong-answer-buzz-950.mp3', volume: 0.5 },
      { id: 'purchase', url: 'https://assets.mixkit.co/sfx/preview/mixkit-coins-spinning-in-hands-1933.mp3', volume: 0.5 },
      // 回退音效
      { id: 'dice-fallback', url: 'https://assets.mixkit.co/sfx/preview/mixkit-dice-roll-6125.mp3', volume: 0.7 },
      { id: 'taskComplete-fallback', url: 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3', volume: 0.5 },
      { id: 'taskGiveUp-fallback', url: 'https://assets.mixkit.co/sfx/preview/mixkit-game-show-wrong-answer-buzz-950.mp3', volume: 0.5 },
      { id: 'purchase-fallback', url: 'https://assets.mixkit.co/sfx/preview/mixkit-coins-spinning-in-hands-1933.mp3', volume: 0.5 }
    ];

    soundList.forEach(sound => {
      try {
        const audio = new Audio(sound.url);
        audio.volume = sound.volume ?? this.masterVolume;
        this.sounds[sound.id] = audio;
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Error initializing sound ${sound.id}:`, e);
        }
      }
    });
  }

  private initBackgroundMusic(): void {
    // 初始化常用背景音乐
    // 使用实际存在的文件路径：public/audio/pomodoro/bgm/
    const bgmList = [
      { id: 'forest', url: '/audio/pomodoro/bgm/森林.mp3', volume: 0.3 },
      { id: 'rain', url: '/audio/pomodoro/bgm/雨天.mp3', volume: 0.3 },
      { id: 'ocean', url: '/audio/pomodoro/bgm/海洋.mp3', volume: 0.3 },
      { id: 'cafe', url: '/audio/pomodoro/bgm/咖啡馆.mp3', volume: 0.3 },
      { id: 'white-noise', url: '/audio/pomodoro/bgm/风扇.mp3', volume: 0.3 }
    ];

    bgmList.forEach(bgm => {
      try {
        const audio = new Audio(bgm.url);
        audio.loop = true;
        audio.volume = bgm.volume ?? this.bgmVolume;
        this.backgroundMusic[bgm.id] = audio;
        // 预加载音频，确保播放时不会延迟
        // 注意：audio.load() 方法在所有浏览器中都返回 undefined，不是 Promise
        // 因此不应该调用 catch() 方法
        audio.load();
        // 监听音频加载错误，而不是使用 Promise catch
        audio.addEventListener('error', (e) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Error preloading background music ${bgm.id}:`, e);
          }
        });
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Error initializing background music ${bgm.id}:`, e);
        }
      }
    });
  }

  private setupVisibilityListener(): void {
    this.visibilityChangeHandler = () => {
      if (document.hidden) {
        // 页面隐藏时，继续播放背景音乐
        if (this.currentBackgroundMusicId) {
          const audio = this.backgroundMusic[this.currentBackgroundMusicId];
          if (audio && !this.isMuted) {
            // 不做任何特殊处理，让音频继续播放
          }
        }
      } else {
        // 页面显示时，检查是否需要恢复播放
      }
    };

    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  // 播放音效
  playSoundEffect(soundId: string): void {
    if (this.isMuted) return;

    try {
      const audio = this.sounds[soundId] || this.sounds[`${soundId}-fallback`];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error playing sound effect:', e);
          }
          // 如果播放失败，尝试直接使用在线音效
          this.playFallbackSound(soundId);
        });
      } else {
        // 如果没有找到对应的音效，尝试播放回退音效
        this.playFallbackSound(soundId);
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Unexpected error playing sound effect:', e);
      }
    }
  }

  // 播放回退音效
  private playFallbackSound(soundId: string): void {
    try {
      // 直接创建音频元素播放回退音效
      let fallbackUrl = '';
      switch (soundId) {
        case 'taskComplete':
          fallbackUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3';
          break;
        case 'taskGiveUp':
          fallbackUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-game-show-wrong-answer-buzz-950.mp3';
          break;
        case 'purchase':
          fallbackUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-coins-spinning-in-hands-1933.mp3';
          break;
        case 'dice':
          fallbackUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-dice-roll-6125.mp3';
          break;
        default:
          fallbackUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3';
      }

      if (fallbackUrl) {
        const audio = new Audio(fallbackUrl);
        audio.volume = this.masterVolume;
        audio.play().catch(e => {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error playing fallback sound:', e);
          }
        });
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error playing fallback sound:', e);
      }
    }
  }

  // 获取选中的音乐ID列表
  getSelectedMusicIds(): Set<string> {
    return new Set(this.selectedMusicIds);
  }

  // 获取锁定的音乐ID列表
  getLockedMusicIds(): Set<string> {
    return new Set(this.lockedMusicIds);
  }

  // 切换音乐锁定状态（用于双击锁定/解锁歌曲）
  toggleSelectedMusic(musicId: string): boolean {
    if (this.lockedMusicIds.has(musicId)) {
      // 如果已经锁定，解锁并停止播放
      this.stopSpecificMusic(musicId);
      this.lockedMusicIds.delete(musicId);
      this.selectedMusicIds.delete(musicId);
      return false;
    } else {
      // 如果未锁定，锁定并添加到选中列表
      this.lockedMusicIds.add(musicId);
      this.selectedMusicIds.add(musicId);
      
      // 立即开始播放该音乐
      this.playBackgroundMusic(musicId);
      
      return true;
    }
  }

  // 清除所有选中的音乐
  clearSelectedMusic(): void {
    // 只清除普通选中的音乐，不清除锁定的音乐
    this.selectedMusicIds.forEach(musicId => {
      if (!this.lockedMusicIds.has(musicId)) {
        this.stopSpecificMusic(musicId);
      }
    });
    // 重新设置选中列表，只保留锁定的音乐
    this.selectedMusicIds = new Set(this.lockedMusicIds);
  }

  // 停止特定音乐
  private stopSpecificMusic(musicId: string): void {
    const audio = this.backgroundMusic[musicId];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      // 停止跟踪播放时长
      audioStatistics.stopTrackingPlayTime(musicId);
    }
  }

  // 播放背景音乐（单击播放）
  async playBackgroundMusic(musicId: string): Promise<void> {
    if (this.isMuted) {
      return;
    }

    try {
      // 停止所有非锁定的背景音乐
      this.selectedMusicIds.forEach(id => {
        if (!this.lockedMusicIds.has(id) && id !== musicId) {
          this.stopSpecificMusic(id);
          // 停止跟踪其他音乐的播放时长
          audioStatistics.stopTrackingPlayTime(id);
        }
      });

      // 更新选中的音乐列表：移除所有非锁定的音乐，添加当前音乐
      const newSelectedMusicIds = new Set(this.lockedMusicIds);
      newSelectedMusicIds.add(musicId);
      this.selectedMusicIds = newSelectedMusicIds;

      // 更新当前播放的音乐ID
      this.currentBackgroundMusicId = musicId;
      
      // 记录当前请求的音乐ID，用于防止竞态条件
      this.currentPlayRequestId = musicId;
      
      // 记录播放次数
      audioStatistics.recordPlay(musicId);
      // 开始跟踪播放时长
      audioStatistics.startTrackingPlayTime(musicId);
      
      // 尝试从预设列表播放
      if (this.backgroundMusic[musicId]) {
        try {
          await this.backgroundMusic[musicId].play();
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error playing background music:', e);
          }
          // 如果播放失败，尝试从audioManager获取
          await this.playBackgroundMusicFromManager(musicId);
        }
      } else {
        // 从audioManager获取音乐文件并播放
        await this.playBackgroundMusicFromManager(musicId);
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Unexpected error playing background music:', e);
      }
    }
  }

  // 从audioManager播放背景音乐
  private async playBackgroundMusicFromManager(musicId: string): Promise<void> {
    try {
      // 从audioManager获取音乐文件
      const bgmFiles = audioManager.getBackgroundMusic();
      
      // 更精确地查找音乐文件，优先匹配ID，然后尝试匹配名称
      let musicFile = bgmFiles.find(bgm => bgm.id === musicId);
      
      // 如果没有找到，尝试直接匹配音乐名称
      if (!musicFile) {
        musicFile = bgmFiles.find(bgm => bgm.name.toLowerCase() === musicId.toLowerCase());
      }
      
      // 如果仍然没有找到，尝试通过ID的最后部分匹配文件名（兼容旧的简单ID格式）
      if (!musicFile) {
        const idParts = musicId.split('_');
        const fileNamePart = idParts[idParts.length - 1];
        musicFile = bgmFiles.find(bgm => bgm.name.toLowerCase().includes(fileNamePart.toLowerCase()));
      }
      
      // 如果仍然没有找到，尝试通过文件名匹配URL
      if (!musicFile) {
        musicFile = bgmFiles.find(bgm => bgm.url.includes(musicId));
      }
      
      if (musicFile) {
        // 创建临时音频元素播放背景音乐
        const tempAudio = new Audio(musicFile.url);
        tempAudio.loop = true;
        tempAudio.volume = this.bgmVolume;
        
        // 添加到backgroundMusic集合 BEFORE playing, 这样如果用户快速点击另一首歌，它会被包含在stopBackgroundMusic()中
        this.backgroundMusic[musicId] = tempAudio;
        
        try {
          await tempAudio.play();
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`Successfully playing background music: ${musicId} from URL: ${musicFile.url}`);
          }
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error playing background music from manager:', e);
          }
          // 播放失败时，从集合中移除
          delete this.backgroundMusic[musicId];
        }
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in playBackgroundMusicFromManager:', e);
      }
    }
  }

  // 停止背景音乐
  stopBackgroundMusic(): void {
    // 停止所有背景音乐，包括锁定的音乐
    Object.entries(this.backgroundMusic).forEach(([id, audio]) => {
      if (audio) {
        try {
          // 标准的停止和重置音频
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error stopping audio:', e);
          }
        }
      }
    });
    this.currentBackgroundMusicId = null;
    this.currentPlayRequestId = null; // 重置当前播放请求ID
    
    // 清除所有音乐项的播放状态
    this.selectedMusicIds.clear();
  }

  // 切换静音状态
  toggleMute(): void {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      // 静音操作具有最高优先级，不受其他锁定状态的限制
      // 停止所有正在播放的音乐
      this.stopAllSounds();
      
      // 清除所有音乐项的锁定状态
      this.lockedMusicIds.clear();
      
      // 清除所有音乐项的播放状态
      this.selectedMusicIds.clear();
      
      // 重置当前播放的音乐ID
      this.currentBackgroundMusicId = null;
      this.currentPlayRequestId = null;
    } else {
      // 如果取消静音，此时没有选中的音乐，不自动恢复播放
    }
  }

  // 设置总音量
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    
    // 更新所有已存在的音效音量
    Object.values(this.sounds).forEach(audio => {
      audio.volume = this.masterVolume;
    });
  }

  // 设置背景音乐音量
  setBackgroundMusicVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    
    // 更新所有已存在的背景音乐音量
    Object.values(this.backgroundMusic).forEach(audio => {
      audio.volume = this.bgmVolume;
    });
  }

  // 停止所有声音
  stopAllSounds(): void {
    // 停止所有音效
    Object.values(this.sounds).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });

    // 停止所有音乐的播放时长跟踪
    Object.keys(this.backgroundMusic).forEach(musicId => {
      audioStatistics.stopTrackingPlayTime(musicId);
    });

    // 停止背景音乐
    this.stopBackgroundMusic();
  }

  // 获取当前播放的背景音乐ID
  getCurrentBackgroundMusicId(): string | null {
    return this.currentBackgroundMusicId;
  }

  // 获取是否静音
  getIsMuted(): boolean {
    return this.isMuted;
  }

  // 获取总音量
  getMasterVolume(): number {
    return this.masterVolume;
  }

  // 获取背景音乐音量
  getBackgroundMusicVolume(): number {
    return this.bgmVolume;
  }

  // 清理资源
  destroy(): void {
    this.stopAllSounds();
    
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
  }

  // 播放自定义音频文件
  async playCustomAudio(url: string, volume?: number, loop: boolean = false): Promise<HTMLAudioElement | null> {
    if (this.isMuted) return null;

    try {
      const audio = new Audio(url);
      audio.volume = volume ?? this.masterVolume;
      audio.loop = loop;
      
      await audio.play();
      return audio;
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error playing custom audio:', e);
      }
      return null;
    }
  }

  // 从audioManager播放音频
  async playAudioFromManager(audioId: string, volume?: number): Promise<HTMLAudioElement | null> {
    if (this.isMuted) return null;

    const bgmFiles = audioManager.getBackgroundMusic();
    const soundFiles = audioManager.getSoundEffects();
    const allFiles = [...bgmFiles, ...soundFiles];
    
    const audioFile = allFiles.find(file => file.id === audioId || file.name.toLowerCase().includes(audioId.toLowerCase()));
    
    if (audioFile) {
      return audioManager.playAudio(audioFile.url, volume ?? this.masterVolume);
    }
    
    return null;
  }
}

// 创建单例实例
const soundManager = new SoundManager();
export default soundManager;

// 导出类型定义
export type { SoundEffect };