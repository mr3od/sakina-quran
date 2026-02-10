import KVStore from "expo-sqlite/kv-store";

const LOCALE_OVERRIDE_KEY = "user_locale_override";

export async function getSavedLocaleOverride(): Promise<string | null> {
  return await KVStore.getItem(LOCALE_OVERRIDE_KEY);
}

export async function setSavedLocaleOverride(
  locale: string | null,
): Promise<void> {
  if (locale) {
    await KVStore.setItem(LOCALE_OVERRIDE_KEY, locale);
  } else {
    await KVStore.removeItem(LOCALE_OVERRIDE_KEY);
  }
}
