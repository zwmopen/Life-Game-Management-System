// 修复数据管理模块中的所有嵌套模板字符串
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'Settings.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('开始修复数据管理模块...\n');

// 统一的修复函数：将所有嵌套模板字符串改为数组join方式
function fixNestedTemplateString(code) {
  // 匹配模式: className={`...${isNeomorphic ? (cond ? 'a' : 'b') : (cond ? 'c' : 'd')}`}
  // 这些都需要改为数组join方式
  
  // 简单的两层嵌套：${isNeomorphic ? (cond ? 'a' : 'b') : (cond ? 'c' : 'd')}
  const simplePattern = /className=\{`([^`]*)\$\{isNeomorphic \? \(isNeomorphicDark \? '([^']+)' : '([^']+)'\) : \(isDark \? '([^']+)' : '([^']+)'\)\}`\}/g;
  
  code = code.replace(simplePattern, (match, prefix, darkNeo, lightNeo, dark, light) => {
    return `className={[
      '${prefix.trim()}',
      isNeomorphic
        ? isNeomorphicDark
          ? '${darkNeo}'
          : '${lightNeo}'
        : isDark
        ? '${dark}'
        : '${light}'
    ].join(' ')}`;
  });
  
  return code;
}

// 读取文件并按行处理
const lines = content.split('\n');
let modified = false;
let fixCount = 0;

// 查找所有包含嵌套模板字符串的className
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // 检测是否包含问题模式
  if (line.includes('className={`') && 
      line.includes('isNeomorphic ? (isNeomorphicDark ?') &&
      !line.includes('.join(')) {
    
    // 提取className部分
    const classNameMatch = line.match(/className=\{`[^`]+`\}/);
    if (classNameMatch) {
      const oldClassName = classNameMatch[0];
      
      // 尝试修复
      const fixed = fixNestedTemplateString(line);
      if (fixed !== line) {
        lines[i] = fixed;
        modified = true;
        fixCount++;
        console.log(`✓ 修复第 ${i + 1} 行`);
      }
    }
  }
}

if (modified) {
  content = lines.join('\n');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\n总共修复了 ${fixCount} 处嵌套模板字符串！`);
} else {
  console.log('\n未找到需要修复的模式');
}
