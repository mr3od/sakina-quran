# Embeddable ayah widget builder
> How **Quran.com frontend (github.com/quran/quran.com-frontend-next)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- A builder page at `/embed` (`src/pages/embed/index.tsx`, `AyahWidgetBuilderPage`) with a config form (`BuilderConfigForm.tsx`) beside a live preview (`BuilderPreview.tsx`): pick surah/ayah range, translations grouped by language, reciter/audio, theme (light/dark/sepia/auto), mushaf font, word-by-word display, custom size.
- A generated iframe snippet pointing at `https://quran.com/embed/v1?...` with an optional companion `<script src=".../widget/embed-widget.js">` resizer tag, copied to clipboard.
- Third-party sites end up hosting a self-contained verse card with header, Arabic + translations, and footer actions (copy/share/audio).

## 2. Architecture & key files
- Widget rendering core: `src/components/AyahWidget/QuranWidget.tsx` composes `WidgetHeader`, `WidgetContent`, `WidgetFooterActions`, styled inline from options via `widget-utils.ts` (`getColors`, `getContentPadding`, `getTajweedFontPalette`).
- URL/query contract: `queryParsing.ts` (`parseVersesParam`, `parseString`, `parseBool`, `parseNumber`) and defaults/types in `widget-defaults.ts`, `widget-types.ts`, `builder/types.ts`.
- Snippet generation: `widget-embed.ts` (`buildEmbedSnippet`, `buildSimpleEmbedSnippet`, `resolveEmbedBaseUrl`, `resolveEmbedScriptSrc`).
- Routes: `src/pages/embed/index.tsx` (builder), `embed/v1.tsx` (SSR widget frame), `embed/[...slug].tsx` (redirect shim), `embed/ayah.tsx` (re-exports the builder page). Resizer script is a static asset at `public/widget/embed-widget.js`.
- Server data assembly: `getAyahWidgetData.ts` (873 lines) — validation (`WidgetInputError`, `MAX_RANGE_SPAN = 10`, default verse `33:56`, default reciter Mishary Alafasy id `7`) and parallel QDC fetches.

## 3. Data flow
- Builder resolves base defaults from QDC (theme/locale/mushaf/wbw), layers persisted Redux overrides on top (`src/redux/slices/ayahWidget.ts`, selectors `selectAyahWidgetOverrides` / `updateAyahWidgetOverrides`, seeded from reader preferences slices like `selectQuranFont`, `selectSelectedTranslations`), then stores only a minimal diff patch built by `buildOverridesFromDiff`.
- Option lists come from dedicated hooks: `useAyahWidgetSurahs`, `useAyahWidgetTranslations`, `useAyahWidgetReciters`, `useAyahWidgetPreview`.
- On the embed side, `v1.tsx#getServerSideProps` parses query params, validates them, generates a `randomUUID()` `embedViewId` from the request's `referer`/`origin` header (per-impression analytics), and calls `getAyahWidgetData`, which uses the shared `fetcher` from `src/api.ts` plus `getChapterAudioData` to fetch verses, chapter metadata, translation metadata and word-by-word data before HTML reaches the iframe.
- `QuranWidget` trims verses via `applyWidgetTrimToVerses`, converts mushaf option through `getQuranFontForMushaf`, loads QCF fonts with `useQcfFont`, and attaches interaction handling with `useWidgetInteractions`. Copy support is data-driven: the whole payload is serialized into a `data-copy-data` attribute.

## 4. Storage & network
- Builder state persists locally as a small Redux override patch (part of redux-persist's whitelisted slices), not a full snapshot — so shipped snippets stay short and defaults can evolve server-side without breaking old embeds.
- Embed frames are fully server-rendered per request (`getServerSideProps` in `v1.tsx`) because arbitrary URL params must map to fresh QDC data; no cache headers were observed in the section read.
- Height sync is message-based: `src/hooks/widget/useEmbedAutoResize.ts` measures with `ResizeObserver` and does `window.parent.postMessage({ type: RESIZE_MESSAGE, height }, '*')`; `public/widget/embed-widget.js` listens for messages, matches `iframe[data-quran-embed="true"]` or `iframe[src*="/embed/v1"]`, and writes the iframe height.
- Optional playback uses a plain hidden `<audio>` element rendered when `options.enableAudio && audioUrl`, with `data-audio-start/end` attributes.

## 5. Why it is built this way ON THIS PLATFORM
- iframes are the only safe cross-site embedding primitive on the web, so the widget is a real Next.js route with its own document; SSR guarantees crawlers and slow hosts see complete verse text without CORS or JS-dependency issues.
- Fixed pixel font sizes are injected as an inline `<style>` block (`getWidgetFontStyles()` with `!important` rules scoped under `.quran-widget`) because host-page CSS would otherwise bleed into the iframe-less widget or fight responsive sizes; a `@media (max-width: 420px)` block handles small embed slots.
- Theming is passed as CSS custom properties (`--color-text-faded`, `--color-text-link`) and a `data-theme` attribute so the widget reuses the site's DLS tokens inside someone else's page.
- `[...slug].tsx` exists purely for friendly shareable paths: it validates `${chapter}:${versePart}` server-side and 301-style redirects to `/embed?verses=...`, keeping one canonical query-string implementation.

## 6. Edge cases & offline behavior
- Invalid input never crashes the frame: `parseVersesParam` throws `WidgetInputError` (range span capped at 10 ayat), which `v1.tsx` turns into an error prop and `[...slug].tsx` turns into a redirect to `/embed`.
- Empty trimmed verse lists render an empty `<div />` rather than broken chrome (`QuranWidget.tsx`).
- Auto-resize posts to `"*"` (any parent origin), trading strictness for universal host compatibility; the resizer script tolerates missing iframes by matching on message source.
- Offline behavior is whatever next-pwa's generic caches provide — no widget-specific offline strategy was found within budget.
