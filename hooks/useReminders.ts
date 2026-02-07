import { useState, useEffect, useCallback } from 'react';
import { Habit, Project } from '../types';
import soundManager from '../utils/soundManager';

interface ReminderInfo {
  title: string;
  id: string;
  type: 'habit' | 'project';
  priority?: 'high' | 'medium' | 'low';
  duration?: number;
  reminderTemplate?: string;
}

interface ReminderSettings {
  enableBrowserNotifications: boolean;
  enableSoundNotifications: boolean;
  enableEmailNotifications: boolean;
  reminderTemplates: {
    high: string;
    medium: string;
    low: string;
  };
}

export const useReminders = (
  habits: Habit[],
  projects: Project[],
  onUpdateHabit: (id: string, updates: Partial<Habit>) => void,
  onUpdateProject: (id: string, updates: Partial<Project>) => void
) => {
  const [activeReminder, setActiveReminder] = useState<ReminderInfo | null>(null);
  const [reminderHistory, setReminderHistory] = useState<ReminderInfo[]>([]);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enableBrowserNotifications: true,
    enableSoundNotifications: true,
    enableEmailNotifications: false,
    reminderTemplates: {
      high: '🔔 重要提醒：{title} 时间到了！请立即开始行动！',
      medium: '⏰ 提醒：{title} 时间到了，请准备开始。',
      low: '📅 提示：{title} 已到时间，记得完成。'
    }
  });

  // 检查浏览器通知权限
  const checkNotificationPermission = useCallback(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // 发送浏览器通知
  const sendBrowserNotification = useCallback((title: string, message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }, []);

  // 生成提醒消息
  const generateReminderMessage = useCallback((title: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    const template = reminderSettings.reminderTemplates[priority];
    return template.replace('{title}', title);
  }, [reminderSettings.reminderTemplates]);

  // 触发提醒
  const triggerReminder = useCallback((title: string, id: string, type: 'habit' | 'project', reminder: any, priority: 'high' | 'medium' | 'low' = 'medium', duration?: number) => {
    const now = new Date();
    const lastTriggeredDate = reminder.lastTriggered ? new Date(reminder.lastTriggered) : null;
    const minutesSinceLast = lastTriggeredDate ? (now.getTime() - lastTriggeredDate.getTime()) / (1000 * 60) : 9999;
    
    if (minutesSinceLast > 1) {
      // 生成提醒消息
      const reminderMessage = generateReminderMessage(title, priority);
      
      // 播放任务提醒音效
      if (reminderSettings.enableSoundNotifications) {
        soundManager.playSoundEffect('notification');
      }
      
      // 发送浏览器通知
      if (reminderSettings.enableBrowserNotifications) {
        sendBrowserNotification('任务提醒', reminderMessage);
      }
      
      // 设置活动提醒
      const reminderInfo: ReminderInfo = {
        title,
        id,
        type,
        priority,
        duration,
        reminderTemplate: reminderMessage
      };
      
      setActiveReminder(reminderInfo);
      
      // 添加到提醒历史
      setReminderHistory(prev => [reminderInfo, ...prev].slice(0, 50));
      
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
  }, [reminderSettings, generateReminderMessage, sendBrowserNotification, onUpdateHabit, onUpdateProject]);

  // 智能提醒检查
  const checkReminders = useCallback(() => {
    const now = new Date();
    const currentDayStr = now.toLocaleDateString('zh-CN');
    const currentDateISO = now.toISOString().split('T')[0];
    const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    // 检查习惯任务
    habits.forEach(habit => {
      if (habit.reminder?.enabled && habit.reminder.time === currentTimeStr) {
        const { date, repeat } = habit.reminder;
        
        if (repeat === 'none') {
          if (date === currentDateISO) triggerReminder(habit.name, habit.id, 'habit', habit.reminder, habit.priority);
        } else if (repeat === 'daily') {
          triggerReminder(habit.name, habit.id, 'habit', habit.reminder, habit.priority);
        } else if (repeat === 'weekly') {
          const reminderDate = date ? new Date(date) : null;
          if (reminderDate && reminderDate.getDay() === now.getDay()) triggerReminder(habit.name, habit.id, 'habit', habit.reminder, habit.priority);
        } else if (repeat === 'monthly') {
          const reminderDate = date ? new Date(date) : null;
          if (reminderDate && reminderDate.getDate() === now.getDate()) triggerReminder(habit.name, habit.id, 'habit', habit.reminder, habit.priority);
        }
      }
    });

    // 检查项目任务
    projects.forEach(project => {
      const reminder = (project as any).reminder;
      if (reminder?.enabled && reminder.time === currentTimeStr) {
        const { date, repeat } = reminder;
        
        if (repeat === 'none') {
          if (date === currentDateISO) triggerReminder(project.name, project.id, 'project', reminder, project.priority, project.duration);
        } else if (repeat === 'daily') {
          triggerReminder(project.name, project.id, 'project', reminder, project.priority, project.duration);
        } else if (repeat === 'weekly') {
          const rDate = date ? new Date(date) : null;
          if (rDate && rDate.getDay() === now.getDay()) triggerReminder(project.name, project.id, 'project', reminder, project.priority, project.duration);
        } else if (repeat === 'monthly') {
          const rDate = date ? new Date(date) : null;
          if (rDate && rDate.getDate() === now.getDate()) triggerReminder(project.name, project.id, 'project', reminder, project.priority, project.duration);
        }
      }
    });
  }, [habits, projects, triggerReminder]);

  // 智能提醒：基于任务优先级调整提醒频率
  const checkSmartReminders = useCallback(() => {
    const now = new Date();
    const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    // 检查即将到期的高优先级任务
    const checkUpcomingTasks = (tasks: any[], type: 'habit' | 'project') => {
      tasks.forEach(task => {
        if (!task.reminder?.enabled || task.completed) return;
        
        const { date, time } = task.reminder;
        if (!date || !time) return;
        
        const reminderDateTime = new Date(`${date}T${time}`);
        const timeUntilReminder = reminderDateTime.getTime() - now.getTime();
        const hoursUntilReminder = timeUntilReminder / (1000 * 60 * 60);
        
        // 对于高优先级任务，提前1小时发送提醒
        if (task.priority === 'high' && hoursUntilReminder > 0 && hoursUntilReminder <= 1) {
          const lastPreReminder = task.reminder.lastPreReminder ? new Date(task.reminder.lastPreReminder) : null;
          const hoursSinceLastPreReminder = lastPreReminder ? (now.getTime() - lastPreReminder.getTime()) / (1000 * 60 * 60) : 9999;
          
          if (hoursSinceLastPreReminder > 1) {
            const reminderMessage = `⚠️ 提前提醒：高优先级任务 "${task.name || task.text}" 将在1小时后到期，请做好准备！`;
            
            if (reminderSettings.enableSoundNotifications) {
              soundManager.playSoundEffect('notification');
            }
            
            if (reminderSettings.enableBrowserNotifications) {
              sendBrowserNotification('提前提醒', reminderMessage);
            }
            
            const newReminder = {
              ...task.reminder,
              lastPreReminder: now.toISOString()
            };
            
            if (type === 'habit') {
              onUpdateHabit(task.id, { reminder: newReminder });
            } else {
              onUpdateProject(task.id, { reminder: newReminder });
            }
          }
        }
      });
    };
    
    checkUpcomingTasks(habits, 'habit');
    checkUpcomingTasks(projects, 'project');
  }, [habits, projects, onUpdateHabit, onUpdateProject, reminderSettings, sendBrowserNotification]);

  useEffect(() => {
    checkNotificationPermission();
    
    const timer = setInterval(() => {
      checkReminders();
      checkSmartReminders();
    }, 15000);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkReminders();
        checkSmartReminders();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkReminders, checkSmartReminders, checkNotificationPermission]);

  // 更新提醒设置
  const updateReminderSettings = useCallback((settings: Partial<ReminderSettings>) => {
    setReminderSettings(prev => ({ ...prev, ...settings }));
  }, []);

  // 清除提醒历史
  const clearReminderHistory = useCallback(() => {
    setReminderHistory([]);
  }, []);

  return {
    activeReminder,
    setActiveReminder,
    checkReminders,
    checkSmartReminders,
    reminderHistory,
    reminderSettings,
    updateReminderSettings,
    clearReminderHistory
  };
};
