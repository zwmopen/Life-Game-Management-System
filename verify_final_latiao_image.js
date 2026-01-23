// 验证最终的辣条图片链接是否有效

// 最终的辣条图片链接
const finalLatiaoUrl = 'https://source.unsplash.com/featured/400x400/?chinese-snack,spicy,food';

console.log('验证最终的辣条图片链接...');
console.log('链接:', finalLatiaoUrl);

// 检查链接是否有效
fetch(finalLatiaoUrl, { method: 'HEAD' })
  .then(res => {
    console.log('状态码:', res.status);
    console.log('返回类型:', res.headers.get('content-type'));
    
    if (res.ok && res.headers.get('content-type')?.startsWith('image/')) {
      console.log('✅ 最终的辣条图片链接有效！');
    } else {
      console.log('❌ 最终的辣条图片链接无效或不是图片！');
    }
  })
  .catch(e => {
    console.error('❌ 链接检查失败:', e.message);
  });
