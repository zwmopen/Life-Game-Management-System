import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 思维模型文件夹路径
const thinkingModelsDir = 'd:\\AI编程\\人生游戏管理系统\\思维模型';
const thinkingModelsJsonPath = 'd:\\AI编程\\人生游戏管理系统\\components\\thinkingModels.json';

// 检查思维模型文件夹是否存在
if (!fs.existsSync(thinkingModelsDir)) {
  console.error(`错误：思维模型文件夹 ${thinkingModelsDir} 不存在！`);
  process.exit(1);
}

// 读取所有HTML文件
const htmlFiles = fs.readdirSync(thinkingModelsDir).filter(file => file.endsWith('.html'));

// 生成思维模型数据
const thinkingModels = htmlFiles.map(file => {
  const filePath = path.join(thinkingModelsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 提取标题
  const titleMatch = content.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : path.basename(file, '.html');
  
  // 提取文件名中的英文ID
  const fileName = path.basename(file, '.html');
  const id = fileName.split('_').pop() || fileName;
  
  return {
    id: id,
    name: id,
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