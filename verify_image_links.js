import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取shopCatalog.tsx文件
const shopCatalogPath = path.join(__dirname, 'constants', 'shopCatalog.tsx');
const shopCatalogContent = fs.readFileSync(shopCatalogPath, 'utf-8');

// 提取所有图片URL
const imageUrlRegex = /image:\s*'([^']+)'/g;
const imageUrls = [];
let match;

while ((match = imageUrlRegex.exec(shopCatalogContent)) !== null) {
  imageUrls.push(match[1]);
}

console.log(`总共找到 ${imageUrls.length} 个图片链接`);
console.log('开始验证图片链接...');

// 验证图片链接
async function verifyImageUrls() {
  const results = [];
  
  for (const url of imageUrls) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok) {
        results.push({ url, status: 'valid' });
      } else {
        results.push({ url, status: 'invalid', statusCode: response.status });
      }
    } catch (error) {
      results.push({ url, status: 'error', error: error.message });
    }
  }
  
  return results;
}

// 运行验证
verifyImageUrls().then(results => {
  const validUrls = results.filter(r => r.status === 'valid');
  const invalidUrls = results.filter(r => r.status !== 'valid');
  
  console.log(`\n验证结果：`);
  console.log(`有效链接：${validUrls.length}`);
  console.log(`无效链接：${invalidUrls.length}`);
  
  if (invalidUrls.length > 0) {
    console.log('\n无效链接列表：');
    invalidUrls.forEach(result => {
      console.log(`- ${result.url} (${result.status}: ${result.statusCode || result.error})`);
    });
  } else {
    console.log('\n所有图片链接都是有效的！');
  }
});
