/**
 * StatsBomb adapter — free Open Data by default, optional paid API.
 *
 * Free (no login):
 *   https://github.com/statsbomb/open-data
 *   Credit StatsBomb in published analysis (https://statsbomb.com/media-pack/).
 *
 * Paid (customer login — same as statsbombpy):
 *   SB_USERNAME + SB_PASSWORD → https://data.statsbombservices.com
 *   Coverage and freshness follow your StatsBomb contract.
 *
 * Women's competitions only (`competition_gender === "female"`).
 */

import type { LineupEntry, Match, Player, PlayerMatchStats } from "../types.js";
import {
  DEFAULT_STATSBOMB_API_BASE,
  type StatsBombCredentials,
} from "../credentials.js";
import { aggregateStatsBombPlayerMatch } from "./statsbomb-player-stats.js";
import type { FootballSource, SyncResult } from "./types.js";
import { entityId } from "../ids.js";
import type {
  Competition,
  Season,
  Team,
  TeamKind,
} from "../types.js";

import {
  statsBombPaidUrls,
  type StatsBombPaidExtras,
  paidExtrasSummary,
} from "./statsbomb-endpoints.js";

const SOURCE = "statsbomb";
const OPEN_DATA_BASE =
  "https://raw.githubusercontent.com/statsbomb/open-data/master/data";

export type StatsBombAccessMode = "open-data" | "paid";

export interface WomenCompetitionInfo {
  id: number;
  name: string;
  country: string;
  international: boolean;
  seasons: Array<{ id: number; name: string }>;
}

interface SbCompetition {
  competition_id: number;
  season_id: number;
  country_name: string;
  competition_name: string;
  competition_gender: string;
  competition_international?: boolean;
  season_name: string;
}

