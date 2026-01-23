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
            onUpdateHabit(task.id, {
                history: { ...task.history, [todayStr]: true }
            });
            onUpdateBalance(task.gold, `完成习惯: ${task.text}`);
            onAddFloatingReward(`+${task.gold} Gold`, "text-yellow-500", e?.clientX, e?.clientY);
        } else if (task.type === TaskType.MAIN) {
            onUpdateProject(task.id, { status: 'completed' });
            onUpdateBalance(task.gold, `完成主线: ${task.text}`);
            onAddFloatingReward(`+${task.gold} Gold`, "text-yellow-500", e?.clientX, e?.clientY);
        }
    }, [onUpdateHabit, onUpdateProject, onUpdateBalance, onAddFloatingReward, todayStr]);

    const giveUpTask = useCallback((task: any) => {
        if (task.completed || task.isGivenUp) return;

        // 使用统一的音效管理库播放任务放弃音效
        soundManagerOptimized.playSoundEffect("taskGiveUp");

        if (onSpinDice) {
            setTimeout(() => {
                const result = onSpinDice();
                if (!result.success && result.message) {
                    onAddFloatingReward(result.message, 'text-red-500');
                }
            }, 300);
        }
    }, [onSpinDice, onAddFloatingReward]);

    return {
        completeTask,
        giveUpTask
    };
};
