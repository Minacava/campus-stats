import type { CanonicalIdentity } from "./identity/types.js";

/**
 * Canonical domain schema for campo-stats.
 * Provider-agnostic — adapters map raw source fields into these types.
 */

/** Provenance link back to an upstream provider record. */
export interface SourceRef {
  /** Provider key, e.g. "statsbomb", "fbref". */
  source: string;
  /** Provider-native identifier (stringified if numeric upstream). */
  id: string;
}

export interface Competition {
  /** Stable campo-stats id (derived from primary source + native id). */
  id: string;
  /** Display name, e.g. "Liga F". */
  name: string;
  /** ISO-ish country or region label when known. */
  country?: string;
  /** Always women's football in this package; kept for clarity. */
  gender: "female";
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

/** In-memory / on-disk cache shape (JSON file in v0). */
export interface CampoCache {
  competitions: Competition[];
  seasons: Season[];
  teams: Team[];
  matches: Match[];
  /** Cross-source identity resolutions (epic 02). */
  identities: CanonicalIdentity[];
}
