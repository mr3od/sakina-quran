# Light, dark and sepia themes
> How **Quran.com frontend (github.com/quran/quran.com-frontend-next)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- A four-way `Switch` (auto / light / dark / sepia, with Moon/Sun/Auto/Sunset icons) in the settings drawer (`src/components/Navbar/SettingsDrawer/ThemeSection.tsx`), plus quicker switchers in the navigation drawer (`NavigationDrawer/ThemeSwitcher.tsx`) and footer (`dls/Footer/FooterThemeSwitcher.tsx`).
- When **auto** is selected a footer appears explaining the theme follows the operating system; verse previews (`SettingsDrawer/VersePreview.tsx`) re-render in the chosen palette so changes are visible immediately.

## 2. Architecture & key files
- Redux slice: `src/redux/slices/theme.ts` holds a single `{ type }` object typed by `Theme` (`src/redux/types/Theme.ts`); `ThemeType` enum is exactly `Auto | Light | Sepia | Dark`, and `ThemeTypeVariant = Exclude<ThemeType, ThemeType.Auto>` exists for code needing a concrete theme. The only reducer is `setTheme`.
- Initial value is locale-aware: `getThemeInitialState(locale)` from `src/redux/defaultSettings/util.ts` (some locales ship different defaults), and `resetSettings` restores it per locale.
- Application to the DOM: `src/styles/ThemeProvider.tsx` sets `document.body.setAttribute('data-theme', theme.type)` on every render of the provider — no React state for colors, just an attribute.
- CSS: `src/styles/theme.scss` defines variable sets under `[data-theme='light']`, `[data-theme='dark']`, `[data-theme='sepia']`; `_theme.scss` provides mixins that match either `[data-theme='dark'] &` or `@media (prefers-color-scheme: dark)` so components respond correctly in both explicit and auto modes.

## 3. Data flow
- Picking a theme calls `onSettingsChange('type', value, setTheme(value), setTheme(theme.type), PreferenceGroup.THEME)` from `usePersistPreferenceGroup`: dispatch immediately (optimistic), then persist server-side if logged in, with an Undo toast on failure.
- Switching to a different theme also dispatches `resetLoadedFontFaces()` because Quran font faces are loaded per theme (mushaf pages render differently on dark/sepia backgrounds).
- On sign-in or app boot for logged-in users, `syncUserPreferences` merges `userPreferences[PreferenceGroup.THEME]` into the slice via the slice's `extraReducers` case, so a device picks up the account's theme.
- The body attribute drives all styling through CSS variables; components like `VersePreview` simply read `selectTheme` when they need the value.

## 4. Storage & network
- `SliceName.THEME` is in the redux-persist whitelist in `src/redux/store.ts` (key `'root'`, version 48), so the theme survives reloads in localStorage even for anonymous users.
- For logged-in users one small POST per change goes to the preferences endpoint (`addOrUpdateUserPreference(..., PreferenceGroup.THEME)` in `src/utils/auth/api.ts`), making the theme part of cross-device sync.
- No network fetch is needed to *apply* a theme at boot: the value comes synchronously from localStorage before first paint.

## 5. Why it is built this way ON THIS PLATFORM
- Flash-of-wrong-theme is the classic web dark-mode problem: redux-persist's `REHYDRATE` is async, so `getStore()` in `src/redux/store.ts` reads the persisted theme itself via `getPersistedTheme()` (`src/redux/utils/getPersistedTheme.ts`) and passes it as `preloadedState`. That helper parses the raw `persist:root` localStorage entry and does a deliberate double `JSON.parse`, because redux-persist stringifies each slice individually inside the top-level object. The comment ties this to language switching, where the store is recreated per locale.
- Auto mode needs no JavaScript listener: the `[data-theme='auto']` base block in `theme.scss` applies light variables plus `@include dark.mode` inside `@media (prefers-color-scheme: dark)`, so OS changes restyle the page purely in CSS.
- A `body[data-theme]` attribute keeps theming outside React's render cycle — important for the Quran reader, where thousands of styled words must not re-render on theme change.

## 6. Edge cases & offline behavior
- SSR safety: both `getStore` and `getPersistedTheme` guard `typeof window === 'undefined'`, so server HTML never guesses a theme.
- Corrupted or missing persisted state is caught in `getPersistedTheme`'s try/catch (console error + null), falling back to locale defaults; a comment warns that `PERSIST_KEY = 'persist:root'` must track `persistConfig.key`.
- Offline theme switching works fully: local dispatch + localStorage write happen regardless of network; only the cross-device sync POST can fail (Undo toast).
- Sepia has no auto variant by design (`ThemeTypeVariant` excludes only `Auto`), and theme resets ride the shared `resetSettings` action used when users restore defaults per locale.
