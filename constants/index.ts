import { AchievementItem, AttributeType, DiceCategory } from '../types';

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
  { id: 'mk1', name: '生物激活: 起床 & 阳光/冷水 (07:30)', reward: 5, xp: 10, duration: 15, streak: 1, color: '#ef4444', attr: AttributeType.STRENGTH, archived: false, history: {"2025/12/24":true}, logs: {} },
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
    id: 'p1', name: '数码博主', startDate: '2025-12-23', description: '创建并运营第一个粉丝量达到1万的数码账号', status: 'active', logs: [], dailyFocus: {}, todayFocusMinutes: 0, fears: [], attr: AttributeType.WEALTH,
    subTasks: [
      { id: 't1_1', title: '找爆款', duration: 5, completed: false, frequency: 'daily' },
      { id: 't1_2', title: '二创爆款', duration: 5, completed: false, frequency: 'daily' },
      { id: 't1_3', title: '发布作品', duration: 5, completed: false, frequency: 'daily' }
    ]
  },
  {
    id: 'p3', name: '成长型博主', startDate: '2025-12-23', description: '成为一个拥有1000粉丝的成长型博主', status: 'active', logs: [], dailyFocus: {}, todayFocusMinutes: 0, fears: [], attr: AttributeType.INTELLIGENCE,
    subTasks: [
      { id: 't3_1', title: '刷爆款选题', duration: 10, completed: false, frequency: 'daily' },
      { id: 't3_2', title: '全网搜集， AI梳理文案', duration: 20, completed: false, frequency: 'daily' },
      { id: 't3_3', title: '拍摄视频', duration: 20, completed: false, frequency: 'daily' },
      { id: 't3_4', title: '剪辑视频', duration: 20, completed: false, frequency: 'daily' },
      { id: 't3_5', title: '发布视频', duration: 10, completed: false, frequency: 'daily' }
    ]
  },
  {
    id: 'p4', name: '拥有6块腹肌', startDate: '2025-12-23', description: '通过健身和饮食拥有6块腹肌', status: 'active', logs: [], dailyFocus: {}, todayFocusMinutes: 0, fears: [], attr: AttributeType.STRENGTH,
    subTasks: [
      { id: 't4_1', title: '每天喝八杯水', duration: 5, completed: false, frequency: 'daily' },
      { id: 't4_2', title: '每天做50个深蹲', duration: 10, completed: false, frequency: 'daily' },
      { id: 't4_3', title: '每天做50个俯卧撑', duration: 10, completed: false, frequency: 'daily' },
      { id: 't4_4', title: '每天做30分钟有氧', duration: 30, completed: false, frequency: 'daily' },
      { id: 't4_5', title: '控制饮食，减少碳水', duration: 5, completed: false, frequency: 'daily' }
    ]
  },
  {
    id: 'project-1766567611110', name: '小红书虚拟店铺', startDate: new Date().toISOString().split('T')[0], description: '', status: 'active', logs: [], dailyFocus: {}, todayFocusMinutes: 0, fears: [], attr: AttributeType.WEALTH,
    subTasks: [
      { id: 't1_1', title: '找同行选品二创上架', duration: 5, completed: false, frequency: 'daily' },
      { id: 't1_2', title: '多平台搜索爆款笔记二创上架', duration: 5, completed: false, frequency: 'daily' },
      { id: 't1_3', title: '发布作品', duration: 5, completed: false, frequency: 'daily' }
    ]
  }
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
export const INITIAL_ACHIEVEMENTS: AchievementItem[] = [
  { id: 'c0', name: '迈出一步', limit: 1, unit: 'kills', iconName: 'Target', color: 'text-red-500', desc: '完成 1 个任务', category: '战役' },
];

