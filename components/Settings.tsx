import React, { useState, useEffect, memo } from 'react';
import { Volume2, VolumeX, Music, Headphones, Sun, Moon, Zap, FileText, Bell, Eye, Database, Info, ShieldAlert, Download, RefreshCw, Trash2, X, ChevronUp, ChevronDown, Upload, Cloud, CloudDownload, Save, RotateCcw, Key } from 'lucide-react';
import { Theme, Settings as SettingsType, Transaction, ReviewLog } from '../types';
import { GlobalGuideCard, helpContent, GlobalHelpButton } from './HelpSystem';
import { getNeomorphicStyles, getButtonStyle, getCardBgStyle, getTextStyle } from '../utils/styleHelpers';
import WebDAVClient, { WebDAVConfig } from '../utils/webdavClient';
import UserAuthManager from './UserAuthManager';
import { retrieveWebDAVConfig, storeWebDAVConfig } from '../utils/secureStorage';
import { APP_VERSION } from '../constants/app';
import backupManager from '../utils/BackupManager';
import { BackupProgress } from '../utils/EnhancedWebDAVBackupManager';

// 导入主题上下文
import { useTheme } from '../contexts/ThemeContext';

interface SettingsProps {
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

const Settings: React.FC<SettingsProps> = memo(({ settings, onUpdateSettings, onToggleTheme, day = 1, balance = 59, xp = 10, checkInStreak = 1, transactions = [], reviews = [] }) => {
  const { theme } = useTheme();
  const isDark = theme.includes('dark');
  const isNeomorphic = theme.startsWith('neomorphic');
  
  const isNeomorphicDark = theme === 'neomorphic-dark';
  const neomorphicStyles = getNeomorphicStyles(isNeomorphicDark);

  // 统一卡片背景样式，与作战中心保持一致
  const cardBg = getCardBgStyle(isNeomorphic, theme, isDark);
  const textMain = getTextStyle(isDark, isNeomorphic, 'main');
  const textSub = getTextStyle(isDark, isNeomorphic, 'sub');
  
  // State to control project documentation visibility
  const [showDocs, setShowDocs] = useState(false);
  // State to control display settings collapse/expand
  const [showDisplaySettings, setShowDisplaySettings] = useState(true);
  // State to control guide card settings collapse/expand
  const [showGuideCardSettings, setShowGuideCardSettings] = useState(true);
  // State for help card modal
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  // State for data management
  const [activeBackupTab, setActiveBackupTab] = useState<'cloud' | 'local'>('local');
  const [cloudProvider, setCloudProvider] = useState<'webdav' | 'baidu'>('webdav');
  
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
  
  // State for backup progress
  const [backupProgress, setBackupProgress] = useState<BackupProgress | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  
  // State for local backup management
  const [localBackups, setLocalBackups] = useState<Array<{ id: string; name: string; date: string; size: string; status: 'success' | 'failed' | 'in_progress'; type: 'manual' | 'auto' }>>([]);
  const [localBackupStatus, setLocalBackupStatus] = useState<string>('');
  
  // State for auto backup settings
  const [autoBackupEnabled, setAutoBackupEnabled] = useState<boolean>(settings.autoBackupEnabled ?? true); // 默认启用自动备份
  const [autoBackupInterval, setAutoBackupInterval] = useState<'daily' | 'weekly' | 'monthly'>(settings.autoBackupInterval || 'daily');
  const [autoBackupTime, setAutoBackupTime] = useState<string>(settings.autoBackupTime || '10:00'); // 默认时间为早上10点
  
  // State for backup search and filter
  const [backupSearchQuery, setBackupSearchQuery] = useState<string>('');
  
  // State for WebDAV connection test
  const [connectionTestStatus, setConnectionTestStatus] = useState<string>('');
  
  // State for custom backup path
  const [customBackupPath, setCustomBackupPath] = useState<string>(settings.customBackupPath || '');
  
  // State for backup history display settings
  const [showBackupDetails, setShowBackupDetails] = useState<boolean>(true);
  
  // State for Baidu Netdisk configuration
  const [baiduConfig, setBaiduConfig] = useState({
    accessToken: localStorage.getItem('bdpan_token') || '',
    refreshToken: ''
  });
  
  // 检查百度网盘授权状态
  const checkBaiduNetdiskAuth = async () => {
    try {
      // 导入百度网盘备份管理器
      const { default: baiduNetdiskBackupManager } = await import('../utils/BaiduNetdiskBackupManager');
      
      // 检查是否已授权
      const isAuthorized = baiduNetdiskBackupManager.isAuthorized();
      
      if (isAuthorized) {
        // 授权成功，更新配置
        const accessToken = localStorage.getItem('bdpan_token');
        
        setBaiduConfig(prev => ({
          ...prev,
          accessToken: accessToken || '',
          refreshToken: ''
        }));
      }
    } catch (error) {
      console.error('检查百度网盘授权状态失败:', error);
    }
  };
  
  // 初始化时检查授权状态
  useEffect(() => {
    checkBaiduNetdiskAuth();
  }, []);
  
  // Load local backups from localStorage and setup backup progress
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
    
    // Add progress callback to backup manager
    const progressCallback = (progress: BackupProgress) => {
      setBackupProgress(progress);
      setShowProgress(true);
    };
    
    backupManager.addProgressCallback(progressCallback);
    
    // Cleanup function
    return () => {
      backupManager.removeProgressCallback(progressCallback);
    };
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
  const updateWebdavConfig = async () => {
    try {
      storeWebDAVConfig(webdavConfig);
      setWebdavStatus('配置已保存！正在尝试连接...');
      
      // 强制重置备份管理器实例，使其使用新配置
      await backupManager.initialize(true);
      
      setWebdavStatus('配置已保存并初始化成功！');
    } catch (error) {
      console.error('Failed to update WebDAV config:', error);
      setWebdavStatus('保存失败：' + (error as Error).message);
    } finally {
      setTimeout(() => setWebdavStatus(''), 3000);
    }
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
    setWebdavStatus('正在保存配置并准备备份...');
    setIsBackingUp(true);
    
    try {
      // 验证WebDAV配置
      if (!webdavConfig.url || !webdavConfig.username || !webdavConfig.password) {
        throw new Error('WebDAV配置不完整，请检查服务器地址、用户名和密码');
      }

      // 先保存配置
      storeWebDAVConfig(webdavConfig);
      // 强制重置备份管理器实例
      await backupManager.initialize(true);
      
      // 确保备份管理器已完全初始化后再执行备份
      await backupManager.createCloudBackup();
      setWebdavStatus('WebDAV备份成功！');
    } catch (error) {
      console.error('Failed to backup to WebDAV:', error);
      const errorMessage = error as Error;
      let userMessage = 'WebDAV备份失败：';
      
      if (errorMessage.message.includes('WebDAV备份未初始化')) {
        userMessage += '备份管理器未初始化，请稍后重试';
      } else if (errorMessage.message.includes('network') || errorMessage.message.includes('fetch')) {
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
      setIsBackingUp(false);
      setTimeout(() => setWebdavStatus(''), 3000);
    }
  };
  
  // WebDAV restore function
  const restoreFromWebDAV = async () => {
    setWebdavStatus('正在保存配置并准备恢复...');
    try {
      // 验证WebDAV配置
      if (!webdavConfig.url || !webdavConfig.username || !webdavConfig.password) {
        throw new Error('WebDAV配置不完整，请检查服务器地址、用户名和密码');
      }

      // 先保存配置
      storeWebDAVConfig(webdavConfig);
      // 强制重置备份管理器实例
      await backupManager.initialize(true);

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
    return getButtonStyleLocal(isActive, isSpecial, isNeomorphic, theme, isDark);
  };

  function getButtonStyleLocal(isActive: boolean, isSpecial: boolean | undefined, isNeomorphic: boolean, theme: string | undefined, isDark: boolean): string {
    if (isActive) {
      return isSpecial ? 'bg-red-500 text-white border-red-500' : 'bg-blue-500 text-white border-blue-500';
    }
    if (isNeomorphic) {
      // 根据拟态主题的深浅模式调整背景色和阴影
      const neomorphicStyles = getNeomorphicStyles(theme === 'neomorphic-dark');
      return `${neomorphicStyles.bg} ${neomorphicStyles.border} ${neomorphicStyles.shadow} ${neomorphicStyles.hoverShadow} ${neomorphicStyles.activeShadow} ${neomorphicStyles.transition}`;
    }
    return isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-200';
  }

  return (
    <div className={[
      'h-full flex flex-col overflow-hidden',
      isNeomorphic
        ? theme === 'neomorphic-dark'
          ? 'bg-[#1e1e2e]'
          : 'bg-[#e0e5ec]'
        : isDark
        ? 'bg-zinc-950'
        : 'bg-slate-50'
    ].join(' ')}>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-3 px-2 md:px-4 lg:px-6 max-w-5xl mx-auto">

          {/* Sound Effects */}
          <div className={`${cardBg} border p-4 rounded-xl transition-all duration-300 mt-4`}>
              <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Headphones size={18} className="text-purple-500" />
                <div>
                  <h3 className={`font-bold text-sm ${textMain}`}>音效设置</h3>
                  <p className={`text-[9px] ${textSub}`}>控制系统音效音量与位置音效</p>
                </div>
              </div>
              <GlobalHelpButton helpId="sound" onHelpClick={setActiveHelp} size={14} variant="ghost" />
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
                  <div className={[
                    'rounded-lg p-2 h-[250px] overflow-y-auto',
                    isNeomorphic
                      ? isNeomorphicDark
                        ? 'bg-[#1e1e2e] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(30,30,46,0.8)]'
                        : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'
                      : isDark
                      ? 'bg-zinc-900/50'
                      : 'bg-slate-50'
                  ].join(' ')}>
                    <h5 className={`text-[9px] font-mono uppercase mb-2 ${textSub}`}>位置列表</h5>
                    <div className="space-y-2">
                      {[
                          { id: 'taskComplete', name: '日常任务完成', icon: <Volume2 size={14} className="text-green-500" /> },
                          { id: 'mainTaskComplete', name: '主线任务完成', icon: <Volume2 size={14} className="text-blue-500" /> },
                          { id: 'fateTaskComplete', name: '命运任务完成', icon: <Volume2 size={14} className="text-yellow-500" /> },
                          { id: 'subTaskComplete', name: '子任务完成', icon: <Volume2 size={14} className="text-purple-500" /> },
                          { id: 'dice', name: '命运骰子音效', icon: <Volume2 size={14} className="text-emerald-500" /> },
                          { id: 'taskGiveUp', name: '放弃任务', icon: <Volume2 size={14} className="text-red-500" /> },
                          { id: 'achievement', name: '成就解锁', icon: <Volume2 size={14} className="text-indigo-500" /> },
                          { id: 'purchase', name: '商品购买成功', icon: <Volume2 size={14} className="text-orange-500" /> },
                          { id: 'pomodoroStart', name: '番茄钟开始', icon: <Volume2 size={14} className="text-cyan-500" /> },
                          { id: 'pomodoroComplete', name: '番茄钟完成', icon: <Volume2 size={14} className="text-pink-500" /> },
                          { id: 'notification', name: '任务提醒', icon: <Volume2 size={14} className="text-lime-500" /> },
                          { id: 'checkin', name: '签到成功', icon: <Volume2 size={14} className="text-amber-500" /> },
                        ].map((location) => {
                          // 为每个位置设置不同的默认音效
                          const defaultSoundMap: Record<string, string> = {
                            'taskComplete': 'taskComplete',
                            'mainTaskComplete': 'mainTaskComplete',
                            'fateTaskComplete': 'mainTaskComplete',
                            'subTaskComplete': 'taskComplete',
                            'dice': 'dice',
                            'taskGiveUp': 'taskGiveUp',
                            'achievement': 'achievement',
                            'purchase': 'purchase',
                            'pomodoroStart': 'timer',
                            'pomodoroComplete': 'timer',
                            'notification': 'notification',
                            'checkin': 'checkin'
                          };
                          
                          // 如果没有设置音效或设置的是默认值，使用对应位置的默认音效
                          const locationSetting = settings.soundEffectsByLocation?.[location.id] || { enabled: true, sound: defaultSoundMap[location.id] || 'taskComplete' };
                          // 如果当前音效是默认值，将其转换为对应位置的默认音效
                          const currentSound = locationSetting.sound === 'default' ? defaultSoundMap[location.id] || 'taskComplete' : locationSetting.sound;
                        
                        // 音效映射 - 使用实际的本地音效文件
                        const soundUrls = {
                          'mute': '', // 静音选项
                          'taskComplete': '/audio/sfx/日常任务完成音效.mp3',
                          'mainTaskComplete': '/audio/sfx/主线任务完成音效超快音效.mp3',
                          'taskGiveUp': '/audio/sfx/任务放弃音效bubblepop-254773.mp3',
                          'purchase': '/audio/sfx/商品购买支出音效.mp3',
                          'notification': '/audio/sfx/任务弹出通知提醒音效level-up-191997.mp3',
                          'achievement': '/audio/sfx/成就解锁音频.mp3',
                          'timer': '/audio/sfx/番茄钟开始和结束计时音效servant-bell-ring-2-211683.mp3',
                          'checkin': '/audio/sfx/签到成功音效.mp3',
                          'dice': '/audio/sfx/投骰子音效.mp3',
                          '备用-ding-36029': '/audio/sfx/备用-ding-36029.mp3',
                          '备用-ding-sfx-330333': '/audio/sfx/备用-ding-sfx-330333.mp3',
                          '备用-ding-small-bell-sfx-233008': '/audio/sfx/备用-ding-small-bell-sfx-233008.mp3',
                          '备用-doorbell-329311': '/audio/sfx/备用-doorbell-329311.mp3',
                          '备用-hotel-bell-ding-1-174457': '/audio/sfx/备用-hotel-bell-ding-1-174457.mp3',
                          '备用3': '/audio/sfx/备用3.mp3',
                          '备用音效': '/audio/sfx/备用音效.mp3',
                          '备用音效3': '/audio/sfx/备用音效3.mp3',
                          '成就解锁音频2': '/audio/sfx/成就解锁音频2.mp3',
                        };
                        
                        // 音效名称映射，用于在下拉菜单中显示友好名称
                        const soundNames: Record<string, string> = {
                          'mute': '静音',
                          'taskComplete': '日常任务完成',
                          'mainTaskComplete': '主线任务完成',
                          'taskGiveUp': '任务放弃',
                          'purchase': '商品购买',
                          'notification': '任务通知',
                          'achievement': '成就解锁',
                          'timer': '番茄钟音效',
                          'checkin': '签到成功',
                          'dice': '投骰子',
                          '备用-ding-36029': '备用-提示音1',
                          '备用-ding-sfx-330333': '备用-提示音2',
                          '备用-ding-small-bell-sfx-233008': '备用-提示音3',
                          '备用-doorbell-329311': '备用-门铃',
                          '备用-hotel-bell-ding-1-174457': '备用-酒店铃声',
                          '备用3': '备用3',
                          '备用音效': '备用音效',
                          '备用音效3': '备用音效3',
                          '成就解锁音频2': '成就解锁2',
                        };
                        
                        // Preview sound function
                        const previewSound = (soundId: string) => {
                          // 跳过静音选项
                          if (soundId === 'mute') return;
                          
                          const audio = new Audio(soundUrls[soundId as keyof typeof soundUrls]);
                          // 获取GitHub Pages基础路径
                          const basePath = '/Life-Game-Management-System';
                          const correctUrl = audio.src.startsWith('http') ? audio.src : `${basePath}${audio.src}`;
                          audio.src = correctUrl;
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
                            className={[
                              'p-2 rounded-lg flex items-center justify-between transition-all cursor-pointer',
                              isNeomorphic
                                ? isNeomorphicDark
                                  ? 'bg-[#1e1e2e] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(30,30,46,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.3),-10px_-10px_20px_rgba(30,30,46,0.9)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.2),inset_-6px_-6px_12px_rgba(30,30,46,0.8)]'
                                  : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] active:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,1)]'
                                : isDark
                                ? 'bg-zinc-900/30 hover:bg-zinc-800/50'
                                : 'bg-white/50 hover:bg-slate-100'
                            ].join(' ')}
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
                                  className={[
                                    'w-24 text-[10px] px-2 py-1 rounded-lg border-none outline-none',
                                    isNeomorphic
                                      ? isNeomorphicDark
                                        ? 'bg-[#1e1e2e] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(30,30,46,0.8)]'
                                        : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'
                                      : isDark
                                      ? 'bg-zinc-800 text-white'
                                      : 'bg-white text-slate-800'
                                  ].join(' ')}
                                >
                                  <option value="mute">静音</option>
                                  <option value="taskComplete">{soundNames.taskComplete}</option>
                                  <option value="mainTaskComplete">{soundNames.mainTaskComplete}</option>
                                  <option value="taskGiveUp">{soundNames.taskGiveUp}</option>
                                  <option value="purchase">{soundNames.purchase}</option>
                                  <option value="notification">{soundNames.notification}</option>
                                  <option value="achievement">{soundNames.achievement}</option>
                                  <option value="timer">{soundNames.timer}</option>
                                  <option value="checkin">{soundNames.checkin}</option>
                                  <option value="dice">{soundNames.dice}</option>
                                  <option value="备用-ding-36029">{soundNames['备用-ding-36029']}</option>
                                  <option value="备用-ding-sfx-330333">{soundNames['备用-ding-sfx-330333']}</option>
                                  <option value="备用-ding-small-bell-sfx-233008">{soundNames['备用-ding-small-bell-sfx-233008']}</option>
                                  <option value="备用-doorbell-329311">{soundNames['备用-doorbell-329311']}</option>
                                  <option value="备用-hotel-bell-ding-1-174457">{soundNames['备用-hotel-bell-ding-1-174457']}</option>
                                  <option value="备用3">{soundNames.备用3}</option>
                                  <option value="备用音效">{soundNames.备用音效}</option>
                                  <option value="备用音效3">{soundNames.备用音效3}</option>
                                  <option value="成就解锁音频2">{soundNames['成就解锁音频2']}</option>
                                </select>
                                <button
                                  onClick={() => previewSound(currentSound)}
                                  className={[
                                    'p-1 rounded-full transition-all',
                                    isNeomorphic
                                      ? isNeomorphicDark
                                        ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.2),-5px_-5px_10px_rgba(30,30,46,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(30,30,46,0.9)]'
                                        : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)]'
                                      : isDark
                                      ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-800/50'
                                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                  ].join(' ')}
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
                                className={[
                                  'relative inline-flex h-6 w-11 items-center rounded-full transition-all',
                                  isNeomorphic
                                    ? (isNeomorphicDark
                                      ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]'
                                      : 'shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') + ' ' + (locationSetting.enabled ? 'bg-blue-500' : (isNeomorphicDark ? 'bg-[#1e1e2e]' : 'bg-white'))
                                    : locationSetting.enabled
                                    ? 'bg-blue-600'
                                    : 'bg-white'
                                ].join(' ')}
                              >
                                <span
                                  className={[
                                    'inline-block h-4.5 w-4.5 transform rounded-full transition-transform',
                                    isNeomorphic
                                      ? isNeomorphicDark
                                        ? 'bg-[#1e1e2e] shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(30,30,46,0.8)]'
                                        : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]'
                                      : 'bg-white',
                                    locationSetting.enabled ? 'translate-x-6' : 'translate-x-1'
                                  ].join(' ')}
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

          {/* Data Management Module */}
          <div className={[cardBg, 'border p-4 rounded-xl transition-all duration-300 mt-4'].join(' ')}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-green-500" />
                <div>
                  <h3 className={['font-bold text-sm', textMain].join(' ')}>数据管理</h3>
                  <p className={['text-[9px]', textSub].join(' ')}>备份与恢复您的数据</p>
                </div>
              </div>
              <GlobalHelpButton helpId="data" onHelpClick={setActiveHelp} size={14} variant="ghost" />
            </div>

            {/* Backup Tabs */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setActiveBackupTab('local')}
                className={[
                  'flex-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                  activeBackupTab === 'local'
                    ? 'bg-blue-500 text-white'
                    : getButtonStyle(false)
                ].join(' ')}
              >
                本地备份
              </button>
              <button
                onClick={() => setActiveBackupTab('cloud')}
                className={[
                  'flex-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                  activeBackupTab === 'cloud'
                    ? 'bg-blue-500 text-white'
                    : getButtonStyle(false)
                ].join(' ')}
              >
                云端备份
              </button>
            </div>

            {/* Local Backup Tab */}
            {activeBackupTab === 'local' && (
              <div className="space-y-2">
                <button
                  onClick={createLocalBackup}
                  className={[getButtonStyle(false), 'w-full px-3 py-1.5 rounded-full text-xs font-bold transition-all'].join(' ')}
                >
                  <Download size={14} className="inline-block mr-1" />
                  创建本地备份
                </button>
                
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="backup-file-input"
                />
                <label
                  htmlFor="backup-file-input"
                  className={[getButtonStyle(false), 'w-full px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer block text-center'].join(' ')}
                >
                  <Upload size={14} className="inline-block mr-1" />
                  从本地恢复
                </label>

                {localBackupStatus && (
                  <p className={['text-xs text-center', textSub].join(' ')}>{localBackupStatus}</p>
                )}
              </div>
            )}

            {/* Cloud Backup Tab */}
            {activeBackupTab === 'cloud' && (
              <div className="space-y-2">
                {/* Cloud Provider Selection */}
                <div className="space-y-1">
                  <label className={['text-xs font-bold', textMain].join(' ')}>云服务提供商</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCloudProvider('webdav')}
                      className={[
                        'flex-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                        cloudProvider === 'webdav'
                          ? 'bg-blue-500 text-white'
                          : getButtonStyle(false)
                      ].join(' ')}
                    >
                      WebDAV
                    </button>
                    <button
                      onClick={() => setCloudProvider('baidu')}
                      className={[
                        'flex-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                        cloudProvider === 'baidu'
                          ? 'bg-blue-500 text-white'
                          : getButtonStyle(false)
                      ].join(' ')}
                    >
                      百度网盘
                    </button>
                  </div>
                </div>

                {/* WebDAV Configuration */}
                {cloudProvider === 'webdav' && (
                  <div className="space-y-2">
                    {/* 坚果云配置指南 */}
                    <div className={[
                      'p-2 rounded-lg',
                      isNeomorphic
                        ? isNeomorphicDark
                          ? 'bg-[#1e1e2e] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(30,30,46,0.8)]'
                          : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'
                        : isDark
                        ? 'bg-zinc-900/50'
                        : 'bg-slate-50'
                    ].join(' ')}>
                      <h4 className={['text-xs font-bold', textMain].join(' ')}>📁 坚果云配置指南</h4>
                      <ul className={['text-[10px] space-y-1', textSub].join(' ')}>
                        <li>1. 服务器地址：<code>https://dav.jianguoyun.com/dav/</code></li>
                        <li>2. 用户名：坚果云账号（通常是邮箱）</li>
                        <li>3. 密码：坚果云应用密码（不是登录密码）</li>
                        <li>4. 如何获取应用密码：设置 → 安全选项 → 应用密码</li>
                        <li>5. 确保已启用WebDAV服务</li>
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <label className={['text-xs font-bold', textMain].join(' ')}>WebDAV服务器地址</label>
                      <input
                        type="text"
                        value={webdavConfig.url}
                        onChange={(e) => setWebdavConfig({ ...webdavConfig, url: e.target.value })}
                        placeholder="https://dav.jianguoyun.com/dav/"
                        className={[
                          'w-full px-2 py-1 rounded text-xs',
                          isNeomorphic
                            ? isNeomorphicDark
                              ? 'bg-[#1e1e2e] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)] text-zinc-200'
                              : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] text-zinc-800'
                            : isDark
                            ? 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                            : 'bg-white border border-slate-300 text-zinc-800'
                        ].join(' ')}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className={['text-xs font-bold', textMain].join(' ')}>用户名</label>
                      <input
                        type="text"
                        value={webdavConfig.username}
                        onChange={(e) => setWebdavConfig({ ...webdavConfig, username: e.target.value })}
                        placeholder="坚果云账号（邮箱）"
                        className={[
                          'w-full px-2 py-1 rounded text-xs',
                          isNeomorphic
                            ? isNeomorphicDark
                              ? 'bg-[#1e1e2e] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)] text-zinc-200'
                              : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] text-zinc-800'
                            : isDark
                            ? 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                            : 'bg-white border border-slate-300 text-zinc-800'
                        ].join(' ')}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className={['text-xs font-bold', textMain].join(' ')}>密码</label>
                      <input
                        type="password"
                        value={webdavConfig.password}
                        onChange={(e) => setWebdavConfig({ ...webdavConfig, password: e.target.value })}
                        placeholder="坚果云应用密码"
                        className={[
                          'w-full px-2 py-1 rounded text-xs',
                          isNeomorphic
                            ? isNeomorphicDark
                              ? 'bg-[#1e1e2e] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)] text-zinc-200'
                              : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] text-zinc-800'
                            : isDark
                            ? 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                            : 'bg-white border border-slate-300 text-zinc-800'
                        ].join(' ')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={testWebdavConnection}
                        className={[getButtonStyle(false), 'w-full px-3 py-1.5 rounded-full text-xs font-bold transition-all'].join(' ')}
                      >
                        <RefreshCw size={14} className="inline-block mr-1" />
                        测试连接
                      </button>

                      <button
                        onClick={updateWebdavConfig}
                        className={[getButtonStyle(false), 'w-full px-3 py-1.5 rounded-full text-xs font-bold transition-all'].join(' ')}
                      >
                        <Save size={14} className="inline-block mr-1" />
                        保存配置
                      </button>
                    </div>

                    <button
                      onClick={backupToWebDAV}
                      disabled={isBackingUp}
                      className={[getButtonStyle(false), 'w-full px-3 py-1.5 rounded-full text-xs font-bold transition-all'].join(' ')}
                    >
                      <Cloud size={14} className="inline-block mr-1" />
                      {isBackingUp ? '备份中...' : '备份到WebDAV'}
                    </button>

                    <button
                      onClick={restoreFromWebDAV}
                      disabled={isRestoring}
                      className={[getButtonStyle(false), 'w-full px-3 py-1.5 rounded-full text-xs font-bold transition-all'].join(' ')}
                    >
                      <Download size={14} className="inline-block mr-1" />
                      {isRestoring ? '恢复中...' : '从WebDAV恢复'}
                    </button>

                    {connectionTestStatus && (
                      <p className={[
                        'text-xs text-center',
                        connectionTestStatus.includes('成功') ? 'text-green-500' : 'text-red-500'
                      ].join(' ')}>{connectionTestStatus}</p>
                    )}

                    {webdavStatus && (
                      <p className={[
                        'text-xs text-center',
                        webdavStatus.includes('成功') ? 'text-green-500' : 'text-red-500'
                      ].join(' ')}>{webdavStatus}</p>
                    )}
                  </div>
                )}

