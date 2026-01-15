import fs from 'fs';
import path from 'path';

// 获取所有HTML文件
const htmlFiles = fs.readdirSync('thinking-models')
  .filter(file => file.endsWith('.html'))
  .map(file => path.join('thinking-models', file));

console.log('开始检查HTML文件的英文翻译情况...');
console.log(`共找到 ${htmlFiles.length} 个HTML文件`);
console.log('='.repeat(50));

// 匹配英文文本的正则表达式（排除代码标签和注释）
const englishRegex = /[A-Za-z][A-Za-z\s\-]{3,}/g;
const tagRegex = /<[^>]*>/gs; // 匹配所有HTML标签
const commentRegex = /<!--.*?-->/gs;
const codeTagRegex = /<code[^>]*>.*?<\/code>/gs;
const svgTagRegex = /<svg[^>]*>.*?<\/svg>/gs;
const styleTagRegex = /<style[^>]*>.*?<\/style>/gs;
const scriptTagRegex = /<script[^>]*>.*?<\/script>/gs;

let fileWithEnglishCount = 0;
const filesWithEnglish = [];

htmlFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // 移除注释
    content = content.replace(commentRegex, '');
    // 移除代码标签
    content = content.replace(codeTagRegex, '');
    // 移除SVG标签
    content = content.replace(svgTagRegex, '');
    // 移除style标签
    content = content.replace(styleTagRegex, '');
    // 移除script标签
    content = content.replace(scriptTagRegex, '');
    // 移除所有HTML标签，只保留文本内容
    content = content.replace(tagRegex, '');
    
    // 查找英文文本
    const englishMatches = content.match(englishRegex);
    
    if (englishMatches && englishMatches.length > 0) {
      // 过滤掉一些常见的不需要翻译的英文
      const filteredMatches = englishMatches.filter(match => {
        const trimmed = match.trim();
        // 排除单个单词（可能是专有名词）
        if (trimmed.split(/\s+/).length === 1) return false;
        // 排除空字符串
        if (trimmed === '') return false;
        // 排除常见的无意义文本
        if (trimmed.toLowerCase() === 'html' || trimmed.toLowerCase() === 'css' || trimmed.toLowerCase() === 'js') return false;
        return true;
      });
      
      if (filteredMatches.length > 0) {
        fileWithEnglishCount++;
        filesWithEnglish.push({
          file: file,
          matches: filteredMatches.slice(0, 5) // 只显示前5个匹配项
        });
        console.log(`❌ ${file} - 发现英文文本: ${filteredMatches.slice(0, 3).join(', ')}${filteredMatches.length > 3 ? '...' : ''}`);
      } else {
        console.log(`✅ ${file} - 翻译完整`);
      }
    } else {
      console.log(`✅ ${file} - 翻译完整`);
    }
  } catch (error) {
    console.log(`❌ ${file} - 读取错误: ${error.message}`);
  }
});

console.log('='.repeat(50));
console.log(`检查完成！`);
console.log(`总文件数: ${htmlFiles.length}`);
console.log(`可能需要翻译的文件数: ${fileWithEnglishCount}`);

if (filesWithEnglish.length > 0) {
  console.log('\n需要翻译的文件列表:');
  filesWithEnglish.forEach((item, index) => {
    console.log(`${index + 1}. ${item.file}`);
    console.log(`   英文文本示例: ${item.matches.join(', ')}`);
  });
}
