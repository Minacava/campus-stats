export type {
  SourceRef,
  TeamKind,
  Competition,
  Season,
  Team,
  Match,
  Player,
  PlayerMatchStats,
  LineupEntry,
  InjuryRecord,
  CampusCache,
} from "./types.js";
export type {
  IdentityKind,
  IdentityConfidence,
  IdentityStatus,
  CanonicalIdentity,
} from "./identity/types.js";
export type { FootballSource, SyncResult } from "./sources/types.js";
export { StatsBombSource } from "./sources/statsbomb.js";
export type { WomenCompetitionInfo } from "./sources/statsbomb.js";
export { FbrefSource, listFbrefPilotNames } from "./sources/fbref.js";
export {
  emptyCache,
  cachePath,
  loadCache,
  saveCache,
  mergeSyncResult,
  DEFAULT_CACHE_DIR,
  DEFAULT_CACHE_FILE,
} from "./cache.js";
export { SqliteStore, SCHEMA_SQL } from "./db/sqlite-store.js";
export {
  FANTASY_PLAYER_STATS_LIMIT,
  listWomenCompetitions,
  syncFantasyBundle,
  updateCachedCompetitions,
  competitionIsInternational,
} from "./fantasy.js";
export type { FantasySyncOptions } from "./fantasy.js";
export {
  GITLAB_PROJECT_ID,
  DATA_BUNDLE_PACKAGE,
  DATA_BUNDLE_VERSION,
  DATA_BUNDLE_FILE,
  dataBundleUrl,
  dataBundleMetaUrl,
} from "./data-bundle.js";
export { CampusClient } from "./client.js";
export type { SquadMember } from "./client.js";
export {
  DEFAULT_FANTASY_RULES,
  scorePlayerMatchStats,
  scoreFantasyPoints,
} from "./scoring.js";
export type { FantasyScoringRules, FantasyPointRow } from "./scoring.js";
export {
  INJURIES_AVAILABLE,
  INJURIES_STATUS_MESSAGE,
  listInjuries,
} from "./injuries.js";
