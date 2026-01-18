import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Play, Pause, RotateCcw, VolumeX, Volume2, Maximize2, Sun, Moon, Coffee, Dumbbell, BookOpen, Activity, Waves, CloudRain, Trees, BrainCircuit, ChevronLeft, ChevronRight } from 'lucide-react';
import { Theme } from '../../types';
import soundManager from '../../utils/soundManager';
import { useGlobalAudio } from '../../components/GlobalAudioManagerOptimized';
import OptimizedImmersivePomodoro3D from './OptimizedImmersivePomodoro3D';
import { getNeomorphicStyles } from '../../utils/styleHelpers';

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
  const [localCurrentSoundId, setLocalCurrentSoundId] = useState(currentSoundId); // 本地音效ID状态
  
  // 当父组件的currentSoundId变化时，更新本地音效ID状态
  useEffect(() => {
    setLocalCurrentSoundId(currentSoundId);
  }, [currentSoundId]);
  
  const totalPlantsRef = useRef<HTMLDivElement>(null);
  const todayPlantsRef = useRef<HTMLDivElement>(null);
  const soundMenuRef = useRef<HTMLDivElement>(null);
  
  // 物种数据 - 使用useMemo优化
  const SPECIES = useMemo(() => ({
    plants: [
      { id: 'pine', name: '松树', icon: '🌲' },
      { id: 'oak', name: '橡树', icon: '🌳' },
      { id: 'cherry', name: '樱花', icon: '🌸' },
      { id: 'willow', name: '垂柳', icon: '🌿' },
      { id: 'bamboo', name: '竹子', icon: '🎋' },
      { id: 'palm', name: '椰树', icon: '🌴' },
      { id: 'cactus', name: '仙人掌', icon: '🌵' },
      { id: 'mushroom', name: '巨菇', icon: '🍄' },
      { id: 'sunflower', name: '向日葵', icon: '🌻' },
      { id: 'birch', name: '白桦', icon: '🪵' }
    ],
    animals: [
      { id: 'rabbit', name: '白兔', icon: '🐰' },
      { id: 'fox', name: '赤狐', icon: '🦊' },
      { id: 'panda', name: '熊猫', icon: '🐼' },
      { id: 'pig', name: '小猪', icon: '🐷' },
      { id: 'chick', name: '小鸡', icon: '🐤' },
      { id: 'penguin', name: '企鹅', icon: '🐧' },
      { id: 'frog', name: '青蛙', icon: '🐸' },
      { id: 'sheep', name: '绵羊', icon: '🐑' },
      { id: 'bear', name: '棕熊', icon: '🐻' },
      { id: 'bee', name: '蜜蜂', icon: '🐝' }
    ]
  }), []);

  // 音频管理状态
  const [audioManager, setAudioManager] = useState<any>(null);
  const [audioStatistics, setAudioStatistics] = useState<any>(null);
  const [allSounds, setAllSounds] = useState<any[]>([]);
  const [isSoundListLoaded, setIsSoundListLoaded] = useState(false);
  const [initialSoundsLoaded, setInitialSoundsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // 搜索关键词状态
  const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false);
  
  // 点击外部关闭背景音乐面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (soundMenuRef.current && !soundMenuRef.current.contains(event.target as Node)) {
        setIsSoundMenuOpen(false);
      }
    };

    if (isSoundMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSoundMenuOpen]);

  // 图标映射函数 - 使用useCallback优化
  const getIconComponentByName = useCallback((name: string) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('forest') || lowerName.includes('woods') || lowerName.includes('trees')) {
      return '🌲';
    } else if (lowerName.includes('rain') || lowerName.includes('storm') || lowerName.includes('drizzle')) {
      return '🌧️';
    } else if (lowerName.includes('ocean') || lowerName.includes('sea') || lowerName.includes('waves')) {
      return '🌊';
    } else if (lowerName.includes('night') || lowerName.includes('cricket') || lowerName.includes('insects')) {
      return '🌙';
    } else if (lowerName.includes('cafe') || lowerName.includes('coffee')) {
      return '☕';
    } else if (lowerName.includes('fire') || lowerName.includes('fireplace')) {
      return '🔥';
    } else if (lowerName.includes('white') && lowerName.includes('noise')) {
      return '🌬️';
    } else if (lowerName.includes('pink') && lowerName.includes('noise')) {
      return '🎨';
    } else if (lowerName.includes('brown') && lowerName.includes('noise')) {
      return '🌰';
    } else if (lowerName.includes('alpha')) {
      return '🧠';
    } else if (lowerName.includes('beta')) {
      return '⚡';
    } else if (lowerName.includes('theta')) {
      return '🧘';
    } else if (lowerName.includes('meditation') || lowerName.includes('zen')) {
      return '🧘';
    } else if (lowerName.includes('study') || lowerName.includes('focus')) {
      return '🧠';
    } else if (lowerName.includes('chill') || lowerName.includes('relax') || lowerName.includes('snow') || lowerName.includes('mountain')) {
      return '❄️'; // 使用雪花图标代表放松/雪景/山景
    } else {
      // 默认返回音乐图标
      return '🎵';
    }
  }, []);

  // 加载所有背景音乐 - 使用useCallback优化
  const loadAllSounds = useCallback(async () => {
    try {
      // 动态导入audioManager和audioStatistics
      const audioManagerModule = await import('../../utils/audioManager');
      const audioStatisticsModule = await import('../../utils/audioStatistics');
      setAudioManager(audioManagerModule.default);
      setAudioStatistics(audioStatisticsModule.default);
      
      await audioManagerModule.default.initialize();
      
      // 获取所有背景音乐文件，包括番茄钟专用的背景音乐，并去重
      const allBgMusic = [...audioManagerModule.default.getBackgroundMusic(), ...audioManagerModule.default.getCategoryById('pomodoro-bgm')?.files || []];
      // 使用Map去重，确保每个音频文件只出现一次
      const uniqueBgmFilesMap = new Map();
      allBgMusic.forEach(file => {
        if (!uniqueBgmFilesMap.has(file.id)) {
          uniqueBgmFilesMap.set(file.id, file);
        }
      });
      const bgmFiles = Array.from(uniqueBgmFilesMap.values());
      
      // 第一次加载时按播放次数排序音频文件，后续加载保持当前顺序
      let sortedBgmFiles = bgmFiles;
      if (!initialSoundsLoaded) {
        sortedBgmFiles = audioStatisticsModule.default.getSortedAudioFiles(bgmFiles);
        setInitialSoundsLoaded(true);
      }
      
      // 转换为组件所需的格式
      const soundList = [
        { id: 'mute', name: '静音', icon: '🔇' },
        ...sortedBgmFiles.filter(file => file && file.id && file.url).map(file => ({
          id: file.id,
          name: file.name,
          url: file.url,
          icon: getIconComponentByName(file.name),
          color: 'text-blue-500',
          hex: '#3b82f6'
        }))
      ];
      
      setAllSounds(soundList);
      setIsSoundListLoaded(true);
    } catch (error) {
      console.error('Failed to load sound list:', error);
      // 加载失败时使用默认音效列表
      setAllSounds([
        { id: 'mute', name: '静音', icon: '🔇' },
        { id: 'forest', name: '迷雾森林', icon: '🌲' },
        { id: 'alpha', name: '阿尔法波', icon: '🧠' },
        { id: 'theta', name: '希塔波', icon: '🧘' },
        { id: 'beta', name: '贝塔波', icon: '⚡' },
        { id: 'ocean', name: '海浪声', icon: '🌊' },
        { id: 'rain', name: '雨声', icon: '🌧️' },
        { id: 'night', name: '夏夜虫鸣', icon: '🦗' },
        { id: 'white-noise', name: '白噪音', icon: '🌬️' },
        { id: 'pink-noise', name: '粉红噪音', icon: '🎨' },
        { id: 'brown-noise', name: '布朗噪音', icon: '🌰' },
        { id: 'cafe', name: '咖啡馆环境', icon: '☕' },
        { id: 'fireplace', name: '壁炉声', icon: '🔥' }
      ]);
      setIsSoundListLoaded(true);
    }
  }, [initialSoundsLoaded, getIconComponentByName]);

  // 初始化音频
  useEffect(() => {
    loadAllSounds();
  }, [loadAllSounds]);

  // 使用全局音频管理器
  const { playBgMusic, stopBgMusic, currentBgMusicId } = useGlobalAudio();
  
  // 音频管理 - 独立于番茄钟状态的背景音乐控制
  useEffect(() => {
    let targetSoundId = currentSoundId;
    
    // 如果用户选择了静音，则停止当前背景音乐
    if (targetSoundId === 'mute') {
      stopBgMusic();
    } else {
      // 如果用户选择了音乐，直接播放对应的背景音乐，不需要依赖番茄钟的聚焦状态
      const targetSound = allSounds.find(s => s.id === targetSoundId);
      if (targetSound) {
        // 使用全局音频管理器播放背景音乐
        playBgMusic(targetSoundId);
        
        // 记录音频播放统计
        if (audioStatistics && targetSound.id && targetSound.id !== 'mute') {
          audioStatistics.recordPlay(targetSound.id);
        }
      }
    }
  }, [currentSoundId, allSounds, audioStatistics, playBgMusic, stopBgMusic]);

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

  // 设置音效
  const setSound = useCallback(async (type: string) => {
    // 更新本地音效状态
    setLocalCurrentSoundId(type);
    
    // 如果是静音，则停止当前背景音乐
    if (type === 'mute') {
      stopBgMusic();
    } else {
      // 播放对应的背景音乐
      await playBgMusic(type);
    }
    
    // 记录播放次数
    if (audioStatistics && type !== 'mute') {
      audioStatistics.recordPlay(type);
    }
  }, [audioStatistics, playBgMusic, stopBgMusic]);

  // 切换到下一个音效
  const handleNextSound = useCallback(() => {
    if (allSounds.length === 0) return;
    const currentIndex = allSounds.findIndex(s => s.id === currentSoundId);
    const nextIndex = (currentIndex + 1) % allSounds.length;
    setSound(allSounds[nextIndex].id);
  }, [allSounds, currentSoundId, setSound]);

  // 切换到上一个音效
  const handlePrevSound = useCallback(() => {
    if (allSounds.length === 0) return;
    const currentIndex = allSounds.findIndex(s => s.id === currentSoundId);
    const prevIndex = (currentIndex - 1 + allSounds.length) % allSounds.length;
    setSound(allSounds[prevIndex].id);
  }, [allSounds, currentSoundId, setSound]);

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
        {/* 优化的3D场景组件 */}
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
        
        {/* 退出按钮 */}
        <div className="exit-btn" id="exitBtn" onClick={onExitImmersive}>✕</div>
        
        {/* 帮助按钮和指南 */}
        <div className={`help-btn ${isFocusing && !isPaused ? 'hidden' : ''}`} id="helpBtn" onClick={() => {
          const guideCard = document.getElementById('guideCard');
          if (guideCard) {
            guideCard.classList.toggle('show');
          }
        }}>?</div>
        <div className={`${isNeomorphicDark ? 'guide-card neu-out neomorphic-dark-mode' : isDark ? 'guide-card neu-out dark-mode' : 'guide-card neu-out'}`} id="guideCard">
          <div className="guide-header">
            <h3>🌲 3D专注生态指南</h3>
            <button className="guide-close" id="guideClose" onClick={() => {
              const guideCard = document.getElementById('guideCard');
              if (guideCard) {
                guideCard.classList.remove('show');
              }
            }}>✕</button>
          </div>
          <div className="guide-content">
            <h4>📋 基本规则</h4>
            <ul>
              <li>设定专注时间，点击开始按钮进入专注状态</li>
              <li>完成专注后，获得一棵植物或一只动物</li>
              <li>植物和动物会种植在你的3D森林中</li>
              <li>累计种植更多生命，打造丰富的生态系统</li>
            </ul>
            
            <h4>🎯 操作指南</h4>
            <ul>
              <li>🖱️ <strong>单击能量环</strong> - 开始/继续专注</li>
              <li>🖱️ <strong>双击能量环</strong> - 暂停专注</li>
              <li>🖱️ <strong>双击计时器</strong> - 修改专注时长</li>
              <li>🖱️ <strong>双击统计数据</strong> - 修改总数和今日成就</li>
              <li>🖱️ <strong>拖动鼠标</strong> - 旋转视角</li>
              <li>🖱️ <strong>滚轮缩放</strong> - 放大缩小场景</li>
            </ul>
            
            <h4>🎵 音乐设置</h4>
            <ul>
              <li>点击音乐图标打开音乐菜单</li>
              <li>选择喜欢的背景音乐或静音</li>
              <li>支持多种音效：森林、阿尔法波、希塔波等</li>
            </ul>
            
            <h4>🌿 物种选择</h4>
            <ul>
              <li>右侧面板选择你喜欢的植物或动物</li>
              <li>完成专注后将获得所选物种</li>
              <li>植物和动物会自动分布在森林中</li>
            </ul>
          </div>
        </div>

        {/* UI容器 */}
        <div className="ui-container">
          {/* 顶部数据栏 - 合并的统计面板 - 修改条件，在专注模式下完全隐藏 */}
          <div className={`stats-bar ${isFocusing && !isPaused ? 'hidden' : ''}`}>
            <div 
              ref={totalPlantsRef}
              className={`${isNeomorphicDark ? 'neu-out neomorphic-dark-mode' : isDark ? 'neu-out dark-mode' : 'neu-out'} stats-panel`} 
              id="statsTotal"
              onDoubleClick={startEditTotal}
            >
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
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
                  <div className="flex items-center gap-1">
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
              </div>
            </div>
          </div>
          
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
                      
              <div className="audio-dropdown">
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
                  {localCurrentSoundId === 'mute' 
                    ? <VolumeX size={18} className={isDark ? 'text-zinc-300' : 'text-zinc-600'} /> 
                    : <Waves size={18} className={isDark ? 'text-zinc-300' : 'text-zinc-600'} />
                  }
                </button>
                {isSoundMenuOpen && (
                  <div 
                    ref={soundMenuRef}
                    className={`absolute top-full right-0 mt-2 mr-2 w-64 sm:w-72 md:w-80 rounded-xl p-4 backdrop-blur-sm z-[1000] ${isNeomorphic ? (isDark ? 'bg-[#1e1e2e] border border-zinc-700 shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(30,30,46,0.8)]' : 'bg-[#e0e5ec] border border-slate-300 shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]') : isDark ? 'bg-zinc-900/95 border border-zinc-800' : 'bg-white/95 border border-slate-200 shadow-[10px_10px_20px_rgba(163,177,198,0.4),-10px_-10px_20px_rgba(255,255,255,0.6)]'}`}
                  >
                    {/* 搜索框与切换按钮 */}
                    <div className="mb-3">
                      <div className="relative flex items-center">
                        {/* 搜索框 */}
                        <div className="flex-1 mr-2">
                          <input
                            type="text"
                            placeholder="搜索背景音乐..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full px-4 py-1.5 rounded-[24px] text-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isNeomorphic ? (isDark ? 'bg-[#1e1e2e] border-[#1e1e2e] text-white placeholder-white/50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),inset_-3px_-3px_6px_rgba(30,30,46,1)]' : 'bg-[#e0e5ec] border-[#e0e5ec] text-black placeholder-black/50 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]') : (isDark ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500' : 'bg-white border-slate-300 text-black placeholder-gray-500')}`}
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handlePrevSound}
                            className={`p-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                              isNeomorphic 
                                ? (isDark ? 'bg-[#1e1e2e] shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(30,30,46,0.8)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.5),-6px_-6px_12px_rgba(30,30,46,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5)]')
                                : (isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white shadow-sm' : 'bg-white hover:bg-slate-100 shadow-sm')
                            } ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}
                            title="上一个音乐"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          
                          <button
                            onClick={handleNextSound}
                            className={`p-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                              isNeomorphic 
                                ? (isDark ? 'bg-[#1e1e2e] shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(30,30,46,0.8)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.5),-6px_-6px_12px_rgba(30,30,46,1)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5)]' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,1)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5)]')
                                : (isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white shadow-sm' : 'bg-white hover:bg-slate-100 shadow-sm')
                            } ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}
                            title="下一个音乐"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                      {/* 过滤后的音效列表 */}
                      {allSounds
                        .filter(sound => sound.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(sound => {
                          const icon = getIconComponentByName(sound.name);
                          return (
                            <button 
                              key={sound.id}
                              onClick={async () => {
                                setLocalCurrentSoundId(sound.id);
                                // 立即切换背景音乐
                                if (sound.id === 'mute') {
                                  await stopBgMusic();
                                } else {
                                  await playBgMusic(sound.id);
                                }
                                // 记录播放次数
                                if (sound.id && sound.id !== 'mute' && audioStatistics) {
                                  audioStatistics.recordPlay(sound.id);
                                }
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${localCurrentSoundId === sound.id ? (isNeomorphic ? `${isDark ? 'bg-[#3a3f4e] text-blue-300 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.3),inset_-6px_-6px_12px_rgba(58,63,78,0.8)]' : 'bg-[#d0d5dc] text-blue-600 shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(208,213,220,1)]'}` : isDark ? 'bg-zinc-800 text-white' : 'bg-blue-50 text-blue-600') : (isNeomorphic ? `${isDark ? 'bg-[#1e1e2e] shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(40,43,52,0.8)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(40,43,52,1)] active:shadow-[inset_8px_8px_16px_rgba(0,0,0,0.4),inset_-8px_-8px_16px_rgba(40,43,52,0.9)]' : 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)]'} active:scale-[0.98]` : isDark ? 'hover:bg-zinc-700 text-zinc-300' : 'hover:bg-slate-100 text-slate-700')}`}
                            >
                              <span className={`text-[9px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'} w-4`}>{allSounds.findIndex(s => s.id === sound.id) + 1}.</span>
                              <span className={`text-[16px] ${isDark ? (sound.id === 'mute' ? 'text-zinc-400' : 'text-zinc-300') : 'text-blue-500'}`}>{icon}</span>
                              <span className={`text-xs font-medium ${isDark ? 'text-zinc-300' : isNeomorphic ? 'text-zinc-700' : 'text-slate-700'}`}>{sound.name}</span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 核心：悬浮能量环 */}
            <div 
              className={`focus-ring-container ${isFocusing ? 'focusing' : ''} ${isPaused ? 'paused' : ''}`} 
              id="focusRing"
              onClick={isFocusing ? pauseFocus : startFocus}
            >
              {/* 外部凹槽 */}
              <div className="ring-groove">
                {/* SVG 进度条 */}
                <svg className="progress-ring" viewBox="0 0 240 240">
                  {/* 背景轨道 */}
                  <circle className="progress-ring__circle-bg" r="114" cx="120" cy="120"/>
                  {/* 进度条 */}
                  <circle 
                    className="progress-ring__circle" 
                    id="progressCircle" 
                    r="114" 
                    cx="120" 
                    cy="120"
                    style={{
                      strokeDasharray: 716,
                      strokeDashoffset: 716 - (secondsRemaining / currentDuration) * 716
                    }}
                  />
                </svg>
              </div>

              {/* 内部凸起圆盘 */}
              <div className="center-plate">
                <div 
              className="timer-text" 
              id="timer"
            >{formatTime(secondsRemaining)}</div>
                <div className="status-text" id="statusText">
                  {isFocusing ? (isPaused ? '已暂停 (单击继续)' : '专注生长中...') : '点击开始'}
                </div>
              </div>
            </div>
          </div>

          {/* 侧边种子选择 - 修改条件，在专注模式下完全隐藏 */}
          <div className={`${isNeomorphicDark ? 'neu-out neomorphic-dark-mode' : isDark ? 'neu-out dark-mode' : 'neu-out'} seed-selector ${isFocusing && !isPaused ? 'hidden' : ''}`} id="seedSelector">
            <div className="selector-title">🌿 植物类</div>
            {SPECIES.plants.map(plant => (
              <div 
                key={plant.id}
                id={`opt-${plant.id}`}
                className={`seed-option ${currentSeed === plant.id ? 'active' : ''}`}
                onClick={() => selectSeed(plant.id)}
              >
                <div className="seed-icon">{plant.icon}</div>
                <div className="seed-name">{plant.name}</div>
              </div>
            ))}
            <div className="selector-title mt-4">🐾 动物类</div>
            {SPECIES.animals.map(animal => (
              <div 
                key={animal.id}
                id={`opt-${animal.id}`}
                className={`seed-option ${currentSeed === animal.id ? 'active' : ''}`}
                onClick={() => selectSeed(animal.id)}
              >
                <div className="seed-icon">{animal.icon}</div>
                <div className="seed-name">{animal.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 样式 */}
      <style jsx>{`
        :root {
          --bg-color: #e0e5ec;
          --text-main: #4d5b6d;
          --text-sub: #a3b1c6;
          --text-gray: #64748b;
          --shadow-light: #ffffff;
          --shadow-dark: #a3b1c6;
          --primary-green: #22c55e;
          --primary-blue: #3b82f6;
          --dark-green: #14532d;
          --warn-yellow: #f59e0b;
        }
        
        .dark {
          --bg-color: #1a1a2e;
          --text-main: #f4f4f5;
          --text-sub: #a3b1c6;
          --text-gray: #64748b;
          --shadow-light: #1e293b;
          --shadow-dark: #0f172a;
          --primary-green: #22c55e;
          --primary-blue: #3b82f6;
          --dark-green: #14532d;
          --warn-yellow: #f59e0b;
        }
        
        .neomorphic-dark {
          --bg-color: #1e1e2e;
          --text-main: #f4f4f5;
          --text-sub: #a3b1c6;
          --text-gray: #64748b;
          --shadow-light: #2d2d42;
          --shadow-dark: #0f0f17;
          --primary-green: #22c55e;
          --primary-blue: #3b82f6;
          --dark-green: #14532d;
          --warn-yellow: #f59e0b;
        }
        
        /* 调整拟态深色模式下的透明渐变覆盖层 */
        .neomorphic-dark .bg-gradient-to-t.from-black\/10.to-transparent {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.25), transparent);
        }
        
        /* 深色模式下调整透明渐变覆盖层的样式 */
        .dark .bg-gradient-to-t.from-black\/10.to-transparent {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.25), transparent);
        }

        .ui-container {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          padding: 30px;
          box-sizing: border-box;
          z-index: 10;
        }
        
        @media (max-width: 768px) {
          .ui-container {
            padding: 20px;
          }
        }
        
        @media (max-width: 480px) {
          .ui-container {
            padding: 15px;
          }
        }

        .neu-out {
          background: var(--bg-color);
          border-radius: 16px;
          box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
          border: 1px solid rgba(255,255,255,0.2);
          color: var(--text-main);
        }
        
        .neu-out.dark-mode {
          background: var(--bg-color);
          box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-main);
        }
        
        .neu-out.neomorphic-dark-mode {
          background: var(--bg-color);
          box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-main);
        }
        
        .neomorphic-dark .progress-ring__circle-bg {
          stroke: rgba(55, 65, 81, 0.3); /* zinc-700 equivalent */
          filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.3)) drop-shadow(-2px -2px 2px rgba(255, 255, 255, 0.1));
        }
        
        .neomorphic-dark .timer-text {
          color: #f4f4f5;
        }
        
        .neomorphic-dark .status-text {
          color: var(--text-sub);
        }
        
        .neomorphic-dark .preset-btn {
          color: var(--text-sub);
        }
        
        .neomorphic-dark .preset-btn:hover {
          color: var(--text-main);
        }
        
        .neomorphic-dark .preset-btn.active {
          color: var(--text-main);
        }
        
        .neomorphic-dark .audio-btn {
          color: var(--text-sub);
        }
        
        .neomorphic-dark .audio-btn:hover {
          color: var(--primary-green);
        }
        
        .neomorphic-dark .highlight-num {
          color: var(--text-main);
        }
        
        .neomorphic-dark .seed-option {
          color: var(--text-main);
        }
        
        .neomorphic-dark .seed-option:hover {
          color: var(--primary-green);
        }
        
        .neomorphic-dark .seed-option.active {
          color: var(--primary-green);
        }
        
        .neomorphic-dark .selector-title {
          color: var(--text-sub);
        }
        
        .neomorphic-dark .audio-item {
          color: var(--text-main);
        }
        
        .neomorphic-dark .audio-item:hover {
          color: var(--primary-green);
        }
        
        .neomorphic-dark .audio-item.selected {
          color: var(--primary-green);
        }
        
        .neomorphic-dark .exit-btn {
          color: var(--text-main);
        }
        
        .neomorphic-dark .help-btn {
          color: var(--text-main);
        }

        .stats-bar {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: flex-start;
          width: 100%;
          margin-left: 0px;
          margin-top: 0px;
        }

        .stats-panel {
          pointer-events: auto;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: transform 0.2s ease;
          color: var(--text-main);
          width: auto;
          max-width: 100%;
        }
        
        .stats-panel:hover { transform: translateY(-2px); background: var(--bg-color); }
        .stats-panel:active { transform: scale(0.98); }
        
        .neomorphic-dark .stats-panel {
          color: var(--text-main);
        }

        .highlight-num {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main);
          text-shadow: none;
        }
        
        /* 响应式设计：在较小屏幕上调整stats-panel */
        @media (max-width: 768px) {
          .stats-panel {
            padding: 10px 20px;
            font-size: 12px;
            gap: 8px;
          }
          
          .highlight-num {
            font-size: 16px;
          }
          
          .stats-bar {
            gap: 10px;
          }
        }
        
        @media (max-width: 480px) {
          .stats-panel {
            padding: 8px 16px;
            font-size: 11px;
            gap: 6px;
          }
          
          .highlight-num {
            font-size: 14px;
          }
          
          .stats-bar {
            gap: 8px;
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .stats-combined {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .highlight-num.edit-mode {
          display: flex;
          align-items: center;
        }

        .edit-input {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main);
          background: transparent;
          border: none;
          outline: none;
          width: 60px;
          text-align: center;
          padding: 2px 6px;
          border-radius: 8px;
          box-shadow: inset 2px 2px 5px var(--shadow-dark), inset -2px -2px 5px var(--shadow-light);
        }

        .edit-input:focus {
          box-shadow: inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light);
        }

        .preset-input {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          background: transparent;
          border: none;
          outline: none;
          width: 60px;
          text-align: center;
          padding: 8px 16px;
          border-radius: 20px;
          box-shadow: inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light);
        }

        .preset-input:focus {
          box-shadow: inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light);
        }

        .seed-selector {
          pointer-events: auto;
          position: absolute;
          top: 100px; max-height: calc((100vh - 140px) / 2); right: 30px; width: 160px;
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: translateX(0); opacity: 1;
          z-index: 100;
          min-width: 140px;
        }
        
        @media (max-width: 768px) {
          .seed-selector {
            top: 80px;
            right: 20px;
            width: 140px;
            min-width: 120px;
            padding: 12px;
          }
          
          .selector-title {
            font-size: 11px;
          }
          
          .seed-option {
            gap: 6px;
            padding: 6px 10px;
          }
          
          .seed-icon { 
            font-size: 14px; 
            width: 18px; 
          }
          
          .seed-name { 
            font-size: 10px; 
          }
        }
        
        @media (max-width: 480px) {
          .seed-selector {
            top: 60px;
            right: 10px;
            width: 120px;
            min-width: 100px;
            padding: 10px;
            max-height: calc(100vh - 120px);
          }
          
          .selector-title {
            font-size: 10px;
            margin-bottom: 3px;
          }
          
          .seed-option {
            gap: 5px;
            padding: 5px 8px;
            font-size: 10px;
          }
          
          .seed-icon { 
            font-size: 12px; 
            width: 16px; 
          }
          
          .seed-name { 
            font-size: 9px; 
          }
          
          /* 在极小屏幕上，考虑将选择器移到底部或采用可折叠设计 */
          @media (max-height: 600px) {
            .seed-selector {
              position: fixed;
              top: auto;
              bottom: 10px;
              right: 50%;
              transform: translateX(50%);
              width: 90%;
              max-width: 300px;
            }
          }
        }
        
        .seed-selector.hidden { transform: translateX(150%); opacity: 0; pointer-events: none; }
        .seed-selector::-webkit-scrollbar { width: 0px; }

        .selector-title {
          font-size: 12px; color: var(--text-sub); font-weight: 700; margin-bottom: 5px;
          text-transform: uppercase; letter-spacing: 1px; text-align: center;
        }

        .seed-option {
          display: flex; align-items: center;
          gap: 8px; padding: 8px 12px;
          border-radius: 50px; cursor: pointer; transition: all 0.2s ease;
          background: var(--bg-color);
          box-shadow: 4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light);
          color: var(--text-main);
        }
        .seed-option:hover { transform: translateY(-2px); }
        .seed-option:active { transform: scale(0.98); }
        .seed-option.active {
          box-shadow: inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light);
          color: var(--text-main);
          font-weight: bold;
          transform: none;
        }
        
        .neomorphic-dark .seed-option {
          color: var(--text-main);
        }
        .neomorphic-dark .seed-option:hover { color: var(--primary-green); }
        .neomorphic-dark .seed-option.active {
          color: var(--primary-green);
        }
        .seed-icon { font-size: 16px; width: 20px; text-align: center; }
        .seed-name { font-size: 11px; font-weight: 600; }

        .controls {
          pointer-events: none; /* 让背景3D场景能够接收鼠标事件 */
          align-self: center; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 35px;
          margin-top: auto; /* 移除固定上边距 */
          margin-bottom: 80px; /* 增加底部边距，使元素更靠底部 */
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          background: transparent;
        }
        
        @media (max-width: 768px) {
          .controls {
            margin-bottom: 60px;
          }
        }
        
        @media (max-width: 480px) {
          .controls {
            margin-bottom: 50px;
            gap: 25px;
          }
        }
        
        /* 专门用于控制元素的容器，仅这些元素接收鼠标事件 */
        .controls .focus-ring-container,
        .controls .controls-row {
          pointer-events: auto;
        }

        .focus-ring-container {
          position: relative;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: var(--bg-color);
          box-shadow: 20px 20px 60px var(--shadow-dark), -20px -20px 60px var(--shadow-light);
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
          z-index: 20;
        }

        .focus-ring-container:hover {
          transform: scale(1.02) translateY(-5px);
          box-shadow: 25px 25px 70px var(--shadow-dark), -25px -25px 70px var(--shadow-light);
        }
        .focus-ring-container:active {
          transform: scale(0.98);
        }

        /* 响应式设计：在小屏幕上调整圆环大小 */
        @media (max-width: 768px) {
          .focus-ring-container {
            width: 220px;
            height: 220px;
            margin-top: 80px;
          }
          
          .ring-groove {
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
          }
          
          .center-plate {
            top: 25px;
            left: 25px;
            right: 25px;
            bottom: 25px;
          }
          
          .timer-text {
            font-size: 50px;
          }
          
          .status-text {
            font-size: 14px;
          }
        }
        
        @media (max-width: 480px) {
          .focus-ring-container {
            width: 180px;
            height: 180px;
            margin-top: 60px;
          }
          
          .ring-groove {
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
          }
          
          .center-plate {
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
          }
          
          .timer-text {
            font-size: 40px;
          }
          
          .status-text {
            font-size: 12px;
          }
        }

        .ring-groove {
          position: absolute;
          top: 20px; left: 20px; right: 20px; bottom: 20px;
          border-radius: 50%;
          background: var(--bg-color);
          box-shadow: inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light);
          z-index: 1;
        }

        .progress-ring {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          transform: rotate(-90deg);
          pointer-events: none;
          z-index: 2;
        }

        .progress-ring__circle-bg {
          display: block;
          fill: none;
          stroke: rgba(163, 177, 198, 0.2);
          stroke-width: 6;
        }
        
        .dark .progress-ring__circle-bg {
          stroke: rgba(55, 65, 81, 0.3); /* zinc-700 equivalent */
          filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.3)) drop-shadow(-2px -2px 2px rgba(255, 255, 255, 0.1));
        }

        .progress-ring__circle {
          fill: none;
          stroke: var(--primary-green);
          stroke-width: 6;
          stroke-linecap: round;
          stroke-dasharray: 716;
          stroke-dashoffset: 0;
          transition: stroke-dashoffset 1s linear;
          filter: drop-shadow(0 0 2px rgba(34, 197, 94, 0.4));
          opacity: 1;
        }

        .center-plate {
          position: absolute;
          top: 35px; left: 35px; right: 35px; bottom: 35px;
          border-radius: 50%;
          background: var(--bg-color);
          box-shadow: 6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light);
          z-index: 3;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .timer-text {
          font-size: 68px;
          font-weight: 700;
          color: var(--text-main);
          font-family: 'Segoe UI', Roboto, sans-serif;
          font-variant-numeric: tabular-nums;
          margin-bottom: 2px;
          letter-spacing: -1px;
          text-shadow: 0 0 4px rgba(0,0,0,0.1);
        }
        
        .dark .timer-text {
          color: #f4f4f5;
        }
        
        .status-text {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-sub);
          text-transform: uppercase;
          letter-spacing: 2px;
          transition: all 0.3s;
        }

        .timer-tooltip {
          position: absolute;
          bottom: 50px;  /* 调整位置，移到可见区域内并与其他元素保持适当距离 */
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          font-size: 12px;
          color: var(--text-sub);
          background: rgba(255,255,255,0.6);
          padding: 8px 16px;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          opacity: 0;
          transition: opacity 0.4s ease, transform 0.4s ease;
          pointer-events: none;
          white-space: nowrap;
          z-index: 100;
          backdrop-filter: blur(5px);
          /* 确保元素不会影响布局 */
          visibility: hidden;
        }
        .focus-ring-container:hover .timer-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
          visibility: visible;
        }

        .focus-ring-container.focusing .timer-text { color: var(--text-gray); }
        .focus-ring-container.focusing .status-text { color: var(--primary-green); opacity: 1; }
        
        .focus-ring-container.paused .timer-text { color: var(--warn-yellow); animation: none; }
        .focus-ring-container.paused .status-text { color: var(--warn-yellow); }
        .focus-ring-container.paused .progress-ring__circle { stroke: var(--warn-yellow); }

        .controls-row {
          display: flex; align-items: center; gap: 15px; padding: 10px 15px;
          border-radius: 40px; background: var(--bg-color);
          box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: translateY(0); opacity: 1;
        }
        
        .controls-row.hidden {
          opacity: 0; pointer-events: none; transform: translateY(80px) scale(0.9);
        }

        .preset-btn {
          border: none; background: var(--bg-color); color: var(--text-sub);
          padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.3s ease;
          box-shadow: 3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light);
        }
        .preset-btn:hover { color: var(--text-main); transform: translateY(-1px); }
        .preset-btn:active,
        .preset-btn.active { 
          color: var(--text-main); 
          box-shadow: inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light);
          font-weight: bold;
          transform: scale(0.98);
        }
        
        .neomorphic-dark .preset-btn {
          color: var(--text-sub);
        }
        .neomorphic-dark .preset-btn:hover { color: var(--text-main); }
        .neomorphic-dark .preset-btn:active,
        .neomorphic-dark .preset-btn.active { 
          color: var(--text-main);
        }

        .audio-dropdown { position: relative; }
        .audio-btn {
          background: var(--bg-color); border: none; border-radius: 50%;
          width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 18px; color: var(--text-sub);
          box-shadow: 4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light);
          transition: transform 0.3s ease, color 0.3s ease;
        }
        .audio-btn:hover { color: var(--primary-green); transform: scale(1.1); }
        
        .neomorphic-dark .audio-btn {
          color: var(--text-sub);
        }
        .neomorphic-dark .audio-btn:hover { color: var(--primary-green); }

        /* 旧的音频菜单样式已被替换为新的Tailwind实现，保留此注释以防止样式冲突 */
        /* .audio-menu {
          display: none; position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%);
          width: 140px; padding: 15px; z-index: 100; flex-direction: column; gap: 10px;
          margin-bottom: 0;
        }
        .audio-menu.show {
          display: flex;
        } */
        
        .audio-item {
          pointer-events: auto;
        }
        
        .audio-item {
          padding: 10px; font-size: 13px; color: var(--text-main); cursor: pointer;
          border-radius: 10px; display: flex; align-items: center; gap: 8px;
          background: var(--bg-color);
          box-shadow: 3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light);
        }
        .audio-item:hover { color: var(--primary-green); }
        .audio-item.selected { 
          color: var(--primary-green); font-weight: bold;
          box-shadow: inset 2px 2px 5px var(--shadow-dark), inset -2px -2px 5px var(--shadow-light);
        }
        
        .neomorphic-dark .audio-item {
          color: var(--text-main);
        }
        .neomorphic-dark .audio-item:hover { color: var(--primary-green); }
        .neomorphic-dark .audio-item.selected { 
          color: var(--primary-green);
        }

        .exit-btn {
          position: absolute;
          top: 30px;
          right: 30px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-color);
          box-shadow: 5px 5px 10px var(--shadow-dark), -5px -5px 10px var(--shadow-light);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          color: var(--text-main);
          z-index: 1000;
          transition: all 0.2s ease;
          pointer-events: auto;
        }

        .exit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 7px 7px 14px var(--shadow-dark), -7px -7px 14px var(--shadow-light);
        }
        
        .neomorphic-dark .exit-btn {
          color: var(--text-main);
        }
        
        .exit-btn:active {
          transform: scale(0.95);
        }
        
        .help-btn {
          position: absolute;
          top: 30px;
          right: 80px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-color);
          box-shadow: 5px 5px 10px var(--shadow-dark), -5px -5px 10px var(--shadow-light);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          font-weight: bold;
          color: var(--text-main);
          z-index: 1000;
          transition: transform 0.3s ease, color 0.3s ease;
          pointer-events: auto;
        }
        
        .help-btn:hover {
          transform: scale(1.1);
          color: var(--primary-green);
          box-shadow: 5px 5px 10px var(--shadow-dark), -5px -5px 10px var(--shadow-light);
        }
        
        .neomorphic-dark .help-btn {
          color: var(--text-main);
        }
        .neomorphic-dark .help-btn:hover {
          color: var(--primary-green);
        }
        
        .help-btn:active {
          transform: scale(0.95);
        }
        
        .help-btn.hidden {
          opacity: 0;
          pointer-events: none;
          transform: scale(0.9);
        }
        
        .guide-card {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.9);
          width: 80%;
          max-width: 600px;
          max-height: 90vh;
          padding: 30px;
          background: var(--bg-color);
          box-shadow: 20px 20px 60px var(--shadow-dark), -20px -20px 60px var(--shadow-light);
          border-radius: 20px;
          z-index: 3000;
          display: none;
          flex-direction: column;
          overflow-y: auto;
          pointer-events: auto;
        }
        
        .guide-card.show {
          display: flex;
          animation: fadeInScale 0.3s ease-out forwards;
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        .guide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid rgba(163, 177, 198, 0.2);
        }
        
        .guide-header h3 {
          margin: 0;
          color: var(--text-main);
          font-size: 24px;
          font-weight: 700;
        }
        
        .guide-close {
          background: var(--bg-color);
          border: none;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          color: var(--text-sub);
          box-shadow: 3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light);
          transition: all 0.2s ease;
        }
        
        .guide-close:hover {
          color: var(--text-main);
          transform: translateY(-1px);
          box-shadow: 5px 5px 10px var(--shadow-dark), -5px -5px 10px var(--shadow-light);
        }
        
        .guide-content {
          flex: 1;
          overflow-y: auto;
          padding-right: 10px;
        }
        
        .guide-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .guide-content::-webkit-scrollbar-track {
          background: rgba(163, 177, 198, 0.1);
          border-radius: 3px;
        }
        
        .guide-content::-webkit-scrollbar-thumb {
          background: rgba(163, 177, 198, 0.5);
          border-radius: 3px;
        }
        
        .guide-content::-webkit-scrollbar-thumb:hover {
          background: rgba(163, 177, 198, 0.7);
        }
        
        .guide-content h4 {
          margin: 20px 0 10px 0;
          color: var(--text-main);
          font-size: 16px;
          font-weight: 700;
        }
        
        .guide-content h4:first-child {
          margin-top: 0;
        }
        
        .guide-content ul {
          margin: 0 0 15px 0;
          padding-left: 25px;
          color: var(--text-gray);
          font-size: 14px;
          line-height: 1.6;
        }
        
        .guide-content li {
          margin-bottom: 8px;
        }
        
        .guide-content strong {
          color: var(--text-main);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default OptimizedImmersivePomodoro;