import React, { useState } from 'react';
import { Menu, X, Sun, Moon, GripVertical, Gamepad2, BarChart2, ShoppingBag, ShieldAlert, Activity, Medal, Book, Settings, HelpCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { View, Theme } from '../types';
import { APP_VERSION } from '../constants/app';

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
  // 新增状态：控制是否完全隐藏侧边栏（仅手机端）
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [navItems, setNavItems] = useState([
    { id: View.RPG_MISSION_CENTER, label: '作战中心（执行）', icon: Gamepad2 },
    { id: View.HALL_OF_FAME, label: '荣誉殿堂（成就）', icon: Medal },
    { id: View.BLACK_MARKET, label: '补给黑市（奖励）', icon: ShoppingBag },
    { id: View.THINKING_CENTER, label: '思维中心（模型）', icon: Book },
    { id: View.SETTINGS, label: '设置中心（配置）', icon: Settings },
  ]);

  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const handleNavClick = (view: View) => {
    setView(view);
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

  const isDark = theme === 'dark' || theme === 'neomorphic-dark';
  const isNeomorphic = theme.startsWith('neomorphic');
  
  // 拟态风格样式 - 符合规格的高饱和度灰蓝色底色，135度光源，增强阴影效果
  const sidebarClass = isNeomorphic 
      ? `${theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-[#2a2a3e] shadow-[10px_10px_20px_rgba(0,0,0,0.4)]' : 'bg-[#e0e5ec] border-[#a3b1c6] shadow-[10px_10px_20px_rgba(163,177,198,0.6)]'} rounded-r-[48px] transition-all duration-300 overflow-hidden` 
      : isDark 
      ? 'bg-zinc-900 border-zinc-800 shadow-xl' 
      : 'bg-white border-slate-200 shadow-xl';
  
  const textClass = isDark ? 'text-zinc-400' : isNeomorphic ? 'text-zinc-700' : 'text-slate-500';
  
  const activeClass = isNeomorphic 
      ? `${theme === 'neomorphic-dark' 
        ? 'bg-[#1e1e2e] text-zinc-300 border-transparent shadow-[inset_8px_8px_16px_rgba(0,0,0,0.4),inset_-8px_-8px_16px_rgba(30,30,46,0.8)]' 
        : 'bg-[#e0e5ec] text-zinc-700 border-transparent shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)]'} transform scale-98 transition-all duration-150 rounded-lg` 
      : isDark 
      ? 'bg-emerald-900/20 text-emerald-400 border-transparent rounded-lg' 
      : 'bg-blue-50 text-blue-600 border-transparent rounded-lg';
  
  const hoverClass = isNeomorphic 
      ? `${theme === 'neomorphic-dark' 
        ? 'hover:text-zinc-300 hover:bg-[#1e1e2e] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)]' 
        : 'hover:text-zinc-800 hover:bg-[#e0e5ec] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)]'} transition-all duration-200 transform scale-102 rounded-lg` 
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


          {/* 折叠/展开按钮 - 放在导航栏左边外框边上 */}
          {/* 三级折叠逻辑：默认展开全部 -> 点击1次：折叠显示图标 -> 点击2次：隐藏全部 -> 点击3次：展开全部 */}
          <button 
            onClick={() => {
              if (isNavHidden) {
                // 从完全隐藏状态恢复到展开全部
                setIsNavHidden(false);
                setIsNavCollapsed(false);
              } else if (isNavCollapsed) {
                // 从只显示图标状态隐藏全部导航栏
                setIsNavHidden(true);
              } else {
                // 从展开状态折叠到只显示图标
                setIsNavCollapsed(true);
              }
            }}
            className={`
              fixed left-0 top-1/2 transform -translate-y-1/2 p-2 rounded-r-lg transition-all duration-300 flex items-center justify-center z-50
              md:absolute md:left-0 md:right-auto md:transform-none md:translate-y-0
              ${isNeomorphic 
                ? 'bg-transparent text-zinc-700 hover:bg-transparent hover:shadow-none' 
                : isDark 
                ? 'text-zinc-500 hover:text-white hover:bg-transparent' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-transparent'}`}
            title={isNavHidden ? '展开导航栏' : isNavCollapsed ? '隐藏导航栏' : '折叠导航栏'}
          >
            {/* 根据状态显示正确的图标方向 */}
            {isNavHidden ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

      {/* 导航栏容器 */}
      <div className={`
        inset-y-0 left-0 translate-x-0 
        md:translate-x-0 transition duration-200 ease-in-out
        w-${isNavCollapsed ? '12' : '56'} border-r flex flex-col z-40 ${sidebarClass}
        fixed md:relative
        ${isNavHidden ? 'hidden' : ''}
      `}>
          <div className={`px-4 py-6 ${isNeomorphic ? (theme === 'neomorphic-dark' ? `bg-[#1e1e2e]` : `bg-[#e0e5ec]`) : ''} flex items-center justify-between ${isNavCollapsed ? 'hidden' : 'md:flex'}`}>
            <h1 className={`text-xl font-bold tracking-tighter ${isDark ? 'text-emerald-500' : 'text-blue-600'}`}>
              人生游戏系统
            </h1>
          </div>

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
                      ${isNavCollapsed 
                        ? `w-10 h-10 justify-center mx-auto my-1` 
                        : `w-full space-x-3 px-4 py-3 pl-8`
                      }
                      ${currentView === item.id ? activeClass : `${textClass} ${hoverClass}`}
                  `}
                  title={item.label}
                  >
                  <item.icon size={isNavCollapsed ? 18 : 20} />
                  {!isNavCollapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                  </button>
              </div>
            ))}
          </nav>

          {/* Entropy Monitor */}
          {!isNavCollapsed && (
            <div className={`px-4 py-4 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]') : isDark ? 'bg-zinc-900' : 'bg-white'} transition-all duration-300`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${entropyColor}`}>
                            <Activity size={12}/> 系统稳定性
                        </span>
                        <div className="relative group">
                            <button className={`text-zinc-500 hover:text-zinc-800 transition-colors ${isDark ? 'hover:text-white' : ''}`}>
                                <HelpCircle size={10}/>
                            </button>
                            <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 rounded text-[10px] ${isDark ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : 'bg-white text-slate-800 border border-slate-200 shadow-lg'} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50`}>
                                系统稳定性 = 100% - 熵值<br/>熵值越高，系统越混乱<br/>完成习惯任务可降低熵值
                            </div>
                        </div>
                    </div>
                    <span className={`text-xs font-mono font-bold ${entropyColor}`}>{100 - entropy}%</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden flex ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') : isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}>
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
          
          {/* 主题切换按钮 - 四种主题支持 */}
          <div className={`${isNavCollapsed ? 'px-3 py-3' : 'px-4 py-6'} border-t ${isDark ? 'border-zinc-800' : 'border-slate-100'} flex ${isNavCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
               <button 
                  onClick={() => {
                      setTheme(prev => {
                          // 按照指定顺序切换主题：拟态浅色 → 拟态深色 → 普通浅色 → 普通深色
                          if (prev === 'neomorphic-light') return 'neomorphic-dark';
                          if (prev === 'neomorphic-dark') return 'light';
                          if (prev === 'light') return 'dark';
                          return 'neomorphic-light';
                      });
                  }}
                  className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-300 
                      ${theme === 'neomorphic-light' 
                          ? 'bg-[#e0e5ec] text-zinc-700 shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.7),inset_3px_3px_6px_rgba(0,0,0,0.1)]' 
                          : theme === 'neomorphic-dark' 
                          ? 'bg-[#1e1e2e] text-zinc-300 shadow-[inset_-3px_-3px_6px_rgba(30,30,46,0.7),inset_3px_3px_6px_rgba(0,0,0,0.3)]' 
                          : isDark 
                          ? 'bg-zinc-900 text-zinc-400 hover:text-white' 
                          : 'bg-slate-100 text-slate-500 hover:text-blue-600'}`}
                  title={`切换主题`}
               >
                   {/* 显示当前主题的图标 */}
                   {theme.includes('dark') && <Moon size={12}/>} 
                   {theme.includes('light') && <Sun size={12}/>} 
                   {theme.startsWith('neomorphic') && <Activity size={12}/>} 
                             
                   {/* 显示当前主题的文本 */}
                   {!isNavCollapsed && (
                     <span>
                       {theme === 'neomorphic-light' ? '拟态浅色' : 
                        theme === 'neomorphic-dark' ? '拟态深色' : 
                        theme === 'light' ? '普通浅色' : '普通深色'}
                     </span>
                   )}
               </button>
              {!isNavCollapsed && (
                <div className={`text-[10px] font-mono ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>V {APP_VERSION}</div>
              )}
          </div>
      </div>
    </>
  );
};

export default Navigation;