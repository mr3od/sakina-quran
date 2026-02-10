import { MAX_SURAH } from "@/shared/constants/quran";
import { getDB } from "@/server/db";
import { structuralSearch } from "@/server/structuralSearch";
import { textSearch } from "@/server/textSearch";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const type = url.searchParams.get("type");
  const rawLocale = url.searchParams.get("locale") ?? "en";
  const locale = rawLocale.toLowerCase().startsWith("ar") ? "ar" : "en";
  
  // Validate query length
  if (q.length > 200) {
    return Response.json({ error: "Query too long" }, { status: 400 });
  }
  
  // Optional args for specific ayah lookup
  const suraParam = url.searchParams.get("sura");
  const ayahParam = url.searchParams.get("ayah");
  const limitParam = url.searchParams.get("limit") || "50";
  
  // Validate numeric parameters
  const sura = suraParam ? parseInt(suraParam, 10) : null;
  const ayah = ayahParam ? parseInt(ayahParam, 10) : null;
  const parsedLimit = parseInt(limitParam, 10);
  
  if (suraParam && (isNaN(sura!) || sura! < 1 || sura! > MAX_SURAH)) {
    return Response.json({ error: "Invalid sura number" }, { status: 400 });
  }
  
  if (ayahParam && (isNaN(ayah!) || ayah! < 1)) {
    return Response.json({ error: "Invalid ayah number" }, { status: 400 });
  }
  
  if (isNaN(parsedLimit) || parsedLimit < 1) {
    return Response.json({ error: "Invalid limit" }, { status: 400 });
  }
  
  const limit = Math.min(parsedLimit, 100);

  try {
    const database = await getDB();

    // 0. Specific Ayah Lookup (legacy/internal use)
    if (sura && ayah) {
      const stmt = database.prepare(
        "SELECT * FROM ayahs WHERE sura_number = ? AND ayah_number = ?",
      );
      stmt.bind([sura, ayah]);
      const res = [];
      while (stmt.step()) res.push(stmt.getAsObject());
      stmt.free();
      return Response.json(res);
    }

    // 1. Structural Search
    if (type === "structural") {
      return Response.json(structuralSearch(database, q, locale));
    }

    // 2. Text Search
    return Response.json(textSearch(database, q, limit, locale));
  } catch (error) {
    console.error("Search API Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 },
    );
  }
}
