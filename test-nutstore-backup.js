// 坚果云WebDAV备份测试脚本
const fetch = require('node-fetch');

// 坚果云WebDAV配置
const config = {
    webdavUrl: 'https://dav.jianguoyun.com/dav/',
    username: '2594707308@qq.com',
    password: 'aecne4vaypmn8zid'
};

// 生成测试数据
function generateTestData() {
    return {
        settings: {
            bgMusicVolume: 0.5,
            soundEffectVolume: 0.7,
            enableBgMusic: true,
            enableSoundEffects: true
        },
        projects: [
            { id: 1, name: '测试项目1', progress: 50 },
            { id: 2, name: '测试项目2', progress: 25 }
        ],
        habits: [
            { id: 1, name: '测试习惯1', streak: 5 },
            { id: 2, name: '测试习惯2', streak: 10 }
        ],
        characters: [
            { id: 1, name: '测试角色1', level: 10 }
        ],
        achievements: [
            { id: 1, name: '测试成就1', unlocked: true }
        ],
        timestamp: new Date().toISOString()
    };
}

// 测试WebDAV连接
async function testWebDAVConnection() {
    console.log('=== 测试WebDAV连接 ===');
    
    try {
        const response = await fetch('http://localhost:3002/webdav', {
            method: 'PROPFIND',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(config.username + ':' + config.password).toString('base64'),
                'Depth': '1',
                'X-Target-Url': config.webdavUrl
            }
        });
        
        console.log('连接测试状态:', response.status, response.statusText);
        
        if (response.ok) {
            console.log('✅ WebDAV连接测试成功！');
            return true;
        } else {
            console.log('❌ WebDAV连接测试失败');
            return false;
        }
    } catch (error) {
        console.error('❌ 连接测试出错:', error.message);
        return false;
    }
}

// 上传备份文件到WebDAV
async function uploadBackup() {
    console.log('\n=== 上传备份文件 ===');
    
    try {
        const backupData = generateTestData();
        const backupJson = JSON.stringify(backupData, null, 2);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `life-game-backup-${timestamp}.json`;
        
        console.log('生成备份文件:', filename);
        console.log('备份数据大小:', backupJson.length, '字符');
        
        const response = await fetch('http://localhost:3002/webdav/' + filename, {
            method: 'PUT',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(config.username + ':' + config.password).toString('base64'),
                'Content-Type': 'application/json',
                'X-Target-Url': config.webdavUrl
            },
            body: backupJson
        });
        
        console.log('上传状态:', response.status, response.statusText);
        
        if (response.ok) {
            console.log('✅ 备份文件上传成功！');
            return {
                success: true,
                filename: filename
            };
        } else {
            console.log('❌ 备份文件上传失败');
            return {
                success: false
            };
        }
    } catch (error) {
        console.error('❌ 上传过程出错:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// 列出WebDAV中的备份文件
async function listBackups() {
    console.log('\n=== 列出备份文件 ===');
    
    try {
        const response = await fetch('http://localhost:3002/webdav', {
            method: 'PROPFIND',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(config.username + ':' + config.password).toString('base64'),
                'Depth': '1',
                'X-Target-Url': config.webdavUrl
            }
        });
        
        if (response.ok) {
            const text = await response.text();
            console.log('✅ 获取文件列表成功');
            console.log('响应内容长度:', text.length, '字符');
            
            // 简单解析XML响应（使用正则表达式）
            console.log('响应内容预览:', text.substring(0, 500) + '...');
            
            // 使用正则表达式提取文件名
            const backupFiles = [];
            const hrefRegex = /<D:href>(.*?)<\/D:href>/g;
            let match;
            
            while ((match = hrefRegex.exec(text)) !== null) {
                const href = match[1];
                const filename = href.split('/').pop();
                if (filename && filename.includes('life-game-backup-') && filename.endsWith('.json')) {
                    backupFiles.push(filename);
                }
            }
            
            console.log('找到文件数量:', backupFiles.length);
            
            if (backupFiles.length > 0) {
                console.log('\n找到的备份文件:');
                backupFiles.forEach((file, index) => {
                    console.log(`${index + 1}. ${file}`);
                });
            } else {
                console.log('\n未找到备份文件');
            }
            
            return backupFiles;
        } else {
            console.log('❌ 获取文件列表失败:', response.status, response.statusText);
            return [];
        }
    } catch (error) {
        console.error('❌ 列出文件过程出错:', error.message);
        return [];
    }
}

// 下载备份文件测试
async function downloadBackup(filename) {
    console.log('\n=== 下载备份文件 ===');
    
    try {
        const response = await fetch('http://localhost:3002/webdav/' + filename, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(config.username + ':' + config.password).toString('base64'),
                'X-Target-Url': config.webdavUrl
            }
        });
        
        if (response.ok) {
            const content = await response.text();
            console.log('✅ 备份文件下载成功！');
            console.log('文件大小:', content.length, '字符');
            
            // 解析备份数据
            try {
                const backupData = JSON.parse(content);
                console.log('备份数据格式正确，包含以下数据:');
                console.log('- 设置:', Object.keys(backupData.settings || {}).length, '项');
                console.log('- 项目:', (backupData.projects || []).length, '个');
                console.log('- 习惯:', (backupData.habits || []).length, '个');
                console.log('- 角色:', (backupData.characters || []).length, '个');
                console.log('- 成就:', (backupData.achievements || []).length, '个');
            } catch {
                console.log('备份数据格式可能不正确');
            }
            
            return true;
        } else {
            console.log('❌ 备份文件下载失败:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ 下载过程出错:', error.message);
        return false;
    }
}

// 主测试函数
async function runTest() {
    console.log('🚀 开始坚果云WebDAV备份测试');
    console.log('=====================================');
    console.log('WebDAV服务器:', config.webdavUrl);
    console.log('用户名:', config.username);
    console.log('=====================================');
    
    // 1. 测试连接
    const connectionSuccess = await testWebDAVConnection();
    if (!connectionSuccess) {
        console.log('\n❌ 连接测试失败，停止后续测试');
        return;
    }
    
    // 2. 上传备份
    const uploadResult = await uploadBackup();
    if (!uploadResult.success) {
        console.log('\n❌ 上传测试失败，停止后续测试');
        return;
    }
    
    // 3. 列出备份文件
    const backupFiles = await listBackups();
    
    // 4. 下载测试
    if (uploadResult.filename) {
        await downloadBackup(uploadResult.filename);
    }
    
    console.log('\n=====================================');
    console.log('📋 测试完成报告');
    console.log('=====================================');
    console.log('连接测试:', connectionSuccess ? '✅ 成功' : '❌ 失败');
    console.log('上传测试:', uploadResult.success ? '✅ 成功' : '❌ 失败');
    console.log('文件列表:', backupFiles.length > 0 ? `✅ 找到 ${backupFiles.length} 个文件` : '❌ 未找到文件');
    console.log('=====================================');
    
    if (connectionSuccess && uploadResult.success && backupFiles.length > 0) {
        console.log('\n🎉 所有测试都成功了！坚果云WebDAV备份功能正常工作。');
        console.log('\n📁 备份文件已成功上传到坚果云');
        console.log('   - 文件名:', uploadResult.filename);
        console.log('   - 服务器:', config.webdavUrl);
    } else {
        console.log('\n❌ 测试未完全成功，需要检查配置或网络连接');
    }
}

// 运行测试
runTest().catch(console.error);
