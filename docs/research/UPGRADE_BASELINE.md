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

## Revision 2 — 2026-08-25 (after step 3 merged)

Step 3 (Lingui 6, PR #24) raised `/api/search` to **78.3 kB** (78,327 bytes vs Revision 1's
77,431). A/B-verified against pristine base `f54c613`: inherent Lingui 6 runtime growth in
the server bundle, not drift. Pages/sitemap unchanged (604/608). This is the effective
reference for steps 4–6; all other gates identical to Revision 1.

## Revision 3 — 2026-08-26 (after steps 4+6 merged, PR #26)

Steps 4+6 (`c8053f8`: Expo SDK 54→57, RN 0.86.2, React 19.2.3, uniwind 1.11.0,
tailwindcss 4.3.3) moved `/api/search` by **+10 bytes**: 78,337 vs Revision 2's
78,327 — the entire delta attributable to the SDK hop; the uniwind/tailwind bump
measured ±0. Pages/sitemap unchanged (604/608). Native evidence green on both
platforms after the uniwind 1.11 fix (Android boot NPE under RN ≥0.82's non-null
`AppearanceModule.setColorScheme`; crash-buffer capture added to the harness —
see NATIVE_RUNNER_PLAYBOOK.md trap 9). This is the effective reference for
step 5 (ESLint 10).

| Gate | Command | Result |
|---|---|---|
| Tests | `pnpm test` | **132/132 passed · 24 suites** |
| Lint | `pnpm lint` | clean |
| Types | `pnpm typecheck` | clean |
| Web export | `pnpm run export:full` | 604 pages · 608 sitemap URLs · `/api/search` 78,337 B |

Environment: Expo SDK **57.0.16** · RN **0.86.2** · React **19.2.3** · Node 22 · pnpm 10.15.0.
