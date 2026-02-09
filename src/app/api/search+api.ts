import { MAX_HIZB, MAX_JUZ, MAX_SURAH } from "@/shared/constants/quran";
import fs from "fs";
import path from "path";
import initSqlJs from "sql.js";

/*
  API Route for Web Searching
  - This runs in a server environment (Node/Bun/Edge depending on deployment).
  - Matches the logic in StructuralSearcher.native.ts for feature parity.
*/

// Cache the DB connection in memory during runtime
let db: any = null;

async function getDB() {
  if (db) return db;

  // Locate the DB file. In a deployed environment, this path handling is tricky.
  // For standard Expo server, process.cwd() is usually project root.

  const dbPath = path.resolve(process.cwd(), "assets/quran.db");

  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database not found at ${dbPath}`);
  }

  // Load WASM binary explicitly to avoid path resolution issues
  let wasmPath = path.join(
    process.cwd(),
    "node_modules/sql.js/dist/sql-wasm.wasm",
  );
  if (!fs.existsSync(wasmPath)) {
    wasmPath = path.join(
      process.cwd(),
      "../node_modules/sql.js/dist/sql-wasm.wasm",
    );
  }
  if (!fs.existsSync(wasmPath)) {
    throw new Error(`Cannot find sql-wasm.wasm at ${wasmPath}`);
  }
  const wasmBinary = fs.readFileSync(wasmPath);
  //@ts-ignore
  const SQL = await initSqlJs({ wasmBinary });

  const buffer = fs.readFileSync(dbPath);
  db = new SQL.Database(buffer);
  return db;
}

const RE_SURA_AYAH = /^(\d+)\s*[:：]\s*(\d+)$/;
const HAS_DIGIT = /\d/;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const type = url.searchParams.get("type");
  
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

    // 1. Structural Search (matches StructuralSearcher.native.ts)
    if (type === "structural") {
      if (!q || !HAS_DIGIT.test(q)) return Response.json([]);

      const items: any[] = [];

      // Case A: "N:N" -> Surah:Ayah
      const pair = q.match(RE_SURA_AYAH);
      if (pair) {
        const sura = Number(pair[1]);
        const ayah = Number(pair[2]);

        const stmt = database.prepare(`
          SELECT s.name_simple,
                (SELECT ps.page_number
                 FROM page_segments ps
                 WHERE (ps.sura_start < ? OR (ps.sura_start = ? AND ps.ayah_start <= ?))
                   AND (ps.sura_end > ? OR (ps.sura_end = ? AND ps.ayah_end >= ?))
                 ORDER BY ps.page_number ASC
                 LIMIT 1) AS page_number
          FROM surahs s
          WHERE s.id = ?
        `);
        stmt.bind([sura, sura, ayah, sura, sura, ayah, sura]);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          items.push({
            type: "surahAyah",
            sura,
            ayah,
            surahName: row.name_simple || `Surah ${sura}`,
            simple: `${sura}:${ayah}`,
            page: row.page_number ?? 0,
          });
        }
        stmt.free();
        return Response.json(items);
      }

      // Case B: Numeric keyword searches (Surah, Juz, Hizb, Page)
      const num = Number(q.replace(/[^\d]/g, ""));

      // Surah
      if (num >= 1 && num <= MAX_SURAH) {
        const stmt = database.prepare(`
          SELECT MIN(ps.page_number) AS page_number, s.name_simple
          FROM page_segments ps
          JOIN surahs s ON s.id = ps.sura_start
          WHERE ps.sura_start = ?
        `);
        stmt.bind([num]);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          if (row.page_number) {
            items.push({
              type: "surah",
              sura: num,
              ayah: 1,
              surahName: row.name_simple,
              simple: `سورة ${num}`,
              page: row.page_number,
            });
          }
        }
        stmt.free();
      }

      // Juz
      if (num >= 1 && num <= MAX_JUZ) {
        const stmt = database.prepare(`
          SELECT ps.page_number, ps.sura_start, ps.ayah_start, s.name_simple
          FROM page_segments ps
          JOIN surahs s ON s.id = ps.sura_start
          WHERE ps.juz_number = ?
          ORDER BY ps.page_number ASC
          LIMIT 1
        `);
        stmt.bind([num]);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          if (row.page_number) {
            items.push({
              type: "juz",
              sura: row.sura_start,
              ayah: row.ayah_start,
              surahName: row.name_simple,
              simple: `الجزء ${num}`,
              page: row.page_number,
            });
          }
        }
        stmt.free();
      }

      // Hizb
      if (num >= 1 && num <= MAX_HIZB) {
        const stmt = database.prepare(`
          SELECT ps.page_number, ps.sura_start, ps.ayah_start, s.name_simple
          FROM page_segments ps
          JOIN surahs s ON s.id = ps.sura_start
          WHERE ps.hizb_number = ?
          ORDER BY ps.page_number ASC
          LIMIT 1
        `);
        stmt.bind([num]);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          if (row.page_number) {
            items.push({
              type: "hizb",
              sura: row.sura_start,
              ayah: row.ayah_start,
              surahName: row.name_simple,
              simple: `الحزب ${num}`,
              page: row.page_number,
            });
          }
        }
        stmt.free();
      }

      // Page
      const stmtPage = database.prepare(`
        SELECT ps.page_number, ps.sura_start, ps.ayah_start, s.name_simple
        FROM page_segments ps
        JOIN surahs s ON s.id = ps.sura_start
        WHERE ps.page_number = ?
        LIMIT 1
      `);
      stmtPage.bind([num]);
      if (stmtPage.step()) {
        const row = stmtPage.getAsObject();
        if (row.page_number) {
          items.push({
            type: "page",
            sura: row.sura_start,
            ayah: row.ayah_start,
            surahName: row.name_simple,
            simple: `الصفحة ${num}`,
            page: row.page_number,
          });
        }
      }
      stmtPage.free();

      return Response.json(items);
    }

    // 2. Text Search
    if (!q) return Response.json([]);

    const likeQuery = `
      SELECT a.sura_number, a.ayah_number, a.simple_text, s.name_simple AS surah_name,
      (
         SELECT ps.page_number
         FROM page_segments ps
         WHERE (ps.sura_start < a.sura_number OR (ps.sura_start = a.sura_number AND ps.ayah_start <= a.ayah_number))
           AND (ps.sura_end > a.sura_number OR (ps.sura_end = a.sura_number AND ps.ayah_end >= a.ayah_number))
         ORDER BY ps.page_number ASC LIMIT 1
      ) AS page_number
      FROM ayahs a
      JOIN surahs s ON s.id = a.sura_number
      WHERE a.simple_text LIKE ?
      LIMIT ?
    `;

    // Note: FTS5 usually doesn't work out-of-the-box with sql.js unless specifically compiled with it.
    // We stick to LIKE for safety unless FTS table exists.

    const stmt = database.prepare(likeQuery);
    stmt.bind([`%${q}%`, limit]);

    const rows = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      rows.push({
        type: "ayah",
        sura: row.sura_number,
        ayah: row.ayah_number,
        surahName: row.surah_name,
        simple: row.simple_text,
        page: row.page_number || 0,
      });
    }
    stmt.free();

    return Response.json(rows);
  } catch (error: any) {
    console.error("Search API Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
