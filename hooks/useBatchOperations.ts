/**
 * 批量操作Hook
 * 提供任务批量操作功能
 */

import { useCallback, useState } from 'react';
import { Habit, Project } from '../types';

interface BatchOperationsHook {
  // 选中的任务ID列表
  selectedTaskIds: string[];
  // 是否处于批量操作模式
  isBatchMode: boolean;
  // 切换批量操作模式
  toggleBatchMode: () => void;
  // 选择/取消选择任务
  toggleTaskSelection: (taskId: string) => void;
  // 全选/取消全选
  toggleSelectAll: (taskIds: string[]) => void;
  // 清空选择
  clearSelection: () => void;
  // 批量删除任务
  batchDeleteTasks: (onDelete: (taskId: string) => void) => void;
  // 批量归档任务
  batchArchiveTasks: (tasks: (Habit | Project)[], onArchive: (taskId: string) => void) => void;
  // 批量移动任务到分类
  batchMoveToCategory: (category: string, onMove: (taskId: string, category: string) => void) => void;
  // 检查任务是否被选中
  isTaskSelected: (taskId: string) => boolean;
  // 获取选中任务数量
  getSelectedCount: () => number;
}

export const useBatchOperations = (): BatchOperationsHook => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  // 切换批量操作模式
  const toggleBatchMode = useCallback(() => {
    setIsBatchMode(prev => !prev);
    if (isBatchMode) {
      // 退出批量模式时清空选择
      setSelectedTaskIds([]);
    }
  }, [isBatchMode]);

  // 选择/取消选择任务
  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTaskIds(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  }, []);

  // 全选/取消全选
  const toggleSelectAll = useCallback((taskIds: string[]) => {
    setSelectedTaskIds(prev => {
      if (prev.length === taskIds.length) {
        // 全部选中则取消全选
        return [];
      } else {
        // 否则全选
        return taskIds;
      }
    });
  }, []);

  // 清空选择
  const clearSelection = useCallback(() => {
    setSelectedTaskIds([]);
  }, []);

  // 批量删除任务
  const batchDeleteTasks = useCallback((onDelete: (taskId: string) => void) => {
    selectedTaskIds.forEach(taskId => {
      onDelete(taskId);
    });
    setSelectedTaskIds([]);
  }, [selectedTaskIds]);

  // 批量归档任务
  const batchArchiveTasks = useCallback((
    tasks: (Habit | Project)[],
    onArchive: (taskId: string) => void
  ) => {
    selectedTaskIds.forEach(taskId => {
      const task = tasks.find(t => t.id === taskId);
      if (task && !('archived' in task && task.archived)) {
        onArchive(taskId);
      }
    });
    setSelectedTaskIds([]);
  }, [selectedTaskIds]);

  // 批量移动任务到分类
  const batchMoveToCategory = useCallback((
    category: string,
    onMove: (taskId: string, category: string) => void
  ) => {
    selectedTaskIds.forEach(taskId => {
      onMove(taskId, category);
    });
    setSelectedTaskIds([]);
  }, [selectedTaskIds]);

  // 检查任务是否被选中
  const isTaskSelected = useCallback((taskId: string) => {
    return selectedTaskIds.includes(taskId);
  }, [selectedTaskIds]);

  // 获取选中任务数量
  const getSelectedCount = useCallback(() => {
    return selectedTaskIds.length;
  }, [selectedTaskIds]);

  return {
    selectedTaskIds,
    isBatchMode,
    toggleBatchMode,
    toggleTaskSelection,
    toggleSelectAll,
    clearSelection,
    batchDeleteTasks,
    batchArchiveTasks,
    batchMoveToCategory,
    isTaskSelected,
    getSelectedCount
  };
};

export default useBatchOperations;
