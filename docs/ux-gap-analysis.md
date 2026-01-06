# UX Gap Analysis: Quran.com vs Sakina

**Date:** January 6, 2026 (Updated)  
**Status:** Phase 1 Complete - Major gaps addressed  
**Objective:** Track remaining UX gaps after responsive web layout implementation.

---

## Executive Summary

**✅ MAJOR PROGRESS:** Sakina has been successfully transformed from a mobile-first "file explorer" to a premium web "portal" experience.

**Phase 1 Complete (January 6, 2026):**

- ✅ Hero section with prominent search
- ✅ Responsive layout (`max-w-5xl` with breakpoints)
- ✅ Continue Reading card component
- ✅ Card-based browse UI with grid layouts
- ✅ Hover states and quiet action buttons
- ✅ Generous vertical spacing between verses

**Remaining gaps (Phase 2):**

1. **Web Search UX**: Dropdown instead of navigation, wider input
2. **Continue Reading Layout**: Better positioning, real bookmark data
3. **Browse Tabs**: Better alignment and positioning
4. **Desktop Navigation**: Drawer system for desktop
5. **Reading Context Header**: Sticky header with Surah context
6. **Microanimations**: Polish and smooth transitions

---

## 1. The Home Page (Landing Experience)

### ✅ IMPLEMENTED (Phase 1 - January 6, 2026)

**Architecture:**

- ✅ **Hero Section**: Clean, centered layout with prominent title
- ✅ **Search-First CTA**: Large, centered search bar (needs dropdown enhancement)
- ✅ **Continue Reading Card**: Positioned below search (needs layout improvement)
- ✅ **Structured Discovery**: Surah/Juz presented as **tabs** with card-based grid layouts
  - ✅ Card-based design with rich metadata
  - ✅ 3-column grid on large screens
  - ✅ Responsive breakpoints

**Information Flow:**

```
✅ Intent (Search) → ✅ Continuity (Last Read) → ✅ Discovery (Browse)
```

**Visual Weight Distribution:**

1. ✅ Search (Primary CTA)
2. ✅ Continue Reading (Personal connection)
3. ✅ Browse Lists (Structured discovery)

---

### 🔄 REMAINING IMPROVEMENTS (Phase 2)

**Search Enhancement:**

- Search input too narrow on wide screens
- Should show dropdown with results instead of navigating to search page

**Continue Reading Layout:**

- Currently centered, needs better positioning
- "Latest Bookmarks" doesn't show real bookmark data

**Browse Tabs:**

- Currently centered, should be left-aligned for better visual hierarchy

---

### The Gap: Home Page

| Element              | Quran.com                            | Sakina (Phase 1)         | Status                             |
| -------------------- | ------------------------------------ | ------------------------ | ---------------------------------- |
| **First Impression** | Portal with hero section             | ✅ Hero section added    | **COMPLETE**                       |
| **Search**           | Primary centered CTA                 | ✅ Elevated to hero      | **COMPLETE** (needs dropdown)      |
| **Last Read**        | Prominent card below search          | ✅ Continue Reading card | **COMPLETE** (needs layout polish) |
| **Browse UI**        | Tabbed cards with rich metadata      | ✅ Card-based grid       | **COMPLETE** (needs tab alignment) |
| **Visual Hierarchy** | Tiered (Search > Last Read > Browse) | ✅ Clear visual tiers    | **COMPLETE**                       |

---

## 2. The Shell (Layout & Responsiveness)

### ✅ IMPLEMENTED (Phase 1 - January 6, 2026)

**Desktop:**

- ✅ Wide, centered layout with responsive constraints (`max-w-5xl`)
- ✅ Responsive breakpoints: `max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl`
- ✅ Full-width backgrounds with constrained content
- ✅ WebHeader component for web-specific navigation

**Tablet/Mobile:**

- ✅ Responsive margins and padding (`px-4 sm:px-8`)
- ✅ Proper scaling across all screen sizes
- ✅ Platform-specific components (`.native.tsx` suffix)

### 🔄 REMAINING (Phase 2)

