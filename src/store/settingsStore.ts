import { create } from 'zustand';
import { Settings as SettingsType } from '../../types';

interface SettingsState {
  // 状态
  settings: SettingsType;
  
  // 操作
  setSettings: (settings: SettingsType) => void;
  updateSettings: (updates: Partial<SettingsType>) => void;
  resetSettings: () => void;
}

// 默认设置
const DEFAULT_SETTINGS: SettingsType = {
  bgMusicVolume: 0.5,
  soundEffectVolume: 0.7,
  enableBgMusic: true,
  enableSoundEffects: true,
  enableNotifications: true,
  guideCardConfig: {
    fontSize: 'medium' as const,
    borderRadius: 'medium' as const,
    shadowIntensity: 'medium' as const,
    showUnderlyingPrinciple: true
  },
  enableTaskCompleteNotifications: true,
  enableAchievementNotifications: true,
  enablePomodoroNotifications: true,
  showExperienceBar: true,
  showBalance: true,
  showTaskCompletionRate: true,
  soundEffectsByLocation: {},
  soundLibrary: {},
  showCharacterSystem: true,
  showPomodoroSystem: true,
  showFocusTimeSystem: true,
  showCheckinSystem: true,
  showAchievementCollectionRate: true,
  showSystemStabilityModule: true,
  showLatestBadges: true,
  showChartSummary: true,
  showSupplyMarket: true,
  autoBackupEnabled: true,
  autoBackupFrequency: 'daily',
  autoBackupTime: '10:00',
  customBackupPath: '',
  enableWebDAV: true
};

export const useSettingsStore = create<SettingsState>((set) => ({
  // 初始状态
  settings: DEFAULT_SETTINGS,
  
  // 操作
  setSettings: (settings) => set({ settings }),
  
  updateSettings: (updates) => set((state) => ({
    settings: { ...state.settings, ...updates }
  })),
  
  resetSettings: () => set({ settings: DEFAULT_SETTINGS })
}));
