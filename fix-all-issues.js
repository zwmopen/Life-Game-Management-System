import fs from 'fs';
import path from 'path';

// 获取所有HTML文件
const htmlFiles = fs.readdirSync('d:/AI编程/人生游戏管理系统/thinking-models')
  .filter(file => file.endsWith('.html'))
  .map(file => path.join('d:/AI编程/人生游戏管理系统/thinking-models', file));

console.log('开始修复所有HTML文件中的问题...');
console.log(`共找到 ${htmlFiles.length} 个HTML文件`);
console.log('='.repeat(50));

let fixedCount = 0;
let skippedCount = 0;

htmlFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let updatedContent = content;
    let hasChanges = false;

    // 1. 修复body标签外的data-theme属性
    const bodyDataThemePattern = /<body>(\s*)data-theme="[^"]*">/g;
    if (bodyDataThemePattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(bodyDataThemePattern, '<body $1>');
      hasChanges = true;
    }

    // 2. 修复repeat检查ount为repeatCount
    if (updatedContent.includes('repeat检查ount')) {
      updatedContent = updatedContent.replace(/repeat检查ount/g, 'repeatCount');
      hasChanges = true;
    }

    // 3. 修复title标签中的翻译错误
    const titleErrorPattern = /THE FR我检查T我ON OF 检查ONTR行动执行我检查T我ON/g;
    if (titleErrorPattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(titleErrorPattern, 'THE FRICTION OF CONTRADICTION');
      hasChanges = true;
    }

    // 4. 修复认知失调的英文翻译
    const cognitiveErrorPattern = /认知失调 \(检查ognitive 执行issonance\)/g;
    if (cognitiveErrorPattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(cognitiveErrorPattern, '认知失调 (Cognitive Dissonance)');
      hasChanges = true;
    }

    // 5. 确保所有HTML文件都以<!DOCTYPE html>开头
    if (!updatedContent.startsWith('<!DOCTYPE html>')) {
      updatedContent = '<!DOCTYPE html>' + updatedContent;
      hasChanges = true;
    }

    // 6. 修复所有body标签上可能残留的data-theme属性
    updatedContent = updatedContent.replace(/<body([^>]*)data-theme="[^"]*"([^>]*)>/g, '<body$1$2>');

    if (hasChanges) {
      // 保存修改后的内容
      fs.writeFileSync(file, updatedContent, 'utf8');
      fixedCount++;
      console.log(`✅ ${file} - 已修复问题`);
    } else {
      skippedCount++;
      console.log(`⏭️ ${file} - 未发现问题，跳过`);
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
