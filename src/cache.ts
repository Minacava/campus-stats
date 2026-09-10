import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CampoCache, Competition, Match, Season, Team } from "./types.js";
import type { SyncResult } from "./sources/types.js";

export const DEFAULT_CACHE_DIR = ".campo-stats";
export const DEFAULT_CACHE_FILE = "cache.json";

export function emptyCache(): CampoCache {
  return {
    competitions: [],
    seasons: [],
    teams: [],
    matches: [],
    identities: [],
    players: [],
    playerMatchStats: [],
  };
}

export function cachePath(cwd: string = process.cwd()): string {
  return path.join(cwd, DEFAULT_CACHE_DIR, DEFAULT_CACHE_FILE);
}

export async function loadCache(filePath: string = cachePath()): Promise<CampoCache> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<CampoCache>;
    return {
      competitions: parsed.competitions ?? [],
      seasons: parsed.seasons ?? [],
      teams: parsed.teams ?? [],
      matches: parsed.matches ?? [],
      identities: parsed.identities ?? [],
      players: parsed.players ?? [],
      playerMatchStats: parsed.playerMatchStats ?? [],
    };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return emptyCache();
    throw err;
  }
}

export async function saveCache(
  cache: CampoCache,
  filePath: string = cachePath(),
): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(cache, null, 2) + "\n", "utf8");
}

function mergeById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of existing) map.set(item.id, item);
  for (const item of incoming) map.set(item.id, item);
  return [...map.values()];
}

/** Merge a sync result into the cache without wiping unrelated competitions. */
export function mergeSyncResult(cache: CampoCache, result: SyncResult): CampoCache {
  return {
    competitions: mergeById<Competition>(cache.competitions, result.competitions),
    seasons: mergeById<Season>(cache.seasons, result.seasons),
    teams: mergeById<Team>(cache.teams, result.teams),
    matches: mergeById<Match>(cache.matches, result.matches),
    identities: cache.identities,
    players: mergeById(cache.players, result.players ?? []),
    playerMatchStats: mergeById(
      cache.playerMatchStats,
      result.playerMatchStats ?? [],
    ),
  };
}
