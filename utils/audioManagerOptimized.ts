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
      // 处理特殊情况：如果是番茄钟背景音乐目录，使用实际文件列表
      if (folderPath === '/audio/pomodoro/bgm') {
        // 直接返回实际目录中的所有音乐文件
        // 注意：这里使用了预定义的完整文件列表，因为浏览器无法直接读取服务器目录
        const actualFiles = [
          "26.5℃.mp3", "七弦.mp3", "乒乓.mp3", "乘车.mp3", "乡间清晨.mp3", "云端.mp3", "人马座A.mp3",
          "企鹅.mp3", "伞下.mp3", "信号.mp3", "假日.mp3", "光年.mp3", "光蕴.mp3", "八音盒.mp3",
          "公园.mp3", "公路.mp3", "冥想.mp3", "冰河.mp3", "切菜.mp3", "初雪.mp3", "博物馆.mp3",
          "古镇清晨.mp3", "咖啡.mp3", "咖啡豆.mp3", "唐人街.mp3", "啄木鸟.mp3", "喜马拉雅.mp3",
          "图书馆.mp3", "土卫六.mp3", "土星.mp3", "圣诞.mp3", "夏夜.mp3", "夏威夷海滩.mp3", "夏虫.mp3",
          "夜宵.mp3", "夜影.mp3", "夜海.mp3", "夜航.mp3", "天王星.mp3", "她的城市.mp3", "家宴.mp3",
          "寺庙.mp3", "屋檐.mp3", "山径.mp3", "山泉.mp3", "山涧.mp3", "山谷.mp3", "岁.mp3",
          "岛屿.mp3", "岩雨.mp3", "川流.mp3", "布谷.mp3", "年.mp3", "幻境.mp3", "幻海.mp3",
          "广场.mp3", "序章.mp3", "庭院.mp3", "微光.mp3", "心跳.mp3", "悠长假日.mp3", "手谈.mp3",
          "打字机.mp3", "斑马.mp3", "斯诺克.mp3", "旅程.mp3", "旅行的家.mp3", "日出.mp3", "时钟.mp3",
          "旷野.mp3", "星图.mp3", "星际.mp3", "春雨.mp3", "月之暗面.mp3", "月球.mp3", "木卫四.mp3",
          "木星.mp3", "林风.mp3", "柔软之境.mp3", "栎树.mp3", "森林.mp3", "樱花.mp3", "水星.mp3",
          "水母.mp3", "水滴.mp3", "池塘.mp3", "汽水.mp3", "沙漠.mp3", "泛舟.mp3", "洗碗机.mp3",
          "洗衣机.mp3", "洞穴.mp3", "流水.mp3", "浮潜.mp3", "浮空.mp3", "海洋.mp3", "海港.mp3",
          "海王星.mp3", "海豚.mp3", "涌冻.mp3", "深海.mp3", "深睡小夜曲.mp3", "湖.mp3", "湿地.mp3",
          "溪流.mp3", "潜往.mp3", "瀑布.mp3", "火山.mp3", "火星.mp3", "火花.mp3", "火车.mp3",
          "炉火.mp3", "炒茶.mp3", "热带雨林.mp3", "焰火.mp3", "煲汤.mp3", "独白.mp3", "猫的午后.mp3",
          "白马.mp3", "盈月.mp3", "睡吧睡吧.mp3", "石子路.mp3", "磨砚.mp3", "禧.mp3", "秋风.mp3",
          "空电视.mp3", "竹林.mp3", "篝火.mp3", "篮球场.mp3", "绘画.mp3", "绵雨.mp3", "网球.mp3",
          "老风车.mp3", "良夜.mp3", "萤火.mp3", "蒲公英.mp3", "蓝色时间.mp3", "蓝色星球.mp3", "蓝莓之夜.mp3",
          "蝉鸣.mp3", "街巷.mp3", "西餐厅.mp3", "踏雪.mp3", "轴韵.mp3", "远山.mp3", "迷泉.mp3",
          "醒狮.mp3", "金星.mp3", "钵.mp3", "铅笔.mp3", "键盘.mp3", "长路.mp3", "阅读.mp3",
          "除夕.mp3", "雨天.mp3", "雨泊.mp3", "雨窗.mp3", "雪兔.mp3", "雪山.mp3", "雷雨.mp3",
          "静电.mp3", "须臾.mp3", "风扇.mp3", "风铃.mp3", "飘.mp3", "飞行.mp3", "鲸鱼.mp3",
          "麦浪.mp3", "她的城市.mp3", "家宴.mp3", "寺庙.mp3", "屋檐.mp3", "山径.mp3", "山泉.mp3",
          "山涧.mp3", "山谷.mp3", "岁.mp3", "岛屿.mp3", "岩雨.mp3", "川流.mp3", "布谷.mp3",
          "年.mp3", "幻境.mp3", "幻海.mp3", "广场.mp3", "序章.mp3", "庭院.mp3", "微光.mp3",
          "心跳.mp3", "悠长假日.mp3", "手谈.mp3", "打字机.mp3", "斑马.mp3", "斯诺克.mp3", "旅程.mp3",
          "旅行的家.mp3", "日出.mp3", "时钟.mp3", "旷野.mp3", "星图.mp3", "星际.mp3", "春雨.mp3",
          "月之暗面.mp3", "月球.mp3", "木卫四.mp3", "木星.mp3", "林风.mp3", "柔软之境.mp3", "栎树.mp3",
          "森林.mp3", "樱花.mp3", "水星.mp3", "水母.mp3", "水滴.mp3", "池塘.mp3", "汽水.mp3",
          "沙漠.mp3", "泛舟.mp3", "洗碗机.mp3", "洗衣机.mp3", "洞穴.mp3", "流水.mp3", "浮潜.mp3",
          "浮空.mp3", "海洋.mp3", "海港.mp3", "海王星.mp3", "海豚.mp3", "涌冻.mp3", "深海.mp3",
          "深睡小夜曲.mp3", "湖.mp3", "湿地.mp3", "溪流.mp3", "潜往.mp3", "瀑布.mp3", "火山.mp3",
          "火星.mp3", "火花.mp3", "火车.mp3", "炉火.mp3", "炒茶.mp3", "热带雨林.mp3", "焰火.mp3",
          "煲汤.mp3", "独白.mp3", "猫的午后.mp3", "白马.mp3", "盈月.mp3", "睡吧睡吧.mp3", "石子路.mp3",
          "磨砚.mp3", "禧.mp3", "秋风.mp3", "空电视.mp3", "竹林.mp3", "篝火.mp3", "篮球场.mp3",
          "绘画.mp3", "绵雨.mp3", "网球.mp3", "老风车.mp3", "良夜.mp3", "萤火.mp3", "蒲公英.mp3",
          "蓝色时间.mp3", "蓝色星球.mp3", "蓝莓之夜.mp3", "蝉鸣.mp3", "街巷.mp3", "西餐厅.mp3", "踏雪.mp3",
          "轴韵.mp3", "远山.mp3", "迷泉.mp3", "醒狮.mp3", "金星.mp3", "钵.mp3", "铅笔.mp3",
          "键盘.mp3", "长路.mp3", "阅读.mp3", "除夕.mp3", "雨天.mp3", "雨泊.mp3", "雨窗.mp3",
          "雪兔.mp3", "雪山.mp3", "雷雨.mp3", "静电.mp3", "须臾.mp3", "风扇.mp3", "风铃.mp3",
          "飘.mp3", "飞行.mp3", "鲸鱼.mp3", "麦浪.mp3", "麻将.mp3"
        ];
        
        // 去重处理
        const uniqueFiles = [...new Set(actualFiles)];
        
        return uniqueFiles.map(fileName => ({
          id: `${folderPath.replace('/', '_').replace('-', '_')}_${fileName.replace(/\.[^/.]+$/, "")}`,
          name: fileName.replace(/\.[^/.]+$/, ""), // 移除扩展名作为显示名称
          url: this.getCorrectAudioUrl(`${folderPath}/${fileName}`),
          type,
          icon: this.getIconForAudio(fileName, type)
        }));
      }

      // 由于直接获取目录列表可能不可行，我们使用预定义的文件列表
      // 或者尝试从一个 JSON 文件中获取文件列表
      const filesResponse = await fetch(`${folderPath}/files.json?t=${Date.now()}`);
      if (filesResponse.ok) {
        const fileNames: string[] = await filesResponse.json();
        return fileNames.map(fileName => ({
          id: `${folderPath.replace('/', '_').replace('-', '_')}_${fileName.replace(/\.[^/.]+$/, "")}`,
          name: fileName.replace(/\.[^/.]+$/, ""), // 移除扩展名作为显示名称
          url: this.getCorrectAudioUrl(`${folderPath}/${fileName}`),
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
        // 只保留用户要求的3个音乐，与pomodoro/bgm目录中的音乐合并
        return [
          { id: 'forest', name: '森林', url: this.getCorrectAudioUrl('/audio/pomodoro/bgm/森林.mp3'), type, icon: '🌲' },
          { id: 'rain', name: '雨天', url: this.getCorrectAudioUrl('/audio/pomodoro/bgm/雨天.mp3'), type, icon: '🌧️' },
          { id: 'ocean', name: '海洋', url: this.getCorrectAudioUrl('/audio/pomodoro/bgm/海洋.mp3'), type, icon: '🌊' }
        ];
      case '/audio/pomodoro/bgm':
        // 这里会返回用户的100多个音乐，与上面的3个合并
        return [];
      case '/audio/battle':
        return [
          { id: 'sword_strike', name: '剑击声', url: this.getCorrectAudioUrl('/audio/battle/sword-strike.mp3'), type, icon: '⚔️' },
          { id: 'magic_spell', name: '魔法咒语', url: this.getCorrectAudioUrl('/audio/battle/magic-spell.mp3'), type, icon: '🔮' },
          { id: 'arrow_shot', name: '弓箭射击', url: this.getCorrectAudioUrl('/audio/battle/arrow-shot.mp3'), type, icon: '🏹' },
          { id: 'shield_block', name: '盾牌格挡', url: this.getCorrectAudioUrl('/audio/battle/shield-block.mp3'), type, icon: '🛡️' },
          { id: 'battle_cry', name: '战斗呐喊', url: this.getCorrectAudioUrl('/audio/battle/battle-cry.mp3'), type, icon: '🦁' }
        ];
      case '/audio/dice':
        return [
          { id: 'dice_roll', name: '骰子滚动', url: this.getCorrectAudioUrl('/audio/dice/dice-roll.mp3'), type, icon: '🎲' },
          { id: 'dice_drop', name: '骰子落地', url: this.getCorrectAudioUrl('/audio/dice/dice-drop.mp3'), type, icon: '🎯' }
        ];
      case '/audio/notification':
        return [
          { id: 'notification_ping', name: '提示音', url: this.getCorrectAudioUrl('/audio/notification/ping.mp3'), type, icon: '🔔' },
          { id: 'notification_alert', name: '警报声', url: this.getCorrectAudioUrl('/audio/notification/alert.mp3'), type, icon: '🚨' }
        ];
      case '/audio/completion':
        return [
          { id: 'task_complete', name: '任务完成', url: this.getCorrectAudioUrl('/audio/completion/task-complete.mp3'), type, icon: '✅' },
          { id: 'achievement_unlock', name: '成就解锁', url: this.getCorrectAudioUrl('/audio/completion/achievement-unlock.mp3'), type, icon: '🏆' }
        ];
      case '/audio/focus':
        return [
          { id: 'focus_start', name: '专注开始', url: this.getCorrectAudioUrl('/audio/focus/focus-start.mp3'), type, icon: ' concentric-circles' },
          { id: 'focus_end', name: '专注结束', url: this.getCorrectAudioUrl('/audio/focus/focus-end.mp3'), type, icon: ' concentric-circles' }
        ];
      case '/audio/break':
        return [
          { id: 'break_start', name: '休息开始', url: this.getCorrectAudioUrl('/audio/break/break-start.mp3'), type, icon: '⏸️' },
          { id: 'break_end', name: '休息结束', url: this.getCorrectAudioUrl('/audio/break/break-end.mp3'), type, icon: '▶️' }
        ];
      case '/audio/ambient':
        return [
          { id: 'city_ambience', name: '城市氛围', url: this.getCorrectAudioUrl('/audio/ambient/city.mp3'), type, icon: '🏙️' },
          { id: 'forest_ambience', name: '森林氛围', url: this.getCorrectAudioUrl('/audio/ambient/forest.mp3'), type, icon: '🌲' },
          { id: 'mountain_ambience', name: '山间氛围', url: this.getCorrectAudioUrl('/audio/ambient/mountain.mp3'), type, icon: '⛰️' },
          { id: 'river_ambience', name: '溪流氛围', url: this.getCorrectAudioUrl('/audio/ambient/river.mp3'), type, icon: '💧' }
        ];
      default:
        // 对于其他路径，返回通用的音效
        return [
          { id: `${folderPath.replace(/\//g, '_')}_default1`, name: '默认音效1', url: this.getCorrectAudioUrl(`${folderPath}/default1.mp3`), type, icon: '🎵' },
          { id: `${folderPath.replace(/\//g, '_')}_default2`, name: '默认音效2', url: this.getCorrectAudioUrl(`${folderPath}/default2.mp3`), type, icon: '🎶' }
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
    const pomodoroBgmCategory = this.audioCategories.find(cat => cat.id === 'pomodoro-bgm');
    
    // 只返回bgm和pomodoro-bgm目录的音乐，不包含ambient目录的音乐
    // 并确保没有重复的音乐文件
    const allMusic = [
      ...(bgmCategory?.files || []),
      ...(pomodoroBgmCategory?.files || [])
    ];
    
    // 去重处理，确保每个音乐文件只出现一次
    const uniqueMusicMap = new Map();
    allMusic.forEach(music => {
      // 使用音乐名称作为去重键，确保相同名称的音乐只保留一个
      if (!uniqueMusicMap.has(music.name)) {
        uniqueMusicMap.set(music.name, music);
      }
    });
    
    return Array.from(uniqueMusicMap.values());
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

  // 获取正确的音频URL，根据环境使用不同的基础路径
  private getCorrectAudioUrl(url: string): string {
    // 检查URL是否已经包含完整路径
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 根据环境使用不同的基础路径
    const isDevelopment = process.env.NODE_ENV === 'development';
    const basePath = isDevelopment ? '' : '/Life-Game-Management-System';
    // 确保URL格式正确
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    return `${basePath}${normalizedUrl}`;
  }

  async playAudio(url: string, volume: number = 1.0): Promise<HTMLAudioElement | null> {
    if (!url) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Empty URL provided to playAudio');
      }
      return null;
    }

    try {
      // 获取正确的URL
      const correctUrl = this.getCorrectAudioUrl(url);
      
      // 检查是否已有预加载的音频
      if (this.preloadedAudios.has(correctUrl)) {
        const audio = this.preloadedAudios.get(correctUrl)!;
        audio.currentTime = 0;
        audio.volume = volume;
        await audio.play();
        return audio;
      }

      // 创建新的音频元素
      const audio = new Audio(correctUrl);
      audio.volume = volume;

      // 尝试播放
      await audio.play();
      
      // 添加到预加载映射中以便重复使用
      this.preloadedAudios.set(correctUrl, audio);

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
      const correctUrl = this.getCorrectAudioUrl(url);
      
      if (this.preloadedAudios.has(correctUrl)) {
        return true;
      }

      const audio = new Audio();
      audio.src = correctUrl;
      
      // 预加载音频元数据
      await new Promise<void>((resolve, reject) => {
        audio.onloadedmetadata = () => resolve();
        audio.onerror = () => reject(new Error('Failed to preload audio'));
        audio.load();
      });

      this.preloadedAudios.set(correctUrl, audio);
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