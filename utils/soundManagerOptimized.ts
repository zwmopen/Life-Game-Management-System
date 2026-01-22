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
    
    // 初始化音频管理器
    this.initializeAudioManager();
  }
  
  // 初始化音频管理器
  private async initializeAudioManager(): Promise<void> {
    try {
      // 导入音频管理器
      const audioManager = await import('./audioManagerOptimized').then(module => module.default);
      // 初始化音频管理器
      await audioManager.initialize();
      console.log('音频管理器初始化成功');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('初始化音频管理器时出错:', error);
      }
    }
  }

  // 获取正确的音频URL，添加GitHub Pages基础路径
  private getCorrectAudioUrl(url: string): string {
    // 检查URL是否已经包含完整路径
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 添加GitHub Pages基础路径
    const basePath = '/Life-Game-Management-System';
    // 确保URL格式正确
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    return `${basePath}${normalizedUrl}`;
  }

  private initSounds(): void {
    const soundList: SoundEffect[] = [
      // 本地音效 - 统一管理在sfx目录
      { id: 'dice', url: '/audio/sfx/骰子音效.mp3', volume: 0.7 },
      { id: 'taskComplete', url: '/audio/sfx/任务完成音效.mp3', volume: 0.5 },
      { id: 'taskGiveUp', url: '/audio/sfx/任务放弃音效.mp3', volume: 0.5 },
      { id: 'purchase', url: '/audio/sfx/购买音效.mp3', volume: 0.5 },
      { id: 'notification', url: '/audio/sfx/任务通知音效.mp3', volume: 0.5 },
      { id: 'achievement', url: '/audio/sfx/成就解锁音频.mp3', volume: 0.5 },
      { id: 'timer', url: '/audio/sfx/任务完成音效.mp3', volume: 0.5 },
      { id: 'coin', url: '/audio/sfx/金币收入支出音效.mp3', volume: 0.5 },
      { id: 'pomodoroComplete', url: '/audio/sfx/番茄钟完成音效ding-36029.mp3', volume: 0.5 },
      // 回退音效
      { id: 'dice-fallback', url: '/audio/sfx/骰子音效.mp3', volume: 0.7 },
      { id: 'taskComplete-fallback', url: '/audio/sfx/任务完成音效.mp3', volume: 0.5 },
      { id: 'taskGiveUp-fallback', url: '/audio/sfx/任务放弃音效.mp3', volume: 0.5 },
      { id: 'purchase-fallback', url: '/audio/sfx/购买音效.mp3', volume: 0.5 },
      { id: 'notification-fallback', url: '/audio/sfx/任务通知音效.mp3', volume: 0.5 },
      { id: 'achievement-fallback', url: '/audio/sfx/成就解锁音频.mp3', volume: 0.5 },
      { id: 'timer-fallback', url: '/audio/sfx/任务完成音效.mp3', volume: 0.5 },
      { id: 'coin-fallback', url: '/audio/sfx/金币收入支出音效.mp3', volume: 0.5 },
      { id: 'pomodoroComplete-fallback', url: '/audio/sfx/番茄钟完成音效ding-36029.mp3', volume: 0.5 }
    ];

    soundList.forEach(sound => {
      try {
        const correctUrl = this.getCorrectAudioUrl(sound.url);
        const audio = new Audio(correctUrl);
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
        const correctUrl = this.getCorrectAudioUrl(bgm.url);
        const audio = new Audio(correctUrl);
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
          fallbackUrl = '/audio/sfx/任务完成音效.mp3';
          break;
        case 'taskGiveUp':
          fallbackUrl = '/audio/sfx/任务放弃音效.mp3';
          break;
        case 'purchase':
          fallbackUrl = '/audio/sfx/购买音效.mp3';
          break;
        case 'dice':
          fallbackUrl = '/audio/sfx/骰子音效.mp3';
          break;
        case 'notification':
          fallbackUrl = '/audio/sfx/任务通知音效.mp3';
          break;
        case 'achievement':
          fallbackUrl = '/audio/sfx/成就解锁音效.mp3';
          break;
        case 'timer':
          fallbackUrl = '/audio/sfx/计时器音效.mp3';
          break;
        case 'coin':
          fallbackUrl = '/audio/sfx/金币收入支出音效.mp3';
          break;
        default:
          fallbackUrl = '/audio/sfx/任务完成音效.mp3';
      }

      if (fallbackUrl) {
        const audio = new Audio(this.getCorrectAudioUrl(fallbackUrl));
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
      // 确保音频管理器已初始化
      await audioManager.initialize();
      
      // 从audioManager获取音乐文件
      const bgmFiles = audioManager.getBackgroundMusic();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`获取到的背景音乐文件数量: ${bgmFiles.length}`);
      }
      
      // 1. 首先尝试直接匹配音乐名称（最常用的情况）
      let musicFile = bgmFiles.find(bgm => bgm.name.toLowerCase() === musicId.toLowerCase());
      if (!musicFile && process.env.NODE_ENV === 'development') {
        console.log(`通过名称匹配音乐文件: ${musicId}，结果: 未找到`);
      }
      
      // 2. 如果没有找到，尝试匹配ID
      if (!musicFile) {
        musicFile = bgmFiles.find(bgm => bgm.id === musicId);
        if (!musicFile && process.env.NODE_ENV === 'development') {
          console.log(`通过ID匹配音乐文件: ${musicId}，结果: 未找到`);
        }
      }
      
      // 3. 如果仍然没有找到，尝试通过ID的最后部分匹配文件名（兼容旧的简单ID格式）
      if (!musicFile) {
        const idParts = musicId.split('_');
        const fileNamePart = idParts[idParts.length - 1];
        musicFile = bgmFiles.find(bgm => bgm.name.toLowerCase().includes(fileNamePart.toLowerCase()));
        if (process.env.NODE_ENV === 'development') {
          console.log(`通过ID部分匹配音乐文件: ${fileNamePart}，结果: ${musicFile ? musicFile.name : '未找到'}`);
        }
      }
      
      // 4. 如果仍然没有找到，尝试通过URL匹配
      if (!musicFile) {
        musicFile = bgmFiles.find(bgm => bgm.url.toLowerCase().includes(musicId.toLowerCase()));
        if (process.env.NODE_ENV === 'development') {
          console.log(`通过URL匹配音乐文件: ${musicId}，结果: ${musicFile ? musicFile.name : '未找到'}`);
        }
      }
      
      if (musicFile) {
        // 确保URL存在
        if (!musicFile.url) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`音乐文件URL为空: ${musicFile.name}`);
          }
          return;
        }
        
        // 创建临时音频元素播放背景音乐
        // 注意：musicFile.url已经是完整URL，不需要再次调用getCorrectAudioUrl
        const tempAudio = new Audio();
        tempAudio.src = musicFile.url;
        tempAudio.loop = true;
        tempAudio.volume = this.bgmVolume;
        
        // 添加到backgroundMusic集合 BEFORE playing, 这样如果用户快速点击另一首歌，它会被包含在stopBackgroundMusic()中
        this.backgroundMusic[musicId] = tempAudio;
        
        try {
          await tempAudio.play();
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`Successfully playing background music: ${musicFile.name} from URL: ${musicFile.url}`);
          }
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error playing background music from manager:', e);
          }
          // 播放失败时，从集合中移除
          delete this.backgroundMusic[musicId];
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error(`未找到音乐文件: ${musicId}`);
          // 打印可用的音乐文件列表，方便调试
          console.log('可用的音乐文件:', bgmFiles.map(bgm => bgm.name).slice(0, 10)); // 只显示前10个，避免日志过长
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
      const correctUrl = this.getCorrectAudioUrl(url);
      const audio = new Audio(correctUrl);
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