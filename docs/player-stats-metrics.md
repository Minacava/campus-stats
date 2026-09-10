# Player match metrics — v1 subset

v1 does **not** store raw StatsBomb events. It aggregates a stable subset
per player and match:

| Metric | Field | How it is obtained (StatsBomb) |
|--------|-------|--------------------------------|
| Minutes | `minutes` | Sum of `positions[].from`→`to` intervals in lineups (rounded to whole minutes) |
| Goals | `goals` | `Shot` events with `shot.outcome.name === "Goal"` (own goals excluded if separate) |
| Assists | `assists` | Passes with `pass.goal_assist === true` (or shot `key_pass_id` resolved to the pass) |
| Yellow cards | `yellowCards` | `lineup[].cards` type Yellow Card / equivalent events |
| Red cards | `redCards` | `lineup[].cards` type Red Card / Second Yellow |

## Out of v1

- xG, passes, carries, pressures, heatmaps
- Raw events (`events/*.json` complete) in the cache
- FBref player table stats (separate task; different HTML)

## Why this cut

Covers “who scored / assisted / played X minutes?” without persisting ~4k
events per match. When lineup+stats volume pushes JSON too far, move to
SQLite (Epic 04).
