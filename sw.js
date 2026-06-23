const CACHE_NAME = "syokai-complete-offline-v1-20260623-01";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "https://sumida-passion.github.io/game-assets/images/basketleague.jpg",
  "https://sumida-passion.github.io/game-assets/images/demae.jpg",
  "https://sumida-passion.github.io/game-assets/images/dousisya.jpg",
  "https://sumida-passion.github.io/game-assets/images/ensoku.jpg",
  "https://sumida-passion.github.io/game-assets/images/gakuendai.jpg",
  "https://sumida-passion.github.io/game-assets/images/golf.jpg",
  "https://sumida-passion.github.io/game-assets/images/hpmain.jpg",
  "https://sumida-passion.github.io/game-assets/images/ichigo.jpg",
  "https://sumida-passion.github.io/game-assets/images/jouhou.png",
  "https://sumida-passion.github.io/game-assets/images/junkangoukaku.jpg",
  "https://sumida-passion.github.io/game-assets/images/kaibou.jpg",
  "https://sumida-passion.github.io/game-assets/images/kakinohazusi.jpg",
  "https://sumida-passion.github.io/game-assets/images/kanu.jpg",
  "https://sumida-passion.github.io/game-assets/images/kensyuryokou2.jpg",
  "https://sumida-passion.github.io/game-assets/images/kokusaikouryu2.jpg",
  "https://sumida-passion.github.io/game-assets/images/mac windows.png",
  "https://sumida-passion.github.io/game-assets/images/miso.jpg",
  "https://sumida-passion.github.io/game-assets/images/naramarathon.jpg",
  "https://sumida-passion.github.io/game-assets/images/nettyu.jpg",
  "https://sumida-passion.github.io/game-assets/images/osakataidai.jpg",
  "https://sumida-passion.github.io/game-assets/images/rounen.jpg",
  "https://sumida-passion.github.io/game-assets/images/science castle.jpg",
  "https://sumida-passion.github.io/game-assets/images/sdgs.jpg",
  "https://sumida-passion.github.io/game-assets/images/senkouka.jpg",
  "https://sumida-passion.github.io/game-assets/images/sinjokita.jpg",
  "https://sumida-passion.github.io/game-assets/images/snsboushi.jpg",
  "https://sumida-passion.github.io/game-assets/images/sukiryokou.jpg",
  "https://sumida-passion.github.io/game-assets/images/support01.png",
  "https://sumida-passion.github.io/game-assets/images/support02.png",
  "https://sumida-passion.github.io/game-assets/images/support03.png",
  "https://sumida-passion.github.io/game-assets/images/support04.png",
  "https://sumida-passion.github.io/game-assets/images/support05.jpg",
  "https://sumida-passion.github.io/game-assets/images/syokubunka.jpg",
  "https://sumida-passion.github.io/game-assets/images/takoage.jpg",
  "https://sumida-passion.github.io/game-assets/images/tankyu.jpg",
  "https://sumida-passion.github.io/game-assets/images/tuji.jpg",
  "https://sumida-passion.github.io/game-assets/images/volunteer.jpg",
  "https://sumida-passion.github.io/game-assets/images/youtien.jpg"
];

async function cacheOne(cache, url) {
  try {
    const request = new Request(url, { cache: 'reload', mode: url.startsWith('http') ? 'no-cors' : 'same-origin' });
    const response = await fetch(request);
    if (response && (response.ok || response.type === 'opaque')) {
      await cache.put(url, response);
    }
  } catch (e) {
    // 初回オンライン時に取得できなかった画像は、表示された時にfetch側で追加キャッシュします。
  }
}

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(CORE_ASSETS.map(url => cacheOne(cache, url)))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req).then(response => {
        const copy = response.clone();
        if (response && (response.ok || response.type === 'opaque')) {
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
        }
        return response;
      }).catch(() => {
        if (req.mode === 'navigate') return caches.match('./index.html');
        return new Response('', {status: 504, statusText: 'Offline asset not cached yet'});
      });
    })
  );
});
