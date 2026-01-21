import fs from 'fs/promises';
import path from 'path';
import https from 'https';

// 执行检查
(async () => {
  try {
    // 读取商品目录文件
    const catalogPath = path.join(process.cwd(), 'constants', 'shopCatalog.tsx');
    const catalogContent = await fs.readFile(catalogPath, 'utf8');

    // 提取所有图片链接和对应的商品信息
    const extractImageLinks = (content) => {
      const items = [];
      const itemRegex = /\{\s*id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"],.*?image:\s*['"]([^'"]+)['"]/gs;
      let match;
      
      while ((match = itemRegex.exec(content)) !== null) {
        const [, id, name, imageUrl] = match;
        items.push({ id, name, imageUrl });
      }
      
      return items;
    };

    // 验证图片链接是否有效
    const validateImageLink = (url) => {
      return new Promise((resolve) => {
        https.get(url, (res) => {
          if (res.statusCode === 200) {
            resolve({ valid: true, status: res.statusCode });
          } else {
            resolve({ valid: false, status: res.statusCode });
          }
        }).on('error', (err) => {
          resolve({ valid: false, error: err.message });
        });
      });
    };

    // 检查图片链接
    const checkImageLinks = async () => {
      const items = extractImageLinks(catalogContent);
      console.log(`找到 ${items.length} 个商品，开始检查图片链接...`);
      
      const results = [];
      
      for (const item of items) {
        console.log(`检查: ${item.name} - ${item.imageUrl}`);
        const result = await validateImageLink(item.imageUrl);
        results.push({ ...item, ...result });
        
        // 延迟一下，避免请求过快
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // 输出结果
      console.log('\n=== 检查结果 ===');
      console.log(`总商品数: ${results.length}`);
      
      const validItems = results.filter(r => r.valid);
      console.log(`有效链接: ${validItems.length}`);
      
      const invalidItems = results.filter(r => !r.valid);
      console.log(`无效链接: ${invalidItems.length}`);
      
      if (invalidItems.length > 0) {
        console.log('\n无效链接列表:');
        invalidItems.forEach(item => {
          console.log(`${item.name} (${item.id}): ${item.imageUrl} - 错误: ${item.status || item.error}`);
        });
      }
      
      return { validItems, invalidItems };
    };

    await checkImageLinks();
  } catch (err) {
    console.error('检查过程中发生错误:', err);
  }
})();