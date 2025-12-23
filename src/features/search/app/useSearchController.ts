import { useDatabase } from "@/hooks/useDatabase";
import { useEffect, useState } from "react";
import { CompositeSearcher } from "../data/CompositeSearcher";
import { StructuralSearcher } from "../data/searchers/StructuralSearcher";
import { TextSearcher } from "../data/searchers/TextSearcher";
import type { SearchState } from "../domain/search-contract";

export function useSearchController(query: string): SearchState {
  const db = useDatabase();
  const [state, setState] = useState<SearchState>({ kind: "entry" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const q = (query || "").trim();
      if (!q) {
        setState({ kind: "entry" });
        return;
      }

      setState({ kind: "loading" });

      try {
        // Construct per-run to avoid stale db refs without useMemo.
        const composite = new CompositeSearcher(
          new StructuralSearcher(db),
          new TextSearcher(db),
        );
        const items = await composite.search(q, 50);
        if (!cancelled)
          setState(
            items.length ? { kind: "results", items } : { kind: "empty" },
          );
      } catch (e) {
        if (!cancelled) {
          setState({
            kind: "error",
            message: e instanceof Error ? e.message : "Search failed",
          });
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [db, query]);

  return state;
}
