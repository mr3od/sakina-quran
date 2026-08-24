# Continue Reading (Last Pages)
> How **Quran for iOS (github.com/quran/quran-ios)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- The Home tab opens with a "recent pages" section (`NoorSection(title: lAndroid("recent_pages"), lastPages)` in `Features/HomeFeature/Sources/HomeView.swift`) listing up to three recently read pages, each tappable to jump back in (`HomeViewModel.navigateTo(_ lastPage:)` → `navigateToPage(page, lastPage)`).
- In sync builds an additional reading-bookmark card sits above it (`readingBookmarkView(_:)`), showing the single authoritative position — either a page or an exact ayah — and tapping navigates via `navigateTo(_ readingBookmark:)`'s switch over `.ayah`/`.page`.
- While reading, moving or clearing the position produces a toast with an **Undo** action (e.g. "Reading bookmark moved from 2:255 to page 302"), built by `Features/QuranViewFeature/Sources/ReadingBookmarkUndoToast.swift`.

## 2. Architecture & key files
- Read side: `Features/HomeFeature/Sources/HomeViewModel.swift` exposes `@Published var lastPages: [LastPage]` and, under `#if QURAN_SYNC`, `@Published var readingBookmark: ReadingPositionBookmark?`; both `didSet` call `recordListUpdate(reason:)` for crash-diagnostic list telemetry.
- Model: `Model/QuranAnnotations/Sources/LastPage.swift` (`page`, `createdOn` legacy-only, `modifiedOn`; `id` is the server string under sync) and `ReadingPositionBookmark.swift` (`id: String`, `location: .ayah(AyahNumber) | .page(Page)`, `modifiedOn`) — a history of pages vs one canonical cursor.
- Service seam: `Domain/AnnotationsService/Sources/LastPageService.swift` protocol (`lastPages(quran:) -> AnyAsyncSequence<[LastPage]>`, `add(page:)`, `update(lastPage:toPage:)`); CoreData implementation in `Data/LastPagePersistence/Sources/`.
- Write side: `Domain/AnnotationsService/Sources/LastPageUpdater.swift`, created by `Features/QuranContentFeature/Sources/ContentBuilder.swift` and driven from `ContentViewModel.visiblePagesUpdated()`. Bookmark mutations flow through `Features/QuranViewFeature/Sources/QuranInteractor.swift.performReadingBookmarkAction(_:)` using `ReadingBookmarkAction.swift` and a `QuranReadingBookmarkObserver`.

## 3. Data flow
- `HomeViewModel.start()` launches `loadLastPages`, `loadSuras`, `loadQuarters` (plus `loadReadingBookmark` when synced) concurrently with `async let`, awaiting them as a tuple.
- `loadLastPages()` re-subscribes per mushaf: iterating `readingPreferences.$reading.prepend(current).values()`, cancelling the previous inner `observationTask`, then consuming `lastPageService.lastPages(quran:)` and assigning each emission to `lastPages`. Cancellation is checked with `guard !Task.isCancelled` after every await; errors go to `crasher.recordError`.
- Writing is decoupled through an actor-ish queue: `LastPageUpdater.updateTo(pages:)` takes `pages.min()` (left page of a two-page spread wins) and yields a `Request` into an `AsyncStream` buffered `.bufferingNewest(1)`; a single long-lived worker task consumes it, so rapid page flips collapse to the newest write instead of queuing I/O. A monotonically increasing `generation` discards stale requests, and `configure(initialPage:lastPage:)` forces a write even for unchanged pages on open.
- Bookmark moves: the toolbar's `toogleBookmark()` derives an action via `ReadingBookmarkAction.page(visiblePages:bookmark:)` — bookmark the smallest visible page, or remove if that page already holds it — guarded by `isBookmarkMutationInFlight` against double taps; ayah-level sets come from the ayah menu's `setReadingBookmark(at:replacing:)`.

## 4. Storage & network
- Last pages live in CoreData (`MO_LastPage`). `CoreDataLastPagePersistence.add` deletes any existing row for the same page before inserting and then runs `CoreDataLastPageOverflowHandler.removeOverflowIfneeded(using:)`, which fetches all rows sorted by `modifiedOn` descending and deletes everything past `maxNumberOfLastPages = 3` — the "three recent pages" cap is enforced at the persistence layer, not the UI.
- The reading-position bookmark is a separate synced object owned by `MobileSyncReadingBookmarkService` (Kotlin Multiplatform, `#if QURAN_SYNC` only); legacy builds have no equivalent — only last pages plus explicit page bookmarks.
- All reads are local sequences; the sync service handles background push/pull transparently. Undo handlers re-issue `observer.add(at:)` rather than caching rows, so they work identically online/offline.

## 5. Why it is built this way ON THIS PLATFORM
- Page-faithful mushaf rendering means "position" is naturally a page number; the sync-era `Location.ayah` refines it for translation mode where a page is too coarse — hence two models coexisting.
- The AsyncStream + generation worker in `LastPageUpdater` exists because page-turn callbacks fire far faster than CoreData commits should run; buffering-newest gives O(1) memory and always-current state, a classic UIKit-scroll-view-driven-write solution.
- Undo toasts rather than confirmation dialogs suit a low-stakes, high-frequency mutation: `performReadingBookmarkAction` shows `.saved` without action for a fresh bookmark but `.moved`/`.removed` with undo, and each undo handler re-validates current state first (`guard deps.readingBookmarkObserver.bookmark == movedBookmark`) so a stale toast can't clobber a newer edit — important once sync can change the bookmark from another device.
- Localization keys like `lAndroid("recent_pages")` and `"ayah.menu.reading-bookmark.moved"` come from the shared `QuranLocalization` package reused by the Android app.

## 6. Edge cases & offline behavior
- Empty visible-page arrays yield `nil` actions; removing requires `observer.bookmark == bookmark` so a stale menu can't delete a newer bookmark.
- Undoing a move fails silently (recorded via `crasher.recordError`) if the user has since moved the bookmark again; undo of removal only fires while no bookmark exists.
- Overflow deletion guarantees the Home section never grows unbounded even after years of use; mushaf switches cancel in-flight observation tasks before rebinding to the new `Quran`.
- Everything works offline for local users; sync users get server reconciliation through the observation sequence, with failures logged rather than blocking resume-from-home.
