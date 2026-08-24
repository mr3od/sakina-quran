# Jump-to-anywhere navigation and resume
> How **Quran for Android (github.com/quran/quran_android)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees

**"Jump" (go-to) dialog.** A `DialogFragment` (`app/src/main/java/com/quran/labs/androidquran/ui/fragment/JumpFragment.kt`, layout `app/src/main/res/layout/jump_dialog.xml`) titled *menu_jump* with three fields: a numeric **page number** box (`maxLength=3`, IME action "Go"), and an **auto-completing sura name + ayah number** pair. It is reachable from:
- the index screen overflow menu (`R.id.jump` in `app/src/main/res/menu/home_menu.xml`) via `QuranActivity.gotoPageDialog()` (`ui/QuranActivity.kt`),
- the reader toolbar menu (`R.id.jump` in `app/src/main/res/menu/quran_menu.xml`, handled in `PagerActivity.onOptionsItemSelected` around line 1226),
- launcher shortcut / home-screen widgets (below), which open it inside a transparent activity (`widget/ShowJumpFragmentActivity.kt`) so the dialog floats over nothing.

Typing in any field live-syncs the others: typing page 50 fills sura/ayah for that page; picking a sura + typing an ayah shows the computed target page as the page field's **hint** (submitting uses the hint if the box is empty). The fields coerce input (page clamped to `1..quranInfo.numberOfPages`, ayah to `1..getNumberOfAyahs(sura)`, unknown text defaults to al-Fatiha / ayah 1). Sura autocomplete is infix, case-insensitive, RTL-aware, and also matches by *number* ("2" finds al-Baqarah even with Arabic-Indic UI digits).

**Discrepancy vs. the brief:** there is **no juz field** in JumpFragment — only page and sura/ayah. Juz navigation is the separate index tab `ui/fragment/JuzListFragment.kt` (each juz split into 8 quarters; tapping calls `QuranActivity.jumpTo`).

**"Last page" resume.** An always-visible toolbar item on the index screen (`R.id.last_page` with `ic_goto_quran` icon, label *menu_jump_last_page*) plus a launcher shortcut. With no reading history it jumps to page 1 (`Constants.NO_PAGE == -1` sentinel → 1, `QuranActivity.jumpToLastPage()` line 411). The juz list also auto-scrolls to the current juz derived from the recent page (`JuzListFragment` line 116).

**Launcher shortcuts (static).** `app/src/madani/res/xml/shortcuts.xml` (duplicated per flavor under `app/src/{warsh,qaloon,naskh}/res/xml/`, differing only in `android:targetPackage` because each flavor has its own applicationId suffix): two long-press shortcuts, `lastPage` (action `com.quran.labs.androidquran.last_page`) and `jumpTo` (action `com.quran.labs.androidquran.jump_to`), both targeting `ShortcutsActivity`. Declared via `<meta-data android:name="android.app.shortcuts">` on the LAUNCHER activity `QuranDataActivity` (`app/src/main/AndroidManifest.xml` lines 41–59).

**quran:// deep links.** `QuranForwarderActivity.kt` is exported with a `VIEW` intent-filter for scheme `quran`; `quran://sura/ayah` opens that page with the ayah highlighted.

**Volume-key page turns.** A settings checkbox *"Volume key navigation"* ("Navigate between pages using volume keys", key `volumeKeyNavigation`, default off — `app/src/main/res/xml/quran_preferences.xml` line ~126, `data/Constants.kt` `PREF_USE_VOLUME_KEY_NAV`). When on, volume up/down flip pages in `PagerActivity`.

## 2. Architecture & key files

- `app/.../ui/fragment/JumpFragment.kt` — the go-to dialog; injects `com.quran.data.core.QuranInfo` (Metro field injection via `applicationComponent.inject(this)`); emits results through the `JumpDestination` interface, not directly into activities.
- `app/.../ui/helpers/JumpDestination.kt` — the seam of the feature: `interface JumpDestination { fun jumpTo(page); fun jumpToAndHighlight(page, sura, ayah) }`. Implemented by `QuranActivity`, `PagerActivity`, and `ShowJumpFragmentActivity`; also consumed by `SuraListFragment`, `BookmarksFragment`, so index lists and the dialog share one navigation contract.
- `app/.../ShortcutsActivity.kt` — no-UI trampoline: maps shortcut action → `QuranDataActivity` with the same action, calls `ShortcutManager.reportShortcutUsed(id)` on API 25+, then `finish()`.
- `app/.../QuranForwarderActivity.kt` — deep-link trampoline; parses integers out of the `quran://` URL (first int = sura, second = ayah, default 1), resolves page via `quranInfo.getPageFromSuraAyah`, forwards.
- `app/.../QuranDataActivity.kt` — the download-gated router. `targetIntent()` (lines ~489–543) switches on intent action: `ACTION_JUMP_TO_LATEST` → `QuranActivity` with action preserved (+ translation-upgrade extra); `ACTION_JUMP_TO` → `ShowJumpFragmentActivity`; `ACTION_OPEN_PAGE` → `PagerActivity` with `page`/highlight extras. Companion helper `openPageIntent()` builds the `open_page` intent used by the forwarder.
- `app/.../widget/ShowJumpFragmentActivity.kt` — transparent `AppCompatActivity` hosting `JumpFragment`; registers `FragmentManager.FragmentLifecycleCallbacks` to `finish()` itself when the dialog is destroyed; implements `JumpDestination`.
- `app/.../widget/SearchWidget.kt`, `app/.../widget/BookmarksWidget.kt` — home-screen widgets reusing the same custom actions as PendingIntents (targeting `QuranDataActivity` directly).
- `feature/reading/model/LatestPageTracker.kt` — app-scoped singleton (`@SingleIn(AppScope)`) holding `MutableStateFlow<LatestPage?>` (`LatestPage(page, pageType)`); the in-memory "where am I now" signal.
- `feature/reading/presenter/RecentPagePresenter.kt` — `@ActivityScope` presenter bound to the pager's page flow; batches swipes and persists them.
- `common/bookmark/.../model/RecentPagesDaoImpl.kt` + `common/data/.../dao/RecentPagesDao.kt` — repository seam for recents; backed by the quran.com Kotlin-multiplatform `ReadingSessionsRepository` (`com.quran.shared.persistence`), not raw SQL.
- `common/bookmark/src/main/sqldelight/com/quran/mobile/bookmark/LastPage.sq` — legacy `last_pages` table; now only a migration source (see §4).
- `app/.../view/ForceCompleteTextView.java` — `AppCompatAutoCompleteTextView` that forces selection from the adapter on focus loss (`onForceComplete`), overrides `enoughToFilter()` to `true`, and throws if you call `setOnItemClickListener`.
- `common/search/.../SearchTextUtil.kt` — RTL/LTR query normalization used by the dialog's filter.
- `app/.../util/QuranSettings.java` (`navigateWithVolumeKeys()`) + `app/.../data/Constants.kt` — volume-key preference plumbing.

## 3. Data flow

**Dialog → reader (in-app from PagerActivity):**
1. User submits → `JumpFragment.onSubmit()` reads `suraInput.tag`/`ayahInput.tag` (ints stashed by the TextWatchers) and the page text-or-hint, then `(activity as? JumpDestination)?.jumpToAndHighlight(page, sura, ayah)` — the safe cast means the dialog silently no-ops in hosts that are not jump targets.
2. In `PagerActivity.jumpToAndHighlight` (line 1083) this does **not** start a new activity: it builds a synthetic Intent and calls its own `onNewIntent(intent)` — which first calls `recentPagePresenter.onJump()` (flushing the previous reading span), applies `EXTRA_JUMP_TO_TRANSLATION`, sets the highlight through `readingEventPresenterBridge.setSelection(sura, ayah, true)`, then `ensurePage(sura, ayah)` maps sura/ayah → ViewPager position via `quranInfo.getPositionFromPage(page, isDualPageVisible)`.
3. From the index screen, `QuranActivity.jumpTo/jumpToAndHighlight` (lines 464–471) instead `startActivity(PagerActivity)` with extras `"page"`, `EXTRA_HIGHLIGHT_SURA`, `EXTRA_HIGHLIGHT_AYAH`, `EXTRA_JUMP_TO_TRANSLATION = settings.wasShowingTranslation` (resume last reading mode). `PagerActivity.onCreate` reads the same extras and pre-seeds the highlight selection.

**Shortcut → last page:** long-press shortcut → `ShortcutsActivity` (records usage, finishes) → `QuranDataActivity` with `last_page` action (runs the pages-download gate: prompt dialog, patch handling, `fallbackToImageType()` if needed) → `runListView()` → `QuranActivity` with the action intact → `onCreate` sees `ACTION_JUMP_TO_LATEST` (line 201) → `jumpToLastPage()`:
1. `latestPageFlow.first()` = `combine(recentPagesDao.recentPagesFlow().map { it.firstOrNull()?.page ?: NO_PAGE }, latestPageTracker.latestPage) { persisted, latest -> latest?.takeIf { it.pageType == settings.pageType }?.page ?: persisted }.distinctUntilChanged()`.
2. `jumpTo(page)` → `startActivity(PagerActivity)` with `"page"` extra.

**Shortcut/dialog shortcut path:** `ACTION_JUMP_TO` → `ShowJumpFragmentActivity` → `JumpFragment` → `jumpToAndHighlight` → fresh `PagerActivity`.

**Deep link:** browser/app link → `QuranForwarderActivity` → `openPageIntent(page, sura, ayah)` → `QuranDataActivity` (`ACTION_OPEN_PAGE`, download gate) → `PagerActivity` with highlight extras.

**Reading position capture (the write side):**
1. `PagerActivity.currentPageFlow` is a `callbackFlow` wrapping `SimpleOnPageChangeListener.onPageSelected` → `trySend(quranInfo.getPageFromPosition(position, isDualPageVisible))`.
2. On `onResume`, `recentPagePresenter.bind(currentPageFlow)`; each emission → `LatestPageTracker.updateLatestPage(page, @Named(CURRENT_PAGE_TYPE) pageType)` and merges into a `Page(minPage, maxPage, page)` span (dual-page mode spans two pages).
3. `recentPagePresenter.onJump()` on every new intent marks a session boundary; `unbind()` in `onPause` → `saveAndReset()` → `persist()` on `MainScope` guarded by a `Mutex`: single page → `recentPagesDao.addRecentPage`, range → `replaceRecentRangeWithPage(min, max, page)`.
4. `RecentPagesDaoImpl.addRecentPageInternal` converts page → `(sura, ayah)` via `quranInfo.getPageBounds(page)` and writes a `ReadingSession` row through the shared KMP `ReadingSessionsRepository`, dedupes per page and prunes to `MAX_RECENT_PAGES = 3` (`pruneRecentSessions`). This is why the DAO takes `quranInfoProvider: () -> QuranInfo` — the mushaf layout is flavor-dependent and must be resolved lazily.
5. On `onPause` the pager also saves `quranSettings.wasShowingTranslation` so jumps restore the correct reading mode.

**Volume keys:** `PagerActivity.onKeyDown` (line 869) — if `audioStatusRepositoryBridge.audioRequest() == null && quranSettings.navigateWithVolumeKeys()`, `KEYCODE_VOLUME_DOWN` → `viewPager.currentItem -= 1`, `KEYCODE_VOLUME_UP` → `+1`, return true; `onKeyUp` mirrors the check so the event never falls through to the volume UI.

## 4. Storage & network

- **SharedPreferences** (via `QuranSettings`/`SettingsImpl` over the common `Settings` dao): `volumeKeyNavigation` (bool, default false); `wasShowingTranslation` (reading mode carried into every jump); legacy `lastPage` pref read only during DB migration (`BookmarkDataModule`, `AfterVersion(2)` seeds `INSERT INTO last_pages(page)`).
- **bookmarks.db (SQLDelight 2.x, `common/bookmark/src/main/sqldelight`):** table `last_pages(_ID PK AUTOINCREMENT, page INT UNIQUE, added_date epoch-seconds DEFAULT strftime('%s','now'))` with `getLastPages ... ORDER BY added_date DESC`. Today it is written by migration and read **only** by `app/.../database/BookmarksDBAdapter.getBookmarksForMigration()` (`lastPageQueries.getLastPages(Mappers.recentPageMapper)`), which feeds `RecentPagesDao.replaceRecentPages` to import legacy recents into the sync store.
- **Live recents store:** quran.com shared multiplatform persistence (`com.quran.shared.persistence` `ReadingSessionsRepository`, provided through `MobileSyncRepositoryProvider` in `common/bookmark/.../di/BookmarkDataModule.kt`), keyed by (sura, ayah, timestamp) rather than page — deliberately, so recents survive mushaf-layout changes and can cloud-sync via `feature/sync`. Caching is reactive: two eagerly-shared `StateFlow`s (`getReadingSessionsFlow()`, `settings.preferencesFlow()` mapped to pageType) combined in `recentPagesFlow()`, invalidated automatically when sync writes or the user changes page type.
- **Network:** the feature itself performs none — all navigation math is local (`QuranInfo` arrays in `common/data`). Network enters only indirectly: jumping requires the target page image to exist locally, and every external entry point (shortcut, deep link) is routed through `QuranDataActivity`'s download gate (`promptForDownloadDialog`, `PAGES_DOWNLOAD_KEY`, missing-page repair) before `PagerActivity` starts. Page images themselves come from the project CDN per the standard download service flow.

## 5. Why it is built this way ON THIS PLATFORM

- **Trampoline activities exist because of the image-download model.** Pages are remote assets bucketed by device width; a cold entry from a launcher shortcut or a `quran://` link cannot go straight to `PagerActivity` or the app would crash/render blank on a fresh install. `ShortcutsActivity`/`QuranForwarderActivity` funnel everything through the single LAUNCHER activity that owns the download gate. They must be separate activities (not just logic in `QuranDataActivity`) so they can be `exported=true` while the real screens stay unexported (`QuranActivity` is explicitly `exported="false"`).
- **Static XML shortcuts + per-flavor files.** The actions are fixed, so declarative `<shortcuts>` XML attached to the manifest beats building them at runtime; but `targetPackage` must match each flavor's applicationId (`com.quran.labs.androidquran.warsh` etc.), forcing four copies of the file. `reportShortcutUsed()` exists purely to feed Android's launcher prediction/ranking.
- **Reusing `onNewIntent` inside `PagerActivity`** avoids restarting a heavyweight activity (ViewPager of large bitmaps, active audio service connection, highlight state) for an in-app jump — equivalent to single-top behavior without relying on launch flags, and keeps the foreground `AudioService` untouched.
- **Volume-key hijacking consumes both DOWN and UP** events, otherwise Android plays the volume UI/sound mid-turn; navigation is suppressed while audio is playing (`audioRequest() != null`) because volume legitimately belongs to playback then.
- **Deferred, mutexed persistence.** Writing a DB row per swipe would thrash storage during fast scrolling and run afoul of onPause time budgets; batching into a min/max span flushed on `unbind()` (with `Dispatchers.IO` inside the shared dao) makes resume durable across process death while costing at most one write per session.
- **`LatestPageTracker` as an in-memory StateFlow** answers "where was I" synchronously after returning to the index screen even though the DB write may still be in flight (or was skipped for the current span), and the `pageType` guard prevents cross-flavor leakage — madani/warsh/qaloon/naskh have different page counts, so a raw page number is meaningless without its mushaf.
- **Recents moved into the KMP shared graph** so the same reading-session data powers account sync (feature/sync talks to quran.com infrastructure); resume state becomes cross-device instead of a private SQLite row.
- A web or iOS port would centralize routing in a single deep-link handler/route table and store resume state server-side; here the OS primitives (manifest-declared shortcuts, scheme intent filters, trampolines, SharedPreferences-backed toggles) dictate the shape, and the download-first gate is the app-specific constraint no other platform has.

## 6. Edge cases & offline behavior

- **Input coercion everywhere:** page coerced into `1..numberOfPages`, ayah into `1..ayahCount`, non-numeric input → 1 (`toIntOrNull() ?: 1`), unmatched sura text → al-Fatiha; `onSubmit` wraps everything in try/catch logging via Timber ("Could not jump, something went wrong...") and simply does nothing on a bad cast. Deep links with garbage segments skip non-numeric parts; if no sura is parseable the forwarder silently finishes (no error toast).
- **TextWatcher feedback loops** are tamed with a `suppressJump` flag; a deliberate leading space `" "` distinguishes programmatic ayah fills from user edits; numeric IMEs emit western digits, so typed Arabic-Indic ayah values get replaced with canonical digits before comparison.
- **Localized numbers & RTL:** sura rows and the page hint use `QuranUtils.getLocalizedNumber` (Arabic-Indic digits under Arabic locales), yet filtering still accepts English digits (`filteredIndex` matches against `index + 1`); `InfixFilterArrayAdapter` normalizes queries with `SearchTextUtil.asSearchableString` — stripping tashkeel and folding alif-hamza variants (أ إ آ ى → ا, ؤ → و) for RTL, NFKD+lowercase for LTR — so "الفتح" matches "الفاتحة".
- **First-run vs upgrade:** no history → `NO_PAGE (-1)` → page 1. Upgrades hit the SQLDelight schema callback seeding `last_pages` from the old preference, then `BookmarksDBAdapter` migration imports those rows into reading sessions. Shortcut/deep-link entry on a device without images lands in `QuranDataActivity`'s download prompt (declining a patch still allows the index list; `fallbackToImageType()` enables download-on-demand).
- **Dual-page/tablet:** positions map through `getPageFromPosition/getPositionFromPage(page, isDualPageVisible)`; a two-page visible span is recorded as a range and collapsed to the final page on save.
- **Audio interplay:** volume nav disabled during playback; jumps from the index stop lingering audio via the 500 ms delayed `AudioService.ACTION_STOP` in `QuranActivity.onResume`.
- **Dialog lifecycle:** `JumpFragment` is stateless across recreation (values live in view tags), soft-input set to `SOFT_INPUT_STATE_VISIBLE | ADJUST_PAN`; `ShowJumpFragmentActivity` self-finishes whenever its fragment is destroyed, covering back press and outside taps.
- **Accessibility:** plain `EditText`s with `selectAllOnFocus` and `flagNoExtractUi`; no explicit content descriptions beyond the standard menu items — the dialog relies on system TalkOver of labels rather than custom semantics.
