import { useLingui } from "@lingui/react/macro";

/**
 * Returns the appropriate font family class based on the current locale.
 * - 'font-ui-ar' for Arabic
 * - 'font-ui-en' for English/Others
 */
export function useLocaleFont() {
  const { i18n } = useLingui();
  return i18n.locale === "ar" ? "font-ui-ar" : "font-ui-en";
}
