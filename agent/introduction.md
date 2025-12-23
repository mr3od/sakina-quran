# 📋 Quran Native App — Requirements Document

_(Aligned with `agent/` folder specifications for LLM-driven development)_

---

## 🪶 Introduction

This document defines the requirements for a **Quran reading application** built using:

- **Expo SDK 54**
- **React Native 0.81**
- **React 19**
- **Expo Router 6**
- **Expo SQLite 16 (with FTS)**
- **Uniwind `^1.2.X`**

All implementation, schema, and UI references come from the verified files under `quran-native/agent/`.  
The app follows the **Refactoring UI principles** from `ux-ui-guidelines.md`: structure-first design, clarity, rhythm, and accessibility.

---

## 📚 Glossary

- **Surah** — A chapter of the Quran (`surahs` table in `quran.db`)
- **Ayah** — A verse of a Surah (`ayahs` table, with `uthmani_text` and `simple_text`)
- **Juz** — One of 30 divisions of the Quran, generated dynamically via SQL query (see `database.md`)
- **Page Segment** — A continuous Quranic page reference (`page_segments` table)
- **Sajdah Marker** — Ayahs where prostration is indicated (`sajdah_markers` table)
- **Routing System** — File-based navigation powered by **Expo Router**
- **Styling Engine** — **Uniwind** (utility-first CSS for React Native)
- **Key-Value Store** — SQLite-based persistent storage for user state, bookmarks, and preferences

---

## 🖌️ Requirement 1 — Theming & Accessibility

