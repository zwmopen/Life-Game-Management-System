import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前目录路径（ES模块方式）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 音效下载配置
const soundEffects = [
    {
        name: '购买音效',
        url: 'https://www.soundjay.com/button/sounds/button-09.mp3'
    },
    {
        name: '任务完成音效',
        url: 'https://www.soundjay.com/notification/sounds/notification-01.mp3'
    },
    {
        name: '任务放弃音效',
        url: 'https://www.soundjay.com/button/sounds/button-10.mp3'
    },
    {
        name: '成就解锁音效',
        url: 'https://www.soundjay.com/achievement/sounds/achievement-01.mp3'
    },
    {
        name: '金币收入音效',
        url: 'https://www.soundjay.com/misc/sounds/coins-1.mp3'
    },
    {
        name: '金币支出音效',
        url: 'https://www.soundjay.com/misc/sounds/coins-2.mp3'
    },
    {
        name: '骰子音效',
        url: 'https://www.soundjay.com/board/sounds/dice-1.mp3'
    }
];

// 下载目录
const downloadDir = path.join(__dirname, 'public', 'audio', 'sfx');

// 确保目录存在
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

// 下载单个音效文件
function downloadSoundEffect(sound) {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(downloadDir, `${sound.name}.mp3`);
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

// 下载所有音效
async function downloadAllSoundEffects() {
    console.log('开始下载音效文件...\n');
    
    for (const sound of soundEffects) {
        try {
            const name = await downloadSoundEffect(sound);
            console.log(`✓ 成功下载: ${name}`);
        } catch (error) {
            console.log(`✗ 下载失败: ${sound.name} - ${error.message}`);
        }
    }
    
    console.log('\n下载完成！');
    
    // 验证下载结果
    console.log('\n验证下载结果:');
    soundEffects.forEach(sound => {
        const filePath = path.join(downloadDir, `${sound.name}.mp3`);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.log(`${sound.name}.mp3: ${stats.size} 字节`);
        } else {
            console.log(`${sound.name}.mp3: 不存在`);
        }
    });
}

// 执行下载
downloadAllSoundEffects();