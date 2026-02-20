import React, { useState, useEffect, memo } from 'react';
import { Download, Trash2, Upload, RefreshCw, FileText, Search } from 'lucide-react';
import { Theme } from '../../types';
import { getNeomorphicStyles, getCardBgStyle, getTextStyle } from '../../utils/styleHelpers';
import { GlobalHelpButton, helpContent } from '../HelpSystem';

/**
 * 本地备份项的接口定义
 */
interface LocalBackup {
  id: string;
  name: string;
  date: string;
  size: string;
  status: 'success' | 'failed' | 'in_progress';
  type: 'manual' | 'auto';
}

/**
 * 本地备份管理组件的属性接口
 */
interface LocalBackupSettingsProps {
  theme: Theme;
  day?: number;
  balance?: number;
  xp?: number;
  checkInStreak?: number;
  transactions?: any[];
  reviews?: any[];
  onRestore?: () => void;
}

/**
 * 本地备份管理组件
 * 用于创建、管理和恢复本地备份
 */
const LocalBackupSettings: React.FC<LocalBackupSettingsProps> = memo(({
  theme,
  day = 1,
  balance = 59,
  xp = 10,
  checkInStreak = 1,
  transactions = [],
  reviews = [],
  onRestore
}) => {
  const isDark = theme.includes('dark');
  const isNeomorphic = theme.startsWith('neomorphic');
  const isNeomorphicDark = theme === 'neomorphic-dark';
  const neomorphicStyles = getNeomorphicStyles(isNeomorphicDark);
  const cardBg = getCardBgStyle(isNeomorphic, theme, isDark);
  const textMain = getTextStyle(isDark, isNeomorphic, 'main');
  const textSub = getTextStyle(isDark, isNeomorphic, 'sub');

  const [localBackups, setLocalBackups] = useState<LocalBackup[]>([]);
  const [localBackupStatus, setLocalBackupStatus] = useState<string>('');
  const [backupSearchQuery, setBackupSearchQuery] = useState<string>('');
  const [showBackupDetails, setShowBackupDetails] = useState<boolean>(true);

  /**
   * 加载本地备份列表
   */
  useEffect(() => {
    const loadLocalBackups = () => {
      const backupsJson = localStorage.getItem('localBackups');
      if (backupsJson) {
        try {
          const backups = JSON.parse(backupsJson);
          setLocalBackups(backups);
        } catch (e) {
          console.error('加载本地备份失败:', e);
        }
      }
    };
    loadLocalBackups();
  }, []);

  /**
   * 创建本地备份
   */
  const createLocalBackup = () => {
    const backupId = Date.now().toString();
    const backupName = `人生游戏备份_${new Date().toLocaleString('zh-CN').replace(/[\/:\.]/g, '-')}.json`;
    const newBackup: LocalBackup = {
      id: backupId,
      name: backupName,
      date: new Date().toLocaleString('zh-CN'),
      size: '计算中...',
      status: 'in_progress',
      type: 'manual'
    };

    const updatedBackups = [...localBackups, newBackup];
    setLocalBackups(updatedBackups);
    setLocalBackupStatus('正在创建备份...');

    try {
      const gameData = {
        day,
        balance,
        xp,
        checkInStreak,
        transactions,
        reviews,
        backupTime: new Date().toISOString(),
        version: '1.0.0'
      };

      const backupData = JSON.stringify(gameData, null, 2);
      const finalBackup: LocalBackup = {
        ...newBackup,
        size: `${(backupData.length / 1024).toFixed(2)} KB`,
        status: 'success'
      };

      const finalUpdatedBackups = updatedBackups.map(backup => 
        backup.id === backupId ? finalBackup : backup
      );
      setLocalBackups(finalUpdatedBackups);
      localStorage.setItem('localBackups', JSON.stringify(finalUpdatedBackups));

      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backupName;
      a.click();
      URL.revokeObjectURL(url);

      setLocalBackupStatus('✅ 备份创建成功！');
    } catch (error) {
      const failedBackup: LocalBackup = {
        ...newBackup,
        size: '0 KB',
        status: 'failed'
      };
      const failedUpdatedBackups = updatedBackups.map(backup => 
        backup.id === backupId ? failedBackup : backup
      );
      setLocalBackups(failedUpdatedBackups);
      setLocalBackupStatus(`❌ 备份失败: ${(error as Error).message}`);
    }
  };

  /**
   * 从本地备份恢复
   */
  const restoreFromLocalBackup = (backupId: string) => {
    try {
      const backupJson = localStorage.getItem('localBackups');
      if (backupJson) {
        const backups = JSON.parse(backupJson);
        const selectedBackup = backups.find((backup: LocalBackup) => backup.id === backupId);
        if (selectedBackup) {
          setLocalBackupStatus('请上传备份文件来恢复数据');
        }
      }
    } catch (error) {
      setLocalBackupStatus(`❌ 恢复失败: ${(error as Error).message}`);
    }
  };

  /**
   * 删除本地备份记录
   */
  const deleteLocalBackup = (backupId: string) => {
    try {
      const updatedBackups = localBackups.filter(backup => backup.id !== backupId);
      setLocalBackups(updatedBackups);
      localStorage.setItem('localBackups', JSON.stringify(updatedBackups));
      setLocalBackupStatus('✅ 备份记录已删除');
    } catch (error) {
      setLocalBackupStatus(`❌ 删除失败: ${(error as Error).message}`);
    }
  };

  /**
   * 处理文件上传
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        if (backupData.day !== undefined) {
          localStorage.setItem('gameDay', backupData.day.toString());
        }
        if (backupData.balance !== undefined) {
          localStorage.setItem('gameBalance', backupData.balance.toString());
        }
        if (backupData.xp !== undefined) {
          localStorage.setItem('gameXP', backupData.xp.toString());
        }
        setLocalBackupStatus('✅ 恢复成功！页面将刷新...');
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        setLocalBackupStatus(`❌ 文件解析失败: ${(error as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  /**
   * 过滤备份列表
   */
  const filteredBackups = localBackups.filter(backup =>
    backup.name.toLowerCase().includes(backupSearchQuery.toLowerCase())
  );

  return (
    <div className={`${cardBg} rounded-xl p-4 mb-4`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-500" />
          <h3 className={`font-medium ${textMain}`}>本地备份管理</h3>
        </div>
        <GlobalHelpButton content={helpContent.localBackup} />
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={createLocalBackup}
            className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
              isNeomorphic
                ? neomorphicStyles.button
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            <Download className="w-4 h-4" />
            创建本地备份
          </button>

          <label className={`px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer ${
            isNeomorphic
              ? neomorphicStyles.button
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}>
            <Upload className="w-4 h-4" />
            上传并恢复
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {localBackupStatus && (
          <div className={`text-sm p-2 rounded ${
            localBackupStatus.includes('✅') 
              ? 'bg-green-100 text-green-700' 
              : localBackupStatus.includes('❌')
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
          }`}>
            {localBackupStatus}
          </div>
        )}

        {localBackups.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`text-sm font-medium ${textMain}`}>备份历史</h4>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索备份..."
                    value={backupSearchQuery}
                    onChange={(e) => setBackupSearchQuery(e.target.value)}
                    className={`pl-8 pr-3 py-1 text-sm rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredBackups.map(backup => (
                <div
                  key={backup.id}
                  className={`p-3 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  } flex items-center justify-between`}
                >
                  <div>
                    <div className={`font-medium ${textMain}`}>{backup.name}</div>
                    <div className={`text-xs ${textSub}`}>
                      {backup.date} · {backup.size} · {backup.type === 'manual' ? '手动' : '自动'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => restoreFromLocalBackup(backup.id)}
                      className={`p-2 rounded-lg ${
                        isNeomorphic
                          ? neomorphicStyles.button
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                      title="恢复"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteLocalBackup(backup.id)}
                      className={`p-2 rounded-lg ${
                        isNeomorphic
                          ? neomorphicStyles.button
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

LocalBackupSettings.displayName = 'LocalBackupSettings';

export default LocalBackupSettings;
