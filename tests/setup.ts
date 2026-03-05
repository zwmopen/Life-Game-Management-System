// Vitest 测试设置文件
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock as any;

// 模拟 sessionStorage
global.sessionStorage = localStorageMock as any;

// 模拟 crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-1234',
    subtle: {
      digest: vi.fn(),
    },
  },
});

// 模拟 performance
Object.defineProperty(global, 'performance', {
  value: {
    now: () => Date.now(),
    timeOrigin: Date.now(),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000,
    },
  },
});

// 清理每个测试后的状态
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReset();
  localStorageMock.setItem.mockReset();
  localStorageMock.removeItem.mockReset();
  localStorageMock.clear.mockReset();
});
