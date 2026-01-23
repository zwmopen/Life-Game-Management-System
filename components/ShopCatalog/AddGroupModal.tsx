import React, { useState, useEffect } from 'react';

interface AddGroupModalProps {
  isOpen: boolean;
  onSave: (groupName: string) => void;
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

const AddGroupModal: React.FC<AddGroupModalProps> = ({
  isOpen,
  onSave,
  onCancel,
  theme,
  isDark,
  isNeomorphic,
  neomorphicStyles
}) => {
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGroupName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim()) {
      onSave(groupName.trim());
    }
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
              添加新分组
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
              <label className="text-[10px] uppercase font-bold text-zinc-500">分组名称</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className={`w-full bg-transparent border-b py-2 outline-none ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800') : 'border-zinc-700 text-zinc-800'}`}
                placeholder="输入分组名称..."
                maxLength={50}
                autoFocus
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-400 text-white hover:bg-gray-500') : isDark ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-400 text-white hover:bg-gray-500'}`}
            >
              取消
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-sm font-medium ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600') : isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              确认
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGroupModal;