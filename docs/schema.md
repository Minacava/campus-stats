# Esquema canónico campo-stats

Tipos en [`src/types.ts`](../src/types.ts). Los adapters traducen campos crudos del proveedor a este esquema; el CLI y la caché no ven nombres del proveedor.

## `SourceRef`

| Campo | Obligatorio | Notas |
|-------|-------------|--------|
| `source` | sí | Clave del proveedor (`statsbomb`, …) |
| `id` | sí | ID nativo del proveedor (string) |

## `Competition`

| Campo | Obligatorio | Notas |
|-------|-------------|--------|
| `id` | sí | ID estable campo-stats |
| `name` | sí | Nombre para display / filtros CLI |
| `gender` | sí | Siempre `"female"` en este paquete |
| `sources` | sí | ≥1 provenance |
| `country` | no | País o región |

## `Season`

| Campo | Obligatorio | Notas |
|-------|-------------|--------|
| `id` | sí | |
| `name` | sí | p. ej. `2023/2024` |
| `competitionId` | sí | FK lógica a `Competition.id` |
| `sources` | sí | |

## `Team`

| Campo | Obligatorio | Notas |
|-------|-------------|--------|
| `id` | sí | |
| `name` | sí | |
| `sources` | sí | |
| `country` | no | |

## `Match`

| Campo | Obligatorio | Notas |
|-------|-------------|--------|
| `id` | sí | |
| `competitionId` | sí | |
| `seasonId` | sí | |
| `homeTeamId` | sí | |
| `awayTeamId` | sí | |
| `sources` | sí | |
| `date` | no | `YYYY-MM-DD` |
| `homeScore` / `awayScore` | no | `null` si no disputado / desconocido |

## `CampoCache`

Contenedor de arrays: `competitions`, `seasons`, `teams`, `matches`,
`identities`, `players`, `playerMatchStats`. Persistido en v0 como
`.campo-stats/cache.json`.
