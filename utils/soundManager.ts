// 统一音效管理库
import audioManager from './audioManager';

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
      { id: 'dice', url: '/audio/sounds/dice.mp3', volume: 0.7 },
      { id: 'taskComplete', url: '/audio/sounds/task-complete.mp3', volume: 0.5 },
      { id: 'taskGiveUp', url: '/audio/sounds/task-give-up.mp3', volume: 0.5 },
      { id: 'purchase', url: '/audio/sounds/purchase.mp3', volume: 0.5 },
      // 使用在线音效作为回退
      { id: 'dice-fallback', url: 'https://assets.mixkit.co/sfx/preview/mixkit-dice-roll-6125.mp3', volume: 0.7 },
      { id: 'positive', url: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3', volume: 0.5 },
      { id: 'coin', url: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3', volume: 0.5 },
      { id: 'spend', url: 'https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3', volume: 0.5 },
      { id: 'achievement', url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', volume: 0.5 },
    ];

    soundList.forEach(sound => {
      this.loadSound(sound);
    });
  }

  private async initBackgroundMusic(): Promise<void> {
    // 首先加载默认和在线回退音频
    const defaultBgmList: SoundEffect[] = [
      { id: 'forest', url: '/audio/bgm/forest.mp3', volume: 0.3, loop: true },
      { id: 'alpha', url: '/audio/bgm/alpha.mp3', volume: 0.3, loop: true },
      { id: 'theta', url: '/audio/bgm/theta.mp3', volume: 0.3, loop: true },
      { id: 'beta', url: '/audio/bgm/beta.mp3', volume: 0.3, loop: true },
      { id: 'ocean', url: '/audio/bgm/ocean.mp3', volume: 0.3, loop: true },
      { id: 'rain', url: '/audio/bgm/rain.mp3', volume: 0.3, loop: true },
      { id: 'night', url: '/audio/bgm/night.mp3', volume: 0.3, loop: true },
      { id: 'white-noise', url: '/audio/bgm/white-noise.mp3', volume: 0.3, loop: true },
      { id: 'pink-noise', url: '/audio/bgm/pink-noise.mp3', volume: 0.3, loop: true },
      { id: 'brown-noise', url: '/audio/bgm/brown-noise.mp3', volume: 0.3, loop: true },
      { id: 'cafe', url: '/audio/bgm/cafe.mp3', volume: 0.3, loop: true },
      { id: 'fireplace', url: '/audio/bgm/fireplace.mp3', volume: 0.3, loop: true },
      // 添加在线背景音乐作为回退
      { id: 'online-forest', url: 'https://assets.mixkit.co/active_storage/sfx/2441/2441-preview.mp3', volume: 0.3, loop: true },
      { id: 'online-alpha', url: 'https://assets.mixkit.co/active_storage/sfx/243/243-preview.mp3', volume: 0.3, loop: true },
      { id: 'online-beta', url: 'https://assets.mixkit.co/active_storage/sfx/1126/1126-preview.mp3', volume: 0.3, loop: true },
      { id: 'online-theta', url: 'https://assets.mixkit.co/active_storage/sfx/244/244-preview.mp3', volume: 0.3, loop: true },
      { id: 'online-ocean', url: 'https://assets.mixkit.co/active_storage/sfx/2441/2441-preview.mp3', volume: 0.3, loop: true },
    ];

    // 加载默认音频
    defaultBgmList.forEach(bgm => {
      this.loadBackgroundMusic(bgm);
    });
    
    // 异步加载动态音频文件
    setTimeout(async () => {
      try {
        await audioManager.initialize();
        
        // 获取所有背景音乐文件，包括番茄钟专用的背景音乐
        const bgmFiles = [...audioManager.getBackgroundMusic(), ...audioManager.getCategoryById('pomodoro-bgm')?.files || []];
        
        // 动态加载新发现的音频文件
        bgmFiles.forEach(file => {
          const bgm: SoundEffect = {
            id: file.id,
            url: file.url,
            volume: 0.3,
            loop: true
          };
          this.loadBackgroundMusic(bgm);
        });
      } catch (error) {
        console.error('Failed to load dynamic audio files:', error);
      }
    }, 0);
  }

  private loadSound(sound: SoundEffect): void {
    const audio = new Audio(sound.url);
    audio.volume = sound.volume || this.masterVolume;
    audio.loop = sound.loop || false;
    audio.muted = this.isMuted;
    this.sounds[sound.id] = audio;
  }

  private loadBackgroundMusic(bgm: SoundEffect): void {
    const audio = new Audio(bgm.url);
    audio.volume = bgm.volume || this.bgmVolume;
    audio.loop = bgm.loop || true;
    audio.muted = this.isMuted;
    // 设置预加载模式为 metadata，只加载元数据而不是整个文件
    audio.preload = 'metadata';
    this.backgroundMusic[bgm.id] = audio;
  }
  
  // 按需加载背景音乐，在播放前确保音频已加载
  private async preloadBackgroundMusicOnDemand(id: string): Promise<HTMLAudioElement | null> {
    const bgm = this.backgroundMusic[id];
    if (!bgm) {
      console.warn(`Background music ${id} not found`);
      return null;
    }
    
    // 如果音频已加载完成，直接返回
    if (bgm.readyState >= 3) { // HAVE_FUTURE_DATA
      return bgm;
    }
    
    // 否则等待音频加载完成
    return new Promise((resolve) => {
      bgm.oncanplaythrough = () => {
        resolve(bgm);
      };
      bgm.onerror = () => {
        console.error(`Failed to load background music ${id}`);
        resolve(null);
      };
      
      // 如果音频还没有开始加载，触发加载
      if (bgm.readyState === 0) { // HAVE_NOTHING
        bgm.load();
      }
    });
  }

  // 播放音效
  play(id: string): void {
    if (this.isMuted) return;
    
    const audio = this.sounds[id];
    if (audio) {
      // 重置并播放
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error(`Failed to play sound ${id}:`, error);
      });
    } else {
      console.warn(`Sound ${id} not found`);
    }
  }

  // 停止音效
  stop(id: string): void {
    const audio = this.sounds[id];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  // 播放背景音乐
  async playBackgroundMusic(id: string): Promise<void> {
    if (this.isMuted) return;
    
    // 如果已经在播放相同的音乐，直接返回
    if (this.currentBackgroundMusicId === id) {
      // 如果音乐被暂停，恢复播放
      const audio = this.backgroundMusic[id];
      if (audio && audio.paused) {
        audio.play().catch(error => {
          console.error(`Failed to resume background music ${id}:`, error);
        });
      }
      return;
    }
    
    // 停止当前播放的背景音乐
    this.stopCurrentBackgroundMusic();
    
    // 按需预加载背景音乐
    const audio = await this.preloadBackgroundMusicOnDemand(id);
    if (audio) {
      this.currentBackgroundMusicId = id;
      // 确保音量设置正确
      audio.volume = this.bgmVolume;
      audio.muted = false;
      
      try {
        await audio.play();
        // 记录音频播放统计
        import('./audioStatistics').then(({ default: audioStatistics }) => {
          audioStatistics.recordPlay(id);
        });
      } catch (error) {
        console.error(`Failed to play background music ${id}:`, error);
        // 尝试修复播放问题
        this.handlePlaybackError(audio, id);
      }
    } else {
      console.warn(`Background music ${id} not found or failed to load`);
    }
  }

  // 暂停背景音乐
  pauseBackgroundMusic(): void {
    if (this.currentBackgroundMusicId) {
      const audio = this.backgroundMusic[this.currentBackgroundMusicId];
      if (audio) {
        audio.pause();
      }
    }
  }

  // 处理播放错误
  private handlePlaybackError(audio: HTMLAudioElement, id: string): void {
    // 尝试通过重新加载音频元素来解决播放问题
    try {
      audio.load();
      // 延迟重试播放
      setTimeout(() => {
        audio.play().catch(error => {
          console.error(`Retry failed for background music ${id}:`, error);
        });
      }, 500);
    } catch (error) {
      console.error(`Failed to reload audio for ${id}:`, error);
    }
  }

  // 恢复播放背景音乐
  resumeBackgroundMusic(): void {
    if (this.isMuted) return;
    
    if (this.currentBackgroundMusicId) {
      const audio = this.backgroundMusic[this.currentBackgroundMusicId];
      if (audio) {
        audio.muted = false;
        audio.play().catch(error => {
          console.error(`Failed to resume background music ${this.currentBackgroundMusicId}:`, error);
          // 尝试修复播放问题
          this.handlePlaybackError(audio, this.currentBackgroundMusicId);
        });
      }
    }
  }

  // 停止当前背景音乐
  stopCurrentBackgroundMusic(): void {
    if (this.currentBackgroundMusicId) {
      const audio = this.backgroundMusic[this.currentBackgroundMusicId];
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      this.currentBackgroundMusicId = null;
    }
  }

  // 停止所有背景音乐
  stopAllBackgroundMusic(): void {
    Object.values(this.backgroundMusic).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.currentBackgroundMusicId = null;
  }

  // 设置单个音效音量
  setVolume(id: string, volume: number): void {
    const audio = this.sounds[id];
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  // 设置背景音乐音量
  setBackgroundMusicVolume(id: string, volume: number): void {
    const audio = this.backgroundMusic[id];
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  // 设置全局背景音乐音量
  setBgmVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    
    // 更新所有背景音乐的音量
    Object.values(this.backgroundMusic).forEach(audio => {
      audio.volume = this.bgmVolume;
    });
  }

  // 设置单个背景音乐的音量
  setSingleBgmVolume(id: string, volume: number): void {
    const audio = this.backgroundMusic[id];
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  // 设置页面可见性监听器
  private setupVisibilityListener(): void {
    this.visibilityChangeHandler = () => {
      if (document.visibilityState === 'visible' && 
          this.currentBackgroundMusicId && 
          !this.isMuted) {
        // 页面重新可见时，检查音乐是否还在播放
        const audio = this.backgroundMusic[this.currentBackgroundMusicId];
        if (audio && audio.paused) {
          // 如果音乐被暂停，尝试恢复播放
          setTimeout(() => {
            if (audio.paused && this.currentBackgroundMusicId) {
              audio.play().catch(error => {
                console.error('Failed to resume music after visibility change:', error);
              });
            }
          }, 100);
        }
      }
    };
    
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  // 设置主音量
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    
    // 更新所有音效的音量
    Object.values(this.sounds).forEach(audio => {
      audio.volume = this.masterVolume;
    });
  }

  // 静音/取消静音
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    
    // 更新所有音效的静音状态
    Object.values(this.sounds).forEach(audio => {
      audio.muted = this.isMuted;
    });
    
    // 更新所有背景音乐的静音状态
    Object.values(this.backgroundMusic).forEach(audio => {
      audio.muted = this.isMuted;
    });
    
    return this.isMuted;
  }

  // 设置静音状态
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    
    // 更新所有音效的静音状态
    Object.values(this.sounds).forEach(audio => {
      audio.muted = this.isMuted;
    });
    
    // 更新所有背景音乐的静音状态
    Object.values(this.backgroundMusic).forEach(audio => {
      audio.muted = this.isMuted;
    });
  }

  // 检查是否静音
  getIsMuted(): boolean {
    return this.isMuted;
  }

  // 获取主音量
  getMasterVolume(): number {
    return this.masterVolume;
  }

  // 获取背景音乐音量
  getBgmVolume(): number {
    return this.bgmVolume;
  }

  // 获取当前播放的背景音乐ID
  getCurrentBackgroundMusicId(): string | null {
    return this.currentBackgroundMusicId;
  }

  // 添加新音效
  addSound(sound: SoundEffect): void {
    this.loadSound(sound);
  }

  // 添加新背景音乐
  addBackgroundMusic(bgm: SoundEffect): void {
    this.loadBackgroundMusic(bgm);
  }
}

// 创建单例实例
const soundManager = new SoundManager();

// 确保在页面卸载时清理资源
window.addEventListener('beforeunload', () => {
  soundManager.stopAllBackgroundMusic();
});

// 确保在页面隐藏时也保持音乐播放
window.addEventListener('pagehide', () => {
  // 不要停止音乐，让音乐在后台继续播放
});

export default soundManager;