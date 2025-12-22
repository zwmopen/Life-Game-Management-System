import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Headphones, Sun, Moon, FileText, HelpCircle, Bell, Eye, Database, Shield, Info, Activity } from 'lucide-react';
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
  const cardBg = isNeomorphic 
      ? 'bg-[#e0e5ec] border-[#a3b1c6] rounded-[32px] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] transition-all duration-200 active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)]' 
      : isDark 
      ? 'bg-zinc-900 border-zinc-800' 
      : 'bg-white border-slate-200';
  const textMain = isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';
  const textSub = isDark ? 'text-zinc-500' : isNeomorphic ? 'text-zinc-600' : 'text-slate-500';
  
  // State to control project documentation visibility
  const [showDocs, setShowDocs] = useState(false);
  // State to control nutcloud settings visibility
  const [showNutcloudSettings, setShowNutcloudSettings] = useState(false);

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
    <div className={`h-full flex flex-col overflow-hidden ${isDark ? 'bg-zinc-950' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className="shrink-0 border-b border-zinc-800 p-3">
        <h1 className={`text-2xl font-black ${textMain}`}>设置中心</h1>
        <p className={`text-xs font-mono mt-1 ${textSub}`}>
          系统配置 // 音效控制 // 主题切换
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-1">
          {/* Theme Toggle */}
          <div className={`rounded-lg border p-3 ${cardBg}`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {theme === 'dark' && <Moon size={20} className="text-blue-400" />}
                {theme === 'light' && <Sun size={20} className="text-yellow-500" />}
                {theme === 'neomorphic' && <Activity size={20} className="text-zinc-600" />}
                <div>
                  <h3 className={`font-bold text-sm ${textMain}`}>主题切换</h3>
                  <p className={`text-[10px] ${textSub}`}>切换深色/浅色/拟态主题</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip content="切换系统主题，适应不同光线环境">
                  <HelpCircle size={16} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
                </Tooltip>
                <button
                  onClick={onToggleTheme}
                  className={`p-2 rounded-lg transition-all duration-300 
                      ${theme === 'neomorphic' 
                          ? 'bg-[#e0e5ec] border-[#a3b1c6] text-zinc-700 shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)]' 
                          : isDark 
                          ? 'bg-zinc-800 hover:bg-zinc-700' 
                          : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  {theme === 'dark' && <Sun size={18} className="text-yellow-500" />}
                  {theme === 'light' && <Activity size={18} className="text-zinc-600" />}
                  {theme === 'neomorphic' && <Moon size={18} className="text-blue-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Sound Effects */}
          <div className={`rounded-lg border p-3 ${cardBg}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Headphones size={20} className="text-purple-500" />
                <div>
                  <h3 className={`font-bold text-sm ${textMain}`}>音效设置</h3>
                  <p className={`text-[10px] ${textSub}`}>控制系统音效音量与位置音效</p>
                </div>
              </div>
              <Tooltip content="控制游戏中各种音效的播放和音量">
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
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-300 ${settings.enableSoundEffects ? (isNeomorphic ? 'bg-purple-600 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.3)]' : 'bg-purple-600') : (isNeomorphic ? 'bg-[#e0e5ec] border-[#a3b1c6] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]' : 'bg-zinc-600')}`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform duration-300 ${settings.enableSoundEffects ? (isNeomorphic ? 'translate-x-5 bg-white shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)]' : 'translate-x-5 bg-white') : (isNeomorphic ? 'translate-x-0.5 bg-zinc-300 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)]' : 'translate-x-1 bg-white')}`}
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
                    className={`w-full h-3 bg-zinc-700 rounded-lg appearance-none cursor-pointer transition-all duration-300 ${isDark ? 'bg-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] border-[#a3b1c6] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-slate-200'}`}
                    style={{
                      background: `linear-gradient(to right, #a855f7 ${settings.soundEffectVolume * 100}%, ${isNeomorphic ? '#e0e5ec' : (isDark ? '#3f3f46' : '#e2e8f0')} ${settings.soundEffectVolume * 100}%)`,
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.style.background = `linear-gradient(to right, #a855f7 ${target.valueAsNumber * 100}%, ${isNeomorphic ? '#e0e5ec' : (isDark ? '#3f3f46' : '#e2e8f0')} ${target.valueAsNumber * 100}%)`;
                    }}
                  />
                </div>
              )}

              {/* Location-Based Sound Effects */}
              {settings.enableSoundEffects && (
                <div className="mt-3">
                  <h4 className={`font-bold text-xs ${textMain} mb-2`}>按位置分类音效</h4>
                  <div className={`border rounded-lg p-2 h-[250px] overflow-y-auto ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h5 className={`text-[9px] font-mono uppercase mb-2 ${textSub}`}>位置列表</h5>
                    <div className="space-y-1">
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
                          const audio = new Audio(soundUrls[soundId as keyof typeof soundUrls]);
                          audio.volume = settings.soundEffectVolume;
                          audio.play().catch(() => {});
                        };
                        
                        return (
                          <div 
                            key={location.id} 
                            className={`p-2 rounded-lg border flex items-center justify-between transition-all cursor-pointer hover:border-purple-500/50 ${isDark ? 'bg-zinc-900/30 border-zinc-800 hover:bg-zinc-800/50' : isNeomorphic ? 'bg-[#e0e5ec] border-[#a3b1c6] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]' : 'bg-white/50 border-slate-200 hover:bg-slate-100'}`}
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
                                  className={`w-20 text-[10px] px-2 py-1 rounded-lg transition-all duration-300 cursor-pointer focus:outline-none ${isDark ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] border-[#a3b1c6] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] text-zinc-700 hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'}`}
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
                                  className={`p-1.5 rounded-lg transition-all duration-300 cursor-pointer ${isDark ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-800/50' : isNeomorphic ? 'bg-[#e0e5ec] border-[#a3b1c6] text-purple-600 shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                                  title="试听"
                                >
                                  <Volume2 size={14} />
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
                                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${locationSetting.enabled ? 'bg-blue-600' : 'bg-zinc-600'}`}
                              >
                                <span
                                  className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${locationSetting.enabled ? 'translate-x-4' : 'translate-x-1'}`}
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
          <div className={`rounded-lg border p-3 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music size={20} className="text-green-500" />
                <div>
                  <h3 className={`font-bold text-sm ${textMain}`}>背景音乐</h3>
                  <p className={`text-[10px] ${textSub}`}>控制背景音乐音量</p>
                </div>
              </div>
              <Tooltip content="控制游戏背景音乐的播放和音量">
                <HelpCircle size={16} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${settings.enableBgMusic ? (isNeomorphic ? 'bg-green-600 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.3)]' : 'bg-green-600') : (isNeomorphic ? 'bg-[#e0e5ec] border-[#a3b1c6] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]' : 'bg-zinc-600')}`}
                >
                  <span
                    className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform duration-300 ${settings.enableBgMusic ? (isNeomorphic ? 'translate-x-6 bg-white shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)]' : 'translate-x-6 bg-white') : (isNeomorphic ? 'translate-x-1 bg-zinc-300 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)]' : 'translate-x-1 bg-white')}`}
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
                    className={`w-full h-3 bg-zinc-700 rounded-lg appearance-none cursor-pointer transition-all duration-300 ${isDark ? 'bg-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] border-[#a3b1c6] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-slate-200'}`}
                    style={{
                      background: `linear-gradient(to right, #22c55e ${settings.bgMusicVolume * 100}%, ${isNeomorphic ? '#e0e5ec' : (isDark ? '#3f3f46' : '#e2e8f0')} ${settings.bgMusicVolume * 100}%)`,
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.style.background = `linear-gradient(to right, #22c55e ${target.valueAsNumber * 100}%, ${isNeomorphic ? '#e0e5ec' : (isDark ? '#3f3f46' : '#e2e8f0')} ${target.valueAsNumber * 100}%)`;
                    }}
                  />
                </div>
              )}
            </div>
          </div>



          {/* Data Management */}
          <div className={`rounded-lg border p-3 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={20} className="text-orange-500" />
                <div>
                  <h3 className={`font-bold text-sm ${textMain}`}>数据管理</h3>
                  <p className={`text-[10px] ${textSub}`}>备份与恢复数据</p>
                </div>
              </div>
              <Tooltip content="管理游戏数据，包括备份、恢复和重置">
                <HelpCircle size={16} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
              </Tooltip>
            </div>
            <div className="space-y-4">
              {/* Backup Section */}
              <div className="space-y-2">
                <h4 className={`text-xs font-bold ${textMain}`}>手动备份</h4>
                <div className="grid grid-cols-1 gap-2">
                  {/* Local Backup */}
                  <button className={`w-full px-4 py-3 rounded-lg transition-all duration-300 font-medium ${isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-800/50' : isNeomorphic ? 'bg-[#e0e5ec] border-[#a3b1c6] text-green-600 shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)]' : 'bg-green-100 text-green-700 hover:bg-green-200'}`} onClick={() => {
                    const data = localStorage.getItem('aes-global-data-v3');
                    if (data) {
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `life-game-backup-${new Date().toISOString().split('T')[0]}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }
                  }}>
                    本地备份
                  </button>
                  
                  {/* Online Backup (Nutcloud) */}
                  <button className={`w-full px-4 py-3 rounded-lg transition-all duration-300 font-medium ${isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50' : isNeomorphic ? 'bg-[#e0e5ec] border-[#a3b1c6] text-blue-600 shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)]' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`} onClick={async () => {
                    const data = localStorage.getItem('aes-global-data-v3');
                    if (data) {
                      // Check if Nutcloud WebDAV credentials are configured
                      if (settings.nutcloudWebDAV?.server && settings.nutcloudWebDAV?.username && settings.nutcloudWebDAV?.password) {
                        try {
                          // Ensure server URL ends with a slash
                          const serverUrl = settings.nutcloudWebDAV.server.endsWith('/') ? settings.nutcloudWebDAV.server : `${settings.nutcloudWebDAV.server}/`;
                          const filename = `life-game-backup-${new Date().toISOString().split('T')[0]}.json`;
                          const url = `${serverUrl}${filename}`;
                          
                          // Send WebDAV PUT request to upload the file
                          const response = await fetch(url, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Basic ${btoa(`${settings.nutcloudWebDAV.username}:${settings.nutcloudWebDAV.password}`)}`
                            },
                            body: data
                          });
                          
                          if (response.ok) {
                            alert('备份成功上传到坚果云');
                          } else {
                            // Get more detailed error message
                            const errorText = await response.text();
                            console.error('Backup failed response:', response.status, response.statusText, errorText);
                            alert(`备份失败: ${response.status} ${response.statusText}\n\n可能的原因：\n1. WebDAV服务器地址格式不正确（确保以/结尾）\n2. 坚果云账号或密码错误\n3. 网络连接问题\n4. 跨域限制（尝试使用其他浏览器或方式）`);
                          }
                        } catch (error) {
                          console.error('Backup error:', error);
                          const errorMessage = error instanceof Error ? error.message : String(error);
                          alert(`备份失败：${errorMessage}\n\n可能的原因：\n1. WebDAV服务器地址格式不正确\n2. 坚果云账号或密码错误\n3. 网络连接问题\n4. 浏览器跨域限制\n\n详细错误：${errorMessage}`);
                        }
                      } else {
                        alert('请先在坚果云WebDAV配置中填写完整的服务器地址、账号和密码');
                      }
                    }
                  }}>
                    在线备份（坚果云）
                  </button>
                </div>
                
                {/* Nutcloud Settings (Collapsible) */}
                <div className="space-y-2">
                  <button 
                    onClick={() => setShowNutcloudSettings(!showNutcloudSettings)}
                    className={`w-full px-4 py-3 rounded-lg transition-all duration-300 text-left font-medium ${isDark ? 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800' : isNeomorphic ? 'bg-[#e0e5ec] border-[#a3b1c6] text-zinc-700 shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span>坚果云WebDAV配置</span>
                      <span className={`text-xs ${textSub}`}>
                        {showNutcloudSettings ? '收起' : '展开'}
                      </span>
                    </div>
                  </button>
                  
                  {showNutcloudSettings && (
                    <div className={`p-3 rounded-lg border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200'}`}>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className={`text-xs ${textMain}`}>WebDAV服务器地址</label>
                          <input
                            type="text"
                            placeholder="https://dav.jianguoyun.com/dav/"
                            value={settings.nutcloudWebDAV?.server || ''}
                            onChange={(e) => onUpdateSettings({ 
                              nutcloudWebDAV: { 
                                server: e.target.value, 
                                username: settings.nutcloudWebDAV?.username || '', 
                                password: settings.nutcloudWebDAV?.password || '' 
                              } 
                            })}
                            className={`w-full text-sm px-3 py-2 rounded border outline-none ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={`text-xs ${textMain}`}>坚果云账号</label>
                          <input
                            type="text"
                            placeholder="输入坚果云账号（邮箱）"
                            value={settings.nutcloudWebDAV?.username || ''}
                            onChange={(e) => onUpdateSettings({ 
                              nutcloudWebDAV: { 
                                server: settings.nutcloudWebDAV?.server || '', 
                                username: e.target.value, 
                                password: settings.nutcloudWebDAV?.password || '' 
                              } 
                            })}
                            className={`w-full text-sm px-3 py-2 rounded border outline-none ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={`text-xs ${textMain}`}>WebDAV密码</label>
                          <input
                            type="password"
                            placeholder="输入坚果云WebDAV密码"
                            value={settings.nutcloudWebDAV?.password || ''}
                            onChange={(e) => onUpdateSettings({ 
                              nutcloudWebDAV: { 
                                server: settings.nutcloudWebDAV?.server || '', 
                                username: settings.nutcloudWebDAV?.username || '', 
                                password: e.target.value 
                              } 
                            })}
                            className={`w-full text-sm px-3 py-2 rounded border outline-none ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                          />
                        </div>
                        <div className={`text-[10px] ${textSub}`}>
                          WebDAV密码可在坚果云设置中生成，<a href="https://www.jianguoyun.com/d/client/settings/security" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">点击获取WebDAV密码</a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Restore Section */}
              <div className="space-y-2">
                <h4 className={`text-xs font-bold ${textMain}`}>恢复选项</h4>
                <button className={`w-full px-4 py-3 rounded-lg transition-all duration-300 font-medium ${isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50' : isNeomorphic ? 'bg-[#e0e5ec] border-[#a3b1c6] text-blue-600 shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)]' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`} onClick={() => {
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
                          localStorage.setItem('aes-global-data-v3', JSON.stringify(data));
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
                  恢复数据
                </button>
              </div>
              
              {/* Auto Backup Settings */}
              <div className="space-y-2">
                <h4 className={`text-xs font-bold ${textMain}`}>自动备份设置</h4>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${textMain}`}>自动备份频率</span>
                  <select
                    value={settings.autoBackupFrequency || 'none'}
                    onChange={(e) => onUpdateSettings({ autoBackupFrequency: e.target.value as 'none' | 'daily' | 'weekly' | 'monthly' })}
                    className={`text-sm px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer focus:outline-none ${isDark ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] border-[#a3b1c6] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] text-zinc-700 hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'}`}
                  >
                    <option value="none">不自动备份</option>
                    <option value="daily">每天备份</option>
                    <option value="weekly">每周备份</option>
                    <option value="monthly">每月备份</option>
                  </select>
                </div>
                <div className={`text-[10px] ${textSub}`}>
                  自动备份将使用在线备份（坚果云）存储数据，不会占用本地空间
                </div>
              </div>
              
              {/* Reset Section */}
              <div className="space-y-2">
                <h4 className={`text-xs font-bold ${textMain}`}>数据重置</h4>
                <button className={`w-full px-4 py-3 rounded-lg transition-all duration-300 font-medium ${isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-800/50' : isNeomorphic ? 'bg-[#e0e5ec] border-[#a3b1c6] text-red-600 shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)]' : 'bg-red-100 text-red-700 hover:bg-red-200'}`} onClick={() => {
                  if (confirm('确定要重置所有数据吗？此操作不可恢复')) {
                    localStorage.clear();
                    alert('数据已重置，请刷新页面');
                  }
                }}>
                  重置数据
                </button>
              </div>
            </div>
          </div>

          {/* Removed Privacy Settings - Not needed for personal use */}

          {/* About Section */}
          <div className={`rounded-lg border p-3 ${cardBg}`}>
            <div className="flex items-center gap-2">
              <Info size={20} className="text-blue-500" />
              <div>
                <h3 className={`font-bold text-sm ${textMain}`}>关于系统</h3>
                <p className={`text-[10px] ${textSub}`}>人生游戏系统</p>
              </div>
            </div>
            <div className="space-y-2 text-xs mt-2">
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