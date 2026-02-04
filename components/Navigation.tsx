import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Sun, Moon, GripVertical, Gamepad2, BarChart2, ShoppingBag, ShieldAlert, Activity, Medal, Book, Settings, ChevronRight, ChevronLeft, GripHorizontal, Clock, Star } from 'lucide-react';
import { View, Theme } from '../types';
import { APP_VERSION } from '../constants/app';
import { GlobalHelpButton } from './HelpSystem';

// 导入主题上下文
import { useTheme } from '../contexts/ThemeContext';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  entropy: number; // New prop
  isNavCollapsed: boolean;
  setIsNavCollapsed: (collapsed: boolean) => void;
  onHelpClick: (helpId: string) => void;
  isModalOpen?: boolean; // New prop for modal state
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isMobileOpen, setIsMobileOpen, entropy, isNavCollapsed, setIsNavCollapsed, onHelpClick, isModalOpen = false }) => {
  const { theme, setTheme } = useTheme();
  // 新增状态：控制是否完全隐藏侧边栏（仅手机端）
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [navItems, setNavItems] = useState([
    { id: View.RPG_MISSION_CENTER, label: '作战中心（执行）', icon: Gamepad2 },
    { id: View.HALL_OF_FAME, label: '荣誉殿堂（成就）', icon: Medal },
    { id: View.BLACK_MARKET, label: '补给黑市（奖励）', icon: ShoppingBag },
    { id: View.THINKING_CENTER, label: '思维中心（模型）', icon: Book },
    { id: View.HIGHEST_VERSION, label: '自我显化（对齐）', icon: Star },
    { id: View.SETTINGS, label: '设置中心（配置）', icon: Settings },
  ]);

  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  
  // 侧边栏宽度限制
  const MIN_SIDEBAR_WIDTH = 48; // 12 * 4
  const MAX_SIDEBAR_WIDTH = 280;
  
  // 侧边栏宽度状态
  const [sidebarWidth, setSidebarWidth] = useState<number>(isNavCollapsed ? MIN_SIDEBAR_WIDTH : 224); // 根据isNavCollapsed初始化宽度

  // 当isNavCollapsed变化时，更新sidebarWidth
  useEffect(() => {
    if (isNavCollapsed) {
      setSidebarWidth(MIN_SIDEBAR_WIDTH);
    } else {
      setSidebarWidth(224);
    }
  }, [isNavCollapsed]);

  // 手机端手势滑动相关状态
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  
  // 最小滑动距离（像素）
  const minSwipeDistance = 30;
  
  // 侧边栏容器引用
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  const handleNavClick = (view: View, e?: React.MouseEvent | React.TouchEvent) => {
    // 阻止事件冒泡，防止在手机上触发侧边栏的触摸事件处理逻辑
    e?.stopPropagation();
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
  
  // 手机端手势滑动处理函数
  const handleTouchStart = (e: React.TouchEvent) => {
    const clientX = e.targetTouches[0].clientX;
    setTouchStart(clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    const clientX = e.targetTouches[0].clientX;
    setTouchEnd(clientX);
  };
  
  const handleTouchEnd = () => {
    // 计算滑动距离
    const swipeDistance = touchEnd - touchStart;
    
    if (Math.abs(swipeDistance) >= minSwipeDistance) {
      // 判断滑动方向和距离
      if (swipeDistance > 0) {
          // 向右滑动 - 展开侧边栏
          if (isNavHidden) {
            setIsNavHidden(false);
            setIsNavCollapsed(false);
            setSidebarWidth(224);
          } else if (isNavCollapsed) {
            setIsNavCollapsed(false);
            setSidebarWidth(224);
          }
        } else {
        // 向左滑动 - 折叠侧边栏
        if (!isNavCollapsed) {
          setIsNavCollapsed(true);
          setSidebarWidth(MIN_SIDEBAR_WIDTH);
        } else if (!isNavHidden) {
          setIsNavHidden(true);
        }
      }
    }
    
    // 重置触摸状态
    setTouchStart(0);
    setTouchEnd(0);
  };
  
  // 监听窗口大小变化，在移动端自动调整
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        // 只调整宽度，不修改isNavCollapsed状态
        if (isNavCollapsed) {
          setSidebarWidth(MIN_SIDEBAR_WIDTH);
        } else {
          setSidebarWidth(224);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // 立即初始化，确保组件加载时宽度正确设置
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isNavCollapsed]); // 依赖isNavCollapsed，确保宽度随状态变化



  const isDark = theme.includes('dark');
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
        : 'bg-[#e0e5ec] text-zinc-700 border-transparent shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)]'} transform scale-98 transition-all duration-150 rounded-full` 
      : isDark 
      ? 'bg-emerald-900/20 text-emerald-400 border-transparent rounded-full' 
      : 'bg-blue-50 text-blue-600 border-transparent rounded-full';
  
  const hoverClass = isNeomorphic 
      ? `${theme === 'neomorphic-dark' 
        ? 'hover:text-zinc-300 hover:bg-[#1e1e2e] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.5),-12px_-12px_24px_rgba(30,30,46,1)]' 
        : 'hover:text-zinc-800 hover:bg-[#e0e5ec] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)]'} transition-all duration-200 transform scale-102 rounded-full` 
      : isDark 
      ? 'hover:text-zinc-100 hover:bg-zinc-900 rounded-full' 
      : 'hover:text-slate-900 hover:bg-slate-50 rounded-full';

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
                setSidebarWidth(224);
              } else if (isNavCollapsed) {
                // 从只显示图标状态隐藏全部导航栏
                setIsNavHidden(true);
              } else {
                // 从展开状态折叠到只显示图标
                setIsNavCollapsed(true);
                setSidebarWidth(MIN_SIDEBAR_WIDTH);
              }
            }}
            className={`
              fixed left-0 top-1/2 transform -translate-y-1/2 p-3 rounded-r-full transition-all duration-300 flex items-center justify-center z-50
              md:absolute md:left-0 md:right-auto md:transform-none md:translate-y-0
              ${isNeomorphic 
                ? 'bg-transparent text-zinc-700 hover:bg-transparent hover:shadow-none' 
                : isDark 
                ? 'text-zinc-500 hover:text-white hover:bg-transparent' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-transparent'}
              hover:scale-[1.1] active:scale-[0.95]
            `}
            title={isNavHidden ? '展开导航栏' : isNavCollapsed ? '隐藏导航栏' : '折叠导航栏'}
          >
            {/* 根据状态显示正确的图标方向 */}
            <div className="transition-transform duration-300 ease-in-out">
              {isNavHidden ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </div>
          </button>

      {/* 侧边栏容器 - 使用覆盖式设计 */}
      {!isModalOpen && (
        <div 
          ref={sidebarRef}
          className={`
            inset-y-0 left-0 transform transition-all duration-300 ease-in-out
            flex flex-col z-40 ${sidebarClass}
            fixed md:relative
            ${isNavHidden ? 'hidden' : ''}
            shadow-2xl
            md:shadow-none
          `}
          style={{
            width: `${sidebarWidth}px`,
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          // 手机端手势滑动事件监听器
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
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
                  onClick={(e) => handleNavClick(item.id, e)}
                  onTouchEnd={(e) => handleNavClick(item.id, e)}
                  className={`
                      flex items-center rounded-full transition-all duration-300 border border-transparent
                      ${isNavCollapsed 
                        ? `w-10 h-10 justify-center mx-auto my-1` 
                        : `w-full space-x-3 px-4 py-3 pl-8`
                      }
                      ${currentView === item.id ? activeClass : `${textClass} ${hoverClass}`}
                      transform hover:scale-[1.03] active:scale-[0.98]
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
                        <GlobalHelpButton 
                            helpId="system-stability" 
                            onHelpClick={onHelpClick} 
                            size={10} 
                        />
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
                          // 按照指定顺序切换主题：浅色 → 深色
                          if (prev === 'neomorphic-light') return 'neomorphic-dark';
                          return 'neomorphic-light';
                      });
                  }}
                  className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-300 
                      ${theme === 'neomorphic-light' 
                          ? 'bg-[#e0e5ec] text-zinc-700 shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.7),inset_3px_3px_6px_rgba(0,0,0,0.1)]' 
                          : 'bg-[#1e1e2e] text-zinc-300 shadow-[inset_-3px_-3px_6px_rgba(30,30,46,0.7),inset_3px_3px_6px_rgba(0,0,0,0.3)]'}`}
                  title={`切换主题`}
               >
                   {/* 显示当前主题的图标 */}
                   {theme.includes('dark') && <Moon size={12}/>} 
                   {theme.includes('light') && <Sun size={12}/>} 
                   {theme.startsWith('neomorphic') && <Activity size={12}/>} 
                             
                   {/* 显示当前主题的文本 */}
                   {!isNavCollapsed && (
                     <span>
                       {theme === 'neomorphic-light' ? '浅色' : '深色'}
                     </span>
                   )}
               </button>
              {!isNavCollapsed && (
                <div className={`text-[10px] font-mono ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>V {APP_VERSION}</div>
              )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;