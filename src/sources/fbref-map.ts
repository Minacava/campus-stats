import { entityId } from "../ids.js";
import type { Competition, Match, Season, Team } from "../types.js";
import type { SyncResult } from "./types.js";
import type { FbrefScheduleRow } from "./fbref-parse.js";

const SOURCE = "fbref";

export interface FbrefCompetitionMeta {
  /** FBref competition id, e.g. "189". */
  fbrefCompetitionId: string;
  name: string;
  country?: string;
  /** Season display label, e.g. "2023/2024". */
  seasonName: string;
  /** Optional season path segment, e.g. "2023-2024". */
  seasonSlug?: string;
}

/** Map parsed FBref schedule rows into campo-stats canonical entities. */
export function mapFbrefScheduleToSyncResult(
  meta: FbrefCompetitionMeta,
  rows: FbrefScheduleRow[],
): SyncResult {
  const competitionId = entityId(SOURCE, "comp", meta.fbrefCompetitionId);
  const seasonKey = meta.seasonSlug ?? meta.seasonName.replace(/\//g, "-");
  const seasonId = entityId(SOURCE, "season", meta.fbrefCompetitionId, seasonKey);

  const competition: Competition = {
    id: competitionId,
    name: meta.name,
    country: meta.country,
    gender: "female",
    sources: [{ source: SOURCE, id: meta.fbrefCompetitionId }],
  };

  const season: Season = {
    id: seasonId,
    name: meta.seasonName,
    competitionId,
    sources: [{ source: SOURCE, id: `${meta.fbrefCompetitionId}:${seasonKey}` }],
  };

  const teams = new Map<string, Team>();
  const matches: Match[] = [];

  for (const row of rows) {
    const homeId = entityId(SOURCE, "team", row.homeTeamId);
    const awayId = entityId(SOURCE, "team", row.awayTeamId);
    teams.set(homeId, {
      id: homeId,
      name: row.homeTeamName,
      sources: [{ source: SOURCE, id: row.homeTeamId }],
    });
    teams.set(awayId, {
      id: awayId,
      name: row.awayTeamName,
      sources: [{ source: SOURCE, id: row.awayTeamId }],
    });

    const matchNativeId =
      row.matchId ??
      `${meta.fbrefCompetitionId}:${row.date ?? "undated"}:${row.homeTeamId}:${row.awayTeamId}`;

    matches.push({
      id: entityId(SOURCE, "match", matchNativeId),
      competitionId,
      seasonId,
      date: row.date,
      homeTeamId: homeId,
      awayTeamId: awayId,
      homeScore: row.homeScore,
      awayScore: row.awayScore,
      sources: [{ source: SOURCE, id: matchNativeId }],
    });
  }

  return {
    competitions: [competition],
    seasons: [season],
    teams: [...teams.values()],
    matches,
  };
}
