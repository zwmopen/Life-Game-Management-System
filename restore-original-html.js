import fs from 'fs';
import path from 'path';

// 获取所有HTML文件
const htmlFiles = fs.readdirSync('d:/AI编程/人生游戏管理系统/thinking-models')
  .filter(file => file.endsWith('.html'))
  .map(file => path.join('d:/AI编程/人生游戏管理系统/thinking-models', file));

console.log('开始恢复HTML文件到原始状态...');
console.log(`共找到 ${htmlFiles.length} 个HTML文件`);
console.log('='.repeat(50));

let restoredCount = 0;
let skippedCount = 0;

htmlFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let updatedContent = content;
    let hasChanges = false;

    // 1. 移除主题切换JavaScript代码
    const themeJSPattern = /\s*<script>\s*\/\/ 主题切换功能[\s\S]*?<\/script>\s*/;
    if (themeJSPattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(themeJSPattern, '');
      hasChanges = true;
    }

    // 2. 移除主题切换按钮
    const themeButtonPattern = /\s*<!-- 主题切换按钮 -->\s*<button class="theme-toggle" onclick="toggleTheme">🌓<\/button>\s*/;
    if (themeButtonPattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(themeButtonPattern, '');
      hasChanges = true;
    }

    // 3. 移除body标签上的data-theme属性
    const bodyDataThemePattern = /<body\s+data-theme="[^\s"]+"/;
    if (bodyDataThemePattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(bodyDataThemePattern, '<body');
      hasChanges = true;
    }

    // 4. 移除添加的主题CSS样式
    const themeCSSPattern = /\/\* 白色主题（默认） \*\/[\s\S]*?\.theme-toggle:hover[\s\S]*?\}/;
    if (themeCSSPattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(themeCSSPattern, '');
      // 移除可能为空的style标签
      const emptyStylePattern = /\s*<style>\s*<\/style>\s*/;
      if (emptyStylePattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(emptyStylePattern, '');
      }
      hasChanges = true;
    }

    if (hasChanges) {
      // 保存修改后的内容
      fs.writeFileSync(file, updatedContent, 'utf8');
      restoredCount++;
      console.log(`✅ ${file} - 已恢复到原始状态`);
    } else {
      skippedCount++;
      console.log(`⏭️ ${file} - 未包含主题切换功能，跳过`);
    }
  } catch (error) {
    console.log(`❌ ${file} - 处理错误: ${error.message}`);
  }
});

console.log('='.repeat(50));
console.log(`恢复完成！`);
console.log(`总文件数: ${htmlFiles.length}`);
console.log(`已恢复文件数: ${restoredCount}`);
console.log(`跳过文件数: ${skippedCount}`);
