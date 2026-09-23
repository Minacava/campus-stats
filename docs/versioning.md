# Versioning

## `0.5.0` (GitHub-only CI + data bundle)

- CI moved from GitLab to **GitHub Actions** (`ci.yml`, `publish.yml`,
  `refresh-data.yml`)
- Data bundle default URL is the rolling Release tag **`data-latest`**
  (no GitLab Package Registry)
- Removed public export `GITLAB_PROJECT_ID` (breaking for anyone who imported it)

## `0.4.5` (docs only on GitHub README)

- Remove Vercel / `campus-docs` from npm metadata and README
- `homepage` → https://github.com/Minacava/campus-stats#readme
- Public documentation lives only in this repository’s README

## `0.4.4` (GitHub repository metadata)

- npm `repository` / `bugs` → https://github.com/Minacava/campus-stats

## `0.4.3` (Vercel for homepage + repository)

- `homepage` and `repository` → https://campus-tawny-mu.vercel.app/

## `0.4.2` (Vercel homepage)

- `homepage` → https://campus-tawny-mu.vercel.app/
- npm README links public docs only (`campus-docs`)

## `0.4.1` (public docs links on npm)

- `package.json` `repository` / `homepage` / `bugs` briefly pointed at
  `marina34/campus-docs` / GitLab Pages (superseded by GitHub + Vercel)

## `0.4.0` (npm package name `campus-stats`)

Breaking rename of the **npm package name** so public install works without a
scope:

- npm package: **`campus-stats`** (was `campus`; `campus` is taken on npmjs.com)
- Install: `npm install campus-stats` from registry.npmjs.org
- Import: `import { CampusClient } from "campus-stats"`
- CLI bins: `campus` and `campus-stats` (same binary)
- Product brand, `CampusClient`, `.campus/` cache unchanged
- CI publishes to npmjs (`NPM_TOKEN`)

## `0.3.0` (rename to campus)

Breaking rename for brand alignment:

- npm package + CLI: **`campus`** (was `campo-stats`)
- `CampusClient` / `CampusCache` (was `CampoClient` / `CampoCache`)
- Local store: `.campus/` (was `.campo-stats/`)
- Data bundle naming era: `campus-data` (was `campo-stats-data`)

## `0.2.0` (app install focus)

- Installable library + CLI
- Client API: `open`, `fromBundle`, `syncFantasy`, `update`, `pull`, queries
- CLI fantasy sync, lineups/squad, fantasy-points
- Cron-published data bundle

## `0.1.0` (initial public release)

- CLI sync/query, StatsBomb + FBref, JSON/SQLite, player stats (capped), identities

SemVer: breaking CLI/schema changes bump major after 1.0; before 1.0,
breaking changes may appear in minor bumps with release notes.
