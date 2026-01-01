import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, Scatter, ScatterChart, ZAxis, ReferenceLine } from 'recharts';
import { chartConfig, getGridColor, getTooltipStyle } from './ChartConfig';

interface ConceptChartsProps {
  isDark: boolean;
}

// 反脆弱图表数据
const antifragilityData = [
  { stress: 0, performance: 50, label: '稳定状态' },
  { stress: 5, performance: 48, label: '轻微压力' },
  { stress: 10, performance: 45, label: '适度压力' },
  { stress: 15, performance: 40, label: '较大压力' },
  { stress: 20, performance: 55, label: '恢复点' },
  { stress: 25, performance: 65, label: '成长点' },
  { stress: 30, performance: 80, label: '快速成长' },
  { stress: 35, performance: 100, label: '反脆弱峰值' },
  { stress: 40, performance: 95, label: '持续成长' },
  { stress: 45, performance: 90, label: '接近极限' },
  { stress: 50, performance: 40, label: '崩溃点' },
];

// 第二曲线图表数据
const secondCurveData = [
  { time: 0, first: 0, second: 0, label: '起点' },
  { time: 1, first: 10, second: 0, label: '第一曲线启动' },
  { time: 2, first: 25, second: 0, label: '第一曲线增长' },
  { time: 3, first: 45, second: 0, label: '第一曲线加速' },
  { time: 4, first: 70, second: 5, label: '第二曲线启动' },
  { time: 5, first: 90, second: 15, label: '第一曲线峰值' },
  { time: 6, first: 85, second: 30, label: '第二曲线增长' },
  { time: 7, first: 75, second: 55, label: '交叉点' },
  { time: 8, first: 60, second: 85, label: '第二曲线超越' },
  { time: 9, first: 40, second: 110, label: '第二曲线加速' },
  { time: 10, first: 20, second: 130, label: '第二曲线峰值' },
];

// 复利效应图表数据
const compoundInterestData = [
  { year: 0, principal: 1000, compound: 1000, label: '初始投资' },
  { year: 1, principal: 1100, compound: 1100, label: '第1年' },
  { year: 2, principal: 1200, compound: 1210, label: '第2年' },
  { year: 3, principal: 1300, compound: 1331, label: '第3年' },
  { year: 4, principal: 1400, compound: 1464, label: '第4年' },
  { year: 5, principal: 1500, compound: 1611, label: '第5年' },
  { year: 6, principal: 1600, compound: 1772, label: '第6年' },
  { year: 7, principal: 1700, compound: 1949, label: '第7年' },
  { year: 8, principal: 1800, compound: 2144, label: '第8年' },
  { year: 9, principal: 1900, compound: 2358, label: '第9年' },
  { year: 10, principal: 2000, compound: 2594, label: '第10年' },
  { year: 15, principal: 2500, compound: 4177, label: '第15年' },
  { year: 20, principal: 3000, compound: 6727, label: '第20年' },
  { year: 25, principal: 3500, compound: 10835, label: '第25年' },
  { year: 30, principal: 4000, compound: 17449, label: '第30年' },
];

// 达克效应图表数据
const dunningKrugerData = [
  { knowledge: 0, confidence: 95, label: '愚昧之巅' },
  { knowledge: 10, confidence: 90, label: '过度自信' },
  { knowledge: 20, confidence: 75, label: '开始质疑' },
  { knowledge: 30, confidence: 40, label: '绝望之谷' },
  { knowledge: 40, confidence: 50, label: '开始觉悟' },
  { knowledge: 50, confidence: 60, label: '稳步提升' },
  { knowledge: 60, confidence: 70, label: '开悟之坡' },
  { knowledge: 70, confidence: 75, label: '持续成长' },
  { knowledge: 80, confidence: 80, label: '专业水平' },
  { knowledge: 90, confidence: 85, label: '精通领域' },
  { knowledge: 100, confidence: 90, label: '大师境界' },
];

