// 检查图表是否有遗漏的脚本
import fs from 'fs';
import path from 'path';

// 读取MissionControl.tsx文件
const filePath = path.join(process.cwd(), 'components', 'MissionControl.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// 提取CHARTS数组中的所有图表ID
const chartsRegex = /id: '(\w+)'/g;
const chartIds = [];
let match;
while ((match = chartsRegex.exec(content)) !== null) {
  chartIds.push(match[1]);
}

// 提取chartCategories对象中的所有图表ID
const categoriesRegex = /\[(.*?)\]/g;
const categoriesMatch = content.match(categoriesRegex);
if (categoriesMatch) {
  const allCategoriesCharts = [];
  categoriesMatch.forEach(match => {
    const idsRegex = /'(\w+)'/g;
    let idMatch;
    while ((idMatch = idsRegex.exec(match)) !== null) {
      allCategoriesCharts.push(idMatch[1]);
    }
  });

  // 检查是否有遗漏的图表
  const missingCharts = chartIds.filter(id => !allCategoriesCharts.includes(id));
  
  console.log('CHARTS数组中的图表数量:', chartIds.length);
  console.log('chartCategories中的图表数量:', allCategoriesCharts.length);
  console.log('缺失的图表ID:', missingCharts);
  console.log('缺失的图表数量:', missingCharts.length);
} else {
  console.log('未找到chartCategories对象');
}