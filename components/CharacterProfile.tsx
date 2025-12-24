import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Smile, Pause, Play, RotateCcw, Volume2, VolumeX, CloudRain, Waves, BrainCircuit, Trees, Maximize2, X, HelpCircle, List, Sparkles, Save, Edit3, Trash2, Plus, Coins, Target, Monitor, Coffee, Moon, Star, Crosshair, Gift } from 'lucide-react';
import { Theme } from '../types';
import AvatarProfile from './shared/AvatarProfile';
import TomatoTimer from './shared/TomatoTimer';
import MilitaryModule from './shared/MilitaryModule';
import MantraModule from './shared/MantraModule';

interface CharacterProfileProps {
  theme: Theme;
  xp: number;
  balance: number;
  totalHours: number;
  totalKills?: number; 
  checkInStreak?: number;
  onPomodoroComplete?: (minutes: number) => void;
  onUpdateBalance?: (amount: number, reason: string) => void;
  // Pomodoro Global State
  timeLeft: number;
  isActive: boolean;
  duration: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onChangeDuration: (minutes: number) => void;
  onUpdateTimeLeft: (seconds: number) => void;
  onUpdateIsActive: (active: boolean) => void;
  onImmersiveModeChange?: (isImmersive: boolean) => void;
  // Audio Management
  isMuted: boolean;
  currentSoundId: string;
  setIsMuted: (muted: boolean) => void;
  setCurrentSoundId: (soundId: string) => void;
}

export interface CharacterProfileHandle {
    startTimer: (minutes: number) => void;
}

// --- LEVEL & THRESHOLD CONSTANTS - 移到组件外部 ---
export const LEVEL_THRESHOLDS = [
    { min: 0, title: '初入迷雾' }, { min: 200, title: '觉醒者' }, { min: 500, title: '破壁人' }, { min: 1000, title: '追光者' },
    { min: 2000, title: '逆行者' }, { min: 3500, title: '破风者' }, { min: 5000, title: '执剑人' }, { min: 8000, title: '守望者' },
    { min: 12000, title: '开拓者' }, { min: 18000, title: '领航员' }, { min: 25000, title: '超凡者' }, { min: 35000, title: '入圣者' },
    { min: 50000, title: '半神' }, { min: 75000, title: '真神' }, { min: 100000, title: '星灵' }, { min: 150000, title: '维度行者' },
    { min: 250000, title: '造物主' }, { min: 500000, title: '不可名状' }
];

export const FOCUS_THRESHOLDS = [{min:5,title:'初尝定力'},{min:15,title:'心无旁骛'},{min:30,title:'雷厉风行'},{min:50,title:'渐入佳境'},{min:80,title:'全神贯注'},{min:120,title:'深度沉浸'},{min:180,title:'心流学徒'},{min:250,title:'意念合一'},{min:350,title:'钢铁意志'},{min:500,title:'不动如山'},{min:700,title:'绝对领域'},{min:1000,title:'时间掌控者'},{min:1500,title:'卷王之王'},{min:2000,title:'天人合一'},{min:3000,title:'出神入化'},{min:5000,title:'破碎虚空'},{min:8000,title:'维度飞升'},{min:10000,title:'时间领主'}];

export const WEALTH_THRESHOLDS = [{min:50,title:'吃土少年'},{min:150,title:'泡面搭档'},{min:300,title:'温饱及格'},{min:500,title:'奶茶自由'},{min:800,title:'外卖不看价'},{min:1500,title:'疯狂周四赞助商'},{min:2500,title:'菜市场自由'},{min:4000,title:'初级工薪'},{min:6000,title:'高级打工人'},{min:10000,title:'超市贵族'},{min:20000,title:'小康之家'},{min:50000,title:'中产阶级'},{min:100000,title:'全款买车'},{min:250000,title:'财务自由'},{min:500000,title:'资本新贵'},{min:1000000,title:'城市首富'},{min:5000000,title:'资本巨鳄'},{min:10000000,title:'富可敌国'}];

export const MILITARY_THRESHOLDS = [{min:0,title:'平民'},{min:5,title:'列兵'},{min:15,title:'上等兵'},{min:30,title:'下士'},{min:50,title:'中士'},{min:80,title:'上士'},{min:120,title:'少尉'},{min:180,title:'中尉'},{min:250,title:'上尉'},{min:350,title:'少校'},{min:500,title:'中校'},{min:700,title:'上校'},{min:1000,title:'少将'},{min:1500,title:'中将'},{min:2000,title:'上将'},{min:3000,title:'元帅'},{min:5000,title:'战神'}];

// --- CONSTANTS ---
export const XP_PER_LEVEL = 200;

