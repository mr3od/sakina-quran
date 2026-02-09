# Architecture — Sakina Quran

## Overview

Cross-platform Quran reader targeting iOS, Android, and Web from a single codebase. Feature-sliced architecture with clean layer separation and platform-specific implementations resolved at bundle time.

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Expo Router (app/)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │  (tabs)  │ │ pages/   │ │ api/     │ │  +html.tsx │ │
│  │  index   │ │ [number] │ │ search   │ │  (web SSR) │ │
│  │  search  │ │          │ │ +api.ts  │ │            │ │
│  │bookmarks │ │          │ │(server)  │ │            │ │
│  │ settings │ │          │ │          │ │            │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────────┘ │
└───────┼────────────┼────────────┼───────────────────────┘
        │            │            │
┌───────▼────────────▼────────────▼───────────────────────┐
│                    Features Layer                        │
│  ┌──────────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐  │
│  │ quran-reader │ │ search │ │bookmarks│ │ settings │  │
│  │  domain      │ │ domain │ │ domain  │ │  domain  │  │
│  │  data        │ │ data   │ │ data    │ │  data    │  │
│  │  app ←barrel │ │ app    │ │ app     │ │  app     │  │
│  │  ui          │ │ ui     │ │ ui      │ │  ui      │  │
│  └──────┬───────┘ └───┬────┘ └────┬────┘ └─────┬────┘  │
└─────────┼──────────────┼──────────┼─────────────┼───────┘
          │              │          │             │
┌─────────▼──────────────▼──────────▼─────────────▼───────┐
│              Shared Infrastructure                       │
│  ┌──────────┐ ┌───────────┐ ┌──────┐ ┌───────────────┐ │
│  │entities/ │ │components/│ │hooks/│ │   shared/     │ │
│  │QuranRepo │ │ AyahCard  │ │useDB │ │ i18n/lib/ui/ │ │
│  │ Progress │ │ SurahList │ │useSu │ │ constants    │ │
│  │  Repo    │ │ WebHeader │ │  etc │ │              │ │
│  └──────┬───┘ └───────────┘ └──┬───┘ └──────────────┘ │
└─────────┼──────────────────────┼────────────────────────┘
          │                      │
