# Feature Map: 3 open-source Quran apps → sakina-quran roadmap

> Cross-repo synthesis over the three research sets in this directory:
> - **A** = `docs/research/quran_android/` (Quran for Android, index.md + 20 feature docs)
> - **i** = `docs/research/quran_ios/` (Quran for iOS, index.md + 17 feature docs)
> - **W** = `docs/research/quran_com_frontend_next/` (quran.com frontend, index.md + 24 feature docs)
>
> Every recommendation below cites which repo/doc it is drawn from. Written 2026-08-23 against the sakina-quran tree (`src/app/(tabs)/ index|search|bookmarks|settings`, `src/app/pages/[number]`, `src/features/{quran-reader,search,bookmarks,settings}`, `src/entities/{quran,reading-progress}`).

---

## 1. Parity matrix

Status legend: **full** / **partial** / **absent** / **n-a** (platform makes it moot). Last column = sakina-quran today.

| # | Unified feature area | Android | iOS | Web | sakina-quran |
|---|---|---|---|---|---|
| 1 | Mushaf page reading | **full** — image pager, glyph-rect hit-testing, ayah toolbar, immersive chrome [A: mushaf-page-reading] | **full** — UIPageViewController over page images + word-frame overlay rects [i: mushaf-image-reading] | **full (different substrate)** — continuous-scroll reader over text/QCF webfonts, every slice (surah/juz/page/range) its own route [W: quran-reader] | **full** — pager + animated headers, own data substrate |
| 2 | Translation reading mode | **full** — alternate page type, multi-translation rows, inline footnote expansion [A: translation-reading-mode] | **full** — segmented toggle rebuilds pager, long-text chunking [i: translation-reading-mode] | **full** — TranslationView verse cards, multi-select active translations [W: translations-tafsir] | **absent** |
| 3 | Tafsir | **full** — tafsir = downloadable translation DBs + expandable spans + cross-refs [A: translations-tafsir] | **partial** — rides translation packs; no dedicated tafsir surface [i: index §4] | **full** — dedicated tafsir routes + per-ayah knowledge layers (qiraat, related verses, hadith) [W: verse-content-layers] | **absent** |
| 4 | Audio recitation | **full** — foreground service, gapped/gapless-as-data, repeats, follow-highlight [A: audio-recitation] | **full** — pre-built queue, repetition primitives in player engine, exactly-5 remote commands [i: audio-recitation] | **full** — one `<audio>` element + ~1150-line XState machine, repeat modal, radio stations [W: audio-recitation, quran-radio] | **absent** |
| 5 | Search | **full** — FTS/LIKE per downloaded DB + Kotlin-side Arabic folding + OS search provider [A: search] | **partial** — composite searcher gates expensive translation scans behind cheap Arabic misses [i: search] | **full** — search + voice + history + Cmd-K command bar [W: search-discovery] | **full** — structural+text search, FTS5 native, sql.js server for web; no voice/command-bar/history |
| 6 | Bookmarks, tags/collections | **full** — ayah bookmarks as collection memberships + singular movable reading bookmark [A: bookmarks-tags, reading-bookmarks-collections] | **full\*** — collections/highlights only under `#if QURAN_SYNC`; flat fallback otherwise [i: bookmarks-collections-highlights] | **full** — guest local maps + server CRUD collections with temp-id swapping [W: bookmarks-collections] | **partial** — flat optimistic KV bookmarks; no tags/collections/highlight colors |
| 7 | Notes / highlights journaling | **partial** — highlight pipeline has a NOTE type but no notes UI in scope [A: bookmarks-tags §2] | **full** — one CoreData entity models notes AND color highlights; index-exact rollback on delete [i: notes-journaling] | **full** — server-owned notes; private journaling vs public publishing split by one flag [W: notes-reflections] | **absent** |
| 8 | Word-by-word | **partial** — word-level glyph targets exist for recitation taps, no learner UI [A: mushaf-page-reading §2] | **full** — pointer+lens popover hit-testing scaled rects from geometry db [i: word-by-word-popover] | **full** — inline/tooltip WBW, locale baked into verse payload (zero extra requests) [W: word-by-word] | **absent** |
| 9 | Index navigation (sura/juz + jump dialog) | **full** — 3 index tabs, jump dialog (no juz field!), launcher shortcuts, `quran://` links [A: index-sura-juz-lists, quick-navigation-jump] | **full** — sortable sura list + juz→quarter tree, ±1 sign-multiplier comparator [i: sura-juz-index-navigation] | **full** — server-rendered 114-surah index + sidebar jumping [W: browse-navigation-index] | **partial** — SurahList/JuzList components exist; no jump-to-anything dialog, weak deep-link surface |
| 10 | Resume / recent pages | **full** — three-layer batching pipeline (tracker flow → span merge → mutexed persist) [A: quick-navigation-jump §3] | **full** — capped-at-3 CoreData history, bufferingNewest(1)+generation-counter writes, undo toasts [i: continue-reading-last-pages] | **partial** — last-read verse via `useSyncReadingProgress`, single validated guest bookmark [W: quran-reader, bookmarks-collections] | **partial** — ContinueReadingCard + basic reading-progress entity |
| 11 | Reading goals / streaks / calendar programs | **absent** [A: index §4] | **absent** — explicitly verified nowhere in repo [i: index §5] | **full** — goals/streaks keyed by mushafId, activity flush merging contiguous ranges, Quranic calendar, Ramadan programs [W: reading-goals-streaks, quranic-calendar, ramadan-seasonal-programs] | **absent** (raw progress only) |
| 12 | Download/content manager | **full** — foreground service, 3 download strategies, Range resume, repair workers [A: downloads-manager, first-run-setup-missing-pages] | **full** — persisted BatchDownloader survives process death; path-based identity [i: downloads-manager] | **partial** — audio download button only; PWA runtime caching deliberately excludes MP3 [W: downloads-manager analog via pwa-offline-cache] | **n-a** — content is bundled/static; only needed once audio/translations arrive |
| 13 | Mushaf variants / editions | **partial** — `Map<String,PageProvider>` multibinding seam; OSS ships madani only [A: mushaf-variants-page-types] | **full** — 7 editions as pure data; editions are asset swaps, one set kept on disk [i: mushaf-edition-selector] | **partial** — QCF font/mushaf-lines choice re-keys every request [W: reading-modes-fonts-settings] | **absent** — single 604-page madani dataset |
| 14 | Dual-page / tablet layout | **full** — TabletFragment spreads, foldable-aware book-side math `(page + skip) % 2 == 1` [A: dual-page-split-mode] | **full** — `.doublePage` PagingStrategy when width allows [i: mushaf-image-reading §2] | **n-a** — responsive continuous scroll replaces the metaphor [W: quran-reader] | **absent** |
| 15 | Themes / dark mode / appearance | **full** — chrome theming + draw-time ColorMatrix inversion of page bitmaps [A: night-mode-themes] | **full** — ThemeService light/dark/auto + per-control more-menu [i: reading-appearance-controls] | **full** — `body[data-theme]`, sync-before-render flash prevention [W: themes-dark-mode] | **full** — fajr/layl/asr/tahajjud/masjid semantic themes |
| 16 | i18n / RTL | **partial** — per-app language switching replaced locale pref [A: display-accessibility-settings] | **full** — localization package shared with the Android app [i: continue-reading-last-pages §5] | **full** — 18+ locales incl. RTL [W: index §1] | **full** — Lingui en/ar catalogs |
| 17 | Share / copy verses | **full** — copy/share/link funnel through two injected helpers, citation conventions encoded [A: share-copy-verses] | **full** — bidi-wrapped Arabic via system share sheet; copy shares identical path [i: share-verses] | **full** — copy reads selected translations straight from Redux so output matches screen; embed builder [W: verse-share-copy-tools, embeddable-widgets] | **absent** |
| 18 | Accounts / cloud sync | **full** — thin adapter over KMP mobile-sync, OIDC, kill-switch by config [A: cloud-sync-quran-account] | **full** — KMP MobileSync behind `AuthenticationClient`, every touchpoint `#if QURAN_SYNC`-gated [i: quran-com-cloud-sync] | **full** — JWT + `usePersistPreferenceGroup` as the universal sync chokepoint [W: account-preference-sync] | **absent** |
| 19 | Backup import / export | **full** — version-tolerant Moshi JSON, merge-only importer [A: bookmark-backup-import-export] | **partial** — diagnostics zip (UserDefaults JSON + SQLite copies), not user-facing backup [i: settings-support-hub] | **absent** [W: index §4] | **absent** |
| 20 | Home-screen widgets / extensions | **full** — push-updated bookmarks widget + search strip + Android Auto [A: home-screen-widgets, android-auto-audio] | **absent** — no WidgetKit/Siri/share extension verified [i: index §5] | **partial** — embeddable ayah widget iframe builder [W: embeddable-widgets] | **absent** |
| 21 | What's-new / upgrade migration | **partial** — data-upgrade workers + translation-upgrade dialog [A: first-run-setup-missing-pages, translations-tafsir] | **full** — bundled plist announcements + version-keyed idempotent AppMigrator [i: whats-new-announcements, app-upgrade-migration] | **partial** — changelog via CMS [W: index §1] | **absent** |
| 22 | Offline story | **full** — everything local after first-run downloads [A: index §1] | **full** — offline after setup downloads [i: mushaf-image-reading §6] | **partial** — service worker replays visited pages; "no pre-packaged offline mushaf" [W: pwa-offline-cache] | **full** — bundled SQLite native + static JSON web export |

