import React, { useState, memo } from 'react';
import { Cloud, Save, Key, CloudDownload, RefreshCw } from 'lucide-react';
import { Theme } from '../../types';
import { getNeomorphicStyles, getCardBgStyle, getTextStyle } from '../../utils/styleHelpers';
import WebDAVClient, { WebDAVConfig } from '../../utils/webdavClient';
import { retrieveWebDAVConfig, storeWebDAVConfig } from '../../utils/secureStorage';
import backupManager from '../../utils/BackupManager';
import { BackupProgress } from '../../utils/EnhancedWebDAVBackupManager';
import { GlobalHelpButton, helpContent } from '../HelpSystem';

/**
 * WebDAV设置组件的属性接口
 */
interface WebDAVSettingsProps {
  theme: Theme;
  onBackupProgress?: (progress: BackupProgress | null) => void;
  onBackupStart?: () => void;
  onBackupEnd?: () => void;
}

/**
 * WebDAV设置组件
 * 用于配置和管理WebDAV云端备份
 */
const WebDAVSettings: React.FC<WebDAVSettingsProps> = memo(({ 
  theme, 
  onBackupProgress,
  onBackupStart,
  onBackupEnd 
}) => {
  const isDark = theme.includes('dark');
  const isNeomorphic = theme.startsWith('neomorphic');
  const isNeomorphicDark = theme === 'neomorphic-dark';
  const neomorphicStyles = getNeomorphicStyles(isNeomorphicDark);
  const cardBg = getCardBgStyle(isNeomorphic, theme, isDark);
  const textMain = getTextStyle(isDark, isNeomorphic, 'main');
  const textSub = getTextStyle(isDark, isNeomorphic, 'sub');

  const [webdavConfig, setWebdavConfig] = useState<WebDAVConfig>(() => {
    const savedConfig = retrieveWebDAVConfig();
    return {
      url: savedConfig.url,
      username: savedConfig.username,
      password: savedConfig.password,
      basePath: savedConfig.basePath || '',
    };
  });

  const [webdavStatus, setWebdavStatus] = useState<string>('');
  const [isWebdavConfigCollapsed, setIsWebdavConfigCollapsed] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [connectionTestStatus, setConnectionTestStatus] = useState<string>('');

  /**
   * 测试WebDAV连接
   */
  const testWebdavConnection = async () => {
    try {
      setConnectionTestStatus('正在测试连接...');
      const client = new WebDAVClient(webdavConfig);
      const result = await client.testConnection();
      if (result.success) {
        setConnectionTestStatus('✅ 连接成功！');
      } else {
        setConnectionTestStatus(`❌ 连接失败: ${result.message}`);
      }
    } catch (error) {
      setConnectionTestStatus(`❌ 连接失败: ${(error as Error).message}`);
    }
  };

  /**
   * 更新WebDAV配置
   */
  const updateWebdavConfig = async () => {
    try {
      storeWebDAVConfig(webdavConfig);
      setWebdavStatus('✅ 配置已保存');
      setTimeout(() => setWebdavStatus(''), 3000);
    } catch (error) {
      setWebdavStatus(`❌ 保存失败: ${(error as Error).message}`);
    }
  };

  /**
   * 备份到WebDAV
   */
  const backupToWebDAV = async () => {
    try {
      setIsBackingUp(true);
      onBackupStart?.();
      setWebdavStatus('正在备份...');

      const progressCallback = (progress: BackupProgress) => {
        onBackupProgress?.(progress);
      };

      await backupManager.createCloudBackup({
        config: webdavConfig,
        onProgress: progressCallback,
      });

      setWebdavStatus('✅ 备份成功！');
    } catch (error) {
      const errorMessage = error as Error;
      setWebdavStatus(`❌ 备份失败: ${errorMessage.message}`);
    } finally {
      setIsBackingUp(false);
      onBackupEnd?.();
      onBackupProgress?.(null);
    }
  };

  /**
   * 从WebDAV恢复
   */
  const restoreFromWebDAV = async () => {
    try {
      setIsRestoring(true);
      setWebdavStatus('正在恢复...');

      const backups = await backupManager.getCloudBackupList();
      if (backups.length === 0) {
        setWebdavStatus('❌ 没有找到备份文件');
        return;
      }

      const latestBackup = backups[0];
      const result = await backupManager.restoreFromCloudBackup(latestBackup.id);

      if (result.success) {
        setWebdavStatus('✅ 恢复成功！页面将刷新...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setWebdavStatus(`❌ 恢复失败: ${result.message}`);
      }
    } catch (error) {
      const errorMessage = error as Error;
      setWebdavStatus(`❌ 恢复失败: ${errorMessage.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className={`${cardBg} rounded-xl p-4 mb-4`}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsWebdavConfigCollapsed(!isWebdavConfigCollapsed)}
      >
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-500" />
          <h3 className={`font-medium ${textMain}`}>云端备份 (WebDAV)</h3>
        </div>
        <div className="flex items-center gap-2">
          <GlobalHelpButton content={helpContent.webdav} />
          <span className={textSub}>{isWebdavConfigCollapsed ? '展开' : '收起'}</span>
        </div>
      </div>

      {!isWebdavConfigCollapsed && (
        <div className="mt-4 space-y-4">
          <div>
            <label className={`block text-sm ${textSub} mb-1`}>服务器地址</label>
            <input
              type="text"
              value={webdavConfig.url}
              onChange={(e) => setWebdavConfig({ ...webdavConfig, url: e.target.value })}
              placeholder="https://dav.jianguoyun.com/dav/"
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm ${textSub} mb-1`}>用户名</label>
            <input
              type="text"
              value={webdavConfig.username}
              onChange={(e) => setWebdavConfig({ ...webdavConfig, username: e.target.value })}
              placeholder="邮箱或用户名"
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm ${textSub} mb-1`}>密码/应用密码</label>
            <input
              type="password"
              value={webdavConfig.password}
              onChange={(e) => setWebdavConfig({ ...webdavConfig, password: e.target.value })}
              placeholder="应用密码"
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm ${textSub} mb-1`}>备份目录路径</label>
            <input
              type="text"
              value={webdavConfig.basePath}
              onChange={(e) => setWebdavConfig({ ...webdavConfig, basePath: e.target.value })}
              placeholder="如: /人生游戏备份（留空则自动创建）"
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={testWebdavConnection}
              className={`px-4 py-2 rounded-lg ${
                isNeomorphic
                  ? neomorphicStyles.button
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              测试连接
            </button>
            <button
              onClick={updateWebdavConfig}
              className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
                isNeomorphic
                  ? neomorphicStyles.button
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              <Save className="w-4 h-4" />
              保存配置
            </button>
            <button
              onClick={backupToWebDAV}
              disabled={isBackingUp}
              className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
                isNeomorphic
                  ? neomorphicStyles.button
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              } ${isBackingUp ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Cloud className="w-4 h-4" />
              {isBackingUp ? '备份中...' : '备份到WebDAV'}
            </button>
            <button
              onClick={restoreFromWebDAV}
              disabled={isRestoring}
              className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
                isNeomorphic
                  ? neomorphicStyles.button
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              } ${isRestoring ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <CloudDownload className="w-4 h-4" />
              {isRestoring ? '恢复中...' : '从WebDAV恢复'}
            </button>
          </div>

          {(connectionTestStatus || webdavStatus) && (
            <div className={`text-sm p-2 rounded ${
              (connectionTestStatus || webdavStatus).includes('✅') 
                ? 'bg-green-100 text-green-700' 
                : (connectionTestStatus || webdavStatus).includes('❌')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
            }`}>
              {connectionTestStatus || webdavStatus}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

WebDAVSettings.displayName = 'WebDAVSettings';

export default WebDAVSettings;
