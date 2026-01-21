import fs from 'fs/promises';
import path from 'path';

// 执行修复
(async () => {
  try {
    // 读取商品目录文件
    const catalogPath = path.join(process.cwd(), 'constants', 'shopCatalog.tsx');
    let content = await fs.readFile(catalogPath, 'utf8');

    console.log('开始修复商品图片链接...');

    // 直接替换每个有问题的商品图片链接
    
    // MacBook Pro M4
    content = content.replace(/(id: 'p_dig_2', name: 'MacBook Pro M4'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1517336712461-701df368a519?w=400&h=400&fit=crop$2");
    
    // AirPods
    content = content.replace(/(id: 'p_dig_8', name: 'AirPods'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop$2");
    
    // MacBook Pro
    content = content.replace(/(id: 'p_dig_9', name: 'MacBook Pro'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1517336712461-701df368a519?w=400&h=400&fit=crop$2");
    
    // 辣条一包
    content = content.replace(/(id: 's_food_1', name: '辣条一包'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop$2");
    
    // 烧烤
    content = content.replace(/(id: 's_food_8', name: '烧烤'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=400&fit=crop$2");
    
    // 刷短视频一小时
    content = content.replace(/(id: 's_ent_4', name: '刷短视频一小时'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=400&fit=crop$2");
    
    // 按摩放松
    content = content.replace(/(id: 's_spa_1', name: '按摩放松'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=400&h=400&fit=crop$2");
    
    // 演唱会门票
    content = content.replace(/(id: 'r_tick_3', name: '演唱会门票'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=400&fit=crop$2");
    
    // 瑜伽垫
    content = content.replace(/(id: 'r_misc_5', name: '瑜伽垫'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1549317607-28f34d30a2c3?w=400&h=400&fit=crop$2");
    
    // 宠物食品
    content = content.replace(/(id: 'r_misc_10', name: '宠物食品'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop$2");
    
    // 烧烤套餐（自制）
    content = content.replace(/(id: 's_food_15', name: '烧烤套餐（自制）'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=400&fit=crop$2");
    
    // 烧烤套餐（外买）
    content = content.replace(/(id: 's_food_16', name: '烧烤套餐（外买）'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=400&fit=crop$2");
    
    // 挪威旅行
    content = content.replace(/(id: 'r_tick_4', name: '挪威旅行'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop$2");
    
    // 体检套餐
    content = content.replace(/(id: 's_service_1', name: '体检套餐'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1584999734482-0361aecad844?w=400&h=400&fit=crop$2");
    
    // 说走就走的国际旅行
    content = content.replace(/(id: 'r_tick_8', name: '说走就走的国际旅行'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop$2");
    
    // 按摩
    content = content.replace(/(id: 's_spa_2', name: '按摩'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=400&h=400&fit=crop$2");
    
    // 素颜霜
    content = content.replace(/(id: 'p_cloth_5', name: '素颜霜'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1596462502278-27bfac4033c8?w=400&h=400&fit=crop$2");
    
    // 夹板
    content = content.replace(/(id: 'p_cloth_6', name: '夹板'.*?image: ')[^']*(')/s, 
      "$1https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=400&fit=crop$2");

    // 保存修改后的文件
    await fs.writeFile(catalogPath, content, 'utf8');
    console.log('商品图片链接修复完成！');
    console.log('已修复18个商品的图片链接。');

  } catch (err) {
    console.error('修复过程中发生错误:', err);
  }
})();