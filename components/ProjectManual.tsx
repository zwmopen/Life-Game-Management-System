import React, { useState, useEffect } from 'react';
import { Book, Code, Layers, Zap, GitBranch, Edit3, Save, FileText, Database, Shield, Monitor, Cpu } from 'lucide-react';
import { Theme } from '../types';

interface ProjectManualProps {
  theme: Theme;
}

const DEFAULT_DOC = `# 《反本能·主动进化系统》 (A.E.S.) 技术白皮书 v4.5

## 1. 愿景与设计哲学 (Vision & Philosophy)

本系统不仅仅是一个 To-Do 列表，它是一个**基于认知科学的外部执行力外骨骼**。
核心理念是利用**热力学第二定律（对抗熵增）**和**进化心理学**原理，通过强制性的结构和即时的多巴胺反馈，欺骗原始大脑（杏仁核）去执行有利于长期生存（前额叶皮层）的行为。

- **对抗熵增 (Negative Entropy):** 人生如同逆水行舟。不主动注入能量（纪律），系统必然走向混乱。
- **脱敏训练 (Desensitization):** 通过量化“被拒绝”和“痛苦”，消除对行动的恐惧。
- **游戏化 (Gamification):** 将枯燥的长期目标（延迟满足）转化为即时的经验值和金币（即时满足）。

## 2. 技术架构 (Technical Architecture)

### 2.1 核心技术栈
- **Frontend Framework:** React 18+ (Functional Components, Hooks)
- **Language:** TypeScript (Strict Mode enabled)
- **Styling:** TailwindCSS (Utility-first, Dark Mode native)
- **Charts:** Recharts (Data visualization)
- **Icons:** Lucide-React
- **Persistence:** LocalStorage API (No backend required, offline first)
- **Animation:** CSS Keyframes + Canvas Confetti

### 2.2 目录结构
\`\`\`
/src
  /components
    Navigation.tsx      // 侧边导航栏与熵增监控
    CommandCenter.tsx   // 首页：战略仪表盘 (Dashboard)
    LifeGame.tsx        // 核心玩法：任务、黑市、背包
    CharacterProfile.tsx// 全局组件：状态栏、番茄钟、锦囊系统
    MissionControl.tsx  // 数据中心：图表与洞察
    HallOfFame.tsx      // 成就系统
    ProjectManual.tsx   // 本文档
  App.tsx               // 根组件：全局状态管理 (State Lifting)
  types.ts              // 全局类型定义 (Interfaces & Enums)
  constants.ts          // 静态常量
\`\`\`

### 2.3 数据流 (Data Flow)
系统采用 **单向数据流**。所有核心数据（XP, Gold, Tasks, Habits, Inventory）均提升至 \`App.tsx\` 进行统一管理，并通过 Props 下发至子组件。
- **持久化策略:** \`useEffect\` 监听核心 State 变化，同步写入 \`localStorage\`。
- **状态恢复:** App 初始化时读取 \`localStorage\`，若无数据则加载 \`INITIAL_DATA\`。

## 3. 核心模块详解 (Modules)

### 3.1 战略指挥部 (Command Center)
- **定位:** 系统的“大脑”。
- **功能:** 展示今日核心 KPI（专注时长、任务完成数）、最近的活跃战役摘要以及战略锦囊。
- **设计:** 采用仪表盘布局，强调“一目了然”。

### 3.2 任务矩阵 (Task Matrix & Habit Forge)
- **习惯 (Habits):** 每日重置。用于培养微习惯，维持系统底线。
- **战役 (Projects):** 长期项目。支持分解为子任务 (SubTasks) 和恐惧设定 (Fear Setting)。
- **逻辑:** 完成任务 -> 触发 \`onUpdateBalance\` -> 增加 Gold/XP -> 播放音效 -> 触发 \`FloatingText\`。

### 3.3 角色档案与锦囊 (Character Profile & Oracle Core)
- **集成:** 顶部常驻栏。集成等级进度条、番茄钟 (Pomodoro)、以及全局锦囊系统。
- **锦囊系统 (Oracle Core):** 
  - 自动轮播：每10秒切换一条反本能语录。
  - 统一管理：合并了原本分散在各页面的语录库。
  - 沉浸模式：全屏专注界面，带呼吸法引导和白噪音。

### 3.4 经济系统 (Economy)
- **XP (经验值):** 决定等级 (Level) 和称号。不可消费。
- **Gold (金币):** 资源储备。通过任务获得，用于黑市 (Black Market) 购买实物奖励或休闲权益。
- **通胀控制:** 商品价格随购买次数动态调整（目前未实装，预留接口）。

## 4. 路线图 (Roadmap)

### Phase 1: 基础建设 (Completed)
- [x] 核心 CRUD 功能（任务、习惯）。
- [x] 基础游戏化数值（XP/Gold）。
- [x] 数据持久化。
- [x] 响应式 UI 设计。

### Phase 2: 洞察与反馈 (Current)
- [x] 高级图表（绝望之谷、心流通道）。
- [x] 全局锦囊系统整合。
- [x] 开发文档内置化。

### Phase 3: 智能进化 (Future)
- [ ] **AI 深度复盘:** 接入 LLM API，根据每日日志生成周报和改进建议。
- [ ] **随机熵增事件:** 模拟现实生活中的突发状况（扣除金币或增加任务），训练反脆弱性。
- [ ] **多端同步:** 接入 Firebase/Supabase 实现云端同步。

## 5. 开发者备注
- **修改数据:** 目前通过 \`localStorage\` 直接操作。
- **扩展建议:** 若要添加新模块，请在 \`types.ts\` 定义新的 View 枚举，并在 \`App.tsx\` 的 \`renderView\` 中注册组件。

> "代码是逻辑的载体，而这套系统是你意志的载体。"
`;

