// 直接测试坚果云WebDAV（不通过代理）
import fetch from 'node-fetch';

// 坚果云配置
const config = {
    webdavUrl: 'https://dav.jianguoyun.com/dav/%e4%ba%ba%e7%94%9f%e6%b8%b8%e6%88%8f%e7%ae%a1%e7%90%86%e7%b3%bb%e7%bb%9f/',
    username: '2594707308@qq.com',
    password: 'aecne4vaypmn8zid'
};

// 生成认证头
const authHeader = 'Basic ' + Buffer.from(config.username + ':' + config.password).toString('base64');

// 测试连接并查看目录结构
async function testConnection() {
    console.log('=== 测试直接连接坚果云 ===');
    
    try {
        const response = await fetch(config.webdavUrl, {
            method: 'PROPFIND',
            headers: {
                'Authorization': authHeader,
                'Depth': '1'
            }
        });
        
        console.log('连接状态:', response.status, response.statusText);
        
        if (response.ok || response.status === 207) {
            console.log('✅ 连接测试成功！');
            
            // 显示响应内容
            try {
                const text = await response.text();
                console.log('响应内容:');
                console.log(text);
                
                // 解析目录结构
                const hrefRegex = /<d:href>(.*?)<\/d:href>/g;
                let match;
                const directories = [];
                
                while ((match = hrefRegex.exec(text)) !== null) {
                    const href = match[1];
                    if (href.endsWith('/')) {
                        directories.push(href);
                    }
                }
                
                console.log('\n找到的目录:');
                directories.forEach(dir => console.log('-', dir));
            } catch (error) {
                console.error('无法获取响应内容:', error.message);
            }
        } else {
            console.log('❌ 连接测试失败');
        }
    } catch (error) {
        console.error('❌ 连接出错:', error.message);
    }
}

// 测试上传
async function testUpload() {
    console.log('\n=== 测试直接上传到坚果云 ===');
    
    try {
        const testData = { test: 'data', timestamp: Date.now() };
        const testJson = JSON.stringify(testData, null, 2);
        
        const filename = `direct-test-${Date.now()}.json`;
        const url = config.webdavUrl + filename;
        
        console.log('上传文件:', filename);
        console.log('上传URL:', url);
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: testJson
        });
        
        console.log('上传状态:', response.status, response.statusText);
        
        if (response.ok) {
            console.log('✅ 上传测试成功！');
        } else {
            console.log('❌ 上传测试失败');
            
            // 获取错误详情
            try {
                const errorText = await response.text();
                console.log('错误详情:', errorText);
            } catch {
                console.log('无法获取错误详情');
            }
        }
    } catch (error) {
        console.error('❌ 上传出错:', error.message);
    }
}

// 主测试函数
async function runTest() {
    console.log('🚀 开始直接WebDAV测试');
    console.log('=====================================');
    console.log('WebDAV服务器:', config.webdavUrl);
    console.log('用户名:', config.username);
    console.log('=====================================');
    
    await testConnection();
    await testUpload();
    
    console.log('\n=====================================');
    console.log('测试完成');
    console.log('=====================================');
}

runTest().catch(console.error);
