import React, { useState } from 'react';
import { Menu, X, Sun, Moon, GripVertical, Gamepad2, BarChart2, ShoppingBag, ShieldAlert, Activity, Medal, Book, Settings, HelpCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { View, Theme } from '../types';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  entropy: number; // New prop
  isNavCollapsed: boolean;
  setIsNavCollapsed: (collapsed: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isMobileOpen, setIsMobileOpen, theme, setTheme, entropy, isNavCollapsed, setIsNavCollapsed }) => {
  const [navItems, setNavItems] = useState([
    { id: View.RPG_MISSION_CENTER, label: '作战中心（执行）', icon: Gamepad2 },
    { id: View.HALL_OF_FAME, label: '荣誉殿堂（成就）', icon: Medal },
    { id: View.BLACK_MARKET, label: '补给黑市（奖励）', icon: ShoppingBag },
    { id: View.DATA_CHARTS, label: '图表汇总（洞察）', icon: BarChart2 },
    { id: View.SETTINGS, label: '设置中心（配置）', icon: Settings },
  ]);

  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const handleNavClick = (view: View) => {
    setView(view);
    setIsMobileOpen(false);
  };

  const handleDragStart = (index: number) => {
      setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedItem === null || draggedItem === index) return;
      
      const newItems = [...navItems];
      const movedItem = newItems.splice(draggedItem, 1)[0];
      newItems.splice(index, 0, movedItem);
      
      setNavItems(newItems);
      setDraggedItem(index);
  };

  const isDark = theme === 'dark';
  const isNeomorphic = theme === 'neomorphic';
  
  // 拟态风格样式 - 符合规格的高饱和度灰蓝色底色，135度光源，增强阴影效果
  const sidebarClass = isNeomorphic 
      ? 'bg-[#e0e5ec] border-[#a3b1c6] rounded-r-[48px] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] transition-all duration-300' 
      : isDark 
      ? 'bg-zinc-950 border-zinc-800' 
      : 'bg-white border-slate-200 shadow-xl';
  
  const textClass = isDark ? 'text-zinc-400' : isNeomorphic ? 'text-zinc-700' : 'text-slate-500';
  
  const activeClass = isNeomorphic 
      ? 'bg-[#e0e5ec] text-zinc-700 border-[#a3b1c6] rounded-lg shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)] transform scale-98 transition-all duration-150' 
      : isDark 
      ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50 rounded-lg' 
      : 'bg-blue-50 text-blue-600 border-blue-200 rounded-lg';
  
  const hoverClass = isNeomorphic 
      ? 'hover:text-zinc-800 hover:bg-[#e0e5ec] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] transition-all duration-200 transform scale-102 rounded-lg' 
      : isDark 
      ? 'hover:text-zinc-100 hover:bg-zinc-900 rounded-lg' 
      : 'hover:text-slate-900 hover:bg-slate-50 rounded-lg';

  // Entropy Color Logic
  const getEntropyColor = () => {
      if (entropy > 80) return 'text-red-500';
      if (entropy > 50) return 'text-orange-500';
      return 'text-emerald-500';
  };
  const entropyColor = getEntropyColor();

  return (
    <>
      {/* 移除移动端冗余菜单按钮 */}

      {/* 导航栏容器 */}
      <div className={`
        inset-y-0 left-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 transition duration-200 ease-in-out
        w-${isNavCollapsed ? '12' : '64'} border-r flex flex-col z-40 ${sidebarClass}
        ${isNavCollapsed ? 'block' : 'block'}
      `}>
          <div className={`p-6 border-b ${isDark ? 'border-zinc-800' : 'border-slate-100'} flex items-center justify-between ${isNavCollapsed ? 'hidden' : 'flex'}`}>
            <h1 className={`text-xl font-bold tracking-tighter ${isDark ? 'text-emerald-500' : 'text-blue-600'}`}>
              人生游戏系统
            </h1>
          </div>
          
          {/* 折叠/展开按钮 - 调整到导航栏中间位置，贴紧右边 */}
          {/* 统一逻辑：点击折叠/展开导航栏宽度 */}
          <button 
            onClick={() => {
              // 无论移动端还是桌面端，都切换折叠状态
              setIsNavCollapsed(!isNavCollapsed);
            }}
            className={`
              absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-all duration-300 flex items-center justify-center z-50
              ${isNeomorphic 
                ? 'bg-[#e0e5ec] text-zinc-700 hover:bg-[#e0e5ec] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)]' 
                : isDark 
                ? 'text-zinc-500 hover:text-white hover:bg-zinc-800' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
            title={isNavCollapsed ? '展开导航栏' : '收起导航栏'}
          >
            {/* 统一显示折叠/展开图标 */}
            {isNavCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <nav className="flex-1 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item, index) => (
              <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  className="group relative"
              >
                  {!isNavCollapsed && (
                    <div className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab text-zinc-600">
                        <GripVertical size={12}/>
                    </div>
                  )}
                  <button
                  onClick={() => handleNavClick(item.id)}
                  className={`
                      flex items-center rounded-lg transition-all duration-200 border border-transparent
                      ${isNavCollapsed && !isMobileOpen 
                        ? `w-10 h-10 justify-center mx-auto` 
                        : `w-full space-x-3 px-4 py-3 pl-8`
                      }
                      ${currentView === item.id ? activeClass : `${textClass} ${hoverClass}`}
                  `}
                  >
                  <item.icon size={isNavCollapsed && !isMobileOpen ? 18 : 20} />
                  {!isNavCollapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                  </button>
              </div>
            ))}
          </nav>

          {/* Entropy Monitor */}
          {!isNavCollapsed && (
            <div className={`px-6 py-4 border-t ${isDark ? 'border-zinc-800 bg-zinc-900/30' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${entropyColor}`}>
                            <Activity size={12}/> 系统稳定性
                        </span>
                        <div className="relative group">
                            <button className="text-zinc-500 hover:text-white transition-colors">
                                <HelpCircle size={10}/>
                            </button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                系统稳定性 = 100% - 熵值<br/>熵值越高，系统越混乱<br/>完成习惯任务可降低熵值
                            </div>
                        </div>
                    </div>
                    <span className={`text-xs font-mono font-bold ${entropyColor}`}>{100 - entropy}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden flex">
                    <div 
                        className={`h-full transition-all duration-1000 ${entropy > 50 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} 
                        style={{ width: `${100 - entropy}%` }}
                    ></div>
                </div>
                {entropy > 50 && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-red-500 animate-pulse font-mono">
                        <ShieldAlert size={10}/> 警告: 熵增过高
                    </div>
                )}
            </div>
          )}
          
          {/* 主题切换按钮 - 拟态风格 */}
          {!isNavCollapsed && (
            <div className={`p-6 border-t ${isDark ? 'border-zinc-800' : 'border-slate-100'} flex justify-between items-center`}>
                 <button 
                    onClick={() => {
                        setTheme(prev => {
                            if (prev === 'dark') return 'light';
                            if (prev === 'light') return 'neomorphic';
                            return 'dark';
                        });
                    }}
                    className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-300 
                        ${theme === 'neomorphic' 
                            ? 'bg-zinc-300 text-zinc-700 shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.7),inset_3px_3px_6px_rgba(0,0,0,0.1)]' 
                            : isDark 
                            ? 'bg-zinc-900 text-zinc-400 hover:text-white' 
                            : 'bg-slate-100 text-slate-500 hover:text-blue-600'}`}
                    title={`切换到${theme === 'dark' ? '浅色' : theme === 'light' ? '拟态' : '深色'}主题`}
                 >
                     {theme === 'dark' && <Moon size={12}/>}
                     {theme === 'light' && <Sun size={12}/>}
                     {theme === 'neomorphic' && <Activity size={12}/>}
                     {theme === 'dark' ? '深色' : theme === 'light' ? '浅色' : '拟态'}
                 </button>
                <div className={`text-[10px] font-mono ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>V 4.5.0</div>
            </div>
          )}
      </div>
    </>
  );
};

export default Navigation;