import { QuranRepository } from "@/entities/quran/api/QuranRepository";
import { useQuery } from "@tanstack/react-query";
import { useDatabase } from "./useDatabase";

/**
 * Hook to fetch Ayahs for a specific Surah
 * Uses React Query with infinite cache for static Quran data
 *
 * @param suraNumber - The Surah number to fetch Ayahs for
 */
export function useAyahs(suraNumber: number | undefined) {
  const db = useDatabase();

  return useQuery({
    queryKey: ["ayahs", suraNumber],
    queryFn: async () => {
      if (!suraNumber) throw new Error("Surah number required");
      const repo = new QuranRepository(db);
      return repo.getAyahs(suraNumber);
    },
    enabled: !!suraNumber, // Only run when param exists
    // Static data configuration - NEVER refetch
    staleTime: Infinity, // Data never goes stale
    gcTime: Infinity, // Keep in cache forever
    refetchOnMount: false, // Don't refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnReconnect: false, // Don't refetch on reconnect
  });
}
