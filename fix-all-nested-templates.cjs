// 完整修复Settings.tsx中所有嵌套模板字符串
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'Settings.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 定义所有需要修复的具体位置
const fixes = [
  // 1. 第420行 - 主容器div
  {
    search: `<div className={\`h-full flex flex-col overflow-hidden \${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]') : (isDark ? 'bg-zinc-950' : 'bg-slate-50')}\`}>`,
    replace: `<div className={[
      'h-full flex flex-col overflow-hidden',
      isNeomorphic
        ? theme === 'neomorphic-dark'
          ? 'bg-[#1e1e2e]'
          : 'bg-[#e0e5ec]'
        : isDark
        ? 'bg-zinc-950'
        : 'bg-slate-50'
    ].join(' ')}>`
  },
  
  // 2-3. 备份Tab按钮
  {
    search: `className={\`px-3 py-1.5 text-xs font-medium transition-all \${activeBackupTab === 'local' ? (isDark ? 'text-blue-500 border-b-2 border-blue-500' : 'text-blue-600 border-b-2 border-blue-600') : (textSub + ' hover:text-blue-500')}\`}`,
    replace: `className={[
                'px-3 py-1.5 text-xs font-medium transition-all',
                activeBackupTab === 'local'
                  ? isDark
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : textSub + ' hover:text-blue-500'
              ].join(' ')}`
  },
  
  {
    search: `className={\`px-3 py-1.5 text-xs font-medium transition-all \${activeBackupTab === 'cloud' ? (isDark ? 'text-blue-500 border-b-2 border-blue-500' : 'text-blue-600 border-b-2 border-blue-600') : (textSub + ' hover:text-blue-500')}\`}`,
    replace: `className={[
                'px-3 py-1.5 text-xs font-medium transition-all',
                activeBackupTab === 'cloud'
                  ? isDark
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : textSub + ' hover:text-blue-500'
              ].join(' ')}`
  },
  
  // 4. 自动备份toggle
  {
    search: `className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-all \${isNeomorphic ? ('shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ' + (autoBackupEnabled ? 'bg-blue-500' : 'bg-white')) : (autoBackupEnabled ? 'bg-blue-600' : 'bg-white')}\`}`,
    replace: `className={[
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-all',
                        isNeomorphic
                          ? 'shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] ' + (autoBackupEnabled ? 'bg-blue-500' : 'bg-white')
                          : autoBackupEnabled ? 'bg-blue-600' : 'bg-white'
                      ].join(' ')}`
  }
];

// 应用所有修复
fixes.forEach((fix, index) => {
  const before = content;
  content = content.replace(fix.search, fix.replace);
  if (content === before) {
    console.log(`警告：修复 ${index + 1} 未找到匹配`);
  } else {
    console.log(`✓ 修复 ${index + 1} 已应用`);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('\n所有修复已完成！');
