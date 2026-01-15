import fs from 'fs';
import path from 'path';

// 读取HTML文件并检测英文内容
function checkEnglishContent(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 提取所有文本内容（排除HTML标签）
        const textContent = content.replace(/<[^>]*>/g, ' ');
        
        // 检测英文单词
        const englishWords = textContent.match(/\b[A-Za-z]{3,}\b/g) || [];
        
        // 去重
        const uniqueEnglishWords = [...new Set(englishWords)];
        
        return {
            file: