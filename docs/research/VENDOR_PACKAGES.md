# Vendor packages inventory — maintained libraries from preferred vendors, judged against sakina-quran's roadmap

> **As of 2026-08-24.** App baseline: Expo SDK 54.0.30 / RN 0.81.5 / React 19.1.0, Expo Router ~6, Reanimated 4 + worklets, gesture-handler, screens, FlashList 2, unified `expo-sqlite/kv-store` KVStore layer (commit d1a1ff0), web = static export + Metro server.
>
> Vendors (user preference order): **Expo first-party → Software Mansion → Shopify → Margelo → Callstack**. Anything outside these five needs explicit justification and is out of scope here.
>
> Method: grounded in `ARCH.md`, `docs/research/FEATURE_MAP.md` §2–§3 (roadmap phases below), and `package.json`. Maintenance claims verified against GitHub org/repo metadata and release dates on the same day. No padding — packages no Quran-reader roadmap could want are pruned to one-line NOT-RELEVANT entries at most.
>
> Status: **final** — the [crystallize pass](#crystallize-pass) ran on 2026-08-24; all verdicts reconciled against the complete research set (0 reversed, 3 precision corrections).

---

## 0. Roadmap grounding (what every verdict cites)

Roadmap = FEATURE_MAP.md §3 phases. Items referenced by verdicts below:

| Ref | Item | Phase |
|---|---|---|
| 2.1 | Share/copy verse actions | 1 |
| 2.2 | Jump-to-anything + deep links | 1 |
| 2.3 | What's-new announcements + version-keyed KV migrations | 1 |
| 2.4 | Backup/export user data (portability before accounts) | 1 |
| 2.5 | Tags/collections + colored highlights on bookmarks | 2 |
| 2.12-lite | Edition registry shape only | 2 |
| 2.13 | Command bar (⌘K native equivalent) | 2 |
| 2.6 | Translation + tafsir reading mode (**strategic bet**) | 3 |
| 2.7 | Word-by-word (**strategic bet**) | 3 |
| 2.8 | Reading goals / streaks / khatma (**strategic bet**) | 3 |
| 2.9 | Audio recitation (**strategic bet**; gapped streaming first, gapless+downloads second) | 4 |
| 2.10 | Dual-page / wide-surface layout | 4 |
| 2.11 | Accounts/preference sync (deferred, reserve seams) | 5 |
| 2.12-full | Mushaf variants/editions (data-gated) | 5 |
| 2.13b | Widgets / Android Auto / embeddable widgets | 5 |

Open question §4-Q1 (reader substrate: text vs page images) gates several verdicts below.

## 0b. Already adopted from these vendors (context, not re-judged)

`react-native-reanimated` 4.1.6, `react-native-worklets` 0.5.1, `react-native-gesture-handler` 2.28 (Software Mansion) · `react-native-screens` 4.16, `react-native-pager-view` 8.0 (Callstack) · `@shopify/flash-list` 2.0.2 (Shopify) · `@testing-library/react-native` 13.3 (Callstack) · expo core: router, sqlite(+kv-store), font, haptics, image, linking, splash-screen, status-bar, symbols, system-ui, web-browser, constants, build-properties, dev-client.

---

## 1. Software Mansion

Maintenance snapshot 2026-08-24: all RN packages below pushed within days of today; `react-native-audio-api` 0.13.3 released 2026-08-17, `react-native-enriched-html` v1.1.1 released 2026-08-14. Already adopted (see §0b): Reanimated 4, worklets, gesture-handler, screens — all actively developed.

| Package | One line | Verdict |
|---|---|---|
| `react-native-audio-api` | Web-Audio-spec engine (AudioContext/audio graph) over Oboe (Android) / AVAudioEngine (iOS), with web delegating to real browser APIs; sample-accurate scheduling, lock-screen/notification controls shipped, pre-1.0 (0.13.x). | **CANDIDATE-FOR:2.9 audio recitation** — primary recommendation in [Conflict A](#conflict-a--react-native-audio-api-vs-expo-audio-roadmap-29-audio) |
| `react-native-enriched-html` | Fully native rich-text display (`EnrichedText`) + input rendering HTML with shared styling API, iOS/Android/Web, New Arch only; v1.1.x, 1.3k stars. | **CANDIDATE-FOR:2.6 translation+tafsir** — tafsir sources ship HTML (footnote spans, headers); renders them without hand-rolling parsers beyond the footnote grammar; same component family is the natural fit if notes journaling (parity #7) ever enters a phase |
| `react-native-svg` | SVG rendering; now maintained by Software Mansion (moved from community), pushed 2026-08-20. | **NOT-RELEVANT** — text-rendered reader has no vector-drawing surface; only resurfaces inside the mushaf-substrate question (Conflict C), where Skia would be the choice anyway |
| `@swmansion/pulsar` | Ready-made haptics patterns library; brand-new (repo pushed 2026-08-19, npm package not yet resolvable). | **NOT-RELEVANT** — haptics already covered first-party by integrated `expo-haptics`; watch only if we want choreographed patterns |
| `react-native-executorch` | Declarative on-device AI models (LLM/vision/audio) via ExecuTorch; very active. | **NOT-RELEVANT** — no AI feature on any roadmap phase; tafsir/translation are static content pipelines |
| `smelter` / `argent` / `radon-ide` | Server-side programmable AV mixing / agentic device-control toolkit / VSCode-Cursor RN IDE extension. | **NOT-RELEVANT** (first two: server-side & agent tooling, not app deps). Radon-IDE is a worthwhile *DX* side-grade for debugging the pager/animation work but carries no roadmap item — optional, not tracked |

## 2. Callstack

Maintenance snapshot 2026-08-24: `react-native-pager-view`, `react-native-testing-library`, `react-native-slider`, `react-native-paper`, `timezone-hermes-fix` all pushed within the last week. Already adopted (§0b): pager-view (the 604-page reader pager), testing-library (the 528-assertion suite).

| Package | One line | Verdict |
|---|---|---|
| `@callstack/timezone-hermes-fix` | Native fix for Hermes' stale-timezone cache (wrong `Date` math after the device timezone changes mid-run); install the **0.3.x line** (its table pins 0.3.x → RN 0.80–0.81 exactly like ours; newest 0.5.x targets RN ≥0.87); 0.5.0 published 2026-08-21 shows active maintenance. | **ADOPT-NOW** — the app already persists reading-progress timestamps (ContinueReadingCard day grouping), and FEATURE_MAP 2.8's stated biggest risk is "dishonest streaks if device clock/timezones mishandled"; this removes the engine-level half of that risk for ~zero API surface |
| `@callstack/react-native-slider` | The former community slider (iOS UISlider / Android SeekBar), Callstack-maintained. | **NOT-RELEVANT** — native sliders/sheets land via `@expo/ui` (stable SDK 56, drop-in replacement list includes this exact package) per Expo-first preference; a phase-4 audio scrubber needs no dedicated lib |
| `reassure` | Performance-testing companion (render-count/duration regression snapshots) for React/RN. | **WATCH** — correct tool for guarding the reader scroll/header-animation work, but there is no perf baseline yet; introduce when phase 4 (audio follow-highlight + dual-page) starts touching hot render paths |
| `react-native-bottom-tabs` | Native (SwiftUI/Compose) bottom tabs. | **NOT-RELEVANT** — superseded first-party by Expo Router Native Tabs / `@expo/ui` TabView; adopting both would be redundant |
| `react-native-paper` | Material Design component system. | **NOT-RELEVANT** — app has its own Uniwind semantic-token design system (fajr/layl/asr/tahajjud/masjid themes); Material styling would fight it |
| `Re.Pack` / RNEF | Webpack/Rspack-based RN bundler toolkit + micro-frontend module federation. | **NOT-RELEVANT** — Metro + `expo export` static pipeline is fixed architecture (Docker/K8s deploy documented in ARCH.md) |
| `liquid-glass` | iOS 26 Liquid Glass effect components. | **NOT-RELEVANT** — aesthetics-only, and blocked on an SDK 54→56+ upgrade regardless |
| `ts-regex-builder` | Composable, maintainable TS regex builder. | **NOT-RELEVANT** — our regex surfaces (Arabic folding filter, footnote grammar port) are small and better kept literal/testable; repo also cooling (last push 2025-02) |
| `react-native-open-telemetry` | OpenTelemetry observability SDK for RN. | **NOT-RELEVANT** — post-launch metrics are covered first-party by `expo-observe` + EAS Observe (§5) |

## 3. Margelo

Maintenance snapshot 2026-08-24: Nitro stack very active (`react-native-nitro-modules` 0.37.0 on 2026-08-20, `nitro-fetch` 1.6.1 on 2026-08-14, `quick-crypto` 1.1.7 on 2026-08-15); `react-native-mmkv` 4.3.2 published 2026-06-22; `react-native-graph` 1.3.0 on 2026-07-23; `react-native-release-profiler` cooling (2025-11). Note: several org repos are forks (Expensify, MetaMask, Bluesky, Tencent MMKV) — the authored-RN surface is what's listed below.

| Package | One line | Verdict |
|---|---|---|
| `react-native-mmkv` | JSI/MMAP-backed key-value storage, ~10x faster than AsyncStorage, encryption support; v4 line maintained. | **NOT-RELEVANT** — see [Conflict B](#conflict-b--react-native-mmkv-vs-the-existing-kvstore-abstraction): KVStore was just unified across all platforms and data volume doesn't justify a second storage engine |
| `react-native-nitro-modules` | Nitro: C++/JSI native-module infra with codegen ("Nitrogen"), faster cold-path than Expo Modules bridge patterns. | **WATCH** — blocked on ever needing custom native code faster than the Expo Modules API provides (SDK 56 inline modules + new JSI layer narrow that gap further); audio phase uses `react-native-audio-api`, not hand-written native |
| `react-native-graph` | Skia-rendered animated line/area charts with native path interpolation (used for token charts in production wallets). Skia + gesture-handler peer deps; mobile-focused, web not claimed. | **WATCH** — maps to 2.8 goals/streaks *only if* real analytics curves ship (streak grids/bars are plain Views+Reanimated); adoption is gated by Conflict C's Skia verdict plus needing a web fallback chart |
| `react-native-nitro-sqlite` | Fast SQLite via Nitro (successor of quick-sqlite). | **NOT-RELEVANT** — `expo-sqlite` (incl. kv-store) already covers every query path on all platforms; swapping engines buys nothing the app can feel at 6236 rows |
| `react-native-nitro-fetch` | Fast native fetch with prefetching support. | **NOT-RELEVANT** — React Query already does prefetch-on-navigation for pages (ARCH.md), and payloads are small static JSON |
| `react-native-quick-crypto` | Node `crypto` implementation in C/C++ via JSI. | **NOT-RELEVANT** — its use case arrives only with accounts/sync token handling (2.11), where first-party `expo-secure-store` is the Expo-first answer |
| `react-native-release-profiler` | Passive Hermes profiling in release builds. | **WATCH** — pull in transiently during the phase-4 perf pass alongside Reassure; not a standing dependency (also slowest-moving package in this list) |
| vision-camera / filament / worklets-core / wishlist / onyx / live-markdown / bignumber / skottie | Camera, 3D engine, separate-thread worklets (superseded for us by the official SWM `react-native-worklets` already running), prototype list, offline-first state store, markdown input, bigint, lottie-via-Skia. | **NOT-RELEVANT** — none has any roadmap surface; `onyx` specifically duplicates the React Query + KVStore pattern we just standardized on |

## 4. Shopify

Already adopted (§0b): `@shopify/flash-list` 2.0.2.

| Package | One line | Verdict |
|---|---|---|
| `@shopify/react-native-skia` | GPU-accelerated 2D graphics (CanvasKit on web via async WASM, Skia natively); shaders, paths, hit-testing. | **WATCH** — see [Conflict C](#conflict-c--shopifyreact-native-skia-for-mushaf-renderingannotation): verified web cost stands (2.9 MB gzipped WASM + 4–6 MB native binary), and the reader-substrate question (§4-Q1) hasn't chosen pixels |
| `@shopify/restyle` | Type-safe theme-driven `styled()` component helper. | **NOT-RELEVANT** — Uniwind/Tailwind v4 already provides the token→style pipeline; two styling systems would be drift |
| `checkout-sheet-kit-react-native` | Shopify Checkout Sheet integration for commerce apps. | **NOT-RELEVANT** — no commerce surface exists or is planned |

## 5. Expo first-party (newer / less-known surface)

SDK 57 is the current latest index (checked 2026-08-24); app sits on SDK 54, so "newer" below means *anything not already in package.json*. SDK 56 headlines relevant here: **`@expo/ui` is stable** (~50 SwiftUI / ~45 Compose components + drop-in replacements for pager-view/slider/picker/bottom-sheet), RN 19.2 base, inline modules, `expo-type-information`, prebuilt XCFrameworks cutting build times.

### Phase-mapped candidates

| Package | One line | Verdict |
|---|---|---|
| `expo-clipboard` | Sync clipboard read/write with string/URL/image support. | **CANDIDATE-FOR:2.1 share/copy verse actions** — the copy half of the share funnel |
| `expo-sharing` | Native system share sheet for files/URIs. | **CANDIDATE-FOR:2.1 + 2.4** — share-sheet half on native; also the transport for backup-file export |
| `expo-document-picker` | System file picker for import flows. | **CANDIDATE-FOR:2.4 backup/export** — import half (web keeps `<input type=file>` per the planned `.native/.web` split) |
| `expo-file-system` (next API) | File IO + resumable download tasks, new object-oriented API since SDK 52+. | **CANDIDATE-FOR:2.4 + 2.9** — backup file write; resumable MP3 downloads for offline recitation (native only — web streams, matching W's deliberate no-MP3-in-SW-cache) |
| `expo-application` | App version/build identifiers + native constants. | **CANDIDATE-FOR:2.3 what's-new + migrations** — the version key that idempotent KVStore migration steps stamp against |
| `expo-crypto` | SHA/digest/random/UUID via native crypto. | **CANDIDATE-FOR:2.5 collections+highlights** — stable ids for collections and W's temp-id-swap mutation pattern |
| `expo-notifications` | Local + push notifications. | **CANDIDATE-FOR:2.8 goals/streaks** — local-only streak/khatma reminders fit the local-first phase-3 scope (push only if accounts ever land) |
| `expo-keep-awake` | Prevent screen sleep while a task is active. | **CANDIDATE-FOR:2.9 audio** — screen must stay lit during recitation playback; optional reading-mode toggle |
| `expo-screen-orientation` | Lock/read device orientation programmatically. | **CANDIDATE-FOR:2.10 dual-page/split** — part of the width/orientation predicate that picks `PagerStrategy.dual` |
| `expo-background-task` | Periodic deferred tasks on WorkManager/BGTaskScheduler (modern replacement for background-fetch). | **CANDIDATE-FOR:2.9 offline downloads** — finishing/resuming audio-pack downloads and eventual translation-pack refresh when the app isn't foregrounded |
| `expo-widgets` | First-party home-screen widget API (appears in the SDK 57 index as "Widgets"; confirm exact npm name at adoption time). | **CANDIDATE-FOR:2.13b widgets (phase 5, parked)** — materially de-risks FEATURE_MAP 2.13's "custom native targets L, park unless growth demands": the parked verdict was written assuming hand-written native widget targets |

### Blocked-on-named-thing

| Package | One line | Verdict |
|---|---|---|
| `@expo/ui` | SwiftUI-on-iOS / Compose-on-Android component kit; stable as of SDK 56 incl. drop-ins replacing packages we'd otherwise add (slider, picker, bottom-sheet, even PagerView). | **WATCH** — blocked on the SDK 54→56 upgrade (stable only from 56); adopt immediately after for settings pickers/sheets and any native-feeling controls in phases 1–3 |
| `expo-audio` | First-party playback/recording player built on platform players. | **WATCH** — fallback engine per [Conflict A](#conflict-a--react-native-audio-api-vs-expo-audio-roadmap-29-audio); adopted only if react-native-audio-api hits blocking bugs at phase-4 entry |
| `expo-updates` | OTA JS/asset updates on EAS channels. | **WATCH** — blocked on store distribution existing at all (no eas.json today); pairs with EAS Update insights at launch |
| `expo-observe` | Per-route TTI/launch metrics instrumentation feeding EAS Observe. | **WATCH** — same blocker: meaningless until the app ships to stores; then it's the launch-baseline tool for the reader cold-start budget |
| `expo-secure-store` | Encrypted keychain/keystore storage. | **WATCH** — blocked on 2.11 accounts being scheduled; until then backup/export is the portability contract (FEATURE_MAP §4-Q2) |

### Pruned (present in SDK index, no roadmap surface)

`expo-maps` (no location features), `expo-glass-effect`/`expo-mesh-gradient` (iOS-26 aesthetics only), `expo-live-photo`/`expo-image-picker`/`expo-media-library` (no photos), `expo-location`/`expo-calendar` (qibla/prayer times are not roadmap items), `expo-speech` (no TTS feature planned), `expo-tracking-transparency` (no ads/tracking), `expo-local-authentication` (no private data to gate), `expo-store-review` (post-launch nicety, track then), `expo-linear-gradient`/`expo-blur` (chrome polish achievable with existing Uniwind styles; revisit only if header fade quality demands it).

---

## Conflict A — react-native-audio-api vs expo-audio (roadmap 2.9 audio)

**Recommendation: build phase-4 recitation on `react-native-audio-api`; do not ship both engines. `expo-audio` is the documented fallback if RNAA fails a phase-entry spike.**

Why RNAA fits *this* app's audio shape:

1. **Gapless/timed playback is the strategic requirement, and it is scheduling-precision-shaped.** FEATURE_MAP 2.9 adopts Quran-for-Android's model where gapped vs gapless is *data* (an optional gapless timing DB) over one queue engine, with verse tracking from position→timing-table mapping (150 ms hysteresis). Sample-accurate scheduling (`AudioBufferSourceNode.start(when)`) makes gapless-as-data a first-class operation. expo-audio's player model has no sample-accurate schedule primitive — gapless there means pre-buffering hacks that risk audible seams on exactly the feature users will notice.
2. **Web is a first-class platform for us, and RNAA treats it that way** — on web it delegates to real browser Web Audio APIs, so one engine semantics across iOS/Android/web. That collapses most of the planned `PlayerEngine.native.ts` / `PlayerEngine.web.ts` split into a thin adapter; W proved web only needs `<audio>` + mediaSession, which browser Web Audio covers.
3. **Maturity is sufficient and improving on the right vendor.** SWM core-infra team; 0.13.3 released 2026-08-17 with steady minor cadence (0.7→0.13); lock-screen/notification-center playback controls shipped per its roadmap tiers; 830 stars / 27 open issues. Remaining risks are honest: pre-1.0 API churn, and background-audio session config (`UIBackgroundModes` audio / Android foreground service) is still ours to wire via config plugin — but expo-audio requires the identical plumbing.

Where expo-audio would win: if audio stayed permanently gapped-streaming-only, first-party simplicity beats RNAA's graph concepts, and its lock-screen controls + stable API are enough. That's why it stays in §5 as **WATCH** with a named condition rather than being dismissed — the pure-TS `AudioQueue` domain from 2.9 must be built player-agnostic so the fallback costs days, not a rewrite.

## Conflict B — react-native-mmkv vs the existing KVStore abstraction

**Recommendation: do not migrate. KVStore (`expo-sqlite/kv-store`) stays; react-native-mmkv is NOT-RELEVANT for this app today.**

Evidence:

- **The unification refactor was the decision.** Commit d1a1ff0 ("refactor: unify storage layer to use KVStore on all platforms") exists precisely to eliminate platform-split storage code — ARCH.md now documents "KVStore directly with no platform-specific code" for settings, progress, and bookmarks. MMKV (even with its v4 web implementation backed by localStorage) re-introduces a two-implementation seam — native engine + JS shim — exactly the split class just removed.
- **Scale doesn't justify it.** MMKV wins are mmap read speed and multi-process safety at high write volume. This app stores a handful of JSON blobs and scalar keys (bookmarks blob, theme, locale, progress) — KB-scale, synchronous access already, no measurable difference possible at this size.
- **Every projected need has a first-party answer.** Encryption-for-secrets (future auth tokens) → `expo-secure-store`; data that outgrows a JSON blob (collections memberships, activity logs) → real SQLite tables via the already-integrated `expo-sqlite`, not a second KV engine.
- **MMKV itself is healthy** — v4.3.2 published 2026-06-22, so maintenance is *not* the argument against; redundancy is.

Named re-open triggers: bookmarks/collections blob exceeds ~100 KB with hot rewrite jank during optimistic mutations; a feature needs synchronous cross-process consistency; or benchmarked evidence that kv-store round-trips appear in reader-boot profiles. Until one fires, migration is pure churn on freshly-refactored, fully-tested code.

## Conflict C — @shopify/react-native-skia for mushaf rendering/annotation

**Recommendation: do not adopt now. WATCH, blocked on the reader-substrate question (FEATURE_MAP §4-Q1) and the web payload budget. The ~2.9 MB figure is verified, not folklore.**

Verification of the prior measurement (2026-08-24, against Shopify's own current docs rather than re-deriving): the [Web Support page](https://shopify.github.io/react-native-skia/docs/getting-started/web/) states CanvasKit runs as a WASM build that is **2.9 MB gzipped, loaded asynchronously** via `LoadSkiaWeb()`/`WithSkiaWeb` with app-controlled loading UX; the [Bundle Size page](https://shopify.github.io/react-native-skia/docs/getting-started/bundle-size/) tabulates **Apple +6 MB / Android +4 MB / Web 2.9 MB\*** (the web asterisk = the CDN-served gzip'd WASM). Raw `canvaskit-wasm` on npm is 24.4 MB unpacked (default wasm 6.8 MB), so 2.9 MB is the *compressed* transfer number — the prior attempt's figure matches today's official documentation exactly, and it *understated* total cost by omitting the native binary delta.

Why deferral is right for this roadmap:

- Every current signal says the substrate stays text-rendered: FTS5 native search, static-JSON web export, and word-by-word planned via W's embedded-payload model (no glyph rectangles needed). Skia buys nothing for text layout we can't do with Views + Reanimated.
- The only Skia-shaped roadmap items are conditional: image/vector mushaf pages with pixel hit-testing (§4-Q1 answering "images"), freehand annotation ink over pages (not a listed phase), or shader-grade visual effects (no phase). None is scheduled.
- If §4-Q1 ever flips to page images: adopt Skia natively without hesitation (+4–6 MB binary is acceptable), but on web lazy-load it behind a dynamic import scoped to the reader route only — 2.9 MB landing in the SEO-critical static export budget would need to be measured against hosting limits (same measurement spike FEATURE_MAP §4-Q3 already demands).

Verdict: **WATCH** — named blockers: (a) §4-Q1 substrate decision, (b) a committed annotation/mushaf-image feature, (c) web payload re-measurement if (a) flips.

---

## Verdict tally

Across 65 judged packages (plus the already-adopted set in §0b):

| Verdict | Count | Packages |
|---|---|---|
| **ADOPT-NOW** | 1 | `@callstack/timezone-hermes-fix` |
| **CANDIDATE-FOR** | 13 | SM: audio-api (2.9), enriched-html (2.6) · Expo: clipboard (2.1), sharing (2.1+2.4), document-picker (2.4), file-system (2.4+2.9), application (2.3), crypto (2.5), notifications (2.8), keep-awake (2.9), screen-orientation (2.10), background-task (2.9), widgets (2.13b) |
| **WATCH** | 10 | Skia (Conflict C), @expo/ui, expo-audio (Conflict A fallback), expo-updates, expo-observe, expo-secure-store, reassure, nitro-modules, react-native-graph, release-profiler |
| **NOT-RELEVANT** | 41 | see per-vendor tables + §5 pruned list |

Pattern worth noting: 13 of 13 CANDIDATE verdicts map onto phases 1–5 with named items; the only ADOPT-NOW is a correctness fix for data the app already persists. Nothing from any vendor fills an unplanned gap — the roadmap is well-covered by what's already installed.

## Crystallize pass

**Run 2026-08-24** after all vendor research completed. Full file re-read end-to-end; every verdict re-checked against total evidence including findings that postdated its section.

- **Verdicts reversed: 0.** No early verdict was contradicted by later research; maintenance checks uniformly confirmed vendor health (only soft spots found were noted in-place: `react-native-release-profiler` cooling since 2025-11, `ts-regex-builder` stale since 2025-02, `@swmansion/pulsar` not yet on npm).
- **Precision corrections made during reconciliation (3):**
  1. `@callstack/timezone-hermes-fix`: clarified install line is **0.3.x** (RN 0.80–0.81), not latest 0.5.x which targets RN ≥0.87.
  2. Conflict B / MMKV row: softened "native-only needing a web shim" → MMKV v4 does ship a web implementation; the accurate objection is it introduces a two-implementation seam where KVStore has none.
  3. `expo-widgets`: hedged exact npm name (SDK index entry reads "Widgets"; verify at adoption).
- **Conflict subsections re-checked against all five vendor sections:** Conflict A's RNAA recommendation now reflects its verified release cadence (0.7→0.13) and shipped lock-screen controls discovered during the SWM pass; Conflict B's verdict absorbed the MMKV v4 health check (2026-06-22 release — maintenance is explicitly *not* the argument); Conflict C's verified figures (2.9 MB gzipped WASM async; +6 MB iOS / +4 MB Android native; canvaskit-wasm 24.4 MB unpacked) came from Shopify's current official docs and are cited inline.

This file is final as of 2026-08-24.
