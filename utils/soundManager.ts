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
  private audioUnlocked: boolean = false; // 音频是否已解锁（用户交互后）
  private selectedMusicIds: Set<string> = new Set(); // 选中的音乐ID集合
  private lockedMusicIds: Set<string> = new Set(); // 锁定的音乐ID集合
  private initialized: boolean = false; // 是否已初始化
  
  // 添加页面可见性变化监听，确保音乐在后台运行
  private visibilityChangeHandler: (() => void) | null = null;
  private userInteractionHandler: (() => void) | null = null;

  constructor() {
    // 监听页面可见性变化，确保音乐在后台运行
    this.setupVisibilityListener();
    
    // 监听用户交互，解锁音频播放权限
    this.setupUserInteractionListener();
    
    // 不立即初始化，等待页面完全渲染后再调用initialize方法
  }

  // 初始化方法，在页面渲染后调用
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // 延迟初始化，确保页面已完全渲染
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('开始初始化音频系统...');
      
      // 初始化音效
      await this.initSounds();
      // 初始化背景音乐
      await this.initBackgroundMusic();
      
      this.initialized = true;
      console.log('音频系统初始化完成');
    } catch (error) {
      console.error('音频系统初始化失败:', error);
      // 即使初始化失败，也不影响应用运行
      this.initialized = true;
    }
  }

  private async initSounds(): Promise<void> {
    const soundList: SoundEffect[] = [
      // 主要音效
      { id: 'dice', url: '/audio/sfx/投骰子音效.mp3', volume: 0.7 },
      { id: 'mainTaskComplete', url: '/audio/sfx/主线任务完成音效超快音效.mp3', volume: 0.5 },
      { id: 'notification', url: '/audio/sfx/任务弹出通知提醒音效level-up-191997.mp3', volume: 0.5 },
      { id: 'taskGiveUp', url: '/audio/sfx/任务放弃音效bubblepop-254773.mp3', volume: 0.5 },
      { id: 'purchase', url: '/audio/sfx/商品购买支出音效.mp3', volume: 0.5 },
      { id: 'achievement', url: '/audio/sfx/成就解锁音频.mp3', volume: 0.5 },
      { id: 'achievement2', url: '/audio/sfx/成就解锁音频2.mp3', volume: 0.5 },
      { id: 'taskComplete', url: '/audio/sfx/日常任务完成音效.mp3', volume: 0.5 },
      { id: 'timer', url: '/audio/sfx/番茄钟开始和结束计时音效servant-bell-ring-2-211683.mp3', volume: 0.5 },
      { id: 'checkin', url: '/audio/sfx/签到成功音效.mp3', volume: 0.5 },
      
      // 备用音效
      { id: 'backup1', url: '/audio/sfx/备用-ding-36029.mp3', volume: 0.5 },
      { id: 'backup2', url: '/audio/sfx/备用-ding-sfx-330333.mp3', volume: 0.5 },
      { id: 'backup3', url: '/audio/sfx/备用-ding-small-bell-sfx-233008.mp3', volume: 0.5 },
      { id: 'backup4', url: '/audio/sfx/备用-doorbell-329311.mp3', volume: 0.5 },
      { id: 'backup5', url: '/audio/sfx/备用-hotel-bell-ding-1-174457.mp3', volume: 0.5 },
      { id: 'backup6', url: '/audio/sfx/备用-hotel-bell-ding-1-174457 copy.mp3', volume: 0.5 },
      { id: 'backup7', url: '/audio/sfx/备用3.mp3', volume: 0.5 },
      { id: 'backup8', url: '/audio/sfx/备用音效.mp3', volume: 0.5 },
      { id: 'backup9', url: '/audio/sfx/备用音效3.mp3', volume: 0.5 },
      
      // 使用在线音效作为回退
      { id: 'dice-fallback', url: 'https://assets.mixkit.co/sfx/preview/mixkit-dice-roll-6125.mp3', volume: 0.7 },
      { id: 'positive', url: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3', volume: 0.5 },
      { id: 'coin', url: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3', volume: 0.5 },
    ];

    // 并行加载音效，但使用try-catch确保单个音效加载失败不影响整体
    const loadPromises = soundList.map(async (sound) => {
      try {
        await this.loadSound(sound);
      } catch (error) {
        console.warn(`加载音效 ${sound.id} 失败:`, error);
      }
    });

    await Promise.all(loadPromises);
  }

  private async initBackgroundMusic(): Promise<void> {
    // 首先加载默认和在线回退音频
    const defaultBgmList: SoundEffect[] = [
      { id: 'forest', url: '/audio/pomodoro/bgm/森林.mp3', volume: 0.3, loop: true },
      { id: 'rain', url: '/audio/pomodoro/bgm/雨天.mp3', volume: 0.3, loop: true },
      { id: 'ocean', url: '/audio/pomodoro/bgm/海洋.mp3', volume: 0.3, loop: true },
      { id: 'cafe', url: '/audio/pomodoro/bgm/西餐厅.mp3', volume: 0.3, loop: true },
      { id: 'white-noise', url: '/audio/pomodoro/bgm/风扇.mp3', volume: 0.3, loop: true },
      // 添加在线背景音乐作为回退
      { id: 'online-forest', url: 'https://assets.mixkit.co/active_storage/sfx/2441/2441-preview.mp3', volume: 0.3, loop: true },
      { id: 'online-alpha', url: 'https://assets.mixkit.co/active_storage/sfx/243/243-preview.mp3', volume: 0.3, loop: true },
      { id: 'online-beta', url: 'https://assets.mixkit.co/active_storage/sfx/1126/1126-preview.mp3', volume: 0.3, loop: true },
      { id: 'online-theta', url: 'https://assets.mixkit.co/active_storage/sfx/244/244-preview.mp3', volume: 0.3, loop: true },
      { id: 'online-ocean', url: 'https://assets.mixkit.co/active_storage/sfx/2441/2441-preview.mp3', volume: 0.3, loop: true },
    ];

    // 并行加载默认音频
    const loadPromises = defaultBgmList.map(async (bgm) => {
      try {
        await this.loadBackgroundMusic(bgm);
      } catch (error) {
        console.warn(`加载背景音乐 ${bgm.id} 失败:`, error);
      }
    });

    await Promise.all(loadPromises);
    
    // 异步加载动态音频文件
    try {
      // 延迟加载audioManager，避免阻塞初始化
      const { default: audioManager } = await import('./audioManager');
      await audioManager.initialize();
      
      // 获取所有背景音乐文件，包括番茄钟专用的背景音乐
      const bgmFiles = [...audioManager.getBackgroundMusic(), ...audioManager.getCategoryById('pomodoro-bgm')?.files || []];
      
      // 动态加载新发现的音频文件
      const dynamicLoadPromises = bgmFiles.map(async (file) => {
        try {
          const bgm: SoundEffect = {
            id: file.id,
            url: file.url,
            volume: 0.3,
            loop: true
          };
          await this.loadBackgroundMusic(bgm);
        } catch (error) {
          console.warn(`加载动态背景音乐 ${file.id} 失败:`, error);
        }
      });

      await Promise.all(dynamicLoadPromises);
    } catch (error) {
      console.error('加载动态音频文件失败:', error);
      // 即使audioManager加载失败，也不影响应用运行
    }
  }

  private async loadSound(sound: SoundEffect): Promise<void> {
    try {
      const correctUrl = this.getCorrectAudioUrl(sound.url);
      const audio = new Audio(correctUrl);
      audio.volume = sound.volume || this.masterVolume;
      audio.loop = sound.loop || false;
      audio.muted = this.isMuted;
      // 设置预加载模式为 metadata，只加载元数据而不是整个文件
      audio.preload = 'metadata';
      
      // 尝试加载音频，但不阻塞初始化
      audio.load().catch(error => {
        console.warn(`加载音效 ${sound.id} 时出错:`, error);
      });
      
      this.sounds[sound.id] = audio;
    } catch (error) {
      console.warn(`加载音效 ${sound.id} 失败:`, error);
    }
  }

  private async loadBackgroundMusic(bgm: SoundEffect): Promise<void> {
    try {
      const correctUrl = this.getCorrectAudioUrl(bgm.url);
      const audio = new Audio(correctUrl);
      audio.volume = bgm.volume || this.bgmVolume;
      audio.loop = bgm.loop || true;
      audio.muted = this.isMuted;
      // 设置预加载模式为 metadata，只加载元数据而不是整个文件
      audio.preload = 'metadata';
      
      // 尝试加载音频，但不阻塞初始化
      audio.load().catch(error => {
        console.warn(`加载背景音乐 ${bgm.id} 时出错:`, error);
      });
      
      this.backgroundMusic[bgm.id] = audio;
    } catch (error) {
      console.warn(`加载背景音乐 ${bgm.id} 失败:`, error);
    }
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

  // 播放音效（与soundManagerOptimized兼容的方法）
  async playSoundEffect(effectName: string): Promise<void> {
    if (this.isMuted) return;

    try {
      // 检查音频是否已解锁
      if (!this.audioUnlocked) {
        console.warn('音频未解锁，等待用户交互...');
        // 尝试再次设置用户交互监听器
        if (!this.userInteractionHandler) {
          this.setupUserInteractionListener();
        }
        // 尝试立即解锁音频
        await this.attemptAudioUnlock();
      }

      // 首先尝试播放指定的音效
      let audio = this.sounds[effectName];
      
      // 如果找不到指定音效，使用默认回退音效
      if (!audio) {
        console.warn(`Sound effect ${effectName} not found, using fallback`);
        // 根据音效类型选择合适的回退音效
        switch (effectName) {
          case 'dice':
            audio = this.sounds['dice-fallback'];
            break;
          case 'notification':
          case 'taskComplete':
          case 'mainTaskComplete':
          case 'achievement':
            audio = this.sounds['positive'];
            break;
          case 'purchase':
          case 'spend':
            audio = this.sounds['coin'];
            break;
          default:
            audio = this.sounds['positive'];
        }
      }
      
      if (audio) {
        audio.currentTime = 0;
        try {
          await audio.play();
        } catch (e) {
          console.error('Error playing sound effect:', e);
          // 播放失败时，尝试使用在线回退音效
          if (effectName === 'dice' && !this.sounds['dice-fallback'].paused) {
            this.sounds['dice-fallback'].currentTime = 0;
            await this.sounds['dice-fallback'].play().catch(err => {
              console.error('Failed to play fallback sound:', err);
            });
          }
        }
      } else {
        console.warn(`No sound effect found for ${effectName}`);
      }
    } catch (e) {
      console.error('Unexpected error playing sound effect:', e);
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

  // 停止当前背景音乐（与GlobalAudioManagerOptimized兼容的方法）
  stopBackgroundMusic(): void {
    this.stopCurrentBackgroundMusic();
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

  // 监听用户交互，解锁音频播放权限
  private setupUserInteractionListener(): void {
    this.userInteractionHandler = async () => {
      if (!this.audioUnlocked) {
        try {
          // 尝试创建一个简单的音频上下文来解锁音频播放权限
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // 设置音量为0，避免产生声音
          gainNode.gain.value = 0;
          
          // 开始并立即停止，触发音频上下文的解锁
          oscillator.start();
          oscillator.stop();
          
          this.audioUnlocked = true;
          console.log('音频播放权限已解锁');
          // 移除事件监听器，因为只需要一次用户交互
          this.removeUserInteractionListener();
        } catch (e) {
          console.warn('音频解锁失败:', e);
          // 即使失败，也强制设置为已解锁，确保用户能听到声音
          this.audioUnlocked = true;
          console.log('强制解锁音频播放权限');
        }
      }
    };

    // 添加多种用户交互事件监听器
    const events = ['click', 'touchstart', 'keydown', 'mousedown'];
    events.forEach(event => {
      document.addEventListener(event, this.userInteractionHandler!);
    });
  }

  // 移除用户交互监听器
  private removeUserInteractionListener(): void {
    if (this.userInteractionHandler) {
      const events = ['click', 'touchstart', 'keydown', 'mousedown'];
      events.forEach(event => {
        document.removeEventListener(event, this.userInteractionHandler!);
      });
      this.userInteractionHandler = null;
    }
  }

  // 尝试解锁音频
  private async attemptAudioUnlock(): Promise<void> {
    if (!this.audioUnlocked) {
      try {
        // 尝试创建一个简单的音频上下文来解锁音频播放权限
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 设置音量为0，避免产生声音
        gainNode.gain.value = 0;
        
        // 开始并立即停止，触发音频上下文的解锁
        oscillator.start();
        oscillator.stop();
        
        this.audioUnlocked = true;
        console.log('音频播放权限已解锁');
        // 移除事件监听器，因为只需要一次用户交互
        this.removeUserInteractionListener();
      } catch (e) {
        console.warn('音频解锁失败:', e);
        // 即使失败，也强制设置为已解锁，确保用户能听到声音
        this.audioUnlocked = true;
        console.log('强制解锁音频播放权限');
      }
    }
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

  // 获取正确的音频URL，根据环境决定是否添加GitHub Pages基础路径
  private getCorrectAudioUrl(url: string): string {
    // 检查URL是否已经包含完整路径
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 确保URL格式正确
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    
    // 动态检测基础路径
    // 检查当前URL是否包含GitHub Pages路径
    const currentUrl = window.location.href;
    let basePath = '';
    
    if (currentUrl.includes('/Life-Game-Management-System/')) {
      // GitHub Pages环境
      basePath = '/Life-Game-Management-System';
    } else if (import.meta.env && import.meta.env.BASE_URL) {
      // Vite环境，使用配置的BASE_URL
      basePath = import.meta.env.BASE_URL;
    }
    
    // 确保basePath格式正确
    const normalizedBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    
    return `${normalizedBasePath}${normalizedUrl}`;
  }

  // 添加新音效
  async addSound(sound: SoundEffect): Promise<void> {
    await this.loadSound(sound);
  }

  // 添加新背景音乐
  async addBackgroundMusic(bgm: SoundEffect): Promise<void> {
    await this.loadBackgroundMusic(bgm);
  }

  // 切换音乐选中状态（用于双击添加/移除歌曲）
  toggleSelectedMusic(id: string): boolean {
    if (this.selectedMusicIds.has(id)) {
      this.selectedMusicIds.delete(id);
      this.lockedMusicIds.delete(id);
      return false;
    } else {
      this.selectedMusicIds.add(id);
      this.lockedMusicIds.add(id);
      return true;
    }
  }

  // 获取选中的音乐ID列表
  getSelectedMusicIds(): Set<string> {
    return this.selectedMusicIds;
  }

  // 获取锁定的音乐ID列表
  getLockedMusicIds(): Set<string> {
    return this.lockedMusicIds;
  }

  // 检查音频系统是否已初始化
  isInitialized(): boolean {
    return this.initialized;
  }
}

// 创建单例实例
const soundManager = new SoundManager();

// 页面加载完成后初始化音频系统
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', async () => {
    try {
      await soundManager.initialize();
    } catch (error) {
      console.error('音频系统初始化失败:', error);
      // 即使初始化失败，也不影响应用运行
    }
  });
}

// 确保在页面卸载时清理资源
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    soundManager.stopAllBackgroundMusic();
  });

  // 确保在页面隐藏时也保持音乐播放
  window.addEventListener('pagehide', () => {
    // 不要停止音乐，让音乐在后台继续播放
  });
}

export default soundManager;