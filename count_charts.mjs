// 计算CHARTS数组的长度
import fs from 'fs';

// 读取文件内容
const filePath = './components/MissionControl.tsx';
const fileContent = fs.readFileSync(filePath, 'utf8');

// 匹配所有id: 'xxx'的模式
const chartIdRegex = /id:\s*'([^']+)'/g;
const chartIds = [];

let match;
while ((match = chartIdRegex.exec(fileContent)) !== null) {
  chartIds.push(match[1]);
}

// 去重
const uniqueChartIds = [...new Set(chartIds)];

console.log(`CHARTS数组中共有 ${uniqueChartIds.length} 个图表`);
console.log(`去重后共有 ${uniqueChartIds.length} 个图表`);

// 检查是否有重复的图表ID
const duplicates = chartIds.filter((id, index) => chartIds.indexOf(id) !== index);
if (duplicates.length > 0) {
  console.log('重复的图表ID：', [...new Set(duplicates)]);
}

// 检查是否有chartId不在chartCategories中
const chartCategoriesRegex = /concept:\s*\[([^\]]+)\]/;
const categoriesMatch = fileContent.match(chartCategoriesRegex);
if (categoriesMatch) {
  const conceptCharts = categoriesMatch[1].match(/'([^']+)'/g)?.map(id => id.replace(/'/g, '')) || [];
  const trendCategoriesRegex = /trend:\s*\[([^\]]+)\]/;
  const trendMatch = fileContent.match(trendCategoriesRegex);
  const trendCharts = trendMatch ? (trendMatch[1].match(/'([^']+)'/g)?.map(id => id.replace(/'/g, '')) || []) : [];
  
  const allCategoriesCharts = [...conceptCharts, ...trendCharts];
  console.log(`chartCategories中共有 ${allCategoriesCharts.length} 个图表`);
  
  const chartsNotInCategories = uniqueChartIds.filter(id => !allCategoriesCharts.includes(id));
  if (chartsNotInCategories.length > 0) {
    console.log('不在chartCategories中的图表ID：', chartsNotInCategories);
  }
}