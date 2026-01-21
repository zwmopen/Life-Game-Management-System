import { readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 使用更可靠的图片URL检查函数
async function checkImageUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    return response.ok;
  } catch (error) {
    console.error(`检查URL时出错: ${url}`, error.message);
    return false;
  }
}

// 生成新的图片链接 - 使用公共CDN上的稳定图片
function generateNewImageUrl(productName, category) {
  // 基于商品分类选择不同的图片集合
  const categoryImages = {
    '数码': [
      'https://picsum.photos/400/400?random=100',
      'https://picsum.photos/400/400?random=101',
      'https://picsum.photos/400/400?random=102',
      'https://picsum.photos/400/400?random=103',
      'https://picsum.photos/400/400?random=104'
    ],
    '吃喝': [
      'https://picsum.photos/400/400?random=200',
      'https://picsum.photos/400/400?random=201',
      'https://picsum.photos/400/400?random=202',
      'https://picsum.photos/400/400?random=203',
      'https://picsum.photos/400/400?random=204'
    ],
    '饮食': [
      'https://picsum.photos/400/400?random=205',
      'https://picsum.photos/400/400?random=206',
      'https://picsum.photos/400/400?random=207',
      'https://picsum.photos/400/400?random=208',
      'https://picsum.photos/400/400?random=209'
    ],
    '休闲娱乐': [
      'https://picsum.photos/400/400?random=300',
      'https://picsum.photos/400/400?random=301',
      'https://picsum.photos/400/400?random=302',
      'https://picsum.photos/400/400?random=303',
      'https://picsum.photos/400/400?random=304'
    ],
    '会员充值': [
      'https://picsum.photos/400/400?random=400',
      'https://picsum.photos/400/400?random=401',
      'https://picsum.photos/400/400?random=402',
      'https://picsum.photos/400/400?random=403',
      'https://picsum.photos/400/400?random=404'
    ],
    '家居': [
      'https://picsum.photos/400/400?random=500',
      'https://picsum.photos/400/400?random=501',
      'https://picsum.photos/400/400?random=502',
      'https://picsum.photos/400/400?random=503',
      'https://picsum.photos/400/400?random=504'
    ],
    '形象设计与穿搭': [
      'https://picsum.photos/400/400?random=600',
      'https://picsum.photos/400/400?random=601',
      'https://picsum.photos/400/400?random=602',
      'https://picsum.photos/400/400?random=603',
      'https://picsum.photos/400/400?random=604'
    ],
    '默认': [
      'https://picsum.photos/400/400?random=700',
      'https://picsum.photos/400/400?random=701',
      'https://picsum.photos/400/400?random=702',
      'https://picsum.photos/400/400?random=703',
      'https://picsum.photos/400/400?random=704'
    ]
  };

  // 根据分类选择图片集合
  const imagePool = categoryImages[category] || categoryImages['默认'];
  // 使用商品名称的哈希值选择一个固定的图片
  const hash = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageIndex = hash % imagePool.length;
  
  return imagePool[imageIndex];
}

