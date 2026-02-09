import { MAX_HIZB, MAX_JUZ, MAX_SURAH } from "@/shared/constants/quran";
import { i18n } from "@lingui/core";
import type { SQLiteDatabase } from "expo-sqlite";
import type { Searcher, SearchRow } from "../../domain/search-contract";
import { parseSearchQuery } from "../../domain/query-parser";
import { getSurahNameColumn } from "../utils/getSurahNameColumn";
import { pageResolverSubquery } from "../utils/sqlFragments";

export class StructuralSearcher implements Searcher {
  constructor(private readonly db: SQLiteDatabase) {}

  async search(query: string, _limit?: number): Promise<SearchRow[]> {
    try {
      const parsed = parseSearchQuery(query);
      if (parsed.kind === "empty" || parsed.kind === "text") return [];

      const nameCol = getSurahNameColumn();

      // Special: "N:N" → Surah:Ayah
      if (parsed.kind === "surahAyah") {
        const { sura, ayah } = parsed;

        const mapped = await this.db.getFirstAsync<{
          surah_name: string;
          page_number: number;
        }>(
          `SELECT s.${nameCol} AS surah_name,
                ${pageResolverSubquery("?", "?")} AS page_number
         FROM surahs s
         WHERE s.id = ?`,
          [sura, sura, ayah, sura, sura, ayah, sura],
        );

        return [
          {
            type: "surahAyah",
            sura,
            ayah,
            surahName: mapped?.surah_name || i18n._("Surah {sura}", { sura }),
            simple: `${sura}:${ayah}`,
            page: mapped?.page_number ?? 0,
          },
        ];
      }

      // Numeric searches (pure or extracted from mixed)
      const num = parsed.value;
      const items: SearchRow[] = [];

      // Surah
      if (num >= 1 && num <= MAX_SURAH) {
        const s = await this.db.getFirstAsync<{
          page_number: number;
          surah_name: string;
        }>(
          `SELECT MIN(ps.page_number) AS page_number, s.${nameCol} AS surah_name
       FROM page_segments ps
       JOIN surahs s ON s.id = ps.sura_start
       WHERE ps.sura_start = ?`,
          [num],
        );

        if (s?.page_number) {
          items.push({
            type: "surah",
            sura: num,
            ayah: 1,
            surahName: s.surah_name,
            simple: i18n._("Surah {num}", { num }),
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
          surah_name: string;
        }>(
          `SELECT ps.page_number, ps.sura_start, ps.ayah_start, s.${nameCol} AS surah_name
       FROM page_segments ps
       JOIN surahs s ON s.id = ps.sura_start
       WHERE ps.juz_number = ?
       ORDER BY ps.page_number ASC
       LIMIT 1`,
          [num],
        );

        if (j?.page_number && j.sura_start && j.ayah_start) {
          items.push({
            type: "juz",
            sura: j.sura_start,
            ayah: j.ayah_start,
            surahName: j.surah_name,
            simple: i18n._("Juz {num}", { num }),
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
          surah_name: string;
        }>(
          `SELECT ps.page_number, ps.sura_start, ps.ayah_start, s.${nameCol} AS surah_name
       FROM page_segments ps
       JOIN surahs s ON s.id = ps.sura_start
       WHERE ps.hizb_number = ?
       ORDER BY ps.page_number ASC
       LIMIT 1`,
          [num],
        );

        if (h?.page_number && h.sura_start && h.ayah_start) {
          items.push({
            type: "hizb",
            sura: h.sura_start,
            ayah: h.ayah_start,
            surahName: h.surah_name,
            simple: i18n._("Hizb {num}", { num }),
            page: h.page_number,
          });
        }
      }

      // Page
      const p = await this.db.getFirstAsync<{
        page_number: number;
        sura_start: number;
        ayah_start: number;
        surah_name: string;
      }>(
        `SELECT ps.page_number, ps.sura_start, ps.ayah_start, s.${nameCol} AS surah_name
     FROM page_segments ps
     JOIN surahs s ON s.id = ps.sura_start
     WHERE ps.page_number = ?
     LIMIT 1`,
        [num],
      );

      if (p?.page_number && p.sura_start && p.ayah_start) {
        items.push({
          type: "page",
          sura: p.sura_start,
          ayah: p.ayah_start,
          surahName: p.surah_name,
          simple: i18n._("Page {num}", { num }),
          page: p.page_number,
        });
      }

      return items;
    } catch (e) {
      console.error("StructuralSearcher.native search failed:", e);
      return [];
    }
  }
}
