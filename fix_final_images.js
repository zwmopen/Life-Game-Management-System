import fs from 'fs/promises';
import path from 'path';

// 执行最终修复
(async () => {
  try {
    // 读取商品目录文件
    const catalogPath = path.join(process.cwd(), 'constants', 'shopCatalog.tsx');
    let content = await fs.readFile(catalogPath, 'utf8');

    console.log('开始修复剩余的4个商品图片链接...');

    // 修复剩余的无效链接，使用新的有效图片链接
    
    // MacBook Pro M4 - 使用新的有效MacBook图片
    content = content.replace(/(id: 'p_dig_2', name: 'MacBook Pro M4'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop$2");
    
    // MacBook Pro - 使用新的有效MacBook图片
    content = content.replace(/(id: 'p_dig_9', name: 'MacBook Pro'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop$2");
    
    // 瑜伽垫 - 使用新的有效瑜伽垫图片
    content = content.replace(/(id: 'r_misc_5', name: '瑜伽垫'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop$2");
    
    // 素颜霜 - 使用新的有效化妆品图片
    content = content.replace(/(id: 'p_cloth_5', name: '素颜霜'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1622253434136-e1988b1f2000?w=400&h=400&fit=crop$2");

    // 保存修改后的文件
    await fs.writeFile(catalogPath, content, 'utf8');
    console.log('剩余商品图片链接修复完成！');
    console.log('已修复4个商品的图片链接。');

  } catch (err) {
    console.error('修复过程中发生错误:', err);
  }
})();