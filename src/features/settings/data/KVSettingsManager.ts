/**
 * KVSettingsManager - Data Layer Implementation
 * Manages user settings persistence with versioning and migration
 */

import { getSystemLocale } from "@/shared/i18n";
import KVStore from "expo-sqlite/kv-store";
import { Appearance } from "react-native";
import {
  assertLanguage,
  assertTheme,
  type LanguageId,
  type SettingsManager,
  type ThemeId,
  type UserSettings,
} from "../domain/settings-contract";

const KEYS = {
  VERSION: "settings_version",
  THEME: "theme",
  LANGUAGE: "user_locale_override",
} as const;

const CURRENT_VERSION = 1;

export class KVSettingsManager implements SettingsManager {
  private getDefaultTheme(): ThemeId {
    const colorScheme = Appearance.getColorScheme();
    return colorScheme === "dark" ? "layl" : "fajr";
  }

  private getDefaultLanguage(): LanguageId {
    return getSystemLocale();
  }

  private async migrate(currentVersion: number): Promise<void> {
    if (currentVersion >= CURRENT_VERSION) {
      return;
    }
    await KVStore.setItem(KEYS.VERSION, String(CURRENT_VERSION));
  }

  async getAll(): Promise<UserSettings> {
    try {
      const versionStr = await KVStore.getItem(KEYS.VERSION);
      const version = versionStr ? parseInt(versionStr, 10) : 0;

      if (version < CURRENT_VERSION) {
        await this.migrate(version);
      }

      const themeStr = await KVStore.getItem(KEYS.THEME);
      const languageStr = await KVStore.getItem(KEYS.LANGUAGE);

      let theme: ThemeId;
      try {
        assertTheme(themeStr);
        theme = themeStr;
      } catch {
        theme = this.getDefaultTheme();
        await KVStore.setItem(KEYS.THEME, theme);
      }

      let language: LanguageId;
      try {
        assertLanguage(languageStr);
        language = languageStr;
      } catch {
        language = this.getDefaultLanguage();
        await KVStore.setItem(KEYS.LANGUAGE, language);
      }

      return { theme, language };
    } catch (error) {
      console.error("Failed to load settings:", error);
      return {
        theme: this.getDefaultTheme(),
        language: this.getDefaultLanguage(),
      };
    }
  }

  async getTheme(): Promise<ThemeId> {
    const settings = await this.getAll();
    return settings.theme;
  }

  async setTheme(theme: ThemeId): Promise<void> {
    assertTheme(theme);
    await KVStore.setItem(KEYS.THEME, theme);
  }

  async getLanguage(): Promise<LanguageId> {
    const settings = await this.getAll();
    return settings.language;
  }

  async setLanguage(language: LanguageId): Promise<void> {
    assertLanguage(language);
    await KVStore.setItem(KEYS.LANGUAGE, language);
  }
}
