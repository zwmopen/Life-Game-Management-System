// 使用fetch API来检查图片链接

// 当前使用的图片链接
const currentUrl = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop';

// 检查当前链接是否有效
console.log('检查当前辣条图片链接...');
fetch(currentUrl, { method: 'HEAD' })
  .then(res => {
    console.log('当前链接状态码:', res.status);
    console.log('当前链接返回类型:', res.headers.get('content-type'));
    
    // 构建新的辣条图片链接
    const newLatiaoUrl = 'https://source.unsplash.com/featured/400x400/?latiao,chinese-spicy-snack';
    console.log('\n推荐新的辣条图片链接:', newLatiaoUrl);
    
    // 检查新链接
    return fetch(newLatiaoUrl, { method: 'HEAD' });
  })
  .then(newRes => {
    console.log('新链接状态码:', newRes.status);
    console.log('新链接返回类型:', newRes.headers.get('content-type'));
    console.log('\n建议替换为新链接，因为当前链接可能不是辣条图片');
  })
  .catch(e => {
    console.error('链接检查失败:', e.message);
  });
