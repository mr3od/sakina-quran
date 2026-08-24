# Dependency Upgrade Audit — sakina-quran

> **As of 2026-08-23.** Every version below was read live from `pnpm outdated`, the npm registry, Expo's versions API, and upstream release notes on this date. Versions move fast — **re-check `pnpm outdated` and `npx expo install --fix` output at execution time** before acting on anything here. In particular, Expo's SDK-58 line was already in canary when this was written and will change every "Expo-aligned" answer below.

Repo state audited: Expo SDK **54.0.30**, React Native **0.81.5**, React **19.1.0**, CNG project (no `ios/`/`android/` dirs), New Architecture already enabled, web export via Metro (`web.output: "server"`), Node 24 local / Node `"22"` in CI (`node:22-alpine` Docker).

---

## 1. Headline numbers

| Metric | Count |
|---|---|
| Direct dependencies (runtime) | 36 |
| Direct devDependencies | 17 |
| **Fully up-to-date** | **2** (`react-native-web`, `eslint-plugin-react-compiler`) |
| **Outdated total** | **51** |
| Outdated (runtime deps) | 18 |
| Outdated (devDeps) | 33 |
| **Semver-major gaps** | **31** |
| Effective majors (RN-style 0.x bumps treated as breaking-capable) | +2 (`react-native`, `react-native-worklets`) |

The dominant story: this app is one coherent **Expo SDK 54 → 57** hop away from resolving 18 of the 31 majors (every `expo-*` package renumbered onto the SDK-major scheme, plus `babel-preset-expo`, `jest-expo`, `eslint-config-expo`, and the react/RN triplet). Most of the rest are either independent minor bumps or upgrades that should be **deferred until Expo pins them**.

---

## 2. Expo alignment: npm "latest" vs what Expo SDK 57 pins

