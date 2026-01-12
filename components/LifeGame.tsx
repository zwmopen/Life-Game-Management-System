import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, ComposedChart } from 'recharts';
import { 
  Coins, Trophy, ShoppingBag, CheckCircle, Swords, Flame, 
  Shield, Brain, BicepsFlexed, Sparkles, Users, Plus, X, Crown,
  Edit3, Trash2, Repeat, Zap, ChevronDown, ChevronUp, Mic, Loader2, PackagePlus,
  Gamepad2, Play, Pause, StopCircle, Clock, Archive, ArchiveRestore, Settings, Gift,
  Box, XCircle, Sunset, Moon, Coffee, Dumbbell, BookOpen, Calendar, Check, Target, Pencil,
  Radar as RadarIcon, Container, Filter, Wrench, User, Crosshair, TrendingUp, Lock, Unlock, Skull, ArrowLeft, GripVertical, Star, Package, List, RefreshCw, Dice5, Hammer, Edit2, Layout,
  HelpCircle, Smartphone, Laptop, Shirt, Ticket, Music, Wifi, Video, Square, CheckSquare, Dice1,
  Headphones, Armchair, Scissors, Glasses, Footprints, Utensils, Sofa, Activity, Power, ChevronRight, Sun, Wallet,
  Camera, Tablet, Wind, Fish, Mountain, Home, Car, Heart, Globe, Palette
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Theme, AttributeType, AttributeTypeValue, Habit, Project, SubTask, TaskType, AutoTaskType, Task, DiceState, DiceTask, DiceCategory, DiceHistory, Settings as SettingsType } from '../types';
import CharacterProfile, { CharacterProfileHandle } from './CharacterProfile';
import { GlobalGuideCard, HelpTooltip, helpContent } from './HelpSystem';
import FateGiftModal from './shared/FateGiftModal';
import FateDice from './FateDice';

