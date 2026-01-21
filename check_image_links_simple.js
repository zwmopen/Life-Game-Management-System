import { createReadStream } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 简单的图片URL检查函数
async function checkImageUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('开始检查商品图片链接...');
  
  // 读取shopCatalog.tsx文件
  const shopCatalogPath = join(__dirname, 'constants', 'shopCatalog.tsx');
  const content = await readFile(shopCatalogPath, 'utf-8');
  
  // 提取所有图片URL
  const imageUrlRegex = /image:\s*'(.*?)'/g;
  const productNameRegex = /name:\s*'(.*?)'/g;
  
  const productNames = [...content.matchAll(productNameRegex)].map(match => match[1]);
  const imageUrls = [...content.matchAll(imageUrlRegex)].map(match => match[1]);
  
  console.log(`发现 ${productNames.length} 个商品`);
  console.log(`发现 ${imageUrls.length} 个图片URL`);
  
  const invalidImages = [];
  
  // 检查每个图片URL
  for (let i = 0; i < productNames.length; i++) {
    const productName = productNames[i];
    const imageUrl = imageUrls[i];
    
    if (imageUrl) {
      console.log(`检查商品：${productName}`);
      console.log(`  链接：${imageUrl}`);
      
      const isValid = await checkImageUrl(imageUrl);
      if (!isValid) {
        console.log('  ❌ 无效链接');
        invalidImages.push({
          productName,
          imageUrl
        });
      } else {
        console.log('  ✅ 有效链接');
      }
      console.log('---');
    }
  }
  
  console.log('图片链接检查完成！');
  if (invalidImages.length > 0) {
    console.log(`共发现 ${invalidImages.length} 个无效图片链接：`);
    invalidImages.forEach((item, index) => {
      console.log(`${index + 1}. 商品：${item.productName}`);
      console.log(`   无效链接：${item.imageUrl}`);
      console.log('---');
    });
    
    // 写入无效链接到文件，方便后续处理
    const invalidLinksPath = join(__dirname, 'invalid_image_links.json');
    const invalidLinksJson = JSON.stringify(invalidImages, null, 2);
    await writeFile(invalidLinksPath, invalidLinksJson, 'utf-8');
    console.log(`无效链接已保存到：${invalidLinksPath}`);
    
    process.exit(1);
  } else {
    console.log('所有图片链接均有效！');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('检查过程中发生错误：', error);
  process.exit(1);
});
