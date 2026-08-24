# Reading goals, streaks and progress tracking

> How **Quran.com frontend (github.com/quran/quran.com-frontend-next)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees

`/reading-goal` is a login-first onboarding wizard (`ReadingGoalOnboarding` from `src/components/ReadingGoalPage`) that walks through goal type (`ReadingGoalTypeTab`), amount (`ReadingGoalAmountTab`, with `VerseRangesList`/`VerseRangeInput` for range goals), schedule (`ReadingGoalTimeTab`) and a week preview (`ReadingGoalWeekPreviewTab`). `/reading-goal/progress` (15-line wrapper in `src/pages/reading-goal/progress.tsx`) renders `ReadingProgressPage`: a streak widget with a Sunday-starting 7-day timeline, a goal widget showing today's progress against the target, and a `ReadingHistory` month calendar with per-day stats and an "add reading" form for manual entries. Streak/goal cards are echoed on the home page (`HomePage/ReadingSection/StreakOrGoalCard`) and at the end of every surah (`QuranReader/EndOfSurahSection/StreakGoalCard`, with a dedicated `GuestStateCard`).

## 2. Architecture & key files

- Onboarding reducer: `src/components/ReadingGoalPage/hooks/useReadingGoalReducer.ts` — actions `SET_PAGES`, `SET_SECONDS`, `SET_RANGE`; goal types `GoalType.PAGES`, `GoalType.RANGE`, plus time-based seconds. (The brief's "verses" unit is not a distinct type in this reducer; ranges of verse keys are the granularity offered.)
- Single data hook: `src/hooks/auth/useGetStreakWithMetadata.ts` — computes the current week, builds `StreakWithMetadataParams { mushafId, from, to, type: StreakType.QURAN }` and SWR-fetches `makeStreakUrl()`; returns `{ streak, goal, activityDays, weekData, currentActivityDay }`.
- Progress UI: `src/components/ReadingProgressPage/*` (`ProgressPageStreakWidget`, `ProgressPageGoalWidget`, `ReadingHistory/DaysCalendar|MonthModal|AddReadingForm|ReadingStats`).
- Goal CRUD helpers: `src/utils/auth/apiPaths.ts` exposes `goal`, `goal/count`, `goal/status`, `goal/estimate` and `streak` endpoints.
- Editing: `src/components/ReadingGoal/UpdateReadingGoalModal`, `DeleteReadingGoalModal`.

## 3. Data flow

Raw activity originates in the reader: `src/components/QuranReader/hooks/useSyncReadingProgress.ts` queues visible verse keys and counts reading seconds only while the tab is focused (interval started on `focus`, cleared on `blur`). A `setInterval` flushes every `READING_DAY_SYNC_TIME_MS`, merging queued verse keys into contiguous ranges via `mergeVerseKeys` and POSTing an `UpdateActivityDayBody<QuranActivityDayBody> { mushafId, type: QURAN, ranges, seconds }`. The backend folds that into per-day activity; `useGetStreakWithMetadata` then derives display state client-side: `hasRead = pagesRead > 0 || secondsRead > 0 || ranges.length > 0 || manuallyAddedSeconds > 0`, and the week timeline labels days as "day N of streak" by subtracting the current weekday index from the streak count. `setLastReadVerse` is dispatched in parallel to Redux for the resume feature.

## 4. Storage & network

All authoritative state lives on the account backend, keyed by `mushafId` (derived from the user's quran font + `selectQuranMushafLines`, since page numbers differ per mushaf layout) and date strings from `dateToDateString`. The SWR key deliberately uses only `makeStreakUrl()` so any component can invalidate the shared cache after a reading sync ("we don't want to re-fetch... invalidate the cache after the user has read something" comment). `revalidateOnFocus: false` prevents redundant refetches. Nothing goal-related is persisted locally; guests get no tracker because both the sync effect and the SWR call are keyed off `isLoggedIn()`.

## 5. Why it is built this way ON THIS PLATFORM

Streaks must survive browser clears and multiple devices, so truth lives server-side and the web client stays a thin projection of it. Batching raw verse keys into ranges before upload minimizes payload size over mobile connections and matches how the backend models a "reading day". Mushaf-relative pages force the goal API to be parameterized by `mushafId` rather than absolute page numbers. The wizard-as-page pattern (with redirect-to-progress when `goal` already exists in `src/pages/reading-goal/index.tsx`) keeps each step shareable via URL (`?example=` prefill for logged-in users) while personal pages stay `noindex`/`nofollow`. Client-side derivation of "hasRead" avoids a second API round-trip for widget states reused across home, reader, and progress surfaces.

## 6. Edge cases & offline behavior

- Logged-out users hitting `/reading-goal` still see the onboarding skeleton flow (the page's own comment says login is intended); guest-specific copy exists at end-of-surah via `GuestStateCard`.
- Users who already have a goal are redirected to `/reading-goal/progress` with `router.replace`.
- Offline or mid-read disconnects lose at most one sync interval of activity (queued verse keys/seconds are in-memory refs); there is no local outbox, though a TODO in `useSyncReadingProgress.ts` contemplates localStorage buffering for later sync.
- Streak timeline numbering handles short weeks: if the streak exceeds elapsed weekdays, increment labeling starts at 1 (see `useGetWeekDayNames`).
- Manual history edits (`AddReadingForm` with `manuallyAddedSeconds`) patch past days without touching today's tracked session.
- If the progress page fetch errors, `ReadingProgressPage` returns `null` rather than partial widgets.
