# Cross-source identity

Types in [`src/identity/types.ts`](../src/identity/types.ts).

## `CanonicalIdentity`

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | `identity:team:…` / future `identity:player:…` |
| `kind` | yes | `team` \| `player` |
| `name` | yes | Canonical display name |
| `aliases` | yes | List (may be empty) |
| `sources` | yes | Linked provider `SourceRef[]` |
| `confidence` | yes | `high` \| `medium` \| `low` |
| `status` | yes | `resolved` \| `pending` \| `rejected` |
| `competitionHint` | no | Competition used when proposing the match |

`Team` / `Match` entities still exist per source; identity is a
reconciliation layer on top and does not replace provenance.

## v0 rules

- Auto-`resolved` only if confidence is `high` and score ≥ 0.95
- Everything else stays `pending` until `identities confirm` / `reject`
- Per-source team queries do not collapse pending identities

## Known limitations

- **Homonyms:** two “United” clubs in different leagues can look alike;
  `competitionHint` reduces risk but does not eliminate false positives.
- **Club renames:** a name change across seasons does not automatically
  inherit the previous identity.
- **Transliterations / accents:** NFD normalization strips marks, but very
  different spellings (e.g. rare abbreviations) may stay `pending`.
- **Players:** out of scope until Epic 03 (optional task deferred).
- **Duplicate competitions:** StatsBomb and FBref create two `Competition`
  rows named “Liga F” with different ids; identity proposals operate on teams
  that share a competition name in cache and do not merge competitions.
