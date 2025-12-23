import { TOTAL_PAGES } from "@/shared/constants/quran";
import { useEffect } from "react";
import { clampPage } from "../domain/page";
import { usePrefetchPageAyahs } from "./usePageData";

export function usePrefetchAdjacentPages(
  currentPage: number,
  radius: number = 2,
) {
  const prefetch = usePrefetchPageAyahs();

  useEffect(() => {
    const base = clampPage(currentPage, TOTAL_PAGES);

    const candidates: number[] = [];
    for (let d = 1; d <= radius; d++) {
      candidates.push(base + d, base - d);
    }

    for (const p of candidates) {
      if (p >= 1 && p <= TOTAL_PAGES) {
        void prefetch(p);
      }
    }
  }, [currentPage, radius, prefetch]);
}
