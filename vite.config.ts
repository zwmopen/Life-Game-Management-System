import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import { webdavProxyPlugin } from './plugins/webdav-proxy-plugin';

// 创建自定义中间件函数
function createAudioScanMiddleware() {
  return (req, res, next) => {
    if (req.url?.startsWith('/api/audio-files')) {
      console.log('API Request received:', req.url); // 添加调试日志
      const url = new URL(`http://${req.headers.host || 'localhost:3000'}${req.url}`);
      const folderParam = url.searchParams.get('folder');
      
      if (folderParam) {
        // 确保路径安全，防止路径遍历攻击
        const sanitizedFolder = path.normalize(folderParam).replace(/^((\.?\/\.\.)\/)+/, '').replace(/\\/g, '/');
        // 处理Windows路径分隔符问题
        const normalizedPath = sanitizedFolder.replace(/\\/g, '/');
        const fullPath = path.join(process.cwd(), 'public', normalizedPath);
        
        try {
          console.log('Attempting to read directory:', fullPath); // 调试日志
          if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            const files = fs.readdirSync(fullPath);
            const audioFiles = files.filter(file => {
              const ext = path.extname(file).toLowerCase();
              return ['.mp3', '.wav', '.ogg', '.m4a'].includes(ext);
            });
            
            console.log(`Found ${audioFiles.length} audio files in ${fullPath}:`, audioFiles); // 添加调试日志
            
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              files: audioFiles,
              folder: normalizedPath,
              fullPath: fullPath
            }));
            return;
          } else {
            console.log(`Directory not found: ${fullPath}`); // 添加调试日志
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 404;
            res.end(JSON.stringify({
              success: false,
              error: 'Directory not found',
              requestedPath: fullPath
            }));
            return;
          }
        } catch (error) {
          console.log('Error scanning directory:', error); // 添加调试日志
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({
            success: false,
            error: error.message,
            requestedPath: fullPath
          }));
          return;
        }
      } else {
        console.log('Missing folder parameter'); // 添加调试日志
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 400;
        res.end(JSON.stringify({
          success: false,
          error: 'Missing folder parameter'
        }));
        return;
      }
    }
    next();
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      server: {
        port: 3003,
        host: '0.0.0.0',
        // 减少开发服务器日志输出
        logLevel: 'warn',
        // WebDAV代理由插件处理
      },
      plugins: [
        react(), 
        webdavProxyPlugin(),
        // 添加音频文件扫描中间件
        {
          name: 'audio-scan-middleware',
          configureServer(server) {
            // 仅在开发环境添加音频扫描中间件
            if (mode === 'development') {
              server.middlewares.use(createAudioScanMiddleware());
            }
          },
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // 生产构建时移除console和debugger
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        },
        // 支持GitHub Pages部署
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
          output: {
            manualChunks: {
              react: ['react', 'react-dom'],
              recharts: ['recharts'],
              dndkit: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities']
            }
          }
        }
      }
    };
});
