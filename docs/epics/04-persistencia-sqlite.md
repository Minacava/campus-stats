# Epic 04 — SQLite persistence (JSON cache replacement)

## Goal

Replace `.campo-stats/cache.json` with SQLite when volume (especially events /
player stats) makes loading everything into memory impractical, without
breaking the sync/query flow.

## Context

The JSON cache is a deliberate v0 choice (no native deps, diffable, multi-OS).
Candidates: `better-sqlite3` or `node:sqlite`. The SQL schema must mirror the
domain model and preserve provenance and merges.

### Trigger from Epic 03

`--with-players` adds `players` + `playerMatchStats` to the cache. With the
default `player-stats-limit=5`, JSON remains reasonable. When a full season is
enriched (hundreds of matches), **loading the whole JSON into memory stops
being viable** — that is the trigger for this epic. See
`docs/player-stats-sync-cost.md`. The SQL schema must include `players` and
`player_match_stats` plus competitions/seasons/teams/matches/identities.

## Definition of done

- Sync writes to SQLite; queries read from SQLite
- Migration from existing `cache.json` (or one-shot import) is documented
- Acceptable performance for a competition with player stats (when present)
- Merge behavior across syncs is preserved

## Tasks

- [x] Choose engine (`node:sqlite` vs `better-sqlite3`) and document Node/OS requirements
- [x] Design SQL schema aligned to Competition / Season / Team / Match (+ Player if applicable)
- [x] Implement repository layer (CLI and adapters do not speak raw SQL)
- [x] Migration / import from `.campo-stats/cache.json`
- [x] Keep semantic merge on sync (upsert by identity / provenance)
- [x] CLI flags for DB path and, if needed, legacy JSON mode
- [x] Migration tests and representative queries
- [x] Update README: DB location, backup, limits

## Definition of done — status

Epic 04 complete: `node:sqlite`, schema, SqliteStore, migrate, CLI flags.
Default remains JSON; use `--sqlite` / `migrate` when volume requires it.
