/**
 * Settings Feature - Public API
 * Export only what consumers need, hide implementation details
 */

// Hooks
export { getInitialSettings, useSettings } from "./useSettings";
export { useSetLanguage, useSetTheme } from "./useSettingsMutations";

// Types
export type {
  LanguageId,
  ThemeId,
  UserSettings,
} from "../domain/settings-contract";

// Theme Metadata
export { THEMES, THEMES_ARRAY } from "../domain/theme-metadata";
export type { ThemeMeta } from "../domain/theme-metadata";

// UI Components
export { LanguageSelector } from "../ui/LanguageSelector";
export { ThemeSelector } from "../ui/ThemeSelector";
