import fs from 'fs';
import path from 'path';

// 定义思维模型目录路径
const modelsDir = 'd:\\AI编程\\人生游戏管理系统\\thinking-models';
// 定义输出JSON文件路径
const outputFile = 'd:\\AI编程\\人生游戏管理系统\\components\\thinkingModels.json';

// 读取目录中的所有HTML文件
const files = fs.readdirSync(modelsDir).filter(file => file.endsWith('.html'));

// 转换函数
const convertHTMLtoJSON = (filePath, fileName) => {
  // 读取HTML文件内容
  const htmlContent = fs.readFileSync(filePath, 'utf8');
  
  // 移除文件扩展名
  const baseName = fileName.replace('.html', '');
  
  // 初始化变量
  let id, name, label;
  
  // 检查文件名是否包含下划线
  const lastUnderscoreIndex = baseName.lastIndexOf('_');
  
  if (lastUnderscoreIndex > 0 && lastUnderscoreIndex < baseName.length - 1) {
    // 文件名包含下划线，且下划线不是在开头或结尾
    
    // 提取英文部分（下划线后面的内容）
    const englishPart = baseName.substring(lastUnderscoreIndex + 1);
    
    // 提取中文部分（下划线前面的内容）
    const chinesePart = baseName.substring(0, lastUnderscoreIndex);
    
    label = chinesePart;
    name = englishPart;
    // 使用完整的baseName生成唯一id，确保不重复
    id = baseName.toLowerCase().replace(/[^a-z0-9_]/g, '');
  } else {
    // 文件名不包含下划线或下划线在开头/结尾，直接使用
    label = baseName;
    name = baseName;
    id = baseName.toLowerCase().replace(/[^a-z0-9_]/g, '');
  }
  
  // 提取完整的HTML内容，包括样式和所有内容
  let visualDesign = '';
  
  // 提取body内容，保留所有原始内容
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    // 提取完整的body内容
    let bodyContent = bodyMatch[1].trim();
    
    // 提取原始CSS样式
    const styleMatch = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    let cssContent = '';
    if (styleMatch && styleMatch[1]) {
      cssContent = styleMatch[1];
      
      // 移除影响全局的样式
      // 1. 移除:root中的--bg定义
      cssContent = cssContent.replace(/:root\s*\{([^}]*)--bg[^;]*;([^}]*)\}/gi, ':root { $1$2 }');
      
      // 2. 移除[data-theme="dark"]中的--bg定义
      cssContent = cssContent.replace(/\[data-theme="dark"\]\s*\{([^}]*)--bg[^;]*;([^}]*)\}/gi, '[data-theme="dark"] { $1$2 }');
      cssContent = cssContent.replace(/\[data-theme='dark'\]\s*\{([^}]*)--bg[^;]*;([^}]*)\}/gi, '[data-theme="dark"] { $1$2 }');
      
      // 3. 移除body样式定义
      cssContent = cssContent.replace(/body\s*\{[^}]*\}/gi, '');
      
      // 4. 移除任何可能影响全局的样式
      cssContent = cssContent.replace(/html\s*\{[^}]*\}/gi, '');
    }
    
    // 组合样式和内容
    visualDesign = `<style>${cssContent}</style>${bodyContent}`;
  }
  
  // 从HTML中提取实际的文本内容
  // 提取标题
  const titleMatch = htmlContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].trim() : `${label} - 思维模型`;
  
  // 提取简短描述
  const descMatch = htmlContent.match(/<h1[^>]*>[\s\S]*?<\/h1>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
  const shortDesc = descMatch ? descMatch[1].trim() : `${label} - 思维模型`;
  
  // 提取名称，优先从h1标签获取
  let modelName = title;
  
  // 1. 去掉括号和括号内的内容
  modelName = modelName.replace(/\([^)]*\)|（[^）]*）/g, '').trim();
  
  // 2. 如果标题只是英文，则从title标签获取完整名称
  if (/^[a-zA-Z0-9_]+$/.test(modelName)) {
    const titleTagMatch = htmlContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleTagMatch) {
      let titleFromTag = titleTagMatch[1].trim();
      // 去掉括号和括号内的内容
      titleFromTag = titleFromTag.replace(/\([^)]*\)|（[^）]*）/g, '').trim();
      modelName = titleFromTag;
    }
  }
  
  // 3. 确保名称不为空，不强行添加英文缩写
  if (!modelName || /^[a-zA-Z0-9_]+$/.test(modelName)) {
    // 如果没有合适的中文名称，使用文件名的中文部分
    const lastUnderscoreIndex = baseName.lastIndexOf('_');
    if (lastUnderscoreIndex > 0 && lastUnderscoreIndex < baseName.length - 1) {
      // 只使用中文部分，不添加英文缩写
      const chinesePart = baseName.substring(0, lastUnderscoreIndex);
      modelName = chinesePart;
    } else {
      // 如果文件名没有下划线，使用完整文件名
      modelName = baseName;
    }
  }
  
  // 4. 最终名称：保留原格式，不强行添加英文缩写
  let chineseName = modelName;
  
  // 提取模型概述
  const overviewMatch = htmlContent.match(/<h2[^>]*>模型概述[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
  const overview = overviewMatch ? overviewMatch[1].trim() : `这是一个思维模型，展示了${label}的核心概念和应用。`;
  
  // 提取核心原则
  const principleMatch = htmlContent.match(/<h3[^>]*>核心原则[^>]*>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
  let principles = `思维模型的核心原则：${label}`;
  if (principleMatch) {
    // 简单处理ul内容，提取文本
    principles = principleMatch[1]
      .replace(/<li[^>]*>/gi, '')
      .replace(/<\/li>/gi, '\n')
      .replace(/<strong[^>]*>/gi, '')
      .replace(/<\/strong>/gi, '')
      .replace(/<[^>]*>/gi, '')
      .trim()
      .replace(/\n/g, '; ');
  }
  
  // 提取应用范围
  const scopeMatch = htmlContent.match(/<h3[^>]*>应用范围[^>]*>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
  let scope = '思维模式、决策分析、问题解决';
  if (scopeMatch) {
    // 简单处理ul内容，提取文本
    scope = scopeMatch[1]
      .replace(/<li[^>]*>/gi, '')
      .replace(/<\/li>/gi, ', ')
      .replace(/<[^>]*>/gi, '')
      .trim()
      .replace(/,\s*$/, '');
  }
  
  // 提取使用技巧
  const tipsMatch = htmlContent.match(/<h3[^>]*>使用技巧[^>]*>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
  let tips = '1. 理解模型的核心概念；2. 结合实际问题应用；3. 定期复盘和优化';
  if (tipsMatch) {
    // 简单处理ul内容，提取文本
    const tipsList = tipsMatch[1]
      .match(/<li[^>]*>([\s\S]*?)<\/li>/gi)
      ?.map((li, index) => `${index + 1}. ${li.replace(/<[^>]*>/gi, '').trim()}`)
      .join('; ') || tips;
    tips = tipsList;
  }
  
  // 提取实践建议
  const practiceMatch = htmlContent.match(/<h3[^>]*>实践建议[^>]*>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
  let practice = `将${label}应用到日常决策和问题解决中，观察效果并调整。`;
  if (practiceMatch) {
    // 简单处理ul内容，提取文本
    practice = practiceMatch[1]
      .replace(/<li[^>]*>/gi, '')
      .replace(/<\/li>/gi, '; ')
      .replace(/<strong[^>]*>/gi, '')
      .replace(/<\/strong>/gi, '')
      .replace(/<[^>]*>/gi, '')
      .trim()
      .replace(/;\s*$/, '');
  }
  
  // 生成思维模型对象
  // 注意：从HTML中提取实际内容填充到各个字段
  const model = {
    id: id,
    name: name,
    label: chineseName, // 使用提取到的中文名称作为label
    icon: 'BrainCircuit',
    description: shortDesc,
    deepAnalysis: overview,
    principle: principles,
    scope: scope,
    tips: tips,
    practice: practice,
    visualDesign: visualDesign
  };
  
  return model;
};

// 转换所有文件
const models = files.map(file => {
  const filePath = path.join(modelsDir, file);
  return convertHTMLtoJSON(filePath, file);
});

// 写入JSON文件
fs.writeFileSync(outputFile, JSON.stringify(models, null, 2), 'utf8');

console.log(`转换完成！共转换了 ${models.length} 个思维模型。`);
console.log(`结果已写入：${outputFile}`);