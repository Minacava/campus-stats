import { access } from "node:fs/promises";
import { cachePath, loadCache } from "../cache.js";
import { SqliteStore } from "./sqlite-store.js";

export const DEFAULT_DB_PATH = ".campus/campus.sqlite";

/** Import JSON cache into SQLite (upsert). No-op if JSON cache missing. */
export async function migrateJsonCacheToSqlite(
  dbPath: string = DEFAULT_DB_PATH,
  jsonPath: string = cachePath(),
): Promise<{ migrated: boolean; path: string }> {
  try {
    await access(jsonPath);
  } catch {
    return { migrated: false, path: dbPath };
  }
  const cache = await loadCache(jsonPath);
  const store = new SqliteStore(dbPath);
  try {
    store.upsertCache(cache);
  } finally {
    store.close();
  }
  return { migrated: true, path: dbPath };
}
