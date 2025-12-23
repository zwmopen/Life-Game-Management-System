import { AchievementItem, AttributeType } from '../types';

// --- Check-in Thresholds ---
export const CHECKIN_THRESHOLDS = [
  { min: 3, title: '坚持不懈' },
  { min: 7, title: '签到达人' },
  { min: 15, title: '自律新星' },
  { min: 30, title: '习惯养成' },
  { min: 60, title: '岁月如歌' },
  { min: 100, title: '时间的朋友' },
  { min: 200, title: '持久王者' },
  { min: 365, title: '永恒坚守' }
];

export const getAllCheckInTitles = () => CHECKIN_THRESHOLDS;

// --- Consumption Thresholds ---
export const CONSUMPTION_THRESHOLDS = [
  { min: 100, title: '初次破费' },
  { min: 500, title: '快乐剁手' },
  { min: 1000, title: '品质生活' },
  { min: 2000, title: '补给大亨' },
  { min: 3500, title: '氪金战士' },
  { min: 5000, title: '消费至尊' },
  { min: 8000, title: '黑市常客' },
  { min: 12000, title: '装备大师' },
  { min: 18000, title: '挥金如土' },
  { min: 25000, title: '经济支柱' },
  { min: 40000, title: '商会主席' },
  { min: 60000, title: '财阀雏形' },
  { min: 90000, title: '资本巨头' },
  { min: 150000, title: '市场主宰' },
  { min: 250000, title: '富可敌国' },
  { min: 500000, title: '金钱之神' },
  { min: 1000000, title: '虚空财主' },
  { min: 5000000, title: '无限消费' }
];

export const getAllConsumptionTitles = () => CONSUMPTION_THRESHOLDS;

// --- Initial Habits ---
export const INITIAL_HABITS = [
  { id: 'mk1', name: '生物激活: 起床 & 阳光/冷水 (07:30)', reward: 5, xp: 10, duration: 15, streak: 0, color: '#ef4444', attr: AttributeType.STRENGTH, archived: false, history: {}, logs: {} },
  { id: 'mk2', name: '精神校准: 冥想 & 恐惧设定 (08:00)', reward: 10, xp: 15, duration: 20, streak: 0, color: '#3b82f6', attr: AttributeType.INTELLIGENCE, archived: false, history: {}, logs: {} },
  { id: 'mk3', name: '深度工作 I: 吞青蛙/核心任务 (08:30)', reward: 30, xp: 50, duration: 90, streak: 0, color: '#f59e0b', attr: AttributeType.WEALTH, archived: false, history: {}, logs: {} },
  { id: 'mk4', name: '能量补给: 低碳水午餐 (12:00)', reward: 5, xp: 5, duration: 30, streak: 0, color: '#10b981', attr: AttributeType.STRENGTH, archived: false, history: {}, logs: {} },
  { id: 'mk5', name: '主动休息: 散步/小睡 (13:00)', reward: 10, xp: 10, duration: 30, streak: 0, color: '#10b981', attr: AttributeType.STRENGTH, archived: false, history: {}, logs: {} },
  { id: 'mk6', name: '深度工作 II: 堆量/执行 (14:00)', reward: 30, xp: 50, duration: 120, streak: 0, color: '#f59e0b', attr: AttributeType.WEALTH, archived: false, history: {}, logs: {} },
  { id: 'mk7', name: '身体重塑: 高强度运动 (18:00)', reward: 20, xp: 30, duration: 60, streak: 0, color: '#ef4444', attr: AttributeType.STRENGTH, archived: false, history: {}, logs: {} },
  { id: 'mk8', name: '输入与复盘: 阅读 & 日志 (19:30)', reward: 15, xp: 20, duration: 45, streak: 0, color: '#8b5cf6', attr: AttributeType.INTELLIGENCE, archived: false, history: {}, logs: {} },
  { id: 'mk9', name: '数字日落: 远离屏幕 (23:00)', reward: 10, xp: 10, duration: 0, streak: 0, color: '#64748b', attr: AttributeType.DISCIPLINE, archived: false, history: {}, logs: {} },
  { id: 'mk10', name: '休眠: 深度睡眠 (00:00)', reward: 20, xp: 20, duration: 480, streak: 0, color: '#ef4444', attr: AttributeType.STRENGTH, archived: false, history: {}, logs: {} },
];

