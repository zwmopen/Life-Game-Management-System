import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// 设置ffmpeg.exe的直接路径
const ffmpegPath = './node_modules/ffmpeg-static/ffmpeg.exe';

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
    
    console.log(`处理: ${audioFile}`);
    
    // 使用ffmpeg的atrim滤镜直接裁剪音频：去掉前2秒和后2秒
    // 使用 -ss 2 跳过前2秒，然后使用 -af "atrim=end='duration-2'" 去掉后2秒
    const ffmpegCommand = `${ffmpegPath} -i "${inputPath}" -ss 2 -af "atrim=end='duration-2'" -c copy "${outputPath}"`;
    
    // 执行ffmpeg命令
    exec(ffmpegCommand, (execErr) => {
        if (execErr) {
            console.error(`处理 ${audioFile} 错误:`, execErr.message);
        } else {
            try {
                // 替换原文件
                fs.unlinkSync(inputPath);
                fs.renameSync(outputPath, inputPath);
                console.log(`完成: ${audioFile}`);
            } catch (fsErr) {
                console.error(`替换 ${audioFile} 文件时出错:`, fsErr.message);
            }
        }
        
        processedCount++;
        if (processedCount === totalCount) {
            console.log('所有音频文件处理完成！');
        }
    });
});
