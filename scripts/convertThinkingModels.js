import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 思维模型文件夹路径
const thinkingModelsDir = 'd:\\AI编程\\人生游戏管理系统\\思维模型';
const thinkingModelsSourceDir = 'd:\\AI编程\\人生游戏管理系统\\thinking-models';

// 确保思维模型文件夹存在
if (!fs.existsSync(thinkingModelsDir)) {
  fs.mkdirSync(thinkingModelsDir, { recursive: true });
}

// 检查源文件夹是否存在
if (!fs.existsSync(thinkingModelsSourceDir)) {
  console.error(`错误：源文件夹 ${thinkingModelsSourceDir} 不存在！`);
  process.exit(1);
}

// 读取所有HTML文件
const htmlFiles = fs.readdirSync(thinkingModelsSourceDir).filter(file => file.endsWith('.html'));

// 转换HTML文件为上图下文格式
function convertToTopBottomLayout(htmlContent, modelName) {
  // 提取SVG内容
  const svgMatch = htmlContent.match(/<svg[^>]*>.*?<\/svg>/s);
  const svgContent = svgMatch ? svgMatch[0] : '';
  
  // 提取文本内容
  const textMatch = htmlContent.match(/<div[^>]*class="content|text|analysis"[^>]*>.*?<\/div>/is);
  const textContent = textMatch ? textMatch[0] : `<div class="content">
  <h2>${modelName}</h2>
  <p>这是一个思维模型，用于辅助思考和决策。</p>
  <div class="analysis-grid">
    <div class="analysis-section">
      <h3>核心逻辑</h3>
      <p>该思维模型的核心逻辑是...</p>
    </div>
    <div class="analysis-section">
      <h3>执行准则</h3>
      <p>使用该模型时应遵循的准则...</p>
    </div>
  </div>
</div>`;
  
  // 生成新的HTML内容，采用上图下文格式
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${modelName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background-color: #e0e5ec;
            font-family: 'Microsoft YaHei', sans-serif;
            color: #2d3748;
        }
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        /* 上图下文模式：上半部分50vh */
        .svg-container {
            height: 50vh;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 8px 8px 16px rgba(163, 177, 198, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.8);
            margin-bottom: 20px;
            overflow: hidden;
        }
        .svg-container svg {
            width: 100%;
            height: 100%;
            viewBox: 0 0 1000 600;
        }
        /* 深度解析区 */
        .analysis-container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 8px 8px 16px rgba(163, 177, 198, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.8);
            padding: 30px;
        }
        .analysis-container h1 {
            font-size: 4.5rem;
            font-weight: 900;
            letter-spacing: -2px;
            color: #2d3748;
            margin-bottom: 20px;
            text-align: center;
        }
        .analysis-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 30px;
        }
        .analysis-section {
            background-color: #f7fafc;
            padding: 20px;
            border-radius: 8px;
        }
        .analysis-section h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 15px;
        }
        .analysis-section h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 10px;
        }
        .analysis-section p {
            font-size: 1rem;
            line-height: 1.6;
            color: #4a5568;
            margin-bottom: 10px;
        }
        .analysis-section ul {
            list-style: none;
            padding: 0;
        }
        .analysis-section li {
            font-size: 1rem;
            line-height: 1.6;
            color: #4a5568;
            margin-bottom: 8px;
        }
        .analysis-section strong {
            color: #2d3748;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 上半部分：SVG物理动效展示区 -->
        <div class="svg-container">
            ${svgContent || '<svg width="100%" height="100%" viewBox="0 0 1000 600"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" fill="#666" font-size="24">思维模型可视化</text></svg>'}
        </div>
        
        <!-- 下半部分：深度解析区 -->
        <div class="analysis-container">
            <h1>${modelName}</h1>
            
            <div class="analysis-grid">
                ${textContent}
            </div>
        </div>
    </div>
</body>
</html>`;
}

// 转换所有HTML文件
htmlFiles.forEach(file => {
  try {
    const filePath = path.join(thinkingModelsSourceDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 提取模型名称（从文件名或HTML内容中）
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    let modelName = titleMatch ? titleMatch[1] : path.basename(file, '.html');
    
    // 清理模型名称
    modelName = modelName.replace(/[\d_-]/g, ' ').trim();
    
    // 生成英文ID（使用文件名的英文部分）
    const englishId = path.basename(file, '.html').toLowerCase();
    
    // 转换为上图下文格式
    const convertedContent = convertToTopBottomLayout(content, modelName);
    
    // 生成文件名：先中文后英文
    const fileName = `${modelName}_${englishId}.html`;
    
    // 保存到思维模型文件夹
    const outputPath = path.join(thinkingModelsDir, fileName);
    fs.writeFileSync(outputPath, convertedContent, 'utf8');
    
    console.log(`转换完成：${fileName}`);
  } catch (error) {
    console.error(`转换失败 ${file}：${error.message}`);
  }
});

console.log('\n所有思维模型已转换为HTML格式！');