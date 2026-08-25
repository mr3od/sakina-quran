# Upgrade baseline — SDK 54 reference numbers

> Recorded 2026-08-24 at commit `55bdf86` (branch `upgrade/baseline`, base `origin/development` @ `201fa89`).
> Purpose: the immutable reference for steps 1–6 of the upgrade plan
> (`PACKAGE_UPGRADES.md` §5). Each step's PR must match or beat these.

| Gate | Command | Result |
|---|---|---|
| Tests | `pnpm test` | **132/132 passed · 24 suites** |
| Lint | `pnpm lint` | clean |
| Types | `pnpm typecheck` | clean (fixed 10 pre-existing errors in this commit) |
| Web export | `pnpm run export:full` | 604 pages · 608 sitemap URLs · `/api/search` 79.6 kB |

Environment: Expo SDK **54.0.30** · RN **0.81.5** · React **19.1.0** · Node 22 · pnpm 10.15.0.

## Revision 1 — 2026-08-25 (after steps 1–2 merged)

The original step-0 record above is preserved as history; the numbers below are the
effective reference for steps 3–6. Re-baselined because the merged JS bumps of steps 0–1
legitimately changed one gate value (A/B-verified against pristine base `b5ebfa2`; PR #22).

| Gate | Command | Result |
|---|---|---|
| Tests | `pnpm test` | **132/132 passed · 24 suites** |
| Lint | `pnpm lint` | clean |
| Types | `pnpm typecheck` | clean |
| Web export | `pnpm run export:full` | 604 pages · 608 sitemap URLs · `/api/search` 77.4 kB |

Environment: unchanged from step 0 (SDK 54.0.30, RN 0.81.5, React 19.1.0, Node 22, pnpm 10.15.0),
plus RNTL 14.0.1 / test-renderer 1.1.0 from step 2.
