import React, { MouseEvent, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

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

interface UnifiedGuideCardProps {
  activeHelp: string | null;
  helpContent: Record<string, HelpContent>;
  onClose: () => void;
  config: GuideCardConfig;
}

// 统一的帮助卡片组件 - 以3D专注生态指南为标准
const UnifiedGuideCard: React.FC<UnifiedGuideCardProps> = ({
  activeHelp,
  helpContent,
  onClose,
  config
}) => {
  if (!activeHelp || !helpContent[activeHelp]) {
    return null;
  }

  const content = helpContent[activeHelp];
  
  // 主题判断逻辑，从 document 根元素类名获取当前主题
  const [theme, setTheme] = useState<string>('neomorphic-light');
  
  useEffect(() => {
    // 获取当前主题
    const getCurrentTheme = () => {
      const root = document.documentElement;
      if (root.classList.contains('neomorphic-dark')) return 'neomorphic-dark';
      if (root.classList.contains('neomorphic-light')) return 'neomorphic-light';
      if (root.classList.contains('dark')) return 'dark';
      if (root.classList.contains('light')) return 'light';
      return 'neomorphic-light';
    };
    
    setTheme(getCurrentTheme());
    
    // 监听主题变化
    const observer = new MutationObserver(() => {
      setTheme(getCurrentTheme());
    });
    
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // 主题判断
  const isDark = theme.includes('dark');
  const isNeomorphicDark = theme === 'neomorphic-dark';

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const portalElement = typeof document !== 'undefined' ? document.body : null;

  if (!portalElement) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[100000] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" 
      onClick={handleBackdropClick}
    >
      <div className={`guide-card neu-out ${isNeomorphicDark ? 'neomorphic-dark-mode' : isDark ? 'dark-mode' : ''}`} style={{
        '--bg-color': isNeomorphicDark ? '#1e1e2e' : isDark ? '#1a1a2e' : '#e0e5ec',
        '--text-main': isNeomorphicDark || isDark ? '#f4f4f5' : '#4d5b6d',
        '--text-sub': isNeomorphicDark || isDark ? '#a3b1c6' : '#a3b1c6',
        '--text-gray': isNeomorphicDark || isDark ? '#a3b1c6' : '#64748b',
        '--shadow-dark': isNeomorphicDark ? '#0f0f17' : isDark ? '#0f172a' : '#a3b1c6',
        '--shadow-light': isNeomorphicDark ? '#2d2d42' : isDark ? '#1e293b' : '#ffffff',
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
          <h4 className="flex items-center gap-1">📋 模块介绍</h4>
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
          <p>{content.usageMethods.replace(/(?<!^)(\d+\.)/g, '\n$1')}</p>
        </div>
      </div>
      
      <style jsx>{`
        .guide-card {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.9);
          width: 80%;
          max-width: 600px;
          max-height: 90vh;
          padding: 30px;
          background: var(--bg-color);
          box-shadow: 20px 20px 60px var(--shadow-dark), -20px -20px 60px var(--shadow-light);
          border-radius: 20px;
          z-index: 3000;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          pointer-events: auto;
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
          border-radius: 50% !important;
          width: 35px !important;
          height: 35px !important;
          min-width: 35px !important;
          min-height: 35px !important;
          max-width: 35px !important;
          max-height: 35px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          font-size: 18px !important;
          color: var(--text-sub);
          box-shadow: 3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light);
          transition: all 0.2s ease;
          flex-shrink: 0 !important;
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
          white-space: pre-line;
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
        
        /* 深色模式样式 - 统一管理所有深色主题 */
        .guide-card.dark-mode,
        .guide-card.neomorphic-dark-mode {
          background: var(--bg-color);
          box-shadow: 20px 20px 60px var(--shadow-dark), -20px -20px 60px var(--shadow-light);
        }
        
        .guide-card.dark-mode .guide-header,
        .guide-card.neomorphic-dark-mode .guide-header {
          border-bottom: 2px solid rgba(163, 177, 198, 0.1);
        }
      `}</style>
    </div>,
    portalElement
  );
};

export default UnifiedGuideCard;
