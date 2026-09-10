#!/usr/bin/env node
import { cachePath, emptyCache, mergeSyncResult } from "./cache.js";
import {
  dataBundleUrl,
  GITLAB_PROJECT_ID,
} from "./data-bundle.js";
import {
  readStore,
  resolveDbPath,
  resolveStoreMode,
  runMigrate,
  writeCacheToStore,
  writeSyncToStore,
  type StoreMode,
} from "./db/store-api.js";
import {
  FANTASY_PLAYER_STATS_LIMIT,
  listWomenCompetitions,
  syncFantasyBundle,
  updateCachedCompetitions,
} from "./fantasy.js";
import { CampoClient } from "./client.js";
import { INJURIES_STATUS_MESSAGE } from "./injuries.js";
import { proposeIdentitiesForCompetition } from "./identity/propose.js";
import { setIdentityStatus } from "./identity/store.js";
import { FbrefSource } from "./sources/fbref.js";
import { StatsBombSource } from "./sources/statsbomb.js";
import type { FootballSource } from "./sources/types.js";
import type { CampoCache } from "./types.js";

let storeMode: StoreMode = "json";
let dbPath = ".campo-stats/campo-stats.sqlite";

function usage(): never {
  console.error(`campo-stats — women's football data CLI

Usage:
  campo-stats sync --fantasy|--all [--with-players] [--player-stats-limit <n>]
  campo-stats sync --competition <name> [--source statsbomb|fbref] [--with-players] [--player-stats-limit <n>]
  campo-stats update [--with-players] [--player-stats-limit <n>]
  campo-stats pull [--url <cache.json url>]
  campo-stats available
  campo-stats competitions
  campo-stats seasons --competition <name>
  campo-stats teams --competition <name>
  campo-stats matches --competition <name> [--season <name>] [--team <name>]
  campo-stats players [--team <name>] [--name <name>]
  campo-stats player-stats [--competition <name>] [--match <id>] [--player <name>] [--team <name>]
  campo-stats lineups [--match <id>] [--team <name>]
  campo-stats squad --competition <name> --team <name> [--season <name>]
  campo-stats fantasy-points [--competition <name>] [--player <name>] [--match <id>]
  campo-stats injuries
  campo-stats identities [--status resolved|pending|rejected]
  campo-stats identities propose --competition <name>
  campo-stats identities confirm --id <identityId>
  campo-stats identities reject --id <identityId>
  campo-stats migrate [--db <path>]

Options:
  --fantasy / --all          Sync all StatsBomb women's comps (clubs + national teams)
  --competition <name>       Competition display name (e.g. "Liga F")
  --source <id>              Data source for sync (default: statsbomb)
  --with-players             StatsBomb only: also sync v1 player match stats
  --player-stats-limit <n>   Max matches to enrich (default 5; fantasy default 25)
  --url <url>                Override data-bundle URL for pull
  --season <name>            Season label (e.g. "2023/2024")
  --team <name>              Team name substring (case-insensitive)
  --player <name>            Player name substring
  --name <name>              Player name substring (players command)
  --match <id>               Match id filter
  --status <status>          Filter identities list
  --id <identityId>          Identity id for confirm/reject
  --sqlite                   Use SQLite store (default path .campo-stats/campo-stats.sqlite)
  --db <path>                SQLite database path (implies --sqlite)
  --json                     Force JSON cache (default)
  --help                     Show this help

Periodic refresh: see docs/cron.md (GitLab CI schedule + campo-stats pull).
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

function hasFlag(args: string[], name: string): boolean {
  return args.includes(name);
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
  const fantasy = hasFlag(args, "--fantasy") || hasFlag(args, "--all");
  const competition = getFlag(args, "--competition");
  const withPlayers = hasFlag(args, "--with-players");
  const limitRaw = getFlag(args, "--player-stats-limit");
  const playerStatsLimit = limitRaw
    ? Number(limitRaw)
    : fantasy
      ? FANTASY_PLAYER_STATS_LIMIT
      : 5;

  if (fantasy) {
    if (competition) {
      throw new Error("Use either --fantasy/--all or --competition, not both.");
    }
    console.error("Syncing fantasy bundle (all StatsBomb women's competitions)…");
    const result = await syncFantasyBundle({
      includePlayerStats: withPlayers,
      playerStatsLimit,
      latestSeasonPlayersOnly: true,
      onProgress: (msg) => console.error(msg),
    });
    const cache = await writeSyncToStore(storeMode, dbPath, result);
    printSyncSummary("statsbomb", result, cache);
    return;
  }

  if (!competition) usage();
  const sourceId = (getFlag(args, "--source") ?? "statsbomb").toLowerCase();

  let source: FootballSource;
  if (sourceId === "statsbomb") {
    source = new StatsBombSource({
      includePlayerStats: withPlayers,
      playerStatsLimit,
    });
  } else if (sourceId === "fbref") {
    if (withPlayers) {
      throw new Error(
        "FBref player stats are not available yet (see docs/fbref-player-stats-deferred.md).",
      );
    }
    source = new FbrefSource();
  } else {
    throw new Error(`Unknown source: "${sourceId}". Use statsbomb or fbref.`);
  }

  console.error(`Syncing "${competition}" from ${source.id}…`);
  const result = await source.syncCompetition(competition);
  const cache = await writeSyncToStore(storeMode, dbPath, result);
  printSyncSummary(source.id, result, cache);
}

function printSyncSummary(
  sourceId: string,
  result: {
    competitions: Array<{ name: string }>;
    seasons: unknown[];
    teams: unknown[];
    matches: unknown[];
    players?: unknown[];
    playerMatchStats?: unknown[];
  },
  cache: CampoCache,
): void {
  console.log(
    JSON.stringify(
      {
        source: sourceId,
        cache: storeMode === "json" ? cachePath() : dbPath,
        competitions: result.competitions.map((c) => c.name),
        seasons: result.seasons.length,
        teams: result.teams.length,
        matches: result.matches.length,
        players: result.players?.length ?? 0,
        playerMatchStats: result.playerMatchStats?.length ?? 0,
        totals: {
          competitions: cache.competitions.length,
          seasons: cache.seasons.length,
          teams: cache.teams.length,
          matches: cache.matches.length,
          players: cache.players.length,
          playerMatchStats: cache.playerMatchStats.length,
        },
      },
      null,
      2,
    ),
  );
}

async function cmdUpdate(args: string[]): Promise<void> {
  const withPlayers = hasFlag(args, "--with-players");
  const limitRaw = getFlag(args, "--player-stats-limit");
  const playerStatsLimit = limitRaw
    ? Number(limitRaw)
    : FANTASY_PLAYER_STATS_LIMIT;
  const before = await readStore(storeMode, dbPath);
  console.error(
    before.competitions.length === 0
      ? "Cache empty — running full fantasy sync…"
      : `Updating ${before.competitions.length} cached competition(s)…`,
  );
  const result = await updateCachedCompetitions(before, {
    includePlayerStats: withPlayers,
    playerStatsLimit,
    latestSeasonPlayersOnly: true,
    onProgress: (msg) => console.error(msg),
  });
  const cache = await writeSyncToStore(storeMode, dbPath, result);
  printSyncSummary("statsbomb", result, cache);
}

async function cmdPull(args: string[]): Promise<void> {
  const url = getFlag(args, "--url") ?? dataBundleUrl(GITLAB_PROJECT_ID);
  console.error(`Pulling data bundle from ${url}…`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Failed to pull data bundle (${res.status}). ` +
        `Ensure the GitLab CI cron has published campo-stats-data/latest (see docs/cron.md).`,
    );
  }
  const remote = (await res.json()) as Partial<CampoCache>;
  const incoming = {
    ...emptyCache(),
    competitions: remote.competitions ?? [],
    seasons: remote.seasons ?? [],
    teams: remote.teams ?? [],
    matches: remote.matches ?? [],
    identities: remote.identities ?? [],
    players: remote.players ?? [],
    playerMatchStats: remote.playerMatchStats ?? [],
    lineups: remote.lineups ?? [],
    injuries: remote.injuries ?? [],
  };
  const local = await readStore(storeMode, dbPath);
  const merged = mergeSyncResult(local, {
    competitions: incoming.competitions,
    seasons: incoming.seasons,
    teams: incoming.teams,
    matches: incoming.matches,
    players: incoming.players,
    playerMatchStats: incoming.playerMatchStats,
    lineups: incoming.lineups,
    injuries: incoming.injuries,
  });
  // Preserve local identities; prefer remote entity payloads via mergeById.
  merged.identities = local.identities.length
    ? local.identities
    : incoming.identities;
  await writeCacheToStore(storeMode, dbPath, merged);
  console.log(
    JSON.stringify(
      {
        url,
        cache: storeMode === "json" ? cachePath() : dbPath,
        totals: {
          competitions: merged.competitions.length,
          seasons: merged.seasons.length,
          teams: merged.teams.length,
          matches: merged.matches.length,
          players: merged.players.length,
          playerMatchStats: merged.playerMatchStats.length,
          lineups: merged.lineups.length,
        },
      },
      null,
      2,
    ),
  );
}

