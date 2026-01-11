import React, { useState, useEffect } from 'react';
import audioManager from '../utils/audioManager';
import { AudioCategory, AudioFile } from '../utils/audioManager';
import { SoundType } from '../types';

interface AudioManagementPanelProps {
  theme: 'dark' | 'light' | 'neomorphic-light' | 'neomorphic-dark';
  currentBgMusicId?: string;
  currentSoundEffectId?: string;
  onBgMusicChange?: (id: string) => void;
  onSoundEffectChange?: (id: string) => void;
}

const AudioManagementPanel: React.FC<AudioManagementPanelProps> = ({
  theme,
  currentBgMusicId,
  currentSoundEffectId,
  onBgMusicChange,
  onSoundEffectChange
}) => {
  const [categories, setCategories] = useState<AudioCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('bgm');
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.7);

  useEffect(() => {
    // 初始化音频管理器
    audioManager.initialize().then(() => {
      setCategories(audioManager.getCategories());
    });
  }, []);

  const handlePlayAudio = (file: AudioFile) => {
    // 停止当前播放的音频
    if (isPlaying) {
      setIsPlaying(null);
    }

    // 播放选定的音频
    const audio = audioManager.playAudio(file.url, volume);
    if (audio) {
      setIsPlaying(file.id);
      // 自动停止播放状态
      audio.onended = () => setIsPlaying(null);
      audio.onerror = () => setIsPlaying(null);
    }
  };

  const handleSelectAudio = (file: AudioFile) => {
    if (file.type === SoundType.BACKGROUND_MUSIC) {
      onBgMusicChange?.(file.id);
    } else {
      onSoundEffectChange?.(file.id);
    }
  };

  const selectedCat = categories.find(cat => cat.id === selectedCategory);

  // 主题相关样式
  const isDark = theme === 'dark' || theme === 'neomorphic-dark';
  const isNeomorphic = theme.startsWith('neomorphic');
  const bgColor = isNeomorphic 
    ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]')
    : (isDark ? 'bg-zinc-900' : 'bg-white');
  const textColor = theme === 'neomorphic-dark' ? 'text-zinc-200' : isDark ? 'text-zinc-200' : (isNeomorphic ? 'text-zinc-700' : 'text-slate-800');
  const subTextColor = theme === 'neomorphic-dark' ? 'text-zinc-300' : isDark ? 'text-zinc-400' : (isNeomorphic ? 'text-zinc-600' : 'text-slate-600');

  return (
    <div className={`rounded-xl p-4 ${bgColor} ${isNeomorphic ? 
      (isDark 
        ? 'shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]' 
        : 'shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]') 
      : (isDark 
        ? 'shadow-lg' 
        : 'shadow-md')}`}>
      <h3 className={`font-bold mb-4 ${textColor}`}>音频管理库</h3>
      
      <div className="mb-4">
        <label className={`block text-sm mb-2 ${subTextColor}`}>音量控制</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className={`text-xs ${subTextColor} text-right`}>{Math.round(volume * 100)}%</div>
      </div>

      <div className="mb-4">
        <label className={`block text-sm mb-2 ${subTextColor}`}>音频分类</label>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                selectedCategory === category.id
                  ? (isDark ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-500 text-white border-blue-500')
                  : isNeomorphic 
                    ? `${bgColor} border ${isDark ? 'border-[#1e1e2e]' : 'border-[#e0e5ec]'} ${isDark ? 'text-zinc-400' : 'text-zinc-600'} hover:${isDark ? 'border-zinc-600 text-zinc-200' : 'border-zinc-400 text-zinc-800'}`
                    : (isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200' : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800')}`
              }
            >
              {category.name} ({category.files.length})
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={`block text-sm mb-2 ${subTextColor}`}>
          {selectedCat?.name} ({selectedCat?.files.length} 个文件)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
          {selectedCat?.files.map(file => (
            <div 
              key={file.id}
              className={`p-3 rounded-lg flex items-center justify-between ${
                isNeomorphic 
                  ? `${bgColor} ${(isDark 
                      ? 'shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(30,30,46,0.8)]' 
                      : 'shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,1)]')} ${
                      file.id === (file.type === SoundType.BACKGROUND_MUSIC ? currentBgMusicId : currentSoundEffectId) 
                        ? (isDark ? 'ring-2 ring-blue-500' : 'ring-2 ring-blue-400') 
                        : ''
                    }`
                  : (isDark 
                      ? `bg-zinc-800 ${(file.id === (file.type === SoundType.BACKGROUND_MUSIC ? currentBgMusicId : currentSoundEffectId) 
                          ? 'ring-2 ring-blue-500' 
                          : 'border border-zinc-700')}`
                      : `bg-slate-50 ${(file.id === (file.type === SoundType.BACKGROUND_MUSIC ? currentBgMusicId : currentSoundEffectId) 
                          ? 'ring-2 ring-blue-400' 
                          : 'border border-slate-200')}`)
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${textColor}`}>{file.name}</div>
                <div className={`text-xs truncate ${subTextColor}`}>{file.id}</div>
              </div>
              <div className="flex gap-2 ml-2">
                <button
                  onClick={() => handlePlayAudio(file)}
                  className={`p-2 rounded-full ${
                    isPlaying === file.id 
                      ? (isDark ? 'bg-green-600 text-white' : 'bg-green-500 text-white') 
                      : isNeomorphic 
                        ? `${isDark ? 'bg-[#1e1e2e] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'}`
                        : (isDark ? 'bg-zinc-700' : 'bg-slate-200')
                  }`}
                  title="播放音频"
                >
                  {isPlaying === file.id ? '⏹️' : '▶️'}
                </button>
                <button
                  onClick={() => handleSelectAudio(file)}
                  className={`p-2 rounded-full ${
                    file.id === (file.type === SoundType.BACKGROUND_MUSIC ? currentBgMusicId : currentSoundEffectId)
                      ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                      : isNeomorphic 
                        ? `${isDark ? 'bg-[#1e1e2e] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'}`
                        : (isDark ? 'bg-zinc-700' : 'bg-slate-200')
                  }`}
                  title="设为当前音频"
                >
                  {file.type === SoundType.BACKGROUND_MUSIC ? '🎶' : '🔊'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`mt-4 text-xs ${subTextColor} p-3 rounded-lg ${isNeomorphic ? 
        (isDark 
          ? 'bg-[#1a1a24] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(26,26,36,0.8)]' 
          : 'bg-[#d8dde4] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]') 
        : (isDark 
          ? 'bg-zinc-800' 
          : 'bg-slate-100')}`}>
        <p className="font-bold mb-1">使用说明：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>将音频文件放入 <code className="bg-black/10 px-1 rounded">public/audio/[分类]</code> 文件夹中</li>
          <li>音频文件支持 MP3、WAV、OGG 格式</li>
          <li>点击 🎵 播放预览音频</li>
          <li>点击 🎶/🔊 设为当前使用的音频</li>
          <li>系统会自动扫描文件夹中的音频文件</li>
        </ul>
      </div>
    </div>
  );
};

export default AudioManagementPanel;