// --- Initial Projects ---
export const INITIAL_PROJECTS = [
  {
    id: 'p1', name: '数码万粉号 I', startDate: new Date().toISOString().split('T')[0], description: '创建并运营第一个粉丝量达到1万的数码账号', status: 'active', logs: [], dailyFocus: {}, todayFocusMinutes: 0, fears: [], attr: AttributeType.WEALTH,
    subTasks: [
      { id: 't1_1', title: '发布视频作品', duration: 60, completed: false, frequency: 'daily' },
      { id: 't1_2', title: '发布引流作品', duration: 30, completed: false, frequency: 'daily' },
      { id: 't1_3', title: '发布图文作品', duration: 20, completed: false, frequency: 'daily' }
    ]
  },
  {
    id: 'p2', name: '数码万分号 II', startDate: new Date().toISOString().split('T')[0], description: '创建并运营第二个粉丝量达到1万的数码账号', status: 'active', logs: [], dailyFocus: {}, todayFocusMinutes: 0, fears: [], attr: AttributeType.WEALTH,
    subTasks: [
      { id: 't2_1', title: '发布视频作品', duration: 60, completed: false, frequency: 'daily' },
      { id: 't2_2', title: '发布引流作品', duration: 30, completed: false, frequency: 'daily' },
      { id: 't2_3', title: '发布图文作品', duration: 20, completed: false, frequency: 'daily' }
    ]
  },
  {
    id: 'p3', name: '成长型博主：1000粉目标', startDate: new Date().toISOString().split('T')[0], description: '成为一个拥有1000粉丝的成长型博主', status: 'active', logs: [], dailyFocus: {}, todayFocusMinutes: 0, fears: [], attr: AttributeType.INTELLIGENCE,
    subTasks: [
      { id: 't3_1', title: '选一个选题', duration: 15, completed: false, frequency: 'daily' },
      { id: 't3_2', title: '整理文案', duration: 30, completed: false, frequency: 'daily' },
      { id: 't3_3', title: '拍摄视频', duration: 45, completed: false, frequency: 'daily' },
      { id: 't3_4', title: '剪辑视频', duration: 60, completed: false, frequency: 'daily' },
      { id: 't3_5', title: '发布视频', duration: 15, completed: false, frequency: 'daily' }
    ]
  },
  {
    id: 'p4', name: '拥有6块腹肌', startDate: new Date().toISOString().split('T')[0], description: '通过健身和饮食拥有6块腹肌', status: 'active', logs: [], dailyFocus: {}, todayFocusMinutes: 0, fears: [], attr: AttributeType.STRENGTH,
    subTasks: [
      { id: 't4_1', title: '每天喝八杯水', duration: 5, completed: false, frequency: 'daily' },
      { id: 't4_2', title: '每天做50个深蹲', duration: 10, completed: false, frequency: 'daily' },
      { id: 't4_3', title: '每天做50个俯卧撑', duration: 10, completed: false, frequency: 'daily' },
      { id: 't4_4', title: '每天做30分钟有氧', duration: 30, completed: false, frequency: 'daily' },
      { id: 't4_5', title: '控制饮食，减少碳水', duration: 5, completed: false, frequency: 'daily' }
    ]
  },
];

// --- Initial Challenges ---
export const INITIAL_CHALLENGES = [
  "做 50 个俯卧撑", "冷水洗脸/洗澡", "冥想 20 分钟", "阅读 10 页书",
  "完全断网 1 小时", "整理房间/桌面", "给父母/朋友打个电话",
  "记录 3 件感恩的事", "深蹲 50 下", "核心平板支撑 2 分钟",
  "不吃晚饭/轻断食", "写 500 字日记", "复盘今日得失",
  
  JSON.stringify({ text: "练习15分钟摄影技巧", gold: 20, xp: 25, duration: 15 }),
  JSON.stringify({ text: "学习5分钟管理知识", gold: 15, xp: 20, duration: 5 })
];

// --- Initial Achievements ---
export const INITIAL_ACHIEVEMENTS: AchievementConfig[] = [
  { id: 'c0', name: '迈出一步', limit: 1, unit: 'kills', iconName: 'Target', color: 'text-red-500', desc: '完成 1 个任务', category: '战役' },
];
