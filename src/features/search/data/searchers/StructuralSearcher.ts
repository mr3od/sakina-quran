import { MAX_HIZB, MAX_JUZ, MAX_SURAH } from "@/shared/constants/quran";
import type { SQLiteDatabase } from "expo-sqlite";
import type { Searcher, SearchRow } from "../../domain/search-contract";

const RE_SURA_AYAH = /^(\d+)\s*[:：]\s*(\d+)$/;
const HAS_DIGIT = /\d/;

export class StructuralSearcher implements Searcher {
  constructor(private readonly db: SQLiteDatabase) {}

  async search(query: string): Promise<SearchRow[]> {
    const q = query.trim();
    if (!q || !HAS_DIGIT.test(q)) return [];

    // Special: "N:N" → Surah:Ayah
    const pair = q.match(RE_SURA_AYAH);
    if (pair) {
      const sura = Number(pair[1]);
      const ayah = Number(pair[2]);

      // Get Surah name and Page number
      const mapped = await this.db.getFirstAsync<{
        name_simple: string;
        page_number: number;
      }>(
        `SELECT s.name_simple,
              (SELECT ps.page_number
               FROM page_segments ps
               WHERE (ps.sura_start < ? OR (ps.sura_start = ? AND ps.ayah_start <= ?))
                 AND (ps.sura_end > ? OR (ps.sura_end = ? AND ps.ayah_end >= ?))
               ORDER BY ps.page_number ASC
               LIMIT 1) AS page_number
       FROM surahs s
       WHERE s.id = ?`,
        [sura, sura, ayah, sura, sura, ayah, sura]
      );

      return [
        {
          type: "surahAyah",
          sura,
          ayah,
          surahName: mapped?.name_simple || `Surah ${sura}`,
          simple: `${sura}:${ayah}`,
          page: mapped?.page_number ?? 0,
        },
      ];
    }

    // Extract the first numeric value from mixed input ("juz 7", "صفحة 151", etc.)
    const num = Number(q.replace(/[^\d]/g, ""));
    const items: SearchRow[] = [];

    // Surah
    if (num >= 1 && num <= MAX_SURAH) {
      const s = await this.db.getFirstAsync<{
        page_number: number;
        name_simple: string;
      }>(
        `SELECT MIN(ps.page_number) AS page_number, s.name_simple
       FROM page_segments ps
       JOIN surahs s ON s.id = ps.sura_start
       WHERE ps.sura_start = ?`,
        [num]
      );

      if (s?.page_number) {
        items.push({
          type: "surah",
          sura: num,
          ayah: 1,
          surahName: s.name_simple,
          simple: `سورة ${num}`,
          page: s.page_number,
        });
      }
    }

    // Juz
    if (num >= 1 && num <= MAX_JUZ) {
      const j = await this.db.getFirstAsync<{
        page_number: number;
        sura_start: number;
        ayah_start: number;
        name_simple: string;
      }>(
        `SELECT ps.page_number, ps.sura_start, ps.ayah_start, s.name_simple
       FROM page_segments ps
       JOIN surahs s ON s.id = ps.sura_start
       WHERE ps.juz_number = ?
       ORDER BY ps.page_number ASC
       LIMIT 1`,
        [num]
      );

      if (j?.page_number && j.sura_start && j.ayah_start) {
        items.push({
          type: "juz",
          sura: j.sura_start,
          ayah: j.ayah_start,
          surahName: j.name_simple,
          simple: `الجزء ${num}`,
          page: j.page_number,
        });
      }
    }

    // Hizb
    if (num >= 1 && num <= MAX_HIZB) {
      const h = await this.db.getFirstAsync<{
        page_number: number;
        sura_start: number;
        ayah_start: number;
        name_simple: string;
      }>(
        `SELECT ps.page_number, ps.sura_start, ps.ayah_start, s.name_simple
       FROM page_segments ps
       JOIN surahs s ON s.id = ps.sura_start
       WHERE ps.hizb_number = ?
       ORDER BY ps.page_number ASC
       LIMIT 1`,
        [num]
      );

      if (h?.page_number && h.sura_start && h.ayah_start) {
        items.push({
          type: "hizb",
          sura: h.sura_start,
          ayah: h.ayah_start,
          surahName: h.name_simple,
          simple: `الحزب ${num}`,
          page: h.page_number,
        });
      }
    }

    // Page
    const p = await this.db.getFirstAsync<{
      page_number: number;
      sura_start: number;
      ayah_start: number;
      name_simple: string;
    }>(
      `SELECT ps.page_number, ps.sura_start, ps.ayah_start, s.name_simple
     FROM page_segments ps
     JOIN surahs s ON s.id = ps.sura_start
     WHERE ps.page_number = ?
     LIMIT 1`,
      [num]
    );

    if (p?.page_number && p.sura_start && p.ayah_start) {
      items.push({
        type: "page",
        sura: p.sura_start,
        ayah: p.ayah_start,
        surahName: p.name_simple,
        simple: `الصفحة ${num}`,
        page: p.page_number,
      });
    }

    return items;
  }
}
