import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

// 设置目标文件夹路径
const audioFolder = './public/audio/pomodoro/bgm copy';

// 获取文件夹中的所有文件
const files = fs.readdirSync(audioFolder);

// 筛选出音频文件（支持mp3、wav、ogg等格式）
const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a'];
const audioFiles = files.filter(f => audioExtensions.includes(path.extname(f).toLowerCase()));

console.log(`找到 ${audioFiles.length} 个音频文件需要处理`);

// 处理每个音频文件
let processedCount = 0;
const totalCount = audioFiles.length;

audioFiles.forEach(audioFile => {
    const inputPath = path.join(audioFolder, audioFile);
    const outputPath = path.join(audioFolder, `temp_${audioFile}`);
    
    // 使用ffmpeg裁剪音频：去掉前2秒和后2秒
    // 简化命令：先跳过前2秒，然后使用duration-4来去掉后2秒
    const ffmpegCommand = `${ffmpegPath} -i "${inputPath}" -ss 2 -t "$((${ffmpegPath} -i "${inputPath}" 2>&1 | grep Duration | awk '{print $2}' | tr -d , | awk -F: '{print ($1*3600)+($2*60)+$3}')-4)" -c copy "${outputPath}"`;
    
    console.log(`处理: ${audioFile}`);
    
    // 执行ffmpeg命令
    exec(ffmpegCommand, (execErr) => {
        if (execErr) {
            console.error(`处理 ${audioFile} 错误:`, execErr.message);
            processedCount++;
            checkCompletion();
            return;
        }
        
        // 替换原文件
        fs.unlinkSync(inputPath);
        fs.renameSync(outputPath, inputPath);
        
        console.log(`完成: ${audioFile}`);
        processedCount++;
        checkCompletion();
    });
});

// 检查所有文件是否处理完成
function checkCompletion() {
    if (processedCount === totalCount) {
        console.log('所有音频文件处理完成！');
    }
}
