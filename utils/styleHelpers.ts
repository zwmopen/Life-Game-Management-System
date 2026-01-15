/**
 * 样式辅助函数
 * 提供主题相关的样式生成工具
 */

import { cardStyles, inputStyles, buttonStyles, smallButtonStyles, getStyleByTheme, type StyleVariant } from '../constants/styles';

/**
 * 拟态风格样式对象生成器
 */
export function getNeomorphicStyles(isNeomorphicDark: boolean) {
  return {
    bg: isNeomorphicDark ? 'bg-[#1e1e2e]' : 'bg-[#e0e5ec]',
    border: isNeomorphicDark ? 'border-[#1e1e2e]' : 'border-[#e0e5ec]',
    shadow: isNeomorphicDark 
      ? 'shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,46,0.8)]' 
      : 'shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]',
    hoverShadow: isNeomorphicDark 
      ? 'hover:shadow-[10px_10px_20px_rgba(0,0,0,0.5),-10px_-10px_20px_rgba(30,30,46,1)]' 
      : 'hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]',
    activeShadow: isNeomorphicDark 
      ? 'active:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.4),inset_-5px_-5px_10px_rgba(30,30,46,0.8)]' 
      : 'active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]',
    transition: 'transition-all duration-200'
  };
}

/**
 * 生成按钮样式
 * @param isActive 按钮是否激活
 * @param isSpecial 是否为特殊按钮(红色)
 * @param isNeomorphic 是否使用拟态风格
 * @param theme 主题类型
 * @param isDark 是否深色模式
 */
export function getButtonStyle(
  isActive: boolean,
  isSpecial: boolean | undefined,
  isNeomorphic: boolean,
  theme: string | undefined,
  isDark: boolean
): string {
  if (isActive) {
    return isSpecial ? 'bg-red-500 text-white border-red-500' : 'bg-blue-500 text-white border-blue-500';
  }
  
  if (isNeomorphic) {
    const neomorphicStyles = getNeomorphicStyles(theme === 'neomorphic-dark');
    return `${neomorphicStyles.bg} ${neomorphicStyles.border} ${neomorphicStyles.shadow} ${neomorphicStyles.hoverShadow} ${neomorphicStyles.activeShadow} ${neomorphicStyles.transition}`;
  }
  
  return isDark 
    ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700' 
    : 'bg-white border-slate-300 text-slate-600 hover:border-slate-200';
}

/**
 * 生成卡片背景样式
 * @param isNeomorphic 是否使用拟态风格
 * @param theme 主题类型
 * @param isDark 是否深色模式
 */
export function getCardBgStyle(
  isNeomorphic: boolean,
  theme: string | undefined,
  isDark: boolean
): string {
  if (isNeomorphic) {
    const neomorphicStyles = getNeomorphicStyles(theme === 'neomorphic-dark');
    return `${neomorphicStyles.bg} ${neomorphicStyles.border} rounded-[48px] ${neomorphicStyles.shadow} ${neomorphicStyles.hoverShadow} ${neomorphicStyles.activeShadow} ${neomorphicStyles.transition}`;
  }
  
  return isDark 
    ? 'bg-zinc-900 border-zinc-800 shadow-[inset_-15px_-15px_30px_rgba(255,255,255,0.05),inset_15px_15px_30px_rgba(0,0,0,0.3)]' 
    : 'bg-white border-slate-200 shadow-[inset_-15px_-15px_30px_rgba(255,255,255,0.8),inset_15px_15px_30px_rgba(0,0,0,0.1)]';
}

/**
 * 生成文本样式
 * @param isDark 是否深色模式
 * @param isNeomorphic 是否使用拟态风格
 * @param type 文本类型: 'main' | 'sub'
 */
export function getTextStyle(
  isDark: boolean,
  isNeomorphic: boolean,
  type: 'main' | 'sub' = 'main'
): string {
  if (type === 'main') {
    return isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';
  }
  return isDark ? 'text-zinc-400' : isNeomorphic ? 'text-zinc-600' : 'text-slate-500';
}

/**
 * 属性颜色映射
 */
export const ATTR_COLORS: Record<string, string> = {
  STR: 'text-red-500',
  INT: 'text-blue-500',
  DIS: 'text-zinc-400',
  CRE: 'text-purple-500',
  SOC: 'text-pink-500',
  WEA: 'text-yellow-500',
};
