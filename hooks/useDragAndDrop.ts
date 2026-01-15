import React, { useState } from 'react';
import { TaskType } from '../types';

interface UseDragAndDropProps {
  habitOrder: string[];
  projectOrder: string[];
  onUpdateHabitOrder?: (newOrder: string[]) => void;
  onUpdateProjectOrder?: (newOrder: string[]) => void;
}

/**
 * 自定义 Hook 处理任务拖拽重排序逻辑
 */
export const useDragAndDrop = ({
  habitOrder,
  projectOrder,
  onUpdateHabitOrder,
  onUpdateProjectOrder,
}: UseDragAndDropProps) => {
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null);

  /**
   * 拖拽开始处理器
   * @param task 被拖拽的任务对象
   * @param index 任务在当前列表中的索引
   */
  const handleDragStart = (task: any, index: number) => {
    setDraggedTask(task);
    setDraggedTaskIndex(index);
  };

  /**
   * 拖拽结束处理器
   */
  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedTaskIndex(null);
  };

  /**
   * 拖拽悬停处理器，负责实时重排序
   * @param e 拖拽事件
   * @param targetIndex 目标位置索引
   */
  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedTaskIndex === null || draggedTaskIndex === targetIndex || !draggedTask) return;

    if (draggedTask.type === TaskType.DAILY && onUpdateHabitOrder) {
      // 处理习惯任务重排序
      const newOrder = [...habitOrder];
      const [draggedId] = newOrder.splice(draggedTaskIndex, 1);
      newOrder.splice(targetIndex, 0, draggedId);
      onUpdateHabitOrder(newOrder);
      setDraggedTaskIndex(targetIndex);
    } else if (draggedTask.type === TaskType.MAIN && onUpdateProjectOrder) {
      // 处理主线任务重排序
      const newOrder = [...projectOrder];
      const [draggedId] = newOrder.splice(draggedTaskIndex, 1);
      newOrder.splice(targetIndex, 0, draggedId);
      onUpdateProjectOrder(newOrder);
      setDraggedTaskIndex(targetIndex);
    }
  };

  return {
    draggedTask,
    draggedTaskIndex,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  };
};
