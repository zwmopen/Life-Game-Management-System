import fs from 'fs';
import path from 'path';

// 读取思维模型数据
const thinkingModels = JSON.parse(fs.readFileSync('d:\\AI编程\\人生游戏管理系统\\components\\thinkingModels.json', 'utf8'));

// 获取所有思维模型的ID
const thinkingModelIds = thinkingModels.map(model => model.id);

// 读取MissionControl.tsx文件
const missionControlPath = 'd:\\AI编程\\人生游戏管理系统\\components\\MissionControl.tsx';
let missionControlContent = fs.readFileSync(missionControlPath, 'utf8');

// 更新chartCategories状态中的thinking数组
const chartCategoriesRegex = /const \[chartCategories, setChartCategories\] = useState<{ \[key: string\]: string\[\] }>({[\s\S]*?thinking: \[(.*?)\][\s\S]*?});/;

missionControlContent = missionControlContent.replace(chartCategoriesRegex, (match, thinkingArray) => {
  // 提取当前的thinking数组
  const currentThinkingModels = thinkingArray
    .split(',')
    .map(id => id.trim().replace(/'/g, ''))
    .filter(id => id);
  
  // 合并所有思维模型ID
  const allThinkingModels = [...new Set([...currentThinkingModels, ...thinkingModelIds])];
  
  // 替换匹配的部分
  return match.replace(thinkingArray, allThinkingModels.map(id => `'${id}'`).join(', '));
});

// 更新initialCategories中的thinking数组
const initialCategoriesRegex = /const initialCategories = {[\s\S]*?thinking: \[(.*?)\][\s\S]*?};/;

missionControlContent = missionControlContent.replace(initialCategoriesRegex, (match, thinkingArray) => {
  // 提取当前的thinking数组
  const currentThinkingModels = thinkingArray
    .split(',')
    .map(id => id.trim().replace(/'/g, ''))
    .filter(id => id);
  
  // 合并所有思维模型ID
  const allThinkingModels = [...new Set([...currentThinkingModels, ...thinkingModelIds])];
  
  // 替换匹配的部分
  return match.replace(thinkingArray, allThinkingModels.map(id => `'${id}'`).join(', '));
});

// 保存更新后的文件
fs.writeFileSync(missionControlPath, missionControlContent);

console.log('chartCategories updated successfully!');
console.log(`Added ${thinkingModelIds.length} thinking models.`);
