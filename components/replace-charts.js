import fs from 'fs/promises';

async function replaceCharts() {
  try {
    // 读取当前文件
    const currentContent = await fs.readFile('d:\\AI编程\\人生游戏管理系统\\components\\MissionControl.tsx', 'utf8');
    
    // 读取备份文件
    const bakContent = await fs.readFile('d:\\AI编程\\人生游戏管理系统\\components\\MissionControl.tsx.bak', 'utf8');
    
    // 找到当前文件中CHARTS数组的位置
    const chartStart = currentContent.indexOf('const CHARTS = [');
    const chartEnd = currentContent.indexOf('];', chartStart) + 2;
    
    // 找到备份文件中CHARTS数组的位置
    const bakChartStart = bakContent.indexOf('const CHARTS = [');
    const bakChartEnd = bakContent.indexOf('];', bakChartStart) + 2;
    
    // 提取备份文件中的完整CHARTS数组
    const bakCharts = bakContent.substring(bakChartStart, bakChartEnd);
    
    // 构建新的文件内容
    const newContent = currentContent.substring(0, chartStart) + bakCharts + currentContent.substring(chartEnd);
    
    // 写入新内容
    await fs.writeFile('d:\\AI编程\\人生游戏管理系统\\components\\MissionControl.tsx', newContent, 'utf8');
    
    console.log('CHARTS数组替换成功！');
  } catch (error) {
    console.error('替换失败：', error);
  }
}

replaceCharts();
