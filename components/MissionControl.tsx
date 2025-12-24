import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  ComposedChart, Area, Line, ReferenceLine, Legend,
  AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceArea, ScatterChart, Scatter, ZAxis, Cell, LineChart
} from 'recharts';
import { Activity, BarChart2, Mountain, Zap, BrainCircuit, Pickaxe, Hexagon, TrendingUp, Anchor, Target, CircleDot, PieChart, RotateCw, Smile, Battery, TrendingDown, Scale, Compass, Layers, GitMerge, Shield, Eye, CheckCircle2, Clock, GripVertical } from 'lucide-react';
import { Theme, Project, Habit } from '../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MissionControlProps {
  theme: Theme;
  projects: Project[];
  habits: Habit[];
}

const MissionControl: React.FC<MissionControlProps> = ({ theme, projects, habits }) => {
  const isDark = theme === 'dark';
  const isNeomorphic = theme === 'neomorphic';
  const bgClass = isDark ? 'bg-zinc-950' : isNeomorphic ? 'bg-[#e0e5ec]' : 'bg-slate-50';
  const cardBg = isDark 
      ? 'bg-zinc-900' 
      : isNeomorphic 
      ? 'bg-[#e0e5ec] rounded-[32px] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_rgba(255,255,255,1)] transition-all duration-200 active:shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,1)]' 
      : 'bg-white shadow-sm';
  const textMain = isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';
  const textSub = isDark ? 'text-zinc-500' : isNeomorphic ? 'text-zinc-600' : 'text-slate-500';

  const [activeChart, setActiveChart] = useState<string>('dip');
  const [chartHeight, setChartHeight] = useState<number>(500);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 组件挂载时计算图表容器的默认高度，使其贴底展开
  useEffect(() => {
    const calculateInitialHeight = () => {
      if (!containerRef.current) return;
      
      // 获取父容器高度
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // 计算可用高度，考虑顶部导航、图表标题等元素的高度
      const headerHeight = 200; // 估计值，包含导航、图表标题等
      const footerHeight = 100; // 估计值，包含底部空间
      const availableHeight = containerRect.height - headerHeight - footerHeight;
      
      // 设置图表容器的初始高度
      const initialHeight = Math.max(500, availableHeight);
      setChartHeight(initialHeight);
    };

    // 初始计算
    calculateInitialHeight();
    
    // 窗口大小变化时重新计算
    window.addEventListener('resize', calculateInitialHeight);
    
    return () => {
      window.removeEventListener('resize', calculateInitialHeight);
    };
  }, []);

  // Drag and Drop state
  const [chartCategories, setChartCategories] = useState<{ [key: string]: string[] }>({
    trend: ['habitCompletion', 'focusTrend', 'dip', 'dunning', 'jcurve', 'antifragile', 'secondcurve', 'compound', 'mining', 'dopamine', 'flow', 'windLaw'],
    concept: ['zone', 'woop', 'peakEnd', 'valueVenn', 'cognitiveOnion', 'learningCycle', 'purpose', 'johariWindow', 'footInDoor', 'deliberatePractice', 'foggBehavior', 'eisenhowerMatrix', 'outputLineModel']
  });

  // Load saved categories from localStorage
  useEffect(() => {
    const savedCategories = localStorage.getItem('chartCategories');
    if (savedCategories) {
      setChartCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save categories to localStorage
  useEffect(() => {
    localStorage.setItem('chartCategories', JSON.stringify(chartCategories));
  }, [chartCategories]);

  // Initialize sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced distance for mobile touch
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Enable touch action for draggable elements
  useEffect(() => {
    const draggableElements = document.querySelectorAll('[draggable="true"]');
    draggableElements.forEach(element => {
      element.style.touchAction = 'none';
    });
    
    return () => {
      draggableElements.forEach(element => {
        element.style.touchAction = '';
      });
    };
  }, []);

  // Create a SortableButton component using useSortable hook
  const SortableButton = React.memo(({ id, chart }: { id: string; chart: any }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id });

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setActiveChart(id);
    };

    // Create smooth animation styles for dragging
    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging ? 'transform 0.1s ease-out' : 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 'auto',
      scale: isDragging ? 1.05 : 1
    };

    return (
      <div
        ref={setNodeRef}
        className={`flex items-center px-4 py-1.5 rounded-[24px] text-xs font-bold transition-all ${getButtonClass(activeChart === id)}`}
        style={style}
        {...attributes}
      >
        {/* Drag handle - only this part handles drag events */}
        <span
          className="cursor-move hover:text-blue-500 transition-colors"
          {...listeners}
        >
          <GripVertical size={10} className="mr-1 text-zinc-500" />
        </span>
        
        {/* Button - only this part handles click events */}
        <button
          onClick={handleClick}
          className="flex items-center gap-1 bg-transparent border-none p-0 m-0 cursor-pointer text-inherit"
        >
          <chart.icon size={12}/> {chart.label}
        </button>
      </div>
    );
  });

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Determine source and destination categories
    let sourceCategory: string | null = null;
    let destCategory: string | null = null;

    for (const [category, charts] of Object.entries(chartCategories)) {
      const chartArray = charts as string[];
      if (chartArray.includes(activeId)) {
        sourceCategory = category;
      }
      if (chartArray.includes(overId) || overId === `category-${category}`) {
        destCategory = overId === `category-${category}` ? category : category;
      }
    }

    if (!sourceCategory || !destCategory) return;

    // Create new categories object
    const newCategories = { ...chartCategories };

    // Remove activeId from source category
    newCategories[sourceCategory] = newCategories[sourceCategory].filter(id => id !== activeId);

    // Find index to insert in destination category
    let insertIndex: number;
    if (overId.startsWith('category-')) {
      // Insert at the beginning of the category
      insertIndex = 0;
    } else {
      // Insert after overId in destination category
      insertIndex = newCategories[destCategory].indexOf(overId) + 1;
    }

    // Add activeId to destination category
    newCategories[destCategory] = [
      ...newCategories[destCategory].slice(0, insertIndex),
      activeId,
      ...newCategories[destCategory].slice(insertIndex)
    ];

    setChartCategories(newCategories);
  };

  // Get chart by id
  const getChartById = (id: string) => {
    return CHARTS.find(chart => chart.id === id);
  };

  // Load saved chart height from localStorage
  useEffect(() => {
    const savedHeight = localStorage.getItem('chartHeight');
    if (savedHeight) {
      const parsedHeight = parseInt(savedHeight);
      // Ensure height is a valid number and within reasonable range
      if (!isNaN(parsedHeight) && parsedHeight >= 300 && parsedHeight <= 1000) {
        setChartHeight(parsedHeight);
      }
    }
  }, []);

  // Save chart height to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('chartHeight', chartHeight.toString());
  }, [chartHeight]);

  // Load saved chart container background settings from localStorage
  useEffect(() => {
    const savedBgHeight = localStorage.getItem('chartContainerHeight');
    if (savedBgHeight) {
      const parsedHeight = parseInt(savedBgHeight);
      // Ensure height is a valid number and within reasonable range
      if (!isNaN(parsedHeight) && parsedHeight >= 300 && parsedHeight <= 1000) {
        setChartHeight(parsedHeight);
      }
    }
  }, []);

  // Save chart container background settings to localStorage
  useEffect(() => {
    localStorage.setItem('chartContainerHeight', chartHeight.toString());
  }, [chartHeight]);

  // Handle mousedown on resize handle
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
    e.preventDefault();
  };

  // Handle mousemove to resize chart
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !chartContainerRef.current) return;

      const containerRect = chartContainerRef.current.getBoundingClientRect();
      const newHeight = Math.max(300, e.clientY - containerRect.top);
      setChartHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // --- ATTRIBUTE RADAR DATA ---
  const attributeData = useMemo(() => {
      const scores = { STR: 50, INT: 50, DIS: 50, CRE: 50, SOC: 50, WEA: 50 }; 
      
      habits.forEach(h => {
          const completions = Object.keys(h.history).length;
          const attr = h.attr || 'DIS';
          if (scores[attr] !== undefined) scores[attr] += completions * (h.reward / 5);
      });

      projects.forEach(p => {
          const totalMin = Object.values(p.dailyFocus as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
          const attr = p.attr || 'WEA';
          const currentScore = scores[attr];
          if (currentScore !== undefined) {
              scores[attr] = currentScore + totalMin / 10;
          }
      });

      return [
          { subject: '力量 (STR)', A: Math.min(150, scores.STR), fullMark: 150 },
          { subject: '智力 (INT)', A: Math.min(150, scores.INT), fullMark: 150 },
          { subject: '自律 (DIS)', A: Math.min(150, scores.DIS), fullMark: 150 },
          { subject: '创造 (CRE)', A: Math.min(150, scores.CRE), fullMark: 150 },
          { subject: '社交 (SOC)', A: Math.min(150, scores.SOC), fullMark: 150 },
          { subject: '财富 (WEA)', A: Math.min(150, scores.WEA), fullMark: 150 },
      ];
  }, [projects, habits]);

  // --- CHART 1: Daily Focus (Last 14 Days) ---
  const dailyFocusData = useMemo(() => {
      const data = [];
      for (let i = 13; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString(); 
          const isoDate = d.toISOString().split('T')[0]; 
          
          const projectMinutes = projects.reduce((acc, p) => acc + (p.dailyFocus[dateStr] || p.dailyFocus[isoDate] || 0), 0);
          const habitMinutes = habits.reduce((acc, h) => acc + (h.history[dateStr] ? h.reward : 0), 0);

          data.push({
              name: `${d.getMonth() + 1}/${d.getDate()}`,
              projects: projectMinutes,
              habits: habitMinutes,
              total: projectMinutes + habitMinutes
          });
      }
      return data;
  }, [projects, habits]);

  // --- CHARTS DATA GENERATORS ---
  const dipData = useMemo(() => {
      const data = [];
      for(let x = 0; x <= 100; x++) {
          let y = 0;
          if (x < 10) y = x * 2; 
          else if (x < 60) y = 20 - (x-10) * 0.3; 
          else y = 5 + Math.pow(1.1, x - 60); 
          data.push({ x, results: y, effort: x });
      }
      return data;
  }, []);

  const dunningData = useMemo(() => {
      const data = [];
      for(let x=0; x<=100; x+=2) {
          let y = 0;
          if (x <= 20) y = x * 5; // Mt Stupid (愚昧之巅)
          else if (x <= 50) y = 100 - (x - 20) * 2.5; // Valley of Despair (绝望之谷)
          else if (x <= 80) y = 25 + (x - 50) * 1.2; // Slope of Enlightenment (开悟之坡)
          else y = 61; // Plateau of Sustainability (持续稳定平原)
          data.push({ x, confidence: y });
      }
      return data;
  }, []);

  const jCurveData = useMemo(() => {
      const data = [];
      for(let t=0; t<=100; t++) {
          let y = t < 30 ? 50 - t : 20 + Math.pow(1.08, t-30)*10;
          data.push({ t, value: y });
      }
      return data;
  }, []);

  const entropyData = useMemo(() => {
      const data = [];
      for(let t=0; t<=100; t++) {
          data.push({ t, chaos: 10 + t*0.9, order: 100 - t*0.5 });
      }
      return data;
  }, []);

  const gritData = useMemo(() => {
      return [
          { name: '激情', val: 80 }, { name: '毅力', val: 95 }, { name: '天赋', val: 40 }, { name: '运气', val: 20 }
      ];
  }, []);

  const antifragileData = useMemo(() => {
      const data = [];
      for(let x=0; x<=100; x+=5) {
          data.push({ stress: x, fragile: 100 - x, antifragile: x < 20 ? x : x + Math.pow(x/10, 2) });
      }
      return data;
  }, []);

  const secondCurveData = useMemo(() => {
      const data = [];
      for(let t=0; t<=100; t++) {
          let c1 = -0.04 * Math.pow(t - 40, 2) + 80;
          if (c1 < 0) c1 = 0;
          let c2 = t > 30 ? -0.04 * Math.pow(t - 80, 2) + 90 : 0;
          if (c2 < 0) c2 = 0;
          data.push({ t, curve1: c1, curve2: c2 });
      }
      return data;
  }, []);

  const compoundData = useMemo(() => {
      const data = [];
      for(let d=0; d<=365; d+=10) {
          data.push({ day: d, better: Math.pow(1.01, d), worse: Math.pow(0.99, d), flat: 1 });
      }
      return data;
  }, []);

  const paretoData = useMemo(() => [
      { name: '关键投入', output: 80, type: 'Vital' },
      { name: '琐碎投入', output: 20, type: 'Trivial' },
  ], []);

  const flywheelData = useMemo(() => {
      const data = [];
      for(let t=0; t<=100; t++) {
          // 飞轮效应 + 第二宇宙加速度融合模型
          // 初始阶段：缓慢积累 (0-40)
          // 加速阶段：指数增长 (40-70) - 类似第二宇宙加速度突破临界点
          // 惯性阶段：稳定高速运转 (70-100)
          let momentum = 0;
          if (t < 40) {
              momentum = t * 0.2; // 初始积累阶段
          } else if (t < 70) {
              // 融合第二宇宙加速度概念：突破临界点后指数增长
              momentum = 8 + Math.pow(1.12, t-40) * 3;
          } else {
              // 惯性运转阶段：高速稳定
              momentum = 8 + Math.pow(1.12, 30) * 3 + (t-70) * 0.5;
          }
          data.push({ time: t, momentum, stage: t < 40 ? '启动阶段' : t < 70 ? '加速阶段' : '惯性阶段' });
      }
      return data;
  }, []);

  const regretData = useMemo(() => [
      { type: '自律之苦', pain: 10, color: '#f59e0b' },
      { type: '遗憾之苦', pain: 100, color: '#ef4444' },
  ], []);

  const energyData = useMemo(() => {
      const data = [];
      for(let t=0; t<180; t+=5) {
          data.push({ time: t, energy: 50 + Math.sin(t/30)*40 });
      }
      return data;
  }, []);

  const dopamineData = useMemo(() => {
      const data = [];
      let baseline = 100;
      let spike = 0;
      for(let t=0; t<24; t++) {
          if (t === 10 || t === 20) { spike = 150; baseline -= 5; } 
          else { spike = Math.max(baseline, spike - 10); baseline += 0.2; }
          data.push({ hour: `${t}:00`, level: spike, baseline: baseline });
      }
      return data;
  }, []);

  const miningData = useMemo(() => {
      const data = [];
      for (let d = 0; d <= 90; d++) {
          let resistance = d < 30 ? 100 - (d * 0.5) : 85 * Math.exp(-0.05 * (d - 30)); 
          let yieldVal = d < 30 ? d * 0.5 : 15 + Math.pow(1.08, d - 30) * 5; 
          data.push({ day: d, resistance, yield: yieldVal });
      }
      return data;
  }, []);

  const flowData = useMemo(() => [
      { x: 10, y: 80, label: '焦虑', type: 'bad' },
      { x: 80, y: 10, label: '无聊', type: 'bad' },
      { x: 50, y: 50, label: '心流', type: 'good' },
      { x: 20, y: 20, label: '冷漠', type: 'neutral' },
      { x: 90, y: 90, label: '巅峰', type: 'good' },
  ], []);

  // --- 新增5个图表的数据生成函数 --- 
  // 成长曲线数据
  const growthCurveData = useMemo(() => {
      const data = [];
      for (let t = 0; t <= 100; t++) {
          data.push({
              time: t,
              linear: t,
              exponential: Math.pow(1.05, t) - 1,
              cyclic: 50 + Math.sin(t / 10) * 40
          });
      }
      return data;
  }, []);

  // 情绪波动数据
  const emotionalRollercoasterData = useMemo(() => {
      const data = [];
      for (let t = 0; t < 100; t++) {
          data.push({
              time: t,
              emotion: 50 + Math.sin(t / 5) * 30 + Math.sin(t / 20) * 20
          });
      }
      return data;
  }, []);

  // 时间分配数据
  const timeAllocationData = useMemo(() => [
      { name: '工作', value: 30, color: '#3b82f6' },
      { name: '学习', value: 25, color: '#10b981' },
      { name: '休息', value: 30, color: '#f59e0b' },
      { name: '娱乐', value: 15, color: '#8b5cf6' },
  ], []);

  // 学习效率数据
  const learningEfficiencyData = useMemo(() => {
      const data = [];
      for (let t = 0; t <= 120; t += 5) {
          // 模拟学习效率曲线，先上升后下降
          const efficiency = t <= 60 ? t * 1.5 : 90 - (t - 60) * 1;
          data.push({
              time: t,
              efficiency
          });
      }
      return data;
  }, []);

  // 新添加的5个图表的数据生成函数
  // 成长心态数据
  const growthMindsetData = useMemo(() => {
      return [
          { name: '面对挑战', fixed: 20, growth: 80 },
          { name: '面对失败', fixed: 10, growth: 70 },
          { name: '面对批评', fixed: 30, growth: 60 },
          { name: '面对他人成功', fixed: 40, growth: 90 },
          { name: '学习意愿', fixed: 50, growth: 100 },
      ];
  }, []);

  // 决策模型数据
  const decisionMakingData = useMemo(() => {
      const data = [];
      for (let x = 0; x <= 100; x += 5) {
          data.push({
              information: x,
              decisionQuality: Math.min(100, x * 0.8 + Math.random() * 10),
              decisionSpeed: Math.max(10, 100 - x * 0.6),
          });
      }
      return data;
  }, []);

  // 生产力金字塔数据
  const productivityPyramidData = useMemo(() => {
      return [
          { name: '基础习惯', value: 40, color: '#3b82f6' },
          { name: '时间管理', value: 25, color: '#10b981' },
          { name: '专注能力', value: 20, color: '#f59e0b' },
          { name: '决策能力', value: 10, color: '#8b5cf6' },
          { name: '创新能力', value: 5, color: '#ef4444' },
      ];
  }, []);

  // 学习循环数据
  const learningCycleData = useMemo(() => {
      return [
          { name: '输入', value: 25, color: '#3b82f6' },
          { name: '处理', value: 25, color: '#10b981' },
          { name: '输出', value: 25, color: '#f59e0b' },
          { name: '反馈', value: 25, color: '#8b5cf6' },
      ];
  }, []);

  // 平衡轮数据
  const balanceWheelData = useMemo(() => {
      return [
          { name: '健康', value: 80, color: '#10b981' },
          { name: '事业', value: 70, color: '#3b82f6' },
          { name: '家庭', value: 60, color: '#f59e0b' },
          { name: '社交', value: 50, color: '#8b5cf6' },
          { name: '学习', value: 90, color: '#ef4444' },
          { name: '休闲', value: 40, color: '#ec4899' },
      ];
  }, []);

  // 新增5个更有哲理和启发的图表数据
  // 富足思维数据
  const abundanceData = useMemo(() => {
      return [
          { name: '稀缺思维', value: 30, color: '#ef4444' },
          { name: '富足思维', value: 70, color: '#10b981' },
      ];
  }, []);

  // 持续改善数据
  const kaizenData = useMemo(() => {
      const data = [];
      for (let t = 0; t <= 365; t += 30) {
          data.push({
              day: t,
              improvement: Math.pow(1.01, t)
          });
      }
      return data;
  }, []);

  // 思维模型数据
  const mentalModelsData = useMemo(() => {
      return [
          { name: '第一性原理', value: 15, color: '#3b82f6' },
          { name: '贝叶斯定理', value: 12, color: '#10b981' },
          { name: '机会成本', value: 18, color: '#f59e0b' },
          { name: '系统思维', value: 20, color: '#8b5cf6' },
          { name: '反馈循环', value: 15, color: '#ef4444' },
          { name: '临界质量', value: 10, color: '#f97316' },
          { name: '奥卡姆剃刀', value: 10, color: '#ec4899' },
      ];
  }, []);

  // 复原力曲线数据
  const resilienceData = useMemo(() => {
      const data = [];
      for (let t = 0; t <= 100; t += 5) {
          let resilience = 0;
          if (t <= 20) resilience = 100 - t * 4; // 初始冲击
          else if (t <= 60) resilience = 20 + (t - 20) * 1.5; // 恢复阶段
          else resilience = 80; // 稳定阶段
          data.push({
              time: t,
              resilience
          });
      }
      return data;
  }, []);

  // 投资领域的微笑曲线数据
  const smileCurveData = useMemo(() => {
      const data = [];
      for (let t = 0; t <= 100; t++) {
          // 微笑曲线公式：先下降后上升的U型曲线
          let value = Math.pow((t - 50) / 25, 2) * 40 + 20;
          data.push({
              time: t,
              value: value,
              label: t < 25 ? '悲观期' : t < 75 ? '底部震荡' : '乐观期'
          });
      }
      return data;
  }, []);

  // 人类需求层次数据
  const purposeData = useMemo(() => {
      return [
          { name: '生理需求', value: 10, color: '#ef4444', description: '食物、水、睡眠等基本生存需求' },
          { name: '安全需求', value: 20, color: '#f59e0b', description: '安全、稳定、保护等需求' },
          { name: '社交需求', value: 30, color: '#10b981', description: '爱、归属、社交关系等需求' },
          { name: '尊重需求', value: 40, color: '#3b82f6', description: '自尊、尊重、成就等需求' },
          { name: '自我实现', value: 50, color: '#8b5cf6', description: '实现潜能、自我发展、创造力等需求' },
      ];
  }, []);

  // 乔哈里视窗四象限数据
  const johariWindowData = useMemo(() => {
      return [
          { 
              quadrant: '公开区', 
              label: '公开区', 
              description: '自己知道，别人也知道', 
              examples: '姓名、外貌、爱好', 
              color: '#3b82f6', 
              fillOpacity: 0.2, 
              x: 0.25, 
              y: 0.25, 
              width: 0.5, 
              height: 0.5 
          },
          { 
              quadrant: '盲区', 
              label: '盲区', 
              description: '自己不知道，别人知道', 
              examples: '缺点、习惯', 
              color: '#ef4444', 
              fillOpacity: 0.2, 
              x: 0.75, 
              y: 0.25, 
              width: 0.5, 
              height: 0.5 
          },
          { 
              quadrant: '隐藏区', 
              label: '隐藏区', 
              description: '自己知道，别人不知道', 
              examples: '秘密、隐私', 
              color: '#f59e0b', 
              fillOpacity: 0.2, 
              x: 0.25, 
              y: 0.75, 
              width: 0.5, 
              height: 0.5 
          },
          { 
              quadrant: '未知区', 
              label: '未知区', 
              description: '自己不知道，别人也不知道', 
              examples: '潜能、潜意识', 
              color: '#10b981', 
              fillOpacity: 0.2, 
              x: 0.75, 
              y: 0.75, 
              width: 0.5, 
              height: 0.5 
          }
      ];
  }, []);

  // 登门槛效应数据
  const footInDoorData = useMemo(() => {
      const data = [];
      // 构建登门槛效应的GT曲线
      for (let i = 0; i <= 100; i++) {
          // 初始阶段：小请求容易接受（低门槛）
          // 中间阶段：门槛逐渐提高，接受度仍然较高
          // 最终阶段：大请求也能被接受
          let acceptanceRate = 0;
          if (i <= 20) {
              // 低门槛请求：接受度很高
              acceptanceRate = 90 - i * 0.5;
          } else if (i <= 60) {
              // 中等门槛：接受度逐渐下降但仍较高
              acceptanceRate = 80 - (i - 20) * 0.75;
          } else {
              // 高门槛：接受度稳定在较高水平
              acceptanceRate = 50 + Math.sin((i - 60) / 10) * 5;
          }
          
          data.push({
              step: i,
              requestSize: i,
              acceptanceRate,
              stage: i <= 20 ? '低门槛' : i <= 60 ? '中等门槛' : '高门槛'
          });
      }
      return data;
  }, []);

  // 刻意练习循环流程数据
  const deliberatePracticeData = useMemo(() => {
      return [
          {
              id: 'goal',
              label: '明确目标',
              description: '设定具体、可衡量的学习目标',
              x: 0.5,
              y: 0.15,
              color: '#3b82f6',
              icon: '🎯'
          },
          {
              id: 'focus',
              label: '专注练习',
              description: '全神贯注地进行刻意练习',
              x: 0.85,
              y: 0.35,
              color: '#ef4444',
              icon: '🔥'
          },
          {
              id: 'feedback',
              label: '获得反馈',
              description: '从老师、教练或自身获得反馈',
              x: 0.85,
              y: 0.65,
              color: '#f59e0b',
              icon: '💬'
          },
          {
              id: 'adjust',
              label: '调整优化',
              description: '根据反馈调整学习策略和方法',
              x: 0.5,
              y: 0.85,
              color: '#10b981',
              icon: '⚙️'
          }
      ];
  }, []);

  // 佛格行为模型数据
  const foggBehaviorData = useMemo(() => {
      return [
          {
              id: 'motivation',
              label: '动机',
              description: '内在驱动力，包括快乐、恐惧、希望等情绪',
              x: 0.3,
              y: 0.2,
              color: '#ef4444',
              icon: '💪'
          },
          {
              id: 'ability',
              label: '能力',
              description: '完成行为的难易程度，受时间、金钱、精力等影响',
              x: 0.7,
              y: 0.2,
              color: '#3b82f6',
              icon: '🛠️'
          },
          {
              id: 'prompt',
              label: '触发',
              description: '提醒或信号，促使行为发生',
              x: 0.5,
              y: 0.6,
              color: '#10b981',
              icon: '🚨'
          },
          {
              id: 'behavior',
              label: '行为',
              description: '当动机、能力和触发同时存在时发生',
              x: 0.5,
              y: 0.4,
              color: '#8b5cf6',
              icon: '✨'
          }
      ];
  }, []);

  // WOOP框架图数据
  const woopData = useMemo(() => {
      return [
          {
              id: 'wish',
              label: '愿望',
              description: '明确你的愿望或目标',
              x: 0.25,
              y: 0.25,
              color: '#3b82f6',
              icon: '✨'
          },
          {
              id: 'outcome',
              label: '结果',
              description: '想象愿望实现后的最佳结果',
              x: 0.75,
              y: 0.25,
              color: '#10b981',
              icon: '🌟'
          },
          {
              id: 'obstacle',
              label: '障碍',
              description: '识别可能阻碍愿望实现的因素',
              x: 0.25,
              y: 0.75,
              color: '#ef4444',
              icon: '⚠️'
          },
          {
              id: 'plan',
              label: '计划',
              description: '制定应对障碍的具体计划',
              x: 0.75,
              y: 0.75,
              color: '#f59e0b',
              icon: '📋'
          }
      ];
  }, []);

  // 风中定律曲线图数据
  const windLawData = useMemo(() => {
      const data = [];
      for (let i = 0; i <= 100; i++) {
          // 风中定律：阻力与速度的平方成正比
          const windResistance = Math.pow(i / 10, 2);
          const progress = i - windResistance;
          data.push({
              speed: i,
              windResistance,
              progress
          });
      }
      return data;
  }, []);

  // 输出线模型数据
  const outputLineModelData = useMemo(() => {
      const data = [];
      for (let i = 0; i <= 100; i++) {
          // 简单的线性关系：产出 = 投入 * 0.8 + 10
          const output = i * 0.8 + 10;
          data.push({
              input: i,
              output
          });
      }
      return data;
  }, []);

  // 人生价值韦恩图数据
  const valueVennData = useMemo(() => {
      return [
          {
              id: 'passion',
              label: '激情',
              x: 0.35,
              y: 0.35,
              radius: 80,
              color: '#ef4444',
              fillOpacity: 0.2
          },
          {
              id: 'talent',
              label: '天赋',
              x: 0.65,
              y: 0.35,
              radius: 80,
              color: '#3b82f6',
              fillOpacity: 0.2
          },
          {
              id: 'market',
              label: '市场',
              x: 0.5,
              y: 0.7,
              radius: 80,
              color: '#10b981',
              fillOpacity: 0.2
          }
      ];
  }, []);

  // 峰终定律数据
  const peakEndData = useMemo(() => {
      return [
          { time: 0, experience: 50, label: '开始' },
          { time: 1, experience: 80, label: '高峰' },
          { time: 2, experience: 30, label: '低谷' },
          { time: 3, experience: 90, label: '高峰' },
          { time: 4, experience: 60, label: '结束' }
      ];
  }, []);

  // 认知洋葱圈模型图数据
  const cognitiveOnionData = useMemo(() => {
      return [
          {
              id: 'core',
              label: '核心价值观',
              description: '最深层的信念和价值观',
              radius: 20,
              color: '#8b5cf6',
              fillOpacity: 0.3
          },
          {
              id: 'beliefs',
              label: '信念',
              description: '指导行为的基本原则',
              radius: 40,
              color: '#10b981',
              fillOpacity: 0.3
          },
          {
              id: 'attitudes',
              label: '态度',
              description: '对事物的看法和感受',
              radius: 60,
              color: '#3b82f6',
              fillOpacity: 0.3
          },
          {
              id: 'behaviors',
              label: '行为',
              description: '外在的行动和表现',
              radius: 80,
              color: '#f59e0b',
              fillOpacity: 0.3
          },
          {
              id: 'identity',
              label: '身份认同',
              description: '自我认知和社会角色',
              radius: 100,
              color: '#ef4444',
              fillOpacity: 0.3
          }
      ];
  }, []);

  // 舒适圈模型数据
  const zoneData = useMemo(() => {
      return [
          {
              id: 'comfort',
              label: '舒适区',
              description: '熟悉与安全',
              radius: 40,
              color: '#10b981',
              fillOpacity: 0.2
          },
          {
              id: 'learning',
              label: '学习区',
              description: '成长与提升',
              radius: 60,
              color: '#3b82f6',
              fillOpacity: 0.2
          },
          {
              id: 'fear',
              label: '恐惧区',
              description: '未知与挑战',
              radius: 80,
              color: '#ef4444',
              fillOpacity: 0.2
          }
      ];
  }, []);

  // 艾格森威尔矩阵（紧急重要矩阵）数据
  const eisenhowerMatrixData = useMemo(() => {
      return [
          {
              id: 'urgentImportant',
              label: '紧急且重要',
              description: '立即行动：危机、截止日期任务',
              x: 0.25,
              y: 0.25,
              color: '#ef4444',
              icon: '🔥',
              quadrant: '第一象限'
          },
          {
              id: 'notUrgentImportant',
              label: '重要不紧急',
              description: '计划安排：长期目标、战略规划',
              x: 0.75,
              y: 0.25,
              color: '#10b981',
              icon: '📅',
              quadrant: '第二象限'
          },
          {
              id: 'urgentNotImportant',
              label: '紧急不重要',
              description: '授权委托：干扰电话、临时请求',
              x: 0.25,
              y: 0.75,
              color: '#f59e0b',
              icon: '🤝',
              quadrant: '第三象限'
          },
          {
              id: 'notUrgentNotImportant',
              label: '不紧急不重要',
              description: '减少或消除：琐碎任务、娱乐消遣',
              x: 0.75,
              y: 0.75,
              color: '#6b7280',
              icon: '❌',
              quadrant: '第四象限'
          }
      ];
  }, []);

  // --- 新增图表数据生成 --- 
  // 习惯完成率趋势图数据 - 联动日常任务
  const habitCompletionData = useMemo(() => {
      const data = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString();
          
          // 计算日常任务（习惯）的完成情况
          const completedHabits = habits.filter(habit => habit.history[dateStr]).length;
          const totalHabits = habits.length;
          
          // 计算主线任务的完成情况
          const completedProjects = projects.filter(project => {
              const subTasks = project.subTasks;
              if (subTasks.length === 0) return false;
              return subTasks.every(task => task.completed);
          }).length;
          const totalProjects = projects.length;
          
          // 计算总任务完成率
          const totalTasks = totalHabits + totalProjects;
          const completedTasks = completedHabits + completedProjects;
          const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          data.push({
              date: `${date.getMonth() + 1}/${date.getDate()}`,
              completionRate,
              completed: completedTasks,
              total: totalTasks,
              habitsCompleted: completedHabits,
              habitsTotal: totalHabits,
              projectsCompleted: completedProjects,
              projectsTotal: totalProjects
          });
      }
      return data;
  }, [habits, projects]);

  // 项目进度雷达图数据
  const projectProgressData = useMemo(() => {
      if (projects.length === 0) return [];
      
      return projects.map(project => {
          const completedTasks = project.subTasks.filter(task => task.completed).length;
          const totalTasks = project.subTasks.length;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          return {
              subject: project.name,
              progress,
              fullMark: 100
          };
      });
  }, [projects]);

  // 习惯属性分布饼图数据
  const habitAttributeData = useMemo(() => {
      const attrCount: { [key: string]: number } = {};
      habits.forEach(habit => {
          const attr = habit.attr || 'DIS';
          attrCount[attr] = (attrCount[attr] || 0) + 1;
      });
      return Object.entries(attrCount).map(([name, value]) => ({
          name,
          value
      }));
  }, [habits]);

  // 每日专注时间趋势图数据
  const focusTimeData = useMemo(() => {
      const data = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString();
          const focusTime = projects.reduce((sum, project) => sum + (project.dailyFocus[dateStr] || 0), 0);
          data.push({
              date: `${date.getMonth() + 1}/${date.getDate()}`,
              focusTime
          });
      }
      return data;
  }, [projects]);

  // 拟态风格样式变量 - 与商品分类管理保持一致
  const neomorphicStyles = {
    bg: 'bg-[#e0e5ec]',
    border: 'border-[#e0e5ec]',
    shadow: 'shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]',
    hoverShadow: 'hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]',
    activeShadow: 'active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]',
    transition: 'transition-all duration-200'
  };
  
  // 生成按钮样式的辅助函数 - 与商品分类管理完全一致
  const getButtonClass = (isActive: boolean, isSpecial?: boolean) => {
    if (isActive) {
      return isSpecial ? 'bg-red-500 text-white transition-all duration-200' : 'bg-blue-500 text-white transition-all duration-200';
    }
    if (isNeomorphic) {
      return `${neomorphicStyles.bg} ${neomorphicStyles.shadow} ${neomorphicStyles.hoverShadow} ${neomorphicStyles.activeShadow} ${neomorphicStyles.transition} text-zinc-700`;
    }
    return isDark ? 'bg-zinc-900 text-zinc-500 hover:border-zinc-700 transition-all duration-200' : 'bg-white text-slate-600 hover:border-slate-200 transition-all duration-200';
  };

  const CHARTS = [
      // 核心指标图表（放在开头）
      { id: 'habitCompletion', label: '任务完成率', desc: '过去7天的任务完成率趋势，直观了解任务执行情况。', deepAnalysis: { concept: '通过观察任务完成率的变化趋势，可以了解自己的执行力和任务规划合理性。', usage: '分析完成率下降的原因，调整任务难度或执行策略。', principle: '任务完成率 = 已完成任务数 / 总任务数 * 100%' }, icon: Smile, color: 'text-yellow-500' },
      { id: 'focusTrend', label: '专注时间趋势', desc: '过去30天的每日专注时间趋势。', deepAnalysis: { concept: '专注时间是衡量生产力的重要指标，反映了深度工作的能力。', usage: '识别专注时间高峰时段，合理安排重要任务。', principle: '注意力是有限资源，需要通过休息和恢复来维持高水平。' }, icon: Compass, color: 'text-green-500' },
      // 原有有价值的图表
      { id: 'dip', label: '死穴区间', desc: '大多数人在“死穴”期（努力>回报）放弃。熬过低谷，即是爆发。', deepAnalysis: { concept: '死穴区间是指努力投入大于回报产出的阶段，是成长的必经之路。', usage: '认识到死穴期是正常现象，坚持度过才能迎来爆发。', principle: '成长曲线不是线性的，而是先下降后上升的S型曲线。' }, icon: Anchor, color: 'text-red-500' },
      { id: 'dunning', label: '达克效应', desc: '从愚昧之巅跌落绝望之谷，是开悟的必经之路。', deepAnalysis: { concept: '达克效应描述了认知偏差：能力越低的人越容易高估自己的能力。', usage: '保持谦卑，持续学习，从绝望之谷走向开悟之坡。', principle: '认知的四个阶段：愚昧之巅、绝望之谷、开悟之坡、持续稳定平原。' }, icon: Mountain, color: 'text-orange-500' },
      { id: 'jcurve', label: 'J型曲线', desc: '创业与成长的真实路径：先下坠（投入期），后飞升（回报期）。', deepAnalysis: { concept: 'J型曲线表明成长需要前期大量投入，短期内可能看不到回报。', usage: '在投入期保持耐心，持续积累，等待拐点到来。', principle: '复利效应需要时间积累，前期的投入是为了后期的爆发。' }, icon: TrendingUp, color: 'text-blue-500' },
      { id: 'antifragile', label: '反脆弱', desc: '脆弱者害怕压力，反脆弱者从压力中获益。', deepAnalysis: { concept: '反脆弱系统在压力、不确定性和波动中茁壮成长。', usage: '主动寻求适度挑战，在压力中提升自己的适应能力。', principle: '压力是成长的催化剂，适度的压力可以增强系统的韧性。' }, icon: Shield, color: 'text-emerald-500' },
      { id: 'secondcurve', label: '第二曲线', desc: '在第一曲线（现有业务/能力）达到巅峰前，开启第二曲线。', deepAnalysis: { concept: '第二曲线理论强调在现有业务仍在增长时，提前布局新业务或能力。', usage: '在舒适区稳定时，主动探索新领域，避免陷入增长瓶颈。', principle: '所有事物都有生命周期，持续创新才能保持增长。' }, icon: GitMerge, color: 'text-purple-500' },
      { id: 'mining', label: '复利/阻力', desc: '初期阻力最大收益最小，后期阻力趋零收益无穷。', deepAnalysis: { concept: '复利效应在长期会产生巨大影响，而初期的阻力会随着时间逐渐减小。', usage: '坚持长期主义，重视微小进步的积累。', principle: '1.01^365 = 37.8，每天进步1%，一年后会有巨大变化。' }, icon: Pickaxe, color: 'text-pink-500' },
      { id: 'flywheel', label: '飞轮效应', desc: '万事开头难。持续推动，突破临界点后，动能自动维持。', deepAnalysis: { concept: '飞轮效应指开始时需要很大力气，一旦转动起来，惯性会让它持续转动。', usage: '在开始阶段投入足够精力，突破临界点后，事情会变得轻松。', principle: '系统的各个部分相互促进，形成正反馈循环。' }, icon: RotateCw, color: 'text-green-500' },
      { id: 'regret', label: '遗憾最小化', desc: '纪律的痛苦是轻的 (盎司)，遗憾的痛苦是重的 (吨)。', deepAnalysis: { concept: '遗憾的痛苦远大于纪律的痛苦，所以要坚持做正确的事情。', usage: '在面对诱惑时，想象未来的遗憾，增强自律动力。', principle: '短期的痛苦可以避免长期的更大痛苦。' }, icon: TrendingDown, color: 'text-rose-500' },
      { id: 'energy', label: '精力波形', desc: '顺应90分钟生理周期，波峰冲刺，波谷休息。', deepAnalysis: { concept: '人的精力是周期性波动的，遵循90分钟的生理节奏。', usage: '在精力高峰时进行高难度工作，波谷时休息或做简单任务。', principle: '注意力持续时间有限，需要定期休息恢复。' }, icon: Battery, color: 'text-blue-400' },
      { id: 'compound', label: '原子习惯', desc: '1.01^365 = 37.8。微小的差异在时间复利下产生巨大的鸿沟。', deepAnalysis: { concept: '原子习惯指微小的、持续的行为改变，通过时间复利产生巨大影响。', usage: '每天培养微小的好习惯，长期积累会带来显著变化。', principle: '习惯的力量在于持续重复，微小的进步积累起来会产生巨大的差异。' }, icon: TrendingUp, color: 'text-indigo-500' },
      { id: 'pareto', label: '80/20法则', desc: '20% 的关键投入带来 80% 的产出。找到那 20%。', deepAnalysis: { concept: '80/20法则表明，少数关键因素决定了大部分结果。', usage: '识别并聚焦于那20%的关键任务，提高工作效率。', principle: '资源是有限的，需要优先分配给最有价值的活动。' }, icon: PieChart, color: 'text-cyan-500' },
      { id: 'dopamine', label: '多巴胺', desc: '高刺激导致基线下降。痛苦（如冷水澡）重置基线。', deepAnalysis: { concept: '多巴胺是一种神经递质，影响动机和奖励系统，高刺激会降低敏感度。', usage: '减少即时满足，培养延迟满足能力，提高长期幸福感。', principle: '痛苦（如冷水澡）可以重置多巴胺基线，提高对生活的敏感度。' }, icon: BrainCircuit, color: 'text-fuchsia-500' },
      { id: 'flow', label: '心流通道', desc: '技能与挑战的完美匹配区。避免焦虑与无聊。', deepAnalysis: { concept: '心流是一种完全沉浸在活动中的状态，此时技能与挑战完美匹配。', usage: '调整任务难度，使其与自身技能匹配，进入心流状态。', principle: '当挑战略高于技能水平时，人们会进入心流状态，体验到最佳表现。' }, icon: Activity, color: 'text-lime-500' },
      { id: 'zone', label: '舒适圈模型', desc: '成长发生在舒适圈之外，通过不断学习和挑战，恐惧区会逐渐转变为舒适区。', deepAnalysis: { concept: '舒适圈模型将人的活动范围分为舒适区、学习区和恐惧区。', usage: '主动走出舒适圈，进入学习区，挑战自己的极限。', principle: '成长发生在舒适圈之外，通过不断学习和挑战，恐惧区会逐渐转变为舒适区。' }, icon: CircleDot, color: 'text-white' },
      { id: 'smileCurve', label: '投资微笑曲线', desc: '投资领域的经典U型曲线，展示了市场周期的变化规律。', deepAnalysis: { concept: '微笑曲线描述了投资市场的周期规律，先下跌后上涨的U型走势。', usage: '理解市场周期，在悲观期布局，在乐观期收获。', principle: '市场情绪和价格往往遵循先悲观、后震荡、再乐观的周期性变化。' }, icon: Smile, color: 'text-yellow-500' },
      // 新增图表
      { id: 'woop', label: 'WOOP框架', desc: 'Wish-Outcome-Obstacle-Plan：科学的目标设定方法。', deepAnalysis: { concept: 'WOOP框架是一种科学的目标设定方法，包括愿望、结果、障碍和计划四个步骤。', usage: '使用WOOP框架设定目标，提高目标实现的成功率。', principle: '通过想象愿望实现的美好结果和可能遇到的障碍，并制定应对计划，可以增强执行力。' }, icon: Target, color: 'text-blue-500' },
      { id: 'peakEnd', label: '峰终定律', desc: '人们对体验的记忆由两个因素决定：高峰时与结束时的感觉。', deepAnalysis: { concept: '峰终定律表明，人们对体验的记忆主要由高峰时和结束时的感受决定。', usage: '在重要事件中，关注高峰体验和结束体验，提高整体满意度。', principle: '记忆是有选择性的，人们更容易记住极端情绪和结尾的体验。' }, icon: TrendingUp, color: 'text-green-500' },
      { id: 'valueVenn', label: '人生价值韦恩图', desc: '激情、天赋与市场的交集，找到你的人生使命。', deepAnalysis: { concept: '人生价值韦恩图展示了激情、天赋和市场的交集，这是找到人生使命的关键。', usage: '分析自己的激情、天赋和市场需求，找到三者的交集。', principle: '当你的工作同时满足激情、天赋和市场需求时，你会体验到最大的满足感和成功。' }, icon: CircleDot, color: 'text-purple-500' },
      { id: 'cognitiveOnion', label: '认知洋葱圈', desc: '从核心价值观到外在行为的认知层次结构。', deepAnalysis: { concept: '认知洋葱圈将人的认知结构分为核心价值观、信念、态度和行为四个层次。', usage: '通过反思认知洋葱圈的各个层次，了解自己的行为动机。', principle: '人的行为是由深层的价值观和信念驱动的，改变行为需要从深层认知入手。' }, icon: Layers, color: 'text-orange-500' },
      // 保留并优化的图表
      { id: 'learningCycle', label: '学习循环', desc: '展示学习的循环过程：输入、处理、输出、反馈。', deepAnalysis: { concept: '学习循环是一个持续的过程，包括输入、处理、输出和反馈四个步骤。', usage: '遵循学习循环，不断巩固和深化知识。', principle: '学习是一个闭环过程，只有通过输出和反馈才能真正掌握知识。' }, icon: RotateCw, color: 'text-purple-500' },
      { id: 'purpose', label: '人类需求层次', desc: '马斯洛需求层次理论，从基本生存到自我实现的需求层级。', deepAnalysis: { concept: '马斯洛需求层次理论将人类需求分为生理、安全、社交、尊重和自我实现五个层次。', usage: '了解自己当前的需求层次，设定相应的目标。', principle: '人的需求是分层的，只有满足了较低层次的需求，才会追求更高层次的需求。' }, icon: Target, color: 'text-yellow-600' },
      { id: 'johariWindow', label: '乔哈里视窗', desc: '通过自我暴露和反馈，扩大公开区，减少盲区和隐藏区，探索未知区。', deepAnalysis: { concept: '乔哈里视窗将人的自我认知分为公开区、盲区、隐藏区和未知区四个象限。', usage: '通过自我暴露和寻求反馈，扩大公开区，减少盲区和隐藏区。', principle: '自我认知是一个持续的过程，通过与他人的互动可以不断发现和了解自己。' }, icon: Eye, color: 'text-blue-500' },
      { id: 'footInDoor', label: '登门槛效应', desc: '先提出小请求，获得承诺后再提出更大的请求，成功率会显著提高。', deepAnalysis: { concept: '登门槛效应指先提出小请求，获得承诺后再提出更大的请求，成功率会显著提高。', usage: '在说服他人或培养习惯时，从简单的小请求开始。', principle: '一旦人们做出了一个小的承诺，为了保持一致性，他们更可能接受更大的请求。' }, icon: Target, color: 'text-green-500' },
      { id: 'deliberatePractice', label: '刻意练习循环', desc: '明确目标 → 专注练习 → 获得反馈 → 调整优化 → 明确目标，形成闭环。', deepAnalysis: { concept: '刻意练习是一种有目的、专注、有反馈的练习方法，是成为专家的关键。', usage: '使用刻意练习方法，不断提高自己的技能水平。', principle: '专家不是天生的，而是通过大量的刻意练习培养出来的。' }, icon: RotateCw, color: 'text-purple-500' },
      { id: 'foggBehavior', label: '佛格行为模型', desc: '行为发生的三要素：动机、能力和触发。只有当三者同时具备时，行为才会发生。', deepAnalysis: { concept: '佛格行为模型认为，行为的发生需要动机、能力和触发三个要素同时具备。', usage: '通过调整动机、能力和触发三个要素，培养良好习惯。', principle: '行为 = 动机 × 能力 × 触发，三个要素缺一不可。' }, icon: Activity, color: 'text-orange-500' },
      { id: 'eisenhowerMatrix', label: '艾森豪威尔矩阵', desc: '根据紧急性和重要性将任务分为四个象限，帮助优化时间管理和决策。', deepAnalysis: { concept: '艾森豪威尔矩阵根据紧急性和重要性将任务分为四个象限，帮助优化时间管理。', usage: '将任务分类到四个象限，优先处理重要紧急的任务，规划重要不紧急的任务。', principle: '时间管理的核心是区分重要和紧急，将精力集中在重要的事情上。' }, icon: Target, color: 'text-indigo-500' },
      { id: 'outputLineModel', label: '输出线模型', desc: '展示输入输出关系的线性模型，帮助理解投入与产出的关系。', deepAnalysis: { concept: '输出线模型展示了输入与输出之间的线性关系，强调了输入的重要性。', usage: '分析投入与产出的关系，识别瓶颈和优化点。', principle: '产出是输入的直接结果，提高输入质量和数量可以增加产出。' }, icon: TrendingUp, color: 'text-cyan-500' },
  ];

  const activeChartObj = CHARTS.find(c => c.id === activeChart) || CHARTS[0];

  return (
    <div ref={containerRef} className={`flex flex-col h-full overflow-y-auto p-6 space-y-6`}>
        
        {/* 所有图表模块 - 合并成一个模块，包含标题和悬浮效果的按钮 */}
        <div className={`p-3 rounded-xl ${isDark ? 'bg-zinc-900' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)]' : 'bg-white shadow-md'} transition-all duration-300 hover:shadow-lg`}>
            {/* 左上角小图标和文字 - 作为模块标题 */}
            <div className="flex items-center gap-2 mb-2">
                <BarChart2 size={12} className="text-yellow-500"/>
                <h3 className="text-[10px] font-bold uppercase text-zinc-500">图表管理</h3>
            </div>
            
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                {/* 合并所有图表分类为一个模块，按钮使用悬浮效果 */}
                <div className="flex flex-wrap gap-2">
                    {/* 趋势图表 */}
                    <SortableContext items={chartCategories.trend} strategy={horizontalListSortingStrategy}>
                        {chartCategories.trend.map(c => {
                            const chart = getChartById(c);
                            if (!chart) return null;
                            return <SortableButton key={c} id={c} chart={chart} />;
                        })}
                    </SortableContext>
                    
                    {/* 概念图形 */}
                    <SortableContext items={chartCategories.concept} strategy={horizontalListSortingStrategy}>
                        {chartCategories.concept.map(c => {
                            const chart = getChartById(c);
                            if (!chart) return null;
                            return <SortableButton key={c} id={c} chart={chart} />;
                        })}
                    </SortableContext>
                </div>
            </DndContext>
        </div>

        {/* Main Grid */}
        <div className="flex flex-col gap-6 pb-20">
            
            {/* Featured Strategic Chart (Full Width Top) */}
            <div 
                ref={chartContainerRef}
                className={`p-4 rounded-lg ${cardBg} lg:col-span-2 flex flex-col relative overflow-hidden group transition-all duration-300 z-0 hover:z-10`} 
                style={{ height: `${chartHeight}px`, minHeight: '300px' }}
            >
                {/* Resize Handle */}
                <div
                    ref={resizeHandleRef}
                    onMouseDown={handleMouseDown}
                    className="absolute bottom-0 left-0 right-0 h-5 cursor-ns-resize bg-gradient-to-t from-zinc-700/30 to-transparent hover:from-blue-500/50 transition-colors duration-200 flex items-center justify-center z-20"
                    style={{ opacity: 1 }}
                >
                    <div className="w-12 h-1.5 bg-zinc-500/50 rounded-full hover:bg-blue-500 transition-colors duration-200"></div>
                </div>
                <div className="flex justify-between items-center mb-2 z-10">
                    <h3 className={`font-bold flex items-center gap-2 ${textMain} text-base`}>
                        <activeChartObj.icon size={16} className={activeChartObj.color}/> {activeChartObj.label}
                    </h3>
                </div>
                <p className={`text-xs ${textSub} mb-4 z-10 max-w-2xl`}>{activeChartObj.desc}</p>
                
                <div className="flex-1 w-full h-full z-10">
                    {/* CHART RENDER LOGIC */}
                        {activeChart === 'attributeRadar' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={attributeData} animationDuration={1000}>
                                    <PolarGrid stroke={isDark ? "#3f3f46" : "#e2e8f0"} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#a1a1aa' : '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fontSize: 8 }} axisLine={false}/>
                                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', fontSize: '12px', color: isDark ? '#fff' : '#000' }}/>
                                    <Radar name="能力值" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'focusHeatmap' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyFocusData} animationDuration={1000}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} vertical={false}/>
                                    <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} interval={0} label={{ value: '日期', position: 'insideBottom' }}/>
                                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} label={{ value: '专注时间 (分钟)', angle: -90, position: 'insideLeft' }}/>
                                    <Tooltip 
                                        cursor={{fill: isDark ? '#27272a' : '#f1f5f9'}}
                                        contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', fontSize: '12px', color: isDark ? '#fff' : '#000' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}/>
                                    <Bar dataKey="projects" name="主线攻坚" stackId="a" fill="#ef4444" radius={[0,0,0,0]} />
                                    <Bar dataKey="habits" name="日常维持" stackId="a" fill="#3b82f6" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'mining' ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={miningData} animationDuration={1000}>
                                <defs>
                                    <linearGradient id="colorResistance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                                    </linearGradient>
                                    <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} />
                                <XAxis dataKey="day" stroke="#71717a" label={{ value: '天数', position: 'insideBottom' }} />
                                <YAxis stroke="#71717a" label={{ value: '值', angle: -90, position: 'insideLeft' }} />
                                <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/>
                                <Area type="monotone" dataKey="resistance" stroke="#ef4444" strokeWidth={2} fill="url(#colorResistance)" name="阻力" />
                                <Area type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={2} fill="url(#colorYield)" name="收益" />
                            </AreaChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'entropy' ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={entropyData} animationDuration={1000}>
                                <defs>
                                    <linearGradient id="colorChaos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                                    </linearGradient>
                                    <linearGradient id="colorOrder" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} />
                                <XAxis dataKey="t" stroke="#71717a" label={{ value: '时间', position: 'insideBottom' }} />
                                <YAxis stroke="#71717a" label={{ value: '熵值', angle: -90, position: 'insideLeft' }} />
                                <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/>
                                <Area type="monotone" dataKey="chaos" stackId="1" stroke="#ef4444" fill="url(#colorChaos)" fillOpacity={0.3} name="自然熵增" />
                                <Area type="monotone" dataKey="order" stackId="1" stroke="#10b981" fill="url(#colorOrder)" fillOpacity={0.3} name="人为有序" />
                            </AreaChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'dip' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dipData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} animationDuration={1000}>
                                    <defs>
                                        <linearGradient id="colorDip" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="10%" stopColor="#3b82f6" />
                                            <stop offset="50%" stopColor="#ef4444" />
                                            <stop offset="90%" stopColor="#10b981" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} horizontal={false}/>
                                    <XAxis dataKey="x" stroke="#71717a" fontSize={10} tickLine={false} label={{ value: '投入努力', position: 'insideBottomRight', offset: -5 }}/>
                                    <YAxis hide/>
                                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/>
                                    <ReferenceArea x1={15} x2={55} strokeOpacity={0} fill="#ef4444" fillOpacity={0.1} label={{ value: "死穴区间", position: 'insideBottom', fontSize: 12, fill: '#ef4444' } as any} />
                                    <Area type="monotone" dataKey="results" stroke="url(#colorDip)" strokeWidth={3} fill="url(#colorDip)" fillOpacity={0.1} name="产出结果" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'dunning' ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dunningData} animationDuration={1000}>
                                <defs>
                                    <linearGradient id="colorDunning" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.05}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark?"#27272a":"#e2e8f0"} />
                                <XAxis dataKey="x" stroke="#71717a" label={{ value: '知识量', position: 'insideBottomRight', offset: -5 }} />
                                <YAxis stroke="#71717a" label={{ value: '自信程度', angle: -90, position: 'insideLeft' }} />
                                <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/>
                                <Area type="monotone" dataKey="confidence" stroke="#f97316" strokeWidth={3} fill="url(#colorDunning)" name="自信程度" />
                                
                                {/* 添加清晰的区域标注 */}
                                <ReferenceArea x1={0} x2={20} stroke="#ef4444" strokeOpacity={0.5} fill="#ef4444" fillOpacity={0.1} label={{ value: '愚昧之巅', position: 'insideTopLeft', fontSize: 12, fill: '#ef4444' } as any} />
                                <ReferenceArea x1={20} x2={50} stroke="#3b82f6" strokeOpacity={0.5} fill="#3b82f6" fillOpacity={0.1} label={{ value: '绝望之谷', position: 'insideBottomLeft', fontSize: 12, fill: '#3b82f6' } as any} />
                                <ReferenceArea x1={50} x2={80} stroke="#10b981" strokeOpacity={0.5} fill="#10b981" fillOpacity={0.1} label={{ value: '开悟之坡', position: 'insideBottomLeft', fontSize: 12, fill: '#10b981' } as any} />
                                <ReferenceArea x1={80} x2={100} stroke="#8b5cf6" strokeOpacity={0.5} fill="#8b5cf6" fillOpacity={0.1} label={{ value: '持续稳定平原', position: 'insideTopLeft', fontSize: 12, fill: '#8b5cf6' } as any} />
                                
                                {/* 添加关键节点标注 */}
                                <text x="10" y="100" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">
                                    愚昧之巅
                                </text>
                                <text x="35" y="200" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="bold">
                                    绝望之谷
                                </text>
                                <text x="65" y="150" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
                                    开悟之坡
                                </text>
                                <text x="90" y="100" textAnchor="middle" fill="#8b5cf6" fontSize="10" fontWeight="bold">
                                    持续稳定平原
                                </text>
                            </AreaChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'jcurve' ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={jCurveData} animationDuration={1000}><CartesianGrid strokeDasharray="3 3" stroke={isDark?"#27272a":"#e2e8f0"} /><XAxis dataKey="t" stroke="#71717a" label={{ value: '时间', position: 'insideBottom' }} /><YAxis stroke="#71717a" label={{ value: '价值', angle: -90, position: 'insideLeft' }} /><Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/><Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={false} name="价值" /><ReferenceLine y={50} label="盈亏平衡点" stroke="#666" strokeDasharray="3 3" /></LineChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'antifragile' ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={antifragileData} animationDuration={1000}><CartesianGrid strokeDasharray="3 3" stroke={isDark?"#27272a":"#e2e8f0"} /><XAxis dataKey="stress" stroke="#71717a" label={{value:'压力/混乱', position:'insideBottom'}} /><YAxis stroke="#71717a" label={{ value: '韧性', angle: -90, position: 'insideLeft' }} /><Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/><Line type="monotone" dataKey="fragile" stroke="#ef4444" strokeWidth={2} name="脆弱" /><Line type="monotone" dataKey="antifragile" stroke="#10b981" strokeWidth={4} name="反脆弱" /></LineChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'secondcurve' ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={secondCurveData} animationDuration={1000}><CartesianGrid strokeDasharray="3 3" stroke={isDark?"#27272a":"#e2e8f0"} /><XAxis dataKey="t" stroke="#71717a" label={{ value: '时间', position: 'insideBottom' }} /><YAxis stroke="#71717a" label={{ value: '价值', angle: -90, position: 'insideLeft' }} /><Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/><Line type="monotone" dataKey="curve1" stroke="#71717a" strokeWidth={2} strokeDasharray="5 5" name="第一曲线" /><Line type="monotone" dataKey="curve2" stroke="#8b5cf6" strokeWidth={4} name="第二曲线" /></LineChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'flywheel' ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={flywheelData} animationDuration={1500} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                                <defs>
                                    <linearGradient id="colorFlywheel" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                                    </linearGradient>
                                    <linearGradient id="colorStage1" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorStage2" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.1}/>
                                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorStage3" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark?"#27272a":"#e2e8f0"} />
                                <XAxis dataKey="time" stroke="#71717a" label={{ value: '时间/投入', position: 'insideBottom', offset: -5 }} />
                                <YAxis stroke="#71717a" label={{ value: '动能/成果', angle: -90, position: 'insideLeft' }} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}
                                    formatter={(value, name, props) => {
                                        return [value.toFixed(1), props.payload.stage];
                                    }}
                                />
                                
                                {/* 阶段背景色 */}
                                <ReferenceArea x1={0} x2={40} fill="url(#colorStage1)" stroke="#3b82f6" strokeOpacity={0.3} strokeDasharray="3 3" />
                                <ReferenceArea x1={40} x2={70} fill="url(#colorStage2)" stroke="#f59e0b" strokeOpacity={0.3} strokeDasharray="3 3" />
                                <ReferenceArea x1={70} x2={100} fill="url(#colorStage3)" stroke="#10b981" strokeOpacity={0.3} strokeDasharray="3 3" />
                                
                                {/* 飞轮效应曲线 */}
                                <Area 
                                    type="monotone" 
                                    dataKey="momentum" 
                                    stroke="#10b981" 
                                    strokeWidth={4} 
                                    fill="url(#colorFlywheel)" 
                                    name="动能" 
                                    dot={false}
                                />
                                
                                {/* 阶段标签 */}
                                <text x="20" y="30" textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">
                                    启动阶段
                                </text>
                                <text x="55" y="30" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">
                                    加速阶段
                                </text>
                                <text x="85" y="30" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">
                                    惯性阶段
                                </text>
                                
                                {/* 关键节点标注 */}
                                <text x="40" y="200" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">
                                    第二宇宙加速度临界点
                                </text>
                                
                                {/* 融合说明 */}
                                <text x="85" y="80" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="10">
                                    飞轮效应 + 第二宇宙加速度
                                </text>
                                <text x="85" y="95" textAnchor="middle" fill={isDark ? "#71717a" : "#94a3b8"} fontSize="9">
                                    突破临界点，进入指数增长
                                </text>
                            </AreaChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'regret' ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regretData} animationDuration={1000}><CartesianGrid strokeDasharray="3 3" stroke={isDark?"#27272a":"#e2e8f0"} /><XAxis dataKey="type" stroke="#71717a" label={{ value: '类型', position: 'insideBottom' }} /><YAxis stroke="#71717a" label={{ value: '痛苦指数', angle: -90, position: 'insideLeft' }} /><Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/><Bar dataKey="pain" name="痛苦指数" radius={[4, 4, 0, 0]}>{regretData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Bar></BarChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'energy' ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={energyData} animationDuration={1000}><CartesianGrid strokeDasharray="3 3" stroke={isDark?"#27272a":"#e2e8f0"} /><XAxis dataKey="time" stroke="#71717a" label={{ value: '时间', position: 'insideBottom' }} /><YAxis stroke="#71717a" label={{ value: '精力水平', angle: -90, position: 'insideLeft' }} /><Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/><Line type="monotone" dataKey="energy" stroke="#3b82f6" strokeWidth={3} dot={false} name="精力水平" /><ReferenceLine y={50} stroke="#666" strokeDasharray="3 3" label="基线" /></LineChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'compound' ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={compoundData} animationDuration={1500} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                                <defs>
                                    <linearGradient id="colorBetter" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                                    </linearGradient>
                                    <linearGradient id="colorWorse" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark?"#27272a":"#e2e8f0"} />
                                <XAxis dataKey="day" stroke="#71717a" label={{ value: '天数', position: 'insideBottom', offset: -5 }} />
                                <YAxis stroke="#71717a" label={{ value: '累积效应', angle: -90, position: 'insideLeft' }} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}
                                    formatter={(value, name) => {
                                        return [value.toFixed(1), name === '进步' ? '每天进步1%' : '每天退步1%'];
                                    }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                                
                                {/* 基线 */}
                                <ReferenceLine y={1} stroke="#666" strokeDasharray="3 3" label="初始状态" />
                                
                                {/* 原子习惯曲线 */}
                                <Line 
                                    type="monotone" 
                                    dataKey="better" 
                                    stroke="#10b981" 
                                    strokeWidth={4} 
                                    dot={false}
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    name="进步" 
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="worse" 
                                    stroke="#ef4444" 
                                    strokeWidth={4} 
                                    dot={false}
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    name="退步" 
                                />
                                
                                {/* 关键节点标注 */}
                                <text x="50" y="150" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
                                    1.6x
                                </text>
                                <text x="150" y="200" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
                                    4.4x
                                </text>
                                <text x="250" y="250" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
                                    11.5x
                                </text>
                                <text x="350" y="300" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
                                    37.8x
                                </text>
                                
                                {/* 原子习惯说明 */}
                                <text x="80%" y="20%" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12" fontWeight="bold">
                                    原子习惯效应
                                </text>
                                <text x="80%" y="25%" textAnchor="middle" fill={isDark ? "#71717a" : "#94a3b8"} fontSize="10">
                                    每天进步1%，一年后
                                </text>
                                <text x="80%" y="30%" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">
                                    37.8倍增长
                                </text>
                                <text x="80%" y="35%" textAnchor="middle" fill={isDark ? "#71717a" : "#94a3b8"} fontSize="10">
                                    微小改变，巨大差异
                                </text>
                            </LineChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'pareto' ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={paretoData} layout="vertical" animationDuration={1000}><CartesianGrid strokeDasharray="3 3" stroke={isDark?"#27272a":"#e2e8f0"} /><XAxis type="number" stroke="#71717a" label={{ value: '产出比例', position: 'insideBottom' }} /><YAxis type="category" dataKey="name" width={80} stroke="#71717a" label={{ value: '投入类型', angle: -90, position: 'insideLeft' }} /><Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/><Bar dataKey="output" name="产出" radius={[0, 4, 4, 0]}>{paretoData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.type === 'Vital' ? '#10b981' : '#71717a'} />))}</Bar></BarChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'dopamine' ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dopamineData} animationDuration={1000}><defs><linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1"><stop offset="10%" stopColor="#3b82f6" stopOpacity="0.8" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={isDark?"#27272a":"#e2e8f0"} /><XAxis dataKey="hour" stroke="#71717a" label={{value:'时间', position:'insideBottom'}} /><YAxis stroke="#71717a" label={{value:'多巴胺水平', angle:-90, position:'insideLeft'}} /><Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/><Area type="monotone" dataKey="level" stroke="#3b82f6" fill="url(#colorLevel)" name="多巴胺水平" /><Line type="monotone" dataKey="baseline" stroke="#10b981" strokeDasharray="5 5" name="基线" /></AreaChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'flow' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart animationDuration={1000}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} />
                                    <XAxis type="number" dataKey="x" name="技能" stroke="#71717a" label={{ value: '技能', position: 'insideBottom' }} domain={[0, 100]} />
                                    <YAxis type="number" dataKey="y" name="挑战" stroke="#71717a" label={{ value: '挑战', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }} />
                                    {/* 绘制心流通道区域 - 添加斜杠效果 */}
                                    <defs>
                                        <pattern id="flowPattern" width={10} height={10} patternUnits="userSpaceOnUse">
                                            <line x1={0} y1={0} x2={10} y2={10} stroke={isDark ? "#10b981" : "#10b981"} strokeWidth={1} />
                                            <line x1={0} y1={10} x2={10} y2={0} stroke={isDark ? "#10b981" : "#10b981"} strokeWidth={1} />
                                        </pattern>
                                    </defs>
                                    <ReferenceArea x1={30} x2={80} y1={30} y2={80} fill="url(#flowPattern)" fillOpacity={0.1} label={{ value: '心流通道', position: 'insideTopRight', fontSize: 12, fill: '#10b981', fontWeight: 'bold' }} stroke="#10b981" strokeWidth={1} strokeDasharray="3 3" />
                                    {/* 添加技能=挑战的参考线 */}
                                    <Line type="monotone" dataKey="x" stroke="#71717a" strokeDasharray="3 3" name="技能=挑战" />
                                    <Scatter name="状态" data={flowData} fill="#8884d8">
                                        {flowData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.type === 'good' ? '#10b981' : (entry.type === 'bad' ? '#ef4444' : '#71717a')} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'zone' ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
                                    {/* Fear Zone (Outer Circle) */}
                                    <circle cx="200" cy="200" r="160" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="3" />
                                    <text x="200" y="60" textAnchor="middle" fill="#ef4444" fontSize="20" fontWeight="bold">恐惧区</text>
                                    <text x="200" y="80" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="14">未知与挑战</text>
                                    
                                    {/* Learning Zone (Middle Circle) */}
                                    <circle cx="200" cy="200" r="120" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="3" />
                                    <text x="200" y="110" textAnchor="middle" fill="#3b82f6" fontSize="20" fontWeight="bold">学习区</text>
                                    <text x="200" y="130" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="14">成长与提升</text>
                                    
                                    {/* Comfort Zone (Inner Circle) */}
                                    <circle cx="200" cy="200" r="80" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="3" />
                                    <text x="200" y="160" textAnchor="middle" fill="#10b981" fontSize="20" fontWeight="bold">舒适区</text>
                                    <text x="200" y="180" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="14">熟悉与安全</text>
                                    
                                    {/* Center Text */}
                                    <text x="200" y="210" textAnchor="middle" fill={isDark ? "#e2e8f0" : "#1e293b"} fontSize="18" fontWeight="bold">你在这里</text>
                                        
                                        {/* Arrows */}
                                        <line x1="200" y1="160" x2="200" y2="200" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />
                                        <line x1="200" y1="240" x2="200" y2="280" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />
                                        <line x1="200" y1="300" x2="200" y2="340" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />
                                        
                                        {/* Progress Text */}
                                        <text x="200" y="230" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="14">→ 探索</text>
                                        <text x="200" y="270" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="14">→ 成长</text>
                                        <text x="200" y="310" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="14">→ 突破</text>
                                </svg>
                            </div>
                        ) : activeChart === 'smileCurve' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={smileCurveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} animationDuration={1000}>
                                    <defs>
                                        <linearGradient id="colorSmile" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity="0.4" />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity="0.05" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} />
                                    <XAxis dataKey="time" stroke="#71717a" label={{ value: '时间/市场周期', position: 'insideBottom' }} />
                                    <YAxis stroke="#71717a" label={{ value: '投资价值', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/>
                                    <Legend />
                                    <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth="3" fill="url(#colorSmile)" name="投资价值" />
                                    <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth="1" dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6, fill: '#f59e0b' }} />
                                    
                                    {/* 添加阶段标注 */}
                                    <ReferenceArea x1={0} x2={25} strokeOpacity={0} fill="#ef4444" fillOpacity={0.1} label={{ value: '悲观期', position: 'insideTopLeft', fontSize: 12, fill: '#ef4444', fontWeight: 'bold' }} />
                                    <ReferenceArea x1={25} x2={75} strokeOpacity={0} fill="#3b82f6" fillOpacity={0.1} label={{ value: '底部震荡', position: 'insideTopLeft', fontSize: 12, fill: '#3b82f6', fontWeight: 'bold' }} />
                                    <ReferenceArea x1={75} x2={100} strokeOpacity={0} fill="#10b981" fillOpacity={0.1} label={{ value: '乐观期', position: 'insideTopLeft', fontSize: 12, fill: '#10b981', fontWeight: 'bold' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'habitCompletion' ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={habitCompletionData} animationDuration={1000}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} />
                                <XAxis dataKey="date" stroke="#71717a" label={{ value: '日期', position: 'insideBottom' }} />
                                <YAxis stroke="#71717a" label={{ value: '完成率 (%)', angle: -90, position: 'insideLeft' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#71717a" label={{ value: '任务数', angle: 90, position: 'insideRight' }} />
                                <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/>
                                <Legend />
                                <Line type="monotone" dataKey="completionRate" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="总完成率" />
                                <Bar dataKey="habitsCompleted" stackId="a" fill="#3b82f6" name="日常任务完成数" yAxisId="right" />
                                <Bar dataKey="projectsCompleted" stackId="a" fill="#ef4444" name="主线任务完成数" yAxisId="right" />
                                <Bar dataKey="total" stackId="b" fill="#71717a" fillOpacity={0.2} name="总任务数" yAxisId="right" />
                            </ComposedChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'projectProgress' ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={projectProgressData} animationDuration={1000}>
                                <PolarGrid stroke={isDark ? "#3f3f46" : "#e2e8f0"} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#a1a1aa' : '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/>
                                <Radar name="项目进度" dataKey="progress" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                            </RadarChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'habitAttributes' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart animationDuration={1000}>
                                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/>
                                    <Legend />
                                    {habitAttributeData.length > 0 ? (
                                        <Pie
                                            data={habitAttributeData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {habitAttributeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={[
                                                    '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#ec4899'
                                                ][index % 7]} />
                                            ))}
                                        </Pie>
                                    ) : (
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize="16">
                                            暂无习惯数据
                                        </text>
                                    )}
                                </PieChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'focusTrend' ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={focusTimeData} animationDuration={1000}>
                                <defs>
                                    <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="10%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} />
                                <XAxis dataKey="date" stroke="#71717a" label={{ value: '日期', position: 'insideBottom' }} />
                                <YAxis stroke="#71717a" label={{ value: '专注时间 (分钟)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/>
                                <Area type="monotone" dataKey="focusTime" stroke="#10b981" fill="url(#colorFocus)" name="专注时间" />
                            </AreaChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'woop' ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <svg width="100%" height="100%" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
                                        {/* 绘制WOOP框架的四个象限 */}
                                        {woopData.map((item, index) => {
                                            const cx = item.x * 300;
                                            const cy = item.y * 300;
                                            return (
                                                <g key={item.id}>
                                                    {/* 背景圆圈 */}
                                                    <circle cx={cx} cy={cy} r="40" fill={item.color} fillOpacity={0.2} stroke={item.color} strokeWidth={2} />
                                                    <circle cx={cx} cy={cy} r="32" fill={isDark ? "#18181b" : "#ffffff"} stroke={item.color} strokeWidth={1} />
                                                    {/* 图标和文字 */}
                                                    <text x={cx} y={cy - 10} textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="18">
                                                        {item.icon}
                                                    </text>
                                                    <text x={cx} y={cy + 8} textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="14" fontWeight="bold">
                                                        {item.label}
                                                    </text>
                                                    <text x={cx} y={cy + 22} textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="10">
                                                        {item.description}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                        
                                        {/* 连接线 */}
                                        <defs>
                                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                                <polygon points="0 0, 10 3.5, 0 7" fill={isDark ? "#a1a1aa" : "#64748b"} />
                                            </marker>
                                        </defs>
                                        {/* 绘制连接线 */}
                                        <line x1="75" y1="75" x2="225" y2="75" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />
                                        <line x1="75" y1="225" x2="225" y2="225" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />
                                        <line x1="75" y1="75" x2="75" y2="225" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />
                                        <line x1="225" y1="75" x2="225" y2="225" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />
                                        <line x1="225" y1="190" x2="225" y2="210" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />
                                        <line x1="125" y1="225" x2="175" y2="225" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />
                                        
                                        {/* 中心文字 */}
                                        <text x="150" y="150" textAnchor="middle" fill={isDark ? "#e2e8f0" : "#1e293b"} fontSize="18" fontWeight="bold">
                                            WOOP框架
                                        </text>
                                        <text x="150" y="165" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12">
                                            科学的目标设定方法
                                        </text>
                                    </svg>
                            </div>
                        ) : activeChart === 'windLaw' ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={windLawData} animationDuration={1000} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                                <defs>
                                    <linearGradient id="colorWindResistance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                                    </linearGradient>
                                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} />
                                <XAxis dataKey="speed" stroke="#71717a" label={{ value: '速度/努力', position: 'insideBottom' }} />
                                <YAxis stroke="#71717a" label={{ value: '值', angle: -90, position: 'insideLeft' }} />
                                <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/>
                                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                                <Area type="monotone" dataKey="windResistance" stroke="#ef4444" strokeWidth={3} fill="url(#colorWindResistance)" name="风阻/阻力" />
                                <Area type="monotone" dataKey="progress" stroke="#10b981" strokeWidth={3} fill="url(#colorProgress)" name="实际进度" />
                            </AreaChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'peakEnd' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={peakEndData} animationDuration={1000} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                                    <defs>
                                        <linearGradient id="colorExperience" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} />
                                    <XAxis dataKey="time" stroke="#71717a" label={{ value: '时间', position: 'insideBottom' }} />
                                    <YAxis stroke="#71717a" label={{ value: '体验值', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/>
                                    <Area type="monotone" dataKey="experience" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorExperience)" name="体验值" />
                                    <Line type="monotone" dataKey="experience" stroke="#8b5cf6" strokeWidth={1} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6, fill: '#8b5cf6' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'valueVenn' ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <svg width="100%" height="100%" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
                                        {/* 绘制三个重叠的圆圈 */}
                                        {valueVennData.map((item) => {
                                            const cx = item.x * 300;
                                            const cy = item.y * 300;
                                            return (
                                                <g key={item.id}>
                                                    <circle cx={cx} cy={cy} r={item.radius} fill={item.color} fillOpacity={item.fillOpacity} stroke={item.color} strokeWidth={2} />
                                                    {/* 图标 - 添加了图标元素 */}
                                                    <text x={cx} y={cy - 5} textAnchor="middle" fill={item.color} fontSize="24">
                                                        {item.id === 'passion' ? '❤️' : item.id === 'talent' ? '🧠' : '💼'}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                        
                                        {/* 标签和描述 */}
                                        <text x="105" y="85" textAnchor="middle" fill="#ef4444" fontSize="16" fontWeight="bold">
                                            {valueVennData[0].label}
                                        </text>
                                        <text x="195" y="85" textAnchor="middle" fill="#3b82f6" fontSize="16" fontWeight="bold">
                                            {valueVennData[1].label}
                                        </text>
                                        <text x="150" y="225" textAnchor="middle" fill="#10b981" fontSize="16" fontWeight="bold">
                                            {valueVennData[2].label}
                                        </text>
                                        
                                        {/* 交集区域的文字 */}
                                        <text x="150" y="150" textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="16" fontWeight="bold">
                                            人生使命
                                        </text>
                                        <text x="150" y="165" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12">
                                            激情、天赋与市场的交集
                                        </text>
                                    </svg>
                            </div>
                        ) : activeChart === 'cognitiveOnion' ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <svg width="100%" height="100%" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
                                        {/* 绘制洋葱圈 */}
                                        {cognitiveOnionData.map((item) => {
                                            return (
                                                <g key={item.id}>
                                                    <circle cx="150" cy="150" r={item.radius} fill={item.color} fillOpacity={item.fillOpacity} stroke={item.color} strokeWidth={2} />
                                                    {/* 文字标签 */}
                                        <text x="150" y={150 + item.radius + 18} textAnchor="middle" fill={item.color} fontSize="13" fontWeight="bold">
                                            {item.label}
                                        </text>
                                        <text x="150" y={150 + item.radius + 30} textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="9">
                                            {item.description}
                                        </text>
                                                </g>
                                            );
                                        })}
                                        
                                        {/* 中心文字 */}
                                        <text x="150" y="150" textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="16" fontWeight="bold">
                                            认知洋葱圈
                                        </text>
                                        <text x="150" y="165" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="10">
                                            从核心到外在的认知层次
                                        </text>
                                    </svg>
                            </div>
                        ) : activeChart === 'learningCycle' ? (
                            <div className="flex flex-col items-center justify-center h-full w-full">
                                <div className="relative w-[300px] h-[300px]">
                                    <svg width="100%" height="100%" viewBox="0 0 350 350">
                                        {/* 绘制中心圆圈 - 缩小半径 */}
                                        <circle cx="175" cy="175" r="70" fill={isDark ? "#18181b" : "#ffffff"} stroke="#8b5cf6" strokeWidth="2" />
                                        <text x="175" y="170" textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="18" fontWeight="bold">
                                            学习循环
                                        </text>
                                        <text x="175" y="185" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="10">
                                            持续改进的闭环
                                        </text>
                                        
                                        {/* 绘制四个阶段的圆圈 - 缩小大小，增加间距 */}
                                        <g>
                                            {/* 输入阶段 */}
                                            <circle cx="175" cy="55" r="40" fill={learningCycleData[0].color} fillOpacity="0.2" stroke={learningCycleData[0].color} strokeWidth="2" />
                                            <circle cx="175" cy="55" r="32" fill={isDark ? "#18181b" : "#ffffff"} stroke={learningCycleData[0].color} strokeWidth="1" />
                                            <text x="175" y="58" textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="14" fontWeight="bold">
                                                {learningCycleData[0].name}
                                            </text>
                                        </g>
                                        
                                        <g>
                                            {/* 处理阶段 */}
                                            <circle cx="305" cy="175" r="40" fill={learningCycleData[1].color} fillOpacity="0.2" stroke={learningCycleData[1].color} strokeWidth="2" />
                                            <circle cx="305" cy="175" r="32" fill={isDark ? "#18181b" : "#ffffff"} stroke={learningCycleData[1].color} strokeWidth="1" />
                                            <text x="305" y="178" textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="14" fontWeight="bold">
                                                {learningCycleData[1].name}
                                            </text>
                                        </g>
                                        
                                        <g>
                                            {/* 输出阶段 */}
                                            <circle cx="175" cy="295" r="40" fill={learningCycleData[2].color} fillOpacity="0.2" stroke={learningCycleData[2].color} strokeWidth="2" />
                                            <circle cx="175" cy="295" r="32" fill={isDark ? "#18181b" : "#ffffff"} stroke={learningCycleData[2].color} strokeWidth="1" />
                                            <text x="175" y="298" textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="14" fontWeight="bold">
                                                {learningCycleData[2].name}
                                            </text>
                                        </g>
                                        
                                        <g>
                                            {/* 反馈阶段 */}
                                            <circle cx="45" cy="175" r="40" fill={learningCycleData[3].color} fillOpacity="0.2" stroke={learningCycleData[3].color} strokeWidth="2" />
                                            <circle cx="45" cy="175" r="32" fill={isDark ? "#18181b" : "#ffffff"} stroke={learningCycleData[3].color} strokeWidth="1" />
                                            <text x="45" y="178" textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="14" fontWeight="bold">
                                                {learningCycleData[3].name}
                                            </text>
                                        </g>
                                        
                                        {/* 绘制连接箭头 - 优化路径 */}
                                        <defs>
                                            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                                <polygon points="0 0, 8 3, 0 6" fill="#8b5cf6" />
                                            </marker>
                                        </defs>
                                        
                                        {/* 输入 → 处理 */}
                                        <path d="M175 95 Q245 95 265 175" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrowhead)" />
                                        
                                        {/* 处理 → 输出 */}
                                        <path d="M305 215 Q305 265 225 285" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrowhead)" />
                                        
                                        {/* 输出 → 反馈 */}
                                        <path d="M175 295 Q105 295 85 215" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrowhead)" />
                                        
                                        {/* 反馈 → 输入 */}
                                        <path d="M45 135 Q45 85 115 65" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrowhead)" />
                                    </svg>
                                </div>
                                <div className="mt-4 text-center max-w-2xl">
                                    <p className={`text-sm ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
                                        学习是一个持续循环的过程：通过输入获取知识，经过处理消化吸收，再输出实践应用，最后通过反馈持续改进。
                                    </p>
                                </div>
                            </div>

                        ) : activeChart === 'purpose' ? (
                            <div className="flex flex-col items-center justify-center h-full w-full p-4">
                                <svg width="100%" height="100%" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
                                    {/* 金字塔标题 */}
                                    <text 
                                        x="150" 
                                        y="25" 
                                        textAnchor="middle" 
                                        fill={isDark ? "#ffffff" : "#000000"} 
                                        fontSize="12" 
                                        fontWeight="bold"
                                    >
                                        马斯洛需求层次
                                    </text>
                                    <text 
                                        x="150" 
                                        y="38" 
                                        textAnchor="middle" 
                                        fill={isDark ? "#a1a1aa" : "#64748b"} 
                                        fontSize="8"
                                    >
                                        人类需求的五个层次
                                    </text>
                                    
                                    {/* 绘制金字塔 - 更美观的五层金字塔 */}
                                    <g>
                                        {/* 生理需求 - 底层 */}
                                        <polygon 
                                            points="150,220 100,270 200,270" 
                                            fill={purposeData[0].color} 
                                            fillOpacity="0.4" 
                                            stroke={purposeData[0].color} 
                                            strokeWidth="1.5"
                                        />
                                        <text 
                                            x="150" 
                                            y="245" 
                                            textAnchor="middle" 
                                            fill={isDark ? "#ffffff" : "#000000"} 
                                            fontSize="10" 
                                            fontWeight="bold"
                                        >
                                            {purposeData[0].name}
                                        </text>
                                        <text 
                                            x="150" 
                                            y="258" 
                                            textAnchor="middle" 
                                            fill={isDark ? "#a1a1aa" : "#64748b"} 
                                            fontSize="7"
                                        >
                                            {purposeData[0].description}
                                        </text>
                                    </g>
                                    
                                    <g>
                                        {/* 安全需求 */}
                                        <polygon 
                                            points="150,180 110,220 190,220" 
                                            fill={purposeData[1].color} 
                                            fillOpacity="0.4" 
                                            stroke={purposeData[1].color} 
                                            strokeWidth="1.5"
                                        />
                                        <text 
                                            x="150" 
                                            y="205" 
                                            textAnchor="middle" 
                                            fill={isDark ? "#ffffff" : "#000000"} 
                                            fontSize="10" 
                                            fontWeight="bold"
                                        >
                                            {purposeData[1].name}
                                        </text>
                                        <text 
                                            x="150" 
                                            y="218" 
                                            textAnchor="middle" 
                                            fill={isDark ? "#a1a1aa" : "#64748b"} 
                                            fontSize="7"
                                        >
                                            {purposeData[1].description}
                                        </text>
                                    </g>
                                    
                                    <g>
                                        {/* 社交需求 */}
                                        <polygon 
                                            points="150,140 120,180 180,180" 
                                            fill={purposeData[2].color} 
                                            fillOpacity="0.4" 
                                            stroke={purposeData[2].color} 
                                            strokeWidth="1.5"
                                        />
                                        <text 
                                            x="150" 
                                            y="165" 
                                            textAnchor="middle" 
                                            fill={isDark ? "#ffffff" : "#000000"} 
                                            fontSize="10" 
                                            fontWeight="bold"
                                        >
                                            {purposeData[2].name}
                                        </text>
                                        <text 
                                            x="150" 
                                            y="178" 
                                            textAnchor="middle" 
                                            fill={isDark ? "#a1a1aa" : "#64748b"} 
                                            fontSize="7"
                                        >
                                            {purposeData[2].description}
                                        </text>
                                    </g>
                                    
                                    <g>
                                        {/* 尊重需求 */}
                                        <polygon 
                                            points="150,100 130,140 170,140" 
                                            fill={purposeData[3].color} 
                                            fillOpacity="0.4" 
                                            stroke={purposeData[3].color} 
                                            strokeWidth="1.5"
                                        />
                                        <text 
                                            x="150" 
                                            y="125" 
                                            textAnchor="middle" 
                                            fill={isDark ? "#ffffff" : "#000000"} 
                                            fontSize="10" 
                                            fontWeight="bold"
                                        >
                                            {purposeData[3].name}
                                        </text>
                                        <text 
                                            x="150" 
                                            y="138" 
                                            textAnchor="middle" 
                                            fill={isDark ? "#a1a1aa" : "#64748b"} 
                                            fontSize="7"
                                        >
                                            {purposeData[3].description}
                                        </text>
                                    </g>
                                    
                                    <g>
                                        {/* 自我实现 - 顶层 */}
                                        <polygon 
                                            points="150,60 140,100 160,100" 
                                            fill={purposeData[4].color} 
                                            fillOpacity="0.4" 
                                            stroke={purposeData[4].color} 
                                            strokeWidth="1.5"
                                        />
                                        <text 
                                            x="150" 
                                            y="85" 
                                            textAnchor="middle" 
                                            fill={isDark ? "#ffffff" : "#000000"} 
                                            fontSize="10" 
                                            fontWeight="bold"
                                        >
                                            {purposeData[4].name}
                                        </text>
                                        <text 
                                            x="150" 
                                            y="98" 
                                            textAnchor="middle" 
                                            fill={isDark ? "#a1a1aa" : "#64748b"} 
                                            fontSize="7"
                                        >
                                            {purposeData[4].description}
                                        </text>
                                    </g>
                                </svg>
                            </div>
                        ) : activeChart === 'johariWindow' ? (
                            <div className="flex flex-col items-center justify-center h-full w-full p-4">
                                <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
                                    {/* 图表标题 */}
                                    <text x="200" y="35" textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="12" fontWeight="bold">
                                        乔哈里视窗
                                    </text>
                                    <text x="200" y="48" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="8">
                                        自我认知与他人认知的四个象限
                                    </text>
                                    
                                    {/* 绘制坐标轴和标签 - 居中十字 */}
                                    <line x1="50" y1="200" x2="350" y2="200" stroke="#71717a" strokeWidth="2" />
                                    <line x1="200" y1="80" x2="200" y2="320" stroke="#71717a" strokeWidth="2" />
                                    
                                    {/* 坐标轴标签 - 优化位置 */}
                                    <text x="360" y="205" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="10" fontWeight="bold">
                                        自己知道
                                    </text>
                                    <text x="40" y="205" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="10" fontWeight="bold">
                                        自己不知道
                                    </text>
                                    <text x="200" y="70" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="10" fontWeight="bold">
                                        别人知道
                                    </text>
                                    <text x="200" y="335" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="10" fontWeight="bold">
                                        别人不知道
                                    </text>
                                    
                                    {/* 绘制四象限背景 - 优化大小和位置，确保十字居中 */}
                                    <rect x="90" y="110" width="110" height="90" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" rx="4" />
                                    <rect x="200" y="110" width="110" height="90" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="2" rx="4" />
                                    <rect x="90" y="200" width="110" height="90" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="2" rx="4" />
                                    <rect x="200" y="200" width="110" height="90" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2" rx="4" />
                                    
                                    {/* 象限标签 - 优化字体大小和位置 */}
                                    <text x="145" y="150" textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">
                                        公开区
                                    </text>
                                    <text x="255" y="150" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold">
                                        盲区
                                    </text>
                                    <text x="145" y="240" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">
                                        隐藏区
                                    </text>
                                    <text x="255" y="240" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">
                                        未知区
                                    </text>
                                    
                                    {/* 象限描述 - 优化字体大小和位置 */}
                                    <text x="145" y="168" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="8">
                                        自己知道，别人也知道
                                    </text>
                                    <text x="255" y="168" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="8">
                                        自己不知道，别人知道
                                    </text>
                                    <text x="145" y="258" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="8">
                                        自己知道，别人不知道
                                    </text>
                                    <text x="255" y="258" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="8">
                                        自己不知道，别人也不知道
                                    </text>
                                    
                                    {/* 象限示例 - 优化字体大小和位置 */}
                                    <text x="145" y="186" textAnchor="middle" fill={isDark ? "#71717a" : "#94a3b8"} fontSize="7">
                                        姓名、外貌
                                    </text>
                                    <text x="255" y="186" textAnchor="middle" fill={isDark ? "#71717a" : "#94a3b8"} fontSize="7">
                                        缺点、习惯
                                    </text>
                                    <text x="145" y="276" textAnchor="middle" fill={isDark ? "#71717a" : "#94a3b8"} fontSize="7">
                                        秘密、隐私
                                    </text>
                                    <text x="255" y="276" textAnchor="middle" fill={isDark ? "#71717a" : "#94a3b8"} fontSize="7">
                                        潜能、潜意识
                                    </text>
                                </svg>
                                <div className="mt-4 text-center max-w-2xl">
                                    <p className={`text-sm ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
                                        乔哈里视窗：通过自我暴露和反馈，扩大公开区，减少盲区和隐藏区，探索未知区。
                                    </p>
                                </div>
                            </div>
                        ) : activeChart === 'footInDoor' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={footInDoorData} animationDuration={1000} margin={{ top: 80, right: 60, left: 40, bottom: 40 }}>
                                    <defs>
                                        <linearGradient id="colorFootInDoor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} />
                                    <XAxis dataKey="requestSize" stroke="#71717a" label={{ value: '请求大小', position: 'insideBottom', offset: -5 }} fontSize={12} />
                                    <YAxis stroke="#71717a" label={{ value: '接受率 (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} fontSize={12} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}
                                        formatter={(value, name, props) => {
                                            const data = props.payload as any;
                                            return [value.toFixed(1) + '%', data.stage];
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                    
                                    {/* 登门槛效应曲线 */}
                                    <Line 
                                        type="monotone" 
                                        dataKey="acceptanceRate" 
                                        stroke="#10b981" 
                                        strokeWidth={4} 
                                        dot={false}
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        name="接受率"
                                    />
                                    
                                    {/* 阶段划分 */}
                                    <ReferenceArea x1={0} x2={20} fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeOpacity={0.3} strokeDasharray="3 3" />
                                    <ReferenceArea x1={20} x2={60} fill="#f59e0b" fillOpacity="0.1" stroke="#f59e0b" strokeOpacity={0.3} strokeDasharray="3 3" />
                                    <ReferenceArea x1={60} x2={100} fill="#ef4444" fillOpacity="0.1" stroke="#ef4444" strokeOpacity={0.3} strokeDasharray="3 3" />
                                    
                                    {/* 阶段标签 - 优化位置避免重叠 */}
                                    <text x="10" y="50" textAnchor="middle" fill="#3b82f6" fontSize="14" fontWeight="bold">
                                        低门槛阶段
                                    </text>
                                    <text x="40" y="70" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="bold">
                                        中等门槛阶段
                                    </text>
                                    <text x="80" y="50" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold">
                                        高门槛阶段
                                    </text>
                                    
                                    {/* 关键节点标注 - 优化位置和大小 */}
                                    <circle cx="20" cy={130} r={6} fill="#3b82f6" stroke="white" strokeWidth="2" />
                                    <text x="20" y="145" textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">
                                        初始承诺
                                    </text>
                                    
                                    <circle cx="60" cy={115} r={6} fill="#f59e0b" stroke="white" strokeWidth="2" />
                                    <text x="60" y="130" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">
                                        门槛提升
                                    </text>
                                    
                                    <circle cx="100" cy={110} r={6} fill="#ef4444" stroke="white" strokeWidth="2" />
                                    <text x="100" y="125" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold">
                                        最终请求
                                    </text>
                                    
                                    {/* 登门槛效应说明 - 优化位置和大小 */}
                                    <text x="85%" y="15%" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="14" fontWeight="bold">
                                        登门槛效应
                                    </text>
                                    <text x="85%" y="20%" textAnchor="middle" fill={isDark ? "#71717a" : "#94a3b8"} fontSize="12">
                                        先提出小请求，获得承诺后
                                    </text>
                                    <text x="85%" y="25%" textAnchor="middle" fill={isDark ? "#71717a" : "#94a3b8"} fontSize="12">
                                        再提出更大的请求，成功率显著提高
                                    </text>
                                </LineChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'deliberatePractice' ? (
                            <div className="flex flex-col items-center justify-center h-full w-full">
                                <div className="relative w-[300px] h-[300px]">
                                    <svg width="100%" height="100%" viewBox="0 0 400 400">
                                        {/* 绘制背景圆环 - 缩小半径 */}
                                        <circle cx="200" cy="200" r="160" fill="none" stroke={isDark ? "#3f3f46" : "#e2e8f0"} strokeWidth="2" />
                                        
                                        {/* 绘制连接箭头 - 优化路径 */}
                                        {/* 1. 明确目标 → 专注练习 */}
                                        <path d="M200 80 C280 100 320 160 320 200" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,4" />
                                        <path d="M320 200 L330 210 L320 220 Z" fill="#8b5cf6" />
                                        
                                        {/* 2. 专注练习 → 获得反馈 */}
                                        <path d="M320 200 C320 260 280 300 220 320" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,4" />
                                        <path d="M220 320 L210 330 L200 320 Z" fill="#8b5cf6" />
                                        
                                        {/* 3. 获得反馈 → 调整优化 */}
                                        <path d="M220 320 C160 320 120 280 100 220" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,4" />
                                        <path d="M100 220 L90 210 L100 200 Z" fill="#8b5cf6" />
                                        
                                        {/* 4. 调整优化 → 明确目标 */}
                                        <path d="M100 220 C100 160 140 120 200 100" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,4" />
                                        <path d="M200 100 L210 90 L220 100 Z" fill="#8b5cf6" />
                                        
                                        {/* 绘制各个阶段 - 优化大小和位置 */}
                                        {deliberatePracticeData.map((stage, index) => {
                                            const x = stage.x * 400;
                                            const y = stage.y * 400;
                                            return (
                                                <g key={stage.id}>
                                                    {/* 阶段圆圈 - 缩小半径，增加间距 */}
                                                    <circle cx={x} cy={y} r={45} fill={stage.color} fillOpacity="0.2" stroke={stage.color} strokeWidth="2" />
                                                    <circle cx={x} cy={y} r={35} fill={isDark ? "#18181b" : "#ffffff"} stroke={stage.color} strokeWidth="2" />
                                                    
                                                    {/* 阶段图标 */}
                                                    <text x={x} y={y - 12} textAnchor="middle" fontSize="24">{stage.icon}</text>
                                                    
                                                    {/* 阶段标签 */}
                                                    <text x={x} y={y + 20} textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="14" fontWeight="bold">
                                                        {stage.label}
                                                    </text>
                                                    
                                                    {/* 阶段描述 - 优化位置和大小，避免重叠 */}
                                                    <text x={x} y={y + 55} textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="10" width="100" textLength="100">
                                                        {stage.description}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                        
                                        {/* 中心文字 - 缩小大小 */}
                                        <circle cx="200" cy="200" r="50" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="2" />
                                        <text x="200" y="200" textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="18" fontWeight="bold">
                                            刻意练习
                                        </text>
                                        <text x="200" y="218" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="11">
                                            闭环执行
                                        </text>
                                    </svg>
                                </div>
                                <div className="mt-4 text-center max-w-2xl">
                                    <p className={`text-sm ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
                                        刻意练习循环：通过明确目标、专注练习、获得反馈和调整优化，形成持续成长的闭环。
                                    </p>
                                </div>
                            </div>
                        ) : activeChart === 'foggBehavior' ? (
                            <div className="flex flex-col items-center justify-center h-full w-full p-4">
                                <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
                                        {/* 绘制三角形背景 - 优化大小 */}
                                        <polygon points="200,100 340,300 60,300" fill="#8b5cf6" fillOpacity="0.1" stroke="#8b5cf6" strokeWidth="2" />
                                        
                                        {/* 绘制三个要素之间的连接线 - 优化路径 */}
                                        <line x1="200" y1="100" x2="340" y2="300" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,4" />
                                        <line x1="340" y1="300" x2="60" y2="300" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,4" />
                                        <line x1="60" y1="300" x2="200" y2="100" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,4" />
                                        
                                        {/* 绘制行为发生区域 - 缩小大小 */}
                                        <circle cx="200" cy="200" r="40" fill="#8b5cf6" fillOpacity="0.3" stroke="#8b5cf6" strokeWidth="2" />
                                        
                                        {/* 绘制各个要素 - 优化大小和位置 */}
                                        {foggBehaviorData.map((element, index) => {
                                            const x = element.x * 400;
                                            const y = element.y * 400;
                                            return (
                                                <g key={element.id}>
                                                    {/* 要素圆圈 - 缩小大小 */}
                                                    <circle cx={x} cy={y} r={45} fill={element.color} fillOpacity="0.2" stroke={element.color} strokeWidth="2" />
                                                    <circle cx={x} cy={y} r={35} fill={isDark ? "#18181b" : "#ffffff"} stroke={element.color} strokeWidth="1" />
                                                    
                                                    {/* 要素图标 */}
                                                    <text x={x} y={y - 10} textAnchor="middle" fontSize="24">{element.icon}</text>
                                                    
                                                    {/* 要素标签 */}
                                        <text x={x} y={y + 20} textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="16" fontWeight="bold">
                                            {element.label}
                                        </text>
                                        
                                        {/* 要素描述 - 优化位置和大小，避免堆叠 */}
                                        <text x={x} y={y + 50} textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12" width="100" textLength="100">
                                            {element.description}
                                        </text>
                                                </g>
                                            );
                                        })}
                                        
                                        {/* 行为发生文字 - 缩小大小 */}
                                        <text x="200" y="205" textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="16" fontWeight="bold">
                                            行为发生
                                        </text>
                                        
                                        {/* 佛格行为模型公式 - 优化位置 */}
                                        <text x="200" y="340" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12" fontWeight="bold">
                                            行为 = 动机 + 能力 + 触发
                                        </text>
                                        
                                        {/* 模型说明 - 优化位置和大小 */}
                                        <text x="200" y="360" textAnchor="middle" fill={isDark ? "#71717a" : "#94a3b8"} fontSize="10">
                                            只有当三个要素同时具备时，行为才会发生
                                        </text>
                                </svg>
                                <div className="mt-4 text-center max-w-2xl">
                                    <p className={`text-sm ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
                                        佛格行为模型：行为发生需要三个要素的结合，动机提供驱动力，能力决定难易程度，触发提供行动信号。
                                    </p>
                                </div>
                            </div>
                        ) : activeChart === 'outputLineModel' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={outputLineModelData} animationDuration={1000}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} />
                                    <XAxis dataKey="input" stroke="#71717a" label={{ value: '投入', position: 'insideBottom' }} />
                                    <YAxis stroke="#71717a" label={{ value: '产出', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}/>
                                    <Legend />
                                    <Line type="monotone" dataKey="output" stroke="#06b6d4" strokeWidth={3} name="产出" />
                                    <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'eisenhowerMatrix' ? (
                            <div className="flex flex-col items-center justify-center h-full w-full p-4">
                                <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
                                        {/* 绘制矩阵网格 */}
                                        <rect x="50" y="50" width="300" height="300" fill="none" stroke={isDark ? "#3f3f46" : "#e2e8f0"} strokeWidth="2" />
                                        <line x1="200" y1="50" x2="200" y2="350" stroke={isDark ? "#3f3f46" : "#e2e8f0"} strokeWidth="2" />
                                        <line x1="50" y1="200" x2="350" y2="200" stroke={isDark ? "#3f3f46" : "#e2e8f0"} strokeWidth="2" />
                                        
                                        {/* 绘制四个象限 */}
                                        {eisenhowerMatrixData.map((quadrant, index) => {
                                            const x = quadrant.x * 400;
                                            const y = quadrant.y * 400;
                                            const rectX = quadrant.x < 0.5 ? 50 : 200;
                                            const rectY = quadrant.y < 0.5 ? 50 : 200;
                                            return (
                                                <g key={quadrant.id}>
                                                    {/* 象限背景 */}
                                                    <rect x={rectX} y={rectY} width="150" height="150" fill={quadrant.color} fillOpacity="0.1" stroke={quadrant.color} strokeWidth="1" />
                                                    
                                                    {/* 象限圆圈 */}
                                                    <circle cx={x} cy={y} r={45} fill={quadrant.color} fillOpacity="0.2" stroke={quadrant.color} strokeWidth="3" />
                                                    <circle cx={x} cy={y} r={35} fill={isDark ? "#18181b" : "#ffffff"} stroke={quadrant.color} strokeWidth="2" />
                                                    
                                                    {/* 象限图标 */}
                                                    <text x={x} y={y - 10} textAnchor="middle" fontSize="24">{quadrant.icon}</text>
                                                    
                                                    {/* 象限标签 */}
                                                    <text x={x} y={y + 20} textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="14" fontWeight="bold">
                                                        {quadrant.label}
                                                    </text>
                                                    
                                                    {/* 象限描述 */}
                                                    <text x={x} y={y + 60} textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="10" width="120" textLength="120">
                                                        {quadrant.description}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                        
                                        {/* 坐标轴标签 */}
                                        <text x="380" y="120" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12" fontWeight="bold">
                                            紧急
                                        </text>
                                        <text x="20" y="120" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12" fontWeight="bold">
                                            不紧急
                                        </text>
                                        <text x="200" y="30" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12" fontWeight="bold">
                                            重要
                                        </text>
                                        <text x="200" y="380" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12" fontWeight="bold">
                                            不重要
                                        </text>
                                        
                                        {/* 矩阵标题 */}
                                        <text x="200" y="390" textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="14" fontWeight="bold">
                                            艾森豪威尔矩阵 (紧急-重要矩阵)
                                        </text>
                                </svg>
                                <div className="mt-4 text-center">
                                    <p className={`text-sm ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
                                        艾森豪威尔矩阵：根据紧急性和重要性将任务分类，帮助你优化时间管理，优先处理重要事务。
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">选择一个图表查看</div>
                        )}
                </div>

            {/* Deep Analysis Module - Separate Section */}
            {activeChartObj.deepAnalysis && (
                <div className={`p-4 rounded-xl border ${cardBg} z-10`}>
                    <h3 className={`font-bold flex items-center gap-2 ${textMain} text-base mb-3`}>
                        <BrainCircuit size={16} className={isDark ? 'text-purple-400' : 'text-purple-600'}/> 深度解析 - {activeChartObj.label}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-4 rounded-lg border ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-slate-200'}`}>
                            <h4 className={`text-sm font-bold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>概念</h4>
                            <p className={`text-sm ${textSub}`}>{activeChartObj.deepAnalysis.concept}</p>
                        </div>
                        <div className={`p-4 rounded-lg border ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-slate-200'}`}>
                            <h4 className={`text-sm font-bold mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>使用方法</h4>
                            <p className={`text-sm ${textSub}`}>{activeChartObj.deepAnalysis.usage}</p>
                        </div>
                        <div className={`p-4 rounded-lg border ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-slate-200'}`}>
                            <h4 className={`text-sm font-bold mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>原理</h4>
                            <p className={`text-sm ${textSub}`}>{activeChartObj.deepAnalysis.principle}</p>
                        </div>
                    </div>
                </div>
            )}


        </div>
    </div>
    </div>
  );
};

export default MissionControl;