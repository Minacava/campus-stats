# Changelog

## Unreleased

- npm `repository` / `bugs` → https://github.com/Minacava/campus-stats
  (`homepage` stays on the public docs site)

## 0.4.3

- npm `homepage` and `repository` both point at
  https://campus-tawny-mu.vercel.app/ (no GitLab repo link on the package page)

## 0.4.2

- `homepage` → https://campus-tawny-mu.vercel.app/
- README on npm no longer links the private source clone URL; points at
  public docs (`campus-docs` / Vercel)

## 0.4.1

- Point npm `repository` / `homepage` / `bugs` at the public docs project
  [`marina34/campus-docs`](https://gitlab.com/marina34/campus-docs)
  (and Pages site), not the private source repo

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