const ProjectManual: React.FC<ProjectManualProps> = ({ theme }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(DEFAULT_DOC);

  useEffect(() => {
      const saved = localStorage.getItem('aes-project-manual');
      if (saved) setContent(saved);
  }, []);

  const handleSave = () => {
      localStorage.setItem('aes-project-manual', content);
      setIsEditing(false);
  };

  const isDark = theme === 'dark';
  const textMain = isDark ? 'text-zinc-200' : 'text-slate-800';
  const textSub = isDark ? 'text-zinc-400' : 'text-slate-500';
  const cardBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200';

  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-zinc-950' : 'bg-slate-50'}`}>
        
        {/* Toolbar */}
        <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-white'}`}>
            <h1 className={`text-xl font-black flex items-center gap-2 ${textMain}`}>
                <Book className="text-blue-500"/> 项目技术白皮书 (Project Manual)
            </h1>
            <div className="flex gap-2">
                {isEditing ? (
                    <button onClick={handleSave} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-xs font-bold transition-colors">
                        <Save size={16}/> 保存文档
                    </button>
                ) : (
                    <button onClick={() => setIsEditing(true)} className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-colors border ${isDark ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'}`}>
                        <Edit3 size={16}/> 编辑模式
                    </button>
                )}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
            {isEditing ? (
                <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`w-full h-full p-8 font-mono text-sm outline-none resize-none leading-relaxed ${isDark ? 'bg-zinc-950 text-emerald-400' : 'bg-slate-50 text-slate-800'}`}
                    spellCheck={false}
                />
            ) : (
                <div className={`w-full h-full p-8 overflow-y-auto prose prose-sm max-w-4xl mx-auto ${isDark ? 'prose-invert' : ''}`}>
                    {content.split('\n').map((line, i) => {
                        // Simple Markdown Parser for Rendering
                        if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black mb-6 mt-8 pb-2 border-b border-zinc-700 flex items-center gap-2"><Cpu size={28}/> {line.replace('# ', '')}</h1>;
                        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mb-4 mt-8 text-blue-500 flex items-center gap-2"><Layers size={20}/> {line.replace('## ', '')}</h2>;
                        if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mb-2 mt-6 text-emerald-500 flex items-center gap-2"><GitBranch size={16}/> {line.replace('### ', '')}</h3>;
                        if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc marker:text-zinc-500 mb-1">{line.replace('- ', '')}</li>;
                        if (line.startsWith('`')) return <pre key={i} className="bg-black/30 p-4 rounded-lg my-4 font-mono text-xs text-zinc-400 border border-zinc-800 overflow-x-auto">{line.replace(/`/g, '')}</pre>;
                        if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-yellow-500 pl-4 italic text-zinc-400 my-4 py-2 bg-zinc-900/30 rounded-r">{line.replace('> ', '')}</blockquote>;
                        if (line.trim() === '') return <br key={i}/>;
                        return <p key={i} className="mb-2 leading-relaxed opacity-90">{line}</p>;
                    })}
                </div>
            )}
        </div>
    </div>
  );
};

export default ProjectManual;