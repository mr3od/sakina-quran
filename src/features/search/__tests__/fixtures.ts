import type { SearchRow } from "../domain/search-contract";

export function makeRow(overrides: Partial<SearchRow> = {}): SearchRow {
  return {
    type: "ayah",
    sura: 1,
    ayah: 1,
    surahName: "Al-Fatiha",
    simple: "test",
    page: 1,
    ...overrides,
  };
}
