import { parseSearchQuery } from "../query-parser";

describe("parseSearchQuery", () => {
  describe("empty input", () => {
    it("returns empty for empty string", () => {
      expect(parseSearchQuery("")).toEqual({ kind: "empty" });
    });

    it("returns empty for whitespace only", () => {
      expect(parseSearchQuery("   ")).toEqual({ kind: "empty" });
    });
  });

  describe("surahAyah format", () => {
    it("parses colon notation", () => {
      expect(parseSearchQuery("2:255")).toEqual({
        kind: "surahAyah",
        sura: 2,
        ayah: 255,
      });
    });

    it("handles full-width colon", () => {
      expect(parseSearchQuery("2：255")).toEqual({
        kind: "surahAyah",
        sura: 2,
        ayah: 255,
      });
    });

    it("handles whitespace around colon", () => {
      expect(parseSearchQuery("2 : 255")).toEqual({
        kind: "surahAyah",
        sura: 2,
        ayah: 255,
      });
    });
  });

  describe("pure numeric", () => {
    it("parses single digit", () => {
      expect(parseSearchQuery("1")).toEqual({ kind: "numeric", value: 1 });
    });

    it("parses multi-digit", () => {
      expect(parseSearchQuery("114")).toEqual({ kind: "numeric", value: 114 });
    });
  });

  describe("mixed text with digits", () => {
    it('extracts number from "juz 7"', () => {
      expect(parseSearchQuery("juz 7")).toEqual({ kind: "numeric", value: 7 });
    });

    it("extracts number from Arabic text with digits", () => {
      expect(parseSearchQuery("صفحة 151")).toEqual({
        kind: "numeric",
        value: 151,
      });
    });

    it('extracts number from "ayah 255 kursi"', () => {
      expect(parseSearchQuery("ayah 255 kursi")).toEqual({
        kind: "numeric",
        value: 255,
      });
    });
  });

  describe("pure text", () => {
    it("returns text for Arabic", () => {
      expect(parseSearchQuery("الفاتحة")).toEqual({
        kind: "text",
        value: "الفاتحة",
      });
    });

    it("returns text for English", () => {
      expect(parseSearchQuery("bismillah")).toEqual({
        kind: "text",
        value: "bismillah",
      });
    });
  });
});
