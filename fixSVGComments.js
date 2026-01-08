import * as fs from 'fs';
import * as path from 'path';

// 读取文件内容
const filePath = './components/MissionControl.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 替换HTML注释为JSX注释
content = content.replace(/<!--/g, '{/*');
content = content.replace(/-->/g, '*/}');

// 写入修复后的文件
fs.writeFileSync(filePath, content, 'utf8');
console.log('已修复所有SVG注释，将HTML注释替换为JSX注释');
