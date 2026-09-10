# Versioning

## `0.3.0` (rename to campus)

Breaking rename for brand alignment:

- npm package + CLI: **`campus`** (was `campo-stats`)
- `CampusClient` / `CampusCache` (was `CampoClient` / `CampoCache`)
- Local store: `.campus/` (was `.campo-stats/`)
- Data bundle: `campus-data/latest` (was `campo-stats-data/latest`)

Install:

```bash
npm install campus \
  --registry=https://gitlab.com/api/v4/projects/86296665/packages/npm/
```

## `0.2.0` (app install focus)

- Installable library + CLI via GitLab Package Registry
- Client API: `open`, `fromBundle`, `syncFantasy`, `update`, `pull`, queries
- CLI fantasy sync, lineups/squad, fantasy-points, injuries stub
- Cron-published data bundle

## `0.1.0` (initial public release)

- CLI sync/query, StatsBomb + FBref, JSON/SQLite, player stats (capped), identities
- GitLab Package Registry distribution (not npmjs)

SemVer: breaking CLI/schema changes bump major after 1.0; before 1.0,
breaking changes may appear in minor bumps with release notes.
