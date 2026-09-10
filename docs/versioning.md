# Versioning

## `0.1.0` (initial public release)

What this version guarantees:

- CLI commands: `sync`, `competitions`, `seasons`, `teams`, `matches`,
  `players`, `player-stats`, `identities`, `migrate`
- Canonical schema for competitions / seasons / teams / matches / players /
  player-match stats / identities
- StatsBomb adapter (women's competitions) with optional `--with-players`
- FBref schedule adapter for WSL / Liga F pilots (`--source fbref`)
- Local stores: JSON cache (default) and SQLite (`--sqlite`, Node ≥ 22)
- Distribution via **GitLab Package Registry** (not npmjs.com)

What it does **not** guarantee yet:

- Stable programmatic API beyond documented exports (may change before 1.0)
- FBref player-level stats
- Full-season player-stats sync without an explicit `--player-stats-limit`
- Availability on the public npmjs registry (intentionally out of scope)

SemVer: breaking CLI/schema changes bump major after 1.0; before 1.0,
breaking changes may appear in minor bumps with release notes.
