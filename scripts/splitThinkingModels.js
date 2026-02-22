/**
 * 拆分思维模型JSON文件为单独的JSON文件
 * 将 thinkingModels.json 拆分为 data/thinking-models/ 目录下的单独文件
 */
import fs from 'fs';
import path from 'path';

const sourceFile = 'components/thinkingModels.json';
const targetDir = 'data/thinking-models';

// 确保目标目录存在
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 读取源文件
const models = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

console.log(`正在拆分 ${models.length} 个思维模型...`);

// 为每个模型创建单独的文件
models.forEach((model, index) => {
  // 使用模型的id作为文件名，处理特殊字符
  const fileName = model.id
    .replace(/[\/\\?%*:|"<>]/g, '_') // 替换非法字符
    .replace(/\s+/g, '_') // 替换空格
    + '.json';
  
  const filePath = path.join(targetDir, fileName);
  
  fs.writeFileSync(filePath, JSON.stringify(model, null, 2), 'utf8');
  console.log(`${index + 1}. 已创建: ${fileName}`);
});

// 创建索引文件
const indexData = {
  total: models.length,
  lastUpdated: new Date().toISOString(),
  models: models.map(m => ({
    id: m.id,
    name: m.name,
    label: m.label,
    icon: m.icon,
    description: m.description
  }))
};

fs.writeFileSync(
  path.join(targetDir, '_index.json'),
  JSON.stringify(indexData, null, 2),
  'utf8'
);

console.log(`\n拆分完成！`);
console.log(`- 总计: ${models.length} 个模型`);
console.log(`- 目录: ${targetDir}`);
console.log(`- 索引: ${targetDir}/_index.json`);
