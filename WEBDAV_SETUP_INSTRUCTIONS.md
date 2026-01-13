# 坚果云WebDAV备份功能快速配置指南

## 概述
本指南将帮助您快速配置和使用人生游戏管理系统的坚果云WebDAV备份功能。

## 配置步骤

### 1. 环境准备
确保已安装所需依赖：
```bash
npm install http-proxy-middleware
```

### 2. 验证现有配置
项目中已包含以下文件：
- `utils/WebDAVBackup.js` - WebDAV客户端工具类
- `plugins/webdav-proxy-plugin.js` - Vite代理插件
- `test/webdav-test.js` - 测试代码
- `docs/webdav-backup-guide.md` - 详细使用指南

### 3. 启动开发服务器
```bash
npm run dev
```

默认端口为3003，如果需要其他端口，请在命令中指定：
```bash
npm run dev -- --port 3004
```

### 4. 配置WebDAV参数
在前端界面中输入以下参数：

| 字段 | 值 | 说明 |
|------|-----|------|
| 服务器地址 | `https://dav.jianguoyun.com/dav/` | 坚果云WebDAV服务地址 |
| 用户名 | `2594707308@qq.com` | 您的坚果云账号 |
| 密码 | `aecne4vaypmn8zid` | 您的应用密码 |
| 基础路径 | `/人生游戏管理系统` | 预先在坚果云中创建的目录 |

## 测试连接

### 在浏览器中测试
1. 启动应用后，在浏览器控制台中运行：
```javascript
window.runWebDAVTest()
```

2. 查看控制台输出，确认各项功能是否正常

### 手动测试方法
```javascript
// 创建WebDAV客户端实例
const webdavConfig = {
  serverUrl: 'https://dav.jianguoyun.com/dav/',
  username: '2594707308@qq.com',
  password: 'aecne4vaypmn8zid',
  basePath: '/人生游戏管理系统',
  debug: true
};

const webdavClient = new WebDAVBackup(webdavConfig);

// 测试连接
const result = await webdavClient.testConnection();
console.log(result);
```

## 常见问题解决

### 1. 连接失败 (401/403错误)
- 确认用户名和密码正确
- 确认使用的是坚果云应用密码而非登录密码
- 检查坚果云账号是否正常

### 2. CORS错误
- 确认Vite开发服务器正在运行
- 检查`plugins/webdav-proxy-plugin.js`是否正确加载

### 3. 代理配置问题
- 确认`http-proxy-middleware`已正确安装
- 检查Vite配置中是否包含webdavProxyPlugin

## 使用技巧

### 自动备份
您可以设置定时备份，例如在应用退出前自动执行备份：
```javascript
// 在应用卸载前执行备份
window.addEventListener('beforeunload', async () => {
  const backupData = await collectAppData(); // 收集应用数据
  const webdavClient = new WebDAVBackup(config);
  await webdavClient.backupAppData(backupData);
});
```

### 错误处理
始终对WebDAV操作进行错误处理：
```javascript
try {
  const result = await webdavClient.backupAppData(appData);
  if (result.success) {
    console.log('备份成功:', result.message);
  } else {
    console.error('备份失败:', result.message);
  }
} catch (error) {
  console.error('备份过程中发生错误:', error);
}
```

## 故障排除

### 检查代理服务
1. 确认Vite服务器正常运行
2. 检查控制台是否有代理相关的错误信息
3. 验证代理中间件是否正确加载

### 检查网络连接
1. 确认能正常访问坚果云WebDAV服务
2. 检查防火墙或网络设置是否阻止了相关请求

### 检查权限
1. 确认坚果云账号有足够的权限进行读写操作
2. 验证目标目录存在且可写入

## 技术细节

### 代理工作原理
1. 前端请求发送到 `/webdav/*` 路径
2. Vite代理捕获请求并添加 `X-Target-Url` 头部
3. 代理将请求转发到真实的坚果云WebDAV服务器
4. 响应返回给前端，绕过CORS限制

### 安全考虑
- 所有认证信息通过HTTPS传输
- 路径参数经过安全验证，防止路径遍历攻击
- 代理服务不存储任何敏感信息

## 联系支持

如果遇到问题，请参考：
- `docs/webdav-backup-guide.md` - 详细使用文档
- 检查控制台错误日志
- 验证坚果云WebDAV服务状态