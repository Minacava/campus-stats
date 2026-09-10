/**
 * Product helpers aimed at women's fantasy football apps
 * (club leagues + national-team tournaments).
 */

import { emptyCache, mergeSyncResult } from "./cache.js";
import {
  StatsBombSource,
  type StatsBombSourceOptions,
  type WomenCompetitionInfo,
} from "./sources/statsbomb.js";
import type { SyncResult } from "./sources/types.js";
import type { CampoCache, Competition } from "./types.js";

export type { WomenCompetitionInfo };

/** Default cap when enriching player stats in fantasy sync. */
export const FANTASY_PLAYER_STATS_LIMIT = 25;

export interface FantasySyncOptions extends StatsBombSourceOptions {
  /**
   * When including player stats, only enrich matches from each competition's
   * latest season (recommended for fantasy scoring without downloading every
   * historical event file).
   */
  latestSeasonPlayersOnly?: boolean;
  /** Optional progress logger (CLI uses stderr). */
  onProgress?: (message: string) => void;
}

/**
 * List every women's competition currently published in StatsBomb Open Data.
 * Includes club leagues (Liga F, WSL, …) and national-team tournaments
 * (Women's World Cup, UEFA Women's Euro).
 */
export async function listWomenCompetitions(
  options: StatsBombSourceOptions = {},
): Promise<WomenCompetitionInfo[]> {
  const source = new StatsBombSource(options);
  return source.listWomenCompetitions();
}

/**
 * One-shot sync of the full women's open-data catalogue — clubs + selecciones.
 * This is the recommended bootstrap for a worldwide women's fantasy product.
 */
export async function syncFantasyBundle(
  options: FantasySyncOptions = {},
): Promise<SyncResult> {
  const {
    latestSeasonPlayersOnly = true,
    onProgress,
    includePlayerStats = false,
    playerStatsLimit = FANTASY_PLAYER_STATS_LIMIT,
    ...sourceOpts
  } = options;

  const source = new StatsBombSource({
    ...sourceOpts,
    includePlayerStats: false,
  });

  const catalogue = await source.listWomenCompetitions();
  onProgress?.(
    `Fantasy bundle: ${catalogue.length} women's competitions (clubs + national teams)…`,
  );

  let merged = emptySyncResult();
  for (const comp of catalogue) {
    onProgress?.(`  syncing ${comp.name}${comp.international ? " (national teams)" : ""}…`);
    const slice = await source.syncCompetition(comp.name);
    merged = mergeSyncResults(merged, slice);
  }

  if (includePlayerStats) {
    const enrichSource = new StatsBombSource({
      ...sourceOpts,
      includePlayerStats: true,
      playerStatsLimit,
    });
    const targets = pickMatchesForPlayerStats(merged, {
      latestSeasonOnly: latestSeasonPlayersOnly,
      limit: playerStatsLimit,
    });
    onProgress?.(
      `  enriching player stats for ${targets.length} matches (fantasy metrics)…`,
    );
    const players = await enrichSource.loadPlayerStatsForMatches(targets);
    merged.players = players.players;
    merged.playerMatchStats = players.playerMatchStats;
    merged.lineups = players.lineups;
  }

  return merged;
}

/**
 * Re-sync every competition already present in a local cache (refresh path).
 */
export async function updateCachedCompetitions(
  cache: CampoCache,
  options: FantasySyncOptions = {},
): Promise<SyncResult> {
  const names = [...new Set(cache.competitions.map((c) => c.name))];
  if (names.length === 0) {
    return syncFantasyBundle(options);
  }

  const {
    onProgress,
    includePlayerStats = false,
    playerStatsLimit = FANTASY_PLAYER_STATS_LIMIT,
    latestSeasonPlayersOnly = true,
    ...sourceOpts
  } = options;

  const source = new StatsBombSource({
    ...sourceOpts,
    includePlayerStats: false,
  });

  let merged = emptySyncResult();
  for (const name of names) {
    onProgress?.(`  updating ${name}…`);
    const slice = await source.syncCompetition(name);
    merged = mergeSyncResults(merged, slice);
  }

  if (includePlayerStats) {
    const enrichSource = new StatsBombSource({
      ...sourceOpts,
      includePlayerStats: true,
      playerStatsLimit,
    });
    const targets = pickMatchesForPlayerStats(merged, {
      latestSeasonOnly: latestSeasonPlayersOnly,
      limit: playerStatsLimit,
    });
    onProgress?.(
      `  enriching player stats for ${targets.length} matches…`,
    );
    const players = await enrichSource.loadPlayerStatsForMatches(targets);
    merged.players = players.players;
    merged.playerMatchStats = players.playerMatchStats;
    merged.lineups = players.lineups;
  }

  return merged;
}

export function competitionIsInternational(c: Competition): boolean {
  return c.international === true;
}

function emptySyncResult(): SyncResult {
  return {
    competitions: [],
    seasons: [],
    teams: [],
    matches: [],
    players: [],
    playerMatchStats: [],
    lineups: [],
    injuries: [],
  };
}

function mergeSyncResults(a: SyncResult, b: SyncResult): SyncResult {
  const cache = mergeSyncResult(
    mergeSyncResult(emptyCache(), {
      ...a,
      players: a.players ?? [],
      playerMatchStats: a.playerMatchStats ?? [],
      lineups: a.lineups ?? [],
      injuries: a.injuries ?? [],
    }),
    {
      ...b,
      players: b.players ?? [],
      playerMatchStats: b.playerMatchStats ?? [],
      lineups: b.lineups ?? [],
      injuries: b.injuries ?? [],
    },
  );
  return {
    competitions: cache.competitions,
    seasons: cache.seasons,
    teams: cache.teams,
    matches: cache.matches,
    players: cache.players,
    playerMatchStats: cache.playerMatchStats,
    lineups: cache.lineups,
    injuries: cache.injuries,
  };
}

function pickMatchesForPlayerStats(
  result: SyncResult,
  opts: { latestSeasonOnly: boolean; limit: number },
) {
  const seasonsByComp = new Map<string, typeof result.seasons>();
  for (const s of result.seasons) {
    const list = seasonsByComp.get(s.competitionId) ?? [];
    list.push(s);
    seasonsByComp.set(s.competitionId, list);
  }

  const latestSeasonIds = new Set<string>();
  if (opts.latestSeasonOnly) {
    for (const [, seasons] of seasonsByComp) {
      // Season names are chronological enough for open-data labels; prefer last by name.
      const sorted = [...seasons].sort((a, b) => a.name.localeCompare(b.name));
      const latest = sorted[sorted.length - 1];
      if (latest) latestSeasonIds.add(latest.id);
    }
  }

  const candidates = result.matches
    .filter((m) => (opts.latestSeasonOnly ? latestSeasonIds.has(m.seasonId) : true))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  return candidates.slice(0, opts.limit);
}
