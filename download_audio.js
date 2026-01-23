const fs = require('fs');
const path = require('path');
const https = require('https');

// 音频目录路径
const audioDir = path.join(__dirname, 'public', 'audio', 'sfx');

// 确保目录存在
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
}

// 定义需要下载的音效
const soundEffects = [
    { name: '购买音效', url: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3' },
    { name: '任务完成音效', url: 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3' },
    { name: '任务放弃音效', url: 'https://assets.mixkit.co/sfx/preview/mixkit-game-show-wrong-answer-buzz-950.mp3' },
    { name: '金币收入音效', url: 'https://assets.mixkit.co/sfx/preview/mixkit-coins-spinning-in-hands-1933.mp3' },
    { name: '成就解锁音效', url: 'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3' },
    { name: '骰子音效', url: 'https://assets.mixkit.co/sfx/preview/mixkit-dice-roll-6125.mp3' }
];

// 下载单个音效文件
function downloadSoundEffect(sound) {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(audioDir, `${sound.name}.mp3`);
        const file = fs.createWriteStream(outputPath);
        
        console.log(`正在下载: ${sound.name}`);
        
        https.get(sound.url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`请求失败: ${response.statusCode}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve(sound.name);
            });
            
            file.on('error', (err) => {
                fs.unlinkSync(outputPath); // 删除不完整的文件
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// 批量下载所有音效
async function downloadAllSounds() {
    console.log('开始下载音效文件...\n');
    
    for (const sound of soundEffects) {
        try {
            const name = await downloadSoundEffect(sound);
            console.log(`✓ 成功: ${name}`);
        } catch (error) {
            console.log(`✗ 失败: ${sound.name} - ${error.message}`);
        }
    }
    
    console.log('\n下载完成！');
}

// 执行下载
downloadAllSounds();