interface LifeGameProps {
  theme: Theme;
  balance: number;
  onUpdateBalance: (amount: number, reason: string) => void;
  habits: Habit[];
  projects: Project[];
  habitOrder: string[];
  projectOrder: string[];
  onToggleHabit: (id: string, dateStr: string) => void;
  onUpdateHabit: (id: string, updates: Partial<Habit>) => void;
  onDeleteHabit: (id: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  onAddHabit: (name: string, reward: number) => void;
  onAddProject: (project: Project) => void;
  initialTab?: 'battle' | 'shop' | 'armory'; 
  initialCategory?: 'daily' | 'main' | 'random';
  onAddFloatingReward: (text: string, color: string, x?: number, y?: number) => void;
  totalTasksCompleted: number;
  totalHours: number; 
  challengePool: string[];
  setChallengePool: (pool: string[]) => void;
  todaysChallenges: {date: string, tasks: string[]};
  completedRandomTasks: {[date: string]: string[]};
  onToggleRandomChallenge: (task: string) => void;
  onStartAutoTask: (type: AutoTaskType, id: string, duration: number, subId?: string) => void;
  checkInStreak: number;
  onPomodoroComplete: (m: number) => void;
  xp: number;
  weeklyGoal: string;
  setWeeklyGoal: (g: string) => void;
  todayGoal: string;
  settings: SettingsType;
  setTodayGoal: (g: string) => void;
  givenUpTasks?: string[];
  onGiveUpTask?: (id: string) => void;
  isNavCollapsed: boolean;
  setIsNavCollapsed: (collapsed: boolean) => void;
  // 统计数据
  todayStats: {focusMinutes: number, tasksCompleted: number, habitsDone: number, earnings: number, spending: number};
  statsHistory: {[key: number]: {focusMinutes: number, tasksCompleted: number, habitsDone: number, earnings: number, spending: number}};
  // Pomodoro Global State
  timeLeft: number;
  isActive: boolean;
  duration: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onChangeDuration: (minutes: number) => void;
  onUpdateTimeLeft: (seconds: number) => void;
  onUpdateIsActive: (active: boolean) => void;
  // Additional props from previous code
  onUpdateHabitOrder?: (order: string[]) => void;
  onUpdateProjectOrder?: (order: string[]) => void;
  // Immersive Mode State
  isImmersive: boolean;
  setIsImmersive: (isImmersive: boolean) => void;
  onInternalImmersiveModeChange?: (isInternalImmersive: boolean) => void;
  
  // 命运骰子相关
  diceState?: DiceState;
  onSpinDice?: () => { success: boolean; message?: string };
  onDiceResult?: (result: 'completed' | 'skipped' | 'later') => void;
  onAddDiceTask?: (task: DiceTask) => void;
  onDeleteDiceTask?: (taskId: string, category: DiceCategory) => void;
  onUpdateDiceTask?: (taskId: string, category: DiceCategory, updates: Partial<DiceTask>) => void;
  onUpdateDiceConfig?: (config: Partial<DiceState['config']>) => void;
  onUpdateDiceState?: (updates: Partial<DiceState>) => void;
  // 角色等级变化回调
  onLevelChange: (newLevel: number, type: 'level' | 'focus' | 'wealth') => void;
}

const XP_PER_LEVEL = 200;

// Hardcoded colors for shop items
const SHOP_CATALOG = [
  // 数码产品
  { id: 'p_dig_1', name: 'iPhone 16 Pro', description: '顶级通讯终端', cost: 8999, type: 'physical', owned: false, icon: <Smartphone size={24} className="text-zinc-300"/>, category: '数码', image: 'https://images.unsplash.com/photo-1595941069915-4ebc5197c14a?w=400&h=400&fit=crop' },
  { id: 'p_dig_2', name: 'MacBook Pro M4', description: '生产力核心武器', cost: 16000, type: 'physical', owned: false, icon: <Laptop size={24} className="text-zinc-400"/>, category: '数码', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop' },
  { id: 'p_dig_3', name: '降噪耳机', description: '主动降噪，物理结界', cost: 2000, type: 'physical', owned: false, icon: <Headphones size={24} className="text-blue-400"/>, category: '数码', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' },
  { id: 'p_dig_5', name: '机械键盘', description: '输入体验升级', cost: 800, type: 'physical', owned: false, icon: <Layout size={24} className="text-purple-400"/>, category: '数码', image: 'https://images.unsplash.com/photo-1546813725-7712a0a1e6e9?w=400&h=400&fit=crop' },
  { id: 'p_dig_6', name: '大疆pocket 3', description: '便携稳定器', cost: 2590, type: 'physical', owned: false, icon: <Camera size={24} className="text-yellow-500"/>, category: '数码', image: 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=400&h=400&fit=crop' },
  { id: 'p_dig_8', name: 'AirPods', description: '无线耳机', cost: 189, type: 'physical', owned: false, icon: <Headphones size={24} className="text-blue-400"/>, category: '数码', image: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&h=400&fit=crop' },
  { id: 'p_dig_9', name: 'MacBook Pro', description: '高端笔记本电脑', cost: 6499, type: 'physical', owned: false, icon: <Laptop size={24} className="text-zinc-400"/>, category: '数码', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop' },
  { id: 'p_dig_10', name: 'iPad', description: '平板电脑', cost: 3299, type: 'physical', owned: false, icon: <Tablet size={24} className="text-purple-400"/>, category: '数码', image: 'https://images.unsplash.com/photo-1546813725-7712a0a1e6e9?w=400&h=400&fit=crop' },
  { id: 'p_dig_11', name: '扫地机器人', description: '智能清扫，解放双手', cost: 7200, type: 'physical', owned: false, icon: <Layout size={24} className="text-blue-400"/>, category: '数码', image: 'https://images.unsplash.com/photo-1588997472614-b0688c7112d7?w=400&h=400&fit=crop' },
  { id: 'p_dig_12', name: '戴森吹风机', description: '高端吹风机', cost: 1999, type: 'physical', owned: false, icon: <Wind size={24} className="text-pink-500"/>, category: '数码', image: 'https://images.unsplash.com/photo-1600721391834-90a80756e3d6?w=400&h=400&fit=crop' },
  
  // 装备
  { id: 'p_gear_1', name: '人体工学椅', description: '脊椎防御系统', cost: 1500, type: 'physical', owned: false, icon: <Armchair size={24} className="text-orange-400"/>, category: '家居', image: 'https://images.unsplash.com/photo-1594322463965-1d4de4db17a6?w=400&h=400&fit=crop' },
  { id: 'p_gear_2', name: '乳胶枕头', description: '深度睡眠加速器', cost: 300, type: 'physical', owned: false, icon: <Sofa size={24} className="text-purple-400"/>, category: '家居', image: 'https://images.unsplash.com/photo-1578011611930-14a6a3fa3ada?w=400&h=400&fit=crop' },
  { id: 'p_gear_3', name: '新战靴 (鞋子)', description: '行动力 +10%', cost: 800, type: 'physical', owned: false, icon: <Footprints size={24} className="text-yellow-600"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop' },
  { id: 'p_gear_4', name: '防蓝光眼镜', description: '护眼 Buff', cost: 400, type: 'physical', owned: false, icon: <Glasses size={24} className="text-cyan-400"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=400&h=400&fit=crop' },
  { id: 'p_gear_5', name: '智能台灯', description: '护眼照明，专注模式', cost: 350, type: 'physical', owned: false, icon: <Sun size={24} className="text-yellow-500"/>, category: '数码', image: 'https://images.unsplash.com/photo-1504300491503-620f6f7f5e22?w=400&h=400&fit=crop' },
  
  // 饮食
  { id: 's_food_1', name: '辣条一包', description: '廉价多巴胺 (慎用)', cost: 1, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-red-500"/>, category: '吃喝', image: 'https://images.unsplash.com/photo-1622144687321-0e0e4b4d3b76?w=400&h=400&fit=crop' },
  { id: 's_food_2', name: '快乐水', description: '瞬间恢复心情', cost: 5, type: 'leisure', owned: false, icon: <Coffee size={24} className="text-amber-700"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop' },
  { id: 's_food_3', name: '疯狂星期四', description: '高热量补给', cost: 68, type: 'leisure', owned: false, icon: <Gift size={24} className="text-yellow-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop' },
  { id: 's_food_6', name: '买一瓶饮料', description: '解渴又提神', cost: 5, type: 'leisure', owned: false, icon: <Coffee size={24} className="text-blue-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop' },
  { id: 's_food_7', name: '烤全羊', description: '豪华美食', cost: 800, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-red-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&h=400&fit=crop' },
  { id: 's_food_8', name: '烧烤', description: '街头美食', cost: 60, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-orange-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1594470873215-3cc9123d7d3b?w=400&h=400&fit=crop' },
  { id: 's_food_9', name: '烤鱼', description: '美味烤鱼', cost: 100, type: 'leisure', owned: false, icon: <Fish size={24} className="text-blue-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1565299507177-b0a94c693d60?w=400&h=400&fit=crop' },
  { id: 's_food_10', name: '烤鸭', description: '传统美食', cost: 30, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-yellow-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=400&fit=crop' },
  { id: 's_food_11', name: '奶茶', description: '休闲饮品', cost: 10, type: 'leisure', owned: false, icon: <Coffee size={24} className="text-pink-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=400&fit=crop' },
  { id: 's_food_12', name: '正新鸡排', description: '快餐美食', cost: 13, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-red-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1603360588003-277f06057b9c?w=400&h=400&fit=crop' },
  { id: 's_food_13', name: '香辣大鸡腿', description: '香辣可口', cost: 1.99, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-red-500"/>, category: '饮食', image: 'https://images.unsplash.com/photo-1603360588003-277f06057b9c?w=400&h=400&fit=crop' },
  
  // 娱乐
  { id: 's_ent_1', name: '看小说半小时', description: '沉浸式阅读体验', cost: 30, type: 'leisure', owned: false, icon: <BookOpen size={24} className="text-purple-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1535295972055-1f8e86b906a6?w=400&h=400&fit=crop' },
  { id: 's_ent_2', name: '刷短视频半小时', description: '短平快的娱乐方式', cost: 30, type: 'leisure', owned: false, icon: <Video size={24} className="text-red-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=400&h=400&fit=crop' },
  { id: 's_ent_3', name: '看小说一小时', description: '长时间沉浸式阅读', cost: 60, type: 'leisure', owned: false, icon: <BookOpen size={24} className="text-purple-600"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1535295972055-1f8e86b906a6?w=400&h=400&fit=crop' },
  { id: 's_ent_4', name: '刷短视频一小时', description: '长时间刷短视频', cost: 60, type: 'leisure', owned: false, icon: <Video size={24} className="text-red-600"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=400&h=400&fit=crop' },
  
  // 服务
  { id: 's_hair_1', name: '理发', description: '魅力值回升', cost: 48, type: 'leisure', owned: false, icon: <Scissors size={24} className="text-pink-400"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1598950616249-8e3c1a325cda?w=400&h=400&fit=crop' },
  { id: 's_spa_1', name: '按摩放松', description: '缓解疲劳，恢复精力', cost: 198, type: 'leisure', owned: false, icon: <Armchair size={24} className="text-blue-400"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1598950616249-8e3c1a325cda?w=400&h=400&fit=crop' },
  { id: 's_books_1', name: '书籍购买', description: '知识获取，思维升级', cost: 98, type: 'leisure', owned: false, icon: <BookOpen size={24} className="text-amber-600"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop' },
  
  // 票务
  { id: 'r_tick_1', name: '旅游车票 x1', description: '探索新地图', cost: 298, type: 'rights', owned: false, icon: <Ticket size={24} className="text-green-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&h=400&fit=crop' },
  { id: 'r_tick_2', name: '电影票', description: '娱乐放松，情感共鸣', cost: 45, type: 'rights', owned: false, icon: <Video size={24} className="text-red-600"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=400&fit=crop' },
  { id: 'r_tick_3', name: '演唱会门票', description: '音乐盛宴，情感释放', cost: 498, type: 'rights', owned: false, icon: <Music size={24} className="text-purple-600"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
  
  // 会员
  { id: 'r_vip_1', name: '网易云 VIP (月)', description: '听觉享受', cost: 15, type: 'rights', owned: false, icon: <Music size={24} className="text-red-600"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  { id: 'r_vip_3', name: '健身会员 (月)', description: '健身特权，健康生活', cost: 298, type: 'rights', owned: false, icon: <Dumbbell size={24} className="text-blue-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop' },
  { id: 'r_vip_4', name: '网课论坛会员', description: '学习资源，交流平台', cost: 99, type: 'rights', owned: false, icon: <BookOpen size={24} className="text-purple-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=400&fit=crop' },
  { id: 'r_vip_5', name: '小众社群', description: '兴趣交流，人脉拓展', cost: 99, type: 'rights', owned: false, icon: <Users size={24} className="text-green-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1512485694743-9c95d02a610e?w=400&h=400&fit=crop' },
  { id: 'r_vip_6', name: '知识星球会员', description: '优质知识分享社群', cost: 199, type: 'rights', owned: false, icon: <BookOpen size={24} className="text-amber-600"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=400&fit=crop' },
  { id: 'r_vip_7', name: '行业交流群', description: '专业人脉拓展平台', cost: 299, type: 'rights', owned: false, icon: <Users size={24} className="text-blue-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1512485694474-9b0f1a1f1f0b?w=400&h=400&fit=crop' },
  { id: 'r_vip_8', name: '兴趣爱好社群', description: '志同道合者的聚集地', cost: 88, type: 'rights', owned: false, icon: <Users size={24} className="text-pink-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1512485694474-9b0f1a1f1f0b?w=400&h=400&fit=crop' },
  { id: 'r_vip_9', name: '专业论坛会员', description: '深度专业交流平台', cost: 159, type: 'rights', owned: false, icon: <BookOpen size={24} className="text-cyan-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop' },
  { id: 'r_vip_10', name: '线下活动社群', description: '定期线下聚会活动', cost: 399, type: 'rights', owned: false, icon: <Users size={24} className="text-orange-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=400&fit=crop' },
  
  // 充值
  { id: 'r_char_1', name: '话费充值卡', description: '通讯保障', cost: 99, type: 'rights', owned: false, icon: <Wifi size={24} className="text-blue-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400&h=400&fit=crop' },
  { id: 'r_char_1_50', name: '话费充值卡50元', description: '通讯保障', cost: 50, type: 'rights', owned: false, icon: <Wifi size={24} className="text-blue-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400&h=400&fit=crop' },
  { id: 'r_char_3', name: '云存储空间', description: '数据安全，便捷访问', cost: 118, type: 'rights', owned: false, icon: <Box size={24} className="text-purple-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop' },
  
  // 新增商品
  { id: 'r_misc_1', name: '365天日历', description: '时间管理，记录生活', cost: 9.9, type: 'physical', owned: false, icon: <Calendar size={24} className="text-yellow-500"/>, category: '家居', image: 'https://images.unsplash.com/photo-1597088757913-6bbb3a0d4c32?w=400&h=400&fit=crop' },
  { id: 'r_misc_2', name: '约人爬山', description: '户外活动，锻炼身体', cost: 9.9, type: 'leisure', owned: false, icon: <Mountain size={24} className="text-green-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1551632436-7a87931f0d0f?w=400&h=400&fit=crop' },
  { id: 'r_misc_3', name: '智能手表', description: '健康监测与通讯', cost: 1299, type: 'physical', owned: false, icon: <Smartphone size={24} className="text-blue-400"/>, category: '数码', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' },
  { id: 'r_misc_4', name: '咖啡机', description: '自制美味咖啡', cost: 899, type: 'physical', owned: false, icon: <Coffee size={24} className="text-amber-700"/>, category: '家居', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop' },
  { id: 'r_misc_5', name: '瑜伽垫', description: '居家健身必备', cost: 89, type: 'physical', owned: false, icon: <Dumbbell size={24} className="text-purple-500"/>, category: '家居', image: 'https://images.unsplash.com/photo-1540461788492-74719fe221d7?w=400&h=400&fit=crop' },
  { id: 'r_misc_6', name: '电影会员年卡', description: '全年电影观看特权', cost: 199, type: 'rights', owned: false, icon: <Video size={24} className="text-red-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=400&fit=crop' },
  { id: 'r_misc_7', name: '在线课程', description: '专业技能提升', cost: 399, type: 'rights', owned: false, icon: <BookOpen size={24} className="text-blue-600"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=400&fit=crop' },
  { id: 'r_misc_8', name: '演唱会周边', description: '限量版演唱会纪念品', cost: 199, type: 'physical', owned: false, icon: <Music size={24} className="text-purple-600"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  { id: 'r_misc_9', name: '定制T恤', description: '个性化服装定制', cost: 129, type: 'physical', owned: false, icon: <Shirt size={24} className="text-pink-500"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf1286?w=400&h=400&fit=crop' },
  { id: 'r_misc_10', name: '宠物食品', description: '优质宠物粮', cost: 159, type: 'physical', owned: false, icon: <Fish size={24} className="text-orange-500"/>, category: '家居', image: 'https://images.unsplash.com/photo-1592409338565-f1231a1367d2?w=400&h=400&fit=crop' },
  
  // 新增用户要求商品
  // 家居类
  { id: 'p_home_1', name: '室内炉锅桌子', description: '家居生活必备', cost: 1299, type: 'physical', owned: false, icon: <Utensils size={24} className="text-amber-500"/>, category: '家居', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=400&fit=crop' },
  { id: 'p_home_2', name: '厨房套装', description: '全套厨房设备', cost: 3500, type: 'physical', owned: false, icon: <Utensils size={24} className="text-blue-500"/>, category: '家居', image: 'https://images.unsplash.com/photo-1494267222772-aa0a0a78e4d6?w=400&h=400&fit=crop' },
  
  // 房产类
  { id: 'p_property_1', name: '房子一间', description: '温馨小屋', cost: 500000, type: 'physical', owned: false, icon: <Home size={24} className="text-red-500"/>, category: '家居', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=400&fit=crop' },
  
  // 车辆类
  { id: 'p_car_1', name: '理想汽车', description: '新能源汽车', cost: 250000, type: 'physical', owned: false, icon: <Car size={24} className="text-green-500"/>, category: '家居', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop' },
  
  // 饮食类
  { id: 's_food_14', name: '酱骨头套餐', description: '酱骨头、牛骨头、调料一条龙', cost: 158, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-red-500"/>, category: '吃喝', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop' },
  { id: 's_food_15', name: '烧烤套餐（自制）', description: '自己动手做烧烤', cost: 88, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-orange-500"/>, category: '吃喝', image: 'https://images.unsplash.com/photo-1594470873215-3cc9123d7d3b?w=400&h=400&fit=crop' },
  { id: 's_food_16', name: '烧烤套餐（外买）', description: '购买现成烧烤', cost: 158, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-orange-500"/>, category: '吃喝', image: 'https://images.unsplash.com/photo-1594470873215-3cc9123d7d3b?w=400&h=400&fit=crop' },
  { id: 's_food_17', name: '烤鱼（外买）', description: '美味烤鱼188元', cost: 188, type: 'leisure', owned: false, icon: <Fish size={24} className="text-blue-500"/>, category: '吃喝', image: 'https://images.unsplash.com/photo-1565299507177-b0a94c693d60?w=400&h=400&fit=crop' },
  { id: 's_food_18', name: '烤鱼（自制）', description: '自己做烤鱼55元', cost: 55, type: 'leisure', owned: false, icon: <Fish size={24} className="text-blue-500"/>, category: '吃喝', image: 'https://images.unsplash.com/photo-1565299507177-b0a94c693d60?w=400&h=400&fit=crop' },
  { id: 's_food_19', name: '临沂炒鸡', description: '正宗临沂炒鸡', cost: 33, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-yellow-500"/>, category: '吃喝', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=400&fit=crop' },
  
  // 旅游类
  { id: 'r_tick_4', name: '挪威旅行', description: '去挪威旅行一次', cost: 15000, type: 'rights', owned: false, icon: <Mountain size={24} className="text-blue-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&h=400&fit=crop' },
  { id: 'r_tick_5', name: '家庭旅游', description: '带家人出去旅游', cost: 3000, type: 'rights', owned: false, icon: <Users size={24} className="text-green-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1504674900247-1313e29a9c8a?w=400&h=400&fit=crop' },
  
  // 服务类
  { id: 's_service_1', name: '体检套餐', description: '带爸爸妈妈做体检', cost: 1200, type: 'rights', owned: false, icon: <Heart size={24} className="text-red-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1576671418898-8df6ff28c089?w=400&h=400&fit=crop' },
  
  // 运动类
  { id: 's_sport_1', name: '爬山', description: '去爬山30分钟', cost: 20, type: 'leisure', owned: false, icon: <Mountain size={24} className="text-green-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop' },
  { id: 's_sport_2', name: '跑步', description: '去跑步30分钟', cost: 10, type: 'leisure', owned: false, icon: <Footprints size={24} className="text-blue-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1542730929-8235dcf0ac3f?w=400&h=400&fit=crop' },
  { id: 's_sport_3', name: '健身', description: '去健身房30分钟', cost: 50, type: 'leisure', owned: false, icon: <Dumbbell size={24} className="text-red-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1534158992650-737b1f0d9f90?w=400&h=400&fit=crop' },
  
  // 服装类
  { id: 'p_cloth_1', name: '衣服一件', description: '时尚服装', cost: 299, type: 'physical', owned: false, icon: <Shirt size={24} className="text-purple-500"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400&h=400&fit=crop' },
  { id: 'p_cloth_2', name: '裤子一条', description: '休闲裤子', cost: 199, type: 'physical', owned: false, icon: <Shirt size={24} className="text-blue-500"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1541099903977-7a2fd1f0d3b8?w=400&h=400&fit=crop' },
  { id: 'p_cloth_3', name: '家人衣服', description: '给家人买衣服', cost: 399, type: 'physical', owned: false, icon: <Users size={24} className="text-pink-500"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1591369822091-8fd4294d705e?w=400&h=400&fit=crop' },
  { id: 'p_cloth_4', name: '家人裤子', description: '给家人买裤子', cost: 299, type: 'physical', owned: false, icon: <Users size={24} className="text-green-500"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1541099903977-7a2fd1f0d3b8?w=400&h=400&fit=crop' },
  
  // 礼品类
  { id: 'p_gift_1', name: '朋友礼物', description: '常用但贵的小礼物', cost: 1000, type: 'physical', owned: false, icon: <Gift size={24} className="text-yellow-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=400&h=400&fit=crop' },

  // 第一批新增商品（饮食类/休闲娱乐类）
  { id: 's_food_20', name: '一桶泡面', description: '方便快捷的美食', cost: 5, type: 'leisure', owned: false, icon: <Utensils size={24} className="text-red-500"/>, category: '吃喝', image: 'https://images.unsplash.com/photo-1594470873215-3cc9123d7d3b?w=400&h=400&fit=crop' },
  { id: 'r_tick_6', name: '说走就走的短途旅行', description: '短途旅行，放松心情', cost: 1100, type: 'rights', owned: false, icon: <Mountain size={24} className="text-green-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&h=400&fit=crop' },
  { id: 'r_tick_7', name: '说走就走的长途旅行', description: '长途旅行，探索世界', cost: 5000, type: 'rights', owned: false, icon: <Mountain size={24} className="text-blue-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=400&h=400&fit=crop' },
  { id: 'r_tick_8', name: '说走就走的国际旅行', description: '国际旅行，开阔视野', cost: 50000, type: 'rights', owned: false, icon: <Globe size={24} className="text-purple-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&h=400&fit=crop' },

  // 第二批新增商品（娱乐类/形象设计与穿搭类）
  { id: 's_spa_2', name: '按摩', description: '缓解疲劳，放松身心', cost: 200, type: 'leisure', owned: false, icon: <Armchair size={24} className="text-blue-400"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1598950616249-8e3c1a325cda?w=400&h=400&fit=crop' },
  { id: 'r_tick_9', name: '兴趣组队门票', description: '加入兴趣组队活动', cost: 50, type: 'rights', owned: false, icon: <Users size={24} className="text-yellow-500"/>, category: '休闲娱乐', image: 'https://images.unsplash.com/photo-1512485694474-9b0f1a1f1f0b?w=400&h=400&fit=crop' },
  { id: 'p_cloth_5', name: '素颜霜', description: '提升气色，自然妆容', cost: 100, type: 'physical', owned: false, icon: <Palette size={24} className="text-pink-500"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1522073159900-02300ba3dfeb?w=400&h=400&fit=crop' },
  { id: 'p_cloth_6', name: '夹板', description: '打造百变发型', cost: 30, type: 'physical', owned: false, icon: <Scissors size={24} className="text-purple-500"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1595675024853-0f3ec9098ac7?w=400&h=400&fit=crop' },
  { id: 'p_cloth_7', name: '头发烫染', description: '时尚发型，提升魅力', cost: 100, type: 'physical', owned: false, icon: <Scissors size={24} className="text-red-500"/>, category: '形象设计与穿搭', image: 'https://images.unsplash.com/photo-1595675024853-0f3ec9098ac7?w=400&h=400&fit=crop' },
  { id: 'r_vip_11', name: '社群门票(1000元)', description: '加入高端社群', cost: 1000, type: 'rights', owned: false, icon: <Users size={24} className="text-green-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1512485694474-9b0f1a1f1f0b?w=400&h=400&fit=crop' },
  { id: 'r_vip_12', name: '社群门票(3000元)', description: '加入精英社群', cost: 3000, type: 'rights', owned: false, icon: <Users size={24} className="text-blue-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1512485694474-9b0f1a1f1f0b?w=400&h=400&fit=crop' },
  { id: 'r_vip_13', name: '社群门票(5000元)', description: '加入顶级社群', cost: 5000, type: 'rights', owned: false, icon: <Users size={24} className="text-purple-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1512485694474-9b0f1a1f1f0b?w=400&h=400&fit=crop' },
  { id: 'r_vip_14', name: '社群门票(10000元)', description: '加入尊享社群', cost: 10000, type: 'rights', owned: false, icon: <Users size={24} className="text-yellow-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1512485694474-9b0f1a1f1f0b?w=400&h=400&fit=crop' },
  { id: 'r_vip_15', name: '社群门票(20000元)', description: '加入至尊社群', cost: 20000, type: 'rights', owned: false, icon: <Users size={24} className="text-red-500"/>, category: '会员充值', image: 'https://images.unsplash.com/photo-1512485694474-9b0f1a1f1f0b?w=400&h=400&fit=crop' },

];



// 简化ATTR_COLORS，去除彩色阴影效果，只保留文字颜色，与签到系统效果一致
const ATTR_COLORS: Record<string, string> = {
    STR: 'text-red-500',
    INT: 'text-blue-500',
    DIS: 'text-zinc-400',
    CRE: 'text-purple-500',
    SOC: 'text-pink-500',
    WEA: 'text-yellow-500',
};

// 盲盒售价档位
const BLIND_BOX_PRICES = [5, 10, 20, 30, 50, 100, 200, 1000, 2000, 3000, 5000];

// 盲盒规则说明
const BLIND_BOX_RULES = `
1. 盲盒售价档位：${BLIND_BOX_PRICES.join(', ')}
2. 商品匹配规则：仅从商品库中抽取价格在 [盲盒售价×0.5, 盲盒售价×1.5] 区间内的商品
3. 隐藏款机制：所有档位盲盒统一设置5%概率，触发后可抽取价格=盲盒售价×2的商品
4. 每个盲盒档位独立匹配，不跨区间抽取
`;

const LifeGame: React.FC<LifeGameProps> = ({ 
    theme, balance, onUpdateBalance, habits, projects, habitOrder, projectOrder, onToggleHabit, onUpdateHabit, onDeleteHabit, onUpdateProject, onDeleteProject, onAddHabit, onAddProject, initialTab, initialCategory, onAddFloatingReward, totalTasksCompleted, totalHours,
    challengePool, setChallengePool, todaysChallenges, completedRandomTasks, onToggleRandomChallenge, onStartAutoTask, checkInStreak, onPomodoroComplete, xp, weeklyGoal, setWeeklyGoal, todayGoal, setTodayGoal,
    givenUpTasks = [], onGiveUpTask, onUpdateHabitOrder, onUpdateProjectOrder, isNavCollapsed, setIsNavCollapsed, todayStats, statsHistory,
    // Pomodoro Global State
    timeLeft, isActive, duration, onToggleTimer, onResetTimer, onChangeDuration, onUpdateTimeLeft, onUpdateIsActive,
    // Immersive Mode State
    isImmersive, setIsImmersive, onInternalImmersiveModeChange,
    // Settings
    settings = {},
    // 命运骰子相关
    diceState,
    onSpinDice,
    onDiceResult,
    onAddDiceTask,
    onDeleteDiceTask,
    onUpdateDiceTask,
    onUpdateDiceConfig,
    onUpdateDiceState,
    onLevelChange
}) => {
  const isDark = theme === 'dark' || theme === 'neomorphic-dark';
  const isNeomorphic = theme.startsWith('neomorphic');
  const isNeomorphicDark = theme === 'neomorphic-dark';
  const todayStr = new Date().toLocaleDateString();
  const textMain = isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';
  const textSub = isDark ? 'text-zinc-400' : isNeomorphic ? 'text-zinc-600' : 'text-slate-500';
  
  // 拟态风格样式变量
  const neomorphicStyles = {
    bg: isNeomorphicDark ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]',
    border: isNeomorphicDark ? 'border-[#1e1e2e]' : 'border-[#e0e5ec]',
    shadow: isNeomorphicDark 
      ? 'shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]' 
      : 'shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]',
    hoverShadow: isNeomorphicDark 
      ? 'hover:shadow-[10px_10px_20px_rgba(0,0,0,0.5),-10px_-10px_20px_rgba(30,30,46,1)]' 
      : 'hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]',
    activeShadow: isNeomorphicDark 
      ? 'active:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.4),inset_-5px_-5px_10px_rgba(30,30,46,0.8)]' 
      : 'active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]',
    transition: 'transition-all duration-200'
  };
  
  // 生成按钮样式的辅助函数
  const getButtonStyle = (isActive: boolean, isSpecial?: boolean) => {
    if (isActive) {
      return isSpecial ? 'bg-red-500 text-white border-red-500' : 'bg-blue-500 text-white border-blue-500';
    }
    if (isNeomorphic) {
      // 根据拟态主题的深浅模式调整背景色和阴影
      const bgColor = theme === 'neomorphic-dark' ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]';
      const borderColor = theme === 'neomorphic-dark' ? 'border-[#1e1e2e]' : 'border-[#e0e5ec]';
      const shadowColor = theme === 'neomorphic-dark' 
        ? 'shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]'
        : 'shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]';
      const hoverShadowColor = theme === 'neomorphic-dark' 
        ? 'hover:shadow-[10px_10px_20px_rgba(0,0,0,0.5),-10px_-10px_20px_rgba(30,30,46,1)]'
        : 'hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]';
      const activeShadowColor = theme === 'neomorphic-dark' 
        ? 'active:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.4),inset_-5px_-5px_10px_rgba(30,30,46,0.8)]'
        : 'active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]';
      
      return `${bgColor} ${borderColor} ${shadowColor} ${hoverShadowColor} ${activeShadowColor} ${neomorphicStyles.transition}`;
    }
    return isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-200';
  };
  
  // 拟态风格卡片背景 - 符合设计规格的高饱和度灰蓝色底色，135度光源，大圆角
  const cardBg = isNeomorphic 
      ? (theme === 'neomorphic-dark' 
        ? `bg-[#1e1e2e] border-[#1e1e2e] rounded-[48px] shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)] transition-all duration-200` 
        : `${neomorphicStyles.bg} ${neomorphicStyles.border} rounded-[48px] ${neomorphicStyles.shadow} ${neomorphicStyles.hoverShadow} ${neomorphicStyles.activeShadow} ${neomorphicStyles.transition}`) 
      : isDark 
      ? 'bg-zinc-900 border-zinc-800 shadow-[inset_-15px_-15px_30px_rgba(255,255,255,0.05),inset_15px_15px_30px_rgba(0,0,0,0.3)]' 
      : 'bg-white border-slate-200 shadow-[inset_-15px_-15px_30px_rgba(255,255,255,0.8),inset_15px_15px_30px_rgba(0,0,0,0.1)]';
  
  const [level, setLevel] = useState(1);
  const [savings, setSavings] = useState(0); 
  const [inventory, setInventory] = useState<any[]>(SHOP_CATALOG);
  const [isManageShopMode, setIsManageShopMode] = useState(false);
  
  const characterProfileRef = useRef<CharacterProfileHandle>(null);

  const [mainTab, setMainTab] = useState<'battle' | 'shop' | 'armory'>(initialTab || 'battle');
  const [taskCategory, setTaskCategory] = useState<'daily' | 'main' | 'random'>(initialCategory || 'random');
  const [shopFilter, setShopFilter] = useState<'all' | 'physical' | 'rights' | 'leisure' | 'owned' | 'blindbox'>('all');
  const [showBlindBoxHelp, setShowBlindBoxHelp] = useState(false);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('15');
  const [newTaskXP, setNewTaskXP] = useState('20');
  const [newTaskDuration, setNewTaskDuration] = useState('30');
  const [newTaskAttr, setNewTaskAttr] = useState<AttributeTypeValue>(AttributeType.WEALTH);
  const [newTaskType, setNewTaskType] = useState<'daily' | 'main' | 'random'>('daily');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingProjectSubTasks, setEditingProjectSubTasks] = useState<SubTask[]>([]);

  const [isManageTasksOpen, setIsManageTasksOpen] = useState(false);
  const [manageTaskTab, setManageTaskTab] = useState<'daily' | 'main' | 'random'>('daily');
  const [newChallengeText, setNewChallengeText] = useState('');
  // 命运骰子任务分类状态
  const [activeDiceCategory, setActiveDiceCategory] = useState<string>('all');
  
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [draggedShopIndex, setDraggedShopIndex] = useState<number | null>(null);

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  // 战略储备双击编辑状态
  const [isEditingSavings, setIsEditingSavings] = useState(false);
  const [tempSavings, setTempSavings] = useState(balance);
  
  // 用于触发签到组件重新渲染的状态
  const [checkInUpdated, setCheckInUpdated] = useState(0);
  
  // 更新tempSavings以反映最新的balance值
  useEffect(() => {
    if (!isEditingSavings) {
      setTempSavings(balance);
    }
  }, [balance, isEditingSavings]);
  const [isEditingTodayGoal, setIsEditingTodayGoal] = useState(false);

  // 监听initialTab变化，更新mainTab状态，解决从作战中心切换到补给黑市时界面不切换的问题
  useEffect(() => {
    // 无论initialTab是否有值，都强制更新mainTab，确保视图切换正确
    setMainTab(initialTab || 'battle');
  }, [initialTab]);

  const [activeHelp, setActiveHelp] = useState<string | null>(null);

  // New State for Purchase Animation
  const [justPurchasedItem, setJustPurchasedItem] = useState<any | null>(null);

  const [showProtocol, setShowProtocol] = useState(false);
  const [protocolStep, setProtocolStep] = useState(0);
  const [readiness, setReadiness] = useState(80);
  const [protocolFocus, setProtocolFocus] = useState('');
  
  // Bank Modal State
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankAccount, setBankAccount] = useState({
    balance: 0,
    totalInterestEarned: 0,
    lastInterestDate: new Date().toLocaleDateString()
  });

  // Global Audio Management - Move audio management to LifeGame to ensure continuous playback across navigation
  const [isMuted, setIsMuted] = useState(false);
  const [currentSoundId, setCurrentSoundId] = useState('forest');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio URLs mapping
  const SOUNDS = [
    { id: 'forest', name: '迷雾森林', url: "https://assets.mixkit.co/active_storage/sfx/2441/2441-preview.mp3" }, // 使用海浪声替代失效的森林声
    { id: 'alpha', name: '阿尔法波', url: "https://assets.mixkit.co/active_storage/sfx/243/243-preview.mp3" },
    { id: 'theta', name: '希塔波', url: "https://assets.mixkit.co/active_storage/sfx/244/244-preview.mp3" }, 
    { id: 'beta', name: '贝塔波', url: "https://assets.mixkit.co/active_storage/sfx/1126/1126-preview.mp3" },
    { id: 'ocean', name: '海浪声', url: "https://assets.mixkit.co/active_storage/sfx/2441/2441-preview.mp3" },
    { id: 'rain', name: '雨声', url: "https://assets.mixkit.co/active_storage/sfx/2442/2442-preview.mp3" },
    { id: 'night', name: '夏夜虫鸣', url: "https://assets.mixkit.co/active_storage/sfx/2443/2443-preview.mp3" },
    { id: 'white-noise', name: '白噪音', url: "https://assets.mixkit.co/active_storage/sfx/2444/2444-preview.mp3" },
    { id: 'pink-noise', name: '粉红噪音', url: "https://assets.mixkit.co/active_storage/sfx/2445/2445-preview.mp3" },
    { id: 'brown-noise', name: '布朗噪音', url: "https://assets.mixkit.co/active_storage/sfx/2446/2446-preview.mp3" },
    { id: 'cafe', name: '咖啡馆环境', url: "https://assets.mixkit.co/active_storage/sfx/2447/2447-preview.mp3" },
    { id: 'fireplace', name: '壁炉声', url: "https://assets.mixkit.co/active_storage/sfx/2448/2448-preview.mp3" },
  ];

  // Manage audio playback globally
  useEffect(() => {
    // Create new Audio object if it doesn't exist or sound changed
    if (!audioRef.current) {
      const newAudio = new Audio(SOUNDS.find(s => s.id === currentSoundId)?.url || SOUNDS[0].url);
      newAudio.loop = true;
      newAudio.volume = 0.3;
      newAudio.muted = isMuted;
      audioRef.current = newAudio;
    } else {
      // Update existing audio if sound changed
      const currentSound = SOUNDS.find(s => s.id === currentSoundId)?.url || SOUNDS[0].url;
      if (audioRef.current.src !== currentSound) {
        audioRef.current.src = currentSound;
        audioRef.current.load();
      }
      audioRef.current.muted = isMuted;
    }

    return () => {
      // Do NOT stop audio on cleanup - let it continue playing across navigation
    };
  }, [currentSoundId, isMuted]);

  const handleProtocolComplete = () => {
      onUpdateBalance(50, `晨间协议完成 (Ready: ${readiness}%)`);
      setTodayGoal(protocolFocus); 
      setShowProtocol(false);
      setProtocolStep(0);
      setProtocolFocus('');
      onAddFloatingReward("今日战役目标已锁定", "text-red-500");
  };

  // 拖拽状态管理
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null);
  
  // Help content for different sections with update time


  // 拖拽开始
  const handleDragStart = (task: any, index: number) => {
      setDraggedTask(task);
      setDraggedTaskIndex(index);
  };

  // 拖拽结束
  const handleDragEnd = () => {
      setDraggedTask(null);
      setDraggedTaskIndex(null);
  };

  // 拖拽悬停
  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      if (draggedTaskIndex === null || draggedTaskIndex === targetIndex || !draggedTask) return;
      
      if (draggedTask.type === TaskType.DAILY && onUpdateHabitOrder) {
          // 更新习惯任务排序
          const newOrder = [...habitOrder];
          const [draggedId] = newOrder.splice(draggedTaskIndex, 1);
          newOrder.splice(targetIndex, 0, draggedId);
          onUpdateHabitOrder(newOrder);
          setDraggedTaskIndex(targetIndex);
      } else if (draggedTask.type === TaskType.MAIN && onUpdateProjectOrder) {
          // 更新主线任务排序
          const newOrder = [...projectOrder];
          const [draggedId] = newOrder.splice(draggedTaskIndex, 1);
          newOrder.splice(targetIndex, 0, draggedId);
          onUpdateProjectOrder(newOrder);
          setDraggedTaskIndex(targetIndex);
      }
  };

  // 按照habitOrder排序习惯任务
  const sortedHabits = habitOrder.map(id => habits.find(h => h.id === id)).filter(h => h !== undefined) as Habit[];
  const habitTasks = sortedHabits.map(h => ({
      id: h.id, text: h.name, attr: h.attr || 'DIS', xp: h.xp || Math.ceil(h.reward * 1.5), gold: h.reward, duration: h.duration || 0,
      type: TaskType.DAILY, completed: !!h.history[todayStr], frequency: 'daily' as const, originalData: h,
      isGivenUp: givenUpTasks.includes(h.id)
  })).sort((a, b) => {
      if (a.isGivenUp && !b.isGivenUp) return 1;
      if (!a.isGivenUp && b.isGivenUp) return -1;
      return Number(a.completed) - Number(b.completed);
  });

  // 按照projectOrder排序项目任务
  const sortedProjects = projectOrder.map(id => projects.find(p => p.id === id)).filter(p => p !== undefined) as Project[];
  const projectTasks = sortedProjects.map(p => {
      // 主线任务奖励机制：与日常任务保持一致
      const baseRewardGold = 60; // 基础金币奖励
      const baseRewardXP = Math.ceil(baseRewardGold * 1.5); // 经验奖励与日常任务相同：金币*1.5
      const totalDuration = p.subTasks.reduce((sum, st) => sum + st.duration, 60);
      
      // 计算每个子任务的平均奖励
      const subTaskCount = Math.max(p.subTasks.length, 1);
      const avgXP = Math.ceil(baseRewardXP / subTaskCount);
      const avgGold = Math.ceil(baseRewardGold / subTaskCount);
      
      return {
          id: p.id, text: p.name, attr: p.attr || 'WEA', xp: baseRewardXP, gold: baseRewardGold, type: TaskType.MAIN,
          completed: p.status === 'completed', frequency: 'once' as const, isExpanded: true,
          originalData: p,
          subTasks: p.subTasks.map(st => ({
              id: st.id, text: st.title, completed: st.completed, 
              xp: avgXP, // 均分主线任务的经验奖励
              gold: avgGold, // 均分主线任务的金币奖励
              duration: st.duration || 30 // 子任务自己的时长，默认30分钟
          }))
      };
  }).sort((a, b) => Number(a.completed) - Number(b.completed));

  // 检查并修复商品图片
  useEffect(() => {
    const checkAndFixImages = async () => {
      const { checkAndFixProductImages } = await import('../utils/imageChecker');
      
      const saved = localStorage.getItem('life-game-stats-v2'); 
      let initialInv = SHOP_CATALOG;
      
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setLevel(data.level || 1);
          setSavings(data.savings || 0);
          
          const savedInv = data.inventory || [];
          const savedMap = new Map<string, any>(savedInv.map((i: any) => [i.id, i]));
          
          initialInv = SHOP_CATALOG.map(catItem => {
              const savedItem = savedMap.get(catItem.id);
              if (savedItem) {
                  return { 
                      ...catItem, 
                      owned: savedItem.owned, 
                      purchaseCount: savedItem.purchaseCount || 0,
                      lastPurchased: savedItem.lastPurchased || 0,
                      image: savedItem.image || catItem.image || ''
                  };
              }
              return catItem;
          });
          const catalogIds = new Set(SHOP_CATALOG.map(i => i.id));
          const customItems = savedInv.filter((i: any) => !catalogIds.has(i.id));
          initialInv = [...initialInv, ...customItems];
        } catch (e) { /* 静默处理保存文件损坏的情况 */ }
      }
      
      // 检查并修复图片
      const fixedInventory = await checkAndFixProductImages(initialInv);
      setInventory(fixedInventory);
    };
    
    checkAndFixImages();
  }, []);

  useEffect(() => {
    localStorage.setItem('life-game-stats-v2', JSON.stringify({ level, xp, inventory, savings }));
  }, [level, xp, inventory, savings]);

  // 盲盒购买处理函数
  const handleBlindBoxPurchase = (price: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (isManageShopMode) return;

      if (balance < price) {
          onAddFloatingReward("资金不足", "text-red-500", e.clientX, e.clientY);
          return;
      }
      
      // 播放购买音效
      const purchaseSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3");
      purchaseSound.volume = 0.5;
      purchaseSound.play().catch(()=>{});
      
      // 触发烟花效果
      confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
      });
      
      // 计算价格区间
      const minPrice = price * 0.5;
      const maxPrice = price * 1.5;
      const hiddenPrice = price * 2;
      
      // 检查是否触发隐藏款（5%概率）
      const isHidden = Math.random() < 0.05;
      
      // 筛选符合条件的商品
      const eligibleItems = inventory.filter(item => {
          if (isHidden) {
              return item.cost === hiddenPrice;
          } else {
              return item.cost >= minPrice && item.cost <= maxPrice;
          }
      });
      
      if (eligibleItems.length === 0) {
          onAddFloatingReward("当前档位暂无可用商品", "text-red-500", e.clientX, e.clientY);
          return;
      }
      
      // 随机选择一个商品
      const randomIndex = Math.floor(Math.random() * eligibleItems.length);
      const selectedItem = eligibleItems[randomIndex];
      
      // 更新余额
      onUpdateBalance(-price, `购买盲盒: ${price}金币`);
      
      // 更新商品库存
      setInventory(prev => prev.map(i => {
          if (i.id === selectedItem.id) {
              return { 
                  ...i, 
                  owned: true, // 所有类型商品购买后都标记为已拥有
                  purchaseCount: (i.purchaseCount || 0) + 1,
                  lastPurchased: Date.now(),
                  image: i.image || ''
              };
          }
          return i;
      }));

      // 显示购买动画
      setJustPurchasedItem(selectedItem);
      setTimeout(() => setJustPurchasedItem(null), 2000);
      
      // 显示获得的商品信息
      onAddFloatingReward(`获得${isHidden ? '隐藏款' : ''}: ${selectedItem.name}`, "text-yellow-500", e.clientX, e.clientY);
  };

  const handlePurchase = (item: any, e: React.MouseEvent) => {
      e.stopPropagation();
      if (isManageShopMode) return; 

      if (balance < item.cost) {
          onAddFloatingReward("资金不足", "text-red-500", e.clientX, e.clientY);
          return;
      }
      
      onUpdateBalance(-item.cost, `购买: ${item.name}`);
      
      // 播放购买音效
      const purchaseSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3");
      purchaseSound.volume = 0.5;
      purchaseSound.play().catch(()=>{});
      
      // 触发烟花效果
      confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
      });
      
      setInventory(prev => prev.map(i => {
          if (i.id === item.id) {
              return { 
                  ...i, 
                  owned: true, // 所有类型商品购买后都标记为已拥有
                  purchaseCount: (i.purchaseCount || 0) + 1,
                  lastPurchased: Date.now(),
                  image: i.image || ''
              };
          }
          return i;
      }));

      // Trigger Visual - Changed from 3D rotation to simple scale animation
      setJustPurchasedItem(item);
      setTimeout(() => setJustPurchasedItem(null), 2000);
  };

  const handleStartTimer = (duration: number) => {
      if (characterProfileRef.current) {
          characterProfileRef.current.startTimer(duration);
          onAddFloatingReward(`番茄钟: ${duration}min`, "text-emerald-500");
      } else {
          // 静默处理定时器引用未附加的情况
      }
  };

  const completeTask = (task: any, e: React.MouseEvent | null) => {
      if (task.isGivenUp) return; 
      if (task.type === TaskType.DAILY) {
          // 播放完成音效
          const completeSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3");
          completeSound.volume = 0.5;
          completeSound.play().catch(()=>{});
          
          // 触发烟花效果
          if (e) {
              confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
                  colors: ['#fbbf24', '#f59e0b', '#d97706', '#3b82f6', '#10b981', '#8b5cf6'],
                  animationDuration: 800
              });
          }
          
          onToggleHabit(task.id, todayStr);
          // 所有弹窗由 App.tsx 中的 handleToggleHabit 函数统一处理，避免重复
      }
  };

  const giveUpTask = (taskId: string, e: React.MouseEvent) => {
      e.stopPropagation(); 
      if (onGiveUpTask) {
          onGiveUpTask(taskId);
          
          // 触发命运骰子机制
          setTimeout(() => {
              if (onSpinDice) {
                  const result = onSpinDice();
                  if (!result.success && result.message) {
                      onAddFloatingReward(result.message, 'text-red-500');
                  }
              }
          }, 300);
      }
  };

  const toggleSubTask = (projectId: string, subTaskId: string) => {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      const subTask = project.subTasks.find(t => t.id === subTaskId);
      if (!subTask) return;

      const newStatus = !subTask.completed;
      const newSubTasks = project.subTasks.map(t => t.id === subTaskId ? { ...t, completed: newStatus } : t);
      
      onUpdateProject(projectId, { subTasks: newSubTasks });
      
      if (newStatus) {
          // 播放完成音效
          const completeSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3");
          completeSound.volume = 0.5;
          completeSound.play().catch(()=>{});
          
          // 触发小型烟花效果
          confetti({
              particleCount: 50,
              spread: 50,
              origin: { x: 0.5, y: 0.5 },
              colors: ['#fbbf24', '#f59e0b', '#d97706', '#3b82f6', '#10b981', '#8b5cf6'],
              animationDuration: 600
          });
      }
  };

  const giveUpSubTask = (projectId: string, subTaskId: string) => {
      // 直接放弃子任务，不删除，标记为已完成但不计入奖励
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      const subTask = project.subTasks.find(t => t.id === subTaskId);
      if (!subTask) return;
      
      const newSubTasks = project.subTasks.map(t => t.id === subTaskId ? { ...t, completed: true, isGivenUp: true } : t);
      onUpdateProject(projectId, { subTasks: newSubTasks });
      
      // 播放放弃音效
      const giveUpSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-interface-error-beep-221.mp3");
      giveUpSound.volume = 0.5;
      giveUpSound.play().catch(()=>{});
      
      // 触发命运骰子机制
      setTimeout(() => {
          if (onSpinDice) {
              const result = onSpinDice();
              if (!result.success && result.message) {
                  onAddFloatingReward(result.message, 'text-red-500');
              }
          }
      }, 300);
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm("确定要下架此商品吗？")) {
          setInventory(prev => prev.filter(i => i.id !== id));
      }
  };

  const handleEditItemSave = () => {
      if (editingItem) {
          if (inventory.find(i => i.id === editingItem.id)) {
              setInventory(prev => prev.map(i => {
                  if (i.id === editingItem.id) {
                      return { ...editingItem, image: editingItem.image || '' };
                  }
                  return i;
              }));
          } else {
              setInventory(prev => [...prev, { ...editingItem, image: editingItem.image || '' }]);
          }
      }
      setIsEditItemOpen(false);
      setEditingItem(null);
  };

  const handleAddNewItem = () => {
      setEditingItem({
          id: Date.now().toString(),
          name: '',
          description: '',
          cost: 50,
          type: 'leisure',
          icon: <Box size={24}/>,
          image: '',
          purchaseCount: 0,
          lastPurchased: 0
      });
      setIsEditItemOpen(true);
  };

  const handleShopDragStart = (index: number) => {
      if (!isManageShopMode) return;
      setDraggedShopIndex(index);
  };

  const handleShopDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (!isManageShopMode || draggedShopIndex === null || draggedShopIndex === index) return;

      const newInventory = [...inventory];
      const draggedItem = newInventory[draggedShopIndex];
      newInventory.splice(draggedShopIndex, 1);
      newInventory.splice(index, 0, draggedItem);
      
      setInventory(newInventory);
      setDraggedShopIndex(index);
  };

  const openEditTask = (task: any) => {
      setEditingTaskId(task.id);
      setNewTaskTitle(task.text);
      setNewTaskReward(task.gold.toString());
      setNewTaskXP((task.xp || 20).toString());
      setNewTaskDuration((task.duration || 30).toString());
      setNewTaskType(task.type);
      if (task.type === TaskType.MAIN) {
          const p = projects.find(proj => proj.id === task.id);
          if(p) setEditingProjectSubTasks([...p.subTasks]);
      } else {
          setEditingProjectSubTasks([]);
      }
      setIsAddTaskOpen(true);
  };

  const openEditRandomTask = (taskStr: string) => {
      try {
          // 解析随机任务
          const parsedTask = JSON.parse(taskStr);
          setEditingTaskId(`random-${taskStr}`);
          setNewTaskTitle(parsedTask.text);
          setNewTaskReward((parsedTask.gold || 20).toString());
          setNewTaskXP((parsedTask.xp || 30).toString());
          setNewTaskDuration((parsedTask.duration || 20).toString());
          setNewTaskAttr(parsedTask.attr || AttributeType.WEALTH);
          setNewTaskType('random');
          setEditingProjectSubTasks([]);
          setIsAddTaskOpen(true);
      } catch (e) {
          // 旧格式的随机任务
          setEditingTaskId(`random-${taskStr}`);
          setNewTaskTitle(taskStr);
          setNewTaskReward('20');
          setNewTaskXP('30');
          setNewTaskDuration('20');
          setNewTaskAttr(AttributeType.WEALTH);
          setNewTaskType('random');
          setEditingProjectSubTasks([]);
          setIsAddTaskOpen(true);
      }
  };

  const handleSaveEditTask = () => {
      if (newTaskType === 'daily') {
          onUpdateHabit(editingTaskId!, { 
              name: newTaskTitle, 
              reward: parseInt(newTaskReward),
              xp: parseInt(newTaskXP),
              duration: parseInt(newTaskDuration)
          });
      } else if (newTaskType === 'main') {
          onUpdateProject(editingTaskId!, { name: newTaskTitle, subTasks: editingProjectSubTasks });
      } else if (newTaskType === 'random' && editingTaskId?.startsWith('random-')) {
          // 处理随机任务编辑
          const originalTaskStr = editingTaskId.replace('random-', '');
          const newTask = {
              text: newTaskTitle,
              gold: parseInt(newTaskReward) || 20,
              xp: parseInt(newTaskXP) || 30,
              duration: parseInt(newTaskDuration) || 20,
              attr: newTaskAttr
          };
          
          // 更新挑战池
          setChallengePool(prevPool => {
              return prevPool.map(task => {
                  if (task === originalTaskStr) {
                      return JSON.stringify(newTask);
                  }
                  return task;
              });
          });
      }
      setIsAddTaskOpen(false);
      setEditingTaskId(null);
  };

  const handleAddNewTask = () => {
      if (!newTaskTitle.trim()) return;
      if (newTaskType === 'daily') {
          onAddHabit(newTaskTitle, parseInt(newTaskReward) || 15, newTaskAttr);
      } else if (newTaskType === 'main') {
          onAddProject({
              id: Date.now().toString(), name: newTaskTitle, startDate: new Date().toISOString().split('T')[0],
              description: '核心战略目标', status: 'active', logs: [], dailyFocus: {}, subTasks: editingProjectSubTasks, fears: [], todayFocusMinutes: 0, attr: newTaskAttr
          });
      } else if (newTaskType === 'random') {
          // 添加完整的随机任务，包含奖励信息
          const newTask = {
              text: newTaskTitle,
              gold: parseInt(newTaskReward) || 20,
              xp: parseInt(newTaskXP) || 30,
              duration: parseInt(newTaskDuration) || 20
          };
          setChallengePool([...challengePool, JSON.stringify(newTask)]);
          onAddFloatingReward("挑战已入库", "text-purple-500");
      }
      setIsAddTaskOpen(false);
      setNewTaskTitle('');
      setNewTaskReward('15');
      setNewTaskXP('20');
      setNewTaskDuration('30');
      setNewTaskAttr(AttributeType.WEALTH);
      setEditingProjectSubTasks([]);
  };

  const filteredInventory = inventory.filter(i => {
    if (shopFilter === 'owned') {
      return i.owned === true;
    }
    if (shopFilter === 'all') {
      return true;
    }
    // 基于商品分类筛选
    return i.category === shopFilter;
  });
  const sortedInventory = [...filteredInventory].sort((a, b) => {
      const timeA = a.lastPurchased || 0;
      const timeB = b.lastPurchased || 0;
      if (timeA !== timeB) return timeB - timeA;
      return a.cost - b.cost;
  });

  return (
        <div className={`h-full flex flex-col overflow-hidden relative`}>
            
            {/* Global Guide Card - 使用统一的帮助系统组件 */}
            <GlobalGuideCard
              activeHelp={activeHelp}
              helpContent={helpContent}
              onClose={() => setActiveHelp(null)}
              cardBg={cardBg}
              textMain={textMain}
              textSub={textSub}
              config={(settings as SettingsType)?.guideCardConfig || {
                fontSize: 'medium',
                borderRadius: 'medium',
                shadowIntensity: 'medium',
                showUnderlyingPrinciple: true
              }}
            />
            
            {/* 全局命运骰子结果弹窗 - 确保在所有任务分类下都能显示 */}
            {diceState?.currentResult && (
                <FateGiftModal
                    task={diceState.currentResult as any}
                    isSpinning={diceState.isSpinning}
                    onComplete={() => onDiceResult && onDiceResult('completed')}
                    onLater={() => onDiceResult && onDiceResult('later')}
                    onSkip={() => onDiceResult && onDiceResult('skipped')}
                    onStartTimer={(duration) => {
                        onChangeDuration(duration);
                        onToggleTimer();
                        // 进入沉浸式模式
                        setIsImmersive(true);
                    }}
                    theme={theme}
                />
            )}

        {/* PURCHASE ANIMATION - Improved with centered popup */}
        {justPurchasedItem && (
            <>
                {/* Center Flash Effect */}
                <div className="fixed inset-0 z-[1001] flex items-center justify-center animate-in fade-in-zoom duration-500">
                    <div className="text-8xl animate-[spin_0.5s_ease-in-out_infinite] drop-shadow-[0_0_30px_rgba(234,179,8,0.8)] opacity-100">
                        {justPurchasedItem.icon}
                    </div>
                </div>
                {/* Centered Popup with neomorphic effect */}
                <div className="fixed inset-0 z-[1000] flex items-center justify-center animate-in fade-in duration-300">
                    <div className={`p-6 flex items-center gap-4 rounded-2xl backdrop-blur-lg shadow-2xl max-w-md w-full mx-4 transition-all duration-300 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-[#1e1e2e] shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] border-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)]') : isDark ? 'bg-zinc-900/95 border border-yellow-500/30 shadow-yellow-500/10' : 'bg-white/95 border border-slate-200 shadow-lg'}`}>
                        <div className={`text-4xl animate-[spin_1s_ease-in-out_infinite] ${isNeomorphic ? 'drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]'}`}>
                            {justPurchasedItem.icon}
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800'}`}>购买成功</h3>
                            <div className={`font-bold ${isDark ? 'text-yellow-400' : isNeomorphic ? 'text-yellow-600' : 'text-yellow-500'}`}>获得 {justPurchasedItem.name}</div>
                            <div className={`font-mono text-sm ${isDark ? 'text-red-500' : isNeomorphic ? 'text-red-600' : 'text-red-500'}`}>金币 - {justPurchasedItem.cost}G</div>
                            <div className={`font-mono text-sm ${isDark ? 'text-green-500' : isNeomorphic ? 'text-green-600' : 'text-green-500'}`}>当前剩余 {balance}G</div>
                        </div>
                    </div>
                </div>
            </>
        )}

        {/* Morning Protocol Modal code... */}
        {showProtocol && (
            <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                {/* ... existing protocol modal content ... */}
                <div className="max-w-lg w-full bg-zinc-900 border border-emerald-900/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
                    {protocolStep === 0 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8">
                            <div className="flex items-center gap-3 mb-4"><Zap size={32} className="text-emerald-500"/><h2 className="text-2xl font-black text-white">机能自检 (BIO-SCAN)</h2></div>
                            <p className="text-zinc-400 text-sm">评估你的睡眠质量与当前能量水平。诚实的数据是进化的基础。</p>
                            <div className="space-y-4 pt-4"><div className="flex justify-between text-xs font-bold text-emerald-400 uppercase"><span>低能耗 (Low)</span><span>{readiness}%</span><span>巅峰 (Peak)</span></div><input type="range" min="0" max="100" value={readiness} onChange={(e) => setReadiness(parseInt(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"/></div>
                            <button onClick={() => setProtocolStep(1)} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl mt-4 flex items-center justify-center gap-2 transition-all">确认机能状态 <ChevronRight size={16}/></button>
                        </div>
                    )}
                    {protocolStep === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8">
                            <div className="flex items-center gap-3 mb-4"><Crosshair size={32} className="text-red-500"/><h2 className="text-2xl font-black text-white">战术聚焦 (LASER FOCUS)</h2></div>
                            <p className="text-zinc-400 text-sm">如果今天只能完成一件事，那会是什么？这定义了你今天的成败。</p>
                            <input autoFocus value={protocolFocus} onChange={e => setProtocolFocus(e.target.value)} placeholder="输入今日绝对核心任务..." className="w-full bg-zinc-950 border border-zinc-700 p-4 rounded-xl text-lg font-bold text-white outline-none focus:border-red-500 transition-colors" onKeyDown={e => e.key === 'Enter' && setProtocolStep(2)}/>
                            <button onClick={() => setProtocolStep(2)} disabled={!protocolFocus.trim()} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-bold rounded-xl mt-4 flex items-center justify-center gap-2 transition-all">锁定目标 <ChevronRight size={16}/></button>
                        </div>
                    )}
                    {protocolStep === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 text-center">
                            <div className="flex flex-col items-center gap-4 mb-4"><Activity size={64} className="text-blue-500 animate-pulse"/><h2 className="text-2xl font-black text-white uppercase tracking-widest">身份确认</h2></div>
                            <div className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-800 italic text-zinc-300">"我不仅仅是这副躯壳。我是我的选择，我是我的行动。今天，我拒绝熵增，我选择主动进化。"</div>
                            <button onClick={handleProtocolComplete} className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-lg rounded-xl shadow-lg shadow-blue-900/50 transform transition-all active:scale-95">启动系统 (INITIATE)</button>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* 虚拟银行模态框 */}
        {showBankModal && (
            <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="max-w-lg w-full bg-zinc-900 border border-green-900/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-yellow-500"></div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            <Wallet className="text-green-500" size={32} />
                            虚拟银行账户
                        </h2>
                        <button onClick={() => setShowBankModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                            <XCircle size={24} />
                        </button>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className={`p-6 rounded-xl border ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-[#1e1e2e] shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] border-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]') : (isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200')}`}>
                                    <div className={`text-sm uppercase font-bold mb-2 ${textSub}`}>当前存款</div>
                                    <div className="text-4xl font-black text-yellow-500">{bankAccount.balance} G</div>
                                    <div className={`text-xs mt-1 ${textSub}`}>每天获得 1% 利息</div>
                                </div>
                                <div className={`p-6 rounded-xl border ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-[#1e1e2e] shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] border-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]') : (isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200')}`}>
                                    <div className={`text-sm uppercase font-bold mb-2 ${textSub}`}>总获利息</div>
                                    <div className="text-4xl font-black text-green-500">{bankAccount.totalInterestEarned} G</div>
                                    <div className={`text-xs mt-1 ${textSub}`}>累计获得的利息</div>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-zinc-500">上次利息发放日期</div>
                                <div className="text-sm font-mono text-zinc-300">{bankAccount.lastInterestDate}</div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-zinc-500">今日预计利息</div>
                                <div className="text-sm font-mono text-green-500">{Math.floor(bankAccount.balance * 0.01)} G</div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => {
                                    if (bankAccount.balance > 0) {
                                        // 取出全部存款
                                        onUpdateBalance(bankAccount.balance, '取出全部存款');
                                        const newBankAccount = {
                                            ...bankAccount,
                                            balance: 0
                                        };
                                        setBankAccount(newBankAccount);
                                        localStorage.setItem('life-game-bank', JSON.stringify(newBankAccount));
                                        setShowBankModal(false);
                                    }
                                }}
                                className={`w-full py-4 rounded-lg transition-colors ${isNeomorphic ? 
                                    (bankAccount.balance > 0 ? 
                                        theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] text-green-400 shadow-[inset_5px_5px_10px_rgba(0,0,0,0.4),inset_-5px_-5px_10px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] text-green-700 shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]'
                                    : 
                                        isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-200 text-slate-500'
                                    ) : 
                                    (bankAccount.balance <= 0 ? 
                                        isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-200 text-slate-500'
                                    : 
                                        isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-800/50' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    )
                                }`} 
                                disabled={bankAccount.balance <= 0}
                            >
                                取出全部存款
                            </button>
                            <button 
                                onClick={() => setShowBankModal(false)}
                                className={`w-full py-4 rounded-lg transition-colors ${isNeomorphic ? 
                                    theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] text-zinc-200 shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] text-zinc-700 shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'
                                : 
                                    isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                关闭
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-6 relative custom-scrollbar">
            {mainTab === 'battle' && (
              <CharacterProfile ref={characterProfileRef} theme={theme} xp={xp} balance={balance} totalHours={totalHours} totalKills={totalTasksCompleted} checkInStreak={checkInStreak} onPomodoroComplete={onPomodoroComplete} onUpdateBalance={onUpdateBalance} onLevelChange={onLevelChange} 
                // Pomodoro Global State
                timeLeft={timeLeft}
                isActive={isActive}
                duration={duration}
                onToggleTimer={onToggleTimer}
                onResetTimer={onResetTimer}
                onChangeDuration={onChangeDuration}
                onUpdateTimeLeft={onUpdateTimeLeft}
                onUpdateIsActive={onUpdateIsActive}
                // Audio Management
                isMuted={isMuted}
                currentSoundId={currentSoundId}
                onToggleMute={setIsMuted}
                onSoundChange={setCurrentSoundId}
                // Immersive Mode Callback
                onImmersiveModeChange={(newIsImmersive) => {
                    if (newIsImmersive) {
                        setIsNavCollapsed(true);
                    }
                    setIsImmersive(newIsImmersive);
                }}
                // Internal Immersive Mode Callback
                onInternalImmersiveModeChange={onInternalImmersiveModeChange}
                // Help System
                onHelpClick={setActiveHelp}
                // Settings
                settings={settings}
              />
            )}
            {mainTab === 'battle' && (
                <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                    {/* 实时情报卡模块 - 从战略指挥部移动过来 */}
                    <div className={`${cardBg} border p-3 rounded-xl mb-4`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
                                <Clock size={12}/> 实时情报卡片
                            </div>
                        </div>
                        
                        {/* 1. 实时情报卡片 - 调整为更紧凑的两列布局，移动端单列 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* 专注时间趋势 - 缩小版 */}
                            <div className={`${cardBg} border p-1.5 rounded-lg flex flex-col justify-between transition-all duration-300 cursor-default hover:shadow-lg`}>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
                                        <Activity size={10}/> 专注时间统计
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                        7天
                                    </div>
                                </div>
                                
                                {/* 7天趋势图 - 缩小尺寸 */}
                                <div className="h-[70px] w-full mt-1">
                                    <ResponsiveContainer width="100%" height={70}>
                                        <LineChart
                                            data={useMemo(() => {
                                                const data = [];
                                                for (let i = 6; i >= 0; i--) {
                                                    const date = new Date();
                                                    date.setDate(date.getDate() - i);
                                                    const dayStr = date.toLocaleDateString('zh-CN', { day: 'numeric' });
                                                    
                                                    // 获取当天的专注时间
                                                    let focusMinutes = 0;
                                                    // 检查statsHistory中是否有该日期的数据
                                                    const dayKey = Object.keys(statsHistory).find(key => {
                                                        const statsDate = new Date();
                                                        statsDate.setDate(statsDate.getDate() - (7 - i));
                                                        return parseInt(key) === statsDate.getDate();
                                                    });
                                                    
                                                    if (dayKey) {
                                                        focusMinutes = statsHistory[parseInt(dayKey)].focusMinutes;
                                                    } else if (i === 0) {
                                                        // 今天的数据
                                                        focusMinutes = todayStats?.focusMinutes || 0;
                                                    }
                                                    
                                                    data.push({
                                                        date: dayStr,
                                                        focusMinutes
                                                    });
                                                }
                                                return data;
                                            }, [statsHistory, todayStats])}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} vertical={false} />
                                            <XAxis 
                                                dataKey="date" 
                                                stroke={isDark ? "#71717a" : "#71717a"} 
                                                fontSize={8} 
                                                tickLine={false} 
                                            />
                                            <YAxis 
                                                stroke={isDark ? "#71717a" : "#71717a"} 
                                                fontSize={8} 
                                                tickLine={false} 
                                                domain={[0, 'dataMax + 50']} 
                                                tickFormatter={(value) => `${value}min`}
                                                hide
                                            />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: isDark ? '#18181b' : '#fff', 
                                                    borderColor: isDark ? '#333' : '#e2e8f0', 
                                                    color: isDark ? '#fff' : '#000',
                                                    fontSize: '10px',
                                                    padding: '4px'
                                                }}
                                                formatter={(value) => [`${value} 分钟`, '专注时间']}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="focusMinutes" 
                                                stroke={isDark ? "#8b5cf6" : "#8b5cf6"} 
                                                strokeWidth={1.5} 
                                                dot={{ fill: isDark ? "#8b5cf6" : "#8b5cf6", r: 2 }} 
                                                activeDot={{ r: 3 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                
                                {/* 底部统计信息 - 今日专注时间和本周平均水平排列 */}
                                <div className="mt-1 flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-3">
                                        <span className="text-zinc-500">
                                            本周平均: {(() => {
                                                // 计算本周平均专注时间
                                                const total = Object.values(statsHistory).reduce((sum, stats: any) => sum + (stats.focusMinutes || 0), 0) + (todayStats?.focusMinutes || 0);
                                                const days = Math.min(Object.keys(statsHistory).length + 1, 7);
                                                return Math.round(total / days) || 0; 
                                            })()} min
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Clock size={8} className="text-zinc-500"/>
                                            <span className={`font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                今日: {todayStats?.focusMinutes || 0} min
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            
                            {/* 签到系统 - 缩小版，移到实时情报卡片中 */}
                            <div className={`${cardBg} border p-1.5 rounded-lg flex flex-col gap-1 transition-all duration-300 cursor-default hover:shadow-lg`}>
                                <div className="flex justify-between items-center mb-1">
                                    <div className="text-xs text-blue-500 uppercase tracking-widest font-bold flex items-center gap-1">
                                        <Calendar size={14}/> 签到系统
                                    </div>
                                    {settings && 'guideCardConfig' in settings && settings.guideCardConfig && (
                                        <HelpTooltip helpId="checkin" onHelpClick={setActiveHelp} className="p-0.5">
                                            <HelpCircle size={14} className="text-blue-500" />
                                        </HelpTooltip>
                                    )}
                                </div>
                                
                                {/* 签到按钮 - 圆形勋章样式，带跳动动画 */}
                                <div className="flex justify-center mb-1">
                                    <button 
                                        onClick={() => {
                                            // 获取签到数据
                                            const todayDate = new Date().toLocaleDateString();
                                            const checkInData = JSON.parse(localStorage.getItem('life-game-weekly-checkin') || '{}');
                                            
                                            // 检查是否已签到
                                            if (!checkInData[todayDate]) {
                                                // 更新签到数据
                                                checkInData[todayDate] = true;
                                                localStorage.setItem('life-game-weekly-checkin', JSON.stringify(checkInData));
                                                
                                                // 计算连续签到天数
                                                const now = new Date();
                                                const day = now.getDay();
                                                const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 调整到周一
                                                const monday = new Date(now.setDate(diff));
                                                const weekDates = [];
                                                for (let i = 0; i < 7; i++) {
                                                    const date = new Date(monday);
                                                    date.setDate(monday.getDate() + i);
                                                    weekDates.push(date.toLocaleDateString());
                                                }
                                                const consecutiveDays = weekDates.filter(date => checkInData[date]).length;
                                                const goldReward = 10 + (consecutiveDays * 5);
                                                const xpReward = 15 + (consecutiveDays * 3);
                                                
                                                // 触发奖励
                                                onUpdateBalance(goldReward, "签到奖励");
                                                
                                                // 添加签到成功提示
                                                onAddFloatingReward('签到成功！', 'text-green-500', window.innerWidth / 2);
                                                
                                                // 添加经验和金币奖励弹出效果
                                                setTimeout(() => {
                                                    onAddFloatingReward(`+${goldReward} 金币`, 'text-yellow-500', window.innerWidth / 2 - 80);
                                                }, 300);
                                                setTimeout(() => {
                                                    onAddFloatingReward(`+${xpReward} 经验`, 'text-blue-500', window.innerWidth / 2 + 80);
                                                }, 600);
                                                
                                                // 触发烟花特效
                                                confetti({
                                                    particleCount: 100,
                                                    spread: 70,
                                                    origin: { y: 0.6 },
                                                    colors: ['#fbbf24', '#f59e0b', '#d97706', '#3b82f6', '#10b981', '#8b5cf6']
                                                });
                                                
                                                // 关联勋章系统：更新签到 streak
                                                const streak = checkInStreak + 1;
                                                localStorage.setItem('aes-checkin-streak', streak.toString());
                                                
                                                // 使用React状态更新，确保组件重新渲染
                                                setTimeout(() => {
                                                    // 更新状态触发重新渲染
                                                    setCheckInUpdated(prev => prev + 1);
                                                }, 100);
                                            }
                                        }}
                                        disabled={(() => {
                                            const todayDate = new Date().toLocaleDateString();
                                            const checkInData = JSON.parse(localStorage.getItem('life-game-weekly-checkin') || '{}');
                                            return !!checkInData[todayDate];
                                        })()}
                                        className={`w-11 h-11 rounded-full text-sm font-bold transition-all duration-300 flex flex-col items-center justify-center gap-0 ${(() => {
                                            const todayDate = new Date().toLocaleDateString();
                                            const checkInData = JSON.parse(localStorage.getItem('life-game-weekly-checkin') || '{}');
                                            
                                            if (checkInData[todayDate]) {
                                                return isNeomorphic 
                                                    ? (theme === 'neomorphic-dark' 
                                                        ? 'bg-[#1e1e2e] text-emerald-500 border-2 border-emerald-500/30 cursor-not-allowed shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-3px_-3px_6px_rgba(30,30,46,0.8)]' 
                                                        : 'bg-[#e0e5ec] text-emerald-500 border-2 border-emerald-500/30 cursor-not-allowed shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)]') 
                                                    : 'bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500/30 cursor-not-allowed';
                                            } else {
                                                return isNeomorphic 
                                                    ? (theme === 'neomorphic-dark' 
                                                        ? 'bg-[#1e1e2e] text-blue-500 border-2 border-blue-500/30 hover:shadow-[3px_3px_6px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(30,30,46,0.8)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-3px_-3px_6px_rgba(30,30,46,0.8)] animate-pulse' 
                                                        : 'bg-[#e0e5ec] text-blue-500 border-2 border-blue-500/30 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] animate-pulse') 
                                                    : 'bg-blue-600 text-white border-2 border-blue-700 hover:bg-blue-700 shadow-lg shadow-blue-900/30 transform hover:scale-105 animate-pulse';
                                            }
                                        })()}`}
                                    >
                                        {(() => {
                                            const todayDate = new Date().toLocaleDateString();
                                            const checkInData = JSON.parse(localStorage.getItem('life-game-weekly-checkin') || '{}');
                                            return checkInData[todayDate] ? (
                                                <>
                                                    <Check size={20} strokeWidth={3}/>
                                                    <span className="text-[9px]">已签</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Package size={20} strokeWidth={2}/>
                                                    <span className="text-[9px]">签到</span>
                                                </>
                                            );
                                        })()}
                                    </button>
                                </div>
                                
                                {/* 7天签到状态 - 更小的尺寸 */}
                                <div className="grid grid-cols-7 gap-1" key={checkInUpdated}>
                                    {(() => {
                                        // 获取本周的日期范围（周一到周日）
                                        const now = new Date();
                                        const day = now.getDay();
                                        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 调整到周一
                                        const monday = new Date(now.setDate(diff));
                                        
                                        const weekDates = [];
                                        for (let i = 0; i < 7; i++) {
                                            const date = new Date(monday);
                                            date.setDate(monday.getDate() + i);
                                            weekDates.push(date);
                                        }
                                        
                                        const checkInData = JSON.parse(localStorage.getItem('life-game-weekly-checkin') || '{}');
                                        const today = new Date();
                                        const todayDateStr = today.toLocaleDateString();
                                        const dayNames = ['一', '二', '三', '四', '五', '六', '日'];
                                        
                                        // 每天的图标 - 放大尺寸
                                        const dayIcons = [<Sun size={14}/>, <Coffee size={14}/>, <BookOpen size={14}/>, <Dumbbell size={14}/>, <Users size={14}/>, <Music size={14}/>, <Moon size={14}/>];
                                        
                                        return weekDates.map((date, index) => {
                                            const dateStr = date.toLocaleDateString();
                                            const isCheckedIn = !!checkInData[dateStr];
                                            const isToday = dateStr === todayDateStr;
                                            
                                            return (
                                                <div 
                                                    key={index} 
                                                    className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${isToday ? 'scale-105' : ''}`}
                                                >
                                                    <div className={`
                                                        w-full aspect-square rounded-full flex items-center justify-center border-2 text-[7px] font-bold transition-all
                                                        ${isCheckedIn 
                                                            ? (isNeomorphic 
                                                                ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-emerald-500/30 text-emerald-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] border-emerald-500/30 text-emerald-500 shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)]') 
                                                                : 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-[0_0_3px_rgba(16,185,129,0.3)]')
                                                            : isToday 
                                                            ? (isNeomorphic 
                                                                ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-blue-500/30 text-blue-500 shadow-[1px_1px_2px_rgba(0,0,0,0.4),-1px_-1px_2px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] border-blue-500/30 text-blue-500 shadow-[1px_1px_2px_rgba(163,177,198,0.6),-1px_-1px_2px_rgba(255,255,255,1)]') 
                                                                : 'border-blue-500 bg-blue-500/10 text-blue-500 shadow-[0_0_3px_rgba(59,130,246,0.3)]')
                                                            : (isNeomorphic 
                                                                ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-zinc-600/30 text-zinc-400 shadow-[1px_1px_2px_rgba(0,0,0,0.4),-1px_-1px_2px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] border-zinc-300/30 text-zinc-400 shadow-[1px_1px_2px_rgba(163,177,198,0.6),-1px_-1px_2px_rgba(255,255,255,1)]') 
                                                                : (isDark ? 'border-zinc-800 bg-zinc-800 text-zinc-600' : 'border-slate-200 bg-slate-100 text-slate-400'))
                                                    }
                                                    `}>
                                                        {isCheckedIn && <Check size={14} strokeWidth={3} className="flex-shrink-0"/>}
                                                        {!isCheckedIn && dayIcons[index]}
                                                    </div>
                                                    <div className={`text-[7px] font-bold ${isCheckedIn ? 'text-emerald-500' : isToday ? 'text-blue-500' : (isDark ? 'text-zinc-500' : 'text-slate-500')}`}>
                                                        {dayNames[index]}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 任务管理系统 */}
                    <div className={`${cardBg} border p-3 rounded-xl`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
                                <List size={12}/> 任务管理系统
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                            <div className="flex gap-2">
                                <button onClick={() => setTaskCategory('random')} className={`px-4 py-1.5 rounded-[24px] text-xs font-bold border transition-all duration-200 ${getButtonStyle(taskCategory === 'random')}`}>命运骰子</button>
                                <button onClick={() => setTaskCategory('main')} className={`px-4 py-1.5 rounded-[24px] text-xs font-bold border transition-all duration-200 ${getButtonStyle(taskCategory === 'main')}`}>主线任务</button>
                                <button onClick={() => setTaskCategory('daily')} className={`px-4 py-1.5 rounded-[24px] text-xs font-bold border transition-all duration-200 ${getButtonStyle(taskCategory === 'daily')}`}>日常任务</button>
                            </div>
                            <div className="flex gap-2 items-center">
                            <HelpTooltip helpId="tasks" onHelpClick={setActiveHelp} className="text-zinc-500 hover:text-white transition-colors relative group">
                                <HelpCircle size={16}/>
                            </HelpTooltip>
                            <button onClick={() => setIsManageTasksOpen(true)} className={`text-xs px-3 py-1.5 rounded-[24px] border font-bold flex items-center gap-1 transition-all ${getButtonStyle(isManageShopMode, true)}`}><List size={12}/> 管理</button>
                        </div>
                        </div>
                        {/* 任务进度条 */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center text-xs mb-1">
                                <span className="text-zinc-500">任务完成进度</span>
                                <span className={`font-mono text-blue-500`}>
                                    {(() => {
                                        if (taskCategory === 'daily') {
                                            const completed = habitTasks.filter(task => task.completed).length;
                                            const total = habitTasks.length;
                                            return total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%';
                                        } else if (taskCategory === 'main') {
                                            // 计算主线任务的整体进度，考虑子任务完成情况
                                            const totalWeight = projectTasks.length;
                                            if (totalWeight === 0) return '0%';
                                            
                                            const overallProgress = projectTasks.reduce((sum, task) => {
                                                if (task.completed) {
                                                    return sum + 1;
                                                } else {
                                                    const subTaskProgress = task.subTasks.filter(st => st.completed).length / task.subTasks.length;
                                                    return sum + subTaskProgress;
                                                }
                                            }, 0);
                                            
                                            return `${Math.round((overallProgress / totalWeight) * 100)}%`;
                                        } else {
                                            const completed = todaysChallenges.tasks.filter(taskStr => {
                                                return completedRandomTasks[todaysChallenges.date]?.includes(taskStr) || false;
                                            }).length;
                                            const total = todaysChallenges.tasks.length;
                                            return total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%';
                                        }
                                    })()}
                                </span>
                            </div>
                            <div className={`w-full h-2.5 rounded-full overflow-hidden shadow-inner ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}>
                                <div 
                                    className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                                    style={{ 
                                        width: `${(() => {
                                            if (taskCategory === 'daily') {
                                                const completed = habitTasks.filter(task => task.completed).length;
                                                const total = habitTasks.length;
                                                return total > 0 ? (completed / total) * 100 : 0;
                                            } else if (taskCategory === 'main') {
                                                // 计算主线任务的整体进度，考虑子任务完成情况
                                                const totalWeight = projectTasks.length;
                                                if (totalWeight === 0) return 0;
                                                
                                                const overallProgress = projectTasks.reduce((sum, task) => {
                                                    if (task.completed) {
                                                        return sum + 1;
                                                    } else {
                                                        const subTaskProgress = task.subTasks.filter(st => st.completed).length / task.subTasks.length;
                                                        return sum + subTaskProgress;
                                                    }
                                                }, 0);
                                                
                                                return (overallProgress / totalWeight) * 100;
                                            } else {
                                                const completed = todaysChallenges.tasks.filter(taskStr => {
                                                    return completedRandomTasks[todaysChallenges.date]?.includes(taskStr) || false;
                                                }).length;
                                                const total = todaysChallenges.tasks.length;
                                                return total > 0 ? (completed / total) * 100 : 0;
                                            }
                                        })()}%` 
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 mb-4">
                        {taskCategory === 'daily' && habitTasks.map((task, index) => (
                            <div 
                                key={task.id} 
                                draggable 
                                onDragStart={() => handleDragStart(task, index)} 
                                onDragEnd={handleDragEnd} 
                                onDragOver={(e) => handleDragOver(e, index)} 
                                onDoubleClick={() => openEditTask(task)} 
                                className={`relative group rounded-lg border transition-all overflow-hidden ${task.completed ? 'opacity-50 grayscale ' + (isDark ? 'bg-zinc-950/50' : 'bg-slate-100') : task.isGivenUp ? 'opacity-70 ' + (isDark ? 'bg-red-950/10 border-red-900/30' : 'bg-red-50 border-red-200') : ''} ${cardBg} ${!task.completed && !task.isGivenUp ? 'hover:shadow-lg' : (isDark ? 'border-zinc-800' : 'border-slate-200')} ${draggedTask && draggedTask.id === task.id ? 'opacity-50 scale-95' : ''}`}
                            >
                                <div className="p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
                                    <div className="text-zinc-600 cursor-grab active:cursor-grabbing hidden sm:flex"><GripVertical size={14}/></div>
                                    <button onClick={(e) => { e.stopPropagation(); completeTask(task, e); }} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : task.isGivenUp ? 'border-red-900 text-red-900 cursor-not-allowed' : (isDark ? 'border-zinc-600 hover:border-emerald-500 text-transparent' : 'border-slate-300 hover:border-emerald-500 bg-white')}`} disabled={task.isGivenUp}>
                                        {task.completed && <Check size={16} strokeWidth={4} />}
                                        {task.isGivenUp && <X size={16} strokeWidth={4} />}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                            <h3 className={`font-bold truncate ${task.completed || task.isGivenUp ? 'line-through text-zinc-500' : textMain}`}>
                                                    {task.text}
                                                    {task.isGivenUp && <span className="ml-1 text-[9px] text-red-500 border border-red-900 bg-red-900/20 px-1 rounded font-bold whitespace-nowrap">已放弃</span>}
                                                </h3>
                                            <button onClick={() => openEditTask(task)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-blue-500 transition-opacity ml-1 sm:ml-2"><Edit3 size={12}/></button>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-mono text-zinc-500 mt-1 flex-wrap">
                                            <span className="text-purple-400">+{task.xp}</span>
                                            <span className="text-yellow-500">+{task.gold}</span>
                                            <span className="text-blue-500">{task.duration || 25}m</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        {!task.completed && !task.isGivenUp && (
                                            <button onClick={(e) => giveUpTask(task.id, e)} className="text-zinc-600 hover:text-red-500 p-2 rounded hover:bg-red-900/10 transition-colors" title="放弃任务 (无奖励)">
                                                <X size={16} />
                                            </button>
                                        )}
                                        <button onClick={() => {
                                                handleStartTimer(task.duration || 25);
                                            }} disabled={task.completed || task.isGivenUp} className={`p-3 rounded-full text-white transition-colors group-hover:scale-105 shadow-lg ${isDark ? 'bg-zinc-800 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'} disabled:opacity-50 disabled:scale-100`}>
                                                <Play size={16} fill="currentColor"/>
                                            </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {taskCategory === 'main' && projectTasks.map((task, index) => (
                            <div 
                                key={task.id} 
                                draggable 
                                onDragStart={() => handleDragStart(task, index)} 
                                onDragEnd={handleDragEnd} 
                                onDragOver={(e) => handleDragOver(e, index)} 
                                onDoubleClick={() => openEditTask(task)} 
                                className={`relative group rounded-lg border transition-all overflow-hidden ${task.completed ? 'opacity-50 grayscale ' + (isDark ? 'bg-zinc-950/50' : 'bg-slate-100') : ''} ${cardBg} ${!task.completed ? 'hover:shadow-lg' : (isDark ? 'border-zinc-800' : 'border-slate-200')} ${draggedTask && draggedTask.id === task.id ? 'opacity-50 scale-95' : ''}`}
                            >
                                <div className="p-3 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <button className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : (isDark ? 'border-zinc-600 cursor-default' : 'border-slate-300 bg-white')}`}>{task.completed && <Check size={16} strokeWidth={4} />}</button>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                                <h3 className={`font-bold ${task.completed ? 'line-through text-zinc-500' : textMain}`}>
                                                    {task.text}
                                                </h3>
                                                <button onClick={() => openEditTask(task)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-blue-500 transition-opacity ml-1"><Edit3 size={12}/></button>
                                            </div>
                                            {/* 显示主任务的经验、金币和消耗时长 */}
                                            <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-zinc-500 flex-wrap">
                                                <span className="text-purple-400">总经验 +{task.xp}</span>
                                                <span className="text-yellow-500">总金币 +{task.gold}</span>
                                                <span className="text-blue-500">总时长 {task.subTasks.reduce((sum, st) => sum + st.duration, 0)} 分钟</span>
                                            </div>
                                            {/* 主线任务进度条 */}
                                            {!task.completed && (
                                                <div className="mt-1.5">
                                                    <div className="flex items-center justify-end text-xs mb-0.5">
                                                        <span className="font-mono text-blue-500">{Math.round((task.subTasks.filter(st => st.completed).length / task.subTasks.length) * 100)}%</span>
                                                    </div>
                                                    <div className={`w-full h-2 rounded-full overflow-hidden ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]' : isDark ? 'bg-zinc-800 shadow-inner' : 'bg-slate-200 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'}`}>
                                                        <div 
                                                            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                                                            style={{ width: `${(task.subTasks.filter(st => st.completed).length / task.subTasks.length) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {task.subTasks && !task.completed && (
                                    <div className={`border-t p-1 sm:p-2 space-y-1 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'border-[#1e1e2e] bg-[#1e1e2e]' : 'border-[#e0e5ec] bg-[#e0e5ec]') : isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-slate-200 bg-slate-50'}`}>
                                        {task.subTasks.map((st) => {
                                            // 提取子任务卡片样式逻辑到变量
                                            let subTaskCardClass = 'flex flex-wrap items-center justify-between gap-1 sm:gap-2 p-1.5 rounded cursor-pointer group/sub transition-all';
                                            
                                            if (isNeomorphic) {
                                                if (theme === 'neomorphic-dark') {
                                                    subTaskCardClass += ' bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(30,30,46,0.8)]';
                                                } else {
                                                    subTaskCardClass += ' bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.8)] hover:shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,1)]';
                                                }
                                            } else {
                                                subTaskCardClass += isDark ? ' hover:bg-white/5' : ' hover:bg-white border border-transparent hover:border-slate-200';
                                            }
                                            
                                            return (
                                                <div 
                                                    key={st.id} 
                                                    className={subTaskCardClass}
                                                >
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <button onClick={(e) => { e.stopPropagation(); toggleSubTask(task.id, st.id); }} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${st.completed ? 'bg-emerald-500 border-emerald-500 text-white' : (isDark ? 'border-zinc-600 hover:border-emerald-500 text-transparent' : 'border-slate-300 hover:border-emerald-500 bg-white')}`}>
                                                            {st.completed && <Check size={16} strokeWidth={4} />}
                                                        </button>
                                                        <span className={`text-sm truncate ${st.completed ? 'text-zinc-600 line-through' : textMain} transition-all`}>
                                                            {st.text}
                                                        </span>
                                                    </div>
                                                    {/* 显示子任务的经验、金币和时长 */}
                                                    <div className="flex items-center gap-1 sm:gap-2 text-xs font-mono text-zinc-500 flex-wrap mb-1 sm:mb-0">
                                                        <span className="text-purple-400">+{st.xp}</span>
                                                        <span className="text-yellow-500">+{st.gold}</span>
                                                        <span className="text-blue-500">{st.duration}m</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 sm:gap-0.5">
                                                        <button onClick={(e) => { e.stopPropagation(); giveUpSubTask(task.id, st.id); }} className="text-zinc-700 hover:text-red-500 p-2 opacity-0 group-hover/sub:opacity-100 transition-opacity" title="放弃子任务">
                                                            <X size={16}/>
                                                        </button>
                                                        <button onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            handleStartTimer(st.duration || 25);
                                                        }} className={`p-2 rounded-full text-white transition-colors hover:scale-110 shadow-lg ${isDark ? 'bg-zinc-800 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'} opacity-0 group-hover/sub:opacity-100`}>
                                                            <Play size={16} fill="currentColor"/>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}

                        {taskCategory === 'random' && (
                            <div className="space-y-4">
                                {/* 整合后的3D命运骰子组件 - 移除多余的背景和边框样式，使用组件内部样式 */}
                                <div className="w-full">
                                    <FateDice 
                                        theme={theme}
                                        diceState={diceState}
                                        onSpinDice={onSpinDice}
                                        onUpdateDiceState={onUpdateDiceState}
                                        onAddFloatingReward={onAddFloatingReward}
                                    />
                                </div>
                                
                                {/* 骰子结果弹窗 - 使用全局统一组件 */}
                                {diceState?.currentResult && (
                                    <FateGiftModal
                                        task={diceState.currentResult as any}
                                        isSpinning={diceState.isSpinning}
                                        onComplete={() => onDiceResult && onDiceResult('completed')}
                                        onLater={() => onDiceResult && onDiceResult('later')}
                                        onSkip={() => onDiceResult && onDiceResult('skipped')}
                                        onStartTimer={(duration) => {
                                            onChangeDuration(duration);
                                            onToggleTimer();
                                            // 进入沉浸式模式
                                            setIsImmersive(true);
                                        }}
                                        theme={theme.includes('neomorphic') ? 'neomorphic' : 'dark'}
                                    />
                                )}
                                
                                {/* 任务列表 - 响应式网格布局 */}
                                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                                    {/* 未完成任务 */}
                                    <div className={`${cardBg} border p-2 sm:p-4 rounded-xl transition-all duration-300`}>
                                        <h4 className={`text-base sm:text-lg font-bold mb-3 ${textMain}`}>待完成任务</h4>
                                        {diceState?.pendingTasks?.length > 0 ? (
                                            <div className="space-y-2">
                                                {diceState.pendingTasks.map(taskRecord => (
                                                    <div 
                                                        key={taskRecord.id} 
                                                        className={`relative group rounded-lg border transition-all overflow-hidden ${cardBg} hover:shadow-lg ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}
                                                    >
                                                        <div className="p-2 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                                                            <button onClick={() => {
                                                                // 直接标记任务为已完成，不弹出命运的礼物界面
                                                                if (onUpdateDiceState) {
                                                                    // 更新待完成任务列表，将当前任务移到已完成任务列表
                                                                    const updatedPendingTasks = diceState.pendingTasks.filter(t => t.id !== taskRecord.id);
                                                                    const completedTask = {
                                                                        ...taskRecord,
                                                                        status: 'completed' as const,
                                                                        completedAt: new Date().toISOString()
                                                                    };
                                                                    const updatedCompletedTasks = [...diceState.completedTasks, completedTask];
                                                                    
                                                                    onUpdateDiceState({
                                                                        pendingTasks: updatedPendingTasks,
                                                                        completedTasks: updatedCompletedTasks
                                                                    });
                                                                }
                                                            }} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isDark ? 'border-zinc-600 hover:border-emerald-500 text-transparent' : 'border-slate-300 hover:border-emerald-500 bg-white'}`}>
                                                                <Check size={16} strokeWidth={4} className="text-transparent hover:text-white transition-colors" />
                                                            </button>
                                                            <div className="flex-1 min-w-0 w-full">
                                                                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                                                    <h3 className={`font-bold truncate flex-1 min-w-0 ${textMain}`}>
                                                                        {taskRecord.task.text}
                                                                    </h3>
                                                                </div>
                                                                <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono text-zinc-500 mt-1 flex-wrap">
                                                                    <span className="text-purple-400">+{taskRecord.generatedXp}</span>
                                                                    <span className="text-yellow-500">+{taskRecord.generatedGold}</span>
                                                                    {taskRecord.task.duration && (
                                                                        <span className="text-blue-500">{taskRecord.task.duration}m</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-start sm:justify-end">
                                                                <button onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // 放弃命运骰子任务
                                                                    if (onUpdateDiceState) {
                                                                        const updatedPendingTasks = diceState.pendingTasks.filter(t => t.id !== taskRecord.id);
                                                                        const abandonedTask = {
                                                                            ...taskRecord,
                                                                            status: 'abandoned' as const,
                                                                            abandonedAt: new Date().toISOString()
                                                                        };
                                                                        const updatedAbandonedTasks = [...(diceState.abandonedTasks || []), abandonedTask];
                                                                        
                                                                        onUpdateDiceState({
                                                                            pendingTasks: updatedPendingTasks,
                                                                            abandonedTasks: updatedAbandonedTasks
                                                                        });
                                                                    }
                                                                }} className="text-zinc-600 hover:text-red-500 p-2 rounded hover:bg-red-900/10 transition-colors" title="放弃任务">
                                                                    <X size={16} />
                                                                </button>
                                                                <button onClick={() => {
                                                                    handleStartTimer(taskRecord.task.duration || 25);
                                                                }} className={`p-3 rounded-full text-white transition-colors group-hover:scale-105 shadow-lg ${isDark ? 'bg-zinc-800 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                                                                    <Play size={16} fill="currentColor"/>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-zinc-500 italic">
                                                暂无待完成的命运任务，点击骰子获取新任务
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* 已完成任务 */}
                                    <div className={`${cardBg} border p-2 sm:p-4 rounded-xl transition-all duration-300`}>
                                        <h4 className={`text-base sm:text-lg font-bold mb-3 ${textMain}`}>已完成任务</h4>
                                        {diceState?.completedTasks?.length > 0 ? (
                                            <div className="space-y-2">
                                                {diceState.completedTasks.map(taskRecord => (
                                                    <div 
                                                        key={taskRecord.id} 
                                                        className={`relative group rounded-lg border transition-all overflow-hidden opacity-50 grayscale ${isDark ? 'bg-zinc-950/50' : 'bg-slate-100'} ${cardBg} ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}
                                                    >
                                                        <div className="p-2 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                                                            <div className={`w-8 h-8 rounded-full border-2 bg-emerald-500 border-emerald-500 text-white flex items-center justify-center transition-all shrink-0`}>
                                                                <Check size={16} strokeWidth={4} />
                                                            </div>
                                                            <div className="flex-1 min-w-0 w-full">
                                                                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                                                    <h3 className={`font-bold truncate flex-1 min-w-0 text-zinc-500 line-through`}>
                                                                        {taskRecord.task.text}
                                                                    </h3>
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono text-zinc-500 mt-1">
                                                                    <span className="text-purple-400">+{taskRecord.generatedXp}</span>
                                                                    <span className="text-yellow-500">+{taskRecord.generatedGold}</span>
                                                                    {taskRecord.task.duration && (
                                                                        <span className="text-blue-500">{taskRecord.task.duration}m</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-start sm:justify-end">
                                                                <div className={`p-3 rounded-full text-white shadow-lg ${isDark ? 'bg-zinc-800' : 'bg-blue-500'} opacity-50`}>
                                                                    <Check size={16} fill="currentColor"/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-zinc-500 italic">
                                                暂无已完成的命运任务
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* ... Other Tabs (Shop, Armory, Modals) ... */}
            {/* ... The rest of the tabs are controlled by the mainTab switch above ... */}
            {mainTab === 'shop' && (
                <div className="max-w-5xl mx-auto space-y-6">
                     {/* 商品分组和管理商品组合成一个小模块 */}
                     <div className={`p-4 rounded-xl border ${cardBg} shadow-lg`}>
                         {/* 左上角小图标和文字 */}
                         <div className="flex items-center gap-2 mb-3">
                             <ShoppingBag size={14} className="text-yellow-500"/>
                             <h3 className={`text-xs font-bold uppercase ${textSub}`}>商品分类与管理</h3>
                         </div>
                         <div className="flex flex-wrap justify-between items-center gap-4">
                             <div className="flex flex-wrap gap-2">
                                {/* 计算各分类商品数量 */}
                                {(() => {
                                    const categories = [
                                        { id: 'all', label: '全部', count: inventory.length },
                                        { id: '吃喝', label: '吃喝', count: inventory.filter(i => i.category === '吃喝').length },
                                        { id: '形象设计与穿搭', label: '形象设计与穿搭', count: inventory.filter(i => i.category === '形象设计与穿搭').length },
                                        { id: '休闲娱乐', label: '休闲娱乐', count: inventory.filter(i => i.category === '休闲娱乐').length },
                                        { id: '数码', label: '数码', count: inventory.filter(i => i.category === '数码').length },
                                        { id: '家居', label: '家居', count: inventory.filter(i => i.category === '家居').length },
                                        { id: '会员充值', label: '会员充值', count: inventory.filter(i => i.category === '会员充值').length },
                                        { id: 'blindbox', label: '盲盒', count: BLIND_BOX_PRICES.length },
                                        { id: 'owned', label: '已购买', count: inventory.filter(i => i.owned).length }
                                    ];
                                    return categories.map(f => (
                                        <button key={f.id} onClick={() => setShopFilter(f.id as any)} className={`px-2 py-1.5 rounded-[24px] text-xs font-bold border transition-all duration-200 whitespace-nowrap ${getButtonStyle(shopFilter === f.id)}`}>
                                            {f.label} <span className="text-[9px] opacity-80">({f.count})</span>
                                        </button>
                                    ));
                                })()}
                                
                             </div>
                             <div className="flex gap-2 items-center">
                                 <HelpTooltip helpId="shop" onHelpClick={setActiveHelp} className="text-zinc-500 hover:text-white transition-colors">
                                    <HelpCircle size={16}/>
                                 </HelpTooltip>
                                 <div className={`flex items-center gap-1 cursor-pointer transition-all ${isEditingSavings ? '' : 'hover:scale-105'}`}>
                                     {isEditingSavings ? (
                                         <div className="flex items-center gap-1">
                                             <Wallet size={12} className="text-yellow-500"/>
                                             <input 
                                                 type="number" 
                                                 min="0" 
                                                 value={tempSavings} 
                                                 onChange={(e) => setTempSavings(Number(e.target.value))} 
                                                 className={`w-20 text-xs px-2 py-1.5 rounded-[24px] border font-bold ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                 autoFocus
                                                 onKeyDown={(e) => {
                                                     if (e.key === 'Enter') {
                                                         onUpdateBalance(tempSavings - balance, '调整战略储备金');
                                                         setIsEditingSavings(false);
                                                     } else if (e.key === 'Escape') {
                                                         setTempSavings(balance);
                                                         setIsEditingSavings(false);
                                                     }
                                                 }}
                                             />
                                             <button 
                                                 onClick={() => {
                                                     onUpdateBalance(tempSavings - balance, '调整战略储备金');
                                                     setIsEditingSavings(false);
                                                 }}
                                                 className={`text-xs px-2 py-1.5 rounded-full font-bold ${isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-800/50' : 'bg-green-100 text-green-700 hover:bg-green-200'} transition-colors`}
                                             >
                                                 ✓
                                             </button>
                                             <button 
                                                 onClick={() => {
                                                     setTempSavings(balance);
                                                     setIsEditingSavings(false);
                                                 }}
                                                 className={`text-xs px-2 py-1.5 rounded-full font-bold ${isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-800/50' : 'bg-red-100 text-red-700 hover:bg-red-200'} transition-colors`}
                                             >
                                                 ✕
                                             </button>
                                         </div>
                                     ) : (
                                         <div 
                                             onDoubleClick={() => setIsEditingSavings(true)}
                                             className={`text-xs px-3 py-1.5 rounded-[24px] border font-bold flex items-center gap-1 ${getButtonStyle(false, false)}`}
                                         >
                                             <Wallet size={12} className="text-yellow-500"/> 储备金: {balance}
                                         </div>
                                     )}
                                 </div>
                                 <button onClick={() => setIsManageShopMode(!isManageShopMode)} className={`text-xs px-3 py-1.5 rounded-[24px] border font-bold flex items-center gap-1 transition-all ${getButtonStyle(isManageShopMode, true)}`}>
                                     {isManageShopMode ? <CheckCircle size={12}/> : <Hammer size={12}/>} {isManageShopMode ? '完成管理' : '管理商品'}
                                 </button>
                             </div>
                         </div>
                     </div>
                     {isManageShopMode && (<div className="mb-4"><button onClick={handleAddNewItem} className={`w-full py-3 border ${isNeomorphic ? 'border-dashed ' + neomorphicStyles.bg + ' ' + neomorphicStyles.border + ' ' + neomorphicStyles.shadow + ' ' + neomorphicStyles.hoverShadow + ' ' + neomorphicStyles.activeShadow : 'border-dashed border-zinc-700'} rounded-[24px] text-zinc-500 hover:text-white hover:border-zinc-500 transition-all flex items-center justify-center gap-2 text-sm font-bold`}><Plus size={16}/> 上架新商品</button></div>)}
                     {shopFilter === 'blindbox' ? (
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                             {BLIND_BOX_PRICES.map((price, index) => (
                                 <div key={price} className={`group relative p-4 rounded-lg border flex flex-col items-center text-center gap-1.5 hover:border-yellow-500/50 hover:shadow-lg transition-all ${cardBg.replace('border-[#a3b1c6]', 'border-[#e0e5ec]')} cursor-pointer`} style={{ minHeight: '160px' }}>
                                     {/* 圆形图标，带有精致的边缘光效 */}
                                     <div className="relative w-full flex items-center justify-center mb-0">
                                         <div className={`relative w-14 h-14 rounded-full flex items-center justify-center border ${isDark ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700' : 'bg-gradient-to-br from-zinc-100 to-zinc-200 border-zinc-300'} group-hover:scale-110 transition-all duration-300`}>
                                            {/* 边缘光效 */}
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500/30 via-purple-500/30 to-blue-500/30 animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            {/* 扫光效果 */}
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-[shine_2s_ease-in-out_infinite] transform -rotate-45 transition-opacity duration-500"></div>
                                            {/* 中心图标 */}
                                            <div className="relative z-10 text-7xl group-hover:animate-pulse"><Dice5 size={24} className="text-purple-500"/></div>
                                        </div>
                                     </div>
                                     {/* 价格移到商品名称上面 */}
                                     <span className={`px-3 py-1 text-xs font-bold rounded-full mt-1 ${isDark ? 'bg-yellow-600/30 text-yellow-400 border border-yellow-600/50' : 'bg-yellow-100 text-yellow-800'}`}>¥{price}</span>
                                     {/* 商品名称允许换行显示 */}
                                     <h4 className={`font-bold text-sm ${textMain} mt-0 text-center w-full break-words`}>盲盒</h4>
                                     {/* 盲盒描述 */}
                                     <p className="text-xs text-zinc-500 mt-0 line-clamp-2 w-full max-w-[120px]">随机获得价值{price * 0.5}-{price * 1.5}的商品，5%概率获得隐藏款</p>
                                     {/* 购买按钮完全融入商品块 */}
                                     <button onClick={(e) => handleBlindBoxPurchase(price, e)} className={`w-full py-1 text-[12px] font-bold rounded-md mt-1 transition-all duration-300 ${isNeomorphic ? neomorphicStyles.bg + ' text-blue-600 hover:text-blue-700' : 'bg-gradient-to-r from-yellow-600/80 to-amber-600/80 hover:from-yellow-500/90 hover:to-amber-500/90 text-white'}`}>
                                        购买
                                    </button>
                                 </div>
                             ))}
                         </div>
                     ) : (
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                             {sortedInventory.map((item, index) => (
                                 <div key={item.id} draggable={isManageShopMode} onDragStart={() => handleShopDragStart(index)} onDragOver={(e) => handleShopDragOver(e, index)} className={`group relative rounded-xl overflow-hidden border transition-all duration-300 ${isNeomorphic ? `${neomorphicStyles.bg} ${neomorphicStyles.border} ${neomorphicStyles.shadow} ${neomorphicStyles.hoverShadow} ${neomorphicStyles.transition} group-hover:${neomorphicStyles.activeShadow}` : 'hover:shadow-lg'} ${item.type === 'physical' && item.owned ? 'opacity-50' : ''} ${isManageShopMode ? 'border-red-500/30 cursor-move' : 'cursor-pointer'}`} style={{ minHeight: '280px' }}>
                                     {isManageShopMode && (<><div className="absolute top-2 right-2 flex gap-2 z-10"><button onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsEditItemOpen(true); }} className={`p-1.5 rounded text-white transition-all duration-200 bg-blue-500/80 shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.8)] hover:shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.9)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]`}><Edit2 size={12}/></button><button onClick={(e) => handleDeleteItem(e, item.id)} className={`p-1.5 rounded text-white transition-all duration-200 bg-red-500/80 shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.8)] hover:shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.9)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]`}><Trash2 size={12}/></button></div><div className="absolute left-2 top-2 text-zinc-600 opacity-50"><GripVertical size={16}/></div></>)}
                                     
                                     {/* 商品图片：完全铺满卡片 */}
                                     {item.image ? (
                                         <div className="product-img absolute top-0 left-0 w-full h-full z-0">
                                             <img 
                                                 src={item.image} 
                                                 alt={item.name}
                                                 className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                                                 onError={(e) => {
                                                     // 如果图片加载失败，回退到背景色和图标显示
                                                     const target = e.target as HTMLImageElement;
                                                     target.style.display = 'none';
                                                     const fallbackDiv = target.parentElement?.getElementsByClassName('fallback-bg')[0] as HTMLElement;
                                                     if (fallbackDiv) fallbackDiv.style.display = 'flex';
                                                     
                                                     // 在开发环境记录失效的图片链接
                                                     if (process.env.NODE_ENV === 'development') {
                                                         // 静默处理图片加载失败的情况
                                                     }
                                                 }}
                                             />
                                             <div className="fallback-bg absolute inset-0 flex items-center justify-center" style={{ display: 'none', backgroundColor: isDark ? '#1a1a2e' : '#e0e5ec' }}>
                                                 <div className="text-5xl">{item.icon}</div>
                                             </div>
                                         </div>
                                     ) : (
                                         <div className="absolute inset-0 flex items-center justify-center z-0" style={{ backgroundColor: isDark ? '#1a1a2e' : '#e0e5ec' }}>
                                             <div className="text-6xl">{item.icon}</div>
                                         </div>
                                     )}
                                     
                                     {/* 渐变遮罩：从商品标题区域顶部开始向下渐变覆盖，优化视觉效果 */}
                                    <div className="gradient-mask absolute left-0 top-1/2 w-full h-2/3 z-10 pointer-events-none" style={{
                                        background: isDark ? 
                                            'linear-gradient(to bottom, rgba(26,26,46,0), rgba(26,26,46,0.3) 30%, rgba(26,26,46,0.5) 60%, rgba(26,26,46,0.7) 80%, rgba(26,26,46,0.9) 100%)' : 
                                            'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.7) 80%, rgba(255,255,255,0.9) 100%)'
                                    }}></div>
                                     
                                     {/* 商品信息：叠在遮罩上 */}
                                    <div className="product-info relative z-20 p-5 text-center" style={{ marginTop: '65px' }}>
                                         {/* 价格：突出显示在商品名称上方 */}
                                         <div className={`bg-opacity-95 px-4 py-1.5 text-sm font-bold rounded-full mx-auto my-2 inline-block ${isDark ? 'bg-yellow-600/30 text-yellow-400 border border-yellow-600/50' : 'bg-[#fff3cd] text-[#fd7e14]'}`}>¥{item.cost}</div>
                                         
                                         {/* 商品名称：加大字号，更醒目 */}
                                         <h4 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-zinc-900'} mt-2 mb-1 text-shadow ${isDark ? 'text-shadow: 0 1px 2px rgba(0,0,0,0.8)' : 'text-shadow: 0 1px 2px rgba(255,255,255,0.6)'} w-full break-words`}>{item.name}</h4>
                                         
                                         {/* 显示购买次数 */}
                                         {item.purchaseCount > 0 && (
                                             <span className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-500'} font-bold`}>
                                                 已购买 x{item.purchaseCount}
                                             </span>
                                         )}
                                         
                                         {/* 商品描述：限制显示2行，保持卡片整洁 */}
                                         <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-500'} mt-1 mb-6 line-clamp-2 w-full max-w-[240px] mx-auto text-shadow ${isDark ? 'text-shadow: 0 1px 1px rgba(0,0,0,0.6)' : 'text-shadow: 0 1px 1px rgba(255,255,255,0.5)'}`}>{item.description}</p>
                                         
                                         {/* 购买按钮：实心设计，突出行动引导 */}
                                         <button onClick={(e) => handlePurchase(item, e)} className={`inline-block px-8 py-2.5 text-sm font-bold rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${item.type === 'physical' && item.owned ? 'bg-zinc-800/30 text-zinc-500 hover:bg-zinc-700/50' : (isDark ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500' : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400')}`}>
                                            {item.type === 'physical' && item.owned ? '已拥有' : '购买'}
                                        </button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                </div>
            )}
            {mainTab === 'armory' && (
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex items-center gap-4 mb-4"><button onClick={() => setMainTab('battle')} className={`p-2 rounded-full border text-zinc-500 transition-all group ${isDark ? 'border-zinc-700 hover:text-white hover:bg-zinc-700' : 'border-slate-300 hover:bg-slate-100'}`}><ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/></button><h2 className={`text-xl font-bold ${textMain}`}>军械库 (Armory)</h2></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inventory.filter(i => i.type === 'physical' && i.owned).map(item => (
                            <div key={item.id} className={`p-4 rounded-xl border-2 ${item.equipped ? 'border-emerald-500 bg-emerald-900/10' : (isDark ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-white')}`}>
                                <div className="flex gap-4"><div className="text-3xl">{item.icon}</div><div><div className={`font-bold ${textMain}`}>{item.name}</div><div className="text-xs text-zinc-500">{item.description}</div></div></div>
                                <div className="mt-2 text-[10px] text-emerald-500 font-bold uppercase tracking-wider text-right">已拥有</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        {/* Modals */}
        {activeHelp && (
            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                <div className={`w-full max-w-md rounded-2xl border ${cardBg} shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]`}>
                    <button onClick={() => setActiveHelp(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-10"><X size={20}/></button>
                    <div className="p-6 overflow-y-auto">
                        {activeHelp === 'tasks' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className={`text-xl font-black ${textMain} flex items-center gap-2`}>
                                        <List className="text-blue-500"/>
                                        任务系统指南
                                    </h3>
                                    <div className={`text-xs ${textSub}`}>更新时间: 2025-12-25</div>
                                </div>
                                <div className="text-sm text-zinc-400 space-y-3">
                                    <p><strong className="text-emerald-500">左侧勾选 (√):</strong> 完成任务，立即获得金币与经验奖励，并记录连胜。</p>
                                    <p><strong className="text-red-500">右侧放弃 (X):</strong> 战略性放弃今日任务。无惩罚，无奖励，任务将显示<span className="text-red-500">已放弃</span>并沉底，代表今日不再攻坚。</p>
                                    <p><strong>日常任务:</strong> 每日重置，适合培养微习惯。</p>
                                    <p><strong>主线任务:</strong> 长期目标，适合项目推进。</p>
                                    
                                    <p className="text-lg font-bold text-purple-500">命运骰子系统</p>
                                    <p><strong className="text-purple-500">系统简介:</strong> 命运骰子是一个趣味互动模块，通过游戏化方式增加系统趣味性，提供随机惊喜，打破日常任务的单调性，平衡任务压力，促进用户主动参与。</p>
                                    
                                    <p><strong className="text-purple-500">娱乐性:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>流畅的骰子旋转动画，增强视觉体验</li>
                                        <li>随机生成的任务和奖励，带来惊喜感</li>
                                        <li>每日进度条设计，提供成就感和目标感</li>
                                        <li>多样化的任务类型，保持新鲜感</li>
                                    </ul>
                                    
                                    <p><strong className="text-purple-500">优势与好处:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>打破日常任务的单调性，提供随机惊喜</li>
                                        <li>平衡任务压力，穿插休闲小奖励</li>
                                        <li>促进用户主动参与，"有事没事点一下"</li>
                                        <li>覆盖多种任务类型，满足不同场景需求</li>
                                        <li>降低决策成本，减少用户选择困难</li>
                                        <li>培养微习惯，通过简单任务建立良好习惯</li>
                                        <li>增加系统使用频率，提高用户活跃度</li>
                                        <li>通过随机任务激发用户尝试新事物</li>
                                    </ul>
                                    
                                    <p><strong className="text-purple-500">骰子设计与概率:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>12面骰子设计，科学的概率分布</li>
                                        <li>健康微行动类：4面 (33.3% 概率) - 专注5-60分钟、深蹲、俯卧撑等</li>
                                        <li>效率任务类：5面 (41.7% 概率) - 寻找爆款作品、整理工作流、发布内容等</li>
                                        <li>休闲小奖励类：3面 (25% 概率) - 喝水、吃水果、听音乐等</li>
                                    </ul>
                                    
                                    <p><strong className="text-purple-500">交互规则:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>点击骰子图标触发旋转动画（1-2秒时长）</li>
                                        <li>动画结束后显示随机任务结果</li>
                                        <li>点击「已完成」：发放对应积分，记录任务完成状态</li>
                                        <li>点击「稍后做」：将任务加入待办列表，不发积分</li>
                                        <li>点击「跳过」：不发积分，直接关闭弹窗，消耗当日次数</li>
                                    </ul>
                                    
                                    <p><strong className="text-purple-500">任务管理:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>未完成任务：置顶显示，方便查看和完成</li>
                                        <li>已完成任务：置底显示，记录用户成就，带有勾选标记</li>
                                        <li>每日自动清空：零点自动重置任务列表</li>
                                        <li>进度条机制：每日10次点击机会，完成一个任务推进10%进度条</li>
                                        <li>任务填充：新任务自动添加到待办列表，完成的任务移至已完成列表</li>
                                    </ul>
                                    
                                    <p><strong className="text-purple-500">奖励机制:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>休闲类任务：2-5金币</li>
                                        <li>健康类任务：3-6金币</li>
                                        <li>效率类任务：5-10金币</li>
                                        <li>分值可配置，支持自定义调整</li>
                                    </ul>
                                    
                                    <p><strong className="text-purple-500">记忆功能:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>记录用户历史抽取的任务</li>
                                        <li>智能避免短时间内重复抽到相同内容</li>
                                        <li>确保任务多样性，提高用户体验</li>
                                        <li>历史记录定期清理，保持系统性能</li>
                                    </ul>
                                    
                                    <p><strong className="text-purple-500">逻辑设计:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>基于概率分布的任务生成算法</li>
                                        <li>智能避免重复任务，记录用户历史抽取的任务</li>
                                        <li>任务池管理，支持动态添加和调整任务</li>
                                        <li>每日自动重置机制，确保每天都有新的任务</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                        {activeHelp === 'dice' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className={`text-xl font-black ${textMain} flex items-center gap-2`}>
                                        <Dice5 className="text-purple-500"/>
                                        命运骰子指南
                                    </h3>
                                    <div className={`text-xs ${textSub}`}>更新时间: 2025-12-26</div>
                                </div>
                                <div className="text-sm text-zinc-400 space-y-3">
                                    <p><strong className="text-purple-500">原理:</strong> 以RPG游戏随机事件为核心，通过轻量化随机任务/奖励降低行动启动门槛，强化人生游戏化沉浸感。</p>
                                    
                                    <p><strong className="text-purple-500">好处:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>打破规划焦虑，降低行动启动门槛</li>
                                        <li>提升执行趣味性，让任务不再枯燥</li>
                                        <li>平衡任务压力与休闲反馈，避免疲劳</li>
                                        <li>培养微习惯，通过简单任务建立良好行为模式</li>
                                        <li>增加系统使用频率，提高用户活跃度</li>
                                    </ul>
                                    
                                    <p><strong className="text-purple-500">规则:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>每日可点击10次，点击消耗次数</li>
                                        <li>完成任务可获对应积分：休闲类2-5分、健康类3-6分、效率类5-10分</li>
                                        <li>支持"已完成/稍后做/跳过"操作</li>
                                        <li>智能避免重复抽取历史任务</li>
                                        <li>任务类型分为三大类：健康微行动、效率任务、休闲小奖励</li>
                                    </ul>
                                    
                                    <p><strong className="text-purple-500">娱乐性:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>3D立体骰子旋转动画，增强视觉体验</li>
                                        <li>随机生成的任务和奖励，带来惊喜感</li>
                                        <li>每日进度条设计，提供成就感和目标感</li>
                                        <li>多样化的任务类型，保持新鲜感</li>
                                    </ul>
                                    
                                    <p><strong className="text-purple-500">骰子设计与概率:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>12面骰子设计，科学的概率分布</li>
                                        <li>健康微行动类：4面（33.3% 概率）</li>
                                        <li>效率任务类：5面（41.7% 概率，侧重项目推进）</li>
                                        <li>休闲小奖励类：3面（25% 概率，平衡任务压力）</li>
                                    </ul>
                                    
                                    <p><strong className="text-purple-500">交互规则:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>点击骰子图标触发旋转动画（2秒时长）</li>
                                        <li>动画结束后显示随机任务结果，标注为"命运礼物"</li>
                                        <li>点击「已完成」：发放对应积分，记录任务完成状态</li>
                                        <li>点击「稍后做」：将任务加入待办列表，不发积分</li>
                                        <li>点击「跳过」：不发积分，直接关闭弹窗，消耗当日次数</li>
                                    </ul>
                                    
                                    <p><strong className="text-purple-500">任务管理:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>未完成任务：置顶显示，方便查看和完成</li>
                                        <li>已完成任务：置底显示，记录用户成就</li>
                                        <li>每日自动清空：零点自动重置任务列表</li>
                                        <li>进度条机制：每日10次点击机会，完成一个任务推进10%进度条</li>
                                    </ul>
                                    
                                    <p><strong className="text-purple-500">逻辑设计:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>基于概率分布的任务生成算法</li>
                                        <li>智能避免重复任务，记录用户历史抽取的任务</li>
                                        <li>任务池管理，支持动态添加和调整任务</li>
                                        <li>每日自动重置机制，确保每天都有新的任务</li>
                                    </ul>
                                    
                                    <p><strong className="text-purple-500">记忆功能:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>记录用户历史抽取的任务</li>
                                        <li>智能避免短时间内重复抽到相同内容</li>
                                        <li>确保任务多样性，提高用户体验</li>
                                        <li>历史记录定期清理，保持系统性能</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                        {activeHelp === 'shop' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className={`text-xl font-black ${textMain} flex items-center gap-2`}>
                                        <ShoppingBag className="text-yellow-500"/>
                                        黑市交易法则
                                    </h3>
                                    <div className={`text-xs ${textSub}`}>更新时间: 2025-12-26</div>
                                </div>
                                <div className="text-sm text-zinc-400 space-y-3">
                                    <p><strong>实物类:</strong> 如数码产品，购买后永久拥有，存入军械库。</p>
                                    <p><strong>权益/休闲:</strong> 如会员或娱乐时间，购买即消耗，代表你获得了一次享受的权利。</p>
                                    <p><strong>金币来源:</strong> 仅通过完成任务获得。不劳动者不得食。</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Task Management Modal - FIXED */}
        {isManageTasksOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                <div className={`w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] ${cardBg}`}>
                    <div className={`p-4 border-b flex justify-between items-center shrink-0 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                        <h3 className={`font-bold ${textMain}`}>副本任务管理</h3>
                        <button onClick={() => setIsManageTasksOpen(false)} className="text-zinc-500 hover:text-red-500"><X size={20}/></button>
                    </div>
                    
                    <div className={`flex p-2 border-b ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] border-[#1e1e2e] shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] border-[#e0e5ec] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)]') : (isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50')}`}>
                        <button onClick={() => setManageTaskTab('random')} className={`flex-1 text-xs py-2 rounded font-bold flex items-center justify-center gap-1 transition-all duration-200 ${getButtonStyle(manageTaskTab === 'random')}`}><Dice5 size={12} /> 命运骰子</button>
                        <button onClick={() => setManageTaskTab('main')} className={`flex-1 text-xs py-2 rounded font-bold transition-all duration-200 ${getButtonStyle(manageTaskTab === 'main')}`}>主线任务</button>
                        <button onClick={() => setManageTaskTab('daily')} className={`flex-1 text-xs py-2 rounded font-bold transition-all duration-200 ${getButtonStyle(manageTaskTab === 'daily')}`}>日常任务</button>
                    </div>
                    
                    <div className={`p-4 overflow-y-auto space-y-2 flex-1 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_5px_5px_10px_rgba(0,0,0,0.4),inset_-5px_-5px_10px_rgba(30,30,46,0.8)] border-none rounded-xl' : 'bg-[#e0e5ec] shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)] border-none rounded-xl') : (isDark ? 'bg-zinc-900' : 'bg-slate-100')}`}>
                        {/* 添加任务表单 - 日常任务 */}
                        {manageTaskTab === 'daily' && (
                            <div className={`p-3 border border-dashed rounded mb-4 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none rounded-lg' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none rounded-lg') : (isDark ? 'border-zinc-700 bg-zinc-900/50' : 'border-slate-300 bg-slate-50')}`}>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>任务标题</label><input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className={`w-full py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} placeholder="输入日常任务标题..." /></div>
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>任务属性</label>
                                        <select 
                                            value={newTaskAttr} 
                                            onChange={e => setNewTaskAttr(e.target.value as AttributeTypeValue)} 
                                            className={`w-full py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`}
                                        >
                                            <option value={AttributeType.STRENGTH}>力量</option>
                                            <option value={AttributeType.INTELLIGENCE}>智力</option>
                                            <option value={AttributeType.DISCIPLINE}>自律</option>
                                            <option value={AttributeType.CREATIVITY}>创造</option>
                                            <option value={AttributeType.SOCIABILITY}>社交</option>
                                            <option value={AttributeType.WEALTH}>财富</option>
                                        </select>
                                    </div>
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>金币奖励</label><input type="number" value={newTaskReward} onChange={e => setNewTaskReward(e.target.value)} className={`w-full py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} /></div>
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>XP 奖励</label><input type="number" value={newTaskXP} onChange={e => setNewTaskXP(e.target.value)} className={`w-full py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} /></div>
                                </div>
                                <button 
                                    onClick={() => {
                                        if(newTaskTitle.trim()) {
                                            onAddHabit(newTaskTitle, parseInt(newTaskReward) || 15, newTaskAttr);
                                            setNewTaskTitle('');
                                            setNewTaskReward('15');
                                            setNewTaskXP('20');
                                            setNewTaskAttr(AttributeType.WEALTH);
                                        }
                                    }} 
                                    className={`w-full mt-3 py-2 text-xs text-white rounded flex items-center justify-center gap-2 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none text-emerald-400 hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none text-emerald-600 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') : 'bg-emerald-600 hover:bg-emerald-500'}`}
                                >
                                    <Plus size={14}/> 添加日常任务
                                </button>
                            </div>
                        )}
                        
                        {/* 添加任务表单 - 主线任务 */}
                        {manageTaskTab === 'main' && (
                            <div className={`p-3 border border-dashed rounded mb-4 ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none rounded-lg' : (isDark ? 'border-zinc-700 bg-zinc-900/50' : 'border-slate-300 bg-slate-50')}`}>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>任务标题</label><input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className={`w-full py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} placeholder="输入主线任务标题..." /></div>
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>任务属性</label>
                                        <select 
                                            value={newTaskAttr} 
                                            onChange={e => setNewTaskAttr(e.target.value as AttributeTypeValue)} 
                                            className={`w-full py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`}
                                        >
                                            <option value={AttributeType.STRENGTH}>力量</option>
                                            <option value={AttributeType.INTELLIGENCE}>智力</option>
                                            <option value={AttributeType.DISCIPLINE}>自律</option>
                                            <option value={AttributeType.CREATIVITY}>创造</option>
                                            <option value={AttributeType.SOCIABILITY}>社交</option>
                                            <option value={AttributeType.WEALTH}>财富</option>
                                        </select>
                                    </div>
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>金币奖励</label><input type="number" value={newTaskReward} onChange={e => setNewTaskReward(e.target.value)} className={`w-full py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} /></div>
                                    <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>XP 奖励</label><input type="number" value={newTaskXP} onChange={e => setNewTaskXP(e.target.value)} className={`w-full py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} /></div>
                                </div>
                                
                                {/* 子任务列表 */}
                                <div className="mb-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>子任务</label>
                                        <button 
                                            onClick={() => {
                                                setEditingProjectSubTasks([...editingProjectSubTasks, {
                                                    id: `sub-${Date.now()}`,
                                                    title: '',
                                                    completed: false,
                                                    duration: 30
                                                }]);
                                            }}
                                            className={`text-xs text-white px-3 py-1 rounded flex items-center gap-1 ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none text-blue-600 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]' : 'bg-blue-600 hover:bg-blue-500'}`}
                                        >
                                            <Plus size={12}/> 添加子任务
                                        </button>
                                    </div>
                                    
                                    {editingProjectSubTasks.map((subTask, index) => (
                                        <div key={subTask.id} className="flex gap-2 items-start mb-2">
                                            <input 
                                                type="text" 
                                                value={subTask.title} 
                                                onChange={(e) => {
                                                    const newSubTasks = [...editingProjectSubTasks];
                                                    newSubTasks[index] = { ...newSubTasks[index], title: e.target.value };
                                                    setEditingProjectSubTasks(newSubTasks);
                                                }} 
                                                placeholder={`子任务 ${index + 1} 标题...`} 
                                                className={`flex-1 py-1 outline-none ${textMain} ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2' : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} 
                                            />
                                            <input 
                                                type="number" 
                                                value={subTask.duration} 
                                                onChange={(e) => {
                                                    const newSubTasks = [...editingProjectSubTasks];
                                                    newSubTasks[index] = { ...newSubTasks[index], duration: parseInt(e.target.value) || 30 };
                                                    setEditingProjectSubTasks(newSubTasks);
                                                }} 
                                                placeholder="时长(m)" 
                                                className={`w-20 py-1 outline-none ${textMain} ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2 text-right' : (isDark ? 'bg-transparent border-zinc-700 text-right' : 'bg-transparent border-slate-300 text-right')}`} 
                                            />
                                            <button 
                                                onClick={() => {
                                                    setEditingProjectSubTasks(editingProjectSubTasks.filter((_, i) => i !== index));
                                                }}
                                                className={`p-1 ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none rounded text-red-500 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]' : 'text-red-500 hover:text-red-400'}`}
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        if(newTaskTitle.trim() && editingProjectSubTasks.length > 0) {
                                            onAddProject({
                                                id: `project-${Date.now()}`,
                                                name: newTaskTitle,
                                                attr: newTaskAttr,
                                                subTasks: editingProjectSubTasks,
                                                dailyFocus: {},
                                                completed: false
                                            });
                                            setNewTaskTitle('');
                                            setNewTaskReward('15');
                                            setNewTaskXP('20');
                                            setNewTaskAttr(AttributeType.WEALTH);
                                            setEditingProjectSubTasks([]);
                                        }
                                    }} 
                                    className={`w-full mt-3 py-2 text-xs text-white rounded flex items-center justify-center gap-2 ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none text-emerald-600 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                                >
                                    <Plus size={14}/> 添加主线任务
                                </button>
                            </div>
                        )}
                        
                        {/* 添加任务表单 - 命运骰子任务 */}
                        {manageTaskTab === 'random' && (
                            <div className="space-y-4">
                                {/* 分类选择 */}
                                <div className={`p-3 border border-dashed rounded ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none rounded-lg' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none rounded-lg') : (isDark ? 'border-zinc-700 bg-zinc-900/50' : 'border-slate-300 bg-slate-50')}`}>

                                    <div className="flex gap-2 mb-4">
                                        {[
                                            { id: 'health', label: '健康微行动', color: 'emerald' },
                                            { id: 'efficiency', label: '效率任务', color: 'blue' },
                                            { id: 'leisure', label: '休闲小奖励', color: 'purple' }
                                        ].map((category) => {
                                            return (
                                            <button 
                                                key={category.id}
                                                onClick={() => {
                                                    // 设置当前分类
                                                    const categorySelect = document.getElementById('diceCategory') as HTMLSelectElement;
                                                    if (categorySelect) {
                                                        categorySelect.value = category.id;
                                                    }
                                                }}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${getButtonStyle(false)}`}
                                            >
                                                {category.label}
                                            </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                        <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>任务标题</label><input value={newChallengeText} onChange={e => setNewChallengeText(e.target.value)} className={`w-full py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} placeholder="输入命运事件..." /></div>
                                        <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>事件分类</label>
                                            <select 
                                                id="diceCategory"
                                                className={`w-full py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`}
                                            >
                                                <option value="health">健康微行动</option>
                                                <option value="efficiency">效率任务</option>
                                                <option value="leisure">休闲小奖励</option>
                                            </select>
                                        </div>
                                        <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>任务属性</label>
                                            <select 
                                                id="randomAttr"
                                                value={newTaskAttr} 
                                                onChange={e => setNewTaskAttr(e.target.value as AttributeTypeValue)} 
                                                className={`w-full py-1 outline-none ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2 text-zinc-200' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2 text-zinc-700') : (isDark ? 'bg-transparent border-zinc-700 text-zinc-200' : 'bg-transparent border-slate-300 text-slate-700')}`}
                                            >
                                                <option value={AttributeType.STRENGTH}>力量</option>
                                                <option value={AttributeType.INTELLIGENCE}>智力</option>
                                                <option value={AttributeType.DISCIPLINE}>自律</option>
                                                <option value={AttributeType.CREATIVITY}>创造</option>
                                                <option value={AttributeType.SOCIABILITY}>社交</option>
                                                <option value={AttributeType.WEALTH}>财富</option>
                                            </select>
                                        </div>
                                        <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>金币奖励</label><input type="number" id="randomReward" value="20" className={`w-full py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} /></div>
                                        <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>预估时长(m)</label><input type="number" id="randomDuration" value="20" className={`w-full py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} /></div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if(newChallengeText.trim()) {
                                                const categorySelect = document.getElementById('diceCategory') as HTMLSelectElement;
                                                const reward = parseInt((document.getElementById('randomReward') as HTMLInputElement).value) || 20;
                                                const duration = parseInt((document.getElementById('randomDuration') as HTMLInputElement).value) || 20;
                                                const attr = (document.getElementById('randomAttr') as HTMLSelectElement).value as AttributeTypeValue;
                                                
                                                const newTask = {
                                                    text: newChallengeText,
                                                    gold: reward,
                                                    xp: Math.ceil(reward * 1.5),
                                                    duration: duration,
                                                    attr: attr,
                                                    category: categorySelect?.value || 'health' // 添加分类信息
                                                };
                                                
                                                setChallengePool([...challengePool, JSON.stringify(newTask)]);
                                                setNewChallengeText('');
                                                
                                                // 重置表单
                                                if (categorySelect) categorySelect.value = 'health';
                                                (document.getElementById('randomReward') as HTMLInputElement).value = '20';
                                                (document.getElementById('randomDuration') as HTMLInputElement).value = '20';
                                                (document.getElementById('randomAttr') as HTMLSelectElement).value = AttributeType.WEALTH;
                                            }
                                        }} 
                                        className={`w-full mt-3 py-2 text-xs rounded flex items-center justify-center gap-2 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none text-purple-400 hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none text-purple-600 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
                                    >
                                        <Plus size={14}/> 添加命运事件
                                    </button>
                                </div>
                            </div>
                        )}
                        

                        
                        {/* 现有任务列表 */}
                        <div className="space-y-2">
                            {manageTaskTab === 'daily' && habits.map((h) => (
                                <div key={h.id} className={`flex items-center justify-between p-2 rounded ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none rounded-lg' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none rounded-lg') : (isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50')}`}>
                                    <span className={`text-xs ${textMain}`}>{h.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => { openEditTask({...h, text:h.name, type:'daily', gold:h.reward}); setIsManageTasksOpen(false); }} className={`${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] border-none rounded text-blue-400 hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(30,30,46,0.7)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(30,30,46,0.7)] p-1' : 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] border-none rounded text-blue-500 hover:shadow-[1px_1px_3px_rgba(163,177,198,0.6),-1px_-1px_3px_rgba(255,255,255,1)] active:shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)] p-1') : 'text-blue-500 hover:text-blue-400'}`}><Edit3 size={14}/></button>
                                        <button onClick={() => onDeleteHabit(h.id)} className={`${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] border-none rounded text-red-400 hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(30,30,46,0.7)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(30,30,46,0.7)] p-1' : 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] border-none rounded text-red-500 hover:shadow-[1px_1px_3px_rgba(163,177,198,0.6),-1px_-1px_3px_rgba(255,255,255,1)] active:shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)] p-1') : 'text-red-500 hover:text-red-400'}`}><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                            {manageTaskTab === 'main' && projects.map((p) => (
                                <div key={p.id} className={`flex items-center justify-between p-2 rounded ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none rounded-lg' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none rounded-lg') : (isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50')}`}>
                                    <span className={`text-xs ${textMain}`}>{p.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => { openEditTask({...p, text:p.name, type:'main', gold:500}); setIsManageTasksOpen(false); }} className={`${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] border-none rounded text-blue-400 hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(30,30,46,0.7)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(30,30,46,0.7)] p-1' : 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] border-none rounded text-blue-500 hover:shadow-[1px_1px_3px_rgba(163,177,198,0.6),-1px_-1px_3px_rgba(255,255,255,1)] active:shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)] p-1') : 'text-blue-500 hover:text-blue-400'}`}><Edit3 size={14}/></button>
                                        <button onClick={() => onDeleteProject(p.id)} className={`${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] border-none rounded text-red-400 hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(30,30,46,0.7)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(30,30,46,0.7)] p-1' : 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] border-none rounded text-red-500 hover:shadow-[1px_1px_3px_rgba(163,177,198,0.6),-1px_-1px_3px_rgba(255,255,255,1)] active:shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)] p-1') : 'text-red-500 hover:text-red-400'}`}><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                            {manageTaskTab === 'random' && (
                                <>
                                    {/* 分类任务列表 */}
                                    {[
                                        { id: 'health', label: '健康微行动', color: 'emerald' },
                                        { id: 'efficiency', label: '效率任务', color: 'blue' },
                                        { id: 'leisure', label: '休闲小奖励', color: 'purple' },
                                        { id: 'other', label: '未分类', color: 'gray' }
                                    ].filter(category => activeDiceCategory === 'all' || category.id === activeDiceCategory)
                                    .map(category => {
                                        // 筛选该分类的任务
                                        const categoryTasks = challengePool.filter(task => {
                                            try {
                                                const parsedTask = JSON.parse(task);
                                                return parsedTask.category === category.id || (category.id === 'other' && !parsedTask.category);
                                            } catch (e) {
                                                return category.id === 'other';
                                            }
                                        });
                                        
                                        if (categoryTasks.length === 0) return null;
                                        
                                        return (
                                            <div key={category.id} className="mb-4">
                                                <h4 className={`text-sm font-bold mb-2 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 bg-${category.color}-500`}></span>
                                                    {category.label} ({categoryTasks.length})
                                                </h4>
                                                <div className="space-y-2">
                                                    {categoryTasks.map((taskStr, idx) => {
                                                        let taskText = taskStr;
                                                        let taskCategory = category.id;
                                                        let taskReward = 20;
                                                        let taskDuration = 20;
                                                        let taskAttr = AttributeType.WEALTH;
                                                        
                                                        try {
                                                            const parsedTask = JSON.parse(taskStr);
                                                            taskText = parsedTask.text;
                                                            taskCategory = parsedTask.category || 'other';
                                                            taskReward = parsedTask.gold || 20;
                                                            taskDuration = parsedTask.duration || 20;
                                                            taskAttr = parsedTask.attr || AttributeType.WEALTH;
                                                        } catch (e) {
                                                            // 旧格式，直接使用字符串
                                                        }
                                                        
                                                        return (
                                                            <div key={idx} className={`flex items-center justify-between p-2 rounded ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none rounded-lg' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none rounded-lg') : (isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50')}`}>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-xs ${textMain}`}>{taskText}</span>
                                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full bg-${category.color}-100 text-${category.color}-700 ${isDark ? 'bg-' + category.color + '-900/30 text-' + category.color + '-400' : ''}`}>
                                                                        {category.label}
                                                                    </span>
                                                                    <span className={`text-[9px] text-zinc-500`}>+{taskReward}G</span>
                                                                    <span className={`text-[9px] text-zinc-500`}>{taskDuration}m</span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button 
                                                                        onClick={() => {
                                                                            // 编辑任务
                                                                            const parsedTask = JSON.parse(taskStr);
                                                                            setNewChallengeText(parsedTask.text);
                                                                            setNewTaskAttr(parsedTask.attr || AttributeType.WEALTH);
                                                                            
                                                                            // 设置表单值
                                                                            const categorySelect = document.getElementById('diceCategory') as HTMLSelectElement;
                                                                            const rewardInput = document.getElementById('randomReward') as HTMLInputElement;
                                                                            const durationInput = document.getElementById('randomDuration') as HTMLInputElement;
                                                                            const attrSelect = document.getElementById('randomAttr') as HTMLSelectElement;
                                                                            
                                                                            if (categorySelect) categorySelect.value = parsedTask.category || 'health';
                                                                            if (rewardInput) rewardInput.value = (parsedTask.gold || 20).toString();
                                                                            if (durationInput) durationInput.value = (parsedTask.duration || 20).toString();
                                                                            if (attrSelect) attrSelect.value = parsedTask.attr || AttributeType.WEALTH;
                                                                            
                                                                            // 删除旧任务
                                                                            setChallengePool(challengePool.filter((_, i) => i !== idx));
                                                                        }}
                                                                        className={`${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] border-none rounded text-blue-400 hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(30,30,46,0.7)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(30,30,46,0.7)] p-1' : 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] border-none rounded text-blue-500 hover:shadow-[1px_1px_3px_rgba(163,177,198,0.6),-1px_-1px_3px_rgba(255,255,255,1)] active:shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)] p-1') : 'text-blue-500 hover:text-blue-400'}`}
                                                                    >
                                                                        <Edit3 size={14}/>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setChallengePool(challengePool.filter((_, i) => i !== idx))}
                                                                        className={`${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] border-none rounded text-red-400 hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(30,30,46,0.7)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(30,30,46,0.7)] p-1' : 'bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] border-none rounded text-red-500 hover:shadow-[1px_1px_3px_rgba(163,177,198,0.6),-1px_-1px_3px_rgba(255,255,255,1)] active:shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)] p-1') : 'text-red-500 hover:text-red-400'}`}
                                                                    >
                                                                        <Trash2 size={14}/>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Edit Task Modal */}
        {isAddTaskOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                <div className={`w-full max-w-md p-6 rounded-2xl border ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)] border-none' : 'bg-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] border-none') : (isDark ? 'bg-zinc-900 shadow-xl' : 'bg-white shadow-xl')}`}>
                    <h3 className={`font-bold mb-4 ${textMain}`}>{editingTaskId ? '编辑任务' : '部署新任务'}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className={`text-[10px] uppercase font-bold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>任务标题</label>
                            <input autoFocus value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className={`w-full border-b py-2 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} placeholder="输入任务名称..." />
                        </div>
                        {(newTaskType === 'daily' || newTaskType === 'main') && (
                            <div className="grid grid-cols-4 gap-4">
                                <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>任务属性</label>
                                    <select 
                                        value={newTaskAttr} 
                                        onChange={e => setNewTaskAttr(e.target.value as AttributeTypeValue)} 
                                        className={`w-full border-b py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-1' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-1') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`}
                                    >
                                        <option value={AttributeType.STRENGTH}>力量</option>
                                        <option value={AttributeType.INTELLIGENCE}>智力</option>
                                        <option value={AttributeType.DISCIPLINE}>自律</option>
                                        <option value={AttributeType.CREATIVITY}>创造</option>
                                        <option value={AttributeType.SOCIABILITY}>社交</option>
                                        <option value={AttributeType.WEALTH}>财富</option>
                                    </select>
                                </div>
                                <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>金币奖励</label><input type="number" value={newTaskReward} onChange={e => setNewTaskReward(e.target.value)} className={`w-full border-b py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-1' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-1') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} /></div>
                                <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>XP 奖励</label><input type="number" value={newTaskXP} onChange={e => setNewTaskXP(e.target.value)} className={`w-full border-b py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-1' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-1') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} /></div>
                                <div><label className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>预估时长(m)</label><input type="number" value={newTaskDuration} onChange={e => setNewTaskDuration(e.target.value)} className={`w-full border-b py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-1' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-1') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} /></div>
                            </div>
                        )}
                        
                        {newTaskType === 'main' && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className={`text-[10px] uppercase font-bold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>子任务</label>
                                    <button 
                                        onClick={() => {
                                            setEditingProjectSubTasks([...editingProjectSubTasks, {
                                                id: `sub-${Date.now()}`,
                                                title: '',
                                                completed: false,
                                                duration: 30
                                            }]);
                                        }}
                                        className={`text-xs px-3 py-1 rounded flex items-center gap-1 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none text-blue-400 hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none text-blue-600 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                                    >
                                        <Plus size={12}/> 添加子任务
                                    </button>
                                </div>
                                
                                {editingProjectSubTasks.map((subTask, index) => (
                                    <div key={subTask.id} className="flex gap-2 items-start">
                                        <input 
                                            type="text" 
                                            value={subTask.title} 
                                            onChange={(e) => {
                                                const newSubTasks = [...editingProjectSubTasks];
                                                newSubTasks[index] = { ...newSubTasks[index], title: e.target.value };
                                                setEditingProjectSubTasks(newSubTasks);
                                            }} 
                                            placeholder={`子任务 ${index + 1} 标题...`} 
                                            className={`flex-1 border-b py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-1' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-1') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}`} 
                                        />
                                        <input 
                                            type="number" 
                                            value={subTask.duration} 
                                            onChange={(e) => {
                                                const newSubTasks = [...editingProjectSubTasks];
                                                newSubTasks[index] = { ...newSubTasks[index], duration: parseInt(e.target.value) || 30 };
                                                setEditingProjectSubTasks(newSubTasks);
                                            }} 
                                            placeholder="时长(m)" 
                                            className={`w-20 border-b py-1 outline-none ${textMain} ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-1' : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-1') : (isDark ? 'bg-transparent border-zinc-700' : 'bg-transparent border-slate-300')}${isDark ? ' text-right' : ' text-right'}`} 
                                        />
                                        <button 
                                            onClick={() => {
                                                setEditingProjectSubTasks(editingProjectSubTasks.filter((_, i) => i !== index));
                                            }}
                                            className={`p-1 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none rounded text-red-400 hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none rounded text-red-500 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') : 'text-red-500 hover:text-red-400'}`}
                                        >
                                            <Trash2 size={14}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setIsAddTaskOpen(false)} className={`px-4 py-2 text-xs ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'text-zinc-300 bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none rounded hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'text-zinc-700 bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none rounded hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') : 'text-zinc-500 hover:text-white'}`}>取消</button>
                            <button onClick={editingTaskId ? handleSaveEditTask : handleAddNewTask} className={`px-6 py-2 rounded font-bold text-xs ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none text-white hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none text-blue-600 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)]') : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>确认部署</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Edit Item Modal */}
        {isEditItemOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                <div className={`w-full max-w-2xl p-4 sm:p-6 rounded-2xl sm:rounded-[48px] border bg-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] overflow-y-auto max-h-[90vh] transition-all duration-300 relative ${isNeomorphicDark ? '!bg-[#1e1e2e] !shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)]' : ''}`}>
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h3 className={`font-bold ${isNeomorphicDark ? 'text-white' : 'text-zinc-800'}`}>{editingItem.id ? '编辑商品' : '添加新商品'}</h3>
                        <button 
                            onClick={() => setIsEditItemOpen(false)}
                            className={`p-2 rounded-full transition-all ${isNeomorphic ? (isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.6),-5px_-5px_10px_rgba(30,30,46,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.5),-3px_-3px_6px_rgba(30,30,46,1)] active:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.6),inset_-5px_-5px_10px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]') : 'hover:bg-slate-100'}`}
                        >
                            <X size={16} className={`${isNeomorphicDark ? 'text-white' : 'text-zinc-800'}`} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-500">商品名称</label>
                            <input 
                                autoFocus 
                                value={editingItem.name} 
                                onChange={e => setEditingItem(prev => ({...prev, name: e.target.value}))} 
                                className={`w-full bg-transparent border-b py-2 outline-none ${isNeomorphicDark ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800'}`} 
                                placeholder="输入商品名称..." 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-500">商品描述</label>
                            <input 
                                value={editingItem.description} 
                                onChange={e => setEditingItem(prev => ({...prev, description: e.target.value}))} 
                                className={`w-full bg-transparent border-b py-2 outline-none ${isNeomorphicDark ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800'}`} 
                                placeholder="输入商品描述..." 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-500">商品价格 (元)</label>
                            <input 
                                type="number" 
                                value={editingItem.cost} 
                                onChange={e => setEditingItem(prev => ({...prev, cost: parseInt(e.target.value) || 0}))} 
                                className={`w-full bg-transparent border-b py-2 outline-none ${isNeomorphicDark ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800'}`} 
                                placeholder="输入商品价格..." 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-500">商品图片链接</label>
                            <input 
                                value={editingItem.image || ''} 
                                onChange={e => setEditingItem(prev => ({...prev, image: e.target.value}))} 
                                className={`w-full bg-transparent border-b py-2 outline-none ${isNeomorphicDark ? 'border-zinc-600 text-white' : 'border-zinc-700 text-zinc-800'}`} 
                                placeholder="输入图片链接或本地路径..." 
                            />
                            <p className="text-[8px] text-zinc-500 mt-1">支持本地文件路径（如 /images/product.jpg）或在线图床链接</p>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button 
                                onClick={() => setIsEditItemOpen(false)} 
                                className={`px-4 py-2 rounded-xl sm:rounded-[24px] transition-all font-medium ${isNeomorphic ? (isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.6),-5px_-5px_10px_rgba(30,30,46,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.5),-3px_-3px_6px_rgba(30,30,46,1)] active:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.6),inset_-5px_-5px_10px_rgba(30,30,46,0.8)] text-zinc-300' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)] text-zinc-800') : 'text-zinc-500 hover:text-white'}`}
                            >
                                取消
                            </button>
                            <button 
                                onClick={handleEditItemSave} 
                                className={`px-4 py-2 rounded-xl sm:rounded-[24px] transition-all font-medium ${isNeomorphic ? (isNeomorphicDark ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.6),-5px_-5px_10px_rgba(30,30,46,0.8)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.5),-3px_-3px_6px_rgba(30,30,46,1)] active:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.6),inset_-5px_-5px_10px_rgba(30,30,46,0.8)] text-white' : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)] text-white') : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                            >
                                确认保存
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        
    </div>
  );
};

export default LifeGame;