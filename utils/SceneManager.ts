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
      0.5       // 适中的环境光强度，平衡阴影
    );
    this.scene.add(ambientLight);
    
    // 主光源（太阳） - 降低强度，避免炫光
    const sunLight = new THREE.DirectionalLight(
      0xffffff, 
      0.8       // 降低强度，减少炫光
    );
    sunLight.position.set(50, 80, 50); // 调整光源位置，避免极端角度
    sunLight.castShadow = true;
    
    // 优化阴影贴图分辨率和相机参数
    sunLight.shadow.mapSize.width = 2048; // 增加阴影贴图分辨率，提高阴影质量
    sunLight.shadow.mapSize.height = 2048;
    
    // 调整阴影相机视锥体，确保在不同缩放级别下阴影都能正确渲染
    const shadowCamera = sunLight.shadow.camera as THREE.OrthographicCamera;
    shadowCamera.left = -150;
    shadowCamera.right = 150;
    shadowCamera.top = 150;
    shadowCamera.bottom = -150;
    shadowCamera.near = 0.5;
    shadowCamera.far = 200;
    
    // 调整阴影偏移和模糊半径，优化阴影质量
    sunLight.shadow.bias = -0.0005; // 增加阴影偏移，减少阴影失真和黑色像素块
    sunLight.shadow.radius = 1; // 减小阴影半径，提高阴影清晰度
    
    // 启用阴影贴图的自动更新
    sunLight.shadow.autoUpdate = true;
    
    this.scene.add(sunLight);
    
    // 简化光照系统，移除可能导致渲染问题的额外光源
    // 只保留环境光和主光源，避免光源过多导致的渲染冲突
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
    let interactionTimeout: number | null = null;
    
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
    let wheelTimeout: number | null = null;
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
   * 获取主题颜色 - 采用Forest风格色彩体系
   */
  private getThemeColors(): ThemeColors {
    // Forest风格色彩系统
    const forestGreen = 0x4CAF50; // 主色调：森林绿，象征自然、成长和生机
    
    // 土壤色系 - 形成完整的土壤色彩梯度
    const lightBrown = 0xA1887F;   // 浅褐色
    const earthYellow = 0xD7CCC8;  // 土黄色
    const darkBrown = 0x8D6E63;    // 深褐色
    
    // 根据当前主题返回不同的背景颜色
    let bgColor = 0xF5F5F5; // 浅色模式：柔和的自然色调
    let neuBgColor = 0xF5F5F5;
    
    if (this.theme && this.theme.includes('dark')) {
      // 深色模式：深绿色调，确保色彩一致性
      bgColor = 0x1B5E20;
      neuBgColor = 0x1B5E20;
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
    const bgColor = isFullFocusMode ? 0x1a1a2e : colors.bgColor;
    
    // 更新场景背景颜色
    if (!this.scene.background) {
      this.scene.background = new THREE.Color();
    }
    this.scene.background.set(bgColor);
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
        if (grass.material) {
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
    
    // 白天/黑夜的光照参数 - 降低光照强度，避免物体过亮显示为白色
    const ambientParams = isDarkTheme 
      ? { intensity: 0.3, color: 0x444466 }  // 夜晚：暗蓝色
      : { intensity: 0.6, color: 0xffffff };  // 白天：白色
    
    const sunParams = isDarkTheme 
      ? { intensity: 0.5, color: 0x666688 }  // 夜晚：深蓝色
      : { intensity: 1.0, color: 0xffffff };  // 白天：白色
    
    const fillParams = isDarkTheme 
      ? { intensity: 0.3, color: 0x444455 }  // 夜晚：深灰色
      : { intensity: 0.8, color: 0xffffff };  // 白天：白色
    
    const hemisphereParams = isDarkTheme 
      ? { intensity: 0.3, color: 0x222244, groundColor: 0x111122 }  // 夜晚：深蓝色地面
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
    
    if (type === 'fox') {
      // 赤狐1
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xf97316,
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
        color: 0x1f2937,
        roughness: 0.8,
        metalness: 0.1
      });
      
      const leftEar = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.2, 0.1),
        earMaterial
      );
      leftEar.position.set(-0.12, 0.9, 0.35);
      leftEar.rotation.z = 0.3;
      leftEar.castShadow = true;
      leftEar.receiveShadow = true;
      group.add(leftEar);
      
      const rightEar = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.2, 0.1),
        earMaterial
      );
      rightEar.position.set(0.12, 0.9, 0.35);
      rightEar.rotation.z = -0.3;
      rightEar.castShadow = true;
      rightEar.receiveShadow = true;
      group.add(rightEar);
      
      // 尾巴
      const tailMaterial = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.7,
        metalness: 0.2
      });
      
      const tail = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, 0.7),
        tailMaterial
      );
      tail.position.set(0, 0.3, -0.3);
      tail.rotation.y = Math.PI / 4;
      tail.castShadow = true;
      tail.receiveShadow = true;
      group.add(tail);
    } else if (type === 'fox2') {
      // 赤狐2 - 改良版，更具特色
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xea580c,
        roughness: 0.6,
        metalness: 0.3
      });
      
      // 身体 - 更健壮
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.5, 4, 8), bodyMaterial);
      body.position.set(0, 0.45, 0);
      body.rotation.z = 0.15;
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 16, 16),
        bodyMaterial
      );
      head.position.set(0, 0.8, 0.45);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      // 耳朵 - 更大更尖
      const earMaterial = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.85,
        metalness: 0.05
      });
      
      const leftEar = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.25, 0.12),
        earMaterial
      );
      leftEar.position.set(-0.15, 1.05, 0.4);
      leftEar.rotation.z = 0.2;
      leftEar.castShadow = true;
      leftEar.receiveShadow = true;
      group.add(leftEar);
      
      const rightEar = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.25, 0.12),
        earMaterial
      );
      rightEar.position.set(0.15, 1.05, 0.4);
      rightEar.rotation.z = -0.2;
      rightEar.castShadow = true;
      rightEar.receiveShadow = true;
      group.add(rightEar);
      
      // 尾巴 - 更蓬松
      const tailMaterial = new THREE.MeshStandardMaterial({
        color: 0xc2410c,
        roughness: 0.6,
        metalness: 0.3
      });
      
      const tail = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.35, 0.8),
        tailMaterial
      );
      tail.position.set(0, 0.35, -0.35);
      tail.rotation.y = Math.PI / 3.5;
      tail.castShadow = true;
      tail.receiveShadow = true;
      group.add(tail);
      
      // 添加面部细节
      const detailMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.9,
        metalness: 0.0
      });
      
      // 鼻子
      const nose = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        detailMaterial
      );
      nose.position.set(0, 0.75, 0.65);
      nose.castShadow = true;
      nose.receiveShadow = true;
      group.add(nose);
      
      // 眼睛
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.8,
        metalness: 0.1
      });
      
      const leftEye = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        eyeMaterial
      );
      leftEye.position.set(-0.1, 0.85, 0.6);
      leftEye.castShadow = true;
      leftEye.receiveShadow = true;
      group.add(leftEye);
      
      const rightEye = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        eyeMaterial
      );
      rightEye.position.set(0.1, 0.85, 0.6);
      rightEye.castShadow = true;
      rightEye.receiveShadow = true;
      group.add(rightEye);
    } else if (type === 'rabbit') {
      // 兔子1
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
      
      // 耳朵
      const earMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.8,
        metalness: 0.0
      });
      
      const leftEar = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.5, 0.1),
        earMaterial
      );
      leftEar.position.set(-0.1, 0.9, 0.25);
      leftEar.rotation.z = 0.1;
      leftEar.castShadow = true;
      leftEar.receiveShadow = true;
      group.add(leftEar);
      
      const rightEar = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.5, 0.1),
        earMaterial
      );
      rightEar.position.set(0.1, 0.9, 0.25);
      rightEar.rotation.z = -0.1;
      rightEar.castShadow = true;
      rightEar.receiveShadow = true;
      group.add(rightEar);
      
      // 眼睛
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        roughness: 0.7,
        metalness: 0.2
      });
      
      const leftEye = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.05, 0.05),
        eyeMaterial
      );
      leftEye.position.set(-0.08, 0.55, 0.45);
      leftEye.castShadow = true;
      leftEye.receiveShadow = true;
      group.add(leftEye);
      
      const rightEye = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.05, 0.05),
        eyeMaterial
      );
      rightEye.position.set(0.08, 0.55, 0.45);
      rightEye.castShadow = true;
      rightEye.receiveShadow = true;
      group.add(rightEye);
    } else if (type === 'rabbit2') {
      // 兔子2 - 改良版，更具特色
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        roughness: 0.65,
        metalness: 0.15
      });
      
      // 身体 - 更圆润
      const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 3), bodyMaterial);
      body.position.set(0, 0.35, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 头部
      const head = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.22, 3),
        bodyMaterial
      );
      head.position.set(0, 0.55, 0.35);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      // 耳朵 - 更长更有特色
      const earMaterial = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        roughness: 0.75,
        metalness: 0.05
      });
      
      const leftEar = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.6, 0.12),
        earMaterial
      );
      leftEar.position.set(-0.12, 1.0, 0.3);
      leftEar.rotation.z = 0.2;
      leftEar.castShadow = true;
      leftEar.receiveShadow = true;
      group.add(leftEar);
      
      const rightEar = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.6, 0.12),
        earMaterial
      );
      rightEar.position.set(0.12, 1.0, 0.3);
      rightEar.rotation.z = -0.2;
      rightEar.castShadow = true;
      rightEar.receiveShadow = true;
      group.add(rightEar);
      
      // 眼睛 - 更大更明亮
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x0369a1,
        roughness: 0.6,
        metalness: 0.3
      });
      
      const leftEye = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.06, 0.06),
        eyeMaterial
      );
      leftEye.position.set(-0.09, 0.6, 0.5);
      leftEye.castShadow = true;
      leftEye.receiveShadow = true;
      group.add(leftEye);
      
      const rightEye = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.06, 0.06),
        eyeMaterial
      );
      rightEye.position.set(0.09, 0.6, 0.5);
      rightEye.castShadow = true;
      rightEye.receiveShadow = true;
      group.add(rightEye);
      
      // 尾巴 - 更蓬松
      const tailMaterial = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        roughness: 0.7,
        metalness: 0.1
      });
      
      const tail = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.15, 2),
        tailMaterial
      );
      tail.position.set(0, 0.3, -0.25);
      tail.castShadow = true;
      tail.receiveShadow = true;
      group.add(tail);
    } else if (type === 'panda' || type === 'panda2') {
      // 熊猫
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.7,
        metalness: 0.1
      });
      
      const blackMaterial = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        roughness: 0.8,
        metalness: 0.05
      });
      
      // 身体
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.5, 4, 8), bodyMaterial);
      body.position.set(0, 0.5, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        bodyMaterial
      );
      head.position.set(0, 0.9, 0.4);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      if (type === 'panda2') {
        // 熊猫2 - 更圆润的体型，更明显的黑眼圈
        body.scale.set(1.1, 1.1, 1.1);
        
        // 更明显的黑眼圈
        const leftEyePatch = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.25, 0.05),
          blackMaterial
        );
        leftEyePatch.position.set(-0.15, 0.95, 0.6);
        leftEyePatch.rotation.z = 0.2;
        leftEyePatch.castShadow = true;
        leftEyePatch.receiveShadow = true;
        group.add(leftEyePatch);
        
        const rightEyePatch = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.25, 0.05),
          blackMaterial
        );
        rightEyePatch.position.set(0.15, 0.95, 0.6);
        rightEyePatch.rotation.z = -0.2;
        rightEyePatch.castShadow = true;
        rightEyePatch.receiveShadow = true;
        group.add(rightEyePatch);
        
        // 添加竹子道具
        const bambooMaterial = new THREE.MeshStandardMaterial({
          color: 0x4ade80,
          roughness: 0.7,
          metalness: 0.1
        });
        
        const bamboo = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6),
          bambooMaterial
        );
        bamboo.position.set(0, 0.8, 0.7);
        bamboo.rotation.z = Math.PI / 4;
        bamboo.castShadow = true;
        bamboo.receiveShadow = true;
        group.add(bamboo);
      } else {
        // 熊猫1 - 标准熊猫造型
        // 眼睛
        const leftEye = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.06, 0.06),
          blackMaterial
        );
        leftEye.position.set(-0.12, 0.95, 0.6);
        leftEye.castShadow = true;
        leftEye.receiveShadow = true;
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.06, 0.06),
          blackMaterial
        );
        rightEye.position.set(0.12, 0.95, 0.6);
        rightEye.castShadow = true;
        rightEye.receiveShadow = true;
        group.add(rightEye);
      }
    } else if (type === 'pig' || type === 'pig2') {
      // 小猪
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xfbcfe8,
        roughness: 0.7,
        metalness: 0.1
      });
      
      // 身体
      const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 3), bodyMaterial);
      body.position.set(0, 0.4, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 头部
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.4, 0.4),
        bodyMaterial
      );
      head.position.set(0, 0.6, 0.4);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      if (type === 'pig2') {
        // 小猪2 - 粉色皮肤，卷曲尾巴
        bodyMaterial.color.set(0xf9a8d4);
        
        // 卷曲尾巴
        const tailMaterial = new THREE.MeshStandardMaterial({
          color: 0xf9a8d4,
          roughness: 0.7,
          metalness: 0.1
        });
        
        for(let i = 0; i < 3; i++) {
          const tailSegment = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.2, 6),
            tailMaterial
          );
          tailSegment.position.set(
            Math.cos(i * Math.PI / 2) * 0.2,
            0.4,
            -0.2 + Math.sin(i * Math.PI / 2) * 0.2
          );
          tailSegment.rotation.z = i * Math.PI / 2;
          tailSegment.castShadow = true;
          tailSegment.receiveShadow = true;
          group.add(tailSegment);
        }
      }
    } else if (type === 'chick' || type === 'chick2') {
      // 小鸡
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.65,
        metalness: 0.15
      });
      
      // 身体
      const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 3), bodyMaterial);
      body.position.set(0, 0.3, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        bodyMaterial
      );
      head.position.set(0, 0.5, 0.3);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      if (type === 'chick2') {
        // 小鸡2 - 更可爱的造型，带有翅膀
        body.scale.set(1.1, 1.1, 1.1);
        
        // 翅膀
        const wingMaterial = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          roughness: 0.7,
          metalness: 0.1
        });
        
        const leftWing = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.08, 0.2),
          wingMaterial
        );
        leftWing.position.set(-0.2, 0.35, 0.1);
        leftWing.rotation.z = 0.3;
        leftWing.castShadow = true;
        leftWing.receiveShadow = true;
        group.add(leftWing);
        
        const rightWing = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.08, 0.2),
          wingMaterial
        );
        rightWing.position.set(0.2, 0.35, 0.1);
        rightWing.rotation.z = -0.3;
        rightWing.castShadow = true;
        rightWing.receiveShadow = true;
        group.add(rightWing);
      }
    } else if (type === 'penguin' || type === 'penguin2') {
      // 企鹅
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        roughness: 0.7,
        metalness: 0.1
      });
      
      const bellyMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.75,
        metalness: 0.05
      });
      
      // 身体
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.9, 12), bodyMaterial);
      body.position.set(0, 0.45, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 腹部
      const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.8, 12), bellyMaterial);
      belly.position.set(0, 0.4, 0.1);
      belly.castShadow = true;
      belly.receiveShadow = true;
      group.add(belly);
      
      // 头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16),
        bodyMaterial
      );
      head.position.set(0, 0.9, 0.2);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      if (type === 'penguin2') {
        // 企鹅2 - 带有领结，更可爱的造型
        // 领结
        const bowMaterial = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          roughness: 0.6,
          metalness: 0.2
        });
        
        const bow = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.1, 0.1),
          bowMaterial
        );
        bow.position.set(0, 0.7, 0.3);
        bow.castShadow = true;
        bow.receiveShadow = true;
        group.add(bow);
      }
    } else if (type === 'frog' || type === 'frog2') {
      // 青蛙
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x4ade80,
        roughness: 0.7,
        metalness: 0.1
      });
      
      // 身体
      const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 3), bodyMaterial);
      body.position.set(0, 0.3, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 眼睛
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.6,
        metalness: 0.2
      });
      
      const leftEye = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 12, 12),
        eyeMaterial
      );
      leftEye.position.set(-0.2, 0.5, 0.3);
      leftEye.castShadow = true;
      leftEye.receiveShadow = true;
      group.add(leftEye);
      
      const rightEye = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 12, 12),
        eyeMaterial
      );
      rightEye.position.set(0.2, 0.5, 0.3);
      rightEye.castShadow = true;
      rightEye.receiveShadow = true;
      group.add(rightEye);
      
      if (type === 'frog2') {
        // 青蛙2 - 更鲜艳的颜色，带有斑点
        bodyMaterial.color.set(0x10b981);
        
        // 背部斑点
        const spotMaterial = new THREE.MeshStandardMaterial({
          color: 0x059669,
          roughness: 0.8,
          metalness: 0.05
        });
        
        for(let i = 0; i < 5; i++) {
          const spot = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            spotMaterial
          );
          spot.position.set(
            (Math.random() - 0.5) * 0.3,
            0.3 + Math.random() * 0.2,
            (Math.random() - 0.5) * 0.2
          );
          spot.castShadow = true;
          spot.receiveShadow = true;
          group.add(spot);
        }
      }
    } else if (type === 'bee' || type === 'bee2') {
      // 蜜蜂
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.65,
        metalness: 0.15
      });
      
      const stripeMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.8,
        metalness: 0.05
      });
      
      // 身体
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.3, 4, 8), bodyMaterial);
      body.position.set(0, 0.3, 0);
      body.rotation.z = 0.3;
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 条纹
      for(let i = 0; i < 3; i++) {
        const stripe = new THREE.Mesh(
          new THREE.RingGeometry(0.15, 0.18, 16),
          stripeMaterial
        );
        stripe.position.set(0, 0.3, 0);
        stripe.rotation.x = Math.PI / 2;
        stripe.rotation.z = i * 0.3;
        stripe.castShadow = true;
        stripe.receiveShadow = true;
        group.add(stripe);
      }
      
      if (type === 'bee2') {
        // 蜜蜂2 - 带有翅膀，更细致的条纹
        // 翅膀
        const wingMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.3,
          metalness: 0.1,
          transparent: true,
          opacity: 0.7
        });
        
        const leftWing = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.2, 0.01),
          wingMaterial
        );
        leftWing.position.set(-0.2, 0.35, 0.1);
        leftWing.rotation.z = 0.2;
        leftWing.castShadow = true;
        leftWing.receiveShadow = true;
        group.add(leftWing);
        
        const rightWing = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.2, 0.01),
          wingMaterial
        );
        rightWing.position.set(0.2, 0.35, 0.1);
        rightWing.rotation.z = -0.2;
        rightWing.castShadow = true;
        rightWing.receiveShadow = true;
        group.add(rightWing);
      }
    } else if (type === 'sheep' || type === 'sheep2') {
      // 绵羊
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.65,
        metalness: 0.15
      });
      
      // 身体
      const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 3), bodyMaterial);
      body.position.set(0, 0.4, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 头部
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, 0.35),
        bodyMaterial
      );
      head.position.set(0, 0.6, 0.4);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      if (type === 'sheep2') {
        // 绵羊2 - 更蓬松的羊毛，带有铃铛
        // 更蓬松的羊毛
        for(let i = 0; i < 15; i++) {
          const wool = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            bodyMaterial
          );
          wool.position.set(
            (Math.random() - 0.5) * 0.4,
            0.4 + (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.4
          );
          wool.castShadow = true;
          wool.receiveShadow = true;
          group.add(wool);
        }
        
        // 铃铛
        const bellMaterial = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          roughness: 0.4,
          metalness: 0.6
        });
        
        const bell = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.1, 0.12, 8),
          bellMaterial
        );
        bell.position.set(0, 0.2, 0);
        bell.castShadow = true;
        bell.receiveShadow = true;
        group.add(bell);
      }
    } else if (type === 'bear' || type === 'bear2') {
      // 棕熊
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x78350f,
        roughness: 0.7,
        metalness: 0.1
      });
      
      // 身体
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.5, 4, 8), bodyMaterial);
      body.position.set(0, 0.5, 0);
      body.rotation.z = 0.2;
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // 头部
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.4, 0.4),
        bodyMaterial
      );
      head.position.set(0, 0.9, 0.4);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      if (type === 'bear2') {
        // 棕熊2 - 更健壮的体型，带有爪子
        body.scale.set(1.1, 1.1, 1.1);
        
        // 爪子
        const clawMaterial = new THREE.MeshStandardMaterial({
          color: 0x92400e,
          roughness: 0.75,
          metalness: 0.05
        });
        
        for(let i = 0; i < 4; i++) {
          const claw = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.03, 0.15, 4),
            clawMaterial
          );
          claw.position.set(
            (i % 2 === 0 ? -1 : 1) * 0.2,
            0.3,
            0.1 + Math.floor(i / 2) * 0.2
          );
          claw.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.2;
          claw.castShadow = true;
          claw.receiveShadow = true;
          group.add(claw);
        }
      }
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
      if (this.controls.autoRotate || this.controls.isDragging || this.controls.isZooming) {
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