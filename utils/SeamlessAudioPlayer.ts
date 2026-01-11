import { useEffect, useRef, useState } from 'react';

interface SeamlessAudioPlayerOptions {
  volume?: number;
  loop?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
}

class SeamlessAudioBuffer {
  private audioContext: AudioContext;
  private bufferSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode;
  private startTime: number = 0;
  private pausedTime: number = 0;
  private isPlaying: boolean = false;
  private isLooping: boolean = false;

  constructor(private buffer: AudioBuffer, private volume: number = 0.5) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = volume;
  }

  async play(loop: boolean = false) {
    // 如果正在播放，先停止当前播放
    if (this.isPlaying) {
      this.stop();
    }

    this.isLooping = loop;
    this.bufferSource = this.audioContext.createBufferSource();
    this.bufferSource.buffer = this.buffer;
    this.bufferSource.connect(this.gainNode);
    
    // 当音频结束时，如果是循环模式则立即重新播放
    this.bufferSource.onended = () => {
      if (this.isLooping && this.isPlaying) {
        this.play(true); // 递归播放以实现无缝循环
      }
    };

    // 检查音频上下文状态，如果被挂起则恢复
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.startTime = this.audioContext.currentTime;
    this.bufferSource.start(0);
    this.isPlaying = true;
  }

  pause() {
    if (this.isPlaying && this.bufferSource) {
      this.pausedTime = this.getCurrentTime();
      this.bufferSource.stop();
      this.bufferSource.disconnect();
      this.bufferSource = null;
      this.isPlaying = false;
    }
  }

  stop() {
    if (this.bufferSource) {
      this.bufferSource.stop();
      this.bufferSource.disconnect();
      this.bufferSource = null;
      this.isPlaying = false;
    }
  }

  setVolume(volume: number) {
    this.volume = volume;
    this.gainNode.gain.value = volume;
  }

  getCurrentTime(): number {
    if (this.isPlaying && this.audioContext && this.bufferSource) {
      return (this.audioContext.currentTime - this.startTime) % this.buffer.duration;
    }
    return this.pausedTime;
  }

  getDuration(): number {
    return this.buffer.duration;
  }

  isPlayingStatus(): boolean {
    return this.isPlaying;
  }
}

class SeamlessAudioPlayer {
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private seamlessBuffers: Map<string, SeamlessAudioBuffer> = new Map();
  private currentPlayingId: string | null = null;
  private volume: number = 0.3;

  async loadAudio(id: string, url: string): Promise<void> {
    try {
      // 尝试使用 Web Audio API 加载音频以实现无缝循环
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const seamlessBuffer = new SeamlessAudioBuffer(audioBuffer, this.volume);
      this.seamlessBuffers.set(id, seamlessBuffer);
    } catch (error) {
      console.warn(`Failed to load audio with Web Audio API for seamless playback: ${id}`, error);
      // 如果 Web Audio API 失败，回退到传统的 HTML5 Audio
      const audio = new Audio(url);
      audio.volume = this.volume;
      audio.loop = true;
      this.audioElements.set(id, audio);
    }
  }

  async play(id: string, loop: boolean = true): Promise<void> {
    // 停止当前播放的音频
    await this.stop();

    this.currentPlayingId = id;

    // 优先使用无缝缓冲区播放
    const seamlessBuffer = this.seamlessBuffers.get(id);
    if (seamlessBuffer) {
      await seamlessBuffer.play(loop);
    } else {
      // 回退到传统音频元素
      const audio = this.audioElements.get(id);
      if (audio) {
        audio.currentTime = 0;
        await audio.play();
      }
    }
  }

  pause(): void {
    if (this.currentPlayingId) {
      const seamlessBuffer = this.seamlessBuffers.get(this.currentPlayingId);
      if (seamlessBuffer) {
        seamlessBuffer.pause();
      } else {
        const audio = this.audioElements.get(this.currentPlayingId);
        if (audio) {
          audio.pause();
        }
      }
    }
  }

  async stop(): Promise<void> {
    if (this.currentPlayingId) {
      const seamlessBuffer = this.seamlessBuffers.get(this.currentPlayingId);
      if (seamlessBuffer) {
        seamlessBuffer.stop();
      } else {
        const audio = this.audioElements.get(this.currentPlayingId);
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
      this.currentPlayingId = null;
    }
  }

  setVolume(volume: number): void {
    this.volume = volume;
    
    // 更新所有已加载的无缝缓冲区
    for (const [_, buffer] of this.seamlessBuffers) {
      buffer.setVolume(volume);
    }
    
    // 更新所有已加载的传统音频元素
    for (const [_, audio] of this.audioElements) {
      audio.volume = volume;
    }
  }

  getCurrentTime(id: string): number {
    const seamlessBuffer = this.seamlessBuffers.get(id);
    if (seamlessBuffer) {
      return seamlessBuffer.getCurrentTime();
    }
    
    const audio = this.audioElements.get(id);
    if (audio) {
      return audio.currentTime;
    }
    
    return 0;
  }

  getDuration(id: string): number {
    const seamlessBuffer = this.seamlessBuffers.get(id);
    if (seamlessBuffer) {
      return seamlessBuffer.getDuration();
    }
    
    const audio = this.audioElements.get(id);
    if (audio) {
      return audio.duration;
    }
    
    return 0;
  }

  isPlaying(id: string): boolean {
    const seamlessBuffer = this.seamlessBuffers.get(id);
    if (seamlessBuffer) {
      return seamlessBuffer.isPlayingStatus();
    }
    
    const audio = this.audioElements.get(id);
    if (audio) {
      return !audio.paused;
    }
    
    return false;
  }
}

// 创建全局实例
const seamlessAudioPlayer = new SeamlessAudioPlayer();
export default seamlessAudioPlayer;

// React Hook for using the seamless audio player
export const useSeamlessAudio = (options?: SeamlessAudioPlayerOptions) => {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(options?.volume || 0.3);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playerRef = useRef(seamlessAudioPlayer);

  useEffect(() => {
    playerRef.current.setVolume(volume);
  }, [volume]);

  const loadTrack = async (id: string, url: string) => {
    await playerRef.current.loadAudio(id, url);
  };

  const playTrack = async (id: string) => {
    await playerRef.current.play(id, options?.loop ?? true);
    setCurrentTrackId(id);
    setIsPlaying(true);
    setDuration(playerRef.current.getDuration(id));
  };

  const pauseTrack = () => {
    playerRef.current.pause();
    setIsPlaying(false);
  };

  const stopTrack = async () => {
    await playerRef.current.stop();
    setCurrentTrackId(null);
    setIsPlaying(false);
  };

  // 定期更新当前时间和持续时间
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentTrackId && isPlaying) {
      interval = setInterval(() => {
        const time = playerRef.current.getCurrentTime(currentTrackId);
        setCurrentTime(time);
        if (options?.onTimeUpdate) {
          options.onTimeUpdate(time);
        }
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentTrackId, isPlaying, options?.onTimeUpdate]);

  return {
    loadTrack,
    playTrack,
    pauseTrack,
    stopTrack,
    currentTrackId,
    isPlaying,
    volume,
    setVolume: (vol: number) => setVolume(vol),
    currentTime,
    duration,
  };
};