const fs = require('fs');
const path = require('path');

// 定义文件路径
const folderPath = 'd:\\AI编程\\人生游戏管理系统\\thinking-models';
const outputPath = 'd:\\AI编程\\人生游戏管理系统\\thinking-models-preview.html';

// 获取所有HTML文件
function getHTMLFiles(directoryPath) {
    const files = fs.readdirSync(directoryPath);
    const htmlFiles = [];
    
    files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);
        
        if (file.endsWith('.html')) {
            htmlFiles.push(file);
        }
    });
    
    return htmlFiles;
}

// 生成预览轮播HTML
function generatePreviewCarousel() {
    const htmlFiles = getHTMLFiles(folderPath);
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>思维模型预览轮播</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1e3a8a, #3730a3);
            min-height: 100vh;
        }
        .preview-container {
            height: calc(100vh - 120px);
            overflow: hidden;
        }
        iframe {
            border: none;
            transition: opacity 0.5s ease;
        }
        .file-list {
            max-height: 200px;
            overflow-y: auto;
        }
        .file-item {
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .file-item:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
        .file-item.active {
            background-color: rgba(59, 130, 246, 0.3);
            border-left: 4px solid #3b82f6;
        }
        .nav-btn {
            transition: all 0.2s ease;
        }
        .nav-btn:hover {
            transform: scale(1.05);
        }
        .nav-btn:active {
            transform: scale(0.95);
        }
    </style>
</head>
<body class="text-white">
    <div class="container mx-auto px-4 py-6">
        <!-- 标题 -->
        <div class="text-center mb-6">
            <h1 class="text-4xl font-bold mb-2">思维模型预览轮播</h1>
            <p class="text-blue-200">共 ${htmlFiles.length} 个思维模型</p>
        </div>
        
        <!-- 控制区域 -->
        <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-4">
                <button id="prevBtn" class="nav-btn bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    上一个
                </button>
                
                <button id="nextBtn" class="nav-btn bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg flex items-center gap-2">
                    下一个
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
            
            <div class="flex items-center gap-4">
                <button id="toggleAutoBtn" class="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg">
                    开始自动轮播
                </button>
                
                <select id="intervalSelect" class="bg-gray-700 text-white px-4 py-2 rounded-lg">
                    <option value="3000">3秒</option>
                    <option value="5000" selected>5秒</option>
                    <option value="10000">10秒</option>
                    <option value="15000">15秒</option>
                </select>
            </div>
        </div>
        
        <!-- 文件名显示 -->
        <div class="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg mb-4">
            <div class="flex items-center justify-between">
                <h2 id="currentFileName" class="text-xl font-semibold">文件名</h2>
                <span id="currentIndex" class="text-blue-300">1 / ${htmlFiles.length}</span>
            </div>
        </div>
        
        <!-- 预览区域 -->
        <div class="preview-container bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden shadow-2xl mb-4">
            <iframe 
                id="previewIframe" 
                src="thinking-models/${htmlFiles[0]}" 
                class="w-full h-full"
                onload="onIframeLoad()"
            ></iframe>
            <div id="loadingIndicator" class="absolute inset-0 bg-gray-900/70 flex items-center justify-center hidden">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
                    <p>加载中...</p>
                </div>
            </div>
        </div>
        
        <!-- 文件列表 -->
        <div class="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-2">思维模型列表</h3>
            <div class="file-list grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                ${htmlFiles.map((file, index) => `
                <div 
                    class="file-item p-2 rounded-lg text-sm ${index === 0 ? 'active' : ''}" 
                    onclick="loadFile(${index})"
                >
                    ${file.replace('.html', '')}
                </div>
                `).join('')}
            </div>
        </div>
    </div>
    
    <script>
        // 思维模型文件列表
        const files = ${JSON.stringify(htmlFiles)};
        let currentIndex = 0;
        let autoPlayInterval = null;
        let isAutoPlaying = false;
        
        // 获取DOM元素
        const iframe = document.getElementById('previewIframe');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const currentFileNameEl = document.getElementById('currentFileName');
        const currentIndexEl = document.getElementById('currentIndex');
        const toggleAutoBtn = document.getElementById('toggleAutoBtn');
        const intervalSelect = document.getElementById('intervalSelect');
        const loadingIndicator = document.getElementById('loadingIndicator');
        
        // 加载文件
        function loadFile(index) {
            if (index < 0 || index >= files.length) return;
            
            // 显示加载状态
            loadingIndicator.classList.remove('hidden');
            
            // 更新当前索引
            currentIndex = index;
            
            // 加载新文件
            const filePath = `thinking-models/${files[currentIndex]}`;
            iframe.src = filePath;
            
            // 更新文件名显示
            currentFileNameEl.textContent = files[currentIndex];
            currentIndexEl.textContent = `${currentIndex + 1} / ${files.length}`;
            
            // 更新文件列表激活状态
            document.querySelectorAll('.file-item').forEach((item, i) => {
                item.classList.toggle('active', i === currentIndex);
            });
        }
        
        // 上一个文件
        function prevFile() {
            loadFile((currentIndex - 1 + files.length) % files.length);
        }
        
        // 下一个文件
        function nextFile() {
            loadFile((currentIndex + 1) % files.length);
        }
        
        // 切换自动播放
        function toggleAutoPlay() {
            if (isAutoPlaying) {
                clearInterval(autoPlayInterval);
                isAutoPlaying = false;
                toggleAutoBtn.textContent = '开始自动轮播';
                toggleAutoBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
                toggleAutoBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            } else {
                startAutoPlay();
            }
        }
        
        // 开始自动播放
        function startAutoPlay() {
            clearInterval(autoPlayInterval);
            const interval = parseInt(intervalSelect.value);
            autoPlayInterval = setInterval(nextFile, interval);
            isAutoPlaying = true;
            toggleAutoBtn.textContent = '停止自动轮播';
            toggleAutoBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            toggleAutoBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        }
        
        // 监听iframe加载完成
        function onIframeLoad() {
            loadingIndicator.classList.add('hidden');
        }
        
        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevFile();
            } else if (e.key === 'ArrowRight') {
                nextFile();
            } else if (e.key === ' ') {
                e.preventDefault();
                toggleAutoPlay();
            }
        });
        
        // 事件监听
        prevBtn.addEventListener('click', prevFile);
        nextBtn.addEventListener('click', nextFile);
        toggleAutoBtn.addEventListener('click', toggleAutoPlay);
        intervalSelect.addEventListener('change', () => {
            if (isAutoPlaying) {
                startAutoPlay();
            }
        });
    </script>
</body>
</html>
    `;
    
    // 写入文件
    fs.writeFileSync(outputPath, htmlContent, 'utf8');
    console.log(`预览轮播HTML已生成：${outputPath}`);
    console.log(`共包含 ${htmlFiles.length} 个思维模型`);
}

// 执行生成
generatePreviewCarousel();
