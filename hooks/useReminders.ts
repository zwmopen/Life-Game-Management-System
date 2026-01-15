import { useState, useEffect, useCallback } from 'react';
import { Habit, Project } from '../types';

interface ReminderInfo {
  title: string;
  id: string;
  type: 'habit' | 'project';
}

export const useReminders = (
  habits: Habit[],
  projects: Project[],
  onUpdateHabit: (id: string, updates: Partial<Habit>) => void,
  onUpdateProject: (id: string, updates: Partial<Project>) => void
) => {
  const [activeReminder, setActiveReminder] = useState<ReminderInfo | null>(null);

  const checkReminders = useCallback(() => {
    const now = new Date();
    const currentDayStr = now.toLocaleDateString('zh-CN');
    const currentDateISO = now.toISOString().split('T')[0];
    const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    const triggerReminder = (title: string, id: string, type: 'habit' | 'project', reminder: any) => {
      const lastTriggeredDate = reminder.lastTriggered ? new Date(reminder.lastTriggered) : null;
      const minutesSinceLast = lastTriggeredDate ? (now.getTime() - lastTriggeredDate.getTime()) / (1000 * 60) : 9999;
      
      if (minutesSinceLast > 1) {
        setActiveReminder({ title, id, type });
        
        const newReminder = {
          ...reminder,
          lastTriggered: now.toISOString()
        };

        if (type === 'habit') {
          onUpdateHabit(id, { reminder: newReminder });
        } else {
          onUpdateProject(id, { reminder: newReminder });
        }
      }
    };

    // Check habits
    habits.forEach(habit => {
      if (habit.reminder?.enabled && habit.reminder.time === currentTimeStr) {
        const { date, repeat } = habit.reminder;
        
        if (repeat === 'none') {
          if (date === currentDateISO) triggerReminder(habit.name, habit.id, 'habit', habit.reminder);
        } else if (repeat === 'daily') {
          triggerReminder(habit.name, habit.id, 'habit', habit.reminder);
        } else if (repeat === 'weekly') {
          const reminderDate = date ? new Date(date) : null;
          if (reminderDate && reminderDate.getDay() === now.getDay()) triggerReminder(habit.name, habit.id, 'habit', habit.reminder);
        } else if (repeat === 'monthly') {
          const reminderDate = date ? new Date(date) : null;
          if (reminderDate && reminderDate.getDate() === now.getDate()) triggerReminder(habit.name, habit.id, 'habit', habit.reminder);
        }
      }
    });

    // Check projects
    projects.forEach(project => {
      const reminder = (project as any).reminder;
      if (reminder?.enabled && reminder.time === currentTimeStr) {
        const { date, repeat } = reminder;
        
        if (repeat === 'none') {
          if (date === currentDateISO) triggerReminder(project.name, project.id, 'project', reminder);
        } else if (repeat === 'daily') {
          triggerReminder(project.name, project.id, 'project', reminder);
        } else if (repeat === 'weekly') {
          const rDate = date ? new Date(date) : null;
          if (rDate && rDate.getDay() === now.getDay()) triggerReminder(project.name, project.id, 'project', reminder);
        } else if (repeat === 'monthly') {
          const rDate = date ? new Date(date) : null;
          if (rDate && rDate.getDate() === now.getDate()) triggerReminder(project.name, project.id, 'project', reminder);
        }
      }
    });
  }, [habits, projects, onUpdateHabit, onUpdateProject]);

  useEffect(() => {
    const timer = setInterval(checkReminders, 15000);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkReminders();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkReminders]);

  return {
    activeReminder,
    setActiveReminder,
    checkReminders
  };
};
