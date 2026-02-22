/**
 * 彻底清理思维模型 visualDesign 字段中的危险CSS
 * 只保留：SVG图表
 * 删除：所有CSS样式（因为会影响全局）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 彻底清理 visualDesign，只保留 SVG
 * @param {string} visualDesign - 原始内容
 * @returns {string} - 只包含 SVG 的内容
 */
function cleanVisualDesign(visualDesign) {
  if (!visualDesign) return '';

  // 只提取 SVG 内容
  const svgMatch = visualDesign.match(/<svg[\s\S]*?<\/svg>/gi);
  const svgContent = svgMatch ? svgMatch.join('\n') : '';

  if (!svgContent) {
    return '';
  }

  // 不保留任何 CSS，只返回 SVG
  return `<div class="neu-card">\n${svgContent}\n</div>`;
}

/**
 * 检查 visualDesign 是否有问题
 * @param {string} visualDesign - visualDesign 内容
 * @returns {object} - 检查结果
 */
function checkVisualDesign(visualDesign) {
  const issues = [];
  
  if (!visualDesign) {
    return { hasIssues: false, issues: [] };
  }
  
  // 检查是否有 style 标签
  if (/<style[^>]*>/gi.test(visualDesign)) {
    issues.push('包含 style 标签');
  }
  
  // 检查全局选择器
  if (/:root\s*\{/gi.test(visualDesign)) {
    issues.push('包含 :root 全局变量');
  }
  if (/\*\s*\{/gi.test(visualDesign)) {
    issues.push('包含 * 全局选择器');
  }
  if (/\[data-theme/gi.test(visualDesign)) {
    issues.push('包含 data-theme 选择器');
  }
  
  // 检查标签选择器
  const tagSelectors = ['h1', 'h2', 'h3', 'p', 'ul', 'li', 'body', 'html', 'svg'];
  tagSelectors.forEach(tag => {
    const regex = new RegExp(`(^|[^.])${tag}\\s*\\{`, 'gi');
    if (regex.test(visualDesign)) {
      issues.push(`包含 ${tag} 标签选择器`);
    }
  });
  
  return {
    hasIssues: issues.length > 0,
    issues
  };
}

/**
 * 处理单个模型文件
 */
function processModel(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const model = JSON.parse(content);
    
    const originalVisualDesign = model.visualDesign || '';
    const hasSvg = originalVisualDesign.includes('<svg');
    const hasStyle = /<style[^>]*>/gi.test(originalVisualDesign);
    
    if (hasSvg && hasStyle) {
      // 有 SVG 和 style，需要清理 style
      const cleanedVisualDesign = cleanVisualDesign(originalVisualDesign);
      model.visualDesign = cleanedVisualDesign;
      fs.writeFileSync(filePath, JSON.stringify(model, null, 2), 'utf8');
      return { file: path.basename(filePath), status: 'cleaned', action: '删除CSS，保留SVG' };
    } else if (hasSvg && !hasStyle) {
      // 只有 SVG，没有 style，跳过
      return { file: path.basename(filePath), status: 'skipped', reason: '已清理' };
    } else if (!hasSvg) {
      // 没有 SVG，清空 visualDesign
      if (originalVisualDesign) {
        model.visualDesign = '';
        fs.writeFileSync(filePath, JSON.stringify(model, null, 2), 'utf8');
        return { file: path.basename(filePath), status: 'cleared', action: '无SVG，清空' };
      }
      return { file: path.basename(filePath), status: 'skipped', reason: '无内容' };
    }
    
    return { file: path.basename(filePath), status: 'skipped', reason: '未知' };
  } catch (error) {
    return { file: path.basename(filePath), status: 'error', error: error.message };
  }
}

/**
 * 批量处理模型文件
 */
function processBatch(modelsDir, batchSize = 10, startFrom = 0) {
  const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.json'));
  const batch = files.slice(startFrom, startFrom + batchSize);
  
  console.log(`\n处理批次: ${startFrom + 1} - ${Math.min(startFrom + batchSize, files.length)} / ${files.length}`);
  console.log('='.repeat(60));
  
  const results = { cleaned: [], cleared: [], skipped: [], errors: [] };
  
  batch.forEach(file => {
    const result = processModel(path.join(modelsDir, file));
    
    if (result.status === 'cleaned') {
      results.cleaned.push(result);
      console.log(`✓ 清理: ${result.file} (${result.action})`);
    } else if (result.status === 'cleared') {
      results.cleared.push(result);
      console.log(`✓ 清空: ${result.file} (${result.action})`);
    } else if (result.status === 'error') {
      results.errors.push(result);
      console.log(`✗ 错误: ${result.file} - ${result.error}`);
    } else {
      results.skipped.push(result);
    }
  });
  
  console.log('\n批次统计:');
  console.log(`  清理: ${results.cleaned.length}`);
  console.log(`  清空: ${results.cleared.length}`);
  console.log(`  跳过: ${results.skipped.length}`);
  console.log(`  错误: ${results.errors.length}`);
  
  return { processed: startFrom + batch.length, total: files.length, hasMore: startFrom + batch.length < files.length, results };
}

function main() {
  const modelsDir = path.join(__dirname, '..', 'data', 'thinking-models');
  const args = process.argv.slice(2);
  
  if (args.includes('--all')) {
    const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.json'));
    let startFrom = 0;
    while (startFrom < files.length) {
      processBatch(modelsDir, 50, startFrom);
      startFrom += 50;
    }
  } else if (args.includes('--check')) {
    console.log('检查模式：扫描有问题的模型...');
    const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.json'));
    let problemCount = 0;
    
    files.forEach(file => {
      const content = fs.readFileSync(path.join(modelsDir, file), 'utf8');
      const model = JSON.parse(content);
      const check = checkVisualDesign(model.visualDesign);
      
      if (check.hasIssues) {
        problemCount++;
        console.log(`⚠ ${file}: ${check.issues.join(', ')}`);
      }
    });
    
    console.log(`\n总计: ${problemCount} 个模型有问题`);
  } else if (args.includes('--test')) {
    console.log('测试模式：处理前2个文件');
    processBatch(modelsDir, 2, 0);
  } else {
    processBatch(modelsDir, 10, 0);
  }
}

main();
