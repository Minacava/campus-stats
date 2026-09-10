#!/usr/bin/env node
import {
  cachePath,
  loadCache,
  mergeSyncResult,
  saveCache,
} from "./cache.js";
import { StatsBombSource } from "./sources/statsbomb.js";
import type { CampoCache } from "./types.js";

function usage(): never {
  console.error(`campo-stats — women's football data CLI

Usage:
  campo-stats sync --competition <name>
  campo-stats competitions
  campo-stats seasons --competition <name>
  campo-stats teams --competition <name>
  campo-stats matches --competition <name> [--season <name>] [--team <name>]

Options:
  --competition <name>  Competition display name (e.g. "Liga F")
  --season <name>       Season label (e.g. "2023/2024")
  --team <name>         Team name substring (case-insensitive)
  --help                Show this help
`);
  process.exit(1);
}

function getFlag(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  const value = args[idx + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}`);
  }
  return value;
}

function includesCI(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function requireCompetition(cache: CampoCache, name: string) {
  const competition = cache.competitions.find((c) =>
    includesCI(c.name, name) || c.name.toLowerCase() === name.toLowerCase(),
  );
  const exact = cache.competitions.find(
    (c) => c.name.toLowerCase() === name.toLowerCase(),
  );
  const chosen = exact ?? competition;
  if (!chosen) {
    throw new Error(
      `Competition not in cache: "${name}". Run sync --competition first.`,
    );
  }
  return chosen;
}

async function cmdSync(args: string[]): Promise<void> {
  const competition = getFlag(args, "--competition");
  if (!competition) usage();

  const source = new StatsBombSource();
  console.error(`Syncing "${competition}" from ${source.id}…`);
  const result = await source.syncCompetition(competition);
  const cache = mergeSyncResult(await loadCache(), result);
  await saveCache(cache);

  console.log(
    JSON.stringify(
      {
        cache: cachePath(),
        competition: result.competitions[0]?.name,
        seasons: result.seasons.length,
        teams: result.teams.length,
        matches: result.matches.length,
        totals: {
          competitions: cache.competitions.length,
          seasons: cache.seasons.length,
          teams: cache.teams.length,
          matches: cache.matches.length,
        },
      },
      null,
      2,
    ),
  );
}

async function cmdCompetitions(): Promise<void> {
  const cache = await loadCache();
  console.log(
    JSON.stringify(
      cache.competitions.map((c) => ({
        id: c.id,
        name: c.name,
        country: c.country,
      })),
      null,
      2,
    ),
  );
}

async function cmdSeasons(args: string[]): Promise<void> {
  const name = getFlag(args, "--competition");
  if (!name) usage();
  const cache = await loadCache();
  const competition = requireCompetition(cache, name);
  const seasons = cache.seasons.filter((s) => s.competitionId === competition.id);
  console.log(
    JSON.stringify(
      seasons.map((s) => ({ id: s.id, name: s.name, competition: competition.name })),
      null,
      2,
    ),
  );
}

async function cmdTeams(args: string[]): Promise<void> {
  const name = getFlag(args, "--competition");
  if (!name) usage();
  const cache = await loadCache();
  const competition = requireCompetition(cache, name);
  const seasonIds = new Set(
    cache.seasons
      .filter((s) => s.competitionId === competition.id)
      .map((s) => s.id),
  );
  const teamIds = new Set<string>();
  for (const m of cache.matches) {
    if (m.competitionId === competition.id && seasonIds.has(m.seasonId)) {
      teamIds.add(m.homeTeamId);
      teamIds.add(m.awayTeamId);
    }
  }
  const teams = cache.teams
    .filter((t) => teamIds.has(t.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  console.log(
    JSON.stringify(
      teams.map((t) => ({ id: t.id, name: t.name, country: t.country })),
      null,
      2,
    ),
  );
}

async function cmdMatches(args: string[]): Promise<void> {
  const competitionName = getFlag(args, "--competition");
  if (!competitionName) usage();
  const seasonName = getFlag(args, "--season");
  const teamName = getFlag(args, "--team");

  const cache = await loadCache();
  const competition = requireCompetition(cache, competitionName);
  let seasonId: string | undefined;
  if (seasonName) {
    const season = cache.seasons.find(
      (s) =>
        s.competitionId === competition.id &&
        s.name.toLowerCase() === seasonName.toLowerCase(),
    );
    if (!season) {
      throw new Error(`Season not in cache: "${seasonName}"`);
    }
    seasonId = season.id;
  }

  const teamById = new Map(cache.teams.map((t) => [t.id, t]));
  const seasonById = new Map(cache.seasons.map((s) => [s.id, s]));

  const matches = cache.matches.filter((m) => {
    if (m.competitionId !== competition.id) return false;
    if (seasonId && m.seasonId !== seasonId) return false;
    if (teamName) {
      const home = teamById.get(m.homeTeamId)?.name ?? "";
      const away = teamById.get(m.awayTeamId)?.name ?? "";
      if (!includesCI(home, teamName) && !includesCI(away, teamName)) {
        return false;
      }
    }
    return true;
  });

  console.log(
    JSON.stringify(
      matches.map((m) => ({
        id: m.id,
        date: m.date,
        season: seasonById.get(m.seasonId)?.name,
        home: teamById.get(m.homeTeamId)?.name,
        away: teamById.get(m.awayTeamId)?.name,
        score:
          m.homeScore == null || m.awayScore == null
            ? null
            : `${m.homeScore}-${m.awayScore}`,
      })),
      null,
      2,
    ),
  );
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;
  if (!command || command === "--help" || args.includes("--help")) usage();

  switch (command) {
    case "sync":
      await cmdSync(args);
      break;
    case "competitions":
      await cmdCompetitions();
      break;
    case "seasons":
      await cmdSeasons(args);
      break;
    case "teams":
      await cmdTeams(args);
      break;
    case "matches":
      await cmdMatches(args);
      break;
    default:
      usage();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
