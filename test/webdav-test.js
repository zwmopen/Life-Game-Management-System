// test/webdav-test.js
import WebDAVBackup from '../utils/WebDAVBackup';

// 测试坚果云WebDAV备份功能
async function testWebDAVBackup() {
  console.log('[TEST] 开始测试坚果云WebDAV备份功能...');
  
  // 配置坚果云WebDAV参数
  const webdavConfig = {
    serverUrl: 'https://dav.jianguoyun.com/dav/',
    username: '2594707308@qq.com',
    password: 'aecne4vaypmn8zid',
    basePath: '/人生游戏管理系统',
    debug: true
  };
  
  const webdavClient = new WebDAVBackup(webdavConfig);
  
  try {
    // 1. 测试连接
    console.log('\n[TEST] 1. 测试连接...');
    let result = await webdavClient.testConnection();
    console.log(`连接测试结果:`, result);
    
    if (!result.success) {
      console.error('[TEST] 连接测试失败，终止后续测试');
      return;
    }
    
    // 2. 创建测试目录
    console.log('\n[TEST] 2. 创建测试目录...');
    const testDir = `/人生游戏管理系统/test_${Date.now()}`;
    result = await webdavClient.createDirectory(testDir);
    console.log(`创建目录结果:`, result);
    
    // 3. 上传测试文件
    console.log('\n[TEST] 3. 上传测试文件...');
    const testFilePath = `${testDir}/test_backup.json`;
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      message: '这是WebDAV备份功能的测试数据'
    };
    const jsonContent = JSON.stringify(testData, null, 2);
    
    result = await webdavClient.uploadFile(testFilePath, jsonContent);
    console.log(`上传文件结果:`, result);
    
    if (!result.success) {
      console.error('[TEST] 文件上传失败，终止后续测试');
      return;
    }
    
    // 4. 列出目录内容
    console.log('\n[TEST] 4. 列出目录内容...');
    result = await webdavClient.listDirectory(testDir);
    console.log(`目录列表结果:`, result);
    
    // 5. 下载测试文件
    console.log('\n[TEST] 5. 下载测试文件...');
    result = await webdavClient.downloadFile(testFilePath);
    console.log(`下载文件结果:`, result.success ? '成功' : result.message);
    if (result.success) {
      console.log('下载的文件内容:', result.content);
    }
    
    // 6. 测试备份功能
    console.log('\n[TEST] 6. 测试完整备份功能...');
    const appData = {
      settings: { theme: 'dark', language: 'zh-CN' },
      habits: [{ name: '早起', completed: 5 }],
      projects: [{ name: '学习计划', progress: 75 }]
    };
    
    result = await webdavClient.backupAppData(appData);
    console.log(`备份结果:`, result);
    
    // 7. 列出备份目录
    console.log('\n[TEST] 7. 列出备份目录...');
    if (result.success) {
      const backupDir = result.backupPath.substring(0, result.backupPath.lastIndexOf('/'));
      result = await webdavClient.listDirectory(backupDir);
      console.log(`备份目录列表:`, result);
    }
    
    console.log('\n[TEST] 所有测试完成！');
  } catch (error) {
    console.error('[TEST] 测试过程中发生错误:', error);
  }
}

// 运行测试
if (typeof window !== 'undefined') {
  // 在浏览器环境中
  window.runWebDAVTest = testWebDAVBackup;
  console.log('[TEST] WebDAV测试函数已注册，调用 window.runWebDAVTest() 运行测试');
} else {
  // 在Node.js环境中
  testWebDAVBackup();
}

// 示例：如何在React组件中使用的说明请参考文档