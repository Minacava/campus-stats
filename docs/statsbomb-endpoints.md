# StatsBomb endpoints (free vs paid)

See the public README for how to use free Open Data vs a paid StatsBomb login.

This file mirrors the catalogue in `src/sources/statsbomb-endpoints.ts`
(`npx campus endpoints`).

## Core (wired in Campus)

| Endpoint | Open Data | Paid API |
|----------|-----------|----------|
| Competitions | ✅ | ✅ (your contract) |
| Matches | ✅ | ✅ |
| Lineups | ✅ | ✅ (`--with-players`) |
| Events | ✅ | ✅ (`--with-players`) |

## Extra (StatsBomb paid API — optional flags)

| Endpoint | CLI flag |
|----------|----------|
| Player match stats | `--with-paid-player-match-stats` |
| Team match stats | `--with-paid-team-match-stats` |
| Player season stats | `--with-paid-player-season-stats` |
| Team season stats | `--with-paid-team-season-stats` |
| 360 frames | `--with-paid-360` |

These hit `https://data.statsbombservices.com` with `SB_USERNAME` / `SB_PASSWORD`.
