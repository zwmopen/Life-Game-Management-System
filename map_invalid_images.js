import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取shopCatalog.tsx文件
const catalogPath = path.join(__dirname, 'constants', 'shopCatalog.tsx');
const content = fs.readFileSync(catalogPath, 'utf8');

// 读取无效链接文件
const invalidLinksPath = path.join(__dirname, 'invalid_image_links.txt');
const invalidLinksContent = fs.readFileSync(invalidLinksPath, 'utf8');
const invalidLinks = invalidLinksContent.trim().split('\n');

// 提取商品信息
const shopItemRegex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*description:\s*'([^']+)',\s*cost:\s*(\d+),\s*type:\s*'([^']+)',\s*owned:\s*(false|true),\s*icon:\s*<([^>]+)>,\s*category:\s*'([^']+)',\s*image:\s*'([^']+)'\s*\}/g;
const shopItems = [];
let match;

while ((match = shopItemRegex.exec(content)) !== null) {
  shopItems.push({
    id: match[1],
    name: match[2],
    description: match[3],
    cost: parseInt(match[4]),
    type: match[5],
    owned: match[6] === 'true',
    icon: match[7],
    category: match[8],
    image: match[9]
  });
}

// 映射无效链接到商品
const invalidImageMap = [];

for (const item of shopItems) {
  if (invalidLinks.includes(item.image)) {
    invalidImageMap.push({
      item,
      invalidUrl: item.image
    });
  }
}

console.log(`共找到 ${invalidImageMap.length} 个无效图片对应的商品`);

// 保存映射结果
fs.writeFileSync('invalid_image_map.json', JSON.stringify(invalidImageMap, null, 2));
console.log('无效图片映射已保存到 invalid_image_map.json');

// 输出映射结果
for (const entry of invalidImageMap) {
  console.log(`商品名称: ${entry.item.name}`);
  console.log(`无效链接: ${entry.invalidUrl}`);
  console.log(`商品ID: ${entry.item.id}`);
  console.log(`商品分类: ${entry.item.category}`);
  console.log('---');
}
