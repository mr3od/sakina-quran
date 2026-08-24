# Expo SDK releases after SDK 54 — what each one changes

> **As of 2026-08-24.** Covers SDK 55, 56, 57 and the sdk-58 canary line, written for an app currently on **SDK 54.0.30 / RN 0.81.5 / React 19.1.0**, Expo Router ~6.0.21, New Architecture on, Metro `web.output: "server"`. Exact version pins live in [`PACKAGE_UPGRADES.md`](./PACKAGE_UPGRADES.md) §2 — this file is about *what changed and why it matters for this repo*, not pin tables.

Sources: expo.dev changelog/blog posts (enumerated via [sitemap](https://expo.dev/sitemap.xml)), npm registry dist-tags/publish timestamps, and `raw.githubusercontent.com` reads of `bundledNativeModules.json` + `packages/expo/CHANGELOG.md` across `sdk-55`/`sdk-56`/`sdk-57` tags and `main`. Each claim is cited inline.

---

## 0. Baseline: where SDK 54 leaves this app

- SDK 54 GA September 2025 with **RN 0.81** / React 19.1 ([changelog](https://expo.dev/changelog/sdk-54)); upstream patch 0.81.6 landed 2026-02-05. We sit on `54.0.30`; the `sdk-54` dist-tag ends at `54.0.37`.
- New Architecture has been the **default since SDK 53** ([out-with-the-old](https://expo.dev/blog/out-with-the-old-in-with-the-new-architecture), Apr 2025), which stated legacy architecture *could* be removed "in a late 2025 release" — that removal happened in SDK 55 (§2). SDK 54 is the **final release to include Legacy Architecture support**.
- RN 0.81 shipped **precompiled iOS RN builds** as opt-in (`RCT_USE_PREBUILT_RNCORE=1 RCT_USE_RN_DEP=1 pod-install`), up to ~10x faster clean RN compiles, with intent to make it default ([post](https://expo.dev/blog/precompiled-react-native-for-ios)) — precursor to SDK 56's default-on prebuilt XCFrameworks, and motivated by CocoaPods refusing new podspecs after **Dec 2, 2026**.
- Our shape: CNG (no committed native dirs), `web.output: "server"` over Metro, direct deps on `@react-navigation/*` ×3, `@expo/vector-icons`, reanimated + worklets, gesture-handler v2, flash-list 2.0.2, react-native-web ~0.21.2.
- Support clock: SDK releases get ~1 year of critical fixes; per the [SDK 57 post](https://expo.dev/changelog/sdk-57), SDK 54 is covered until the fall 2026 release (~Sept/Oct 2026) — i.e. our upgrade window closes within weeks of this writing.

---

## 1. Interim announcements between SDK 54 and SDK 55

Timeline: RN **0.83.0** released 2025-12-10 → [SDK 55 beta](https://expo.dev/changelog/sdk-55-beta) **2026-01-22** (~2 weeks) → SDK 55 GA **2026-02-25** (npm `55.0.0`). The beta post is where most of the 54→55 delta was framed:

- **New package versioning scheme** (the big one): all Expo SDK packages renumber onto the SDK major. Verified against [`bundledNativeModules.json`](https://raw.githubusercontent.com/expo/expo/sdk-55/packages/expo/bundledNativeModules.json): `expo-router` jumps **~6.0.x → ~55.0.18**, `expo-audio` → ~55.0.17, `expo-sqlite` → ~55.0.19, etc. Exception: `@expo/vector-icons` stays `^15.0.2` (independently versioned). "Packages are not intended to work across SDK versions."
- Template revamp: Native Tabs API, `/src/app` convention.
- Hermes bytecode diffing announced (opt-in at 55, default at 56), "~75% reduction" in update download times.
- Router additions: Colors API (M3 dynamic color on Android), Apple Zoom transition, `Stack.Toolbar`, experimental SplitView, form-sheet footers; `react-native-screens` upgraded (4.20.0 at beta → 4.23.0 by GA).
- `expo-brownfield` + alpha `expo-widgets`; Expo UI Compose promoted to beta with SwiftUI renames (`DateTimePicker`→`DatePicker`, `Switch`→`Toggle`), stable targeted "mid-2026" (landed in 56, §3).
- Hermes v1 opt-in only, requiring `buildReactNativeFromSource: true` + a pinned `hermes-compiler` — explicitly not recommended for Android monorepos at the time.
- Beta carried RN 0.83.1 / React 19.2.0.

Post-GA friction worth knowing (falls inside the 54→56 window):

- **Expo Go store distribution broke down**: as of [May 4, 2026](https://expo.dev/changelog/expo-go-and-app-store-may-2026) the SDK 55 Expo Go was still unapproved on the iOS App Store (SDK 54 remained the store version); TestFlight external beta at capacity; mitigation is development builds or `eas go` (builds a personal Expo Go into your own TestFlight, paid Apple dev account required). From SDK 56, `create-expo-app` prompts App-Store-compatible-vs-newest-SDK. Practical read: Expo Go is no longer a reliable SDK-testing vehicle — our dev-client workflow is unaffected.
- **Hermes V1 regression saga**: opt-in at 55 → default at 56 with the reanimated/worklets memory blowup (#46519) → resolved by RN 0.86.2 shipped in `expo@57.0.9` (2026-07-29). Details in §3–§4.

---

## 2. SDK 55

Source: [expo.dev/changelog/sdk-55](https://expo.dev/changelog/sdk-55). GA **2026-02-25** (npm `55.0.0`), after the [sdk-55-beta](https://expo.dev/changelog/sdk-55-beta) window (§1).

**Core stack:** React Native **0.83**, React **19.2** (up from 19.1.0 here).

### Headline features / new packages

| Item | Notes |
|---|---|
| `expo-brownfield` (new) | Isolated mode packages an RN app as AAR/XCFramework; integrated mode too; config plugin + CLI + bi-directional messaging |
| `expo-widgets` (alpha, iOS-only) | Home-screen widgets + Live Activities built with `@expo/ui`; shared-object timeline API, push-to-start tokens |
| `expo-server` (new) | Replaces `@expo/server`; adapters for server runtimes/hosting providers |
| `expo-{contacts,media-library,calendar}/next` | Object-oriented SharedObject APIs (stable in 56, originals deprecated) |
| OTA bundle diffing (`enableBsdiffPatchSupport`) | Hermes-bytecode bsdiff patches; ~75% faster update downloads; opt-in here, default in 56 ([blog post](https://expo.dev/blog/ship-smaller-ota-updates-bundle-diffing-comes-to-ota-updates-in-sdk-55)) |
| **New package versioning scheme** | Every SDK package renumbered onto the SDK major (`expo-camera@^55.0.0`, …) — the single-hop story behind [`PACKAGE_UPGRADES.md`](./PACKAGE_UPGRADES.md) §1 |
| Revamped template | Native Tabs API, `/src/app` folder convention (optional move from `/app`) |
| Expo CLI hardening | Dev server localhost-only w/ `--localhost`, stricter CORS/Origin checks on `/json/list` + CDP; dynamic config in `.mjs/.cjs/.cts/.mts` (experimental); `EXPO_UNSTABLE_LOG_BOX=1` Log Box |
| Hermes v1 **opt-in** | `useHermesV1` + `buildReactNativeFromSource: true` in expo-build-properties; requires hermes-compiler override. Not default yet |

### Breaking changes relevant from SDK 54

- **Legacy Architecture dropped entirely**; `newArchEnabled` removed from app.json (this app already runs New Arch — no-op for us).
- `notification` field removed from app.json schema — prebuild errors; migrate to expo-notifications config plugin (app doesn't use it).
- Push notifications in Expo Go on Android now throw instead of warn.
- `edgeToEdgeEnabled` removed from app.json — edge-to-edge mandatory targeting Android 16+ (#42518).
- `expo-av` removed from Expo Go, no further patches (replaced by expo-audio/expo-video since 54).
- Library API breaks: `expo-video` `allowsFullscreen` → `fullscreenOptions.enable`; `expo-clipboard` listener `content` prop removed → `getStringAsync()`; `expo-cellular` carrier constants removed; `expo-blur` `experimentalBlurMethod` → `blurMethod` + `<BlurTargetView>` needed on Android.
- `expo-router`: `ExpoRequest`/`ExpoResponse` removed from `expo-router/server` → standard `Request`/`Response` (#42363); headless tabs `reset` → `resetOnFocus`.
- `app.config.ts` now transpiled with your installed TypeScript.
- `eas update` requires `--environment`.
- Removed: fast resolver + `EXPO_USE_FAST_RESOLVER`; `experiments.reactCanary` flag (React 19 is baseline).
- Deprecations: `removeSubscription()` → `subscription.remove()`; `expo-video-thumbnails` → expo-video `generateThumbnailsAsync` (removed in 56); `expo-navigation-bar` methods no-op'd under edge-to-edge; `expo-status-bar` `backgroundColor`/`translucent`/`networkActivityIndicatorVisible` no-op'd; `androidStatusBar.*`/`androidNavigationBar.*` config → plugins.

### Ecosystem shifts

- New Arch mandatory from 55 onward; React 19 baseline (no canary flag).
- Web: rewritten error overlay, alpha SSR support, experimental data loaders — the groundwork this app's `web.output: "server"` sits on.
- Minimums: **Xcode 26** (EAS defaults 26.2), iOS/tvOS **15.1**, Node `^20.19.4 || ^22.13.0 || ^24.3.0 || ^25.0.0`. iOS 16.4 announced as coming in 56.
- RN 0.83 shipped alongside; RN 0.84 visible in SDK 56 canaries at announcement time.

### Upgrade-path notes for sakina-quran

- **Versioning scheme flip is the big mechanical change**: every `expo-*` dep renumbers to ~55.x in one `npx expo install expo@^55.0.0 --fix` — matches the 18-of-31-majors claim in [`PACKAGE_UPGRADES.md`](./PACKAGE_UPGRADES.md) §1.
- `expo-status-bar` no-ops: our `<StatusBar>` usages lose `backgroundColor`/`translucent` semantics on Android under mandatory edge-to-edge — visual QA needed, and the 56-era replacement is `<NavigationBar>`.
- `expo-router` server API rename matters if any route/API handler imports `ExpoRequest`/`ExpoResponse` from `expo-router/server` (we run `web.output: "server"`).
- Hermes v1 is opt-in here — stay out of it at 55; the memory-regression story (below, §3) makes default-on 56 the danger zone, not 55.
- Not affected: `expo-av` (not a dep), push notifications, `expo-blur`/`expo-cellular`/`expo-clipboard` (not deps).

---

## 3. SDK 56

Source: [expo.dev/changelog/sdk-56](https://expo.dev/changelog/sdk-56). GA **2026-05-20** (npm `56.0.0`). Companion posts: [native-code-expo-sdk-56](https://expo.dev/blog/native-code-expo-sdk-56), [expo-ui-stable-sdk-56](https://expo.dev/blog/expo-ui-stable-sdk-56), [expo-router-v56-decoupling-from-react-navigation](https://expo.dev/blog/expo-router-v56-decoupling-from-react-navigation) — router majors now track SDK majors (~55.x → ~56.x → ~57.0.15 per each tag's `bundledNativeModules.json`).

**Core stack:** React Native **0.85**, React **19.2**. **Hermes V1 becomes the default engine** (opt out via `useHermesV1` in expo-build-properties). RN 0.85 brings a New-Architecture-aligned animation backend and an HTTPS-capable Metro dev server.

### Headline features / new packages

| Item | Notes |
|---|---|
| **@expo/ui stable** | SwiftUI + Jetpack Compose APIs GA; universal components (`Host`, `Row`, `Column`, `ScrollView`, `Text`, `TextInput`, `Button`, `Switch`, `Slider`, `Checkbox`, `BottomSheet`); web backed by react-dom/react-native-web, still experimental. In default template + Expo Go |
| @expo/ui extras | `useMaterialColors` (M3 dynamic color) + `@expo/material-symbols` package; worklets integration: `useNativeState` (`ObservableObject`/`MutableState`) and `WorkletCallback` sync callbacks ([worklet post](https://expo.dev/blog/worklet-integration-in-expo-ui-synchronously-controlling-swiftui-and-compose-state)); drop-in `@expo/ui/community/*` replacements for gorhom/bottom-sheet, datetimepicker, masked-view, menu, pager-view, picker, segmented-control, slider |
| **Expo Router decoupled from react-navigation** | No longer sits on `@react-navigation/*`; direct imports of those packages no longer resolve through router ([blog](https://expo.dev/blog/expo-router-v56-decoupling-from-react-navigation)) |
| Web/SSR | Streaming SSR behind `unstable_useServerRendering`; `generateMetadata`; data loaders `createStaticLoader` / `createServerLoader` (passes `request`); custom `SuspenseFallback` in `_layout` |
| Metro/CLI | On-demand filesystem default on (`experiment.onDemandFilesystem: false` to disable); native Node watcher replaces Watchman by default; `import.meta` auto-enabled; TS 6 resolution; reduced transforms for Hermes v1; global virtual store for pnpm/Bun (~300 MB saved per duplicate install) |
| Build perf | Prebuilt XCFrameworks for iOS Expo modules on by default (`EXPO_USE_PRECOMPILED_MODULES=0` to opt out), ~16% faster clean iOS builds; experimental Android CMake PCH via expo-build-properties (`android.usePrecompiledHeaders`), up to 2.81x on their benchmark; EAS precompiled artifacts for reanimated/screens cut ~20% more |
| Expo Modules | Inline modules w/ auto-autolinking; new `expo-type-information` package (`module-interface`, `inline-modules-interface`, `short-module-interface`); Kotlin compiler plugin replaces reflection — ~40% faster cold starts, Activity.onCreate 1.7x vs SDK 55; iOS JSI layer rewritten (Obj-C++ middle layer removed) |
| Updates | Hermes bytecode diffing now **default** (`enableBsdiffPatchSupport: false` to disable); ~58% smaller observed bundles |
| Misc | OO `expo-calendar`/`expo-contacts`/`expo-media-library` APIs stable; iOS Widgets stable; `<NavigationBar>` component; Convex provisioning CLI; AGENTS.md/CLAUDE.md scaffolding + official Expo Skills; EAS Observe announced |

### Breaking changes relevant from SDK 55/54

- **`expo/fetch` becomes `globalThis.fetch`** (WinterTC-compliant); opt out with `EXPO_PUBLIC_USE_RN_FETCH=1`.
- `File.copy()`/`File.move()` (+ Directory equivalents) return Promises; sync variants are `copySync()`/`moveSync()`.
- `@expo/dom-webview` replaces `react-native-webview` as the DOM-components default.
- **`expo` drops its `@expo/vector-icons` dependency**, and `@expo/vector-icons` itself is deprecated in favor of scoped `@react-native-vector-icons/*`; codemod: `npx @react-native-vector-icons/codemod`.
- Original Calendar/Contacts/MediaLibrary APIs deprecated (OO `/next` APIs are the path).
- **Router/react-navigation split**: code imported directly from `@react-navigation/*` packages no longer works out of the box; codemod `npx expo-codemod sdk-56-expo-router-react-navigation-replace [dir]`; `expo-doctor` warns when both installed (#45323).
- Minimums: Xcode **26.4**; iOS/tvOS **16.4**, macOS 13.4 — drops iPhone 7/7+, 6s/6s+, SE 1st gen, iPad mini 4, iPad Air 2; RN 0.85 requires Node ≥ 20.19.4; TypeScript pinned to **6.0.3** (opt out via `expo.install.exclude`).
- Known regression: importing `react-native-worklets` or `react-native-reanimated` can **drastically increase memory usage** — Hermes v1 bug shipped with RN 0.85 ([#46519](https://github.com/expo/expo/pull/46519)); worklets "bundle mode" is an unsupported workaround; dev-only startup slowdown #48298 (fix unreleased at announcement). Expo's own advice: treat SDK 57 as the fix vehicle.

### Ecosystem shifts

- Hermes V1 default; RN animation backend aligned to New Architecture only.
- Streaming SSR + metadata API land behind flags — direction of travel for `web.output: "server"` apps.
- Expo Go for SDK 56 not on either app store (TestFlight beta / `eas go` / CLI sideload) — Expo is actively pushing development builds.

### Upgrade-path notes for sakina-quran

- **This is the danger-hop for us.** We ship both `react-native-reanimated` and `react-native-worklets` (surah audio UI + gestures sit on them) → we hit #46519 head-on if we stop at 56 on default Hermes v1. Either pin `useHermesV1: false`, or plan 55→56→57 as one motion and land on `expo@≥57.0.9`.
- **Direct `@react-navigation/*` deps** (`native`, `bottom-tabs`, `elements`) collide with the router decoupling: run the `sdk-56-expo-router-react-navigation-replace` codemod, then decide whether bottom-tabs stay explicit or fold into router primitives.
- **`@expo/vector-icons` is a direct dependency here** (`^15.0.3`): after 56 it must be added explicitly anyway (we already have it), but the deprecation means scheduling the `@react-native-vector-icons/*` codemod as its own task, not during the SDK hop.
- `globalThis.fetch` swap touches react-query + our surah/audio fetching paths; smoke-test response parsing and abort behavior, keep `EXPO_PUBLIC_USE_RN_FETCH=1` as a rollback lever.
- Metro defaults flip (on-demand filesystem, Node watcher): our `pnpm export:full` Metro web export should be re-baselined; Watchman removal also removes a monorepo foot-gun but changes file-watching behavior in Docker/CI (node:22-alpine) — watch for ENOSPC/inotify issues.
- Streaming SSR flag + `generateMetadata` are directly relevant to our SEO scripts (`validate-seo.js`, sitemap generation) — worth a spike before adopting, not during the upgrade.
- Not affected: expo-file-system task APIs (not a direct dep), dom-webview, calendar/contacts/media-library.

---

## 4. SDK 57

Source: [expo.dev/changelog/sdk-57](https://expo.dev/changelog/sdk-57). Announced **June 30, 2026**.

**Core stack:** React Native **0.86** (`expo@57.0.9+` pins **0.86.2**), React **19.2** (unchanged from 56). Framed as "a small, focused release" — RN 0.86 is intended to have no breaking changes from 0.85 (601 commits / 1,552 files between 0.85.0 and 0.86.0).

### Headline features / new packages

| Item | Notes |
|---|---|
| RN 0.86 | Android edge-to-edge fixes, DevTools light/dark emulation, rendering/layout/animation fixes; **fixes the Hermes v1 memory blowup (#46519)** via RN 0.86.2 shipped in `expo@57.0.9` (published 2026-07-29; the changelog post's "Aug 13" note is its edit date) |
| New cadence experiment | Optional near-immediate non-breaking upgrades between SDK majors: `npx expo install expo@latest --fix` |
| `expo prebuild` cleans by default | Wipes + regenerates `android/`/`ios/`; `--no-clean` to opt out ([#47209](https://github.com/expo/expo/pull/47209)) |
| `expo-dev-client` iOS launcher setting | Auto-launch most recent project vs show launcher; config-plugin overridable ([#47131](https://github.com/expo/expo/pull/47131)) |
| `expo-image` cache APIs | `writeToCacheAsync` / `readFromCacheAsync` to seed/read image cache by key ([#46620](https://github.com/expo/expo/pull/46620)) |
| Router `Stack.Toolbar.Badge` | Now works in header left/right placements and Android toolbar menu icons |
| Library pins moved | Reanimated 4.5, worklets 0.10, gesture-handler ~2.32 (**still v2**) |

### Breaking changes relevant from SDK 56/54

- **No breaking changes declared** for 56→57.
- Behavioral only: `expo prebuild` default-clean of native dirs (CNG projects like ours are unaffected — we have no committed `ios/`/`android/`; non-CNG projects must use the upgrade helper).
- SDK lifetime note: releases get ~1 year of critical fixes; SDK 54 (Sept 2025) is supported until the next fall release (~Sept/Oct 2026).

### Ecosystem shifts

- RN's own framing: recent releases delivered New Architecture, DevTools, Hermes V1; focus has "shifted towards stability" — the ecosystem signal is consolidation, not new architecture churn.
- No web/export/Metro changes announced in this release.
- Expo Go store builds lag SDK releases (pending review); use `eas go` or CLI in the meantime.

### Upgrade-path notes for sakina-quran

- **This is the destination hop**: it carries the #46519 memory fix our reanimated/worklets usage needs. Landing on anything < `expo@57.0.9` leaves the bug in place — pin `~57.0.15` per [`PACKAGE_UPGRADES.md`](./PACKAGE_UPGRADES.md).
- gesture-handler stays **v2** at SDK 57 (~2.32) even though npm latest is 3.2.1, and pager-view stays v8 while npm latest is 9 — do not follow npm latest on either (already flagged in [`PACKAGE_UPGRADES.md`](./PACKAGE_UPGRADES.md) §2).
- Reanimated 4.1.6 → 4.5.x and worklets 0.5.1 → 0.10.x ride along via `--fix`; both are breaking-capable bumps (worklets crosses many 0.x minors) — budget time for the animation/audio-waveform screens, not just the install.
- `expo-image` cache APIs are a natural fit for pre-seeding ayah-page images; post-upgrade opportunity, not a migration item.

---

## 5. sdk-58 canary signals (as of 2026-08-24)

No SDK 58 announcement exists yet (no `sdk-58` changelog/blog page in [expo.dev sitemap](https://expo.dev/sitemap.xml)). Signals come from npm dist-tags, the unpublished section of [`packages/expo/CHANGELOG.md` on `main`](https://raw.githubusercontent.com/expo/expo/main/packages/expo/CHANGELOG.md), and the main-branch `bundledNativeModules.json`.

**Where it stands:**

| Signal | Value |
|---|---|
| npm `canary` dist-tag | `58.0.0-canary-20260812-27f94d4` (latest canary; first 58 canary published **2026-08-06**, only 2 so far) |
| `latest` / `next` | `57.0.15` — 58 is pre-beta; GA likely ~Oct–Nov 2026 if cadence holds (55: Feb, 56: May, 57: Jun 30) |
| React Native target | RN **0.87.0** went latest on npm **2026-08-11**, nightly is 0.88 — canary changelog already carries "fix iOS build against React Native 0.87+" (#46641) |
| gesture-handler pin on `main` | **`~3.1.0`** — up from ~2.32.0 at SDK 57: **v3 becomes Expo-pinned on the 58 line** |
| screens pin on `main` | ~4.27.0 (vs ~4.26.0 at 57) |
| reanimated / worklets on `main` | unchanged: 4.5.1 / 0.10.1 |

**Already-declared breaking change on the canary line:**

- **Minimum Node.js raised to `^22.13.0`** ([#47202](https://github.com/expo/expo/pull/47202)) — drops Node 20 entirely (SDK 55 supported `^20.19.4`). Our CI (`node:22-alpine`) must be ≥ 22.13.x; local Node 24 is fine.

**Other notable unpublished-changelog items (canary direction):**

- Legacy-architecture code paths excised further: dropped bridge-era `RCTRootViewFactoryConfiguration` setup to support RN 0.87+ (#46641).
- **UIKit scene-based lifecycle adopted** so apps built with the **iOS 27 SDK** launch correctly (#46733); companion fixes for `Linking.getInitialURL()` returning null on scene-lifecycle cold starts (#47628) and `ExpoAppSceneDelegate` unavailable in extensions/widgets (#46799, #47894).
- Several `expo/fetch` streaming race fixes (empty-body-on-200, AbortSignal hang, `.text()`/`.arrayBuffer()` never settling) (#47796, #47573, #48230) — relevant once we're on default `expo/fetch` from 56.
- Metro bump to `@expo/metro@56.0.2` / `metro@0.84.5`; web fixes for `import.meta.url` with `transform.inlineRequires` (#49045); DOM-components prop-update drop fix (#48813); `URL`/`URLSearchParams` IDNA/TR-46 rewrite and faster `TextDecoder`.

**Read-through for this app:** nothing actionable yet except (a) keep gesture-handler on v2 until an SDK that pins v3 ships stable, then let `--fix` take it in one hop; (b) confirm CI image ≥ Node 22.13 before any 58-era upgrade; (c) the reanimated/worklets memory fix we need is fully available at 57 — no reason to wait for 58.

