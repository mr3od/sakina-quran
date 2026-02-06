import { TOTAL_PAGES } from "../constants/quran";

/**
 * Validates and parses a page number string.
 * Clamps the result between 1 and TOTAL_PAGES.
 * Returns the fallback if the input is not a number.
 */
export const parsePageNumber = (
  value: string | undefined | null,
  fallback: number = 1,
): number => {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return fallback;

  return Math.max(1, Math.min(TOTAL_PAGES, parsed));
};
