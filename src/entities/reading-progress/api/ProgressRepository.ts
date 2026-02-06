import { TOTAL_PAGES } from "@/shared/constants/quran";

const LAST_READ_PAGE_KEY = "last_read_page";

export interface ReadingPosition {
  page_number: number;
  last_read_at?: Date;
}

/**
 * ProgressRepository (Web Implementation)
 * Handles persistence of reading progress using localStorage.
 */
export class ProgressRepository {
  /**
   * Get the last read position.
   */
  async getLastReadPosition(): Promise<ReadingPosition | null> {
    try {
      const pageValue = localStorage.getItem(LAST_READ_PAGE_KEY);
      if (!pageValue) return null;

      const pageNumber = parseInt(pageValue, 10);
      if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > TOTAL_PAGES) {
        return null;
      }

      return { page_number: pageNumber };
    } catch {
      return null;
    }
  }

  /**
   * Update the last read position.
   */
  async updateLastReadPosition(pageNumber: number): Promise<void> {
    if (pageNumber < 1 || pageNumber > TOTAL_PAGES) {
      throw new Error(`Invalid page number: ${pageNumber}`);
    }
    localStorage.setItem(LAST_READ_PAGE_KEY, pageNumber.toString());
  }

  /**
   * Clear the last read position.
   */
  async clearLastReadPosition(): Promise<void> {
    localStorage.removeItem(LAST_READ_PAGE_KEY);
  }
}
