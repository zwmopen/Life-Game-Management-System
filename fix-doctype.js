import fs from 'fs';
import path from 'path';

// 获取所有HTML文件
const htmlFiles = fs.readdirSync('thinking-models')
  .filter(file => file.endsWith('.html'))
  .map(file => path.join('thinking-models', file));

console.log('开始修复HTML文件中的DOCTYPE标签...');
console.log(`共找到 ${htmlFiles.length} 个HTML文件`);
console.log('='.repeat(50));

let fixedCount = 0;

htmlFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // 检查并修复DOCTYPE标签
    if (content.includes('<!执行O检查TY计划E html>')) {
      const fixedContent = content.replace(/<!执行O检查TY计划E html>/g, '<!DOCTYPE html>');
      fs.writeFileSync(file, fixedContent, 'utf8');
      fixedCount++;
      console.log(`✅ ${file} - 已修复DOCTYPE标签`);
    } else if (!content.includes('<!DOCTYPE html>')) {
      // 如果没有DOCTYPE标签，添加一个
      const fixedContent = '<!DOCTYPE html>\n' + content;
      fs.writeFileSync(file, fixedContent, 'utf8');
      fixedCount++;
      console.log(`✅ ${file} - 已添加DOCTYPE标签`);
    } else {
      console.log(`✅ ${file} - DOCTYPE标签正确`);
    }
  } catch (error) {
    console.log(`❌ ${file} - 处理错误: ${error.message}`);
  }
});

console.log('='.repeat(50));
console.log(`修复完成！`);
console.log(`总文件数: ${htmlFiles.length}`);
console.log(`已修复文件数: ${fixedCount}`);
