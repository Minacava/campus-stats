import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  matchTeamsAcrossSources,
  nameSimilarity,
  normalizeTeamName,
} from "../src/identity/match.js";
import type { Team } from "../src/types.js";

function team(id: string, name: string, source: string, native: string): Team {
  return { id, name, sources: [{ source, id: native }] };
}

describe("team name matching", () => {
  it("normalizes gendered suffixes", () => {
    assert.equal(normalizeTeamName("Barcelona WFC"), "barcelona");
    assert.equal(normalizeTeamName("Chelsea FC Women"), "chelsea");
  });

  it("scores obvious cross-source pairs highly", () => {
    assert.ok(nameSimilarity("Barcelona WFC", "Barcelona") >= 0.9);
    assert.ok(nameSimilarity("Chelsea", "Chelsea Women") >= 0.9);
  });

  it("matches teams across StatsBomb and FBref cohorts", () => {
    const left = [
      team("statsbomb:team:1", "Barcelona WFC", "statsbomb", "1"),
      team("statsbomb:team:2", "Real Madrid CF W", "statsbomb", "2"),
    ];
    const right = [
      team("fbref:team:a", "Barcelona", "fbref", "a"),
      team("fbref:team:b", "Real Madrid", "fbref", "b"),
      team("fbref:team:c", "Unrelated United", "fbref", "c"),
    ];
    const hits = matchTeamsAcrossSources(left, right, {
      competitionHint: "Liga F",
    });
    assert.equal(hits.length, 2);
    assert.ok(hits.every((h) => h.confidence === "high" || h.confidence === "medium"));
    assert.ok(hits.some((h) => h.left.name.includes("Barcelona")));
  });
});
