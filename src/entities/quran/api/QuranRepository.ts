import type { Ayah, JuzData, PageSegment, Surah } from "@/types/quran.types";

/**
 * WebQuranRepository
 *
 * Web implementation that fetches data from static JSON endpoints.
 * This decouples the web version from SQLite, enabling faster loads and SSG.
 */
export class QuranRepository {
  private static BASE_URL = "/api/static";

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(_db: any = null) {}

  /**
   * Get all Surahs.
   */
  async getSurahs(): Promise<Surah[]> {
    const res = await fetch(`${QuranRepository.BASE_URL}/surahs.json`);
    if (!res.ok) throw new Error("Failed to load Surahs");
    return res.json();
  }

  /**
   * Get a single Surah by ID.
   */
  async getSurah(id: number): Promise<Surah | null> {
    const surahs = await this.getSurahs();
    return surahs.find((s) => s.id === id) ?? null;
  }

  /**
   * Get all Ayahs for a specific Surah.
   */
  async getAyahs(suraNumber: number): Promise<Ayah[]> {
    // Falls back to search API if full surah JSON not generated (currently only pages generated)
    // For now, return empty as full surah fetch is a larger feature parity goal
    return [];
  }

  /**
   * Get a single Ayah.
   */
  async getAyah(sura: number, ayah: number): Promise<Ayah | null> {
    const res = await fetch(`/api/search?sura=${sura}&ayah=${ayah}&limit=1`);
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] || null;
  }

  /**
   * Get all page segments.
   */
  async getPageSegments(): Promise<PageSegment[]> {
    const res = await fetch(`${QuranRepository.BASE_URL}/page_segments.json`);
    if (!res.ok) throw new Error("Failed to load page segments");
    return res.json();
  }

  /**
   * Get a single page segment.
   */
  async getPageSegment(pageNumber: number): Promise<PageSegment | null> {
    const segments = await this.getPageSegments();
    return segments.find((s) => s.page_number === pageNumber) ?? null;
  }

  /**
   * Get Juz list with their starting Surahs.
   */
  async getJuzList(): Promise<JuzData[]> {
    const res = await fetch(`${QuranRepository.BASE_URL}/juz.json`);
    if (!res.ok) throw new Error("Failed to load Juz list");
    return res.json();
  }

  /**
   * Get all ayahs for a specific page.
   */
  async getAyahsByPage(pageNumber: number): Promise<Ayah[]> {
    const res = await fetch(
      `${QuranRepository.BASE_URL}/pages/${pageNumber}.json`,
    );
    if (!res.ok) return [];
    return res.json();
  }

  /**
   * Resolve the page number for a specific Ayah.
   */
  async getPageForAyah(sura: number, ayah: number): Promise<number | null> {
    const segments = await this.getPageSegments();
    const segment = segments.find(
      (s) =>
        (s.sura_start < sura ||
          (s.sura_start === sura && s.ayah_start <= ayah)) &&
        (s.sura_end > sura || (s.sura_end === sura && s.ayah_end >= ayah)),
    );
    return segment?.page_number ?? null;
  }
}
