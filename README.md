# Campus (`campo-stats`)

Open, normalized, queryable data on women's football — competitions,
seasons, teams and matches, pulled from scattered public sources into
one consistent schema.

Women's football data is real; it's just scattered across inconsistent
formats. `campo-stats` doesn't generate new data — it fetches from
providers who already publish it, and normalizes everything into one
schema so you can query Liga F, the WSL, the NWSL, etc. the same way.

The npm package name is `campo-stats`.

## Work plan

Epics and tasks (checklists): [`docs/epics/`](./docs/epics/README.md).  
Initial repo inventory: [`docs/inventory-v0.md`](./docs/inventory-v0.md).

| Epic | Description |
|------|-------------|
| [00 — Foundation v0](./docs/epics/00-fundacion-v0.md) | Schema, StatsBomb, CLI, JSON cache |
| [01 — FBref adapter](./docs/epics/01-adapter-fbref.md) | Second public source |
| [02 — Identity](./docs/epics/02-resolucion-identidad.md) | Cross-source resolution |
| [03 — Player stats](./docs/epics/03-stats-jugadora.md) | Per-match player-level stats |
| [04 — SQLite](./docs/epics/04-persistencia-sqlite.md) | Persistence beyond JSON |
| [05 — npm](./docs/epics/05-publicacion-npm.md) | Package publication |

## Install

```bash
# one-shot (after publish)
npx campo-stats sync --competition "Liga F"

# or add as a dependency
npm install campo-stats
```

Requires **Node.js ≥ 22**.

## Quickstart

From a clone (development):

```bash
npm install
npm run build

node dist/cli.js sync --competition "Liga F"

node dist/cli.js competitions
node dist/cli.js seasons  --competition "Liga F"
node dist/cli.js teams    --competition "Liga F"
node dist/cli.js matches  --competition "Liga F" --season "2023/2024" --team "Barcelona"

# optional: enrich a few matches with v1 player stats (StatsBomb)
node dist/cli.js sync --competition "Liga F" --with-players --player-stats-limit 3
node dist/cli.js players --name "Walsh"
node dist/cli.js player-stats --competition "Liga F" --player "Walsh"

# SQLite store (Node >= 22)
node dist/cli.js migrate --db .campo-stats/campo-stats.sqlite
node dist/cli.js sync --competition "Liga F" --sqlite
node dist/cli.js competitions --sqlite
```

Supported StatsBomb women's competitions include Liga F, FA Women's Super
League, Frauen-Bundesliga, Serie A Women, NWSL, Women's World Cup, and UEFA
Women's Euro. FBref pilots: WSL and Liga F (`--source fbref`).

Version guarantees: [`docs/versioning.md`](./docs/versioning.md). Changelog:
[`CHANGELOG.md`](./CHANGELOG.md).

## Why this shape

**One canonical schema, adapters do the translating.** `src/types.ts`
defines `Competition`, `Season`, `Team`, `Match`. Each provider under
`src/sources/` implements `FootballSource` and returns data already
mapped. The CLI and cache never see a provider's raw field names.

**Every record keeps its provenance.** Entities carry
`sources: [{ source, id }]`. Cross-source identity resolution will lean
on that field.

**Local cache is a plain JSON file.** `.campo-stats/cache.json`, merged
(not replaced) on every `sync`. Deliberate v0 choice — see Epic 04 for
SQLite.

## Current status

Epics 00–04 done. Epic 05 (npm publish) in progress — package metadata at
`0.1.0`.

## Data source & terms

v0 ships adapters for:

- [StatsBomb Open Data](https://github.com/statsbomb/open-data) — Liga F, FA Women's
  Super League, Frauen-Bundesliga, Serie A Women, NWSL, Women's World Cup, UEFA
  Women's Euro (women's competitions only).
- **FBref** (HTML schedule pages) — pilots documented in
  [`docs/fbref-pilot.md`](./docs/fbref-pilot.md) (WSL + Liga F). Live fetches use a
  rate-limited client; Cloudflare may block some networks — fixtures cover CI.

**This code is MIT. The data is not ours to relicense.**

- StatsBomb: free for research and genuine football-analytics use. If you publish
  analysis built on it, credit StatsBomb (see their
  [media pack](https://statsbomb.com/media-pack/)). Notice also in
  [`src/sources/statsbomb.ts`](./src/sources/statsbomb.ts).
- FBref / Sports Reference: respect site terms, `robots.txt`, and rate limits.
  Notice in [`src/sources/fbref.ts`](./src/sources/fbref.ts).

Pass those requirements downstream — do not strip them out.

### Sync examples

```bash
# StatsBomb (default)
node dist/cli.js sync --competition "Liga F"

# FBref pilot (WSL)
node dist/cli.js sync --source fbref --competition "FA Women's Super League"
# alias:
node dist/cli.js sync --source fbref --competition "WSL"
```

## Persistence

- **Default:** `.campo-stats/cache.json` (`--json`)
- **SQLite:** `.campo-stats/campo-stats.sqlite` with `--sqlite` or `--db <path>`
- Migration: `node dist/cli.js migrate --db .campo-stats/campo-stats.sqlite`
- Requirement: Node ≥ 22 (`node:sqlite`). Backup: copy the `.sqlite` / `cache.json` file.

Details: [`docs/sqlite-engine.md`](./docs/sqlite-engine.md), [`docs/sqlite-schema.md`](./docs/sqlite-schema.md).

## Contributing

Adapters: follow the checklist in
[`docs/contributing-adapters.md`](./docs/contributing-adapters.md)
(`FootballSource`, normalization, provenance, terms, offline tests).

## License

Code: MIT (see [`LICENSE`](./LICENSE)). Data: subject to each source's own
terms — see [Data source & terms](#data-source--terms).
