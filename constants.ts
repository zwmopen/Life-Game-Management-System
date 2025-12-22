import { ScheduleItem } from './types';

export const SYSTEM_INSTRUCTION = `
你是《人生游戏化管理系统》的中枢智能。
你的目标是指导用户完成为期90天的高强度财富与个人成长闭关。

export const INITIAL_SCHEDULE: ScheduleItem[] = [
  { id: '1', time: '07:30', activity: '生物激活：起床 & 阳光/冷水', theory: 'aMCC 唤醒 / 昼夜节律', completed: false },
  { id: '2', time: '08:00', activity: '精神校准：冥想 & 恐惧设定', theory: '前额叶皮层激活', completed: false },
  { id: '3', time: '08:30', activity: '深度工作 I：吞青蛙 (核心任务)', theory: '高能时段 / 意志力巅峰', completed: false },
  { id: '4', time: '12:00', activity: '能量补给：低碳水午餐', theory: '避免血糖崩溃', completed: false },
  { id: '5', time: '13:00', activity: '主动休息：散步/小睡 (无手机)', theory: 'DMN 默认网络恢复', completed: false },
  { id: '6', time: '14:00', activity: '深度工作 II：堆量/执行', theory: '陶艺课原理 / 刻意练习', completed: false },
  { id: '7', time: '18:00', activity: '身体重塑：高强度运动', theory: 'BDNF 脑源性神经营养因子', completed: false },
  { id: '8', time: '19:30', activity: '输入与复盘：阅读 & 拒绝日志', theory: '摄入负熵 / 元认知', completed: false },
  { id: '9', time: '23:00', activity: '数字日落：远离屏幕', theory: '褪黑素分泌', completed: false },
  { id: '10', time: '00:00', activity: '休眠：深度睡眠', theory: '记忆巩固 / 清除代谢废物', completed: false },
];
