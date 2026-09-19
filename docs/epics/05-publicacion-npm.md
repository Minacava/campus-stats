# Epic 05 — Package distribution (npmjs)

## Goal

Distribute the Campus library/CLI so users can run:

```bash
npm install campus-stats
```

from the **public npm registry**.

## Context

The unscoped name `campus` is taken on npmjs.com. The published package name
is therefore **`campus-stats`**. The product brand remains Campus; CLI bins
are `campus` and `campus-stats`. Maintainers publish by pushing a `vX.Y.Z`
tag; GitHub Actions uploads to npmjs (`NPM_TOKEN` repository secret).

## Definition of done

- `package.json` ready (`name: campus-stats`, bins, `exports`, `files`, version)
- Reproducible build and CLI entrypoints
- README documents `npm install campus-stats` and library usage
- CI publishes to npmjs on version tags (GitHub Actions)
- Local `npm pack` / dry-run verified
- Maintainer docs for `NPM_TOKEN`

## Tasks

- [x] Finalize package name (`campus-stats`) and `package.json`
- [x] Ensure reproducible build and CLI entrypoints (`campus`, `campus-stats`)
- [x] Consumer-oriented README (npm install, library + CLI)
- [x] Semver notes (`docs/versioning.md`)
- [x] Pre-publish checklist
- [x] CI: GitHub Actions `publish.yml` on tags
- [x] Document npm publish (`docs/npm.md`)
- [ ] Maintainer: set GitHub secret `NPM_TOKEN` and tag `vX.Y.Z` after merge
