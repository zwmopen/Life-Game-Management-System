import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 从localStorage读取主题，默认为拟态浅色
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || 'neomorphic-light';
  });

  // 初始化主题并监听系统主题变化
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      // 确保保存的主题是有效的拟态主题
      const validThemes: Theme[] = ['neomorphic-light', 'neomorphic-dark'];
      if (validThemes.includes(savedTheme)) {
        setThemeState(savedTheme);
      } else {
        // 如果保存的主题无效，使用系统偏好设置
        setThemeState(prefersDark ? 'neomorphic-dark' : 'neomorphic-light');
      }
    } else {
      setThemeState(prefersDark ? 'neomorphic-dark' : 'neomorphic-light');
    }

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      // 只有当用户没有明确设置主题时，才跟随系统变化
      if (!savedTheme) {
        setThemeState(e.matches ? 'neomorphic-dark' : 'neomorphic-light');
      }
    };

    // 添加监听器
    mediaQuery.addEventListener('change', handleThemeChange);

    // 清理监听器
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);

  // 应用主题到DOM
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark', 'neomorphic-light', 'neomorphic-dark');
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme.includes('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => {
      // 两种主题循环切换：拟态浅色 → 拟态深色
      if (prev === 'neomorphic-light') return 'neomorphic-dark';
      return 'neomorphic-light';
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};