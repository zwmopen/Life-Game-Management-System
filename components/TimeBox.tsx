import React, { useState, useMemo, useEffect } from 'react';

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
          if (prev >= selectedTask.duration * 60) {
            setIsTimerRunning(false);
            return selectedTask.duration * 60;
          }
          return prev + 1;
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
    setTimer(0);
    setIsFocusModalOpen(true);
  };

  // 继续专注
  const continueFocus = () => {
    setIsTimerRunning(true);
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
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* 仪表盘标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">仪表盘</h1>
          <p className="text-zinc-600">这是您的生产力摘要。</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-zinc-500">完成率</h3>
              <span className="text-xs text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.completionRate}%</p>
            <p className="text-xs text-zinc-400">{stats.completedTasks}/{stats.totalTasks} 任务已完成</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-zinc-500">已完成任务</h3>
              <span className="text-xs text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.completedTasks}</p>
            <p className="text-xs text-zinc-400">你做得很好！</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-zinc-500">平均专注时间</h3>
              <span className="text-xs text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.averageFocusTime} 分钟</p>
            <p className="text-xs text-zinc-400">每个已完成任务</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-zinc-500">效率得分</h3>
              <span className="text-xs text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.efficiencyScore}</p>
            <p className="text-xs text-zinc-400">基于完成情况和时间</p>
          </div>
        </div>

        {/* 今日焦点 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">今日焦点</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-base">{task.title}</h3>
                  <button className="text-xs text-zinc-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mb-3">{task.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className={`text-xs font-medium ${getPriorityColor(task.priority)} mr-2`}>
                      {task.priority === '高' ? '🔴' : task.priority === '中' ? '🟡' : '🟢'}
                    </span>
                    <span className="text-xs text-zinc-500">{task.priority}</span>
                  </div>
                  <span className="text-xs text-zinc-500">{task.duration} 分钟</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-400">{task.status}</span>
                  <span className="text-xs text-zinc-400">待处理</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setIsFocusModalOpen(true);
                  }}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                    task.isActive 
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {task.isActive ? '继续专注' : '开始专注'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 专注模态框 */}
        {isFocusModalOpen && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-6 text-center">{selectedTask.title}</h2>
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-64 h-64 mb-6">
                  <div className="absolute inset-0 rounded-full border-8 border-blue-100"></div>
                  <div className="absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent animate-spin-slow"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold">
                      {formatTime(timer)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    {isTimerRunning ? '暂停' : '开始'}
                  </button>
                  <button
                    onClick={() => {
                      setIsFocusModalOpen(false);
                      setIsTimerRunning(false);
                      setTimer(0);
                    }}
                    className="px-6 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
                  >
                    完成
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeBox;