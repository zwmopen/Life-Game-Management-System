import React, { useCallback } from 'react';
import { TaskType, DiceCategory, DiceTask, Project, Habit, SubTask, AttributeTypeValue } from '../types';

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
        
        const completeSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3");
        completeSound.volume = 0.5;
        completeSound.play().catch(() => {});

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
                history: { ...task.originalData.history, [todayStr]: true }
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

        const giveUpSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-interface-error-beep-221.mp3");
        giveUpSound.volume = 0.5;
        giveUpSound.play().catch(() => {});

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
