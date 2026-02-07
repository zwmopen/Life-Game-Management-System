import { AchievementItem, DiceCategory, Project, Habit } from '../types';
import { AttributeType } from '../types';

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
// 替换为 ZWM Pro 日常显化任务
export const INITIAL_HABITS = [
  {
    id: 'zwm-1', 
    name: '苏醒显化（睁眼即执行，无手机）', 
    reward: 3, 
    xp: 3, 
    duration: 3, 
    streak: 0, 
    color: '#3b82f6', 
    attr: AttributeType.INTELLIGENCE, 
    archived: false, 
    history: {}, 
    logs: {},
    priority: 'low',
    note: '1. 保持平躺闭眼，在脑海预演 ZWM Pro 今日全流程：起床、任务推进、项目执行、输出分享，沉浸式感受「已完成目标」的从容与掌控感\n2. 默念肯定语：我是 ZWM Pro，今日所有目标皆已显化，身心合一，能量满格，从容掌控人生游戏\n3. 执行要求：全程不碰手机，仅专注画面与情绪',
    reminder: {
      enabled: true,
      time: '07:00',
      repeat: 'daily'
    }
  },
  {
    id: 'zwm-2', 
    name: '体态显化（起身即校准）', 
    reward: 1, 
    xp: 1, 
    duration: 1, 
    streak: 0, 
    color: '#ef4444', 
    attr: AttributeType.STRENGTH, 
    archived: false, 
    history: {}, 
    logs: {},
    priority: 'low',
    note: '1. 站立调整体态：腰背笔直、核心收紧，做 3 次深呼吸\n2. 默念肯定语：我身姿挺拔，气场笃定，每一个动作都在显化最高版本的自己，自带掌控力\n3. 执行要求：对着镜子完成，强化肢体记忆',
    reminder: {
      enabled: true,
      time: '07:05',
      repeat: 'daily'
    }
  },
  {
    id: 'zwm-3', 
    name: '时间管理显化（任务搭建 + 显化目标落地）', 
    reward: 18, 
    xp: 18, 
    duration: 18, 
    streak: 0, 
    color: '#f59e0b', 
    attr: AttributeType.WEALTH, 
    archived: false, 
    history: {}, 
    logs: {},
    priority: 'low',
    note: '1. 打开滴答清单，录入当日所有待办事项\n2. 为每个任务分配预估时长，主动压缩 10%-20% 制造良性时间压力\n3. 按重要紧急排序，置顶最重要最紧急的 3 件核心任务\n4. 进入人生游戏管理系统，用时间盒子批量添加任务，完成任务框架搭建\n5. 默念肯定语：我精准掌控时间，每一个任务规划都在显化高效执行的现实，日拱一卒，必达目标\n6. 执行要求：全程无干扰，专注完成任务搭建',
    reminder: {
      enabled: true,
      time: '07:07',
      repeat: 'daily'
    }
  },
  {
    id: 'zwm-4', 
    name: '晨间肯定显化（信念强化）', 
    reward: 5, 
    xp: 5, 
    duration: 5, 
    streak: 0, 
    color: '#3b82f6', 
    attr: AttributeType.INTELLIGENCE, 
    archived: false, 
    history: {}, 
    logs: {},
    priority: 'low',
    note: '1. 大声朗读 ZWM Pro 核心肯定语：我是 ZWM Pro，人生游戏的唯一开发者，主动迭代，绝不回滚，所有愿望皆在行动中显化\n2. 调动「已拥有一切」的积极情绪，保持饱满状态\n3. 执行要求：声音洪亮，情绪饱满，完成后立即进入首个时间盒任务',
    reminder: {
      enabled: true,
      time: '07:25',
      repeat: 'daily'
    }
  },
  {
    id: 'zwm-5', 
    name: '闹钟锚定显化（状态校准 + 专注显化）', 
    reward: 1, 
    xp: 1, 
    duration: 1, 
    streak: 0, 
    color: '#f59e0b', 
    attr: AttributeType.WEALTH, 
    archived: false, 
    history: {}, 
    logs: {},
    priority: 'low',
    note: '1. 立刻停下手头所有事务，调整为 ZWM Pro 挺拔体态\n2. 默念肯定语：此刻我是 ZWM Pro，单线程专注，拒绝内耗，每一次行动都在显化项目推进的成果\n3. 关闭手机所有通知，重启任务倒计时\n4. 执行要求：快速完成，无拖延，立即回归核心任务',
    reminder: {
      enabled: true,
      time: '09:00',
      repeat: 'daily'
    }
  },
  {
    id: 'zwm-6', 
    name: '午间显化复盘（进度对齐）', 
    reward: 5, 
    xp: 5, 
    duration: 5, 
    streak: 0, 
    color: '#f59e0b', 
    attr: AttributeType.WEALTH, 
    archived: false, 
    history: {}, 
    logs: {},
    priority: 'low',
    note: '1. 快速查看上午时间盒完成度，记录预估时长与实际耗时的偏差\n2. 确认核心任务推进进度，标记已完成的显化小节点\n3. 默念肯定语：我稳步推进目标，每一次复盘都在优化显化路径，上午的执行已为成功显化奠定基础\n4. 执行要求：简单记录，不纠结未完成项，聚焦优化方向',
    reminder: {
      enabled: true,
      time: '12:00',
      repeat: 'daily'
    }
  },
  {
    id: 'zwm-7', 
    name: '午间情绪显化（能量补给）', 
    reward: 5, 
    xp: 5, 
    duration: 5, 
    streak: 0, 
    color: '#3b82f6', 
    attr: AttributeType.INTELLIGENCE, 
    archived: false, 
    history: {}, 
    logs: {},
    priority: 'low',
    note: '1. 播放 ZWM Pro 专属音乐，闭眼放松，感受身心舒适的状态\n2. 回忆上午执行任务时的掌控感，强化积极情绪\n3. 默念肯定语：我能量充沛，身心舒适，从容应对下午任务，所有显化目标都在按节奏落地\n4. 执行要求：全身心放松，为下午执行储备能量',
    reminder: {
      enabled: true,
      time: '12:05',
      repeat: 'daily'
    }
  },
  {
    id: 'zwm-8', 
    name: '闹钟锚定显化（卡点破解 + 执行强化）', 
    reward: 2, 
    xp: 2, 
    duration: 2, 
    streak: 0, 
    color: '#f59e0b', 
    attr: AttributeType.WEALTH, 
    archived: false, 
    history: {}, 
    logs: {},
    priority: 'low',
    note: '1. 若遇任务卡壳：立即启动「马斯克三连击」—— 写下核心阻碍→核算解决成本→5 分钟内决策（立即执行或永久删除）\n2. 若无卡壳：重新聚焦核心任务，调整专注状态\n3. 默念肯定语：我用马斯克三连击破解所有阻碍，果断决策，绝不犹豫，每一次突破都在显化解决问题的能力\n4. 执行要求：快速处理卡点，重启时间盒倒计时',
    reminder: {
      enabled: true,
      time: '15:00',
      repeat: 'daily'
    }
  },
  {
    id: 'zwm-9', 
    name: '当日执行显化（成果复盘）', 
    reward: 5, 
    xp: 5, 
    duration: 5, 
    streak: 0, 
    color: '#f59e0b', 
    attr: AttributeType.WEALTH, 
    archived: false, 
    history: {}, 
    logs: {},
    priority: 'low',
    note: '1. 汇总当日所有时间盒完成度，统计核心任务推进情况\n2. 标记当日已显化的小成果（如完成 1 项核心任务、破解 1 个卡点）\n3. 默念肯定语：我今日一丝不苟完成所有规划，日拱一卒，每一个完成的任务都是目标显化的实证\n4. 执行要求：简单记录，肯定当日成果，不内耗、不自我否定',
    reminder: {
      enabled: true,
      time: '18:00',
      repeat: 'daily'
    }
  },
  {
    id: 'zwm-10', 
    name: '迭代规划 + 输出显化（内容整理 + 分享准备）', 
    reward: 10, 
    xp: 10, 
    duration: 10, 
    streak: 0, 
    color: '#8b5cf6', 
    attr: AttributeType.INTELLIGENCE, 
    archived: false, 
    history: {}, 
    logs: {},
    priority: 'low',
    note: '1. 整理当日学习的优质内容、好方法、新认知\n2. 将所思所想打包成模块化插件 / 更新日志，准备全平台（抖音、小红书、B 站、公众号）分享\n3. 默念肯定语：我输入必践行，践行必输出，每一次分享都在显化个人影响力，优质认知绝不埋没\n4. 执行要求：完成内容整理，确定次日分享渠道与形式',
    reminder: {
      enabled: true,
      time: '21:00',
      repeat: 'daily'
    }
  },
  {
    id: 'zwm-11', 
    name: '睡前显化固化（潜意识编程）', 
    reward: 5, 
    xp: 5, 
    duration: 5, 
    streak: 0, 
    color: '#3b82f6', 
    attr: AttributeType.INTELLIGENCE, 
    archived: false, 
    history: {}, 
    logs: {},
    priority: 'low',
    note: '1. 躺在床上，闭眼预演 ZWM Pro 明日任务推进的完整画面\n2. 感受「明日目标已显化」的从容、笃定情绪，调整为放松体态\n3. 默念肯定语：我今日已完成所有显化动作，旧版本已覆盖，绝不回滚，明日的 ZWM Pro 将更高效，所有愿望皆会显化\n4. 执行要求：全程不碰手机，带着积极情绪入睡',
    reminder: {
      enabled: true,
      time: '22:55',
      repeat: 'daily'
    }
  },
];

