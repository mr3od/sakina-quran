import { useDatabase } from "@/hooks/useDatabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { SQLiteDatabase } from "expo-sqlite";
import { PageReaderRepository } from "../data/PageReaderRepository";

const ayahsKey = (page: number) =>
  ["quran-reader", "page-ayahs", page] as const;

async function fetchPageAyahs(db: SQLiteDatabase, page: number) {
  const repo = new PageReaderRepository(db);
  return repo.getPageAyahs(page);
}

export function usePageAyahs(pageNumber: number) {
  const db = useDatabase();

  return useQuery({
    queryKey: ayahsKey(pageNumber),
    queryFn: () => fetchPageAyahs(db, pageNumber),

    // Don't refetch forever, but also don't pin in memory forever.
    staleTime: Infinity,
    gcTime: 15 * 60 * 1000,
  });
}

export function usePrefetchPageAyahs() {
  const db = useDatabase();
  const qc = useQueryClient();

  return async (pageNumber: number) => {
    await qc.prefetchQuery({
      queryKey: ayahsKey(pageNumber),
      queryFn: () => fetchPageAyahs(db, pageNumber),
      staleTime: Infinity,
      gcTime: 15 * 60 * 1000,
    });
  };
}
