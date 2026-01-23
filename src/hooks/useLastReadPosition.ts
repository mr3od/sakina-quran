import { ProgressRepository } from "@/entities/reading-progress/api/ProgressRepository";
import { useLingui } from "@lingui/react/macro";
import { useEffect, useState } from "react";
import { useSurahs } from "./useSurahs";

export function useLastReadPosition() {
  const { i18n, t } = useLingui();
  const isAr = i18n.locale === "ar";

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
  const foundSurah = lastRead && surahs
      ? surahs.find((s) => {
          const [start, end] = s.pages_range.split("-").map(Number);
          return lastRead.page_number >= start && lastRead.page_number <= end;
        })
      : null;

  const surahName = foundSurah
    ? (isAr ? foundSurah.name_arabic : foundSurah.name_simple)
    : t`The Noble Quran`;

  return { lastRead, surahName, isLoading };
}
