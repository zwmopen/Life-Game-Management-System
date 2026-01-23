/**
 * ShopCatalog商品目录组件
 * 负责商品列表的展示、过滤、购买和管理
 * 
 * 性能优化：使用React.memo包裹组件，仅在props变化时重新渲染
 */

import React, { useMemo, memo, useState } from 'react';
import {
  ShoppingBag, Wallet, Hammer, CheckCircle, Plus,
  Edit2, Trash2
} from 'lucide-react';
import { GlobalHelpButton } from '../HelpSystem';
import { BLIND_BOX_PRICES } from '../../constants/blindBox';
import { ShopCatalogProps } from './types';
import AddGroupModal from './AddGroupModal';

const ShopCatalog: React.FC<ShopCatalogProps> = memo(({
  inventory,
  setInventory,
  shopFilter,
  setShopFilter,
  isManageShopMode,
  setIsManageShopMode,
  balance,
  onPurchase,
  onBlindBoxPurchase,
  onAddNewItem,
  onDeleteItem,
  onEditItem,
  onDragStart,
  onDragOver,
  onShowHelp,
  theme,
  isDark,
  isNeomorphic,
  cardBg,
  textMain,
  textSub,
  neomorphicStyles,
  justPurchasedItem,
  groups = ['数码', '运动健康', '服装礼品', '家居', '会员充值', '休闲娱乐', '形象设计与穿搭'],
  setGroups,
  isAddingGroup,
  setIsAddingGroup,
  newGroupName,
  setNewGroupName,
  handleAddNewGroup,
  handleCancelAddGroup
}) => {
  // 添加搜索状态
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // 分组管理状态
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [newGroupNameValue, setNewGroupNameValue] = useState('');
  // 控制添加分组弹窗的显示/隐藏
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  
  // 生成按钮样式的辅助函数
  const getButtonStyle = (isActive: boolean, isSpecial?: boolean) => {
    if (isActive) {
      return isSpecial ? 'bg-red-500 text-white border-red-500' : 'bg-blue-500 text-white border-blue-500';
    }
    if (isNeomorphic) {
      const bgColor = theme === 'neomorphic-dark' ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]';
      const borderColor = theme === 'neomorphic-dark' ? 'border-[#1e1e2e]' : 'border-[#e0e5ec]';
      const shadowColor = theme === 'neomorphic-dark' 
        ? 'shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]'
        : 'shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]';
      const hoverShadowColor = theme === 'neomorphic-dark' 
        ? 'hover:shadow-[10px_10px_20px_rgba(0,0,0,0.5),-10px_-10px_20px_rgba(30,30,46,1)]'
        : 'hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]';
      const activeShadowColor = theme === 'neomorphic-dark' 
        ? 'active:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.4),inset_-5px_-5px_10px_rgba(30,30,46,0.8)]'
        : 'active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]';
      
      return `${bgColor} ${borderColor} ${shadowColor} ${hoverShadowColor} ${activeShadowColor} ${neomorphicStyles.transition}`;
    }
    return isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-200';
  };

  // 使用useMemo缓存过滤和排序后的商品列表
  const filteredInventory = useMemo(() => {
    return inventory.filter(i => {
      // 首先根据分类过滤
      if (shopFilter === 'owned') {
        if (i.owned !== true) return false;
      } else if (shopFilter !== 'all') {
        if (i.category !== shopFilter) return false;
      }
      
      // 然后根据搜索词过滤
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return i.name.toLowerCase().includes(lowerSearchTerm) || 
               i.description.toLowerCase().includes(lowerSearchTerm) ||
               i.category.toLowerCase().includes(lowerSearchTerm);
      }
      
      return true;
    });
  }, [inventory, shopFilter, searchTerm]);

  const sortedInventory = useMemo(() => {
    return [...filteredInventory].sort((a, b) => {
      const timeA = a.lastPurchased || 0;
      const timeB = b.lastPurchased || 0;
      if (timeA !== timeB) return timeB - timeA;
      return a.cost - b.cost;
    });
  }, [filteredInventory]);

  // 商品分类列表
  const categories = useMemo(() => {
    const baseCategories = [
      { id: 'all', label: '全部', count: inventory.length },
      ...groups.map(group => ({
        id: group,
        label: group,
        count: inventory.filter(i => i.category === group).length,
        isCustom: true  // 标记为自定义分组
      }))
    ];
    
    // 如果是管理模式且不在添加新分组，则添加盲盒和已购买分类
    if (isManageShopMode && !isAddingGroup) {
      baseCategories.push(
        { id: 'blindbox', label: '盲盒', count: BLIND_BOX_PRICES.length },
        { id: 'owned', label: '已购买', count: inventory.filter(i => i.owned).length }
      );
    } else if (!isManageShopMode) {
      baseCategories.push(
        { id: 'blindbox', label: '盲盒', count: BLIND_BOX_PRICES.length },
        { id: 'owned', label: '已购买', count: inventory.filter(i => i.owned).length }
      );
    }
    
    return baseCategories;
  }, [inventory, groups, isManageShopMode, isAddingGroup]);

  // 处理分组编辑
  const handleEditGroup = (groupName: string) => {
    setEditingGroup(groupName);
    setNewGroupNameValue(groupName);
  };

  // 保存分组修改
  const saveGroupEdit = () => {
    if (editingGroup && newGroupNameValue.trim() && newGroupNameValue !== editingGroup) {
      // 更新分组名称
      setGroups && setGroups((prev: string[]) => 
        prev.map(g => g === editingGroup ? newGroupNameValue.trim() : g)
      );
      
      // 更新商品的分类
      setInventory(prev => 
        prev.map(item => 
          item.category === editingGroup ? { ...item, category: newGroupNameValue.trim() } : item
        )
      );
      
      cancelGroupEdit();
    }
  };

  // 取消分组编辑
  const cancelGroupEdit = () => {
    setEditingGroup(null);
    setNewGroupNameValue('');
  };

  // 删除分组
  const handleDeleteGroup = (groupName: string) => {
    if (window.confirm(`确定要删除分类 "${groupName}" 吗？该分类下的所有商品将被移动到“其他”分类。`)) {
      // 从分组列表中移除
      setGroups && setGroups((prev: string[]) => prev.filter(g => g !== groupName));
      
      // 将该分类下的商品移动到“其他”分类
      setInventory(prev => 
        prev.map(item => 
          item.category === groupName ? { ...item, category: '其他' } : item
        )
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 商品分组和管理商品组合模块 */}
      <div className={`p-4 rounded-3xl border ${cardBg} shadow-lg`}>
        {/* 左上角小图标和文字 */}
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag size={18} className="text-yellow-500" />
          <span className={`text-sm font-bold ${textMain}`}>商品分类与管理</span>
        </div>

        {/* 分类过滤按钮 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(f => (
            <div key={f.id} className="relative group">
              {editingGroup === f.label ? (
                // 编辑模式
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newGroupNameValue}
                    onChange={(e) => setNewGroupNameValue(e.target.value)}
                    onBlur={saveGroupEdit}
                    onKeyDown={(e) => e.key === 'Enter' && saveGroupEdit()}
                    className={`px-2 py-1.5 rounded-[24px] text-xs font-bold border transition-all duration-200 ${getButtonStyle(true)}`}
                    autoFocus
                  />
                  <button
                    onClick={saveGroupEdit}
                    className="text-xs px-1.5 py-1 rounded-[24px] bg-green-500 text-white"
                  >
                    ✓
                  </button>
                  <button
                    onClick={cancelGroupEdit}
                    className="text-xs px-1.5 py-1 rounded-[24px] bg-gray-500 text-white"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                // 正常显示模式
                <button 
                  key={f.id} 
                  onClick={() => setShopFilter(f.id as any)} 
                  className={`px-2 py-1.5 rounded-[24px] text-xs font-bold border transition-all duration-200 whitespace-nowrap ${getButtonStyle(shopFilter === f.id)}`}
                >
                  {f.label} <span className="text-[9px] opacity-80">({f.count})</span>
                  {f.isCustom && isManageShopMode && (
                    <div className="ml-1 inline-flex gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditGroup(f.label);
                        }}
                        className={`w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] text-blue-400 shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(30,30,46,0.8)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(30,30,46,0.9)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] text-blue-600 shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.8)] hover:shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.9)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]') : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                      >
                        <Edit2 size={10} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(f.label);
                        }}
                        className={`w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] text-red-400 shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(30,30,46,0.8)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(30,30,46,0.9)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] text-red-600 shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.8)] hover:shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.9)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]') : 'bg-red-500 text-white hover:bg-red-600'}`}
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 右下角：帮助和管理按钮 */}
        <div className="flex justify-between items-center mt-3">
          <div className="flex gap-2 items-center">
            <GlobalHelpButton helpId="shop" onHelpClick={onShowHelp} size={16} className="text-zinc-500 hover:text-white transition-colors" />
            {!isManageShopMode && (
              <div className={`text-xs ${textSub} flex items-center gap-1`}>
              <Wallet size={12} className="text-yellow-500"/> 储备金: {Math.floor(balance)}
            </div>
            )}
          </div>
          <div className="flex gap-2">
            {isManageShopMode && (
              <>
                <button 
                  onClick={onAddNewItem} 
                  className={`text-xs px-3 py-1.5 rounded-[24px] border font-bold flex items-center gap-1 transition-all ${getButtonStyle(false, true)}`}
                >
                  <Plus size={12}/> 上架新商品
                </button>
                <button 
                  onClick={() => {
                    setShowAddGroupModal(true);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-[24px] border font-bold flex items-center gap-1 transition-all ${getButtonStyle(false, true)}`}
                >
                  <Plus size={12}/> 添加分组
                </button>
              </>
            )}
            {/* 搜索框 - 在管理模式下隐藏 */}
            {!isManageShopMode && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索商品..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`px-4 py-1.5 rounded-[24px] text-xs border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-[#1e1e2e] text-white placeholder:text-zinc-500 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),inset_-3px_-3px_6px_rgba(30,30,46,1)]' : 'bg-[#e0e5ec] border-[#e0e5ec] text-black placeholder:text-gray-500 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]') : (isDark ? 'bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500' : 'bg-white border-slate-300 text-black placeholder:text-gray-500')}`}
                  style={{ minWidth: '100px', maxWidth: '150px' }}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs">🔍</span>
              </div>
            )}
            <button 
              onClick={() => setIsManageShopMode(!isManageShopMode)} 
              className={`text-xs px-3 py-1.5 rounded-[24px] border font-bold flex items-center gap-1 transition-all ${getButtonStyle(isManageShopMode, true)}`}
            >
              {isManageShopMode ? <CheckCircle size={12}/> : <Hammer size={12}/>} 
              {isManageShopMode ? '完成管理' : '管理商品'}
            </button>
          </div>
        </div>

        {/* 添加新分组弹窗 */}
        <AddGroupModal
          isOpen={showAddGroupModal}
          onSave={(groupName) => {
            setNewGroupName && setNewGroupName(groupName);
            handleAddNewGroup && handleAddNewGroup();
            setShowAddGroupModal(false);
          }}
          onCancel={() => {
            setShowAddGroupModal(false);
          }}
          theme={theme}
          isDark={isDark}
          isNeomorphic={isNeomorphic}
          neomorphicStyles={neomorphicStyles}
        />
      </div>



      {/* 盲盒商品列表 */}
      {shopFilter === 'blindbox' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {BLIND_BOX_PRICES.map((price, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-xl border ${isNeomorphic ? `${neomorphicStyles.bg} ${neomorphicStyles.border} ${neomorphicStyles.shadow} ${neomorphicStyles.hoverShadow} ${neomorphicStyles.transition}` : 'hover:shadow-lg'} cursor-pointer`}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">🎁</div>
                <div className={`text-lg font-bold ${textMain}`}>¥{price}</div>
                <div className={`text-xs ${textSub} mt-1`}>价值 {price * 0.5}-{price * 1.5}金币</div>
                {/* 购买按钮 */}
                <button 
                  onClick={(e) => onBlindBoxPurchase(price, e)} 
                  className={`w-full py-1 text-[12px] font-bold rounded-md mt-1 transition-all duration-300 ${isNeomorphic ? neomorphicStyles.bg + ' text-blue-600 hover:text-blue-700' : 'bg-gradient-to-r from-yellow-600/80 to-amber-600/80 hover:from-yellow-500/90 hover:to-amber-500/90 text-white'}`}
                >
                  购买
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 普通商品列表 */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {sortedInventory.map((item, index) => {
            const itemId = item?.id || `item-${index}`;
            return (
              <div 
                key={itemId} 
                className={`group relative rounded-xl overflow-hidden border transition-all duration-300 ${isNeomorphic ? `${neomorphicStyles.bg} ${neomorphicStyles.border} ${neomorphicStyles.shadow} ${neomorphicStyles.hoverShadow} ${neomorphicStyles.transition} group-hover:${neomorphicStyles.activeShadow}` : 'hover:shadow-lg'} ${item.type === 'physical' && item.owned ? 'opacity-50' : ''} ${isManageShopMode ? 'border-red-500/30' : ''} cursor-pointer`} 
                style={{ minHeight: '280px' }}
              >
                {/* 管理模式下的编辑删除按钮 - 右上角布局 */}
                {isManageShopMode && (
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditItem({...item}); }}
                      className={`w-7 h-7 rounded-full transition-all duration-200 flex items-center justify-center ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] text-blue-400 shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(30,30,46,0.8)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(30,30,46,0.9)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] text-blue-600 shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.8)] hover:shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.9)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]') : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                      <Edit2 size={12}/>
                    </button>
                    <button 
                      onClick={(e) => onDeleteItem(e, item.id)} 
                      className={`w-7 h-7 rounded-full transition-all duration-200 flex items-center justify-center ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] text-red-400 shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(30,30,46,0.8)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(30,30,46,0.9)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] text-red-600 shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.8)] hover:shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.9)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]') : 'bg-red-500 text-white hover:bg-red-600'}`}
                    >
                      <Trash2 size={12}/>
                    </button>
                  </div>
                )}
                
                {/* 商品图片 */}
                {/* 只显示有效的images.unsplash.com链接，不使用占位符服务 */}
                {item.image && item.image.includes('images.unsplash.com') ? (
                  <div className="product-image absolute top-0 left-0 w-full h-full z-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallbackDiv = target.parentElement?.getElementsByClassName('fallback-bg')[0] as HTMLElement;
                        if (fallbackDiv) fallbackDiv.style.display = 'flex';
                        
                        if (process.env.NODE_ENV === 'development') {
                          console.warn(`商品图片加载失败: ${item.name}`, item.image);
                        }
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'block';
                        const fallbackDiv = target.parentElement?.getElementsByClassName('fallback-bg')[0] as HTMLElement;
                        if (fallbackDiv) fallbackDiv.style.display = 'none';
                      }}
                    />
                    <div className="fallback-bg absolute inset-0 flex items-center justify-center" style={{ display: 'none', backgroundColor: isDark ? '#1a1a2e' : '#e0e5ec' }}>
                      <div className="text-5xl">
                        {/* 确保icon是有效的React组件，而不是数字0 */}
                        {typeof item.icon === 'number' ? '📦' : item.icon}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 没有有效图片链接时，显示默认图标 */
                  <div className="absolute inset-0 flex items-center justify-center z-0" style={{ backgroundColor: isDark ? '#1a1a2e' : '#e0e5ec' }}>
                    <div className="text-6xl">
                      {/* 确保icon是有效的React组件，而不是数字0 */}
                      {typeof item.icon === 'number' ? '📦' : item.icon}
                    </div>
                  </div>
                )}
                
                {/* 渐变遮罩 - 从价格顶部往下的从浅到深渐变效果 */}
                <div className="gradient-overlay absolute left-0 top-[70px] w-full h-[calc(100%-70px)] z-10 pointer-events-none" style={{
                  background: isDark ? 
                    'linear-gradient(to bottom, rgba(26,26,46,0) 0%, rgba(26,26,46,0.3) 30%, rgba(26,26,46,0.6) 60%, rgba(26,26,46,0.8) 100%)' : 
                    'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.6) 60%, rgba(255,255,255,0.8) 100%)',
                }}></div>
                
                {/* 商品信息 */}
                <div className="product-info relative z-20 p-5 text-center flex flex-col justify-between" style={{ marginTop: '65px', height: 'calc(100% - 65px)' }}>
                  <div>
                    {/* 价格 */}
                    <div className={`bg-opacity-95 px-4 py-1.5 text-sm font-bold rounded-full mx-auto my-2 inline-block ${isDark ? 'bg-yellow-600/30 text-yellow-400 border border-yellow-600/50' : 'bg-[#fff3cd] text-[#fd7e14]'}`}>
                      ¥{item.cost}
                    </div>
                    
                    {/* 商品名称 */}
                    <h4 className={`font-bold text-xl text-white mt-2 mb-1 text-shadow w-full break-words`} style={{textShadow: '0 1px 2px rgba(0,0,0,0.8)'}}>
                      {item.name}
                    </h4>
                    
                    {/* 购买次数 */}
                    {item.purchaseCount !== undefined && item.purchaseCount > 0 && (
                      <span className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-500'} font-bold`}>
                        已购买 x{item.purchaseCount}
                      </span>
                    )}
                    
                    {/* 商品描述 */}
                    <p className={`text-sm ${isDark ? 'text-white/90' : 'text-zinc-700'} mt-1 mb-6 line-clamp-2 w-full max-w-[240px] mx-auto text-shadow`} style={{textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.8)' : '0 1px 2px rgba(255,255,255,0.8)'}}>
                      {item.description}
                    </p>
                  </div>
                  
                  {/* 购买按钮 */}
                  <button 
                    onClick={(e) => onPurchase(item, e)} 
                    className={`inline-block px-8 py-2.5 text-sm font-bold rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${item.type === 'physical' && item.owned ? 'bg-zinc-800/30 text-zinc-500 hover:bg-zinc-700/50' : (isDark ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500' : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400')}`}
                  >
                    {item.type === 'physical' && item.owned ? '已拥有' : '购买'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

ShopCatalog.displayName = 'ShopCatalog';

export default ShopCatalog;

ShopCatalog.displayName = 'ShopCatalog';
