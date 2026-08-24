# Surah index and juz/page browsing
> How **Quran.com frontend (github.com/quran/quran.com-frontend-next)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- On the home page, a tabbed index — Surah / Juz / Revelation order — with an ascending/descending sort toggle. The Surah tab renders all 114 rows (`SurahPreviewRow` from `src/components/dls/SurahPreview`) showing number, transliterated and translated names, and localized ayah counts.
- Above it, pill-shaped "quick links" to culturally popular entry points: Al-Mulk, Al-Kahf, Ya-Sin, Ayat-ul-Kursi, and Al-Baqarah 285–286.
- Inside the reader, a fixed left sidebar rail with its own Surah/Verse/Juz/Page switcher, a "try navigating with ⌘K" hint, and scrollable per-item selection lists; it collapses when the navbar hides and closes on outside click on mobile.

## 2. Architecture & key files
- `src/components/chapters/ChapterAndJuzList.tsx` — the home index; receives `chapters: Chapter[]` as props. `JuzView`, `RevelationOrderView`, and the mobile popover are loaded via `next/dynamic` with `ssr: false` plus a `ChapterAndJuzListSkeleton` fallback.
- `src/components/chapters/JuzView.tsx`, `RevelationOrderView.tsx`, `ChapterBlock.tsx`, `ChapterIcon/`, `ChapterHeader/`, `Info/` make up the rest of the index surface.
- `src/components/HomePage/QuickLinks/index.tsx` — hardcoded `QUICK_LINKS` array of five entries typed `Surah | Ayah | Range`.
- `src/components/QuranReader/SidebarNavigation/SidebarNavigation.tsx` — the rail; delegates list rendering to `SidebarNavigationSelections.tsx`, which swaps in `SurahList`, `VerseSelection`, `JuzSelection`, `PageSelection` based on the Redux-selected `NavigationItem`. Visibility itself is Redux state in `src/redux/slices/QuranReader/sidebarNavigation` and is whitelisted into localStorage.

## 3. Data flow
- Chapters metadata is server-generated once per locale through `getAllChaptersData(locale)` (used identically by home, `/search`, and `/calendar` pages' `getStaticProps`), so the 114-card grid needs zero client fetching.
- Tab switching is pure client state: `View.Surah | View.Juz | View.RevelationOrder` in local `useState`; sorting is an in-memory `slice().sort()` on chapter ids.
- Quick link labels are resolved at render time from `DataContext` (a client context carrying chapters data) via `getChapterData`, then linked with plain hrefs like `/al-baqarah/285-286` that Next's file routes already understand.
- Sidebar selections dispatch navigation through Redux/router; when revelation-order reading mode is on (`selectIsReadingByRevelationOrder`), the rail replaces its header with `RevelationOrderNavigationNotice` and forces the Surah view, since juz/page semantics don't map onto revelation order.

## 4. Storage & network
- Only two things persist: the sidebar's visibility flag (`SIDEBAR_NAVIGATION` is in the whitelist of `src/redux/store.ts`), so users who hide the rail keep it hidden; and the reader's own position via the separate `READING_TRACKER` slice.
- Network cost is minimized by prefetch policy: `MOST_VISITED_CHAPTERS` (1–4, 18, 32, 36, 55, 56, 67) gates `shouldPrefetch` on each surah `Link`, prefetching only ten high-traffic surahs instead of 114.
- Juz/page views being dynamically imported means they cost nothing until first opened; their data comes from API v4 endpoints at request time (the individual selection components were not deep-read within this budget).

## 5. Why it is built this way ON THIS PLATFORM
- The whole index can be static HTML: 114 chapters never change server-side, which makes the page cacheable by CDN and instantly paintable — critical for a site whose traffic arrives from Google searches for specific surahs.
- Selective `next/dynamic` + `ssr: false` keeps First Contentful Paint on the default Surah tab while still offering three browsing paradigms; skeletons preserve layout stability.
- Prefetching only "most visited" chapters is a web-bandwidth trade-off native apps don't face: Next.js prefetch would otherwise fetch route bundles for all 114 links hovering in view.
- A persistent in-reader rail rather than a modal matches long reading sessions where constant cross-referencing (jump to another surah or page) is the norm, while Redux-persisting its visibility respects user preference across visits without any account.

## 6. Edge cases & offline behavior
- Revelation-order mode intentionally disables juz/page navigation and shows an explanatory notice linking to tanzil.net's order documentation.
- A one-`requestAnimationFrame` delay (`shouldDelayVisibleState`) prevents a CSS transition flash on initial mount when the rail starts visible.
- Mobile gets outside-click dismissal (`useOutsideClickDetector` gated by `isMobile()`) plus analytics events for every close path; desktop keeps it docked.
- Offline, previously visited surah routes remain reachable thanks to next-pwa runtime caching, and the home index itself renders fully from static props/localStorage — but unvisited juz/page lists need the network.
