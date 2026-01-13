// 统一音效管理库 - 优化版本
import audioManager from './audioManagerOptimized';

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
      { id: 'taskComplete-fallback', url: 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3', volume: 0.5 },
      { id: 'taskGiveUp-fallback', url: 'https://assets.mixkit.co/sfx/preview/mixkit-game-show-wrong-answer-buzz-950.mp3', volume: 0.5 },
      { id: 'purchase-fallback', url: 'https://assets.mixkit.co/sfx/preview/mixkit-coins-spinning-in-hands-1933.mp3', volume: 0.5 }
    ];

    soundList.forEach(sound => {
      const audio = new Audio(sound.url);
      audio.volume = sound.volume ?? this.masterVolume;
      this.sounds[sound.id] = audio;
    });
  }

  private initBackgroundMusic(): void {
    // 初始化常用背景音乐
    const bgmList = [
      { id: 'forest', url: '/audio/bgm/forest.mp3', volume: 0.3 },
      { id: 'rain', url: '/audio/bgm/rain.mp3', volume: 0.3 },
      { id: 'ocean', url: '/audio/bgm/ocean.mp3', volume: 0.3 },
      { id: 'cafe', url: '/audio/bgm/cafe.mp3', volume: 0.3 },
      { id: 'white-noise', url: '/audio/bgm/white-noise.mp3', volume: 0.3 }
    ];

    bgmList.forEach(bgm => {
      const audio = new Audio(bgm.url);
      audio.loop = true;
      audio.volume = bgm.volume ?? this.bgmVolume;
      this.backgroundMusic[bgm.id] = audio;
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

    const audio = this.sounds[soundId] || this.sounds[`${soundId}-fallback`];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.error('Error playing sound effect:', e));
    } else {
      // 如果没有找到对应的音效，尝试使用audioManager播放
      const allSounds = audioManager.getSoundEffects();
      const soundFile = allSounds.find(s => s.id.includes(soundId) || s.name.toLowerCase().includes(soundId.toLowerCase()));
      if (soundFile) {
        audioManager.playAudio(soundFile.url, this.masterVolume);
      }
    }
  }

  // 播放背景音乐
  async playBackgroundMusic(musicId: string): Promise<void> {
    if (this.isMuted) {
      this.currentBackgroundMusicId = musicId;
      return;
    }

    // 停止当前播放的背景音乐
    if (this.currentBackgroundMusicId) {
      this.stopBackgroundMusic();
    }

    // 尝试从预设列表播放
    if (this.backgroundMusic[musicId]) {
      try {
        await this.backgroundMusic[musicId].play();
        this.currentBackgroundMusicId = musicId;
      } catch (e) {
        console.error('Error playing background music:', e);
      }
    } else {
      // 从audioManager获取音乐文件并播放
      const bgmFiles = audioManager.getBackgroundMusic();
      const musicFile = bgmFiles.find(bgm => bgm.id === musicId || bgm.name.toLowerCase().includes(musicId.toLowerCase()));
      
      if (musicFile) {
        // 创建临时音频元素播放背景音乐
        const tempAudio = new Audio(musicFile.url);
        tempAudio.loop = true;
        tempAudio.volume = this.bgmVolume;
        
        try {
          await tempAudio.play();
          
          // 停止之前的临时音频（如果有）
          if (this.backgroundMusic[musicId]) {
            this.backgroundMusic[musicId].pause();
          }
          
          this.backgroundMusic[musicId] = tempAudio;
          this.currentBackgroundMusicId = musicId;
        } catch (e) {
          console.error('Error playing background music from manager:', e);
        }
      }
    }
  }

  // 停止背景音乐
  stopBackgroundMusic(): void {
    if (this.currentBackgroundMusicId) {
      const audio = this.backgroundMusic[this.currentBackgroundMusicId];
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      this.currentBackgroundMusicId = null;
    }
  }

  // 切换静音状态
  toggleMute(): void {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.stopAllSounds();
    } else {
      // 如果取消静音，恢复播放当前音乐
      if (this.currentBackgroundMusicId) {
        this.playBackgroundMusic(this.currentBackgroundMusicId);
      }
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
      console.error('Error playing custom audio:', e);
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