// 验证最终的辣条图片链接是否有效
const https = require('https');

// 最终的辣条图片链接
const finalUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop';

console.log('验证最终的辣条图片链接...');
console.log('链接:', finalUrl);

// 使用https模块检查链接
https.get(finalUrl, (res) => {
  console.log('状态码:', res.statusCode);
  console.log('返回类型:', res.headers['content-type']);
  
  if (res.statusCode === 200 && res.headers['content-type'].startsWith('image/')) {
    console.log('✅ 最终的辣条图片链接有效！');
  } else {
    console.log('❌ 最终的辣条图片链接无效或不是图片！');
  }
}).on('error', (e) => {
  console.error('❌ 链接检查失败:', e.message);
});
