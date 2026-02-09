# Sakina Quran | سكينة القرآن

A cross-platform Quran reader built with React Native and Expo — for iOS, Android, and Web.

**[quran.mr3od.dev](https://quran.mr3od.dev)** · [Development](https://quran-dev.mr3od.dev)

## Features

- 📖 **Page-by-page reading** — All 604 pages with Uthmanic Hafs script
- 🔍 **Full-text search** — Arabic text, surah:ayah references, juz/hizb/page numbers
- 🔖 **Bookmarks** — Save and navigate to favorite verses
- 🎨 **5 themes** — Fajr (light), Layl (dark), Asr (sepia), Tahajjud (AMOLED), Masjid (green)
- 🌍 **Bilingual** — Arabic and English UI with full RTL support
- 📱 **Native experience** — Swipe navigation, haptic feedback, auto-hide headers
- ⌨️ **Web experience** — Keyboard navigation, ⌘K search, responsive layout, SEO optimized
- 📍 **Reading progress** — Automatically saves and restores last read position

## Screenshots

<!-- TODO: Add screenshots -->

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm (`corepack enable`)
- iOS: Xcode 16+ / Android: Android Studio

### Setup

```bash
git clone https://github.com/mr3od/sakina-quran.git
cd sakina-quran
pnpm install
```

### Run

```bash
# Web
pnpm web

# iOS
pnpm ios

# Android
pnpm android
```

### Generate Static Data

Required before first web export:

```bash
pnpm run generate:static
```

## Project Structure

```
src/
├── app/              # Expo Router file-based routes
│   ├── (tabs)/       # Tab screens (home, search, bookmarks, settings)
│   ├── pages/        # Quran page reader ([number].tsx)
│   └── api/          # Server-side API routes (search)
├── features/         # Feature modules (4-layer architecture)
│   ├── quran-reader/ # Page reading with swipe/keyboard navigation
│   ├── search/       # Composite search (structural + text)
│   ├── bookmarks/    # Verse bookmarking with optimistic updates
│   └── settings/     # Theme and language preferences
├── entities/         # Shared data repositories
├── components/       # Shared UI components
├── hooks/            # Shared React hooks
├── shared/           # Constants, i18n, utilities
└── types/            # TypeScript type definitions
```

See [ARCH.md](./ARCH.md) for detailed architecture documentation.

## Tech Stack

| Layer     | Technology                                                         |
| --------- | ------------------------------------------------------------------ |
| Framework | Expo 54 (New Architecture)                                         |
| UI        | React Native 0.81 / React 19 + React Compiler                      |
| Routing   | Expo Router 6 (typed routes)                                       |
| Styling   | Tailwind CSS 4 via Uniwind                                         |
| Data      | TanStack React Query 5                                             |
| Database  | expo-sqlite (native) / sql.js (web API) / static JSON (web client) |
| Lists     | @shopify/flash-list                                                |
| i18n      | Lingui 5                                                           |
| Animation | Reanimated 4                                                       |

## Data

- **Quran text**: Uthmanic Hafs script from [Tanzil.net](https://tanzil.net)
- **Fonts**: UthmanicHafs V22, SurahNames V4, JuzNames V2 by [KFGQPC](https://fonts.qurancomplex.gov.sa)
- **Database**: SQLite with FTS5 full-text search on simplified Arabic text
- **Static export**: 604 pre-generated page JSON files for web

## Deployment

### Docker

```bash
docker build -t sakina-quran .
docker run -p 3000:3000 sakina-quran
```

### CI/CD

- **PR checks**: Lint → Expo prebuild → Web export
- **Deploy**: Push to `main` or `development` → Docker build → MicroK8s
- **Releases**: Auto-tagged from `app.json` version on merge to `main`

| Branch        | Environment | URL                                                |
| ------------- | ----------- | -------------------------------------------------- |
| `main`        | Production  | [quran.mr3od.dev](https://quran.mr3od.dev)         |
| `development` | Development | [quran-dev.mr3od.dev](https://quran-dev.mr3od.dev) |

## Contributing

1. Create a feature branch from `development`
2. Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
3. Open PR to `development`
4. PRs to `main` require a version bump in `app.json`

## License

MIT

## Credits

- Quran text from [Tanzil.net](https://tanzil.net)
- Uthmanic Hafs font by [KFGQPC](https://fonts.qurancomplex.gov.sa)
- Built with [Expo](https://expo.dev) & [React Native](https://reactnative.dev)
