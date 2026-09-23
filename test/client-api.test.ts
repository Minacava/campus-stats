import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CampusClient } from "../src/client.js";
import { emptyCache } from "../src/cache.js";
import {
  DEFAULT_FANTASY_RULES,
  scorePlayerMatchStats,
} from "../src/scoring.js";
import type { CampusCache } from "../src/types.js";

function sampleCache(): CampusCache {
  return {
    ...emptyCache(),
    competitions: [
      {
        id: "statsbomb:comp:182",
        name: "Liga F",
        gender: "female",
        international: false,
        sources: [{ source: "statsbomb", id: "182" }],
      },
    ],
    seasons: [
      {
        id: "statsbomb:season:182:281",
        name: "2023/2024",
        competitionId: "statsbomb:comp:182",
        sources: [{ source: "statsbomb", id: "182:281" }],
      },
    ],
    teams: [
      {
        id: "statsbomb:team:1",
        name: "Barcelona",
        kind: "club",
        sources: [{ source: "statsbomb", id: "1" }],
      },
    ],
    matches: [
      {
        id: "statsbomb:match:9",
        competitionId: "statsbomb:comp:182",
        seasonId: "statsbomb:season:182:281",
        date: "2024-01-01",
        homeTeamId: "statsbomb:team:1",
        awayTeamId: "statsbomb:team:1",
        homeScore: 2,
        awayScore: 0,
        sources: [{ source: "statsbomb", id: "9" }],
      },
    ],
    players: [
      {
        id: "statsbomb:player:7",
        name: "Alexia Putellas",
        sources: [{ source: "statsbomb", id: "7" }],
      },
    ],
    playerMatchStats: [
      {
        id: "statsbomb:pstats:9:7",
        matchId: "statsbomb:match:9",
        playerId: "statsbomb:player:7",
        teamId: "statsbomb:team:1",
        minutes: 90,
        goals: 1,
        assists: 1,
        yellowCards: 0,
        redCards: 0,
        sources: [{ source: "statsbomb", id: "9:7" }],
      },
    ],
    lineups: [
      {
        id: "statsbomb:lineup:9:7",
        matchId: "statsbomb:match:9",
        teamId: "statsbomb:team:1",
        playerId: "statsbomb:player:7",
        started: true,
        jerseyNumber: 11,
        sources: [{ source: "statsbomb", id: "9:7" }],
      },
    ],
  };
}

describe("CampusClient library API", () => {
  it("queries matches, squad, and fantasy points for an app", () => {
    const client = CampusClient.fromCache(sampleCache());
    assert.equal(client.matches({ competition: "Liga F" }).length, 1);
    assert.equal(client.squad({ competition: "Liga F", team: "Barcelona" }).length, 1);
    const points = client.fantasyPoints({ competition: "Liga F" });
    assert.equal(points.length, 1);
    assert.ok(points[0]!.points > 0);
  });

  it("scores with default fantasy rules", () => {
    const row = scorePlayerMatchStats(
      sampleCache().playerMatchStats[0]!,
      DEFAULT_FANTASY_RULES,
    );
    // appearance 1 + goal 4 + assist 3 + fullMatch 1 = 9
    assert.equal(row.points, 9);
  });
});
