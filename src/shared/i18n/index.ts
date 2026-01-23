/**
 * Lingui i18n Engine for Expo Router
 * Uses expo-localization for device locale detection
 */

// Hermes (Expo SDK 52+) has native Intl support - no polyfills needed for modern runtimes

import { i18n, Messages } from "@lingui/core";
import { getLocales } from "expo-localization";
import { AppState, I18nManager, Platform } from "react-native";

// Import .po files directly - Metro transformer compiles on-the-fly
import { messages as arMessages } from "../../locales/ar/messages.po";
import { messages as enMessages } from "../../locales/en/messages.po";

import {
    getSavedLocaleOverride,
    setSavedLocaleOverride,
} from "./locale-storage";

export const SUPPORTED_LOCALES = ["en", "ar"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export type LocaleMode = "system" | "override";

const catalogs: Record<AppLocale, Messages> = {
  en: enMessages,
  ar: arMessages,
};

export function isRtlLocale(locale: AppLocale): boolean {
  return locale === "ar";
}

function normalizeLocale(raw?: string | null): AppLocale {
  const base = (raw || "en").split("-")[0].toLowerCase();
  return base === "ar" ? "ar" : "en";
}

export function getSystemLocale(): AppLocale {
  const locales = getLocales();
  const primary = locales?.[0];
  return normalizeLocale(primary?.languageTag ?? primary?.languageCode);
}

/**
 * Get full locale info from expo-localization
 */
export function getLocaleInfo() {
  const locale = getLocales()[0];
  return {
    languageCode: locale?.languageCode ?? "en",
    languageTag: locale?.languageTag ?? "en",
    textDirection: locale?.textDirection ?? "ltr",
    regionCode: locale?.regionCode,
    currencyCode: locale?.currencyCode,
    currencySymbol: locale?.currencySymbol,
    measurementSystem: locale?.measurementSystem,
    decimalSeparator: locale?.decimalSeparator ?? ".",
    digitGroupingSeparator: locale?.digitGroupingSeparator ?? ",",
  };
}

i18n.load(catalogs);

let activeLocale: AppLocale = getSystemLocale();
i18n.activate(activeLocale);

// Enable RTL support (configured in app.json with supportsRTL: true)
I18nManager.allowRTL(true);

export function getActiveLocale(): AppLocale {
  return activeLocale;
}

export function applyLocale(
  next: AppLocale,
  opts?: { forceRtlMirroring?: boolean },
): void {
  activeLocale = next;
  i18n.activate(next);

  if (opts?.forceRtlMirroring && Platform.OS !== "web") {
    const shouldBeRtl = isRtlLocale(next);
    if (I18nManager.isRTL !== shouldBeRtl) {
      I18nManager.forceRTL(shouldBeRtl);
      // Note: requires app restart for full effect
    }
  }
}

let initializationPromise: Promise<{
  mode: LocaleMode;
  locale: AppLocale;
}> | null = null;

export async function bootstrapLocale(): Promise<{
  mode: LocaleMode;
  locale: AppLocale;
}> {
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    const saved = await getSavedLocaleOverride();

    if (saved === "en" || saved === "ar") {
      const locale = saved as AppLocale;
      applyLocale(locale);
      return { mode: "override", locale };
    }

    const sys = getSystemLocale();
    applyLocale(sys);
    return { mode: "system", locale: sys };
  })();

  return initializationPromise;
}

export async function setLocaleModeSystem(): Promise<void> {
  await setSavedLocaleOverride(null);
  applyLocale(getSystemLocale());
}

export async function setLocaleOverride(locale: AppLocale): Promise<void> {
  await setSavedLocaleOverride(locale);
  applyLocale(locale);
}

/**
 * Setup listener for Android language changes
 * Call in root layout useEffect
 */
export function setupAndroidLocaleListener(
  onLocaleChange?: (locale: AppLocale) => void,
) {
  if (Platform.OS !== "android") return () => {};

  const subscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      const newLocale = getSystemLocale();
      if (newLocale !== activeLocale) {
        applyLocale(newLocale);
        onLocaleChange?.(newLocale);
      }
    }
  });

  return () => subscription.remove();
}

export { i18n };
export default i18n;
