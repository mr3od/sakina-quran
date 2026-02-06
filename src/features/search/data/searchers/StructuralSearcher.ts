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

    try {
      const res = await fetch(
        `/api/search?type=structural&q=${encodeURIComponent(q)}`,
      );
      if (!res.ok) return [];
      const data = await res.json();
      return data as SearchRow[];
    } catch (e) {
      console.error("Structural search failed", e);
      return [];
    }
  }
}
