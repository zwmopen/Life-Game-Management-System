const fs = require('fs');
const path = require('path');

// 定义文件路径 - 使用正斜杠
const folderPath = 'd:/AI编程/人生游戏管理系统/thinking-models';

// 定义需要替换的字符串
const oldLayout = 'grid grid-cols-1 lg:grid-cols-2 gap-20 items-center';
const newLayout = 'grid grid-cols-1 gap-20';

// 计数器
let totalFiles = 0;
let modifiedFiles = 0;

// 处理单个HTML文件
function processHTMLFile(filePath) {
    totalFiles++;
    console.log(`Processing file: ${filePath}`);
    
    try {
        // 读取文件内容
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 检查文件是否包含需要替换的布局
        if (content.includes(oldLayout)) {
            // 替换布局
            const newContent = content.replace(new RegExp(oldLayout, 'g'), newLayout);
            
            // 保存修改后的文件
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('  [OK] Layout changed to top-bottom');
            modifiedFiles++;
        } else {
            console.log('  [SKIP] Layout not found');
        }
    } catch (error) {
        console.log(`  [ERROR] ${error.message}`);
    }
    
    console.log('');
}

// 递归读取文件夹中的所有HTML文件
function traverseDirectory(dirPath) {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        
        if (file.isDirectory()) {
            traverseDirectory(fullPath);
        } else if (file.name.endsWith('.html')) {
            processHTMLFile(fullPath);
        }
    }
}

// 开始处理
console.log('Starting layout modification...');
console.log('================================');
console.log('');

traverseDirectory(folderPath);

// 输出结果
console.log('================================');
console.log('Processing complete!');
console.log(`Total files processed: ${totalFiles}`);
console.log(`Files modified: ${modifiedFiles}`);
