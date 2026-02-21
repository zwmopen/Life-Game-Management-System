import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_PATH = path.join(__dirname, '../components/thinkingModels.json');

try {
  const content = fs.readFileSync(MODELS_PATH, 'utf-8');
  const models = JSON.parse(content);
  console.log(`JSON有效！共 ${models.length} 个模型`);
} catch (error) {
  console.error('JSON解析错误:', error.message);
}
