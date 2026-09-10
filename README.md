# Campus (`campo-stats`)

**Open, normalized, queryable data for women's football.**

`campo-stats` is a small Node.js CLI (and library) that pulls women's football
stats from public sources that already publish them, normalizes everything into
one schema, and lets you query competitions, seasons, teams, matches, and
player stats the same way — whether the data came from StatsBomb, FBref, or a
future adapter.

Requires **Node.js ≥ 22**.

---

## What problem it solves

Women's football data exists, but it is scattered across inconsistent formats.
Tools built for the men's game often skip it. If you want to answer simple
questions like “how many matches did Barcelona play in Liga F 2023/24?” or
“who scored in this WSL match?” without hand-merging CSVs, `campo-stats` is
for you.

## Use cases

1. **Research / analytics notebooks**  
   Sync Liga F or the WSL once, then query matches and player stats from a
   local JSON or SQLite cache inside a Python/R/JS notebook workflow.

2. **Journalism & reporting**  
   Pull a season of fixtures and scores for a women's league, filter by team,
   and export facts for a story — with provenance pointing back to StatsBomb
   or FBref.

3. **Product prototypes**  
   Build a dashboard or API that treats Liga F, WSL, and NWSL through one
   schema instead of writing a custom scraper per league.

4. **Teaching & workshops**  
   Demonstrate open-data football analytics with real women's competitions
   (`sync` → local cache → query), without setting up a database server.

5. **Cross-source experiments**  
   Sync StatsBomb + FBref, then use `identities propose` to explore how the
   same clubs are named differently across providers.

---

## Install from GitLab

Packages live in this project's registry (not npmjs):

```bash
npm install campo-stats \
  --registry=https://gitlab.com/api/v4/projects/86296665/packages/npm/
```

Or download a release tarball from the Generic Package Registry (after a
tagged release), for example:

```bash
npm install \
  https://gitlab.com/api/v4/projects/86296665/packages/generic/campo-stats/0.1.0/campo-stats-0.1.0.tgz
```

Browse packages: https://gitlab.com/marina34/campus/-/packages  

Full install options: [`docs/gitlab-package.md`](./docs/gitlab-package.md).

### Develop from a clone

```bash
git clone https://gitlab.com/marina34/campus.git
cd campus
npm install
npm run build
node dist/cli.js --help
```

---

## How to use (CLI)

All commands write/read a local store in the current directory:

- Default: `.campo-stats/cache.json`
- Optional: SQLite with `--sqlite` or `--db <path>`

### 1. Sync a competition

```bash
# StatsBomb (default)
npx campo-stats sync --competition "Liga F"

# FBref pilot (schedule HTML; may be blocked by Cloudflare on some networks)
npx campo-stats sync --source fbref --competition "WSL"
```

### Update with new data

There is no separate “update” command. Re-run `sync` when you want fresh data
from the sources:

```bash
# Same competition again — pulls latest and merges into the local cache
npx campo-stats sync --competition "Liga F"

# Add another competition without wiping what you already have
npx campo-stats sync --competition "FA Women's Super League"
```

Each sync **merges** into `.campo-stats/cache.json` (or your SQLite DB). It
does not wipe previous leagues. Existing records are updated when the source
sends newer values; new matches/teams are appended.

### 2. Query what you synced

```bash
npx campo-stats competitions
npx campo-stats seasons --competition "Liga F"
npx campo-stats teams --competition "Liga F"
npx campo-stats matches --competition "Liga F" --season "2023/2024" --team "Barcelona"
```

### 3. Optional player match stats (StatsBomb)

Event files are large, so enrichment is capped (default 5 matches):

```bash
npx campo-stats sync --competition "Liga F" --with-players --player-stats-limit 3
npx campo-stats players --name "Walsh"
npx campo-stats player-stats --competition "Liga F" --player "Walsh"
```

### 4. Optional cross-source team identities

After you have teams from two sources in the cache:

```bash
npx campo-stats identities propose --competition "Liga F"
npx campo-stats identities --status pending
npx campo-stats identities confirm --id identity:team:barcelona
```

### 5. Optional SQLite store

```bash
npx campo-stats migrate --db .campo-stats/campo-stats.sqlite
npx campo-stats sync --competition "Liga F" --sqlite
npx campo-stats competitions --sqlite
```

---

## Supported data (v0.1)

| Source | What you get | Notes |
|--------|----------------|-------|
| **StatsBomb Open Data** | Competitions, seasons, teams, matches; optional player stats | Liga F, FA WSL, Frauen-Bundesliga, Serie A Women, NWSL, Women's World Cup, UEFA Women's Euro |
| **FBref** | Schedule → competitions / seasons / teams / matches | Pilots: WSL, Liga F. Live HTML may hit Cloudflare; CI uses fixtures |

---

## Why this shape

- **One canonical schema** (`Competition`, `Season`, `Team`, `Match`, …). Adapters translate; the CLI never sees provider field names.
- **Provenance on every record** (`sources: [{ source, id }]`) so cross-source identity is possible later.
- **Local-first cache** (JSON by default, SQLite optional) — no hosted database required.

---

## Project plan & docs

| Epic | Description |
|------|-------------|
| [00 — Foundation](./docs/epics/00-fundacion-v0.md) | Schema, StatsBomb, CLI, JSON cache |
| [01 — FBref](./docs/epics/01-adapter-fbref.md) | Second public source |
| [02 — Identity](./docs/epics/02-resolucion-identidad.md) | Cross-source team resolution |
| [03 — Player stats](./docs/epics/03-stats-jugadora.md) | Per-match player stats |
| [04 — SQLite](./docs/epics/04-persistencia-sqlite.md) | Persistence beyond JSON |
| [05 — Package](./docs/epics/05-publicacion-npm.md) | GitLab package distribution |

More: [`docs/epics/`](./docs/epics/README.md) · [`docs/versioning.md`](./docs/versioning.md) · [`CHANGELOG.md`](./CHANGELOG.md)

---

## Data source & terms

**Code is MIT. Data is not ours to relicense.**

- [StatsBomb Open Data](https://github.com/statsbomb/open-data): free for research and genuine football analytics. Credit StatsBomb in published analysis ([media pack](https://statsbomb.com/media-pack/)).
- FBref / Sports Reference: respect site terms, `robots.txt`, and rate limits.

Pass those requirements downstream.

---

## License

Code: MIT (see [`LICENSE`](./LICENSE)). Data: subject to each source's terms —
see [Data source & terms](#data-source--terms).
