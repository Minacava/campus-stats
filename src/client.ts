/**
 * App-facing client: install `campus` and use this from a web API,
 * serverless function, or Node backend. Browser bundles can import query
 * helpers against an in-memory cache loaded via `fromBundle` / `fromCache`.
 */

import {
  emptyCache,
  loadCache,
  mergeSyncResult,
  saveCache,
  cachePath,
} from "./cache.js";
import { dataBundleUrl } from "./data-bundle.js";
import {
  syncFantasyBundle,
  updateCachedCompetitions,
  type FantasySyncOptions,
} from "./fantasy.js";
import {
  DEFAULT_FANTASY_RULES,
  scoreFantasyPoints,
  type FantasyPointRow,
  type FantasyScoringRules,
} from "./scoring.js";
import type {
  CampusCache,
  Competition,
  LineupEntry,
  Match,
  Player,
  PlayerMatchStats,
  Season,
  Team,
} from "./types.js";

export interface SquadMember {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  appearances: number;
}

function includesCI(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export class CampusClient {
  private cache: CampusCache;
  private readonly persistPath?: string;

  private constructor(cache: CampusCache, persistPath?: string) {
    this.cache = cache;
    this.persistPath = persistPath;
  }

  /** Open local JSON cache (default `.campus/cache.json`). */
  static async open(filePath: string = cachePath()): Promise<CampusClient> {
    return new CampusClient(await loadCache(filePath), filePath);
  }

  /** Use an in-memory cache (e.g. after fetch in an API route). */
  static fromCache(cache: CampusCache): CampusClient {
    return new CampusClient(cache);
  }

  /** Download the cron-published bundle and optionally merge with local cache. */
  static async fromBundle(options: {
    url?: string;
    mergeWith?: CampusCache;
    persistPath?: string;
  } = {}): Promise<CampusClient> {
    const url = options.url ?? dataBundleUrl();
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `Failed to load data bundle (${res.status}) from ${url}. ` +
          "Publish via GitHub Actions schedule (docs/cron.md) or call syncFantasy() once.",
      );
    }
    const remote = (await res.json()) as Partial<CampusCache>;
    const incoming: CampusCache = {
      ...emptyCache(),
      competitions: remote.competitions ?? [],
      seasons: remote.seasons ?? [],
      teams: remote.teams ?? [],
      matches: remote.matches ?? [],
      identities: remote.identities ?? [],
      players: remote.players ?? [],
      playerMatchStats: remote.playerMatchStats ?? [],
      lineups: remote.lineups ?? [],
    };
    const base = options.mergeWith ?? emptyCache();
    const merged = mergeSyncResult(base, {
      competitions: incoming.competitions,
      seasons: incoming.seasons,
      teams: incoming.teams,
      matches: incoming.matches,
      players: incoming.players,
      playerMatchStats: incoming.playerMatchStats,
      lineups: incoming.lineups,
    });
    merged.identities =
      base.identities.length > 0 ? base.identities : incoming.identities;
    const client = new CampusClient(merged, options.persistPath);
    if (options.persistPath) await client.save();
    return client;
  }

  /** Snapshot of normalized data (safe to serialize to the browser). */
  get data(): CampusCache {
    return this.cache;
  }

  async save(filePath: string = this.persistPath ?? cachePath()): Promise<void> {
    await saveCache(this.cache, filePath);
  }

  /** Sync every women's StatsBomb competition (clubs + national teams). */
  async syncFantasy(options: FantasySyncOptions = {}): Promise<CampusCache> {
    const result = await syncFantasyBundle(options);
    this.cache = mergeSyncResult(this.cache, result);
    if (this.persistPath) await this.save();
    return this.cache;
  }

  /** Re-sync competitions already present in the cache. */
  async update(options: FantasySyncOptions = {}): Promise<CampusCache> {
    const result = await updateCachedCompetitions(this.cache, options);
    this.cache = mergeSyncResult(this.cache, result);
    if (this.persistPath) await this.save();
    return this.cache;
  }

  /** Pull the published cron bundle into this client. */
  async pull(url?: string): Promise<CampusCache> {
    const next = await CampusClient.fromBundle({
      url,
      mergeWith: this.cache,
      persistPath: this.persistPath,
    });
    this.cache = next.data;
    return this.cache;
  }

  competitions(filter?: { name?: string; international?: boolean }): Competition[] {
    return this.cache.competitions.filter((c) => {
      if (filter?.name && !includesCI(c.name, filter.name)) return false;
      if (
        filter?.international != null &&
        Boolean(c.international) !== filter.international
      ) {
        return false;
      }
      return true;
    });
  }

  seasons(filter?: { competition?: string }): Season[] {
    const competitionIds = filter?.competition
      ? new Set(this.competitions({ name: filter.competition }).map((c) => c.id))
      : null;
    return this.cache.seasons.filter((s) =>
      competitionIds ? competitionIds.has(s.competitionId) : true,
    );
  }

  teams(filter?: { competition?: string; kind?: Team["kind"]; name?: string }): Team[] {
    let teamIds: Set<string> | null = null;
    if (filter?.competition) {
      const comps = this.competitions({ name: filter.competition });
      const ids = new Set(comps.map((c) => c.id));
      teamIds = new Set<string>();
      for (const m of this.cache.matches) {
        if (!ids.has(m.competitionId)) continue;
        teamIds.add(m.homeTeamId);
        teamIds.add(m.awayTeamId);
      }
    }
    return this.cache.teams.filter((t) => {
      if (teamIds && !teamIds.has(t.id)) return false;
      if (filter?.kind && t.kind !== filter.kind) return false;
      if (filter?.name && !includesCI(t.name, filter.name)) return false;
      return true;
    });
  }

  matches(filter?: {
    competition?: string;
    season?: string;
    team?: string;
  }): Match[] {
    const comps = filter?.competition
      ? this.competitions({ name: filter.competition })
      : this.cache.competitions;
    const competitionIds = new Set(comps.map((c) => c.id));
    let seasonIds: Set<string> | null = null;
    if (filter?.season) {
      seasonIds = new Set(
        this.cache.seasons
          .filter(
            (s) =>
              competitionIds.has(s.competitionId) &&
              s.name.toLowerCase() === filter.season!.toLowerCase(),
          )
          .map((s) => s.id),
      );
    }
    const teamById = new Map(this.cache.teams.map((t) => [t.id, t]));
    return this.cache.matches.filter((m) => {
      if (!competitionIds.has(m.competitionId)) return false;
      if (seasonIds && !seasonIds.has(m.seasonId)) return false;
      if (filter?.team) {
        const home = teamById.get(m.homeTeamId)?.name ?? "";
        const away = teamById.get(m.awayTeamId)?.name ?? "";
        if (!includesCI(home, filter.team) && !includesCI(away, filter.team)) {
          return false;
        }
      }
      return true;
    });
  }

  players(filter?: { name?: string; team?: string }): Player[] {
    let playerIds: Set<string> | null = null;
    if (filter?.team) {
      const teams = this.teams({ name: filter.team });
      const teamIds = new Set(teams.map((t) => t.id));
      playerIds = new Set(
        this.cache.playerMatchStats
          .filter((s) => teamIds.has(s.teamId))
          .map((s) => s.playerId),
      );
    }
    return this.cache.players.filter((p) => {
      if (filter?.name && !includesCI(p.name, filter.name)) return false;
      if (playerIds && !playerIds.has(p.id)) return false;
      return true;
    });
  }

  playerStats(filter?: {
    competition?: string;
    matchId?: string;
    player?: string;
    team?: string;
  }): PlayerMatchStats[] {
    const matchIds = new Set(
      this.matches({ competition: filter?.competition }).map((m) => m.id),
    );
    const playerById = new Map(this.cache.players.map((p) => [p.id, p]));
    const teamById = new Map(this.cache.teams.map((t) => [t.id, t]));
    return this.cache.playerMatchStats.filter((s) => {
      if (!matchIds.has(s.matchId)) return false;
      if (filter?.matchId && s.matchId !== filter.matchId) return false;
      if (filter?.player) {
        const name = playerById.get(s.playerId)?.name ?? "";
        if (!includesCI(name, filter.player)) return false;
      }
      if (filter?.team) {
        const name = teamById.get(s.teamId)?.name ?? "";
        if (!includesCI(name, filter.team)) return false;
      }
      return true;
    });
  }

  lineups(filter?: { matchId?: string; team?: string }): LineupEntry[] {
    const teamById = new Map(this.cache.teams.map((t) => [t.id, t]));
    return this.cache.lineups.filter((l) => {
      if (filter?.matchId && l.matchId !== filter.matchId) return false;
      if (filter?.team) {
        const name = teamById.get(l.teamId)?.name ?? "";
        if (!includesCI(name, filter.team)) return false;
      }
      return true;
    });
  }

  /** Season squad = distinct players who appeared in lineups for a team. */
  squad(filter: {
    competition: string;
    team: string;
    season?: string;
  }): SquadMember[] {
    const matchIds = new Set(
      this.matches({
        competition: filter.competition,
        season: filter.season,
        team: filter.team,
      }).map((m) => m.id),
    );
    const team = this.teams({
      competition: filter.competition,
      name: filter.team,
    })[0];
    if (!team) return [];
    const playerById = new Map(this.cache.players.map((p) => [p.id, p]));
    const counts = new Map<string, number>();
    for (const l of this.cache.lineups) {
      if (l.teamId !== team.id || !matchIds.has(l.matchId)) continue;
      counts.set(l.playerId, (counts.get(l.playerId) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([playerId, appearances]) => ({
        playerId,
        playerName: playerById.get(playerId)?.name ?? playerId,
        teamId: team.id,
        teamName: team.name,
        appearances,
      }))
      .sort((a, b) => a.playerName.localeCompare(b.playerName));
  }

  fantasyPoints(filter?: {
    competition?: string;
    matchId?: string;
    player?: string;
    team?: string;
    rules?: FantasyScoringRules;
  }): FantasyPointRow[] {
    const comps = filter?.competition
      ? this.competitions({ name: filter.competition })
      : [];
    const competitionId = comps[0]?.id;
    const players = filter?.player ? this.players({ name: filter.player }) : [];
    const teams = filter?.team ? this.teams({ name: filter.team }) : [];
    return scoreFantasyPoints(this.cache, {
      competitionId,
      matchId: filter?.matchId,
      playerId: players[0]?.id,
      teamId: teams[0]?.id,
      rules: filter?.rules ?? DEFAULT_FANTASY_RULES,
    });
  }
}
