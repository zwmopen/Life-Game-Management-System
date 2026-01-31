import React, { useState, useMemo } from 'react';

/**
 * 时间盒子组件
 * 基于Elon Musk的时间管理方法论
 * 将时间分割成固定长度的时间段，每个时间段专注于单一任务
 */
const TimeBox: React.FC = () => {
  // 状态管理
  const [timeBoxes, setTimeBoxes] = useState([
    { id: 1, title: '深度工作', duration: 90, color: '#3b82f6', isActive: false },
    { id: 2, title: '会议沟通', duration: 30, color: '#10b981', isActive: false },
    { id: 3, title: '学习研究', duration: 60, color: '#f59e0b', isActive: false },
    { id: 4, title: '休息调整', duration: 15, color: '#ef4444', isActive: false },
  ]);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedBox, setSelectedBox] = useState<number | null>(null);

  // 计算总时间和已用时间
  const timeStats = useMemo(() => {
    const totalTime = timeBoxes.reduce((sum, box) => sum + box.duration, 0);
    const usedTime = timeBoxes.reduce((sum, box) => box.isActive ? sum + box.duration : sum, 0);
    const percentage = totalTime > 0 ? Math.round((usedTime / totalTime) * 100) : 0;
    
    return { totalTime, usedTime, percentage };
  }, [timeBoxes]);

  // 开始时间盒子
  const startTimer = (boxId: number) => {
    setSelectedBox(boxId);
    setIsRunning(true);
    setTimeBoxes(prev => prev.map(box => 
      box.id === boxId ? { ...box, isActive: true } : box
    ));
  };

  // 暂停时间盒子
  const pauseTimer = () => {
    setIsRunning(false);
  };

  // 重置时间盒子
  const resetTimer = () => {
    setIsRunning(false);
    setCurrentTime(0);
    setSelectedBox(null);
    setTimeBoxes(prev => prev.map(box => ({ ...box, isActive: false })));
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* 标题部分 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">时间盒子</h1>
          <p className="text-zinc-600">基于Elon Musk的时间管理方法论，将时间分割成固定长度的专注时间段</p>
        </div>

        {/* 统计概览 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">今日概览</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-600">总时间</p>
              <p className="text-2xl font-bold text-blue-800">{timeStats.totalTime} 分钟</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-green-600">已用时间</p>
              <p className="text-2xl font-bold text-green-800">{timeStats.usedTime} 分钟</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-600">完成率</p>
              <p className="text-2xl font-bold text-purple-800">{timeStats.percentage}%</p>
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-zinc-500 mb-2">
              <span>时间利用进度</span>
              <span>{timeStats.percentage}%</span>
            </div>
            <div className="h-3 bg-zinc-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-500" 
                style={{ width: `${timeStats.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 时间盒子列表 */}
        <div className="space-y-4 mb-8">
          {timeBoxes.map((box) => (
            <div 
              key={box.id}
              className={`p-4 rounded-xl shadow-md transition-all duration-200 ${
                box.isActive ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
              }`}
              style={{ borderLeft: `4px solid ${box.color}` }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{box.title}</h3>
                  <p className="text-zinc-500">{box.duration} 分钟</p>
                </div>
                <button
                  onClick={() => startTimer(box.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    box.isActive 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {box.isActive ? '进行中' : '开始'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 控制面板 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">控制面板</h2>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={pauseTimer}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-all"
              disabled={!isRunning}
            >
              暂停
            </button>
            <button
              onClick={resetTimer}
              className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
              disabled={!isRunning}
            >
              重置
            </button>
          </div>
        </div>

        {/* 方法论说明 */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-3">Elon Musk 时间管理方法论</h3>
          <ul className="space-y-2 text-zinc-700">
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
      </div>
    </div>
  );
};

export default TimeBox;