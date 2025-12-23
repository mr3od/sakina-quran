/**
 * Application Layer - State Orchestration
 * Controller hook that manages bookmarks state using React Query
 */

import { useQuery } from "@tanstack/react-query";
import { KVBookmarkManager } from "../data/KVBookmarkManager";

/**
 * useBookmarksController - Fetches bookmarks using React Query
 * Returns React Query's built-in state (data, isLoading, error, etc.)
 */
export function useBookmarksController() {
  const manager = new KVBookmarkManager();

  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => manager.getAll(),
    staleTime: 60_000, // 1 minute
    gcTime: 600_000, // 10 minutes
    refetchOnMount: false,
  });
}
