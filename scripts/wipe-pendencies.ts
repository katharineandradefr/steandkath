/**
 * Apaga todas as pendências e metas do MongoDB.
 * Uso único após migração dos 9 novos projectKey.
 * Uso: pnpm wipe:pendencies
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import mongoose from "mongoose";

import { resolveMongoDbUri } from "../src/server/db/resolve-mongodb-uri";

/**
 * Carrega variáveis do arquivo .env local para scripts CLI.
 */
function loadEnvFile(): void {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    throw new Error("Arquivo .env não encontrado. Copie .env.example para .env.");
  }

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvFile();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI não definido no .env.");
  }

  const resolvedUri = await resolveMongoDbUri(uri);
  await mongoose.connect(resolvedUri);

  const pendencies = await mongoose.connection
    .collection("pendencies")
    .deleteMany({});
  const goals = await mongoose.connection.collection("goals").deleteMany({});

  console.log(`Pendências apagadas: ${pendencies.deletedCount}`);
  console.log(`Metas apagadas: ${goals.deletedCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("Erro ao limpar pendências:", error);
  process.exit(1);
});
