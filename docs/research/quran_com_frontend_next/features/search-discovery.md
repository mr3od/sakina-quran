# Search with voice, history and command bar
> How **Quran.com frontend (github.com/quran/quran.com-frontend-next)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- A `/search` page (`src/pages/search.tsx`) with an always-visible input, paginated full-text results (PAGE_SIZE = 10), and clickable keyword chips; the query and page live in the URL as `?query=&page=` so searches are shareable.
- A global Cmd/Ctrl-K command bar that floats over any page: typing filters navigation commands (surahs, juz, hizb, pages, verse ranges) plus a "results" group linking to the full search page. Arrow keys move a highlighted `role="option"` row; Enter falls through to the search page.
- A microphone button in both the command bar and the navbar search drawer; while active it continuously dictates Arabic into the input.
- Persistent "recent" rows: past search queries in the search UI (`SearchHistory/`) and recently navigated surah/juz/page items inside the command bar, each individually removable via an x control.

## 2. Architecture & key files
- `src/pages/search.tsx` — page shell + client-side result fetching; `getStaticProps` pre-bakes available languages (`getAvailableLanguages`) and all chapters metadata (`getAllChaptersData`).
- `src/components/Search/*` — `SearchInput`, `Filters`, `NoResults`, `PreInput`, `SearchBodyContainer`, plus subfeatures `CommandBar/CommandsList/index.tsx`, `VoiceSearch/index.tsx`, `SearchHistory/index.tsx`.
- `src/hooks/useVoiceSearch.ts` (247 lines) — the whole voice engine as one hook; `src/hooks/useSearchWithVoice.ts` composes it with search state.
- `src/services/speechRecognition.ts` — typed wrapper over the browser's SpeechRecognition constructor with `isSpeechRecognitionSupported()` / `createSpeechRecognition()` and a shared error-code enum from `src/utils/voice-search-errors`.
- State: `src/redux/slices/Search/search.ts` (query history strings), `src/redux/slices/CommandBar/state.ts` (`recentNavigations`, `isExpanded`), `src/redux/slices/microphone`. Hotkeys registered globally in `src/components/GlobalKeyboardListeners.tsx` (`'meta+k, ctrl+k'` for the command bar, `'meta+p, ctrl+p'` for the drawer).

## 3. Data flow
- Search results are fetched client-side: `search.tsx` builds params with `getAdvancedSearchQuery(query, currentPage, PAGE_SIZE, selectedTranslations)` — note it pulls the user's selected translations from Redux so results match reader settings — then hands a custom `fetcher` to `DataFetcher` (SWR) keyed by `makeNewSearchResultsUrl(...)` from `src/utils/apiPaths`; responses are tagged `SearchService.KALIMAT`.
- Voice flow: mic click → `initializeSpeechRecognition()` stores the instance in a module-level singleton `sharedSpeechRecognitionInstance`, then `startSpeechRecognition()` dispatches `setMicrophoneActive(true)`. Interim transcripts are cleaned by `cleanTranscript` (strips LRM/RLM marks) and written straight into the search input; `onEnd` restarts recognition for continuous dictation until `stopMicrophone()` is dispatched.
- Command selection resolves to a URL through `resolveUrlBySearchNavigationType(resultType, key)` in `src/utils/navigation.ts`, then dispatches `addRecentNavigation` only after `router.push` succeeds.

## 4. Storage & network
- Both histories are localStorage via redux-persist, but through two separate persist configs: `SEARCH` is whitelisted in the main `src/redux/store.ts` persistConfig, while `commandBar` has its own `src/redux/slices/CommandBar/persistConfig.ts` (key COMMAND_BAR, version 1) blacklisting only `isExpanded` so ephemeral open/close state never hits disk. `search.ts` caps history at `MAXIMUM_RECENT_SEARCH_QUERIES`.
- Every search is server-side: recognition audio goes to the browser vendor's speech service; text queries hit quran.com API v4. Nothing about results is cached offline beyond SWR's in-memory cache.
- Analytics are pervasive and distinguish surface: `logTextSearchQuery`, `logEmptySearchResults`, `logSearchResults`, and `logButtonClick('voice_search_start'/'voice_search_stop')` all carry a `SearchQuerySource` (CommandBar vs SearchPage).

## 5. Why it is built this way ON THIS PLATFORM
- SEO demands the search page be a real URL with canonical/hreflang tags (`NextSeoWrapper`, `getLanguageAlternates('/search')`) even though results themselves load client-side; the static props only ship cheap metadata (languages, chapters) that many surfaces reuse.
- Web Speech API is free and zero-infrastructure but Chromium-centric and hard-coded to `lang: Language.AR` here — a deliberate choice because dictated queries target Arabic scripture, with `isSupported` detection degrading gracefully elsewhere.
- Two persist slices exist because command-bar recents must survive reloads while its expanded/dropdown flag must not — a granularity redux-persist makes cheap on web where storage is synchronous localStorage.
- Keyboard-first UX (hotkeys enabled on form tags, `role="listbox"` semantics) mirrors desktop power-user conventions of browser-first Quran study sessions.

## 6. Edge cases & offline behavior
- Recognition failures call `stopSpeechRecognition()`, surface Sentry logging via `logErrorToSentry`, and optionally invoke the consumer's `onError`; restart failure also force-stops the mic slice.
- The singleton instance is torn down whenever `isMicActive` flips false, preventing orphaned recognizers after navigating away mid-dictation.
- Empty results trigger a dedicated analytics event and `NoResults`; unsupported browsers get a disabled voice affordance rather than a hidden button.
- Fully offline the feature degrades to browsing local history and recent navigations only — queries fail in the `fetcher` catch which rethrows as `'Search failed'`; there is no offline index of the Quran text in the bundle.
