/**
 * Settings Mutations - Optimistic Write-Through
 * Handles theme and font size updates with optimistic UI updates
 */

import { applyLocale } from "@/shared/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startTransition } from "react";
import { Uniwind } from "uniwind";
import { KVSettingsManager } from "../data/KVSettingsManager";
import type {
  LanguageId,
  ThemeId,
  UserSettings,
} from "../domain/settings-contract";

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
        if (!old) return { theme, language: "en" };
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

/**
 * Hook to update language preference
 */
export function useSetLanguage() {
  const queryClient = useQueryClient();
  const manager = new KVSettingsManager();

  return useMutation({
    mutationFn: (language: LanguageId) => manager.setLanguage(language),

    onMutate: async (language: LanguageId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ["settings"] });

      // Snapshot previous state
      const previous = queryClient.getQueryData<UserSettings>(["settings"]);

      // Optimistic update
      queryClient.setQueryData<UserSettings>(["settings"], (old) => {
        if (!old) return { theme: "fajr", language };
        return { ...old, language };
      });

      // Apply locale to engine (wrapped in transition to keep UI responsive)
      startTransition(() => {
        applyLocale(language, { forceRtlMirroring: true });
      });

      return { previous };
    },

    onError: (error, _variables, context) => {
      console.error("Failed to set language:", error);

      const previous = context?.previous;
      if (previous) {
        queryClient.setQueryData(["settings"], previous);
        startTransition(() => {
          applyLocale(previous.language, { forceRtlMirroring: true });
        });
      }
    },
  });
}
