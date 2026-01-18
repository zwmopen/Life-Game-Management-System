/**
 * 全局样式常量
 * 统一管理应用中重复使用的样式类名
 */

export interface StyleVariant {
  neomorphicDark: string;
  neomorphicLight: string;
  dark: string;
  light: string;
}

/**
 * 卡片样式变体
 */
export const cardStyles: StyleVariant = {
  neomorphicDark: "bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none rounded-lg",
  neomorphicLight: "bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none rounded-lg",
  dark: "border-zinc-800 bg-zinc-900/50 rounded",
  light: "border-slate-200 bg-slate-50 rounded"
};

/**
 * 深度卡片样式变体 (更深的阴影)
 */
export const deepCardStyles: StyleVariant = {
  neomorphicDark: "bg-[#1e1e2e] shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(30,30,46,0.8)] border-none rounded-2xl",
  neomorphicLight: "bg-[#e0e5ec] shadow-[10px_10px_20px_rgba(163,177,198,0.6),-10px_-10px_20px_rgba(255,255,255,1)] border-none rounded-2xl",
  dark: "border-zinc-800 bg-zinc-900 shadow-xl rounded-2xl",
  light: "border-slate-200 bg-white shadow-xl rounded-2xl"
};

/**
 * 输入框样式变体
 */
export const inputStyles: StyleVariant = {
  neomorphicDark: "bg-[#1e1e2e] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] border-none rounded-lg p-2",
  neomorphicLight: "bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] border-none rounded-lg p-2",
  dark: "bg-transparent border-zinc-700 rounded p-2",
  light: "bg-transparent border-slate-300 rounded p-2"
};

/**
 * 按钮样式变体 (基础)
 */
export const buttonStyles: StyleVariant = {
  neomorphicDark: "bg-[#1e1e2e] shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(30,30,46,0.8)] border-none text-blue-400 hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(30,30,46,0.8)] rounded-full transition-all duration-200",
  neomorphicLight: "bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,1)] border-none text-blue-600 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,1)] rounded-full transition-all duration-200",
  dark: "bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors duration-200",
  light: "bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors duration-200"
};

/**
 * 小按钮样式变体 (用于编辑/删除等图标按钮)
 */
export const smallButtonStyles: StyleVariant = {
  neomorphicDark: "bg-[#1e1e2e] shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,46,0.7)] border-none rounded-full hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(30,30,46,0.7)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(30,30,46,0.7)] p-1 transition-all duration-200",
  neomorphicLight: "bg-[#e0e5ec] shadow-[3px_3px_6px_rgba(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,1)] border-none rounded-full hover:shadow-[1px_1px_3px_rgba(163,177,198,0.6),-1px_-1px_3px_rgba(255,255,255,1)] active:shadow-[inset_1px_1px_2px_rgba(163,177,198,0.6),inset_-1px_-1px_2px_rgba(255,255,255,1)] p-1 transition-all duration-200",
  dark: "hover:bg-zinc-800 p-1 rounded-full transition-colors duration-200",
  light: "hover:bg-slate-100 p-1 rounded-full transition-colors duration-200"
};

/**
 * 文本颜色变体
 */
export const textColors = {
  main: {
    neomorphicDark: "text-zinc-300",
    neomorphicLight: "text-slate-700",
    dark: "text-zinc-100",
    light: "text-slate-900"
  },
  muted: {
    neomorphicDark: "text-zinc-500",
    neomorphicLight: "text-slate-500",
    dark: "text-zinc-400",
    light: "text-slate-600"
  },
  accent: {
    neomorphicDark: "text-blue-400",
    neomorphicLight: "text-blue-600",
    dark: "text-blue-400",
    light: "text-blue-600"
  }
};

/**
 * 背景颜色变体
 */
export const bgColors = {
  primary: {
    neomorphicDark: "bg-[#1e1e2e]",
    neomorphicLight: "bg-[#e0e5ec]",
    dark: "bg-zinc-900",
    light: "bg-white"
  },
  secondary: {
    neomorphicDark: "bg-[#1e1e2e]/80",
    neomorphicLight: "bg-[#e0e5ec]/80",
    dark: "bg-zinc-800",
    light: "bg-slate-50"
  }
};

