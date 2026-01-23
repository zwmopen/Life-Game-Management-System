/**
 * 命运骰子Reducer Hook
 * 使用useReducer统一管理骰子状态，优化状态管理
 */

import { useReducer, useCallback, useEffect } from 'react';
import { DiceState, DiceTask, DiceCategory, DiceTaskRecord } from '../types';
import { INITIAL_DICE_STATE } from '../constants/index';
import soundManagerOptimized from '../utils/soundManagerOptimized';

// 定义骰子状态Action类型
type DiceAction =
  | { type: 'SET_DICE_STATE'; payload: DiceState }
  | { type: 'SPIN_DICE' }
  | { type: 'FINISH_SPIN'; payload: DiceTask }
  | { type: 'RESET_DAILY'; payload: { todayStr: string } }
  | { type: 'ADD_TASK'; payload: DiceTask }
  | { type: 'DELETE_TASK'; payload: { taskId: string; category: DiceCategory } }
  | { type: 'UPDATE_TASK'; payload: { taskId: string; category: DiceCategory; updates: Partial<DiceTask> } }
  | { type: 'UPDATE_CONFIG'; payload: Partial<DiceState['config']> }
  | { type: 'ADD_PENDING_TASK'; payload: DiceTaskRecord }
  | { type: 'COMPLETE_TASK'; payload: string }
  | { type: 'ABANDON_TASK'; payload: string }
  | { type: 'UPDATE_PARTIAL'; payload: Partial<DiceState> };

// Reducer函数
const diceReducer = (state: DiceState, action: DiceAction): DiceState => {
  switch (action.type) {
    case 'SET_DICE_STATE':
      return action.payload;

    case 'SPIN_DICE':
      return {
        ...state,
        todayCount: state.todayCount + 1,
        isSpinning: true
      };

    case 'FINISH_SPIN':
      return {
        ...state,
        isSpinning: false,
        currentResult: action.payload
      };

    case 'RESET_DAILY':
      return {
        ...state,
        todayCount: 0,
        lastClickDate: action.payload.todayStr,
        pendingTasks: [],
        completedTasks: []
      };

    case 'ADD_TASK':
      return {
        ...state,
        taskPool: {
          ...state.taskPool,
          [action.payload.category]: [
            ...state.taskPool[action.payload.category],
            action.payload
          ]
        }
      };

    case 'DELETE_TASK':
      return {
        ...state,
        taskPool: {
          ...state.taskPool,
          [action.payload.category]: state.taskPool[action.payload.category].filter(
            task => task.id !== action.payload.taskId
          )
        }
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        taskPool: {
          ...state.taskPool,
          [action.payload.category]: state.taskPool[action.payload.category].map(task =>
            task.id === action.payload.taskId
              ? { ...task, ...action.payload.updates }
              : task
          )
        }
      };

    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload
        }
      };

    case 'ADD_PENDING_TASK':
      return {
        ...state,
        pendingTasks: [...state.pendingTasks, action.payload]
      };

    case 'COMPLETE_TASK': {
      const taskToComplete = state.pendingTasks.find(t => t.id === action.payload);
      if (!taskToComplete) return state;

      return {
        ...state,
        pendingTasks: state.pendingTasks.filter(t => t.id !== action.payload),
        completedTasks: [
          ...state.completedTasks,
          {
            ...taskToComplete,
            status: 'completed' as const,
            completedAt: new Date().toISOString()
          }
        ]
      };
    }

    case 'ABANDON_TASK':
      return {
        ...state,
        pendingTasks: state.pendingTasks.filter(t => t.id !== action.payload)
      };

    case 'UPDATE_PARTIAL':
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
};

/**
 * 命运骰子Reducer Hook
 * @param isDataLoaded 数据是否已加载
 * @returns 骰子状态和操作函数
 */