---

## 2. Per-feature recommendations for sakina-quran

### 2.1 Share / copy verse actions — **S**
- **Current:** absent. Reader and search results have no per-verse action surface yet.
- **Primary reference: W (`verse-share-copy-tools`).** Copy must read *the translations currently rendered* rather than a fixed default, so copied output always matches the screen; menu items are thin dispatchers into one action surface. Complements i (`share-verses`) for the native side: bidi-wrapped Arabic, copy and share share one composition path. Citation formatting conventions come from A (`share-copy-verses`).
- **Expo mapping:** domain function `composeVerseText(range, options) -> {plain, citation}` in `features/verses/domain` (pure, shared). Native: `expo-sharing` + `Clipboard`; web: `navigator.clipboard` + Web Share API. Divergence point: share sheet is native-only; web falls back to copy + social intent URLs. No `.native.ts` split needed beyond a thin `ShareService.native.ts` / `ShareService.web.ts`.
- **Risk:** Arabic bidi handling when mixing Arabic + translation text (i documents getting this wrong silently).

### 2.2 Jump-to-anything + deep links — **S/M**
- **Current:** SurahList/JuzList exist on home; no go-to dialog, no `quran://`-style inbound links beyond `pages/[number]`.
- **Primary reference: A (`quick-navigation-jump`).** Adopt the `JumpDestination` seam: one interface (`jumpTo(page)`, `jumpToAndHighlight(page, sura, ayah)`) consumed by dialog, index lists, shortcuts, and links alike. Steal the input-coercion rules (clamp page/ayah, unmatched text → al-Fatiha, accept western digits under Arabic-Indic locales) and the tashkeel/hamza-folding filter from `SearchTextUtil`. Note A's own discrepancy: the jump dialog deliberately has *no juz field* — juz lives in the index tab; don't invent one. W adds the web-native truth: on web the URL *is* the jump primitive, so make `/pages/[number]#ayah-N` canonical and let native deep links resolve through `expo-linking` to the same route.
- **Expo mapping:** `features/navigation/app/jumpTo.ts` calls `router.navigate` — identical on web. Inbound links: `expo-linking` + `+html`/host config; web needs no trampoline (A only has trampoline activities because of its download gate — we have no such gate).
- **Risk:** highlight-on-arrival state passing across route boundaries (A passes extras; we need query params or React Query seed keys).

### 2.3 What's-new announcements + version-keyed migrations — **S**
- **Primary reference: i (`whats-new-announcements`, `app-upgrade-migration`).** Ship announcements as a bundled typed constant (their plist decoded with `try!` is flagged as a warning — we can decode safely in TS); flatten all missed versions into one sheet via numeric filtering; commit seen-state when the detail opens (their philosophy) or on dismiss — pick one and document it. Migrations: register idempotent steps keyed by app/KVStore schema version, stamp the version only after the whole batch succeeds.
- **Expo mapping:** pure TS in `src/shared/migrations/`; seen-state in KVStore. Works identically on web. Zero divergence.
- **Risk:** none technical; the risk is skipping this and later needing ad-hoc KVStore repairs (both A and i grew migration machinery late).

### 2.4 Backup / export user data — **S/M**
- **Current:** all user data is a handful of KVStore blobs — trivially exportable today, and unrecoverable today.
- **Primary reference: A (`bookmark-backup-import-export`).** Version-tolerant JSON envelope with epoch-seconds/millis auto-detection and merge-only import (never delete-on-import) is exactly right for a KVStore world; A's normalizer step (`convergeCommonlyTagged`) shows why import needs its own domain pass.
- **Expo mapping:** `features/backup/{domain,data,app}`; export builds a JSON blob, native shares via `expo-sharing` / `expo-file-system`; web triggers a Blob download. Import: native file picker via `expo-document-picker`; web `<input type=file>` — classic `.native.ts` split at `BackupTransport.native.ts|.web.ts`. Because sakina has no accounts yet, backup/export *is* the portability story — do it before sync.
- **Risk:** import validation (A funnels imports through a strict importer, not the live DAOs — mirror that with a domain-level validator before any KVStore write).

