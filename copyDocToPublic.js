const fs = require('fs');
const path = require('path');

// 确保public目录存在
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('创建public目录成功');
}

// 复制图表深度解析文档到public目录
const sourceFile = path.join(__dirname, '图表深度解析文档.md');
const destFile = path.join(publicDir, '图表深度解析文档.md');

fs.copyFileSync(sourceFile, destFile);
console.log('图表深度解析文档已成功复制到public目录');
