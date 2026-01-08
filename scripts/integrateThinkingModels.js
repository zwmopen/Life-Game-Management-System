import fs from 'fs';
import path from 'path';

// 思维模型HTML文件目录
const thinkingModelsDir = 'd:/AI编程/人生游戏管理系统/思维模型';

// 读取所有HTML文件
const htmlFiles = fs.readdirSync(thinkingModelsDir).filter(file => file.endsWith('.html'));

// 生成思维模型数据
const thinkingModels = htmlFiles.map(file => {
  const filePath = path.join(thinkingModelsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 提取标题
  const titleMatch = content.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : path.basename(file, '.html');
  
  return {
    id: path.basename(file, '.html'),
    name: path.basename(file, '.html'),
    label: title,
    icon: 'BrainCircuit', // 使用统一的思维模型图标
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
  'd:/AI编程/人生游戏管理系统/components/thinkingModels.json',
  JSON.stringify(thinkingModels, null, 2)
);

console.log(`成功生成了${thinkingModels.length}个思维模型数据`);
console.log('数据已保存到components/thinkingModels.json文件中');
