/**
 * StatsBomb Data API endpoint catalogue.
 *
 * Free Open Data and the paid customer API share many concepts; paid adds
 * aggregate / 360 / mapping endpoints and licensed competition coverage.
 *
 * Host (paid): https://data.statsbombservices.com
 * Auth: HTTP Basic (SB_USERNAME / SB_PASSWORD) — same as statsbombpy.
 */

import { DEFAULT_STATSBOMB_API_BASE } from "../credentials.js";

/** Default API versions (statsbombpy fallbacks when live map is unavailable). */
export const STATSBOMB_API_VERSIONS = {
  competitions: "v4",
  matches: "v6",
  lineups: "v5",
  events: "v11",
  frames360: "v2",
  playerMatchStats: "v8",
  playerSeasonStats: "v7",
  teamMatchStats: "v4",
  teamSeasonStats: "v4",
} as const;

export type StatsBombEndpointId =
  | "competitions"
  | "matches"
  | "lineups"
  | "events"
  | "frames360"
  | "playerMatchStats"
  | "teamMatchStats"
  | "playerSeasonStats"
  | "teamSeasonStats"
  | "playerMapping"
  | "endpointVersions";

export type StatsBombEndpointAvailability = "wired" | "optional-paid";

export interface StatsBombEndpointInfo {
  id: StatsBombEndpointId;
  name: string;
  paidPath?: string;
  openDataPath?: string;
  availability: StatsBombEndpointAvailability;
  wiredInCampus: boolean;
  requiresPaidLicense: boolean;
  notes: string;
}

export const STATSBOMB_ENDPOINT_CATALOG: StatsBombEndpointInfo[] = [
  {
    id: "competitions",
    name: "Competitions",
    paidPath: `/api/${STATSBOMB_API_VERSIONS.competitions}/competitions`,
    openDataPath: "/competitions.json",
    availability: "wired",
    wiredInCampus: true,
    requiresPaidLicense: false,
    notes:
      "Paid returns only competition-seasons in your contract; open-data is the public subset.",
  },
  {
    id: "matches",
    name: "Matches in competition season",
    paidPath: `/api/${STATSBOMB_API_VERSIONS.matches}/competitions/{competition_id}/seasons/{season_id}/matches`,
    openDataPath: "/matches/{competition_id}/{season_id}.json",
    availability: "wired",
    wiredInCampus: true,
    requiresPaidLicense: false,
    notes: "Core schedule + scores.",
  },
  {
    id: "lineups",
    name: "Lineups for match",
    paidPath: `/api/${STATSBOMB_API_VERSIONS.lineups}/lineups/{match_id}`,
    openDataPath: "/lineups/{match_id}.json",
    availability: "wired",
    wiredInCampus: true,
    requiresPaidLicense: false,
    notes: "Used when --with-players (capped).",
  },
  {
    id: "events",
    name: "Events in match",
    paidPath: `/api/${STATSBOMB_API_VERSIONS.events}/events/{match_id}`,
    openDataPath: "/events/{match_id}.json",
    availability: "wired",
    wiredInCampus: true,
    requiresPaidLicense: false,
    notes: "Used when --with-players.",
  },
  {
    id: "playerMatchStats",
    name: "Player match stats (aggregated)",
    paidPath: `/api/${STATSBOMB_API_VERSIONS.playerMatchStats}/matches/{match_id}/player-stats`,
    availability: "optional-paid",
    wiredInCampus: false,
    requiresPaidLicense: true,
    notes:
      "From the StatsBomb paid API when your licence includes it. Use --with-paid-player-match-stats.",
  },
  {
    id: "teamMatchStats",
    name: "Team match stats (aggregated)",
    paidPath: `/api/${STATSBOMB_API_VERSIONS.teamMatchStats}/matches/{match_id}/team-stats`,
    availability: "optional-paid",
    wiredInCampus: false,
    requiresPaidLicense: true,
    notes:
      "From the StatsBomb paid API when your licence includes it. Use --with-paid-team-match-stats.",
  },
  {
    id: "playerSeasonStats",
    name: "Player season stats",
    paidPath: `/api/${STATSBOMB_API_VERSIONS.playerSeasonStats}/competitions/{competition_id}/seasons/{season_id}/player-stats`,
    availability: "optional-paid",
    wiredInCampus: false,
    requiresPaidLicense: true,
    notes:
      "From the StatsBomb paid API when your licence includes it. Use --with-paid-player-season-stats.",
  },
  {
    id: "teamSeasonStats",
    name: "Team season stats",
    paidPath: `/api/${STATSBOMB_API_VERSIONS.teamSeasonStats}/competitions/{competition_id}/seasons/{season_id}/team-stats`,
    availability: "optional-paid",
    wiredInCampus: false,
    requiresPaidLicense: true,
    notes:
      "From the StatsBomb paid API when your licence includes it. Use --with-paid-team-season-stats.",
  },
  {
    id: "frames360",
    name: "360 freeze frames",
    paidPath: `/api/${STATSBOMB_API_VERSIONS.frames360}/360-frames/{match_id}`,
    openDataPath: "/three-sixty/{match_id}.json",
    availability: "optional-paid",
    wiredInCampus: false,
    requiresPaidLicense: true,
    notes: "From the StatsBomb paid API (360 licence). Use --with-paid-360.",
  },
  {
    id: "playerMapping",
    name: "Player mapping (live ↔ offline ids)",
    paidPath: "/api/v*/player-mapping (see StatsBomb Data Hub)",
    availability: "optional-paid",
    wiredInCampus: false,
    requiresPaidLicense: true,
    notes: "From the StatsBomb paid API / Data Hub when licensed.",
  },
  {
    id: "endpointVersions",
    name: "Endpoint versions map",
    paidPath: "/api/endpoint-versions",
    availability: "optional-paid",
    wiredInCampus: false,
    requiresPaidLicense: true,
    notes: "From the StatsBomb paid API; Campus uses version fallbacks today.",
  },
];

