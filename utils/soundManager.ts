// 统一音效管理库

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

  constructor() {
    // 初始化音效列表
    this.initSounds();
    this.initBackgroundMusic();
  }

  private initSounds(): void {
    const soundList: SoundEffect[] = [
      { id: 'dice', url: './audio/sounds/dice.mp3', volume: 0.5 },
      { id: 'taskComplete', url: './audio/sounds/task-complete.mp3', volume: 0.5 },
      { id: 'taskGiveUp', url: './audio/sounds/task-give-up.mp3', volume: 0.5 },
      { id: 'purchase', url: './audio/sounds/purchase.mp3', volume: 0.5 },
    ];

    soundList.forEach(sound => {
      this.loadSound(sound);
    });
  }

  private initBackgroundMusic(): void {
    const bgmList: SoundEffect[] = [
      { id: 'forest', url: './audio/bgm/forest.mp3', volume: 0.3, loop: true },
      { id: 'alpha', url: './audio/bgm/alpha.mp3', volume: 0.3, loop: true },
      { id: 'theta', url: './audio/bgm/theta.mp3', volume: 0.3, loop: true },
      { id: 'beta', url: './audio/bgm/beta.mp3', volume: 0.3, loop: true },
      { id: 'ocean', url: './audio/bgm/ocean.mp3', volume: 0.3, loop: true },
      { id: 'rain', url: './audio/bgm/rain.mp3', volume: 0.3, loop: true },
      { id: 'night', url: './audio/bgm/night.mp3', volume: 0.3, loop: true },
      { id: 'white-noise', url: './audio/bgm/white-noise.mp3', volume: 0.3, loop: true },
      { id: 'pink-noise', url: './audio/bgm/pink-noise.mp3', volume: 0.3, loop: true },
      { id: 'brown-noise', url: './audio/bgm/brown-noise.mp3', volume: 0.3, loop: true },
      { id: 'cafe', url: './audio/bgm/cafe.mp3', volume: 0.3, loop: true },
      { id: 'fireplace', url: './audio/bgm/fireplace.mp3', volume: 0.3, loop: true },
    ];

    bgmList.forEach(bgm => {
      this.loadBackgroundMusic(bgm);
    });
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
    this.backgroundMusic[bgm.id] = audio;
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
  playBackgroundMusic(id: string): void {
    if (this.isMuted) return;
    
    // 如果已经在播放相同的音乐，直接返回
    if (this.currentBackgroundMusicId === id) {
      return;
    }
    
    // 停止当前播放的背景音乐
    this.stopCurrentBackgroundMusic();
    
    // 播放新的背景音乐
    const audio = this.backgroundMusic[id];
    if (audio) {
      this.currentBackgroundMusicId = id;
      audio.play().catch(error => {
        console.error(`Failed to play background music ${id}:`, error);
      });
    } else {
      console.warn(`Background music ${id} not found`);
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

  // 恢复播放背景音乐
  resumeBackgroundMusic(): void {
    if (this.isMuted) return;
    
    if (this.currentBackgroundMusicId) {
      const audio = this.backgroundMusic[this.currentBackgroundMusicId];
      if (audio) {
        audio.play().catch(error => {
          console.error(`Failed to resume background music ${this.currentBackgroundMusicId}:`, error);
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

export default soundManager;