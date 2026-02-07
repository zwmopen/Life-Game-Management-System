import React, { useState, useEffect } from 'react';
import soundManager from '../utils/soundManager';

interface SoundSettingsProps {
  theme: string;
  settings: any;
  onUpdateSettings: (newSettings: any) => void;
}

const SoundSettings: React.FC<SoundSettingsProps> = ({ theme, settings, onUpdateSettings }) => {
  const [soundEffectVolume, setSoundEffectVolume] = useState(settings.soundEffectVolume || 0.7);
  const [bgMusicVolume, setBgMusicVolume] = useState(settings.bgMusicVolume || 0.5);
  const [enableSoundEffects, setEnableSoundEffects] = useState(settings.enableSoundEffects ?? true);
  const [enableBgMusic, setEnableBgMusic] = useState(settings.enableBgMusic ?? true);

  useEffect(() => {
    // 更新设置
    onUpdateSettings({
      soundEffectVolume,
      bgMusicVolume,
      enableSoundEffects,
      enableBgMusic
    });
  }, [soundEffectVolume, bgMusicVolume, enableSoundEffects, enableBgMusic]);

  const testSound = (soundId: string) => {
    if (!enableSoundEffects) {
      alert('音效已禁用，请先启用音效');
      return;
    }
    
    soundManager.playSoundEffect(soundId);
  };

  const isDark = theme === 'dark' || theme === 'neomorphic-dark';
  const isNeomorphic = theme.startsWith('neomorphic');
  
  const cardBg = isNeomorphic 
    ? (theme === 'neomorphic-dark' 
      ? `bg-[#1e1e2e] border-[#1e1e2e] rounded-[16px] shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)] transition-all duration-200` 
      : `bg-[#e0e5ec] border-[#e0e5ec] rounded-[16px] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] transition-all duration-200`) 
    : isDark 
    ? 'bg-zinc-900 border-zinc-800 shadow-[inset_-15px_-15px_30px_rgba(255,255,255,0.05),inset_15px_15px_30px_rgba(0,0,0,0.3)]' 
    : 'bg-white border-slate-200 shadow-[inset_-15px_-15px_30px_rgba(255,255,255,0.8),inset_15px_15px_30px_rgba(0,0,0,0.1)]';

  const textMain = isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';
  const textSub = isDark ? 'text-zinc-400' : isNeomorphic ? 'text-zinc-600' : 'text-slate-500';

  return (
    <div className={`p-6 rounded-2xl ${cardBg}`}>
      <h2 className={`text-xl font-bold mb-6 ${textMain}`}>音效管理设置</h2>
      
      <div className="space-y-6">
        {/* 音效总开关 */}
        <div className="flex items-center justify-between">
          <span className={`${textMain}`}>启用音效</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enableSoundEffects}
              onChange={(e) => setEnableSoundEffects(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* 音效音量控制 */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className={`${textMain}`}>音效音量</span>
            <span className={`${textSub}`}>{Math.round(soundEffectVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={soundEffectVolume}
            onChange={(e) => setSoundEffectVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            disabled={!enableSoundEffects}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <div className="flex space-x-4">
              <button 
                onClick={() => testSound('dice-fallback')} 
                disabled={!enableSoundEffects}
                className={`px-2 py-1 rounded text-xs ${!enableSoundEffects ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                骰子
              </button>
              <button 
                onClick={() => testSound('coin')} 
                disabled={!enableSoundEffects}
                className={`px-2 py-1 rounded text-xs ${!enableSoundEffects ? 'bg-gray-300 text-gray-500' : 'bg-green-500 text-white hover:bg-green-600'}`}
              >
                金币
              </button>
              <button 
                onClick={() => testSound('positive')} 
                disabled={!enableSoundEffects}
                className={`px-2 py-1 rounded text-xs ${!enableSoundEffects ? 'bg-gray-300 text-gray-500' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
              >
                正面
              </button>
            </div>
            <span>100%</span>
          </div>
        </div>

        {/* 背景音乐开关 */}
        <div className="flex items-center justify-between">
          <span className={`${textMain}`}>启用背景音乐</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enableBgMusic}
              onChange={(e) => setEnableBgMusic(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* 背景音乐音量控制 */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className={`${textMain}`}>背景音乐音量</span>
            <span className={`${textSub}`}>{Math.round(bgMusicVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={bgMusicVolume}
            onChange={(e) => setBgMusicVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            disabled={!enableBgMusic}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <div className="flex space-x-2">
              <button 
                onClick={() => soundManager.playBackgroundMusic('online-forest')} 
                disabled={!enableBgMusic}
                className={`px-2 py-1 rounded text-xs ${!enableBgMusic ? 'bg-gray-300 text-gray-500' : 'bg-teal-500 text-white hover:bg-teal-600'}`}
              >
                森林
              </button>
              <button 
                onClick={() => soundManager.playBackgroundMusic('online-alpha')} 
                disabled={!enableBgMusic}
                className={`px-2 py-1 rounded text-xs ${!enableBgMusic ? 'bg-gray-300 text-gray-500' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
              >
                α波
              </button>
            </div>
            <span>100%</span>
          </div>
        </div>

        {/* 音效类别管理 */}
        <div className="pt-4 border-t border-gray-300">
          <h3 className={`font-semibold mb-3 ${textMain}`}>音效类别管理</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}>
              <h4 className={`font-medium text-sm mb-2 ${textMain}`}>任务音效</h4>
              <div className="flex space-x-2">
                <button 
                  onClick={() => testSound('taskComplete')} 
                  disabled={!enableSoundEffects}
                  className={`text-xs px-2 py-1 rounded ${!enableSoundEffects ? 'bg-gray-300 text-gray-500' : 'bg-green-500 text-white'}`}
                >
                  完成
                </button>
                <button 
                  onClick={() => testSound('taskGiveUp')} 
                  disabled={!enableSoundEffects}
                  className={`text-xs px-2 py-1 rounded ${!enableSoundEffects ? 'bg-gray-300 text-gray-500' : 'bg-red-500 text-white'}`}
                >
                  放弃
                </button>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}>
              <h4 className={`font-medium text-sm mb-2 ${textMain}`}>经济音效</h4>
              <div className="flex space-x-2">
                <button 
                  onClick={() => testSound('coin')} 
                  disabled={!enableSoundEffects}
                  className={`text-xs px-2 py-1 rounded ${!enableSoundEffects ? 'bg-gray-300 text-gray-500' : 'bg-yellow-500 text-white'}`}
                >
                  收入
                </button>
                <button 
                  onClick={() => testSound('spend')} 
                  disabled={!enableSoundEffects}
                  className={`text-xs px-2 py-1 rounded ${!enableSoundEffects ? 'bg-gray-300 text-gray-500' : 'bg-orange-500 text-white'}`}
                >
                  支出
                </button>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}>
              <h4 className={`font-medium text-sm mb-2 ${textMain}`}>系统音效</h4>
              <div className="flex space-x-2">
                <button 
                  onClick={() => testSound('positive')} 
                  disabled={!enableSoundEffects}
                  className={`text-xs px-2 py-1 rounded ${!enableSoundEffects ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 text-white'}`}
                >
                  提示
                </button>
                <button 
                  onClick={() => testSound('achievement')} 
                  disabled={!enableSoundEffects}
                  className={`text-xs px-2 py-1 rounded ${!enableSoundEffects ? 'bg-gray-300 text-gray-500' : 'bg-purple-500 text-white'}`}
                >
                  成就
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundSettings;