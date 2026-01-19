import { AudioFile } from './audioManager';

interface AudioPlayRecord {
  id: string;
  playCount: number;
  lastPlayed: Date;
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
            lastPlayed: new Date(record.lastPlayed),
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
        lastPlayed: new Date(),
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
        lastPlayed: now,
        isFavorite: false
      });
    }
    
    this.saveToStorage();
  }

  getPlayCount(audioId: string): number {
    const record = this.playRecords.get(audioId);
    return record ? record.playCount : 0;
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
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  }

  resetStatistics(): void {
    this.playRecords.clear();
    this.saveToStorage();
  }
}

// 创建单例实例
const audioStatistics = new AudioStatistics();

export default audioStatistics;
export type { AudioPlayRecord };