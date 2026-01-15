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
  // 根据商品名称生成更合适的图片链接
  const keyword = generateImageSearchKeyword(productName);
  
  // 针对特定商品类型使用不同的图片源
  const lowerKeyword = keyword.toLowerCase();
  
  if (lowerKeyword.includes("食物") || lowerKeyword.includes("饮食") || lowerKeyword.includes("鸡腿") || lowerKeyword.includes("鸡排") || lowerKeyword.includes("烤鱼") || lowerKeyword.includes("烧烤") || lowerKeyword.includes("奶茶") || lowerKeyword.includes("饮料") || lowerKeyword.includes("日历")) {
    // 食物类商品
    return `https://images.unsplash.com/featured/400x400?food,${encodeURIComponent(keyword)}`;
  } else if (lowerKeyword.includes("书") || lowerKeyword.includes("小说") || lowerKeyword.includes("课程") || lowerKeyword.includes("知识")) {
    // 书籍/知识类商品
    return `https://images.unsplash.com/featured/400x400?book,reading,${encodeURIComponent(keyword)}`;
  } else if (lowerKeyword.includes("健身") || lowerKeyword.includes("运动") || lowerKeyword.includes("瑜伽") || lowerKeyword.includes("爬山") || lowerKeyword.includes("跑步")) {
    // 运动健身类商品
    return `https://images.unsplash.com/featured/400x400?fitness,sport,exercise,${encodeURIComponent(keyword)}`;
  } else if (lowerKeyword.includes("按摩") || lowerKeyword.includes("理发") || lowerKeyword.includes("放松") || lowerKeyword.includes("spa")) {
    // 服务类商品
    return `https://images.unsplash.com/featured/400x400?service,relax,${encodeURIComponent(keyword)}`;
  } else if (lowerKeyword.includes("社群") || lowerKeyword.includes("门票") || lowerKeyword.includes("会员") || lowerKeyword.includes("交流")) {
    // 社群/会员类商品
    return `https://images.unsplash.com/featured/400x400?community,people,${encodeURIComponent(keyword)}`;
  } else if (lowerKeyword.includes("衣服") || lowerKeyword.includes("裤子") || lowerKeyword.includes("鞋子") || lowerKeyword.includes("服装") || lowerKeyword.includes("素颜霜")) {
    // 服饰美容类商品
    return `https://images.unsplash.com/featured/400x400?clothing,fashion,${encodeURIComponent(keyword)}`;
  } else if (lowerKeyword.includes("数码") || lowerKeyword.includes("键盘") || lowerKeyword.includes("手表") || lowerKeyword.includes("耳机") || lowerKeyword.includes("手机") || lowerKeyword.includes("电脑") || lowerKeyword.includes("相机") || lowerKeyword.includes("音响")) {
    // 数码类商品
    return `https://images.unsplash.com/featured/400x400?technology,gadget,electronics,${encodeURIComponent(keyword)}`;
  } else if (lowerKeyword.includes("家居") || lowerKeyword.includes("家具") || lowerKeyword.includes("床垫") || lowerKeyword.includes("枕头") || lowerKeyword.includes("台灯") || lowerKeyword.includes("厨房") || lowerKeyword.includes("椅子") || lowerKeyword.includes("沙发")) {
    // 家居类商品
    return `https://images.unsplash.com/featured/400x400?home,furniture,household,${encodeURIComponent(keyword)}`;
  } else if (lowerKeyword.includes("票") || lowerKeyword.includes("旅游") || lowerKeyword.includes("旅行") || lowerKeyword.includes("电影") || lowerKeyword.includes("演唱会") || lowerKeyword.includes("门票")) {
    // 票务/旅游类商品
    return `https://images.unsplash.com/featured/400x400?ticket,travel,event,${encodeURIComponent(keyword)}`;
  } else {
    // 默认使用通用图片
    return `https://images.unsplash.com/featured/400x400?product,item,${encodeURIComponent(keyword)}`;
  }
};

/**
 * 检查商品图片并修复失效链接
 * @param products 商品数组
 * @returns Promise<Product[]> 修复后的商品数组
 */
export const checkAndFixProductImages = async (products: Product[]): Promise<Product[]> => {
  const productsWithImages = products.filter(product => product.image && product.image.trim() !== '');
  const imageUrls = productsWithImages.map(product => product.image);
  
  // 静默处理图片检查开始的情况
  
  const checkResults = await checkImageUrlsInBatches(imageUrls);
  const invalidUrls = checkResults.filter(result => !result.isAvailable).map(result => result.url);
  
  // 静默处理图片检查完成的情况
  
  // 修复失效链接
  const fixedProducts = products.map(product => {
    if (product.image && invalidUrls.includes(product.image)) {
      // 静默处理商品图片修复的情况
      return {
        ...product,
        image: generateRecommendedImageUrl(product.name)
      };
    }
    return product;
  });
  
  return fixedProducts;
};
