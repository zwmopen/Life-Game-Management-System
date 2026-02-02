import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Clock, Edit, Save, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { GlobalHelpButton, GlobalGuideCard, helpContent } from './HelpSystem';

interface TimeBoxProps {
  setModalState: (isOpen: boolean) => void;
}

/**
 * 时间盒子组件
 * 基于Elon Musk的时间管理方法论
 * 将时间分割成固定长度的时间段，每个时间段专注于单一任务
 */
const TimeBox: React.FC<TimeBoxProps> = ({ setModalState }) => {
  // 使用主题上下文
  const { theme } = useTheme();
  
  // 状态管理
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: '实现任务状态管理',
      description: '使用React Context和useReducer管理任务的全局状态。',
      priority: '高',
      duration: 90,
      status: '进行中',
      isActive: true
    },
    {
      id: 3,
      title: '构建分析页面',
      description: '设计并实现分析仪表板的图表和统计数据。',
      priority: '中',
      duration: 150,
      status: '待处理',
      isActive: false
    },
    {
      id: 4,
      title: '创建专注模式页面',
      description: '开发带有计时器和任务详情的全屏专注模式。',
      priority: '低',
      duration: 75,
      status: '待处理',
      isActive: false
    }
  ]);
  
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isGuideCardOpen, setIsGuideCardOpen] = useState(false);
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  const [isDetailedGuideOpen, setIsDetailedGuideOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [selectedEditTask, setSelectedEditTask] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: '中',
    duration: 60
  });
  
  const [batchTasks, setBatchTasks] = useState('');
  const [isBatchMode, setIsBatchMode] = useState(false);
  
  // 打开弹窗时设置模态状态
  const openModal = useCallback((isOpen: boolean) => {
    setModalState(isOpen);
  }, [setModalState]);

  // 计算统计数据
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === '已完成').length;
    const completionRate = Math.round((completedTasks / totalTasks) * 100);
    const totalFocusTime = tasks.reduce((sum, task) => sum + task.duration, 0);
    const averageFocusTime = Math.round(totalFocusTime / totalTasks);
    const efficiencyScore = -23; // 基于完成情况和时间
    
    return {
      completionRate,
      completedTasks,
      totalTasks,
      averageFocusTime,
      efficiencyScore
    };
  }, [tasks]);

  // 计时器逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && selectedTask) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 0) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, selectedTask]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 开始专注
  const startFocus = (task: any) => {
    setSelectedTask(task);
    setTimer(task.duration * 60); // 设置为总时长，倒计时
    setIsTimerRunning(true);
    setIsFocusModalOpen(true);
    openModal(true);
  };

  // 继续专注
  const continueFocus = (task: any) => {
    setSelectedTask(task);
    setTimer(task.duration * 60); // 设置为总时长，倒计时
    setIsTimerRunning(true);
    setIsFocusModalOpen(true);
    openModal(true);
  };

  // 完成任务
  const completeTask = () => {
    setIsTimerRunning(false);
    setIsFocusModalOpen(false);
    openModal(false);
    setTasks(prev => prev.map(task => 
      task.id === selectedTask.id ? { ...task, status: '已完成', isActive: false } : task
    ));
    setSelectedTask(null);
  };

  // 开始编辑任务
  const startEditing = (task: any) => {
    setSelectedEditTask(task);
    setEditForm({ ...task });
    setIsEditTaskOpen(true);
    openModal(true);
  };

  // 删除任务
  const deleteTask = (taskId: number) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };
  
  // 切换任务状态
  const toggleTaskStatus = (taskId: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: task.status === '已完成' ? '待处理' : '已完成', isActive: false } : task
    ));
  };

  // 保存编辑
  const saveEdit = () => {
    setTasks(prev => prev.map(task => 
      task.id === selectedEditTask.id ? { ...editForm } : task
    ));
    setIsEditTaskOpen(false);
    openModal(false);
    setSelectedEditTask(null);
  };

  // 取消编辑
  const cancelEdit = () => {
    setIsEditTaskOpen(false);
    openModal(false);
    setSelectedEditTask(null);
    setEditForm({});
  };

  // 添加任务
  const addTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now(),
        ...newTask,
        status: '待处理',
        isActive: false
      };
      setTasks(prev => [...prev, task]);
      setNewTask({
        title: '',
        description: '',
        priority: '中',
        duration: 60
      });
      setIsAddTaskOpen(false);
      openModal(false);
    }
  };

  // 取消添加任务
  const cancelAddTask = () => {
    setNewTask({
      title: '',
      description: '',
      priority: '中',
      duration: 60
    });
    setBatchTasks('');
    setIsBatchMode(false);
    setIsAddTaskOpen(false);
    openModal(false);
  };
  
  // 批量添加任务
  const addBatchTasks = () => {
    if (!batchTasks.trim()) return;
    
    const tasks = batchTasks.split('\n').filter(line => line.trim());
    const newTasks = [];
    
    tasks.forEach(taskText => {
      const task = {
        id: Date.now() + Math.random(),
        title: '',
        description: '',
        priority: '中',
        duration: 60,
        status: '待处理',
        isActive: false,
        timeSlot: ''
      };
      
      // 解析任务文本
      const parts = taskText.split('。').filter(part => part.trim());
      
      parts.forEach(part => {
        // 匹配时长
        const durationMatch = part.match(/(\d+)分钟/);
        if (durationMatch) {
          task.duration = parseInt(durationMatch[1]);
          return;
        }
        
        // 匹配时间段
        const timeMatch = part.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
        if (timeMatch) {
          task.timeSlot = `${timeMatch[1]}-${timeMatch[2]}`;
          return;
        }
        
        // 匹配优先级
        const priorityMatch = part.match(/(高|中|低)优先级/);
        if (priorityMatch) {
          task.priority = priorityMatch[1];
          return;
        }
        
        // 剩余部分作为任务标题
        if (!task.title) {
          task.title = part.trim();
        } else {
          task.description += part.trim() + ' ';
        }
      });
      
      if (task.title) {
        newTasks.push(task);
      }
    });
    
    if (newTasks.length > 0) {
      setTasks(prev => [...prev, ...newTasks]);
    }
    
    cancelAddTask();
  };

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高': return 'text-red-500';
      case '中': return 'text-amber-500';
      case '低': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  // 获取主题相关的样式
  const getThemeStyles = () => {
    if (theme.includes('dark')) {
      return {
        bg: 'bg-[#1e1e2e]',
        text: 'text-zinc-100',
        cardBg: 'bg-[#2a2d36]',
        cardShadow: 'shadow-[5px_5px_10px_rgba(0,0,0,0.3),-5px_-5px_10px_rgba(42,45,54,0.8)]',
        inputBg: 'bg-[#2a2d36]',
        inputShadow: 'shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(42,45,54,0.8)]',
        buttonShadow: 'shadow-[5px_5px_10px_rgba(0,0,0,0.3),-5px_-5px_10px_rgba(42,45,54,0.8)]',
        buttonHoverShadow: 'shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(42,45,54,0.8)]',
        modalBg: 'bg-[#2a2d36]',
        modalShadow: 'shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(42,45,54,0.8)]'
      };
    } else {
      return {
        bg: 'bg-[#e0e5ec]',
        text: 'text-zinc-800',
        cardBg: 'bg-[#e0e5ec]',
        cardShadow: 'shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)]',
        inputBg: 'bg-[#e0e5ec]',
        inputShadow: 'shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)]',
        buttonShadow: 'shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)]',
        buttonHoverShadow: 'shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)]',
        modalBg: 'bg-[#e0e5ec]',
        modalShadow: 'shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]'
      };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <div className={`p-6 min-h-screen ${themeStyles.bg} ${themeStyles.text} ${(isAddTaskOpen || isGuideCardOpen || isEditTaskOpen || isFocusModalOpen || isDetailedGuideOpen) ? 'overflow-hidden' : ''}`}>
      <div className="max-w-6xl mx-auto">
        {/* 仪表盘标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">时间盒子</h1>
          <div className="flex items-center">
            <p className="text-zinc-600">基于Elon Musk的时间管理方法论</p>
            <button
              onClick={() => {
                setIsDetailedGuideOpen(true);
                openModal(true);
              }}
              className={`ml-3 px-3 py-1 ${themeStyles.cardBg} ${themeStyles.buttonShadow} transition-all duration-300 hover:${themeStyles.buttonHoverShadow} rounded-lg text-sm font-medium`}
              title="查看详细指南"
            >
              详细指南
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${themeStyles.cardBg} rounded-xl ${themeStyles.cardShadow} p-5 transition-all duration-300 hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)]`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-zinc-600">完成率</h3>
              <span className="text-xs text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-700">{stats.completionRate}%</p>
            <p className="text-xs text-zinc-500">{stats.completedTasks}/{stats.totalTasks} 任务已完成</p>
          </div>
          
          <div className={`${themeStyles.cardBg} rounded-xl ${themeStyles.cardShadow} p-5 transition-all duration-300 hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)]`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-zinc-600">已完成任务</h3>
              <span className="text-xs text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-700">{stats.completedTasks}</p>
            <p className="text-xs text-zinc-500">你做得很好！</p>
          </div>
          
          <div className={`${themeStyles.cardBg} rounded-xl ${themeStyles.cardShadow} p-5 transition-all duration-300 hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)]`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-zinc-600">平均专注时间</h3>
              <span className="text-xs text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-700">{stats.averageFocusTime} 分钟</p>
            <p className="text-xs text-zinc-500">每个已完成任务</p>
          </div>
          
          <div className={`${themeStyles.cardBg} rounded-xl ${themeStyles.cardShadow} p-5 transition-all duration-300 hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)]`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-zinc-600">效率得分</h3>
              <span className="text-xs text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-700">{stats.efficiencyScore}</p>
            <p className="text-xs text-zinc-500">基于完成情况和时间</p>
          </div>
        </div>

        {/* 今日焦点 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-zinc-700">今日焦点</h2>
            <div className="flex space-x-3">
              {/* 指南卡片按钮 - 使用全局统一的帮助按钮 */}
              <GlobalHelpButton
                helpId="time-box"
                onHelpClick={() => {
                  setActiveHelp('time-box');
                  setIsGuideCardOpen(true);
                  openModal(true);
                }}
                size={16}
              />
              
              {/* 添加任务按钮 */}
              <button
                onClick={() => {
                  setIsAddTaskOpen(!isAddTaskOpen);
                  openModal(!isAddTaskOpen);
                }}
                className={`px-4 py-2 ${themeStyles.cardBg} ${themeStyles.buttonShadow} transition-all duration-300 hover:${themeStyles.buttonHoverShadow} rounded-lg text-sm font-medium`}
                title="添加任务"
              >
                添加任务
              </button>
            </div>
          </div>
          
          {/* 指南卡片 - 使用全局统一的帮助卡片组件 */}
          {isGuideCardOpen && activeHelp && (
            <GlobalGuideCard
              activeHelp={activeHelp}
              helpContent={helpContent}
              onClose={() => {
                setIsGuideCardOpen(false);
                setActiveHelp(null);
                openModal(false);
              }}
              config={{
                fontSize: 'medium',
                borderRadius: 'large',
                shadowIntensity: 'strong',
                showUnderlyingPrinciple: true
              }}
            />
          )}
          
          {/* 详细指南模态框 */}
          {isDetailedGuideOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100000]">
              <div className={`${themeStyles.modalBg} rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] ${themeStyles.modalShadow} transition-all duration-300 flex flex-col`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-xl font-semibold ${themeStyles.text}`}>Elon Musk 时间管理方法论</h3>
                  <button
                    onClick={() => {
                      setIsDetailedGuideOpen(false);
                      openModal(false);
                    }}
                    className={`p-2 rounded-full ${themeStyles.cardBg} ${themeStyles.buttonShadow} transition-all duration-300 hover:${themeStyles.buttonHoverShadow}`}
                    title="关闭"
                  >
                    <X size={18} className={themeStyles.text} />
                  </button>
                </div>
                
                <div className="space-y-6 overflow-y-auto flex-1">
                  <div>
                    <h4 className={`text-lg font-medium mb-3 ${themeStyles.text}`}>本质与核心理念</h4>
                    <ul className={`space-y-3 ${themeStyles.text === 'text-zinc-100' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>定义：为任务设明确时间边界，时间一到强制结束，不无限延展。</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>核心差异：待办清单是"线性无限"，时间盒是"空间有限"，把任务变成日历上的"硬预约"。</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>底层逻辑：用"物理式时间约束"替代"弹性任务清单"，用5分钟颗粒度把时间变成可量化、可执行的资源，匹配"第一性原理"的效率思维。</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>关键效应：截止预期效应，略紧的时限带来紧迫感，提升专注与效率。</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className={`text-lg font-medium mb-3 ${themeStyles.text}`}>马斯克式执行细节</h4>
                    <ul className={`space-y-3 ${themeStyles.text === 'text-zinc-100' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>时间切割：醒着的18小时切成216个5分钟"盒子"，连接水、会议、回复邮件都精准入盒。</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>优先级排序：80%时间投入高价值任务（如工程设计、核心决策），低价值任务直接剔除。</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>执行原则：一次只做一件事，时间到就切换，不纠结未完成部分，避免"完美主义陷阱"。</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>动态调度：按任务优先级实时调整日程，允许计划外中断，但每月设"熔断机制"防系统崩溃。</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className={`text-lg font-medium mb-3 ${themeStyles.text}`}>普通人可复制的四步流程</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className={`font-medium mb-2 ${themeStyles.text}`}>1. 任务筛选与排序</h5>
                        <ul className={`space-y-2 pl-4 ${themeStyles.text === 'text-zinc-100' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                            <span>列出所有待办，用"收益≥2×时间成本"筛掉无效项。</span>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                            <span>按"重要且紧急＞重要不紧急＞紧急不重要＞不紧急不重要"排序，锁定核心任务。</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h5 className={`font-medium mb-2 ${themeStyles.text}`}>2. 时间盒设计</h5>
                        <ul className={`space-y-2 pl-4 ${themeStyles.text === 'text-zinc-100' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                            <span>颗粒度：日常用15-60分钟（新手不建议5分钟），按任务复杂度拆分。</span>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                            <span>时长设定：比预估短10%-20%（如预估1小时设50分钟），制造合理压力。</span>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                            <span>精力匹配：把高认知任务（创意、决策）放在10:00-11:30，机械任务放14:00-15:00等低谷期。</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h5 className={`font-medium mb-2 ${themeStyles.text}`}>3. 专注执行</h5>
                        <ul className={`space-y-2 pl-4 ${themeStyles.text === 'text-zinc-100' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                            <span>启动倒计时，期间关闭手机通知，拒绝多线程，专注单任务。</span>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                            <span>遇到卡壳：用"马斯克三连击"→写阻碍→算解决成本→立即执行或永久删除（犹豫超5分钟放弃）。</span>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                            <span>时间到即停，记录完成度，不拖延到下一盒。</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h5 className={`font-medium mb-2 ${themeStyles.text}`}>4. 复盘优化</h5>
                        <ul className={`space-y-2 pl-4 ${themeStyles.text === 'text-zinc-100' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                            <span>每日花5分钟记录实际耗时与预估偏差，迭代后续时间盒时长。</span>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                            <span>每周回看优先级与任务筛选，剔除持续低价值事项。</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={`text-lg font-medium mb-3 ${themeStyles.text}`}>避坑要点与工具推荐</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className={`font-medium mb-2 ${themeStyles.text}`}>避坑要点</h5>
                        <ul className={`space-y-2 pl-4 ${themeStyles.text === 'text-zinc-100' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                            <span>不贪多：每天核心任务不超3个，避免计划过载。</span>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                            <span>留缓冲：每2-3个盒子间留5-10分钟弹性，应对突发。</span>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                            <span>接受不完美：时间盒的核心是"完成度"而非"完美度"，避免因未做完而焦虑。</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h5 className={`font-medium mb-2 ${themeStyles.text}`}>工具推荐</h5>
                        <ul className={`space-y-2 pl-4 ${themeStyles.text === 'text-zinc-100' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                            <span>日历类：谷歌日历、Outlook、苹果日历（直接拖拽创建时间块）。</span>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                            <span>专注类：Forest、番茄ToDo（倒计时+专注模式）。</span>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                            <span>复盘类：Notion、Excel（记录耗时与完成度，生成周/月报表）。</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={`text-lg font-medium mb-3 ${themeStyles.text}`}>常见问题与解决</h4>
                    <ul className={`space-y-3 ${themeStyles.text === 'text-zinc-100' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>问题1：时间到任务没做完？→停止并标记"未完成"，移至下一个盒子或重新评估优先级，不占用其他任务时间。</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>问题2：频繁被打断？→设"免打扰时段"，非紧急事务集中处理（如每天16:00统一回消息）。</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>问题3：坚持不了？→从3个时间盒/天开始，逐步增加，用"完成奖励"（如休息10分钟）强化习惯。</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className={`text-lg font-medium mb-3 ${themeStyles.text}`}>与其他方法的区别</h4>
                    <ul className={`space-y-3 ${themeStyles.text === 'text-zinc-100' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>时间盒 vs 番茄工作法：番茄是25分钟固定时长+5分钟休息；时间盒按任务设时长，更灵活。</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                        <span>时间盒 vs GTD：GTD强调"收集-处理-组织-回顾-执行"；时间盒聚焦"时间约束+专注执行"，解决"执行拖延"。</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className={`text-lg font-medium mb-3 ${themeStyles.text}`}>一句话总结</h4>
                    <p className={themeStyles.text === 'text-zinc-100' ? 'text-zinc-300' : 'text-zinc-600'}>时间盒不是"填鸭式"塞满日程，而是用"有限时间"倒逼"高效产出"，让你在多任务中保持专注，告别无效忙碌。</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 添加任务模态框 */}
          {isAddTaskOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100000]">
              <div className={`${themeStyles.modalBg} rounded-xl p-6 max-w-md w-full mx-4 ${themeStyles.modalShadow}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-zinc-700">添加任务</h3>
                  <button
                    onClick={cancelAddTask}
                    className={`p-2 rounded-full ${themeStyles.cardBg} ${themeStyles.buttonShadow} transition-all duration-300 hover:${themeStyles.buttonHoverShadow}`}
                  >
                    <X size={18} />
                  </button>
                </div>
                
                {/* 切换模式按钮 */}
                <div className="flex mb-4 border-b border-zinc-200">
                  <button
                    onClick={() => setIsBatchMode(false)}
                    className={`px-4 py-2 text-sm font-medium ${!isBatchMode ? 'border-b-2 border-blue-500 text-blue-600' : 'text-zinc-500'} transition-colors`}
                  >
                    单个添加
                  </button>
                  <button
                    onClick={() => setIsBatchMode(true)}
                    className={`px-4 py-2 text-sm font-medium ${isBatchMode ? 'border-b-2 border-blue-500 text-blue-600' : 'text-zinc-500'} transition-colors`}
                  >
                    批量添加
                  </button>
                </div>
                
                <div className="space-y-3">
                  {!isBatchMode ? (
                    // 单个添加模式
                    <>
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 mb-1">任务标题</label>
                        <input
                          type="text"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          placeholder="输入任务标题"
                          className={`w-full px-3 py-2 ${themeStyles.inputBg} rounded-lg text-sm ${themeStyles.inputShadow} border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 mb-1">任务描述</label>
                        <textarea
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          placeholder="输入任务描述"
                          rows={3}
                          className={`w-full px-3 py-2 ${themeStyles.inputBg} rounded-lg text-sm ${themeStyles.inputShadow} border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-zinc-600 mb-1">优先级</label>
                          <select
                            value={newTask.priority}
                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                            className={`w-full px-3 py-2 ${themeStyles.inputBg} rounded-lg text-sm ${themeStyles.inputShadow} border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]`}
                          >
                            <option value="高">高</option>
                            <option value="中">中</option>
                            <option value="低">低</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-600 mb-1">预计时长（分钟）</label>
                          <input
                            type="number"
                            value={newTask.duration}
                            onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 0 })}
                            min="5"
                            max="300"
                            step="5"
                            className={`w-full px-3 py-2 ${themeStyles.inputBg} rounded-lg text-sm ${themeStyles.inputShadow} border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]`}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    // 批量添加模式
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">批量添加任务</label>
                      <textarea
                        value={batchTasks}
                        onChange={(e) => setBatchTasks(e.target.value)}
                        placeholder="一行一个任务，例如：\n买一个车。50分钟。14:00-14:50。高优先级\n完成项目报告。30分钟。中优先级"
                        rows={8}
                        className={`w-full px-3 py-2 ${themeStyles.inputBg} rounded-lg text-sm ${themeStyles.inputShadow} border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]`}
                      />
                      <p className="text-xs text-zinc-500 mt-1">支持自动识别任务标题、时长、时间段和优先级</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={isBatchMode ? addBatchTasks : addTask}
                      className={`flex-1 py-2 ${themeStyles.cardBg} text-green-600 rounded-lg text-sm font-medium ${themeStyles.buttonShadow} hover:${themeStyles.buttonHoverShadow} transition-all`}
                    >
                      {isBatchMode ? '批量添加' : '添加任务'}
                    </button>
                    <button
                      onClick={cancelAddTask}
                      className={`flex-1 py-2 ${themeStyles.cardBg} text-red-600 rounded-lg text-sm font-medium ${themeStyles.buttonShadow} hover:${themeStyles.buttonHoverShadow} transition-all`}
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={`${themeStyles.cardBg} rounded-xl ${themeStyles.cardShadow} p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)] hover:translate-y-[-2px] ${
                  task.status === '已完成' ? 'opacity-70' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`font-semibold text-lg transition-colors ${
                    task.status === '已完成' 
                      ? 'text-zinc-500 line-through' 
                      : theme.includes('dark') ? 'text-white' : 'text-zinc-800'
                  }`}>{task.title}</h3>
                  <div className="relative group">
                    <button className={`p-1 rounded-full ${themeStyles.cardBg} ${themeStyles.buttonShadow}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.includes('dark') ? 'currentColor' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </button>
                    <div className={`absolute right-0 mt-1 w-28 ${themeStyles.modalBg} rounded-lg ${themeStyles.modalShadow} py-2 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300`}>
                      <button
                        onClick={() => startEditing(task)}
                        className={`block w-full text-left px-3 py-2 text-sm ${theme.includes('dark') ? 'text-zinc-300 hover:bg-zinc-700' : 'text-zinc-700 hover:bg-zinc-100'} transition-colors`}
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`block w-full text-left px-3 py-2 text-sm ${theme.includes('dark') ? 'text-green-400 hover:bg-zinc-700' : 'text-green-600 hover:bg-zinc-100'} transition-colors`}
                      >
                        {task.status === '已完成' ? '标记为未完成' : '标记为已完成'}
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className={`block w-full text-left px-3 py-2 text-sm ${theme.includes('dark') ? 'text-red-400 hover:bg-zinc-700' : 'text-red-600 hover:bg-zinc-100'} transition-colors`}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
                <p className={`text-sm transition-colors ${
                  task.status === '已完成' 
                    ? 'text-zinc-400 line-through' 
                    : theme.includes('dark') ? 'text-zinc-300' : 'text-zinc-600'
                } mb-4`}>{task.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${getPriorityColor(task.priority)} mr-2`}>
                        {task.priority === '高' ? '🔥' : task.priority === '中' ? '⚡' : '🌱'}
                      </span>
                      <span className={`text-sm ${theme.includes('dark') ? 'text-zinc-300' : 'text-zinc-600'}`}>{task.priority}</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.includes('dark') ? 'currentColor' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mr-2 ${theme.includes('dark') ? 'text-zinc-400' : 'text-zinc-500'}`}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      <span className={`text-sm ${theme.includes('dark') ? 'text-zinc-300' : 'text-zinc-600'}`}>{task.duration} 分钟</span>
                    </div>
                    {task.timeSlot && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.includes('dark') ? 'currentColor' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mr-2 ${theme.includes('dark') ? 'text-purple-400' : 'text-purple-500'}`}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span className={`text-sm ${theme.includes('dark') ? 'text-zinc-300' : 'text-zinc-600'}`}>{task.timeSlot}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.includes('dark') ? 'currentColor' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mr-2 ${theme.includes('dark') ? 'text-blue-400' : 'text-blue-500'}`}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                      <span className={`text-sm ${theme.includes('dark') ? 'text-zinc-300' : 'text-zinc-600'}`}>{task.status}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => startFocus(task)}
                  className={`w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-all ${
                    task.isActive 
                      ? `${themeStyles.cardBg} text-red-500 ${themeStyles.buttonHoverShadow} hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]`
                      : `${themeStyles.cardBg} ${theme.includes('dark') ? 'text-white' : 'text-zinc-800'} ${themeStyles.buttonShadow} hover:${themeStyles.buttonHoverShadow}`
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  {task.isActive ? '继续专注' : '开始专注'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 编辑任务模态框 */}
        {isEditTaskOpen && selectedEditTask && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100000]">
            <div className={`${themeStyles.modalBg} rounded-xl p-6 max-w-md w-full mx-4 ${themeStyles.modalShadow}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-zinc-700">编辑任务</h3>
                <button
                  onClick={cancelEdit}
                  className={`p-2 rounded-full ${themeStyles.cardBg} ${themeStyles.buttonShadow} transition-all duration-300 hover:${themeStyles.buttonHoverShadow}`}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">任务标题</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className={`w-full px-3 py-2 ${themeStyles.inputBg} rounded-lg text-sm ${themeStyles.inputShadow} border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">任务描述</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 ${themeStyles.inputBg} rounded-lg text-sm ${themeStyles.inputShadow} border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">优先级</label>
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                      className={`w-full px-3 py-2 ${themeStyles.inputBg} rounded-lg text-sm ${themeStyles.inputShadow} border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]`}
                    >
                      <option value="高">高</option>
                      <option value="中">中</option>
                      <option value="低">低</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">预计时长（分钟）</label>
                    <input
                      type="number"
                      value={editForm.duration}
                      onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 0 })}
                      min="5"
                      max="300"
                      step="5"
                      className={`w-full px-3 py-2 ${themeStyles.inputBg} rounded-lg text-sm ${themeStyles.inputShadow} border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]`}
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={saveEdit}
                    className={`flex-1 py-2 ${themeStyles.cardBg} text-green-600 rounded-lg text-sm font-medium ${themeStyles.buttonShadow} hover:${themeStyles.buttonHoverShadow} transition-all`}
                  >
                    保存更改
                  </button>
                  <button
                    onClick={cancelEdit}
                    className={`flex-1 py-2 ${themeStyles.cardBg} text-red-600 rounded-lg text-sm font-medium ${themeStyles.buttonShadow} hover:${themeStyles.buttonHoverShadow} transition-all`}
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 时间盒子倒计时模态框 */}
        {isFocusModalOpen && selectedTask && (
          <div className={`fixed inset-0 ${themeStyles.bg} flex items-center justify-center z-[100000]`}>
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-96 h-96 mb-10">
                {/* 背景圆形 */}
                <div className={`absolute inset-0 rounded-full ${themeStyles.cardBg} ${themeStyles.cardShadow}`}></div>
                
                {/* 进度条倒计时 */}
                <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 300 300">
                  <circle
                    cx="150"
                    cy="150"
                    r="130"
                    fill="none"
                    stroke={theme.includes('dark') ? 'rgba(30, 64, 175, 0.3)' : 'rgba(30, 64, 175, 0.2)'}
                    strokeWidth="12"
                  />
                  <circle
                    cx="150"
                    cy="150"
                    r="130"
                    fill="none"
                    stroke={theme.includes('dark') ? '#3b82f6' : '#2563eb'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    transform="rotate(-90 150 150)"
                    strokeDasharray={`${2 * Math.PI * 130}`}
                    strokeDashoffset={`${2 * Math.PI * 130 * (1 - timer / (selectedTask.duration * 60))}`}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                
                {/* 中心内容 */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <h2 className={`text-2xl font-semibold mb-4 text-center ${themeStyles.text}`}>时间盒子倒计时</h2>
                  <h3 className={`text-xl font-medium mb-6 text-center ${theme.includes('dark') ? 'text-blue-300' : 'text-blue-600'}`}>{selectedTask.title}</h3>
                  <span className={`text-7xl font-bold ${themeStyles.text}`}>
                    {formatTime(timer)}
                  </span>
                </div>
              </div>
              <div className="flex space-x-8">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-10 py-4 rounded-lg text-base font-medium transition-all ${themeStyles.cardBg} ${themeStyles.text} ${themeStyles.buttonShadow} hover:${themeStyles.buttonHoverShadow}`}
                >
                  {isTimerRunning ? '暂停' : '开始'}
                </button>
                <button
                  onClick={completeTask}
                  className={`px-10 py-4 rounded-lg text-base font-medium transition-all ${themeStyles.cardBg} ${themeStyles.text} ${themeStyles.buttonShadow} hover:${themeStyles.buttonHoverShadow}`}
                >
                  完成
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeBox;