import { i18n } from "@lingui/core";

const ALLOWED_COLS = {
  ar: "name_arabic",
  en: "name_simple",
} as const;

export type SurahNameColumn = "name_arabic" | "name_simple";

export function getSurahNameColumn(locale?: string): SurahNameColumn {
  const l = locale ?? i18n.locale;
  return l === "ar" ? ALLOWED_COLS.ar : ALLOWED_COLS.en;
}
