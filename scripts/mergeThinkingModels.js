/**
 * 合并思维模型JSON文件
 * 将 data/thinking-models/ 目录下的所有JSON文件合并为一个大的JSON文件
 * 用于前端应用加载
 */
import fs from 'fs';
import path from 'path';

const sourceDir = 'data/thinking-models';
const targetFile = 'components/thinkingModels.json';

console.log('正在合并思维模型JSON文件...');

// 读取索引文件
const indexPath = path.join(sourceDir, '_index.json');
if (!fs.existsSync(indexPath)) {
  console.error('索引文件不存在，请先运行拆分脚本');
  process.exit(1);
}

const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
console.log(`找到 ${indexData.total} 个模型`);

// 读取所有模型文件
const models = [];
const files = fs.readdirSync(sourceDir);

files.forEach(file => {
  if (file === '_index.json' || !file.endsWith('.json')) {
    return;
  }
  
  const filePath = path.join(sourceDir, file);
  try {
    const model = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    models.push(model);
  } catch (error) {
    console.error(`读取文件失败: ${file}`, error);
  }
});

// 按索引顺序排序
const sortedModels = indexData.models.map((indexModel) => {
  return models.find(m => m.id === indexModel.id);
}).filter(Boolean);

console.log(`成功读取 ${sortedModels.length} 个模型`);

// 写入合并后的文件
fs.writeFileSync(targetFile, JSON.stringify(sortedModels, null, 2), 'utf8');

console.log(`\n合并完成！`);
console.log(`- 源目录: ${sourceDir}`);
console.log(`- 目标文件: ${targetFile}`);
console.log(`- 总计: ${sortedModels.length} 个模型`);
