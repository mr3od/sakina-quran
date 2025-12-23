import { TOTAL_PAGES } from "@/shared/constants/quran";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { clampPage, parsePageParam } from "../domain/page";
import { toPageRoute } from "./quran-reader-route";

type HistoryMode = "replace" | "push";

export function useReaderController() {
  const router = useRouter();
  const { number } = useLocalSearchParams<{ number?: string }>();

  const routePage = parsePageParam(number, TOTAL_PAGES);
  const [currentPage, setCurrentPage] = useState<number>(routePage);

  // If the URL changes (deeplink/back/forward), reflect it.
  useEffect(() => {
    setCurrentPage(routePage);
  }, [routePage]);

  function commitPage(nextPage: number, history: HistoryMode = "replace") {
    const clamped = clampPage(nextPage, TOTAL_PAGES);

    // Guard: skip if already on this page (prevents URL spam)
    if (clamped === currentPage && clamped === routePage) return;

    setCurrentPage(clamped);

    // Skip URL update if already at this route
    if (clamped === routePage) return;

    const href = toPageRoute(clamped);
    if (history === "push") router.push(href);
    else router.replace(href);
  }

  function goToNext() {
    commitPage(currentPage + 1);
  }

  function goToPrevious() {
    commitPage(currentPage - 1);
  }

  return {
    totalPages: TOTAL_PAGES,
    currentPage,

    // Call this ONLY when page is "settled" (PagerView onPageSelected / momentum end).
    commitPage,

    // Explicit actions can use push if you want (optional).
    commitPagePush: (nextPage: number) => commitPage(nextPage, "push"),

    goToNext,
    goToPrevious,
  };
}
