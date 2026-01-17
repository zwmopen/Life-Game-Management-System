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

  useEffect(() => {
    if (isOpen) {
      setEditedItem({ ...item });
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
    <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className={`rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${isNeomorphic ? 
          (theme === 'neomorphic-dark' ? 
            'bg-[#1e1e2e] border border-zinc-700 shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)]' : 
            'bg-[#e0e5ec] border border-slate-300 shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]') : 
          isDark ? 'bg-zinc-900/95 border border-zinc-700 shadow-zinc-900/30' : 'bg-white/95 border border-slate-200 shadow-lg'}`}
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
                {groups.map((group, index) => (
                  <option key={index} value={group}>{group}</option>
                ))}
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
              <input
                type="text"
                value={editedItem.image || ''}
                onChange={(e) => handleChange('image', e.target.value)}
                className={`w-full bg-transparent border-b py-2 outline-none ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800') : 'border-zinc-700 text-zinc-800'}`}
                placeholder="输入商品图片URL..."
              />
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
                  'bg-blue-500 text-white hover:bg-blue-600') : 
                isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
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