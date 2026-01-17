/**
 * 类型安全工具函数
 * 提供类型安全的工具函数和运行时类型检查
 */

// 安全访问嵌套对象属性
export function safeGet<T>(obj: any, path: string, defaultValue?: T): T | undefined {
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result as T;
  } catch {
    return defaultValue;
  }
}

// 类型守卫函数
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

export function isValidString(value: any): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidArray<T>(value: any): value is T[] {
  return Array.isArray(value);
}

export function isValidObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// 深度冻结对象，防止意外修改
export function deepFreeze<T>(obj: T): T {
  if (!isValidObject(obj) && !isValidArray(obj)) {
    return obj;
  }

  Object.getOwnPropertyNames(obj).forEach(prop => {
    const propValue = (obj as any)[prop];
    if (propValue && typeof propValue === 'object') {
      deepFreeze(propValue);
    }
  });

  return Object.freeze(obj) as T;
}

// 安全的JSON序列化和反序列化
export function safeJsonParse<T = any>(str: string, defaultValue: T = undefined as any): T {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

export function safeJsonStringify(obj: any, defaultValue: string = '{}'): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return defaultValue;
  }
}

// 类型转换助手
export function toNumber(value: any, defaultValue: number = 0): number {
  if (isValidNumber(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isValidNumber(parsed) ? parsed : defaultValue;
  }
  if (typeof value === 'boolean') return value ? 1 : 0;
  return defaultValue;
}

export function toString(value: any, defaultValue: string = ''): string {
  if (value == null) return defaultValue;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') return safeJsonStringify(value);
  return defaultValue;
}

export function toBoolean(value: any, defaultValue: boolean = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }
  if (typeof value === 'number') return value !== 0;
  return defaultValue;
}

// 数据验证器
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateRequired(value: any, fieldName: string = 'Field'): ValidationResult {
  const errors: string[] = [];
  if (value == null || (typeof value === 'string' && value.trim().length === 0)) {
    errors.push(`${fieldName} 是必需的`);
  }
  return { isValid: errors.length === 0, errors };
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push('请输入有效的邮箱地址');
  }
  return { isValid: errors.length === 0, errors };
}

export function validateMinLength(value: string, minLength: number, fieldName: string = 'Field'): ValidationResult {
  const errors: string[] = [];
  if (value && value.length < minLength) {
    errors.push(`${fieldName} 至少需要 ${minLength} 个字符`);
  }
  return { isValid: errors.length === 0, errors };
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string = 'Field'): ValidationResult {
  const errors: string[] = [];
  if (value && value.length > maxLength) {
    errors.push(`${fieldName} 不能超过 ${maxLength} 个字符`);
  }
  return { isValid: errors.length === 0, errors };
}

// 泛型结果类型，用于错误处理
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

export function err<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}

// 安全的异步操作包装器
export async function safeAsync<T>(
  asyncFn: () => Promise<T>,
  errorMessage: string = '异步操作失败'
): Promise<Result<T, Error>> {
  try {
    const data = await asyncFn();
    return ok(data);
  } catch (error) {
    const errInstance = error instanceof Error ? error : new Error(errorMessage);
    return err(errInstance);
  }
}

// 重试机制
export async function retryAsync<T>(
  asyncFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<Result<T, Error>> {
  let lastError: Error | undefined;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await asyncFn();
      return ok(result);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return err(lastError!);
}