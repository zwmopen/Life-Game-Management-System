import React, { useEffect, useRef } from 'react';
import { Theme } from '../../types';
import { SceneManager } from '../../utils/SceneManager';

// 优化后的3D渲染引擎
const OptimizedImmersivePomodoro3D: React.FC<{
  theme: Theme;
  totalPlants: number;
  currentSeed: string;
  isFocusing: boolean;
  isPaused: boolean;
  onEntityCreated?: (entity: any) => void;
}> = ({ theme, totalPlants, currentSeed, isFocusing, isPaused, onEntityCreated }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  // 初始化3D场景
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // 创建SceneManager实例
    const sceneManager = new SceneManager();
    sceneManager.init(canvasRef.current, containerRef.current);
    sceneManagerRef.current = sceneManager;

    // 清理函数
    return () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
        sceneManagerRef.current = null;
      }
    };
  }, []);

  // 更新场景
  useEffect(() => {
    if (!sceneManagerRef.current) return;

    sceneManagerRef.current.updateScene(theme, totalPlants, currentSeed, isFocusing, isPaused);
  }, [theme, totalPlants, currentSeed, isFocusing, isPaused]);

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default OptimizedImmersivePomodoro3D;