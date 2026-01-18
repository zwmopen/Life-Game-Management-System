import React from 'react';
import UnifiedGuideCard from './UnifiedGuideCard';
import type { GuideCardConfig } from './UnifiedGuideCard';

interface HelpContent {
  title: string;
  icon: React.ReactNode;
  productIntro: string; // 产品介绍
  underlyingPrinciple: string; // 底层原理
  coreRules: string; // 核心规则
  usageMethods: string; // 使用方法
  updateTime: string;
}

interface PomodoroStyleHelpModalProps {
  activeHelp: string | null;
  helpContent: Record<string, HelpContent>;
  onClose: () => void;
  config: GuideCardConfig;
}

// 仿照番茄钟全屏模式的精美帮助卡片组件 - 使用统一的帮助卡片组件
const PomodoroStyleHelpModal: React.FC<PomodoroStyleHelpModalProps> = ({
  activeHelp,
  helpContent,
  onClose,
  config
}) => {
  return (
    <UnifiedGuideCard
      activeHelp={activeHelp}
      helpContent={helpContent}
      onClose={onClose}
      config={config}
    />
  );
};

export default PomodoroStyleHelpModal;