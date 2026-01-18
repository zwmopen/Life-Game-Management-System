import React, { useEffect, useRef, useState } from 'react';
import { getNeomorphicStyles } from '../../utils/styleHelpers';
import { Theme } from '../../types';
import soundManager from '../../utils/soundManager';
import { useGlobalAudio } from '../../components/GlobalAudioManagerOptimized';

interface InternalImmersivePomodoroProps {
  theme: Theme;
  timeLeft: number;
  isActive: boolean;
  duration: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onUpdateTimeLeft: (seconds: number) => void;
  onUpdateIsActive: (active: boolean) => void;
  onExitImmersive: () => void;
  totalPlants: number;
  todayPlants: number;
  isMuted: boolean;
  currentSoundId: string;
  onUpdateTotalPlants?: (count: number) => void;
  onUpdateTodayPlants?: (count: number) => void;
}

const InternalImmersivePomodoro: React.FC<InternalImmersivePomodoroProps> = ({
  theme,
  onExitImmersive,
  totalPlants: initialTotalPlants,
  todayPlants: initialTodayPlants,
  timeLeft,
  isActive,
  duration,
  onUpdateTimeLeft,
  onUpdateIsActive,
  isMuted,
  currentSoundId,
  onUpdateTotalPlants,
  onUpdateTodayPlants
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
  const [currentSeed, setCurrentSeed] = useState('pine');
  const [isFocusing, setIsFocusing] = useState(isActive);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(timeLeft);
  const [currentDuration, setCurrentDuration] = useState(duration * 60);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [isEditingToday, setIsEditingToday] = useState(false);
  const [isEditingPreset, setIsEditingPreset] = useState(false);
  const [editingValue, setEditingValue] = useState('');
  const [editingPresetId, setEditingPresetId] = useState<number | null>(null);
  // 从本地存储加载总数和今日数量
  const [totalPlants, setTotalPlants] = useState(() => {
    const savedTotal = localStorage.getItem('immersionPomodoro_totalPlants');
    return savedTotal ? parseInt(savedTotal) : (initialTotalPlants || 20);
  });
  const [todayPlants, setTodayPlants] = useState(() => {
    const savedToday = localStorage.getItem('immersionPomodoro_todayPlants');
    return savedToday ? parseInt(savedToday) : (initialTodayPlants || 0);
  });
  const [localCurrentSoundId, setLocalCurrentSoundId] = useState(currentSoundId); // 本地音效ID状态
  const totalPlantsRef = useRef<HTMLDivElement>(null);
  const todayPlantsRef = useRef<HTMLDivElement>(null);
  
  // 物种数据
  const SPECIES = {
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

  // 导入音频管理器和统计工具
  const [audioManager, setAudioManager] = useState<any>(null);
  const [audioStatistics, setAudioStatistics] = useState<any>(null);
  const [allSounds, setAllSounds] = useState<any[]>([]);
  const [isSoundListLoaded, setIsSoundListLoaded] = useState(false);
  const [initialSoundsLoaded, setInitialSoundsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // 搜索关键词状态

  // 图标映射函数
  const getIconComponentByName = (name: string) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('forest') || lowerName.includes('woods') || lowerName.includes('trees')) {
      return '🌲';
    } else if (lowerName.includes('rain') || lowerName.includes('storm') || lowerName.includes('drizzle')) {
      return '🌧️';
    } else if (lowerName.includes('ocean') || lowerName.includes('sea') || lowerName.includes('waves')) {
      return '🌊';
    } else if (lowerName.includes('night') || lowerName.includes('cricket') || lowerName.includes('insects')) {
      return '🌙';
    } else if (lowerName.includes('cafe') || lowerName.includes('coffee')) {
      return '☕';
    } else if (lowerName.includes('fire') || lowerName.includes('fireplace')) {
      return '🔥';
    } else if (lowerName.includes('white') && lowerName.includes('noise')) {
      return '🌬️';
    } else if (lowerName.includes('pink') && lowerName.includes('noise')) {
      return '🎨';
    } else if (lowerName.includes('brown') && lowerName.includes('noise')) {
      return '🌰';
    } else if (lowerName.includes('alpha')) {
      return '🧠';
    } else if (lowerName.includes('beta')) {
      return '⚡';
    } else if (lowerName.includes('theta')) {
      return '🧘';
    } else if (lowerName.includes('meditation') || lowerName.includes('zen')) {
      return '🧘';
    } else if (lowerName.includes('study') || lowerName.includes('focus')) {
      return '🧠';
    } else if (lowerName.includes('chill') || lowerName.includes('relax') || lowerName.includes('snow') || lowerName.includes('mountain')) {
      return '❄️'; // 使用雪花图标代表放松/雪景/山景
    } else {
      // 默认返回音乐图标
      return '🎵';
    }
  };

  // 加载所有背景音乐
  useEffect(() => {
    const loadAllSounds = async () => {
      try {
        // 动态导入audioManager和audioStatistics
        const audioManagerModule = await import('../../utils/audioManager');
        const audioStatisticsModule = await import('../../utils/audioStatistics');
        setAudioManager(audioManagerModule.default);
        setAudioStatistics(audioStatisticsModule.default);
        
        await audioManagerModule.default.initialize();
        
        // 获取所有背景音乐文件，包括番茄钟专用的背景音乐，并去重
        const allBgMusic = [...audioManagerModule.default.getBackgroundMusic(), ...audioManagerModule.default.getCategoryById('pomodoro-bgm')?.files || []];
        // 使用Map去重，确保每个音频文件只出现一次
        const uniqueBgmFilesMap = new Map();
        allBgMusic.forEach(file => {
          if (!uniqueBgmFilesMap.has(file.id)) {
            uniqueBgmFilesMap.set(file.id, file);
          }
        });
        const bgmFiles = Array.from(uniqueBgmFilesMap.values());
        
        // 第一次加载时按播放次数排序音频文件，后续加载保持当前顺序
        let sortedBgmFiles = bgmFiles;
        if (!initialSoundsLoaded) {
          sortedBgmFiles = audioStatisticsModule.default.getSortedAudioFiles(bgmFiles);
          setInitialSoundsLoaded(true);
        }
        
        // 转换为组件所需的格式
        const soundList = [
          { id: 'mute', name: '静音', icon: '🔇' },
          ...sortedBgmFiles.filter(file => file && file.id && file.url).map(file => ({
            id: file.id,
            name: file.name,
            url: file.url,
            icon: getIconComponentByName(file.name),
            color: 'text-blue-500',
            hex: '#3b82f6'
          }))
        ];
        
        setAllSounds(soundList);
        setIsSoundListLoaded(true);
      } catch (error) {
        console.error('Failed to load sound list:', error);
        // 加载失败时使用默认音效列表
        setAllSounds([
          { id: 'mute', name: '静音', icon: '🔇' },
          { id: 'forest', name: '迷雾森林', icon: '🌲' },
          { id: 'alpha', name: '阿尔法波', icon: '🧠' },
          { id: 'theta', name: '希塔波', icon: '🧘' },
          { id: 'beta', name: '贝塔波', icon: '⚡' },
          { id: 'ocean', name: '海浪声', icon: '🌊' },
          { id: 'rain', name: '雨声', icon: '🌧️' },
          { id: 'night', name: '夏夜虫鸣', icon: '🦗' },
          { id: 'white-noise', name: '白噪音', icon: '🌬️' },
          { id: 'pink-noise', name: '粉红噪音', icon: '🎨' },
          { id: 'brown-noise', name: '布朗噪音', icon: '🌰' },
          { id: 'cafe', name: '咖啡馆环境', icon: '☕' },
          { id: 'fireplace', name: '壁炉声', icon: '🔥' }
        ]);
        setIsSoundListLoaded(true);
      }
    };
    
    loadAllSounds();
  }, [initialSoundsLoaded]);

  // 初始化Three.js场景
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    let cleanup: (() => void) | undefined;

    // 动态加载ThreeJS和相关库
    const loadThreeJS = async () => {
      try {
        // 使用ES模块动态导入Three.js
        const THREE = await import('three');
        const OrbitControls = (await import('three/examples/jsm/controls/OrbitControls.js')).OrbitControls;
        // 不使用TWEEN库，直接移除依赖

        // --- 配置区 ---
        const GROUND_SIZE = 180;
        const NEU_BG_COLOR = 0xe0e5ec;
        const FULL_DASH_ARRAY = 716; // r=114 -> C = 2 * PI * 114 ≈ 716

        // --- 全局变量 ---
        let scene, camera, renderer, controls;
        let ground, tomatoMesh, previewMesh;
        let entities: any[] = [];

        // 保存到全局以便外部访问
        const saveGlobalRefs = () => {
          if (canvasContainerRef.current) {
            (canvasContainerRef.current as any)._scene = scene;
            (canvasContainerRef.current as any)._initRandomEcosystem = initRandomEcosystem;
            (canvasContainerRef.current as any)._GROUND_SIZE = GROUND_SIZE;
            (canvasContainerRef.current as any)._SPECIES = SPECIES;
            (canvasContainerRef.current as any)._createEntity = createEntity;
            (canvasContainerRef.current as any)._entities = entities;
            (canvasContainerRef.current as any)._updatePreview = updatePreview;
            (canvasContainerRef.current as any)._previewMesh = previewMesh;
            (canvasContainerRef.current as any)._createPlant = createPlant;
            (canvasContainerRef.current as any)._createAnimal = createAnimal;
            (canvasContainerRef.current as any)._updateSceneColors = updateSceneColors; // 添加主题更新方法
          }
        };

        // 根据主题获取颜色
        const getThemeColors = () => {
          if (theme.includes('dark')) {
            return {
              bgColor: 0x1e1e2e,  // 深灰蓝底色
              groundColor: 0x33334d,  // 深棕色地面
              grassColor: 0x2d3748,  // 深绿草色
              neuBgColor: 0x2d3748  // 拟态背景色
            };
          } else {
            return {
              bgColor: 0xe0e5ec,
              groundColor: 0x795548,
              grassColor: 0x8bc34a,
              neuBgColor: 0xe0e5ec
            };
          }
        };
        
        // 更新场景颜色
        const updateSceneColors = () => {
          const colors = getThemeColors();
          scene.background = new THREE.Color(colors.bgColor);
          scene.fog = new THREE.Fog(colors.bgColor, 60, 160);
          
          // 更新地面材质
          if (ground) {
            const materials = Array.isArray(ground.material) ? ground.material : [ground.material];
            materials.forEach(material => {
              if (material instanceof THREE.MeshStandardMaterial) {
                material.color.set(colors.groundColor);
                material.needsUpdate = true;
              }
            });
          }
          
          // 更新草地材质
          if (ground && ground.children.length > 0) {
            ground.children.forEach(child => {
              if (child instanceof THREE.Mesh) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach(material => {
                  if (material instanceof THREE.MeshStandardMaterial) {
                    material.color.set(colors.grassColor);
                    material.needsUpdate = true;
                  }
                });
              }
            });
          }
        };
        
        // 初始化场景
        const init = () => {
          // 1. 场景
          scene = new THREE.Scene();
          const colors = getThemeColors();
          scene.background = new THREE.Color(colors.bgColor);
          scene.fog = new THREE.Fog(colors.bgColor, 60, 160);

          camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
          camera.position.set(0, 50, 80);

          renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true  // 启用透明度以避免默认黑色背景
          });
          renderer.setSize(window.innerWidth, window.innerHeight);
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.1;
          canvasContainerRef.current?.appendChild(renderer.domElement);
          
          // 确保canvas容器样式正确设置为全屏
          const canvas = renderer.domElement;
          canvas.style.width = '100vw';
          canvas.style.height = '100vh';

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
          createGround();
          // 创建番茄
          createTomato();
          // 初始化随机生态系统
          initRandomEcosystem(totalPlants);
          // 初始化预览模型
          updatePreview('pine');

          controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.maxPolarAngle = Math.PI / 2 - 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        
        // 防止orbit controls的鼠标事件冒泡影响页面滚动
        const domElement = renderer.domElement;
        
        // 禁用 OrbitControls 的默认事件监听，防止其干扰全局滚动
        controls.enableZoom = true;
        controls.enablePan = false;  // 禁用平移，避免影响页面滚动
        controls.enableRotate = true;
        
        // 阻止滚轮事件冒泡，但仅在3D画布获得焦点时
        const preventWheelPropagation = (e: WheelEvent) => {
          // 只有当鼠标实际位于3D画布上时才阻止事件传播
          const rect = domElement.getBoundingClientRect();
          const mouseX = e.clientX;
          const mouseY = e.clientY;
          
          if (mouseX >= rect.left && mouseX <= rect.right && 
              mouseY >= rect.top && mouseY <= rect.bottom) {
            e.stopPropagation();
          }
          // 允许在画布外部滚动页面
        };
        
        // 阻止指针事件冒泡
        const preventPointerPropagation = (e: PointerEvent) => {
          // 只有当鼠标实际位于3D画布上时才阻止事件传播
          const rect = domElement.getBoundingClientRect();
          const mouseX = e.clientX;
          const mouseY = e.clientY;
          
          if (mouseX >= rect.left && mouseX <= rect.right && 
              mouseY >= rect.top && mouseY <= rect.bottom) {
            e.stopPropagation();
          }
          // 允许在画布外部进行页面交互
        };
        
        // 保存事件处理函数以便稍后清理
        if (canvasContainerRef.current) {
          (canvasContainerRef.current as any)._preventWheelPropagation = preventWheelPropagation;
          (canvasContainerRef.current as any)._preventPointerPropagation = preventPointerPropagation;
        }
        
        domElement.addEventListener('wheel', preventWheelPropagation, { passive: false });
        domElement.addEventListener('pointerdown', preventPointerPropagation);
        domElement.addEventListener('pointermove', preventPointerPropagation);
        domElement.addEventListener('pointerup', preventPointerPropagation);
        
          window.addEventListener('resize', onWindowResize);
          
          // 保存全局引用
          saveGlobalRefs();
        };

        // 创建地面
        const createGround = () => {
          // 使用CylinderGeometry创建有厚度的圆形地面
          const groundGeometry = new THREE.CylinderGeometry(
            GROUND_SIZE / 2, // 顶部半径
            GROUND_SIZE / 2, // 底部半径
            5,               // 高度（厚度）
            64               // 分段数，越高越圆
          );
          
          const colors = getThemeColors();
          
          // 使用更自然的地面材质，根据主题变化
          const groundMaterial = new THREE.MeshStandardMaterial({
            color: colors.groundColor,
            roughness: 0.9,
            metalness: 0.1,
            side: THREE.DoubleSide
          });
          
          ground = new THREE.Mesh(groundGeometry, groundMaterial);
          ground.position.set(0, 0, 0); // 放在原点，地面顶部在y=2.5处
          ground.receiveShadow = true;
          scene.add(ground);
          
          // 在地面上添加一层草地，使用稍微高一点的位置避免Z-fighting
          const grassGeometry = new THREE.CircleGeometry(GROUND_SIZE / 2 - 0.5, 64);
          
          // 创建更自然的草地材质，添加一些纹理变化
          const grassMaterial = new THREE.MeshStandardMaterial({
            color: colors.grassColor,
            roughness: 0.8,
            metalness: 0.1,
            side: THREE.DoubleSide
          });
          
          const grass = new THREE.Mesh(grassGeometry, grassMaterial);
          grass.position.set(0, 2.51, 0); // 稍微高于地面顶部，避免Z-fighting
          grass.rotation.x = -Math.PI / 2;
          grass.receiveShadow = true;
          ground.add(grass);
          
          // 添加一些随机分布的细节（小石头、小花等）
          const detailCount = 50;
          for (let i = 0; i < detailCount; i++) {
            // 随机生成位置
            const angle = Math.random() * Math.PI * 2;
            const radius = (0.5 + Math.random() * 0.5) * (GROUND_SIZE / 2 - 5); // 避免边缘
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // 随机选择细节类型
            if (Math.random() > 0.5) {
              // 创建小石头
              const stoneGeometry = new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.2, 0);
              const stoneMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x8B7355,
                roughness: 0.9,
                metalness: 0.1
              });
              const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
              stone.position.set(x, 2.6, z);
              stone.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
              stone.scale.set(
                0.8 + Math.random() * 0.4,
                0.8 + Math.random() * 0.4,
                0.8 + Math.random() * 0.4
              );
              stone.castShadow = true;
              stone.receiveShadow = true;
              ground.add(stone);
            } else {
              // 创建小花
              const flowerGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
              const flowerMaterial = new THREE.MeshStandardMaterial({ 
                color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
                roughness: 0.7,
                metalness: 0.2
              });
              const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
              flower.position.set(x, 2.6, z);
              flower.castShadow = true;
              flower.receiveShadow = true;
              ground.add(flower);
              
              // 添加花心
              const centerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
              const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
              const center = new THREE.Mesh(centerGeometry, centerMaterial);
              center.position.set(0, 0.15, 0);
              flower.add(center);
            }
          }
        };

        // 创建番茄
        const createTomato = () => {
          const tomatoGeometry = new THREE.SphereGeometry(2, 32, 32);
          const tomatoMaterial = new THREE.MeshStandardMaterial({
            color: 0xff5722,
            roughness: 0.5,
            metalness: 0.1
          });
          tomatoMesh = new THREE.Mesh(tomatoGeometry, tomatoMaterial);
          tomatoMesh.name = 'tomatoMesh';
          tomatoMesh.position.set(0, 2, 0);
          tomatoMesh.castShadow = true;
          scene.add(tomatoMesh);
          tomatoMesh.visible = false;
        };

        // 检查位置是否与现有实体重叠
        const checkPositionValidity = (x: number, z: number, entitySize: number = 2): boolean => {
          // 检查是否在大陆范围内
          const distanceFromCenter = Math.sqrt(x * x + z * z);
          if (distanceFromCenter > GROUND_SIZE / 2 - entitySize) {
            return false;
          }
          
          // 检查是否与现有实体重叠
          for (const entity of entities) {
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
        
        // 初始化生态系统：根据count参数创建指定数量的模型
        const initRandomEcosystem = (count: number) => {
          // 重置实体数组
          entities = [];
          
          // 清除场景中所有非基础对象（只保留地面、番茄和预览模型）
          scene.children.forEach(child => {
            if (child !== ground && child !== tomatoMesh && child.name !== 'previewMesh') {
              scene.remove(child);
            }
          });
          
          // 重置预览模型引用
          previewMesh = null;
          
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
            
            const entity = createEntity(randomSpecies.id, x, z);
            
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
        };

        // --- Low Poly 建模 --- 从HTML中提取的精致模型
        function createPlant(type: string) {
          const group = new THREE.Group();
          
          // 只根据type创建对应的模型，不累积所有模型
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
        }

        function createAnimal(type: string) {
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
            
            // 触角
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
            
          } else if (type === 'sheep') {
            // 绵羊 - 毛茸茸效果
            const sheepBody = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              roughness: 0.9,
              metalness: 0.05
            });
            
            // 身体
            const body = new THREE.Mesh(
              new THREE.SphereGeometry(0.45, 16, 16),
              sheepBody
            );
            body.position.set(0, 0.5, 0);
            body.castShadow = true;
            body.receiveShadow = true;
            group.add(body);
            
            // 头部
            const head = new THREE.Mesh(
              new THREE.SphereGeometry(0.2, 16, 16),
              new THREE.MeshStandardMaterial({ color: 0x1f2937 }) // 黑色头部
            );
            head.position.set(0, 0.7, 0.35);
            head.castShadow = true;
            head.receiveShadow = true;
            group.add(head);
            
            // 耳朵
            const earGeometry = new THREE.SphereGeometry(0.08, 16, 16);
            
            const ear1 = new THREE.Mesh(earGeometry, new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
            ear1.position.set(0.15, 0.8, 0.3);
            ear1.castShadow = true;
            ear1.receiveShadow = true;
            group.add(ear1);
            
            const ear2 = new THREE.Mesh(earGeometry, new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
            ear2.position.set(-0.15, 0.8, 0.3);
            ear2.castShadow = true;
            ear2.receiveShadow = true;
            group.add(ear2);
            
            // 眼睛
            const eyeGeometry = new THREE.SphereGeometry(0.03, 16, 16);
            const eye1 = new THREE.Mesh(eyeGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));
            eye1.position.set(0.1, 0.75, 0.38);
            group.add(eye1);
            
            const eye2 = new THREE.Mesh(eyeGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));
            eye2.position.set(-0.1, 0.75, 0.38);
            group.add(eye2);
            
            // 瞳孔
            const pupilGeometry = new THREE.SphereGeometry(0.015, 16, 16);
            const pupil1 = new THREE.Mesh(pupilGeometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
            pupil1.position.set(0.105, 0.75, 0.4);
            group.add(pupil1);
            
            const pupil2 = new THREE.Mesh(pupilGeometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
            pupil2.position.set(-0.105, 0.75, 0.4);
            group.add(pupil2);
            
            // 鼻子
            const nose = new THREE.Mesh(
              new THREE.SphereGeometry(0.03, 8, 8),
              new THREE.MeshStandardMaterial({ color: 0x000000 })
            );
            nose.position.set(0, 0.68, 0.45);
            group.add(nose);
            
            // 毛发效果
            for (let i = 0; i < 30; i++) {
              const wool = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 8, 8),
                sheepBody
              );
              
              // 随机分布在身体周围
              const u = Math.random();
              const v = Math.random();
              const theta = u * Math.PI * 2;
              const phi = Math.acos(2 * v - 1);
              const r = 0.48 + Math.random() * 0.05;
              
              const sinTheta = Math.sin(phi);
              
              wool.position.set(
                r * sinTheta * Math.cos(theta),
                0.5 + r * Math.cos(phi),
                r * sinTheta * Math.sin(theta)
              );
              
              wool.castShadow = true;
              wool.receiveShadow = true;
              group.add(wool);
            }
            
            // 腿部
            for (let i = 0; i < 4; i++) {
              const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.06, 0.3, 8),
                new THREE.MeshStandardMaterial({ color: 0x1f2937 })
              );
              
              const x = i % 2 === 0 ? 0.25 : -0.25;
              const z = i < 2 ? 0.2 : -0.2;
              
              leg.position.set(x, 0.2, z);
              leg.rotation.x = Math.PI / 2;
              leg.castShadow = true;
              leg.receiveShadow = true;
              group.add(leg);
            }
            
          } else if (type === 'bear') {
            // 棕熊 - 厚重可爱的形态
            const bearMaterial = new THREE.MeshStandardMaterial({
              color: 0x78350f, // 棕色
              roughness: 0.8,
              metalness: 0.1
            });
            
            // 身体
            const body = new THREE.Mesh(
              new THREE.SphereGeometry(0.4, 16, 16),
              bearMaterial
            );
            body.position.set(0, 0.5, 0);
            body.castShadow = true;
            body.receiveShadow = true;
            group.add(body);
            
            // 头部
            const head = new THREE.Mesh(
              new THREE.SphereGeometry(0.3, 16, 16),
              bearMaterial
            );
            head.position.set(0, 0.8, 0.3);
            head.castShadow = true;
            head.receiveShadow = true;
            group.add(head);
            
            // 耳朵
            const earGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            
            const ear1 = new THREE.Mesh(earGeometry, bearMaterial);
            ear1.position.set(0.22, 1.05, 0.2);
            ear1.castShadow = true;
            ear1.receiveShadow = true;
            group.add(ear1);
            
            const ear2 = new THREE.Mesh(earGeometry, bearMaterial);
            ear2.position.set(-0.22, 1.05, 0.2);
            ear2.castShadow = true;
            ear2.receiveShadow = true;
            group.add(ear2);
            
            // 眼睛
            const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
            const eye1 = new THREE.Mesh(eyeGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));
            eye1.position.set(0.12, 0.85, 0.4);
            group.add(eye1);
            
            const eye2 = new THREE.Mesh(eyeGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));
            eye2.position.set(-0.12, 0.85, 0.4);
            group.add(eye2);
            
            // 瞳孔
            const pupilGeometry = new THREE.SphereGeometry(0.025, 16, 16);
            const pupil1 = new THREE.Mesh(pupilGeometry, new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
            pupil1.position.set(0.13, 0.85, 0.42);
            group.add(pupil1);
            
            const pupil2 = new THREE.Mesh(pupilGeometry, new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
            pupil2.position.set(-0.13, 0.85, 0.42);
            group.add(pupil2);
            
            // 鼻子
            const nose = new THREE.Mesh(
              new THREE.SphereGeometry(0.08, 16, 16),
              new THREE.MeshStandardMaterial({ color: 0x374151 })
            );
            nose.position.set(0, 0.75, 0.55);
            nose.castShadow = true;
            group.add(nose);
            
            // 嘴巴
            const mouth = new THREE.Mesh(
              new THREE.SphereGeometry(0.05, 16, 16),
              new THREE.MeshStandardMaterial({ color: 0x374151 })
            );
            mouth.position.set(0, 0.7, 0.55);
            group.add(mouth);
            
            // 腿部
            for (let i = 0; i < 4; i++) {
              const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.07, 0.08, 0.3, 8),
                bearMaterial
              );
              
              const x = i % 2 === 0 ? 0.25 : -0.25;
              const z = i < 2 ? 0.25 : -0.25;
              
              leg.position.set(x, 0.2, z);
              leg.rotation.x = Math.PI / 2;
              leg.castShadow = true;
              leg.receiveShadow = true;
              group.add(leg);
            }
            
          } else {
            // 小鸡 - 黄色毛茸茸
            const chickMaterial = new THREE.MeshStandardMaterial({
              color: 0xfacc15, // 黄色
              roughness: 0.7,
              metalness: 0.2
            });
            
            // 身体
            const body = new THREE.Mesh(
              new THREE.SphereGeometry(0.3, 16, 16),
              chickMaterial
            );
            body.position.set(0, 0.3, 0);
            body.castShadow = true;
            body.receiveShadow = true;
            group.add(body);
            
            // 头部
            const head = new THREE.Mesh(
              new THREE.SphereGeometry(0.2, 16, 16),
              chickMaterial
            );
            head.position.set(0, 0.55, 0.2);
            head.castShadow = true;
            head.receiveShadow = true;
            group.add(head);
            
            // 嘴巴
            const beak = new THREE.Mesh(
              new THREE.ConeGeometry(0.05, 0.15, 8),
              new THREE.MeshStandardMaterial({ color: 0xf97316 }) // 橙色
            );
            beak.position.set(0, 0.5, 0.35);
            beak.rotation.x = Math.PI / 2;
            beak.castShadow = true;
            beak.receiveShadow = true;
            group.add(beak);
            
            // 眼睛
            const eyeGeometry = new THREE.SphereGeometry(0.04, 16, 16);
            const eye1 = new THREE.Mesh(eyeGeometry, new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
            eye1.position.set(0.08, 0.6, 0.25);
            group.add(eye1);
            
            const eye2 = new THREE.Mesh(eyeGeometry, new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
            eye2.position.set(-0.08, 0.6, 0.25);
            group.add(eye2);
            
            // 翅膀
            const wing = new THREE.Mesh(
              new THREE.SphereGeometry(0.15, 8, 8),
              chickMaterial
            );
            wing.position.set(0.25, 0.3, 0);
            wing.castShadow = true;
            wing.receiveShadow = true;
            group.add(wing);
            
            // 腿部
            const legMaterial = new THREE.MeshStandardMaterial({ color: 0xf97316 });
            for (let i = 0; i < 2; i++) {
              const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.03, 0.15, 8),
                legMaterial
              );
              
              const x = i === 0 ? 0.1 : -0.1;
              leg.position.set(x, 0.15, 0);
              leg.rotation.x = Math.PI / 2;
              leg.castShadow = true;
              leg.receiveShadow = true;
              group.add(leg);
            }
            
            // 脚
            const footGeometry = new THREE.BoxGeometry(0.08, 0.02, 0.05);
            const foot1 = new THREE.Mesh(footGeometry, legMaterial);
            foot1.position.set(0.1, 0.06, 0);
            group.add(foot1);
            
            const foot2 = new THREE.Mesh(footGeometry, legMaterial);
            foot2.position.set(-0.1, 0.06, 0);
            group.add(foot2);
          }
          
          return group;
        }

        // 创建实体
        const createEntity = (type: string, x: number, z: number) => {
          let mesh: any;
          
          // 定义本地的物种数据，避免闭包问题
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
          
          // 根据类型创建不同的实体
          if (localSpecies.plants.some(p => p.id === type)) {
            mesh = createPlant(type);
          } else if (localSpecies.animals.some(a => a.id === type)) {
            mesh = createAnimal(type);
          } else {
            // 默认创建松树
            mesh = createPlant('pine');
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
          scene.add(mesh);
          entities.push(mesh);
          
          return mesh;
        };

        // 更新预览 - 使用精致模型，直接显示在大陆中心
        const updatePreview = (type: string) => {
          // 检查场景是否存在，避免在场景未初始化时尝试操作
          if (!scene || typeof scene !== 'object' || !scene.traverse) {
            console.warn('Scene not initialized or invalid, skipping preview update');
            return;
          }
          
          try {
            // 移除场景中所有名为'previewMesh'的对象，确保彻底清理
            scene.traverse((object) => {
              if (object.name === 'previewMesh') {
                if (object.parent) {
                  object.parent.remove(object);
                }
              }
            });
          } catch (error) {
            console.warn('Error traversing scene in updatePreview:', error);
            return;
          }
          
          // 获取番茄模型，检查是否处于专注模式
          const tomatoMesh = scene.getObjectByName('tomatoMesh');
          const isFocusMode = tomatoMesh && typeof tomatoMesh.visible !== 'undefined' && tomatoMesh.visible;
          
          let newPreviewMesh: any;
          
          // 创建新的预览模型
          try {
            // 植物类型列表
            const plantTypes = ['pine', 'oak', 'cherry', 'willow', 'bamboo', 'palm', 'cactus', 'mushroom', 'sunflower', 'birch'];
            // 动物类型列表
            const animalTypes = ['rabbit', 'fox', 'panda', 'pig', 'chick', 'penguin', 'frog', 'sheep', 'bear', 'bee'];
            
            if (plantTypes.includes(type)) {
              newPreviewMesh = createPlant(type);
            } else if (animalTypes.includes(type)) {
              newPreviewMesh = createAnimal(type);
            } else {
              newPreviewMesh = createPlant('pine');
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
              scene.add(newPreviewMesh);
              
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
          } catch (error) {
            console.error('Error updating preview:', error);
          }
          
          // 更新全局引用
          saveGlobalRefs();
        };

        // 窗口大小改变处理
        const onWindowResize = () => {
          if (!camera || !renderer) return;
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
          
          // 确保canvas容器也调整到全屏
          if (canvasContainerRef.current) {
            const canvas = renderer.domElement;
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
          }
        };

        // 动画循环
        let time = 0;
        const animate = () => {
          requestAnimationFrame(animate);
          
          // 更新动物动画
          entities.forEach(entity => {
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
                  const x = originalPos.x + Math.cos(animal.userData.angle) * movementRadius * Math.sin(time * 0.5);
                  const z = originalPos.z + Math.sin(animal.userData.angle) * movementRadius * Math.sin(time * 0.3);
                  
                  // 垂直移动（跳跃效果），兔子的跳跃更有节奏
                  const baseY = Math.max(2.5, originalPos.y); // 确保基础位置与地面贴合
                  const jumpHeight = animal.userData.jumpHeight || 0.2; // 兔子的跳跃高度
                  // 使用更自然的跳跃曲线，先快后慢
                  const jumpPhase = (time + animal.userData.waveOffset) % (Math.PI * 2);
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
                  const y = baseY + Math.sin(time + animal.userData.waveOffset) * jumpHeight;
                  
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
                const y = baseY + Math.sin(time + animal.userData.waveOffset) * jumpHeight;
                
                animal.position.set(x, y, z);
                animal.rotation.y = animal.userData.angle + Math.PI / 2;
              }
            }
          });
          
          time += 0.05;
          
          if (controls) controls.update();
          if (renderer && scene && camera) renderer.render(scene, camera);
        };

        // 初始化场景
        init();
        // 开始动画循环
        animate();

        // 返回清理函数
        cleanup = () => {
          window.removeEventListener('resize', onWindowResize);
          
          // 移除之前添加的事件监听器
          if (renderer && canvasContainerRef.current) {
            const domElement = renderer.domElement;
            
            // 使用存储的事件处理函数进行清理
            const preventWheelPropagation = (canvasContainerRef.current as any)._preventWheelPropagation;
            const preventPointerPropagation = (canvasContainerRef.current as any)._preventPointerPropagation;
            
            if (preventWheelPropagation) {
              domElement.removeEventListener('wheel', preventWheelPropagation, { passive: false });
            }
            if (preventPointerPropagation) {
              domElement.removeEventListener('pointerdown', preventPointerPropagation);
              domElement.removeEventListener('pointermove', preventPointerPropagation);
              domElement.removeEventListener('pointerup', preventPointerPropagation);
            }
            
            canvasContainerRef.current.removeChild(renderer.domElement);
            renderer.dispose();
          }
          
          // 恢复页面滚动
          document.body.style.overflow = '';
          
          // 销毁 OrbitControls 以防止其持续监听事件
          if (controls) {
            controls.dispose();
          }
        };
      } catch (error) {
        console.error('Error initializing Three.js scene:', error);
      }
    };

    // 加载Three.js
    loadThreeJS().then(() => {
      setIsLoaded(true);
    });

    // 返回清理函数
    return () => {
      if (cleanup) cleanup();
    };
  }, []); // 移除totalPlants依赖，避免场景重新加载

  // 当totalPlants变化时，实时更新3D大陆显示的植物/动物数量
  useEffect(() => {
    if (canvasContainerRef.current && isLoaded) {
      const initRandomEcosystem = (canvasContainerRef.current as any)._initRandomEcosystem;
      if (initRandomEcosystem) {
        // 确保count为非负数
        const validCount = Math.max(0, totalPlants);
        initRandomEcosystem(validCount);
      }
    }
  }, [totalPlants, isLoaded]);
  
  // 当外部props变化时，同步更新内部状态
  // 只在组件初始化和duration真正变化时更新currentDuration，避免暂停时被重置
  useEffect(() => {
    setCurrentDuration(duration * 60);
  }, [duration]);
  
  // 当isActive或timeLeft变化时，只更新焦点状态和剩余时间，不更新currentDuration
  useEffect(() => {
    setIsFocusing(isActive);
    setSecondsRemaining(timeLeft);
  }, [isActive, timeLeft]);
  
  // 当主题变化时，更新3D场景和UI元素
  useEffect(() => {
    if (canvasContainerRef.current && isLoaded) {
      const updateSceneColors = (canvasContainerRef.current as any)._updateSceneColors;
      if (updateSceneColors) {
        updateSceneColors();
      }
    }
  }, [theme, isLoaded]);

  // 使用全局音频管理器
  const { playBgMusic, stopBgMusic, currentBgMusicId } = useGlobalAudio();
  
  // 音频管理 - 独立于番茄钟状态的背景音乐控制
  useEffect(() => {
    let targetSoundId = localCurrentSoundId;
    
    // 如果用户选择了静音，则停止当前背景音乐
    if (targetSoundId === 'mute') {
      stopBgMusic();
    } else {
      // 如果用户选择了音乐，直接播放对应的背景音乐，不需要依赖番茄钟的聚焦状态
      const targetSound = allSounds.find(s => s.id === targetSoundId);
      if (targetSound && targetSoundId !== 'mute') {
        // 使用全局音频管理器播放背景音乐
        playBgMusic(targetSoundId);
        
        // 记录音频播放统计
        if (audioStatistics && targetSound.id && targetSound.id !== 'mute') {
          audioStatistics.recordPlay(targetSound.id);
        }
      }
    }
  }, [localCurrentSoundId, allSounds, audioStatistics, playBgMusic, stopBgMusic]);

  // 计时器效果
  useEffect(() => {
    let interval: number;
    
    // 只有在专注且未暂停且时间大于0时才运行计时器
    if (isFocusing && !isPaused && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining(prev => {
          const newTime = prev - 1;
          onUpdateTimeLeft(newTime);
          if (newTime <= 0) {
            // 清除定时器
            clearInterval(interval);
            
            // 番茄钟结束，创建新的实体
            const createNewEntity = async () => {
              try {
                if (canvasContainerRef.current) {
                  const scene = (canvasContainerRef.current as any)._scene;
                  const createEntity = (canvasContainerRef.current as any)._createEntity;
                  if (scene && createEntity) {
                    // 随机位置
                    const GROUND_SIZE = 180;
                    const x = (Math.random() - 0.5) * GROUND_SIZE * 0.8;
                    const z = (Math.random() - 0.5) * GROUND_SIZE * 0.8;
                    
                    // 使用当前选择的种子类型创建新实体
                    const newEntity = createEntity(currentSeed, x, z);
                    
                    // 添加缩放动画
                    newEntity.scale.set(0, 0, 0);
                    let scale = 0;
                    const animateScale = () => {
                      scale += 0.05;
                      if (scale <= 1) {
                        newEntity.scale.set(scale, scale, scale);
                        requestAnimationFrame(animateScale);
                      }
                    };
                    animateScale();
                  }
                }
              } catch (error) {
                console.error('Error creating new entity:', error);
              }
            };
            
            createNewEntity();
            
            // 更新总数
            const newTotal = totalPlants + 1;
            setTotalPlants(newTotal);
            if (onUpdateTotalPlants) {
              onUpdateTotalPlants(newTotal);
            }
            
            // 更新今日数量
            const newToday = todayPlants + 1;
            setTodayPlants(newToday);
            if (onUpdateTodayPlants) {
              onUpdateTodayPlants(newToday);
            }
            
            // 更新3D场景中的生态系统，反映新增的植物/动物
            if (canvasContainerRef.current && isLoaded) {
              const initRandomEcosystem = (canvasContainerRef.current as any)._initRandomEcosystem;
              if (initRandomEcosystem) {
                initRandomEcosystem(newTotal);
              }
            }
            
            // 重置计时器，但保持在沉浸式界面，不调用onUpdateIsActive(false)
            // 这样就不会退出沉浸式模式
            setTimeout(() => {
              setSecondsRemaining(currentDuration);
              onUpdateTimeLeft(currentDuration);
              setIsFocusing(false);
              setIsPaused(false);
            }, 1000);
            
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    
    // 清理函数，确保在任何情况下都清除定时器
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isFocusing, isPaused, secondsRemaining, onUpdateTimeLeft, currentSeed, totalPlants, onUpdateTotalPlants, todayPlants, onUpdateTodayPlants, currentDuration]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 设置音效
  const setSound = async (type: string) => {
    // 更新本地音效状态
    setLocalCurrentSoundId(type);
    
    // 如果是静音，则停止当前背景音乐
    if (type === 'mute') {
      stopBgMusic();
    } else {
      // 播放对应的背景音乐
      await playBgMusic(type);
    }
    
    // 记录播放次数
    if (audioStatistics && type !== 'mute') {
      audioStatistics.recordPlay(type);
    }
    
    // 选择音乐时不关闭面板
    // setIsAudioMenuOpen(false);
  };

  // 选择种子
  const selectSeed = (type: string) => {
    setCurrentSeed(type);
    
    // 立即更新预览模型
    if (canvasContainerRef.current && isLoaded) {
      const updatePreview = (canvasContainerRef.current as any)._updatePreview;
      if (updatePreview) {
        try {
          updatePreview(type);
        } catch (error) {
          console.error('Error updating preview:', error);
        }
      }
    }
  };

  // 点击外部区域关闭音频菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 只在番茄钟组件范围内处理点击外部区域的逻辑
      const componentRoot = containerRef.current;
      const audioMenu = document.querySelector('.audio-menu');
      const audioToggle = document.getElementById('audioToggle');
      
      // 检查点击是否在番茄钟组件范围内，如果不是，则不处理
      if (componentRoot && !componentRoot.contains(event.target as Node)) {
        return; // 点击不在番茄钟组件范围内，不处理此事件
      }
      
      if (isAudioMenuOpen && 
          audioMenu && 
          !audioMenu.contains(event.target as Node) && 
          audioToggle && 
          !audioToggle.contains(event.target as Node)) {
        setIsAudioMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAudioMenuOpen]);

  // 当选择的种子变化或组件状态改变时，更新预览模型
  useEffect(() => {
    if (canvasContainerRef.current && isLoaded) {
      // 在暂停状态下或者非专注状态下更新预览
      const updatePreview = (canvasContainerRef.current as any)._updatePreview;
      if (updatePreview) {
        updatePreview(currentSeed);
      }
    }
  }, [currentSeed, isLoaded, isFocusing, isPaused]);

  // 当计时器重置时，重新显示预览模型
  useEffect(() => {
    if (!isFocusing && !isPaused && secondsRemaining === currentDuration && canvasContainerRef.current && isLoaded) {
      const updatePreview = (canvasContainerRef.current as any)._updatePreview;
      if (updatePreview) {
        updatePreview(currentSeed);
      }
    }
  }, [isFocusing, isPaused, secondsRemaining, currentDuration, currentSeed, isLoaded]);

  // 开始专注
  const startFocus = () => {
    setIsFocusing(true);
    setIsPaused(false);
    onUpdateIsActive(true);
    
    // 动态加载ThreeJS，更新3D场景
    const updateScene = async () => {
      try {
        const THREE = await import('three');
        if (canvasContainerRef.current) {
          const scene = (canvasContainerRef.current as any)._scene;
          if (scene && typeof scene === 'object' && scene.traverse) {
            // 显示番茄模型
            const tomatoMesh = scene.getObjectByName('tomatoMesh');
            if (tomatoMesh) {
              tomatoMesh.visible = true;
              tomatoMesh.scale.set(0, 0, 0);
              // 使用简单的缩放动画替代TWEEN
              let scale = 0;
              const animateScale = () => {
                scale += 0.05;
                if (scale <= 1) {
                  tomatoMesh.scale.set(scale, scale, scale);
                  requestAnimationFrame(animateScale);
                }
              };
              setTimeout(animateScale, 500);
            }
            
            // 隐藏预览模型
            const previewMesh = scene.getObjectByName('previewMesh');
            if (previewMesh) {
              let scale = 1;
              const animateHide = () => {
                scale -= 0.05;
                if (scale >= 0) {
                  previewMesh.scale.set(scale, scale, scale);
                  requestAnimationFrame(animateHide);
                } else {
                  scene.remove(previewMesh);
                }
              };
              animateHide();
            }
          } else {
            console.warn('Scene not initialized or invalid when starting focus');
            // 如果场景未初始化，仍然更新状态
            return;
          }
        }
      } catch (error) {
        console.error('Error updating scene:', error);
      }
    };
    
    updateScene();
  };

  // 暂停专注
  const pauseFocus = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
            
    // 更新父组件状态：只有在从专注状态变为暂停状态时才通知父组件
    // 避免在计时器结束时意外退出沉浸式模式
    if (isFocusing) {
      onUpdateIsActive(!newPausedState);
    }
            
    // 如果暂停，显示预览模型；如果继续，隐藏预览模型
    const updateScene = async () => {
      try {
        const THREE = await import('three');
        if (canvasContainerRef.current) {
          // 安全检查：确保场景已经初始化
          const scene = (canvasContainerRef.current as any)._scene;
          // 添加额外检查确保scene对象存在且有效
          if (scene && typeof scene === 'object' && typeof scene.traverse === 'function') {
            if (newPausedState) {  // 修正逻辑：使用新状态来判断
              // 暂停，显示预览模型
              // 调用全局的updatePreview函数
              const updatePreview = (canvasContainerRef.current as any)._updatePreview;
              if (updatePreview) {
                updatePreview(currentSeed);
              }
            } else {
              // 继续专注，隐藏预览模型
              const previewMesh = scene.getObjectByName('previewMesh');
              if (previewMesh) {
                let scale = 1;
                const animateHide = () => {
                  scale -= 0.05;
                  if (scale >= 0) {
                    previewMesh.scale.set(scale, scale, scale);
                    requestAnimationFrame(animateHide);
                  } else {
                    scene.remove(previewMesh);
                  }
                }; 
                animateHide();
              }
            }
          } else {
            console.warn('Scene not initialized or invalid when pausing focus');
            // 如果场景未初始化，仍然更新状态
            return;
          }
        }
      } catch (error) {
        console.error('Error updating scene on pause:', error);
      }
    };
            
    updateScene();
  };



  // 重置专注
  const resetFocus = () => {
    setIsFocusing(false);
    setIsPaused(false);
    setSecondsRemaining(currentDuration);
    onUpdateTimeLeft(currentDuration);
    onUpdateIsActive(false);
    
    // 重置3D场景
    const resetScene = async () => {
      try {
        const THREE = await import('three');
        if (canvasContainerRef.current) {
          const scene = (canvasContainerRef.current as any)._scene;
          if (scene && typeof scene === 'object' && scene.traverse) {
            // 隐藏番茄模型
            const tomatoMesh = scene.getObjectByName('tomatoMesh');
            if (tomatoMesh) {
              tomatoMesh.visible = false;
            }
            
            // 调用全局的updatePreview函数
            const updatePreview = (canvasContainerRef.current as any)._updatePreview;
            if (updatePreview) {
              updatePreview(currentSeed);
            }
          } else {
            console.warn('Scene not initialized or invalid when resetting focus');
            // 如果场景未初始化，仍然更新状态
            return;
          }
        }
      } catch (error) {
        console.error('Error resetting scene:', error);
      }
    };
    
    resetScene();
  };

  // 设置时长
  const setDuration = (min: number) => {
    const newDuration = min * 60;
    setCurrentDuration(newDuration);
    setSecondsRemaining(newDuration);
    onUpdateTimeLeft(newDuration);
  };

  // 开始编辑总数
  const startEditTotal = () => {
    setIsEditingTotal(true);
    setEditingValue(totalPlants.toString());
    setTimeout(() => {
      const input = totalPlantsRef.current?.querySelector('input');
      input?.focus();
      input?.select();
    }, 0);
  };

  // 开始编辑今日数量
  const startEditToday = () => {
    setIsEditingToday(true);
    setEditingValue(todayPlants.toString());
    setTimeout(() => {
      const input = todayPlantsRef.current?.querySelector('input');
      input?.focus();
      input?.select();
    }, 0);
  };

  // 保存编辑
  const saveEdit = (type: 'total' | 'today') => {
    const value = parseInt(editingValue);
    if (!isNaN(value) && value >= 0) {
      if (type === 'total') {
        // 更新本地状态
        setTotalPlants(value);
        // 保存到本地存储
        localStorage.setItem('immersionPomodoro_totalPlants', value.toString());
        // 如果提供了回调函数，调用它更新父组件状态
        if (onUpdateTotalPlants) {
          onUpdateTotalPlants(value);
        }
        
        // 立即更新3D场景，确保数据与显示一致
        if (canvasContainerRef.current && isLoaded) {
          const initRandomEcosystem = (canvasContainerRef.current as any)._initRandomEcosystem;
          if (initRandomEcosystem) {
            const validCount = Math.max(0, value);
            initRandomEcosystem(validCount);
          }
        }
      } else {
        // 更新本地状态
        setTodayPlants(value);
        // 保存到本地存储
        localStorage.setItem('immersionPomodoro_todayPlants', value.toString());
        // 如果提供了回调函数，调用它更新父组件状态
        if (onUpdateTodayPlants) {
          onUpdateTodayPlants(value);
        }
      }
    }
    setIsEditingTotal(false);
    setIsEditingToday(false);
  };

  // 开始编辑预设时间
  const startEditPreset = (preset: number) => {
    setIsEditingPreset(true);
    setEditingPresetId(preset);
    setEditingValue(preset.toString());
    setTimeout(() => {
      const input = document.querySelector(`#preset-${preset}`) as HTMLInputElement;
      input?.focus();
      input?.select();
    }, 0);
  };

  // 保存编辑预设时间
  const saveEditPreset = () => {
    const value = parseInt(editingValue);
    if (!isNaN(value) && value > 0 && editingPresetId !== null) {
      // 更新当前计时器设置为修改后的预设时间
      setDuration(value);
    }
    setIsEditingPreset(false);
    setEditingPresetId(null);
  };

  // 处理输入框按键事件
  const handleInputKeyDown = (e: React.KeyboardEvent, type: 'total' | 'today' | 'preset') => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      if (type === 'preset') {
        saveEditPreset();
      } else {
        saveEdit(type);
      }
    } else if (e.key === 'Escape' || e.keyCode === 27) {
      setIsEditingTotal(false);
      setIsEditingToday(false);
      setIsEditingPreset(false);
      setEditingPresetId(null);
    }
  };

  const isDark = theme.includes('dark');
  const isNeomorphic = theme.startsWith('neomorphic');
  const isNeomorphicDark = theme === 'neomorphic-dark';
  
  // 拟态风格样式变量
  const neomorphicStyles = getNeomorphicStyles(isNeomorphicDark);
  
  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isNeomorphicDark ? 'bg-[#1e1e2e] text-white' : 'bg-[#e0e5ec] text-gray-800'}`}>
      {/* 主容器 - 直接显示，无加载状态 */}
      <div ref={containerRef} className="relative inset-0">
        {/* Canvas容器 */}
        <div ref={canvasContainerRef} id="canvas-container" className="absolute inset-0"></div>
        
        {/* 退出按钮 */}
        <div className="exit-btn" id="exitBtn" onClick={onExitImmersive}>✕</div>
        
        {/* 帮助按钮和指南 */}
        <div className={`help-btn ${isFocusing && !isPaused ? 'hidden' : ''}`} id="helpBtn" onClick={() => {
          const guideCard = document.getElementById('guideCard');
          if (guideCard) {
            guideCard.classList.toggle('show');
          }
        }}>?</div>
        <div className={`${isNeomorphicDark ? 'guide-card neu-out neomorphic-dark-mode' : isDark ? 'guide-card neu-out dark-mode' : 'guide-card neu-out'}`} id="guideCard">
          <div className="guide-header">
            <h3>🌲 3D专注生态指南</h3>
            <button className="guide-close" id="guideClose" onClick={() => {
              const guideCard = document.getElementById('guideCard');
              if (guideCard) {
                guideCard.classList.remove('show');
              }
            }}>✕</button>
          </div>
          <div className="guide-content">
            <h4>📋 基本规则</h4>
            <ul>
              <li>设定专注时间，点击开始按钮进入专注状态</li>
              <li>完成专注后，获得一棵植物或一只动物</li>
              <li>植物和动物会种植在你的3D森林中</li>
              <li>累计种植更多生命，打造丰富的生态系统</li>
            </ul>
            
            <h4>🎯 操作指南</h4>
            <ul>
              <li>🖱️ <strong>单击能量环</strong> - 开始/继续专注</li>
              <li>🖱️ <strong>双击能量环</strong> - 暂停专注</li>
              <li>🖱️ <strong>双击计时器</strong> - 修改专注时长</li>
              <li>🖱️ <strong>双击统计数据</strong> - 修改总数和今日成就</li>
              <li>🖱️ <strong>拖动鼠标</strong> - 旋转视角</li>
              <li>🖱️ <strong>滚轮缩放</strong> - 放大缩小场景</li>
            </ul>
            
            <h4>🎵 音乐设置</h4>
            <ul>
              <li>点击音乐图标打开音乐菜单</li>
              <li>选择喜欢的背景音乐或静音</li>
              <li>支持多种音效：森林、阿尔法波、希塔波等</li>
            </ul>
            
            <h4>🌿 物种选择</h4>
            <ul>
              <li>右侧面板选择你喜欢的植物或动物</li>
              <li>完成专注后将获得所选物种</li>
              <li>植物和动物会自动分布在森林中</li>
            </ul>
          </div>
        </div>

        {/* UI容器 */}
        <div className="ui-container">
          {/* 顶部数据栏 - 合并的统计面板 - 在专注且非暂停时隐藏 */}
          <div className={`stats-bar ${isFocusing && !isPaused ? 'hidden' : ''}`}>
            <div 
              ref={totalPlantsRef}
              className={`${isNeomorphicDark ? 'neu-out neomorphic-dark-mode' : isDark ? 'neu-out dark-mode' : 'neu-out'} stats-panel`} 
              id="statsTotal"
              onDoubleClick={startEditTotal}
            >
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs">🌲 总数</span>
                    {isEditingTotal ? (
                      <div className="highlight-num edit-mode">
                        <input 
                          type="number" 
                          min="0" 
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => {
                            saveEdit('total');
                            setIsEditingTotal(false);
                          }}
                          onKeyDown={(e) => handleInputKeyDown(e, 'total')}
                          className="edit-input text-xs"
                        />
                      </div>
                    ) : (
                      <span className="highlight-num text-xs" id="totalCount">{totalPlants}</span>
                    )}
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div> {/* 分隔线 */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs">☀️ 今日</span>
                    {isEditingToday ? (
                      <div className="highlight-num edit-mode">
                        <input 
                          type="number" 
                          min="0" 
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => {
                            saveEdit('today');
                            setIsEditingToday(false);
                          }}
                          onKeyDown={(e) => handleInputKeyDown(e, 'today')}
                          className="edit-input text-xs"
                        />
                      </div>
                    ) : (
                      <span className="highlight-num text-xs" id="todayCount">{todayPlants}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 预测时间模块 - 在专注且非暂停时隐藏 */}
          <div className={`prediction-module ${isFocusing && !isPaused ? 'hidden' : ''}`} id="predictionModule">
            <div className={`${isNeomorphicDark ? 'neu-out neomorphic-dark-mode' : isDark ? 'neu-out dark-mode' : 'neu-out'} prediction-panel`}>
              <div className="prediction-header">
                <h4>📊 预测时间</h4>
              </div>
              <div className="prediction-content">
                <div className="prediction-item">
                  <span className="prediction-label">当前时长:</span>
                  <span className="prediction-value">{formatTime(currentDuration)}</span>
                </div>
                <div className="prediction-item">
                  <span className="prediction-label">预估完成:</span>
                  <span className="prediction-value">{new Date(Date.now() + currentDuration * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="prediction-item">
                  <span className="prediction-label">当前种子:</span>
                  <span className="prediction-value">
                    {SPECIES.plants.concat(SPECIES.animals).find(s => s.id === currentSeed)?.icon || '🌱'} 
                    {SPECIES.plants.concat(SPECIES.animals).find(s => s.id === currentSeed)?.name || '未知'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          


          {/* 底部控制 */}
          <div className="controls">
            {/* 预设时间 + 音乐 - 在专注且非暂停时隐藏 */}
            <div className={`controls-row ${isFocusing && !isPaused ? 'hidden' : ''}`} id="controlsRow">
              <div id="presetGroup" className="flex gap-2">
                {/* 预设时间选项 */}
                {[1, 5, 10, 25, 30, 45, 60].map(m => (
                  <div key={m} className="relative">
                    <button 
                      className={`preset-btn ${Math.floor(currentDuration / 60) === m ? 'active' : ''}`} 
                      data-time={m}
                      onClick={() => setDuration(m)}
                      onDoubleClick={() => startEditPreset(m)}
                    >
                      {m}
                    </button>
                  </div>
                ))}
              </div>
                        
              <div className="audio-dropdown">
                <button 
                  className="audio-btn" 
                  id="audioToggle"
                  onClick={() => setIsAudioMenuOpen(!isAudioMenuOpen)}
                >
                  {localCurrentSoundId === 'mute' ? '🔇' : '🎵'}
                </button>
                <div 
                  className={`${isNeomorphicDark ? 'bg-[#1e1e2e] border border-zinc-700 shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(40,43,52,0.8)]' : isDark ? 'bg-zinc-900/95 border border-zinc-800' : (isNeomorphic ? 'bg-[#e0e5ec] border border-slate-300 shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]' : 'bg-white/95 border border-slate-200 shadow-[10px_10px_20px_rgba(163,177,198,0.4),-10px_-10px_20px_rgba(255,255,255,0.6)]')} absolute top-0 right-0 mt-16 mr-2 rounded-xl p-4 backdrop-blur-sm z-[1000] audio-menu ${isAudioMenuOpen ? 'show' : ''}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 搜索框 */}
                  <div className="mb-3">
                    <div className={`relative w-full ${isNeomorphic ? (isDark ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]') : (isDark ? 'bg-zinc-800' : 'bg-white')}`}>
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400">🔍</span>
                      <input
                        type="text"
                        placeholder="搜索背景音乐..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-9 pr-3 py-1.5 rounded-lg border ${isNeomorphic ? (isDark ? 'bg-[#1e1e2e] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(40,43,52,0.8)] border-[#3a3f4e]' : 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] border-[#caced5]') : (isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200')} text-sm ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}
                      />
                    </div>
                  </div>
                            
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                    {/* 优化后的音频菜单样式：添加圆角设计，调整按钮宽度 */}
                    {/* 静音选项 */}
                    <button 
                      className="flex items-center gap-2 px-3 py-2 rounded-2xl transition-all cursor-pointer active:scale-[0.98] hover:bg-gray-100 dark:hover:bg-zinc-700 w-full"
                      onClick={() => setSound('mute')}
                    >
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-400 w-4">1.</span>
                      <span className="text-16 text-zinc-500 dark:text-zinc-400">🔇</span>
                      <span className="text-xs font-medium">静音</span>
                    </button>
                              
                    {/* 音频列表 */}
                    {isSoundListLoaded ? (
                      allSounds
                        .filter(sound => sound.id !== 'mute' && sound.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((sound, index) => (
                          <button 
                            key={sound.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-2xl transition-all cursor-pointer active:scale-[0.98] hover:bg-gray-100 dark:hover:bg-zinc-700 w-full"
                            onClick={() => setSound(sound.id)}
                          >
                            <span className="text-[9px] text-zinc-500 dark:text-zinc-400 w-4">{index + 2}.</span>
                            <span className="text-16 text-blue-500 dark:text-zinc-300">{sound.icon || '🎵'}</span>
                            <span className="text-xs font-medium flex-1">{sound.name}</span>
                          </button>
                        ))
                    ) : (
                      <div className="audio-item loading">加载中...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
                      
            {/* 核心：悬浮能量环 */}
            <div 
              className={`focus-ring-container ${isFocusing ? 'focusing' : ''} ${isPaused ? 'paused' : ''}`} 
              id="focusRing"
              onClick={isFocusing ? pauseFocus : startFocus}
            >
          
                        
              {/* 外部凹槽 */}
              <div className="ring-groove">
                {/* SVG 进度条 */}
                <svg className="progress-ring" viewBox="0 0 240 240">
                  {/* 背景轨道 */}
                  <circle className="progress-ring__circle-bg" r="114" cx="120" cy="120"/>
                  {/* 进度条 */}
                  <circle 
                    className="progress-ring__circle" 
                    id="progressCircle" 
                    r="114" 
                    cx="120" 
                    cy="120"
                    style={{
                      strokeDasharray: 716,
                      strokeDashoffset: 716 - (secondsRemaining / currentDuration) * 716
                    }}
                  />
                </svg>
              </div>
          
              {/* 内部凸起圆盘 */}
              <div className="center-plate">
                <div 
              className="timer-text" 
              id="timer"
            >{formatTime(secondsRemaining)}</div>
                <div className="status-text" id="statusText">
                  {isFocusing ? (isPaused ? '已暂停 (单击继续)' : '专注生长中...') : '点击开始'}
                </div>
              </div>
            </div>
          </div>

          {/* 侧边种子选择 - 在专注且非暂停时隐藏 */}
          <div className={`${isNeomorphicDark ? 'neu-out neomorphic-dark-mode' : isDark ? 'neu-out dark-mode' : 'neu-out'} seed-selector ${isFocusing && !isPaused ? 'hidden' : ''}`} id="seedSelector">
            <div className="selector-title">🌿 植物类</div>
            {SPECIES.plants.map(plant => (
              <div 
                key={plant.id}
                id={`opt-${plant.id}`}
                className={`seed-option ${currentSeed === plant.id ? 'active' : ''}`}
                onClick={() => selectSeed(plant.id)}
              >
                <div className="seed-icon">{plant.icon}</div>
                <div className="seed-name">{plant.name}</div>
              </div>
            ))}
            <div className="selector-title mt-4">🐾 动物类</div>
            {SPECIES.animals.map(animal => (
              <div 
                key={animal.id}
                id={`opt-${animal.id}`}
                className={`seed-option ${currentSeed === animal.id ? 'active' : ''}`}
                onClick={() => selectSeed(animal.id)}
              >
                <div className="seed-icon">{animal.icon}</div>
                <div className="seed-name">{animal.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 样式 */}
      <style jsx>{`
        :root {
          --bg-color: #e0e5ec;
          --text-main: #4d5b6d;
          --text-sub: #a3b1c6;
          --text-gray: #64748b;
          --shadow-light: #ffffff;
          --shadow-dark: #a3b1c6;
          --primary-green: #22c55e;
          --primary-blue: #3b82f6;
          --dark-green: #14532d;
          --warn-yellow: #f59e0b;
        }
        
        .dark {
          --bg-color: #1a1a2e;
          --text-main: #f4f4f5;
          --text-sub: #a3b1c6;
          --text-gray: #64748b;
          --shadow-light: #1e293b;
          --shadow-dark: #0f172a;
          --primary-green: #22c55e;
          --primary-blue: #3b82f6;
          --dark-green: #14532d;
          --warn-yellow: #f59e0b;
        }
        
        .neomorphic-dark {
          --bg-color: #1e1e2e;
          --text-main: #f4f4f5;
          --text-sub: #a3b1c6;
          --text-gray: #64748b;
          --shadow-light: #2d2d42;
          --shadow-dark: #0f0f17;
          --primary-green: #22c55e;
          --primary-blue: #3b82f6;
          --dark-green: #14532d;
          --warn-yellow: #f59e0b;
        }
        
        /* 调整拟态深色模式下的透明渐变覆盖层 */
        .neomorphic-dark .bg-gradient-to-t.from-black\/10.to-transparent {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.25), transparent);
        }
        
        /* 深色模式下调整透明渐变覆盖层的样式 */
        .dark .bg-gradient-to-t.from-black\/10.to-transparent {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.25), transparent);
        }

        #canvas-container {
          width: 100vw;
          height: 100vh;
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 0;
        }

        .ui-container {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          padding: 30px;
          box-sizing: border-box;
          z-index: 10;
        }
        
        @media (max-width: 768px) {
          .ui-container {
            padding: 20px;
          }
        }
        
        @media (max-width: 480px) {
          .ui-container {
            padding: 15px;
          }
        }

        .neu-out {
          background: var(--bg-color);
          border-radius: 16px;
          box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
          border: 1px solid rgba(255,255,255,0.2);
          color: var(--text-main);
        }
        
        .neu-out.dark-mode {
          background: var(--bg-color);
          box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-main);
        }
        
        .neu-out.neomorphic-dark-mode {
          background: var(--bg-color);
          box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-main);
        }
        
        .neomorphic-dark .progress-ring__circle-bg {
          stroke: rgba(55, 65, 81, 0.3); /* zinc-700 equivalent */
          filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.3)) drop-shadow(-2px -2px 2px rgba(255, 255, 255, 0.1));
        }
        
        .neomorphic-dark .timer-text {
          color: #f4f4f5;
        }
        
        .neomorphic-dark .status-text {
          color: var(--text-sub);
        }
        
        .neomorphic-dark .preset-btn {
          color: var(--text-sub);
        }
        
        .neomorphic-dark .preset-btn:hover {
          color: var(--text-main);
        }
        
        .neomorphic-dark .preset-btn.active {
          color: var(--text-main);
        }
        
        .neomorphic-dark .audio-btn {
          color: var(--text-sub);
        }
        
        .neomorphic-dark .audio-btn:hover {
          color: var(--primary-green);
        }
        
        .neomorphic-dark .highlight-num {
          color: var(--text-main);
        }
        
        .neomorphic-dark .seed-option {
          color: var(--text-main);
        }
        
        .neomorphic-dark .seed-option:hover {
          color: var(--primary-green);
        }
        
        .neomorphic-dark .seed-option.active {
          color: var(--primary-green);
        }
        
        .neomorphic-dark .selector-title {
          color: var(--text-sub);
        }
        
        .neomorphic-dark .audio-item {
          color: var(--text-main);
        }
        
        .neomorphic-dark .audio-item:hover {
          color: var(--primary-green);
        }
        
        .neomorphic-dark .audio-item.selected {
          color: var(--primary-green);
        }
        
        .neomorphic-dark .exit-btn {
          color: var(--text-main);
        }
        
        .neomorphic-dark .help-btn {
          color: var(--text-main);
        }

        .stats-bar {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: flex-start;
          width: 100%;
          margin-left: 0px;
          margin-top: 0px;
        }

        .stats-panel {
          pointer-events: auto;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: transform 0.2s ease;
          color: var(--text-main);
          width: auto;
          max-width: 100%;
        }
        
        .stats-panel:hover { transform: translateY(-2px); background: var(--bg-color); }
        .stats-panel:active { transform: scale(0.98); }
        
        .neomorphic-dark .stats-panel {
          color: var(--text-main);
        }

        .highlight-num {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main);
          text-shadow: none;
        }
        
        /* 响应式设计：在较小屏幕上调整stats-panel */
        @media (max-width: 768px) {
          .stats-panel {
            padding: 10px 20px;
            font-size: 12px;
            gap: 8px;
          }
          
          .highlight-num {
            font-size: 16px;
          }
          
          .stats-bar {
            gap: 10px;
          }
        }
        
        @media (max-width: 480px) {
          .stats-panel {
            padding: 8px 16px;
            font-size: 11px;
            gap: 6px;
          }
          
          .highlight-num {
            font-size: 14px;
          }
          
          .stats-bar {
            gap: 8px;
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .stats-combined {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .highlight-num.edit-mode {
          display: flex;
          align-items: center;
        }

        .edit-input {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main);
          background: transparent;
          border: none;
          outline: none;
          width: 60px;
          text-align: center;
          padding: 2px 6px;
          border-radius: 8px;
          box-shadow: inset 2px 2px 5px var(--shadow-dark), inset -2px -2px 5px var(--shadow-light);
        }

        .edit-input:focus {
          box-shadow: inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light);
        }

        .preset-input {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          background: transparent;
          border: none;
          outline: none;
          width: 60px;
          text-align: center;
          padding: 8px 16px;
          border-radius: 20px;
          box-shadow: inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light);
        }

        .preset-input:focus {
          box-shadow: inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light);
        }

        .seed-selector {
          pointer-events: auto;
          position: absolute;
          top: 100px; max-height: calc(100vh - 140px); right: 30px; width: 160px;
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: translateX(0); opacity: 1;
          z-index: 100;
          min-width: 140px;
        }
        
        .seed-selector.hidden {
          transform: translateX(150%); opacity: 0; pointer-events: none;
        }
        
        @media (max-width: 768px) {
          .seed-selector {
            top: 80px;
            right: 20px;
            width: 140px;
            min-width: 120px;
            padding: 12px;
          }
          
          .selector-title {
            font-size: 11px;
          }
          
          .seed-option {
            gap: 6px;
            padding: 6px 10px;
          }
          
          .seed-icon { 
            font-size: 14px; 
            width: 18px; 
          }
          
          .seed-name { 
            font-size: 10px; 
          }
        }
        
        @media (max-width: 480px) {
          .seed-selector {
            top: 60px;
            right: 10px;
            width: 120px;
            min-width: 100px;
            padding: 10px;
            max-height: calc(100vh - 120px);
          }
          
          .selector-title {
            font-size: 10px;
            margin-bottom: 3px;
          }
          
          .seed-option {
            gap: 5px;
            padding: 5px 8px;
            font-size: 10px;
          }
          
          .seed-icon { 
            font-size: 12px; 
            width: 16px; 
          }
          
          .seed-name { 
            font-size: 9px; 
          }
          
          /* 在极小屏幕上，考虑将选择器移到底部或采用可折叠设计 */
          @media (max-height: 600px) {
            .seed-selector {
              position: fixed;
              top: auto;
              bottom: 10px;
              right: 50%;
              transform: translateX(50%);
              width: 90%;
              max-width: 300px;
            }
          }
        }
        
        .seed-selector.hidden { transform: translateX(150%); opacity: 0; pointer-events: none; }
        .seed-selector::-webkit-scrollbar { width: 0px; }

        .selector-title {
          font-size: 12px; color: var(--text-sub); font-weight: 700; margin-bottom: 5px;
          text-transform: uppercase; letter-spacing: 1px; text-align: center;
        }

        .seed-option {
          display: flex; align-items: center;
          gap: 8px; padding: 8px 12px;
          border-radius: 50px; cursor: pointer; transition: all 0.2s ease;
          background: var(--bg-color);
          box-shadow: 4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light);
          color: var(--text-main);
        }
        .seed-option:hover { transform: translateY(-2px); }
        .seed-option:active { transform: scale(0.98); }
        .seed-option.active {
          box-shadow: inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light);
          color: var(--text-main);
          font-weight: bold;
          transform: none;
        }
        
        .neomorphic-dark .seed-option {
          color: var(--text-main);
        }
        .neomorphic-dark .seed-option:hover { color: var(--primary-green); }
        .neomorphic-dark .seed-option.active {
          color: var(--primary-green);
        }
        .seed-icon { font-size: 16px; width: 20px; text-align: center; }
        .seed-name { font-size: 11px; font-weight: 600; }

        .controls {
          pointer-events: none; /* 让背景3D场景能够接收鼠标事件 */
          align-self: center; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 35px;
          margin-top: auto; /* 移除固定上边距 */
          margin-bottom: 80px; /* 增加底部边距，使元素更靠底部 */
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
        }
        
        @media (max-width: 768px) {
          .controls {
            margin-bottom: 60px;
          }
        }
        
        @media (max-width: 480px) {
          .controls {
            margin-bottom: 50px;
            gap: 25px;
          }
        }
        
        /* 专门用于控制元素的容器，仅这些元素接收鼠标事件 */
        .controls .focus-ring-container,
        .controls .controls-row {
          pointer-events: auto;
        }

        .focus-ring-container {
          position: relative;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: var(--bg-color);
          box-shadow: 20px 20px 60px var(--shadow-dark), -20px -20px 60px var(--shadow-light);
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
          z-index: 20;
        }

        .focus-ring-container:hover {
          transform: scale(1.02) translateY(-5px);
          box-shadow: 25px 25px 70px var(--shadow-dark), -25px -25px 70px var(--shadow-light);
        }
        .focus-ring-container:active {
          transform: scale(0.98);
        }

        /* 响应式设计：在小屏幕上调整圆环大小 */
        @media (max-width: 768px) {
          .focus-ring-container {
            width: 220px;
            height: 220px;
            margin-top: 80px;
          }
          
          .ring-groove {
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
          }
          
          .center-plate {
            top: 25px;
            left: 25px;
            right: 25px;
            bottom: 25px;
          }
          
          .timer-text {
            font-size: 50px;
          }
          
          .status-text {
            font-size: 14px;
          }
        }
        
        @media (max-width: 480px) {
          .focus-ring-container {
            width: 180px;
            height: 180px;
            margin-top: 60px;
          }
          
          .ring-groove {
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
          }
          
          .center-plate {
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
          }
          
          .timer-text {
            font-size: 40px;
          }
          
          .status-text {
            font-size: 12px;
          }
        }

        .ring-groove {
          position: absolute;
          top: 20px; left: 20px; right: 20px; bottom: 20px;
          border-radius: 50%;
          background: var(--bg-color);
          box-shadow: inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light);
          z-index: 1;
        }

        .progress-ring {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          transform: rotate(-90deg);
          pointer-events: none;
          z-index: 2;
        }

        .progress-ring__circle-bg {
          display: block;
          fill: none;
          stroke: rgba(163, 177, 198, 0.2);
          stroke-width: 6;
        }
        
        .dark .progress-ring__circle-bg {
          stroke: rgba(55, 65, 81, 0.3); /* zinc-700 equivalent */
          filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.3)) drop-shadow(-2px -2px 2px rgba(255, 255, 255, 0.1));
        }

        .progress-ring__circle {
          fill: none;
          stroke: var(--primary-green);
          stroke-width: 6;
          stroke-linecap: round;
          stroke-dasharray: 716;
          stroke-dashoffset: 0;
          transition: stroke-dashoffset 1s linear;
          filter: drop-shadow(0 0 2px rgba(34, 197, 94, 0.4));
          opacity: 1;
        }

        .center-plate {
          position: absolute;
          top: 35px; left: 35px; right: 35px; bottom: 35px;
          border-radius: 50%;
          background: var(--bg-color);
          box-shadow: 6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light);
          z-index: 3;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .timer-text {
          font-size: 68px;
          font-weight: 700;
          color: var(--text-main);
          font-family: 'Segoe UI', Roboto, sans-serif;
          font-variant-numeric: tabular-nums;
          margin-bottom: 2px;
          letter-spacing: -1px;
          text-shadow: 0 0 4px rgba(0,0,0,0.1);
        }
        
        .dark .timer-text {
          color: #f4f4f5;
        }
        
        .status-text {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-sub);
          text-transform: uppercase;
          letter-spacing: 2px;
          transition: all 0.3s;
        }

        .timer-tooltip {
          position: absolute;
          bottom: 50px;  /* 调整位置，移到可见区域内并与其他元素保持适当距离 */
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          font-size: 12px;
          color: var(--text-sub);
          background: rgba(255,255,255,0.6);
          padding: 8px 16px;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          opacity: 0;
          transition: opacity 0.4s ease, transform 0.4s ease;
          pointer-events: none;
          white-space: nowrap;
          z-index: 100;
          backdrop-filter: blur(5px);
          /* 确保元素不会影响布局 */
          visibility: hidden;
        }
        .focus-ring-container:hover .timer-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
          visibility: visible;
        }

        .focus-ring-container.focusing .timer-text { color: var(--text-gray); }
        .focus-ring-container.focusing .status-text { color: var(--primary-green); opacity: 1; }
        
        .focus-ring-container.paused .timer-text { color: var(--warn-yellow); animation: none; }
        .focus-ring-container.paused .status-text { color: var(--warn-yellow); }
        .focus-ring-container.paused .progress-ring__circle { stroke: var(--warn-yellow); }

        .controls-row {
          display: flex; align-items: center; gap: 15px; padding: 10px 15px;
          border-radius: 40px; background: var(--bg-color);
          box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: translateY(0); opacity: 1;
          z-index: 50;
        }
        
        .controls-row.hidden {
          opacity: 0; pointer-events: none; transform: translateY(80px) scale(0.9);
        }

        .preset-btn {
          border: none; background: var(--bg-color); color: var(--text-sub);
          padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.3s ease;
          box-shadow: 3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light);
        }
        .preset-btn:hover { color: var(--text-main); transform: translateY(-1px); }
        .preset-btn:active,
        .preset-btn.active { 
          color: var(--text-main); 
          box-shadow: inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light);
          font-weight: bold;
          transform: scale(0.98);
        }
        
        .neomorphic-dark .preset-btn {
          color: var(--text-sub);
        }
        .neomorphic-dark .preset-btn:hover { color: var(--text-main); }
        .neomorphic-dark .preset-btn:active,
        .neomorphic-dark .preset-btn.active { 
          color: var(--text-main);
        }

        .audio-dropdown { position: relative; }
        .audio-btn {
          background: var(--bg-color); border: none; border-radius: 50%;
          width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 18px; color: var(--text-sub);
          box-shadow: 4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light);
          transition: transform 0.3s ease, color 0.3s ease;
        }
        .audio-btn:hover { color: var(--primary-green); transform: scale(1.1); }
        
        .neomorphic-dark .audio-btn {
          color: var(--text-sub);
        }
        .neomorphic-dark .audio-btn:hover { color: var(--primary-green); }

        .audio-menu {
          display: none; position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%);
          width: 140px; padding: 15px; z-index: 100; flex-direction: column; gap: 10px;
          margin-bottom: 0;
        }
        .audio-menu.show {
          display: flex;
        }
        
        .audio-item {
          pointer-events: auto;
        }
        
        .audio-item {
          padding: 10px; font-size: 13px; color: var(--text-main); cursor: pointer;
          border-radius: 10px; display: flex; align-items: center; gap: 8px;
          background: var(--bg-color);
          box-shadow: 3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light);
        }
        .audio-item:hover { color: var(--primary-green); }
        .audio-item.selected { 
          color: var(--primary-green); font-weight: bold;
          box-shadow: inset 2px 2px 5px var(--shadow-dark), inset -2px -2px 5px var(--shadow-light);
        }
        
        .neomorphic-dark .audio-item {
          color: var(--text-main);
        }
        .neomorphic-dark .audio-item:hover { color: var(--primary-green); }
        .neomorphic-dark .audio-item.selected { 
          color: var(--primary-green);
        }

        .exit-btn {
          position: absolute;
          top: 30px;
          right: 30px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-color);
          box-shadow: 5px 5px 10px var(--shadow-dark), -5px -5px 10px var(--shadow-light);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          color: var(--text-main);
          z-index: 1000;
          transition: all 0.2s ease;
          pointer-events: auto;
        }

        .exit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 7px 7px 14px var(--shadow-dark), -7px -7px 14px var(--shadow-light);
        }
        
        .neomorphic-dark .exit-btn {
          color: var(--text-main);
        }
        
        .exit-btn:active {
          transform: scale(0.95);
        }
        
        .help-btn {
          position: absolute;
          top: 30px;
          right: 80px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-color);
          box-shadow: 5px 5px 10px var(--shadow-dark), -5px -5px 10px var(--shadow-light);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          font-weight: bold;
          color: var(--text-main);
          z-index: 1000;
          transition: transform 0.3s ease, color 0.3s ease;
          pointer-events: auto;
        }
        
        .help-btn:hover {
          transform: scale(1.1);
          color: var(--primary-green);
          box-shadow: 5px 5px 10px var(--shadow-dark), -5px -5px 10px var(--shadow-light);
        }
        
        .neomorphic-dark .help-btn {
          color: var(--text-main);
        }
        .neomorphic-dark .help-btn:hover {
          color: var(--primary-green);
        }
        
        .help-btn:active {
          transform: scale(0.95);
        }
        
        .help-btn.hidden {
          opacity: 0;
          pointer-events: none;
          transform: scale(0.9);
        }
        
        /* 预测时间模块样式 */
        .prediction-module {
          position: absolute;
          top: 30px;
          left: 30px;
          z-index: 50;
          pointer-events: auto;
        }
        
        .prediction-panel {
          padding: 15px;
          border-radius: 16px;
          min-width: 200px;
          box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
        }
        
        .prediction-header {
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(163, 177, 198, 0.2);
        }
        
        .prediction-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
        }
        
        .prediction-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .prediction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }
        
        .prediction-label {
          color: var(--text-sub);
          font-weight: 500;
        }
        
        .prediction-value {
          color: var(--text-main);
          font-weight: 600;
          text-align: right;
          flex: 1;
          margin-left: 10px;
        }
        
        @media (max-width: 768px) {
          .prediction-module {
            top: 20px;
            left: 20px;
            right: 20px;
          }
          
          .prediction-panel {
            min-width: auto;
            width: 100%;
          }
        }
        
        .guide-card {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.9);
          width: 80%;
          max-width: 600px;
          max-height: 90vh;
          padding: 30px;
          background: var(--bg-color);
          box-shadow: 20px 20px 60px var(--shadow-dark), -20px -20px 60px var(--shadow-light);
          border-radius: 20px;
          z-index: 3000;
          display: none;
          flex-direction: column;
          overflow-y: auto;
          pointer-events: auto;
        }
        
        .guide-card.show {
          display: flex;
          animation: fadeInScale 0.3s ease-out forwards;
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        .guide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid rgba(163, 177, 198, 0.2);
        }
        
        .guide-header h3 {
          margin: 0;
          color: var(--text-main);
          font-size: 24px;
          font-weight: 700;
        }
        
        .guide-close {
          background: var(--bg-color);
          border: none;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          color: var(--text-sub);
          box-shadow: 3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light);
          transition: all 0.2s ease;
        }
        
        .guide-close:hover {
          color: var(--text-main);
          transform: translateY(-1px);
          box-shadow: 5px 5px 10px var(--shadow-dark), -5px -5px 10px var(--shadow-light);
        }
        
        .guide-content {
          flex: 1;
          overflow-y: auto;
          padding-right: 10px;
        }
        
        .guide-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .guide-content::-webkit-scrollbar-track {
          background: rgba(163, 177, 198, 0.1);
          border-radius: 3px;
        }
        
        .guide-content::-webkit-scrollbar-thumb {
          background: rgba(163, 177, 198, 0.5);
          border-radius: 3px;
        }
        
        .guide-content::-webkit-scrollbar-thumb:hover {
          background: rgba(163, 177, 198, 0.7);
        }
        
        .guide-content h4 {
          margin: 20px 0 10px 0;
          color: var(--text-main);
          font-size: 16px;
          font-weight: 700;
        }
        
        .guide-content h4:first-child {
          margin-top: 0;
        }
        
        .guide-content ul {
          margin: 0 0 15px 0;
          padding-left: 25px;
          color: var(--text-gray);
          font-size: 14px;
          line-height: 1.6;
        }
        
        .guide-content li {
          margin-bottom: 8px;
        }
        
        .guide-content strong {
          color: var(--text-main);
          font-weight: 600;
        }
        

      `}</style>
    </div>
  );
};

export default InternalImmersivePomodoro;