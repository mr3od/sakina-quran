# Mushaf edition selector
> How **Quran for iOS (github.com/quran/quran-ios)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- A settings screen (`Features/ReadingSelectorFeature/Sources/ReadingSelectorViewController.swift` + `Sources/View/ReadingSelector.swift`) presenting three groups built in `ReadingSelectorViewModel.readingGroups`: an "Uthmani" group with five Hafs madani prints (`hafs_1405, hafs_1441, hafs_1440, hafs_1439, hafs_1421`), a "Tajweed" group with the color-coded edition, and an "IndoPak" group.
- Each row is a `ReadingInfo` with title/description/properties plus `NoorTag` badges: a "large-screen optimized" accent tag for the 1080/1440-width line-page prints and a red "experimental" tag for IndoPak (`ReadingSelectorViewModel.swift`, private `ReadingInfo.init`).
- Selecting an edition shows a determinate progress bar while its image set downloads (`@Published progress`), then the mushaf re-renders in that print; errors surface via `@Published error`.

## 2. Architecture & key files
- `Model/QuranKit/Sources/Reading.swift` — the whole feature's domain model: a raw-`Int` enum of 7 editions persisted through `Domain/ReadingService/Sources/ReadingPreferences.swift`. It derives per-edition facts: which `Quran` page model applies (`hafsMadani1405`, `hafsMadani1440`, or `hafsIndoPak` — five prints share one ayah-per-page mapping), the asset width (`imageAssetWidth`: 1920/1120/1352/1080/1440/1280/1342), whether line-page metrics exist (`linePageMetrics` for hafs_1439, hafs_1441, indoPak), chrome/divider/sideline flags, and whether images are inverted in dark mode (`usesInvertedQuranImageRenderingInDarkMode`).
- `Features/ReadingSelectorFeature/Sources/ReadingSelectorViewModel.swift` — `@MainActor ObservableObject`; writes selection to `ReadingPreferences.shared.reading` and observes two AsyncSequences: preference changes and `ReadingResourcesService.publisher` resource events.
- `Domain/ReadingService/Sources/ReadingResourcesService.swift` + `ReadingResourceDownloader.swift` — the download/unzip/cleanup engine feeding `ResourceStatus { downloading(progress), ready, error(NSError) }`.

## 3. Data flow
1. User taps a row → `showReading(_:)` sets `preferences.reading`; nothing else is imperative.
2. `listenToReadingChanges()` consumes `$reading.prepend(...)` and updates `selectedReading`; every other observer in the app (content view models, downloads screens) reacts to the same preference.
3. `listenToResourcesEvents()` mirrors service status into `progress`/`error`. The service's `loadResource(of:)` asks `ReadingResourceDownloader.download(_:onProgressChange:)`, which submits a single-file `DownloadBatchRequest(url: remoteResource.url, destination: remoteResource.zipFile)` to the shared BatchDownloader `DownloadManager`.
4. If the same zip is already downloading it re-attaches instead of duplicating ("e.g. waking up from background" comment), streams progress, then `unzipFileIfNeeded` extracts and `removePreviouslyDownloadedResources(exclude:)` deletes other editions' assets.
5. Switching away cancels competing edition downloads via `cancelDownload(exclude:)`.

## 4. Storage & network
- Assets live under width-scoped folders computed by `Reading.ayahInfoDatabase(in:)` / `imagesDirectory(in:)`: `images_<width>/databases/ayahinfo_<width>.db` (word/line geometry) and `images_<width>/width_<width>/` (page JPEGs). Edition = width + layout db; three editions additionally need line-page metric databases (`LinePageMetrics.madaniLinePages(widthParameter:)`, `.indoPakLinePages`).
- Downloads reuse the persisted batch engine (`Data/BatchDownloader`), so an interrupted mushaf zip resumes/reconciles after relaunch like any other download.
- Verse text needs no per-edition download when editions share a `Quran` model; only IndoPak's differing pagination pulls in new geometry.

## 5. Why it is built this way ON THIS PLATFORM
- Page-faithful rendering means each print is just a pre-rendered image set plus a geometry DB at a known pixel width; "switching editions" is therefore an asset-set swap keyed by an integer width, not a text-layout change — cheap, offline-safe, and pixel-exact across devices.
- Encoding every edition difference as pure data on the `Reading` enum (widths, line-page metrics, dark-mode inversion flags) keeps rendering code edition-free and lets any target in the SPM package consume it without UI.
- Selection is a UserDefaults-backed preference observed via Combine→AsyncSequence, so the change propagates app-wide without notifications or delegates, matching the repo's `start()`-loop convention.
- Line pages exist only where the print's pagination can't be derived from the standard 604-page Hafs grid (IndoPak experimental, two high-res madani prints), which is why they carry the "experimental"/"optimized" tags.

## 6. Edge cases & offline behavior
- A previously downloaded zip is recovered without re-downloading (`recoverDownloadedResourceIfNeeded`) before hitting the network; once assets exist, reading works fully offline.
- Only one edition's assets are kept: `removePreviouslyDownloadedResources(exclude:)` prunes old sets after a successful switch, bounding disk usage.
- Download failures map to `.error(NSError)` → the row shows the error and offers `retry()`; cancellation of the current edition is skipped when excluding the newly selected one so an in-flight switch isn't killed by its own cleanup.
- Not verified within budget: how the first-launch default edition is seeded and what happens if the user picks IndoPak while its line-page DB fails to install (the failure path exists in `ResourceStatus.error` but the content-side degradation was not traced).
