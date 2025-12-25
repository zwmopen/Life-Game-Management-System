import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Headphones, Sun, Moon, Zap, FileText, HelpCircle, Bell, Eye, Database, Info, ShieldAlert, Download, RefreshCw, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Theme, Settings as SettingsType } from '../types';
import { GlobalGuideCard, HelpTooltip, helpContent } from './HelpSystem';

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
  // State to control display settings collapse/expand
  const [showDisplaySettings, setShowDisplaySettings] = useState(true);
  // State to control help modal
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  // State to control guide card settings collapse/expand
  const [showGuideCardSettings, setShowGuideCardSettings] = useState(true);



  return (
    <div className={`h-full flex flex-col overflow-hidden`}>
      {/* Global Guide Card - 使用统一的帮助系统组件 */}
      <GlobalGuideCard
        activeHelp={activeHelp}
        helpContent={helpContent}
        onClose={() => setActiveHelp(null)}
        cardBg={cardBg}
        textMain={textMain}
        textSub={textSub}
        config={settings.guideCardConfig}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Theme Toggle */}
          <div className={`${cardBg} p-4 transition-all duration-300`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {isNeomorphic ? <Zap size={20} className="text-yellow-500" /> : isDark ? <Moon size={20} className="text-blue-400" /> : <Sun size={20} className="text-yellow-500" />}
                <div>
                  <h3 className={`font-bold text-sm ${textMain}`}>主题切换</h3>
                  <p className={`text-[10px] ${textSub}`}>切换浅色/深色/拟态主题</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleTheme}
                  className={`p-2 rounded-xl transition-all duration-300 ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  {isNeomorphic ? <Zap size={18} className="text-yellow-500" /> : isDark ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-yellow-500" />}
                </button>
                <HelpTooltip helpId="theme" onHelpClick={setActiveHelp}>
                    <HelpCircle size={16} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
                  </HelpTooltip>
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
              <HelpTooltip helpId="sound" onHelpClick={setActiveHelp}>
                  <HelpCircle size={16} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
                </HelpTooltip>
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
                    className={`w-full h-1.5 rounded-full appearance-none cursor-pointer shadow-inner ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}
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
                  <div className={`rounded-xl p-2 h-[250px] overflow-y-auto ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-900/50' : 'bg-slate-50'}`}>
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
                        // 如果没有设置音效或设置的是默认值，使用 positive-beep 作为默认值
                        const locationSetting = settings.soundEffectsByLocation?.[location.id] || { enabled: true, sound: 'positive-beep' };
                        // 如果当前音效是默认值，将其转换为 positive-beep
                        const currentSound = locationSetting.sound === 'default' ? 'positive-beep' : locationSetting.sound;
                        
                        // Sound URLs mapping - first option is mute, no default
                        const soundUrls = {
                          'mute': '', // 静音选项
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
                          // 跳过静音选项
                          if (soundId === 'mute') return;
                          
                          const validSoundId = soundUrls[soundId as keyof typeof soundUrls] ? soundId : 'positive-beep';
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
                                  value={currentSound}
                                  onChange={(e) => {
                                    const newSoundEffectsByLocation = {
                                      ...settings.soundEffectsByLocation,
                                      [location.id]: { ...locationSetting, sound: e.target.value }
                                    };
                                    onUpdateSettings({ soundEffectsByLocation: newSoundEffectsByLocation });
                                    // Preview the selected sound immediately
                                    previewSound(e.target.value);
                                  }}
                                  className={`w-20 text-[10px] px-2 py-1 rounded-xl border-none outline-none ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-800 text-white' : 'bg-white text-slate-800'}`}
                                >
                                  <option value="mute">静音</option>
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
                                  onClick={() => previewSound(currentSound)}
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
              <div className="flex items-center gap-2">
                <HelpTooltip helpId="display" onHelpClick={setActiveHelp}>
                  <HelpCircle size={18} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
                </HelpTooltip>
                {/* Collapse/Expand Button */}
                <button
                  onClick={() => setShowDisplaySettings(!showDisplaySettings)}
                  className={`p-2 rounded-xl transition-all duration-300 bg-transparent hover:bg-transparent shadow-none active:shadow-none`}
                  title={showDisplaySettings ? '折叠' : '展开'}
                >
                  <span className={`text-xs ${textMain} transform transition-transform ${showDisplaySettings ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
              </div>
            </div>
            {/* Conditionally render display settings based on collapse state */}
            {showDisplaySettings && (
              <div className={`rounded-xl p-3 h-[250px] overflow-y-auto ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-900/50' : 'bg-slate-50'}`}>
                <h5 className={`text-[9px] font-mono uppercase mb-2 ${textSub}`}>显示选项</h5>
                <div className="space-y-3">
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示角色系统</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showCharacterSystem ? 'bg-blue-500' : 'bg-white'}` : settings.showCharacterSystem ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showCharacterSystem: !settings.showCharacterSystem })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.showCharacterSystem ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示番茄系统</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showPomodoroSystem ? 'bg-blue-500' : 'bg-white'}` : settings.showPomodoroSystem ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showPomodoroSystem: !settings.showPomodoroSystem })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.showPomodoroSystem ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示专注时间系统</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showFocusTimeSystem ? 'bg-blue-500' : 'bg-white'}` : settings.showFocusTimeSystem ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showFocusTimeSystem: !settings.showFocusTimeSystem })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.showFocusTimeSystem ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示签到系统</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showCheckinSystem ? 'bg-blue-500' : 'bg-white'}` : settings.showCheckinSystem ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showCheckinSystem: !settings.showCheckinSystem })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.showCheckinSystem ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示成就收集率</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showAchievementCollectionRate ? 'bg-blue-500' : 'bg-white'}` : settings.showAchievementCollectionRate ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showAchievementCollectionRate: !settings.showAchievementCollectionRate })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.showAchievementCollectionRate ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示系统稳定性模块</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showSystemStabilityModule ? 'bg-blue-500' : 'bg-white'}` : settings.showSystemStabilityModule ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showSystemStabilityModule: !settings.showSystemStabilityModule })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.showSystemStabilityModule ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示最新勋章</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showLatestBadges ? 'bg-blue-500' : 'bg-white'}` : settings.showLatestBadges ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showLatestBadges: !settings.showLatestBadges })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.showLatestBadges ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示图表汇总</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showChartSummary ? 'bg-blue-500' : 'bg-white'}` : settings.showChartSummary ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showChartSummary: !settings.showChartSummary })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.showChartSummary ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示补给黑市</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showSupplyMarket ? 'bg-blue-500' : 'bg-white'}` : settings.showSupplyMarket ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showSupplyMarket: !settings.showSupplyMarket })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.showSupplyMarket ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 指南卡片管理 */}
          <div className={`${cardBg} p-4 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
                  <HelpCircle size={20} className="text-blue-500" />
                </div>
                <div>
                  <h3 className={`font-bold ${textMain}`}>指南卡片管理</h3>
                  <p className={`text-xs ${textSub}`}>统一配置所有模块的行动指南卡片</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HelpTooltip helpId="settings" onHelpClick={setActiveHelp}>
                  <HelpCircle size={18} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
                </HelpTooltip>
                {/* Collapse/Expand Button */}
                <button
                  onClick={() => setShowGuideCardSettings(!showGuideCardSettings)}
                  className={`p-2 rounded-xl transition-all duration-300 bg-transparent hover:bg-transparent shadow-none active:shadow-none`}
                  title={showGuideCardSettings ? '折叠' : '展开'}
                >
                  <span className={`text-xs ${textMain} transform transition-transform ${showGuideCardSettings ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
              </div>
            </div>
            
            {/* Conditionally render guide card settings based on collapse state */}
            {showGuideCardSettings && (
              <div className={`rounded-xl p-3 overflow-y-auto ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-900/50' : 'bg-slate-50'}`}>
                <div className="space-y-4">
                  {/* 字体大小设置 */}
                  <div className="space-y-2">
                    <h4 className={`text-sm font-semibold ${textMain}`}>字体大小</h4>
                    <div className="flex gap-2">
                      {[
                        { value: 'small', label: '小' },
                        { value: 'medium', label: '中' },
                        { value: 'large', label: '大' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => onUpdateSettings({ 
                            guideCardConfig: { 
                              ...settings.guideCardConfig, 
                              fontSize: option.value as 'small' | 'medium' | 'large' 
                            } 
                          })} 
                          className={`flex-1 py-2 px-4 rounded-xl transition-all duration-300 text-center ${isNeomorphic ? `bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] ${settings.guideCardConfig.fontSize === option.value ? 'bg-blue-500 text-white' : ''}` : isDark ? `bg-zinc-800 hover:bg-zinc-700 ${settings.guideCardConfig.fontSize === option.value ? 'bg-blue-600 text-white' : ''}` : `bg-slate-100 hover:bg-slate-200 ${settings.guideCardConfig.fontSize === option.value ? 'bg-blue-500 text-white' : ''}`}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 圆角大小设置 */}
                  <div className="space-y-2">
                    <h4 className={`text-sm font-semibold ${textMain}`}>圆角大小</h4>
                    <div className="flex gap-2">
                      {[
                        { value: 'small', label: '小' },
                        { value: 'medium', label: '中' },
                        { value: 'large', label: '大' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => onUpdateSettings({ 
                            guideCardConfig: { 
                              ...settings.guideCardConfig, 
                              borderRadius: option.value as 'small' | 'medium' | 'large' 
                            } 
                          })} 
                          className={`flex-1 py-2 px-4 rounded-xl transition-all duration-300 text-center ${isNeomorphic ? `bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] ${settings.guideCardConfig.borderRadius === option.value ? 'bg-blue-500 text-white' : ''}` : isDark ? `bg-zinc-800 hover:bg-zinc-700 ${settings.guideCardConfig.borderRadius === option.value ? 'bg-blue-600 text-white' : ''}` : `bg-slate-100 hover:bg-slate-200 ${settings.guideCardConfig.borderRadius === option.value ? 'bg-blue-500 text-white' : ''}`}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 阴影强度设置 */}
                  <div className="space-y-2">
                    <h4 className={`text-sm font-semibold ${textMain}`}>阴影强度</h4>
                    <div className="flex gap-2">
                      {[
                        { value: 'light', label: '轻' },
                        { value: 'medium', label: '中' },
                        { value: 'strong', label: '强' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => onUpdateSettings({ 
                            guideCardConfig: { 
                              ...settings.guideCardConfig, 
                              shadowIntensity: option.value as 'light' | 'medium' | 'strong' 
                            } 
                          })} 
                          className={`flex-1 py-2 px-4 rounded-xl transition-all duration-300 text-center ${isNeomorphic ? `bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] ${settings.guideCardConfig.shadowIntensity === option.value ? 'bg-blue-500 text-white' : ''}` : isDark ? `bg-zinc-800 hover:bg-zinc-700 ${settings.guideCardConfig.shadowIntensity === option.value ? 'bg-blue-600 text-white' : ''}` : `bg-slate-100 hover:bg-slate-200 ${settings.guideCardConfig.shadowIntensity === option.value ? 'bg-blue-500 text-white' : ''}`}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 显示底层原理板块设置 */}
                  <div className="flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}">
                    <span className={`text-sm ${textMain}`}>显示底层原理板块</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.guideCardConfig.showUnderlyingPrinciple ? 'bg-blue-500' : 'bg-white'}` : settings.guideCardConfig.showUnderlyingPrinciple ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ 
                      guideCardConfig: { 
                        ...settings.guideCardConfig, 
                        showUnderlyingPrinciple: !settings.guideCardConfig.showUnderlyingPrinciple 
                      } 
                    })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.guideCardConfig.showUnderlyingPrinciple ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  
                  {/* 一键同步按钮 */}
                  <button className={`w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] text-blue-600 font-bold' : isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`} onClick={() => {
                    // 这里可以添加同步逻辑，当前设计中设置会实时生效
                    alert('所有指南卡片已同步更新！');
                  }}>
                    <RefreshCw size={18} />
                    同步所有指南卡片
                  </button>
                </div>
              </div>
            )}
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
              <HelpTooltip helpId="data" onHelpClick={setActiveHelp}>
                  <HelpCircle size={18} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
                </HelpTooltip>
            </div>
            {/* 凸起框设计 - 添加点击效果 */}
            <div className={`${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] transition-all duration-300 hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] cursor-pointer' : isDark ? 'bg-zinc-900/50 hover:bg-zinc-800/70 cursor-pointer' : 'bg-slate-100 hover:bg-slate-200 cursor-pointer'} p-5 rounded-xl`}>
              <div className="flex flex-col md:flex-row gap-3">
                <button className={`flex-1 px-4 py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] text-green-600 font-bold' : isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-800/50' : 'bg-green-100 text-green-700 hover:bg-green-200'}`} onClick={() => {
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
                  <Download size={18} />
                  备份数据
                </button>
                <button className={`flex-1 px-4 py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] text-blue-600 font-bold' : isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`} onClick={() => {
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
                  <RefreshCw size={18} />
                  恢复数据
                </button>
                <button className={`flex-1 px-4 py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] text-red-600 font-bold' : isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-800/50' : 'bg-red-100 text-red-700 hover:bg-red-200'}`} onClick={() => {
                  if (confirm('确定要重置整个系统数据吗？此操作会清空所有数据，包括经验、专注、财富等级、金钱储备和任务数据。')) {
                    // 重置所有数据
                    localStorage.removeItem('aes-global-data-v3');
                    localStorage.removeItem('life-game-stats-v2');
                    localStorage.removeItem('aes-checkin-streak');
                    localStorage.removeItem('life-game-weekly-checkin');
                    alert('系统数据已重置，请刷新页面');
                  }
                }}>
                  <Trash2 size={18} />
                  重置数据
                </button>
              </div>
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
            {/* 凸起框设计 - 添加完整点击效果 */}
            <div className={`${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] transition-all duration-300 hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] cursor-pointer' : isDark ? 'bg-zinc-900/50 hover:bg-zinc-800/70 cursor-pointer shadow-lg hover:shadow-xl active:shadow-inner' : 'bg-slate-100 hover:bg-slate-200 cursor-pointer shadow-md hover:shadow-lg active:shadow-inner'} p-5 rounded-xl transition-all duration-300`}>
              <div className="space-y-3 text-sm">
                <div className={`${textSub}`}>版本: v4.5.0</div>
                <div className={`${textSub}`}>构建时间: {new Date().toLocaleDateString()}</div>
                <div>
                  <h4 className={`font-bold ${textMain} text-xs mb-2`}>核心功能</h4>
                  <ul className={`space-y-1.5 ${textSub} text-[10px]`}>
                    <li>• 习惯养成：通过签到系统和番茄钟培养良好习惯</li>
                    <li>• 任务管理：主线任务与支线任务结合，提供清晰的成长路径</li>
                    <li>• 成就系统：丰富的勋章和成就，激励持续进步</li>
                    <li>• 角色成长：经验值、专注度、财富等级三维成长体系</li>
                    <li>• 数据可视化：多维度图表展示，直观了解成长轨迹</li>
                    <li>• 音效系统：支持多场景音效自定义，提升沉浸式体验</li>
                    <li>• 主题切换：支持浅色、深色、拟态三种主题，适应不同使用场景</li>
                    <li>• 数据管理：完整的数据备份、恢复和重置功能，保障数据安全</li>
                  </ul>
                </div>
                <div className={`${textSub}`}>开发者: 大胆走夜路</div>
                <div className={`${textSub}`}>联系微信: zwmrpg</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;