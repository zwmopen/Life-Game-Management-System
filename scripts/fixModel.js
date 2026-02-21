import fs from 'fs';

const data = JSON.parse(fs.readFileSync('components/thinkingModels.json', 'utf8'));

const idx = data.findIndex(m => m.id === '共同知识');
if (idx !== -1) {
  const m = data[idx];
  const visualDesign = m.visualDesign;
  
  const newData = {
    id: m.id,
    name: m.name,
    label: m.label,
    icon: m.icon,
    description: m.description,
    deepAnalysis: '共同知识（Common Knowledge）是一个递归的认知结构。核心洞见：每个人都知道与每个人都知道每个人都知道之间有着天壤之别。只有当信息成为共同知识，它才能瞬间转化为大规模、高强度的集体行动（如股市崩盘、王朝倾覆、罢工）。',
    principle: '1. 递归认知：共同知识要求无限层次的相互认知\n2. 公开宣告：通过公开宣告确保信息的共同可达性\n3. 协调基础：共同知识是集体协调行动的必要基础\n4. 状态转变：从私有知识到共同知识是质的飞跃\n5. 网络效应：共同知识的影响力随群体规模指数增长',
    scope: '社会运动、市场营销、政治沟通、组织管理、法律制度、金融市场',
    tips: '1. 公开宣告策略：利用公共平台确保信息的广泛传播\n2. 仪式化传播：通过仪式、符号和重复强化共有性\n3. 多渠道确认：通过不同渠道重复传递同一信息\n4. 利用既有知识：基于已有共同知识构建新的共同知识\n5. 监测状态：通过舆情分析监测共同知识状态',
    practice: '1. 识别关键信息：确定哪些信息需要转化为共同知识\n2. 设计宣告策略：选择合适的公开宣告渠道和方式\n3. 多渠道传播：通过多个渠道重复传递同一信息\n4. 监测传播效果：跟踪信息在群体中的传播状态\n5. 强化共同知识：通过仪式、符号和重复强化共有性',
    visualDesign: visualDesign
  };
  
  data[idx] = newData;
  fs.writeFileSync('components/thinkingModels.json', JSON.stringify(data, null, 2));
  console.log('Fixed!');
} else {
  console.log('Model not found');
}
