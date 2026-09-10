# Campus (`campus-stats`)

**Open, normalized, queryable data for women's football — installable in your app.**

`campus-stats` is the npm package for **Campus**: a library + CLI that pulls
women's football stats from public sources, normalizes them into one schema,
and gives your web/API/app access to competitions, seasons, clubs, national
teams, matches, lineups, player stats, and basic fantasy points.

Requires **Node.js ≥ 22**.

---

## Install

Published on **npmjs.com**:

```bash
npm install campus-stats

npx campus sync --competition "Liga F"
npx campus teams --competition "Liga F"
npx campus matches --competition "Liga F" --team "Barcelona"
```

The CLI binaries are `campus` and `campus-stats` (same entrypoint).

Docs: https://campus-tawny-mu.vercel.app/  
Public docs repo: https://gitlab.com/marina34/campus-docs

---

## Use as a library (recommended for apps)

```ts
import { CampusClient } from "campus-stats";

const client = await CampusClient.open();
await client.syncFantasy({ includePlayerStats: true });
// or: const client = await CampusClient.fromBundle();

const clubs = client.teams({ competition: "Liga F", kind: "club" });
const nations = client.teams({ competition: "Women's World Cup", kind: "national" });
const matches = client.matches({ competition: "Liga F", team: "Barcelona" });
const squad = client.squad({ competition: "Liga F", team: "Barcelona" });
const points = client.fantasyPoints({ competition: "Liga F", player: "Walsh" });

return Response.json({ clubs, nations, matches, squad, points });
```

### What you get from the package

| API | Purpose |
|-----|---------|
| `CampusClient` | Main entry for apps: sync / pull / query |
| `syncFantasyBundle` / `updateCachedCompetitions` | Low-level sync helpers |
| `scoreFantasyPoints` | Default fantasy scoring rules |
| `listInjuries` | Stable stub (empty until a source exists) |
| Types | `Competition`, `Team`, `Match`, `Player`, `LineupEntry`, … |
| CLI bins `campus` / `campus-stats` | Same data from the terminal |

---

## Keep data fresh (cron)

1. GitLab **Pipeline schedule** on `main` (e.g. `0 6 * * *`) runs
   `refresh_fantasy_data` and publishes `campus-data/latest/cache.json`.
2. Apps call `CampusClient.fromBundle()` or `npx campus pull`.

Details: [`docs/cron.md`](./docs/cron.md).

---

## CLI quick start

After `npm install campus-stats`:

```bash
npx campus sync --fantasy                 # all women's comps (clubs + selecciones)
npx campus sync --fantasy --with-players  # + lineups + player stats (capped)
npx campus pull                           # download cron bundle
npx campus competitions
npx campus matches --competition "Liga F" --team "Barcelona"
npx campus squad --competition "Liga F" --team "Barcelona"
npx campus fantasy-points --competition "Liga F"
npx campus injuries                       # empty + documented deferral
```

Store: `.campus/cache.json` (or `--sqlite` / `--db <path>`).

Single-competition sync and identities still work:

```bash
npx campus sync --competition "Liga F"
npx campus sync --source fbref --competition "WSL"
npx campus identities propose --competition "Liga F"
```

---

## Supported data (open sources)

| Source | Coverage | Notes |
|--------|----------|-------|
| **StatsBomb Open Data** | Liga F, WSL, NWSL, Serie A Women, Frauen Bundesliga, Women's World Cup, UEFA Women's Euro | Clubs + national teams; optional player stats / lineups |
| **FBref** | WSL + Liga F schedules (pilot) | Live HTML may hit Cloudflare |

Injuries are **not** in these open feeds yet — the API is ready, the list is empty.

---

## Why this shape

- **One canonical schema** (`Competition`, `Season`, `Team`, `Match`, …). Adapters translate; the app never sees provider field names.
- **Provenance on every record** (`sources: [{ source, id }]`) so cross-source identity is possible.
- **Local-first cache** (JSON by default, SQLite optional) — no hosted database required for the library.

---

## Docs

- Product / install docs: https://campus-tawny-mu.vercel.app/
- Docs source (public): https://gitlab.com/marina34/campus-docs

---

## Data source & terms

**Code is MIT. Data is not ours to relicense.**

- [StatsBomb Open Data](https://github.com/statsbomb/open-data): free for research and genuine football analytics. Credit StatsBomb in published analysis ([media pack](https://statsbomb.com/media-pack/)).
- FBref / Sports Reference: respect site terms, `robots.txt`, and rate limits.

Pass those requirements downstream.

---

## License

Code: MIT (see [`LICENSE`](./LICENSE)). Data: subject to each source's terms.
