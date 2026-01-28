import { i18n, type Messages } from "@lingui/core";
import { getLocales } from "expo-localization";
import { I18nManager, Platform } from "react-native";

import { messages as ar } from "../../locales/ar/messages.po";
import { messages as en } from "../../locales/en/messages.po";

import {
  getSavedLocaleOverride,
  setSavedLocaleOverride,
} from "./locale-storage";

export const SUPPORTED_LOCALES = ["en", "ar"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

const catalogs: Record<AppLocale, Messages> = { en, ar };

const normalize = (raw?: string | null): AppLocale =>
  (raw || "en").split("-")[0].toLowerCase() === "ar" ? "ar" : "en";

export const getSystemLocale = (): AppLocale => {
  const l = getLocales()?.[0];
  return normalize(l?.languageTag ?? l?.languageCode);
};

export const isRtlLocale = (l: AppLocale) => l === "ar";

i18n.load(catalogs);

let activeLocale: AppLocale = getSystemLocale();
i18n.activate(activeLocale);

I18nManager.allowRTL(true);

export const getActiveLocale = () => activeLocale;

export function applyLocale(locale: AppLocale, opts?: { forceRTL?: boolean }) {
  activeLocale = locale;
  i18n.activate(locale);

  if (Platform.OS === "web") {
    document.documentElement.setAttribute(
      "dir",
      isRtlLocale(locale) ? "rtl" : "ltr",
    );
    document.documentElement.setAttribute("lang", locale);
  }

  if (opts?.forceRTL) {
    const shouldRTL = isRtlLocale(locale);
    if (I18nManager.isRTL !== shouldRTL) I18nManager.forceRTL(shouldRTL);
  }
}

export async function bootstrapLocale() {
  const saved = await getSavedLocaleOverride();

  if (saved === "en" || saved === "ar") {
    applyLocale(saved);
    return { mode: "override" as const, locale: saved };
  }

  const sys = getSystemLocale();
  applyLocale(sys);
  return { mode: "system" as const, locale: sys };
}

export async function setLocaleModeSystem() {
  await setSavedLocaleOverride(null);
  applyLocale(getSystemLocale());
}

export async function setLocaleOverride(locale: AppLocale) {
  await setSavedLocaleOverride(locale);
  applyLocale(locale);
}

export { i18n };
export default i18n;
