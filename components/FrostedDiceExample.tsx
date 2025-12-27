import React from 'react';
import { Dice5, Sparkles, Coins, Star, Clock } from 'lucide-react';
import { DiceState, DiceTask, DiceCategory } from '../types';

interface FrostedDiceExampleProps {
  diceState?: DiceState;
  isDark?: boolean;
  isNeomorphic?: boolean;
}

const FrostedDiceExample: React.FC<FrostedDiceExampleProps> = ({ 
  diceState, 
  isDark = false, 
  isNeomorphic = false 
}) => {
  // 生成示例骰子结果
  const exampleResult: DiceTask = {
    id: 'example-result',
    text: '专注30分钟完成一项重要任务',
    category: DiceCategory.EFFICIENCY,
    goldRange: [10, 20],
    xpRange: [15, 25],
    duration: 30
  };

  // 拟态风格样式变量
  const neomorphicStyles = {
    bg: 'bg-[#e0e5ec]',
    border: 'border-[#e0e5ec]',
    shadow: 'shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]',
    hoverShadow: 'hover:shadow-[10px_10px_20px_rgba(163,177,198,0.7),-10px_-10px_20px_rgba(255,255,255,1)]',
    activeShadow: 'active:shadow-[inset_5px_5px_10px_rgba(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,1)]',
    transition: 'transition-all duration-200'
  };

  // 卡片背景样式 - 包含磨砂质感效果
  const cardBg = isNeomorphic 
      ? `${neomorphicStyles.bg} ${neomorphicStyles.border} rounded-[48px] ${neomorphicStyles.shadow} ${neomorphicStyles.hoverShadow} ${neomorphicStyles.activeShadow} ${neomorphicStyles.transition}` 
      : isDark 
      ? 'bg-zinc-900 border-zinc-800 shadow-[inset_-15px_-15px_30px_rgba(255,255,255,0.05),inset_15px_15px_30px_rgba(0,0,0,0.3)]' 
      : 'bg-white border-slate-200 shadow-[inset_-15px_-15px_30px_rgba(255,255,255,0.8),inset_15px_15px_30px_rgba(0,0,0,0.1)]';

  const textMain = isDark ? 'text-zinc-200' : isNeomorphic ? 'text-zinc-700' : 'text-slate-800';

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-8">命运骰子 - 磨砂质感效果示例</h1>

      {/* 1. 磨砂质感骰子按钮 */}
      <div className="bg-gray-100 dark:bg-gray-900 p-8 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">磨砂质感骰子按钮</h2>
        <div className="flex justify-center">
          <button 
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform ${diceState?.isSpinning ? 'animate-[spin_2s_ease-in-out]' : 'hover:scale-110 hover:rotate-12'} ${isNeomorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]' : isDark ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700' : 'bg-gradient-to-br from-white to-slate-100 border-slate-200'} border-4 ${diceState?.isSpinning ? 'border-yellow-500' : 'border-blue-500'} shadow-lg hover:shadow-xl group`}
          >
            {/* 3D骰子效果容器 - 磨砂质感核心实现 */}
            <div className={`relative transition-all duration-500 ${diceState?.isSpinning ? 'animate-[spin_1s_linear_infinite]' : 'animate-[rotate3d_5s_linear_infinite]'}`} style={{ perspective: '500px' }}>
              {/* 骰子立体磨砂效果 */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-blue-100 opacity-20 blur-lg transform rotate-45"></div>
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-blue-200 to-blue-500 opacity-10 blur-md transform -rotate-45`}></div>
              
              {/* 3D旋转骰子 - 磨砂质感增强 */}
              <div className={`relative z-10 transition-all duration-1000 ${diceState?.isSpinning ? 'animate-[spin3d_0.5s_linear_infinite]' : 'animate-[rotate3d_8s_ease-in-out_infinite]'}`} style={{ transformStyle: 'preserve-3d' }}>
                <Dice5 
                  size={44} 
                  className={`relative z-10 transition-all duration-300 ${diceState?.isSpinning ? 'text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]' : 'text-blue-500 group-hover:text-blue-600 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]'}`} 
                />
                {/* 骰子投影效果 - 增强磨砂立体感 */}
                <div className="absolute inset-0 rounded-full bg-blue-500 opacity-5 blur-xl translate-z-[-20px] scale-[1.2]"></div>
              </div>
              
              {/* 骰子高光效果 - 磨砂质感点睛之笔 */}
              <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-white opacity-30 blur-sm"></div>
              <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full bg-white opacity-10 blur-sm"></div>
            </div>
          </button>
        </div>
        <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
          点击骰子体验磨砂质感动画效果
        </p>
      </div>

      {/* 2. 磨砂质感结果弹窗 */}
      <div className="bg-gray-100 dark:bg-gray-900 p-8 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">磨砂质感结果弹窗</h2>
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${cardBg} shadow-2xl relative transform transition-all duration-500 animate-in zoom-in`}>
            {/* 弹窗磨砂装饰 - 核心磨砂质感实现 */}
            <div className="absolute top-0 left-0 w-full h-full rounded-2xl bg-gradient-to-br from-blue-500/10 to-yellow-500/10 opacity-50 pointer-events-none"></div>
            <h3 className={`font-bold mb-4 ${textMain} flex items-center justify-center gap-2 text-2xl`}>
              <Sparkles size={24} className="text-yellow-500 animate-pulse" />
              命运礼物
            </h3>
            <div className="space-y-6">
              {/* 3D骰子展示 */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className={`${diceState?.isSpinning ? 'animate-[spin_1s_linear_infinite]' : ''}`}>
                    <Dice5 size={96} className="text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]" />
                  </div>
                  {/* 骰子光效 - 增强磨砂质感 */}
                  <div className="absolute inset-0 rounded-full bg-yellow-500/30 blur-xl animate-pulse"></div>
                </div>
                <h4 className={`text-xl font-bold ${textMain} mb-2 mt-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent`}>
                  {(() => {
                    switch (exampleResult.category) {
                      case DiceCategory.HEALTH:
                        return '健康微行动';
                      case DiceCategory.EFFICIENCY:
                        return '效率任务';
                      case DiceCategory.LEISURE:
                        return '休闲小奖励';
                      default:
                        return '未知任务';
                    }
                  })()}
                </h4>
                <p className={`text-lg ${textMain} p-4 rounded-lg ${isDark ? 'bg-zinc-800/80' : 'bg-white/80'} backdrop-blur-sm`}>{exampleResult.text}</p>
              </div>
              
              {/* 奖励信息 - 磨砂卡片 */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-zinc-800/80 hover:bg-zinc-800' : 'bg-white/80 hover:bg-white'} backdrop-blur-sm transition-all hover:shadow-lg border border-zinc-700/50`}>
                  <div className="text-xs text-zinc-500 mb-1">金币</div>
                  <div className="text-lg font-bold text-yellow-500 flex items-center justify-center gap-1">
                    <Coins size={18} />
                    +15
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-zinc-800/80 hover:bg-zinc-800' : 'bg-white/80 hover:bg-white'} backdrop-blur-sm transition-all hover:shadow-lg border border-zinc-700/50`}>
                  <div className="text-xs text-zinc-500 mb-1">经验</div>
                  <div className="text-lg font-bold text-purple-500 flex items-center justify-center gap-1">
                    <Star size={18} />
                    +20
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-zinc-800/80 hover:bg-zinc-800' : 'bg-white/80 hover:bg-white'} backdrop-blur-sm transition-all hover:shadow-lg border border-zinc-700/50`}>
                  <div className="text-xs text-zinc-500 mb-1">时长</div>
                  <div className="text-lg font-bold text-blue-500 flex items-center justify-center gap-1">
                    <Clock size={18} />
                    30 分钟
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 磨砂质感任务卡片 */}
      <div className="bg-gray-100 dark:bg-gray-900 p-8 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">磨砂质感任务卡片</h2>
        <div className={`${cardBg} border p-4 rounded-xl`}>
          <h4 className={`text-lg font-bold mb-3 ${textMain}`}>待完成任务</h4>
          <div className="space-y-2">
            <div 
              className={`p-3 rounded-lg ${isDark ? 'bg-zinc-800/80' : 'bg-white/80'} backdrop-blur-sm transition-all hover:shadow-md border border-zinc-700/50`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className={`font-medium ${textMain}`}>{exampleResult.text}</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                    <span className="text-yellow-500">+15 金币</span>
                    <span className="text-purple-500">+20 经验</span>
                    <span className="text-blue-500">30 分钟</span>
                  </div>
                </div>
                <button 
                  className={`px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors`}
                >
                  标记完成
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 磨砂质感代码说明 */}
      <div className="bg-gray-100 dark:bg-gray-900 p-8 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">磨砂质感实现说明</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">核心磨砂质感 CSS 属性：</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li><code>backdrop-blur-sm</code> - 背景模糊效果</li>
              <li><code>bg-gradient-to-br</code> - 渐变背景</li>
              <li><code>opacity-50</code> - 半透明效果</li>
              <li><code>shadow-lg/shadow-xl</code> - 多层次阴影</li>
              <li><code>border-zinc-700/50</code> - 半透明边框</li>
              <li><code>bg-zinc-800/80</code> - 半透明背景色</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">拟态设计（Neomorphic）磨砂效果：</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li><code>bg-[#e0e5ec]</code> - 拟态背景色</li>
              <li><code>shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,1)]</code> - 拟态阴影</li>
              <li><code>perspective: '500px'</code> - 3D透视效果</li>
              <li><code>transformStyle: 'preserve-3d'</code> - 3D变换样式</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">3D 效果增强：</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>多层渐变叠加</li>
              <li>模糊效果组合</li>
              <li>高光与阴影对比</li>
              <li>旋转动画效果</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrostedDiceExample;