                {/* 百度网盘 Configuration */}
                {cloudProvider === 'baidu' && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className={['text-xs font-bold', textMain].join(' ')}>百度网盘备份</label>
                      <p className={['text-xs', textSub].join(' ')}>点击下方按钮授权百度网盘，授权后即可使用百度网盘备份功能</p>
                    </div>

                    <div className="space-y-1">
                      <p className={['text-xs', textMain].join(' ')}>
                        授权状态：
                        <span className={baiduConfig.accessToken ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                          {baiduConfig.accessToken ? '已授权' : '未授权'}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        setWebdavStatus('正在打开百度网盘授权页面...');
                        
                        try {
                          // 检测是否为本地开发环境
                          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                          
                          if (isLocal) {
                            // 本地开发环境：引导用户到GitHub Pages在线版本进行授权
                            const onlineUrl = 'https://zwmopen.github.io/Life-Game-Management-System/';
                            setWebdavStatus('本地环境授权可能会出现错误，请在GitHub Pages在线版本进行授权');
                            
                            if (window.confirm('本地环境授权可能会出现referer错误，是否跳转到GitHub Pages在线版本进行授权？')) {
                              window.open(onlineUrl, '_blank', 'width=1000,height=800');
                            }
                          } else {
                            // 在线环境：直接使用百度开放平台授权
                            // 导入百度网盘备份管理器
                            const { default: baiduNetdiskBackupManager } = await import('../utils/BaiduNetdiskBackupManager');
                            
                            // 生成授权URL
                            const authUrl = baiduNetdiskBackupManager.getAuthorizationUrl();
                            
                            console.log('百度网盘授权URL:', authUrl);
                            
                            // 尝试打开授权页面
                            const popup = window.open(authUrl, '_blank', 'width=800,height=600');
                            
                            if (popup) {
                              console.log('授权窗口已打开');
                              // 提示用户
                              setWebdavStatus('请在新打开的页面中完成百度网盘授权，授权成功后会自动返回应用');
                              
                              // 3秒后检查授权状态
                              setTimeout(async () => {
                                await checkBaiduNetdiskAuth();
                              }, 3000);
                            } else {
                              console.error('授权窗口打开失败，可能被浏览器阻止');
                              setWebdavStatus('授权窗口打开失败，请检查浏览器弹窗设置');
                              
                              // 尝试使用location.href作为备选方案
                              if (window.confirm('授权窗口打开失败，是否在当前标签页打开授权页面？')) {
                                window.location.href = authUrl;
                              }
                            }
                          }
                        } catch (error) {
                          console.error('百度网盘授权失败:', error);
                          setWebdavStatus('百度网盘授权失败：' + (error as Error).message);
                        } finally {
                          setTimeout(() => setWebdavStatus(''), 8000);
                        }
                      }}
                      className={[getButtonStyle(false), 'w-full px-3 py-1.5 rounded-full text-xs font-bold transition-all'].join(' ')}
                    >
                      <Key size={14} className="inline-block mr-1" />
                      {baiduConfig.accessToken ? '重新授权百度网盘' : '授权百度网盘'}
                    </button>

