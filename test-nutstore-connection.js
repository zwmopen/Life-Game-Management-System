// 测试坚果云WebDAV连接
import WebDAVClient from './utils/webdavClient.js';

// 用户提供的坚果云凭证
const nutstoreConfig = {
  url: 'https://dav.jianguoyun.com/dav/',
  username: '2594707308@qq.com',
  password: 'aecne4vaypmn8zid',
  basePath: '/人生游戏管理系统'
};

async function testNutstoreConnection() {
  console.log('开始测试坚果云WebDAV连接...');
  console.log('服务器地址:', nutstoreConfig.url);
  console.log('用户名:', nutstoreConfig.username);
  console.log('基础路径:', nutstoreConfig.basePath);
  
  try {
    const client = new WebDAVClient(nutstoreConfig);
    
    console.log('\n测试连接...');
    await client.testConnection();
    console.log('✅ 连接测试成功！');
    
    console.log('\n测试列出根目录文件...');
    const files = await client.listFiles('/');
    console.log('✅ 列出文件成功！');
    console.log('根目录文件数量:', files.length);
    if (files.length > 0) {
      console.log('前5个文件:');
      files.slice(0, 5).forEach(file => {
        console.log(`  - ${file.name} (${file.isDirectory ? '目录' : '文件'}, ${file.size}字节)`);
      });
    }
    
    console.log('\n测试创建目录...');
    const testDir = '测试目录_' + Date.now();
    await client.createDirectory(testDir);
    console.log('✅ 创建目录成功！');
    
    console.log('\n测试上传文件...');
    const testFile = `${testDir}/test.txt`;
    await client.uploadFile(testFile, '这是一个测试文件');
    console.log('✅ 上传文件成功！');
    
    console.log('\n测试下载文件...');
    const content = await client.downloadFile(testFile);
    console.log('✅ 下载文件成功！');
    console.log('文件内容:', content);
    
    console.log('\n测试删除文件...');
    await client.deleteFile(testFile);
    console.log('✅ 删除文件成功！');
    
    console.log('\n测试删除目录...');
    await client.deleteFile(testDir);
    console.log('✅ 删除目录成功！');
    
    console.log('\n🎉 所有测试都成功了！坚果云WebDAV连接正常。');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  }
}

// 运行测试
testNutstoreConnection();
