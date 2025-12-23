import type { Ayah, JuzData, PageSegment, Surah } from "@/types/quran.types";
import type { SQLiteDatabase } from "expo-sqlite";

/**
 * QuranRepository
 *
 * Single Source of Truth for Quran database interactions.
 * This repository abstracts raw SQL queries and ensures consistent data access types.
 */
export class QuranRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  /**
   * Get all Surahs.
   */
  async getSurahs(): Promise<Surah[]> {
    return this.db.getAllAsync<Surah>("SELECT * FROM surahs ORDER BY id");
  }

  /**
   * Get a single Surah by ID.
   */
  async getSurah(id: number): Promise<Surah | null> {
    const result = await this.db.getFirstAsync<Surah>(
      "SELECT * FROM surahs WHERE id = ?",
      [id],
    );
    return result ?? null;
  }

  /**
   * Get all Ayahs for a specific Surah.
   */
  async getAyahs(suraNumber: number): Promise<Ayah[]> {
    return this.db.getAllAsync<Ayah>(
      "SELECT * FROM ayahs WHERE sura_number = ? ORDER BY ayah_number",
      [suraNumber],
    );
  }

  /**
   * Get a single Ayah.
   */
  async getAyah(sura: number, ayah: number): Promise<Ayah | null> {
    const result = await this.db.getFirstAsync<Ayah>(
      "SELECT * FROM ayahs WHERE sura_number = ? AND ayah_number = ?",
      [sura, ayah],
    );
    return result ?? null;
  }

  /**
   * Get all page segments.
   */
  async getPageSegments(): Promise<PageSegment[]> {
    return this.db.getAllAsync<PageSegment>(
      "SELECT * FROM page_segments ORDER BY page_number",
    );
  }

  /**
   * Get a single page segment.
   */
  async getPageSegment(pageNumber: number): Promise<PageSegment | null> {
    const result = await this.db.getFirstAsync<PageSegment>(
      "SELECT * FROM page_segments WHERE page_number = ?",
      [pageNumber],
    );
    return result ?? null;
  }

  /**
   * Get Juz list with their starting Surahs.
   */
  async getJuzList(): Promise<JuzData[]> {
    const query = `
      WITH surah_first_page AS (
        SELECT
          ps.sura_start AS surah_id,
          MIN(ps.page_number) AS first_page
        FROM page_segments ps
        GROUP BY ps.sura_start
      ),
      surah_first_juz AS (
        SELECT
          sfp.surah_id,
          ps.juz_number
        FROM surah_first_page sfp
        JOIN page_segments ps
          ON ps.page_number = sfp.first_page
      )
      SELECT
        sfj.juz_number,
        json_group_array(
          json_object(
            'id', s.id,
            'name_simple', s.name_simple,
            'name_arabic', s.name_arabic,
            'name_complex', s.name_complex,
            'revelation_place', s.revelation_place,
            'revelation_order', s.revelation_order,
            'bismillah_pre', s.bismillah_pre,
            'verses_count', s.verses_count,
            'pages_range', s.pages_range
          )
        ) AS surahs
      FROM surah_first_juz sfj
      JOIN surahs s ON s.id = sfj.surah_id
      GROUP BY sfj.juz_number
      ORDER BY sfj.juz_number
    `;

    const result = await this.db.getAllAsync<{
      juz_number: number;
      surahs: string;
    }>(query);

    return result.map((row) => ({
      juz_number: row.juz_number,
      surahs: JSON.parse(row.surahs) as Surah[],
    }));
  }

  /**
   * Get all ayahs for a specific page.
   * Handles cross-surah pages correctly.
   */
  async getAyahsByPage(pageNumber: number): Promise<Ayah[]> {
    const segment = await this.getPageSegment(pageNumber);
    if (!segment) return [];

    // Same-surah page
    if (segment.sura_start === segment.sura_end) {
      return await this.db.getAllAsync<Ayah>(
        `SELECT * FROM ayahs 
         WHERE sura_number = ? 
         AND ayah_number >= ? 
         AND ayah_number <= ?
         ORDER BY ayah_number`,
        [segment.sura_start, segment.ayah_start, segment.ayah_end],
      );
    }

    // Cross-surah page
    return await this.db.getAllAsync<Ayah>(
      `SELECT * FROM ayahs 
       WHERE (sura_number = ? AND ayah_number >= ?)
          OR (sura_number > ? AND sura_number < ?)
          OR (sura_number = ? AND ayah_number <= ?)
       ORDER BY sura_number, ayah_number`,
      [
        segment.sura_start,
        segment.ayah_start,
        segment.sura_start,
        segment.sura_end,
        segment.sura_end,
        segment.ayah_end,
      ],
    );
  }

  /**
   * Resolve the page number for a specific Ayah.
   */
  async getPageForAyah(sura: number, ayah: number): Promise<number | null> {
    const result = await this.db.getFirstAsync<{ page_number: number }>(
      `SELECT page_number
     FROM page_segments
     WHERE (sura_start < ? OR (sura_start = ? AND ayah_start <= ?))
       AND (sura_end > ? OR (sura_end = ? AND ayah_end >= ?))
     ORDER BY page_number ASC
     LIMIT 1`,
      [sura, sura, ayah, sura, sura, ayah],
    );

    return result?.page_number ?? null;
  }
}
