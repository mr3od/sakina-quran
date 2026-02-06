# Sakina Quran: Unified SEO Benchmark & Audit Report

**Date:** January 19, 2026
**Benchmark:** quran.com

## 1. Executive Summary

This report provides a comprehensive evaluation of **Sakina Quran**'s SEO strategy compared to the industry benchmark, **quran.com**.

The audit reveals a "Hybrid Reality": Sakina leads in modern technical integration (JSON-LD structured data), but Quran.com dominates in visual brand authority (Dynamic OG images), URL maturity (Slug-based routing), and localized metadata depth. This document merges findings from both Surah-level and Page-level audits to provide a single Source of Truth for the project's SEO roadmap.

---

## 2. Comparative Analysis Matrix

| Feature               | Quran.com (The Benchmark)                                                                   | Sakina Quran (Local)                                           | Assessment                                |
| :-------------------- | :------------------------------------------------------------------------------------------ | :------------------------------------------------------------- | :---------------------------------------- |
| **URL Structure**     | `/al-baqarah` and `/page/1`                                                                 | `/2` and `/pages/1`                                            | **Sakina lacks industry-standard paths.** |
| **Meta Descriptions** | **Elite**: Dynamically includes verses, revelation place (Meccan/Medinan), and ayah counts. | **Static**: Uses a fixed template description across routes.   | **Major Gap: Content Richness.**          |
| **Social Previews**   | **Elite**: Generates dynamic images for every Surah (e.g., showing Surah name/metadata).    | **Basic**: Uses a single global `icon.png` for all shares.     | **Major Gap: Visual Branding.**           |
| **Structured Data**   | **Minimal**: No JSON-LD or Microdata found during the audit.                                | **Excellent**: Already implements `Article` and `FAQ` schemas. | **Sakina is Ahead.**                      |
| **Pagination Meta**   | **Missing**: No `rel="prev/next"` in HTML head.                                             | **Missing**: Not yet implemented.                              | **Opportunity to Lead.**                  |
| **Localization**      | **Massive**: 20+ `hreflang` tags (Arabic, English, Vietnamese, etc.).                       | **Single**: Focused on English UI + Arabic content.            | **Out of Scope** (Strategic choice).      |

---

## 3. Detailed Audit Findings

### 3.1 The "Context" Gap (Descriptions & Metadata)

Quran.com doesn't just index the page; it describes it. Their meta descriptions for Suras include:

- Revelation Order & Place (e.g., "Medina, ordered 2")
- Meaning of the name (e.g., "The Cow")
- Dynamic Verse Snippets (Pulling first few ayahs into the snippet)

**Sakina Status:** Currently uses a generic "Read Quran page X" template. We have the data locally in `public/api/static/` to bridge this gap immediately.

### 3.2 The "Visual" Gap (Dynamic OG Images)

When a quran.com link is shared, the preview is informative. They use a dedicated API (`og.qurancdn.com`) to render the Surah name directly onto the image.

**Sakina Status:** Using a static site icon provides zero visual context in social feeds (WhatsApp, Twitter, etc.).

### 3.3 The "Architecture" Gap (Routing & Canonicals)

Quran.com reinforces their brand through human-readable slugs. Even if a user visits `/2`, the canonical URL points to `/al-baqarah`.

**Sakina Status:** Currently tied to numerical IDs only. This is functional but less "discoverable" and "trustworthy" for users seeing URLs in search results.

---

## 4. Master Roadmap: "Surpass the Benchmark"

### ✨ Phase 1: The "Visual & Context" Gap (Quick Wins)

- **Dynamic Descriptions (P0):** Update `[number].tsx` to pull revelation place (Meccan/Medinan) and first few verses from static JSON into the `<meta name="description">`.
- **Breadcrumb JSON-LD (P1):** Add `BreadcrumbList` schema to dynamic pages so Google shows the path (Home > Surah > Al-Baqarah) in search results.
- **Pagination Links (P1):** Add `rel="prev"` and `rel="next"` to the `<head>`. Since even the benchmark missed this, adding it makes Sakina more "technically perfect" than quran.com.

### 🚀 Phase 2: The "Architecture" Upgrade (Deep SEO)

- **Route Path Standardization (P0):** Rename `/pages/` route to `/page/` to match the established web pattern.
- **Slug-Based Routing (P1):** Implement a mapping system so `quran.mr3od.dev/al-baqarah` works and canonicalizes correctly.
- **Dynamic Social Previews (P2):** Integration of an OG image API (like `@vercel/og`) to generate previews that show the Surah name and Page number.
- **Language-Specific Schema (P2):** Update JSON-LD to explicitly mark Quranic text blocks with `inLanguage: "ar"`.

---

## 5. Summary

Sakina Quran has a superior technical foundation (React 19, Server Mode, Structured Data). The benchmark (Quran.com) wins on "polish" and "perceived authority" through its URLs and social images. By executing Phase 1, Sakina closes the textual and structural gaps. Phase 2 will cement its position as the most modern and discoverable Quran platform available.
