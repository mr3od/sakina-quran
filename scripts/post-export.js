const fs = require("fs");
const path = require("path");

// Determine paths
const PROJECT_ROOT = path.resolve(__dirname, "..");
const WASM_SOURCE = path.join(
    PROJECT_ROOT,
    "node_modules",
    "sql.js",
    "dist",
    "sql-wasm.wasm",
);
const DB_SOURCE = path.join(PROJECT_ROOT, "assets", "quran.db");

// The output directory for Expo Web Server Functions
// Based on the error log: dist/server/_expo/functions/api/sql-wasm.wasm
const SERVER_API_DIR = path.join(
    PROJECT_ROOT,
    "dist",
    "server",
    "_expo",
    "functions",
    "api",
);

// Create directory if it doesn't exist
if (!fs.existsSync(SERVER_API_DIR)) {
    console.log(`Creating directory: ${SERVER_API_DIR}`);
    fs.mkdirSync(SERVER_API_DIR, { recursive: true });
}

// Copy sql-wasm.wasm
if (fs.existsSync(WASM_SOURCE)) {
    const dest = path.join(SERVER_API_DIR, "sql-wasm.wasm");
    fs.copyFileSync(WASM_SOURCE, dest);
    console.log(`✅ Copied sql-wasm.wasm to ${dest}`);
} else {
    console.error(`❌ Could not find sql-wasm.wasm at ${WASM_SOURCE}`);
    process.exit(1);
}

// Copy quran.db (search+api.ts looks for it in project root, but for production it might need to be nearby)
// Actually, in the code user wrote: path.resolve(process.cwd(), "assets/quran.db");
// When running `npx expo serve`, process.cwd() is usually the project root, so it might find assets/quran.db.
// BUT, if the server is sandboxed or moved, we might need it.
// Let's ALSO copy it to dist/server/assets/quran.db just in case we need to change the resolution logic later.
const DIST_ASSETS_DIR = path.join(PROJECT_ROOT, "dist", "server", "assets");
if (!fs.existsSync(DIST_ASSETS_DIR)) {
    fs.mkdirSync(DIST_ASSETS_DIR, { recursive: true });
}

if (fs.existsSync(DB_SOURCE)) {
    const dest = path.join(DIST_ASSETS_DIR, "quran.db");
    fs.copyFileSync(DB_SOURCE, dest);
    console.log(`✅ Copied quran.db to ${dest}`);
}

console.log("Post-export steps completed.");
