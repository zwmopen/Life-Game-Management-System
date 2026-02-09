// 测试百度网盘备份功能
import baiduNetdiskBackupManager from './utils/BaiduNetdiskBackupManager.ts';
import backupManager from './utils/BackupManager.ts';

// 测试百度网盘授权
async function testBaiduAuthorization() {
  console.log('测试百度网盘授权...');
  try {
    // 检查是否已授权
    const isAuthorized = baiduNetdiskBackupManager.isAuthorized();
    console.log('当前授权状态:', isAuthorized);
    
    if (!isAuthorized) {
      // 获取授权URL
      const authUrl = baiduNetdiskBackupManager.getAuthorizationUrl();
      console.log('授权URL:', authUrl);
      console.log('请复制此URL到浏览器中打开并完成授权:', authUrl);
      return false;
    } else {
      console.log('百度网盘已授权！');
      return true;
    }
  } catch (error) {
    console.error('百度网盘授权测试失败:', error.message);
    return false;
  }
}

// 测试备份到百度网盘
async function testBackupToBaiduNetdisk() {
  console.log('测试备份到百度网盘...');
  try {
    // 确保备份管理器已初始化
    await backupManager.initialize(true);
    
    // 创建备份
    const backupInfo = await backupManager.createBaiduNetdiskBackup('test-backup-' + Date.now());
    console.log('百度网盘备份成功！', backupInfo);
    return true;
  } catch (error) {
    console.error('百度网盘备份失败:', error.message);
    return false;
  }
}

// 测试从百度网盘恢复
async function testRestoreFromBaiduNetdisk() {
  console.log('测试从百度网盘恢复...');
  try {
    // 确保备份管理器已初始化
    await backupManager.initialize(true);
    
    // 获取备份列表
    const backups = await baiduNetdiskBackupManager.listBackups();
    console.log('获取到的备份列表:', backups);
    
    if (backups.length > 0) {
      // 恢复最新的备份
      const latestBackup = backups[0];
      const restoreResult = await backupManager.restoreFromCloudBackup(latestBackup.id);
      console.log('百度网盘恢复成功！', restoreResult);
      return true;
    } else {
      console.log('没有找到备份文件');
      return false;
    }
  } catch (error) {
    console.error('百度网盘恢复失败:', error.message);
    return false;
  }
}

// 运行测试
async function runTests() {
  console.log('开始测试百度网盘备份功能...');
  
  // 测试授权
  const authSuccess = await testBaiduAuthorization();
  if (!authSuccess) {
    console.log('授权测试失败，停止后续测试');
    return;
  }
  
  // 测试备份
  const backupSuccess = await testBackupToBaiduNetdisk();
  if (!backupSuccess) {
    console.log('备份测试失败，停止后续测试');
    return;
  }
  
  // 测试恢复
  const restoreSuccess = await testRestoreFromBaiduNetdisk();
  if (!restoreSuccess) {
    console.log('恢复测试失败');
    return;
  }
  
  console.log('所有测试都成功完成！');
}

runTests();
