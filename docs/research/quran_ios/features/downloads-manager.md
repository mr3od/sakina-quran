# Download manager for audio and translations
> How **Quran for iOS (github.com/quran/quran-ios)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- A Downloads screen listing every reciter with its downloaded footprint (`AudioDownloadedSize` carries `downloadedSizeInBytes`, `downloadedSuraCount`, `surasCount` — `Model/QuranAudio/Sources/AudioDownloadedSize.swift`), a per-reciter progress bar while a full recitation downloads, swipe/cancel while running, and an edit mode for deletion.
- A parallel Translations screen (`Features/TranslationsFeature/Sources/TranslationsListView.swift`) that merges the remote translation catalog with locally installed packs, lets users download, cancel, delete, reorder, and select which translations are active (`moveSelectedTranslations(at:to:)`, `selectTranslation(_:)`/`deselectTranslation(_:)`).
- Both screens show errors via a shared `@Published error` toast pattern and keep rows visible-but-optimistically-hidden during deletion.

## 2. Architecture & key files
- `Features/AudioDownloadsFeature/Sources/AudioDownloadsViewModel.swift` — injects `ReciterAudioDeleter`, `QuranAudioDownloader`, `ReciterSizeInfoRetriever`, `ReciterDataRetriever`; builds a generic `DownloadsObserver<Reciter>` whose `extractKey` closure maps a batch to its reciter via destination-path matching.
- `Features/TranslationsFeature/Sources/TranslationsListViewModel.swift` — same shape with `TranslationDeleter` + `TranslationsDownloader` and a `DownloadsObserver<Translation>`; also owns the remote catalog fetch (`loadFromServer()` vs `loadLocalTranslations()`).
- The engine is `Data/BatchDownloader/Sources/Downloader/DownloadManager.swift`: a `Sendable` class holding a `DownloadBatchDataController` (enforces `maxSimultaneousDownloads`, owns persistence), a `DownloadSessionDelegate`, and a lazily created URLSession. Domain wrappers (`QuranAudioDownloader`, `TranslationsDownloader`) translate domain entities into `DownloadBatchRequest`s of `DownloadRequest(url:destination:)`.
- `DownloadsObserver.swift` is the bridge back to SwiftUI: it converts batch progress into an AsyncSequence publisher keyed by domain entity, plus `showError`.

## 3. Data flow
- `start()` fans out into three concurrent loops: `observeRunningDownloads()` re-attaches to batches already in flight at launch; `observeReadingChanges()` watches `ReadingPreferences.shared.$reading` (audio sizes depend on which mushaf/Quran model is active); `observeProgressChanges()` consumes `downloadsObserver.progressPublisher.values()`.
- On each progress tick the view model diffs old vs new keys: added/removed reciters trigger `reloadDownloadedSize(of:)`; continuing reciters only reload size when `enoughProgressPassedForReloadSizeInfo` fires (floor(progress × 2000) advancing), throttling expensive disk scans to ~1/2000th increments.
- Starting a download is one call: `ayahsDownloader.download(from: quran.firstVerse, to: quran.lastVerse, reciter:)` returns a `DownloadBatchResponse` whose `progress` AsyncSequence drives everything else. Deletion returns an `AsyncAction` closure so the UI controls when the async delete runs while `pendingDeletionIDs` hides the row immediately.

## 4. Storage & network
- Download state persists in SQLite via `Data/BatchDownloader/Sources/Downloader/GRDBDownloadsPersistence.swift` (the default `persistence:` in `DownloadManager.init`), so in-flight batches survive process death and backgrounding; `getOnGoingDownloads()` restores them.
- Files land at explicit destinations derived from domain models (reciter folders under the audio base URL; translations as one SQLite DB each); audio matching between a batch and a reciter is purely path-based — `Reciter.matches(_ request:)` compares `localFolder()` with `request.destination.deletingLastPathComponent()`.
- One shared URLSession created in `DownloadManager.start()` uses a serial delegate queue (`com.quran.downloads`, maxConcurrentOperationCount 1) over the injected `URLSessionConfiguration` (background config from the app's `Container.swift`), with `setBackgroundSessionCompletion` wired for iOS background-completion callbacks.

## 5. Why it is built this way ON THIS PLATFORM
- iOS kills long network transfers when the app backgrounds unless a background `URLSession` is used; the persisted-batch design means the app can be relaunched later and simply re-observe `getOnGoingDownloads()` instead of restarting work.
- A single engine for recitations, translations, and mushaf image sets keeps concurrency policy (max simultaneous downloads) and resume semantics in one audited place — important because a full recitation is hundreds of files.
- Path-based identity (URL → fixed local destination) avoids a separate download-to-entity mapping table and makes "is this downloaded?" checkable synchronously with `fileSystem.fileExists`.
- The `DownloadsObserver<Key>` generic lets thin SwiftUI view models stay `@MainActor`-simple while all URLSession delegate threading stays inside BatchDownloader.

## 6. Edge cases & offline behavior
- Everything already on disk works offline by construction; `download(...)` filters out reachable local files so resuming skips completed parts.
- Failed start attempts roll back optimistic state: `startDownloading(_:)` removes the reciter from `progress` on throw, records the error with `crasher.recordError`, and surfaces it to the UI.
- Deleting a downloading reciter first cancels its batch (`deleteReciterFiles` awaits `cancelDownloading`) before removing files, then resets size to `.zero(quran:)`; duplicate deletes are no-ops thanks to `pendingDeletionIDs.insert`.
- Switching mushaf editions invalidates cached size info (`update(with: quran)` clears `sizes` and recomputes) because verse counts differ per Quran model.