async function main() {
  console.log('开始商品图片链接修复...');
  
  // 读取shopCatalog.tsx文件
  const shopCatalogPath = join(__dirname, 'constants', 'shopCatalog.tsx');
  let content = await readFile(shopCatalogPath, 'utf-8');
  
  // 提取所有商品信息
  const productRegex = /\{\s*id:\s*'(.*?)',\s*name:\s*'(.*?)',\s*description:\s*'(.*?)',\s*cost:\s*(\d+(\.\d+)?),\s*type:\s*'(.*?)',\s*owned:\s*(true|false),\s*icon:\s*<([^>]+)>,\s*category:\s*'(.*?)',\s*image:\s*'(.*?)'\s*\}/g;
  
  const products = [];
  let match;
  while ((match = productRegex.exec(content)) !== null) {
    products.push({
      id: match[1],
      name: match[2],
      description: match[3],
      cost: parseFloat(match[4]),
      type: match[6],
      owned: match[7] === 'true',
      icon: match[8],
      category: match[9],
      image: match[10]
    });
  }
  
  console.log(`共发现 ${products.length} 个商品`);
  
  // 第一步：检测所有链接
  console.log('\n第一步：检测所有图片链接...');
  const invalidProducts = [];
  
  for (const product of products) {
    console.log(`检测商品：${product.name}`);
    console.log(`  链接：${product.image}`);
    
    const isValid = await checkImageUrl(product.image);
    if (!isValid) {
      console.log('  ❌ 无效链接');
      invalidProducts.push(product);
    } else {
      console.log('  ✅ 有效链接');
    }
    console.log('---');
  }
  
  console.log(`\n共发现 ${invalidProducts.length} 个无效图片链接`);
  
  if (invalidProducts.length === 0) {
    console.log('所有链接均有效，无需修复！');
    return;
  }
  
  // 第二步：修复无效链接
  console.log('\n第二步：修复无效图片链接...');
  
  for (const product of invalidProducts) {
    console.log(`\n修复商品：${product.name}`);
    console.log(`原链接：${product.image}`);
    
    // 生成新链接
    let newImageUrl = generateNewImageUrl(product.name, product.category);
    console.log(`生成新链接：${newImageUrl}`);
    
    // 验证新链接
    let isValid = await checkImageUrl(newImageUrl);
    let attempts = 0;
    const maxAttempts = 5;
    
    // 如果新链接无效，尝试其他链接
    while (!isValid && attempts < maxAttempts) {
      console.log(`  新链接无效，尝试其他链接... (${attempts + 1}/${maxAttempts})`);
      newImageUrl = generateNewImageUrl(product.name + attempts, product.category);
      isValid = await checkImageUrl(newImageUrl);
      attempts++;
    }
    
    if (isValid) {
      console.log('  ✅ 新链接有效');
      
      // 替换原有链接
      const productStrRegex = new RegExp(`id:\s*'${product.id}',\s*name:\s*'${product.name}',\s*description:\s*'${product.description}',\s*cost:\s*${product.cost},\s*type:\s*'${product.type}',\s*owned:\s*${product.owned},\s*icon:\s*<${product.icon}>,\s*category:\s*'${product.category}',\s*image:\s*'${product.image}'`);
      content = content.replace(productStrRegex, `id: '${product.id}', name: '${product.name}', description: '${product.description}', cost: ${product.cost}, type: '${product.type}', owned: ${product.owned}, icon: <${product.icon}>, category: '${product.category}', image: '${newImageUrl}'`);
      
      console.log('  ✅ 链接已替换');
    } else {
      console.log('  ❌ 无法生成有效链接，跳过该商品');
    }
  }
  
  // 保存修复后的文件
  await writeFile(shopCatalogPath, content, 'utf-8');
  console.log('\n修复完成，文件已保存！');
  
  // 第三步：验证修复结果
  console.log('\n第三步：验证修复结果...');
  
  // 重新读取文件并验证
  const updatedContent = await readFile(shopCatalogPath, 'utf-8');
  const updatedProducts = [];
  
  let updatedMatch;
  const updatedProductRegex = /\{\s*id:\s*'(.*?)',\s*name:\s*'(.*?)',\s*description:\s*'(.*?)',\s*cost:\s*(\d+(\.\d+)?),\s*type:\s*'(.*?)',\s*owned:\s*(true|false),\s*icon:\s*<([^>]+)>,\s*category:\s*'(.*?)',\s*image:\s*'(.*?)'\s*\}/g;
  
  while ((updatedMatch = updatedProductRegex.exec(updatedContent)) !== null) {
    updatedProducts.push({
      id: updatedMatch[1],
      name: updatedMatch[2],
      category: updatedMatch[9],
      image: updatedMatch[10]
    });
  }
  
  console.log(`\n验证 ${updatedProducts.length} 个商品链接...`);
  let fixCount = 0;
  let stillInvalidCount = 0;
  
  for (const product of updatedProducts) {
    const isValid = await checkImageUrl(product.image);
    if (!isValid) {
      console.log(`❌ ${product.name} - ${product.image}`);
      stillInvalidCount++;
    } else {
      // 只显示修复过的商品
      const originalProduct = invalidProducts.find(p => p.id === product.id);
      if (originalProduct) {
        console.log(`✅ ${product.name} - ${product.image}`);
        fixCount++;
      }
    }
  }
  
  console.log('\n修复验证结果：');
  console.log(`✅ 成功修复：${fixCount} 个`);
  console.log(`❌ 仍无效：${stillInvalidCount} 个`);
  
  if (stillInvalidCount === 0) {
    console.log('\n🎉 所有商品图片链接均已修复并验证有效！');
  } else {
    console.log(`\n⚠️  还有 ${stillInvalidCount} 个商品图片链接无效，建议手动检查。`);
  }
}

main().catch(error => {
  console.error('修复过程中发生错误：', error);
  process.exit(1);
});
