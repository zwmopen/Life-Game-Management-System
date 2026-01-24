import React, { useCallback } from 'react';
import { TaskType, DiceCategory, DiceTask, Project, Habit, SubTask, AttributeTypeValue } from '../types';
import soundManagerOptimized from '../utils/soundManagerOptimized';

interface UseTaskOperationsProps {
    onUpdateHabit: (id: string, updates: Partial<Habit>) => void;
    onUpdateProject: (id: string, updates: Partial<Project>) => void;
    onAddHabit: (name: string, reward: number) => void;
    onAddProject: (project: Project) => void;
    onDeleteHabit: (id: string) => void;
    onDeleteProject: (id: string) => void;
    onUpdateBalance: (amount: number, reason: string) => void;
    onAddFloatingReward: (text: string, color: string, x?: number, y?: number) => void;
    onSpinDice?: () => { success: boolean; message?: string };
    onGiveUpTask?: (taskId: string) => void;
    setChallengePool: React.Dispatch<React.SetStateAction<string[]>>;
    projects: Project[];
    habits: Habit[];
    todayStr: string;
    givenUpTasks: string[];
}

export const useTaskOperations = ({
    onUpdateHabit,
    onUpdateProject,
    onAddHabit,
    onAddProject,
    onDeleteHabit,
    onDeleteProject,
    onUpdateBalance,
    onAddFloatingReward,
    onSpinDice,
    onGiveUpTask,
    setChallengePool,
    projects,
    habits,
    todayStr,
    givenUpTasks
}: UseTaskOperationsProps) => {

    const completeTask = useCallback((task: any, e: React.MouseEvent | null) => {
        if (task.isGivenUp) return;
        
        // 使用统一的音效管理库播放任务完成音效
        if (task.type === TaskType.DAILY) {
            soundManagerOptimized.playSoundEffect("taskComplete"); // 日常任务完成音效
        } else if (task.type === TaskType.MAIN) {
            soundManagerOptimized.playSoundEffect("mainTaskComplete"); // 主线任务完成音效
        }

        if (e) {
            const { confetti } = require('canvas-confetti');
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
            });
        }

        if (task.type === TaskType.DAILY) {
            // 获取最新的habit数据，确保history属性是最新的
            const currentHabit = habits.find(h => h.id === task.id);
            onUpdateHabit(task.id, {
                history: { ...currentHabit?.history, [todayStr]: true }
            });
            onUpdateBalance(task.gold, `完成习惯: ${task.text}`);
            onAddFloatingReward(`+${task.gold} Gold`, "text-yellow-500", e?.clientX, e?.clientY);
        } else if (task.type === TaskType.MAIN) {
            onUpdateProject(task.id, { status: 'completed' });
            onUpdateBalance(task.gold, `完成主线: ${task.text}`);
            onAddFloatingReward(`+${task.gold} Gold`, "text-yellow-500", e?.clientX, e?.clientY);
        }
    }, [onUpdateHabit, onUpdateProject, onUpdateBalance, onAddFloatingReward, todayStr, habits]);

    const giveUpTask = useCallback((taskId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        
        // 使用统一的音效管理库播放任务放弃音效
        soundManagerOptimized.playSoundEffect("taskGiveUp");
        
        // 调用传入的 onGiveUpTask 函数更新 givenUpTasks 状态
        if (onGiveUpTask) {
            onGiveUpTask(taskId);
        }
    }, [onGiveUpTask]);

    return {
        completeTask,
        giveUpTask
    };
};
