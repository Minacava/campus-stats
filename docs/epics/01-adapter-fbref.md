# Epic 01 — FBref adapter (second source)

## Goal

Add FBref as a second public origin, normalized to the same schema as
StatsBomb, without changing CLI or cache logic beyond registering the new
source.

## Context

FBref offers broader league coverage but is usually scraped HTML (not a clean
JSON API). It needs rate-limiting, robust parsing, and clear terms-of-use
docs. The adapter lives under `src/sources/` and implements `FootballSource`.

## Definition of done

- An FBref adapter returns canonical `Competition` / `Season` / `Team` / `Match`
- `sync` can target FBref (flag or competition detection) without breaking StatsBomb
- Rate limits and network/parse errors are handled and documented
- At least one real women's competition syncs end-to-end

## Tasks

- [x] Choose FBref women's pilot competitions (e.g. WSL / Liga F) and document URLs/HTML structure
- [x] Design HTTP client with rate-limit, retries, and a responsible User-Agent
- [x] Implement parser → canonical entities (do not leak raw FBref field names to the CLI)
- [x] Register provenance `sources: [{ source: "fbref", id }]`
- [x] Integrate the adapter into the source registry and `sync` (without breaking StatsBomb)
- [x] Tests with offline HTML/JSON fixtures (no network in CI)
- [x] Document in the adapter and README: limits, terms, how to run FBref sync
- [x] Verify cache merge: StatsBomb sync + FBref sync coexist in the same `cache.json`

## Definition of done — status

Epic 01 tasks complete. Live FBref may fail behind Cloudflare; CI uses
fixtures (`test/fbref-source.test.ts` covers sync + merge with StatsBomb).
