# Optional: GitLab Package Registry mirror

Primary distribution is **npmjs.com** (`npm install campus-stats`).  
This project also mirrors the same package to the **GitLab Package Registry**.

Packages: https://gitlab.com/marina34/campus/-/packages  
Project ID: `86296665`

## Install from GitLab (optional)

```bash
npm install campus-stats \
  --registry=https://gitlab.com/api/v4/projects/86296665/packages/npm/
```

Or with a project `.npmrc`:

```ini
registry=https://gitlab.com/api/v4/projects/86296665/packages/npm/
```

### If you get 401 Unauthorized

Enable **Allow anyone to pull from Package Registry** under  
**Settings → General → Visibility**, or set the project to **Public**.

With a private registry, add a GitLab token:

```ini
registry=https://gitlab.com/api/v4/projects/86296665/packages/npm/
//gitlab.com/api/v4/projects/86296665/packages/npm/:_authToken=YOUR_GITLAB_TOKEN
```

## Generic tarball

```bash
npm install \
  https://gitlab.com/api/v4/projects/86296665/packages/generic/campus-stats/0.4.0/campus-stats-0.4.0.tgz
```

## How maintainers publish

Tagging `vX.Y.Z` runs both `publish_npmjs` and `publish_gitlab_package`.  
See [`docs/npm.md`](./npm.md).
