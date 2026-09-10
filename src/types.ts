import type { SourceRef } from "./refs.js";
import type { CanonicalIdentity } from "./identity/types.js";

export type { SourceRef } from "./refs.js";

/**
 * Canonical domain schema for campo-stats.
 * Provider-agnostic — adapters map raw source fields into these types.
 */

/** Club side vs national team (selección). */
export type TeamKind = "club" | "national";

export interface Competition {
  /** Stable campo-stats id (derived from primary source + native id). */
  id: string;
  /** Display name, e.g. "Liga F". */
  name: string;
  /** ISO-ish country or region label when known. */
  country?: string;
  /** Always women's football in this package; kept for clarity. */
  gender: "female";
  /** True for World Cup, Euro, etc. (national-team tournaments). */
  international?: boolean;
  sources: SourceRef[];
}

export interface Season {
  id: string;
  /** Display label, e.g. "2023/2024". */
  name: string;
  competitionId: string;
  sources: SourceRef[];
}

export interface Team {
  id: string;
  name: string;
  country?: string;
  /** Club or national team when known from the competition context. */
  kind?: TeamKind;
  sources: SourceRef[];
}

export interface Match {
  id: string;
  competitionId: string;
  seasonId: string;
  /** Kick-off date YYYY-MM-DD when known. */
  date?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number | null;
  awayScore?: number | null;
  sources: SourceRef[];
}

/** Player identity at package level (not per-match). */
export interface Player {
  id: string;
  name: string;
  /** Preferred short name when known. */
  nickname?: string;
  country?: string;
  sources: SourceRef[];
}

/**
 * Aggregated per-player stats for a single match (v1 metrics subset).
 * See docs/player-stats.md for the metric contract.
 */
export interface PlayerMatchStats {
  id: string;
  matchId: string;
  playerId: string;
  teamId: string;
  /** Minutes played when known. */
  minutes?: number | null;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  sources: SourceRef[];
}

/** One player appearance in a match squad / lineup. */
export interface LineupEntry {
  id: string;
  matchId: string;
  teamId: string;
  playerId: string;
  /** True when the player has a recorded on-pitch position interval. */
  started: boolean;
  jerseyNumber?: number | null;
  sources: SourceRef[];
}

/**
 * Injury / availability record.
 * Open StatsBomb data does not include injuries — this shape is reserved for
 * future adapters; the CLI currently returns an empty list.
 */
export interface InjuryRecord {
  id: string;
  playerId: string;
  teamId?: string;
  status: "injured" | "doubtful" | "suspended" | "unknown";
  description?: string;
  fromDate?: string;
  toDate?: string;
  sources: SourceRef[];
}

/** In-memory / on-disk cache shape (JSON file in v0). */
export interface CampoCache {
  competitions: Competition[];
  seasons: Season[];
  teams: Team[];
  matches: Match[];
  /** Cross-source identity resolutions (epic 02). */
  identities: CanonicalIdentity[];
  players: Player[];
  playerMatchStats: PlayerMatchStats[];
  lineups: LineupEntry[];
  injuries: InjuryRecord[];
}
