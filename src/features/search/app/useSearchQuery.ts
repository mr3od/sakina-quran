import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDatabase } from "@/hooks/useDatabase";
import { useLingui } from "@lingui/react/macro";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { CompositeSearcher } from "../data/CompositeSearcher";
import { StructuralSearcher } from "../data/searchers/StructuralSearcher";
import { TextSearcher } from "../data/searchers/TextSearcher";

export function useSearchQuery(query: string, limit = 50) {
  const db = useDatabase();
  const { i18n } = useLingui();
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  const searcher = useMemo(
    () =>
      new CompositeSearcher([
        new StructuralSearcher(db),
        new TextSearcher(db),
      ]),
    [db],
  );

  return useQuery({
    queryKey: ["search", debouncedQuery, limit, i18n.locale] as const,
    queryFn: () => searcher.search(debouncedQuery, limit),
    enabled: debouncedQuery.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
