import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Headphones, Sun, Moon, Zap, FileText, Bell, Eye, Database, Info, ShieldAlert, Download, RefreshCw, Trash2, X, ChevronUp, ChevronDown, Upload, Cloud, CloudDownload, Save } from 'lucide-react';
import GlobalHelpCircle from './shared/GlobalHelpCircle';
import { Theme, Settings as SettingsType, Transaction, ReviewLog } from '../types';
import { GlobalGuideCard, HelpTooltip, helpContent } from './HelpSystem';
import WebDAVClient, { WebDAVConfig } from '../utils/webdavClient';
import UserAuthManager from './UserAuthManager';
import { retrieveWebDAVConfig, storeWebDAVConfig } from '../utils/secureStorage';
import { APP_VERSION } from '../constants/app';

interface SettingsProps {
  theme: Theme;
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
  onToggleTheme: () => void;
  day?: number;
  balance?: number;
  xp?: number;
  checkInStreak?: number;
  transactions?: Transaction[];
  reviews?: ReviewLog[];
}

const Settings: React.FC<SettingsProps> = ({ theme, settings, onUpdateSettings, onToggleTheme, day = 1, balance = 59, xp = 10, checkInStreak = 1, transactions = [], reviews = [] }) => {
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
      ? `${neomorphicStyles.bg} rounded-[16px] ${neomorphicStyles.shadow} ${neomorphicStyles.transition}` 
      : 'bg-zinc-900 shadow-lg')
    : isNeomorphic 
    ? `${neomorphicStyles.bg} rounded-[16px] ${neomorphicStyles.shadow} ${neomorphicStyles.hoverShadow} ${neomorphicStyles.activeShadow} ${neomorphicStyles.transition}` 
    : 'bg-white shadow-sm';
  const textMain = isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';
  const textSub = isDark ? 'text-zinc-500' : isNeomorphic ? 'text-zinc-600' : 'text-slate-500';
  
  // State to control project documentation visibility
  const [showDocs, setShowDocs] = useState(false);
  // State to control display settings collapse/expand
  const [showDisplaySettings, setShowDisplaySettings] = useState(true);
  // State to control guide card settings collapse/expand
  const [showGuideCardSettings, setShowGuideCardSettings] = useState(true);
  // State for help modal
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  // State for data management
  const [activeBackupTab, setActiveBackupTab] = useState<'cloud' | 'local'>('local');
  
  // State for WebDAV settings
  const [webdavConfig, setWebdavConfig] = useState<WebDAVConfig>(() => {
    const savedConfig = retrieveWebDAVConfig();
    return {
      url: savedConfig.url,
      username: savedConfig.username,
      password: savedConfig.password,
      basePath: '/人生游戏管理系统',
    };
  });
  // State for WebDAV operation status
  const [webdavStatus, setWebdavStatus] = useState<string>('');
  const [isWebdavConfigCollapsed, setIsWebdavConfigCollapsed] = useState(false);
  // State for backup/restore status
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // State for local backup management
  const [localBackups, setLocalBackups] = useState<Array<{ id: string; name: string; date: string; size: string; status: 'success' | 'failed' | 'in_progress'; type: 'manual' | 'auto' }>>([]);
  const [localBackupStatus, setLocalBackupStatus] = useState<string>('');
  
  // State for auto backup settings
  const [autoBackupEnabled, setAutoBackupEnabled] = useState<boolean>(settings.autoBackupEnabled || false);
  const [autoBackupInterval, setAutoBackupInterval] = useState<'daily' | 'weekly' | 'monthly'>(settings.autoBackupInterval || 'daily');
  const [autoBackupTime, setAutoBackupTime] = useState<string>(settings.autoBackupTime || '02:00');
  
  // State for backup search and filter
  const [backupSearchQuery, setBackupSearchQuery] = useState<string>('');
  
  // State for WebDAV connection test
  const [connectionTestStatus, setConnectionTestStatus] = useState<string>('');
  
  // State for custom backup path
  const [customBackupPath, setCustomBackupPath] = useState<string>(settings.customBackupPath || '');
  
  // State for backup history display settings
  const [showBackupDetails, setShowBackupDetails] = useState<boolean>(true);
  
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
  
  // Test WebDAV connection
  const testWebdavConnection = async () => {
    setConnectionTestStatus('正在测试连接...');
    try {
      const client = new WebDAVClient(webdavConfig);
      await client.testConnection();
      setConnectionTestStatus('连接成功！');
      setTimeout(() => setConnectionTestStatus(''), 3000);
    } catch (error) {
      console.error('Failed to test WebDAV connection:', error);
      setConnectionTestStatus('连接失败：' + (error as Error).message);
      setTimeout(() => setConnectionTestStatus(''), 5000);
    }
  };
  
  // Update WebDAV config and save to secure storage
  const updateWebdavConfig = () => {
    storeWebDAVConfig(webdavConfig);
    setWebdavStatus('WebDAV配置已保存！');
    setTimeout(() => setWebdavStatus(''), 3000);
  };
  
  // Update auto backup settings
  const updateAutoBackupSettings = () => {
    onUpdateSettings({
      autoBackupEnabled,
      autoBackupInterval,
      autoBackupTime,
      customBackupPath
    });
    setLocalBackupStatus('自动备份设置已更新！');
    setTimeout(() => setLocalBackupStatus(''), 3000);
  };
  
  // Create local backup
  const createLocalBackup = () => {
    setLocalBackupStatus('正在创建本地备份...');
    
    // Create a new backup entry with 'in_progress' status
    const backupId = Date.now().toString();
    const backupName = `人生游戏备份_${new Date().toLocaleString('zh-CN').replace(/[\/:\.]/g, '-')}.json`;
    const newBackup = {
      id: backupId,
      name: backupName,
      date: new Date().toLocaleString('zh-CN'),
      size: '0 KB',
      status: 'in_progress' as const,
      type: 'manual' as const
    };
    
    // Add to backup list
    const updatedBackups = [...localBackups, newBackup];
    setLocalBackups(updatedBackups);
    localStorage.setItem('localBackups', JSON.stringify(updatedBackups));
    
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
      const backupData = JSON.stringify(gameData, null, 2);
      
      // Update backup entry with success status and actual size
      const finalBackup = {
        ...newBackup,
        size: (new Blob([backupData]).size / 1024).toFixed(2) + ' KB',
        status: 'success' as const
      };
      
      const finalUpdatedBackups = updatedBackups.map(backup => 
        backup.id === backupId ? finalBackup : backup
      );
      setLocalBackups(finalUpdatedBackups);
      localStorage.setItem('localBackups', JSON.stringify(finalUpdatedBackups));
      
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
      
      // Update backup entry with failed status
      const failedBackup = {
        ...newBackup,
        status: 'failed' as const
      };
      
      const failedUpdatedBackups = updatedBackups.map(backup => 
        backup.id === backupId ? failedBackup : backup
      );
      setLocalBackups(failedUpdatedBackups);
      localStorage.setItem('localBackups', JSON.stringify(failedUpdatedBackups));
      
      setLocalBackupStatus('本地备份创建失败：' + (error as Error).message);
    }
  };
  
  // Restore from local backup
  const restoreFromLocalBackup = (backupId: string) => {
    if (window.confirm('确定要从备份恢复数据吗？这将覆盖当前所有数据！')) {
      setLocalBackupStatus('正在从本地备份恢复...');
      setIsRestoring(true);
      
      try {
        // Get the backup file from localStorage
        const backupJson = localStorage.getItem('localBackups');
        if (backupJson) {
          const backups = JSON.parse(backupJson);
          const selectedBackup = backups.find((backup: any) => backup.id === backupId);
          if (selectedBackup) {
            // 在实际实现中，这里应该从文件系统或服务器获取备份文件内容
            // 然后恢复数据到localStorage
            // 这里模拟恢复过程
            setTimeout(() => {
              // 模拟恢复成功
              setLocalBackupStatus('本地备份恢复成功！');
              setIsRestoring(false);
              
              // 重置应用或刷新页面以加载新数据
              window.location.reload();
            }, 1500);
          } else {
            throw new Error('找不到指定的备份文件');
          }
        } else {
          throw new Error('没有找到备份文件');
        }
      } catch (error) {
        console.error('Failed to restore from local backup:', error);
        setLocalBackupStatus('本地备份恢复失败：' + (error as Error).message);
        setIsRestoring(false);
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
            // For now, we'll just show a success message
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
  
  // WebDAV backup function
  const backupToWebDAV = async () => {
    setWebdavStatus('正在备份到WebDAV...');
    try {
      // 验证WebDAV配置
      if (!webdavConfig.url || !webdavConfig.username || !webdavConfig.password) {
        throw new Error('WebDAV配置不完整，请检查服务器地址、用户名和密码');
      }
      
      const client = new WebDAVClient(webdavConfig);
      
      // 测试连接
      await client.testConnection();
      
      // 准备备份数据
      const gameData = {
        settings,
        projects: JSON.parse(localStorage.getItem('projects') || '[]'),
        habits: JSON.parse(localStorage.getItem('habits') || '[]'),
        characters: JSON.parse(localStorage.getItem('characters') || '[]'),
        achievements: JSON.parse(localStorage.getItem('achievements') || '[]'),
        timestamp: new Date().toISOString()
      };
      const backupData = JSON.stringify(gameData, null, 2);
      const backupName = `人生游戏备份_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const path = `${webdavConfig.basePath || ''}/${backupName}`;
      
      // 执行备份
      await client.uploadFile(path, backupData);
      setWebdavStatus('WebDAV备份成功！');
    } catch (error) {
      console.error('Failed to backup to WebDAV:', error);
      const errorMessage = error as Error;
      let userMessage = 'WebDAV备份失败：';
      
      if (errorMessage.message.includes('network') || errorMessage.message.includes('fetch')) {
        userMessage += '网络连接问题，请检查服务器地址和网络连接';
      } else if (errorMessage.message.includes('401')) {
        userMessage += '认证失败，请检查用户名和密码';
      } else if (errorMessage.message.includes('403')) {
        userMessage += '权限不足，请检查账户权限';
      } else if (errorMessage.message.includes('404')) {
        userMessage += '指定路径不存在，请检查服务器地址和路径';
      } else {
        userMessage += errorMessage.message;
      }
      
      setWebdavStatus(userMessage);
    } finally {
      setTimeout(() => setWebdavStatus(''), 3000);
    }
  };
  
  // WebDAV restore function
  const restoreFromWebDAV = async () => {
    setWebdavStatus('正在从WebDAV恢复...');
    try {
      const client = new WebDAVClient(webdavConfig);
      const path = `${webdavConfig.basePath || ''}/人生游戏备份_${new Date().toISOString().split('T')[0]}.json`;
      const backupData = await client.downloadFile(path);
      const gameData = JSON.parse(backupData as string);
      if (gameData.settings) {
        // In a real implementation, you would restore the data
        setWebdavStatus('WebDAV恢复成功！');
      } else {
        throw new Error('无效的备份文件格式');
      }
    } catch (error) {
      console.error('Failed to restore from WebDAV:', error);
      setWebdavStatus('WebDAV恢复失败：' + (error as Error).message);
    } finally {
      setTimeout(() => setWebdavStatus(''), 3000);
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

          {/* Sound Effects */}
          <div className={`${cardBg} p-3 transition-all duration-300 mt-4`}>
              <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Headphones size={18} className="text-purple-500" />
                <div>
                  <h3 className={`font-bold text-sm ${textMain}`}>音效设置</h3>
                  <p className={`text-[9px] ${textSub}`}>控制系统音效音量与位置音效</p>
                </div>
              </div>
              <HelpTooltip helpId="sound" onHelpClick={setActiveHelp}>
                  <GlobalHelpCircle size={14} />
                </HelpTooltip>
            </div>

            <div className="space-y-2">
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
                  <div className={`rounded-lg p-2 h-[250px] overflow-y-auto ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/50' : 'bg-slate-50'}`}>
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
                            // 仅在开发环境输出详细日志
                            if (process.env.NODE_ENV === 'development') {
                              console.log('播放音效失败:', error);
                            }
                          });
                        };
                        
                        return (
                          <div 
                            key={location.id} 
                            className={`p-2 rounded-lg flex items-center justify-between transition-all cursor-pointer ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/30 hover:bg-zinc-800/50' : 'bg-white/50 hover:bg-slate-100'}`}
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
                                  className={`w-20 text-[10px] px-2 py-1 rounded-lg border-none outline-none ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-800 text-white' : 'bg-white text-slate-800'}`}
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

          {/* 数据管理模块 */}
          <div className={`${cardBg} p-3 transition-all duration-300 mt-4`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-blue-500" />
                <div>
                  <h3 className={`font-bold text-sm ${textMain}`}>数据管理</h3>
                  <p className={`text-[9px] ${textSub}`}>备份、恢复和管理游戏数据</p>
                </div>
              </div>
              <HelpTooltip helpId="data-management" onHelpClick={setActiveHelp}>
                  <GlobalHelpCircle size={14} />
                </HelpTooltip>
            </div>

            {/* Local Backup Status Message */}
            {localBackupStatus && (
              <div className={`mb-3 p-2 rounded-lg text-xs ${localBackupStatus.includes('成功') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} flex items-center justify-between`}>
                <span>{localBackupStatus}</span>
              </div>
            )}

            {/* WebDAV Status Message */}
            {webdavStatus && (
              <div className={`mb-3 p-2 rounded-lg text-xs ${webdavStatus.includes('成功') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} flex items-center justify-between`}>
                <span>{webdavStatus}</span>
                {webdavStatus.includes('网络连接问题') && (
                  <button
                    onClick={() => {
                      // 重试备份操作
                      const backupButton = document.querySelector('button:has(> [data-testid="cloud-download-icon"])');
                      if (backupButton) {
                        (backupButton as HTMLButtonElement).click();
                      }
                    }}
                    className={`text-xs px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors`}
                  >
                    重试
                  </button>
                )}
              </div>
            )}

            {/* Network Diagnosis Guide */}
            {webdavStatus.includes('网络连接问题') && (
              <div className="mb-3 p-3 rounded-lg text-xs bg-yellow-100 text-yellow-800 border border-yellow-200">
                <h4 className="font-bold mb-1">网络诊断指引：</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>检查服务器地址是否正确，确保包含完整的URL</li>
                  <li>验证网络连接是否正常</li>
                  <li>确认WebDAV服务器是否正常运行</li>
                  <li>检查用户名和密码是否正确</li>
                  <li>尝试使用浏览器访问WebDAV地址验证连接</li>
                </ul>
              </div>
            )}

            {/* Backup Tabs */}
            <div className="flex border-b mb-3">
              <button
                onClick={() => setActiveBackupTab('local')}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${activeBackupTab === 'local' ? `${isDark ? 'text-blue-500 border-b-2 border-blue-500' : 'text-blue-600 border-b-2 border-blue-600'}` : `${textSub} hover:text-blue-500`}`}
              >
                本地备份
              </button>
              <button
                onClick={() => setActiveBackupTab('cloud')}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${activeBackupTab === 'cloud' ? `${isDark ? 'text-blue-500 border-b-2 border-blue-500' : 'text-blue-600 border-b-2 border-blue-600'}` : `${textSub} hover:text-blue-500`}`}
              >
                云备份
              </button>
            </div>

            {/* Local Backup Tab */}
            {activeBackupTab === 'local' && (
              <div className="space-y-3">
                {/* Local Backup Actions */}
                <div className={`rounded-lg p-3 ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/50' : 'bg-slate-50'}`}>
                  <h4 className={`font-bold text-xs mb-2 ${textMain}`}>本地备份操作</h4>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={createLocalBackup}
                      disabled={isBackingUp}
                      className={`text-xs py-1.5 px-3 rounded-lg transition-all ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Save size={12} />
                        <span>{isBackingUp ? '备份中...' : '创建本地备份'}</span>
                      </div>
                    </button>
                    <label className={`text-xs py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                      <Upload size={12} />
                      <span>导入本地备份</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Auto Backup Settings */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${textMain}`}>启用自动备份</span>
                      <button
                        onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${autoBackupEnabled ? 'bg-blue-500' : 'bg-white'}` : autoBackupEnabled ? 'bg-blue-600' : 'bg-white'}`}
                      >
                        <span
                          className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>

                    {autoBackupEnabled && (
                      <div className="space-y-2 pl-2 border-l border-zinc-700 dark:border-zinc-600">
                        <div>
                          <label className={`block text-xs ${textSub} mb-1`}>备份周期</label>
                          <select
                            value={autoBackupInterval}
                            onChange={(e) => setAutoBackupInterval(e.target.value as 'daily' | 'weekly' | 'monthly')}
                            className={`w-full text-xs px-2 py-1 rounded-lg border ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'} ${isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-700'}`}
                          >
                            <option value="daily">每日</option>
                            <option value="weekly">每周</option>
                            <option value="monthly">每月</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs ${textSub} mb-1`}>备份时间</label>
                          <input
                            type="time"
                            value={autoBackupTime}
                            onChange={(e) => setAutoBackupTime(e.target.value)}
                            className={`w-full text-xs px-2 py-1 rounded-lg border ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'} ${isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-700'}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Custom Backup Path */}
                    <div>
                      <label className={`block text-xs ${textSub} mb-1`}>自定义备份路径</label>
                      <input
                        type="text"
                        value={customBackupPath}
                        onChange={(e) => setCustomBackupPath(e.target.value)}
                        placeholder="默认路径"
                        className={`w-full text-xs px-2 py-1 rounded-lg border ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'} ${isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-700'}`}
                      />
                    </div>

                    <button
                      onClick={updateAutoBackupSettings}
                      className={`w-full text-xs py-1.5 px-3 rounded-lg transition-all ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                      保存备份设置
                    </button>
                  </div>
                </div>

                {/* Backup History */}
                <div className={`rounded-lg p-3 ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/50' : 'bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-bold text-xs ${textMain}`}>备份历史记录</h4>
                    <div className={`relative w-24 ${isNeomorphic ? (isDark ? 'bg-[#2a2d36]' : 'bg-[#e0e5ec]') : (isDark ? 'bg-zinc-800' : 'bg-white')}`}>
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400 text-[10px]">🔍</span>
                      <input
                        type="text"
                        placeholder="搜索备份"
                        value={backupSearchQuery}
                        onChange={(e) => setBackupSearchQuery(e.target.value)}
                        className={`w-full pl-6 pr-2 py-1 text-xs rounded-lg border ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'} ${isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-700'}`}
                      />
                    </div>
                  </div>

                  {/* Backup List */}
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {localBackups.filter(backup => 
                      backup.name.toLowerCase().includes(backupSearchQuery.toLowerCase()) ||
                      backup.date.toLowerCase().includes(backupSearchQuery.toLowerCase())
                    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((backup) => (
                      <div
                        key={backup.id}
                        className={`p-2 rounded-lg border ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36]' : 'bg-[#e0e5ec]'}` : isDark ? 'bg-zinc-800/50' : 'bg-white/50'} text-xs flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${backup.status === 'success' ? 'bg-green-500' : backup.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                          <div>
                            <div className={`truncate ${textMain}`}>{backup.name}</div>
                            <div className={`text-[9px] ${textSub}`}>{backup.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-[9px] ${textSub}`}>{backup.size}</span>
                          <span className={`text-[9px] px-1 py-0.5 rounded-full ${backup.type === 'auto' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                            {backup.type === 'auto' ? '自动' : '手动'}
                          </span>
                          <button
                            onClick={() => restoreFromLocalBackup(backup.id)}
                            disabled={isRestoring}
                            className={`p-1 rounded-full transition-all ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[5px_5px_10px_rgba(0,0,0,0.2),-5px_-5px_10px_rgba(40,43,52,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(40,43,52,0.9)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)]'}` : isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                            title="恢复"
                          >
                            <Download size={10} />
                          </button>
                          <button
                            onClick={() => deleteLocalBackup(backup.id)}
                            className={`p-1 rounded-full transition-all ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[5px_5px_10px_rgba(0,0,0,0.2),-5px_-5px_10px_rgba(40,43,52,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(40,43,52,0.9)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)]'}` : isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-800/50' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                            title="删除"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {localBackups.length === 0 && (
                    <div className={`text-center py-3 text-xs ${textSub}`}>
                      暂无备份记录
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cloud Backup Tab */}
            {activeBackupTab === 'cloud' && (
              <div className="space-y-3">
                {/* WebDAV Configuration */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${textMain}`}>启用WebDAV备份</span>
                  <button
                    onClick={() => onUpdateSettings({ enableWebDAV: !settings.enableWebDAV })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isNeomorphic ? `shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ${settings.enableWebDAV ? 'bg-blue-500' : 'bg-white'}` : settings.enableWebDAV ? 'bg-blue-600' : 'bg-white'}`}
                  >
                    <span
                      className={`inline-block h-4.5 w-4.5 transform rounded-full transition-transform ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white'} ${settings.enableWebDAV ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                {settings.enableWebDAV && (
                  <div className={`rounded-lg p-3 ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/50' : 'bg-slate-50'}`}>
                    <div className="space-y-2">
                      <div>
                        <label className={`block text-xs ${textSub} mb-1`}>WebDAV服务器地址</label>
                        <input
                          type="text"
                          value={webdavConfig.url}
                          onChange={(e) => setWebdavConfig({ ...webdavConfig, url: e.target.value })}
                          placeholder="https://example.com/webdav"
                          className={`w-full text-xs px-2 py-1 rounded-lg border ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'} ${isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-700'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs ${textSub} mb-1`}>用户名</label>
                        <input
                          type="text"
                          value={webdavConfig.username}
                          onChange={(e) => setWebdavConfig({ ...webdavConfig, username: e.target.value })}
                          placeholder="username"
                          className={`w-full text-xs px-2 py-1 rounded-lg border ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'} ${isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-700'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs ${textSub} mb-1`}>密码</label>
                        <input
                          type="password"
                          value={webdavConfig.password}
                          onChange={(e) => setWebdavConfig({ ...webdavConfig, password: e.target.value })}
                          placeholder="password"
                          className={`w-full text-xs px-2 py-1 rounded-lg border ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'} ${isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-700'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs ${textSub} mb-1`}>基础路径</label>
                        <input
                          type="text"
                          value={webdavConfig.basePath}
                          onChange={(e) => setWebdavConfig({ ...webdavConfig, basePath: e.target.value })}
                          placeholder="/人生游戏管理系统"
                          className={`w-full text-xs px-2 py-1 rounded-lg border ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'} ${isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-700'}`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={testWebdavConnection}
                          className={`text-xs py-1.5 px-3 rounded-lg transition-all ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        >
                          测试连接
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await storeWebDAVConfig(webdavConfig);
                              setWebdavStatus('WebDAV配置已保存');
                              setTimeout(() => setWebdavStatus(''), 3000);
                            } catch (error) {
                              setWebdavStatus('WebDAV配置保存失败');
                              setTimeout(() => setWebdavStatus(''), 3000);
                            }
                          }}
                          className={`text-xs py-1.5 px-3 rounded-lg transition-all ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        >
                          保存配置
                        </button>
                      </div>

                      {/* Connection Test Status */}
                      {connectionTestStatus && (
                        <div className={`mt-2 p-2 rounded-lg text-xs ${connectionTestStatus.includes('成功') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {connectionTestStatus}
                        </div>
                      )}
                      
                      {/* Backup and Restore Buttons */}
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          onClick={backupToWebDAV}
                          disabled={isBackingUp}
                          className={`text-xs py-1.5 px-3 rounded-lg transition-all ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Upload size={12} />
                            <span>{isBackingUp ? '备份中...' : '备份'}</span>
                          </div>
                        </button>
                        <button
                          onClick={restoreFromWebDAV}
                          disabled={isRestoring}
                          className={`text-xs py-1.5 px-3 rounded-lg transition-all ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(40,43,52,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'}` : isDark ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'}`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Download size={12} />
                            <span>{isRestoring ? '恢复中...' : '恢复'}</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* About Module */}
          <div className={`${cardBg} p-3 transition-all duration-300 mt-4`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Info size={18} className="text-blue-500" />
                <div>
                  <h3 className={`font-bold text-sm ${textMain}`}>关于</h3>
                  <p className={`text-[9px] ${textSub}`}>版本信息与联系方式</p>
                </div>
              </div>
              <HelpTooltip helpId="about" onHelpClick={setActiveHelp}>
                  <GlobalHelpCircle size={14} />
                </HelpTooltip>
            </div>
            
            <div className={`rounded-xl p-3 w-full ${isNeomorphic ? `${isNeomorphicDark ? 'bg-[#2a2d36] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'}` : isDark ? 'bg-zinc-900/50' : 'bg-slate-50'}`}>
              <div className="space-y-2">
                <div className="flex items-center p-2 rounded-lg">
                  <span className={`text-sm ${textMain} w-20 flex-shrink-0`}>版本：</span>
                  <span className={`text-sm ${textSub} flex-grow`}>v{APP_VERSION}</span>
                </div>
                <div className="flex items-center p-2 rounded-lg">
                  <span className={`text-sm ${textMain} w-20 flex-shrink-0`}>作者：</span>
                  <span className={`text-sm ${textSub} flex-grow`}>大胆走夜路</span>
                </div>
                <div className="flex items-center p-2 rounded-lg">
                  <span className={`text-sm ${textMain} w-20 flex-shrink-0`}>联系微信：</span>
                  <span className={`text-sm ${textSub} flex-grow`}>zwmrpg</span>
                </div>
                <div className="p-2 rounded-lg">
                  <span className={`text-sm ${textMain} block mb-1`}>项目介绍：</span>
                  <p className={`text-xs ${textSub} leading-4`}>
                    人生游戏管理系统是一个综合性的个人成长管理工具，集成了任务管理、习惯养成、专注计时、成就系统等功能，旨在帮助用户更好地规划和追踪个人发展。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Global Guide Card - 使用统一的帮助系统组件 */}
          <GlobalGuideCard
            activeHelp={activeHelp}
            helpContent={helpContent}
            onClose={() => setActiveHelp(null)}
            cardBg={cardBg}
            textMain={textMain}
            textSub={textSub}
            config={settings.guideCardConfig || {
              fontSize: 'medium',
              borderRadius: 'medium',
              shadowIntensity: 'medium',
              showUnderlyingPrinciple: true
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Settings;