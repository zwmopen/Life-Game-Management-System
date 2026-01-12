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

// 获取音频时长的函数
function getAudioDuration(filePath) {
    return new Promise((resolve, reject) => {
        const command = `${ffmpegPath} -i "${filePath}" 2>&1`;
        exec(command, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            
            // 从stderr中提取时长信息
            const output = stderr;
            const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
            
            if (durationMatch) {
                const hours = parseInt(durationMatch[1]);
                const minutes = parseInt(durationMatch[2]);
                const seconds = parseFloat(durationMatch[3]);
                const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                resolve(totalSeconds);
            } else {
                reject(new Error('无法提取音频时长'));
            }
        });
    });
}

// 处理单个音频文件的函数
async function processAudioFile(audioFile) {
    const inputPath = path.join(audioFolder, audioFile);
    const outputPath = path.join(audioFolder, `temp_${audioFile}`);
    
    try {
        console.log(`处理: ${audioFile}`);
        
        // 获取音频时长
        const duration = await getAudioDuration(inputPath);
        
        // 检查音频时长是否足够裁剪
        if (duration <= 4) {
            console.log(`警告: ${audioFile} 时长不足4秒，跳过处理`);
            return;
        }
        
        // 计算裁剪参数：去掉前2秒和后2秒
        const startTime = 2; // 前2秒
        const endTime = duration - 2; // 总时长减2秒（去掉后2秒）
        const trimDuration = endTime - startTime; // 实际裁剪后的时长
        
        // 使用ffmpeg裁剪音频
        const ffmpegCommand = `${ffmpegPath} -i "${inputPath}" -ss ${startTime} -t ${trimDuration} -c copy "${outputPath}"`;
        
        await new Promise((resolve, reject) => {
            exec(ffmpegCommand, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        
        // 替换原文件
        fs.unlinkSync(inputPath);
        fs.renameSync(outputPath, inputPath);
        
        console.log(`完成: ${audioFile}`);
        
    } catch (error) {
        console.error(`处理 ${audioFile} 错误:`, error.message);
    }
}

// 批量处理所有音频文件
async function processAllAudioFiles() {
    for (const audioFile of audioFiles) {
        await processAudioFile(audioFile);
        processedCount++;
    }
    
    console.log('所有音频文件处理完成！');
}

// 开始处理
processAllAudioFiles();
