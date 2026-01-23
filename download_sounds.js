const fs = require('fs');
const https = require('https');
const path = require('path');

// 音频文件信息
const soundFiles = [
    {
        name: '任务完成音效',
        url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_41fead3bf0.mp3'
    },
    {
        name: '任务放弃音效',
        url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_41fead3bf0.mp3' // 使用相同的音效作为示例
    },
    {
        name: '成就解锁音效',
        url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_41fead3bf0.mp3'
    },
    {
        name: '金币收入音效',
        url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_41fead3bf0.mp3'
    },
    {
        name: '金币支出音效',
        url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_41fead3bf0.mp3'
    },
    {
        name: '骰子音效',
        url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_41fead3bf0.mp3'
    },
    {
        name: '购买音效',
        url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_41fead3bf0.mp3'
    }
];

// 目标目录
const targetDir = path.join(__dirname, 'public', 'audio', 'sfx');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// 下载单个音频文件
function downloadSound(sound) {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(targetDir, `${sound.name}.mp3`);
        const file = fs.createWriteStream(outputPath);
        
        console.log(`正在下载: ${sound.name}`);
        console.log(`URL: ${sound.url}`);
        
        const request = https.get(sound.url, (response) => {
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
        });
        
        request.on('error', (err) => {
            reject(err);
        });
    });
}

// 下载所有音频文件
async function downloadAllSounds() {
    console.log('开始下载音效文件...\n');
    
    for (const sound of soundFiles) {
        try {
            const result = await downloadSound(sound);
            console.log(`✓ 成功下载: ${result}`);
        } catch (error) {
            console.log(`✗ 下载失败: ${sound.name} - ${error.message}`);
        }
    }
    
    console.log('\n所有音效下载完成！');
}

// 执行下载
downloadAllSounds();