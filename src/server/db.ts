import fs from "fs";
import path from "path";
import initSqlJs, { type Database } from "sql.js";

let db: Database | null = null;

export async function getDB(): Promise<Database> {
  if (db) return db;

  const dbPath = path.resolve(process.cwd(), "assets/quran.db");

  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database not found at ${dbPath}`);
  }

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
  const SQL = await initSqlJs({ wasmBinary });

  const buffer = fs.readFileSync(dbPath);
  db = new SQL.Database(buffer);
  return db;
}
