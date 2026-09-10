# Player & PlayerMatchStats

Tipos en [`src/types.ts`](../src/types.ts).

## `Player`

| Campo | Obligatorio | Notas |
|-------|-------------|--------|
| `id` | sí | p. ej. `statsbomb:player:4658` |
| `name` | sí | Nombre completo de display |
| `sources` | sí | Provenance |
| `nickname` | no | |
| `country` | no | |

## `PlayerMatchStats`

| Campo | Obligatorio | Notas |
|-------|-------------|--------|
| `id` | sí | Único por (match, player, source) |
| `matchId` | sí | FK a `Match.id` |
| `playerId` | sí | FK a `Player.id` |
| `teamId` | sí | FK a `Team.id` |
| `goals` | sí | Entero ≥ 0 |
| `assists` | sí | Entero ≥ 0 |
| `yellowCards` | sí | Entero ≥ 0 |
| `redCards` | sí | Entero ≥ 0 |
| `sources` | sí | |
| `minutes` | no | Minutos jugados; `null` si desconocido |

Las métricas v1 se detallan en [`player-stats-metrics.md`](./player-stats-metrics.md).
