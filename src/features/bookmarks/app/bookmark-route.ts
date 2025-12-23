import { toPageRoute } from "@/features/quran-reader/app/quran-reader-route";
import type { Href } from "expo-router";
import type { Bookmark } from "../domain/bookmark-contract";

export function toBookmarkedAyahPath(bookmark: Bookmark): Href {
  return toPageRoute(bookmark.page, bookmark.sura, bookmark.ayah);
}
