/**
 * WebDAV 功能测试脚本
 * 用于验证坚果云WebDAV备份功能是否正常工作
 */

// 检查是否在浏览器环境中
if (typeof window !== 'undefined') {
  console.log('在浏览器环境中运行WebDAV测试...');
  
  // 等待页面加载完成后执行测试
  window.addEventListener('load', async () => {
    try {
      // 动态导入WebDAV工具类
      const { default: WebDAVBackup } = await import('../utils/WebDAVBackup.js');
      
      // 配置坚果云WebDAV参数
      const webdavConfig = {
        serverUrl: 'https://dav.jianguoyun.com/dav/',
        username: '2594707308@qq.com',
        password: 'aecne4vaypmn8zid',
        basePath: '/人生游戏管理系统',
        debug: true
      };
      
      console.log('初始化WebDAV客户端...');
      const webdavClient = new WebDAVBackup(webdavConfig);
      
      console.log('开始执行WebDAV连接测试...');
      const result = await webdavClient.testConnection();
      
      if (result.success) {
        console.log('✅ WebDAV连接测试成功!');
        console.log('消息:', result.message);
        
        // 测试创建目录
        console.log('\n正在测试创建目录...');
        const dirResult = await webdavClient.createDirectory('/人生游戏管理系统/test-dir');
        console.log(dirResult.message);
        
        // 测试上传简单文件
        console.log('\n正在测试文件上传...');
        const uploadResult = await webdavClient.uploadFile(
          '/人生游戏管理系统/test-dir/test-file.txt', 
          '这是一个测试文件，用于验证WebDAV功能。'
        );
        console.log(uploadResult.message);
        
        // 测试下载文件
        console.log('\n正在测试文件下载...');
        const downloadResult = await webdavClient.downloadFile('/人生游戏管理系统/test-dir/test-file.txt');
        if (downloadResult.success) {
          console.log('✅ 文件下载成功，内容:', downloadResult.content);
        } else {
          console.log('❌ 文件下载失败:', downloadResult.message);
        }
        
        console.log('\n🎉 所有WebDAV功能测试完成!');
      } else {
        console.error('❌ WebDAV连接测试失败:', result.message);
      }
    } catch (error) {
      console.error('❌ WebDAV测试过程中发生错误:', error);
    }
  });
} else {
  console.log('此脚本应在浏览器环境中运行');
}