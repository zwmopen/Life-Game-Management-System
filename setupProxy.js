// setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 获取环境变量中的端口，如果没有则使用默认值
  const targetPort = process.env.PORT || 3000;
  const targetUrl = `http://localhost:${targetPort}`;

  // 创建支持WebDAV方法的代理中间件
  const webdavProxy = createProxyMiddleware({
    // 目标服务器为坚果云WebDAV服务
    target: 'https://dav.jianguoyun.com',
    changeOrigin: true,
    // 支持所有WebDAV方法
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'PROPFIND', 'PROPPATCH', 'MKCOL', 'COPY', 'MOVE', 'LOCK', 'UNLOCK'],
    // 处理OPTIONS预检请求
    onProxyReq: (proxyReq, req, res) => {
      // 添加必要的头部
      proxyReq.setHeader('Access-Control-Allow-Origin', '*');
      proxyReq.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS, PROPFIND, PROPPATCH, MKCOL, COPY, MOVE, LOCK, UNLOCK');
      proxyReq.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Depth');
      
      // 如果是WebDAV请求，确保设置正确的头部
      if (req.method === 'PROPFIND' || req.method === 'MKCOL') {
        proxyReq.setHeader('Content-Type', 'application/xml; charset=utf-8');
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // 设置CORS头部
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS, PROPFIND, PROPPATCH, MKCOL, COPY, MOVE, LOCK, UNLOCK';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Depth';
    },
    logLevel: 'debug' // 开启调试日志
  });

  // 代理所有以 /webdav 开头的请求到坚果云WebDAV
  app.use('/webdav', webdavProxy);
  
  // 如果需要直接代理WebDAV根路径
  app.use('/dav', webdavProxy);
};