// --- Initial Projects ---
export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1', name: '数码博主养成', startDate: '2025-12-23', description: '创建并运营第一个粉丝量达到1万的数码账号', status: 'active' as const, logs: [], dailyFocus: {}, todayFocusMinutes: 0, fears: [], attr: AttributeType.WEALTH,
    subTasks: [
      { id: 't1_1', title: '找爆款', duration: 5, completed: false, frequency: 'daily' as const },
      { id: 't1_2', title: '二创爆款', duration: 5, completed: false, frequency: 'daily' as const },
      { id: 't1_3', title: '发布作品', duration: 5, completed: false, frequency: 'daily' as const }
    ]
  },
  {
    id: 'p3', name: '成长型博主养成', startDate: '2025-12-23', description: '成为一个拥有1000粉丝的成长型博主', status: 'active' as const, logs: [], dailyFocus: {}, todayFocusMinutes: 0, fears: [], attr: AttributeType.INTELLIGENCE,
    subTasks: [
      { id: 't3_1', title: '刷爆款选题', duration: 10, completed: false, frequency: 'daily' as const },
      { id: 't3_2', title: '全网搜集， AI梳理文案', duration: 20, completed: false, frequency: 'daily' as const },
      { id: 't3_3', title: '拍摄视频', duration: 20, completed: false, frequency: 'daily' as const },
      { id: 't3_4', title: '剪辑视频', duration: 20, completed: false, frequency: 'daily' as const },
      { id: 't3_5', title: '发布视频', duration: 10, completed: false, frequency: 'daily' as const }
    ]
  },
  {
    id: 'p4', name: '小红书虚拟店铺运营', startDate: '2025-12-23', description: '运营虚拟资料店铺，销售虚拟资料产品', status: 'active' as const, logs: [], dailyFocus: {}, todayFocusMinutes: 0, fears: [], attr: AttributeType.WEALTH,
    subTasks: [
      { id: 't4_1', title: '找同行选品二创上架', duration: 5, completed: false, frequency: 'daily' as const },
      { id: 't4_2', title: '多平台搜索爆款笔记二创上架', duration: 5, completed: false, frequency: 'daily' as const },
      { id: 't4_3', title: '发布作品', duration: 5, completed: false, frequency: 'daily' as const }
    ]
  }
];