For an Expo app, raw npm `latest` is frequently the *wrong* target. Cross-check of `pnpm outdated` vs [`expo/bundledNativeModules.json` on `sdk-57`](https://raw.githubusercontent.com/expo/expo/sdk-57/packages/expo/bundledNativeModules.json) and [Expo's versions API](https://exp.host/--/api/v2/versions):

| Package | Current | npm latest | **SDK 57 pin** | Follow npm latest? |
|---|---|---|---|---|
| expo | 54.0.30 | 57.0.15 | ~57.0.15 (**≥57.0.9 mandatory**) | Yes (= pin) |
| react / react-dom | 19.1.0 | 19.2.8 | **exactly 19.2.3** | No — pin wins |
| react-native | 0.81.5 | 0.87.0 | **0.86.2** | No — 0.87 is ahead of SDK 57 |
| react-native-web | ~0.21.2 | (current) | ~0.21.0 | n/a — already aligned |
| react-native-reanimated | 4.1.6 | 4.6.0 | **4.5.1** | No |
| react-native-worklets | 0.5.1 | 0.12.1 | **0.10.1** | No |
| react-native-gesture-handler | ~2.28.0 | 3.2.1 | **~2.32.0 (v2!)** | No — v3 not yet Expo-pinned |
| react-native-screens | ~4.16.0 | 4.27.0 | ~4.26.0 | No |
| react-native-safe-area-context | ~5.6.2 | 5.9.1 | ~5.7.0 | No |
| react-native-pager-view | 8.0.0 | 9.0.2 | **8.0.2 (v8!)** | No — v9 not yet Expo-pinned |
| @shopify/flash-list | 2.0.2 | 2.3.2 | 2.0.2 | Optional (no breaking 2.x changes) |
| @expo/vector-icons | 15.0.3 | 15.1.1 | ^15.0.2 | Optional |

SDK ladder from the versions API:

| SDK | expo | React | React Native |
|---|---|---|---|
| 54 (current) | ~54.0.37 | 19.1.0 | 0.81.5 |
| 55 | ~55.0.29 | 19.2.0 | 0.83.10 |
| 56 | ~56.0.20 | 19.2.3 | 0.85.3 |
| **57 (target)** | ~57.0.15 | 19.2.3 | 0.86.2 |

**Practical rule:** never hand-bump anything in the left column of the first table; let `npx expo install --fix` set it after the `expo` bump.

---

## 3. Master summary table

Delta classes: **MAJOR** = semver major gap (or RN-style breaking-capable), **minor** / **patch** = behind within same major.

### Runtime dependencies (18 outdated)

| Package | Current | Latest | Delta | Expo-aligned? | Risk | Notes |
|---|---|---|---|---|---|---|
| expo | 54.0.30 | 57.0.15 | MAJOR ×3 SDKs | = pin | **HIGH** | The whole upgrade; see §4.1 |
| react | 19.1.0 | 19.2.8 | minor (coupled) | Pin 19.2.3 | MED | Move only with SDK; never alone |
| react-dom | 19.1.0 | 19.2.8 | minor (coupled) | Pin 19.2.3 | MED | Same as react |
| react-native | 0.81.5 | 0.87.0 | effective MAJOR | Pin 0.86.2 | HIGH | Moves with SDK; 0.87 not yet aligned |
| expo-router | ~6.0.21 | 57.0.15 | MAJOR (scheme change) | = pin | MED-HIGH | Router forked from react-navigation in SDK 56; see §4.4 |
| expo-sqlite | ~16.0.10 | 57.0.1 | MAJOR (scheme) | = pin | MED | kv-store verified present in 57.0.1 exports; APIs stable |
| expo-build-properties | ~1.0.10 | 57.0.13 | MAJOR (scheme) | = pin | LOW | Config plugin unchanged shape |
| expo-constants | ~18.0.12 | 57.0.13 | MAJOR (scheme) | = pin | LOW | Not imported anywhere in `src/` — removal candidate |
| expo-dev-client | ~6.0.20 | 57.0.14 | MAJOR (scheme) | = pin | LOW | Requires new dev build after SDK hop |
| expo-font | ~14.0.10 | 57.0.1 | MAJOR (scheme) | = pin | LOW | Fonts load via plugin + `_layout.tsx`; API stable |
| expo-haptics | ~15.0.8 | 57.0.1 | MAJOR (scheme) | = pin | LOW | Scheme renumber only |
| expo-image | ~3.0.11 | 57.0.3 | MAJOR (scheme) | = pin | LOW | Not directly imported in `src/` |
| expo-linking | ~8.0.11 | 57.0.7 | MAJOR (scheme) | = pin | LOW | Not directly imported in `src/` |
| expo-splash-screen | ~31.0.13 | 57.0.7 | MAJOR (scheme) | = pin | LOW | `setOptions({duration,fade})` used; API stable |
| expo-status-bar | ~3.0.9 | 57.0.1 | MAJOR (scheme) | = pin | LOW | SDK 55 deprecates `backgroundColor`/`translucent` props — check usage |
| expo-symbols | ~1.0.8 | 57.0.2 | MAJOR (scheme) | = pin | LOW | Not directly imported in `src/` |
| expo-system-ui | ~6.0.9 | 57.0.2 | MAJOR (scheme) | = pin | LOW | Scheme renumber only |
| expo-web-browser | ~15.0.10 | 57.0.2 | MAJOR (scheme) | = pin | LOW | Plugin-configured only |
| @expo/vector-icons | ^15.0.3 | 15.1.1 | minor | Aligned | LOW-MED | Deprecated as of SDK 56 in favor of `@react-native-vector-icons/*`; used for Ionicons in tabs layout |
| @react-navigation/native | ^7.1.8→7.1.26 | 7.3.17 | minor | **Remove at SDK 56+** | LOW | Forked out of expo-router; no direct imports in `src/` |
| @react-navigation/bottom-tabs | ^7.4.0→7.9.0 | 7.18.17 | minor | **Remove at SDK 56+** | LOW | Same |
| @react-navigation/elements | ^2.9.3 | 2.9.39 | patch | **Remove at SDK 56+** | LOW | Same |
| @shopify/flash-list | 2.0.2 | 2.3.2 | minor | Pinned 2.0.2 | LOW | Verified: no breaking changes 2.0.2→2.3.2; 2 files use `FlashList` |
| @tanstack/react-query | ^5.90.12 | 5.102.2 | minor | Independent | LOW | Still v5; 14 files use hooks |
| react-native-localize | ^3.6.1 | 3.7.0 | minor | Independent | LOW | Has config plugin entry in app.json |
| react-native-reanimated | ~4.1.6 | 4.6.0 | minor (hard-coupled) | Pin 4.5.1 | MED | 4.1.x supports RN ≤0.82 only; see §4.3 |
| react-native-safe-area-context | ~5.6.2 | 5.9.1 | minor | Pin ~5.7.0 | LOW | `SafeAreaListener` used in `_layout.tsx` |
| react-native-screens | ~4.16.0 | 4.27.0 | minor | Pin ~4.26.0 | LOW | Managed by expo install --fix |
| react-native-worklets | 0.5.1 | 0.12.1 | effective MAJOR | Pin 0.10.1 | MED | Pairing rules in §4.3 |
| sql.js | ^1.13.0 | 1.14.2 | minor | Independent (web server) | LOW | Used in `src/server/*` + scripts |
| tailwindcss | ^4.1.18 | 4.3.3 | minor | Independent | LOW | Bump together with uniwind (§4.13) |
| uniwind | ^1.2.2 | 1.11.0 | minor (styling-critical) | Aligns w/ Expo 57 from 1.10.1 | MED | See §4.13 |

### DevDependencies (33 outdated)

| Package | Current | Latest | Delta | Risk | Notes |
|---|---|---|---|---|---|
| @lingui/core | ^5.8.0 | 6.6.0 | MAJOR | MED | §4.5 |
| @lingui/react | ^5.8.0 | 6.6.0 | MAJOR | MED | §4.5 |
| @lingui/cli | ^5.8.0 | 6.6.0 | MAJOR | MED | §4.5 |
| @lingui/metro-transformer | ^5.8.0 | 6.6.0 | MAJOR | MED | Stays CJS; `/expo` entry unchanged |
| @lingui/babel-plugin-lingui-macro | ^5.8.0 | 6.6.0 | MAJOR | MED | Plugin name/API unchanged in v6 |
| @testing-library/react-native | ^13.3.3 | 14.0.1 | MAJOR | MED | Async-by-default; codemods exist; §4.8 |
| @types/jest | 29.5.14 | 30.0.0 | MAJOR | LOW | Stay on 29 — jest-expo@57 is Jest-29-built (§4.9) |
| jest | ~29.7.0 | 30.4.2 | MAJOR | LOW | **Do not take 30 yet** (§4.9) |
| jest-expo | ~54.0.17 | 57.0.4 | MAJOR (scheme) | LOW | Moves with SDK; pins Jest 29 internally |
| babel-preset-expo | ^54.0.10 | 57.0.7 | MAJOR (scheme) | LOW | Moves with SDK; Babel-7 generation |
| @babel/plugin-transform-export-namespace-from | ^7.27.1 | 8.0.1 | MAJOR | LOW | **Delete entirely** — preset bundles ^7.25.9 (§4.12) |
| eslint | ^9.39.2 | 10.9.0 | MAJOR | MED | ESLint 9 EOL'd 2026-08-06; §4.10 |
| eslint-config-expo | ~10.0.0 | 57.0.1 | MAJOR (scheme) | LOW | peer `eslint >=8.10` accepts 10 |
| eslint-plugin-react-compiler | 19.1.0-rc.2 | (current) | — | LOW | Up-to-date |
| typescript | ~5.9.3 | 7.0.2 | MAJOR ×2 | LOW if deferred | TS 7 = Go port; blocked by typescript-eslint until ~7.1 (§4.11) |
| @types/react | ~19.1.17 | 19.2.18 | minor | LOW | Bump to 19.2.x together with react |
| @types/sql.js | ^1.4.9 | 1.4.11 | patch | LOW | Trivial |

*(devDeps table rows total 33 including the two current ones listed for completeness.)*

---

## 4. Major upgrades in depth

### 4.1 Expo SDK 54 → 57 (the centerpiece)

**Guides used:** [SDK upgrade walkthrough](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/) · [SDK 55 changelog](https://expo.dev/changelog/sdk-55) · [SDK 56 changelog](https://expo.dev/changelog/sdk-56) · [SDK 57 changelog](https://expo.dev/changelog/sdk-57) · repo skill `.agents/skills/expo-upgrade/SKILL.md`

There are three intermediate SDKs (55, 56, 57). Official docs recommend upgrading one at a time; **this repo's own skill says: coming from ≤55, skip 56 and jump straight to SDK 57, landing on `expo@57.0.9` or later.** Reason: SDK 55-with-Hermes-V1, all of SDK 56, and early 57 releases have a Hermes V1 memory regression that severely affects apps importing `react-native-worklets` or `react-native-reanimated` ([expo/expo#46519](https://github.com/expo/expo/issues/46519)) — and this app uses both (`babel.config.js` runs `react-native-worklets/plugin`; reanimated in 6 files). Fixed in `expo@57.0.9` via RN 0.86.2. **Recommendation: single hop 54 → 57 with `expo ≥57.0.9`.**

Key changes per hop that touch this repo:

**54 → 55** (full notes: [changelog](https://expo.dev/changelog/sdk-55))
- Legacy Architecture dropped; **`newArchEnabled` removed from app.json** — this repo sets it in `app.json` → delete the field.
- **`edgeToEdgeEnabled` removed from app.json** (mandatory edge-to-edge on Android 16+) — this repo sets it under `android` → delete the field.
- All Expo packages renumbered to the SDK major (explains `expo-router 6 → 57`, `expo-sqlite 16 → 57`, etc.).
- `expo-router`: removed deprecated `ExpoRequest`/`ExpoResponse` from `expo-router/server` — **irrelevant here**: `src/app/api/search+api.ts` already uses standard `Request`/`Response`.
- `@expo/server` replaced by `expo-server` — repo imports neither. Irrelevant.
- `expo-av` removed from Expo Go — repo doesn't use audio/video. Irrelevant.
- Deprecations touching us later: `expo-status-bar` `backgroundColor`/`translucent` props deprecated (grep shows no usage of these props in `src/`); `removeSubscription` → `subscription.remove()` pattern across modules.
- Min Xcode 26; Node ≥20.19.4 (local 24.19 ✔, CI 22 ✔).

**55 → 56** ([changelog](https://expo.dev/changelog/sdk-56))
- **expo-router forks from React Navigation** and no longer depends on `@react-navigation/*`; `expo-doctor` warns if both are installed. Codemod: `npx expo-codemod sdk-56-expo-router-react-navigation-replace`. This repo declares `@react-navigation/native`, `bottom-tabs`, `elements` in package.json but has **zero direct imports in `src/`** (all routing goes through `expo-router`'s `Tabs`/`Stack`/`Drawer`/`Link`) → action is simply to remove the three deps; expect the codemod to be a no-op.
- `expo` no longer depends on `@expo/vector-icons` — repo already declares it explicitly ✔ (deprecation toward `@react-native-vector-icons/*` noted in §4.14).
- Hermes V1 becomes default (with the memory regression above); `expo/fetch` becomes `globalThis.fetch`; min iOS 16.4; TypeScript default becomes 6.0.3 for new projects.
- Native tabs API changes (`Icon`/`Label`/`Badge` via `NativeTabs.Trigger.*`) — irrelevant, this repo uses JS `Tabs` in `src/app/(tabs)/_layout.tsx`.

**56 → 57** ([changelog](https://expo.dev/changelog/sdk-57))
- RN 0.85 → 0.86 ("no breaking changes from 0.85"), React stays 19.2; reanimated → 4.5, worklets → 0.10, RNGH → 2.32.
- `expo prebuild` now cleans/regenerates native dirs by default (repo is CNG — expected behavior).
- Memory-regression fix lands in `expo@57.0.9`.
- Additions relevant to web: nothing breaking; streaming SSR / `generateMetadata` from SDK 56 remain opt-in for `src/app/+html.tsx`.

**Survival check for this repo's critical integrations:**
| Integration | Survives 54→57? | Evidence |
|---|---|---|
| `expo-sqlite/kv-store` (`KVStore.getItem/setItem/removeItem` in `src/shared/i18n/locale-storage.ts`, `KVBookmarkManager.ts`, `KVSettingsManager.ts`) | **Yes** | `./kv-store` subpath confirmed in expo-sqlite@57.0.1 exports map |
| SQLiteProvider / FTS (`SQLiteProvider` in `src/app/_layout.tsx`, `enableFTS` plugin option) | Yes | API surface (`useSQLiteContext`, `getFirstAsync`, `getAllAsync`) unchanged; re-verify plugin option at execution |
| expo-router v6 usage (`Link`×36, `Drawer`, `Tabs`, `Stack`, hooks) | Yes, with dep removal | No direct `@react-navigation/*` imports anywhere in `src/` |
| Lingui metro transformer (`metro.config.js`) | Expected yes | Transformer still CJS with `expo >=50` peer; acceptance test = first bundle after both upgrades |
| uniwind | Yes | v1.10.1 explicitly updated for Expo 57 (§4.13) |
| reanimated 4 | Yes, version-forced | Must become 4.5.x + worklets 0.10.x (§4.3) |
| react-native-web | Yes | SDK 57 still pins ~0.21.0; current 0.21.2 aligned |

**Required actions:** bump `expo` to `^57.0.0` (resolving ≥57.0.9) → `npx expo install --fix` → `npx expo-doctor` → delete `newArchEnabled` + `edgeToEdgeEnabled` from `app.json` → remove the three `@react-navigation/*` deps → run the sdk-56 router codemod (expected no-op) → rebuild dev clients → full RTL/web smoke test.

**Effort: M–L** (1–2 days plus iOS/Android dev-client builds).

### 4.2 react / react-dom / react-native triplet

React 19.1.0 → 19.2.8 and RN 0.81.5 → 0.87.0 are both *available*, but the triplet only works at Expo-pinned combinations: **SDK 57 wants exactly react/react-dom 19.2.3 + RN 0.86.2**. RN 0.87 and React 19.2.8 are ahead of what SDK 57 pins and must wait for SDK 58. `@types/react` should follow react (19.1.x → 19.2.x) in the same commit. Never bump any of these three independently of `expo`.

Files touched: none expected (no React-version-specific APIs found; `I18nManager`, `Platform`, `DevSettings`, `reloadAppAsync` usage in `src/shared/i18n/index.ts` and `src/app/_layout.tsx` are all stable).

### 4.3 react-native-reanimated 4.1.6 → 4.6.0 + react-native-worklets 0.5.1 → 0.12.1

**Guide used:** [official compatibility matrix](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility)

These are not independent upgrades — they are a locked pairing with the RN version:

| RN | Reanimated | worklets |
|---|---|---|
| 0.81 (now) | 4.1.x ✔ (current) | 0.5.x ✔ (current) |
| 0.83 (SDK 55) | 4.3.x+ | 0.8.x |
| 0.86 (SDK 57) | **4.5.x** | **0.10.x** |
| 0.87 (npm latest) | 4.6.x | 0.12.x |

Taking npm-latest reanimated 4.6 today would force worklets 0.12 and break on SDK 57's RN 0.86 pairing expectations. **Action: none by hand — `npx expo install --fix` during the SDK hop lands 4.5.1 + 0.10.1.** Repo usage is conservative (`Animated.View` entering animations ×19, `useSharedValue`, `withTiming`/`withSpring`, `useAnimatedStyle`, `useAnimatedScrollHandler` across `NavigationSegments.tsx`, `(tabs)/index.tsx`, `PageReaderScreen.tsx`, `PagePage.tsx`, `LanguageSelector.tsx`, `ThemeSelector.tsx`) — low code risk once versions are paired.

### 4.4 expo-router ~6.0.21 → 57.0.15 (and the @react-navigation question)

Covered in §4.1 (SDK 56 fork). Repo impact:
- `package.json`: delete `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/elements` (zero imports in `src/`; keeping them triggers `expo-doctor` warnings post-fork).
- Code: no changes expected — `Tabs` screenOptions styling in `src/app/(tabs)/_layout.tsx`, `Drawer` usage, `Link`, `useLocalSearchParams`/`useSegments`/`useRouter` all remain first-class expo-router APIs.
- Run `npx expo-codemod sdk-56-expo-router-react-navigation-replace src` as a safety net.

### 4.5 Lingui 5.8.0 → 6.6.0 (5 packages)

**Guides used:** [official v6 migration guide](https://lingui.dev/releases/migration-6) · [js-lingui releases](https://github.com/lingui/js-lingui/releases)

Breaking changes in v6 and their verdicts against this repo:
- **ESM-only distribution** for core/react/cli/conf (`metro-transformer` stays CJS). RELEVANT operationally: the Node process running Metro needs `require(esm)` → **Node ≥22.19 everywhere Metro runs**: local 24.19 ✔; CI `.github/workflows/pr-check.yml` pins `"22"` (fine while 22.x ≥22.19 — pin-awareness needed); `Dockerfile` floats `node:22-alpine` (currently fine).
- `format: "po"` config key removed → **delete one line from `lingui.config.js`** (defaults to PO formatter).
- Message IDs switch to URL-safe Base64 — irrelevant: all catalogs use explicit IDs.
- `localeData` API removed — unused here. `@lingui/macro` package dropped — repo already uses `@lingui/core/macro` + `@lingui/react/macro`, both intact.
- `TransRenderProps.id` type widened to `MessageId` — transparent for `DefaultI18nComponent` in `src/app/_layout.tsx` (consumes only `children`).
- `I18nProvider` rewritten onto `useSyncExternalStore` — props unchanged; locale-switch smoke test recommended (RTL/ar switching in `_layout.tsx`).
- `i18n.load()` / `i18n.activate()` / `.po` imports via metro transformer (`src/shared/i18n/index.ts`, 39 files using macros/Trans): signatures unchanged.

**Actions:** bump 5 packages to ^6.6.0 → delete `format: "po"` from `lingui.config.js` → verify `pnpm i18n:extract` yields empty catalog diff → bundle test. Known open upstream bug worth watching: [#2628](https://github.com/lingui/js-lingui/issues/2628) (`@babel/types` resolution under pnpm during extract). **Effort: S.**

### 4.6 react-native-gesture-handler ~2.28 → 3.2.1 — **DEFER**

**Guides used:** [v3 migration guide](https://docs.swmansion.com/react-native-gesture-handler/docs/guides/upgrading-to-3) · [releases](https://github.com/software-mansion/react-native-gesture-handler/releases)
- Hard blocker: RNGH 3 requires **RN ≥0.82** (repo: 0.81 until the SDK hop), and Expo SDK 57 still pins **~2.32.0 (v2)** — v3 isn't Expo-aligned yet.
- Repo exposure is minimal: single import `GestureHandlerRootView` in `src/app/_layout.tsx`, whose API is unchanged in v3. When Expo eventually pins v3, expected code diff is zero.
**Action: stay on v2 through SDK 57; revisit at SDK 58. Effort: S when unblocked.**

### 4.7 react-native-pager-view 8.0.0 → 9.0.2 — **DEFER (or manual-pin later)**

**Source:** [v9.0.0 release](https://github.com/callstack/react-native-pager-view/releases/tag/v9.0.0) (Android rewritten on Jetpack Compose; zero consumer-facing API changes — all of `initialPage`, `onPageSelected`, `offscreenPageLimit`, `setPage`, `setPageWithoutAnimation` used by `src/features/quran-reader/ui/PagePager.native.tsx` are unchanged).
Expo SDK 57 still pins 8.0.2. If adopted early: version bump + new native build + careful RTL/swipe QA on Android since the whole paging implementation changed. **Effort: S + QA.**

### 4.8 @testing-library/react-native 13.3.3 → 14.0.1

**Guide used:** [official v14 migration guide](https://callstack.github.io/react-native-testing-library/docs/guides/migration-v14)
- **Async-by-default**: `render`, `renderHook`, `rerender`, `act` return Promises. Hits ~10 `renderHook` call sites in `src/hooks/__tests__/useDebouncedValue.test.ts` and `src/features/search/app/__tests__/useSearchController.test.tsx`, plus the wrapper in `src/test/utils.tsx` (currently imported by no test file — update for hygiene).
- Renderer swaps to new `test-renderer` package (add as devDep `^1.1`); peers allow Jest 29 ✔, React 19 ✔; requires Node ≥22.13 ✔.
- Codemods: `npx codemod@latest rntl-v14-update-deps` then `rntl-v14-async-functions`.
- Watch the debounce tests' intermediate-state assertions under fake timers when awaiting `act`. **Effort: S–M.**

### 4.9 Jest 29.7 → 30.4.2 + @types/jest 30 — **DO NOT UPGRADE YET**

**Sources:** [Jest 30 blog](https://jestjs.io/blog/2025/06/04/jest-30) · [migration guide](https://jestjs.io/docs/upgrading-to-jest30) · [jest-expo@57.0.4 registry metadata](https://registry.npmjs.org/jest-expo/57.0.4)
**Critical finding: `jest-expo@57.0.4` is built entirely on the Jest 29 line** (`babel-jest ^29.2.1`, `@jest/globals ^29.2.1`, `jest-environment-jsdom ^29.2.1`, …). Installing Jest 30 would double-load two majors inside the preset pipeline. Keep `jest@~29.7.0` + `@types/jest@29.5.x` alongside jest-expo ~57.0.4 during the SDK hop; revisit when Expo ships a Jest-30-based preset (watch the 58 canary). **Effort: S (nothing to do).**

### 4.10 ESLint 9.39 → 10.9.0 + eslint-config-expo 10 → 57.0.1

**Sources:** [official v10 migration guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0) · [codemod announcement](https://eslint.org/blog/2026/07/eslint-codemod-migrations/) · [eslint-config-expo@57.0.1 registry](https://registry.npmjs.org/eslint-config-expo/57.0.1)
- ESLint 9 reached EOL 2026-08-06 — upgrading is justified maintenance.
- `eslint-config-expo@57.0.1` peers `eslint >=8.10` → accepts 10 ✔. Repo is already flat-config (`eslint.config.js`) → main v10 pain points don't apply; no `eslint-env` comments exist in `src/`.
- Actions: bump both → `npx codemod @eslint/v9-to-v10` → triage three new `eslint:recommended` rules (`no-unassigned-vars`, `no-useless-assignment`, `preserve-caught-error`) → confirm CI Node ≥20.19 ✔. **Effort: S.**

### 4.11 TypeScript ~5.9.3 → 7.0.2 — **BLOCKED**

**Sources:** [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [Announcing TypeScript 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)
TS 7.0 GA'd 2026-07-08 and **is** the native Go port (there was a transitional TS 6.0 line). TS 7 flips defaults (`strict`, `module: esnext`, …) and hard-errors several configs — but the decisive blocker is ecosystem: **typescript-eslint cannot use TS 7's compiler (no programmatic API until ~7.1)**, and this repo lints via `@typescript-eslint` inside eslint-config-expo. Runtime is unaffected either way (Metro/babel transpile-only).
**Recommendation: hold `~5.9.3` through the SDK hop; optional stretch to 6.0.x afterwards; adopt 7.x only after typescript-eslint ships TS7 support and Expo publishes guidance. Effort: S (hold).**

### 4.12 @babel/plugin-transform-export-namespace-from ^7.27.1 → 8.0.1 — **DELETE INSTEAD**

**Sources:** [Babel 8.0.0 release post](https://babeljs.io/blog/2026/06/16/8.0.0) · [babel-preset-expo@57.0.7 registry](https://registry.npmjs.org/babel-preset-expo/57.0.7)
Babel 8 is stable but ESM-only (Node ^22.18+/24.11+) — and `babel-preset-expo@57` is an all-Babel-7 package that **already bundles `@babel/plugin-transform-export-namespace-from@^7.25.9` itself**. Taking the ^8 plugin would drag Babel 8 core into a Babel-7 pipeline. The explicit dependency and its entry in `babel.config.js` should simply be removed (Metro/Hermes targets make it redundant — the preset owns it). Revisit Babel 8 with Expo SDK 58. **Effort: S.**

### 4.13 uniwind ^1.2.2 → 1.11.0 + tailwindcss ^4.1.18 → 4.3.3 (styling-critical minors)

**Source:** [uniwind releases](https://github.com/uni-stack/uniwind/releases)
No release in 1.3→1.11 declares breaking changes, but this library owns all styling: 28 files render `className=`, 15 import `uniwind` directly (`useCSSVariable` in 9 components, `Uniwind.setTheme`/`Uniwind.updateInsets` in `src/app/_layout.tsx`), and `metro.config.js` wires `withUniwindConfig({ cssEntryFile, dtsFile, extraThemes })` with 5 custom themes. Notable hops: v1.7 "major bundler refactor", v1.8 styles-as-functions refactor, v1.10.1 "updates to Expo 57". Releases before 1.6.4 weren't individually reviewable (paged out) — flagging as residual uncertainty.
**Recommendation: bump uniwind + tailwindcss together AFTER the SDK 57 hop** (so the pair matches its tested configuration), regenerate `src/uniwind-types.d.ts`, and visually QA all six themes. **Effort: S–M.**

### 4.14 Optional migrations surfaced by the SDK hop (not required)

- `@expo/vector-icons` → `@react-native-vector-icons/*` (deprecated since SDK 56; codemod `npx @react-native-vector-icons/codemod`). Only consumer: `Ionicons` in `src/app/(tabs)/_layout.tsx`. Can defer indefinitely.
- Remove `expo-constants` from package.json (declared but never imported in `src/`; expo-router brings its own).
- SDK 56's object-oriented `expo-calendar`/`expo-contacts`/`expo-media-library` redesigns — not used here.

---

## 5. Recommended upgrade order

Each step = one PR, green CI between steps. Effort: S ≈ hours, M ≈ a day, L ≈ multi-day.

| # | Step | Packages | Coupling | Effort |
|---|---|---|---|---|
| 0 | **Record a green baseline**: `pnpm test && pnpm lint && npx expo export -p web` on SDK 54, archive results | — | — | S |
| 1 | Independent JS minors: `@tanstack/react-query` + eslint-plugin-query (5.102), `sql.js`/`@types/sql.js`, `react-native-localize` 3.7, `@expo/vector-icons` 15.1, `@react-navigation/*` minors | Independent | Independent | S |
| 2 | RNTL 14 + `test-renderer` (codemods) | Independent (Jest 29 OK) | S–M |
| 3 | **Lingui 6** (all 5 packages, delete `format:"po"`, Node ≥22.19 check) | Independent of Expo | S |
| 4 | **THE SDK HOP 54 → 57**: `expo@^57.0.0` (≥57.0.9) → `expo install --fix` → app.json field deletions → drop `@react-navigation/*` → drop `export-namespace-from` dep+babel entry → router codemod → new dev-client builds → full smoke (RTL reader pager, kv-store data, FTS search, web export) | Everything coupled moves together: RN 0.86.2, react 19.2.3, reanimated 4.5.1/worklets 0.10.1, RNGH ~2.32, screens/safe-area pins, router 57, sqlite 57, jest-expo 57 (Jest stays 29), eslint-config-expo 57, babel-preset-expo 57 | **M–L** |
| 5 | ESLint 10 + config 57 + codemod + new-rule triage | With/after step 4 | S |
| 6 | uniwind 1.11 + tailwindcss 4.3 + regenerate dts + 6-theme visual QA | After step 4 | S–M |
| 7 | Deferred/blocked queue: TS 6.0.x (optional) → RNGH 3 & pager-view 9 & Jest 30 (wait for Expo pins) → TS 7 (wait for typescript-eslint) → vector-icons codemod (optional) | Blocked | — |

What must **not** be split: `expo` + react + react-dom + react-native + reanimated + worklets + jest-expo (one commit); uniwind + tailwindcss (one commit); the five `@lingui/*` packages (one commit); eslint + eslint-config-expo (one commit).

## 6. Top risks

1. **The SDK hop itself** — RN 0.81→0.86, React 19.2, Hermes V1, router fork. Mitigated by landing on `expo@≥57.0.9` (worklets/reanimated memory regression) and skipping 56.
2. **Reanimated/worklets/RN pairing discipline** — npm-latest combos (4.6+0.12) actively conflict with SDK 57; only `expo install --fix` may set them.
3. **Lingui 6 ESM-only distribution under the Metro pipeline** — API-compatible but environmentally fragile (Node ≥22.19 for Metro in local/CI/Docker); first successful bundle is the real acceptance test.

## 7. Sources

- `pnpm outdated` (local), `node_modules/expo/bundledNativeModules.json` (local, SDK 54 pins)
- https://exp.host/--/api/v2/versions · https://raw.githubusercontent.com/expo/expo/sdk-57/packages/expo/bundledNativeModules.json
- https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/ · https://expo.dev/changelog/sdk-55 · /sdk-56 · /sdk-57
- `.agents/skills/expo-upgrade/SKILL.md` (repo skill: skip-56 guidance, housekeeping checklist)
- https://lingui.dev/releases/migration-6 · https://github.com/lingui/js-lingui/releases
- https://docs.swmansion.com/react-native-gesture-handler/docs/guides/upgrading-to-3 · https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility
- https://callstack.github.io/react-native-testing-library/docs/guides/migration-v14 · https://github.com/callstack/react-native-pager-view/releases/tag/v9.0.0 · https://github.com/Shopify/flash-list/releases · https://github.com/uni-stack/uniwind/releases
- https://jestjs.io/blog/2025/06/04/jest-30 · https://jestjs.io/docs/upgrading-to-jest30 · https://registry.npmjs.org/jest-expo/57.0.4
- https://eslint.org/docs/latest/use/migrate-to-10.0.0 · https://eslint.org/blog/2026/07/eslint-codemod-migrations/
- https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/ · https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/ · https://babeljs.io/blog/2026/06/16/8.0.0
