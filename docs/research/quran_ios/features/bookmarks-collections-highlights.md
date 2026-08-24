# Bookmarks, Collections & Highlights
> How **Quran for iOS (github.com/quran/quran-ios)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- The third tab ("Bookmarks", wired in `Features/AppStructureFeature/Sources/Tabs/BookmarksTab.swift`) lists ayah-bookmark collections, highlight groups, and the current reading-position row. Tapping a collection or a colored-highlight chip pushes an ayah list (`showCollection` / `showHighlights` in `Features/BookmarksFeature/Sources/BookmarkCollectionsViewModel.swift`), tapping the reading bookmark jumps straight to that ayah/page.
- Collections render in a fixed display order — default "Bookmarks" first, then a migrated "old page bookmarks" pseudo-collection, then user-named collections alphabetized (`displayedCollectionSortIndex`, `displayedCollections(from:)`). An `EditMode` lets users delete collections; deleting a non-empty one first raises `collectionPendingDeletion` for a confirmation (`CollectionDeleteConfirmation.swift`).
- A dismissible banner invites signing in to quran.com when unauthenticated (`shouldShowSyncBanner`, backed by `AuthenticationPreferences.shared.isCollectionsSyncBannerDismissed`).
- In the reader, long-pressing an ayah opens `Features/AyahMenuFeature`; its bookmark button's state is computed by `AyahMenuViewModel.bookmarkState` as `.unhighlighted`, `.bookmarked`, `.highlighted(color)` (all selected verses one color), or `.partiallyHighlighted`.

## 2. Architecture & key files
- The whole feature exists in two compile-time variants. `Features/BookmarksFeature/Sources/BookmarksBuilder.swift.build()` picks `BookmarkCollectionsBuilder` under `#if QURAN_SYNC`, otherwise falls back to a flat page-bookmark list (`BookmarksViewModel` over `PageBookmarkService`). Every named collection, highlight listing and reading bookmark here is therefore a **sync-build-only** capability — the entire `BookmarkCollectionsViewModel.swift` file is wrapped in `#if QURAN_SYNC`.
- `BookmarkCollectionsViewModel` is a `@MainActor ObservableObject` with constructor-injected deps: `AyahBookmarkCollectionService`, `MobileSyncAyahHighlightService`, `MobileSyncReadingBookmarkService`, `AuthenticationClient`, an `AyahSetBuilder` for drill-down screens, a weak `UINavigationController`, and `navigateToPage`/`navigateToAyah` closures — no DI framework, no router object.
- State is plain `@Published` values: `collections: [AyahBookmarkCollection]`, `highlights: [AyahNumber: HighlightColor]`, `readingBookmark: ReadingPositionBookmark?`, `editMode`, `error`.
- Highlight *authoring* lives in the ayah menu, not this tab: `AyahMenuViewModel.deps` receives `highlightVerses: [AyahNumber: HighlightColor]` and `bookmarkedVerses: Set<AyahNumber>` snapshots, while mutation is delegated upward through the `AyahMenuListener.showCollectionEditor(for:)` / `setReadingBookmark(at:replacing:)` callbacks handled by `Features/QuranViewFeature/Sources/QuranInteractor.swift`.

## 3. Data flow
- `start()` fans out four concurrent jobs with `async let`: three infinite observation loops (`observeCollections`, `observeHighlights`, `observeReadingBookmark`) plus `authenticationClient.safelyRestoreState()` to set `isAuthenticated`.
- Each loop is a `for try await` over an `AsyncSequence` exposed by its service (`collectionsSequence()`, `highlightsSequence()`); every emitted snapshot wholesale-replaces the `@Published` value, so SwiftUI re-renders and no diffing is done in the view model. Loops check `Task.isCancelled` before touching state after an error.
- `observeReadingBookmark()` re-subscribes on mushaf change: it iterates `ReadingPreferences.shared.$reading.values()`, cancels the previously spawned `observationTask`, and starts a fresh task over `readingBookmarkSequence(quran: reading.quran)`.
- Mutations are fire-and-await service calls that never mutate local arrays directly — `createPendingCollection()` trims the sheet text and calls `ayahBookmarkCollectionService.createCollection(named:)`; `deleteCollection` calls `removeCollection(id:)` — the resulting push from the backend arrives as a new sequence emission.
- Derived helpers keep invariants: `deletableCollections(from:)` filters `canDelete` and sorts old page bookmarks first; the view model auto-resets `editMode = .inactive` whenever no deletable collections remain after an emission.

## 4. Storage & network
- In sync builds all three annotation types live behind quran.com accounts: `AuthenticationClient` performs OAuth login presented on the tab's navigation controller (`loginToQuranCom()` logs `analytics.quranSyncSignIn(from: .bookmarks)`), and the `MobileSync*` services (Kotlin Multiplatform `mobile-sync-spm`, conditionally compiled per `Package.swift`) own transport, caching and conflict resolution — their internals were out of read budget here.
- In legacy builds highlights are stored as CoreData notes with empty text: `NoteService.updateHighlight(verses:color:quran:)` in `Domain/AnnotationsService/Sources/NoteService.swift` writes `persistence.setNote(nil, verses:, color: color.rawValue)` and remembers `HighlightPreferences.shared.lastUsedHighlightColor`; page bookmarks go through `PageBookmarkPersistence` (CoreData). No collections exist at all offline.
- Network traffic is therefore confined to the authenticated path; the UI itself never issues requests, only service-sequence iterations.

## 5. Why it is built this way ON THIS PLATFORM
- Because the package ships as an SPM library, the closed-source sync binary cannot be referenced by the open example app; `#if QURAN_SYNC` lets one feature target serve both a rich cloud-backed product and a minimal local-only one without runtime branching.
- Snapshot-replacement AsyncSequences mirror how sync engines work (server truth is authoritative) and eliminate merge logic in UI code — a deliberate trade of local optimistic edits for simplicity, unlike the notes tab which does do optimistic deletes.
- Keeping navigation as injected closures plus `UINavigationController` preserves the UIKit shell mandated by the repo's README while view models stay SwiftUI-friendly `ObservableObject`s.
- Grouping highlights by color instead of storing user-created "highlight folders" matches quran.com's model where a highlight is just `(verse, color)` — cheap to render from one dictionary lookup.

## 6. Edge cases & offline behavior
- Empty collection names are rejected after whitespace trimming; empty collections delete immediately without confirmation (`requestDeleteCollection`).
- Stale-task races on mushaf switch are handled by cancelling the prior observation task and re-checking `Task.isCancelled` before assigning.
- Service failures surface as the published `error` plus `logger.error`, leaving the last good snapshot on screen; nothing clears annotations when offline.
- Mixed-color selections show `.partiallyHighlighted` rather than guessing a color; multi-verse selections disjoint from bookmarks report `.unhighlighted`.
