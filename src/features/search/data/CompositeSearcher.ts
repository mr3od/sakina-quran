import type { Composite, Searcher, SearchRow } from "../domain/search-contract";

/**
 * Runs structural first (fast), then text (may be slower),
 * merges and de-duplicates by (sura, ayah, kind).
 */
export class CompositeSearcher implements Composite {
  constructor(
    private readonly structural: Searcher,
    private readonly text: Searcher,
  ) {}

  async search(query: string, limit = 50): Promise<SearchRow[]> {
    const [structuralRows, textRows] = await Promise.all([
      this.structural.search(query, limit),
      this.text.search(query, limit),
    ]);

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
