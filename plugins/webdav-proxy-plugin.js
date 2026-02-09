import { createProxyMiddleware } from 'http-proxy-middleware';

/**
 * WebDAV 代理插件 - 解决 CORS 问题
 */
export const webdavProxyPlugin = () => {
  return {
    name: 'webdav-proxy',
    configureServer(server) {
      // 处理 OPTIONS 预检请求（在代理之前处理）
      server.middlewares.use('/webdav', (req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.header('Access-Control-Allow-Origin', '*');
          res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PROPFIND, MKCOL');
          res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Target-Url, X-Target-Path, Depth');
          res.sendStatus(200);
        } else {
          next();
        }
      });
      
      // 添加代理中间件
      server.middlewares.use('/webdav', createProxyMiddleware({
        // 使用一个通用的目标，实际目标会在onProxyReq中动态设置
        target: 'https://dav.jianguoyun.com',
        changeOrigin: true,
        followRedirects: true,
        onProxyReq: (proxyReq, req, res) => {
          // 从请求头中获取真实的目标 URL
          const targetUrl = req.headers['x-target-url'];
          if (targetUrl) {
            // 重写代理目标
            const url = new URL(targetUrl);
            
            // 更新代理请求的目标
            proxyReq.path = url.pathname + url.search;
            proxyReq.setHeader('Host', url.host);
            
            // 确保目标协议正确
            proxyReq.protocol = url.protocol;
          }
          
          // 设置认证头
          const authHeader = req.headers['authorization'];
          if (authHeader) {
            proxyReq.setHeader('Authorization', authHeader);
          }
          
          // 添加必要的WebDAV头
          const depthHeader = req.headers['depth'];
          if (depthHeader) {
            proxyReq.setHeader('Depth', depthHeader);
          }
        },
        onProxyRes: (proxyRes, req, res) => {
          // 确保响应头允许 CORS
          proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PROPFIND, MKCOL';
          proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, X-Target-Url, X-Target-Path, Depth';
          
          // 移除可能导致问题的头
          delete proxyRes.headers['content-security-policy'];
          delete proxyRes.headers['x-frame-options'];
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
    },
  };
};