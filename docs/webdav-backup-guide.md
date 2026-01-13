# 坚果云WebDAV备份功能使用指南

## 概述
本文档介绍了如何在人生游戏管理系统中使用坚果云WebDAV备份功能，实现数据的云端备份与恢复。

## 配置要求

### 坚果云账号设置
1. 注册坚果云账号（推荐使用邮箱：2594707308@qq.com）
2. 开通WebDAV服务
3. 创建应用密码（示例：aecne4vaypmn8zid）

### WebDAV路径设置
1. 在坚果云中创建名为 `人生游戏管理系统` 的文件夹
2. 确保该文件夹具有读写权限

## 配置参数

| 参数 | 值 | 说明 |
|------|-----|-----|
| 服务器地址 | `https://dav.jianguoyun.com/dav/` | 坚果云WebDAV标准地址 |
| 用户名 | `2594707308@qq.com` | 坚果云账号 |
| 密码 | `aecne4vaypmn8zid` | 坚果云应用密码 |
| 基础路径 | `/人生游戏管理系统` | 数据备份的基础目录 |

## 使用方法

### 1. 引入WebDAV工具类
```javascript
import WebDAVBackup from '../utils/WebDAVBackup';
```

### 2. 初始化备份客户端
```javascript
const webdavConfig = {
  serverUrl: 'https://dav.jianguoyun.com/dav/',
  username: '2594707308@qq.com',
  password: 'aecne4vaypmn8zid',
  basePath: '/人生游戏管理系统',
  debug: true
};

const webdavClient = new WebDAVBackup(webdavConfig);
```

### 3. 测试连接
```javascript
const result = await webdavClient.testConnection();
if (result.success) {
  console.log('连接成功');
} else {
  console.error('连接失败:', result.message);
}
```

### 4. 执行备份
```javascript
const appData = {
  settings: { /* 应用设置数据 */ },
  gameStates: { /* 游戏状态数据 */ },
  habits: { /* 习惯数据 */ }
};

const backupResult = await webdavClient.backupAppData(appData);
console.log(backupResult.message);
```

### 5. 恢复数据
```javascript
const restoreResult = await webdavClient.restoreFromWebDAV('/路径/备份文件.json');
if (restoreResult.success) {
  console.log('恢复的数据:', restoreResult.data);
}
```

## API 方法说明

### WebDAVBackup 类方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `testConnection()` | 无 | Promise<Object> | 测试WebDAV连接 |
| `createDirectory(path)` | `path`: 目录路径 | Promise<Object> | 创建目录 |
| `uploadFile(filePath, content)` | `filePath`: 文件路径, `content`: 文件内容 | Promise<Object> | 上传文件 |
| `downloadFile(filePath)` | `filePath`: 文件路径 | Promise<Object> | 下载文件 |
| `listDirectory(path)` | `path`: 目录路径 | Promise<Object> | 列出目录内容 |
| `backupAppData(data)` | `data`: 待备份数据 | Promise<Object> | 备份应用数据 |
| `restoreFromWebDAV(path)` | `path`: 备份文件路径 | Promise<Object> | 从WebDAV恢复数据 |

## 代理配置

项目使用Vite开发服务器的代理功能来解决CORS问题：

```javascript
// plugins/webdav-proxy-plugin.js
server.middlewares.use('/webdav', createProxyMiddleware({
  target: 'http://localhost:3000', // 默认目标
  changeOrigin: true,
  pathRewrite: { '^/webdav': '' }, // 移除 /webdav 前缀
  onProxyReq: (proxyReq, req, res) => {
    // 从请求头中获取真实的目标 URL
    const targetUrl = req.headers['x-target-url'];
    if (targetUrl) {
      const url = new URL(targetUrl);
      proxyReq.setHeader('Host', url.host);
      proxyReq._currentRequest.path = url.pathname + url.search;
    }
    // 设置认证头
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      proxyReq.setHeader('Authorization', authHeader);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // 确保响应头允许 CORS
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, X-Target-Url, X-Target-Path';
  }
}));
```

## 常见问题及解决方案

### 401 Unauthorized（未授权）
- 检查用户名和密码是否正确
- 确认使用的是坚果云应用密码，而非登录密码
- 验证账号是否已激活WebDAV服务

### 403 Forbidden（禁止访问）
- 检查基础路径是否存在且有访问权限
- 确认账号是否有写入权限
- 检查坚果云账号是否欠费或受限

### 405 Method Not Allowed（方法不允许）
- 通常是目录已存在导致MKCOL请求返回405，这是正常现象
- 检查代理配置是否支持所有WebDAV方法
- 确认服务器是否正确处理PROPFIND、MKCOL等WebDAV特有方法

### 503 Service Unavailable（服务不可用）
- 检查坚果云服务器状态
- 确认网络连接正常
- 验证代理服务是否正常运行

## 安全注意事项

1. **应用密码管理**：不要将应用密码硬编码在生产环境中，应使用环境变量或安全的配置管理方案
2. **路径安全**：所有路径参数都经过规范化处理，防止路径遍历攻击
3. **CORS策略**：开发环境中允许所有来源，生产环境应限制为特定域名
4. **数据加密**：敏感数据应在传输前进行适当加密

## 测试方法

运行测试代码验证WebDAV功能：
```bash
# 在浏览器控制台中执行
window.runWebDAVTest()
```

测试流程包括：
1. 连接测试
2. 目录创建
3. 文件上传/下载
4. 目录列表
5. 完整备份功能
6. 数据恢复测试