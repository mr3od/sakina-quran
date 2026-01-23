import KVStore from "expo-sqlite/kv-store";
import { Platform } from "react-native";

const LOCALE_OVERRIDE_KEY = "user_locale_override";

export async function getSavedLocaleOverride(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(LOCALE_OVERRIDE_KEY);
  }
  return await KVStore.getItem(LOCALE_OVERRIDE_KEY);
}

export async function setSavedLocaleOverride(
  locale: string | null,
): Promise<void> {
  if (Platform.OS === "web") {
    if (locale) {
      localStorage.setItem(LOCALE_OVERRIDE_KEY, locale);
    } else {
      localStorage.removeItem(LOCALE_OVERRIDE_KEY);
    }
    return;
  }

  if (locale) {
    await KVStore.setItem(LOCALE_OVERRIDE_KEY, locale);
  } else {
    await KVStore.removeItem(LOCALE_OVERRIDE_KEY);
  }
}
