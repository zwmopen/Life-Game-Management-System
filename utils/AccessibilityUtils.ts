/**
 * 可访问性工具函数
 * 提供键盘导航、焦点管理和屏幕阅读器支持功能
 */

// 为了支持React事件类型，我们使用类型交叉
type ReactKeyboardEvent = {
  preventDefault: () => void;
  stopPropagation: () => void;
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
};

// 定义CSSProperties类型，避免直接引用React
type CSSProperties = {
  [key: string]: any;
};

// 键盘事件处理
export function handleKeyboardEvent(
  event: KeyboardEvent | ReactKeyboardEvent,
  handlers: {
    onEnter?: (e: KeyboardEvent | ReactKeyboardEvent) => void;
    onSpace?: (e: KeyboardEvent | ReactKeyboardEvent) => void;
    onEscape?: (e: KeyboardEvent | ReactKeyboardEvent) => void;
    onArrowUp?: (e: KeyboardEvent | ReactKeyboardEvent) => void;
    onArrowDown?: (e: KeyboardEvent | ReactKeyboardEvent) => void;
    onArrowLeft?: (e: KeyboardEvent | ReactKeyboardEvent) => void;
    onArrowRight?: (e: KeyboardEvent | ReactKeyboardEvent) => void;
    onKeyDown?: (e: KeyboardEvent | ReactKeyboardEvent) => void;
  }
) {
  const { key, shiftKey } = event;
  
  // 阻止默认行为，除非明确指定允许
  const preventDefaultActions = [' ', 'Enter'];
  if (preventDefaultActions.includes(key)) {
    event.preventDefault?.();
  }
  
  // 调用对应的处理函数
  switch (key) {
    case 'Enter':
      handlers.onEnter?.(event);
      break;
    case ' ':
      handlers.onSpace?.(event);
      break;
    case 'Escape':
      handlers.onEscape?.(event);
      break;
    case 'ArrowUp':
      handlers.onArrowUp?.(event);
      break;
    case 'ArrowDown':
      handlers.onArrowDown?.(event);
      break;
    case 'ArrowLeft':
      handlers.onArrowLeft?.(event);
      break;
    case 'ArrowRight':
      handlers.onArrowRight?.(event);
      break;
    default:
      handlers.onKeyDown?.(event);
  }
}

// 焦点陷阱 - 用于模态对话框
export function createFocusTrap(rootElement: HTMLElement) {
  const focusableElements = rootElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  
  if (focusableElements.length === 0) {
    return { activate: () => {}, deactivate: () => {} };
  }
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };
  
  const activate = () => {
    document.addEventListener('keydown', handleTab);
    firstElement.focus();
  };
  
  const deactivate = () => {
    document.removeEventListener('keydown', handleTab);
  };
  
  return { activate, deactivate };
}

// 焦点管理
export function focusFirstDescendant(element: HTMLElement) {
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i] as HTMLElement;
    if (attemptFocus(child) || focusFirstDescendant(child)) {
      return true;
    }
  }
  return false;
}

export function attemptFocus(element: HTMLElement): boolean {
  if ((element as HTMLInputElement).disabled || element.tabIndex === -1 || element.hidden || element.style.display === 'none') {
    return false;
  }
  
  try {
    element.focus();
  } catch (e) {
    // 无法聚焦
    return false;
  }
  
  return document.activeElement === element;
}

// 屏幕阅读器辅助工具
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // 2秒后移除，确保屏幕阅读器有足够时间读取
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 2000);
}

// 暗示仅屏幕阅读器可见的CSS类
export const screenReaderOnlyStyle: CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0
};

// 检测用户是否偏好减少动画
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// 检测高对比度模式
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  
  return window.matchMedia('(prefers-contrast: more)').matches;
}

// 可访问的标签生成器
export function generateAccessibleLabel(text: string, suffix?: string): string {
  if (suffix) {
    return `${text} ${suffix}`;
  }
  return text;
}

// 检测键盘导航模式
let isUsingKeyboard = true;

export function setupKeyboardDetection() {
  const handleMouseDown = () => {
    isUsingKeyboard = false;
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      isUsingKeyboard = true;
    }
  };
  
  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('keydown', handleKeyDown);
  
  return () => {
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('keydown', handleKeyDown);
  };
}

export function isKeyboardUser(): boolean {
  return isUsingKeyboard;
}

// 高亮当前焦点元素（用于调试）
export function highlightFocusElement() {
  if (typeof document === 'undefined') return;
  
  const styleId = 'accessibility-focus-highlight';
  let styleElement = document.getElementById(styleId);
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = `
      .accessibility-debug:focus {
        outline: 2px solid #ff00ff !important;
        box-shadow: 0 0 0 3px rgba(255, 0, 255, 0.3) !important;
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  const handleFocus = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target) {
      target.classList.add('accessibility-debug');
      setTimeout(() => {
        target.classList.remove('accessibility-debug');
      }, 500);
    }
  };
  
  document.addEventListener('focus', handleFocus, true);
  
  return () => {
    document.removeEventListener('focus', handleFocus, true);
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
  };
}

// 键盘快捷键注册器
interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (e: KeyboardEvent) => void;
}

export class ShortcutManager {
  private shortcuts: Map<string, ShortcutHandler> = new Map();
  
  register(shortcut: ShortcutHandler) {
    const key = this.getKeyString(shortcut);
    this.shortcuts.set(key, shortcut);
  }
  
  unregister(key: string) {
    this.shortcuts.delete(key);
  }
  
  private getKeyString(handler: ShortcutHandler): string {
    return `${handler.ctrl ? 'ctrl+' : ''}${handler.shift ? 'shift+' : ''}${handler.alt ? 'alt+' : ''}${handler.key}`;
  }
  
  private handleKeyDown = (e: KeyboardEvent) => {
    const key = this.getKeyString({
      key: e.key.toLowerCase(),
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      alt: e.altKey,
      handler: () => {}
    });
    
    const shortcut = this.shortcuts.get(key);
    if (shortcut) {
      e.preventDefault();
      shortcut.handler(e);
    }
  };
  
  init() {
    document.addEventListener('keydown', this.handleKeyDown);
  }
  
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}