// --- Initial Dice Tasks ---
export const INITIAL_DICE_TASKS = {
  [DiceCategory.HEALTH]: [
    { id: 'dice-health-1', text: '专注5/10/20/25/30/45/60分钟（随机时长）', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 30 },
    { id: 'dice-health-2', text: '深蹲10下', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 5 },
    { id: 'dice-health-3', text: '做10/20/30/50个俯卧撑（随机数量）', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 10 },
    { id: 'dice-health-4', text: '拉伸肩颈10分钟', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 10 },
    { id: 'dice-health-5', text: '做20个开合跳', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 5 },
    { id: 'dice-health-6', text: '下楼散步15分钟', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 15 },
    { id: 'dice-health-7', text: '泡一杯枸杞/菊花茶', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 5 },
    { id: 'dice-health-8', text: '整理桌面5分钟', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 5 },
    { id: 'dice-health-9', text: '闭眼冥想3分钟', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 3 },
    { id: 'dice-health-10', text: '喝够500ml温水', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 5 },
    { id: 'dice-health-11', text: '做10个平板支撑（30秒/组，分2组）', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 10 },
    { id: 'dice-health-12', text: '靠墙静蹲1分钟', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 1 },
    { id: 'dice-health-13', text: '做5分钟眼保健操', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 5 },
    { id: 'dice-health-14', text: '踮脚拉伸100次', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 10 },
    { id: 'dice-health-15', text: '深呼吸10次（腹式呼吸）', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 3 }
  ],
  [DiceCategory.EFFICIENCY]: [
    { id: 'dice-efficiency-1', text: '为数码号寻找一个爆款作品并复刻发布', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 30 },
    { id: 'dice-efficiency-2', text: '制作两个数码爆款备用，准备发布', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 60 },
    { id: 'dice-efficiency-3', text: '整理一份扣子制作工作流', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 45 },
    { id: 'dice-efficiency-4', text: '整理一篇最新AI资讯，发布在公众号', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 60 },
    { id: 'dice-efficiency-5', text: '整理一个AI干货发布在公众号，并录制视频发布抖音', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 90 },
    { id: 'dice-efficiency-6', text: '给商品库新增一个商品', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 20 },
    { id: 'dice-efficiency-7', text: '马上完成一个滴答任务', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 30 },
    { id: 'dice-efficiency-8', text: '一句话总结今天的核心任务', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 5 },
    { id: 'dice-efficiency-9', text: '马上选品并上架一个产品', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 30 },
    { id: 'dice-efficiency-10', text: '马上选品并上架两个商品', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 60 },
    { id: 'dice-efficiency-11', text: '为有潜力的一个产品发布一篇笔记', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 45 },
    { id: 'dice-efficiency-12', text: '为有潜力的产品发布两篇笔记', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 90 },
    { id: 'dice-efficiency-13', text: '去抖音搬运一篇优质的商品笔记', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 20 },
    { id: 'dice-efficiency-14', text: '将商品数据分享给朋友', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 10 },
    { id: 'dice-efficiency-15', text: '打电话，随机找一个朋友聊天', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 15 },
    { id: 'dice-efficiency-16', text: '梳理10分钟飞书文档', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 10 },
    { id: 'dice-efficiency-17', text: '梳理10分钟滴答清单', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 10 },
    { id: 'dice-efficiency-18', text: '收藏3个优质的同行选题（为后续创作囤货）', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 15 },
    { id: 'dice-efficiency-19', text: '给已发布的笔记/商品写1条评论回复', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 5 },
    { id: 'dice-efficiency-20', text: '清理手机相册10分钟（删掉没用的截图）', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 10 },
    { id: 'dice-efficiency-21', text: '复盘1个当天完成的小任务（写1句话总结）', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 5 },
    { id: 'dice-efficiency-22', text: '给当天的项目列3个核心待办', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 10 }
  ],
  [DiceCategory.LEISURE]: [
    { id: 'dice-leisure-1', text: '奖励自己喝杯水', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 2 },
    { id: 'dice-leisure-2', text: '马上吃个水果', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 5 },
    { id: 'dice-leisure-3', text: '马上吃一包辣条', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 5 },
    { id: 'dice-leisure-4', text: '听一首喜欢的歌（单曲循环1遍）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 5 },
    { id: 'dice-leisure-5', text: '看1个搞笑短视频合集（5分钟内）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 5 },
    { id: 'dice-leisure-6', text: '吃一颗糖果/一块巧克力', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 2 },
    { id: 'dice-leisure-7', text: '给绿植浇一次水（顺便欣赏5分钟）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 10 },
    { id: 'dice-leisure-8', text: '换一张手机锁屏壁纸（用自制MBTI图）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 10 },
    { id: 'dice-leisure-9', text: '翻一页喜欢的书（不用强求读完）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 5 },
    { id: 'dice-leisure-10', text: '给自己拍一张今日状态照（记录小日常）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 10 },
    { id: 'dice-leisure-11', text: '选一部想看的电影/剧，添加到收藏夹', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 10 },
    { id: 'dice-leisure-12', text: '发呆5分钟（不做任何事）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 5 },
    { id: 'dice-leisure-13', text: '听一段10分钟的轻音乐', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 10 },
    { id: 'dice-leisure-14', text: '玩一局手机小游戏（5分钟内）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 5 },
    { id: 'dice-leisure-15', text: '看一张喜欢的风景图（1分钟）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 1 },
    { id: 'dice-leisure-16', text: '给自己泡一杯咖啡/奶茶', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 5 },
    { id: 'dice-leisure-17', text: '整理1个喜欢的表情包文件夹', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 15 },
    { id: 'dice-leisure-18', text: '回忆一件今天的开心小事', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 5 }
  ]
};

// --- Initial Dice Config ---
export const INITIAL_DICE_CONFIG = {
  dailyLimit: 10,
  faceCount: 12,
  categoryDistribution: {
    [DiceCategory.HEALTH]: 4,
    [DiceCategory.EFFICIENCY]: 5,
    [DiceCategory.LEISURE]: 3
  }
};

// --- Initial Dice State ---
export const INITIAL_DICE_STATE = {
  todayCount: 0,
  lastClickDate: new Date().toISOString().split('T')[0],
  history: [],
  completedTaskIds: [],
  isSpinning: false,
  currentResult: undefined,
  taskPool: INITIAL_DICE_TASKS,
  config: INITIAL_DICE_CONFIG,
  pendingTasks: [],
  completedTasks: []
};
