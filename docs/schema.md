# Canonical campo-stats schema

Types live in [`src/types.ts`](../src/types.ts). Adapters translate raw
provider fields into this schema; the CLI and cache never see provider names.

## `SourceRef`

| Field | Required | Notes |
|-------|----------|--------|
| `source` | yes | Provider key (`statsbomb`, …) |
| `id` | yes | Native provider ID (string) |

## `Competition`

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | Stable campo-stats ID |
| `name` | yes | Display name / CLI filters |
| `gender` | yes | Always `"female"` in this package |
| `sources` | yes | ≥1 provenance |
| `country` | no | Country or region |

## `Season`

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | |
| `name` | yes | e.g. `2023/2024` |
| `competitionId` | yes | Logical FK to `Competition.id` |
| `sources` | yes | |

## `Team`

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | |
| `name` | yes | |
| `sources` | yes | |
| `country` | no | |

## `Match`

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | |
| `competitionId` | yes | |
| `seasonId` | yes | |
| `homeTeamId` | yes | |
| `awayTeamId` | yes | |
| `sources` | yes | |
| `date` | no | `YYYY-MM-DD` |
| `homeScore` / `awayScore` | no | `null` if not played / unknown |

## `CampoCache`

Container of arrays: `competitions`, `seasons`, `teams`, `matches`,
`identities`, `players`, `playerMatchStats`. Persisted in v0 as
`.campo-stats/cache.json`.
