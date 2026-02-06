import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import { webdavProxyPlugin } from './plugins/webdav-proxy-plugin';

// 创建自定义中间件函数
function createAudioScanMiddleware() {
  return (req, res, next) => {
    if (req.url?.startsWith('/api/audio-files')) {
      // API请求处理中...
      const url = new URL(`http://${req.headers.host || 'localhost:3000'}${req.url}`);
      const folderParam = url.searchParams.get('folder');
      
      if (folderParam) {
        // 确保路径安全，防止路径遍历攻击
        const sanitizedFolder = path.normalize(folderParam).replace(/^((\.?\/\.\.)\/)+/, '').replace(/\\/g, '/');
        // 处理Windows路径分隔符问题
        const normalizedPath = sanitizedFolder.replace(/\\/g, '/');
        const fullPath = path.join(process.cwd(), 'public', normalizedPath);
        
        try {
          // 尝试读取目录...
          if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            const files = fs.readdirSync(fullPath);
            const audioFiles = files.filter(file => {
              const ext = path.extname(file).toLowerCase();
              return ['.mp3', '.wav', '.ogg', '.m4a'].includes(ext);
            });
            
            // 找到音频文件...
            
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
            // 目录未找到...
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
          // 扫描目录出错...
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
        // 缺少文件夹参数...
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
      // 配置base路径为GitHub仓库名称，解决GitHub Pages部署后资源加载问题
      base: '/Life-Game-Management-System/',
      server: {
        port: 3000,
        host: '0.0.0.0',
        // 减少开发服务器日志输出
        logLevel: 'warn',
        // 启动时自动打开浏览器
        open: true,
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
            drop_console: false,
            drop_debugger: true,
            // 更严格的压缩选项
            passes: 2,
            pure_funcs: [],
            // 优化变量名
            reduce_vars: true,
            // 内联常量
            inline: true
          },
          mangle: {
            toplevel: true,
            properties: {
              regex: /^_/,
              keep_quoted: true
            }
          },
          // 生成更紧凑的输出
          output: {
            beautify: false,
            comments: false
          }
        },
        // 支持GitHub Pages部署
        outDir: 'dist',
        assetsDir: 'assets',
        // 生成source map以方便调试
        sourcemap: true,
        // 启用CSS代码分割
        cssCodeSplit: true,
        // 优化大文件处理
        chunkSizeWarningLimit: 1000,
        // 启用依赖预构建
        optimizeDeps: {
          include: ['react', 'react-dom', 'lucide-react', 'recharts', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          exclude: ['@capacitor/core', '@capacitor/android', '@capacitor/ios'],
          // 强制预构建所有依赖
          force: true,
          // 启用依赖缓存
          cacheDir: 'node_modules/.vite-cache'
        },
        rollupOptions: {
          output: {
            manualChunks: {
              react: ['react', 'react-dom'],
              recharts: ['recharts'],
              dndkit: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
              three: ['three', 'three-stdlib'],
              googlegenai: ['@google/genai'],
              lucide: ['lucide-react'],
              crypto: ['crypto-js', 'bcryptjs', 'jsonwebtoken'],
              audio: ['@tweenjs/tween.js'],
              confetti: ['canvas-confetti']
            },
            // 优化chunk命名
            entryFileNames: 'assets/js/[name]-[hash].js',
            chunkFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
            // 优化输出
            compact: true,
            // 启用代码分割
            codeSplit: true,
            // 优化动态导入
            manualChunksSortMode: 'size'
          },
          // 树摇配置
          treeshake: {
            moduleSideEffects: false,
            propertyReadSideEffects: false,
            tryCatchDeoptimization: false
          },
          // 优化依赖
          plugins: [
            // 移除未使用的导入
            {
              name: 'remove-unused-imports',
              transform(code, id) {
                if (!id.endsWith('.ts') && !id.endsWith('.tsx') && !id.endsWith('.js') && !id.endsWith('.jsx')) {
                  return null;
                }
                // 这里可以添加更复杂的未使用导入检测逻辑
                return null;
              }
            }
          ]
        },
        // 启用持久化缓存
        cacheDir: 'node_modules/.vite-build-cache',
        // 启用多线程构建
        workers: true,
        // 优化资产大小
        assetInlineLimit: 4096 // 4KB以下的资产内联
      }
    };
});
