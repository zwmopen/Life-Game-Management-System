import React from 'react';
import { Theme } from '../../types';

interface EditGroupModalProps {
  editingGroup: string | null;
  onClose: () => void;
  isDark: boolean;
  isNeomorphic: boolean;
  isNeomorphicDark: boolean;
  textMain: string;
  textSub: string;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  editingGroup,
  onClose,
  isDark,
  isNeomorphic,
  isNeomorphicDark,
  textMain,
  textSub,
}) => {
  if (!editingGroup) return null;

  return (
    <div className="fixed inset-0 z-[10002] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className={`w-full max-w-md rounded-xl ${isNeomorphicDark ? 'bg-[#1e1e2e] border-[#1e1e2e] shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)]' : isDark ? 'bg-zinc-900 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-white border-gray-300'} p-6 border`}>
        <h3 className={`text-lg font-bold mb-4 ${textMain}`}>编辑分组名称</h3>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-bold mb-2 ${textSub}`}>分组名称</label>
            <input 
              type="text" 
              defaultValue={editingGroup === 'LEVEL' ? '等级' : editingGroup === 'FOCUS' ? '专注' : editingGroup === 'WEALTH' ? '财富' : editingGroup === 'COMBAT' ? '战斗' : editingGroup === 'CHECKIN' ? '签到' : '消费'}
              className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className={`flex-1 py-3 rounded-lg transition-all ${isDark ? 'bg-zinc-800 hover:bg-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-slate-100 hover:bg-slate-200'}`}
            >
              取消
            </button>
            <button 
              onClick={onClose}
              className={`flex-1 py-3 rounded-lg transition-all ${isDark ? 'bg-yellow-600 hover:bg-yellow-500' : isNeomorphic ? 'bg-blue-500 text-white shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-yellow-500 hover:bg-yellow-400'} text-white font-bold`}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditGroupModal;
