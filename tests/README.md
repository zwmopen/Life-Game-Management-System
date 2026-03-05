# 测试指南

## 测试框架

本项目使用 [Vitest](https://vitest.dev/) 作为测试框架，配合 React Testing Library 进行组件测试。

## 安装依赖

```bash
npm install
```

## 运行测试

### 运行所有测试
```bash
npm test
```

### 运行测试（单次执行）
```bash
npm run test:run
```

### 运行测试并生成覆盖率报告
```bash
npm run test:coverage
```

## 测试结构

```
tests/
├── setup.ts                 # 测试环境设置
├── utils/                   # 工具函数测试
│   └── secureStorage.test.ts
├── api/                     # API 测试
│   └── webdav.test.ts
├── components/              # 组件测试
│   └── ErrorBoundary.test.tsx
└── hooks/                   # Hooks 测试
    └── useDebouncedState.test.ts
```

## 编写测试

### 单元测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../utils/myFunction';

describe('myFunction', () => {
  it('应该返回正确的结果', () => {
    expect(myFunction('input')).toBe('expected output');
  });
});
```

### 组件测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('应该渲染标题', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## 当前测试覆盖

- ✅ 安全存储工具 (`secureStorage.test.ts`)
- ✅ WebDAV 代理 API (`webdav.test.ts`)
- 🔄 错误边界组件 (待添加)
- 🔄 React Hooks (待添加)
- 🔄 业务逻辑 (待添加)

## 持续集成

测试会在以下情况自动运行：
- 提交代码时
- 创建 Pull Request 时
- 部署前

## 最佳实践

1. **测试命名**: 使用中文或英文描述测试目的
2. **测试隔离**: 每个测试应该独立，不依赖其他测试
3. **Mock 外部依赖**: 使用 `vi.fn()` 或 `vi.mock()` 模拟外部依赖
4. **清理副作用**: 在 `afterEach` 或 `afterAll` 中清理副作用
