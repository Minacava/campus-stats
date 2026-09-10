/**
 * StatsBomb Open Data adapter.
 *
 * Upstream: https://github.com/statsbomb/open-data
 * Free for research and genuine football-analytics use. If you publish
 * analysis built on this data, credit StatsBomb
 * (https://statsbomb.com/media-pack/). Pass that requirement downstream.
 *
 * This adapter only surfaces women's competitions
 * (`competition_gender === "female"`).
 */

import { entityId } from "../ids.js";
import type { Competition, Match, Season, Team } from "../types.js";
import type { FootballSource, SyncResult } from "./types.js";

const SOURCE = "statsbomb";
const BASE =
  "https://raw.githubusercontent.com/statsbomb/open-data/master/data";

interface SbCompetition {
  competition_id: number;
  season_id: number;
  country_name: string;
  competition_name: string;
  competition_gender: string;
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

export interface StatsBombSourceOptions {
  /** Override open-data root (default: GitHub raw master/data). */
  baseUrl?: string;
  /** Inject fetch for offline fixtures / tests. */
  fetchJson?: <T>(url: string) => Promise<T>;
}

async function defaultFetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`StatsBomb fetch failed (${res.status}): ${url}`);
  }
  return (await res.json()) as T;
}

export class StatsBombSource implements FootballSource {
  readonly id = SOURCE;
  private readonly baseUrl: string;
  private readonly fetchJson: <T>(url: string) => Promise<T>;

  constructor(options: StatsBombSourceOptions = {}) {
    this.baseUrl = options.baseUrl ?? BASE;
    this.fetchJson = options.fetchJson ?? defaultFetchJson;
  }

  async syncCompetition(competitionName: string): Promise<SyncResult> {
    const all = await this.fetchJson<SbCompetition[]>(
      `${this.baseUrl}/competitions.json`,
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
      throw new Error(
        `Competition not found in StatsBomb women's data: "${competitionName}". ` +
          `Available: ${available.join(", ")}`,
      );
    }

    const competitions = new Map<string, Competition>();
    const seasons = new Map<string, Season>();
    const teams = new Map<string, Team>();
    const matches: Match[] = [];

    for (const row of rows) {
      const competitionId = entityId(SOURCE, "comp", row.competition_id);
      competitions.set(competitionId, {
        id: competitionId,
        name: row.competition_name,
        country: row.country_name,
        gender: "female",
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

      const matchRows = await this.fetchJson<SbMatch[]>(
        `${this.baseUrl}/matches/${row.competition_id}/${row.season_id}.json`,
      );

      for (const m of matchRows) {
        const homeId = entityId(SOURCE, "team", m.home_team.home_team_id);
        const awayId = entityId(SOURCE, "team", m.away_team.away_team_id);

        teams.set(homeId, {
          id: homeId,
          name: m.home_team.home_team_name,
          country: m.home_team.country?.name,
          sources: [{ source: SOURCE, id: String(m.home_team.home_team_id) }],
        });
        teams.set(awayId, {
          id: awayId,
          name: m.away_team.away_team_name,
          country: m.away_team.country?.name,
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

    return {
      competitions: [...competitions.values()],
      seasons: [...seasons.values()],
      teams: [...teams.values()],
      matches,
    };
  }
}
