/**
 * 盲盒配置常量
 * 从LifeGame.tsx中提取的盲盒相关配置
 */

// 盲盒售价档位
export const BLIND_BOX_PRICES = [5, 10, 20, 30, 50, 100, 200, 1000, 2000, 3000, 5000];

// 盲盒规则说明
export const BLIND_BOX_RULES = `
1. 盲盒售价档位：${BLIND_BOX_PRICES.join(', ')}
2. 商品匹配规则：仅从商品库中抽取价格在 [盲盒售价×0.5, 盲盒售价×1.5] 区间内的商品
3. 隐藏款机制：所有档位盲盒统一设置5%概率，触发后可抽取价格=盲盒售价×2的商品
4. 每个盲盒档位独立匹配，不跨区间抽取
`;

// 隐藏款概率
export const HIDDEN_ITEM_PROBABILITY = 0.05; // 5%

// 价格区间计算函数
export function getPriceRange(blindBoxPrice: number): { min: number; max: number } {
  return {
    min: blindBoxPrice * 0.5,
    max: blindBoxPrice * 1.5,
  };
}

// 隐藏款价格计算函数
export function getHiddenItemPrice(blindBoxPrice: number): number {
  return blindBoxPrice * 2;
}
