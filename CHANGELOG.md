# Changelog

## 0.4.0

- **Rename (npm):** package **`campus`** → **`campus-stats`** so public
  `npm install campus-stats` works (unscoped `campus` is taken on npmjs.com)
- Publish target: **npmjs.com** primary; GitLab Package Registry as mirror
- CLI bins: `campus` and `campus-stats` (same entrypoint)
- Import path: `import { CampusClient } from "campus-stats"`
- Product brand, `CampusClient`, `.campus/` cache, and `campus-data` unchanged

## 0.3.0

- **Rename:** package/CLI `campo-stats` → **`campus`** (brand alignment)
- API rename: `CampoClient` → `CampusClient`, `CampoCache` → `CampusCache`
- Local cache directory: `.campo-stats/` → `.campus/`
- Data bundle package: `campo-stats-data` → `campus-data`
- Smoke test for package identity (`name`, bin, cache paths)

## 0.2.0

- App-facing `CampusClient` API (`open` / `fromBundle` / `syncFantasy` / queries)
- `sync --fantasy` / `--all`, `update`, `pull`, `available`
- Lineups + season squad queries; default fantasy scoring
- Injuries API stub (empty — no open source yet)
- GitLab CI cron job `refresh_fantasy_data` + `docs/cron.md`
- Competition `international` and team `kind` (`club` | `national`)

## 0.1.0

- Initial package layout (distributed via GitLab Package Registry, not npmjs)
- StatsBomb + FBref (schedule) adapters
- JSON cache and optional SQLite persistence
- Player match stats (StatsBomb, capped)
- Cross-source team identity proposals
