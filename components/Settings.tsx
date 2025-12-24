import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Headphones, Sun, Moon, FileText, HelpCircle, Bell, Eye, Database, Info, ShieldAlert, Download, RefreshCw, Trash2 } from 'lucide-react';
import { Theme, Settings as SettingsType } from '../types';

interface SettingsProps {
  theme: Theme;
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
  onToggleTheme: () => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, settings, onUpdateSettings, onToggleTheme }) => {
  const isDark = theme === 'dark';
  const isNeomorphic = theme === 'neomorphic';
  
  // 优化拟态风格样式，确保与其他组件风格统一
  const cardBg = isNeomorphic
    ? 'bg-[#e0e5ec] rounded-xl shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] transition-all duration-300 hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)]'
    : isDark
    ? 'bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-lg'
    : 'bg-gradient-to-br from-white to-slate-50 shadow-lg';
  const textMain = isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';
  const textSub = isDark ? 'text-zinc-500' : isNeomorphic ? 'text-zinc-600' : 'text-slate-500';
  
  // State to control project documentation visibility
  const [showDocs, setShowDocs] = useState(false);

  // Simple tooltip component
  const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => (
    <div className="relative group inline-block">
      {children}
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        <div className={`px-3 py-2 rounded-lg shadow-lg text-xs ${isDark ? 'bg-zinc-800 text-white' : 'bg-white text-slate-800'} border ${isDark ? 'border-zinc-700' : 'border-slate-200'}`}>
          {content}
        </div>
        {/* Arrow */}
        <div className={`absolute left-1/2 transform -translate-x-1/2 top-full w-2 h-2 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'} border-t border-l rotate-45`}></div>
      </div>
    </div>
  );

  return (
    <div className={`h-full flex flex-col overflow-hidden`}>


      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Theme Toggle */}
          <div className={`${cardBg} p-4 transition-all duration-300`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {isDark ? <Moon size={20} className="text-blue-400" /> : <Sun size={20} className="text-yellow-500" />}
                <div>
                  <h3 className={`font-bold text-sm ${textMain}`}>主题切换</h3>
                  <p className={`text-[10px] ${textSub}`}>切换深色/浅色主题</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleTheme}
                  className={`p-2 rounded-xl transition-all duration-300 ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  {isDark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-blue-400" />}
                </button>
                <Tooltip content="切换系统主题，适应不同光线环境">
                  <HelpCircle size={16} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Sound Effects */}
          <div className={`${cardBg} p-4 transition-all duration-300`}>
              <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Headphones size={20} className="text-purple-500" />
                <div>
                  <h3 className={`font-bold text-sm ${textMain}`}>音效设置</h3>
                  <p className={`text-[10px] ${textSub}`}>控制系统音效音量与位置音效</p>
                </div>
              </div>
              <Tooltip content="控制系统音效的开启/关闭、音量大小，以及为不同位置设置不同音效">
                <HelpCircle size={16} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
              </Tooltip>
            </div>

            <div className="space-y-3">
              {/* Enable/Disable Sound Effects */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {settings.enableSoundEffects ? <Volume2 size={16} className="text-purple-500" /> : <VolumeX size={16} className="text-zinc-500" />}
                  <span className={`text-sm ${textMain}`}>启用音效</span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ enableSoundEffects: !settings.enableSoundEffects })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.enableSoundEffects ? 'bg-blue-500' : 'bg-white'}` : settings.enableSoundEffects ? 'bg-blue-600' : 'bg-white'}`}
                >
                  <span
                    className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.enableSoundEffects ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              {/* Sound Effects Volume */}
              {settings.enableSoundEffects && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${textMain}`}>音效音量</span>
                    <span className={`text-xs font-mono ${textSub}`}>{Math.round(settings.soundEffectVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.soundEffectVolume}
                    onChange={(e) => onUpdateSettings({ soundEffectVolume: parseFloat(e.target.value) })}
                    className={`w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer ${isDark ? 'bg-zinc-700' : 'bg-slate-200'}`}
                    style={{
                      background: `linear-gradient(to right, #a855f7 ${settings.soundEffectVolume * 100}%, ${isDark ? '#3f3f46' : '#e2e8f0'} ${settings.soundEffectVolume * 100}%)`,
                    }}
                  />
                </div>
              )}

              {/* Location-Based Sound Effects */}
              {settings.enableSoundEffects && (
                <div className="mt-3">
                  <h4 className={`font-bold text-xs ${textMain} mb-2`}>按位置分类音效</h4>
                  <div className={`rounded-xl p-2 h-[250px] overflow-y-auto ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-900/50' : 'bg-slate-50'}`}>
                    <h5 className={`text-[9px] font-mono uppercase mb-2 ${textSub}`}>位置列表</h5>
                    <div className="space-y-2">
                      {[
                        { id: 'battleCompletion', name: '作战完成', icon: <Volume2 size={14} className="text-emerald-500" /> },
                        { id: 'supplyCenter', name: '补给中心', icon: <Volume2 size={14} className="text-yellow-500" /> },
                        { id: 'honorHall', name: '荣耀殿堂', icon: <Volume2 size={14} className="text-purple-500" /> },
                        { id: 'taskComplete', name: '任务完成', icon: <Volume2 size={14} className="text-green-500" /> },
                        { id: 'achievementUnlock', name: '成就解锁', icon: <Volume2 size={14} className="text-blue-500" /> },
                        { id: 'purchase', name: '购买物品', icon: <Volume2 size={14} className="text-red-500" /> },
                        { id: 'pomodoroStart', name: '番茄开始', icon: <Volume2 size={14} className="text-orange-500" /> },
                        { id: 'pomodoroComplete', name: '番茄完成', icon: <Volume2 size={14} className="text-cyan-500" /> },
                        { id: 'taskStart', name: '任务开始', icon: <Volume2 size={14} className="text-pink-500" /> },
                        { id: 'notification', name: '通知提示', icon: <Volume2 size={14} className="text-indigo-500" /> },
                        { id: 'success', name: '成功提示', icon: <Volume2 size={14} className="text-lime-500" /> },
                        { id: 'warning', name: '警告提示', icon: <Volume2 size={14} className="text-amber-500" /> },
                      ].map((location) => {
                        const locationSetting = settings.soundEffectsByLocation?.[location.id] || { enabled: true, sound: 'default' };
                        
                        // Sound URLs mapping
                        const soundUrls = {
                          'default': 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3',
                          'positive-beep': 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3',
                          'success-chime': 'https://assets.mixkit.co/sfx/preview/mixkit-success-fanfare-trumpets-618.mp3',
                          'notification': 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-email-notification-2579.mp3',
                          'click': 'https://assets.mixkit.co/sfx/preview/mixkit-interface-click-1113.mp3',
                          'coin': 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-coin-216.mp3',
                          'level-up': 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-complete-or-approved-mission-205.mp3',
                          'error': 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3',
                          'complete': 'https://assets.mixkit.co/sfx/preview/mixkit-video-game-complete-level-2059.mp3',
                          'notification-2': 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-button-press-2576.mp3',
                        };
                        
                        // Preview sound function
                        const previewSound = (soundId: string) => {
                          // 确保soundId有效
                          const validSoundId = soundUrls[soundId as keyof typeof soundUrls] ? soundId : 'default';
                          const audio = new Audio(soundUrls[validSoundId as keyof typeof soundUrls]);
                          audio.volume = settings.soundEffectVolume;
                          audio.play().catch((error) => {
                            console.log('播放音效失败:', error);
                          });
                        };
                        
                        return (
                          <div 
                            key={location.id} 
                            className={`p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}
                      >
                            <div className="flex items-center gap-1.5">
                              {location.icon}
                              <span className={`text-xs ${textMain}`}>{location.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-1">
                                <select
                                  value={locationSetting.sound}
                                  onChange={(e) => {
                                    const newSoundEffectsByLocation = {
                                      ...settings.soundEffectsByLocation,
                                      [location.id]: { ...locationSetting, sound: e.target.value }
                                    };
                                    onUpdateSettings({ soundEffectsByLocation: newSoundEffectsByLocation });
                                    // Preview the selected sound
                                    previewSound(e.target.value);
                                  }}
                                  className={`w-20 text-[10px] px-2 py-1 rounded-xl border-none outline-none ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-800 text-white' : 'bg-white text-slate-800'}`}
                                >
                                  <option value="default">默认</option>
                                  <option value="positive-beep">积极</option>
                                  <option value="success-chime">成功</option>
                                  <option value="notification">通知</option>
                                  <option value="click">点击</option>
                                  <option value="coin">金币</option>
                                  <option value="level-up">升级</option>
                                  <option value="error">错误</option>
                                  <option value="complete">完成</option>
                                  <option value="notification-2">通知2</option>
                                </select>
                                <button
                                  onClick={() => previewSound(locationSetting.sound)}
                                  className={`p-1 rounded-full transition-all ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)]' : isDark ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-800/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                                  title="试听"
                                >
                                  <Volume2 size={12} />
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  const newSoundEffectsByLocation = {
                                    ...settings.soundEffectsByLocation,
                                    [location.id]: { ...locationSetting, enabled: !locationSetting.enabled }
                                  };
                                  onUpdateSettings({ soundEffectsByLocation: newSoundEffectsByLocation });
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${locationSetting.enabled ? 'bg-blue-500' : 'bg-white'}` : locationSetting.enabled ? 'bg-blue-600' : 'bg-white'}`}
                              >
                                <span
                                  className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${locationSetting.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>



          {/* Background Music */}
          <div className={`${cardBg} p-4 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Music size={24} className="text-green-500" />
                <div>
                  <h3 className={`font-bold ${textMain}`}>背景音乐</h3>
                  <p className={`text-xs ${textSub}`}>控制背景音乐音量</p>
                </div>
              </div>
              <Tooltip content="控制背景音乐的开启/关闭和音量大小，全局播放，切换界面时持续播放">
                <HelpCircle size={18} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
              </Tooltip>
            </div>

            <div className="space-y-4">
              {/* Enable/Disable Background Music */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {settings.enableBgMusic ? <Volume2 size={18} className="text-green-500" /> : <VolumeX size={18} className="text-zinc-500" />}
                  <span className={`${textMain}`}>启用背景音乐</span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ enableBgMusic: !settings.enableBgMusic })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.enableBgMusic ? 'bg-blue-500' : 'bg-white'}` : settings.enableBgMusic ? 'bg-blue-600' : 'bg-white'}`}
                >
                  <span
                    className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.enableBgMusic ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              {/* Background Music Volume */}
              {settings.enableBgMusic && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${textMain}`}>背景音乐音量</span>
                    <span className={`text-sm font-mono ${textSub}`}>{Math.round(settings.bgMusicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.bgMusicVolume}
                    onChange={(e) => onUpdateSettings({ bgMusicVolume: parseFloat(e.target.value) })}
                    className={`w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer ${isDark ? 'bg-zinc-700' : 'bg-slate-200'}`}
                    style={{
                      background: `linear-gradient(to right, #22c55e ${settings.bgMusicVolume * 100}%, ${isDark ? '#3f3f46' : '#e2e8f0'} ${settings.bgMusicVolume * 100}%)`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notification Settings */}
          <div className={`${cardBg} p-4 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
                  <Bell size={20} className="text-blue-500" />
                </div>
                <div>
                  <h3 className={`font-bold ${textMain}`}>通知设置</h3>
                  <p className={`text-xs ${textSub}`}>控制系统通知</p>
                </div>
              </div>
              <Tooltip content="控制系统通知的开启/关闭，包括任务完成、成就解锁和番茄钟完成通知">
                <HelpCircle size={18} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
              </Tooltip>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${textMain}`}>启用通知</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.enableNotifications ? 'bg-blue-500' : 'bg-white'}` : settings.enableNotifications ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ enableNotifications: !settings.enableNotifications })}>
                  <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.enableNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {settings.enableNotifications && (
                <div className="space-y-3 pl-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${textMain}`}>任务完成通知</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.enableTaskCompleteNotifications ? 'bg-blue-500' : 'bg-white'}` : settings.enableTaskCompleteNotifications ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ enableTaskCompleteNotifications: !settings.enableTaskCompleteNotifications })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.enableTaskCompleteNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${textMain}`}>成就解锁通知</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.enableAchievementNotifications ? 'bg-blue-500' : 'bg-white'}` : settings.enableAchievementNotifications ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ enableAchievementNotifications: !settings.enableAchievementNotifications })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.enableAchievementNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${textMain}`}>番茄钟完成通知</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.enablePomodoroNotifications ? 'bg-blue-500' : 'bg-white'}` : settings.enablePomodoroNotifications ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ enablePomodoroNotifications: !settings.enablePomodoroNotifications })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.enablePomodoroNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Display Settings */}
          <div className={`${cardBg} p-4 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
                  <Eye size={20} className="text-blue-500" />
                </div>
                <div>
                  <h3 className={`font-bold ${textMain}`}>显示设置</h3>
                  <p className={`text-xs ${textSub}`}>控制界面显示</p>
                </div>
              </div>
              <Tooltip content="控制界面元素的显示/隐藏，包括经验条、金币数量和任务完成率">
                <HelpCircle size={18} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
              </Tooltip>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${textMain}`}>显示经验条</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showExperienceBar ? 'bg-blue-500' : 'bg-white'}` : settings.showExperienceBar ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showExperienceBar: !settings.showExperienceBar })}>
                  <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.showExperienceBar ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${textMain}`}>显示金币数量</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showBalance ? 'bg-blue-500' : 'bg-white'}` : settings.showBalance ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showBalance: !settings.showBalance })}>
                  <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.showBalance ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${textMain}`}>显示任务完成率</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showTaskCompletionRate ? 'bg-blue-500' : 'bg-white'}` : settings.showTaskCompletionRate ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showTaskCompletionRate: !settings.showTaskCompletionRate })}>
                  <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.showTaskCompletionRate ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className={`${cardBg} p-4 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
                  <Database size={20} className="text-blue-500" />
                </div>
                <div>
                  <h3 className={`font-bold ${textMain}`}>数据管理</h3>
                  <p className={`text-xs ${textSub}`}>备份与恢复数据</p>
                </div>
              </div>
              <Tooltip content="管理游戏数据，包括备份所有数据、从备份恢复数据和重置所有数据">
                <HelpCircle size={18} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
              </Tooltip>
            </div>
            <div className="space-y-3">
              <button className={`w-full px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] text-green-600' : isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-800/50' : 'bg-green-100 text-green-700 hover:bg-green-200'}`} onClick={() => {
                // 备份所有数据
                const allData = {
                  'aes-global-data-v3': localStorage.getItem('aes-global-data-v3'),
                  'life-game-stats-v2': localStorage.getItem('life-game-stats-v2'),
                  'aes-checkin-streak': localStorage.getItem('aes-checkin-streak'),
                  'life-game-weekly-checkin': localStorage.getItem('life-game-weekly-checkin')
                };
                const dataStr = JSON.stringify(allData, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `life-game-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}>
                <Download size={16} />
                备份数据
              </button>
              <button className={`w-full px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] text-blue-600' : isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`} onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e: any) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      try {
                        const data = JSON.parse(e.target?.result as string);
                        // 恢复所有数据
                        if (data['aes-global-data-v3']) localStorage.setItem('aes-global-data-v3', data['aes-global-data-v3']);
                        if (data['life-game-stats-v2']) localStorage.setItem('life-game-stats-v2', data['life-game-stats-v2']);
                        if (data['aes-checkin-streak']) localStorage.setItem('aes-checkin-streak', data['aes-checkin-streak']);
                        if (data['life-game-weekly-checkin']) localStorage.setItem('life-game-weekly-checkin', data['life-game-weekly-checkin']);
                        alert('数据恢复成功，请刷新页面');
                      } catch (error) {
                        alert('数据恢复失败，请检查文件格式');
                      }
                    };
                    reader.readAsText(file);
                  }
                };
                input.click();
              }}>
                <RefreshCw size={16} />
                恢复数据
              </button>
              <button className={`w-full px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] text-red-600' : isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-800/50' : 'bg-red-100 text-red-700 hover:bg-red-200'}`} onClick={() => {
                if (confirm('确定要重置整个系统数据吗？此操作会清空所有数据，包括经验、专注、财富等级、金钱储备和任务数据。')) {
                  // 重置所有数据
                  localStorage.removeItem('aes-global-data-v3');
                  localStorage.removeItem('life-game-stats-v2');
                  localStorage.removeItem('aes-checkin-streak');
                  localStorage.removeItem('life-game-weekly-checkin');
                  alert('系统数据已重置，请刷新页面');
                }
              }}>
                <Trash2 size={16} />
                重置所有数据
              </button>
            </div>
          </div>

          {/* About Section */}
          <div className={`${cardBg} p-4 transition-all duration-300`}>
              <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
                <Info size={20} className="text-blue-500" />
              </div>
              <div>
                <h3 className={`font-bold ${textMain}`}>关于系统</h3>
                <p className={`text-xs ${textSub}`}>人生游戏系统</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className={`${textSub}`}>版本: v1.0.0</div>
              <div className={`${textSub}`}>构建时间: {new Date().toLocaleDateString()}</div>
              <div className={`${textSub}`}>核心功能: 习惯养成、任务管理、成就系统</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;