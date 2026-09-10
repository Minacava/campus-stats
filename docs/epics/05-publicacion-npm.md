# Epic 05 — npm publication (`campo-stats`)

## Goal

Publish the package/CLI to npm so it can be used with `npx campo-stats ...`
without a local install of the repo.

## Context

The provisional name is `campo-stats`. Before publishing: correct exports/bin,
TypeScript build, consumer README, semver, and legal checklist (MIT + data
source credits).

## Definition of done

- Package installable from npm (or verified publish dry-run)
- `npx campo-stats --help` / basic sync works after install
- Clear version and changelog; release CI documented or automated

## Tasks

- [x] Finalize package name (`campo-stats` or scoped) and `package.json` (name, bin, exports, files)
- [x] Ensure reproducible build (`npm run build`) and correct CLI entrypoints
- [x] Consumer-oriented README (npx quickstart, supported competitions, credits)
- [x] Define initial semver (e.g. `0.1.0`) and what that version guarantees
- [ ] Pre-publish checklist: license, data terms, `.npmignore` / `files`, do not ship cache or huge fixtures
- [ ] Test local pack (`npm pack`) and install from tarball
- [ ] (Optional) CI pipeline: test + publish on tag
- [ ] Publish and verify `npx campo-stats` in a clean directory
