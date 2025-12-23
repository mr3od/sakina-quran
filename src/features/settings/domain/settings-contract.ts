/**
 * Settings Domain Layer - Type-Safe Contracts
 * Pure business logic with no framework dependencies
 */

/**
 * Closed union of valid theme identifiers
 * Invariant: theme ∈ ThemeId
 */
export type ThemeId = "fajr" | "layl" | "asr" | "tahajjud" | "masjid";

/**
 * User settings data structure
 * Invariants:
 * - theme ∈ ThemeId
 * - 20 ≤ fontSize ≤ 50
 */
export interface UserSettings {
  theme: ThemeId;
}

/**
 * Settings manager interface (Dependency Inversion Principle)
 * Infrastructure layer implements this contract
 */
export interface SettingsManager {
  /**
   * Get all user settings (validated and migrated)
   * @returns Promise resolving to validated UserSettings
   */
  getAll(): Promise<UserSettings>;

  /**
   * Get current theme preference
   * @returns Promise resolving to ThemeId
   */
  getTheme(): Promise<ThemeId>;

  /**
   * Set theme preference (validates ThemeId)
   * @param theme - Must be valid ThemeId
   * @throws Error if theme is invalid
   */
  setTheme(theme: ThemeId): Promise<void>;
}

/**
 * Type guard for ThemeId
 * @param value - Unknown value to check
 * @returns true if value is valid ThemeId
 */
export function isThemeId(value: unknown): value is ThemeId {
  return (
    typeof value === "string" &&
    (value === "fajr" ||
      value === "layl" ||
      value === "asr" ||
      value === "tahajjud" ||
      value === "masjid")
  );
}

/**
 * Assertion helper for ThemeId validation
 * @param value - Unknown value to validate
 * @throws Error if value is not valid ThemeId
 */
export function assertTheme(value: unknown): asserts value is ThemeId {
  if (!isThemeId(value)) {
    throw new Error(
      `Invalid theme: ${value}. Must be one of: fajr, layl, asr, tahajjud, masjid`,
    );
  }
}
