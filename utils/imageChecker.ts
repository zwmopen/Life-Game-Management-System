// 图片检查工具函数
import { Product } from '../types';

/**
 * 检查单个图片链接是否可用
 * @param url 图片链接
 * @returns Promise<boolean> 是否可用
 */
export const checkImageUrl = async (url: string): Promise<boolean> => {
  if (!url || url.trim() === '') return false;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // 设置超时时间为5秒
    setTimeout(() => resolve(false), 5000);
  });
};

/**
 * 批量检查图片链接
 * @param urls 图片链接数组
 * @param batchSize 每批次检查数量
 * @returns Promise<Array<{url: string, isAvailable: boolean}>> 检查结果
 */
export const checkImageUrlsInBatches = async (
  urls: string[],
  batchSize: number = 10
): Promise<Array<{ url: string; isAvailable: boolean }>> => {
  const results: Array<{ url: string; isAvailable: boolean }> = [];
  
  // 去重处理
  const uniqueUrls = Array.from(new Set(urls));
  
  // 分批次处理
  for (let i = 0; i < uniqueUrls.length; i += batchSize) {
    const batch = uniqueUrls.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (url) => {
        const isAvailable = await checkImageUrl(url);
        return { url, isAvailable };
      })
    );
    
    results.push(...batchResults);
    
    // 每批次之间暂停1秒，避免请求过于频繁
    if (i + batchSize < uniqueUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
};

/**
 * 根据商品名称生成合适的图片搜索关键词
 * @param productName 商品名称
 * @returns string 搜索关键词
 */
export const generateImageSearchKeyword = (productName: string): string => {
  // 移除特殊字符和数字
  const keyword = productName
    .replace(/[0-9]/g, '')
    .replace(/[^一-龥a-zA-Z]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
  
  return keyword;
};

/**
 * 为失效图片生成推荐替代链接（根据商品名称）
 * @param productName 商品名称
 * @returns string 推荐的图片链接
 */
export const generateRecommendedImageUrl = (productName: string): string => {
  // 这里可以根据实际需求实现更复杂的推荐逻辑
  // 目前使用占位图片服务
  const keyword = generateImageSearchKeyword(productName);
  return `https://via.placeholder.com/100?text=${encodeURIComponent(keyword)}`;
};

/**
 * 检查商品图片并修复失效链接
 * @param products 商品数组
 * @returns Promise<Product[]> 修复后的商品数组
 */
export const checkAndFixProductImages = async (products: Product[]): Promise<Product[]> => {
  const productsWithImages = products.filter(product => product.image && product.image.trim() !== '');
  const imageUrls = productsWithImages.map(product => product.image);
  
  console.log(`开始检查 ${imageUrls.length} 个商品图片链接...`);
  
  const checkResults = await checkImageUrlsInBatches(imageUrls);
  const invalidUrls = checkResults.filter(result => !result.isAvailable).map(result => result.url);
  
  console.log(`检查完成，发现 ${invalidUrls.length} 个失效链接`);
  
  // 修复失效链接
  const fixedProducts = products.map(product => {
    if (product.image && invalidUrls.includes(product.image)) {
      console.log(`修复商品图片: ${product.name} - ${product.image}`);
      return {
        ...product,
        image: generateRecommendedImageUrl(product.name)
      };
    }
    return product;
  });
  
  return fixedProducts;
};
