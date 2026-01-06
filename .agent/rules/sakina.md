---
trigger: always_on
---

# Sakina Quran - Unified Development Guidelines

This file is the Single Source of Truth for all AI agents contributing to Sakina Quran. It combines strict architectural constraints with process workflows.

---

## 🚨 CRITICAL ARCHITECTURE (The "How")

### 1. React 19 & Compiler

- **No Manual Memoization:** **NEVER** use `useMemo` or `useCallback`. We rely on the React Compiler (`babel-plugin-react-compiler`).
- **Components:** Use Functional Components with modern React 19 patterns.

### 2. Feature-Sliced Design (FSD)

Strictly enforce the separation of concerns:

- `features/{feature}/domain`: Pure TS types/interfaces. **NO** React/Expo imports.
- `features/{feature}/data`: Repositories & DTOs (SQLite/Fetch logic).
- `features/{feature}/app`: React Query Hooks & Controllers.
- `features/{feature}/ui`: Pure UI components.
- **Rule:** UI components **never** talk to Data components directly. They must go through `app` hooks.

### 3. Platform Separation (Web vs Native)

This is a hybrid app. You must respect the runtime differences:

- **Native:** Uses `expo-sqlite` directly. File extension: `.native.ts` or `.native.tsx`.
- **Web:** **MUST** use `fetch` to call API routes (`/api/...`) or static JSON. File extension: `.ts` or `.tsx` (default).
- **Server:** API routes live in `src/app/api/` and use `sql.js` (WASM).

### 4. Expo Router & Navigation

- **Typed Routes:** **ALWAYS** use typed routes (`Href`). Never hardcode string paths.
- **Links:** Prefer `<Link asChild>` for navigation elements (Web SEO/Accessiblity).
- **Structure:** Follow standard conventions (`_layout.tsx`, `(tabs)`, `[id].tsx`).

### 5. Styling (Uniwind/Tailwind)

- **Tokens Only:** Use semantic utility classes (e.g., `bg-surface`, `text-text-primary`). **NO** hex codes.
- **Fonts:** Strict adherence required:
  - `font-arabic` (Quran Text)
  - `font-ui-ar` (Arabic UI)
  - `font-ui-en` (English UI)
- **Themes:** Validate UI against all 5 themes (Fajr, Layl, Asr, Tahajjud, Masjid).

### 6. Data & State

- **Fetching:** Use `@tanstack/react-query` v5 for all async state.
- **Mutations:** **Optimistic Updates** are required for user actions (Bookmarks, Settings).
- **No Effects:** Do not use `useEffect` for data fetching.

---

## 🔄 GIT & WORKFLOW (The "Process")

### 1. Branching Strategy (Strict)

- **Trunk:** `development` (NOT `main`).
- **ALWAYS** branch from `development`.
- **ALWAYS** fetch upstream before starting.
- **NEVER** merge feature branches directly to `main`.

### 2. Version Management

- Version source: `app.json` → `expo.version`.
- **MANDATORY:** You must bump the version (`MAJOR.MINOR.PATCH`) before creating a PR.

### 3. Commit Format

- Use **Conventional Commits**: `<type>(<scope>): <subject>`
- Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`.
- **Example:** `feat(bookmarks): implement optimistic toggle`

### 4. The Workflow Loop

1.  **Fetch:** `git checkout development && git pull upstream development`
2.  **Branch:** `git checkout -b feat/my-feature`
3.  **Code:** Apply FSD & Architectural rules.
4.  **Bump:** Edit `app.json` version.
5.  **Commit:** `git commit -m "feat: ..."`
6.  **Test:** `npx expo export --platform web` (Must pass).
7.  **Push:** Create PR targeting `development`.

---

## 🧪 TESTING REQUIREMENTS

Before asking for a review or creating a PR, run these checks:

1.  **Web Build:** `npx expo export --platform web` (Ensures no Native modules leaked into Web).
2.  **Lint:** `pnpm lint`.
3.  **Responsive Check:** Verify layout on Mobile (375px) AND Desktop (1024px+).

---

**Success Criteria:**
A valid contribution respects the **Architecture** (FSD/React 19), follows the **Workflow** (Dev branch/Conventional Commits), and passes the **Web Build**.
