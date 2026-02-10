import type { SearchState } from "../domain/search-contract";
import { useSearchQuery } from "./useSearchQuery";

export function useSearchController(query: string): SearchState {
  const { data, isFetching, isError, error } = useSearchQuery(query);

  const q = query.trim();
  if (!q) return { kind: "entry" };
  if (isError) return { kind: "error", message: error?.message || "Search failed" };
  if ((!data || data.length === 0) && isFetching) return { kind: "loading" };
  if (!data || data.length === 0) return { kind: "empty" };
  return { kind: "results", items: data };
}
