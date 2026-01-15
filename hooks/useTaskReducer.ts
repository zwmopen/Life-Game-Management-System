import { useReducer, Reducer } from 'react';
import { Habit, Project } from '../types';

/**
 * Task state type
 */
export interface TaskState {
  habits: Habit[];
  projects: Project[];
  habitOrder: string[];
  projectOrder: string[];
}

/**
 * Task actions
 */
export type TaskAction =
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_HABIT_ORDER'; payload: string[] }
  | { type: 'SET_PROJECT_ORDER'; payload: string[] }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_HABIT'; payload: { id: string; updates: Partial<Habit> } }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'TOGGLE_HABIT'; payload: string }
  | { type: 'TOGGLE_SUBTASK'; payload: { projectId: string; subTaskId: string } }
  | { type: 'REORDER_HABITS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'REORDER_PROJECTS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'RESET_ALL'; payload: TaskState };

/**
 * Task reducer function
 */
const taskReducer: Reducer<TaskState, TaskAction> = (state, action) => {
  switch (action.type) {
    case 'SET_HABITS':
      return { ...state, habits: action.payload };
    
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    
    case 'SET_HABIT_ORDER':
      return { ...state, habitOrder: action.payload };
    
    case 'SET_PROJECT_ORDER':
      return { ...state, projectOrder: action.payload };
    
    case 'ADD_HABIT':
      return {
        ...state,
        habits: [...state.habits, action.payload],
        habitOrder: [...state.habitOrder, action.payload.id]
      };
    
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload],
        projectOrder: [...state.projectOrder, action.payload.id]
      };
    
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(h =>
          h.id === action.payload.id ? { ...h, ...action.payload.updates } : h
        )
      };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        )
      };
    
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(h => h.id !== action.payload),
        habitOrder: state.habitOrder.filter(id => id !== action.payload)
      };
    
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        projectOrder: state.projectOrder.filter(id => id !== action.payload)
      };
    
    case 'TOGGLE_HABIT': {
      const habit = state.habits.find(h => h.id === action.payload);
      if (!habit) return state;
      
      const today = new Date().toLocaleDateString();
      const completedDates = habit.completedDates || [];
      const isCompleted = completedDates.includes(today);
      
      return {
        ...state,
        habits: state.habits.map(h =>
          h.id === action.payload
            ? {
                ...h,
                completedDates: isCompleted
                  ? completedDates.filter(d => d !== today)
                  : [...completedDates, today]
              }
            : h
        )
      };
    }
    
    case 'TOGGLE_SUBTASK':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                subTasks: p.subTasks.map(st =>
                  st.id === action.payload.subTaskId
                    ? { ...st, completed: !st.completed }
                    : st
                )
              }
            : p
        )
      };
    
    case 'REORDER_HABITS': {
      const { fromIndex, toIndex } = action.payload;
      const newHabitOrder = [...state.habitOrder];
      const [removed] = newHabitOrder.splice(fromIndex, 1);
      newHabitOrder.splice(toIndex, 0, removed);
      return { ...state, habitOrder: newHabitOrder };
    }
    
    case 'REORDER_PROJECTS': {
      const { fromIndex, toIndex } = action.payload;
      const newProjectOrder = [...state.projectOrder];
      const [removed] = newProjectOrder.splice(fromIndex, 1);
      newProjectOrder.splice(toIndex, 0, removed);
      return { ...state, projectOrder: newProjectOrder };
    }
    
    case 'RESET_ALL':
      return action.payload;
    
    default:
      return state;
  }
};

/**
 * Hook for task state management using useReducer
 * @param initialState - Initial task state
 * @returns Task state and dispatch function
 */
export const useTaskReducer = (initialState: TaskState) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  
  return {
    state,
    dispatch,
    
    // Helper methods for common operations (support both direct value and callback)
    setHabits: (habitsOrFn: Habit[] | ((prev: Habit[]) => Habit[])) => {
      const newHabits = typeof habitsOrFn === 'function' ? habitsOrFn(state.habits) : habitsOrFn;
      dispatch({ type: 'SET_HABITS', payload: newHabits });
    },
    setProjects: (projectsOrFn: Project[] | ((prev: Project[]) => Project[])) => {
      const newProjects = typeof projectsOrFn === 'function' ? projectsOrFn(state.projects) : projectsOrFn;
      dispatch({ type: 'SET_PROJECTS', payload: newProjects });
    },
    setHabitOrder: (orderOrFn: string[] | ((prev: string[]) => string[])) => {
      const newOrder = typeof orderOrFn === 'function' ? orderOrFn(state.habitOrder) : orderOrFn;
      dispatch({ type: 'SET_HABIT_ORDER', payload: newOrder });
    },
    setProjectOrder: (orderOrFn: string[] | ((prev: string[]) => string[])) => {
      const newOrder = typeof orderOrFn === 'function' ? orderOrFn(state.projectOrder) : orderOrFn;
      dispatch({ type: 'SET_PROJECT_ORDER', payload: newOrder });
    },
    addHabit: (habit: Habit) => dispatch({ type: 'ADD_HABIT', payload: habit }),
    addProject: (project: Project) => dispatch({ type: 'ADD_PROJECT', payload: project }),
    updateHabit: (id: string, updates: Partial<Habit>) => 
      dispatch({ type: 'UPDATE_HABIT', payload: { id, updates } }),
    updateProject: (id: string, updates: Partial<Project>) => 
      dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates } }),
    deleteHabit: (id: string) => dispatch({ type: 'DELETE_HABIT', payload: id }),
    deleteProject: (id: string) => dispatch({ type: 'DELETE_PROJECT', payload: id }),
    toggleHabit: (id: string) => dispatch({ type: 'TOGGLE_HABIT', payload: id }),
    toggleSubTask: (projectId: string, subTaskId: string) => 
      dispatch({ type: 'TOGGLE_SUBTASK', payload: { projectId, subTaskId } }),
    reorderHabits: (fromIndex: number, toIndex: number) => 
      dispatch({ type: 'REORDER_HABITS', payload: { fromIndex, toIndex } }),
    reorderProjects: (fromIndex: number, toIndex: number) => 
      dispatch({ type: 'REORDER_PROJECTS', payload: { fromIndex, toIndex } }),
    resetAll: (newState: TaskState) => dispatch({ type: 'RESET_ALL', payload: newState })
  };
};

export default useTaskReducer;
