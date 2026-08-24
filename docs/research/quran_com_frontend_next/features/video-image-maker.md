# Verse video and image maker
> How **Quran.com frontend (github.com/quran/quran.com-frontend-next)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- `/media` (`src/pages/media/index.tsx`): a Remotion Player previewing a verse video — background video, Arabic text with chosen font/scale/style, translation, border, colors, orientation (portrait/landscape) — above a settings panel (`src/components/MediaMaker/Settings/VideoSettings.tsx` with tabs for video, audio, text, colors, translation, border).
- A "Download / Share" section (`RenderControls/index.tsx`) with Download Video, Download Image, Copy Link buttons plus a monthly usage counter.
- A shareable "preview mode" URL that shows only the player with an autoplaying muted video and a "Generate your video" CTA.

## 2. Architecture & key files
- Entry page `src/pages/media/index.tsx` wires data + Remotion `Player` (`@remotion/player`) with composition component `PlayerContent` from `src/components/MediaMaker/Content/index.tsx`; `Root.tsx` and `index.ts` organize the folder; styling in `MediaMaker.module.scss`.
- Settings model: `useGetMediaSettings` hook (`src/hooks/auth/media/useGetMediaSettings.ts`) resolves defaults (reciter, translations) and exposes surah/verse range, `backgroundColor`, `opacity`, `borderColor/Size`, `fontColor`, alignments, `videoId`, font scales/styles, `orientation`, `previewMode`.
- Render pipeline UI: `RenderControls/RenderVideoButton.tsx`, `RenderImageButton.tsx`, `MonthlyMediaFileCounter.tsx`; render orchestration in `src/hooks/auth/media/useGenerateMediaFile.ts`.
- Server-side rendering assets: `scripts/media/deploy.mjs` deploys the Remotion Lambda function (`deployFunction`), S3 bucket (`getOrCreateBucket`) and bundle site (`deploySite`) using `REMOTION_AWS_REGION/RAM/DISK/TIMEOUT` env vars.

## 3. Data flow
- `getStaticProps` prerenders defaults once per locale/month (`revalidate: ONE_MONTH_REVALIDATION_PERIOD_SECONDS`; `notFound` + short revalidation on failure): default chapter verses (`DEFAULT_SURAH/DEFAULT_VERSE`), default reciter audio, reciter list, translations list, chapters data in current + English locales.
- Every settings change is mirrored into URL query params via `useAddQueryParamsToUrlSkipFirstRender(getQuranMediaMakerNavigationUrl(), queryParams)` — the full config (surah, verseFrom/To, reciter, translations, colors, borders, font scales, orientation, preview_mode) becomes the shareable state.
- Verses/audio refetch client-side through `useSWRImmutable` with static fallbackData, but only when inputs actually changed (`shouldRefetchVersesData`: translations/range/reciter/font changed; `shouldRefetchAudioData`: reciter or surah changed). Verse-range validity is checked against `chaptersData` (`isValidVerseKey`, `isValidVerseFrom/To`) before slicing audio timestamps via `getNormalizedTimestamps(audioData, VIDEO_FPS)`.
- `inputProps` feeds both the preview Player (`durationInFrames={getDurationInFrames(timestamps)}`, dimensions from `orientationToDimensions(orientation)`) and the Lambda render request.

## 4. Storage & network
- Media assets are prefetched before playback to kill Remotion player flicker: `prefetch(staticFile('/publicMin' + inputProps.video.videoSrc))` and the audio URL, using `method: 'base64'` on Chrome iOS else `'blob-url'` (per Remotion troubleshooting links in comments); readiness gates the controls behind spinners/poster.
- Rendering is fully server-side: `generateMediaFile({ ...inputProps, type })` POSTs to the auth API; for video it polls `getMediaFileProgress(renderId)` every second until `{ isDone, progress, url }`, then auto-clicks a download link; images return `url` immediately (client-side frame capture path in `RenderImageButton`). State machine statuses: INIT/INVOKING/RENDERING/ERROR/DONE.
- Quotas are enforced server-side and surfaced via `MonthlyMediaFileCounter` and `MediaRenderError.MediaFilesPerUserLimitExceeded` / `MediaVersesRangeLimitExceeded`; renders require login (`isLoggedIn()` check redirects through `getLoginNavigationUrl`).
- Share links call `shortenUrl` (`src/utils/auth/api.ts`) producing `/media/<short-id>` with `preview_mode=enabled`; on failure the full query-string URL is used.

## 5. Why it is built this way ON THIS PLATFORM
- Browsers cannot encode stylized video deterministically at scale, so the same React composition runs twice: locally in `@remotion/player` for WYSIWYG preview, and on Remotion Lambda (`scripts/media/deploy.mjs`) for the downloadable MP4/PNG — one source of truth for visuals.
- URL-as-state makes every creation shareable/indexable without server storage; the shortener just compresses long query strings.
- Heavy quirks are platform-specific workarounds: Safari gets a dedicated player-height class (`isSafari()`), Chrome iOS prefetches base64 because blob URLs misbehave there, and Safari's clipboard permission model forces the split "Generate Link" then "Copy Link" flow with a visible URL box and a 500ms polling fallback for URL changes.
- Autoplay policy compliance is explicit: in preview mode the player auto-plays muted after 100ms (`playerRef.current?.play(); .mute()`).

## 6. Edge cases & offline behavior
- Invalid ranges are validated client-side against chapter verse counts before audio/timestamp math, avoiding Lambda failures; render errors map to localized messages via `error.${code}` translation keys.
- Fetch/render failures raise toasts (`versesError || audioError` effect); quota-exceeded flips the button into a limit message instead of retrying.
- Offline, the prerendered shell still loads, but verses beyond the default range, background videos and Lambda rendering all require network; nothing about media generation works offline, and the PWA layer offers no special handling for it.
