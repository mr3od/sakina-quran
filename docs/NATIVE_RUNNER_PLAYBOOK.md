# Native Runner Playbook — Android emulator + iOS simulator on GitHub Actions

> Distilled from the 2026-08-24 render-lab session: ~10 CI runs to go from
> zero to green on both platforms on this repo. Every trap below was hit,
> diagnosed from logs/source, and fixed — don't re-learn any of it.
> Reference implementation: `.github/workflows/native-runner-evidence.yml`
> (branch `worktree-mushaf-text-spike`, first all-green run `32688915212`).

## Cost facts

- **Public repos: Actions is free, including macOS runners** (standard classes only; larger runners always bill).
- Cold Android build ≈ 14 min; `gradle/actions/setup-gradle@v6` cuts most of it from run 2 onward. **Cache uploads happen in post-job steps — cancelling a job mid-build forfeits the cache it would have saved.**
- KVM-enabled emulator boots in ~49 s; without KVM, minutes-to-forever.

## Traps, in the order they bite

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| 1 | `pnpm install --frozen-lockfile` exits 1: `ERR_PNPM_IGNORED_BUILDS` (esbuild, unrs-resolver) | Floating `corepack prepare pnpm@latest` — newer pnpm hard-fails on unapproved build scripts (older 10.x only warned) | Pin pnpm: `"packageManager"` in package.json **and** `corepack prepare pnpm@<ver> --activate` in every workflow. Floating tags are time bombs |
| 2 | Android emulator loops forever on `getprop sys.boot_completed` | Missing KVM acceleration on `ubuntu-latest` (ReactiveCircus #370: ~15 s with KVM vs 2 min+ without) | udev rule step **before** the emulator: write `/etc/udev/rules.d/99-kvm4all.rules`, `udevadm control --reload-rules && udevadm trigger --name-match=kvm`. Also pin `api-level: 33` + `-no-window -gpu swiftshader_indirect -noaudio -no-boot-anim -camera-back none -no-snapshot` |
| 3 | Emulator-runner script dies: `Syntax error: expecting "}"` / `"done"` / quotes misbehave | **The action splits your script on newlines and executes EACH LINE via `sh -c "<line>"`** (verified in `script-parser.ts` + `main.ts`) | Every line = one complete command. **No multi-line blocks, no functions, NO double quotes anywhere** (they break the outer wrapper). Unroll loops; avoid `&` in unquoted URLs |
| 4 | Deep link opens the app once, later links don't navigate (BOTH platforms) | Warm intents/openurls into the running app aren't routed by expo-router reliably | **Cold-start every capture**: `adb shell am force-stop <pkg>` / `xcrun simctl terminate <udid> <pkg>` before each link. First-launch-then-link works exactly once |
| 5 | iOS: every screenshot shows system "Open in \<App\>?" dialog | Fresh simulators prompt LaunchServices confirmation for custom schemes | Pre-approve **after boot, before install**: `xcrun simctl spawn <udid> defaults write com.apple.launchservices.schemeapproval "com.apple.CoreSimulator.CoreSimulatorBridge--><SCHEME>" -string <BUNDLE_ID>`. Contract per expo#47614: key is **scheme only** (not the full URL), value is **`-string` bundle id** (not `-bool`) — both wrong variants fail silently |
| 6 | iOS build "succeeds" but no app bundle / `simctl install` aborts (trap 6) | Scheme resolution picked a **Pods** scheme (`EXConstants` positionally, `Pods-sakinaquran` by naive name match) | Resolve scheme from `xcodebuild -workspace *.xcworkspace -list`, filter `^[[:space:]]*Pods-` (**lines are indented — `^Pods-` matches nothing**), match app name. Save the scheme list as an artifact so this is never re-debugged from logs |
| 7 | `simctl install` → `NSPOSIXErrorDomain code=2` | `APP_PATH` was relative to the build step's `working-directory: ios`, consumed from repo root | Export **absolute** paths (`$PWD/$APP`) into `GITHUB_ENV` |
| 8 | Failed `xcodebuild` still exits 0 | GitHub's default step shell has `-e` but **not pipefail**; `xcodebuild … \| tail -30` masks it | `set -o pipefail` before any piped build command |
| 9 | Valid renders flagged blank / garbage published as evidence | Size-threshold asserts are content-blind: chrome-less pages compress tiny; dialogs photograph fine | Calibrate threshold to actual output (8 KB worked here), assert count too — and **always read the screenshots**; no assert catches wrong-content |
| 10 | Screenshots differ run-to-run / animations mid-frame | Emulator/simulator animations on | Zero all three Android animation scales; iOS: fixed settle sleeps after boot/launch |
| 11 | PNG corrupt via `adb shell screencap` | CRLF mangling through `adb shell` | `adb exec-out screencap -p > file.png` |
| 12 | Deprecation warnings → future hard breaks | actions v4 targets Node 20 (deprecated) | checkout/setup-node/upload-artifact at v7; `retention-days` goes **inside** `with:` |
| 13 | Gradle/pods re-downloaded every run | No caching | `gradle/actions/setup-gradle@v6` (Android). CocoaPods caching deliberately skipped — cache key must hash prebuild outputs (`Podfile.lock` doesn't exist until after `expo prebuild`) |

## iOS flow that works (order matters)

1. `pod install` → resolve scheme (trap 6) → `xcodebuild -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build`
2. Boot device (`simctl bootstatus <udid> -b`) + settle sleep
3. **Pre-approve scheme** (trap 5)
4. `simctl install` with **absolute** app path (trap 7)
5. `simctl launch` once, settle
6. Per page: `openurl` → sleep → `simctl io <udid> screenshot` → **`simctl terminate`** (trap 4)

## Android flow that works

`gradlew assembleRelease` (release signs with debug keystore → self-contained APK, no Metro) → KVM rule → emulator-runner with contract-compliant one-liner script (trap 3): install → zero animations → per page: `am start -W -a VIEW -d <scheme://route?page=N>` → sleep → `adb exec-out screencap -p` → `am force-stop`.

## Debugging discipline that saved the session

- Read the **job logs via API** (`gh api repos/<org>/<repo>/actions/jobs/<id>/logs`) — live logs aren't servable mid-job; step states via `gh run view --json` are.
- When a fix fails twice, **read the tool's source** (the emulator-runner contract was in `script-parser.ts` all along) and **verify fixes against captured data locally** before burning a run.
- Guards that fail loudly (missing app bundle, wrong capture count) convert silent garbage into actionable red — add them before you need them.
