// WebDAV 代理服务，用于绕过浏览器 CORS 限制
import express from 'express';
import cors from 'cors';
import http from 'http';
import https from 'https';

const app = express();
const PORT = 3002;

// 启用 CORS
app.use(cors());

// 处理 OPTIONS 预检请求
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PROPFIND');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Target-Url, Depth');
    res.sendStatus(200);
  } else {
    next();
  }
});

// 全局请求日志
app.use((req, res, next) => {
    console.log('收到请求:', {
        method: req.method,
        url: req.originalUrl,
        hasAuth: 'authorization' in req.headers,
        depth: req.headers['depth']
    });
    next();
});

// 代理 WebDAV 请求
app.use('/webdav', (req, res) => {
    const targetUrl = req.headers['x-target-url'];
    console.log('WebDAV 代理请求:', {
        method: req.method,
        url: req.originalUrl,
        targetUrl: targetUrl
    });
    
    if (!targetUrl) {
        console.log('缺少 X-Target-Url 头');
        return res.status(400).json({ error: 'Missing X-Target-Url header' });
    }

    try {
        // 解析目标 URL
        const url = new URL(targetUrl);
        const path = req.originalUrl.replace('/webdav', '');
        
        // 修复路径中的双斜杠
        let finalPath = url.pathname + path;
        finalPath = finalPath.replace(/\/\//g, '/');
        
        const fullTargetUrl = url.origin + finalPath;
        
        console.log('代理到:', fullTargetUrl);
        
        // 构建请求选项
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: finalPath,
            method: req.method,
            headers: {
                ...req.headers
            }
        };
        
        // 确保设置正确的host头
        options.headers.host = url.hostname;
        
        // 移除不需要转发的头
        delete options.headers['connection'];
        delete options.headers['x-target-url'];
        
        console.log('请求选项:', {
            hostname: options.hostname,
            port: options.port,
            path: options.path,
            method: options.method,
            hasAuth: 'authorization' in options.headers
        });
        
        // 创建代理请求
        const proxyReq = (url.protocol === 'https:' ? https : http).request(options, (proxyRes) => {
            console.log('收到响应:', {
                statusCode: proxyRes.statusCode,
                statusMessage: proxyRes.statusMessage
            });
            
            // 设置响应头
            res.status(proxyRes.statusCode);
            Object.entries(proxyRes.headers).forEach(([key, value]) => {
                if (key !== 'access-control-allow-origin') {
                    res.setHeader(key, value);
                }
            });
            
            // 添加 CORS 头
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PROPFIND');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Target-Url, Depth');
            
            // 转发响应数据
            proxyRes.pipe(res);
        });
        
        // 处理代理请求错误
        proxyReq.on('error', (err) => {
            console.error('代理请求错误:', err.message);
            res.status(500).json({ error: 'Proxy error: ' + err.message });
        });
        
        // 转发请求数据
        req.pipe(proxyReq);
        
    } catch (error) {
        console.error('代理错误:', error.message);
        res.status(500).json({ error: 'Proxy error: ' + error.message });
    }
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