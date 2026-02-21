import fs from 'fs';

const data = JSON.parse(fs.readFileSync('components/thinkingModels.json', 'utf8'));

const modelsToFix = [
  {
    id: '协同进化动力学',
    deepAnalysis: '协同进化动力学（Co-evolution）揭示了主体与环境的共同演化规律。核心洞见：没有孤立的进化。猎豹跑得快是因为羚羊跑得快，而羚羊跑得快是因为猎豹在后面追。主体与客体通过反馈闭环，在博弈中共同推高系统的复杂度天花板。',
    principle: '1. 相互影响：主体与环境相互影响\n2. 反馈闭环：通过反馈机制共同演化\n3. 博弈推动：竞争推动双方进化\n4. 系统协同：系统各部分协同进化\n5. 复杂度提升：共同推高系统复杂度',
    scope: '生态学、商业竞争、技术创新、组织发展、社会系统、个人成长',
    tips: '1. 塑造对手：输出高质量协作标准\n2. 同步进化：比环境平均速度快半步\n3. 生态系统思维：将自己视为系统一部分\n4. 适应性创新：保持核心竞争力同时适应变化\n5. 建立反馈：定期收集环境反馈',
    practice: '1. 分析环境：分析当前环境状态\n2. 建立反馈：建立环境反馈机制\n3. 同步进化：与环境同步进化\n4. 塑造环境：通过行为塑造环境\n5. 持续迭代：持续迭代优化'
  },
  {
    id: '南风效应',
    deepAnalysis: '南风效应（South Wind Effect）源于伊索寓言《北风与太阳》。核心洞见：温暖比强硬更有效。北风用尽全力吹不脱行人的大衣，而太阳温暖地照耀，行人主动脱下了大衣。在人际交往和管理中，温和的方式往往比强硬的方式更有效。',
    principle: '1. 温和优于强硬：温和的方式更有效\n2. 主动配合：让人主动配合而非被迫\n3. 情感共鸣：建立情感共鸣\n4. 尊重对方：尊重对方的自主性\n5. 持久影响：温和方式影响更持久',
    scope: '人际交往、管理沟通、教育培训、销售谈判、家庭教育、领导力',
    tips: '1. 以理服人：用道理而非强制\n2. 以情动人：用情感打动对方\n3. 尊重对方：尊重对方的选择\n4. 循序渐进：循序渐进地引导\n5. 正面激励：用正面激励代替惩罚',
    practice: '1. 了解对方：了解对方的需求和想法\n2. 建立信任：建立信任关系\n3. 温和沟通：用温和的方式沟通\n4. 引导而非强制：引导而非强制\n5. 持续关怀：持续关怀和支持'
  },
  {
    id: '卡尼曼双系统',
    deepAnalysis: '卡尼曼双系统理论（Kahneman\'s Two Systems）由诺贝尔奖得主丹尼尔·卡尼曼提出。核心洞见：人类思维有两个系统——系统1快速、自动、直觉；系统2缓慢、费力、理性。大多数决策由系统1做出，但重要决策需要系统2介入。',
    principle: '1. 双系统并存：系统1和系统2并存\n2. 系统1主导：大多数决策由系统1做出\n3. 系统2介入：重要决策需要系统2\n4. 认知节省：大脑倾向使用系统1\n5. 偏误来源：系统1是认知偏误的主要来源',
    scope: '决策分析、行为经济学、心理学、投资决策、消费行为、管理决策',
    tips: '1. 识别系统：识别当前使用哪个系统\n2. 重要决策启用系统2：重要决策启用系统2\n3. 警惕直觉：警惕系统1的直觉判断\n4. 建立检查清单：用检查清单辅助系统2\n5. 培养元认知：培养对思维过程的认知',
    practice: '1. 识别决策类型：识别决策是否重要\n2. 启用系统2：重要决策启用系统2\n3. 收集信息：充分收集信息\n4. 理性分析：进行理性分析\n5. 延迟判断：延迟直觉判断'
  },
  {
    id: '卡瑞尔公式',
    deepAnalysis: '卡瑞尔公式（Carrel\'s Formula）由亚历克西斯·卡瑞尔提出。核心洞见：面对困境时，问自己三个问题：最坏的情况是什么？如果最坏的情况发生，我能接受吗？我该如何改善最坏的情况？这种思考方式能帮助我们理性面对恐惧。',
    principle: '1. 直面最坏：直面最坏的情况\n2. 接受最坏：接受最坏的情况\n3. 改善最坏：想办法改善最坏情况\n4. 理性分析：理性分析而非情绪反应\n5. 行动导向：从恐惧转向行动',
    scope: '危机处理、风险管理、心理调适、决策分析、压力管理、职业规划',
    tips: '1. 问最坏是什么：问最坏的情况是什么\n2. 问能否接受：问能否接受最坏情况\n3. 问如何改善：问如何改善最坏情况\n4. 制定计划：制定改善计划\n5. 采取行动：采取行动改善',
    practice: '1. 识别困境：识别当前的困境\n2. 分析最坏：分析最坏的情况\n3. 评估接受度：评估能否接受\n4. 制定改善方案：制定改善方案\n5. 采取行动：采取行动'
  },
  {
    id: '卢维斯定理',
    deepAnalysis: '卢维斯定理（Louvi\'s Theorem）揭示了谦虚的本质。核心洞见：真正的谦虚不是把自己想得很糟，而是完全不想自己。谦虚不是自我贬低，而是将注意力从自己转移到他人和事物上。过度的自我关注，无论是自大还是自卑，都不是真正的谦虚。',
    principle: '1. 忘我关注：将注意力从自己转移\n2. 不是自我贬低：谦虚不是自我贬低\n3. 关注他人：关注他人和事物\n4. 开放心态：保持开放的学习心态\n5. 承认无知：承认自己的无知',
    scope: '人际交往、学习成长、领导力、团队协作、沟通表达、个人修养',
    tips: '1. 减少自我关注：减少对自我的关注\n2. 关注他人：关注他人的需求和想法\n3. 保持开放：保持开放的心态\n4. 承认无知：承认自己的无知\n5. 持续学习：持续学习新知识',
    practice: '1. 自我观察：观察自己的自我关注程度\n2. 转移注意力：将注意力转移到他人\n3. 倾听他人：认真倾听他人\n4. 承认不足：承认自己的不足\n5. 持续改进：持续改进自己'
  }
];

let fixedCount = 0;

for (const modelData of modelsToFix) {
  const idx = data.findIndex(m => m.id === modelData.id);
  if (idx !== -1) {
    const m = data[idx];
    const visualDesign = m.visualDesign;
    
    const newData = {
      id: m.id,
      name: m.name,
      label: m.label,
      icon: m.icon,
      description: m.description,
      deepAnalysis: modelData.deepAnalysis,
      principle: modelData.principle,
      scope: modelData.scope,
      tips: modelData.tips,
      practice: modelData.practice,
      visualDesign: visualDesign
    };
    
    data[idx] = newData;
    fixedCount++;
    console.log(`Fixed: ${modelData.id}`);
  } else {
    console.log(`Not found: ${modelData.id}`);
  }
}

fs.writeFileSync('components/thinkingModels.json', JSON.stringify(data, null, 2));
console.log(`\nTotal fixed: ${fixedCount} models`);
