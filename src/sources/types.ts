import type {
  Competition,
  InjuryRecord,
  LineupEntry,
  Match,
  Player,
  PlayerMatchStats,
  Season,
  Team,
} from "../types.js";

/** Result of syncing one competition from a provider into canonical entities. */
export interface SyncResult {
  competitions: Competition[];
  seasons: Season[];
  teams: Team[];
  matches: Match[];
  players?: Player[];
  playerMatchStats?: PlayerMatchStats[];
  lineups?: LineupEntry[];
  injuries?: InjuryRecord[];
}

/**
 * Provider adapter contract.
 * Implementations map native payloads onto the campo-stats schema and
 * attach provenance via `sources` on every entity.
 */
export interface FootballSource {
  /** Stable provider key (also used in SourceRef.source). */
  readonly id: string;
  /** Sync all seasons/teams/matches for a competition display name. */
  syncCompetition(competitionName: string): Promise<SyncResult>;
}
