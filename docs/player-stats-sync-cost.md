# Player stats sync — cost and storage

## What `--with-players` downloads

For each enriched match (up to `--player-stats-limit`, default **5**):

| StatsBomb resource | Typical size | Notes |
|--------------------|--------------|--------|
| `lineups/{match_id}.json` | ~50–150 KB | Once per match |
| `events/{match_id}.json` | ~1–4 MB | ~3–4k events; **not stored raw** |

Only aggregated `Player` + `PlayerMatchStats` rows are persisted (~tens of
KB per enriched match).

## Rough cost

- Liga F sync **without** players: 1 competitions + 1 matches file ≈ fast,
  cache hundreds of KB.
- Sync with `--with-players --player-stats-limit 5`: +5 lineups + 5 events
  (~10–20 MB downloaded) → small aggregates in cache.
- Enriching **all** 240 Liga F matches: on the order of **hundreds of MB**
  downloaded and a long sync; not the default.

## Requirements

- Node ≥ 20 (package engines: ≥ 22 for SQLite), network to
  `raw.githubusercontent.com` (StatsBomb open-data).
- Disk: JSON cache stays viable with low limits; full-season stats favor
  Epic 04 (SQLite).

## Recommendation

Use `--with-players` only for pilots or with an explicit
`--player-stats-limit` until persistence migrates (see Epic 04 note).
