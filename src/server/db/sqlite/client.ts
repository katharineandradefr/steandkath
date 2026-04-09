import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { env } from "~/env";

import * as schema from "./schema";

type GlobalSqlite = typeof globalThis & {
  __sqliteDb?: Database.Database;
};

/**
 * Returns the singleton better-sqlite3 Database instance (dev-friendly HMR).
 */
function getRawSqlite(): Database.Database {
  const globalForSqlite = globalThis as GlobalSqlite;
  if (globalForSqlite.__sqliteDb) {
    return globalForSqlite.__sqliteDb;
  }

  const filePath =
    env.SQLITE_DATABASE_PATH ?? path.join(process.cwd(), "data", "app.db");
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(filePath);
  sqlite.pragma("journal_mode = WAL");
  globalForSqlite.__sqliteDb = sqlite;
  return sqlite;
}

/**
 * Drizzle ORM client bound to the SQLite schema (use apenas em código server-side).
 */
export function getSqliteDb() {
  return drizzle(getRawSqlite(), { schema });
}
