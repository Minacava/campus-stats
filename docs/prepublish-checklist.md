# Pre-publish checklist (GitLab Package Registry)

- [x] `LICENSE` is MIT and included in `files`
- [x] README documents StatsBomb / FBref data terms and credit
- [x] `package.json` `files` whitelists only `dist`, `LICENSE`, `README.md`, `CHANGELOG.md`
- [x] No `.campo-stats/` cache, fixtures, or `node_modules` in the tarball
- [x] `prepack` runs `npm run build`
- [x] `engines.node` is `>=22`
- [x] `npm pack` dry-run reviewed
- [x] CI publishes to **GitLab** (not npmjs) on `vX.Y.Z` tags
- [ ] Tag `v0.1.0` pushed on `main` after merge (creates the downloadable package)

See [`docs/gitlab-package.md`](./gitlab-package.md).
