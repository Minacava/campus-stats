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

Código del paquete aún no aterrizado (ver inventario). El trabajo
comienza por el Epic 00.

## Licencia

Código: MIT. Datos: sujetos a los términos de cada fuente (crédito a
StatsBomb en análisis publicados — ver Epic 00 / sección de datos).
