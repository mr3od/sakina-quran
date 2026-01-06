import { ProgressRepository } from "@/entities/reading-progress/api/ProgressRepository";
import { useEffect, useState } from "react";
import { useSurahs } from "./useSurahs";

export function useLastReadPosition() {
  const [lastRead, setLastRead] = useState<{ page_number: number } | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const { data: surahs } = useSurahs();

  useEffect(() => {
    const repo = new ProgressRepository();
    repo
      .getLastReadPosition()
      .then(setLastRead)
      .finally(() => setIsLoading(false));
  }, []);

  // Find surah name for the page
  const surahName =
    lastRead && surahs
      ? surahs.find((s) => {
          const [start, end] = s.pages_range.split("-").map(Number);
          return lastRead.page_number >= start && lastRead.page_number <= end;
        })?.name_arabic || "القرآن الكريم"
      : null;

  return { lastRead, surahName, isLoading };
}
