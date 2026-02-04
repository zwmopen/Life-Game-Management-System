import { create } from 'zustand';
import { Habit, Project, SubTask } from '../../types';
import { INITIAL_HABITS, INITIAL_PROJECTS } from '../../constants';

interface TaskState {
  // 状态
  habits: Habit[];
  projects: Project[];
  habitOrder: string[];
  projectOrder: string[];
  givenUpTasks: string[];
  
  // 操作
  setHabits: (habits: Habit[]) => void;
  setProjects: (projects: Project[]) => void;
  setHabitOrder: (order: string[]) => void;
  setProjectOrder: (order: string[]) => void;
  addHabit: (habit: Habit) => void;
  addProject: (project: Project) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteHabit: (id: string) => void;
  deleteProject: (id: string) => void;
  toggleHabit: (id: string, dateStr: string) => void;
  toggleSubTask: (projectId: string, subTaskId: string) => void;
  reorderHabits: (order: string[]) => void;
  reorderProjects: (order: string[]) => void;
  addGivenUpTask: (taskId: string) => void;
  resetAll: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  // 初始状态
  habits: INITIAL_HABITS,
  projects: INITIAL_PROJECTS,
  habitOrder: INITIAL_HABITS.map(h => h.id),
  projectOrder: INITIAL_PROJECTS.map(p => p.id),
  givenUpTasks: [],
  
  // 操作
  setHabits: (habits) => set({ habits }),
  setProjects: (projects) => set({ projects }),
  setHabitOrder: (habitOrder) => set({ habitOrder }),
  setProjectOrder: (projectOrder) => set({ projectOrder }),
  
  addHabit: (habit) => set((state) => ({
    habits: [...state.habits, habit],
    habitOrder: [...state.habitOrder, habit.id]
  })),
  
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project],
    projectOrder: [...state.projectOrder, project.id]
  })),
  
  updateHabit: (id, updates) => set((state) => ({
    habits: state.habits.map(h => h.id === id ? { ...h, ...updates } : h)
  })),
  
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  
  deleteHabit: (id) => set((state) => ({
    habits: state.habits.filter(h => h.id !== id),
    habitOrder: state.habitOrder.filter(habitId => habitId !== id)
  })),
  
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id),
    projectOrder: state.projectOrder.filter(projectId => projectId !== id)
  })),
  
  toggleHabit: (id, dateStr) => set((state) => ({
    habits: state.habits.map(h => {
      if (h.id === id) {
        const wasDone = !!h.history[dateStr];
        const newHistory = { ...h.history };
        if (wasDone) {
          delete newHistory[dateStr];
          return { ...h, history: newHistory, streak: Math.max(0, h.streak - 1) };
        } else {
          newHistory[dateStr] = true;
          return { ...h, history: newHistory, streak: h.streak + 1 };
        }
      }
      return h;
    })
  })),
  
  toggleSubTask: (projectId, subTaskId) => set((state) => ({
    projects: state.projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          subTasks: p.subTasks.map(st => 
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
          )
        };
      }
      return p;
    })
  })),
  
  reorderHabits: (habitOrder) => set({ habitOrder }),
  
  reorderProjects: (projectOrder) => set({ projectOrder }),
  
  addGivenUpTask: (taskId) => set((state) => ({
    givenUpTasks: [...state.givenUpTasks, taskId]
  })),
  
  resetAll: () => set({
    habits: INITIAL_HABITS,
    projects: INITIAL_PROJECTS,
    habitOrder: INITIAL_HABITS.map(h => h.id),
    projectOrder: INITIAL_PROJECTS.map(p => p.id),
    givenUpTasks: []
  })
}));
