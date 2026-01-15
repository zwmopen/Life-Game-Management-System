import fs from 'fs';
import path from 'path';

// 获取所有HTML文件
const htmlFiles = fs.readdirSync('d:/AI编程/人生游戏管理系统/thinking-models')
  .filter(file => file.endsWith('.html'))
  .map(file => path.join('d:/AI编程/人生游戏管理系统/thinking-models', file));

console.log('开始最终恢复HTML文件到原始状态...');
console.log(`共找到 ${htmlFiles.length} 个HTML文件`);
console.log('='.repeat(50));

let restoredCount = 0;
let skippedCount = 0;

htmlFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let updatedContent = content;
    let hasChanges = false;

    // 1. 移除主题切换按钮
    if (updatedContent.includes('theme-toggle')) {
      updatedContent = updatedContent.replace(/\s*<!-- 主题切换按钮 -->\s*<button[^>]*class="theme-toggle"[^>]*>🌓<\/button>\s*/g, '');
      hasChanges = true;
    }

    // 2. 移除body标签上的data-theme属性
    if (updatedContent.includes('data-theme')) {
      updatedContent = updatedContent.replace(/(<body[^>]*?)data-theme="[^"]*"([^>]*>)/g, '$1$2');
      hasChanges = true;
    }

    // 3. 移除数字跳转功能
    if (updatedContent.includes('jump-input') || updatedContent.includes('jump-button')) {
      updatedContent = updatedContent.replace(/<div class="flex justify-center items-center gap-4">[\s\S]*?<\/div>\s*<\/div>/g, '</div>');
      hasChanges = true;
    }

    // 4. 直接替换所有CSS变量为硬编码值，使用字符串替换而不是正则表达式
    const cssVarMap = {
      'var(--card-bg)': 'rgba(255, 255, 255, 0.7)',
      'var(--border-color)': 'rgba(0, 0, 0, 0.1)',
      'var(--shadow-color)': 'rgba(0, 0, 0, 0.1)',
      'var(--heading)': '#1e293b',
      'var(--text)': '#64748b',
      'var(--accent)': '#ef4444',
      'var(--input-bg)': 'rgba(0, 0, 0, 0.05)',
      'var(--sidebar)': '#f1f5f9',
      'var(--bg)': '#ffffff'
    };

    // 使用循环确保所有变量都被替换
    for (const [varName, hardValue] of Object.entries(cssVarMap)) {
      while (updatedContent.includes(varName)) {
        updatedContent = updatedContent.replace(varName, hardValue);
        hasChanges = true;
      }
    }

    // 5. 移除主题相关的CSS样式
    const themeCSSIndicators = ['/* 白色主题', '/* 深色主题', ':root', '[data-theme="dark"]'];
    if (themeCSSIndicators.some(indicator => updatedContent.includes(indicator))) {
      // 重写整个style标签，只保留非主题相关的样式
      const styleMatch = updatedContent.match(/<style>([\s\S]*?)<\/style>/);
      if (styleMatch) {
        let styleContent = styleMatch[1];
        
        // 移除所有主题相关的CSS
        styleContent = styleContent.replace(/\/\* 白色主题[^*]*\*\/[\s\S]*?(?=\/\*|\.|#|:root|\[|\s*$)/g, '');
        styleContent = styleContent.replace(/\/\* 深色主题[^*]*\*\/[\s\S]*?(?=\/\*|\.|#|:root|\[|\s*$)/g, '');
        styleContent = styleContent.replace(/:root[\s\S]*?\}/g, '');
        styleContent = styleContent.replace(/\[data-theme="dark"\][\s\S]*?\}/g, '');
        
        // 移除多余的空格和空行
        styleContent = styleContent.replace(/\s+/g, ' ').trim();
        
        // 更新style标签
        updatedContent = updatedContent.replace(/<style>[\s\S]*?<\/style>/, `<style>${styleContent}</style>`);
        hasChanges = true;
      }
    }

    // 6. 移除主题切换JavaScript代码
    if (updatedContent.includes('theme-toggle') || updatedContent.includes('toggleTheme')) {
      updatedContent = updatedContent.replace(/\s*<script>\s*\/\/ 主题切换功能[\s\S]*?<\/script>\s*/g, '');
      hasChanges = true;
    }

    if (hasChanges) {
      // 保存修改后的内容
      fs.writeFileSync(file, updatedContent, 'utf8');
      restoredCount++;
      console.log(`✅ ${file} - 已最终恢复到原始状态`);
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
