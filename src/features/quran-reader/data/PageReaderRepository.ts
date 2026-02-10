/**
 * Page Reader Repository - Web Implementation
 */

import { QuranRepository } from "@/entities/quran/api/QuranRepository";
import type { Ayah, PageSegment } from "@/types/quran.types";

export class PageReaderRepository {
  private repo: QuranRepository;

  // Accepts any db object to satisfy shared hooks (null on web, SQLiteDatabase on native)
  constructor(_db: any) {
    this.repo = new QuranRepository(null);
  }

  /**
   * Get all ayahs for a specific page
   */
  async getPageAyahs(page: number): Promise<Ayah[]> {
    return this.repo.getAyahsByPage(page);
  }

  /**
   * Get metadata (Juz, Hizb, Rub) for a specific page
   */
  async getPageMeta(page: number): Promise<PageSegment | null> {
    return this.repo.getPageSegment(page);
  }

  /**
   * Find page containing specific ayah
   */
  async findPageForAyah(sura: number, ayah: number): Promise<number | null> {
    return this.repo.getPageForAyah(sura, ayah);
  }
}
