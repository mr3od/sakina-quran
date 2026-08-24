# Learning plans and courses

> How **Quran.com frontend (github.com/quran/quran.com-frontend-next)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees

`/learning-plans` is a public catalog of course cards (`CoursesList` renders `Card`s with pills and "coming soon" placeholders to keep the grid at `MIN_COURSES_COUNT = 6`). A course page at `/learning-plans/[slug]` shows details with an enroll/continue header (`CourseDetails/StatusHeader`) and lesson list; `/learning-plans/[slug]/lessons/[lessonSlugOrId]` renders lesson content (`LessonHtmlContent`, quizzes, flash cards under `src/components/Course/LessonView`). `/my-learning-plans` lists the user's enrolled plans behind the `withAuth` HOC. Inside the Quran reader, a wide promotional banner (`LearningPlanBanner`) nudges readers toward a language- and chapter-matched plan.

## 2. Architecture & key files

- Pages: `src/pages/learning-plans/index.tsx`, `[slug]/index.tsx`, `[slug]/lessons/[lessonSlugOrId]/index.tsx`, `src/pages/my-learning-plans/index.tsx`.
- Shared layout: `src/components/Course/CoursesPageLayout/index.tsx` — one component serves both catalog (`isMyCourses=false`) and "my plans" by passing `queryKey={makeGetCoursesUrl({ myCourses, languages: [lang] })}` into SWR with the server-provided response as fallback, then rendering `CoursesList` with infinite scroll (`useCoursesList`, `sentinelRef`, `hasNextPage`).
- Enrollment: `src/utils/auth/useCourseEnrollment.ts` wraps `enrollUser()` (`POST makeEnrollUserUrl()` → `courses/enroll` in `src/utils/auth/apiPaths.ts`) and patches SWR caches via `updateCourseEnrollmentCache`.
- Lesson completion/feedback: `LessonView/ActionButtons/CompleteButton.tsx`, `makeCourseFeedbackUrl(courseId)` for ratings.
- Reader banner: `src/components/QuranReader/LearningPlanBanner/index.tsx` + `learningPlanBannerConfigs.ts`.

## 3. Data flow

Catalog and course data come from the authenticated quran.com API v4 backend: `getCourses(params)` / `getCourse(slug)` via `privateFetcher` on `courses` and `courses/{slugOrId}`, plus `courses/{id}/lessons/{id}`. A course object carries `lessons[]` and `continueFromLesson`; opening a lesson page whose `lesson.course.isUserEnrolled` is false fires an automatic enrollment (`enroll(lesson.course.id, EnrollmentMethod.AUTOMATIC)` in the lesson page's effect), while the status-header button uses `EnrollmentMethod.MANUAL`. Completing a lesson calls `markLessonAsCompleted(id, onSuccessToast)`. `StartOrContinueLearning` routes to `continueFromLesson || lessons[0].slug`, explicitly working around a stale-cache corner case where `continueFromLesson` is undefined because the course was cached pre-enrollment. The reader banner is fully static config: `getLearningPlanBannerConfig(language, chapterId)` resolves slug/image/i18n keys or returns null.

## 4. Storage & network

No client-side persistence is involved; enrollment and progress live entirely server-side keyed to the account, fetched through SWR so caches can be surgically mutated after enrollment instead of refetched. The API is locale-aware — both layouts pass `languages: [lang]` so users only see plans produced for their UI language. SEO differs per surface: the catalog gets canonical + href-language alternates and a generated OG image (`getLearningPlansImageUrl` from `src/lib/og`), while personal pages are `noindex`/`nofollow`. Brief correction: course content flows through this authenticated API, not Sanity CMS; also there is no true guest enrollment — see below.

## 5. Why it is built this way ON THIS PLATFORM

As a web property, learning plans double as SEO landing pages, so the catalog is statically rendered with per-locale OG images while personalization stays client-side. Auto-enrollment on lesson open removes a signup wall mid-content: a visitor arriving from search can start lesson one immediately, and the backend records intent (`AUTOMATIC` vs `MANUAL`) for funnel analytics — every CTA is instrumented with `logButtonClick('course_enroll' | 'continue_learning', ...)`. Server-side lesson progress replaces any local storage need and lets progress follow the user across devices, consistent with how bookmarks and settings sync. The static banner config (rather than CMS-driven targeting) keeps the reader bundle free of extra fetches and makes placements reviewable in code.

## 6. Edge cases & offline behavior

- Guests cannot enroll server-side: `useCourseEnrollment.enroll` returns `undefined` when `!isLoggedIn()`, and `CompleteButton` redirects to `getLoginNavigationUrl(encodeURIComponent(router.asPath))` so users return to the lesson after sign-in.
- A `CourseNotEnrolled` API error triggers redirect back to the course page (`renderError` in the lesson page).
- Stale SWR cache after enrolling is handled explicitly (`StartOrContinueLearning` comment) by falling back to the first lesson.
- Enrollment failures are reported to Sentry (`logErrorToSentry` with courseId/method metadata) and surfaced as `{ success: false }`.
- Empty "my plans" state shows guidance linking back to the full catalog; sparse catalogs pad with placeholder cards.
- Offline behavior is limited to next-pwa runtime caching of already-fetched responses; lessons are HTML/media pages with no offline package, and quiz/feedback actions simply fail when disconnected.
