import React from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  helpId: string;
  onHelpClick: (helpId: string) => void;
  children?: React.ReactNode;
  className?: string;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
  helpId,
  onHelpClick,
  children,
  className = ''
}) => {
  return (
    <div className="relative inline-block cursor-help">
      <button
        onClick={() => onHelpClick(helpId)}
        className={`text-zinc-500 hover:text-blue-500 transition-colors ${className}`}
        aria-label="打开帮助"
      >
        {children || <HelpCircle size={16} />}
      </button>
    </div>
  );
};

export default HelpTooltip;