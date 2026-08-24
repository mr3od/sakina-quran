# Accounts with cross-device preference sync
> How **Quran.com frontend (github.com/quran/quran.com-frontend-next)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- `/login` (`src/pages/login.tsx`) renders `LoginContainer`; it only handles `?error=` query results (including the banned-user error, showing a toast then redirecting). Sibling pages `forgot-password.tsx` and `reset-password.tsx` cover password recovery.
- The profile page (`src/pages/profile/`) offers avatar upload (`useProfilePictureForm`), profile edits (`useUpdateUserProfile`), password change (`useUpdatePassword`), email notification settings, and account deletion.
- Every reader setting — theme, font, translations, reciter, reading mode — applies instantly and follows the user to other devices after login.

## 2. Architecture & key files
- Custom JWT auth, not next-auth: `src/utils/auth/api.ts` wraps all authenticated calls in `privateFetcher = configureRefreshFetch({ shouldRefreshToken, refreshToken: refreshTokenWithFlag, fetch: withCredentialsFetcher })` from the `refresh-fetch` library. Tokens ride in cookies (`credentials: 'include'` plus `x-timezone` and extra headers via `getAdditionalHeaders`).
- `refreshTokenWithFlag` guards a module-level `tokenRefreshInProgress` boolean (exposed as `isTokenRefreshInProgress()`) so concurrent 401s trigger one refresh, with Sentry breadcrumbs on start/success/failure.
- Sync engine: `src/hooks/auth/usePersistPreferenceGroup.ts` exposes `onSettingsChange`, `onSettingsChangeWithoutDispatch`, and `onXstateSettingsChange` (for XState audio state); mapping of Redux slices to server groups lives in `src/utils/auth/preferencesMapper.ts` and the `PreferenceGroup` enum (`src/types/auth/PreferenceGroup.ts`: AUDIO, LANGUAGE, QURAN_READER_STYLES, READING, TAFSIRS, THEME, TRANSLATIONS, GUEST_BOOKMARK→READING_BOOKMARK).

## 3. Data flow
- On change while logged in: dispatch the Redux action first (optimistic UI), then POST `addOrUpdateUserPreference(key, value, group, mushafId?)` to `makeUserPreferencesUrl(mushafId)`. For guests it only dispatches.
- Failure path shows a warning toast (`error.pref-persist-fail`) with two actions: **Undo** re-dispatches the supplied `undoAction` (e.g. `setTheme(previous)`), **Continue** keeps local state — a manual reconciliation instead of a queue-and-retry.
- On boot/login, `src/components/Providers.tsx` calls `getUserPreferences()` when `isLoggedIn()` and dispatches `syncUserPreferences(userPreferences, locale)`; each slice merges its group via an `extraReducers` case (see `src/redux/slices/theme.ts`). Guests' local data is merged server-side through `syncUserLocalData` (`makeSyncLocalDataUrl`).
- `mushafId` is recomputed per change from the current `quranFont` + `mushafLines` selectors because preference validity depends on which mushaf layout the user renders.

## 4. Storage & network
- Dual persistence: localStorage via redux-persist (22-slice whitelist in `src/redux/store.ts`, migrations in `src/redux/migrations.ts`) for instant boots and anonymous use; the backend preferences store as source of truth for logged-in users.
- The mapper intentionally syncs partial slices — e.g. from audio state only `reciter`, `playbackRate`, `showTooltipWhenPlayingAudio`, `enableAutoScrolling` survive, with defaults injected from `DEFAULT_XSTATE_INITIAL_STATE`.
- Account lifecycle endpoints are plain REST helpers in the same file: `getUserProfile`, `completeSignup`, `deleteAccount` (DELETE), `updateUserConsent`.

## 5. Why it is built this way ON THIS PLATFORM
- A web app cannot rely on native key-value sync, so the browser's cookie session plus a server-side preference document is the only way settings survive device changes; redux-persist remains as a fast-boot cache, not the canonical copy.
- Centralizing writes in one hook lets ~every settings component opt into sync without knowing about auth, and keeps undo semantics uniform across plain actions and thunks/XState transitions.
- Discrepancy vs. brief: no "SSO flag" exists anywhere in `src/` (case-insensitive search finds nothing beyond false positives) — sign-in is email/password with refresh cookies; the closest thing to federated entry is the embed/widget surfaces, not login.

## 6. Edge cases & offline behavior
- Offline or failed write: local state stays changed (optimistic), user chooses Undo or Continue; nothing retries automatically, so a later change simply overwrites with fresh values.
- Banned users are force-logged-out client-side: `handleErrors` detects `BANNED_USER_ERROR_ID`, calls `logoutUser()` and routes to `/login?error=...`.
- Expected API errors are whitelisted in `IGNORE_ERRORS` (invalid credentials, validation, etc.) so forms can render field-level messages instead of the generic handler.
- Last-write-wins per key on the server; simultaneous devices converge on whichever preference write lands last, and guest bookmarks created before login are reconciled by the server-side local-data sync rather than the client.
