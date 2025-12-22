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
      ? 'bg-zinc-200 border-zinc-300 shadow-[10px_10px_20px_rgba(0,0,0,0.1),-10px_-10px_20px_rgba(255,255,255,0.8)] hover:shadow-[15px_15px_30px_rgba(0,0,0,0.15),-15px_-15px_30px_rgba(255,255,255,0.9)] transition-all duration-300' 
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
                  className={`p-1.5 rounded-full transition-all duration-300 
                      ${theme === 'neomorphic' 
                          ? 'bg-zinc-300 text-zinc-700 shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.7),inset_3px_3px_6px_rgba(0,0,0,0.1)]' 
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
          <div className={`rounded-lg border shadow-sm p-3 ${cardBg}`}>
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
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${settings.enableSoundEffects ? 'bg-purple-600' : 'bg-zinc-600'}`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.enableSoundEffects ? 'translate-x-5' : 'translate-x-1'}`}
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
                            className={`p-2 rounded-lg border flex items-center justify-between transition-all cursor-pointer hover:border-purple-500/50 ${isDark ? 'bg-zinc-900/30 border-zinc-800 hover:bg-zinc-800/50' : 'bg-white/50 border-slate-200 hover:bg-slate-100'}`}
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
                                  className={`w-20 text-[10px] px-1 py-0.5 rounded ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
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
                                  className={`p-0.5 text-[10px] rounded ${isDark ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-800/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
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
          <div className={`rounded-lg border shadow-sm p-3 ${cardBg}`}>
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enableBgMusic ? 'bg-green-600' : 'bg-zinc-600'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableBgMusic ? 'translate-x-6' : 'translate-x-1'}`}
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
          <div className={`rounded-lg border shadow-sm p-3 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-blue-500" />
                <div>
                  <h3 className={`font-bold text-sm ${textMain}`}>通知设置</h3>
                  <p className={`text-[10px] ${textSub}`}>控制系统通知</p>
                </div>
              </div>
              <Tooltip content="控制游戏中各种通知的开关">
                <HelpCircle size={16} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
              </Tooltip>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${textMain}`}>启用通知</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enableNotifications ? 'bg-blue-600' : 'bg-zinc-600'}`} onClick={() => onUpdateSettings({ enableNotifications: !settings.enableNotifications })}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {settings.enableNotifications && (
                <div className="space-y-3 pl-2 border-l border-zinc-700">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${textMain}`}>任务完成通知</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enableTaskCompleteNotifications ? 'bg-blue-600' : 'bg-zinc-600'}`} onClick={() => onUpdateSettings({ enableTaskCompleteNotifications: !settings.enableTaskCompleteNotifications })}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableTaskCompleteNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${textMain}`}>成就解锁通知</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enableAchievementNotifications ? 'bg-blue-600' : 'bg-zinc-600'}`} onClick={() => onUpdateSettings({ enableAchievementNotifications: !settings.enableAchievementNotifications })}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableAchievementNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${textMain}`}>番茄钟完成通知</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enablePomodoroNotifications ? 'bg-blue-600' : 'bg-zinc-600'}`} onClick={() => onUpdateSettings({ enablePomodoroNotifications: !settings.enablePomodoroNotifications })}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enablePomodoroNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Display Settings */}
          <div className={`rounded-lg border shadow-sm p-3 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={20} className="text-purple-500" />
                <div>
                  <h3 className={`font-bold text-sm ${textMain}`}>显示设置</h3>
                  <p className={`text-[10px] ${textSub}`}>控制界面显示</p>
                </div>
              </div>
              <Tooltip content="控制游戏界面元素的显示/隐藏">
                <HelpCircle size={16} className="text-zinc-500 hover:text-blue-500 transition-colors cursor-help" />
              </Tooltip>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${textMain}`}>显示经验条</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.showExperienceBar ? 'bg-blue-600' : 'bg-zinc-600'}`} onClick={() => onUpdateSettings({ showExperienceBar: !settings.showExperienceBar })}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showExperienceBar ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${textMain}`}>显示金币数量</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.showBalance ? 'bg-blue-600' : 'bg-zinc-600'}`} onClick={() => onUpdateSettings({ showBalance: !settings.showBalance })}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showBalance ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${textMain}`}>显示任务完成率</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.showTaskCompletionRate ? 'bg-blue-600' : 'bg-zinc-600'}`} onClick={() => onUpdateSettings({ showTaskCompletionRate: !settings.showTaskCompletionRate })}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showTaskCompletionRate ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className={`rounded-lg border shadow-sm p-3 ${cardBg}`}>
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
                  <button className={`w-full px-4 py-2 rounded-lg transition-colors ${isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-800/50' : 'bg-green-100 text-green-700 hover:bg-green-200'}`} onClick={() => {
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
                  <button className={`w-full px-4 py-2 rounded-lg transition-colors ${isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`} onClick={async () => {
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
                    className={`w-full px-4 py-2 rounded-lg transition-colors text-left ${isDark ? 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
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
                <button className={`w-full px-4 py-2 rounded-lg transition-colors ${isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`} onClick={() => {
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
                    className={`text-sm px-2 py-1 rounded ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
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
                <button className={`w-full px-4 py-2 rounded-lg transition-colors ${isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-800/50' : 'bg-red-100 text-red-700 hover:bg-red-200'}`} onClick={() => {
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
          <div className={`rounded-lg border shadow-sm p-3 ${cardBg}`}>
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

          {/* Project Documentation */}
          <div className={`rounded-lg border shadow-sm p-3 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-green-500" />
                <div>
                  <h3 className={`font-bold text-sm ${textMain}`}>项目文档</h3>
                  <p className={`text-[10px] ${textSub}`}>系统技术白皮书</p>
                </div>
              </div>
              <button
                onClick={() => setShowDocs(!showDocs)}
                className={`px-4 py-1.5 rounded-lg transition-colors text-xs ${isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-800/50' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
              >
                {showDocs ? '收起文档' : '查看文档'}
              </button>
            </div>
            
            {showDocs && (
              <div className={`prose prose-sm ${isDark ? 'prose-invert' : ''} max-w-none mt-4 space-y-4`}>
                <h4 className="font-bold text-sm mb-2">系统愿景</h4>
                <p className="text-xs ${textSub} mb-3">
                  本系统不仅仅是一个任务管理工具，它是一个基于认知科学的外部执行力外骨骼，
                  利用热力学第二定律和进化心理学原理，通过强制性的结构和即时的多巴胺反馈，
                  帮助用户执行有利于长期成长的行为。
                </p>
                
                <h4 className="font-bold text-sm mb-2">核心技术栈</h4>
                <div className="text-xs ${textSub} space-y-1 mb-3">
                  <div className="flex gap-2">
                    <span className="font-mono">前端框架:</span>
                    <span>React 19 + TypeScript</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono">构建工具:</span>
                    <span>Vite</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono">数据可视化:</span>
                    <span>Recharts</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono">状态管理:</span>
                    <span>React Hooks + localStorage</span>
                  </div>
                </div>
                
                <h4 className="font-bold text-sm mb-2">核心功能模块</h4>
                <ul className={`text-xs ${textSub} list-disc list-inside space-y-1 mb-3`}>
                  <li>战略指挥部 - 核心仪表盘</li>
                  <li>任务矩阵 - 习惯养成与项目管理</li>
                  <li>数据中心 - 图表与洞察</li>
                  <li>荣誉殿堂 - 成就系统</li>
                  <li>补给黑市 - 资源兑换</li>
                  <li>全域锦囊库 - 金句与灵感</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;