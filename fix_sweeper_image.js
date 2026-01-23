import fs from 'fs/promises';
import path from 'path';

// 修复扫地机器人图片链接
(async () => {
  try {
    // 读取商品目录文件
    const catalogPath = path.join(process.cwd(), 'constants', 'shopCatalog.tsx');
    let content = await fs.readFile(catalogPath, 'utf8');

    console.log('开始修复扫地机器人图片链接...');

    // 替换扫地机器人的无效图片链接为有效的图片链接
    content = content.replace(/(id: 'p_dig_11', name: '扫地机器人'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop$2");

    // 保存修改后的文件
    await fs.writeFile(catalogPath, content, 'utf8');
    console.log('扫地机器人图片链接修复完成！');

  } catch (err) {
    console.error('修复过程中发生错误:', err);
  }
})();