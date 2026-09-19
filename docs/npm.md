# Publish `campus-stats` to npmjs.com

Public install (no `.npmrc`, no scope):

```bash
npm install campus-stats
npx campus --help
```

Package page: https://www.npmjs.com/package/campus-stats

## One-time maintainer setup

1. Create (or use) an [npmjs.com](https://www.npmjs.com/) account that owns
   the `campus-stats` package.
2. Create an **Automation** access token (or granular publish token) with
   permission to publish `campus-stats`.
3. In GitHub → **Settings → Secrets and variables → Actions**, add:
   - Name: `NPM_TOKEN`
   - Value: the npm token
4. Prefer protecting `v*` tags (or restricting who can create release tags) so
   only trusted pushes trigger publish.

## How a version is released

On `main`, after merge:

```bash
git tag v0.4.1
git push origin v0.4.1
```

GitHub Actions runs the **Publish npm** workflow:

- `npm ci` → build → `npm publish --access public` to registry.npmjs.org

The package `name` in `package.json` must stay **`campus-stats`** (unscoped).
The product brand remains **Campus**; CLI bins are `campus` and `campus-stats`.
Public links on the npm page:

- `repository` / `bugs` / `homepage`: https://github.com/Minacava/campus-stats
  (docs live in the GitHub README; no separate docs site)

## Local dry-run

```bash
npm pack
npm publish --dry-run
```
