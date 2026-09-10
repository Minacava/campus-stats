# Player & PlayerMatchStats

Types in [`src/types.ts`](../src/types.ts).

## `Player`

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | e.g. `statsbomb:player:4658` |
| `name` | yes | Full display name |
| `sources` | yes | Provenance |
| `nickname` | no | |
| `country` | no | |

## `PlayerMatchStats`

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | Unique per (match, player, source) |
| `matchId` | yes | FK to `Match.id` |
| `playerId` | yes | FK to `Player.id` |
| `teamId` | yes | FK to `Team.id` |
| `goals` | yes | Integer ≥ 0 |
| `assists` | yes | Integer ≥ 0 |
| `yellowCards` | yes | Integer ≥ 0 |
| `redCards` | yes | Integer ≥ 0 |
| `sources` | yes | |
| `minutes` | no | Minutes played; `null` if unknown |

v1 metrics are detailed in [`player-stats-metrics.md`](./player-stats-metrics.md).
