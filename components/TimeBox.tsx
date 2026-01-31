import React, { useState, useMemo, useEffect } from 'react';
import { Clock, Edit, Save, X } from 'lucide-react';

/**
 * 时间盒子组件
 * 基于Elon Musk的时间管理方法论
 * 将时间分割成固定长度的时间段，每个时间段专注于单一任务
 */
const TimeBox: React.FC = () => {
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
      id: 2,
      title: '集成AI时间估算功能',
      description: '在任务列表中添加一个按钮，用于调用GenKit流程进行时间估算。',
      priority: '中',
      duration: 60,
      status: '待处理',
      isActive: false
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
  };

  // 继续专注
  const continueFocus = (task: any) => {
    setSelectedTask(task);
    setTimer(task.duration * 60); // 设置为总时长，倒计时
    setIsTimerRunning(true);
    setIsFocusModalOpen(true);
  };

  // 完成任务
  const completeTask = () => {
    setIsTimerRunning(false);
    setIsFocusModalOpen(false);
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
  };

  // 删除任务
  const deleteTask = (taskId: number) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  // 保存编辑
  const saveEdit = () => {
    setTasks(prev => prev.map(task => 
      task.id === selectedEditTask.id ? { ...editForm } : task
    ));
    setIsEditTaskOpen(false);
    setSelectedEditTask(null);
  };

  // 取消编辑
  const cancelEdit = () => {
    setIsEditTaskOpen(false);
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
    setIsAddTaskOpen(false);
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

  return (
    <div className={`p-6 min-h-screen bg-[#e0e5ec] ${(isAddTaskOpen || isGuideCardOpen || isEditTaskOpen || isFocusModalOpen) ? 'overflow-hidden' : ''}`}>
      <div className="max-w-6xl mx-auto">
        {/* 仪表盘标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">时间盒子</h1>
          <p className="text-zinc-600">基于Elon Musk的时间管理方法论</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#e0e5ec] rounded-xl shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] p-5 transition-all duration-300 hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-zinc-600">完成率</h3>
              <span className="text-xs text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-700">{stats.completionRate}%</p>
            <p className="text-xs text-zinc-500">{stats.completedTasks}/{stats.totalTasks} 任务已完成</p>
          </div>
          
          <div className="bg-[#e0e5ec] rounded-xl shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] p-5 transition-all duration-300 hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-zinc-600">已完成任务</h3>
              <span className="text-xs text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-700">{stats.completedTasks}</p>
            <p className="text-xs text-zinc-500">你做得很好！</p>
          </div>
          
          <div className="bg-[#e0e5ec] rounded-xl shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] p-5 transition-all duration-300 hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-zinc-600">平均专注时间</h3>
              <span className="text-xs text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-700">{stats.averageFocusTime} 分钟</p>
            <p className="text-xs text-zinc-500">每个已完成任务</p>
          </div>
          
          <div className="bg-[#e0e5ec] rounded-xl shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] p-5 transition-all duration-300 hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)]">
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
              {/* 指南卡片按钮 */}
              <button
                onClick={() => setIsGuideCardOpen(!isGuideCardOpen)}
                className="p-3 rounded-full bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] transition-all duration-300 hover:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]"
                title="使用指南"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </button>
              
              {/* 添加任务按钮 */}
              <button
                onClick={() => setIsAddTaskOpen(!isAddTaskOpen)}
                className="px-4 py-2 bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] transition-all duration-300 hover:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)] rounded-lg text-sm font-medium"
                title="添加任务"
              >
                添加任务
              </button>
            </div>
          </div>
          
          {/* 指南卡片 */}
          {isGuideCardOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-[#e0e5ec] rounded-xl p-6 max-w-2xl w-full mx-4 shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-zinc-700">Elon Musk 时间管理方法论</h3>
                  <button
                    onClick={() => setIsGuideCardOpen(false)}
                    className="p-2 rounded-full bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] transition-all duration-300 hover:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-zinc-700 mb-2">原理</h4>
                    <p className="text-zinc-600">Elon Musk的时间管理方法基于将时间分割成固定长度的时间段，每个时间段专注于单一任务。这种方法有助于提高专注力，减少任务切换的时间成本，并确保所有重要任务都能得到充分关注。</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-zinc-700 mb-2">技巧</h4>
                    <ul className="space-y-2 text-zinc-600">
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                        <span>将时间分割成 5-15 分钟的固定时间段</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                        <span>每个时间段只专注于单一任务或活动</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                        <span>严格遵守时间限制，避免任务蔓延</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                        <span>通过频繁切换任务保持大脑新鲜感</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-zinc-700 mb-2">实践</h4>
                    <p className="text-zinc-600">每天开始时，列出当天需要完成的任务，并为每个任务分配合理的时间。然后使用时间盒子进行倒计时，确保在规定时间内完成任务。完成一个任务后，短暂休息，然后开始下一个任务。</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-zinc-700 mb-2">方法</h4>
                    <p className="text-zinc-600">1. 列出任务清单
2. 为每个任务分配时间
3. 使用时间盒子进行倒计时
4. 专注于当前任务
5. 完成后标记任务状态
6. 分析时间使用情况，不断优化</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-zinc-700 mb-2">案例</h4>
                    <p className="text-zinc-600">Elon Musk使用这种方法管理他的多公司业务，包括Tesla和SpaceX。他每天将时间分割成多个5-15分钟的时间段，每个时间段专注于一个特定的任务或会议。这种方法帮助他在有限的时间内完成更多的工作，同时保持高水准的创造力和决策能力。</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 添加任务模态框 */}
          {isAddTaskOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-[#e0e5ec] rounded-xl p-6 max-w-md w-full mx-4 shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-zinc-700">添加任务</h3>
                  <button
                    onClick={() => setIsAddTaskOpen(false)}
                    className="p-2 rounded-full bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] transition-all duration-300 hover:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">任务标题</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="输入任务标题"
                      className="w-full px-3 py-2 bg-[#e0e5ec] rounded-lg text-sm shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">任务描述</label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="输入任务描述"
                      rows={3}
                      className="w-full px-3 py-2 bg-[#e0e5ec] rounded-lg text-sm shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">优先级</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        className="w-full px-3 py-2 bg-[#e0e5ec] rounded-lg text-sm shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]"
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
                        className="w-full px-3 py-2 bg-[#e0e5ec] rounded-lg text-sm shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={addTask}
                      className="flex-1 py-2 bg-[#e0e5ec] text-green-600 rounded-lg text-sm font-medium shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)] transition-all"
                    >
                      添加任务
                    </button>
                    <button
                      onClick={cancelAddTask}
                      className="flex-1 py-2 bg-[#e0e5ec] text-red-600 rounded-lg text-sm font-medium shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)] transition-all"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={`bg-[#e0e5ec] rounded-xl shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] p-5 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)] hover:translate-y-[-2px] ${
                  task.status === '已完成' ? 'opacity-70' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-medium text-base transition-colors ${
                    task.status === '已完成' 
                      ? 'text-zinc-500 line-through' 
                      : 'text-zinc-700'
                  }`}>{task.title}</h3>
                  <div className="relative group">
                    <button className="text-xs text-zinc-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </button>
                    <div className="absolute right-0 mt-1 w-24 bg-[#e0e5ec] rounded-lg shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] py-2 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <button
                        onClick={() => startEditing(task)}
                        className="block w-full text-left px-3 py-1 text-sm text-zinc-700 hover:bg-[#d5d9e0] transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="block w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-[#d5d9e0] transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
                <p className={`text-xs transition-colors ${
                  task.status === '已完成' 
                    ? 'text-zinc-400 line-through' 
                    : 'text-zinc-500'
                } mb-3`}>{task.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className={`text-xs font-medium ${getPriorityColor(task.priority)} mr-2`}>
                      {task.priority === '高' ? '🔥' : task.priority === '中' ? '⚡' : '🌱'}
                    </span>
                    <span className="text-xs text-zinc-500">{task.priority}</span>
                  </div>
                  <span className="text-xs text-zinc-500">{task.duration} 分钟</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-500">{task.status}</span>
                  <span className="text-xs text-zinc-500">{task.duration} 分钟</span>
                </div>
                <button
                  onClick={() => startFocus(task)}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                    task.isActive 
                      ? 'bg-[#e0e5ec] text-red-500 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]'
                      : 'bg-[#e0e5ec] text-zinc-700 shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)]'
                  }`}
                >
                  {task.isActive ? '继续专注' : '开始专注'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 编辑任务模态框 */}
        {isEditTaskOpen && selectedEditTask && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-[#e0e5ec] rounded-xl p-6 max-w-md w-full mx-4 shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-zinc-700">编辑任务</h3>
                <button
                  onClick={cancelEdit}
                  className="p-2 rounded-full bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] transition-all duration-300 hover:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]"
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
                    className="w-full px-3 py-2 bg-[#e0e5ec] rounded-lg text-sm shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">任务描述</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#e0e5ec] rounded-lg text-sm shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">优先级</label>
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                      className="w-full px-3 py-2 bg-[#e0e5ec] rounded-lg text-sm shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]"
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
                      className="w-full px-3 py-2 bg-[#e0e5ec] rounded-lg text-sm shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={saveEdit}
                    className="flex-1 py-2 bg-[#e0e5ec] text-green-600 rounded-lg text-sm font-medium shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)] transition-all"
                  >
                    保存更改
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex-1 py-2 bg-[#e0e5ec] text-red-600 rounded-lg text-sm font-medium shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)] transition-all"
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
          <div className="fixed inset-0 bg-[#1e1e2e] flex items-center justify-center z-50">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-96 h-96 mb-10">
                {/* 拟态背景圆形 */}
                <div className="absolute inset-0 rounded-full bg-[#1e1e2e] shadow-[15px_15px_30px_rgba(0,0,0,0.3),-15px_-15px_30px_rgba(40,40,60,0.1)]"></div>
                
                {/* 进度条倒计时 */}
                <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 300 300">
                  <circle
                    cx="150"
                    cy="150"
                    r="130"
                    fill="none"
                    stroke="rgba(30, 64, 175, 0.3)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="150"
                    cy="150"
                    r="130"
                    fill="none"
                    stroke="#3b82f6"
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
                  <h2 className="text-2xl font-semibold mb-4 text-center text-white">时间盒子倒计时</h2>
                  <h3 className="text-xl font-medium mb-6 text-center text-blue-200">{selectedTask.title}</h3>
                  <span className="text-7xl font-bold text-white">
                    {formatTime(timer)}
                  </span>
                </div>
              </div>
              <div className="flex space-x-8">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-10 py-4 bg-[#1e1e2e] text-blue-400 rounded-lg text-base font-medium shadow-[5px_5px_10px_rgba(0,0,0,0.3),-5px_-5px_10px_rgba(40,40,60,0.1)] hover:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.3),inset_-5px_-5px_10px_rgba(40,40,60,0.1)] transition-all"
                >
                  {isTimerRunning ? '暂停' : '开始'}
                </button>
                <button
                  onClick={completeTask}
                  className="px-10 py-4 bg-[#1e1e2e] text-white rounded-lg text-base font-medium shadow-[5px_5px_10px_rgba(0,0,0,0.3),-5px_-5px_10px_rgba(40,40,60,0.1)] hover:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.3),inset_-5px_-5px_10px_rgba(40,40,60,0.1)] transition-all"
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