/**
 * KVSettingsManager - Data Layer Implementation
 * Manages user settings persistence with versioning and migration
 */

import KVStore from "expo-sqlite/kv-store";
import { Appearance } from "react-native";
import {
  assertTheme,
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
    await KVStore.setItem(KEYS.VERSION, String(CURRENT_VERSION));
  }

  /**
   * Get all user settings (validated and migrated)
   * @returns Promise resolving to validated UserSettings
   */
  async getAll(): Promise<UserSettings> {
    try {
      // Check version and migrate if needed
      const versionStr = await KVStore.getItem(KEYS.VERSION);
      const version = versionStr ? parseInt(versionStr, 10) : 0;

      if (version < CURRENT_VERSION) {
        await this.migrate(version);
      }

      // Read individual keys
      const themeStr = await KVStore.getItem(KEYS.THEME);

      // Validate and apply defaults
      let theme: ThemeId;
      try {
        assertTheme(themeStr);
        theme = themeStr;
      } catch {
        theme = this.getDefaultTheme();
        // Persist default
        await KVStore.setItem(KEYS.THEME, theme);
      }

      return { theme };
    } catch (error) {
      console.error("Failed to load settings:", error);
      // Return safe defaults on error
      return {
        theme: this.getDefaultTheme(),
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

    // Persist to KV Store
    await KVStore.setItem(KEYS.THEME, theme);

    // Note: Do NOT call Uniwind.setTheme() here
    // Application layer handles UI updates
  }
}
