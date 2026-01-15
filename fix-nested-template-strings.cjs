// 修复Settings.tsx中的嵌套模板字符串
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'Settings.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 修复模式: ${isNeomorphic ? `${条件 ? 'a' : 'b'}` : 条件 ? 'c' : 'd'}
// 改为: ${isNeomorphic ? (条件 ? 'a' : 'b') : (条件 ? 'c' : 'd')}

// 1. 修复带有三元运算符的嵌套模板字符串
content = content.replace(
  /\$\{isNeomorphic \? `\$\{/g,
  '${isNeomorphic ? ('
);

// 2. 修复结尾部分: }` : 
content = content.replace(
  /\}` : (isDark|autoBackupEnabled|locationSetting\.enabled)/g,
  (match, p1) => `) : (${p1}`
);

// 3. 修复其他嵌套情况
content = content.replace(
  /activeBackupTab === '(local|cloud)' \? `\$\{isDark/g,
  (match, p1) => `activeBackupTab === '${p1}' ? (isDark`
);

content = content.replace(
  /border-blue-(500|600)'\}` : `\$\{textSub\} hover:text-blue-500`\}/g,
  (match, p1) => `border-blue-${p1}') : (textSub + ' hover:text-blue-500')}`
);

// 4. 修复webdavStatus行
content = content.replace(
  /webdavStatus\.includes\('成功'\) \? 'bg-green-500 text-white' : 'bg-red-500 text-white'\}/g,
  "webdavStatus.includes('成功') ? 'bg-green-500 text-white' : 'bg-red-500 text-white')"
);

content = content.replace(
  /localBackupStatus\.includes\('成功'\) \? 'bg-green-500 text-white' : 'bg-red-500 text-white'\}/g,
  "localBackupStatus.includes('成功') ? 'bg-green-500 text-white' : 'bg-red-500 text-white')"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('修复完成！');
