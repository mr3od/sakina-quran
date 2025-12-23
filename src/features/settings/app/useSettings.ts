/**
 * useSettings - Settings Query Hook
 * Fetches user settings with React Query
 */

import { useQuery } from "@tanstack/react-query";
import { KVSettingsManager } from "../data/KVSettingsManager";
import type { UserSettings } from "../domain/settings-contract";

/**
 * Hook to fetch user settings
 * Uses React Query with infinite cache (settings are static until mutated)
 *
 * @returns React Query result with settings data
 */
export function useSettings() {
  const manager = new KVSettingsManager();

  return useQuery<UserSettings>({
    queryKey: ["settings"],
    queryFn: () => manager.getAll(),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}
