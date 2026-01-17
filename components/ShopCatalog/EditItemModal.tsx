import React, { useState, useEffect } from 'react';

interface EditItemModalProps {
  isOpen: boolean;
  item: any;
  groups: string[];
  onSave: (item: any) => void;
  onCancel: () => void;
  theme: string;
  isDark: boolean;
  isNeomorphic: boolean;
  neomorphicStyles: {
    bg: string;
    border: string;
    shadow: string;
    hoverShadow: string;
    activeShadow: string;
    transition: string;
  };
}

const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  item,
  groups,
  onSave,
  onCancel,
  theme,
  isDark,
  isNeomorphic,
  neomorphicStyles
}) => {
  const [editedItem, setEditedItem] = useState<any>({ ...item });

  // 根据商品名称获取相关图片URL的函数
  const getRelatedImageUrl = (itemName: string): string => {
    // 将商品名称转换为小写便于匹配
    const lowerName = itemName.toLowerCase();
    
    // 定义关键词到图片URL的映射
    const keywordToImage: { [key: string]: string } = {
      '辣条': 'https://images.unsplash.com/photo-1562967916-ef262167ce5c?w=300&h=300&fit=crop',
      '辣': 'https://images.unsplash.com/photo-1562967916-ef262167ce5c?w=300&h=300&fit=crop',
      '零食': 'https://images.unsplash.com/photo-1588979364652-7f8ed33c31c9?w=300&h=300&fit=crop',
      '食品': 'https://images.unsplash.com/photo-1562967916-ef262167ce5c?w=300&h=300&fit=crop',
      '饮料': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
      '水': 'https://images.unsplash.com/photo-1618920338003-4dbd53faf416?w=300&h=300&fit=crop',
      '咖啡': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&h=300&fit=crop',
      '茶': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
      '水果': 'https://images.unsplash.com/photo-1578926375602-e5f1b0b7b0ea?w=300&h=300&fit=crop',
      '蔬菜': 'https://images.unsplash.com/photo-1542816417-098fc2d02da2?w=300&h=300&fit=crop',
      '衣服': 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=300&h=300&fit=crop',
      '鞋': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop',
      '包': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
      '数码': 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=300&fit=crop',
      '手机': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&h=300&fit=crop',
      '电脑': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop',
      '耳机': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      '书籍': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop',
      '游戏': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=300&fit=crop',
      '玩具': 'https://images.unsplash.com/photo-1547949003-bceaa2d5adb2?w=300&h=300&fit=crop',
      '运动': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
      '健身': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=300&fit=crop',
      '美妆': 'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=300&h=300&fit=crop',
      '护肤': 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=300&h=300&fit=crop',
      '家居': 'https://images.unsplash.com/photo-1493663284046-17e261327c02?w=300&h=300&fit=crop',
      '家电': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      '汽车': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&h=300&fit=crop',
      '票': 'https://images.unsplash.com/photo-1587486913049-520c77ea437e?w=300&h=300&fit=crop',
      '电影': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed21888?w=300&h=300&fit=crop',
      '音乐': 'https://images.unsplash.com/photo-1470225620780-dba25f3b9b0d?w=300&h=300&fit=crop',
      '会员': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=300&fit=crop',
      '充值': 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=300&h=300&fit=crop',
    };
    
    // 检查是否包含任何关键词
    for (const [keyword, imageUrl] of Object.entries(keywordToImage)) {
      if (lowerName.includes(keyword.toLowerCase())) {
        return imageUrl;
      }
    }
    
    // 如果没有匹配到关键词，返回一个通用商品图片
    return 'https://images.unsplash.com/photo-1505793833469-afa00ffd009d?w=300&h=300&fit=crop';
  };

  useEffect(() => {
    if (isOpen) {
      // 当打开弹窗时，如果商品没有图片，则尝试根据名称获取相关图片
      const itemWithImage = { ...item };
      if (!itemWithImage.image || itemWithImage.image.trim() === '') {
        itemWithImage.image = getRelatedImageUrl(itemWithImage.name);
      }
      setEditedItem(itemWithImage);
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setEditedItem(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedItem);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className={`rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${isNeomorphic ? 
          (theme === 'neomorphic-dark' ? 
            'bg-[#1e1e2e] border border-zinc-700 shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)]' : 
            'bg-[#e0e5ec] border border-slate-300 shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]') : 
          isDark ? 'bg-zinc-900/95 border border-zinc-700 shadow-zinc-900/30' : 'bg-white/95 border border-slate-200 shadow-lg'}`}
        style={{ marginLeft: '220px' }} // 增加左边距以避开侧边栏
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800'}`}>
              编辑商品
            </h3>
            <button 
              type="button"
              onClick={onCancel}
              className={`text-lg font-bold ${isDark ? 'text-zinc-400 hover:text-white' : isNeomorphic ? 'text-zinc-500 hover:text-zinc-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500">商品名称</label>
              <input
                type="text"
                value={editedItem.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full bg-transparent border-b py-2 outline-none ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800') : 'border-zinc-700 text-zinc-800'}`}
                placeholder="输入商品名称..."
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500">商品描述</label>
              <input
                type="text"
                value={editedItem.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={`w-full bg-transparent border-b py-2 outline-none ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800') : 'border-zinc-700 text-zinc-800'}`}
                placeholder="输入商品描述..."
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500">商品价格 (元)</label>
              <input
                type="number"
                value={editedItem.cost}
                onChange={(e) => handleChange('cost', Number(e.target.value))}
                className={`w-full bg-transparent border-b py-2 outline-none ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800') : 'border-zinc-700 text-zinc-800'}`}
                placeholder="输入商品价格..."
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500">商品链接</label>
              <input
                type="text"
                value={editedItem.link || ''}
                onChange={(e) => handleChange('link', e.target.value)}
                className={`w-full bg-transparent border-b py-2 outline-none ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800') : 'border-zinc-700 text-zinc-800'}`}
                placeholder="输入商品链接..."
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500">商品分类</label>
              <select
                value={editedItem.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className={`w-full bg-transparent border-b py-2 outline-none ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800') : 'border-zinc-700 text-zinc-800'}`}
              >
                {/* 默认显示原有的分组 */}
                {groups.length > 0 && groups.map((group, index) => (
                  <option key={`group-${index}`} value={group}>{group}</option>
                ))}
                {/* 添加预设的商品分类 */}
                <option value="吃喝">吃喝</option>
                <option value="形象设计与穿搭">形象设计与穿搭</option>
                <option value="休闲娱乐">休闲娱乐</option>
                <option value="数码">数码</option>
                <option value="家居">家居</option>
                <option value="会员/权益/充值">会员/权益/充值</option>
                <option value="运动健康">运动健康</option>
                <option value="学习教育">学习教育</option>
                <option value="出行交通">出行交通</option>
                <option value="生活服务">生活服务</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500">商品类型</label>
              <select
                value={editedItem.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className={`w-full bg-transparent border-b py-2 outline-none ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800') : 'border-zinc-700 text-zinc-800'}`}
              >
                <option value="physical">实体商品</option>
                <option value="leisure">休闲商品</option>
                <option value="rights">权益商品</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500">商品图片URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editedItem.image || ''}
                  onChange={(e) => handleChange('image', e.target.value)}
                  className={`flex-1 bg-transparent border-b py-2 outline-none ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800') : 'border-zinc-700 text-zinc-800'}`}
                  placeholder="输入商品图片URL..."
                />
                <button
                  type="button"
                  onClick={() => {
                    // 自动根据商品名称填充相关图片
                    handleChange('image', getRelatedImageUrl(editedItem.name));
                  }}
                  className={`py-2 px-3 rounded-lg font-bold text-xs ${isNeomorphic ? 
                    (theme === 'neomorphic-dark' ? 
                      'bg-blue-600 text-white hover:bg-blue-700' : 
                      'bg-blue-500 text-white hover:bg-blue-600') : 
                    isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  自动填充
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className={`flex-1 py-2 rounded-lg font-bold ${isNeomorphic ? 
                (theme === 'neomorphic-dark' ? 
                  'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 
                  'bg-zinc-300 text-zinc-700 hover:bg-zinc-400') : 
                isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
            >
              取消
            </button>
            <button
              type="submit"
              className={`flex-1 py-2 rounded-lg font-bold ${isNeomorphic ? 
                (theme === 'neomorphic-dark' ? 
                  'bg-blue-600 text-white hover:bg-blue-700' : 
                  'bg-blue-500 text-zinc-800 hover:bg-blue-600') : 
                isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-zinc-800 hover:bg-blue-600'}`}
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;