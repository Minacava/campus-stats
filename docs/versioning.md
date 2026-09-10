# Versioning

## `0.2.0` (app install focus)

What this version guarantees:

- Installable library + CLI via GitLab Package Registry
- `CampoClient` for apps: `open`, `fromBundle`, `syncFantasy`, `update`, `pull`, queries
- CLI: `sync --fantasy|--all`, `update`, `pull`, `available`, `lineups`, `squad`,
  `fantasy-points`, `injuries`, plus prior query commands
- Canonical schema including lineups; injuries type present (empty feed)
- StatsBomb women's catalogue (clubs + national teams) and FBref schedule pilots
- Cron-published data bundle (`campo-stats-data/latest`) via GitLab schedule

What it does **not** guarantee yet:

- Injury data from an open source
- FBref player-level stats
- Full-season player-stats sync without `--player-stats-limit`
- Availability on the public npmjs registry (intentionally out of scope)

## `0.1.0` (initial public release)

- CLI sync/query, StatsBomb + FBref, JSON/SQLite, player stats (capped), identities
- GitLab Package Registry distribution (not npmjs)

SemVer: breaking CLI/schema changes bump major after 1.0; before 1.0,
breaking changes may appear in minor bumps with release notes.
