import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid,
  ComposedChart, Area, Line, ReferenceLine,
  AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceArea, ScatterChart, Scatter, ZAxis, Cell, LineChart, Pie, ResponsiveContainer
} from 'recharts';
import BaseChart from './BaseChart';
import { chartConfig, getGridColor, getTooltipStyle } from './ChartConfig';
import { Activity, BarChart2, Mountain, Zap, BrainCircuit, Pickaxe, Hexagon, TrendingUp, Anchor, Target, CircleDot, PieChart, RotateCw, Smile, Battery, TrendingDown, Scale, Compass, Layers, GitMerge, Shield, Eye, CheckCircle2, Clock, GripVertical, HelpCircle, Square, ArrowRight, Search, BookOpen, Repeat, FileSearch, Lightbulb, RefreshCw, Timer, Star, FileText, MessageCircle, User, ArrowLeftRight, Layout, Diamond } from 'lucide-react';
import { Theme, Project, Habit } from '../types';
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
  
  // 拟态风格样式变量 - 优化阴影效果，使其与按钮圆角匹配
  const neomorphicStyles = {
    bg: 'bg-[#e0e5ec]',
    border: 'border-[#e0e5ec]',
    shadow: 'shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] rounded-[24px]',
    hoverShadow: 'hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)] rounded-[24px]',
    activeShadow: 'active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)] rounded-[24px]',
    transition: 'transition-all duration-200'
  };
  
  const bgClass = isDark ? 'bg-zinc-950' : isNeomorphic ? 'bg-[#e0e5ec]' : 'bg-slate-50';
  const cardBg = isDark 
      ? 'bg-zinc-900' 
      : isNeomorphic 
      ? `${neomorphicStyles.bg} rounded-[48px] ${neomorphicStyles.shadow} ${neomorphicStyles.hoverShadow} ${neomorphicStyles.activeShadow} ${neomorphicStyles.transition}` 
      : 'bg-white shadow-sm';
  const textMain = isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';
  const textSub = isDark ? 'text-zinc-500' : isNeomorphic ? 'text-zinc-600' : 'text-slate-500';

  const [activeChart, setActiveChart] = useState<string>('dunning');
  // 确保图表在页面加载时显示达克效应
  const [chartHeight, setChartHeight] = useState<number>(600);
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
    return CHARTS.find(chart => chart.id === id);
  };

  // Chart rendering function to avoid complex nested conditional rendering
  const renderChart = () => {
    const activeChartObj = getChartById(activeChart);
    
    // 添加调试日志
    console.log('activeChart:', activeChart);
    console.log('activeChartObj:', activeChartObj);
    console.log('dunningData:', dunningData);
    
    switch (activeChart) {
      case 'attributeRadar':
        return (
          <BaseChart data={attributeData} isDark={isDark}>
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
          <BaseChart data={dailyFocusData} isDark={isDark} >
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
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 400 350" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
              {/* 背景分区 */}
              <rect x="50" y="50" width="90" height="200" fill="#FFD700" opacity="0.3" />
              <rect x="140" y="50" width="90" height="200" fill="#FF6B6B" opacity="0.3" />
              <rect x="230" y="50" width="90" height="200" fill="#4ECDC4" opacity="0.3" />
              <rect x="320" y="50" width="30" height="200" fill="#45B7D1" opacity="0.3" />
              
              {/* 曲线 */}
              <path d="M70,70 C90,50 110,90 130,110 C150,130 170,170 190,190 C210,170 230,130 250,110 C270,90 290,70 310,60 C330,50 350,50 370,55" 
                    fill="none" stroke={isDark ? '#ffffff' : '#000000'} strokeWidth="3" strokeLinecap="round" />
              
              {/* 关键节点 */}
              <circle cx="70" cy="70" r="6" fill="#FF0000" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="190" cy="190" r="6" fill="#FF0000" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="250" cy="110" r="6" fill="#FF0000" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="370" cy="55" r="6" fill="#FF0000" stroke="#FFFFFF" strokeWidth="2" />
              
              {/* 关键节点标注 */}
              <text x="70" y="45" textAnchor="middle" fill="#FF0000" fontSize="10" fontWeight="bold">愚昧之巅</text>
              <text x="190" y="210" textAnchor="middle" fill="#FF0000" fontSize="10" fontWeight="bold">绝望之谷</text>
              <text x="250" y="85" textAnchor="middle" fill="#FF0000" fontSize="10" fontWeight="bold">开悟之坡</text>
              <text x="370" y="30" textAnchor="middle" fill="#FF0000" fontSize="10" fontWeight="bold">平稳高原</text>
              
              {/* 区域名称 */}
              <text x="95" y="215" textAnchor="middle" fill="#FFD700" fontSize="10" fontWeight="bold">自信爆棚区</text>
              <text x="185" y="215" textAnchor="middle" fill="#FF6B6B" fontSize="10" fontWeight="bold">自信崩溃区</text>
              <text x="275" y="215" textAnchor="middle" fill="#4ECDC4" fontSize="10" fontWeight="bold">自信重建区</text>
              <text x="335" y="215" textAnchor="middle" fill="#45B7D1" fontSize="10" fontWeight="bold">自信成熟区</text>
              
              {/* 表现标签 */}
              <text x="95" y="285" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize="12" fontWeight="bold">巨婴</text>
              <text x="185" y="285" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize="12" fontWeight="bold">屌丝</text>
              <text x="275" y="285" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize="12" fontWeight="bold">智者</text>
              <text x="335" y="285" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize="12" fontWeight="bold">大师</text>
              
              {/* 图标 - 自信爆棚区人物 */}
              <g transform="translate(95, 140)">
                <circle cx="0" cy="0" r="12" fill="#FFD700" opacity="0.8" />
                <rect x="-10" y="12" width="20" height="25" fill="#FFD700" opacity="0.8" />
                <line x1="-8" y1="18" x2="-15" y2="30" stroke="#FFD700" strokeWidth="2" />
                <line x1="8" y1="18" x2="15" y2="30" stroke="#FFD700" strokeWidth="2" />
                <line x1="-8" y1="37" x2="-12" y2="48" stroke="#FFD700" strokeWidth="2" />
                <line x1="8" y1="37" x2="12" y2="48" stroke="#FFD700" strokeWidth="2" />
              </g>
              
              {/* 图标 - 自信崩溃区 */}
              <g transform="translate(185, 140)">
                <circle cx="0" cy="0" r="12" fill="#FF6B6B" opacity="0.8" />
                <path d="M-15,12 Q0,35 15,12" fill="none" stroke="#FF6B6B" strokeWidth="2" />
                <line x1="-10" y1="5" x2="-15" y2="0" stroke="#FF6B6B" strokeWidth="2" />
                <line x1="10" y1="5" x2="15" y2="0" stroke="#FF6B6B" strokeWidth="2" />
                <line x1="-10" y1="10" x2="-15" y2="15" stroke="#FF6B6B" strokeWidth="2" />
                <line x1="10" y1="10" x2="15" y2="15" stroke="#FF6B6B" strokeWidth="2" />
              </g>
              
              {/* 图标 - 自信重建区 */}
              <g transform="translate(275, 140)">
                <path d="M0,25 L0,5 L15,20" fill="none" stroke="#4ECDC4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="15" cy="20" r="3" fill="#4ECDC4" />
              </g>
              
              {/* 图标 - 自信成熟区大脑 */}
              <g transform="translate(335, 140)">
                <path d="M0,-15 C-18,-15 -22,0 -22,11 C-22,22 -11,30 0,30 C11,30 22,22 22,11 C22,0 18,-15 0,-15 Z" fill="#45B7D1" opacity="0.8" />
                <line x1="-15" y1="0" x2="15" y2="0" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="-15" y1="7" x2="15" y2="7" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="-15" y1="14" x2="15" y2="14" stroke="#FFFFFF" strokeWidth="2" />
              </g>
              
              {/* 坐标轴 */}
              <line x1="50" y1="50" x2="50" y2="250" stroke={isDark ? '#ffffff' : '#000000'} strokeWidth="2" />
              <line x1="50" y1="250" x2="390" y2="250" stroke={isDark ? '#ffffff' : '#000000'} strokeWidth="2" />
              
              {/* 坐标轴标签 */}
              <text x="15" y="150" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize="10" fontWeight="bold" transform="rotate(-90, 15, 150)">自信程度（高→低）</text>
              <text x="220" y="270" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize="10" fontWeight="bold">智慧水平（知识与经验，低→高）</text>
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
              <polygon points="250,84 262.5,87.5 250,91" fill={isDark ? "#a1a1aa" : "#64748b"} />
              
              {/* 水平连接线 - 底部 */}
            </svg>
          </div>
        );
      default:
        return <div>图表未找到</div>;
    }
  };

  // 图表数据定义
  const jCurveData = [
    { t: 0, value: 10 },
    { t: 1, value: 9 },
    { t: 2, value: 8 },
    { t: 3, value: 7 },
    { t: 4, value: 6 },
    { t: 5, value: 7 },
    { t: 6, value: 9 },
    { t: 7, value: 12 },
    { t: 8, value: 16 },
    { t: 9, value: 21 },
    { t: 10, value: 27 },
  ];

  const antifragileData = [
    { stress: 0, fragile: 100, antifragile: 50 },
    { stress: 10, fragile: 90, antifragile: 55 },
    { stress: 20, fragile: 80, antifragile: 60 },
    { stress: 30, fragile: 70, antifragile: 65 },
    { stress: 40, fragile: 60, antifragile: 75 },
    { stress: 50, fragile: 50, antifragile: 90 },
    { stress: 60, fragile: 40, antifragile: 110 },
    { stress: 70, fragile: 30, antifragile: 130 },
    { stress: 80, fragile: 20, antifragile: 150 },
    { stress: 90, fragile: 10, antifragile: 170 },
    { stress: 100, fragile: 0, antifragile: 190 },
  ];

  const secondCurveData = [
    { t: 0, curve1: 10, curve2: 0 },
    { t: 1, curve1: 20, curve2: 0 },
    { t: 2, curve1: 40, curve2: 0 },
    { t: 3, curve1: 70, curve2: 0 },
    { t: 4, curve1: 100, curve2: 10 },
    { t: 5, curve1: 130, curve2: 30 },
    { t: 6, curve1: 160, curve2: 60 },
    { t: 7, curve1: 180, curve2: 100 },
    { t: 8, curve1: 190, curve2: 150 },
    { t: 9, curve1: 195, curve2: 210 },
    { t: 10, curve1: 198, curve2: 280 },
  ];

  const flywheelData = [
    { time: 0, momentum: 10 },
    { time: 1, momentum: 15 },
    { time: 2, momentum: 22 },
    { time: 3, momentum: 32 },
    { time: 4, momentum: 46 },
    { time: 5, momentum: 66 },
    { time: 6, momentum: 95 },
    { time: 7, momentum: 136 },
    { time: 8, momentum: 194 },
    { time: 9, momentum: 278 },
    { time: 10, momentum: 395 },
  ];

  const regretData = [
    { type: '没做的事', pain: 80 },
    { type: '做错的事', pain: 40 },
  ];

  const energyData = [
    { time: '6:00', energy: 60 },
    { time: '9:00', energy: 85 },
    { time: '12:00', energy: 70 },
    { time: '15:00', energy: 65 },
    { time: '18:00', energy: 80 },
    { time: '21:00', energy: 60 },
    { time: '24:00', energy: 40 },
  ];

  const compoundData = [
    { day: 0, better: 100, worse: 100 },
    { day: 30, better: 134.78, worse: 74.01 },
    { day: 60, better: 181.67, worse: 54.72 },
    { day: 90, better: 244.86, worse: 40.47 },
    { day: 180, better: 609.82, worse: 16.37 },
    { day: 365, better: 3778.34, worse: 2.69 },
  ];

  // 死亡谷效应数据
  const dipData = [
    { x: 0, results: 50 },
    { x: 10, results: 45 },
    { x: 20, results: 40 },
    { x: 30, results: 35 },
    { x: 40, results: 30 },
    { x: 50, results: 35 },
    { x: 60, results: 45 },
    { x: 70, results: 60 },
    { x: 80, results: 80 },
    { x: 90, results: 100 },
    { x: 100, results: 130 },
  ];

  const dopamineData = [
    { hour: '0:00', level: 50 },
    { hour: '3:00', level: 40 },
    { hour: '6:00', level: 70 },
    { hour: '9:00', level: 85 },
    { hour: '12:00', level: 75 },
    { hour: '15:00', level: 65 },
    { hour: '18:00', level: 80 },
    { hour: '21:00', level: 60 },
    { hour: '24:00', level: 50 },
  ];

  const flowData = [
    { x: 10, y: 10, status: '无聊' },
    { x: 30, y: 30, status: '心流' },
    { x: 50, y: 50, status: '心流' },
    { x: 70, y: 70, status: '心流' },
    { x: 90, y: 90, status: '焦虑' },
    { x: 90, y: 30, status: '焦虑' },
  ];

  // 达克效应数据
  const dunningData = [
    { x: 0, confidence: 90 },
    { x: 10, confidence: 95 },
    { x: 20, confidence: 98 },
    { x: 30, confidence: 80 },
    { x: 40, confidence: 60 },
    { x: 50, confidence: 50 },
    { x: 60, confidence: 60 },
    { x: 70, confidence: 70 },
    { x: 80, confidence: 80 },
    { x: 90, confidence: 85 },
    { x: 100, confidence: 90 },
  ];

  const zoneData = [
    { id: 'comfort', radius: 50, color: '#3b82f6', fillOpacity: 0.3 },
    { id: 'learning', radius: 100, color: '#10b981', fillOpacity: 0.2 },
    { id: 'fear', radius: 150, color: '#ef4444', fillOpacity: 0.1 },
  ];

  const woopData = [
    { id: 'wish', x: 0.3, y: 0.3, color: '#3b82f6', fillOpacity: 0.3, icon: '🎯', label: '愿望', description: '设定你的目标' },
    { id: 'outcome', x: 0.7, y: 0.3, color: '#10b981', fillOpacity: 0.3, icon: '🏆', label: '结果', description: '想象理想结果' },
    { id: 'obstacle', x: 0.3, y: 0.7, color: '#ef4444', fillOpacity: 0.3, icon: '⛰️', label: '障碍', description: '识别潜在障碍' },
    { id: 'plan', x: 0.7, y: 0.7, color: '#f59e0b', fillOpacity: 0.3, icon: '📋', label: '计划', description: '制定行动计划' },
  ];

  const windLawData = [
    { speed: 0, windResistance: 0, progress: 0 },
    { speed: 10, windResistance: 100, progress: 50 },
    { speed: 20, windResistance: 400, progress: 150 },
    { speed: 30, windResistance: 900, progress: 300 },
    { speed: 40, windResistance: 1600, progress: 500 },
    { speed: 50, windResistance: 2500, progress: 750 },
  ];

  const peakEndData = [
    { time: 0, experience: 50 },
    { time: 1, experience: 60 },
    { time: 2, experience: 80 },
    { time: 3, experience: 40 },
    { time: 4, experience: 30 },
    { time: 5, experience: 20 },
    { time: 6, experience: 50 },
    { time: 7, experience: 70 },
    { time: 8, experience: 90 },
    { time: 9, experience: 30 },
    { time: 10, experience: 40 },
  ];

  const valueVennData = [
    { id: 'passion', x: 0.35, y: 0.4, radius: 70, color: '#ef4444', fillOpacity: 0.2, label: '激情' },
    { id: 'talent', x: 0.65, y: 0.4, radius: 70, color: '#3b82f6', fillOpacity: 0.2, label: '天赋' },
    { id: 'market', x: 0.5, y: 0.7, radius: 70, color: '#10b981', fillOpacity: 0.2, label: '市场' },
  ];

  const cognitiveOnionData = [
    { id: 'core', radius: 20, color: '#3b82f6', fillOpacity: 0.5, label: '核心自我' },
    { id: 'values', radius: 40, color: '#10b981', fillOpacity: 0.4, label: '价值观' },
    { id: 'beliefs', radius: 60, color: '#f59e0b', fillOpacity: 0.3, label: '信念' },
    { id: 'behaviors', radius: 80, color: '#ef4444', fillOpacity: 0.2, label: '行为' },
    { id: 'identity', radius: 100, color: '#8b5cf6', fillOpacity: 0.1, label: '身份' },
  ];

  const learningCycleData = [
    { id: 'input', color: '#3b82f6', name: '输入' },
    { id: 'process', color: '#10b981', name: '处理' },
    { id: 'output', color: '#f59e0b', name: '输出' },
    { id: 'feedback', color: '#ef4444', name: '反馈' },
  ];

  const purposeData = [
    { id: '生理需求', color: '#ef4444', label: '生理需求', description: '食物、水、睡眠等基本需求' },
    { id: '安全需求', color: '#f59e0b', label: '安全需求', description: '安全、稳定、保障' },
    { id: '社交需求', color: '#3b82f6', label: '社交需求', description: '爱、归属感、人际关系' },
    { id: '尊重需求', color: '#8b5cf6', label: '尊重需求', description: '自尊、认可、地位' },
    { id: '自我实现', color: '#10b981', label: '自我实现', description: '实现潜力、追求理想' },
  ];

  const johariWindowData = [
    { id: 'open', x: 0.35, y: 0.35, color: '#3b82f6', fillOpacity: 0.2, label: '公开区', description: '自己知道，他人也知道', examples: '姓名、外貌' },
    { id: 'blind', x: 0.65, y: 0.35, color: '#10b981', fillOpacity: 0.2, label: '盲区', description: '自己不知道，他人知道', examples: '坏习惯' },
    { id: 'hidden', x: 0.35, y: 0.65, color: '#ef4444', fillOpacity: 0.2, label: '隐藏区', description: '自己知道，他人不知道', examples: '秘密' },
    { id: 'unknown', x: 0.65, y: 0.65, color: '#f59e0b', fillOpacity: 0.2, label: '未知区', description: '自己不知道，他人也不知道', examples: '潜能' },
  ];

  const footInDoorData = [
    { step: 1, acceptanceRate: 90 },
    { step: 2, acceptanceRate: 85 },
    { step: 3, acceptanceRate: 80 },
  ];

  // getButtonClass function - 与商品分类与管理保持一致的按钮样式
  const getButtonClass = (isActive: boolean, isSpecial?: boolean) => {
    if (isActive) {
      return isSpecial ? 'bg-red-500 text-white border-red-500' : 'bg-blue-500 text-white border-blue-500';
    }
    if (isNeomorphic) {
      return `${neomorphicStyles.bg} ${neomorphicStyles.border} ${neomorphicStyles.shadow} ${neomorphicStyles.hoverShadow} ${neomorphicStyles.activeShadow} ${neomorphicStyles.transition}`;
    }
    return isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-200';
  };

  // 完整的CHARTS数组
  const CHARTS = [
    // 新增：系统思维类
    {
      id: 'systemFeedback',
      name: 'systemFeedback',
      label: '系统反馈模型',
      icon: Activity,
      description: '展示系统中正负反馈对系统发展的影响',
      deepAnalysis: '任何系统都存在正反馈和负反馈。正反馈会放大系统的变化，负反馈会抑制系统的变化。核心是识别系统中的反馈回路，利用正反馈加速目标，用负反馈维持系统稳定。',
      principle: '系统中存在正反馈（放大变化）和负反馈（抑制变化），通过识别和调整反馈回路，可以控制系统的发展方向和稳定性。',
      scope: '目标增长加速、习惯稳定维持、项目风险管控、自媒体运营',
      tips: '1. 找到能触发正反馈的关键节点，强化正向循环；2. 识别负反馈的预警信号，及时调整避免系统崩溃；3. 设计平衡的反馈机制，避免系统过度波动。',
      practice: '1. 运营自媒体账号时，聚焦"优质内容创作"这个正反馈节点，形成"内容→流量→互动→更多流量"的正循环；2. 学习时，当出现"注意力不集中、错题率上升"的负反馈信号，及时切换任务或休息。'
    },
    {
      id: 'bottleneckTheory',
      name: 'bottleneckTheory',
      label: '瓶颈理论（TOC）',
      icon: Pickaxe,
      description: '展示系统瓶颈对整体性能的影响',
      deepAnalysis: '任何系统的整体性能，都由系统中最薄弱的环节（瓶颈）决定。想要提升系统效率，不能平均发力，而是要聚焦瓶颈、突破瓶颈，之后再寻找新的瓶颈，循环优化。',
      principle: '系统的整体性能由最薄弱的环节（瓶颈）决定，聚焦瓶颈并突破，是提升系统效率的关键。',
      scope: '效率提升优化、项目进度推进、技能短板弥补、工作流程优化',
      tips: '1. 通过数据分析找到当前系统的核心瓶颈；2. 集中资源解决瓶颈问题，而非在非瓶颈环节浪费精力；3. 瓶颈突破后，立刻进入下一轮瓶颈识别。',
      practice: '1. 发现"数据分析能力不足"是职场提升的瓶颈，集中1个月时间学习数据分析工具和方法；2. 项目推进中，若"供应商交货慢"是瓶颈，优先协调供应商提升交货速度。'
    },
    
    // 新增：价值创造类
    {
      id: 'valueProposition',
      name: 'valueProposition',
      label: '价值主张画布',
      icon: Target,
      description: '展示用户需求与产品价值的匹配关系',
      deepAnalysis: '清晰定义目标用户的痛点、需求，以及自身能提供的产品/服务价值，将价值与需求精准匹配。核心是"用户需要什么，我就提供什么"，避免自嗨式的价值输出。',
      principle: '价值的本质是满足他人需求，只有当自身供给与市场需求精准匹配时，才能创造最大价值。',
      scope: '个人优势定位、副业项目设计、职场能力提升、产品功能设计',
      tips: '1. 先站在用户视角列出痛点和需求；2. 对应列出自己能提供的价值；3. 确保价值与需求强相关，能直接解决用户痛点。',
      practice: '1. 想做职场技能分享副业，先调研目标用户痛点，再设计对应的价值内容；2. 搭建"价值-需求"匹配表，定期更新用户需求。'
    },
    {
      id: 'opportunityCost',
      name: 'opportunityCost',
      label: '机会成本思维',
      icon: Scale,
      description: '展示选择的隐性成本',
      deepAnalysis: '选择一个选项的同时，意味着放弃了其他选项中价值最高的那一个，这个被放弃的最高价值就是机会成本。核心是"做选择前，先算放弃的成本"，避免因忽视机会成本而做出短视决策。',
      principle: '选择的成本不仅包括直接投入，还包括放弃的最高价值选项，做决策时需综合考虑。',
      scope: '决策权衡优化、资源分配选择、目标优先级排序、职业选择',
      tips: '1. 每次做决策时，列出所有可选方案，并评估每个方案的潜在价值；2. 对比选择方案和被放弃方案的价值，判断决策是否合理；3. 优先选择机会成本最低、长期价值最高的选项。',
      practice: '1. 纠结"下班后刷短视频"还是"学习技能"，计算机会成本后选择学习技能；2. 设置"决策机会成本分析"功能，辅助理性决策。'
    },
    
    // 新增：迭代优化类
    {
      id: 'mvpThinking',
      name: 'mvpThinking',
      label: '最小可行产品思维',
      icon: Lightbulb,
      description: '展示快速验证产品价值的方法',
      deepAnalysis: '先打造一个包含核心功能的最简产品/方案，投入市场或实践中获取反馈，再根据反馈快速迭代优化，避免在完美主义中浪费时间。核心是"先完成，再完美"。',
      principle: '通过最简版本快速验证价值，再根据反馈迭代优化，比追求完美更高效。',
      scope: '项目快速启动、技能实践落地、副业产品测试、内容创作',
      tips: '1. 提炼目标的核心需求，砍掉非必要的功能和细节；2. 快速推出最简版本，收集用户或市场的反馈；3. 小步快跑，每次迭代只解决1-2个核心问题。',
      practice: '1. 想做读书分享自媒体，先发布"文字版读书摘要"这个MVP版本，收集反馈后逐步升级；2. 学习写作时，先完成"一篇完整的短文"，再根据反馈修改细节。'
    },
    {
      id: 'buildMeasureLearn',
      name: 'buildMeasureLearn',
      label: '快速迭代循环',
      icon: RotateCw,
      description: '展示迭代优化的闭环过程',
      deepAnalysis: '构建一个"构建→测量→学习"的闭环：先构建产品/方案，再测量效果数据，最后从数据中学习经验教训，指导下一次构建。核心是通过快速循环，不断优化方案，逼近目标。',
      principle: '通过"构建→测量→学习"的快速闭环，不断优化方案，实现持续改进。',
      scope: '项目优化推进、习惯调整改进、技能提升训练、内容创作优化',
      tips: '1. 每次循环的时间不宜过长（如1周/1个月），确保迭代速度；2. 测量环节要聚焦核心数据；3. 学习环节要总结可落地的经验，避免空泛的反思。',
      practice: '1. 优化自媒体内容时，遵循"构建→测量→学习"循环：写文案→统计数据→优化标题写法；2. 设置"迭代循环记录"功能，记录每次构建、测量和学习的经验。'
    },
    // 系统洞察类
    {
      id: 'butterflyEffect',
      name: 'butterflyEffect',
      label: '蝴蝶效应',
      icon: CircleDot,
      description: '展示初始条件微小变化对系统的巨大影响',
      deepAnalysis: '在一个动力系统中，初始条件下的微小变化，能带动整个系统长期且巨大的连锁反应。核心是"细节决定成败"，看似无关的小行为，可能会对长期结果产生颠覆性影响。',
      principle: '初始条件的微小变化，可能引发系统长期而巨大的连锁反应，细节对长期结果至关重要。',
      scope: '习惯细节优化、项目风险预判、长期目标初始动作设计、人生规划起点选择',
      tips: '1. 重视长期目标的"初始动作"，确保第一步的方向正确；2. 警惕可能引发负面连锁反应的小漏洞，及时修复；3. 放大正向微小行为的影响，形成复利效应。',
      practice: '1. 培养"早起"习惯，初始动作是"睡前把闹钟放在床头，且不刷手机"；2. 项目初期，发现小的流程漏洞立刻制定统一标准，避免后期混乱。'
    },
    {
      id: 'pathDependency',
      name: 'pathDependency',
      label: '路径依赖理论',
      icon: ArrowRight,
      description: '展示初始选择对后续发展的影响',
      deepAnalysis: '人类社会中的技术或制度演变，一旦进入某一路径，就会因惯性力量不断自我强化，很难轻易转向。核心是"选择比努力更重要"，初始的选择会决定后续的发展方向。',
      principle: '一旦进入某一路径，就会因惯性力量不断自我强化，初始选择对后续发展方向至关重要。',
      scope: '职业方向选择、技能学习路径规划、习惯养成初始设定、大学专业选择',
      tips: '1. 在做关键选择时，多花时间调研，选择长期有发展潜力的路径；2. 若发现当前路径有误，要及时止损，避免惯性带来的更大损失；3. 利用路径依赖的正向作用，强化有益的初始习惯。',
      practice: '1. 入门数据分析，选择学习Python而非小众工具，借助路径依赖的惯性不断提升；2. 若发现副业方向市场需求小，及时转型到更有潜力的方向。'
    },
    // 价值取舍类
    {
      id: 'opportunitySunkCost',
      name: 'opportunitySunkCost',
      label: '机会成本与沉没成本权衡',
      icon: Scale,
      description: '展示如何在决策中权衡不同成本',
      deepAnalysis: '将机会成本（放弃的最高价值）和沉没成本（已投入的不可收回成本）结合分析，做决策时忽略沉没成本，聚焦机会成本。核心是"不被过去的投入束缚，只看未来的价值"。',
      principle: '做决策时应忽略不可收回的沉没成本，聚焦于未来的机会成本，选择长期价值最高的选项。',
      scope: '项目止损决策、资源重新分配、目标调整优化、是否放弃亏损副业',
      tips: '1. 遇到决策困境时，列出现有选项的机会成本，对比哪个选项的长期价值更高；2. 不要因为"已经投入了很多时间/金钱"而继续坚持无意义的事；3. 优先选择机会成本低、长期收益高的选项。',
      practice: '1. 已经投入1万元和3个月时间做亏损电商产品，忽略沉没成本，分析机会成本后果断止损；2. 纠结是否继续学习冷门语言，计算机会成本后转而学习热门技能。'
    },
    {
      id: 'scarcityAbundance',
      name: 'scarcityAbundance',
      label: '稀缺与丰饶思维',
      icon: Layers,
      description: '展示不同思维模式对资源获取的影响',
      deepAnalysis: '稀缺思维认为资源是有限的，凡事都要竞争和争抢；丰饶思维认为资源是无限的，可以通过合作、创新创造更多资源。核心是"心态决定资源的获取方式"，丰饶思维更利于长期发展。',
      principle: '稀缺思维导致竞争和争抢，丰饶思维促进合作和创新，心态决定资源获取方式。',
      scope: '人脉拓展、资源整合、目标实现路径设计、职场合作',
      tips: '1. 遇到资源不足时，不要只想着"争抢"，而是思考"如何合作创造新资源"；2. 主动分享自己的资源，吸引更多人合作；3. 用丰饶思维看待机会，相信总有新的机会出现。',
      practice: '1. 职场中遇到"晋升名额有限"的情况，主动和同事合作完成重要项目，共同创造价值；2. 学习时缺少资料，主动分享自己的资料到学习群，吸引其他群友分享。'
    },
    // 执行落地类
    {
      id: 'minimalResistance',
      name: 'minimalResistance',
      label: '最小阻力路径法则',
      icon: Zap,
      description: '展示如何设计利于目标达成的环境',
      deepAnalysis: '无论是物理系统还是人类行为，都会本能地选择阻力最小的路径。核心是"设计利于目标达成的环境，让好习惯的阻力最小，坏习惯的阻力最大"。',
      principle: '行为倾向于选择阻力最小的路径，通过设计环境可以引导行为朝向目标方向。',
      scope: '习惯养成环境设计、任务执行流程优化、目标启动门槛降低、专注学习环境搭建',
      tips: '1. 优化物理环境，减少好习惯的执行阻力；2. 增加坏习惯的执行阻力；3. 简化任务流程，降低启动门槛。',
      practice: '1. 想养成"下班回家后健身"的习惯，把健身服放在门口，同时把电视遥控器收起来；2. 优化工作流程，把常用文件放在桌面，设置快捷键简化操作。'
    },
    {
      id: 'immediateFeedback',
      name: 'immediateFeedback',
      label: '反馈即时性法则',
      icon: Activity,
      description: '展示反馈及时性对行为的影响',
      deepAnalysis: '行为的强化效果与反馈的即时性成正比，反馈越及时，行为重复的概率越高。延迟的反馈很难起到激励或纠正的作用。',
      principle: '反馈越及时，对行为的强化效果越强，延迟反馈难以起到有效激励或纠正作用。',
      scope: '习惯打卡奖励、技能学习纠错、项目进度调整、每日打卡积分奖励',
      tips: '1. 完成目标行为后，立刻给予反馈；2. 发现错误时，及时纠正，避免错误行为固化；3. 将长期目标拆解为小任务，每个小任务完成后都给予即时反馈。',
      practice: '1. 学习英语单词，背完一组后立刻显示正确率和解析；2. 项目推进中，每天下班前开10分钟短会，反馈当天进度和问题。'
    },
    // 认知突破类
    {
      id: 'perspectiveShift',
      name: 'perspectiveShift',
      label: '视角转换思维',
      icon: RotateCw,
      description: '展示不同视角对问题解决的影响',
      deepAnalysis: '从不同的角度（如他人、未来、历史）看待同一个问题，打破固有认知的局限，找到新的解决方案。核心是"换个角度看问题，答案可能完全不同"。',
      principle: '从不同角度看待问题，能打破固有认知局限，发现新的解决方案。',
      scope: '问题解决创新、人际矛盾处理、目标复盘优化、产品设计优化',
      tips: '1. 遇到问题时，尝试站在对方的角度思考；2. 用未来的视角看当下的选择；3. 用历史的视角借鉴同类问题的解决方案。',
      practice: '1. 设计学习APP，站在学生、家长、老师三个视角优化功能；2. 职场中与同事发生矛盾，站在同事角度思考，找到利益共同点。'
    },
    {
      id: 'firstPrincipleAdvanced',
      name: 'firstPrincipleAdvanced',
      label: '第一性原理思维（进阶版）',
      icon: Lightbulb,
      description: '展示如何从本质出发解决问题',
      deepAnalysis: '回归事物的本质属性，从最基础的公理、原则出发，重新推导解决方案，而非类比或经验。核心是"拨开表象，直击本质"，避免被固有经验束缚。',
      principle: '回归事物的本质属性，从基础公理出发重新推导解决方案，避免被固有经验束缚。',
      scope: '创新方案设计、复杂问题解决、知识体系重构、产品创新',
      tips: '1. 遇到复杂问题时，问自己"这件事的本质是什么？""最基础的原则是什么？"；2. 抛开现有的解决方案，从本质出发重新思考；3. 用简单的逻辑推导复杂的问题。',
      practice: '1. 思考"如何提升用户粘性"，本质是"如何让用户获得持续价值"，推导解决方案：个性化内容、用户成长体系、社群互动；2. 重构数学知识体系，从三个本质模块出发梳理知识点。'
    },
    // 价值跃迁类
    {
      id: 'potentialEnergyAccumulation',
      name: 'potentialEnergyAccumulation',
      label: '势能积累思维',
      icon: Mountain,
      description: '展示价值爆发前的势能积累过程',
      deepAnalysis: '价值的爆发不是偶然的，而是源于前期持续的势能积累，核心是"先蓄势，后爆发"，通过小步快跑的积累，等待临界点的突破。',
      principle: '价值的爆发源于前期持续的势能积累，通过小步快跑的积累，等待临界点的突破。',
      scope: '个人品牌打造、副业赛道突破、技能能力跃升',
      tips: '1. 找到势能积累的核心动作；2. 降低单次积累的难度，保持高频次投入；3. 当积累达到临界点时，主动抓住机会放大成果。',
      practice: '1. 做职场干货自媒体，前期每天输出1条短干货，持续积累3个月，粉丝达到1万临界点后，推出系列课程；2. 练习PPT技能，每天做1页高质量排版，积累100页后整理成作品集，对接副业平台。'
    },
    {
      id: 'valueMultiplication',
      name: 'valueMultiplication',
      label: '价值倍增思维',
      icon: Zap,
      description: '展示如何通过资源整合实现价值倍数级放大',
      deepAnalysis: '通过资源整合、模式创新、跨界组合，让单一价值产生倍数级的放大效应，核心是"1+1>2"，不局限于单点价值，而是寻找价值的乘数因子。',
      principle: '通过资源整合、模式创新、跨界组合，让单一价值产生倍数级的放大效应。',
      scope: '副业收益放大、职场价值提升、内容创作增效',
      tips: '1. 识别能放大价值的乘数因子；2. 将单一价值打包成组合方案，提升整体价值密度；3. 通过跨界合作引入外部乘数因子，实现价值倍增。',
      practice: '1. 做文案接单副业，打包成"文案+排版+发布指导"的套餐服务，价值和收益比单篇写作提升3倍以上；2. 职场中负责活动策划，整合市场、设计、技术等部门资源，推出"线上+线下"的组合活动。'
    },
    
    // 认知破界类
    {
      id: 'essenceThinking',
      name: 'essenceThinking',
      label: '本质思维',
      icon: FileSearch,
      description: '展示如何透过现象看本质',
      deepAnalysis: '任何事物都有其底层本质，看透本质就能绕过表象的干扰，找到最简洁的解决路径，核心是"拨开迷雾，直击核心"，不被复杂的表面现象迷惑。',
      principle: '任何事物都有其底层本质，看透本质就能绕过表象的干扰，找到最简洁的解决路径。',
      scope: '复杂问题解决、趋势判断决策、目标定位校准',
      tips: '1. 面对问题时，从"是什么、为什么、怎么办"三个层面追问本质；2. 区分"相关性"和"因果性"，避免把偶然关联当作必然规律；3. 用第一性原理推导，不依赖经验和类比。',
      practice: '1. 分析"为什么短视频带货越来越火"的本质：不是因为视频形式新颖，而是因为"人货场"的重构，缩短了消费者的决策路径；2. 思考"职场晋升的本质"：不是因为加班时间长，而是因为创造的价值大。'
    },
    {
      id: 'reverseThinking',
      name: 'reverseThinking',
      label: '逆向思维',
      icon: RotateCw,
      description: '展示如何反常规思考问题',
      deepAnalysis: '反常规、反直觉地思考问题，从目标的对立面出发寻找解决方案，核心是"反过来想，总是反过来想"，打破正向思维的惯性陷阱。',
      principle: '反常规、反直觉地思考问题，从目标的对立面出发寻找解决方案，打破正向思维的惯性陷阱。',
      scope: '问题反向求解、风险提前规避、创新方案设计',
      tips: '1. 设定目标后，先思考"哪些因素会导致目标失败"，并提前规避；2. 遇到瓶颈时，从"不做什么"的角度思考，排除无效动作；3. 借鉴"逆向工程"的思路，从结果倒推过程。',
      practice: '1. 目标是"3个月内副业月入5000元"，逆向思考：哪些因素会导致失败？（选题错误、执行力差、定价不合理），提前制定应对策略；2. 设计学习APP，逆向思考：用户最讨厌的学习痛点是什么？（广告多、操作复杂、内容枯燥），据此设计功能。'
    },
    
    // 执行闭环类
    {
      id: 'nodeControlThinking',
      name: 'nodeControlThinking',
      label: '节点把控思维',
      icon: Target,
      description: '展示如何将长期目标拆解为关键节点',
      deepAnalysis: '将长期目标拆解为关键节点，通过把控每个节点的完成质量，确保整体目标的实现，核心是"抓节点、控进度、保质量"，避免因过程失控导致目标偏离。',
      principle: '将长期目标拆解为关键节点，通过把控每个节点的完成质量，确保整体目标的实现。',
      scope: '长期项目推进、技能学习规划、副业周期运营',
      tips: '1. 根据目标的时间跨度，设置阶段性关键节点；2. 为每个节点设定明确的交付标准和验收条件；3. 节点完成后及时复盘，调整下阶段的执行策略。',
      practice: '1. 年度学习目标是"掌握数据分析技能"，设置关键节点：季度1（掌握Excel数据分析）、季度2（掌握Python基础）、季度3（实战项目练习）、季度4（形成作品集）；2. 副业季度目标是"月入5000元"，设置节点：月度1（积累10个潜在客户）、月度2（完成5单基础订单）、月度3（推出高客单价套餐）。'
    },
    {
      id: 'actionCalibrationThinking',
      name: 'actionCalibrationThinking',
      label: '行动校准思维',
      icon: Compass,
      description: '展示如何定期对比目标和实际行动的偏差',
      deepAnalysis: '在执行过程中，定期对比目标和实际行动的偏差，及时调整行动方向和方法，核心是"边做边校准，避免南辕北辙"，不盲目坚持错误的执行路径。',
      principle: '在执行过程中，定期对比目标和实际行动的偏差，及时调整行动方向和方法，避免盲目坚持错误的执行路径。',
      scope: '习惯养成调整、项目执行优化、学习方法改进',
      tips: '1. 设定固定的校准周期（如每天、每周）；2. 对比行动结果和目标的偏差值，分析偏差产生的原因；3. 根据原因调整行动策略，如更换方法、调整时间、优化资源。',
      practice: '1. 健身计划是"每周瘦1斤"，执行1周后发现只瘦了0.3斤，校准分析：运动时间足够但饮食控制不到位，调整策略：增加饮食记录环节，控制碳水摄入；2. 学习计划是"每天背50个单词"，执行3天后发现记忆效率低，校准分析：死记硬背效果差，调整策略：改用"词根词缀+例句"的方法。'
    },
    
    // 生态共生类
    {
      id: 'platformLeverageThinking',
      name: 'platformLeverageThinking',
      label: '平台借势思维',
      icon: Mountain,
      description: '展示如何依托现有平台快速放大自身价值',
      deepAnalysis: '不自建生态，而是依托现有平台的流量、资源和规则，快速放大自身价值，核心是"借力打力，顺势而为"，避免从零开始的低效摸索。',
      principle: '不自建生态，而是依托现有平台的流量、资源和规则，快速放大自身价值，避免从零开始的低效摸索。',
      scope: '副业快速启动、个人品牌曝光、产品快速推广',
      tips: '1. 选择和自身价值匹配的平台；2. 研究平台的流量规则和推荐机制，优化内容展示形式；3. 借助平台的活动和扶持政策，加速成长。',
      practice: '1. 做职场PPT模板副业，依托小红书平台，研究"干货内容+实用模板"的推荐规则，快速获得精准流量；2. 做知识付费课程，依托抖音平台的"知识分享"扶持计划，参与课程推广活动。'
    },
    {
      id: 'ecologicalFeedbackThinking',
      name: 'ecologicalFeedbackThinking',
      label: '生态反哺思维',
      icon: RefreshCw,
      description: '展示如何为生态贡献价值以获得持续赋能',
      deepAnalysis: '在依托平台或融入生态的过程中，主动为生态贡献价值，从而获得生态的持续赋能，核心是"先贡献，后索取"，实现和生态的长期共生。',
      principle: '在依托平台或融入生态的过程中，主动为生态贡献价值，从而获得生态的持续赋能，实现和生态的长期共生。',
      scope: '社群长期运营、平台账号成长、行业人脉积累',
      tips: '1. 识别生态的核心需求；2. 主动输出符合需求的价值；3. 通过持续贡献，获得生态的资源倾斜和用户认可。',
      practice: '1. 加入Excel学习社群，主动分享"Excel快捷键大全"和"实战案例"，成为社群核心成员，获得更多副业订单；2. 运营小红书职场账号，参与平台的"职场干货挑战"活动，获得平台流量扶持。'
    },
    
    // 全维度通用思维模型
    // 系统生态类
    {
      id: 'ecologicalNiche',
      name: 'ecologicalNiche',
      label: '生态位思维',
      icon: Hexagon,
      description: '展示个体在系统中的独特定位',
      deepAnalysis: '在一个竞争或协作的系统中，每个个体都有专属的生态位，即独特的生存和发展位置。核心是找到差异化优势，避免同质化竞争，在自己的生态位中实现价值最大化。',
      principle: '每个个体都有独特的生态位，找到差异化优势，避免同质化竞争，实现价值最大化。',
      scope: '个人优势定位、副业赛道选择、职场竞争力打造、自媒体内容定位',
      tips: '1. 分析自身资源、能力和市场需求的交集，找到"别人做不好、自己能做好"的细分领域；2. 避免进入饱和赛道，优先选择有潜力的小众生态位。',
      practice: '1. 想做美食内容分享，聚焦"上班族快手减脂餐"这个细分生态位；2. 职场中，深耕"数据分析+行业洞察"的复合生态位，成为不可替代的角色。'
    },
    {
      id: 'symbiosisEffect',
      name: 'symbiosisEffect',
      label: '共生效应',
      icon: GitMerge,
      description: '展示不同个体间的互利合作',
      deepAnalysis: '不同个体或系统之间，通过互利互惠的合作，实现共同生存、共同发展的效果。核心是"1+1>2"，通过合作弥补自身短板，放大整体价值。',
      principle: '通过互利互惠的合作，不同个体实现共同发展，合作能弥补自身短板，放大整体价值。',
      scope: '人脉协作搭建、项目资源整合、技能互补发展、创业合伙人选择',
      tips: '1. 找到与自身能力互补的合作对象；2. 明确合作中的利益分配和责任划分，确保互利共赢；3. 长期维护合作关系，形成稳定的共生系统。',
      practice: '1. 做自媒体账号，找擅长视频剪辑的伙伴合作，分工协作产出内容，共享收益；2. 加入"互补型学习小组"，成员之间互相辅导，实现共同进步。'
    },
    // 价值迭代类
    {
      id: 'multidimensionalCompounding',
      name: 'multidimensionalCompounding',
      label: '多维复利思维',
      icon: TrendingUp,
      description: '展示多维度投入的复利效应',
      deepAnalysis: '复利不仅体现在财富积累上，还存在于知识、技能、人脉、习惯等多个维度。核心是在多个维度持续投入，让不同维度的复利效应相互叠加，产生指数级增长。',
      principle: '在知识、技能、人脉、习惯等多个维度持续投入，让不同维度的复利效应相互叠加，产生指数级增长。',
      scope: '长期成长规划、多维度能力提升、资源积累策略、个人知识体系搭建',
      tips: '1. 选择2-3个核心维度持续投入；2. 定期梳理不同维度之间的关联，让它们相互赋能；3. 避免分散精力在过多维度，导致每个维度都无法形成复利。',
      practice: '1. 职场中，持续深耕专业技能，同时提升写作能力和人脉资源，三者形成多维复利；2. 学习中，在"专业知识+学习方法+复盘习惯"三个维度持续投入。'
    },
    {
      id: 'valueDensity',
      name: 'valueDensity',
      label: '价值密度思维',
      icon: Target,
      description: '展示如何提升单位资源的价值产出',
      deepAnalysis: '单位时间或资源内创造的价值越高，价值密度就越大。核心是重视小众需求的聚合价值，而非只盯着头部热门领域。',
      principle: '单位资源内创造的价值越高，价值密度越大，重视小众需求的聚合价值。',
      scope: '时间管理优化、任务优先级排序、资源分配策略、工作任务筛选',
      tips: '1. 用"价值/时间"的公式评估每件事的价值密度；2. 优先做"高价值、低时间成本"的事，延后或放弃"低价值、高时间成本"的事；3. 定期清理低价值的事务，避免占用宝贵资源。',
      practice: '1. 职场中，优先完成"写核心项目方案"等高价值密度任务；2. 学习时，选择"行业核心知识"和"高频实用技能"，淘汰低价值内容。'
    },
    // 认知边界类
    {
      id: 'cognitiveCircle',
      name: 'cognitiveCircle',
      label: '认知圈思维',
      icon: Layers,
      description: '展示认知的三个区域',
      deepAnalysis: '人的认知范围分为三个区域：舒适区（熟悉的知识和技能）、学习区（略高于现有能力的挑战）、恐慌区（远超现有能力的任务）。核心是主动停留在学习区，避免舒适区的安逸和恐慌区的挫败。',
      principle: '人的认知分为舒适区、学习区和恐慌区，主动停留在学习区，能实现持续成长，避免舒适区的安逸和恐慌区的挫败。',
      scope: '能力提升规划、学习目标设定、挑战难度调整、技能学习难度把控',
      tips: '1. 设定的目标要略高于现有能力，确保处于学习区；2. 当学习区的任务变得熟练后，及时升级难度；3. 避免直接挑战恐慌区的任务，防止因挫败感放弃。',
      practice: '1. 学习英语，当前水平是"能看懂简单短文"，选择"看带少量生词的短文+写短句"的学习区任务；2. 职场中，完成常规工作后，主动申请"略高于现有能力的项目"。'
    },
    {
      id: 'boundaryBreaking',
      name: 'boundaryBreaking',
      label: '破界思维',
      icon: ArrowLeftRight,
      description: '展示如何打破认知边界',
      deepAnalysis: '打破固有的认知边界、行业边界、能力边界，从更广阔的视角寻找新的机会和解决方案。核心是不被现有框架束缚，敢于跳出边界思考。',
      principle: '打破固有的认知边界、行业边界和能力边界，从更广阔的视角寻找新的机会和解决方案。',
      scope: '创新方案设计、赛道转型规划、能力跨界拓展、商业模式创新',
      tips: '1. 遇到瓶颈时，问自己"这个问题的边界是什么？""如果跳出边界，还有哪些解决方案？"；2. 主动学习其他领域的知识和思维方式；3. 小步试错，在可控范围内突破边界。',
      practice: '1. 传统实体店结合"线上直播带货+社群运营"，打造"线下体验+线上销售"的新模式；2. 程序员学习"产品思维"和"运营知识"，转型为"技术+产品"的复合型人才。'
    },
    // 执行保障类
    {
      id: 'redundancyBackup',
      name: 'redundancyBackup',
      label: '冗余备份思维',
      icon: Shield,
      description: '展示如何应对突发风险',
      deepAnalysis: '在系统中预留一定的冗余资源或备份方案，应对突发的风险和意外。核心是"未雨绸缪"，避免因单一环节的失效导致整个系统崩溃。',
      principle: '预留冗余资源或备份方案，应对突发风险，避免因单一环节失效导致系统崩溃。',
      scope: '风险管控规划、项目应急方案、资源储备策略、工作项目备份',
      tips: '1. 识别系统中的关键环节，为每个关键环节设置备份方案；2. 预留10%-20%的冗余资源，应对突发情况；3. 定期测试备份方案的有效性。',
      practice: '1. 做项目时，为核心数据设置"本地+云端"双重备份；2. 学习时，备份重要的学习资料和笔记，准备两套学习计划。'
    },
    {
      id: 'rhythmControl',
      name: 'rhythmControl',
      label: '节奏把控思维',
      icon: Clock,
      description: '展示如何保持张弛有度的节奏',
      deepAnalysis: '无论是学习、工作还是成长，都需要张弛有度的节奏，避免过度紧绷导致的疲劳和过度松弛导致的低效。核心是找到适合自己的节奏，保持长期的稳定输出。',
      principle: '保持张弛有度的节奏，避免过度紧绷或过度松弛，找到适合自己的节奏，保持长期稳定输出。',
      scope: '学习计划制定、工作节奏调整、长期目标推进、备考计划安排',
      tips: '1. 根据自身精力曲线，安排高难度任务和低难度任务的交替进行；2. 设置"专注期"和"休息期"，专注期高效执行，休息期彻底放松；3. 避免"突击式努力"，追求"细水长流"的稳定节奏。',
      practice: '1. 备考时，采用"2小时专注学习+30分钟休息"的节奏；2. 推进长期项目时，设定"每周固定进度"，避免前期拖延、后期赶工。'
    },
    // 全场景通用思维模型
    // 生态价值类
    {
      id: 'dislocationCompetition',
      name: 'dislocationCompetition',
      label: '错位竞争思维',
      icon: Target,
      description: '展示如何避免正面竞争',
      deepAnalysis: '避开竞争对手的优势领域，在其薄弱环节或未覆盖的细分领域建立自身优势，核心是"人无我有，人有我优，人优我特"，避免正面硬碰硬的竞争。',
      principle: '避开竞争对手的优势领域，在其薄弱环节或未覆盖的细分领域建立自身优势，避免正面竞争。',
      scope: '个人赛道定位、副业差异化设计、职场竞争力打造、自媒体内容定位',
      tips: '1. 分析竞争对手的核心优势和短板，找到他们忽略的用户需求；2. 聚焦细分需求，打造差异化的产品或服务，形成独特竞争力。',
      practice: '1. 多数健身博主聚焦"减脂增肌"，选择主打"上班族15分钟办公室健身"；2. 职场中，深耕"行业专属数据建模"，成为处理复杂行业数据的专家。'
    },
    {
      id: 'networkEffect',
      name: 'networkEffect',
      label: '网络效应思维',
      icon: GitMerge,
      description: '展示用户数量对产品价值的影响',
      deepAnalysis: '产品或服务的价值会随着用户数量的增加而指数级增长，核心是"越多人用，价值越高；价值越高，越多人用"，形成正向循环。',
      principle: '产品或服务的价值随用户数量的增加而指数级增长，形成"用户越多-价值越高-更多用户"的正向循环。',
      scope: '社群搭建运营、人脉网络拓展、工具产品推广、学习社群裂变',
      tips: '1. 设计能促进用户互动的机制，让用户之间产生连接；2. 优先积累第一批核心用户，通过他们的口碑吸引更多用户；3. 不断优化用户体验，强化网络效应。',
      practice: '1. 搭建英语学习社群，设置"每日打卡互评""组队背单词"等互动机制；2. 推广学习笔记工具，先免费开放给学霸用户，他们分享的优质笔记吸引更多用户。'
    },
    // 价值沉淀类
    {
      id: 'assetizationThinking',
      name: 'assetizationThinking',
      label: '资产化思维',
      icon: TrendingUp,
      description: '展示如何将投入转化为长期资产',
      deepAnalysis: '将日常的时间、精力、技能投入，转化为可复用、可增值、可持续产生收益的"资产"，核心是"不为当下赚快钱，而为长期攒资产"。',
      principle: '将日常投入转化为可复用、可增值、可持续产生收益的资产，注重长期价值积累而非短期利益。',
      scope: '长期价值积累、技能资产打造、副业模式设计、知识产品创作',
      tips: '1. 识别哪些投入可以转化为长期资产；2. 减少一次性的劳务输出，多做可复用的资产建设；3. 定期盘点和优化已有资产，提升其价值。',
      practice: '1. 做自媒体时，花时间写系列干货文章、开发小课程，形成"内容资产"；2. 职场中，把解决复杂问题的经验整理成"方法论手册"，沉淀为"经验资产"。'
    },
    {
      id: 'moatThinking',
      name: 'moatThinking',
      label: '护城河思维',
      icon: Shield,
      description: '展示如何建立核心竞争力壁垒',
      deepAnalysis: '打造自己的核心竞争力壁垒，让他人难以复制和超越，核心是"建立别人拿不走的优势"，保障长期的生存和发展。',
      principle: '打造核心竞争力壁垒，建立别人难以复制的优势，保障长期生存和发展。',
      scope: '核心能力深耕、个人品牌打造、副业壁垒建设、专业技能深耕',
      tips: '1. 护城河可以是稀缺技能、个人品牌、资源人脉等；2. 持续投入，不断加宽护城河，避免被轻易超越。',
      practice: '1. 深耕"短视频脚本创作"，积累行业案例和用户数据，形成"技巧+数据"的双重壁垒；2. 打造个人品牌，通过持续输出优质内容，建立"靠谱、专业"的形象。'
    },
    // 认知行动类
    {
      id: 'knowledgeActionUnity',
      name: 'knowledgeActionUnity',
      label: '知行合一思维',
      icon: BookOpen,
      description: '展示知识与行动的关系',
      deepAnalysis: '知是行的主意，行是知的功夫；知而不行，只是未知。核心是知识必须通过行动来验证和内化，行动是知识的最终目的，避免"纸上谈兵"式的学习。',
      principle: '知识必须通过行动来验证和内化，行动是知识的最终目的，避免"纸上谈兵"。',
      scope: '知识转化落地、技能实践提升、学习效果检验、读书复盘',
      tips: '1. 学到一个新知识点或方法后，必须在24小时内进行一次小实践；2. 将知识拆解为可执行的动作，而非停留在"知道了"的层面；3. 通过行动中的反馈，修正和完善知识体系。',
      practice: '1. 读完《高效能人士的七个习惯》，第二天就实践"要事第一"的原则；2. 学习"数据透视表"的用法后，立刻用自己的工作数据做一次分析。'
    },
    {
      id: 'microHabitCompounding',
      name: 'microHabitCompounding',
      label: '微习惯复利思维',
      icon: Activity,
      description: '展示微小习惯的长期影响',
      deepAnalysis: '微小的习惯，通过长期的坚持和复利效应，会带来巨大的改变。核心是从极小的、毫无压力的动作开始，利用习惯的惯性，逐步放大效果，避免因目标过高而放弃。',
      principle: '微小的习惯通过长期坚持和复利效应，会带来巨大改变，从极小的动作开始，利用习惯惯性逐步放大效果。',
      scope: '习惯养成启动、长期目标推进、意志力消耗优化、阅读写作习惯培养',
      tips: '1. 设定的微习惯要小到"不可能失败"；2. 坚持21天形成惯性后，再逐步增加难度；3. 记录每次的微小进步，强化正向反馈。',
      practice: '1. 想养成写作习惯，从"每天写1句话"开始；2. 培养复盘习惯，每天只花5分钟记录"1个收获+1个改进点"。'
    },
    // 风险收益类
    {
      id: 'barbellStrategy',
      name: 'barbellStrategy',
      label: '杠铃策略',
      icon: Scale,
      description: '展示如何平衡风险和收益',
      deepAnalysis: '将资源分配为两极，一极是低风险、低收益的稳健部分（占大部分资源），另一极是高风险、高收益的投机部分（占小部分资源），中间部分则避免投入，核心是"保本的同时，博取高收益"。',
      principle: '将资源分为低风险稳健部分（大部分）和高风险投机部分（小部分），中间部分避免投入，实现"保本+博取高收益"。',
      scope: '资源分配规划、副业风险管控、投资策略制定、时间分配',
      tips: '1. 大部分资源投入到稳健的领域，保障基本生存和发展；2. 小部分资源投入到高风险、高回报的领域，尝试突破；3. 不做"中等风险、中等收益"的投入，避免得不偿失。',
      practice: '1. 时间分配：80%用于本职工作和核心技能学习，20%用于尝试新的副业赛道；2. 资金投资：80%用于低风险理财，20%用于高风险投资。'
    },
    {
      id: 'antifragileThinking',
      name: 'antifragileThinking',
      label: '反脆弱思维',
      icon: ArrowLeftRight,
      description: '展示如何从风险中获益',
      deepAnalysis: '事物不仅能抵御风险、承受冲击，还能在冲击和波动中变得更强大，核心是"从不确定性中获益"，而非单纯地规避风险。',
      principle: '事物不仅能抵御风险、承受冲击，还能在冲击和波动中变得更强大，从不确定性中获益。',
      scope: '风险应对策略、挫折成长规划、系统韧性建设、职场危机应对',
      tips: '1. 主动接受可控的小风险和小挫折，积累应对经验；2. 在系统中设置"波动触发器"，当遇到冲击时，启动优化机制；3. 把挫折和失败看作成长的机会，而非灾难。',
      practice: '1. 职场中，主动申请参与有挑战性的项目，即使失败也能积累经验；2. 做副业时，接受"收入波动"的常态，当遇到订单减少时，优化产品或服务。'
    },
    // 全场景通用思维模型 - 价值创造类
    {
      id: 'supplyDemandMismatch',
      name: 'supplyDemandMismatch',
      label: '供需错配洞察思维',
      icon: Target,
      description: '市场的机会往往藏在供需错配的缝隙里',
      deepAnalysis: '市场的机会往往藏在供需错配的缝隙里——即现有供给满足不了用户的真实需求，或供给的方式、形态与需求不匹配。核心是"找到未被满足的需求，提供精准解决方案"。',
      principle: '市场的机会往往藏在供需错配的缝隙里——即现有供给满足不了用户的真实需求，或供给的方式、形态与需求不匹配。核心是"找到未被满足的需求，提供精准解决方案"。',
      scope: '系统的「副业赛道挖掘」「产品功能设计」「职场价值提升」模块，如小众需求服务、现有产品优化、职场痛点解决。',
      tips: '通过用户调研、场景观察、痛点收集，识别"用户想要但市面上没有"或"有但做得不好"的需求；从需求出发设计供给，而非从自身优势出发自嗨。',
      practice: '1. 观察到"宝妈带娃出行时，很难买到小份、健康的零食"这个供需错配点，推出"宝妈便携小份零食组合"，精准匹配需求。2. 职场中发现"同事们做周报时，总是重复整理数据"的痛点，开发一个"周报数据自动汇总模板"，解决效率问题。'
    },
    {
      id: 'leverageThinking',
      name: 'leverageThinking',
      label: '杠杆思维',
      icon: Zap,
      description: '通过撬动核心资源，用极小的自身投入，获得放大倍数的收益',
      deepAnalysis: '通过撬动核心资源（如人脉、技能、平台），用极小的自身投入，获得放大倍数的收益。核心是"找到支点，撬动更多价值"，避免"事必躬亲"的低效努力。',
      principle: '通过撬动核心资源（如人脉、技能、平台），用极小的自身投入，获得放大倍数的收益。核心是"找到支点，撬动更多价值"，避免"事必躬亲"的低效努力。',
      scope: '系统的「资源整合利用」「效率提升优化」「收益放大设计」模块，如人脉变现、技能复用、平台借势。',
      tips: '识别自己的核心杠杆资源（如某领域的专业技能、优质的人脉网络、高流量的平台账号）；找到能放大资源价值的支点（如合作、工具、趋势）；以小博大，聚焦杠杆点发力。',
      practice: '1. 拥有"数据分析"的核心技能，作为支点，撬动"帮企业做数据报告""开发数据模板售卖""做数据分析培训"等多个收益渠道，实现技能价值放大。2. 借助"短视频平台"这个杠杆，用一条优质内容撬动百万流量，相比传统线下推广，投入小、收益大。'
    },
    // 价值跃迁类
    {
      id: 'compoundLeverage',
      name: 'compoundLeverage',
      label: '复利杠杆思维',
      icon: TrendingUp,
      description: '在复利效应的基础上，叠加资源、人脉、平台等杠杆，让价值增长从线性复利升级为指数级复利。',
      deepAnalysis: '在复利效应的基础上，叠加资源、人脉、平台等杠杆，让价值增长从"线性复利"升级为"指数级复利"。核心是"复利打底，杠杆加速"，实现价值的跨越式增长。',
      principle: '复利是基础，杠杆是加速器，通过叠加杠杆让复利效应呈指数级放大，实现价值的跨越式增长。',
      scope: '个人成长加速、副业收益裂变、品牌影响力放大',
      tips: '1. 先通过高频次的小行动积累复利基础；2. 找到能放大成果的杠杆；3. 让复利和杠杆相互赋能，加速价值增长。',
      practice: '1. 每天输出1条职场干货，积累3个月形成内容复利；再对接职场类公众号平台投稿，借助平台流量杠杆，让内容触达更多用户，实现个人IP影响力的指数级增长。2. 做设计接单副业，先通过低价单积累作品和口碑的复利；再和本地广告公司合作，借助公司的客户资源杠杆，快速获得高客单价订单，实现收益的跨越式提升。'
    },
    {
      id: 'valueNetwork',
      name: 'valueNetwork',
      label: '价值网络思维',
      icon: GitMerge,
      description: '将自身的价值节点，接入多个互补的价值网络，通过网络之间的协同效应，放大自身价值。',
      deepAnalysis: '将自身的价值节点，接入多个互补的价值网络，通过网络之间的协同效应，放大自身价值。核心是"单点接入，全网受益"，不局限于单一的价值生态。',
      principle: '通过接入多个互补的价值网络，利用网络间的协同效应，实现自身价值的放大。',
      scope: '资源整合拓展、副业渠道裂变、职场机会挖掘',
      tips: '1. 梳理自身的核心价值；2. 找到和核心价值互补的价值网络；3. 主动接入网络，提供价值并获取网络红利。',
      practice: '1. 核心价值是"文案写作"，接入自媒体内容生态、电商品牌推广生态、企业内刊编辑生态，为不同网络提供定制化文案服务，实现一单多收的价值放大。2. 核心价值是"数据分析"，接入公司业务部门、市场调研团队、外部咨询机构的价值网络，为不同场景提供数据分析支持，挖掘更多职场晋升机会。'
    },
    {
      id: 'thresholdBreakthrough',
      name: 'thresholdBreakthrough',
      label: '阈值突破思维',
      icon: Zap,
      description: '任何成长和价值变现都存在临界阈值，前期的积累看似缓慢，一旦突破阈值就会迎来指数级增长。',
      deepAnalysis: '任何成长和价值变现都存在临界阈值，前期的积累看似缓慢，一旦突破阈值就会迎来指数级增长。核心是"熬过积累期，等待爆发点"，拒绝半途而废。',
      principle: '成长和价值变现存在临界阈值，前期缓慢积累，突破阈值后迎来指数级增长。',
      scope: '技能深耕突破、副业变现爆发、个人品牌破圈',
      tips: '1. 识别所在领域的阈值节点；2. 聚焦核心动作持续积累，不被短期波动干扰；3. 阈值临近时，主动加码关键动作加速突破。',
      practice: '1. 做职场干货自媒体，前期持续日更3个月积累到8000粉，临近1万粉阈值时，策划"粉丝专属干货礼包"活动，快速突破阈值，之后流量和变现效率显著提升。2. 做插画接单副业，坚持积累20个优质商业案例，突破"案例量阈值"后，主动对接设计平台，凭借作品集获得高客单价订单，实现收入跃迁。'
    },
    {
      id: 'valueAnchorUpgrade',
      name: 'valueAnchorUpgrade',
      label: '价值锚点升级思维',
      icon: Anchor,
      description: '在不同的成长阶段，设置更高维度的价值锚点，用新锚点重新定义自身价值，实现从低价值到高价值的跃迁。',
      deepAnalysis: '在不同的成长阶段，设置更高维度的价值锚点，用新锚点重新定义自身价值，实现从低价值到高价值的跃迁。核心是"锚点升级，价值重塑"，避免停留在低价值区间。',
      principle: '通过设置更高维度的价值锚点，重新定义自身价值，实现从低价值到高价值的跃迁。',
      scope: '个人定位升级、副业赛道进阶、职场角色跃迁',
      tips: '1. 每个阶段结束后，复盘当前价值锚点的局限；2. 找到更高维度的锚点；3. 围绕新锚点打磨能力，输出更高价值的成果。',
      practice: '1. 副业初期锚点是"写单篇文案"，升级后锚点是"提供品牌文案全案"，围绕新锚点学习营销策略、品牌定位知识，服务从中小客户升级为品牌客户，客单价提升5倍以上。2. 职场初期锚点是"执行数据录入"，升级后锚点是"输出数据洞察报告"，学习数据分析和可视化技能，为团队提供决策支持，实现从执行层到分析层的跃迁。'
    },
    // 认知破界类
    {
      id: 'metacognition',
      name: 'metacognition',
      label: '元认知思维',
      icon: BrainCircuit,
      description: '对自己的认知过程进行监控、反思和优化，核心是"思考自己的思考方式"。',
      deepAnalysis: '对自己的认知过程进行监控、反思和优化，核心是"思考自己的思考方式"，通过提升认知的底层能力，实现所有领域的认知升级。',
      principle: '通过监控、反思和优化自己的认知过程，提升认知的底层能力，实现所有领域的认知升级。',
      scope: '学习效率提升、决策质量优化、思维模式重构',
      tips: '1. 在学习或决策后，定期复盘"我是如何思考这个问题的？""我的思考方式存在哪些漏洞？"；2. 学习高效的思维模型；3. 用元认知监控自己的思维过程，及时纠正偏差。',
      practice: '1. 学习Python编程时，发现自己总是死记硬背代码，通过元认知反思："我的学习方式是\'机械记忆\'，缺少对逻辑的理解"，调整为"先理解代码逻辑，再动手实操"，学习效率大幅提升。2. 做项目决策时，元认知监控到自己"只关注短期收益，忽略长期风险"，立刻引入"风险收益比思维"，重新评估方案，提升决策的科学性。'
    },
    {
      id: 'firstPrincipleInnovation',
      name: 'firstPrincipleInnovation',
      label: '第一性原理创新思维',
      icon: Lightbulb,
      description: '抛开传统经验和类比思维，从事物最基础的公理和本质出发，重新推导解决方案，实现颠覆性创新。',
      deepAnalysis: '抛开传统经验和类比思维，从事物最基础的公理和本质出发，重新推导解决方案，实现颠覆性创新。核心是"回归本质，从零开始"，不被现有框架束缚。',
      principle: '从事物最基础的公理和本质出发，重新推导解决方案，实现颠覆性创新。',
      scope: '模式创新设计、产品功能重构、赛道重新定义',
      tips: '1. 面对问题时，问自己"这件事的本质是什么？""最基础的公理是什么？"；2. 抛开所有现有的解决方案，从本质出发推导新的路径；3. 用"本质+公理"验证推导结果的可行性。',
      practice: '1. 思考"学习打卡工具的本质"，不是"记录打卡次数"，而是"提升学习动力"，从这个本质出发，设计"打卡+同伴监督+奖励机制"的创新功能，区别于传统的打卡工具。2. 思考"副业的本质"，不是"赚零花钱"，而是"价值变现"，从这个本质出发，放弃"低价值的苦力单"，选择"和自身核心能力匹配的高价值服务"，重新定义副业赛道。'
    },
    {
      id: 'paradigmShift',
      name: 'paradigmShift',
      label: '范式转移思维',
      icon: RotateCw,
      description: '当原有框架无法解决问题时，主动打破旧的认知范式，切换到新的范式思考和行动。',
      deepAnalysis: '当原有框架无法解决问题时，主动打破旧的认知范式，切换到新的范式思考和行动，核心是"不破不立，换框解题"，避免用旧思维解决新问题。',
      principle: '主动打破旧的认知范式，切换到新的范式思考和行动，用新框架解决问题。',
      scope: '创新问题解决、赛道重构突破、困境破局突围',
      tips: '1. 识别当前的认知范式瓶颈；2. 寻找跨领域的新范式参考；3. 用新范式重构解决方案，跳出旧框架的束缚。',
      practice: '1. 陷入"PPT接单低价内卷"的旧范式，打破后切换到"PPT模板产品化"新范式，开发行业专属模板，通过多平台售卖实现被动收入，摆脱内卷困境。2. 职场陷入"靠加班提升业绩"的旧范式，打破后切换到"靠效率提升+资源整合"新范式，优化工作流程、对接跨部门资源，用更少时间做出更好成果。'
    },
    {
      id: 'probabilityRight',
      name: 'probabilityRight',
      label: '概率权思维',
      icon: BarChart2,
      description: '在面临多个选择时，计算每个选项的概率权，优先选择概率权更高的选项。',
      deepAnalysis: '在面临多个选择时，计算每个选项的概率权（成功概率×收益-失败概率×成本），优先选择概率权更高的选项，核心是"理性计算，而非凭感觉决策"，避免赌徒式选择。',
      principle: '通过计算每个选项的概率权，理性选择概率权更高的选项，避免凭感觉决策。',
      scope: '项目选择决策、副业赛道筛选、职场机会把握',
      tips: '1. 列出所有可选方案，量化每个方案的成功概率、潜在收益、失败成本；2. 计算每个方案的概率权值；3. 优先投入资源到概率权最高的方案，同时为低概率权方案保留小额试错空间。',
      practice: '1. 面临两个副业选择：A是"小红书好物推荐"（成功概率60%，收益5000元，成本500元），B是"线下手工摆摊"（成功概率30%，收益8000元，成本2000元），计算得A概率权更高，优先选择A，同时用小额资金试错B。2. 职场有两个项目可选：A是成熟项目（成功概率90%，收益中等，成本低），B是创新项目（成功概率40%，收益高，成本高），选择A为主、B为辅的策略，兼顾稳收益和高潜力。'
    },
    // 执行落地类
    {
      id: 'extremeFocus',
      name: 'extremeFocus',
      label: '极致专注思维',
      icon: Target,
      description: '在一段时间内，将所有的注意力、精力和资源聚焦于一个核心目标，排除一切干扰，实现单点突破。',
      deepAnalysis: '在一段时间内，将所有的注意力、精力和资源聚焦于一个核心目标，排除一切干扰，实现单点突破。核心是"少即是多，聚焦才会高效"，避免精力分散导致的低效努力。',
      principle: '将所有资源聚焦于一个核心目标，排除干扰，实现单点突破。',
      scope: '核心技能攻坚、高难度任务突破、关键目标达成',
      tips: '1. 设定一个明确的核心目标；2. 在目标周期内，砍掉所有无关的任务和干扰；3. 将80%的时间和资源投入到核心目标上，确保单点突破。',
      practice: '1. 核心目标是"3个月掌握深度学习基础"，期间卸载所有游戏和短视频APP，每天投入4小时专注学习，拒绝朋友的无效聚会邀请，集中精力攻克核心知识点，实现技能的快速突破。2. 核心目标是"完成公司年度核心项目"，期间暂停所有非核心的日常琐事，将团队资源集中到项目上，每天召开进度推进会，确保项目按时高质量完成。'
    },
    {
      id: 'fastIteration',
      name: 'fastIteration',
      label: '快速试错思维',
      icon: RefreshCw,
      description: '在面对不确定性时，用最小的成本、最快的速度进行多次试错，从错误中获取反馈，快速迭代方案，直到找到可行的路径。',
      deepAnalysis: '在面对不确定性时，用最小的成本、最快的速度进行多次试错，从错误中获取反馈，快速迭代方案，直到找到可行的路径。核心是"早试错、早调整、早成功"，避免因追求完美而错失机会。',
      principle: '用最小的成本、最快的速度进行多次试错，从错误中获取反馈，快速迭代方案。',
      scope: '新赛道探索、新产品测试、新技能验证',
      tips: '1. 将大目标拆解为可测试的小假设；2. 用最小的成本验证假设；3. 根据测试结果快速调整方向，要么放大有效动作，要么放弃无效路径。',
      practice: '1. 想探索"小红书职场干货"的副业赛道，提出假设"职场PPT技巧内容在小红书有流量"，用7天时间每天发1条PPT技巧笔记，测试后发现流量不错，立刻加大投入；若流量差，则快速切换选题。2. 想验证"费曼学习法"是否适合自己，用1周时间尝试用该方法学习一个小知识点，测试后发现理解效率提升，就将该方法推广到所有学习中；若效果差，则换其他方法。'
    },
    {
      id: 'minimalResistancePath',
      name: 'minimalResistancePath',
      label: '最小阻力路径思维',
      icon: Zap,
      description: '在执行目标时，找到阻力最小的行动路径，降低执行门槛，提升行动持续性。',
      deepAnalysis: '在执行目标时，找到阻力最小的行动路径，降低执行门槛，提升行动持续性，核心是"顺势而为，而非逆势硬扛"，避免因阻力过大而放弃。',
      principle: '找到阻力最小的行动路径，降低执行门槛，提升行动持续性。',
      scope: '习惯养成启动、任务执行推进、项目落地攻坚',
      tips: '1. 梳理执行过程中的关键阻力点；2. 针对阻力点设计替代方案；3. 让行动路径贴合现有生活习惯，而非强行改变。',
      practice: '1. 想养成健身习惯，阻力是"下班累不想去健身房"，选择阻力最小的路径："睡前10分钟拉伸+5分钟平板支撑"，贴合睡前习惯，容易坚持，后期再逐步升级为完整训练。2. 推进项目时，阻力是"跨部门沟通效率低"，找到最小阻力路径："提前整理需求文档+预约15分钟短会"，避免反复沟通，提升协作效率。'
    },
    {
      id: 'resultVisualization',
      name: 'resultVisualization',
      label: '结果可视化强化思维',
      icon: BarChart2,
      description: '将执行过程中的阶段性结果转化为直观的可视化形式，强化正向反馈，激发持续行动的动力。',
      deepAnalysis: '将执行过程中的阶段性结果转化为直观的可视化形式，强化正向反馈，激发持续行动的动力，核心是"让进步看得见，让努力有反馈"。',
      principle: '通过可视化阶段性结果，强化正向反馈，激发持续行动的动力。',
      scope: '习惯养成激励、学习进度跟踪、项目成果展示',
      tips: '1. 选择适合的可视化工具；2. 设定固定的更新频率；3. 将可视化成果展示在显眼位置。',
      practice: '1. 学习Python编程，制作"知识点掌握进度条"，每学会一个知识点就填充一段进度条，挂在书桌前，看着进度条逐渐填满，学习动力持续增强。2. 做副业接单，用Excel制作"月度订单增长柱状图"，每周更新数据，直观看到订单增长趋势，及时调整运营策略，同时也能获得成就感。'
    },
    // 生态共生类
    {
      id: 'ecologicalNichePositioning',
      name: 'ecologicalNichePositioning',
      label: '生态位卡位思维',
      icon: Hexagon,
      description: '在价值生态中，找到独一无二、不可替代的生态位，并牢牢占据，成为生态中的核心节点。',
      deepAnalysis: '在价值生态中，找到独一无二、不可替代的生态位，并牢牢占据，成为生态中的核心节点。核心是"人无我有，人有我优，人优我特"，建立长期的竞争壁垒。',
      principle: '找到独一无二的生态位，建立长期的竞争壁垒。',
      scope: '个人品牌定位、副业赛道选择、职场角色塑造',
      tips: '1. 分析生态中的竞争格局，找到未被覆盖或覆盖薄弱的细分领域；2. 聚焦该领域，打造差异化的价值输出；3. 持续深耕，成为该领域的权威。',
      practice: '1. 分析Excel教程的竞争格局，发现多数教程聚焦"功能讲解"，缺少"新人避坑"内容，立刻卡位"职场新人Excel避坑指南"的生态位，持续输出避坑技巧和实战案例，成为该细分领域的小权威。2. 分析公司的职场生态，发现"项目数据可视化汇报"的岗位需求被忽视，立刻深耕该领域，打造"数据可视化+职场汇报"的复合能力，成为公司该领域的核心人才。'
    },
    {
      id: 'valueSymbiosisNetwork',
      name: 'valueSymbiosisNetwork',
      label: '价值共生网络思维',
      icon: GitMerge,
      description: '联合多个互补的价值节点，构建互利共赢的共生网络，网络中的每个节点都为其他节点提供价值，同时也获得其他节点的赋能。',
      deepAnalysis: '联合多个互补的价值节点，构建互利共赢的共生网络，网络中的每个节点都为其他节点提供价值，同时也获得其他节点的赋能。核心是"网络共生，价值倍增"，实现1+1>2的协同效应。',
      principle: '联合互补的价值节点，构建互利共赢的共生网络，实现价值倍增。',
      scope: '资源整合联盟、副业合作共同体、职场团队协作',
      tips: '1. 找到和自身价值互补的合作伙伴；2. 明确网络的共同目标；3. 制定公平的利益分配机制；4. 通过网络协同，放大整体价值。',
      practice: '1. 联合文案写手、设计师、运营，构建"职场干货内容联盟"，文案写手负责内容创作，设计师负责视觉呈现，运营负责平台推广，联盟产出的内容质量和流量远超个人单打独斗，收益按贡献分配。2. 联合公司市场部、技术部、销售部，构建"新产品推广协作网络"，市场部负责调研，技术部负责开发，销售部负责渠道，网络协同推进新产品上市，效率和效果大幅提升。'
    },
    {
      id: 'ecologicalEmpowerment',
      name: 'ecologicalEmpowerment',
      label: '生态赋能思维',
      icon: Mountain,
      description: '主动融入优质生态，借助生态的资源、流量、规则为自身赋能，同时为生态贡献价值，实现双向成长。',
      deepAnalysis: '主动融入优质生态，借助生态的资源、流量、规则为自身赋能，同时为生态贡献价值，实现双向成长，核心是"借势生态，加速成长"。',
      principle: '融入优质生态，借助生态资源赋能自身，同时为生态贡献价值。',
      scope: '个人品牌曝光、副业流量获取、职场资源拓展',
      tips: '1. 选择和自身价值匹配的优质生态；2. 研究生态的赋能规则；3. 主动为生态贡献价值，获得生态倾斜。',
      practice: '1. 做职场干货内容，加入领英职场创作者生态，参与平台的"职场干货周更计划"，凭借优质内容获得平台流量扶持，账号曝光量提升10倍以上。2. 职场中主动加入公司的核心项目生态，为项目提供数据分析支持，借助项目资源对接高层人脉，同时提升自身的项目经验和影响力。'
    },
    {
      id: 'symbiosisBarrier',
      name: 'symbiosisBarrier',
      label: '共生壁垒思维',
      icon: Shield,
      description: '在生态中，与核心伙伴建立深度绑定的共生关系，形成"一荣俱荣，一损俱损"的共生壁垒，抵御外部竞争。',
      deepAnalysis: '在生态中，与核心伙伴建立深度绑定的共生关系，形成"一荣俱荣，一损俱损"的共生壁垒，抵御外部竞争，核心是"深度绑定，互利共赢"。',
      principle: '与核心伙伴建立深度绑定的共生关系，形成共生壁垒，抵御外部竞争。',
      scope: '副业合作深化、职场团队绑定、个人品牌联盟',
      tips: '1. 找到生态中的核心互补伙伴；2. 建立深度绑定机制；3. 共同打造标志性成果，强化共生壁垒。',
      practice: '1. 和文案、设计伙伴建立副业共生联盟，分工负责内容创作、视觉设计、平台运营，利益按贡献分成，共同打造"职场高效技能系列课程"，凭借组合优势抵御单打独斗的竞争。2. 职场中，和核心同事建立共生团队，共同负责公司的重点项目，分工协作、共享成果，形成的项目经验和人脉资源成为团队的共生壁垒，提升团队在公司的话语权。'
    },
    // 原有图表
    { 
      id: 'dip', 
      name: 'dip', 
      label: '死亡谷效应', 
      icon: Mountain, 
      description: '展示在新事物学习过程中遇到的瓶颈期', 
      deepAnalysis: '死亡谷效应是指在学习新技能或开展新项目时，初期进步迅速，但随后会进入一个长期的瓶颈期，进步缓慢甚至停滞。这是学习曲线中的正常现象，坚持度过这个阶段，就能进入快速成长的上升期。',
      principle: '在新事物学习过程中，初期进步迅速，但随后会进入一个长期的瓶颈期，进步缓慢甚至停滞，坚持度过这个阶段，就能进入快速成长的上升期。',
      scope: '技能学习、项目开展、习惯养成、职业发展',
      tips: '1. 提前了解死亡谷的存在，做好心理准备；2. 分解目标，设置小里程碑，获得持续的成就感；3. 寻找同伴或导师，获得支持和指导；4. 保持规律的学习/工作节奏，避免三天打鱼两天晒网。',
      practice: '1. 制定详细的学习计划，将大目标分解为小目标；2. 每周记录进度，关注微小的进步；3. 遇到瓶颈时，尝试换一种学习方法或休息一下再继续；4. 寻找成功案例，激励自己坚持下去。',
      visualDesign: '1. 图表绘制思路：以曲线形式展示投入度与产出率的关系，突出学习过程中的瓶颈期；2. 设计细节：使用线性渐变填充曲线下区域，增强视觉层次感；移除垂直网格线，突出曲线趋势；3. 视觉元素选择：采用蓝绿渐变色表示成长过程，坐标轴标签清晰标注投入度和产出率，标题突出主题，增强可读性。'
    },
    { 
      id: 'dunning', 
      name: 'dunning', 
      label: '达克效应', 
      icon: BrainCircuit, 
      description: '展示认知能力与自信程度的关系', 
      deepAnalysis: '达克效应指出，能力欠缺的人往往对自己的能力估计过高，而能力强的人则倾向于低估自己的能力。了解达克效应有助于保持谦虚的学习态度，避免陷入过度自信的陷阱。大明成化款，是明朝成化年间烧制的瓷器，以其精美工艺和稀缺性而闻名于世，常被用作比喻珍贵、稀有的事物。',
      principle: '能力欠缺的人往往对自己的能力估计过高，而能力强的人则倾向于低估自己的能力，这种认知偏差会影响人们的学习和决策。',
      scope: '自我认知、学习态度、决策制定、团队管理',
      tips: '1. 保持谦虚，认识到自己的局限性；2. 主动寻求反馈，了解他人对自己的评价；3. 学习批判性思维，学会质疑自己的观点；4. 与不同水平的人交流，拓宽视野。',
      practice: '1. 定期进行自我评估，记录自己的成长；2. 参加技能测试或比赛，客观了解自己的水平；3. 阅读相关书籍或课程，提升认知能力；4. 在做出重要决策前，征求他人的意见。',
      visualDesign: '1. 图表绘制思路：通过曲线展示智慧水平与自信程度的关系，将认知过程划分为四个阶段；2. 设计细节：使用不同颜色的矩形块区分四个认知阶段，红色圆点标记关键节点（愚昧之巅、绝望之谷、开悟之坡、平稳高原），简洁的文字标注各阶段特点；3. 视觉元素选择：采用生动的图标表示不同认知阶段的人物状态，坐标轴清晰标注智慧水平和自信程度，使用渐变色增强视觉层次感，整体设计直观易懂，便于理解达克效应的核心概念。'
    },
    { 
      id: 'jcurve', 
      name: 'jcurve', 
      label: 'J型曲线', 
      icon: TrendingUp, 
      description: '展示长期投资或努力的回报模式', 
      deepAnalysis: 'J型曲线描述了在投入初期收益为负，但随着时间推移，收益会呈指数级增长的现象。这一规律适用于学习、投资、健身等多个领域，提醒我们要有长期主义思维，坚持积累。',
      principle: '在投入初期收益为负，但随着时间推移，收益会呈指数级增长，长期坚持才能获得巨大回报。',
      scope: '学习投资、职业发展、健身养生、人际关系',
      tips: '1. 树立长期主义思维，不急于求成；2. 选择有长期价值的领域进行投入；3. 保持持续学习和进步；4. 定期复盘和调整策略。',
      practice: '1. 制定5年或10年的长期计划；2. 每天坚持做一件对长期有价值的事情；3. 投资自己的技能和知识；4. 保持健康的生活方式，为长期发展奠定基础。'
    },
    { 
      id: 'antifragile', 
      name: 'antifragile', 
      label: '反脆弱', 
      icon: Shield, 
      description: '展示系统在压力下的恢复和成长能力', 
      deepAnalysis: '反脆弱是指系统不仅能在压力下恢复，还能从压力中获益。与脆弱和稳健不同，反脆弱系统在不确定性中茁壮成长。培养反脆弱能力有助于应对生活中的各种挑战。',
      principle: '系统不仅能在压力下恢复，还能从压力中获益，在不确定性中茁壮成长。',
      scope: '个人成长、企业管理、投资决策、风险管理',
      tips: '1. 主动接受适度的挑战和压力；2. 建立多元化的技能和收入来源；3. 培养适应变化的能力；4. 从失败中学习，不断改进。',
      practice: '1. 定期尝试新事物，走出舒适区；2. 学习一项新技能，挑战自己的极限；3. 建立应急基金，应对突发情况；4. 记录失败经验，分析原因并改进。'
    },
    { 
      id: 'secondcurve', 
      name: 'secondcurve', 
      label: '第二曲线', 
      icon: GitMerge, 
      description: '展示从现有曲线向新增长曲线的转型', 
      deepAnalysis: '第二曲线理论指出，任何事物的发展都有生命周期，当第一条曲线开始下降时，需要提前布局第二条增长曲线。这一理论适用于企业发展和个人成长，提醒我们要不断创新和转型。',
      principle: '任何事物的发展都有生命周期，当第一条曲线开始下降时，需要提前布局第二条增长曲线，实现持续发展。',
      scope: '职业规划、企业发展、产品创新、个人成长',
      tips: '1. 提前预判现有曲线的发展趋势；2. 在现有曲线达到峰值前，开始布局第二条曲线；3. 勇于创新，尝试新的领域和方向；4. 资源合理分配，既要维护现有业务，又要发展新业务。',
      practice: '1. 定期评估自己的职业发展状况；2. 学习新技能，为转型做准备；3. 关注行业趋势，寻找新的机会；4. 小步试错，逐步推进新的发展方向。'
    },
    { 
      id: 'compound', 
      name: 'compound', 
      label: '复利效应', 
      icon: TrendingUp, 
      description: '展示复利对长期增长的影响', 
      deepAnalysis: '复利效应是指资产收益率在经过若干期后，会产生收益增长的指数效应。复利的力量在于时间的积累，即使是微小的增长率，经过长期积累也会产生巨大的收益。',
      principle: '微小的正向行动，通过时间的持续积累，最终产生指数级的结果。',
      scope: '投资理财、学习成长、习惯养成、健康管理',
      tips: '1. 关注“每日增量”，忽略短期无明显效果的焦虑；2. 时间越长，复利效果越明显，坚持比单次投入更重要；3. 选择正向的行动方向；4. 保持行动的连续性，避免中断。',
      practice: '1. 选择正向微行动：挑选能长期坚持的小事（如“每天读20页书”“每天写50字复盘”“每天存10元钱”）；2. 保持连续性：哪怕当天状态差，也做“最低版本”的行动；3. 定期复盘：每月统计一次累计成果，直观看到复利效果；4. 持续优化：根据实际情况调整行动内容和强度。'
    },
    { 
      id: 'mining', 
      name: 'mining', 
      label: '阻力与收益', 
      icon: Pickaxe, 
      description: '展示在克服阻力过程中获得的收益', 
      deepAnalysis: '阻力与收益模型指出，随着阻力的增加，初期收益增长缓慢，但当突破一定阈值后，收益会快速增长。这一模型提醒我们，面对阻力时要坚持，因为更大的收益往往在克服困难之后。',
      principle: '随着阻力的增加，初期收益增长缓慢，但当突破一定阈值后，收益会快速增长。',
      scope: '技能学习、项目攻坚、困难克服、目标实现',
      tips: '1. 认识到阻力是成长的必经之路；2. 分解阻力，逐步克服；3. 保持耐心，坚持到突破阈值；4. 从克服阻力中获得成就感和成长。',
      practice: '1. 遇到困难时，先分析阻力的来源和大小；2. 将大的阻力分解为小的、可克服的阻力；3. 制定详细的克服计划，逐步实施；4. 每克服一个阻力，记录下来，增强信心。'
    },
    { 
      id: 'dopamine', 
      name: 'dopamine', 
      label: '多巴胺曲线', 
      icon: Smile, 
      description: '展示多巴胺水平随时间的变化', 
      deepAnalysis: '多巴胺是一种神经递质，与愉悦感和奖励机制相关。了解多巴胺曲线有助于更好地管理情绪和动机，避免过度依赖即时满足，培养延迟满足的能力。',
      principle: '多巴胺是一种神经递质，与愉悦感和奖励机制相关，影响人们的动机和行为。',
      scope: '情绪管理、动机激发、习惯养成、延迟满足',
      tips: '1. 了解多巴胺的作用机制，避免过度追求即时满足；2. 培养延迟满足的能力；3. 设置合理的奖励机制；4. 保持健康的生活方式，维持多巴胺的平衡。',
      practice: '1. 制定长期目标，并将奖励与长期目标挂钩；2. 避免过度使用手机、游戏等容易产生即时满足的事物；3. 进行有氧运动，促进多巴胺的自然分泌；4. 学习新技能，获得成就感和满足感。'
    },
    { 
      id: 'flow', 
      name: 'flow', 
      label: '心流通道', 
      icon: Zap, 
      description: '展示进入心流状态的条件', 
      deepAnalysis: '心流是一种高度专注、全神贯注的状态，此时个人表现会达到最佳水平。心流状态通常出现在挑战难度与个人能力匹配时。培养进入心流的能力有助于提高工作效率和创造力。',
      principle: '当任务挑战难度与个人能力水平高度匹配时，人会进入全神贯注、忘记时间、享受其中的最优体验状态。',
      scope: '学习工作、创意创作、运动竞技、兴趣爱好',
      tips: '1. 调整任务难度，使其与当前能力“匹配”；2. 营造无干扰的环境，减少外界打断；3. 设定明确的目标和反馈机制；4. 保持专注，避免 multitasking。',
      practice: '1. 匹配难度：学习/工作时，选择“跳一跳够得着”的内容；2. 营造专注环境：关闭手机通知、找安静的房间、用番茄钟；3. 及时调整状态：若感到焦虑，降低任务难度；若感到无聊，提升难度；4. 记录心流体验，总结进入心流的条件和方法。'
    },
    { 
      id: 'windLaw', 
      name: 'windLaw', 
      label: '风阻定律', 
      icon: Zap, 
      description: '展示速度与阻力的关系', 
      deepAnalysis: '风阻定律指出，阻力与速度的平方成正比。这一规律提醒我们，随着事业的发展，遇到的阻力会呈指数级增长，需要不断提升能力才能保持前进。',
      principle: '阻力与速度的平方成正比，随着事业的发展，遇到的阻力会呈指数级增长。',
      scope: '职业发展、企业扩张、个人成长、目标实现',
      tips: '1. 认识到随着发展，阻力会越来越大；2. 提前做好应对阻力的准备；3. 不断提升自己的能力和资源；4. 保持谦虚和学习的态度。',
      practice: '1. 定期评估自己的能力和资源，是否能应对当前的阻力；2. 持续学习和提升，保持能力与发展速度匹配；3. 建立强大的支持网络，获得他人的帮助；4. 制定灵活的策略，适应不断变化的环境。'
    },
    { 
      id: 'zone', 
      name: 'zone', 
      label: '舒适区模型', 
      icon: Compass, 
      description: '展示舒适区、学习区和恐慌区的关系', 
      deepAnalysis: '舒适区模型将人的状态分为三个区域：舒适区（熟悉的环境和任务）、学习区（有挑战但可应对的任务）和恐慌区（超出能力范围的任务）。成长发生在学习区，我们需要不断挑战自己，扩大舒适区。',
      principle: '人的成长状态分为三层——舒适区（熟悉无压、成长停滞）、学习区（适度挑战、能力提升，是最优成长区间）、恐慌区（难度过高、易放弃，需降低目标难度）。',
      scope: '系统内任务难度分级、成长路径规划、技能学习节奏调整',
      tips: '1. 拒绝长期停留在舒适区“躺平”；2. 避免直接跳入恐慌区导致挫败；3. 以“学习区”为主要成长阵地，保持“微挑战”状态；4. 逐步拓展舒适区边界。',
      practice: '1. 状态自测：当执行任务感到“毫无压力”时，说明处于舒适区；感到“焦虑失眠、想逃避”时，说明处于恐慌区；2. 目标拆解：将恐慌区的大目标拆分为小任务，降低难度进入学习区；3. 梯度升级：在学习区稳定执行2-3周后，小幅提升任务难度，逐步拓展舒适区边界。'
    },
    { 
      id: 'woop', 
      name: 'woop', 
      label: 'WOOP框架', 
      icon: Target, 
      description: '展示WOOP目标设定方法', 
      deepAnalysis: 'WOOP是一种科学的目标设定方法，包括愿望（Wish）、结果（Outcome）、障碍（Obstacle）和计划（Plan）四个步骤。使用WOOP框架可以提高目标实现的成功率，帮助我们克服障碍。',
      principle: '目标执行四步走——W（Wish）明确愿望→O（Outcome）想象最佳结果→O（Obstacle）分析潜在障碍→P（Plan）制定应对计划，强化目标落地性。',
      scope: '系统的目标创建、任务拆解、习惯养成启动、长期项目推进',
      tips: '1. 愿望要具体可量化；2. 障碍要挖到深层原因；3. 计划要对应“障碍-解决方案”；4. 避免空泛的口号式目标。',
      practice: '1. 明确愿望：写下具体目标（如“我要在3个月内学会基础PS技能”，而非“我要学设计”）；2. 具象结果：想象目标达成后的场景，强化动机；3. 罗列障碍：梳理主观+客观障碍；4. 制定计划：针对每个障碍设计应对方案。'
    },
    { 
      id: 'peakEnd', 
      name: 'peakEnd', 
      label: '峰终定律', 
      icon: Activity, 
      description: '展示记忆形成的规律', 
      deepAnalysis: '峰终定律指出，人们对一段体验的记忆，仅由峰值时刻（最愉悦/最痛苦的瞬间）和结束时刻决定，与体验的总时长、中间平淡环节无关。',
      principle: '人们对一段体验的记忆，仅由峰值时刻（最愉悦/最痛苦的瞬间）和结束时刻决定，与体验的总时长、中间平淡环节无关。',
      scope: '系统的任务奖励设计、学习/工作体验优化、习惯坚持激励、流程化事项的体验升级',
      tips: '1. 重点强化峰值的正向反馈；2. 优化结束时刻的成就感；3. 忽略中间环节的琐碎平淡；4. 用“高光时刻”锚定体验记忆。',
      practice: '1. 峰值设计：在任务执行到50%时设置小奖励；2. 结束优化：任务完成后，做一个有仪式感的收尾动作；3. 规避低谷：把任务中最难、最枯燥的部分放在开头，结尾留简单轻松的内容。'
    },
    { 
      id: 'valueVenn', 
      name: 'valueVenn', 
      label: '价值三圈', 
      icon: Layers, 
      description: '展示激情、天赋和市场的交集', 
      deepAnalysis: '价值三圈模型指出，理想的职业或事业应该是激情、天赋和市场需求的交集。找到这个交集区域，才能实现个人价值和社会价值的最大化。',
      principle: '个人最优发展方向=能力圈（擅长的事/能学会的事）∩热情圈（喜欢做、能坚持的事）∩市场圈（有需求、能创造价值的事），三圈交集为高价值区。',
      scope: '系统的人生方向定位、技能学习选择、副业项目筛选、职业规划调整',
      tips: '1. 先确定热情圈（避免做不喜欢的事半途而废）；2. 再评估能力圈（能力可以后天提升）；3. 最后验证市场圈（需求决定价值变现）；4. 三圈交集为最优发展方向。',
      practice: '1. 三圈清单：分别列出三个维度的内容——能力圈、热情圈、市场圈；2. 找交集：圈出三个清单的重叠项；3. 补短板：若交集项能力不足，针对性学习；若市场需求弱，调整方向。'
    },
    { 
      id: 'purpose', 
      name: 'purpose', 
      label: '需求层次', 
      icon: Target, 
      description: '展示人类需求的五个层次', 
      deepAnalysis: '马斯洛需求层次理论将人类需求分为五个层次：生理需求、安全需求、社交需求、尊重需求和自我实现需求。需求是从低到高逐步满足的，高层次需求的满足能带来更持久的幸福感。',
      principle: '人的需求从低到高分为五层——生理需求（生存必需）→安全需求（稳定）→爱与归属需求（社交）→尊重需求（认可）→自我实现需求（成长）；底层需求满足后，才会主动追求上层需求。',
      scope: '系统的成就体系设计、用户激励机制制定、自我状态调节、目标优先级排序',
      tips: '1. 匹配当前需求层级设置目标和奖励；2. 避免底层需求未满足时，强行追求上层需求；3. 关注需求的动态变化；4. 高层次需求的满足能带来更持久的幸福感。',
      practice: '1. 需求自检：当感到“没动力”时，先排查底层需求；2. 分层激励：根据需求层级设计奖励；3. 系统应用：在人生游戏化系统中设置“需求解锁”机制；4. 关注他人的需求层次，提供适当的支持和帮助。'
    },
    { 
      id: 'johariWindow', 
      name: 'johariWindow', 
      label: '乔哈里视窗', 
      icon: Eye, 
      description: '展示自我认知与他人认知的关系', 
      deepAnalysis: '乔哈里视窗将自我认知分为四个区域：公开区（自己知道，他人也知道）、盲区（自己不知道，他人知道）、隐藏区（自己知道，他人不知道）、未知区（自己不知道，他人也不知道）。个人成长的本质是扩大公开区。',
      principle: '自我认知的四个象限——公开区（自己知道、别人也知道）、盲目区（自己不知道、别人知道）、隐藏区（自己知道、别人不知道）、未知区（自己和别人都不知道）；个人成长的本质是扩大公开区。',
      scope: '系统的自我复盘、人际沟通优化、能力提升规划、团队协作反馈',
      tips: '1. 通过“主动求反馈”缩小盲目区；2. 通过“自我暴露”缩小隐藏区；3. 通过“尝试新事物”探索未知区；4. 逐步扩大公开区，提升自我认知。',
      practice: '1. 求反馈：每周找1-2个信任的朋友/同事，问一个具体问题，定位盲目区；2. 自我暴露：在安全的环境中分享自己的小缺点/小恐惧，缩小隐藏区；3. 探未知：每月尝试一件从未做过的事，记录自己的感受和表现，发掘未知潜能。'
    },
    { 
      id: 'footInDoor', 
      name: 'footInDoor', 
      label: '登门槛效应', 
      icon: TrendingUp, 
      description: '展示请求难度与接受率的关系', 
      deepAnalysis: '登门槛效应指出，先让对方接受一个微小、容易完成的请求，再逐步提出更大的请求，对方接受的概率会大幅提升；同理，实现大目标的关键是从“踮脚就够得着”的小目标开始。',
      principle: '先让对方接受一个微小、容易完成的请求，再逐步提出更大的请求，对方接受的概率会大幅提升；同理，实现大目标的关键是从“踮脚就够得着”的小目标开始。',
      scope: '系统的习惯养成、困难任务启动、长期项目推进、行为改变引导',
      tips: '1. 第一步的“小目标”要足够低，低到“不用思考、没有阻力就能完成”；2. 逐步递进，不急于求成；3. 绑定习惯，形成条件反射；4. 及时给予正反馈。',
      practice: '1. 降低启动难度：想养成“每天跑步”的习惯→第一步设为“每天穿跑鞋出门走5分钟”；2. 逐步递进：坚持1周后，小幅提升目标难度；3. 绑定习惯：把小任务和日常动作绑定；4. 每完成一个小目标，给予自己奖励。'
    },
    { 
      id: 'deliberatePractice', 
      name: 'deliberatePractice', 
      label: '刻意练习', 
      icon: BrainCircuit, 
      description: '展示有效学习的方法', 
      deepAnalysis: '刻意练习是一种有目的、有反馈、走出舒适区的针对性练习，而非机械重复；关键是拆分技能、聚焦弱点、持续纠错，最终实现技能精通。',
      principle: '高效成长的核心是有目标、有反馈、走出舒适区的针对性练习，而非机械重复；关键是拆分技能、聚焦弱点、持续纠错，最终实现技能精通。',
      scope: '系统的技能深耕、专业能力提升、短板弥补、特长培养',
      tips: '1. 拒绝“重复劳动式练习”；2. 坚持“目标导向式练习”，每一次练习都要明确“要提升的具体点”；3. 及时获取反馈，避免闭门造车；4. 聚焦弱点，针对性提升。',
      practice: '1. 拆分技能：将目标技能拆分为最小单元；2. 针对性练习：聚焦当前最弱的子技能；3. 获得有效反馈：找领域内的高手指导，或对比优秀案例找差距；4. 根据反馈调整练习方法，而非重复错误。'
    },
    { 
      id: 'foggBehavior', 
      name: 'foggBehavior', 
      label: '福格行为模型', 
      icon: Activity, 
      description: '展示行为发生的三要素', 
      deepAnalysis: '福格行为模型指出，行为发生的三要素=动机（想做这件事的欲望）+能力（做这件事的难易程度）+触发（提醒做这件事的信号），三者同时满足，行为才会发生；缺少任何一个要素，行为都不会持续。',
      principle: '行为发生的三要素=动机（想做这件事的欲望）+能力（做这件事的难易程度）+触发（提醒做这件事的信号），三者同时满足，行为才会发生；缺少任何一个要素，行为都不会持续。',
      scope: '系统的习惯触发设计、行为改变引导、任务执行启动、行动力提升',
      tips: '1. 若行为没发生，优先从“能力”和“触发”入手调整（提升能力比提升动机更容易）；2. 降低行为难度，设置明确触发信号；3. 动机可以通过关联个人目标来强化；4. 保持触发信号的一致性和可见性。',
      practice: '1. 提升动机：把任务和个人目标关联；2. 降低能力门槛：简化行为步骤，减少阻力；3. 设置触发信号：用手机闹钟提醒、贴便签、和日常动作绑定；4. 及时反馈：行为发生后，给予正向反馈，强化行为。'
    },
    { 
      id: 'eisenhowerMatrix', 
      name: 'eisenhowerMatrix', 
      label: '艾森豪威尔矩阵', 
      icon: Scale, 
      description: '展示时间管理的四象限法则', 
      deepAnalysis: '艾森豪威尔矩阵将任务分为四类：重要且紧急（如突发工作、紧急问题，需立即做）、重要不紧急（如学习、健身、规划，需计划做，是核心优先级）、紧急不重要（如临时会议、无关紧要的消息，可授权做）、不重要不紧急（如刷短视频、闲聊，需少做或不做）。',
      principle: '按重要性和紧急性将任务分为四类——重要且紧急（需立即做）、重要不紧急（需计划做，是核心优先级）、紧急不重要（可授权做）、不重要不紧急（需少做或不做）。',
      scope: '系统的任务管理、时间规划、每日工作计划制定、优先级排序',
      tips: '1. 重点分配时间给“重要不紧急”的事；2. 避免被“紧急不重要”的事占据大量精力；3. 防止陷入“救火式”工作/生活状态；4. 学会授权和拒绝。',
      practice: '1. 每日列清单：早上花5分钟，把当天所有任务填入四象限表格，明确分类；2. 分配时间比例：70%时间做“重要不紧急”的事，20%时间处理“重要且紧急”的事，10%时间处理其他两类事；3. 学会授权和拒绝：把“紧急不重要”的事交给他人，拒绝“不重要不紧急”的事；4. 定期复盘：每周回顾时间分配情况，调整策略。'
    },
    { 
      id: 'growthMindset', 
      name: 'growthMindset', 
      label: '成长型思维', 
      icon: BrainCircuit, 
      description: '展示成长型思维与固定型思维的区别', 
      deepAnalysis: '成长型思维认为能力是可以通过努力提升的，拥抱挑战、不怕失败，把挫折看作成长的机会；固定型思维认为能力是天生固定的，害怕挑战、回避失败，把挫折看作对自己的否定。两种思维模式决定了人面对困难的态度和成长速度。',
      principle: '成长型思维认为能力是可以通过努力提升的，拥抱挑战、不怕失败，把挫折看作成长的机会；固定型思维认为能力是天生固定的，害怕挑战、回避失败，把挫折看作对自己的否定。',
      scope: '系统的心态引导、挫折应对、学习动力激发、失败复盘激励',
      tips: '1. 用“成长型语言”替代“固定型语言”，重塑思维习惯；2. 遇到失败时，关注“过程和改进”，而非“天赋和结果”；3. 拥抱挑战，把困难看作成长的机会；4. 奖励努力过程，而非天赋和成功。',
      practice: '1. 语言替换训练：把固定型语言换成成长型语言——“我不行”→“我还没学会”；“这太难了”→“这是挑战，我可以试试”；“我失败了”→“我从这次经历中学到了…”；2. 拥抱挫折：遇到失败时，不否定自己，而是分析“哪里做得不好”“下次如何改进”；3. 奖励努力过程：奖励自己的“坚持和付出”，而非“天赋和成功”。'
    },
    { 
      id: 'sunkCost', 
      name: 'sunkCost', 
      label: '沉没成本谬误', 
      icon: TrendingDown, 
      description: '展示沉没成本对决策的影响', 
      deepAnalysis: '沉没成本谬误是指人们因已经投入的不可收回的成本（时间、金钱、精力），而继续坚持无意义的事情，忽略未来的收益和损失；理性决策的核心是“忽略沉没成本，只看未来价值”。',
      principle: '人们因已经投入的不可收回的成本（时间、金钱、精力），而继续坚持无意义的事情，忽略未来的收益和损失；理性决策的核心是“忽略沉没成本，只看未来价值”。',
      scope: '系统的任务止损机制、目标调整、决策优化、避免内耗',
      tips: '1. 做决策时，问自己“继续做这件事，能带来我想要的结果吗？”，而非“我已经投入了这么多，放弃太可惜了”；2. 记住“沉没成本不是成本”；3. 及时止损，避免更大的损失；4. 关注未来的机会成本，而非过去的投入。',
      practice: '1. 止损三问法：当纠结是否放弃时，问自己三个问题——① 继续做这件事，能实现我的目标吗？② 放弃这件事，我会失去什么？③ 把时间/精力投入其他事，收益会更高吗？；2. 及时止损：若答案是否定的，立刻放弃；3. 不纠结过去：不要因“已经投入”而继续内耗，把目光放在未来的选择上。'
    },
    { 
      id: 'pareto', 
      name: 'pareto', 
      label: '二八定律', 
      icon: PieChart, 
      description: '展示关键少数与次要多数的关系', 
      deepAnalysis: '二八定律（帕累托法则）指出，80%的结果由20%的关键行动产生，其余80%的行动只带来20%的结果；核心是抓大放小，聚焦核心关键动作，而非平均用力。',
      principle: '80%的结果由20%的关键行动产生，其余80%的行动只带来20%的结果；核心是抓大放小，聚焦核心关键动作，而非平均用力。',
      scope: '系统的任务优先级筛选、效率提升、资源分配、学习/工作优化',
      tips: '1. 通过复盘找到产生核心结果的“20%关键动作”；2. 把80%的时间和精力投入其中；3. 砍掉或简化对结果影响小的80%动作；4. 持续优化，找到最核心的关键动作。',
      practice: '1. 复盘找关键：回顾过去1-2周的任务，列出所有行动，分析哪些行动带来了最大的结果；2. 聚焦关键动作：把80%的时间花在20%关键动作上；3. 删减无效动作：砍掉对结果影响小的动作；4. 定期重新评估关键动作，确保其仍然有效。'
    },
    // 新增决策规划类图表
    { 
      id: 'swot', 
      name: 'swot', 
      label: 'SWOT分析', 
      icon: Square, 
      description: '从优势、劣势、机会、威胁四个维度评估目标可行性', 
      deepAnalysis: 'SWOT分析从优势（自身擅长资源）、劣势（自身短板不足）、机会（外部有利条件）、威胁（外部风险挑战）四个维度，全面评估个人目标、项目或选择的可行性。核心逻辑是：优势+机会=核心发力点，劣势+威胁=风险规避重点。',
      principle: '从优势（Strengths）、劣势（Weaknesses）、机会（Opportunities）、威胁（Threats）四个维度，全面评估个人目标、项目或选择的可行性，核心是优势+机会=核心发力点，劣势+威胁=风险规避重点。',
      scope: '人生游戏化系统的「目标立项评估」「年度规划复盘」「项目可行性分析」「职业方向选择」模块',
      tips: '1. 优势和劣势聚焦内部因素，机会和威胁聚焦外部因素；2. 分析时要具体、可量化，避免空泛描述；3. 优先放大“优势+机会”的组合，同时制定“劣势+威胁”的应对预案。',
      practice: '1. 列四象限清单：针对目标分别列出优势、劣势、机会、威胁；2. 找核心策略：优势+机会→核心发力点，劣势+威胁→风险规避重点；3. 落地执行：把策略拆解为具体任务，并设置风险预警。'
    },
    { 
      id: 'goldenCircle', 
      name: 'goldenCircle', 
      label: '黄金圈法则', 
      icon: Target, 
      description: '从Why-How-What的顺序思考问题', 
      deepAnalysis: '黄金圈法则遵循从内到外的思考顺序——先明确Why（动机/初心/价值观），再梳理How（方法/路径/策略），最后落地What（具体事项/行动步骤）。核心是打破“先做后想”的低效逻辑，让行动匹配底层动机。',
      principle: '遵循从内到外的思考顺序——先明确Why（为什么做，动机/初心/价值观），再梳理How（怎么做，方法/路径/策略），最后落地What（做什么，具体事项/行动步骤），让行动匹配底层动机。',
      scope: '系统内「任务创建」「长期目标拆解」「习惯养成启动」「项目方向定位」环节',
      tips: '1. Why要挖到深层动机，而非表面理由；2. How要具体可落地；3. What要对应How拆解，避免“动机高大上，行动无抓手”。',
      practice: '1. 明确Why：针对目标追问深层动机；2. 梳理How：基于Why设计具体路径；3. 落地What：把How拆成具体动作；4. 系统绑定：在系统中把Why置顶，每次完成What后关联Why复盘。'
    },
    { 
      id: 'fiveWhys', 
      name: 'fiveWhys', 
      label: '5Why分析法', 
      icon: Search, 
      description: '连续追问5个为什么，找到问题根本原因', 
      deepAnalysis: '5Why分析法针对一个问题，连续追问5个“为什么”，层层剥离表面现象，找到问题的根本原因，而非只解决表层症状。核心是“打破砂锅问到底”，避免治标不治本。',
      principle: '针对一个问题，连续追问5个“为什么”，层层剥离表面现象，找到问题的根本原因，避免治标不治本。',
      scope: '系统的「任务失败复盘」「习惯中断分析」「问题根源定位」「流程优化改进」模块',
      tips: '1. 每个“为什么”的答案要基于事实，而非主观猜测；2. 追问次数不局限于5次，直到找到根本原因；3. 避免问宽泛的问题，要问具体的问题。',
      practice: '1. 提出问题：针对具体问题（如“本周跑步习惯中断了”）；2. 连续追问：层层剥离表面现象；3. 找到根本原因：定位问题核心；4. 制定解决方案：针对根本原因实施改进。'
    },
    // 新增行为习惯类图表
    { 
      id: 'brokenWindow', 
      name: 'brokenWindow', 
      label: '破窗效应', 
      icon: Square, 
      description: '小破损若不修复，会引发更多破坏行为', 
      deepAnalysis: '破窗效应指出，环境中的“小破损”若不及时修复，会引发更多破坏行为；同理，个人成长中，一个小的不良习惯若不纠正，会导致更多自律崩塌。反之，维护好“第一扇窗”，能正向强化秩序感。',
      principle: '环境中的“小破损”若不及时修复，会引发更多破坏行为；个人成长中，一个小的不良习惯若不纠正，会导致更多自律崩塌。',
      scope: '系统的「习惯打卡」「自律监督」「行为规范」模块',
      tips: '1. 重视“第一次破例”，及时修复“小破损”；2. 通过“正向强化”维护好的习惯；3. 对不良习惯的“第一次发生”零容忍。',
      practice: '1. 设置“破窗预警线”：给核心习惯设置预警，一旦破例立刻触发补救措施；2. 维护“第一扇窗”：坚持核心习惯的连续性；3. 正向强化秩序：连续坚持习惯一定时间后给予奖励。'
    },
    { 
      id: 'matthewEffect', 
      name: 'matthewEffect', 
      label: '马太效应', 
      icon: TrendingUp, 
      description: '强者愈强，弱者愈弱，初始微小优势持续放大', 
      deepAnalysis: '马太效应指出，强者愈强，弱者愈弱，初始的微小优势，会通过持续积累不断放大，形成滚雪球效应。核心是“聚焦优势，持续投入”，让小优势变成大优势。',
      principle: '强者愈强，弱者愈弱，初始的微小优势，会通过持续积累不断放大，形成滚雪球效应，核心是聚焦优势，持续投入。',
      scope: '系统的「成就累积」「优势强化」「技能深耕」「资源整合」模块',
      tips: '1. 找到自己的“核心优势”，而非分散精力；2. 在优势领域持续投入，让优势越来越明显；3. 借助系统的“成就复利”机制，放大优势带来的收益。',
      practice: '1. 定位核心优势：通过“优势测评”找到核心优势；2. 持续投入强化：把80%的时间和精力投入到优势领域；3. 放大优势效应：设置“优势成就链”，让优势带来的收益持续滚雪球。'
    },
    { 
      id: 'hedgehogPrinciple', 
      name: 'hedgehogPrinciple', 
      label: '刺猬法则', 
      icon: Shield, 
      description: '人与人之间需要保持合适的距离', 
      deepAnalysis: '刺猬法则指出，人与人之间需要保持合适的“距离”，距离太近易产生矛盾、疲惫感，太远则缺乏联结、动力不足。引申到自我管理，核心是平衡“专注投入”与“适度松弛”的关系，避免过度消耗。',
      principle: '人与人之间（或人与目标之间）需要保持合适的“距离”，核心是平衡“专注投入”与“适度松弛”的关系，避免过度消耗。',
      scope: '系统的「任务节奏调节」「社交互动设置」「工作生活平衡」模块',
      tips: '1. 针对目标，找到“专注投入”和“适度松弛”的平衡点；2. 避免“过度内卷”或“过度躺平”；3. 在系统中设置“专注时段”和“松弛时段”，强制切换状态。',
      practice: '1. 设置“专注-松弛”时段：规划每日时间，如上午专注工作，下午松弛休息；2. 目标距离管理：针对长期目标，保持合适的投入节奏；3. 社交距离适配：在社交模块中设置合适的互动频率。'
    },
    // 新增认知思维类图表
    { 
      id: 'survivorshipBias', 
      name: 'survivorshipBias', 
      label: '幸存者偏差', 
      icon: Eye, 
      description: '只关注成功案例，忽略失败样本', 
      deepAnalysis: '幸存者偏差指只关注“幸存下来”的成功案例，忽略那些被淘汰的失败样本，从而得出片面、错误的结论。核心是“看不见的弹痕最致命”，要全面看待样本。',
      principle: '只关注“幸存下来”的成功案例，忽略那些被淘汰的失败样本，从而得出片面、错误的结论，核心是要全面看待样本。',
      scope: '系统的「成长案例库」「经验分享」「认知纠偏」模块',
      tips: '1. 看到成功案例时，多问“那些失败的人都做了什么？”；2. 不要盲目模仿成功人士的行为，要分析其背后的条件；3. 同时关注“成功案例”和“失败案例”，形成对比。',
      practice: '1. 案例双视角分析：学习成功案例时，主动查找同类失败案例，对比分析差异；2. 追问背后的条件：分析成功案例的必备条件，判断自己是否具备；3. 避免“幸存者陷阱”：设置“认知纠偏”提醒。'
    },
    { 
      id: 'occamsRazor', 
      name: 'occamsRazor', 
      label: '奥卡姆剃刀原理', 
      icon: Lightbulb, 
      description: '如无必要，勿增实体，化繁为简', 
      deepAnalysis: '奥卡姆剃刀原理指出，如无必要，勿增实体。即对同一问题的多种解释或解决方案，选择最简单、假设最少、步骤最少的那个，剔除冗余复杂的部分。核心是“化繁为简”，避免过度复杂化。',
      principle: '如无必要，勿增实体。对同一问题的多种解释或解决方案，选择最简单、假设最少、步骤最少的那个，剔除冗余复杂的部分。',
      scope: '系统的「任务流程优化」「目标拆解简化」「方法工具筛选」「决策效率提升」环节',
      tips: '1. 面对复杂任务，先问“有没有更简单的方法？”；2. 剔除所有“不必要的步骤、工具、流程”；3. 聚焦核心目标，避免“为了复杂而复杂”。',
      practice: '1. 流程简化：梳理现有步骤，剔除不必要的环节；2. 目标拆解简化：把大目标拆解为“最小可行任务”；3. 工具筛选简化：选择功能单一、操作简单的工具。'
    },
    { 
      id: 'anchoringEffect', 
      name: 'anchoringEffect', 
      label: '锚定效应', 
      icon: Target, 
      description: '人们做决策时，会过度依赖第一印象或锚点', 
      deepAnalysis: '锚定效应指出，人们做决策时，会过度依赖第一印象或“锚点”（如第一次看到的价格、初始设定的目标、他人的评价），从而影响后续的判断和行为。核心是“锚点决定心理预期”，可以利用锚定效应提升行动力，也可以避免被锚点误导。',
      principle: '人们做决策时，会过度依赖第一印象或“锚点”，从而影响后续的判断和行为，核心是锚点决定心理预期。',
      scope: '系统的「目标制定」「奖励设置」「习惯养成」「决策辅助」模块',
      tips: '1. 设置积极的锚点，降低行动门槛；2. 避免消极的锚点，防止打击信心；3. 在系统中主动设置“锚点提示”，引导正向决策。',
      practice: '1. 设置积极锚点：制定目标时，先设置一个“容易达成的小锚点”；2. 奖励锚点设置：用“第一次奖励”作为锚点，后续奖励围绕这个锚点递增；3. 避免消极锚点：不要把“别人的高目标”作为自己的锚点。'
    },
    // 新增学习成长类图表
    { 
      id: 'tenThousandHours', 
      name: 'tenThousandHours', 
      label: '一万小时定律', 
      icon: Timer, 
      description: '成为某一领域专家，需要约一万小时的刻意练习', 
      deepAnalysis: '一万小时定律指出，要成为某一领域的专家，需要经过约一万小时的刻意练习。核心是“刻意”而非“重复”——练习必须有目标、有反馈、走出舒适区，而非机械地重复劳动。',
      principle: '要成为某一领域的专家，需要经过约一万小时的刻意练习，核心是“刻意”而非“重复”，即有目标、有反馈、走出舒适区的针对性练习。',
      scope: '系统的「技能修炼」「长期能力培养」「专家路径规划」「练习时长记录」模块',
      tips: '1. 把一万小时拆解为阶段性小目标，避免被庞大的数字吓倒；2. 每一个阶段的练习都要聚焦“刻意”，而非“磨时间”；3. 及时记录练习时长，设置里程碑奖励。',
      practice: '1. 拆解一万小时目标：针对技能，拆解为入门、熟练、精通、专家四个阶段；2. 刻意练习执行：每个阶段的练习都要有目标、有反馈；3. 系统记录与激励：设置“练习时长记录”功能，完成阶段目标给予勋章奖励。'
    },
    { 
      id: 'feynmanTechnique', 
      name: 'feynmanTechnique', 
      label: '费曼学习法', 
      icon: MessageCircle, 
      description: '以教促学，通过讲解检验掌握程度', 
      deepAnalysis: '费曼学习法以教促学，核心是通过把知识讲给别人听，检验自己是否真的掌握。如果讲不明白，说明自己理解得不够透彻，需要回头查漏补缺；同时，要把复杂的概念简化，用通俗的语言输出。',
      principle: '以教促学，通过把知识讲给别人听，检验自己是否真的掌握，核心是用通俗的语言解释复杂概念。',
      scope: '系统的「知识复盘」「学习笔记」「技能输出」「教学分享」模块',
      tips: '1. 选择一个知识点，假设要讲给一个完全不懂的人听；2. 如果讲卡壳了，立刻回到书本重新学习；3. 用“自己的语言”而非“书本的语言”解释概念，避免死记硬背。',
      practice: '1. 选择知识点：从当天学习的内容中，选择一个核心知识点；2. 模拟教学：写下要讲给别人的内容，要求用大白话解释；3. 查漏补缺：针对讲不明白的地方重新学习；4. 优化输出：分享内容到学习社区，获取反馈。'
    },
    { 
      id: 'spacedRepetition', 
      name: 'spacedRepetition', 
      label: '间隔重复记忆法', 
      icon: Repeat, 
      description: '根据遗忘曲线，在知识快要遗忘时进行重复复习', 
      deepAnalysis: '间隔重复记忆法根据艾宾浩斯遗忘曲线，在知识快要遗忘时进行重复复习，而非一次性死记硬背，这样能最大化提升记忆效率，延长记忆留存时间。核心是“在最佳时间点复习”。',
      principle: '根据艾宾浩斯遗忘曲线，在知识快要遗忘时进行重复复习，而非一次性死记硬背，最大化提升记忆效率，延长记忆留存时间。',
      scope: '系统的「知识点打卡」「习惯巩固」「单词背诵」「公式记忆」模块',
      tips: '1. 根据遗忘曲线，设置合理的复习间隔；2. 每次复习的时间不宜过长，重点是“唤醒记忆”；3. 在系统中设置自动复习提醒，避免错过最佳复习时间。',
      practice: '1. 学习与记录：学习知识点后，记录学习时间；2. 设置复习间隔：系统根据遗忘曲线自动设置复习时间；3. 执行复习：到复习时间时，花1-2分钟回顾知识点；4. 调整间隔：根据复习情况动态调整间隔时间。'
    },
    // 新增实用思维模型
    // 决策规划类
    { 
      id: 'probabilityThinking', 
      name: 'probabilityThinking', 
      label: '概率思维', 
      icon: BarChart2, 
      description: '量化不同选择的成功概率，结合收益和风险做最优决策', 
      deepAnalysis: '概率思维认为任何决策和结果都存在概率性，不是非黑即白。核心是量化不同选择的成功概率，结合收益和风险做最优决策，而非追求“绝对正确”。',
      principle: '任何决策和结果都存在概率性，核心是量化不同选择的成功概率，结合收益和风险做最优决策，而非追求“绝对正确”。',
      scope: '系统的「风险项目选择」「目标成功率评估」「资源分配优化」模块',
      tips: '1. 区分“大概率事件”和“小概率事件”；2. 优先投入资源到成功率高、收益合理的选项；3. 接受小概率失败的可能，做好风险预案。',
      practice: '1. 针对不同选项，列出各自成功要素；2. 评估自身匹配度，计算成功率；3. 选择成功率高的选项，并设置风险预案。'
    },
    { 
      id: 'regretMinimization', 
      name: 'regretMinimization', 
      label: '后悔最小化原则', 
      icon: Clock, 
      description: '以终为始，用未来视角倒推当下选择', 
      deepAnalysis: '后悔最小化原则认为，做决策时，不纠结“哪个选择最好”，而是思考“哪个选择在未来后悔的概率最小”。核心是以终为始，用未来视角倒推当下选择。',
      principle: '做决策时，不纠结“哪个选择最好”，而是思考“哪个选择在未来后悔的概率最小”，核心是以终为始，用未来视角倒推当下选择。',
      scope: '系统的「人生重大选择」「长期目标决策」模块',
      tips: '1. 想象5年后的自己，回看当下的选择；2. 排除那些“短期舒适、长期后悔”的选项；3. 制定保底计划，降低风险。',
      practice: '1. 想象两种选择的未来场景；2. 评估哪种场景后悔概率更小；3. 选择后悔概率小的选项，并制定保底计划。'
    },
    // 行为习惯类
    { 
      id: 'identityTheory', 
      name: 'identityTheory', 
      label: '身份认同理论', 
      icon: User, 
      description: '通过身份认同的转变来养成习惯', 
      deepAnalysis: '身份认同理论认为，真正的习惯养成，不是靠“坚持”，而是靠身份认同的转变。当你从“我要减肥”变成“我是一个健康饮食的人”，行为会自然贴合身份。',
      principle: '真正的习惯养成，不是靠“坚持”，而是靠身份认同的转变，当行为和身份保持一致时，习惯会自然形成。',
      scope: '系统的「深度习惯养成」「自我认知重塑」模块',
      tips: '1. 用“身份标签”替代“目标标签”；2. 通过小行为强化身份认同；3. 让行为和身份保持一致。',
      practice: '1. 用“身份标签”替代“目标标签”；2. 通过小行为强化身份认同；3. 让行为和身份保持一致。'
    },
    { 
      id: 'zeigarnikEffect', 
      name: 'zeigarnikEffect', 
      label: '蔡加尼克效应', 
      icon: RefreshCw, 
      description: '利用未完成的张力提升行动力', 
      deepAnalysis: '蔡加尼克效应认为，人对未完成的任务印象更深刻，会产生一种“完成欲”，驱动自己去做完。核心是利用这种“未完成的张力”，提升行动力。',
      principle: '人对未完成的任务印象更深刻，会产生一种“完成欲”，驱动自己去做完，核心是利用这种“未完成的张力”提升行动力。',
      scope: '系统的「任务启动激励」「拖延症破解」「长期项目推进」模块',
      tips: '1. 面对不想做的任务，先做“5分钟启动动作”；2. 把大项目拆分成多个小任务，保持“总有未完成任务”的张力；3. 利用完成欲驱动行动。',
      practice: '1. 先做“5分钟启动动作”，制造未完成状态；2. 把大项目拆分成多个小任务；3. 利用完成欲驱动行动。'
    },
    // 认知思维类
    { 
      id: 'grayThinking', 
      name: 'grayThinking', 
      label: '灰度思维', 
      icon: Scale, 
      description: '拒绝极端化思考，承认事物的复杂性和不确定性', 
      deepAnalysis: '灰度思维认为，世界不是非黑即白的二元对立，而是存在大量的“灰度地带”。核心是拒绝极端化思考，承认事物的复杂性和不确定性，用更灵活的视角看待问题。',
      principle: '世界不是非黑即白的二元对立，而是存在大量的“灰度地带”，核心是拒绝极端化思考，承认事物的复杂性和不确定性。',
      scope: '系统的「认知纠偏」「人际矛盾处理」「问题分析」模块',
      tips: '1. 遇到问题时，避免说“要么这样，要么那样”；2. 多思考“有没有第三种可能”；3. 接受“好中有坏，坏中有好”的现实。',
      practice: '1. 拒绝极端化思考；2. 多思考“有没有第三种可能”；3. 接受“好中有坏，坏中有好”的现实。'
    },
    { 
      id: 'reverseThinking', 
      name: 'reverseThinking', 
      label: '逆向思维', 
      icon: ArrowLeftRight, 
      description: '从问题的对立面出发，反向推导解决方案', 
      deepAnalysis: '逆向思维又称反向思维，是指从问题的对立面出发，反向推导解决方案，而非顺着常规思路思考。核心是“反其道而行之”，解决常规思维难以突破的问题。',
      principle: '从问题的对立面出发，反向推导解决方案，而非顺着常规思路思考，核心是“反其道而行之”。',
      scope: '系统的「创新方案设计」「问题解决」「目标达成路径规划」模块',
      tips: '1. 遇到“如何做到A”的问题，先思考“如何避免非A”；2. 把目标倒过来，从终点倒推起点；3. 明确每一步的关键动作。',
      practice: '1. 从问题的对立面出发思考；2. 把目标倒过来，从终点倒推起点；3. 明确每一步的关键动作。'
    },
    // 学习成长类
    { 
      id: 'riaReading', 
      name: 'riaReading', 
      label: 'RIA阅读法', 
      icon: BookOpen, 
      description: '把知识转化为行动的高效阅读法', 
      deepAnalysis: 'RIA阅读法是一种高效的“拆书法”，分为三个步骤——R（阅读）读原文片段、I（讲解）用自己的话复述原文、A（应用）联系实际制定行动方案。核心是“把知识转化为行动”，而非死记硬背。',
      principle: 'RIA阅读法分为R（阅读）、I（讲解）、A（应用）三个步骤，核心是“把知识转化为行动”，而非死记硬背。',
      scope: '系统的「深度阅读」「知识转化」「读书笔记」模块',
      tips: '1. 选择书中的核心观点片段，而非整本书逐字阅读；2. I环节要脱离原文，用自己的语言解释；3. A环节必须制定具体、可落地的行动。',
      practice: '1. R（阅读）：读原文片段；2. I（讲解）：用自己的话复述；3. A（应用）：联系实际制定行动方案。'
    },
    { 
      id: 'feedbackLoop', 
      name: 'feedbackLoop', 
      label: '反馈闭环原理', 
      icon: Repeat, 
      description: '建立“行动→反馈→调整→再行动”的闭环', 
      deepAnalysis: '反馈闭环原理认为，学习和成长的核心是建立“行动→反馈→调整→再行动”的闭环。没有反馈的行动是盲目的，只有通过反馈不断调整，才能持续进步。',
      principle: '学习和成长的核心是建立“行动→反馈→调整→再行动”的闭环，只有通过反馈不断调整，才能持续进步。',
      scope: '系统的「技能学习」「习惯优化」「项目改进」模块',
      tips: '1. 主动寻求高质量反馈；2. 反馈要具体、可量化；3. 根据反馈及时调整行动。',
      practice: '1. 行动：执行任务或学习；2. 反馈：寻求具体、可量化的反馈；3. 调整：根据反馈调整行动；4. 再行动：重复闭环，持续进步。'
    },
    // 效率管理类
    { 
      id: 'eisenhowerAdvanced', 
      name: 'eisenhowerAdvanced', 
      label: '艾森豪威尔矩阵进阶版', 
      icon: PieChart, 
      description: '加入影响力维度的任务优先级管理', 
      deepAnalysis: '艾森豪威尔矩阵进阶版在“重要性-紧急性”基础上，加入影响力维度，将任务分为“高重要+高影响力”“高重要+低影响力”“低重要+高影响力”“低重要+低影响力”四类。核心是优先做“高重要+高影响力”的事，放大时间投入的回报。',
      principle: '在“重要性-紧急性”基础上，加入影响力维度，核心是优先做“高重要+高影响力”的事，放大时间投入的回报。',
      scope: '系统的「任务优先级升级」「时间价值最大化」模块',
      tips: '1. 影响力指“一件事完成后，对长期目标的推动作用”；2. 高影响力的事往往是“做一次，受益很久”的事；3. 优先做“高重要+高影响力”的事。',
      practice: '1. 评估任务的重要性和影响力；2. 分类为四类任务；3. 优先做“高重要+高影响力”的事。'
    },
    { 
      id: 'energyManagement', 
      name: 'energyManagement', 
      label: '能量管理法', 
      icon: Battery, 
      description: '通过能量平衡提升效率', 
      deepAnalysis: '能量管理法认为，人的精力和能量是有限的，比时间管理更重要的是能量管理。核心是通过“充电”和“放电”的平衡，保持高能量状态，提升效率。',
      principle: '人的精力和能量是有限的，比时间管理更重要的是能量管理，核心是通过“充电”和“放电”的平衡，保持高能量状态。',
      scope: '系统的「精力管理」「工作生活平衡」「疲劳恢复」模块',
      tips: '1. 识别自己的“高能量时段”；2. 任务匹配：高能量时段做高难度任务；3. 及时充电：感到疲劳时，针对性补充能量。',
      practice: '1. 记录自己的能量曲线；2. 任务匹配：高能量时段做高难度任务；3. 及时充电：感到疲劳时，针对性补充能量。'
    },
    // 新增高频实用思维模型
    // 决策规划类
    { 
      id: 'prospectTheory', 
      name: 'prospectTheory', 
      label: '前景理论', 
      icon: TrendingUp, 
      description: '人在面对收益和损失时的决策偏差', 
      deepAnalysis: '前景理论认为，人在面对收益时倾向于保守规避风险，面对损失时倾向于冒险追逐风险；且同等金额的损失带来的痛苦，远大于收益带来的快乐。核心是人的决策并非完全理性，会受心理预期和参照点影响。',
      principle: '人在面对收益时倾向于保守规避风险，面对损失时倾向于冒险追逐风险；同等金额的损失带来的痛苦远大于收益带来的快乐，决策受心理预期和参照点影响。',
      scope: '系统的「风险决策评估」「目标激励设计」「损失规避预案」模块',
      tips: '1. 设计奖励时，强调“确定的小收益”；2. 规避损失时，突出“不行动会导致的确定损失”；3. 设置合理的参照点。',
      practice: '1. 用确定收益驱动行动：“完成目标保底得800元，超额完成额外加200元”；2. 利用损失厌恶推动执行：“不完成任务，之前投入的50小时努力就会白费”。'
    },
    { 
      id: 'weightedDecisionMatrix', 
      name: 'weightedDecisionMatrix', 
      label: '加权决策矩阵', 
      icon: BarChart, 
      description: '量化模糊决策，减少主观偏见', 
      deepAnalysis: '加权决策矩阵针对多个决策选项，设定关键评估维度并赋予权重，对每个选项在各维度上打分，通过加权计算总分，选出最优解。核心是量化模糊决策，减少主观偏见。',
      principle: '针对多个决策选项，设定关键评估维度并赋予权重，对每个选项在各维度上打分，通过加权计算总分，选出最优解，核心是量化模糊决策，减少主观偏见。',
      scope: '系统的「多选项对比决策」「方案筛选」「资源分配优先级」模块',
      tips: '1. 评估维度要和目标强相关；2. 权重分配要贴合自身核心需求；3. 打分要客观，避免凭感觉。',
      practice: '1. 设定维度及权重：收入稳定性（40%）、时间灵活性（30%）、兴趣匹配度（20%）、成长空间（10%）；2. 对选项打分；3. 计算加权分，选出最优解。'
    },
    // 行为习惯类
    { 
      id: 'feedbackPeakLaw', 
      name: 'feedbackPeakLaw', 
      label: '反馈峰值定律', 
      icon: Zap, 
      description: '在峰值和结束时刻给予强反馈，强化行为记忆', 
      deepAnalysis: '反馈峰值定律结合峰终定律和即时反馈，在行为执行的峰值时刻和结束时刻给予强反馈，能最大化强化行为记忆；反馈越及时、越具体，行为重复的概率越高。',
      principle: '在行为执行的峰值时刻和结束时刻给予强反馈，能最大化强化行为记忆；反馈越及时、越具体，行为重复的概率越高。',
      scope: '系统的「习惯强化」「任务激励」「学习反馈」模块',
      tips: '1. 峰值反馈要和行为强关联；2. 结束反馈要带有成就感；3. 避免延迟反馈和模糊反馈。',
      practice: '1. 峰值时刻奖励：跑步突破5公里时立刻领取勋章；2. 结束时刻反馈：生成“距离+时长+消耗卡路里”的报告；3. 具体学习反馈：“正确率85%，比上次提升10%”。'
    },
    { 
      id: 'environmentDesign', 
      name: 'environmentDesign', 
      label: '环境设计法则', 
      icon: Layout, 
      description: '主动设计利于习惯的环境，破坏利于坏习惯的环境', 
      deepAnalysis: '环境设计法则认为，人的行为会被环境潜移默化影响，想要养成好习惯，就要主动设计利于习惯的环境；想要戒掉坏习惯，就要破坏利于坏习惯的环境。核心是“让好习惯显而易见，让坏习惯隐藏不见”。',
      principle: '人的行为会被环境潜移默化影响，核心是“让好习惯显而易见，让坏习惯隐藏不见”。',
      scope: '系统的「习惯环境搭建」「行为触发优化」模块',
      tips: '1. 从“视觉、触达、便利度”三个维度设计环境；2. 最小化阻力，让好习惯触手可及；3. 隔离坏习惯触发源。',
      practice: '1. 养成专注学习习惯：书桌只放学习资料，移除干扰物；2. 戒掉睡前刷手机：手机放卧室门外，用实体闹钟替代。'
    },
    // 认知思维类
    { 
      id: 'frameRefactoring', 
      name: 'frameRefactoring', 
      label: '框架重构思维', 
      icon: RefreshCw, 
      description: '切换视角、重新定义问题，构建新的思考框架', 
      deepAnalysis: '框架重构思维认为，当一个问题用现有框架无法解决时，通过切换视角、调整边界、重新定义问题，构建新的思考框架，从而找到突破口。核心是“不破不立，重构问题比解决问题更重要”。',
      principle: '当现有框架无法解决问题时，通过切换视角、调整边界、重新定义问题，构建新的思考框架，核心是“不破不立，重构问题比解决问题更重要”。',
      scope: '系统的「瓶颈突破」「创新思考」「问题重新定义」模块',
      tips: '1. 问自己“这个问题的本质是什么？”；2. 切换身份思考；3. 打破固有框架的边界。',
      practice: '1. 从“如何写出爆款文案”重构为“如何用文案解决用户的一个小痛点”；2. 切换身份，从“文案创作者”变成“用户”；3. 聚焦用户的实际需求，而非追求“爆款”。'
    },
    { 
      id: 'knowledgeCrystallization', 
      name: 'knowledgeCrystallization', 
      label: '知识晶体化模型', 
      icon: Diamond, 
      description: '将零散知识结构化、关联化、可视化', 
      deepAnalysis: '知识晶体化模型认为，零散的知识容易遗忘，只有把知识结构化、关联化、可视化，形成“知识晶体”（如模型、框架、思维导图），才能真正内化吸收。核心是“知识的价值在于关联，而非堆积”。',
      principle: '零散的知识容易遗忘，只有把知识结构化、关联化、可视化，形成“知识晶体”，才能真正内化吸收，核心是“知识的价值在于关联，而非堆积”。',
      scope: '系统的「知识体系构建」「学习笔记整理」「技能整合」模块',
      tips: '1. 思考“它和我已有的知识有什么关联？”；2. 用模型/框架概括知识；3. 用思维导图、卡片盒等工具晶体化知识。',
      practice: '1. 学习“复利效应”后，关联“习惯养成”“投资理财”，构建“复利思维应用框架”；2. 用卡片盒记录，每张卡片标注关联的其他卡片，形成知识网络。'
    },
    // 学习成长类
    { 
      id: 'metaLearning', 
      name: 'metaLearning', 
      label: '元学习法', 
      icon: BookOpen, 
      description: '学习如何学习，掌握学习的规律和策略', 
      deepAnalysis: '元学习是“学习如何学习”的底层方法，核心是掌握学习的规律、策略和工具，提升学习效率。包括“明确学习目标、选择合适方法、及时反馈调整、优化学习环境”四个核心环节。',
      principle: '元学习是“学习如何学习”的底层方法，核心是掌握学习的规律、策略和工具，提升学习效率，包括明确目标、选择方法、反馈调整、优化环境四个核心环节。',
      scope: '系统的「学习策略优化」「高效学习方法」「技能学习路径」模块',
      tips: '1. 学习前先研究“这个领域的高手是怎么学的”；2. 定期复盘学习方法；3. 保留高效策略，淘汰低效策略。',
      practice: '1. 明确目标：“能用Python做简单的数据处理”；2. 选择方法：“视频课+实操练习+社群提问”；3. 反馈调整：每学完一个章节，做小项目检验效果；4. 优化环境：利用早上高精力时段学新课。'
    },
    { 
      id: 'crossDomainLearning', 
      name: 'crossDomainLearning', 
      label: '跨界学习模型', 
      icon: GitMerge, 
      description: '从不同领域吸收知识，迁移到核心领域', 
      deepAnalysis: '跨界学习模型指从不同领域吸收知识和思维方式，迁移到自己的核心领域，从而产生创新突破。核心是“他山之石，可以攻玉”，不同领域的知识能碰撞出意想不到的火花。',
      principle: '从不同领域吸收知识和思维方式，迁移到自己的核心领域，从而产生创新突破，核心是“他山之石，可以攻玉”。',
      scope: '系统的「创新能力培养」「跨领域知识迁移」「核心技能升级」模块',
      tips: '1. 选择和核心领域有“底层逻辑相通”的领域；2. 重点关注“思维方式”而非“具体知识”；3. 主动迁移应用到核心领域。',
      practice: '1. 核心领域是“自媒体文案”，跨界学习“心理学”中的“锚定效应”“损失厌恶”；2. 迁移应用：写文案时设置价格锚点，用损失厌恶撰写标题。'
    },
    // 效率管理类
    { 
      id: 'energySegmentation', 
      name: 'energySegmentation', 
      label: '精力分段管理法', 
      icon: Clock, 
      description: '匹配任务难度和精力状态，最大化效率', 
      deepAnalysis: '精力分段管理法认为，人的精力不是匀速的，而是存在高峰、平稳、低谷三个阶段，不同阶段适合做不同类型的任务。核心是“匹配任务难度和精力状态，最大化效率”。',
      principle: '人的精力存在高峰、平稳、低谷三个阶段，不同阶段适合做不同类型的任务，核心是“匹配任务难度和精力状态，最大化效率”。',
      scope: '系统的「时间精力规划」「任务匹配优化」「疲劳预防」模块',
      tips: '1. 记录自己的精力曲线；2. 高峰时段做高难度、高专注的任务；3. 低谷时段做低难度、机械性的任务。',
      practice: '1. 记录精力曲线：早上7-10点高峰，下午2-4点低谷；2. 任务匹配：高峰时段做“写方案、学新课”，低谷时段做“整理文件、回复消息”。'
    },
    { 
      id: 'smartPrinciple', 
      name: 'smartPrinciple', 
      label: '任务分解SMART原则', 
      icon: Target, 
      description: '将模糊大目标拆解为具体可执行的任务', 
      deepAnalysis: 'SMART原则是将模糊的大目标拆解为具体（Specific）、可衡量（Measurable）、可实现（Achievable）、相关性（Relevant）、时限性（Time-bound）的小任务，确保目标落地。',
      principle: '将模糊的大目标拆解为具体（Specific）、可衡量（Measurable）、可实现（Achievable）、相关性（Relevant）、时限性（Time-bound）的小任务，确保目标落地。',
      scope: '系统的「目标拆解」「任务制定」「项目管理」模块',
      tips: '1. 每个小任务都要满足SMART的五个要素；2. 避免设置“假大空”的任务；3. 确保每个任务都能执行、能检验。',
      practice: '1. 将“今年学英语”拆解为：“3个月内背完1000个核心单词，每天背10个，每周测试正确率≥80%，截止日期为3月31日”；2. 进一步拆解为每日具体动作。'
    },
    // 行为心理类
    { 
      id: 'exposureEffect', 
      name: 'exposureEffect', 
      label: '曝光效应', 
      icon: Eye, 
      description: '熟悉带来喜欢的心理效应', 
      deepAnalysis: '曝光效应又称多看效应，指人们会偏好自己熟悉的事物。越频繁、无负面压力地接触某件事，越容易对其产生好感和接纳度，核心是“熟悉带来喜欢”。',
      principle: '越频繁、无负面压力地接触某件事，越容易对其产生好感和接纳度。',
      scope: '系统的「新习惯接纳引导」「兴趣培养」「技能入门适应」模块',
      tips: '1. 降低首次接触的难度，通过高频次、低压力的“曝光”建立熟悉感；2. 避免一开始就高强度投入，防止产生抵触心理。',
      practice: '1. 想培养“学吉他”的兴趣，不要一开始就要求自己练1小时，而是每天只拿起来弹5分钟简单和弦，保持高频次接触；2. 坚持2周后，大脑对吉他的抵触感降低，再逐步增加练习时长，自然建立兴趣。'
    },
    { 
      id: 'emotionABC', 
      name: 'emotionABC', 
      label: '情绪ABC理论', 
      icon: Smile, 
      description: '认知决定情绪的理论模型', 
      deepAnalysis: '情绪ABC理论指出，情绪的产生不是由事件直接引起，而是由人对事件的认知和信念决定。核心是“改变认知，就能改变情绪”。',
      principle: '情绪的产生不是由事件直接引起，而是由人对事件的认知和信念决定。',
      scope: '系统的「负面情绪调节」「挫折心态调整」「压力管理」模块',
      tips: '1. 遇到负面情绪时，先区分“事件本身”和“自己对事件的看法”；2. 找出不合理的信念，替换为理性信念。',
      practice: '1. 事件：“精心写的文案没人看”；原有信念：“我写得太差了，根本不适合做自媒体”；引发情绪：沮丧、自我否定；2. 替换为理性信念：“文案没人看可能是选题、标题的问题，和我本身的能力无关”；调整后情绪：冷静分析、优化文案。'
    },
    { 
      id: 'endowmentEffect', 
      name: 'endowmentEffect', 
      label: '禀赋效应', 
      icon: Star, 
      description: '拥有感强化坚持动力的心理效应', 
      deepAnalysis: '禀赋效应指人会对自己已经拥有的物品或事物，赋予更高的价值，产生“敝帚自珍”的心理；相比于获得，人们更厌恶失去属于自己的东西。',
      principle: '人会对自己拥有的事物赋予更高价值，更厌恶失去。',
      scope: '系统的「习惯留存激励」「目标坚持绑定」「沉没成本规避辅助」模块',
      tips: '1. 让用户对目标或习惯产生“拥有感”，比如将坚持的习惯生成专属勋章、累计天数记录可视化；2. 利用损失厌恶心理，设置“放弃即失去”的轻惩罚机制。',
      practice: '1. 在系统中为“每日阅读”习惯设置**专属成长树**，坚持一天就长出一片叶子，用户会因珍惜已长出的树叶而不愿中断；2. 开启“习惯押金”功能，存入小额资金，连续坚持30天可全额取回，中断则扣除部分用于公益，利用禀赋效应强化坚持动力。'
    },
    { 
      id: 'bystanderEffect', 
      name: 'bystanderEffect', 
      label: '旁观者效应', 
      icon: User, 
      description: '群体中责任分散的心理现象', 
      deepAnalysis: '旁观者效应也叫责任分散效应，指在群体中，个体的责任感会被稀释，面对需要行动的场景，人越多，主动采取行动的人越少。',
      principle: '在群体中，个体的责任感会被稀释，人越多，主动采取行动的人越少。',
      scope: '系统的「个人任务责任绑定」「社群监督机制设计」「目标执行专注化」模块',
      tips: '1. 为任务设置**明确的个人责任人**，避免模糊的“群体共同目标”；2. 在社群打卡中，要求每个人提交具体的执行细节，而非简单的“已完成”。',
      practice: '1. 参与社群学习时，不加入人数过多的大群，选择5-8人的小分组，每人认领固定的“每日分享”任务，明确个人责任；2. 在系统中设置“个人任务看板”，将目标直接绑定到个人账号，不设置“群体完成率”指标，避免责任分散。'
    },
    { 
      id: 'birdcageEffect', 
      name: 'birdcageEffect', 
      label: '鸟笼效应', 
      icon: Square, 
      description: '初始触发物引发连锁行为的效应', 
      deepAnalysis: '鸟笼效应指人会在偶然获得一件原本不需要的物品后，为了使它变得“有用”，进而购买更多与之相关的物品，形成连锁反应。核心是“由一个初始触发物，引发一系列相关行为”。',
      principle: '由一个初始触发物，引发一系列相关行为。',
      scope: '系统的「习惯触发链条设计」「新行为启动引导」「环境暗示搭建」模块',
      tips: '1. 选择一个与目标习惯强相关的“触发物”，放在显眼位置，通过触发物的暗示，引导自己完成后续行为；2. 触发物要简单、易得，避免门槛过高。',
      practice: '1. 想养成“睡前冥想”的习惯，先买一个精致的冥想坐垫，放在床头显眼处；看到坐垫，就会自然联想到“该冥想了”，进而完成后续动作；2. 在系统中设置“习惯触发卡”，完成打卡后解锁下一个相关的“小任务提示”，比如完成“读10页书”，触发“写2句读后感”的提示，形成行为链条。'
    },
    // 认知提升类
    { 
      id: 'metacognition', 
      name: 'metacognition', 
      label: '元认知策略', 
      icon: BrainCircuit, 
      description: '对认知的认知和监控', 
      deepAnalysis: '元认知是“对认知的认知”，指对自己的学习、记忆、思维等认知活动的监控、调节和反思。核心是“知道自己在学什么，知道自己学得怎么样，知道如何调整学习方法”。',
      principle: '对自己的认知活动进行监控、调节和反思，优化学习和思维过程。',
      scope: '系统的「学习效率优化」「思维漏洞修正」「知识内化监控」模块',
      tips: '1. 建立“学习-监控-反思-调整”的闭环；2. 定期问自己三个问题：“我学到了什么？”“我哪里没学好？”“我该怎么改进？”。',
      practice: '1. 学习一段Python知识后，进行元认知反思：学到了“列表推导式”的用法；没学好的是“嵌套列表推导式的逻辑”；改进方法是“找3个嵌套案例拆解练习，向社群大佬请教”；2. 在系统中设置“元认知复盘”功能，每次学习后填写反思内容，形成记录。'
    },
    { 
      id: 'transferLearning', 
      name: 'transferLearning', 
      label: '迁移学习思维', 
      icon: Repeat, 
      description: '跨领域知识复用的思维模式', 
      deepAnalysis: '迁移学习思维指将已掌握的知识、技能、方法，迁移应用到新的领域或问题上。核心是“触类旁通”，找到不同领域之间的底层逻辑共性，实现知识复用。',
      principle: '将已掌握的知识、技能、方法，迁移应用到新的领域或问题上。',
      scope: '系统的「跨领域知识整合」「技能复用拓展」「问题解决思路迁移」模块',
      tips: '1. 学习新事物时，先找它和已有知识的共性；2. 拆解核心底层逻辑，而非死记表面规则；3. 主动尝试在不同场景中复用同一方法。',
      practice: '1. 已掌握“写公众号文案”的技巧（核心逻辑：抓痛点→给方案→促行动）；2. 迁移到短视频脚本创作：开头用10秒抛出用户痛点（如“是不是背单词总忘？”），中间给解决方案（“用间隔重复法”），结尾促进行动（“点赞收藏，跟着练”）。'
    },
    // 效率执行类
    { 
      id: 'singleTasking', 
      name: 'singleTasking', 
      label: '单任务处理原则', 
      icon: Target, 
      description: '一次只做一件事的效率原则', 
      deepAnalysis: '单任务处理原则指人的注意力是有限的，同时处理多个任务会导致注意力分散，效率大幅降低。核心是“一次只做一件事”，聚焦全部注意力完成当前任务，再切换到下一个。',
      principle: '一次只做一件事，聚焦全部注意力完成当前任务，再切换到下一个。',
      scope: '系统的「专注执行」「任务切换管理」「高难度工作推进」模块',
      tips: '1. 关闭所有干扰源（手机通知、弹窗）；2. 给任务设定明确的“专注时段”，期间不切换其他任务；3. 完成一个任务后，再进行短暂休息，避免疲劳。',
      practice: '1. 要完成“写一份项目计划书”的任务，设定9:00-10:30为专注时段，关闭手机网络和电脑弹窗；2. 期间只专注写计划书，不回复消息、不刷网页；完成后休息10分钟，再处理下一个任务。'
    },
    { 
      id: 'parkinsonsLaw', 
      name: 'parkinsonsLaw', 
      label: '任务截止时间效应', 
      icon: Clock, 
      description: '工作会自动膨胀填满可用时间的定律', 
      deepAnalysis: '任务截止时间效应又称帕金森定律，指工作会自动膨胀，填满可用的时间。给任务设定明确、紧迫的截止时间，能倒逼自己高效执行，避免拖延。',
      principle: '工作会自动膨胀，填满可用的时间；给任务设定明确、紧迫的截止时间，能倒逼自己高效执行，避免拖延。',
      scope: '系统的「拖延症破解」「任务时间规划」「项目进度管控」模块',
      tips: '1. 截止时间要具体、紧迫，且要公开或设置监督机制（如告诉朋友、在系统中设置提醒）；2. 避免设定模糊的“某天完成”，而是精确到“某时某分”。',
      practice: '1. 原本计划“周末整理完学习笔记”，容易拖延，改为设定“周六晚上8点前必须整理完毕，整理好后发给学习小组组长检查”；2. 为了按时完成，会主动拆分任务，周六上午整理一半，下午整理另一半，避免最后一刻赶工。'
    },
    // 人际协作类
    { 
      id: 'nonviolentCommunication', 
      name: 'nonviolentCommunication', 
      label: '非暴力沟通模型', 
      icon: MessageCircle, 
      description: '观察-感受-需要-请求的沟通模型', 
      deepAnalysis: '非暴力沟通模型的核心是**观察-感受-需要-请求**，而非评判、指责。通过客观描述观察到的事实，表达自己的感受，说出自己的需要，最后提出具体的请求，实现高效沟通。',
      principle: '沟通的核心是**观察-感受-需要-请求**，而非评判、指责。',
      scope: '系统的「社交反馈」「团队协作」「冲突解决」模块',
      tips: '1. 避免使用“你总是…”“你根本…”的评判性语言；2. 先讲事实，再谈感受，接着说需求，最后提请求，逻辑要清晰。',
      practice: '1. 团队成员经常迟到，不要说“你总是迟到，一点都不负责”，而是用非暴力沟通：“这一周你有3次迟到超过10分钟（观察），我有点担心项目进度受影响（感受），我需要团队成员都能准时到场（需要），下次能不能提前10分钟出门？（请求）”。'
    },
    { 
      id: 'reciprocityPrinciple', 
      name: 'reciprocityPrinciple', 
      label: '互惠原理', 
      icon: ArrowLeftRight, 
      description: '人们会倾向于回报别人给予的善意', 
      deepAnalysis: '互惠原理指人们会倾向于**回报别人给予的善意或帮助**。主动向他人提供小的帮助或价值，能建立良好的人际关系，也能在需要时获得他人的回报。',
      principle: '人们会倾向于**回报别人给予的善意或帮助**。',
      scope: '系统的「人脉积累」「社群互动」「协作互助」模块',
      tips: '1. 帮助要真诚、适度，不求立刻回报；2. 优先提供对方需要的价值，而非自己想给的；3. 避免“功利性帮助”，防止引起反感。',
      practice: '1. 在学习社群中，看到有人问“如何用Excel做数据透视表”，主动分享自己整理的教程和操作步骤；2. 后续自己遇到“Python数据分析”的问题时，之前帮助过的人也会更愿意主动提供解答。'
    }
  ];

  return (
    <div className={`w-full h-full flex flex-col ${bgClass} p-4 gap-4`}>
      {/* 1. 图表切换模块 - 位于界面顶部，包含图表分类选择功能及相关操作按钮 */}
      <div className={`${cardBg} rounded-2xl p-4 shadow-lg`}>
        <h2 className={`text-lg font-bold mb-4 ${textMain}`}>图表切换模块</h2>
        <div className="overflow-y-auto max-h-32">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {Object.entries(chartCategories).map(([category, charts]) => (
            <div key={category} className="mb-4">
              <h3 className={`text-sm font-bold mb-2 ${textMain}`}>
                {category === 'trend' ? '趋势类' : '概念类'}
              </h3>
              <SortableContext
                items={charts}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-wrap gap-2">
                  {charts.map((chartId) => {
                    const chart = getChartById(chartId);
                    if (!chart) return null;
                    return (
                      <SortableButton
                        key={chartId}
                        id={chartId}
                        chart={chart}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </div>
          ))}
        </DndContext>
        </div>
      </div>
      
      {/* 2. 图表展示模块 - 作为核心图和表区域，用于可视化展示选定的图表数据 */}
      <div className={`${cardBg} rounded-2xl p-6 shadow-lg flex-grow`}>
        <h2 className={`text-lg font-bold mb-4 ${textMain}`}>图表展示</h2>
        {renderChart()}
      </div>
      
      {/* 3. 图表解析模块 - 位于界面底部区域，用于对当前展示图表进行详细解析 */}
      <div className={`${cardBg} rounded-2xl p-6 shadow-lg`}>
        <h2 className={`text-lg font-bold mb-4 ${textMain}`}>图表深度解析模块</h2>
        {(() => {
          const activeChartObj = getChartById(activeChart);
          if (!activeChartObj) return null;
          return (
            <div>
              <h3 className={`text-lg font-bold mb-2 ${textMain}`}>{activeChartObj.label}</h3>
              <p className={`text-sm ${textSub} mb-4`}>{activeChartObj.deepAnalysis}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className={`text-sm font-semibold mb-1 ${textMain}`}>核心原理</h4>
                  <p className={`text-xs ${textSub}`}>{activeChartObj.principle}</p>
                </div>
                <div>
                  <h4 className={`text-sm font-semibold mb-1 ${textMain}`}>适用范围</h4>
                  <p className={`text-xs ${textSub}`}>{activeChartObj.scope}</p>
                </div>
                <div>
                  <h4 className={`text-sm font-semibold mb-1 ${textMain}`}>操作建议</h4>
                  <p className={`text-xs ${textSub}`}>{activeChartObj.tips}</p>
                </div>
                <div>
                  <h4 className={`text-sm font-semibold mb-1 ${textMain}`}>实践案例</h4>
                  <p className={`text-xs ${textSub}`}>{activeChartObj.practice}</p>
                </div>
                <div className="col-span-2">
                  <h4 className={`text-sm font-semibold mb-1 ${textMain}`}>可视化设计描述</h4>
                  <p className={`text-xs ${textSub}`}>{activeChartObj.visualDesign || '暂无可视化设计描述'}</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default MissionControl;