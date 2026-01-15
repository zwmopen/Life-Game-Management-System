import fs from 'fs';
import path from 'path';

// 获取所有HTML文件
const htmlFiles = fs.readdirSync('thinking-models')
  .filter(file => file.endsWith('.html'))
  .map(file => path.join('thinking-models', file));

console.log('开始批量添加主题切换功能...');
console.log(`共找到 ${htmlFiles.length} 个HTML文件`);
console.log('='.repeat(50));

let updatedCount = 0;
let skippedCount = 0;

// 主题CSS样式
const themeCSS = `/* 白色主题（默认） */
    :root { 
      --bg: #ffffff; 
      --heading: #1e293b; 
      --accent: #ef4444; 
      --sidebar: #f1f5f9; 
      --text: #64748b; 
      --card-bg: rgba(255, 255, 255, 0.7); 
      --border-color: rgba(0, 0, 0, 0.1); 
      --shadow-color: rgba(0, 0, 0, 0.1); 
      --input-bg: rgba(0, 0, 0, 0.05); 
    }
    
    /* 深色主题 */
    [data-theme="dark"] {
      --bg: #020617; 
      --heading: #f8fafc; 
      --accent: #ef4444; 
      --sidebar: #1e293b; 
      --text: #94a3b8; 
      --card-bg: rgba(15, 23, 42, 0.7); 
      --border-color: rgba(255, 255, 255, 0.05); 
      --shadow-color: rgba(0, 0, 0, 0.5); 
      --input-bg: rgba(255, 255, 255, 0.05); 
    }
    
    body { 
      background: var(--bg); 
      font-family: -apple-system, sans-serif; 
      color: var(--text); 
      overflow: auto; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      min-height: 100vh; 
      transition: all 0.3s ease; 
    }
    
    /* 主题切换按钮 */
    .theme-toggle {
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 12px var(--shadow-color);
      transition: all 0.3s ease;
      z-index: 1000;
    }
    
    .theme-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px var(--shadow-color);
    }`;

// 主题切换JavaScript代码
const themeJS = `  <script>
    // 主题切换功能
    function toggleTheme() {
      const body = document.body;
      const currentTheme = body.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      body.setAttribute('data-theme', newTheme);
      
      // 保存主题偏好到本地存储
      localStorage.setItem('theme', newTheme);
    }
    
    // 初始化主题
    document.addEventListener('DOMContentLoaded', () => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.body.setAttribute('data-theme', savedTheme);
    });
  </script>`;

// 主题切换按钮HTML
const themeButton = `  <!-- 主题切换按钮 -->
  <button class="theme-toggle" onclick="toggleTheme()">🌓</button>`;

htmlFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // 检查文件是否已经包含主题切换功能
    if (content.includes('theme-toggle') || content.includes('data-theme')) {
      skippedCount++;
      console.log(`⏭️ ${file} - 已包含主题切换功能，跳过`);
      return;
    }
    
    // 1. 添加CSS主题样式
    let updatedContent = content;
    
    // 找到style标签，如果没有则创建一个
    if (content.includes('<style>')) {
      // 在style标签开始处插入主题CSS
      updatedContent = content.replace('<style>', `<style>
${themeCSS}
`);
    } else {
      // 在head标签结束前添加style标签
      updatedContent = content.replace('</head>', `<style>
${themeCSS}
</style>
</head>`);
    }
    
    // 2. 添加data-theme属性到body标签
    updatedContent = updatedContent.replace('<body', '<body data-theme="light"');
    
    // 3. 在body标签内添加主题切换按钮
    updatedContent = updatedContent.replace('<body', `<body>
${themeButton}`);
    
    // 4. 在body结束前添加主题切换JavaScript
    updatedContent = updatedContent.replace('</body>', `${themeJS}
</body>`);
    
    // 5. 保存修改后的内容
    fs.writeFileSync(file, updatedContent, 'utf8');
    updatedCount++;
    console.log(`✅ ${file} - 已添加主题切换功能`);
    
  } catch (error) {
    console.log(`❌ ${file} - 处理错误: ${error.message}`);
  }
});

console.log('='.repeat(50));
console.log(`处理完成！`);
console.log(`总文件数: ${htmlFiles.length}`);
console.log(`已更新文件数: ${updatedCount}`);
console.log(`跳过文件数: ${skippedCount}`);
