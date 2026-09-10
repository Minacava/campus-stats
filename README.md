# Campus (`campo-stats`)

Open, normalized, queryable data on women's football — competitions,
seasons, teams and matches, pulled from scattered public sources into
one consistent schema.

Women's football data is real; it's just scattered across inconsistent
formats. `campo-stats` doesn't generate new data — it fetches from
providers who already publish it, and normalizes everything into one
schema so you can query Liga F, the WSL, the NWSL, etc. the same way.

> **Name:** `campus` was already taken on npm, so the package is
> `campo-stats` ("campo" = pitch/field in Spanish).

## Plan de trabajo

Epics y tasks (checklists): [`docs/epics/`](./docs/epics/README.md).  
Inventario inicial del repo: [`docs/inventory-v0.md`](./docs/inventory-v0.md).

| Epic | Descripción |
|------|-------------|
| [00 — Fundación v0](./docs/epics/00-fundacion-v0.md) | Esquema, StatsBomb, CLI, caché JSON |
| [01 — Adapter FBref](./docs/epics/01-adapter-fbref.md) | Segunda fuente pública |
| [02 — Identidad](./docs/epics/02-resolucion-identidad.md) | Resolución cross-source |
| [03 — Stats jugadora](./docs/epics/03-stats-jugadora.md) | Stats a nivel jugadora por partido |
| [04 — SQLite](./docs/epics/04-persistencia-sqlite.md) | Persistencia más allá del JSON |
| [05 — npm](./docs/epics/05-publicacion-npm.md) | Publicación del paquete |

## Quickstart (objetivo v0)

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
```

Una vez publicado: `npx campo-stats sync ...` sin clonar el repo.

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

## Estado actual

Epics 00–04 en curso/hechos: fundación, FBref, identidad, stats jugadora,
SQLite (`--sqlite` / `migrate`). Siguiente: Epic 05 (npm).

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

## Contributing

Adapters: follow the checklist in
[`docs/contributing-adapters.md`](./docs/contributing-adapters.md)
(`FootballSource`, normalization, provenance, terms, offline tests).

## Licencia

Código: MIT (ver [`LICENSE`](./LICENSE)). Datos: sujetos a los términos de
cada fuente — ver [Data source & terms](#data-source--terms).
