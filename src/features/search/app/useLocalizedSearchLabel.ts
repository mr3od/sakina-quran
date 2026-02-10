import { useLingui } from "@lingui/react/macro";
import type { SearchRow } from "../domain/search-contract";

export function useLocalizedSearchLabel(item: SearchRow): string {
  const { t } = useLingui();
  const isAyahResult = item.type === "ayah";

  if (isAyahResult || item.type === "surahAyah") return item.simple;

  const num = item.simple;
  switch (item.type) {
    case "surah":
      return t`Surah ${num}`;
    case "juz":
      return t`Juz ${num}`;
    case "hizb":
      return t`Hizb ${num}`;
    case "page":
      return t`Page ${num}`;
    default:
      return item.simple;
  }
}
