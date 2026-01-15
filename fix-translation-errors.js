import fs from 'fs';
import path from 'path';

// 获取所有HTML文件
const htmlFiles = fs.readdirSync('d:/AI编程/人生游戏管理系统/thinking-models')
  .filter(file => file.endsWith('.html'))
  .map(file => path.join('d:/AI编程/人生游戏管理系统/thinking-models', file));

console.log('开始修复所有HTML文件中的翻译错误...');
console.log(`共找到 ${htmlFiles.length} 个HTML文件`);
console.log('='.repeat(50));

let fixedCount = 0;
let skippedCount = 0;

// 定义错误模式和正确替换
const errorFixes = [
  // 已知的错误模式
  { error: 'SO检查我行动L EX检查H行动NGE 检查行动L检查UL我们', correct: 'SOCIAL EXCHANGE CALCULUS' },
  { error: '检查ollective 行动ction', correct: 'Collective Action' },
  { error: '检查ognitive 执行issonance', correct: 'Cognitive Dissonance' },
  { error: 'THE FR我检查T我ON OF 检查ONTR行动执行我检查T我ON', correct: 'THE FRICTION OF CONTRADICTION' },
  
  // 替换所有包含"检查"和"行动"的英文单词
  // 使用正则表达式替换
];

// 自定义替换函数，处理包含中文词汇的英文文本
function fixText(text) {
  let fixedText = text;
  
  // 1. 先处理已知的完整错误
  errorFixes.forEach(fix => {
    if (fixedText.includes(fix.error)) {
      fixedText = fixedText.replace(fix.error, fix.correct);
    }
  });
  
  // 2. 处理单词内的错误替换
  // 替换 "检查" 为 "c" 或 "C"
  fixedText = fixedText.replace(/检查/g, match => {
    // 检查前后字符，判断是大写还是小写
    const index = fixedText.indexOf(match);
    if (index === 0 || !/[a-zA-Z]/.test(fixedText[index - 1])) {
      return 'C'; // 句子开头或非字母后，使用大写C
    } else {
      return 'c'; // 字母后，使用小写c
    }
  });
  
  // 3. 替换 "执行" 为 "d" 或 "D"
  fixedText = fixedText.replace(/执行/g, match => {
    const index = fixedText.indexOf(match);
    if (index === 0 || !/[a-zA-Z]/.test(fixedText[index - 1])) {
      return 'D'; // 句子开头或非字母后，使用大写D
    } else {
      return 'd'; // 字母后，使用小写d
    }
  });
  
  // 4. 替换 "行动" 为 "A" 或 "a"
  fixedText = fixedText.replace(/行动/g, match => {
    const index = fixedText.indexOf(match);
    if (index === 0 || !/[a-zA-Z]/.test(fixedText[index - 1])) {
      return 'A'; // 句子开头或非字母后，使用大写A
    } else {
      return 'a'; // 字母后，使用小写a
    }
  });
  
  return fixedText;
}

htmlFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let updatedContent = fixText(content);
    
    // 检查是否有变化
    if (updatedContent !== content) {
      // 保存修改后的内容
      fs.writeFileSync(file, updatedContent, 'utf8');
      fixedCount++;
      console.log(`✅ ${file} - 已修复翻译错误`);
    } else {
      skippedCount++;
      console.log(`⏭️ ${file} - 未发现翻译错误，跳过`);
    }
  } catch (error) {
    console.log(`❌ ${file} - 处理错误: ${error.message}`);
  }
});

console.log('='.repeat(50));
console.log(`修复完成！`);
console.log(`总文件数: ${htmlFiles.length}`);
console.log(`已修复文件数: ${fixedCount}`);
console.log(`跳过文件数: ${skippedCount}`);
