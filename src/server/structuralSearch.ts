import { MAX_HIZB, MAX_JUZ, MAX_SURAH } from "@/shared/constants/quran";
import type { SearchRow } from "@/features/search/domain/search-contract";
import { parseSearchQuery } from "@/features/search/domain/query-parser";
import { getSurahNameColumn } from "@/features/search/data/utils/getSurahNameColumn";
import { pageResolverSubquery } from "@/features/search/data/utils/sqlFragments";
import type { Database } from "sql.js";

export function structuralSearch(
  db: Database,
  query: string,
  locale: string,
): SearchRow[] {
  const parsed = parseSearchQuery(query);
  if (parsed.kind === "empty" || parsed.kind === "text") return [];

  const nameCol = getSurahNameColumn(locale);
  const items: SearchRow[] = [];

  // Case A: "N:N" -> Surah:Ayah
  if (parsed.kind === "surahAyah") {
    const { sura, ayah } = parsed;

    // Bind order: sura, sura, ayah, sura, sura, ayah (for page subquery), sura (for WHERE)
    const stmt = db.prepare(`
      SELECT s.${nameCol} AS surah_name,
            ${pageResolverSubquery("?", "?")} AS page_number
      FROM surahs s
      WHERE s.id = ?
    `);
    stmt.bind([sura, sura, ayah, sura, sura, ayah, sura]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      items.push({
        type: "surahAyah",
        sura,
        ayah,
        surahName: row.surah_name as string,
        simple: `${sura}:${ayah}`,
        page: (row.page_number as number) ?? 0,
      });
    }
    stmt.free();
    return items;
  }

  // Case B: Numeric keyword searches (pure or extracted from mixed)
  const num = parsed.value;

  // Surah
  if (num >= 1 && num <= MAX_SURAH) {
    const stmt = db.prepare(`
      SELECT MIN(ps.page_number) AS page_number, s.${nameCol} AS surah_name
      FROM page_segments ps
      JOIN surahs s ON s.id = ps.sura_start
      WHERE ps.sura_start = ?
    `);
    stmt.bind([num]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      if (row.page_number) {
        items.push({
          type: "surah",
          sura: num,
          ayah: 1,
          surahName: row.surah_name as string,
          simple: String(num),
          page: row.page_number as number,
        });
      }
    }
    stmt.free();
  }

  // Juz
  if (num >= 1 && num <= MAX_JUZ) {
    const stmt = db.prepare(`
      SELECT ps.page_number, ps.sura_start, ps.ayah_start, s.${nameCol} AS surah_name
      FROM page_segments ps
      JOIN surahs s ON s.id = ps.sura_start
      WHERE ps.juz_number = ?
      ORDER BY ps.page_number ASC
      LIMIT 1
    `);
    stmt.bind([num]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      if (row.page_number) {
        items.push({
          type: "juz",
          sura: row.sura_start as number,
          ayah: row.ayah_start as number,
          surahName: row.surah_name as string,
          simple: String(num),
          page: row.page_number as number,
        });
      }
    }
    stmt.free();
  }

  // Hizb
  if (num >= 1 && num <= MAX_HIZB) {
    const stmt = db.prepare(`
      SELECT ps.page_number, ps.sura_start, ps.ayah_start, s.${nameCol} AS surah_name
      FROM page_segments ps
      JOIN surahs s ON s.id = ps.sura_start
      WHERE ps.hizb_number = ?
      ORDER BY ps.page_number ASC
      LIMIT 1
    `);
    stmt.bind([num]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      if (row.page_number) {
        items.push({
          type: "hizb",
          sura: row.sura_start as number,
          ayah: row.ayah_start as number,
          surahName: row.surah_name as string,
          simple: String(num),
          page: row.page_number as number,
        });
      }
    }
    stmt.free();
  }

  // Page
  const stmtPage = db.prepare(`
    SELECT ps.page_number, ps.sura_start, ps.ayah_start, s.${nameCol} AS surah_name
    FROM page_segments ps
    JOIN surahs s ON s.id = ps.sura_start
    WHERE ps.page_number = ?
    LIMIT 1
  `);
  stmtPage.bind([num]);
  if (stmtPage.step()) {
    const row = stmtPage.getAsObject();
    if (row.page_number) {
      items.push({
        type: "page",
        sura: row.sura_start as number,
        ayah: row.ayah_start as number,
        surahName: row.surah_name as string,
        simple: String(num),
        page: row.page_number as number,
      });
    }
  }
  stmtPage.free();

  return items;
}
