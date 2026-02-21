import fs from 'fs';

const data = JSON.parse(fs.readFileSync('components/thinkingModels.json', 'utf8'));

const modelsToFix = [
  {
    id: '勒布定理',
    deepAnalysis: '勒布定理（Leibniz\'s Law）是同一性原则的核心。核心洞见：如果两个事物完全相同，那么它们的所有属性都必须相同。反之，如果存在任何一个属性不同，则两个事物不同。这个原则在逻辑推理和身份识别中至关重要。',
    principle: '1. 同一性原则：相同事物具有所有相同属性\n2. 不可区分性：不可区分的事物是相同的\n3. 属性对比：通过属性对比确定同一性\n4. 逻辑推理：用于身份识别和逻辑推理\n5. 排除法：通过差异排除不同事物',
    scope: '逻辑推理、身份识别、法律判断、科学验证、数据分析、人工智能',
    tips: '1. 列举属性：列举所有相关属性\n2. 逐一对比：逐一对比属性\n3. 寻找差异：寻找任何差异\n4. 确定同一性：确定是否同一\n5. 记录结论：记录对比结论',
    practice: '1. 确定对比对象：确定需要对比的对象\n2. 列举属性：列举所有相关属性\n3. 逐一对比：逐一对比每个属性\n4. 分析差异：分析发现的差异\n5. 得出结论：得出同一性结论'
  },
  {
    id: '动态平衡',
    deepAnalysis: '动态平衡（Dynamic Equilibrium）是系统论的核心概念。核心洞见：稳定不是静止，而是在不断变化中保持相对稳定的状态。系统通过自我调节机制，在变化中维持平衡，这种平衡是动态的而非静态的。',
    principle: '1. 动态稳定：稳定是在变化中维持的\n2. 自我调节：系统具有自我调节能力\n3. 反馈机制：通过反馈维持平衡\n4. 临界点：存在平衡的临界点\n5. 适应性：系统能适应环境变化',
    scope: '生态系统、经济系统、组织管理、个人发展、健康养生、社会稳定',
    tips: '1. 识别反馈：识别系统的反馈机制\n2. 监测指标：监测关键平衡指标\n3. 及时调节：及时进行调节\n4. 预警临界：预警临界点\n5. 保持弹性：保持系统弹性',
    practice: '1. 分析系统：分析系统的平衡机制\n2. 设定指标：设定平衡指标\n3. 监测状态：持续监测系统状态\n4. 及时调节：发现偏差及时调节\n5. 优化机制：优化平衡机制'
  },
  {
    id: '动态能力',
    deepAnalysis: '动态能力（Dynamic Capabilities）由大卫·提斯提出。核心洞见：在快速变化的环境中，企业的竞争优势不在于拥有什么资源，而在于能否快速整合、构建和重构资源以适应环境变化。动态能力是企业持续竞争优势的源泉。',
    principle: '1. 感知能力：感知环境变化的能力\n2. 抓住机会：抓住新机会的能力\n3. 重构资源：重构资源配置的能力\n4. 学习能力：持续学习的能力\n5. 适应变化：适应环境变化的能力',
    scope: '企业战略、组织管理、创新管理、竞争分析、资源配置、变革管理',
    tips: '1. 培养感知：培养环境感知能力\n2. 快速响应：建立快速响应机制\n3. 灵活配置：灵活配置资源\n4. 持续学习：建立学习型组织\n5. 拥抱变化：拥抱变化而非抗拒',
    practice: '1. 环境扫描：持续扫描环境变化\n2. 机会识别：识别新机会\n3. 资源重构：重构资源配置\n4. 能力建设：建设新能力\n5. 持续迭代：持续迭代优化'
  },
  {
    id: '势能',
    deepAnalysis: '势能（Potential Energy）源于物理学，指系统因其位置或状态而储存的能量。核心洞见：势能是潜在的、可转化的能量。在商业和生活中，势能可以理解为积累的资源、能力或优势，在适当时机可以转化为动能（行动力）。',
    principle: '1. 储存能量：势能是储存的能量\n2. 位置依赖：势能依赖于位置或状态\n3. 可转化性：势能可转化为动能\n4. 积累效应：势能需要积累\n5. 释放时机：势能释放需要时机',
    scope: '战略规划、资源管理、个人发展、投资决策、组织建设、竞争策略',
    tips: '1. 积累势能：持续积累资源和能力\n2. 选择位置：选择有利的位置\n3. 等待时机：等待合适的释放时机\n4. 适时释放：在适当时机释放势能\n5. 持续积累：释放后继续积累',
    practice: '1. 评估势能：评估当前的势能\n2. 制定积累计划：制定势能积累计划\n3. 选择位置：选择有利的位置\n4. 等待时机：等待释放时机\n5. 释放转化：释放势能转化为动能'
  },
  {
    id: '势能理论',
    deepAnalysis: '势能理论将物理学概念应用于商业和个人发展。核心洞见：成功的关键在于积累势能——通过持续学习、建立关系、积累资源，在关键时刻释放势能，实现突破性发展。势能越高，转化的动能越大。',
    principle: '1. 势能积累：成功需要势能积累\n2. 高位优势：高位具有更大势能\n3. 转化机制：势能转化为动能的机制\n4. 时机选择：释放势能的时机选择\n5. 循环积累：势能需要循环积累',
    scope: '职业发展、企业战略、投资决策、个人成长、资源管理、竞争策略',
    tips: '1. 持续积累：持续积累势能\n2. 提升位置：提升自己的位置\n3. 建立转化机制：建立势能转化机制\n4. 把握时机：把握释放时机\n5. 循环发展：形成积累释放循环',
    practice: '1. 分析势能：分析当前势能状态\n2. 制定积累策略：制定势能积累策略\n3. 提升位置：提升自己的位置\n4. 建立转化机制：建立势能转化机制\n5. 把握释放时机：把握释放时机'
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
