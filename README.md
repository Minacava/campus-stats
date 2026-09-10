# Campus (`campo-stats`)

**Open, normalized, queryable data for women's football — installable in your app.**

`campo-stats` is an npm package (library + CLI) that pulls women's football stats
from public sources, normalizes them into one schema, and gives your web/API/app
access to competitions, seasons, clubs, national teams, matches, lineups,
player stats, and basic fantasy points.

<<<<<<< HEAD
Requires **Node.js ≥ 22** (library and CLI). For browser UIs, load data in a
Node/serverless backend (or ship a pre-pulled JSON cache) and send JSON to the
client.
=======
Requires **Node.js ≥ 22**.
>>>>>>> origin/main

---

## Install in a web/app project

Packages are published from this GitLab project (not npmjs.com):

```bash
npm install campo-stats \
  --registry=https://gitlab.com/api/v4/projects/86296665/packages/npm/
```

Or pin a tarball after a tagged release:

```bash
npm install \
  https://gitlab.com/api/v4/projects/86296665/packages/generic/campo-stats/0.2.0/campo-stats-0.2.0.tgz
```

> Until the first `vX.Y.Z` tag is published, clone this repo and
> `npm install /path/to/campus` / `npm pack`.

Browse packages: https://gitlab.com/marina34/campus/-/packages

---

## Use as a library (recommended for apps)

```ts
import { CampoClient } from "campo-stats";

// Option A — pull the cron-refreshed data bundle (no local sync needed)
const client = await CampoClient.fromBundle();

// Option B — open/create a local cache and sync everything once
// const client = await CampoClient.open();
// await client.syncFantasy({ includePlayerStats: true });

const clubs = client.teams({ competition: "Liga F", kind: "club" });
const nations = client.teams({ competition: "Women's World Cup", kind: "national" });
const matches = client.matches({ competition: "Liga F", team: "Barcelona" });
const squad = client.squad({ competition: "Liga F", team: "Barcelona" });
const points = client.fantasyPoints({ competition: "Liga F", player: "Walsh" });

// Serialize to your frontend
return Response.json({ clubs, nations, matches, squad, points });
```

### What you get from the package

| API | Purpose |
|-----|---------|
| `CampoClient` | Main entry for apps: sync / pull / query |
| `syncFantasyBundle` / `updateCachedCompetitions` | Low-level sync helpers |
| `scoreFantasyPoints` | Default fantasy scoring rules |
| `listInjuries` | Stable stub (empty until a source exists) |
| Types | `Competition`, `Team`, `Match`, `Player`, `LineupEntry`, … |
| CLI bin `campo-stats` | Same data from the terminal |

---

## Keep data fresh (cron)

1. GitLab **Pipeline schedule** on `main` (e.g. `0 6 * * *`) runs
   `refresh_fantasy_data` and publishes `campo-stats-data/latest/cache.json`.
2. Apps call `CampoClient.fromBundle()` or `npx campo-stats pull`.

Details: [`docs/cron.md`](./docs/cron.md).

---

## CLI quick start

```bash
npx campo-stats sync --fantasy                 # all women's comps (clubs + selecciones)
npx campo-stats sync --fantasy --with-players  # + lineups + player stats (capped)
npx campo-stats pull                           # download cron bundle
npx campo-stats competitions
npx campo-stats matches --competition "Liga F" --team "Barcelona"
npx campo-stats squad --competition "Liga F" --team "Barcelona"
npx campo-stats fantasy-points --competition "Liga F"
npx campo-stats injuries                       # empty + documented deferral
```

Store: `.campo-stats/cache.json` (or `--sqlite`).

---

## Supported data (open sources)

| Source | Coverage | Notes |
|--------|----------|-------|
| **StatsBomb Open Data** | Liga F, WSL, NWSL, Serie A Women, Frauen Bundesliga, Women's World Cup, UEFA Women's Euro | Clubs + national teams; optional player stats / lineups |
| **FBref** | WSL + Liga F schedules (pilot) | Live HTML may hit Cloudflare |

Injuries are **not** in these open feeds yet — the API is ready, the list is empty.

---

## Develop from a clone

```bash
git clone https://gitlab.com/marina34/campus.git
cd campus
npm install
npm run build
npm test
node dist/cli.js --help
```

---

<<<<<<< HEAD
=======
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

`campo-stats` does **not** refresh in the background by itself. Data stays as
of the last `sync` until you run it again (or schedule that command).

```bash
# Manual refresh — pulls latest and merges into the local cache
npx campo-stats sync --competition "Liga F"

# Add another competition without wiping what you already have
npx campo-stats sync --competition "FA Women's Super League"
```

Each sync **merges** into `.campo-stats/cache.json` (or your SQLite DB). It
does not wipe previous leagues. Existing records are updated when the source
sends newer values; new matches/teams are appended.

**To update automatically**, schedule `sync` with cron, systemd timers, or a
CI scheduled pipeline — for example once a day:

```cron
0 6 * * * cd /path/to/your/project && npx campo-stats sync --competition "Liga F"
```

There is no built-in daemon or push notification when sources publish new
matches; automation is “run sync on a schedule.”

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

>>>>>>> origin/main
## Project plan & docs

| Epic | Description |
|------|-------------|
| [00 — Foundation](./docs/epics/00-fundacion-v0.md) | Schema, StatsBomb, CLI, JSON cache |
| [01 — FBref](./docs/epics/01-adapter-fbref.md) | Second public source |
| [02 — Identity](./docs/epics/02-resolucion-identidad.md) | Cross-source team resolution |
| [03 — Player stats](./docs/epics/03-stats-jugadora.md) | Per-match player stats |
| [04 — SQLite](./docs/epics/04-persistencia-sqlite.md) | Persistence beyond JSON |
| [05 — Package](./docs/epics/05-publicacion-npm.md) | GitLab package distribution |

More: [`docs/cron.md`](./docs/cron.md) · [`docs/injuries.md`](./docs/injuries.md) · [`CHANGELOG.md`](./CHANGELOG.md)

---

## Data source & terms

**Code is MIT. Data is not ours to relicense.**

- [StatsBomb Open Data](https://github.com/statsbomb/open-data): free for research and genuine football analytics. Credit StatsBomb in published analysis ([media pack](https://statsbomb.com/media-pack/)).
- FBref / Sports Reference: respect site terms, `robots.txt`, and rate limits.

Pass those requirements downstream.

---

## License

Code: MIT (see [`LICENSE`](./LICENSE)). Data: subject to each source's terms.
