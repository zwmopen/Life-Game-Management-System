import React, { useState, memo } from 'react';
import { Volume2, VolumeX, Music, Headphones } from 'lucide-react';
import { Theme, Settings } from '../../types';
import { getNeomorphicStyles, getCardBgStyle, getTextStyle } from '../../utils/styleHelpers';
import { GlobalHelpButton, helpContent } from '../HelpSystem';

/**
 * 音效设置组件的属性接口
 */
interface SoundSettingsProps {
  theme: Theme;
  settings: Settings;
  onUpdateSettings: (settings: Partial<Settings>) => void;
}

/**
 * 音效设置组件
 * 用于配置系统音效和背景音乐
 */
const SoundSettings: React.FC<SoundSettingsProps> = memo(({
  theme,
  settings,
  onUpdateSettings
}) => {
  const isDark = theme.includes('dark');
  const isNeomorphic = theme.startsWith('neomorphic');
  const isNeomorphicDark = theme === 'neomorphic-dark';
  const neomorphicStyles = getNeomorphicStyles(isNeomorphicDark);
  const cardBg = getCardBgStyle(isNeomorphic, theme, isDark);
  const textMain = getTextStyle(isDark, isNeomorphic, 'main');
  const textSub = getTextStyle(isDark, isNeomorphic, 'sub');

  const [showSoundSettings, setShowSoundSettings] = useState(true);

  /**
   * 预览音效
   */
  const previewSound = (soundId: string) => {
    const soundUrls: Record<string, string> = {
      taskComplete: '/sounds/task-complete.mp3',
      levelUp: '/sounds/level-up.mp3',
      coin: '/sounds/coin.mp3',
      achievement: '/sounds/achievement.mp3',
      notification: '/sounds/notification.mp3',
      checkIn: '/sounds/check-in.mp3',
      dice: '/sounds/dice.mp3',
      purchase: '/sounds/purchase.mp3',
      pomodoroComplete: '/sounds/pomodoro-complete.mp3',
      breakStart: '/sounds/break-start.mp3'
    };

    const audio = new Audio(soundUrls[soundId] || soundUrls.taskComplete);
    const basePath = '/Life-Game-Management-System';
    audio.src = audio.src.startsWith('http') ? audio.src : `${basePath}${audio.src}`;
    audio.volume = settings.soundVolume ?? 0.5;
    audio.play().catch(console.error);
  };

  /**
   * 获取默认音效映射
   */
  const getDefaultSoundMap = (): Record<string, string> => ({
    mainQuest: 'taskComplete',
    sideQuest: 'taskComplete',
    dailyQuest: 'taskComplete',
    pomodoroComplete: 'pomodoroComplete',
    checkIn: 'checkIn',
    dice: 'dice',
    purchase: 'purchase',
    levelUp: 'levelUp',
    achievement: 'achievement'
  });

  /**
   * 音效选项列表
   */
  const soundOptions = [
    { id: 'taskComplete', name: '任务完成' },
    { id: 'levelUp', name: '升级' },
    { id: 'coin', name: '金币' },
    { id: 'achievement', name: '成就' },
    { id: 'notification', name: '通知' },
    { id: 'checkIn', name: '签到' },
    { id: 'dice', name: '骰子' },
    { id: 'purchase', name: '购买' },
    { id: 'pomodoroComplete', name: '番茄钟完成' },
    { id: 'breakStart', name: '休息开始' }
  ];

  /**
   * 位置列表
   */
  const locations = [
    { id: 'mainQuest', name: '主线任务' },
    { id: 'sideQuest', name: '支线任务' },
    { id: 'dailyQuest', name: '日常任务' },
    { id: 'pomodoroComplete', name: '番茄钟' },
    { id: 'checkIn', name: '签到' },
    { id: 'dice', name: '命运骰子' },
    { id: 'purchase', name: '商店购买' }
  ];

  return (
    <div className={`${cardBg} rounded-xl p-4 mb-4`}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setShowSoundSettings(!showSoundSettings)}
      >
        <div className="flex items-center gap-2">
          {settings.soundEnabled ? (
            <Volume2 className="w-5 h-5 text-green-500" />
          ) : (
            <VolumeX className="w-5 h-5 text-gray-400" />
          )}
          <h3 className={`font-medium ${textMain}`}>音效设置</h3>
        </div>
        <div className="flex items-center gap-2">
          <GlobalHelpButton content={helpContent.sound} />
          <span className={textSub}>{showSoundSettings ? '收起' : '展开'}</span>
        </div>
      </div>

      {showSoundSettings && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className={textMain}>启用音效</span>
            <button
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                settings.soundEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className={textMain}>音量</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={(settings.soundVolume ?? 0.5) * 100}
                onChange={(e) => onUpdateSettings({ soundVolume: Number(e.target.value) / 100 })}
                className="w-24"
              />
              <span className={textSub}>{Math.round((settings.soundVolume ?? 0.5) * 100)}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className={textMain}>背景音乐</span>
            <button
              onClick={() => onUpdateSettings({ bgMusicEnabled: !settings.bgMusicEnabled })}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                settings.bgMusicEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                  settings.bgMusicEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div>
            <h4 className={`text-sm font-medium ${textMain} mb-2`}>各位置音效配置</h4>
            <div className="space-y-2">
              {locations.map(location => {
                const defaultSoundMap = getDefaultSoundMap();
                const locationSetting = settings.soundEffectsByLocation?.[location.id] || { 
                  enabled: true, 
                  sound: defaultSoundMap[location.id] || 'taskComplete' 
                };
                const currentSound = locationSetting.sound === 'default' 
                  ? defaultSoundMap[location.id] || 'taskComplete' 
                  : locationSetting.sound;

                return (
                  <div key={location.id} className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm ${textMain}`}>{location.name}</span>
                      <button
                        onClick={() => previewSound(currentSound)}
                        className={`p-1 rounded ${
                          isNeomorphic ? neomorphicStyles.button : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </div>
                    <select
                      value={currentSound}
                      onChange={(e) => {
                        const newSoundEffectsByLocation = {
                          ...settings.soundEffectsByLocation,
                          [location.id]: {
                            enabled: true,
                            sound: e.target.value
                          }
                        };
                        onUpdateSettings({ soundEffectsByLocation: newSoundEffectsByLocation });
                      }}
                      className={`w-full text-sm px-2 py-1 rounded border ${
                        isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      {soundOptions.map(sound => (
                        <option key={sound.id} value={sound.id}>{sound.name}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

SoundSettings.displayName = 'SoundSettings';

export default SoundSettings;