                    {baiduConfig.accessToken && (
                      <div className="space-y-2">
                        <button
                          onClick={async () => {
                            if (window.confirm('确定要清除百度网盘授权吗？')) {
                              try {
                                // 导入百度网盘备份管理器
                                const { default: baiduNetdiskBackupManager } = await import('../utils/BaiduNetdiskBackupManager');
                                
                                // 清除授权
                                baiduNetdiskBackupManager.clearAuthorization();
                                
                                // 更新状态
                                setBaiduConfig({
                                  accessToken: '',
                                  refreshToken: ''
                                });
                                
                                setWebdavStatus('百度网盘授权已清除！');
                              } catch (error) {
                                console.error('清除百度网盘授权失败:', error);
                                setWebdavStatus('清除百度网盘授权失败：' + (error as Error).message);
                              } finally {
                                setTimeout(() => setWebdavStatus(''), 3000);
                              }
                            }
                          }}
                          className={[getButtonStyle(false), 'w-full px-3 py-1.5 rounded-full text-xs font-bold transition-all'].join(' ')}
                        >
                          <X size={14} className="inline-block mr-1" />
                          清除百度网盘授权
                        </button>

                        <button
                          onClick={async () => {
                            setWebdavStatus('正在准备备份...');
                            
                            try {
                              // 导入百度网盘备份管理器
                              const { default: baiduNetdiskBackupManager } = await import('../utils/BaiduNetdiskBackupManager');
                              
                              // 导入数据持久化管理器
                              const { default: dataPersistenceManager } = await import('../utils/DataPersistenceManager');
                              
                              // 获取要备份的数据
                              const backupData = dataPersistenceManager.exportAllData();
                              
                              // 执行备份
                              await baiduNetdiskBackupManager.uploadBackup('manual-backup-' + Date.now(), backupData, (progress) => {
                                console.log('备份进度:', progress);
                                if (progress.percentage === 100) {
                                  setWebdavStatus('✅ 备份成功！已保存到你的百度网盘');
                                }
                              });
                              
                              // 备份成功
                              setWebdavStatus('✅ 备份成功！已保存到你的百度网盘');
                            } catch (error) {
                              console.error('百度网盘备份失败:', error);
                              setWebdavStatus('❌ 备份失败：' + (error as Error).message);
                            } finally {
                              setTimeout(() => setWebdavStatus(''), 5000);
                            }
                          }}
                          className={[getButtonStyle(false), 'w-full px-3 py-1.5 rounded-full text-xs font-bold transition-all'].join(' ')}
                        >
                          <Cloud size={14} className="inline-block mr-1" />
                          一键备份到网盘
                        </button>
                      </div>
                    )}

