import { randomUUID } from "node:crypto";

import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Exemplo de tabela SQLite (Drizzle). Estenda ou substitua conforme o domínio da aplicação.
 */
export const exampleEntries = sqliteTable("example_entries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  label: text("label").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});
