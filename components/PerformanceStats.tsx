import React, { useState, useEffect } from 'react';
import { advancedPerformanceMonitor, useAdvancedPerformance } from '../utils/AdvancedPerformanceMonitor';
import { useTheme } from '../contexts/ThemeContext';

const PerformanceStats: React.FC = () => {
  const { stats, printSummary } = useAdvancedPerformance();
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [fps, setFps] = useState(0);
  const [lastTimestamp, setLastTimestamp] = useState(performance.now());
  const [frameCount, setFrameCount] = useState(0);

  // FPS计算
  useEffect(() => {
    const calculateFPS = () => {
      const now = performance.now();
      const delta = now - lastTimestamp;
      
      if (delta >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / delta);
        setFps(currentFps);
        setFrameCount(0);
        setLastTimestamp(now);
      } else {
        setFrameCount(prev => prev + 1);
      }
      
      requestAnimationFrame(calculateFPS);
    };

    const animationFrame = requestAnimationFrame(calculateFPS);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [lastTimestamp]);

  // 获取内存信息
  const getMemoryInfo = () => {
    // @ts-ignore - performance.memory is non-standard API
    if (typeof performance !== 'undefined' && performance.memory) {
      try {
        // @ts-ignore
        const memory = performance.memory;
        const percentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        return {
          percentage: percentage.toFixed(2),
          used: (memory.usedJSHeapSize / 1048576).toFixed(2), // MB
          total: (memory.jsHeapSizeLimit / 1048576).toFixed(2) // MB
        };
      } catch (error) {
        console.warn('[Performance Stats] Memory info not available:', error);
        return null;
      }
    }
    return null;
  };

  const memoryInfo = getMemoryInfo();

  const getFpsColor = (fpsValue: number) => {
    if (fpsValue > 50) return 'text-green-500';
    if (fpsValue > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMemoryColor = (percentage: string) => {
    const percentNum = parseFloat(percentage);
    if (percentNum > 80) return 'text-red-500';
    if (percentNum > 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getDurationColor = (duration: number) => {
    if (duration > 100) return 'text-red-500';
    if (duration > 50) return 'text-orange-500';
    if (duration > 16.67) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-4 right-4 p-2 rounded-full shadow-lg ${
          theme.includes('dark') ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        } border hover:opacity-80 transition-opacity z-50`}
        aria-label="Show Performance Stats"
      >
        ⚡
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 w-72 p-4 rounded-lg shadow-xl border z-50 ${
      theme.includes('dark') 
        ? 'bg-gray-800 text-white border-gray-700' 
        : 'bg-white text-gray-800 border-gray-200'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">Performance Stats</h3>
        <div className="flex space-x-2">
          <button
            onClick={printSummary}
            className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
            title="Print detailed summary to console"
          >
            📊
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {/* FPS */}
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={getFpsColor(fps)}>{fps} Hz</span>
        </div>

        {/* Memory Usage */}
        {memoryInfo && (
          <div className="flex justify-between">
            <span>Memory:</span>
            <span className={getMemoryColor(memoryInfo.percentage)}>
              {memoryInfo.percentage}% ({memoryInfo.used}MB)
            </span>
          </div>
        )}

        {/* Total Samples */}
        <div className="flex justify-between">
          <span>Samples:</span>
          <span>{stats.totalSamples}</span>
        </div>

        {/* Average Duration */}
        <div className="flex justify-between">
          <span>Avg Duration:</span>
          <span className={getDurationColor(stats.averageDuration)}>
            {stats.averageDuration.toFixed(2)}ms
          </span>
        </div>

        {/* Max Duration */}
        <div className="flex justify-between">
          <span>Max Duration:</span>
          <span className={getDurationColor(stats.maxDuration)}>
            {stats.maxDuration.toFixed(2)}ms
          </span>
        </div>

        {/* 95th Percentile */}
        <div className="flex justify-between">
          <span>95th %ile:</span>
          <span className={getDurationColor(stats.percentile95)}>
            {stats.percentile95.toFixed(2)}ms
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500" title="Good performance (&lt;16.67ms)"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500" title="Moderate performance (&lt;50ms)"></div>
          <div className="w-3 h-3 rounded-full bg-red-500" title="Poor performance (&gt;50ms)"></div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceStats;