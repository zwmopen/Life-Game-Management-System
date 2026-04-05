import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Play, Pause, RotateCcw, VolumeX, Volume2, Maximize2, Sun, Moon, Coffee, Dumbbell, BookOpen, Activity, Music, CloudRain, Trees, BrainCircuit, ChevronLeft, ChevronRight } from 'lucide-react';
import { Theme } from '../../types';
import { useGlobalAudio } from '../../components/GlobalAudioManagerOptimized';
import OptimizedImmersivePomodoro3D from './OptimizedImmersivePomodoro3D';
import ImmersiveTimerHud from './ImmersiveTimerHud';
import { getNeomorphicStyles } from '../../utils/styleHelpers';
import UnifiedBgMusicSelector from './UnifiedBgMusicSelector';
import { GlobalGuideCard, GlobalHelpButton, helpContent } from '../../components/HelpSystem';
import { SPECIES } from '../../data/speciesData';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/immersive-pomodoro.css';

interface OptimizedImmersivePomodoroProps {
  theme: Theme;
  timeLeft: number;
  isActive: boolean;
  duration: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onUpdateTimeLeft: (seconds: number) => void;
  onUpdateIsActive: (active: boolean) => void;
  onExitImmersive: () => void;
  totalPlants: number;
  todayPlants: number;
  isMuted: boolean;
  currentSoundId: string;
  onUpdateTotalPlants?: (count: number) => void;
  onUpdateTodayPlants?: (count: number) => void;
}

