import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Smile, Pause, Play, RotateCcw, Volume2, VolumeX, CloudRain, Waves, BrainCircuit, Trees, Maximize2, X, List, Sparkles, Save, Edit3, Trash2, Plus, Coins, Target, Monitor, Coffee, Moon, Star, Crosshair, Gift } from 'lucide-react';
import { Theme } from '../types';
import AvatarProfile from './shared/AvatarProfile';
import TomatoTimer from './shared/TomatoTimer';

import OptimizedImmersivePomodoro from './shared/OptimizedImmersivePomodoro';
import MilitaryModule from './shared/MilitaryModule';
import MantraModule from './shared/MantraModule';
import { DEFAULT_MANTRAS } from '../constants/mantras';

import MantraManagementModal from './shared/MantraManagementModal';
import { useGlobalAudio } from '../components/GlobalAudioManagerOptimized';

// 导入错误边界
import ErrorBoundary, { DefaultErrorFallback } from '../components/ErrorBoundary';

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
  onInternalImmersiveModeChange?: (isInternalImmersive: boolean) => void;
  // Global Audio Management
  // 音频管理已由GlobalAudioManagerOptimized统一处理，不再需要props传递
  // Help System
  onHelpClick?: (helpId: string) => void;
  // Character Level Change
  onLevelChange?: (newLevel: number, type: 'level' | 'focus' | 'wealth') => void;
  // Badge Category Click Handler
  onBadgeCategoryClick?: (category: 'level' | 'focus' | 'wealth') => void;
  // Update today stats
  onUpdateTodayStats?: (stats: any) => void;
  // Settings
  settings?: {
    showCharacterSystem?: boolean;
    showPomodoroSystem?: boolean;
    showFocusTimeSystem?: boolean;
    showCheckinSystem?: boolean;
    showAchievementCollectionRate?: boolean;
    showSystemStabilityModule?: boolean;
    showLatestBadges?: boolean;
    showChartSummary?: boolean;
    showSupplyMarket?: boolean;
  };
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
        onInternalImmersiveModeChange = undefined, 
        // Global Audio Management
        // 音频管理已由GlobalAudioManagerOptimized统一处理，不再需要props传递 
        // Help System
        onHelpClick = undefined, 
        // Character Level Change
        onLevelChange = undefined,
        // Update today stats
        onUpdateTodayStats = undefined,
        // Settings
        settings = {
            showCharacterSystem: true,
            showPomodoroSystem: true,
            showFocusTimeSystem: true,
            showCheckinSystem: true,
            showAchievementCollectionRate: true,
            showSystemStabilityModule: true,
            showLatestBadges: true,
            showChartSummary: true,
            showSupplyMarket: true
        }
    } = props;
    const isDark = theme.includes('dark');
    const isNeomorphic = theme.startsWith('neomorphic');
    const cardBg = isNeomorphic 
        ? (theme === 'neomorphic-dark' 
            ? 'bg-[#1e1e2e] border-[#1e1e2e] rounded-lg shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)] transition-all duration-300' 
            : 'bg-[#e0e5ec] border-[#e0e5ec] rounded-lg shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] transition-all duration-300') 
        : isDark 
        ? 'bg-zinc-900 border-zinc-800' 
        : 'bg-white border-slate-200';
    const textMain = isDark ? 'text-zinc-100' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';
    
    // 使用全局音频上下文
    const { isMuted, toggleMute: onToggleMute, currentBgMusicId: currentSoundId, playBgMusic: onSoundChange } = useGlobalAudio();
    
    // --- MANTRA SYSTEM LOGIC ---
    const [mantras, setMantras] = useState<string[]>(DEFAULT_MANTRAS);
    const [currentMantraIndex, setCurrentMantraIndex] = useState(0);
    const [isMantraModalOpen, setIsMantraModalOpen] = useState(false);

    const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false);
    const [isImmersive, setIsImmersive] = useState(false);
    const [useInternalImmersive, setUseInternalImmersive] = useState(false); // 新状态：控制使用哪种沉浸式模式
    const [showHelp, setShowHelp] = useState(false);
    const [isEditingBalance, setIsEditingBalance] = useState(false);
    const [isEditingKills, setIsEditingKills] = useState(false);
    const [tempBalance, setTempBalance] = useState(balance.toString());
    const [tempKills, setTempKills] = useState(totalKills?.toString() || '0');
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
        { id: 'forest', name: '迷雾森林', url: "/audio/bgm/forest.mp3", icon: Trees, color: 'text-green-600', hex: '#16a34a' },
        { id: 'alpha', name: '阿尔法波', url: "/audio/bgm/alpha.mp3", icon: Waves, color: 'text-purple-500', hex: '#a855f7' },
        { id: 'theta', name: '希塔波', url: "/audio/bgm/theta.mp3", icon: CloudRain, color: 'text-emerald-500', hex: '#10b981' }, 
        { id: 'beta', name: '贝塔波', url: "/audio/bgm/beta.mp3", icon: BrainCircuit, color: 'text-blue-500', hex: '#3b82f6' },
        { id: 'ocean', name: '海浪声', url: "/audio/bgm/ocean.mp3", icon: Waves, color: 'text-blue-600', hex: '#2563eb' },
        { id: 'rain', name: '雨声', url: "/audio/bgm/rain.mp3", icon: CloudRain, color: 'text-gray-500', hex: '#6b7280' },
        { id: 'night', name: '夏夜虫鸣', url: "/audio/bgm/night.mp3", icon: Moon, color: 'text-indigo-600', hex: '#4f46e5' },
        { id: 'white-noise', name: '白噪音', url: "/audio/bgm/white-noise.mp3", icon: Coffee, color: 'text-amber-500', hex: '#f59e0b' },
        { id: 'pink-noise', name: '粉红噪音', url: "/audio/bgm/pink-noise.mp3", icon: Coffee, color: 'text-rose-500', hex: '#ec4899' },
        { id: 'brown-noise', name: '布朗噪音', url: "/audio/bgm/brown-noise.mp3", icon: Coffee, color: 'text-orange-600', hex: '#ea580c' },
        { id: 'cafe', name: '咖啡馆环境', url: "/audio/bgm/cafe.mp3", icon: Coffee, color: 'text-amber-600', hex: '#d97706' },
        { id: 'fireplace', name: '壁炉声', url: "/audio/bgm/fireplace.mp3", icon: Coffee, color: 'text-red-500', hex: '#ef4444' },
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

    // Ensure immersive mode is false on component mount
    useEffect(() => {
        setIsImmersive(false);
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
            // 通知外部组件进入沉浸式模式
            if (onImmersiveModeChange) {
                onImmersiveModeChange(true);
            }
            setIsImmersive(true);
        }
    }));

    useEffect(() => { setTempBalance(balance.toString()); }, [balance]);

    const handleSaveBalance = () => {
        const newBalance = parseInt(tempBalance);
        if (!isNaN(newBalance) && onUpdateBalance) {
            const diff = newBalance - balance;
            if (diff !== 0) onUpdateBalance(diff, '手动调整储备金');
        }
        setIsEditingBalance(false);
    };
    
    const handleSaveKills = () => {
        const newKills = parseInt(tempKills);
        if (!isNaN(newKills) && onUpdateTodayStats) {
            // 将新的歼敌数设置为tasksCompleted，habitsDone保持不变
            // 这样totalKills = tasksCompleted + habitsDone就会更新
            onUpdateTodayStats(prev => ({
                ...prev,
                tasksCompleted: newKills - prev.habitsDone
            }));
        }
        setIsEditingKills(false);
    };

    const currentSound = SOUNDS.find(s => s.id === currentSoundId) || SOUNDS[0];

    // 移除重复的定时器逻辑，使用usePomodoro钩子中的定时器
    // 当番茄钟结束时，退出沉浸式模式，但不要在暂停时退出
    const prevTimeLeft = useRef(timeLeft);
    useEffect(() => {
        // 检测番茄钟是否自然结束（从非零变为零）
        if (prevTimeLeft.current > 0 && timeLeft === 0 && isActive) {
            // 使用soundManagerOptimized播放成功音效
            import('../utils/soundManagerOptimized').then(({ default: soundManager }) => {
              soundManager.playSoundEffect('taskComplete');
            });
            if (isImmersive) {
                setIsImmersive(false);
                if (onImmersiveModeChange) {
                    onImmersiveModeChange(false);
                }
            }
        }
        // 更新上一次的时间
        prevTimeLeft.current = timeLeft;
    }, [timeLeft, isActive, isImmersive, onImmersiveModeChange]);

    const toggleTimer = () => onToggleTimer();
    const resetTimer = () => onResetTimer();
    const changeDuration = (min: number) => onChangeDuration(min);
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60); const s = seconds % 60;
        return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    };

    const handleAddMantra = (mantra: string) => {
        setMantras([mantra, ...mantras]);
    };

    const handleSaveMantraEdit = (index: number, newValue: string) => {
        const newM = [...mantras];
        newM[index] = newValue;
        setMantras(newM);
    };

    const handleDeleteMantra = (index: number) => {
        const newM = mantras.filter((_, i) => i !== index);
        setMantras(newM.length ? newM : []);
        if (currentMantraIndex >= newM.length) setCurrentMantraIndex(0);
    };

    return (
        <>
        <div className={`${cardBg} border p-2 sm:p-4 rounded-2xl z-20 w-full max-w-4xl mx-auto transition-all duration-300 hover:shadow-lg mb-8`}>
            
            {/* 状态卡片标题 */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
                    <Star size={12}/> 状态卡片
                </div>
                <div className="w-6"></div>
            </div>
            
            {/* 4个小模块：与实时情报卡片风格完全一致，移动端单列，电脑端双列 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {/* 1. 角色系统模块 */}
                {settings.showCharacterSystem && (
                    <div className={`${cardBg} border p-2 rounded-2xl flex flex-col justify-between transition-all duration-300 cursor-default hover:shadow-lg`}>
                        <AvatarProfile 
                            theme={theme}
                            xp={xp}
                            totalHours={totalHours}
                            balance={balance}
                            levelInfo={levelInfo}
                            focusInfo={focusInfo}
                            wealthInfo={wealthInfo}
                            onLevelChange={(newLevel, type) => {
                                // 实现等级修改后的联动处理机制
                                if (window.confirm(`确定要将${type === 'level' ? '经验' : type === 'focus' ? '专注' : '财富'}等级修改为${newLevel}吗？这将重置相关勋章和进度数据。`)) {
                                    // 调用父组件传递的onLevelChange回调函数
                                    if (onLevelChange) {
                                        onLevelChange(newLevel, type);
                                    }
                                }
                            }}
                            onBadgeCategoryClick={props.onBadgeCategoryClick}
                            onHelpClick={onHelpClick}
                        />
                    </div>
                )}

                {/* 2. 番茄系统模块 */}
                {settings.showPomodoroSystem && (
                    <div className={`${cardBg} border p-2 rounded-2xl flex flex-col justify-between transition-all duration-300 cursor-default hover:shadow-lg`}>
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
                            onImmersiveModeChange={(isImmersive) => setIsImmersive(isImmersive)}
                            onInternalImmersiveModeChange={(isInternalImmersive) => {
                                if (isInternalImmersive) {
                                    setIsImmersive(true);
                                    setUseInternalImmersive(true);
                                }
                            }}
                            onHelpClick={onHelpClick}
                            // Audio Management
                            currentSoundId={currentSoundId}
                            onSoundChange={onSoundChange}
                        />
                    </div>
                )}

                {/* 3. 军工模块 */}
                {settings.showFocusTimeSystem && (
                    <div className={`${cardBg} border p-2 rounded-2xl flex flex-col justify-between transition-all duration-300 cursor-default hover:shadow-lg`}>
                        <MilitaryModule
                            theme={theme}
                            balance={balance}
                            totalKills={totalKills}
                            isEditingBalance={isEditingBalance}
                            isEditingKills={isEditingKills}
                            tempBalance={tempBalance}
                            tempKills={tempKills}
                            setIsEditingBalance={setIsEditingBalance}
                            setIsEditingKills={setIsEditingKills}
                            setTempBalance={setTempBalance}
                            setTempKills={setTempKills}
                            handleSaveBalance={handleSaveBalance}
                            handleSaveKills={handleSaveKills}
                            onHelpClick={onHelpClick}
                        />
                    </div>
                )}
                
                {/* 4. 心法模块 */}
                {settings.showCheckinSystem && (
                    <div className={`${cardBg} border p-2 rounded-2xl flex flex-col justify-between transition-all duration-300 cursor-default hover:shadow-lg`}>
                        <MantraModule
                            theme={theme}
                            mantras={mantras}
                            currentMantraIndex={currentMantraIndex}
                            cycleMantra={cycleMantra}
                            setIsMantraModalOpen={setIsMantraModalOpen}
                            onHelpClick={onHelpClick}
                        />
                    </div>
                )}
            </div>
        </div>

        {/* FULLSCREEN IMMERSIVE OVERLAY WITH ERROR BOUNDARY */}
        {isImmersive && (
            <ErrorBoundary fallback={DefaultErrorFallback}>
                <OptimizedImmersivePomodoro
                    theme={theme}
                    timeLeft={timeLeft}
                    isActive={isActive}
                    duration={duration}
                    onToggleTimer={onToggleTimer}
                    onResetTimer={onResetTimer}
                    onUpdateTimeLeft={onUpdateTimeLeft}
                    onUpdateIsActive={onUpdateIsActive}
                    onExitImmersive={() => {
                        setIsImmersive(false);
                        setUseInternalImmersive(false);
                    }}
                    totalPlants={totalKills || 20}
                    todayPlants={0}
                    isMuted={isMuted}
                    currentSoundId={currentSoundId}
                    onUpdateTotalPlants={(count) => {
                        if (onUpdateTodayStats) {
                            // 直接更新totalKills值
                            onUpdateTodayStats(prev => ({
                                ...prev,
                                totalKills: count
                            }));
                        }
                    }}
                    onUpdateTodayPlants={() => {
                        // 暂时不处理今日数量的更新
                    }}
                />
            </ErrorBoundary>
        )}

        <MantraManagementModal
            isOpen={isMantraModalOpen}
            onClose={() => setIsMantraModalOpen(false)}
            mantras={mantras}
            onAddMantra={handleAddMantra}
            onDeleteMantra={handleDeleteMantra}
            onUpdateMantra={handleSaveMantraEdit}
            theme={theme}
        />
        </>
    );
});

export default CharacterProfile;