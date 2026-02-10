import fs from "fs";
import path from "path";
import initSqlJs from "sql.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../assets/quran.db");
const OUT_DIR = path.join(__dirname, "../public/api/static");

// Ensure output directories exist
fs.mkdirSync(path.join(OUT_DIR, "pages"), { recursive: true });

async function main() {
  console.log("📦 Loading SQL.js & Database...");
  const SQL = await initSqlJs();
  const filebuffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(filebuffer);

  // Helper to run query and get objects
  function query(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  }

  try {
    /**
     * Generate Surahs
     */
    console.log("📄 Generating Surahs...");
    const surahs = query("SELECT * FROM surahs ORDER BY id");
    fs.writeFileSync(path.join(OUT_DIR, "surahs.json"), JSON.stringify(surahs));

    /**
     * Generate Page Segments
     */
    console.log("📄 Generating Page Segments...");
    const segments = query("SELECT * FROM page_segments ORDER BY page_number");
    fs.writeFileSync(
      path.join(OUT_DIR, "page_segments.json"),
      JSON.stringify(segments),
    );

    /**
     * Generate Juz List
     */
    console.log("📄 Generating Juz List...");
    // sql.js supports standard SQLite features.
    // However, json_group_array might not be compiled in standard distribution.
    // If it fails, we fall back to manual grouping.

    let juzData = [];
    try {
      const juzQuery = `
          WITH surah_first_page AS (
            SELECT
              ps.sura_start AS surah_id,
              MIN(ps.page_number) AS first_page
            FROM page_segments ps
            GROUP BY ps.sura_start
          ),
          surah_first_juz AS (
            SELECT
              sfp.surah_id,
              ps.juz_number
            FROM surah_first_page sfp
            JOIN page_segments ps
              ON ps.page_number = sfp.first_page
          )
          SELECT
            sfj.juz_number,
            json_group_array(
              json_object(
                'id', s.id,
                'name_simple', s.name_simple,
                'name_arabic', s.name_arabic,
                'name_complex', s.name_complex,
                'revelation_place', s.revelation_place,
                'revelation_order', s.revelation_order,
                'bismillah_pre', s.bismillah_pre,
                'verses_count', s.verses_count,
                'pages_range', s.pages_range
              )
            ) AS surahs
          FROM surah_first_juz sfj
          JOIN surahs s ON s.id = sfj.surah_id
          GROUP BY sfj.juz_number
          ORDER BY sfj.juz_number
        `;
      const juzResult = query(juzQuery);
      juzData = juzResult.map((row) => ({
        juz_number: row.juz_number,
        surahs: JSON.parse(row.surahs),
      }));
    } catch (e) {
      console.warn(
        "⚠️ JSON functions not available, using fallback JS grouping...",
      );
      const rows = query(`
            SELECT 
                sfj.juz_number,
                s.*
            FROM (
                SELECT sfp.surah_id, ps.juz_number
                FROM (
                    SELECT ps.sura_start AS surah_id, MIN(ps.page_number) AS first_page
                    FROM page_segments ps GROUP BY ps.sura_start
                ) sfp
                JOIN page_segments ps ON ps.page_number = sfp.first_page
            ) sfj
            JOIN surahs s ON s.id = sfj.surah_id
            ORDER BY sfj.juz_number, s.id
        `);

      // Group by juz_number
      const map = new Map();
      rows.forEach((r) => {
        if (!map.has(r.juz_number)) map.set(r.juz_number, []);
        const { juz_number, ...surah } = r;
        map.get(juz_number).push(surah);
      });

      juzData = Array.from(map.entries()).map(([k, v]) => ({
        juz_number: k,
        surahs: v,
      }));
    }

    fs.writeFileSync(path.join(OUT_DIR, "juz.json"), JSON.stringify(juzData));

    /**
     * Generate Pages (Ayahs)
     */
    console.log("📄 Generating Pages (1-604)...");

    // Prepare statements for loop
    for (const segment of segments) {
      let ayahs;
      if (segment.sura_start === segment.sura_end) {
        ayahs = query(
          `SELECT * FROM ayahs 
           WHERE sura_number = ? 
           AND ayah_number >= ? 
           AND ayah_number <= ?
           ORDER BY ayah_number`,
          [segment.sura_start, segment.ayah_start, segment.ayah_end],
        );
      } else {
        ayahs = query(
          `SELECT * FROM ayahs 
           WHERE (sura_number = ? AND ayah_number >= ?)
              OR (sura_number > ? AND sura_number < ?)
              OR (sura_number = ? AND ayah_number <= ?)
           ORDER BY sura_number, ayah_number`,
          [
            segment.sura_start,
            segment.ayah_start,
            segment.sura_start,
            segment.sura_end,
            segment.sura_end,
            segment.ayah_end,
          ],
        );
      }

      fs.writeFileSync(
        path.join(OUT_DIR, `pages/${segment.page_number}.json`),
        JSON.stringify(ayahs),
      );
    }

    console.log("✅ Static Generation Complete!");
  } catch (e) {
    console.error("GEN FAILED:", e);
    process.exit(1);
  }
}

main();