const OptimizedImmersivePomodoro: React.FC<OptimizedImmersivePomodoroProps> = ({
  theme,
  onExitImmersive,
  totalPlants: initialTotalPlants,
  todayPlants: initialTodayPlants,
  timeLeft,
  isActive,
  duration,
  onUpdateTimeLeft,
  onUpdateIsActive,
  isMuted,
  currentSoundId,
  onUpdateTotalPlants,
  onUpdateTodayPlants
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSeed, setCurrentSeed] = useState('pine');
  const [isFocusing, setIsFocusing] = useState(isActive);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(timeLeft);
  const [currentDuration, setCurrentDuration] = useState(duration * 60);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [isEditingToday, setIsEditingToday] = useState(false);
  const [isEditingPreset, setIsEditingPreset] = useState(false);
  const [editingValue, setEditingValue] = useState('');
  const [editingPresetId, setEditingPresetId] = useState<number | null>(null);
  // 从本地存储加载总数和今日数量
  const [totalPlants, setTotalPlants] = useState(() => {
    const savedTotal = localStorage.getItem('immersionPomodoro_totalPlants');
    return savedTotal ? parseInt(savedTotal) : (initialTotalPlants || 20);
  });
  const [todayPlants, setTodayPlants] = useState(() => {
    const savedToday = localStorage.getItem('immersionPomodoro_todayPlants');
    return savedToday ? parseInt(savedToday) : (initialTodayPlants || 0);
  });
  const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false);
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  const [mode, setMode] = useState<'3d' | 'timebox'>(() => {
    const savedMode = localStorage.getItem('immersionPomodoro_mode');
    return (savedMode === '3d' || savedMode === 'timebox') ? savedMode : '3d';
  }); // 3d模式或时间盒子模式

  // 处理模式切换并保存到本地存储
  const handleModeToggle = useCallback(() => {
    const newMode = mode === '3d' ? 'timebox' : '3d';
    setMode(newMode);
    localStorage.setItem('immersionPomodoro_mode', newMode);
  }, [mode]);
  
  const totalPlantsRef = useRef<HTMLDivElement>(null);
  const todayPlantsRef = useRef<HTMLDivElement>(null);
  
  // 使用共享的物种数据，避免数据冗余
  // 数据来源于../../data/speciesData.ts

  // 使用全局音频管理器
  const { currentBgMusicId } = useGlobalAudio();
  
  // 使用主题管理
  const { theme: currentTheme, toggleTheme } = useTheme();
  
  // 计时器效果 - 使用useCallback优化
  useEffect(() => {
    let interval: number;
    
    // 只有在专注且未暂停且时间大于0时才运行计时器
    if (isFocusing && !isPaused && secondsRemaining > 0) {
      console.log('Starting timer interval');
      interval = window.setInterval(() => {
        setSecondsRemaining(prev => {
          const newTime = prev - 1;
          console.log('Updating time:', newTime);
          onUpdateTimeLeft(newTime);
          if (newTime <= 0) {
            // 清除定时器
            if (interval) {
              clearInterval(interval);
            }
            
            // 番茄钟结束，更新总数
            const newTotal = totalPlants + 1;
            setTotalPlants(newTotal);
            if (onUpdateTotalPlants) {
              onUpdateTotalPlants(newTotal);
            }
            
            // 更新今日数量
            const newToday = todayPlants + 1;
            setTodayPlants(newToday);
            if (onUpdateTodayPlants) {
              onUpdateTodayPlants(newToday);
            }
            
            // 不调用onUpdateIsActive(false)，保持在沉浸式界面
            // 重置计时器，但不退出沉浸式界面
            setTimeout(() => {
              setSecondsRemaining(currentDuration);
              onUpdateTimeLeft(currentDuration);
              setIsFocusing(false);
              setIsPaused(false);
            }, 1000);
            
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      // 如果不在专注状态，确保定时器被清除
      if (interval) {
        console.log('Clearing timer interval');
        clearInterval(interval);
      }
    }
    
    // 清理函数，确保在任何情况下都清除定时器
    return () => {
      if (interval) {
        console.log('Cleaning up timer interval');
        clearInterval(interval);
      }
    };
  }, [isFocusing, isPaused, secondsRemaining, currentDuration]);

  // 格式化时间
  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  // 选择种子
  const selectSeed = useCallback((type: string) => {
    setCurrentSeed(type);
  }, []);

  // 开始专注
  const startFocus = useCallback(() => {
    setIsFocusing(true);
    setIsPaused(false);
    onUpdateIsActive(true);
  }, [onUpdateIsActive]);

  // 暂停专注
  const pauseFocus = useCallback(() => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    
    // 更新父组件状态：如果暂停则设置isActive为false，否则为true
    onUpdateIsActive(!newPausedState);
  }, [isPaused, onUpdateIsActive]);

  // 重置专注
  const resetFocus = useCallback(() => {
    setIsFocusing(false);
    setIsPaused(false);
    setSecondsRemaining(currentDuration);
    onUpdateTimeLeft(currentDuration);
    onUpdateIsActive(false);
  }, [currentDuration, onUpdateTimeLeft, onUpdateIsActive]);

  // 设置时长
  const setDuration = useCallback((min: number) => {
    const newDuration = min * 60;
    setCurrentDuration(newDuration);
    setSecondsRemaining(newDuration);
    onUpdateTimeLeft(newDuration);
  }, [onUpdateTimeLeft]);

  // 开始编辑总数
  const startEditTotal = useCallback(() => {
    setIsEditingTotal(true);
    setEditingValue(totalPlants.toString());
    setTimeout(() => {
      const input = totalPlantsRef.current?.querySelector('input');
      input?.focus();
      input?.select();
    }, 0);
  }, [totalPlants]);

  // 开始编辑今日数量
  const startEditToday = useCallback(() => {
    setIsEditingToday(true);
    setEditingValue(todayPlants.toString());
    setTimeout(() => {
      const input = todayPlantsRef.current?.querySelector('input');
      input?.focus();
      input?.select();
    }, 0);
  }, [todayPlants]);

  // 保存编辑
  const saveEdit = useCallback((type: 'total' | 'today') => {
    const value = parseInt(editingValue);
    if (!isNaN(value) && value >= 0) {
      if (type === 'total') {
        // 更新本地状态
        setTotalPlants(value);
        // 保存到本地存储
        localStorage.setItem('immersionPomodoro_totalPlants', value.toString());
        // 如果提供了回调函数，调用它更新父组件状态
        if (onUpdateTotalPlants) {
          onUpdateTotalPlants(value);
        }
      } else {
        // 更新本地状态
        setTodayPlants(value);
        // 保存到本地存储
        localStorage.setItem('immersionPomodoro_todayPlants', value.toString());
        // 如果提供了回调函数，调用它更新父组件状态
        if (onUpdateTodayPlants) {
          onUpdateTodayPlants(value);
        }
      }
    }
    setIsEditingTotal(false);
    setIsEditingToday(false);
  }, [editingValue, onUpdateTotalPlants, onUpdateTodayPlants]);

  // 开始编辑预设时间
  const startEditPreset = useCallback((preset: number) => {
    setIsEditingPreset(true);
    setEditingPresetId(preset);
    setEditingValue(preset.toString());
    setTimeout(() => {
      const input = document.querySelector(`#preset-${preset}`) as HTMLInputElement;
      input?.focus();
      input?.select();
    }, 0);
  }, []);

  // 保存编辑预设时间
  const saveEditPreset = useCallback(() => {
    const value = parseInt(editingValue);
    if (!isNaN(value) && value > 0 && editingPresetId !== null) {
      // 更新当前计时器设置为修改后的预设时间
      setDuration(value);
    }
    setIsEditingPreset(false);
    setEditingPresetId(null);
  }, [editingValue, editingPresetId, setDuration]);

  // 处理输入框按键事件
  const handleInputKeyDown = useCallback((e: React.KeyboardEvent, type: 'total' | 'today' | 'preset') => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      if (type === 'preset') {
        saveEditPreset();
      } else {
        saveEdit(type);
      }
    } else if (e.key === 'Escape' || e.keyCode === 27) {
      setIsEditingTotal(false);
      setIsEditingToday(false);
      setIsEditingPreset(false);
      setEditingPresetId(null);
    }
  }, [saveEdit, saveEditPreset]);

  const isDark = theme.includes('dark');
  const isNeomorphic = theme.startsWith('neomorphic');
  const isNeomorphicDark = theme === 'neomorphic-dark';
  
  // 拟态风格样式变量
  const neomorphicStyles = typeof getNeomorphicStyles === 'function' 
    ? getNeomorphicStyles(isNeomorphicDark) 
    : {
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

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-transparent`}>
      {/* 主容器 */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full">
        {mode === '3d' ? (
          /* 3D模式 */
          <>
            {/* 优化后的3D场景组件 */}
            <OptimizedImmersivePomodoro3D
              theme={theme}
              totalPlants={totalPlants}
              currentSeed={currentSeed}
              isFocusing={isFocusing}
              isPaused={isPaused}
              onEntityCreated={(entity) => {
                // 当3D实体创建时的回调
                console.log('Entity created:', entity);
              }}
            />
            
            {/* 顶部控制按钮组 */}
            <div className="fixed top-0 right-0 flex items-center justify-end gap-4 p-4 z-10">
              {/* 模式切换按钮 */}
              <button 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isNeomorphic 
                  ? `${isDark 
                      ? 'border border-zinc-700 shadow-[5px_5px_10px_rgba(0,0,0,0.3),-5px_-5px_10px_rgba(40,43,52,0.8)] hover:shadow-[7px_7px_14px_rgba(0,0,0,0.4),-7px_-7px_14px_rgba(40,43,52,1)] active:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.3),inset_-5px_-5px_10px_rgba(40,43,52,0.8)]' 
                      : 'border border-slate-300 shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[7px_7px_14px_rgba(163,177,198,0.7),-7px_-7px_14px_rgba(255,255,255,1)] active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]' 
                    }`
                  : `${isDark ? 'text-zinc-300 hover:text-blue-400 hover:bg-zinc-800/50' : 'text-zinc-500 hover:text-blue-400 hover:bg-white/10'}`}`}
                onClick={handleModeToggle}
                title="切换模式"
                style={{
                  background: mode === '3d' 
                    ? `linear-gradient(90deg, #2563eb 50%, ${isDark ? '#1e1e2e' : '#e0e5ec'} 50%)` 
                    : `linear-gradient(90deg, ${isDark ? '#1e1e2e' : '#e0e5ec'} 50%, #2563eb 50%)`,
                  backgroundSize: '100% 100%',
                  transition: 'background 0.4s ease, box-shadow 0.3s ease, transform 0.2s ease',
                  boxShadow: isNeomorphic
                    ? isDark
                      ? '5px 5px 10px rgba(0,0,0,0.3), -5px -5px 10px rgba(40,43,52,0.8)'
                      : '5px 5px 10px rgba(163,177,198,0.6), -5px -5px 10px rgba(255,255,255,1)'
                    : 'none'
                }}
              >
              </button>
              
              {/* 退出按钮 */}
              <button className="exit-btn" id="exitBtn" onClick={onExitImmersive}>✕</button>
            </div>

            {/* UI容器 */}
            <div className="ui-container">
              {/* 顶部数据栏 - 合并的统计面板 - 修改条件，在专注模式下完全隐藏 */}
          <div className={`stats-bar ${isFocusing && !isPaused ? 'hidden' : ''}`}>
            <div 
              ref={totalPlantsRef}
              className={`${isNeomorphicDark ? 'neu-out neomorphic-dark-mode' : isDark ? 'neu-out dark-mode' : 'neu-out'} stats-panel relative w-auto min-w-[240px] p-2 px-4`} 
              id="statsTotal"
              onDoubleClick={startEditTotal}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">🌲 总数</span>
                    {isEditingTotal ? (
                      <div className="highlight-num edit-mode">
                        <input 
                          type="number" 
                          min="0" 
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => {
                            saveEdit('total');
                            setIsEditingTotal(false);
                          }}
                          onKeyDown={(e) => handleInputKeyDown(e, 'total')}
                          className="edit-input text-xs"
                        />
                      </div>
                    ) : (
                      <span className="highlight-num text-xs" id="totalCount">{totalPlants}</span>
                    )}
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div> {/* 分隔线 */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs">☀️ 今日</span>
                    {isEditingToday ? (
                      <div className="highlight-num edit-mode">
                        <input 
                          type="number" 
                          min="0" 
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => {
                            saveEdit('today');
                            setIsEditingToday(false);
                          }}
                          onKeyDown={(e) => handleInputKeyDown(e, 'today')}
                          className="edit-input text-xs"
                        />
                      </div>
                    ) : (
                      <span className="highlight-num text-xs" id="todayCount">{todayPlants}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-auto pl-8">
                  {/* 主题切换按钮 - 模拟白天/黑夜效果 */}
                  <button 
                    className="p-2 rounded-full transition-all duration-300 hover:scale-110 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={toggleTheme}
                    title="切换主题（白天/黑夜）"
                  >
                    {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}
                  </button>
                  {/* 统计数据使用指南小问号 */}
                  <button
                    className="p-2 rounded-full transition-all duration-300 hover:scale-110 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={() => setActiveHelp('pomodoro-guide')}
                    title="查看说明"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <path d="M12 17h.01"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* 统一的使用指南卡片 */}
          <GlobalGuideCard
            activeHelp={activeHelp}
            helpContent={helpContent}
            onClose={() => setActiveHelp(null)}
            config={{
              cardBg: isDark ? '#1a202c' : '#ffffff',
              textMain: isDark ? '#f7fafc' : '#1a202c',
              textSub: isDark ? '#a0aec0' : '#4a5568',
              buttonBg: isDark ? '#4a5568' : '#e2e8f0',
              buttonHoverBg: isDark ? '#718096' : '#cbd5e0',
              borderRadius: '8px',
              shadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              maxWidth: '500px',
              fontSize: '0.875rem',
              iconSize: 20
            }}
          />
          
          {/* 底部控制 */}
          <div className="controls">
            {/* 预设时间 + 音乐 - 修改条件，在专注模式下完全隐藏 */}
            <div className={`controls-row ${isFocusing && !isPaused ? 'hidden' : ''}`} id="controlsRow">
              <div id="presetGroup" className="flex gap-2">
                {/* 预设时间选项 */}
                {[1, 5, 10, 25, 30, 45, 60].map(m => (
                  <div key={m} className="relative">
                    <button 
                      className={`preset-btn ${Math.floor(currentDuration / 60) === m ? 'active' : ''}`} 
                      data-time={m}
                      onClick={() => setDuration(m)}
                      onDoubleClick={() => startEditPreset(m)}
                    >
                      {m}
                    </button>
                  </div>
                ))}
              </div>
                       
              <div className="audio-dropdown relative">
                <button 
                  className={`p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${isNeomorphic 
                    ? `${isDark 
                        ? 'bg-[#1e1e2e] border border-zinc-700 shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(40,43,52,0.8)] hover:shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(40,43,52,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(40,43,52,0.8)] text-zinc-300' 
                        : 'bg-[#e0e5ec] border border-slate-300 shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[5px_5px_10px_rgba(163,177,198,0.7),-5px_-5px_10px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] text-zinc-600' 
                      }`
                    : `${isDark ? 'text-zinc-300 hover:text-blue-400 hover:bg-zinc-800/50' : 'text-zinc-500 hover:text-blue-400 hover:bg-white/10'}`}`}
                  onClick={() => setIsSoundMenuOpen(!isSoundMenuOpen)}
                  title="选择背景音乐"
                >
                  {currentBgMusicId === 'mute' 
                    ? <VolumeX size={18} className={isDark ? 'text-zinc-300' : 'text-zinc-600'} /> 
                    : <Music size={18} className={isDark ? 'text-zinc-300' : 'text-zinc-600'} />
                  }
                </button>
                
                <UnifiedBgMusicSelector 
                  theme={theme}
                  isVisible={isSoundMenuOpen}
                  onClose={() => setIsSoundMenuOpen(false)}
                  className="absolute top-full right-0 mt-2 mr-2"
                />
              </div>
            </div>
            <ImmersiveTimerHud
              isDark={isDark}
              isNeomorphic={isNeomorphic}
              isFocusing={isFocusing}
              isPaused={isPaused}
              currentDuration={currentDuration}
              secondsRemaining={secondsRemaining}
              currentSeed={currentSeed}
              formatTime={formatTime}
              onPrimaryAction={isFocusing ? pauseFocus : startFocus}
              onReset={resetFocus}
            />
            </div>

          {/* 侧边种子选择 - 修改条件，在专注模式下完全隐藏 */}
          <div className={`${isNeomorphicDark ? 'neu-out neomorphic-dark-mode' : isDark ? 'neu-out dark-mode' : 'neu-out'} seed-selector ${isFocusing && !isPaused ? 'hidden' : ''}`} id="seedSelector">
            {/* 合并植物和动物为一个连续列表，并添加1-40的序号 */}
            {[...SPECIES.plants, ...SPECIES.animals].map((seed, index) => (
              <div 
                key={seed.id}
                id={`opt-${seed.id}`}
                className={`seed-option ${currentSeed === seed.id ? 'active' : ''}`}
                onClick={() => selectSeed(seed.id)}
              >
                <div className="seed-number">{index + 1}</div>
                <div className="seed-icon">{seed.icon}</div>
                <div className="seed-name">{seed.name}</div>
              </div>
            ))}
          </div>

        </div>
          </>
        ) : (
          /* 时间盒子模式 */
          <div className={`fixed inset-0 ${isNeomorphicDark ? 'bg-[#1e1e2e]' : isDark ? 'bg-[#1a202c]' : 'bg-[#e0e5ec]'} flex items-center justify-center z-[100000]`}>
            {/* 顶部控制按钮组 */}
            <div className="fixed top-0 right-0 flex items-center justify-end gap-4 p-4 z-10">
              {/* 模式切换按钮 */}
              <button 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isNeomorphic 
                  ? `${isDark 
                      ? 'border border-zinc-700 shadow-[5px_5px_10px_rgba(0,0,0,0.3),-5px_-5px_10px_rgba(40,43,52,0.8)] hover:shadow-[7px_7px_14px_rgba(0,0,0,0.4),-7px_-7px_14px_rgba(40,43,52,1)] active:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.3),inset_-5px_-5px_10px_rgba(40,43,52,0.8)]' 
                      : 'border border-slate-300 shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[7px_7px_14px_rgba(163,177,198,0.7),-7px_-7px_14px_rgba(255,255,255,1)] active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]' 
                    }`
                  : `${isDark ? 'text-zinc-300 hover:text-blue-400 hover:bg-zinc-800/50' : 'text-zinc-500 hover:text-blue-400 hover:bg-white/10'}`}`}
                onClick={handleModeToggle}
                title="切换模式"
                style={{
                  background: mode === '3d' 
                    ? `linear-gradient(90deg, #2563eb 50%, ${isDark ? '#1e1e2e' : '#e0e5ec'} 50%)` 
                    : `linear-gradient(90deg, ${isDark ? '#1e1e2e' : '#e0e5ec'} 50%, #2563eb 50%)`,
                  backgroundSize: '100% 100%',
                  transition: 'background 0.4s ease, box-shadow 0.3s ease, transform 0.2s ease',
                  boxShadow: isNeomorphic
                    ? isDark
                      ? '5px 5px 10px rgba(0,0,0,0.3), -5px -5px 10px rgba(40,43,52,0.8)'
                      : '5px 5px 10px rgba(163,177,198,0.6), -5px -5px 10px rgba(255,255,255,1)'
                    : 'none'
                }}
              >
              </button>
              
              {/* 退出按钮 */}
              <button className="exit-btn" id="exitBtn" onClick={onExitImmersive}>✕</button>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 w-full">
              <div className="relative w-full max-w-md aspect-square mb-10">
                {/* 背景圆形 */}
                <div className={`absolute inset-0 rounded-full ${isNeomorphic 
                  ? `${isDark 
                      ? 'bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.3),-5px_-5px_10px_rgba(40,43,52,0.8)]' 
                      : 'bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)]' 
                    }`
                  : ''}`}></div>
                
                {/* 进度条倒计时 */}
                <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 300 300">
                  <circle
                    cx="150"
                    cy="150"
                    r="130"
                    fill="none"
                    stroke={isDark ? 'rgba(30, 64, 175, 0.3)' : 'rgba(30, 64, 175, 0.2)'}
                    strokeWidth="12"
                  />
                  <circle
                    cx="150"
                    cy="150"
                    r="130"
                    fill="none"
                    stroke={isDark ? '#3b82f6' : '#2563eb'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    transform="rotate(-90 150 150)"
                    strokeDasharray={`${2 * Math.PI * 130}`}
                    strokeDashoffset={`${2 * Math.PI * 130 * (1 - secondsRemaining / currentDuration)}`}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                
                {/* 中心内容 */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <h2 className={`text-xl md:text-2xl font-semibold mb-4 text-center ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>时间盒子倒计时</h2>
                  <h3 className={`text-lg md:text-xl font-medium mb-6 text-center ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>实现任务状态管理</h3>
                  <span className={`text-5xl md:text-7xl font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>
                    {formatTime(secondsRemaining)}
                  </span>
                </div>
              </div>
              <div className="flex space-x-8">
                <button
                  onClick={() => isFocusing ? pauseFocus() : startFocus()}
                  className={`px-10 py-4 rounded-lg text-base font-medium transition-all ${isNeomorphic 
                    ? `${isDark 
                        ? 'bg-[#1e1e2e] border border-zinc-700 shadow-[5px_5px_10px_rgba(0,0,0,0.3),-5px_-5px_10px_rgba(40,43,52,0.8)] hover:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.3),inset_-5px_-5px_10px_rgba(40,43,52,0.8)]' 
                        : 'bg-[#e0e5ec] border border-slate-300 shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]' 
                      }`
                    : ''} ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}
                >
                  {isFocusing ? '暂停' : '开始'}
                </button>
                <button
                  onClick={() => {
                    resetFocus();
                    onExitImmersive();
                  }}
                  className={`px-10 py-4 rounded-lg text-base font-medium transition-all ${isNeomorphic 
                    ? `${isDark 
                        ? 'bg-[#1e1e2e] border border-zinc-700 shadow-[5px_5px_10px_rgba(0,0,0,0.3),-5px_-5px_10px_rgba(40,43,52,0.8)] hover:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.3),inset_-5px_-5px_10px_rgba(40,43,52,0.8)]' 
                        : 'bg-[#e0e5ec] border border-slate-300 shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]' 
                      }`
                    : ''} ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}
                >
                  完成
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 样式已移至外部CSS文件 */}
    </div>
  );
};

export default OptimizedImmersivePomodoro;
