import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// 从speciesData导入种子数据
import { SPECIES } from '../data/speciesData';

// 定义3D场景对象类型
export interface SceneObject {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  type: string;
  userData?: any;
}

// 定义主题颜色类型
export interface ThemeColors {
  bgColor: number;
  groundColor: number;
  grassColor: number;
  neuBgColor: number;
}

// LOD级别枚举
export enum LODLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  VERY_LOW = 'very_low'
}

export class SceneManager {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private controls: OrbitControls | null = null;
  private animationFrameId: number = 0;
  private entities: THREE.Object3D[] = [];
  private previewMesh: THREE.Mesh | null = null;
  private ground: THREE.Mesh | null = null;
  private tomatoMesh: THREE.Mesh | null = null;
  private sceneObjects: SceneObject[] = [];
  private isFocusing: boolean = false;
  private isPaused: boolean = false;
  private currentSeed: string = 'pine';
  private totalPlants: number = 0;
  private theme: string = 'light';
  
  // LOD距离阈值
  private lodDistances = {
    high: 10,
    medium: 25,
    low: 50,
    veryLow: 100
  };

  /**
   * 初始化3D场景
   * @param canvas HTMLCanvasElement
   * @param container HTMLDivElement
   */
  public init(canvas: HTMLCanvasElement, container: HTMLDivElement): void {
    try {
      // 创建场景
      this.scene = new THREE.Scene();
      // 设置初始背景颜色
      this.scene.background = new THREE.Color(0xffffff);
      
      // 创建相机
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const aspect = (containerWidth > 0 && containerHeight > 0) 
        ? containerWidth / containerHeight 
        : window.innerWidth / window.innerHeight;
      
      this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
      this.camera.position.set(0, 60, 120);
      
      // 创建渲染器
      this.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false
      });
      
