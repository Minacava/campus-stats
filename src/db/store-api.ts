import path from "node:path";
import { loadCache, saveCache, cachePath, mergeSyncResult } from "../cache.js";
import type { CampoCache } from "../types.js";
import type { SyncResult } from "../sources/types.js";
import { DEFAULT_DB_PATH, migrateJsonCacheToSqlite } from "./migrate.js";
import { SqliteStore } from "./sqlite-store.js";

export type StoreMode = "json" | "sqlite";

export function resolveStoreMode(args: string[]): StoreMode {
  if (args.includes("--json")) return "json";
  if (args.includes("--sqlite") || getArg(args, "--db")) return "sqlite";
  return "json";
}

export function resolveDbPath(args: string[], cwd = process.cwd()): string {
  const raw = getArg(args, "--db") ?? DEFAULT_DB_PATH;
  return path.isAbsolute(raw) ? raw : path.join(cwd, raw);
}

function getArg(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  const value = args[idx + 1];
  if (!value || value.startsWith("--")) throw new Error(`Missing value for ${name}`);
  return value;
}

export async function readStore(
  mode: StoreMode,
  dbPath: string,
): Promise<CampoCache> {
  if (mode === "json") return loadCache();
  const store = new SqliteStore(dbPath);
  try {
    return store.loadCache();
  } finally {
    store.close();
  }
}

export async function writeSyncToStore(
  mode: StoreMode,
  dbPath: string,
  result: SyncResult,
): Promise<CampoCache> {
  if (mode === "json") {
    const cache = mergeSyncResult(await loadCache(), result);
    await saveCache(cache);
    return cache;
  }
  const store = new SqliteStore(dbPath);
  try {
    const existing = store.loadCache();
    const merged = mergeSyncResult(existing, result);
    store.upsertCache(merged);
    return merged;
  } finally {
    store.close();
  }
}

export async function writeCacheToStore(
  mode: StoreMode,
  dbPath: string,
  cache: CampoCache,
): Promise<void> {
  if (mode === "json") {
    await saveCache(cache);
    return;
  }
  const store = new SqliteStore(dbPath);
  try {
    store.replaceAll(cache);
  } finally {
    store.close();
  }
}

export async function runMigrate(args: string[]): Promise<void> {
  const dbPath = resolveDbPath(args);
  const result = await migrateJsonCacheToSqlite(dbPath, cachePath());
  console.log(JSON.stringify(result, null, 2));
}
