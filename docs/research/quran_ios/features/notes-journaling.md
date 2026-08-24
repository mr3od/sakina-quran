# Verse Notes Journaling
> How **Quran for iOS (github.com/quran/quran-ios)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- The second tab is a journal: reverse-chronological cards, each showing the note body plus the Arabic text of the verse(s) it annotates (`NoteItem` in `Features/NotesFeature/Sources/NoteItem.swift` pairs a `QuranAnnotations.Note` with `QuranText`). A search field filters by note text or by the sura's localized name (`NotesViewModel.filteredNotes`). Tapping a card navigates to the verse; an edit action reopens the editor; edit mode deletes cards.
- From the reader's ayah menu ("Notes", subtitle shows count via `ayah.menu.notes-count`) users open an editor sheet pre-filled for the selected verses. The editor (`Features/NoteEditorFeature/Sources/NoteEditorViewController.swift` + `NoteEditorViewModel.swift`) shows the verse range header with "modified <time-ago>", a text view, and — in legacy builds only — a highlight-color row.
- Deletion from either the list or the editor asks confirmation; under sync builds the copy differs (`DeleteConfirmationStyle.syncedNote` vs `.note`).

## 2. Architecture & key files
- List side: `Features/NotesFeature/Sources/NotesViewModel.swift`, a `@MainActor ObservableObject`; `NotesBuilder` injects `AnalyticsLibrary`, a note service, `ShareableVerseTextRetriever`, `QuranTextDataService`, a `navigateTo(AyahNumber)` closure and an `editNote(Note)` closure; `AyahNotesBuilder/ViewModel/ViewController` provide the per-sura drill-down.
- Editor side: `Features/NoteEditorFeature/Sources/NoteEditorViewModel.swift` with two constructors selected at compile time — sync builds take `MobileSyncNoteService` + `NoteEditorMode` (`.create(verses)` / `.edit(note)`), legacy builds take local `NoteService` and a fixed `Note`. It reports completion through a weak `NoteEditorListener.dismissNoteEditor()`.
- The service seam is explicit: `protocol NoteEditorLegacyServicing { setNote(_:verses:color:); removeNotes(with:) }` with `extension NoteService: NoteEditorLegacyServicing {}` — the sync path needs no adapter because `MobileSyncNoteService` already exposes create/update/remove.
- Storage contract lives in `Data/NotePersistence/Sources/NotePersistence.swift`: `notes() -> AnyPublisher<[NotePersistenceModel], Never>`, `setNote(_ note: String?, verses:, color: Int)`, `removeNotes(with:)`.

## 3. Data flow
- `NotesViewModel.start()` observes `$reading` so switching mushaf reloads everything. Legacy uses Combine: `$reading.map { noteService.notes(quran:) }.switchToLatest().values()` then sorts by `modifiedDate` descending; sync iterates `noteService.notesSequence(quran:)` directly (order comes from the server stream).
- Each snapshot is expanded concurrently: `noteItems(with:)` is `nonisolated` and runs a `withTaskGroup` calling `textService.numberedArabicText(for: note.verses)` per note, hopping back to the actor on assignment; failures degrade to `NoteItem(note:quranText: nil)` rather than dropping the row.
- Deletes are optimistic: `deleteItem(_:)` inserts the id into `pendingDeletionIDs`, removes the row immediately, and returns an `AsyncAction` closure that performs the service delete and, on failure, calls `restore(_:at:)` to reinsert at the original index and publishes `error`. The pending-id set keeps the next stream emission from resurrecting a row mid-delete.
- The editor loads lazily: `fetchNote()` resolves the verses' Arabic text via `textService.numberedArabicText`, builds an `EditableNote` (ayah range `start...end`, `modifiedSince` time-ago string, selected color), then edits happen on that value object.
- `commitEditsAndExit(dismissOnSave:)` validates, no-ops when unchanged, then calls `createNote/updateNote` with the sorted range endpoints (sync) or `setNote(text, verses:, color:)` (legacy); success dismisses via the listener. `ReadingPreferences.shared.$reading` is sunk into `reading` so the header tracks mushaf changes live.

## 4. Storage & network
- Local persistence is CoreData (`Data/NotePersistence/Sources/CoreDataNotePersistence.swift`): one note row owns many verse rows, color stored as `HighlightColor.rawValue` Int, so a highlight without text *is* a note with `text = nil` — highlights and notes are the same entity offline.
- Sync builds move notes to quran.com through `MobileSyncNoteService`; notably `showsColors` returns `false` there because highlight color is a separate synced entity, and `analytics.logEvent("UpdateNoteVersesNum", ...)` records how many distinct verses a note spans.
- Sharing is plain text assembly: `prepareNotesForSharing()` loops notes, fetches each verse's text via `textRetriever.textForVerses`, and joins bodies + verses with blank-line separators.

## 5. Why it is built this way ON THIS PLATFORM
- One CoreData entity modeling both highlights and notes keeps the legacy build tiny and schema-simple; the sync product split them server-side, so the same screens compile differently behind `#if QURAN_SYNC` instead of maintaining two features.
- A six-character minimum (`minimumNoteBodyLength = 6`) gates submission and auto-save-on-dismiss (`shouldAutoSaveOnDismiss`, `canDismissNote` prevents losing a half-typed short draft) — cheap guard against accidental empty notes on swipe-to-dismiss sheets.
- Optimistic deletion with index-accurate rollback gives instant feedback on old devices while remaining correct if CoreData or the network fails; combined with `crasher.recordError` on every failure path it matches the repo's observability posture.
- Verse Arabic text is fetched per-note asynchronously instead of denormalized into the store, keeping the annotation database small and text rendering consistent with the bundled quran.db.

## 6. Edge cases & offline behavior
- Notes spanning multiple verses collapse to a `start...end` range in sync mode but keep an arbitrary verse set locally; deletion always passes `Array(note.verses)` so partial-range notes clean up fully.
- Failed verse-text fetch yields a text-less card instead of hiding the note; failed deletes restore position and surface `error`.
- Offline legacy use is fully functional (local CoreData); sync builds depend on cached MobileSync state — the code reads as local-sequence-driven either way, with errors logged not thrown to the UI.