/**
 * 辅助函数:根据主题获取样式
 * @param variant 样式变体对象
 * @param isNeomorphic 是否使用拟态风格
 * @param theme 主题类型
 * @returns 对应的样式类名字符串
 */
export function getStyleByTheme(
  variant: StyleVariant,
  isNeomorphic: boolean,
  theme?: string
): string {
  if (isNeomorphic) {
    return theme === 'neomorphic-dark' ? variant.neomorphicDark : variant.neomorphicLight;
  }
  return theme === 'dark' ? variant.dark : variant.light;
}

/**
 * 颜色主题辅助类型
 */
export type ColorTheme = 'neomorphic-dark' | 'neomorphic-light' | 'dark' | 'light';

/**
 * 获取文本主颜色
 */
export function getTextMain(isNeomorphic: boolean, theme?: string): string {
  if (isNeomorphic) {
    return theme === 'neomorphic-dark' ? textColors.main.neomorphicDark : textColors.main.neomorphicLight;
  }
  return theme === 'dark' ? textColors.main.dark : textColors.main.light;
}

/**
 * 获取文本次要颜色
 */
export function getTextMuted(isNeomorphic: boolean, theme?: string): string {
  if (isNeomorphic) {
    return theme === 'neomorphic-dark' ? textColors.muted.neomorphicDark : textColors.muted.neomorphicLight;
  }
  return theme === 'dark' ? textColors.muted.dark : textColors.muted.light;
}

/**
 * 按钮颜色变体集合
 */
export const buttonColorVariants = {
  primary: {
    neomorphicDark: "text-blue-400",
    neomorphicLight: "text-blue-600",
    dark: "bg-blue-600 hover:bg-blue-500",
    light: "bg-blue-600 hover:bg-blue-500"
  },
  success: {
    neomorphicDark: "text-emerald-400",
    neomorphicLight: "text-emerald-600",
    dark: "bg-emerald-600 hover:bg-emerald-500",
    light: "bg-emerald-600 hover:bg-emerald-500"
  },
  danger: {
    neomorphicDark: "text-red-400",
    neomorphicLight: "text-red-500",
    dark: "bg-red-600 hover:bg-red-500",
    light: "bg-red-600 hover:bg-red-500"
  },
  warning: {
    neomorphicDark: "text-yellow-400",
    neomorphicLight: "text-yellow-600",
    dark: "bg-yellow-600 hover:bg-yellow-500",
    light: "bg-yellow-600 hover:bg-yellow-500"
  },
  purple: {
    neomorphicDark: "text-purple-400",
    neomorphicLight: "text-purple-600",
    dark: "bg-purple-600 hover:bg-purple-500",
    light: "bg-purple-600 hover:bg-purple-500"
  }
};

/**
 * 获取按钮样式(带颜色变体)
 */
export function getButtonStyle(
  isNeomorphic: boolean,
  theme: string | undefined,
  colorVariant: 'primary' | 'success' | 'danger' | 'warning' | 'purple' = 'primary'
): string {
  const baseStyle = getStyleByTheme(buttonStyles, isNeomorphic, theme);
  const colorStyle = isNeomorphic 
    ? (theme === 'neomorphic-dark' 
        ? buttonColorVariants[colorVariant].neomorphicDark 
        : buttonColorVariants[colorVariant].neomorphicLight)
    : (theme === 'dark' 
        ? buttonColorVariants[colorVariant].dark 
        : buttonColorVariants[colorVariant].light);
  
  return `${baseStyle} ${colorStyle}`;
}

/**
 * 获取小按钮样式(带颜色变体)
 */
export function getSmallButtonStyle(
  isNeomorphic: boolean,
  theme: string | undefined,
  colorVariant: 'primary' | 'success' | 'danger' | 'warning' | 'purple' = 'primary'
): string {
  const baseStyle = getStyleByTheme(smallButtonStyles, isNeomorphic, theme);
  const colorStyle = isNeomorphic 
    ? (theme === 'neomorphic-dark' 
        ? buttonColorVariants[colorVariant].neomorphicDark 
        : buttonColorVariants[colorVariant].neomorphicLight)
    : "";
  
  return `${baseStyle} ${colorStyle}`;
}
