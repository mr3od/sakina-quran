/**
 * Theme Metadata - Type-Safe Theme Definitions
 * Provides typed metadata for all Sakinah themes
 */

import type { ThemeId } from "./settings-contract";

/**
 * Theme metadata interface
 * Provides all information needed to display theme in UI
 */
export interface ThemeMeta {
  id: ThemeId;
  nameEn: string;
  nameAr: string;
  icon: string; // Ionicons glyph name
  preview: {
    bg: string; // Background color for preview
    accent: string; // Accent color for preview
  };
}

/**
 * Complete theme metadata registry
 * Type-safe binding to ThemeId ensures no invalid themes
 */
export const THEMES: Record<ThemeId, ThemeMeta> = {
  fajr: {
    id: "fajr",
    nameEn: "Fajr",
    nameAr: "فجر",
    icon: "sunny",
    preview: {
      bg: "#FCFAF8", // --color-raml-50
      accent: "#059669", // --color-zumurrud-600
    },
  },
  layl: {
    id: "layl",
    nameEn: "Layl",
    nameAr: "ليل",
    icon: "moon",
    preview: {
      bg: "#020617", // --color-slate-950
      accent: "#10B981", // --color-zumurrud-500
    },
  },
  asr: {
    id: "asr",
    nameEn: "Asr",
    nameAr: "عصر",
    icon: "document-text",
    preview: {
      bg: "#FBF4E6", // Sepia background
      accent: "#CA8A04", // --color-dhahab-600
    },
  },
  tahajjud: {
    id: "tahajjud",
    nameEn: "Tahajjud",
    nameAr: "تهجد",
    icon: "star",
    preview: {
      bg: "#000000", // Pure black (AMOLED)
      accent: "#10B981", // --color-zumurrud-500
    },
  },
  masjid: {
    id: "masjid",
    nameEn: "Masjid",
    nameAr: "مسجد",
    icon: "business",
    preview: {
      bg: "#022C22", // Deep green
      accent: "#EAB308", // --color-dhahab-500
    },
  },
};

/**
 * Sorted array of themes for UI consumption
 * Order: Fajr, Layl, Asr, Tahajjud, Masjid
 */
export const THEMES_ARRAY: ThemeMeta[] = [
  THEMES.fajr,
  THEMES.layl,
  THEMES.asr,
  THEMES.tahajjud,
  THEMES.masjid,
];
