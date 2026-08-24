# Per-verse Copy, Link and Embed Actions
> How **Quran.com frontend (github.com/quran/quran.com-frontend-next)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- Every verse (in reading view, translation view, and study mode) exposes an overflow menu — `src/components/Verse/OverflowVerseActionsMenuBody/index.tsx` — whose items include Advanced Copy, Embed Widget, Repeat Audio, Pin Verse, Translation Feedback, Word-by-Word actions, and a nested Share submenu (`ShareVerseActionsMenu`).
- Advanced Copy opens a full modal where users pick a verse range (`VersesRangeSelector.tsx`) and get text assembled from Arabic plus whichever translations they currently subscribe to, with a copy button that flips to "Copied to clipboard".
- The Share submenu offers platform buttons plus a plain copy-link action; Translation Feedback opens a modal with a translation picker (`TranslationSelect.tsx`), a preview of the current rendering (`TranslationPreview.tsx`) and a validated feedback form.
- Embed Widget jumps to `/embed?verses=2:255`, the standalone widget-builder page whose output can be iframed elsewhere.

## 2. Architecture & key files
- Menu items are intentionally thin: `src/components/Verse/VerseActionAdvancedCopy/index.tsx` contains no copying logic at all — its only job is `dispatch(openAdvancedCopyModal({verseKey, verse, isTranslationView, wasOpenedFromStudyMode, studyModeRestoreState}))`. The actual modal is rendered centrally by a `VerseActionModalContainer` driven by the `verseActionModal` Redux slice.
- The real composition logic lives in `src/components/Verse/AdvancedCopy/VerseAdvancedCopy.tsx`: it reads `selectSelectedTranslations` from Redux (compared with `areArraysEqual`), filters `availableTranslations` by UI language, builds the copied payload per translation, and tracks `isCopied` for button-state feedback; range selection is factored into `VersesRangeSelector`.
- `src/components/Verse/VerseActionEmbedWidget/index.tsx` parses `verse.verseKey` ("2:255" → surah/ayah numbers) and performs `navigateToExternalUrl('/embed?verses=2:255')`, prefixing the locale path for non-English locales (empty string for `en`).
- Sharing primitives live in the design system: `src/components/dls/ShareButtons/index.tsx` wraps react-share's `FacebookShareButton` / `TwitterShareButton` and uses the tiny `clipboard-copy` package for both URL copy (line ~87) and embed-code copy (line ~119).
- Feedback flow files sit in `src/components/Verse/TranslationFeedback/` (`TranslationFeedbackAction.tsx`, `TranslationFeedbackModal.tsx`, `useTranslationFeedbackForm.ts`, `validation.ts`, plus dedicated `logging.ts`).

## 3. Data flow
- Open menu → click item → two possible transports: Redux modal dispatch (advanced copy, repeat audio, pin, feedback) or direct navigation/embed code generation (embed widget, share).
- Because modals are global Redux state rather than local component state, any verse action survives unmounting of the verse row, and exactly one action modal exists at a time; the slice also carries `previousModalType` chaining used by bookmark→note flows.
- Study-mode awareness is explicit: `wasOpenedFromStudyMode = isInsideStudyMode || (isStudyModeOpen && !isSsrMode)` with a captured `studyModeRestoreState {verseKey, activeTab, highlightedWordLocation, isSsrMode}` so closing the modal restores the exact word/tab context on SSR-rendered pages.
- Advanced copy reads current reader preferences (selected translations) directly from Redux instead of accepting them as props, guaranteeing the copied output matches what the user sees.
- Embed generation is fully client-side URL construction — no API call is needed to create a widget; the target page interprets the query params.

## 4. Storage & network
- Clipboard writes use the `clipboard-copy` library (which abstracts over the async Clipboard API with fallbacks), not `navigator.share` in the components read here; share buttons delegate to react-share's anchor-based flows.
- No persistence: none of these actions write to localStorage or Redux-persisted slices beyond ephemeral modal state in `verseActionModal.ts` (not persisted).
- Network usage is limited to fetching translations for the copy payload via existing SWR caches; the embed route itself lives under `src/pages/embed/` (`index.tsx`, `ayah.tsx`, `v1.tsx`, `[...slug].tsx`) as separately renderable pages intended for iframe consumption.
- Translation feedback POSTs user-submitted corrections through the authenticated API helpers, with per-event analytics names defined in `TranslationFeedback/logging.ts`.

## 5. Why it is built this way ON THIS PLATFORM
- URLs are the web's universal sharing primitive: "copy link", "share", and "embed" all reduce to producing or delegating to canonical URLs, which is why embed-widget creation needs zero backend — the iframe page *is* the product, and SSR makes those embeds crawlable and fast.
- Centralizing action modals in Redux matches a page where verses are virtualized/recycled in long lists: menu items stay cheap, and modal ownership never depends on a mounted row.
- Copying must respect the reader's own settings (font-independent plain text, chosen translations), so deriving content from the same Redux selectors that render the screen avoids "copy doesn't match what I see" bugs.
- Analytics strings are view-prefixed (`translation_view_...` vs `reading_view_...` via `logEvent`/`logButtonClick`) because the same feature ships in two distinct layouts with different UX assumptions — instrumentation is part of the component contract.
- RTL is handled at the icon level (`shouldFlipOnRTL={false}` on clipboard/code icons) inside the shared DLS popover primitives.

## 6. Edge cases & offline behavior
- Copying works offline once translations are cached (SWR + Workbox runtime caching of API responses per `pwa-runtime-config.js`); share buttons degrade to whatever each network allows since they are plain links.
- Empty selection states are guarded: the copy builder skips translations with no selected ids (`selectedTranslations.length !== 0` branch), and range validation lives in `VersesRangeSelector`.
- The embed action hard-splits `verseKey` on ":" and re-encodes it with `encodeURIComponent`, tolerating locale-prefixed routing but assuming well-formed verse keys produced upstream.
- SSR correctness is explicitly engineered: study-mode flags distinguish client-opened menus from SSR-mode defaults (`isSsrMode`) so restore state isn't fabricated during hydration.
