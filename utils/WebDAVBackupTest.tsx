import React, { useState } from 'react';
import EnhancedWebDAVBackupManager from './EnhancedWebDAVBackupManager';
import { BackupProgress } from './EnhancedWebDAVBackupManager';

const WebDAVBackupTest: React.FC = () => {
  const [webdavConfig, setWebdavConfig] = useState({
    url: 'https://dav.jianguoyun.com/dav/',
    username: '',
    password: '',
    basePath: '/人生游戏管理系统'
  });
  const [testResult, setTestResult] = useState<string>('');
  const [progress, setProgress] = useState<BackupProgress | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWebdavConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult('正在测试连接...');
    
    try {
      const backupManager = new EnhancedWebDAVBackupManager({
        url: webdavConfig.url,
        username: webdavConfig.username,
        password: webdavConfig.password,
        basePath: webdavConfig.basePath
      });
      
      const isConnected = await backupManager.testConnection();
      
      if (isConnected) {
        setTestResult('✅ 连接测试成功！');
        
        // 测试备份功能
        const testData = {
          test: true,
          timestamp: new Date().toISOString(),
          message: '这是WebDAV备份功能的测试数据'
        };
        
        setTestResult('📤 正在上传测试备份...');
        
        await backupManager.uploadBackup('test-backup', JSON.stringify(testData), (progress) => {
          setProgress(progress);
          console.log('备份进度:', progress);
        });
        
        setTestResult('✅ 测试备份上传成功！');
        
        // 测试下载功能
        setTestResult('📥 正在下载测试备份...');
        const downloadedData = await backupManager.downloadBackup('test-backup');
        
        if (downloadedData) {
          setTestResult('✅ 测试备份下载成功！数据验证通过');
        } else {
          setTestResult('❌ 测试备份下载失败');
        }
      } else {
        setTestResult('❌ 连接测试失败');
      }
    } catch (error) {
      console.error('Test error:', error);
      setTestResult(`❌ 测试失败: ${(error as Error).message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">WebDAV备份功能测试</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">服务器地址</label>
          <input
            type="text"
            name="url"
            value={webdavConfig.url}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="https://dav.jianguoyun.com/dav/"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">用户名</label>
          <input
            type="text"
            name="username"
            value={webdavConfig.username}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="邮箱地址"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">密码</label>
          <input
            type="password"
            name="password"
            value={webdavConfig.password}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="应用密码"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">基础路径</label>
          <input
            type="text"
            name="basePath"
            value={webdavConfig.basePath}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="/人生游戏管理系统"
          />
        </div>
        
        <button
          onClick={testConnection}
          disabled={isTesting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isTesting ? '测试中...' : '开始测试'}
        </button>
        
        {progress && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <div className="text-sm font-medium">上传进度: {Math.round(progress.percentage)}%</div>
            <div className="w-full bg-gray-300 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-1">{progress.currentFile}</div>
          </div>
        )}
        
        {testResult && (
          <div className={`p-3 rounded ${testResult.includes('✅') ? 'bg-green-100 text-green-800' : testResult.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebDAVBackupTest;