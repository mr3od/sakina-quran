const RE_SURA_AYAH = /^(\d+)\s*[:：]\s*(\d+)$/;
const RE_PURE_NUMERIC = /^\d+$/;
const HAS_DIGIT = /\d/;

export type ParsedQuery =
  | { kind: "empty" }
  | { kind: "surahAyah"; sura: number; ayah: number }
  | { kind: "numeric"; value: number }
  | { kind: "text"; value: string };

/**
 * Parses search query into structured type.
 * 
 * Classification rules:
 * - Empty string → empty
 * - "N:N" format → surahAyah
 * - Pure digits → numeric
 * - Contains digits → numeric (extracts first number, e.g., "juz 7" → 7)
 * - No valid digits → text
 * 
 * Note: "ayah 255 kursi" becomes numeric (255), not text.
 * This means structural search runs, text search skips.
 */
export function parseSearchQuery(raw: string): ParsedQuery {
  const q = raw.trim();
  
  if (!q) return { kind: "empty" };

  const pair = q.match(RE_SURA_AYAH);
  if (pair) {
    return {
      kind: "surahAyah",
      sura: Number(pair[1]),
      ayah: Number(pair[2]),
    };
  }

  if (RE_PURE_NUMERIC.test(q)) {
    return { kind: "numeric", value: Number(q) };
  }

  // Mixed text+digit: extract numeric value
  if (HAS_DIGIT.test(q)) {
    const extracted = q.replace(/[^\d]/g, "");
    const value = Number(extracted);
    if (Number.isFinite(value) && value > 0) {
      return { kind: "numeric", value };
    }
  }

  return { kind: "text", value: q };
}
