import React, { useEffect } from 'react';
import soundManager from '../utils/soundManager';

const AudioTestComponent: React.FC = () => {
  useEffect(() => {
    // 初始化音效管理器
    console.log('音效管理器初始化完成');
  }, []);

  const testDiceSound = () => {
    console.log('尝试播放骰子音效...');
    try {
      soundManager.play('dice-fallback');
    } catch (error) {
      console.error('播放骰子音效失败:', error);
    }
  };

  const testCoinSound = () => {
    console.log('尝试播放金币音效...');
    try {
      soundManager.play('coin');
    } catch (error) {
      console.error('播放金币音效失败:', error);
    }
  };

  const testPositiveSound = () => {
    console.log('尝试播放正面反馈音效...');
    try {
      soundManager.play('positive');
    } catch (error) {
      console.error('播放正面反馈音效失败:', error);
    }
  };

  const toggleMute = () => {
    const isMuted = soundManager.toggleMute();
    console.log(isMuted ? '音效已静音' : '音效已取消静音');
  };

  return (
    <div className="audio-test-container p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-2">音效测试面板</h3>
      <div className="space-y-2">
        <button 
          onClick={testDiceSound}
          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded mr-2"
        >
          测试骰子音效
        </button>
        <button 
          onClick={testCoinSound}
          className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded mr-2"
        >
          测试金币音效
        </button>
        <button 
          onClick={testPositiveSound}
          className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 rounded mr-2"
        >
          测试正面音效
        </button>
        <button 
          onClick={toggleMute}
          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
        >
          切换静音
        </button>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        提示：如果音效无法播放，可能是浏览器的自动播放策略限制。请在页面交互后再次尝试。
      </p>
    </div>
  );
};

export default AudioTestComponent;