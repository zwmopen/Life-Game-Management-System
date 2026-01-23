// 更新辣条图片链接的最终脚本
import fs from 'fs';
import path from 'path';

// 读取商品目录文件
const shopCatalogPath = path.join(process.cwd(), 'constants', 'shopCatalog.tsx');
let content = fs.readFileSync(shopCatalogPath, 'utf8');

// 当前的辣条图片链接
const currentUrl = 'https://images.unsplash.com/photo-1611088108633-8284d4a30d92?w=400&h=400&fit=crop';

// 使用一个更可靠的食品图片链接，确保是有效的
const newLatiaoUrl = 'https://source.unsplash.com/featured/400x400/?chinese-snack,spicy,food';

// 更新商品目录中的辣条图片链接
console.log('正在更新辣条图片链接...');
console.log('当前链接:', currentUrl);
console.log('新链接:', newLatiaoUrl);

// 替换链接
const updatedContent = content.replace(currentUrl, newLatiaoUrl);

// 保存更新后的文件
fs.writeFileSync(shopCatalogPath, updatedContent, 'utf8');

console.log('辣条图片链接更新完成！');
