/**
 * 检查思维模型中的套话内容
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clichePatterns = {
  deepAnalysis: /这是一个思维模型，展示了/,
  principle: /思维模型的核心原则[：:]/,
  scope: /^思维模式、决策分析、问题解决$/,
  tips: /1\. 理解模型的核心概念/,
  practice: /将.*应用到日常决策和问题解决中/
};

function checkModels() {
  const modelsDir = path.join(__dirname, '..', 'data', 'thinking-models');
  const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.json'));
  
  const problemModels = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(modelsDir, file), 'utf8');
    const model = JSON.parse(content);
    
    const issues = [];
    if (clichePatterns.deepAnalysis.test(model.deepAnalysis || '')) {
      issues.push('deepAnalysis');
    }
    if (clichePatterns.principle.test(model.principle || '')) {
      issues.push('principle');
    }
    if (clichePatterns.scope.test(model.scope || '')) {
      issues.push('scope');
    }
    if (clichePatterns.tips.test(model.tips || '')) {
      issues.push('tips');
    }
    if (clichePatterns.practice.test(model.practice || '')) {
      issues.push('practice');
    }
    
    if (issues.length > 0) {
      problemModels.push({ file, issues, name: model.name || model.label });
    }
  });
  
  console.log('套话模型统计：');
  console.log('总计：' + problemModels.length + ' 个模型需要优化\n');
  
  problemModels.forEach((m, i) => {
    console.log(`${i + 1}. ${m.file}: ${m.issues.join(', ')}`);
  });
  
  return problemModels;
}

checkModels();
