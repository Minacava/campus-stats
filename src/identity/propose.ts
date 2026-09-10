import type { CampoCache, Team } from "../types.js";
import { matchTeamsAcrossSources } from "./match.js";
import { applyIdentityRules } from "./rules.js";
import { upsertIdentities } from "./store.js";

function teamsForCompetition(cache: CampoCache, competitionName: string): Team[] {
  const competition = cache.competitions.find(
    (c) => c.name.toLowerCase() === competitionName.toLowerCase(),
  );
  if (!competition) return [];
  const ids = new Set<string>();
  for (const m of cache.matches) {
    if (m.competitionId !== competition.id) continue;
    ids.add(m.homeTeamId);
    ids.add(m.awayTeamId);
  }
  return cache.teams.filter((t) => ids.has(t.id));
}

/** Split cached teams by primary provenance source. */
export function partitionTeamsBySource(teams: Team[]): Map<string, Team[]> {
  const map = new Map<string, Team[]>();
  for (const team of teams) {
    const source = team.sources[0]?.source ?? "unknown";
    const list = map.get(source) ?? [];
    list.push(team);
    map.set(source, list);
  }
  return map;
}

/**
 * Propose identities between the first two source cohorts present for a
 * competition (typically statsbomb vs fbref).
 */
export function proposeIdentitiesForCompetition(
  cache: CampoCache,
  competitionName: string,
): CampoCache {
  const teams = teamsForCompetition(cache, competitionName);
  const bySource = [...partitionTeamsBySource(teams).entries()];
  if (bySource.length < 2) {
    throw new Error(
      `Need teams from at least two sources in cache for "${competitionName}" before proposing identities.`,
    );
  }
  const [, left] = bySource[0]!;
  const [, right] = bySource[1]!;
  const candidates = matchTeamsAcrossSources(left, right, {
    competitionHint: competitionName,
  });
  const identities = applyIdentityRules(candidates, competitionName);
  return upsertIdentities(cache, identities);
}
