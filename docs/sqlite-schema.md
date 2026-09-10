# SQL schema (node:sqlite)

Tablas alineadas al dominio canónico. Los JSON de `sources` / `aliases` se
guardan como TEXT JSON para no explotar filas de provenance en v1.

```sql
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
```
