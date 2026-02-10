import type { SearchRow } from "@/features/search/domain/search-contract";
import { getSurahNameColumn } from "@/features/search/data/utils/getSurahNameColumn";
import { pageResolverSubquery } from "@/features/search/data/utils/sqlFragments";
import type { Database } from "sql.js";

export function textSearch(
  db: Database,
  query: string,
  limit: number,
  locale: string,
): SearchRow[] {
  if (!query) return [];

  const nameCol = getSurahNameColumn(locale);

  const stmt = db.prepare(`
    SELECT a.sura_number, a.ayah_number, a.simple_text, s.${nameCol} AS surah_name,
    ${pageResolverSubquery("a.sura_number", "a.ayah_number")} AS page_number
    FROM ayahs a
    JOIN surahs s ON s.id = a.sura_number
    WHERE a.simple_text LIKE ?
    LIMIT ?
  `);

  stmt.bind([`%${query}%`, limit]);

  const rows: SearchRow[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    rows.push({
      type: "ayah",
      sura: row.sura_number as number,
      ayah: row.ayah_number as number,
      surahName: row.surah_name as string,
      simple: row.simple_text as string,
      page: (row.page_number as number) || 0,
    });
  }
  stmt.free();

  return rows;
}
