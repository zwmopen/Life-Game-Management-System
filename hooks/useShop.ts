import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import SHOP_CATALOG from '../constants/shopCatalog';
import { ProductType, ProductCategory } from '../types';

interface UseShopProps {
    balance: number;
    onUpdateBalance: (amount: number, reason: string) => void;
    onAddFloatingReward: (text: string, color: string, x?: number, y?: number) => void;
    level: number;
    xp: number;
    savings: number;
}

export const useShop = ({
    balance,
    onUpdateBalance,
    onAddFloatingReward,
    level,
    xp,
    savings
}: UseShopProps) => {
    const [inventory, setInventory] = useState<any[]>(SHOP_CATALOG);
    const [isManageShopMode, setIsManageShopMode] = useState(false);
    const [shopFilter, setShopFilter] = useState<'all' | 'physical' | 'rights' | 'leisure' | 'owned' | 'blindbox'>('all');
    const [justPurchasedItem, setJustPurchasedItem] = useState<any | null>(null);
    const [isEditItemOpen, setIsEditItemOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [draggedShopIndex, setDraggedShopIndex] = useState<number | null>(null);
    const [groups, setGroups] = useState<string[]>(['数码', '运动健康', '服装礼品', '家居', '会员充值', '休闲娱乐', '形象设计与穿搭']); // 商品分组
    const [isAddingGroup, setIsAddingGroup] = useState(false); // 控制添加分组弹窗
    const [newGroupName, setNewGroupName] = useState(''); // 新分组名称

    // 初始化商品库存 (从 LifeGame.tsx 移入)
    useEffect(() => {
        const initializeInventory = async () => {
            const saved = localStorage.getItem('life-game-stats-v2'); 
            let initialInv = SHOP_CATALOG;
            
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    const savedInv = data.inventory || [];
                    const savedMap = new Map<string, any>(savedInv.map((i: any) => [i.id, i]));
                    
                    initialInv = SHOP_CATALOG.map(catItem => {
                        const savedItem = savedMap.get(catItem.id);
                        if (savedItem) {
                            return { 
                                ...catItem, 
                                owned: savedItem.owned, 
                                purchaseCount: savedItem.purchaseCount || 0,
                                lastPurchased: savedItem.lastPurchased || 0,
                                image: savedItem.image || catItem.image || ''
                            };
                        }
                        return catItem;
                    });
                    const catalogIds = new Set(SHOP_CATALOG.map(i => i.id));
                    const customItems = savedInv.filter((i: any) => !catalogIds.has(i.id));
                    initialInv = [...initialInv, ...customItems];
                } catch (e) { /* 静默处理 */ }
            }
            
            // 直接使用初始库存，不进行图片检查
            setInventory(initialInv.map(item => ({
                ...item,
                type: item.type as ProductType,
                category: item.category as ProductCategory
            })));
        };
        
        initializeInventory();
    }, []);

    // 自动保存
    useEffect(() => {
        localStorage.setItem('life-game-stats-v2', JSON.stringify({ level, xp, inventory, savings }));
    }, [level, xp, inventory, savings]);

    const handleBlindBoxPurchase = useCallback((price: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isManageShopMode) return;

        if (balance < price) {
            onAddFloatingReward("资金不足", "text-red-500", e.clientX, e.clientY);
            return;
        }
        
        // 播放购买音效
        const purchaseSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3");
        purchaseSound.volume = 0.5;
        purchaseSound.play().catch(()=>{});
        
        // 触发烟花效果
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
        });
        
        const minPrice = price * 0.5;
        const maxPrice = price * 1.5;
        const hiddenPrice = price * 2;
        const isHidden = Math.random() < 0.05;
        
        const eligibleItems = inventory.filter(item => {
            if (isHidden) {
                return item.cost === hiddenPrice;
            } else {
                return item.cost >= minPrice && item.cost <= maxPrice;
            }
        });
        
        if (eligibleItems.length === 0) {
            onAddFloatingReward("当前档位暂无可用商品", "text-red-500", e.clientX, e.clientY);
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * eligibleItems.length);
        const selectedItem = eligibleItems[randomIndex];
        
        onUpdateBalance(-price, `购买盲盒: ${price}金币`);
        
        setInventory(prev => prev.map(i => {
            if (i.id === selectedItem.id) {
                return { 
                    ...i, 
                    owned: true,
                    purchaseCount: (i.purchaseCount || 0) + 1,
                    lastPurchased: Date.now(),
                    image: i.image || ''
                };
            }
            return i;
        }));

        setJustPurchasedItem(selectedItem);
        setTimeout(() => setJustPurchasedItem(null), 2000);
        
        onAddFloatingReward(`获得${isHidden ? '隐藏款' : ''}: ${selectedItem.name}`, "text-yellow-500", e.clientX, e.clientY);
    }, [balance, isManageShopMode, inventory, onAddFloatingReward, onUpdateBalance]);

    const handlePurchase = useCallback((item: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isManageShopMode) return; 

        if (balance < item.cost) {
            onAddFloatingReward("资金不足", "text-red-500", e.clientX, e.clientY);
            return;
        }
        
        onUpdateBalance(-item.cost, `购买: ${item.name}`);
        
        const purchaseSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3");
        purchaseSound.volume = 0.5;
        purchaseSound.play().catch(()=>{});
        
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
        });
        
        setInventory(prev => prev.map(i => {
            if (i.id === item.id) {
                return { 
                    ...i, 
                    owned: true,
                    purchaseCount: (i.purchaseCount || 0) + 1,
                    lastPurchased: Date.now(),
                    image: i.image || ''
                };
            }
            return i;
        }));

        setJustPurchasedItem(item);
        setTimeout(() => setJustPurchasedItem(null), 2000);
    }, [balance, isManageShopMode, onAddFloatingReward, onUpdateBalance]);

    const handleDeleteItem = useCallback((e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm("确定要下架此商品吗？")) {
            setInventory(prev => prev.filter(i => i.id !== id));
        }
    }, []);

    const handleEditItemSave = useCallback(() => {
        if (editingItem) {
            if (inventory.find(i => i.id === editingItem.id)) {
                setInventory(prev => prev.map(i => {
                    if (i.id === editingItem.id) {
                        return { ...editingItem, image: editingItem.image || '' };
                    }
                    return i;
                }));
            } else {
                setInventory(prev => [...prev, { ...editingItem, image: editingItem.image || '' }]);
            }
        }
        setIsEditItemOpen(false);
        setEditingItem(null);
    }, [editingItem, inventory]);

    const handleAddNewItem = useCallback(() => {
        setEditingItem({
            id: Date.now().toString(),
            name: '',
            description: '',
            cost: 50,
            type: 'leisure',
            icon: null, // 将在 UI 中选择图标
            image: '',
            purchaseCount: 0,
            lastPurchased: 0
        });
        setIsEditItemOpen(true);
    }, []);

    const handleAddNewGroup = useCallback(() => {
        if (newGroupName.trim() && !groups.includes(newGroupName.trim())) {
            setGroups(prev => [...prev, newGroupName.trim()]);
            setNewGroupName('');
            setIsAddingGroup(false);
        }
    }, [newGroupName, groups]);

    const handleCancelAddGroup = useCallback(() => {
        setNewGroupName('');
        setIsAddingGroup(false);
    }, []);

    // 处理分组编辑
    const handleEditGroup = useCallback((groupName: string) => {
        // 这个函数将由组件内部处理，不需要在这里实现
    }, []);

    // 处理分组删除
    const handleDeleteGroup = useCallback((groupName: string) => {
        // 这个函数将由组件内部处理，不需要在这里实现
    }, []);

    const handleShopDragStart = useCallback((index: number) => {
        if (!isManageShopMode) return;
        setDraggedShopIndex(index);
    }, [isManageShopMode]);

    const handleShopDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (!isManageShopMode || draggedShopIndex === null || draggedShopIndex === index) return;

        setInventory(prev => {
            const newInventory = [...prev];
            const draggedItem = newInventory[draggedShopIndex];
            newInventory.splice(draggedShopIndex, 1);
            newInventory.splice(index, 0, draggedItem);
            return newInventory;
        });
        setDraggedShopIndex(index);
    }, [isManageShopMode, draggedShopIndex]);

    return {
        inventory,
        setInventory,
        isManageShopMode,
        setIsManageShopMode,
        shopFilter,
        setShopFilter,
        justPurchasedItem,
        setJustPurchasedItem,
        isEditItemOpen,
        setIsEditItemOpen,
        editingItem,
        setEditingItem,
        handlePurchase,
        handleBlindBoxPurchase,
        handleDeleteItem,
        handleEditItemSave,
        handleAddNewItem,
        handleAddNewGroup,
        handleCancelAddGroup,
        handleEditGroup,
        handleDeleteGroup,
        isAddingGroup,
        setIsAddingGroup,
        newGroupName,
        setNewGroupName,
        groups,
        setGroups,
        handleShopDragStart,
        handleShopDragOver
    };
};
