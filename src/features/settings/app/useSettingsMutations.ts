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

const SETTINGS_KEY = ["settings"] as const;

export function useSetTheme() {
  const qc = useQueryClient();
  const manager = new KVSettingsManager();

  return useMutation({
    mutationFn: (theme: ThemeId) => manager.setTheme(theme),

    onMutate: async (theme) => {
      await qc.cancelQueries({ queryKey: SETTINGS_KEY });
      const previous = qc.getQueryData<UserSettings>(SETTINGS_KEY);

      qc.setQueryData<UserSettings>(SETTINGS_KEY, (old) => ({
        ...(old ?? { language: "en" as LanguageId }),
        theme,
      }));

      Uniwind.setTheme(theme);
      return { previous };
    },

    onError: (_err, _theme, ctx) => {
      if (!ctx?.previous) return;
      qc.setQueryData(SETTINGS_KEY, ctx.previous);
      Uniwind.setTheme(ctx.previous.theme);
    },
  });
}

export function useSetLanguage() {
  const qc = useQueryClient();
  const manager = new KVSettingsManager();

  return useMutation({
    mutationFn: (language: LanguageId) => manager.setLanguage(language),

    onMutate: async (language) => {
      await qc.cancelQueries({ queryKey: SETTINGS_KEY });
      const previous = qc.getQueryData<UserSettings>(SETTINGS_KEY);

      qc.setQueryData<UserSettings>(SETTINGS_KEY, (old) => ({
        ...(old ?? { theme: "fajr" as ThemeId }),
        language,
      }));

      startTransition(() => applyLocale(language as any, { forceRTL: true }));
      return { previous };
    },

    onError: (_err, _language, ctx) => {
      if (!ctx?.previous) return;
      qc.setQueryData(SETTINGS_KEY, ctx.previous);
      startTransition(() =>
        applyLocale(ctx.previous?.language as any, { forceRTL: true }),
      );
    },
  });
}
