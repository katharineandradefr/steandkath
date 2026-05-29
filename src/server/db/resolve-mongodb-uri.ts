import dns from "node:dns/promises";

const resolvedUriCache = new Map<string, string>();

/**
 * Converte mongodb+srv:// em mongodb:// usando DNS público (evita querySrv ECONNREFUSED no Windows).
 */
export async function resolveMongoDbUri(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) {
    return uri;
  }

  const cached = resolvedUriCache.get(uri);
  if (cached) return cached;

  dns.setServers(["8.8.8.8", "1.1.1.1"]);

  const url = new URL(uri.replace("mongodb+srv://", "https://"));
  const records = await dns.resolveSrv(`_mongodb._tcp.${url.hostname}`);

  const hosts = records.map((record) => `${record.name}:${record.port}`).join(",");

  const username = encodeURIComponent(decodeURIComponent(url.username));
  const password = encodeURIComponent(decodeURIComponent(url.password));
  const dbName = url.pathname.replace(/^\//, "") || "test";

  const params = new URLSearchParams(url.search);
  params.set("ssl", "true");
  params.set("authSource", "admin");
  if (!params.has("retryWrites")) params.set("retryWrites", "true");
  if (!params.has("w")) params.set("w", "majority");

  const standardUri = `mongodb://${username}:${password}@${hosts}/${dbName}?${params.toString()}`;

  resolvedUriCache.set(uri, standardUri);
  return standardUri;
}
