# Installable PWA with offline caching
> How **Quran.com frontend (github.com/quran/quran.com-frontend-next)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- quran.com is installable from the browser (manifest + service worker emitted by next-pwa into `public/`); after a first visit, repeat loads and offline navigation to previously seen pages work, with fonts/images/JS served from cache.
- Audio recitation deliberately does *not* work offline — that was an explicit engineering decision, not an oversight.
- In development the PWA layer is off entirely (`disable: !isProduction` in `next.config.js`), so devs never fight stale workers.

## 2. Architecture & key files
- `next.config.js` wraps the whole config with `withPWA({ dest: 'public', disable: !isProduction, mode: isProduction ? 'production' : 'development' })`, gated on `NEXT_PUBLIC_VERCEL_ENV`.
- `publicExcludes` stops Workbox precaching heavy static directories: `'!fonts/**/!(sura_names|Figtree)*'` (keep only sura_names and Figtree fonts precached) and `'!icons/**'`.
- All runtime caching rules live in `pwa-runtime-config.js`, exported as a Workbox `RuntimeCaching[]` array and imported by `next.config.js` as `runtimeCaching`. The file's header documents it is a copy of next-pwa's default `cache.js` with one change: the MP3 `CacheFirst` entry is commented out.

## 3. Data flow
- Precache: Workbox injects a revisioned manifest of build output (JS/CSS chunks, kept fonts) into the generated service worker at build time; everything else is runtime-cached on first request.
- Runtime strategies in `pwa-runtime-config.js`:
  - `fonts.gstatic.com` → CacheFirst, 365 days, 4 entries; `fonts.googleapis.com` stylesheets → StaleWhileRevalidate, 7 days.
  - Local font files (`eot|otf|ttc|ttf|woff|woff2`) → StaleWhileRevalidate 7 days.
  - Images (`jpg...svg|webp`) and `/​_next/image?url=...` → StaleWhileRevalidate, 24h, 64 entries.
  - `.mp4` → CacheFirst with `rangeRequests: true`; `.js`/`.css` → StaleWhileRevalidate 24h.
  - `/_next/data/.../*.json` (client-side navigation payloads) → StaleWhileRevalidate 24h; loose `.json|.xml|.csv` files → NetworkFirst.
  - Same-origin `/api/*` GET → NetworkFirst with `networkTimeoutSeconds: 10`, explicitly excluding `/api/auth/` (comment cites the Safari OAuth callback issue in shadowwalker/next-pwa#131).
  - Remaining same-origin navigations ("others") → NetworkFirst, 10s timeout; cross-origin → NetworkFirst, 1 hour, except anything ending in `.mp3`.

## 4. Storage & network
- Storage is entirely the browser Cache Storage API managed by Workbox, partitioned into named caches (`google-fonts-webfonts`, `static-image-assets`, `next-image`, `next-data`, `apis`, `others`, `cross-origin`, ...) each with LRU `maxEntries` + TTL expiration.
- App state is unrelated to this layer: redux-persist keeps reader settings/bookmarks in localStorage, so a cached shell plus persisted Redux gives a functional offline reading experience for already-fetched chapters only — verse content itself comes through the NetworkFirst API cache or the SWR'd `/_next/data` JSON.
- The 10-second `networkTimeoutSeconds` on API/navigation caches means slow networks silently fall back to last-known-good responses instead of erroring.

## 5. Why it is built this way ON THIS PLATFORM
- The Quran reader is read-mostly and SEO-driven; a service worker adds resilience and installability without any server changes, which is why the whole feature is two config files rather than custom code.
- MP3 caching is intentionally disabled: the file header quotes the real Firefox failure (`Failed to load https://download.quranicaudio.com/qdc/...mp3 ... A ServiceWorker intercepted the request and encountered an unexpected error`). Cached audio broke HTTP range requests the `<audio>` element relies on, so the cross-origin rule carves out `.mp3` while keeping the `rangeRequests: true` recipe only for `.mp4`.
- Precache is pruned (`publicExcludes`) because bundling every QCF mushaf font would bloat the install to tens of megabytes; fonts load lazily via the StaleWhileRevalidate rules instead.
- Auth callbacks are excluded so the custom JWT login flow (not next-auth) never gets a stale cached response.

## 6. Edge cases & offline behavior
- Offline: previously visited pages render from the "others"/`next-data` caches; unseen chapters fail gracefully to app-level error states; images and fonts pop in from cache when available.
- OAuth in Safari is protected by the `/api/auth/` exclusion; all other same-origin APIs are cacheable.
- Cross-origin responses expire after just 1 hour vs 24 hours for same-origin, limiting staleness of third-party resources like quranicaudio metadata.
- Within budget, no custom background-sync/offline-write queue was found — offline bookmarking etc. rides on redux-persist local state and later syncs via the account backend when connectivity returns.
