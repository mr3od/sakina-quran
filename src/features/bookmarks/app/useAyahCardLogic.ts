import type { Ayah } from "@/types/quran.types";
import { useToggleBookmark } from "./useBookmarkMutations";
import { useBookmarkStatus } from "./useBookmarkStatus";

export function useAyahCardLogic(ayah: Ayah, page?: number) {
  // Get bookmark status and toggle mutation
  const { isBookmarked, isLoading } = useBookmarkStatus(
    ayah.sura_number,
    ayah.ayah_number,
  );
  const toggleBookmark = useToggleBookmark();

  const handleToggleBookmark = () => {
    if (typeof page !== "number") {
      console.error("AyahCard: Missing page number for bookmark");
      return;
    }
    toggleBookmark.mutate({
      sura: ayah.sura_number,
      ayah: ayah.ayah_number,
      page,
      isBookmarked,
    });
  };

  const isPending = isLoading || toggleBookmark.isPending;

  return {
    isBookmarked,
    isLoading,
    handleToggleBookmark,
    isPending,
  };
}
