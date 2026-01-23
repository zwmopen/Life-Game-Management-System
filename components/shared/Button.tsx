import React from 'react';
import { getButtonStyle, getSmallButtonStyle } from '../../constants/styles';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'purple';
  size?: 'small' | 'medium' | 'large';
  isNeomorphic: boolean;
  theme: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  isNeomorphic,
  theme,
  className = '',
  children,
  ...props
}) => {
  // 获取按钮基础样式
  const buttonBaseStyle = size === 'small'
    ? getSmallButtonStyle(isNeomorphic, theme, variant)
    : getButtonStyle(isNeomorphic, theme, variant);

  // 根据尺寸添加额外样式
  const sizeStyle = {
    small: 'w-8 h-8 flex items-center justify-center text-xs',
    medium: 'w-10 h-10 flex items-center justify-center text-sm',
    large: 'px-4 py-2.5 text-base'
  }[size];

  // 合并所有样式
  const finalClassName = `${buttonBaseStyle} ${sizeStyle} ${className}`;

  return (
    <button
      className={finalClassName}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;