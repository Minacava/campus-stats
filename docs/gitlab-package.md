# Install campus from GitLab (not npmjs)

This project does **not** publish to the public npm registry. Packages are
hosted on **GitLab Package Registry** for [marina34/campus](https://gitlab.com/marina34/campus).

Project ID: `86296665`

## Option A — npm install from the project registry

```bash
npm install campus \
  --registry=https://gitlab.com/api/v4/projects/86296665/packages/npm/
```

Or add to your project `.npmrc`:

```ini
registry=https://gitlab.com/api/v4/projects/86296665/packages/npm/
```

Then:

```bash
npm install campus
npx campus --help
```

> Packages appear under **Deploy → Package registry** after a version tag
> pipeline runs (`v0.1.0`, …).

## Option B — download the tarball (Generic Package Registry)

After a tagged release, the CI job also uploads:

```text
https://gitlab.com/api/v4/projects/86296665/packages/generic/campus/0.1.0/campus-0.1.0.tgz
```

Install from that URL (public project) or download and install locally:

```bash
npm install https://gitlab.com/api/v4/projects/86296665/packages/generic/campus/0.1.0/campus-0.1.0.tgz
```

## Option C — clone and build

```bash
git clone https://gitlab.com/marina34/campus.git
cd campus
npm install
npm run build
node dist/cli.js --help
```

## How maintainers publish a version

```bash
# on main, after merge
git tag v0.1.0
git push origin v0.1.0
```

CI runs tests, then `publish_gitlab_package` pushes to this project's
Package Registry using `CI_JOB_TOKEN` (no npmjs credentials).

Browse packages: https://gitlab.com/marina34/campus/-/packages
