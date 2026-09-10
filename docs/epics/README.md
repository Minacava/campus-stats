# Campus / campo-stats — Epics

Open data layer for women's football: an npm/CLI package that normalizes
statistics from scattered, inconsistent public sources into one
**queryable schema**.

## Why it exists

Women's football data coverage lags far behind the men's game. The data
exists, but it is spread across inconsistent formats, and many tools built
for the men's game do not cover it. `campo-stats` does not invent data: it
fetches from providers that already publish it and unifies it so you can
query Liga F, WSL, NWSL, etc. the same way.

The npm package name is `campo-stats`.

## Current status (v0)

- Canonical schema: `Competition`, `Season`, `Team`, `Match`
- One adapter: [StatsBomb Open Data](https://github.com/statsbomb/open-data)
- CLI: `sync`, `competitions`, `seasons`, `teams`, `matches`
- Local JSON cache (`.campo-stats/cache.json`), merged on every sync
- Provenance per entity (`sources: [{ source, id }]`)

## Epic order

| # | Epic | Depends on |
|---|------|------------|
| 00 | [Foundation v0](./00-fundacion-v0.md) | — |
| 01 | [FBref adapter](./01-adapter-fbref.md) | 00 |
| 02 | [Identity resolution](./02-resolucion-identidad.md) | 01 |
| 03 | [Player-level stats](./03-stats-jugadora.md) | 00 (ideally 02) |
| 04 | [SQLite persistence](./04-persistencia-sqlite.md) | 00 (needed before/during 03 at scale) |
| 05 | [Package (GitLab)](./05-publicacion-npm.md) | Stable API (after 01–04 per release scope) |

Each epic lists **Tasks** as checkboxes. Mark them when done; do not invent
scope outside the list without updating the epic.
