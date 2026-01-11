import { localDataStore } from './utils/LocalDataStore';

console.log('=== 本地数据存储系统测试 ===');

try {
  console.log('\n1. 获取初始状态...');
  const initialState = localDataStore.getState();
  console.log('初始状态:', {
    balance: initialState.balance,
    xp: initialState.xp,
    focusSessionsCompleted: initialState.focusSessionsCompleted
  });

  console.log('\n2. 增加100金币...');
  localDataStore.addBalance(100);
  const stateAfterBalance = localDataStore.getState();
  console.log('增加金币后:', {
    balance: stateAfterBalance.balance,
    xp: stateAfterBalance.xp
  });

  console.log('\n3. 记录一次25分钟专注会话...');
  localDataStore.recordFocusSession(25);
  const stateAfterFocus = localDataStore.getState();
  console.log('记录专注会话后:', {
    focusSessionsCompleted: stateAfterFocus.focusSessionsCompleted,
    balance: stateAfterFocus.balance,
    xp: stateAfterFocus.xp,
    totalFocusTime: stateAfterFocus.totalFocusTime
  });

  console.log('\n4. 检查存储信息...');
  const storageInfo = localDataStore.getStorageInfo();
  console.log('存储信息:', {
    size: `${storageInfo.size} 字节`,
    percentage: `${storageInfo.percentage.toFixed(2)}%`
  });

  console.log('\n5. 测试数据导出...');
  const exportedData = localDataStore.exportData();
  console.log('导出数据长度:', exportedData.length, '字符');
  
  console.log('\n=== 测试完成 ===');
} catch (error) {
  console.error('测试过程中发生错误:', error);
}