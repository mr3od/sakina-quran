# Audio recitation playback
> How **Quran for iOS (github.com/quran/quran-ios)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- A slim banner docked above the mushaf page (`Features/AudioBannerFeature/Sources/AudioBannerView.swift`) with play/pause, stop, step-forward/backward, a reciter button, and a progress ring while assets download. State machine `AudioBannerState` renders `.readyToPlay(reciter:)`, `.playing(paused:rate:)`, or `.downloading(progress:)`.
- Tapping play starts recitation at the first verse of the currently visible page and continues to the end of the surah (`AudioBannerViewModel.playStartingCurrentPage()` uses `listener?.visiblePages.min()`); a toast "Playing from X to Y" carries a **Modify** action that opens the advanced options sheet.
- The reciter sheet (`Features/ReciterListFeature/Sources/ReciterListViewModel.swift`) sections reciters into Recent, Downloaded, English, and Arabic lists.
- The advanced sheet (`Features/AdvancedAudioOptionsFeature/Sources/AdvancedAudioOptionsViewModel.swift`) exposes verse range (end at sura/juz/page/Quran — `Model/QuranAudio/Sources/AudioEnd.swift` has exactly `sura, juz, page, quran`), verse-repeat and list-repeat counts, verse delay (0–2x verse duration, `Core/QueuePlayer/Sources/VerseDelay.swift`), repetition delay, and playback rate. Lock-screen/Control-Center controls mirror play/pause/toggle/next/previous.

## 2. Architecture & key files
- `Features/AudioBannerFeature/Sources/AudioBannerViewModel.swift` — `@MainActor` `ObservableObject`; constructor-injected `QuranAudioPlayer`, `QuranAudioDownloader`, `ReciterDataRetriever`, `RecentRecitersService`, plus `ReciterListBuilder`/`AdvancedAudioOptionsBuilder` for child sheets. Talks to the page UI through the `AudioBannerListener` protocol (`visiblePages`, `highlightReadingAyah(_:)`) instead of a direct reference.
- `Domain/QuranAudioKit/Sources/AudioPlayer/QuranAudioPlayer.swift` — thin domain facade over `Core/QueuePlayer`'s `QueuingPlayer`; picks `GappedAudioRequestBuilder` or `GaplessAudioRequestBuilder` from `reciter.audioType`, builds a `QuranAudioRequest` with `verseRuns`/`listRuns`/delays, and owns `NowPlayingUpdater` for `MPNowPlayingInfoCenter`.
- `Features/AudioBannerFeature/Sources/RemoteCommandsHandler.swift` — wraps an injected `MPRemoteCommandCenter` (test seam), registers 5 commands, and explicitly disables 10 unused ones (seek, skip, rating, like, changePlaybackPosition…). `deinit` re-enables nothing: it disables all commands in a detached `Task`.
- Repetition primitives (`Runs.finite(Int)`/`.indefinite`, `VerseDelay`, `RepetitionDelay`) live in `Core/QueuePlayer/Sources/`, so the player engine, not the view model, owns loop timing.

## 3. Data flow
1. `play(from:to:repeatVerses:)` → private `play(...)` computes the end ayah with `PreferencesLastAyahFinder.findLastAyah(startAyah:)`, stores `audioRange`, and records the reciter in `RecentRecitersService`.
2. Inside a `cancellableTasks.task`: if `AudioPreferences.shared.streamingEnabled` and the reciter is `.gapless`, the timing DB is guaranteed locally first (`downloader.databaseDownloaded(reciter:)` → `downloadDatabase` + `observe`); if streaming is off and files are missing, `downloader.download(from:to:reciter:)` runs to completion before playback.
3. `audioPlayer.play(...)` builds the request and calls `player.play(request:rate:)`. `QueuePlayerActions.audioFrameChanged(fileIndex:frameIndex:playerItem:)` is mapped back through `audioRequest.getAyahNumberFrom(fileIndex:frameIndex:)` into an `AyahNumber`, which flows to `actions.playing` → `listener.highlightReadingAyah` and `crashContext.setPlayingAyah`.
4. `playbackRateChanged` treats rate > 0.1 as "resumed", else "paused" — the single source of truth for pause state comes from the player, not the UI. `playbackEnded` clears now-playing info, nils `player.actions`, and returns the banner to `.stopped` (which re-enables only the play command).

## 4. Storage & network
- Gapped reciters are per-ayah audio files; gapless reciters are archives plus a timing database downloaded as a single `.zip` and extracted by `AudioUnzipper` (`QuranAudioPlayer.play` calls `unzipper.unzip(reciter:)` before building the request).
- `Domain/QuranAudioKit/Sources/Downloads/QuranAudioDownloader.swift` derives the exact file list via `reciter.audioFiles(baseURL:from:to:)`, filters out already-present files, and submits a `DownloadBatchRequest` to the shared `Data/BatchDownloader` `DownloadManager`.
- Preferences (`AudioPreferences.shared` — playback rate, streaming on/off, verse/repetition delays, last reciter id) are UserDefaults-backed via `Core/Preferences`; `$playbackRate` is piped into the view model with `assign(to: &$playbackRate)`.

## 5. Why it is built this way ON THIS PLATFORM
- iOS background audio requires an AVFoundation session plus `MPRemoteCommandCenter`/`MPNowPlayingInfoCenter` integration; the code isolates both behind injectable wrappers (`RemoteCommandsHandler`, `NowPlayingUpdater`) so the SPM library targets stay testable without MediaPlayer.
- Continuous playback across page boundaries is implemented as a pre-built queue of `AudioRequest` files rather than ad-hoc item appends, because the app must also translate file/frame indices back into ayah numbers for mushaf highlighting.
- Streaming-vs-download is a user preference, but gapless recitation cannot stream without its timing DB — hence the explicit "download DB first, then stream" branch in `play(...)`.
- The banner is a feature target with a Builder and a listener protocol, consistent with the package's per-screen SPM targets and UIKit navigation.

## 6. Edge cases & offline behavior
- If the stored `lastSelectedReciterId` no longer resolves (catalog changed), `selectedReciter` silently falls back to the first reciter and logs an error.
- Downloads survive relaunch: `start()` re-attaches to `downloader.runningAudioDownloads()` and resumes progress observation; `applicationDidBecomeActive` re-assigns `playingState` to force a UI refresh after backgrounding.
- `cancelDownload()` calls `downloader.cancelAllAudioDownloads()` and ends playback state; download-progress errors inside `observe(_:)` are deliberately swallowed (the batch response already surfaced them).
- Playback failures set `@Published error` and reset to `.stopped`, clearing the highlight and now-playing info.
