import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 思维模型文件夹路径
const thinkingModelsDir = 'd:\\AI编程\\人生游戏管理系统\\思维模型';

// 确保思维模型文件夹存在
if (!fs.existsSync(thinkingModelsDir)) {
  fs.mkdirSync(thinkingModelsDir, { recursive: true });
}

// 内置图表数据
const builtinCharts = [
  {
    id: 'dip',
    label: '死亡谷效应',
    category: 'trend',
    html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>死亡谷效应 - DIP</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background-color: #e0e5ec;
            font-family: 'Microsoft YaHei', sans-serif;
        }
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        /* 上图下文模式：上半部分50vh */
        .svg-container {
            height: 50vh;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 8px 8px 16px rgba(163, 177, 198, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.8);
            margin-bottom: 20px;
        }
        .svg-container svg {
            width: 100%;
            height: 100%;
        }
        /* 深度解析区 */
        .analysis-container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 8px 8px 16px rgba(163, 177, 198, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.8);
            padding: 30px;
        }
        .analysis-container h1 {
            font-size: 4.5rem;
            font-weight: 900;
            letter-spacing: -2px;
            color: #2d3748;
            margin-bottom: 20px;
            text-align: center;
        }
        .analysis-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 30px;
        }
        .analysis-section {
            background-color: #f7fafc;
            padding: 20px;
            border-radius: 8px;
        }
        .analysis-section h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 15px;
        }
        .analysis-section p {
            font-size: 1rem;
            line-height: 1.6;
            color: #4a5568;
            margin-bottom: 10px;
        }
        .analysis-section ul {
            list-style: none;
            padding: 0;
        }
        .analysis-section li {
            font-size: 1rem;
            line-height: 1.6;
            color: #4a5568;
            margin-bottom: 8px;
        }
        .analysis-section strong {
            color: #2d3748;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 上半部分：SVG物理动效展示区 -->
        <div class="svg-container">
            <svg width="100%" height="100%" viewBox="0 0 900 700" style={{ fontFamily: 'Microsoft YaHei, sans-serif' }}>
                <!-- 1. 背景平滑渐变填充 -->
                <defs>
                    <!-- 背景渐变 -->
                    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f0f8ff" stopOpacity="1"/>
                        <stop offset="100%" stopColor="#e6f7ff" stopOpacity="1"/>
                    </linearGradient>
                    <!-- 曲线下方区域蓝红渐变 -->
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3498db" stopOpacity="0.2"/>
                        <stop offset="50%" stopColor="#e74c3c" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#2ecc71" stopOpacity="0.2"/>
                    </linearGradient>
                </defs>
                <!-- 背景矩形 -->
                <rect x="50" y="100" width="800" height="500" fill="url(#bgGradient)" rx="2" ry="2"/>

                <!-- 2. 坐标轴绘制 -->
                <line x1="100" y1="600" x2="850" y2="600" stroke="#333" strokeWidth="2"/> <!-- X轴 -->
                <line x1="100" y1="150" x2="100" y2="600" stroke="#333" strokeWidth="2"/> <!-- Y轴 -->
                <!-- X轴刻度（简易标注，增强可读性） -->
                <line x1="100" y1="600" x2="100" y2="610" stroke="#333" strokeWidth="2"/>
                <line x1="250" y1="600" x2="250" y2="610" stroke="#333" strokeWidth="2"/>
                <line x1="400" y1="600" x2="400" y2="610" stroke="#333" strokeWidth="2"/>
                <line x1="550" y1="600" x2="550" y2="610" stroke="#333" strokeWidth="2"/>
                <line x1="700" y1="600" x2="700" y2="610" stroke="#333" strokeWidth="2"/>
                <line x1="850" y1="600" x2="850" y2="610" stroke="#333" strokeWidth="2"/>
                <text x="100" y="630" fontSize="12" fill="#333">0</text>
                <text x="250" y="630" fontSize="12" fill="#333">20</text>
                <text x="400" y="630" fontSize="12" fill="#333">40</text>
                <text x="550" y="630" fontSize="12" fill="#333">60</text>
                <text x="700" y="630" fontSize="12" fill="#333">80</text>
                <text x="850" y="630" fontSize="12" fill="#333">100</text>
                <!-- Y轴刻度（简易标注，增强可读性） -->
                <line x1="100" y1="600" x2="90" y2="600" stroke="#333" strokeWidth="2"/>
                <line x1="100" y1="480" x2="90" y2="480" stroke="#333" strokeWidth="2"/>
                <line x1="100" y1="360" x2="90" y2="360" stroke="#333" strokeWidth="2"/>
                <line x1="100" y1="240" x2="90" y2="240" stroke="#333" strokeWidth="2"/>
                <line x1="100" y1="150" x2="90" y2="150" stroke="#333" strokeWidth="2"/>
                <text x="70" y="600" fontSize="12" fill="#333">0</text>
                <text x="70" y="480" fontSize="12" fill="#333">25</text>
                <text x="70" y="360" fontSize="12" fill="#333">50</text>
                <text x="70" y="240" fontSize="12" fill="#333">75</text>
                <text x="70" y="150" fontSize="12" fill="#333">100</text>

                <!-- 3. 曲线绘制 + 下方区域填充 -->
                <!-- 曲线下方区域填充（蓝红渐变） -->
                <path d="M100,600 Q180,400 250,350 T400,500 T550,480 T700,200 T850,150 L850,600 Z"
                      fill="url(#areaGradient)" stroke="none"/>
                <!-- 平滑曲线（先快速上升→下降→急剧上升） -->
                <path d="M100,600 Q180,400 250,350 T400,500 T550,480 T700,200 T850,150"
                      stroke="#2c3e50" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

                <!-- 4. 关键数据点（红色圆点） -->
                <circle cx="100" cy="600" r="6" fill="red" stroke="#333" strokeWidth="1"/>
                <!-- 添加脉冲动效 -->
                <circle cx="100" cy="600" r="8" fill="red" fillOpacity="0.3">
                    <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="250" cy="350" r="6" fill="red" stroke="#333" strokeWidth="1"/>
                <circle cx="400" cy="500" r="6" fill="red" stroke="#333" strokeWidth="1"/>
                <!-- 添加脉冲动效 -->
                <circle cx="400" cy="500" r="8" fill="red" fillOpacity="0.3">
                    <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="550" cy="480" r="6" fill="red" stroke="#333" strokeWidth="1"/>
                <circle cx="850" cy="150" r="6" fill="red" stroke="#333" strokeWidth="1"/>
                <!-- 添加脉冲动效 -->
                <circle cx="850" cy="150" r="8" fill="red" fillOpacity="0.3">
                    <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
                </circle>

                <!-- 5. 文字标注 -->
                <!-- 图表标题 + 副标题 -->
                <text x="450" y="60" fontSize="24" fill="#333" fontWeight="bold" textAnchor="middle">死亡谷效应</text>
                <text x="450" y="90" fontSize="14" fill="#666" textAnchor="middle">投入初期快速进步，随后进入瓶颈期，突破后呈指数级增长</text>
                <!-- 曲线关键节点（红色文字） -->
                <text x="100" y="580" fontSize="14" fill="red" fontWeight="bold" textAnchor="middle">初始阶段</text>
                <text x="400" y="520" fontSize="14" fill="red" fontWeight="bold" textAnchor="middle">死亡谷底部</text>
                <text x="550" y="460" fontSize="14" fill="red" fontWeight="bold" textAnchor="middle">突破阶段</text>
                <text x="850" y="130" fontSize="14" fill="red" fontWeight="bold" textAnchor="middle">指数增长期</text>
                <!-- 坐标轴标注 -->
                <text x="475" y="650" fontSize="16" fill="#333" textAnchor="middle">投入度 (%)</text>
                <text x="40" y="375" fontSize="16" fill="#333" fontWeight="normal" transform="rotate(-90,40,375)">产出率 (%)</text>
            </svg>
        </div>
        
        <!-- 下半部分：深度解析区 -->
        <div class="analysis-container">
            <h1>死亡谷效应</h1>
            
            <div class="analysis-grid">
                <div class="analysis-section">
                    <h2>核心逻辑</h2>
                    <p>死亡谷效应是指在个人成长、项目开发或企业发展过程中，投入初期会快速进步，但随后会进入一个瓶颈期（死亡谷），只有坚持突破后才能进入指数级增长阶段。</p>
                    <p>这一模型揭示了成长的非线性本质，强调了坚持和韧性的重要性。</p>
                </div>
                
                <div class="analysis-section">
                    <h2>关键阶段</h2>
                    <ul>
                        <li><strong>初始阶段</strong>：快速进步，信心增强</li>
                        <li><strong>死亡谷底部</strong>：进步缓慢，信心受挫，容易放弃</li>
                        <li><strong>突破阶段</strong>：逐渐适应，开始稳定进步</li>
                        <li><strong>指数增长期</strong>：技能和知识形成体系，进入快速增长</li>
                    </ul>
                </div>
                
                <div class="analysis-section">
                    <h2>执行准则</h2>
                    <ul>
                        <li><strong>设定合理预期</strong>：了解成长的非线性本质，避免过早失望</li>
                        <li><strong>建立支持系统</strong>：在低谷期寻求帮助和支持</li>
                        <li><strong>分解目标</strong>：将大目标分解为小目标，保持成就感</li>
                        <li><strong>持续学习</strong>：在低谷期积累知识和技能，为突破做准备</li>
                    </ul>
                </div>
                
                <div class="analysis-section">
                    <h2>实战应用</h2>
                    <p>在学习新技能时，当你感到进步缓慢甚至停滞不前时，不要轻易放弃。这很可能是你正处于死亡谷底部，坚持下去，你就会迎来突破。</p>
                    <p>在项目管理中，要为团队准备足够的资源和支持，帮助团队度过项目的死亡谷阶段。</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
  },
  {
    id: 'dunning',
    label: '邓宁-克鲁格效应',
    category: 'trend',
    html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>邓宁-克鲁格效应 - Dunning-Kruger</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background-color: #e0e5ec;
            font-family: 'Microsoft YaHei', sans-serif;
        }
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        /* 上图下文模式：上半部分50vh */
        .svg-container {
            height: 50vh;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 8px 8px 16px rgba(163, 177, 198, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.8);
            margin-bottom: 20px;
        }
        .svg-container svg {
            width: 100%;
            height: 100%;
        }
        /* 深度解析区 */
        .analysis-container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 8px 8px 16px rgba(163, 177, 198, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.8);
            padding: 30px;
        }
        .analysis-container h1 {
            font-size: 4.5rem;
            font-weight: 900;
            letter-spacing: -2px;
            color: #2d3748;
            margin-bottom: 20px;
            text-align: center;
        }
        .analysis-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 30px;
        }
        .analysis-section {
            background-color: #f7fafc;
            padding: 20px;
            border-radius: 8px;
        }
        .analysis-section h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 15px;
        }
        .analysis-section p {
            font-size: 1rem;
            line-height: 1.6;
            color: #4a5568;
            margin-bottom: 10px;
        }
        .analysis-section ul {
            list-style: none;
            padding: 0;
        }
        .analysis-section li {
            font-size: 1rem;
            line-height: 1.6;
            color: #4a5568;
            margin-bottom: 8px;
        }
        .analysis-section strong {
            color: #2d3748;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 上半部分：SVG物理动效展示区 -->
        <div class="svg-container">
            <svg width="100%" height="100%" viewBox="0 0 800 600" style={{ fontFamily: 'Microsoft YaHei, sans-serif' }}>
                <!-- 1. 背景分区（4个彩色区域，边界清晰） -->
                <rect x="100" y="100" width="150" height="400" fill="#ffd6e0" stroke="#333" strokeWidth="1"/>
                <rect x="250" y="100" width="150" height="400" fill="#d6e4ff" stroke="#333" strokeWidth="1"/>
                <rect x="400" y="100" width="150" height="400" fill="#d6ffed" stroke="#333" strokeWidth="1"/>
                <rect x="550" y="100" width="150" height="400" fill="#fff3d6" stroke="#333" strokeWidth="1"/>

                <!-- 2. 坐标轴绘制 -->
                <line x1="100" y1="500" x2="700" y2="500" stroke="#333" strokeWidth="2"/>
                <line x1="100" y1="100" x2="100" y2="500" stroke="#333" strokeWidth="2"/>

                <!-- 3. 平滑曲线（先升后降再平缓上升，贯穿4个分区） -->
                <path d="M100,400 Q175,150 250,200 T400,450 T550,350 T700,300" 
                      stroke="#2f5496" strokeWidth="3" fill="none" strokeLinecap="round"/>

                <!-- 4. 文字标注 - 曲线关键节点（红色文字） -->
                <text x="175" y="130" fontSize="14" fill="red" fontWeight="bold" textAnchor="middle">愚昧之巅</text>
                <text x="325" y="220" fontSize="14" fill="red" fontWeight="bold" textAnchor="middle">绝望之谷</text>
                <text x="475" y="470" fontSize="14" fill="red" fontWeight="bold" textAnchor="middle">开悟之坡</text>
                <text x="625" y="280" fontSize="14" fill="red" fontWeight="bold" textAnchor="middle">平稳高原</text>

                <!-- 5. 文字标注 - 坐标轴说明 -->
                <text x="400" y="530" fontSize="14" fill="#333" fontWeight="normal" textAnchor="middle">智慧水平（知识与经验，低→高）</text>
                <text x="60" y="300" fontSize="14" fill="#333" fontWeight="normal" writingMode="tb">← 自信程度（高→低）</text>

                <!-- 6. 文字标注 - 背景分区名称 -->
                <text x="175" y="50" fontSize="14" fill="#333" fontWeight="bold" textAnchor="middle">自信爆棚区</text>
                <text x="325" y="50" fontSize="14" fill="#333" fontWeight="bold" textAnchor="middle">自信崩溃区</text>
                <text x="475" y="50" fontSize="14" fill="#333" fontWeight="bold" textAnchor="middle">自信重建区</text>
                <text x="625" y="50" fontSize="14" fill="#333" fontWeight="bold" textAnchor="middle">自信成熟区</text>

                <!-- 7. 底部表现标签 -->
                <text x="175" y="560" fontSize="16" fill="#333" fontWeight="bold" textAnchor="middle">巨婴</text>
                <text x="325" y="560" fontSize="16" fill="#333" fontWeight="bold" textAnchor="middle">屌丝</text>
                <text x="475" y="560" fontSize="16" fill="#333" fontWeight="bold" textAnchor="middle">智者</text>
                <text x="625" y="560" fontSize="16" fill="#333" fontWeight="bold" textAnchor="middle">大师</text>

                <!-- 8. 简笔画图标 -->
                <!-- 自信爆棚区：人物图标（自信姿态） -->
                <g transform="translate(175, 300) scale(0.8)">
                    <circle cx="0" cy="-20" r="15" fill="#333" />
                    <rect x="-10" y="5" width="20" height="25" fill="#333" />
                    <line x1="-10" y1="5" x2="-18" y2="15" stroke="#333" strokeWidth="2" />
                    <line x1="10" y1="5" x2="18" y2="15" stroke="#333" strokeWidth="2" />
                    <line x1="-10" y1="30" x2="-18" y2="40" stroke="#333" strokeWidth="2" />
                    <line x1="10" y1="30" x2="18" y2="40" stroke="#333" strokeWidth="2" />
                </g>

                <!-- 自信崩溃区：沮丧人物图标 -->
                <g transform="translate(325, 300) scale(0.8)">
                    <circle cx="0" cy="-15" r="15" fill="#333" />
                    <path d="M-10,0 L0,25 L10,0" fill="#333" />
                    <line x1="-5" y1="5" x2="-12" y2="15" stroke="#333" strokeWidth="2" />
                    <line x1="5" y1="5" x2="12" y2="15" stroke="#333" strokeWidth="2" />
                    <line x1="-5" y1="25" x2="-12" y2="35" stroke="#333" strokeWidth="2" />
                    <line x1="5" y1="25" x2="12" y2="35" stroke="#333" strokeWidth="2" />
                </g>

                <!-- 自信重建区：学习人物图标（持书） -->
                <g transform="translate(475, 300) scale(0.8)">
                    <circle cx="0" cy="-20" r="15" fill="#333" />
                    <rect x="-10" y="5" width="20" height="25" fill="#333" />
                    <line x1="-10" y1="15" x2="-18" y2="25" stroke="#333" strokeWidth="2" />
                    <rect x="5" y="10" width="8" height="12" fill="#333" />
                    <line x1="10" y1="30" x2="18" y2="40" stroke="#333" strokeWidth="2" />
                    <line x1="-10" y1="30" x2="-18" y2="40" stroke="#333" strokeWidth="2" />
                </g>

                <!-- 自信成熟区：大脑图标 -->
                <g transform="translate(625, 300) scale(0.8)">
                    <path d="M-20,0 C-30,-15 -30,-35 -15,-45 C0,-55 20,-55 35,-45 C50,-35 50,-15 40,0 C45,15 40,35 25,45 C10,55 -10,55 -25,45 C-40,35 -35,15 -20,0 Z" fill="#333" />
                    <!-- 添加旋转动效 -->
                    <path d="M-20,0 C-30,-15 -30,-35 -15,-45 C0,-55 20,-55 35,-45 C50,-35 50,-15 40,0 C45,15 40,35 25,45 C10,55 -10,55 -25,45 C-40,35 -35,15 -20,0 Z" fill="#333" fillOpacity="0.3">
                        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="20s" repeatCount="indefinite"/>
                    </path>
                    <line x1="-15" y1="-10" x2="-15" y2="30" stroke="#fff" strokeWidth="1" />
                    <line x1="0" y1="-10" x2="0" y2="30" stroke="#fff" strokeWidth="1" />
                    <line x1="15" y1="-10" x2="15" y2="30" stroke="#fff" strokeWidth="1" />
                    <path d="M-25,-20 Q0,-30 25,-20" stroke="#fff" strokeWidth="1" fill="none" />
                    <path d="M-20,10 Q0,20 20,10" stroke="#fff" strokeWidth="1" fill="none" />
                </g>
            </svg>
        </div>
        
        <!-- 下半部分：深度解析区 -->
        <div class="analysis-container">
            <h1>邓宁-克鲁格效应</h1>
            
            <div class="analysis-grid">
                <div class="analysis-section">
                    <h2>核心逻辑</h2>
                    <p>邓宁-克鲁格效应描述了人们在掌握一项技能或知识时的认知偏差：能力越低的人，越容易高估自己的能力；而能力越高的人，反而会低估自己的能力。</p>
                    <p>这一效应揭示了认知的四个阶段：愚昧之巅、绝望之谷、开悟之坡和平稳高原。</p>
                </div>
                
                <div class="analysis-section">
                    <h2>关键阶段</h2>
                    <ul>
                        <li><strong>愚昧之巅</strong>：知识水平低但自信程度极高</li>
                        <li><strong>绝望之谷</strong>：意识到自己的不足，自信崩溃</li>
                        <li><strong>开悟之坡</strong>：持续学习，能力和自信稳步提升</li>
                        <li><strong>平稳高原</strong>：达到高水平，认知趋于客观</li>
                    </ul>
                </div>
                
                <div class="analysis-section">
                    <h2>执行准则</h2>
                    <ul>
                        <li><strong>保持谦逊</strong>：意识到自己的认知局限</li>
                        <li><strong>持续学习</strong>：不断扩展知识边界</li>
                        <li><strong>寻求反馈</strong>：从他人处获取客观评价</li>
                        <li><strong>反思内省</strong>：定期评估自己的真实能力</li>
                    </ul>
                </div>
                
                <div class="analysis-section">
                    <h2>实战应用</h2>
                    <p>在学习和工作中，要警惕自己处于愚昧之巅而不自知。当遇到挫折时，要认识到这可能是进入绝望之谷的信号，坚持下去就能进入开悟之坡。</p>
                    <p>对于管理者来说，要了解团队成员所处的认知阶段，提供相应的支持和指导。</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
  }
  // 更多图表可以继续添加...
];

// 将内置图表转换为HTML文件
builtinCharts.forEach(chart => {
  // 生成HTML文件内容
  const htmlContent = chart.html;
  
  // 生成文件名：先中文后英文
  const fileName = `${chart.label}_${chart.id}.html`;
  
  // 保存到思维模型文件夹
  const filePath = path.join(thinkingModelsDir, fileName);
  fs.writeFileSync(filePath, htmlContent, 'utf8');
  
  console.log(`生成HTML文件：${fileName}`);
});

console.log('\n所有内置图表已转换为HTML格式！');