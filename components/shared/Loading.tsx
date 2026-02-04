import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullscreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'medium', 
  message, 
  fullscreen = false 
}) => {
  const { theme } = useTheme();
  const isDark = theme.includes('dark');
  const isNeomorphic = theme.startsWith('neomorphic');
  
  const sizeMap = {
    small: 24,
    medium: 32,
    large: 48
  };
  
  const loaderSize = sizeMap[size];
  
  const containerClass = fullscreen 
    ? `fixed inset-0 ${isNeomorphic ? (theme === 'neomorphic-dark' ? 'bg-[#1e1e2e]/80' : 'bg-[#e0e5ec]/80') : (isDark ? 'bg-black/50' : 'bg-white/50')} backdrop-blur-sm flex items-center justify-center z-50` 
    : 'flex items-center justify-center p-4';
  
  const loaderClass = isNeomorphic
    ? (theme === 'neomorphic-dark'
      ? 'text-blue-400'
      : 'text-blue-600')
    : (isDark
      ? 'text-emerald-500'
      : 'text-blue-600');
  
  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 
          size={loaderSize} 
          className={`animate-spin ${loaderClass}`} 
        />
        {message && (
          <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;