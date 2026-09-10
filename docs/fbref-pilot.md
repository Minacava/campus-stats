# FBref — pilot competitions and HTML shape

## Pilots

| Competition | FBref comp id | Schedule URL (pattern) |
|-------------|---------------|------------------------|
| FA Women's Super League | `189` | `/en/comps/189/schedule/Womens-Super-League-Scores-and-Fixtures` |
| Liga F | `230` | `/en/comps/230/schedule/Liga-F-Scores-and-Fixtures` |

Optional season in path: `/en/comps/189/2023-2024/schedule/2023-2024-Womens-Super-League-Scores-and-Fixtures`.

v1 of the adapter uses **WSL (`189`)** as the default pilot when requesting
`sync --source fbref --competition "FA Women's Super League"` (and alias `WSL`).

## Expected HTML structure

FBref renders a fixtures table with stable `data-stat` attributes:

- Table: `table.stats_table` whose `id` starts with `sched_`
- Match rows in `tbody > tr` (ignore spacer / thead rows)
- Relevant cells:
  - `data-stat="date"` — text or link `YYYY-MM-DD`
  - `data-stat="home_team"` — link `/en/squads/<id>/...`
  - `data-stat="score"` — text like `1–2` (en-dash) or empty if not played
  - `data-stat="away_team"` — link `/en/squads/<id>/...`

The `campus` parser only reads those `data-stat` values; it does not
depend on volatile CSS classes.

## Access from this environment

HTTP requests to `fbref.com` from the Cloud agent receive **403 Cloudflare
(“Just a moment…”)**. Therefore:

- CI and tests use **HTML fixtures** under `test/fixtures/fbref/`
- The real HTTP client remains ready (rate-limit + UA) for unblocked machines
- We do not version huge dumps; only a minimal WSL schedule sample

## Terms

Data and branding belong to [FBref / Sports Reference](https://www.fbref.com/).
Respect `robots.txt`, rate limits, and site terms of use. This package does
not redistribute bulk FBref dumps; it only normalizes what the user syncs
locally.
