import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// 简化的番茄钟组件用于测试
const SimplePomodoroTest = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25分钟
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(25);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const changeDuration = (min) => {
    setDuration(min);
    setTimeLeft(min * 60);
    setIsActive(false);
  };

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      textAlign: 'center', 
      padding: '20px',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1>番茄钟测试页面</h1>
      <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0' }}>
        {formatTime(timeLeft)}
      </div>
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={toggleTimer}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            marginRight: '10px',
            backgroundColor: isActive ? '#ff6b6b' : '#4ecdc4',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          {isActive ? '暂停' : '开始'}
        </button>
        <button 
          onClick={resetTimer}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#95a5a6',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          重置
        </button>
      </div>
      <div style={{ margin: '20px 0' }}>
        <label>专注时长: {duration} 分钟</label>
        <div>
          {[5, 15, 25, 45].map(min => (
            <button
              key={min}
              onClick={() => changeDuration(min)}
              style={{
                padding: '5px 10px',
                margin: '0 5px',
                backgroundColor: duration === min ? '#3498db' : '#ecf0f1',
                border: '1px solid #bdc3c7',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              {min}分
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginTop: '40px', fontSize: '14px', color: '#7f8c8d' }}>
        <p>这是一个简化的番茄钟测试页面，用于验证基本功能</p>
        <p>如果此页面正常工作，则问题可能在复杂的3D组件中</p>
      </div>
    </div>
  );
};

// 渲染测试组件
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<SimplePomodoroTest />);