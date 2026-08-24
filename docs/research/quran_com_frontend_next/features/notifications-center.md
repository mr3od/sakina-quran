# Notification center and email preferences
> How **Quran.com frontend (github.com/quran/quran.com-frontend-next)** implements this feature. Sources read from a shallow clone @ main (2026-08-23); repo-relative paths cited throughout.

## 1. What the user sees
- A bell icon in the navbar (`src/components/Notifications/InAppNotifications/index.tsx`) with an unread badge fed by `selectUnseenCount`; clicking toggles a Radix-style `Popover` (from `src/dls/Popover`) containing `NotificationsList`.
- Opening the popover fetches page 0 with `shouldMarkAsSeenOnSuccess: true`, so the badge clears once messages are seen. The list is paginated 10 at a time (`NOTIFICATIONS_PAGE_SIZE` in `useFetchNotifications.ts`) and supports per-notification mark-read, mark-all-read, and delete.
- On the profile page, `src/components/Profile/EmailNotificationSettingsForm.tsx` renders checkbox rows per email workflow plus a Save button; rows are disabled while saving and the Ramadan daily-challenge row is disabled unless the user is enrolled (`useRamadanChallengeStatus`).

## 2. Architecture & key files
- Third-party inbox: `@novu/headless`. `HeadlessServiceProvider` (`src/components/Notifications/hooks/useHeadlessService.tsx`) constructs one `HeadlessService` with `NEXT_PUBLIC_NOVU_BACKEND_URL`, `NEXT_PUBLIC_NOVU_SOCKET_URL`, `NEXT_PUBLIC_NOVU_APP_ID`, `subscriberId = getUserIdCookie()` and `subscriberHash = getNotificationSubscriberHashCookie()` (both from `src/utils/auth/login.ts`), then exposes `{headlessService, status, isReady}` via React context.
- Composition root: `NotificationContext.tsx` nests `HeadlessServiceProvider > NotificationsProviderInner`, which runs `useInitializeUnseenCount()` and shares `useFetchNotifications()` through context.
- One thin hook per mutation lives beside it: `useMarkNotificationAsRead`, `useMarkNotificationAsSeen`, `useMarkAllAsRead`, `useDeleteNotification`, `useFetchUserPreferences` (all in `src/components/Notifications/hooks/`). List/page state goes into the non-persisted `notifications` Redux slice (`src/redux/slices/notifications.ts`: `setNotificationsPageAndFinishLoading`, `setUnseenCount`).

## 3. Data flow
- `initializeSession` runs on mount; only after it resolves does `status` become `READY`, and every other call is gated on `isReady` (see `useFetchNotifications.ts`, `useInitializeUnseenCount.ts`).
- Unread badge: `fetchUnseenCount` seeds the count, then `listenUnseenCountChange` keeps it live over Novu's websocket, dispatching `setUnseenCount` — the badge updates without polling or refetching the list.
- Fetching: `headlessService.fetchNotifications({page, query:{limit:10}})` streams loading flags through its `listener` into Redux and, on success, batch-marks the returned message `_id`s as seen when requested.
- Email settings: `useEmailNotificationSettings` (`src/hooks/auth/`) pulls Novu user preferences, filters to non-critical templates tagged `QDC` (excluding `marketing`), groups them by their first remaining category tag, and stages toggles locally until `handleSave` calls `useUpdateEmailNotificationPreferences`.

## 4. Storage & network
- All inbox state lives on Novu's servers; the Redux `notifications` slice is deliberately absent from the `persistConfig.whitelist` in `src/redux/store.ts`, so nothing about notifications survives a reload except what Novu returns.
- Identity travels via cookies rather than bundle-visible tokens; the subscriber hash lets the browser authenticate against Novu without holding a raw API secret.
- Network endpoints are entirely Novu's backend + socket URLs configured at runtime env; email preference writes go through the same headless SDK (`updatePreference`, filtered by `ChannelTypeEnum.EMAIL`).

## 5. Why it is built this way ON THIS PLATFORM
- A static-first Next.js site has no persistent process of its own for fan-out, so delegating inbox storage, delivery, and real-time push to a headless service avoids running websocket infrastructure for a marketing-site-scale audience.
- Cookies + hashed subscriber ID fit the existing JWT-cookie auth model (`privateFetcher` uses `credentials: 'include'`), keeping notification auth consistent with account auth without a second login flow.
- Redux holds only ephemeral view state (loaded pages, spinners, unseen count) because the web client can be rehydrated from the server at any time — there is no reason to spend localStorage on it.

## 6. Edge cases & offline behavior
- Not logged in / failed session: `initializeSession.onError` sets status `ERROR` and reports via `logErrorToSentry`; hooks simply never fire because `isReady` stays false, so the bell degrades silently rather than throwing.
- Double-fetch protection: `useFetchNotifications` bails if `isFetchingNotifications` or the page is already in `loadedPages`.
- Errors are reported to Sentry with metadata (page, flags) but not toasted; the popover shows whatever was loaded.
- Offline: the websocket drops (no badge updates) and the list cannot load — there is no service-worker cache for notification APIs in `pwa-runtime-config.js`, so the feature is effectively online-only.
