# Pre-publish checklist

- [x] `LICENSE` is MIT and included in `files`
- [x] README documents StatsBomb / FBref data terms and credit
- [x] `package.json` `files` whitelists only `dist`, `LICENSE`, `README.md`, `CHANGELOG.md`
- [x] No `.campo-stats/` cache, fixtures, or `node_modules` in the tarball
- [x] `prepack` runs `npm run build`
- [x] `engines.node` is `>=22`
- [x] `npm pack` dry-run reviewed
- [ ] `npm publish --dry-run` succeeds (or real publish with npm token)
- [ ] Tag `v0.1.0` created after publish
