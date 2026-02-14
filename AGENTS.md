## Package Manager

Use **pnpm**: `pnpm install`, `pnpm start`, `pnpm lint`

| Command              | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| `pnpm start`         | Start Expo dev server                                         |
| `pnpm web`           | Start web dev server                                          |
| `pnpm ios`           | Run on iOS                                                    |
| `pnpm android`       | Run on Android                                                |
| `pnpm test`          | Run tests                                                     |
| `pnpm test:watch`    | Run tests in watch mode                                       |
| `pnpm test:coverage` | Run tests with coverage report                                |
| `pnpm export:full`   | Full web export (static data + build + sitemap + post-export) |
| `pnpm i18n`          | Extract translation strings to .po files                      |
| `pnpm lint`          | ESLint with React Compiler plugin                             |

## Stack

- Expo 54 / React Native 0.81 / React 19 + React Compiler
- Expo Router 6 (file-based, typed routes)
- Tailwind CSS 4 via **Uniwind** (NOT NativeWind)
- TanStack React Query 5
- expo-sqlite (native) / sql.js WASM (web server) / static JSON (web client)
- Lingui 5 for i18n (en, ar)
- Reanimated 4 + Worklets
- @shopify/flash-list for native lists
- New Architecture enabled

## Architecture

```

src/
├── app/ # Route shells only — delegate to features
├── features/ # Self-contained feature modules
│ └── <name>/
│ ├── domain/ # Contracts, types, pure logic (zero deps)
│ ├── data/ # KVStore/SQLite/fetch implementations
│ ├── app/ # Hooks, controllers (public API via index.ts barrel)
│ └── ui/ # React components
├── entities/ # Shared repositories (QuranRepository, ProgressRepository)
├── components/ # Shared UI (not feature-specific)
├── hooks/ # Shared hooks
├── shared/ # Constants, i18n, lib utils, shared UI primitives
├── contexts/ # Providers
└── types/ # Domain types

```

## Key Conventions

### Platform Splits

Use file extensions — never `Platform.select()` for full implementations:

```

Thing.native.ts → iOS + Android
Thing.ts → Web (default)
Thing.web.tsx → Web-only override
Thing.d.ts → Shared type declaration

```

### Feature Public API

External code imports ONLY from `features/<name>/app/index.ts`:

```typescript
// ✅
import { useBookmarksController } from "@/features/bookmarks/app";
// ❌
import { KVBookmarkManager } from "@/features/bookmarks/data/KVBookmarkManager";
```

### Styling

- `className` with semantic tokens: `bg-background`, `bg-surface`, `text-text-primary`, `text-accent`
- Dynamic values via `useCSSVariable("--color-accent")`
- Responsive: `sm:`, `md:`, `lg:`, `xl:` breakpoints
- Container pattern: `max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full`

### State

- React Query for all async/server state
- Static Quran data: `staleTime: Infinity`, all refetch disabled
- Optimistic mutations: cancel → snapshot → set → rollback on error → invalidate on settle
- Animation state: `useSharedValue` (never `useState`)
- No `React.memo`/`useMemo`/`useCallback` — React Compiler handles it

### Query Keys

```
["surahs"], ["juz-list"], ["ayah", sura, ayah], ["ayahs", sura]
["quran-reader", "page-data", page]
["bookmarks"], ["bookmark-status", sura, ayah]
["settings"]
```

### i18n (Lingui)

```typescript
import { Trans, useLingui } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { msg } from "@lingui/core/macro";

// Inline:     t`Hello`
// JSX:        <Trans>Hello</Trans>
// Deferred:   msg`Hello`  →  i18n._(descriptor)
```

### RTL

- Web: `<html dir="rtl" lang="ar">`
- Native: `I18nManager.forceRTL(true)` + app reload
- Arabic text: `writingDirection: "rtl"` AND `direction: "rtl"` (Android needs both)
- Layout: `flex-row rtl:flex-row-reverse` for consistent control placement

### Fonts

| Class             | Font                      | Usage                                      |
| ----------------- | ------------------------- | ------------------------------------------ |
| `font-arabic`     | UthmanicHafs_V22          | Quran verse text                           |
| `font-surah-name` | SurahNames_V4             | Surah name glyphs (`getSurahNameGlyph(n)`) |
| `font-juz-name`   | JuzNames_V2               | Juz badge glyphs (`getJuzBadgeGlyph(n)`)   |
| `font-ui-en`      | Inter_400Regular          | English UI                                 |
| `font-ui-ar`      | NotoSansArabic_400Regular | Arabic UI                                  |

Use `useLocaleFont()` → returns `"font-ui-ar"` or `"font-ui-en"`.

### Domain Patterns

- Discriminated unions with `kind`: `{ kind: "loading" } | { kind: "results"; items: T[] }`
- Composite identity: `` `${sura}:${ayah}` ``
- Assertion functions at data boundaries: `assertTheme(value)`
- Contracts in `domain/`, implementations in `data/`

### KV Storage Keys

| Key                    | Data                   |
| ---------------------- | ---------------------- |
| `theme`                | ThemeId                |
| `user_locale_override` | LanguageId             |
| `last_read_page`       | Page number            |
| `bookmarks_v2`         | JSON array of Bookmark |
| `settings_version`     | Migration version      |

**Storage**: All platforms use `expo-sqlite/kv-store` (works on web, iOS, Android). No platform split needed.