      const renderWidth = containerWidth > 0 ? containerWidth : window.innerWidth;
      const renderHeight = containerHeight > 0 ? containerHeight : window.innerHeight;
      this.renderer.setSize(renderWidth, renderHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      // 优化阴影渲染设置
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      // 调整阴影的自动更新频率，提高性能
      this.renderer.shadowMap.autoUpdate = true;
      
      // 启用阴影的PCF过滤，提高阴影质量
      this.renderer.shadowMap.needsUpdate = true;
      
      // 调整渲染器的色调映射和曝光
      this.renderer.toneMapping = THREE.NoToneMapping;
      this.renderer.toneMappingExposure = 1.0;
      this.renderer.setClearColor(0xffffff, 1);
      
      // 启用精确阴影计算
      this.renderer.localClippingEnabled = false;
      this.renderer.sortObjects = true;
      
      // 确保canvas元素的touch-action属性正确设置
      canvas.style.touchAction = 'none';
      canvas.style.pointerEvents = 'auto';
      canvas.style.zIndex = '10';
      canvas.style.position = 'relative';
      
      // 添加光照
      this.setupLighting();
      
      // 创建地面
      this.createGround();
      
      // 创建番茄
      this.createTomato();
      
      // 添加控制器
      this.setupControls(canvas);
      
      // 开始渲染循环
      this.animate();
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => this.handleResize(container));
      
    } catch (error) {
      console.error('Failed to initialize 3D scene:', error);
    }
  }

  /**
   * 设置光照 - 修复炫光和黑影问题
   */
  private setupLighting(): void {
    if (!this.scene) return;
    
    // 移除所有现有光源，重新设置
    this.scene.children.forEach(child => {
      if (child instanceof THREE.Light) {
        this.scene!.remove(child);
      }
    });
    
    // 环境光 - 使用柔和的白色，避免色彩偏差
    const ambientLight = new THREE.AmbientLight(
      0xffffff, 
      0.7       // 增加环境光强度，减少黑影
    );
    this.scene.add(ambientLight);
    
    // 主光源（太阳） - 调整强度，平衡光照
    const sunLight = new THREE.DirectionalLight(
      0xffffff, 
      1.0       // 增加主光源强度，减少黑影
    );
    sunLight.position.set(50, 100, 50); // 调整光源位置，提高光照角度
    sunLight.castShadow = true;
    
    // 优化阴影贴图分辨率和相机参数
    sunLight.shadow.mapSize.width = 4096; // 增加阴影贴图分辨率，提高阴影质量
    sunLight.shadow.mapSize.height = 4096;
    
    // 调整阴影相机视锥体，确保在不同缩放级别下阴影都能正确渲染
    const shadowCamera = sunLight.shadow.camera as THREE.OrthographicCamera;
    shadowCamera.left = -300;  // 大幅增加视锥体范围
    shadowCamera.right = 300;
    shadowCamera.top = 300;
    shadowCamera.bottom = -300;
    shadowCamera.near = 0.1;
    shadowCamera.far = 400;    // 增加远平面，确保远距离物体也能接收阴影
    
    // 调整阴影偏移和模糊半径，优化阴影质量
    sunLight.shadow.bias = -0.0001; // 调整阴影偏移，减少阴影失真
    sunLight.shadow.radius = 2;     // 适当增加阴影模糊，提高视觉效果
    
    // 启用阴影贴图的自动更新
    sunLight.shadow.autoUpdate = true;
    
    this.scene.add(sunLight);
    
    // 添加辅助填充光，减少深色区域
    const fillLight = new THREE.DirectionalLight(
      0xffffff, 
      0.3       // 柔和的填充光，减少黑影
    );
    fillLight.position.set(-50, 50, -50); // 与主光源相反方向
    this.scene.add(fillLight);
    
    // 简化光照系统，只保留必要光源
  }

  /**
   * 创建地面 - 修复渲染异常问题
   */
  private createGround(): void {
    if (!this.scene) return;
    
    const GROUND_SIZE = 180;
    const colors = this.getThemeColors();
    
    // 简化地面几何体，减少顶点数量，避免渲染异常
    const groundGeometry = new THREE.CylinderGeometry(
      GROUND_SIZE / 2, 
      GROUND_SIZE / 2, 
      5, 
      32 // 减少分段数，降低渲染压力
    );
    
    // 创建地面材质 - 使用简单的颜色材质，避免顶点颜色导致的渲染问题
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x8D6E63,  // 使用单一深褐色，避免顶点颜色问题
      roughness: 0.95,
      metalness: 0.0,
      side: THREE.DoubleSide,
      flatShading: false,
      vertexColors: false  // 禁用顶点颜色，避免渲染异常
    });
    
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.position.set(0, 0, 0);
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
    
    // 创建草地 - 简化草地材质
    const grassGeometry = new THREE.CircleGeometry(GROUND_SIZE / 2 - 0.5, 32); // 减少分段数
    const grassMaterial = new THREE.MeshStandardMaterial({
      color: colors.grassColor,
      roughness: 0.9,
      metalness: 0.0,
      side: THREE.DoubleSide,
      flatShading: false
    });
    
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.position.set(0, 2.51, 0);
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    this.ground.add(grass);
    
    // 添加草簇和岩石细节
    this.addGroundDetails();
  }
  


  /**
   * 添加地面细节
   */
  private addGroundDetails(): void {
    if (!this.ground) return;
    
    const GROUND_SIZE = 180;
    
    // 添加多种类型的草簇
    const grassTypes = [
      { geometry: new THREE.ConeGeometry(0.2, 0.4, 8), color: 0x689f38, count: 100 },
      { geometry: new THREE.ConeGeometry(0.15, 0.3, 6), color: 0x558b2f, count: 80 },
      { geometry: new THREE.ConeGeometry(0.25, 0.5, 10), color: 0x7cb342, count: 60 },
      { geometry: new THREE.CylinderGeometry(0.1, 0.15, 0.3, 4), color: 0x43a047, count: 50 }
    ];
    
    grassTypes.forEach(grassType => {
      const grassClumpMaterial = new THREE.MeshStandardMaterial({
        color: grassType.color,
        roughness: 0.9,
        metalness: 0.05
      });
      
      for (let i = 0; i < grassType.count; i++) {
        const grassClump = new THREE.Mesh(grassType.geometry, grassClumpMaterial);
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (GROUND_SIZE / 2 - 1);
        grassClump.position.set(
          Math.cos(angle) * radius,
          2.5,
          Math.sin(angle) * radius
        );
        grassClump.rotation.y = Math.random() * Math.PI * 2;
        grassClump.rotation.x = (Math.random() - 0.5) * 0.2;
        grassClump.castShadow = true;
        grassClump.receiveShadow = true;
        this.ground!.add(grassClump);
      }
    });
    
    // 添加岩石
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x616161,
      roughness: 0.95,
      metalness: 0.1
    });
    
    for (let i = 0; i < 30; i++) {
      const rockGeometry = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.2, 0);
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (GROUND_SIZE / 2 - 2);
      rock.position.set(
        Math.cos(angle) * radius,
        2.5,
        Math.sin(angle) * radius
      );
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.ground!.add(rock);
    }
  }

  /**
   * 创建番茄
   */
  private createTomato(): void {
    if (!this.scene) return;
    
    const tomatoGeometry = new THREE.SphereGeometry(2, 32, 32);
    const tomatoMaterial = new THREE.MeshStandardMaterial({
      color: 0xff5722,
      roughness: 0.5,
      metalness: 0.1
    });
    
    this.tomatoMesh = new THREE.Mesh(tomatoGeometry, tomatoMaterial);
    this.tomatoMesh.name = 'tomatoMesh';
    this.tomatoMesh.position.set(0, 2, 0);
    this.tomatoMesh.castShadow = true;
    this.tomatoMesh.visible = false;
    this.scene.add(this.tomatoMesh);
  }

  /**
   * 设置控制器
   */
  private setupControls(canvas: HTMLCanvasElement): void {
    if (!this.camera || !this.renderer) return;
    
    this.controls = new OrbitControls(this.camera, canvas as HTMLElement);
    
    // 优化OrbitControls配置，提高流畅度
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.15; // 增加阻尼系数，使旋转更平滑
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.1; // 适当提高旋转速度
    this.controls.enablePan = true; // 启用平移，方便查看细节
    this.controls.enableZoom = true;
    this.controls.enableRotate = true;
    this.controls.minDistance = 30; // 减小最小距离，允许放大到更近
    this.controls.maxDistance = 200; // 增加最大距离，允许缩小查看全景
    this.controls.zoomSpeed = 1.5; // 提高缩放速度，方便快速放大缩小
    this.controls.screenSpacePanning = false;
    this.controls.minPolarAngle = Math.PI / 6; // 放宽垂直视角范围
    this.controls.maxPolarAngle = Math.PI / 2.2;
    
    // 减少不必要的事件监听器，提高性能
    let isUserInteracting = false;
    let interactionTimeout: ReturnType<typeof setTimeout> | null = null;
    
    this.controls.addEventListener('start', () => {
      isUserInteracting = true;
      this.controls!.autoRotate = false;
      if (interactionTimeout) {
        clearTimeout(interactionTimeout);
        interactionTimeout = null;
      }
    });
    
    this.controls.addEventListener('end', () => {
      isUserInteracting = false;
      interactionTimeout = setTimeout(() => {
        if (!isUserInteracting && this.controls) {
          this.controls.autoRotate = true;
        }
      }, 3000); // 延长恢复自动旋转的时间，减少频繁切换
    });
    
    // 优化鼠标滚轮事件，支持缩放和旋转速度调整
    let wheelTimeout: ReturnType<typeof setTimeout> | null = null;
    canvas.addEventListener('wheel', (event) => {
      // 允许浏览器默认处理缩放事件，这样OrbitControls可以正常响应缩放
      // event.preventDefault();  // 移除这个，允许缩放
      
      // 仅在按住特定键时调整旋转速度，避免与缩放冲突
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault(); // 按住Ctrl/Cmd键时，阻止默认缩放，用于调整旋转速度
        if (wheelTimeout) {
          clearTimeout(wheelTimeout);
        }
        wheelTimeout = setTimeout(() => {
          if (!this.controls) return;
          if (event.deltaY < 0) {
            this.controls.autoRotateSpeed = Math.min(3.0, this.controls.autoRotateSpeed + 0.3);
          } else {
            this.controls.autoRotateSpeed = Math.max(0.05, this.controls.autoRotateSpeed - 0.3);
          }
        }, 50); // 减少节流时间，提高响应速度
      }
    });
    
    this.controls.update();
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(container: HTMLDivElement): void {
    if (!this.camera || !this.renderer) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    if (width > 0 && height > 0) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  /**
   * 获取主题颜色 - 与系统主题色保持一致
   */
  private getThemeColors(): ThemeColors {
    // Forest风格色彩系统
    const forestGreen = 0x4CAF50; // 主色调：森林绿，象征自然、成长和生机
    
    // 土壤色系 - 形成完整的土壤色彩梯度
    const lightBrown = 0xA1887F;   // 浅褐色
    const earthYellow = 0xD7CCC8;  // 土黄色
    const darkBrown = 0x8D6E63;    // 深褐色
    
    // 根据当前主题返回不同的背景颜色，与系统主题色保持一致
    let bgColor = 0xE0E5EC; // 拟态浅色主题：#e0e5ec
    let neuBgColor = 0xE0E5EC;
    
    if (this.theme && this.theme.includes('dark')) {
      // 拟态深色主题：#1e1e2e
      bgColor = 0x1E1E2E;
      neuBgColor = 0x1E1E2E;
    } else if (this.theme === 'light') {
      // 传统浅色主题：白色
      bgColor = 0xFFFFFF;
      neuBgColor = 0xFFFFFF;
    } else if (this.theme === 'dark') {
      // 传统深色主题：#0f172a
      bgColor = 0x0F172A;
      neuBgColor = 0x0F172A;
    }
    
    return {
      bgColor,
      groundColor: darkBrown,   // 使用深褐色作为主要土壤颜色
      grassColor: forestGreen,  // 使用森林绿作为草地颜色
      neuBgColor
    };
  }

  /**
   * 更新主题
   */
  public updateTheme(theme: string, isFocusing: boolean, isPaused: boolean): void {
    if (!this.scene || !this.renderer) return;
    
    this.theme = theme;
    this.isFocusing = isFocusing;
    this.isPaused = isPaused;
    
    const colors = this.getThemeColors();
    const isFullFocusMode = isFocusing && !isPaused;
    
    // 使用与系统主题一致的背景颜色，专注模式下保持相同主题色
    let bgColor = colors.bgColor;
    
    // 更新场景背景颜色
    if (!this.scene.background) {
      this.scene.background = new THREE.Color();
    }
    if (this.scene.background instanceof THREE.Color) {
      this.scene.background.set(bgColor);
    }
    this.scene.fog = null;
    
    // 更新渲染器清除颜色
    this.renderer.setClearColor(bgColor, 1);
    
    // 更新光照亮度，模拟白天/黑夜效果
    this.updateLightingIntensity();
    
    // 更新地面颜色（保持3D大陆本身颜色不变）
    if (this.ground) {
      (this.ground.material as THREE.MeshStandardMaterial).color.set(colors.groundColor);
      
      // 更新草地颜色
      if (this.ground.children && this.ground.children.length > 0) {
        const grass = this.ground.children[0];
        if (grass instanceof THREE.Mesh && grass.material) {
          (grass.material as THREE.MeshStandardMaterial).color.set(colors.grassColor);
        }
      }
    }
  }
  
  /**
   * 更新光照亮度，根据主题模拟白天/黑夜效果
   */
  private updateLightingIntensity(): void {
    if (!this.scene) return;
    
    // 根据主题设置光照强度和颜色
    const isDarkTheme = this.theme && this.theme.includes('dark');
    
    // 白天/黑夜的光照参数 - 增加深色模式下的光照强度，确保能看清动植物
    const ambientParams = isDarkTheme 
      ? { intensity: 0.6, color: 0x666688 }  // 夜晚：亮蓝色，增加强度
      : { intensity: 0.6, color: 0xffffff };  // 白天：白色
    
    const sunParams = isDarkTheme 
      ? { intensity: 0.8, color: 0x8888aa }  // 夜晚：亮蓝色，增加强度
      : { intensity: 1.0, color: 0xffffff };  // 白天：白色
    
    const fillParams = isDarkTheme 
      ? { intensity: 0.6, color: 0x666677 }  // 夜晚：亮灰色，增加强度
      : { intensity: 0.8, color: 0xffffff };  // 白天：白色
    
    const hemisphereParams = isDarkTheme 
      ? { intensity: 0.6, color: 0x444466, groundColor: 0x222244 }  // 夜晚：亮蓝色地面，增加强度
      : { intensity: 0.8, color: 0xffffff, groundColor: 0x8d6e63 };  // 白天：白色，棕色地面
    
    // 更新所有灯光
    this.scene.traverse((child: any) => {
      if (child.isAmbientLight) {
        child.intensity = ambientParams.intensity;
        child.color.set(ambientParams.color);
      } else if (child.isDirectionalLight) {
        // 区分主光源和填充光
        if (child.position.y > 50) {
          // 主光源（太阳）
          child.intensity = sunParams.intensity;
          child.color.set(sunParams.color);
        } else {
          // 填充光
          child.intensity = fillParams.intensity;
          child.color.set(fillParams.color);
        }
      } else if (child.isHemisphereLight) {
        child.intensity = hemisphereParams.intensity;
        child.color.set(hemisphereParams.color);
        child.groundColor.set(hemisphereParams.groundColor);
      }
    });
  }

  /**
   * 创建植物
   */
  private createPlant(type: string): THREE.Group {
    const group = new THREE.Group();
    
    // 获取基础材质
    const getBaseMaterial = (color: number, roughness: number = 0.8, metalness: number = 0.1, side: any = THREE.FrontSide) => {
      return new THREE.MeshStandardMaterial({
        color: color,
        roughness: roughness,
        metalness: metalness,
        side: side,
        transparent: false,
        opacity: 1.0,
        emissive: 0x000000,
        emissiveIntensity: 0.0
      });
    };
    
    // 处理植物ID，支持"名称+数字"格式
    const baseType = type.replace(/\d+$/, '');
    
    if (baseType === 'pine') {
      if (type === 'pine') {
        // 松树1
        const trunkMaterial = getBaseMaterial(0x5c4033, 0.9, 0.1);
        
        // 树干
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 1.2, 12), trunkMaterial);
        trunk.position.y = 0.6;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        group.add(trunk);
        
        // 树冠 - 传统圆锥形状
        const needleMaterial = getBaseMaterial(0x2d6a4f, 0.8, 0.1);
        
        for(let i = 0; i < 4; i++) {
          const size = 1.5 - i * 0.3;
          const height = 1.8 + i * 0.8;
          
          const cone = new THREE.Mesh(new THREE.ConeGeometry(size, 1.8, 8), needleMaterial);
          cone.position.y = height;
          cone.castShadow = true;
          cone.receiveShadow = true;
          group.add(cone);
        }
        
        // 松果
        const pineconeMaterial = getBaseMaterial(0x8B4513, 0.9, 0.05);
        const pinecone = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 8), pineconeMaterial);
        pinecone.position.set(0, 1.2, 0);
        pinecone.rotation.x = Math.PI;
        pinecone.castShadow = true;
        pinecone.receiveShadow = true;
        group.add(pinecone);
      } else if (type === 'pine2') {
        // 松树2 - 优化版，使用多层圆锥体叠加，更具松树特色
        const trunkMaterial = getBaseMaterial(0x654321, 0.95, 0.05);
        
        // 树干 - 更粗壮，带有纹理感
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.25, 0.45, 2.0, 16), 
          trunkMaterial
        );
        trunk.position.y = 1.0;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        group.add(trunk);
        
        // 树冠 - 使用多层圆锥体叠加，更具松树特征
        const needleMaterial = getBaseMaterial(0x3a5f0b, 0.85, 0.15);
        
        // 主树冠 - 多层圆锥体叠加
        const coneCount = 5;
        for(let i = 0; i < coneCount; i++) {
          const size = 1.6 - i * 0.25;
          const height = 1.8;
          
          const cone = new THREE.Mesh(
            new THREE.ConeGeometry(size, height, 12), 
            needleMaterial
          );
          cone.position.y = 2.0 + i * 0.7;
          cone.castShadow = true;
          cone.receiveShadow = true;
          group.add(cone);
        }
        
        // 添加松果 - 多个不同位置的松果
        const pineconeMaterial = getBaseMaterial(0x8B4513, 0.98, 0.02);
        const pineconePositions = [
          { x: 0.5, y: 3.0, z: 0.8 },
          { x: -0.6, y: 2.5, z: -0.5 },
          { x: 0.8, y: 2.8, z: -0.3 },
          { x: -0.4, y: 3.2, z: 0.6 }
        ];
        
        pineconePositions.forEach(pos => {
          const pinecone = new THREE.Mesh(
            new THREE.ConeGeometry(0.12, 0.35, 8), 
            pineconeMaterial
          );
          pinecone.position.set(pos.x, pos.y, pos.z);
          pinecone.rotation.x = Math.PI;
          pinecone.castShadow = true;
          pinecone.receiveShadow = true;
          group.add(pinecone);
        });
        
        // 添加顶部松果
        const topPinecone = new THREE.Mesh(
          new THREE.ConeGeometry(0.18, 0.45, 10), 
          pineconeMaterial
        );
        topPinecone.position.set(0, 5.2, 0);
        topPinecone.rotation.x = Math.PI;
        topPinecone.castShadow = true;
        topPinecone.receiveShadow = true;
        group.add(topPinecone);
      }
    } else if (type === 'cherry') {
      // 樱花1 - 粉色花瓣
      const trunkMaterial = getBaseMaterial(0x8B4513, 0.9, 0.1);
      
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 1.5, 12), trunkMaterial);
      trunk.position.y = 0.75;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);
      
      const petalMaterial = getBaseMaterial(0xffd6e0, 0.7, 0.1);
      
      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 16), petalMaterial);
      crown.position.y = 2.5;
      crown.castShadow = true;
      crown.receiveShadow = true;
      group.add(crown);
    } else if (type === 'cherry2') {
      // 樱花2 - 白色花瓣
      const trunkMaterial = getBaseMaterial(0x8B4513, 0.9, 0.1);
      
      // 树干 - 更细高
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 2.0, 12), trunkMaterial);
      trunk.position.y = 1.0;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);
      
      // 花瓣 - 白色
      const petalMaterial = getBaseMaterial(0xffffff, 0.6, 0.1);
      
      // 主树冠
      const mainCrown = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 16), petalMaterial);
      mainCrown.position.y = 3.0;
      mainCrown.castShadow = true;
      mainCrown.receiveShadow = true;
      group.add(mainCrown);
      
      // 添加多个小花冠层，创造更丰满的效果
      for(let i = 0; i < 5; i++) {
        const crown = new THREE.Mesh(new THREE.SphereGeometry(0.5 - i * 0.08, 12, 12), petalMaterial);
        crown.position.set(
          (Math.random() - 0.5) * 2.0,
          3.0 + (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 2.0
        );
        crown.castShadow = true;
        crown.receiveShadow = true;
        group.add(crown);
      }
      
      // 添加飘落的花瓣效果（静态表示）
      const fallingPetalMaterial = getBaseMaterial(0xffffff, 0.8, 0.1, THREE.DoubleSide);
      for(let i = 0; i < 10; i++) {
        const petal = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.15), fallingPetalMaterial);
        petal.position.set(
          (Math.random() - 0.5) * 3.0,
          1.5 + (Math.random() - 0.5) * 2.0,
          (Math.random() - 0.5) * 3.0
        );
        petal.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        petal.castShadow = true;
        petal.receiveShadow = true;
        group.add(petal);
      }
    } else if (type === 'willow') {
      // 柳树1 - 基础版
      const trunkMaterial = getBaseMaterial(0x8B4513, 0.9, 0.1);
      
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 3.5, 12), trunkMaterial);
      trunk.position.y = 1.75;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);
      
      const leafMaterial = getBaseMaterial(0x90ee90, 0.7, 0.1);
      
      const topCrown = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 12), leafMaterial);
      topCrown.position.y = 3.8;
      topCrown.castShadow = true;
      topCrown.receiveShadow = true;
      group.add(topCrown);
    } else if (type === 'willow2') {
      // 柳树2 - 垂枝版，添加更多下垂的柳枝
      const trunkMaterial = getBaseMaterial(0x8B4513, 0.9, 0.1);
      
      // 树干 - 更细更长
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 4.0, 12), trunkMaterial);
      trunk.position.y = 2.0;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);
      
      const leafMaterial = getBaseMaterial(0x90ee90, 0.7, 0.1);
      
      // 顶部树冠
      const topCrown = new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 12), leafMaterial);
      topCrown.position.y = 4.5;
      topCrown.castShadow = true;
      topCrown.receiveShadow = true;
      group.add(topCrown);
      
      // 添加多个下垂的柳枝
      const willowBranchCount = 12;
      for(let i = 0; i < willowBranchCount; i++) {
        const angle = (i / willowBranchCount) * Math.PI * 2;
        const radius = 0.2;
        
        // 创建柳枝
        const branchGeometry = new THREE.CylinderGeometry(0.03, 0.03, 3.0, 8);
        const branchMaterial = getBaseMaterial(0x8B4513, 0.9, 0.1);
        const branch = new THREE.Mesh(branchGeometry, branchMaterial);
        
        // 设置柳枝位置和旋转
        branch.position.set(
          Math.cos(angle) * radius,
          3.5,
          Math.sin(angle) * radius
        );
        branch.rotation.z = Math.PI / 2 + angle;
        branch.castShadow = true;
        branch.receiveShadow = true;
        group.add(branch);
        
        // 在柳枝末端添加柳叶
        const leafCluster = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), leafMaterial);
        leafCluster.position.set(
          Math.cos(angle) * radius + Math.cos(angle) * 2.8,
          0.8,
          Math.sin(angle) * radius + Math.sin(angle) * 2.8
        );
        leafCluster.castShadow = true;
        leafCluster.receiveShadow = true;
        group.add(leafCluster);
      }
    } else if (type === 'bamboo') {
      // 竹子1 - 基础版，5杆竹子
      const bambooMaterial = getBaseMaterial(0x90ee90, 0.7, 0.1);
      
      // 创建多杆竹子
      const bambooCount = 5;
      
      for (let b = 0; b < bambooCount; b++) {
        const offsetX = (Math.random() - 0.5) * 0.8;
        const offsetZ = (Math.random() - 0.5) * 0.8;
        const height = 3.0 + Math.random() * 2.0;
        
        const bambooGroup = new THREE.Group();
        bambooGroup.position.set(offsetX, 0, offsetZ);
        
        const baseRadius = 0.15 - b * 0.02;
        const topRadius = baseRadius * 0.7;
        
        const stalk = new THREE.Mesh(
          new THREE.CylinderGeometry(baseRadius, topRadius, height, 12),
          bambooMaterial
        );
        stalk.position.y = height / 2;
        stalk.castShadow = true;
        stalk.receiveShadow = true;
        bambooGroup.add(stalk);
        
        group.add(bambooGroup);
      }
    } else if (type === 'bamboo2') {
      // 竹子2 - 茂密版，8杆竹子，颜色更深
      const bambooMaterial = getBaseMaterial(0x4caf50, 0.7, 0.1);
      
      // 创建更多杆竹子
      const bambooCount = 8;
      
      for (let b = 0; b < bambooCount; b++) {
        // 更密集的排列
        const offsetX = (Math.random() - 0.5) * 1.0;
        const offsetZ = (Math.random() - 0.5) * 1.0;
        const height = 2.5 + Math.random() * 2.5;
        
        const bambooGroup = new THREE.Group();
        bambooGroup.position.set(offsetX, 0, offsetZ);
        
        const baseRadius = 0.12 - b * 0.01;
        const topRadius = baseRadius * 0.6;
        
        const stalk = new THREE.Mesh(
          new THREE.CylinderGeometry(baseRadius, topRadius, height, 12),
          bambooMaterial
        );
        stalk.position.y = height / 2;
        stalk.castShadow = true;
        stalk.receiveShadow = true;
        bambooGroup.add(stalk);
        
        // 添加竹子节疤
        const nodeCount = Math.floor(height / 0.5);
        for (let n = 0; n < nodeCount; n++) {
          const node = new THREE.Mesh(
            new THREE.CylinderGeometry(baseRadius + 0.01, topRadius + 0.01, 0.05, 12),
            getBaseMaterial(0x2e7d32, 0.9, 0.1)
          );
          node.position.y = (n + 1) * 0.5;
          node.castShadow = true;
          node.receiveShadow = true;
          bambooGroup.add(node);
        }
        
        group.add(bambooGroup);
      }
    } else if (type === 'palm') {
      // 棕榈树1
      const trunkMaterial = getBaseMaterial(0x8B4513, 0.9, 0.1);
      
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 4.0, 16), trunkMaterial);
      trunk.position.y = 2.0;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);
      
      const leafMaterial = getBaseMaterial(0x228B22, 0.7, 0.1, THREE.DoubleSide);
      
      // 椰子树叶
      for(let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        
        const leaf = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 2.5, 0.1),
          leafMaterial
        );
        
        leaf.position.set(
          Math.cos(angle) * 0.3,
          3.8,
          Math.sin(angle) * 0.3
        );
        
        leaf.rotation.y = angle;
        leaf.rotation.z = Math.PI / 3;
        leaf.rotation.x = 0.2;
        
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        group.add(leaf);
      }
      
      // 添加椰子
      const coconutMaterial = getBaseMaterial(0x8B4513, 0.95, 0.05);
      for(let i = 0; i < 2; i++) {
        const coconut = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 8, 8),
          coconutMaterial
        );
        coconut.position.set(
          Math.cos(i * Math.PI) * 0.5,
          3.5,
          Math.sin(i * Math.PI) * 0.5
        );
        coconut.castShadow = true;
        coconut.receiveShadow = true;
        group.add(coconut);
      }
    } else if (type === 'palm2') {
      // 棕榈树2 - 改良版，更具热带风情
      const trunkMaterial = getBaseMaterial(0x8B4513, 0.9, 0.1);
      
      // 树干 - 更粗壮，带有弯曲效果
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 4.5, 16), trunkMaterial);
      trunk.position.y = 2.25;
      trunk.rotation.z = -0.1; // 轻微弯曲
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);
      
      // 叶子 - 更大更宽，颜色更亮
      const leafMaterial = getBaseMaterial(0x32CD32, 0.6, 0.2, THREE.DoubleSide);
      
      // 椰子树叶 - 更大更茂密
      for(let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        
        const leaf = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, 3.0, 0.1),
          leafMaterial
        );
        
        leaf.position.set(
          Math.cos(angle) * 0.4,
          4.2,
          Math.sin(angle) * 0.4
        );
        
        leaf.rotation.y = angle;
        leaf.rotation.z = Math.PI / 3.5;
        leaf.rotation.x = 0.15;
        
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        group.add(leaf);
      }
      
      // 添加更多椰子
      const coconutMaterial = getBaseMaterial(0x8B4513, 0.95, 0.05);
      for(let i = 0; i < 4; i++) {
        const coconut = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 8, 8),
          coconutMaterial
        );
        coconut.position.set(
          Math.cos(i * Math.PI / 2) * 0.6,
          3.8,
          Math.sin(i * Math.PI / 2) * 0.6
        );
        coconut.castShadow = true;
        coconut.receiveShadow = true;
        group.add(coconut);
      }
      
      // 添加热带花朵
      const flowerMaterial = getBaseMaterial(0xFF6B6B, 0.5, 0.3);
      for(let i = 0; i < 3; i++) {
        const flower = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.2, 1),
          flowerMaterial
        );
        flower.position.set(
          Math.cos(i * Math.PI / 1.5) * 0.3,
          4.5,
          Math.sin(i * Math.PI / 1.5) * 0.3
        );
        flower.castShadow = true;
        flower.receiveShadow = true;
        group.add(flower);
      }
    } else if (type === 'cactus') {
      // 仙人掌1
      const cactusMaterial = getBaseMaterial(0x22c55e, 0.8, 0.1);
      
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.45, 2.5, 16),
        cactusMaterial
      );
      body.position.y = 1.25;
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 添加仙人掌刺
      const spineMaterial = getBaseMaterial(0x166534, 0.9, 0.05);
      for(let i = 0; i < 20; i++) {
        const spine = new THREE.Mesh(
          new THREE.CylinderGeometry(0.01, 0.02, 0.3, 4),
          spineMaterial
        );
        
        const angle = (i / 20) * Math.PI * 2;
        const height = Math.random() * 2.5;
        
        spine.position.set(
          Math.cos(angle) * 0.4,
          height,
          Math.sin(angle) * 0.4
        );
        spine.rotation.y = angle;
        spine.rotation.z = Math.PI / 2;
        
        spine.castShadow = true;
        spine.receiveShadow = true;
        group.add(spine);
      }
    } else if (type === 'cactus2') {
      // 仙人掌2 - 改良版，带有多个分支
      const cactusMaterial = getBaseMaterial(0x16a34a, 0.7, 0.2);
      
      // 主茎
      const mainBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 3.0, 16),
        cactusMaterial
      );
      mainBody.position.y = 1.5;
      mainBody.castShadow = true;
      mainBody.receiveShadow = true;
      group.add(mainBody);
      
      // 添加多个分支
      const branchCount = 4;
      for(let i = 0; i < branchCount; i++) {
        const branch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.2, 1.5, 12),
          cactusMaterial
        );
        
        const angle = (i / branchCount) * Math.PI * 2;
        const height = 1.0 + (i % 2) * 0.5;
        
        branch.position.set(
          Math.cos(angle) * 0.4,
          height,
          Math.sin(angle) * 0.4
        );
        branch.rotation.z = Math.PI / 4 * (i % 2 === 0 ? 1 : -1);
        branch.rotation.y = angle;
        
        branch.castShadow = true;
        branch.receiveShadow = true;
        group.add(branch);
      }
      
      // 添加花朵
      const flowerMaterial = getBaseMaterial(0xFFD700, 0.6, 0.3);
      for(let i = 0; i < 3; i++) {
        const flower = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 8, 8),
          flowerMaterial
        );
        flower.position.set(
          (Math.random() - 0.5) * 0.2,
          3.2,
          (Math.random() - 0.5) * 0.2
        );
        flower.castShadow = true;
        flower.receiveShadow = true;
        group.add(flower);
      }
      
      // 添加更多刺
      const spineMaterial = getBaseMaterial(0x15803d, 0.9, 0.05);
      for(let i = 0; i < 30; i++) {
        const spine = new THREE.Mesh(
          new THREE.CylinderGeometry(0.01, 0.02, 0.4, 4),
          spineMaterial
        );
        
        const angle = (i / 30) * Math.PI * 2;
        const height = Math.random() * 3.0;
        
        spine.position.set(
          Math.cos(angle) * 0.35,
          height,
          Math.sin(angle) * 0.35
        );
        spine.rotation.y = angle;
        spine.rotation.z = Math.PI / 2;
        
        spine.castShadow = true;
        spine.receiveShadow = true;
        group.add(spine);
      }
    } else if (type === 'mushroom') {
      // 蘑菇1
      const stemMaterial = getBaseMaterial(0xffedd5, 0.7, 0.1);
      
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.35, 1.0, 16),
        stemMaterial
      );
      stem.position.y = 0.5;
      stem.castShadow = true;
      stem.receiveShadow = true;
      group.add(stem);
      
      const capMaterial = getBaseMaterial(0xff4757, 0.6, 0.1);
      
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        capMaterial
      );
      cap.position.y = 1.2;
      cap.castShadow = true;
      cap.receiveShadow = true;
      group.add(cap);
      
      // 添加白色斑点
      const spotMaterial = getBaseMaterial(0xffffff, 0.8, 0.05);
      for(let i = 0; i < 8; i++) {
        const spot = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 8, 8),
          spotMaterial
        );
        
        const angle = (i / 8) * Math.PI * 2;
        const radius = 0.8 + Math.random() * 0.3;
        
        spot.position.set(
          Math.cos(angle) * radius,
          1.3 + Math.random() * 0.2,
          Math.sin(angle) * radius
        );
        spot.castShadow = true;
        spot.receiveShadow = true;
        group.add(spot);
      }
    } else if (type === 'mushroom2') {
      // 蘑菇2 - 改良版，毒蘑菇造型
      const stemMaterial = getBaseMaterial(0xffffe0, 0.6, 0.2);
      
      // 菌柄 - 更长更细
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 1.5, 16),
        stemMaterial
      );
      stem.position.y = 0.75;
      stem.castShadow = true;
      stem.receiveShadow = true;
      group.add(stem);
      
      // 菌盖 - 更尖更毒的颜色
      const capMaterial = getBaseMaterial(0x8b0000, 0.5, 0.3);
      
      const cap = new THREE.Mesh(
        new THREE.ConeGeometry(1.5, 2.0, 16),
        capMaterial
      );
      cap.position.y = 1.75;
      cap.rotation.x = Math.PI;
      cap.castShadow = true;
      cap.receiveShadow = true;
      group.add(cap);
      
      // 添加更明显的白色斑点
      const spotMaterial = getBaseMaterial(0xffffff, 0.9, 0.1);
      for(let i = 0; i < 12; i++) {
        const spot = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.25, 1),
          spotMaterial
        );
        
        const angle = (i / 12) * Math.PI * 2;
        const radius = 1.0 + Math.random() * 0.4;
        const heightOffset = Math.random() * 0.5;
        
        spot.position.set(
          Math.cos(angle) * radius,
          1.5 + heightOffset,
          Math.sin(angle) * radius
        );
        spot.castShadow = true;
        spot.receiveShadow = true;
        group.add(spot);
      }
      
      // 添加菌褶
      const gillMaterial = getBaseMaterial(0x660000, 0.8, 0.1);
      for(let i = 0; i < 8; i++) {
        const gill = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.8, 0.5),
          gillMaterial
        );
        
        const angle = (i / 8) * Math.PI * 2;
        
        gill.position.set(
          Math.cos(angle) * 0.15,
          1.2,
          Math.sin(angle) * 0.15
        );
        gill.rotation.y = angle;
        
        gill.castShadow = true;
        gill.receiveShadow = true;
        group.add(gill);
      }
    } else if (type === 'sunflower') {
      // 向日葵1
      const stemMaterial = getBaseMaterial(0x4ade80, 0.8, 0.1);
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, 3.0, 10),
        stemMaterial
      );
      stem.position.y = 1.5;
      stem.castShadow = true;
      stem.receiveShadow = true;
      group.add(stem);
      
      // 花盘
      const headMaterial = getBaseMaterial(0xfacc15, 0.7, 0.1);
      const head = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 0.15, 20),
        headMaterial
      );
      head.position.set(0, 3.0, 0);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      // 花盘中心
      const centerMaterial = getBaseMaterial(0x78350f, 0.9, 0.05);
      const center = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12),
        centerMaterial
      );
      center.position.set(0, 3.05, 0);
      center.castShadow = true;
      center.receiveShadow = true;
      group.add(center);
      
      // 花瓣
      const petalMaterial = getBaseMaterial(0xfbbf24, 0.8, 0.1, THREE.DoubleSide);
      for(let i = 0; i < 20; i++) {
        const petal = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.05, 0.8),
          petalMaterial
        );
        
        const angle = (i / 20) * Math.PI * 2;
        
        petal.position.set(
          Math.cos(angle) * 0.55,
          3.0,
          Math.sin(angle) * 0.55
        );
        petal.rotation.y = angle;
        petal.rotation.z = Math.PI / 2;
        
        petal.castShadow = true;
        petal.receiveShadow = true;
        group.add(petal);
      }
    } else if (type === 'sunflower2') {
      // 向日葵2 - 改良版，多头向日葵
      const stemMaterial = getBaseMaterial(0x34d399, 0.7, 0.2);
      
      // 主茎 - 更粗壮
      const mainStem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 4.0, 10),
        stemMaterial
      );
      mainStem.position.y = 2.0;
      mainStem.castShadow = true;
      mainStem.receiveShadow = true;
      group.add(mainStem);
      
      // 分支
      const branchCount = 3;
      for(let b = 0; b < branchCount; b++) {
        const branch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.08, 1.5, 8),
          stemMaterial
        );
        
        const height = 1.5 + b * 0.8;
        const angle = (b / branchCount) * Math.PI / 3 - Math.PI / 6;
        
        branch.position.set(
          Math.cos(angle) * 0.2,
          height,
          Math.sin(angle) * 0.2
        );
        branch.rotation.z = angle;
        branch.rotation.y = Math.PI / 2;
        
        branch.castShadow = true;
        branch.receiveShadow = true;
        group.add(branch);
        
        // 分支上的花盘
        const headMaterial = getBaseMaterial(0xfbbf24, 0.6, 0.2);
        const head = new THREE.Mesh(
          new THREE.CylinderGeometry(0.6, 0.6, 0.15, 16),
          headMaterial
        );
        
        const headPositionOffset = Math.cos(angle) * 0.8;
        const headZOffset = Math.sin(angle) * 0.8;
        
        head.position.set(
          headPositionOffset,
          height,
          headZOffset
        );
        head.castShadow = true;
        head.receiveShadow = true;
        group.add(head);
        
        // 分支花盘中心
        const centerMaterial = getBaseMaterial(0x92400e, 0.9, 0.1);
        const center = new THREE.Mesh(
          new THREE.CylinderGeometry(0.25, 0.25, 0.2, 10),
          centerMaterial
        );
        center.position.set(
          headPositionOffset,
          height + 0.05,
          headZOffset
        );
        center.castShadow = true;
        center.receiveShadow = true;
        group.add(center);
        
        // 分支花瓣
        const petalMaterial = getBaseMaterial(0xfacc15, 0.7, 0.1, THREE.DoubleSide);
        for(let i = 0; i < 16; i++) {
          const petal = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.04, 0.6),
            petalMaterial
          );
          
          const petalAngle = (i / 16) * Math.PI * 2;
          
          petal.position.set(
            headPositionOffset + Math.cos(petalAngle) * 0.42,
            height,
            headZOffset + Math.sin(petalAngle) * 0.42
          );
          petal.rotation.y = petalAngle;
          petal.rotation.z = Math.PI / 2;
          
          petal.castShadow = true;
          petal.receiveShadow = true;
          group.add(petal);
        }
      }
      
      // 主花盘 - 最大的花盘
      const mainHeadMaterial = getBaseMaterial(0xfbbf24, 0.6, 0.2);
      const mainHead = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.9, 0.18, 24),
        mainHeadMaterial
      );
      mainHead.position.set(0, 4.0, 0);
      mainHead.castShadow = true;
      mainHead.receiveShadow = true;
      group.add(mainHead);
      
      // 主花盘中心
      const mainCenterMaterial = getBaseMaterial(0x92400e, 0.9, 0.1);
      const mainCenter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16),
        mainCenterMaterial
      );
      mainCenter.position.set(0, 4.07, 0);
      mainCenter.castShadow = true;
      mainCenter.receiveShadow = true;
      group.add(mainCenter);
      
      // 主花瓣
      const mainPetalMaterial = getBaseMaterial(0xfacc15, 0.7, 0.1, THREE.DoubleSide);
      for(let i = 0; i < 24; i++) {
        const petal = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 0.06, 1.0),
          mainPetalMaterial
        );
        
        const angle = (i / 24) * Math.PI * 2;
        
        petal.position.set(
          Math.cos(angle) * 0.62,
          4.0,
          Math.sin(angle) * 0.62
        );
        petal.rotation.y = angle;
        petal.rotation.z = Math.PI / 2;
        
        petal.castShadow = true;
        petal.receiveShadow = true;
        group.add(petal);
      }
    } else if (type === 'birch') {
      // 白桦树1
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.25, 3.2, 12),
        getBaseMaterial(0xf1f5f9, 0.8, 0.1)
      );
      trunk.position.y = 1.6;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);
      
      // 添加黑色斑点
      const spotMaterial = getBaseMaterial(0x1e293b, 0.9, 0.1);
      for(let i = 0; i < 8; i++) {
        const spot = new THREE.Mesh(
          new THREE.BoxGeometry(0.21, 0.1, 0.1),
          spotMaterial
        );
        
        const angle = (i / 8) * Math.PI * 2;
        const height = 0.5 + Math.random() * 2.2;
        
        spot.position.set(
          Math.cos(angle) * 0.14,
          height,
          Math.sin(angle) * 0.14
        );
        spot.rotation.y = angle;
        spot.castShadow = true;
        spot.receiveShadow = true;
        group.add(spot);
      }
      
      const crownMaterial = getBaseMaterial(0xfcd34d, 0.6, 0.3);
      
      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 16, 16),
        crownMaterial
      );
      crown.position.y = 3.3;
      crown.castShadow = true;
      crown.receiveShadow = true;
      group.add(crown);
    } else if (type === 'birch2') {
      // 白桦树2 - 改良版，更具特色
      // 树干 - 更粗，带有更多纹理
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.3, 4.0, 16),
        getBaseMaterial(0xf8fafc, 0.7, 0.2)
      );
      trunk.position.y = 2.0;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);
      
      // 添加更多更大的黑色斑点
      const spotMaterial = getBaseMaterial(0x1e293b, 0.95, 0.05);
      for(let i = 0; i < 15; i++) {
        const spot = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, 0.15, 0.12),
          spotMaterial
        );
        
        const angle = (i / 15) * Math.PI * 2;
        const height = 0.8 + Math.random() * 2.4;
        
        spot.position.set(
          Math.cos(angle) * 0.17,
          height,
          Math.sin(angle) * 0.17
        );
        spot.rotation.y = angle;
        spot.castShadow = true;
        spot.receiveShadow = true;
        group.add(spot);
      }
      
      // 树冠 - 更不规则的形状，使用多个几何体组合
      const crownMaterial = getBaseMaterial(0xfbbf24, 0.5, 0.4);
      
      // 主树冠
      const mainCrown = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 16, 16),
        crownMaterial
      );
      mainCrown.position.y = 4.0;
      mainCrown.castShadow = true;
      mainCrown.receiveShadow = true;
      group.add(mainCrown);
      
      // 额外的树冠部分，创造不规则形状
      for(let i = 0; i < 4; i++) {
        const extraCrown = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 12, 12),
          crownMaterial
        );
        
        const angle = (i / 4) * Math.PI * 2;
        const radius = 1.2 + Math.random() * 0.4;
        
        extraCrown.position.set(
          Math.cos(angle) * radius,
          3.8 + Math.random() * 0.8,
          Math.sin(angle) * radius
        );
        extraCrown.castShadow = true;
        extraCrown.receiveShadow = true;
        group.add(extraCrown);
      }
      
      // 添加树瘤
      const knotMaterial = getBaseMaterial(0x94a3b8, 0.9, 0.1);
      for(let i = 0; i < 3; i++) {
        const knot = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 8, 8),
          knotMaterial
        );
        
        const angle = (i / 3) * Math.PI * 2;
        const height = 1.2 + Math.random() * 1.5;
        
        knot.position.set(
          Math.cos(angle) * 0.22,
          height,
          Math.sin(angle) * 0.22
        );
        knot.castShadow = true;
        knot.receiveShadow = true;
        group.add(knot);
      }
    } else if (baseType === 'oak' || type === 'oak' || type === 'oak1' || type === 'oak2') {
      if (type === 'oak' || type === 'oak1') {
        // 橡树1 - 标准橡树设计
        const trunkMaterial = getBaseMaterial(0x5c4033, 0.9, 0.1);
        
        // 树干 - 更粗壮，符合设计文档要求
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.5, 1.5, 12),
          trunkMaterial
        );
        trunk.position.y = 0.75;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        group.add(trunk);
        
        // 树冠 - 二十面体，符合设计文档要求
        const crownMaterial = getBaseMaterial(0x4ade80, 0.7, 0.1);
        const crown = new THREE.Mesh(
          new THREE.IcosahedronGeometry(1.6, 2),
          crownMaterial
        );
        crown.position.y = 2.2;
        crown.castShadow = true;
        crown.receiveShadow = true;
        group.add(crown);
        
        // 添加一些橡果
        const acornMaterial = getBaseMaterial(0x8B4513, 0.95, 0.05);
        for(let i = 0; i < 5; i++) {
          const acorn = new THREE.Mesh(
            new THREE.ConeGeometry(0.15, 0.3, 8),
            acornMaterial
          );
          
          const angle = (i / 5) * Math.PI * 2;
          const radius = 1.2 + Math.random() * 0.3;
          
          acorn.position.set(
            Math.cos(angle) * radius,
            2.0,
            Math.sin(angle) * radius
          );
          acorn.rotation.x = Math.PI;
          acorn.castShadow = true;
          acorn.receiveShadow = true;
          group.add(acorn);
        }
      } else if (type === 'oak2') {
        // 橡树2 - 改良版，具有更复杂的树冠结构
        const trunkMaterial = getBaseMaterial(0x6B4E36, 0.9, 0.1);
        
        // 树干 - 更弯曲，更自然
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.55, 1.8, 12),
          trunkMaterial
        );
        trunk.position.y = 0.9;
        trunk.rotation.z = -0.1; // 轻微弯曲
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        group.add(trunk);
        
        // 主树冠 - 二十面体
        const crownMaterial = getBaseMaterial(0x36B37E, 0.7, 0.1);
        const mainCrown = new THREE.Mesh(
          new THREE.IcosahedronGeometry(1.8, 2),
          crownMaterial
        );
        mainCrown.position.y = 2.5;
        mainCrown.castShadow = true;
        mainCrown.receiveShadow = true;
        group.add(mainCrown);
        
        // 添加多个次级树冠，创造更丰满的效果
        for(let i = 0; i < 4; i++) {
          const subCrown = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.8, 1),
            crownMaterial
          );
          
          const angle = (i / 4) * Math.PI * 2;
          const radius = 1.4 + Math.random() * 0.3;
          
          subCrown.position.set(
            Math.cos(angle) * radius,
            2.2 + Math.random() * 0.8,
            Math.sin(angle) * radius
          );
          subCrown.castShadow = true;
          subCrown.receiveShadow = true;
          group.add(subCrown);
        }
        
        // 添加更多橡果
        const acornMaterial = getBaseMaterial(0x795548, 0.95, 0.05);
        for(let i = 0; i < 8; i++) {
          const acorn = new THREE.Mesh(
            new THREE.ConeGeometry(0.18, 0.35, 8),
            acornMaterial
          );
          
          const angle = (i / 8) * Math.PI * 2;
          const radius = 1.4 + Math.random() * 0.4;
          
          acorn.position.set(
            Math.cos(angle) * radius,
            2.2 + Math.random() * 0.5,
            Math.sin(angle) * radius
          );
          acorn.rotation.x = Math.PI + Math.random() * 0.5;
          acorn.castShadow = true;
          acorn.receiveShadow = true;
          group.add(acorn);
        }
        
        // 添加一些树枝细节
        const branchMaterial = getBaseMaterial(0x5c4033, 0.9, 0.1);
        for(let i = 0; i < 6; i++) {
          const branch = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.12, 0.8, 8),
            branchMaterial
          );
          
          const angle = (i / 6) * Math.PI * 2;
          
          branch.position.set(
            Math.cos(angle) * 0.4,
            1.5 + Math.random() * 0.5,
            Math.sin(angle) * 0.4
          );
          branch.rotation.y = angle;
          branch.rotation.z = Math.PI / 4 + Math.random() * Math.PI / 4;
          branch.castShadow = true;
          branch.receiveShadow = true;
          group.add(branch);
        }
      }
    } else {
      // 默认创建松树
      const trunkMaterial = getBaseMaterial(0x5c4033, 0.9, 0.1);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 1.2, 12), trunkMaterial);
      trunk.position.y = 0.6;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);
      
      const needleMaterial = getBaseMaterial(0x2d6a4f, 0.8, 0.1);
      
      for(let i = 0; i < 4; i++) {
        const size = 1.5 - i * 0.3;
        const height = 1.8 + i * 0.8;
        const cone = new THREE.Mesh(new THREE.ConeGeometry(size, 1.8, 8), needleMaterial);
        cone.position.y = height;
        cone.castShadow = true;
        cone.receiveShadow = true;
        group.add(cone);
      }
    }
    
    return group;
  }

  /**
   * 创建动物
   */
  private createAnimal(type: string): THREE.Group {
    const group = new THREE.Group();
    const finalizeMesh = (mesh: THREE.Mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };
    
    if (type === 'fox') {
      const furMaterial = new THREE.MeshStandardMaterial({
        color: 0xd86a1d,
        roughness: 0.88,
        metalness: 0.04
      });
      const darkMaterial = new THREE.MeshStandardMaterial({
        color: 0x2f211c,
        roughness: 0.92,
        metalness: 0.02
      });
      const creamMaterial = new THREE.MeshStandardMaterial({
        color: 0xfff1dd,
        roughness: 0.95,
        metalness: 0.0
      });
      const innerEarMaterial = new THREE.MeshStandardMaterial({
        color: 0xf7c8b0,
        roughness: 0.9,
        metalness: 0.0
      });
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.75,
        metalness: 0.08
      });

      const body = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(0.18, 0.58, 6, 12),
        furMaterial
      ));
      body.position.set(0, 0.42, 0);
      body.rotation.x = Math.PI / 2;
      group.add(body);

      const chest = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 14, 14),
        creamMaterial
      ));
      chest.position.set(0, 0.35, 0.28);
      chest.scale.set(0.95, 1.15, 0.75);
      group.add(chest);

      const haunch = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 14, 14),
        furMaterial
      ));
      haunch.position.set(0, 0.44, -0.28);
      haunch.scale.set(1.05, 1, 0.9);
      group.add(haunch);

      const neck = finalizeMesh(new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, 0.22, 10),
        furMaterial
      ));
      neck.position.set(0, 0.56, 0.22);
      neck.rotation.x = -0.6;
      group.add(neck);

      const head = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 18, 18),
        furMaterial
      ));
      head.position.set(0, 0.66, 0.42);
      head.scale.set(1, 0.95, 1.08);
      group.add(head);

      const muzzle = finalizeMesh(new THREE.Mesh(
        new THREE.ConeGeometry(0.085, 0.24, 10),
        creamMaterial
      ));
      muzzle.position.set(0, 0.61, 0.58);
      muzzle.rotation.x = Math.PI / 2;
      group.add(muzzle);

      const nose = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 10, 10),
        darkMaterial
      ));
      nose.position.set(0, 0.6, 0.69);
      group.add(nose);

      [-0.12, 0.12].forEach((x) => {
        const cheek = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.065, 10, 10),
          creamMaterial
        ));
        cheek.position.set(x, 0.6, 0.52);
        cheek.scale.set(1.05, 0.82, 0.8);
        group.add(cheek);
      });

      [-0.1, 0.1].forEach((x) => {
        const eye = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.022, 10, 10),
          eyeMaterial
        ));
        eye.position.set(x, 0.69, 0.55);
        group.add(eye);
      });

      [-0.12, 0.12].forEach((x, index) => {
        const earOuter = finalizeMesh(new THREE.Mesh(
          new THREE.ConeGeometry(0.065, 0.2, 4),
          furMaterial
        ));
        earOuter.position.set(x, 0.87, 0.41);
        earOuter.rotation.x = index === 0 ? -0.18 : -0.12;
        earOuter.rotation.z = x < 0 ? 0.18 : -0.18;
        group.add(earOuter);

        const earInner = finalizeMesh(new THREE.Mesh(
          new THREE.ConeGeometry(0.038, 0.14, 4),
          innerEarMaterial
        ));
        earInner.position.set(x, 0.84, 0.46);
        earInner.rotation.x = earOuter.rotation.x;
        earInner.rotation.z = earOuter.rotation.z;
        group.add(earInner);
      });

      [
        [-0.11, 0.18, 0.2],
        [0.11, 0.18, 0.2],
        [-0.12, 0.18, -0.15],
        [0.12, 0.18, -0.15]
      ].forEach(([x, y, z], index) => {
        const leg = finalizeMesh(new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.038, index < 2 ? 0.34 : 0.3, 8),
          darkMaterial
        ));
        leg.position.set(x, y, z);
        if (index === 0) leg.rotation.z = 0.08;
        if (index === 1) leg.rotation.z = -0.08;
        group.add(leg);

        const paw = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.035, 8, 8),
          darkMaterial
        ));
        paw.position.set(x, 0.02, z + (index < 2 ? 0.03 : 0));
        paw.scale.set(1, 0.55, 1.2);
        group.add(paw);
      });

      const tailBase = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(0.085, 0.38, 4, 8),
        furMaterial
      ));
      tailBase.position.set(0, 0.56, -0.43);
      tailBase.rotation.x = -1.0;
      group.add(tailBase);

      const tailTip = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(0.065, 0.22, 4, 8),
        creamMaterial
      ));
      tailTip.position.set(0, 0.74, -0.57);
      tailTip.rotation.x = -0.92;
      group.add(tailTip);
    } else if (type === 'fox2') {
      const furMaterial = new THREE.MeshStandardMaterial({
        color: 0xbe4b16,
        roughness: 0.82,
        metalness: 0.08
      });
      const darkMaterial = new THREE.MeshStandardMaterial({
        color: 0x1c1917,
        roughness: 0.9,
        metalness: 0.03
      });
      const creamMaterial = new THREE.MeshStandardMaterial({
        color: 0xfff6e8,
        roughness: 0.96,
        metalness: 0.0
      });
      const innerEarMaterial = new THREE.MeshStandardMaterial({
        color: 0xf1b7a6,
        roughness: 0.9,
        metalness: 0.0
      });
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.65,
        metalness: 0.16
      });

      const body = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(0.19, 0.66, 6, 12),
        furMaterial
      ));
      body.position.set(0, 0.39, -0.04);
      body.rotation.x = Math.PI / 2;
      body.rotation.z = 0.08;
      group.add(body);

      const ribCage = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 14, 14),
        furMaterial
      ));
      ribCage.position.set(0, 0.44, 0.14);
      ribCage.scale.set(0.95, 1.05, 1.2);
      group.add(ribCage);

      const chest = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 12, 12),
        creamMaterial
      ));
      chest.position.set(0, 0.31, 0.3);
      chest.scale.set(0.9, 1.2, 0.72);
      group.add(chest);

      const neck = finalizeMesh(new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.11, 0.26, 10),
        furMaterial
      ));
      neck.position.set(0, 0.56, 0.28);
      neck.rotation.x = -0.82;
      group.add(neck);

      const head = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 18, 18),
        furMaterial
      ));
      head.position.set(0, 0.67, 0.52);
      head.scale.set(0.95, 0.92, 1.18);
      group.add(head);

      const muzzle = finalizeMesh(new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.28, 10),
        creamMaterial
      ));
      muzzle.position.set(0, 0.61, 0.7);
      muzzle.rotation.x = Math.PI / 2;
      group.add(muzzle);

      const nose = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.026, 10, 10),
        darkMaterial
      ));
      nose.position.set(0, 0.6, 0.82);
      group.add(nose);

      [-0.13, 0.13].forEach((x) => {
        const cheek = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 10, 10),
          creamMaterial
        ));
        cheek.position.set(x, 0.61, 0.61);
        cheek.scale.set(1.08, 0.85, 0.82);
        group.add(cheek);
      });

      [-0.11, 0.11].forEach((x) => {
        const eye = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.024, 10, 10),
          eyeMaterial
        ));
        eye.position.set(x, 0.7, 0.69);
        group.add(eye);
      });

      [-0.13, 0.13].forEach((x) => {
        const earOuter = finalizeMesh(new THREE.Mesh(
          new THREE.ConeGeometry(0.07, 0.23, 4),
          furMaterial
        ));
        earOuter.position.set(x, 0.92, 0.48);
        earOuter.rotation.x = -0.08;
        earOuter.rotation.z = x < 0 ? 0.22 : -0.22;
        group.add(earOuter);

        const earTip = finalizeMesh(new THREE.Mesh(
          new THREE.ConeGeometry(0.045, 0.1, 4),
          darkMaterial
        ));
        earTip.position.set(x, 1.0, 0.48);
        earTip.rotation.x = earOuter.rotation.x;
        earTip.rotation.z = earOuter.rotation.z;
        group.add(earTip);

        const earInner = finalizeMesh(new THREE.Mesh(
          new THREE.ConeGeometry(0.036, 0.14, 4),
          innerEarMaterial
        ));
        earInner.position.set(x, 0.88, 0.54);
        earInner.rotation.x = earOuter.rotation.x;
        earInner.rotation.z = earOuter.rotation.z;
        group.add(earInner);
      });

      [
        [-0.11, 0.18, 0.25, 0.06],
        [0.11, 0.2, 0.22, -0.08],
        [-0.12, 0.2, -0.16, -0.04],
        [0.12, 0.2, -0.22, 0.05]
      ].forEach(([x, y, z, tilt], index) => {
        const leg = finalizeMesh(new THREE.Mesh(
          new THREE.CylinderGeometry(0.028, 0.04, index < 2 ? 0.37 : 0.34, 8),
          darkMaterial
        ));
        leg.position.set(x, y, z);
        leg.rotation.z = tilt;
        group.add(leg);

        const paw = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.036, 8, 8),
          darkMaterial
        ));
        paw.position.set(x, 0.02, z + (index === 0 ? 0.05 : 0));
        paw.scale.set(1, 0.55, 1.25);
        group.add(paw);
      });

      const tailBase = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(0.095, 0.46, 4, 8),
        furMaterial
      ));
      tailBase.position.set(0, 0.57, -0.47);
      tailBase.rotation.x = -1.12;
      tailBase.rotation.z = 0.08;
      group.add(tailBase);

      const tailMid = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(0.08, 0.32, 4, 8),
        furMaterial
      ));
      tailMid.position.set(0, 0.77, -0.6);
      tailMid.rotation.x = -0.95;
      tailMid.rotation.z = 0.1;
      group.add(tailMid);

      const tailTip = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(0.06, 0.2, 4, 8),
        creamMaterial
      ));
      tailTip.position.set(0, 0.92, -0.7);
      tailTip.rotation.x = -0.82;
      group.add(tailTip);

      group.rotation.y = 0.18;
    } else if (type === 'rabbit') {
      const furMaterial = new THREE.MeshStandardMaterial({
        color: 0xfaf7f2,
        roughness: 0.92,
        metalness: 0.02
      });
      const bellyMaterial = new THREE.MeshStandardMaterial({
        color: 0xfff6ea,
        roughness: 0.95,
        metalness: 0.0
      });
      const innerEarMaterial = new THREE.MeshStandardMaterial({
        color: 0xf7c7cf,
        roughness: 0.9,
        metalness: 0.0
      });
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.72,
        metalness: 0.12
      });
      const noseMaterial = new THREE.MeshStandardMaterial({
        color: 0xf28ca2,
        roughness: 0.78,
        metalness: 0.04
      });

      const body = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(0.2, 0.5, 6, 12),
        furMaterial
      ));
      body.position.set(0, 0.32, -0.02);
      body.rotation.x = Math.PI / 2;
      group.add(body);

      const haunch = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 14, 14),
        furMaterial
      ));
      haunch.position.set(0, 0.33, -0.22);
      haunch.scale.set(1.1, 1, 1.18);
      group.add(haunch);

      const chest = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 14, 14),
        bellyMaterial
      ));
      chest.position.set(0, 0.28, 0.19);
      chest.scale.set(0.92, 1.08, 0.78);
      group.add(chest);

      const head = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 18, 18),
        furMaterial
      ));
      head.position.set(0, 0.55, 0.31);
      head.scale.set(1, 0.98, 1.08);
      group.add(head);

      const muzzle = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 12, 12),
        bellyMaterial
      ));
      muzzle.position.set(0, 0.49, 0.46);
      muzzle.scale.set(0.96, 0.7, 1.08);
      group.add(muzzle);

      const nose = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 10, 10),
        noseMaterial
      ));
      nose.position.set(0, 0.52, 0.55);
      nose.scale.set(1, 0.75, 0.8);
      group.add(nose);

      [-0.08, 0.08].forEach((x) => {
        const eye = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.022, 10, 10),
          eyeMaterial
        ));
        eye.position.set(x, 0.58, 0.47);
        group.add(eye);
      });

      [
        [-0.11, 0.92, 0.24, 0.08, 0.12],
        [0.11, 0.94, 0.2, -0.04, -0.1]
      ].forEach(([x, y, z, rotZ, rotX]) => {
        const ear = finalizeMesh(new THREE.Mesh(
          new THREE.CapsuleGeometry(0.045, 0.42, 4, 8),
          furMaterial
        ));
        ear.position.set(x, y, z);
        ear.rotation.z = rotZ;
        ear.rotation.x = rotX;
        group.add(ear);

        const innerEar = finalizeMesh(new THREE.Mesh(
          new THREE.CapsuleGeometry(0.022, 0.32, 4, 8),
          innerEarMaterial
        ));
        innerEar.position.set(x, y - 0.02, z + 0.03);
        innerEar.rotation.z = rotZ;
        innerEar.rotation.x = rotX;
        group.add(innerEar);
      });

      [
        [-0.08, 0.16, 0.17],
        [0.08, 0.16, 0.17]
      ].forEach(([x, y, z]) => {
        const foreLeg = finalizeMesh(new THREE.Mesh(
          new THREE.CylinderGeometry(0.026, 0.03, 0.2, 8),
          furMaterial
        ));
        foreLeg.position.set(x, y, z);
        group.add(foreLeg);

        const paw = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.035, 8, 8),
          bellyMaterial
        ));
        paw.position.set(x, 0.05, z + 0.03);
        paw.scale.set(0.9, 0.55, 1.35);
        group.add(paw);
      });

      [
        [-0.13, 0.16, -0.15, 0.12],
        [0.13, 0.16, -0.15, -0.12]
      ].forEach(([x, y, z, rotZ]) => {
        const hindLeg = finalizeMesh(new THREE.Mesh(
          new THREE.CapsuleGeometry(0.06, 0.18, 4, 8),
          furMaterial
        ));
        hindLeg.position.set(x, y, z);
        hindLeg.rotation.z = rotZ;
        hindLeg.rotation.x = Math.PI / 2.4;
        group.add(hindLeg);

        const foot = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 8, 8),
          bellyMaterial
        ));
        foot.position.set(x, 0.05, z + 0.12);
        foot.scale.set(0.9, 0.45, 1.6);
        group.add(foot);
      });

      const tail = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 12, 12),
        bellyMaterial
      ));
      tail.position.set(0, 0.32, -0.42);
      tail.scale.set(1, 1, 0.92);
      group.add(tail);

      group.rotation.y = -0.14;
    } else if (type === 'rabbit2') {
      const furMaterial = new THREE.MeshStandardMaterial({
        color: 0xcda87f,
        roughness: 0.9,
        metalness: 0.03
      });
      const bellyMaterial = new THREE.MeshStandardMaterial({
        color: 0xf4eadb,
        roughness: 0.95,
        metalness: 0.0
      });
      const innerEarMaterial = new THREE.MeshStandardMaterial({
        color: 0xf2b8b2,
        roughness: 0.88,
        metalness: 0.0
      });
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        roughness: 0.75,
        metalness: 0.1
      });
      const noseMaterial = new THREE.MeshStandardMaterial({
        color: 0x9b6b5a,
        roughness: 0.82,
        metalness: 0.02
      });

      const body = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(0.21, 0.56, 6, 12),
        furMaterial
      ));
      body.position.set(0, 0.34, -0.04);
      body.rotation.x = Math.PI / 2;
      body.rotation.z = 0.08;
      group.add(body);

      const haunch = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.21, 14, 14),
        furMaterial
      ));
      haunch.position.set(0, 0.35, -0.24);
      haunch.scale.set(1.15, 1, 1.2);
      group.add(haunch);

      const chest = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 12, 12),
        bellyMaterial
      ));
      chest.position.set(0, 0.28, 0.22);
      chest.scale.set(0.9, 1.15, 0.78);
      group.add(chest);

      const head = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.19, 18, 18),
        furMaterial
      ));
      head.position.set(0, 0.6, 0.34);
      head.scale.set(0.98, 1, 1.12);
      group.add(head);

      const muzzle = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.105, 12, 12),
        bellyMaterial
      ));
      muzzle.position.set(0, 0.54, 0.5);
      muzzle.scale.set(0.94, 0.72, 1.1);
      group.add(muzzle);

      const nose = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 10, 10),
        noseMaterial
      ));
      nose.position.set(0, 0.57, 0.6);
      nose.scale.set(1, 0.8, 0.84);
      group.add(nose);

      [-0.082, 0.082].forEach((x) => {
        const eye = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.022, 10, 10),
          eyeMaterial
        ));
        eye.position.set(x, 0.64, 0.5);
        group.add(eye);
      });

      [
        [-0.11, 1.0, 0.22, 0.16, 0.18, 0.48],
        [0.13, 0.88, 0.26, -0.42, 0.42, 0.34]
      ].forEach(([x, y, z, rotZ, rotX, length]) => {
        const ear = finalizeMesh(new THREE.Mesh(
          new THREE.CapsuleGeometry(0.046, length, 4, 8),
          furMaterial
        ));
        ear.position.set(x, y, z);
        ear.rotation.z = rotZ;
        ear.rotation.x = rotX;
        group.add(ear);

        const innerEar = finalizeMesh(new THREE.Mesh(
          new THREE.CapsuleGeometry(0.022, length - 0.1, 4, 8),
          innerEarMaterial
        ));
        innerEar.position.set(x, y - 0.03, z + 0.025);
        innerEar.rotation.z = rotZ;
        innerEar.rotation.x = rotX;
        group.add(innerEar);
      });

      [
        [-0.08, 0.18, 0.2, 0.06],
        [0.08, 0.17, 0.18, -0.05]
      ].forEach(([x, y, z, tilt]) => {
        const foreLeg = finalizeMesh(new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.03, 0.22, 8),
          furMaterial
        ));
        foreLeg.position.set(x, y, z);
        foreLeg.rotation.z = tilt;
        group.add(foreLeg);

        const paw = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.034, 8, 8),
          bellyMaterial
        ));
        paw.position.set(x, 0.06, z + 0.05);
        paw.scale.set(0.9, 0.55, 1.25);
        group.add(paw);
      });

      [
        [-0.13, 0.18, -0.18, 0.22],
        [0.13, 0.2, -0.22, -0.28]
      ].forEach(([x, y, z, tilt]) => {
        const thigh = finalizeMesh(new THREE.Mesh(
          new THREE.CapsuleGeometry(0.07, 0.22, 4, 8),
          furMaterial
        ));
        thigh.position.set(x, y, z);
        thigh.rotation.z = tilt;
        thigh.rotation.x = Math.PI / 2.2;
        group.add(thigh);

        const foot = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.052, 8, 8),
          bellyMaterial
        ));
        foot.position.set(x, 0.05, z + 0.13);
        foot.scale.set(0.9, 0.45, 1.6);
        group.add(foot);
      });

      const tail = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 12),
        bellyMaterial
      ));
      tail.position.set(0, 0.34, -0.45);
      group.add(tail);

      group.rotation.y = 0.22;
    } else if (type === 'panda' || type === 'panda2') {
      const isPanda2 = type === 'panda2';
      const whiteMaterial = new THREE.MeshStandardMaterial({
        color: 0xfafaf9,
        roughness: 0.9,
        metalness: 0.02
      });
      const blackMaterial = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.92,
        metalness: 0.02
      });
      const pinkMaterial = new THREE.MeshStandardMaterial({
        color: 0xf1b8b2,
        roughness: 0.88,
        metalness: 0.0
      });
      const bambooMaterial = new THREE.MeshStandardMaterial({
        color: 0x4ade80,
        roughness: 0.76,
        metalness: 0.04
      });
      const bambooNodeMaterial = new THREE.MeshStandardMaterial({
        color: 0x16a34a,
        roughness: 0.72,
        metalness: 0.04
      });

      const body = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(isPanda2 ? 0.31 : 0.29, isPanda2 ? 0.58 : 0.52, 6, 12),
        whiteMaterial
      ));
      body.position.set(0, 0.42, -0.02);
      body.rotation.x = Math.PI / 2;
      body.scale.set(1.12, 1.02, 1);
      group.add(body);

      const belly = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.23, 14, 14),
        whiteMaterial
      ));
      belly.position.set(0, 0.34, 0.16);
      belly.scale.set(0.98, 1.12, 0.84);
      group.add(belly);

      [
        [-0.22, 0.4, 0.08, 0.2],
        [0.22, 0.4, 0.08, -0.2]
      ].forEach(([x, y, z, rotZ]) => {
        const shoulder = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.13, 12, 12),
          blackMaterial
        ));
        shoulder.position.set(x, y, z);
        shoulder.scale.set(1.05, 1.2, 0.92);
        shoulder.rotation.z = rotZ;
        group.add(shoulder);
      });

      const head = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(isPanda2 ? 0.24 : 0.22, 18, 18),
        whiteMaterial
      ));
      head.position.set(0, 0.76, 0.28);
      head.scale.set(1.02, 0.98, 1.04);
      group.add(head);

      const muzzle = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 12, 12),
        whiteMaterial
      ));
      muzzle.position.set(0, 0.68, 0.44);
      muzzle.scale.set(0.95, 0.72, 1.12);
      group.add(muzzle);

      const nose = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 10, 10),
        blackMaterial
      ));
      nose.position.set(0, 0.69, 0.53);
      nose.scale.set(1, 0.75, 0.82);
      group.add(nose);

      [-0.14, 0.14].forEach((x, index) => {
        const ear = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 10, 10),
          blackMaterial
        ));
        ear.position.set(x, 0.93, 0.18);
        ear.scale.set(1, 0.82, 0.9);
        ear.rotation.z = index === 0 ? 0.18 : -0.18;
        group.add(ear);

        const innerEar = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 8, 8),
          pinkMaterial
        ));
        innerEar.position.set(x, 0.92, 0.23);
        innerEar.scale.set(0.9, 0.6, 0.8);
        group.add(innerEar);
      });

      [-0.1, 0.1].forEach((x) => {
        const patch = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(isPanda2 ? 0.08 : 0.072, 12, 12),
          blackMaterial
        ));
        patch.position.set(x, 0.79, 0.41);
        patch.scale.set(0.92, 1.2, 0.38);
        patch.rotation.z = x < 0 ? 0.22 : -0.22;
        group.add(patch);

        const eye = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.022, 10, 10),
          blackMaterial
        ));
        eye.position.set(x, 0.8, 0.46);
        group.add(eye);
      });

      [
        [-0.18, 0.18, 0.18],
        [0.18, 0.18, 0.18]
      ].forEach(([x, y, z], index) => {
        const arm = finalizeMesh(new THREE.Mesh(
          new THREE.CapsuleGeometry(0.055, 0.26, 4, 8),
          blackMaterial
        ));
        arm.position.set(x, y, z);
        arm.rotation.z = index === 0 ? 0.24 : -0.24;
        arm.rotation.x = Math.PI / 12;
        group.add(arm);
      });

      [
        [-0.16, 0.18, -0.14],
        [0.16, 0.18, -0.14]
      ].forEach(([x, y, z], index) => {
        const leg = finalizeMesh(new THREE.Mesh(
          new THREE.CapsuleGeometry(0.065, 0.24, 4, 8),
          blackMaterial
        ));
        leg.position.set(x, y, z);
        leg.rotation.z = index === 0 ? 0.08 : -0.08;
        leg.rotation.x = Math.PI / 2.2;
        group.add(leg);

        const paw = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 8, 8),
          blackMaterial
        ));
        paw.position.set(x, 0.05, z + 0.08);
        paw.scale.set(1, 0.5, 1.24);
        group.add(paw);
      });

      if (isPanda2) {
        const bamboo = finalizeMesh(new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.62, 8),
          bambooMaterial
        ));
        bamboo.position.set(0.16, 0.42, 0.46);
        bamboo.rotation.z = -0.42;
        group.add(bamboo);

        [-0.18, 0, 0.18].forEach((offset) => {
          const node = finalizeMesh(new THREE.Mesh(
            new THREE.CylinderGeometry(0.045, 0.045, 0.035, 8),
            bambooNodeMaterial
          ));
          node.position.set(0.16 + offset * 0.18, 0.42 - offset * 0.07, 0.46 + offset * 0.08);
          node.rotation.z = -0.42;
          group.add(node);
        });

        group.rotation.y = 0.2;
      } else {
        group.rotation.y = -0.16;
      }
    } else if (type === 'pig' || type === 'pig2') {

      const isPig2 = type === 'pig2';
      const skinMaterial = new THREE.MeshStandardMaterial({
        color: isPig2 ? 0xf4a5bf : 0xf8bfd4,
        roughness: 0.88,
        metalness: 0.04
      });
      const accentMaterial = new THREE.MeshStandardMaterial({
        color: isPig2 ? 0xec84aa : 0xf59bbd,
        roughness: 0.82,
        metalness: 0.04
      });
      const hoofMaterial = new THREE.MeshStandardMaterial({
        color: 0x7c3f58,
        roughness: 0.9,
        metalness: 0.02
      });
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.75,
        metalness: 0.12
      });

      const body = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(isPig2 ? 0.26 : 0.24, isPig2 ? 0.52 : 0.46, 6, 12),
        skinMaterial
      ));
      body.position.set(0, 0.35, -0.02);
      body.rotation.x = Math.PI / 2;
      body.scale.set(1.1, 0.96, 1);
      group.add(body);

      const belly = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 12, 12),
        accentMaterial
      ));
      belly.position.set(0, 0.23, 0.04);
      belly.scale.set(1.05, 0.7, 0.88);
      group.add(belly);

      const head = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(isPig2 ? 0.22 : 0.2, 18, 18),
        skinMaterial
      ));
      head.position.set(0, 0.46, 0.34);
      head.scale.set(1, 0.92, 1.06);
      group.add(head);

      const snout = finalizeMesh(new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.105, 0.14, 14),
        accentMaterial
      ));
      snout.position.set(0, 0.42, 0.5);
      snout.rotation.x = Math.PI / 2;
      group.add(snout);

      [-0.03, 0.03].forEach((x) => {
        const nostril = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.012, 8, 8),
          hoofMaterial
        ));
        nostril.position.set(x, 0.42, 0.57);
        nostril.scale.set(1, 1.2, 0.7);
        group.add(nostril);
      });

      [-0.08, 0.08].forEach((x) => {
        const eye = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.02, 10, 10),
          eyeMaterial
        ));
        eye.position.set(x, 0.51, 0.46);
        group.add(eye);
      });

      [
        [-0.12, 0.58, 0.29, 0.22],
        [0.12, 0.58, 0.29, -0.22]
      ].forEach(([x, y, z, rotZ]) => {
        const ear = finalizeMesh(new THREE.Mesh(
          new THREE.ConeGeometry(0.08, 0.18, 4),
          skinMaterial
        ));
        ear.position.set(x, y, z);
        ear.rotation.z = rotZ;
        ear.rotation.x = 0.18;
        group.add(ear);
      });

      [
        [-0.14, 0.15, 0.18],
        [0.14, 0.15, 0.18],
        [-0.14, 0.15, -0.18],
        [0.14, 0.15, -0.18]
      ].forEach(([x, y, z]) => {
        const leg = finalizeMesh(new THREE.Mesh(
          new THREE.CylinderGeometry(0.038, 0.05, 0.22, 8),
          skinMaterial
        ));
        leg.position.set(x, y, z);
        group.add(leg);

        const hoof = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.042, 8, 8),
          hoofMaterial
        ));
        hoof.position.set(x, 0.02, z);
        hoof.scale.set(1, 0.5, 1.1);
        group.add(hoof);
      });

      if (isPig2) {
        [-0.09, 0.1].forEach((x, index) => {
          const patch = finalizeMesh(new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 10, 10),
            accentMaterial
          ));
          patch.position.set(x, 0.42 + index * 0.03, index === 0 ? -0.1 : 0.02);
          patch.scale.set(1.2, 0.8, 0.9);
          group.add(patch);
        });

        for (let i = 0; i < 3; i++) {
          const tailSegment = finalizeMesh(new THREE.Mesh(
            new THREE.TorusGeometry(0.05 - i * 0.01, 0.012, 8, 18, Math.PI * 1.35),
            accentMaterial
          ));
          tailSegment.position.set(0, 0.42 + i * 0.03, -0.34 - i * 0.02);
          tailSegment.rotation.x = Math.PI / 2;
          tailSegment.rotation.z = i * 0.25;
          group.add(tailSegment);
        }
      } else {
        const tail = finalizeMesh(new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.02, 0.2, 8),
          accentMaterial
        ));
        tail.position.set(0, 0.42, -0.34);
        tail.rotation.x = -0.8;
        group.add(tail);
      }
    } else if (type === 'chick' || type === 'chick2') {
      const isChick2 = type === 'chick2';
      const featherMaterial = new THREE.MeshStandardMaterial({
        color: isChick2 ? 0xf8b400 : 0xf6d84c,
        roughness: 0.84,
        metalness: 0.06
      });
      const wingMaterial = new THREE.MeshStandardMaterial({
        color: isChick2 ? 0xf59e0b : 0xfacc15,
        roughness: 0.88,
        metalness: 0.04
      });
      const beakMaterial = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        roughness: 0.7,
        metalness: 0.08
      });
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.72,
        metalness: 0.14
      });

      const body = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(isChick2 ? 0.22 : 0.2, 18, 18),
        featherMaterial
      ));
      body.position.set(0, 0.28, -0.01);
      body.scale.set(1, 0.96, 1.02);
      group.add(body);

      const head = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(isChick2 ? 0.17 : 0.16, 18, 18),
        featherMaterial
      ));
      head.position.set(0, 0.5, 0.2);
      group.add(head);

      [-0.08, 0, 0.08].forEach((x, index) => {
        const tuft = finalizeMesh(new THREE.Mesh(
          new THREE.ConeGeometry(index === 1 ? 0.05 : 0.04, index === 1 ? 0.12 : 0.1, 5),
          wingMaterial
        ));
        tuft.position.set(x, 0.68 + index * 0.01, 0.16);
        tuft.rotation.x = -0.2;
        tuft.rotation.z = x * -1.6;
        group.add(tuft);
      });

      const beak = finalizeMesh(new THREE.Mesh(
        new THREE.ConeGeometry(isChick2 ? 0.055 : 0.05, 0.18, 4),
        beakMaterial
      ));
      beak.position.set(0, 0.48, 0.37);
      beak.rotation.x = Math.PI / 2;
      group.add(beak);

      [-0.06, 0.06].forEach((x) => {
        const eye = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.022, 10, 10),
          eyeMaterial
        ));
        eye.position.set(x, 0.55, 0.3);
        group.add(eye);
      });

      [
        [-0.17, 0.31, 0.05, 0.48],
        [0.17, 0.31, 0.05, -0.48]
      ].forEach(([x, y, z, rotZ]) => {
        const wing = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(isChick2 ? 0.09 : 0.08, 12, 12),
          wingMaterial
        ));
        wing.position.set(x, y, z);
        wing.scale.set(0.62, 0.92, 1.18);
        wing.rotation.z = rotZ;
        if (isChick2) {
          wing.rotation.x = 0.16;
        }
        group.add(wing);
      });

      [
        [-0.06, 0.08, 0.09],
        [0.06, 0.08, 0.09]
      ].forEach(([x, y, z]) => {
        const leg = finalizeMesh(new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.016, 0.14, 6),
          beakMaterial
        ));
        leg.position.set(x, y, z);
        group.add(leg);

        [-0.03, 0, 0.03].forEach((toeX) => {
          const toe = finalizeMesh(new THREE.Mesh(
            new THREE.CylinderGeometry(0.005, 0.006, 0.06, 5),
            beakMaterial
          ));
          toe.position.set(x + toeX, 0.01, z + 0.05);
          toe.rotation.x = Math.PI / 2;
          toe.rotation.z = toeX * 3;
          group.add(toe);
        });
      });

      const tail = finalizeMesh(new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.12, 4),
        wingMaterial
      ));
      tail.position.set(0, 0.28, -0.18);
      tail.rotation.x = -Math.PI / 2.8;
      group.add(tail);
    } else if (type === 'penguin' || type === 'penguin2') {
      const isPenguin2 = type === 'penguin2';
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.86,
        metalness: 0.04
      });
      const bellyMaterial = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.92,
        metalness: 0.0
      });
      const beakMaterial = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.76,
        metalness: 0.06
      });
      const accentMaterial = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.7,
        metalness: 0.08
      });
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.74,
        metalness: 0.12
      });

      const body = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(isPenguin2 ? 0.24 : 0.22, isPenguin2 ? 0.62 : 0.56, 6, 12),
        bodyMaterial
      ));
      body.position.set(0, 0.42, 0);
      body.scale.set(1, 1.1, 1);
      group.add(body);

      const belly = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 14, 14),
        bellyMaterial
      ));
      belly.position.set(0, 0.36, 0.16);
      belly.scale.set(0.92, 1.28, 0.72);
      group.add(belly);

      const head = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(isPenguin2 ? 0.19 : 0.18, 18, 18),
        bodyMaterial
      ));
      head.position.set(0, 0.83, 0.16);
      head.scale.set(1.02, 1, 1.04);
      group.add(head);

      const face = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 12, 12),
        bellyMaterial
      ));
      face.position.set(0, 0.8, 0.26);
      face.scale.set(0.92, 0.82, 0.8);
      group.add(face);

      const beak = finalizeMesh(new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.18, 4),
        beakMaterial
      ));
      beak.position.set(0, 0.76, 0.4);
      beak.rotation.x = Math.PI / 2;
      group.add(beak);

      [-0.07, 0.07].forEach((x) => {
        const eye = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.022, 10, 10),
          eyeMaterial
        ));
        eye.position.set(x, 0.85, 0.3);
        group.add(eye);
      });

      [
        [-0.2, 0.45, 0.06, 0.22],
        [0.2, 0.45, 0.06, -0.22]
      ].forEach(([x, y, z, rotZ]) => {
        const flipper = finalizeMesh(new THREE.Mesh(
          new THREE.CapsuleGeometry(0.05, 0.32, 4, 8),
          bodyMaterial
        ));
        flipper.position.set(x, y, z);
        flipper.rotation.z = rotZ;
        flipper.rotation.x = Math.PI / 7;
        group.add(flipper);
      });

      [
        [-0.09, 0.08, 0.13],
        [0.09, 0.08, 0.13]
      ].forEach(([x, y, z]) => {
        const leg = finalizeMesh(new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.022, 0.12, 6),
          bodyMaterial
        ));
        leg.position.set(x, y, z);
        group.add(leg);

        const foot = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 8, 8),
          beakMaterial
        ));
        foot.position.set(x, 0.01, z + 0.05);
        foot.scale.set(1.35, 0.35, 1.15);
        group.add(foot);
      });

      const tail = finalizeMesh(new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.12, 4),
        bodyMaterial
      ));
      tail.position.set(0, 0.28, -0.2);
      tail.rotation.x = -Math.PI / 2.7;
      group.add(tail);

      if (isPenguin2) {
        const scarf = finalizeMesh(new THREE.Mesh(
          new THREE.TorusGeometry(0.1, 0.025, 8, 20),
          accentMaterial
        ));
        scarf.position.set(0, 0.63, 0.16);
        scarf.rotation.x = Math.PI / 2;
        group.add(scarf);

        const scarfTail = finalizeMesh(new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.18, 0.04),
          accentMaterial
        ));
        scarfTail.position.set(0.08, 0.54, 0.25);
        scarfTail.rotation.z = -0.18;
        group.add(scarfTail);

        group.rotation.y = 0.12;
      } else {
        group.rotation.y = -0.12;
      }
    } else if (type === 'frog' || type === 'frog2') {

      const isFrog2 = type === 'frog2';
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: isFrog2 ? 0x1fb66f : 0x58d68d,
        roughness: 0.88,
        metalness: 0.03
      });
      const bellyMaterial = new THREE.MeshStandardMaterial({
        color: 0xd9f99d,
        roughness: 0.94,
        metalness: 0.0
      });
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.7,
        metalness: 0.12
      });
      const pupilMaterial = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.8,
        metalness: 0.08
      });
      const spotMaterial = new THREE.MeshStandardMaterial({
        color: isFrog2 ? 0x047857 : 0x16a34a,
        roughness: 0.9,
        metalness: 0.02
      });

      const body = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 18, 18),
        bodyMaterial
      ));
      body.position.set(0, 0.26, 0);
      body.scale.set(1.15, 0.72, 1.08);
      group.add(body);

      const belly = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 14, 14),
        bellyMaterial
      ));
      belly.position.set(0, 0.19, 0.12);
      belly.scale.set(1.05, 0.7, 0.82);
      group.add(belly);

      const head = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 18, 18),
        bodyMaterial
      ));
      head.position.set(0, 0.36, 0.2);
      head.scale.set(1.15, 0.62, 1.02);
      group.add(head);

      [-0.12, 0.12].forEach((x) => {
        const eyeStem = finalizeMesh(new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.04, 0.1, 8),
          bodyMaterial
        ));
        eyeStem.position.set(x, 0.49, 0.19);
        eyeStem.rotation.z = x < 0 ? 0.08 : -0.08;
        group.add(eyeStem);

        const eye = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 12, 12),
          eyeMaterial
        ));
        eye.position.set(x, 0.56, 0.21);
        group.add(eye);

        const pupil = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.022, 10, 10),
          pupilMaterial
        ));
        pupil.position.set(x, 0.57, 0.27);
        pupil.scale.set(0.75, 1.1, 0.7);
        group.add(pupil);
      });

      const mouth = finalizeMesh(new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.012, 6, 18, Math.PI),
        spotMaterial
      ));
      mouth.position.set(0, 0.31, 0.28);
      mouth.rotation.x = Math.PI;
      group.add(mouth);

      [
        [-0.14, 0.16, 0.14, 0.48],
        [0.14, 0.16, 0.14, -0.48]
      ].forEach(([x, y, z, rotZ]) => {
        const foreLeg = finalizeMesh(new THREE.Mesh(
          new THREE.CylinderGeometry(0.022, 0.028, 0.18, 8),
          bodyMaterial
        ));
        foreLeg.position.set(x, y, z);
        foreLeg.rotation.z = rotZ;
        group.add(foreLeg);

        const hand = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 8, 8),
          bodyMaterial
        ));
        hand.position.set(x + (x < 0 ? -0.03 : 0.03), 0.04, z + 0.05);
        hand.scale.set(1.25, 0.4, 1.4);
        group.add(hand);
      });

      [
        [-0.16, 0.2, -0.12, 0.38],
        [0.16, 0.2, -0.12, -0.38]
      ].forEach(([x, y, z, rotZ]) => {
        const thigh = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 10, 10),
          bodyMaterial
        ));
        thigh.position.set(x, y, z);
        thigh.scale.set(1.2, 0.85, 0.9);
        group.add(thigh);

        const calf = finalizeMesh(new THREE.Mesh(
          new THREE.CapsuleGeometry(0.04, 0.2, 4, 8),
          bodyMaterial
        ));
        calf.position.set(x + (x < 0 ? -0.06 : 0.06), 0.12, z + 0.1);
        calf.rotation.z = rotZ;
        calf.rotation.x = Math.PI / 2.4;
        group.add(calf);

        const foot = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 8, 8),
          bellyMaterial
        ));
        foot.position.set(x + (x < 0 ? -0.12 : 0.12), 0.03, z + 0.22);
        foot.scale.set(1.6, 0.35, 1.2);
        group.add(foot);
      });

      const spotPositions = isFrog2
        ? [[-0.08, 0.36, -0.04], [0.09, 0.32, 0.02], [0, 0.4, -0.12], [-0.02, 0.29, 0.08]]
        : [[-0.06, 0.34, -0.08], [0.07, 0.31, -0.02]];

      spotPositions.forEach(([x, y, z]) => {
        const spot = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(isFrog2 ? 0.045 : 0.035, 8, 8),
          spotMaterial
        ));
        spot.position.set(x, y, z);
        spot.scale.set(1.2, 0.55, 1);
        group.add(spot);
      });

      group.rotation.y = isFrog2 ? 0.24 : -0.18;
    } else if (type === 'bee' || type === 'bee2') {

      // 蜜蜂 - 根据类型创建不同的蜜蜂模型
      if (type === 'bee') {
        // 蜜蜂1 - 普通工蜂：典型黄黑条纹，透明翅膀，细长体型
        const yellowMaterial = new THREE.MeshStandardMaterial({
          color: 0xfacc15, // 明亮黄色
          roughness: 0.6,
          metalness: 0.3
        });
        
        const blackMaterial = new THREE.MeshStandardMaterial({
          color: 0x000000,
          roughness: 0.8,
          metalness: 0.1
        });
        
        // 身体 - 椭圆形腹部，横向放置
        const body = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.12, 0.5, 8, 16),
          yellowMaterial
        );
        body.position.set(0, 0.5, 0);
        body.rotation.x = Math.PI / 2; // 旋转90度，使身体横向
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // 黑色条纹 - 3条明显的条纹
        for (let i = 0; i < 3; i++) {
          const stripe = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.14, 0.12, 16),
            blackMaterial
          );
          stripe.position.set(0, 0.5, -0.2 + i * 0.2); // 横向排列条纹
          stripe.rotation.x = Math.PI / 2; // 旋转90度
          stripe.castShadow = true;
          stripe.receiveShadow = true;
          group.add(stripe);
        }
        
        // 头部
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 16, 16),
          yellowMaterial
        );
        head.position.set(0, 0.5, 0.35); // 头部在身体前方
        head.castShadow = true;
        head.receiveShadow = true;
        group.add(head);
        
        // 眼睛 - 深蓝色，带有光泽
        const eyeMaterial = new THREE.MeshStandardMaterial({
          color: 0x1e40af,
          roughness: 0.2,
          metalness: 0.8,
          emissive: 0x1e40af,
          emissiveIntensity: 0.3
        });
        
        const eyeGeometry = new THREE.SphereGeometry(0.035, 16, 16);
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(0.07, 0.55, 0.35); // 眼睛在头部两侧
        group.add(eye1);
        
        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(-0.07, 0.55, 0.35);
        group.add(eye2);
        
        // 触角 - 细长，末端有小球
        for (let i = 0; i < 2; i++) {
          const antenna = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.008, 0.18, 6),
            yellowMaterial
          );
          
          const x = i === 0 ? 0.04 : -0.04;
          antenna.position.set(x, 0.62, 0.32);
          antenna.rotation.x = -Math.PI / 4;
          group.add(antenna);
          
          // 触角末梢
          const antennaTip = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 8, 8),
            blackMaterial
          );
          antennaTip.position.set(0, -0.18, 0);
          antenna.add(antennaTip);
        }
        
        // 口器 - 吸管状
        const proboscis = new THREE.Mesh(
          new THREE.CylinderGeometry(0.01, 0.01, 0.1, 6),
          blackMaterial
        );
        proboscis.position.set(0, 0.45, 0.45); // 口器在头部前方
        proboscis.rotation.x = Math.PI / 6;
        group.add(proboscis);
        
        // 翅膀 - 半透明，带有光泽，长在身体两侧
        const wingMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          opacity: 0.8,
          transparent: true,
          roughness: 0.3,
          metalness: 0.7,
          emissive: 0x4b5563,
          emissiveIntensity: 0.2
        });
        
        // 主翅膀
        const wingGeometry = new THREE.PlaneGeometry(0.4, 0.35);
        
        const wing1 = new THREE.Mesh(wingGeometry, wingMaterial);
        wing1.position.set(0.2, 0.55, 0); // 右侧翅膀
        wing1.rotation.z = Math.PI / 10;
        wing1.castShadow = true;
        wing1.receiveShadow = true;
        group.add(wing1);
        
        const wing2 = new THREE.Mesh(wingGeometry, wingMaterial);
        wing2.position.set(-0.2, 0.55, 0); // 左侧翅膀
        wing2.rotation.z = -Math.PI / 10;
        wing2.castShadow = true;
        wing2.receiveShadow = true;
        group.add(wing2);
        
        // 后翅
        const hindWingGeometry = new THREE.PlaneGeometry(0.25, 0.2);
        
        const hindWing1 = new THREE.Mesh(hindWingGeometry, wingMaterial);
        hindWing1.position.set(0.18, 0.5, -0.1); // 右侧后翅
        hindWing1.rotation.z = Math.PI / 6;
        hindWing1.castShadow = true;
        hindWing1.receiveShadow = true;
        group.add(hindWing1);
        
        const hindWing2 = new THREE.Mesh(hindWingGeometry, wingMaterial);
        hindWing2.position.set(-0.18, 0.5, -0.1); // 左侧后翅
        hindWing2.rotation.z = -Math.PI / 6;
        hindWing2.castShadow = true;
        hindWing2.receiveShadow = true;
        group.add(hindWing2);
        
        // 腿部 - 6条腿，细长，长在身体下方
        const legMaterial = new THREE.MeshStandardMaterial({
          color: 0x000000,
          roughness: 0.7,
          metalness: 0.2
        });
        
        const legGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6);
        
        // 前腿
        for (let i = 0; i < 2; i++) {
          const leg = new THREE.Mesh(legGeometry, legMaterial);
          const x = i === 0 ? 0.12 : -0.12;
          leg.position.set(x, 0.4, 0.25); // 前腿在身体前方
          leg.rotation.z = i === 0 ? Math.PI / 6 : -Math.PI / 6;
          group.add(leg);
        }
        
        // 中腿
        for (let i = 0; i < 2; i++) {
          const leg = new THREE.Mesh(legGeometry, legMaterial);
          const x = i === 0 ? 0.13 : -0.13;
          leg.position.set(x, 0.4, 0); // 中腿在身体中间
          group.add(leg);
        }
        
        // 后腿
        for (let i = 0; i < 2; i++) {
          const leg = new THREE.Mesh(legGeometry, legMaterial);
          const x = i === 0 ? 0.12 : -0.12;
          leg.position.set(x, 0.4, -0.25); // 后腿在身体后方
          leg.rotation.z = i === 0 ? -Math.PI / 6 : Math.PI / 6;
          group.add(leg);
        }
      } else if (type === 'bee2') {
        // 蜜蜂2 - 熊蜂：体型较大，毛茸茸，深黄色条纹
        const darkYellowMaterial = new THREE.MeshStandardMaterial({
          color: 0xf59e0b, // 深黄色
          roughness: 0.8,
          metalness: 0.1
        });
        
        const blackMaterial = new THREE.MeshStandardMaterial({
          color: 0x000000,
          roughness: 0.9,
          metalness: 0.05
        });
        
        // 身体 - 圆形，毛茸茸，横向放置
        const body = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.18, 0.45, 8, 16),
          darkYellowMaterial
        );
        body.position.set(0, 0.5, 0);
        body.rotation.x = Math.PI / 2; // 旋转90度，使身体横向
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // 黑色条纹 - 2条宽条纹
        for (let i = 0; i < 2; i++) {
          const stripe = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 0.18, 16),
            blackMaterial
          );
          stripe.position.set(0, 0.5, -0.15 + i * 0.3); // 横向排列条纹
          stripe.rotation.x = Math.PI / 2; // 旋转90度
          stripe.castShadow = true;
          stripe.receiveShadow = true;
          group.add(stripe);
        }
        
        // 胸部 - 毛茸茸的外观
        const thorax = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 16, 16),
          blackMaterial
        );
        thorax.position.set(0, 0.55, 0.2); // 胸部在身体前方
        thorax.castShadow = true;
        thorax.receiveShadow = true;
        group.add(thorax);
        
        // 头部 - 较大，圆形
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 16, 16),
          darkYellowMaterial
        );
        head.position.set(0, 0.55, 0.4); // 头部在胸部前方
        head.castShadow = true;
        head.receiveShadow = true;
        group.add(head);
        
        // 眼睛 - 深棕色，较大
        const eyeMaterial = new THREE.MeshStandardMaterial({
          color: 0x78350f,
          roughness: 0.4,
          metalness: 0.3
        });
        
        const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(0.1, 0.6, 0.4); // 眼睛在头部两侧
        group.add(eye1);
        
        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(-0.1, 0.6, 0.4);
        group.add(eye2);
        
        // 触角 - 短粗
        for (let i = 0; i < 2; i++) {
          const antenna = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.12, 6),
            blackMaterial
          );
          
          const x = i === 0 ? 0.08 : -0.08;
          antenna.position.set(x, 0.7, 0.38);
          antenna.rotation.x = -Math.PI / 4;
          group.add(antenna);
          
          // 触角末梢 - 较大
          const antennaTip = new THREE.Mesh(
            new THREE.SphereGeometry(0.03, 8, 8),
            darkYellowMaterial
          );
          antennaTip.position.set(0, -0.12, 0);
          antenna.add(antennaTip);
        }
        
        // 口器 - 短粗
        const proboscis = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.015, 0.08, 6),
          blackMaterial
        );
        proboscis.position.set(0, 0.5, 0.5); // 口器在头部前方
        proboscis.rotation.x = Math.PI / 6;
        group.add(proboscis);
        
        // 翅膀 - 半透明，带有光泽，长在身体两侧
        const wingMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          opacity: 0.8,
          transparent: true,
          roughness: 0.3,
          metalness: 0.7,
          emissive: 0x4b5563,
          emissiveIntensity: 0.2
        });
        
        // 主翅膀
        const wingGeometry = new THREE.PlaneGeometry(0.5, 0.45);
        
        const wing1 = new THREE.Mesh(wingGeometry, wingMaterial);
        wing1.position.set(0.25, 0.6, 0); // 右侧翅膀
        wing1.rotation.z = Math.PI / 8;
        wing1.castShadow = true;
        wing1.receiveShadow = true;
        group.add(wing1);
        
        const wing2 = new THREE.Mesh(wingGeometry, wingMaterial);
        wing2.position.set(-0.25, 0.6, 0); // 左侧翅膀
        wing2.rotation.z = -Math.PI / 8;
        wing2.castShadow = true;
        wing2.receiveShadow = true;
        group.add(wing2);
        
        // 后翅
        const hindWingGeometry = new THREE.PlaneGeometry(0.3, 0.25);
        
        const hindWing1 = new THREE.Mesh(hindWingGeometry, wingMaterial);
        hindWing1.position.set(0.22, 0.55, -0.15); // 右侧后翅
        hindWing1.rotation.z = Math.PI / 5;
        hindWing1.castShadow = true;
        hindWing1.receiveShadow = true;
        group.add(hindWing1);
        
        const hindWing2 = new THREE.Mesh(hindWingGeometry, wingMaterial);
        hindWing2.position.set(-0.22, 0.55, -0.15); // 左侧后翅
        hindWing2.rotation.z = -Math.PI / 5;
        hindWing2.castShadow = true;
        hindWing2.receiveShadow = true;
        group.add(hindWing2);
        
        // 腿部 - 粗壮，覆盖绒毛，长在身体下方
        const legMaterial = new THREE.MeshStandardMaterial({
          color: 0x000000,
          roughness: 0.9,
          metalness: 0.05
        });
        
        const legGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.25, 8);
        
        // 前腿
        for (let i = 0; i < 2; i++) {
          const leg = new THREE.Mesh(legGeometry, legMaterial);
          const x = i === 0 ? 0.2 : -0.2;
          leg.position.set(x, 0.4, 0.2); // 前腿在身体前方
          leg.rotation.z = i === 0 ? Math.PI / 5 : -Math.PI / 5;
          group.add(leg);
        }
        
        // 中腿
        for (let i = 0; i < 2; i++) {
          const leg = new THREE.Mesh(legGeometry, legMaterial);
          const x = i === 0 ? 0.22 : -0.22;
          leg.position.set(x, 0.4, 0); // 中腿在身体中间
          group.add(leg);
        }
        
        // 后腿
        for (let i = 0; i < 2; i++) {
          const leg = new THREE.Mesh(legGeometry, legMaterial);
          const x = i === 0 ? 0.2 : -0.2;
          leg.position.set(x, 0.4, -0.2); // 后腿在身体后方
          leg.rotation.z = i === 0 ? -Math.PI / 5 : Math.PI / 5;
          group.add(leg);
        }
      }
    } else if (type === 'sheep' || type === 'sheep2') {
      const isSheep2 = type === 'sheep2';
      const woolMaterial = new THREE.MeshStandardMaterial({
        color: 0xfafaf9,
        roughness: 0.96,
        metalness: 0.0
      });
      const faceMaterial = new THREE.MeshStandardMaterial({
        color: isSheep2 ? 0x3f3f46 : 0x52525b,
        roughness: 0.88,
        metalness: 0.02
      });
      const innerEarMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5c6b8,
        roughness: 0.84,
        metalness: 0.0
      });
      const bellMaterial = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.46,
        metalness: 0.58
      });
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.8,
        metalness: 0.08
      });

      const bodyCore = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(isSheep2 ? 0.22 : 0.2, isSheep2 ? 0.5 : 0.44, 6, 12),
        woolMaterial
      ));
      bodyCore.position.set(0, 0.38, -0.02);
      bodyCore.rotation.x = Math.PI / 2;
      bodyCore.scale.set(1.08, 0.98, 1);
      group.add(bodyCore);

      const woolClusters = isSheep2
        ? [
            [-0.12, 0.49, 0.02, 0.11], [0.1, 0.5, 0.08, 0.1], [0, 0.56, -0.02, 0.12],
            [-0.08, 0.32, -0.12, 0.09], [0.1, 0.34, -0.14, 0.1], [0, 0.35, 0.18, 0.11],
            [-0.18, 0.42, -0.04, 0.1], [0.18, 0.42, -0.02, 0.1], [0.02, 0.28, -0.2, 0.09]
          ]
        : [
            [-0.1, 0.47, 0.02, 0.1], [0.09, 0.48, 0.06, 0.09], [0, 0.53, -0.01, 0.1],
            [-0.08, 0.34, -0.11, 0.08], [0.08, 0.35, -0.12, 0.08], [0, 0.33, 0.16, 0.09],
            [-0.16, 0.41, -0.02, 0.08], [0.16, 0.4, -0.01, 0.08]
          ];

      woolClusters.forEach(([x, y, z, size]) => {
        const wool = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(size, 10, 10),
          woolMaterial
        ));
        wool.position.set(x, y, z);
        wool.scale.set(1.08, 0.96, 1.04);
        group.add(wool);
      });

      const head = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(0.11, 0.18, 4, 8),
        faceMaterial
      ));
      head.position.set(0, 0.48, 0.34);
      head.rotation.x = Math.PI / 2;
      head.scale.set(0.95, 0.92, 1.12);
      group.add(head);

      const muzzle = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 10, 10),
        faceMaterial
      ));
      muzzle.position.set(0, 0.44, 0.49);
      muzzle.scale.set(0.92, 0.72, 1.12);
      group.add(muzzle);

      [-0.06, 0.06].forEach((x) => {
        const eye = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.018, 10, 10),
          eyeMaterial
        ));
        eye.position.set(x, 0.53, 0.46);
        group.add(eye);
      });

      [
        [-0.11, 0.57, 0.31, 0.3],
        [0.11, 0.57, 0.31, -0.3]
      ].forEach(([x, y, z, rotZ]) => {
        const ear = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 10, 10),
          faceMaterial
        ));
        ear.position.set(x, y, z);
        ear.scale.set(0.6, 1.15, 0.4);
        ear.rotation.z = rotZ;
        group.add(ear);

        const innerEar = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.028, 8, 8),
          innerEarMaterial
        ));
        innerEar.position.set(x, y - 0.01, z + 0.02);
        innerEar.scale.set(0.5, 0.8, 0.35);
        innerEar.rotation.z = rotZ;
        group.add(innerEar);
      });

      [
        [-0.13, 0.16, 0.16], [0.13, 0.16, 0.16],
        [-0.13, 0.16, -0.14], [0.13, 0.16, -0.14]
      ].forEach(([x, y, z]) => {
        const leg = finalizeMesh(new THREE.Mesh(
          new THREE.CylinderGeometry(0.032, 0.04, 0.24, 8),
          faceMaterial
        ));
        leg.position.set(x, y, z);
        group.add(leg);

        const hoof = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.036, 8, 8),
          faceMaterial
        ));
        hoof.position.set(x, 0.02, z);
        hoof.scale.set(1, 0.45, 1.05);
        group.add(hoof);
      });

      if (isSheep2) {
        const bell = finalizeMesh(new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.075, 0.1, 10),
          bellMaterial
        ));
        bell.position.set(0, 0.26, 0.25);
        group.add(bell);

        const bellClapper = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.018, 8, 8),
          faceMaterial
        ));
        bellClapper.position.set(0, 0.21, 0.25);
        group.add(bellClapper);

        group.rotation.y = 0.18;
      } else {
        group.rotation.y = -0.12;
      }
    } else if (type === 'bear' || type === 'bear2') {
      const isPolarBear = type === 'bear2';
      const furMaterial = new THREE.MeshStandardMaterial({
        color: isPolarBear ? 0xf1f5f9 : 0x6f4a2d,
        roughness: 0.92,
        metalness: 0.02
      });
      const accentMaterial = new THREE.MeshStandardMaterial({
        color: isPolarBear ? 0xe2e8f0 : 0x8a5b33,
        roughness: 0.94,
        metalness: 0.0
      });
      const darkMaterial = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.9,
        metalness: 0.02
      });
      const clawMaterial = new THREE.MeshStandardMaterial({
        color: isPolarBear ? 0xcbd5e1 : 0xa8a29e,
        roughness: 0.72,
        metalness: 0.18
      });

      const body = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(isPolarBear ? 0.28 : 0.3, isPolarBear ? 0.72 : 0.62, 6, 12),
        furMaterial
      ));
      body.position.set(0, 0.46, -0.02);
      body.rotation.x = Math.PI / 2;
      body.scale.set(isPolarBear ? 1.22 : 1.08, 1, 1);
      group.add(body);

      const chest = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(isPolarBear ? 0.24 : 0.26, 14, 14),
        accentMaterial
      ));
      chest.position.set(0, 0.44, 0.24);
      chest.scale.set(1.02, 1.08, 0.86);
      group.add(chest);

      if (!isPolarBear) {
        const hump = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.19, 12, 12),
          accentMaterial
        ));
        hump.position.set(0, 0.64, 0.08);
        hump.scale.set(1.15, 0.9, 1.1);
        group.add(hump);
      }

      const haunch = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(isPolarBear ? 0.24 : 0.26, 12, 12),
        furMaterial
      ));
      haunch.position.set(0, 0.45, -0.28);
      haunch.scale.set(1.12, 1, 1.08);
      group.add(haunch);

      const neck = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(isPolarBear ? 0.12 : 0.13, isPolarBear ? 0.22 : 0.18, 4, 8),
        furMaterial
      ));
      neck.position.set(0, 0.58, 0.32);
      neck.rotation.x = isPolarBear ? -0.76 : -0.6;
      group.add(neck);

      const head = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(isPolarBear ? 0.21 : 0.2, 18, 18),
        furMaterial
      ));
      head.position.set(0, 0.66, isPolarBear ? 0.56 : 0.5);
      head.scale.set(isPolarBear ? 1.12 : 1, 0.95, 1.08);
      group.add(head);

      const muzzle = finalizeMesh(new THREE.Mesh(
        new THREE.CapsuleGeometry(isPolarBear ? 0.085 : 0.09, isPolarBear ? 0.22 : 0.16, 4, 8),
        accentMaterial
      ));
      muzzle.position.set(0, 0.61, isPolarBear ? 0.78 : 0.66);
      muzzle.rotation.x = Math.PI / 2;
      muzzle.scale.set(isPolarBear ? 0.95 : 1.05, 0.78, 1.08);
      group.add(muzzle);

      const nose = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 10, 10),
        darkMaterial
      ));
      nose.position.set(0, 0.61, isPolarBear ? 0.92 : 0.77);
      nose.scale.set(1, 0.8, 0.9);
      group.add(nose);

      [-0.12, 0.12].forEach((x) => {
        const ear = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.075, 10, 10),
          furMaterial
        ));
        ear.position.set(x, 0.84, isPolarBear ? 0.49 : 0.45);
        ear.scale.set(0.9, 0.82, 0.8);
        group.add(ear);
      });

      [-0.08, 0.08].forEach((x) => {
        const eye = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(0.022, 10, 10),
          darkMaterial
        ));
        eye.position.set(x, 0.69, isPolarBear ? 0.73 : 0.64);
        group.add(eye);
      });

      [
        [-0.19, 0.2, 0.2, 0.08],
        [0.19, 0.2, 0.2, -0.08],
        [-0.21, 0.2, -0.18, -0.05],
        [0.21, 0.2, -0.18, 0.05]
      ].forEach(([x, y, z, tilt], index) => {
        const isFront = index < 2;
        const leg = finalizeMesh(new THREE.Mesh(
          new THREE.CapsuleGeometry(isFront ? 0.07 : 0.075, isFront ? 0.28 : 0.3, 4, 8),
          furMaterial
        ));
        leg.position.set(x, y, z);
        leg.rotation.z = tilt;
        leg.rotation.x = isFront ? Math.PI / 18 : Math.PI / 8;
        group.add(leg);

        const paw = finalizeMesh(new THREE.Mesh(
          new THREE.SphereGeometry(isFront ? 0.065 : 0.07, 8, 8),
          accentMaterial
        ));
        paw.position.set(x, 0.04, z + (isFront ? 0.07 : 0.05));
        paw.scale.set(1.2, 0.45, isFront ? 1.5 : 1.35);
        group.add(paw);

        [-0.04, -0.015, 0.015, 0.04].forEach((toeOffset, toeIndex) => {
          const claw = finalizeMesh(new THREE.Mesh(
            new THREE.ConeGeometry(0.012, isPolarBear ? 0.07 : 0.06, 4),
            clawMaterial
          ));
          claw.position.set(x + toeOffset, 0.02, z + (isFront ? 0.15 : 0.11) + toeIndex * 0.002);
          claw.rotation.x = Math.PI / 2;
          group.add(claw);
        });
      });

      const tail = finalizeMesh(new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        furMaterial
      ));
      tail.position.set(0, 0.42, -0.54);
      tail.scale.set(1, 0.7, 0.8);
      group.add(tail);

      group.rotation.y = isPolarBear ? 0.18 : -0.16;
    } else {

      // 默认创建兔子
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.7,
        metalness: 0.1
      });
      
      // 身体
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.3, 4, 8), bodyMaterial);
      body.position.set(0, 0.3, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        bodyMaterial
      );
      head.position.set(0, 0.5, 0.3);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
    }
    
    return group;
  }

  /**
   * 创建实体
   */
  private createEntity(type: string, x: number, z: number): THREE.Object3D | null {
    if (!this.scene) return null;
    
    let mesh: any;
    const isPlant = SPECIES.plants.some(p => p.id === type);
    const isAnimal = SPECIES.animals.some(a => a.id === type);
    
    if (isPlant) {
      mesh = this.createPlant(type);
      mesh.userData = mesh.userData || {};
      mesh.userData.isAnimal = false;
      mesh.userData.isPlant = true;
    } else if (isAnimal) {
      mesh = this.createAnimal(type);
      mesh.userData = mesh.userData || {};
      mesh.userData.isAnimal = true;
      mesh.userData.isPlant = false;
    } else {
      mesh = this.createPlant('pine');
      mesh.userData = mesh.userData || {};
      mesh.userData.isAnimal = false;
      mesh.userData.isPlant = true;
    }
    
    // 设置位置
    if (mesh instanceof THREE.Group) {
      mesh.position.set(x, 2.5, z);
    } else if (mesh.geometry) {
      const height = (mesh.geometry as any).parameters?.height || 0;
      mesh.position.set(x, 2.5 + height / 2, z);
    } else {
      mesh.position.set(x, 2.5, z);
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }

  /**
   * 检查位置是否有效
   */
  private checkPositionValidity(x: number, z: number, entitySize: number = 1.5): boolean {
    const GROUND_SIZE = 180;
    const distanceFromCenter = Math.sqrt(x * x + z * z);
    if (distanceFromCenter > GROUND_SIZE / 2 - entitySize) {
      return false;
    }
    
    for (const entity of this.entities) {
      if (entity && entity.position) {
        const dx = x - entity.position.x;
        const dz = z - entity.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance < entitySize * 1.5) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * 生成有效的随机位置
   */
  private generateValidPosition(entitySize: number = 1.5): { x: number; z: number } {
    const GROUND_SIZE = 180;
    const maxAttempts = 100;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      attempts++;
      const centerAvoidanceRadius = 20;
      const angle = Math.random() * Math.PI * 2;
      const radius = centerAvoidanceRadius + Math.random() * (GROUND_SIZE * 0.5 - centerAvoidanceRadius);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      if (this.checkPositionValidity(x, z, entitySize)) {
        return { x, z };
      }
    }
    
    const defaultAngle = Math.random() * Math.PI * 2;
    const centerAvoidanceRadius = 20;
    const defaultRadius = centerAvoidanceRadius + Math.random() * (GROUND_SIZE * 0.5 - centerAvoidanceRadius);
    return {
      x: Math.cos(defaultAngle) * defaultRadius,
      z: Math.sin(defaultAngle) * defaultRadius
    };
  }

  /**
   * 更新生态系统
   */
  public updateEcosystem(count: number): void {
    if (!this.scene) return;
    
    try {
      // 确保地面和草地颜色正确
      const colors = this.getThemeColors();
      if (this.ground) {
        (this.ground.material as THREE.MeshStandardMaterial).color.set(colors.groundColor);
      }
      
      // 获取所有可用物种
      const allSpecies = [...SPECIES.plants, ...SPECIES.animals];
      
      // 确保count为非负数
      const validCount = Math.max(0, count);
      const currentCount = this.entities.length;
      
      // 只在数量变化时才调整实体
      if (validCount !== currentCount) {
        if (validCount > currentCount) {
          // 需要添加新实体
          for (let i = currentCount; i < validCount; i++) {
            // 随机选择一个物种
            const randomSpecies = allSpecies[Math.floor(Math.random() * allSpecies.length)];
            
            // 生成有效的随机位置
            const entitySize = 1.5;
            const { x, z } = this.generateValidPosition(entitySize);
            
            // 创建实体
            const entity = this.createEntity(randomSpecies.id, x, z);
            
            if (entity) {
              // 确保实体有正确的缩放
              entity.scale.set(1, 1, 1);
              
              // 确保实体可见
              entity.visible = true;
              
              // 添加到场景
              this.scene.add(entity);
              this.entities.push(entity);
              
              // 添加动物动画属性
              if (entity instanceof THREE.Group) {
                const isAnimal = SPECIES.animals.some(animal => animal.id === randomSpecies.id);
                if (isAnimal) {
                  entity.userData.isAnimal = true;
                  entity.userData.originalPosition = { x: entity.position.x, y: entity.position.y, z: entity.position.z };
                  entity.userData.speciesId = randomSpecies.id;
                  
                  // 根据动物类型设置不同的运动参数
                  let speed, movementRadius, jumpHeight;
                  switch(randomSpecies.id) {
                    case 'rabbit':
                    case 'rabbit2':
                      speed = 0.008 + Math.random() * 0.01;
                      movementRadius = 2 + Math.random() * 2;
                      jumpHeight = 0.15;
                      break;
                    case 'fox':
                    case 'fox2':
                      speed = 0.015 + Math.random() * 0.02;
                      movementRadius = 4 + Math.random() * 3;
                      jumpHeight = 0.15;
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
                }
              }
            }
          }
        } else if (validCount < currentCount) {
          // 需要移除多余的实体
          for (let i = currentCount - 1; i >= validCount; i--) {
            const entity = this.entities[i];
            if (entity && entity.parent === this.scene) {
              this.scene.remove(entity);
            }
            this.entities.splice(i, 1);
          }
        }
      }
    } catch (error) {
      console.error('Error updating ecosystem:', error);
    }
  }

  /**
   * 更新预览
   */
  public updatePreview(type: string): void {
    if (!this.scene) return;
    
    try {
      // 移除场景中所有名为'previewMesh'的对象
      this.scene.traverse((object: any) => {
        if (object.name === 'previewMesh') {
          if (object.parent) {
            object.parent.remove(object);
          }
        }
      });
      
      // 获取番茄模型
      const tomatoMesh = this.scene.getObjectByName('tomatoMesh');
      const isFocusMode = tomatoMesh && typeof tomatoMesh.visible !== 'undefined' && tomatoMesh.visible;
      
      let newPreviewMesh: any;
      
      // 提取基础类型
      const baseType = type.replace(/\d+$/, '');
      
      // 植物类型列表
      const plantTypes = ['pine', 'oak', 'cherry', 'willow', 'bamboo', 'palm', 'cactus', 'mushroom', 'sunflower', 'birch'];
      // 动物类型列表
      const animalTypes = ['rabbit', 'fox', 'panda', 'pig', 'chick', 'penguin', 'frog', 'sheep', 'bear', 'bee'];
      
      if (plantTypes.includes(baseType)) {
        newPreviewMesh = this.createPlant(type);
      } else if (animalTypes.includes(baseType)) {
        newPreviewMesh = this.createAnimal(type);
      } else {
        newPreviewMesh = this.createPlant('pine');
      }
      
      // 设置模型名称
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
        newPreviewMesh.position.set(0, 2.5, 0);
        newPreviewMesh.scale.set(0, 0, 0);
        newPreviewMesh.castShadow = true;
        newPreviewMesh.receiveShadow = true;
        newPreviewMesh.renderOrder = 1000;
        this.scene.add(newPreviewMesh);
        
        // 添加缩放动画
        let scale = 0;
        const animateScale = () => {
          scale += 0.05;
          if (scale <= 2.5) {
            newPreviewMesh.scale.set(scale, scale, scale);
            requestAnimationFrame(animateScale);
          } else {
            newPreviewMesh.scale.set(2.5, 2.5, 2.5);
          }
        };
        animateScale();
      }
      
      this.previewMesh = newPreviewMesh;
    } catch (error) {
      console.error('Error updating preview:', error);
    }
  }

  /**
   * 动画循环
   */
  private animate(): void {
    if (!this.scene || !this.camera || !this.renderer) return;
    
    // 优化动画更新频率，使用时间间隔控制
    const now = Date.now();
    if (now - (this.lastUpdateTime || 0) < 50) {
      // 每50ms更新一次，减少计算频率
      this.animationFrameId = requestAnimationFrame(() => this.animate());
      return;
    }
    this.lastUpdateTime = now;
    
    // 更新动物动画 - 优化遍历和计算
    this.entities.forEach(entity => {
      if (entity.userData && entity.userData.isAnimal) {
        const animal = entity;
        const originalPos = animal.userData.originalPosition;
        const speed = animal.userData.speed;
        
        // 更新角度
        animal.userData.angle += speed;
        
        // 计算新位置 - 简化计算
        const movementRadius = animal.userData.movementRadius || 3; // 减少移动半径，降低计算量
        const x = originalPos.x + Math.cos(animal.userData.angle) * movementRadius;
        const z = originalPos.z + Math.sin(animal.userData.angle) * movementRadius;
        
        // 垂直移动（跳跃效果） - 简化计算
        const baseY = Math.max(2.5, originalPos.y);
        const jumpHeight = animal.userData.jumpHeight || 0.1; // 减少跳跃高度，降低计算量
        const y = baseY + Math.sin(now * 0.001 + animal.userData.waveOffset) * jumpHeight;
        
        // 更新位置
        animal.position.set(x, y, z);
        
        // 旋转动物使其面向移动方向 - 简化计算
        animal.rotation.y = animal.userData.angle + Math.PI / 2;
      }
    });
    
    // 仅在必要时更新控制器
    if (this.controls) {
      if (this.controls.autoRotate) {
        this.controls.update();
      }
    }
    
    // 应用LOD优化，根据距离调整模型复杂度
    this.applyLOD();
    
    // 渲染场景
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
    
    // 请求下一帧
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
  
  // 添加类属性
  private lastUpdateTime: number | null = null;
  
  /**
   * 应用LOD（细节层次）优化
   */
  private applyLOD(): void {
    if (!this.scene || !this.camera) return;
    
    // 仅对相机可见范围内的实体进行LOD处理
    this.entities.forEach(entity => {
      const distance = this.camera!.position.distanceTo(entity.position);
      
      // 根据距离调整实体的渲染属性
      if (distance > 100) {
        // 远处实体：降低复杂度，禁用阴影
        entity.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });
      } else if (distance > 50) {
        // 中等距离：适度降低复杂度
        entity.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = false;
          }
        });
      } else {
        // 近处实体：保持完整细节
        entity.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      }
    });
  }

  /**
   * 更新场景
   */
  public updateScene(theme: string, totalPlants: number, currentSeed: string, isFocusing: boolean, isPaused: boolean): void {
    this.updateTheme(theme, isFocusing, isPaused);
    this.updateEcosystem(totalPlants);
    this.updatePreview(currentSeed);
  }

  /**
   * 释放资源
   */
  public dispose(): void {
    // 取消动画循环
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // 释放控制器
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }
    
    // 释放渲染器
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    
    // 释放场景中的资源
    if (this.scene) {
      this.scene.traverse((object: any) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material: any) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      this.scene = null;
    }
    
    // 释放相机
    this.camera = null;
    
    // 清空实体数组
    this.entities = [];
  }
}