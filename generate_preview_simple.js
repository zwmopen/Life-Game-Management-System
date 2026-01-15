const fs = require('fs');

// 简单版本的预览生成脚本
const folderPath = 'thinking-models';
const outputPath = 'thinking-models-preview.html';

// 获取所有HTML文件
const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.html'));

// 生成简单的预览页面
const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>思维模型预览</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background: linear-gradient(135deg, #1e3a8a, #3730a3);
            min-height: 100vh;
            font-family: system-ui, -apple-system, sans-serif;
        }
        .preview-frame {
            height: 80vh;
            border: none;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
    </style>
</head>
<body class="text-white p-4">
    <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold text-center mb-6">思维模型预览</h1>
        <p class="text-center text-blue-300 mb-8">共 ${files.length} 个思维模型</p>

        <!-- 控制栏 -->
        <div class="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg mb-4 flex flex-wrap gap-4 items-center justify-between">
            <div class="flex items-center gap-4">
                <button onclick="prevFile()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    上一个
                </button>
                <button onclick="nextFile()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
                    下一个
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
            <div>
                <span id="currentInfo" class="text-xl font-semibold">1 / ${files.length}</span>
            </div>
        </div>

        <!-- 文件名显示 -->
        <div class="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg mb-4">
            <h2 id="currentFileName" class="text-xl font-semibold"></h2>
        </div>

        <!-- 预览区域 -->
        <div class="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg mb-4">
            <iframe id="previewFrame" class="preview-frame w-full" src="thinking-models/${files[0]}"></iframe>
        </div>

        <!-- 文件列表 -->
        <div class="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-2">思维模型列表</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                ${files.map((file, index) => `
                <div 
                    class="file-item p-2 rounded-lg ${index === 0 ? 'active' : ''}" 
                    onclick="loadFile(${index})"
                >
                    ${file.replace('.html', '')}
                </div>
                `).join('')}
            </div>
        </div>
    </div>

    <script>
        const fileList = ${JSON.stringify(files)};
        let currentIndex = 0;
        
        const previewFrame = document.getElementById('previewFrame');
        const currentFileName = document.getElementById('currentFileName');
        const currentInfo = document.getElementById('currentInfo');
        
        // 加载文件
        function loadFile(index) {
            currentIndex = index;
            const file = fileList[currentIndex];
            previewFrame.src = `thinking-models/${file}`;
            currentFileName.textContent = file;
            currentInfo.textContent = `${currentIndex + 1} / ${fileList.length}`;
            
            // 更新激活状态
            document.querySelectorAll('.file-item').forEach((item, i) => {
                item.classList.toggle('active', i === currentIndex);
            });
        }
        
        // 上一个文件
        function prevFile() {
            currentIndex = (currentIndex - 1 + fileList.length) % fileList.length;
            loadFile(currentIndex);
        }
        
        // 下一个文件
        function nextFile() {
            currentIndex = (currentIndex + 1) % fileList.length;
            loadFile(currentIndex);
        }
        
        // 初始加载
        loadFile(0);
    </script>
</body>
</html>
`;

// 写入文件
fs.writeFileSync(outputPath, html, 'utf8');
console.log('Preview file generated successfully!');
console.log(`Output path: ${outputPath}`);
console.log(`Total files: ${files.length}`);
