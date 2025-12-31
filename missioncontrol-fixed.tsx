import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid,
  ComposedChart, Area, Line, ReferenceLine,
  AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceArea, ScatterChart, Scatter, ZAxis, Cell, LineChart, Pie, ResponsiveContainer
} from 'recharts';
import BaseChart from './BaseChart';
import { chartConfig, getGridColor, getTooltipStyle } from './ChartConfig';
import { Activity, BarChart2, Mountain, Zap, BrainCircuit, Pickaxe, Hexagon, TrendingUp, Anchor, Target, CircleDot, PieChart, RotateCw, Smile, Battery, TrendingDown, Scale, Compass, Layers, GitMerge, Shield, Eye, CheckCircle2, Clock, GripVertical, HelpCircle, Square, ArrowRight, Search, BookOpen, Repeat, FileSearch, Lightbulb, RefreshCw, Timer, Star, FileText, MessageCircle, User, ArrowLeftRight, Layout, Diamond } from 'lucide-react';
import { Theme, Project, Habit, Chart } from '../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GlobalGuideCard from './HelpSystem/HelpModal';
import { helpContent } from './HelpSystem/HelpContent';

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
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 默认指南卡片配置
  const guideCardConfig = {
    fontSize: 'medium' as const,
    borderRadius: 'medium' as const,
    shadowIntensity: 'medium' as const,
    showUnderlyingPrinciple: true
  };

  // 组件挂载时确保图表容器有固定高度
  useEffect(() => {
    // 固定图表高度为400px，确保图表始终有有效高度
    const chartHeight = 400;
    setChartHeight(chartHeight);
  }, []);

  // Drag and Drop state - 删除习惯完成率和专注时间趋势，添加新的成长型思维、沉没成本谬误和二八定律，以及新增的决策/行为/认知/学习类图表
  const [chartCategories, setChartCategories] = useState<{ [key: string]: string[] }>({
    trend: ['dip', 'dunning', 'jcurve', 'antifragile', 'secondcurve', 'compound', 'mining', 'dopamine', 'flow', 'windLaw'],
    concept: ['zone', 'woop', 'peakEnd', 'valueVenn', 'purpose', 'johariWindow', 'footInDoor', 'deliberatePractice', 'foggBehavior', 'eisenhowerMatrix', 'growthMindset', 'sunkCost', 'pareto', 'swot', 'goldenCircle', 'fiveWhys', 'brokenWindow', 'matthewEffect', 'hedgehogPrinciple', 'survivorshipBias', 'occamsRazor', 'anchoringEffect', 'tenThousandHours', 'feynmanTechnique', 'spacedRepetition', 'probabilityThinking', 'regretMinimization', 'identityTheory', 'zeigarnikEffect', 'grayThinking', 'reverseThinking', 'riaReading', 'feedbackLoop', 'eisenhowerAdvanced', 'energyManagement', 'prospectTheory', 'weightedDecisionMatrix', 'feedbackPeakLaw', 'environmentDesign', 'frameRefactoring', 'knowledgeCrystallization', 'metaLearning', 'crossDomainLearning', 'energySegmentation', 'smartPrinciple']
  });

  // Load saved categories from localStorage
  useEffect(() => {
    const savedCategories = localStorage.getItem('chartCategories');
    const initialCategories = {
      trend: ['dip', 'dunning', 'jcurve', 'antifragile', 'secondcurve', 'compound', 'mining', 'dopamine', 'flow', 'windLaw'],
      concept: ['zone', 'woop', 'peakEnd', 'valueVenn', 'purpose', 'johariWindow', 'footInDoor', 'deliberatePractice', 'foggBehavior', 'eisenhowerMatrix', 'growthMindset', 'sunkCost', 'pareto', 'swot', 'goldenCircle', 'fiveWhys', 'brokenWindow', 'matthewEffect', 'hedgehogPrinciple', 'survivorshipBias', 'occamsRazor', 'anchoringEffect', 'tenThousandHours', 'feynmanTechnique', 'spacedRepetition', 'probabilityThinking', 'regretMinimization', 'identityTheory', 'zeigarnikEffect', 'grayThinking', 'reverseThinking', 'riaReading', 'feedbackLoop', 'eisenhowerAdvanced', 'energyManagement', 'prospectTheory', 'weightedDecisionMatrix', 'feedbackPeakLaw', 'environmentDesign', 'frameRefactoring', 'knowledgeCrystallization', 'metaLearning', 'crossDomainLearning', 'energySegmentation', 'smartPrinciple', 'exposureEffect', 'emotionABC', 'endowmentEffect', 'bystanderEffect', 'birdcageEffect', 'metacognition', 'transferLearning', 'singleTasking', 'parkinsonsLaw', 'nonviolentCommunication', 'reciprocityPrinciple', 'systemFeedback', 'bottleneckTheory', 'valueProposition', 'opportunityCost', 'mvpThinking', 'buildMeasureLearn', 'butterflyEffect', 'pathDependency', 'opportunitySunkCost', 'scarcityAbundance', 'minimalResistance', 'immediateFeedback', 'perspectiveShift', 'firstPrincipleAdvanced', 'ecologicalNiche', 'symbiosisEffect', 'multidimensionalCompounding', 'valueDensity', 'cognitiveCircle', 'boundaryBreaking', 'redundancyBackup', 'rhythmControl', 'dislocationCompetition', 'networkEffect', 'assetizationThinking', 'moatThinking', 'knowledgeActionUnity', 'microHabitCompounding', 'barbellStrategy', 'antifragileThinking', 'supplyDemandMismatch', 'leverageThinking', 'reverseEngineering', 'firstPrincipleMigration', 'potentialEnergyAccumulation', 'valueMultiplication', 'essenceThinking', 'nodeControlThinking', 'actionCalibrationThinking', 'platformLeverageThinking', 'ecologicalFeedbackThinking']
    };
    
    if (savedCategories) {
      // Merge saved categories with initial categories to ensure all charts are included
      const parsedCategories = JSON.parse(savedCategories);
      const mergedCategories = {
        trend: [...new Set([...initialCategories.trend, ...(parsedCategories.trend || [])])].filter(id => !['habitCompletion', 'focusTrend'].includes(id)),
        concept: [...new Set([...initialCategories.concept, ...(parsedCategories.concept || [])])]
      };
      setChartCategories(mergedCategories);
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

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      setActiveChart(id);
    };

    // Create smooth animation styles for dragging
    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging ? 'transform 0.1s ease-out' : 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 'auto',
      scale: isDragging ? 1.05 : 1,
      cursor: 'pointer' // 整个按钮区域都显示指针图标
    };

    return (
      <div
        ref={setNodeRef}
        className={`flex items-center px-4 py-1.5 rounded-[24px] text-xs font-bold transition-all ${getButtonClass(activeChart === id)}`}
        style={style}
        {...attributes}
        onClick={handleClick} // 将点击事件移到外层div，确保整个按钮区域都可以点击
      >
        {/* Drag handle - only this part handles drag events */}
        <span
          className="cursor-move hover:text-blue-500 transition-colors flex-shrink-0"
          {...listeners}
          style={{ zIndex: 1 }} // 确保拖动手柄在最上层
        >
          <GripVertical size={10} className="mr-1 text-zinc-500" />
        </span>
        
        {/* Button content - no longer needs separate button element */}
        <div className="flex items-center gap-1 flex-grow">
          <chart.icon size={12}/> {chart.label}
        </div>
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
    const chart = CHARTS.find(chart => chart.id === id);
    if (chart) {
      return {
        ...chart,
        visualizationDesign: chart.visualizationDesign || `这是${chart.label}的可视化设计描述，包含图表类型、视觉元素、配色方案等详细信息。`
      };
    }
    return undefined;
  };

  // Chart rendering function to avoid complex nested conditional rendering
  const renderChart = () => {
    const activeChartObj = getChartById(activeChart);
    
    switch (activeChart) {
      case 'attributeRadar':
        return (
          <BaseChart data={attributeData} isDark={isDark} height={chartHeight}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={attributeData} animationDuration={1000}>
              <PolarGrid stroke={getGridColor(isDark)} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#a1a1aa' : '#64748b', fontSize: chartConfig.fontSize.axisTick, fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fontSize: 8 }} axisLine={false} label={{ value: '能力值', angle: -90, position: 'insideLeft', fontSize: chartConfig.fontSize.axisLabel }} />
              <Radar name="能力值" dataKey="A" stroke={chartConfig.colors.purple} strokeWidth={2} fill={chartConfig.colors.purple} fillOpacity={0.3} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
              <text x="50%" y="20" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={chartConfig.fontSize.title} fontWeight="bold">
                角色属性雷达图
              </text>
            </RadarChart>
          </BaseChart>
        );
      case 'focusHeatmap':
        return (
          <BaseChart data={dailyFocusData} isDark={isDark} height={chartHeight}>
            <BarChart data={dailyFocusData} animationDuration={1000}>
              <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} vertical={false}/>
              <XAxis dataKey="name" stroke={chartConfig.axis.stroke} fontSize={chartConfig.fontSize.axisTick} tickLine={chartConfig.axis.tickLine} interval={0} label={{ value: '日期', position: chartConfig.axis.label.position, fontSize: chartConfig.fontSize.axisLabel }}/>
              <YAxis stroke={chartConfig.axis.stroke} fontSize={chartConfig.fontSize.axisTick} tickLine={chartConfig.axis.tickLine} label={{ value: '专注时间 (分钟)', angle: -90, position: 'insideLeft', fontSize: chartConfig.fontSize.axisLabel }} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle}/>
              <Bar dataKey="projects" name="主线攻坚" stackId="a" fill={chartConfig.colors.danger} radius={[0,0,0,0]} />
              <Bar dataKey="habits" name="日常维持" stackId="a" fill={chartConfig.colors.primary} radius={[4,4,0,0]} />
              <text x="50%" y="20" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={chartConfig.fontSize.title} fontWeight="bold">
                每日专注时间分布
              </text>
            </BarChart>
          </BaseChart>
        );
      case 'mining':
        return (
          <BaseChart data={miningData} isDark={isDark} height={chartHeight}>
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
              <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
              <XAxis dataKey="day" stroke={chartConfig.axis.stroke} label={{ value: '天数', position: chartConfig.axis.label.position, fontSize: chartConfig.fontSize.axisLabel }} />
              <YAxis stroke={chartConfig.axis.stroke} label={{ value: '数值', angle: -90, position: 'insideLeft', fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 'dataMax + 10']} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
              <Area type="monotone" dataKey="resistance" stroke={chartConfig.colors.danger} strokeWidth={2} fill="url(#colorResistance)" name="阻力" />
              <Area type="monotone" dataKey="yield" stroke={chartConfig.colors.secondary} strokeWidth={2} fill="url(#colorYield)" name="收益" />
              <text x="50%" y="20" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={chartConfig.fontSize.title} fontWeight="bold">
                长期投资收益曲线
              </text>
            </AreaChart>
          </BaseChart>
        );
      case 'entropy':
        return (
          <BaseChart data={entropyData} isDark={isDark} height={chartHeight}>
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
              <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
              <XAxis dataKey="t" stroke={chartConfig.axis.stroke} label={{ value: '时间', position: chartConfig.axis.label.position, fontSize: chartConfig.fontSize.axisLabel }} />
              <YAxis stroke={chartConfig.axis.stroke} label={{ value: '熵值', angle: -90, position: 'insideLeft', fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 'dataMax + 20']} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
              <Area type="monotone" dataKey="chaos" stackId="1" stroke={chartConfig.colors.danger} fill="url(#colorChaos)" fillOpacity={0.3} name="自然熵增" />
              <Area type="monotone" dataKey="order" stackId="1" stroke={chartConfig.colors.secondary} fill="url(#colorOrder)" fillOpacity={0.3} name="人为有序" />
              <text x="50%" y="20" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={chartConfig.fontSize.title} fontWeight="bold">
                熵增与熵减的动态平衡
              </text>
            </AreaChart>
          </BaseChart>
        );
      case 'dip':
        return (
          <BaseChart data={dipData} isDark={isDark} height={chartHeight}>
            <AreaChart data={dipData} margin={{ top: 10, right: 30, left: 30, bottom: 30 }} animationDuration={1000}>
              <defs>
                <linearGradient id="colorDip" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor={chartConfig.colors.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartConfig.colors.secondary} stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} vertical={false} />
              <XAxis dataKey="x" stroke={chartConfig.axis.stroke} tick={{ fontSize: chartConfig.fontSize.axisTick }} label={{ value: '投入度', position: 'insideBottom', offset: 0, fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 100]} />
              <YAxis stroke={chartConfig.axis.stroke} tick={{ fontSize: chartConfig.fontSize.axisTick }} label={{ value: '产出率', angle: -90, position: 'insideLeft', offset: 0, fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 100]} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
              <Line type="monotone" dataKey="results" stroke={chartConfig.colors.primary} strokeWidth={3} dot={false} name="产出率" />
              <text x="50%" y="20" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={chartConfig.fontSize.title} fontWeight="bold">
                死亡谷效应
              </text>
            </AreaChart>
          </BaseChart>
        );
      case 'dunning':
        return (
          <div className="w-full h-full flex items-center justify-center p-4">
            <svg width="100%" height="100%" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
              {/* 背景网格和坐标轴 */}
              <defs>
                <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#ffffff;stop-opacity:1" />
                </linearGradient>
              </defs>
              
              {/* 4个彩色背景分区 */}
              <rect x="50" y="50" width="180" height="400" fill="#ff6b6b" rx="2" ry="2" />
              <rect x="230" y="50" width="180" height="400" fill="#ffd93d" rx="2" ry="2" />
              <rect x="410" y="50" width="180" height="400" fill="#6bcb77" rx="2" ry="2" />
              <rect x="590" y="50" width="160" height="400" fill="#4dabf7" rx="2" ry="2" />
              
              {/* 坐标轴 */}
              <line x1="50" y1="450" x2="750" y2="450" stroke="#333" stroke-width="2" />
              <line x1="50" y1="50" x2="50" y2="450" stroke="#333" stroke-width="2" />
              
              {/* 坐标轴箭头 */}
              <polygon points="750,450 740,445 740,455" fill="#333" />
              <polygon points="50,50 45,60 55,60" fill="#333" />
              
              {/* 坐标轴标签 */}
              <text x="400" y="480" font-size="14" fill="#333" text-anchor="middle">智慧水平（知识与经验，低→高）</text>
              <text x="20" y="250" font-size="14" fill="#333" text-anchor="middle" transform="rotate(-90, 20, 250)">自信程度（高→低）</text>
              
              {/* 背景分区名称 */}
              <text x="140" y="250" font-size="16" fill="white" text-anchor="middle">自信爆棚区</text>
              <text x="320" y="250" font-size="16" fill="white" text-anchor="middle">自信崩溃区</text>
              <text x="500" y="250" font-size="16" fill="white" text-anchor="middle">自信重建区</text>
              <text x="670" y="250" font-size="16" fill="white" text-anchor="middle">自信成熟区</text>
              
              {/* 表现标签 */}
              <text x="140" y="550" font-size="14" fill="#333" text-anchor="middle">巨婴</text>
              <text x="320" y="550" font-size="14" fill="#333" text-anchor="middle">屌丝</text>
              <text x="500" y="550" font-size="14" fill="#333" text-anchor="middle">智者</text>
              <text x="670" y="550" font-size="14" fill="#333" text-anchor="middle">大师</text>
              
              {/* 平滑曲线 */}
              <path d="M 100,100 C 150,80 200,150 250,350 C 300,420 350,380 400,320 C 450,260 500,220 550,180 C 600,140 650,120 700,100" 
                    stroke="#333" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
              
              {/* 曲线关键节点标注 */}
              <text x="120" y="80" font-size="14" fill="red" font-weight="bold" text-anchor="middle">愚昧之巅</text>
              <text x="280" y="370" font-size="14" fill="red" font-weight="bold" text-anchor="middle">绝望之谷</text>
              <text x="460" y="300" font-size="14" fill="red" font-weight="bold" text-anchor="middle">开悟之坡</text>
              <text x="680" y="80" font-size="14" fill="red" font-weight="bold" text-anchor="middle">平稳高原</text>
              
              {/* 图标：自信爆棚区 - 人物图标 */}
              <circle cx="140" cy="150" r="30" fill="white" opacity="0.8" />
              <circle cx="130" cy="140" r="5" fill="#333" />
              <circle cx="150" cy="140" r="5" fill="#333" />
              <path d="M 130,155 Q 140,165 150,155" stroke="#333" stroke-width="2" fill="none" />
              <rect x="125" y="170" width="30" height="40" fill="white" stroke="#333" stroke-width="2" rx="5" ry="5" />
              <line x1="140" y1="210" x2="140" y2="240" stroke="#333" stroke-width="2" />
              <line x1="120" y1="220" x2="160" y2="220" stroke="#333" stroke-width="2" />
              
              {/* 图标：自信崩溃区 - 崩溃图标 */}
              <circle cx="320" cy="250" r="30" fill="white" opacity="0.8" />
              <path d="M 300,230 L 340,270 M 300,270 L 340,230" stroke="#333" stroke-width="3" />
              <circle cx="310" cy="220" r="8" fill="#ff6b6b" opacity="0.8" />
              <circle cx="330" cy="220" r="8" fill="#ff6b6b" opacity="0.8" />
              <rect x="315" y="260" width="10" height="15" fill="#333" rx="2" ry="2" />
              
              {/* 图标：自信重建区 - 上升箭头图标 */}
              <polygon points="500,200 520,220 480,220" fill="#333" />
              <rect x="495" y="220" width="10" height="40" fill="#333" />
              <circle cx="500" cy="270" r="20" fill="white" opacity="0.8" stroke="#333" stroke-width="2" />
              <path d="M 490,265 L 510,265 M 500,255 L 500,275" stroke="#333" stroke-width="2" />
              <line x1="485" y1="285" x2="515" y2="285" stroke="#333" stroke-width="2" />
              
              {/* 图标：自信成熟区 - 大脑图标 */}
              <ellipse cx="670" cy="150" rx="35" ry="45" fill="white" opacity="0.8" stroke="#333" stroke-width="2" />
              <path d="M 635,150 C 635,130 650,115 670,115 C 690,115 705,130 705,150" stroke="#333" stroke-width="2" fill="none" />
              <path d="M 645,125 L 665,145 M 655,125 L 675,145 M 665,125 L 685,145" stroke="#333" stroke-width="1.5" />
              <path d="M 645,175 L 665,155 M 655,175 L 675,155 M 665,175 L 685,155" stroke="#333" stroke-width="1.5" />
              
              {/* 图表标题 */}
              <text x="400" y="30" font-size="20" font-weight="bold" text-anchor="middle" fill="#333">达克效应曲线</text>
            </svg>
          </div>
        );
      case 'jcurve':
        return (
          <BaseChart data={jCurveData} isDark={isDark} height={chartHeight}>
            <LineChart data={jCurveData} animationDuration={1000} margin={{ top: 10, right: 30, left: 30, bottom: 30 }}>
              <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
              <XAxis dataKey="t" stroke={chartConfig.axis.stroke} tick={{ fontSize: chartConfig.fontSize.axisTick }} label={{ value: '时间', position: 'insideBottom', offset: 0, fontSize: chartConfig.fontSize.axisLabel }} />
              <YAxis stroke={chartConfig.axis.stroke} tick={{ fontSize: chartConfig.fontSize.axisTick }} label={{ value: '回报值', angle: -90, position: 'insideLeft', offset: 0, fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 'dataMax + 10']} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
              <Line type="monotone" dataKey="value" stroke={chartConfig.colors.primary} strokeWidth={3} dot={false} name="J型曲线" />
              <text x="50%" y="20" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={chartConfig.fontSize.title} fontWeight="bold">
                J型曲线 - 长期投资回报模式
              </text>
            </LineChart>
          </BaseChart>
        );
      case 'antifragile':
        return (
          <BaseChart data={antifragileData} isDark={isDark} height={chartHeight}>
            <AreaChart data={antifragileData} animationDuration={1000} margin={{ top: 10, right: 30, left: 30, bottom: 30 }}>
              <defs>
                <linearGradient id="colorFragile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig.colors.danger} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={chartConfig.colors.danger} stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorAntifragile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig.colors.secondary} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={chartConfig.colors.secondary} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
              <XAxis dataKey="stress" stroke={chartConfig.axis.stroke} tick={{ fontSize: chartConfig.fontSize.axisTick }} label={{ value: '压力水平', position: 'insideBottom', offset: 0, fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 100]} />
              <YAxis stroke={chartConfig.axis.stroke} tick={{ fontSize: chartConfig.fontSize.axisTick }} label={{ value: '韧性值', angle: -90, position: 'insideLeft', offset: 0, fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 'dataMax + 20']} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
              <Area type="monotone" dataKey="fragile" stroke={chartConfig.colors.danger} fill="url(#colorFragile)" name="脆弱" />
              <Area type="monotone" dataKey="antifragile" stroke={chartConfig.colors.secondary} fill="url(#colorAntifragile)" name="反脆弱" />
              <text x="50%" y="20" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={chartConfig.fontSize.title} fontWeight="bold">
                反脆弱 - 压力与韧性关系
              </text>
            </AreaChart>
          </BaseChart>
        );
      case 'secondcurve':
        return (
          <BaseChart data={secondCurveData} isDark={isDark} height={chartHeight}>
            <AreaChart data={secondCurveData} animationDuration={1000} margin={{ top: 10, right: 30, left: 30, bottom: 30 }}>
              <defs>
                <linearGradient id="colorCurve1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig.colors.primary} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={chartConfig.colors.primary} stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorCurve2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig.colors.secondary} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={chartConfig.colors.secondary} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
              <XAxis dataKey="t" stroke={chartConfig.axis.stroke} tick={{ fontSize: chartConfig.fontSize.axisTick }} label={{ value: '时间', position: 'insideBottom', offset: 0, fontSize: chartConfig.fontSize.axisLabel }} />
              <YAxis stroke={chartConfig.axis.stroke} tick={{ fontSize: chartConfig.fontSize.axisTick }} label={{ value: '增长值', angle: -90, position: 'insideLeft', offset: 0, fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 'dataMax + 20']} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
              <Area type="monotone" dataKey="curve1" stroke={chartConfig.colors.primary} fill="url(#colorCurve1)" name="第一曲线" />
              <Area type="monotone" dataKey="curve2" stroke={chartConfig.colors.secondary} fill="url(#colorCurve2)" name="第二曲线" />
              <text x="50%" y="20" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={chartConfig.fontSize.title} fontWeight="bold">
                第二曲线 - 持续增长模型
              </text>
            </AreaChart>
          </BaseChart>
        );
      case 'flywheel':
        return (
          <BaseChart data={flywheelData} isDark={isDark} height={chartHeight}>
            <AreaChart data={flywheelData} animationDuration={1000}>
              <defs>
                <linearGradient id="colorMomentum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig.colors.primary} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={chartConfig.colors.primary} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
              <XAxis dataKey="time" stroke={chartConfig.axis.stroke} label={{ value: '时间', position: 'insideBottom', fontSize: chartConfig.fontSize.axisLabel }} />
              <YAxis stroke={chartConfig.axis.stroke} label={{ value: '动能值', angle: -90, position: 'insideLeft', fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 'dataMax + 10']} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
              <Area type="monotone" dataKey="momentum" stroke={chartConfig.colors.primary} fill="url(#colorMomentum)" name="飞轮动能" />
              <text x="50%" y="20" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={chartConfig.fontSize.title} fontWeight="bold">
                飞轮效应 - 动能积累模型
              </text>
            </AreaChart>
          </BaseChart>
        );
      case 'regret':
        return (
          <BaseChart data={regretData} isDark={isDark} height={chartHeight}>
            <BarChart data={regretData} animationDuration={1000}>
              <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} vertical={false} />
              <XAxis dataKey="type" stroke={chartConfig.axis.stroke} tick={{ fontSize: chartConfig.fontSize.axisTick }} label={{ value: '后悔类型', position: 'insideBottom', fontSize: chartConfig.fontSize.axisLabel }} />
              <YAxis stroke={chartConfig.axis.stroke} tick={{ fontSize: chartConfig.fontSize.axisTick }} label={{ value: '痛苦程度', angle: -90, position: 'insideLeft', fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 'dataMax + 10']} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
              <Bar dataKey="pain" fill={chartConfig.colors.danger} name="痛苦程度" />
              <text x="50%" y="20" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={chartConfig.fontSize.title} fontWeight="bold">
                后悔程度比较 - 行动与不行动的痛苦对比
              </text>
            </BarChart>
          </BaseChart>
        );
      case 'energy':
        return (
          <BaseChart data={energyData} isDark={isDark} height={chartHeight}>
            <AreaChart data={energyData} animationDuration={1000}>
              <defs>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig.colors.primary} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={chartConfig.colors.primary} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
              <XAxis dataKey="time" stroke={chartConfig.axis.stroke} label={{ value: '时间', position: 'insideBottom', fontSize: chartConfig.fontSize.axisLabel }} />
              <YAxis stroke={chartConfig.axis.stroke} label={{ value: '精力值', angle: -90, position: 'insideLeft', fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 100]} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
              <Area type="monotone" dataKey="energy" stroke={chartConfig.colors.primary} fill="url(#colorEnergy)" name="精力值" />
              <text x="50%" y="20" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={chartConfig.fontSize.title} fontWeight="bold">
                每日精力曲线变化
              </text>
            </AreaChart>
          </BaseChart>
        );
      case 'compound':
        return (
          <BaseChart data={compoundData} isDark={isDark} height={chartHeight}>
            <AreaChart data={compoundData} animationDuration={1000}>
              <defs>
                <linearGradient id="colorCompound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig.colors.primary} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={chartConfig.colors.primary} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
              <XAxis dataKey="day" stroke={chartConfig.axis.stroke} label={{ value: '天数', position: 'insideBottom', fontSize: chartConfig.fontSize.axisLabel }} />
              <YAxis stroke={chartConfig.axis.stroke} label={{ value: '累积效应', angle: -90, position: 'insideLeft', fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 'dataMax + 50']} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
              <Area type="monotone" dataKey="better" stroke={chartConfig.colors.primary} fill="url(#colorCompound)" name="每天进步1%" />
              <Area type="monotone" dataKey="worse" stroke={chartConfig.colors.danger} fillOpacity={0.3} name="每天退步1%" />
              <text x="50%" y="20" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={chartConfig.fontSize.title} fontWeight="bold">
                复利效应 - 每天1%的力量
              </text>
            </AreaChart>
          </BaseChart>
        );
      case 'dopamine':
        return (
          <BaseChart data={dopamineData} isDark={isDark} height={chartHeight}>
            <AreaChart data={dopamineData} animationDuration={1000}>
              <defs>
                <linearGradient id="colorDopamine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
              <XAxis dataKey="hour" stroke={chartConfig.axis.stroke} tick={{ fontSize: chartConfig.fontSize.axisTick }} label={{ value: '时间（小时）', position: 'insideBottom', fontSize: chartConfig.fontSize.axisLabel }} />
              <YAxis stroke={chartConfig.axis.stroke} label={{ value: '多巴胺水平', angle: -90, position: 'insideLeft', fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 'dataMax + 10']} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
              <Area type="monotone" dataKey="level" stroke="#f59e0b" fill="url(#colorDopamine)" name="多巴胺水平" />
              <Line type="monotone" dataKey="baseline" stroke="#71717a" strokeDasharray="3 3" name="基线水平" />
              <text x="50%" y="20" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={chartConfig.fontSize.title} fontWeight="bold">
                每日多巴胺水平变化曲线
              </text>
            </AreaChart>
          </BaseChart>
        );
      case 'flow':
        return (
          <BaseChart data={flowData} isDark={isDark} height={chartHeight}>
            <ScatterChart data={flowData} animationDuration={1000}>
              <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
              <XAxis dataKey="x" stroke={chartConfig.axis.stroke} label={{ value: '挑战难度', position: 'insideBottom', fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 100]} />
              <YAxis dataKey="y" stroke={chartConfig.axis.stroke} label={{ value: '技能水平', angle: -90, position: 'insideLeft', fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 100]} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
              <Scatter name="心流状态点" data={flowData} fill={chartConfig.colors.primary} />
              <text x="50%" y="20" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={chartConfig.fontSize.title} fontWeight="bold">
                心流状态分布图
              </text>
            </ScatterChart>
          </BaseChart>
        );
      case 'zone':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
              {/* 绘制三个同心圆 */}
              {zoneData.map((item) => (
                <circle 
                  key={item.id} 
                  cx="150" 
                  cy="150" 
                  r={item.radius} 
                  fill={item.color} 
                  fillOpacity={item.fillOpacity} 
                  stroke={item.color} 
                  strokeWidth={2} 
                />
              ))}
              {/* 标签文字 */}
              <text x="150" y="150" textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="18" fontWeight="bold">
                舒适区模型
              </text>
              <text x="150" y="170" textAnchor="middle" fill={isDark ? "#a1a1aa" : "#64748b"} fontSize="12">
                舒适区 → 学习区 → 恐惧区
              </text>
            </svg>
          </div>
        );
      case 'woop':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 350 350" preserveAspectRatio="xMidYMid meet">
              {/* 绘制WOOP框架的四个象限 */}
              {woopData.map((item, index) => {
                const cx = item.x * 350;
                const cy = item.y * 350;
                return (
                  <g key={item.id}>
                    {/* 背景圆圈 */}
                    <circle cx={cx} cy={cy} r="45" fill={item.color} fillOpacity={item.fillOpacity} stroke={item.color} strokeWidth={2} />
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
              
              {/* 绘制连接线 */}
              {/* 水平连接线 - 顶部 */}
              <line x1="87.5" y1="87.5" x2="250" y2="87.5" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="2" strokeDasharray="3 3" />
              {/* 箭头 - 顶部 */}
              <polygon points="250,87.5 240,82.5 240,92.5" fill={isDark ? "#a1a1aa" : "#64748b"} />
              {/* 水平连接线 - 底部 */}
              <line x1="87.5" y1="250" x2="250" y2="250" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="2" strokeDasharray="3 3" />
              {/* 箭头 - 底部 */}
              <polygon points="250,250 240,245 240,255" fill={isDark ? "#a1a1aa" : "#64748b"} />
              {/* 垂直连接线 - 左侧 */}
              <line x1="87.5" y1="87.5" x2="87.5" y2="250" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="2" strokeDasharray="3 3" />
              {/* 箭头 - 左侧 */}
              <polygon points="87.5,250 82.5,240 92.5,240" fill={isDark ? "#a1a1aa" : "#64748b"} />
              {/* 垂直连接线 - 右侧 */}
              <line x1="250" y1="87.5" x2="250" y2="250" stroke={isDark ? "#a1a1aa" : "#64748b"} strokeWidth="2" strokeDasharray="3 3" />
              {/* 箭头 - 右侧 */}
              <polygon points="250,250 245,240 255,240" fill={isDark ? "#a1a1aa" : "#64748b"} />
              {/* 中心文字 */}
              <text x="168.75" y="168.75" textAnchor="middle" fill={isDark ? "#ffffff" : "#000000"} fontSize="14" fontWeight="bold">
                WOOP框架
              </text>
            </svg>
          </div>
        );
      case 'peakEnd':
        return (
          <BaseChart data={peakEndData} isDark={isDark} height={chartHeight}>
            <AreaChart data={peakEndData} animationDuration={1000}>
              <defs>
                <linearGradient id="colorPeakEnd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig.colors.primary} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={chartConfig.colors.primary} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
              <XAxis dataKey="time" stroke={chartConfig.axis.stroke} label={{ value: '时间', position: 'insideBottom', fontSize: chartConfig.fontSize.axisLabel }} />
              <YAxis stroke={chartConfig.axis.stroke} label={{ value: '体验强度', angle: -90, position: 'insideLeft', fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 'dataMax + 10']} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
              <Area type="monotone" dataKey="intensity" stroke={chartConfig.colors.primary} fill="url(#colorPeakEnd)" name="体验强度" />
              {/* 标记峰值点 */}
              <circle cx={peakEndData[3].time} cy={peakEndData[3].intensity} r={4} fill={chartConfig.colors.danger} stroke="white" strokeWidth={2} />
              <text x={peakEndData[3].time} y={peakEndData[3].intensity - 10} fill={chartConfig.colors.danger} fontSize={12} textAnchor="middle">峰值</text>
              {/* 标记结束点 */}
              <circle cx={peakEndData[peakEndData.length - 1].time} cy={peakEndData[peakEndData.length - 1].intensity} r={4} fill={chartConfig.colors.secondary} stroke="white" strokeWidth={2} />
              <text x={peakEndData[peakEndData.length - 1].time} y={peakEndData[peakEndData.length - 1].intensity - 10} fill={chartConfig.colors.secondary} fontSize={12} textAnchor="middle">结束点</text>
              <text x="50%" y="20" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={chartConfig.fontSize.title} fontWeight="bold">
                峰终定律 - 体验记忆曲线
              </text>
            </AreaChart>
          </BaseChart>
        );
      case 'valueVenn':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
              {/* 绘制三个重叠的椭圆 */}
              <ellipse cx="100" cy="150" rx="80" ry="80" fill={chartConfig.colors.purple} fillOpacity={0.3} stroke={chartConfig.colors.purple} strokeWidth={2} />
              <ellipse cx="200" cy="150" rx="80" ry="80" fill={chartConfig.colors.blue} fillOpacity={0.3} stroke={chartConfig.colors.blue} strokeWidth={2} />
              <ellipse cx="150" cy="100" rx="80" ry="80" fill={chartConfig.colors.green} fillOpacity={0.3} stroke={chartConfig.colors.green} strokeWidth={2} />
              {/* 标签文字 */}
              <text x="100" y="150" textAnchor="middle" fill={chartConfig.colors.purple} fontSize="14" fontWeight="bold">
                我能做
              </text>
              <text x="200" y="150" textAnchor="middle" fill={chartConfig.colors.blue} fontSize="14" fontWeight="bold">
                市场需要
              </text>
              <text x="150" y="60" textAnchor="middle" fill={chartConfig.colors.green} fontSize="14" fontWeight="bold">
                我热爱
              </text>
              <text x="150" y="150" textAnchor="middle" fill="#333333" fontSize="18" fontWeight="bold">
                价值甜蜜区
              </text>
            </svg>
          </div>
        );
      case 'purpose':
        return (
          <BaseChart data={purposeData} isDark={isDark} height={chartHeight}>
            <AreaChart data={purposeData} animationDuration={1000}>
              <defs>
                <linearGradient id="colorPurpose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig.colors.primary} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={chartConfig.colors.primary} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={getGridColor(isDark)} />
              <XAxis dataKey="time" stroke={chartConfig.axis.stroke} label={{ value: '时间', position: 'insideBottom', fontSize: chartConfig.fontSize.axisLabel }} />
              <YAxis stroke={chartConfig.axis.stroke} label={{ value: '人生意义感', angle: -90, position: 'insideLeft', fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 'dataMax + 10']} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
              <Area type="monotone" dataKey="purpose" stroke={chartConfig.colors.primary} fill="url(#colorPurpose)" name="人生意义感" />
              <text x="50%" y="20" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={chartConfig.fontSize.title} fontWeight="bold">
                人生意义感曲线
              </text>
            </AreaChart>
          </BaseChart>
        );
      case 'johariWindow':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
              {/* 绘制四个象限 */}
              <rect x="50" y="50" width="100" height="100" fill="#ffd700" fillOpacity={0.3} stroke="#ffd700" strokeWidth={2} />
              <rect x="150" y="50" width="100" height="100" fill="#4ecdc4" fillOpacity={0.3} stroke="#4ecdc4" strokeWidth={2} />
              <rect x="50" y="150" width="100" height="100" fill="#ff6b6b" fillOpacity={0.3} stroke="#ff6b6b" strokeWidth={2} />
              <rect x="1