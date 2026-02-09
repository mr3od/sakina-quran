import type { Composite, Searcher, SearchRow } from "../domain/search-contract";

/**
 * Runs structural first (fast), then text (may be slower),
 * merges and de-duplicates by (sura, ayah, kind).
 * 
 * Uses Promise.allSettled to tolerate individual searcher failures.
 */
export class CompositeSearcher implements Composite {
  constructor(private readonly searchers: Searcher[]) {}

  async search(query: string, limit = 50): Promise<SearchRow[]> {
    const results = await Promise.allSettled(
      this.searchers.map((s) => s.search(query, limit)),
    );

    const allRows = results.flatMap((r) =>
      r.status === "fulfilled" ? r.value : [],
    );

    const key = (r: SearchRow) => `${r.type}:${r.sura}:${r.ayah}`;

    const seen = new Set<string>();
    const merged: SearchRow[] = [];

    for (const r of allRows) {
      const k = key(r);
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push(r);
      if (merged.length >= limit) break;
    }
    return merged;
  }
}
