import * as fs from 'fs';
import * as path from 'path';

// 读取文件内容
const filePath = './components/MissionControl.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 简单直接地替换所有CSS关键帧中的逗号分隔选择器
// 将 0%, 100% 替换为 0%\n100%
content = content.replace(/(\d+)%,\s*(\d+)%\s*{/g, '$1% {$2% {');

// 写入修复后的文件
fs.writeFileSync(filePath, content, 'utf8');
console.log('已修复CSS关键帧中的逗号分隔选择器');
