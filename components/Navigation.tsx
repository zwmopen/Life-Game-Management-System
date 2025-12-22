import React, { useState } from 'react';
import { Menu, X, Command, Sun, Moon, GripVertical, Gamepad2, BarChart2, ShoppingBag, ShieldAlert, Activity, Medal, Book, Settings, HelpCircle, ChevronRight, ChevronLeft } from 'lucide-react';
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
    { id: View.COMMAND_CENTER, label: '战略指挥部（决策）', icon: Command },
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
  
  // 拟态风格样式
  const sidebarClass = isNeomorphic 
      ? 'bg-zinc-200 border-zinc-300 shadow-[20px_20px_40px_rgba(0,0,0,0.1),-20px_-20px_40px_rgba(255,255,255,0.8)] transition-all duration-300' 
      : isDark 
      ? 'bg-zinc-950 border-zinc-800' 
      : 'bg-white border-slate-200 shadow-xl';
  
  const textClass = isDark ? 'text-zinc-400' : isNeomorphic ? 'text-zinc-700' : 'text-slate-500';
  
  const activeClass = isNeomorphic 
      ? 'bg-zinc-200 text-zinc-700 border-zinc-300 shadow-[inset_5px_5px_10px_rgba(0,0,0,0.1),inset_-5px_-5px_10px_rgba(255,255,255,0.8)]' 
      : isDark 
      ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' 
      : 'bg-blue-50 text-blue-600 border-blue-200';
  
  const hoverClass = isNeomorphic 
      ? 'hover:text-zinc-800 hover:bg-zinc-200 hover:shadow-[5px_5px_10px_rgba(0,0,0,0.15),-5px_-5px_10px_rgba(255,255,255,0.9)]' 
      : isDark 
      ? 'hover:text-zinc-100 hover:bg-zinc-900' 
      : 'hover:text-slate-900 hover:bg-slate-50';

  // Entropy Color Logic
  const getEntropyColor = () => {
      if (entropy > 80) return 'text-red-500';
      if (entropy > 50) return 'text-orange-500';
      return 'text-emerald-500';
  };
  const entropyColor = getEntropyColor();

  return (
    <>
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className={`p-2 border rounded-md ${isDark ? 'bg-zinc-900 border-zinc-700 text-emerald-400' : 'bg-white border-slate-200 text-blue-600'}`}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 折叠/展开按钮 - 始终在同一个位置 */}
      <button 
        onClick={() => setIsNavCollapsed(!isNavCollapsed)}
        className={`
          fixed top-0 transform -translate-y-0
          p-1 rounded-l-none rounded-r-lg ${isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-white' : 'bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700'} 
          shadow-md transition-all duration-300 z-50
        `}
        style={{ left: isNavCollapsed ? '0px' : '16rem' }}
        title={isNavCollapsed ? '展开导航栏' : '收起导航栏'}
      >
        {/* 根据折叠状态显示相反的图标 */}
        {isNavCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
      
      {/* 导航栏容器 */}
      <div className={`
        inset-y-0 left-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        ${isNavCollapsed && !isMobileOpen ? 'hidden' : 'block'} md:relative md:translate-x-0 transition duration-200 ease-in-out
        w-64 border-r flex flex-col z-40 ${sidebarClass}
      `}>
          <div className={`p-6 border-b ${isDark ? 'border-zinc-800' : 'border-slate-100'} flex items-center justify-between`}>
            <h1 className={`text-xl font-bold tracking-tighter ${isDark ? 'text-emerald-500' : 'text-blue-600'}`}>
              人生游戏系统
            </h1>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item, index) => (
              <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  className="group relative"
              >
                  <div className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab text-zinc-600">
                      <GripVertical size={12}/>
                  </div>
                  <button
                  onClick={() => handleNavClick(item.id)}
                  className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 border border-transparent pl-8
                      ${currentView === item.id ? activeClass : `${textClass} ${hoverClass}`}
                  `}
                  >
                  <item.icon size={20} />
                  <span className="font-medium text-sm">{item.label}</span>
                  </button>
              </div>
            ))}
          </nav>

          {/* Entropy Monitor */}
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
          
          {/* 主题切换按钮 - 拟态风格 */}
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
      </div>
    </>
  );
};

export default Navigation;