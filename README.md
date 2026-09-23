# Campus (`campus-stats`)

**A data layer for women's football — not a data vendor.**

Campus does **not** sell football data. It **organizes** data from existing
sources into one schema you can query from a CLI or drop into a web app.

You choose how to feed it:

| Path | What you do | What Campus does |
|------|-------------|------------------|
| **Free** | Nothing — already connected | Syncs [StatsBomb Open Data](https://github.com/statsbomb/open-data) (and an FBref schedule pilot) |
| **Your StatsBomb licence** | Set `SB_USERNAME` / `SB_PASSWORD` | Talks to the StatsBomb **paid API** with *your* credentials and normalizes the response |

Same CLI, same `CampusClient`, same local cache either way.

Requires **Node.js ≥ 22**.

---

## Install

```bash
npm install campus-stats
```

Binaries: `campus` and `campus-stats` (same entrypoint).

```bash
npx campus sync --competition "Liga F"
npx campus teams --competition "Liga F"
npx campus matches --competition "Liga F" --team "Barcelona"
```

---

## Try the free path (no account)

Open Data is wired in. No signup, no API key:

```bash
# Sync one competition from StatsBomb Open Data
npx campus sync --competition "Liga F"

# Or every women's competition in the open catalogue
npx campus sync --fantasy

# Optional: lineups + basic player stats (capped)
npx campus sync --fantasy --with-players

# Query the local cache
npx campus competitions
npx campus matches --competition "Liga F" --team "Barcelona"
npx campus squad --competition "Liga F" --team "Barcelona"
npx campus fantasy-points --competition "Liga F"

# Confirm you are on free Open Data
npx campus credentials
# → statsbomb.mode: "open-data"
```

Data is stored in `.campus/cache.json` (or use `--sqlite` / `--db <path>`).

**Free sources today**

| Source | Coverage |
|--------|----------|
| StatsBomb Open Data | Women's competitions published on GitHub (e.g. Liga F, WSL, NWSL, major tournaments) |
| FBref | Schedule pilot — WSL + Liga F (`--source fbref`) |

Coverage and freshness follow what those platforms publish for free.

---

## Use your StatsBomb licence (optional)

If you already pay Hudl StatsBomb, Campus is a thin pipe: **your login → their
paid API → one Campus schema → your app**.

Campus never hosts or resells a StatsBomb subscription.

### 1. Connect credentials

Same env vars as [statsbombpy](https://github.com/statsbomb/statsbombpy):

```bash
export SB_USERNAME="you@company.com"
export SB_PASSWORD="your-statsbomb-password"

npx campus credentials
# → statsbomb.mode: "paid"
```

Or write a local config file (the `.campus/` directory is gitignored):

```json
{
  "statsbomb": {
    "username": "you@company.com",
    "password": "your-statsbomb-password"
  }
}
```

Or one-off flags:

```bash
npx campus sync --competition "Liga F" \
  --sb-user "you@company.com" \
  --sb-password "your-statsbomb-password"
```

### 2. Sync (same commands as free)

```bash
npx campus sync --competition "Liga F"
npx campus sync --fantasy
```

With a paid login, Campus calls `https://data.statsbombservices.com` instead of
Open Data. Which leagues and seasons you get depends on **your StatsBomb
contract**, not on Campus.

### 3. Optional paid-only endpoints

These hit the StatsBomb paid API **directly** when your licence includes them:

| Flag | StatsBomb paid API |
|------|--------------------|
| `--with-paid-player-match-stats` | Player match aggregates |
| `--with-paid-team-match-stats` | Team match aggregates |
| `--with-paid-player-season-stats` | Player season aggregates |
| `--with-paid-team-season-stats` | Team season aggregates |
| `--with-paid-360` | 360 freeze frames |

```bash
npx campus sync --competition "Liga F" \
  --with-paid-player-season-stats \
  --with-paid-player-match-stats
```

See the full endpoint map:

```bash
npx campus endpoints
```

> **FBref:** there is no official API key. `--source fbref` remains free HTML only.

---

## Use in your app

```ts
import { CampusClient, resolveCredentials, syncFantasyBundle } from "campus-stats";

// Free: omit credentials → Open Data
// Paid: set SB_USERNAME / SB_PASSWORD in the environment
const creds = await resolveCredentials();

await syncFantasyBundle({
  includePlayerStats: true,
  credentials: creds.statsbombPaidReady
    ? {
        username: creds.statsbomb.username,
        password: creds.statsbomb.password,
      }
    : undefined,
});

const client = await CampusClient.open();

const clubs = client.teams({ competition: "Liga F", kind: "club" });
const matches = client.matches({ competition: "Liga F", team: "Barcelona" });
const squad = client.squad({ competition: "Liga F", team: "Barcelona" });
const points = client.fantasyPoints({ competition: "Liga F", player: "Walsh" });

return Response.json({ clubs, matches, squad, points });
```

Or load a published bundle without syncing yourself:

```ts
const client = await CampusClient.fromBundle();
```

| Export | Purpose |
|--------|---------|
| `CampusClient` | Open cache / bundle, query teams, matches, squads, fantasy points |
| `syncFantasyBundle` / `updateCachedCompetitions` | Bulk sync helpers |
| `resolveCredentials` | Detect free vs paid StatsBomb login |
| `scoreFantasyPoints` | Default fantasy scoring rules |
| Types | `Competition`, `Season`, `Team`, `Match`, `Player`, `LineupEntry`, … |

---

## CLI cheat sheet

```bash
npx campus sync --fantasy|--all [--with-players] [--player-stats-limit <n>]
npx campus sync --competition <name> [--source statsbomb|fbref] [--with-players]
npx campus update
npx campus pull
npx campus available
npx campus credentials
npx campus endpoints
npx campus competitions
npx campus seasons --competition <name>
npx campus teams --competition <name>
npx campus matches --competition <name> [--season <name>] [--team <name>]
npx campus players [--team <name>] [--name <name>]
npx campus player-stats [--competition <name>] [--match <id>] [--player <name>]
npx campus lineups [--match <id>] [--team <name>]
npx campus squad --competition <name> --team <name>
npx campus fantasy-points [--competition <name>] [--player <name>]
npx campus identities propose --competition <name>
```

Paid extras (require `SB_USERNAME` / `SB_PASSWORD`):  
`--with-paid-player-match-stats`, `--with-paid-team-match-stats`,
`--with-paid-player-season-stats`, `--with-paid-team-season-stats`,
`--with-paid-360`.

---

## Keep data fresh

- **Pull a published snapshot:** `npx campus pull` or `CampusClient.fromBundle()`  
  (this repo can publish a daily `data-latest` release via GitHub Actions).
- **Sync yourself:** `npx campus sync --fantasy` or `npx campus update`.

---

## Design

- **One schema** — your app never sees provider field names.
- **Provenance** — every record carries `sources: [{ source, id }]`.
- **Local-first** — JSON cache by default; SQLite optional (`--sqlite`).

---

## Terms

**Code is MIT. Data is not ours to relicense.**

- [StatsBomb Open Data](https://github.com/statsbomb/open-data) — free for research and genuine football analytics; credit StatsBomb ([media pack](https://statsbomb.com/media-pack/)).
- StatsBomb paid API — your Hudl StatsBomb contract; never commit `SB_USERNAME` / `SB_PASSWORD`.
- FBref / Sports Reference — respect site terms, `robots.txt`, and rate limits.

Pass those requirements downstream to your users.

---

## License

Code: MIT (see [`LICENSE`](./LICENSE)).  
Data: subject to each upstream source’s terms.

Source: https://github.com/Minacava/campus-stats
