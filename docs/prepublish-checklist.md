# Pre-publish checklist (npmjs)

- [x] `LICENSE` is MIT and included in `files`
- [x] README documents StatsBomb / FBref data terms and credit
- [x] `package.json` `files` whitelists only `dist`, `LICENSE`, `README.md`, `CHANGELOG.md`
- [x] No `.campus/` cache, fixtures, or `node_modules` in the tarball
- [x] `prepack` runs `npm run build`
- [x] `engines.node` is `>=22`
- [x] Package name is unscoped **`campus-stats`** (free on npmjs)
- [x] CLI bins: `campus` and `campus-stats`
- [x] CI publishes to **npmjs** on `vX.Y.Z` tags (GitHub Actions `publish.yml`)
- [ ] GitHub Actions secret `NPM_TOKEN` set
- [ ] Tag `vX.Y.Z` pushed on `main` after merge

See [`docs/npm.md`](./npm.md).
