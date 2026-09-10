# Changelog

## 0.2.0

- App-facing `CampoClient` API (`open` / `fromBundle` / `syncFantasy` / queries)
- `sync --fantasy` / `--all`, `update`, `pull`, `available`
- Lineups + season squad queries; default fantasy scoring
- Injuries API stub (empty — no open source yet)
- GitLab CI cron job `refresh_fantasy_data` + `docs/cron.md`
- Competition `international` and team `kind` (`club` | `national`)

## 0.1.0

- Initial package layout for `campo-stats` (distributed via GitLab Package Registry, not npmjs)
- StatsBomb + FBref (schedule) adapters
- JSON cache and optional SQLite persistence
- Player match stats (StatsBomb, capped)
- Cross-source team identity proposals