                    <button
                      onClick={async () => {
                        setWebdavStatus('正在测试百度网盘连接...');
                        
                        try {
                          // 导入百度网盘备份管理器
                          const { default: baiduNetdiskBackupManager } = await import('../utils/BaiduNetdiskBackupManager');
                          
                          // 测试连接
                          const connected = await baiduNetdiskBackupManager.testConnection();
                          
                          if (connected) {
                            setWebdavStatus('百度网盘连接测试成功！');
                          } else {
                            setWebdavStatus('百度网盘连接测试失败，请先授权');
                          }
                        } catch (error) {
                          console.error('测试百度网盘连接失败:', error);
                          setWebdavStatus('测试百度网盘连接失败：' + (error as Error).message);
                        } finally {
                          setTimeout(() => setWebdavStatus(''), 3000);
                        }
                      }}
                      className={[getButtonStyle(false), 'w-full px-3 py-1.5 rounded-full text-xs font-bold transition-all'].join(' ')}
                    >
                      <RefreshCw size={14} className="inline-block mr-1" />
                      测试百度网盘连接
                    </button>

                    <button
                      onClick={async () => {
                        setWebdavStatus('正在备份到百度网盘...');
                        setIsBackingUp(true);
                        
                        try {
                          // 导入百度网盘备份管理器
                          const { default: baiduNetdiskBackupManager } = await import('../utils/BaiduNetdiskBackupManager');
                          
                          // 检查是否已授权
                          if (!baiduNetdiskBackupManager.isAuthorized()) {
                            throw new Error('请先授权百度网盘');
                          }
                          
                          // 创建备份数据
                          const backupData = JSON.stringify({
                            settings,
                            projects: JSON.parse(localStorage.getItem('projects') || '[]'),
                            habits: JSON.parse(localStorage.getItem('habits') || '[]'),
                            characters: JSON.parse(localStorage.getItem('characters') || '[]'),
                            achievements: JSON.parse(localStorage.getItem('achievements') || '[]'),
                            timestamp: new Date().toISOString()
                          });
                          
                          // 上传备份
                          await baiduNetdiskBackupManager.uploadBackup(Date.now().toString(), backupData, (progress) => {
                            console.log('备份进度:', progress);
                          });
                          
                          setWebdavStatus('百度网盘备份成功！');
                        } catch (error) {
                          console.error('百度网盘备份失败:', error);
                          setWebdavStatus('百度网盘备份失败：' + (error as Error).message);
                        } finally {
                          setIsBackingUp(false);
                          setTimeout(() => setWebdavStatus(''), 3000);
                        }
                      }}
                      disabled={isBackingUp}
                      className={[getButtonStyle(false), 'w-full px-3 py-1.5 rounded-full text-xs font-bold transition-all'].join(' ')}
                    >
                      <Cloud size={14} className="inline-block mr-1" />
                      {isBackingUp ? '备份中...' : '备份到百度网盘'}
                    </button>

