# Quranic calendar yearly program
> How **Quran.com frontend (github.com/quran/quran.com-frontend-next)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- A `/calendar` page (`src/pages/calendar/index.tsx`) structured as: hero (`QuranicCalendarHero`) showing the current Hijri date and week number, then "read this week's verses" (`WeeklyVerses`) with the fixed portion range and chapter names, `AdditionalResources`, a month-by-month progress carousel/grid (`MyProgress`), and an FAQ.
- The weekly portion links straight into the reader (e.g. via `getQuranicCalendarRangesNavigationUrl(weekRanges)` in `WeeklyVerses/ActionButtons.tsx`) alongside a PDF download; each week has a "mark as completed" toggle button.
- `MyProgress` renders 12 lunar months as desktop rows of three or a mobile carousel, with each week flagged completed / active / passed, plus Ramadan appended as a terminal month with no weeks.

## 2. Architecture & key files
- Page: `src/pages/calendar/index.tsx` + `calendar.module.scss`; components under `src/components/QuranicCalendar/{QuranicCalendarHero,WeeklyVerses,MyProgress,AdditionalResources,FAQ,types}`.
- Data hooks: `src/hooks/auth/useGetQuranicProgramWeek.ts` (week content) and `src/hooks/auth/useGetUserQuranProgramEnrollment.ts` (subscription + `completedWeeks`).
- Static plan: `src/data/quranic-calendar.json` imported directly by `MyProgress/useMonthsData.ts`; week math in `src/utils/hijri-date.ts` using `@umalqura/core`.
- Program identity is a single constant: `QURANIC_CALENDAR_PROGRAM_ID = '1'` in `src/utils/auth/constants.ts`. OG image comes from `getQuranicCalendarOgImageUrl` in `src/lib/og`.

## 3. Data flow
- Current week is computed client-side: `umalqura()` gives today's Hijri date, `getCurrentQuranicCalendarWeek` maps it to a week by comparing against cached UTC start/end timestamps per week — deliberately building the comparison timestamp via `Date.UTC(local Y/M/D)` so non-UTC timezones don't drift a day. If no bucket matches it returns `weekEntries.length` behind a "TODO: reset back again to 0" comment.
- Week content arrives via SWR (`swr/immutable`) in `useGetQuranicProgramWeek`, calling authenticated `privateFetcher(makeGetQuranicWeekUrl(programId, weekId))` from `src/utils/auth/api.ts`; the page falls back to the hardcoded range `'1:1-2:1'` if the response has none.
- Progress is server truth: `useGetUserQuranProgramEnrollment` returns `completedWeeks` only when `isLoggedIn()` (the SWR key is null otherwise). `useMonthsData` decorates each JSON week with `isCompleted / isActive / hasPassed`.
- Marking complete (`WeeklyVerses/index.tsx onMarkAsCompletedClick`) posts `updateActivityDay({type: ActivityDayType.QURAN_READING_PROGRAM, programId, weekNumber})`, then `mutate()`s the enrollment hook and shows a success/error toast.

## 4. Storage & network
- No local persistence for calendar progress at all — everything lives in the account backend. Anonymous users who click "mark as completed" are redirected to login (`getLoginNavigationUrl(getQuranicCalendarNavigationUrl())`), preserving return context.
- The only bundled data is the year's static JSON plan and chapters metadata from `getStaticProps`; verse-range content, resources, and completion state all require API v4 / auth endpoints.
- A `GUEST_ENROLLMENT` key still appears in the store whitelist of `src/redux/store.ts`, but no reducer registers that slice (only `SliceName.ts` and the whitelist reference it) — a leftover from a guest-progress design that was replaced by the login-gated flow.
- Streak/engagement side effects ride along through the same `updateActivityDay` mechanism rather than a calendar-specific endpoint.

## 5. Why it is built this way ON THIS PLATFORM
- Progress must be cross-device for logged-in users, so the web app leans on its account backend instead of localStorage — consistent with how preferences sync elsewhere via `usePersistPreferenceGroup`.
- Shipping the yearly curriculum as a committed JSON file makes the whole schedule renderable offline and SSR-friendly while the mutable parts (which weeks you finished) stay remote; it also lets content editors change the plan in one commit without CMS plumbing.
- Deriving the current week from Umm al-Qura Hijri arithmetic client-side avoids a server round-trip for "what week is it", at the cost of shipping a small date library and carrying timezone-normalization code in `hijri-date.ts`.
- Deep-linking each portion to a normal reader route (and a PDF) reuses all existing reader features — translations, tafsir, audio — instead of duplicating a reading view inside the calendar page.

## 6. Edge cases & offline behavior
- Offline, the page shell, hero, month grid, and JSON-derived week numbers still render; only the week's verse content and completion flags fail (SWR error state), and marking complete surfaces a generic error toast.
- Double-completion is guarded (`else if (!isCompleted)`) and the button switches to a completed style; `isMarkingAsCompleted` disables it during flight.
- The unmatched-date fallback returning the last week entry means users at year boundaries see the final portion rather than nothing — explicitly flagged as temporary in source.
- SEO is treated seriously for a marketing-style page: `NextSeoWrapper` with canonical URL, hreflang alternates, and a generated 1200×630 OG image per locale.
