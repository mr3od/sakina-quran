/**
 * Settings Mutations - Optimistic Write-Through
 * Handles theme and font size updates with optimistic UI updates
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Uniwind } from "uniwind";
import { KVSettingsManager } from "../data/KVSettingsManager";
import type { ThemeId, UserSettings } from "../domain/settings-contract";

/**
 * Hook to update theme preference
 * Uses optimistic write-through (no refetch/invalidation)
 *
 * @returns Mutation hook for theme updates
 */
export function useSetTheme() {
  const queryClient = useQueryClient();
  const manager = new KVSettingsManager();

  return useMutation({
    mutationFn: (theme: ThemeId) => manager.setTheme(theme),

    onMutate: async (theme: ThemeId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ["settings"] });

      // Snapshot previous state
      const previous = queryClient.getQueryData<UserSettings>(["settings"]);

      // Optimistic update: update cache immediately
      queryClient.setQueryData<UserSettings>(["settings"], (old) => {
        if (!old) return { theme };
        return { ...old, theme };
      });

      // Apply theme to UI immediately
      Uniwind.setTheme(theme);

      // Return context for rollback
      return { previous };
    },

    onError: (error, _variables, context) => {
      console.error("Failed to set theme:", error);

      // Rollback cache
      if (context?.previous) {
        queryClient.setQueryData(["settings"], context.previous);

        // Revert UI theme
        Uniwind.setTheme(context.previous.theme);
      }
    },

    // No onSettled - optimistic write-through (no refetch/invalidation)
  });
}
