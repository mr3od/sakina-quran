import type { SQLiteDatabase } from "expo-sqlite";
import type { Searcher, SearchRow } from "../../domain/search-contract";
import { parseSearchQuery } from "../../domain/query-parser";
import { getSurahNameColumn } from "../utils/getSurahNameColumn";
import { pageResolverSubquery } from "../utils/sqlFragments";

/** Single-token → try FTS prefix first; fallback to LIKE('%…%'). */
export class TextSearcher implements Searcher {
  constructor(private readonly db: SQLiteDatabase) {}

  async search(query: string, limit = 50): Promise<SearchRow[]> {
    try {
      const parsed = parseSearchQuery(query);
      if (parsed.kind === "empty" || parsed.kind === "numeric" || parsed.kind === "surahAyah") return [];

      const q = parsed.value;
      const nameCol = getSurahNameColumn();
      const pageSubquery = pageResolverSubquery(
        "a.sura_number",
        "a.ayah_number",
      );
    // Single token → try FTS prefix
    if (q.indexOf(" ") === -1) {
      try {
        const rows = await this.db.getAllAsync<{
          sura_number: number;
          ayah_number: number;
          simple_text: string;
          surah_name: string;
          page_number: number;
        }>(
          `SELECT a.sura_number, a.ayah_number, a.simple_text,
                s.${nameCol} AS surah_name,
                ${pageSubquery} AS page_number
         FROM ayahs_fts f
         JOIN ayahs a ON a.rowid = f.rowid
         JOIN surahs s ON s.id = a.sura_number
         WHERE ayahs_fts MATCH ?
         ORDER BY bm25(ayahs_fts)
         LIMIT ?`,
          [`${q}*`, limit],
        );

        if (rows.length) return rows.map(toAyahRow);
      } catch {
        // FTS not available or query failed → fall back to LIKE
      }
    }

    // LIKE fallback (predictable substring)
    const like = await this.db.getAllAsync<{
      sura_number: number;
      ayah_number: number;
      simple_text: string;
      surah_name: string;
      page_number: number;
    }>(
      `SELECT a.sura_number, a.ayah_number, a.simple_text,
            s.${nameCol} AS surah_name,
            ${pageSubquery} AS page_number
     FROM ayahs a
     JOIN surahs s ON s.id = a.sura_number
     WHERE a.simple_text LIKE ?
     LIMIT ?`,
      [`%${q}%`, limit],
    );

    return like.map(toAyahRow);
    } catch (e) {
      console.error("TextSearcher.native search failed:", e);
      return [];
    }
  }
}

function toAyahRow(r: {
  sura_number: number;
  ayah_number: number;
  simple_text: string;
  surah_name: string;
  page_number: number | null;
}): SearchRow {
  return {
    type: "ayah",
    sura: r.sura_number,
    ayah: r.ayah_number,
    surahName: r.surah_name,
    simple: r.simple_text,
    page: r.page_number ?? 0,
  };
}
