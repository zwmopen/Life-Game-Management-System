import * as fs from 'fs';
import * as path from 'path';

// 读取文件内容
const filePath = './components/MissionControl.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 修复CSS关键帧中的逗号分隔选择器
// 匹配 @keyframes animationName { 0%, 100% { ... } }
const keyframePattern = /@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\}/g;

content = content.replace(keyframePattern, (match, animationName, keyframesContent) => {
  // 将逗号分隔的关键帧选择器拆分为单独的选择器
  let fixedKeyframes = keyframesContent;
  
  // 匹配 0%, 100% { ... }
  const commaSelectorPattern = /(\d+%),(\s*\d+%)\s*{([\s\S]*?)\}/g;
  fixedKeyframes = fixedKeyframes.replace(commaSelectorPattern, (match, selector1, selector2, styles) => {
    // 将 0%, 100% { ... } 拆分为 0% { ... }
    // 和 100% { ... }
    return `${selector1} {${styles}}${selector2} {${styles}}`;
  });
  
  return `@keyframes ${animationName} {${fixedKeyframes}}`;
});

// 写入修复后的文件
fs.writeFileSync(filePath, content, 'utf8');
console.log('已修复CSS关键帧中的逗号分隔选择器');
