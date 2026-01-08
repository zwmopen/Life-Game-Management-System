import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 思维模型文件夹路径
const thinkingModelsSourceDir = 'd:\\AI编程\\人生游戏管理系统\\thinking-models';
const thinkingModelsJsonPath = 'd:\\AI编程\\人生游戏管理系统\\components\\thinkingModels.json';

// 检查源文件夹是否存在
if (!fs.existsSync(thinkingModelsSourceDir)) {
  console.error(`错误：源文件夹 ${thinkingModelsSourceDir} 不存在！`);
  process.exit(1);
}

// 清空现有的thinkingModels.json文件
fs.writeFileSync(thinkingModelsJsonPath, '[]', 'utf8');
console.log('已清空现有的thinkingModels.json文件');

// 读取所有HTML文件
const htmlFiles = fs.readdirSync(thinkingModelsSourceDir).filter(file => file.endsWith('.html'));
console.log(`找到 ${htmlFiles.length} 个HTML文件`);

// 转换HTML文件为系统所需格式
const thinkingModels = htmlFiles.map(file => {
  const filePath = path.join(thinkingModelsSourceDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 提取标题
  const titleMatch = content.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : path.basename(file, '.html');
  
  // 生成英文ID
  const englishId = path.basename(file, '.html').toLowerCase();
  
  return {
    id: englishId,
    name: englishId,
    label: title,
    icon: 'BrainCircuit',
    description: `思维模型：${title}`,
    deepAnalysis: `这是一个思维模型，展示了${title}的核心概念和应用。`,
    principle: `思维模型的核心原则：${title}`,
    scope: '思维模式、决策分析、问题解决',
    tips: '1. 理解模型的核心概念；2. 结合实际问题应用；3. 定期复盘和优化',
    practice: `将${title}应用到日常决策和问题解决中，观察效果并调整。`,
    visualDesign: content // 直接使用HTML内容作为可视化设计
  };
});

// 将思维模型数据写入文件
fs.writeFileSync(
  thinkingModelsJsonPath,
  JSON.stringify(thinkingModels, null, 2)
);

console.log(`已成功更新 thinkingModels.json，包含 ${thinkingModels.length} 个思维模型！`);
console.log('所有思维模型已准备好在图表切换模块展示。');