import { CompositeSearcher } from "../CompositeSearcher";
import type { Searcher, SearchRow } from "../../domain/search-contract";
import { makeRow } from "../../__tests__/fixtures";

describe("CompositeSearcher", () => {
  const mockSearcher = (rows: SearchRow[]): Searcher => ({
    search: jest.fn().mockResolvedValue(rows),
  });

  const failingSearcher = (): Searcher => ({
    search: jest.fn().mockRejectedValue(new Error("fail")),
  });

  it("merges results from multiple searchers", async () => {
    const s1 = mockSearcher([makeRow({ sura: 1, ayah: 1 })]);
    const s2 = mockSearcher([makeRow({ sura: 2, ayah: 1 })]);
    const composite = new CompositeSearcher([s1, s2]);

    const results = await composite.search("test");

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ sura: 1, ayah: 1 });
    expect(results[1]).toMatchObject({ sura: 2, ayah: 1 });
  });

  it("deduplicates by type:sura:ayah", async () => {
    const s1 = mockSearcher([makeRow({ sura: 1, ayah: 1, simple: "first" })]);
    const s2 = mockSearcher([makeRow({ sura: 1, ayah: 1, simple: "second" })]);
    const composite = new CompositeSearcher([s1, s2]);

    const results = await composite.search("test");

    expect(results).toHaveLength(1);
    expect(results[0].simple).toBe("first");
  });

  it("respects limit", async () => {
    const rows = Array.from({ length: 100 }, (_, i) =>
      makeRow({ sura: 1, ayah: i + 1 }),
    );
    const s = mockSearcher(rows);
    const composite = new CompositeSearcher([s]);

    const results = await composite.search("test", 10);

    expect(results).toHaveLength(10);
  });

  it("tolerates failing searchers", async () => {
    const s1 = failingSearcher();
    const s2 = mockSearcher([makeRow({ sura: 2, ayah: 1 })]);
    const composite = new CompositeSearcher([s1, s2]);

    const results = await composite.search("test");

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ sura: 2, ayah: 1 });
  });

  it("returns empty array when all searchers fail", async () => {
    const s1 = failingSearcher();
    const s2 = failingSearcher();
    const composite = new CompositeSearcher([s1, s2]);

    const results = await composite.search("test");

    expect(results).toEqual([]);
  });
});
