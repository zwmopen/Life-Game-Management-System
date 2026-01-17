import { SoundType } from '../types';

interface AudioFile {
  id: string;
  name: string;
  url: string;
  type: SoundType;
  icon?: string; // 新增图标字段
}

interface AudioCategory {
  id: string;
  name: string;
  files: AudioFile[];
}

// 创建一个工厂函数来生成单例实例
let instance: AudioManager | null = null;

class AudioManager {
  private audioCategories: AudioCategory[] = [];
  private isInitialized: boolean = false;
  private preloadedAudios: Map<string, HTMLAudioElement> = new Map();
  private isPreloading: boolean = false;

  // 私有构造函数以确保单例
  private constructor() {}

  // 获取单例实例的方法
  static getInstance(): AudioManager {
    if (!instance) {
      instance = new AudioManager();
    }
    return instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    // 扫描音频文件并生成分类
    this.audioCategories = [
      {
        id: 'battle',
        name: '战斗音效',
        files: await this.scanAudioFolder('/audio/battle', SoundType.SOUND_EFFECT)
      },
      {
        id: 'bgm',
        name: '背景音乐',
        files: await this.scanAudioFolder('/audio/bgm', SoundType.BACKGROUND_MUSIC)
      },
      {
        id: 'pomodoro-bgm',
        name: '番茄钟背景音乐',
        files: await this.scanAudioFolder('/audio/pomodoro/bgm', SoundType.BACKGROUND_MUSIC)
      },
      {
        id: 'pomodoro-sfx',
        name: '番茄钟音效',
        files: await this.scanAudioFolder('/audio/pomodoro', SoundType.SOUND_EFFECT)
      },
      {
        id: 'dice',
        name: '掷骰子音效',
        files: await this.scanAudioFolder('/audio/dice', SoundType.SOUND_EFFECT)
      },
      {
        id: 'notification',
        name: '通知音效',
        files: await this.scanAudioFolder('/audio/notification', SoundType.SOUND_EFFECT)
      },
      {
        id: 'completion',
        name: '完成音效',
        files: await this.scanAudioFolder('/audio/completion', SoundType.SOUND_EFFECT)
      },
      {
        id: 'focus',
        name: '专注音效',
        files: await this.scanAudioFolder('/audio/focus', SoundType.SOUND_EFFECT)
      },
      {
        id: 'break',
        name: '休息音效',
        files: await this.scanAudioFolder('/audio/break', SoundType.SOUND_EFFECT)
      },
      {
        id: 'ambient',
        name: '环境音',
        files: await this.scanAudioFolder('/audio/ambient', SoundType.BACKGROUND_MUSIC)
      }
    ];

    this.isInitialized = true;
  }