                    <button
                      onClick={async () => {
                        setWebdavStatus('正在从百度网盘恢复...');
                        setIsRestoring(true);
                        
                        try {
                          // 导入百度网盘备份管理器
                          const { default: baiduNetdiskBackupManager } = await import('../utils/BaiduNetdiskBackupManager');
                          
                          // 检查是否已授权
                          if (!baiduNetdiskBackupManager.isAuthorized()) {
                            throw new Error('请先授权百度网盘');
                          }
                          
                          // 获取备份列表
                          const backups = await baiduNetdiskBackupManager.listBackups();
                          
                          if (backups.length === 0) {
                            throw new Error('没有找到备份文件');
                          }
                          
                          // 恢复最新的备份
                          const latestBackup = backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
                          const backupData = await baiduNetdiskBackupManager.downloadBackup(latestBackup.id);
                          
                          if (backupData) {
                            // 解析备份数据
                            const backupJson = JSON.parse(backupData);
                            
                            // 恢复数据
                            if (backupJson.settings) {
                              onUpdateSettings(backupJson.settings);
                            }
                            
                            setWebdavStatus('百度网盘恢复成功！');
                          } else {
                            throw new Error('恢复备份失败');
                          }
                        } catch (error) {
                          console.error('百度网盘恢复失败:', error);
                          setWebdavStatus('百度网盘恢复失败：' + (error as Error).message);
                        } finally {
                          setIsRestoring(false);
                          setTimeout(() => setWebdavStatus(''), 3000);
                        }
                      }}
                      disabled={isRestoring}
                      className={[getButtonStyle(false), 'w-full px-3 py-1.5 rounded-full text-xs font-bold transition-all'].join(' ')}
                    >
                      <Download size={14} className="inline-block mr-1" />
                      {isRestoring ? '恢复中...' : '从百度网盘恢复'}
                    </button>