/** Optional paid extras the CLI can request once a login is present. */
export interface StatsBombPaidExtras {
  playerMatchStats?: boolean;
  teamMatchStats?: boolean;
  playerSeasonStats?: boolean;
  teamSeasonStats?: boolean;
  frames360?: boolean;
}

export function listStatsBombEndpoints(): StatsBombEndpointInfo[] {
  return STATSBOMB_ENDPOINT_CATALOG;
}

export function paidExtrasSummary(extras: StatsBombPaidExtras = {}): string[] {
  const enabled: string[] = [];
  if (extras.playerMatchStats) enabled.push("playerMatchStats");
  if (extras.teamMatchStats) enabled.push("teamMatchStats");
  if (extras.playerSeasonStats) enabled.push("playerSeasonStats");
  if (extras.teamSeasonStats) enabled.push("teamSeasonStats");
  if (extras.frames360) enabled.push("frames360");
  return enabled;
}

export function buildPaidEndpointUrl(
  template: string,
  params: Record<string, string | number>,
  apiBaseUrl: string = DEFAULT_STATSBOMB_API_BASE,
): string {
  let path = template;
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`{${key}}`, String(value));
  }
  const base = apiBaseUrl.replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path}`;
}

export function statsBombPaidUrls(apiBaseUrl: string = DEFAULT_STATSBOMB_API_BASE) {
  const base = apiBaseUrl.replace(/\/$/, "");
  const v = STATSBOMB_API_VERSIONS;
  return {
    competitions: () => `${base}/api/${v.competitions}/competitions`,
    matches: (competitionId: number, seasonId: number) =>
      `${base}/api/${v.matches}/competitions/${competitionId}/seasons/${seasonId}/matches`,
    lineups: (matchId: string | number) =>
      `${base}/api/${v.lineups}/lineups/${matchId}`,
    events: (matchId: string | number) =>
      `${base}/api/${v.events}/events/${matchId}`,
    frames360: (matchId: string | number) =>
      `${base}/api/${v.frames360}/360-frames/${matchId}`,
    playerMatchStats: (matchId: string | number) =>
      `${base}/api/${v.playerMatchStats}/matches/${matchId}/player-stats`,
    teamMatchStats: (matchId: string | number) =>
      `${base}/api/${v.teamMatchStats}/matches/${matchId}/team-stats`,
    playerSeasonStats: (competitionId: number, seasonId: number) =>
      `${base}/api/${v.playerSeasonStats}/competitions/${competitionId}/seasons/${seasonId}/player-stats`,
    teamSeasonStats: (competitionId: number, seasonId: number) =>
      `${base}/api/${v.teamSeasonStats}/competitions/${competitionId}/seasons/${seasonId}/team-stats`,
    endpointVersions: () => `${base}/api/endpoint-versions`,
  };
}
