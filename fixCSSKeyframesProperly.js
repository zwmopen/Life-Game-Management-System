import * as fs from 'fs';
import * as path from 'path';

// 读取文件内容
const filePath = './components/MissionControl.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 修复CSS关键帧中的逗号分隔选择器，确保正确处理样式块
// 匹配 0%, 100% { transform: scale(1); }
const pattern = /(\d+%),(\s*\d+%)\s*{([^{}]+?)\}/g;

content = content.replace(pattern, (match, selector1, selector2, styles) => {
  // 正确拆分：0%, 100% { ... } -> 0% { ... }
  // 100% { ... }
  return `${selector1} {${styles}}${selector2} {${styles}}`;
});

// 写入修复后的文件
fs.writeFileSync(filePath, content, 'utf8');
console.log('已正确修复CSS关键帧中的逗号分隔选择器');
