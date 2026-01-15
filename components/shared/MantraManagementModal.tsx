import React, { useState } from 'react';
import { X, Edit3, Trash2 } from 'lucide-react';
import { Theme } from '../../types';

interface MantraManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    mantras: string[];
    onAddMantra: (mantra: string) => void;
    onDeleteMantra: (index: number) => void;
    onUpdateMantra: (index: number, newValue: string) => void;
    theme: Theme;
}

const MantraManagementModal: React.FC<MantraManagementModalProps> = ({
    isOpen,
    onClose,
    mantras,
    onAddMantra,
    onDeleteMantra,
    onUpdateMantra,
    theme
}) => {
    const [newMantraInput, setNewMantraInput] = useState('');
    const [editingMantraIndex, setEditingMantraIndex] = useState<number | null>(null);
    const [editingMantraValue, setEditingMantraValue] = useState('');

    if (!isOpen) return null;

    const isDark = theme === 'dark' || theme === 'neomorphic-dark';
    const isNeomorphic = theme.startsWith('neomorphic');

    const handleAdd = () => {
        if (!newMantraInput.trim()) return;
        onAddMantra(newMantraInput.trim());
        setNewMantraInput('');
    };

    const handleSaveEdit = (index: number) => {
        if (!editingMantraValue.trim()) return;
        onUpdateMantra(index, editingMantraValue.trim());
        setEditingMantraIndex(null);
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md animate-in fade-in">
            <div className={`${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]') : isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} border rounded-2xl sm:rounded-[48px] p-4 sm:p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh] transition-all duration-300`}>
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : isNeomorphic ? 'text-zinc-800' : 'text-slate-800'}`}>管理锦囊库</h2>
                    <button 
                        onClick={onClose}
                        className={`p-2 sm:p-3 rounded-full transition-colors ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.5),-3px_-3px_6px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]') : isDark ? 'hover:bg-zinc-700 text-white' : 'hover:bg-slate-100 text-slate-800'}`}
                    >
                        <X size={20} className={isDark ? 'text-white' : isNeomorphic ? 'text-zinc-800' : 'text-slate-800'} />
                    </button>
                </div>
                
                {/* 添加新咒语 */}
                <div className="mb-4 sm:mb-6">
                    <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : isNeomorphic ? 'text-zinc-700' : 'text-slate-700'}`}>添加新金句</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                            type="text" 
                            placeholder="输入新金句..." 
                            value={newMantraInput} 
                            onChange={(e) => setNewMantraInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            className={`flex-1 px-4 py-3 rounded-xl sm:rounded-[24px] transition-all ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_5px_5px_10px_rgba(0,0,0,0.4),inset_-5px_-5px_10px_rgba(30,30,46,0.8)] text-white placeholder-zinc-500' : 'bg-[#e0e5ec] shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)] text-zinc-800 placeholder-zinc-500') : isDark ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        <button 
                            onClick={handleAdd}
                            className={`px-4 py-3 rounded-xl sm:rounded-[24px] transition-all font-medium ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] text-white hover:shadow-[3px_3px_6px_rgba(0,0,0,0.5),-3px_-3px_6px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)] text-zinc-800') : isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                        >
                            添加
                        </button>
                    </div>
                </div>
                
                {/* 咒语列表 */}
                <div>
                    <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-zinc-300' : isNeomorphic ? 'text-zinc-700' : 'text-slate-700'}`}>现有金句 ({mantras.length})</h3>
                    <div className="space-y-3">
                        {mantras.map((mantra, index) => (
                            <div key={index} className={`flex items-center justify-between p-3 rounded-[24px] transition-all ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.5),-3px_-3px_6px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]') : isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-300'} border`}>
                                {editingMantraIndex === index ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <input 
                                            type="text" 
                                            value={editingMantraValue} 
                                            onChange={(e) => setEditingMantraValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(index)}
                                            autoFocus
                                            className={`flex-1 px-3 py-1.5 rounded-[16px] transition-all ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(30,30,46,0.8)] text-white' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] text-zinc-800') : isDark ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-slate-300 text-slate-800'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                        <button 
                                            onClick={() => handleSaveEdit(index)}
                                            className={`px-3 py-1.5 rounded-[16px] text-sm transition-all ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(30,30,46,0.8)] text-white hover:shadow-[2px_2px_4px_rgba(0,0,0,0.5),-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.5),-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] text-zinc-800') : isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                                        >
                                            保存
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between flex-1">
                                        <span className={`${isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-800' : 'text-slate-700'}`}>{mantra}</span>
                                        <div className="flex gap-1.5">
                                            <button 
                                                onClick={() => {
                                                    setEditingMantraIndex(index);
                                                    setEditingMantraValue(mantra);
                                                }}
                                                className={`p-1.5 rounded-full transition-colors ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(30,30,46,0.8)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.5),-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.5),-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] text-zinc-700') : isDark ? 'hover:bg-zinc-700 text-blue-400' : 'hover:bg-slate-200 text-blue-600'}`}
                                                title="编辑"
                                            >
                                                <Edit3 size={16} className={isDark ? 'text-blue-400' : isNeomorphic ? 'text-zinc-700' : 'text-blue-600'} />
                                            </button>
                                            <button 
                                                onClick={() => onDeleteMantra(index)}
                                                className={`p-1.5 rounded-full transition-colors ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(30,30,46,0.8)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.5),-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.5),-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] text-zinc-700') : isDark ? 'hover:bg-zinc-700 text-red-400' : 'hover:bg-slate-200 text-red-600'}`}
                                                title="删除"
                                            >
                                                <Trash2 size={16} className={isDark ? 'text-red-400' : isNeomorphic ? 'text-zinc-700' : 'text-red-600'} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MantraManagementModal;
