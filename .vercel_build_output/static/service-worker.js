const timestamp = 1633211365930;
const build = [
  "/_app/start-2da4f61a.js",
  "/_app/assets/start-61d1577b.css",
  "/_app/pages/__layout.svelte-5d49c956.js",
  "/_app/assets/pages/__layout.svelte-1fda6867.css",
  "/_app/error.svelte-76f44832.js",
  "/_app/pages/index.svelte-aca6ee15.js",
  "/_app/assets/pages/index.svelte-b6f83df6.css",
  "/_app/pages/about.svelte-21101fe9.js",
  "/_app/assets/pages/about.svelte-bf4528fa.css",
  "/_app/pages/todos/index.svelte-34cb7b1b.js",
  "/_app/assets/pages/todos/index.svelte-784042c1.css",
  "/_app/pages/user/__layout.svelte-01e28d6d.js",
  "/_app/pages/user/[user_id].svelte-16bdd862.js",
  "/_app/chunks/vendor-56c27031.js",
  "/_app/chunks/stores-d44e406a.js"
];
const files = [
  "/favicon.png",
  "/manifest.json",
  "/pwa-512x512.png",
  "/robots.txt",
  "/svelte-welcome.png",
  "/svelte-welcome.webp"
];
const worker = self;
const FILES = `cache${timestamp}`;
const to_cache = build.concat(files);
const staticAssets = new Set(to_cache);
worker.addEventListener("install", (event) => {
  event.waitUntil(caches.open(FILES).then((cache) => cache.addAll(to_cache)).then(() => {
    worker.skipWaiting();
  }));
});
worker.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then(async (keys) => {
    for (const key of keys) {
      if (key !== FILES)
        await caches.delete(key);
    }
    worker.clients.claim();
  }));
});
async function fetchAndCache(request) {
  const cache = await caches.open(`offline${timestamp}`);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    const response = await cache.match(request);
    if (response)
      return response;
    throw err;
  }
}
worker.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.headers.has("range"))
    return;
  const url = new URL(event.request.url);
  const isHttp = url.protocol.startsWith("http");
  const isDevServerRequest = url.hostname === self.location.hostname && url.port !== self.location.port;
  const isStaticAsset = url.host === self.location.host && staticAssets.has(url.pathname);
  const skipBecauseUncached = event.request.cache === "only-if-cached" && !isStaticAsset;
  if (isHttp && !isDevServerRequest && !skipBecauseUncached) {
    event.respondWith((async () => {
      const cachedAsset = isStaticAsset && await caches.match(event.request);
      return cachedAsset || fetchAndCache(event.request);
    })());
  }
});
