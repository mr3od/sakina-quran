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

/**
 * Navigate to ayah (calculates page first)
 * Note: This is now async as it needs to query the database
 */
export async function toAyahRoute(
  getPageForAyah: (sura: number, ayah: number) => Promise<number | null>,
  sura: number,
  ayah: number,
): Promise<Href> {
  const page = await getPageForAyah(sura, ayah);
  return toPageRoute(page ?? 1, sura, ayah);
}