## Database Schema

```sql
surahs (id, revelation_place, revelation_order, bismillah_pre,
        name_simple, name_complex, name_arabic, verses_count, pages_range)
ayahs (sura_number, ayah_number, uthmani_text, simple_text)
page_segments (page_number, juz_number, hizb_number, rub_number,
              manzil_number, sura_start, ayah_start, sura_end, ayah_end)
ayahs_fts (FTS5 virtual table on simple_text)
```

## Themes

5 custom themes: `fajr` (light), `layl` (dark), `asr` (sepia), `tahajjud` (AMOLED), `masjid` (deep green).

To add a theme:

1. Add `@variant <name> { ... }` in `global.css`
2. Add to `extraThemes` in `metro.config.js`
3. Add to `ThemeId` union + `isThemeId()` guard in `settings-contract.ts`
4. Add metadata in `theme-metadata.ts`

## New Feature Template

```
src/features/<name>/
├── domain/<name>-contract.ts
├── data/KV<Name>Manager.ts
├── app/
│   ├── index.ts              # Barrel (public API)
│   ├── use<Name>Controller.ts
│   └── use<Name>Mutations.ts
└── ui/<Name>Component.tsx
```

## New Hook Template

```typescript
export function useMyData(param: number) {
  const db = useDatabase();
  return useQuery({
    queryKey: ["my-data", param],
    queryFn: () => new MyRepository(db).getData(param),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
```

## API Route Template

```typescript
// src/app/api/<name>+api.ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  // ... sql.js queries against assets/quran.db
  return Response.json(data);
}
```

## Babel

Worklets plugin MUST be last:

```javascript
plugins: [
  "@babel/plugin-transform-export-namespace-from",
  "@lingui/babel-plugin-lingui-macro",
  "react-native-worklets/plugin", // ← LAST
];
```

## Testing

### Conventions

- **Colocated tests**: `__tests__` folders next to source files
- **Framework**: Jest + jest-expo/universal + @testing-library/react-native
- **Multi-platform**: Tests run on Node, Web, Android, iOS
- **Providers**: Wrap components with `I18nProvider` (Lingui) + `QueryClientProvider` (React Query)
- **Mocking**: Mock `useSearchQuery` in controller tests, mock `fetch` in web searchers

### Test Structure

```typescript
// Domain (pure functions)
describe("parseSearchQuery", () => {
  it("parses surahAyah format", () => {
    expect(parseSearchQuery("2:255")).toEqual({ kind: "surahAyah", sura: 2, ayah: 255 });
  });
});

// Hooks (with providers)
const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe("useSearchController", () => {
  it("returns entry state for empty query", () => {
    const { result } = renderHook(() => useSearchController(""), { wrapper });
    expect(result.current).toEqual({ kind: "entry" });
  });
});
```

### Known Warnings (Harmless)

- `watchPlugins` validation: from jest-expo preset, doesn't affect execution
- `react-test-renderer is deprecated`: React 19 + testing-library, tests pass successfully

## CI/CD

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- **PR checks**: Test → Lint → Expo prebuild → Web export
- Version bump required in `app.json` before merging to `main`
- Branch flow: `feature/* → development → main`
- Deploy: Docker → private registry → MicroK8s via SSH

## Don'ts

- Raw color values — use semantic tokens
- `Platform.select()` for full implementations — use file extensions
- Import from feature internals — use barrel exports
- `React.memo`/`useMemo`/`useCallback` — React Compiler handles it
- `useState` for scroll/animation — use `useSharedValue`
- Refetch options on static Quran data
- Hardcoded page count — use `TOTAL_PAGES`

## Skills

### React Native

- `.agents/skills/react-native-best-practices/SKILL.md`
- `.agents/skills/react-native-best-practices/references/js-lists-flatlist-flashlist.md`
- `.agents/skills/react-native-best-practices/references/js-react-compiler.md`

### Native UI

- `.agents/skills/building-native-ui/SKILL.md`
- `.agents/skills/building-native-ui/references/tabs.md`
- `.agents/skills/building-native-ui/references/storage.md`
- `.agents/skills/building-native-ui/references/search.md`

### Animation

- `.agents/skills/reanimated-skia-performance/SKILL.md`

### Expo

- `.agents/skills/expo-api-routes/SKILL.md`
- `.agents/skills/expo-dev-client/SKILL.md`
- `.agents/skills/upgrading-expo/SKILL.md`

### Data

- `.agents/skills/native-data-fetching/SKILL.md`

### Rules (apply globally)

- `.agents/skills/vercel-react-native-skills/SKILL.md`
- `.agents/skills/vercel-react-native-skills/rules/ui-styling.md`
- `.agents/skills/vercel-react-native-skills/rules/ui-pressable.md`
- `.agents/skills/vercel-react-native-skills/rules/list-performance-*.md`
- `.agents/skills/vercel-react-native-skills/rules/state-ground-truth.md`
- `.agents/skills/vercel-react-native-skills/rules/scroll-position-no-state.md`
- `.agents/skills/vercel-react-native-skills/rules/rendering-text-in-text-component.md`
- `.agents/skills/vercel-react-native-skills/rules/rendering-no-falsy-and.md`
- `.agents/skills/vercel-react-native-skills/rules/fonts-config-plugin.md`
- `.agents/skills/vercel-react-native-skills/rules/react-compiler-reanimated-shared-values.md`
