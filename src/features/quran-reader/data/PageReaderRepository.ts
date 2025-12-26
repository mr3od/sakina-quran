/**
 * Page Reader Repository - Data access layer for page-based reading
 */

import { QuranRepository } from "@/entities/quran/api/QuranRepository";
import type { Ayah, PageSegment } from "@/types/quran.types";
import type { SQLiteDatabase } from "expo-sqlite";

export class PageReaderRepository {
  private repo: QuranRepository;

  constructor(private db: SQLiteDatabase) {
    this.repo = new QuranRepository(db);
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