export const useDiceReducer = (isDataLoaded: boolean) => {
  const [state, dispatch] = useReducer(diceReducer, INITIAL_DICE_STATE);

  // 从localStorage加载骰子状态
  useEffect(() => {
    if (!isDataLoaded) return;

    const savedDiceState = localStorage.getItem('aes-dice-state');
    if (savedDiceState) {
      try {
        const diceData = JSON.parse(savedDiceState);
        const todayStr = new Date().toLocaleDateString();

        // 如果是新的一天，重置次数和任务列表
        if (diceData.lastClickDate !== todayStr) {
          dispatch({
            type: 'RESET_DAILY',
            payload: { todayStr }
          });
          // 保持其他状态（taskPool、config等）
          dispatch({
            type: 'UPDATE_PARTIAL',
            payload: {
              taskPool: diceData.taskPool || INITIAL_DICE_STATE.taskPool,
              config: diceData.config || INITIAL_DICE_STATE.config,
              history: diceData.history || []
            }
          });
        } else {
          // 加载完整状态
          dispatch({
            type: 'SET_DICE_STATE',
            payload: {
              ...diceData,
              pendingTasks: diceData.pendingTasks || [],
              completedTasks: diceData.completedTasks || []
            }
          });
        }
      } catch (e) {
        console.error('Dice save corrupted', e);
        dispatch({
          type: 'SET_DICE_STATE',
          payload: INITIAL_DICE_STATE
        });
      }
    }
  }, [isDataLoaded]);

  // 保存骰子状态到localStorage
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('aes-dice-state', JSON.stringify(state));
    }
  }, [state, isDataLoaded]);

  // Helper函数：掷骰子
  const spinDice = useCallback(() => {
    if (state.todayCount >= state.config.dailyLimit) {
      return { success: false, message: '今日次数已达上限' };
    }

    dispatch({ type: 'SPIN_DICE' });
    return { success: true };
  }, [state.todayCount, state.config.dailyLimit]);

  // Helper函数：完成掷骰子
  const finishSpin = useCallback((result: DiceTask) => {
    dispatch({ type: 'FINISH_SPIN', payload: result });
  }, []);

  // Helper函数：添加任务
  const addTask = useCallback((task: DiceTask) => {
    dispatch({ type: 'ADD_TASK', payload: task });
  }, []);

  // Helper函数：删除任务
  const deleteTask = useCallback((taskId: string, category: DiceCategory) => {
    dispatch({ type: 'DELETE_TASK', payload: { taskId, category } });
  }, []);

  // Helper函数：更新任务
  const updateTask = useCallback((taskId: string, category: DiceCategory, updates: Partial<DiceTask>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { taskId, category, updates } });
  }, []);

  // Helper函数：更新配置
  const updateConfig = useCallback((config: Partial<DiceState['config']>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
  }, []);

  // Helper函数：添加待处理任务
  const addPendingTask = useCallback((task: DiceTaskRecord) => {
    dispatch({ type: 'ADD_PENDING_TASK', payload: task });
  }, []);

  // Helper函数：完成任务
  const completeTask = useCallback((taskId: string) => {
    // 播放命运任务完成音效
    soundManagerOptimized.playSoundEffect("taskComplete");
    dispatch({ type: 'COMPLETE_TASK', payload: taskId });
  }, []);

  // Helper函数：放弃任务
  const abandonTask = useCallback((taskId: string) => {
    dispatch({ type: 'ABANDON_TASK', payload: taskId });
  }, []);

  // Helper函数：部分更新状态
  const updatePartial = useCallback((updates: Partial<DiceState>) => {
    dispatch({ type: 'UPDATE_PARTIAL', payload: updates });
  }, []);

  return {
    state,
    dispatch,
    // Helper函数
    spinDice,
    finishSpin,
    addTask,
    deleteTask,
    updateTask,
    updateConfig,
    addPendingTask,
    completeTask,
    abandonTask,
    updatePartial
  };
};

export default useDiceReducer;