async function cmdAvailable(): Promise<void> {
  const list = await listWomenCompetitions();
  console.log(
    JSON.stringify(
      list.map((c) => ({
        id: c.id,
        name: c.name,
        country: c.country,
        international: c.international,
        seasons: c.seasons.map((s) => s.name),
      })),
      null,
      2,
    ),
  );
}

async function cmdCompetitions(): Promise<void> {
  const cache = await readStore(storeMode, dbPath);
  console.log(
    JSON.stringify(
      cache.competitions.map((c) => ({
        id: c.id,
        name: c.name,
        country: c.country,
        international: c.international ?? false,
      })),
      null,
      2,
    ),
  );
}

async function cmdSeasons(args: string[]): Promise<void> {
  const name = getFlag(args, "--competition");
  if (!name) usage();
  const cache = await readStore(storeMode, dbPath);
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
  const cache = await readStore(storeMode, dbPath);
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
      teams.map((t) => ({
        id: t.id,
        name: t.name,
        country: t.country,
        kind: t.kind,
      })),
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

  const cache = await readStore(storeMode, dbPath);
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

async function cmdPlayers(args: string[]): Promise<void> {
  const teamName = getFlag(args, "--team");
  const name = getFlag(args, "--name");
  const cache = await readStore(storeMode, dbPath);
  const teamById = new Map(cache.teams.map((t) => [t.id, t]));
  const teamIds = teamName
    ? new Set(
        cache.teams
          .filter((t) => includesCI(t.name, teamName))
          .map((t) => t.id),
      )
    : null;

  let players = cache.players;
  if (name) players = players.filter((p) => includesCI(p.name, name));
  if (teamIds) {
    const playerIds = new Set(
      cache.playerMatchStats
        .filter((s) => teamIds.has(s.teamId))
        .map((s) => s.playerId),
    );
    players = players.filter((p) => playerIds.has(p.id));
  }

  console.log(
    JSON.stringify(
      players.map((p) => ({
        id: p.id,
        name: p.name,
        nickname: p.nickname,
        country: p.country,
      })),
      null,
      2,
    ),
  );
}

async function cmdPlayerStats(args: string[]): Promise<void> {
  const competitionName = getFlag(args, "--competition");
  const matchId = getFlag(args, "--match");
  const playerName = getFlag(args, "--player");
  const teamName = getFlag(args, "--team");
  const cache = await readStore(storeMode, dbPath);

  let competitionId: string | undefined;
  if (competitionName) {
    competitionId = requireCompetition(cache, competitionName).id;
  }

  const matchIds = new Set(
    cache.matches
      .filter((m) => (competitionId ? m.competitionId === competitionId : true))
      .filter((m) => (matchId ? m.id === matchId || m.id.endsWith(`:${matchId}`) : true))
      .map((m) => m.id),
  );

  const playerById = new Map(cache.players.map((p) => [p.id, p]));
  const teamById = new Map(cache.teams.map((t) => [t.id, t]));

  const rows = cache.playerMatchStats.filter((s) => {
    if (!matchIds.has(s.matchId)) return false;
    if (playerName) {
      const n = playerById.get(s.playerId)?.name ?? "";
      if (!includesCI(n, playerName)) return false;
    }
    if (teamName) {
      const n = teamById.get(s.teamId)?.name ?? "";
      if (!includesCI(n, teamName)) return false;
    }
    return true;
  });

  console.log(
    JSON.stringify(
      rows.map((s) => ({
        matchId: s.matchId,
        player: playerById.get(s.playerId)?.name,
        team: teamById.get(s.teamId)?.name,
        minutes: s.minutes,
        goals: s.goals,
        assists: s.assists,
        yellowCards: s.yellowCards,
        redCards: s.redCards,
      })),
      null,
      2,
    ),
  );
}

async function cmdIdentities(args: string[]): Promise<void> {
  const sub = args[0];
  if (sub === "propose") {
    const competition = getFlag(args, "--competition");
    if (!competition) usage();
    const cache = proposeIdentitiesForCompetition(await readStore(storeMode, dbPath), competition);
    await writeCacheToStore(storeMode, dbPath, cache);
    console.log(
      JSON.stringify(
        {
          competition,
          identities: cache.identities.length,
          pending: cache.identities.filter((i) => i.status === "pending").length,
          resolved: cache.identities.filter((i) => i.status === "resolved").length,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (sub === "confirm" || sub === "reject") {
    const id = getFlag(args, "--id");
    if (!id) usage();
    const status = sub === "confirm" ? "resolved" : "rejected";
    const before = await readStore(storeMode, dbPath);
    if (!before.identities.some((i) => i.id === id)) {
      throw new Error(`Identity not found: ${id}`);
    }
    const cache = setIdentityStatus(before, id, status);
    await writeCacheToStore(storeMode, dbPath, cache);
    console.log(JSON.stringify(cache.identities.find((i) => i.id === id), null, 2));
    return;
  }

  const status = getFlag(args, "--status");
  const cache = await readStore(storeMode, dbPath);
  const identities = cache.identities.filter((i) =>
    status ? i.status === status : true,
  );
  console.log(JSON.stringify(identities, null, 2));
}

async function cmdLineups(args: string[]): Promise<void> {
  const matchId = getFlag(args, "--match");
  const team = getFlag(args, "--team");
  const client = CampoClient.fromCache(await readStore(storeMode, dbPath));
  const playerById = new Map(client.data.players.map((p) => [p.id, p]));
  const teamById = new Map(client.data.teams.map((t) => [t.id, t]));
  console.log(
    JSON.stringify(
      client.lineups({ matchId, team }).map((l) => ({
        matchId: l.matchId,
        team: teamById.get(l.teamId)?.name,
        player: playerById.get(l.playerId)?.name,
        started: l.started,
        jerseyNumber: l.jerseyNumber,
      })),
      null,
      2,
    ),
  );
}

async function cmdSquad(args: string[]): Promise<void> {
  const competition = getFlag(args, "--competition");
  const team = getFlag(args, "--team");
  if (!competition || !team) usage();
  const season = getFlag(args, "--season");
  const client = CampoClient.fromCache(await readStore(storeMode, dbPath));
  console.log(
    JSON.stringify(client.squad({ competition, team, season }), null, 2),
  );
}

async function cmdFantasyPoints(args: string[]): Promise<void> {
  const client = CampoClient.fromCache(await readStore(storeMode, dbPath));
  const rows = client.fantasyPoints({
    competition: getFlag(args, "--competition"),
    matchId: getFlag(args, "--match"),
    player: getFlag(args, "--player"),
    team: getFlag(args, "--team"),
  });
  const playerById = new Map(client.data.players.map((p) => [p.id, p]));
  console.log(
    JSON.stringify(
      rows.map((r) => ({
        matchId: r.matchId,
        player: playerById.get(r.playerId)?.name,
        points: r.points,
        breakdown: r.breakdown,
      })),
      null,
      2,
    ),
  );
}

async function cmdInjuries(): Promise<void> {
  const client = CampoClient.fromCache(await readStore(storeMode, dbPath));
  console.log(
    JSON.stringify(
      {
        available: client.injuries().available,
        message: INJURIES_STATUS_MESSAGE,
        records: client.injuries().records,
      },
      null,
      2,
    ),
  );
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;
  if (!command || command === "--help" || args.includes("--help")) usage();

  const allArgs = process.argv.slice(2);
  storeMode = resolveStoreMode(allArgs);
  dbPath = resolveDbPath(allArgs);

  switch (command) {
    case "sync":
      await cmdSync(args);
      break;
    case "update":
      await cmdUpdate(args);
      break;
    case "pull":
      await cmdPull(args);
      break;
    case "available":
      await cmdAvailable();
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
    case "players":
      await cmdPlayers(args);
      break;
    case "player-stats":
      await cmdPlayerStats(args);
      break;
    case "lineups":
      await cmdLineups(args);
      break;
    case "squad":
      await cmdSquad(args);
      break;
    case "fantasy-points":
      await cmdFantasyPoints(args);
      break;
    case "injuries":
      await cmdInjuries();
      break;
    case "identities":
      await cmdIdentities(args);
      break;
    case "migrate":
      await runMigrate(args);
      break;
    default:
      usage();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
