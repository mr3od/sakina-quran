import type { Composite, Searcher, SearchRow } from "../domain/search-contract";

/**
 * Runs structural first (fast), then text (may be slower),
 * merges and de-duplicates by (sura, ayah, kind).
 * 
 * Uses Promise.allSettled to tolerate individual searcher failures.
 */
export class CompositeSearcher implements Composite {
  constructor(
    private readonly structural: Searcher,
    private readonly text: Searcher,
  ) {}

  async search(query: string, limit = 50): Promise<SearchRow[]> {
    const results = await Promise.allSettled([
      this.structural.search(query, limit),
      this.text.search(query, limit),
    ]);

    const structuralRows = results[0].status === "fulfilled" ? results[0].value : [];
    const textRows = results[1].status === "fulfilled" ? results[1].value : [];

    const key = (r: SearchRow) => `${r.type}:${r.sura}:${r.ayah}`;

    const seen = new Set<string>();
    const merged: SearchRow[] = [];

    for (const r of [...structuralRows, ...textRows]) {
      const k = key(r);
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push(r);
      if (merged.length >= limit) break;
    }
    return merged;
  }
}
