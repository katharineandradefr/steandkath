/**
 * Testa resolução SRV + conexão MongoDB (rodar: node scripts/test-mongo-connection.mjs)
 * Lê MONGODB_URI do .env na raiz do projeto.
 */
import { readFileSync } from "node:fs";
import dns from "node:dns/promises";
import mongoose from "mongoose";

function loadMongoUri() {
  const envText = readFileSync(new URL("../.env", import.meta.url), "utf8");
  const match = envText.match(/^MONGODB_URI="([^"]+)"/m);
  if (!match) throw new Error("MONGODB_URI não encontrado em .env");
  return match[1];
}

async function resolveSrvUri(uri) {
  if (!uri.startsWith("mongodb+srv://")) return uri;

  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  const url = new URL(uri.replace("mongodb+srv://", "https://"));
  const records = await dns.resolveSrv(`_mongodb._tcp.${url.hostname}`);
  const hosts = records.map((r) => `${r.name}:${r.port}`).join(",");
  const user = encodeURIComponent(decodeURIComponent(url.username));
  const pass = encodeURIComponent(decodeURIComponent(url.password));
  const db = url.pathname.replace(/^\//, "") || "test";
  const params = new URLSearchParams(url.search);
  params.set("ssl", "true");
  params.set("authSource", "admin");
  return `mongodb://${user}:${pass}@${hosts}/${db}?${params.toString()}`;
}

const srvUri = loadMongoUri();
console.log("Host:", srvUri.includes("@") ? srvUri.split("@")[1]?.split("/")[0] : "?");

if (srvUri.includes("USUARIO") || srvUri.includes("SENHA")) {
  console.error("\n❌ .env ainda usa USUARIO:SENHA — coloque usuário e senha reais do Atlas.");
  process.exit(1);
}

try {
  const uri = await resolveSrvUri(srvUri);
  console.log("SRV resolvido → mongodb:// (sem exibir senha)");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("✅ Conectou ao MongoDB:", mongoose.connection.name);
  await mongoose.disconnect();
} catch (error) {
  console.error("❌ Falhou:", error instanceof Error ? error.message : error);
  process.exit(1);
}
