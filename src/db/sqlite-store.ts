import { createRequire } from "node:module";
import type { CampusCache } from "../types.js";
import type { CanonicalIdentity } from "../identity/types.js";
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

type DatabaseSync = import("node:sqlite").DatabaseSync;
const require = createRequire(import.meta.url);

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS competitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  gender TEXT NOT NULL,
  sources_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS seasons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  competition_id TEXT NOT NULL,
  sources_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  sources_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  competition_id TEXT NOT NULL,
  season_id TEXT NOT NULL,
  date TEXT,
  home_team_id TEXT NOT NULL,
  away_team_id TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  sources_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS identities (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  aliases_json TEXT NOT NULL,
  sources_json TEXT NOT NULL,
  confidence TEXT NOT NULL,
  status TEXT NOT NULL,
  competition_hint TEXT
);
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT,
  country TEXT,
  sources_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS player_match_stats (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  minutes INTEGER,
  goals INTEGER NOT NULL,
  assists INTEGER NOT NULL,
  yellow_cards INTEGER NOT NULL,
  red_cards INTEGER NOT NULL,
  sources_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS lineups (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  started INTEGER NOT NULL,
  jersey_number INTEGER,
  sources_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS injuries (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  team_id TEXT,
  status TEXT NOT NULL,
  description TEXT,
  from_date TEXT,
  to_date TEXT,
  sources_json TEXT NOT NULL
);
`;

function j(value: unknown): string {
  return JSON.stringify(value);
}

function parseJson<T>(raw: string): T {
  return JSON.parse(raw) as T;
}

export class SqliteStore {
  private readonly db: DatabaseSync;

  constructor(dbPath: string) {
    // Lazy-load so --help and JSON-only flows do not touch experimental node:sqlite.
    const { DatabaseSync } = require("node:sqlite") as typeof import("node:sqlite");
    this.db = new DatabaseSync(dbPath);
    this.db.exec(SCHEMA_SQL);
  }

  close(): void {
    this.db.close();
  }

  replaceAll(cache: CampusCache): void {
    this.db.exec("BEGIN");
    try {
      for (const table of [
        "competitions",
        "seasons",
        "teams",
        "matches",
        "identities",
        "players",
        "player_match_stats",
        "lineups",
        "injuries",
      ]) {
        this.db.prepare(`DELETE FROM ${table}`).run();
      }
      this.insertCache(cache);
      this.db.exec("COMMIT");
    } catch (err) {
      this.db.exec("ROLLBACK");
      throw err;
    }
  }

  /** Upsert entities from a CampusCache slice (merge semantics). */
  upsertCache(cache: CampusCache): void {
    this.db.exec("BEGIN");
    try {
      this.insertCache(cache);
      this.db.exec("COMMIT");
    } catch (err) {
      this.db.exec("ROLLBACK");
      throw err;
    }
  }

  loadCache(): CampusCache {
    const competitions = this.db
      .prepare("SELECT * FROM competitions")
      .all()
      .map((row) => ({
        id: String(row.id),
        name: String(row.name),
        country: row.country == null ? undefined : String(row.country),
        gender: "female" as const,
        sources: parseJson(String(row.sources_json)),
      })) satisfies Competition[];

    const seasons = this.db
      .prepare("SELECT * FROM seasons")
      .all()
      .map((row) => ({
        id: String(row.id),
        name: String(row.name),
        competitionId: String(row.competition_id),
        sources: parseJson(String(row.sources_json)),
      })) satisfies Season[];

    const teams = this.db
      .prepare("SELECT * FROM teams")
      .all()
      .map((row) => ({
        id: String(row.id),
        name: String(row.name),
        country: row.country == null ? undefined : String(row.country),
        sources: parseJson(String(row.sources_json)),
      })) satisfies Team[];

    const matches = this.db
      .prepare("SELECT * FROM matches")
      .all()
      .map((row) => ({
        id: String(row.id),
        competitionId: String(row.competition_id),
        seasonId: String(row.season_id),
        date: row.date == null ? undefined : String(row.date),
        homeTeamId: String(row.home_team_id),
        awayTeamId: String(row.away_team_id),
        homeScore: row.home_score == null ? null : Number(row.home_score),
        awayScore: row.away_score == null ? null : Number(row.away_score),
        sources: parseJson(String(row.sources_json)),
      })) satisfies Match[];

    const identities = this.db
      .prepare("SELECT * FROM identities")
      .all()
      .map((row) => ({
        id: String(row.id),
        kind: String(row.kind) as CanonicalIdentity["kind"],
        name: String(row.name),
        aliases: parseJson(String(row.aliases_json)),
        sources: parseJson(String(row.sources_json)),
        confidence: String(row.confidence) as CanonicalIdentity["confidence"],
        status: String(row.status) as CanonicalIdentity["status"],
        competitionHint:
          row.competition_hint == null
            ? undefined
            : String(row.competition_hint),
      })) satisfies CanonicalIdentity[];

    const players = this.db
      .prepare("SELECT * FROM players")
      .all()
      .map((row) => ({
        id: String(row.id),
        name: String(row.name),
        nickname: row.nickname == null ? undefined : String(row.nickname),
        country: row.country == null ? undefined : String(row.country),
        sources: parseJson(String(row.sources_json)),
      })) satisfies Player[];

    const playerMatchStats = this.db
      .prepare("SELECT * FROM player_match_stats")
      .all()
      .map((row) => ({
        id: String(row.id),
        matchId: String(row.match_id),
        playerId: String(row.player_id),
        teamId: String(row.team_id),
        minutes: row.minutes == null ? null : Number(row.minutes),
        goals: Number(row.goals),
        assists: Number(row.assists),
        yellowCards: Number(row.yellow_cards),
        redCards: Number(row.red_cards),
        sources: parseJson(String(row.sources_json)),
      })) satisfies PlayerMatchStats[];

    const lineups = this.db
      .prepare("SELECT * FROM lineups")
      .all()
      .map((row) => ({
        id: String(row.id),
        matchId: String(row.match_id),
        teamId: String(row.team_id),
        playerId: String(row.player_id),
        started: Boolean(row.started),
        jerseyNumber:
          row.jersey_number == null ? null : Number(row.jersey_number),
        sources: parseJson(String(row.sources_json)),
      })) satisfies LineupEntry[];

    const injuries = this.db
      .prepare("SELECT * FROM injuries")
      .all()
      .map((row) => ({
        id: String(row.id),
        playerId: String(row.player_id),
        teamId: row.team_id == null ? undefined : String(row.team_id),
        status: String(row.status) as InjuryRecord["status"],
        description:
          row.description == null ? undefined : String(row.description),
        fromDate: row.from_date == null ? undefined : String(row.from_date),
        toDate: row.to_date == null ? undefined : String(row.to_date),
        sources: parseJson(String(row.sources_json)),
      })) satisfies InjuryRecord[];

    return {
      competitions,
      seasons,
      teams,
      matches,
      identities,
      players,
      playerMatchStats,
      lineups,
      injuries,
    };
  }

  private insertCache(cache: CampusCache): void {
    const upsertCompetition = this.db.prepare(
      `INSERT INTO competitions (id, name, country, gender, sources_json)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name=excluded.name, country=excluded.country, gender=excluded.gender,
         sources_json=excluded.sources_json`,
    );
    for (const c of cache.competitions) {
      upsertCompetition.run(c.id, c.name, c.country ?? null, c.gender, j(c.sources));
    }

    const upsertSeason = this.db.prepare(
      `INSERT INTO seasons (id, name, competition_id, sources_json)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name=excluded.name, competition_id=excluded.competition_id,
         sources_json=excluded.sources_json`,
    );
    for (const s of cache.seasons) {
      upsertSeason.run(s.id, s.name, s.competitionId, j(s.sources));
    }

    const upsertTeam = this.db.prepare(
      `INSERT INTO teams (id, name, country, sources_json)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name=excluded.name, country=excluded.country, sources_json=excluded.sources_json`,
    );
    for (const t of cache.teams) {
      upsertTeam.run(t.id, t.name, t.country ?? null, j(t.sources));
    }

    const upsertMatch = this.db.prepare(
      `INSERT INTO matches (
         id, competition_id, season_id, date, home_team_id, away_team_id,
         home_score, away_score, sources_json
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         competition_id=excluded.competition_id, season_id=excluded.season_id,
         date=excluded.date, home_team_id=excluded.home_team_id,
         away_team_id=excluded.away_team_id, home_score=excluded.home_score,
         away_score=excluded.away_score, sources_json=excluded.sources_json`,
    );
    for (const m of cache.matches) {
      upsertMatch.run(
        m.id,
        m.competitionId,
        m.seasonId,
        m.date ?? null,
        m.homeTeamId,
        m.awayTeamId,
        m.homeScore ?? null,
        m.awayScore ?? null,
        j(m.sources),
      );
    }

    const upsertIdentity = this.db.prepare(
      `INSERT INTO identities (
         id, kind, name, aliases_json, sources_json, confidence, status, competition_hint
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         kind=excluded.kind, name=excluded.name, aliases_json=excluded.aliases_json,
         sources_json=excluded.sources_json, confidence=excluded.confidence,
         status=excluded.status, competition_hint=excluded.competition_hint`,
    );
    for (const i of cache.identities) {
      upsertIdentity.run(
        i.id,
        i.kind,
        i.name,
        j(i.aliases),
        j(i.sources),
        i.confidence,
        i.status,
        i.competitionHint ?? null,
      );
    }

    const upsertPlayer = this.db.prepare(
      `INSERT INTO players (id, name, nickname, country, sources_json)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name=excluded.name, nickname=excluded.nickname, country=excluded.country,
         sources_json=excluded.sources_json`,
    );
    for (const p of cache.players) {
      upsertPlayer.run(
        p.id,
        p.name,
        p.nickname ?? null,
        p.country ?? null,
        j(p.sources),
      );
    }

    const upsertStats = this.db.prepare(
      `INSERT INTO player_match_stats (
         id, match_id, player_id, team_id, minutes, goals, assists,
         yellow_cards, red_cards, sources_json
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         match_id=excluded.match_id, player_id=excluded.player_id,
         team_id=excluded.team_id, minutes=excluded.minutes, goals=excluded.goals,
         assists=excluded.assists, yellow_cards=excluded.yellow_cards,
         red_cards=excluded.red_cards, sources_json=excluded.sources_json`,
    );
    for (const s of cache.playerMatchStats) {
      upsertStats.run(
        s.id,
        s.matchId,
        s.playerId,
        s.teamId,
        s.minutes ?? null,
        s.goals,
        s.assists,
        s.yellowCards,
        s.redCards,
        j(s.sources),
      );
    }

    const upsertLineup = this.db.prepare(
      `INSERT INTO lineups (
         id, match_id, team_id, player_id, started, jersey_number, sources_json
       ) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         match_id=excluded.match_id, team_id=excluded.team_id,
         player_id=excluded.player_id, started=excluded.started,
         jersey_number=excluded.jersey_number, sources_json=excluded.sources_json`,
    );
    for (const l of cache.lineups) {
      upsertLineup.run(
        l.id,
        l.matchId,
        l.teamId,
        l.playerId,
        l.started ? 1 : 0,
        l.jerseyNumber ?? null,
        j(l.sources),
      );
    }

    const upsertInjury = this.db.prepare(
      `INSERT INTO injuries (
         id, player_id, team_id, status, description, from_date, to_date, sources_json
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         player_id=excluded.player_id, team_id=excluded.team_id,
         status=excluded.status, description=excluded.description,
         from_date=excluded.from_date, to_date=excluded.to_date,
         sources_json=excluded.sources_json`,
    );
    for (const i of cache.injuries) {
      upsertInjury.run(
        i.id,
        i.playerId,
        i.teamId ?? null,
        i.status,
        i.description ?? null,
        i.fromDate ?? null,
        i.toDate ?? null,
        j(i.sources),
      );
    }
  }
}
