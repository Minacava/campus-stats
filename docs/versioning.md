# Versioning

## `0.4.3` (Vercel for homepage + repository)

- `homepage` and `repository` → https://campus-tawny-mu.vercel.app/

## `0.4.2` (Vercel homepage)

- `homepage` → https://campus-tawny-mu.vercel.app/
- npm README links public docs only (`campus-docs`)

## `0.4.1` (public docs links on npm)

- `package.json` `repository` / `homepage` / `bugs` → `marina34/campus-docs`
  and https://marina34.gitlab.io/campus-docs/

## `0.4.0` (npm package name `campus-stats`)

Breaking rename of the **npm package name** so public install works without a
scope and without a GitLab `.npmrc`:

- npm package: **`campus-stats`** (was `campus`; `campus` is taken on npmjs.com)
- Install: `npm install campus-stats` from registry.npmjs.org
- Import: `import { CampusClient } from "campus-stats"`
- CLI bins: `campus` and `campus-stats` (same binary)
- Product brand, `CampusClient`, `.campus/` cache, and `campus-data` bundle
  names are unchanged
- CI publishes to npmjs (`NPM_TOKEN`) and mirrors to GitLab

## `0.3.0` (rename to campus)

Breaking rename for brand alignment:

- npm package + CLI: **`campus`** (was `campo-stats`)
- `CampusClient` / `CampusCache` (was `CampoClient` / `CampoCache`)
- Local store: `.campus/` (was `.campo-stats/`)
- Data bundle: `campus-data/latest` (was `campo-stats-data/latest`)

## `0.2.0` (app install focus)

- Installable library + CLI via GitLab Package Registry
- Client API: `open`, `fromBundle`, `syncFantasy`, `update`, `pull`, queries
- CLI fantasy sync, lineups/squad, fantasy-points, injuries stub
- Cron-published data bundle

## `0.1.0` (initial public release)

- CLI sync/query, StatsBomb + FBref, JSON/SQLite, player stats (capped), identities
- GitLab Package Registry distribution

SemVer: breaking CLI/schema changes bump major after 1.0; before 1.0,
breaking changes may appear in minor bumps with release notes.
