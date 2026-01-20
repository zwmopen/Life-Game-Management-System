import React from 'react';
import { HelpCircle } from 'lucide-react';

interface GlobalHelpButtonProps {
  helpId: string;
  onHelpClick: (helpId: string) => void;
  size?: number;
  className?: string;
  variant?: 'ghost' | 'solid' | 'neomorphic';
}

const GlobalHelpButton: React.FC<GlobalHelpButtonProps> = ({
  helpId,
  onHelpClick,
  size = 16,
  className = '',
  variant = 'ghost'
}) => {
  const baseStyles = "transition-all duration-200 flex items-center justify-center";
  
  let variantStyles = "";
  if (variant === 'ghost') {
    variantStyles = "text-zinc-500 hover:text-blue-400 p-1.5 rounded-full";
  } else if (variant === 'solid') {
    variantStyles = "bg-blue-500 text-white hover:bg-blue-600 p-1.5 rounded-full";
  } else if (variant === 'neomorphic') {
    variantStyles = "shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.05)] rounded-full p-1";
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onHelpClick(helpId);
      }}
      className={`${baseStyles} ${variantStyles} ${className}`}
      aria-label="帮助"
      title="查看说明"
    >
      <HelpCircle size={size} />
    </button>
  );
};

export default GlobalHelpButton;
