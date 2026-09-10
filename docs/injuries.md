# Injuries

Fantasy apps often need availability. **campo-stats** exposes:

- Type `InjuryRecord`
- `listInjuries(cache)` / `CampoClient.injuries()`
- CLI `campo-stats injuries`

Today these always return an **empty** list because StatsBomb Open Data and the
FBref schedule pilot do **not** publish injury feeds.

When a public source is available, an adapter can fill `cache.injuries` without
changing the app-facing API.
