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
  const [is