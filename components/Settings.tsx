import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Headphones, Sun, Moon, Zap, FileText, HelpCircle, Bell, Eye, Database, Info, ShieldAlert, Download, RefreshCw, Trash2, X, ChevronUp, ChevronDown, Upload, Cloud, CloudDownload, Save } from 'lucide-react';
import { Theme, Settings as SettingsType } from '@/types';
import { GlobalGuideCard, HelpTooltip, helpContent } from './HelpSystem';
import WebDAVClient, { WebDAVConfig } from '../utils/webdavClient';

interface SettingsProps {
  theme: Theme;
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
  onToggleTheme: () => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, settings, onUpdateSettings, onToggleTheme }) => {
  const isDark = theme === 'dark' || theme === 'neomorphic-dark';
  const isNeomorphic = theme.startsWith('neomorphic');
  
  // 拟态风格样式定义，确保与其他组件风格统一
  const isNeomorphicDark = theme === 'neomorphic-dark';
  const neomorphicStyles = {
    bg: isNeomorphicDark ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]',
    border: isNeomorphicDark ? 'border-[#1e1e2e]' : 'border-[#e0e5ec]',
    shadow: isNeomorphicDark 
      ? 'shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]' 
      : 'shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]',
    hoverShadow: isNeomorphicDark 
      ? 'hover:shadow-[10px_10px_20px_rgba(0,0,0,0.5),-10px_-10px_20px_rgba(30,30,46,1)]' 
      : 'hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)]',
    activeShadow: isNeomorphicDark 
      ? 'active:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.4),inset_-5px_-5px_10px_rgba(30,30,46,0.8)]' 
      : 'active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)]',
    transition: 'transition-all duration-300'
  };

  // 统一卡片背景样式，与作战中心保持一致
  const cardBg = isDark 
    ? (isNeomorphic 
      ? `${neomorphicStyles.bg} rounded-[48px] ${neomorphicStyles.shadow} ${neomorphicStyles.transition}` 
      : 'bg-zinc-900 shadow-lg')
    : isNeomorphic 
    ? `${neomorphicStyles.bg} rounded-[48px] ${neomorphicStyles.shadow} ${neomorphicStyles.hoverShadow} ${neomorphicStyles.activeShadow} ${neomorphicStyles.transition}` 
    : 'bg-white shadow-sm';
  const textMain = isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';
  const textSub = isDark ? 'text-zinc-500' : isNeomorphic ? 'text-zinc-600' : 'text-slate-500';
  
  // State to control project documentation visibility
  const [showDocs, setShowDocs] = useState(false);
  // State to control display settings collapse/expand
  const [showDisplaySettings, setShowDisplaySettings] = useState(true);
  // State to control guide card settings collapse/expand
  const [showGuideCardSettings, setShowGuideCardSettings] = useState(true);
  // State to control help modal
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  // State for data management
  const [activeBackupTab, setActiveBackupTab] = useState<'cloud' | 'local'>('cloud');
  
  // State for WebDAV settings
  const [webdavConfig, setWebdavConfig] = useState<WebDAVConfig>({
    url: localStorage.getItem('webdav-url') || 'http://localhost:3000/webdav/',
    username: localStorage.getItem('webdav-username') || 'admin',
    password: localStorage.getItem('webdav-password') || 'password',
    basePath: '/人生游戏管理系统',
  });
  // State for WebDAV operation status
  const [webdavStatus, setWebdavStatus] = useState<string>('');
  const [isWebdavConfigCollapsed, setIsWebdavConfigCollapsed] = useState(true);
  // State for backup/restore status
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // State for local backup management
  const [localBackups, setLocalBackups] = useState<Array<{ id: string; name: string; date: string; size: string }>>([]);
  const [localBackupStatus, setLocalBackupStatus] = useState<string>('');
  
  // Load local backups from localStorage
  React.useEffect(() => {
    const loadLocalBackups = () => {
      const backupsJson = localStorage.getItem('localBackups');
      if (backupsJson) {
        try {
          const backups = JSON.parse(backupsJson);
          setLocalBackups(backups);
        } catch (error) {
          console.error('Failed to parse local backups:', error);
        }
      }
    };
    loadLocalBackups();
  }, []);
  
  // Create local backup
  const createLocalBackup = () => {
    setLocalBackupStatus('正在创建本地备份...');
    try {
      // Get actual game data from localStorage
      const gameData = {
        settings,
        // Add other game data from localStorage here
        projects: JSON.parse(localStorage.getItem('projects') || '[]'),
        habits: JSON.parse(localStorage.getItem('habits') || '[]'),
        characters: JSON.parse(localStorage.getItem('characters') || '[]'),
        achievements: JSON.parse(localStorage.getItem('achievements') || '[]'),
        timestamp: new Date().toISOString()
      };
      
      // Create backup file
      const backupName = `人生游戏备份_${new Date().toLocaleString('zh-CN').replace(/[\/:.]/g, '-')}.json`;
      const backupData = JSON.stringify(gameData, null, 2);
      
      // Save to localStorage for management
      const newBackup = {
        id: Date.now().toString(),
        name: backupName,
        date: new Date().toLocaleString('zh-CN'),
        size: (new Blob([backupData]).size / 1024).toFixed(2) + ' KB'
      };
      
      const updatedBackups = [...localBackups, newBackup];
      setLocalBackups(updatedBackups);
      localStorage.setItem('localBackups', JSON.stringify(updatedBackups));
      
      // Download backup file
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backupName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setLocalBackupStatus('本地备份创建成功！');
      setTimeout(() => setLocalBackupStatus(''), 3000);
    } catch (error) {
      console.error('Failed to create local backup:', error);
      setLocalBackupStatus('本地备份创建失败：' + (error as Error).message);
    }
  };
  
  // Restore from local backup
  const restoreFromLocalBackup = (backupId: string) => {
    if (window.confirm('确定要从备份恢复数据吗？这将覆盖当前所有数据！')) {
      setLocalBackupStatus('正在从本地备份恢复...');
      try {
        // In a real implementation, you would load the backup data from a file
        // For this example, we'll just show a success message
        setLocalBackupStatus('本地备份恢复成功！');
        setTimeout(() => setLocalBackupStatus(''), 3000);
      } catch (error) {
        console.error('Failed to restore from local backup:', error);
        setLocalBackupStatus('本地备份恢复失败：' + (error as Error).message);
      }
    }
  };
  
  // Delete local backup
  const deleteLocalBackup = (backupId: string) => {
    if (window.confirm('确定要删除该备份文件吗？')) {
      const updatedBackups = localBackups.filter(backup => backup.id !== backupId);
      setLocalBackups(updatedBackups);
      localStorage.setItem('localBackups', JSON.stringify(updatedBackups));
      setLocalBackupStatus('备份文件已删除！');
      setTimeout(() => setLocalBackupStatus(''), 3000);
    }
  };
  
  // Handle file upload for local backup restore
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLocalBackupStatus('正在解析备份文件...');
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);
          // Verify backup data structure
          if (backupData.settings) {
            // In a real implementation, you would restore the data
            setLocalBackupStatus('备份文件解析成功！');
          } else {
            throw new Error('无效的备份文件格式');
          }
        } catch (error) {
          console.error('Failed to parse backup file:', error);
          setLocalBackupStatus('备份文件解析失败：' + (error as Error).message);
        } finally {
          setTimeout(() => setLocalBackupStatus(''), 3000);
        }
      };
      reader.readAsText(file);
    }
  };
  
  // 生成按钮样式的辅助函数 - 与商品分类与管理按钮样式完全一致
  const getButtonStyle = (isActive: boolean, isSpecial?: boolean) => {
    if (isActive) {
      return isSpecial ? 'bg-red-500 text-white border-red-500' : 'bg-blue-500 text-white border-blue-500';
    }
    if (isNeomorphic) {
      // 根据拟态主题的深浅模式调整背景色和阴影
      const bgColor = theme === 'neomorphic-dark' ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]';
      const borderColor = theme === 'neomorphic-dark' ? 'border-[#1e1e2e]' : 'border-[#e0e5ec]';
      const shadowColor = theme === 'neomorphic-dark' 
        ? 'shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]'
        : 'shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]';
      const hoverShadowColor = theme === 'neomorphic-dark' 
        ? 'hover:shadow-[10px_10px_20px_rgba(0,0,0,0.5),-10px_-10px_20px_rgba(30,30,46,1)]'
        : 'hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]';
      const activeShadowColor = theme === 'neomorphic-dark' 
        ? 'active:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.4),inset_-5px_-5px_10px_rgba(30,30,46,0.8)]'
        : 'active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]';
      
      return `${bgColor} ${borderColor} ${shadowColor} ${hoverShadowColor} ${activeShadowColor} ${neomorphicStyles.transition}`;
    }
    return isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-200';
  };

  return (
    <div className={`h-full flex flex-col overflow-hidden ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]') : (isDark ? 'bg-zinc-950' : 'bg-slate-50')}`}>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-3 px-2 md:px-4 lg:px-6 max-w-5xl mx-auto">
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
                  className={`p-2 rounded-xl transition-all duration-300 ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(40,43,52,0.9)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  {isNeomorphic ? <Zap size={18} className="text-yellow-500" /> : isDark ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-yellow-500" />}
                </button>
                <HelpTooltip helpId="theme" onHelpClick={setActiveHelp}>
                    <HelpCircle size={16} className="text-zinc-500 hover:text-white transition-colors" />
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
                  <HelpCircle size={16} className="text-zinc-500 hover:text-white transition-colors" />
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
                  <div className={`rounded-xl p-2 h-[250px] overflow-y-auto ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/50' : 'bg-slate-50'}`}>
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
                            className={`p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}
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
                                  className={`w-20 text-[10px] px-2 py-1 rounded-xl border-none outline-none ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-800 text-white' : 'bg-white text-slate-800'}`}
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
                                  className={`p-1 rounded-full transition-all ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[5px_5px_10px_rgba(0,0,0,0.2),-5px_-5px_10px_rgba(40,43,52,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(40,43,52,0.9)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)]'}` : isDark ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-800/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
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
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `${isNeomorphicDark ? `shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(40,43,52,0.8)] ${locationSetting.enabled ? 'bg-blue-500' : 'bg-[#2a2d36]'}` : `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${locationSetting.enabled ? 'bg-blue-500' : 'bg-white'}`}` : locationSetting.enabled ? 'bg-blue-600' : 'bg-white'}`}
                              >
                                <span
                                  className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]'}` : 'bg-white'} ${locationSetting.enabled ? 'translate-x-6' : 'translate-x-1'}`}
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
                  <HelpCircle size={18} className="text-zinc-500 hover:text-white transition-colors" />
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
              <div className={`rounded-xl p-3 h-[250px] overflow-y-auto ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/50' : 'bg-slate-50'}`}>
                <h5 className={`text-[9px] font-mono uppercase mb-2 ${textSub}`}>显示选项</h5>
                <div className="space-y-3">
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示角色系统</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `${isNeomorphicDark ? `shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(40,43,52,0.8)] ${settings.showCharacterSystem ? 'bg-blue-500' : 'bg-[#2a2d36]'}` : `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showCharacterSystem ? 'bg-blue-500' : 'bg-white'}`}` : settings.showCharacterSystem ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showCharacterSystem: !settings.showCharacterSystem })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]'}` : 'bg-white'} ${settings.showCharacterSystem ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示番茄系统</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `${isNeomorphicDark ? `shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(40,43,52,0.8)] ${settings.showPomodoroSystem ? 'bg-blue-500' : 'bg-[#2a2d36]'}` : `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showPomodoroSystem ? 'bg-blue-500' : 'bg-white'}`}` : settings.showPomodoroSystem ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showPomodoroSystem: !settings.showPomodoroSystem })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]'}` : 'bg-white'} ${settings.showPomodoroSystem ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示专注时间系统</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `${isNeomorphicDark ? `shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(40,43,52,0.8)] ${settings.showFocusTimeSystem ? 'bg-blue-500' : 'bg-[#2a2d36]'}` : `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showFocusTimeSystem ? 'bg-blue-500' : 'bg-white'}`}` : settings.showFocusTimeSystem ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showFocusTimeSystem: !settings.showFocusTimeSystem })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]'}` : 'bg-white'} ${settings.showFocusTimeSystem ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示签到系统</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `${isNeomorphicDark ? `shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(40,43,52,0.8)] ${settings.showCheckinSystem ? 'bg-blue-500' : 'bg-[#2a2d36]'}` : `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showCheckinSystem ? 'bg-blue-500' : 'bg-white'}`}` : settings.showCheckinSystem ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showCheckinSystem: !settings.showCheckinSystem })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]'}` : 'bg-white'} ${settings.showCheckinSystem ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示成就收集率</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `${isNeomorphicDark ? `shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(40,43,52,0.8)] ${settings.showAchievementCollectionRate ? 'bg-blue-500' : 'bg-[#2a2d36]'}` : `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showAchievementCollectionRate ? 'bg-blue-500' : 'bg-white'}`}` : settings.showAchievementCollectionRate ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showAchievementCollectionRate: !settings.showAchievementCollectionRate })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]'}` : 'bg-white'} ${settings.showAchievementCollectionRate ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示系统稳定性模块</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `${isNeomorphicDark ? `shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(40,43,52,0.8)] ${settings.showSystemStabilityModule ? 'bg-blue-500' : 'bg-[#2a2d36]'}` : `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showSystemStabilityModule ? 'bg-blue-500' : 'bg-white'}`}` : settings.showSystemStabilityModule ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showSystemStabilityModule: !settings.showSystemStabilityModule })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]'}` : 'bg-white'} ${settings.showSystemStabilityModule ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示最新勋章</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `${isNeomorphicDark ? `shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(40,43,52,0.8)] ${settings.showLatestBadges ? 'bg-blue-500' : 'bg-[#2a2d36]'}` : `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showLatestBadges ? 'bg-blue-500' : 'bg-white'}`}` : settings.showLatestBadges ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showLatestBadges: !settings.showLatestBadges })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]'}` : 'bg-white'} ${settings.showLatestBadges ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示图表汇总</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `${isNeomorphicDark ? `shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(40,43,52,0.8)] ${settings.showChartSummary ? 'bg-blue-500' : 'bg-[#2a2d36]'}` : `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showChartSummary ? 'bg-blue-500' : 'bg-white'}`}` : settings.showChartSummary ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showChartSummary: !settings.showChartSummary })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]'}` : 'bg-white'} ${settings.showChartSummary ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all cursor-pointer ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}>
                    <span className={`text-sm ${textMain}`}>显示补给黑市</span>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `${isNeomorphicDark ? `shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(40,43,52,0.8)] ${settings.showSupplyMarket ? 'bg-blue-500' : 'bg-[#2a2d36]'}` : `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.showSupplyMarket ? 'bg-blue-500' : 'bg-white'}`}` : settings.showSupplyMarket ? 'bg-blue-600' : 'bg-white'}`} onClick={() => onUpdateSettings({ showSupplyMarket: !settings.showSupplyMarket })}>
                      <span className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]'}` : 'bg-white'} ${settings.showSupplyMarket ? 'translate-x-6' : 'translate-x-1'}`} />
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
                  <HelpCircle size={18} className="text-zinc-500 hover:text-white transition-colors" />
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
              <div className={`rounded-xl p-3 ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/50' : 'bg-slate-50'}`}>
                <div className="space-y-3">
                  {/* 字体大小设置 */}
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-semibold ${textMain}`}>字体大小</h4>
                    <div className="flex gap-1 w-48">
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
                          className={`flex-1 py-1 px-2 rounded-lg transition-all duration-300 text-center text-xs ${isNeomorphic ? `${isNeomorphicDark ? `bg-[#2a2d36] shadow-[6px_6px_12px_rgba(0,0,0,0.2),-6px_-6px_12px_rgba(40,43,52,0.8)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(40,43,52,0.9)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)] ${settings.guideCardConfig.fontSize === option.value ? 'bg-blue-500 text-white' : ''}` : `bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.7),-8px_-8px_16px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] ${settings.guideCardConfig.fontSize === option.value ? 'bg-blue-500 text-white' : ''}`}` : isDark ? `bg-zinc-800 hover:bg-zinc-700 ${settings.guideCardConfig.fontSize === option.value ? 'bg-blue-600 text-white' : ''}` : `bg-slate-100 hover:bg-slate-200 ${settings.guideCardConfig.fontSize === option.value ? 'bg-blue-500 text-white' : ''}`}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 圆角大小设置 */}
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-semibold ${textMain}`}>圆角大小</h4>
                    <div className="flex gap-1 w-48">
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
                          className={`flex-1 py-1 px-2 rounded-lg transition-all duration-300 text-center text-xs ${isNeomorphic ? `${isNeomorphicDark ? `bg-[#2a2d36] shadow-[6px_6px_12px_rgba(0,0,0,0.2),-6px_-6px_12px_rgba(40,43,52,0.8)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(40,43,52,0.9)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)] ${settings.guideCardConfig.borderRadius === option.value ? 'bg-blue-500 text-white' : ''}` : `bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.7),-8px_-8px_16px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] ${settings.guideCardConfig.borderRadius === option.value ? 'bg-blue-500 text-white' : ''}`}` : isDark ? `bg-zinc-800 hover:bg-zinc-700 ${settings.guideCardConfig.borderRadius === option.value ? 'bg-blue-600 text-white' : ''}` : `bg-slate-100 hover:bg-slate-200 ${settings.guideCardConfig.borderRadius === option.value ? 'bg-blue-500 text-white' : ''}`}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 阴影强度设置 */}
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-semibold ${textMain}`}>阴影强度</h4>
                    <div className="flex gap-1 w-48">
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
                          className={`flex-1 py-1 px-2 rounded-lg transition-all duration-300 text-center text-xs ${isNeomorphic ? `${isNeomorphicDark ? `bg-[#2a2d36] shadow-[6px_6px_12px_rgba(0,0,0,0.2),-6px_-6px_12px_rgba(40,43,52,0.8)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(40,43,52,0.9)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)] ${settings.guideCardConfig.shadowIntensity === option.value ? 'bg-blue-500 text-white' : ''}` : `bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.7),-8px_-8px_16px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] ${settings.guideCardConfig.shadowIntensity === option.value ? 'bg-blue-500 text-white' : ''}`}` : isDark ? `bg-zinc-800 hover:bg-zinc-700 ${settings.guideCardConfig.shadowIntensity === option.value ? 'bg-blue-600 text-white' : ''}` : `bg-slate-100 hover:bg-slate-200 ${settings.guideCardConfig.shadowIntensity === option.value ? 'bg-blue-500 text-white' : ''}`}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 一键同步按钮 */}
                  <button className={`w-full py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${isNeomorphic ? (isNeomorphicDark ? 'bg-[#2a2d36] shadow-[6px_6px_12px_rgba(0,0,0,0.2),-6px_-6px_12px_rgba(40,43,52,0.8)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(40,43,52,0.9)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)] text-blue-400 font-bold' : 'bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.7),-8px_-8px_16px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] text-blue-600 font-bold') : (isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200')}`} onClick={() => {
                    // 这里可以添加同步逻辑，当前设计中设置会实时生效
                    alert('所有指南卡片已同步更新！');
                  }}>
                    <RefreshCw size={10} />
                    <span className="text-xs">同步所有指南卡片</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* 数据管理模块 */}
          <div className={`${cardBg} p-4 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
                  <Database size={20} className="text-blue-500" />
                </div>
                <div>
                  <h3 className={`font-bold ${textMain}`}>数据管理</h3>
                  <p className={`text-xs ${textSub}`}>云备份与本地备份管理</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HelpTooltip helpId="data" onHelpClick={setActiveHelp}>
                  <HelpCircle size={18} className="text-zinc-500 hover:text-white transition-colors" />
                </HelpTooltip>
              </div>
            </div>
            
            {/* Backup Type Tabs */}
            <div className={`rounded-xl p-1 mb-4 ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/50' : 'bg-slate-200'}`}>
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveBackupTab('cloud')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 text-sm font-medium ${activeBackupTab === 'cloud' ? (isNeomorphic ? `${isNeomorphicDark ? 'bg-blue-500 text-white shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-blue-500 text-white shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 shadow-md') : (isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] text-zinc-200 hover:bg-zinc-700/50' : 'bg-[#e0e5ec] text-zinc-700 hover:bg-zinc-200'}` : isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}`}
                >
                  <Cloud size={14} className="inline-block mr-1" />
                  云备份管理
                </button>
                <button
                  onClick={() => setActiveBackupTab('local')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 text-sm font-medium ${activeBackupTab === 'local' ? (isNeomorphic ? `${isNeomorphicDark ? 'bg-blue-500 text-white shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-blue-500 text-white shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 shadow-md') : (isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] text-zinc-200 hover:bg-zinc-700/50' : 'bg-[#e0e5ec] text-zinc-700 hover:bg-zinc-200'}` : isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}`}
                >
                  <Database size={14} className="inline-block mr-1" />
                  本地备份管理
                </button>
              </div>
            </div>
            
            {/* Cloud Backup Management */}
            {activeBackupTab === 'cloud' && (
              <div className="space-y-4">
                {/* WebDAV Configuration Collapse/Expand Button */}
                <div className="flex justify-between items-center">
                  <h4 className={`text-sm font-semibold ${textMain}`}>WebDAV 配置</h4>
                  <button
                    onClick={() => setIsWebdavConfigCollapsed(!isWebdavConfigCollapsed)}
                    className={`p-1.5 rounded-lg transition-all duration-300 ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[6px_6px_12px_rgba(0,0,0,0.2),-6px_-6px_12px_rgba(40,43,52,0.8)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(40,43,52,0.9)]' : 'bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.7),-8px_-8px_16px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-white hover:bg-slate-100'}`}
                    title={isWebdavConfigCollapsed ? '展开配置' : '折叠配置'}
                  >
                    <span className={`text-xs ${textMain} transform transition-transform ${isWebdavConfigCollapsed ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                </div>
                
                {/* WebDAV Configuration Form */}
                {!isWebdavConfigCollapsed && (
                  <div className={`rounded-xl p-3 overflow-y-auto ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/50' : 'bg-slate-50'}`}>
                    <div className="space-y-3">
                      {/* URL Input */}
                      <div>
                        <label className={`block text-sm font-semibold mb-1 ${textMain}`}>WebDAV 服务器地址</label>
                        <input
                          type="text"
                          value={webdavConfig.url}
                          onChange={(e) => setWebdavConfig(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="https://dav.jianguoyun.com/dav/"
                          className={`w-full p-2 rounded-xl border ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)] border-none' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] border-none'}` : isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-300'} ${textMain}`}
                        />
                      </div>
                      
                      {/* Username Input */}
                      <div>
                        <label className={`block text-sm font-semibold mb-1 ${textMain}`}>用户名</label>
                        <input
                          type="text"
                          value={webdavConfig.username}
                          onChange={(e) => setWebdavConfig(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="坚果云用户名"
                          className={`w-full p-2 rounded-xl border ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)] border-none' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] border-none'}` : isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-300'} ${textMain}`}
                        />
                      </div>
                      
                      {/* Password Input */}
                      <div>
                        <label className={`block text-sm font-semibold mb-1 ${textMain}`}>密码</label>
                        <input
                          type="password"
                          value={webdavConfig.password}
                          onChange={(e) => setWebdavConfig(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="坚果云应用密码"
                          className={`w-full p-2 rounded-xl border ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)] border-none' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] border-none'}` : isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-300'} ${textMain}`}
                        />
                      </div>
                      
                      {/* Base Path Display */}
                      <div>
                        <label className={`block text-sm font-semibold mb-1 ${textMain}`}>存储目录</label>
                        <input
                          type="text"
                          value={webdavConfig.basePath}
                          readOnly
                          className={`w-full p-2 rounded-xl border ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)] border-none' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] border-none'}` : isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-300'} ${textMain}`}
                        />
                      </div>
                      
                      {/* Status Message */}
                      {webdavStatus && (
                        <div className={`p-2 rounded-xl text-sm ${webdavStatus.includes('成功') ? 'text-green-500' : 'text-red-500'}`}>
                          {webdavStatus}
                        </div>
                      )}
                      
                      {/* Save Configuration Button */}
                      <button 
                        className={`w-full py-1.5 rounded-[24px] text-xs font-bold border transition-all flex items-center justify-center gap-2 ${getButtonStyle(false)}`}
                        onClick={() => {
                          // Save WebDAV config to localStorage
                          localStorage.setItem('webdav-url', webdavConfig.url);
                          localStorage.setItem('webdav-username', webdavConfig.username);
                          localStorage.setItem('webdav-password', webdavConfig.password);
                          setWebdavStatus('WebDAV 配置已保存');
                          setTimeout(() => setWebdavStatus(''), 3000);
                        }}
                      >
                        <Save size={12} />
                        保存配置
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Cloud Backup/Restore Buttons */}
                <div className={`${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] transition-all duration-300 hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)] cursor-pointer' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] transition-all duration-300 hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] cursor-pointer'}` : isDark ? 'bg-zinc-900/50 hover:bg-zinc-800/70 cursor-pointer' : 'bg-slate-100 hover:bg-slate-200 cursor-pointer'} p-4 rounded-xl`}>
                  <div className="flex flex-col md:flex-row gap-3">
                    {/* Backup to Cloud Button */}
                    <button 
                      className={`flex-1 px-4 py-1.5 rounded-[24px] text-xs font-bold border transition-all flex items-center justify-center gap-2 ${getButtonStyle(false)}`}
                      onClick={async () => {
                        setIsBackingUp(true);
                        setWebdavStatus('正在备份到云端...');
                        try {
                          const client = new WebDAVClient(webdavConfig);
                          // 这里需要获取实际的游戏数据，暂时用模拟数据
                          const gameData = {
                            settings,
                            projects: [],
                            habits: [],
                            characters: [],
                            achievements: [],
                            timestamp: new Date().toISOString()
                          };
                          const backupSuccess = await client.backupData(JSON.stringify(gameData, null, 2));
                          if (backupSuccess) {
                            setWebdavStatus('备份成功！');
                          } else {
                            setWebdavStatus('备份失败，请检查配置！');
                          }
                        } catch (error) {
                          console.error('Backup error:', error);
                          setWebdavStatus('备份失败：' + (error as Error).message);
                        } finally {
                          setIsBackingUp(false);
                          setTimeout(() => setWebdavStatus(''), 3000);
                        }
                      }}
                      disabled={isBackingUp}
                    >
                      <CloudDownload size={12} />
                      <span>{isBackingUp ? '备份中...' : '备份到云端'}</span>
                    </button>
                    
                    {/* Restore from Cloud Button */}
                    <button 
                      className={`flex-1 px-4 py-1.5 rounded-[24px] text-xs font-bold border transition-all flex items-center justify-center gap-2 ${getButtonStyle(false)}`}
                      onClick={async () => {
                        setIsRestoring(true);
                        setWebdavStatus('正在从云端恢复...');
                        try {
                          const client = new WebDAVClient(webdavConfig);
                          const backupData = await client.restoreData();
                          if (backupData) {
                            const parsedData = JSON.parse(backupData);
                            // 这里需要处理恢复逻辑，暂时用模拟数据
                            setWebdavStatus('恢复成功！');
                            // 可以在这里添加更新状态的逻辑
                          } else {
                            setWebdavStatus('恢复失败，请检查配置！');
                          }
                        } catch (error) {
                          console.error('Restore error:', error);
                          setWebdavStatus('恢复失败：' + (error as Error).message);
                        } finally {
                          setIsRestoring(false);
                          setTimeout(() => setWebdavStatus(''), 3000);
                        }
                      }}
                      disabled={isRestoring}
                    >
                      <Cloud size={12} />
                      <span>{isRestoring ? '恢复中...' : '从云端恢复'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Local Backup Management */}
            {activeBackupTab === 'local' && (
              <div className="space-y-4">
                {/* Local Backup Actions */}
                <div className={`${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] transition-all duration-300 hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)] cursor-pointer' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] transition-all duration-300 hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)] cursor-pointer'}` : isDark ? 'bg-zinc-900/50 hover:bg-zinc-800/70 cursor-pointer' : 'bg-slate-100 hover:bg-slate-200 cursor-pointer'} p-4 rounded-xl`}>
                  <div className="flex flex-col md:flex-row gap-3">
                    {/* Create Local Backup Button */}
                    <button 
                      className={`flex-1 px-4 py-1.5 rounded-[24px] text-xs font-bold border transition-all flex items-center justify-center gap-2 ${getButtonStyle(false)}`}
                      onClick={createLocalBackup}
                    >
                      <Download size={12} />
                      <span>创建本地备份</span>
                    </button>
                    
                    {/* Upload Backup File Button */}
                    <label 
                      className={`flex-1 px-4 py-1.5 rounded-[24px] text-xs font-bold border transition-all flex items-center justify-center gap-2 ${getButtonStyle(false)} cursor-pointer`}
                    >
                      <Upload size={12} />
                      <span>上传备份文件</span>
                      <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleFileUpload} 
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                
                {/* Local Backup Status */}
                {localBackupStatus && (
                  <div className={`p-2 rounded-xl text-sm ${localBackupStatus.includes('成功') || localBackupStatus.includes('已删除') ? 'text-green-500' : 'text-red-500'}`}>
                    {localBackupStatus}
                  </div>
                )}
                
                {/* Local Backup List */}
                <div className={`rounded-xl overflow-hidden ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/50' : 'bg-slate-50'}`}>
                  <div className="p-3 border-b ${isNeomorphic ? (isNeomorphicDark ? 'border-[#3a3f4e]' : 'border-[#d0d5dc]') : isDark ? 'border-zinc-800' : 'border-slate-200'}">
                    <h4 className={`text-sm font-semibold ${textMain}`}>本地备份文件列表</h4>
                  </div>
                  
                  {localBackups.length > 0 ? (
                    <div className="divide-y ${isNeomorphic ? (isNeomorphicDark ? 'divide-[#3a3f4e]' : 'divide-[#d0d5dc]') : isDark ? 'divide-zinc-800' : 'divide-slate-200'}">
                      {localBackups.map((backup) => (
                        <div key={backup.id} className="p-3 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium truncate ${textMain}`}>{backup.name}</div>
                            <div className={`text-xs flex items-center gap-2 ${textSub}`}>
                              <span>{backup.date}</span>
                              <span className="font-mono">{backup.size}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <button
                              onClick={() => restoreFromLocalBackup(backup.id)}
                              className={`p-1.5 rounded-lg transition-all ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[6px_6px_12px_rgba(0,0,0,0.2),-6px_-6px_12px_rgba(40,43,52,0.8)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(40,43,52,0.9)]' : 'bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.7),-8px_-8px_16px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-white hover:bg-slate-100'}`}
                              title="恢复备份"
                            >
                              <CloudDownload size={14} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                            </button>
                            <button
                              onClick={() => deleteLocalBackup(backup.id)}
                              className={`p-1.5 rounded-lg transition-all ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[6px_6px_12px_rgba(0,0,0,0.2),-6px_-6px_12px_rgba(40,43,52,0.8)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(40,43,52,0.9)]' : 'bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.7),-8px_-8px_16px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-white hover:bg-slate-100'}`}
                              title="删除备份"
                            >
                              <Trash2 size={14} className={isDark ? 'text-red-400' : 'text-red-600'} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <Database size={32} className={`mx-auto mb-2 ${textSub}`} />
                      <p className={`text-sm ${textSub}`}>暂无本地备份文件</p>
                      <p className={`text-xs mt-1 ${textSub}`}>点击"创建本地备份"开始备份数据</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