interface SbMatch {
  match_id: number;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  competition: { competition_id: number; competition_name: string; country_name: string };
  season: { season_id: number; season_name: string };
  home_team: {
    home_team_id: number;
    home_team_name: string;
    country?: { name?: string };
  };
  away_team: {
    away_team_id: number;
    away_team_name: string;
    country?: { name?: string };
  };
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function asArray<T>(payload: T[] | Record<string, T> | null | undefined): T[] {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  return Object.values(payload);
}

function basicAuthHeader(username: string, password: string): string {
  return `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
}

export interface StatsBombSourceOptions {
  /**
   * Customer login for the paid StatsBomb API. When both username and
   * password are set, Campus hits data.statsbombservices.com instead of
   * free Open Data.
   */
  credentials?: StatsBombCredentials;
  /**
   * Override open-data root (default: GitHub raw master/data).
   * Alias: `baseUrl` (kept for fixtures / existing callers).
   */
  openDataBaseUrl?: string;
  /** @deprecated Prefer `openDataBaseUrl`. */
  baseUrl?: string;
  /** Override paid API host (default: data.statsbombservices.com). */
  apiBaseUrl?: string;
  /** Inject fetch for offline fixtures / tests. */
  fetchJson?: <T>(url: string) => Promise<T>;
  /** When true, also pull lineups/events and aggregate v1 player stats. */
  includePlayerStats?: boolean;
  /** Cap matches enriched with player stats (default 5). */
  playerStatsLimit?: number;
  /**
   * Optional paid-only endpoints (aggregates, 360, …). Ignored in open-data
   * mode. Requires a StatsBomb customer login + licence that includes them.
   */
  paidExtras?: StatsBombPaidExtras;
}

async function defaultOpenFetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`StatsBomb fetch failed (${res.status}): ${url}`);
  }
  return (await res.json()) as T;
}

export class StatsBombSource implements FootballSource {
  readonly id = SOURCE;
  readonly accessMode: StatsBombAccessMode;
  private readonly openDataBaseUrl: string;
  private readonly apiBaseUrl: string;
  private readonly username?: string;
  private readonly password?: string;
  private readonly fetchJson: <T>(url: string) => Promise<T>;
  private readonly includePlayerStats: boolean;
  private readonly playerStatsLimit: number;
  private readonly paidExtras: StatsBombPaidExtras;

  constructor(options: StatsBombSourceOptions = {}) {
    const username = options.credentials?.username?.trim();
    const password = options.credentials?.password?.trim();
    this.accessMode = username && password ? "paid" : "open-data";
    this.username = username;
    this.password = password;
    this.openDataBaseUrl =
      options.openDataBaseUrl ?? options.baseUrl ?? OPEN_DATA_BASE;
    this.apiBaseUrl = (
      options.apiBaseUrl ??
      options.credentials?.apiBaseUrl ??
      DEFAULT_STATSBOMB_API_BASE
    ).replace(/\/$/, "");
    this.includePlayerStats = options.includePlayerStats ?? false;
    this.playerStatsLimit = options.playerStatsLimit ?? 5;
    this.paidExtras = options.paidExtras ?? {};

    if (options.fetchJson) {
      this.fetchJson = options.fetchJson;
    } else if (this.accessMode === "paid") {
      const user = username!;
      const pass = password!;
      this.fetchJson = async <T>(url: string): Promise<T> => {
        const res = await fetch(url, {
          headers: {
            accept: "application/json",
            authorization: basicAuthHeader(user, pass),
            "user-agent":
              "campus-stats (StatsBomb customer BYOK; +https://github.com/Minacava/campus-stats)",
          },
        });
        if (!res.ok) {
          throw new Error(
            `StatsBomb paid API HTTP ${res.status} for ${url}. ` +
              `Check SB_USERNAME / SB_PASSWORD and that your contract covers this endpoint.`,
          );
        }
        return (await res.json()) as T;
      };
    } else {
      this.fetchJson = defaultOpenFetchJson;
    }
  }

  private paidUrls() {
    return statsBombPaidUrls(this.apiBaseUrl);
  }

  private competitionsUrl(): string {
    if (this.accessMode === "paid") {
      return this.paidUrls().competitions();
    }
    return `${this.openDataBaseUrl}/competitions.json`;
  }

  private matchesUrl(competitionId: number, seasonId: number): string {
    if (this.accessMode === "paid") {
      return this.paidUrls().matches(competitionId, seasonId);
    }
    return `${this.openDataBaseUrl}/matches/${competitionId}/${seasonId}.json`;
  }

  private lineupsUrl(matchId: string): string {
    if (this.accessMode === "paid") {
      return this.paidUrls().lineups(matchId);
    }
    return `${this.openDataBaseUrl}/lineups/${matchId}.json`;
  }

  private eventsUrl(matchId: string): string {
    if (this.accessMode === "paid") {
      return this.paidUrls().events(matchId);
    }
    return `${this.openDataBaseUrl}/events/${matchId}.json`;
  }

  /** Catalogue of women's competitions (clubs + national-team tournaments). */
  async listWomenCompetitions(): Promise<WomenCompetitionInfo[]> {
    const all = asArray(
      await this.fetchJson<SbCompetition[] | Record<string, SbCompetition>>(
        this.competitionsUrl(),
      ),
    );
    const byId = new Map<number, WomenCompetitionInfo>();
    for (const row of all) {
      if (row.competition_gender !== "female") continue;
      const existing = byId.get(row.competition_id);
      if (!existing) {
        byId.set(row.competition_id, {
          id: row.competition_id,
          name: row.competition_name,
          country: row.country_name,
          international: Boolean(row.competition_international),
          seasons: [{ id: row.season_id, name: row.season_name }],
        });
      } else {
        existing.seasons.push({ id: row.season_id, name: row.season_name });
      }
    }
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  async syncCompetition(competitionName: string): Promise<SyncResult> {
    const all = asArray(
      await this.fetchJson<SbCompetition[] | Record<string, SbCompetition>>(
        this.competitionsUrl(),
      ),
    );
    const rows = all.filter(
      (c) =>
        c.competition_gender === "female" &&
        normalizeName(c.competition_name) === normalizeName(competitionName),
    );

    if (rows.length === 0) {
      const available = [
        ...new Set(
          all
            .filter((c) => c.competition_gender === "female")
            .map((c) => c.competition_name),
        ),
      ].sort();
      const modeHint =
        this.accessMode === "paid"
          ? "StatsBomb paid API (your contract coverage)"
          : "StatsBomb Open Data";
      throw new Error(
        `Competition not found in ${modeHint}: "${competitionName}". ` +
          `Available: ${available.join(", ") || "(none)"}`,
      );
    }

    const competitions = new Map<string, Competition>();
    const seasons = new Map<string, Season>();
    const teams = new Map<string, Team>();
    const matches: Match[] = [];

    for (const row of rows) {
      const competitionId = entityId(SOURCE, "comp", row.competition_id);
      const international = Boolean(row.competition_international);
      const teamKind: TeamKind = international ? "national" : "club";
      competitions.set(competitionId, {
        id: competitionId,
        name: row.competition_name,
        country: row.country_name,
        gender: "female",
        international,
        sources: [{ source: SOURCE, id: String(row.competition_id) }],
      });

      const seasonId = entityId(
        SOURCE,
        "season",
        row.competition_id,
        row.season_id,
      );
      seasons.set(seasonId, {
        id: seasonId,
        name: row.season_name,
        competitionId,
        sources: [
          {
            source: SOURCE,
            id: `${row.competition_id}:${row.season_id}`,
          },
        ],
      });

      const matchRows = asArray(
        await this.fetchJson<SbMatch[] | Record<string, SbMatch>>(
          this.matchesUrl(row.competition_id, row.season_id),
        ),
      );

      for (const m of matchRows) {
        const homeId = entityId(SOURCE, "team", m.home_team.home_team_id);
        const awayId = entityId(SOURCE, "team", m.away_team.away_team_id);

        teams.set(homeId, {
          id: homeId,
          name: m.home_team.home_team_name,
          country: m.home_team.country?.name,
          kind: teamKind,
          sources: [{ source: SOURCE, id: String(m.home_team.home_team_id) }],
        });
        teams.set(awayId, {
          id: awayId,
          name: m.away_team.away_team_name,
          country: m.away_team.country?.name,
          kind: teamKind,
          sources: [{ source: SOURCE, id: String(m.away_team.away_team_id) }],
        });

        matches.push({
          id: entityId(SOURCE, "match", m.match_id),
          competitionId,
          seasonId,
          date: m.match_date,
          homeTeamId: homeId,
          awayTeamId: awayId,
          homeScore: m.home_score,
          awayScore: m.away_score,
          sources: [{ source: SOURCE, id: String(m.match_id) }],
        });
      }
    }

    const result: SyncResult = {
      competitions: [...competitions.values()],
      seasons: [...seasons.values()],
      teams: [...teams.values()],
      matches,
    };

    if (this.includePlayerStats) {
      const enriched = await this.loadPlayerStatsForMatches(
        matches.slice(0, this.playerStatsLimit),
      );
      result.players = enriched.players;
      result.playerMatchStats = enriched.playerMatchStats;
      result.lineups = enriched.lineups;
    }

    return result;
  }

  /**
   * Hit optional paid-only endpoints for a sample competition/season/match.
   * Confirms the licence covers them; Campus does not yet map these into the
   * canonical schema (probe only).
   */
  async probePaidExtras(context: {
    competitionId: number;
    seasonId: number;
    matchId?: string | number;
  }): Promise<
    Array<{
      id: string;
      ok: boolean;
      url: string;
      itemCount?: number;
      error?: string;
      mappedToCampusSchema: false;
    }>
  > {
    const enabled = paidExtrasSummary(this.paidExtras);
    if (enabled.length === 0) return [];
    if (this.accessMode !== "paid") {
      throw new Error(
        `Paid extras (${enabled.join(", ")}) need SB_USERNAME / SB_PASSWORD. ` +
          `See docs/statsbomb-endpoints.md.`,
      );
    }

    const urls = this.paidUrls();
    const jobs: Array<{ id: string; url: string }> = [];
    if (this.paidExtras.playerSeasonStats) {
      jobs.push({
        id: "playerSeasonStats",
        url: urls.playerSeasonStats(context.competitionId, context.seasonId),
      });
    }
    if (this.paidExtras.teamSeasonStats) {
      jobs.push({
        id: "teamSeasonStats",
        url: urls.teamSeasonStats(context.competitionId, context.seasonId),
      });
    }
    if (context.matchId != null) {
      if (this.paidExtras.playerMatchStats) {
        jobs.push({
          id: "playerMatchStats",
          url: urls.playerMatchStats(context.matchId),
        });
      }
      if (this.paidExtras.teamMatchStats) {
        jobs.push({
          id: "teamMatchStats",
          url: urls.teamMatchStats(context.matchId),
        });
      }
      if (this.paidExtras.frames360) {
        jobs.push({
          id: "frames360",
          url: urls.frames360(context.matchId),
        });
      }
    }

    const out: Array<{
      id: string;
      ok: boolean;
      url: string;
      itemCount?: number;
      error?: string;
      mappedToCampusSchema: false;
    }> = [];

    for (const job of jobs) {
      try {
        const payload = await this.fetchJson<unknown>(job.url);
        const itemCount = Array.isArray(payload)
          ? payload.length
          : payload && typeof payload === "object"
            ? Object.keys(payload as object).length
            : undefined;
        out.push({
          id: job.id,
          ok: true,
          url: job.url,
          itemCount,
          mappedToCampusSchema: false,
        });
      } catch (err) {
        out.push({
          id: job.id,
          ok: false,
          url: job.url,
          error: err instanceof Error ? err.message : String(err),
          mappedToCampusSchema: false,
        });
      }
    }
    return out;
  }

  /** Load aggregated v1 player stats + lineups for the given canonical matches. */
  async loadPlayerStatsForMatches(
    matches: Match[],
  ): Promise<{
    players: Player[];
    playerMatchStats: PlayerMatchStats[];
    lineups: LineupEntry[];
  }> {
    const players = new Map<string, Player>();
    const playerMatchStats: PlayerMatchStats[] = [];
    const lineupEntries: LineupEntry[] = [];

    for (const match of matches) {
      const nativeId = match.sources.find((s) => s.source === SOURCE)?.id;
      if (!nativeId) continue;
      const lineups = asArray(
        await this.fetchJson<
          | Array<{
              team_id: number;
              team_name: string;
              lineup: Array<{
                player_id: number;
                player_name: string;
                player_nickname?: string | null;
                jersey_number?: number | null;
                country?: { name?: string };
                cards?: Array<{ card_type?: string }>;
                positions?: Array<{ from?: string | null; to?: string | null }>;
              }>;
            }>
          | Record<string, unknown>
        >(this.lineupsUrl(nativeId)),
      ) as Array<{
        team_id: number;
        team_name: string;
        lineup: Array<{
          player_id: number;
          player_name: string;
          player_nickname?: string | null;
          jersey_number?: number | null;
          country?: { name?: string };
          cards?: Array<{ card_type?: string }>;
          positions?: Array<{ from?: string | null; to?: string | null }>;
        }>;
      }>;
      const events = asArray(
        await this.fetchJson<
          | Array<{
              type?: { name?: string };
              player?: { id?: number; name?: string };
              team?: { id?: number; name?: string };
              shot?: { outcome?: { name?: string } };
              pass?: { goal_assist?: boolean };
            }>
          | Record<string, unknown>
        >(this.eventsUrl(nativeId)),
      ) as Array<{
        type?: { name?: string };
        player?: { id?: number; name?: string };
        team?: { id?: number; name?: string };
        shot?: { outcome?: { name?: string } };
        pass?: { goal_assist?: boolean };
      }>;

      const agg = aggregateStatsBombPlayerMatch(match.id, lineups, events);
      for (const p of agg.players) players.set(p.id, p);
      playerMatchStats.push(...agg.playerMatchStats);
      lineupEntries.push(...agg.lineups);
    }

    return {
      players: [...players.values()],
      playerMatchStats,
      lineups: lineupEntries,
    };
  }
}
