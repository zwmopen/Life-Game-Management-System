/**
 * WebDAV 代理 API - Netlify Function
 * 用于解决浏览器 CORS 限制，代理请求到坚果云 WebDAV 服务器
 */

const https = require('https');
const http = require('http');

exports.handler = async (event, context) => {
  // 处理 CORS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PROPFIND, MKCOL, MOVE, COPY',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Target-Url, X-Target-Path, Depth, Content-Length, Expect',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  // 获取目标 URL
  const targetUrl = event.headers['x-target-url'];
  
  if (!targetUrl) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Missing X-Target-Url header',
        message: '请在请求头中添加 X-Target-Url 指定目标 WebDAV 服务器'
      }),
    };
  }

  console.log(`[WebDAV Proxy] ${event.httpMethod} -> ${targetUrl}`);

  try {
    const url = new URL(targetUrl);
    const body = event.body || '';
    
    // 构建代理请求选项
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: event.httpMethod,
      headers: {
        'Host': url.hostname,
        'Authorization': event.headers['authorization'] || '',
        'Content-Type': event.headers['content-type'] || 'application/octet-stream',
        'Content-Length': Buffer.byteLength(body),
      }
    };

    // 添加必要的 WebDAV 头
    if (event.headers['depth']) {
      options.headers['Depth'] = event.headers['depth'];
    }
    if (event.headers['expect']) {
      options.headers['Expect'] = event.headers['expect'];
    }

    console.log('[WebDAV Proxy] 请求选项:', {
      hostname: options.hostname,
      port: options.port,
      path: options.path,
      method: options.method,
      hasAuth: !!event.headers['authorization']
    });

    // 发送代理请求
    const httpModule = url.protocol === 'https:' ? https : http;
    
    return new Promise((resolve, reject) => {
      const proxyReq = httpModule.request(options, (proxyRes) => {
        console.log(`[WebDAV Proxy] 响应: ${proxyRes.statusCode}`);

        let responseBody = '';
        proxyRes.on('data', chunk => {
          responseBody += chunk.toString();
        });

        proxyRes.on('end', () => {
          const responseHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PROPFIND, MKCOL, MOVE, COPY',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Target-Url, X-Target-Path, Depth, Content-Length, Expect',
          };

          // 复制响应头（排除 transfer-encoding）
          Object.keys(proxyRes.headers).forEach(key => {
            const value = proxyRes.headers[key];
            if (key.toLowerCase() !== 'transfer-encoding' && value) {
              responseHeaders[key] = value;
            }
          });

          resolve({
            statusCode: proxyRes.statusCode || 200,
            headers: responseHeaders,
            body: responseBody,
          });
        });

        proxyRes.on('error', (err) => {
          console.error('[WebDAV Proxy] 响应流错误:', err);
          resolve({
            statusCode: 502,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              error: 'Proxy error', 
              message: err.message 
            }),
          });
        });
      });

      proxyReq.on('error', (err) => {
        console.error('[WebDAV Proxy] 请求错误:', err);
        
        let errorMessage = err.message;
        if (url.hostname.includes('jianguoyun.com')) {
          errorMessage = '无法连接到坚果云服务器，请检查：1) 网络连接是否正常 2) WebDAV 服务是否已启用 3) 用户名和应用密码是否正确';
        }

        resolve({
          statusCode: 502,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            error: 'Proxy error',
            message: errorMessage,
            details: err.message
          }),
        });
      });

      // 设置超时
      proxyReq.setTimeout(30000, () => {
        console.error('[WebDAV Proxy] 请求超时');
        proxyReq.destroy();
        resolve({
          statusCode: 504,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            error: 'Gateway Timeout',
            message: '请求超时，请稍后重试'
          }),
        });
      });

      // 发送请求体
      if (body) {
        proxyReq.write(body);
      }
      proxyReq.end();
    });

  } catch (err) {
    console.error('[WebDAV Proxy] 解析目标URL失败:', err);
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Invalid target URL', 
        message: err.message 
      }),
    };
  }
};
