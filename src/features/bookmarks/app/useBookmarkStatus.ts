/**
 * Application Layer - Bookmark Status Hook
 * Checks if a specific verse is bookmarked
 */

import { useQuery } from "@tanstack/react-query";
import { KVBookmarkManager } from "../data/KVBookmarkManager";

interface UseBookmarkStatusResult {
  isBookmarked: boolean;
  isLoading: boolean;
}

/**
 * useBookmarkStatus - Check if verse is bookmarked
 * @param sura - Surah number
 * @param ayah - Ayah number
 * @returns Object with isBookmarked and isLoading flags
 */
export function useBookmarkStatus(
  sura: number | undefined,
  ayah: number | undefined,
): UseBookmarkStatusResult {
  const manager = new KVBookmarkManager();

  const { data, isLoading } = useQuery({
    queryKey: ["bookmark-status", sura, ayah],
    queryFn: () => manager.has(sura!, ayah!),
    staleTime: 60_000, // 1 minute
    gcTime: 300_000, // 5 minutes
    enabled: !!sura && !!ayah,
  });

  return {
    isBookmarked: data ?? false,
    isLoading,
  };
}
