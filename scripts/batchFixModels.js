import fs from 'fs';

const data = JSON.parse(fs.readFileSync('components/thinkingModels.json', 'utf8'));

const modelsToFix = [
  {
    id: '创新扩散',
    deepAnalysis: '创新扩散理论（Diffusion of Innovations）由埃弗雷特·罗杰斯提出。核心洞见：新事物在人群中扩散遵循一条可预测的S型曲线。从创新者到早期采用者，再到早期大众、晚期大众，最后是落后者。最关键的挑战是跨越鸿沟——从早期采用者到早期大众的过渡。',
    principle: '1. S型曲线：创新扩散遵循S型曲线\n2. 五类采用者：不同群体有不同特征\n3. 鸿沟挑战：早期采用者和早期大众之间的鸿沟\n4. 策略差异：不同阶段需要不同策略\n5. 临界规模：达到临界规模后加速扩散',
    scope: '产品营销、技术推广、社会创新、教育改革、组织变革、市场营销',
    tips: '1. 识别群体：识别目标用户属于哪类采用者\n2. 针对策略：针对不同群体制定不同策略\n3. 跨越鸿沟：重点关注跨越鸿沟的策略\n4. 培养意见领袖：培养早期采用者成为代言人\n5. 建立社会证明：收集用户案例增强信心',
    practice: '1. 分析目标市场：识别创新者和早期采用者\n2. 制定跨越策略：设计从早期采用者到早期大众的过渡方案\n3. 建立口碑：培养意见领袖和代言人\n4. 简化采用：降低采用门槛\n5. 监测扩散：跟踪扩散进度并调整策略'
  },
  {
    id: '刺猬原则',
    deepAnalysis: '刺猬法则（Hedgehog Principle）源于古希腊寓言：狐狸知道很多事，但刺猬只知道一件大事。核心洞见：成功的企业和个人往往专注于一个核心优势，而非分散精力追求多个目标。专注是卓越的唯一入场券。',
    principle: '1. 专注原则：专注于一个核心优势\n2. 简化战略：将复杂战略简化为一个核心理念\n3. 深度优于广度：在细分领域做到极致\n4. 持续深耕：长期坚持一个方向\n5. 拒绝诱惑：拒绝所有不相关的机会',
    scope: '企业战略、职业规划、个人发展、产品定位、品牌建设、竞争策略',
    tips: '1. 找到核心：找到你的核心优势\n2. 深耕细作：在核心领域深耕细作\n3. 拒绝诱惑：拒绝所有不相关的机会\n4. 长期坚持：长期坚持一个方向\n5. 持续优化：持续优化核心能力',
    practice: '1. 自我分析：分析自己的核心优势\n2. 确定方向：确定专注的方向\n3. 制定计划：制定深耕计划\n4. 执行专注：严格执行专注策略\n5. 定期复盘：定期复盘并调整'
  },
  {
    id: '加尔斯定律',
    deepAnalysis: '加尔斯定律（Gall\'s Law）由约翰·加尔提出。核心洞见：凡是运行正常的复杂系统，必然是从一个运行正常的简单系统演化而来的。从零开始设计的复杂系统通常无法工作，必须从简单系统开始逐步演化。',
    principle: '1. 简单起步：从简单系统开始\n2. 逐步演化：让系统逐步演化\n3. 避免过度设计：不要从零设计复杂系统\n4. 验证有效：确保每个阶段都有效运行\n5. 有机生长：让系统有机生长',
    scope: '系统设计、软件开发、组织建设、产品规划、项目管理、企业架构',
    tips: '1. 从简单开始：从最简单的版本开始\n2. 逐步迭代：逐步迭代增加复杂度\n3. 验证每个阶段：确保每个阶段都有效\n4. 避免过度设计：避免一开始就设计复杂系统\n5. 有机演化：让系统有机演化',
    practice: '1. 设计MVP：设计最小可行产品\n2. 验证有效性：验证系统有效性\n3. 逐步扩展：逐步扩展功能\n4. 持续迭代：持续迭代优化\n5. 监控复杂度：监控系统复杂度'
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
