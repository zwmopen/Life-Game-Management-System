const fs = require('fs');
const path = require('path');

// 读取文件
const filePath = path.join(__dirname, 'components', 'HallOfFame.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 修复复杂嵌套模板字符串问题
// 将复杂嵌套的三元运算符拆分为辅助函数

// 首先提取需要修复的模式
content = content.replace(
  /className=\{`mb-6 p-3 rounded-xl \${isDark \? '([^']+)' : isNeomorphic \? `\${isNeomorphicDark \? '([^']+)' : '([^]+)'}` : '([^]+)'}([^`]+)`\}/g,
  (match, darkBg, neodarkBg, neolightBg, defaultBg, rest) => {
    return `className={\`mb-6 p-3 rounded-xl \${getBackgroundClass()}${rest}\`}`;
  }
);

// 修复第二处相似问题
content = content.replace(
  /className=\{`p-3 rounded-xl \${isDark \? '([^']+)' : isNeomorphic \? `\${isNeomorphicDark \? '([^']+)' : '([^]+)'}` : '([^]+)'}([^`]+)`\}/g,
  (match, darkBg, neodarkBg, neolightBg, defaultBg, rest) => {
    return `className={\`p-3 rounded-xl \${getBackgroundClass()}${rest}\`}`;
  }
);

// 添加辅助函数定义
if (!content.includes('getBackgroundClass')) {
  const insertIndex = content.indexOf('const HallOfFame:');
  const helperFunction = `
    // 辅助函数用于处理复杂的背景类
    const getBackgroundClass = () => {
      if (isDark && !isNeomorphic) {
        return '${darkBg}';
      } else if (isNeomorphic && isNeomorphicDark) {
        return '${neodarkBg}';
      } else if (isNeomorphic && !isNeomorphicDark) {
        return '${neolightBg}';
      } else {
        return '${defaultBg}';
      }
    };

  `;
  content = content.slice(0, insertIndex) + helperFunction + content.slice(insertIndex);
}

// 修复HelpTooltip的缩进问题
content = content.replace(
  /(\s*)<\/div>\n\s*\/\* 问号帮助按钮 \*\/\n\s*<HelpTooltip/,
  '                            </div>\n                            {/* 问号帮助按钮 */}\n                            <HelpTooltip'
);

fs.writeFileSync(filePath, content);
console.log('HallOfFame.tsx 修复完成');