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
  CampusCache,
} from "./types.js";
export type {
  IdentityKind,
  IdentityConfidence,
  IdentityStatus,
  CanonicalIdentity,
} from "./identity/types.js";
export type { FootballSource, SyncResult } from "./sources/types.js";
export {
  StatsBombSource,
  FbrefSource,
  listFbrefPilotNames,
  createFootballSource,
  KNOWN_SOURCE_IDS,
  listStatsBombEndpoints,
  paidExtrasSummary,
  statsBombPaidUrls,
  STATSBOMB_API_VERSIONS,
  STATSBOMB_ENDPOINT_CATALOG,
} from "./sources/index.js";
export type {
  WomenCompetitionInfo,
  StatsBombAccessMode,
  StatsBombSourceOptions,
  FbrefSourceOptions,
  SourceId,
  CreateSourceOptions,
  StatsBombPaidExtras,
  StatsBombEndpointInfo,
  StatsBombEndpointId,
  StatsBombEndpointAvailability,
} from "./sources/index.js";
export {
  SB_USERNAME_ENV,
  SB_PASSWORD_ENV,
  CAMPUS_STATSBOMB_USERNAME_ENV,
  CAMPUS_STATSBOMB_PASSWORD_ENV,
  CAMPUS_STATSBOMB_API_BASE_URL_ENV,
  DEFAULT_STATSBOMB_API_BASE,
  defaultConfigPath,
  loadConfigFile,
  resolveCredentials,
  requireStatsBombPaidLogin,
  maskSecret,
  describeCredentials,
  requireApiKey,
} from "./credentials.js";
export type {
  StatsBombCredentials,
  CampusConfigFile,
  CredentialSource,
  ResolvedCredentials,
  ResolveCredentialsOptions,
} from "./credentials.js";
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
  DATA_BUNDLE_OWNER,
  DATA_BUNDLE_REPO,
  DATA_BUNDLE_RELEASE_TAG,
  DATA_BUNDLE_FILE,
  DATA_BUNDLE_META_FILE,
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
