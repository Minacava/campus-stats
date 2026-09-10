import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  aggregateStatsBombPlayerMatch,
  minutesFromPositions,
} from "../src/sources/statsbomb-player-stats.js";
import { StatsBombSource } from "../src/sources/statsbomb.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures", "statsbomb");

describe("player stats aggregation", () => {
  it("computes minutes from position clocks", () => {
    assert.equal(
      minutesFromPositions([{ from: "00:00", to: "69:15" }, { from: "69:15", to: "90:00" }]),
      90,
    );
  });

  it("aggregates goals, assists, and cards from tiny fixtures", async () => {
    const lineups = JSON.parse(
      await readFile(path.join(root, "lineups", "3911515.json"), "utf8"),
    );
    const events = JSON.parse(
      await readFile(path.join(root, "events", "3911515.json"), "utf8"),
    );
    const agg = aggregateStatsBombPlayerMatch("statsbomb:match:3911515", lineups, events);
    assert.ok(agg.players.some((p) => p.name === "Fridolina Rolfo"));
    const rolfo = agg.playerMatchStats.find((s) =>
      s.playerId.endsWith(":2001"),
    );
    const assist = agg.playerMatchStats.find((s) =>
      s.playerId.endsWith(":2002"),
    );
    const ada = agg.playerMatchStats.find((s) => s.playerId.endsWith(":1001"));
    assert.equal(rolfo?.goals, 1);
    assert.equal(assist?.assists, 1);
    assert.equal(ada?.yellowCards, 1);
    assert.equal(ada?.minutes, 90);
    assert.equal(rolfo?.sources[0]?.source, "statsbomb");
  });

  it("StatsBombSource includePlayerStats loads fixture lineups/events", async () => {
    async function fetchJson<T>(url: string): Promise<T> {
      const prefix = "fixture://statsbomb/";
      assert.ok(url.startsWith(prefix), url);
      const rel = url.slice(prefix.length);
      return JSON.parse(await readFile(path.join(root, rel), "utf8")) as T;
    }

    const source = new StatsBombSource({
      baseUrl: "fixture://statsbomb",
      fetchJson,
      includePlayerStats: true,
      playerStatsLimit: 1,
    });

    // Build a minimal sync by calling loadPlayerStatsForMatches directly
    const enriched = await source.loadPlayerStatsForMatches([
      {
        id: "statsbomb:match:3911515",
        competitionId: "statsbomb:comp:182",
        seasonId: "statsbomb:season:182:281",
        homeTeamId: "statsbomb:team:3282",
        awayTeamId: "statsbomb:team:937",
        sources: [{ source: "statsbomb", id: "3911515" }],
      },
    ]);
    assert.ok(enriched.players.length >= 3);
    assert.ok(enriched.playerMatchStats.some((s) => s.goals === 1));
  });
});
