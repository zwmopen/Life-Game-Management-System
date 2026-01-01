import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifegame.manager',
  appName: '人生游戏管理系统',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
