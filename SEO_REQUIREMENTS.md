# Unified SEO Requirements: Sakina Quran

**Goal:** Close the gap with quran.com and establish tech-lead in Quranic SEO.

---

## 🛠 Required Tasks

### 1. Route Path Standardization (P0)

- **Requirement:** Rename route directory from `src/app/pages/` to `src/app/page/`.
- **Action:** Update file paths, `generateStaticParams`, and `sitemap.xml` generation logic.

### 2. Dynamic Content Snippets (P0)

- **Requirement:** Metadata must describe specific content, not just "Page X".
- **Implementation:**
  - Pull first `uthmani_text` from local `public/api/static/pages/${number}.json`.
  - Pull Surah metadata (Meccan/Medinan, Order, Meaning) from `surahs.json`.
  - **Snippet Template:** "Read Surah [Name] ([Meaning]). Revealed in [Place]. [Verse 1 Snippet]..."

### 3. Technical Lead: Header Pagination (P1)

- **Requirement:** Add `rel="prev"` and `rel="next"` to the `<head>`.
- **Why:** Quran.com doesn't have this. It helps crawlers map the sequence of the 604 pages as a single cohesive book.

### 4. Structured Data Breadcrumbs (P1)

- **Requirement:** Implement `BreadcrumbList` JSON-LD.
- **Structure:** `Home > Surah [Name]` or `Home > Page [Number]`.
- **Goal:** Enable "Hierarchy snippets" in Google search (e.g., `quran.mr3od.dev › 2 › al-baqarah`).

### 5. Slug-Based Routing & Canonicals (P1)

- **Requirement:** Support URLs like `/al-baqarah` in addition to `/2`.
- _Task:_ Create a slug mapping and ensure that visits to numerical routes (e.g., `/2`) set their `<link rel="canonical">` to the slug-based version.

### 6. Dynamic OG Image Strategy (P2)

- **Requirement:** Replace static `icon.png` in social shares.
- **Task:** Define a strategy for on-the-fly image generation (e.g., Vercel OG or similar) to render Surah Name and Verse Number onto the preview image.

### 7. Multilingual Schema Tagging (P2)

- **Requirement:** Clearly distinguish English UI from Arabic Content in JSON-LD.
- **Task:** Add `inLanguage: "ar"` property specifically to the Quranic text nodes within our schema output.

---

## 🧪 Validation & Success Criteria

- [ ] **Accessibility:** All metadata must be present in the initial HTML source (view-source).
- [ ] **Accuracy:** Surah Al-Fatihah metadata must not leak into Surah Al-Baqarah pages.
- [ ] **Performance:** Fetching static JSON for metadata must not significantly slow down build/export time.
- [ ] **Validation:** Run `npm run validate-seo` and check for green statuses on all 604 pages.
