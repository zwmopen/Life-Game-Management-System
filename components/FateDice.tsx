import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three-stdlib';
import { Theme, DiceState } from '@/types';

interface FateDiceProps {
  theme: Theme;
  diceState: DiceState | undefined;
  onSpinDice?: () => { success: boolean; message?: string };
  onUpdateDiceState?: (updates: Partial<DiceState>) => void;
  onAddFloatingReward?: (text: string, color: string) => void;
}

const FateDice: React.FC<FateDiceProps> = ({ theme, diceState, onSpinDice, onUpdateDiceState, onAddFloatingReward }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  
  // 音效相关
  const audioContextRef = useRef<AudioContext | null>(null);
  const diceSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // 剩余次数编辑功能 - todayCount 表示已使用次数
  const [localTodayCount, setLocalTodayCount] = useState<number>(diceState?.todayCount || 0);
  const [localDailyLimit, setLocalDailyLimit] = useState<number>(diceState?.config.dailyLimit || 10);
  const [isEditingCount, setIsEditingCount] = useState<boolean>(false);
  const [isEditingLimit, setIsEditingLimit] = useState<boolean>(false);
  // 计算剩余次数
  const remainingCount = localDailyLimit - localTodayCount;
  
  // Three.js相关引用
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const diceMeshRef = useRef<THREE.Mesh | null>(null);
  
  // 主题相关样式
  const isDark = theme === 'dark' || theme === 'neomorphic-dark';
  const isNeomorphic = theme.startsWith('neomorphic');
  const isNeomorphicDark = theme === 'neomorphic-dark';
  
  const bgColor = isNeomorphic 
    ? (isNeomorphicDark ? '#1e1e2e' : '#e0e5ec')
    : isDark
    ? '#1e1e2e'
    : '#e0e5ec';
  
  const textColor = isNeomorphic
    ? (isNeomorphicDark ? '#d8d8d8' : '#4d5b6d')
    : isDark
    ? '#d8d8d8'
    : '#4d5b6d';
  
  const shadowLight = isNeomorphicDark ? '#1a1a2e' : '#ffffff';
  const shadowDark = isNeomorphicDark ? '#0f0f1e' : '#a3b1c6';
  
  // 创建骰子纹理
  const createDiceTextures = (renderer: THREE.WebGLRenderer) => {
    const size = 512;
    const textures: THREE.CanvasTexture[] = [];
    const faceNumbers = [2, 5, 3, 4, 1, 6]; 

    faceNumbers.forEach(num => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // 1. 背景：纯净奶白，不再带灰
        ctx.fillStyle = '#ffffff'; 
        ctx.fillRect(0, 0, size, size);

        // 2. 极其微弱的暖色光晕 (模拟玉石温润感)
        const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(1, 'rgba(240, 245, 250, 1)'); // 边缘微蓝冷调，呼应背景
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        // 3. 绘制点数
        drawPips(ctx, num, size);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      textures.push(texture);
    });

    return textures;
  };
  
  // 绘制骰子点数
  const drawPips = (ctx: CanvasRenderingContext2D, num: number, size: number) => {
    const r = size / 10;
    const center = size / 2;
    const offset = size / 3.6;

    const draw = (x: number, y: number, color: string) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      
      ctx.fillStyle = color;
      ctx.fill();

      // 内凹阴影：稍微加深一点，增加清晰度
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.shadowColor = 'rgba(163,177,198, 0.8)'; // 加深阴影
      ctx.stroke();

      ctx.shadowColor = 'transparent'; 
      
      // 高光
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255, 0.9)';
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    // 经典配色：1点正红，其他深黑
    const pipColor = (num === 1) ? '#ef4444' : '#1e293b';

    if (num === 1) {
      ctx.beginPath();
      ctx.arc(center, center, r * 1.6, 0, Math.PI * 2); // 1点大一点
      ctx.fillStyle = pipColor;
      ctx.fill();
      // 1点特殊光泽
      ctx.strokeStyle = 'rgba(0,0,0,0.05)';
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }

    if (num > 1) { 
      draw(center - offset, center - offset, pipColor);
      draw(center + offset, center + offset, pipColor);
    }
    if (num > 3) { 
      draw(center + offset, center - offset, pipColor);
      draw(center - offset, center + offset, pipColor);
    }
    if (num === 6) { 
      draw(center - offset, center, pipColor);
      draw(center + offset, center, pipColor);
    }
    if (num % 2 === 1) { 
      draw(center, center, pipColor);
    }
  };
  
  // 创建骰子网格
  const createDice = (renderer: THREE.WebGLRenderer) => {
    // 增大骰子尺寸，从2.5x2.5x2.5调整为3.5x3.5x3.5
    const geometry = new RoundedBoxGeometry(3.5, 3.5, 3.5, 10, 0.3);
    
    const textures = createDiceTextures(renderer);
    
    // --- 材质升级：白玉质感 ---
    const materials = textures.map(texture => {
      return new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xffffff,       // 纯白基底
        roughness: 0.15,       // 降低粗糙度 -> 表面光滑，反光更清晰
        metalness: 0.05,       // 微量金属感 -> 增加质感硬度
        envMapIntensity: 1.0,
      });
    });

    const diceMesh = new THREE.Mesh(geometry, materials);
    diceMesh.castShadow = true;
    diceMesh.receiveShadow = true;
    diceMesh.rotation.x = Math.random() * Math.PI;
    diceMesh.rotation.y = Math.random() * Math.PI;
    
    return diceMesh;
  };
  
  // 初始化Three.js场景
  const initThreeJS = () => {
    if (!canvasContainerRef.current) {
      console.error('Canvas container not found');
      return;
    }
    
    console.log('Initializing Three.js scene...');
    
    // 确保容器有正确的尺寸
    const containerWidth = canvasContainerRef.current.clientWidth;
    const containerHeight = canvasContainerRef.current.clientHeight;
    console.log('Canvas container size:', containerWidth, 'x', containerHeight);
    
    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.Fog(bgColor, 8, 25);
    sceneRef.current = scene;
    
    // 创建相机，调整位置以适应更大的骰子
    const camera = new THREE.PerspectiveCamera(
      45, 
      containerWidth / containerHeight, 
      0.1, 
      100
    );
    // 将相机位置从9调整到10，确保更大的骰子能完整显示
    camera.position.set(0, 0, 10);
    cameraRef.current = camera;
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    
    // 清空容器并添加渲染器
    canvasContainerRef.current.innerHTML = '';
    canvasContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // --- 灯光系统升级 (更明亮，更通透) ---
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 主光源：强烈的白光，制造清晰的亮面
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(-5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.radius = 2;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    // 辅助光源，确保骰子各个面都能被照亮
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(5, 5, 5);
    scene.add(fillLight);

    // 地面阴影
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.ShadowMaterial({ 
      opacity: 0.1, 
      color: 0x4d5b6d 
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 3;
    plane.position.y = -10; 
    plane.receiveShadow = true;
    scene.add(plane);
    
    // 创建骰子
    const diceMesh = createDice(renderer);
    scene.add(diceMesh);
    diceMeshRef.current = diceMesh;
    console.log('Dice mesh created and added to scene');
    
    // 立即渲染一帧，确保骰子能够显示
    renderer.render(scene, camera);
    
    // 开始动画循环
    animate();
    console.log('Three.js scene initialized successfully');
  };
  
  // 动画循环
  const animate = () => {
    requestAnimationFrame(animate);
    
    if (rendererRef.current && sceneRef.current && cameraRef.current && diceMeshRef.current) {
      if (!isRolling) {
        const time = Date.now() * 0.001;
        diceMeshRef.current.position.y = Math.sin(time) * 0.12; 
        diceMeshRef.current.rotation.x += 0.001;
        diceMeshRef.current.rotation.y += 0.002;
      }
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };
  
  // 生成更真实的骰子滚动音效 - 清脆的碰撞声
  const generateRollingSound = () => {
    if (!audioContextRef.current) return;
    
    const audioContext = audioContextRef.current;
    const startTime = audioContext.currentTime;
    
    // 模拟骰子在碗中碰撞的连续声音
    const soundCount = 8; // 碰撞次数
    const baseFreq = 600; // 基础频率，更高频率更清脆
    
    for (let i = 0; i < soundCount; i++) {
      // 每个碰撞声使用不同的频率和持续时间
      const freq = baseFreq + Math.random() * 400; // 600-1000Hz，更清脆
      const duration = 0.05 + Math.random() * 0.05; // 0.05-0.1秒，更短更干脆
      
      // 创建振荡器
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // 使用冲击波形，更像碰撞声
      oscillator.type = 'square';
      
      // 快速的音量冲击，模拟碰撞的瞬间
      gainNode.gain.setValueAtTime(0.5, startTime + i * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + i * 0.1 + duration);
      
      // 频率快速下降，模拟碰撞后的衰减
      oscillator.frequency.setValueAtTime(freq, startTime + i * 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, startTime + i * 0.1 + duration);
      
      oscillator.start(startTime + i * 0.1);
      oscillator.stop(startTime + i * 0.1 + duration);
    }
  };
  
  // 生成结果音效
  const generateResultSound = () => {
    if (!audioContextRef.current) return;
    
    const audioContext = audioContextRef.current;
    const startTime = audioContext.currentTime;
    
    // 创建两个振荡器，一个主音和一个泛音
    const mainOscillator = audioContext.createOscillator();
    const mainGain = audioContext.createGain();
    
    const harmonicOscillator = audioContext.createOscillator();
    const harmonicGain = audioContext.createGain();
    
    mainOscillator.connect(mainGain);
    harmonicOscillator.connect(harmonicGain);
    mainGain.connect(audioContext.destination);
    harmonicGain.connect(audioContext.destination);
    
    // 主音：400Hz，正弦波
    mainOscillator.frequency.setValueAtTime(400, startTime);
    mainOscillator.type = 'sine';
    
    // 泛音：800Hz，正弦波
    harmonicOscillator.frequency.setValueAtTime(800, startTime);
    harmonicOscillator.type = 'sine';
    
    // 主音音量包络
    mainGain.gain.setValueAtTime(0.0, startTime);
    mainGain.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
    mainGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
    
    // 泛音音量包络
    harmonicGain.gain.setValueAtTime(0.0, startTime);
    harmonicGain.gain.linearRampToValueAtTime(0.2, startTime + 0.08);
    harmonicGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
    
    mainOscillator.start(startTime);
    mainOscillator.stop(startTime + 0.5);
    
    harmonicOscillator.start(startTime);
    harmonicOscillator.stop(startTime + 0.4);
  };
  
  // 掷骰子
  const rollDice = () => {
    if (isRolling || !diceMeshRef.current || !onSpinDice) return;
    
    // 播放滚动音效
    playDiceSound();
    
    setIsRolling(true);
    
    // 生成随机结果用于3D动画显示
    const rollResult = Math.floor(Math.random() * 6) + 1;
    
    // 旋转目标
    const rotations: Record<number, { x: number; y: number }> = {
      1: { x: 0, y: 0 },
      6: { x: Math.PI, y: 0 },
      2: { x: 0, y: -Math.PI/2 },
      5: { x: 0, y: Math.PI/2 },
      3: { x: -Math.PI/2, y: 0 },
      4: { x: Math.PI/2, y: 0 }
    };
    
    const target = rotations[rollResult];
    const roundsX = (Math.floor(Math.random() * 3) + 4) * (Math.PI * 2);
    const roundsY = (Math.floor(Math.random() * 3) + 4) * (Math.PI * 2);
    
    const currentX = diceMeshRef.current.rotation.x;
    const currentY = diceMeshRef.current.rotation.y;
    
    const targetRotation = {
      x: currentX + roundsX + (target.x - (currentX % (Math.PI * 2))),
      y: currentY + roundsY + (target.y - (currentY % (Math.PI * 2)))
    };
    
    // 确保旋转增量正确
    let deltaX = target.x - (currentX % (Math.PI * 2));
    if (deltaX < 0) deltaX += Math.PI * 2;
    targetRotation.x = currentX + deltaX + roundsX;
    
    let deltaY = target.y - (currentY % (Math.PI * 2));
    if (deltaY < 0) deltaY += Math.PI * 2;
    targetRotation.y = currentY + deltaY + roundsY;
    
    const duration = 2500;
    const startTime = performance.now();
    const startRotation = { x: currentX, y: currentY };
    
    // 动画函数
    const animateRoll = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      
      if (diceMeshRef.current) {
        diceMeshRef.current.rotation.x = startRotation.x + (targetRotation.x - startRotation.x) * ease;
        diceMeshRef.current.rotation.y = startRotation.y + (targetRotation.y - startRotation.y) * ease;
        
        if(progress < 1) {
          diceMeshRef.current.position.y = Math.sin(progress * Math.PI * 5) * (1 - progress) * 1.8;
        } else {
          diceMeshRef.current.position.y = 0;
        }
      }
      
      if (progress < 1) {
          requestAnimationFrame(animateRoll);
        } else {
          // 增加本地已使用次数
          setLocalTodayCount(prev => Math.min(prev + 1, localDailyLimit));
          
          // 调用父组件传入的旋转函数，在动画完成后调用，确保用户体验
          const result = onSpinDice();
          if (!result.success && result.message && onAddFloatingReward) {
            onAddFloatingReward(result.message, 'text-red-500');
          }
          
          setIsRolling(false);
        }
    };
    
    requestAnimationFrame(animateRoll);
  };
  
  // 初始化音频元素
  const initAudioElement = () => {
    try {
      // 创建音频元素并设置音效文件
      const audio = new Audio();
      // 尝试使用相对路径
      audio.src = '色子音效.mp3';
      audio.volume = 0.7;
      audio.preload = 'auto';
      
      // 监听音频加载错误
      audio.addEventListener('error', (e) => {
        console.error('音频加载错误:', e);
        // 回退到生成的音效
        console.log('回退到生成音效');
      });
      
      diceSoundRef.current = audio;
      console.log('音频元素初始化成功，使用路径:', audio.src);
    } catch (error) {
      console.error('无法初始化音频元素:', error);
    }
  };
  
  // 生成回退音效 - 简单的骰子碰撞声
  const generateFallbackSound = () => {
    if (!audioContextRef.current) {
      // 初始化音频上下文
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error('无法初始化音频上下文:', error);
        return;
      }
    }
    
    const audioContext = audioContextRef.current;
    const startTime = audioContext.currentTime;
    
    // 生成多个频率的声音，模拟骰子碰撞
    const frequencies = [600, 700, 800, 900, 1000];
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(freq, startTime + index * 0.05);
      
      gainNode.gain.setValueAtTime(0.5, startTime + index * 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + index * 0.05 + 0.1);
      
      oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, startTime + index * 0.05 + 0.1);
      
      oscillator.start(startTime + index * 0.05);
      oscillator.stop(startTime + index * 0.05 + 0.1);
    });
  };
  
  // 播放骰子音效
  const playDiceSound = () => {
    // 尝试播放外部音效
    if (diceSoundRef.current) {
      diceSoundRef.current.currentTime = 0;
      diceSoundRef.current.play().catch(error => {
        console.error('无法播放外部音效，使用生成音效:', error);
        // 播放回退音效
        generateFallbackSound();
      });
    } else {
      // 播放回退音效
      generateFallbackSound();
    }
  };
  
  // 窗口大小调整
  const handleResize = () => {
    if (!cameraRef.current || !rendererRef.current || !canvasContainerRef.current) return;
    
    const width = canvasContainerRef.current.clientWidth;
    const height = canvasContainerRef.current.clientHeight;
    
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    
    rendererRef.current.setSize(width, height);
  };
  
  // 初始化和清理
  useEffect(() => {
    console.log('useEffect triggered, theme:', theme);
    
    // 初始化Three.js场景
    initThreeJS();
    
    // 初始化音频元素
    initAudioElement();
    
    // 添加窗口大小调整事件监听
    window.addEventListener('resize', handleResize);
    
    // 手动触发一次调整大小，确保初始渲染正确
    setTimeout(() => {
      handleResize();
    }, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // 清理Three.js资源
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      
      if (sceneRef.current) {
        // 清理场景中的所有对象
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        sceneRef.current = null;
      }
      
      cameraRef.current = null;
      diceMeshRef.current = null;
      
      // 清理音频资源
      if (diceSoundRef.current) {
        diceSoundRef.current.pause();
        diceSoundRef.current = null;
      }
    };
  }, [theme, bgColor, shadowDark, shadowLight, textColor]);
  
  // 当diceState变化时，更新本地剩余次数和总数
  useEffect(() => {
    if (diceState?.todayCount !== undefined) {
      setLocalTodayCount(diceState.todayCount);
    }
    if (diceState?.config.dailyLimit !== undefined) {
      setLocalDailyLimit(diceState.config.dailyLimit);
    }
  }, [diceState?.todayCount, diceState?.config.dailyLimit]);
  
  return (
    <div 
      ref={containerRef}
      className="w-full rounded-xl p-2 transition-all duration-300"
      style={{
        backgroundColor: bgColor,
        boxShadow: `9px 9px 16px ${shadowDark}, -9px -9px 16px ${shadowLight}`,
        transform: 'translateY(0)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* 3D骰子容器 */}
      <div 
        ref={canvasContainerRef}
        className="w-full h-[300px] mb-4 rounded-xl overflow-hidden relative"
        style={{ backgroundColor: bgColor }}
      ></div>
      
      {/* 剩余次数显示 - 移到按钮上方 */}
      <div className="mb-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="text-base font-medium" style={{ color: textColor }}>
            今日剩余次数
          </div>
          {isEditingCount ? (
            <input
              type="number"
              min="0"
              max={localDailyLimit}
              value={remainingCount}
              onChange={(e) => {
                const remaining = Math.max(0, parseInt(e.target.value) || 0);
                // remainingCount = localDailyLimit - localTodayCount → localTodayCount = localDailyLimit - remaining
                setLocalTodayCount(localDailyLimit - remaining);
              }}
              className={`text-base font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'} bg-transparent border-b border-blue-400 focus:outline-none w-12 text-center`}
              style={{ color: isDark ? '#3b82f6' : '#2563eb' }}
              autoFocus
              onBlur={() => {
                setIsEditingCount(false);
                if (onUpdateDiceState) {
                  onUpdateDiceState({ todayCount: localTodayCount });
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingCount(false);
                  if (onUpdateDiceState) {
                    onUpdateDiceState({ todayCount: localTodayCount });
                  }
                }
              }}
            />
          ) : (
            <div 
              className={`text-base font-bold cursor-pointer ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
              onDoubleClick={() => setIsEditingCount(true)}
            >
              {remainingCount}
            </div>
          )}
          
          <div className="text-base font-bold" style={{ color: textColor }}>/</div>
          
          <div 
            className={`text-base font-bold cursor-pointer`}
            style={{ color: textColor }}
            onDoubleClick={() => setIsEditingLimit(true)}
          >
            {localDailyLimit}
          </div>
        </div>
      </div>
      
      {/* 掷骰子按钮 */}
      <div className="text-center">
        <button
          onClick={rollDice}
          disabled={isRolling || (diceState?.isSpinning || (remainingCount <= 0))}
          className={`w-full py-2 text-lg font-bold rounded-md transition-all duration-300 ${
            isNeomorphic ? (isNeomorphicDark ? 'bg-[#1e1e2e] text-blue-400 hover:text-blue-300' : 'bg-[#e0e5ec] text-blue-600 hover:text-blue-700') : (isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800')
          } ${
            isNeomorphic ? `shadow-${isNeomorphicDark ? 'inner' : 'md'} hover:shadow-${isNeomorphicDark ? 'lg' : 'lg'} active:shadow-inner` : 'shadow-sm'
          } ${
            isRolling || (diceState?.isSpinning || (remainingCount <= 0)) ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          style={{
            boxShadow: isNeomorphic ? `9px 9px 16px ${shadowDark}, -9px -9px 16px ${shadowLight}` : ''
          }}
        >
          {isRolling || diceState?.isSpinning ? '投掷中...' : '开始投掷'}
        </button>
      </div>
    </div>
  );
};

export default FateDice;