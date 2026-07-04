/**
 * Magppie L&D Portal service worker — offline mode (gap analysis §3.2 item 6).
 * Strategy:
 *  - Static assets (images, _next/static): cache-first (immutable-ish).
 *  - Pages/API: network-first with cache fallback, so factory/installation
 *    staff on patchy connections still get the last-seen version.
 *  - Progress writes made offline are queued by the app in localStorage and
 *    re-synced on 'online' (see providers.tsx) — the SW only handles reads.
 */
const CACHE = 'magppie-ld-v1'
const PRECACHE = ['/', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  const isStatic =
    url.pathname.startsWith('/_next/static/') ||
    /\.(png|jpg|jpeg|svg|webp|woff2?)$/.test(url.pathname)

  if (isStatic) {
    // cache-first
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(request, copy))
            return res
          }),
      ),
    )
    return
  }

  // network-first with cache fallback for pages
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(request, copy))
        }
        return res
      })
      .catch(() => caches.match(request).then((hit) => hit || caches.match('/'))),
  )
})