**Documentation:**  
🔗 [Uniwind Docs — LLM Full Reference](https://docs.uniwind.dev/llms-full.txt)

**User Story:**  
As a user, I want the Quran app to adapt visually between light and dark themes while maintaining accessibility and clarity.

**Acceptance Criteria:**

1. The app **shall implement theming via Uniwind’s `light-dark()` utilities**.
2. All theme colors **shall maintain a minimum contrast ratio of 4.5:1**.
3. The selected theme **shall persist across sessions** using SQLite key-value storage.
4. Theme transitions **shall apply globally within 100 milliseconds**.
5. The interface **shall follow accessibility guidelines** outlined in `ux-ui-guidelines.md` (focus states, readable typography, clear contrast).

---

## 🧩 Requirement 2 — Visual Design System

**Documentation:**  
🔗 [Uniwind Docs — LLM Full Reference](https://docs.uniwind.dev/llms-full.txt)

**User Story:**  
As a user, I want a visually consistent interface that feels structured, balanced, and easy to use.

**Acceptance Criteria:**

1. The app **shall use Uniwind utility classes** for all spacing, layout, and typography.
2. **Primary / accent color pairing** shall remain consistent throughout the app.
3. All spacing **shall follow the rhythm scale** (4 / 8 / 16 / 24 / 32 px).
4. All text **shall use typography sizes** of 14 / 16 / 20 / 24 px.
5. UI hierarchy **shall be expressed through spacing and shadows**, not borders.
6. The LLM agent **shall always use the official Uniwind documentation URL** for reference in any design or component reasoning.

---

## 🕋 Requirement 3 — Surah List Navigation

**Documentation:**  
🔗 [Expo Router Guide](https://docs.expo.dev/versions/latest/sdk/router/)  
🔗 [Expo SQLite Usage Guide](https://docs.expo.dev/versions/latest/sdk/sqlite/#usage)

**User Story:**  
As a user, I want to browse and select Surahs to open specific chapters.

**Acceptance Criteria:**

1. The app **shall retrieve Surah data** from the `surahs` table (`quran.db`).
2. Each Surah item **shall display Arabic and transliterated names** (`name_arabic`, `name_simple`).
3. The list **shall show verse count** and revelation place.
4. Selecting a Surah **shall navigate** to its reading view using Expo Router.
5. The list **shall follow Uniwind spacing rhythm** for padding and alignment.

---

## 📖 Requirement 4 — Reading View (Ayah Display)

**Documentation:**  
🔗 [Expo SQLite Usage Guide](https://docs.expo.dev/versions/latest/sdk/sqlite/#usage)

**User Story:**  
As a user, I want to read Quran text ayah-by-ayah with clear, readable Arabic typography.

**Acceptance Criteria:**

1. The app **shall render Uthmani Arabic (`uthmani_text`)** at ≥20 px with line-height 1.4–1.6.
2. Each Ayah **shall display its ayah_number** clearly separated from text.
3. The display **shall maintain consistent Uniwind spacing rhythm**.
4. Text **shall maintain a minimum contrast ratio of 4.5 : 1**.
5. All Ayahs **shall be loaded from SQLite**, not hardcoded or fetched remotely.

---

## 🔀 Requirement 5 — Multi-View Navigation (Surah / Juz / Page)

**Documentation:**  
🔗 [Expo Router Guide](https://docs.expo.dev/versions/latest/sdk/router/)  
🔗 [Expo SQLite Usage Guide](https://docs.expo.dev/versions/latest/sdk/sqlite/#usage)

**User Story:**  
As a user, I want to navigate between Surah, Juz, and Page views seamlessly.

**Acceptance Criteria:**

1. The app **shall provide tabbed navigation** for Surah, Juz, and Page.
2. Juz data **shall be generated dynamically** via the SQL query in `database.md`.
3. Page segments **shall be read from `page_segments` table**.
4. Navigation state **shall persist** using SQLite key-value storage.
5. All navigation screens **shall adhere to rhythm and hierarchy** from `ux-ui-guidelines.md`.

---

## 🔖 Requirement 6 — Reading Progress & Bookmarks

**Documentation:**  
🔗 [Expo SQLite Key-Value Storage](https://docs.expo.dev/versions/latest/sdk/sqlite/#key-value-storage)

**User Story:**  
As a user, I want to resume reading from where I left off.

**Acceptance Criteria:**

1. The app **shall store last read position** (`sura_number`, `ayah_number`) in SQLite key-value store.
2. On launch, **the app shall navigate automatically** to the last read Ayah.
3. Users **shall be able to bookmark specific Ayahs**.
4. Bookmarks **shall persist** across sessions.
5. Selecting a bookmark **shall navigate** to the respective Surah and Ayah.

---

## 👆 Requirement 7 — Touch & Interaction Design

**Documentation:**  
Refer to design heuristics in `ux-ui-guidelines.md`.

**User Story:**  
As a user, I want all interactive elements to be comfortable and responsive.

**Acceptance Criteria:**

1. Interactive components **shall have a minimum 44 px touch target**.
2. Focus and active states **shall be clearly visible within 50 ms**.
3. Interactive spacing **shall follow Uniwind rhythm (≥8 px)**.
4. Visual feedback **shall align with platform conventions (iOS / Android / Web)**.
5. The design **shall follow accessibility and rhythm guidelines** from `ux-ui-guidelines.md`.

---

## 🌐 Requirement 8 — Cross-Platform Consistency

**Documentation:**  
🔗 [Expo Router Guide](https://docs.expo.dev/versions/latest/sdk/router/)  
🔗 [Uniwind Docs — LLM Full Reference](https://docs.uniwind.dev/llms-full.txt)

**User Story:**  
As a user, I want the app to behave and look consistent across iOS, Android, and Web.

**Acceptance Criteria:**

1. The app **shall render correctly** across all platforms.
2. Uniwind **shall apply platform selectors** (`ios:`, `android:`, `web:`) as needed.
3. Web builds **shall support SQLite (wasm)** as configured in `metro.config.js`.
4. Typography, spacing, and layout **shall remain consistent across devices**.
5. The LLM agent **shall always reference official Expo and Uniwind docs** when generating platform-specific code.

---

✅ **Status:**  
This document represents the authoritative requirements baseline, grounded exclusively in:

- `agent/database.md` — Database schema & queries
- `agent/implementation-guide.md` — Verified Expo, SQLite, Router, and Uniwind docs
- `agent/ux-ui-guidelines.md` — Design heuristics for accessibility and clarity

**LLM Rule:**

> Always use the official documentation URLs listed in `implementation-guide.md` for Uniwind, Expo Router, and Expo SQLite when generating, reasoning about, or modifying code.
