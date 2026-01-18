import React from 'react';
import { Theme } from '../../types';
import { GlobalHelpButton } from '../HelpSystem';

interface EditBadgeModalProps {
  editingBadge: any;
  badgeEditCache: any;
  setBadgeEditCache: React.Dispatch<React.SetStateAction<any>>;
  onClose: () => void;
  onSave: () => void;
  isDark: boolean;
  isNeomorphic: boolean;
  isNeomorphicDark: boolean;
  textMain: string;
  textSub: string;
  onHelpClick: (helpId: string) => void;
}

const EditBadgeModal: React.FC<EditBadgeModalProps> = ({
  editingBadge,
  badgeEditCache,
  setBadgeEditCache,
  onClose,
  onSave,
  isDark,
  isNeomorphic,
  isNeomorphicDark,
  textMain,
  textSub,
  onHelpClick,
}) => {
  if (!editingBadge) return null;

  const currentEditedBadge = badgeEditCache[editingBadge.category]?.[editingBadge.id] || editingBadge;

  return (
    <div className="fixed inset-0 z-[10003] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className={`w-full max-w-2xl rounded-xl ${isNeomorphicDark ? 'bg-[#1e1e2e] border-[#1e1e2e] shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)]' : isDark ? 'bg-zinc-900' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-white'} p-6 border`}>
        <h3 className={`text-lg font-bold mb-4 ${textMain}`}>编辑勋章</h3>
        <div className="space-y-4">
          {editingBadge.category === 'TASK' ? (
            <>
              <div>
                <label className={`block text-sm font-bold mb-2 ${textSub}`}>勋章名称</label>
                <input 
                  type="text" 
                  defaultValue={currentEditedBadge.title}
                  onChange={(e) => setBadgeEditCache((prev: any) => ({
                    ...prev,
                    [editingBadge.category]: {
                      ...prev[editingBadge.category] || {},
                      [editingBadge.id]: {
                        ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                        title: e.target.value
                      }
                    }
                  }))}
                  className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${textSub}`}>完成次数</label>
                  <input 
                    type="number" 
                    defaultValue={currentEditedBadge.requiredValue || 1}
                    min="1"
                    onChange={(e) => setBadgeEditCache((prev: any) => ({
                      ...prev,
                      [editingBadge.category]: {
                        ...prev[editingBadge.category] || {},
                        [editingBadge.id]: {
                          ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                          requiredValue: parseInt(e.target.value) || 1
                        }
                      }
                    }))}
                    className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${textSub}`}>解锁奖励</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${textSub}`}>经验值</label>
                      <input 
                        type="number" 
                        defaultValue={currentEditedBadge.rewardXp || 0}
                        min="0"
                        onChange={(e) => setBadgeEditCache((prev: any) => ({
                          ...prev,
                          [editingBadge.category]: {
                            ...prev[editingBadge.category] || {},
                            [editingBadge.id]: {
                              ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                              rewardXp: parseInt(e.target.value) || 0
                            }
                          }
                        }))}
                        className={`w-full p-2 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${textSub}`}>金币</label>
                      <input 
                        type="number" 
                        defaultValue={currentEditedBadge.rewardGold || 0}
                        min="0"
                        onChange={(e) => setBadgeEditCache((prev: any) => ({
                          ...prev,
                          [editingBadge.category]: {
                            ...prev[editingBadge.category] || {},
                            [editingBadge.id]: {
                              ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                              rewardGold: parseInt(e.target.value) || 0
                            }
                          }
                        }))}
                        className={`w-full p-2 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${textSub}`}>勋章名称</label>
                  <input 
                    type="text" 
                    defaultValue={currentEditedBadge.title}
                    onChange={(e) => setBadgeEditCache((prev: any) => ({
                      ...prev,
                      [editingBadge.category]: {
                        ...prev[editingBadge.category] || {},
                        [editingBadge.id]: {
                          ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                          title: e.target.value
                        }
                      }
                    }))}
                    className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${textSub}`}>子标题</label>
                  <input 
                    type="text" 
                    defaultValue={currentEditedBadge.subTitle}
                    onChange={(e) => setBadgeEditCache((prev: any) => ({
                      ...prev,
                      [editingBadge.category]: {
                        ...prev[editingBadge.category] || {},
                        [editingBadge.id]: {
                          ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                          subTitle: e.target.value
                        }
                      }
                    }))}
                    className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${textSub}`}>等级设置</label>
                  <input 
                    type="number" 
                    defaultValue={currentEditedBadge.level || 1}
                    min="1"
                    onChange={(e) => setBadgeEditCache((prev: any) => ({
                      ...prev,
                      [editingBadge.category]: {
                        ...prev[editingBadge.category] || {},
                        [editingBadge.id]: {
                          ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                          level: parseInt(e.target.value) || 1
                        }
                      }
                    }))}
                    className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${textSub}`}>达成条件</label>
                  <input 
                    type="text" 
                    defaultValue={currentEditedBadge.req}
                    onChange={(e) => setBadgeEditCache((prev: any) => ({
                      ...prev,
                      [editingBadge.category]: {
                        ...prev[editingBadge.category] || {},
                        [editingBadge.id]: {
                          ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                          req: e.target.value
                        }
                      }
                    }))}
                    className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className={`block text-sm font-bold ${textSub}`}>奖励配置</label>
                  <GlobalHelpButton 
                    helpId="badge-reward-rules" 
                    onHelpClick={onHelpClick} 
                    size={14} 
                    className="p-1 rounded-full hover:bg-yellow-500/20 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${textSub}`}>奖励比例 (%)</label>
                    <input 
                      type="number" 
                      defaultValue={currentEditedBadge.rewardRatio || 10}
                      min="0"
                      max="100"
                      onChange={(e) => setBadgeEditCache((prev: any) => ({
                        ...prev,
                        [editingBadge.category]: {
                          ...prev[editingBadge.category] || {},
                          [editingBadge.id]: {
                            ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                            rewardRatio: parseInt(e.target.value) || 10
                          }
                        }
                      }))}
                      className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${textSub}`}>经验奖励</label>
                    <input 
                      type="number" 
                      defaultValue={currentEditedBadge.rewardXp || 0}
                      min="0"
                      onChange={(e) => setBadgeEditCache((prev: any) => ({
                        ...prev,
                        [editingBadge.category]: {
                          ...prev[editingBadge.category] || {},
                          [editingBadge.id]: {
                            ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                            rewardXp: parseInt(e.target.value) || 0
                          }
                        }
                      }))}
                      className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${textSub}`}>金币奖励</label>
                    <input 
                      type="number" 
                      defaultValue={currentEditedBadge.rewardGold || 0}
                      min="0"
                      onChange={(e) => setBadgeEditCache((prev: any) => ({
                        ...prev,
                        [editingBadge.category]: {
                          ...prev[editingBadge.category] || {},
                          [editingBadge.id]: {
                            ...prev[editingBadge.category]?.[editingBadge.id] || editingBadge,
                            rewardGold: parseInt(e.target.value) || 0
                          }
                        }
                      }))}
                      className={`w-full p-3 rounded-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,1)]' : 'bg-white border-slate-200'} border ${textMain}`}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className={`flex-1 py-3 rounded-lg transition-all ${isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(30,30,46,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.9)]' : isDark ? 'bg-zinc-800 hover:bg-zinc-700' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-slate-100 hover:bg-slate-200'}`}
            >
              取消
            </button>
            <button 
              onClick={onSave}
              className={`flex-1 py-3 rounded-lg transition-all ${isNeomorphicDark ? 'bg-blue-500 text-white shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(30,30,46,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.9)]' : isDark ? 'bg-yellow-600 hover:bg-yellow-500' : isNeomorphic ? 'bg-blue-500 text-white shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]' : 'bg-yellow-500 hover:bg-yellow-400'} text-white font-bold`}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBadgeModal;
