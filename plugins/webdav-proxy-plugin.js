import http from 'http';
import https from 'https';

/**
 * WebDAV 代理插件 - 解决 CORS 问题
 * 使用自定义中间件直接转发请求
 */
export const webdavProxyPlugin = () => {
  return {
    name: 'webdav-proxy',
    configureServer(server) {
      server.middlewares.use('/webdav', async (req, res, next) => {
        // 处理 OPTIONS 预检请求
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PROPFIND, MKCOL');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Target-Url, X-Target-Path, Depth');
          res.statusCode = 200;
          res.end();
          return;
        }

        // 获取目标 URL
        const targetUrl = req.headers['x-target-url'];
        if (!targetUrl) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ error: 'Missing X-Target-Url header' }));
          return;
        }

        console.log(`[WebDAV Proxy] 收到请求: ${req.method}, X-Target-Url: ${targetUrl}`);

        try {
          const url = new URL(targetUrl);
          
          // 收集请求体
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          
          req.on('end', () => {
            // 构建代理请求选项
            const options = {
              hostname: url.hostname,
              port: url.port || (url.protocol === 'https:' ? 443 : 80),
              path: url.pathname + url.search,
              method: req.method,
              headers: {
                'Host': url.hostname,
                'Authorization': req.headers['authorization'] || '',
                'Content-Type': req.headers['content-type'] || 'application/json',
                'Content-Length': Buffer.byteLength(body),
              }
            };

            // 添加 Depth 头（用于 PROPFIND）
            if (req.headers['depth']) {
              options.headers['Depth'] = req.headers['depth'];
            }

            console.log(`[WebDAV Proxy] ${req.method} -> ${url.href}`);
            console.log('[WebDAV Proxy] 请求头:', {
              host: options.headers.Host,
              authorization: options.headers.Authorization ? '***已设置***' : '未设置',
              path: options.path
            });

            // 选择 http 或 https 模块
            const httpModule = url.protocol === 'https:' ? https : http;

            // 发送代理请求
            const proxyReq = httpModule.request(options, (proxyRes) => {
              console.log(`[WebDAV Proxy] 响应: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);

              // 设置 CORS 头
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PROPFIND, MKCOL');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Target-Url, X-Target-Path, Depth');
              
              // 设置响应状态码和头
              res.statusCode = proxyRes.statusCode || 200;
              
              // 复制响应头
              Object.keys(proxyRes.headers).forEach(key => {
                if (key.toLowerCase() !== 'transfer-encoding') {
                  res.setHeader(key, proxyRes.headers[key] || '');
                }
              });

              // 管道响应体
              proxyRes.pipe(res);
            });

            proxyReq.on('error', (err) => {
              console.error('[WebDAV Proxy] 请求错误:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
            });

            // 发送请求体
            if (body) {
              proxyReq.write(body);
            }
            proxyReq.end();
          });

        } catch (err) {
          console.error('[WebDAV Proxy] 解析目标URL失败:', err);
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ error: 'Invalid target URL', message: err.message }));
        }
      });
    },
  };
};
