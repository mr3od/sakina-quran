import { toPageRoute } from "@/features/quran-reader/app/quran-reader-route";
import type { Href } from "expo-router";
import type { SearchRow } from "../domain/search-contract";

export function toSurahAyahPath(row: SearchRow): Href {
  return toPageRoute(row.page, row.sura, row.ayah);
}