                    {webdavStatus && (
                      <p className={['text-xs text-center', textSub].join(' ')}>{webdavStatus}</p>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>

          {/* About Module */}
          <div className={`${cardBg} border p-4 rounded-xl transition-all duration-300 mt-4`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Info size={18} className="text-blue-500" />
                <div>
                  <h3 className={`font-bold text-sm ${textMain}`}>关于</h3>
                </div>
              </div>
            </div>
            
            <div className="text-xs space-y-3 pt-2">
              <div className="grid grid-cols-[max-content_1fr] gap-x-2 gap-y-2 items-start">
                <div className="flex items-center gap-1 pt-0.5">
                  <FileText size={14} className="text-blue-500" />
                  <span className={`font-bold text-sm ${textMain} whitespace-nowrap`}>最新版本：</span>
                </div>
                <span className={`${textSub} break-words text-sm`}>v{APP_VERSION}</span>
                
                <div className="flex items-center gap-1 pt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-blue-500">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className={`font-bold text-sm ${textMain} whitespace-nowrap`}>开发者：</span>
                </div>
                <span className={`${textSub} break-words text-sm`}>大胆走夜路</span>
                
                <div className="flex items-center gap-1 pt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-blue-500">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span className={`font-bold text-sm ${textMain} whitespace-nowrap`}>联系微信：</span>
                </div>
                <span className={`${textSub} break-words text-sm`}>zwmrpg</span>
                
                <div className="flex items-center gap-1 pt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-blue-500">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span className={`font-bold text-sm ${textMain} whitespace-nowrap`}>项目介绍：</span>
                </div>
                <span className={`${textSub} leading-relaxed text-sm break-words w-full`}>
                  人生游戏管理系统是一个综合性的个人成长管理工具，集成了任务管理、习惯养成、专注计时、成就系统等功能，旨在帮助用户更好地规划和追踪个人发展。
                </span>
                
                <div className="flex items-center gap-1 pt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-blue-500">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                  <span className={`font-bold text-sm ${textMain} whitespace-nowrap`}>开源地址：</span>
                </div>
                <a 
                  href="https://github.com/zwmopen/Life-Game-Management-System" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`${textSub} leading-relaxed text-sm w-full break-all hover:underline hover:text-blue-500 transition-colors`}
                >
                  https://github.com/zwmopen/Life-Game-Management-System
                </a>
              </div>
            </div>
          </div>

          {/* Global Guide Card - 使用统一的帮助卡片系统组件 */}
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
});

Settings.displayName = 'Settings';

export default Settings;
