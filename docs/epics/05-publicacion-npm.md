# Epic 05 — Package distribution via GitLab

## Goal

Distribute the `campo-stats` CLI/library so users can install it **from this
GitLab project** (Package Registry / tarball) — **not** from npmjs.com.

## Context

Package name remains `campo-stats`. Consumers install with the project npm
registry URL or a Generic Package tarball. Maintainers publish by pushing a
`vX.Y.Z` tag; CI uploads to GitLab using `CI_JOB_TOKEN`.

## Definition of done

- `package.json` ready (`name`, `bin`, `exports`, `files`, version)
- Reproducible build and CLI entrypoint
- README clearly documents install from GitLab, usage, and use cases
- CI publishes to GitLab Package Registry on version tags (no npmjs)
- Local `npm pack` / install-from-tarball verified

## Tasks

- [x] Finalize package name (`campo-stats`) and `package.json` (name, bin, exports, files)
- [x] Ensure reproducible build (`npm run build`) and correct CLI entrypoints
- [x] Consumer-oriented README (GitLab install, how to use, use cases, credits)
- [x] Define initial semver (e.g. `0.1.0`) and what that version guarantees
- [x] Pre-publish checklist: license, data terms, `files` / `.npmignore`, no cache/fixtures in the tarball
- [x] Test local pack (`npm pack`) and install from tarball
- [x] CI pipeline: test + publish to **GitLab** Package Registry on tag
- [x] Document install from GitLab (`docs/gitlab-package.md`); do **not** publish to npmjs

## Definition of done — status

Epic 05 complete for GitLab distribution. Push tag `v0.1.0` on `main` after
merge to populate Deploy → Package registry.
