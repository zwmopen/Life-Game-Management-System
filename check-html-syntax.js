import fs from 'fs';
import path from 'path';
import { parse } from 'parse5';

// 获取所有HTML文件
const htmlFiles = fs.readdirSync('thinking-models')
  .filter(file => file.endsWith('.html'))
  .map(file => path.join('thinking-models', file));

console.log('开始检查HTML语法...');
console.log(`共找到 ${htmlFiles.length} 个HTML文件`);
console.log('='.repeat(50));

let errorCount = 0;
const errors = [];

htmlFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    parse(content);
    console.log(`✅ ${file} - 语法正确`);
  } catch (error) {
    errorCount++;
    errors.push({
      file: file,
      error: error.message
    });
    console.log(`❌ ${file} - 语法错误: ${error.message}`);
  }
});

console.log('='.repeat(50));
console.log(`检查完成！`);
console.log(`总文件数: ${htmlFiles.length}`);
console.log(`错误文件数: ${errorCount}`);

if (errors.length > 0) {
  console.log('\n详细错误信息:');
  errors.forEach((err, index) => {
    console.log(`${index + 1}. ${err.file}`);
    console.log(`   ${err.error}`);
  });
}