**Desktop Navigation:**

- Missing drawer system (left: browse, right: settings)
- Bottom tab bar still used on desktop (should be drawer-based)

---

### The Gap: Layout

| Dimension          | Quran.com                 | Sakina (Phase 1)          | Status                  |
| ------------------ | ------------------------- | ------------------------- | ----------------------- |
| **Desktop Width**  | Expansive centered layout | ✅ `max-w-5xl` responsive | **COMPLETE**            |
| **Navigation**     | Drawer-based (left/right) | Bottom tab bar            | **NEEDS DRAWER SYSTEM** |
| **Sidebar**        | None (drawers on-demand)  | None                      | **NEEDS DRAWERS**       |
| **Responsiveness** | Adapts margins and layout | ✅ Breakpoint-based       | **COMPLETE**            |

---

## 3. The Navigation (Context Switching)

### The Gold Standard (Quran.com)

**Mechanism:**

- **Left Drawer**: Surah/Juz/Page selector with tabs
- **Right Drawer**: Settings and preferences
- **Sticky Header**: Shows current context (Surah name, Page number)
- **Transitions**: Smooth SPA-style navigation (no full page reload)

**Feel:** Desktop app experience, not a website.

---

### The Current Reality (Sakina)

**Mechanism:**

- **Bottom Tab Bar**: Home, Search, Bookmarks, Settings
- **Segmented Control**: Surah/Juz toggle on home screen
- **Navigation**: Expo Router file-based routing

**Feel:** Mobile app pattern on all screen sizes.

---

### The Gap: Navigation

| Feature               | Quran.com               | Sakina (Phase 1) | Status                                  |
| --------------------- | ----------------------- | ---------------- | --------------------------------------- |
| **Context Switching** | Drawer with tabs        | Bottom tab bar   | **NEEDS DRAWER FOR DESKTOP**            |
| **Settings Access**   | Right drawer            | Bottom tab       | **NEEDS DRAWER FOR DESKTOP**            |
| **Current Context**   | Sticky header indicator | Route-based      | **NEEDS STICKY READING CONTEXT HEADER** |
| **Transitions**       | Smooth SPA              | ✅ Expo Router   | **COMPLETE**                            |

---

## 4. The Interactions (Feel & Microinteractions)

### ✅ IMPLEMENTED (Phase 1 - January 6, 2026)

**Reading View:**

- ✅ **Verse Actions**: Bookmark button with hover states
- ✅ **Visibility**: Faded until hover (quiet UX principle)
- ✅ **Hover State**: Brightens on hover, smooth transitions

### 🔄 REMAINING (Phase 2)

**Microanimations:**

- Smooth transitions between states
- Drawer slide animations
- Search dropdown animations

---

### The Gap: Interactions

| Feature               | Quran.com                      | Sakina (Phase 1) | Status                         |
| --------------------- | ------------------------------ | ---------------- | ------------------------------ |
| **Verse Actions**     | Quiet (faded until hover)      | ✅ Implemented   | **COMPLETE**                   |
| **Action Buttons**    | Subtle gray, brighten on hover | ✅ Implemented   | **COMPLETE**                   |
| **Word Interactions** | Click for translation          | Not implemented  | **DEFERRED** (complex feature) |
| **Transitions**       | Smooth, animated               | Basic            | **NEEDS MICROANIMATIONS**      |

---

## 5. The "Soul" (Typography & Density)

### ✅ IMPLEMENTED (Phase 1 - January 6, 2026)

**Vertical Rhythm:**

- ✅ Generous spacing between verses (`py-8` web, `p-6` mobile)
- ✅ Subtle separators (CSS pseudo-elements on web)
- ✅ Ample padding ensures text "breathes"

**Hierarchy:**

- ✅ **Arabic Text**: Large, high-quality font (`font-arabic`)
- ✅ **UI Text**: Proper font separation (`font-ui-ar`, `font-ui-en`)
- ✅ **Semantic Tokens**: `text-text-primary`, `text-text-secondary`

**Feel:** ✅ The text has room to breathe. Premium reading experience achieved.

---

