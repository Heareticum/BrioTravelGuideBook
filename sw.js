// 每次更新網站內容時，記得把版本號改掉（v1 -> v2...），
// 否則使用者裝置上的舊快取不會更新。
const CACHE_NAME = 'okinawa-travel-book-v12';

// 注意：這裡用「相對路徑」而不是「/開頭的絕對路徑」，
// 這樣不管網站部署在 GitHub Pages 的根目錄還是子路徑（例如 /repo-name/）都能正常運作。
const PRECACHE_URLS = [
    'index.html',
    'flight.html',
    'car-rental-info.html',
    'schedule.html',
    'costDetails.html',
    'settlement-system.html',
    'settlement-system_before.html',
    'spotIntroduction.html',
    'qa.html',
    'offline.html',
    'manifest.json',
    'css/nav.css',
    'css/ios-install.css',
    'js/nav.js',
    'js/ios-install.js',
    'components/nav.html'
];

// 安裝階段：把網站核心檔案先快取起來
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_URLS);
        })
    );
    self.skipWaiting();
});

// 啟用階段：清除舊版本的快取
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// 攔截請求：
// 1. 頁面導航 (HTML)：優先嘗試連網抓最新版本，失敗才用快取，再失敗顯示離線頁
// 2. 其他資源 (CSS/JS/圖片)：優先用快取，沒有才連網抓
self.addEventListener('fetch', (event) => {
    const request = event.request;

    // 🔒 非GET請求例外（例如 Firestore 的新增/修改/刪除資料，底層是 POST/PUT/PATCH）：
    // 瀏覽器的 Cache API 規格上只支援快取 GET 請求，
    // 如果讓這些請求繼續往下跑，cache.put() 會直接拋出錯誤（Failed to execute 'put' on 'Cache'）。
    // 這裡直接放行，不攔截、不快取，讓瀏覽器用預設行為處理。
    if (request.method !== 'GET') {
        return;
    }

    // 🌤️ 天氣API例外：天氣資料每小時都在變，不適合被快取邏輯處理
    // （Cache First策略下，第一次抓到的天氣會被永久快取，使用者之後看到的都會是舊資料）
    // 這裡直接不呼叫 event.respondWith()，等於不攔截，瀏覽器會用預設行為直接連網抓，
    // 完全不經過上面的快取機制，也不會把回應存進快取。
    if (request.url.includes('api.open-meteo.com')) {
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // 順手更新快取，確保下次離線時也是較新的版本
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                    return response;
                })
                .catch(() => {
                    return caches.match(request).then((cached) => cached || caches.match('offline.html'));
                })
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                return response;
            });
        })
    );
});