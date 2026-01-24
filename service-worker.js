// 缓存名称
const CACHE_NAME = 'life-game-cache-v1';

// 基础路径 - 适应GitHub Pages部署
const BASE_PATH = '/Life-Game-Management-System/';

// 要缓存的资源
const urlsToCache = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.json'
];

// 安装阶段 - 缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // 跳过等待，直接激活
  self.skipWaiting();
});

// 激活阶段 - 清除旧缓存
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 立即接管所有客户端
  self.clients.claim();
});

// 网络请求拦截 - 缓存优先策略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中，直接返回
        if (response) {
          return response;
        }
        // 缓存未命中，发起网络请求
        return fetch(event.request).then(
          (response) => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // 克隆响应，因为响应流只能使用一次
            const responseToCache = response.clone();
            // 缓存新的响应
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      }
    )
  );
});

// 推送通知处理
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: BASE_PATH + 'vite.svg',
    badge: BASE_PATH + 'vite.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || BASE_PATH
    }
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 通知点击处理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});