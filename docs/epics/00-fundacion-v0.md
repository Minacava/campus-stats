# Epic 00 — Foundation v0 (schema, StatsBomb, CLI, JSON cache)

## Goal

Ship a documented, verifiable product core: canonical schema, StatsBomb
adapter, sync/query CLI, and local JSON cache with provenance.

## Context

v0 is sketched in the starter: `src/types.ts` defines provider-agnostic
entities; each source implements `FootballSource` under `src/sources/`; the
CLI and cache never see provider raw field names. StatsBomb Open Data covers
Liga F, WSL, Frauen-Bundesliga, Serie A Women, NWSL, Women's World Cup, and
UEFA Women's Euro.

**License:** code MIT; data subject to each source's terms (StatsBomb credit
required for published analysis).

## Definition of done

- `npm install && npm run build` works
- `sync --competition "Liga F"` pulls real matches for a StatsBomb season
- CLI queries list competitions / seasons / teams / matches from the cache
- A second `sync` for another competition **merges**, does not wipe
- Package README documents quickstart, schema, data terms, and how to add adapters

## Tasks

- [x] Inventory existing code (types, sources, CLI, cache) and align the repo README with the Campus / campo-stats vision
- [x] Define and document the canonical `Competition`, `Season`, `Team`, `Match` schema (required vs optional fields)
- [x] Complete / harden the StatsBomb adapter (`FootballSource`) with stable mapping and `sources` provenance
- [x] Implement JSON cache at `.campo-stats/cache.json` with merge-on-sync (not replace)
- [x] CLI: `sync --competition`, `competitions`, `seasons`, `teams`, `matches` with documented filters
- [x] Contract tests: Liga F sync (or offline fixture) + query a team in a season
- [x] Document StatsBomb terms and credit obligation in README / adapter header
- [x] Adapter contribution checklist: `FootballSource` interface, normalization, limits/API key docs

## Definition of done — status

Epic 00 tasks complete. Verify locally:

```bash
npm install && npm run build && npm test
node dist/cli.js sync --competition "Liga F"
```
