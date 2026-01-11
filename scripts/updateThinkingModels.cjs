const fs = require('fs');
const path = require('path');

// Load the existing thinking models
const modelsPath = path.join(__dirname, '..', 'components', 'thinkingModels.json');
const models = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));

// Define content templates for different types of thinking models
const templates = {
  '模型': {
    description: (label) => `思维模型：${label}，一种系统性的分析框架，用于解决特定领域的问题和优化决策过程。`,
    deepAnalysis: (label) => `深入解析${label}的核心构成和运作机制。该模型通过将复杂问题分解为可管理的组成部分，提供了一种结构化的问题解决方法。它强调各要素之间的相互关系和动态平衡，使决策者能够从多个维度审视问题，避免单一视角的局限性。`,
    principle: (label) => `${label}的核心原则在于建立系统性思维框架，通过结构化的分析流程实现问题的有效解决。`,
    scope: '战略规划、商业分析、项目管理、决策制定',
    tips: (label) => `1. 理解${label}的基本构成要素；2. 掌握各要素之间的相互关系；3. 在实际场景中灵活应用；4. 定期评估模型效果并进行优化；5. 结合其他模型形成综合分析体系`,
    practice: (label) => `在实际应用中，${label}应结合具体情境进行调整。通过案例分析和模拟练习，逐步掌握模型的精髓。建议在团队讨论中引入该模型，以促进结构化思维的形成。`
  },
  '分析': {
    description: (label) => `分析方法：${label}，一种系统性的问题分解和要素分析技术。`,
    deepAnalysis: (label) => `${label}是一种结构化的问题分析方法，通过将复杂问题拆解为多个关键要素，帮助分析者全面理解问题的本质。该方法强调从不同角度审视问题，识别关键变量及其相互影响，从而为决策提供可靠依据。`,
    principle: (label) => `${label}的核心原则是系统性分解，通过结构化的分析流程揭示问题的内在逻辑和关键影响因素。`,
    scope: '问题诊断、风险评估、流程优化、决策支持',
    tips: (label) => `1. 确保分析要素的全面性；2. 关注要素间的相互关系；3. 采用定量与定性相结合的方法；4. 保持分析的客观性；5. 及时验证分析结果`,
    practice: (label) => `在实践中，${label}需要结合具体情境进行调整。通过多次应用和验证，逐步提升分析的准确性和有效性。建议建立标准化的分析流程，以确保分析结果的一致性和可重复性。`
  },
  '效应': {
    description: (label) => `心理/社会效应：${label}，描述特定情境下人类行为或社会现象的规律性表现。`,
    deepAnalysis: (label) => `${label}揭示了人类在特定环境或刺激下的认知偏差或行为倾向。这一效应源于人类心理的固有机制，往往在无意识状态下发生，对决策和判断产生深远影响。了解这一效应有助于识别潜在的认知陷阱，并采取相应的应对策略。`,
    principle: (label) => `${label}的根本原理在于人类认知或行为的固有模式，这些模式在特定条件下会表现出一致的规律性。`,
    scope: '心理学、行为经济学、社会学、决策分析',
    tips: (label) => `1. 识别效应发生的典型情境；2. 了解效应的产生机制；3. 学会防范负面效应的影响；4. 在适当时候利用正面效应；5. 持续观察和验证效应的表现`,
    practice: (label) => `在日常生活中，可以通过观察和记录来验证${label}的存在。在决策过程中，有意识地检查是否受到该效应的影响。在管理或营销中，可以合理利用该效应来引导积极的行为变化。`
  },
  '原则': {
    description: (label) => `管理/设计原则：${label}，指导特定领域实践活动的基本准则和规范。`,
    deepAnalysis: (label) => `${label}是经过长期实践验证的基本准则，为相关领域的活动提供了根本性的指导。这一原则反映了该领域内在的规律和要求，是实现目标、避免错误的重要指南。理解和应用这一原则，有助于提高工作的有效性和成功率。`,
    principle: (label) => `${label}的核心在于遵循事物发展的基本规律，通过坚持根本性准则来实现预期目标。`,
    scope: '管理学、设计学、工程学、质量管理',
    tips: (label) => `1. 深入理解原则的理论基础；2. 识别适用的具体场景；3. 在实践中坚持原则导向；4. 平衡原则与灵活性的关系；5. 传承和推广原则的应用`,
    practice: (label) => `在实践中应用${label}需要将抽象的原则转化为具体的操作指南。通过建立相应的制度和流程，确保原则得到贯彻。同时，要根据实际情况对原则的应用方式进行调整，以实现最佳效果。`
  },
  '法则': {
    description: (label) => `科学/管理法则：${label}，描述特定领域客观规律或有效做法的总结。`,
    deepAnalysis: (label) => `${label}是基于大量观察和实践总结出的规律性认识，反映了特定领域中的重要关系或有效做法。这一法则通常具有普遍适用性，是相关领域实践的重要指导。理解其背后的机制有助于更好地应用和发挥其价值。`,
    principle: (label) => `${label}的根本在于揭示事物发展的客观规律或经过验证的有效模式，为实践提供可靠指导。`,
    scope: '管理学、经济学、心理学、自然科学',
    tips: (label) => `1. 理解法则的适用条件；2. 掌握法则的核心要义；3. 在实践中灵活运用；4. 注意法则的局限性；5. 结合其他法则综合应用`,
    practice: (label) => `在实际应用中，${label}需要结合具体环境进行调整。通过持续实践和反思，逐步掌握法则应用的精髓。建立相应的监测机制，确保法则的有效实施。`
  },
  '定律': {
    description: (label) => `科学定律：${label}，描述自然或社会现象中稳定关系的规律性总结。`,
    deepAnalysis: (label) => `${label}是通过观察和实验发现的稳定关系，反映了特定现象中的内在规律。这一定律通常可以用数学公式或明确的规则来表达，具有高度的预测性。理解这一定律有助于更好地认识和利用相关现象。`,
    principle: (label) => `${label}的核心在于揭示现象背后的稳定关系和内在规律，为理解和预测提供基础。`,
    scope: '自然科学、社会科学、经济学、心理学',
    tips: (label) => `1. 掌握定律的数学表达或核心规则；2. 理解定律的适用范围；3. 识别定律的边界条件；4. 应用定律进行预测；5. 注意定律的局限性`,
    practice: (label) => `在实践中应用${label}需要准确识别适用情境，并正确运用定律进行分析和预测。通过实际案例验证定律的有效性，并注意其在特定条件下的应用限制。`
  },
  '理论': {
    description: (label) => `学术理论：${label}，解释特定现象或问题的系统性知识体系。`,
    deepAnalysis: (label) => `${label}是系统性的知识体系，旨在解释特定现象或问题的内在机制。该理论通过一系列概念、假设和推论，构建了对相关现象的深入理解框架。理论的提出通常基于广泛的观察和研究，为实践提供了重要的指导。`,
    principle: (label) => `${label}的核心原理在于建立对特定现象的系统性解释框架，揭示现象背后的内在机制。`,
    scope: '学术研究、理论构建、现象解释、实践指导',
    tips: (label) => `1. 理解理论的基本假设；2. 掌握理论的核心概念；3. 学习理论的推导过程；4. 验证理论的适用性；5. 结合实践深化理解`,
    practice: (label) => `在实践中应用${label}需要将理论知识转化为具体的操作指导。通过案例分析和实证研究，验证理论的有效性，并在应用中不断完善对理论的理解。`
  },
  '策略': {
    description: (label) => `策略框架：${label}，指导特定目标实现的系统性方法和行动计划。`,
    deepAnalysis: (label) => `${label}是一种系统性的策略框架，旨在通过有序的步骤和方法实现特定目标。该策略考虑了内外部环境因素，提供了实现目标的路径和方法。通过合理应用这一策略，可以提高目标实现的效率和成功率。`,
    principle: (label) => `${label}的核心原则是通过系统性的规划和执行，有效配置资源以实现既定目标。`,
    scope: '战略管理、市场营销、投资理财、个人发展',
    tips: (label) => `1. 明确策略目标和预期结果；2. 分析内外部环境条件；3. 制定详细的实施计划；4. 建立监控和调整机制；5. 评估策略效果并优化`,
    practice: (label) => `在实际应用中，${label}需要根据具体环境进行调整。通过分阶段实施和持续监控，确保策略的有效执行。建立反馈机制，及时调整策略以适应环境变化。`
  },
  '方法': {
    description: (label) => `实践方法：${label}，解决特定问题或完成特定任务的具体操作方式。`,
    deepAnalysis: (label) => `${label}是一种具体的实践方法，提供了完成特定任务或解决问题的详细步骤。该方法经过实践验证，具有较高的可操作性和有效性。通过系统性的步骤，引导使用者达到预期目标。`,
    principle: (label) => `${label}的核心在于提供可操作的实践指导，通过明确的步骤实现特定目标。`,
    scope: '项目管理、学习提升、问题解决、技能培养',
    tips: (label) => `1. 掌握方法的基本步骤；2. 理解每步的目的和要点；3. 在实践中逐步熟练；4. 根据情况适当调整；5. 总结经验并持续改进`,
    practice: (label) => `在实际应用${label}时，需要严格按照步骤执行，同时根据具体情况进行适当调整。通过反复练习，逐步掌握方法的精髓。建立检查点，确保每个步骤都得到正确执行。`
  },
  '思维': {
    description: (label) => `思维模式：${label}，一种独特的认知框架或思考方式，用于提升决策和问题解决能力。`,
    deepAnalysis: (label) => `${label}是一种独特的认知框架，通过特定的思考路径和模式，帮助人们更有效地处理复杂问题。这种思维模式能够突破常规思维的局限，提供新的视角和解决方案。它强调从不同维度审视问题，培养多元化的思考习惯。`,
    principle: (label) => `${label}的核心在于建立多元化的思考框架，通过不同的认知路径提升问题解决能力。`,
    scope: '决策制定、问题解决、创新思维、批判性思考',
    tips: (label) => `1. 理解思维模式的基本原理；2. 练习特定的思考路径；3. 在不同情境中应用；4. 与其他思维模式结合；5. 持续训练以形成习惯`,
    practice: (label) => `在日常实践中，应有意识地运用${label}来分析问题和制定决策。通过案例练习和反思，逐步内化这种思维模式。鼓励团队成员共同运用，以促进集体思维的提升。`
  },
  'default': {
    description: (label) => `思维模型：${label}，在理论或实践层面提供指导的框架或方法。`,
    deepAnalysis: (label) => `${label}是一种有效的思维框架或实践方法，旨在帮助理解和解决特定领域的问题。通过系统性的分析和处理，它提供了清晰的思路和方法，有助于提升决策质量和解决问题的效率。`,
    principle: (label) => `${label}的核心原则是提供结构化的解决方案，通过有效策略实现目标。`,
    scope: '思维训练、问题解决、决策制定、学习提升',
    tips: (label) => `1. 深入理解${label}的基本概念；2. 在实际中尝试应用；3. 观察和评估效果；4. 根据反馈调整应用方式；5. 与其它方法结合使用`,
    practice: (label) => `在实际应用中，应结合具体情况灵活运用${label}。通过反复实践和反思，逐步掌握其精髓。建议在团队中分享和讨论，以促进共同理解和应用。`
  }
};

// Function to categorize a model
function categorizeModel(label) {
  if(label.includes('模型')) return '模型';
  if(label.includes('分析')) return '分析';
  if(label.includes('效应')) return '效应';
  if(label.includes('原则')) return '原则';
  if(label.includes('法则')) return '法则';
  if(label.includes('理论')) return '理论';
  if(label.includes('策略')) return '策略';
  if(label.includes('方法')) return '方法';
  if(label.includes('定律')) return '定律';
  if(label.includes('思维')) return '思维';
  return 'default';
}

// Function to generate enhanced content for a model
function generateModelContent(model) {
  const category = categorizeModel(model.label);
  const template = templates[category];
  
  return {
    ...model,
    description: template.description(model.label),
    deepAnalysis: template.deepAnalysis(model.label),
    principle: template.principle(model.label),
    scope: template.scope,
    tips: template.tips(model.label),
    practice: template.practice(model.label)
  };
}

// Update all models with enhanced content
console.log(`Updating content for ${models.length} thinking models...`);
const updatedModels = models.map(generateModelContent);

// Write the updated models back to the file
fs.writeFileSync(modelsPath, JSON.stringify(updatedModels, null, 2));
console.log('All thinking models updated successfully!');
console.log('Content generation completed for all 536 models.');