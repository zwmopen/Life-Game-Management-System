import React, { useState } from 'react';
import soundManager from '../utils/soundManager';

const BgMusicTestComponent: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const testBgMusic = (id: string, name: string) => {
    console.log(`尝试播放背景音乐 ${name} (${id})...`);
    
    try {
      // 停止当前播放的音乐
      if (isPlaying) {
        soundManager.stopCurrentBackgroundMusic();
      }
      
      // 播放新音乐
      soundManager.playBackgroundMusic(id);
      setIsPlaying(id);
      
      console.log(`成功启动播放背景音乐: ${name}`);
    } catch (error) {
      console.error(`播放背景音乐 ${name} 失败:`, error);
    }
  };

  const stopAllMusic = () => {
    soundManager.stopCurrentBackgroundMusic();
    setIsPlaying(null);
    console.log('已停止所有背景音乐');
  };

  const toggleMute = () => {
    const isMuted = soundManager.toggleMute();
    console.log(isMuted ? '音效已静音' : '音效已取消静音');
  };

  return (
    <div className="bg-music-test-container p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-2">背景音乐测试面板</h3>
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => testBgMusic('online-forest', '迷雾森林')}
          className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded mr-2"
        >
          迷雾森林
        </button>
        <button 
          onClick={() => testBgMusic('online-alpha', '阿尔法波')}
          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded mr-2"
        >
          阿尔法波
        </button>
        <button 
          onClick={() => testBgMusic('online-theta', '希塔波')}
          className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 rounded mr-2"
        >
          希塔波
        </button>
        <button 
          onClick={() => testBgMusic('online-beta', '贝塔波')}
          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded mr-2"
        >
          贝塔波
        </button>
        <button 
          onClick={() => testBgMusic('online-ocean', '海浪声')}
          className="bg-teal-500 hover:bg-teal-600 text-white py-1 px-3 rounded mr-2"
        >
          海浪声
        </button>
        <button 
          onClick={stopAllMusic}
          className="bg-yellow-500 hover:bg-yellow-600 text-black py-1 px-3 rounded"
        >
          停止播放
        </button>
      </div>
      <div className="mt-3 space-x-2">
        <button 
          onClick={toggleMute}
          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
        >
          切换静音
        </button>
        <span className="text-sm text-gray-600">
          当前播放: {isPlaying || '无'}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        提示：如果音效无法播放，可能是浏览器的自动播放策略限制。请在页面交互后再次尝试。
      </p>
    </div>
  );
};

export default BgMusicTestComponent;