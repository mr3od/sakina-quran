import { QuranRepository } from "@/entities/quran/api/QuranRepository";
import { useQuery } from "@tanstack/react-query";
import { useDatabase } from "./useDatabase";

/**
 * Hook to fetch a single Ayah
 * Uses React Query with infinite cache for static Quran data
 *
 * @param suraNumber - The Surah number
 * @param ayahNumber - The Ayah number
 */
export function useAyah(
  suraNumber: number | undefined,
  ayahNumber: number | undefined,
) {
  const db = useDatabase();

  return useQuery({
    queryKey: ["ayah", suraNumber, ayahNumber],
    queryFn: async () => {
      if (!suraNumber || !ayahNumber) {
        throw new Error("Surah and Ayah numbers required");
      }
      const repo = new QuranRepository(db);
      return repo.getAyah(suraNumber, ayahNumber);
    },
    enabled: !!suraNumber && !!ayahNumber,
    // Static data configuration - NEVER refetch
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
