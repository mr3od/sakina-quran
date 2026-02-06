/**
 * KVSettingsManager - Data Layer Implementation
 * Manages user settings persistence with versioning and migration
 */

import { getSystemLocale } from "@/shared/i18n";
import KVStore from "expo-sqlite/kv-store";
import { Appearance, Platform } from "react-native";
import {
    assertLanguage,
    assertTheme,
    type LanguageId,
    type SettingsManager,
    type ThemeId,
    type UserSettings,
} from "../domain/settings-contract";

/**
 * KV Store keys for settings persistence
 */
const KEYS = {
  VERSION: "settings_version",
  THEME: "theme",
  LANGUAGE: "user_locale_override", // Using the same key as i18n module for consistency
} as const;

/**
 * Current settings schema version
 */
const CURRENT_VERSION = 1;

/**
 * KV-based settings manager implementation
 * Implements SettingsManager interface with validation and migration
 */
export class KVSettingsManager implements SettingsManager {
  /**
   * Get default theme based on system color scheme
   * @returns ThemeId based on system preference (fallback: "fajr")
   */
  private getDefaultTheme(): ThemeId {
    const colorScheme = Appearance.getColorScheme();
    return colorScheme === "dark" ? "layl" : "fajr";
  }

  /**
   * Get default language based on system
   */
  private getDefaultLanguage(): LanguageId {
    return getSystemLocale();
  }

  /**
   * Migrate settings if version is outdated
   * @param currentVersion - Current settings version from KV Store
   */
  private async migrate(currentVersion: number): Promise<void> {
    if (currentVersion >= CURRENT_VERSION) {
      return; // No migration needed
    }

    // Migration logic for future versions
    // Currently v1 is the first version, so no migration needed

    // Update version after migration
    await this.setItem(KEYS.VERSION, String(CURRENT_VERSION));
  }

  private async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return await KVStore.getItem(key);
  }

  private async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    await KVStore.setItem(key, value);
  }

  /**
   * Get all user settings (validated and migrated)
   * @returns Promise resolving to validated UserSettings
   */
  async getAll(): Promise<UserSettings> {
    try {
      // Check version and migrate if needed
      const versionStr = await this.getItem(KEYS.VERSION);
      const version = versionStr ? parseInt(versionStr, 10) : 0;

      if (version < CURRENT_VERSION) {
        await this.migrate(version);
      }

      // Read individual keys
      const themeStr = await this.getItem(KEYS.THEME);
      const languageStr = await this.getItem(KEYS.LANGUAGE);

      // Validate and apply defaults
      let theme: ThemeId;
      try {
        assertTheme(themeStr);
        theme = themeStr;
      } catch {
        theme = this.getDefaultTheme();
        // Persist default
        await this.setItem(KEYS.THEME, theme);
      }

      let language: LanguageId;
      try {
        assertLanguage(languageStr);
        language = languageStr;
      } catch {
        language = this.getDefaultLanguage();
        // Persist default
        await this.setItem(KEYS.LANGUAGE, language);
      }

      return { theme, language };
    } catch (error) {
      console.error("Failed to load settings:", error);
      // Return safe defaults on error
      return {
        theme: this.getDefaultTheme(),
        language: this.getDefaultLanguage(),
      };
    }
  }

  /**
   * Get current theme preference
   * @returns Promise resolving to ThemeId
   */
  async getTheme(): Promise<ThemeId> {
    const settings = await this.getAll();
    return settings.theme;
  }

  /**
   * Set theme preference (validates ThemeId)
   * @param theme - Must be valid ThemeId
   * @throws Error if theme is invalid
   */
  async setTheme(theme: ThemeId): Promise<void> {
    // Validate at data boundary
    assertTheme(theme);

    // Persist
    await this.setItem(KEYS.THEME, theme);
  }

  /**
   * Get current language preference
   */
  async getLanguage(): Promise<LanguageId> {
    const settings = await this.getAll();
    return settings.language;
  }

  /**
   * Set language preference
   */
  async setLanguage(language: LanguageId): Promise<void> {
    assertLanguage(language);
    await this.setItem(KEYS.LANGUAGE, language);
  }
}
