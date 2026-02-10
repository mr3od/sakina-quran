import { pageResolverSubquery } from "../sqlFragments";

describe("pageResolverSubquery", () => {
  it("generates SQL with provided refs", () => {
    const sql = pageResolverSubquery("a.sura_number", "a.ayah_number");
    expect(sql).toContain("ps.sura_start < a.sura_number");
    expect(sql).toContain("ps.ayah_start <= a.ayah_number");
    expect(sql).toContain("ps.sura_end > a.sura_number");
    expect(sql).toContain("ps.ayah_end >= a.ayah_number");
  });

  it("wraps in SELECT subquery", () => {
    const sql = pageResolverSubquery("s", "a");
    expect(sql).toMatch(/^\(SELECT ps\.page_number/);
    expect(sql).toMatch(/LIMIT 1\)$/);
  });
});
