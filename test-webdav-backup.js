// 测试坚果云WebDAV备份功能
import WebDAVClient from './utils/webdavClient.js';
import backupManager from './utils/BackupManager.js';
import { storeWebDAVConfig } from './utils/secureStorage.js';

// 模拟坚果云WebDAV配置
const webdavConfig = {
  url: 'https://dav.jianguoyun.com/dav/',
  username: 'test@example.com', // 替换为实际的坚果云账号
  password: 'test_password', // 替换为实际的坚果云应用密码
  basePath: '/'
};

// 存储配置
storeWebDAVConfig(webdavConfig);

// 测试WebDAV连接
async function testWebDAVConnection() {
  console.log('测试WebDAV连接...');
  try {
    const client = new WebDAVClient(webdavConfig);
    await client.testConnection();
    console.log('WebDAV连接测试成功！');
    return true;
  } catch (error) {
    console.error('WebDAV连接测试失败:', error.message);
    return false;
  }
}

// 测试备份到WebDAV
async function testBackupToWebDAV() {
  console.log('测试备份到WebDAV...');
  try {
    // 确保备份管理器已初始化
    await backupManager.initialize(true);
    
    // 创建备份
    const backupInfo = await backupManager.createCloudBackup('test-backup-' + Date.now());
    console.log('WebDAV备份成功！', backupInfo);
    return true;
  } catch (error) {
    console.error('WebDAV备份失败:', error.message);
    return false;
  }
}

// 测试从WebDAV恢复
async function testRestoreFromWebDAV() {
  console.log('测试从WebDAV恢复...');
  try {
    // 确保备份管理器已初始化
    await backupManager.initialize(true);
    
    // 获取备份列表
    const backups = await backupManager.getCloudBackupList();
    console.log('获取到的备份列表:', backups);
    
    if (backups.length > 0) {
      // 恢复最新的备份
      const latestBackup = backups[0];
      const restoreResult = await backupManager.restoreFromCloudBackup(latestBackup.id);
      console.log('WebDAV恢复成功！', restoreResult);
      return true;
    } else {
      console.log('没有找到备份文件');
      return false;
    }
  } catch (error) {
    console.error('WebDAV恢复失败:', error.message);
    return false;
  }
}

// 运行测试
async function runTests() {
  console.log('开始测试坚果云WebDAV备份功能...');
  
  // 测试连接
  const connectionSuccess = await testWebDAVConnection();
  if (!connectionSuccess) {
    console.log('连接测试失败，停止后续测试');
    return;
  }
  
  // 测试备份
  const backupSuccess = await testBackupToWebDAV();
  if (!backupSuccess) {
    console.log('备份测试失败，停止后续测试');
    return;
  }
  
  // 测试恢复
  const restoreSuccess = await testRestoreFromWebDAV();
  if (!restoreSuccess) {
    console.log('恢复测试失败');
    return;
  }
  
  console.log('所有测试都成功完成！');
}

runTests();
