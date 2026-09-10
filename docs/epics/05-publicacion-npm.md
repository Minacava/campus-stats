# Epic 05 — Package distribution (npmjs + GitLab)

## Goal

Distribute the Campus library/CLI so users can run:

```bash
npm install campus-stats
```

from the **public npm registry**, with an optional mirror on this GitLab
project's Package Registry.

## Context

The unscoped name `campus` is taken on npmjs.com. The published package name
is therefore **`campus-stats`**. The product brand remains Campus; CLI bins
are `campus` and `campus-stats`. Maintainers publish by pushing a `vX.Y.Z`
tag; CI uploads to npmjs (`NPM_TOKEN`) and mirrors to GitLab (`CI_JOB_TOKEN`).

## Definition of done

- `package.json` ready (`name: campus-stats`, bins, `exports`, `files`, version)
- Reproducible build and CLI entrypoints
- README documents `npm install campus-stats` and library usage
- CI publishes to npmjs on version tags; GitLab mirror optional but wired
- Local `npm pack` / dry-run verified
- Maintainer docs for `NPM_TOKEN`

## Tasks

- [x] Finalize package name (`campus-stats`) and `package.json`
- [x] Ensure reproducible build and CLI entrypoints (`campus`, `campus-stats`)
- [x] Consumer-oriented README (npm install, library + CLI)
- [x] Semver notes (`docs/versioning.md`)
- [x] Pre-publish checklist
- [x] CI: `publish_npmjs` + `publish_gitlab_package` on tags
- [x] Document npm publish (`docs/npm.md`) and GitLab mirror
- [ ] Maintainer: set `NPM_TOKEN` and tag `v0.4.0` after merge