### The Gap: Typography & Density

| Feature           | Quran.com                       | Sakina (Phase 1)     | Status       |
| ----------------- | ------------------------------- | -------------------- | ------------ |
| **Verse Spacing** | Generous vertical padding       | ✅ Implemented       | **COMPLETE** |
| **Line Height**   | Tall, breathable                | ✅ Implemented       | **COMPLETE** |
| **Hierarchy**     | Strong (size + color)           | ✅ Semantic tokens   | **COMPLETE** |
| **Separators**    | Horizontal lines between verses | ✅ Subtle separators | **COMPLETE** |

---

## Summary of Remaining Gaps (Phase 2)

### Priority 1: Web Search Enhancement

1. **Wider Search Input** on desktop screens
2. **Dropdown Results** instead of navigation to search page
3. **Autocomplete/Suggestions** for better UX

### Priority 2: Continue Reading & Browse Polish

1. **Better Continue Reading Layout** (not centered, proper positioning)
2. **Real Bookmark Data** in "Latest Bookmarks" section
3. **Better Tab Alignment** (left-aligned instead of centered)

### Priority 3: Desktop Navigation

1. **Left Drawer** for browse (Surah/Juz/Page selector)
2. **Right Drawer** for settings and preferences
3. **Responsive Navigation** (drawer on desktop, tabs on mobile)

### Priority 4: Reading Context

1. **Sticky Reading Header** in PageReaderScreen
2. **Current Context Display** (Surah name, Juz number)
3. **Enhanced Page Navigation** with more context

### Priority 5: Microanimations & Polish

1. **Smooth Transitions** between states
2. **Drawer Slide Animations**
3. **Search Dropdown Animations**

---

## Phase 1 Achievements ✅

**Completed January 6, 2026:**

- ✅ Hero section with prominent search
- ✅ Responsive layout system (`max-w-5xl` with breakpoints)
- ✅ Continue Reading card component
- ✅ Card-based browse UI with 3-column grid
- ✅ Hover states and quiet action buttons
- ✅ Generous vertical spacing and typography hierarchy
- ✅ Platform-specific components (web default, `.native.tsx` suffix)
- ✅ WebHeader component for web navigation

**Result:** Successfully transformed from mobile-first "file explorer" to premium web "portal" experience.

---

## Next Steps (Phase 2)

1. **Web Search Enhancement**: Implement dropdown with autocomplete
2. **Continue Reading Polish**: Better layout and real bookmark data
3. **Desktop Drawer System**: Left (browse) and right (settings) drawers
4. **Reading Context Header**: Sticky header with Surah/Juz context
5. **Microanimations**: Add smooth transitions and polish

---

## Implementation Notes

**Phase 1 Commits:**

- `08d7e52` - Responsive layout implementation (24 files, 695+ insertions)
- `9fbd4ce` - Updated development guidelines

**Architecture Decisions:**

- Web-first approach with `.native.tsx` suffix for native overrides
- Semantic design tokens throughout (`bg-surface`, `text-text-primary`)
- Platform-specific components (AyahCard row vs card layout)
- Responsive constraint system with breakpoints

---

## Appendix: Visual References

Browser recordings and screenshots captured during analysis:

- ![Home Page Hero](file:///Users/nexumind/Desktop/Github/sakina-quran/docs/assets/ux-analysis/quran_home_analysis_1767660085152.webp)
- ![Reading View Interactions](file:///Users/nexumind/Desktop/Github/sakina-quran/docs/assets/ux-analysis/verse_hover_state_1767658204258.png)
- ![Surah Selector Drawer](file:///Users/nexumind/Desktop/Github/sakina-quran/docs/assets/ux-analysis/surah_selector_drawer_1767658311200.png)
- ![Settings Drawer](file:///Users/nexumind/Desktop/Github/sakina-quran/docs/assets/ux-analysis/settings_panel_drawer_right_1767658548266.png)
- ![Page Navigation](file:///Users/nexumind/Desktop/Github/sakina-quran/docs/assets/ux-analysis/page_surah_navigation_1767659068269.webp)
