import React from 'react';

/**
 * ShopCatalog组件的类型定义
 */

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'physical' | 'rights' | 'leisure';
  owned?: boolean;
  icon: React.ReactNode;
  category: string;
  image?: string;
  purchaseCount?: number;
  lastPurchased?: number;
}

export interface ShopCatalogProps {
  // 商品数据
  inventory: ShopItem[];
  setInventory: (inventory: ShopItem[] | ((prev: ShopItem[]) => ShopItem[])) => void;
  
  // 商品过滤
  shopFilter: 'all' | 'physical' | 'rights' | 'leisure' | 'owned' | 'blindbox';
  setShopFilter: (filter: 'all' | 'physical' | 'rights' | 'leisure' | 'owned' | 'blindbox') => void;
  
  // 商品管理模式
  isManageShopMode: boolean;
  setIsManageShopMode: (mode: boolean) => void;
  
  // 商品购买
  balance: number;
  onPurchase: (item: ShopItem, e: React.MouseEvent) => void;
  onBlindBoxPurchase: (price: number, e: React.MouseEvent) => void;
  
  // 商品管理
  onAddNewItem: () => void;
  onDeleteItem: (e: React.MouseEvent, id: string) => void;
  onEditItem: (item: ShopItem) => void;
  
  // 商品拖拽
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  
  // 帮助系统
  onShowHelp: (helpId: string) => void;
  
  // 主题相关
  theme: string;
  isDark: boolean;
  isNeomorphic: boolean;
  cardBg: string;
  textMain: string;
  textSub: string;
  neomorphicStyles: {
    bg: string;
    border: string;
    shadow: string;
    hoverShadow: string;
    activeShadow: string;
    transition: string;
  };
  
  // 辅助状态
  justPurchasedItem: ShopItem | null;

  // 分组管理
  groups?: string[];
  setGroups?: (groups: string[] | ((prev: string[]) => string[])) => void;
  isAddingGroup?: boolean;
  setIsAddingGroup?: (isAdding: boolean) => void;
  newGroupName?: string;
  setNewGroupName?: (name: string) => void;
  handleAddNewGroup?: () => void;
  handleCancelAddGroup?: () => void;
  // 分组管理
  handleEditGroup?: (groupName: string) => void;
  handleDeleteGroup?: (groupName: string) => void;
}
