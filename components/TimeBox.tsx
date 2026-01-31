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
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isGuideCardOpen, setIsGuideCardOpen] = useState(false);

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
    setIsTimerRunning(true);
    setIsFocusModalOpen(true);
  };

  // 继续专注
  const continueFocus = (task: any) => {
    setSelectedTask(task);
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
    setIsEditing(task.id);
    setEditForm({ ...task });
  };

  // 保存编辑
  const saveEdit = () => {
    setTasks(prev => prev.map(task => 
      task.id === isEditing ? { ...editForm } : task
    ));
    setIsEditing(null);
  };

  // 取消编辑
  const cancelEdit = () => {
    setIsEditing(null);
    setEditForm({});
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
    <div className="p-6 min-h-screen bg-[#e0e5ec]">
      <div className="max-w-6xl mx-auto">
        {/* 仪表盘标题 */}
        <div className="relative mb-6">
          <h1 className="text-2xl font-bold mb-2">时间盒子</h1>
          <p className="text-zinc-600">基于Elon Musk的时间管理方法论</p>
          
          {/* 指南卡片按钮 */}
          <button
            onClick={() => setIsGuideCardOpen(!isGuideCardOpen)}
            className="absolute top-0 right-0 p-3 rounded-full bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] transition-all duration-300 hover:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </button>
          
          {/* 指南卡片 */}
          {isGuideCardOpen && (
            <div className="absolute top-12 right-0 w-80 bg-[#e0e5ec] rounded-xl p-4 shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)] z-10">
              <h3 className="text-lg font-semibold mb-3 text-zinc-700">Elon Musk 时间管理方法论</h3>
              <ul className="space-y-2 text-sm text-zinc-600">
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
          )}
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#e0e5ec] rounded-xl shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-zinc-600">完成率</h3>
              <span className="text-xs text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-700">{stats.completionRate}%</p>
            <p className="text-xs text-zinc-500">{stats.completedTasks}/{stats.totalTasks} 任务已完成</p>
          </div>
          
          <div className="bg-[#e0e5ec] rounded-xl shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-zinc-600">已完成任务</h3>
              <span className="text-xs text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-700">{stats.completedTasks}</p>
            <p className="text-xs text-zinc-500">你做得很好！</p>
          </div>
          
          <div className="bg-[#e0e5ec] rounded-xl shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-zinc-600">平均专注时间</h3>
              <span className="text-xs text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-700">{stats.averageFocusTime} 分钟</p>
            <p className="text-xs text-zinc-500">每个已完成任务</p>
          </div>
          
          <div className="bg-[#e0e5ec] rounded-xl shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] p-4">
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
          <h2 className="text-xl font-semibold mb-4 text-zinc-700">今日焦点</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className="bg-[#e0e5ec] rounded-xl shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] p-4 border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-base text-zinc-700">{task.title}</h3>
                  <button className="text-xs text-zinc-500">
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
                  <span className="text-xs text-zinc-500">{task.status}</span>
                  <span className="text-xs text-zinc-500">待处理</span>
                </div>
                {isEditing === task.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-[#e0e5ec] rounded-lg text-sm shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]"
                    />
                    <input
                      type="number"
                      value={editForm.duration}
                      onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-[#e0e5ec] rounded-lg text-sm shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]"
                      placeholder="时长（分钟）"
                    />
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                      className="w-full px-3 py-2 bg-[#e0e5ec] rounded-lg text-sm shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]"
                    >
                      <option value="高">高</option>
                      <option value="中">中</option>
                      <option value="低">低</option>
                    </select>
                    <div className="flex space-x-2">
                      <button
                        onClick={saveEdit}
                        className="flex-1 py-2 bg-[#e0e5ec] text-green-600 rounded-lg text-sm font-medium shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)] transition-all"
                      >
                        <Save size={14} className="inline mr-1" /> 保存
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 py-2 bg-[#e0e5ec] text-red-600 rounded-lg text-sm font-medium shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)] transition-all"
                      >
                        <X size={14} className="inline mr-1" /> 取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setIsFocusModalOpen(true);
                      }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        task.isActive 
                          ? 'bg-[#e0e5ec] text-red-500 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,1)] hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.8),inset_-4px_-4px_8px_rgba(255,255,255,1)]'
                          : 'bg-[#e0e5ec] text-zinc-700 shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)]'
                      }`}
                    >
                      {task.isActive ? '继续专注' : '开始专注'}
                    </button>
                    <button
                      onClick={() => startEditing(task)}
                      className="p-2 bg-[#e0e5ec] rounded-lg text-zinc-500 shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)] transition-all"
                      title="编辑任务"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 专注模态框 */}
        {isFocusModalOpen && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#e0e5ec] rounded-xl shadow-[10px_10px_20px_rgba(0,0,0,0.2),-10px_-10px_20px_rgba(255,255,255,0.8)] p-8 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-6 text-center text-zinc-700">{selectedTask.title}</h2>
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-64 h-64 mb-6">
                  <div className="absolute inset-0 rounded-full border-8 border-blue-100"></div>
                  <div className="absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent animate-spin-slow"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-zinc-700">
                      {formatTime(timer)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="px-6 py-2 bg-[#e0e5ec] text-blue-600 rounded-lg text-sm font-medium shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)] transition-all"
                  >
                    {isTimerRunning ? '暂停' : '开始'}
                  </button>
                  <button
                    onClick={completeTask}
                    className="px-6 py-2 bg-[#e0e5ec] text-zinc-700 rounded-lg text-sm font-medium shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] hover:shadow-[8px_8px_16px_rgba(163,177,198,0.8),-8px_-8px_16px_rgba(255,255,255,1)] transition-all"
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