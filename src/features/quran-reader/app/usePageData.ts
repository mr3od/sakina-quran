import { useDatabase } from "@/hooks/useDatabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageReaderRepository } from "../data/PageReaderRepository";

const pageDataKey = (page: number) =>
  ["quran-reader", "page-data", page] as const;

async function fetchPageData(db: any, page: number) {
  const repo = new PageReaderRepository(db);

  // Fetch Ayahs and Page Metadata (Juz/Hizb info) in parallel
  const [ayahs, meta] = await Promise.all([
    repo.getPageAyahs(page),
    repo.getPageMeta(page),
  ]);

  return { ayahs, meta };
}

export function usePageAyahs(pageNumber: number) {
  const db = useDatabase();

  return useQuery({
    queryKey: pageDataKey(pageNumber),
    queryFn: () => fetchPageData(db, pageNumber),
    staleTime: Infinity,
    gcTime: 15 * 60 * 1000,
  });
}

export function usePrefetchPageAyahs() {
  const db = useDatabase();
  const qc = useQueryClient();

  return async (pageNumber: number) => {
    await qc.prefetchQuery({
      queryKey: pageDataKey(pageNumber),
      queryFn: () => fetchPageData(db, pageNumber),
      staleTime: Infinity,
      gcTime: 15 * 60 * 1000,
    });
  };
}