// --- Initial Challenges ---
export const INITIAL_CHALLENGES = [
  // 这些挑战已经被整合到命运骰子系统中，此处保留为空数组
];

// --- 未分类任务已整合到命运骰子系统中 ---

// --- Initial Achievements ---
export const INITIAL_ACHIEVEMENTS: AchievementItem[] = [
  { id: 'c0', title: '迈出一步', description: '完成 1 个任务', unlocked: false, target: 1 },
];

// --- Initial Dice Tasks ---
export const INITIAL_DICE_TASKS = {
  [DiceCategory.HEALTH]: [
    { id: 'dice-health-1', text: '专注5/10/20/25/30/45/60分钟（随机时长）', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 30 },
    { id: 'dice-health-2', text: '深蹲10下', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 1 },
    { id: 'dice-health-3', text: '深蹲50下', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 5 },
    { id: 'dice-health-4', text: '做10/20/30/50个俯卧撑（随机数量）', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 5 },
    { id: 'dice-health-5', text: '做50个俯卧撑', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 10 },
    { id: 'dice-health-6', text: '拉伸肩颈10分钟', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 10 },
    { id: 'dice-health-7', text: '做20个开合跳', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 2 },
    { id: 'dice-health-8', text: '下楼散步15分钟', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 15 },
    { id: 'dice-health-9', text: '泡一杯枸杞/菊花茶', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 2 },
    { id: 'dice-health-10', text: '整理桌面5分钟', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 5 },
    { id: 'dice-health-11', text: '闭眼冥想3分钟', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 3 },
    { id: 'dice-health-12', text: '喝够500ml温水', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 1 },
    { id: 'dice-health-13', text: '做10个平板支撑（30秒/组，分2组）', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 2 },
    { id: 'dice-health-14', text: '核心平板支撑2分钟', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 2 },
    { id: 'dice-health-15', text: '靠墙静蹲1分钟', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 1 },
    { id: 'dice-health-16', text: '做5分钟眼保健操', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 5 },
    { id: 'dice-health-17', text: '踮脚拉伸100次', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 3 },
    { id: 'dice-health-18', text: '深呼吸10次（腹式呼吸）', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 1 },
    { id: 'dice-health-19', text: '冷水洗脸/洗澡', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 1 },
    { id: 'dice-health-20', text: '整理房间', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 10 },
    { id: 'dice-health-21', text: '记录三件感恩的事', category: DiceCategory.HEALTH, goldRange: [3, 6], xpRange: [5, 10], duration: 3 }
  ],
  [DiceCategory.EFFICIENCY]: [
    { id: 'dice-efficiency-1', text: '为数码号寻找一个爆款作品并复刻发布', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 60 },
    { id: 'dice-efficiency-2', text: '制作两个数码爆款备用，准备发布', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 90 },
    { id: 'dice-efficiency-3', text: '整理一份扣子制作工作流', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 30 },
    { id: 'dice-efficiency-4', text: '整理一篇最新AI资讯，发布在公众号', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 45 },
    { id: 'dice-efficiency-5', text: '整理一个AI干货发布在公众号，并录制视频发布抖音', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 120 },
    { id: 'dice-efficiency-6', text: '给商品库新增一个商品', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 15 },
    { id: 'dice-efficiency-7', text: '马上完成一个滴答任务', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 10 },
    { id: 'dice-efficiency-8', text: '一句话总结今天的核心任务', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 2 },
    { id: 'dice-efficiency-9', text: '马上选品并上架一个产品', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 20 },
    { id: 'dice-efficiency-10', text: '马上选品并上架两个商品', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 40 },
    { id: 'dice-efficiency-11', text: '为有潜力的一个产品发布一篇笔记', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 30 },
    { id: 'dice-efficiency-12', text: '为有潜力的产品发布两篇笔记', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 60 },
    { id: 'dice-efficiency-13', text: '去抖音搬运一篇优质的商品笔记', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 20 },
    { id: 'dice-efficiency-14', text: '将商品数据分享给朋友', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 5 },
    { id: 'dice-efficiency-15', text: '打电话，随机找一个朋友聊天', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 10 },
    { id: 'dice-efficiency-16', text: '梳理10分钟飞书文档', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 10 },
    { id: 'dice-efficiency-17', text: '梳理10分钟滴答清单', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 10 },
    { id: 'dice-efficiency-18', text: '收藏3个优质的同行选题', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 15 },
    { id: 'dice-efficiency-19', text: '给已发布的笔记/商品写1条评论回复', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 5 },
    { id: 'dice-efficiency-20', text: '清理手机相册10分钟（删掉没用的截图）', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 10 },
    { id: 'dice-efficiency-21', text: '复盘1个当天完成的小任务（写1句话总结）', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 5 },
    { id: 'dice-efficiency-22', text: '给当天的项目列3个核心待办', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 10 },
    { id: 'dice-efficiency-23', text: '整理1份副业素材（比如数码产品卖点笔记）', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 30 },
    { id: 'dice-efficiency-24', text: '给下一个盲盒奖励档位列2个候选商品', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 15 },
    { id: 'dice-efficiency-25', text: '复盘今天的得失', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 15 },
    { id: 'dice-efficiency-26', text: '学习5分钟的管理技巧', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 5 },
    { id: 'dice-efficiency-27', text: '看一篇精华帖', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 15 },
    { id: 'dice-efficiency-28', text: '把所想的拍摄30秒', category: DiceCategory.EFFICIENCY, goldRange: [5, 10], xpRange: [10, 20], duration: 5 }
  ],
  [DiceCategory.LEISURE]: [
    { id: 'dice-leisure-1', text: '奖励自己喝杯水', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 1 },
    { id: 'dice-leisure-2', text: '马上喝一杯水', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 1 },
    { id: 'dice-leisure-3', text: '马上吃个水果', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 5 },
    { id: 'dice-leisure-4', text: '马上吃一包辣条', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 3 },
    { id: 'dice-leisure-5', text: '听一首喜欢的歌（单曲循环1遍）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 4 },
    { id: 'dice-leisure-6', text: '看1个搞笑短视频合集（5分钟内）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 5 },
    { id: 'dice-leisure-7', text: '吃一颗糖果/一块巧克力', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 2 },
    { id: 'dice-leisure-8', text: '给绿植浇一次水（顺便欣赏5分钟）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 5 },
    { id: 'dice-leisure-9', text: '换一张手机锁屏壁纸（用自制MBTI图）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 3 },
    { id: 'dice-leisure-10', text: '翻一页喜欢的书（不用强求读完）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 1 },
    { id: 'dice-leisure-11', text: '给自己拍一张今日状态照（记录小日常）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 2 },
    { id: 'dice-leisure-12', text: '选一部想看的电影/剧，添加到收藏夹', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 3 },
    { id: 'dice-leisure-13', text: '发呆5分钟（不做任何事）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 5 },
    { id: 'dice-leisure-14', text: '听一段10分钟的轻音乐', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 10 },
    { id: 'dice-leisure-15', text: '玩一局手机小游戏（5分钟内）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 5 },
    { id: 'dice-leisure-16', text: '看一张喜欢的风景图（1分钟）', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 1 },
    { id: 'dice-leisure-17', text: '给自己泡一杯咖啡/奶茶', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 5 },
    { id: 'dice-leisure-18', text: '整理1个喜欢的表情包文件夹', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 10 },
    { id: 'dice-leisure-19', text: '回忆一件今天的开心小事', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 2 },
    { id: 'dice-leisure-20', text: '写500字的日记', category: DiceCategory.LEISURE, goldRange: [2, 5], xpRange: [3, 8], duration: 20 }
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
