/**
 * Western Arabic -> Eastern Arabic-Indic numerals
 */
export function toArabicIndic(num: number): string {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .split("")
    .map((d) => map[parseInt(d, 10)])
    .join("");
}

import { getActiveLocale } from "../i18n";

/**
 * Format timestamp as relative time
 */
export function formatRelativeTime(
  timestamp: number,
  locale: string = getActiveLocale(),
): string {
  const now = Date.now();
  const diffInMs = timestamp - now; // Negative for past
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Fallback for very old dates or future-proofing
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffInDays) > 0) return rtf.format(diffInDays, "day");
  if (Math.abs(diffInHours) > 0) return rtf.format(diffInHours, "hour");
  if (Math.abs(diffInMinutes) > 0) return rtf.format(diffInMinutes, "minute");
  if (Math.abs(diffInSeconds) < -10) return rtf.format(diffInSeconds, "second");

  return locale === "ar" ? "الآن" : "Just now";
}
