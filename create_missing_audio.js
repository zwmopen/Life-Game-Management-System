const fs = require('fs');
const path = require('path');

// 音频目录路径
const audioDir = path.join(__dirname, 'public', 'audio', 'sfx');

// 确保目录存在
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
}

// 需要创建的音频文件列表
const requiredAudioFiles = [
    '任务完成音效.mp3',
    '任务放弃音效.mp3',
    '金币收入音效.mp3',
    '金币支出音效.mp3',
    '成就解锁音效.mp3',
    '骰子音效.mp3',
    '购买音效.mp3'
];

// 创建缺失的音频文件
requiredAudioFiles.forEach(fileName => {
    const filePath = path.join(audioDir, fileName);
    if (!fs.existsSync(filePath)) {
        // 创建一个空文件
        fs.writeFileSync(filePath, '');
        console.log(`创建了缺失的文件: ${fileName}`);
    } else {
        console.log(`文件已存在: ${fileName}`);
    }
});

console.log('\n检查完成！');
