import { useDatabase } from "@/hooks/useDatabase";
import { TOTAL_PAGES } from "@/shared/constants/quran";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { SQLiteDatabase } from "expo-sqlite";
import { PageReaderRepository } from "../data/PageReaderRepository";
import { clampPage } from "../domain/page";

const ayahsKey = (page: number) =>
  ["quran-reader", "page-ayahs", page] as const;

async function fetchPageAyahs(db: SQLiteDatabase, page: number) {
  const repo = new PageReaderRepository(db);
  return repo.getPageAyahs(page);
}

export function usePageAyahs(pageNumber: number) {
  const db = useDatabase();
  const page = clampPage(pageNumber, TOTAL_PAGES);

  return useQuery({
    queryKey: ayahsKey(page),
    queryFn: () => fetchPageAyahs(db, page),

    // Don't refetch forever, but also don't pin in memory forever.
    staleTime: Infinity,
    gcTime: 15 * 60 * 1000,
  });
}

export function usePrefetchPageAyahs() {
  const db = useDatabase();
  const qc = useQueryClient();

  return async (pageNumber: number) => {
    const page = clampPage(pageNumber, TOTAL_PAGES);
    await qc.prefetchQuery({
      queryKey: ayahsKey(page),
      queryFn: () => fetchPageAyahs(db, page),
      staleTime: Infinity,
      gcTime: 15 * 60 * 1000,
    });
  };
}
