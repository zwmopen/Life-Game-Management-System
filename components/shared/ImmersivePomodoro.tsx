import React, { useEffect, useRef, useState } from 'react';
import { Theme } from '../../types';

interface ImmersivePomodoroProps {
  theme: Theme;
  timeLeft: number;
  isActive: boolean;
  duration: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onUpdateTimeLeft: (seconds: number) => void;
  onUpdateIsActive: (active: boolean) => void;
  onExitImmersive: () => void;
  totalPlants: number;
  todayPlants: number;
  // 新增参数用于同步背景音乐状态
  isMuted: boolean;
  currentSoundId: string;
}

const ImmersivePomodoro: React.FC<ImmersivePomodoroProps> = ({ 
  onExitImmersive,
  totalPlants,
  todayPlants,
  timeLeft,
  isActive,
  duration,
  onUpdateTimeLeft,
  onUpdateIsActive,
  isMuted,
  currentSoundId,
  theme
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  // 向iframe发送消息，同步状态
  const sendMessageToIframe = (message: any) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(message, '*');
      } catch (error) {
        console.error('Failed to send message to iframe:', error);
      }
    }
  };

  // 初始化iframe并设置事件监听
  useEffect(() => {
    // Handle messages from iframe
    const handleMessage = (event: MessageEvent) => {
      try {
        if (event.data === 'exitImmersive') {
          onExitImmersive();
        } else if (event.data.type === 'timerUpdate') {
          // 从iframe接收计时更新
          onUpdateTimeLeft(event.data.timeLeft);
          onUpdateIsActive(event.data.isActive);
        } else if (event.data.type === 'durationUpdate') {
          // 从iframe接收预设时间更新
          // 这里可以添加处理预设时间变化的逻辑
        }
      } catch (error) {
        console.error('Failed to handle message from iframe:', error);
      }
    };

    window.addEventListener('message', handleMessage);

    // Set iframe src to the external HTML file - only once on mount
    if (iframeRef.current && !iframeRef.current.src) {
      // 确保duration是数字
      const safeDuration = typeof duration === 'number' ? duration : 25;
      // Pass initial data as URL parameters - duration转换为秒
      const durationInSeconds = safeDuration * 60;
      const timeLeftSeconds = typeof timeLeft === 'number' ? timeLeft : durationInSeconds;
      
      iframeRef.current.src = `/immersive-pomodoro.html?total=${totalPlants}&today=${todayPlants}&timeLeft=${timeLeftSeconds}&isActive=${isActive}&duration=${durationInSeconds}&isMuted=${isMuted}&currentSoundId=${currentSoundId}&theme=${theme}`;
      
      // 监听iframe加载完成事件
      iframeRef.current.onload = () => {
        setIsIframeLoaded(true);
      };
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onExitImmersive, totalPlants, todayPlants, duration, isMuted, currentSoundId, onUpdateTimeLeft, onUpdateIsActive]);

  // 当外部状态变化时，同步到iframe
  useEffect(() => {
    if (!isIframeLoaded) return;
    
    // 确保duration是数字
    const safeDuration = typeof duration === 'number' ? duration : 25;
    // duration参数需要转换为秒，因为immersive-pomodoro.html中使用秒作为单位
    const durationInSeconds = safeDuration * 60;
    const timeLeftSeconds = typeof timeLeft === 'number' ? timeLeft : durationInSeconds;
    
    // 发送syncState消息，同步状态到iframe
    sendMessageToIframe({
      type: 'syncState',
      timeLeft: timeLeftSeconds,
      isActive,
      duration: durationInSeconds,
      isMuted,
      currentSoundId,
      theme
    });
  }, [isIframeLoaded, isActive, timeLeft, duration, isMuted, currentSoundId, theme]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center">
      {/* 加载状态：显示渐变背景和加载指示器 */}
      {!isIframeLoaded && (
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-white text-xl font-medium">正在进入沉浸式模式...</p>
        </div>
      )}
      {/* iframe：加载完成后显示 */}
      <iframe
        ref={iframeRef}
        title="Immersive Pomodoro"
        className={`w-full h-full border-0 transition-opacity duration-500 ${isIframeLoaded ? 'opacity-100' : 'opacity-0'}`}
        sandbox="allow-scripts allow-same-origin allow-popups"
        loading="eager"
      />
    </div>
  );
};

export default ImmersivePomodoro;
