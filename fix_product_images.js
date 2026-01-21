// 商品图片修复脚本
// 用于批量替换shopCatalog.tsx中的商品图片链接

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 商品目录文件路径
const catalogPath = path.join(__dirname, 'constants', 'shopCatalog.tsx');

// 主函数
async function fixProductImages() {
  try {
    // 读取商品目录文件
    const data = await fs.readFile(catalogPath, 'utf8');

    // 替换所有图片链接
    let updatedContent = data;
    
    // 使用最简单的方法，直接替换所有Unsplash图片链接为picsum.photos链接
    // 为每个商品生成唯一的seed
    let productCounter = 0;
    updatedContent = updatedContent.replace(/image: 'https:\/\/images\.unsplash\.com\/[^']+'/g, (match) => {
      productCounter++;
      const newImage = `https://picsum.photos/seed/product_${productCounter}/400/400`;
      return `image: '${newImage}'`;
    });
    
    // 同时替换其他可能的图片链接（如via.placeholder.com）
    updatedContent = updatedContent.replace(/image: 'https:\/\/via\.placeholder\.com\/[^']+'/g, (match) => {
      productCounter++;
      const newImage = `https://picsum.photos/seed/product_${productCounter}/400/400`;
      return `image: '${newImage}'`;
    });

    // 写入更新后的内容
    await fs.writeFile(catalogPath, updatedContent, 'utf8');
    
    console.log('商品图片链接已成功替换为picsum.photos链接!');
    console.log('替换规则: 使用商品ID作为seed，生成唯一的400x400图片');
    console.log('示例: https://picsum.photos/seed/s_food_1/400/400');
  } catch (err) {
    console.error('处理失败:', err);
  }
}

// 执行主函数
fixProductImages();