# Pre-publish checklist (npmjs + GitLab)

- [x] `LICENSE` is MIT and included in `files`
- [x] README documents StatsBomb / FBref data terms and credit
- [x] `package.json` `files` whitelists only `dist`, `LICENSE`, `README.md`, `CHANGELOG.md`
- [x] No `.campus/` cache, fixtures, or `node_modules` in the tarball
- [x] `prepack` runs `npm run build`
- [x] `engines.node` is `>=22`
- [x] Package name is unscoped **`campus-stats`** (free on npmjs)
- [x] CLI bins: `campus` and `campus-stats`
- [x] CI publishes to **npmjs** on `vX.Y.Z` tags (`publish_npmjs`)
- [x] CI mirrors to **GitLab** Package Registry on the same tags
- [ ] GitLab CI/CD variable `NPM_TOKEN` set (masked + protected)
- [ ] Tag `v0.4.0` pushed on `main` after merge

See [`docs/npm.md`](./npm.md) and [`docs/gitlab-package.md`](./gitlab-package.md).
