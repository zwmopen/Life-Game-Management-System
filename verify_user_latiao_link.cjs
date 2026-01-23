// 验证用户提供的辣条图片链接
const https = require('https');

// 用户提供的新辣条图片链接
const userLatiaoLink = 'https://images.unsplash.com/photo-1564869521641-a52c75637e91?w=400&h=400&fit=crop';

console.log('验证用户提供的辣条图片链接...');
console.log('链接:', userLatiaoLink);

https.get(userLatiaoLink, (res) => {
  console.log('状态码:', res.statusCode);
  console.log('内容类型:', res.headers['content-type']);
  
  if (res.statusCode === 200 && res.headers['content-type'].startsWith('image/')) {
    console.log('✅ 用户提供的辣条图片链接有效！');
    console.log('\n链接已成功替换到项目中，您可以重启开发服务器查看效果。');
  } else {
    console.log('❌ 用户提供的辣条图片链接无效或不是图片！');
  }
}).on('error', (e) => {
  console.error('❌ 链接检查失败:', e.message);
});
