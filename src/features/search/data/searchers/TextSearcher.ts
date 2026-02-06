import type { SearchRow, Searcher } from "../../domain/search-contract";

export class TextSearcher implements Searcher {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(_db: any) {}

  async search(query: string, limit = 50): Promise<SearchRow[]> {
    if (!query || !query.trim()) return [];

    const params = new URLSearchParams({
      q: query.trim(),
      limit: limit.toString(),
    });

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) {
        console.error("Search API failed", res.status);
        return [];
      }
      const data = await res.json();
      return data as SearchRow[];
    } catch (e) {
      console.error("Search API error", e);
      return [];
    }
  }
}
