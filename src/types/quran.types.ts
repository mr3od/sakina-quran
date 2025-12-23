/**
 * Quran-related TypeScript type definitions
 */

export interface Surah {
  id: number;
  revelation_place: "makkah" | "madinah";
  revelation_order: number;
  bismillah_pre: 0 | 1;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages_range: string; // Format: "start-end"
}

export interface Ayah {
  sura_number: number;
  ayah_number: number;
  uthmani_text: string;
  simple_text: string;
}

export interface PageSegment {
  page_number: number;
  juz_number: number;
  hizb_number: number;
  rub_number: number;
  manzil_number: number;
  sura_start: number;
  ayah_start: number;
  sura_end: number;
  ayah_end: number;
}

export interface JuzData {
  juz_number: number;
  surahs: Surah[];
}
