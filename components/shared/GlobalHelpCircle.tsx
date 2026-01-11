import React from 'react';
import { HelpCircle } from 'lucide-react';

interface GlobalHelpCircleProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

const GlobalHelpCircle: React.FC<GlobalHelpCircleProps> = ({
  size = 16,  // 根据标准按钮调整大小
  className = '',
  onClick
}) => {
  // 统一样式：使用标准按钮的颜色和过渡效果
  const defaultClassName = `text-zinc-500 hover:text-white transition-colors ${className}`;
  
  return (
    <button 
      onClick={onClick}
      className={defaultClassName}
      aria-label="帮助"
    >
      <HelpCircle size={size} />
    </button>
  );
};

export default GlobalHelpCircle;