### 2.5 Tags/collections + colored highlights on bookmarks — **M**
- **Current:** flat optimistic KV bookmarks with snapshot rollback.
- **Primary reference: A (`bookmarks-tags`, `reading-bookmarks-collections`) for the model, W (`bookmarks-collections`) for the mutation UX.** Model decision worth copying verbatim: a tag is a collection membership; deleting a tag header untags members (they resurface under "Not tagged"); the reading bookmark stays *singular* with a "keep in at least one place" invariant enforced by a 3 s warning banner, not an error toast. From W: temp-id swapping for mid-flow collection creation ('temp-'+timestamp ids swapped atomically after server confirm) maps directly onto optimistic React Query mutations even without a server. From i (`continue-reading-last-pages`): undo handlers must re-validate current bookmark identity before applying, so stale toasts can't clobber newer edits.
- **Expo mapping:** extend the bookmarks KVStore blob to `{collections: [], memberships: {...}, readingBookmark}` — still one blob, still optimistic mutations with rollback. Pure TS domain invariants (single reading bookmark, duplicate-name rejection done twice: UI + domain, as A does).
- **Risk:** KVStore blob size/merge complexity grows; mitigate by versioning the blob shape now (see 2.3).

### 2.6 Translation + tafsir reading mode — **L (strategic bet #1)**
- **Current:** absent; reader is page-mode only.
- **Primary reference: A (`translation-reading-mode`) for rendering semantics, W (`translations-tafsir`, `verse-content-layers`) for data modeling.** From A: verse blocks composed of typed rows (basmalah row except suras 1/9, verse-number badge, optional Arabic-above-translation, translator row when >1 active); `[[footnote]]` ranges folded in descending order; truncated tafseer with in-place expansion; per-translation failure tolerated (one bad source must never blank the page — pad missing ayat, cf. ibn Kathir gaps); empty active-selection silently falls back to all installed translations. From W: store only ID arrays for selected translations with a recomputed `isUsingDefault` flag (derive, don't store).
- **Expo mapping:** new `features/translations` slice. Data: generate per-translation static JSON chunks into `/api/static/*` at build time (matches existing `generate:static` pipeline; React Query `staleTime: Infinity` fits perfectly — W's whole SSR-seeds-cache trick is what our static export gives us for free). Tafsir initially = another translation-class resource (A's model) rather than W's separate route family. Divergence: native *could* hold translations in SQLite, but static JSON keeps one code path — only introduce `TranslationRepository.native.ts` if bundle-size math forces it. Footnote parser is a direct TS port of A's `TranslationUtil` regex grammar, gated by a `minimumVersion` field in our static manifests (A's schema negotiation).
- **Difficulty rationale:** virtualized mixed-content rows + expansion state + selection reuse across two page substrates.
- **Biggest risk:** selection/toolbar interaction parity between page mode and translation mode — A solved it with one tracker contract answering identical queries in both modes; plan that seam first.

### 2.7 Word-by-word — **M**
- **Current:** absent.
- **Primary reference: W (`word-by-word`).** Because sakina renders text (not scanned images), the web approach is the fit: word data arrives *embedded in the verse payload*, keyed per locale, so toggling WBW costs zero extra requests; display mode (INLINE/TOOLTIP membership) is *derived* from which content checkboxes are on, making impossible states unrepresentable. i's pointer-lens popover (`word-by-word-popover`) is only relevant if/when we ship image-based pages — keep it noted for that future.
- **Expo mapping:** extend the static generator to emit word arrays per ayah per supported locale; UI toggle in settings writing a KVStore preference; tap-to-play hooks reserved for audio (2.9). No `.native.ts` split — same payload everywhere.
- **Risk:** static-export size multiplication (locales × 6236 ayat); cap initial locales and lazy-load per-surah chunks.

### 2.8 Reading goals / streaks / khatma — **M (strategic bet #2)**
- **Current:** basic progress entity exists; no goals/streak UI.
- **Primary reference: W (`reading-goals-streaks`).** Copy the shape, invert the storage: W queues visible verse keys while the tab is focused, flushes merged contiguous ranges on an interval, and derives streak display client-side from per-day activity. Locally: append activity days to a KVStore log (pages/ranges/seconds — note W has no distinct "verses" unit; keep units to PAGES/RANGE/SECONDS), derive streaks with a pure domain function, show cards on home + end-of-surah (W's `StreakGoalCard` placement). Goal wizard = one route with steps, redirect-to-progress when a goal exists.
- **Expo mapping:** `features/goals` slice + `entities/reading-progress` extension. Fully local ⇒ identical on web. Design the activity-day record so a future sync (2.11) can upload it unchanged — W keyed records by `mushafId` precisely so layouts can change; store `(mushafId, date, ranges[], seconds)` from day one.
- **Risk:** dishonest streaks if device clock/timezones mishandled — pin day boundaries to an explicit timezone rule and test around DST.

### 2.9 Audio recitation — **L (strategic bet #3)**
- **Current:** absent.
- **Primary reference: split.** Data model from A (`audio-recitation`): gapped vs gapless is *data, not code paths* — an `AudioPathInfo`-style descriptor (url format, local dir, optional gapless timing DB) encodes both; verse-repeat/range-repeat/enforceBounds live in a pure "virtual queue" (`AudioQueue`) decidable without any player. Engine decomposition from i (`audio-recitation`): repetition primitives (`Runs.finite/.indefinite`, verse delay) belong to the player-engine layer, not the view model; pause state derives from the engine, never from UI. Concurrency discipline from W (`audio-recitation`): Safari fires ENDED instead of WAITING — simulate waiting from timeupdate with drift tolerance; persist Infinity as `-1` because it cannot travel through JSON.
- **Expo mapping:** `features/audio` with a hard platform split:
  - `PlayerEngine.native.ts` — the Expo audio module (`expo-audio`), background-mode config plugin, lock-screen/now-playing integration;
  - `PlayerEngine.web.ts` — single hidden `<audio>` element + `navigator.mediaSession` (W proves this suffices);
  - shared pure `AudioQueue` domain (from A) + one player reducer/store both engines feed. Verse tracking for gapless: port A's position→ayah timing-table mapping with 150 ms hysteresis; feeds existing page pager for follow-along. Downloads-for-offline (native only): `expo-file-system` download + resumable tasks — web streams only (W deliberately excludes MP3 from service-worker caching after breaking Firefox range requests; do the same).
- **Biggest risk:** background playback + media-session plumbing on two native OSes; ship gapped-reciter streaming first (trivial queue), gapless + downloads second.

### 2.10 Dual-page / wide-surface layout — **M**
- **Current:** single-page pager everywhere.
- **Primary reference: A (`dual-page-split-mode`).** Book-side correctness formula `(pageNumber + skip) % 2 == 1` survives skipped front matter; foldables/tall screens need explicit predicates, not just orientation. i's `stride(from:to:by:2)` pairing + gutter separators is the simpler implementation sketch. Split quran+translation mode (A `TabletFragment.Mode.SPLIT`) pairs naturally with 2.6 on tablets and desktop web.
- **Expo mapping:** extend `PagePager` entity: `PagerStrategy.single | .dual | .split` chosen by a width predicate; web gets a two-column CSS grid variant instead of a second pager instance (matching W treating wide-web as n-a). `.native.ts` split already exists at PagePager — add strategy implementations inside it.
- **Risk:** selection coordinates under dual mode (A carries per-page x-offsets through the whole selection pipeline — budget for that).

### 2.11 Accounts / preference sync — **L (defer, but reserve seams)**
- **Current:** absent; all data local.
- **Primary reference: W (`account-preference-sync`) for the pattern, A/i (`cloud-sync-quran-account`, `quran-com-cloud-sync`) for containment.** The single transferable idea: *one* chokepoint hook through which every persisted setting change flows — dispatch optimistically, then push the group, with Undo/Continue toast on failure and boot-time merge per group. Both native repos prove the complementary discipline: gate every sync touchpoint behind a compile-time/config flag so the app ships complete without accounts (A hides Account row when OAuth is unconfigured; i compiles the entire product with `#if QURAN_SYNC` off).
- **Expo mapping:** do nothing now except (a) route all settings writes through one app-layer service (fits ui→app→data rule already), (b) tag KVStore keys with stable group names mirroring W's `PreferenceGroup` enum, (c) keep 2.4 backup/import as the interim portability answer. Actual auth/sync = post-1.0.
- **Risk:** doing (a)/(b) later means retrofitting every settings screen — cheap now, expensive then.

### 2.12 Mushaf variants / editions — **M (later, data-gated)**
- **Primary reference: i (`mushaf-edition-selector`).** Editions should be pure data descriptors (widths, page-count mapping, required sidecar metrics, inversion flags) consumed by edition-free renderers; switching = swapping one setting value, and every consumer re-derives (A relaunches the activity because everything derives from it — our equivalent is invalidating the React Query caches rooted on the edition key). A's `Map<String, PageProvider>` multibinding is just a registry object in TS.
- **Expo mapping:** `entities/quran` gains an edition registry; static generator emits per-edition datasets; repository keys queries by edition. No platform split.
- **Risk:** sourcing trustworthy per-edition geometry/text data, not code. Defer until a second edition is actually wanted.

### 2.13 Native extras (widgets, Android Auto, command bar) — **parked**
- Widgets/Auto: A-only capabilities tied to platform contracts RemoteViews/MediaBrowserService; in Expo land these mean custom native targets — **L**, park unless growth demands. W's embeddable-widget builder is the web-shaped analog and cheap later (`embeddable-widgets`: persist only a diff over defaults so old embeds survive default changes).
- Command bar / search history (W `search-discovery`): a Cmd-K surface resolving selections to URLs fits Expo Router on web natively; native equivalent is a quick-actions sheet. **S/M**, good post-2.2 candidate. Voice search stays web-only (SpeechRecognition singleton).

---

## 3. Suggested roadmap ordering

| Phase | Items (refs to §2) | One-line rationale |
|---|---|---|
| **1 — Quick wins** | 2.1 share/copy · 2.2 jump+deep-links · 2.3 what's-new+migrations · 2.4 backup/export | All four are pure-TS-domain-heavy, need no new content pipelines, and each unlocks daily-user value within days; 2.3+2.4 de-risk everything after them. |
| **2 — Deepen what exists** | 2.5 collections+highlights · 2.12-lite (edition registry shape only) · 2.13 command bar | Builds directly on the proven optimistic-KV bookmark path and prepares data shapes (groups, editions, activity records) before the big content features land. |
| **3 — Strategic bets** | 2.6 translation+tafsir · 2.7 word-by-word · 2.8 goals/streaks | Translation mode is the single largest parity gap vs all three repos and unblocks WBW (same payloads) and end-of-surah surfaces (goals cards); sequencing WBW+goals immediately after maximizes shared infrastructure. |
| **4 — Platform-heavy** | 2.9 audio · 2.10 dual-page/split | Audio is the highest-value but highest-plumbing feature (background modes, sessions, downloads) — start once content/data patterns are stable; dual-page rides the same selection work as 2.6. |
| **5 — Deferred** | 2.11 accounts/sync · 2.12 full editions · 2.13 widgets/Auto/embeds | Each needs either a backend, external datasets, or custom native targets; the seams reserved in phases 2–3 keep them open without commitment. |

---

## 4. Open questions for the team

1. **Reader substrate:** ✅ **DECIDED 2026-08-24 — see §5 Decision Record.** Hybrid: native = page images, web = text + per-page QCF fonts; geometry DB shared by both.
2. **Accounts, ever?** If yes even vaguely, we adopt the W `PreferenceGroup` key taxonomy + single settings-write chokepoint (§2.11) now; if firmly no, backup/export (§2.4) becomes the permanent portability contract and deserves file-format stability guarantees.
3. **Static-export budget:** how many translations, tafsir volumes, and WBW locales can `generate:static` emit before build time/artifact size break CI and hosting limits? Needs a measurement spike before committing §2.6/§2.7 scope.
4. **Audio sources:** which reciter CDNs may we legally stream/hotlink, and is offline download in scope for v1 of audio (drives whether we need a download manager at all, §2.9)?
5. **Streak honesty:** local-only streaks are trivially spoofable by clock changes — acceptable for v1, or do we design activity records for eventual server adjudication (affects §2.8 record shape)?
6. **Accessibility bar:** both A and i have documented mushaf-interaction accessibility gaps (empty contentDescriptions in A's audiobar, pure-touch-geometry pages in A, error-display TODOs in i). Do we commit to screen-reader parity for verse actions from day one, since our text-based substrate makes it far cheaper than theirs?
7. **Web reader direction:** keep the horizontal pager on web (parity with native) or move to W's continuous vertical scroll per surah (better for SEO/find-in-page)? This affects whether dual-page (§2.10) and audio follow-highlight need web-specific implementations.

---

## 5. Decision Record — Reader substrate (answers §4-Q1, 2026-08-24)

**Decision: hybrid substrate.** Native platforms (iOS/Android) render **page images**; web renders **text with per-page QCF fonts**. Both share the same geometry layer (`assets/quran.db` `glyphs`/`word_frames` R-trees) for highlights, word-by-word, and audio sync — images need it exactly as much as text does.

### Evidence (mushaf-text-spike, CI artifacts 2026-08-24)

- Bundled `UthmanicHafs_V22.ttf` shapes **correctly on both platform text stacks** — HarfBuzz (Android emulator) and CoreText (iOS simulator) — pages 1/2/50/302, screenshots in `mushaf-spike-*` artifacts. The founding assumption "Unicode Uthmani won't render right on native devices" is retired with evidence.
- Print line breaks reproduce exactly from the glyph geometry DB at any screen width (vector scaling; verified down to a 320 px emulator).
- **Fidelity gap — the decision driver:** Unicode text can justify full lines only by inflating inter-word spaces. The printed mushaf justifies via contextual **kashida** (in-word elongation chosen per line position by the calligrapher) — verified visually on p302 lines 3/11/12/15 vs. print. Print-exact kashida requires either page images or per-page QCF pre-shaped glyph fonts.
- quran.com's web reader reaches print fidelity via **per-page QCF webfonts** (`useQcfFont.ts`, one `@font-face` per page, lazily injected) — the proven web pattern. Per-page QCF fonts on native would be images-with-extra-steps (PUA codepoints, per-page assets, no text semantics).
- Both mature native references (quran_android, quran_ios) chose images for the same fidelity reason; their entire image apparatus (width buckets, download gate, repair workers, geometry DB) validates the operational pattern.

### Native: page images

- **Sourcing:** quran.com-images assets (1024/1260/1920 buckets), self-hosted. Used per public precedent (quran.com, quran_android GPL3, quran_ios); attribution to King Fahd Glorious Quran Printing Complex required. Explicit image license not sought — accepted-risk call recorded 2026-08-24.
- **Font license (verified from embedded EULA):** KFGQPC grants use/copy/distribute free of cost; **modification of the font software is prohibited** — never subset/rename/optimize `UthmanicHafs_V22.ttf`; ship `LICENSE-KFGQPC.txt` alongside and credit in about screen.
- **Download gate is a feature, not an apology:** background download with progress, partial-page availability, silent repair workers (quran_android's three-layer pattern), missing-page limit guards. This becomes a phase-1 work item.
- **Accessibility:** image substrate is invisible to screen readers — mitigate with verse-level text alternatives in translation mode (both refs shipped this gap; we know better).

### Web: text + per-page QCF fonts

- Real text for SEO/SSG (existing static generation), print-exact Uthmani via lazily-injected per-page QCF `@font-face` (quran.com pattern).
- Non-Uthmani modes (IndoPak / QPC Hafs) stay ordinary text fonts with inter-word justification — acceptable per quran.com precedent; fallback chain to bundled UthmanicHafs.

### Substrate-independent outcomes from the spike

- Geometry DB validated as THE highlight/WBV/audio source for all platforms.
- **Data audit:** word-segmentation mismatches exist between `uthmani_text` and glyph positions (e.g. 1:1 — 4 words in text vs 5 glyph slots; 18:75 p11 missing). Quantify across all 604 pages before building word-by-word; affects both substrates.
- Spike retained (`src/app/mushaf-spike.tsx` + `.github/workflows/mushaf-spike.yml`): web text-rendering core and zero-cost fallback if image hosting/download friction emerges.
