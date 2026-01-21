import fs from 'fs/promises';
import path from 'path';

// 执行最终修复
(async () => {
  try {
    // 读取商品目录文件
    const catalogPath = path.join(process.cwd(), 'constants', 'shopCatalog.tsx');
    let content = await fs.readFile(catalogPath, 'utf8');

    console.log('开始修复最后一个商品图片链接...');

    // 修复素颜霜的无效链接，使用新的有效化妆品图片
    content = content.replace(/(id: 'p_cloth_5', name: '素颜霜'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop$2");

    // 保存修改后的文件
    await fs.writeFile(catalogPath, content, 'utf8');
    console.log('最后一个商品图片链接修复完成！');
    console.log('已修复素颜霜的图片链接。');

  } catch (err) {
    console.error('修复过程中发生错误:', err);
  }
})();