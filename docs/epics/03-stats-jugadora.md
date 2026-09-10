# Epic 03 — Player-level match stats

## Goal

Extend the schema beyond competition/season/team/match toward individual
per-match statistics, normalized across sources.

## Context

StatsBomb publishes rich but large event files; v0 skips them on purpose.
Ingesting them means new entities, more volume, and practical pressure to stop
“loading the whole JSON into memory” (see Epic 04).

## Definition of done

- Documented schema for `Player` and per-match stats (agreed minimum fields)
- At least StatsBomb exposes a usable player-stats subset
- CLI can list/query stats by match / player / team
- Volume does not break sync for a pilot competition

## Tasks

- [x] Design `Player` and `PlayerMatchStats` (or equivalent) aligned with the rest of the schema
- [x] Decide v1 metrics subset (goals, assists, minutes, cards, etc.) vs raw events
- [x] Extend the StatsBomb adapter for event files / player stats with provenance
- [x] (If Epic 01 done) Map the FBref equivalent to the same schema — deferred (see docs/fbref-player-stats-deferred.md)
- [x] Extend CLI: player and stats queries by match/season
- [x] Tests with a reduced event fixture (no huge dumps in the repo)
- [x] Document sync cost and storage requirements
- [x] Coordinate with Epic 04 if in-memory JSON stops being viable

## Definition of done — status

Epic 03 complete for StatsBomb (FBref player stats deferred).
With `--with-players`, JSON stays OK if `player-stats-limit` is low;
full-season enrichment → Epic 04 (see note in `04-persistencia-sqlite.md`).
