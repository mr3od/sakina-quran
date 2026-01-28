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

/**
 * Format timestamp as relative time
 */
export function formatRelativeTime(date: Date, locale: string) {
  const now = Date.now();
  const diffMs = date.getTime() - now;

  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  const RTF = Intl?.RelativeTimeFormat;

  // iOS/Hermes: RelativeTimeFormat may be missing -> fallback
  if (!RTF) {
    const absDays = Math.abs(diffDays);
    if (absDays >= 1) return `${absDays}d`;

    const absHours = Math.abs(diffHours);
    if (absHours >= 1) return `${absHours}h`;

    const absMinutes = Math.abs(diffMinutes);
    if (absMinutes >= 1) return `${absMinutes}m`;

    return "now";
  }

  const rtf = new RTF(locale, { numeric: "auto" });
  if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, "day");
  if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, "hour");
  if (Math.abs(diffMinutes) >= 1) return rtf.format(diffMinutes, "minute");

  return rtf.format(diffSeconds, "second");
}
