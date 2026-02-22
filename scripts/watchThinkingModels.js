/**
 * 监听思维模型文件变化并自动合并
 * 当 data/thinking-models/ 目录下的文件发生变化时，自动运行合并脚本
 */
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const watchDir = 'data/thinking-models';
let mergeTimeout = null;

console.log(`开始监听 ${watchDir} 目录...`);
console.log('当文件变化时，将自动合并到 components/thinkingModels.json');
console.log('按 Ctrl+C 停止监听\n');

// 防抖合并函数
const runMerge = () => {
  if (mergeTimeout) {
    clearTimeout(mergeTimeout);
  }
  
  mergeTimeout = setTimeout(() => {
    console.log('\n检测到文件变化，正在合并...');
    exec('node scripts/mergeThinkingModels.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`合并失败: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`合并警告: ${stderr}`);
      }
      console.log(stdout);
    });
  }, 1000); // 1秒防抖
};

// 监听目录变化
fs.watch(watchDir, { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith('.json') && filename !== '_index.json') {
    console.log(`文件变化: ${filename}`);
    runMerge();
  }
});

// 初始合并一次
runMerge();
