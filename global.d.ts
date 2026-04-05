// 全局类型声明文件，用于解决模块导入问题

declare module '*.tsx' {
  const component: React.ComponentType<any>;
  export default component;
}

declare module '*.ts' {
  const component: React.ComponentType<any>;
  export default component;
}

// 特定模块声明
declare module './components/LifeGame/BattleTab' {
  const component: React.ComponentType<any>;
  export default component;
}

declare module './components/LifeGame/ShopTab' {
  const component: React.ComponentType<any>;
  export default component;
}

declare module './components/LifeGame/ArmoryTab' {
  const component: React.ComponentType<any>;
  export default component;
}

interface LifeGameElectronWebDAVRequest {
  targetUrl: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
}

interface LifeGameElectronWebDAVResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
}

interface LifeGameElectronUpdateInfo {
  platform: 'electron' | 'web';
  status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloaded' | 'error' | 'unsupported';
  currentVersion: string;
  latestVersion?: string;
  releaseNotes?: string;
  error?: string;
  lastCheckedAt?: number;
  isUpdateAvailable: boolean;
}

interface Window {
  lifeGameElectron?: {
    platform: 'electron';
    webdavRequest: (payload: LifeGameElectronWebDAVRequest) => Promise<LifeGameElectronWebDAVResponse>;
    getUpdateStatus: () => Promise<LifeGameElectronUpdateInfo>;
    checkForUpdates: () => Promise<LifeGameElectronUpdateInfo>;
    quitAndInstallUpdate: () => Promise<boolean>;
    onUpdateStatus: (callback: (status: LifeGameElectronUpdateInfo) => void) => () => void;
  };
}
