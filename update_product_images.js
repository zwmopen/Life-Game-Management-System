import fs from 'fs/promises';
import path from 'path';

// 执行商品图片更新
(async () => {
  try {
    // 读取商品目录文件
    const catalogPath = path.join(process.cwd(), 'constants', 'shopCatalog.tsx');
    let content = await fs.readFile(catalogPath, 'utf8');

    console.log('开始更新商品图片链接...');

    // 定义要更新的商品图片映射
    const productImageUpdates = {
      // 辣条商品图片：替换为真正的辣条产品图片
      "辣条一包": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
      
      // 网易云VIP商品图片：替换为音乐相关背景图片
      "网易云 VIP (月)": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
      
      // 看小说类商品：统一替换为玩手机相关图片
      "看小说半小时": "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400&h=400&fit=crop",
      "刷短视频半小时": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=400&fit=crop",
      "看小说一小时": "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400&h=400&fit=crop",
      
      // 服装类商品：替换为不同款式的服装图片
      "衣服一件": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      "家人衣服": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
      
      // 体检套餐：替换为医院场景照片
      "体检套餐": "https://images.unsplash.com/photo-1584999734482-0361aecad844?w=400&h=400&fit=crop",
      
      // 扫地机器人：替换为扫地机器人产品图片
      "扫地机器人": "https://images.unsplash.com/photo-1581578731548-c64697658be0?w=400&h=400&fit=crop",
      
      // 理想汽车：替换为新能源汽车图片
      "理想汽车": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=400&fit=crop"
    };

    // 执行替换
    for (const [productName, newImageUrl] of Object.entries(productImageUpdates)) {
      // 使用正则表达式匹配商品并替换图片链接
      const regex = new RegExp(`(id: '[^']+', name: '${productName}'.*?image: ')[^']*(')`, 's');
      const replacement = `$1${newImageUrl}$2`;
      content = content.replace(regex, replacement);
      console.log(`已更新 ${productName} 的图片链接`);
    }

    // 保存更新后的文件
    await fs.writeFile(catalogPath, content, 'utf8');
    console.log('所有商品图片链接更新完成！');

  } catch (err) {
    console.error('更新过程中发生错误:', err);
  }
})();