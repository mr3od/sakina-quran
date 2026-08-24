# Notes and Reflections Journal
> How **Quran.com frontend (github.com/quran/quran.com-frontend-next)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- From the verse overflow menu or from `SaveBookmarkModal`, users open "Take a note or reflection" (`AddNoteModal`). The sheet shows a short intro, pills of the verse ranges the note is attached to (e.g. "2:255"), a body textarea, and two actions: "Save privately" and "Save & post to QuranReflect".
- Posting publicly triggers a confirmation step (`PostQrConfirmationModal`) warning that the text will be visible to the community before it is submitted.
- Notes are browsed in My Quran via the MyNotes components under `src/components/Notes/modal/MyNotes`, and per-verse existing notes are reachable through `NotesOnVerseButton` which shows a notes count.
- `/take-notes` is not an editor: `src/pages/take-notes/index.tsx` is a static SEO landing page composed of `Introduction`, `HowToUse`, `Benefits`, `Conclusion` sections wrapped in `NextSeoWrapper`.

## 2. Architecture & key files
- The Redux slice named for this feature holds no note data at all: `src/redux/slices/QuranReader/notes.ts` contains exactly `{ isVisible: boolean }` plus `setIsVisible`. All real state lives in React hooks + SWR caches; notes are server-owned documents.
- `src/components/Notes/modal/AddNoteModal.tsx` is the write path: it converts selected verse keys into ranges with `verseKeysToRanges` — documented to turn `['1:1'..'1:7','2:1','2:2','2:7']` into `['1:1-1:7','2:1-2:2','2:7-2:7']`, never spanning chapters — then calls `addNote({body, ranges, saveToQR})`.
- `src/components/Notes/modal/NoteFormModal.tsx` is the shared form shell used by both add and edit flows (`EditNoteModal.tsx`), fed by `useNotesStates` which owns input value, validation errors and a tri-state loading flag (`LoadingState.Public | Private | null`).
- Server helpers in `src/utils/auth/api.ts`: `addNote` (~line 773), `updateNote(id, body, saveToQR)`, `getAllNotes(params)`, `countNotesWithinRange(from, to)` — all against the authenticated account backend.
- Cache utilities in `src/components/Notes/modal/utility.ts` (`invalidateCache`, `getNoteFromResponse`, `isNotePublishFailed`, `addReflectionEntityToNote`) keep SWR caches coherent; server field errors are mapped by `getNoteServerErrors` in `validation.ts`.
- Discrepancy vs brief: the note editor is **not** Milkdown. `NoteFormModal` renders the plain `@/dls/Forms/TextArea`. Milkdown exists in this repo only under `src/components/MarkdownEditor` and is consumed by QuestionAndAnswer components (`QuestionHeader`, `AnswerBody`) and `QuranicCalendar/WeeklyVerses/ReflectionPrompts` — not by the verse-notes flow.

## 3. Data flow
1. User opens the modal with one or many verses preselected; `useMemo(() => verseKeysToRanges(verseKeys))` compresses them.
2. Private save → `onPrivateSave` → `handleSaveNote({note, isPublic:false})`; public save first passes client validation (`validateNoteInput`), shows the confirmation modal, then posts with `saveToQR: true`.
3. Response handling distinguishes three outcomes: validation error (mapped back into the form), publish failure (`isNotePublishFailed` → error toast but the note still saved privately), success (success toast when `id` and `createdAt` exist).
4. Afterwards `invalidateCache(...)` updates every affected SWR key in one call: per-verse note lists, the global notes count (`invalidateCount`), the reflections feed when public (`invalidateReflections`), and the My Quran list (`flushNotesList`), with `CacheAction.CREATE` shaping insertions. A newly public note is injected optimistically as a reflection entity carrying `LOADING_POST_ID` until the feed revalidates.

## 4. Storage & network
- No local persistence for note bodies: everything goes over HTTPS to the account backend with JWT auth (`src/utils/auth/api.ts`); the only local artifact is SWR's in-memory cache plus whatever redux-persist whitelists (which excludes note content).
- The dual-purpose save flag `saveToQR` means one endpoint serves both journaling (private) and community publishing (QuranReflect), so the client never duplicates content across systems.
- Redux's role is reduced to UI coordination — e.g. `verseActionModal.ts` tracks modal stacking with `previousModalType` so returning from the note editor reopens the bookmark sheet.

## 5. Why it is built this way ON THIS PLATFORM
- Notes are user-generated content destined for a public community (QuranReflect); on the web there is no private app sandbox worth syncing to, so server storage gives free cross-device continuity and makes publishing a flag flip rather than a second upload path.
- A plain textarea instead of a rich-text editor keeps moderation surface small: plain-text bodies are cheap to validate, store, escape and render inside reflection feeds and embeddable contexts; the heavier Milkdown editor is reserved for Q&A answers where markdown structure matters more.
- The explicit confirm-before-posting step reflects that public posting is irreversible social exposure, while private saving needs no friction.
- Range compression (`verseKeysToRanges`) exists because the reader lets you act on multi-verse selections; storing ranges instead of N rows keeps API payloads and feeds compact.

## 6. Edge cases & offline behavior
- Offline note-taking degrades gracefully to failure: `handleSaveNote` rethrows after an error toast, and because nothing was cached locally, unsaved text survives only in component state while the modal stays open — there is no offline draft queue.
- Partial failure is handled explicitly: if the private save succeeds but the QuranReflect post fails, the UI tells the user "save-publish-failed" and treats the note as private rather than losing it.
- Server-side validation errors round-trip into the form via `isValidationError(data)` / `getNoteServerErrors(data, t, lang)` instead of generic toasts.
- Buttons disable during any save (`loading !== null`) preventing double submission across the two distinct async paths (public vs private).