  private async scanAudioFolder(folderPath: string, type: SoundType): Promise<AudioFile[]> {
    try {
      // 获取目录中的所有音频文件
      const response = await fetch(`${folderPath}?t=${Date.now()}`);
      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Failed to scan folder: ${folderPath}`, response.status, response.statusText);
        }
        return [];
      }

      // 由于直接获取目录列表可能不可行，我们使用预定义的文件列表
      // 或者尝试从一个 JSON 文件中获取文件列表
      const filesResponse = await fetch(`${folderPath}/files.json?t=${Date.now()}`);
      if (filesResponse.ok) {
        const fileNames: string[] = await filesResponse.json();
        return fileNames.map(fileName => ({
          id: `${folderPath.replace('/', '_').replace('-', '_')}_${fileName.replace(/\.[^/.]+$/, "")}`,
          name: fileName.replace(/\.[^/.]+$/, ""), // 移除扩展名作为显示名称
          url: `${folderPath}/${fileName}`,
          type,
          icon: this.getIconForAudio(fileName, type)
        }));
      } else {
        // 如果没有 files.json，尝试从硬编码的列表中获取（用于演示目的）
        // 实际应用中应该有一个更好的机制来发现音频文件
        if (process.env.NODE_ENV === 'development') {
          console.log(`Directory listing not available for ${folderPath}, using fallback`);
        }
        return this.getDefaultFilesForFolder(folderPath, type);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Error scanning folder: ${folderPath}`, error);
      }
      return this.getDefaultFilesForFolder(folderPath, type);
    }
  }

  private getDefaultFilesForFolder(folderPath: string, type: SoundType): AudioFile[] {
    // 根据文件夹路径返回默认的音频文件列表
    switch (folderPath) {
      case '/audio/bgm':
        return [
          { id: 'forest_bgm', name: '迷雾森林', url: '/audio/bgm/forest.mp3', type, icon: '🌲' },
          { id: 'alpha_bgm', name: '阿尔法波', url: '/audio/bgm/alpha.mp3', type, icon: '🧠' },
          { id: 'theta_bgm', name: '希塔波', url: '/audio/bgm/theta.mp3', type, icon: '🧘' },
          { id: 'beta_bgm', name: '贝塔波', url: '/audio/bgm/beta.mp3', type, icon: '⚡' },
          { id: 'ocean_bgm', name: '海浪声', url: '/audio/bgm/ocean.mp3', type, icon: '🌊' },
          { id: 'rain_bgm', name: '雨声', url: '/audio/bgm/rain.mp3', type, icon: '🌧️' },
          { id: 'night_bgm', name: '夏夜虫鸣', url: '/audio/bgm/night.mp3', type, icon: '🦗' },
          { id: 'white_noise_bgm', name: '白噪音', url: '/audio/bgm/white-noise.mp3', type, icon: '🌬️' },
          { id: 'pink_noise_bgm', name: '粉红噪音', url: '/audio/bgm/pink-noise.mp3', type, icon: '🎨' },
          { id: 'brown_noise_bgm', name: '布朗噪音', url: '/audio/bgm/brown-noise.mp3', type, icon: '🌰' },
          { id: 'cafe_bgm', name: '咖啡馆环境', url: '/audio/bgm/cafe.mp3', type, icon: '☕' },
          { id: 'fireplace_bgm', name: '壁炉声', url: '/audio/bgm/fireplace.mp3', type, icon: '🔥' }
        ];
      case '/audio/pomodoro/bgm':
        return [
          { id: 'pomodoro_forest_bgm', name: '番茄钟森林', url: '/audio/pomodoro/bgm/forest.mp3', type, icon: '🌲' },
          { id: 'pomodoro_alpha_bgm', name: '番茄钟阿尔法波', url: '/audio/pomodoro/bgm/alpha.mp3', type, icon: '🧠' },
          { id: 'pomodoro_theta_bgm', name: '番茄钟希塔波', url: '/audio/pomodoro/bgm/theta.mp3', type, icon: '🧘' },
          { id: 'pomodoro_beta_bgm', name: '番茄钟贝塔波', url: '/audio/pomodoro/bgm/beta.mp3', type, icon: '⚡' },
          { id: 'pomodoro_ocean_bgm', name: '番茄钟海浪声', url: '/audio/pomodoro/bgm/ocean.mp3', type, icon: '🌊' },
          { id: 'pomodoro_rain_bgm', name: '番茄钟雨声', url: '/audio/pomodoro/bgm/rain.mp3', type, icon: '🌧️' },
          { id: 'pomodoro_night_bgm', name: '番茄钟夏夜虫鸣', url: '/audio/pomodoro/bgm/night.mp3', type, icon: '🦗' },
          { id: 'pomodoro_white_noise_bgm', name: '番茄钟白噪音', url: '/audio/pomodoro/bgm/white-noise.mp3', type, icon: '🌬️' },
          { id: 'pomodoro_pink_noise_bgm', name: '番茄钟粉红噪音', url: '/audio/pomodoro/bgm/pink-noise.mp3', type, icon: '🎨' },
          { id: 'pomodoro_brown_noise_bgm', name: '番茄钟布朗噪音', url: '/audio/pomodoro/bgm/brown-noise.mp3', type, icon: '栗' },
          { id: 'pomodoro_cafe_bgm', name: '番茄钟咖啡馆环境', url: '/audio/pomodoro/bgm/cafe.mp3', type, icon: '☕' },
          { id: 'pomodoro_fireplace_bgm', name: '番茄钟壁炉声', url: '/audio/pomodoro/bgm/fireplace.mp3', type, icon: '🔥' }
        ];
      case '/audio/battle':
        return [
          { id: 'sword_strike', name: '剑击声', url: '/audio/battle/sword-strike.mp3', type, icon: '⚔️' },
          { id: 'magic_spell', name: '魔法咒语', url: '/audio/battle/magic-spell.mp3', type, icon: '🔮' },
          { id: 'arrow_shot', name: '弓箭射击', url: '/audio/battle/arrow-shot.mp3', type, icon: '🏹' },
          { id: 'shield_block', name: '盾牌格挡', url: '/audio/battle/shield-block.mp3', type, icon: '🛡️' },
          { id: 'battle_cry', name: '战斗呐喊', url: '/audio/battle/battle-cry.mp3', type, icon: '🦁' }
        ];
      case '/audio/dice':
        return [
          { id: 'dice_roll', name: '骰子滚动', url: '/audio/dice/dice-roll.mp3', type, icon: '🎲' },
          { id: 'dice_drop', name: '骰子落地', url: '/audio/dice/dice-drop.mp3', type, icon: '🎯' }
        ];
      case '/audio/notification':
        return [
          { id: 'notification_ping', name: '提示音', url: '/audio/notification/ping.mp3', type, icon: '🔔' },
          { id: 'notification_alert', name: '警报声', url: '/audio/notification/alert.mp3', type, icon: '🚨' }
        ];
      case '/audio/completion':
        return [
          { id: 'task_complete', name: '任务完成', url: '/audio/completion/task-complete.mp3', type, icon: '✅' },
          { id: 'achievement_unlock', name: '成就解锁', url: '/audio/completion/achievement-unlock.mp3', type, icon: '🏆' }
        ];
      case '/audio/focus':
        return [
          { id: 'focus_start', name: '专注开始', url: '/audio/focus/focus-start.mp3', type, icon: ' concentric-circles' },
          { id: 'focus_end', name: '专注结束', url: '/audio/focus/focus-end.mp3', type, icon: ' concentric-circles' }
        ];
      case '/audio/break':
        return [
          { id: 'break_start', name: '休息开始', url: '/audio/break/break-start.mp3', type, icon: '⏸️' },
          { id: 'break_end', name: '休息结束', url: '/audio/break/break-end.mp3', type, icon: '▶️' }
        ];
      case '/audio/ambient':
        return [
          { id: 'city_ambience', name: '城市氛围', url: '/audio/ambient/city.mp3', type, icon: '🏙️' },
          { id: 'forest_ambience', name: '森林氛围', url: '/audio/ambient/forest.mp3', type, icon: '🌲' },
          { id: 'mountain_ambience', name: '山间氛围', url: '/audio/ambient/mountain.mp3', type, icon: '⛰️' },
          { id: 'river_ambience', name: '溪流氛围', url: '/audio/ambient/river.mp3', type, icon: '💧' }
        ];
      default:
        // 对于其他路径，返回通用的音效
        return [
          { id: `${folderPath.replace(/\//g, '_')}_default1`, name: '默认音效1', url: `${folderPath}/default1.mp3`, type, icon: '🎵' },
          { id: `${folderPath.replace(/\//g, '_')}_default2`, name: '默认音效2', url: `${folderPath}/default2.mp3`, type, icon: '🎶' }
        ];
    }
  }

  private getIconForAudio(fileName: string, type: SoundType): string {
    const lowerFileName = fileName.toLowerCase();
    
    if (type === SoundType.BACKGROUND_MUSIC) {
      if (lowerFileName.includes('forest') || lowerFileName.includes('woods') || lowerFileName.includes('trees')) {
        return '🌲';
      } else if (lowerFileName.includes('rain') || lowerFileName.includes('storm') || lowerFileName.includes('drizzle')) {
        return '🌧️';
      } else if (lowerFileName.includes('ocean') || lowerFileName.includes('sea') || lowerFileName.includes('waves')) {
        return '🌊';
      } else if (lowerFileName.includes('night') || lowerFileName.includes('cricket') || lowerFileName.includes('insects')) {
        return '🌙';
      } else if (lowerFileName.includes('cafe') || lowerFileName.includes('coffee')) {
        return '☕';
      } else if (lowerFileName.includes('fire') || lowerFileName.includes('fireplace')) {
        return '🔥';
      } else if (lowerFileName.includes('white') && lowerFileName.includes('noise')) {
        return '🌬️';
      } else if (lowerFileName.includes('pink') && lowerFileName.includes('noise')) {
        return '🎨';
      } else if (lowerFileName.includes('brown') && lowerFileName.includes('noise')) {
        return '🌰';
      } else if (lowerFileName.includes('alpha')) {
        return '🧠';
      } else if (lowerFileName.includes('theta')) {
        return '🧘';
      } else if (lowerFileName.includes('beta')) {
        return '⚡';
      } else {
        return '🎵';
      }
    } else {
      if (lowerFileName.includes('dice') || lowerFileName.includes('roll')) {
        return '🎲';
      } else if (lowerFileName.includes('complete') || lowerFileName.includes('done')) {
        return '✅';
      } else if (lowerFileName.includes('give') || lowerFileName.includes('up')) {
        return '❌';
      } else if (lowerFileName.includes('purchase') || lowerFileName.includes('buy')) {
        return '💰';
      } else if (lowerFileName.includes('notification') || lowerFileName.includes('alert')) {
        return '🔔';
      } else if (lowerFileName.includes('focus') || lowerFileName.includes('concentrate')) {
        return '🎯';
      } else if (lowerFileName.includes('break') || lowerFileName.includes('rest')) {
        return '⏸️';
      } else {
        return '🔊';
      }
    }
  }

  getCategories(): AudioCategory[] {
    if (!this.isInitialized) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('AudioManager not initialized. Call initialize() first.');
      }
      return [];
    }
    return this.audioCategories;
  }

  getCategoryById(id: string): AudioCategory | undefined {
    if (!this.isInitialized) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('AudioManager not initialized. Call initialize() first.');
      }
      return undefined;
    }
    return this.audioCategories.find(category => category.id === id);
  }

  getBackgroundMusic(): AudioFile[] {
    if (!this.isInitialized) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('AudioManager not initialized. Call initialize() first.');
      }
      return [];
    }
    const bgmCategory = this.audioCategories.find(cat => cat.id === 'bgm');
    const ambientCategory = this.audioCategories.find(cat => cat.id === 'ambient');
    const pomodoroBgmCategory = this.audioCategories.find(cat => cat.id === 'pomodoro-bgm');
    
    return [
      ...(bgmCategory?.files || []),
      ...(ambientCategory?.files || []),
      ...(pomodoroBgmCategory?.files || [])
    ];
  }

  getSoundEffects(): AudioFile[] {
    if (!this.isInitialized) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('AudioManager not initialized. Call initialize() first.');
      }
      return [];
    }
    return this.audioCategories
      .flatMap(cat => cat.files.filter(file => file.type === SoundType.SOUND_EFFECT));
  }

  async playAudio(url: string, volume: number = 1.0): Promise<HTMLAudioElement | null> {
    if (!url) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Empty URL provided to playAudio');
      }
      return null;
    }

    try {
      // 检查是否已有预加载的音频
      if (this.preloadedAudios.has(url)) {
        const audio = this.preloadedAudios.get(url)!;
        audio.currentTime = 0;
        audio.volume = volume;
        await audio.play();
        return audio;
      }

      // 创建新的音频元素
      const audio = new Audio(url);
      audio.volume = volume;

      // 尝试播放
      await audio.play();
      
      // 添加到预加载映射中以便重复使用
      this.preloadedAudios.set(url, audio);

      // 当音频播放完毕后，可以选择保留或移除（这里保留以供重复使用）
      audio.onended = () => {
        // 可以选择在此处清理不再需要的音频资源
      };

      return audio;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error playing audio: ${url}`, error);
      }
      return null;
    }
  }

  async preloadAudio(url: string): Promise<boolean> {
    try {
      if (this.preloadedAudios.has(url)) {
        return true;
      }

      const audio = new Audio();
      audio.src = url;
      
      // 预加载音频元数据
      await new Promise<void>((resolve, reject) => {
        audio.onloadedmetadata = () => resolve();
        audio.onerror = () => reject(new Error('Failed to preload audio'));
        audio.load();
      });

      this.preloadedAudios.set(url, audio);
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error preloading audio: ${url}`, error);
      }
      return false;
    }
  }

  async preloadCategory(categoryId: string): Promise<void> {
    if (!this.isInitialized) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('AudioManager not initialized. Call initialize() first.');
      }
      return;
    }

    if (this.isPreloading) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Preloading already in progress');
      }
      return;
    }

    this.isPreloading = true;

    try {
      const category = this.audioCategories.find(cat => cat.id === categoryId);
      if (category) {
        const promises = category.files.map(file => this.preloadAudio(file.url));
        await Promise.all(promises);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error preloading category: ${categoryId}`, error);
      }
    } finally {
      this.isPreloading = false;
    }
  }

  stopAllAudio(): void {
    this.preloadedAudios.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  getAudioStatistics(): { totalCategories: number; totalFiles: number; preloadedCount: number } {
    if (!this.isInitialized) {
      return { totalCategories: 0, totalFiles: 0, preloadedCount: 0 };
    }

    const totalFiles = this.audioCategories.reduce((count, category) => count + category.files.length, 0);
    return {
      totalCategories: this.audioCategories.length,
      totalFiles,
      preloadedCount: this.preloadedAudios.size
    };
  }
}

// 导出单例实例
const audioManager = AudioManager.getInstance();
export default audioManager;

// 也导出类型定义供其他模块使用
export type { AudioFile, AudioCategory };