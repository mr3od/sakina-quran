# Quran Native — Agent Context

> Minimal context bundle for LLM-assisted development of the Quran app.

## Purpose

Provide the LLM with the **exact, source-of-truth** specs for:

- Data schema & queries (SQLite)
- Implementation references (Expo Router, SQLite, Uniwind)
- UX/UI rules (accessibility, rhythm, typography)
- Product requirements (what to build, how it should behave)

## Files

- [`database.md`](./database.md) — SQLite schema (`assets/quran.db`), tables, and Juz-generation SQL.
- [`implementation-guide.md`](./implementation-guide.md) — Docs links & config notes for SQLite, Router, Icons, Uniwind + deps.
- [`introduction.md`](./introduction.md) — Final **Requirements Document** for the LLM (ordered by theming/design first).
- [`ux-ui-guidelines.md`](./ux-ui-guidelines.md) — Refactoring-UI cheat-card (spacing, contrast, typography, accessibility).

## Ingestion Order (LLM)

1. `introduction.md` (requirements & priorities)
2. `ux-ui-guidelines.md` (visual rules)
3. `implementation-guide.md` (official docs & config)
4. `database.md` (schema & SQL)

## Non-Negotiables (LLM Rules)

- **Always use official URLs** from `implementation-guide.md` when citing Uniwind, Expo Router, or Expo SQLite.
- **Style with Uniwind utilities**; follow rhythm (4/8/16/24/32), typography (14/16/20/24), contrast ≥ 4.5:1.
- **Load data from SQLite** (`assets/quran.db`); do not assume external fixtures/APIs.
- **Respect requirements order**: Theming & Accessibility → Design System → Features.

## Data Source

- SQLite path: `assets/quran.db`
