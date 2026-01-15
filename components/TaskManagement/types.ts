/**
 * 任务管理组件的类型定义文件
 * 用于统一管理任务相关的接口和类型
 */

import React from 'react';
import { Habit, Project, TaskType } from '../../types';

/**
 * 任务项接口 - 统一的任务数据结构
 */
export interface TaskItem {
  id: string;
  text: string;
  attr: string;
  xp: number;
  gold: number;
  duration: number;
  type: TaskType;
  completed: boolean;
  frequency: 'daily' | 'once';
  originalData?: Habit | Project;
  isGivenUp?: boolean;
  subTasks?: SubTaskItem[];
  isExpanded?: boolean;
  reminder?: {
    enabled: boolean;
    date?: string;
    time?: string;
    repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
    repeatInterval?: number;
  };
}

/**
 * 子任务项接口
 */
export interface SubTaskItem {
  id: string;
  text: string;
  completed: boolean;
  xp: number;
  gold: number;
  duration: number;
  isGivenUp?: boolean;
}

/**
 * 命运骰子任务记录接口
 */
export interface DiceTaskRecord {
  id: string;
  task: {
    text: string;
    gold: number;
    xp: number;
    duration?: number;
    attr?: string;
  };
  generatedXp: number;
  generatedGold: number;
  status: 'pending' | 'completed' | 'abandoned';
  createdAt: string;
  completedAt?: string;
  abandonedAt?: string;
}

/**
 * 任务管理组件的Props接口
 */
export interface TaskManagementProps {
  // 任务数据
  habitTasks: TaskItem[];
  projectTasks: TaskItem[];
  diceState: any; // DiceState类型
  
  // 原始数据（用于统计）
  habits?: Habit[];
  projects?: Project[];
  
  // 任务分类
  taskCategory: 'daily' | 'main' | 'random';
  setTaskCategory: (category: 'daily' | 'main' | 'random') => void;
  
  // 任务操作回调
  onCompleteTask: (task: TaskItem, e: React.MouseEvent | null) => void;
  onGiveUpTask: (taskId: string, e: React.MouseEvent) => void;
  onOpenEditTask: (task: TaskItem) => void;
  onToggleSubTask: (projectId: string, subTaskId: string) => void;
  onGiveUpSubTask: (projectId: string, subTaskId: string) => void;
  onStartTimer: (duration: number) => void;
  
  // 拖拽排序回调
  onDragStart: (task: TaskItem, index: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  draggedTask: TaskItem | null;
  
  // 命运骰子回调
  onSpinDice?: () => { success: boolean; message?: string };
  onUpdateDiceState?: (updates: any) => void;
  onDiceResult?: (result: 'completed' | 'later' | 'skipped') => void;
  onChangeDuration?: (duration: number) => void;
  onToggleTimer?: () => void;
  onAddFloatingReward: (text: string, color: string, x?: number, y?: number) => void;
  
  // 主题样式
  theme: string;
  cardBg: string;
  textMain: string;
  textSub: string;
  isDark: boolean;
  isNeomorphic: boolean;
  
  // 帮助系统
  onShowHelp?: (helpId: string) => void;
  
  // 任务管理
  onAddTask?: () => void;
  
  // 其他
  todayStr: string;
  setIsImmersive?: (value: boolean) => void;
}

/**
 * 任务添加/编辑表单Props接口
 */
export interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTaskId: string | null;
  taskType: 'daily' | 'main' | 'random';
  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;
  newTaskReward: string;
  setNewTaskReward: (value: string) => void;
  newTaskXP: string;
  setNewTaskXP: (value: string) => void;
  newTaskDuration: string;
  setNewTaskDuration: (value: string) => void;
  newTaskAttr: string;
  setNewTaskAttr: (value: string) => void;
  editingProjectSubTasks: SubTaskItem[];
  setEditingProjectSubTasks: (tasks: SubTaskItem[]) => void;
  onSave: () => void;
  onAddNew: () => void;
  theme: string;
  isDark: boolean;
  isNeomorphic: boolean;
}
