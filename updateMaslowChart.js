import * as fs from 'fs';
import * as path from 'path';

// 读取文件内容
const filePath = './components/MissionControl.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// 查找purpose案例的开始和结束位置
const caseStart = content.indexOf('case \'purpose\':');
const caseEnd = content.indexOf('case \'johariWindow\':', caseStart);

if (caseStart === -1 || caseEnd === -1) {
  console.error('未找到purpose案例或johariWindow案例');
  process.exit(1);
}

// 提取旧的case内容
const oldCaseContent = content.slice(caseStart, caseEnd);
console.log('找到旧的case内容，长度:', oldCaseContent.length);

// 新的case内容
const newCaseContent = `      case 'purpose':
        return (
          <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 1000 750" preserveAspectRatio="xMidYMid meet">
              {/* 1. 定义滤镜和渐变 */}
              <defs>
                {/* 五层需求色彩 */}
                <linearGradient id="physiologicalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#9e9e9e" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#757575" stop-opacity="0.5"/>
                </linearGradient>
                <linearGradient id="safetyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#64b5f6" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#2196f3" stop-opacity="0.5"/>
                </linearGradient>
                <linearGradient id="socialGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#f48fb1" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#e91e63" stop-opacity="0.5"/>
                </linearGradient>
                <linearGradient id="esteemGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#ce93d8" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#9c27b0" stop-opacity="0.5"/>
                </linearGradient>
                <linearGradient id="selfActualizationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#ffd54f" stop-opacity="0.4"/>
                  <stop offset="100%" stop-color="#fbc02d" stop-opacity="0.6"/>
                </linearGradient>
                
                {/* 背景渐变 */}
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color={isDark ? '#1a202c' : '#f8fbff'}/>
                  <stop offset="100%" stop-color={isDark ? '#2d3748' : '#eff6ff'}/>
                </linearGradient>

                {/* 阴影滤镜 */}
                <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="4" stdDeviation="4" flood-opacity="0.15"/>
                </filter>
                
                {/* 卡片阴影 */}
                <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.08"/>
                </filter>
              </defs>

              {/* 2. 背景 */}
              <rect x="0" y="0" width="1000" height="750" fill="url(#bgGradient)" rx="12" ry="12"/>

              {/* 3. 标题区域 (顶部居中) */}
              <g transform="translate(500, 60)">
                <text x="0" y="0" font-size="28" fill={isDark ? '#ffffff' : '#1a202c'} font-weight="bold" text-anchor="middle">马斯洛需求层次理论</text>
                <text x="0" y="35" font-size="16" fill={isDark ? '#a0aec0' : '#718096'} text-anchor="middle">需求从低到高逐步满足，高层次需求带来更持久的幸福感</text>
              </g>

              {/* 4. 核心金字塔 (左侧主体) */}
              {/* 将金字塔中心定在 x=380, y=680 */}
              <g transform="translate(380, 680)" filter="url(#shadowFilter)">
                
                {/* Level 1: 生理 (底宽 500, 高 100) */}
                <path d="M-250 0 L250 0 L200 -100 L-200 -100 Z" fill="url(#physiologicalGradient)" stroke="#757575" stroke-width="2"/>
                <text x="0" y="-60" font-size="18" fill={isDark ? '#e0e0e0' : '#424242'} font-weight="bold" text-anchor="middle">① 生理需求</text>
                <text x="0" y="-35" font-size="12" fill={isDark ? '#bdbdbd' : '#616161'} text-anchor="middle">食物 / 水 / 睡眠 / 生存必需</text>
                
                {/* Level 2: 安全 (底宽 400, 高 100) */}
                <path d="M-200 -100 L200 -100 L150 -200 L-150 -200 Z" fill="url(#safetyGradient)" stroke="#2196f3" stroke-width="2"/>
                <text x="0" y="-160" font-size="18" fill={isDark ? '#bbdefb' : '#1565c0'} font-weight="bold" text-anchor="middle">② 安全需求</text>
                <text x="0" y="-135" font-size="12" fill={isDark ? '#e3f2fd' : '#424242'} text-anchor="middle">人身安全 / 资源 / 健康保障</text>

                {/* Level 3: 社交 (底宽 300, 高 100) */}
                <path d="M-150 -200 L150 -200 L100 -300 L-100 -300 Z" fill="url(#socialGradient)" stroke="#e91e63" stroke-width="2"/>
                <text x="0" y="-260" font-size="18" fill={isDark ? '#f8bbd0' : '#ad1457'} font-weight="bold" text-anchor="middle">③ 社交需求</text>
                <text x="0" y="-235" font-size="12" fill={isDark ? '#fce4ec' : '#424242'} text-anchor="middle">友情 / 爱情 / 归属感</text>

                {/* Level 4: 尊重 (底宽 200, 高 100) */}
                <path d="M-100 -300 L100 -300 L50 -400 L-50 -400 Z" fill="url(#esteemGradient)" stroke="#9c27b0" stroke-width="2"/>
                <text x="0" y="-360" font-size="18" fill={isDark ? '#e1bee7' : '#6a1b9a'} font-weight="bold" text-anchor="middle">④ 尊重需求</text>
                <text x="0" y="-335" font-size="12" fill={isDark ? '#f3e5f5' : '#424242'} text-anchor="middle">自尊 / 成就 / 他人认可</text>

                {/* Level 5: 自我实现 (底宽 100, 高 100) */}
                <path d="M-50 -400 L50 -400 L0 -500 Z" fill="url(#selfActualizationGradient)" stroke="#fbc02d" stroke-width="2"/>
                <text x="0" y="-460" font-size="18" fill={isDark ? '#fff3e0' : '#f57f17'} font-weight="bold" text-anchor="middle">⑤ 自我实现</text>
                <text x="0" y="-435" font-size="12" fill={isDark ? '#fffde7' : '#424242'} text-anchor="middle">潜能 / 创造力 / 道德</text>

                {/* 侧边上升箭头 */}
                <g transform="translate(260, 0)">
                  <line x1="0" y1="-20" x2="0" y2="-480" stroke="#b0bec5" stroke-width="2" stroke-dasharray="6,4" marker-end="url(#arrowUp)"/>
                  <text x="20" y="-250" font-size="14" fill={isDark ? '#cfd8dc' : '#78909c'} writing-mode="tb" text-anchor="middle" letter-spacing="4" font-weight="bold">满足度与幸福感提升</text>
                </g>
                
                <defs>
                  <marker id="arrowUp" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                    <path d="M0,0 L0,10 L10,5 z" fill="#b0bec5" />
                  </marker>
                </defs>
              </g>

              {/* 5. 右侧辅助信息区 (卡片式布局) */}
              
              {/* 卡片1：操作建议 */}
              <g transform="translate(680, 200)" filter="url(#cardShadow)">
                <rect x="0" y="0" width="260" height="200" rx="8" ry="8" fill={isDark ? '#2d3748' : '#ffffff'} stroke={isDark ? '#4a5568' : '#e0e0e0'} stroke-width="1"/>
                <rect x="0" y="0" width="260" height="40" rx="8" ry="8" fill={isDark ? '#1a202c' : '#f8fafc'}/>
                <rect x="0" y="30" width="260" height="10" fill={isDark ? '#1a202c' : '#f8fafc'}/>
                <line x1="0" y1="40" x2="260" y2="40" stroke={isDark ? '#4a5568' : '#e2e8f0'} stroke-width="1"/>

                <text x="20" y="28" font-size="16" fill={isDark ? '#ffffff' : '#2d3748'} font-weight="bold" text-anchor="start">💡 操作建议</text>
                
                <g transform="translate(20, 70)">
                  <text x="0" y="0" font-size="13" fill={isDark ? '#e2e8f0' : '#4a5568'} text-anchor="start">1. 匹配当前层级设定目标</text>
                  <text x="0" y="30" font-size="13" fill={isDark ? '#e2e8f0' : '#4a5568'} text-anchor="start">2. 勿在温饱未决时空谈理想</text>
                  <text x="0" y="60" font-size="13" fill={isDark ? '#e2e8f0' : '#4a5568'} text-anchor="start">3. 关注需求的动态变化</text>
                  <text x="0" y="90" font-size="13" fill={isDark ? '#e2e8f0' : '#4a5568'} text-anchor="start">4. 高层需求带来持久动力</text>
                </g>
              </g>

              {/* 卡片2：实践案例 */}
              <g transform="translate(680, 430)" filter="url(#cardShadow)">
                <rect x="0" y="0" width="260" height="200" rx="8" ry="8" fill={isDark ? '#2d3748' : '#ffffff'} stroke={isDark ? '#4a5568' : '#e0e0e0'} stroke-width="1"/>
                <rect x="0" y="0" width="260" height="40" rx="8" ry="8" fill={isDark ? '#1a202c' : '#f8fafc'}/>
                <rect x="0" y="30" width="260" height="10" fill={isDark ? '#1a202c' : '#f8fafc'}/>
                <line x1="0" y1="40" x2="260" y2="40" stroke={isDark ? '#4a5568' : '#e2e8f0'} stroke-width="1"/>

                <text x="20" y="28" font-size="16" fill={isDark ? '#ffffff' : '#2d3748'} font-weight="bold" text-anchor="start">🚀 实践案例</text>
                
                <g transform="translate(20, 70)">
                  <text x="0" y="0" font-size="13" fill={isDark ? '#e2e8f0' : '#4a5568'} text-anchor="start">1. 自检：没动力先查睡/吃</text>
                  <text x="0" y="30" font-size="13" fill={isDark ? '#e2e8f0' : '#4a5568'} text-anchor="start">2. 激励：底层给钱，高层给名</text>
                  <text x="0" y="60" font-size="13" fill={isDark ? '#e2e8f0' : '#4a5568'} text-anchor="start">3. 游戏化：设置需求解锁机制</text>
                  <text x="0" y="90" font-size="13" fill={isDark ? '#e2e8f0' : '#4a5568'} text-anchor="start">4. 助人：按对方需求给予支持</text>
                </g>
              </g>

              {/* 6. 底部适用范围 */}
              <text x="500" y="730" font-size="14" fill={isDark ? '#90a4ae' : '#90a4ae'} text-anchor="middle">适用范围：成就体系设计 · 用户激励 · 自我调节 · 目标排序</text>

              {/* 核心逻辑提示（右侧竖向标注） */}
              <text x="600" y="350" font-size="14" fill={isDark ? '#cfd8dc' : '#2d3748'} font-weight="bold" transform="rotate(90,600,350)">
                需求从低到高，逐层满足
              </text>
            </svg>
          </div>
        );
`;

// 替换内容
const newContent = content.slice(0, caseStart) + newCaseContent + content.slice(caseEnd);

// 写入文件
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('更新完成！');
