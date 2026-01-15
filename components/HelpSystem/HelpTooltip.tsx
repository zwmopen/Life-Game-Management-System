import React from 'react';
import GlobalHelpCircle from '../shared/GlobalHelpCircle';

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
    <div className="relative inline-block cursor-pointer">
      <button
        onClick={() => onHelpClick(helpId)}
        className={`transition-colors ${className}`}
        aria-label="打开帮助卡片"
      >
        {children || <GlobalHelpCircle size={14} />}
      </button>
    </div>
  );
};

export default HelpTooltip;