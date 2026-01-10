import React, { useEffect, useRef, useState } from 'react';
import { Theme } from '../../types';
import soundManager from '../../utils/soundManager';

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
  const [totalPlants, setTotalPlants] = useState(initialTotalPlants || 20);
  const [todayPlants, setTodayPlants] = useState(initialTodayPlants || 0);
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

  // 音效数据
  const SOUNDS = {
    mute: '',
    forest: './audio/bgm/forest.mp3', // 迷雾森林
    alpha: './audio/bgm/alpha.mp3', // 阿尔法波
    theta: './audio/bgm/theta.mp3', // 希塔波
    beta: './audio/bgm/beta.mp3', // 贝塔波
    ocean: './audio/bgm/ocean.mp3', // 海浪声
    none: ''
  };

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
        };

        // 根据主题获取颜色
        const getThemeColors = () => {
          if (theme === 'dark') {
            return {
              bgColor: 0x1a1a2e,
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

          renderer = new THREE.WebGLRenderer({ antialias: true });
          renderer.setSize(window.innerWidth, window.innerHeight);
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.1;
          canvasContainerRef.current?.appendChild(renderer.domElement);

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
          
          // 清除场景中所有非基础对象（只保留地面、番茄）
          scene.children.forEach(child => {
            if (child !== ground && child !== tomatoMesh) {
              scene.remove(child);
            }
          });
          
          // 重置预览模型引用
          previewMesh = null;
          
          // 获取所有可用物种
          const allSpecies = [...SPECIES.plants, ...SPECIES.animals];
          const totalUniqueSpecies = allSpecies.length;
          
          // 创建指定数量的随机实体
          for (let i = 0; i < count; i++) {
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
          const trunkMat = new THREE.MeshStandardMaterial({color: 0x5c4033});
          
          if (type === 'pine') {
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 1.2, 12), trunkMat);
            trunk.position.y = 0.6; group.add(trunk);
            const leafMat = new THREE.MeshStandardMaterial({color: 0x2d6a4f});
            for(let i=0; i<3; i++) {
              const s = 1.3 - i*0.3;
              const cone = new THREE.Mesh(new THREE.ConeGeometry(s, 1.5, 12), leafMat);
              cone.position.y = 1.8 + i*0.9;
              cone.castShadow = true;
              cone.receiveShadow = true;
              group.add(cone);
            }
          } else if (type === 'oak' || type === 'cherry') {
            const color = type === 'oak' ? 0x4ade80 : 0xfbcfe8;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 1.5, 12), trunkMat);
            trunk.position.y = 0.75; group.add(trunk);
            const leafMat = new THREE.MeshStandardMaterial({color: color});
            const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 2), leafMat);
            crown.position.y = 2.2; group.add(crown);
            crown.castShadow = true;
            crown.receiveShadow = true;
          } else if (type === 'willow') {
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 2, 12), trunkMat);
            trunk.position.y = 1; group.add(trunk);
            const leafMat = new THREE.MeshStandardMaterial({color: 0x86efac});
            const top = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 2), leafMat);
            top.position.y = 2.2; group.add(top);
            top.castShadow = true;
            top.receiveShadow = true;
            for(let i=0; i<8; i++) {
              const branch = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.5, 8), leafMat);
              branch.position.set(Math.cos(i)*0.8, 1.5, Math.sin(i)*0.8);
              branch.rotation.x = Math.PI;
              branch.rotation.z = 0.2;
              branch.castShadow = true;
              branch.receiveShadow = true;
              group.add(branch);
            }
          } else if (type === 'bamboo') {
               const mat = new THREE.MeshStandardMaterial({color: 0x84cc16});
               for(let j=0; j<3; j++) {
                   const h = 2 + Math.random();
                   const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, h, 8), mat);
                   stalk.position.set((j-1)*0.4, h/2, (Math.random()-0.5)*0.4);
                   stalk.rotation.z = (Math.random() - 0.5) * 0.2;
                   stalk.castShadow = true;
                   stalk.receiveShadow = true;
                   group.add(stalk);
               }
          } else if (type === 'palm') {
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 3.5, 8), trunkMat);
            trunk.position.y = 1.75; trunk.rotation.z = 0.1; group.add(trunk);
            const leafMat = new THREE.MeshStandardMaterial({color: 0x15803d, side:THREE.DoubleSide});
            for(let i=0; i<8; i++) {
              const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 0.05), leafMat);
              leaf.position.set(0.2, 3.5, 0);
              leaf.rotation.z = Math.PI/4; leaf.rotation.y = i * (Math.PI/4); leaf.rotation.x = 0.5; 
              leaf.castShadow = true;
              leaf.receiveShadow = true;
              group.add(leaf);
            }
          } else if (type === 'cactus') {
            const mat = new THREE.MeshStandardMaterial({color: 0x16a34a});
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 2, 12), mat);
            body.position.y = 1; group.add(body);
            body.castShadow = true;
            body.receiveShadow = true;
            const top = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 2), mat);
            top.position.y = 2; group.add(top);
            top.castShadow = true;
            top.receiveShadow = true;
            // 添加多个手臂
            for(let i=0; i<3; i++) {
              const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8), mat);
              const angle = (i / 3) * Math.PI * 2;
              arm.position.set(Math.cos(angle)*0.5, 1.2 + i*0.2, Math.sin(angle)*0.5);
              arm.rotation.z = -Math.PI/4 + angle;
              arm.castShadow = true;
              arm.receiveShadow = true;
              group.add(arm);
            }
          } else if (type === 'mushroom') {
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1, 12), new THREE.MeshStandardMaterial({color: 0xffedd5}));
            stem.position.y = 0.5; group.add(stem);
            stem.castShadow = true;
            stem.receiveShadow = true;
            const cap = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1, 16), new THREE.MeshStandardMaterial({color: 0xff4757}));
            cap.position.y = 1.0; group.add(cap);
            cap.castShadow = true;
            cap.receiveShadow = true;
            // 添加多个斑点
            for(let i=0; i<5; i++) {
              const spot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 2), new THREE.MeshStandardMaterial({color:0xffffff}));
              const angle = (i / 5) * Math.PI * 2;
              const radius = 0.5 + Math.random() * 0.3;
              spot.position.set(Math.cos(angle)*radius, 1.1 + Math.random()*0.2, Math.sin(angle)*radius);
              spot.castShadow = true;
              spot.receiveShadow = true;
              group.add(spot);
            }
          } else if (type === 'sunflower') {
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.5, 8), new THREE.MeshStandardMaterial({color:0x4ade80}));
            stem.position.y = 1.25; group.add(stem);
            stem.castShadow = true;
            stem.receiveShadow = true;
            const head = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16), new THREE.MeshStandardMaterial({color:0xfacc15}));
            head.position.set(0, 2.5, 0.2); head.rotation.x = Math.PI/2.5; group.add(head);
            head.castShadow = true;
            head.receiveShadow = true;
            const center = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.15, 12), new THREE.MeshStandardMaterial({color: 0x78350f}));
            center.position.set(0, 2.5, 0.25); center.rotation.x = Math.PI/2.5; group.add(center);
            center.castShadow = true;
            center.receiveShadow = true;
            // 添加花瓣
            const petalMat = new THREE.MeshStandardMaterial({color:0xfbbf24});
            for(let i=0; i<12; i++) {
              const petal = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.8), petalMat);
              petal.position.set(0, 2.5, 0.2);
              petal.rotation.y = (i / 12) * Math.PI * 2;
              petal.rotation.x = Math.PI/2.5;
              petal.castShadow = true;
              petal.receiveShadow = true;
              group.add(petal);
            }
          } else if (type === 'birch') {
               const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 3, 12), new THREE.MeshStandardMaterial({color: 0xf1f5f9}));
               trunk.position.y = 1.5; group.add(trunk);
               trunk.castShadow = true;
               trunk.receiveShadow = true;
               // 添加多个斑点
               for(let i=0; i<5; i++) {
                 const spot = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.1, 0.1), new THREE.MeshStandardMaterial({color:0x1e293b}));
                 spot.position.set(0, 0.8 + i*0.4, 0.1);
                 spot.rotation.y = Math.random() * Math.PI;
                 group.add(spot);
               }
               const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 2), new THREE.MeshStandardMaterial({color:0xfcd34d}));
               crown.position.y = 3; group.add(crown);
               crown.castShadow = true;
               crown.receiveShadow = true;
          } else {
            return createPlant('pine');
          }
          return group;
        }

        function createAnimal(type: string) {
          const group = new THREE.Group();
          const mat = (col: number) => new THREE.MeshStandardMaterial({color:col});
          const geo = (w: number, h: number, d: number) => new THREE.BoxGeometry(w,h,d, 6, 6, 6);

          if (type === 'fox') {
            const body = new THREE.Mesh(geo(0.5, 0.4, 0.8), mat(0xf97316)); body.position.y = 0.4; group.add(body);
            body.castShadow = true;
            body.receiveShadow = true;
            const head = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 8), mat(0xf97316)); 
            head.position.set(0, 0.8, 0.5); head.rotation.x = -Math.PI/2; head.rotation.y = Math.PI/4; group.add(head);
            head.castShadow = true;
            head.receiveShadow = true;
            // 添加耳朵
            const ear1 = new THREE.Mesh(geo(0.15, 0.2, 0.1), mat(0x1f2937));
            ear1.position.set(0.2, 1.0, 0.4); ear1.rotation.z = Math.PI/4; group.add(ear1);
            ear1.castShadow = true;
            ear1.receiveShadow = true;
            const ear2 = ear1.clone();
            ear2.position.set(-0.2, 1.0, 0.4); ear2.rotation.z = -Math.PI/4; group.add(ear2);
            ear2.castShadow = true;
            ear2.receiveShadow = true;
            // 添加尾巴
            const tail = new THREE.Mesh(geo(0.3, 0.3, 0.7), mat(0xd97706)); tail.position.set(0, 0.6, -0.7); tail.rotation.x = 0.5; group.add(tail);
            tail.castShadow = true;
            tail.receiveShadow = true;
          } else if (type === 'rabbit') {
            const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 3), mat(0xffffff)); body.position.y = 0.4; group.add(body);
            body.castShadow = true;
            body.receiveShadow = true;
            const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 3), mat(0xffffff)); head.position.set(0, 0.7, 0.3); group.add(head);
            head.castShadow = true;
            head.receiveShadow = true;
            // 添加耳朵
            const ears = new THREE.Mesh(geo(0.1, 0.5, 0.1), mat(0xffffff)); ears.position.set(0.15, 1.1, 0.3); 
            ears.rotation.z = Math.PI/12; group.add(ears);
            ears.castShadow = true;
            ears.receiveShadow = true;
            const ears2 = ears.clone(); ears2.position.set(-0.15, 1.1, 0.3); 
            ears2.rotation.z = -Math.PI/12; group.add(ears2);
            ears2.castShadow = true;
            ears2.receiveShadow = true;
            // 添加眼睛
            const eye1 = new THREE.Mesh(geo(0.05, 0.05, 0.05), mat(0x1f2937));
            eye1.position.set(0.1, 0.7, 0.5); group.add(eye1);
            const eye2 = eye1.clone();
            eye2.position.set(-0.1, 0.7, 0.5); group.add(eye2);
          } else if (type === 'pig') {
            const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 3), mat(0xfbcfe8)); body.position.y = 0.4; group.add(body);
            body.castShadow = true;
            body.receiveShadow = true;
            const head = new THREE.Mesh(geo(0.4, 0.4, 0.4), mat(0xfbcfe8)); head.position.set(0, 0.5, 0.5); group.add(head);
            head.castShadow = true;
            head.receiveShadow = true;
            // 添加鼻子
            const nose = new THREE.Mesh(geo(0.2, 0.15, 0.15), mat(0xf9a8d4)); 
            nose.position.set(0, 0.5, 0.75); nose.rotation.x = Math.PI/2; group.add(nose);
            nose.castShadow = true;
            nose.receiveShadow = true;
            // 添加眼睛
            const eye1 = new THREE.Mesh(geo(0.08, 0.08, 0.08), mat(0x1f2937));
            eye1.position.set(0.15, 0.65, 0.5); group.add(eye1);
            const eye2 = eye1.clone();
            eye2.position.set(-0.15, 0.65, 0.5); group.add(eye2);
          } else if (type === 'panda') {
            const body = new THREE.Mesh(geo(0.7, 0.6, 1.0), mat(0xffffff)); body.position.y = 0.5; group.add(body);
            body.castShadow = true;
            body.receiveShadow = true;
            const head = new THREE.Mesh(geo(0.5, 0.4, 0.4), mat(0xffffff)); head.position.set(0, 0.8, 0.4); group.add(head);
            head.castShadow = true;
            head.receiveShadow = true;
            // 添加黑色的耳朵
            const ear = new THREE.Mesh(geo(0.15,0.15,0.1), mat(0x1f2937)); ear.position.set(0.2,1.0,0.4); group.add(ear);
            ear.castShadow = true;
            ear.receiveShadow = true;
            const ear2 = ear.clone(); ear2.position.set(-0.2,1.0,0.4); group.add(ear2);
            ear2.castShadow = true;
            ear2.receiveShadow = true;
            // 添加黑色的眼睛
            const eyePatch1 = new THREE.Mesh(geo(0.15, 0.15, 0.1), mat(0x1f2937));
            eyePatch1.position.set(0.15, 0.8, 0.6); group.add(eyePatch1);
            const eyePatch2 = eyePatch1.clone();
            eyePatch2.position.set(-0.15, 0.8, 0.6); group.add(eyePatch2);
            // 添加黑色的四肢
            const leg = new THREE.Mesh(geo(0.2,0.3,0.2), mat(0x1f2937)); leg.position.set(0.3,0.2,0.3); group.add(leg);
            leg.castShadow = true;
            leg.receiveShadow = true;
            const leg2 = leg.clone(); leg2.position.set(-0.3,0.2,0.3); group.add(leg2);
            leg2.castShadow = true;
            leg2.receiveShadow = true;
            const leg3 = leg.clone(); leg3.position.set(0.3,0.2,-0.3); group.add(leg3);
            leg3.castShadow = true;
            leg3.receiveShadow = true;
            const leg4 = leg.clone(); leg4.position.set(-0.3,0.2,-0.3); group.add(leg4);
            leg4.castShadow = true;
            leg4.receiveShadow = true;
          } else if (type === 'penguin') {
               const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.9, 12), mat(0x1f2937)); body.position.y = 0.45; group.add(body);
               body.castShadow = true;
               body.receiveShadow = true;
               const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.8, 12), mat(0xffffff)); belly.position.set(0,0.45,0.1); group.add(belly);
               belly.castShadow = true;
               belly.receiveShadow = true;
               const beak = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 8), mat(0xfacc15)); beak.position.set(0, 0.85, 0.25); beak.rotation.x = Math.PI/2; group.add(beak);
               beak.castShadow = true;
               beak.receiveShadow = true;
               // 添加眼睛
               const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), mat(0xffffff));
               eye1.position.set(0.1, 0.85, 0.15); group.add(eye1);
               const eye2 = eye1.clone();
               eye2.position.set(-0.1, 0.85, 0.15); group.add(eye2);
               // 添加黑色的眼珠
               const pupil1 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), mat(0x1f2937));
               pupil1.position.set(0.12, 0.85, 0.2); group.add(pupil1);
               const pupil2 = pupil1.clone();
               pupil2.position.set(-0.08, 0.85, 0.2); group.add(pupil2);
          } else if (type === 'frog') {
               const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 3), mat(0x4ade80)); body.position.y = 0.3; group.add(body);
               body.castShadow = true;
               body.receiveShadow = true;
               // 添加大眼睛
               const eye = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), mat(0xffffff));
               eye.position.set(0.15,0.55,0.15); group.add(eye);
               eye.castShadow = true;
               eye.receiveShadow = true;
               const eye2 = eye.clone();
               eye2.position.set(-0.15,0.55,0.15); group.add(eye2);
               eye2.castShadow = true;
               eye2.receiveShadow = true;
               // 添加黑色的眼珠
               const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), mat(0x1f2937));
               pupil.position.set(0.18, 0.55, 0.22); group.add(pupil);
               const pupil2 = pupil.clone();
               pupil2.position.set(-0.12, 0.55, 0.22); group.add(pupil2);
               // 添加嘴巴
               const mouth = new THREE.Mesh(geo(0.2, 0.05, 0.2), mat(0xf97316));
               mouth.position.set(0, 0.4, 0.1); group.add(mouth);
               mouth.castShadow = true;
               mouth.receiveShadow = true;
          } else if (type === 'bee') {
               const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 3), mat(0xfacc15)); body.position.y = 0.5; group.add(body);
               body.castShadow = true;
               body.receiveShadow = true;
               // 添加多个黑色条纹
               for(let i=0; i<3; i++) {
                 const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.05, 8, 12), mat(0x000000)); 
                 stripe.position.y = 0.5 + (i-1)*0.1; stripe.rotation.x=Math.PI/2; group.add(stripe);
                 stripe.castShadow = true;
                 stripe.receiveShadow = true;
               }
               // 添加透明的翅膀
               const wing = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), new THREE.MeshBasicMaterial({color:0xffffff, opacity:0.8, transparent:true, side:THREE.DoubleSide}));
               wing.position.set(0, 0.7, 0); wing.rotation.x=Math.PI/2; group.add(wing);
               wing.castShadow = true;
               const wing2 = wing.clone();
               wing2.position.set(0, 0.7, 0.1); wing2.rotation.z=Math.PI/4; group.add(wing2);
               wing2.castShadow = true;
          } else if (type === 'sheep') {
               const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 3), mat(0xffffff)); body.position.y = 0.5; group.add(body);
               body.castShadow = true;
               body.receiveShadow = true;
               // 添加更多的羊毛效果
               for(let i=0; i<12; i++) {
                 const wool = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), mat(0xffffff));
                 const angle = (i / 12) * Math.PI * 2;
                 const radius = 0.55;
                 wool.position.set(Math.cos(angle)*radius, 0.5 + Math.random()*0.1, Math.sin(angle)*radius);
                 wool.castShadow = true;
                 wool.receiveShadow = true;
                 group.add(wool);
               }
               const head = new THREE.Mesh(geo(0.3, 0.3, 0.35), mat(0x1f2937)); head.position.set(0, 0.6, 0.4); group.add(head);
               head.castShadow = true;
               head.receiveShadow = true;
               // 添加耳朵
               const ear1 = new THREE.Mesh(geo(0.1, 0.15, 0.05), mat(0x1f2937));
               ear1.position.set(0.2, 0.7, 0.3); ear1.rotation.z = Math.PI/6; group.add(ear1);
               ear1.castShadow = true;
               ear1.receiveShadow = true;
               const ear2 = ear1.clone();
               ear2.position.set(-0.2, 0.7, 0.3); ear2.rotation.z = -Math.PI/6; group.add(ear2);
               ear2.castShadow = true;
               ear2.receiveShadow = true;
          } else if (type === 'bear') {
               const body = new THREE.Mesh(geo(0.7, 0.6, 1.0), mat(0x78350f)); body.position.y = 0.5; group.add(body);
               body.castShadow = true;
               body.receiveShadow = true;
               const head = new THREE.Mesh(geo(0.5, 0.4, 0.4), mat(0x78350f)); head.position.set(0, 0.7, 0.5); group.add(head);
               head.castShadow = true;
               head.receiveShadow = true;
               // 添加耳朵
               const ear1 = new THREE.Mesh(geo(0.2, 0.2, 0.1), mat(0x374151));
               ear1.position.set(0.25, 0.9, 0.4); ear1.rotation.z = Math.PI/6; group.add(ear1);
               ear1.castShadow = true;
               ear1.receiveShadow = true;
               const ear2 = ear1.clone();
               ear2.position.set(-0.25, 0.9, 0.4); ear2.rotation.z = -Math.PI/6; group.add(ear2);
               ear2.castShadow = true;
               ear2.receiveShadow = true;
               // 添加鼻子
               const snout = new THREE.Mesh(geo(0.2, 0.15, 0.15), mat(0x374151)); 
               snout.position.set(0, 0.7, 0.75); group.add(snout);
               snout.castShadow = true;
               snout.receiveShadow = true;
               // 添加眼睛
               const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), mat(0xffffff));
               eye1.position.set(0.15, 0.8, 0.6); group.add(eye1);
               const eye2 = eye1.clone();
               eye2.position.set(-0.15, 0.8, 0.6); group.add(eye2);
               // 添加黑色的眼珠
               const pupil1 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), mat(0x1f2937));
               pupil1.position.set(0.17, 0.8, 0.64); group.add(pupil1);
               const pupil2 = pupil1.clone();
               pupil2.position.set(-0.13, 0.8, 0.64); group.add(pupil2);
          } else {
               // 小鸡
               const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 3), mat(0xfacc15)); body.position.y = 0.3; group.add(body);
               body.castShadow = true;
               body.receiveShadow = true;
               // 添加黄色的嘴巴
               const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05,0.1, 8), mat(0xf97316)); beak.position.set(0,0.4,0.25); beak.rotation.x=Math.PI/2; group.add(beak);
               beak.castShadow = true;
               beak.receiveShadow = true;
               // 添加眼睛
               const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), mat(0x1f2937));
               eye1.position.set(0.1, 0.45, 0.25); group.add(eye1);
               const eye2 = eye1.clone();
               eye2.position.set(-0.1, 0.45, 0.25); group.add(eye2);
               // 添加鸡冠
               const comb = new THREE.Mesh(geo(0.1, 0.15, 0.05), mat(0xef4444));
               comb.position.set(0, 0.5, 0.15); group.add(comb);
               comb.castShadow = true;
               comb.receiveShadow = true;
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
          // 移除场景中所有名为'previewMesh'的对象，确保彻底清理
          scene.traverse((object) => {
            if (object.name === 'previewMesh') {
              if (object.parent) {
                object.parent.remove(object);
              }
            }
          });
          
          // 获取番茄模型，检查是否处于专注模式
          const tomatoMesh = scene.getObjectByName('tomatoMesh');
          const isFocusMode = tomatoMesh && tomatoMesh.visible;
          
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
              // 非专注模式：直接显示在大陆中心
              newPreviewMesh.position.set(0, 3, 0);
              newPreviewMesh.scale.set(2.5, 2.5, 2.5);
              newPreviewMesh.castShadow = true;
              newPreviewMesh.receiveShadow = true;
              newPreviewMesh.renderOrder = 1000;
              scene.add(newPreviewMesh);
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
          if (renderer && canvasContainerRef.current) {
            canvasContainerRef.current.removeChild(renderer.domElement);
            renderer.dispose();
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

  // 添加专门处理totalPlants变化的useEffect
  useEffect(() => {
    if (canvasContainerRef.current && isLoaded) {
      const initRandomEcosystem = (canvasContainerRef.current as any)._initRandomEcosystem;
      if (initRandomEcosystem) {
        initRandomEcosystem(totalPlants);
      }
    }
  }, [totalPlants, isLoaded]);
  
  // 当场景初始化完成后，确保生态系统与当前totalPlants同步
  useEffect(() => {
    if (canvasContainerRef.current && isLoaded) {
      const initRandomEcosystem = (canvasContainerRef.current as any)._initRandomEcosystem;
      if (initRandomEcosystem) {
        initRandomEcosystem(totalPlants);
      }
    }
  }, [isLoaded, totalPlants]);
  
  // 当外部props变化时，同步更新内部状态
  useEffect(() => {
    setIsFocusing(isActive);
    setSecondsRemaining(timeLeft);
    setCurrentDuration(duration * 60);
  }, [timeLeft, isActive, duration]);
  
  // 当主题变化时，更新3D场景和UI元素
  useEffect(() => {
    if (canvasContainerRef.current && isLoaded) {
      const updateSceneColors = (canvasContainerRef.current as any)._updateSceneColors;
      if (updateSceneColors) {
        updateSceneColors();
      }
    }
  }, [theme, isLoaded]);

  // 移除重复的useEffect，只保留一个处理currentSeed变化的useEffect

  // 音频管理 - 使用统一的音效管理库
  useEffect(() => {
    if (localCurrentSoundId === 'mute') {
      // 停止所有背景音乐
      soundManager.stopCurrentBackgroundMusic();
    } else {
      // 播放对应的背景音乐
      soundManager.playBackgroundMusic(localCurrentSoundId);
    }
  }, [localCurrentSoundId]);
  
  // 移除重复的音频源变化处理useEffect，合并到上面的主逻辑中

  // 计时器管理 - 只在组件挂载时初始化一次，避免外部props覆盖内部状态更新
  useEffect(() => {
    setIsFocusing(isActive);
    setSecondsRemaining(timeLeft);
    setCurrentDuration(duration * 60);
  }, []);

  // 计时器效果
  useEffect(() => {
    let interval: number;
    if (isFocusing && !isPaused && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining(prev => {
          const newTime = prev - 1;
          onUpdateTimeLeft(newTime);
          if (newTime <= 0) {
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
                    setTimeout(animateScale, 500);
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
            
            // 不调用onUpdateIsActive(false)，保持在沉浸式界面
            // 重置计时器，但不退出沉浸式界面
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
    return () => clearInterval(interval);
  }, [isFocusing, isPaused, secondsRemaining, onUpdateTimeLeft, currentSeed, totalPlants, onUpdateTotalPlants, todayPlants, onUpdateTodayPlants, currentDuration]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 设置音效
  const setSound = (type: string) => {
    // 更新本地音效状态
    setLocalCurrentSoundId(type);
    // 关闭音频菜单
    setIsAudioMenuOpen(false);
  };

  // 选择种子
  const selectSeed = (type: string) => {
    setCurrentSeed(type);
  };

  // 当选择的种子变化或组件状态改变时，更新预览模型
  useEffect(() => {
    if (canvasContainerRef.current && isLoaded) {
      const updatePreview = (canvasContainerRef.current as any)._updatePreview;
      if (updatePreview) {
        updatePreview(currentSeed);
      }
    }
  }, [currentSeed, isLoaded]);

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
          if (scene) {
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
    setIsPaused(!isPaused);
    
    // 如果暂停，显示预览模型；如果继续，隐藏预览模型
    const updateScene = async () => {
      try {
        const THREE = await import('three');
        if (canvasContainerRef.current) {
          const scene = (canvasContainerRef.current as any)._scene;
          if (scene) {
            if (!isPaused) {
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
            } else {
              // 暂停，显示预览模型
              const previewMesh = scene.getObjectByName('previewMesh');
              if (!previewMesh) {
                // 调用全局的updatePreview函数
                const updatePreview = (canvasContainerRef.current as any)._updatePreview;
                if (updatePreview) {
                  updatePreview(currentSeed);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error updating scene:', error);
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
          if (scene) {
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
        // 如果提供了回调函数，调用它更新父组件状态
        if (onUpdateTotalPlants) {
          onUpdateTotalPlants(value);
        }
      } else {
        // 更新本地状态
        setTodayPlants(value);
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

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${theme === 'dark' ? 'bg-[#1a1a2e] text-white' : 'bg-[#e0e5ec] text-gray-800'}`}>
      {/* 主容器 - 直接显示，无加载状态 */}
      <div ref={containerRef} className="relative inset-0">
        {/* Canvas容器 */}
        <div ref={canvasContainerRef} id="canvas-container" className="absolute inset-0"></div>
        
        {/* 退出按钮 */}
        <div className="exit-btn" id="exitBtn" onClick={onExitImmersive}>✕</div>
        
        {/* 帮助按钮和指南 */}
        <div className={`help-btn ${isFocusing ? 'hidden' : ''}`} id="helpBtn" onClick={() => {
          const guideCard = document.getElementById('guideCard');
          if (guideCard) {
            guideCard.classList.toggle('show');
          }
        }}>?</div>
        <div className="guide-card neu-out" id="guideCard">
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
          {/* 顶部数据栏 */}
          <div className={`stats-bar ${isFocusing ? 'hidden' : ''}`}>
            <div 
              ref={totalPlantsRef}
              className="neu-out stats-panel" 
              id="statsTotal"
              onDoubleClick={startEditTotal}
            >
              <span>🌲 总数</span>
              {isEditingTotal ? (
                <div className="highlight-num edit-mode">
                  <input 
                    type="number" 
                    min="0" 
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => saveEdit('total')}
                    onKeyDown={(e) => handleInputKeyDown(e, 'total')}
                    className="edit-input"
                  />
                </div>
              ) : (
                <span className="highlight-num" id="totalCount">{totalPlants}</span>
              )}
            </div>
            <div 
              ref={todayPlantsRef}
              className="neu-out stats-panel" 
              id="statsToday"
              onDoubleClick={startEditToday}
            >
              <span>☀️ 今日</span>
              {isEditingToday ? (
                <div className="highlight-num edit-mode">
                  <input 
                    type="number" 
                    min="0" 
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => saveEdit('today')}
                    onKeyDown={(e) => handleInputKeyDown(e, 'today')}
                    className="edit-input"
                  />
                </div>
              ) : (
                <span className="highlight-num" id="todayCount">{todayPlants}</span>
              )}
            </div>
          </div>
          


          {/* 底部控制 */}
          <div className="controls">
            {/* 预设时间 + 音乐 */}
            <div className={`controls-row ${isFocusing ? 'hidden' : ''}`} id="controlsRow">
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
                <div className={`neu-out audio-menu ${isAudioMenuOpen ? 'show' : ''}`}>
                  <div className={`audio-item ${localCurrentSoundId === 'mute' ? 'selected' : ''}`} onClick={() => setSound('mute')}>🔇 静音</div>
                  <div className={`audio-item ${localCurrentSoundId === 'forest' ? 'selected' : ''}`} onClick={() => setSound('forest')}>🌲 迷雾森林</div>
                  <div className={`audio-item ${localCurrentSoundId === 'alpha' ? 'selected' : ''}`} onClick={() => setSound('alpha')}>🧠 阿尔法波</div>
                  <div className={`audio-item ${localCurrentSoundId === 'theta' ? 'selected' : ''}`} onClick={() => setSound('theta')}>🧘 希塔波</div>
                  <div className={`audio-item ${localCurrentSoundId === 'beta' ? 'selected' : ''}`} onClick={() => setSound('beta')}>💪 贝塔波</div>
                  <div className={`audio-item ${localCurrentSoundId === 'ocean' ? 'selected' : ''}`} onClick={() => setSound('ocean')}>🌊 海浪声</div>
                </div>
              </div>
            </div>
            
            {/* 核心：悬浮能量环 */}
            <div 
              className={`focus-ring-container ${isFocusing ? 'focusing' : ''} ${isPaused ? 'paused' : ''}`} 
              id="focusRing"
              onClick={isFocusing ? pauseFocus : startFocus}
              onDoubleClick={resetFocus}
            >
              {/* Tooltip */}
              <div className="timer-tooltip">双击数字修改 / 单击开始 / 双击圆环暂停</div>
              
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
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if(isFocusing || isPaused) resetFocus();
                    
                    const input = prompt("请输入专注时长（秒）：", currentDuration.toString());
                    if (input && !isNaN(Number(input)) && Number(input) > 0) {
                      const newDuration = parseInt(input);
                      setCurrentDuration(newDuration);
                      setSecondsRemaining(newDuration);
                      onUpdateTimeLeft(newDuration);
                    }
                  }}
                >{formatTime(secondsRemaining)}</div>
                <div className="status-text" id="statusText">
                  {isFocusing ? (isPaused ? '已暂停 (单击继续)' : '专注生长中...') : '点击开始'}
                </div>
              </div>
            </div>
          </div>

          {/* 侧边种子选择 */}
          <div className={`neu-out seed-selector ${isFocusing ? 'hidden' : ''}`} id="seedSelector">
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

        #canvas-container {
          width: 100vw;
          height: 100vh;
          display: block;
        }

        .ui-container {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 30px;
          box-sizing: border-box;
          z-index: 10;
        }

        .neu-out {
          background: var(--bg-color);
          border-radius: 16px;
          box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .stats-bar {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
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
        }
        
        .stats-panel:hover { transform: translateY(-2px); background: var(--bg-color); }
        .stats-panel:active { transform: scale(0.98); }

        .highlight-num {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main);
          text-shadow: none;
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
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: translateX(0); opacity: 1;
          z-index: 100;
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
        .seed-icon { font-size: 16px; width: 20px; text-align: center; }
        .seed-name { font-size: 11px; font-weight: 600; }

        .controls {
          pointer-events: auto;
          align-self: center; text-align: center; position: absolute;
          bottom: -780px;left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 35px;
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
          color: var(--text-gray);
          font-family: 'Segoe UI', Roboto, sans-serif;
          font-variant-numeric: tabular-nums;
          margin-bottom: 2px;
          letter-spacing: -1px;
          text-shadow: none;
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
          bottom: -80px;
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
        }
        .focus-ring-container:hover .timer-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
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
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: translateY(0); opacity: 1;
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

        .audio-dropdown { position: relative; }
        .audio-btn {
          background: var(--bg-color); border: none; border-radius: 50%;
          width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 18px; color: var(--text-sub);
          box-shadow: 4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light);
          transition: transform 0.3s ease, color 0.3s ease;
        }
        .audio-btn:hover { color: var(--primary-green); transform: scale(1.1); }

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
        
        .help-btn:active {
          transform: scale(0.95);
        }
        
        .help-btn.hidden {
          opacity: 0;
          pointer-events: none;
          transform: scale(0.9);
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