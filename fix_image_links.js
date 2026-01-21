import fs from 'fs/promises';
import path from 'path';

// 执行修复
(async () => {
  try {
    // 读取商品目录文件
    const catalogPath = path.join(process.cwd(), 'constants', 'shopCatalog.tsx');
    const catalogContent = await fs.readFile(catalogPath, 'utf8');

    // 定义每个商品的正确图片链接映射
    const productImageMap = {
      // 数码产品
      'MacBook Pro M4': 'https://images.unsplash.com/photo-1517336712461-701df368a519?w=400&h=400&fit=crop',
      'AirPods': 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop',
      'MacBook Pro': 'https://images.unsplash.com/photo-1517336712461-701df368a519?w=400&h=400&fit=crop',
      
      // 饮食
      '辣条一包': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
      '烧烤': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=400&fit=crop',
      '烧烤套餐（自制）': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=400&fit=crop',
      '烧烤套餐（外买）': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=400&fit=crop',
      
      // 娱乐
      '刷短视频一小时': 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=400&fit=crop',
      
      // 服务
      '按摩放松': 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=400&h=400&fit=crop',
      '按摩': 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=400&h=400&fit=crop',
      
      // 票务
      '演唱会门票': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=400&fit=crop',
      
      // 新增商品
      '瑜伽垫': 'https://images.unsplash.com/photo-1549317607-28f34d30a2c3?w=400&h=400&fit=crop',
      '宠物食品': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop',
      
      // 旅游类
      '挪威旅行': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop',
      '说走就走的国际旅行': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop',
      
      // 服务类
      '体检套餐': 'https://images.unsplash.com/photo-1584999734482-0361aecad844?w=400&h=400&fit=crop',
      
      // 形象设计与穿搭
      '素颜霜': 'https://images.unsplash.com/photo-1596462502278-27bfac4033c8?w=400&h=400&fit=crop',
      '夹板': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=400&fit=crop'
    };

    // 替换每个商品的图片链接
    let updatedContent = catalogContent;
    
    // 遍历每个商品，替换其图片链接
    for (const [productName, imageUrl] of Object.entries(productImageMap)) {
      // 使用正则表达式匹配每个商品的image字段并替换
      const regex = new RegExp(`(\{[^}]*?name:\s*['"]${productName}['"][^}]*?image:\s*['"])[^'"]*(['"][^}]*?\})`, 's');
      updatedContent = updatedContent.replace(regex, `$1${imageUrl}$2`);
    }

    // 写回修复后的文件
    await fs.writeFile(catalogPath, updatedContent, 'utf8');
    console.log('商品图片链接修复完成！');
    console.log('已修复以下商品的图片链接：');
    console.log(Object.keys(productImageMap).join('\n'));
    
  } catch (err) {
    console.error('修复过程中发生错误:', err);
  }
})();