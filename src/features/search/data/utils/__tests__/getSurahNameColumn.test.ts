import { getSurahNameColumn } from "../getSurahNameColumn";

describe("getSurahNameColumn", () => {
  it('returns name_arabic for "ar"', () => {
    expect(getSurahNameColumn("ar")).toBe("name_arabic");
  });

  it('returns name_simple for "en"', () => {
    expect(getSurahNameColumn("en")).toBe("name_simple");
  });

  it("returns name_simple for unknown locale", () => {
    expect(getSurahNameColumn("fr")).toBe("name_simple");
  });

  it("returns name_simple for undefined", () => {
    expect(getSurahNameColumn(undefined)).toBe("name_simple");
  });
});