// --- FUNCTIONS ---
export const getAllLevels = () => LEVEL_THRESHOLDS;
export const getAllFocusTitles = () => FOCUS_THRESHOLDS;
export const getAllWealthTitles = () => WEALTH_THRESHOLDS;
export const getAllMilitaryRanks = () => MILITARY_THRESHOLDS;

// 简化组件定义，避免复杂的泛型语法
const CharacterProfile = forwardRef(function CharacterProfile(props, ref) {
    const {
        theme,
        xp,
        balance,
        totalHours,
        totalKills = 0,
        checkInStreak = 0,
        onPomodoroComplete = undefined,
        onUpdateBalance = undefined,
        // Pomodoro Global State
        timeLeft,
        isActive,
        duration,
        onToggleTimer,
        onResetTimer,
        onChangeDuration,
        onUpdateTimeLeft,
        onUpdateIsActive,
        onImmersiveModeChange = undefined,
        // Audio Management
        isMuted,
        currentSoundId,
        setIsMuted,
        setCurrentSoundId
    } = props;
    const isDark = theme === 'dark';
    const isNeomorphic = theme === 'neomorphic';
    const cardBg = isNeomorphic 
        ? 'bg-[#e0e5ec] border-[#e0e5ec] rounded-lg shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] transition-all duration-300' 
        : isDark 
        ? 'bg-zinc-900 border-zinc-800' 
        : 'bg-white border-slate-200';
    const textMain = isDark ? 'text-zinc-100' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';
    
    // --- MANTRA SYSTEM LOGIC ---
    const [mantras, setMantras] = useState<string[]>([
        "熵增是宇宙的法则，进化是生命的逆袭。",
        "不主动痛苦，就会被动受苦。",
        "混乱是阶梯，但只有对于有秩序的人来说。",
        "反本能即是自由。",
        "舒适区是你的坟墓，温水煮青蛙是最大的骗局。",
        "每日做一件让你手心出汗的事。",
        "肉体是精神的圣殿，不要让它变成废墟。",
        "所有的拖延都是对死亡的恐惧。",
        "极度自律，绝对自由。",
        "痛苦是软弱离开身体的过程。",
        "把每一天当成最后一天来活，把每一天当成第一天来学。",
        "即使在泥潭中，也要仰望星空。",
        "无论你做什么，时间都会流逝，不如让它流得有价值。",
        "杀不死你的，终将使你更强大。",
        "只要你不跪下，这个世界就没人能比你高。",
        "在这个美丽而残酷的世界，你需要利牙，也需要盔甲。",
        "不要在奋斗的年纪选择安逸。",
        "将军赶路，不打小兔。",
        "战略的本质是舍弃。",
        "与其更好，不如不同。",
        "沉没成本不是成本，是教训。",
        "悲观者往往正确，乐观者往往成功。",
        "做正确的事，把事情做对。",
        "以慢为快，以退为进。",
        "不要用战术的勤奋掩盖战略的懒惰。",
        "简单粗暴有效 > 精致复杂无用。",
        "选择大于努力，认知决定选择。",
        "在炮火中做决策，在信息不全时下赌注。",
        "复盘是翻盘的唯一机会。",
        "永远保留30%的冗余。",
        "不要为了解决一个问题，制造出三个新问题。",
        "真正的决策，都在两难之间。",
        "大多数人为了避免思考，愿意做任何事。",
        "长期主义是普通人唯一的红利。",
        "复利是世界第八大奇迹，前提是活着。",
        "要做时间的朋友，不要做时间的炮灰。",
        "地图不是疆域。",
        "第一性原理：回归事物最基本的真理。",
        "奥卡姆剃刀：若无必要，勿增实体。",
        "达克效应：无知者无畏，博学者谦卑。",
        "幸存者偏差：死人不会说话。",
        "墨菲定律：凡是可能出错的事，一定会出错。",
        "黑天鹅：未知的未知最可怕。",
        "反脆弱：从混乱中获益。",
        "二八法则：20%的投入决定80%的产出。",
        "熵减思维：建立秩序，对抗耗散。",
        "批判性思维：大胆假设，小心求证。",
        "灰度思维：世界不是非黑即白。",
        "系统思维：看见树木，更看见森林。",
        "复利思维：每天进步1%。",
        "概率思维：用不确定性博取确定性。",
        "逆向思维：如果我知道我会死在哪里，我就永远不去那里。",
        "跨界思维：创新往往发生在边缘。",
        "多元思维模型：掌握不同学科的基本原理，才能更好地理解世界。",
        "贝叶斯定理：根据新信息不断更新你的信念。",
        "机会成本：选择意味着放弃其他可能性。",
        "边际效用递减：随着投入的增加，每增加一单位投入所带来的产出会减少。",
        "反馈循环：正反馈会放大结果，负反馈会稳定系统。",
        "临界质量：当达到一定规模后，系统会发生质的变化。",
        "路径依赖：过去的选择会影响未来的选择。",
        "完成比完美更重要。",
        "烂开始好过不开始。",
        "想，都是问题；做，才是答案。",
        "所有的伟大，都源于一个勇敢的开始。",
        "一万小时定律：天才在于积累。",
        "刻意练习：走出舒适区，专注于弱点，获得反馈。",
        "像机器一样执行，像艺术家一样思考。",
        "没有撤退可言。",
        "唯一的轻松日子是昨天。",
        "汗水节约鲜血。",
        "借口是弱者的墓志铭。",
        "由于恐惧而犹豫，由于犹豫而失败。",
        "天下武功，唯快不破。",
        "执行力是拉开人与人差距的关键。",
        "不要假装努力，结果不会陪你演戏。",
        "此时此刻，非你莫属。",
        "只有偏执狂才能生存。",
        "行动是消除焦虑的最好方法。",
        "每一个微小的行动，都是向目标靠近的一步。",
        "成功是过程，不是结果。",
        "坚持做你认为正确的事，即使没有人理解。",
        "速度第一，完美第二。",
        "先开枪，再瞄准。",
        "不要等准备好了再行动，行动会让你变得更好。",
        "真正的成长，是认知不断被颠覆的过程。",
        "你无法改变环境，但可以改变对环境的反应。",
        "决定你人生高度的，是你对自己的要求。",
        "优秀是一种习惯，卓越是一种选择。",
        "思维模型是你认知世界的地图，地图越精确，决策越明智。",
        "把复杂的问题简单化，是一种高级智慧。",
        "每一个困难，都是你认知升级的机会。",
        "你的注意力，是你最宝贵的资源。",
        "成功的秘诀，是在一件事上做到极致。",
        "真正的自由，是你可以选择不做什么。",
        "人生没有彩排，每一刻都是现场直播。",
        "你对世界的认知，决定了你能走多远。",
        "抱怨解决不了问题，行动才能改变现状。",
        "成长的本质，是突破舒适区。",
        "优秀的人，都有自己的原则和底线。",
        "世界上没有绝对的对错，只有不同的视角。",
        "你的情绪，是你内心世界的投射。",
        "学会独处，是一个人成熟的标志。",
        "真正的强大，是内心的平静。",
        "知识的价值，在于应用。",
        "你的时间有限，不要为别人而活。",
        "每一个选择，都在塑造你的未来。",
        "你所经历的一切，都是你成长的肥料。",
        "真正的领导力，是影响力，不是权力。",
        "学会倾听，是沟通的关键。",
        "你的心态，决定了你的状态。",
        "世界上唯一不变的，就是变化。",
        "优秀的人，都懂得持续学习。",
        "你的格局，决定了你的结局。",
        "不要害怕失败，失败是成功之母。",
        "真正的幸福，是内心的满足。",
        "你的行动，是你价值观的体现。",
        "学会感恩，是一种生活态度。",
        "优秀的人，都有很强的自律性。",
        "你的思维方式，决定了你的人生轨迹。",
        "真正的智慧，是知道自己不知道。",
        "你无法控制别人，但可以控制自己。",
        "每一个挑战，都是一次成长的机会。",
        "你的选择，决定了你的命运。",
        "今天的你，要比昨天的你更好。",
        "自律不是苦行，而是享受延迟满足的智慧。",
        "成长就是不断打破自己的认知边界。",
        "注意力在哪里，成果就在哪里。",
        "简单的事情重复做，重复的事情用心做。",
        "不要高估短期努力，也不要低估长期坚持。",
        "每一次失败，都是为成功积累经验。",
        "成功的人，都是时间管理大师。",
        "你的人生，由你的选择决定。",
        "勇敢地做自己，不要活在别人的期待里。",
        "不断学习，是对抗焦虑的最好方法。",
        "健康是1，其他都是0。",
        "与优秀的人同行，你会变得更优秀。",
        "行动是梦想与现实之间的桥梁。",
        "保持好奇心，永远对世界充满热情。",
        "感恩现在所拥有的一切。",
        "不要抱怨，而是积极寻找解决方案。",
        "每一个微小的进步，都值得庆祝。",
        "坚持做正确的事，时间会给你答案。",
        "相信自己，你比想象中更强大。",
        "放下过去，活在当下，展望未来。",
        "做一个对社会有价值的人。",
        "学会爱自己，才能更好地爱别人。",
        "保持谦逊，永远不要停止学习。",
        "生活不是等待风暴过去，而是学会在雨中跳舞。",
        "你的态度，决定了你的高度。",
        "努力工作，尽情享受生活。",
        "保持乐观，相信一切都会好起来。",
        "珍惜时间，因为它是最宝贵的资源。",
        "做一个有责任感的人。",
        "学会沟通，是人际关系的关键。",
        "保持耐心，成功需要时间。",
        "勇敢面对挑战，它们是成长的机会。",
        "做一个诚实守信的人。",
        "保持开放的心态，接受新事物。",
        "学会合作，团队的力量大于个人。",
        "保持专注，一次只做一件事。",
        "做一个有梦想的人，并为之努力奋斗。",
        "保持积极的心态，吸引更多美好事物。",
        "学会放松，给自己充电。",
        "做一个有品位的人。",
        "保持独立思考，不要随波逐流。",
        "做一个有爱心的人，帮助需要帮助的人。",
        "保持创新精神，不断探索新领域。",
        "做一个有远见的人，规划好自己的未来。",
        "学会理财，管理好自己的财富。",
        "保持健康的生活方式。",
        "做一个有文化素养的人。",
        "保持良好的人际关系。",
        "做一个有幽默感的人，生活更有趣。",
        "保持环保意识，保护我们的地球。",
        "做一个有勇气的人，敢于追求自己的梦想。",
        "保持学习的热情，不断提升自己。",
        "做一个有担当的人。",
        "保持自信，相信自己的能力。",
        "做一个有智慧的人，懂得取舍。",
        "保持善良，传递正能量。",
        "做一个有原则的人。",
        "保持活力，享受生活的美好。",
        "做一个有魅力的人。",
        "保持冷静，理性面对问题。",
        "做一个有影响力的人。",
        "保持热情，对生活充满热爱。",
        "做一个有创造力的人。",
        "保持坚韧，永不放弃。",
        "做一个有幸福感的人。",
    ]);
    const [currentMantraIndex, setCurrentMantraIndex] = useState(0);
    const [isMantraModalOpen, setIsMantraModalOpen] = useState(false);
    const [newMantraInput, setNewMantraInput] = useState('');
    const [editingMantraIndex, setEditingMantraIndex] = useState<number | null>(null);
    const [editingMantraValue, setEditingMantraValue] = useState('');

    const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false);
    const [isImmersive, setIsImmersive] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [isEditingBalance, setIsEditingBalance] = useState(false);
    const [tempBalance, setTempBalance] = useState(balance.toString());
    // Add real-time system time state
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    // Add mantra management state
    const [isAddingMantra, setIsAddingMantra] = useState(false);
    // Add audio ref for sound management
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // --- HELPER FUNCTIONS ---
    const getLevelInfo = (xp: number) => {
        let index = LEVEL_THRESHOLDS.findIndex(l => xp < l.min) - 1;
        if (index === -2) index = LEVEL_THRESHOLDS.length - 1; if (index < 0) index = 0;
        const current = LEVEL_THRESHOLDS[index]; const next = LEVEL_THRESHOLDS[index + 1];
        let progress = 100; if (next) progress = Math.max(0, Math.min(100, ((xp - current.min) / (next.min - current.min)) * 100));
        return { level: index + 1, progress, title: current.title, nextThreshold: next ? next.min : xp };
    };

    const getFocusInfo = (hours: number) => { let index = FOCUS_THRESHOLDS.findIndex(r => hours < r.min) - 1; if (index === -2) index = FOCUS_THRESHOLDS.length - 1; if (index < 0) index = 0; const current = FOCUS_THRESHOLDS[index]; const next = FOCUS_THRESHOLDS[index + 1]; let progress = 100; if (next) progress = Math.min(100, ((hours - current.min) / (next.min - current.min)) * 100); if (!current) return { title: '专注小白', level: 0, progress: (hours/5)*100, nextTitle: '初尝定力', value: hours }; return { title: current.title, level: index + 1, progress, nextTitle: next ? next.title : '无尽定力', value: hours }; };

    const getWealthInfo = (balance: number) => { let index = WEALTH_THRESHOLDS.findIndex(c => balance < c.min) - 1; if (index === -2) index = WEALTH_THRESHOLDS.length - 1; if (index < 0) index = 0; const current = WEALTH_THRESHOLDS[index]; const next = WEALTH_THRESHOLDS[index + 1]; let progress = 100; if (next) progress = Math.max(0, Math.min(100, ((balance - current.min) / (next.min - current.min)) * 100)); if (!current) return { title: '赛博乞丐', level: 0, progress: (balance/50)*100, value: balance }; return { title: current.title, level: index + 1, progress, value: balance }; };

    // --- SOUNDS ---
    const SOUNDS = [
        { id: 'forest', name: '迷雾森林', url: "https://assets.mixkit.co/active_storage/sfx/2441/2441-preview.mp3", icon: Trees, color: 'text-green-600', hex: '#16a34a' }, // 使用海浪声替代失效的森林声
        { id: 'alpha', name: '阿尔法波', url: "https://assets.mixkit.co/active_storage/sfx/243/243-preview.mp3", icon: Waves, color: 'text-purple-500', hex: '#a855f7' },
        { id: 'theta', name: '希塔波', url: "https://assets.mixkit.co/active_storage/sfx/244/244-preview.mp3", icon: CloudRain, color: 'text-emerald-500', hex: '#10b981' }, 
        { id: 'beta', name: '贝塔波', url: "https://assets.mixkit.co/active_storage/sfx/1126/1126-preview.mp3", icon: BrainCircuit, color: 'text-blue-500', hex: '#3b82f6' },
        { id: 'ocean', name: '海浪声', url: "https://assets.mixkit.co/active_storage/sfx/2441/2441-preview.mp3", icon: Waves, color: 'text-blue-600', hex: '#2563eb' },
        { id: 'rain', name: '雨声', url: "https://assets.mixkit.co/active_storage/sfx/2442/2442-preview.mp3", icon: CloudRain, color: 'text-gray-500', hex: '#6b7280' },
        { id: 'night', name: '夏夜虫鸣', url: "https://assets.mixkit.co/active_storage/sfx/2443/2443-preview.mp3", icon: Moon, color: 'text-indigo-600', hex: '#4f46e5' },
        { id: 'white-noise', name: '白噪音', url: "https://assets.mixkit.co/active_storage/sfx/2444/2444-preview.mp3", icon: Coffee, color: 'text-amber-500', hex: '#f59e0b' },
        { id: 'pink-noise', name: '粉红噪音', url: "https://assets.mixkit.co/active_storage/sfx/2445/2445-preview.mp3", icon: Coffee, color: 'text-rose-500', hex: '#ec4899' },
        { id: 'brown-noise', name: '布朗噪音', url: "https://assets.mixkit.co/active_storage/sfx/2446/2446-preview.mp3", icon: Coffee, color: 'text-orange-600', hex: '#ea580c' },
        { id: 'cafe', name: '咖啡馆环境', url: "https://assets.mixkit.co/active_storage/sfx/2447/2447-preview.mp3", icon: Coffee, color: 'text-amber-600', hex: '#d97706' },
        { id: 'fireplace', name: '壁炉声', url: "https://assets.mixkit.co/active_storage/sfx/2448/2448-preview.mp3", icon: Coffee, color: 'text-red-500', hex: '#ef4444' },
    ];

    const levelInfo = getLevelInfo(xp);
    const focusInfo = getFocusInfo(totalHours);
    const wealthInfo = getWealthInfo(balance);

    // Notify parent when immersive mode changes
    useEffect(() => {
        if (onImmersiveModeChange) {
            onImmersiveModeChange(isImmersive);
        }
    }, [isImmersive, onImmersiveModeChange]);

    useEffect(() => {
        const saved = localStorage.getItem('aes-global-mantras');
        if (saved) {
            try { setMantras(JSON.parse(saved)); } catch(e) {}
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('aes-global-mantras', JSON.stringify(mantras));
    }, [mantras]);

    // Auto-Rotate Mantra every 10s
    useEffect(() => {
        const timer = setInterval(() => {
            if (!isMantraModalOpen) {
                setCurrentMantraIndex(prev => (prev + 1) % mantras.length);
            }
        }, 10000);
        return () => clearInterval(timer);
    }, [mantras.length, isMantraModalOpen]);

    // Update current time every second for real-time display
    useEffect(() => {
        const timeInterval = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timeInterval);
    }, []);

    const cycleMantra = () => setCurrentMantraIndex(prev => (prev + 1) % mantras.length);

    // Timer Interface
    useImperativeHandle(ref, () => ({
        startTimer: (minutes: number) => {
            onChangeDuration(minutes);
            onUpdateTimeLeft(minutes * 60);
            onUpdateIsActive(true);
            setIsImmersive(true);
        }
    }));

    useEffect(() => { setTempBalance(balance.toString()); }, [balance]);

    const handleSaveBalance = () => {
        const newBalance = parseInt(tempBalance);
        if (!isNaN(newBalance) && onUpdateBalance) {
            const diff = newBalance - balance;
            if (diff !== 0) onUpdateBalance(diff, '手动调整储备');
        }
        setIsEditingBalance(false);
    };

    const currentSound = SOUNDS.find(s => s.id === currentSoundId) || SOUNDS[0];

    useEffect(() => {
        let interval: number;
        if (isActive && timeLeft > 0) {
            interval = window.setInterval(() => onUpdateTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0 && isActive) {
            onUpdateIsActive(false);
            const success = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
            success.play().catch(()=>{});
            onUpdateTimeLeft(duration * 60);
            if (isImmersive) setIsImmersive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, duration, onPomodoroComplete, onUpdateTimeLeft, onUpdateIsActive, isImmersive]);

    const toggleTimer = () => onToggleTimer();
    const resetTimer = () => onResetTimer();
    const changeDuration = (min: number) => onChangeDuration(min);
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60); const s = seconds % 60;
        return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    };

    // Mantra Management
    const handleAddMantra = () => {
        if (!newMantraInput.trim()) return;
        const lines = newMantraInput.split('\n').filter(line => line.trim() !== '');
        setMantras([...mantras, ...lines]);
        setNewMantraInput('');
    };
    const handleDeleteMantra = (index: number) => {
        const newM = mantras.filter((_, i) => i !== index);
        setMantras(newM.length ? newM : []);
        if (currentMantraIndex >= newM.length) setCurrentMantraIndex(0);
    };
    const saveMantraEdit = (index: number) => {
        const newM = [...mantras];
        newM[index] = editingMantraValue;
        setMantras(newM);
        setEditingMantraIndex(null);
    };

    const addMantra = () => {
        if (newMantraInput.trim()) {
            setMantras([...mantras, newMantraInput.trim()]);
            setNewMantraInput('');
            setIsAddingMantra(false);
        }
    };

    return (
        <>
        <div className="mt-4"></div> {/* 下移状态卡片 */}
        <div className={`${cardBg} border p-3 rounded-xl z-20 w-full max-w-4xl mx-auto transition-all duration-300 hover:shadow-lg`}>
            
            {/* 状态卡片标题 */}
            <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
                    <Star size={12}/> 状态卡片
                </div>
                <div className="w-6"></div>
            </div>
            
            {/* 4个小模块：与实时情报卡片风格完全一致，移动端单列 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. 角色系统模块 */}
                <div className={`${cardBg} border p-2 rounded-lg flex flex-col justify-between transition-all duration-300 cursor-default hover:shadow-lg`}>
                    <AvatarProfile 
                        theme={theme}
                        xp={xp}
                        totalHours={totalHours}
                        balance={balance}
                        levelInfo={levelInfo}
                        focusInfo={focusInfo}
                        wealthInfo={wealthInfo}
                    />
                </div>

                {/* 2. 番茄系统模块 */}
                <div className={`${cardBg} border p-2 rounded-lg flex flex-col justify-between transition-all duration-300 cursor-default hover:shadow-lg`}>
                    <TomatoTimer
                        theme={theme}
                        timeLeft={timeLeft}
                        isActive={isActive}
                        duration={duration}
                        onToggleTimer={onToggleTimer}
                        onResetTimer={onResetTimer}
                        onChangeDuration={onChangeDuration}
                        onUpdateTimeLeft={onUpdateTimeLeft}
                        onUpdateIsActive={onUpdateIsActive}
                        onImmersiveModeChange={(isImmersive) => setIsImmersive(true)}
                    />
                </div>

                {/* 3. 军工模块 */}
                <div className={`${cardBg} border p-2 rounded-lg flex flex-col justify-between transition-all duration-300 cursor-default hover:shadow-lg`}>
                    <MilitaryModule
                        theme={theme}
                        balance={balance}
                        totalKills={totalKills}
                        isEditingBalance={isEditingBalance}
                        tempBalance={tempBalance}
                        setIsEditingBalance={setIsEditingBalance}
                        setTempBalance={setTempBalance}
                        handleSaveBalance={handleSaveBalance}
                    />
                </div>
                
                {/* 4. 心法模块 */}
                <div className={`${cardBg} border p-2 rounded-lg flex flex-col justify-between transition-all duration-300 cursor-default hover:shadow-lg`}>
                    <MantraModule
                        theme={theme}
                        mantras={mantras}
                        currentMantraIndex={currentMantraIndex}
                        cycleMantra={cycleMantra}
                        setIsMantraModalOpen={setIsMantraModalOpen}
                    />
                </div>
            </div>
        </div>

        {/* FULLSCREEN IMMERSIVE OVERLAY */}
        {isImmersive && (
            <div className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center animate-in fade-in duration-700 ${isDark ? 'bg-zinc-950' : 'bg-slate-50'}`} onClick={cycleMantra}>
                <button onClick={(e) => { e.stopPropagation(); setIsImmersive(false); }} className={`absolute top-8 right-8 transition-all duration-300 ${isDark ? 'text-zinc-500 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}><X size={32} /></button>
                
                {/* 背景音乐切换按钮 - 向右调整位置 */}
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsSoundMenuOpen(!isSoundMenuOpen); }} 
                    className={`absolute top-8 left-16 transition-all duration-300 ${isDark ? 'text-zinc-500 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                    title={isMuted ? '开启音效' : '切换音效'}
                >
                    {isMuted ? <VolumeX size={32} /> : <Volume2 size={32} />}
                </button>
                
                {/* 音效菜单 */}
                {isSoundMenuOpen && (
                    <div className={`absolute top-20 left-8 rounded-xl shadow-lg p-4 backdrop-blur-sm ${isDark ? 'bg-zinc-900/95 border border-zinc-800' : 'bg-white/95 border border-slate-200'}`}>
                        <div className="flex flex-col gap-3">
                            {SOUNDS.map(sound => {
                                const IconComponent = sound.icon;
                                return (
                                    <button 
                                            key={sound.id}
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setCurrentSoundId(sound.id); 
                                                setIsSoundMenuOpen(false);
                                            }}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentSoundId === sound.id ? (isDark ? 'bg-zinc-800 text-white' : 'bg-blue-50 text-blue-600') : (isDark ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-700')}`}
                                        >
                                        <IconComponent size={20} className={sound.color} />
                                        <span>{sound.name}</span>
                                    </button>
                                );
                            })}
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setIsMuted(!isMuted); 
                                    if (audioRef.current) {
                                        audioRef.current.muted = !isMuted;
                                    }
                                    setIsSoundMenuOpen(false);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isMuted ? (isDark ? 'bg-zinc-800 text-white' : 'bg-blue-50 text-blue-600') : (isDark ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-700')}`}
                            >
                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                <span>{isMuted ? '开启音效' : '关闭音效'}</span>
                            </button>
                        </div>
                    </div>
                )}
                
                {/* 锦囊库内容 - 顶部 */}
                <div className={`absolute top-16 text-center p-4 max-w-2xl ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                    <div className="text-sm font-bold italic">"{mantras[currentMantraIndex]}"</div>
                </div>
                
                {/* 圆形番茄钟 - 缩小尺寸，添加拟态效果和环形进度条 */}
                <div className="relative flex flex-col items-center justify-center">
                    {/* 拟态背景圆 - 增大尺寸，添加悬浮效果 */}
                    <div className={`w-[60vw] h-[60vw] max-w-[450px] max-h-[450px] rounded-full flex flex-col items-center justify-center transition-all duration-300 ${isNeomorphic 
                        ? 'bg-[#e0e5ec] border-[#a3b1c6] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,1)] active:shadow-[inset_10px_10px_20px_rgba(163,177,198,0.6),inset_-10px_-10px_20px_rgba(255,255,255,1)]' 
                        : 'bg-gradient-to-br from-amber-600 to-orange-700 shadow-[inset_-15px_-15px_30px_rgba(0,0,0,0.3),15px_15px_30px_rgba(0,0,0,0.2)]' 
                    }`}>
                        {/* 环形进度条 - 调整半径 */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                            {/* 背景圆环 */}
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke={isNeomorphic ? '#d0d5dc' : 'rgba(255,255,255,0.3)'}
                                strokeWidth="8"
                            />
                            {/* 进度圆环 */}
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke={isActive ? (isNeomorphic ? '#3b82f6' : '#ffffff') : (isNeomorphic ? '#9ca3af' : 'rgba(255,255,255,0.5)')}
                                strokeWidth="8"
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                                strokeDasharray={2 * Math.PI * 40}
                                strokeDashoffset={2 * Math.PI * 40 - ((timeLeft / (duration * 60)) * 100 / 100) * (2 * Math.PI * 40)}
                                className="transition-all duration-100 ease-linear"
                            />
                        </svg>
                        
                        {/* 状态文字和倒计时 - 居中显示，黑色文字 */}
                        <div className="relative z-10 flex flex-col items-center justify-center">
                            {/* 状态文字 */}
                            <div className={`text-lg font-bold uppercase tracking-[0.3em] mb-3 text-black font-mono`}>{isActive ? '专注模式' : '已暂停'}</div>
                            
                            {/* 倒计时文字 */}
                            <div className={`text-[10vw] font-black font-mono leading-none tracking-tighter text-black tabular-nums`}>{formatTime(timeLeft)}</div>
                        </div>
                    </div>
                </div>
                
                {/* 控制按钮 - 向下调整位置 */}
                <div className="absolute bottom-8 flex flex-col items-center gap-6">
                    {/* 播放暂停按钮 */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
                        className={`p-5 rounded-full transition-all hover:scale-105 active:scale-95 ${isNeomorphic 
                            ? 'bg-[#e0e5ec] border-[#a3b1c6] shadow-[5px_5px_15px_rgba(163,177,198,0.6),-5px_-5px_15px_rgba(255,255,255,1)] hover:shadow-[3px_3px_10px_rgba(163,177,198,0.5),-3px_-3px_10px_rgba(255,255,255,1)] active:shadow-[inset_5px_5px_15px_rgba(163,177,198,0.6),inset_-5px_-5px_15px_rgba(255,255,255,1)]' 
                            : 'bg-white/90 backdrop-blur-sm shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,0.6)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.4)]' 
                        }`}
                    >
                        {isActive ? <Pause size={36} className="text-orange-600" /> : <Play size={36} className="text-orange-600" />}
                    </button>
                    {/* 预设时间按钮 - 缩小按钮 */}
                    <div className="flex gap-3">
                        {[25, 45, 60].map(m => (
                            <button key={m}
                                onClick={(e) => { e.stopPropagation(); onChangeDuration(m); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isNeomorphic 
                                    ? `bg-[#e0e5ec] border-[#a3b1c6] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.5),-2px_-2px_4px_rgba(255,255,255,1)] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] ${duration === m ? 'text-blue-600' : 'text-zinc-600'}` 
                                    : duration === m ? 
                                        (isDark ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-blue-50 text-blue-600 border-blue-200') : 
                                        (isDark ? 'text-zinc-500 border-zinc-700 hover:text-zinc-300 hover:bg-zinc-800' : 'text-slate-600 border-slate-300 hover:text-slate-800 hover:bg-slate-100') 
                                }`}
                            >
                                {m}'
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* 锦囊库管理模态框 */}
        {isMantraModalOpen && (
            <div className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
                <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} border rounded-xl p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}">管理锦囊库</h2>
                        <button 
                            onClick={() => setIsMantraModalOpen(false)}
                            className={`p-2 rounded-full ${isDark ? 'hover:bg-zinc-800 text-white' : 'hover:bg-slate-100 text-slate-800'} transition-colors`}
                        >
                            <X size={24} />
                        </button>
                    </div>
                    
                    {/* 添加新咒语 */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-slate-700'}">添加新咒语</h3>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="输入新咒语..." 
                                value={newMantraInput} 
                                onChange={(e) => setNewMantraInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddMantra()}
                                className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            <button 
                                onClick={handleAddMantra}
                                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition-colors font-medium`}
                            >
                                添加
                            </button>
                        </div>
                    </div>
                    
                    {/* 咒语列表 */}
                    <div>
                        <h3 className="text-sm font-medium mb-3 ${isDark ? 'text-zinc-300' : 'text-slate-700'}">现有咒语 ({mantras.length})</h3>
                        <div className="space-y-2">
                            {mantras.map((mantra, index) => (
                                <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-300'} transition-colors hover:border-blue-500/50`}>
                                    {editingMantraIndex === index ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <input 
                                                type="text" 
                                                value={editingMantraValue} 
                                                onChange={(e) => setEditingMantraValue(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveMantraEdit(index)}
                                                autoFocus
                                                className={`flex-1 px-3 py-1 rounded border ${isDark ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-slate-300 text-slate-800'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            />
                                            <button 
                                                onClick={() => saveMantraEdit(index)}
                                                className={`px-3 py-1 rounded ${isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} text-sm transition-colors`}
                                            >
                                                保存
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className={`${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>{mantra}</span>
                                            <div className="flex gap-1">
                                                <button 
                                                    onClick={() => {
                                                        setEditingMantraIndex(index);
                                                        setEditingMantraValue(mantra);
                                                    }}
                                                    className={`p-1.5 rounded ${isDark ? 'hover:bg-zinc-700 text-blue-400' : 'hover:bg-slate-200 text-blue-600'} transition-colors`}
                                                    title="编辑"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteMantra(index)}
                                                    className={`p-1.5 rounded ${isDark ? 'hover:bg-zinc-700 text-red-400' : 'hover:bg-slate-200 text-red-600'} transition-colors`}
                                                    title="删除"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
});

export default CharacterProfile;