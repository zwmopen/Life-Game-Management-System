import fs from 'fs';

const data = JSON.parse(fs.readFileSync('components/thinkingModels.json', 'utf8'));

const modelsToFix = [
  {
    id: '卡丁法则',
    deepAnalysis: '卡丁法则（Cardin\'s Law）源于时尚设计师皮尔·卡丹的名言：领先一步是疯子，领先半步是神话。核心洞见：成功的创新不是彻底脱离大众认知，而是在大众理解的边界上进行适度突破，创造出既有独创性又能被接受的作品。',
    principle: '1. 适度领先：创新需要领先但不能过于超前\n2. 认知边界：在认知边界上进行突破\n3. 符号化价值：设计成为身份象征\n4. 审美周期：大众接受时开启下一轮\n5. 心理距离：保持可理解的新鲜感',
    scope: '时尚设计、产品设计、市场营销、内容创作、商业模式、个人发展',
    tips: '1. 半步原则：在熟悉基础上适度突破\n2. 市场测试：小规模测试接受程度\n3. 趋势预测：预测未来审美方向\n4. 符号化设计：赋予独特符号意义\n5. 持续创新：建立持续创新机制',
    practice: '1. 分析受众：分析目标受众认知边界\n2. 设计突破：在边界上设计突破\n3. 测试反馈：小规模测试收集反馈\n4. 调整尺度：根据反馈调整创新尺度\n5. 持续迭代：持续迭代创新'
  },
  {
    id: '卡尔达肖夫量级',
    deepAnalysis: '卡尔达肖夫量级（Kardashev Scale）由苏联天文学家尼古拉·卡尔达肖夫提出，用于衡量文明的技术发展水平。核心洞见：文明的发展取决于其利用能源的能力。从行星文明到恒星文明再到星系文明，能源利用能力决定了文明的高度。',
    principle: '1. 能源决定：能源利用能力决定文明高度\n2. 三个等级：行星、恒星、星系三个等级\n3. 指数增长：能源消耗呈指数增长\n4. 技术跃迁：技术跃迁需要能源跃迁\n5. 文明进化：文明进化是能源利用的进化',
    scope: '天体物理学、未来学、能源战略、技术预测、文明研究、科幻创作',
    tips: '1. 评估能源：评估当前能源利用水平\n2. 规划跃迁：规划能源利用跃迁\n3. 技术创新：推动能源技术创新\n4. 可持续发展：确保能源可持续\n5. 长远规划：制定长远发展规划',
    practice: '1. 分析现状：分析当前能源利用状况\n2. 设定目标：设定能源利用目标\n3. 制定规划：制定能源发展规划\n4. 技术创新：推动能源技术创新\n5. 持续监测：持续监测能源利用'
  },
  {
    id: '危机管理',
    deepAnalysis: '危机管理（Crisis Management）是组织和个人应对突发事件的能力体系。核心洞见：危机不是是否会发生的问题，而是何时发生的问题。成功的危机管理需要在危机发生前做好准备，危机发生时快速响应，危机发生后总结改进。',
    principle: '1. 预防为主：预防比应对更重要\n2. 快速响应：速度是危机管理的关键\n3. 透明沟通：透明沟通建立信任\n4. 系统思维：系统性地管理危机\n5. 学习改进：从危机中学习改进',
    scope: '企业管理、公共关系、政府治理、个人发展、风险管理、品牌维护',
    tips: '1. 建立预案：建立危机应对预案\n2. 快速响应：建立快速响应机制\n3. 透明沟通：保持透明沟通\n4. 统一指挥：建立统一指挥体系\n5. 总结改进：危机后总结改进',
    practice: '1. 识别风险：识别潜在危机风险\n2. 制定预案：制定危机应对预案\n3. 演练培训：定期演练和培训\n4. 快速响应：危机时快速响应\n5. 总结改进：危机后总结改进'
  },
  {
    id: '吉格勒定理',
    deepAnalysis: '吉格勒定理（Giegler\'s Theorem）揭示了目标设定与成就的关系。核心洞见：设定高目标即使未能完全实现，也能取得比低目标更好的结果。目标的高度决定了努力的程度，努力的程度决定了成就的高度。',
    principle: '1. 目标驱动：目标驱动行为\n2. 高目标效应：高目标激发高努力\n3. 残差效应：未达成的高目标仍有价值\n4. 自我实现：目标引导自我实现\n5. 持续提升：目标推动持续提升',
    scope: '个人发展、目标管理、组织管理、绩效管理、职业规划、教育培养',
    tips: '1. 设定高目标：设定有挑战性的目标\n2. 分解目标：将大目标分解为小目标\n3. 持续努力：为目标持续努力\n4. 接受残差：接受未完全达成的结果\n5. 持续提升：不断提升目标高度',
    practice: '1. 设定目标：设定高远的目标\n2. 分解目标：分解为可执行步骤\n3. 制定计划：制定实现计划\n4. 持续努力：持续努力实现\n5. 复盘改进：复盘并持续改进'
  },
  {
    id: '吉德林法则',
    deepAnalysis: '吉德林法则（Gidell\'s Law）由美国作家吉德林提出。核心洞见：把难题清清楚楚地写出来，便已经解决了一半。许多问题之所以难以解决，是因为我们没有清楚地定义问题。清晰地描述问题，往往能找到解决的方向。',
    principle: '1. 问题定义：清晰定义问题是解决的一半\n2. 书写思考：书写促进思考\n3. 结构化：结构化问题分析\n4. 显性化：将隐性思维显性化\n5. 焦点集中：聚焦于真正的问题',
    scope: '问题解决、决策分析、项目管理、创新思维、战略规划、学习成长',
    tips: '1. 写下问题：把问题写下来\n2. 清晰描述：清晰描述问题\n3. 结构分析：结构化分析问题\n4. 寻找根因：寻找问题根源\n5. 制定方案：制定解决方案',
    practice: '1. 识别问题：识别需要解决的问题\n2. 书写问题：清晰地写下问题\n3. 分析问题：结构化分析问题\n4. 寻找方案：寻找解决方案\n5. 实施验证：实施并验证效果'
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
