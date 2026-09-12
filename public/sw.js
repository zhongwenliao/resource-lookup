/**
 * PWA 演示 Service Worker（手写版，不依赖 workbox）
 *
 * 生命周期：install（预缓存）→ waiting（旧 SW 仍控制页面时等待）→ activate（清旧缓存 + 接管页面）
 * 演示用 skipWaiting + clients.claim 让新 SW 立即生效；生产环境应提示用户确认后再切换版本
 *
 * 缓存策略（按请求文件名路由，仅拦截 /pwa-demo/ 前缀，不影响页面其他请求）：
 * - cache-first.json    Cache First            缓存命中即返回，适合版本化静态资源
 * - network-first.json  Network First          网络优先，失败回退缓存，适合时效性数据
 * - swr.json            Stale-While-Revalidate 先回缓存保证速度，后台静默更新，下次生效
 *
 * 所有经 SW 的响应统一打 X-Served-By 头（sw-cache / sw-network），页面据此展示资源来源
 */
const CACHE_NAME = 'pwa-demo-v1';
const DEMO_PREFIX = '/pwa-demo/';

// 缓存 key 忽略 query（演示页会加时间戳防浏览器 HTTP 缓存干扰）
function cacheKey (request) {
  const url = new URL(request.url);
  return new Request(url.origin + url.pathname);
}

function putCache (request, response) {
  return caches.open(CACHE_NAME).then((cache) => cache.put(cacheKey(request), response));
}

/* ---------------- 三种缓存策略：统一返回 { response, source } ---------------- */

async function cacheFirst (request) {
  const cached = await caches.match(cacheKey(request));
  if (cached) return { response: cached, source: 'sw-cache' };
  const resp = await fetch(request);
  await putCache(request, resp.clone());
  return { response: resp, source: 'sw-network' };
}

async function networkFirst (request) {
  try {
    const resp = await fetch(request);
    await putCache(request, resp.clone());
    return { response: resp, source: 'sw-network' };
  } catch (err) {
    const cached = await caches.match(cacheKey(request));
    if (cached) return { response: cached, source: 'sw-cache-offline' };
    throw err;
  }
}

async function staleWhileRevalidate (request) {
  const cached = await caches.match(cacheKey(request));
  const network = fetch(request).then(async (resp) => {
    await putCache(request, resp.clone());
    return resp;
  });
  if (cached) return { response: cached, source: 'sw-cache' };
  const resp = await network;
  return { response: resp, source: 'sw-network' };
}

/* ---------------- 生命周期 ---------------- */

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll([
        DEMO_PREFIX + 'cache-first.json',
        DEMO_PREFIX + 'network-first.json',
        DEMO_PREFIX + 'swr.json'
      ]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ---------------- 请求拦截：按文件名路由策略 ---------------- */

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith(DEMO_PREFIX)) return;

  const file = url.pathname.replace(DEMO_PREFIX, '');
  let strategy = null;
  if (file.indexOf('cache-first') === 0) strategy = cacheFirst;
  if (file.indexOf('network-first') === 0) strategy = networkFirst;
  if (file.indexOf('swr') === 0) strategy = staleWhileRevalidate;
  if (!strategy) return;

  event.respondWith(
    strategy(event.request).then(({ response, source }) => {
      const headers = new Headers(response.headers);
      headers.set('X-Served-By', source);
      return new Response(response.body, { status: response.status, headers: headers });
    })
  );
});

/* ---------------- 页面消息与通知 ---------------- */

// 页面发消息清空演示缓存
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
  }
});

// 点击通知聚焦已打开的页面
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((list) => {
      if (list.length) return list[0].focus();
      return self.clients.openWindow('/');
    })
  );
});
