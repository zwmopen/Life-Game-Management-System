import * as fs from 'fs';
import * as path from 'path';

// 读取文件内容
const filePath = './components/MissionControl.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// 查找所有反引号，然后检查后面是否有HTML标签
const pattern = /`/g;
let match;
const matches = [];

while ((match = pattern.exec(content)) !== null) {
  // 查找反引号后面的内容
  const afterBacktick = content.slice(match.index + 1);
  
  // 检查后面是否紧跟着HTML标签
  const htmlTagMatch = afterBacktick.match(/^\s*<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/);
  
  if (htmlTagMatch) {
    // 计算行号
    const lines = content.slice(0, match.index).split('\n');
    const lineNumber = lines.length;
    
    // 获取上下文
    const start = Math.max(0, match.index - 50);
    const end = Math.min(content.length, match.index + 100);
    const context = content.slice(start, end);
    
    matches.push({
      line: lineNumber,
      context: context,
      position: match.index,
      htmlTag: htmlTagMatch[0]
    });
  }
}

console.log('找到以下可能的语法错误位置：');
matches.forEach((match, index) => {
  console.log(`\n${index + 1}. 行号: ${match.line}`);
  console.log(`   上下文: ${match.context}`);
  console.log(`   位置: ${match.position}`);
  console.log(`   HTML标签: ${match.htmlTag}`);
});

// 特别查找第6958-6965行附近的内容
console.log('\n\n=== 第6958-6965行附近的内容 ===');
const lines = content.split('\n');
for (let i = 6957; i <= 6965; i++) {
  if (lines[i]) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
