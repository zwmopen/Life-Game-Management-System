import { useState, useEffect } from 'react';
import { DiceState } from '../../types';
import { INITIAL_DICE_STATE } from '../../constants/index';

export const useDice = (isDataLoaded: boolean) => {
  const [diceState, setDiceState] = useState<DiceState>(INITIAL_DICE_STATE);

  // 加载命运骰子状态
  useEffect(() => {
    const savedDiceState = localStorage.getItem('aes-dice-state');
    if (savedDiceState) {
      try {
        const diceData = JSON.parse(savedDiceState);
        const todayStr = new Date().toLocaleDateString();
        
        // 如果是新的一天，重置次数和任务列表
        if (diceData.lastClickDate !== todayStr) {
          setDiceState(prev => ({
            ...prev,
            todayCount: 0,
            lastClickDate: todayStr,
            pendingTasks: [],
            completedTasks: []
          }));
        } else {
          // 确保新字段存在
          setDiceState({
            ...diceData,
            pendingTasks: diceData.pendingTasks || [],
            completedTasks: diceData.completedTasks || []
          });
        }
      } catch (e) {
        console.error("Dice save corrupted", e);
        setDiceState(INITIAL_DICE_STATE);
      }
    } else {
      // 首次使用，初始化骰子状态
      setDiceState(INITIAL_DICE_STATE);
    }
  }, []);

  // 保存命运骰子状态到localStorage
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('aes-dice-state', JSON.stringify(diceState));
    }
  }, [diceState, isDataLoaded]);

  return {
    diceState,
    setDiceState
  };
};
