# Contributing adapters

Adapters are the easiest way into `campus`: implement `FootballSource`,
normalize into the existing schema, open an MR.

## Checklist

1. **Interface** — implement [`FootballSource`](../src/sources/types.ts)
   (`id` + `syncCompetition(name)` → `SyncResult`).
2. **Normalize** — map every record to
   [`Competition` / `Season` / `Team` / `Match`](./schema.md). Do not leak
   provider field names into the CLI or cache.
3. **Provenance** — set `sources: [{ source: "<your-id>", id: "..." }]` on
   every entity.
4. **Stable ids** — use [`entityId`](../src/ids.ts) (or equivalent) so merges
   upsert cleanly across syncs.
5. **Women's football only** — filter upstream data so men's competitions
   never enter the cache.
6. **Terms / limits** — document at the **top of the adapter file**:
   license/terms of the source, required credit, API keys, rate limits.
   Mirror a short note in the README “Data source & terms” section.
7. **Offline tests** — add fixtures under `test/fixtures/<source>/` and cover
   sync + cache merge without hitting the network.
8. **Register** — export from `src/sources/index.ts` (and wire into the CLI
   when multi-source selection lands; until then document how to invoke it).
9. **No secrets** — never commit API keys; read from env and document the
   variable name in the adapter header.

## Reference implementation

See [`src/sources/statsbomb.ts`](../src/sources/statsbomb.ts).
