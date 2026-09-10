# FBref player stats — deferred in v1

The Epic 01 FBref adapter only parses **schedule** (`sched_*` tables).
Player stats on FBref live on different pages (e.g. match summary / player
match logs), with different HTML and higher block risk.

## Epic 03 decision

- **StatsBomb** is the v1 source for `Player` / `PlayerMatchStats`.
- **FBref → same schema** is **deferred** until we have:
  1. Stable access (no Cloudflare in the sync environment), and
  2. HTML fixtures for a per-match stats page.

Do not invent parsers over uncaptured HTML. When resumed, the mapping must
emit the same v1 metrics (`goals`, `assists`, `minutes`, `yellowCards`,
`redCards`) with `sources: [{ source: "fbref", id }]`.
