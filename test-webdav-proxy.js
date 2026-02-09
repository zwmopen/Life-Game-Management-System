// 简单测试WebDAV代理服务器
import fetch from 'node-fetch';

// 测试配置
const config = {
    proxyUrl: 'http://localhost:3002/webdav',
    webdavUrl: 'https://dav.jianguoyun.com/dav',
    username: '2594707308@qq.com',
    password: 'aecne4vaypmn8zid'
};

// 生成测试数据
function generateTestData() {
    return {
        settings: { bgMusicVolume: 0.5 },
        projects: [{ id: 1, name: '测试项目' }],
        habits: [{ id: 1, name: '测试习惯' }],
        timestamp: new Date().toISOString()
    };
}

// 测试连接
async function testConnection() {
    console.log('=== 测试WebDAV代理连接 ===');
    
    try {
        const authHeader = 'Basic ' + Buffer.from(config.username + ':' + config.password).toString('base64');
        console.log('使用认证头:', authHeader.substring(0, 20) + '...');
        
        const response = await fetch(config.proxyUrl, {
            method: 'PROPFIND',
            headers: {
                'Authorization': authHeader,
                'Depth': '1',
                'X-Target-Url': config.webdavUrl
            }
        });
        
        console.log('连接状态:', response.status, response.statusText);
        
        if (response.ok) {
            console.log('✅ 连接测试成功！');
            return true;
        } else {
            console.log('❌ 连接测试失败');
            return false;
        }
    } catch (error) {
        console.error('❌ 连接出错:', error.message);
        return false;
    }
}

// 测试上传
async function testUpload() {
    console.log('\n=== 测试文件上传 ===');
    
    try {
        const backupData = generateTestData();
        const backupJson = JSON.stringify(backupData, null, 2);
        
        const filename = `test-backup-${Date.now()}.json`;
        const url = config.proxyUrl + '/' + filename;
        
        console.log('上传文件:', filename);
        
        const authHeader = 'Basic ' + Buffer.from(config.username + ':' + config.password).toString('base64');
        console.log('使用认证头:', authHeader.substring(0, 20) + '...');
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'X-Target-Url': config.webdavUrl
            },
            body: backupJson
        });
        
        console.log('上传状态:', response.status, response.statusText);
        
        if (response.ok) {
            console.log('✅ 上传测试成功！');
            return { success: true, filename };
        } else {
            console.log('❌ 上传测试失败');
            return { success: false };
        }
    } catch (error) {
        console.error('❌ 上传出错:', error.message);
        return { success: false };
    }
}

// 测试下载
async function testDownload(filename) {
    console.log('\n=== 测试文件下载 ===');
    
    try {
        const url = config.proxyUrl + '/' + filename;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(config.username + ':' + config.password).toString('base64'),
                'X-Target-Url': config.webdavUrl
            }
        });
        
        console.log('下载状态:', response.status, response.statusText);
        
        if (response.ok) {
            const content = await response.text();
            console.log('✅ 下载测试成功！');
            console.log('文件大小:', content.length, '字符');
            return true;
        } else {
            console.log('❌ 下载测试失败');
            return false;
        }
    } catch (error) {
        console.error('❌ 下载出错:', error.message);
        return false;
    }
}

// 主测试
async function main() {
    console.log('🚀 开始WebDAV代理测试');
    console.log('=====================================');
    console.log('代理服务器:', config.proxyUrl);
    console.log('WebDAV服务器:', config.webdavUrl);
    console.log('=====================================');
    
    // 1. 测试连接
    const connSuccess = await testConnection();
    if (!connSuccess) return;
    
    // 2. 测试上传
    const uploadResult = await testUpload();
    if (!uploadResult.success) return;
    
    // 3. 测试下载
    const downloadSuccess = await testDownload(uploadResult.filename);
    
    console.log('\n=====================================');
    console.log('📋 测试结果');
    console.log('=====================================');
    console.log('连接测试:', connSuccess ? '✅ 成功' : '❌ 失败');
    console.log('上传测试:', uploadResult.success ? '✅ 成功' : '❌ 失败');
    console.log('下载测试:', downloadSuccess ? '✅ 成功' : '❌ 失败');
    console.log('=====================================');
    
    if (connSuccess && uploadResult.success && downloadSuccess) {
        console.log('\n🎉 所有测试都成功了！');
        console.log('坚果云WebDAV备份功能正常工作。');
    } else {
        console.log('\n❌ 部分测试失败，需要检查。');
    }
}

main().catch(console.error);
