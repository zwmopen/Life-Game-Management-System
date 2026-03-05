import type { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'https';
import http from 'http';

/**
 * WebDAV 代理 API - Vercel Serverless Function
 * 用于解决浏览器 CORS 限制，代理请求到坚果云 WebDAV 服务器
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PROPFIND, MKCOL, MOVE, COPY');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Target-Url, X-Target-Path, Depth, Content-Length, Expect');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(200).end();
    return;
  }

  // 获取目标 URL
  const targetUrl = req.headers['x-target-url'];
  
  if (!targetUrl) {
    res.status(400).json({ 
      error: 'Missing X-Target-Url header',
      message: '请在请求头中添加 X-Target-Url 指定目标 WebDAV 服务器'
    });
    return;
  }

  console.log(`[WebDAV Proxy] ${req.method} -> ${targetUrl}`);

  try {
    const url = new URL(targetUrl as string);
    
    // 收集请求体
    const body = await collectRequestBody(req);
    
    // 构建代理请求选项
    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: req.method,
      headers: {
        'Host': url.hostname,
        'Authorization': req.headers['authorization'] || '',
        'Content-Type': req.headers['content-type'] || 'application/octet-stream',
        'Content-Length': Buffer.byteLength(body),
      }
    };

    // 添加必要的 WebDAV 头
    if (req.headers['depth']) {
      options.headers!['Depth'] = req.headers['depth'];
    }
    if (req.headers['expect']) {
      options.headers!['Expect'] = req.headers['expect'];
    }
    if (req.headers['content-transfer-encoding']) {
      options.headers!['Content-Transfer-Encoding'] = req.headers['content-transfer-encoding'];
    }

    console.log('[WebDAV Proxy] 请求选项:', {
      hostname: options.hostname,
      port: options.port,
      path: options.path,
      method: options.method,
      hasAuth: !!req.headers['authorization']
    });

    // 发送代理请求
    const httpModule = url.protocol === 'https:' ? https : http;
    
    return new Promise<void>((resolve, reject) => {
      const proxyReq = httpModule.request(options, (proxyRes) => {
        console.log(`[WebDAV Proxy] 响应: ${proxyRes.statusCode}`);

        // 设置 CORS 头
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PROPFIND, MKCOL, MOVE, COPY');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Target-Url, X-Target-Path, Depth, Content-Length, Expect');
        
        // 设置响应状态码
        res.status(proxyRes.statusCode || 200);
        
        // 复制响应头（排除 transfer-encoding）
        Object.keys(proxyRes.headers).forEach(key => {
          const value = proxyRes.headers[key];
          if (key.toLowerCase() !== 'transfer-encoding' && value) {
            res.setHeader(key, value);
          }
        });

        // 管道响应体
        proxyRes.pipe(res);
        
        proxyRes.on('end', () => {
          resolve();
        });
        
        proxyRes.on('error', (err) => {
          console.error('[WebDAV Proxy] 响应流错误:', err);
          reject(err);
        });
      });

      proxyReq.on('error', (err) => {
        console.error('[WebDAV Proxy] 请求错误:', err);
        
        // 坚果云特定的错误处理
        if (url.hostname.includes('jianguoyun.com')) {
          res.status(502).json({ 
            error: 'Proxy error',
            message: '无法连接到坚果云服务器，请检查：1) 网络连接是否正常 2) WebDAV 服务是否已启用 3) 用户名和应用密码是否正确',
            details: err.message
          });
        } else {
          res.status(502).json({ 
            error: 'Proxy error', 
            message: err.message 
          });
        }
        resolve();
      });

      // 设置超时
      proxyReq.setTimeout(30000, () => {
        console.error('[WebDAV Proxy] 请求超时');
        proxyReq.destroy();
        res.status(504).json({ 
          error: 'Gateway Timeout',
          message: '请求超时，请稍后重试'
        });
        resolve();
      });

      // 发送请求体
      if (body) {
        proxyReq.write(body);
      }
      proxyReq.end();
    });

  } catch (err: any) {
    console.error('[WebDAV Proxy] 解析目标URL失败:', err);
    res.status(400).json({ 
      error: 'Invalid target URL', 
      message: err.message 
    });
  }
}

/**
 * 收集请求体
 */
function collectRequestBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', reject);
  });
}
