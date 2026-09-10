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
3. In GitLab → **Settings → CI/CD → Variables**, add:
   - Key: `NPM_TOKEN`
   - Value: the npm token
   - Flags: **Masked**, **Protected** (and available to protected tags)
4. Protect the `v*` tags (or the release workflow you use) so protected
   variables are available on tag pipelines.

## How a version is released

On `main`, after merge:

```bash
git tag v0.4.1
git push origin v0.4.1
```

CI runs `test`, then:

- `publish_npmjs` → `npm publish --access public` to registry.npmjs.org
- `publish_gitlab_package` → mirror to this project's Package Registry

The package `name` in `package.json` must stay **`campus-stats`** (unscoped).
The product brand remains **Campus**; CLI bins are `campus` and `campus-stats`.
Public links on the npm page:

- **homepage:** https://campus-tawny-mu.vercel.app/
- **repository / bugs:** [`marina34/campus-docs`](https://gitlab.com/marina34/campus-docs)
  (not the private source repository)

## Local dry-run

```bash
npm pack
npm publish --dry-run
```

## Checklist

See [`docs/prepublish-checklist.md`](./prepublish-checklist.md).
