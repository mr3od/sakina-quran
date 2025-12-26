/**
 * Formats a number into the 3-digit ligature code required by the fonts.
 * e.g. 1 -> "001", 14 -> "014", 114 -> "114"
 */
function pad3(num: number): string {
  return num.toString().padStart(3, "0");
}

/**
 * Generates the ligature string for the Surah Name font (SurahNames_V4).
 * Output: "s001", "s114", etc.
 */
export function getSurahNameGlyph(surahNumber: number): string {
  return `s${pad3(surahNumber)}`;
}

/**
 * Generates the ligature string for the Surah Name font (SurahNames_V4) with surah-icon.
 * Output: "surah-icon s001", "surah-icon s114", etc.
 */
export function getSurahNameHeader(surahNumber: number): string {
  return `s${pad3(surahNumber)}` + " surah-icon";
}

/**
 * Generates the ligature string for the Juz Name font (JuzNames_V2).
 * Output: "j001", "j030", etc.
 */
export function getJuzNameGlyph(juzNumber: number): string {
  return `j${pad3(juzNumber)}`;
}

/**
 * Generates the ligature string for the Juz Badge/Number font (JuzNames_V2).
 * Output: "juz001", "juz030", etc.
 */
export function getJuzBadgeGlyph(juzNumber: number): string {
  return `juz${pad3(juzNumber)}`;
}
