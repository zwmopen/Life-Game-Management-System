// 验证更新后的图片链接是否能正常访问
import { get } from 'node:https';
import fs from 'node:fs';

// 需要验证的图片链接
const imageLinks = [
  'https://images.unsplash.com/photo-1611088108633-8284d4a30d92?w=400&h=400&fit=crop', // 辣条
  'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop', // 快乐水
  'https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?w=400&h=400&fit=crop', // 奶茶
  'https://images.unsplash.com/photo-1594032350836-638010700a5c?w=400&h=400&fit=crop', // 瑜伽垫
  'https://images.unsplash.com/photo-1612832795870-f2b91a56347e?w=400&h=400&fit=crop', // 临沂炒鸡
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop' // 跑步
];

// 验证单个图片链接
function checkImageLink(url) {
  return new Promise((resolve) => {
    get(url, (res) => {
      resolve({ url, status: res.statusCode, contentType: res.headers['content-type'] });
    }).on('error', (err) => {
      resolve({ url, status: 'error', error: err.message });
    });
  });
}

// 验证所有图片链接
async function checkAllImageLinks() {
  console.log('正在验证更新后的图片链接...');
  const results = [];
  
  for (const link of imageLinks) {
    const result = await checkImageLink(link);
    results.push(result);
    console.log(`${result.status === 200 ? '✅' : '❌'} ${link}`);
    console.log(`   状态: ${result.status}`);
    if (result.contentType) {
      console.log(`   内容类型: ${result.contentType}`);
    }
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
    console.log('');
  }
  
  // 输出结果到文件
  const output = results.map(r => `${r.status === 200 ? '✅' : '❌'} ${r.url} - ${r.status}${r.contentType ? ` (${r.contentType})` : ''}${r.error ? ` - ${r.error}` : ''}`).join('\n');
  fs.writeFileSync('updated_image_validation_results.txt', output);
  console.log('验证结果已保存到 updated_image_validation_results.txt');
}

checkAllImageLinks();
