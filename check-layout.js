import fs from 'fs';
import path from 'path';

// 获取所有HTML文件
const htmlFiles = fs.readdirSync('thinking-models')
  .filter(file => file.endsWith('.html'))
  .map(file => path.join('thinking-models', file));

console.log('开始检查HTML布局...');
console.log(`共找到 ${htmlFiles.length} 个HTML文件`);
console.log('='.repeat(50));

let leftRightLayoutCount = 0;
const leftRightLayoutFiles = [];

htmlFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // 检查是否有左右布局的特征
    const hasLeftRightLayout = (
      // 检查flex-direction: row
      content.includes('flex-direction: row') ||
      content.includes('flex-direction:row') ||
      // 检查左右容器
      content.includes('left-container') ||
      content.includes('right-container') ||
      content.includes('left-content') ||
      content.includes('right-content') ||
      content.includes('container-left') ||
      content.includes('container-right') ||
      // 检查左右浮动
      content.includes('float: left') ||
      content.includes('float:left') ||
      content.includes('float: right') ||
      content.includes('float:right') ||
      // 检查grid布局的左右结构
      content.includes('grid-template-columns')
    );
    
    if (hasLeftRightLayout) {
      leftRightLayoutCount++;
      leftRightLayoutFiles.push(file);
      console.log(`❌ ${file} - 可能使用左右布局`);
    } else {
      console.log(`✅ ${file} - 使用上下布局`);
    }
  } catch (error) {
    console.log(`❌ ${file} - 读取错误: ${error.message}`);
  }
});

console.log('='.repeat(50));
console.log(`检查完成！`);
console.log(`总文件数: ${htmlFiles.length}`);
console.log(`可能使用左右布局的文件数: ${leftRightLayoutCount}`);

if (leftRightLayoutFiles.length > 0) {
  console.log('\n使用左右布局的文件列表:');
  leftRightLayoutFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
}
