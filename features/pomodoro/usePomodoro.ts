import { useState, useEffect } from 'react';

export interface PomodoroState {
  timeLeft: number;
  isActive: boolean;
  duration: number;
}

export const usePomodoro = (initialDuration: number = 25) => {
  const [state, setState] = useState<PomodoroState>({
    timeLeft: initialDuration * 60,
    isActive: false,
    duration: initialDuration
  });

  const toggleTimer = () => {
    setState(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const resetTimer = () => {
    setState(prev => ({
      ...prev,
      isActive: false,
      timeLeft: prev.duration * 60
    }));
  };

  const changeDuration = (minutes: number) => {
    setState({
      timeLeft: minutes * 60,
      isActive: false,
      duration: minutes
    });
  };

  const updateTimeLeft = (seconds: number) => {
    setState(prev => ({ ...prev, timeLeft: seconds }));
  };

  const updateIsActive = (active: boolean) => {
    setState(prev => ({ ...prev, isActive: active }));
  };

  // Pomodoro Timer Effect
  useEffect(() => {
    let interval: number;
    if (state.isActive && state.timeLeft > 0) {
      interval = window.setInterval(() => {
        setState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (state.timeLeft === 0 && state.isActive) {
      setState(prev => ({
        ...prev,
        isActive: false,
        timeLeft: prev.duration * 60
      }));
    }
    return () => clearInterval(interval);
  }, [state.isActive, state.timeLeft, state.duration]);

  return {
    pomodoroState: state,
    toggleTimer,
    resetTimer,
    changeDuration,
    updateTimeLeft,
    updateIsActive
  };
};
