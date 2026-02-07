import React, { useCallback } from 'react';
import { TaskType, DiceCategory, DiceTask, Project, Habit, SubTask, AttributeTypeValue } from '../types';
import soundManager from '../utils/soundManager';

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

    const completeTask = useCallback((task: any, e: React.MouseEvent | null, settings?: { enableSoundEffects: boolean }) => {
        if (task.isGivenUp) return;
        
        // 使用统一的音效管理库播放任务完成音效
        if (!settings || settings.enableSoundEffects) {
            if (task.type === TaskType.DAILY) {
                soundManager.playSoundEffect("taskComplete"); // 日常任务完成音效
            } else if (task.type === TaskType.MAIN) {
                soundManager.playSoundEffect("mainTaskComplete"); // 主线任务完成音效
            }
        }

        if (e) {
            // 动态导入canvas-confetti以避免浏览器环境中require错误
            import('canvas-confetti').then(({ default: confetti }) => {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
                });
            }).catch(error => {
                console.error('Failed to load confetti:', error);
            });
        }

        if (task.type === TaskType.DAILY) {
            // 直接使用task对象的completed属性来获取当前状态，确保是最新的
            const isCurrentlyCompleted = !!task.completed;
            // 计算新的完成状态（取反）
            const newCompletedState = !isCurrentlyCompleted;
            // 直接更新habit的history
            onUpdateHabit(task.id, { history: { ...task.originalData.history, [todayStr]: newCompletedState } });
            // 根据任务当前状态更新奖励（完成/取消完成）
            const amount = isCurrentlyCompleted ? -task.gold : task.gold;
            const reason = isCurrentlyCompleted ? `取消完成习惯: ${task.text}` : `完成习惯: ${task.text}`;
            onUpdateBalance(amount, reason);
            onAddFloatingReward(`${amount > 0 ? '+' : ''}${amount} Gold`, amount > 0 ? "text-yellow-500" : "text-red-500", e?.clientX, e?.clientY);
        } else if (task.type === TaskType.MAIN) {
            // 直接使用task对象的completed属性来获取当前状态，确保是最新的
            const isCurrentlyCompleted = !!task.completed;
            // 计算新的完成状态（取反）
            const newStatus = isCurrentlyCompleted ? 'active' : 'completed';
            onUpdateProject(task.id, { status: newStatus });
            // 根据任务当前状态更新奖励（完成/取消完成）
            const amount = isCurrentlyCompleted ? -task.gold : task.gold;
            const reason = isCurrentlyCompleted ? `取消完成主线: ${task.text}` : `完成主线: ${task.text}`;
            onUpdateBalance(amount, reason);
            onAddFloatingReward(`${amount > 0 ? '+' : ''}${amount} Gold`, amount > 0 ? "text-yellow-500" : "text-red-500", e?.clientX, e?.clientY);
        }
    }, [onUpdateHabit, onUpdateProject, onUpdateBalance, onAddFloatingReward, todayStr]);

    const giveUpTask = useCallback((taskId: string, e: React.MouseEvent, settings?: { enableSoundEffects: boolean }) => {
        e.stopPropagation();
        
        // 使用统一的音效管理库播放任务放弃音效
        if (!settings || settings.enableSoundEffects) {
            soundManager.playSoundEffect("taskGiveUp");
        }
        
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
