import { QuranRepository } from "@/entities/quran/api/QuranRepository";
import { useQuery } from "@tanstack/react-query";
import { useDatabase } from "./useDatabase";

/**
 * Hook to fetch the list of all 30 Juz with their starting Surahs
 * Uses React Query with infinite cache for static Quran data
 */
export function useJuzList() {
  const db = useDatabase();

  return useQuery({
    queryKey: ["juz-list"],
    queryFn: async () => {
      const repo = new QuranRepository(db);
      return repo.getJuzList();
    },
    // Static data configuration - NEVER refetch
    staleTime: Infinity, // Data never goes stale
    gcTime: Infinity, // Keep in cache forever
    refetchOnMount: false, // Don't refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnReconnect: false, // Don't refetch on reconnect
  });
}
