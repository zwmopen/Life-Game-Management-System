import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import PerformanceOptimizer from '../utils/PerformanceOptimizer';

const PerformanceMonitor: React.FC = () => {
  const { theme } = useTheme();
  const [fps, setFps] = useState<number | null>(null);
  const [memoryInfo, setMemoryInfo] = useState<{ used: number; total: number; percentage: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 订阅FPS监控
    const unsubscribe = PerformanceOptimizer.FPSMonitor.subscribe(setFps);
    
    // 定期获取内存信息
    const memoryInterval = setInterval(() => {
      const memInfo = PerformanceOptimizer.MemoryMonitor.getMemoryInfo();
      if (memInfo) {
        setMemoryInfo(memInfo);
      }
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(memoryInterval);
    };
  }, []);

  const isDark = theme === 'dark' || theme === 'neomorphic-dark';
  const isNeomorphic = theme.startsWith('neomorphic');

  // 获取FPS颜色指示器
  const getFpsColor = (fpsValue: number | null) => {
    if (fpsValue === null) return 'text-gray-500';
    if (fpsValue > 50) return 'text-green-500';
    if (fpsValue > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  // 获取内存颜色指示器
  const getMemoryColor = (percentage: number | null) => {
    if (percentage === null) return 'text-gray-500';
    if (percentage < 50) return 'text-green-500';
    if (percentage < 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed bottom-4 right-4 z-[1000]">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`
          px-3 py-1 rounded-lg text-xs font-bold transition-all
          ${isNeomorphic 
            ? (theme === 'neomorphic-dark' 
              ? 'bg-[#1e1e2e] text-zinc-300 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' 
              : 'bg-[#e0e5ec] text-zinc-700 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]')
            : isDark 
              ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' 
              : 'bg-white text-zinc-800 border border-zinc-200'
          }
        `}
      >
        ⚙️ 性能监控
      </button>
      
      {isVisible && (
        <div className={`
          mt-2 p-3 rounded-lg text-xs font-mono
          ${isNeomorphic 
            ? (theme === 'neomorphic-dark' 
              ? 'bg-[#1e1e2e] text-zinc-300 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' 
              : 'bg-[#e0e5ec] text-zinc-700 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]')
            : isDark 
              ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' 
              : 'bg-white text-zinc-800 border border-zinc-200'
          }
        `}>
          <div className="mb-2">
            <span className="inline-block w-12">FPS:</span>
            <span className={getFpsColor(fps)}>
              {fps !== null ? `${fps} FPS` : 'N/A'}
            </span>
          </div>
          
          {memoryInfo && (
            <div>
              <div className="mb-1">
                <span className="inline-block w-12">内存:</span>
                <span className={getMemoryColor(memoryInfo.percentage)}>
                  {Math.round(memoryInfo.percentage)}%
                </span>
              </div>
              <div className="text-xs opacity-75">
                {(memoryInfo.used / 1024 / 1024).toFixed(1)}MB / {(memoryInfo.total / 1024 / 1024).toFixed(1)}MB
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;