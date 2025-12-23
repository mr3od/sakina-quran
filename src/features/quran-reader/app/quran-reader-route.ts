/**
 * Centralized routing helpers for Quran reader
 */

import type { Href } from "expo-router";

/**
 * Navigate to page with optional ayah highlight
 */
export function toPageRoute(page: number, surah?: number, ayah?: number): Href {
  return {
    pathname: "/pages/[number]",
    params: {
      number: String(page),
      ...(surah ? { surah: String(surah) } : {}),
      ...(ayah ? { ayah: String(ayah) } : {}),
    },
  } as Href;
}
