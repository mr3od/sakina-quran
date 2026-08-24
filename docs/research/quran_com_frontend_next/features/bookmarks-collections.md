# Bookmarks and Collections
> How **Quran.com frontend (github.com/quran/quran.com-frontend-next)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- A bookmark icon on every verse (`src/components/Verse/BookmarkAction.tsx`, `BookmarkIcon.tsx`) and a "Save" action in the verse overflow menu that opens `SaveBookmarkModal`.
- The modal shows a Favorites toggle (a built-in default collection), a checklist of the user's named collections with instant check/uncheck, a "+ New collection" inline form, a reading-position bookmark section, and a "Take note" shortcut that hands off to the notes modal.
- My Quran's Saved tab (`src/components/MyQuran/SavedTabContent/index.tsx`) renders four regions: current reading position (`MyReadingBookmark`), recently saved items (`RecentlySaved`), a collections list, and, when one is opened, `CollectionDetailView`.
- Collections can be sorted (default "Recently updated", plus alphabetical asc/desc — `CollectionSortOption` in `src/hooks/useCollections.ts`) and searched; guests see a sign-in prompt instead of their data.
- Guests who have local bookmarks get a recurring nudge modal asking them to sign in so bookmarks survive.

## 2. Architecture & key files
- Two deliberately different persistence models: an anonymous local model and an authenticated server model.
  - Local: `src/redux/slices/QuranReader/bookmarks.ts` stores `bookmarkedVerses` / `bookmarkedPages` as plain `Record<string, number>` maps keyed by verse key / page number with the epoch-milliseconds timestamp as the value. New entries are unshifted to the front of the object literal so insertion order equals recency (comment on `toggleVerseBookmark`). Selectors `selectOrderedBookmarkedVerses`/`selectOrderedBookmarkedPages` re-sort keys lexically to get Mushaf order. This slice is redux-persist whitelisted (`BOOKMARKS`) so it survives reloads without any account.
  - Server: `src/utils/auth/api.ts` exposes the whole CRUD surface — `addBookmark`, `getBookmark`, `getBookmarkCollections`, `getCollectionsList`, `addCollection`, `updateCollection`, `deleteCollection`, `addCollectionBookmark`, `addBulkCollectionBookmarks`, `deleteCollectionBookmarkByKey/ById`, and `getReadingBookmark`/`setReadingBookmark`/`unsetReadingBookmark`.
  - Guest position: `src/redux/slices/guestBookmark.ts` keeps a single validated `readingBookmark {key, type, verseNumber?, mushafId}` for anonymous users (persisted under `GUEST_BOOKMARK`); invalid shapes are nulled and reported to Sentry via `logErrorToSentry`.
- UI logic is extracted into hooks: `useSaveBookmarkModal.ts` orchestrates the modal, delegating data to SWR hooks `useSaveBookmarkData`, `useCollectionsState`, `useCollectionToggle`; browsing uses `useCollections`, `useReadingBookmarkDisplay`, `useRecentlySaved`.

## 3. Data flow
- Toggling a collection checkbox calls `handleToggleCollection(collection.id, name, !checked)`, which optimistically mutates the SWR caches for both the collection list and the verse's membership list ("onMutate is intentionally not passed - we use optimistic updates without refetching"), then issues `addCollectionBookmark` / delete against the account API.
- Creating a collection mid-flow inserts a temp entry `{id: 'temp-' + Date.now(), url: slugified(name)}` into the SWR cache with `revalidate: false`, awaits `addCollection(trimmedName)` then `addCollectionBookmark(...collectionId)`, and finally `mutateAllData()` swaps temp ids for server ids; failure rolls back to the pre-update array and toasts an error.
- A `mushafId` is derived client-side from the reader style state (`getMushafId(quranFont, mushafLines)`), because a "page" bookmark only makes sense relative to the mushaf layout the user reads.
- The modal chains features: `handleTakeNote` dispatches `openNotesModal({modalType: ADD_NOTE, verseKey, previousModalType: SAVE_BOOKMARK})` so closing the note editor returns to the bookmark sheet.

## 4. Storage & network
- Anonymous: localStorage via redux-persist slices `BOOKMARKS` and `GUEST_BOOKMARK`; zero network.
- Authenticated: everything lives in the quran.com account backend reached through authenticated fetches in `src/utils/auth/api.ts` (JWT + refresh handled there); SWR keys are invalidated/mutated locally rather than storing content in Redux. The migration prompt adds its own raw localStorage keys (`guest-bookmarks-migration:opt-out`, `guest-bookmarks-migration:next-show` with a 24h snooze).
- Sign-in hand-off preserves context: `setPendingBookmarkModalRestore({verse, verseKey, redirectUrl})` (in `src/utils/pendingBookmarkModalRestore`) lets the same modal reopen after auth round-trips.

## 5. Why it is built this way ON THIS PLATFORM
- The web has no private native storage, so durable user data must live server-side; but requiring an account to even try bookmarking would kill conversion, hence the dual model: timestamped object maps in localStorage give instant, offline-friendly guest bookmarks, and the account API gives cross-device sync once logged in.
- Timestamp-as-value inside an object map is a cheap trick to keep recency ordering without arrays while staying JSON/persist-friendly.
- SWR + optimistic mutation is used instead of Redux for server collections because cache invalidation per resource (verse memberships vs collection lists) maps naturally onto SWR keys, and rollback on failure is a single `mutate` call.
- The migration modal waits for `selectIsPersistGateHydrationComplete` before deciding to show — otherwise SSR/hydration would flash it for users who actually are logged in or have no bookmarks.

## 6. Edge cases & offline behavior
- Guest verse/page bookmarks fully work offline (pure local slice). The migration nudge (`src/components/GuestBookmarksMigrationModal/index.tsx`) suppresses itself on auth pages, honors opt-out, and rate-limits itself to once per day.
- Collection toggling is verse-only — pages cannot be added to collections (explicit comment in `useSaveBookmarkModal.ts`); page bookmarks only support the flat local/global list.
- Optimistic create failures roll back cleanly; favorites toggle surfaces HTTP 400 as a dedicated `error.bookmark-sync` message.
- The brief's claim that guest bookmarks are auto-"migrated into your account on login" is only half visible in this codebase: what I verified is the pre-login nudge modal and post-login modal restore; the actual server-side merge of local bookmarks was not located within the read budget (no client-side bulk-upload call was found from these files), so the merge may occur server-side post-auth — explicitly unverified here.
