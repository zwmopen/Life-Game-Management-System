import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  ComposedChart, Area, Line, ReferenceLine, Legend,
  AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceArea, ScatterChart, Scatter, ZAxis, Cell, LineChart, Pie
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
  const [chartHeight, setChartHeight] = useState<number>(400);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 组件挂载时确保图表容器有固定高度
  useEffect(() => {
    // 固定图表高度为400px，确保图表始终有有效高度
    const chartHeight = 400;
    setChartHeight(chartHeight);
  }, []);

  // Drag and Drop state
  const [chartCategories, setChartCategories] = useState<{ [key: string]: string[] }>({
    trend: ['habitCompletion', 'focusTrend', 'dip', 'dunning', 'jcurve', 'antifragile', 'secondcurve', 'compound', 'mining', 'dopamine', 'flow', 'windLaw'],
    concept: ['zone', 'woop', 'peakEnd', 'valueVenn', 'learningCycle', 'purpose', 'johariWindow', 'footInDoor', 'deliberatePractice', 'foggBehavior', 'eisenhowerMatrix']
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
      (element as HTMLElement).style.touchAction = 'none';
    });
    
    return () => {
      draggableElements.forEach(element => {
        (element as HTMLElement).style.touchAction = '';
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
          { name: '社交需求', value: 30, color: '#fde047', description: '爱、归属、社交关系等需求' },
          { name: '尊重需求', value: 40, color: '#22c55e', description: '自尊、尊重、成就等需求' },
          { name: '自我实现', value: 50, color: '#3b82f6', description: '实现潜能、自我发展、创造力等需求' },
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

  // 福格行为模型数据 - 生成坐标图所需的曲线数据
  const foggBehaviorData = useMemo(() => {
      // 生成行为激活曲线数据
      const curveData = [];
      for (let ability = 0; ability <= 100; ability += 5) {
          // 行为激活曲线：低能力需要高动机，高能力可以接受低动机
          const motivation = Math.max(0, 100 - ability * 0.8 + Math.sin(ability / 10) * 5);
          curveData.push({ ability, motivation });
      }
      return {
          curveData,
          elements: [
              {
                  id: 'motivation',
                  label: '动机',
                  description: '内在驱动力，包括快乐、恐惧、希望等情绪',
                  x: 50,
                  y: 90,
                  color: '#ef4444',
                  icon: '💪'
              },
              {
                  id: 'ability',
                  label: '能力',
                  description: '完成行为的难易程度，受时间、金钱、精力等影响',
                  x: 90,
                  y: 50,
                  color: '#3b82f6',
                  icon: '🛠️'
              },
              {
                  id: 'prompt',
                  label: '触发',
                  description: '提醒或信号，促使行为发生',
                  x: 10,
                  y: 10,
                  color: '#10b981',
                  icon: '🚨'
              }
          ]
      };
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

  // 人生价值韦恩图数据
  const valueVennData = useMemo(() => {
      return [
          {
              id: 'passion',
              label: '激情',
              x: 0.35,
              y: 0.35,
              radius: 50,
              color: '#ef4444',
              fillOpacity: 0.2
          },
          {
              id: 'talent',
              label: '天赋',
              x: 0.65,
              y: 0.35,
              radius: 50,
              color: '#3b82f6',
              fillOpacity: 0.2
          },
          {
              id: 'market',
              label: '市场',
              x: 0.5,
              y: 0.7,
              radius: 50,
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
              radius: 15,
              color: '#8b5cf6',
              fillOpacity: 0.3
          },
          {
              id: 'beliefs',
              label: '信念',
              description: '指导行为的基本原则',
              radius: 30,
              color: '#10b981',
              fillOpacity: 0.3
          },
          {
              id: 'attitudes',
              label: '态度',
              description: '对事物的看法和感受',
              radius: 45,
              color: '#3b82f6',
              fillOpacity: 0.3
          },
          {
              id: 'behaviors',
              label: '行为',
              description: '外在的行动和表现',
              radius: 60,
              color: '#f59e0b',
              fillOpacity: 0.3
          },
          {
              id: 'identity',
              label: '身份认同',
              description: '自我认知和社会角色',
              radius: 75,
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
      { id: 'habitCompletion', label: '任务完成率', desc: '过去7天的任务完成率趋势，直观了解任务执行情况。', deepAnalysis: { concept: `任务完成率是衡量执行力和任务规划合理性的重要指标，通过观察其变化趋势，可以深入了解个人或团队的工作效率。

- **核心概念**：任务完成率 = 已完成任务数 / 总任务数 * 100%
- **趋势分析**：上升趋势表明执行力提升，下降趋势可能存在问题
- **数据维度**：可细分为日常任务和主线任务的完成情况`, usage: `1. **分析波动原因**：完成率下降时，检查任务难度、时间安排或外部干扰
2. **优化任务分配**：根据完成率调整任务数量和难度
3. **设定合理目标**：基于历史数据设定可行的完成率目标
4. **识别高效时段**：结合完成率和时间分布，找出最佳工作时段`, principle: `1. **持续性优于爆发性**：稳定的较高完成率比忽高忽低的完成率更有价值
2. **质量优先于数量**：关注任务完成质量，避免为了完成率而降低标准
3. **反馈闭环**：定期分析完成率数据，调整工作策略
4. **分类管理**：区分不同类型任务的完成率，针对性优化` }, icon: Smile, color: 'text-yellow-500' },
      { id: 'focusTrend', label: '专注时间趋势', desc: '过去30天的每日专注时间趋势。', deepAnalysis: { concept: `专注时间是深度工作的核心指标，反映了个人集中注意力的能力和工作效率。

- **生理基础**：人类注意力持续时间有限，遵循90分钟的生理节奏
- **质量区分**：深度专注与浅层专注的效果差异显著
- **趋势价值**：长期专注时间趋势比单次时长更能反映生产力水平`, usage: `1. **识别高峰时段**：找出每日专注时间最长的时段，安排重要任务
2. **优化休息策略**：根据专注时长波动，调整休息间隔
3. **设定渐进目标**：逐步增加每日专注时间，避免过度消耗
4. **排除干扰因素**：分析专注时间下降的原因，减少外部干扰`, principle: `1. **番茄工作法**：25分钟专注+5分钟休息的循环模式
2. **能量管理**：专注时间与精力水平密切相关，需合理安排
3. **环境优化**：创造适合深度工作的环境，减少分心
4. **持续改进**：通过记录和分析，不断优化专注习惯` }, icon: Compass, color: 'text-green-500' },
      // 原有有价值的图表
      { id: 'dip', label: '死穴区间', desc: '大多数人在“死穴”期（努力>回报）放弃。熬过低谷，即是爆发。', deepAnalysis: { concept: `死穴区间是成长曲线中的关键阶段，指努力投入大于回报产出的时期，是成功前的必经考验。

- **曲线特征**：成长曲线呈现先上升、再下降、最后爆发的S型
- **心理挑战**：容易产生自我怀疑和放弃念头
- **普遍现象**：几乎所有长期成长过程都包含死穴区间`, usage: `1. **提前认知**：了解死穴区间的存在，做好心理准备
2. **降低期望**：在投入期降低对短期回报的期待
3. **持续小赢**：通过小目标的实现维持动力
4. **寻求支持**：在低谷期寻求他人鼓励和指导`, principle: `1. **坚持是关键**：度过死穴区间的核心是持续行动
2. **积累重于爆发**：死穴期的积累是后期爆发的基础
3. **调整而非放弃**：遇到瓶颈时调整方法，而非彻底放弃
4. **相信复利效应**：长期积累终将带来指数级增长` }, icon: Anchor, color: 'text-red-500' },
      { id: 'dunning', label: '达克效应', desc: '从愚昧之巅跌落绝望之谷，是开悟的必经之路。', deepAnalysis: { concept: `达克效应描述了认知偏差：能力越低的人越容易高估自己的能力，而能力越高的人往往更谦卑。

- **四个阶段**：愚昧之巅 → 绝望之谷 → 开悟之坡 → 持续稳定平原
- **心理机制**：认知不足导致无法准确评估自己的能力
- **普遍存在**：几乎所有人在学习新领域时都会经历这四个阶段`, usage: `1. **保持谦卑**：认识到自己可能处于达克效应的某个阶段
2. **主动学习**：持续学习以提升认知水平
3. **寻求反馈**：从他人那里获取客观评价
4. **接纳低谷**：绝望之谷是成长的必经阶段，不要轻易放弃`, principle: `1. **认知升级循环**：学习 → 认知提升 → 重新评估 → 继续学习
2. **成长型思维**：相信能力可以通过努力提升
3. **终身学习**：持续学习是突破达克效应的关键
4. **客观自我评估**：结合外部反馈和自我反思进行评估` }, icon: Mountain, color: 'text-orange-500' },
      { id: 'jcurve', label: 'J型曲线', desc: '创业与成长的真实路径：先下坠（投入期），后飞升（回报期）。', deepAnalysis: { concept: `J型曲线描述了成长和投资的典型路径：初期投入大、回报少，经过一段时间的积累后，回报开始快速增长。

- **核心特征**：先下降后上升的J型轨迹
- **应用领域**：创业、投资、个人成长等多个领域
- **关键拐点**：投入期结束，回报开始快速增长的转折点`, usage: `1. **长期视角**：用长远眼光看待投资和成长
2. **前期积累**：在J型曲线的下降阶段持续投入
3. **坚持信念**：面对短期亏损或成长缓慢时保持信心
4. **把握拐点**：识别并抓住回报开始快速增长的时机`, principle: `1. **复利效应**：J型曲线的本质是复利积累的结果
2. **延迟满足**：愿意为长期收益放弃短期利益
3. **战略耐心**：在投入期保持耐心，不急于求成
4. **持续优化**：在积累阶段不断优化策略和方法` }, icon: TrendingUp, color: 'text-blue-500' },
      { id: 'antifragile', label: '反脆弱', desc: '脆弱者害怕压力，反脆弱者从压力中获益。', deepAnalysis: { concept: `反脆弱系统在压力、不确定性和波动中茁壮成长，而不仅仅是抵抗冲击。

- **三种状态**：脆弱（害怕波动）→ 强韧（抵抗波动）→ 反脆弱（从波动中获益）
- **核心机制**：通过适度压力和挑战增强系统韧性
- **应用范围**：个人成长、组织管理、投资等多个领域`, usage: `1. **主动寻求挑战**：定期给自己设定适度的挑战目标
2. **拥抱不确定性**：不害怕变化，将其视为成长机会
3. **建立冗余系统**：在关键领域建立备份和冗余
4. **快速试错**：通过小步试错学习和适应`, principle: `1. **杠铃策略**：同时持有极端保守和极端激进的策略
2. **非线性收益**：反脆弱系统追求的是非线性的回报
3. **适度压力**：只有适度的压力才能增强韧性
4. **持续进化**：通过不断适应变化实现持续进化` }, icon: Shield, color: 'text-emerald-500' },
      { id: 'secondcurve', label: '第二曲线', desc: '在第一曲线（现有业务/能力）达到巅峰前，开启第二曲线。', deepAnalysis: { concept: `第二曲线理论强调在现有业务或能力仍在增长时，提前布局新的业务或能力，以避免陷入增长瓶颈。

- **生命周期**：所有事物都有生命周期，包括业务、技术和能力
- **关键时机**：在第一曲线达到巅峰前启动第二曲线
- **资源分配**：需要在第一曲线和第二曲线之间合理分配资源`, usage: `1. **提前布局**：在现有业务或能力仍在增长时，开始探索新领域
2. **资源平衡**：合理分配资源，既要维持现有优势，又要发展新能力
3. **鼓励创新**：建立鼓励创新的文化和机制
4. **容忍失败**：创新过程中允许一定程度的失败`, principle: `1. **S曲线叠加**：通过多条S曲线的叠加实现持续增长
2. **破坏性创新**：第二曲线往往是对第一曲线的破坏性创新
3. **长期主义**：关注长期发展，不被短期利益束缚
4. **组织灵活性**：保持组织的灵活性和适应性，便于转型` }, icon: GitMerge, color: 'text-purple-500' },
      { id: 'mining', label: '复利/阻力', desc: '初期阻力最大收益最小，后期阻力趋零收益无穷。', deepAnalysis: { concept: `复利效应是长期成长的核心机制，初期进步缓慢、阻力大，但随着时间推移，收益会呈指数级增长。

- **数学原理**：1.01^365 = 37.8，每天进步1%，一年后会有巨大变化
- **阻力变化**：初期阻力最大，随着能力提升，阻力逐渐减小
- **积累效应**：微小的进步通过持续积累产生巨大差异`, usage: `1. **坚持微小进步**：每天专注于1%的改进
2. **长期坚持**：复利效应需要时间积累，至少坚持1-3年
3. **避免倒退**：防止负向复利，避免坏习惯的积累
4. **多维度积累**：在多个领域同时应用复利原则`, principle: `1. **连续性**：复利效应的关键是持续行动，不能中断
2. **方向性**：确保每天的进步都朝着正确的方向
3. **耐心**：复利效应在初期不明显，需要耐心等待
4. **系统性**：将复利原则应用于生活和工作的各个方面` }, icon: Pickaxe, color: 'text-pink-500' },
      { id: 'flywheel', label: '飞轮效应', desc: '万事开头难。持续推动，突破临界点后，动能自动维持。', deepAnalysis: { concept: `飞轮效应指开始时需要很大力气推动飞轮，但一旦转动起来，惯性会让它持续转动，甚至越转越快。

- **启动阶段**：需要大量投入，进展缓慢
- **加速阶段**：突破临界点后，增长速度加快
- **惯性阶段**：依靠惯性维持高速运转，所需投入减少`, usage: `1. **聚焦核心**：识别飞轮的核心要素，集中精力推动
2. **持续用力**：在启动阶段保持持续投入，不轻易放弃
3. **突破临界点**：努力推动飞轮达到临界点，进入加速阶段
4. **优化系统**：不断优化飞轮的各个组成部分，减少摩擦`, principle: `1. **正反馈循环**：飞轮的各个部分相互促进，形成正反馈
2. **长期主义**：飞轮效应需要长期积累，不能急于求成
3. **系统思考**：将问题视为一个系统，优化整体而非局部
4. **坚持核心**：始终围绕核心目标推动飞轮转动` }, icon: RotateCw, color: 'text-green-500' },
      { id: 'regret', label: '遗憾最小化', desc: '纪律的痛苦是轻的 (盎司)，遗憾的痛苦是重的 (吨)。', deepAnalysis: { concept: `遗憾最小化原则强调，短期的纪律痛苦远小于长期的遗憾痛苦，鼓励人们做出符合长期利益的选择。

- **心理对比**：将短期痛苦与长期遗憾进行对比
- **决策框架**：以"避免未来遗憾"为决策依据
- **时间视角**：从未来的角度评估当前决策`, usage: `1. **未来视角**：在做决策时，想象自己5年后会如何看待这个选择
2. **痛苦对比**：将短期痛苦与长期遗憾进行权衡
3. **价值观导向**：基于核心价值观做决策，减少未来遗憾
4. **行动优先**：即使不确定，也要采取行动，避免"未做"的遗憾`, principle: `1. **长期利益优先**：优先考虑长期利益，而非短期舒适
2. **主动选择**：主动做出选择，而不是被动接受
3. **接受不完美**：允许决策不完美，重要的是行动
4. **持续调整**：根据反馈持续调整决策，减少遗憾` }, icon: TrendingDown, color: 'text-rose-500' },
      { id: 'energy', label: '精力波形', desc: '顺应90分钟生理周期，波峰冲刺，波谷休息。', deepAnalysis: { concept: `人的精力水平呈现周期性波动，遵循90分钟的生理节奏，称为"基础休息-活动周期"（BRAC）。

- **生理机制**：与大脑的警觉性和身体的疲劳程度密切相关
- **个体差异**：不同人的精力周期可能有所不同
- **影响因素**：睡眠质量、饮食、运动等都会影响精力波形`, usage: `1. **波峰冲刺**：在精力高峰时段进行高难度、创造性工作
2. **波谷休息**：在精力低谷时段进行简单任务或休息
3. **匹配任务**：根据任务难度和类型，安排在合适的精力时段
4. **优化恢复**：采用有效的休息方式，快速恢复精力`, principle: `1. **节律匹配**：工作安排与精力节律匹配，事半功倍
2. **主动恢复**：在精力耗尽前主动休息，提高恢复效率
3. **全面管理**：从身体、情绪、思维、精神四个维度管理精力
4. **长期投资**：通过良好的生活习惯提升整体精力水平` }, icon: Battery, color: 'text-blue-400' },
      { id: 'compound', label: '原子习惯', desc: '1.01^365 = 37.8。微小的差异在时间复利下产生巨大的鸿沟。', deepAnalysis: { concept: `原子习惯指微小的、持续的行为改变，通过时间复利产生巨大影响。

- **微小改变**：习惯的改变不需要剧烈的行动，只需微小的调整
- **持续积累**：通过每天的小习惯积累，产生巨大的长期效果
- **系统优化**：关注习惯系统的整体优化，而非单个习惯`, usage: `1. **从小事做起**：选择一个极小的习惯开始培养
2. **固定时间**：将新习惯与固定的时间或已有习惯绑定
3. **即时奖励**：完成习惯后给予自己即时奖励
4. **持续改进**：定期回顾和调整习惯，逐步优化`, principle: `1. **习惯循环**：提示 → 行为 → 奖励 → 重复
2. **环境设计**：设计有利于好习惯养成的环境
3. **身份认同**：将习惯与身份认同结合，从"我需要做"转变为"我就是这样的人"
4. **持续微小改进**：每天进步1%，长期积累产生巨大变化` }, icon: TrendingUp, color: 'text-indigo-500' },
      { id: 'pareto', label: '80/20法则', desc: '20% 的关键投入带来 80% 的产出。找到那 20%。', deepAnalysis: { concept: `80/20法则（帕累托法则）表明，少数关键因素决定了大部分结果。

- **普遍现象**：在许多领域都存在80/20分布，如20%的客户带来80%的 revenue
- **关键少数**：识别并聚焦于那20%的关键因素
- **资源优化**：将资源集中在高产出的活动上`, usage: `1. **识别关键**：分析工作和生活中的各个领域，找出20%的关键因素
2. **聚焦核心**：将80%的时间和精力投入到20%的关键活动中
3. **优化产出**：提高关键活动的效率和质量
4. **消除浪费**：减少或消除低产出的活动，避免资源浪费`, principle: `1. **重点论**：抓住主要矛盾和矛盾的主要方面
2. **效率优先**：优先处理高价值、高产出的任务
3. **资源集中**：集中资源解决关键问题
4. **持续优化**：定期重新评估和调整关键因素` }, icon: PieChart, color: 'text-cyan-500' },
      { id: 'dopamine', label: '多巴胺', desc: '高刺激导致基线下降。痛苦（如冷水澡）重置基线。', deepAnalysis: { concept: `多巴胺是一种神经递质，参与动机、奖励和快乐感的调节。现代社会的高刺激环境容易导致多巴胺基线升高，降低对普通快乐的敏感度。

- **奖励预测**：多巴胺主要与奖励预测有关，而非实际奖励
- **基线调节**：高刺激会提高多巴胺基线，降低快乐敏感度
- **重置机制**：某些痛苦体验（如冷水澡）可以重置多巴胺基线`, usage: `1. **减少即时满足**：减少对高刺激活动的依赖
2. **培养延迟满足**：学会等待和享受过程，而非只追求结果
3. **多样化奖励**：建立多样化的奖励系统，避免单一刺激
4. **适度挑战**：通过适度的挑战和努力获得成就感`, principle: `1. **平衡原则**：保持多巴胺系统的平衡，避免过度刺激
2. **过程导向**：关注过程而非结果，享受努力的过程
3. **自然奖励**：多从自然和简单的事物中获得快乐
4. **自我控制**：培养自我控制能力，避免冲动行为` }, icon: BrainCircuit, color: 'text-fuchsia-500' },
      { id: 'flow', label: '心流通道', desc: '技能与挑战的完美匹配区。避免焦虑与无聊。', deepAnalysis: { concept: `心流是一种完全沉浸在活动中的状态，此时技能与挑战完美匹配，体验到高度的愉悦和创造力。

- **核心条件**：技能水平与挑战难度的平衡
- **特征表现**：时间感扭曲、高度专注、忘记自我、愉悦感
- **最佳状态**：挑战略高于技能水平时，最容易进入心流状态`, usage: `1. **调整挑战难度**：根据自身技能水平调整任务难度，保持在"拉伸区"
2. **设定明确目标**：为任务设定明确、可衡量的目标
3. **提供即时反馈**：确保能够及时获得任务进展的反馈
4. **消除干扰**：创造安静、专注的环境，减少外部干扰`, principle: `1. **技能-挑战平衡**：心流状态的核心是技能与挑战的平衡
2. **专注当下**：完全沉浸在当前任务中，排除杂念
3. **内在动机**：基于内在动机行动，而非外部奖励
4. **持续成长**：通过不断提升技能和接受新挑战，持续体验心流` }, icon: Activity, color: 'text-lime-500' },
      { id: 'zone', label: '舒适圈模型', desc: '成长发生在舒适圈之外，通过不断学习和挑战，恐惧区会逐渐转变为舒适区。', deepAnalysis: { concept: `舒适圈模型将人的活动范围分为三个区域：

- **舒适区**：熟悉、安全、没有压力的区域
- **学习区**：有一定挑战，需要学习和成长的区域
- **恐惧区**：超出能力范围，令人感到恐惧的区域

成长发生在舒适圈之外，学习区是最佳的成长区域。`, usage: `1. **主动走出舒适圈**：定期尝试新事物，挑战自己的极限
2. **停留在学习区**：选择略高于当前能力的挑战，避免进入恐惧区
3. **逐步扩大舒适圈**：通过持续学习和挑战，将学习区转化为舒适区
4. **接受不适**：成长过程中会感到不适，这是正常的，也是必要的`, principle: `1. **成长在舒适圈之外**：只有走出舒适圈，才能获得真正的成长
2. **学习区是最佳状态**：挑战与能力匹配的学习区是成长的最佳区域
3. **渐进式挑战**：逐步增加挑战难度，避免过度恐惧
4. **持续迭代**：通过不断学习和实践，持续扩大舒适圈` }, icon: CircleDot, color: 'text-white' },
      { id: 'smileCurve', label: '投资微笑曲线', desc: '投资领域的经典U型曲线，展示了市场周期的变化规律。', deepAnalysis: { concept: `投资微笑曲线描述了投资市场的典型周期：先下跌后上涨的U型走势。

- **悲观期**：市场情绪悲观，价格持续下跌
- **底部震荡**：价格在底部区域震荡，市场情绪低迷
- **乐观期**：市场情绪好转，价格持续上涨

投资者的情绪变化通常与微笑曲线同步，形成"恐惧-麻木-贪婪"的循环。`, usage: `1. **逆向思维**：在悲观期布局，在乐观期收获
2. **长期持有**：忽略短期波动，坚持长期投资
3. **分批买入**：在底部震荡期分批买入，降低平均成本
4. **设定目标**：在乐观期设定明确的止盈目标，避免贪婪`, principle: `1. **市场周期不可避免**：市场总是在周期中循环，没有永远的牛市或熊市
2. **情绪管理是关键**：控制情绪，避免追涨杀跌
3. **价值投资**：关注资产的内在价值，而非短期价格波动
4. **长期复利**：长期持有优质资产，享受复利增长` }, icon: Smile, color: 'text-yellow-500' },
      // 新增图表
      { id: 'woop', label: 'WOOP框架', desc: 'Wish-Outcome-Obstacle-Plan：科学的目标设定方法。', deepAnalysis: { concept: `WOOP框架是一种科学的目标设定方法，通过四个步骤帮助人们实现目标：

- **Wish（愿望）**：明确自己的愿望或目标
- **Outcome（结果）**：想象愿望实现后的美好结果
- **Obstacle（障碍）**：识别可能阻碍愿望实现的障碍
- **Plan（计划）**：制定应对障碍的具体计划

WOOP框架结合了积极想象和现实规划，提高目标实现的成功率。`, usage: `1. **明确愿望**：选择一个具体、可行的愿望或目标
2. **生动想象**：详细想象愿望实现后的美好结果，激发动机
3. **深入分析**：找出实现愿望的主要障碍，包括内部和外部障碍
4. **制定计划**：针对每个障碍制定"如果-那么"计划，明确应对策略`, principle: `1. **心理对照**：将美好愿望与现实障碍进行对照，增强现实感
2. **执行意图**："如果-那么"计划能自动触发行为，提高执行效率
3. **动机增强**：生动的结果想象能增强实现目标的动机
4. **障碍准备**：提前识别和准备应对障碍，减少意外情况的影响` }, icon: Target, color: 'text-blue-500' },
      { id: 'peakEnd', label: '峰终定律', desc: '人们对体验的记忆由两个因素决定：高峰时与结束时的感觉。', deepAnalysis: { concept: `峰终定律表明，人们对体验的记忆主要由两个因素决定：

- **高峰体验**：体验中的最高或最低潮
- **结束体验**：体验结束时的感受

其他时段的体验对记忆的影响相对较小，这是人类记忆的固有特征。`, usage: `1. **设计高峰体验**：在重要事件中创造积极的高峰体验
2. **优化结束体验**：确保体验结束时给人留下良好印象
3. **管理负面体验**：尽量减少或转化负面的高峰体验
4. **应用于设计**：在产品设计、服务设计中应用峰终定律，提升用户体验`, principle: `1. **记忆选择性**：人类记忆是选择性的，更容易记住极端情绪和结尾
2. **体验设计**：通过设计高峰和结束体验，可以显著提升整体体验质量
3. **情绪管理**：情绪体验对记忆的影响远大于中性体验
4. **关键时刻**：识别和优化体验中的关键时刻，尤其是高峰和结束时刻` }, icon: TrendingUp, color: 'text-green-500' },
      { id: 'valueVenn', label: '韦恩图', desc: '激情、天赋与市场的交集，找到你的人生使命。', deepAnalysis: { concept: `价值韦恩图展示了人生使命的三个核心要素：

- **激情**：你热爱的事情，做起来充满动力
- **天赋**：你擅长的事情，比别人更容易做好
- **市场**：有需求的事情，能创造价值

人生使命就在这三个要素的交集处，即你热爱、擅长且有市场需求的事情。`, usage: `1. **自我探索**：深入了解自己的激情、天赋和市场需求
2. **寻找交集**：寻找三个要素的重叠区域，识别潜在的人生使命
3. **尝试验证**：通过小范围尝试，验证自己的假设
4. **持续调整**：随着成长和变化，不断调整自己的人生使命`, principle: `1. **三要素平衡**：人生使命需要激情、天赋和市场的平衡
2. **内在驱动**：激情是持续动力的源泉
3. **优势发挥**：发挥天赋能提高成功的概率
4. **价值创造**：满足市场需求才能创造真正的价值` }, icon: CircleDot, color: 'text-purple-500' },

      // 保留并优化的图表
      { id: 'learningCycle', label: '学习循环', desc: '展示学习的循环过程：输入、处理、输出、反馈。', deepAnalysis: { concept: `学习循环是一个持续的闭环过程，包括四个核心步骤：

- **输入**：获取新的知识和信息
- **处理**：理解、消化和整合所学内容
- **输出**：将所学知识应用于实践或教授他人
- **反馈**：获取反馈，调整和优化学习过程

只有通过完整的学习循环，才能真正掌握知识并实现持续成长。`, usage: `1. **多元化输入**：通过阅读、听课、观察等多种方式获取知识
2. **深度处理**：通过思考、笔记、讨论等方式深入理解所学内容
3. **主动输出**：通过实践、写作、教学等方式输出所学知识
4. **积极反馈**：主动寻求反馈，调整学习策略和方法`, principle: `1. **输出是最好的输入**：输出能加深对知识的理解和记忆
2. **反馈闭环**：没有反馈的学习是不完整的，无法持续改进
3. **螺旋式上升**：通过不断循环，知识和能力会螺旋式提升
4. **知行合一**：将所学知识应用于实践，实现知行合一` }, icon: RotateCw, color: 'text-purple-500' },
      { id: 'purpose', label: '人类需求层次', desc: '马斯洛需求层次理论，从基本生存到自我实现的需求层级。', deepAnalysis: { concept: `马斯洛需求层次理论将人类需求分为五个层次，从低到高依次为：

- **生理需求**：食物、水、睡眠等基本生存需求
- **安全需求**：安全、稳定、保护等需求
- **社交需求**：爱、归属、社交关系等需求
- **尊重需求**：自尊、尊重、成就等需求
- **自我实现**：实现潜能、自我发展、创造力等需求

较低层次的需求得到满足后，人们会追求更高层次的需求。`, usage: `1. **需求识别**：了解自己当前处于哪个需求层次，设定相应的目标
2. **分层满足**：优先满足较低层次的需求，为追求更高层次需求奠定基础
3. **自我实现**：在满足基本需求后，追求自我实现，发挥潜能
4. **平衡发展**：关注各个层次需求的平衡发展，避免过度追求某一层次`, principle: `1. **需求递进**：需求从低到高逐步发展，较高层次需求建立在较低层次需求之上
2. **个体差异**：不同人在不同阶段的需求重点可能不同
3. **自我超越**：在自我实现之上，还有自我超越的需求，关注更宏大的意义和价值
4. **动态平衡**：需求层次是动态变化的，需要根据实际情况调整` }, icon: Target, color: 'text-yellow-600' },
      { id: 'johariWindow', label: '乔哈里视窗', desc: '通过自我暴露和反馈，扩大公开区，减少盲区和隐藏区，探索未知区。', deepAnalysis: { concept: `乔哈里视窗将人的自我认知分为四个象限：

- **公开区**：自己知道，别人也知道的部分
- **盲区**：自己不知道，别人知道的部分
- **隐藏区**：自己知道，别人不知道的部分
- **未知区**：自己不知道，别人也不知道的部分

通过自我暴露和寻求反馈，可以扩大公开区，减少盲区和隐藏区，探索未知区。`, usage: `1. **自我暴露**：主动分享自己的想法、感受和经历，扩大公开区
2. **寻求反馈**：主动向他人寻求反馈，了解自己的盲区
3. **自我探索**：通过反思、冥想等方式探索自己的未知区
4. **建立信任**：在安全的关系中进行自我暴露和反馈交流`, principle: `1. **公开区越大越好**：公开区越大，自我认知越准确，人际关系越融洽
2. **反馈是礼物**：他人的反馈能帮助我们了解自己的盲区
3. **自我暴露需要勇气**：适当的自我暴露能加深人际关系
4. **持续探索**：自我认知是一个持续的过程，需要不断探索和学习` }, icon: Eye, color: 'text-blue-500' },
      { id: 'footInDoor', label: '登门槛效应', desc: '先提出小请求，获得承诺后再提出更大的请求，成功率会显著提高。', deepAnalysis: { concept: `登门槛效应指先提出小请求，获得承诺后再提出更大的请求，成功率会显著提高。

- **承诺一致性**：人们倾向于保持行为的一致性，一旦做出小承诺，更可能接受更大的请求
- **心理适应**：小请求帮助人们适应某种行为模式，降低对大请求的抵触
- **信任建立**：小请求的成功回应有助于建立信任关系`, usage: `1. **从小到大**：在说服他人或培养习惯时，从简单的小请求开始
2. **逐步推进**：在获得承诺后，逐步提高请求的难度或规模
3. **保持一致**：确保请求之间具有关联性，保持行为的一致性
4. **及时强化**：对小请求的回应给予积极反馈，增强对方的成就感`, principle: `1. **承诺一致性原则**：人们倾向于保持行为的一致性
2. **渐进式改变**：逐步改变比突然改变更容易被接受
3. **心理认同**：小请求能帮助人们建立对某种行为的心理认同
4. **信任积累**：通过小请求的成功回应积累信任，为大请求奠定基础` }, icon: Target, color: 'text-green-500' },
      { id: 'deliberatePractice', label: '刻意练习循环', desc: '明确目标 → 专注练习 → 获得反馈 → 调整优化 → 明确目标，形成闭环。', deepAnalysis: { concept: `刻意练习是一种有目的、专注、有反馈的练习方法，是成为专家的关键。

- **明确目标**：设定具体、可衡量的练习目标
- **专注练习**：全神贯注地进行练习，避免分心
- **获得反馈**：及时获得关于练习效果的反馈
- **调整优化**：根据反馈调整练习方法和策略

通过持续的刻意练习，可以突破能力瓶颈，实现技能的快速提升。`, usage: `1. **分解目标**：将大目标分解为具体、可操作的小目标
2. **专注投入**：在练习时保持高度专注，排除干扰
3. **寻求反馈**：主动寻求教练、导师或同伴的反馈
4. **针对性练习**：针对自己的弱点和瓶颈进行专门练习`, principle: `1. **跳出舒适区**：刻意练习需要在舒适区之外进行，挑战自己的极限
2. **高质量重复**：不是简单的重复，而是有目的、有反馈的高质量重复
3. **持续挑战**：不断提高练习的难度和复杂度
4. **反馈驱动**：根据反馈持续调整和优化练习方法` }, icon: RotateCw, color: 'text-purple-500' },
      { id: 'foggBehavior', label: '福格行为模型', desc: '行为发生的三要素：动机、能力和触发。只有当三者同时具备时，行为才会发生。', deepAnalysis: { concept: `福格行为模型由斯坦福大学B.J.福格提出，核心公式为B=M×A×P（行为=动机×能力×触发）。

- **行为发生三条件**：需同时满足高动机、易执行、有效触发
- **动机与能力关系**：呈互补关系，高动机可弥补低能力，低动机需低门槛（高能力）驱动
- **模型核心**：通过调整三要素影响行为发生概率`, usage: `1. **降低能力门槛**：将"每天读书1小时"拆为"每天读1页"
2. **匹配触发方式**：高动机低能力配即时触发，稳定动机配情境触发
3. **绑定已有行为**：如"刷牙后用牙线"，利用已有习惯作为触发点
4. **微习惯设计**：从极小的行为开始，逐步培养习惯`, principle: `1. 动机具有波动性，避免依赖"打鸡血"式动机驱动
2. 能力门槛越低，行为发生率越高
3. 触发需精准，无效触发易引发反感
4. 通过"小行为+即时反馈"强化行为惯性
5. 行为设计应聚焦于让用户"容易做到"而非"必须做到"` }, icon: Activity, color: 'text-orange-500' },
      { id: 'eisenhowerMatrix', label: '艾森豪威尔矩阵', desc: '根据紧急性和重要性将任务分为四个象限，帮助优化时间管理和决策。', deepAnalysis: { concept: `艾森豪威尔矩阵（紧急-重要矩阵）将任务分为四个象限：

- **第一象限**：紧急且重要，如危机、截止日期任务
- **第二象限**：重要不紧急，如长期目标、战略规划
- **第三象限**：紧急不重要，如干扰电话、临时请求
- **第四象限**：不紧急不重要，如琐碎任务、无意义的娱乐

时间管理的核心是区分重要和紧急，将精力集中在重要的事情上。`, usage: `1. **优先处理第一象限**：立即处理紧急且重要的任务，解决危机
2. **重点投资第二象限**：将大部分时间和精力投入到重要不紧急的任务中，进行长期规划和成长
3. **减少第三象限**：学会说"不"，或授权他人处理紧急不重要的任务
4. **避免第四象限**：减少或消除不紧急不重要的任务，避免浪费时间`, principle: `1. **重要性优先**：重要性比紧急性更重要，应优先考虑重要的事情
2. **预防胜于治疗**：投资第二象限的事情可以减少第一象限的危机
3. **授权与拒绝**：学会授权他人处理某些任务，学会拒绝不合理的请求
4. **持续优化**：定期回顾和调整任务分配，不断优化时间管理` }, icon: Target, color: 'text-indigo-500' },
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
            
            {/* 图表学习模块 - 包含图表和深度解析 */}
            <div className={`p-3 rounded-xl ${isDark ? 'bg-zinc-900' : isNeomorphic ? 'bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,1)]' : 'bg-white shadow-md'} transition-all duration-300 hover:shadow-lg`}>
                {/* 左上角小图标和文字 - 作为模块标题 */}
                <div className="flex items-center gap-2 mb-4">
                    <BarChart2 size={12} className="text-yellow-500"/>
                    <h3 className="text-[10px] font-bold uppercase text-zinc-500">图表学习</h3>
                </div>

                {/* 内部包含图表和深度解析两个悬浮凸起模块 */}
                <div className="space-y-6">
                    {/* Featured Strategic Chart (Full Width Top) */}
                    <div 
                        ref={chartContainerRef}
                        className={`p-4 rounded-lg ${cardBg} flex flex-col relative overflow-hidden group transition-all duration-300 z-0 hover:z-10`} 
                        style={{ minHeight: '500px', width: '100%', alignSelf: 'center' }}
                    >
    
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
                                    <ReferenceArea x1={15} x2={55} fill="#ef4444" fillOpacity={0.1} label={{ value: "死穴区间", position: 'insideBottom', fontSize: 12, fill: '#ef4444' } as any} />
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
                                <ReferenceArea x1={0} x2={20} fill="#ef4444" fillOpacity={0.1} label={{ value: '愚昧之巅', position: 'insideTopLeft', fontSize: 12, fill: '#ef4444' } as any} />
                                <ReferenceArea x1={20} x2={50} fill="#3b82f6" fillOpacity={0.1} label={{ value: '绝望之谷', position: 'insideBottomLeft', fontSize: 12, fill: '#3b82f6' } as any} />
                                <ReferenceArea x1={50} x2={80} fill="#10b981" fillOpacity={0.1} label={{ value: '开悟之坡', position: 'insideBottomLeft', fontSize: 12, fill: '#10b981' } as any} />
                                <ReferenceArea x1={80} x2={100} fill="#8b5cf6" fillOpacity={0.1} label={{ value: '持续稳定平原', position: 'insideTopLeft', fontSize: 12, fill: '#8b5cf6' } as any} />
                                
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
                                        return [typeof value === 'number' ? value.toFixed(1) : value, props.payload.stage];
                                    }}
                                />
                                
                                {/* 阶段背景色 */}
                                <ReferenceArea x1={0} x2={40} fill="url(#colorStage1)" strokeDasharray="3 3" />
                                <ReferenceArea x1={40} x2={70} fill="url(#colorStage2)" strokeDasharray="3 3" />
                                <ReferenceArea x1={70} x2={100} fill="url(#colorStage3)" strokeDasharray="3 3" />
                                
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
                                        return [typeof value === 'number' ? value.toFixed(1) : value, name === '进步' ? '每天进步1%' : '每天退步1%'];
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
                                <svg width="100%" height="100%" viewBox="0 0 400 450" preserveAspectRatio="xMidYMid meet">
                                    {/* Fear Zone (Outer Circle) */}
                                    <circle cx="200" cy="200" r="160" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="3" />
                                    <text x="200" y="55" textAnchor="middle" fill="#ef4444" fontSize="18" fontWeight="bold">恐惧区</text>
                                    <text x="200" y="75" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12">未知与挑战</text>
                                    
                                    {/* Learning Zone (Middle Circle) */}
                                    <circle cx="200" cy="200" r="120" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="3" />
                                    <text x="200" y="105" textAnchor="middle" fill="#3b82f6" fontSize="18" fontWeight="bold">学习区</text>
                                    <text x="200" y="125" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12">成长与提升</text>
                                    
                                    {/* Comfort Zone (Inner Circle) */}
                                    <circle cx="200" cy="200" r="80" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="3" />
                                    <text x="200" y="155" textAnchor="middle" fill="#10b981" fontSize="18" fontWeight="bold">舒适区</text>
                                    <text x="200" y="175" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12">熟悉与安全</text>
                                    
                                    {/* Center Text */}
                                    <text x="200" y="210" textAnchor="middle" fill={isDark ? "#e2e8f0" : "#1e293b"} fontSize="16" fontWeight="bold">你在这里</text>
                                        
                                        {/* Arrows */}
                                        <line x1="200" y1="160" x2="200" y2="200" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />
                                        <line x1="200" y1="240" x2="200" y2="280" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />
                                        <line x1="200" y1="300" x2="200" y2="340" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />
                                        
                                        {/* Progress Text */}
                                        <text x="200" y="230" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12">→ 探索</text>
                                        <text x="200" y="270" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12">→ 成长</text>
                                        <text x="200" y="310" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12">→ 突破</text>
                                        
                                        {/* 新增：舒适圈扩展说明 */}
                                        <text x="200" y="370" textAnchor="middle" fill={isDark ? "#e2e8f0" : "#1e293b"} fontSize="14" fontWeight="bold">
                                            舒适圈扩展
                                        </text>
                                        <text x="200" y="390" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="10">
                                            通过不断学习和挑战，恐惧区会逐渐转变为舒适区
                                        </text>
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
                            <div className={`p-4 rounded-xl border ${cardBg} z-10`}>
                                <ResponsiveContainer width="100%" height="400px">
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
                            </div>
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
                                <svg width="100%" height="100%" viewBox="0 0 350 350" preserveAspectRatio="xMidYMid meet">
                                        {/* 绘制WOOP框架的四个象限 */}
                                        {woopData.map((item, index) => {
                                            const cx = item.x * 350;
                                            const cy = item.y * 350;
                                            return (
                                                <g key={item.id}>
                                                    {/* 背景圆圈 */}
                                                    <circle cx={cx} cy={cy} r="45" fill={item.color} fillOpacity={0.2} stroke={item.color} strokeWidth={2} />
                                                    <circle cx={cx} cy={cy} r="36" fill={isDark ? "#18181b" : "#ffffff"} stroke={item.color} strokeWidth={1} />
                                                    {/* 图标和文字 */}
                                                    <text x={cx} y={cy - 12} textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="20">
                                                        {item.icon}
                                                    </text>
                                                    <text x={cx} y={cy + 8} textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="14" fontWeight="bold">
                                                        {item.label}
                                                    </text>
                                                    <text x={cx} y={cy + 25} textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="9" width="90" textLength="90">
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
                                        <line x1="87.5" y1="87.5" x2="262.5" y2="87.5" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />
                                        <line x1="87.5" y1="262.5" x2="262.5" y2="262.5" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />
                                        <line x1="87.5" y1="87.5" x2="87.5" y2="262.5" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />
                                        <line x1="262.5" y1="87.5" x2="262.5" y2="262.5" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrowhead)" />
                                        
                                        {/* 中心文字 */}
                                        <text x="175" y="175" textAnchor="middle" fill={isDark ? "#e2e8f0" : "#1e293b"} fontSize="18" fontWeight="bold">
                                            WOOP框架
                                        </text>
                                        <text x="175" y="190" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12">
                                            科学的目标设定方法
                                        </text>
                                        
                                        {/* 添加WOOP框架说明 */}
                                        <text x="175" y="330" textAnchor="middle" fill={isDark ? "#e2e8f0" : "#1e293b"} fontSize="12" fontWeight="bold">
                                            WOOP: 愿望 → 结果 → 障碍 → 计划
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
                                <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
                                        {/* 绘制洋葱圈 */}
                                        {cognitiveOnionData.map((item, index) => {
                                            // 优化每个圈层的位置，避免文字重叠
                                            const angle = index * 72; // 5个圈层，每个间隔72度
                                            const textRadius = item.radius + 20; // 优化文字半径，确保文字在圆圈外部
                                            const textX = 200 + Math.cos(angle * Math.PI / 180) * textRadius;
                                            const textY = 200 + Math.sin(angle * Math.PI / 180) * textRadius;
                                            
                                            return (
                                                <g key={item.id}>
                                                    <circle cx="200" cy="200" r={item.radius} fill={item.color} fillOpacity={item.fillOpacity} stroke={item.color} strokeWidth={2} />
                                                    {/* 文字标签 - 优化字体大小、位置和间距 */}
                                                    <text 
                                                        x={textX} 
                                                        y={textY} 
                                                        textAnchor="middle" 
                                                        fill={item.color} 
                                                        fontSize="11" 
                                                        fontWeight="bold"
                                                        transform={`rotate(${angle + 90} ${textX} ${textY})`}
                                                    >
                                                        {item.label}
                                                    </text>
                                                    {/* 描述文字 - 显示在每个圈层的下方，优化位置和字体 */}
                                                    <text 
                                                        x={textX} 
                                                        y={textY + 15} 
                                                        textAnchor="middle" 
                                                        fill={isDark ? "#a1a1aa" : "#64748b"} 
                                                        fontSize="8"
                                                        transform={`rotate(${angle + 90} ${textX} ${textY + 15})`}
                                                    >
                                                        {item.description}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                        
                                        {/* 中心文字 */}
                                        <text x="200" y="195" textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="16" fontWeight="bold">
                                            认知洋葱圈
                                        </text>
                                        <text x="200" y="210" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="10">
                                            从核心到外在的认知层次
                                        </text>
                                        
                                        {/* 添加认知层次说明 */}
                                        <text x="200" y="380" textAnchor="middle" fill={isDark ? "#e2e8f0" : "#1e293b"} fontSize="12" fontWeight="bold">
                                            认知层次从内到外：核心价值观 → 信念 → 态度 → 行为 → 身份认同
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
                                <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
                                    {/* 金字塔标题 */}
                                    <text 
                                        x="200" 
                                        y="30" 
                                        textAnchor="middle" 
                                        fill={isDark ? "#ffffff" : "#000000"} 
                                        fontSize="16" 
                                        fontWeight="bold"
                                    >
                                        马斯洛需求层次
                                    </text>
                                    <text 
                                        x="200" 
                                        y="45" 
                                        textAnchor="middle" 
                                        fill={isDark ? "#a1a1aa" : "#64748b"} 
                                        fontSize="10"
                                    >
                                        人类需求的五个层次
                                    </text>
                                    
                                    {/* 绘制大尺寸立体三角形金字塔 */}
                                    <g transform="translate(0, 20)">
                                        {/* 底层 - 生理需求 */}
                                        <defs>
                                            <linearGradient id="physiologicalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                                                <stop offset="100%" stopColor="#dc2626" stopOpacity="1" />
                                            </linearGradient>
                                            <linearGradient id="safetyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                                                <stop offset="100%" stopColor="#d97706" stopOpacity="1" />
                                            </linearGradient>
                                            <linearGradient id="socialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#fde047" stopOpacity="0.8" />
                                                <stop offset="100%" stopColor="#eab308" stopOpacity="1" />
                                            </linearGradient>
                                            <linearGradient id="esteemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                                                <stop offset="100%" stopColor="#16a34a" stopOpacity="1" />
                                            </linearGradient>
                                            <linearGradient id="selfActualizationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                                                <stop offset="100%" stopColor="#2563eb" stopOpacity="1" />
                                            </linearGradient>
                                        </defs>
                                        
                                        {/* 立体效果阴影 */}
                                        <polygon 
                                            points="200,340 100,380 300,380" 
                                            fill="#000000" 
                                            fillOpacity="0.1"
                                            stroke="none"
                                        />
                                        
                                        {/* 生理需求 - 底层 */}
                                        <polygon 
                                            points="200,300 120,360 280,360" 
                                            fill="url(#physiologicalGradient)" 
                                            stroke="#dc2626" 
                                            strokeWidth="2"
                                            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                                        />
                                        <text 
                                            x="200" 
                                            y="335" 
                                            textAnchor="middle" 
                                            fill="#ffffff" 
                                            fontSize="14" 
                                            fontWeight="bold"
                                            stroke="#000000" 
                                            strokeWidth="0.5"
                                        >
                                            {purposeData[0].name}
                                        </text>
                                        <text 
                                            x="200" 
                                            y="350" 
                                            textAnchor="middle" 
                                            fill="#ffffff" 
                                            fontSize="9"
                                            stroke="#000000" 
                                            strokeWidth="0.3"
                                        >
                                            {purposeData[0].description}
                                        </text>
                                        
                                        {/* 安全需求 */}
                                        <polygon 
                                            points="200,240 140,300 260,300" 
                                            fill="url(#safetyGradient)" 
                                            stroke="#d97706" 
                                            strokeWidth="2"
                                            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                                        />
                                        <text 
                                            x="200" 
                                            y="275" 
                                            textAnchor="middle" 
                                            fill="#ffffff" 
                                            fontSize="14" 
                                            fontWeight="bold"
                                            stroke="#000000" 
                                            strokeWidth="0.5"
                                        >
                                            {purposeData[1].name}
                                        </text>
                                        <text 
                                            x="200" 
                                            y="290" 
                                            textAnchor="middle" 
                                            fill="#ffffff" 
                                            fontSize="9"
                                            stroke="#000000" 
                                            strokeWidth="0.3"
                                        >
                                            {purposeData[1].description}
                                        </text>
                                        
                                        {/* 社交需求 */}
                                        <polygon 
                                            points="200,180 160,240 240,240" 
                                            fill="url(#socialGradient)" 
                                            stroke="#eab308" 
                                            strokeWidth="2"
                                            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                                        />
                                        <text 
                                            x="200" 
                                            y="215" 
                                            textAnchor="middle" 
                                            fill="#000000" 
                                            fontSize="14" 
                                            fontWeight="bold"
                                        >
                                            {purposeData[2].name}
                                        </text>
                                        <text 
                                            x="200" 
                                            y="230" 
                                            textAnchor="middle" 
                                            fill="#000000" 
                                            fontSize="9"
                                        >
                                            {purposeData[2].description}
                                        </text>
                                        
                                        {/* 尊重需求 */}
                                        <polygon 
                                            points="200,120 180,180 220,180" 
                                            fill="url(#esteemGradient)" 
                                            stroke="#16a34a" 
                                            strokeWidth="2"
                                            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                                        />
                                        <text 
                                            x="200" 
                                            y="155" 
                                            textAnchor="middle" 
                                            fill="#ffffff" 
                                            fontSize="14" 
                                            fontWeight="bold"
                                            stroke="#000000" 
                                            strokeWidth="0.5"
                                        >
                                            {purposeData[3].name}
                                        </text>
                                        <text 
                                            x="200" 
                                            y="170" 
                                            textAnchor="middle" 
                                            fill="#ffffff" 
                                            fontSize="9"
                                            stroke="#000000" 
                                            strokeWidth="0.3"
                                        >
                                            {purposeData[3].description}
                                        </text>
                                        
                                        {/* 自我实现 - 顶层 */}
                                        <polygon 
                                            points="200,60 190,120 210,120" 
                                            fill="url(#selfActualizationGradient)" 
                                            stroke="#2563eb" 
                                            strokeWidth="2"
                                            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                                        />
                                        <text 
                                            x="200" 
                                            y="95" 
                                            textAnchor="middle" 
                                            fill="#ffffff" 
                                            fontSize="14" 
                                            fontWeight="bold"
                                            stroke="#000000" 
                                            strokeWidth="0.5"
                                        >
                                            {purposeData[4].name}
                                        </text>
                                        <text 
                                            x="200" 
                                            y="110" 
                                            textAnchor="middle" 
                                            fill="#ffffff" 
                                            fontSize="9"
                                            stroke="#000000" 
                                            strokeWidth="0.3"
                                        >
                                            {purposeData[4].description}
                                        </text>
                                        
                                        {/* 添加立体效果的高光线条 */}
                                        <line x1="200" y1="60" x2="200" y2="300" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="5,5" />
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
                                {/* 调整边距，优化图表大小 */}
                                <LineChart data={footInDoorData} animationDuration={1000} margin={{ top: 60, right: 20, left: 20, bottom: 30 }}>
                                    <defs>
                                        <linearGradient id="colorFootInDoor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} />
                                    <XAxis dataKey="requestSize" stroke="#71717a" label={{ value: '请求大小', position: 'insideBottom', offset: -5 }} fontSize={11} />
                                    <YAxis stroke="#71717a" label={{ value: '接受率 (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} fontSize={11} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: isDark ? '#18181b' : '#fff', borderColor: isDark ? '#333' : '#e2e8f0', color: isDark ? '#fff' : '#000' }}
                                        formatter={(value, name, props) => {
                                            const data = props.payload as any;
                                            return [typeof value === 'number' ? value.toFixed(1) + '%' : value + '%', data.stage];
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                                    
                                    {/* 登门槛效应曲线 */}
                                    <Line 
                                        type="monotone" 
                                        dataKey="acceptanceRate" 
                                        stroke="#10b981" 
                                        strokeWidth={3} 
                                        dot={false}
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        name="接受率"
                                    />
                                    
                                    {/* 阶段划分 */}
                                    <ReferenceArea x1={0} x2={20} fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeOpacity={0.3} strokeDasharray="3 3" />
                                    <ReferenceArea x1={20} x2={60} fill="#f59e0b" fillOpacity="0.1" stroke="#f59e0b" strokeOpacity={0.3} strokeDasharray="3 3" />
                                    <ReferenceArea x1={60} x2={100} fill="#ef4444" fillOpacity="0.1" stroke="#ef4444" strokeOpacity={0.3} strokeDasharray="3 3" />
                                    
                                    {/* 阶段标签 - 优化位置和字体大小，避免重叠 */}
                                    <text x="10" y="30" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="bold">
                                        低门槛阶段
                                    </text>
                                    <text x="40" y="50" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">
                                        中等门槛阶段
                                    </text>
                                    <text x="80" y="30" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">
                                        高门槛阶段
                                    </text>
                                    
                                    {/* 关键节点标注 - 优化位置，避免重叠 */}
                                    <circle cx="20" cy={80} r={4} fill="#3b82f6" stroke="white" strokeWidth="2" />
                                    <text x="20" y="92" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="bold">
                                        初始承诺
                                    </text>
                                    
                                    <circle cx="60" cy={70} r={4} fill="#f59e0b" stroke="white" strokeWidth="2" />
                                    <text x="60" y="82" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">
                                        门槛提升
                                    </text>
                                    
                                    <circle cx="100" cy={65} r={4} fill="#ef4444" stroke="white" strokeWidth="2" />
                                    <text x="100" y="77" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">
                                        最终请求
                                    </text>
                                    
                                    {/* 登门槛效应说明 - 优化位置和字体大小 */}
                                    <text x="80%" y="10%" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="11" fontWeight="bold">
                                        登门槛效应
                                    </text>
                                    <text x="80%" y="14%" textAnchor="middle" fill={isDark ? "#71717a" : "#94a3b8"} fontSize="9">
                                        先提出小请求，获得承诺后
                                    </text>
                                    <text x="80%" y="18%" textAnchor="middle" fill={isDark ? "#71717a" : "#94a3b8"} fontSize="9">
                                        再提出更大的请求，成功率显著提高
                                    </text>
                                </LineChart>
                            </ResponsiveContainer>
                        ) : activeChart === 'deliberatePractice' ? (
                            <div className="flex flex-col items-center justify-center h-full w-full">
                                <div className="relative w-[350px] h-[350px]">
                                    <svg width="100%" height="100%" viewBox="0 0 450 450">
                                        {/* 绘制背景圆环 - 调整半径 */}
                                        <circle cx="225" cy="225" r="170" fill="none" stroke={isDark ? "#3f3f46" : "#e2e8f0"} strokeWidth="2" />
                                        
                                        {/* 绘制连接箭头 - 优化路径 */}
                                        {/* 1. 明确目标 → 专注练习 */}
                                        <path d="M225 90 C305 110 350 180 350 225" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,4" />
                                        <path d="M350 225 L360 235 L350 245 Z" fill="#8b5cf6" />
                                        
                                        {/* 2. 专注练习 → 获得反馈 */}
                                        <path d="M350 225 C350 290 300 330 240 350" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,4" />
                                        <path d="M240 350 L230 360 L220 350 Z" fill="#8b5cf6" />
                                        
                                        {/* 3. 获得反馈 → 调整优化 */}
                                        <path d="M240 350 C170 350 130 310 110 240" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,4" />
                                        <path d="M110 240 L100 230 L110 220 Z" fill="#8b5cf6" />
                                        
                                        {/* 4. 调整优化 → 明确目标 */}
                                        <path d="M110 240 C110 170 150 130 225 110" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,4" />
                                        <path d="M225 110 L235 100 L245 110 Z" fill="#8b5cf6" />
                                        
                                        {/* 绘制各个阶段 - 优化大小和位置，避免文字重叠 */}
                                        {deliberatePracticeData.map((stage, index) => {
                                            const x = stage.x * 450;
                                            const y = stage.y * 450;
                                            return (
                                                <g key={stage.id}>
                                                    {/* 阶段圆圈 - 调整半径，增加间距 */}
                                                    <circle cx={x} cy={y} r={38} fill={stage.color} fillOpacity="0.2" stroke={stage.color} strokeWidth="2" />
                                                    <circle cx={x} cy={y} r={30} fill={isDark ? "#18181b" : "#ffffff"} stroke={stage.color} strokeWidth="2" />
                                                    
                                                    {/* 阶段图标 - 缩小尺寸 */}
                                                    <text x={x} y={y - 8} textAnchor="middle" fontSize="20">{stage.icon}</text>
                                                    
                                                    {/* 阶段标签 - 调整位置和字体大小 */}
                                                    <text x={x} y={y + 16} textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="12" fontWeight="bold">
                                                        {stage.label}
                                                    </text>
                                                    
                                                    {/* 阶段描述 - 调整位置，使用更小字体，避免重叠 */}
                                                    <text x={x} y={y + 45} textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="8" width="80" textLength="80">
                                                        {stage.description}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                        
                                        {/* 中心文字 - 调整大小 */}
                                        <circle cx="225" cy="225" r="50" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="2" />
                                        <text x="225" y="225" textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="18" fontWeight="bold">
                                            刻意练习
                                        </text>
                                        <text x="225" y="243" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="11">
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
                                    {/* 图表标题 */}
                                    <text 
                                        x="200" 
                                        y="30" 
                                        textAnchor="middle" 
                                        fill={isDark ? "#ffffff" : "#000000"} 
                                        fontSize="16" 
                                        fontWeight="bold"
                                    >
                                        福格行为模型
                                    </text>
                                    <text 
                                        x="200" 
                                        y="45" 
                                        textAnchor="middle" 
                                        fill={isDark ? "#a1a1aa" : "#64748b"} 
                                        fontSize="10"
                                    >
                                        行为 = 动机 × 能力 × 触发
                                    </text>
                                    
                                    {/* 绘制坐标轴 */}
                                    <g transform="translate(50, 50)">
                                        {/* 坐标轴 */}
                                        <line x1="0" y1="0" x2="0" y2="300" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="2" />
                                        <line x1="0" y1="300" x2="300" y2="300" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="2" />
                                        
                                        {/* 坐标轴标签 */}
                                        <text x="-30" y="150" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12" fontWeight="bold" transform="rotate(-90, -30, 150)">
                                            动机程度
                                        </text>
                                        <text x="150" y="330" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12" fontWeight="bold">
                                            能力程度
                                        </text>
                                        
                                        {/* 坐标轴刻度 */}
                                        {/* X轴刻度 */}
                                        <line x1="0" y1="300" x2="0" y2="305" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="1" />
                                        <text x="0" y="320" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="9">0</text>
                                        
                                        <line x1="60" y1="300" x2="60" y2="305" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="1" />
                                        <text x="60" y="320" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="9">20</text>
                                        
                                        <line x1="120" y1="300" x2="120" y2="305" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="1" />
                                        <text x="120" y="320" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="9">40</text>
                                        
                                        <line x1="180" y1="300" x2="180" y2="305" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="1" />
                                        <text x="180" y="320" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="9">60</text>
                                        
                                        <line x1="240" y1="300" x2="240" y2="305" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="1" />
                                        <text x="240" y="320" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="9">80</text>
                                        
                                        <line x1="300" y1="300" x2="300" y2="305" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="1" />
                                        <text x="300" y="320" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="9">100</text>
                                        
                                        {/* Y轴刻度 */}
                                        <line x1="-5" y1="300" x2="0" y2="300" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="1" />
                                        <text x="-15" y="305" textAnchor="end" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="9">0</text>
                                        
                                        <line x1="-5" y1="240" x2="0" y2="240" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="1" />
                                        <text x="-15" y="245" textAnchor="end" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="9">20</text>
                                        
                                        <line x1="-5" y1="180" x2="0" y2="180" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="1" />
                                        <text x="-15" y="185" textAnchor="end" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="9">40</text>
                                        
                                        <line x1="-5" y1="120" x2="0" y2="120" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="1" />
                                        <text x="-15" y="125" textAnchor="end" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="9">60</text>
                                        
                                        <line x1="-5" y1="60" x2="0" y2="60" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="1" />
                                        <text x="-15" y="65" textAnchor="end" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="9">80</text>
                                        
                                        <line x1="-5" y1="0" x2="0" y2="0" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="1" />
                                        <text x="-15" y="5" textAnchor="end" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="9">100</text>
                                        
                                        {/* 绘制行为激活曲线 */}
                                        <path d="M 0 0 L 15 24 L 30 48 L 45 72 L 60 96 L 75 120 L 90 144 L 105 168 L 120 192 L 135 216 L 150 240 L 165 264 L 180 288 L 195 298 L 210 293 L 225 288 L 240 283 L 255 278 L 270 273 L 285 268 L 300 263" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        
                                        {/* 标注区域 */}
                                        {/* 目标行为发生区 - 曲线右上方 */}
                                        <polygon 
                                            points="0,0 300,0 300,300 100,300" 
                                            fill="#10b981" 
                                            fillOpacity="0.1" 
                                            stroke="#10b981" 
                                            strokeWidth="1" 
                                            strokeDasharray="3,3"
                                        />
                                        <text x="200" y="50" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">
                                            目标行为发生区
                                        </text>
                                        
                                        {/* 行为未发生区 - 曲线左下方 */}
                                        <polygon 
                                            points="0,300 0,200 300,300" 
                                            fill="#ef4444" 
                                            fillOpacity="0.1" 
                                            stroke="#ef4444" 
                                            strokeWidth="1" 
                                            strokeDasharray="3,3"
                                        />
                                        <text x="100" y="250" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold">
                                            行为未发生区
                                        </text>
                                        
                                        {/* 标注三个核心要素 */}
                                        {foggBehaviorData.elements.map(element => {
                                            const x = (element.x / 100) * 300;
                                            const y = 300 - (element.y / 100) * 300;
                                            return (
                                                <g key={element.id}>
                                                    {/* 要素圆圈 */}
                                                    <circle cx={x} cy={y} r={25} fill={element.color} fillOpacity="0.2" stroke={element.color} strokeWidth="2" />
                                                    <circle cx={x} cy={y} r={20} fill={isDark ? "#18181b" : "#ffffff"} stroke={element.color} strokeWidth="1" />
                                                    
                                                    {/* 要素图标 */}
                                                    <text x={x} y={y - 2} textAnchor="middle" fontSize="16">{element.icon}</text>
                                                    
                                                    {/* 要素标签 */}
                                                    <text x={x} y={y + 35} textAnchor="middle" fill={element.color} fontSize="12" fontWeight="bold">
                                                        {element.label}
                                                    </text>
                                                    
                                                    {/* 要素描述 */}
                                                    <text x={x} y={y + 50} textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="8" width="80" textLength="80">
                                                        {element.description}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                    </g>
                                </svg>
                            </div>
                        ) : activeChart === 'eisenhowerMatrix' ? (
                            <div className="flex flex-col items-center justify-center h-full w-full p-4">
                                <svg width="100%" height="100%" viewBox="0 0 450 450" preserveAspectRatio="xMidYMid meet">
                                        {/* 绘制矩阵网格 */}
                                        <rect x="60" y="60" width="330" height="330" fill="none" stroke={isDark ? "#3f3f46" : "#e2e8f0"} strokeWidth="2" />
                                        <line x1="225" y1="60" x2="225" y2="390" stroke={isDark ? "#3f3f46" : "#e2e8f0"} strokeWidth="2" />
                                        <line x1="60" y1="225" x2="390" y2="225" stroke={isDark ? "#3f3f46" : "#e2e8f0"} strokeWidth="2" />
                                        
                                        {/* 绘制四个象限 */}
                                        {eisenhowerMatrixData.map((quadrant, index) => {
                                            const x = quadrant.x * 450;
                                            const y = quadrant.y * 450;
                                            const rectX = quadrant.x < 0.5 ? 60 : 225;
                                            const rectY = quadrant.y < 0.5 ? 60 : 225;
                                            return (
                                                <g key={quadrant.id}>
                                                    {/* 象限背景 */}
                                                    <rect x={rectX} y={rectY} width="165" height="165" fill={quadrant.color} fillOpacity="0.1" stroke={quadrant.color} strokeWidth="1" />
                                                    
                                                    {/* 象限圆圈 - 调整大小，减小半径 */}
                                                    <circle cx={x} cy={y} r={35} fill={quadrant.color} fillOpacity="0.2" stroke={quadrant.color} strokeWidth="3" />
                                                    <circle cx={x} cy={y} r={28} fill={isDark ? "#18181b" : "#ffffff"} stroke={quadrant.color} strokeWidth="2" />
                                                    
                                                    {/* 象限图标 - 缩小尺寸 */}
                                                    <text x={x} y={y - 5} textAnchor="middle" fontSize="19">{quadrant.icon}</text>
                                                    
                                                    {/* 象限标签 - 调整字体大小和位置 */}
                                                    <text x={x} y={y + 15} textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="12" fontWeight="bold">
                                                        {quadrant.label}
                                                    </text>
                                                    
                                                    {/* 象限描述 - 调整字体大小和位置，避免重叠 */}
                                                    <text x={x} y={y + 45} textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="8" width="100" textLength="100">
                                                        {quadrant.description}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                        
                                        {/* 坐标轴标签 - 调整位置 */}
                                        <text x="410" y="140" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="11" fontWeight="bold">
                                            紧急
                                        </text>
                                        <text x="40" y="140" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="11" fontWeight="bold">
                                            不紧急
                                        </text>
                                        <text x="225" y="40" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="11" fontWeight="bold">
                                            重要
                                        </text>
                                        <text x="225" y="410" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="11" fontWeight="bold">
                                            不重要
                                        </text>
                                        
                                        {/* 矩阵标题 */}
                                        <text x="225" y="430" textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="13" fontWeight="bold">
                                            艾森豪威尔矩阵 (紧急-重要矩阵)
                                        </text>
                                </svg>
                                <div className="mt-4 text-center">
                                    <p className={`text-sm ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
                                        艾森豪威尔矩阵：根据紧急性和重要性将任务分类，帮助你优化时间管理，优先处理重要事务。
                                    </p>
                                </div>
                            </div>
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
        ) : (
            <div className="flex items-center justify-center h-full text-zinc-400">选择一个图表查看</div>
        )}
                </div>

            {/* Deep Analysis Module - Separate Section */}
            {activeChartObj.deepAnalysis && (
                <div className={`p-4 rounded-xl border ${cardBg} z-10`}>
                    <h3 className={`font-bold flex items-center gap-2 ${textMain} text-base mb-3`}>
                        <BrainCircuit size={16} className={isDark ? 'text-purple-400' : 'text-purple-600'}/> 深度解析 - {activeChartObj.label}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-4 rounded-lg border ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] border-transparent' : isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-slate-200'}`}>
                            <h4 className={`text-sm font-bold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>概念原理</h4>
                            <p className={`text-sm ${textSub}`}>{activeChartObj.deepAnalysis.concept}</p>
                        </div>
                        <div className={`p-4 rounded-lg border ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] border-transparent' : isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-slate-200'}`}>
                            <h4 className={`text-sm font-bold mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>使用方法与技巧</h4>
                            <p className={`text-sm ${textSub}`}>{activeChartObj.deepAnalysis.usage}</p>
                        </div>
                        <div className={`p-4 rounded-lg border ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,1)] border-transparent' : isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-slate-200'}`}>
                            <h4 className={`text-sm font-bold mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>实践核心原则</h4>
                            <p className={`text-sm ${textSub}`}>{activeChartObj.deepAnalysis.principle}</p>
                        </div>
                    </div>
                </div>
            )}

                </div> <!-- 关闭space-y-6 -->
            </div> <!-- 关闭图表学习模块 -->

        </div>
    </div>
    </div>
  );
};

export default MissionControl;