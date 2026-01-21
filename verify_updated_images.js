import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 需要测试的商品名称列表
const targetItems = [
  'MacBook Pro M4',
  'AirPods',
  'MacBook Pro',
  '辣条一包',
  '烧烤',
  '刷短视频一小时',
  '按摩放松',
  '演唱会门票',
  '瑜伽垫',
  '宠物食品',
  '烧烤套餐（自制）',
  '烧烤套餐（外买）',
  '挪威旅行',
  '体检套餐',
  '说走就走的国际旅行',
  '素颜霜',
  '夹板'
];

// 读取shopCatalog.tsx文件
const shopCatalogPath = path.join(__dirname, 'constants', 'shopCatalog.tsx');
const shopCatalogContent = fs.readFileSync(shopCatalogPath, 'utf-8');

// 提取所有商品数据
const items = [];
const itemRegex = /{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*description:\s*'([^']+)',\s*cost:\s*(\d+),\s*type:\s*'([^']+)',\s*owned:\s*(true|false),\s*icon:\s*<([^>]+)>,\s*category:\s*'([^']+)',\s*image:\s*'([^']+)'\s*}/g;
let match;

while ((match = itemRegex.exec(shopCatalogContent)) !== null) {
  const [, id, name, description, cost, type, owned, icon, category, image] = match;
  if (targetItems.includes(name)) {
    items.push({
      id,
      name,
      image
    });
  }
}

console.log(`找到 ${items.length} 个需要测试的商品图片链接`);
console.log('开始测试图片链接...');

// 测试图片链接
async function testImageUrls(items) {
  const results = [];
  
  for (const item of items) {
    try {
      const response = await fetch(item.image, { method: 'GET' });
      if (response.ok) {
        results.push({ item, status: 'valid', statusCode: response.status });
      } else {
        results.push({ item, status: 'invalid', statusCode: response.status });
      }
    } catch (error) {
      results.push({ item, status: 'error', error: error.message });
    }
  }
  
  return results;
}

// 运行测试
testImageUrls(items).then(results => {
  const validUrls = results.filter(r => r.status === 'valid');
  const invalidUrls = results.filter(r => r.status !== 'valid');
  
  console.log(`\n测试结果：`);
  console.log(`有效链接：${validUrls.length}`);
  console.log(`无效链接：${invalidUrls.length}`);
  
  if (invalidUrls.length > 0) {
    console.log('\n无效链接列表：');
    invalidUrls.forEach(result => {
      console.log(`- ${result.item.name}: ${result.item.image} (${result.status}: ${result.statusCode || result.error})`);
    });
  } else {
    console.log('\n所有图片链接都是有效的！');
  }
});
