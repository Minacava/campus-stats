# Periodic data refresh (cron)

`campus` does not run a background daemon. Fresh women's football data is
produced on a **schedule** and published as a JSON cache snapshot consumers can
`pull`.

## GitLab CI schedule (recommended)

1. Open **Build → Pipeline schedules** in
   [marina34/campus](https://gitlab.com/marina34/campus/-/pipeline_schedules).
2. Create a schedule on branch `main`, for example:
   - **Interval (cron):** `0 6 * * *` (every day at 06:00 UTC)
   - **Target:** `main`
   - **Active:** yes
3. The scheduled pipeline runs `refresh_fantasy_data`, which:
   - builds the CLI
   - runs `campus sync --fantasy`
   - uploads `.campus/cache.json` (+ `meta.json`) to the Generic Package
     Registry as `campus-data/latest/`

You can also trigger the same job manually (**Build → Pipelines → Run pipeline**
with source `web`; the job is `manual` for web pipelines).

## Consumer: pull the refreshed bundle

```bash
npx campus pull
# or
npx campus pull --url https://gitlab.com/api/v4/projects/86296665/packages/generic/campus-data/latest/cache.json
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
