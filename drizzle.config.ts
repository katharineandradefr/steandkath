import path from "node:path";

import { defineConfig } from "drizzle-kit";

const sqliteFilePath =
  process.env.SQLITE_DATABASE_PATH ??
  path.join(process.cwd(), "data", "app.db");

export default defineConfig({
  schema: "./src/server/db/sqlite/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: `file:${path.resolve(sqliteFilePath)}`,
  },
});
