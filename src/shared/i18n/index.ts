import { i18n, type Messages } from "@lingui/core";
import * as Expo from "expo";
import { DevSettings, I18nManager, Platform } from "react-native";
import { getLocales } from "react-native-localize";

import { messages as ar } from "../../locales/ar/messages.po";
import { messages as en } from "../../locales/en/messages.po";
import {
  getSavedLocaleOverride,
  setSavedLocaleOverride,
} from "./locale-storage";

// ─── Supported locales ───────────────────────────────────────
export const SUPPORTED_LOCALES = ["en", "ar"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

const catalogs: Record<AppLocale, Messages> = { en, ar };

// ─── Helpers ─────────────────────────────────────────────────
const normalize = (raw?: string | null): AppLocale =>
  (raw || "en").split("-")[0].toLowerCase() === "ar" ? "ar" : "en";

export const getSystemLocale = (): AppLocale => {
  const l = getLocales()?.[0];
  return normalize(l?.languageTag ?? l?.languageCode);
};

export const isRtlLocale = (l: AppLocale) => l === "ar";

// ─── Boot ────────────────────────────────────────────────────
i18n.load(catalogs);

let activeLocale: AppLocale = getSystemLocale();
i18n.activate(activeLocale);

export const getActiveLocale = () => activeLocale;

// ─── Core ────────────────────────────────────────────────────

/**
 * Activate a locale and optionally flip the native RTL flag.
 *
 * • On **web** we patch `<html dir/lang>` and return.
 * • On **native**, when `opts.forceRTL` is set and the current
 *   `I18nManager.isRTL` disagrees with the locale, we call
 *   `forceRTL` then reload — the value only takes effect after
 *   the restart.
 */
export function applyLocale(locale: AppLocale, opts?: { forceRTL?: boolean }) {
  activeLocale = locale;
  i18n.activate(locale);

  // ── Web ──────────────────────────────────────────────────
  if (Platform.OS === "web") {
    const dir = isRtlLocale(locale) ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", locale);
    return;
  }

  // ── Native — RTL toggle + reload ─────────────────────────
  if (!opts?.forceRTL) return;

  const shouldRTL = isRtlLocale(locale);
  if (I18nManager.isRTL === shouldRTL) return; // already correct

  I18nManager.allowRTL(shouldRTL);
  I18nManager.forceRTL(shouldRTL);

  // forceRTL is async-native; a reload is required for it to
  // take effect.  After restart the bootstrap path will call
  // applyLocale WITHOUT forceRTL and pick up the persisted
  // I18nManager state.
  if (__DEV__) {
    DevSettings.reload("Language changed");
  } else {
    Expo.reloadAppAsync("Language changed");
  }
}

// ─── Bootstrap & public API ──────────────────────────────────

/** Read persisted override (or fall back to system) and activate. */
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

/** Clear the override and follow the device locale. */
export async function setLocaleModeSystem() {
  await setSavedLocaleOverride(null);
  applyLocale(getSystemLocale());
}

/** Persist an explicit locale override (triggers RTL flip + reload). */
export async function setLocaleOverride(locale: AppLocale) {
  await setSavedLocaleOverride(locale);
  applyLocale(locale, { forceRTL: true });
}

export { i18n };
export default i18n;
