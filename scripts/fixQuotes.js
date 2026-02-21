import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_PATH = path.join(__dirname, '../components/thinkingModels.json');

try {
  let content = fs.readFileSync(MODELS_PATH, 'utf-8');
  
  // 只在JSON字符串值中替换中文引号（不在visualDesign中）
  // 匹配模式: "fieldName": "value with 中文引号"
  // 我们需要在值部分替换中文引号
  
  // 先尝试解析，找出错误位置
  try {
    JSON.parse(content);
    console.log('JSON已经有效，无需修复');
  } catch (parseError) {
    console.log('发现JSON错误:', parseError.message);
    
    // 找出有问题的行
    const match = parseError.message.match(/position (\d+)/);
    if (match) {
      const pos = parseInt(match[1]);
      const lines = content.substring(0, pos).split('\n');
      const lineNum = lines.length;
      const colNum = lines[lines.length - 1].length;
      console.log(`错误位置: 行 ${lineNum}, 列 ${colNum}`);
      
      // 显示错误附近的内容
      const errorLine = content.split('\n')[lineNum - 1];
      console.log('错误行:', errorLine.substring(0, 100));
    }
  }
} catch (error) {
  console.error('错误:', error.message);
}
