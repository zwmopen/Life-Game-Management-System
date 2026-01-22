import { AudioFile } from './audioManager';

interface AudioPlayRecord {
  id: string;
  playCount: number;
  totalPlayTime: number; // 总播放时长（秒）
  lastPlayed: Date;
  lastStartedPlaying: Date | null; // 上次开始播放的时间
  isFavorite: boolean;
}

class AudioStatistics {
  private storageKey = 'audioPlayStatistics';
  private playRecords: Map<string, AudioPlayRecord> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const records = JSON.parse(stored);
        records.forEach((record: any) => {
          this.playRecords.set(record.id, {
            id: record.id,
            playCount: record.playCount,
            totalPlayTime: record.totalPlayTime || 0,
            lastPlayed: new Date(record.lastPlayed),
            lastStartedPlaying: record.lastStartedPlaying ? new Date(record.lastStartedPlaying) : null,
            isFavorite: record.isFavorite || false
          });
        });
      }
    } catch (error) {
      console.error('Error loading audio statistics from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const records = Array.from(this.playRecords.values());
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving audio statistics to storage:', error);
    }
  }

  // 切换收藏状态
  toggleFavorite(audioId: string): boolean {
    const existingRecord = this.playRecords.get(audioId);
    
    if (existingRecord) {
      existingRecord.isFavorite = !existingRecord.isFavorite;
    } else {
      this.playRecords.set(audioId, {
        id: audioId,
        playCount: 0,
        totalPlayTime: 0,
        lastPlayed: new Date(),
        lastStartedPlaying: null,
        isFavorite: true
      });
    }
    
    this.saveToStorage();
    return existingRecord ? existingRecord.isFavorite : true;
  }

  // 检查是否收藏
  isFavorite(audioId: string): boolean {
    const record = this.playRecords.get(audioId);
    return record ? record.isFavorite : false;
  }

  // 获取收藏的音频ID列表
  getFavoriteAudioIds(): Set<string> {
    const favoriteIds = new Set<string>();
    this.playRecords.forEach(record => {
      if (record.isFavorite) {
        favoriteIds.add(record.id);
      }
    });
    return favoriteIds;
  }

  // 开始跟踪播放时长
  startTrackingPlayTime(audioId: string): void {
    const now = new Date();
    const existingRecord = this.playRecords.get(audioId);
    
    if (existingRecord) {
      existingRecord.lastStartedPlaying = now;
    } else {
      this.playRecords.set(audioId, {
        id: audioId,
        playCount: 0,
        totalPlayTime: 0,
        lastPlayed: now,
        lastStartedPlaying: now,
        isFavorite: false
      });
    }
    
    this.saveToStorage();
  }

  // 停止跟踪播放时长并更新总时长
  stopTrackingPlayTime(audioId: string): void {
    const now = new Date();
    const existingRecord = this.playRecords.get(audioId);
    
    if (existingRecord && existingRecord.lastStartedPlaying) {
      // 计算播放时长（秒）
      const playDuration = (now.getTime() - existingRecord.lastStartedPlaying.getTime()) / 1000;
      existingRecord.totalPlayTime += Math.round(playDuration);
      existingRecord.lastPlayed = now;
      existingRecord.lastStartedPlaying = null;
      
      this.saveToStorage();
    }
  }

  recordPlay(audioId: string): void {
    const now = new Date();
    const existingRecord = this.playRecords.get(audioId);
    
    if (existingRecord) {
      existingRecord.playCount += 1;
      existingRecord.lastPlayed = now;
    } else {
      this.playRecords.set(audioId, {
        id: audioId,
        playCount: 1,
        totalPlayTime: 0,
        lastPlayed: now,
        lastStartedPlaying: null,
        isFavorite: false
      });
    }
    
    this.saveToStorage();
  }

  getPlayCount(audioId: string): number {
    const record = this.playRecords.get(audioId);
    return record ? record.playCount : 0;
  }

  // 获取总播放时长（秒）
  getTotalPlayTime(audioId: string): number {
    const record = this.playRecords.get(audioId);
    return record ? record.totalPlayTime : 0;
  }

  getSortedAudioFiles(audioFiles: AudioFile[]): AudioFile[] {
    // 创建副本以避免修改原始数组
    const sortedFiles = [...audioFiles];
    
    return sortedFiles.sort((a, b) => {
      // 1. 收藏的音频优先
      const aIsFavorite = this.isFavorite(a.id);
      const bIsFavorite = this.isFavorite(b.id);
      
      if (aIsFavorite !== bIsFavorite) {
        return aIsFavorite ? -1 : 1;
      }
      
      // 2. 按播放次数降序排列
      const aCount = this.getPlayCount(a.id);
      const bCount = this.getPlayCount(b.id);
      
      if (bCount !== aCount) {
        return bCount - aCount;
      }
      
      // 3. 如果播放次数相同，则按最后播放时间降序排列
      const aLastPlayed = this.getLastPlayed(a.id);
      const bLastPlayed = this.getLastPlayed(b.id);
      
      if (aLastPlayed && bLastPlayed) {
        return bLastPlayed.getTime() - aLastPlayed.getTime();
      }
      
      // 4. 如果最后播放时间相同或不存在，则按名称排序
      return a.name.localeCompare(b.name);
    });
  }

  private getLastPlayed(audioId: string): Date | null {
    const record = this.playRecords.get(audioId);
    return record ? record.lastPlayed : null;
  }

  getTopPlayedAudio(limit: number = 10): AudioPlayRecord[] {
    return Array.from(this.playRecords.values())
      .sort((a, b) => {
        // 先按播放次数降序，再按总播放时长降序
        if (b.playCount !== a.playCount) {
          return b.playCount - a.playCount;
        }
        return b.totalPlayTime - a.totalPlayTime;
      })
      .slice(0, limit);
  }

  resetStatistics(): void {
    this.playRecords.clear();
    this.saveToStorage();
  }

  // 获取所有音频统计数据（用于备份）
  getAllStatistics(): AudioPlayRecord[] {
    return Array.from(this.playRecords.values());
  }

  // 从备份恢复统计数据
  restoreStatistics(statistics: AudioPlayRecord[]): void {
    this.playRecords.clear();
    statistics.forEach(record => {
      this.playRecords.set(record.id, {
        ...record,
        lastPlayed: new Date(record.lastPlayed),
        lastStartedPlaying: record.lastStartedPlaying ? new Date(record.lastStartedPlaying) : null
      });
    });
    this.saveToStorage();
  }

  // 导出统计数据为JSON字符串
  exportStatistics(): string {
    const statistics = this.getAllStatistics();
    return JSON.stringify(statistics, null, 2);
  }

  // 导入统计数据从JSON字符串
  importStatistics(jsonString: string): boolean {
    try {
      const statistics = JSON.parse(jsonString);
      if (Array.isArray(statistics)) {
        this.restoreStatistics(statistics);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing audio statistics:', error);
      return false;
    }
  }
}

// 创建单例实例
const audioStatistics = new AudioStatistics();

export default audioStatistics;
export type { AudioPlayRecord };