const ConceptCharts: React.FC<ConceptChartsProps> = ({ isDark }) => {
  const gridColor = getGridColor(isDark);
  const tooltipStyle = getTooltipStyle(isDark);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {/* 反脆弱图表 */}
      <div className={`rounded-xl p-4 transition-all duration-300 ${isDark ? 'bg-zinc-900/50 shadow-lg' : 'bg-white shadow-lg'}`}>
        <h3 className="text-xl font-bold mb-4 text-center text-blue-600">反脆弱效应</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={antifragilityData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="colorAntifragility" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={isDark ? 0.4 : 0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="stress" 
              name="压力水平" 
              label={{ value: '压力水平', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis 
              name="表现水平" 
              label={{ value: '表现水平', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={tooltipStyle.contentStyle} 
              cursor={tooltipStyle.cursor}
              formatter={(value, name) => [value, name === 'performance' ? '表现水平' : '']}
              labelFormatter={(label) => `压力水平: ${label}`}
            />
            <Legend />
            <ReferenceLine x={50} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '崩溃点', position: 'top' }} />
            <ReferenceLine x={20} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: '恢复点', position: 'top' }} />
            <Area 
              type="monotone" 
              dataKey="performance" 
              stroke="#10b981" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorAntifragility)"
              name="反脆弱表现"
            />
            <Scatter 
              data={[
                { stress: 20, performance: 55, special: true },
                { stress: 35, performance: 100, special: true },
                { stress: 50, performance: 40, special: true }
              ]} 
              fill="#ef4444"
              name="关键转折点"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          <p>反脆弱系统在适度压力下表现更好，超过崩溃点后性能急剧下降。</p>
          <ul className="list-disc list-inside mt-1">
            <li>恢复点(20)：系统开始从压力中恢复</li>
            <li>反脆弱峰值(35)：系统性能达到最大化</li>
            <li>崩溃点(50)：系统无法承受压力而崩溃</li>
          </ul>
        </div>
      </div>

      {/* 第二曲线图表 */}
      <div className={`rounded-xl p-4 transition-all duration-300 ${isDark ? 'bg-zinc-900/50 shadow-lg' : 'bg-white shadow-lg'}`}>
        <h3 className="text-xl font-bold mb-4 text-center text-purple-600">第二曲线理论</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={secondCurveData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="time" 
              name="时间" 
              label={{ value: '时间', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis 
              name="业务规模" 
              label={{ value: '业务规模', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={tooltipStyle.contentStyle} 
              cursor={tooltipStyle.cursor}
            />
            <Legend />
            <ReferenceLine x={7} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '交叉点', position: 'top' }} />
            <Line 
              type="monotone" 
              dataKey="first" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }} 
              name="第一曲线"
            />
            <Line 
              type="monotone" 
              dataKey="second" 
              stroke="#8b5cf6" 
              strokeWidth={3} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }} 
              name="第二曲线"
            />
            <Scatter 
              data={[
                { time: 5, first: 90, second: 0, special: true },
                { time: 7, first: 75, second: 55, special: true },
                { time: 10, first: 20, second: 130, special: true }
              ]} 
              fill="#f59e0b"
              name="关键节点"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          <p>第二曲线理论强调在第一曲线达到峰值前启动新的增长曲线。</p>
          <ul className="list-disc list-inside mt-1">
            <li>第一曲线峰值(5)：现有业务达到最高点</li>
            <li>交叉点(7)：第二曲线超越第一曲线</li>
            <li>第二曲线峰值(10)：新业务实现最大增长</li>
          </ul>
        </div>
      </div>

      {/* 复利效应图表 */}
      <div className={`rounded-xl p-4 transition-all duration-300 ${isDark ? 'bg-zinc-900/50 shadow-lg' : 'bg-white shadow-lg'}`}>
        <h3 className="text-xl font-bold mb-4 text-center text-amber-600">复利效应</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={compoundInterestData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={isDark ? 0.4 : 0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorCompound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={isDark ? 0.4 : 0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="year" 
              name="年份" 
              label={{ value: '年份', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis 
              name="金额" 
              label={{ value: '金额 (元)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `¥${value}`}
            />
            <Tooltip 
              contentStyle={tooltipStyle.contentStyle} 
              cursor={tooltipStyle.cursor}
              formatter={(value) => [`¥${value}`, '']}
            />
            <Legend />
            <ReferenceLine x={10} stroke="#10b981" strokeDasharray="3 3" label={{ value: '10年', position: 'top' }} />
            <ReferenceLine x={20} stroke="#10b981" strokeDasharray="3 3" label={{ value: '20年', position: 'top' }} />
            <ReferenceLine x={30} stroke="#10b981" strokeDasharray="3 3" label={{ value: '30年', position: 'top' }} />
            <Area 
              type="monotone" 
              dataKey="principal" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorPrincipal)"
              name="本金增长"
            />
            <Area 
              type="monotone" 
              dataKey="compound" 
              stroke="#f59e0b" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorCompound)"
              name="复利增长"
            />
            <Scatter 
              data={[
                { year: 10, principal: 2000, compound: 2594, special: true },
                { year: 20, principal: 3000, compound: 6727, special: true },
                { year: 30, principal: 4000, compound: 17449, special: true }
              ]} 
              fill="#10b981"
              name="关键时间点"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          <p>复利效应显示了时间对投资增长的巨大影响。</p>
          <ul className="list-disc list-inside mt-1">
            <li>10年：复利增长开始超过简单增长</li>
            <li>20年：复利优势显著显现</li>
            <li>30年：复利效应爆发式增长</li>
          </ul>
        </div>
      </div>

      {/* 优化后的达克效应图表 */}
      <div className={`rounded-xl p-4 transition-all duration-300 ${isDark ? 'bg-zinc-900/50 shadow-lg' : 'bg-white shadow-lg'}`}>
        <h3 className="text-xl font-bold mb-4 text-center text-rose-600">达克效应</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={dunningKrugerData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="knowledge" 
              name="知识水平" 
              label={{ value: '知识水平', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis 
              name="自信程度" 
              label={{ value: '自信程度', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={tooltipStyle.contentStyle} 
              cursor={tooltipStyle.cursor}
            />
            <Legend />
            <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '绝望之谷', position: 'right' }} />
            <ReferenceLine x={30} stroke="#ef4444" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="confidence" 
              stroke="#ec4899" 
              strokeWidth={3} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }} 
              name="自信程度"
            />
            <Scatter 
              data={[
                { knowledge: 0, confidence: 95, special: true },
                { knowledge: 30, confidence: 40, special: true },
                { knowledge: 60, confidence: 70, special: true },
                { knowledge: 100, confidence: 90, special: true }
              ]} 
              fill="#ef4444"
              name="关键阶段"
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* 优化后的达克效应阶段图标 */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {/* 愚昧之巅 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center mb-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
                <line x1="8" y1="12" x2="12" y2="12" />
                <line x1="16" y1="12" x2="12" y2="12" />
              </svg>
            </div>
            <span className="text-xs font-medium">愚昧之巅</span>
          </div>
          
          {/* 绝望之谷 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mb-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <span className="text-xs font-medium">绝望之谷</span>
          </div>
          
          {/* 开悟之坡 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="text-xs font-medium">开悟之坡</span>
          </div>
          
          {/* 大师境界 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center mb-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <span className="text-xs font-medium">大师境界</span>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          <p>达克效应描述了人们对自己能力的认知随知识水平变化的过程。</p>
        </div>
      </div>
    </div>
  );
};

export default ConceptCharts;