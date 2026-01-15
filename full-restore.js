import fs from 'fs';
import path from 'path';

// 获取所有HTML文件
const htmlFiles = fs.readdirSync('d:/AI编程/人生游戏管理系统/thinking-models')
  .filter(file => file.endsWith('.html'))
  .map(file => path.join('d:/AI编程/人生游戏管理系统/thinking-models', file));

console.log('开始全面恢复HTML文件到原始状态...');
console.log(`共找到 ${htmlFiles.length} 个HTML文件`);
console.log('='.repeat(50));

let restoredCount = 0;
let skippedCount = 0;

htmlFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let updatedContent = content;
    let hasChanges = false;

    // 1. 移除主题切换按钮（处理有括号和无括号的情况）
    const themeButtonPattern = /\s*<!-- 主题切换按钮 -->\s*<button class="theme-toggle" onclick="toggleTheme\(\)?">🌓<\/button>\s*/g;
    if (themeButtonPattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(themeButtonPattern, '');
      hasChanges = true;
    }

    // 2. 移除body标签上的data-theme属性
    const bodyDataThemePattern = /(<body[^>]*?)data-theme="[^"]*"([^>]*>)/g;
    if (bodyDataThemePattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(bodyDataThemePattern, '$1$2');
      hasChanges = true;
    }

    // 3. 移除数字跳转功能
    const jumpFeaturePattern = /<!-- 数字跳转功能 -->[\s\S]*?<\/div>\s*<\/div>/g;
    if (jumpFeaturePattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(jumpFeaturePattern, '');
      hasChanges = true;
    }

    // 4. 移除包含数字跳转功能的其他模式
    const jumpFeaturePattern2 = /<div class="flex justify-center items-center gap-4">[\s\S]*?<\/div>\s*<\/div>/g;
    if (jumpFeaturePattern2.test(updatedContent)) {
      updatedContent = updatedContent.replace(jumpFeaturePattern2, '</div>');
      hasChanges = true;
    }

    // 5. 替换CSS变量引用为原始硬编码值
    const cssVarReplacements = {
      'var(--card-bg)': '#ffffff',
      'var(--border-color)': '#e5e7eb',
      'var(--shadow-color)': 'rgba(0, 0, 0, 0.1)',
      'var(--heading)': '#1e293b',
      'var(--text)': '#64748b',
      'var(--accent)': '#ef4444',
      'var(--input-bg)': '#f3f4f6',
      'var(--sidebar)': '#f1f5f9'
    };

    Object.entries(cssVarReplacements).forEach(([varName, hardValue]) => {
      const varPattern = new RegExp(varName, 'g');
      if (varPattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(varPattern, hardValue);
        hasChanges = true;
      }
    });

    // 6. 移除主题相关的CSS样式（如果有）
    const themeCSSPatterns = [
      /\/\* 白色主题（默认） \*\/[\s\S]*?\.theme-toggle:hover[\s\S]*?\}/g,
      /\/\* 深色主题 \*\/[\s\S]*?\}/g,
      /:root[\s\S]*?\}/g,
      /\[data-theme="dark"\][\s\S]*?\}/g
    ];

    themeCSSPatterns.forEach(pattern => {
      if (pattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(pattern, '');
        hasChanges = true;
      }
    });

    // 7. 移除可能的空style标签
    const emptyStylePattern = /\s*<style>\s*<\/style>\s*/g;
    if (emptyStylePattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(emptyStylePattern, '');
      hasChanges = true;
    }

    // 8. 移除主题切换JavaScript代码
    const themeJSPattern = /\s*<script>\s*\/\/ 主题切换功能[\s\S]*?<\/script>\s*/g;
    if (themeJSPattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(themeJSPattern, '');
      hasChanges = true;
    }

    if (hasChanges) {
      // 保存修改后的内容
      fs.writeFileSync(file, updatedContent, 'utf8');
      restoredCount++;
      console.log(`✅ ${file} - 已全面恢复到原始状态`);
    } else {
      skippedCount++;
      console.log(`⏭️ ${file} - 未包含需要恢复的内容，跳过`);
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
