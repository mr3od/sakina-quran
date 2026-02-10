import { QuranRepository } from "@/entities/quran/api/QuranRepository";
import type { Ayah } from "@/types/quran.types";
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
    queryFn: async (): Promise<Ayah | null> => {
      if (!suraNumber || !ayahNumber) return null;
      // constructor accepts any to satisfy shared hooks like useAyah across platforms
      const repo = new QuranRepository(db);
      return repo.getAyah(suraNumber, ayahNumber);
    },
    enabled: !!suraNumber && !!ayahNumber,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
