import React from 'react';
import { X } from 'lucide-react';

interface HelpContent {
  title: string;
  icon: React.ReactNode;
  productIntro: string; // 产品介绍
  underlyingPrinciple: string; // 底层原理
  coreRules: string; // 核心规则
  usageMethods: string; // 使用方法
  updateTime: string;
}

export interface GuideCardConfig {
  fontSize: 'small' | 'medium' | 'large'; // 字体大小
  borderRadius: 'small' | 'medium' | 'large'; // 圆角大小
  shadowIntensity: 'light' | 'medium' | 'strong'; // 阴影强度
  showUnderlyingPrinciple: boolean; // 是否显示底层原理板块
}

interface GlobalGuideCardProps {
  activeHelp: string | null;
  helpContent: Record<string, HelpContent>;
  onClose: () => void;
  cardBg: string;
  textMain: string;
  textSub: string;
  config: GuideCardConfig;
}

// 全局指南卡片通用组件
const GlobalGuideCard: React.FC<GlobalGuideCardProps> = ({
  activeHelp,
  helpContent,
  onClose,
  cardBg,
  textMain,
  textSub,
  config
}) => {
  if (!activeHelp || !helpContent[activeHelp]) {
    return null;
  }

  const content = helpContent[activeHelp];
  
  // 根据配置生成样式类
  const getFontSizeClass = () => {
    switch (config.fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };
  
  const getBorderRadiusClass = () => {
    switch (config.borderRadius) {
      case 'small': return 'rounded-lg';
      case 'large': return 'rounded-3xl';
      default: return 'rounded-2xl';
    }
  };
  
  const getShadowClass = () => {
    switch (config.shadowIntensity) {
      case 'light': return 'shadow-xl';
      case 'strong': return 'shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]';
      default: return 'shadow-2xl';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className={`w-full max-w-md p-6 ${getBorderRadiusClass()} ${cardBg} ${getShadowClass()} relative`}>
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className={`text-xl font-black ${textMain} flex items-center gap-2`}>
              {content.icon}
              {content.title}
            </h3>
            <div className={`text-xs ${textSub}`}>
              更新时间: {content.updateTime}
            </div>
          </div>
          
          {/* 产品介绍 */}
          <div className="space-y-2">
            <h4 className={`text-lg font-semibold ${textMain}`}>产品介绍</h4>
            <div className={`${getFontSizeClass()} ${textSub} leading-relaxed`}>
              {content.productIntro}
            </div>
          </div>
          
          {/* 底层原理（可配置显示/隐藏） */}
          {config.showUnderlyingPrinciple && (
            <div className="space-y-2">
              <h4 className={`text-lg font-semibold ${textMain}`}>底层原理</h4>
              <div className={`${getFontSizeClass()} ${textSub} leading-relaxed`}>
                {content.underlyingPrinciple}
              </div>
            </div>
          )}
          
          {/* 核心规则 */}
          <div className="space-y-2">
            <h4 className={`text-lg font-semibold ${textMain}`}>核心规则</h4>
            <div className={`${getFontSizeClass()} ${textSub} leading-relaxed`}>
              {content.coreRules}
            </div>
          </div>
          
          {/* 使用方法 */}
          <div className="space-y-2">
            <h4 className={`text-lg font-semibold ${textMain}`}>使用方法</h4>
            <div className={`${getFontSizeClass()} ${textSub} leading-relaxed`}>
              {content.usageMethods}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalGuideCard;