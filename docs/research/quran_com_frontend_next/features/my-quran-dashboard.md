# My Quran personal dashboard

> How **Quran.com frontend (github.com/quran/quran.com-frontend-next)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees

`/my-quran` is a full-page "sheets-like" container (`PageContainer isSheetsLike`) with a `HeaderNavigation` bar and a single `TabSwitcher` (from `src/dls/TabSwitcher`) offering Saved, Recent, and Notes & Reflections (`src/pages/my-quran/index.tsx`). The active tab is mirrored into the `?tab=` query param via shallow `router.replace`, so tab state survives reloads and back-navigation. The Saved tab shows a resume-reading bookmark card (`MyReadingBookmark`), recently saved verses, and a collection list that drills into a `CollectionDetailView`. The Notes & Reflections tab nests its own two-way switcher (Notes vs Reflections) plus a sorter. Logged-out users see `SignInPrompt` cards instead of content.

## 2. Architecture & key files

- Page: `src/pages/my-quran/index.tsx` — a thin shell; all behavior lives in `src/components/MyQuran/*`.
- Tab registry: `src/components/MyQuran/tabs/index.ts` exports the `MyQuranTab` enum; the page pre-builds a `tabComponents` map so switching tabs swaps already-mounted element trees.
- Tab implementations: `SavedTabContent/`, `tabs/RecentContent/`, `tabs/NotesAndReflectionsTab/` (which composes `NotesTab`, `ReflectionsTab`, `NotesSorter`, `BasicSwitcher`).
- Supporting components: `CollectionsList`, `CollectionDetailView` (with bulk actions bar, header, modals), `RecentlySaved`, `SearchAndFilters`, `DeleteCollectionModal`, `SignInPrompt`, `Skeleton`.
- The resume bookmark is not dashboard-specific: it reads the shared Redux reading-tracker slice (`src/redux/slices/QuranReader/readingTracker.ts`) written by the reader itself.
- Brief correction: this is the Next.js **pages router** (`src/pages/my-quran/index.tsx` with `GetStaticProps`), not App Router.

## 3. Data flow

Each tab pulls from a different layer. `SavedTabContent` composes three hooks: `useCollections` (server-side collections/bookmarks, with sort options and a default "Favorites" collection flagged by `collection.isDefault`), `useRecentlySaved` (`src/hooks/useRecentlySaved.ts`, SWR + `privateFetcher` on `makeBookmarksUrl()` with the mushaf id derived from the user's font/mushaf-lines Redux selectors), and `useReadingBookmarkDisplay` for the last-read verse. The Recent tab reads `selectRecentReadingSessions` from the local Redux store and lazily resolves each session's verse metadata with `useSWR` in immutable mode (`RecentContent/VerseMetadata.tsx`). Notes/reflections come from their own authed endpoints behind `NotesTab`/`ReflectionsTab`. Auth state is resolved client-side through `useIsLoggedIn`; nothing user-specific is fetched during SSR — `getStaticProps` only supplies `chaptersData`.

## 4. Storage & network

The dashboard's only durable local state is the `READING_TRACKER` slice, which is whitelisted in the redux-persist config in `src/redux/store.ts` (~line 68), so `lastReadVerse` and up to 10 recent reading sessions survive reloads in localStorage. Collections, bookmarks, notes and reflections live server-side on the quran.com account backend and are fetched with SWR through authenticated fetchers, giving cross-device continuity for signed-in users. Anonymous users get guest bookmarks locally (migrated after login elsewhere in the app); the page is marked `noindex`/`nofollow` via `NextSeoWrapper` since it is purely personal.

## 5. Why it is built this way ON THIS PLATFORM

As a web app whose discovery funnel is SEO, personalized dashboards cannot be server-rendered usefully, so Quran.com renders a static shell (`getStaticProps` returns only chapter metadata) and hydrates personal data client-side per tab — cheap CDN delivery plus no risk of leaking user data into HTML. Tabs are URL-synced rather than route-per-tab because each tab shares one layout and there is no need for distinct crawlable URLs. Reading position is tracked in Redux instead of a database table because the browser is the only guaranteed local store; persisting just 10 sessions bounds localStorage growth. Server-side collections exist because logged-in users expect cross-device sync of saved verses, mirroring how settings sync works (`hooks/auth/usePersistPreferenceGroup.ts`).

## 6. Edge cases & offline behavior

- Logged-out users get `SignInPrompt` per tab (`NotesAndReflectionsTab/index.tsx` gates on `useIsLoggedIn`), not a redirect.
- `readingTracker.setLastReadVerse` dedupes: revisiting a verse bumps it to newest; a verse within 20 verses of the previous session (`NEW_SESSION_BOUNDARY`, computed by `getDistanceBetweenVerses`) replaces rather than adds a session; the map is capped at `MAXIMUM_NUMBER_OF_SESSIONS = 10`.
- Recent verse metadata fetch failures degrade to rows without translation text (SWR error state).
- Offline: the next-pwa service worker (`pwa-runtime-config.js`) caches API responses/fonts, so previously loaded tabs may render stale data, but nothing here is deliberately offline-first; the resume bookmark still works fully offline because it is pure persisted Redux state.
- Deep links to an invalid `?tab=` value fall back silently to SAVED (`index.tsx` validates against `Object.values(MyQuranTab)`).
