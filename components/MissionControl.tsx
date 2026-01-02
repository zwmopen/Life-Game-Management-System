import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid, Tooltip,
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
    shadow: 'shadow-[8px_8px_16px_rgba(163,177,198,0.2),-8px_-8px_16px_rgba(255,255,255,0.8)] rounded-[24px]',
    hoverShadow: 'hover:shadow-[10px_10px_20px_rgba(163,177,198,0.3),-10px_-10px_20px_rgba(255,255,255,0.9)] rounded-[24px]',
    activeShadow: 'active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.3),inset_-5px_-5px_10px_rgba(255,255,255,0.8)] rounded-[24px]',
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

  const [activeChart, setActiveChart] = useState<string>('systemFeedback');
  // 确保图表在页面加载时显示系统反馈模型
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
    trend: ['dip', 'dunning', 'jcurve', 'antifragile', 'secondcurve', 'compound', 'dopamine', 'flow'],
    concept: ['zone', 'woop', 'peakEnd', 'valueVenn', 'purpose', 'johariWindow', 'footInDoor', 'deliberatePractice', 'foggBehavior', 'eisenhowerMatrix', 'growthMindset', 'sunkCost', 'pareto', 'swot', 'goldenCircle', 'fiveWhys', 'brokenWindow', 'matthewEffect', 'hedgehogPrinciple', 'survivorshipBias', 'occamsRazor', 'anchoringEffect', 'tenThousandHours', 'feynmanTechnique', 'spacedRepetition', 'probabilityThinking', 'regretMinimization', 'identityTheory', 'zeigarnikEffect', 'grayThinking', 'reverseThinking', 'riaReading', 'feedbackLoop', 'eisenhowerAdvanced', 'energyManagement', 'prospectTheory', 'weightedDecisionMatrix', 'feedbackPeakLaw', 'environmentDesign', 'frameRefactoring', 'knowledgeCrystallization', 'metaLearning', 'crossDomainLearning', 'energySegmentation', 'smartPrinciple']
  });

  // Load saved categories from localStorage
  useEffect(() => {
    const savedCategories = localStorage.getItem('chartCategories');
    const initialCategories = {
      trend: ['dip', 'dunning', 'jcurve', 'antifragile', 'secondcurve', 'compound', 'dopamine', 'flow'],
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
        className={`flex items-center px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300 ${getButtonClass(activeChart === id)} hover:scale-105 hover:shadow-lg transform hover:-translate-y-0.5`}
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
    
    switch (activeChart) {
      case 'attributeRadar':
        // 暂时禁用该图表，因为 attributeData 未定义
        return (
          <BaseChart data={[]} isDark={isDark}>
            <div className="flex items-center justify-center h-full">
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>该图表暂不可用</p>
            </div>
          </BaseChart>
        );
      case 'focusHeatmap':
        // 暂时禁用该图表，因为 dailyFocusData 未定义
        return (
          <BaseChart data={[]} isDark={isDark} >
            <div className="flex items-center justify-center h-full">
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>该图表暂不可用</p>
            </div>
          </BaseChart>
        );
      case 'entropy':
        // 暂时禁用该图表，因为 entropyData 未定义
        return (
          <BaseChart data={[]} isDark={isDark} height={chartHeight}>
            <div className="flex items-center justify-center h-full">
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>该图表暂不可用</p>
            </div>
          </BaseChart>
        );
      case 'dip':
        return (
          <div className="w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 900 700" style={{ fontFamily: 'Microsoft YaHei, sans-serif' }}>
              {/* 1. 背景平滑渐变填充 */}
              <defs>
                {/* 背景渐变 */}
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f0f8ff" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#e6f7ff" stopOpacity="1"/>
                </linearGradient>
                {/* 曲线下方区域蓝红渐变 */}
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3498db" stopOpacity="0.2"/>
                  <stop offset="50%" stopColor="#e74c3c" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#2ecc71" stopOpacity="0.2"/>
                </linearGradient>
              </defs>
              {/* 背景矩形 */}
              <rect x="50" y="100" width="800" height="500" fill="url(#bgGradient)" rx="2" ry="2"/>

              {/* 2. 坐标轴绘制 */}
              <line x1="100" y1="600" x2="850" y2="600" stroke="#333" strokeWidth="2"/> {/* X轴 */}
              <line x1="100" y1="150" x2="100" y2="600" stroke="#333" strokeWidth="2"/> {/* Y轴 */}
              {/* X轴刻度（简易标注，增强可读性） */}
              <line x1="100" y1="600" x2="100" y2="610" stroke="#333" strokeWidth="2"/>
              <line x1="250" y1="600" x2="250" y2="610" stroke="#333" strokeWidth="2"/>
              <line x1="400" y1="600" x2="400" y2="610" stroke="#333" strokeWidth="2"/>
              <line x1="550" y1="600" x2="550" y2="610" stroke="#333" strokeWidth="2"/>
              <line x1="700" y1="600" x2="700" y2="610" stroke="#333" strokeWidth="2"/>
              <line x1="850" y1="600" x2="850" y2="610" stroke="#333" strokeWidth="2"/>
              <text x="100" y="630" fontSize="12" fill="#333">0</text>
              <text x="250" y="630" fontSize="12" fill="#333">20</text>
              <text x="400" y="630" fontSize="12" fill="#333">40</text>
              <text x="550" y="630" fontSize="12" fill="#333">60</text>
              <text x="700" y="630" fontSize="12" fill="#333">80</text>
              <text x="850" y="630" fontSize="12" fill="#333">100</text>
              {/* Y轴刻度（简易标注，增强可读性） */}
              <line x1="100" y1="600" x2="90" y2="600" stroke="#333" strokeWidth="2"/>
              <line x1="100" y1="480" x2="90" y2="480" stroke="#333" strokeWidth="2"/>
              <line x1="100" y1="360" x2="90" y2="360" stroke="#333" strokeWidth="2"/>
              <line x1="100" y1="240" x2="90" y2="240" stroke="#333" strokeWidth="2"/>
              <line x1="100" y1="150" x2="90" y2="150" stroke="#333" strokeWidth="2"/>
              <text x="70" y="600" fontSize="12" fill="#333">0</text>
              <text x="70" y="480" fontSize="12" fill="#333">25</text>
              <text x="70" y="360" fontSize="12" fill="#333">50</text>
              <text x="70" y="240" fontSize="12" fill="#333">75</text>
              <text x="70" y="150" fontSize="12" fill="#333">100</text>

              {/* 3. 曲线绘制 + 下方区域填充 */}
              {/* 曲线下方区域填充（蓝红渐变） */}
              <path d="M100,600 Q180,400 250,350 T400,500 T550,480 T700,200 T850,150 L850,600 Z"
                    fill="url(#areaGradient)" stroke="none"/>
              {/* 平滑曲线（先快速上升→下降→急剧上升） */}
              <path d="M100,600 Q180,400 250,350 T400,500 T550,480 T700,200 T850,150"
                    stroke="#2c3e50" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

              {/* 4. 关键数据点（红色圆点） */}
              <circle cx="100" cy="600" r="6" fill="red" stroke="#333" strokeWidth="1"/> {/* 起点（初始阶段） */}
              <circle cx="250" cy="350" r="6" fill="red" stroke="#333" strokeWidth="1"/> {/* 初始阶段终点 */}
              <circle cx="400" cy="500" r="6" fill="red" stroke="#333" strokeWidth="1"/> {/* 死亡谷底部 */}
              <circle cx="550" cy="480" r="6" fill="red" stroke="#333" strokeWidth="1"/> {/* 突破阶段 */}
              <circle cx="850" cy="150" r="6" fill="red" stroke="#333" strokeWidth="1"/> {/* 指数增长期 */}

              {/* 5. 文字标注 */}
              {/* 图表标题 + 副标题 */}
              <text x="450" y="60" fontSize="24" fill="#333" fontWeight="bold">死亡谷效应</text>
              <text x="450" y="90" fontSize="14" fill="#666">投入初期快速进步，随后进入瓶颈期，突破后呈指数级增长</text>
              {/* 曲线关键节点（红色文字） */}
              <text x="100" y="580" fontSize="14" fill="red" fontWeight="bold">初始阶段</text>
              <text x="400" y="520" fontSize="14" fill="red" fontWeight="bold">死亡谷底部</text>
              <text x="550" y="460" fontSize="14" fill="red" fontWeight="bold">突破阶段</text>
              <text x="850" y="130" fontSize="14" fill="red" fontWeight="bold">指数增长期</text>
              {/* 坐标轴标注 */}
              <text x="475" y="650" fontSize="16" fill="#333" fontWeight="normal">投入度 (%)</text>
              <text x="40" y="375" fontSize="16" fill="#333" fontWeight="normal" transform="rotate(-90,40,375)">产出率 (%)</text>
              {/* 曲线下方阶段名称 */}
              <text x="175" y="450" fontSize="14" fill="#333" fontWeight="bold">快速进步期</text>
              <text x="475" y="550" fontSize="14" fill="#333" fontWeight="bold">瓶颈期</text>
              <text x="700" y="300" fontSize="14" fill="#333" fontWeight="bold">指数增长期</text>
            </svg>
          </div>
        );
      case 'dunning':
        return (
          <div className="flex flex-col w-full h-full">
            <div className="w-full h-[calc(100%-200px)]">
              <svg width="100%" height="100%" viewBox="0 0 800 600" style={{ fontFamily: 'Microsoft YaHei, sans-serif' }}>
                {/* 1. 背景分区（4个彩色区域，边界清晰） */}
                <rect x="100" y="100" width="150" height="400" fill="#ffd6e0" stroke="#333" strokeWidth="1"/> {/* 自信爆棚区 */}
                <rect x="250" y="100" width="150" height="400" fill="#d6e4ff" stroke="#333" strokeWidth="1"/> {/* 自信崩溃区 */}
                <rect x="400" y="100" width="150" height="400" fill="#d6ffed" stroke="#333" strokeWidth="1"/> {/* 自信重建区 */}
                <rect x="550" y="100" width="150" height="400" fill="#fff3d6" stroke="#333" strokeWidth="1"/> {/* 自信成熟区 */}

                {/* 2. 坐标轴绘制 */}
                <line x1="100" y1="500" x2="700" y2="500" stroke="#333" strokeWidth="2"/> {/* X轴 */}
                <line x1="100" y1="100" x2="100" y2="500" stroke="#333" strokeWidth="2"/> {/* Y轴 */}

                {/* 3. 平滑曲线（先升后降再平缓上升，贯穿4个分区） */}
                <path d="M100,400 Q175,150 250,200 T400,450 T550,350 T700,300" 
                      stroke="#2f5496" strokeWidth="3" fill="none" strokeLinecap="round"/>

                {/* 4. 文字标注 - 曲线关键节点（红色文字） */}
                <text x="175" y="130" fontSize="14" fill="red" fontWeight="bold">愚昧之巅</text>
                <text x="325" y="220" fontSize="14" fill="red" fontWeight="bold">绝望之谷</text>
                <text x="475" y="470" fontSize="14" fill="red" fontWeight="bold">开悟之坡</text>
                <text x="625" y="280" fontSize="14" fill="red" fontWeight="bold">平稳高原</text>

                {/* 5. 文字标注 - 坐标轴说明 */}
                <text x="400" y="530" fontSize="14" fill="#333" fontWeight="normal">智慧水平（知识与经验，低→高）</text>
                <text x="60" y="300" fontSize="14" fill="#333" fontWeight="normal" transform="rotate(-90,60,300)">自信程度（高→低）</text>

                {/* 6. 文字标注 - 背景分区名称（对应区域内） */}
                <text x="175" y="50" fontSize="14" fill="#333" fontWeight="bold">自信爆棚区</text>
                <text x="325" y="50" fontSize="14" fill="#333" fontWeight="bold">自信崩溃区</text>
                <text x="475" y="50" fontSize="14" fill="#333" fontWeight="bold">自信重建区</text>
                <text x="625" y="50" fontSize="14" fill="#333" fontWeight="bold">自信成熟区</text>

                {/* 7. 文字标注 - 底部表现标签 */}
                <text x="175" y="560" fontSize="16" fill="#333" fontWeight="bold">巨婴</text>
                <text x="325" y="560" fontSize="16" fill="#333" fontWeight="bold">屌丝</text>
                <text x="475" y="560" fontSize="16" fill="#333" fontWeight="bold">智者</text>
                <text x="625" y="560" fontSize="16" fill="#333" fontWeight="bold">大师</text>

                {/* 8. 简笔画图标 - 4个分区对应图标（无外部资源，纯SVG绘制） */}
                {/* 自信爆棚区：人物图标（自信姿态） */}
                <g transform="translate(175, 300) scale(0.8)">
                    <circle cx="0" cy="-20" r="15" fill="#333" /> {/* 头部 */}
                    <rect x="-10" y="5" width="20" height="25" fill="#333" /> {/* 身体 */}
                    <line x1="-10" y1="5" x2="-18" y2="15" stroke="#333" strokeWidth="2" /> {/* 左臂 */}
                    <line x1="10" y1="5" x2="18" y2="15" stroke="#333" strokeWidth="2" /> {/* 右臂 */}
                    <line x1="-10" y1="30" x2="-18" y2="40" stroke="#333" strokeWidth="2" /> {/* 左腿 */}
                    <line x1="10" y1="30" x2="18" y2="40" stroke="#333" strokeWidth="2" /> {/* 右腿 */}
                </g>

                {/* 自信崩溃区：沮丧人物图标 */}
                <g transform="translate(325, 300) scale(0.8)">
                    <circle cx="0" cy="-15" r="15" fill="#333" /> {/* 头部 */}
                    <path d="M-10,0 L0,25 L10,0" fill="#333" /> {/* 弯腰身体 */}
                    <line x1="-5" y1="5" x2="-12" y2="15" stroke="#333" strokeWidth="2" /> {/* 左臂 */}
                    <line x1="5" y1="5" x2="12" y2="15" stroke="#333" strokeWidth="2" /> {/* 右臂 */}
                    <line x1="-5" y1="25" x2="-12" y2="35" stroke="#333" strokeWidth="2" /> {/* 左腿 */}
                    <line x1="5" y1="25" x2="12" y2="35" stroke="#333" strokeWidth="2" /> {/* 右腿 */}
                </g>

                {/* 自信重建区：学习人物图标（持书） */}
                <g transform="translate(475, 300) scale(0.8)">
                    <circle cx="0" cy="-20" r="15" fill="#333" /> {/* 头部 */}
                    <rect x="-10" y="5" width="20" height="25" fill="#333" /> {/* 身体 */}
                    <line x1="-10" y1="15" x2="-18" y2="25" stroke="#333" strokeWidth="2" /> {/* 左臂 */}
                    <rect x="5" y="10" width="8" height="12" fill="#333" /> {/* 书本 */}
                    <line x1="10" y1="30" x2="18" y2="40" stroke="#333" strokeWidth="2" /> {/* 右腿 */}
                    <line x1="-10" y1="30" x2="-18" y2="40" stroke="#333" strokeWidth="2" /> {/* 左腿 */}
                </g>

                {/* 自信成熟区：大脑图标 */}
                <g transform="translate(625, 300) scale(0.8)">
                    <path d="M-20,0 C-30,-15 -30,-35 -15,-45 C0,-55 20,-55 35,-45 C50,-35 50,-15 40,0 C45,15 40,35 25,45 C10,55 -10,55 -25,45 C-40,35 -35,15 -20,0 Z" fill="#333" /> {/* 大脑轮廓 */}
                    <line x1="-15" y1="-10" x2="-15" y2="30" stroke="#fff" strokeWidth="1" /> {/* 大脑纹理 */}
                    <line x1="0" y1="-10" x2="0" y2="30" stroke="#fff" strokeWidth="1" /> {/* 大脑纹理 */}
                    <line x1="15" y1="-10" x2="15" y2="30" stroke="#fff" strokeWidth="1" /> {/* 大脑纹理 */}
                    <path d="M-25,-20 Q0,-30 25,-20" stroke="#fff" strokeWidth="1" fill="none" /> {/* 大脑纹理 */}
                    <path d="M-20,10 Q0,20 20,10" stroke="#fff" strokeWidth="1" fill="none" /> {/* 大脑纹理 */}
                </g>
              </svg>
            </div>
            
            {/* 阶段说明卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 mt-2 overflow-y-auto max-h-[200px]">
              <div className={`p-3 rounded-xl transition-all duration-300 ${isDark ? 'bg-zinc-800/80' : 'bg-white/80'} shadow-lg border ${isDark ? 'border-zinc-700' : 'border-gray-200'}`}>
                <h4 className="text-md font-bold mb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">1</span>
                  愚昧之巅
                </h4>
                <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  知识水平低但自信程度极高，对自己的能力缺乏客观认识，往往高估自己。
                </p>
              </div>
              <div className={`p-3 rounded-xl transition-all duration-300 ${isDark ? 'bg-zinc-800/80' : 'bg-white/80'} shadow-lg border ${isDark ? 'border-zinc-700' : 'border-gray-200'}`}>
                <h4 className="text-md font-bold mb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">2</span>
                  绝望之谷
                </h4>
                <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  随着知识的增加，开始意识到自己的不足，自信程度急剧下降，进入自我怀疑阶段。
                </p>
              </div>
              <div className={`p-3 rounded-xl transition-all duration-300 ${isDark ? 'bg-zinc-800/80' : 'bg-white/80'} shadow-lg border ${isDark ? 'border-zinc-700' : 'border-gray-200'}`}>
                <h4 className="text-md font-bold mb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">3</span>
                  开悟之坡
                </h4>
                <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  通过持续学习和实践，知识水平不断提高，自信程度也逐渐恢复并稳步增长。
                </p>
              </div>
              <div className={`p-3 rounded-xl transition-all duration-300 ${isDark ? 'bg-zinc-800/80' : 'bg-white/80'} shadow-lg border ${isDark ? 'border-zinc-700' : 'border-gray-200'}`}>
                <h4 className="text-md font-bold mb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">4</span>
                  大师境界
                </h4>
                <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  达到极高的知识水平，能够客观认识自己的能力，自信程度稳定在高水平，成为领域专家。
                </p>
              </div>
            </div>
          </div>
        );
      case 'jcurve':
        return (
          <div className="w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 900 700" style={{ fontFamily: 'Microsoft YaHei, sans-serif' }}>
              {/* 1. 渐变定义：背景渐变 + 曲线下方填充渐变 */}
              <defs>
                {/* 图表背景平滑渐变 */}
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8f9fa" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#e9ecef" stopOpacity="1"/>
                </linearGradient>
                {/* 曲线下方蓝白渐变填充 */}
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2196f3" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05"/>
                </linearGradient>
              </defs>

              {/* 2. 背景绘制 */}
              <rect x="50" y="100" width="800" height="500" fill="url(#bgGradient)" rx="2" ry="2"/>

              {/* 3. 坐标轴绘制 */}
              {/* X轴（时间：由短到长） */}
              <line x1="100" y1="450" x2="850" y2="450" stroke="#333" strokeWidth="2"/>
              {/* Y轴（回报值：由低到高，包含负值区域） */}
              <line x1="100" y1="150" x2="100" y2="550" stroke="#333" strokeWidth="2"/>
              {/* X轴刻度与标注 */}
              <line x1="100" y1="450" x2="100" y2="460" stroke="#333" strokeWidth="2"/>
              <line x1="250" y1="450" x2="250" y2="460" stroke="#333" strokeWidth="2"/>
              <line x1="400" y1="450" x2="400" y2="460" stroke="#333" strokeWidth="2"/>
              <line x1="550" y1="450" x2="550" y2="460" stroke="#333" strokeWidth="2"/>
              <line x1="700" y1="450" x2="700" y2="460" stroke="#333" strokeWidth="2"/>
              <line x1="850" y1="450" x2="850" y2="460" stroke="#333" strokeWidth="2"/>
              <text x="100" y="480" fontSize="12" fill="#333">0</text>
              <text x="250" y="480" fontSize="12" fill="#333">2</text>
              <text x="400" y="480" fontSize="12" fill="#333">4</text>
              <text x="550" y="480" fontSize="12" fill="#333">6</text>
              <text x="700" y="480" fontSize="12" fill="#333">8</text>
              <text x="850" y="480" fontSize="12" fill="#333">10</text>
              {/* Y轴刻度与标注（包含负值） */}
              <line x1="100" y1="550" x2="90" y2="550" stroke="#333" strokeWidth="2"/>
              <line x1="100" y1="450" x2="90" y2="450" stroke="#333" strokeWidth="2"/>
              <line x1="100" y1="350" x2="90" y2="350" stroke="#333" strokeWidth="2"/>
              <line x1="100" y1="250" x2="90" y2="250" stroke="#333" strokeWidth="2"/>
              <line x1="100" y1="150" x2="90" y2="150" stroke="#333" strokeWidth="2"/>
              <text x="70" y="550" fontSize="12" fill="#333">-50</text>
              <text x="70" y="450" fontSize="12" fill="#333">0</text>
              <text x="70" y="350" fontSize="12" fill="#333">50</text>
              <text x="70" y="250" fontSize="12" fill="#333">100</text>
              <text x="70" y="150" fontSize="12" fill="#333">150</text>

              {/* 4. 转折点垂直虚线参考线 */}
              <line x1="400" y1="150" x2="400" y2="550" stroke="#666" strokeWidth="1" strokeDasharray="5,5"/>

              {/* 5. 曲线绘制 + 下方区域填充 */}
              {/* 曲线下方蓝白渐变填充 */}
              <path d="M100,480 Q180,520 250,500 T400,460 T550,380 T700,250 T850,150 L850,450 L100,450 Z"
                    fill="url(#areaGradient)" stroke="none"/>
              {/* J型平滑曲线（蓝色，3px粗细） */}
              <path d="M100,480 Q180,520 250,500 T400,460 T550,380 T700,250 T850,150"
                    stroke="#2196f3" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

              {/* 6. 关键数据点（红色圆点，白色边框2px） */}
              <circle cx="100" cy="480" r="6" fill="red" stroke="#fff" strokeWidth="2"/>
              <circle cx="400" cy="460" r="6" fill="red" stroke="#fff" strokeWidth="2"/>
              <circle cx="850" cy="150" r="6" fill="red" stroke="#fff" strokeWidth="2"/>

              {/* 7. 文字标注 */}
              {/* 图表标题 + 副标题 */}
              <text x="450" y="60" fontSize="24" fill="#333" fontWeight="bold">J型曲线 - 长期投资回报模式</text>
              <text x="450" y="90" fontSize="14" fill="#666">投入初期收益为负，突破转折点后呈指数级增长</text>
              {/* 曲线关键节点（红色文字） */}
              <text x="100" y="500" fontSize="14" fill="red" fontWeight="bold">投入期</text>
              <text x="400" y="480" fontSize="14" fill="red" fontWeight="bold">转折点</text>
              <text x="850" y="130" fontSize="14" fill="red" fontWeight="bold">爆发期</text>
              {/* 坐标轴标注 */}
              <text x="475" y="510" fontSize="16" fill="#333" fontWeight="normal">时间</text>
              <text x="40" y="350" fontSize="16" fill="#333" fontWeight="normal" transform="rotate(-90,40,350)">回报值</text>
              {/* 曲线下方阶段名称 */}
              <text x="175" y="530" fontSize="14" fill="#333" fontWeight="bold">投入期</text>
              <text x="475" y="500" fontSize="14" fill="#333" fontWeight="bold">增长期</text>
              <text x="700" y="300" fontSize="14" fill="#333" fontWeight="bold">爆发期</text>
              {/* 右上角图例说明 */}
              <rect x="750" y="120" width="20" height="10" fill="url(#areaGradient)" stroke="#2196f3" strokeWidth="1"/>
              <text x="800" y="125" fontSize="12" fill="#333" textAnchor="start">J型曲线：回报值随时间变化趋势</text>
            </svg>
          </div>
        );
      case 'antifragile':
        return (
          <div className="w-full h-full">
            <div className="container" style={{ maxWidth: '100%', padding: '20px' }}>
              <div className="header" style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h1 style={{ fontSize: '28px', margin: '0 0 10px 0', color: isDark ? '#f1f5f9' : '#2d3748', letterSpacing: '-0.5px' }}>反脆弱 - 压力与韧性关系</h1>
                <p style={{ fontSize: '16px', color: isDark ? '#94a3b8' : '#718096', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                  脆弱系统随压力崩溃，强韧系统保持稳定，反脆弱系统从压力中获益。<br />"风会熄灭蜡烛，却能使火越烧越旺。"
                </p>
              </div>
              
              {/* 核心图表区 */}
              <div className="chart-wrapper" style={{ position: 'relative', background: isDark ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(180deg, #ffffff 0%, #f7fafc 100%)', borderRadius: '20px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, padding: '20px', marginTop: '10px' }}>
                <svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    {/* 渐变定义：脆弱 (红色) */}
                    <linearGradient id="gradFragile" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#EF4444', stopOpacity: 0.4 }} />
                      <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 0.05 }} />
                    </linearGradient>
                    {/* 渐变定义：稳健 (蓝色) */}
                    <linearGradient id="gradRobust" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.4 }} />
                      <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 0.05 }} />
                    </linearGradient>
                    {/* 渐变定义：反脆弱 (绿色) */}
                    <linearGradient id="gradAntifragile" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 0.4 }} />
                      <stop offset="100%" style={{ stopColor: '#10B981', stopOpacity: 0.05 }} />
                    </linearGradient>
                    
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.1"/>
                    </filter>
                  </defs>
  
                  {/* 坐标轴 */}
                  <line x1="50" y1="400" x2="750" y2="400" stroke={isDark ? '#475569' : '#CBD5E0'} strokeWidth="2" markerEnd="url(#arrow)" />
                  <line x1="50" y1="400" x2="50" y2="50" stroke={isDark ? '#475569' : '#CBD5E0'} strokeWidth="2" markerEnd="url(#arrow)" />
                  
                  {/* 坐标标签 */}
                  <text x="750" y="430" textAnchor="end" fontSize="14" fill={isDark ? '#94a3b8' : '#718096'} fontWeight="bold">压力水平 (Pressure) →</text>
                  <text x="40" y="50" textAnchor="end" fontSize="14" fill={isDark ? '#94a3b8' : '#718096'} fontWeight="bold" writingMode="tb">← 韧性值 (Resilience)</text>
  
                  {/* 区域分割参考线 (垂直虚线) */}
                  <line x1="283" y1="50" x2="283" y2="400" stroke={isDark ? '#334155' : '#E2E8F0'} strokeWidth="2" strokeDasharray="6,4" />
                  <line x1="516" y1="50" x2="516" y2="400" stroke={isDark ? '#334155' : '#E2E8F0'} strokeWidth="2" strokeDasharray="6,4" />
                  
                  {/* 区域名称 */}
                  <text x="166" y="420" textAnchor="middle" fontSize="12" fill={isDark ? '#64748b' : '#A0AEC0'} fontWeight="bold">低压力区</text>
                  <text x="400" y="420" textAnchor="middle" fontSize="12" fill={isDark ? '#64748b' : '#A0AEC0'} fontWeight="bold">中等压力区</text>
                  <text x="633" y="420" textAnchor="middle" fontSize="12" fill={isDark ? '#64748b' : '#A0AEC0'} fontWeight="bold">高压力区</text>
  
                  {/* 1. 脆弱系统 (红色虚线): 下降 */}
                  {/* Path: Start(50, 250) -> Drop -> End(750, 400) */}
                  {/* 初始状态在中间，随着压力增大，表现急剧下降 */}
                  <path d="M50 250 Q 200 250, 400 280 T 750 400" fill="none" stroke="#EF4444" strokeWidth="3" strokeDasharray="8,4" />
                  <path d="M50 250 Q 200 250, 400 280 T 750 400 V 400 H 50 Z" fill="url(#gradFragile)" style={{ mixBlendMode: 'multiply' }} />
  
                  {/* 2. 稳健系统 (蓝色实线): 持平 */}
                  {/* Path: Start(50, 250) -> Flat -> End(750, 250) */}
                  <path d="M50 250 L 750 250" fill="none" stroke="#3B82F6" strokeWidth="3" />
                  <path d="M50 250 L 750 250 V 400 H 50 Z" fill="url(#gradRobust)" style={{ mixBlendMode: 'multiply' }} />
  
                  {/* 3. 反脆弱系统 (绿色点划线): 上升 */}
                  {/* Path: Start(50, 250) -> Rise -> End(750, 50) */}
                  {/* 初期稳定，压力增大后爆发式增长 */}
                  <path d="M50 250 Q 300 250, 500 200 T 750 50" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="2,2,8,2" />
                  <path d="M50 250 Q 300 250, 500 200 T 750 50 V 400 H 50 Z" fill="url(#gradAntifragile)" style={{ mixBlendMode: 'multiply' }} />
  
                  {/* 箭头定义 */}
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill={isDark ? '#475569' : '#CBD5E0'} />
                  </marker>
  
                  {/* 关键节点数据点 (圆点+白边) */}
                  
                  {/* 脆弱: 崩溃点 */}
                  <circle cx="750" cy="400" r="6" fill="#EF4444" stroke="white" strokeWidth="2" />
                  <text x="740" y="390" textAnchor="end" fontSize="12" fill="#EF4444" fontWeight="bold">崩溃/受损</text>
  
                  {/* 稳健: 维持点 */}
                  <circle cx="750" cy="250" r="6" fill="#3B82F6" stroke="white" strokeWidth="2" />
                  <text x="760" y="245" textAnchor="start" fontSize="12" fill="#3B82F6" fontWeight="bold">维持原状</text>
  
                  {/* 反脆弱: 获益点 */}
                  <circle cx="750" cy="50" r="6" fill="#10B981" stroke="white" strokeWidth="2" />
                  <text x="740" y="70" textAnchor="end" fontSize="12" fill="#10B981" fontWeight="bold">收益/进化</text>
                  
                  {/* 起始点 (三线合一) */}
                  <circle cx="50" cy="250" r="6" fill={isDark ? '#94a3b8' : '#718096'} stroke="white" strokeWidth="2" />
                  <text x="60" y="240" fontSize="12" fill={isDark ? '#94a3b8' : '#718096'}>初始状态</text>
  
                  {/* 图例 */}
                  <g transform="translate(630, 30)">
                    <rect x="0" y="0" width="130" height="90" fill={isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255,255,255,0.95)'} stroke={isDark ? '#334155' : '#E2E8F0'} rx="4" />
                    
                    {/* Legend 1 */}
                    <line x1="15" y1="20" x2="45" y2="20" stroke="#EF4444" strokeWidth="3" strokeDasharray="8,4" />
                    <text x="55" y="24" fontSize="12" fill={isDark ? '#f1f5f9' : '#4A5568'}>脆弱系统</text>
                    
                    {/* Legend 2 */}
                    <line x1="15" y1="45" x2="45" y2="45" stroke="#3B82F6" strokeWidth="3" />
                    <text x="55" y="49" fontSize="12" fill={isDark ? '#f1f5f9' : '#4A5568'}>稳健系统</text>
                    
                    {/* Legend 3 */}
                    <line x1="15" y1="70" x2="45" y2="70" stroke="#10B981" strokeWidth="3" strokeDasharray="2,2,8,2" />
                    <text x="55" y="74" fontSize="12" fill={isDark ? '#f1f5f9' : '#4A5568'}>反脆弱系统</text>
                  </g>
                </svg>
              </div>
              
              {/* 核心概念卡片 */}
              <div className="cards-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                {/* 核心原理 */}
                <div className="card" style={{ 
                  background: isDark ? '#1e293b' : '#ffffff', 
                  borderRadius: '16px', 
                  padding: '24px 20px', 
                  textAlign: 'center', 
                  transition: 'transform 0.3s ease, boxShadow 0.3s ease', 
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, 
                  position: 'relative', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  boxShadow: `0 4px 6px ${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'}`, 
                  hover: { 
                    transform: 'translateY(-5px)', 
                    boxShadow: `0 10px 25px ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.08)'}`, 
                    borderColor: `${isDark ? '#475569' : '#cbd5e0'}` 
                  } 
                }}>
                  <span className="card-icon" style={{ fontSize: '42px', marginBottom: '15px', display: 'block', height: '50px', lineHeight: '50px' }}>🔥</span>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: isDark ? '#f1f5f9' : '#4a5568' }}>核心原理</h3>
                  <p style={{ fontSize: '13px', color: isDark ? '#cbd5e0' : '#4a5568', margin: 0, lineHeight: '1.6', textAlign: 'left', width: '100%' }}>
                    反脆弱不仅是"坚韧"或"复原力"（那是回到原状）。反脆弱是指系统能在冲击、压力和混乱中<strong>进化</strong>，变得比原来更好。
                  </p>
                </div>
                {/* 操作建议 */}
                <div className="card" style={{ 
                  background: isDark ? '#1e293b' : '#ffffff', 
                  borderRadius: '16px', 
                  padding: '24px 20px', 
                  textAlign: 'center', 
                  transition: 'transform 0.3s ease, boxShadow 0.3s ease', 
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, 
                  position: 'relative', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  boxShadow: `0 4px 6px ${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'}`, 
                  hover: { 
                    transform: 'translateY(-5px)', 
                    boxShadow: `0 10px 25px ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.08)'}`, 
                    borderColor: `${isDark ? '#475569' : '#cbd5e0'}` 
                  } 
                }}>
                  <span className="card-icon" style={{ fontSize: '42px', marginBottom: '15px', display: 'block', height: '50px', lineHeight: '50px' }}>🏗️</span>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: isDark ? '#f1f5f9' : '#4a5568' }}>操作建议</h3>
                  <p style={{ fontSize: '13px', color: isDark ? '#cbd5e0' : '#4a5568', margin: 0, lineHeight: '1.6', textAlign: 'left', width: '100%' }}>
                    1. 拥抱适度压力（如疫苗原理）。<br />2. 建立"杠铃策略"：极度保守 + 极度冒险。<br />3. 避免单一依赖，建立冗余。<br />4. 快速试错，低成本失败。
                  </p>
                </div>
                {/* 实践案例 */}
                <div className="card" style={{ 
                  background: isDark ? '#1e293b' : '#ffffff', 
                  borderRadius: '16px', 
                  padding: '24px 20px', 
                  textAlign: 'center', 
                  transition: 'transform 0.3s ease, boxShadow 0.3s ease', 
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, 
                  position: 'relative', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  boxShadow: `0 4px 6px ${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'}`, 
                  hover: { 
                    transform: 'translateY(-5px)', 
                    boxShadow: `0 10px 25px ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.08)'}`, 
                    borderColor: `${isDark ? '#475569' : '#cbd5e0'}` 
                  } 
                }}>
                  <span className="card-icon" style={{ fontSize: '42px', marginBottom: '15px', display: 'block', height: '50px', lineHeight: '50px' }}>🛡️</span>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: isDark ? '#f1f5f9' : '#4a5568' }}>实践案例</h3>
                  <p style={{ fontSize: '13px', color: isDark ? '#cbd5e0' : '#4a5568', margin: 0, lineHeight: '1.6', textAlign: 'left', width: '100%' }}>
                    1. <strong>职业</strong>：一份稳定工作 + 一个高风险副业。<br />2. <strong>生活</strong>：主动进行高强度间歇运动（给身体施压）。<br />3. <strong>财务</strong>：持有现金 + 投资初创企业。
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'secondcurve':
        return (
          <div className="w-full h-full">
            <div className="wrap" style={{ width: '100%', margin: '0 auto', padding: '40px 20px 30px', backgroundColor: '#ffffff', borderRadius: '18px', boxShadow: '0 18px 40px rgba(0,0,0,0.08)' }}>
              <div className="title" style={{ textAlign: 'center', fontSize: '44px', fontWeight: 400, letterSpacing: '2px', marginBottom: '8px' }}>第二曲线 · 持续增长模型</div>
              <div className="subtitle" style={{ textAlign: 'center', fontSize: '20px', color: '#666', marginBottom: '26px' }}>展示企业或个人发展的生命周期，通过第二曲线实现持续增长</div>
              
              <svg width="100%" height="520" viewBox="0 0 1000 520" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* 背景渐变 */}
                  <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#eef4ff" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                  
                  {/* 第一曲线填充 */}
                  <linearGradient id="blueArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(70,130,255,0.4)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                  </linearGradient>
                  
                  {/* 第二曲线填充 */}
                  <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(80,200,120,0.4)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                  </linearGradient>
                </defs>
                
                {/* 背景 */}
                <rect x="0" y="0" width="1000" height="520" rx="14" fill="url(#bgGrad)" />
                
                {/* 坐标轴区域 */}
                <g transform="translate(90,60)">
                  
                  {/* 坐标轴 */}
                  <line x1="0" y1="360" x2="780" y2="360" stroke="#bbb" strokeWidth="1" />
                  <line x1="0" y1="40" x2="0" y2="360" stroke="#bbb" strokeWidth="1" />
                  
                  {/* 第一曲线面积 */}
                  <path d="
                    M 0 340
                    C 120 300, 200 120, 320 120
                    C 420 120, 500 200, 560 260
                    C 640 330, 720 350, 780 360
                    L 780 360 L 0 360 Z
                  " fill="url(#blueArea)" />
                  
                  {/* 第二曲线面积 */}
                  <path d="
                    M 200 360
                    C 300 350, 360 260, 460 220
                    C 560 180, 660 140, 780 120
                    L 780 360 L 200 360 Z
                  " fill="url(#greenArea)" />
                  
                  {/* 第一曲线 */}
                  <path d="
                    M 0 340
                    C 120 300, 200 120, 320 120
                    C 420 120, 500 200, 560 260
                    C 640 330, 720 350, 780 360
                  " fill="none" stroke="#4682ff" strokeWidth="3" />
                  
                  {/* 第二曲线 */}
                  <path d="
                    M 200 360
                    C 300 350, 360 260, 460 220
                    C 560 180, 660 140, 780 120
                  " fill="none" stroke="#50c878" strokeWidth="3" />
                  
                  {/* 关键点 */}
                  <g stroke="#fff" strokeWidth="2">
                    {/* 第一曲线 */}
                    <circle cx="0" cy="340" r="6" fill="#4682ff" />
                    <circle cx="320" cy="120" r="6" fill="#4682ff" />
                    {/* 第二曲线 */}
                    <circle cx="200" cy="360" r="6" fill="#50c878" />
                    <circle cx="780" cy="120" r="6" fill="#50c878" />
                    {/* 交叉点 */}
                    <circle cx="460" cy="220" r="6" fill="#50c878" />
                  </g>
                  
                  {/* 垂直参考线 */}
                  <line x1="320" y1="40" x2="320" y2="360" stroke="#999" strokeDasharray="6 6" />
                  <line x1="460" y1="40" x2="460" y2="360" stroke="#999" strokeDasharray="6 6" />
                  
                  {/* 阶段文字 */}
                  <g fontSize="15" textAnchor="middle">
                    <text x="160" y="390" fill="#4682ff">第一曲线 · 成熟期</text>
                    <text x="320" y="100" fill="#4682ff">峰值</text>
                    <text x="560" y="390" fill="#4682ff">衰退期</text>
                    
                    <text x="260" y="330" fill="#50c878">启动期</text>
                    <text x="460" y="200" fill="#50c878">转型期</text>
                    <text x="700" y="120" fill="#50c878">超越期</text>
                  </g>
                  
                  {/* 区域标注 */}
                  <g fontSize="15" fill="#333" opacity="0.85">
                    <text x="390" y="320" textAnchor="middle">转型期</text>
                    <text x="640" y="260" textAnchor="middle">超越期</text>
                  </g>
                  
                  {/* 轴标题 */}
                  <text x="390" y="430" fontSize="16" fill="#555">时间</text>
                  <text x="-60" y="200" fontSize="16" fill="#555" transform="rotate(-90 -60 200)">增长值</text>
                  
                  {/* 图例 */}
                  <g transform="translate(560,20)">
                    <rect x="0" y="0" width="220" height="70" rx="10" fill="#fff" opacity="0.95" stroke="#eee" />
                    <line x1="16" y1="26" x2="46" y2="26" stroke="#4682ff" strokeWidth="3" />
                    <text x="56" y="30" fontSize="14" fill="#333">第一曲线（现有发展）</text>
                    <line x1="16" y1="48" x2="46" y2="48" stroke="#50c878" strokeWidth="3" />
                    <text x="56" y="52" fontSize="14" fill="#333">第二曲线（新增长）</text>
                  </g>
                  
                </g>
              </svg>
            </div>
          </div>
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
              <XAxis dataKey="time" stroke={chartConfig.axis.stroke} label={{ value: '时间', position: 'insideBottom', offset: 0, fontSize: chartConfig.fontSize.axisLabel }} />
              <YAxis stroke={chartConfig.axis.stroke} label={{ value: '动能值', angle: -90, position: 'insideLeft', fontSize: chartConfig.fontSize.axisLabel }} domain={[0, 'dataMax + 10']} />
              <Legend wrapperStyle={chartConfig.legend.wrapperStyle} />
              <Area type="monotone" dataKey="momentum" stroke={chartConfig.colors.primary} fill="url(#colorMomentum)" name="飞轮动能" />
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

            </AreaChart>
          </BaseChart>
        );
      case 'compound':
        return (
          <div className="w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 1000 800" style={{ fontFamily: 'Microsoft YaHei, PingFang SC, Hiragino Sans GB, sans-serif' }}>
              {/* 1. 渐变与滤镜定义：浅色系优化+增强立体质感 */}
              <defs>
                {/* 图表背景：更浅的渐变，视觉更清爽 */}
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fcfdff" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#f5f8ff" stopOpacity="1"/>
                </linearGradient>
                {/* 1%增长率（极浅蓝）：浅色系优化，降低深度 */}
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#bdd8f7" stopOpacity="0.45"/>
                  <stop offset="50%" stopColor="#d9e6fc" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05"/>
                </linearGradient>
                {/* 3%增长率（浅蓝）：浅色系优化，降低深度 */}
                <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9fc5e8" stopOpacity="0.45"/>
                  <stop offset="50%" stopColor="#b9d4ec" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05"/>
                </linearGradient>
                {/* 5%增长率（淡蓝）：浅色系优化，降低深度（核心曲线仍有区分度） */}
                <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7ba7d6" stopOpacity="0.45"/>
                  <stop offset="50%" stopColor="#9ab9e0" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05"/>
                </linearGradient>
                {/* 阴影滤镜：给数据点和填充区域加轻微阴影，增强立体感 */}
                <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.2"/>
                </filter>
                {/* 高光滤镜：曲线高亮效果，提升精致度 */}
                <filter id="highlightFilter" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="1" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* 2. 背景绘制：双层矩形+圆角，营造立体层次感（背景更浅） */}
              {/* 底层阴影矩形（更浅颜色，降低视觉重量） */}
              <rect x="40" y="90" width="920" height="600" fill="#f0f4f9" rx="6" ry="6" opacity="0.5"/>
              {/* 上层主背景矩形（浅色系渐变） */}
              <rect x="50" y="100" width="900" height="600" fill="url(#bgGradient)" rx="6" ry="6"/>

              {/* 3. 坐标轴优化：加粗线条+刻度装饰，更精致清晰（颜色不变，保证可读性） */}
              {/* X轴（时间：0-30，优化刻度密度） */}
              <line x1="120" y1="600" x2="900" y2="600" stroke="#2d3748" strokeWidth="2.5"/>
              {/* X轴底部装饰线：增强视觉边界 */}
              <line x1="120" y1="600" x2="900" y2="605" stroke="#cbd5e1" strokeWidth="1"/>
              {/* Y轴（增长倍数：0-20，优化刻度分布） */}
              <line x1="120" y1="150" x2="120" y2="600" stroke="#2d3748" strokeWidth="2.5"/>
              {/* Y轴左侧装饰线：增强视觉边界 */}
              <line x1="115" y1="150" x2="115" y2="600" stroke="#cbd5e1" strokeWidth="1"/>
              
              {/* X轴刻度与标注（优化间距，更整齐） */}
              <g id="x-axis-ticks">
                <line x1="120" y1="600" x2="120" y2="610" stroke="#2d3748" strokeWidth="2.5"/>
                <line x1="280" y1="600" x2="280" y2="610" stroke="#2d3748" strokeWidth="2.5"/>
                <line x1="440" y1="600" x2="440" y2="610" stroke="#2d3748" strokeWidth="2.5"/>
                <line x1="600" y1="600" x2="600" y2="610" stroke="#2d3748" strokeWidth="2.5"/>
                <line x1="760" y1="600" x2="760" y2="610" stroke="#2d3748" strokeWidth="2.5"/>
                <line x1="900" y1="600" x2="900" y2="610" stroke="#2d3748" strokeWidth="2.5"/>
                <text x="120" y="635" fontSize="13" fill="#4a5568" fontWeight="500">0</text>
                <text x="280" y="635" fontSize="13" fill="#4a5568" fontWeight="500">10</text>
                <text x="440" y="635" fontSize="13" fill="#4a5568" fontWeight="500">20</text>
                <text x="600" y="635" fontSize="13" fill="#4a5568" fontWeight="500">25</text>
                <text x="760" y="635" fontSize="13" fill="#4a5568" fontWeight="500">28</text>
                <text x="900" y="635" fontSize="13" fill="#4a5568" fontWeight="500">30</text>
              </g>
              
              {/* Y轴刻度与标注（增加半刻度，更精准） */}
              <g id="y-axis-ticks">
                <line x1="120" y1="600" x2="110" y2="600" stroke="#2d3748" strokeWidth="2.5"/>
                <line x1="120" y1="550" x2="110" y2="550" stroke="#2d3748" strokeWidth="1.5"/>
                <line x1="120" y1="500" x2="110" y2="500" stroke="#2d3748" strokeWidth="2.5"/>
                <line x1="120" y1="450" x2="110" y2="450" stroke="#2d3748" strokeWidth="1.5"/>
                <line x1="120" y1="400" x2="110" y2="400" stroke="#2d3748" strokeWidth="2.5"/>
                <line x1="120" y1="350" x2="110" y2="350" stroke="#2d3748" strokeWidth="1.5"/>
                <line x1="120" y1="300" x2="110" y2="300" stroke="#2d3748" strokeWidth="2.5"/>
                <line x1="120" y1="250" x2="110" y2="250" stroke="#2d3748" strokeWidth="1.5"/>
                <line x1="120" y1="200" x2="110" y2="200" stroke="#2d3748" strokeWidth="2.5"/>
                <line x1="120" y1="150" x2="110" y2="150" stroke="#2d3748" strokeWidth="2.5"/>
                <text x="85" y="600" fontSize="13" fill="#4a5568" fontWeight="500">0</text>
                <text x="85" y="500" fontSize="13" fill="#4a5568" fontWeight="500">5</text>
                <text x="85" y="400" fontSize="13" fill="#4a5568" fontWeight="500">10</text>
                <text x="85" y="300" fontSize="13" fill="#4a5568" fontWeight="500">15</text>
                <text x="85" y="200" fontSize="13" fill="#4a5568" fontWeight="500">20</text>
                <text x="85" y="150" fontSize="13" fill="#4a5568" fontWeight="500">25</text>
              </g>

              {/* 4. 时间阶段参考线：浅色系虚线，降低视觉深度 */}
              {/* 短期/中期分界 */}
              <line x1="280" y1="150" x2="280" y2="600" stroke="#b0bccc" strokeWidth="1.2" strokeDasharray="6,4"/>
              {/* 中期/长期分界 */}
              <line x1="760" y1="150" x2="760" y2="600" stroke="#b0bccc" strokeWidth="1.2" strokeDasharray="6,4"/>
              {/* 阶段标签背景（浅色矩形，突出文字，无重叠） */}
              <rect x="150" y="570" width="120" height="25" fill="#e0e7ff" rx="4" ry="4" opacity="0.6"/>
              <rect x="350" y="570" width="120" height="25" fill="#e0e7ff" rx="4" ry="4" opacity="0.6"/>
              <rect x="700" y="570" width="120" height="25" fill="#e0e7ff" rx="4" ry="4" opacity="0.6"/>
              {/* 时间阶段名称 */}
              <text x="210" y="585" fontSize="15" fill="#2d3748" fontWeight="bold">短期</text>
              <text x="410" y="585" fontSize="15" fill="#2d3748" fontWeight="bold">中期</text>
              <text x="760" y="585" fontSize="15" fill="#2d3748" fontWeight="bold">长期</text>

              {/* 5. 三条复利曲线：优化路径+添加滤镜，更平滑形象（浅色系） */}
              {/* 5.1 1%增长率（极浅蓝）：填充+阴影滤镜 */}
              <path d="M120,600 Q200,570 280,540 T440,500 T600,470 T760,440 T900,410 L900,600 L120,600 Z"
                    fill="url(#gradient1)" stroke="none" filter="url(#shadowFilter)"/>
              <path d="M120,600 Q200,570 280,540 T440,500 T600,470 T760,440 T900,410"
                    stroke="#bdd8f7" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"
                    filter="url(#highlightFilter)"/>

              {/* 5.2 3%增长率（浅蓝）：填充+阴影滤镜 */}
              <path d="M120,600 Q200,530 280,480 T440,400 T600,320 T760,250 T900,180 L900,600 L120,600 Z"
                    fill="url(#gradient3)" stroke="none" filter="url(#shadowFilter)"/>
              <path d="M120,600 Q200,530 280,480 T440,400 T600,320 T760,250 T900,180"
                    stroke="#9fc5e8" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"
                    filter="url(#highlightFilter)"/>

              {/* 5.3 5%增长率（淡蓝）：填充+阴影滤镜，突出指数增长 */}
              <path d="M120,600 Q200,500 280,430 T440,300 T600,200 T760,160 T900,150 L900,600 L120,600 Z"
                    fill="url(#gradient5)" stroke="none" filter="url(#shadowFilter)"/>
              <path d="M120,600 Q200,500 280,430 T440,300 T600,200 T760,160 T900,150"
                    stroke="#7ba7d6" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"
                    filter="url(#highlightFilter)"/>

              {/* 6. 关键数据点：优化样式+双层圆点，更精致醒目（浅色系） */}
              {/* 1%增长率数据点（双层圆点：底色+描边，立体感） */}
              <g fill="#bdd8f7" filter="url(#shadowFilter)">
                  <circle cx="120" cy="600" r="6" stroke="#fff" strokeWidth="2"/>
                  <circle cx="120" cy="600" r="5" stroke="#9fc5e8" strokeWidth="1"/>
                  <circle cx="280" cy="540" r="6" stroke="#fff" strokeWidth="2"/>
                  <circle cx="280" cy="540" r="5" stroke="#9fc5e8" strokeWidth="1"/>
                  <circle cx="440" cy="500" r="6" stroke="#fff" strokeWidth="2"/>
                  <circle cx="440" cy="500" r="5" stroke="#9fc5e8" strokeWidth="1"/>
                  <circle cx="900" cy="410" r="6" stroke="#fff" strokeWidth="2"/>
                  <circle cx="900" cy="410" r="5" stroke="#9fc5e8" strokeWidth="1"/>
              </g>
              {/* 1%增长率倍数标注（添加背景框，更清晰，无重叠） */}
              <text x="280" y="520" fontSize="12" fill="#2d3748" fontWeight="bold">≈1.3倍</text>
              <text x="440" y="480" fontSize="12" fill="#2d3748" fontWeight="bold">≈1.7倍</text>
              <text x="900" y="390" fontSize="12" fill="#2d3748" fontWeight="bold">≈2.1倍</text>

              {/* 3%增长率数据点 */}
              <g fill="#9fc5e8" filter="url(#shadowFilter)">
                  <circle cx="120" cy="600" r="6" stroke="#fff" strokeWidth="2"/>
                  <circle cx="120" cy="600" r="5" stroke="#7ba7d6" strokeWidth="1"/>
                  <circle cx="280" cy="480" r="6" stroke="#fff" strokeWidth="2"/>
                  <circle cx="280" cy="480" r="5" stroke="#7ba7d6" strokeWidth="1"/>
                  <circle cx="440" cy="400" r="6" stroke="#fff" strokeWidth="2"/>
                  <circle cx="440" cy="400" r="5" stroke="#7ba7d6" strokeWidth="1"/>
                  <circle cx="900" cy="180" r="6" stroke="#fff" strokeWidth="2"/>
                  <circle cx="900" cy="180" r="5" stroke="#7ba7d6" strokeWidth="1"/>
              </g>
              {/* 3%增长率倍数标注 */}
              <text x="280" y="460" fontSize="12" fill="#2d3748" fontWeight="bold">≈2.5倍</text>
              <text x="440" y="380" fontSize="12" fill="#2d3748" fontWeight="bold">≈4.8倍</text>
              <text x="900" y="160" fontSize="12" fill="#2d3748" fontWeight="bold">≈8.1倍</text>

              {/* 5%增长率数据点（突出显示，强调指数增长） */}
              <g fill="#7ba7d6" filter="url(#shadowFilter)">
                  <circle cx="120" cy="600" r="7" stroke="#fff" strokeWidth="2"/>
                  <circle cx="120" cy="600" r="5.5" stroke="#6a93c5" strokeWidth="1"/>
                  <circle cx="280" cy="430" r="7" stroke="#fff" strokeWidth="2"/>
                  <circle cx="280" cy="430" r="5.5" stroke="#6a93c5" strokeWidth="1"/>
                  <circle cx="440" cy="300" r="7" stroke="#fff" strokeWidth="2"/>
                  <circle cx="440" cy="300" r="5.5" stroke="#6a93c5" strokeWidth="1"/>
                  <circle cx="900" cy="150" r="7" stroke="#fff" strokeWidth="2"/>
                  <circle cx="900" cy="150" r="5.5" stroke="#6a93c5" strokeWidth="1"/>
              </g>
              {/* 5%增长率倍数标注（加大字体，更醒目） */}
              <text x="280" y="410" fontSize="13" fill="#2d3748" fontWeight="bold">≈4.5倍</text>
              <text x="440" y="280" fontSize="13" fill="#2d3748" fontWeight="bold">≈12.2倍</text>
              <text x="900" y="130" fontSize="13" fill="#2d3748" fontWeight="bold">≈20.1倍</text>

              {/* 7. 文字标注：优化层级+样式，更精致易读（移除右上角重叠元素） */}
              {/* 主标题（加大字体+加粗，突出主题） */}
              <text x="500" y="65" fontSize="28" fill="#1a202c" fontWeight="bold">复利效应 - 长期增长模型</text>
              {/* 副标题（添加文字阴影，增强可读性） */}
              <text x="500" y="95" fontSize="15" fill="#718096" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.8)' }}>
                  微小的正向行动，通过时间的持续积累，最终产生指数级的结果
              </text>
              
              {/* 曲线标注（添加背景矩形，突出文字，无重叠） */}
              <rect x="820" y="395" width="70" height="20" fill="#fff" rx="3" ry="3" opacity="0.7"/>
              <text x="855" y="405" fontSize="14" fill="#bdd8f7" fontWeight="bold">1%增长率</text>
              <rect x="820" y="165" width="70" height="20" fill="#fff" rx="3" ry="3" opacity="0.7"/>
              <text x="855" y="175" fontSize="14" fill="#9fc5e8" fontWeight="bold">3%增长率</text>
              <rect x="820" y="135" width="70" height="20" fill="#fff" rx="3" ry="3" opacity="0.7"/>
              <text x="855" y="145" fontSize="14" fill="#7ba7d6" fontWeight="bold">5%增长率</text>
              
              {/* 坐标轴标题（加大字体+加粗，更醒目） */}
              <text x="510" y="670" fontSize="18" fill="#2d3748" fontWeight="500">时间（单位：年/周期）</text>
              <text x="40" y="375" fontSize="18" fill="#2d3748" fontWeight="500" transform="rotate(-90,40,375)">增长倍数（倍）</text>

              {/* 8. 增长率说明（移至底部，避免重叠，布局整洁） */}
              <g id="legend" transform="translate(350, 700)">
                  {/* 图例标题 */}
                  <text x="100" y="0" fontSize="14" fill="#2d3748" fontWeight="bold" textAnchor="middle">增长率说明</text>
                  {/* 1%增长率图例（横向排列，无重叠） */}
                  <rect x="50" y="20" width="18" height="10" fill="url(#gradient1)" stroke="#bdd8f7" strokeWidth="1.5" rx="2" ry="2"/>
                  <text x="80" y="25" fontSize="13" fill="#4a5568" textAnchor="start">1% 每日/每期增长率</text>
                  {/* 3%增长率图例 */}
                  <rect x="200" y="20" width="18" height="10" fill="url(#gradient3)" stroke="#9fc5e8" strokeWidth="1.5" rx="2" ry="2"/>
                  <text x="230" y="25" fontSize="13" fill="#4a5568" textAnchor="start">3% 每日/每期增长率</text>
                  {/* 5%增长率图例 */}
                  <rect x="350" y="20" width="18" height="10" fill="url(#gradient5)" stroke="#7ba7d6" strokeWidth="1.5" rx="2" ry="2"/>
                  <text x="380" y="25" fontSize="13" fill="#4a5568" textAnchor="start">5% 每日/每期增长率</text>
              </g>

              {/* 9. 底部备注：补充说明，更实用形象（与图例分层，无重叠） */}
              <text x="500" y="750" fontSize="12" fill="#718096" style={{ textAnchor: 'middle' }}>
                  备注：以上数据基于复利公式 FV = PV × (1 + r)^n 模拟，仅作视觉演示，不构成投资建议
              </text>
            </svg>
          </div>
        );
      case 'dopamine':
        return (
          <div className="w-full h-full">
            <div className="container" style={{ maxWidth: '100%', padding: '20px' }}>
              <div className="header">
                <h1>多巴胺曲线 - 情绪与动机管理</h1>
                <p>展示多巴胺水平随时间的变化，帮助管理情绪和动机。<br />“理解快乐的代价，培养延迟满足的能力。”</p>
              </div>
              
              {/* 核心概念卡片 */}
              <div className="cards-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '10px' }}>
                {/* 核心原理 */}
                <div className="card" style={{ background: '#fff5f5', borderRadius: '16px', padding: '24px 20px', textAlign: 'center', transition: 'transform 0.3s ease, boxShadow 0.3s ease', border: '1px solid #fed7d7', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="card-icon" style={{ fontSize: '42px', marginBottom: '15px', display: 'block', height: '50px', lineHeight: '50px' }}>🧠</span>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: '#c05621' }}>核心原理</h3>
                  <p style={{ fontSize: '13px', color: '#744210', margin: 0, lineHeight: '1.6', textAlign: 'left' }}>多巴胺是“欲望分子”，通过奖赏预测误差机制运作。即时满足（如刷视频）会导致多巴胺飙升后迅速跌落至基线以下，引发空虚感。</p>
                </div>
                {/* 操作建议 */}
                <div className="card" style={{ background: '#fff5f5', borderRadius: '16px', padding: '24px 20px', textAlign: 'center', transition: 'transform 0.3s ease, boxShadow 0.3s ease', border: '1px solid #fed7d7', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="card-icon" style={{ fontSize: '42px', marginBottom: '15px', display: 'block', height: '50px', lineHeight: '50px' }}>🛡️</span>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: '#c05621' }}>操作建议</h3>
                  <p style={{ fontSize: '13px', color: '#744210', margin: 0, lineHeight: '1.6', textAlign: 'left' }}>1. 觉察“多巴胺陷阱”，避免成瘾行为。<br />2. 练习<strong>延迟满足</strong>，忍受初期的不适。<br />3. 建立健康的“多巴胺基线”（运动、睡眠）。<br />4. 设置阶梯式奖励。</p>
                </div>
                {/* 实践案例 */}
                <div className="card" style={{ background: '#fff5f5', borderRadius: '16px', padding: '24px 20px', textAlign: 'center', transition: 'transform 0.3s ease, boxShadow 0.3s ease', border: '1px solid #fed7d7', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="card-icon" style={{ fontSize: '42px', marginBottom: '15px', display: 'block', height: '50px', lineHeight: '50px' }}>🏃</span>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: '#c05621' }}>实践案例</h3>
                  <p style={{ fontSize: '13px', color: '#744210', margin: 0, lineHeight: '1.6', textAlign: 'left' }}><strong>行动：</strong>限制短视频时间，改为阅读或散步。<br /><strong>策略：</strong>完成困难任务后再奖励自己一杯咖啡，而非边做边享受。</p>
                </div>
              </div>
              
              {/* 核心图表区 */}
              <div className="chart-wrapper" style={{ position: 'relative', background: 'linear-gradient(180deg, #ffffff 0%, #fffaf0 100%)', borderRadius: '20px', border: '1px solid #feebc8', padding: '20px', marginTop: '10px' }}>
                
                <svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    {/* 渐变定义 */}
                    <linearGradient id="gradDopamine" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#ED8936', stopOpacity: 0.4 }} />
                      <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.05 }} />
                    </linearGradient>
                    
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx={0} dy={2} stdDeviation={2} floodColor="#000" floodOpacity={0.1} />
                    </filter>
                    
                    {/* 箭头标记 */}
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                      <path d="M0,0 L0,6 L9,3 z" fill="#CBD5E0" />
                    </marker>
                  </defs>
                  
                  {/* 坐标轴 */}
                  <line x1="50" y1="400" x2="750" y2="400" stroke="#CBD5E0" strokeWidth="2" markerEnd="url(#arrow)" />
                  <line x1="50" y1="400" x2="50" y2="50" stroke="#CBD5E0" strokeWidth="2" markerEnd="url(#arrow)" />
                  
                  {/* 坐标标签 */}
                  <text x="750" y="430" textAnchor="end" fontSize="14" fill="#718096" fontWeight="bold">时间 (Time) →</text>
                  <text x="40" y="50" textAnchor="end" fontSize="14" fill="#718096" fontWeight="bold" writingMode="tb">← 多巴胺水平 (Level)</text>
                  
                  {/* 基线参考线 (Baseline) */}
                  <line x1="50" y1="300" x2="750" y2="300" stroke="#A0AEC0" strokeWidth="1" strokeDasharray="6,4" />
                  <text x="60" y="290" fontSize="12" fill="#718096" fontStyle="italic">基线水平 (Baseline)</text>
                  
                  {/* 多巴胺曲线 (Orange): Rise -> Peak -> Drop -> Recover */}
                  <path d="M50 300 C 100 300, 150 100, 200 100 C 250 100, 300 350, 350 350 C 500 350, 600 300, 750 300" fill="none" stroke="#ED8936" strokeWidth="3" />
                  <path d="M50 300 C 100 300, 150 100, 200 100 C 250 100, 300 350, 350 350 C 500 350, 600 300, 750 300 V 400 H 50 Z" fill="url(#gradDopamine)" style={{ mixBlendMode: 'normal' }} />
                  
                  {/* 关键节点数据点 (White border circles) */}
                  
                  {/* 1. 期待阶段 Start */}
                  <circle cx="100" cy="250" r="6" fill="#ED8936" stroke="white" strokeWidth="2" />
                  <text x="100" y="235" textAnchor="middle" fontSize="12" fill="#C05621" fontWeight="bold">期待阶段</text>
                  
                  {/* 2. 峰值释放 Peak */}
                  <circle cx="200" cy="100" r="6" fill="#ED8936" stroke="white" strokeWidth="2" />
                  <text x="200" y="85" textAnchor="middle" fontSize="12" fill="#C05621" fontWeight="bold">峰值释放</text>
                  <text x="200" y="65" textAnchor="middle" fontSize="10" fill="#DD6B20">(即时满足)</text>
                  
                  {/* 3. 快速下降 Crash */}
                  <circle cx="350" cy="350" r="6" fill="#ED8936" stroke="white" strokeWidth="2" />
                  <text x="350" y="375" textAnchor="middle" fontSize="12" fill="#C05621" fontWeight="bold">快速下降</text>
                  <text x="350" y="390" textAnchor="middle" fontSize="10" fill="#DD6B20">(戒断/空虚)</text>
                  
                  {/* 4. 恢复基线 Recovery */}
                  <circle cx="650" cy="305" r="6" fill="#ED8936" stroke="white" strokeWidth="2" />
                  <text x="650" y="290" textAnchor="middle" fontSize="12" fill="#C05621" fontWeight="bold">恢复基线</text>
                  
                  {/* 区域标注 */}
                  <text x="200" y="420" textAnchor="middle" fontSize="12" fill="#DD6B20" fontWeight="bold">即时满足区 (高刺激)</text>
                  <text x="550" y="420" textAnchor="middle" fontSize="12" fill="#718096" fontWeight="bold">延迟满足区 (平稳恢复)</text>
                  
                  {/* 图例 */}
                  <g transform="translate(630, 30)">
                    <rect x="0" y="0" width="120" height="40" fill="rgba(255,255,255,0.9)" stroke="#FEEBC8" rx="4" />
                    <line x1="15" y1="20" x2="45" y2="20" stroke="#ED8936" strokeWidth="3" />
                    <text x="55" y="24" fontSize="12" fill="#C05621">多巴胺水平</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        );
      case 'flow':
        return (
          <div className="w-full h-full">
            <div className="container" style={{ maxWidth: '100%', padding: '20px' }}>
              <div className="header">
                <h1>心流通道 - 专注与幸福的模型</h1>
                <p>当任务挑战与个人能力完美匹配时，我们将进入全神贯注的最优体验状态。<br />“忘记时间，享受当下。”</p>
              </div>
              
              {/* 核心概念卡片 */}
              <div className="cards-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '10px' }}>
                {/* 核心原理 */}
                <div className="card" style={{ background: '#f0fdfa', borderRadius: '16px', padding: '24px 20px', textAlign: 'center', transition: 'transform 0.3s ease, boxShadow 0.3s ease', border: '1px solid #ccfbf1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="card-icon" style={{ fontSize: '42px', marginBottom: '15px', display: 'block', height: '50px', lineHeight: '50px' }}>🌊</span>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: '#0d9488' }}>核心原理</h3>
                  <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: '1.6', textAlign: 'left' }}>心流（Flow）是一种精神熵极低的状态。在此时，你的技能足以应对挑战，目标明确，反馈即时，自我意识消失，时间感扭曲。</p>
                </div>
                {/* 操作建议 */}
                <div className="card" style={{ background: '#f0fdfa', borderRadius: '16px', padding: '24px 20px', textAlign: 'center', transition: 'transform 0.3s ease, boxShadow 0.3s ease', border: '1px solid #ccfbf1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="card-icon" style={{ fontSize: '42px', marginBottom: '15px', display: 'block', height: '50px', lineHeight: '50px' }}>🎚️</span>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: '#0d9488' }}>操作建议</h3>
                  <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: '1.6', textAlign: 'left' }}>1. <strong>动态调整</strong>：焦虑时拆解任务（降难度），无聊时增加限制（提难度）。<br />2. <strong>环境设计</strong>：物理隔绝干扰。<br />3. <strong>单一聚焦</strong>：拒绝多任务处理。</p>
                </div>
                {/* 实践案例 */}
                <div className="card" style={{ background: '#f0fdfa', borderRadius: '16px', padding: '24px 20px', textAlign: 'center', transition: 'transform 0.3s ease, boxShadow 0.3s ease', border: '1px solid #ccfbf1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="card-icon" style={{ fontSize: '42px', marginBottom: '15px', display: 'block', height: '50px', lineHeight: '50px' }}>🎯</span>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: '#0d9488' }}>实践案例</h3>
                  <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: '1.6', textAlign: 'left' }}>1. 工作：使用番茄钟，设定“跳一跳够得着”的KPI。<br />2. 学习：如果书太难读不下去，先看导读或视频（提升能力/降低门槛）。<br />3. 记录：建立“心流日记”。</p>
                </div>
              </div>
              
              {/* 核心图表区 */}
              <div className="chart-wrapper" style={{ position: 'relative', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '20px', marginTop: '10px' }}>
                <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    {/* 区域渐变定义 */}
                    {/* 焦虑区 (红色) */}
                    <linearGradient id="gradAnxiety" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#EF4444', stopOpacity: 0.25 }} />
                      <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 0.05 }} />
                    </linearGradient>
                    {/* 无聊区 (黄色) */}
                    <linearGradient id="gradBoredom" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#F59E0B', stopOpacity: 0.25 }} />
                      <stop offset="100%" style={{ stopColor: '#F59E0B', stopOpacity: 0.05 }} />
                    </linearGradient>
                    {/* 心流区 (绿色) */}
                    <linearGradient id="gradFlow" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: '#10B981', stopOpacity: 0.1 }} />
                    </linearGradient>
                    {/* 放松区 (蓝色) */}
                    <linearGradient id="gradRelax" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.25 }} />
                      <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 0.05 }} />
                    </linearGradient>
                    
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx={0} dy={2} stdDeviation={2} floodColor="#000" floodOpacity={0.1} />
                    </filter>
                  </defs>
                  
                  {/* 坐标系背景网格 (淡化) */}
                  <g stroke="#E2E8F0" strokeWidth="1">
                    <line x1="50" y1="150" x2="750" y2="150" />
                    <line x1="50" y1="250" x2="750" y2="250" />
                    <line x1="50" y1="350" x2="750" y2="350" />
                    <line x1="50" y1="450" x2="750" y2="450" />
                    <line x1="225" y1="50" x2="225" y2="550" />
                    <line x1="400" y1="50" x2="400" y2="550" />
                    <line x1="575" y1="50" x2="575" y2="550" />
                  </g>
                  
                  {/* 坐标轴 */}
                  {/* Y轴: 个人能力 (550 -> 50) */}
                  <line x1="50" y1="550" x2="50" y2="50" stroke="#94A3B8" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="40" y="50" textAnchor="end" fontSize="14" fill="#64748B" fontWeight="bold" writingMode="tb">← 个人能力 (Ability)</text>
                  
                  {/* X轴: 挑战难度 (50 -> 750) */}
                  <line x1="50" y1="550" x2="750" y2="550" stroke="#94A3B8" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="750" y="580" textAnchor="end" fontSize="14" fill="#64748B" fontWeight="bold">挑战难度 (Challenge) →</text>
                  
                  {/* 箭头定义 */}
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#94A3B8" />
                  </marker>
                  
                  {/* 区域绘制 */}
                  
                  {/* 1. 焦虑区 (Anxiety): 高挑战(X大)，低能力(Y小-坐标系中Y值大) */}
                  <path d="M250 550 L 750 550 L 750 250 Z" fill="url(#gradAnxiety)" />
                  
                  {/* 2. 无聊区 (Boredom): 低挑战(X小)，高能力(Y大-坐标系中Y值小) */}
                  <path d="M50 50 L 50 350 L 350 50 Z" fill="url(#gradBoredom)" />
                  
                  {/* 3. 放松区 (Relaxation): 低挑战，低能力 */}
                  <path d="M50 550 L 250 550 L 50 350 Z" fill="url(#gradRelax)" />
                  
                  {/* 4. 心流区 (Flow): 匹配通道 */}
                  <path d="M50 350 L 350 50 L 750 250 L 250 550 Z" fill="url(#gradFlow)" />
                  
                  {/* 分隔线 (虚线) */}
                  <line x1="50" y1="350" x2="350" y2="50" stroke="#CBD5E0" strokeWidth="2" strokeDasharray="6,4" />
                  <line x1="250" y1="550" x2="750" y2="250" stroke="#CBD5E0" strokeWidth="2" strokeDasharray="6,4" />
                  
                  {/* 心流理想线 (45度实线) */}
                  <line x1="50" y1="550" x2="700" y2="100" stroke="#10B981" strokeWidth="3" strokeLinecap="round" className="flow-line" />
                  
                  {/* 图标与文字标注 */}
                  
                  {/* 焦虑区 */}
                  <g transform="translate(600, 480)">
                    <text x="0" y="0" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#B91C1C">焦虑区</text>
                    <text x="0" y="20" textAnchor="middle" fontSize="12" fill="#B91C1C" opacity="0.8">能力 &lt; 挑战</text>
                    {/* 皱眉图标 */}
                    <circle cx="0" cy="-40" r="25" fill="none" stroke="#B91C1C" strokeWidth="2" />
                    <path d="M-8 -45 L-2 -45 M 2 -45 L 8 -45" stroke="#B91C1C" strokeWidth="2" />
                    <path d="M-10 -30 Q 0 -40 10 -30" fill="none" stroke="#B91C1C" strokeWidth="2" /> {/* 皱嘴 */}
                  </g>
                  
                  {/* 无聊区 */}
                  <g transform="translate(150, 150)">
                    <text x="0" y="0" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#B45309">无聊区</text>
                    <text x="0" y="20" textAnchor="middle" fontSize="12" fill="#B45309" opacity="0.8">能力 &gt; 挑战</text>
                    {/* 打哈欠图标 */}
                    <circle cx="0" cy="-40" r="25" fill="none" stroke="#B45309" strokeWidth="2" />
                    <path d="M-8 -45 L-2 -45 M 2 -45 L 8 -45" stroke="#B45309" strokeWidth="2" />
                    <circle cx="0" cy="-28" r="6" fill="#B45309" /> {/* 张嘴 */}
                  </g>
                  
                  {/* 放松区 */}
                  <g transform="translate(100, 500)">
                    <text x="0" y="0" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1D4ED8">放松区</text>
                    <text x="0" y="20" textAnchor="middle" fontSize="10" fill="#1D4ED8" opacity="0.8">低能低挑战</text>
                    {/* 休息图标 (Zzz) */}
                    <text x="0" y="-30" textAnchor="middle" fontSize="24" fill="#1D4ED8">💤</text>
                  </g>
                  
                  {/* 心流区 */}
                  <g transform="translate(400, 300)">
                    <circle cx="0" cy="-40" r="40" fill="white" stroke="#10B981" strokeWidth="2" opacity="0.8" />
                    <text x="0" y="10" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#047857">心流通道</text>
                    <text x="0" y="35" textAnchor="middle" fontSize="12" fill="#047857">最佳体验状态</text>
                    {/* 专注图标 */}
                    <path d="M-15 -40 L-5 -40 M 5 -40 L 15 -40" stroke="#047857" strokeWidth="3" />
                    <path d="M-10 -25 Q 0 -15 10 -25" fill="none" stroke="#047857" strokeWidth="2" /> {/* 微笑 */}
                    <path d="M-20 -50 L -25 -60 M 20 -50 L 25 -60 M 0 -65 L 0 -75" stroke="#047857" strokeWidth="2" /> {/* 发光/专注线 */}
                  </g>
                  
                  {/* 图例 */}
                  <g transform="translate(620, 50)">
                    <rect x="0" y="0" width="130" height="110" fill="rgba(255,255,255,0.9)" stroke="#E2E8F0" rx="4" />
                    
                    {/* Legend Items */}
                    <rect x="15" y="15" width="15" height="15" fill="#EF4444" fillOpacity="0.3" />
                    <text x="40" y="27" fontSize="12" fill="#334155">焦虑区</text>
                    
                    <rect x="15" y="40" width="15" height="15" fill="#F59E0B" fillOpacity="0.3" />
                    <text x="40" y="52" fontSize="12" fill="#334155">无聊区</text>
                    
                    <rect x="15" y="65" width="15" height="15" fill="#10B981" fillOpacity="0.3" />
                    <text x="40" y="77" fontSize="12" fill="#334155">心流区</text>
                    <rect x="15" y="90" width="15" height="15" fill="#3B82F6" fillOpacity="0.3" />
                    <text x="40" y="102" fontSize="12" fill="#334155">放松区</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        );
      case 'zone':
        return (
          <div className="w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 1000 800" style={{ fontFamily: 'Microsoft YaHei, PingFang SC, Hiragino Sans GB, sans-serif' }}>
              <defs>
                {/* 舒适区：浅蓝色渐变 */}
                <linearGradient id="comfortGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#4dabf7" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#73bcf7" stop-opacity="0.3"/>
                </linearGradient>
                {/* 学习区：浅绿色渐变 */}
                <linearGradient id="learnGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#51cf66" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#74d880" stop-opacity="0.3"/>
                </linearGradient>
                {/* 恐慌区：浅红色渐变 */}
                <linearGradient id="panicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#ff6b6b" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#ff8e8e" stop-opacity="0.3"/>
                </linearGradient>
                {/* 背景渐变 */}
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#fcfdff" stop-opacity="1"/>
                  <stop offset="100%" stop-color="#f5f8f9" stop-opacity="1"/>
                </linearGradient>
                {/* 轻微阴影滤镜：增强图标和数据点立体感 */}
                <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.2"/>
                </filter>
              </defs>

              {/* 背景绘制：整体浅色渐变背景，整洁视觉区域 */}
              <rect x="50" y="100" width="900" height="600" fill="url(#bgGradient)" rx="6" ry="6"/>

              {/* 辅助坐标轴绘制：清晰标注挑战难度与成长速度 */}
              {/* X轴（水平向右：任务挑战难度由低到高） */}
              <line x1="100" y1="700" x2="900" y2="700" stroke="#2d3748" stroke-width="2.5"/>
              {/* Y轴（垂直向上：个人成长速度由低到高） */}
              <line x1="100" y1="150" x2="100" y2="700" stroke="#2d3748" stroke-width="2.5"/>

              {/* X轴刻度与标注 */}
              <g id="x-axis-ticks">
                <line x1="100" y1="700" x2="100" y2="710" stroke="#2d3748" stroke-width="2.5"/>
                <line x1="366" y1="700" x2="366" y2="710" stroke="#2d3748" stroke-width="2.5"/>
                <line x1="633" y1="700" x2="633" y2="710" stroke="#2d3748" stroke-width="2.5"/>
                <line x1="900" y1="700" x2="900" y2="710" stroke="#2d3748" stroke-width="2.5"/>
                {/* 刻度文字 */}
                <text x="100" y="730" fontSize="12" fill="#4a5568" fontWeight="500">低</text>
                <text x="366" y="730" fontSize="12" fill="#4a5568" fontWeight="500">中</text>
                <text x="633" y="730" fontSize="12" fill="#4a5568" fontWeight="500">中高</text>
                <text x="900" y="730" fontSize="12" fill="#4a5568" fontWeight="500">高</text>
              </g>

              {/* Y轴刻度与标注 */}
              <g id="y-axis-ticks">
                <line x1="100" y1="700" x2="90" y2="700" stroke="#2d3748" stroke-width="2.5"/>
                <line x1="100" y1="550" x2="90" y2="550" stroke="#2d3748" stroke-width="2.5"/>
                <line x1="100" y1="400" x2="90" y2="400" stroke="#2d3748" stroke-width="2.5"/>
                <line x1="100" y1="250" x2="90" y2="250" stroke="#2d3748" stroke-width="2.5"/>
                <line x1="100" y1="150" x2="90" y2="150" stroke="#2d3748" stroke-width="2.5"/>
                {/* 刻度文字 */}
                <text x="65" y="700" fontSize="12" fill="#4a5568" fontWeight="500">低</text>
                <text x="65" y="550" fontSize="12" fill="#4a5568" fontWeight="500">中</text>
                <text x="65" y="400" fontSize="12" fill="#4a5568" fontWeight="500">中高</text>
                <text x="65" y="250" fontSize="12" fill="#4a5568" fontWeight="500">高</text>
                <text x="65" y="150" fontSize="12" fill="#4a5568" fontWeight="500">极高</text>
              </g>

              {/* 核心环形区域绘制：三层嵌套，对应舒适区、学习区、恐慌区 */}
              <g transform="translate(500, 425)">
                {/* 恐慌区（外层环形） */}
                <circle cx="0" cy="0" r="250" fill="url(#panicGradient)" />
                {/* 学习区（中层环形，宽度更宽） */}
                <circle cx="0" cy="0" r="180" fill="url(#learnGradient)" />
                {/* 舒适区（内层环形） */}
                <circle cx="0" cy="0" r="110" fill="url(#comfortGradient)" />

                {/* 区域分隔线 */}
                {/* 舒适区与学习区分隔：实线 */}
                <circle cx="0" cy="0" r="110" fill="none" stroke="#adb5bd" stroke-width="1.5" />
                {/* 学习区与恐慌区分隔：虚线 */}
                <circle cx="0" cy="0" r="180" fill="none" stroke="#adb5bd" stroke-width="1.5" stroke-dasharray="8,4" />

                {/* 区域图标绘制：对应场景简笔画 */}
                {/* 舒适区：沙发图标 */}
                <g transform="translate(0, -40)" filter="url(#shadowFilter)">
                    <rect x="-40" y="20" width="80" height="30" rx="4" fill="#4dabf7" opacity="0.8" stroke="#2d3748" stroke-width="1.5"/>
                    <rect x="-25" y="50" width="15" height="20" rx="2" fill="#4dabf7" opacity="0.8" stroke="#2d3748" stroke-width="1.5"/>
                    <rect x="10" y="50" width="15" height="20" rx="2" fill="#4dabf7" opacity="0.8" stroke="#2d3748" stroke-width="1.5"/>
                    <path d="M-40,20 Q0,0 40,20" stroke="#2d3748" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                </g>

                {/* 学习区：书本+钢笔图标 */}
                <g transform="translate(80, 60)" filter="url(#shadowFilter)">
                    {/* 书本 */}
                    <rect x="-30" y="0" width="60" height="40" rx="2" fill="#51cf66" opacity="0.8" stroke="#2d3748" stroke-width="1.5"/>
                    <line x1="-30" y1="10" x2="30" y2="10" stroke="#2d3748" stroke-width="1.5"/>
                    {/* 钢笔 */}
                    <line x1="10" y1="0" x2="20" y2="-20" stroke="#2d3748" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M20,-20 L25,-18 L22,-12 L17,-15 Z" fill="#2d3748" opacity="0.8"/>
                </g>

                {/* 恐慌区：流汗皱眉人脸图标 */}
                <g transform="translate(-90, 80)" filter="url(#shadowFilter)">
                    <circle cx="0" cy="0" r="20" fill="#ff6b6b" opacity="0.8" stroke="#2d3748" stroke-width="1.5"/>
                    {/* 眉毛（皱眉） */}
                    <path d="M-8,-5 Q-4,-8 0,-5" stroke="#2d3748" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <path d="M0,-5 Q4,-8 8,-5" stroke="#2d3748" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    {/* 眼睛 */}
                    <circle cx="-5" cy="2" r="2" fill="#2d3748"/>
                    <circle cx="5" cy="2" r="2" fill="#2d3748"/>
                    {/* 嘴巴 */}
                    <path d="M-5,8 Q0,12 5,8" stroke="#2d3748" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    {/* 汗水 */}
                    <line x1="10" y1="-10" x2="15" y2="-15" stroke="#4dabf7" stroke-width="1" stroke-linecap="round" opacity="0.8"/>
                    <line x1="12" y1="-12" x2="17" y2="-18" stroke="#4dabf7" stroke-width="1" stroke-linecap="round" opacity="0.8"/>
                </g>

                {/* 区域文字标注 */}
                {/* 舒适区标注 */}
                <text x="0" y="-20" fontSize="16" fill="#1d4ed8" fontWeight="bold">舒适区</text>
                <text x="0" y="0" fontSize="12" fill="#4a5568">熟悉无压 · 成长停滞</text>
                {/* 学习区标注（字体更大） */}
                <text x="0" y="-140" fontSize="18" fill="#22c55e" fontWeight="bold">学习区</text>
                <text x="0" y="-120" fontSize="12" fill="#4a5568">适度挑战 · 快速成长</text>
                <text x="0" y="-100" fontSize="13" fill="#22c55e" fontWeight="bold">最优成长区间</text>
                {/* 恐慌区标注 */}
                <text x="0" y="-220" fontSize="16" fill="#e53e3e" fontWeight="bold">恐慌区</text>
                <text x="0" y="-200" fontSize="12" fill="#4a5568">难度过高 · 易放弃</text>
              </g>

              {/* 成长曲线绘制：平滑曲线展示成长趋势 */}
              <path d="M150,650 Q250,630 366,500 T633,200 T850,600"
                    stroke="#2f5496" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              <text x="500" y="300" fontSize="12" fill="#2f5496" fontWeight="500">成长趋势线</text>

              {/* 成长曲线关键节点数据点 */}
              <g filter="url(#shadowFilter)">
                  {/* 舒适区→学习区节点 */}
                  <circle cx="366" cy="500" r="6" fill="#51cf66" stroke="#ffffff" stroke-width="2"/>
                  {/* 学习区峰值节点 */}
                  <circle cx="633" cy="200" r="6" fill="#51cf66" stroke="#ffffff" stroke-width="2"/>
                  {/* 学习区→恐慌区节点 */}
                  <circle cx="850" cy="600" r="6" fill="#ff6b6b" stroke="#ffffff" stroke-width="2"/>
              </g>

              {/* 参考线：最优成长线与区域边界线 */}
              <line x1="100" y1="200" x2="900" y2="200" stroke="#2f5496" stroke-width="1.2" stroke-dasharray="6,4"/>
              <text x="920" y="200" fontSize="11" fill="#2f5496" text-anchor="start">最优成长线</text>
              <line x1="366" y1="150" x2="366" y2="700" stroke="#2f5496" stroke-width="1.2" stroke-dasharray="6,4"/>
              <text x="366" y="130" fontSize="11" fill="#2f5496" text-anchor="middle">舒适区边界</text>
              <line x1="633" y1="150" x2="633" y2="700" stroke="#2f5496" stroke-width="1.2" stroke-dasharray="6,4"/>
              <text x="633" y="130" fontSize="11" fill="#2f5496" text-anchor="middle">恐慌区边界</text>

              {/* 顶部标题与副标题 */}
              <text x="500" y="65" fontSize="28" fill="#1a202c" fontWeight="bold">舒适区模型 - 个人成长层级</text>
              <text x="500" y="95" fontSize="15" fill="#718096" width="800">
                  成长发生在学习区，逐步拓展舒适区边界实现持续进步
              </text>

              {/* 坐标轴标注 */}
              <text x="500" y="760" fontSize="18" fill="#2d3748" fontWeight="500">任务挑战难度</text>
              <text x="40" y="425" fontSize="18" fill="#2d3748" fontWeight="500" transform="rotate(-90,40,425)">个人成长速度</text>

              {/* 拓展方向标注 */}
              <text x="500" y="650" fontSize="12" fill="#4a5568" fontWeight="500">
                  拓展方向：舒适区 → 学习区 → 扩大舒适区
              </text>

              {/* 右上角图例说明 */}
              <g id="legend" transform="translate(750, 120)">
                  <text x="80" y="0" fontSize="14" fill="#2d3748" fontWeight="bold" text-anchor="middle">区域说明</text>
                  {/* 舒适区图例 */}
                  <rect x="0" y="20" width="18" height="10" fill="url(#comfortGradient)" stroke="#4dabf7" stroke-width="1.5" rx="2" ry="2"/>
                  <text x="30" y="25" fontSize="13" fill="#4a5568" text-anchor="start">舒适区</text>
                  {/* 学习区图例 */}
                  <rect x="0" y="50" width="18" height="10" fill="url(#learnGradient)" stroke="#51cf66" stroke-width="1.5" rx="2" ry="2"/>
                  <text x="30" y="55" fontSize="13" fill="#4a5568" text-anchor="start">学习区</text>
                  {/* 恐慌区图例 */}
                  <rect x="0" y="80" width="18" height="10" fill="url(#panicGradient)" stroke="#ff6b6b" stroke-width="1.5" rx="2" ry="2"/>
                  <text x="30" y="85" fontSize="13" fill="#4a5568" text-anchor="start">恐慌区</text>
              </g>
            </svg>
          </div>
        );
      case 'woop':
        return (
          <div className="w-full h-full p-0 m-0 overflow-auto" data-theme={isDark ? 'dark' : 'light'} style={{ width: '100%', height: '100%' }}>
            <style jsx>{`
              :root {
                /* 浅色模式（清晨） */
                --sky-gradient: linear-gradient(180deg, #e0f7fa 0%, #ccfbf1 100%);
                --ground-color: #f0fdf4;
                --river-color: #38bdf8;
                --bridge-color: #f59e0b;
                --text-color: #334155;
                --card-bg: rgba(255, 255, 255, 0.95);
                --card-border: #e2e8f0;
                --line-color: #94a3b8;
                
                /* 强调色 */
                --wish-color: #8b5cf6;
                --outcome-color: #10b981;
                --obstacle-color: #ef4444;
                --plan-color: #3b82f6;
              }

              [data-theme="dark"] {
                /* 深色模式（星夜） */
                --sky-gradient: linear-gradient(180deg, #0f172a 0%, #312e81 100%);
                --ground-color: #1e293b;
                --river-color: #3b82f6;
                --bridge-color: #d97706;
                --text-color: #e2e8f0;
                --card-bg: rgba(30, 41, 59, 0.95);
                --card-border: #475569;
                --line-color: #64748b;
              }

              body {
                font-family: "Microsoft YaHei", -apple-system, sans-serif;
                margin: 0;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                background: var(--sky-gradient);
                color: var(--text-color);
                transition: background 1s ease;
                overflow: hidden;
              }

              .scene-container {
                width: 100%;
                height: 100%;
                position: relative;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 0;
                margin: 0;
              }

              /* 顶部标题 - 悬浮且不干扰 */
              .header {
                position: absolute;
                top: 30px;
                z-index: 10;
                text-align: center;
                pointer-events: none;
              }

              .header h1 {
                margin: 0;
                font-size: 2.5rem;
                letter-spacing: 4px;
                text-transform: uppercase;
                background: linear-gradient(to right, var(--wish-color), var(--outcome-color));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: 900;
                text-shadow: 0 4px 10px rgba(0,0,0,0.1);
              }

              .header p {
                font-size: 1rem;
                opacity: 0.7;
                margin-top: 5px;
                font-weight: 500;
                color: var(--text-color);
              }

              /* SVG 场景层 */
              .svg-scene {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                object-fit: contain;
              }

              /* 卡片层 */
              .cards-layer {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10;
                pointer-events: none;
              }

              /* 卡片样式 - 默认折叠，悬停展开 */
              .info-card {
                position: absolute;
                width: 180px;
                height: 60px;
                background: var(--card-bg);
                border: 1px solid var(--card-border);
                border-left: 6px solid transparent;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                padding: 15px;
                box-sizing: border-box;
                pointer-events: auto;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                cursor: pointer;
              }

              /* 悬停展开状态 */
              .info-card:hover {
                width: 280px;
                height: auto;
                min-height: 140px;
                transform: scale(1.05);
                z-index: 20;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
              }

              .card-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
                flex-shrink: 0;
              }

              .icon { font-size: 1.5rem; }
              .title { font-size: 1.1rem; font-weight: 800; white-space: nowrap; }
              
              .description {
                font-size: 0.9rem;
                line-height: 1.6;
                opacity: 0;
                transition: opacity 0.3s ease 0.1s;
                color: var(--text-color);
              }
              
              .info-card:hover .description {
                opacity: 0.9;
              }

              /* 卡片定位 - 四角布局 */
              #card-wish { top: 120px; left: 40px; border-left-color: var(--wish-color); }
              #card-wish .title { color: var(--wish-color); }

              #card-outcome { top: 120px; right: 40px; border-left-color: var(--outcome-color); }
              #card-outcome .title { color: var(--outcome-color); }

              #card-obstacle { bottom: 40px; left: 40px; border-left-color: var(--obstacle-color); }
              #card-obstacle .title { color: var(--obstacle-color); }

              #card-plan { bottom: 40px; right: 40px; border-left-color: var(--plan-color); }
              #card-plan .title { color: var(--plan-color); }

              /* 切换按钮 */
              .theme-toggle {
                position: absolute;
                top: 30px;
                right: 30px;
                z-index: 50;
                background: var(--card-bg);
                border: 1px solid var(--card-border);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 1.2rem;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                transition: transform 0.2s;
              }
              .theme-toggle:hover { transform: rotate(15deg) scale(1.1); }

              /* 动画 */
              .float-element { animation: float 6s ease-in-out infinite; }
              @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
              }

              .pulse-bridge { animation: glow 3s ease-in-out infinite; }
              @keyframes glow {
                0%, 100% { stroke-opacity: 0.8; stroke-width: 6; }
                50% { stroke-opacity: 1; stroke-width: 8; }
              }

              /* 响应式 */
              @media (max-width: 1000px) {
                .info-card { width: 50px; height: 50px; padding: 10px; border-radius: 50%; }
                .info-card .title { display: none; }
                .info-card:hover { width: 260px; height: auto; border-radius: 16px; padding: 20px; }
                .info-card:hover .title { display: block; }
                .description { font-size: 0.85rem; }
                .header h1 { font-size: 1.8rem; }
              }
            `}</style>
            
            <div className="scene-container">
              <div className="header">
                <h1>WOOP 愿望之旅</h1>
                <p>从左至右，跨越障碍</p>
              </div>

              {/* SVG 场景绘制 */}
              <svg className="svg-scene" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', display: 'block' }}>
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.2"/>
                  </filter>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                    <path d="M0,0 L0,10 L10,5 z" fill="var(--line-color)" />
                  </marker>
                </defs>

                {/* 引导线 (连接卡片到场景元素) */}
                {/* Wish (左上) -> 起点小人 */}
                <path d="M 220 180 Q 250 180 320 420" fill="none" stroke="var(--line-color)" stroke-width="2" stroke-dasharray="5,5" opacity="0.5"/>
                {/* Outcome (右上) -> 终点旗帜 */}
                <path d="M 980 180 Q 950 180 880 420" fill="none" stroke="var(--line-color)" stroke-width="2" stroke-dasharray="5,5" opacity="0.5"/>
                {/* Obstacle (左下) -> 河流 */}
                <path d="M 220 620 Q 250 620 500 680" fill="none" stroke="var(--line-color)" stroke-width="2" stroke-dasharray="5,5" opacity="0.5"/>
                {/* Plan (右下) -> 桥梁 */}
                <path d="M 980 620 Q 950 620 700 550" fill="none" stroke="var(--line-color)" stroke-width="2" stroke-dasharray="5,5" opacity="0.5"/>


                {/* 1. 地面 (向中心聚拢，留出两侧) */}
                {/* 左岸 */}
                <path d="M150 500 Q 300 480 450 600 L 450 800 L 150 800 Z" fill="var(--ground-color)" stroke="var(--card-border)" stroke-width="2"/>
                {/* 右岸 */}
                <path d="M750 600 Q 900 480 1050 500 L 1050 800 L 750 800 Z" fill="var(--ground-color)" stroke="var(--card-border)" stroke-width="2"/>

                {/* 2. 河流 (障碍) - 位于画面正下方 */}
                <path d="M450 600 Q 600 650 750 600 L 750 800 L 450 800 Z" fill="var(--river-color)" opacity="0.3">
                  <animate attributeName="opacity" values="0.3;0.5;0.3" dur="4s" repeatCount="indefinite" />
                </path>
                {/* 鳄鱼/障碍物 */}
                <g transform="translate(600, 700)" className="float-element">
                  <path d="M-30 0 L-10 -20 L10 0 L30 -15 L50 0 L30 20 L-30 20 Z" fill="var(--obstacle-color)" stroke="white" stroke-width="2"/>
                  <circle cx="-15" cy="-5" r="3" fill="white"/>
                  <circle cx="25" cy="-5" r="3" fill="white"/>
                </g>

                {/* 3. 桥梁 (计划) - 连接两岸 */}
                <g transform="translate(600, 580)">
                  {/* 桥拱 */}
                  <path d="M-150 20 Q 0 -60 150 20" fill="none" stroke="var(--bridge-color)" stroke-width="6" stroke-linecap="round" className="pulse-bridge"/>
                  {/* 桥板 */}
                  <line x1="-160" y1="20" x2="160" y2="20" stroke="var(--bridge-color)" stroke-width="4" stroke-opacity="0.6"/>
                  {/* 支柱 */}
                  <line x1="-80" y1="20" x2="-80" y2="-10" stroke="var(--bridge-color)" stroke-width="2"/>
                  <line x1="80" y1="20" x2="80" y2="-10" stroke="var(--bridge-color)" stroke-width="2"/>
                  <line x1="0" y1="20" x2="0" y2="-25" stroke="var(--bridge-color)" stroke-width="2"/>
                </g>

                {/* 4. 起点 (Wish) - 位于左岸中心 */}
                <g transform="translate(320, 480)">
                  {/* 人物 */}
                  <circle cx="0" cy="-20" r="12" fill="var(--wish-color)" stroke="white" stroke-width="2"/>
                  <path d="M0 -8 L0 30 M0 30 L-10 50 M0 30 L10 50 M-10 10 L10 10" stroke="var(--text-color)" stroke-width="3" stroke-linecap="round"/>
                  {/* 思考气泡 */}
                  <circle cx="25" cy="-45" r="4" fill="var(--text-color)" opacity="0.6"/>
                  <circle cx="35" cy="-55" r="6" fill="var(--text-color)" opacity="0.6"/>
                  <path d="M40 -60 Q 60 -80 80 -60 Q 90 -40 70 -30 Q 50 -20 40 -40 Z" fill="white" stroke="var(--text-color)" stroke-width="1.5"/>
                  <text x="60" y="-45" font-size="16" text-anchor="middle" fill="var(--wish-color)">?</text>
                </g>

                {/* 5. 终点 (Outcome) - 位于右岸中心 */}
                <g transform="translate(880, 480)">
                  {/* 旗帜 */}
                  <line x1="0" y1="0" x2="0" y2="80" stroke="var(--text-color)" stroke-width="3"/>
                  <path d="M0 5 L 50 25 L 0 45 Z" fill="var(--outcome-color)" stroke="white" stroke-width="2" className="float-element"/>
                  {/* 星星 */}
                  <text x="0" y="-10" font-size="24" text-anchor="middle">✨</text>
                </g>

                {/* 动态轨迹球 */}
                <circle r="6" fill="#fbbf24" filter="url(#shadow)">
                  <animateMotion dur="5s" repeatCount="indefinite" path="M 320 480 Q 600 300 880 480" />
                </circle>

              </svg>

              {/* 卡片层 (交互区) */}
              <div className="cards-layer">
                
                {/* Wish */}
                <div className="info-card" id="card-wish">
                  <div className="card-header">
                    <span className="icon">🌟</span>
                    <span className="title">Wish 愿望</span>
                  </div>
                  <div className="description">
                    <strong>确立目标：</strong><br/>
                    站在起点，问自己：这一阶段我真正想实现的是什么？目标要具体、有挑战性。
                  </div>
                </div>

                {/* Outcome */}
                <div className="info-card" id="card-outcome">
                  <div className="card-header">
                    <span className="icon">🎯</span>
                    <span className="title">Outcome 结果</span>
                  </div>
                  <div className="description">
                    <strong>想象未来：</strong><br/>
                    闭上眼，看见那个插旗的时刻。那种成就感、那种快乐，越具体越能激发动力。
                  </div>
                </div>

                {/* Obstacle */}
                <div className="info-card" id="card-obstacle">
                  <div className="card-header">
                    <span className="icon">⚠️</span>
                    <span className="title">Obstacle 障碍</span>
                  </div>
                  <div className="description">
                    <strong>直面深渊：</strong><br/>
                    河水湍急，鳄鱼潜伏。诚实地找出阻碍你的内部恐惧或外部困难。别假装它们不存在。
                  </div>
                </div>

                {/* Plan */}
                <div className="info-card" id="card-plan">
                  <div className="card-header">
                    <span className="icon">📋</span>
                    <span className="title">Plan 计划</span>
                  </div>
                  <div className="description">
                    <strong>架桥过河：</strong><br/>
                    制定 If-Then 策略：如果（遇到鳄鱼），那么（我就走这座桥）。用预案代替焦虑。
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      case 'peakEnd':
        return (
          <div className="w-full h-full">
            <div className="peak-end-law-container" style={{ width: '100%', height: '100%', margin: '0 auto', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)', backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '8px', overflow: 'hidden', boxSizing: 'border-box' }}>
              <svg width="100%" height="100%" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid meet" style={{ fontFamily: 'Microsoft YaHei, PingFang SC, Hiragino Sans GB, sans-serif', display: 'block' }}>
                {/* 1. 渐变与滤镜定义：增强视觉区分度与立体感 */}
                <defs>
                    {/* 正向体验（愉悦）渐变 */}
                    <linearGradient id="positiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#51cf66" stop-opacity="0.3"/>
                        <stop offset="100%" stop-color="#74d880" stop-opacity="0.3"/>
                    </linearGradient>
                    {/* 负向体验（痛苦）渐变 */}
                    <linearGradient id="negativeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ff6b6b" stop-opacity="0.3"/>
                        <stop offset="100%" stop-color="#ff8e8e" stop-opacity="0.3"/>
                    </linearGradient>
                    {/* 背景渐变 */}
                    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fcfdff" stop-opacity="1"/>
                        <stop offset="100%" stop-color="#f5f8f9" stop-opacity="1"/>
                    </linearGradient>
                    {/* 轻微阴影滤镜：增强图标和锚点立体感 */}
                    <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.2"/>
                    </filter>
                    {/* 箭头标记定义（移至此处，避免重复定义） */}
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0,0 10,3.5 0,7" fill="#2f5496"/>
                    </marker>
                </defs>

                {/* 2. 整体背景绘制：浅色渐变，整洁视觉区域 */}
                <rect x="50" y="100" width="900" height="600" fill="url(#bgGradient)" rx="6" ry="6"/>

                {/* 3. 坐标轴绘制：X轴（体验时间）、Y轴（感受强度） */}
                {/* X轴（水平向右：体验时间/流程） */}
                <line x1="100" y1="450" x2="900" y2="450" stroke="#2d3748" stroke-width="2.5"/>
                {/* Y轴（垂直向上：体验感受强度） */}
                <line x1="100" y1="150" x2="100" y2="750" stroke="#2d3748" stroke-width="2.5"/>

                {/* 中性平淡线（Y轴0刻度） */}
                <line x1="100" y1="450" x2="900" y2="450" stroke="#adb5bd" stroke-width="1.5" stroke-dasharray="6,4"/>

                {/* X轴刻度与标注（优化间距，避免文字拥挤） */}
                <g id="x-axis-ticks">
                    <line x1="100" y1="450" x2="100" y2="460" stroke="#2d3748" stroke-width="2.5"/>
                    <line x1="300" y1="450" x2="300" y2="460" stroke="#2d3748" stroke-width="2.5"/>
                    <line x1="500" y1="450" x2="500" y2="460" stroke="#2d3748" stroke-width="2.5"/>
                    <line x1="700" y1="450" x2="700" y2="460" stroke="#2d3748" stroke-width="2.5"/>
                    <line x1="900" y1="450" x2="900" y2="460" stroke="#2d3748" stroke-width="2.5"/>
                    {/* 刻度文字：优化Y轴位置，增加间距，避免重叠 */}
                    <text x="100" y="490" font-size="12" fill="#4a5568" font-weight="500">开始</text>
                    <text x="300" y="490" font-size="12" fill="#4a5568" font-weight="500">中间环节</text>
                    <text x="500" y="490" font-size="12" fill="#4a5568" font-weight="500">峰值时刻</text>
                    <text x="700" y="490" font-size="12" fill="#4a5568" font-weight="500">后期环节</text>
                    <text x="900" y="490" font-size="12" fill="#4a5568" font-weight="500">结束时刻</text>
                </g>

                {/* Y轴刻度与标注（优化文字对齐，避免和轴线重叠） */}
                <g id="y-axis-ticks">
                    <line x1="100" y1="150" x2="90" y2="150" stroke="#2d3748" stroke-width="2.5"/>
                    <line x1="100" y1="250" x2="90" y2="250" stroke="#2d3748" stroke-width="2.5"/>
                    <line x1="100" y1="350" x2="90" y2="350" stroke="#2d3748" stroke-width="2.5"/>
                    <line x1="100" y1="450" x2="90" y2="450" stroke="#2d3748" stroke-width="2.5"/>
                    <line x1="100" y1="550" x2="90" y2="550" stroke="#2d3748" stroke-width="2.5"/>
                    <line x1="100" y1="650" x2="90" y2="650" stroke="#2d3748" stroke-width="2.5"/>
                    <line x1="100" y1="750" x2="90" y2="750" stroke="#2d3748" stroke-width="2.5"/>
                    {/* 刻度文字：优化X轴位置，左对齐调整，避免和Y轴重叠 */}
                    <text x="60" y="150" font-size="12" fill="#22c55e" font-weight="500" text-anchor="end">极度愉悦</text>
                    <text x="60" y="250" font-size="12" fill="#22c55e" font-weight="500" text-anchor="end">愉悦</text>
                    <text x="60" y="350" font-size="12" fill="#22c55e" font-weight="500" text-anchor="end">轻微愉悦</text>
                    <text x="60" y="450" font-size="12" fill="#718096" font-weight="500" text-anchor="end">中性</text>
                    <text x="60" y="550" font-size="12" fill="#e53e3e" font-weight="500" text-anchor="end">轻微痛苦</text>
                    <text x="60" y="650" font-size="12" fill="#e53e3e" font-weight="500" text-anchor="end">痛苦</text>
                    <text x="60" y="750" font-size="12" fill="#e53e3e" font-weight="500" text-anchor="end">极度痛苦</text>
                </g>

                {/* 4. 体验区域填充：正向（愉悦）、负向（痛苦） */}
                <polygon points="100,450 900,450 900,150 100,150" fill="url(#positiveGradient)"/>
                <polygon points="100,450 900,450 900,750 100,750" fill="url(#negativeGradient)"/>

                {/* 5. 核心体验曲线：平滑展示感受变化（优化文字位置，避免和曲线重叠） */}
                <path d="M100,450 Q200,430 300,450 T500,200 T700,350 T900,250" 
                      stroke="#2f5496" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                <text x="600" y="320" font-size="12" fill="#2f5496" font-weight="500">体验感受曲线</text>

                {/* 6. 核心锚点：峰值时刻 + 结束时刻（优化高亮背景层级，避免遮挡文字） */}
                <g filter="url(#shadowFilter)">
                    {/* 峰值高亮背景（后置，避免遮挡锚点） */}
                    <circle cx="500" cy="200" r="20" fill="#51cf66" opacity="0.5" stroke="#22c55e" stroke-width="1"/>
                    {/* 峰值时刻锚点（前置，突出显示） */}
                    <circle cx="500" cy="200" r="6" fill="#2f5496" stroke="#ffffff" stroke-width="2"/>
                    {/* 结束高亮背景（后置） */}
                    <circle cx="900" cy="250" r="20" fill="#51cf66" opacity="0.5" stroke="#22c55e" stroke-width="1"/>
                    {/* 结束时刻锚点（前置，突出显示） */}
                    <circle cx="900" cy="250" r="6" fill="#2f5496" stroke="#ffffff" stroke-width="2"/>
                </g>

                {/* 7. 锚点参考线（优化样式，避免和其他元素重叠） */}
                {/* 峰值参考线 */}
                <line x1="500" y1="200" x2="500" y2="450" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-dasharray="2,2"/>
                <line x1="100" y1="200" x2="500" y2="200" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-dasharray="2,2"/>
                {/* 结束时刻参考线 */}
                <line x1="900" y1="250" x2="900" y2="450" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-dasharray="2,2"/>
                <line x1="100" y1="250" x2="900" y2="250" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-dasharray="2,2"/>

                {/* 8. 图标绘制：增强直观性（优化图标位置，避免文字和图标重叠） */}
                <g filter="url(#shadowFilter)">
                    {/* 峰值时刻图标：笑脸+奖杯（向右上偏移，避免和标注重叠） */}
                    <g transform="translate(540, 150)">
                        {/* 笑脸 */}
                        <circle cx="0" cy="0" r="15" fill="#51cf66" opacity="0.8" stroke="#2d3748" stroke-width="1.5"/>
                        <path d="M-8,5 Q0,10 8,5" stroke="#2d3748" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                        <circle cx="-5" cy="-3" r="2" fill="#2d3748"/>
                        <circle cx="5" cy="-3" r="2" fill="#2d3748"/>
                        {/* 小奖杯 */}
                        <g transform="translate(0, -10)">
                            <rect x="-5" y="5" width="10" height="8" rx="1" fill="#ffd43b" opacity="0.8"/>
                            <path d="M-8,5 L-5,0 L5,0 L8,5 Z" fill="#ffd43b" opacity="0.8"/>
                        </g>
                    </g>

                    {/* 结束时刻图标：鼓掌+对勾（向右上偏移，避免重叠） */}
                    <g transform="translate(940, 200)">
                        {/* 手掌 */}
                        <path d="M0,0 L5,5 L0,10 L-5,5 Z" fill="#4dabf7" opacity="0.8" stroke="#2d3748" stroke-width="1.5"/>
                        <path d="M8,0 L13,5 L8,10 L3,5 Z" fill="#4dabf7" opacity="0.8" stroke="#2d3748" stroke-width="1.5"/>
                        {/* 对勾 */}
                        <path d="M-5,10 L0,15 L10,5" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>

                    {/* 大脑图标：指向峰值与结束时刻（优化位置，避免和图例重叠） */}
                    <g transform="translate(720, 130)">
                        {/* 大脑 */}
                        <ellipse cx="0" cy="0" rx="25" ry="18" fill="#b19cd9" opacity="0.8" stroke="#2d3748" stroke-width="1.5"/>
                        <path d="M-15,-10 L-10,-5 L-15,0 L-10,5 L-15,10" stroke="#2d3748" stroke-width="1" fill="none"/>
                        <path d="M15,-10 L10,-5 L15,0 L10,5 L15,10" stroke="#2d3748" stroke-width="1" fill="none"/>
                        {/* 箭头指向峰值（优化角度，避免重叠） */}
                        <line x1="0" y1="0" x2="-180" y2="40" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" marker-end="url(#arrowhead)"/>
                        {/* 箭头指向结束时刻（优化角度，避免重叠） */}
                        <line x1="0" y1="0" x2="130" y2="80" stroke="#2f5496" stroke-width="1.5" stroke-linecap="round" marker-end="url(#arrowhead)"/>
                    </g>

                    {/* 中间环节：弱化标记（优化位置，避免和X轴文字重叠） */}
                    <g transform="translate(300, 470)">
                        <text x="0" y="30" font-size="12" fill="#718096" text-anchor="middle">中间平淡环节</text>
                        <path d="M-10,-10 L10,10 M10,-10 L-10,10" stroke="#adb5bd" stroke-width="1.5" stroke-linecap="round"/>
                    </g>
                </g>

                {/* 9. 文字标注（核心优化：调整所有文字位置，增加间距，彻底解决重叠） */}
                {/* 顶部标题与副标题（优化间距，避免文字挤压） */}
                <text x="500" y="65" font-size="28" fill="#1a202c" font-weight="bold">峰终定律 - 体验记忆决定模型</text>
                {/* 副标题：使用多行文本，避免单行过长重叠 */}
                <text x="500" y="95" font-size="15" fill="#718096" text-anchor="middle">
                    人们对一段体验的记忆，仅由峰值时刻和结束时刻决定
                </text>
                <text x="500" y="115" font-size="15" fill="#718096" text-anchor="middle">
                    与体验总时长、中间平淡环节无关
                </text>

                {/* 锚点文字标注（优化Y轴位置，增加和高亮背景的间距） */}
                <text x="500" y="155" font-size="16" fill="#22c55e" font-weight="bold">峰值时刻</text>
                <text x="500" y="175" font-size="12" fill="#4a5568">最愉悦/最痛苦的瞬间</text>
                <text x="900" y="205" font-size="16" fill="#22c55e" font-weight="bold">结束时刻</text>
                <text x="900" y="225" font-size="12" fill="#4a5568">体验收尾的感受</text>

                {/* 坐标轴标注（优化位置，避免和刻度文字重叠） */}
                <text x="500" y="520" font-size="18" fill="#2d3748" font-weight="500">体验时间/流程</text>
                <text x="35" y="450" font-size="18" fill="#2d3748" font-weight="500" transform="rotate(-90,35,450)">体验感受强度</text>

                {/* 底部提示文字（优化排版，多行显示避免重叠） */}
                <text x="500" y="760" font-size="12" fill="#4a5568" text-anchor="middle">
                    操作关键：强化正向峰值，优化结束体验，忽略中间平淡环节
                </text>
                <text x="500" y="785" font-size="14" fill="#2d3748" font-weight="bold" text-anchor="middle">
                    核心价值：聚焦峰值与终值，优化体验记忆，提升满意度/坚持度
                </text>

                {/* 10. 右上角图例说明（核心优化：调整图例位置和布局，避免文字重叠） */}
                <g id="legend" transform="translate(720, 100)">
                    <text x="90" y="0" font-size="14" fill="#2d3748" font-weight="bold" text-anchor="middle">元素说明</text>
                    {/* 体验曲线图例（增加行间距） */}
                    <line x1="0" y1="30" x2="20" y2="30" stroke="#2f5496" stroke-width="3" stroke-linecap="round"/>
                    <text x="30" y="30" font-size="13" fill="#4a5568" text-anchor="start">体验感受曲线</text>
                    {/* 峰值时刻图例（增加行间距） */}
                    <circle cx="10" cy="60" r="6" fill="#2f5496" stroke="#ffffff" stroke-width="2"/>
                    <text x="30" y="60" font-size="13" fill="#4a5568" text-anchor="start">峰值/结束时刻</text>
                    {/* 正向体验图例（调整列间距，避免和负向图例重叠） */}
                    <rect x="0" y="90" width="18" height="10" fill="url(#positiveGradient)" stroke="#51cf66" stroke-width="1.5" rx="2" ry="2"/>
                    <text x="30" y="95" font-size="13" fill="#4a5568" text-anchor="start">正向愉悦体验</text>
                    {/* 负向体验图例（向右偏移，避免重叠） */}
                    <rect x="160" y="90" width="18" height="10" fill="url(#negativeGradient)" stroke="#ff6b6b" stroke-width="1.5" rx="2" ry="2"/>
                    <text x="190" y="95" font-size="13" fill="#4a5568" text-anchor="start">负向痛苦体验</text>
                </g>
            </svg>
            </div>
          </div>
        );
      case 'valueVenn':
        return (
          <div className="w-full h-full p-4 overflow-hidden">
            <div style={{ 
              width: '100%', 
              maxWidth: '1100px', 
              background: isDark ? '#1e293b' : '#ffffff', 
              borderRadius: '24px', 
              boxShadow: isDark ? '0 20px 60px rgba(0, 0, 0, 0.3)' : '0 20px 60px rgba(0, 0, 0, 0.05)',
              padding: '40px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '30px',
              margin: '0 auto',
              height: '100%'
            }}>
              <div style={{ 
                textAlign: 'center', 
                borderBottom: `1px solid ${isDark ? '#334155' : '#eee'}`, 
                paddingBottom: '20px'
              }}>
                <h1 style={{ 
                  fontSize: '28px', 
                  margin: '0 0 10px 0', 
                  color: isDark ? '#f1f5f9' : '#1a202c', 
                  letterSpacing: '1px' 
                }}>价值三圈模型 - 个人最优发展方向定位</h1>
                <p style={{ 
                  fontSize: '16px', 
                  color: isDark ? '#94a3b8' : '#718096', 
                  margin: '0' 
                }}>最优解 = 热情圈 ∩ 能力圈 ∩ 市场圈</p>
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'flex-start', 
                gap: '50px',
                width: '100%',
                flex: 1,
                overflow: 'auto'
              }}>
                {/* 顶部：SVG 图表 */}
                <div style={{ 
                  width: '100%', 
                  position: 'relative', 
                  background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #fcfdff 0%, #f5f8f9 100%)', 
                  borderRadius: '20px', 
                  border: `1px solid ${isDark ? '#334155' : '#edf2f7'}`, 
                  padding: '20px', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  minHeight: '400px',
                  overflow: 'auto'
                }}>
                  <svg viewBox="0 0 600 550" xmlns="http://www.w3.org/2000/svg" style={{ 
                    width: '100%', 
                    height: 'auto', 
                    maxWidth: '600px', 
                    overflow: 'visible',
                    isolation: 'isolate'
                  }}>
                    <defs>
                      {/* 渐变定义 */}
                      <radialGradient id="gradPassion" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style={{stopColor: isDark ? '#f97316' : '#ff9800', stopOpacity: 0.3}} />
                        <stop offset="100%" style={{stopColor: isDark ? '#f97316' : '#ff9800', stopOpacity: 0.1}} />
                      </radialGradient>
                      <radialGradient id="gradAbility" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style={{stopColor: isDark ? '#2563eb' : '#2196f3', stopOpacity: 0.3}} />
                        <stop offset="100%" style={{stopColor: isDark ? '#2563eb' : '#2196f3', stopOpacity: 0.1}} />
                      </radialGradient>
                      <radialGradient id="gradMarket" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style={{stopColor: isDark ? '#22c55e' : '#4caf50', stopOpacity: 0.3}} />
                        <stop offset="100%" style={{stopColor: isDark ? '#22c55e' : '#4caf50', stopOpacity: 0.1}} />
                      </radialGradient>
                      
                      {/* 核心高亮光晕 */}
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
      
                    {/* 1. 基础圆圈层 (使用混合模式 multiply 实现颜色叠加) */}
                    <g style={{mixBlendMode: 'multiply'}}>
                      {/* 热情圈 (左上) Center: 220, 200 */}
                      <circle cx="220" cy="200" r="160" fill="url(#gradPassion)" stroke={isDark ? '#f97316' : '#ff9800'} strokeWidth="2" />
                      
                      {/* 能力圈 (右上) Center: 380, 200 */}
                      <circle cx="380" cy="200" r="160" fill="url(#gradAbility)" stroke={isDark ? '#2563eb' : '#2196f3'} strokeWidth="2" />
                      
                      {/* 市场圈 (下方) Center: 300, 360 */}
                      <circle cx="300" cy="360" r="160" fill="url(#gradMarket)" stroke={isDark ? '#22c55e' : '#4caf50'} strokeWidth="2" />
                    </g>
      
                    {/* 2. 核心交集强化层 (最中心) */}
                    {/* 这是一个视觉覆盖层，用于强化中心的高亮效果 */}
                    <circle cx="300" cy="270" r="50" fill={isDark ? '#FFFBEB' : '#FFF8E1'} fillOpacity="0.6" filter="url(#glow)" />
      
                    {/* 3. 文字与图标标注层 */}
      
                    {/* 热情圈标注 */}
                    <g transform="translate(140, 150)">
                      <text x="0" y="0" textAnchor="middle" font-size="20" font-weight="bold" fill={isDark ? '#f97316' : '#e65100'}>热情圈</text>
                      <text x="0" y="20" textAnchor="middle" font-size="12" fill={isDark ? '#94a3b8' : '#666'}>喜欢做的事</text>
                      <text x="0" y="-30" textAnchor="middle" font-size="30">🔥</text>
                    </g>
      
                    {/* 能力圈标注 */}
                    <g transform="translate(460, 150)">
                      <text x="0" y="0" textAnchor="middle" font-size="20" font-weight="bold" fill={isDark ? '#2563eb' : '#0d47a1'}>能力圈</text>
                      <text x="0" y="20" textAnchor="middle" font-size="12" fill={isDark ? '#94a3b8' : '#666'}>擅长做的事</text>
                      <text x="0" y="-30" textAnchor="middle" font-size="30">⚙️</text>
                    </g>
      
                    {/* 市场圈标注 */}
                    <g transform="translate(300, 460)">
                      <text x="0" y="0" textAnchor="middle" font-size="20" font-weight="bold" fill={isDark ? '#22c55e' : '#1b5e20'}>市场圈</text>
                      <text x="0" y="20" textAnchor="middle" font-size="12" fill={isDark ? '#94a3b8' : '#666'}>有价值的事</text>
                      <text x="0" y="-30" textAnchor="middle" font-size="30">💰</text>
                    </g>
      
                    {/* 两两交集标注 */}
                    {/* 热情+能力 (上方中间) */}
                    <g transform="translate(300, 130)">
                      <text x="0" y="0" textAnchor="middle" font-size="14" font-weight="bold" fill={isDark ? '#94a3b8' : '#5D4037'}>兴趣专长</text>
                      <text x="0" y="15" textAnchor="middle" font-size="10" fill={isDark ? '#64748b' : '#8D6E63'}>难变现</text>
                    </g>
      
                    {/* 热情+市场 (左下) */}
                    <g transform="translate(190, 320)">
                      <text x="0" y="0" textAnchor="middle" font-size="14" font-weight="bold" fill={isDark ? '#94a3b8' : '#5D4037'}>潜力方向</text>
                      <text x="0" y="15" textAnchor="middle" font-size="10" fill={isDark ? '#64748b' : '#8D6E63'}>缺能力</text>
                    </g>
      
                    {/* 能力+市场 (右下) */}
                    <g transform="translate(410, 320)">
                      <text x="0" y="0" textAnchor="middle" font-size="14" font-weight="bold" fill={isDark ? '#94a3b8' : '#5D4037'}>谋生技能</text>
                      <text x="0" y="15" textAnchor="middle" font-size="10" fill={isDark ? '#64748b' : '#8D6E63'}>缺热爱</text>
                    </g>
      
                    {/* 4. 核心高价值区 (三圈交集) */}
                    <g transform="translate(300, 260)">
                      {/* 中心图标 */}
                      <text x="0" y="-10" textAnchor="middle" font-size="36" filter="url(#glow)">🚀</text>
                      {/* 中心文字 */}
                      <text x="0" y="25" textAnchor="middle" font-size="18" font-weight="900" fill={isDark ? '#f1f5f9' : '#333'} style={{textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.8)' : '0 1px 2px rgba(255,255,255,0.8)'}}>最优发展方向</text>
                      <text x="0" y="45" textAnchor="middle" font-size="10" fill={isDark ? '#f1f5f9' : '#333'} font-weight="bold">甜蜜点 (Sweet Spot)</text>
                    </g>
      
                    {/* 辅助线指向说明 */}
                    <line x1="300" y1="285" x2="300" y2="350" stroke={isDark ? '#94a3b8' : '#333'} strokeWidth="1" strokeDasharray="2,2" opacity="0.3" />
      
                  </svg>
                </div>
      
                {/* 底部：图例与建议 */}
                <div style={{ 
                  width: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '20px'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '20px',
                    width: '100%'
                  }}>
                    <div style={{ 
                      background: isDark ? '#1e293b' : '#f8fafc', 
                      borderLeft: `5px solid ${isDark ? '#f97316' : '#ff9800'}`, 
                      padding: '15px 20px', 
                      borderRadius: '8px', 
                      transition: 'transform 0.2s',
                      border: `1px solid ${isDark ? '#334155' : 'transparent'}`
                    }}>
                      <h3 style={{margin: '0 0 8px 0', fontSize: '16px', color: isDark ? '#f97316' : '#e65100'}}>🔥 热情圈 (Passion)</h3>
                      <p style={{margin: '0', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.6'}}>
                        让你感到兴奋、不知疲倦、愿意主动投入时间的事情。这是动力的源泉。
                      </p>
                    </div>
                    <div style={{ 
                      background: isDark ? '#1e293b' : '#f8fafc', 
                      borderLeft: `5px solid ${isDark ? '#2563eb' : '#2196f3'}`, 
                      padding: '15px 20px', 
                      borderRadius: '8px', 
                      transition: 'transform 0.2s',
                      border: `1px solid ${isDark ? '#334155' : 'transparent'}`
                    }}>
                      <h3 style={{margin: '0 0 8px 0', fontSize: '16px', color: isDark ? '#2563eb' : '#0d47a1'}}>⚙️ 能力圈 (Ability)</h3>
                      <p style={{margin: '0', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.6'}}>
                        你经受过训练、拥有天赋或经验，能比大多数人做得好的事情。这是竞争的壁垒。
                      </p>
                    </div>
                    <div style={{ 
                      background: isDark ? '#1e293b' : '#f8fafc', 
                      borderLeft: `5px solid ${isDark ? '#22c55e' : '#4caf50'}`, 
                      padding: '15px 20px', 
                      borderRadius: '8px', 
                      transition: 'transform 0.2s',
                      border: `1px solid ${isDark ? '#334155' : 'transparent'}`
                    }}>
                      <h3 style={{margin: '0 0 8px 0', fontSize: '16px', color: isDark ? '#22c55e' : '#1b5e20'}}>💰 市场圈 (Market)</h3>
                      <p style={{margin: '0', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.6'}}>
                        他人愿意付费、社会有真实需求、能创造商业价值的事情。这是生存的基础。
                      </p>
                    </div>
                  </div>
      
                  <div style={{ 
                    background: isDark ? '#1e293b' : '#fffbf0', 
                    border: `1px solid ${isDark ? '#334155' : '#feeebc'}`, 
                    borderRadius: '12px', 
                    padding: '20px',
                    width: '100%'
                  }}>
                    <h4 style={{margin: '0 0 15px 0', color: isDark ? '#f59e0b' : '#b7791f', fontSize: '16px'}}>🚀 寻找你的"甜蜜点"：</h4>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px'}}>
                      <div style={{display: 'flex', gap: '10px', fontSize: '13px', color: isDark ? '#94a3b8' : '#744210'}}>
                        <div style={{background: isDark ? '#f59e0b' : '#fcd34d', color: isDark ? '#1e293b' : '#fff', width: '20px', height: '20px', borderRadius: '50%', textAlign: 'center', lineHeight: '20px', fontSize: '12px', fontWeight: 'bold', flexShrink: '0'}}>1</div>
                        <div><strong style={{color: isDark ? '#f1f5f9' : '#2d3748'}}>列出清单：</strong> 分别写下三个圈的内容，不少于10项。</div>
                      </div>
                      <div style={{display: 'flex', gap: '10px', fontSize: '13px', color: isDark ? '#94a3b8' : '#744210'}}>
                        <div style={{background: isDark ? '#f59e0b' : '#fcd34d', color: isDark ? '#1e293b' : '#fff', width: '20px', height: '20px', borderRadius: '50%', textAlign: 'center', lineHeight: '20px', fontSize: '12px', fontWeight: 'bold', flexShrink: '0'}}>2</div>
                        <div><strong style={{color: isDark ? '#f1f5f9' : '#2d3748'}}>寻找交集：</strong> 找出同时出现在三个清单里的选项。</div>
                      </div>
                      <div style={{display: 'flex', gap: '10px', fontSize: '13px', color: isDark ? '#94a3b8' : '#744210'}}>
                        <div style={{background: isDark ? '#f59e0b' : '#fcd34d', color: isDark ? '#1e293b' : '#fff', width: '20px', height: '20px', borderRadius: '50%', textAlign: 'center', lineHeight: '20px', fontSize: '12px', fontWeight: 'bold', flexShrink: '0'}}>3</div>
                        <div><strong style={{color: isDark ? '#f1f5f9' : '#2d3748'}}>快速验证：</strong> 用最小成本（MVP）把这个交集推向市场测试。</div>
                      </div>
                      <div style={{display: 'flex', gap: '10px', fontSize: '13px', color: isDark ? '#94a3b8' : '#744210'}}>
                        <div style={{background: isDark ? '#f59e0b' : '#fcd34d', color: isDark ? '#1e293b' : '#fff', width: '20px', height: '20px', borderRadius: '50%', textAlign: 'center', lineHeight: '20px', fontSize: '12px', fontWeight: 'bold', flexShrink: '0'}}>4</div>
                        <div><strong style={{color: isDark ? '#f1f5f9' : '#2d3748'}}>动态调整：</strong> 市场在变，能力在长，要定期校准这个中心点。</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'purpose':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
              {/* 绘制马斯洛需求层次金字塔 */}
              <g transform="translate(200, 380)">
                {purposeData.map((item, index) => {
                  const width = 300 - index * 40;
                  const height = 50;
                  const y = -index * 60;
                  return (
                    <g key={item.id}>
                      {/* 金字塔层级 */}
                      <rect x={-width / 2} y={y - height} width={width} height={height} fill={item.color} fillOpacity={0.3} stroke={item.color} strokeWidth={2} />
                      <text x={0} y={y - height / 2} textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                        {item.label}
                      </text>
                      <text x={0} y={y - height / 2 + 20} textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize={10} alignmentBaseline="middle">
                        {item.description}
                      </text>
                    </g>
                  );
                })}
              </g>
              
              {/* 标题 */}
              <text x="200" y="40" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={18} fontWeight="bold">
                马斯洛需求层次理论
              </text>
              
              {/* 副标题 */}
              <text x="200" y="60" textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize={14}>
                人类需求从低到高分为五个层次，依次为生理、安全、社交、尊重和自我实现
              </text>
            </svg>
          </div>
        );
      case 'johariWindow':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 500 500" preserveAspectRatio="xMidYMid meet">
              {/* 乔哈里视窗 */}
              <rect x="50" y="50" width="200" height="200" fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeWidth="2" />
              <rect x="250" y="50" width="200" height="200" fill="#10b981" fillOpacity={0.2} stroke="#10b981" strokeWidth="2" />
              <rect x="50" y="250" width="200" height="200" fill="#ef4444" fillOpacity={0.2} stroke="#ef4444" strokeWidth="2" />
              <rect x="250" y="250" width="200" height="200" fill="#f59e0b" fillOpacity={0.2} stroke="#f59e0b" strokeWidth="2" />
              
              {/* 分割线 */}
              <line x1="250" y1="50" x2="250" y2="450" stroke={isDark ? '#a1a1aa' : '#64748b'} strokeWidth="2" />
              <line x1="50" y1="250" x2="450" y2="250" stroke={isDark ? '#a1a1aa' : '#64748b'} strokeWidth="2" />
              
              {/* 区域标签 */}
              <text x="150" y="150" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={16} fontWeight="bold">
                公开区
              </text>
              <text x="350" y="150" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={16} fontWeight="bold">
                盲区
              </text>
              <text x="150" y="350" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={16} fontWeight="bold">
                隐藏区
              </text>
              <text x="350" y="350" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={16} fontWeight="bold">
                未知区
              </text>
              
              {/* 标题 */}
              <text x="250" y="30" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={20} fontWeight="bold">
                乔哈里视窗
              </text>
            </svg>
          </div>
        );
      case 'deliberatePractice':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
              {/* 刻意练习流程图 */}
              <defs>
                <linearGradient id="practiceGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              
              {/* 节点 */}
              <rect x="50" y="150" width="120" height="80" fill="url(#practiceGradient)" stroke="#3b82f6" strokeWidth="2" />
              <text x="110" y="195" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                明确目标
              </text>
              
              <rect x="210" y="150" width="120" height="80" fill="url(#practiceGradient)" stroke="#3b82f6" strokeWidth="2" />
              <text x="270" y="195" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                专注练习
              </text>
              
              <rect x="370" y="150" width="120" height="80" fill="url(#practiceGradient)" stroke="#3b82f6" strokeWidth="2" />
              <text x="430" y="195" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                获得反馈
              </text>
              
              <rect x="530" y="150" width="120" height="80" fill="url(#practiceGradient)" stroke="#3b82f6" strokeWidth="2" />
              <text x="590" y="195" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                纠正改进
              </text>
              
              {/* 连接线 */}
              <path d="M170 190 L210 190" stroke="#3b82f6" strokeWidth="2" fill="none" markerEnd="url(#arrowHead)" />
              <path d="M330 190 L370 190" stroke="#3b82f6" strokeWidth="2" fill="none" markerEnd="url(#arrowHead)" />
              <path d="M490 190 L530 190" stroke="#3b82f6" strokeWidth="2" fill="none" markerEnd="url(#arrowHead)" />
              <path d="M560 230 Q330 300 110 230" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="5 5" markerEnd="url(#arrowHead)" />
              
              {/* 标题 */}
              <text x="300" y="50" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={20} fontWeight="bold">
                刻意练习模型
              </text>
            </svg>
          </div>
        );
      case 'foggBehavior':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 500 400" preserveAspectRatio="xMidYMid meet">
              {/* 福格行为模型 */}
              <defs>
                <linearGradient id="foggGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              
              {/* 三角形 */}
              <polygon points="250,100 100,350 400,350" fill="url(#foggGradient)" stroke="#3b82f6" strokeWidth="2" />
              
              {/* 顶点 */}
              <circle cx="250" cy="100" r="25" fill="#ef4444" fillOpacity={0.8} stroke="#ffffff" strokeWidth="2" />
              <text x="250" y="105" textAnchor="middle" fill="#ffffff" fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                动机
              </text>
              
              <circle cx="100" cy="350" r="25" fill="#10b981" fillOpacity={0.8} stroke="#ffffff" strokeWidth="2" />
              <text x="100" y="355" textAnchor="middle" fill="#ffffff" fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                能力
              </text>
              
              <circle cx="400" cy="350" r="25" fill="#f59e0b" fillOpacity={0.8} stroke="#ffffff" strokeWidth="2" />
              <text x="400" y="355" textAnchor="middle" fill="#ffffff" fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                触发
              </text>
              
              {/* 中心 */}
              <circle cx="250" cy="260" r="30" fill="#ffffff" fillOpacity={0.8} stroke="#3b82f6" strokeWidth="2" />
              <text x="250" y="265" textAnchor="middle" fill={isDark ? '#000000' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                行为
              </text>
              
              {/* 标题 */}
              <text x="250" y="30" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={20} fontWeight="bold">
                福格行为模型
              </text>
            </svg>
          </div>
        );
      case 'eisenhowerMatrix':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet">
              {/* 艾森豪威尔矩阵 */}
              <rect x="50" y="50" width="250" height="250" fill="#ef4444" fillOpacity={0.2} stroke="#ef4444" strokeWidth="2" />
              <rect x="300" y="50" width="250" height="250" fill="#f59e0b" fillOpacity={0.2} stroke="#f59e0b" strokeWidth="2" />
              <rect x="50" y="300" width="250" height="250" fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeWidth="2" />
              <rect x="300" y="300" width="250" height="250" fill="#10b981" fillOpacity={0.2} stroke="#10b981" strokeWidth="2" />
              
              {/* 分割线 */}
              <line x1="300" y1="50" x2="300" y2="550" stroke={isDark ? '#a1a1aa' : '#64748b'} strokeWidth="2" />
              <line x1="50" y1="300" x2="550" y2="300" stroke={isDark ? '#a1a1aa' : '#64748b'} strokeWidth="2" />
              
              {/* 象限标签 */}
              <text x="175" y="120" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={16} fontWeight="bold">
                重要且紧急
              </text>
              <text x="425" y="120" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={16} fontWeight="bold">
                不重要但紧急
              </text>
              <text x="175" y="370" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={16} fontWeight="bold">
                重要但不紧急
              </text>
              <text x="425" y="370" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={16} fontWeight="bold">
                不重要且不紧急
              </text>
              
              {/* 行动建议 */}
              <text x="175" y="150" textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize={14}>
                立即执行
              </text>
              <text x="425" y="150" textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize={14}>
                授权他人
              </text>
              <text x="175" y="400" textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize={14}>
                计划执行
              </text>
              <text x="425" y="400" textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize={14}>
                消除
              </text>
              
              {/* 标题 */}
              <text x="300" y="30" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={20} fontWeight="bold">
                艾森豪威尔矩阵
              </text>
            </svg>
          </div>
        );
      case 'growthMindset':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
              {/* 成长型思维 vs 固定型思维 */}
              <rect x="50" y="50" width="250" height="300" fill="#ef4444" fillOpacity={0.2} stroke="#ef4444" strokeWidth="2" />
              <rect x="300" y="50" width="250" height="300" fill="#10b981" fillOpacity={0.2} stroke="#10b981" strokeWidth="2" />
              
              {/* 标题 */}
              <text x="175" y="80" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={18} fontWeight="bold">
                固定型思维
              </text>
              <text x="425" y="80" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={18} fontWeight="bold">
                成长型思维
              </text>
              
              {/* 特点 */}
              <text x="175" y="120" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14}>
                • 能力固定
              </text>
              <text x="175" y="150" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14}>
                • 害怕失败
              </text>
              <text x="175" y="180" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14}>
                • 避免挑战
              </text>
              <text x="175" y="210" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14}>
                • 忽视反馈
              </text>
              
              <text x="425" y="120" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14}>
                • 能力可培养
              </text>
              <text x="425" y="150" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14}>
                • 从失败中学习
              </text>
              <text x="425" y="180" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14}>
                • 拥抱挑战
              </text>
              <text x="425" y="210" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14}>
                • 重视反馈
              </text>
              
              {/* 结果 */}
              <rect x="75" y="250" width="200" height="60" fill="#ef4444" fillOpacity={0.5} stroke="#ef4444" strokeWidth="1" />
              <text x="175" y="285" textAnchor="middle" fill="#ffffff" fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                限制成长
              </text>
              
              <rect x="325" y="250" width="200" height="60" fill="#10b981" fillOpacity={0.5} stroke="#10b981" strokeWidth="1" />
              <text x="425" y="285" textAnchor="middle" fill="#ffffff" fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                持续进步
              </text>
              
              {/* 主标题 */}
              <text x="300" y="30" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={20} fontWeight="bold">
                固定型思维 vs 成长型思维
              </text>
            </svg>
          </div>
        );
      case 'sunkCost':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
              {/* 沉没成本谬误 */}
              <circle cx="100" cy="200" r="50" fill="#ef4444" fillOpacity={0.3} stroke="#ef4444" strokeWidth="2" />
              <text x="100" y="205" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={16} fontWeight="bold" alignmentBaseline="middle">
                已投入
              </text>
              <text x="100" y="235" textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize={12}>
                时间/金钱
              </text>
              
              {/* 决策点 */}
              <rect x="230" y="150" width="120" height="100" fill="#f59e0b" fillOpacity={0.3} stroke="#f59e0b" strokeWidth="2" />
              <text x="290" y="205" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                决策点
              </text>
              
              {/* 错误路径 */}
              <path d="M150 200 L230 200" stroke="#ef4444" strokeWidth="2" fill="none" markerEnd="url(#arrowHead)" />
              <path d="M350 180 L450 120" stroke="#ef4444" strokeWidth="2" fill="none" markerEnd="url(#arrowHead)" />
              <circle cx="500" cy="120" r="40" fill="#ef4444" fillOpacity={0.3} stroke="#ef4444" strokeWidth="2" />
              <text x="500" y="125" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                继续投入
              </text>
              <text x="500" y="155" textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize={12}>
                更大损失
              </text>
              
              {/* 正确路径 */}
              <path d="M350 220 L450 280" stroke="#10b981" strokeWidth="2" fill="none" markerEnd="url(#arrowHead)" />
              <circle cx="500" cy="280" r="40" fill="#10b981" fillOpacity={0.3} stroke="#10b981" strokeWidth="2" />
              <text x="500" y="285" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                止损
              </text>
              <text x="500" y="315" textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize={12}>
                减少损失
              </text>
              
              {/* 标题 */}
              <text x="300" y="30" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={20} fontWeight="bold">
                沉没成本谬误
              </text>
            </svg>
          </div>
        );
      case 'pareto':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
              {/* 二八定律 */}
              <defs>
                <linearGradient id="paretoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              
              {/* 条形图 */}
              <rect x="100" y="100" width="80" height="250" fill="#3b82f6" fillOpacity={0.6} stroke="#3b82f6" strokeWidth="2" />
              <rect x="180" y="150" width="80" height="200" fill="#3b82f6" fillOpacity={0.6} stroke="#3b82f6" strokeWidth="2" />
              <rect x="260" y="200" width="80" height="150" fill="#3b82f6" fillOpacity={0.6} stroke="#3b82f6" strokeWidth="2" />
              <rect x="340" y="250" width="80" height="100" fill="#3b82f6" fillOpacity={0.6} stroke="#3b82f6" strokeWidth="2" />
              <rect x="420" y="280" width="80" height="70" fill="#3b82f6" fillOpacity={0.6} stroke="#3b82f6" strokeWidth="2" />
              
              {/* 折线图 */}
              <path d="M100 350 L180 350 L260 350 L340 350 L420 350 L500 350" stroke="#3b82f6" strokeWidth="1" fill="none" />
              <path d="M140 100 L180 100 L220 150 L260 150 L300 200 L340 200 L380 250 L420 250 L460 280 L500 280" stroke="#ef4444" strokeWidth="3" fill="none" markerEnd="url(#arrowHead)" />
              
              {/* 80%线 */}
              <line x1="100" y1="160" x2="500" y2="160" stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" />
              <text x="520" y="165" textAnchor="start" fill="#10b981" fontSize={14} fontWeight="bold">
                80%
              </text>
              
              {/* 20%线 */}
              <line x1="260" y1="100" x2="260" y2="350" stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" />
              <text x="260" y="90" textAnchor="middle" fill="#10b981" fontSize={14} fontWeight="bold">
                20%
              </text>
              
              {/* 标题 */}
              <text x="300" y="30" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={20} fontWeight="bold">
                二八定律
              </text>
            </svg>
          </div>
        );
      case 'swot':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet">
              {/* SWOT分析 */}
              <rect x="50" y="50" width="250" height="250" fill="#10b981" fillOpacity={0.2} stroke="#10b981" strokeWidth="2" />
              <rect x="300" y="50" width="250" height="250" fill="#ef4444" fillOpacity={0.2} stroke="#ef4444" strokeWidth="2" />
              <rect x="50" y="300" width="250" height="250" fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeWidth="2" />
              <rect x="300" y="300" width="250" height="250" fill="#f59e0b" fillOpacity={0.2} stroke="#f59e0b" strokeWidth="2" />
              
              {/* 分割线 */}
              <line x1="300" y1="50" x2="300" y2="550" stroke={isDark ? '#a1a1aa' : '#64748b'} strokeWidth="2" />
              <line x1="50" y1="300" x2="550" y2="300" stroke={isDark ? '#a1a1aa' : '#64748b'} strokeWidth="2" />
              
              {/* 象限标签 */}
              <text x="175" y="80" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={18} fontWeight="bold">
                优势
              </text>
              <text x="425" y="80" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={18} fontWeight="bold">
                劣势
              </text>
              <text x="175" y="330" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={18} fontWeight="bold">
                机会
              </text>
              <text x="425" y="330" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={18} fontWeight="bold">
                威胁
              </text>
              
              {/* 标题 */}
              <text x="300" y="30" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={20} fontWeight="bold">
                SWOT分析
              </text>
            </svg>
          </div>
        );
      case 'goldenCircle':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 500 500" preserveAspectRatio="xMidYMid meet">
              {/* 黄金圈法则 */}
              <defs>
                <linearGradient id="goldenGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              
              {/* 三个同心圆 */}
              <circle cx="250" cy="250" r="180" fill="url(#goldenGradient)" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="250" cy="250" r="120" fill="url(#goldenGradient)" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="250" cy="250" r="60" fill="url(#goldenGradient)" stroke="#f59e0b" strokeWidth="2" />
              
              {/* 文字 */}
              <text x="250" y="380" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={18} fontWeight="bold">
                WHAT
              </text>
              <text x="250" y="405" textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize={14}>
                做什么
              </text>
              
              <text x="250" y="280" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={18} fontWeight="bold">
                HOW
              </text>
              <text x="250" y="305" textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize={14}>
                怎么做
              </text>
              
              <text x="250" y="200" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={18} fontWeight="bold">
                WHY
              </text>
              <text x="250" y="225" textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize={14}>
                为什么
              </text>
              
              {/* 标题 */}
              <text x="250" y="50" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={20} fontWeight="bold">
                黄金圈法则
              </text>
            </svg>
          </div>
        );
      case 'fiveWhys':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid meet">
              {/* 5 Why分析法 */}
              <rect x="150" y="50" width="300" height="80" fill="#ef4444" fillOpacity={0.3} stroke="#ef4444" strokeWidth="2" />
              <text x="300" y="95" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={16} fontWeight="bold" alignmentBaseline="middle">
                问题：销量下降
              </text>
              
              {/* 第一个Why */}
              <rect x="150" y="150" width="300" height="60" fill="#f59e0b" fillOpacity={0.3} stroke="#f59e0b" strokeWidth="2" />
              <text x="300" y="185" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                为什么？
              </text>
              <text x="300" y="205" textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize={12}>
                客户满意度下降
              </text>
              
              {/* 第二个Why */}
              <rect x="150" y="230" width="300" height="60" fill="#f59e0b" fillOpacity={0.3} stroke="#f59e0b" strokeWidth="2" />
              <text x="300" y="265" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                为什么？
              </text>
              <text x="300" y="285" textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize={12}>
                产品质量问题
              </text>
              
              {/* 第三个Why */}
              <rect x="150" y="310" width="300" height="60" fill="#f59e0b" fillOpacity={0.3} stroke="#f59e0b" strokeWidth="2" />
              <text x="300" y="345" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                为什么？
              </text>
              <text x="300" y="365" textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize={12}>
                新员工操作不熟练
              </text>
              
              {/* 第四个Why */}
              <rect x="150" y="390" width="300" height="60" fill="#f59e0b" fillOpacity={0.3} stroke="#f59e0b" strokeWidth="2" />
              <text x="300" y="425" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                为什么？
              </text>
              <text x="300" y="445" textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize={12}>
                培训不到位
              </text>
              
              {/* 连接线 */}
              <path d="M300 130 L300 150" stroke="#ef4444" strokeWidth="2" fill="none" markerEnd="url(#arrowHead)" />
              <path d="M300 210 L300 230" stroke="#f59e0b" strokeWidth="2" fill="none" markerEnd="url(#arrowHead)" />
              <path d="M300 290 L300 310" stroke="#f59e0b" strokeWidth="2" fill="none" markerEnd="url(#arrowHead)" />
              <path d="M300 370 L300 390" stroke="#f59e0b" strokeWidth="2" fill="none" markerEnd="url(#arrowHead)" />
              
              {/* 标题 */}
              <text x="300" y="30" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={20} fontWeight="bold">
                5 Why分析法
              </text>
            </svg>
          </div>
        );
      case 'knowledgeCrystallization':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid meet">
              {/* 知识晶体化 */}
              <defs>
                <linearGradient id="crystalGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              
              {/* 中心菱形 */}
              <polygon points="300,150 400,250 300,350 200,250" fill="url(#crystalGradient)" stroke="#8b5cf6" strokeWidth="2" />
              <text x="300" y="255" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={18} fontWeight="bold" alignmentBaseline="middle">
                知识晶体
              </text>
              
              {/* 周围节点 */}
              <circle cx="150" cy="200" r="35" fill="#3b82f6" fillOpacity={0.3} stroke="#3b82f6" strokeWidth="2" />
              <text x="150" y="205" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                输入
              </text>
              
              <circle cx="450" cy="200" r="35" fill="#10b981" fillOpacity={0.3} stroke="#10b981" strokeWidth="2" />
              <text x="450" y="205" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                整理
              </text>
              
              <circle cx="450" cy="300" r="35" fill="#f59e0b" fillOpacity={0.3} stroke="#f59e0b" strokeWidth="2" />
              <text x="450" y="305" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                输出
              </text>
              
              <circle cx="150" cy="300" r="35" fill="#ef4444" fillOpacity={0.3} stroke="#ef4444" strokeWidth="2" />
              <text x="150" y="305" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={14} fontWeight="bold" alignmentBaseline="middle">
                应用
              </text>
              
              {/* 连接线 */}
              <path d="M185 200 L250 200" stroke="#3b82f6" strokeWidth="2" fill="none" markerEnd="url(#arrowHead)" />
              <path d="M340 200 L415 200" stroke="#10b981" strokeWidth="2" fill="none" markerEnd="url(#arrowHead)" />
              <path d="M415 235 L415 265" stroke="#10b981" strokeWidth="2" fill="none" markerEnd="url(#arrowHead)" />
              <path d="M340 300 L250 300" stroke="#ef4444" strokeWidth="2" fill="none" markerEnd="url(#arrowHead)" />
              <path d="M185 265 L185 235" stroke="#ef4444" strokeWidth="2" fill="none" markerEnd="url(#arrowHead)" />
              
              {/* 标题 */}
              <text x="300" y="30" textAnchor="middle" fill={isDark ? '#ffffff' : '#000000'} fontSize={20} fontWeight="bold">
                知识晶体化模型
              </text>
            </svg>
          </div>
        );
      default:
        // Default case to handle all chart IDs not explicitly defined
        return (
          <BaseChart data={[]} isDark={isDark} height={chartHeight}>
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <div className={`w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-4`}>
                <Activity size={32} className="text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${textMain}`}>图表正在开发中</h3>
              <p className={`text-sm ${textSub}`}>该图表功能目前正在开发中，敬请期待</p>
              <p className={`text-xs mt-2 ${textSub}`}>Chart ID: {activeChart}</p>
            </div>
          </BaseChart>
        );
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
    { stress: 0, fragile: 100, robust: 75, antifragile: 50 },
    { stress: 10, fragile: 90, robust: 75, antifragile: 55 },
    { stress: 20, fragile: 80, robust: 75, antifragile: 60 },
    { stress: 30, fragile: 70, robust: 75, antifragile: 65 },
    { stress: 40, fragile: 60, robust: 75, antifragile: 75 },
    { stress: 50, fragile: 50, robust: 75, antifragile: 90 },
    { stress: 60, fragile: 40, robust: 75, antifragile: 110 },
    { stress: 70, fragile: 30, robust: 75, antifragile: 130 },
    { stress: 80, fragile: 20, robust: 75, antifragile: 150 },
    { stress: 90, fragile: 10, robust: 75, antifragile: 170 },
    { stress: 100, fragile: 0, robust: 75, antifragile: 190 },
  ];

  // 反脆弱图表数据
  const antifragilityData = [
    { stress: 0, performance: 50, label: '稳定状态' },
    { stress: 5, performance: 48, label: '轻微压力' },
    { stress: 10, performance: 45, label: '适度压力' },
    { stress: 15, performance: 40, label: '较大压力' },
    { stress: 20, performance: 55, label: '恢复点' },
    { stress: 25, performance: 65, label: '成长点' },
    { stress: 30, performance: 80, label: '快速成长' },
    { stress: 35, performance: 100, label: '反脆弱峰值' },
    { stress: 40, performance: 95, label: '持续成长' },
    { stress: 45, performance: 90, label: '接近极限' },
    { stress: 50, performance: 40, label: '崩溃点' },
  ];

  // 第二曲线图表数据
  const secondCurveData = [
    { time: 0, first: 0, second: 0, label: '起点' },
    { time: 1, first: 10, second: 0, label: '第一曲线启动' },
    { time: 2, first: 25, second: 0, label: '第一曲线增长' },
    { time: 3, first: 45, second: 0, label: '第一曲线加速' },
    { time: 4, first: 70, second: 5, label: '第二曲线启动' },
    { time: 5, first: 90, second: 15, label: '第一曲线峰值' },
    { time: 6, first: 85, second: 30, label: '第二曲线增长' },
    { time: 7, first: 75, second: 55, label: '交叉点' },
    { time: 8, first: 60, second: 85, label: '第二曲线超越' },
    { time: 9, first: 40, second: 110, label: '第二曲线加速' },
    { time: 10, first: 20, second: 130, label: '第二曲线峰值' },
  ];

  // 复利效应图表数据
  const compoundInterestData = [
    { year: 0, principal: 1000, compound: 1000, label: '初始投资' },
    { year: 1, principal: 1100, compound: 1100, label: '第1年' },
    { year: 2, principal: 1200, compound: 1210, label: '第2年' },
    { year: 3, principal: 1300, compound: 1331, label: '第3年' },
    { year: 4, principal: 1400, compound: 1464, label: '第4年' },
    { year: 5, principal: 1500, compound: 1611, label: '第5年' },
    { year: 6, principal: 1600, compound: 1772, label: '第6年' },
    { year: 7, principal: 1700, compound: 1949, label: '第7年' },
    { year: 8, principal: 1800, compound: 2144, label: '第8年' },
    { year: 9, principal: 1900, compound: 2358, label: '第9年' },
    { year: 10, principal: 2000, compound: 2594, label: '第10年' },
    { year: 15, principal: 2500, compound: 4177, label: '第15年' },
    { year: 20, principal: 3000, compound: 6727, label: '第20年' },
    { year: 25, principal: 3500, compound: 10835, label: '第25年' },
    { year: 30, principal: 4000, compound: 17449, label: '第30年' },
  ];

  // 达克效应图表数据
  const dunningKrugerData = [
    { knowledge: 0, confidence: 95, label: '愚昧之巅' },
    { knowledge: 10, confidence: 90, label: '过度自信' },
    { knowledge: 20, confidence: 75, label: '开始质疑' },
    { knowledge: 30, confidence: 40, label: '绝望之谷' },
    { knowledge: 40, confidence: 50, label: '开始觉悟' },
    { knowledge: 50, confidence: 60, label: '稳步提升' },
    { knowledge: 60, confidence: 70, label: '开悟之坡' },
    { knowledge: 70, confidence: 75, label: '持续成长' },
    { knowledge: 80, confidence: 80, label: '专业水平' },
    { knowledge: 90, confidence: 85, label: '精通领域' },
    { knowledge: 100, confidence: 90, label: '大师境界' },
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
    return isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:shadow-xl' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-100 hover:shadow-xl';
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
      practice: '1. 运营自媒体账号时，聚焦"优质内容创作"这个正反馈节点，形成"内容→流量→互动→更多流量"的正循环；2. 学习时，当出现"注意力不集中、错题率上升"的负反馈信号，及时切换任务或休息。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张系统反馈模型图表，具体细节要求如下：

  1. 整体布局：
  - 采用二维坐标布局，X轴水平向右（时间由短到长）、Y轴垂直向上（系统状态由低到高），整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 图表背景采用浅色渐变填充，增强视觉层次感，无明显分区。

  2. 核心元素细节：
  - 曲线：绘制两条平滑曲线，分别代表不同反馈对系统的影响：
    1. 正反馈曲线（红色曲线）：随时间呈指数级增长趋势，代表系统变化被放大；
    2. 负反馈曲线（蓝色曲线）：随时间先上升后趋于稳定，代表系统变化被抑制；
    3. 综合效果曲线（紫色曲线）：展示正负反馈共同作用下的系统状态变化；
    曲线线条粗细适中（3px），均使用实线样式；
  - 区域填充：使用对应颜色的渐变填充每条曲线下方区域，增强视觉表现力，渐变透明度从0.4过渡到0.05；
  - 文字标注（位置精准，样式工整）：
    1. 曲线标注文字：在每条曲线旁添加对应颜色的反馈类型文字标注；
    2. X轴下方标注：「时间」，Y轴左侧标注：「系统状态」；
    3. 图表顶部中央标注标题：「系统反馈模型」，下方标注副标题：「展示正反馈与负反馈对系统发展的影响」；
  - 反馈回路图示：在图表右侧添加正反馈和负反馈的回路示意图，用箭头和文字说明反馈机制；
  - 数据点：在各曲线的关键节点上添加对应颜色的圆点标记（半径5px），增强视觉焦点；
  - 图例说明：清晰标注三条曲线分别代表的含义，放置在图表右上角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：曲线平滑无锯齿、文字居中/对齐工整、渐变颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 发现"数据分析能力不足"是职场提升的瓶颈，集中1个月时间学习数据分析工具和方法；2. 项目推进中，若"供应商交货慢"是瓶颈，优先协调供应商提升交货速度。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张瓶颈理论图表，具体细节要求如下：

  1. 整体布局：
  - 采用流程图布局，展示系统中各个环节的性能瓶颈，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用水平排列的矩形代表系统中的不同环节，通过箭头连接表示流程顺序。

  2. 核心元素细节：
  - 矩形节点：绘制5-6个水平排列的矩形，代表系统的不同环节，其中一个矩形使用红色填充（代表瓶颈环节），其他使用蓝色填充；
  - 连接箭头：使用黑色实线箭头连接各个矩形节点，箭头粗细适中；
  - 文字标注（位置精准，样式工整）：
    1. 每个矩形节点内标注环节名称，红色矩形标注「瓶颈环节」；
    2. 矩形下方标注每个环节的性能值；
    3. 图表顶部中央标注标题：「瓶颈理论（TOC）」，下方标注副标题：「系统的整体性能由最薄弱的环节决定」；
  - 瓶颈突破图示：在图表下方添加瓶颈突破前后的对比示意图，用文字说明突破瓶颈后的系统性能提升；
  - 图例说明：清晰标注红色矩形代表瓶颈环节，蓝色矩形代表正常环节，放置在图表右上角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：矩形边角圆润、文字居中/对齐工整、颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 想做职场技能分享副业，先调研目标用户痛点，再设计对应的价值内容；2. 搭建"价值-需求"匹配表，定期更新用户需求。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张价值主张画布图表，具体细节要求如下：

  1. 整体布局：
  - 采用两栏布局，左侧为用户需求侧，右侧为产品价值侧，中间用虚线分隔，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 每栏内部分为多个区域，分别展示不同类型的需求和价值。

  2. 核心元素细节：
  - 分区设计：
    1. 左侧用户侧：分为「用户痛点」「用户需求」「用户增益」三个区域；
    2. 右侧价值侧：分为「产品功能」「解决方案」「价值主张」三个区域；
    3. 中间用双向箭头连接，表示需求与价值的匹配关系；
  - 矩形框：使用浅色背景的矩形框划分各个区域，边框为黑色实线；
  - 文字标注（位置精准，样式工整）：
    1. 每个区域内标注对应内容的示例文字；
    2. 左侧顶部标注「用户侧」，右侧顶部标注「产品/价值侧」；
    3. 图表顶部中央标注标题：「价值主张画布」，下方标注副标题：「展示用户需求与产品价值的匹配关系」；
  - 匹配连线：使用彩色虚线连接左侧需求与右侧价值，展示对应匹配关系；
  - 图例说明：清晰标注各个区域的含义，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：矩形边角圆润、文字居中/对齐工整、颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 纠结"下班后刷短视频"还是"学习技能"，计算机会成本后选择学习技能；2. 设置"决策机会成本分析"功能，辅助理性决策。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张机会成本思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用对比布局，展示不同选择方案的成本和收益，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用左右或上下对比的方式展示不同选择方案。

  2. 核心元素细节：
  - 选择方案：
    1. 设计2-3个选择方案的对比卡片，每个卡片包含「直接成本」「机会成本」「总收益」三个部分；
    2. 每个卡片使用不同颜色区分，例如方案1用蓝色，方案2用红色，方案3用绿色；
  - 条形图：在每个卡片内使用水平条形图展示成本和收益的数值对比；
  - 文字标注（位置精准，样式工整）：
    1. 每个卡片内标注方案名称和具体数值；
    2. 图表顶部中央标注标题：「机会成本思维」，下方标注副标题：「展示选择的隐性成本」；
    3. 在图表底部添加文字说明，解释机会成本的概念；
  - 对比箭头：使用双向箭头连接不同方案的关键数值，突出对比效果；
  - 图例说明：清晰标注不同颜色卡片代表的方案，放置在图表右上角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：卡片边角圆润、文字居中/对齐工整、颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 想做读书分享自媒体，先发布"文字版读书摘要"这个MVP版本，收集反馈后逐步升级；2. 学习写作时，先完成"一篇完整的短文"，再根据反馈修改细节。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张最小可行产品思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用流程迭代布局，展示MVP从构思到迭代的完整过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用环形或线性流程展示MVP的迭代周期。

  2. 核心元素细节：
  - 流程节点：设计5个流程节点，分别为「核心需求提炼」「MVP开发」「市场验证」「反馈收集」「迭代优化」，形成一个闭环；
  - 连接箭头：使用带箭头的曲线连接各个流程节点，形成闭环，箭头方向表示流程顺序；
  - 节点设计：每个节点使用圆形设计，内部包含对应阶段的图标和文字，节点颜色从浅到深渐变，表示流程推进；
  - 文字标注（位置精准，样式工整）：
    1. 每个节点内标注阶段名称和简短描述；
    2. 图表顶部中央标注标题：「最小可行产品思维」，下方标注副标题：「展示快速验证产品价值的方法」；
    3. 在图表底部添加文字说明，解释MVP的核心原则；
  - 迭代图示：在图表右侧添加MVP版本迭代的对比示意图，展示从最简版本到完整产品的演变过程；
  - 图例说明：清晰标注流程节点的含义，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：节点圆润、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 优化自媒体内容时，遵循"构建→测量→学习"循环：写文案→统计数据→优化标题写法；2. 设置"迭代循环记录"功能，记录每次构建、测量和学习的经验。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张快速迭代循环图表，具体细节要求如下：

  1. 整体布局：
  - 采用三角形闭环布局，展示"构建→测量→学习"的迭代循环，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用三角形的三个顶点分别代表循环的三个阶段，形成一个闭环。

  2. 核心元素细节：
  - 三角形结构：绘制一个等边三角形，三个顶点分别标注「构建」「测量」「学习」；
  - 循环箭头：使用带箭头的曲线连接三个顶点，形成顺时针的闭环箭头；
  - 阶段设计：每个顶点使用圆形设计，内部包含对应阶段的图标和文字，圆形颜色分别为蓝色（构建）、红色（测量）、绿色（学习）；
  - 内容区域：在三角形内部添加每个阶段的具体内容和操作步骤；
  - 文字标注（位置精准，样式工整）：
    1. 每个顶点标注阶段名称和简短描述；
    2. 图表顶部中央标注标题：「快速迭代循环」，下方标注副标题：「展示迭代优化的闭环过程」；
    3. 在图表底部添加文字说明，解释快速迭代的核心原则；
  - 迭代次数标识：在三角形外侧添加迭代次数的环形标识，展示循环次数；
  - 图例说明：清晰标注三个阶段的含义，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：三角形线条平滑、文字居中/对齐工整、颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 培养"早起"习惯，初始动作是"睡前把闹钟放在床头，且不刷手机"；2. 项目初期，发现小的流程漏洞立刻制定统一标准，避免后期混乱。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张蝴蝶效应图表，具体细节要求如下：

  1. 整体布局：
  - 采用对比布局，展示初始微小变化与最终巨大影响的对比关系，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用左右或上下对比的方式展示蝴蝶振翅与风暴的关系。

  2. 核心元素细节：
  - 初始条件：左侧绘制一只蝴蝶振翅的简化图形，使用蓝色渐变填充，周围有轻微的波纹效果；
  - 中间过程：使用一系列渐变色的波纹或曲线连接初始条件和最终结果，展示连锁反应的传播过程；
  - 最终结果：右侧绘制一个简化的风暴或波浪图形，使用红色渐变填充，展示巨大的影响；
  - 文字标注（位置精准，样式工整）：
    1. 左侧蝴蝶下方标注「初始微小变化」；
    2. 中间连接部分标注「连锁反应」；
    3. 右侧风暴下方标注「最终巨大影响」；
    4. 图表顶部中央标注标题：「蝴蝶效应」，下方标注副标题：「初始条件微小变化对系统的巨大影响」；
  - 箭头指示：使用带箭头的曲线连接蝴蝶和风暴，清晰展示因果关系；
  - 图例说明：清晰标注初始条件、连锁反应和最终结果的含义，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：蝴蝶和风暴图形简洁美观、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 入门数据分析，选择学习Python而非小众工具，借助路径依赖的惯性不断提升；2. 若发现副业方向市场需求小，及时转型到更有潜力的方向。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张路径依赖理论图表，具体细节要求如下：

  1. 整体布局：
  - 采用分叉路径布局，展示不同初始选择导致的不同发展路径，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用树状或网状结构展示从初始选择到后续发展的路径分叉。

  2. 核心元素细节：
  - 初始选择节点：左侧绘制一个圆形节点，标注「初始选择」，使用蓝色渐变填充；
  - 分叉路径：从初始节点向右延伸出2-3条不同颜色的路径，每条路径代表一种选择方向；
  - 路径节点：每条路径上设置2-3个节点，标注路径上的关键事件或阶段；
  - 路径宽度：路径的宽度随发展逐渐变化，展示路径依赖的强化过程；
  - 终点节点：每条路径的右端设置终点节点，标注该路径的最终结果；
  - 文字标注（位置精准，样式工整）：
    1. 每条路径标注路径名称和方向；
    2. 每个节点标注关键事件或阶段；
    3. 图表顶部中央标注标题：「路径依赖理论」，下方标注副标题：「初始选择对后续发展的影响」；
  - 箭头指示：使用带箭头的曲线连接各个节点，清晰展示路径的发展方向；
  - 图例说明：清晰标注不同路径的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：路径线条平滑、节点设计简洁美观、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 已经投入1万元和3个月时间做亏损电商产品，忽略沉没成本，分析机会成本后果断止损；2. 纠结是否继续学习冷门语言，计算机会成本后转而学习热门技能。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张机会成本与沉没成本权衡图表，具体细节要求如下：

  1. 整体布局：
  - 采用对比权衡布局，展示不同成本类型的对比和权衡，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用左右或上下对比的方式展示沉没成本和机会成本的关系。

  2. 核心元素细节：
  - 天平结构：中央绘制一个天平图形，代表决策权衡；
  - 沉没成本侧：左侧天平托盘绘制"已投入成本"的图形，使用红色渐变填充，标注「沉没成本」；
  - 机会成本侧：右侧天平托盘绘制"未来价值"的图形，使用绿色渐变填充，标注「机会成本」；
  - 对比图表：在天平下方添加对比条形图，展示不同决策选项的沉没成本和机会成本数值；
  - 决策建议：在图表底部添加决策建议文字，标注「决策原则：忽略沉没成本，聚焦机会成本」；
  - 文字标注（位置精准，样式工整）：
    1. 天平两侧标注对应成本类型；
    2. 对比图表标注不同决策选项；
    3. 图表顶部中央标注标题：「机会成本与沉没成本权衡」，下方标注副标题：「在决策中权衡不同成本」；
  - 图例说明：清晰标注沉没成本和机会成本的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：天平图形简洁美观、对比图表清晰、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 职场中遇到"晋升名额有限"的情况，主动和同事合作完成重要项目，共同创造价值；2. 学习时缺少资料，主动分享自己的资料到学习群，吸引其他群友分享。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张稀缺与丰饶思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用对比思维布局，展示稀缺思维和丰饶思维的对比，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用左右或上下对比的方式展示两种思维模式的差异。

  2. 核心元素细节：
  - 稀缺思维侧：左侧绘制一个"有限资源竞争"的图形，使用红色渐变填充，包含少数资源和多个竞争个体；
  - 丰饶思维侧：右侧绘制一个"无限资源创造"的图形，使用绿色渐变填充，包含丰富资源和多个合作个体；
  - 对比元素：
    1. 稀缺侧：有限的资源图标、竞争的人物图标、缩小的箭头；
    2. 丰饶侧：丰富的资源图标、合作的人物图标、扩大的箭头；
  - 文字标注（位置精准，样式工整）：
    1. 左侧标注「稀缺思维」和「资源有限，竞争争抢」；
    2. 右侧标注「丰饶思维」和「资源无限，合作创新」；
    3. 图表顶部中央标注标题：「稀缺与丰饶思维」，下方标注副标题：「不同思维模式对资源获取的影响」；
  - 对比数据：在图表下方添加对比数据，展示两种思维模式下的资源利用效率；
  - 图例说明：清晰标注稀缺思维和丰饶思维的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：图形简洁美观、对比鲜明、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 想养成"下班回家后健身"的习惯，把健身服放在门口，同时把电视遥控器收起来；2. 优化工作流程，把常用文件放在桌面，设置快捷键简化操作。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张最小阻力路径法则图表，具体细节要求如下：

  1. 整体布局：
  - 采用路径对比布局，展示不同阻力路径的对比，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用上下或左右对比的方式展示阻力大小不同的路径。

  2. 核心元素细节：
  - 起点和终点：左侧绘制起点节点，右侧绘制终点节点，分别标注「起点」和「终点」；
  - 阻力路径：
    1. 低阻力路径：一条平滑的曲线，使用绿色渐变填充，标注「低阻力路径」；
    2. 高阻力路径：一条曲折的曲线，使用红色渐变填充，标注「高阻力路径」；
  - 阻力元素：在高阻力路径上添加阻力图标，如障碍物、陡峭的山坡等；
  - 行为箭头：使用箭头指示从起点到终点的行进方向；
  - 文字标注（位置精准，样式工整）：
    1. 每条路径标注阻力大小和路径特点；
    2. 图表顶部中央标注标题：「最小阻力路径法则」，下方标注副标题：「设计利于目标达成的环境」；
  - 图例说明：清晰标注低阻力路径和高阻力路径的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：路径线条平滑、阻力元素简洁美观、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 学习英语单词，背完一组后立刻显示正确率和解析；2. 项目推进中，每天下班前开10分钟短会，反馈当天进度和问题。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张反馈即时性法则图表，具体细节要求如下：

  1. 整体布局：
  - 采用时间序列布局，展示反馈及时性与行为强化效果的关系，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用横向时间轴展示反馈延迟时间，纵向轴展示行为强化效果。

  2. 核心元素细节：
  - 坐标系统：绘制X轴（反馈延迟时间）和Y轴（行为强化效果）；
  - 效果曲线：绘制一条从左上到右下的平滑曲线，展示反馈延迟时间与行为强化效果的反比关系；
  - 对比节点：在曲线上设置3个关键节点，分别标注「即时反馈」「短期延迟」「长期延迟」；
  - 效果区域：使用渐变填充曲线下方区域，展示不同反馈延迟下的效果差异；
  - 文字标注（位置精准，样式工整）：
    1. X轴标注「反馈延迟时间（秒/分钟/小时/天）」；
    2. Y轴标注「行为强化效果（%）」；
    3. 每个关键节点标注反馈延迟时间和对应的强化效果；
    4. 图表顶部中央标注标题：「反馈即时性法则」，下方标注副标题：「反馈及时性对行为的影响」；
  - 图例说明：清晰标注不同反馈延迟区间的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：曲线线条平滑、节点设计简洁美观、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 设计学习APP，站在学生、家长、老师三个视角优化功能；2. 职场中与同事发生矛盾，站在同事角度思考，找到利益共同点。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张视角转换思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用多视角布局，展示从不同角度看待同一问题的效果，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用中心发散或环绕式布局展示不同视角。

  2. 核心元素细节：
  - 中心问题：中央绘制一个问题图标，使用灰色渐变填充，标注「核心问题」；
  - 视角环绕：围绕核心问题绘制3-4个不同视角的图标，每个视角使用不同颜色：
    1. 他人视角：使用蓝色渐变填充，标注「他人视角」；
    2. 未来视角：使用绿色渐变填充，标注「未来视角」；
    3. 历史视角：使用黄色渐变填充，标注「历史视角」；
    4. 系统视角：使用紫色渐变填充，标注「系统视角」；
  - 连接线条：使用带箭头的曲线连接核心问题和各个视角，展示视角转换的关系；
  - 解决方案：在每个视角图标下方标注该视角下的解决方案；
  - 文字标注（位置精准，样式工整）：
    1. 中心问题标注具体问题示例；
    2. 每个视角标注视角名称和解决方案；
    3. 图表顶部中央标注标题：「视角转换思维」，下方标注副标题：「不同视角对问题解决的影响」；
  - 图例说明：清晰标注不同视角的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：图标设计简洁美观、连接线条平滑、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 思考"如何提升用户粘性"，本质是"如何让用户获得持续价值"，推导解决方案：个性化内容、用户成长体系、社群互动；2. 重构数学知识体系，从三个本质模块出发梳理知识点。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张第一性原理思维（进阶版）图表，具体细节要求如下：

  1. 整体布局：
  - 采用本质推导布局，展示从本质公理到解决方案的推导过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用垂直或水平层级布局展示从本质到现象的推导链条。

  2. 核心元素细节：
  - 本质层：顶部绘制本质公理区域，使用蓝色渐变填充，包含2-3个本质公理节点；
  - 推导层：中间绘制逻辑推导区域，使用绿色渐变填充，包含推导过程的逻辑节点；
  - 现象层：底部绘制解决方案区域，使用紫色渐变填充，包含具体的解决方案；
  - 推导箭头：使用带箭头的线条连接不同层级的节点，展示推导关系；
  - 对比元素：在图表右侧添加"传统经验法"的对比，展示两种方法的差异；
  - 文字标注（位置精准，样式工整）：
    1. 每层标注层级名称和核心内容；
    2. 每个节点标注具体的公理、逻辑或解决方案；
    3. 图表顶部中央标注标题：「第一性原理思维（进阶版）」，下方标注副标题：「从本质出发解决问题」；
  - 图例说明：清晰标注不同层级的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：层级结构清晰、推导箭头流畅、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 做职场干货自媒体，前期每天输出1条短干货，持续积累3个月，粉丝达到1万临界点后，推出系列课程；2. 练习PPT技能，每天做1页高质量排版，积累100页后整理成作品集，对接副业平台。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张势能积累思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用势能曲线布局，展示势能积累到爆发的过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用横向时间轴展示积累时间，纵向轴展示势能值。

  2. 核心元素细节：
  - 坐标系统：绘制X轴（积累时间）和Y轴（势能值）；
  - 势能曲线：绘制一条S形或J形曲线，展示从缓慢积累到爆发增长的过程；
  - 阶段划分：将曲线分为三个阶段：
    1. 缓慢积累期：使用蓝色渐变填充，标注「缓慢积累期」；
    2. 加速积累期：使用黄色渐变填充，标注「加速积累期」；
    3. 爆发增长期：使用红色渐变填充，标注「爆发增长期」；
  - 临界点：在曲线的拐点处绘制一个明显的节点，标注「临界点」；
  - 积累动作：在曲线下方添加积累动作的图标，展示不同阶段的核心动作；
  - 文字标注（位置精准，样式工整）：
    1. X轴标注「积累时间（天/周/月/年）」；
    2. Y轴标注「势能值（影响力/价值/粉丝数）」；
    3. 每个阶段标注阶段名称和特点；
    4. 图表顶部中央标注标题：「势能积累思维」，下方标注副标题：「价值爆发前的势能积累过程」；
  - 图例说明：清晰标注不同阶段的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：曲线线条平滑、阶段划分清晰、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 做文案接单副业，打包成"文案+排版+发布指导"的套餐服务，价值和收益比单篇写作提升3倍以上；2. 职场中负责活动策划，整合市场、设计、技术等部门资源，推出"线上+线下"的组合活动。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张价值倍增思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用价值放大布局，展示从单一价值到倍数价值的放大过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用中心发散或层级递进的方式展示价值放大的路径。

  2. 核心元素细节：
  - 单一价值节点：左侧绘制一个圆形节点，标注「单一价值」，使用蓝色渐变填充；
  - 乘数因子：围绕单一价值节点绘制3-4个乘数因子图标，每个因子使用不同颜色：
    1. 资源整合：使用绿色渐变填充，标注「资源整合」；
    2. 模式创新：使用黄色渐变填充，标注「模式创新」；
    3. 跨界组合：使用紫色渐变填充，标注「跨界组合」；
    4. 杠杆放大：使用橙色渐变填充，标注「杠杆放大」；
  - 倍数价值节点：右侧绘制一个放大的圆形节点，标注「倍数价值」，使用红色渐变填充；
  - 放大箭头：使用带箭头的曲线连接单一价值节点、乘数因子和倍数价值节点，展示价值放大的过程；
  - 放大倍数：在箭头旁标注放大倍数，如「×3」「×5」「×10」；
  - 文字标注（位置精准，样式工整）：
    1. 单一价值节点标注具体的单一价值；
    2. 每个乘数因子标注因子名称和作用；
    3. 倍数价值节点标注最终的倍数价值；
    4. 图表顶部中央标注标题：「价值倍增思维」，下方标注副标题：「通过资源整合实现价值倍数级放大」；
  - 图例说明：清晰标注不同乘数因子的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：节点设计简洁美观、放大箭头流畅、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 分析"为什么短视频带货越来越火"的本质：不是因为视频形式新颖，而是因为"人货场"的重构，缩短了消费者的决策路径；2. 思考"职场晋升的本质"：不是因为加班时间长，而是因为创造的价值大。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张本质思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用表象本质对比布局，展示从现象到本质的洞察过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用上下或左右对比的方式展示现象和本质的关系。

  2. 核心元素细节：
  - 表象层：顶部绘制一个复杂的表象图形，使用灰色渐变填充，包含多个表面现象元素；
  - 本质层：底部绘制一个简洁的本质图形，使用蓝色渐变填充，展示事物的核心本质；
  - 洞察箭头：使用带箭头的曲线从表象层指向本质层，标注「洞察本质」；
  - 追问过程：在箭头旁添加3-4个追问节点，标注「是什么？」「为什么？」「怎么办？」；
  - 解决路径：在本质层下方绘制简洁的解决路径，使用绿色渐变填充；
  - 文字标注（位置精准，样式工整）：
    1. 表象层标注「复杂表象」和具体现象示例；
    2. 本质层标注「核心本质」和具体本质；
    3. 解决路径标注「简洁解决方案」；
    4. 图表顶部中央标注标题：「本质思维」，下方标注副标题：「透过现象看本质」；
  - 图例说明：清晰标注表象层、本质层和解决路径的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：表象图形复杂但有序、本质图形简洁明了、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 目标是"3个月内副业月入5000元"，逆向思考：哪些因素会导致失败？（选题错误、执行力差、定价不合理），提前制定应对策略；2. 设计学习APP，逆向思考：用户最讨厌的学习痛点是什么？（广告多、操作复杂、内容枯燥），据此设计功能。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张逆向思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用逆向对比布局，展示正向思维和逆向思维的对比，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用左右或上下对比的方式展示两种思维模式的差异。

  2. 核心元素细节：
  - 正向思维侧：左侧绘制一个常规的正向思维流程，使用灰色渐变填充，从起点到终点的直线路径；
  - 逆向思维侧：右侧绘制一个反常规的逆向思维流程，使用蓝色渐变填充，从终点到起点的曲线路径；
  - 目标节点：中央绘制一个目标节点，使用黄色渐变填充，标注「目标」；
  - 正向路径：从起点到目标的直线，标注「正向思维：从起点到目标」；
  - 逆向路径：从目标到起点的曲线，标注「逆向思维：从目标到起点」；
  - 风险规避：在逆向路径上添加风险规避节点，标注「规避失败因素」；
  - 文字标注（位置精准，样式工整）：
    1. 正向思维侧标注「常规路径」和具体流程；
    2. 逆向思维侧标注「逆向路径」和具体流程；
    3. 目标节点标注具体目标示例；
    4. 图表顶部中央标注标题：「逆向思维」，下方标注副标题：「反常规思考问题」；
  - 图例说明：清晰标注正向思维和逆向思维的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：路径线条流畅、节点设计简洁美观、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 年度学习目标是"掌握数据分析技能"，设置关键节点：季度1（掌握Excel数据分析）、季度2（掌握Python基础）、季度3（实战项目练习）、季度4（形成作品集）；2. 副业季度目标是"月入5000元"，设置节点：月度1（积累10个潜在客户）、月度2（完成5单基础订单）、月度3（推出高客单价套餐）。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张节点把控思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用节点拆解布局，展示从长期目标到关键节点的拆解过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用水平时间轴或垂直层级的方式展示节点的顺序。

  2. 核心元素细节：
  - 长期目标节点：顶部绘制一个大型目标节点，使用蓝色渐变填充，标注「长期目标」；
  - 关键节点：从长期目标节点向下或向右延伸出4-5个关键节点，每个节点使用不同颜色：
    1. 节点1：使用绿色渐变填充，标注「节点1：初始阶段」；
    2. 节点2：使用黄色渐变填充，标注「节点2：发展阶段」；
    3. 节点3：使用橙色渐变填充，标注「节点3：关键阶段」；
    4. 节点4：使用红色渐变填充，标注「节点4：完成阶段」；
  - 时间轴：在节点下方绘制时间轴，标注每个节点的时间点；
  - 交付标准：在每个节点旁标注该节点的交付标准和验收条件；
  - 连接线条：使用带箭头的直线连接长期目标和各个关键节点，展示拆解关系；
  - 文字标注（位置精准，样式工整）：
    1. 长期目标节点标注具体目标；
    2. 每个关键节点标注节点名称、时间点和交付标准；
    3. 图表顶部中央标注标题：「节点把控思维」，下方标注副标题：「将长期目标拆解为关键节点」；
  - 图例说明：清晰标注不同关键节点的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：节点设计简洁美观、连接线条流畅、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 健身计划是"每周瘦1斤"，执行1周后发现只瘦了0.3斤，校准分析：运动时间足够但饮食控制不到位，调整策略：增加饮食记录环节，控制碳水摄入；2. 学习计划是"每天背50个单词"，执行3天后发现记忆效率低，校准分析：死记硬背效果差，调整策略：改用"词根词缀+例句"的方法。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张行动校准思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用闭环校准布局，展示从目标设定到行动校准的闭环过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用环形或线性流程展示校准周期。

  2. 核心元素细节：
  - 目标设定节点：绘制一个目标节点，使用蓝色渐变填充，标注「目标设定」；
  - 行动执行节点：绘制一个行动节点，使用绿色渐变填充，标注「行动执行」；
  - 偏差分析节点：绘制一个分析节点，使用黄色渐变填充，标注「偏差分析」；
  - 行动校准节点：绘制一个校准节点，使用红色渐变填充，标注「行动校准」；
  - 闭环箭头：使用带箭头的曲线连接各个节点，形成一个闭环；
  - 偏差对比：在偏差分析节点旁添加偏差对比图表，展示目标与实际行动的偏差；
  - 校准策略：在校准节点旁添加校准策略，展示调整方法；
  - 文字标注（位置精准，样式工整）：
    1. 每个节点标注节点名称和具体内容；
    2. 偏差对比图表标注目标值和实际值；
    3. 校准策略标注具体调整方法；
    4. 图表顶部中央标注标题：「行动校准思维」，下方标注副标题：「定期对比目标和实际行动的偏差」；
  - 图例说明：清晰标注不同节点的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：节点设计简洁美观、闭环箭头流畅、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 做职场PPT模板副业，依托小红书平台，研究"干货内容+实用模板"的推荐规则，快速获得精准流量；2. 做知识付费课程，依托抖音平台的"知识分享"扶持计划，参与课程推广活动。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张平台借势思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用平台借势布局，展示依托平台放大自身价值的过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用层级结构展示平台与自身价值的关系。

  2. 核心元素细节：
  - 平台基础层：底部绘制一个大型平台图标，使用蓝色渐变填充，标注「现有平台」；
  - 流量资源层：在平台图标上方绘制流量资源图标，使用绿色渐变填充，标注「流量/资源/规则」；
  - 自身价值层：在流量资源层上方绘制自身价值图标，使用紫色渐变填充，标注「自身价值」；
  - 放大价值层：在自身价值层上方绘制放大的价值图标，使用红色渐变填充，标注「放大后的价值」；
  - 借势箭头：使用带箭头的曲线从平台基础层指向放大价值层，展示价值放大的路径；
  - 平台特性：在平台图标旁标注平台的核心特性，如「流量大」「规则完善」「扶持政策」；
  - 文字标注（位置精准，样式工整）：
    1. 各层标注层级名称和具体内容；
    2. 平台特性标注平台的核心优势；
    3. 图表顶部中央标注标题：「平台借势思维」，下方标注副标题：「依托现有平台快速放大自身价值」；
  - 图例说明：清晰标注不同层级的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：层级结构清晰、借势箭头流畅、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 加入Excel学习社群，主动分享"Excel快捷键大全"和"实战案例"，成为社群核心成员，获得更多副业订单；2. 运营小红书职场账号，参与平台的"职场干货挑战"活动，获得平台流量扶持。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张生态反哺思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用生态共生布局，展示生态与个体之间的相互赋能关系，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用环形或双向箭头的方式展示生态与个体的互动。

  2. 核心元素细节：
  - 生态系统：中央绘制一个生态系统图标，使用蓝色渐变填充，标注「生态系统」；
  - 个体节点：围绕生态系统图标绘制一个个体节点，使用绿色渐变填充，标注「个体/参与者」；
  - 贡献路径：从个体节点指向生态系统的箭头，标注「主动贡献价值」；
  - 赋能路径：从生态系统指向个体节点的箭头，标注「获得生态赋能」；
  - 价值循环：使用双向箭头形成一个闭环，展示贡献与赋能的循环；
  - 贡献内容：在贡献路径旁标注具体的贡献内容，如「分享优质内容」「参与社群活动」「提供实用工具」；
  - 赋能内容：在赋能路径旁标注具体的赋能内容，如「流量扶持」「资源倾斜」「用户认可」；
  - 文字标注（位置精准，样式工整）：
    1. 生态系统标注生态的核心需求；
    2. 个体节点标注个体的角色；
    3. 贡献内容和赋能内容标注具体内容；
    4. 图表顶部中央标注标题：「生态反哺思维」，下方标注副标题：「为生态贡献价值以获得持续赋能」；
  - 图例说明：清晰标注贡献路径和赋能路径的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：图标设计简洁美观、双向箭头流畅、文字居中/对齐工整、颜色渐变均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 想做美食内容分享，聚焦"上班族快手减脂餐"这个细分生态位；2. 职场中，深耕"数据分析+行业洞察"的复合生态位，成为不可替代的角色。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张生态位思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用生态系统布局，展示不同个体在系统中的生态位，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用六边形或圆形布局展示生态系统中的各个生态位。

  2. 核心元素细节：
  - 生态系统背景：绘制一个大型六边形或圆形，使用浅蓝色渐变填充，标注「生态系统」；
  - 生态位节点：在生态系统内绘制多个不同大小、颜色的六边形或圆形节点，每个节点代表一个生态位：
    1. 竞争激烈生态位：使用红色渐变填充，标注「竞争激烈生态位」；
    2. 饱和生态位：使用黄色渐变填充，标注「饱和生态位」；
    3. 空白生态位：使用绿色渐变填充，标注「空白生态位」；
    4. 个人生态位：使用紫色渐变填充，标注「个人生态位」；
  - 差异化优势：在个人生态位节点旁标注差异化优势，如「独特价值」「差异化能力」；
  - 竞争关系：在竞争激烈生态位节点旁标注竞争关系，如「同质化竞争」；
  - 文字标注（位置精准，样式工整）：
    1. 每个生态位节点标注生态位类型和特点；
    2. 个人生态位标注差异化优势；
    3. 图表顶部中央标注标题：「生态位思维」，下方标注副标题：「个体在系统中的独特定位」；
  - 图例说明：清晰标注不同生态位的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：生态位节点设计简洁美观、颜色区分明显、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 做自媒体账号，找擅长视频剪辑的伙伴合作，分工协作产出内容，共享收益；2. 加入"互补型学习小组"，成员之间互相辅导，实现共同进步。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张共生效应图表，具体细节要求如下：

  1. 整体布局：
  - 采用互利合作布局，展示不同个体间的共生关系，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用两个或多个相互连接的图形展示共生关系。

  2. 核心元素细节：
  - 个体节点：绘制2-3个不同颜色的个体节点，每个节点代表一个合作个体：
    1. 个体A：使用蓝色渐变填充，标注「个体A」；
    2. 个体B：使用绿色渐变填充，标注「个体B」；
    3. 个体C（可选）：使用黄色渐变填充，标注「个体C」；
  - 互补优势：在每个个体节点旁标注其独特优势，如「内容创作」「视频剪辑」「运营推广」；
  - 共生连接：使用双向箭头或重叠区域连接各个个体节点，标注「共生关系」；
  - 共同价值：在连接区域标注共同创造的价值，如「1+1>2的放大价值」；
  - 文字标注（位置精准，样式工整）：
    1. 每个个体节点标注个体名称和独特优势；
    2. 共生连接区域标注共同价值；
    3. 图表顶部中央标注标题：「共生效应」，下方标注副标题：「不同个体间的互利合作」；
  - 图例说明：清晰标注不同个体的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：个体节点设计简洁美观、连接关系清晰、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 职场中，持续深耕专业技能，同时提升写作能力和人脉资源，三者形成多维复利；2. 学习中，在"专业知识+学习方法+复盘习惯"三个维度持续投入。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张多维复利思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用多维叠加布局，展示多个维度的复利效应叠加，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用同心圆或层级递进的方式展示不同维度。

  2. 核心元素细节：
  - 中心原点：绘制一个中心原点，使用蓝色渐变填充，标注「复利起点」；
  - 维度圈层：从中心原点向外绘制多个同心圆，每个圈层代表一个维度：
    1. 知识维度：使用蓝色渐变填充，标注「知识维度」；
    2. 技能维度：使用绿色渐变填充，标注「技能维度」；
    3. 人脉维度：使用黄色渐变填充，标注「人脉维度」；
    4. 习惯维度：使用紫色渐变填充，标注「习惯维度」；
  - 复利曲线：在每个维度圈层内绘制一条复利曲线，展示该维度的复利增长；
  - 叠加效应：在最外层绘制一条综合叠加曲线，标注「多维叠加效应」；
  - 时间轴：在图表右侧绘制时间轴，标注不同阶段的复利效果；
  - 文字标注（位置精准，样式工整）：
    1. 每个维度圈层标注维度名称和复利特点；
    2. 综合叠加曲线标注「指数级增长」；
    3. 图表顶部中央标注标题：「多维复利思维」，下方标注副标题：「多维度投入的复利效应」；
  - 图例说明：清晰标注不同维度的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：维度圈层清晰、复利曲线平滑、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 职场中，优先完成"写核心项目方案"等高价值密度任务；2. 学习时，选择"行业核心知识"和"高频实用技能"，淘汰低价值内容。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张价值密度思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用价值对比布局，展示不同任务或活动的价值密度对比，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用横向条形图或气泡图展示价值密度。

  2. 核心元素细节：
  - 坐标系统：绘制X轴（时间/资源投入）和Y轴（价值产出）；
  - 价值密度气泡：在坐标系统中绘制多个不同大小、颜色的气泡，每个气泡代表一个任务或活动，气泡大小代表价值密度：
    1. 高价值密度任务：使用红色渐变填充，标注「高价值密度任务」；
    2. 中价值密度任务：使用黄色渐变填充，标注「中价值密度任务」；
    3. 低价值密度任务：使用绿色渐变填充，标注「低价值密度任务」；
  - 价值密度计算公式：在图表角落标注「价值密度 = 价值产出 / 资源投入」；
  - 优先顺序：在气泡旁标注执行优先顺序，如「优先执行」「延后执行」「淘汰」；
  - 文字标注（位置精准，样式工整）：
    1. 每个气泡标注任务名称和价值密度；
    2. 坐标轴标注「时间/资源投入」和「价值产出」；
    3. 图表顶部中央标注标题：「价值密度思维」，下方标注副标题：「提升单位资源的价值产出」；
  - 图例说明：清晰标注不同价值密度任务的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：气泡大小区分明显、颜色对应正确、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 学习英语，当前水平是"能看懂简单短文"，选择"看带少量生词的短文+写短句"的学习区任务；2. 职场中，完成常规工作后，主动申请"略高于现有能力的项目"。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张认知圈思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用同心圆布局，展示认知的三个区域，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用三个同心圆分别代表舒适区、学习区和恐慌区。

  2. 核心元素细节：
  - 舒适区：最内层同心圆，使用绿色渐变填充，标注「舒适区」；
  - 学习区：中间层同心圆，使用黄色渐变填充，标注「学习区」；
  - 恐慌区：最外层同心圆，使用红色渐变填充，标注「恐慌区」；
  - 认知边界：在每个区域的边界绘制虚线，标注「认知边界」；
  - 成长路径：从舒适区指向学习区的箭头，标注「主动成长」；
  - 风险警告：从学习区指向恐慌区的箭头，标注「避免过度挑战」；
  - 文字标注（位置精准，样式工整）：
    1. 每个区域标注区域名称和特点，如「舒适区：熟悉的知识和技能」；
    2. 认知边界标注「认知边界」；
    3. 成长路径标注「主动成长路径」；
    4. 图表顶部中央标注标题：「认知圈思维」，下方标注副标题：「认知的三个区域」；
  - 图例说明：清晰标注不同认知区域的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：同心圆边界清晰、颜色区分明显、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 传统实体店结合"线上直播带货+社群运营"，打造"线下体验+线上销售"的新模式；2. 程序员学习"产品思维"和"运营知识"，转型为"技术+产品"的复合型人才。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张破界思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用边界突破布局，展示打破认知边界的过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用一个被打破的框架或边界线展示破界过程。

  2. 核心元素细节：
  - 旧边界框架：绘制一个矩形框架，部分边框被打破，使用灰色渐变填充，标注「旧认知边界」；
  - 新视角区域：在框架外绘制一个扩展区域，使用蓝色渐变填充，标注「新视角区域」；
  - 破界箭头：从旧边界指向新视角的箭头，标注「打破边界」；
  - 创新方案：在新视角区域绘制创新方案图标，标注「创新解决方案」；
  - 旧思维局限：在旧边界内标注旧思维的局限，如「固有框架」「思维定势」；
  - 文字标注（位置精准，样式工整）：
    1. 旧边界框架标注「旧认知边界」和思维局限；
    2. 新视角区域标注「新视角区域」和创新方案；
    3. 破界箭头标注「打破边界」；
    4. 图表顶部中央标注标题：「破界思维」，下方标注副标题：「打破认知边界」；
  - 图例说明：清晰标注旧边界和新视角的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：框架边界清晰、破界效果明显、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 做项目时，为核心数据设置"本地+云端"双重备份；2. 学习时，备份重要的学习资料和笔记，准备两套学习计划。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张冗余备份思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用风险应对布局，展示冗余备份的设计，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用主系统和备份系统的对比展示冗余备份。

  2. 核心元素细节：
  - 主系统：左侧绘制一个系统图标，使用蓝色渐变填充，标注「主系统」；
  - 备份系统：右侧绘制一个备用系统图标，使用绿色渐变填充，标注「备份系统」；
  - 冗余连接：使用双向箭头连接主系统和备份系统，标注「冗余连接」；
  - 风险事件：在主系统旁绘制风险事件图标，标注「突发风险」；
  - 切换机制：在连接线上绘制切换机制图标，标注「自动切换」；
  - 文字标注（位置精准，样式工整）：
    1. 主系统标注「主系统：正常运行」；
    2. 备份系统标注「备份系统：随时待命」；
    3. 风险事件标注「突发风险：系统故障」；
    4. 切换机制标注「自动切换：确保系统持续运行」；
    5. 图表顶部中央标注标题：「冗余备份思维」，下方标注副标题：「应对突发风险」；
  - 图例说明：清晰标注主系统、备份系统和风险事件的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：系统图标设计简洁美观、冗余连接清晰、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 备考时，采用"2小时专注学习+30分钟休息"的节奏；2. 推进长期项目时，设定"每周固定进度"，避免前期拖延、后期赶工。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张节奏把控思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用波形图布局，展示张弛有度的节奏，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用波浪线展示精力和输出的节奏变化。

  2. 核心元素细节：
  - 时间轴：绘制X轴（时间）和Y轴（精力/输出）；
  - 节奏曲线：绘制一条波浪线，展示精力和输出的起伏变化，使用蓝色渐变填充；
  - 专注期：在波浪线的波峰区域标注「专注期」，使用绿色渐变填充；
  - 休息期：在波浪线的波谷区域标注「休息期」，使用黄色渐变填充；
  - 疲劳警告：在过度紧绷区域标注「疲劳警告」，使用红色渐变填充；
  - 低效警告：在过度松弛区域标注「低效警告」，使用橙色渐变填充；
  - 文字标注（位置精准，样式工整）：
    1. 专注期标注「专注期：高效执行」；
    2. 休息期标注「休息期：彻底放松」；
    3. 疲劳警告标注「疲劳警告：过度紧绷」；
    4. 低效警告标注「低效警告：过度松弛」；
    5. 图表顶部中央标注标题：「节奏把控思维」，下方标注副标题：「保持张弛有度的节奏」；
  - 图例说明：清晰标注专注期、休息期和警告区域的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：波浪线平滑、区域划分清晰、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 多数健身博主聚焦"减脂增肌"，选择主打"上班族15分钟办公室健身"；2. 职场中，深耕"行业专属数据建模"，成为处理复杂行业数据的专家。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张错位竞争思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用竞争避开布局，展示错位竞争的策略，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用竞争对手和自身定位的对比展示错位竞争。

  2. 核心元素细节：
  - 竞争对手领域：左侧绘制竞争对手的优势领域，使用红色渐变填充，标注「竞争对手优势领域」；
  - 自身定位：右侧绘制自身的错位定位，使用蓝色渐变填充，标注「自身错位定位」；
  - 避开箭头：从竞争对手领域指向自身定位的箭头，标注「避开正面竞争」；
  - 差异化优势：在自身定位旁标注差异化优势，如「独特价值」「细分需求」；
  - 竞争激烈区域：在竞争对手领域旁标注「竞争激烈区域」；
  - 文字标注（位置精准，样式工整）：
    1. 竞争对手领域标注「竞争对手优势领域：竞争激烈」；
    2. 自身定位标注「自身错位定位：差异化优势」；
    3. 差异化优势标注「差异化优势：独特价值」；
    4. 图表顶部中央标注标题：「错位竞争思维」，下方标注副标题：「避免正面竞争」；
  - 图例说明：清晰标注竞争对手领域和自身定位的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：领域划分清晰、错位关系明显、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 搭建英语学习社群，设置"每日打卡互评""组队背单词"等互动机制；2. 推广学习笔记工具，先免费开放给学霸用户，他们分享的优质笔记吸引更多用户。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张网络效应思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用网络扩张布局，展示用户数量与产品价值的关系，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用节点连接图展示网络效应。

  2. 核心元素细节：
  - 初始用户节点：中心绘制初始用户节点，使用蓝色渐变填充，标注「初始用户」；
  - 扩张节点：从初始节点向外扩张多个用户节点，使用不同颜色填充，标注「新用户」；
  - 连接线条：使用双向箭头连接各个用户节点，标注「用户连接」；
  - 价值增长曲线：右侧绘制价值增长曲线，展示价值随用户数量的增长，使用红色渐变填充；
  - 正向循环：在图表角落标注「正向循环：用户越多→价值越高→更多用户」；
  - 文字标注（位置精准，样式工整）：
    1. 初始用户节点标注「初始用户：核心用户」；
    2. 扩张节点标注「新用户：通过口碑吸引」；
    3. 连接线条标注「用户连接：互动产生价值」；
    4. 价值增长曲线标注「价值增长：指数级增长」；
    5. 图表顶部中央标注标题：「网络效应思维」，下方标注副标题：「用户数量对产品价值的影响」；
  - 图例说明：清晰标注初始用户、新用户和价值增长的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：节点连接清晰、价值增长曲线平滑、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 做自媒体时，花时间写系列干货文章、开发小课程，形成"内容资产"；2. 职场中，把解决复杂问题的经验整理成"方法论手册"，沉淀为"经验资产"。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张资产化思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用资产转化布局，展示投入到资产的转化过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用线性流程展示从投入到资产的转化。

  2. 核心元素细节：
  - 投入阶段：左侧绘制投入阶段图标，使用蓝色渐变填充，标注「投入阶段」；
  - 转化过程：中间绘制转化过程图标，使用黄色渐变填充，标注「转化过程」；
  - 资产阶段：右侧绘制资产阶段图标，使用绿色渐变填充，标注「资产阶段」；
  - 转化箭头：使用带箭头的曲线连接各个阶段，标注「转化为资产」；
  - 资产类型：在资产阶段旁绘制不同类型的资产图标，标注「资产类型：内容资产、经验资产、技能资产」；
  - 文字标注（位置精准，样式工整）：
    1. 投入阶段标注「投入阶段：时间、精力、技能」；
    2. 转化过程标注「转化过程：整理、优化、沉淀」；
    3. 资产阶段标注「资产阶段：可复用、可增值、可持续收益」；
    4. 资产类型标注「资产类型：内容资产、经验资产、技能资产」；
    5. 图表顶部中央标注标题：「资产化思维」，下方标注副标题：「将投入转化为长期资产」；
  - 图例说明：清晰标注投入阶段、转化过程和资产阶段的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：阶段划分清晰、转化过程明显、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 深耕"短视频脚本创作"，积累行业案例和用户数据，形成"技巧+数据"的双重壁垒；2. 打造个人品牌，通过持续输出优质内容，建立"靠谱、专业"的形象。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张护城河思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用壁垒防护布局，展示核心竞争力壁垒，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用护城河围绕核心竞争力展示壁垒。

  2. 核心元素细节：
  - 核心竞争力：中央绘制核心竞争力图标，使用蓝色渐变填充，标注「核心竞争力」；
  - 护城河：围绕核心竞争力绘制护城河，使用绿色渐变填充，标注「护城河」；
  - 壁垒类型：在护城河旁绘制不同类型的壁垒图标，标注「壁垒类型：稀缺技能、个人品牌、资源人脉」；
  - 竞争对手：在护城河外绘制竞争对手图标，标注「竞争对手：难以突破壁垒」；
  - 文字标注（位置精准，样式工整）：
    1. 核心竞争力标注「核心竞争力：别人拿不走的优势」；
    2. 护城河标注「护城河：难以复制的壁垒」；
    3. 壁垒类型标注「壁垒类型：稀缺技能、个人品牌、资源人脉」；
    4. 竞争对手标注「竞争对手：难以突破壁垒」；
    5. 图表顶部中央标注标题：「护城河思维」，下方标注副标题：「建立核心竞争力壁垒」；
  - 图例说明：清晰标注核心竞争力、护城河和壁垒类型的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：壁垒防护明显、护城河环绕清晰、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 读完《高效能人士的七个习惯》，第二天就实践"要事第一"的原则；2. 学习"数据透视表"的用法后，立刻用自己的工作数据做一次分析。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张知行合一思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用知识行动融合布局，展示知识与行动的关系，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用两个相互融合的图形展示知行合一。

  2. 核心元素细节：
  - 知识部分：左侧绘制知识图标，使用蓝色渐变填充，标注「知识部分」；
  - 行动部分：右侧绘制行动图标，使用绿色渐变填充，标注「行动部分」；
  - 融合区域：在知识和行动的交界处绘制融合区域，使用黄色渐变填充，标注「融合区域」；
  - 融合箭头：使用双向箭头连接知识和行动，标注「知行合一」；
  - 纸上谈兵警告：在知识部分旁标注「纸上谈兵警告：知而不行，只是未知」；
  - 文字标注（位置精准，样式工整）：
    1. 知识部分标注「知识部分：理论学习」；
    2. 行动部分标注「行动部分：实践验证」；
    3. 融合区域标注「融合区域：知行合一」；
    4. 纸上谈兵警告标注「纸上谈兵警告：知而不行，只是未知」；
    5. 图表顶部中央标注标题：「知行合一思维」，下方标注副标题：「知识与行动的关系」；
  - 图例说明：清晰标注知识部分、行动部分和融合区域的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：融合效果明显、箭头连接清晰、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 想养成写作习惯，从"每天写1句话"开始；2. 培养复盘习惯，每天只花5分钟记录"1个收获+1个改进点"。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张微习惯复利思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用增长曲线布局，展示微小习惯的长期复利效应，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用一条平滑的曲线展示从微小习惯到巨大成果的增长过程。

  2. 核心元素细节：
  - 微习惯起点：左侧绘制微习惯起点，使用蓝色渐变填充，标注「微习惯起点」；
  - 坚持过程：中间绘制坚持过程的曲线，使用绿色渐变填充，标注「坚持过程」；
  - 成果节点：右侧绘制成果节点，使用红色渐变填充，标注「成果节点」；
  - 复利曲线：绘制一条从左下到右上的平滑曲线，展示复利增长，使用紫色渐变填充；
  - 时间轴：在曲线下方绘制时间轴，标注「第1天」「第21天」「第3个月」「第1年」等关键时间点；
  - 关键节点：在曲线上标注关键节点，如「习惯形成」「效果显现」「成果爆发」；
  - 文字标注（位置精准，样式工整）：
    1. 微习惯起点标注「微习惯起点：极小的、毫无压力的动作」；
    2. 坚持过程标注「坚持过程：长期坚持，利用惯性」；
    3. 成果节点标注「成果节点：巨大的改变」；
    4. 关键节点标注「关键节点：习惯形成、效果显现、成果爆发」；
    5. 图表顶部中央标注标题：「微习惯复利思维」，下方标注副标题：「微小习惯的长期影响」；
  - 图例说明：清晰标注微习惯起点、坚持过程和成果节点的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：曲线平滑、节点清晰、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 时间分配：80%用于本职工作和核心技能学习，20%用于尝试新的副业赛道；2. 资金投资：80%用于低风险理财，20%用于高风险投资。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张杠铃策略图表，具体细节要求如下：

  1. 整体布局：
  - 采用两极平衡布局，展示杠铃策略的风险收益平衡，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用杠铃形状展示两极资源分配。

  2. 核心元素细节：
  - 稳健部分：左侧绘制稳健部分，使用绿色渐变填充，标注「稳健部分」，占大部分面积；
  - 投机部分：右侧绘制投机部分，使用红色渐变填充，标注「投机部分」，占小部分面积；
  - 杠铃杆：中间绘制杠铃杆，连接稳健部分和投机部分，标注「杠铃杆」；
  - 风险收益标注：在每个部分旁标注风险和收益，如「低风险、低收益」「高风险、高收益」；
  - 避免区域：在中间部分标注「避免区域」，使用灰色渐变填充；
  - 文字标注（位置精准，样式工整）：
    1. 稳健部分标注「稳健部分：低风险、低收益，占大部分资源」；
    2. 投机部分标注「投机部分：高风险、高收益，占小部分资源」；
    3. 避免区域标注「避免区域：中等风险、中等收益，不投入」；
    4. 图表顶部中央标注标题：「杠铃策略」，下方标注副标题：「平衡风险和收益」；
  - 图例说明：清晰标注稳健部分、投机部分和避免区域的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：杠铃形状明显、资源分配比例合理、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 职场中，主动申请参与有挑战性的项目，即使失败也能积累经验；2. 做副业时，接受"收入波动"的常态，当遇到订单减少时，优化产品或服务。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张反脆弱思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用风险获益布局，展示从风险中获益的过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用冲击和成长的对比展示反脆弱思维。

  2. 核心元素细节：
  - 脆弱系统：左侧绘制脆弱系统图标，使用红色渐变填充，标注「脆弱系统」；
  - 强韧系统：中间绘制强韧系统图标，使用蓝色渐变填充，标注「强韧系统」；
  - 反脆弱系统：右侧绘制反脆弱系统图标，使用绿色渐变填充，标注「反脆弱系统」；
  - 冲击事件：在每个系统旁绘制冲击事件图标，标注「冲击事件」；
  - 系统反应：在每个系统旁标注系统反应，如「崩溃」「承受」「变得更强大」；
  - 文字标注（位置精准，样式工整）：
    1. 脆弱系统标注「脆弱系统：遇到冲击崩溃」；
    2. 强韧系统标注「强韧系统：遇到冲击承受」；
    3. 反脆弱系统标注「反脆弱系统：遇到冲击变得更强大」；
    4. 冲击事件标注「冲击事件：风险、挫折、波动」；
    5. 图表顶部中央标注标题：「反脆弱思维」，下方标注副标题：「从风险中获益」；
  - 图例说明：清晰标注脆弱系统、强韧系统和反脆弱系统的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：系统对比明显、冲击事件清晰、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 观察到"宝妈带娃出行时，很难买到小份、健康的零食"这个供需错配点，推出"宝妈便携小份零食组合"，精准匹配需求。2. 职场中发现"同事们做周报时，总是重复整理数据"的痛点，开发一个"周报数据自动汇总模板"，解决效率问题。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张供需错配洞察思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用供需对比布局，展示供需错配的机会，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用左右或上下对比的方式展示供给和需求的关系。

  2. 核心元素细节：
  - 需求侧：左侧绘制需求侧图标，使用蓝色渐变填充，标注「需求侧」；
  - 供给侧：右侧绘制供给侧图标，使用红色渐变填充，标注「供给侧」；
  - 错配区域：在需求和供给的交界处绘制错配区域，使用黄色渐变填充，标注「错配区域」；
  - 机会箭头：从错配区域指向解决方案的箭头，标注「机会点」；
  - 解决方案：在图表下方绘制解决方案图标，标注「精准解决方案」；
  - 文字标注（位置精准，样式工整）：
    1. 需求侧标注「需求侧：用户真实需求」；
    2. 供给侧标注「供给侧：现有供给」；
    3. 错配区域标注「错配区域：供需不匹配的机会」；
    4. 解决方案标注「精准解决方案：满足未被满足的需求」；
    5. 图表顶部中央标注标题：「供需错配洞察思维」，下方标注副标题：「市场的机会往往藏在供需错配的缝隙里」；
  - 图例说明：清晰标注需求侧、供给侧和错配区域的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：供需对比明显、错配区域清晰、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 拥有"数据分析"的核心技能，作为支点，撬动"帮企业做数据报告""开发数据模板售卖""做数据分析培训"等多个收益渠道，实现技能价值放大。2. 借助"短视频平台"这个杠杆，用一条优质内容撬动百万流量，相比传统线下推广，投入小、收益大。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张杠杆思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用杠杆撬动布局，展示杠杆思维的核心原理，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用杠杆和支点的图形展示杠杆原理。

  2. 核心元素细节：
  - 杠杆：绘制一个杠杆图形，使用蓝色渐变填充，标注「杠杆」；
  - 支点：在杠杆的支点位置绘制支点，使用红色渐变填充，标注「支点」；
  - 自身投入：在杠杆的一端绘制自身投入，使用绿色渐变填充，标注「自身投入」；
  - 放大收益：在杠杆的另一端绘制放大收益，使用黄色渐变填充，标注「放大收益」；
  - 杠杆比例：在杠杆旁标注「杠杆比例：1:10」，表示放大倍数；
  - 核心资源：在支点旁标注「核心资源：人脉、技能、平台」；
  - 文字标注（位置精准，样式工整）：
    1. 杠杆标注「杠杆：撬动核心资源」；
    2. 支点标注「支点：找到杠杆点」；
    3. 自身投入标注「自身投入：极小的投入」；
    4. 放大收益标注「放大收益：倍数级收益」；
    5. 图表顶部中央标注标题：「杠杆思维」，下方标注副标题：「通过撬动核心资源，用极小的自身投入，获得放大倍数的收益」；
  - 图例说明：清晰标注杠杆、支点、自身投入和放大收益的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：杠杆原理清晰、支点位置准确、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 每天输出1条职场干货，积累3个月形成内容复利；再对接职场类公众号平台投稿，借助平台流量杠杆，让内容触达更多用户，实现个人IP影响力的指数级增长。2. 做设计接单副业，先通过低价单积累作品和口碑的复利；再和本地广告公司合作，借助公司的客户资源杠杆，快速获得高客单价订单，实现收益的跨越式提升。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张复利杠杆思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用复利叠加杠杆布局，展示复利和杠杆的叠加效应，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用复利曲线和杠杆图形的组合展示叠加效应。

  2. 核心元素细节：
  - 复利曲线：底部绘制复利曲线，使用蓝色渐变填充，标注「复利曲线」；
  - 杠杆图形：在复利曲线的上方绘制杠杆图形，使用红色渐变填充，标注「杠杆图形」；
  - 叠加区域：在复利曲线和杠杆图形的交界处绘制叠加区域，使用绿色渐变填充，标注「叠加区域」；
  - 指数增长标注：在叠加区域标注「指数级增长」；
  - 线性增长标注：在复利曲线旁标注「线性复利增长」；
  - 文字标注（位置精准，样式工整）：
    1. 复利曲线标注「复利曲线：线性增长基础」；
    2. 杠杆图形标注「杠杆：加速器」；
    3. 叠加区域标注「叠加区域：指数级增长」；
    4. 线性增长标注「线性增长：仅靠复利」；
    5. 图表顶部中央标注标题：「复利杠杆思维」，下方标注副标题：「复利效应基础上叠加杠杆，实现指数级增长」；
  - 图例说明：清晰标注复利曲线、杠杆图形和叠加区域的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：复利曲线平滑、杠杆图形清晰、叠加效果明显、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 核心价值是"文案写作"，接入自媒体内容生态、电商品牌推广生态、企业内刊编辑生态，为不同网络提供定制化文案服务，实现一单多收的价值放大。2. 核心价值是"数据分析"，接入公司业务部门、市场调研团队、外部咨询机构的价值网络，为不同场景提供数据分析支持，挖掘更多职场晋升机会。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张价值网络思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用价值网络布局，展示自身价值节点接入多个价值网络的协同效应，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用节点和连接线条的网络布局展示价值网络。

  2. 核心元素细节：
  - 自身价值节点：中央绘制自身价值节点，使用蓝色渐变填充，标注「自身价值节点」；
  - 价值网络：从自身价值节点向外连接多个价值网络，每个网络使用不同颜色填充：
    1. 价值网络1：使用绿色渐变填充，标注「价值网络1」；
    2. 价值网络2：使用红色渐变填充，标注「价值网络2」；
    3. 价值网络3：使用黄色渐变填充，标注「价值网络3」；
  - 连接线条：使用双向箭头连接自身价值节点和各个价值网络，标注「价值连接」；
  - 协同效应：在连接线条的交界处标注「协同效应」；
  - 文字标注（位置精准，样式工整）：
    1. 自身价值节点标注「自身价值节点：核心价值」；
    2. 每个价值网络标注「价值网络：互补生态」；
    3. 连接线条标注「价值连接：接入网络」；
    4. 协同效应标注「协同效应：放大价值」；
    5. 图表顶部中央标注标题：「价值网络思维」，下方标注副标题：「接入多个互补的价值网络，放大自身价值」；
  - 图例说明：清晰标注自身价值节点、价值网络和协同效应的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：网络布局清晰、连接线条流畅、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 做职场干货自媒体，前期持续日更3个月积累到8000粉，临近1万粉阈值时，策划"粉丝专属干货礼包"活动，快速突破阈值，之后流量和变现效率显著提升。2. 做插画接单副业，坚持积累20个优质商业案例，突破"案例量阈值"后，主动对接设计平台，凭借作品集获得高客单价订单，实现收入跃迁。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张阈值突破思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用阈值曲线布局，展示从积累期到突破期的价值增长过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用横向时间轴展示积累时间，纵向轴展示价值增长。

  2. 核心元素细节：
  - 坐标系统：绘制X轴（积累时间）和Y轴（价值/成果）；
  - 阈值曲线：绘制一条S形或J形曲线，从左下缓慢上升，到某一点后陡峭上升，使用蓝色渐变填充，标注「价值增长曲线」；
  - 积累期：在曲线平缓上升的区域标注「积累期」，使用绿色渐变填充；
  - 阈值点：在曲线陡峭上升的拐点处绘制明显的节点，使用红色渐变填充，标注「临界阈值」；
  - 爆发期：在曲线陡峭上升的区域标注「爆发期」，使用黄色渐变填充；
  - 积累动作：在积累期下方添加积累动作的图标，如「持续学习」「日更内容」等；
  - 文字标注（位置精准，样式工整）：
    1. 积累期标注「积累期：缓慢增长，前期投入大，回报小」；
    2. 阈值点标注「临界阈值：突破点，量变引发质变」；
    3. 爆发期标注「爆发期：指数级增长，投入产出比大幅提升」；
    4. 图表顶部中央标注标题：「阈值突破思维」，下方标注副标题：「前期积累，突破阈值后指数增长」；
  - 图例说明：清晰标注积累期、阈值点和爆发期的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：曲线线条平滑、阈值点明显、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 副业初期锚点是"写单篇文案"，升级后锚点是"提供品牌文案全案"，围绕新锚点学习营销策略、品牌定位知识，服务从中小客户升级为品牌客户，客单价提升5倍以上。2. 职场初期锚点是"执行数据录入"，升级后锚点是"输出数据洞察报告"，学习数据分析和可视化技能，为团队提供决策支持，实现从执行层到分析层的跃迁。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张价值锚点升级思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用锚点升级布局，展示从低维度到高维度价值锚点的升级过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用垂直或水平层级布局展示不同阶段的价值锚点。

  2. 核心元素细节：
  - 锚点层级：
    1. 低价值锚点：底部绘制低价值锚点，使用蓝色渐变填充，标注「低价值锚点」；
    2. 中价值锚点：中间绘制中价值锚点，使用绿色渐变填充，标注「中价值锚点」；
    3. 高价值锚点：顶部绘制高价值锚点，使用紫色渐变填充，标注「高价值锚点」；
  - 升级箭头：使用带箭头的曲线连接不同层级的锚点，标注「价值升级」；
  - 能力支撑：在每个锚点下方绘制支撑该锚点的能力图标，如「基础技能」「专业能力」「核心竞争力」；
  - 价值变化：在锚点右侧绘制价值变化的条形图，展示价值提升的幅度；
  - 文字标注（位置精准，样式工整）：
    1. 低价值锚点标注「低价值锚点：执行层，被动接受任务，价值低」；
    2. 中价值锚点标注「中价值锚点：专业层，解决专业问题，价值中等」；
    3. 高价值锚点标注「高价值锚点：决策层，制定战略方向，价值高」；
    4. 图表顶部中央标注标题：「价值锚点升级思维」，下方标注副标题：「设置更高维度的价值锚点，实现价值跃迁」；
  - 图例说明：清晰标注不同价值锚点的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：锚点设计简洁美观、升级箭头流畅、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 学习Python编程时，发现自己总是死记硬背代码，通过元认知反思："我的学习方式是\'机械记忆\'，缺少对逻辑的理解"，调整为"先理解代码逻辑，再动手实操"，学习效率大幅提升。2. 做项目决策时，元认知监控到自己"只关注短期收益，忽略长期风险"，立刻引入"风险收益比思维"，重新评估方案，提升决策的科学性。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张元认知思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用监控反思布局，展示元认知对认知过程的监控和优化，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用嵌套或环绕式布局展示认知过程和元认知监控。

  2. 核心元素细节：
  - 认知过程：中央绘制一个大脑图标，代表认知过程，使用蓝色渐变填充，标注「认知过程」；
  - 元认知监控：在大脑图标外围绘制监控环，使用绿色渐变填充，标注「元认知监控」；
  - 监控箭头：从监控环指向认知过程的箭头，标注「监控」；
  - 反思箭头：从认知过程指向监控环的箭头，标注「反思」；
  - 优化箭头：从监控环指向认知过程的箭头，标注「优化」；
  - 认知阶段：在认知过程内绘制不同的认知阶段，如「感知」「分析」「决策」「行动」；
  - 监控节点：在监控环上绘制监控节点，如「观察思考方式」「评估逻辑漏洞」「调整思维模型」；
  - 文字标注（位置精准，样式工整）：
    1. 认知过程标注「认知过程：感知、分析、决策、行动」；
    2. 元认知监控标注「元认知监控：思考自己的思考，监控、反思、优化」；
    3. 监控节点标注「监控节点：观察、评估、调整」；
    4. 图表顶部中央标注标题：「元认知思维」，下方标注副标题：「思考自己的思考方式，提升认知能力」；
  - 图例说明：清晰标注认知过程、元认知监控和监控节点的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：大脑图标设计简洁美观、监控环清晰、箭头连接流畅、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 思考"学习打卡工具的本质"，不是"记录打卡次数"，而是"提升学习动力"，从这个本质出发，设计"打卡+同伴监督+奖励机制"的创新功能，区别于传统的打卡工具。2. 思考"副业的本质"，不是"赚零花钱"，而是"价值变现"，从这个本质出发，放弃"低价值的苦力单"，选择"和自身核心能力匹配的高价值服务"，重新定义副业赛道。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张第一性原理创新思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用本质推导布局，展示从本质公理到创新解决方案的推导过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用垂直或水平层级布局展示从本质到创新的推导链条。

  2. 核心元素细节：
  - 本质层：底部绘制本质层，使用蓝色渐变填充，标注「本质层」，包含「事物本质」和「基础公理」；
  - 推导层：中间绘制推导层，使用绿色渐变填充，标注「推导层」，包含「逻辑推导」和「路径重构」；
  - 创新层：顶部绘制创新层，使用紫色渐变填充，标注「创新层」，包含「颠覆性创新」和「解决方案」；
  - 传统路径对比：在左侧绘制传统路径，使用灰色渐变填充，标注「传统路径：经验类比，跟风模仿」；
  - 创新路径：在右侧绘制创新路径，使用橙色渐变填充，标注「创新路径：本质推导，从零开始」；
  - 推导箭头：使用带箭头的曲线连接不同层级，标注「创新推导」；
  - 文字标注（位置精准，样式工整）：
    1. 本质层标注「本质层：事物本质，最基础的公理」；
    2. 推导层标注「推导层：逻辑推导，路径重构」；
    3. 创新层标注「创新层：颠覆性创新，全新解决方案」；
    4. 图表顶部中央标注标题：「第一性原理创新思维」，下方标注副标题：「从事物本质出发，实现颠覆性创新」；
  - 图例说明：清晰标注本质层、推导层和创新层的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：层级结构清晰、推导箭头流畅、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 陷入"PPT接单低价内卷"的旧范式，打破后切换到"PPT模板产品化"新范式，开发行业专属模板，通过多平台售卖实现被动收入，摆脱内卷困境。2. 职场陷入"靠加班提升业绩"的旧范式，打破后切换到"靠效率提升+资源整合"新范式，优化工作流程、对接跨部门资源，用更少时间做出更好成果。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张范式转移思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用框架打破布局，展示从旧范式到新范式的转移过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用对比或转换式布局展示旧范式和新范式的差异。

  2. 核心元素细节：
  - 旧范式：左侧绘制旧范式框架，部分边框被打破，使用灰色渐变填充，标注「旧范式」；
  - 新范式：右侧绘制新范式框架，使用蓝色渐变填充，标注「新范式」；
  - 打破动作：中间绘制打破旧框架的图标，如锤子或爆炸效果，标注「打破旧框架」；
  - 问题节点：在旧范式内绘制无法解决的问题，使用红色渐变填充，标注「问题」；
  - 解决方案：在新范式内绘制创新解决方案，使用绿色渐变填充，标注「解决方案」；
  - 转移箭头：使用带箭头的曲线连接旧范式和新范式，标注「范式转移」；
  - 文字标注（位置精准，样式工整）：
    1. 旧范式标注「旧范式：原有框架，无法解决新问题，思维局限」；
    2. 新范式标注「新范式：全新框架，解决旧问题，创新突破」；
    3. 问题节点标注「问题：旧范式无法解决的问题」；
    4. 解决方案标注「解决方案：新范式下的创新方案」；
    5. 图表顶部中央标注标题：「范式转移思维」，下方标注副标题：「打破旧框架，切换新范式，解决新问题」；
  - 图例说明：清晰标注旧范式、新范式和转移过程的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：框架对比明显、打破效果生动、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 面临两个副业选择：A是"小红书好物推荐"（成功概率60%，收益5000元，成本500元），B是"线下手工摆摊"（成功概率30%，收益8000元，成本2000元），计算得A概率权更高，优先选择A，同时用小额资金试错B。2. 职场有两个项目可选：A是成熟项目（成功概率90%，收益中等，成本低），B是创新项目（成功概率40%，收益高，成本高），选择A为主、B为辅的策略，兼顾稳收益和高潜力。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张概率权思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用对比决策布局，展示不同选项的概率权对比，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用横向对比或矩阵布局展示不同选项的概率权。

  2. 核心元素细节：
  - 选项卡片：绘制2-3个选项卡片，每个卡片包含「成功概率」「潜在收益」「失败成本」「概率权计算」；
  - 概率权计算：每个卡片内使用公式展示概率权计算过程，如「概率权 = 成功概率×收益 - 失败概率×成本」；
  - 对比图表：在卡片下方绘制概率权对比的条形图，使用不同颜色区分选项；
  - 决策建议：在图表底部绘制决策建议，标注「优先选择概率权最高的选项」；
  - 文字标注（位置精准，样式工整）：
    1. 选项卡片标注「选项A：成功概率60%，收益5000元，成本500元，概率权=2750」；
    2. 选项卡片标注「选项B：成功概率30%，收益8000元，成本2000元，概率权=400」；
    3. 对比图表标注「概率权对比：选项A > 选项B」；
    4. 决策建议标注「决策建议：优先选择选项A，为选项B保留小额试错空间」；
    5. 图表顶部中央标注标题：「概率权思维」，下方标注副标题：「计算概率权，理性选择最优方案」；
  - 图例说明：清晰标注不同选项的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：选项卡片设计简洁、计算过程清晰、对比图表直观、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 核心目标是"3个月掌握深度学习基础"，期间卸载所有游戏和短视频APP，每天投入4小时专注学习，拒绝朋友的无效聚会邀请，集中精力攻克核心知识点，实现技能的快速突破。2. 核心目标是"完成公司年度核心项目"，期间暂停所有非核心的日常琐事，将团队资源集中到项目上，每天召开进度推进会，确保项目按时高质量完成。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张极致专注思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用聚焦目标布局，展示资源集中于核心目标的过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用中心聚焦或径向布局展示资源向核心目标的汇聚。

  2. 核心元素细节：
  - 核心目标：中央绘制一个大型目标图标，使用红色渐变填充，标注「核心目标」；
  - 资源汇聚：从四周向核心目标绘制资源汇聚的箭头，使用不同颜色代表不同类型的资源，如「时间」「精力」「注意力」；
  - 干扰元素：在资源汇聚的路径上绘制被排除的干扰元素，使用灰色渐变填充，标注「干扰项：游戏、短视频、无效社交」；
  - 聚焦效果：在核心目标周围绘制聚焦光环，使用黄色渐变填充，标注「聚焦效果：高效突破」；
  - 资源分配：在图表底部绘制资源分配的饼图，标注「80%资源投入核心目标，20%处理必要事务」；
  - 文字标注（位置精准，样式工整）：
    1. 核心目标标注「核心目标：3个月掌握深度学习基础」；
    2. 资源汇聚标注「资源汇聚：时间、精力、注意力向核心目标集中」；
    3. 干扰元素标注「干扰项：被排除的无关任务和干扰」；
    4. 聚焦效果标注「聚焦效果：高效突破，快速达成目标」；
    5. 图表顶部中央标注标题：「极致专注思维」，下方标注副标题：「资源聚焦，实现单点突破」；
  - 图例说明：清晰标注核心目标、资源汇聚和干扰元素的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：聚焦效果明显、资源汇聚流畅、干扰元素清晰、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 想探索"小红书职场干货"的副业赛道，提出假设"职场PPT技巧内容在小红书有流量"，用7天时间每天发1条PPT技巧笔记，测试后发现流量不错，立刻加大投入；若流量差，则快速切换选题。2. 想验证"费曼学习法"是否适合自己，用1周时间尝试用该方法学习一个小知识点，测试后发现理解效率提升，就将该方法推广到所有学习中；若效果差，则换其他方法。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张快速试错思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用迭代循环布局，展示从假设到验证、调整的快速迭代过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用环形或线性流程展示迭代循环。

  2. 核心元素细节：
  - 假设节点：绘制假设节点，使用蓝色渐变填充，标注「假设」；
  - 验证节点：绘制验证节点，使用绿色渐变填充，标注「验证」；
  - 反馈节点：绘制反馈节点，使用黄色渐变填充，标注「反馈」；
  - 调整节点：绘制调整节点，使用红色渐变填充，标注「调整」；
  - 放大节点：绘制放大节点，使用紫色渐变填充，标注「放大有效动作」；
  - 放弃节点：绘制放弃节点，使用灰色渐变填充，标注「放弃无效路径」；
  - 迭代箭头：使用带箭头的曲线连接不同节点，形成闭环，标注「快速迭代」；
  - 成本时间标注：在每个节点旁标注「最小成本」「最快速度」；
  - 文字标注（位置精准，样式工整）：
    1. 假设节点标注「假设：职场PPT技巧内容在小红书有流量」；
    2. 验证节点标注「验证：7天时间，每天发1条PPT技巧笔记」；
    3. 反馈节点标注「反馈：流量不错，用户喜欢」；
    4. 放大节点标注「放大：加大投入，持续输出PPT技巧内容」；
    5. 图表顶部中央标注标题：「快速试错思维」，下方标注副标题：「最小成本、最快速度，从试错中找到可行路径」；
  - 图例说明：清晰标注不同节点的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：迭代循环流畅、节点设计简洁、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 想养成健身习惯，阻力是"下班累不想去健身房"，选择阻力最小的路径："睡前10分钟拉伸+5分钟平板支撑"，贴合睡前习惯，容易坚持，后期再逐步升级为完整训练。2. 推进项目时，阻力是"跨部门沟通效率低"，找到最小阻力路径："提前整理需求文档+预约15分钟短会"，避免反复沟通，提升协作效率。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张最小阻力路径思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用路径对比布局，展示不同阻力路径的对比，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用上下或左右对比的方式展示高阻力路径和低阻力路径。

  2. 核心元素细节：
  - 起点和终点：左侧绘制起点节点，右侧绘制终点节点，分别标注「起点：目标开始」和「终点：目标达成」；
  - 高阻力路径：一条曲折的曲线，使用红色渐变填充，标注「高阻力路径」，路径上有多个障碍物图标，如「拖延」「复杂流程」「外部干扰」；
  - 低阻力路径：一条平滑的曲线，使用绿色渐变填充，标注「低阻力路径」，路径上有辅助元素图标，如「简化流程」「贴合习惯」「降低门槛」；
  - 阻力对比：在两条路径下方绘制阻力对比的条形图，使用不同颜色区分；
  - 执行持续性：在图表底部绘制执行持续性的对比，标注「高阻力路径：执行困难，容易放弃」「低阻力路径：执行顺畅，持续行动」；
  - 文字标注（位置精准，样式工整）：
    1. 高阻力路径标注「高阻力路径：复杂流程，外部干扰多，执行门槛高」；
    2. 低阻力路径标注「低阻力路径：简化流程，贴合现有习惯，执行门槛低」；
    3. 阻力对比标注「阻力对比：低阻力路径 < 高阻力路径」；
    4. 执行持续性标注「执行持续性：低阻力路径 > 高阻力路径」；
    5. 图表顶部中央标注标题：「最小阻力路径思维」，下方标注副标题：「找到阻力最小的行动路径，提升行动持续性」；
  - 图例说明：清晰标注高阻力路径、低阻力路径和对比数据的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：路径对比明显、障碍物和辅助元素设计简洁、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 学习Python编程，制作"知识点掌握进度条"，每学会一个知识点就填充一段进度条，挂在书桌前，看着进度条逐渐填满，学习动力持续增强。2. 做副业接单，用Excel制作"月度订单增长柱状图"，每周更新数据，直观看到订单增长趋势，及时调整运营策略，同时也能获得成就感。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张结果可视化强化思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用可视化反馈布局，展示阶段性结果的可视化过程和正向反馈，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用左右或上下布局展示可视化过程和反馈效果。

  2. 核心元素细节：
  - 执行过程：左侧绘制执行过程的流程图，使用蓝色渐变填充，标注「执行过程：学习/行动」；
  - 结果收集：中间绘制结果收集的图标，使用绿色渐变填充，标注「结果收集：数据/成就」；
  - 可视化呈现：右侧绘制多种可视化图表，如「进度条」「柱状图」「折线图」，使用紫色渐变填充，标注「可视化呈现：直观展示」；
  - 正向反馈：在可视化图表下方绘制正向反馈的图标，如「成就感」「动力增强」「持续行动」，使用黄色渐变填充，标注「正向反馈：激发动力」；
  - 示例可视化：绘制具体的可视化示例，如「知识点掌握进度条」「月度订单增长柱状图」；
  - 文字标注（位置精准，样式工整）：
    1. 执行过程标注「执行过程：学习Python知识点」；
    2. 结果收集标注「结果收集：掌握10个知识点」；
    3. 可视化呈现标注「可视化呈现：知识点掌握进度条（已填充60%）」；
    4. 正向反馈标注「正向反馈：看到进度条填充，学习动力持续增强」；
    5. 图表顶部中央标注标题：「结果可视化强化思维」，下方标注副标题：「让进步看得见，激发持续行动的动力」；
  - 图例说明：清晰标注执行过程、结果收集、可视化呈现和正向反馈的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：可视化图表设计简洁、反馈效果明显、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 分析Excel教程的竞争格局，发现多数教程聚焦"功能讲解"，缺少"新人避坑"内容，立刻卡位"职场新人Excel避坑指南"的生态位，持续输出避坑技巧和实战案例，成为该细分领域的小权威。2. 分析公司的职场生态，发现"项目数据可视化汇报"的岗位需求被忽视，立刻深耕该领域，打造"数据可视化+职场汇报"的复合能力，成为公司该领域的核心人才。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张生态位卡位思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用生态系统布局，展示不同生态位的竞争格局和卡位策略，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用六边形或网格布局展示生态系统中的各个生态位。

  2. 核心元素细节：
  - 生态系统：绘制一个大型的生态系统背景，使用浅蓝色渐变填充，标注「价值生态」；
  - 生态位节点：在生态系统内绘制多个不同的生态位节点：
    1. 竞争激烈生态位：使用红色渐变填充，标注「竞争激烈生态位」，节点内有多个竞争个体；
    2. 饱和生态位：使用黄色渐变填充，标注「饱和生态位」，节点内有多个相似个体；
    3. 空白生态位：使用绿色渐变填充，标注「空白生态位」，节点内有少量或无个体；
    4. 卡位生态位：使用紫色渐变填充，标注「卡位生态位：职场新人Excel避坑指南」，节点内有突出的核心个体；
  - 卡位动作：在卡位生态位旁绘制卡位动作的图标，如「差异化定位」「持续输出」「建立壁垒」；
  - 竞争格局：在图表底部绘制竞争格局的对比，标注「竞争激烈生态位：利润低，难以突围」「卡位生态位：利润高，不可替代」；
  - 文字标注（位置精准，样式工整）：
    1. 生态系统标注「价值生态：Excel教程市场」；
    2. 空白生态位标注「空白生态位：新人避坑内容」；
    3. 卡位生态位标注「卡位生态位：职场新人Excel避坑指南，差异化价值输出」；
    4. 卡位动作标注「卡位动作：聚焦细分领域，持续输出避坑技巧」；
    5. 图表顶部中央标注标题：「生态位卡位思维」，下方标注副标题：「找到独一无二的生态位，建立长期竞争壁垒」；
  - 图例说明：清晰标注不同生态位的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：生态位布局清晰、卡位效果明显、竞争格局直观、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 联合文案写手、设计师、运营，构建"职场干货内容联盟"，文案写手负责内容创作，设计师负责视觉呈现，运营负责平台推广，联盟产出的内容质量和流量远超个人单打独斗，收益按贡献分配。2. 联合公司市场部、技术部、销售部，构建"新产品推广协作网络"，市场部负责调研，技术部负责开发，销售部负责渠道，网络协同推进新产品上市，效率和效果大幅提升。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张价值共生网络思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用网络协同布局，展示价值共生网络的构建和价值放大效应，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用节点和连接线条的网络布局展示价值共生网络。

  2. 核心元素细节：
  - 核心节点：中央绘制核心节点，使用蓝色渐变填充，标注「核心节点：职场技能分享博主」；
  - 互补节点：围绕核心节点绘制多个互补节点：
    1. 节点1：使用绿色渐变填充，标注「节点1：文案写手」；
    2. 节点2：使用黄色渐变填充，标注「节点2：设计师」；
    3. 节点3：使用紫色渐变填充，标注「节点3：运营」；
    4. 节点4：使用橙色渐变填充，标注「节点4：职场教练」；
  - 价值连接：使用双向箭头连接不同节点，标注「价值流动」，箭头颜色代表价值流动的方向；
  - 价值放大区域：在网络外围绘制价值放大区域，使用红色渐变填充，标注「价值放大：1+1>2的协同效应」；
  - 互动活动：在网络下方绘制节点间的互动活动，如「联合创作」「资源共享」「合作举办活动」；
  - 文字标注（位置精准，样式工整）：
    1. 核心节点标注「核心节点：职场技能分享博主，提供技能分享内容」；
    2. 互补节点标注「互补节点：文案写手、设计师、运营、职场教练，提供互补服务」；
    3. 价值连接标注「价值连接：互相引流，资源共享，价值流动」；
    4. 价值放大区域标注「价值放大：构建职场干货内容联盟，实现价值放大效应」；
    5. 图表顶部中央标注标题：「价值共生网络思维」，下方标注副标题：「构建互利共赢的价值共生网络，实现1+1>2的协同效应」；
  - 图例说明：清晰标注核心节点、互补节点、价值连接和价值放大区域的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：网络布局清晰、连接线条流畅、节点设计简洁、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 做职场干货内容，加入领英职场创作者生态，参与平台的"职场干货周更计划"，凭借优质内容获得平台流量扶持，账号曝光量提升10倍以上。2. 职场中主动加入公司的核心项目生态，为项目提供数据分析支持，借助项目资源对接高层人脉，同时提升自身的项目经验和影响力。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张生态赋能思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用生态融入布局，展示融入生态获得赋能的过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用层级或嵌套布局展示生态与个体的关系。

  2. 核心元素细节：
  - 生态系统：底部绘制大型生态系统，使用蓝色渐变填充，标注「优质生态：领英职场创作者生态」；
  - 生态资源：在生态系统上绘制生态资源图标，如「流量」「规则」「资源」「扶持政策」；
  - 个体元素：在生态资源上绘制个体元素，使用绿色渐变填充，标注「个体：职场干货创作者」；
  - 赋能箭头：使用带箭头的曲线从生态资源指向个体，标注「生态赋能」；
  - 贡献箭头：使用带箭头的曲线从个体指向生态资源，标注「个体贡献」；
  - 成长效果：在个体元素上方绘制成长效果，使用黄色渐变填充，标注「成长效果：曝光量提升10倍」；
  - 文字标注（位置精准，样式工整）：
    1. 生态系统标注「优质生态：领英职场创作者生态，提供流量和扶持政策」；
    2. 生态资源标注「生态资源：平台流量、扶持计划、创作规则」；
    3. 个体元素标注「个体：职场干货创作者，提供优质内容」；
    4. 赋能箭头标注「生态赋能：平台流量扶持、推荐曝光」；
    5. 图表顶部中央标注标题：「生态赋能思维」，下方标注副标题：「借势生态资源，实现双向成长」；
  - 图例说明：清晰标注生态系统、生态资源、个体元素和成长效果的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：生态系统设计简洁、赋能关系清晰、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 和文案、设计伙伴建立副业共生联盟，分工负责内容创作、视觉设计、平台运营，利益按贡献分成，共同打造"职场高效技能系列课程"，凭借组合优势抵御单打独斗的竞争。2. 职场中，和核心同事建立共生团队，共同负责公司的重点项目，分工协作、共享成果，形成的项目经验和人脉资源成为团队的共生壁垒，提升团队在公司的话语权。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张共生壁垒思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用壁垒防护布局，展示共生壁垒的构建和防御效果，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 使用中心环绕或防护墙布局展示共生壁垒。

  2. 核心元素细节：
  - 共生团队：中央绘制共生团队，使用蓝色渐变填充，标注「共生团队：职场干货内容联盟」；
  - 核心伙伴：在共生团队内绘制多个核心伙伴：
    1. 伙伴1：使用绿色渐变填充，标注「伙伴1：文案写手」；
    2. 伙伴2：使用黄色渐变填充，标注「伙伴2：设计师」；
    3. 伙伴3：使用紫色渐变填充，标注「伙伴3：运营」；
  - 共生壁垒：在共生团队外围绘制坚固的壁垒，使用红色渐变填充，标注「共生壁垒：深度绑定，互利共赢」；
  - 外部竞争：在壁垒外绘制外部竞争的图标，使用灰色渐变填充，标注「外部竞争：单打独斗的创作者」；
  - 防御效果：在壁垒上绘制防御效果的图标，如「抵御竞争」「保护利益」「巩固地位」；
  - 标志性成果：在团队下方绘制标志性成果，如「职场高效技能系列课程」；
  - 文字标注（位置精准，样式工整）：
    1. 共生团队标注「共生团队：职场干货内容联盟，分工协作，利益共享」；
    2. 核心伙伴标注「核心伙伴：文案写手、设计师、运营，深度绑定，互利共赢」；
    3. 共生壁垒标注「共生壁垒：标志性成果+深度绑定机制，抵御外部竞争」；
    4. 外部竞争标注「外部竞争：单打独斗的创作者，难以突破壁垒」；
    5. 图表顶部中央标注标题：「共生壁垒思维」，下方标注副标题：「深度绑定核心伙伴，形成抵御外部竞争的共生壁垒」；
  - 图例说明：清晰标注共生团队、核心伙伴、共生壁垒和外部竞争的含义和颜色对应关系，放置在图表右下角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：共生壁垒设计坚固、团队关系清晰、文字居中/对齐工整，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张死亡谷效应图表，具体细节要求如下：

  1. 整体布局：
  - 采用二维坐标布局，X轴水平向右（投入度由低到高）、Y轴垂直向上（产出率由低到高），整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 背景采用平滑渐变填充，增强视觉层次感，无明显分区。

  2. 核心元素细节：
  - 曲线：绘制一条先快速上升，然后下降至最低点，最后急剧上升的平滑曲线，代表产出率随投入度的变化趋势，曲线线条粗细适中、样式清晰可辨；
  - 区域填充：使用蓝红渐变填充曲线下方区域，增强视觉表现力；
  - 文字标注（位置精准，样式工整）：
    1. 曲线关键节点标注红色文字：从左到右依次为「初始阶段」「死亡谷底部」「突破阶段」「指数增长期」；
    2. X轴下方标注：「投入度 (%)」，Y轴左侧标注：「产出率 (%)」；
    3. 曲线下方标注阶段名称：「快速进步期」「瓶颈期」「指数增长期」；
    4. 图表顶部中央标注标题：「死亡谷效应」，下方标注副标题：「投入初期快速进步，随后进入瓶颈期，突破后呈指数级增长」；
  - 数据点：在曲线的关键节点上添加红色圆点标记，增强视觉焦点。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：曲线平滑无锯齿、文字居中/对齐工整、渐变颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张达克效应图表，具体细节要求如下：

  1. 整体布局：
  - 采用二维坐标布局，X轴水平向右、Y轴垂直向上，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 按X轴从左到右（智慧水平由低到高），将图表背景分为4个连续的彩色分区（保持视觉区分度），分区之间无重叠、边界清晰。

  2. 核心元素细节：
  - 曲线：绘制一条先升后降再平缓上升的平滑曲线，贯穿4个背景分区，曲线线条粗细适中、样式清晰可辨；
  - 文字标注（位置精准，样式工整）：
    1. 曲线关键节点标注红色文字：从左到右依次为「愚昧之巅」「绝望之谷」「开悟之坡」「平稳高原」；
    2. X轴下方标注：「智慧水平（知识与经验，低→高）」，Y轴左侧标注：「自信程度（高→低）」；
    3. 4个背景分区内对应标注区域名称：「自信爆棚区」「自信崩溃区」「自信重建区」「自信成熟区」；
    4. 图表最底部对应4个分区横向标注表现标签：「巨婴」「屌丝」「智者」「大师」；
  - 图标：在4个背景分区内分别添加对应场景简笔画图标（自信爆棚区人物图标、自信崩溃区对应图标、自信重建区对应图标、自信成熟区大脑图标，样式简洁明了）。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：曲线平滑无锯齿、文字居中/对齐工整、背景分区颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 制定5年或10年的长期计划；2. 每天坚持做一件对长期有价值的事情；3. 投资自己的技能和知识；4. 保持健康的生活方式，为长期发展奠定基础。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张J型曲线图表，具体细节要求如下：

  1. 整体布局：
  - 采用二维坐标布局，X轴水平向右（时间由短到长）、Y轴垂直向上（回报值由低到高），整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 图表背景采用浅色渐变填充，增强视觉层次感，无明显分区。

  2. 核心元素细节：
  - 曲线：绘制一条先下降至负值区域，然后平缓增长，最后急剧上升的平滑J型曲线，代表回报值随时间的变化趋势，曲线线条粗细适中（3px）、样式清晰可辨，颜色为蓝色；
  - 区域填充：使用蓝白渐变填充曲线下方区域，增强视觉表现力，渐变从蓝色（透明度0.4）过渡到白色（透明度0.05）；
  - 文字标注（位置精准，样式工整）：
    1. 曲线关键节点标注红色文字：从左到右依次为「投入期」「转折点」「爆发期」；
    2. X轴下方标注：「时间」，Y轴左侧标注：「回报值」；
    3. 曲线下方标注阶段名称：「投入期」「增长期」「爆发期」；
    4. 图表顶部中央标注标题：「J型曲线 - 长期投资回报模式」，下方标注副标题：「投入初期收益为负，突破转折点后呈指数级增长」；
  - 数据点：在曲线的关键节点上添加红色圆点标记（半径6px），增强视觉焦点，圆点边框为白色（边框宽度2px）；
  - 参考线：添加垂直参考线标注转折点位置，使用虚线样式；
  - 图例说明：清晰标注曲线代表的含义，放置在图表右上角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：曲线平滑无锯齿、文字居中/对齐工整、渐变颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 定期尝试新事物，走出舒适区；2. 学习一项新技能，挑战自己的极限；3. 建立应急基金，应对突发情况；4. 记录失败经验，分析原因并改进。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张反脆弱图表，具体细节要求如下：

  1. 整体布局：
  - 采用二维坐标布局，X轴水平向右（压力水平由低到高）、Y轴垂直向上（韧性值由低到高），整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 图表背景采用浅色渐变填充，增强视觉层次感，无明显分区。

  2. 核心元素细节：
  - 曲线：绘制三条平滑曲线，分别代表不同系统在压力下的表现：
    1. 脆弱系统（红色曲线）：随压力增加，韧性值快速下降；
    2. 稳健系统（蓝色曲线）：随压力增加，韧性值保持相对稳定；
    3. 反脆弱系统（绿色曲线）：随压力增加，韧性值先稳定后快速上升；
    曲线线条粗细适中（3px），使用不同线条样式区分：脆弱系统用虚线，稳健系统用实线，反脆弱系统用点划线；
  - 区域填充：使用对应颜色的渐变填充每条曲线下方区域，增强视觉表现力，渐变透明度从0.4过渡到0.05；
  - 文字标注（位置精准，样式工整）：
    1. 曲线关键节点标注文字：在各曲线转折点添加对应颜色的文字标注；
    2. X轴下方标注：「压力水平」，Y轴左侧标注：「韧性值」；
    3. 曲线下方标注区域名称：「低压力区」「中等压力区」「高压力区」；
    4. 图表顶部中央标注标题：「反脆弱 - 压力与韧性关系」，下方标注副标题：「脆弱系统随压力崩溃，强韧系统保持稳定，反脆弱系统从压力中获益」；
  - 数据点：在各曲线的关键节点上添加对应颜色的圆点标记（半径5px），增强视觉焦点；
  - 参考线：添加垂直参考线标注不同压力区间的分界，使用虚线样式；
  - 图例说明：清晰标注三条曲线分别代表的系统类型，放置在图表右上角，对应使用相同的颜色和线条样式。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：曲线平滑无锯齿、文字居中/对齐工整、渐变颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 定期评估自己的职业发展状况；2. 学习新技能，为转型做准备；3. 关注行业趋势，寻找新的机会；4. 小步试错，逐步推进新的发展方向。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张第二曲线图表，具体细节要求如下：

  1. 整体布局：
  - 采用二维坐标布局，X轴水平向右（时间由短到长）、Y轴垂直向上（增长值由低到高），整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 图表背景采用浅色渐变填充，增强视觉层次感，无明显分区。

  2. 核心元素细节：
  - 曲线：绘制两条平滑曲线，分别代表不同阶段的发展周期：
    1. 第一曲线（蓝色曲线）：随时间先快速上升，达到峰值后逐渐下降；
    2. 第二曲线（绿色曲线）：在第一曲线达到峰值前开始启动，逐渐上升并最终超越第一曲线；
    曲线线条粗细适中（3px），均使用实线样式；
  - 区域填充：使用对应颜色的渐变填充每条曲线下方区域，增强视觉表现力，渐变透明度从0.4过渡到0.05；
  - 文字标注（位置精准，样式工整）：
    1. 曲线关键节点标注文字：在各曲线的启动期、增长期、成熟期、衰退期添加对应颜色的文字标注；
    2. X轴下方标注：「时间」，Y轴左侧标注：「增长值」；
    3. 曲线下方标注阶段名称：「转型期」「超越期」；
    4. 图表顶部中央标注标题：「第二曲线 - 持续增长模型」，下方标注副标题：「展示企业或个人发展的生命周期，通过第二曲线实现持续增长」；
  - 数据点：在各曲线的关键节点（启动点、峰值点、交叉点）上添加对应颜色的圆点标记（半径6px），增强视觉焦点，圆点边框为白色（边框宽度2px）；
  - 参考线：添加垂直虚线标注第一曲线的峰值点和两条曲线的交叉点位置；
  - 图例说明：清晰标注两条曲线分别代表的含义（「第一曲线」和「第二曲线」），放置在图表右上角，对应使用相同的颜色。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：曲线平滑无锯齿、文字居中/对齐工整、渐变颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 选择正向微行动：挑选能长期坚持的小事（如“每天读20页书”“每天写50字复盘”“每天存10元钱”）；2. 保持连续性：哪怕当天状态差，也做“最低版本”的行动；3. 定期复盘：每月统计一次累计成果，直观看到复利效果；4. 持续优化：根据实际情况调整行动内容和强度。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张复利效应图表，具体细节要求如下：

  1. 整体布局：
  - 采用二维坐标布局，X轴水平向右（时间由短到长）、Y轴垂直向上（增长倍数由低到高），整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 图表背景采用浅色渐变填充，增强视觉层次感，无明显分区。

  2. 核心元素细节：
  - 曲线：绘制三条平滑曲线，分别代表不同增长率的复利效果：
    1. 1%增长率（浅蓝色曲线）：随时间缓慢增长；
    2. 3%增长率（中蓝色曲线）：随时间中等速度增长；
    3. 5%增长率（深蓝色曲线）：随时间快速增长，呈现明显的指数级增长趋势；
    曲线线条粗细适中（3px），均使用实线样式；
  - 区域填充：使用对应颜色的渐变填充每条曲线下方区域，增强视觉表现力，渐变透明度从0.4过渡到0.05；
  - 文字标注（位置精准，样式工整）：
    1. 曲线标注文字：在每条曲线旁添加对应颜色的增长率文字标注；
    2. X轴下方标注：「时间」，Y轴左侧标注：「增长倍数」；
    3. 曲线下方标注阶段名称：「短期」「中期」「长期」；
    4. 图表顶部中央标注标题：「复利效应 - 长期增长模型」，下方标注副标题：「微小的正向行动，通过时间的持续积累，最终产生指数级的结果」；
  - 数据点：在各曲线的关键时间节点上添加对应颜色的圆点标记（半径5px），并标注具体的增长倍数；
  - 参考线：添加垂直参考线标注不同时间阶段的分界，使用虚线样式；
  - 图例说明：清晰标注三条曲线分别代表的增长率（「1%增长率」「3%增长率」「5%增长率」），放置在图表右上角，对应使用相同的颜色。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：曲线平滑无锯齿、文字居中/对齐工整、渐变颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 遇到困难时，先分析阻力的来源和大小；2. 将大的阻力分解为小的、可克服的阻力；3. 制定详细的克服计划，逐步实施；4. 每克服一个阻力，记录下来，增强信心。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张阻力与收益图表，具体细节要求如下：

  1. 整体布局：
  - 采用二维坐标布局，X轴水平向右（时间或阶段由早到晚），左侧Y轴垂直向上（阻力强度由低到高），右侧Y轴垂直向上（收益大小由低到高），整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 图表背景采用浅色渐变填充，增强视觉层次感，无明显分区。

  2. 核心元素细节：
  - 曲线：绘制两条平滑曲线，分别代表阻力和收益的变化趋势：
    1. 阻力曲线（红色曲线）：随时间先上升后下降，形成一个峰值；
    2. 收益曲线（绿色曲线）：随时间先缓慢上升，当阻力突破阈值后快速上升；
    曲线线条粗细适中（3px），均使用实线样式；
  - 区域填充：使用对应颜色的渐变填充每条曲线下方区域，增强视觉表现力，渐变透明度从0.4过渡到0.05；
  - 文字标注（位置精准，样式工整）：
    1. 曲线关键节点标注文字：在阻力曲线的峰值点和收益曲线的突破点添加对应颜色的文字标注；
    2. X轴下方标注：「时间/阶段」，左侧Y轴标注：「阻力强度」，右侧Y轴标注：「收益大小」；
    3. 曲线下方标注阶段名称：「积累期」「收获期」；
    4. 图表顶部中央标注标题：「阻力与收益对比曲线」，下方标注副标题：「展示长期投资中阻力与收益的动态关系，前期阻力大于收益，后期收益爆发增长」；
  - 数据点：在阻力曲线的峰值点和收益曲线的突破点上添加对应颜色的圆点标记（半径6px），增强视觉焦点，圆点边框为白色（边框宽度2px）；
  - 参考线：添加垂直参考线标注阻力阈值点，使用虚线样式；
  - 图例说明：清晰标注两条曲线分别代表的含义（「阻力」和「收益」），放置在图表右上角，对应使用相同的颜色。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：曲线平滑无锯齿、文字居中/对齐工整、渐变颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 制定长期目标，并将奖励与长期目标挂钩；2. 避免过度使用手机、游戏等容易产生即时满足的事物；3. 进行有氧运动，促进多巴胺的自然分泌；4. 学习新技能，获得成就感和满足感。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张多巴胺曲线图表，具体细节要求如下：

  1. 整体布局：
  - 采用二维坐标布局，X轴水平向右（时间由短到长）、Y轴垂直向上（多巴胺水平由低到高），整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 图表背景采用浅色渐变填充，增强视觉层次感，无明显分区。

  2. 核心元素细节：
  - 曲线：绘制一条先快速上升至峰值，然后迅速下降，最后缓慢恢复到基线水平的平滑曲线，代表多巴胺水平随时间的变化趋势，曲线线条粗细适中（3px），颜色为橙色；
  - 区域填充：使用橙白渐变填充曲线下方区域，增强视觉表现力，渐变从橙色（透明度0.4）过渡到白色（透明度0.05）；
  - 文字标注（位置精准，样式工整）：
    1. 曲线关键节点标注文字：从左到右依次为「期待阶段」「峰值释放」「快速下降」「恢复基线」；
    2. X轴下方标注：「时间」，Y轴左侧标注：「多巴胺水平」；
    3. 曲线下方标注区域名称：「即时满足区」「延迟满足区」；
    4. 图表顶部中央标注标题：「多巴胺曲线」，下方标注副标题：「展示多巴胺水平随时间的变化，帮助管理情绪和动机」；
  - 数据点：在曲线的关键节点上添加橙色圆点标记（半径6px），增强视觉焦点，圆点边框为白色（边框宽度2px）；
  - 参考线：添加水平虚线标注多巴胺基线水平；
  - 图例说明：清晰标注曲线代表的含义，放置在图表右上角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：曲线平滑无锯齿、文字居中/对齐工整、渐变颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 匹配难度：学习/工作时，选择“跳一跳够得着”的内容；2. 营造专注环境：关闭手机通知、找安静的房间、用番茄钟；3. 及时调整状态：若感到焦虑，降低任务难度；若感到无聊，提升难度；4. 记录心流体验，总结进入心流的条件和方法。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张心流通道图表，具体细节要求如下：

  1. 整体布局：
  - 采用二维坐标布局，X轴水平向右（挑战难度由低到高）、Y轴垂直向上（个人能力由低到高），整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 图表背景分为四个区域：焦虑区（能力低、挑战高）、心流区（能力与挑战匹配）、无聊区（能力高、挑战低）、放松区（能力与挑战都低），区域之间用虚线分隔。

  2. 核心元素细节：
  - 曲线：绘制一条从原点出发，向右上方延伸的45度对角线，代表心流通道的理想状态；
  - 区域填充：使用不同颜色填充四个区域，增强视觉区分度：
    1. 焦虑区：红色渐变（透明度0.3）；
    2. 心流区：绿色渐变（透明度0.3）；
    3. 无聊区：黄色渐变（透明度0.3）；
    4. 放松区：蓝色渐变（透明度0.3）；
  - 文字标注（位置精准，样式工整）：
    1. 四个区域分别标注名称：「焦虑区」「心流区」「无聊区」「放松区」；
    2. X轴下方标注：「挑战难度」，Y轴左侧标注：「个人能力」；
    3. 图表顶部中央标注标题：「心流通道」，下方标注副标题：「当任务挑战难度与个人能力水平高度匹配时，人会进入全神贯注的最优体验状态」；
  - 图标：在四个区域内分别添加对应场景的简笔画图标：焦虑区（皱眉的人）、心流区（专注工作的人）、无聊区（打哈欠的人）、放松区（躺椅上休息的人）；
  - 参考线：添加45度对角线作为心流通道的理想线，使用实线样式；
  - 图例说明：清晰标注四个区域的含义，放置在图表右上角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：曲线平滑无锯齿、文字居中/对齐工整、背景分区颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张风阻定律图表，具体细节要求如下：

  1. 整体布局：
  - 采用二维坐标布局，X轴水平向右（速度由慢到快）、Y轴垂直向上（阻力大小由小到大），整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 图表背景采用浅色渐变填充，增强视觉层次感，无明显分区。

  2. 核心元素细节：
  - 曲线：绘制一条从原点出发，随速度增加而呈指数级增长的平滑曲线，代表阻力大小随速度变化的趋势，曲线线条粗细适中（3px），颜色为红色；
  - 区域填充：使用红白渐变填充曲线下方区域，增强视觉表现力，渐变从红色（透明度0.4）过渡到白色（透明度0.05）；
  - 文字标注（位置精准，样式工整）：
    1. 曲线关键节点标注文字：从左到右依次为「低速区」「中速区」「高速区」；
    2. X轴下方标注：「速度」，Y轴左侧标注：「阻力大小」；
    3. 图表顶部中央标注标题：「风阻定律」，下方标注副标题：「阻力与速度的平方成正比，随着事业发展，阻力会呈指数级增长」；
  - 数据点：在曲线的关键节点上添加红色圆点标记（半径6px），增强视觉焦点，圆点边框为白色（边框宽度2px）；
  - 公式标注：在图表右上角标注风阻定律公式：F = k * v²（F表示阻力，k表示风阻系数，v表示速度）；
  - 图例说明：清晰标注曲线代表的含义，放置在图表右上角。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：曲线平滑无锯齿、文字居中/对齐工整、渐变颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`,
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
      practice: '1. 状态自测：当执行任务感到“毫无压力”时，说明处于舒适区；感到“焦虑失眠、想逃避”时，说明处于恐慌区；2. 目标拆解：将恐慌区的大目标拆分为小任务，降低难度进入学习区；3. 梯度升级：在学习区稳定执行2-3周后，小幅提升任务难度，逐步拓展舒适区边界。',
      visualDesign: `这是舒适区模型的：可视化描述：1. 完全匹配可视化设计要求 

 布局合规：采用三层环形嵌套核心布局，搭配辅助二维坐标轴，整体简洁专业，无冗余装饰，区域划分清晰； 

 区域精准：三个环形区域对应舒适区、学习区、恐慌区，学习区宽度更宽突出核心地位，渐变填充颜色与透明度符合要求，分隔线样式（实线 / 虚线）贴合设计逻辑； 

 元素完整：包含成长曲线、场景图标、关键数据点、参考线等所有核心元素，成长曲线斜率变化直观展示成长规律； 

 文字标注：区域名称、副标题、坐标轴、提示文字等位置精准，样式工整，颜色与区域对应，可读性强； 

 图例清晰：右上角图例标注完整，与区域颜色一一对应，无重叠遮挡。 

 2. 视觉优化与层级清晰 

 配色协调：浅蓝 / 浅绿 / 浅红渐变柔和不刺眼，贴合各区域情感属性，整体风格清新专业； 

 层级分明：文字 > 图标 > 曲线 > 区域填充 > 背景，确保所有内容不被遮挡，视觉层次清晰； 

 细节精致：图标添加轻微阴影增强立体感，曲线平滑无锯齿，文字居中对齐，元素间距合理，视觉整洁舒适。 

 3. 代码规范与高可用性 

 格式整洁：SVG 嵌套在 HTML div 容器中，代码分模块注释清晰，可直接保存为.html文件运行； 

 兼容性强：无 HTML/SVG 语法错误，支持 Chrome、Edge、Firefox 等主流浏览器，无需第三方依赖； 

 易于修改：颜色、尺寸、文字等可按需微调，代码结构清晰，维护成本低。`
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
      practice: '1. 明确愿望：写下具体目标（如“我要在3个月内学会基础PS技能”，而非“我要学设计”）；2. 具象结果：想象目标达成后的场景，强化动机；3. 罗列障碍：梳理主观+客观障碍；4. 制定计划：针对每个障碍设计应对方案。',
      visualDesign: `1. 整体布局：采用四象限卡片式设计，清晰展示WOOP四个步骤；
2. 色彩方案：使用蓝色系渐变作为主色调，代表专业和信任；
3. 图标设计：每个步骤配有独特图标，增强视觉识别度；
4. 文字排版：标题加粗突出，内容简洁明了；
5. 交互元素：添加箭头连接线，展示流程关系；
6. 响应式设计：适配不同屏幕尺寸，保持良好的视觉效果；
7. 深度层次：通过阴影和渐变创造立体感，增强视觉吸引力；
8. 主题适配：支持深色/浅色主题切换，提升用户体验。` 
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
      practice: '1. 峰值设计：在任务执行到50%时设置小奖励；2. 结束优化：任务完成后，做一个有仪式感的收尾动作；3. 规避低谷：把任务中最难、最枯燥的部分放在开头，结尾留简单轻松的内容。',
      visualDesign: `1. 完全匹配可视化设计要求 
 布局合规：采用 "体验流程 + 记忆锚点" 双核心布局，横向时间轴 + 纵向感受轴，三层结构层次分明，直观呈现峰终定律核心逻辑； 
 元素完整：包含体验曲线、峰值 / 终值锚点、高亮背景、参考线、专属图标等所有核心元素，锚点突出、中间环节弱化，贴合 "峰值 + 终值决定记忆" 的原理； 
 配色精准：正向体验（淡绿）、负向体验（淡红）渐变填充，透明度 0.3 符合要求，核心元素使用深蓝色突出，视觉区分度高； 
 文字标注：标题、副标题、锚点说明、坐标轴标注等位置精准，样式工整，颜色与对应元素匹配，可读性强； 
 图例清晰：右上角图例标注完整，与核心元素一一对应，不干扰主视觉流程，便于快速识别。 
 2. 视觉优化与层级清晰 
 配色协调：淡绿 / 淡红 / 深蓝配色柔和不刺眼，贴合愉悦 / 痛苦 / 核心锚点的情感属性，整体风格清新专业； 
 层级分明：文字 > 图标 > 锚点标记 > 体验曲线 > 区域填充 > 背景，确保所有内容不被遮挡，视觉层次清晰； 
 细节精致：图标添加轻微阴影增强立体感，锚点高亮背景提升焦点效果，曲线平滑无锯齿，文字对齐规范，元素间距合理，视觉整洁舒适。 
 3. 代码规范与高可用性 
 格式整洁：SVG 嵌套在 HTML div 容器中，代码分模块注释清晰，可直接保存为.html文件运行； 
 兼容性强：无 HTML/SVG 语法错误，支持 Chrome、Edge、Firefox 等主流浏览器，无需第三方依赖； 
 易于修改：颜色、尺寸、文字、案例等可按需微调，代码结构清晰，维护成本低，可根据实际需求修改体验曲线走势或图标样式。`
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
      practice: '1. 三圈清单：分别列出三个维度的内容——能力圈、热情圈、市场圈；2. 找交集：圈出三个清单的重叠项；3. 补短板：若交集项能力不足，针对性学习；若市场需求弱，调整方向。',
      visualDesign: `可视化设计复盘 
 1. 整体布局：理性的平衡 

 结构：采用了经典的**“左图右文”**布局（在移动端会自动折叠为上图下文）。左侧是感性的图形呈现，右侧是理性的文字拆解。 

 氛围：背景使用了清淡的冷灰色（#f0f2f5），容器则是纯净的白色卡片，这不仅是为了专业感，更是为了让你的注意力能完全聚焦在核心的三圈逻辑上，不受干扰。 

 2. 核心图形（SVG）：交融的艺术 这是整个设计的灵魂所在，我运用了**韦恩图（Venn Diagram）**的变体： 

 色彩心理学： 

 🔥 热情圈（左上）：使用了暖橙色渐变。橙色代表活力、创造力和内心的火焰。 

 ⚙️ 能力圈（右上）：使用了深蓝色渐变。蓝色代表沉稳、专业和理性的技能积累。 

 💰 市场圈（下方）：使用了翠绿色渐变。绿色代表生机、金钱和价值交换。 

 混合模式（Mix Blend Mode）： 

 代码中特意使用了 mix-blend-mode: multiply。这让三个圆圈叠加时，不仅仅是覆盖，而是颜色相融。比如橙色和蓝色交叠会呈现出深沉的褐色，象征着理想与现实碰撞时的复杂性。 

 甜蜜点（Sweet Spot）： 

 最中心的三圈交集处，我没有使用普通的颜色填充，而是添加了一层金色的光晕（Glow Filter）和火箭图标（🚀）。 

 寓意：这是“最优解”，是起飞的地方，它必须在视觉上也是最耀眼、最突出的。 

 3. 信息层级：从视觉到行动 右侧的侧边栏不仅仅是图例，更是一个行动指南： 

 色彩呼应：右侧的三个解释卡片（Info Card），边框颜色与左侧圆圈一一对应，让你在阅读文字时能瞬间联想到对应的圈层。 

 行动清单（Action List）：底部的黄色区域是**“落地环节”**。它不仅仅告诉你“这是什么”，还通过 1-2-3-4 的步骤告诉你“该怎么做”。 

 4. 细节微交互 

 漂浮动画：圆圈中心的图标（🔥、⚙️、💰）添加了轻微的上下漂浮动画（float），让静态的图表显得有生命力，就像这些特质在你体内是鲜活的一样。`
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
      practice: '1. 求反馈：每周找1-2个信任的朋友/同事，问一个具体问题，定位盲目区；2. 自我暴露：在安全的环境中分享自己的小缺点/小恐惧，缩小隐藏区；3. 探未知：每月尝试一件从未做过的事，记录自己的感受和表现，发掘未知潜能。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张乔哈里视窗图表，具体细节要求如下：

  1. 整体布局：
  - 采用2x2矩阵布局，将图表分为四个等大的象限，整体为正方形可视化区域，风格简洁直观，无冗余装饰；
  - 每个象限之间有明显的边界线，标题和说明文字清晰可见。

  2. 核心元素细节：
  - 象限划分：
    1. 左上象限（公开区）：自己知道，他人也知道，使用蓝色填充；
    2. 右上象限（盲区）：自己不知道，他人知道，使用黄色填充；
    3. 左下象限（隐藏区）：自己知道，他人不知道，使用绿色填充；
    4. 右下象限（未知区）：自己不知道，他人也不知道，使用红色填充；
  - 文字标注（位置精准，样式工整）：
    1. 每个象限内标注区域名称和描述；
    2. 图表顶部标注：「乔哈里视窗 - 自我认知与他人认知的关系」；
    3. 左侧标注：「自己认知」，右侧标注：「他人认知」；
    4. 顶部标注：「已知」，底部标注：「未知」；
  - 图标：在每个象限内添加简单的代表性图标，增强视觉表现力；
  - 箭头：添加指向公开区的箭头，展示个人成长的方向。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：象限边界清晰、文字居中/对齐工整、颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 拆分技能：将目标技能拆分为最小单元；2. 针对性练习：聚焦当前最弱的子技能；3. 获得有效反馈：找领域内的高手指导，或对比优秀案例找差距；4. 根据反馈调整练习方法，而非重复错误。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张刻意练习图表，具体细节要求如下：

  1. 整体布局：
  - 采用流程图布局，展示刻意练习的核心流程和关键要素，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 流程从左到右依次展开，核心要素用卡片式设计展示，连接线条清晰可见。

  2. 核心元素细节：
  - 流程节点：
    1. 目标设定：明确练习目标，使用蓝色填充；
    2. 走出舒适区：突破现有能力边界，使用黄色填充；
    3. 针对性练习：聚焦弱点，使用绿色填充；
    4. 获得反馈：获取外界或自我反馈，使用红色填充；
    5. 调整优化：根据反馈调整练习方法，使用紫色填充；
    6. 技能精通：实现技能的熟练掌握，使用橙色填充；
  - 连接线条：使用带箭头的线条连接各流程节点，线条粗细适中，颜色统一；
  - 文字标注（位置精准，样式工整）：
    1. 每个流程节点内标注节点名称和核心要点；
    2. 图表顶部标注：「刻意练习 - 高效成长的核心方法」；
    3. 图表底部添加简要说明文字；
  - 图标：在每个流程节点内添加简单的代表性图标，增强视觉表现力；
  - 对比区域：添加一个小区域对比「机械重复练习」和「刻意练习」的区别。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：流程节点清晰、文字居中/对齐工整、颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 提升动机：把任务和个人目标关联；2. 降低能力门槛：简化行为步骤，减少阻力；3. 设置触发信号：用手机闹钟提醒、贴便签、和日常动作绑定；4. 及时反馈：行为发生后，给予正向反馈，强化行为。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张福格行为模型图表，具体细节要求如下：

  1. 整体布局：
  - 采用三角形布局，展示行为发生的三个核心要素及其关系，整体为三角形可视化区域，风格简洁直观，无冗余装饰；
  - 三个要素分别位于三角形的三个顶点，中间区域展示行为发生的条件。

  2. 核心元素细节：
  - 三角形结构：
    1. 顶部顶点：动机（Motivation），使用红色填充；
    2. 左下顶点：能力（Ability），使用蓝色填充；
    3. 右下顶点：触发（Trigger），使用绿色填充；
  - 文字标注（位置精准，样式工整）：
    1. 每个顶点标注要素名称和描述；
    2. 三角形内部标注：「行为发生」；
    3. 图表顶部标注：「福格行为模型 - 行为发生的三要素」；
    4. 图表底部添加简要说明文字；
  - 连接线：使用实线连接三个顶点，形成三角形结构；
  - 图标：在每个顶点内添加简单的代表性图标，增强视觉表现力；
  - 示例区域：添加一个小区域展示行为发生的具体示例，如「早起锻炼」。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：三角形边接平滑、文字居中/对齐工整、颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 每日列清单：早上花5分钟，把当天所有任务填入四象限表格，明确分类；2. 分配时间比例：70%时间做“重要不紧急”的事，20%时间处理“重要且紧急”的事，10%时间处理其他两类事；3. 学会授权和拒绝：把“紧急不重要”的事交给他人，拒绝“不重要不紧急”的事；4. 定期复盘：每周回顾时间分配情况，调整策略。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张艾森豪威尔矩阵图表，具体细节要求如下：

  1. 整体布局：
  - 采用2x2矩阵布局，展示时间管理的四象限法则，整体为正方形可视化区域，风格简洁直观，无冗余装饰；
  - 横轴表示紧急性（从左到右：紧急→不紧急），纵轴表示重要性（从上到下：重要→不重要）。

  2. 核心元素细节：
  - 象限划分：
    1. 左上象限（重要且紧急）：需立即做，使用红色填充；
    2. 右上象限（重要不紧急）：需计划做，使用蓝色填充；
    3. 左下象限（紧急不重要）：可授权做，使用黄色填充；
    4. 右下象限（不重要不紧急）：需少做或不做，使用绿色填充；
  - 文字标注（位置精准，样式工整）：
    1. 每个象限内标注区域名称、描述和关键词；
    2. 图表顶部标注：「艾森豪威尔矩阵 - 时间管理的四象限法则」；
    3. 横轴标注：「紧急性：紧急 → 不紧急」；
    4. 纵轴标注：「重要性：重要 → 不重要」；
  - 图标：在每个象限内添加简单的代表性图标，增强视觉表现力；
  - 时间分配建议：在每个象限内标注建议的时间分配比例。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：象限边界清晰、文字居中/对齐工整、颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 语言替换训练：把固定型语言换成成长型语言——“我不行”→“我还没学会”；“这太难了”→“这是挑战，我可以试试”；“我失败了”→“我从这次经历中学到了…”；2. 拥抱挫折：遇到失败时，不否定自己，而是分析“哪里做得不好”“下次如何改进”；3. 奖励努力过程：奖励自己的“坚持和付出”，而非“天赋和成功”。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张成长型思维图表，具体细节要求如下：

  1. 整体布局：
  - 采用左右对比布局，展示成长型思维与固定型思维的区别，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 左侧展示固定型思维，右侧展示成长型思维，中间用对比线分隔。

  2. 核心元素细节：
  - 对比结构：
    1. 左侧：固定型思维（Fixed Mindset），使用红色填充；
    2. 右侧：成长型思维（Growth Mindset），使用蓝色填充；
  - 文字标注（位置精准，样式工整）：
    1. 每个区域内分点列出两种思维模式的核心特征，如面对挑战、面对失败、面对努力等；
    2. 图表顶部标注：「成长型思维 vs 固定型思维」；
    3. 图表底部添加简要说明文字；
  - 图标：在每个区域内添加简单的代表性图标，增强视觉表现力；
  - 结果对比：在图表底部添加两种思维模式导致的不同结果对比。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：对比区域清晰、文字居中/对齐工整、颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 止损三问法：当纠结是否放弃时，问自己三个问题——① 继续做这件事，能实现我的目标吗？② 放弃这件事，我会失去什么？③ 把时间/精力投入其他事，收益会更高吗？；2. 及时止损：若答案是否定的，立刻放弃；3. 不纠结过去：不要因“已经投入”而继续内耗，把目光放在未来的选择上。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张沉没成本谬误图表，具体细节要求如下：

  1. 整体布局：
  - 采用流程图布局，展示沉没成本谬误的形成过程和理性决策的路径，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 流程从左到右依次展开，展示从投入成本到决策的全过程。

  2. 核心元素细节：
  - 流程节点：
    1. 投入成本：展示时间、金钱、精力等沉没成本，使用红色填充；
    2. 沉没成本谬误：展示因沉没成本导致的非理性决策，使用黄色填充；
    3. 理性决策：展示忽略沉没成本，只看未来价值的决策路径，使用蓝色填充；
    4. 结果对比：展示两种决策导致的不同结果，左侧为负面结果，右侧为正面结果；
  - 连接线条：使用带箭头的线条连接各流程节点，线条粗细适中，颜色统一；
  - 文字标注（位置精准，样式工整）：
    1. 每个流程节点内标注节点名称和核心要点；
    2. 图表顶部标注：「沉没成本谬误 - 理性决策的陷阱」；
    3. 图表底部添加简要说明文字；
  - 图标：在每个流程节点内添加简单的代表性图标，增强视觉表现力；
  - 案例展示：添加一个小区域展示沉没成本谬误的具体案例。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：流程节点清晰、文字居中/对齐工整、颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 复盘找关键：回顾过去1-2周的任务，列出所有行动，分析哪些行动带来了最大的结果；2. 聚焦关键动作：把80%的时间花在20%关键动作上；3. 删减无效动作：砍掉对结果影响小的动作；4. 定期重新评估关键动作，确保其仍然有效。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张二八定律图表，具体细节要求如下：

  1. 整体布局：
  - 采用组合图表布局，左侧为柱状图，右侧为折线图，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 左侧柱状图展示关键行动与结果的关系，右侧折线图展示累计贡献率。

  2. 核心元素细节：
  - 图表结构：
    1. 左侧：柱状图（Bar Chart），展示各行动项及其产生的结果，使用蓝色填充，其中20%的关键行动使用红色高亮；
    2. 右侧：折线图（Line Chart），展示累计贡献率，使用红色线条，在80%贡献率处添加参考线；
  - 文字标注（位置精准，样式工整）：
    1. 图表顶部标注：「二八定律 - 关键少数与次要多数的关系」；
    2. X轴标注：「行动项」，Y轴左侧标注：「结果贡献」，Y轴右侧标注：「累计贡献率」；
    3. 在20%关键行动和80%结果处添加标注；
  - 参考线：在20%关键行动和80%结果处添加垂直和水平参考线；
  - 图标：在图表左上角添加简单的代表性图标，增强视觉表现力；
  - 说明文字：在图表底部添加简要说明文字，解释二八定律的核心含义。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：图表线条清晰、文字居中/对齐工整、颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 列四象限清单：针对目标分别列出优势、劣势、机会、威胁；2. 找核心策略：优势+机会→核心发力点，劣势+威胁→风险规避重点；3. 落地执行：把策略拆解为具体任务，并设置风险预警。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张SWOT分析图表，具体细节要求如下：

  1. 整体布局：
  - 采用2x2矩阵布局，展示SWOT分析的四个维度，整体为正方形可视化区域，风格简洁直观，无冗余装饰；
  - 横轴表示内部/外部因素，纵轴表示优势/劣势或机会/威胁。

  2. 核心元素细节：
  - 象限划分：
    1. 左上象限（优势Strengths）：自身擅长的资源和能力，使用蓝色填充；
    2. 右上象限（机会Opportunities）：外部有利的条件和趋势，使用绿色填充；
    3. 左下象限（劣势Weaknesses）：自身的短板和不足，使用黄色填充；
    4. 右下象限（威胁Threats）：外部的风险和挑战，使用红色填充；
  - 文字标注（位置精准，样式工整）：
    1. 每个象限内标注维度名称和核心要点；
    2. 图表顶部标注：「SWOT分析 - 全面评估目标可行性」；
    3. 横轴标注：「内部因素 → 外部因素」；
    4. 纵轴标注：「优势/机会 → 劣势/威胁」；
  - 图标：在每个象限内添加简单的代表性图标，增强视觉表现力；
  - 策略建议：在每个象限内添加相应的策略建议，如优势+机会=增长策略，劣势+机会=扭转型策略等。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：象限边界清晰、文字居中/对齐工整、颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 明确Why：针对目标追问深层动机；2. 梳理How：基于Why设计具体路径；3. 落地What：把How拆成具体动作；4. 系统绑定：在系统中把Why置顶，每次完成What后关联Why复盘。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张黄金圈法则图表，具体细节要求如下：

  1. 整体布局：
  - 采用同心圆布局，展示从内到外的思考顺序，整体为圆形可视化区域，风格简洁直观，无冗余装饰；
  - 三个同心圆分别代表Why、How、What，从内到外依次展开。

  2. 核心元素细节：
  - 同心圆结构：
    1. 内层圆：Why（为什么做，动机/初心/价值观），使用红色填充，直径最小；
    2. 中层圆：How（怎么做，方法/路径/策略），使用蓝色填充，直径中等；
    3. 外层圆：What（做什么，具体事项/行动步骤），使用绿色填充，直径最大；
  - 文字标注（位置精准，样式工整）：
    1. 每个圆内标注层级名称和核心要点；
    2. 图表顶部标注：「黄金圈法则 - 从内到外的思考顺序」；
    3. 图表底部添加简要说明文字；
  - 连接线：从内到外添加带箭头的连接线，展示思考的顺序；
  - 图标：在每个圆内添加简单的代表性图标，增强视觉表现力；
  - 示例展示：在图表右侧添加一个小区域展示黄金圈法则的具体应用示例。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：同心圆边界清晰、文字居中/对齐工整、颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 提出问题：针对具体问题（如“本周跑步习惯中断了”）；2. 连续追问：层层剥离表面现象；3. 找到根本原因：定位问题核心；4. 制定解决方案：针对根本原因实施改进。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张5Why分析法图表，具体细节要求如下：

  1. 整体布局：
  - 采用流程图布局，展示连续追问5个为什么的过程，整体为矩形可视化区域，风格简洁直观，无冗余装饰；
  - 流程从下到上或从左到右依次展开，展示从问题到根本原因的追问过程。

  2. 核心元素细节：
  - 流程节点：
    1. 底部/左侧：问题（Problem），使用红色填充；
    2. 中间：连续5个Why的追问节点，使用蓝色填充，每个节点包含一个为什么的问题和答案；
    3. 顶部/右侧：根本原因（Root Cause），使用绿色填充；
    4. 解决方案：在根本原因节点下方添加解决方案，使用黄色填充；
  - 连接线条：使用带箭头的线条连接各流程节点，线条粗细适中，颜色统一；
  - 文字标注（位置精准，样式工整）：
    1. 每个流程节点内标注节点名称和核心内容；
    2. 图表顶部标注：「5Why分析法 - 找到问题根本原因」；
    3. 在每个Why节点前添加“为什么”的标注；
  - 图标：在每个流程节点内添加简单的代表性图标，增强视觉表现力；
  - 示例展示：使用一个具体的案例，如“为什么跑步习惯中断了”，展示完整的5Why分析过程。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：流程节点清晰、文字居中/对齐工整、颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      practice: '1. 学习“复利效应”后，关联“习惯养成”“投资理财”，构建“复利思维应用框架”；2. 用卡片盒记录，每张卡片标注关联的其他卡片，形成知识网络。',
      visualDesign: `请使用SVG标签结合HTML（如需容器可搭配div）编写代码，精准绘制这张知识晶体化模型图表，具体细节要求如下：

  1. 整体布局：
  - 采用中心辐射布局，展示从零散知识到知识晶体的转变过程，整体为圆形可视化区域，风格简洁直观，无冗余装饰；
  - 中心为知识晶体核心，周围辐射出多个知识分支，展示知识的关联和结构化过程。

  2. 核心元素细节：
  - 晶体结构：
    1. 中心：知识晶体核心，使用钻石形状，金色填充，代表结构化的核心知识；
    2. 周围：零散知识点，使用小圆形，灰色填充，代表未结构化的零散知识；
    3. 连接线：从零散知识点到知识晶体核心的连接线，使用蓝色线条，代表知识的关联和整合；
    4. 知识分支：从知识晶体核心辐射出的多个知识分支，使用不同颜色的线条，代表不同的知识领域或模块；
  - 文字标注（位置精准，样式工整）：
    1. 中心标注：「知识晶体核心」；
    2. 零散知识点标注：具体的知识点名称；
    3. 知识分支标注：知识领域或模块名称；
    4. 图表顶部标注：「知识晶体化模型 - 将零散知识结构化、关联化、可视化」；
    5. 图表底部添加简要说明文字；
  - 图标：在知识分支上添加简单的代表性图标，增强视觉表现力；
  - 转变过程：在图表左侧添加零散知识到知识晶体的转变过程示意图。

  3. 代码要求：
  - 格式：以SVG为核心绘制载体，嵌套在HTML标签内，提供完整可直接复制运行的代码；
  - 样式：支持内联样式或单独style标签，保证配色、元素大小、布局合理，元素层级清晰（文字不被曲线/图标遮挡）；
  - 质量：无HTML/SVG语法错误，在主流浏览器中可直接正常渲染，无需额外依赖第三方插件、图片或资源；
  - 细节：晶体结构清晰、文字居中/对齐工整、颜色均匀，所有标注文字的字体大小、颜色与整体设计匹配。`
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
      {/* 1. 图表切换模块 - 完全参照商品分类与管理模块实现 */}
      <div className={`${cardBg} rounded-2xl p-6 transition-all duration-300 border border-slate-300 dark:border-zinc-800 relative shadow-lg hover:shadow-xl`}>
        {/* 左上角小图标和文字 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 size={14} className="text-yellow-500" />
            <h3 className={`text-xs font-bold uppercase ${textSub}`}>图表切换模块</h3>
          </div>
          {/* 右侧帮助指南小卡片 */}
          <button onClick={() => setActiveHelp('chart')} className="text-zinc-500 hover:text-white transition-colors">
            <HelpCircle size={16} />
          </button>
        </div>
        
        {/* 悬浮内框容器 - 第一层悬浮 */}
        <div className={`${cardBg} rounded-xl shadow-sm transition-all duration-300 transform hover:translate-y-[-2px]`}>
          {/* 滚动容器 - 第二层悬浮 */}
          <div className="max-h-32 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent p-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              {/* 移除分类，将所有图表按钮堆在一起 */}
              <SortableContext
                items={Object.values(chartCategories).flat() as string[]}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-wrap gap-3">
                  {/* 遍历所有图表分类的图表ID */}
                  {Object.values(chartCategories).flat().map((chartId) => {
                    const chart = getChartById(chartId as string);
                    if (!chart) return null;
                    return (
                      <SortableButton
                        key={chartId}
                        id={chartId as string}
                        chart={chart}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
      
      {/* 2. 图表展示模块 - 作为核心图和表区域，用于可视化展示选定的图表数据 */}
      <div className={`${cardBg} rounded-2xl p-6 shadow-lg`} style={{ minHeight: '900px', height: 'calc(100vh - 200px)', overflow: 'auto' }}>
        <h2 className={`text-lg font-bold mb-4 ${textMain}`}>图表展示</h2>
        {renderChart()}
      </div>
      
      {/* 3. 图表解析模块 - 位于界面底部区域，用于对当前展示图表进行详细解析 */}
      <div className={`${cardBg} rounded-2xl p-6 shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold ${textMain}`}>图表深度解析模块</h2>
          {/* 统一的帮助按钮 */}
          <button onClick={() => setActiveHelp('chartDetail')} className="text-zinc-500 hover:text-white transition-colors">
            <HelpCircle size={16} />
          </button>
        </div>
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
      
      {/* 统一的帮助指南卡片 */}
      <GlobalGuideCard
        activeHelp={activeHelp}
        helpContent={helpContent}
        onClose={() => setActiveHelp(null)}
        cardBg={cardBg}
        textMain={textMain}
        textSub={textSub}
        config={guideCardConfig}
      />
    </div>
  );
};

export default MissionControl;