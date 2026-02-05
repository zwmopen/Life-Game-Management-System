// 简单的测试脚本来检查WebDAV配置和网络连接
import https from 'https';

console.log('Testing WebDAV configuration and network connection...');

// 测试坚果云服务器的网络连接
const testUrl = 'https://dav.jianguoyun.com';

console.log(`Testing connection to ${testUrl}...`);

const req = https.get(testUrl, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Status Message: ${res.statusMessage}`);
  console.log('Network connection test completed.');
  
  if (res.statusCode === 200) {
    console.log('✓ Network connection to WebDAV server is successful.');
  } else {
    console.log('✗ Network connection to WebDAV server returned non-200 status code.');
  }
});

req.on('error', (e) => {
  console.log('✗ Network connection test failed:');
  console.log(e.message);
  console.log('Possible reasons:');
  console.log('1. No internet connection');
  console.log('2. WebDAV server is down');
  console.log('3. Network firewall blocking the connection');
});

req.end();
