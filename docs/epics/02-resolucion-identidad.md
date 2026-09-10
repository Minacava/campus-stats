# Epic 02 — Cross-source identity resolution

## Goal

Unify teams (and, once the model exists, players) that appear under different
IDs in StatsBomb and FBref into one queryable canonical identity.

## Context

Every entity already carries `sources[]` provenance. With two sources, the
same club can appear twice. Resolution leans on fuzzy name + aliases +
context (competition/season) without dropping provenance.

**Dependency:** Epic 01 (≥2 sources to reconcile for real).

## Definition of done

- A canonical identity model exists (internal ID + aliases / source IDs)
- A matching flow produces links or reviewable candidates
- CLI queries can resolve by canonical name without duplicating “obvious” teams
- Ambiguous cases are not merged blindly (confidence / review)

## Tasks

- [x] Design model: canonical ID, aliases, `sources[]` links, confidence level
- [x] Implement team matching (normalized name + competition/season)
- [x] Define rules: auto-merge vs pending review candidate
- [x] Persist resolutions in the cache (or a dedicated table once SQLite exists)
- [x] Expose in CLI: list duplicates / identities and, if applicable, confirm/reject matches
- [x] Fixtures with real conflicts (same club, different names across StatsBomb and FBref)
- [x] Document limitations (homonyms, club renames, transliterations)
- [x] ~~(Optional, if Epic 03 advanced) Extend the same approach to players~~ — deferred until Epic 03

## Definition of done — status

Epic 02 (teams) complete. Players remain after Epic 03.
