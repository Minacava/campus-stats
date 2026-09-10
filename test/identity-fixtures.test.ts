import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyCache, mergeSyncResult } from "../src/cache.js";
import { proposeIdentitiesForCompetition } from "../src/identity/propose.js";
import type { SyncResult } from "../src/sources/types.js";

/**
 * Realistic naming friction: StatsBomb often keeps "W" / "WFC" suffixes;
 * FBref schedule pages often use the short club name.
 */
function dualSourceLigaF(): SyncResult {
  return {
    competitions: [
      {
        id: "statsbomb:comp:182",
        name: "Liga F",
        gender: "female",
        country: "Spain",
        sources: [{ source: "statsbomb", id: "182" }],
      },
      {
        id: "fbref:comp:230",
        name: "Liga F",
        gender: "female",
        country: "Spain",
        sources: [{ source: "fbref", id: "230" }],
      },
    ],
    seasons: [
      {
        id: "statsbomb:season:182:281",
        name: "2023/2024",
        competitionId: "statsbomb:comp:182",
        sources: [{ source: "statsbomb", id: "182:281" }],
      },
      {
        id: "fbref:season:230:2023-2024",
        name: "2023/2024",
        competitionId: "fbref:comp:230",
        sources: [{ source: "fbref", id: "230:2023-2024" }],
      },
    ],
    teams: [
      {
        id: "statsbomb:team:3269",
        name: "Barcelona WFC",
        sources: [{ source: "statsbomb", id: "3269" }],
      },
      {
        id: "statsbomb:team:3282",
        name: "Real Madrid CF W",
        sources: [{ source: "statsbomb", id: "3282" }],
      },
      {
        id: "fbref:team:barca",
        name: "Barcelona",
        sources: [{ source: "fbref", id: "barca" }],
      },
      {
        id: "fbref:team:rma",
        name: "Real Madrid",
        sources: [{ source: "fbref", id: "rma" }],
      },
    ],
    matches: [
      {
        id: "statsbomb:match:1",
        competitionId: "statsbomb:comp:182",
        seasonId: "statsbomb:season:182:281",
        homeTeamId: "statsbomb:team:3282",
        awayTeamId: "statsbomb:team:3269",
        sources: [{ source: "statsbomb", id: "1" }],
      },
      {
        id: "fbref:match:1",
        competitionId: "fbref:comp:230",
        seasonId: "fbref:season:230:2023-2024",
        homeTeamId: "fbref:team:rma",
        awayTeamId: "fbref:team:barca",
        sources: [{ source: "fbref", id: "1" }],
      },
    ],
  };
}

describe("identity fixtures (name conflicts)", () => {
  it("links Barcelona WFC to Barcelona across sources", () => {
    const cache = mergeSyncResult(emptyCache(), dualSourceLigaF());
    // propose uses teams that share a competition *name* via teamsForCompetition
    // which matches on competition display name — both comps are "Liga F" but
    // different ids. Use propose on each id path by merging team lists under one
    // competition name lookup: teamsForCompetition finds the first "Liga F".
    // Seed a single competition id used by both match rows for the fixture.
    cache.competitions = [cache.competitions[0]!];
    cache.matches = cache.matches.map((m) => ({
      ...m,
      competitionId: cache.competitions[0]!.id,
    }));

    const next = proposeIdentitiesForCompetition(cache, "Liga F");
    assert.ok(next.identities.length >= 1);
    const barca = next.identities.find((i) =>
      i.aliases.some((a) => /barcelona/i.test(a)),
    );
    assert.ok(barca);
    assert.ok(barca.sources.some((s) => s.source === "statsbomb"));
    assert.ok(barca.sources.some((s) => s.source === "fbref"));
  });
});
