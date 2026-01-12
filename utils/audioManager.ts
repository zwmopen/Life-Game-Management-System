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

class AudioManager {
  private audioCategories: AudioCategory[] = [];
  private isInitialized: boolean = false;
  private preloadedAudios: Map<string, HTMLAudioElement> = new Map();
  private isPreloading: boolean = false;

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
        id: 'sfx',
        name: '通用音效',
        files: await this.scanAudioFolder('/audio/sfx', SoundType.SOUND_EFFECT)
      }
    ];

    this.isInitialized = true;
  }

  // 预加载指定音频文件
  preloadAudio(url: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      if (this.preloadedAudios.has(url)) {
        resolve(this.preloadedAudios.get(url)!);
        return;
      }

      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = 0.3;

      audio.oncanplaythrough = () => {
        this.preloadedAudios.set(url, audio);
        resolve(audio);
      };

      audio.onerror = (error) => {
        console.error(`Failed to preload audio: ${url}`, error);
        reject(error);
      };

      audio.src = url;
    });
  }

  // 批量预加载音频文件
  async preloadAudios(urls: string[], progressCallback?: (loaded: number, total: number) => void) {
    if (this.isPreloading) return;

    this.isPreloading = true;
    const total = urls.length;
    let loaded = 0;

    try {
      const promises = urls.map(url => {
        return this.preloadAudio(url).then(() => {
          loaded++;
          if (progressCallback) progressCallback(loaded, total);
        }).catch(() => {
          loaded++;
          if (progressCallback) progressCallback(loaded, total);
        });
      });

      await Promise.all(promises);
    } finally {
      this.isPreloading = false;
    }
  }

  // 预加载所有背景音乐
  async preloadAllBackgroundMusic() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const bgmFiles = this.getBackgroundMusic();
    const bgmUrls = bgmFiles.map(file => file.url);
    await this.preloadAudios(bgmUrls);
  }

  // 预加载前N个背景音乐文件（用于分批加载）
  async preloadTopBackgroundMusic(limit: number = 10) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const bgmFiles = this.getBackgroundMusic();
    const topBgmUrls = bgmFiles.slice(0, limit).map(file => file.url);
    await this.preloadAudios(topBgmUrls);
  }

  private async scanAudioFolder(folderPath: string, type: SoundType): Promise<AudioFile[]> {
    try {
      // 使用新的API端点来获取音频文件列表
      const response = await fetch(`/api/audio-files?folder=${encodeURIComponent(folderPath)}`);
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.files && Array.isArray(result.files)) {
          // 将API返回的文件列表转换为AudioFile对象
          const files: AudioFile[] = result.files.map((fileName: string) => {
            // 从文件名生成显示名称
            const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
            
            // 保留原始文件名（不含扩展名）作为显示名称，支持中文文件名
            const displayName = nameWithoutExt
              .replace(/_/g, ' ')  // 将下划线替换为空格
              .replace(/-/g, ' ') // 将连字符替换为空格
              .trim();
            
            // 根据文件名自动分配图标
            const icon = this.getIconForFileName(nameWithoutExt);
            
            return {
              id: `${folderPath.replace(/[\/-]/g, '_')}_${nameWithoutExt}`,
              name: displayName || fileName,
              url: `${folderPath}/${fileName}`,
              type: type,
              icon
            };
          });
          
          return files;
        }
      }
      
      // 如果API调用失败，返回一个默认列表
      const folderName = folderPath.split('/').pop() || '';
      
      // 根据文件夹名称提供一些默认音频
      switch(folderName) {
        case 'battle':
          return [
            { id: 'battle-victory', name: '胜利音效', url: `${folderPath}/victory.mp3`, type, icon: 'Activity' },
            { id: 'battle-defeat', name: '失败音效', url: `${folderPath}/defeat.mp3`, type, icon: 'Activity' },
            { id: 'battle-alert', name: '警报音效', url: `${folderPath}/alert.mp3`, type, icon: 'Activity' }
          ];
        case 'bgm':
          return [
            { id: 'bgm-forest', name: '森林背景', url: `${folderPath}/forest.mp3`, type },
            { id: 'bgm-rain', name: '雨声背景', url: `${folderPath}/rain.mp3`, type },
            { id: 'bgm-ocean', name: '海洋背景', url: `${folderPath}/ocean.mp3`, type },
            { id: 'bgm-alpha', name: '阿尔法波', url: `${folderPath}/alpha.mp3`, type },
            { id: 'bgm-theta', name: '希塔波', url: `${folderPath}/theta.mp3`, type }
          ];
        case 'pomodoro-bgm':
          // 为番茄钟背景音乐目录提供常见的专注音乐选项
          return [
            { id: 'pomodoro-bgm-forest', name: '迷雾森林', url: `${folderPath}/forest.mp3`, type },
            { id: 'pomodoro-bgm-alpha', name: '阿尔法波', url: `${folderPath}/alpha.mp3`, type },
            { id: 'pomodoro-bgm-theta', name: '希塔波', url: `${folderPath}/theta.mp3`, type },
            { id: 'pomodoro-bgm-beta', name: '贝塔波', url: `${folderPath}/beta.mp3`, type },
            { id: 'pomodoro-bgm-ocean', name: '海浪声', url: `${folderPath}/ocean.mp3`, type },
            { id: 'pomodoro-bgm-rain', name: '雨声', url: `${folderPath}/rain.mp3`, type },
            { id: 'pomodoro-bgm-night', name: '夏夜虫鸣', url: `${folderPath}/night.mp3`, type },
            { id: 'pomodoro-bgm-white-noise', name: '白噪音', url: `${folderPath}/white-noise.mp3`, type },
            { id: 'pomodoro-bgm-pink-noise', name: '粉红噪音', url: `${folderPath}/pink-noise.mp3`, type },
            { id: 'pomodoro-bgm-brown-noise', name: '布朗噪音', url: `${folderPath}/brown-noise.mp3`, type },
            { id: 'pomodoro-bgm-cafe', name: '咖啡馆环境', url: `${folderPath}/cafe.mp3`, type },
            { id: 'pomodoro-bgm-fireplace', name: '壁炉声', url: `${folderPath}/fireplace.mp3`, type }
          ];
        case 'pomodoro':
          return [
            { id: 'pomodoro-start', name: '开始提示', url: `${folderPath}/start.mp3`, type },
            { id: 'pomodoro-end', name: '结束提示', url: `${folderPath}/end.mp3`, type },
            { id: 'pomodoro-warning', name: '警告提示', url: `${folderPath}/warning.mp3`, type }
          ];
        case 'dice':
          return [
            { id: 'dice-normal', name: '普通骰子', url: `${folderPath}/normal.mp3`, type },
            { id: 'dice-special', name: '特殊骰子', url: `${folderPath}/special.mp3`, type },
            { id: 'dice-magic', name: '魔法骰子', url: `${folderPath}/magic.mp3`, type }
          ];
        case 'sfx':
          return [
            { id: 'sfx-click', name: '点击音效', url: `${folderPath}/click.mp3`, type },
            { id: 'sfx-notification', name: '通知音效', url: `${folderPath}/notification.mp3`, type },
            { id: 'sfx-achievement', name: '成就音效', url: `${folderPath}/achievement.mp3`, type }
          ];
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error scanning audio folder ${folderPath} via API:`, error);
      
      // 发生错误时返回默认音频列表
      const folderName = folderPath.split('/').pop() || '';
      
      switch(folderName) {
        case 'battle':
          return [
            { id: 'battle-victory', name: '胜利音效', url: `${folderPath}/victory.mp3`, type, icon: 'Activity' },
            { id: 'battle-defeat', name: '失败音效', url: `${folderPath}/defeat.mp3`, type, icon: 'Activity' },
            { id: 'battle-alert', name: '警报音效', url: `${folderPath}/alert.mp3`, type, icon: 'Activity' }
          ];
        case 'bgm':
          return [
            { id: 'bgm-forest', name: '森林背景', url: `${folderPath}/forest.mp3`, type },
            { id: 'bgm-rain', name: '雨声背景', url: `${folderPath}/rain.mp3`, type },
            { id: 'bgm-ocean', name: '海洋背景', url: `${folderPath}/ocean.mp3`, type },
            { id: 'bgm-alpha', name: '阿尔法波', url: `${folderPath}/alpha.mp3`, type },
            { id: 'bgm-theta', name: '希塔波', url: `${folderPath}/theta.mp3`, type }
          ];
        case 'pomodoro-bgm':
          return [
            { id: 'pomodoro-bgm-forest', name: '迷雾森林', url: `${folderPath}/forest.mp3`, type },
            { id: 'pomodoro-bgm-alpha', name: '阿尔法波', url: `${folderPath}/alpha.mp3`, type },
            { id: 'pomodoro-bgm-theta', name: '希塔波', url: `${folderPath}/theta.mp3`, type },
            { id: 'pomodoro-bgm-beta', name: '贝塔波', url: `${folderPath}/beta.mp3`, type },
            { id: 'pomodoro-bgm-ocean', name: '海浪声', url: `${folderPath}/ocean.mp3`, type },
            { id: 'pomodoro-bgm-rain', name: '雨声', url: `${folderPath}/rain.mp3`, type },
            { id: 'pomodoro-bgm-night', name: '夏夜虫鸣', url: `${folderPath}/night.mp3`, type },
            { id: 'pomodoro-bgm-white-noise', name: '白噪音', url: `${folderPath}/white-noise.mp3`, type },
            { id: 'pomodoro-bgm-pink-noise', name: '粉红噪音', url: `${folderPath}/pink-noise.mp3`, type },
            { id: 'pomodoro-bgm-brown-noise', name: '布朗噪音', url: `${folderPath}/brown-noise.mp3`, type },
            { id: 'pomodoro-bgm-cafe', name: '咖啡馆环境', url: `${folderPath}/cafe.mp3`, type },
            { id: 'pomodoro-bgm-fireplace', name: '壁炉声', url: `${folderPath}/fireplace.mp3`, type }
          ];
        case 'pomodoro':
          return [
            { id: 'pomodoro-start', name: '开始提示', url: `${folderPath}/start.mp3`, type },
            { id: 'pomodoro-end', name: '结束提示', url: `${folderPath}/end.mp3`, type },
            { id: 'pomodoro-warning', name: '警告提示', url: `${folderPath}/warning.mp3`, type }
          ];
        case 'dice':
          return [
            { id: 'dice-normal', name: '普通骰子', url: `${folderPath}/normal.mp3`, type },
            { id: 'dice-special', name: '特殊骰子', url: `${folderPath}/special.mp3`, type },
            { id: 'dice-magic', name: '魔法骰子', url: `${folderPath}/magic.mp3`, type }
          ];
        case 'sfx':
          return [
            { id: 'sfx-click', name: '点击音效', url: `${folderPath}/click.mp3`, type },
            { id: 'sfx-notification', name: '通知音效', url: `${folderPath}/notification.mp3`, type },
            { id: 'sfx-achievement', name: '成就音效', url: `${folderPath}/achievement.mp3`, type }
          ];
        default:
          return [];
      }
    }
  }
  
  // 根据文件名分配图标
  private getIconForFileName(fileName: string): string {
    // 将文件名转为小写以进行匹配
    const lowerFileName = fileName.toLowerCase();
    
    // 根据关键词匹配分配图标
    if (lowerFileName.includes('forest') || lowerFileName.includes('woods') || lowerFileName.includes('trees')) {
      return 'Trees';
    } else if (lowerFileName.includes('rain') || lowerFileName.includes('storm') || lowerFileName.includes('drizzle')) {
      return 'CloudRain';
    } else if (lowerFileName.includes('ocean') || lowerFileName.includes('sea') || lowerFileName.includes('waves')) {
      return 'Waves';
    } else if (lowerFileName.includes('night') || lowerFileName.includes('cricket') || lowerFileName.includes('insects')) {
      return 'Moon';
    } else if (lowerFileName.includes('cafe') || lowerFileName.includes('coffee')) {
      return 'Coffee';
    } else if (lowerFileName.includes('fire') || lowerFileName.includes('fireplace')) {
      return 'Activity';
    } else if (lowerFileName.includes('white') && lowerFileName.includes('noise')) {
      return 'BrainCircuit';
    } else if (lowerFileName.includes('pink') && lowerFileName.includes('noise')) {
      return 'BrainCircuit';
    } else if (lowerFileName.includes('brown') && lowerFileName.includes('noise')) {
      return 'BrainCircuit';
    } else if (lowerFileName.includes('alpha')) {
      return 'Activity';
    } else if (lowerFileName.includes('beta')) {
      return 'Activity';
    } else if (lowerFileName.includes('theta')) {
      return 'Activity';
    } else if (lowerFileName.includes('meditation') || lowerFileName.includes('zen')) {
      return 'BrainCircuit';
    } else if (lowerFileName.includes('study') || lowerFileName.includes('focus')) {
      return 'BrainCircuit';
    } else {
      // 默认返回Waves图标
      return 'Waves';
    }
  }
  
  // 辅助函数：检查文件是否存在
  private async checkFileExists(filePath: string): Promise<boolean> {
    try {
      const response = await fetch(filePath, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  getCategories(): AudioCategory[] {
    if (!this.isInitialized) {
      console.warn('AudioManager not initialized. Call initialize() first.');
      return [];
    }
    return this.audioCategories;
  }

  getCategoryById(id: string): AudioCategory | undefined {
    if (!this.isInitialized) {
      console.warn('AudioManager not initialized. Call initialize() first.');
      return undefined;
    }
    return this.audioCategories.find(cat => cat.id === id);
  }

  getFileById(id: string): AudioFile | undefined {
    if (!this.isInitialized) {
      console.warn('AudioManager not initialized. Call initialize() first.');
      return undefined;
    }
    for (const category of this.audioCategories) {
      const file = category.files.find(f => f.id === id);
      if (file) return file;
    }
    return undefined;
  }

  // 播放音频的方法 - 优先使用预加载的音频
  playAudio(url: string, volume: number = 0.3) {
    try {
      // 检查是否有预加载的音频
      let audio = this.preloadedAudios.get(url);
      
      if (audio) {
        // 克隆预加载的音频元素，以便可以多次播放
        const clonedAudio = audio.cloneNode() as HTMLAudioElement;
        clonedAudio.volume = volume;
        clonedAudio.play().catch(e => {
          console.error('Error playing preloaded audio:', e);
          // 如果播放失败，尝试创建新的音频元素
          this.playAudioFallback(url, volume);
        });
        return clonedAudio;
      } else {
        // 如果没有预加载，使用回退方法
        return this.playAudioFallback(url, volume);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      return null;
    }
  }

  // 播放音频的回退方法 - 用于未预加载的音频
  private playAudioFallback(url: string, volume: number = 0.3) {
    try {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.play().catch(e => {
        console.error('Error playing audio fallback:', e);
      });
      return audio;
    } catch (error) {
      console.error('Error creating audio element fallback:', error);
      return null;
    }
  }

  // 获取特定类型的所有音频文件
  getFilesByType(type: SoundType): AudioFile[] {
    if (!this.isInitialized) {
      console.warn('AudioManager not initialized. Call initialize() first.');
      return [];
    }
    const files: AudioFile[] = [];
    this.audioCategories.forEach(category => {
      files.push(...category.files.filter(file => file.type === type));
    });
    return files;
  }

  // 获取背景音乐文件
  getBackgroundMusic(): AudioFile[] {
    return this.getFilesByType(SoundType.BACKGROUND_MUSIC);
  }

  // 获取音效文件
  getSoundEffects(): AudioFile[] {
    return this.getFilesByType(SoundType.SOUND_EFFECT);
  }
}

// 创建单例实例
const audioManager = new AudioManager();

export default audioManager;
export type { AudioFile, AudioCategory };