# 🌙 Sakina Quran (سكينة)

**Divine Tranquility in Every Verse.**

Sakina Quran is a modern, open-source, offline-first Quran reading application built for iOS, Android, and Web. It prioritizes typography, performance, and accessibility, wrapped in a design language meant to evoke peace and focus.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey.svg)
![Stack](https://img.shields.io/badge/stack-Expo%20%7C%20React%20Native%20%7C%20SQLite-4630EB.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

<!-- Add screenshots here later -->
<!--
<p align="center">
  <img src="./assets/screenshots/preview-1.png" width="200" />
  <img src="./assets/screenshots/preview-2.png" width="200" />
  <img src="./assets/screenshots/preview-3.png" width="200" />
</p>
-->

## ✨ Key Features

- **📖 Crystal Clear Reading:** Utilizes the **Uthmanic Hafs V22** font for authentic, high-quality Arabic rendering.
- **⚡ Instant Search:** Powered by **SQLite FTS5**, enabling instant full-text search and structural navigation (e.g., "Surah 18", "Juz 30").
- **🎨 Sakinah Design System:** Five religiously inspired themes:
  - **Fajr (Dawn):** Light sand & emerald.
  - **Layl (Night):** Deep slate for low light.
  - **Asr (Afternoon):** Warm sepia & gold.
  - **Tahajjud:** Pure black (AMOLED) for late-night reading.
  - **Masjid:** Deep green & gold.
- **🔖 Smart Bookmarking:** Save your progress or favorite verses locally.
- **🔐 Offline First:** All data is bundled locally. No internet connection required.
- **♿ Accessibility:** Built with WCAG AA standards, screen reader support, and adjustable typography.

## 🛠 Tech Stack

- **Framework:** React Native 0.81 + Expo SDK 54
- **Language:** TypeScript
- **Navigation:** Expo Router (File-based routing)
- **Database:** Expo SQLite + FTS5
- **Styling:** [Uniwind](https://uniwind.dev/) (Tailwind CSS for React Native)
- **State Management:** TanStack Query (React Query) + Optimistic Updates
- **Architecture:** Feature-Sliced Design (FSD)

## 🏗 Architecture

The project follows a strict **Feature-Sliced Design** to ensure scalability and maintainability.

```bash
src/
├── app/                 # Expo Router screens (Thin UI layer)
├── features/            # Feature modules (Self-contained)
│   ├── quran-reader/    # Reading logic, paging, rendering
│   ├── search/          # Search logic, FTS implementation
│   ├── bookmarks/       # Bookmark management
│   └── settings/        # Theme & App preferences
├── entities/            # Domain entities (Database repositories)
├── shared/              # Shared utilities, UI components, constants
└── global.css           # Design tokens and Tailwind config
```

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS)
- [pnpm](https://pnpm.io/) (Recommended)
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/mr3od/sakina-quran.git
   cd sakina-quran
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Prebuild (Required for Native SQLite/Fonts):**
   Since this app uses native modules (SQLite, Fonts), you must generate the native directories:

   ```bash
   npx expo prebuild
   ```

4. **Run the app:**

   ```bash
   # For iOS
   pnpm run ios

   # For Android
   pnpm run android

   # For Web
   pnpm run web
   ```

## 🧪 Database & Schema

The app uses a pre-populated `assets/quran.db` file.

- **`surahs`**: Metadata for 114 chapters.
- **`ayahs`**: Text (Uthmani & Simple) for 6236 verses.
- **`page_segments`**: Mapping of verses to the standard 604 Madani pages.
- **`fts_ayahs`**: Virtual table for high-performance text search.

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Quick Start for Contributors

1. **Read the guidelines**: Check out [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions
2. **Pick an issue**: Look for issues labeled `good first issue` or `help wanted`
3. **Follow the workflow**: Branch from `development`, use conventional commits, bump version
4. **Submit a PR**: Target the `development` branch with your changes

### Branch Strategy

- **`development`** - Integration branch for new features (deploy to dev environment)
- **`main`** - Production branch (deploy to production)

**Important**: Always branch from `development`, never from `main`.

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add bookmark sync functionality
fix: resolve crash on surah navigation
docs: update installation instructions
```

### Version Management

Version is managed in `app.json` (`expo.version`). Use semantic versioning and bump before creating a PR.

For more details, see [CONTRIBUTING.md](CONTRIBUTING.md).

## 🐛 Reporting Issues

Found a bug? Have a feature request? Please use our issue templates:

- [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)
- [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)
- [Documentation](.github/ISSUE_TEMPLATE/documentation.md)

## 🤖 AI Agent Guidelines

If you're using an AI coding assistant, check out our [AI Agent Steering File](.kiro/steering/sakina-development.md) for project-specific guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- **Tanzil.net** for the verified Quran text database.
- **King Fahd Glorious Quran Printing Complex** for the Uthmanic fonts.
- **Expo** team for the incredible platform.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/mr3od">Abdulrahman</a>
</p>
