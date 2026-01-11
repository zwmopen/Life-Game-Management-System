// WebDAV 代理服务，用于绕过浏览器 CORS 限制
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 启用 CORS
app.use(cors());

// WebDAV 代理中间件
const webdavProxy = createProxyMiddleware('/webdav', {
  target: '', // 这将在运行时动态设置
  changeOrigin: true,
  pathRewrite: {
    '^/webdav': '', // 移除 /webdav 前缀
  },
  onProxyReq: (proxyReq, req, res) => {
    // 从请求头中获取目标 URL 并设置代理目标
    const targetUrl = req.headers['x-target-url'];
    if (targetUrl) {
      proxyReq.setHeader('Host', new URL(targetUrl).host);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // 确保响应头允许 CORS
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }
});

// 处理 OPTIONS 预检请求
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Target-Url');
  res.sendStatus(200);
});

// 代理 WebDAV 请求
app.use('/webdav', (req, res, next) => {
  const targetUrl = req.headers['x-target-url'];
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing X-Target-Url header' });
  }

  // 动态创建代理中间件
  const dynamicProxy = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/webdav': '', // 移除 /webdav 前缀
    },
    onProxyReq: (proxyReq, req, res) => {
      // 设置认证头
      const authHeader = req.headers['authorization'];
      if (authHeader) {
        proxyReq.setHeader('Authorization', authHeader);
      }
      proxyReq.setHeader('Host', new URL(targetUrl).host);
    },
    onProxyRes: (proxyRes, req, res) => {
      // 确保响应头允许 CORS
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, X-Target-Url';
    }
  });

  dynamicProxy(req, res, next);
});

// 提供静态文件服务
app.use(express.static('public'));

console.log(`WebDAV 代理服务器运行在 http://localhost:${PORT}`);
app.listen(PORT, () => {
  console.log(`代理服务已启动，监听端口 ${PORT}`);
  console.log('使用方法：');
  console.log('- 在请求头中添加 X-Target-Url 来指定目标 WebDAV 服务器');
  console.log('- 例如：X-Target-Url: https://dav.jianguoyun.com/dav/');
});