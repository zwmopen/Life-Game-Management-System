import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Theme } from '../../types';

// 定义3D场景类型
interface SceneObject {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  type: string;
  userData?: any;
}

// LOD级别枚举
enum LODLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  VERY_LOW = 'very_low'
}

// 优化后的3D渲染引擎
const OptimizedImmersivePomodoro3D: React.FC<{
  theme: Theme;
  totalPlants: number;
  currentSeed: string;
  isFocusing: boolean;
  isPaused: boolean;
  onEntityCreated?: (entity: SceneObject) => void;
}> = ({ theme, totalPlants, currentSeed, isFocusing, isPaused, onEntityCreated }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 存储场景对象
  const sceneObjectsRef = useRef<SceneObject[]>([]);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const controlsRef = useRef<any>(null); // 添加控制器引用
  const animationFrameRef = useRef<number>(0);
  const entitiesRef = useRef<any[]>([]);
  const previewMeshRef = useRef<any>(null);
  const groundRef = useRef<any>(null);
  const tomatoMeshRef = useRef<any>(null);
  
  // LOD距离阈值
  const lodDistances = useMemo(() => ({
    high: 10,
    medium: 25,
    low: 50,
    veryLow: 100
  }), []);
  
  // 物种数据
  const SPECIES = useMemo(() => ({
    plants: [
      { id: 'pine', name: '松树', icon: '🌲' },
      { id: 'oak', name: '橡树', icon: '🌳' },
      { id: 'cherry', name: '樱花', icon: '🌸' },
      { id: 'willow', name: '垂柳', icon: '🌿' },
      { id: 'bamboo', name: '竹子', icon: '🎋' },
      { id: 'palm', name: '椰树', icon: '🌴' },
      { id: 'cactus', name: '仙人掌', icon: '🌵' },
      { id: 'mushroom', name: '巨菇', icon: '🍄' },
      { id: 'sunflower', name: '向日葵', icon: '🌻' },
      { id: 'birch', name: '白桦', icon: '🪵' }
    ],
    animals: [
      { id: 'rabbit', name: '白兔', icon: '🐰' },
      { id: 'fox', name: '赤狐', icon: '🦊' },
      { id: 'panda', name: '熊猫', icon: '🐼' },
      { id: 'pig', name: '小猪', icon: '🐷' },
      { id: 'chick', name: '小鸡', icon: '🐤' },
      { id: 'penguin', name: '企鹅', icon: '🐧' },
      { id: 'frog', name: '青蛙', icon: '🐸' },
      { id: 'sheep', name: '绵羊', icon: '🐑' },
      { id: 'bear', name: '棕熊', icon: '🐻' },
      { id: 'bee', name: '蜜蜂', icon: '🐝' }
    ]
  }), []);

  // 根据主题获取颜色
  const getThemeColors = useMemo(() => () => {
    if (theme.includes('dark')) {
      return {
        bgColor: 0x1e1e2e,
        groundColor: 0x33334d,
        grassColor: 0x2d3748,
        neuBgColor: 0x2d3748
      };
    } else {
      return {
        bgColor: 0xe0e5ec,
        groundColor: 0x795548,
        grassColor: 0x8bc34a,
        neuBgColor: 0xe0e5ec
      };
    }
  }, [theme]);

  // LOD计算函数
  const calculateLODLevel = (distance: number): LODLevel => {
    if (distance < lodDistances.high) return LODLevel.HIGH;
    if (distance < lodDistances.medium) return LODLevel.MEDIUM;
    if (distance < lodDistances.low) return LODLevel.LOW;
    return LODLevel.VERY_LOW;
  };

  // 初始化3D场景
  const initializeScene = async () => {
    if (!containerRef.current || !canvasRef.current) return;

    try {
      // 检查场景是否已经初始化，避免重复初始化
      if (sceneRef.current) {
        return () => {};
      }
      
      // 动态导入Three.js
      const THREE = await import('three');
      const OrbitControls = (await import('three/examples/jsm/controls/OrbitControls.js')).OrbitControls;

      // 配置常量
      const GROUND_SIZE = 180;
      const NEU_BG_COLOR = 0xe0e5ec;

      // 创建场景
      const scene = new THREE.Scene();
      const colors = getThemeColors();
      scene.background = new THREE.Color(colors.bgColor);
      scene.fog = new THREE.Fog(colors.bgColor, 60, 160);

      // 创建相机 - 添加有效尺寸检查
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      // 确保有有效尺寸，避免相机崩溃
      const aspect = (containerWidth > 0 && containerHeight > 0) 
        ? containerWidth / containerHeight 
        : window.innerWidth / window.innerHeight;
      
      const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
      camera.position.set(0, 50, 80);

      // 创建渲染器 - 添加有效尺寸检查
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current,
        antialias: true,
        alpha: true
      });
      // 确保有有效尺寸，避免渲染器崩溃
      const renderWidth = containerWidth > 0 ? containerWidth : window.innerWidth;
      const renderHeight = containerHeight > 0 ? containerHeight : window.innerHeight;
      renderer.setSize(renderWidth, renderHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;

      // 添加光照
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);
      
      const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
      sunLight.position.set(40, 80, 40);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.left = -100;
      sunLight.shadow.camera.right = 100;
      sunLight.shadow.camera.top = 100;
      sunLight.shadow.camera.bottom = -100;
      sunLight.shadow.bias = -0.0005;
      scene.add(sunLight);

      const fillLight = new THREE.DirectionalLight(0xa3b1c6, 0.5);
      fillLight.position.set(20, 10, -20);
      scene.add(fillLight);

      // 创建地面
      const groundGeometry = new THREE.CylinderGeometry(
        GROUND_SIZE / 2, // 顶部半径
        GROUND_SIZE / 2, // 底部半径
        5,               // 高度（厚度）
        64               // 分段数，越高越圆
      );
      
      const groundMaterial = new THREE.MeshStandardMaterial({
        color: colors.groundColor,
        roughness: 0.9,
        metalness: 0.1,
        side: THREE.DoubleSide
      });
      
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.position.set(0, 0, 0);
      ground.receiveShadow = true;
      scene.add(ground);
      groundRef.current = ground;
      
      // 在地面上添加一层草地
      const grassGeometry = new THREE.CircleGeometry(GROUND_SIZE / 2 - 0.5, 64);
      const grassMaterial = new THREE.MeshStandardMaterial({
        color: colors.grassColor,
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.DoubleSide
      });
      
      const grass = new THREE.Mesh(grassGeometry, grassMaterial);
      grass.position.set(0, 2.51, 0);
      grass.rotation.x = -Math.PI / 2;
      grass.receiveShadow = true;
      ground.add(grass);

      // 创建番茄
      const tomatoGeometry = new THREE.SphereGeometry(2, 32, 32);
      const tomatoMaterial = new THREE.MeshStandardMaterial({
        color: 0xff5722,
        roughness: 0.5,
        metalness: 0.1
      });
      const tomatoMesh = new THREE.Mesh(tomatoGeometry, tomatoMaterial);
      tomatoMesh.name = 'tomatoMesh';
      tomatoMesh.position.set(0, 2, 0);
      tomatoMesh.castShadow = true;
      tomatoMesh.visible = false;
      scene.add(tomatoMesh);
      tomatoMeshRef.current = tomatoMesh;

      // 添加控制器
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.maxPolarAngle = Math.PI / 2 - 0.05;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.3;
      controls.enablePan = true;
      controls.enableZoom = true;

      // 保存引用
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      controlsRef.current = controls;

      // 窗口大小调整 - 添加有效尺寸检查
      const handleResize = () => {
        if (camera && renderer && containerRef.current) {
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          if (width > 0 && height > 0) { // 确保有有效尺寸，避免相机崩溃
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
          }
        }
      };
      window.addEventListener('resize', handleResize);

      // 返回清理函数
      const cleanup = () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        // 清理资源
        if (renderer && renderer.dispose) {
          renderer.dispose();
        }
        if (controls && controls.dispose) {
          controls.dispose();
        }
      };
      
      // 初始化生态系统
      updateEcosystem(totalPlants);

      // 开始渲染循环
      animate();
      
      return cleanup;
    } catch (error) {
      console.error('Failed to initialize 3D scene:', error);
    }
    
    // 如果初始化失败，返回一个空的清理函数
    return () => {};
  };

  // 监听主题变化，更新3D场景颜色
  useEffect(() => {
    if (!sceneRef.current || !groundRef.current) return;

    const colors = getThemeColors();
    
    // 更新场景背景颜色
    sceneRef.current.background.set(colors.bgColor);
    
    // 更新场景雾颜色
    if (sceneRef.current.fog) {
      sceneRef.current.fog.color.set(colors.bgColor);
    }
    
    // 更新地面颜色
    if (groundRef.current) {
      const ground = groundRef.current;
      if (ground.material) {
        (ground.material as any).color.set(colors.groundColor);
      }
      
      // 更新草地颜色
      if (ground.children && ground.children.length > 0) {
        const grass = ground.children[0];
        if (grass.material) {
          (grass.material as any).color.set(colors.grassColor);
        }
      }
    }
  }, [theme]);

  // 创建实体
  const createEntity = async (type: string, x: number, z: number) => {
    if (!sceneRef.current) return null;

    const THREE = await import('three');
    let mesh: any;

    // 根据类型创建不同的实体
    const localSpecies = {
      plants: [
        { id: 'pine', name: '松树', icon: '🌲' },
        { id: 'oak', name: '橡树', icon: '🌳' },
        { id: 'cherry', name: '樱花', icon: '🌸' },
        { id: 'willow', name: '垂柳', icon: '🌿' },
        { id: 'bamboo', name: '竹子', icon: '🎋' },
        { id: 'palm', name: '椰树', icon: '🌴' },
        { id: 'cactus', name: '仙人掌', icon: '🌵' },
        { id: 'mushroom', name: '巨菇', icon: '🍄' },
        { id: 'sunflower', name: '向日葵', icon: '🌻' },
        { id: 'birch', name: '白桦', icon: '🪵' }
      ],
      animals: [
        { id: 'rabbit', name: '白兔', icon: '🐰' },
        { id: 'fox', name: '赤狐', icon: '🦊' },
        { id: 'panda', name: '熊猫', icon: '🐼' },
        { id: 'pig', name: '小猪', icon: '🐷' },
        { id: 'chick', name: '小鸡', icon: '🐤' },
        { id: 'penguin', name: '企鹅', icon: '🐧' },
        { id: 'frog', name: '青蛙', icon: '🐸' },
        { id: 'sheep', name: '绵羊', icon: '🐑' },
        { id: 'bear', name: '棕熊', icon: '🐻' },
        { id: 'bee', name: '蜜蜂', icon: '🐝' }
      ]
    };

    if (localSpecies.plants.some(p => p.id === type)) {
      mesh = createPlant(type, THREE);
    } else if (localSpecies.animals.some(a => a.id === type)) {
      mesh = createAnimal(type, THREE);
    } else {
      // 默认创建松树
      mesh = createPlant('pine', THREE);
    }

    // 设置位置，确保所有模型底部与地面贴合（地面顶部在y=2.5处）
    if (mesh instanceof THREE.Group) {
      // 对于组合模型，设置位置使底部与地面贴合
      mesh.position.set(x, 2.5, z);
    } else if (mesh.geometry) {
      // 对于单个几何体，根据几何体高度设置位置，确保底部与地面贴合
      const height = (mesh.geometry as any).parameters?.height || 0;
      mesh.position.set(x, 2.5 + height / 2, z);
    } else {
      // 默认位置，确保底部与地面贴合
      mesh.position.set(x, 2.5, z);
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    sceneRef.current.add(mesh);
    entitiesRef.current.push(mesh);
    
    return mesh;
  };

  // 检查位置是否与现有实体重叠
  const checkPositionValidity = (x: number, z: number, entitySize: number = 2): boolean => {
    const GROUND_SIZE = 180;
    // 检查是否在大陆范围内
    const distanceFromCenter = Math.sqrt(x * x + z * z);
    if (distanceFromCenter > GROUND_SIZE / 2 - entitySize) {
      return false;
    }
    
    // 检查是否与现有实体重叠
    for (const entity of entitiesRef.current) {
      if (entity && entity.position) {
        const dx = x - entity.position.x;
        const dz = z - entity.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance < entitySize * 2) {
          return false;
        }
      }
    }
    return true;
  };
  
  // 生成有效的随机位置
  const generateValidPosition = (entitySize: number = 2): { x: number; z: number } => {
    const GROUND_SIZE = 180;
    const maxAttempts = 100;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      attempts++;
      // 避免大陆中心区域（中心半径20范围内）
      const centerAvoidanceRadius = 20;
      const angle = Math.random() * Math.PI * 2;
      const radius = centerAvoidanceRadius + Math.random() * (GROUND_SIZE * 0.5 - centerAvoidanceRadius);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      if (checkPositionValidity(x, z, entitySize)) {
        return { x, z };
      }
    }
    
    // 如果多次尝试失败，返回一个默认位置
    const defaultAngle = Math.random() * Math.PI * 2;
    const centerAvoidanceRadius = 20; // 重新声明变量以确保作用域正确
    const defaultRadius = centerAvoidanceRadius + Math.random() * (GROUND_SIZE * 0.5 - centerAvoidanceRadius);
    return {
      x: Math.cos(defaultAngle) * defaultRadius,
      z: Math.sin(defaultAngle) * defaultRadius
    };
  };

  // 更新生态系统：根据count参数创建指定数量的模型
  const updateEcosystem = async (count: number) => {
    if (!sceneRef.current) return;

    try {
      const THREE = await import('three');

      // 重置实体数组
      entitiesRef.current = [];
      
      // 清除场景中所有非基础对象（只保留地面、番茄和预览模型）
      sceneRef.current.children.forEach(child => {
        if (child !== groundRef.current && child !== tomatoMeshRef.current && child.name !== 'previewMesh') {
          sceneRef.current.remove(child);
        }
      });
      
      // 重置预览模型引用
      previewMeshRef.current = null;
      
      // 获取所有可用物种
      const allSpecies = [...SPECIES.plants, ...SPECIES.animals];
      
      // 确保count为非负数
      const validCount = Math.max(0, count);
      
      // 无论数量多少，都随机选择物种并创建实体
      for (let i = 0; i < validCount; i++) {
        // 随机选择一个物种
        const randomSpecies = allSpecies[Math.floor(Math.random() * allSpecies.length)];
        
        // 生成有效的随机位置，避免重叠
        const entitySize = 2; // 实体大小，用于碰撞检测
        const { x, z } = generateValidPosition(entitySize);
        
        const entity = await createEntity(randomSpecies.id, x, z);
        
        // 添加动物动画属性
        if (entity instanceof THREE.Group) {
          const isAnimal = SPECIES.animals.some(animal => animal.id === randomSpecies.id);
          if (isAnimal) {
            entity.userData.isAnimal = true;
            entity.userData.originalPosition = { x: entity.position.x, y: entity.position.y, z: entity.position.z };
            // 直接设置物种ID，避免动画循环中动态推断
            entity.userData.speciesId = randomSpecies.id;
            
            // 根据动物类型设置不同的运动参数
            let speed, movementRadius, jumpHeight;
            switch(randomSpecies.id) {
              case 'rabbit': // 兔子 - 慢速，小范围跳跃，更自然的运动
                speed = 0.008 + Math.random() * 0.01; // 更慢的速度
                movementRadius = 2 + Math.random() * 2; // 更小的移动范围
                jumpHeight = 0.15; // 更自然的跳跃高度
                break;
              case 'fox': // 狐狸 - 中速，中等范围移动
                speed = 0.015 + Math.random() * 0.02;
                movementRadius = 4 + Math.random() * 3;
                jumpHeight = 0.15;
                break;
              case 'panda': // 熊猫 - 慢速，小范围移动
                speed = 0.008 + Math.random() * 0.01;
                movementRadius = 2 + Math.random() * 2;
                jumpHeight = 0.1;
                break;
              case 'pig': // 小猪 - 慢速，中等范围移动
                speed = 0.01 + Math.random() * 0.015;
                movementRadius = 3 + Math.random() * 3;
                jumpHeight = 0.1;
                break;
              case 'chick': // 小鸡 - 快速，小范围跳跃
                speed = 0.02 + Math.random() * 0.02;
                movementRadius = 2 + Math.random() * 2;
                jumpHeight = 0.15;
                break;
              case 'penguin': // 企鹅 - 中速，小范围移动
                speed = 0.012 + Math.random() * 0.01;
                movementRadius = 3 + Math.random() * 2;
                jumpHeight = 0.05;
                break;
              case 'frog': // 青蛙 - 中速，跳跃较高
                speed = 0.015 + Math.random() * 0.015;
                movementRadius = 4 + Math.random() * 3;
                jumpHeight = 0.4;
                break;
              case 'sheep': // 绵羊 - 慢速，中等范围移动
                speed = 0.009 + Math.random() * 0.012;
                movementRadius = 3 + Math.random() * 3;
                jumpHeight = 0.1;
                break;
              case 'bear': // 棕熊 - 慢速，小范围移动
                speed = 0.007 + Math.random() * 0.01;
                movementRadius = 2 + Math.random() * 2;
                jumpHeight = 0.08;
                break;
              case 'bee': // 蜜蜂 - 快速，大范围移动
                speed = 0.03 + Math.random() * 0.03;
                movementRadius = 6 + Math.random() * 4;
                jumpHeight = 0.5;
                break;
              default:
                speed = 0.015 + Math.random() * 0.02;
                movementRadius = 4 + Math.random() * 3;
                jumpHeight = 0.2;
            }
            
            entity.userData.speed = speed;
            entity.userData.angle = Math.random() * Math.PI * 2;
            entity.userData.waveOffset = Math.random() * Math.PI * 2;
            entity.userData.movementRadius = movementRadius;
            entity.userData.jumpHeight = jumpHeight;
            
            // 为兔子初始化方向变化相关属性
            if (randomSpecies.id === 'rabbit') {
              entity.userData.directionChangeTimer = 0;
              entity.userData.targetAngle = entity.userData.angle;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating ecosystem:', error);
    }
  };

  // 更新预览 - 使用精致模型，直接显示在大陆中心
  const updatePreview = async (type: string) => {
    if (!sceneRef.current) return;

    try {
      const THREE = await import('three');

      // 移除场景中所有名为'previewMesh'的对象，确保彻底清理
      sceneRef.current.traverse((object: any) => {
        if (object.name === 'previewMesh') {
          if (object.parent) {
            object.parent.remove(object);
          }
        }
      });

      // 获取番茄模型，检查是否处于专注模式
      const tomatoMesh = sceneRef.current.getObjectByName('tomatoMesh');
      const isFocusMode = tomatoMesh && typeof tomatoMesh.visible !== 'undefined' && tomatoMesh.visible;

      let newPreviewMesh: any;

      // 创建新的预览模型
      // 植物类型列表
      const plantTypes = ['pine', 'oak', 'cherry', 'willow', 'bamboo', 'palm', 'cactus', 'mushroom', 'sunflower', 'birch'];
      // 动物类型列表
      const animalTypes = ['rabbit', 'fox', 'panda', 'pig', 'chick', 'penguin', 'frog', 'sheep', 'bear', 'bee'];

      if (plantTypes.includes(type)) {
        newPreviewMesh = createPlant(type, THREE);
      } else if (animalTypes.includes(type)) {
        newPreviewMesh = createAnimal(type, THREE);
      } else {
        newPreviewMesh = createPlant('pine', THREE);
      }

      // 设置模型名称，方便后续查找和移除
      newPreviewMesh.name = 'previewMesh';

      if (isFocusMode) {
        // 专注模式：将模型作为番茄模型的子元素
        if (tomatoMesh) {
          // 清空番茄模型的所有子元素
          while (tomatoMesh.children.length > 0) {
            tomatoMesh.remove(tomatoMesh.children[0]);
          }

          newPreviewMesh.position.set(0, 0, 0);
          newPreviewMesh.scale.set(0.5, 0.5, 0.5);
          tomatoMesh.add(newPreviewMesh);
        }
      } else {
        // 非专注模式：直接显示在大陆中心，增加动画效果，确保底部与地面贴合
        newPreviewMesh.position.set(0, 2.5, 0);
        newPreviewMesh.scale.set(0, 0, 0); // 初始缩放为0
        newPreviewMesh.castShadow = true;
        newPreviewMesh.receiveShadow = true;
        newPreviewMesh.renderOrder = 1000;
        sceneRef.current.add(newPreviewMesh);

        // 添加缩放动画，让预览模型更吸引注意力
        let scale = 0;
        const animateScale = () => {
          scale += 0.05;
          if (scale <= 2.5) {
            newPreviewMesh.scale.set(scale, scale, scale);
            requestAnimationFrame(animateScale);
          } else {
            // 最终保持在合适大小
            newPreviewMesh.scale.set(2.5, 2.5, 2.5);
          }
        };
        animateScale();
      }

      previewMeshRef.current = newPreviewMesh;
    } catch (error) {
      console.error('Error updating preview:', error);
    }
  };

  // 动画循环
  const animate = () => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    // 更新动物动画
    entitiesRef.current.forEach(entity => {
      if (entity.userData && entity.userData.isAnimal) {
        const animal = entity;
        const originalPos = animal.userData.originalPosition;
        const speed = animal.userData.speed;

        // 兔子特殊处理 - 更自然的跳跃轨迹
        if (animal.userData.speciesId === 'rabbit' || animal.userData.speciesId === undefined) {
          // 为所有动物添加物种ID标识
          if (!animal.userData.speciesId) {
            // 从模型类型推断物种ID
            const modelType = animal.name ? animal.name.toLowerCase() : '';
            animal.userData.speciesId = modelType.includes('rabbit') ? 'rabbit' : 
                                     modelType.includes('fox') ? 'fox' : 
                                     modelType.includes('panda') ? 'panda' : 
                                     modelType.includes('pig') ? 'pig' : 
                                     modelType.includes('chick') ? 'chick' : 
                                     modelType.includes('penguin') ? 'penguin' : 
                                     modelType.includes('frog') ? 'frog' : 
                                     modelType.includes('sheep') ? 'sheep' : 
                                     modelType.includes('bear') ? 'bear' : 
                                     modelType.includes('bee') ? 'bee' : 'unknown';
          }

          // 更新角度
          animal.userData.angle += speed;

          // 计算新位置 - 围绕原始位置移动，使用动物特定的移动范围
          const movementRadius = animal.userData.movementRadius || 5; // 使用动物特定的移动范围

          // 兔子采用更自然的随机游走，而不是完美的圆形轨迹
          if (animal.userData.speciesId === 'rabbit') {
            // 为兔子添加随机方向变化
            if (!animal.userData.directionChangeTimer) {
              animal.userData.directionChangeTimer = 0;
              animal.userData.targetAngle = animal.userData.angle;
            }
            
            // 定期改变方向
            animal.userData.directionChangeTimer += speed;
            if (animal.userData.directionChangeTimer > 2) {
              animal.userData.directionChangeTimer = 0;
              // 随机改变方向，范围在当前角度的±30度内
              animal.userData.targetAngle = animal.userData.angle + (Math.random() - 0.5) * Math.PI / 3;
            }
            
            // 平滑过渡到目标角度
            const angleDiff = animal.userData.targetAngle - animal.userData.angle;
            animal.userData.angle += angleDiff * 0.05;

            // 计算新位置，使用更复杂的轨迹
            const x = originalPos.x + Math.cos(animal.userData.angle) * movementRadius * Math.sin(Date.now() * 0.0005);
            const z = originalPos.z + Math.sin(animal.userData.angle) * movementRadius * Math.sin(Date.now() * 0.0003);
            
            // 垂直移动（跳跃效果），兔子的跳跃更有节奏
            const baseY = Math.max(2.5, originalPos.y); // 确保基础位置与地面贴合
            const jumpHeight = animal.userData.jumpHeight || 0.2; // 兔子的跳跃高度
            // 使用更自然的跳跃曲线，先快后慢
            const jumpPhase = (Date.now() * 0.001 + animal.userData.waveOffset) % (Math.PI * 2);
            const y = baseY + Math.sin(jumpPhase) * jumpHeight;
            
            // 更新位置
            animal.position.set(x, y, z);
            
            // 旋转动物使其面向移动方向
            animal.rotation.y = animal.userData.angle + Math.PI / 2;
          } else {
            // 其他动物保持原有运动逻辑，但优化参数
            const x = originalPos.x + Math.cos(animal.userData.angle) * movementRadius;
            const z = originalPos.z + Math.sin(animal.userData.angle) * movementRadius;
            
            // 垂直移动（跳跃效果）
            const baseY = Math.max(2.5, originalPos.y);
            const jumpHeight = animal.userData.jumpHeight || 0.3;
            const y = baseY + Math.sin(Date.now() * 0.001 + animal.userData.waveOffset) * jumpHeight;
            
            // 更新位置
            animal.position.set(x, y, z);
            
            // 旋转动物使其面向移动方向
            animal.rotation.y = animal.userData.angle + Math.PI / 2;
          }
        } else {
          // 旧的运动逻辑，为了兼容
          animal.userData.angle += speed;
          
          const movementRadius = animal.userData.movementRadius || 5;
          const x = originalPos.x + Math.cos(animal.userData.angle) * movementRadius;
          const z = originalPos.z + Math.sin(animal.userData.angle) * movementRadius;
          
          const baseY = Math.max(2.5, originalPos.y);
          const jumpHeight = animal.userData.jumpHeight || 0.3;
          const y = baseY + Math.sin(Date.now() * 0.001 + animal.userData.waveOffset) * jumpHeight;
          
          animal.position.set(x, y, z);
          animal.rotation.y = animal.userData.angle + Math.PI / 2;
        }
      }
    });

    // 更新控制器
    if (controlsRef.current) {
      controlsRef.current.update();
    }

    // 渲染场景
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }

    // 请求下一帧 - 检查组件是否仍然挂载
    if (containerRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  // 创建植物
  const createPlant = (type: string, THREE: any) => {
    const group = new THREE.Group();
    
    if (type === 'pine') {
      // 松树：使用更自然的树干材质
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x5c4033, // 深棕色
        roughness: 0.9,
        metalness: 0.1
      });
      
      // 树干
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 1.2, 12), trunkMaterial);
      trunk.position.y = 0.6; group.add(trunk);
      
      // 使用更自然的针叶绿色
      const needleMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d6a4f,
        roughness: 0.8,
        metalness: 0.1
      });
      
      // 分层的树冠，每层使用不同的锥体大小
      for(let i = 0; i < 4; i++) {
        const size = 1.5 - i * 0.3;
        const height = 1.8 + i * 0.8;
        
        // 使用圆锥体模拟松树层次
        const cone = new THREE.Mesh(new THREE.ConeGeometry(size, 1.8, 8), needleMaterial);
        cone.position.y = height;
        cone.castShadow = true;
        cone.receiveShadow = true;
        group.add(cone);
        
        // 添加细节：树枝纹理
        if (i > 0) { // 第一层不需要额外细节
          for (let j = 0; j < 6; j++) {
            const branchAngle = (j / 6) * Math.PI * 2;
            const branchLength = size * 0.6;
            
            const smallBranch = new THREE.Mesh(
              new THREE.CylinderGeometry(0.05, 0.08, branchLength, 6),
              needleMaterial
            );
            smallBranch.position.set(
              Math.cos(branchAngle) * size * 0.7,
              height - 0.2,
              Math.sin(branchAngle) * size * 0.7
            );
            smallBranch.rotation.z = branchAngle;
            smallBranch.rotation.x = Math.PI / 2;
            smallBranch.castShadow = true;
            smallBranch.receiveShadow = true;
            group.add(smallBranch);
          }
        }
      }
      
      // 添加松果
      const pineconeMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const pinecone = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 8), pineconeMaterial);
      pinecone.position.set(0, 1.2, 0);
      pinecone.rotation.x = Math.PI;
      group.add(pinecone);
    } else if (type === 'oak') {
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x5c4033,
        roughness: 0.9,
        metalness: 0.1
      });
      
      // 橡树树干
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 1.5, 12), trunkMaterial);
      trunk.position.y = 0.75; group.add(trunk);
      
      // 橡树叶子颜色
      const leafMaterial = new THREE.MeshStandardMaterial({
        color: 0x4ade80,
        roughness: 0.7,
        metalness: 0.2
      });
      
      // 使用球体模拟茂密的树冠
      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 16), leafMaterial);
      crown.position.y = 2.5;
      crown.castShadow = true;
      crown.receiveShadow = true;
      group.add(crown);
      
      // 添加树枝细节
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const branchLength = 1.2;
        
        const branch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.12, branchLength, 8),
          trunkMaterial
        );
        branch.position.set(0, 2.0, 0);
        branch.rotation.z = angle;
        branch.rotation.x = Math.PI / 6;
        branch.translateX(Math.cos(angle) * 0.5);
        branch.translateZ(Math.sin(angle) * 0.5);
        branch.castShadow = true;
        branch.receiveShadow = true;
        group.add(branch);
      }
    } else if (type === 'cherry') {
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x5c4033,
        roughness: 0.9,
        metalness: 0.1
      });
      
      // 樱花树干
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 1.5, 12), trunkMaterial);
      trunk.position.y = 0.75; group.add(trunk);
      
      // 樱花叶子颜色
      const leafMaterial = new THREE.MeshStandardMaterial({
        color: 0xfbcfe8,
        roughness: 0.7,
        metalness: 0.2
      });
      
      // 使用球体模拟茂密的树冠
      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 16), leafMaterial);
      crown.position.y = 2.5;
      crown.castShadow = true;
      crown.receiveShadow = true;
      group.add(crown);
      
      // 添加树枝细节
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const branchLength = 1.2;
        
        const branch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.12, branchLength, 8),
          trunkMaterial
        );
        branch.position.set(0, 2.0, 0);
        branch.rotation.z = angle;
        branch.rotation.x = Math.PI / 6;
        branch.translateX(Math.cos(angle) * 0.5);
        branch.translateZ(Math.sin(angle) * 0.5);
        branch.castShadow = true;
        branch.receiveShadow = true;
        group.add(branch);
      }
    } else if (type === 'willow') {
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9,
        metalness: 0.1
      });
      
      // 垂柳主干
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 2, 12), trunkMaterial);
      trunk.position.y = 1; group.add(trunk);
      
      const leafMaterial = new THREE.MeshStandardMaterial({
        color: 0x86efac,
        roughness: 0.7,
        metalness: 0.2
      });
      
      // 主冠
      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 12), leafMaterial);
      crown.position.y = 2.5;
      crown.castShadow = true;
      crown.receiveShadow = true;
      group.add(crown);
      
      // 添加垂柳特有的细长叶子
      for(let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 1.2 + Math.random() * 0.3;
        
        const leaf = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6),
          leafMaterial
        );
        
        leaf.position.set(
          Math.cos(angle) * radius,
          2.5,
          Math.sin(angle) * radius
        );
        
        // 让叶子向下垂
        leaf.rotation.x = Math.PI / 3 + Math.random() * 0.3;
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        group.add(leaf);
        
        // 为每片叶子添加更多小枝条
        for (let j = 0; j < 3; j++) {
          const smallLeaf = new THREE.Mesh(
            new THREE.CylinderGeometry(0.01, 0.01, 0.4, 6),
            leafMaterial
          );
          smallLeaf.position.set(0, -0.4, 0);
          smallLeaf.rotation.x = Math.PI / 6;
          smallLeaf.castShadow = true;
          smallLeaf.receiveShadow = true;
          leaf.add(smallLeaf);
        }
      }
    } else if (type === 'bamboo') {
      const bambooMaterial = new THREE.MeshStandardMaterial({
        color: 0x84cc16,
        roughness: 0.6,
        metalness: 0.3
      });
      
      // 竹节 - 使用多个段落模拟
      const segmentCount = 5;
      const segmentHeight = 0.8;
      
      for(let i = 0; i < segmentCount; i++) {
        const stalk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, segmentHeight, 12),
          bambooMaterial
        );
        
        stalk.position.y = i * segmentHeight + segmentHeight / 2;
        
        // 添加竹节细节
        const jointGeometry = new THREE.RingGeometry(0.12, 0.14, 12);
        const jointMaterial = new THREE.MeshStandardMaterial({
          color: 0x22c55e,
          roughness: 0.7,
          metalness: 0.2
        });
        
        const joint = new THREE.Mesh(jointGeometry, jointMaterial);
        joint.position.y = i * segmentHeight;
        joint.rotation.x = Math.PI / 2;
        stalk.add(joint);
        
        stalk.castShadow = true;
        stalk.receiveShadow = true;
        group.add(stalk);
      }
      
      // 添加竹叶
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        
        const leaf = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 1.2, 0.3),
          new THREE.MeshStandardMaterial({ color: 0x16a34a })
        );
        
        leaf.position.set(0.2, (segmentCount - 1) * segmentHeight, 0);
        leaf.rotation.y = angle;
        leaf.rotation.z = Math.PI / 6;
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        group.add(leaf);
      }
    } else if (type === 'palm') {
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9,
        metalness: 0.1
      });
      
      // 椰子树干，添加纹理
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 3.5, 12), trunkMaterial);
      trunk.position.y = 1.75;
      trunk.rotation.z = 0.1;
      
      // 添加树皮纹理效果
      for (let i = 0; i < 10; i++) {
        const bark = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 3.4, 0.1),
          new THREE.MeshStandardMaterial({ color: 0x5D4037 })
        );
        bark.position.y = 1.75;
        bark.rotation.y = (i / 10) * Math.PI * 2;
        trunk.add(bark);
      }
      
      group.add(trunk);
      
      const leafMaterial = new THREE.MeshStandardMaterial({
        color: 0x15803d,
        roughness: 0.7,
        metalness: 0.2,
        side: THREE.DoubleSide
      });
      
      // 椰子树叶
      for(let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        
        const leaf = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 2.0, 0.08),
          leafMaterial
        );
        
        leaf.position.set(0.2, 3.5, 0);
        leaf.rotation.z = Math.PI/4;
        leaf.rotation.y = angle;
        leaf.rotation.x = 0.3;
        
        // 让叶子向外弯曲
        leaf.rotation.x += Math.sin(angle) * 0.2;
        
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        group.add(leaf);
      }
      
      // 添加椰子
      for (let i = 0; i < 3; i++) {
        const coconut = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0x795548 })
        );
        
        const angle = (i / 3) * Math.PI * 2;
        coconut.position.set(
          Math.cos(angle) * 0.4,
          3.2,
          Math.sin(angle) * 0.4
        );
        
        coconut.castShadow = true;
        coconut.receiveShadow = true;
        group.add(coconut);
      }
    } else if (type === 'cactus') {
      const cactusMaterial = new THREE.MeshStandardMaterial({
        color: 0x16a34a,
        roughness: 0.7,
        metalness: 0.2
      });
      
      // 仙人掌主体
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 2, 16), cactusMaterial);
      body.position.y = 1;
      body.castShadow = true;
      body.receiveShadow = true;
      
      // 添加仙人掌的棱角效果
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        
        const ridge = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 1.9, 0.3),
          new THREE.MeshStandardMaterial({ color: 0x228B22 })
        );
        
        ridge.position.set(
          Math.cos(angle) * 0.4,
          1,
          Math.sin(angle) * 0.4
        );
        
        ridge.rotation.y = angle;
        body.add(ridge);
      }
      
      group.add(body);
      
      // 添加花朵
      const flowerMaterial = new THREE.MeshStandardMaterial({ color: 0xff4757 });
      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), flowerMaterial);
      flower.position.set(0, 2.2, 0.4);
      flower.castShadow = true;
      flower.receiveShadow = true;
      group.add(flower);
      
      // 添加臂膀
      for(let i = 0; i < 4; i++) {
        const armAngle = (i / 4) * Math.PI * 2;
        const armHeight = 1.2 + i * 0.3;
        
        const arm = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.2, 1.2, 12),
          cactusMaterial
        );
        
        arm.position.set(
          Math.cos(armAngle) * 0.5,
          armHeight,
          Math.sin(armAngle) * 0.5
        );
        
        arm.rotation.z = Math.PI/4;
        arm.castShadow = true;
        arm.receiveShadow = true;
        group.add(arm);
        
        // 臂膀上的花朵
        if (i % 2 === 0) { // 每隔一个臂膀添加花朵
          const armFlower = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xffd700 })
          );
          armFlower.position.set(0, 0.7, 0.3);
          arm.add(armFlower);
        }
      }
    } else if (type === 'mushroom') {
      // 蘑菇茎
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.3, 1.2, 12),
        new THREE.MeshStandardMaterial({ color: 0xffedd5 })
      );
      stem.position.y = 0.6;
      stem.castShadow = true;
      stem.receiveShadow = true;
      group.add(stem);
      
      // 蘑菇帽
      const cap = new THREE.Mesh(
        new THREE.ConeGeometry(1.3, 1.2, 16),
        new THREE.MeshStandardMaterial({ color: 0xff4757 })
      );
      cap.position.y = 1.3;
      cap.rotation.x = Math.PI; // 翻转锥体
      cap.castShadow = true;
      cap.receiveShadow = true;
      group.add(cap);
      
      // 添加蘑菇帽上的斑点
      for(let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 0.8 + Math.random() * 0.2;
        
        const spot = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        
        spot.position.set(
          Math.cos(angle) * radius,
          1.32,
          Math.sin(angle) * radius
        );
        
        spot.castShadow = true;
        spot.receiveShadow = true;
        group.add(spot);
      }
      
      // 添加蘑菇的纹理
      const gillGeometry = new THREE.RingGeometry(0.3, 1.25, 16);
      const gillMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6b6b,
        side: THREE.DoubleSide
      });
      
      const gills = new THREE.Mesh(gillGeometry, gillMaterial);
      gills.position.y = 1.29;
      gills.rotation.x = Math.PI / 2;
      group.add(gills);
    } else if (type === 'sunflower') {
      // 向日葵茎
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 2.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x4ade80 })
      );
      stem.position.y = 1.4;
      stem.castShadow = true;
      stem.receiveShadow = true;
      group.add(stem);
      
      // 花盘
      const head = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0xfacc15 })
      );
      head.position.set(0, 2.85, 0);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      // 花心
      const center = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.12, 16),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
      );
      center.position.set(0, 2.86, 0);
      center.castShadow = true;
      center.receiveShadow = true;
      group.add(center);
      
      // 添加种子纹理
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
          if (Math.sqrt(i*i + j*j) < 15) { // 圆形图案
            const seed = new THREE.Mesh(
              new THREE.SphereGeometry(0.02, 6, 6),
              new THREE.MeshStandardMaterial({ color: 0x5d4037 })
            );
            
            const angle = Math.sqrt(i*i + j*j) * 0.5;
            const dist = Math.sqrt(i*i + j*j) * 0.03;
            
            seed.position.set(
              Math.cos(angle) * dist,
              2.861,
              Math.sin(angle) * dist
            );
            
            group.add(seed);
          }
        }
      }
      
      // 添加花瓣
      const petalMaterial = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.6,
        metalness: 0.3
      });
      
      for(let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        
        const petal = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, 0.05, 0.6),
          petalMaterial
        );
        
        petal.position.set(
          Math.cos(angle) * 0.75,
          2.85,
          Math.sin(angle) * 0.75
        );
        
        petal.rotation.y = angle;
        petal.rotation.x = Math.PI / 8;
        
        petal.castShadow = true;
        petal.receiveShadow = true;
        group.add(petal);
      }
      
      // 添加叶子
      const leaf = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.05, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x22c55e })
      );
      leaf.position.set(0, 1.5, 0);
      leaf.rotation.z = Math.PI / 6;
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      group.add(leaf);
    } else if (type === 'birch') {
      // 白桦树干 - 添加白色斑块效果
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.25, 3.2, 12),
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9 })
      );
      trunk.position.y = 1.6;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      
      // 添加黑色斑块
      for(let i = 0; i < 6; i++) {
        const patch = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.15, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x1e293b })
        );
        
        patch.position.set(
          0,
          0.6 + i * 0.4,
          0.23
        );
        
        patch.rotation.y = Math.random() * Math.PI;
        trunk.add(patch);
      }
      
      group.add(trunk);
      
      // 树冠
      const crownMaterial = new THREE.MeshStandardMaterial({
        color: 0xfcd34d,
        roughness: 0.6,
        metalness: 0.3
      });
      
      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 16, 16),
        crownMaterial
      );
      crown.position.y = 3.3;
      crown.castShadow = true;
      crown.receiveShadow = true;
      group.add(crown);
      
      // 添加小枝条
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const height = 2.5 + Math.random() * 0.5;
        
        const branch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.08, 0.6, 8),
          new THREE.MeshStandardMaterial({ color: 0xf1f5f9 })
        );
        
        branch.position.set(
          Math.cos(angle) * 0.8,
          height,
          Math.sin(angle) * 0.8
        );
        
        branch.rotation.z = angle;
        branch.rotation.x = Math.PI / 5;
        branch.castShadow = true;
        branch.receiveShadow = true;
        group.add(branch);
      }
    } else {
      // 默认创建松树
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x5c4033, // 深棕色
        roughness: 0.9,
        metalness: 0.1
      });
      
      // 树干
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 1.2, 12), trunkMaterial);
      trunk.position.y = 0.6; group.add(trunk);
      
      // 使用更自然的针叶绿色
      const needleMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d6a4f,
        roughness: 0.8,
        metalness: 0.1
      });
      
      // 分层的树冠，每层使用不同的锥体大小
      for(let i = 0; i < 4; i++) {
        const size = 1.5 - i * 0.3;
        const height = 1.8 + i * 0.8;
        
        // 使用圆锥体模拟松树层次
        const cone = new THREE.Mesh(new THREE.ConeGeometry(size, 1.8, 8), needleMaterial);
        cone.position.y = height;
        cone.castShadow = true;
        cone.receiveShadow = true;
        group.add(cone);
      }
      
      // 添加松果
      const pineconeMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const pinecone = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 8), pineconeMaterial);
      pinecone.position.set(0, 1.2, 0);
      pinecone.rotation.x = Math.PI;
      group.add(pinecone);
    }
    return group;
  };

  // 创建动物
  const createAnimal = (type: string, THREE: any) => {
    const group = new THREE.Group();
    
    if (type === 'fox') {
      // 赤狐 - 使用更自然的颜色和细节
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xf97316, // 橙红色
        roughness: 0.7,
        metalness: 0.2
      });
      
      // 身体
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.4, 4, 8), bodyMaterial);
      body.position.set(0, 0.4, 0);
      body.rotation.z = 0.2;
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16),
        bodyMaterial
      );
      head.position.set(0, 0.7, 0.4);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      // 耳朵
      const earMaterial = new THREE.MeshStandardMaterial({
        color: 0x1f2937, // 黑色
        roughness: 0.8,
        metalness: 0.1
      });
      
      const earGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
      const ear1 = new THREE.Mesh(earGeometry, earMaterial);
      ear1.position.set(0.15, 0.95, 0.3);
      ear1.rotation.z = -0.3;
      ear1.castShadow = true;
      ear1.receiveShadow = true;
      group.add(ear1);
      
      const ear2 = new THREE.Mesh(earGeometry, earMaterial);
      ear2.position.set(-0.15, 0.95, 0.3);
      ear2.rotation.z = 0.3;
      ear2.castShadow = true;
      ear2.receiveShadow = true;
      group.add(ear2);
      
      // 眼睛
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e3a8a, // 深蓝色
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0x1e3a8a,
        emissiveIntensity: 0.2
      });
      
      const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
      const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eye1.position.set(0.1, 0.75, 0.35);
      group.add(eye1);
      
      const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eye2.position.set(-0.1, 0.75, 0.35);
      group.add(eye2);
      
      // 鼻子
      const nose = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x000000 })
      );
      nose.position.set(0, 0.65, 0.5);
      group.add(nose);
      
      // 尾巴
      const tailMaterial = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        roughness: 0.7,
        metalness: 0.2
      });
      
      const tail = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.8, 8),
        tailMaterial
      );
      tail.position.set(0, 0.5, -0.5);
      tail.rotation.x = Math.PI / 3;
      tail.castShadow = true;
      tail.receiveShadow = true;
      group.add(tail);
      
      // 腿部
      for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.06, 0.3, 8),
          bodyMaterial
        );
        
        const x = i % 2 === 0 ? 0.15 : -0.15;
        const z = i < 2 ? 0.2 : -0.2;
        
        leg.position.set(x, 0.15, z);
        leg.rotation.x = Math.PI / 2;
        leg.castShadow = true;
        leg.receiveShadow = true;
        group.add(leg);
      }
      
    } else if (type === 'rabbit') {
      // 白兔 - 更精细的模型
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff, // 白色
        roughness: 0.8,
        metalness: 0.1
      });
      
      // 身体
      const body = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.3, 2),
        bodyMaterial
      );
      body.position.set(0, 0.35, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        bodyMaterial
      );
      head.position.set(0, 0.6, 0.25);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      // 长耳朵
      const earGeometry = new THREE.CylinderGeometry(0.03, 0.02, 0.4, 8);
      
      const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
      ear1.position.set(0.1, 0.85, 0.2);
      ear1.rotation.z = 0.3;
      ear1.castShadow = true;
      ear1.receiveShadow = true;
      group.add(ear1);
      
      const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
      ear2.position.set(-0.1, 0.85, 0.2);
      ear2.rotation.z = -0.3;
      ear2.castShadow = true;
      ear2.receiveShadow = true;
      group.add(ear2);
      
      // 眼睛
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000, // 红色眼睛
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0xff0000,
        emissiveIntensity: 0.3
      });
      
      const eyeGeometry = new THREE.SphereGeometry(0.04, 16, 16);
      const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eye1.position.set(0.08, 0.65, 0.3);
      group.add(eye1);
      
      const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eye2.position.set(-0.08, 0.65, 0.3);
      group.add(eye2);
      
      // 鼻子
      const nose = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x000000 })
      );
      nose.position.set(0, 0.6, 0.35);
      group.add(nose);
      
      // 嘴巴
      const mouth = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x000000 })
      );
      mouth.position.set(0, 0.55, 0.35);
      group.add(mouth);
      
      // 后腿
      for (let i = 0; i < 2; i++) {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.05, 0.4, 8),
          bodyMaterial
        );
        
        const x = i === 0 ? 0.12 : -0.12;
        leg.position.set(x, 0.2, -0.15);
        leg.rotation.x = Math.PI / 3;
        leg.castShadow = true;
        leg.receiveShadow = true;
        group.add(leg);
      }
      
    } else if (type === 'panda') {
      // 熊猫 - 黑白分明
      const whiteMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.8,
        metalness: 0.1
      });
      
      const blackMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.9,
        metalness: 0.1
      });
      
      // 身体
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 16),
        whiteMaterial
      );
      body.position.set(0, 0.5, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 16, 16),
        whiteMaterial
      );
      head.position.set(0, 0.8, 0.2);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      // 黑色耳朵
      const earGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      
      const ear1 = new THREE.Mesh(earGeometry, blackMaterial);
      ear1.position.set(0.25, 1.0, 0.15);
      ear1.castShadow = true;
      ear1.receiveShadow = true;
      group.add(ear1);
      
      const ear2 = new THREE.Mesh(earGeometry, blackMaterial);
      ear2.position.set(-0.25, 1.0, 0.15);
      ear2.castShadow = true;
      ear2.receiveShadow = true;
      group.add(ear2);
      
      // 黑色眼圈
      const eyePatch1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        blackMaterial
      );
      eyePatch1.position.set(0.18, 0.8, 0.3);
      eyePatch1.castShadow = true;
      eyePatch1.receiveShadow = true;
      group.add(eyePatch1);
      
      const eyePatch2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        blackMaterial
      );
      eyePatch2.position.set(-0.18, 0.8, 0.3);
      eyePatch2.castShadow = true;
      eyePatch2.receiveShadow = true;
      group.add(eyePatch2);
      
      // 眼球
      const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
      const eye1 = new THREE.Mesh(eyeGeometry, blackMaterial);
      eye1.position.set(0.18, 0.82, 0.35);
      group.add(eye1);
      
      const eye2 = new THREE.Mesh(eyeGeometry, blackMaterial);
      eye2.position.set(-0.18, 0.82, 0.35);
      group.add(eye2);
      
      // 鼻子
      const nose = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 16, 16),
        blackMaterial
      );
      nose.position.set(0, 0.72, 0.4);
      group.add(nose);
      
      // 嘴巴
      const mouth = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 16, 16),
        blackMaterial
      );
      mouth.position.set(0, 0.68, 0.4);
      group.add(mouth);
      
      // 黑色四肢
      for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 16, 16),
          blackMaterial
        );
        
        const x = i % 2 === 0 ? 0.25 : -0.25;
        const z = i < 2 ? 0.2 : -0.2;
        
        leg.position.set(x, 0.25, z);
        leg.castShadow = true;
        leg.receiveShadow = true;
        group.add(leg);
      }
      
    } else if (type === 'pig') {
      // 小猪 - 粉嫩颜色
      const pigMaterial = new THREE.MeshStandardMaterial({
        color: 0xfbcfe8, // 粉色
        roughness: 0.7,
        metalness: 0.2
      });
      
      // 身体
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.3, 0.5, 6, 12),
        pigMaterial
      );
      body.position.set(0, 0.4, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16),
        pigMaterial
      );
      head.position.set(0, 0.65, 0.35);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      // 耳朵
      const earGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      
      const ear1 = new THREE.Mesh(earGeometry, pigMaterial);
      ear1.position.set(0.18, 0.85, 0.2);
      ear1.scale.set(1, 0.6, 1);
      ear1.castShadow = true;
      ear1.receiveShadow = true;
      group.add(ear1);
      
      const ear2 = new THREE.Mesh(earGeometry, pigMaterial);
      ear2.position.set(-0.18, 0.85, 0.2);
      ear2.scale.set(1, 0.6, 1);
      ear2.castShadow = true;
      ear2.receiveShadow = true;
      group.add(ear2);
      
      // 鼻子
      const nose = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xf9a8d4 }) // 稍深粉色
      );
      nose.position.set(0, 0.6, 0.5);
      nose.castShadow = true;
      nose.receiveShadow = true;
      group.add(nose);
      
      // 鼻孔
      const nostrilGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const nostril1 = new THREE.Mesh(nostrilGeometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
      nostril1.position.set(0.03, 0.6, 0.58);
      group.add(nostril1);
      
      const nostril2 = new THREE.Mesh(nostrilGeometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
      nostril2.position.set(-0.03, 0.6, 0.58);
      group.add(nostril2);
      
      // 眼睛
      const eyeGeometry = new THREE.SphereGeometry(0.04, 16, 16);
      const eye1 = new THREE.Mesh(eyeGeometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
      eye1.position.set(0.1, 0.7, 0.4);
      group.add(eye1);
      
      const eye2 = new THREE.Mesh(eyeGeometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
      eye2.position.set(-0.1, 0.7, 0.4);
      group.add(eye2);
      
      // 腿部
      for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.06, 0.25, 8),
          pigMaterial
        );
        
        const x = i % 2 === 0 ? 0.2 : -0.2;
        const z = i < 2 ? 0.2 : -0.2;
        
        leg.position.set(x, 0.15, z);
        leg.rotation.x = Math.PI / 2;
        leg.castShadow = true;
        leg.receiveShadow = true;
        group.add(leg);
      }
      
    } else if (type === 'penguin') {
      // 企鹅 - 黑白分明，可爱造型
      const blackMaterial = new THREE.MeshStandardMaterial({
        color: 0x1f2937, // 深灰色近黑
        roughness: 0.8,
        metalness: 0.1
      });
      
      const whiteMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.9,
        metalness: 0.05
      });
      
      // 身体
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        blackMaterial
      );
      body.position.set(0, 0.6, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 腹部白色
      const belly = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16),
        whiteMaterial
      );
      belly.position.set(0, 0.55, 0.1);
      belly.castShadow = true;
      belly.receiveShadow = true;
      group.add(belly);
      
      // 头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        blackMaterial
      );
      head.position.set(0, 0.95, 0.1);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      // 嘴巴/喙
      const beak = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.2, 8),
        new THREE.MeshStandardMaterial({ color: 0xfacc15 }) // 橙色
      );
      beak.position.set(0, 0.9, 0.25);
      beak.rotation.x = Math.PI / 2;
      beak.castShadow = true;
      beak.receiveShadow = true;
      group.add(beak);
      
      // 眼睛
      const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
      
      const whiteEye = new THREE.Mesh(eyeGeometry, whiteMaterial);
      whiteEye.position.set(0.08, 1.0, 0.15);
      group.add(whiteEye);
      
      const whiteEye2 = new THREE.Mesh(eyeGeometry, whiteMaterial);
      whiteEye2.position.set(-0.08, 1.0, 0.15);
      group.add(whiteEye2);
      
      // 瞳孔
      const pupilGeometry = new THREE.SphereGeometry(0.02, 16, 16);
      const pupil1 = new THREE.Mesh(pupilGeometry, blackMaterial);
      pupil1.position.set(0.1, 1.0, 0.18);
      group.add(pupil1);
      
      const pupil2 = new THREE.Mesh(pupilGeometry, blackMaterial);
      pupil2.position.set(-0.1, 1.0, 0.18);
      group.add(pupil2);
      
      // 翅膀
      const wing = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.3, 0.4),
        blackMaterial
      );
      wing.position.set(0.25, 0.6, 0);
      wing.castShadow = true;
      wing.receiveShadow = true;
      group.add(wing);
      
      const wing2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.3, 0.4),
        blackMaterial
      );
      wing2.position.set(-0.25, 0.6, 0);
      wing2.castShadow = true;
      wing2.receiveShadow = true;
      group.add(wing2);
      
      // 腿部
      const legMaterial = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
      const legGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.2, 8);
      
      const leg1 = new THREE.Mesh(legGeometry, legMaterial);
      leg1.position.set(0.1, 0.2, 0);
      leg1.rotation.x = Math.PI / 2;
      leg1.castShadow = true;
      leg1.receiveShadow = true;
      group.add(leg1);
      
      const leg2 = new THREE.Mesh(legGeometry, legMaterial);
      leg2.position.set(-0.1, 0.2, 0);
      leg2.rotation.x = Math.PI / 2;
      leg2.castShadow = true;
      leg2.receiveShadow = true;
      group.add(leg2);
      
      // 脚
      const footGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.08);
      const foot1 = new THREE.Mesh(footGeometry, legMaterial);
      foot1.position.set(0.1, 0.08, 0);
      group.add(foot1);
      
      const foot2 = new THREE.Mesh(footGeometry, legMaterial);
      foot2.position.set(-0.1, 0.08, 0);
      group.add(foot2);
      
    } else if (type === 'frog') {
      // 青蛙 - 生动形象
      const greenMaterial = new THREE.MeshStandardMaterial({
        color: 0x4ade80, // 亮绿色
        roughness: 0.7,
        metalness: 0.2
      });
      
      // 身体
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 16, 16),
        greenMaterial
      );
      body.position.set(0, 0.35, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16),
        greenMaterial
      );
      head.position.set(0, 0.55, 0.2);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      // 大眼睛
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0xffffff,
        emissiveIntensity: 0.1
      });
      
      const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      
      const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eye1.position.set(0.15, 0.75, 0.15);
      eye1.castShadow = true;
      eye1.receiveShadow = true;
      group.add(eye1);
      
      const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eye2.position.set(-0.15, 0.75, 0.15);
      eye2.castShadow = true;
      eye2.receiveShadow = true;
      group.add(eye2);
      
      // 瞳孔
      const pupilGeometry = new THREE.SphereGeometry(0.05, 16, 16);
      const pupil1 = new THREE.Mesh(pupilGeometry, new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
      pupil1.position.set(0.17, 0.75, 0.2);
      group.add(pupil1);
      
      const pupil2 = new THREE.Mesh(pupilGeometry, new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
      pupil2.position.set(-0.17, 0.75, 0.2);
      group.add(pupil2);
      
      // 嘴巴
      const mouth = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.05, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
      );
      mouth.position.set(0, 0.45, 0.25);
      mouth.rotation.x = 0.2;
      group.add(mouth);
      
      // 前腿
      for (let i = 0; i < 2; i++) {
        const frontLeg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.05, 0.2, 8),
          greenMaterial
        );
        
        const x = i === 0 ? 0.18 : -0.18;
        frontLeg.position.set(x, 0.2, 0.2);
        frontLeg.rotation.x = Math.PI / 4;
        frontLeg.castShadow = true;
        frontLeg.receiveShadow = true;
        group.add(frontLeg);
      }
      
      // 后腿（蹲着的姿势）
      for (let i = 0; i < 2; i++) {
        const backLeg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.06, 0.3, 8),
          greenMaterial
        );
        
        const x = i === 0 ? 0.2 : -0.2;
        backLeg.position.set(x, 0.15, -0.1);
        backLeg.rotation.x = -Math.PI / 4;
        backLeg.castShadow = true;
        backLeg.receiveShadow = true;
        group.add(backLeg);
      }
      
    } else if (type === 'bee') {
      // 蜜蜂 - 黄黑条纹，带翅膀
      const yellowMaterial = new THREE.MeshStandardMaterial({
        color: 0xfacc15, // 黄色
        roughness: 0.6,
        metalness: 0.3
      });
      
      const blackMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.8,
        metalness: 0.1
      });
      
      // 身体
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.15, 0.4, 8, 16),
        yellowMaterial
      );
      body.position.set(0, 0.5, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 黑色条纹
      for (let i = 0; i < 3; i++) {
        const stripe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.17, 0.17, 0.15, 16),
          blackMaterial
        );
        stripe.position.y = 0.5 + (i - 1) * 0.12;
        stripe.castShadow = true;
        stripe.receiveShadow = true;
        group.add(stripe);
      }
      
      // 头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        yellowMaterial
      );
      head.position.set(0, 0.5, 0.25);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      // 眼睛
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0x1f2937,
        emissiveIntensity: 0.2
      });
      
      const eyeGeometry = new THREE.SphereGeometry(0.04, 16, 16);
      const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eye1.position.set(0.08, 0.55, 0.3);
      group.add(eye1);
      
      const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eye2.position.set(-0.08, 0.55, 0.3);
      group.add(eye2);
      
      // 添加触角
      for (let i = 0; i < 2; i++) {
        const antenna = new THREE.Mesh(
          new THREE.CylinderGeometry(0.01, 0.01, 0.15, 6),
          yellowMaterial
        );
        
        const x = i === 0 ? 0.05 : -0.05;
        antenna.position.set(x, 0.65, 0.3);
        antenna.rotation.x = -Math.PI / 3;
        group.add(antenna);
        
        // 触角末梢
        const antennaTip = new THREE.Mesh(
          new THREE.SphereGeometry(0.02, 8, 8),
          yellowMaterial
        );
        antennaTip.position.set(0, -0.15, 0);
        antenna.add(antennaTip);
      }
      
      // 翅膀
      const wingMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        opacity: 0.7,
        transparent: true,
        roughness: 0.1,
        metalness: 0.9
      });
      
      const wingGeometry = new THREE.PlaneGeometry(0.3, 0.5);
      
      const wing1 = new THREE.Mesh(wingGeometry, wingMaterial);
      wing1.position.set(0.1, 0.7, 0);
      wing1.rotation.x = Math.PI / 6;
      wing1.rotation.z = Math.PI / 12;
      wing1.castShadow = true;
      group.add(wing1);
      
      const wing2 = new THREE.Mesh(wingGeometry, wingMaterial);
      wing2.position.set(-0.1, 0.7, 0);
      wing2.rotation.x = Math.PI / 6;
      wing2.rotation.z = -Math.PI / 12;
      wing2.castShadow = true;
      group.add(wing2);
      
      // 后翅
      const hindWing1 = new THREE.Mesh(wingGeometry, wingMaterial);
      hindWing1.position.set(0.08, 0.65, -0.05);
      hindWing1.rotation.x = Math.PI / 8;
      hindWing1.rotation.z = Math.PI / 8;
      hindWing1.scale.set(0.8, 0.8, 0.8);
      group.add(hindWing1);
      
      const hindWing2 = new THREE.Mesh(wingGeometry, wingMaterial);
      hindWing2.position.set(-0.08, 0.65, -0.05);
      hindWing2.rotation.x = Math.PI / 8;
      hindWing2.rotation.z = -Math.PI / 8;
      hindWing2.scale.set(0.8, 0.8, 0.8);
      group.add(hindWing2);

      }
      return group;
    }

    // 添加主题变化监听，更新场景颜色
    useEffect(() => {
      const updateSceneColors = async () => {
        if (sceneRef.current) {
          try {
            const THREE = await import('three');
            const colors = getThemeColors();
            sceneRef.current.background = new THREE.Color(colors.bgColor);
            sceneRef.current.fog = new THREE.Fog(colors.bgColor, 60, 160);
            
            // 更新地面材质
            if (groundRef.current) {
              const materials = Array.isArray(groundRef.current.material) ? groundRef.current.material : [groundRef.current.material];
              materials.forEach(material => {
                if (material && typeof material === 'object' && material.color) {
                  material.color.set(colors.groundColor);
                  if (material.needsUpdate) material.needsUpdate = true;
                }
              });
            }
          } catch (error) {
            console.error('Error updating scene colors:', error);
          }
        }
      };
      
      updateSceneColors();
    }, [theme, getThemeColors]);

    // 初始化场景
    useEffect(() => {
      let cleanupFunc: (() => void) | null = null;
      
      const initScene = async () => {
        cleanupFunc = await initializeScene();
      };
      
      initScene();
      
      return () => {
        if (cleanupFunc) {
          cleanupFunc();
        }
      };
    }, [initializeScene]);

    // 监听totalPlants变化，更新生态系统
    useEffect(() => {
      const updateEcosystemAsync = async () => {
        if (sceneRef.current) {
          await updateEcosystem(totalPlants);
        }
      };
      updateEcosystemAsync();
    }, [totalPlants, updateEcosystem]);

    // 监听currentSeed变化，更新预览
    useEffect(() => {
      const updatePreviewAsync = async () => {
        await updatePreview(currentSeed);
      };
      updatePreviewAsync();
    }, [currentSeed, updatePreview]);

    // 组件卸载时清理资源
    useEffect(() => {
      return () => {
        // 清理动画帧
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        // 清理场景中的所有对象
        if (sceneRef.current) {
          sceneRef.current.traverse((obj) => {
            if (obj.isMesh) {
              if (obj.geometry) {
                obj.geometry.dispose();
              }
              
              if (obj.material) {
                if (Array.isArray(obj.material)) {
                  obj.material.forEach(material => {
                    if (material.map) material.map.dispose();
                    if (material.lightMap) material.lightMap.dispose();
                    if (material.bumpMap) material.bumpMap.dispose();
                    if (material.normalMap) material.normalMap.dispose();
                    if (material.specularMap) material.specularMap.dispose();
                    if (material.alphaMap) material.alphaMap.dispose();
                    if (material.aoMap) material.aoMap.dispose();
                    if (material.displacementMap) material.displacementMap.dispose();
                    if (material.emissiveMap) material.emissiveMap.dispose();
                    if (material.environmentMap) material.environmentMap.dispose();
                    material.dispose();
                  });
                } else {
                  const material = obj.material;
                  if (material.map) material.map.dispose();
                  if (material.lightMap) material.lightMap.dispose();
                  if (material.bumpMap) material.bumpMap.dispose();
                  if (material.normalMap) material.normalMap.dispose();
                  if (material.specularMap) material.specularMap.dispose();
                  if (material.alphaMap) material.alphaMap.dispose();
                  if (material.aoMap) material.aoMap.dispose();
                  if (material.displacementMap) material.displacementMap.dispose();
                  if (material.emissiveMap) material.emissiveMap.dispose();
                  if (material.environmentMap) material.environmentMap.dispose();
                  material.dispose();
                }
              }
            }
          });
          
          // 清空场景
          while(sceneRef.current.children.length > 0) { 
            sceneRef.current.remove(sceneRef.current.children[0]);
          }
        }
        
        // 清理渲染器
        if (rendererRef.current && rendererRef.current.dispose) {
          rendererRef.current.dispose();
        }
        
        // 清理所有存储的引用
        sceneObjectsRef.current = [];
        entitiesRef.current = [];
      };
    }, []); // 确保清理函数只在组件卸载时运行

    return (
      <div className="relative w-full h-full" ref={containerRef}>
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    );
  }

export default OptimizedImmersivePomodoro3D;