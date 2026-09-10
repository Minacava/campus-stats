# Publishing `campo-stats` to npm

## Prerequisites

1. npm account with rights to publish the unscoped name `campo-stats`
   (or change `package.json` `name` to a scoped package you own).
2. GitLab CI/CD variable **`NPM_TOKEN`** (masked, protected) with an
   automation token that can publish.
3. Merged `main` containing the release commits.

## Steps

```bash
# on main, after merge
git tag v0.1.0
git push origin v0.1.0
```

The `publish` job in [`.gitlab-ci.yml`](../.gitlab-ci.yml) runs on tags
matching `vX.Y.Z`, runs tests, then `npm publish --access public`.

## Manual fallback

```bash
npm run build
npm publish --access public
npx campo-stats --help
```

## Status

Automated publish is wired. A real publish was **not** executed in this
environment because no `NPM_TOKEN` / npm login is available. After the first
publish, verify:

```bash
npx campo-stats@0.1.0 --help
```
