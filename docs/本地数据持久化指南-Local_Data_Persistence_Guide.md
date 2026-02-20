# 本地数据持久化系统使用指南

## 概述

本项目实现了本地数据持久化系统，用于存储用户的游戏状态数据（如金币、经验值、专注时间等）。系统会在用户每次操作后自动保存数据到浏览器的 localStorage 中，确保即使刷新页面或关闭浏览器，数据也不会丢失。

## 核心功能

### 1. LocalDataStore 服务

位于 `utils/LocalDataStore.ts`，提供以下功能：

- **getState()**: 获取当前存储的游戏状态
- **setState()**: 保存游戏状态到本地存储
- **updateField()**: 更新特定字段
- **updateFields()**: 批量更新多个字段
- **addBalance()**: 增加余额
- **addXP()**: 增加经验值
- **recordFocusSession()**: 记录一次专注会话完成
- **reset()**: 重置所有数据
- **exportData()/importData()**: 数据导入导出功能

### 2. useLocalGameState Hook

位于 `hooks/useLocalGameState.ts`，提供 React 组件中使用的本地游戏状态管理功能：

- 管理所有游戏状态（天数、余额、经验值、专注时间等）
- 自动与 localStorage 同步
- 提供便捷的状态更新方法

### 3. 扩展的 Pomodoro Hook

位于 `features/pomodoro/usePomodoroWithPersistence.ts`，提供带持久化的番茄钟功能：

- 保存番茄钟状态到本地
- 记录专注会话到游戏状态
- 自动恢复之前的计时状态

## 数据结构

游戏状态包含以下字段：

```typescript
interface GameState {
  day: number;                    // 当前天数
  balance: number;                // 余额（金币）
  xp: number;                     // 经验值
  checkInStreak: number;          // 连续签到天数
  focusSessionsCompleted: number; // 专注会话完成次数
  totalFocusTime: number;         // 专注总时间（分钟）
  level: number;                  // 当前等级
  achievements: string[];         // 成就列表
  habits: any[];                  // 习惯列表
  projects: any[];                // 项目列表
  transactions: any[];            // 交易记录
  reviews: any[];                 // 评审日志
  settings: {                     // 应用设置
    pomodoroDuration: number;     // 番茄钟专注时长
    breakDuration: number;        // 休息时长
    longBreakDuration: number;    // 长休息时长
    autoStartBreaks: boolean;     // 自动开始休息
    autoStartPomodoros: boolean;  // 自动开始专注
    notificationEnabled: boolean; // 通知启用状态
  };
  createdAt: string;              // 创建时间
  updatedAt: string;              // 更新时间
}
```

## 使用方法

### 在组件中使用本地游戏状态

```typescript
import { useLocalGameState } from '../hooks/useLocalGameState';

const MyComponent = () => {
  const {
    balance,
    setBalance,
    xp,
    addXP,
    recordFocusSession,
    totalFocusTime,
    isDataLoaded
  } = useLocalGameState();

  // 等待数据加载完成
  if (!isDataLoaded) {
    return <div>加载中...</div>;
  }

  // 使用状态
  const handleAddXp = () => {
    addXP(50); // 增加50经验值
  };

  const handleCompleteFocusSession = () => {
    recordFocusSession(25); // 记录25分钟专注会话
  };

  return (
    <div>
      <p>余额: {balance}</p>
      <p>经验值: {xp}</p>
      <p>总专注时间: {totalFocusTime}分钟</p>
      <button onClick={handleAddXp}>增加经验值</button>
      <button onClick={handleCompleteFocusSession}>记录专注会话</button>
    </div>
  );
};
```

### 更新现有组件

对于使用旧版 `useGameState` 的组件，会自动使用新的持久化功能，无需额外修改。

## 数据安全与备份

### 导出数据
```typescript
import { localDataStore } from '../utils/LocalDataStore';

// 导出当前数据为 JSON 字符串
const exportedData = localDataStore.exportData();
console.log(exportedData); // 将数据显示或保存到文件
```

### 导入数据
```typescript
// 从 JSON 字符串导入数据
const success = localDataStore.importData(jsonString);
if (success) {
  console.log('数据导入成功');
} else {
  console.log('数据导入失败');
}
```

## 存储信息

可以检查当前存储使用情况：

```typescript
const storageInfo = localDataStore.getStorageInfo();
console.log(`已使用: ${storageInfo.size} 字节`);
console.log(`存储限制: ${storageInfo.limit} 字节`);
console.log(`使用百分比: ${storageInfo.percentage.toFixed(2)}%`);
```

## 注意事项

1. localStorage 通常有 5-10MB 的存储限制
2. 数据仅存储在当前设备和浏览器中
3. 清除浏览器数据会丢失所有本地存储
4. 建议定期导出重要数据作为备份
5. 不要在本地存储敏感信息（如密码）

## 故障排除

### 数据未保存
- 检查浏览器是否启用了 localStorage
- 确认存储空间是否已满
- 查看控制台是否有错误信息

### 数据损坏
- 使用 `localDataStore.reset()` 重置数据
- 从备份中导入数据

### 性能问题
- 避免频繁更新大量数据
- 考虑批量更新操作