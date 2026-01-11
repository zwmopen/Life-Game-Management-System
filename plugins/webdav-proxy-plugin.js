import { createProxyMiddleware } from 'http-proxy-middleware';

/**
 * WebDAV 代理插件 - 解决 CORS 问题
 */
export const webdavProxyPlugin = () => {
  return {
    name: 'webdav-proxy',
    configureServer(server) {
      // 添加代理中间件
      server.middlewares.use('/webdav', createProxyMiddleware({
        // 目标URL将从请求头中获取
        target: 'http://localhost:3000', // 默认目标，实际会通过onProxyReq重定向
        changeOrigin: true,
        pathRewrite: {
          '^/webdav': '', // 移除 /webdav 前缀
        },
        onProxyReq: (proxyReq, req, res) => {
          // 从请求头中获取真实的目标 URL
          const targetUrl = req.headers['x-target-url'];
          if (targetUrl) {
            // 重写代理目标
            const url = new URL(targetUrl);
            proxyReq.setHeader('Host', url.host);
            // 更新代理目标
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
        },
        onError: (err, req, res) => {
          console.error('WebDAV Proxy Error:', err);
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
        }
      }));
      
      // 处理 OPTIONS 预检请求
      server.middlewares.use('/webdav', (req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.header('Access-Control-Allow-Origin', '*');
          res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Target-Url, X-Target-Path');
          res.sendStatus(200);
        } else {
          next();
        }
      });
    },
  };
};