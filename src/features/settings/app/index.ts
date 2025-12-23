/**
 * Settings Feature - Public API
 * Export only what consumers need, hide implementation details
 */

// Hooks
export { useSettings } from "./useSettings";
export { useSetTheme } from "./useSettingsMutations";

// Types
export type { ThemeId, UserSettings } from "../domain/settings-contract";

// Theme Metadata
export { THEMES, THEMES_ARRAY } from "../domain/theme-metadata";
export type { ThemeMeta } from "../domain/theme-metadata";

// UI Components
export { ThemeSelector } from "../ui/ThemeSelector";
