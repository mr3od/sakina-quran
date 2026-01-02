import type { SearchRow, Searcher } from "../../domain/search-contract";

/**
 * Structural Searcher - Web Implementation
 *
 * Logic to handle numeric searches like "2:255", "surah 1", etc.
 * Uses the Search API for specific Ayah lookups and localized logic for others.
 */
export class StructuralSearcher implements Searcher {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(_db: any) {}

  async search(query: string): Promise<SearchRow[]> {
    const q = query.trim();
    if (!q) return [];

    // 1. Handle "Sura:Ayah" e.g., "7:7"
    const pairMatch = q.match(/^(\d+)\s*[:：]\s*(\d+)$/);
    if (pairMatch) {
      const sura = parseInt(pairMatch[1], 10);
      const ayah = parseInt(pairMatch[2], 10);

      try {
        const res = await fetch(`/api/search?sura=${sura}&ayah=${ayah}`);
        if (!res.ok) return [];
        const data = await res.json();

        // Use the format expected by SearchRow
        if (data.length > 0) {
          const row = data[0];
          return [
            {
              type: "surahAyah",
              sura: row.sura_number,
              ayah: row.ayah_number,
              surahName: "Surah " + row.sura_number, // Full name lookup would need surahs.json
              simple: `${row.sura_number}:${row.ayah_number}`,
              page: 1, // Simplified for now, real page lookup inside the API or static segments
            },
          ];
        }
      } catch (e) {
        console.error("Structural search failed", e);
      }
    }

    // TODO: Implement other structural lookups (Juz, Hizb, Page) for Web
    // This is part of the "Composite Search Parity" goal.
    return [];
  }
}
