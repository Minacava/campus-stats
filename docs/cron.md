# Periodic data refresh (cron)

`campus` does not run a background daemon. Fresh women's football data is
produced on a **schedule** and published as a JSON cache snapshot consumers can
`pull`.

## GitHub Actions schedule (recommended)

1. Open **Actions → Refresh fantasy data** in
   [Minacava/campus-stats](https://github.com/Minacava/campus-stats/actions/workflows/refresh-data.yml).
2. The workflow runs on a schedule (`0 6 * * *`, every day at 06:00 UTC) and can
   also be started manually (**Run workflow**).
3. Each run:
   - builds the CLI
   - runs `campus sync --fantasy`
   - uploads `.campus/cache.json` (+ `meta.json`) to the rolling GitHub Release
     tag **`data-latest`**

Default download URL:

`https://github.com/Minacava/campus-stats/releases/download/data-latest/cache.json`

## Consumer: pull the refreshed bundle

```bash
npx campus pull
# or
npx campus pull --url https://github.com/Minacava/campus-stats/releases/download/data-latest/cache.json
```

This writes/merges into the local `.campus/cache.json` (or `--sqlite`).

## Local cron (optional)

If you prefer to sync on your own machine instead of using the published
bundle:

```cron
0 6 * * * cd /path/to/project && npx campus sync --fantasy >> /var/log/campus.log 2>&1
```

Or refresh only competitions already in your cache:

```cron
0 6 * * * cd /path/to/project && npx campus update >> /var/log/campus.log 2>&1
```
