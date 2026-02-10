import { ProgressRepository } from "@/entities/reading-progress/api/ProgressRepository";
import { useCallback } from "react";

export function useUpdateReadingProgress() {
  const updateProgress = useCallback(async (pageNumber: number) => {
    try {
      const repo = new ProgressRepository();
      await repo.updateLastReadPosition(pageNumber);
    } catch (error) {
      console.warn("Failed to update reading progress:", error);
    }
  }, []);

  return updateProgress;
}
