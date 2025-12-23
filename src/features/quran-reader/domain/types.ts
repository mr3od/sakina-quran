/**
 * Domain Types for Quran Reader Feature
 */

import { TOTAL_PAGES } from "@/shared/constants/quran";

export interface PageMetadata {
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number;
  manzilNumber: number;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

export interface PageReaderParams {
  initialPage?: number;
  highlightAyah?: {
    sura: number;
    ayah: number;
  };
}

export interface PageReaderState {
  currentPage: number;
  totalPages: typeof TOTAL_PAGES;
  highlightedAyah: { sura: number; ayah: number } | null;
}

export interface ReadingProgress {
  currentPage: number;
  totalPages: typeof TOTAL_PAGES;
  lastReadAt: Date;
}
