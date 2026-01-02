import { ExpoRequest } from "expo-router/server";
import fs from "fs";
import path from "path";
import initSqlJs from "sql.js";

/*
  API Route for Web Searching
  - This runs in a server environment (Node/Bun/Edge depending on deployment).
  - For static export, this might not work unless deployed to a server.
  - However, for local dev (npx expo start --web), it works.
  - For full SSG, we might want a client-side search index (e.g. flexsearch or mini-search) loaded from JSON.
  - BUT, the user explicitly asked for API Routes.
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

export async function GET(request: ExpoRequest) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  // Optional args for specific ayah lookup
  const sura = url.searchParams.get("sura");
  const ayah = url.searchParams.get("ayah");
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);

  try {
    const database = await getDB();

    // 1. Specific Ayah Lookup
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
