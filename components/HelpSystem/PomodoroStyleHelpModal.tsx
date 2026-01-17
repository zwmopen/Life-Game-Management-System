import React, { MouseEvent } from 'react';
import ReactDOM from 'react-dom';
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

interface PomodoroStyleHelpModalProps {
  activeHelp: string | null;
  helpContent: Record<string, HelpContent>;
  onClose: () => void;
  config: GuideCardConfig;
}

// 仿照番茄钟全屏模式的精美帮助卡片组件
const PomodoroStyleHelpModal: React.FC<PomodoroStyleHelpModalProps> = ({
  activeHelp,
  helpContent,
  onClose,
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

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const portalElement = typeof document !== 'undefined' ? document.body : null;

  if (!portalElement) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[3000] bg-black/30 flex items-center justify-center p-4 backdrop-blur-sm" 
      onClick={handleBackdropClick}
    >
      <div className="guide-card neu-out" style={{
        maxWidth: '600px',
        width: '80%',
        maxHeight: '90vh',
        padding: '30px',
        borderRadius: '20px',
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        pointerEvents: 'auto',
      }}>
        <div className="guide-header">
          <h3>{content.icon} {content.title}</h3>
          <button 
            className="guide-close" 
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="guide-content">
          <h4>📋 产品介绍</h4>
          <p>{content.productIntro}</p>
          
          {/* 底层原理 - 根据配置决定是否显示 */}
          {config.showUnderlyingPrinciple && (
            <>
              <h4>⚙️ 底层原理</h4>
              <p>{content.underlyingPrinciple}</p>
            </>
          )}
          
          <h4>📌 核心规则</h4>
          <p>{content.coreRules}</p>
          
          <h4>🎯 使用方法</h4>
          <p>{content.usageMethods}</p>
        </div>
      </div>
      
      <style jsx>{`
        .guide-card {
          background: var(--bg-color, #e0e5ec);
          box-shadow: 20px 20px 60px var(--shadow-dark, #a3b1c6), -20px -20px 60px var(--shadow-light, #ffffff);
          border-radius: 20px;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.9);
          z-index: 3000;
          display: none;
          flex-direction: column;
          overflow-y: auto;
          pointer-events: auto;
        }
        
        .guide-card.show {
          display: flex;
          animation: fadeInScale 0.3s ease-out forwards;
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        .guide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid rgba(163, 177, 198, 0.2);
        }
        
        .guide-header h3 {
          margin: 0;
          color: var(--text-main);
          font-size: 24px;
          font-weight: 700;
        }
        
        .guide-close {
          background: var(--bg-color);
          border: none;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          color: var(--text-sub);
          box-shadow: 3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light);
          transition: all 0.2s ease;
        }
        
        .guide-close:hover {
          color: var(--text-main);
          transform: translateY(-1px);
          box-shadow: 5px 5px 10px var(--shadow-dark), -5px -5px 10px var(--shadow-light);
        }
        
        .guide-content {
          flex: 1;
          overflow-y: auto;
          padding-right: 10px;
        }
        
        .guide-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .guide-content::-webkit-scrollbar-track {
          background: rgba(163, 177, 198, 0.1);
          border-radius: 3px;
        }
        
        .guide-content::-webkit-scrollbar-thumb {
          background: rgba(163, 177, 198, 0.5);
          border-radius: 3px;
        }
        
        .guide-content::-webkit-scrollbar-thumb:hover {
          background: rgba(163, 177, 198, 0.7);
        }
        
        .guide-content h4 {
          margin: 20px 0 10px 0;
          color: var(--text-main);
          font-size: 16px;
          font-weight: 700;
        }
        
        .guide-content h4:first-child {
          margin-top: 0;
        }
        
        .guide-content p {
          margin: 0 0 15px 0;
          color: var(--text-gray);
          font-size: 14px;
          line-height: 1.6;
        }
        
        .guide-content ul {
          margin: 0 0 15px 0;
          padding-left: 25px;
          color: var(--text-gray);
          font-size: 14px;
          line-height: 1.6;
        }
        
        .guide-content li {
          margin-bottom: 8px;
        }
        
        .guide-content strong {
          color: var(--text-main);
          font-weight: 600;
        }
        
        /* 深色模式样式 */
        .dark .guide-card {
          background: var(--bg-color, #1a1a2e);
          box-shadow: 20px 20px 60px var(--shadow-dark, #0f172a), -20px -20px 60px var(--shadow-light, #1e293b);
        }
        
        .dark .guide-header {
          border-bottom: 2px solid rgba(163, 177, 198, 0.1);
        }
        
        .dark .guide-header h3 {
          color: var(--text-main);
        }
        
        .dark .guide-close {
          background: var(--bg-color);
          color: var(--text-sub);
          box-shadow: 3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light);
        }
        
        .dark .guide-close:hover {
          color: var(--text-main);
        }
        
        .dark .guide-content p {
          color: var(--text-gray);
        }
        
        .dark .guide-content h4 {
          color: var(--text-main);
        }
        
        .dark .guide-content strong {
          color: var(--text-main);
        }
        
        /* 拟态浅色模式样式 */
        .neomorphic-light .guide-card {
          background: var(--bg-color);
          box-shadow: 20px 20px 60px var(--shadow-dark), -20px -20px 60px var(--shadow-light);
        }
        
        .neomorphic-light .guide-header {
          border-bottom: 2px solid rgba(163, 177, 198, 0.2);
        }
        
        .neomorphic-light .guide-header h3 {
          color: var(--text-main);
        }
        
        .neomorphic-light .guide-close {
          background: var(--bg-color);
          color: var(--text-sub);
          box-shadow: 3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light);
        }
        
        .neomorphic-light .guide-close:hover {
          color: var(--text-main);
        }
        
        .neomorphic-light .guide-content p {
          color: var(--text-gray);
        }
        
        .neomorphic-light .guide-content h4 {
          color: var(--text-main);
        }
        
        .neomorphic-light .guide-content strong {
          color: var(--text-main);
        }
        
        /* 拟态深色模式样式 */
        .neomorphic-dark .guide-card {
          background: var(--bg-color, #1e1e2e);
          box-shadow: 20px 20px 60px var(--shadow-dark, #0f0f17), -20px -20px 60px var(--shadow-light, #2d2d42);
        }
        
        .neomorphic-dark .guide-header {
          border-bottom: 2px solid rgba(163, 177, 198, 0.1);
        }
        
        .neomorphic-dark .guide-header h3 {
          color: var(--text-main);
        }
        
        .neomorphic-dark .guide-close {
          background: var(--bg-color);
          color: var(--text-sub);
          box-shadow: 3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light);
        }
        
        .neomorphic-dark .guide-close:hover {
          color: var(--text-main);
        }
        
        .neomorphic-dark .guide-content p {
          color: var(--text-gray);
        }
        
        .neomorphic-dark .guide-content h4 {
          color: var(--text-main);
        }
        
        .neomorphic-dark .guide-content strong {
          color: var(--text-main);
        }
      `}</style>
    </div>,
    portalElement
  );
};

export default PomodoroStyleHelpModal;