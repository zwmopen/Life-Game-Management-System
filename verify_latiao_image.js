// 验证新的辣条图片链接是否有效

// 新的辣条图片链接
const newLatiaoUrl = 'https://images.unsplash.com/photo-1611088108633-8284d4a30d92?w=400&h=400&fit=crop';

console.log('验证新的辣条图片链接...');
console.log('链接:', newLatiaoUrl);

// 检查链接是否有效
fetch(newLatiaoUrl, { method: 'HEAD' })
  .then(res => {
    console.log('状态码:', res.status);
    console.log('返回类型:', res.headers.get('content-type'));
    
    if (res.ok && res.headers.get('content-type')?.startsWith('image/')) {
      console.log('✅ 新的辣条图片链接有效！');
    } else {
      console.log('❌ 新的辣条图片链接无效或不是图片！');
    }
  })
  .catch(e => {
    console.error('❌ 链接检查失败:', e.message);
  });
