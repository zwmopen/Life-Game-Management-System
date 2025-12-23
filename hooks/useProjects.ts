import { useState, useEffect } from 'react';
import { Project } from '../types';
import { INITIAL_PROJECTS } from '../constants/index';

interface UseProjectsReturn {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  projectOrder: string[];
  setProjectOrder: (order: string[]) => void;
  handleUpdateProject: (id: string, updates: Partial<Project>) => void;
}

export const useProjects = (): UseProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [projectOrder, setProjectOrder] = useState<string[]>(INITIAL_PROJECTS.map(project => project.id));

  // Load data from localStorage on mount
  useEffect(() => {
    const loadProjects = () => {
      try {
        const savedProjects = localStorage.getItem('life-game-projects');
        const savedOrder = localStorage.getItem('life-game-project-order');

        if (savedProjects) {
          setProjects(JSON.parse(savedProjects));
        }

        if (savedOrder) {
          setProjectOrder(JSON.parse(savedOrder));
        }
      } catch (error) {
        console.error('Failed to load projects data:', error);
      }
    };

    loadProjects();
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('life-game-projects', JSON.stringify(projects));
    localStorage.setItem('life-game-project-order', JSON.stringify(projectOrder));
  }, [projects, projectOrder]);

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const updatedProject = { ...p, ...updates };
        if (updates.subTasks) {
          // Check if any sub-task status changed from incomplete to complete
          const prevCompletedSubTasks = p.subTasks.filter(t => t.completed).length;
          const newCompletedSubTasks = updatedProject.subTasks.filter(t => t.completed).length;
          const newlyCompletedCount = Math.max(0, newCompletedSubTasks - prevCompletedSubTasks);

          // If all sub-tasks are completed, mark the project as completed
          const allDone = updatedProject.subTasks.length > 0 && updatedProject.subTasks.every(t => t.completed);
          if (allDone && p.status !== 'completed') {
            updatedProject.status = 'completed';
          }

          return updatedProject;
        }
        return updatedProject;
      }
      return p;
    }));
  };

  return {
    projects,
    setProjects,
    projectOrder,
    setProjectOrder,
    handleUpdateProject
  };
};