┌─────────▼──────────────────────▼────────────────────────┐
│                  Platform Layer                          │
│                                                          │
│  ┌─── Native ───────────┐  ┌─── Web ──────────────────┐ │
│  │ expo-sqlite           │  │ fetch(/api/static/*.json)│ │
│  │ expo-sqlite/kv-store  │  │ localStorage             │ │
│  │ PagerView             │  │ Single page + URL nav    │ │
│  │ FTS5 search           │  │ /api/search (sql.js WASM)│ │
│  │ I18nManager.forceRTL  │  │ <html dir="rtl">         │ │
│  └───────────────────────┘  └──────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Provider Hierarchy

```
GestureHandlerRootView
└── SafeAreaListener → Uniwind.updateInsets()
    └── I18nProvider (Lingui)
        └── QueryProvider (TanStack React Query)
            └── SQLiteProvider (native only, skipped on web)
                └── RootLayoutContent
```

## Feature Module Structure

Each feature follows a 4-layer architecture:

```
features/<name>/
├── domain/          # Pure types, interfaces, business rules
│                    # Zero external dependencies
│                    # Defines contracts that data/ implements
│
├── data/            # Infrastructure implementations
│                    # KVStore, SQLite, fetch, localStorage
│                    # Platform splits live here (.native.ts / .ts)
│
├── app/             # Application logic & orchestration
│   ├── index.ts     # ← ONLY public export (barrel)
│   ├── use*Controller.ts
│   ├── use*Mutations.ts
│   └── *-route.ts   # Route helper functions
│
└── ui/              # React components
                     # Imports from app/ layer only
```

**Dependency rule**: `ui → app → data → domain`. No upward or sideways imports between features.

## Data Flow

### Quran Page Reading

```
URL /pages/[number]
  → parsePageNumber()
  → usePageAyahs(page) ──→ React Query cache check
                              │
                    ┌─────────▼──────────┐
                    │ PageReaderRepository │
                    └─────────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼                               ▼
     Native: SQLite                  Web: fetch /api/static/
     QuranRepository.native.ts       pages/{n}.json
     getAyahsByPage(n)               QuranRepository.ts
              │                               │
              └───────────────┬───────────────┘
                              ▼
                    { ayahs: Ayah[], meta: PageSegment }
                              │
                              ▼
                    PagePage (FlatList)
                    ├── surah-header (font glyph + basmalah)
                    └── AyahCard (uthmani text + bookmark toggle)
```

### Search

```
User input
  → debounce 300ms
  → useSearchController(query)
  → CompositeSearcher
      ├── StructuralSearcher  (parallel)  "2:255", "juz 7", "page 151"
      └── TextSearcher         (parallel)  Arabic text matching
  → deduplicate by type:sura:ayah
  → SearchState { kind: "results", items: SearchRow[] }
```

|            | Native                                       | Web                                  |
| ---------- | -------------------------------------------- | ------------------------------------ |
| Structural | SQLite queries (surah/juz/hizb/page lookups) | `GET /api/search?type=structural&q=` |
| Text       | FTS5 prefix → LIKE fallback                  | `GET /api/search?q=`                 |

### Bookmarks (Optimistic Mutation)

```
User taps bookmark
  → useToggleBookmark.mutate()
  → onMutate:
      1. cancelQueries(["bookmarks"])
      2. snapshot previous state
      3. optimistic update cache
      4. update ["bookmark-status", sura, ayah]
  → mutationFn: KVBookmarkManager.add/remove()
  → onError: rollback from snapshot
  → onSettled: invalidateQueries(["bookmarks"])
```

## Platform Resolution

Metro bundler resolves platform files automatically:

```
import { QuranRepository } from "@/entities/quran/api/QuranRepository";
                                                            │
                    ┌───────────────────────────────────────┤
                    ▼                                       ▼
          QuranRepository.native.ts              QuranRepository.ts
          expo-sqlite direct SQL                 fetch() from static JSON
```

### Complete Platform Split Map

| Module               | Native (.native.ts)         | Web (.ts)                     |
| -------------------- | --------------------------- | ----------------------------- |
| `QuranRepository`    | expo-sqlite                 | fetch `/api/static/*.json`    |
| `ProgressRepository` | expo-sqlite/kv-store        | localStorage                  |
| `useDatabase`        | `useSQLiteContext()`        | returns `null`                |
| `PagePager`          | PagerView (swipe 604 pages) | Single View (URL-driven)      |
| `SearchHero`         | Link to search tab          | ⌘K overlay (WebSearchOverlay) |
| `StructuralSearcher` | SQLite queries              | fetch `/api/search`           |
| `TextSearcher`       | FTS5 + LIKE fallback        | fetch `/api/search`           |

### Web-Only Components

| Component            | Purpose                                      |
| -------------------- | -------------------------------------------- |
| `WebHeader`          | Top navigation bar (replaces tab bar)        |
| `SettingsDrawer`     | Right-side modal for theme/language          |
| `WebSearchOverlay`   | Spotlight-style ⌘K search                    |
| `SearchHero.web.tsx` | Inline search trigger with keyboard shortcut |

## State Management

### React Query — All Async State

**Static data** (Quran text — never changes):

```
staleTime: Infinity, gcTime: Infinity, refetchOn*: false
```

**User data** (bookmarks, settings):

```
staleTime: 60s, gcTime: 10min, optimistic mutations with rollback
```

**Page reader**:

```
staleTime: Infinity, gcTime: 15min, prefetch next page on navigation
```

### Query Key Map

```
["surahs"]                              → all 114 surahs
["juz-list"]                            → 30 juz with grouped surahs
["ayah", sura, ayah]                    → single verse
["ayahs", sura]                         → all verses in surah
["quran-reader", "page-data", page]     → page ayahs + segment metadata
["bookmarks"]                           → all bookmarks
["bookmark-status", sura, ayah]         → boolean per verse
["settings"]                            → { theme, language }
```

### Local State

| Type             | Used For                                                   |
| ---------------- | ---------------------------------------------------------- |
| `useState`       | UI-only: search input, modal open, active tab              |
| `useSharedValue` | Animation: header position, scroll progress, compact state |
| `useRef`         | Mutable non-rendering: page sync flags, selection intent   |

## Navigation

```
Stack (headerShown: false)
├── (tabs)/                    ← Tab navigator
│   ├── index                  Home (surah/juz lists, continue reading)
│   ├── search                 Search screen (debounced input + results)
│   ├── bookmarks              Bookmarks list
│   └── settings               Theme/language preferences
└── pages/[number]             ← Quran page reader (full screen)
    params: { number, surah?, ayah? }
```

- Tab bar: visible on native, hidden on web (`display: "none"`)
- Web navigation: `WebHeader` on all screens except reader; reader has its own header
- Page reader header: auto-hides on native scroll, compacts on web scroll
- Deep linking: `/pages/42?surah=2&ayah=255` highlights specific verse

## Theme System

Defined in `src/global.css` using Uniwind `@variant` directives.

```
@theme { ... }              ← Color primitives (raml, zumurrud, dhahab, slate)
@layer theme {
  @variant fajr { ... }     ← Semantic token assignments per theme
  @variant layl { ... }
  @variant asr { ... }
  @variant tahajjud { ... }
  @variant masjid { ... }
}
```

Each theme maps primitives to semantic tokens:

```
Primitives              →  Semantic Tokens
raml-50, slate-950      →  --color-background
raml-100, slate-800     →  --color-surface-elevated
raml-900, slate-50      →  --color-text-primary
zumurrud-600            →  --color-accent
```

Applied at runtime: `Uniwind.setTheme("layl")` — persisted in KV store.

## i18n Flow

```
bootstrapLocale()
  → getSavedLocaleOverride()
  │   ├── found → applyLocale(saved)
  │   └── null  → getSystemLocale() → applyLocale(system)
  └── applyLocale(locale, { forceRTL? })
        ├── Web: document.documentElement.dir/lang
        └── Native: I18nManager.forceRTL() + reload
```

- Catalogs: `.po` files in `src/locales/{en,ar}/messages.po`
- Metro transformer compiles `.po` on-the-fly
- `DefaultI18nComponent` wraps all Lingui output with locale-appropriate font

## Build Pipeline

```
pnpm run export:full
  │
  ├── 1. generate:static     Read quran.db → write 604 page JSONs
  │                           + surahs.json, juz.json, page_segments.json
  │
  ├── 2. expo export          Bundle web app (static export)
  │                           generateStaticParams() → 604 page routes
  │
  ├── 3. generate:sitemap     Write sitemap.xml + robots.txt to dist/
  │
  └── 4. post-export          Copy sql-wasm.wasm + quran.db to dist/server/
```

### Docker

```
Stage 1 (builder):  pnpm install → export:full
Stage 2 (runtime):  expo + sql.js only → expo serve dist --port 3000
```

### Deployment

```
Push to main/development
  → GitHub Actions
  → Docker build + push (immutable tag: {env}-{sha7})
  → SSH to VPS
  → microk8s kubectl set image deployment/...
  → rollout status --timeout=300s
```

## Database

### Schema

```sql
surahs
  id INTEGER PRIMARY KEY
  revelation_place TEXT        -- "makkah" | "madinah"
  name_simple TEXT             -- "Al-Fatihah"
  name_arabic TEXT             -- "الفاتحة"
  verses_count INTEGER
  pages_range TEXT             -- "1-1"

ayahs
  sura_number INTEGER
  ayah_number INTEGER
  uthmani_text TEXT            -- Typeset Arabic (display)
  simple_text TEXT             -- Diacritic-stripped (search)

page_segments
  page_number INTEGER          -- 1-604
  juz_number INTEGER           -- 1-30
  hizb_number INTEGER          -- 1-60
  sura_start/end INTEGER
  ayah_start/end INTEGER

ayahs_fts                      -- FTS5 virtual table on simple_text
```

### Access Patterns

| Operation            | Native                        | Web Client                       | Web Server                   |
| -------------------- | ----------------------------- | -------------------------------- | ---------------------------- |
| Read page ayahs      | SQL with cross-surah handling | `GET /api/static/pages/{n}.json` | —                            |
| Search text          | FTS5 `MATCH` → LIKE fallback  | —                                | sql.js LIKE in `/api/search` |
| Read surahs          | `SELECT * FROM surahs`        | `GET /api/static/surahs.json`    | —                            |
| Read/write bookmarks | KVStore JSON blob             | localStorage JSON blob           | —                            |
| Read/write settings  | KVStore individual keys       | localStorage individual keys     | —                            |

## Quran Reader Internals

### PagePager

**Native**: `react-native-pager-view` with all 604 pages registered.

- Sliding window: only current ±1 pages rendered, rest are empty `View`
- Large jumps (from search/index): `setPageWithoutAnimation()`
- Swipe detection: ref tracking prevents feedback loops between URL and PagerView

**Web**: Renders single page. Navigation via `router.setParams()` + `Link` (prev/next).

- Keyboard: Arrow keys (RTL-aware), PageUp/Down, Home/End

### Header Animation

**Native**:

- `useAnimatedScrollHandler` (worklet, UI thread)
- Scroll down > 50px: translate Y -80px + fade out
- Scroll up: translate Y 0 + fade in

**Web**:

- Scroll > 24px: compact from 64px → 44px
- Side elements (branding, utilities) fade/scale out on mobile
- 2px progress bar at bottom: `width = scrollY / (contentHeight - viewportHeight) * 100%`

### Page Content (PagePage)

FlatList items are a union type:

```
SurahHeader { surahNumber, showBasmalah }   → font glyph + basmalah
AyahItem { ayah: Ayah }                     → AyahCard component
```

- Surah headers inserted when `ayah_number === 1` and surah changes
- Basmalah shown for all surahs except 1 (Al-Fatiha) and 9 (At-Tawbah)
- Ayah highlighting via URL params `?surah=X&ayah=Y`
